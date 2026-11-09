// Tests the redrawn figures of the official 6.3000 problems (js/problems-6300-real.js).
// For each matching problem, this script computes the transform or convolution of every listed
// signal on its own (numerical integration, direct DFT sums, fine-grid convolution), finds the
// panel that matches it, and checks that the panel letter is the official answer.
// Run: node scripts/check-real-6300.js
const path = require("path");
for (const f of ["expr.js", "fig.js", "drills-6300.js", "problems-6300-real.js"]) require(path.join(__dirname, "..", "js", f));
const DATA = globalThis.Real6300Data, PROBLEMS = globalThis.PROBLEMS, FIGS = globalThis.FIGS;
const PI = Math.PI;
let fails = 0;
const report = (name, bad) => { if (bad) fails++; console.log(bad ? `FAIL ${name}: ${bad}` : `ok   ${name}`); };
const byId = (id) => PROBLEMS.find((p) => p.id === id);
const keyOf = (id) => byId(id).parts.filter((q) => q.accept).map((q) => q.answer);
const normv = (ys) => { const m = Math.max(1e-12, ...ys.map(Math.abs)); return ys.map((v) => v / m); };
const dist = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
// The panel whose data is closest to ys; also returns the error and the runner-up error.
function best(panels, ys) {
  const r = Object.entries(panels).map(([L, p]) => [L, dist(p, ys)]).sort((x, y) => x[1] - y[1]);
  return { L: r[0][0], err: r[0][1], next: r[1] ? r[1][1] : Infinity };
}
function match(name, panels, signals, key, tol) {
  const bad = [];
  signals.forEach((ys, i) => {
    const b = best(panels, ys);
    if (b.L !== key[i] || b.err > tol || b.next < 2 * tol) bad.push(`#${i}: got ${b.L} (err ${b.err.toFixed(3)}, next ${b.next.toFixed(3)}), key ${key[i]}`);
  });
  report(name, bad.join("; "));
}
const dft = (x) => { const N = x.length; return x.map((_, k) => { let re = 0, im = 0; for (let n = 0; n < N; n++) { re += x[n] * Math.cos((2 * PI * k * n) / N); im -= x[n] * Math.sin((2 * PI * k * n) / N); } return { re: re / N, im: im / N }; }); };
const abs = (c) => Math.hypot(c.re, c.im);

// ---- every @fig in the 6.3000 official problems exists
{
  const bad = [];
  for (const p of PROBLEMS) for (const m of `${p.statement}\n${p.solution}`.matchAll(/^@fig (.+)$/gm)) if (!FIGS[m[1]]) bad.push(`#${p.id} ${m[1]}`);
  const noFig = PROBLEMS.filter((p) => /hand-drawn|work this one from the PDF/i.test(p.statement)).map((p) => p.id);
  report("figures exist; no problem points to the PDF for its plots", bad.concat(noFig.map((i) => `#${i} still refers to the PDF`)).join(", "));
}

// ---- 3503: |FT| of the nine derived signals by numerical integration
{
  const d = DATA[3503];
  const dt = 0.001, ts = []; for (let v = -4 + dt / 2; v < 4; v += dt) ts.push(v);
  const f = (t) => +(Math.abs(t) < 1);
  const sigs = [
    [(t) => f(t / 2), 0], [(t) => Math.max(0, 2 - Math.abs(t)), 0], [(t) => f(2 * t), 0], [(t) => f(t - 1), 0], [(t) => t * f(t), 0],
    [(t) => f(t) * Math.sin(2 * PI * t), 0], [(t) => f(t) * Math.cos(2 * PI * t), 0], [(t) => f(t) * Math.cos(2 * PI * t), (t) => f(t) * Math.sin(2 * PI * t)],
    [(t) => f(t) * Math.cos(2 * PI * t), (t) => -f(t) * Math.sin(2 * PI * t)],
  ];
  const mags = sigs.map(([xr, xi]) => {
    const vr = ts.map(xr), vi = ts.map((t) => (xi ? xi(t) : 0));
    return normv(d.xs.map((w) => {
      let re = 0, im = 0;
      ts.forEach((t, i) => { const c = Math.cos(w * t), s = Math.sin(w * t); re += vr[i] * c + vi[i] * s; im += vi[i] * c - vr[i] * s; });
      return Math.hypot(re, im) * dt;
    }));
  });
  match("3503 transform matching (Spring 2025 P3)", d.panels, mags, keyOf(3503), 0.03);
}

// ---- 3504: which systems cannot be LTI, from the DFT zero sets
{
  const X = [1, 2, 3, 4].map((L) => dft(Array.from({ length: 12 }, (_, n) => +(n < L))).map(abs));
  const rows = X.map((Xi, i) => { const out = []; X.forEach((Xo, o) => { if (Xo.some((v, k) => v > 1e-9 && Xi[k] < 1e-9)) out.push(o + 1); }); return out.length ? out.join(" ") : "none"; });
  const key = keyOf(3504);
  report("3504 LTI rows (Spring 2025 P4)", rows.every((r, i) => r === key[i]) ? "" : `got ${rows.join(" | ")}, key ${key.join(" | ")}`);
}

// ---- 3514: convolution with the pulse train on a finer grid
{
  const d = DATA[3514];
  const ramp = (a, b, va, vb) => (x) => (x >= a && x < b ? va + ((vb - va) * (x - a)) / (b - a) : 0);
  const fs = [
    (x) => ramp(0, 0.5, 0, 1)(x), (x) => ramp(0, 0.5, 0, 1)(x) + ramp(0.5, 1, 0, 1)(x), (x) => ramp(0, 0.5, 0, 1)(x) + ramp(1, 1.5, 0, 1)(x),
    (x) => ramp(0.5, 1, 1, 0)(x), (x) => ramp(0, 0.5, 0, 1)(x) + ramp(0.5, 1, 1, 0)(x), (x) => ramp(0, 0.5, 1, 0)(x) + ramp(1, 1.5, 0, 1)(x),
    (x) => (x >= 0 ? Math.exp(-3 * x) : 0), (x) => (x < 0 ? Math.exp(3 * x) : 0),
  ];
  const g = (x) => +(Math.sin(2 * PI * x) >= 0);
  const dt = 0.002, taus = []; for (let v = -5 + dt / 2; v < 5; v += dt) taus.push(v);
  const outs = fs.map((f) => { const fv = taus.map(f); return d.ts.map((t) => { let s = 0; taus.forEach((v, i) => { if (fv[i]) s += fv[i] * g(t - v); }); return s * dt; }); });
  const P = Object.fromEntries(Object.entries(d.panels).map(([L, ys]) => [L, normv(ys)]));
  match("3514 pulse-train convolutions (Fall 2023 P4)", P, outs.map(normv), keyOf(3514), 0.03);
}

// ---- 3523: 32-point DFT magnitudes
{
  const x0 = (n) => Math.cos((9 * PI * n) / 32);
  const sigs = [x0, (n) => Math.cos((9 * PI * n) / 16), (n) => Math.cos((9 * PI * n) / 26), (n) => Math.cos((9 * PI * n) / 36), (n) => Math.cos((2 * PI * n) / 5),
    (n) => Math.abs(x0(n)), (n) => x0(n) ** 2, (n) => x0(n) ** 3];
  const mags = sigs.map((s) => normv(dft(Array.from({ length: 32 }, (_, n) => s(n))).map(abs)));
  match("3523 DFTs of sinusoids (Fall 2022 P3)", DATA[3523].panels, mags, keyOf(3523), 1e-6);
}

// ---- 3524: DFT magnitude and angle of the five derived signals
{
  const d = DATA[3524], f = d.f, N = 30;
  const md = (a) => ((a % N) + N) % N;
  const gs = [f.map((_, n) => f[md(-n)]), f.map((_, n) => f[md(n - 1)]), f.map((_, n) => f[md(n + 1)]), f.map((v) => v * v), f.map((_, n) => (n % 2 ? 0 : f[n / 2]))];
  const key = keyOf(3524), bad = [];
  gs.forEach((g, i) => {
    const X = dft(g), m = X.map(abs), mx = Math.max(...m);
    const bm = best(d.mag, normv(m));
    if (bm.L !== key[2 * i] || bm.err > 1e-6) bad.push(`g${i + 1} magnitude ${bm.L} vs ${key[2 * i]}`);
    // Angles: compare modulo 2π where the magnitude is not negligible.
    const angErr = (p) => Math.max(...X.map((c, k) => { if (m[k] < 1e-6 * mx) return 0; const e = Math.atan2(c.im, c.re) - p[k]; return Math.abs(Math.atan2(Math.sin(e), Math.cos(e))); }));
    const r = Object.entries(d.ang).map(([L, p]) => [L, angErr(p)]).sort((a, b) => a[1] - b[1]);
    if (r[0][0] !== key[2 * i + 1] || r[0][1] > 1e-6 || r[1][1] < 0.05) bad.push(`g${i + 1} angle ${r[0][0]} (${r[0][1].toFixed(3)}, next ${r[1][0]} ${r[1][1].toFixed(3)}) vs ${key[2 * i + 1]}`);
  });
  report("3524 related DFTs (Fall 2022 P4)", bad.join("; "));
}

// ---- 3532: which g's are convolutions of two of f0, f1, f2
{
  const d = DATA[3532];
  const box = (a, b, v = 1) => (x) => (x > a && x < b ? v : 0);
  const f = [(x) => box(-1, 0, -1)(x) + box(0, 1)(x), box(-1, 1), (x) => box(-1, -0.5)(x) + box(0.5, 1)(x)];
  const dt = 0.0005, taus = []; for (let v = -1.5 + dt / 2; v < 1.5; v += dt) taus.push(v);
  const cv = (a, b) => { const av = taus.map(a); return d.ts.map((t) => { let s = 0; taus.forEach((v, i) => { if (av[i]) s += av[i] * b(t - v); }); return s * dt; }); };
  const pairs = [];
  for (let i = 0; i < 3; i++) for (let j = i; j < 3; j++) pairs.push([`f${i}*f${j}`, cv(f[i], f[j])]);
  const got = d.panels.map((ys) => { const hit = pairs.find(([, c]) => dist(c, ys) < 0.02); return hit ? hit[0] : "X"; });
  const key = keyOf(3532);
  report("3532 convolving steps (Spring 2022 P3)", got.every((g, i) => g === key[i]) ? "" : `got ${got.join(", ")}, key ${key.join(", ")}`);
}

// ---- 3534: real parts of 12-point DFTs
{
  const d = DATA[3534];
  const re = d.sigs.map((s) => normv(dft(Array.from({ length: 12 }, (_, n) => s(n))).map((c) => (Math.abs(c.re) < 1e-12 ? 0 : c.re))));
  match("3534 DFT matching (Spring 2022 P5)", d.panels, re, keyOf(3534), 1e-6);
}

if (fails) { console.log(`${fails} check(s) failed`); process.exit(1); }
console.log("all official-problem figure checks passed");
