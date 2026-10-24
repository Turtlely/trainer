// Validates the problem bank: unique ids, required fields, and answers that evaluate.
// Run: node scripts/check.js
const path = require("path");
const root = path.join(__dirname, "..", "js");
require(path.join(root, "expr.js"));
require(path.join(root, "problems-1.js"));
require(path.join(root, "problems-2.js"));
require(path.join(root, "problems-3.js"));

const { Expr, PROBLEMS } = globalThis;
let errors = 0;
const fail = (msg) => { errors++; console.error("ERROR:", msg); };

const ids = new Set();
for (const p of PROBLEMS) {
  if (ids.has(p.id)) fail(`duplicate id ${p.id}`);
  ids.add(p.id);
  for (const k of ["title", "diff", "topics", "answer", "statement", "hints", "solution"]) {
    if (p[k] === undefined) fail(`#${p.id} missing ${k}`);
  }
  if (!["Easy", "Medium", "Hard"].includes(p.diff)) fail(`#${p.id} bad diff ${p.diff}`);
  try { p.value = Expr.evaluate(p.answer); } catch (e) { fail(`#${p.id} answer "${p.answer}": ${e.message}`); }
  const dollars = (p.statement + p.solution + p.hints.join("")).split("$$").join("").split("$").length - 1;
  if (dollars % 2) fail(`#${p.id} has unbalanced $ delimiters`);
}

const cases = [["3/8", 0.375], ["1-(5/6)^4", 671 / 1296], ["2pi", 2 * Math.PI], ["sqrt(2)/2", Math.SQRT1_2],
  ["1/e", 1 / Math.E], ["C(52,5)", 2598960], ["5!", 120], ["50%", 0.5], ["-2^2", -4], ["2^-1", 0.5], ["1e3", 1000]];
for (const [s, v] of cases) {
  const got = Expr.evaluate(s);
  if (Math.abs(got - v) > 1e-9 * Math.max(1, Math.abs(v))) fail(`parser: ${s} = ${got}, want ${v}`);
}

const by = { Easy: 0, Medium: 0, Hard: 0 };
PROBLEMS.forEach((p) => by[p.diff]++);
console.log(`${PROBLEMS.length} problems`, by);
if (process.argv.includes("--list")) PROBLEMS.forEach((p) => console.log(p.id, p.answer, "=", p.value));
process.exit(errors ? 1 : 0);
