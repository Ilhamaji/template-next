#!/usr/bin/env node
/**
 * sync-hermes.cjs — Membuat bridge .hermes/skills/ -> .agents/skills/
 *
 * Hermes Agent TIDAK membaca .agents/skills/. Ia scan .hermes/skills/ (project lokal).
 * Script ini membuat satu file pointer SKILL.md tipis per skill, berisi frontmatter
 * asli (agar Hermes bisa mengindeks) + instruksi membaca isi sebenarnya.
 *
 * Kenapa pointer, bukan symlink/copy?
 *  - symlink butuh Administrator di Windows
 *  - junction hanya jalan di Windows (merusak portabilitas repo)
 *  - copy penuh = duplikasi 6 MB, cepat menyimpang dari sumber
 *  - pointer = file teks kecil, aman di semua OS, sumber tetap satu
 *
 * Pemakaian: node scripts/sync-hermes.cjs [--check]
 *   --check  : jangan tulis apa pun; exit 1 kalau bridge tidak sinkron
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC = path.join(ROOT, ".agents", "skills");
const DST = path.join(ROOT, ".hermes", "skills");
const CHECK_ONLY = process.argv.includes("--check");

const C = process.stdout.isTTY
  ? { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", d: "\x1b[2m", b: "\x1b[1m", x: "\x1b[0m" }
  : { r: "", g: "", y: "", d: "", b: "", x: "" };

/** Ambil frontmatter YAML mentah (tanpa ---) dan body dari sebuah SKILL.md. */
function splitSkill(file) {
  let raw = fs.readFileSync(file, "utf8");
  // Toleransi BOM (UTF-8 BOM sering ditambahkan PowerShell/Windows). Tanpa ini,
  // file yang secara visual benar akan ditolak karena `---` tidak di posisi 0.
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  return { frontmatter: m[1].trim(), body: m[2].trim() };
}

function relativeSkillPath(name) {
  // Dari .hermes/skills/<name>/SKILL.md ke .agents/skills/<name>/SKILL.md
  return `../../.agents/skills/${name}/SKILL.md`;
}

function buildPointer(name, frontmatter) {
  const rel = relativeSkillPath(name);
  // Beberapa upstream mendeklarasikan `allowed-tools` dengan path lama (.agent/skills/…).
  // Di mesin ini foldernya .agents/skills/…, jadi path itu akan gagal. Perbaiki agar benar.
  const fixedFm = frontmatter
    .replace(/\.agent\/skills\//g, ".agents/skills/")
    .replace(/\.claude\/skills\//g, ".agents/skills/");

  return `---
${fixedFm}
---

<!--
  BRIDGE FILE — jangan diedit manual.
  Dibuat oleh scripts/sync-hermes.cjs dari .agents/skills/${name}/SKILL.md
  Edit sumber aslinya, lalu jalankan: npm run sync:hermes
-->

# ${name} (pointer)

Isi sebenarnya dari skill ini ada di:

\`\`\`
${rel}
\`\`\`

**Baca file itu sekarang** dan ikuti instruksinya. Skill ini punya sub-folder
(\`references/\`, \`scripts/\`, \`assets/\`) yang harus dibaca relatif terhadap
lokasi file tersebut — **bukan** relatif terhadap folder pointer ini.

Contoh: jika sumber menunjuk \`references/foo.md\`, buka
\`.agents/skills/${name}/references/foo.md\`.

Jangan menyalin isi skill ke file ini. Sumber tunggal adalah \`.agents/skills/${name}/\`.
`;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`${C.r}.agents/skills/ tidak ditemukan${C.x}`);
    process.exit(2);
  }

  const skills = fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const actions = { created: [], updated: [], unchanged: [], removed: [], failed: [] };

  if (!CHECK_ONLY) fs.mkdirSync(DST, { recursive: true });

  // Hapus pointer usang (skill sudah tidak ada di sumber)
  if (!CHECK_ONLY && fs.existsSync(DST)) {
    for (const d of fs.readdirSync(DST, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      if (!skills.includes(d.name)) {
        fs.rmSync(path.join(DST, d.name), { recursive: true, force: true });
        actions.removed.push(d.name);
      }
    }
  }

  for (const name of skills) {
    const src = path.join(SRC, name, "SKILL.md");
    if (!fs.existsSync(src)) {
      actions.failed.push(`${name}: sumber SKILL.md tidak ada`);
      continue;
    }
    const parts = splitSkill(src);
    if (!parts) {
      actions.failed.push(`${name}: frontmatter tidak valid`);
      continue;
    }

    const targetDir = path.join(DST, name);
    const targetFile = path.join(targetDir, "SKILL.md");
    const content = buildPointer(name, parts.frontmatter);
    const existed = fs.existsSync(targetFile);

    if (existed) {
      const current = fs.readFileSync(targetFile, "utf8");
      if (current === content) {
        actions.unchanged.push(name);
        continue;
      }
    }

    if (CHECK_ONLY) {
      actions[existed ? "updated" : "created"].push(name);
      continue;
    }

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, content, "utf8");
    actions[existed ? "updated" : "created"].push(name);
  }

  // Ringkasan
  const drift = actions.created.length + actions.updated.length + actions.removed.length;
  console.log(`\n${C.b}Hermes bridge${C.x} ${C.d}(.hermes/skills/ -> .agents/skills/)${C.x}`);
  console.log(`  skill sumber: ${skills.length}`);
  if (actions.created.length) console.log(`  ${C.g}baru${C.x}       : ${actions.created.join(", ")}`);
  if (actions.updated.length) console.log(`  ${C.y}diperbarui${C.x} : ${actions.updated.join(", ")}`);
  if (actions.removed.length) console.log(`  ${C.y}dihapus${C.x}    : ${actions.removed.join(", ")}`);
  if (actions.unchanged.length) console.log(`  ${C.d}tidak berubah: ${actions.unchanged.length}${C.x}`);
  for (const f of actions.failed) console.log(`  ${C.r}✗ ${f}${C.x}`);

  if (actions.failed.length > 0) process.exit(1);

  if (CHECK_ONLY) {
    if (drift > 0) {
      console.log(`\n${C.r}✗ Bridge tidak sinkron (${drift} selisih).${C.x} Jalankan: npm run sync:hermes\n`);
      process.exit(1);
    }
    console.log(`\n${C.g}✓ Bridge sinkron.${C.x}\n`);
    process.exit(0);
  }

  console.log(`\n${C.g}✓ Selesai.${C.x} ${drift} perubahan.\n`);
  process.exit(0);
}

main();
