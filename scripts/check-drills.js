// Tests the generated drills (js/drills-6191.js): the cache simulator against Fall 2025 Quiz 2
// Problem 4, and every drill type over many seeds (no exceptions, answers present, valid markup).
// Run: node scripts/check-drills.js
const path = require("path");
for (const f of ["expr.js", "sim-6191.js", "fig.js", "drills-6191.js"]) require(path.join(__dirname, "..", "js", f));
const { makeCache } = globalThis.Sim6191;
const D = globalThis.Drills6191;
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log("FAIL", msg); } };

// Fall 2025 Q2 P4: unified DM cache, 16 words, 4-word blocks. Mem[a] = (a - 0x200) / 4.
{
  const c = makeCache({ words: 16, block: 4, ways: 1 });
  const run = D._runProgram(["lw x2, 0x228(x0)", "sb x2, 0x237(x0)", "sh x2, 0x238(x0)", "lw x3, 0x274(x0)", "unimp"], 0x1000,
    (a) => (a >= 0x200 && a < 0x300 ? (a - 0x200) / 4 : 0), { u: c });
  const hx = (v) => (v && v.ins ? v.ins : "0x" + (v >>> 0).toString(16).toUpperCase());
  const L = c.S.map((w) => w[0]);
  ok(L[0].tag === 0x40 && L[0].data.every((x) => x && x.ins), "fa25 p4 idx0");
  ok(L[2].tag === 0x8 && L[2].data.map(hx).join() === "0x8,0x9,0xA,0xB", "fa25 p4 idx2 " + L[2].data.map(hx));
  ok(L[3].tag === 0x9 && L[3].data.map(hx).join() === "0x1C,0x1D,0x1E,0x1F", "fa25 p4 idx3 " + L[3].data.map(hx));
  const wb = c.stats.writebacks.map((x) => `${hx(x.addr)}=${hx(x.value)}`).join(" ");
  ok(wb === "0x230=0xC 0x234=0xA00000D 0x238=0xA 0x23C=0xF", "fa25 p4 writebacks " + wb);
  ok(run.stats.ihit === 3 && run.stats.ifetch === 4, "fa25 p4 I hits " + run.stats.ihit);
  ok(run.stats.dhit === 1 && run.stats.dacc === 4, "fa25 p4 D hits " + run.stats.dhit);
  ok(run.regs[2] === 0xa && run.regs[3] === 0x1d, "fa25 p4 regs " + run.regs[2] + " " + run.regs[3]);
  console.log(fails ? "FAIL fa25 p4" : "ok   fa25 p4 cache trace");
}

// Every drill over many seeds.
for (const type of Object.keys(D.DRILLS)) {
  let bad = 0;
  for (let seed = 1; seed <= 150; seed++) {
    try {
      const p = D.generate(type, seed);
      const s = p.statement + p.solution;
      if (/undefined|NaN|\[object/.test(s)) throw new Error("bad text: " + (s.match(/.{0,40}(undefined|NaN|\[object).{0,20}/) || [])[0]);
      if ((s.replace(/\\\$/g, "").match(/\$/g) || []).length % 2) throw new Error("unbalanced $");
      if (!p.grids.length && !p.parts.length) throw new Error("no answers");
      for (const g of p.grids) {
        if (g.answer.length !== g.rowLabels.length) throw new Error("grid rows");
        for (const r of g.answer) if (r.length !== g.colLabels.length) throw new Error("grid cols");
      }
      for (const q of p.parts) {
        if (q.answer !== undefined && !Number.isFinite(globalThis.Expr.evaluate(q.answer))) throw new Error("part not numeric: " + q.q + " = " + q.answer);
        if (q.answer === undefined && !(q.accept && q.accept.length)) throw new Error("part without answer: " + q.q);
      }
    } catch (e) { if (bad++ < 3) console.log(`FAIL ${type} seed ${seed}: ${e.message}`); }
  }
  if (bad) fails++;
  console.log(bad ? `FAIL ${type} (${bad}/150)` : `ok   ${type}`);
}
process.exit(fails ? 1 : 0);
