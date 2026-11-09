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
    "y[n]=(-2)^n\\big(x[n]-1\\big)": (x) => (n) => (-2) ** n * (x(n) - 1), "y[n]=e^{x[n]}": (x) => (n) => Math.exp(x(n)), "y[n]=(-1)^n\\,x[n]": (x) => (n) => Math.cos(Math.PI * n) * x(n),
    "y[n]=\\sqrt[3]{x[n]^3+x[n-1]^3}": (x) => (n) => Math.cbrt(x(n) ** 3 + x(n - 1) ** 3), "y[n]=x[n]+n": (x) => (n) => x(n) + n,
    "y[n]=(x*x)[n]=\\sum_k x[k]\\,x[n-k]": (x) => (n) => { let s = 0; for (let k = -250; k <= 250; k++) s += x(k) * x(n - k); return s; },
    "y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]": (x) => () => { let s = 0; for (let k = -100; k <= 100; k++) s += x(k); return s; },
    "y[n]=x[n+1]-x[n-1]": (x) => (n) => x(n + 1) - x(n - 1), "y(t)=x(t)+x(t-1)": (x) => (t) => x(t) + x(t - 1), "y(t)=x(t^2)": (x) => (t) => x(t * t),
    "y(t)=\\frac{d}{dt}x(t)+2x(t)": (x) => (t) => (x(t + 1e-5) - x(t - 1e-5)) / 2e-5 + 2 * x(t), "y(t)=x(-t)": (x) => (t) => x(-t), "y[n]=0": () => () => 0,
    "y[n]=2y[n-1]+x[n]\\ \\text{(initially at rest)}": (x) => (n) => { let y = 0; for (let k = -60; k <= n; k++) y = 2 * y + x(k); return y; },
    "y(t)=\\int_{t-1}^{t}x(\\tau)\\,d\\tau": (x) => (t) => { let s = 0; const h = 0.001; for (let u = t - 1; u < t - 1e-9; u += h) s += x(u + h / 2) * h; return s; },
    "y[n]=x[n]+x[3]": (x) => (n) => x(n) + x(3),
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

  // Causal: changing the input only after t0 must not change y(t0). Memoryless: changing the input
  // everywhere except at t0 must not change y(t0). Stable: bounded witness inputs (|x| <= 1) must
  // keep |y| <= 100 at the probe times; an unstable system must exceed that for some witness.
  bad = 0;
  const t0s = [-5, -2, -1, 0, 1, 2, 4];
  const witnesses = [() => 0, () => 1, (t) => +(t >= 0), (t) => Math.sin(1000 * t), (t) => Math.cos(Math.PI * Math.round(t))];
  const probes = [-20, -10, -1, 0, 1, 10, 50, 200];
  for (const [tex, , , , , cau, mem, stab] of D._systems) {
    const S = IMPL[tex], ct = /\(t/.test(tex);
    const y0 = S(x1);
    const isCausal = t0s.every((t0) => close(S((t) => x1(t) + (t > t0 ? (ct ? (t - t0) ** 2 : 1) : 0))(t0), y0(t0)));
    const isMem = t0s.every((t0) => close(S((t) => x1(t) + (ct ? t - t0 : t === t0 ? 0 : 1 + 3 * (t - t0) + (t - t0) ** 2))(t0), y0(t0)));
    const isStable = witnesses.every((xw) => { const y = S(xw); return probes.every((t) => Math.abs(y(t)) <= 100); });
    if (isCausal !== !!cau || isMem !== !!mem || isStable !== !!stab) { bad++; console.log(`FAIL ${tex}: table says causal ${cau} memoryless ${mem} stable ${stab}, numeric says ${+isCausal}${+isMem}${+isStable}`); }
  }
  report("causal, memoryless, stable (numeric)", bad);
}

// ---- 4. new systems drills, checked independently
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const DTFT = (h, W) => h.reduce((s, v, n) => [s[0] + v * Math.cos(W * n), s[1] - v * Math.sin(W * n)], [0, 0]);
const near = (u, v, e = 1e-6) => Math.abs(u - v) < e * Math.max(1, Math.abs(v));
const angNear = (u, v) => Math.abs(Math.atan2(Math.sin(u - v), Math.cos(u - v))) < 1e-6;
const pv = (q) => val(q.anyOf ? q.anyOf[0] : q.answer);
const run = (type, n, fn) => { let bad = 0; for (let seed = 1; seed <= n; seed++) { const p = D.generate(type, seed); const err = fn(p); if (err) { if (bad++ < 4) console.log(`FAIL ${type} seed ${seed}: ${err}`); } } report(`${type} (independent check)`, bad, n); };

// 4a. Could it be LTI: output frequencies must be a subset of input frequencies; two pairs must share H.
run("s_couldlti", 300, (p) => {
  const coefs = (f, T, M, K) => Array.from({ length: K }, (_, k) => { let re = 0, im = 0; for (let i = 0; i < M; i++) { const t = ((i + 0.5) * T) / M, v = f(t); re += v * Math.cos((2 * Math.PI * k * i) / M); im -= v * Math.sin((2 * Math.PI * k * i) / M); } return [re / M, im / M]; });
  for (let i = 0; i < p._lti.length; i++) {
    const { ok, chk } = p._lti[i];
    let could;
    if (chk.kind === "pair") {
      const [xa, ya, xb, yb] = [chk.xa, chk.ya, chk.xb, chk.yb].map((f) => coefs(f, chk.T, 512, 2)[1]);
      const d = xa[0] ** 2 + xa[1] ** 2, H = [(ya[0] * xa[0] + ya[1] * xa[1]) / d, (ya[1] * xa[0] - ya[0] * xa[1]) / d], pred = cmul(H, xb);
      could = near(pred[0], yb[0], 1e-6) && near(pred[1], yb[1], 1e-6);
    } else {
      const X = chk.kind === "ct" ? coefs(chk.xf, chk.T, 4096, 40) : coefs((t) => chk.xf(Math.round(t * chk.N - 0.5)), 1, chk.N, chk.N);
      const Y = chk.kind === "ct" ? coefs(chk.yf, chk.T, 4096, 40) : coefs((t) => chk.yf(Math.round(t * chk.N - 0.5)), 1, chk.N, chk.N);
      could = X.every((x, k) => Math.hypot(...x) > 1e-6 || Math.hypot(...Y[k]) < 1e-6);
    }
    if (could !== !!ok) return `row ${i + 1}: numeric ${could}, answer ${ok}`;
    if (p.grids[0].answer[i][0] !== (ok ? "Yes" : "No")) return "grid mismatch";
  }
});

// 4b. System identification: rebuild the system from the answers and re-measure the given outputs.
run("s_sysid", 300, (p) => {
  const a = p.parts.map(pv), id = p._id;
  if (id.kind === "fir") {
    const h = a.slice(0, 3), H0 = DTFT(h, 0)[0], Hq = DTFT(h, Math.PI / 2), Hp = DTFT(h, Math.PI)[0];
    if (!near(H0, id.H0) || !near(Hq[0], id.A) || !near(-Hq[1], id.B) || !near(Hp, a[3])) return `h=${h}`;
  } else if (id.kind === "iir") {
    const [A, B] = a, sim = (x) => { let y = 0; for (let n = 0; n < 400; n++) y = A * y + B * x(n); return y; };
    if (!near(sim(() => 1), id.y1) || !near(sim((n) => (n % 2 ? -1 : 1)) / (399 % 2 ? -1 : 1), id.y2)) return "outputs";
    const h = [B, A * B, A * A * B]; if (!near(h[2], a[2])) return "h[2]";
    const Hq = DTFT(Array.from({ length: 400 }, (_, n) => B * A ** n), Math.PI / 2); if (!near(Math.hypot(...Hq), a[3])) return "|H(pi/2)|";
  } else {
    const [A, B, Cc, h0] = a;
    // RK4 on y' = -A y + B x for x = 1 and x = cos(w1 t), long enough for transients to die.
    const ode = (x, T) => { let y = 0, t = 0; const N = Math.round(T / 1e-3), dt = T / N; const f = (t, y) => -A * y + B * x(t); for (let i = 0; i < N; i++) { const k1 = f(t, y), k2 = f(t + dt / 2, y + (dt * k1) / 2), k3 = f(t + dt / 2, y + (dt * k2) / 2), k4 = f(t + dt, y + dt * k3); y += (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6; t += dt; } return y; };
    const T = 40 / A;
    if (!near(ode(() => 1, T), id.K, 1e-4)) return "DC";
    const Tc = Math.ceil((T * id.w1) / (2 * Math.PI)) * ((2 * Math.PI) / id.w1); // a whole number of periods, so cos(w1 Tc) = 1
    const yc = ode((t) => Math.cos(id.w1 * t), Tc), ys = ode((t) => Math.sin(id.w1 * t), Tc); // = Re H, Im H
    if (!near(Math.hypot(yc, ys), Cc, 1e-4) || !near(Math.atan2(ys, yc), -id.phi, 1e-4) || !near(h0, B)) return "cos response";
  }
});

// 4c. Difference equations: simulate from the coefficients; H by direct sums over h.
run("s_diffeq", 300, (p) => {
  const de = p._de;
  const sim = (ac, bc, L) => { const y = []; for (let n = 0; n < L; n++) { let s = bc[n] || 0; for (let k = 1; k < ac.length; k++) if (n - k >= 0) s += ac[k] * y[n - k]; y.push(s); } return y; };
  if (de.rev) {
    const [c1, d0, d1, d2] = p.parts.map(pv), h = sim([0, c1], [d0, d1, d2], 30);
    return h.every((v, n) => near(v, de.b * de.a ** n + (n === 1 ? de.d : 0), 1e-9)) ? null : "reverse coefficients";
  }
  const h = sim(de.ac, de.bc, 2000), mags = Array.from({ length: 4096 }, (_, i) => Math.hypot(...DTFT(h, (2 * Math.PI * i) / 4096)));
  for (const q of p.parts) {
    const [k, arg] = q._t, want = pv(q);
    let got;
    if (k === "h") got = h[arg]; else if (k === "H") got = DTFT(h, arg)[0];
    else if (k === "max") got = Math.max(...mags); else if (k === "min") got = Math.min(...mags);
    else got = mags.filter((m, i) => m > mags[(i + 4095) % 4096] && m >= mags[(i + 1) % 4096]).length;
    if (!near(got, want, 1e-5)) return `${k} ${arg}: numeric ${got}, answer ${want}`;
  }
});

// 4d. Block diagrams: frequency-domain identities and direct simulation.
run("s_blocks", 300, (p) => {
  const b = p._blk, g = p.grids[0] ? p.grids[0].answer[0].map(val) : null;
  if (b.kind === "casc" || b.kind === "par") {
    for (const W of [0, 0.7, 2, Math.PI]) {
      let H = cmul(DTFT(b.h1, W), DTFT(b.h2, W)); if (b.kind === "par") H = [H[0] + Math.cos(W * b.k), H[1] - Math.sin(W * b.k)];
      const G = DTFT(g, W); if (!near(G[0], H[0], 1e-9) || !near(G[1], H[1], 1e-9)) return `H at ${W}`;
    }
    if (!near(pv(p.parts[0]), DTFT(g, 0)[0]) || !near(pv(p.parts[1]), DTFT(g, Math.PI)[0])) return "H(0)/H(pi)";
  } else if (b.kind === "fb") {
    const y = []; for (let n = 0; n < 3000; n++) y.push(+(n === 0) + (n >= b.K ? b.a * y[n - b.K] : 0));
    if (!g.every((v, n) => near(v, y[n], 1e-12))) return "h";
    if (!near(pv(p.parts[0]), DTFT(y, 0)[0]) || !near(pv(p.parts[1]), DTFT(y, Math.PI)[0])) return "H";
  } else if (b.kind === "echo") {
    const [res, c, g1, g2, g3, gz] = p.parts.map(pv), n0 = b.n0;
    const h1 = Array(n0 + 1).fill(0); h1[0] = 1; h1[n0] = b.A;
    const ben = Array(n0 + 1).fill(0); ben[0] = 1; ben[n0] = -b.A;
    const hb = Array(2 * n0 + 1).fill(0); h1.forEach((u, i) => ben.forEach((v, j) => { hb[i + j] += u * v; }));
    if (!near(hb[2 * n0], res)) return "residual";
    const gg = []; for (let n = 0; n < 6 * n0; n++) gg.push(+(n === 0) + (n >= n0 ? c * gg[n - n0] : 0));
    const id = gg.map((_, n) => gg[n] + (n >= n0 ? b.A * gg[n - n0] : 0));
    if (!id.every((v, n) => near(v, +(n === 0), 1e-12))) return "inverse";
    if (!near(gg[n0], g1) || !near(gg[2 * n0], g2) || !near(gg[3 * n0], g3) || !near(gg[n0 + 1], gz)) return "g values";
  } else {
    let s = 0; if (!g.every((v, n) => near((s += v), b.s[n], 1e-12))) return "step";
    if (!near(pv(p.parts[0]), b.s[5])) return "H(0)";
  }
});

// 4e. CT systems: H from numerical integrals of h, step responses by integrating h, the difference system from its definition.
run("s_ctsys", 120, (p) => {
  const c = p._cs, a = p.parts.map(pv);
  const integ = (f, lo, hi, M = 200000) => { let s = 0; const d = (hi - lo) / M; for (let i = 0; i < M; i++) s += f(lo + (i + 0.5) * d) * d; return s; };
  const Hn = (h, lo, hi, w) => [integ((t) => h(t) * Math.cos(w * t), lo, hi), -integ((t) => h(t) * Math.sin(w * t), lo, hi)];
  if (c.kind === "rc") {
    const h = (t) => c.b * Math.exp(-c.a * t), hi = 40 / c.a; // impulse response of y' + a y = b x
    const H0 = Hn(h, 0, hi, 0)[0], Hw = Hn(h, 0, hi, c.w0), s1 = integ(h, 0, c.t1);
    const got = [H0, h(c.t1), s1, Math.hypot(...Hw), Math.atan2(Hw[1], Hw[0])];
    // h itself: check that y = h solves y' + a y = 0 with y(0+) = b (the impulse sets the jump).
    if (!near((h(1e-3) - h(0)) / 1e-3 + c.a * h(5e-4), 0, 1e-3)) return "ode";
    for (let i = 0; i < 5; i++) if (!near(got[i], a[i], 1e-4)) return `part ${i + 1}: numeric ${got[i]}, answer ${a[i]}`;
  } else if (c.kind === "diff") {
    // y(t) = x(t) - x(t - T0). The response to e^{jwt} at t = 0 is H(w).
    for (let i = 0; i < 2; i++) { const w = c.ws[i], H = [1 - Math.cos(-w * c.T0), -Math.sin(-w * c.T0)]; if (!near(Math.hypot(...H), a[2 * i], 1e-9) || !angNear(Math.atan2(H[1], H[0]), a[2 * i + 1])) return `w${i + 1}`; }
    const yu = (t) => +(t >= 0) - +(t - c.T0 >= 0); if (!near(yu(c.T0 / 2), a[4]) || !near(yu(2 * c.T0), a[5])) return "step";
  } else {
    const h = () => 1, T = c.T0, w1 = Math.PI / T, Hw = Hn(h, 0, T, w1);
    if (!near(Hn(h, 0, T, 0)[0], a[0], 1e-6) || !near(Math.hypot(...Hw), a[1], 1e-6) || !near(Math.atan2(Hw[1], Hw[0]), a[2], 1e-6)) return "H";
    if (Math.hypot(...Hn(h, 0, T, a[3])) > 1e-6 || Math.hypot(...Hn(h, 0, T, a[3] * 0.9)) < 1e-3) return "first zero";
    if (!near(integ(h, 0, T / 2), a[4], 1e-6) || !near(integ(h, 0, T), a[5], 1e-6)) return "step";
  }
});

// 4f. Sinusoids through FIR filters: convolve and compare sample by sample with A cos(W n + phi).
run("s_sinusoid", 300, (p) => {
  const s = p._sn, a = p.parts.map(pv), conv = (x, n) => s.h.reduce((acc, v, k) => acc + v * x(n - k), 0);
  const x2 = (n) => Math.cos(s.W2 * n), x3 = (n) => 5 * Math.cos(s.Wz * n) + 2 * Math.cos(s.W3 * n);
  for (let n = 3; n < 20; n++) {
    if (!near(conv(() => s.c, n), a[0], 1e-9)) return "y1";
    if (!near(conv(x2, n), a[1] * Math.cos(s.W2 * n + a[2]), 1e-9)) return `y2 at n=${n}`;
    if (!near(conv(x3, n), a[4] * Math.cos(a[3] * n + a[5]), 1e-9)) return `y3 at n=${n}`;
  }
  if (!(a[1] > 0 && a[4] > 0 && a[3] > 0 && a[3] < Math.PI)) return "A, Omega range";
});
// ---- 5. communication systems and more DFT, checked independently
const tp = (q) => (q.accept ? q.accept[0] : val(q.answer));
// Amplitudes of cos/sin components of a real signal at frequency w over a common period T (numeric).
const comp = (f, w, T, M) => { let c = 0, s = 0; for (let i = 0; i < M; i++) { const t = ((i + 0.5) * T) / M, v = f(t); c += v * Math.cos(w * t); s += v * Math.sin(w * t); } return w === 0 ? [c / M, 0] : [(2 * c) / M, (2 * s) / M]; };

// 5a. Demodulation: multiply in time, keep components below the cutoff, compare amplitudes.
run("s_demod", 120, (p) => {
  const d = p._dm, a = p.parts.map(tp), T = 4 * Math.PI, M = 60000, x = (t) => d.A * Math.cos(d.wm * t), y = (t) => x(t) * Math.cos(d.wc * t);
  const lowSet = (z) => { const out = []; for (let m = 0; m * 0.5 < d.cut; m++) { const [c, s] = comp(z, m * 0.5, T, M); if (Math.hypot(c, s) > 1e-6) out.push([m * 0.5, d.G * c, d.G * s]); } return out; };
  const za = lowSet((t) => y(t) * Math.cos(d.wc * t + d.phi));
  if (za.length !== 1 || za[0][0] !== d.wm || !near(za[0][1], a[0], 1e-6) || Math.abs(za[0][2]) > 1e-6) return `part a ${JSON.stringify(za)}`;
  if (lowSet((t) => y(t) * Math.cos(d.wc * t + Math.PI / 2)).length || Math.abs(a[1] - Math.PI / 2) > 1e-9) return "part b";
  const zc = lowSet((t) => y(t) * Math.cos((d.wc + d.dl) * t)).sort((u, v) => v[0] - u[0]);
  if (zc.length !== 2 || zc[0][0] !== a[2] || zc[1][0] !== a[3] || !near(zc[0][1], a[4], 1e-6) || !near(zc[1][1], a[5], 1e-6)) return `part c ${JSON.stringify(zc)}`;
  if (lowSet((t) => y(t) * Math.sin(d.wc * t)).length || a[6] !== 0) return "part d";
});

// 5b. FDM: sample every band, shift it by the receiver's carrier, and find the lowest unwanted frequency.
run("s_fdm", 300, (p) => {
  const f = p._fdm, a = p.parts.map(tp), band = (c, W) => { const o = []; for (let v = c - W; v <= c + W + 1e-9; v += 0.01) o.push(v, -v); return o; };
  const cs = f.c[f.s]; let lowest = Infinity, wantTop = 0;
  f.c.forEach((cj, j) => band(cj, f.W[j]).forEach((v) => [v + cs, v - cs].forEach((u) => {
    const w = Math.abs(u);
    if (j === f.s && w <= f.W[j] + 1e-6) wantTop = Math.max(wantTop, w); else lowest = Math.min(lowest, w);
  })));
  if (!near(a[0], f.c[1] - f.W[1]) || !near(a[1], f.c[1] + f.W[1])) return "band";
  const b1 = band(f.alt[0], f.W[0]).filter((v) => v > 0), b2 = band(f.alt[1], f.W[1]).filter((v) => v > 0);
  const ov = Math.min(...b2) < Math.max(...b1) - 1e-6;
  if ((a[2] === "yes") !== ov) return "overlap";
  if (a[3] !== 2 || Math.abs(a[4] - wantTop) > 0.02 || Math.abs(a[5] - lowest) > 0.02) return `cutoffs ${wantTop} ${lowest}`;
  const b3 = (c3) => band(c3, f.W[2]).filter((v) => v > 0), top2 = f.c[1] + f.W[1];
  if (Math.min(...b3(a[6])) < top2 - 1e-6 || Math.min(...b3(a[6] - 1)) >= top2 - 1e-6) return "min f3";
});

// 5c. AM with carrier: minimum of x on a grid, Fourier coefficients, and powers by time averages.
run("s_amcarrier", 200, (p) => {
  const c = p._amc, a = p.parts.map(tp), x = (t) => c.a * Math.cos(c.w1 * t) + c.b * Math.cos(3 * c.w1 * t), T = 2 * Math.PI, M = 40000;
  let mn = Infinity; for (let i = 0; i < 100000; i++) mn = Math.min(mn, x((i * T) / 100000));
  if (!near(-mn, a[0], 1e-6) || !near(Math.max(-mn, ...Array.from({ length: 1000 }, (_, i) => Math.abs(x((i * T) / 1000)))) / c.C, a[1], 1e-6)) return "C, m";
  const y = (t) => (x(t) + c.C) * Math.cos(c.wc * t);
  let n = 0; for (let w = 1; w < 2 * c.wc; w++) if (Math.hypot(...comp(y, w, T, M)) > 1e-6) n++;
  // An impulse of area A at w comes from a cosine of amplitude A/π at w.
  if (n !== a[2] || !near(comp(y, c.wc, T, M)[0], a[3], 1e-6) || !near(comp(y, c.wc + c.w1, T, M)[0], a[4], 1e-6)) return "impulses";
  const avg = (g) => { let s = 0; for (let i = 0; i < M; i++) s += g(((i + 0.5) * T) / M) ** 2; return s / M; };
  const Pc = avg((t) => c.C * Math.cos(c.wc * t)), Ps = avg((t) => x(t) * Math.cos(c.wc * t));
  if (!near(Pc, a[5], 1e-6) || !near(Ps, a[6], 1e-6) || !near(Ps / avg(y), a[7], 1e-6)) return "power";
});

// 5d. Modulation spectra: Fourier transforms of the time signals by numerical integration.
run("s_ammatch", 12, (p) => {
  const m = p._amm, wc = m.wc, dl = m.dl;
  // x(t) has the unit triangle as its transform: x(t) = (1/2π)·(sin(t/2)/(t/2))².
  const x = (t) => (Math.abs(t) < 1e-9 ? 1 : (Math.sin(t / 2) / (t / 2)) ** 2) / (2 * Math.PI);
  const time = {
    [`x·cos(${wc}t)`]: [(t) => x(t) * Math.cos(wc * t), 0], [`x·cos²(${wc}t)`]: [(t) => x(t) * Math.cos(wc * t) ** 2, 0],
    [`x·exp(j${wc}t)`]: [(t) => x(t) * Math.cos(wc * t), (t) => x(t) * Math.sin(wc * t)], [`x·exp(−j${wc}t)`]: [(t) => x(t) * Math.cos(wc * t), (t) => -x(t) * Math.sin(wc * t)],
    [`x·cos(${wc}t)·sin(${wc}t)`]: [(t) => x(t) * Math.cos(wc * t) * Math.sin(wc * t), 0], [`x·cos(${wc}t)·cos(${wc + dl}t)`]: [(t) => x(t) * Math.cos(wc * t) * Math.cos((wc + dl) * t), 0],
    [`(x+1)·cos(${wc}t)`]: [(t) => x(t) * Math.cos(wc * t), 0], [`x·cos(${2 * wc}t)`]: [(t) => x(t) * Math.cos(2 * wc * t), 0],
    [`x(2t)·cos(${wc}t)`]: [(t) => x(2 * t) * Math.cos(wc * t), 0], [`x + x·cos(${wc}t)`]: [(t) => x(t) * (1 + Math.cos(wc * t)), 0],
    [`x·(cos(${wc}t)+cos(${2 * wc}t))`]: [(t) => x(t) * (Math.cos(wc * t) + Math.cos(2 * wc * t)), 0],
  };
  const dt = 0.05, ts = []; for (let t = -400; t <= 400; t += dt) ts.push(t);
  const idx = m.ws.map((_, i) => i).filter((i) => i % 7 === 0);
  for (let s = 0; s < m.sel.length; s++) {
    const it = m.sel[s], [fr, fi] = time[it.plain], vr = ts.map(fr), vi = ts.map((t) => (fi ? fi(t) : 0));
    const ys = m.panels[m.answer[s]];
    for (const i of idx) {
      const w = m.ws[i]; if (it.imp.some((w0) => Math.abs(w - w0) < 1e-9)) { if (ys[i] < 1.05) return `${it.plain}: no impulse`; continue; }
      let re = 0, im = 0; ts.forEach((t, j) => { const c = Math.cos(w * t), sn = Math.sin(w * t); re += vr[j] * c + vi[j] * sn; im += vi[j] * c - vr[j] * sn; });
      const mag = Math.hypot(re, im) * dt;
      if (Math.abs(mag - ys[i]) > 0.01) return `${it.plain} at ω=${w}: ${mag.toFixed(3)} vs panel ${ys[i].toFixed(3)}`;
    }
  }
  // Every panel letter is used by at most... distinct signals map to distinct panels unless their spectra are equal.
  if (new Set(m.answer).size !== m.answer.length) return "two signals share a panel";
});

// 5e. DFT properties: build y and take its DFT directly.
run("s_dftprops", 300, (p) => {
  const d = p._dp, x = d.x, a = p.parts.map(tp);
  const DFT = (v, k) => { const N = v.length; let re = 0, im = 0; v.forEach((u, n) => { re += u * Math.cos((2 * Math.PI * k * n) / N); im -= u * Math.sin((2 * Math.PI * k * n) / N); }); return [re / N, im / N]; };
  const md = (i, N) => ((i % N) + N) % N;
  const build = (tex) => {
    let r;
    if ((r = tex.match(/^y\[n\]=x\[\(n-(\d)\)\\bmod 8\]$/))) return x.map((_, n) => x[md(n - +r[1], 8)]);
    if (tex === "y[n]=x[(-n)\\bmod 8]") return x.map((_, n) => x[md(-n, 8)]);
    if (tex === "y[n]=(-1)^nx[n]") return x.map((v, n) => (n % 2 ? -v : v));
    if ((r = tex.match(/^y\[n\]=x\[n\]e\^\{j2\\pi\\cdot(\d)n\/8\}$/))) return { re: x.map((v, n) => v * Math.cos((2 * Math.PI * +r[1] * n) / 8)), im: x.map((v, n) => v * Math.sin((2 * Math.PI * +r[1] * n) / 8)) };
    if (tex.startsWith("y[n]=x[n]\\text{ for }0")) return x.concat(Array(8).fill(0));
    if (tex.startsWith("y[n]=x[n\\bmod 8]")) return x.concat(x);
    if (tex.startsWith("y[2n]=x[n]")) return x.flatMap((v) => [v, 0]);
    if (tex === "y[n]=x[n]+x[(n-4)\\bmod 8]") return x.map((v, n) => v + x[md(n - 4, 8)]);
    throw new Error("unknown op " + tex);
  };
  for (let i = 0; i < d.ops.length; i++) {
    const o = d.ops[i], y = build(o.tex);
    let Y;
    if (Array.isArray(y)) { if (y.length !== o.Nn) return "length"; Y = DFT(y, o.k); }
    else { const A = DFT(y.re, o.k), B = DFT(y.im, o.k); Y = [A[0] - B[1], A[1] + B[0]]; }
    if (Math.abs(Y[0] - a[2 * i]) > 1e-9 || Math.abs(Y[1] - a[2 * i + 1]) > 1e-9) return `${o.tex}: ${Y} vs ${a[2 * i]}, ${a[2 * i + 1]}`;
  }
});

// 5f. Windows and resolution: direct DFTs, a period search, and the bin of a sampled cosine.
run("s_dftwin", 300, (p) => {
  const w = p._dw, q = Object.fromEntries(p.parts.map((pt) => [pt.q.slice(0, 18), tp(pt)])), byStart = (s) => p.parts.find((pt) => pt.q.startsWith(s));
  const DFTm = (v) => v.map((_, k) => { let re = 0, im = 0; v.forEach((u, n) => { re += u * Math.cos((2 * Math.PI * k * n) / v.length); im -= u * Math.sin((2 * Math.PI * k * n) / v.length); }); return Math.hypot(re, im) / v.length; });
  const Xa = DFTm(Array.from({ length: w.N }, (_, n) => +(n < w.L)));
  const zeros = Xa.map((v, k) => [v, k]).filter(([v, k]) => k > 0 && v < 1e-9).map(([, k]) => k);
  if (!near(Xa[0], tp(byStart("(a) $X[0]$"))) || zeros[0] !== tp(byStart("(a) smallest")) || zeros.length !== tp(byStart("(a) number")) || !near(Xa[w.k1], tp(byStart(`(a) $|X[${w.k1}]|$`)))) return "part a";
  const xb = (n) => Math.cos((2 * Math.PI * w.r * n) / w.Nb);
  let P = 1; while (![...Array(300).keys()].every((n) => Math.abs(xb(n + P) - xb(n)) < 1e-9)) P++;
  if (P !== tp(byStart("(b) fundamental"))) return `period ${P}`;
  if ((w.Nb % P === 0) !== (tp(byStart("(b) is")) === "yes")) return "periodic";
  const Xb = DFTm(Array.from({ length: w.Nb }, (_, n) => xb(n))), half = Xb.slice(1, w.Nb / 2), mx = Math.max(...half), pk = half.indexOf(mx) + 1;
  const pq = byStart("(b) $k$ of"); if (pq && tp(pq) !== pk) return `peak ${pk}`;
  const vq = byStart("(b) that"); if (vq && !near(mx, tp(vq))) return "peak value";
  const fq = tp(byStart("(c) frequency")), xc = Array.from({ length: w.Nc }, (_, n) => Math.cos((2 * Math.PI * fq * n) / w.fs));
  const Xc = DFTm(xc).slice(0, w.Nc / 2); if (Xc.indexOf(Math.max(...Xc)) !== w.kc) return "bin of the frequency";
  if (!near(tp(byStart("(c) largest")), w.fs / w.Nc / 2)) return "half bin";
  const Nm = tp(byStart("(c) smallest")); if (!(w.fs / Nm <= w.want && w.fs / (Nm / 2) > w.want)) return "N min";
});

// 5g. Inverse DFT: synthesize x from X, and check the forward DFT of the answer gives X back.
run("s_idft", 300, (p) => {
  const d = p._id2, N = d.N, xs = p.grids[0].answer[0].map(val);
  for (let n = 0; n < N; n++) {
    let re = 0, im = 0; d.X.forEach((c, k) => { const th = (2 * Math.PI * k * n) / N; re += c.re * Math.cos(th) - c.im * Math.sin(th); im += c.re * Math.sin(th) + c.im * Math.cos(th); });
    if (Math.abs(im) > 1e-9 || Math.abs(re - xs[n]) > 1e-9) return `x[${n}]`;
  }
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0; xs.forEach((v, n) => { re += v * Math.cos((2 * Math.PI * k * n) / N); im -= v * Math.sin((2 * Math.PI * k * n) / N); });
    if (Math.abs(re / N - d.X[k].re) > 1e-9 || Math.abs(im / N - d.X[k].im) > 1e-9) return `X[${k}]`;
  }
  if (!p.grids[0].answer[0].every((s) => /^-?\d+(\/\d+)?$/.test(s))) return "non-rational grid value";
  if (!near(xs.reduce((s, v) => s + v, 0), val(p.parts[0].answer))) return "sum";
});
process.exit(fails ? 1 : 0);
