/**
 * Behavior check for cn() — no test runner needed.
 * Run: npm run check:cn
 *
 * Imports the TypeScript source directly; Node strips the types.
 */
import assert from "node:assert/strict";
import { cn } from "../lib/utils.ts";

const cases = [
  ["conflict: last px wins", cn("px-2 py-1", "px-4"), "py-1 px-4"],
  ["conflict: last bg wins", cn("bg-red-500", "bg-blue-500"), "bg-blue-500"],
  ["non-conflicting classes combine", cn("flex", "gap-2"), "flex gap-2"],
  ["falsy values dropped", cn("flex", false, null, undefined, "gap-2"), "flex gap-2"],
  ["object conditional", cn({ "font-bold": true, italic: false }), "font-bold"],
  ["nested arrays", cn(["px-2", ["py-2"]], "m-1"), "px-2 py-2 m-1"],
  ["caller overrides default", cn("rounded-full px-4", "px-2"), "rounded-full px-2"],
  ["different variants do not collide", cn("hover:bg-red", "bg-blue"), "hover:bg-red bg-blue"],
  ["empty className", cn("flex", ""), "flex"],
];

let failed = 0;
for (const [name, actual, expected] of cases) {
  try {
    assert.equal(actual, expected);
    console.log(`OK   ${name}  -> "${actual}"`);
  } catch {
    failed++;
    console.log(`FAIL ${name}\n     got:      "${actual}"\n     expected: "${expected}"`);
  }
}

console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed > 0 ? 1 : 0);
