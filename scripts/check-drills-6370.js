// Tests js/drills-6370.js.
// 1. Every drill type over 200 seeds: no exceptions, answers evaluate to finite numbers, balanced $.
// 2. Monte Carlo: for drills with a _mc model, sample the model and compare means, variances,
//    covariances, and conditional moments with the exact answers (within 5 standard errors).
// 3. Joint PDFs: numeric integration of the density checks c, f_Y(1/2), and E[X | Y = 1/2].
// Run: node scripts/check-drills-6370.js
const path = require("path");
for (const f of ["expr.js", "drills-6370.js"]) require(path.join(__dirname, "..", "js", f));
const D = globalThis.Drills6370, Expr = globalThis.Expr;
let fails = 0;
const val = (s) => Expr.evaluate(String(s));

// ---- 1. shape and text
for (const type of Object.keys(D.DRILLS)) {
  let bad = 0;
  for (let seed = 1; seed <= 200; seed++) {
    try {
      const p = D.generate(type, seed);
      const text = [p.title, p.statement, p.solution, ...p.parts.map((q) => q.q)].join("\n");
      if (/undefined|NaN|\[object/.test(text)) throw new Error("bad text");
      for (const chunk of [p.statement, p.solution, ...p.parts.map((q) => q.q)]) {
        if ((chunk.replace(/\\\$/g, "").match(/\$/g) || []).length % 2) throw new Error("unbalanced $ in: " + chunk.slice(0, 80));
      }
      if (!p.parts.length) throw new Error("no parts");
      for (const q of p.parts) {
        if (q.accept) { if (!q.accept.length) throw new Error("empty accept"); continue; }
        const v = val(q.answer);
        if (!Number.isFinite(v)) throw new Error(`answer ${q.answer} is not finite`);
      }
    } catch (e) { if (bad++ < 3) console.log(`FAIL ${type} seed ${seed}: ${e.message}`); }
  }
  if (bad) fails++;
  console.log(bad ? `FAIL ${type} (${bad}/200)` : `ok   ${type}`);
}

// ---- 2. Monte Carlo
let state = 12345;
const u = () => { state = (state + 0x6d2b79f5) >>> 0; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const H = {
  u, unif: (a, b) => a + (b - a) * u(), exp: (l) => -Math.log(1 - u()) / l, die: (k) => 1 + Math.floor(u() * k),
  norm: () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u()),
  bin: (n, p) => { let s = 0; for (let i = 0; i < n; i++) s += u() < p; return s; },
  geom: (p) => { let k = 1; while (u() >= p) k++; return k; },
  pois: (m) => { const L = Math.exp(-m); let k = 0, p = u(); while (p > L) { k++; p *= u(); } return k; },
  perm: (n) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
function stat(spec, rows) {
  const [kind, a, b] = spec;
  const pick = (k, rs) => rs.map((r) => r[k]);
  // The 1/n floor covers samples that are all equal (a rare outcome never seen).
  if (kind === "mean") { const x = pick(a, rows), m = mean(x), sd = Math.sqrt(mean(x.map((v) => (v - m) ** 2))); return [m, Math.max(sd / Math.sqrt(x.length), 1 / x.length)]; }
  if (kind === "var") {
    const x = pick(a, rows), m = mean(x), c2 = x.map((v) => (v - m) ** 2), v2 = mean(c2), m4 = mean(c2.map((v) => v * v));
    return [v2, Math.sqrt(Math.max(m4 - v2 * v2, 0) / x.length)];
  }
  if (kind === "cov" || kind === "corr") {
    const x = pick(a, rows), y = pick(b, rows), mx = mean(x), my = mean(y), pr = x.map((v, i) => (v - mx) * (y[i] - my)), c = mean(pr);
    const se = Math.sqrt(mean(pr.map((v) => (v - c) ** 2)) / x.length);
    if (kind === "cov") return [c, se];
    const sx = Math.sqrt(mean(x.map((v) => (v - mx) ** 2))), sy = Math.sqrt(mean(y.map((v) => (v - my) ** 2)));
    return [c / (sx * sy), se / (sx * sy)];
  }
  const sub = rows.filter((r) => r[b]);
  return stat([kind === "cmean" ? "mean" : "var", a], sub);
}
{
  let bad = 0, checked = 0;
  const N = 120000;
  for (const type of Object.keys(D.DRILLS)) {
    for (let seed = 1; seed <= 30; seed++) {
      const p = D.generate(type, seed);
      if (!p._mc) continue;
      const rows = Array.from({ length: N }, () => p._mc.sample(H));
      p._mc.parts.forEach((spec, i) => {
        if (!spec) return;
        const want = val(p.parts[i].answer), [got, se] = stat(spec, rows);
        checked++;
        if (Math.abs(got - want) > 5 * se + 1e-9 + 0.002 * Math.abs(want)) {
          if (bad++ < 8) console.log(`FAIL MC ${type} seed ${seed} "${p.title}" part ${i + 1}: exact ${want.toFixed(5)}, simulated ${got.toFixed(5)} ± ${se.toFixed(5)}`);
        }
      });
    }
  }
  if (bad) fails++;
  console.log(bad ? `FAIL Monte Carlo (${bad} of ${checked})` : `ok   Monte Carlo (${checked} answers)`);
}

// ---- 3. joint PDF numeric integration
{
  let bad = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const p = D.generate("p_jointpdf", seed), { f, tri } = p._dens, n = 600;
    let Z = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = (i + 0.5) / n, y = (j + 0.5) / n; if (!tri || y <= x) Z += f(x, y) / (n * n); }
    const c = 1 / Z, m = 20000, y0 = 0.5, lo = tri ? y0 : 0;
    let s0 = 0, s1 = 0;
    for (let i = 0; i < m; i++) { const x = lo + (1 - lo) * (i + 0.5) / m; s0 += f(x, y0) * (1 - lo) / m; s1 += x * f(x, y0) * (1 - lo) / m; }
    // f_Y(1/2) uses the exact c, so only the 1D integral is tested there.
    const want = [val(p.parts[0].answer), val(p.parts[4].answer), val(p.parts[5].answer)], got = [c, want[0] * s0, s1 / s0];
    const tol = [5e-3, 1e-4, 1e-4]; // the 2D grid is coarse on the triangle edge
    got.forEach((g, i) => { if (Math.abs(g - want[i]) > tol[i] * Math.max(1, Math.abs(want[i]))) { if (bad++ < 5) console.log(`FAIL jointpdf seed ${seed} item ${i}: exact ${want[i]}, numeric ${g}`); } });
  }
  if (bad) fails++;
  console.log(bad ? `FAIL joint PDF integration (${bad})` : "ok   joint PDF integration");
}
process.exit(fails ? 1 : 0);
