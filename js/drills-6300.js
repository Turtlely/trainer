// Generated drills for 6.3000 Signal Processing Quiz 2 (Fall 2026): Fourier series and transforms,
// sampling, systems, convolution, frequency response, modulation, the DFT, circular convolution.
// Conventions follow 6.3000: a_k = (1/T)∫f e^{-jkω0t}dt, X[k] = (1/N)Σ x[n]e^{-j2πkn/N},
// so multiplying N-point DFTs gives (1/N) times the circular convolution.
// Drill shape (as in js/drills-6191.js): { title, statement, grids, parts, solution }.
// A part may have anyOf: [answers] (any one is accepted), used for angles of ±π.
(function (root) {
  const F = root.Fig;
  let figSeq = 0;
  const fig = (markup) => { const k = `sp-${++figSeq}`; F.def(k, markup); return `@fig ${k}`; };
  const PI = Math.PI;

  // ---------------------------------------------------------------- numbers
  const snap = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
  const num = (v) => { v = snap(v); return Number.isInteger(v) ? String(v) : String(+v.toPrecision(12)); };
  // A short TeX/plain form for solutions: simple fractions of small denominators, else 4 digits.
  function nice(v) {
    v = snap(v);
    if (Number.isInteger(v)) return String(v);
    for (const d of [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 24, 32]) { const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9) return `${Math.round(n)}/${d}`; }
    // TeX output: use inside $...$.
    for (const [s, c] of [["\\pi", PI], ["\\tfrac{1}{\\pi}", 1 / PI], ["\\sqrt{2}", Math.SQRT2], ["\\sqrt{3}", Math.sqrt(3)], ["\\tfrac{1}{\\pi^2}", 1 / PI / PI]]) {
      for (const d of [1, 2, 3, 4, 6, 8]) { const n = (v * d) / c; if (Math.abs(n - Math.round(n)) < 1e-9 && Math.round(n)) return `${Math.round(n) === 1 ? "" : Math.round(n) === -1 ? "-" : Math.round(n)}${s}${d > 1 ? "/" + d : ""}`; }
    }
    return v.toFixed(4);
  }
  const C = (re, im = 0) => ({ re, im });
  const cadd = (a, b) => C(a.re + b.re, a.im + b.im), csub = (a, b) => C(a.re - b.re, a.im - b.im);
  const cmul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const cscale = (a, s) => C(a.re * s, a.im * s);
  const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const cexp = (th) => C(Math.cos(th), Math.sin(th));
  const cabs = (a) => Math.hypot(a.re, a.im);
  const carg = (a) => { if (cabs(a) < 1e-12) return 0; let t = Math.atan2(a.im, a.re); if (Math.abs(t + PI) < 1e-9) t = PI; return t; };
  const ctex = (a) => { const r = snap(a.re), i = snap(a.im); if (!i) return nice(r); if (!r) return `${nice(i)}j`; return `${nice(r)} ${i < 0 ? "-" : "+"} ${nice(Math.abs(i))}j`; };
  const mod = (a, n) => ((a % n) + n) % n;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  // N-point DFT with the 6.3000 1/N factor.
  const dft = (x) => { const N = x.length; return Array.from({ length: N }, (_, k) => { let s = C(0); x.forEach((v, n) => { s = cadd(s, cscale(cexp((-2 * PI * k * n) / N), v)); }); return cscale(s, 1 / N); }); };

  // ---------------------------------------------------------------- seeded random numbers
  function rng(seed) {
    let a = seed >>> 0;
    const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const R = {
      next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), pick: (xs) => xs[Math.floor(next() * xs.length)], chance: (p) => next() < p,
      shuffle: (xs) => { const b = xs.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    };
    return R;
  }

  // ---------------------------------------------------------------- plots
  // A panel is { label, kind: "stem" | "line", xs, ys, xticks, yrange: [lo, hi] }. panels() lays panels
  // out in a grid inside one SVG. Values are drawn to scale inside each panel; no y scale is shown
  // unless the panel sets ylab.
  function panel(p, x0, y0, w, h) {
    const [lo, hi] = p.yrange || (() => { const m = Math.max(1e-9, ...p.ys.map(Math.abs)); return Math.min(...p.ys) < -1e-9 ? [-m, m] : [0, m]; })();
    const xmin = Math.min(...p.xs), xmax = Math.max(...p.xs);
    const X = (x) => x0 + 22 + ((x - xmin) / (xmax - xmin || 1)) * (w - 34);
    const Y = (y) => y0 + 14 + (1 - (y - lo) / (hi - lo || 1)) * (h - 34);
    let s = F.t(x0 + w - 4, y0 + 8, p.label, { a: "end", b: true, s: 12 }); // top right, clear of the y labels
    s += F.line([[X(xmin) - 6, Y(0)], [X(xmax) + 6, Y(0)]], { c: "mut" });
    if (p.kind === "line") {
      s += `<polyline class="ln acc" points="${p.xs.map((x, i) => `${X(x).toFixed(1)},${Y(p.ys[i]).toFixed(1)}`).join(" ")}" stroke-width="1.6"/>`;
    } else {
      p.xs.forEach((x, i) => { const y = snap(p.ys[i]); s += F.line([[X(x), Y(0)], [X(x), Y(y)]], { c: "acc" }); s += `<circle class="fill acc" cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="2.3"/>`; });
    }
    for (const xt of p.xticks || []) s += F.t(X(xt[0]), y0 + h - 8, xt[1], { s: 9, c: "mut" });
    for (const yt of p.yticks || []) s += F.t(x0 + 18, Y(yt[0]), yt[1], { s: 9, c: "mut", a: "end" });
    if (p.xlab) s += F.t(x0 + w - 6, Y(0) - 7, p.xlab, { s: 10, a: "end", i: true, c: "mut" });
    return s;
  }
  function panels(list, cols = 2, w = 250, h = 96) {
    const rows = Math.ceil(list.length / cols);
    return F.svg(cols * w, rows * h, list.map((p, i) => panel(p, (i % cols) * w, Math.floor(i / cols) * h, w - 6, h)).join(""));
  }
  const kAxis = (N, centered) => (centered ? Array.from({ length: N + 1 }, (_, i) => i - N / 2) : Array.from({ length: N }, (_, i) => i));
  const tick = (xs) => xs.map((x) => [x, String(x)]);
  const letters = (n, upper = true) => Array.from({ length: n }, (_, i) => String.fromCharCode((upper ? 65 : 97) + i));
  const fpKey = (ys) => ys.map((v) => snap(v).toFixed(3)).join(",");

  // Build a matching problem: items have { name, ys } (the correct panel data); distractors add more panels.
  // Identical panels are merged, so two items can share one letter. Returns { panels, answer: [letter per item] }.
  function matchSet(R, items, distractors, prefix, mk) {
    const uniq = [];
    const keyOf = (ys) => fpKey(ys);
    for (const ys of [...items.map((it) => it.ys), ...distractors]) if (!uniq.some((u) => u.k === keyOf(ys))) uniq.push({ k: keyOf(ys), ys });
    const order = R.shuffle(uniq);
    const labs = order.map((_, i) => prefix(i));
    return { panels: order.map((u, i) => mk(labs[i], u.ys)), answer: items.map((it) => labs[order.findIndex((u) => u.k === keyOf(it.ys))]) };
  }

  // ---------------------------------------------------------------- 1. DT Fourier series matching (HW3 style)
  const DT_FAMILIES = [
    (N, R) => { const n0 = R.int(1, 3); return { tex: `\\delta[n-${n0}]`, x: (n) => +(n === n0) }; },
    () => ({ tex: "\\delta[n]", x: (n) => +(n === 0) }),
    (N, R) => { const L = R.pick([2, 3, 4]); return { tex: `1 \\text{ for } 0\\le n<${L}`, x: (n) => +(n < L) }; },
    (N, R) => { const m = R.int(1, 2); return { tex: `1 \\text{ for } |n|\\le ${m}`, x: (n) => +(n <= m || n >= N - m) }; },
    (N, R) => { const m = R.int(1, 3); return { tex: `\\cos(2\\pi ${m}n/${N})`, x: (n) => Math.cos((2 * PI * m * n) / N) }; },
    (N, R) => { const m = R.int(1, 3); return { tex: `\\sin(2\\pi ${m}n/${N})`, x: (n) => Math.sin((2 * PI * m * n) / N) }; },
    () => ({ tex: "(-1)^n", x: (n) => (n % 2 ? -1 : 1) }),
    () => ({ tex: "\\delta[n]-\\delta[n-1]", x: (n) => (n === 0 ? 1 : n === 1 ? -1 : 0) }),
    () => ({ tex: "(1/2)^n \\text{ for } 0\\le n<N", x: (n) => 0.5 ** n }),
    (N) => ({ tex: `n \\text{ for } 0\\le n<${N}`, x: (n) => n }),
  ];
  function dtfsMatch(R) {
    const N = R.pick([8, 12, 16]);
    const fams = R.shuffle(DT_FAMILIES.map((f, i) => i)).slice(0, 7).map((i) => DT_FAMILIES[i](N, R));
    const sigs = fams.slice(0, 4), extra = fams.slice(4);
    const ks = kAxis(N, true);
    const spec = (s) => { const X = dft(Array.from({ length: N }, (_, n) => s.x(n))); return ks.map((k) => X[mod(k, N)]); };
    const items = sigs.map((s) => ({ s, X: spec(s) }));
    const mags = matchSet(R, items.map((it) => ({ ys: it.X.map(cabs) })), extra.map((s) => spec(s).map(cabs)), (i) => `M${i + 1}`,
      (lab, ys) => ({ label: lab, kind: "stem", xs: ks, ys, xticks: tick([-N / 2, 0, N / 2]) }));
    const angs = matchSet(R, items.map((it) => ({ ys: it.X.map(carg) })), extra.map((s) => spec(s).map(carg)), (i) => `A${i + 1}`,
      (lab, ys) => ({ label: lab, kind: "stem", xs: ks, ys, yrange: [-PI, PI], xticks: tick([-N / 2, 0, N / 2]), yticks: [[PI, "π"], [-PI, "-π"]] }));
    const sigPanels = sigs.map((s, i) => ({ label: `x${i + 1}`, kind: "stem", xs: Array.from({ length: N }, (_, n) => n), ys: Array.from({ length: N }, (_, n) => s.x(n)), xticks: tick([0, N - 1]) }));
    return {
      title: `DT Fourier series matching (N = ${N})`,
      statement: `**Fourier series matching.** Each signal below is periodic with period $N=${N}$ (one period, $n=0$ to $${N - 1}$, is shown). Find its Fourier series coefficients $X_i[k]=\\frac1N\\sum_{n=0}^{N-1}x_i[n]e^{-j2\\pi kn/N}$, then pick the plot of $|X_i[k]|$ (M) and of $\\angle X_i[k]$ (A), for $-\\frac N2\\le k\\le\\frac N2$. Magnitude scales differ between plots. Angles are in $(-\\pi,\\pi]$, and the angle is drawn as 0 where $X_i[k]=0$.

${sigs.map((s, i) => `- $x_${i + 1}[n] = ${s.tex}$`).join("\n")}

${fig(panels(sigPanels, 2, 250, 90))}

Magnitude plots:

${fig(panels(mags.panels, 3, 200, 90))}

Angle plots:

${fig(panels(angs.panels, 3, 200, 90))}`,
      grids: [{ id: "m", caption: "Enter a plot label (M1, A3, ...) for each signal", rowLabels: sigs.map((_, i) => `x${i + 1}`), colLabels: ["magnitude", "angle"],
        answer: sigs.map((_, i) => [mags.answer[i], angs.answer[i]]), kind: "text" }],
      parts: [],
      solution: items.map((it, i) => `- $x_${i + 1}[n]=${sigs[i].tex}$: magnitude **${mags.answer[i]}**, angle **${angs.answer[i]}**. ${dtfsHint(sigs[i].tex, N)}`).join("\n")
        + `\n\nUseful facts: a delay by $n_0$ multiplies $X[k]$ by $e^{-j2\\pi kn_0/N}$ (same magnitude, angle changes linearly in $k$). A real, even signal has real $X[k]$ (angle 0 or $\\pi$). A real, odd signal has imaginary $X[k]$ (angle $\\pm\\pi/2$). $X[0]$ is the average value.`,
    };
  }
  function dtfsHint(tex, N) {
    if (tex.startsWith("\\delta[n-")) return "A delayed impulse: $|X[k]|=\\frac1N$ for all $k$, and the angle decreases linearly in $k$.";
    if (tex === "\\delta[n]") return "$X[k]=\\frac1N$ for all $k$ (real, angle 0).";
    if (tex.startsWith("\\cos")) return "Two spikes of height $\\frac12$ at $\\pm m$, angle 0.";
    if (tex.startsWith("\\sin")) return "Two spikes of height $\\frac12$ at $\\pm m$, angles $-\\frac\\pi2$ at $+m$ and $+\\frac\\pi2$ at $-m$.";
    if (tex === "(-1)^n") return `$(-1)^n=e^{j\\pi n}$: one spike of height 1 at $k=\\pm${N / 2}$.`;
    if (tex.includes("|n|")) return "A real, even pulse: real coefficients that change sign (angle 0 or π).";
    if (tex.includes("0\\le n<") && tex.startsWith("1")) return "A pulse that starts at $n=0$: the magnitude is like a periodic sinc, and the linear-phase factor $e^{-j\\pi k(L-1)/N}$ tilts the angle.";
    if (tex.startsWith("\\delta[n]-")) return "$X[k]=\\frac1N(1-e^{-j2\\pi k/N})$, so $|X[k]|=\\frac2N|\\sin(\\pi k/N)|$: zero at $k=0$, largest at $k=\\pm N/2$.";
    return "";
  }

  // ---------------------------------------------------------------- 2. CT Fourier transform properties matching (Q2 Spring 2025 style)
  const sinc = (x) => (Math.abs(x) < 1e-12 ? 1 : Math.sin(x) / x);
  function ftMatch(R) {
    const base = R.pick([
      { tex: "f(t)=\\begin{cases}1 & |t|<1\\\\0 & \\text{otherwise}\\end{cases}", F: (w) => 2 * sinc(w), Ftex: "F(\\omega)=\\frac{2\\sin\\omega}{\\omega}", f: (t) => +(Math.abs(t) < 1) },
      { tex: "f(t)=\\begin{cases}1-|t| & |t|<1\\\\0 & \\text{otherwise}\\end{cases}", F: (w) => sinc(w / 2) ** 2, Ftex: "F(\\omega)=\\left(\\frac{\\sin(\\omega/2)}{\\omega/2}\\right)^2", f: (t) => Math.max(0, 1 - Math.abs(t)) },
    ]);
    const w0 = R.pick([2, 3, 4]), d = R.pick([1, 2]);
    const dF = (w) => (base.F(w + 1e-4) - base.F(w - 1e-4)) / 2e-4;
    const ws = Array.from({ length: 321 }, (_, i) => -4 * PI + (8 * PI * i) / 320);
    const derived = [
      { tex: "f(t/2)", plain: "f(t/2)", m: (w) => 2 * Math.abs(base.F(2 * w)), why: "Stretching in time by 2 compresses the spectrum by 2: $2F(2\\omega)$." },
      { tex: "f(2t)", plain: "f(2t)", m: (w) => Math.abs(base.F(w / 2)) / 2, why: "Compressing in time widens the spectrum: $\\frac12F(\\omega/2)$." },
      { tex: `f(t-${d})`, plain: `f(t−${d})`, m: (w) => Math.abs(base.F(w)), why: `A delay multiplies by $e^{-j${d}\\omega}$: the magnitude does not change.` },
      { tex: "t\\,f(t)", plain: "t·f(t)", m: (w) => Math.abs(dF(w)), why: "$t f(t)\\leftrightarrow j\\frac{dF}{d\\omega}$: zero at $\\omega=0$ (F is flat there)." },
      { tex: "(f*f)(t)", plain: "(f∗f)(t)", m: (w) => base.F(w) ** 2, why: "Convolution in time is multiplication in frequency: $F(\\omega)^2$, so the side lobes shrink." },
      { tex: `f(t)\\cos(${w0}t)`, plain: `f(t)·cos(${w0}t)`, m: (w) => Math.abs(base.F(w - w0) + base.F(w + w0)) / 2, why: `$\\frac12F(\\omega-${w0})+\\frac12F(\\omega+${w0})$: two shifted copies, added.` },
      { tex: `f(t)\\sin(${w0}t)`, plain: `f(t)·sin(${w0}t)`, m: (w) => Math.abs(base.F(w - w0) - base.F(w + w0)) / 2, why: `$\\frac1{2j}[F(\\omega-${w0})-F(\\omega+${w0})]$: two copies, subtracted (zero at $\\omega=0$).` },
      { tex: `f(t)e^{j${w0}t}`, plain: `f(t)·exp(j${w0}t)`, m: (w) => Math.abs(base.F(w - w0)), why: `Shift right: $F(\\omega-${w0})$.` },
      { tex: `f(t)e^{-j${w0}t}`, plain: `f(t)·exp(−j${w0}t)`, m: (w) => Math.abs(base.F(w + w0)), why: `Shift left: $F(\\omega+${w0})$.` },
    ];
    const pickd = R.shuffle(derived).slice(0, 7);
    const norm = (ys) => { const m = Math.max(...ys); return ys.map((v) => v / m); };
    const distract = [norm(ws.map((w) => Math.abs(base.F(3 * w)))), norm(ws.map((w) => Math.abs(base.F(w - 2 * w0))))];
    const ms = matchSet(R, pickd.map((dd) => ({ ys: norm(ws.map(dd.m)) })), distract, (i) => String.fromCharCode(65 + i),
      (lab, ys) => ({ label: lab, kind: "line", xs: ws, ys, yrange: [0, 1.05], xticks: [[-4 * PI, "-4π"], [-2 * PI, "-2π"], [0, "0"], [2 * PI, "2π"], [4 * PI, "4π"]], xlab: "ω" }));
    const top = panels([
      { label: "f(t)", kind: "line", xs: Array.from({ length: 201 }, (_, i) => -3 + (6 * i) / 200), ys: Array.from({ length: 201 }, (_, i) => base.f(-3 + (6 * i) / 200)), yrange: [-0.1, 1.2], xticks: tick([-3, -1, 0, 1, 3]), xlab: "t" },
      { label: "F(ω)", kind: "line", xs: ws, ys: ws.map(base.F), xticks: [[-4 * PI, "-4π"], [0, "0"], [4 * PI, "4π"]], xlab: "ω" },
    ], 2, 280, 110);
    return {
      title: "Fourier transform properties: matching",
      statement: `**Pulsed relations.** Let $${base.tex}$, with Fourier transform $${base.Ftex}$.

${fig(top)}

Each plot A–${String.fromCharCode(64 + ms.panels.length)} shows the magnitude of the Fourier transform of a signal derived from $f(t)$, for $-4\\pi\\le\\omega\\le4\\pi$. Each plot is scaled so that its peak is 1. Match each derived signal to its plot.

${fig(panels(ms.panels, 3, 200, 92))}`,
      grids: [{ id: "m", caption: "Plot letter for each signal", rowLabels: pickd.map((dd) => dd.plain), colLabels: ["plot"], answer: pickd.map((_, i) => [ms.answer[i]]), kind: "text" }],
      parts: [],
      solution: pickd.map((dd, i) => `- $${dd.tex}$: **${ms.answer[i]}**. ${dd.why}`).join("\n"),
    };
  }

  // ---------------------------------------------------------------- 3. DFT of sinusoids matching (Q2 Fall 2022 style)
  function dftSinMatch(R) {
    const N = 32, m = R.int(2, 5);
    const pool = [
      { tex: `\\cos(2\\pi ${m}n/32)`, x: (n) => Math.cos((2 * PI * m * n) / 32), why: `On a bin: exactly two nonzero values, at $k=${m}$ and $k=${32 - m}$.` },
      { tex: `\\cos(2\\pi ${m + 0.5}n/32)`, x: (n) => Math.cos((2 * PI * (m + 0.5) * n) / 32), why: "Halfway between bins: the energy leaks into many bins around $k=" + (m + 0.5) + "$ (and its mirror)." },
      { tex: `\\cos(2\\pi ${2 * m}n/32)`, x: (n) => Math.cos((4 * PI * m * n) / 32), why: `Twice the frequency: spikes at $k=${2 * m}$ and $${32 - 2 * m}$.` },
      { tex: `\\cos^2(2\\pi ${m}n/32)`, x: (n) => Math.cos((2 * PI * m * n) / 32) ** 2, why: `$\\cos^2\\theta=\\frac12+\\frac12\\cos2\\theta$: a DC spike (twice as tall) and spikes at $k=${2 * m}, ${32 - 2 * m}$.` },
      { tex: `\\cos^3(2\\pi ${m}n/32)`, x: (n) => Math.cos((2 * PI * m * n) / 32) ** 3, why: `$\\cos^3\\theta=\\frac34\\cos\\theta+\\frac14\\cos3\\theta$: spikes at $k=${m}, ${3 * m}$ (and mirrors), the first three times taller.` },
      { tex: `\\cos(2\\pi ${m}n/32)+1`, x: (n) => Math.cos((2 * PI * m * n) / 32) + 1, why: `A DC spike twice as tall as the two cosine spikes at $k=${m}, ${32 - m}$.` },
      { tex: `\\cos(\\pi n)`, x: (n) => (n % 2 ? -1 : 1), why: "$\\cos(\\pi n)=(-1)^n$: one spike at $k=16$." },
      { tex: `\\cos(2\\pi ${m}n/32)\\,\\cos(\\pi n)`, x: (n) => Math.cos((2 * PI * m * n) / 32) * (n % 2 ? -1 : 1), why: `Multiplying by $(-1)^n$ shifts by 16 bins: spikes at $k=${16 - m}, ${16 + m}$.` },
      { tex: `\\cos(2\\pi ${m + 0.25}n/32)`, x: (n) => Math.cos((2 * PI * (m + 0.25) * n) / 32), why: "A quarter bin off: a tall peak with some leakage, not symmetric about one bin." },
    ];
    const sel = R.shuffle(pool).slice(0, 6), extra = pool.filter((p) => !sel.includes(p)).slice(0, 2);
    const ks = Array.from({ length: N }, (_, k) => k);
    const mag = (s) => { const X = dft(ks.map(s.x)).map(cabs); const mx = Math.max(...X); return X.map((v) => v / mx); };
    const ms = matchSet(R, sel.map((s) => ({ ys: mag(s) })), extra.map(mag), (i) => String.fromCharCode(65 + i),
      (lab, ys) => ({ label: lab, kind: "stem", xs: ks, ys, yrange: [0, 1.05], xticks: tick([0, 8, 16, 24, 31]), xlab: "k" }));
    return {
      title: "DFTs of sinusoids: matching",
      statement: `**DFTs of sinusoids.** For each signal, a 32-point DFT is computed over $0\\le n<32$. Each plot shows $|X[k]|$ for $0\\le k<32$, scaled so the peak is 1. Match each signal to its plot.

${sel.map((s, i) => `- $x_${i}[n]=${s.tex}$`).join("\n")}

${fig(panels(ms.panels, 2, 260, 90))}`,
      grids: [{ id: "m", caption: "Plot letter for each signal", rowLabels: sel.map((_, i) => `x${i}`), colLabels: ["plot"], answer: sel.map((_, i) => [ms.answer[i]]), kind: "text" }],
      parts: [],
      solution: sel.map((s, i) => `- $x_${i}[n]=${s.tex}$: **${ms.answer[i]}**. ${s.why}`).join("\n") + `\n\nA real signal has $|X[k]|=|X[32-k]|$. A sinusoid with an integer number of cycles in the window lands on bins; otherwise it leaks.`,
    };
  }

  // ---------------------------------------------------------------- 4. real part of a 12-point DFT matching (Q2 Spring 2022 style)
  function dftRealMatch(R) {
    const N = 12;
    const pool = [
      { tex: "\\delta[n]", x: (n) => +(n === 0) }, { tex: "\\delta[n-1]", x: (n) => +(n === 1) }, { tex: "\\delta[n-3]", x: (n) => +(n === 3) },
      { tex: "\\delta[n-6]", x: (n) => +(n === 6) }, { tex: "1", x: () => 1 }, { tex: "(-1)^n", x: (n) => (n % 2 ? -1 : 1) },
      { tex: "\\cos(\\pi n/3)", x: (n) => Math.cos((PI * n) / 3) }, { tex: "\\sin(\\pi n/3)", x: (n) => Math.sin((PI * n) / 3) },
      { tex: "\\delta[n-1]+\\delta[n-11]", x: (n) => +(n === 1 || n === 11) }, { tex: "\\delta[n]+\\delta[n-6]", x: (n) => +(n === 0 || n === 6) },
      { tex: "1 \\text{ for } 0\\le n<3", x: (n) => +(n < 3) }, { tex: "1 \\text{ for } 0\\le n<6", x: (n) => +(n < 6) },
      { tex: "\\delta[n-2]", x: (n) => +(n === 2) }, { tex: "\\cos(\\pi n/2)", x: (n) => Math.cos((PI * n) / 2) },
    ];
    const sel = R.shuffle(pool).slice(0, 7), extra = pool.filter((p) => !sel.includes(p)).slice(0, 3);
    const ns = Array.from({ length: N }, (_, n) => n);
    const re = (s) => dft(ns.map(s.x)).map((c) => c.re);
    // Each plot is scaled to its own largest |value|, which its y labels show.
    const ms = matchSet(R, sel.map((s) => ({ ys: re(s) })), extra.map(re), (i) => String.fromCharCode(65 + i), (lab, ys) => {
      const m = Math.max(...ys.map((v) => Math.abs(snap(v))));
      const lab2 = (() => { for (const d of [1, 2, 3, 4, 6, 8, 12, 24]) if (Math.abs(m * d - Math.round(m * d)) < 1e-9) return `${Math.round(m * d)}/${d}`.replace(/\/1$/, ""); return m.toFixed(3); })();
      return m ? { label: lab, kind: "stem", xs: ns, ys, yrange: [-m, m], yticks: [[m, lab2], [-m, "-" + lab2]], xticks: tick([0, 6, 11]), xlab: "k" }
        : { label: lab, kind: "stem", xs: ns, ys, yrange: [-1, 1], yticks: [[0, "0"]], xticks: tick([0, 6, 11]), xlab: "k" };
    });
    const sigP = sel.map((s, i) => ({ label: `f${i}`, kind: "stem", xs: ns, ys: ns.map(s.x), yrange: [-1, 1], xticks: tick([0, 6, 11]), xlab: "n" }));
    return {
      title: "DFT matching: real parts",
      statement: `**DFT matching.** Each plot $f_i$ shows samples $n=0$ to $11$ of a signal. Plots A–${String.fromCharCode(64 + ms.panels.length)} show the real part of 12-point DFTs, $\\operatorname{Re}X[k]$ with $X[k]=\\frac1{12}\\sum_{n=0}^{11}f[n]e^{-j2\\pi kn/12}$. Each plot has its own scale, labeled on its axis. Match each signal to the real part of its DFT.

${fig(panels(sigP, 2, 250, 84))}

${fig(panels(ms.panels, 2, 250, 84))}`,
      grids: [{ id: "m", caption: "Plot letter for each signal", rowLabels: sel.map((_, i) => `f${i}`), colLabels: ["plot"], answer: sel.map((_, i) => [ms.answer[i]]), kind: "text" }],
      parts: [],
      solution: sel.map((s, i) => `- $f_${i}[n]=${s.tex}$: **${ms.answer[i]}**. $\\operatorname{Re}X[k]=${re(s).map((v) => nice(v)).join(",\\ ")}$.`).join("\n")
        + "\n\n$\\delta[n-n_0]$ has $\\operatorname{Re}X[k]=\\frac1{12}\\cos(2\\pi kn_0/12)$. A sine has a purely imaginary DFT, so its real part is 0.",
    };
  }

  // ---------------------------------------------------------------- 5. DT convolution
  function dtConv(R) {
    if (R.chance(0.35)) {
      const L = R.int(4, 6), alt = R.chance(0.5);
      const f = Array.from({ length: L }, (_, n) => (alt ? (n % 2 ? -1 : 1) : 1));
      const y = Array(2 * L - 1).fill(0); f.forEach((a, i) => f.forEach((b, j) => { y[i + j] += a * b; }));
      return { title: "Convolving a pulse with itself", statement: `**Self-convolution.** $f[n]=${alt ? "(-1)^n" : "1"}$ for $0\\le n<${L}$ and 0 otherwise. Find $(f*f)[n]$ for $n=0$ to $${2 * L - 2}$.`,
        grids: [{ id: "y", caption: "(f*f)[n]", rowLabels: ["y[n]"], colLabels: y.map((_, n) => String(n)), answer: [y.map(String)], kind: "value" }], parts: [],
        solution: `Slide the flipped copy across: the overlap grows by one sample each step up to $n=${L - 1}$, then shrinks. ${alt ? "Every overlapping pair has the same sign $(-1)^{i}(-1)^{n-i}=(-1)^n$, so the values are $(-1)^n$ times the overlap count." : "Each value is the overlap length."}\n\n$y$ = ${y.join(", ")}.` };
    }
    if (R.chance(0.3)) {
      const a = R.pick([0.5, 0.9, -0.5]), K = R.int(5, 9);
      const y = Array.from({ length: 5 }, (_, n) => (1 - a ** (n + 1)) / (1 - a));
      return { title: "Step response of a geometric system", statement: `**Step input.** An LTI system has unit-sample response $h[n]=(${a})^n u[n]$. The input is the unit step $x[n]=u[n]$. Find $y[0]$ to $y[4]$, and $y[${K}]$.`,
        grids: [], parts: [...y.map((v, n) => ({ q: `$y[${n}]$`, answer: num(v) })), { q: `$y[${K}]$`, answer: num((1 - a ** (K + 1)) / (1 - a)) }],
        solution: `$y[n]=\\sum_{k=0}^{n}a^k=\\dfrac{1-a^{n+1}}{1-a}$ for $n\\ge0$ (a geometric sum) with $a=${a}$. Values: $${y.map(nice).join(",\\ ")}$.` };
    }
    const x = Array.from({ length: R.int(3, 5) }, () => R.int(-2, 3)), h = Array.from({ length: R.int(2, 4) }, () => R.int(-2, 3));
    if (x.every((v) => !v)) x[0] = 1; if (h.every((v) => !v)) h[0] = 1;
    const y = Array(x.length + h.length - 1).fill(0); x.forEach((a, i) => h.forEach((b, j) => { y[i + j] += a * b; }));
    return { title: "DT convolution by superposition", statement: `**Convolution.** $x[n]$ and $h[n]$ are zero outside the samples shown (starting at $n=0$). Find $y[n]=(x*h)[n]$.\n\n| $n$ | ${x.map((_, i) => i).join(" | ")} |\n|---|${x.map(() => "---").join("|")}|\n| $x[n]$ | ${x.join(" | ")} |\n\n| $n$ | ${h.map((_, i) => i).join(" | ")} |\n|---|${h.map(() => "---").join("|")}|\n| $h[n]$ | ${h.join(" | ")} |`,
      grids: [{ id: "y", caption: "y[n] = (x*h)[n]", rowLabels: ["y[n]"], colLabels: y.map((_, n) => String(n)), answer: [y.map(String)], kind: "value" }], parts: [],
      solution: `Add shifted, scaled copies of $x$: $y[n]=\\sum_k h[k]x[n-k]$.\n\n${h.map((hv, k) => `- $h[${k}]x[n-${k}]$: ${y.map((_, n) => (n - k >= 0 && n - k < x.length ? hv * x[n - k] : 0)).join(", ")}`).join("\n")}\n- Sum: **${y.join(", ")}**` };
  }

  // ---------------------------------------------------------------- 6. circular convolution through DFT products (Q2 Fall 2023 style)
  function circConv(R) {
    const a = R.int(1, 5), L = R.int(3, 5), b = a + L - 1;
    const lin = Array(2 * b + 1).fill(0); for (let i = a; i <= b; i++) for (let j = a; j <= b; j++) lin[i + j] += 1;
    const Ns = R.shuffle([2 * b + 1, b + 1 + R.int(0, 2), L + R.int(1, 2), 2 * L + R.int(0, 1)]).slice(0, 2).map((N) => Math.max(N, b + 1));
    const N = Ns[0];
    const g = Array(N).fill(0); lin.forEach((v, n) => { g[n % N] += v; });
    const show = Math.min(N, 6);
    return {
      _cc: { f: (n) => +(n >= a && n <= b), N },
      title: `Circular convolution with N = ${N}`,
      statement: `**Relating transforms.** $f[n]=1$ for $${a}\\le n\\le ${b}$ and 0 otherwise. Let $F_{${N}}[k]$ be the DFT of $f[n]$ with analysis window $N=${N}$ (6.3000 convention, $\\frac1N$ in the analysis equation), and let $g[n]$ be the signal whose ${N}-point DFT is $F_{${N}}[k]\\cdot F_{${N}}[k]$. Find $g[0]$ to $g[${show - 1}]$.`,
      grids: [{ id: "g", caption: `g[n] (fractions like 3/${N} are fine)`, rowLabels: ["g[n]"], colLabels: Array.from({ length: show }, (_, n) => String(n)), answer: [g.slice(0, show).map((v) => num(v / N))], kind: "value" }],
      parts: [],
      solution: `With the $\\frac1N$ analysis convention, a product of DFTs is $\\frac1N$ times the circular convolution: $g[n]=\\frac1{${N}}(f\\circledast_{${N}} f)[n]$.

1. Linear convolution $f*f$ is a triangle from $n=${2 * a}$ to $${2 * b}$, peak $${L}$ at $n=${a + b}$: ${lin.map((v, n) => (v ? `$y[${n}]=${v}$` : "")).filter(Boolean).join(", ")}.
2. Wrap it modulo ${N} (time aliasing): samples at $n\\ge${N}$ add onto $n-${N}$.
3. Divide by ${N}: $g[0..${show - 1}]=$ ${g.slice(0, show).map((v) => `${v}/${N}`).join(", ")}.`,
    };
  }

  // ---------------------------------------------------------------- 7. DT frequency response
  const OMEGAS = [[0, "0"], [PI / 2, "\\pi/2"], [PI, "\\pi"], [PI / 3, "\\pi/3"], [(2 * PI) / 3, "2\\pi/3"], [PI / 4, "\\pi/4"]];
  function freqResp(R) {
    const kind = R.pick(["fir", "fir", "iir", "even"]);
    let H, desc, why, hn; // hn(n): unit-sample response, for the numeric check
    if (kind === "fir") {
      const h = Array.from({ length: R.int(2, 4) }, () => R.int(-2, 2)); if (h.every((v) => !v)) h[0] = 1;
      hn = (n) => h[n] || 0;
      H = (W) => h.reduce((s, v, n) => cadd(s, cscale(cexp(-W * n), v)), C(0));
      const term = (v, n) => `${v === 1 ? "" : v === -1 ? "-" : v}\\delta[n${n ? "-" + n : ""}]`;
      desc = `unit-sample response $h[n]=${h.map((v, n) => (v ? term(v, n) : null)).filter(Boolean).join("+").replace(/\+-/g, "-")}$`;
      why = `$H(\\Omega)=\\sum_n h[n]e^{-j\\Omega n}=${h.map((v, n) => `${v}e^{-j${n}\\Omega}`).join("+").replace(/\+-/g, "-")}$.`;
    } else if (kind === "iir") {
      const a = R.pick([0.5, -0.5, 0.25, 0.75]);
      hn = (n) => a ** n;
      H = (W) => cdiv(C(1), csub(C(1), cscale(cexp(-W), a)));
      desc = `difference equation $y[n]=${a}\\,y[n-1]+x[n]$ (initially at rest)`;
      why = `Take the DTFT of both sides: $Y(1-${a}e^{-j\\Omega})=X$, so $H(\\Omega)=\\dfrac{1}{1-${a}e^{-j\\Omega}}$ (and $h[n]=${a}^n u[n]$).`;
    } else {
      const a = R.pick([0.5, -0.5]);
      hn = (n) => (n % 2 ? 0 : a ** n);
      H = (W) => cdiv(C(1), csub(C(1), cscale(cexp(-2 * W), a * a)));
      desc = `unit-sample response $h[n]=(${a})^n$ for even $n\\ge0$ and 0 otherwise`;
      why = `$H(\\Omega)=\\sum_{m\\ge0}(${a})^{2m}e^{-j2m\\Omega}=\\dfrac{1}{1-${a * a}e^{-j2\\Omega}}$.`;
    }
    const [W0, W0t] = R.pick(OMEGAS.slice(1)), Hw = H(W0), H0 = H(0), Hpi = H(PI);
    const ang = carg(Hw), angAlt = Math.abs(Math.abs(ang) - PI) < 1e-9;
    return {
      _h: { hn, W0 },
      title: "Frequency response of a DT system",
      statement: `**Frequency response.** An LTI system has ${desc}. The input is $x[n]=\\cos(${W0t}\\,n)$ for all $n$, and the output has the form $y[n]=A\\cos(${W0t}\\,n)+B\\sin(${W0t}\\,n)$.`,
      grids: [],
      parts: [
        { q: "$H(0)$ (the DC gain)", answer: num(H0.re) },
        { q: "$H(\\pi)$", answer: num(Hpi.re) },
        { q: `$|H(${W0t})|$`, answer: num(cabs(Hw)) },
        angAlt ? { q: `$\\angle H(${W0t})$ (radians)`, anyOf: [num(PI), num(-PI)] } : { q: `$\\angle H(${W0t})$ (radians, in $(-\\pi,\\pi]$; 0 if $H=0$)`, answer: num(ang) },
        { q: "$A$", answer: num(Hw.re) },
        { q: "$B$", answer: num(-Hw.im) },
      ],
      solution: `${why}

- $H(0)=${nice(H0.re)}$ and $H(\\pi)=${nice(Hpi.re)}$ (both real).
- $H(${W0t})=${ctex(Hw)}$, so $|H|=${nice(cabs(Hw))}$ and $\\angle H=${nice(ang)}$ rad.
- A cosine is an eigen-sum: $\\cos(\\Omega_0n)\\to|H|\\cos(\\Omega_0n+\\angle H)=\\operatorname{Re}\\{H\\}\\cos(\\Omega_0n)-\\operatorname{Im}\\{H\\}\\sin(\\Omega_0n)$. So $A=\\operatorname{Re}H=${nice(Hw.re)}$ and $B=-\\operatorname{Im}H=${nice(-Hw.im)}$.`,
    };
  }

  // ---------------------------------------------------------------- 8. CT cascade of first-order systems (Q2 Spring 2022 style)
  function ctCascade(R) {
    // [tau, omega as TeX, omega*tau, angle of one stage as TeX]
    const [tau, wTex, wt, at] = R.pick([[1, "1", 1, "\\pi/4"], [1, "\\sqrt3", Math.sqrt(3), "\\pi/3"], [1, "1/\\sqrt3", 1 / Math.sqrt(3), "\\pi/6"],
      [0.5, "2", 1, "\\pi/4"], [0.5, "2\\sqrt3", Math.sqrt(3), "\\pi/3"], [2, "1/2", 1, "\\pi/4"], [2, "\\sqrt3/2", Math.sqrt(3), "\\pi/3"]]);
    const k = R.int(1, 3);
    const Cg = (1 + wt * wt) ** (-k / 2), phi = k * Math.atan(wt);
    return {
      title: "Cascaded first-order systems",
      statement: `**Cascade.** Each of $${k}$ identical subsystems satisfies $y_i(t)+${tau}\\,\\frac{d}{dt}y_i(t)=x_i(t)$. They are connected in cascade (the output of one is the input of the next). The input is $x(t)=\\cos(${wTex}\\,t)$ and the output is $y(t)=C\\cos(${wTex}\\,t-\\phi)$.`,
      grids: [],
      parts: [{ q: "$|H_1(\\omega)|$ of one subsystem at this frequency", answer: num((1 + wt * wt) ** -0.5) }, { q: "$C$", answer: num(Cg) },
        Math.abs(phi - PI) < 1e-9 ? { q: "$\\phi$ (radians)", anyOf: [num(PI), num(-PI)] } : { q: "$\\phi$ (radians)", answer: num(phi) }],
      solution: `One subsystem: $H_1(\\omega)=\\dfrac{1}{1+j${tau}\\omega}$. At $\\omega=${wTex}$, $${tau}\\omega=${nice(wt)}$, so $|H_1|=\\frac{1}{\\sqrt{1+${nice(wt * wt)}}}=${nice((1 + wt * wt) ** -0.5)}$ and $\\angle H_1=-\\arctan(${nice(wt)})=-${at}$.

The cascade multiplies frequency responses: $H=H_1^{${k}}$, so $C=|H_1|^{${k}}=${nice(Cg)}$ and $\\phi=${k}\\cdot${at}=${nice(phi)}$ rad.`,
    };
  }

  // ---------------------------------------------------------------- 9. system properties (additive, homogeneous, time-invariant)
  const SYSTEMS = [
    ["y[n]=x[n-2]", 1, 1, 1, "A pure delay."], ["y[n]=n\\,x[n]", 1, 1, 0, "The gain depends on $n$."], ["y[n]=x[n]^2", 0, 0, 1, "Squaring: $(x_1+x_2)^2\\ne x_1^2+x_2^2$ and $(cx)^2\\ne cx^2$."],
    ["y[n]=x[n]+1", 0, 0, 1, "The constant breaks additivity and homogeneity (zero input gives nonzero output)."], ["y[n]=x[-n]", 1, 1, 0, "Time reversal: delaying the input advances the output."],
    ["y[n]=x[2n]", 1, 1, 0, "Downsampling: a delay of 1 at the input is not a delay of 1 at the output."], ["y[n]=\\sin(x[n])", 0, 0, 1, "A nonlinear function applied sample by sample."],
    ["y[n]=(1/2)^n\\,x[n]", 1, 1, 0, "A time-varying gain."], ["y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,d\\tau", 1, 1, 1, "An integrator is LTI (its impulse response is $u(t)$)."],
    ["y(t)=t\\,x(t)", 1, 1, 0, "A time-varying gain."], ["y(t)=x(t)\\cos(5t)", 1, 1, 0, "Modulation is linear but not time-invariant."],
    ["y[n]=\\max(x[n],x[n-1])", 0, 0, 1, "Max is not additive, and $c<0$ breaks homogeneity."], ["y[n]=|x[n]|", 0, 0, 1, "$|-x|\\ne-|x|$ and $|x_1+x_2|\\ne|x_1|+|x_2|$."],
    ["y[n]=x[n]\\,x[n-1]", 0, 0, 1, "A product of input samples is not linear."], ["y[n]=x[n]+x[n-1]+x[n-2]", 1, 1, 1, "A moving sum is LTI."],
    ["y[n]=x[n]-x[n-1]", 1, 1, 1, "A first difference is LTI."], ["y(t)=x(2t)", 1, 1, 0, "Time compression."], ["y(t)=\\frac{d}{dt}x(t)", 1, 1, 1, "A differentiator is LTI."],
    ["y[n]=3", 0, 0, 1, "A constant output: $y_1+y_2=6\\ne3$, but shifting the input does not change it."], ["y[n]=x[n]\\text{ for even }n,\\ 0\\text{ for odd }n", 1, 1, 0, "Linear, but the even/odd pattern is tied to absolute time."],
    ["y[n]=x[0]", 1, 1, 0, "Linear, but always reads the input at time 0."], ["y[n]=x[n]^3", 0, 0, 1, "$(cx)^3=c^3x^3$."],
    ["y[n]=\\sum_{k=-\\infty}^{n}x[k]", 1, 1, 1, "An accumulator is LTI."], ["y[n]=x[n]\\,u[n]", 1, 1, 0, "Gating with $u[n]$ is linear but time-varying."],
    ["y[n]=\\frac{1}{2}y[n-1]+x[n]\\ \\text{(initially at rest)}", 1, 1, 1, "A linear constant-coefficient difference equation at rest is LTI."], ["y[n]=x[n+1]", 1, 1, 1, "An advance is LTI (not causal)."],
  ];
  function sysProps(R) {
    const sel = R.shuffle(SYSTEMS).slice(0, 5);
    const yn = (b) => (b ? "Yes" : "No");
    return {
      title: "System properties",
      statement: "**Systems.** For each system, decide whether it is additive, homogeneous, and time-invariant. Enter Yes or No in each cell.\n\n" + sel.map((s, i) => `${i + 1}. $${s[0]}$`).join("\n\n"),
      grids: [{ id: "p", caption: "Yes or No", rowLabels: sel.map((_, i) => `System ${i + 1}`), colLabels: ["additive", "homogeneous", "time-invariant"], answer: sel.map((s) => [yn(s[1]), yn(s[2]), yn(s[3])]), kind: "text" }],
      parts: [],
      solution: sel.map((s, i) => `${i + 1}. $${s[0]}$: additive **${yn(s[1])}**, homogeneous **${yn(s[2])}**, time-invariant **${yn(s[3])}**. ${s[4]}`).join("\n\n")
        + "\n\nTests: additive if $x_1+x_2\\to y_1+y_2$; homogeneous if $cx\\to cy$ for every constant $c$ (try $c=-1$ and $c=0$); time-invariant if $x[n-n_0]\\to y[n-n_0]$. Any explicit $n$ or $t$ outside the input's argument, or a changed argument ($-n$, $2n$), usually breaks time invariance.",
    };
  }

  // ---------------------------------------------------------------- 10. sampling and aliasing
  function aliasing(R) {
    const fs = R.pick([8000, 10000, 1000, 600]), f0 = R.pick([0.15, 0.3, 0.45, 0.6, 0.85, 1.2, 1.35].map((r) => Math.round(r * fs)));
    let W = (2 * PI * f0) / fs; W = mod(W + PI, 2 * PI) - PI; const Wp = Math.abs(W);
    const frec = (Wp * fs) / (2 * PI);
    const p = R.int(1, 9), q = R.pick([4, 5, 6, 8, 10, 12]), g = gcd(p, q);
    return {
      title: "Sampling and aliasing",
      statement: `**Aliasing.** $x(t)=\\cos(2\\pi\\cdot${f0}\\,t)$ is sampled at $f_s=${fs}$ Hz to give $x[n]=x(n/f_s)$. The samples are then converted back to continuous time by ideal reconstruction (keeping only $|\\Omega|\\le\\pi$).

Separately: what is the fundamental period $N_0$ of $\\cos(2\\pi\\cdot${p}n/${q})$?`,
      grids: [],
      parts: [
        { q: "DT frequency $|\\Omega|$ of $x[n]$ in $[0,\\pi]$ (rad/sample)", answer: num(Wp) },
        { q: "Frequency of the reconstructed cosine (Hz)", answer: num(frec) },
        { q: "Smallest sampling rate that avoids aliasing for $x(t)$ (Hz)", answer: num(2 * f0) },
        { q: "$N_0$", answer: num(q / g) },
      ],
      solution: `$\\Omega=2\\pi f_0/f_s=2\\pi\\cdot${f0}/${fs}$. DT frequencies are only defined modulo $2\\pi$, and $\\cos$ is even, so reduce to $[0,\\pi]$: $|\\Omega|=${nice(Wp)}$. The reconstruction outputs $f=|\\Omega|f_s/(2\\pi)=${nice(frec)}$ Hz${Math.abs(frec - f0) > 1e-6 ? " (aliased)" : " (no aliasing)"}. Nyquist: $f_s>2f_0=${2 * f0}$ Hz.

$\\cos(2\\pi pn/q)$ repeats when $pN/q$ is an integer: $N_0=q/\\gcd(p,q)=${q / g}$.`,
    };
  }

  // ---------------------------------------------------------------- 11. closing sums (Q2 Spring 2022 style)
  function closeSums(R) {
    const N = R.pick([8, 10, 12, 16]), k0 = R.int(1, 3), L = R.int(3, 6);
    const S = (fn) => { let s = C(0); for (let n = 0; n < N; n++) s = cadd(s, cexp(fn(n))); return s; };
    const k1 = R.int(1, N - 1), k2 = N / 2;
    const v1 = S((n) => (-2 * PI * k1 * n) / N), v2 = S((n) => (2 * PI * k0 * n) / N - (2 * PI * k0 * n) / N), v3 = S((n) => (-4 * PI * k2 * n) / N), v4 = S((n) => (2 * PI * k0 * n) / N - (2 * PI * (k0 + 1) * n) / N);
    const W = R.pick([[PI / 2, "\\pi/2"], [PI / 3, "\\pi/3"], [PI, "\\pi"]]); let s5 = C(0); for (let n = 0; n < L; n++) s5 = cadd(s5, cexp(-W[0] * n));
    return {
      title: "Closing geometric sums",
      statement: `**Closing sums.** $N=${N}$. Evaluate each sum (numbers only).`,
      grids: [],
      parts: [
        { q: `$\\sum_{n=0}^{${N - 1}}e^{-j2\\pi\\cdot${k1}n/${N}}$`, answer: num(v1.re) },
        { q: `$\\sum_{n=0}^{${N - 1}}e^{j2\\pi ${k0}n/${N}}e^{-j2\\pi ${k0}n/${N}}$`, answer: num(v2.re) },
        { q: `$\\sum_{n=0}^{${N - 1}}e^{-j4\\pi\\cdot${k2}n/${N}}$`, answer: num(v3.re) },
        { q: `$\\sum_{n=0}^{${N - 1}}e^{j2\\pi ${k0}n/${N}}e^{-j2\\pi ${k0 + 1}n/${N}}$`, answer: num(v4.re) },
        { q: `$\\left|\\sum_{n=0}^{${L - 1}}e^{-j${W[1]}n}\\right|$`, answer: num(cabs(s5)) },
      ],
      solution: `$\\sum_{n=0}^{N-1}e^{-j2\\pi mn/N}=N$ if $m$ is a multiple of $N$, else $\\dfrac{1-e^{-j2\\pi m}}{1-e^{-j2\\pi m/N}}=0$.

- $m=${k1}$: not a multiple of ${N}, so 0.
- The exponents cancel: every term is 1, so $${N}$.
- $m=2\\cdot${k2}=${2 * k2}$, a multiple of ${N}: $${N}$.
- $m=1$: 0.
- A finite sum: $\\left|\\frac{1-e^{-j${L}\\Omega}}{1-e^{-j\\Omega}}\\right|=\\left|\\frac{\\sin(${L}\\Omega/2)}{\\sin(\\Omega/2)}\\right|=${nice(cabs(s5))}$ at $\\Omega=${W[1]}$.`,
    };
  }

  // ---------------------------------------------------------------- 12. CT Fourier series coefficients
  function ctfs(R) {
    const T = R.pick([1, 2, 4]), w0 = (2 * PI) / T;
    const fam = R.pick(["pulse", "pulse", "square", "saw", "tri", "rect", "trig"]);
    let a, desc, why;
    let f; // f(t) on one period, for the numeric check
    if (fam === "pulse") {
      const D = R.pick([0.5, 0.25]), s = R.pick([0, -D / 2]);
      f = (t) => { const u = mod(t / T - s, 1); return +(u < D); };
      a = (k) => (k === 0 ? C(D) : cscale(cexp(-2 * PI * k * (s + D / 2)), Math.sin(PI * k * D) / (PI * k)));
      desc = `in each period, $f(t)=1$ for $${nice(s * T)}\\le t<${nice((s + D) * T)}$ and $0$ for the rest of the period (period $T=${T}$)`;
      why = `$a_k=\\frac1T\\int_{${nice(s * T)}}^{${nice((s + D) * T)}}e^{-jk\\omega_0t}dt=\\dfrac{\\sin(\\pi kD)}{\\pi k}e^{-jk\\omega_0 t_c}$ with duty $D=${D}$ and center $t_c=${nice((s + D / 2) * T)}$; $a_0=D=${D}$.`;
    } else if (fam === "square") {
      f = (t) => (mod(t / T, 1) < 0.5 ? 1 : -1);
      a = (k) => (k % 2 ? cdiv(C(2), C(0, PI * k)) : C(0));
      desc = `$f(t)=1$ for $0<t<${nice(T / 2)}$ and $f(t)=-1$ for $${nice(T / 2)}<t<${T}$ (period $T=${T}$)`;
      why = "$a_0=0$ (the average is 0). For $k\\ne0$: $a_k=\\frac1T\\left[\\int_0^{T/2}e^{-jk\\omega_0t}dt-\\int_{T/2}^{T}e^{-jk\\omega_0t}dt\\right]=\\dfrac{1-(-1)^k}{j\\pi k}$, which is $\\dfrac{2}{j\\pi k}$ for odd $k$ and 0 for even $k$. The signal is real and odd, so the coefficients are purely imaginary.";
    } else if (fam === "saw") {
      f = (t) => mod(t / T, 1);
      a = (k) => (k === 0 ? C(0.5) : C(0, 1 / (2 * PI * k)));
      desc = `$f(t)=t/${T}$ for $0\\le t<${T}$, repeated with period $T=${T}$ (a sawtooth from 0 to 1)`;
      why = "Integrate by parts: $a_k=\\frac1T\\int_0^T\\frac tTe^{-jk\\omega_0t}dt=\\dfrac{j}{2\\pi k}$ for $k\\ne0$, and $a_0=\\frac12$.";
    } else if (fam === "tri") {
      f = (t) => { const u = mod(t / T + 0.5, 1) - 0.5; return 1 - 2 * Math.abs(u); };
      a = (k) => (k === 0 ? C(0.5) : C(k % 2 ? 2 / (PI * PI * k * k) : 0));
      desc = `a triangle wave: $f(t)=1-\\frac{|t|}{${nice(T / 2)}}$ for $|t|\\le${nice(T / 2)}$, repeated with period $T=${T}$`;
      why = "The triangle is the integral of a square wave, so $a_k\\propto1/k^2$: $a_k=\\dfrac{2}{\\pi^2k^2}$ for odd $k$, 0 for even $k\\ne0$, $a_0=\\frac12$ (real, since $f$ is even).";
    } else if (fam === "rect") {
      f = (t) => Math.abs(Math.sin((PI * t) / T));
      a = (k) => C(2 / (PI * (1 - 4 * k * k)));
      desc = `$f(t)=|\\sin(\\pi t/${T})|$ (a full-wave rectified sine with period $T=${T}$)`;
      why = "$a_k=\\frac1T\\int_0^T\\sin(\\pi t/T)e^{-j2\\pi kt/T}dt=\\dfrac{2}{\\pi(1-4k^2)}$: real (even signal), $a_0=\\frac2\\pi$.";
    } else {
      const A = R.int(1, 4), B = R.int(1, 4), k1 = R.int(1, 2), k2 = k1 === 1 ? 3 : 1, ph = R.pick([[0, "0"], [PI / 2, "\\pi/2"], [PI / 3, "\\pi/3"]]);
      f = (t) => A * Math.cos(k1 * w0 * t + ph[0]) + B * Math.sin(k2 * w0 * t);
      a = (k) => (Math.abs(k) === k1 ? cscale(cexp(Math.sign(k) * ph[0]), A / 2) : k === k2 ? C(0, -B / 2) : k === -k2 ? C(0, B / 2) : C(0));
      desc = `$f(t)=${A}\\cos(${k1}\\omega_0t+${ph[1]})+${B}\\sin(${k2}\\omega_0t)$ with $\\omega_0=2\\pi/${T}$`;
      why = `Use Euler: $\\cos\\theta=\\frac{e^{j\\theta}+e^{-j\\theta}}2$ and $\\sin\\theta=\\frac{e^{j\\theta}-e^{-j\\theta}}{2j}$. So $a_{\\pm${k1}}=\\frac{${A}}2e^{\\pm j${ph[1]}}$ and $a_{${k2}}=\\frac{${B}}{2j}$, $a_{-${k2}}=-\\frac{${B}}{2j}$.`;
    }
    const ks = [0, 1, 2, 3];
    const parts = ks.flatMap((k) => [{ q: `$\\operatorname{Re}\\,a_{${k}}$`, answer: num(a(k).re) }, { q: `$\\operatorname{Im}\\,a_{${k}}$`, answer: num(a(k).im) }]);
    parts.push({ q: "Trig-form coefficient $c_1$ in $f(t)=c_0+\\sum_k c_k\\cos(k\\omega_0t)+d_k\\sin(k\\omega_0t)$", answer: num(2 * a(1).re) }, { q: "$d_1$", answer: num(-2 * a(1).im) });
    return {
      _ct: { T, f },
      title: "CT Fourier series coefficients",
      statement: `**Fourier series.** A periodic signal is ${desc}. Find the complex Fourier series coefficients $a_k=\\frac1T\\int_T f(t)e^{-jk\\omega_0t}dt$ for $k=0$ to $3$ (real and imaginary parts), and the trig-form coefficients $c_1$, $d_1$.`,
      grids: [],
      parts,
      solution: `${why}

${ks.map((k) => `- $a_{${k}}=${ctex(a(k))}$`).join("\n")}
- Trig form: $c_k=2\\operatorname{Re}a_k$ and $d_k=-2\\operatorname{Im}a_k$, so $c_1=${nice(2 * a(1).re)}$, $d_1=${nice(-2 * a(1).im)}$.`,
    };
  }

  // ---------------------------------------------------------------- 13. CTFT and DTFT values
  function ftValues(R) {
    if (R.chance(0.5)) {
      const a = R.int(0, 2), b = a + R.int(1, 2), [W, Wt] = R.pick([[PI / 2, "\\pi/2"], [PI / 4, "\\pi/4"], [1, "1"], [PI, "\\pi"]]);
      const Fw = (w) => (a === 0 ? 2 * b * sinc(b * w) : 2 * (b * sinc(b * w) - a * sinc(a * w)));
      const desc = a === 0 ? `$f(t)=1$ for $|t|<${b}$ and 0 otherwise` : `$f(t)=1$ for $${a}<|t|<${b}$ and 0 otherwise`;
      const sh = R.int(1, 3);
      return { title: "CT Fourier transform values", statement: `**CTFT.** ${desc}. Its transform is real because $f$ is real and even. Let $g(t)=f(t-${sh})$.`, grids: [],
        parts: [{ q: "$F(0)$", answer: num(Fw(0)) }, { q: `$F(${Wt})$`, answer: num(Fw(W)) }, { q: `$|G(${Wt})|$`, answer: num(Math.abs(Fw(W))) }, { q: `$\\operatorname{Re}\\,G(${Wt})$`, answer: num(Fw(W) * Math.cos(sh * W)) }],
        solution: `${a === 0 ? `$F(\\omega)=\\int_{-${b}}^{${b}}e^{-j\\omega t}dt=\\dfrac{2\\sin(${b}\\omega)}{\\omega}$.` : `$f$ is a wide pulse minus a narrow one: $F(\\omega)=\\dfrac{2\\sin(${b}\\omega)}{\\omega}-\\dfrac{2\\sin(${a}\\omega)}{\\omega}$.`} $F(0)$ is the area: $${nice(Fw(0))}$. $F(${Wt})=${nice(Fw(W))}$.

A delay multiplies by $e^{-j${sh}\\omega}$: $|G|=|F|=${nice(Math.abs(Fw(W)))}$ and $\\operatorname{Re}G=F\\cos(${sh}\\omega)=${nice(Fw(W) * Math.cos(sh * W))}$.` };
    }
    const n1 = R.int(-2, 5), n2 = n1 + R.int(2, 5);
    let s = [C(0), C(0), C(0)]; [0, PI / 2, PI].forEach((W, i) => { for (let n = n1; n <= n2; n++) s[i] = cadd(s[i], cexp(-W * n)); });
    return { title: "DTFT values", statement: `**DTFT.** $f[n]=1$ for $${n1}\\le n\\le ${n2}$ and 0 otherwise. Evaluate its DTFT $F(\\Omega)=\\sum_n f[n]e^{-j\\Omega n}$.`, grids: [],
      parts: [{ q: "$F(0)$", answer: num(s[0].re) }, { q: "$\\operatorname{Re}F(\\pi/2)$", answer: num(s[1].re) }, { q: "$\\operatorname{Im}F(\\pi/2)$", answer: num(s[1].im) }, { q: "$F(\\pi)$", answer: num(s[2].re) }],
      solution: `$F(0)=\\sum f[n]=${n2 - n1 + 1}$. At $\\Omega=\\pi/2$, $e^{-j\\pi n/2}=(-j)^n$ cycles through $1,-j,-1,j$: the sum is $${ctex(s[1])}$. At $\\Omega=\\pi$, $e^{-j\\pi n}=(-1)^n$: the sum is $${nice(s[2].re)}$.` };
  }

  // ---------------------------------------------------------------- 14. inverse DTFT of trig polynomials (Q2 Fall 2023 style)
  function dtftInverse(R) {
    // A Laurent polynomial is a map n -> coefficient of e^{-jΩn}.
    const mul = (p, q) => { const r = {}; for (const a in p) for (const b in q) { const n = +a + +b; r[n] = (r[n] || 0) + p[a] * q[b]; } return r; };
    const facs = [
      () => { const m = R.int(1, 3); return { tex: `\\cos(${m}\\Omega)`, p: { [-m]: 0.5, [m]: 0.5 } }; },
      () => { const m = R.int(1, 2); return { tex: `j\\sin(${m}\\Omega)`, p: { [-m]: 0.5, [m]: -0.5 } }; },
      () => { const d = R.int(1, 2); return { tex: `e^{-j${d}\\Omega}`, p: { [d]: 1 } }; },
      () => ({ tex: "\\cos^2(\\Omega)", p: { [-2]: 0.25, 0: 0.5, 2: 0.25 } }),
      () => { const c = R.int(1, 2); return { tex: `(${c}+\\cos\\Omega)`, p: { [-1]: 0.5, 0: c, 1: 0.5 } }; },
    ];
    const f1 = R.pick(facs)(), f2 = R.chance(0.6) ? R.pick(facs)() : { tex: "", p: { 0: 1 } };
    const p = mul(f1.p, f2.p), ns = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    if (Object.keys(p).some((n) => Math.abs(+n) > 4)) return dtftInverse(R);
    const vals = ns.map((n) => num(p[n] || 0));
    return { title: "Inverse DTFT by inspection", statement: `**Finding time.** A DT signal has DTFT $F(\\Omega)=${f1.tex}${f2.tex ? "\\," + f2.tex : ""}$. Find $f[n]$ for $-4\\le n\\le4$.`,
      grids: [{ id: "f", caption: "f[n] (fractions like 1/4 are fine)", rowLabels: ["f[n]"], colLabels: ns.map(String), answer: [vals], kind: "value" }], parts: [],
      solution: `Write each factor with exponentials: $e^{-j\\Omega n}$ is the transform of $\\delta[n-n_0]$ with $n_0=n$. So $\\cos(m\\Omega)=\\frac12e^{jm\\Omega}+\\frac12e^{-jm\\Omega}\\leftrightarrow\\frac12\\delta[n+m]+\\frac12\\delta[n-m]$, $j\\sin(m\\Omega)\\leftrightarrow\\frac12\\delta[n+m]-\\frac12\\delta[n-m]$, and $e^{-jd\\Omega}$ is a delay by $d$. Multiplying the factors convolves the sample sets.\n\n${ns.filter((n) => p[n]).map((n) => `$f[${n}]=${nice(p[n])}$`).join(", ")}; all others are 0.` };
  }

  // ---------------------------------------------------------------- 15. amplitude modulation
  function modulation(R) {
    const W = R.pick([1000, 2000, 3000, 5000]) * 2 * PI, wc = R.pick([10, 20, 25]) * 1000 * 2 * PI, k = (v) => num(v / (2 * PI * 1000));
    return { title: "Amplitude modulation", statement: `**AM.** $x(t)$ is real with $X(\\omega)=0$ for $|\\omega|>${k(W)}\\cdot2\\pi\\cdot10^3$ rad/s. It is transmitted as $y(t)=x(t)\\cos(\\omega_ct)$ with $\\omega_c=${k(wc)}\\cdot2\\pi\\cdot10^3$ rad/s. The receiver forms $z(t)=y(t)\\cos(\\omega_ct)$ and passes it through an ideal low-pass filter with gain $G$ and cutoff $\\omega_{co}$ to recover $x(t)$. Give frequencies in units of $2\\pi\\cdot10^3$ rad/s (kHz).`, grids: [],
      parts: [{ q: "Lowest positive frequency where $Y(\\omega)\\ne0$ (kHz)", answer: k(wc - W) }, { q: "Highest frequency where $Y(\\omega)\\ne0$ (kHz)", answer: k(wc + W) },
        { q: "Filter gain $G$", answer: "2" }, { q: "Smallest valid cutoff (kHz)", answer: k(W) }, { q: "Largest valid cutoff (kHz)", answer: k(2 * wc - W) },
        { q: "Smallest carrier frequency $\\omega_c$ (kHz) for which the copies of $X$ in $Y$ do not overlap", answer: k(W) }],
      solution: `$Y(\\omega)=\\frac12X(\\omega-\\omega_c)+\\frac12X(\\omega+\\omega_c)$: copies of $X$ centered at $\\pm\\omega_c$, occupying $\\omega_c-W\\le|\\omega|\\le\\omega_c+W$.

$z(t)=x(t)\\cos^2(\\omega_ct)=\\frac12x(t)+\\frac12x(t)\\cos(2\\omega_ct)$: a half-size copy at baseband and copies at $\\pm2\\omega_c$ (from $2\\omega_c-W$ up). The filter needs gain $2$ and a cutoff between $W$ and $2\\omega_c-W$. The copies at $\\pm\\omega_c$ do not overlap if $\\omega_c\\ge W$.` };
  }

  // ---------------------------------------------------------------- 16. DFT and resolution numbers
  function dftNumbers(R) {
    if (R.chance(0.5)) {
      const fs = R.pick([8000, 16000, 44100, 1000]), N = R.pick([256, 512, 1000, 1024, 2000]), kf = R.int(3, 40), f = (kf * fs) / N;
      return { title: "DFT frequency bins", statement: `**DFT bins.** A signal sampled at $f_s=${fs}$ Hz is analyzed with an $N=${N}$ point DFT.`, grids: [],
        parts: [{ q: "Bin spacing (Hz)", answer: num(fs / N) }, { q: "Window duration (s)", answer: num(N / fs) }, { q: `Index $k$ in $0\\le k<N$ of the bin at ${nice(f)} Hz`, answer: String(kf) },
          { q: `The other bin where a real cosine at ${nice(f)} Hz shows up`, answer: String(N - kf) }, { q: "Frequency of bin $k=1$ in rad/sample ($\\Omega$)", answer: num((2 * PI) / N) }],
        solution: `Bin $k$ is at $\\Omega_k=2\\pi k/N$, i.e. $f_k=kf_s/N$. Spacing $f_s/N=${nice(fs / N)}$ Hz; duration $N/f_s=${nice(N / fs)}$ s. A real cosine at $f$ has bins $k=fN/f_s=${kf}$ and $N-k=${N - kf}$ (the negative frequency). Better frequency resolution needs a longer window (larger $N$ of real data; zero padding only interpolates).` };
    }
    const N = R.pick([4, 6, 8]), x = Array.from({ length: N }, () => R.int(-2, 3)); const X = dft(x);
    const k1 = R.int(1, N / 2 - 1), E = x.reduce((s, v) => s + v * v, 0);
    return { title: "Computing a small DFT", statement: `**Small DFT.** $x[n]$ for $n=0,\\dots,${N - 1}$ is ${x.join(", ")}. Use $X[k]=\\frac1N\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}$ with $N=${N}$.`, grids: [],
      parts: [{ q: "$X[0]$", answer: num(X[0].re) }, { q: `$X[${N / 2}]$`, answer: num(X[N / 2].re) }, { q: `$\\operatorname{Re}X[${k1}]$`, answer: num(X[k1].re) }, { q: `$\\operatorname{Im}X[${k1}]$`, answer: num(X[k1].im) },
        { q: `$\\operatorname{Im}X[${N - k1}]$`, answer: num(X[N - k1].im) }, { q: "$\\sum_k|X[k]|^2$", answer: num(E / N) }],
      solution: `$X[0]$ is the average: $${nice(X[0].re)}$. $X[N/2]=\\frac1N\\sum(-1)^nx[n]=${nice(X[N / 2].re)}$. $X[${k1}]=${ctex(X[k1])}$. For real $x$, $X[N-k]=X^*[k]$, so $\\operatorname{Im}X[${N - k1}]=${nice(X[N - k1].im)}$. Parseval with this convention: $\\sum_k|X[k]|^2=\\frac1N\\sum_n|x[n]|^2=${nice(E / N)}$.` };
  }

  // ---------------------------------------------------------------- 17. true / false
  const FACTS = [
    ["Delaying a signal changes the magnitude of its Fourier transform.", false, "A delay multiplies by $e^{-j\\omega t_0}$, which has magnitude 1."],
    ["Convolution in time corresponds to multiplication in frequency.", true, "The convolution property."],
    ["Multiplying a signal by $\\cos(\\omega_c t)$ shifts copies of its spectrum to $\\pm\\omega_c$, each scaled by $\\frac12$.", true, "Modulation property."],
    ["A real-valued signal has $X(-\\omega)=X^*(\\omega)$.", true, "Conjugate symmetry."],
    ["A real, even signal has a purely imaginary Fourier transform.", false, "Real and even gives real and even; real and odd gives imaginary and odd."],
    ["The DTFT $X(\\Omega)$ is periodic in $\\Omega$ with period $2\\pi$.", true, "$e^{-j(\\Omega+2\\pi)n}=e^{-j\\Omega n}$."],
    ["The DFT of a length-$N$ signal gives $N$ equally spaced samples of its DTFT on $[0,2\\pi)$ (times $\\frac1N$ in 6.3000).", true, "$X[k]=\\frac1N X(2\\pi k/N)$."],
    ["Zero-padding before a DFT improves the ability to resolve two close frequencies.", false, "It only samples the same DTFT more densely; resolution needs a longer window of real data."],
    ["Multiplying two $N$-point DFTs gives the DFT of the linear convolution of the signals.", false, "It gives circular convolution (times $\\frac1N$ in 6.3000). It equals linear convolution only if $N\\ge$ the linear result's length."],
    ["Stretching a signal in time ($f(t/2)$) makes its spectrum narrower and taller.", true, "$f(t/a)\\leftrightarrow|a|F(a\\omega)$."],
    ["Complex exponentials $e^{j\\omega t}$ are eigenfunctions of LTI systems.", true, "The output is $H(\\omega)e^{j\\omega t}$."],
    ["A system that is additive is always homogeneous.", false, "For real scalars, additivity gives homogeneity for rational $c$ only; the course treats them as separate checks."],
    ["$y[n]=x[n]+1$ is a linear system.", false, "Zero input gives a nonzero output."],
    ["The unit-sample response of a cascade of two LTI systems is the convolution of their unit-sample responses.", true, "$h=h_1*h_2$, and the order does not matter."],
    ["Sampling $\\cos(2\\pi\\cdot 700t)$ at 1000 Hz gives the same samples as $\\cos(2\\pi\\cdot300t)$.", true, "$700=1000-300$ aliases to 300 Hz."],
    ["The Fourier series coefficient $a_0$ is the average value of the signal over one period.", true, "$a_0=\\frac1T\\int_T f(t)dt$."],
    ["$e^{j\\Omega_0 n}$ is periodic for every $\\Omega_0$.", false, "Only when $\\Omega_0/2\\pi$ is rational."],
    ["The magnitude of $\\frac{1}{1-ae^{-j\\Omega}}$ with $0<a<1$ is largest at $\\Omega=0$.", true, "A low-pass response: $\\frac1{1-a}$ at 0 and $\\frac1{1+a}$ at $\\pi$."],
    ["$t\\,f(t)$ has Fourier transform $j\\,\\frac{dF(\\omega)}{d\\omega}$.", true, "Differentiate the analysis integral with respect to $\\omega$."],
    ["The frequency response of an LTI system is the Fourier transform of its impulse response.", true, "$H(\\omega)=\\int h(t)e^{-j\\omega t}dt$."],
    ["Circular convolution of two length-4 signals with $N=7$ equals their linear convolution.", true, "The linear result has length 7, so nothing wraps."],
    ["Time reversal $x[-n]$ gives DFT/DTFS coefficients $X[-k]$.", true, "Flip property."],
  ];
  function facts(R) {
    const qs = R.shuffle(FACTS).slice(0, 8);
    return { title: "True or false", statement: "**True or false.** Answer each with true or false.", grids: [],
      parts: qs.map(([q, a]) => ({ q, accept: a ? ["true", "t", "yes"] : ["false", "f", "no"] })),
      solution: qs.map(([q, a, why]) => `- ${q} **${a ? "True" : "False"}.** ${why}`).join("\n") };
  }

  // ---------------------------------------------------------------- registry
  const DRILLS = {
    s_dtfsmatch: { name: "DT Fourier series matching", blurb: "Match periodic signals to plots of |X[k]| and ∠X[k] (impulses, pulses, cosines, sines, differences).", gen: dtfsMatch },
    s_ftmatch: { name: "Fourier transform properties", blurb: "Match f(t/2), f(2t), f(t−d), t·f(t), f*f, and modulated pulses to magnitude plots (Quiz 2 Spring 2025 style).", gen: ftMatch },
    s_dftsin: { name: "DFTs of sinusoids", blurb: "Match cosines on and off DFT bins, cos², cos³, and modulated cosines to 32-point DFT magnitudes (Fall 2022 style).", gen: dftSinMatch },
    s_dftreal: { name: "DFT matching: real parts", blurb: "Match impulses, pulses, and sinusoids to the real part of their 12-point DFTs (Spring 2022 style).", gen: dftRealMatch },
    s_ctfs: { name: "CT Fourier series", blurb: "Complex coefficients a₀…a₃ and trig-form c₁, d₁ for pulses, square, sawtooth, triangle, rectified sine, and sums of sinusoids.", gen: ctfs },
    s_ftvalues: { name: "CTFT and DTFT values", blurb: "Evaluate transforms of pulses at given frequencies, with delays (Spring 2022 and Fall 2023 style).", gen: ftValues },
    s_dtftinv: { name: "Inverse DTFT by inspection", blurb: "Turn products of cos, j·sin, and delays into samples f[n].", gen: dtftInverse },
    s_closesum: { name: "Closing sums", blurb: "Geometric sums of complex exponentials: when they equal N and when they vanish.", gen: closeSums },
    s_alias: { name: "Sampling and aliasing", blurb: "DT frequency after sampling, reconstructed frequency, Nyquist rate, and DT periods.", gen: aliasing },
    s_sysprops: { name: "System properties", blurb: "Additive? Homogeneous? Time-invariant? For a table of systems (every past Quiz 2 has one).", gen: sysProps },
    s_dtconv: { name: "DT convolution", blurb: "Convolution by superposition, self-convolution of pulses, and step responses.", gen: dtConv },
    s_circconv: { name: "Circular convolution via DFTs", blurb: "g whose DFT is F[k]·F[k] for several N: linear convolution, wrap, and divide by N (Fall 2023 style).", gen: circConv },
    s_freqresp: { name: "DT frequency response", blurb: "H(0), H(π), |H|, ∠H, and the A cos + B sin output for FIR and IIR systems.", gen: freqResp },
    s_cascade: { name: "CT cascades", blurb: "Gain and phase of cascaded first-order systems driven by a cosine (Spring 2022 style).", gen: ctCascade },
    s_am: { name: "Amplitude modulation", blurb: "Where the AM spectrum lives, the demodulator filter gain and cutoff range, and the minimum carrier.", gen: modulation },
    s_dftnum: { name: "DFT computations", blurb: "Bin spacing, bin indices, small DFTs by hand, conjugate symmetry, and Parseval.", gen: dftNumbers },
    s_facts: { name: "True or false", blurb: "Quick checks on transform properties, LTI systems, sampling, and the DFT.", gen: facts },
  };
  function generate(type, seed) { figSeq = 0; return Object.assign({ type, seed }, DRILLS[type].gen(rng(seed))); }
  const intro = "Each drill makes a new problem from a random seed, for 6.3000 Quiz 2 (everything up to Oct 29 and HW8). The matching drills draw their plots from the actual transforms, like the matching problems on past quizzes. Conventions follow 6.3000: Fourier series and DFT analysis carry 1/T or 1/N. Enter numbers or expressions such as 1/pi, sqrt(2)/2, or -3/8. The link of a drill keeps its seed.";

  root.Drills6300 = { DRILLS, generate, rng, intro, _dft: dft, _systems: SYSTEMS, _panels: panels, _cabs: cabs };
})(typeof window !== "undefined" ? window : globalThis);
