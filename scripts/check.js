// Validates the problem bank: unique ids, required fields, and answers that evaluate.
// Run: node scripts/check.js
const path = require("path");
const root = path.join(__dirname, "..", "js");
require(path.join(root, "expr.js"));
require(path.join(root, "problems-1.js"));
require(path.join(root, "problems-2.js"));
require(path.join(root, "problems-3.js"));
const presetLec = new Map();
require(path.join(root, "problems-4.js"));
require(path.join(root, "problems-5.js"));
require(path.join(root, "problems-6.js"));
require(path.join(root, "problems-6191-1.js"));
require(path.join(root, "problems-6191-2.js"));
require(path.join(root, "problems-6191-3.js"));
require(path.join(root, "problems-6191-4.js"));
globalThis.PROBLEMS.forEach((p) => { if (p.lec !== undefined) presetLec.set(p.id, p.lec); });
require(path.join(root, "course.js"));
require(path.join(root, "course-6191.js"));

const { Expr, PROBLEMS, COURSES, courseOf } = globalThis;
let errors = 0;
const fail = (msg) => { errors++; console.error("ERROR:", msg); };

// Course mapping: every mapped id exists, appears once, and does not override a preset lecture.
const seen = new Map();
const allIds = new Set(PROBLEMS.map((p) => p.id));
for (const [lec, list] of Object.entries(COURSES["6.3700"].MAP)) {
  for (const id of list) {
    if (!allIds.has(id)) fail(`course map: lecture ${lec} lists unknown id ${id}`);
    if (seen.has(id)) fail(`course map: id ${id} in lectures ${seen.get(id)} and ${lec}`);
    if (presetLec.has(id)) fail(`course map: id ${id} already has lec ${presetLec.get(id)}`);
    seen.set(id, lec);
  }
}
for (const p of PROBLEMS) {
  const c = COURSES[courseOf(p)];
  if (!c) { fail(`#${p.id} has unknown course ${p.course}`); continue; }
  if (p.lec !== undefined && !c.lecture(p.lec)) fail(`#${p.id} has unknown ${c.code} lecture ${p.lec}`);
  if (p.tol !== undefined && !(p.tol === 0 || (p.tol > 0 && p.tol < 0.1))) fail(`#${p.id} has bad tol ${p.tol}`);
}

// Code blocks (~~~) and inline code ([[...]]) are not typeset, so their "$" signs do not count.
const mathText = (s) => s.replace(/(^|\n)~~~[\s\S]*?\n~~~/g, "").replace(/\[\[.+?\]\](?!\])/g, "");

const ids = new Set();
for (const p of PROBLEMS) {
  if (ids.has(p.id)) fail(`duplicate id ${p.id}`);
  ids.add(p.id);
  for (const k of ["title", "diff", "topics", "answer", "statement", "hints", "solution"]) {
    if (p[k] === undefined) fail(`#${p.id} missing ${k}`);
  }
  if (!["Easy", "Medium", "Hard"].includes(p.diff)) fail(`#${p.id} bad diff ${p.diff}`);
  try { p.value = Expr.evaluate(p.answer); } catch (e) { fail(`#${p.id} answer "${p.answer}": ${e.message}`); }
  for (const part of [p.statement, p.solution, ...p.hints]) {
    if ((mathText(part).split("$$").join("").split("$").length - 1) % 2) fail(`#${p.id} has unbalanced $ delimiters`);
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(part)) fail(`#${p.id} has a control character (unescaped backslash?)`);
  }
}

const cases = [["3/8", 0.375], ["1-(5/6)^4", 671 / 1296], ["2pi", 2 * Math.PI], ["sqrt(2)/2", Math.SQRT1_2],
  ["1/e", 1 / Math.E], ["C(52,5)", 2598960], ["5!", 120], ["50%", 0.5], ["-2^2", -4], ["2^-1", 0.5], ["1e3", 1000],
  ["0x1F", 31], ["0xFFFFFFFF", 4294967295], ["0b1011", 11], ["0x10 + 0b11", 19], ["2*0x8", 16]];
for (const [s, v] of cases) {
  const got = Expr.evaluate(s);
  if (Math.abs(got - v) > 1e-9 * Math.max(1, Math.abs(v))) fail(`parser: ${s} = ${got}, want ${v}`);
}
if (Expr.compare(0x88766450, 0x88766452, 0) !== "wrong") fail("exact compare accepted a near miss");

for (const code of Object.keys(COURSES)) {
  const list = PROBLEMS.filter((p) => courseOf(p) === code);
  const by = { Easy: 0, Medium: 0, Hard: 0 };
  list.forEach((p) => by[p.diff]++);
  const perLec = {};
  list.forEach((p) => { const k = p.lec || "extra"; perLec[k] = (perLec[k] || 0) + 1; });
  console.log(`${code}: ${list.length} problems`, by);
  console.log("  per lecture", perLec);
}
if (process.argv.includes("--list")) PROBLEMS.forEach((p) => console.log(p.id, p.answer, "=", p.value));
process.exit(errors ? 1 : 0);
