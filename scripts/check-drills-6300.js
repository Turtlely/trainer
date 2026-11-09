// Tests js/drills-6300.js (6.3000 Signal Processing drills).
// 1. Every drill type over 200 seeds: no exceptions, answers evaluate, balanced $, grid shapes, and
//    every matching answer is a label that appears in the problem's figures.
// 2. Independent checks: Fourier series coefficients by numerical integration, DT frequency
//    responses by direct sums over h[n], circular convolution through an actual DFT product.
// 3. The system-properties table: each system is implemented here and tested numerically for
//    additivity, homogeneity, and time invariance.
// Run: node scripts/check-drills-6300.js
const path = require("path");
for (const f of ["expr.js", "fig.js", "drills-6300.js"]) require(path.join(__dirname, "..", "js", f));
const D = globalThis.Drills6300, Expr = globalThis.Expr, FIGS = globalThis.FIGS;
let fails = 0;
const val = (s) => Expr.evaluate(String(s));
const report = (name, bad, n) => { if (bad) fails++; console.log(bad ? `FAIL ${name} (${bad}${n ? "/" + n : ""})` : `ok   ${name}`); };

// ---- 1. shape
for (const type of Object.keys(D.DRILLS)) {
  let bad = 0;
  for (let seed = 1; seed <= 200; seed++) {
    try {
      const p = D.generate(type, seed);
      const texts = [p.statement, p.solution, ...p.parts.map((q) => q.q)];
      if (/undefined|NaN|\[object/.test(texts.join("\n") + p.title)) throw new Error("bad text");
      for (const t of texts) if ((t.replace(/\\\$/g, "").match(/\$/g) || []).length % 2) throw new Error("unbalanced $: " + t.slice(0, 90));
      for (const q of p.parts) {
        if (q.accept) { if (!q.accept.length) throw new Error("empty accept"); continue; }
        for (const a of q.anyOf || [q.answer]) if (!Number.isFinite(val(a))) throw new Error(`answer ${a} not finite`);
      }
      if (!p.parts.length && !p.grids.length) throw new Error("nothing to answer");
      const figs = (p.statement.match(/@fig (\S+)/g) || []).map((m) => FIGS[m.slice(5)] || "").join("");
      for (const g of p.grids) {
        if (g.answer.length !== g.rowLabels.length || g.answer.some((r) => r.length !== g.colLabels.length)) throw new Error("grid shape");
        if (g.kind === "text" && /match|DFT|Fourier/i.test(p.title) && !/System/.test(p.title)) {
          for (const r of g.answer) for (const lab of r) if (!figs.includes(`>${lab}</text>`)) throw new Error(`label ${lab} not in figures`);
        }
        if (g.kind === "value") for (const r of g.answer) for (const v of r) if (v !== "" && !Number.isFinite(val(v))) throw new Error("grid value " + v);
      }
    } catch (e) { if (bad++ < 3) console.log(`FAIL ${type} seed ${seed}: ${e.message}`); }
  }
  report(type, bad, 200);
}

// ---- 2a. Fourier series by numerical integration
{
  let bad = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const p = D.generate("s_ctfs", seed), { T, f } = p._ct, M = 200000;
    const a = (k) => { let re = 0, im = 0; for (let i = 0; i < M; i++) { const t = ((i + 0.5) * T) / M, v = f(t); re += v * Math.cos((2 * Math.PI * k * t) / T); im -= v * Math.sin((2 * Math.PI * k * t) / T); } return [re / M, im / M]; };
    const want = p.parts.map((q) => val(q.answer));
    const got = [0, 1, 2, 3].flatMap((k) => a(k));
    const a1 = a(1); got.push(2 * a1[0], -2 * a1[1]);
    got.forEach((g, i) => { if (Math.abs(g - want[i]) > 2e-4) { if (bad++ < 4) console.log(`FAIL ctfs seed ${seed} part ${i + 1}: numeric ${g.toFixed(6)}, answer ${want[i]}`); } });
  }
  report("CT Fourier series vs numerical integration", bad);
}

// ---- 2b. DT frequency response by direct sums
{
  let bad = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const p = D.generate("s_freqresp", seed), { hn, W0 } = p._h;
    const H = (W) => { let re = 0, im = 0; for (let n = 0; n < 600; n++) { re += hn(n) * Math.cos(W * n); im -= hn(n) * Math.sin(W * n); } return [re, im]; };
    const h0 = H(0), hp = H(Math.PI), hw = H(W0), mag = Math.hypot(...hw);
    const want = p.parts.map((q) => (q.anyOf ? q.anyOf.map(val) : [val(q.answer)]));
    const got = [h0[0], hp[0], mag, Math.atan2(hw[1], hw[0]), hw[0], -hw[1]];
    got.forEach((g, i) => {
      const ok = want[i].some((w) => Math.abs(g - w) < 1e-6 || (i === 3 && (mag < 1e-9 || Math.abs(Math.abs(g) - Math.PI) < 1e-6 && Math.abs(Math.abs(w) - Math.PI) < 1e-6)));
      if (!ok && bad++ < 4) console.log(`FAIL freqresp seed ${seed} part ${i + 1}: direct ${g}, answer ${want[i]}`);
    });
  }
  report("DT frequency response vs direct sums", bad);
}

// ---- 2c. circular convolution through a DFT product (1/N analysis convention)
{
  let bad = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const p = D.generate("s_circconv", seed), { f, N } = p._cc;
    const x = Array.from({ length: N }, (_, n) => f(n)), X = D._dft(x);
    const G = X.map((c) => ({ re: c.re * c.re - c.im * c.im, im: 2 * c.re * c.im }));
    const g = Array.from({ length: N }, (_, n) => G.reduce((s, c, k) => s + c.re * Math.cos((2 * Math.PI * k * n) / N) - c.im * Math.sin((2 * Math.PI * k * n) / N), 0));
    p.grids[0].answer[0].forEach((v, n) => { if (Math.abs(val(v) - g[n]) > 1e-9) { if (bad++ < 4) console.log(`FAIL circconv seed ${seed} n=${n}: DFT product ${g[n]}, answer ${v}`); } });
  }
  report("circular convolution vs DFT product", bad);
}

// ---- 3. system properties, tested numerically
{
  // Each system maps an input function x(t) (t real; DT systems use integer t) to an output function.
  const integ = (x) => (t) => { let s = 0; const h = 0.01; for (let u = -40; u < t; u += h) s += x(u + h / 2) * h; return s; };
  const IMPL = {
    "y[n]=x[n-2]": (x) => (n) => x(n - 2), "y[n]=n\\,x[n]": (x) => (n) => n * x(n), "y[n]=x[n]^2": (x) => (n) => x(n) ** 2,
    "y[n]=x[n]+1": (x) => (n) => x(n) + 1, "y[n]=x[-n]": (x) => (n) => x(-n), "y[n]=x[2n]": (x) => (n) => x(2 * n), "y[n]=\\sin(x[n])": (x) => (n) => Math.sin(x(n)),
    "y[n]=(1/2)^n\\,x[n]": (x) => (n) => 0.5 ** n * x(n), "y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,d\\tau": integ, "y(t)=t\\,x(t)": (x) => (t) => t * x(t),
    "y(t)=x(t)\\cos(5t)": (x) => (t) => x(t) * Math.cos(5 * t), "y[n]=\\max(x[n],x[n-1])": (x) => (n) => Math.max(x(n), x(n - 1)), "y[n]=|x[n]|": (x) => (n) => Math.abs(x(n)),
    "y[n]=x[n]\\,x[n-1]": (x) => (n) => x(n) * x(n - 1), "y[n]=x[n]+x[n-1]+x[n-2]": (x) => (n) => x(n) + x(n - 1) + x(n - 2), "y[n]=x[n]-x[n-1]": (x) => (n) => x(n) - x(n - 1),
    "y(t)=x(2t)": (x) => (t) => x(2 * t), "y(t)=\\frac{d}{dt}x(t)": (x) => (t) => (x(t + 1e-5) - x(t - 1e-5)) / 2e-5, "y[n]=3": () => () => 3,
    "y[n]=x[n]\\text{ for even }n,\\ 0\\text{ for odd }n": (x) => (n) => (Math.abs(n) % 2 ? 0 : x(n)), "y[n]=x[0]": (x) => () => x(0), "y[n]=x[n]^3": (x) => (n) => x(n) ** 3,
    "y[n]=\\sum_{k=-\\infty}^{n}x[k]": (x) => (n) => { let s = 0; for (let k = -60; k <= n; k++) s += x(k); return s; },
    "y[n]=x[n]\\,u[n]": (x) => (n) => (n >= 0 ? x(n) : 0),
    "y[n]=\\frac{1}{2}y[n-1]+x[n]\\ \\text{(initially at rest)}": (x) => (n) => { let y = 0; for (let k = -60; k <= n; k++) y = 0.5 * y + x(k); return y; },
    "y[n]=x[n+1]": (x) => (n) => x(n + 1),
  };
  // Test inputs vanish outside |t| < 15, so the accumulators and integrals start at rest.
  const sig = (a, b, c) => (t) => Math.exp(-((t - a) ** 2) / 8) * (b + Math.sin(c * t)) * (Math.abs(t) < 15);
  const x1 = sig(-2, 0.7, 1.3), x2 = sig(3, -0.4, 0.6);
  const ts = [-6, -5, -3, -1, 0, 1, 2, 4, 5, 7];
  const close = (u, v) => Math.abs(u - v) < 1e-4 * Math.max(1, Math.abs(u), Math.abs(v));
  let bad = 0;
  for (const [tex, add, hom, ti] of D._systems) {
    const S = IMPL[tex];
    if (!S) { bad++; console.log("FAIL no implementation for " + tex); continue; }
    const y1 = S(x1), y2 = S(x2), ys = S((t) => x1(t) + x2(t)), yc = S((t) => -2.5 * x1(t)), d = 3, yd = S((t) => x1(t - d));
    const isAdd = ts.every((t) => close(ys(t), y1(t) + y2(t))), isHom = ts.every((t) => close(yc(t), -2.5 * y1(t))), isTI = ts.every((t) => close(yd(t), y1(t - d)));
    if (isAdd !== !!add || isHom !== !!hom || isTI !== !!ti) { bad++; console.log(`FAIL ${tex}: table says ${add}${hom}${ti}, numeric says ${+isAdd}${+isHom}${+isTI}`); }
  }
  report(`system properties (${D._systems.length} systems)`, bad);
}
process.exit(fails ? 1 : 0);
