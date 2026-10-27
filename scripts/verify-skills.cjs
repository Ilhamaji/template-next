#!/usr/bin/env node
/**
 * verify-skills.cjs — Verifikasi integritas skill di .agents/skills/
 *
 * Fungsi utama: mendeteksi install yang TERPOTONG (folder ada, file tidak lengkap).
 * Bug ini tidak terlihat dari frontmatter — skill tetap "terdaftar" tapi tidak bisa dipakai.
 *
 * Pemakaian:
 *   node scripts/verify-skills.cjs            # cek semua skill yang punya sumber GitHub
 *   node scripts/verify-skills.cjs --offline  # tanpa jaringan (hanya cek lokal)
 *   node scripts/verify-skills.cjs --json     # keluaran mesin
 *
 * Exit code: 0 = semua sehat, 1 = ada masalah, 2 = error konfigurasi
 */

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.join(process.cwd(), ".agents", "skills");
const SOURCES_FILE = path.join(process.cwd(), ".agents", "skill-sources.json");

/**
 * Sumber upstream tiap skill: repo + folder skill di dalam repo.
 * `local` = folder tujuan di .agents/skills/ (default: nama skill).
 * Skill tanpa entri di sini hanya diperiksa secara lokal (tanpa pembanding upstream).
 */
const DEFAULT_SOURCES = {
  antislop: { repo: "miqdadbadjuber/anti-slop", dir: "skills/antislop" },
  "antislop-code": { repo: "miqdadbadjuber/anti-slop", dir: "skills/antislop-code" },
  "antislop-copywriting": { repo: "miqdadbadjuber/anti-slop", dir: "skills/antislop-copywriting" },
  "antislop-human": { repo: "miqdadbadjuber/anti-slop", dir: "skills/antislop-human" },
  "antislop-layoutmobile": { repo: "miqdadbadjuber/anti-slop", dir: "skills/antislop-layoutmobile" },
  "antislop-ui": { repo: "miqdadbadjuber/anti-slop", dir: "skills/antislop-ui" },
  "frontend-design": { repo: "anthropics/skills", dir: "skills/frontend-design" },
  impeccable: { repo: "pbakaus/impeccable", dir: ".agent/skills/impeccable" },
  "design-taste-frontend": { repo: "Leonxlnx/taste-skill", dir: "skills/taste-skill" },
  "ui-ux-pro-max": { repo: "nextlevelbuilder/ui-ux-pro-max-skill", dir: ".claude/skills/ui-ux-pro-max" },
  "web-design-guidelines": { repo: "vercel-labs/agent-skills", dir: "skills/web-design-guidelines" },
  "security-audit": { repo: "cloudflare/security-audit-skill", dir: "skills/security-audit" },
};

/** File yang memang dibuat saat runtime (tidak dikirim upstream). Jangan dilaporkan sebagai hilang. */
const RUNTIME_FILES = new Set(["assets/credits.json", "library/scenes.json"]);

const args = new Set(process.argv.slice(2));
const OPT = {
  offline: args.has("--offline"),
  json: args.has("--json"),
  fix: args.has("--fix"),
};

const C = process.stdout.isTTY
  ? { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", d: "\x1b[2m", b: "\x1b[1m", x: "\x1b[0m" }
  : { r: "", g: "", y: "", d: "", b: "", x: "" };

// ─────────────────────────────────────────────────────────────
// Utilitas
// ─────────────────────────────────────────────────────────────

function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out;
}

function loadSources() {
  let custom = {};
  if (fs.existsSync(SOURCES_FILE)) {
    try {
      custom = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf8"));
    } catch (e) {
      console.error(`${C.r}skill-sources.json tidak valid:${C.x} ${e.message}`);
      process.exit(2);
    }
  }
  return { ...DEFAULT_SOURCES, ...custom };
}

async function fetchTree(repo) {
  // GitHub membatasi 60 request/jam tanpa token. Pakai GITHUB_TOKEN bila tersedia.
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = { "User-Agent": "verify-skills", Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let lastErr;
  for (const branch of ["main", "master"]) {
    const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
    try {
      const res = await fetch(url, { headers });
      if (res.status === 404) continue;
      if (res.status === 403 || res.status === 429) {
        const remaining = res.headers.get("x-ratelimit-remaining");
        const reset = res.headers.get("x-ratelimit-reset");
        const mins = reset ? Math.max(1, Math.ceil((Number(reset) * 1000 - Date.now()) / 60000)) : "?";
        const e = new Error(
          `rate limit GitHub (sisa ${remaining ?? "?"}, reset ~${mins} menit). ` +
            `Set GITHUB_TOKEN untuk kuota lebih besar, atau jalankan dengan --offline.`
        );
        e.code = "RATE_LIMIT";
        throw e;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.tree) continue;
      return json.tree.filter((t) => t.type === "blob").map((t) => ({ path: t.path, size: t.size }));
    } catch (e) {
      if (e.code === "RATE_LIMIT") throw e; // jangan coba branch lain
      lastErr = e;
    }
  }
  throw lastErr || new Error(`repo tidak ditemukan: ${repo}`);
}

function checkFrontmatter(skillDir, folderName) {
  const p = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(p)) return { ok: false, errors: ["SKILL.md tidak ada"] };
  let raw = fs.readFileSync(p, "utf8");
  // Toleransi BOM UTF-8 (sering ditambahkan PowerShell di Windows).
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  if (!raw.startsWith("---")) return { ok: false, errors: ["frontmatter tidak diawali ---"] };
  const fm = raw.split(/\r?\n---/, 1)[0];
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1];
  // description bisa multiline (YAML block) — ambil sampai field berikutnya atau akhir
  const desc = (fm.match(/^description:\s*([\s\S]+?)(?=\n[a-z-]+:|\s*$)/m) || [])[1];

  const errors = [];
  const warnings = [];

  // ── Aturan dari spec agentskills.io ──
  if (!name) {
    errors.push("field `name` wajib ada");
  } else {
    const n = name.trim().replace(/^["']|["']$/g, "");
    if (n.length === 0 || n.length > 64) errors.push(`name harus 1-64 karakter (sekarang ${n.length})`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n))
      errors.push(`name "${n}" harus lowercase, hanya huruf/angka/hyphen, tanpa hyphen di awal/akhir`);
    if (folderName && n !== folderName) warnings.push(`name "${n}" != nama folder "${folderName}"`);
  }

  if (!desc || desc.trim().length === 0) {
    errors.push("field `description` wajib ada dan tidak boleh kosong");
  } else {
    const d = desc.trim();
    if (d.length > 1024) errors.push(`description maksimal 1024 karakter (sekarang ${d.length})`);
  }

  // Field opsional yang sah (spec) — peringatkan kalau ada typo nama field.
  // Hanya periksa baris top-level (tanpa indentasi), karena `metadata:` berisi key bebas.
  const KNOWN = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
  for (const line of fm.split(/\r?\n/)) {
    if (/^\s/.test(line)) continue; // nested / lanjutan — bukan field top-level
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*):/);
    if (m && !KNOWN.has(m[1])) warnings.push(`field frontmatter tidak dikenal spec: "${m[1]}"`);
  }

  if (errors.length) return { ok: false, errors, warnings };
  return { ok: true, name: name.trim().replace(/^["']|["']$/g, ""), warnings };
}

function checkBrokenImports(skillDir) {
  const scriptsDir = path.join(skillDir, "scripts");
  if (!fs.existsSync(scriptsDir)) return { checked: 0, broken: [] };
  const broken = [];
  let checked = 0;
  for (const rel of walk(scriptsDir)) {
    if (!/\.(mjs|js|cjs)$/.test(rel)) continue;
    const file = path.join(scriptsDir, rel);
    let txt;
    try {
      txt = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const m of txt.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      const target = path.resolve(path.dirname(file), m[1]);
      const cands = [target, target + ".mjs", target + ".js", target + ".cjs", path.join(target, "index.mjs")];
      checked++;
      if (!cands.some((c) => fs.existsSync(c))) broken.push(`${rel} -> ${m[1]}`);
    }
  }
  return { checked, broken };
}

// ─────────────────────────────────────────────────────────────
// Pemeriksaan per skill
// ─────────────────────────────────────────────────────────────

async function checkSkill(name, sources, treeCache) {
  const dir = path.join(SKILLS_DIR, name);
  const result = { name, problems: [], warnings: [], info: {} };

  if (!fs.existsSync(dir)) {
    result.problems.push("folder skill tidak ada");
    return result;
  }

  const localFiles = walk(dir);
  result.info.files = localFiles.length;
  result.info.bytes = localFiles.reduce((s, f) => s + (fs.statSync(path.join(dir, f)).size || 0), 0);

  // 1. Folder kosong / tidak ada file sama sekali — gejala utama install terpotong
  if (localFiles.length === 0) {
    result.problems.push("FOLDER KOSONG — install terpotong (hapus lalu install ulang)");
    return result;
  }

  // 2. Frontmatter — divalidasi terhadap spec agentskills.io
  const fm = checkFrontmatter(dir, name);
  if (!fm.ok) {
    for (const e of fm.errors) result.problems.push(`frontmatter: ${e}`);
  } else if (fm.warnings) {
    for (const w of fm.warnings) result.warnings.push(w);
  }

  // 3. Import internal rusak
  const imp = checkBrokenImports(dir);
  result.info.imports = imp.checked;
  for (const b of imp.broken) result.problems.push(`import rusak: ${b}`);

  // 4. Bandingkan dengan upstream
  const src = sources[name];
  if (!src) {
    result.warnings.push("tidak ada sumber upstream terdaftar — dilewati pembandingan");
    return result;
  }
  if (OPT.offline) {
    result.warnings.push("mode offline — pembandingan upstream dilewati");
    return result;
  }

  try {
    if (!treeCache.has(src.repo)) treeCache.set(src.repo, await fetchTree(src.repo));
    const tree = treeCache.get(src.repo);
    const prefix = src.dir.replace(/\/$/, "") + "/";
    const upstream = tree
      .filter((t) => t.path.startsWith(prefix))
      .map((t) => ({ rel: t.path.slice(prefix.length), size: t.size }))
      .filter((t) => t.rel.length > 0);

    if (upstream.length === 0) {
      result.warnings.push(`folder upstream "${src.dir}" kosong/tidak ditemukan di ${src.repo}`);
      return result;
    }

    const localSet = new Set(localFiles);
    const missing = upstream.filter((t) => !localSet.has(t.rel) && !RUNTIME_FILES.has(t.rel));
    result.info.upstream = upstream.length;
    result.info.missing = missing.length;

    // File besar yang hilang lebih mencurigakan daripada file kecil
    const big = missing.filter((m) => (m.size || 0) > 1024);
    if (missing.length > 0) {
      const detail = missing
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 6)
        .map((m) => `${m.rel} (${m.size ?? "?"}b)`)
        .join(", ");
      const more = missing.length > 6 ? ` … +${missing.length - 6}` : "";
      result.problems.push(
        `install TIDAK LENGKAP: ${localFiles.length}/${upstream.length} file — hilang ${missing.length}: ${detail}${more}`
      );
      if (big.length > 0) result.warnings.push(`${big.length} file besar hilang → fitur kemungkinan tidak jalan`);
    }
  } catch (e) {
    if (e.code === "RATE_LIMIT") {
      result.rateLimited = true;
      result.warnings.push(e.message);
    } else {
      result.warnings.push(`gagal cek upstream: ${e.message}`);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

/** Pointer file yang seharusnya ada agar semua tool menemukan AGENTS.md. */
const POINTER_FILES = {
  "CLAUDE.md": "Claude Code",
  "GEMINI.md": "Gemini CLI",
  ".github/copilot-instructions.md": "GitHub Copilot",
  ".cursor/rules/agents.mdc": "Cursor",
  ".windsurfrules": "Windsurf",
};

/**
 * Bridge Hermes: .hermes/skills/ berisi pointer ke .agents/skills/.
 * Hermes tidak membaca .agents/skills/, jadi bridge ini yang membuat skill terlihat.
 */
function checkHermesBridge() {
  const src = path.join(process.cwd(), ".agents", "skills");
  const dst = path.join(process.cwd(), ".hermes", "skills");
  const result = { ok: true, synced: 0, missing: [], stale: [] };
  if (!fs.existsSync(src)) return result;

  const skills = fs
    .readdirSync(src, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (!fs.existsSync(dst)) {
    result.ok = false;
    result.missing = skills.slice(0, 5);
    result.missingAll = skills.length;
    return result;
  }

  for (const name of skills) {
    const p = path.join(dst, name, "SKILL.md");
    if (!fs.existsSync(p)) {
      result.missing.push(name);
      continue;
    }
    const txt = fs.readFileSync(p, "utf8");
    // Pointer harus menunjuk sumber sebenarnya, bukan menyalin isinya
    if (!txt.includes(`../../.agents/skills/${name}/SKILL.md`)) result.stale.push(name);
    else result.synced++;
  }

  if (result.missing.length || result.stale.length) result.ok = false;
  return result;
}

function checkPortability() {
  const result = { present: [], missing: [], badPointer: [] };
  const agentsPath = path.join(process.cwd(), "AGENTS.md");
  if (!fs.existsSync(agentsPath)) result.missing.push("AGENTS.md (source of truth!)");

  for (const [file, tool] of Object.entries(POINTER_FILES)) {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) {
      result.missing.push(`${file} (${tool})`);
      continue;
    }
    result.present.push(file);
    // Pointer harus merujuk AGENTS.md, bukan menyalin isinya
    const txt = fs.readFileSync(p, "utf8");
    if (!/AGENTS\.md/.test(txt)) result.badPointer.push(`${file} tidak merujuk AGENTS.md`);
  }
  return result;
}

async function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`${C.r}.agents/skills/ tidak ditemukan. Jalankan dari root proyek.${C.x}`);
    process.exit(2);
  }

  const sources = loadSources();
  const skills = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const treeCache = new Map();
  const results = [];
  for (const name of skills) results.push(await checkSkill(name, sources, treeCache));

  if (OPT.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`\n${C.b}Verifikasi ${results.length} skill di .agents/skills/${C.x}\n`);
    for (const r of results) {
      const bad = r.problems.length > 0;
      const icon = bad ? `${C.r}FAIL${C.x}` : r.warnings.length ? `${C.y}WARN${C.x}` : `${C.g} OK ${C.x}`;
      const meta = [];
      if (r.info.files != null) meta.push(`${r.info.files} file`);
      if (r.info.upstream != null && r.info.files != null)
        meta.push(`upstream ${r.info.upstream}`);
      console.log(`${icon} ${C.b}${r.name}${C.x} ${C.d}${meta.join(" · ")}${C.x}`);
      for (const p of r.problems) console.log(`      ${C.r}✗${C.x} ${p}`);
      for (const w of r.warnings) console.log(`      ${C.y}!${C.x} ${C.d}${w}${C.x}`);
    }
  }

  const failed = results.filter((r) => r.problems.length > 0);

  // Portabilitas: semua tool harus bisa menemukan AGENTS.md
  const port = checkPortability();
  const hermes = checkHermesBridge();
  if (!OPT.json) {
    console.log(`${C.b}Portabilitas${C.x} ${C.d}(pointer file per tool)${C.x}`);
    console.log(`  ${C.g}${port.present.length} pointer ada${C.x}${port.present.length ? C.d + " — " + port.present.join(", ") + C.x : ""}`);
    for (const m of port.missing) console.log(`  ${C.r}✗ hilang: ${m}${C.x}`);
    for (const b of port.badPointer) console.log(`  ${C.r}✗ ${b}${C.x}`);

    const total = hermes.synced + hermes.missing.length + hermes.stale.length;
    if (hermes.ok) {
      console.log(`  ${C.g}Hermes bridge: ${hermes.synced}/${total} sinkron${C.x}`);
    } else {
      console.log(`  ${C.r}✗ Hermes bridge belum sinkron${C.x} ${C.d}(.hermes/skills/)${C.x}`);
      if (hermes.missing.length) console.log(`    ${C.r}hilang: ${hermes.missing.join(", ")}${C.x}`);
      if (hermes.stale.length) console.log(`    ${C.y}pointer salah: ${hermes.stale.join(", ")}${C.x}`);
      console.log(`    ${C.d}Perbaikan: npm run sync:hermes${C.x}`);
    }
    console.log("");
  }

  if (!OPT.json) {
    if (failed.length === 0) {
      console.log(`${C.g}✓ Semua ${results.length} skill sehat.${C.x}\n`);
    } else {
      console.log(`${C.r}✗ ${failed.length}/${results.length} skill bermasalah:${C.x} ${failed.map((f) => f.name).join(", ")}`);
      console.log(`${C.d}Perbaikan: hapus folder bermasalah lalu install ulang, atau`);
      console.log(`  git clone --depth 1 <repo> && salin folder skill secara manual.${C.x}\n`);
    }
  }

  const portOk = port.missing.length === 0 && port.badPointer.length === 0 && hermes.ok;
  const rateLimited = results.filter((r) => r.rateLimited).length;

  if (!OPT.json && rateLimited > 0) {
    console.log(
      `${C.y}! ${rateLimited} skill tidak bisa dibandingkan dengan upstream (rate limit GitHub).${C.x}\n` +
        `${C.d}  Ini BUKAN masalah skill — file lokal tetap diperiksa (folder kosong, import, frontmatter).${C.x}\n` +
        `${C.d}  Set GITHUB_TOKEN untuk kuota lebih besar, atau pakai --offline.${C.x}\n`
    );
  }

  // Rate limit bukan kegagalan skill — jangan exit 1 karenanya.
  process.exit(failed.length > 0 || !portOk ? 1 : 0);
}

main().catch((e) => {
  console.error(`${C.r}Fatal: ${e.message}${C.x}`);
  process.exit(2);
});
