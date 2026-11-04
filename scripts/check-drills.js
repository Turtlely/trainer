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
// Register placement: each solution placement of the pipelining drill must grade as valid with
// its own stage count and period. No registers must fail, and one register less on an output must
// fail or give one stage less.
{
  let bad = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const pl = D.generate("kstage", seed).place;
    for (const g of pl.targets) {
      const r = D.evalPlacement(pl, g.regs);
      if (!r.ok || r.K !== g.K || r.P !== g.P) { if (bad++ < 3) console.log(`FAIL placement seed ${seed} ${g.label}:`, r, g.K, g.P); }
      const o = `${Object.keys(g.regs).find((e) => e.endsWith(">" + pl.outs[0]))}`;
      const less = { ...g.regs, [o]: g.regs[o] - 1 };
      const r2 = D.evalPlacement(pl, less);
      if (r2.ok && r2.K !== g.K - 1) { if (bad++ < 3) console.log(`FAIL placement seed ${seed}: one register less gives`, r2); }
    }
    if (D.evalPlacement(pl, {}).ok) bad++;
  }
  if (bad) fails++;
  console.log(bad ? `FAIL register placement (${bad})` : "ok   register placement");
}
// The pipelining figures must have no crossing edges and no edge through a box (box 50 x 30).
{
  let bad = 0;
  const cross = (p, q, r, s) => {
    const d = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    return d(p, q, r) * d(p, q, s) < 0 && d(r, s, p) * d(r, s, q) < 0;
  };
  for (let seed = 1; seed <= 500; seed++) {
    const pl = D.generate("kstage", seed).place;
    const E = pl.drawEdges.map((e) => {
      const [a, b, o = {}] = typeof e === "string" ? e.split(">") : e;
      return { a, b, p: [pl.gn[a], ...(o.via || []), pl.gn[b]].map(([x, y]) => [x, y]) };
    });
    let err = "";
    for (let i = 0; i < E.length && !err; i++) {
      for (let j = i + 1; j < E.length && !err; j++) {
        const [e, f] = [E[i], E[j]];
        if (e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue;
        for (let s = 0; s + 1 < e.p.length; s++) for (let t = 0; t + 1 < f.p.length; t++)
          if (cross(e.p[s], e.p[s + 1], f.p[t], f.p[t + 1])) err = `edges ${e.a}>${e.b} and ${f.a}>${f.b} cross`;
      }
      for (const [id, [cx, cy]] of Object.entries(pl.gn)) {
        if (id[0] === "@" || id === E[i].a || id === E[i].b) continue;
        const p = E[i].p;
        for (let s = 0; s + 1 < p.length; s++) for (let k = 0; k <= 100; k++) {
          const x = p[s][0] + (p[s + 1][0] - p[s][0]) * k / 100, y = p[s][1] + (p[s + 1][1] - p[s][1]) * k / 100;
          if (Math.abs(x - cx) < 27 && Math.abs(y - cy) < 17) err = `edge ${E[i].a}>${E[i].b} goes through ${id}`;
        }
      }
    }
    if (err && bad++ < 3) console.log(`FAIL figure seed ${seed}: ${err}`);
  }
  if (bad) fails++;
  console.log(bad ? `FAIL pipelining figures (${bad})` : "ok   pipelining figures have no crossings");
}
process.exit(fails ? 1 : 0);
