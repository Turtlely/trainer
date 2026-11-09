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
    for (const d of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 20, 24, 27, 32, 64, 81, 128]) { const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9) return `${Math.round(n)}/${d}`; }
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
    const L = p.padL || 22; // left margin (room for y labels)
    const X = (x) => x0 + L + ((x - xmin) / (xmax - xmin || 1)) * (w - L - 12);
    const Y = (y) => y0 + 14 + (1 - (y - lo) / (hi - lo || 1)) * (h - 34);
    let s = F.t(x0 + w - 4, y0 + 8, p.label, { a: "end", b: true, s: 12 }); // top right, clear of the y labels
    s += F.line([[X(xmin) - 6, Y(0)], [X(xmax) + 6, Y(0)]], { c: "mut" });
    if (p.kind === "line") {
      s += `<polyline class="ln acc" points="${p.xs.map((x, i) => `${X(x).toFixed(1)},${Y(p.ys[i]).toFixed(1)}`).join(" ")}" stroke-width="1.6"/>`;
    } else {
      p.xs.forEach((x, i) => { const y = snap(p.ys[i]); s += F.line([[X(x), Y(0)], [X(x), Y(y)]], { c: "acc" }); s += `<circle class="fill acc" cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="2.3"/>`; });
    }
    for (const xt of p.xticks || []) s += F.t(X(xt[0]), y0 + h - 8, xt[1], { s: 9, c: "mut" });
    for (const yt of p.yticks || []) s += F.t(x0 + L - 4, Y(yt[0]), yt[1], { s: 9, c: "mut", a: "end" });
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

  // nice() with a/b written as \tfrac{a}{b}, for coefficients inside TeX.
  const nf = (v) => nice(v).replace(/^(-?)(\d+)\/(\d+)$/, "$1\\tfrac{$2}{$3}");
  // ---------------------------------------------------------------- 9. systems
  // Each entry: [tex, additive, homogeneous, time-invariant, why, causal, memoryless, BIBO stable, why (last three)].
  // scripts/check-drills-6300.js implements every system and tests all six properties numerically.
  const SYSTEMS = [
    ["y[n]=x[n-2]", 1, 1, 1, "A pure delay.", 1, 0, 1, "It uses the input from 2 samples back (memory), but no future input. $|y|\\le B$ when $|x|\\le B$."],
    ["y[n]=n\\,x[n]", 1, 1, 0, "The gain depends on $n$.", 1, 1, 0, "Each output uses only $x[n]$. The bounded input $x=1$ gives $y=n$, which is unbounded."],
    ["y[n]=x[n]^2", 0, 0, 1, "Squaring: $(x_1+x_2)^2\\ne x_1^2+x_2^2$ and $(cx)^2\\ne cx^2$.", 1, 1, 1, "$|x|\\le B$ gives $|y|\\le B^2$."],
    ["y[n]=x[n]+1", 0, 0, 1, "The constant breaks additivity and homogeneity (zero input gives nonzero output).", 1, 1, 1, "$|y|\\le B+1$."],
    ["y[n]=x[-n]", 1, 1, 0, "Time reversal: delaying the input advances the output.", 0, 0, 1, "$y[-3]=x[3]$ uses a future input."],
    ["y[n]=x[2n]", 1, 1, 0, "Downsampling: a delay of 1 at the input is not a delay of 1 at the output.", 0, 0, 1, "$y[1]=x[2]$ uses a future input."],
    ["y[n]=\\sin(x[n])", 0, 0, 1, "A nonlinear function applied sample by sample.", 1, 1, 1, "$|y|\\le1$."],
    ["y[n]=(1/2)^n\\,x[n]", 1, 1, 0, "A time-varying gain.", 1, 1, 0, "For $n<0$ the gain is $2^{|n|}$, so $x=1$ gives an unbounded output."],
    ["y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,d\\tau", 1, 1, 1, "An integrator is LTI (its impulse response is $u(t)$).", 1, 0, 0, "It uses all past inputs. $x=u(t)$ gives the ramp $t\\,u(t)$."],
    ["y(t)=t\\,x(t)", 1, 1, 0, "A time-varying gain.", 1, 1, 0, "$x=1$ gives $y=t$."],
    ["y(t)=x(t)\\cos(5t)", 1, 1, 0, "Modulation is linear but not time-invariant.", 1, 1, 1, "$|y|\\le|x|$."],
    ["y[n]=\\max(x[n],x[n-1])", 0, 0, 1, "Max is not additive, and $c<0$ breaks homogeneity.", 1, 0, 1, "It needs $x[n-1]$. $|y|\\le B$."],
    ["y[n]=|x[n]|", 0, 0, 1, "$|-x|\\ne-|x|$ and $|x_1+x_2|\\ne|x_1|+|x_2|$.", 1, 1, 1, "$|y|\\le B$."],
    ["y[n]=x[n]\\,x[n-1]", 0, 0, 1, "A product of input samples is not linear.", 1, 0, 1, "It needs $x[n-1]$. $|y|\\le B^2$."],
    ["y[n]=x[n]+x[n-1]+x[n-2]", 1, 1, 1, "A moving sum is LTI.", 1, 0, 1, "$\\sum|h|=3$, so $|y|\\le3B$."],
    ["y[n]=x[n]-x[n-1]", 1, 1, 1, "A first difference is LTI.", 1, 0, 1, "$\\sum|h|=2$."],
    ["y(t)=x(2t)", 1, 1, 0, "Time compression.", 0, 0, 1, "$y(1)=x(2)$ uses a future input."],
    ["y(t)=\\frac{d}{dt}x(t)", 1, 1, 1, "A differentiator is LTI.", 1, 0, 0, "A derivative needs input values near $t$, so it has memory. The bounded input $\\sin(t^2)$ gives $2t\\cos(t^2)$, which is unbounded."],
    ["y[n]=3", 0, 0, 1, "A constant output: $y_1+y_2=6\\ne3$, but shifting the input does not change it.", 1, 1, 1, "The output ignores the input."],
    ["y[n]=x[n]\\text{ for even }n,\\ 0\\text{ for odd }n", 1, 1, 0, "Linear, but the even/odd pattern is tied to absolute time.", 1, 1, 1, "Each output uses only $x[n]$."],
    ["y[n]=x[0]", 1, 1, 0, "Linear, but always reads the input at time 0.", 0, 0, 1, "$y[-5]=x[0]$ uses a future input."],
    ["y[n]=x[n]^3", 0, 0, 1, "$(cx)^3=c^3x^3$.", 1, 1, 1, "$|y|\\le B^3$."],
    ["y[n]=\\sum_{k=-\\infty}^{n}x[k]", 1, 1, 1, "An accumulator is LTI.", 1, 0, 0, "$h[n]=u[n]$ is not absolutely summable: $x=u[n]$ gives $(n+1)u[n]$."],
    ["y[n]=x[n]\\,u[n]", 1, 1, 0, "Gating with $u[n]$ is linear but time-varying.", 1, 1, 1, "$|y|\\le B$."],
    ["y[n]=\\frac{1}{2}y[n-1]+x[n]\\ \\text{(initially at rest)}", 1, 1, 1, "A linear constant-coefficient difference equation at rest is LTI.", 1, 0, 1, "$h[n]=(1/2)^nu[n]$ and $\\sum|h|=2$."],
    ["y[n]=x[n+1]", 1, 1, 1, "An advance is LTI (not causal).", 0, 0, 1, "It uses the next input."],
    ["y[n]=(-2)^n\\big(x[n]-1\\big)", 0, 0, 0, "The $-1$ breaks linearity (zero input gives a nonzero output), and the gain $(-2)^n$ depends on $n$.", 1, 1, 0, "$x=0$ gives $y=-(-2)^n$, which is unbounded."],
    ["y[n]=e^{x[n]}", 0, 0, 1, "$e^{x_1+x_2}=e^{x_1}e^{x_2}$, a product, not a sum. Zero input gives 1.", 1, 1, 1, "$|y|\\le e^B$."],
    ["y[n]=(-1)^n\\,x[n]", 1, 1, 0, "Multiplying by $(-1)^n=\\cos(\\pi n)$ is modulation: linear, not time-invariant.", 1, 1, 1, "$|y|=|x|$."],
    ["y[n]=\\sqrt[3]{x[n]^3+x[n-1]^3}", 0, 1, 1, "Homogeneous ($\\sqrt[3]{c^3(\\cdot)}=c\\sqrt[3]{\\cdot}$) but not additive. Homogeneity alone does not make a system linear.", 1, 0, 1, "It needs $x[n-1]$. $|y|\\le\\sqrt[3]{2}\\,B$."],
    ["y[n]=x[n]+n", 0, 0, 0, "The added $n$ is there for zero input, and it does not shift with the input.", 1, 1, 0, "$x=0$ gives $y=n$."],
    ["y[n]=(x*x)[n]=\\sum_k x[k]\\,x[n-k]", 0, 0, 0, "Doubling $x$ quadruples $y$. Delaying $x$ by $n_0$ delays $x*x$ by $2n_0$.", 0, 0, 0, "$y[0]$ uses $x[k]$ for every $k$. $x=1$ gives an infinite sum."],
    ["y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]", 1, 1, 1, "The output is one constant for all $n$, and shifting $x$ does not change the sum, so it is time-invariant.", 0, 0, 0, "Every output uses every input. $x=1$ gives an infinite sum."],
    ["y[n]=x[n+1]-x[n-1]", 1, 1, 1, "A central difference is LTI.", 0, 0, 1, "It uses $x[n+1]$."],
    ["y(t)=x(t)+x(t-1)", 1, 1, 1, "An echo is LTI: $h(t)=\\delta(t)+\\delta(t-1)$.", 1, 0, 1, "$|y|\\le2B$."],
    ["y(t)=x(t^2)", 1, 1, 0, "The argument $t^2$ distorts time.", 0, 0, 1, "$y(2)=x(4)$ uses a future input."],
    ["y(t)=\\frac{d}{dt}x(t)+2x(t)", 1, 1, 1, "A linear constant-coefficient differential equation is LTI.", 1, 0, 0, "The derivative term is unbounded for bounded inputs such as $\\sin(t^2)$."],
    ["y(t)=x(-t)", 1, 1, 0, "Time reversal.", 0, 0, 1, "$y(-2)=x(2)$ uses a future input."],
    ["y[n]=0", 1, 1, 1, "The zero system is linear and time-invariant.", 1, 1, 1, "The output is always 0."],
    ["y[n]=2y[n-1]+x[n]\\ \\text{(initially at rest)}", 1, 1, 1, "A linear constant-coefficient difference equation at rest is LTI.", 1, 0, 0, "$h[n]=2^nu[n]$ grows, so $x=u[n]$ gives an unbounded output."],
    ["y(t)=\\int_{t-1}^{t}x(\\tau)\\,d\\tau", 1, 1, 1, "A running integral over a window is LTI ($h$ is a unit pulse on $[0,1]$).", 1, 0, 1, "$|y|\\le B$."],
    ["y[n]=x[n]+x[3]", 1, 1, 0, "Linear, but the $x[3]$ term does not shift with the input.", 0, 0, 1, "For $n<3$, $y[n]$ uses $x[3]$, a future input."],
  ];
  const yn = (b) => (b ? "Yes" : "No");
  function sysProps(R) {
    const sel = R.shuffle(SYSTEMS).slice(0, 5);
    return {
      title: "System properties",
      statement: "**Systems.** For each system, decide whether it is additive, homogeneous, and time-invariant. Enter Yes or No in each cell.\n\n" + sel.map((s, i) => `${i + 1}. $${s[0]}$`).join("\n\n"),
      grids: [{ id: "p", caption: "Yes or No", rowLabels: sel.map((_, i) => `System ${i + 1}`), colLabels: ["additive", "homogeneous", "time-invariant"], answer: sel.map((s) => [yn(s[1]), yn(s[2]), yn(s[3])]), kind: "text" }],
      parts: [],
      solution: sel.map((s, i) => `${i + 1}. $${s[0]}$: additive **${yn(s[1])}**, homogeneous **${yn(s[2])}**, time-invariant **${yn(s[3])}**. ${s[4]}`).join("\n\n")
        + "\n\nTests: additive if $x_1+x_2\\to y_1+y_2$; homogeneous if $cx\\to cy$ for every constant $c$ (try $c=-1$ and $c=0$); time-invariant if $x[n-n_0]\\to y[n-n_0]$. Any explicit $n$ or $t$ outside the input's argument, or a changed argument ($-n$, $2n$), usually breaks time invariance.",
    };
  }

  // ---------------------------------------------------------------- 9b. all system types
  const TYPES_TEXT = "- **Linear:** additive and homogeneous.\n- **Time-invariant:** $x[n-n_0]\\to y[n-n_0]$ for every $n_0$.\n- **Causal:** the output at time $n$ uses no input after time $n$.\n- **Memoryless:** the output at time $n$ uses only the input at time $n$.\n- **Stable (BIBO):** every bounded input gives a bounded output.";
  function sysClass(R) {
    const sel = R.shuffle(SYSTEMS).slice(0, 5);
    return {
      title: "System types",
      statement: "**Classify.** For each system, decide whether it is linear, time-invariant, causal, memoryless, and stable. Enter Yes or No in each cell.\n\n" + TYPES_TEXT + "\n\n" + sel.map((s, i) => `${i + 1}. $${s[0]}$`).join("\n\n"),
      grids: [{ id: "p", caption: "Yes or No", rowLabels: sel.map((_, i) => `System ${i + 1}`), colLabels: ["linear", "time-invariant", "causal", "memoryless", "stable"],
        answer: sel.map((s) => [yn(s[1] && s[2]), yn(s[3]), yn(s[5]), yn(s[6]), yn(s[7])]), kind: "text" }],
      parts: [],
      solution: sel.map((s, i) => `${i + 1}. $${s[0]}$: linear **${yn(s[1] && s[2])}** (additive ${yn(s[1]).toLowerCase()}, homogeneous ${yn(s[2]).toLowerCase()}), time-invariant **${yn(s[3])}**, causal **${yn(s[5])}**, memoryless **${yn(s[6])}**, stable **${yn(s[7])}**. ${s[4]} ${s[8]}`).join("\n\n")
        + "\n\nFor an LTI system with unit-sample response $h$: causal exactly when $h[n]=0$ for $n<0$; memoryless exactly when $h[n]=c\\,\\delta[n]$; stable exactly when $\\sum_n|h[n]|<\\infty$. The 6.3000 quizzes ask about additivity, homogeneity, and time invariance. Causality and stability are background (they come up with filters).",
    };
  }

  // ---------------------------------------------------------------- 9c. could an LTI system map x to y? (HW6 Input-Output Pairs style)
  function couldLTI(R) {
    const f0 = R.pick([1, 2, 5]), o = 2 * PI * f0, cos = Math.cos, sin = Math.sin;
    const w = (m) => `${2 * m * f0}\\pi t`, Ttex = f0 === 1 ? "1" : `1/${f0}`;
    const sq = (t) => (mod(t * f0, 1) < 0.5 ? 1 : -1);
    const [gt, g] = R.pick([["2", 2], ["3", 3], ["\\tfrac12", 0.5]]), [ptx, pv] = R.pick([["\\pi/3", PI / 3], ["-\\pi/4", -PI / 4], ["\\pi/2", PI / 2]]);
    const ct = (x, y, xf, yf, ok, why) => ({ x, y, ok, why, chk: { kind: "ct", T: 1 / f0, xf, yf } });
    const dt = (x, y, xf, yf, ok, why) => ({ x, y, ok, why, chk: { kind: "dt", N: 24, xf, yf } });
    const pair = (yb, ybf, ok, why) => ({ x: `x_a=\\cos(${w(1)}),\\ x_b=\\sin(${w(1)})`, y: `y_a=2\\cos(${w(1)}),\\ y_b=${yb}`, ok, why, two: true,
      chk: { kind: "pair", T: 1 / f0, xa: (t) => cos(o * t), ya: (t) => 2 * cos(o * t), xb: (t) => sin(o * t), yb: ybf } });
    const items = [
      ct(`\\cos(${w(1)})`, `${gt}\\cos(${w(1)}${pv < 0 ? "" : "+"}${ptx})`, (t) => cos(o * t), (t) => g * cos(o * t + pv), 1, `Same frequency with a new amplitude and phase: $|H(\\omega_0)|=${gt}$ and $\\angle H(\\omega_0)=${ptx}$.`),
      ct(`\\cos(${w(1)})`, `\\cos(${w(2)})`, (t) => cos(o * t), (t) => cos(2 * o * t), 0, "The output has frequency $2\\omega_0$, which is not in the input. An LTI system only scales and shifts each input frequency. It cannot make a new one."),
      ct(`\\cos(${w(1)})+\\cos(${w(3)})`, `2\\cos(${w(3)})`, (t) => cos(o * t) + cos(3 * o * t), (t) => 2 * cos(3 * o * t), 1, "A filter with $H(\\omega_0)=0$ and $H(3\\omega_0)=2$ does this."),
      ct(`\\cos(${w(1)})`, `1+\\cos(${w(1)})`, (t) => cos(o * t), (t) => 1 + cos(o * t), 0, "The output has a DC term, but the input has no DC component ($H(0)\\cdot0=0$)."),
      ct(`\\cos^2(${w(1)})`, `\\tfrac12`, (t) => cos(o * t) ** 2, () => 0.5, 1, "$\\cos^2\\theta=\\frac12+\\frac12\\cos2\\theta$. A low-pass filter with $H(0)=1$ and $H(2\\omega_0)=0$ keeps only $\\frac12$."),
      ct(`\\cos(${w(1)})`, `\\cos^2(${w(1)})`, (t) => cos(o * t), (t) => cos(o * t) ** 2, 0, "$\\cos^2$ has components at DC and $2\\omega_0$. The input has only $\\omega_0$."),
      ct(`\\sin(${w(1)})`, `\\cos(${w(1)})`, (t) => sin(o * t), (t) => cos(o * t), 1, "$\\cos\\theta=\\sin(\\theta+\\pi/2)$: a phase shift, $H(\\omega_0)=j$."),
      ct(`\\cos(${w(1)})`, "0", (t) => cos(o * t), () => 0, 1, "Any system with $H(\\omega_0)=0$ (for example, a notch filter)."),
      ct("s(t)", `\\sin(${w(1)})`, sq, (t) => sin(o * t), 1, "The square wave has a component at its fundamental $\\omega_0$. A filter that keeps only $\\omega_0$, with the right gain, gives this sinusoid."),
      ct("s(t)", `\\cos(${w(2)})`, sq, (t) => cos(2 * o * t), 0, "A square wave with a 50% duty cycle has only odd harmonics. It has nothing at $2\\omega_0$."),
      ct(`|\\sin(${w(1)})|`, `\\cos(${w(2)})`, (t) => Math.abs(sin(o * t)), (t) => cos(2 * o * t), 1, "$|\\sin|$ repeats every half period, so its harmonics are at $0,2\\omega_0,4\\omega_0,\\dots$. A band-pass filter can keep $2\\omega_0$."),
      ct(`|\\sin(${w(1)})|`, `\\cos(${w(1)})`, (t) => Math.abs(sin(o * t)), (t) => cos(o * t), 0, "$|\\sin(\\omega_0t)|$ has period $T/2$, so it has no component at $\\omega_0$."),
      ct(`\\cos(${w(1)})\\cos(${w(5)})`, `\\cos(${w(4)})`, (t) => cos(o * t) * cos(5 * o * t), (t) => cos(4 * o * t), 1, "$\\cos a\\cos b=\\frac12\\cos(a-b)+\\frac12\\cos(a+b)$: the input has $4\\omega_0$ and $6\\omega_0$."),
      ct(`\\cos(${w(1)})\\cos(${w(5)})`, `\\cos(${w(5)})`, (t) => cos(o * t) * cos(5 * o * t), (t) => cos(5 * o * t), 0, "The input has only $4\\omega_0$ and $6\\omega_0$, not $5\\omega_0$."),
      ct("1", `\\cos(${w(1)})`, () => 1, (t) => cos(o * t), 0, "A constant input has only DC. The output needs a frequency that the input does not have."),
      ct(`\\cos(${w(1)})+\\sin(${w(1)})`, `\\cos(${w(1)})`, (t) => cos(o * t) + sin(o * t), (t) => cos(o * t), 1, "The input is $\\sqrt2\\cos(\\omega_0t-\\pi/4)$, one frequency. $H(\\omega_0)=\\frac{1}{\\sqrt2}e^{j\\pi/4}$ works."),
      dt("\\cos(\\pi n/4)", "2\\cos(7\\pi n/4)", (n) => cos((PI * n) / 4), (n) => 2 * cos((7 * PI * n) / 4), 1, "$\\cos(7\\pi n/4)=\\cos(-\\pi n/4)=\\cos(\\pi n/4)$: the same DT frequency. $H(\\pi/4)=2$."),
      dt("(-1)^n", "1", (n) => cos(PI * n), () => 1, 0, "$(-1)^n$ has only $\\Omega=\\pi$. The output is at $\\Omega=0$."),
      dt("\\cos(\\pi n/3)", "\\sin(2\\pi n/3)", (n) => cos((PI * n) / 3), (n) => sin((2 * PI * n) / 3), 0, "The output frequency $2\\pi/3$ is not in the input."),
      dt("1+\\cos(\\pi n/2)", "\\sin(\\pi n/2)", (n) => 1 + cos((PI * n) / 2), (n) => sin((PI * n) / 2), 1, "$H(0)=0$ removes the constant, and $H(\\pi/2)=-j$ turns the cosine into a sine."),
      pair(`2\\cos(${w(1)})`, (t) => 2 * cos(o * t), 0, "Pair $a$ gives $H(\\omega_0)=2$. Then the same system maps $\\sin$ to $2\\sin$, not to $2\\cos$."),
      pair(`2\\sin(${w(1)})`, (t) => 2 * sin(o * t), 1, "Pair $a$ gives $H(\\omega_0)=2$, and that also maps $\\sin$ to $2\\sin$."),
    ];
    let sel;
    do { sel = R.shuffle(items).slice(0, 6); } while (sel.filter((s) => s.ok).length < 2 || sel.filter((s) => !s.ok).length < 2);
    const usesSq = sel.some((s) => s.x === "s(t)");
    return {
      _lti: sel.map((s) => ({ ok: s.ok, chk: s.chk })),
      title: "Could it be LTI?",
      statement: `**Input-output pairs.** Each row gives an input and an output (for all $t$ or all $n$). Decide whether some LTI system could produce that output from that input. In a row with two pairs, one system must produce both. Enter Yes or No.\n\nHere $\\omega_0=${2 * f0}\\pi$ rad/s, so $T=${Ttex}$.${usesSq ? ` $s(t)$ is a square wave with period $T$: $s(t)=1$ for $0\\le t<T/2$ and $-1$ for $T/2\\le t<T$.` : ""}\n\n| row | input | output |\n|---|---|---|\n` + sel.map((s, i) => `| ${i + 1} | $${s.x}$ | $${s.y}$ |`).join("\n"),
      grids: [{ id: "l", caption: "Yes or No", rowLabels: sel.map((_, i) => `Row ${i + 1}`), colLabels: ["could be LTI"], answer: sel.map((s) => [yn(s.ok)]), kind: "text" }],
      parts: [],
      solution: "An LTI system maps $e^{j\\omega t}\\to H(\\omega)e^{j\\omega t}$. So every frequency in the output must also be in the input, and one system has one $H(\\omega)$ for all inputs.\n\n" + sel.map((s, i) => `${i + 1}. **${yn(s.ok)}.** ${s.why}`).join("\n\n"),
    };
  }

  // ---------------------------------------------------------------- 9d. system identification from input-output pairs
  const sinusTex = (A, B, arg) => {
    const c = (v) => (v === 1 ? "" : v === -1 ? "-" : nf(v));
    const t = []; if (A) t.push(`${c(A)}\\cos(${arg})`); if (B) t.push(`${c(B)}\\sin(${arg})`);
    return t.length ? t.join("+").replace("+-", "-") : "0";
  };
  function sysId(R) {
    const v = R.pick(["fir", "fir", "iir", "ct"]);
    if (v === "fir") {
      let h; do { h = [R.int(-2, 3), R.int(-2, 3), R.int(-2, 3)]; } while (!h[1] || h[0] === h[2]);
      const H0 = h[0] + h[1] + h[2], A = h[0] - h[2], B = h[1], Hpi = h[0] - h[1] + h[2];
      return {
        _id: { kind: "fir", H0, A, B },
        title: "System identification (FIR)",
        statement: `**Find the system.** An LTI system has a unit-sample response $h[n]$ that is zero outside $0\\le n\\le2$. Two input-output pairs are measured (for all $n$):\n\n- $x_1[n]=1$ gives $y_1[n]=${H0}$.\n- $x_2[n]=\\cos(\\pi n/2)$ gives $y_2[n]=${sinusTex(A, B, "\\pi n/2")}$.\n\nThe input $x_3[n]=(-1)^n$ gives $y_3[n]=C\\,(-1)^n$.`,
        grids: [],
        parts: [{ q: "$h[0]$", answer: num(h[0]) }, { q: "$h[1]$", answer: num(h[1]) }, { q: "$h[2]$", answer: num(h[2]) }, { q: "$C$", answer: num(Hpi) }],
        solution: `$H(\\Omega)=h[0]+h[1]e^{-j\\Omega}+h[2]e^{-j2\\Omega}$.

- $x_1=1=e^{j0n}$, so $H(0)=h[0]+h[1]+h[2]=${H0}$.
- At $\\Omega=\\pi/2$: $e^{-j\\pi/2}=-j$ and $e^{-j\\pi}=-1$, so $H(\\pi/2)=(h[0]-h[2])-j\\,h[1]$. A cosine input gives $\\operatorname{Re}\\{H\\}\\cos-\\operatorname{Im}\\{H\\}\\sin$. So $h[0]-h[2]=${A}$ and $h[1]=${B}$.
- Then $h[0]+h[2]=${H0}-(${B})=${H0 - B}$, so $h[0]=${h[0]}$ and $h[2]=${h[2]}$.
- $C=H(\\pi)=h[0]-h[1]+h[2]=${Hpi}$.`,
      };
    }
    if (v === "iir") {
      const a = R.pick([0.5, -0.5, 1 / 3, -1 / 3, 0.25, 0.75]), b = R.pick([1, 2, 3]);
      const y1 = b / (1 - a), y2 = b / (1 + a), r = y1 / y2;
      return {
        _id: { kind: "iir", y1, y2 },
        title: "System identification (difference equation)",
        statement: `**Find the system.** An LTI system satisfies $y[n]=a\\,y[n-1]+b\\,x[n]$ (initially at rest) with unknown constants $a$ and $b$, $|a|<1$. Two input-output pairs are measured:\n\n- $x_1[n]=1$ gives $y_1[n]=${nf(y1)}$.\n- $x_2[n]=(-1)^n$ gives $y_2[n]=${nf(y2)}\\,(-1)^n$.`,
        grids: [],
        parts: [{ q: "$a$", answer: num(a) }, { q: "$b$", answer: num(b) }, { q: "$h[2]$", answer: num(b * a * a) }, { q: "$|H(\\pi/2)|$", answer: num(b / Math.sqrt(1 + a * a)) }],
        solution: `$H(\\Omega)=\\dfrac{b}{1-a e^{-j\\Omega}}$. Constant and alternating inputs are eigenfunctions:

- $H(0)=\\dfrac{b}{1-a}=${nf(y1)}$ and $H(\\pi)=\\dfrac{b}{1+a}=${nf(y2)}$.
- Divide: $\\dfrac{1+a}{1-a}=${nf(r)}$, so $a=\\dfrac{${nf(r)}-1}{${nf(r)}+1}=${nf(a)}$ and $b=${nf(y1)}(1-a)=${nf(b)}$.
- $h[n]=b\\,a^nu[n]$, so $h[2]=${nf(b * a * a)}$.
- $|H(\\pi/2)|=\\dfrac{b}{|1+ja|}=\\dfrac{b}{\\sqrt{1+a^2}}=${nf(b / Math.sqrt(1 + a * a))}$.`,
      };
    }
    const w1 = R.pick([1, 2, 3]), [ptx, r] = R.pick([["\\pi/4", 1], ["\\pi/3", Math.sqrt(3)], ["\\pi/6", 1 / Math.sqrt(3)]]), K = R.pick([1, 2, 0.5]);
    const a = w1 / r, b = K * a, Cc = K / Math.sqrt(1 + r * r);
    return {
      _id: { kind: "ct", K, w1, phi: Math.atan(r) },
      title: "System identification (differential equation)",
      statement: `**Find the system.** A CT LTI system satisfies $\\dfrac{dy}{dt}+a\\,y(t)=b\\,x(t)$ with unknown constants $a,b>0$. Two input-output pairs are measured:\n\n- $x_1(t)=1$ gives $y_1(t)=${nf(K)}$.\n- $x_2(t)=\\cos(${w1 === 1 ? "" : w1}t)$ gives $y_2(t)=C\\cos(${w1 === 1 ? "" : w1}t-${ptx})$ for some $C>0$.`,
      grids: [],
      parts: [{ q: "$a$", answer: num(a) }, { q: "$b$", answer: num(b) }, { q: "$C$", answer: num(Cc) }, { q: "$h(0^+)$, the impulse response just after $t=0$", answer: num(b) }],
      solution: `$H(\\omega)=\\dfrac{b}{a+j\\omega}$ and $h(t)=b\\,e^{-at}u(t)$.

- $H(0)=b/a=${nf(K)}$.
- $\\angle H(${w1})=-\\arctan(${w1}/a)=-${ptx}$, so $${w1}/a=\\tan(${ptx})=${nf(r)}$ and $a=${nf(a)}$.
- $b=${nf(K)}\\,a=${nf(b)}$.
- $C=|H(${w1})|=\\dfrac{b}{\\sqrt{a^2+${w1 * w1}}}=\\dfrac{${nf(K)}}{\\sqrt{1+${nf(r * r)}}}=${nf(Cc)}$.
- $h(0^+)=b=${nf(b)}$.`,
    };
  }

  // ---------------------------------------------------------------- 9e. difference equations <-> h[n] <-> H(Omega)
  // y[n] = sum_k ac[k] y[n-k] + sum_k bc[k] x[n-k] (ac[0] unused), initially at rest.
  const deSim = (ac, bc, L) => { const y = []; for (let n = 0; n < L; n++) { let s = bc[n] || 0; ac.forEach((a, k) => { if (k && n - k >= 0) s += a * y[n - k]; }); y.push(s); } return y; };
  const deH = (ac, bc, W) => { let nm = C(0), dn = C(1); bc.forEach((b, k) => { nm = cadd(nm, cscale(cexp(-W * k), b)); }); ac.forEach((a, k) => { if (k) dn = csub(dn, cscale(cexp(-W * k), a)); }); return cdiv(nm, dn); };
  const coefTex = (v, first) => (v === 1 ? (first ? "" : "+") : v === -1 ? "-" : (v > 0 && !first ? "+" : "") + nf(v));
  const deTex = (ac, bc) => {
    const t = [];
    ac.forEach((a, k) => { if (k && a) t.push(`${coefTex(a, !t.length)}\\,y[n-${k}]`); });
    bc.forEach((b, k) => { if (b) t.push(`${coefTex(b, !t.length)}\\,x[n${k ? "-" + k : ""}]`); });
    return `y[n]=${t.join("")}`;
  };
  function diffEq(R) {
    const v = R.pick(["pz", "formA", "formB", "two", "rev"]);
    const hParts = (h, ns) => ns.map((n) => ({ q: `$h[${n}]$`, answer: num(h[n]), _t: ["h", n] }));
    const Hpart = (ac, bc, W, t) => ({ q: `$H(${t})$`, answer: num(deH(ac, bc, W).re), _t: ["H", W] });
    if (v === "pz" || v === "two") {
      let ac, bc, form, hform;
      if (v === "pz") {
        const a = R.pick([0.5, -0.5, 1 / 3, 0.25]), b0 = R.pick([1, 2]), b1 = R.pick([1, -1, 2, -2, 3]);
        ac = [0, a]; bc = [b0, b1];
        form = `H(\\Omega)=\\dfrac{${b0}${b1 < 0 ? "-" : "+"}${Math.abs(b1) === 1 ? "" : Math.abs(b1)}e^{-j\\Omega}}{1-${nf(a)}e^{-j\\Omega}}`.replace(/--/g, "+");
        hform = `$h[0]=${b0}$ and, for $n\\ge1$, $h[n]=a\\,h[n-1]$ with $h[1]=a\\,h[0]+${b1}=${nf(a * b0 + b1)}$, so $h[n]=${nf(a * b0 + b1)}\\,(${nf(a)})^{n-1}$.`;
      } else {
        const [p, q] = R.pick([[0.5, 0.25], [0.5, -0.5], [0.5, 1 / 3], [-0.5, 0.25], [1 / 3, -1 / 3]]);
        ac = [0, p + q, -p * q]; bc = [1];
        form = `H(\\Omega)=\\dfrac{1}{1-${nf(p + q)}e^{-j\\Omega}+${nf(p * q)}e^{-j2\\Omega}}=\\dfrac{1}{(1-${nf(p)}e^{-j\\Omega})(1-${nf(q)}e^{-j\\Omega})}`.replace(/-0e\^\{-j\\Omega\}/, "").replace(/\+-/g, "-").replace(/--/g, "+");
        hform = `Run the recursion with $x=\\delta$: $h[0]=1$, then $h[n]=${nf(p + q)}h[n-1]${-p * q < 0 ? "-" : "+"}${nf(Math.abs(p * q))}h[n-2]$. In closed form $h[n]=\\dfrac{p^{n+1}-q^{n+1}}{p-q}$ with $p=${nf(p)}$, $q=${nf(q)}$ (the roots of $z^2-${nf(p + q)}z+${nf(p * q)}$).`.replace(/\+-/g, "-").replace(/--/g, "+");
      }
      const h = deSim(ac, bc, 8);
      return {
        _de: { ac, bc },
        title: "Difference equation to h[n] and H(Ω)",
        statement: `**Difference equation.** An LTI system (initially at rest) satisfies $${deTex(ac, bc)}$. Find its unit-sample response and its frequency response at $\\Omega=0$ and $\\Omega=\\pi$.`,
        grids: [],
        parts: [...hParts(h, [0, 1, 2, 3]), Hpart(ac, bc, 0, "0"), Hpart(ac, bc, PI, "\\pi")],
        solution: `Take the DTFT of both sides ($x[n-k]\\to e^{-j\\Omega k}X$): $${form}$.\n\n${hform} Values: $h[0..3]=${h.slice(0, 4).map(nice).join(",\\ ")}$.\n\n$H(0)$: set $e^{-j\\Omega}=1$: $${nf(deH(ac, bc, 0).re)}$. $H(\\pi)$: set $e^{-j\\Omega}=-1$: $${nf(deH(ac, bc, PI).re)}$.`,
      };
    }
    if (v === "formA" || v === "formB") {
      const A = v === "formA", m = R.int(1, 3), al = A ? R.pick([0.5, -0.5, 0.75, -1]) : R.pick([0.5, -0.5, 0.75]);
      const ac = A ? [0] : Array.from({ length: m + 1 }, (_, k) => (k === m ? al : 0)), bc = A ? Array.from({ length: m + 1 }, (_, k) => (k === 0 ? 1 : k === m ? al : 0)) : [1];
      const h = deSim(ac, bc, 3 * m + 1), mx = A ? 1 + Math.abs(al) : 1 / (1 - Math.abs(al)), mn = A ? 1 - Math.abs(al) : 1 / (1 + Math.abs(al));
      return {
        _de: { ac, bc },
        title: `Peaks and valleys (Form ${A ? "A" : "B"})`,
        statement: `**Peaks and valleys.** An LTI system (initially at rest) satisfies $${deTex(ac, bc)}$.`,
        grids: [],
        parts: [...hParts(h, A ? [0, m] : [0, m, 2 * m]), Hpart(ac, bc, 0, "0"), Hpart(ac, bc, PI, "\\pi"),
          { q: "the largest value of $|H(\\Omega)|$", answer: num(mx), _t: ["max"] }, { q: "the smallest value of $|H(\\Omega)|$", answer: num(mn), _t: ["min"] },
          { q: "the number of peaks (local maxima) of $|H(\\Omega)|$ for $0\\le\\Omega<2\\pi$", answer: String(m), _t: ["peaks"] }],
        solution: `${A ? `$h[n]=\\delta[n]+${nf(al)}\\,\\delta[n-${m}]$ and $H(\\Omega)=1+${nf(al)}e^{-j${m}\\Omega}$.` : `$H(\\Omega)=\\dfrac{1}{1-${nf(al)}e^{-j${m}\\Omega}}$, and $h[n]=(${nf(al)})^{n/${m}}$ when $n$ is a multiple of ${m} ($n\\ge0$), 0 otherwise.`}`.replace(/\+-/g, "-").replace(/--/g, "+")
          + `\n\n- $e^{-j${m}\\Omega}$ goes around the unit circle ${m} time${m > 1 ? "s" : ""} as $\\Omega$ goes from 0 to $2\\pi$, so $|H|$ has ${m} peak${m > 1 ? "s" : ""} and ${m} valley${m > 1 ? "s" : ""}.`
          + `\n- ${A ? `$|H|$ is largest when $${nf(al)}e^{-j${m}\\Omega}$ points the same way as 1: $1+|\\alpha|=${nf(mx)}$. It is smallest when it points the opposite way: $1-|\\alpha|=${nf(mn)}$.` : `$|1-\\alpha e^{-j${m}\\Omega}|$ ranges from $1-|\\alpha|$ to $1+|\\alpha|$, so $|H|$ ranges from $\\frac{1}{1+|\\alpha|}=${nf(mn)}$ to $\\frac{1}{1-|\\alpha|}=${nf(mx)}$.`}`
          + `\n- $H(0)=${nf(deH(ac, bc, 0).re)}$ and $H(\\pi)=${nf(deH(ac, bc, PI).re)}$ (use $e^{-j${m}\\pi}=${m % 2 ? -1 : 1}$).`,
      };
    }
    // rev: h[n] = b a^n u[n] + d delta[n-1]  ->  y[n] = a y[n-1] + b x[n] + d x[n-1] - a d x[n-2]
    const a = R.pick([0.5, -0.5, 1 / 3]), b = R.pick([1, 2]), d = R.pick([1, -1, 2]);
    return {
      _de: { rev: true, a, b, d },
      title: "h[n] to a difference equation",
      statement: `**Reverse direction.** An LTI system has unit-sample response $h[n]=${b === 1 ? "" : b}\\left(${nf(a)}\\right)^n u[n]${d < 0 ? "-" : "+"}${Math.abs(d) === 1 ? "" : Math.abs(d)}\\,\\delta[n-1]$. Write it as $y[n]=c_1\\,y[n-1]+d_0\\,x[n]+d_1\\,x[n-1]+d_2\\,x[n-2]$.`,
      grids: [],
      parts: [{ q: "$c_1$", answer: num(a) }, { q: "$d_0$", answer: num(b) }, { q: "$d_1$", answer: num(d) }, { q: "$d_2$", answer: num(-a * d) }],
      solution: `$H(\\Omega)=\\dfrac{${b}}{1-${nf(a)}e^{-j\\Omega}}+${d}e^{-j\\Omega}=\\dfrac{${b}+${d}e^{-j\\Omega}-${nf(a * d)}e^{-j2\\Omega}}{1-${nf(a)}e^{-j\\Omega}}$ (common denominator).`.replace(/\+-/g, "-").replace(/--/g, "+")
        + `\n\nCross-multiply and read off the delays: $${deTex([0, a], [b, d, -a * d])}$. So $c_1=${nf(a)}$, $d_0=${b}$, $d_1=${d}$, $d_2=${nf(-a * d)}$.\n\nCheck: $h[0]=${b}$, $h[1]=${nf(b * a + d)}$, $h[2]=${nf(b * a * a)}$.`,
    };
  }

  // ---------------------------------------------------------------- 9f. block diagrams: cascade, parallel, feedback, inverses, step responses
  const dsum = (h) => h.map((v, n) => (v ? `${v === 1 ? "" : v === -1 ? "-" : nf(v)}\\delta[n${n ? "-" + n : ""}]` : null)).filter(Boolean).join("+").replace(/\+-/g, "-") || "0";
  const conv = (a, b) => { const y = Array(a.length + b.length - 1).fill(0); a.forEach((u, i) => b.forEach((v, j) => { y[i + j] += u * v; })); return y; };
  const smallH = (R, lo, hi) => { let h; do { h = Array.from({ length: R.int(lo, hi) }, () => R.int(-2, 2)); } while (!h[0] || h.every((v) => !v)); return h; };
  function blocks(R) {
    const v = R.pick(["casc", "par", "fb", "fb", "echo", "step"]);
    const hgrid = (h, cap) => ({ id: "h", caption: cap || "h[n]", rowLabels: ["h[n]"], colLabels: h.map((_, n) => String(n)), answer: [h.map((x) => num(x))], kind: "value" });
    if (v === "casc" || v === "par") {
      const h1 = smallH(R, 2, 3), h2 = smallH(R, 2, 3), k = R.int(0, 3);
      let h = conv(h1, h2);
      if (v === "par") { while (h.length <= k) h.push(0); h[k] += 1; }
      const S = (W) => [h1, h2].map((g) => g.reduce((s, x, n) => s + x * Math.cos(W * n), 0));
      return {
        _blk: { kind: v, h1, h2, k },
        title: v === "casc" ? "Cascaded systems" : "Cascade plus a parallel path",
        statement: `**Block diagram.** System 1 has $h_1[n]=${dsum(h1)}$ and System 2 has $h_2[n]=${dsum(h2)}$. ${v === "casc" ? "They are connected in cascade (the output of System 1 is the input of System 2)." : `They are connected in cascade, and the cascade is in parallel with a delay of ${k}: $y[n]=(x*h_1*h_2)[n]+x[n-${k}]$.`} Find the unit-sample response $h[n]$ of the whole system (it is 0 outside the columns shown), and $H(0)$ and $H(\\pi)$.`.replace("x[n-0]", "x[n]"),
        grids: [hgrid(h)],
        parts: [{ q: "$H(0)$", answer: num(h.reduce((s, x) => s + x, 0)) }, { q: "$H(\\pi)$", answer: num(h.reduce((s, x, n) => s + x * (n % 2 ? -1 : 1), 0)) }],
        solution: `A cascade convolves: $h_1*h_2=${conv(h1, h2).join(",\\ ")}$ (for $n=0,1,\\dots$).${v === "par" ? ` The parallel path adds $\\delta[n-${k}]$: $h=${h.join(",\\ ")}$.` : ""}\n\nIn frequency, a cascade multiplies${v === "par" ? " and a parallel path adds" : ""}: $H(0)=(${nf(S(0)[0])})(${nf(S(0)[1])})${v === "par" ? "+1" : ""}=${nf(h.reduce((s, x) => s + x, 0))}$ and $H(\\pi)=(${nf(S(PI)[0])})(${nf(S(PI)[1])})${v === "par" ? `+(${k % 2 ? -1 : 1})` : ""}=${nf(h.reduce((s, x, n) => s + x * (n % 2 ? -1 : 1), 0))}$.`,
      };
    }
    if (v === "fb") {
      const a = R.pick([0.5, -0.5, 0.25]), K = R.int(1, 3), L = Math.min(2 * K + 3, 8);
      const h = Array.from({ length: L }, (_, n) => (n % K ? 0 : a ** (n / K)));
      const Hpi = 1 / (1 - a * (K % 2 ? -1 : 1));
      return {
        _blk: { kind: "fb", a, K },
        title: "Feedback loop",
        statement: `**Feedback.** In a block diagram, the output $y[n]$ is delayed by ${K} sample${K > 1 ? "s" : ""}, multiplied by $${nf(a)}$, and added to the input $x[n]$. The sum is the output. The system starts at rest. Find $h[n]$ for $n=0$ to $${L - 1}$, and $H(0)$ and $H(\\pi)$.`,
        grids: [hgrid(h)],
        parts: [{ q: "$H(0)$", answer: num(1 / (1 - a)) }, { q: "$H(\\pi)$", answer: num(Hpi) }],
        solution: `The loop says $y[n]=x[n]+${nf(a)}\\,y[n-${K}]$. With $x=\\delta$, each trip around the loop takes ${K} sample${K > 1 ? "s" : ""} and multiplies by $${nf(a)}$: $h[n]=(${nf(a)})^{n/${K}}$ when $n$ is a multiple of ${K}, else 0. Values: $${h.map(nice).join(",\\ ")}$.\n\n$H(\\Omega)=\\dfrac{1}{1-${nf(a)}e^{-j${K}\\Omega}}$ (the loop rule: forward path over 1 minus the loop gain). $H(0)=${nf(1 / (1 - a))}$ and $H(\\pi)=${nf(Hpi)}$.`.replace(/-\-/g, "+"),
      };
    }
    if (v === "echo") {
      const A = R.pick([0.5, 0.25, 0.75, -0.5]), n0 = R.int(2, 5);
      return {
        _blk: { kind: "echo", A, n0 },
        title: "Echo removal",
        statement: `**Echo.** A recording is $y=x*h_1$ with $h_1[n]=\\delta[n]+${nf(A)}\\,\\delta[n-${n0}]$. Ben tries to remove the echo with $h_2[n]=\\delta[n]-${nf(A)}\\,\\delta[n-${n0}]$. The exact inverse $g[n]$ satisfies $(h_1*g)[n]=\\delta[n]$, and it is the unit-sample response of $y[n]=x[n]+c\\,y[n-${n0}]$.`.replace(/-\-/g, "+").replace(/\+-/g, "-"),
        grids: [],
        parts: [{ q: `$(h_1*h_2)[${2 * n0}]$ (the echo that Ben's filter leaves)`, answer: num(-A * A) }, { q: "$c$", answer: num(-A) },
          { q: `$g[${n0}]$`, answer: num(-A) }, { q: `$g[${2 * n0}]$`, answer: num(A * A) }, { q: `$g[${3 * n0}]$`, answer: num(-(A ** 3)) }, { q: `$g[${n0 + 1}]$`, answer: "0" }],
        solution: `- Ben: $(\\delta+\\alpha\\delta[n-${n0}])*(\\delta-\\alpha\\delta[n-${n0}])=\\delta[n]-\\alpha^2\\delta[n-${2 * n0}]$ with $\\alpha=${nf(A)}$. A smaller echo of $${nf(-A * A)}$ is left at $n=${2 * n0}$.
- Exact inverse: $G(\\Omega)=\\dfrac{1}{H_1(\\Omega)}=\\dfrac{1}{1+\\alpha e^{-j${n0}\\Omega}}$, so $y[n]=x[n]-\\alpha\\,y[n-${n0}]$ and $c=${nf(-A)}$.
- $g[n]=(-\\alpha)^{n/${n0}}$ at multiples of ${n0}: $g[${n0}]=${nf(-A)}$, $g[${2 * n0}]=${nf(A * A)}$, $g[${3 * n0}]=${nf(-(A ** 3))}$. Other samples are 0. Because $|\\alpha|<1$, $g$ decays and the inverse is stable.`,
      };
    }
    const h = smallH(R, 4, 5); while (h.length < 6) h.push(0);
    const s = []; h.reduce((acc, x) => { s.push(acc + x); return acc + x; }, 0);
    return {
      _blk: { kind: "step", s },
      title: "Unit-sample response from a step response",
      statement: `**Step response.** An LTI system is at rest. Its response to $u[n]$ is $s[n]=0$ for $n<0$ and\n\n| $n$ | ${s.map((_, n) => n).join(" | ")} |\n|---|${s.map(() => "---").join("|")}|\n| $s[n]$ | ${s.join(" | ")} |\n\nand $s[n]=${s[5]}$ for $n\\ge5$. Find $h[n]$ for $n=0$ to 5.`,
      grids: [hgrid(h)],
      parts: [{ q: "$H(0)$", answer: num(s[5]) }],
      solution: `$\\delta[n]=u[n]-u[n-1]$, so by linearity and time invariance $h[n]=s[n]-s[n-1]$: $${h.join(",\\ ")}$.\n\n$H(0)=\\sum_n h[n]=\\lim s[n]=${s[5]}$ (the final value of the step response is the DC gain).`,
    };
  }

  // ---------------------------------------------------------------- 9g. CT systems
  function ctSys(R) {
    const v = R.pick(["rc", "rc", "diff", "win"]);
    if (v === "rc") {
      const a = R.pick([1, 2, 0.5]), b = R.pick([1, 2]), [ptx, r] = R.pick([["\\pi/4", 1], ["\\pi/3", Math.sqrt(3)], ["\\pi/6", 1 / Math.sqrt(3)]]), w0 = a * r;
      const t1 = Math.LN2 / a, t1x = a === 1 ? "\\ln 2" : a === 2 ? "\\tfrac12\\ln 2" : "2\\ln 2";
      return {
        _cs: { kind: "rc", a, b, w0, t1 },
        title: "First-order CT system",
        statement: `**First-order system.** A CT system (initially at rest) satisfies $\\dfrac{dy}{dt}+${nf(a)}\\,y(t)=${b}\\,x(t)$. Let $t_1=${t1x}$ and $\\omega_0=${nf(w0)}$.`,
        grids: [],
        parts: [{ q: "$H(0)$", answer: num(b / a) }, { q: "$h(t_1)$ (the impulse response)", answer: num(b / 2) }, { q: "$s(t_1)$ (the response to $u(t)$)", answer: num(b / (2 * a)) },
          { q: "$|H(\\omega_0)|$", answer: num(b / a / Math.sqrt(1 + r * r)) }, { q: "$\\angle H(\\omega_0)$ (radians)", answer: num(-Math.atan(r)) }],
        solution: `Transform: $(j\\omega+${nf(a)})Y=${b}X$, so $H(\\omega)=\\dfrac{${b}}{${nf(a)}+j\\omega}$ and $h(t)=${b}e^{-${nf(a)}t}u(t)$.

- $H(0)=${nf(b / a)}$.
- $e^{-${nf(a)}t_1}=\\frac12$, so $h(t_1)=${nf(b / 2)}$.
- $s(t)=\\int_0^t h=\\frac{${b}}{${nf(a)}}(1-e^{-${nf(a)}t})$, so $s(t_1)=${nf(b / (2 * a))}$.
- $\\omega_0/a=${nf(r)}$: $|H|=\\dfrac{${nf(b / a)}}{\\sqrt{1+${nf(r * r)}}}=${nf(b / a / Math.sqrt(1 + r * r))}$ and $\\angle H=-\\arctan(${nf(r)})=-${ptx}$.`,
      };
    }
    if (v === "diff") {
      const T0 = R.pick([1, 2, 0.5]), th = R.shuffle([[PI / 2, "\\pi/2"], [(2 * PI) / 3, "2\\pi/3"], [PI, "\\pi"], [PI / 3, "\\pi/3"]]).slice(0, 2);
      const Hf = (W) => csub(C(1), cexp(-W * T0));
      return {
        _cs: { kind: "diff", T0, ws: th.map(([t]) => t / T0) },
        title: "CT difference system",
        statement: `**Difference over time.** A CT system has $y(t)=x(t)-x(t-${nf(T0)})$. Let $\\omega_1=${nf(th[0][0] / T0)}$ and $\\omega_2=${nf(th[1][0] / T0)}$ rad/s. The input $x(t)=u(t)$ gives the output $y_u(t)$.`,
        grids: [],
        parts: [{ q: "$|H(\\omega_1)|$", answer: num(cabs(Hf(th[0][0] / T0))) }, { q: "$\\angle H(\\omega_1)$ (radians)", answer: num(carg(Hf(th[0][0] / T0))) },
          { q: "$|H(\\omega_2)|$", answer: num(cabs(Hf(th[1][0] / T0))) }, { q: "$\\angle H(\\omega_2)$ (radians)", answer: num(carg(Hf(th[1][0] / T0))) },
          { q: `$y_u(${nf(T0 / 2)})$`, answer: "1" }, { q: `$y_u(${nf(2 * T0)})$`, answer: "0" }],
        solution: `$h(t)=\\delta(t)-\\delta(t-${nf(T0)})$ and $H(\\omega)=1-e^{-j\\omega ${nf(T0)}}=e^{-j\\theta/2}(e^{j\\theta/2}-e^{-j\\theta/2})=2j\\sin(\\theta/2)\\,e^{-j\\theta/2}$ with $\\theta=\\omega\\cdot${nf(T0)}$.

So $|H|=2|\\sin(\\theta/2)|$ and $\\angle H=\\frac{\\pi}{2}-\\frac{\\theta}{2}$ for $0<\\theta<2\\pi$.
${th.map(([t, tx], i) => `- $\\omega_${i + 1}$: $\\theta=${tx}$, $|H|=${nf(cabs(Hf(t / T0)))}$, $\\angle H=${nf(carg(Hf(t / T0)))}$.`).join("\n")}
- $y_u(t)=u(t)-u(t-${nf(T0)})$, a pulse of height 1 on $0\\le t<${nf(T0)}$.`,
      };
    }
    const T0 = R.pick([1, 2, 0.5, 4]);
    return {
      _cs: { kind: "win", T0 },
      title: "Running integral",
      statement: `**Running integral.** A CT system has $y(t)=\\displaystyle\\int_{t-${nf(T0)}}^{t}x(\\tau)\\,d\\tau$.`,
      grids: [],
      parts: [{ q: "$H(0)$", answer: num(T0) }, { q: `$|H(${nf(PI / T0)})|$`, answer: num((2 * T0) / PI) }, { q: `$\\angle H(${nf(PI / T0)})$ (radians)`, answer: num(-PI / 2) },
        { q: "the smallest $\\omega>0$ with $H(\\omega)=0$", answer: num((2 * PI) / T0) }, { q: `the response to $u(t)$ at $t=${nf(T0 / 2)}$`, answer: num(T0 / 2) }, { q: `the response to $u(t)$ at $t=${nf(2 * T0)}$`, answer: num(T0) }],
      solution: `$h(t)=1$ for $0\\le t\\le ${nf(T0)}$, else 0. So $H(\\omega)=\\int_0^{${nf(T0)}}e^{-j\\omega t}dt=e^{-j\\omega ${nf(T0)}/2}\\,\\dfrac{2\\sin(\\omega ${nf(T0)}/2)}{\\omega}$.

- $H(0)=${nf(T0)}$ (the area of $h$).
- At $\\omega=${nf(PI / T0)}$: $\\frac{2\\sin(\\pi/2)}{${nf(PI / T0)}}=${nf((2 * T0) / PI)}$, and the angle is $-\\omega ${nf(T0)}/2=-\\pi/2$.
- Zeros where $\\sin(\\omega\\cdot ${nf(T0)}/2)=0$: the first is at $\\omega=${nf((2 * PI) / T0)}$. A cosine with exactly one period in the window integrates to 0.
- The step response is a ramp $\\int_0^t1\\,d\\tau=t$ up to $t=${nf(T0)}$, then stays at $${nf(T0)}$.`,
    };
  }

  // ---------------------------------------------------------------- 9h. sinusoids through FIR filters (HW6 Expressible Filtering style)
  const FIRS = [[[0.5, 0, 0.5], "\\tfrac12\\delta[n]+\\tfrac12\\delta[n-2]"], [[1, -1], "\\delta[n]-\\delta[n-1]"], [[1, 1], "\\delta[n]+\\delta[n-1]"], [[1, 0, -1], "\\delta[n]-\\delta[n-2]"],
    [[1, 1, 1], "\\delta[n]+\\delta[n-1]+\\delta[n-2]"], [[1, 0, 1], "\\delta[n]+\\delta[n-2]"], [[1, -1, 1], "\\delta[n]-\\delta[n-1]+\\delta[n-2]"], [[0.5, 0.5], "\\tfrac12\\delta[n]+\\tfrac12\\delta[n-1]"]];
  const WSET = [[0, "0"], [PI / 4, "\\pi/4"], [PI / 3, "\\pi/3"], [PI / 2, "\\pi/2"], [(2 * PI) / 3, "2\\pi/3"], [(3 * PI) / 4, "3\\pi/4"], [PI, "\\pi"]];
  function sinusoid(R) {
    const [h, htex] = R.pick(FIRS);
    const H = (W) => h.reduce((s, x, n) => cadd(s, cscale(cexp(-W * n), x)), C(0));
    const zeros = WSET.filter(([W]) => cabs(H(W)) < 1e-9), live = R.shuffle(WSET.filter(([W]) => W > 0 && W < PI && cabs(H(W)) > 1e-9));
    const c = R.pick([3, 7, -2, 4]), [W2, W2t] = live[0], [W3, W3t] = live[1] || live[0], [Wz, Wzt] = R.pick(zeros);
    const angPart = (q, z) => (Math.abs(Math.abs(carg(z)) - PI) < 1e-9 ? { q, anyOf: [num(PI), num(-PI)] } : { q, answer: num(carg(z)) });
    const H2 = H(W2), H3 = cscale(H(W3), 2), H0 = H(0).re;
    const zIn = Wz === 0 ? "5" : Wz === PI ? "5(-1)^n" : `5\\cos(${Wzt}\\,n)`;
    return {
      _sn: { h, c, W2, W3, Wz },
      title: "Sinusoids through an FIR filter",
      statement: `**Filtering sinusoids.** An LTI system has $h[n]=${htex}$. Each output below is a constant or a single sinusoid $A\\cos(\\Omega n+\\phi)$ with $A>0$ and $-\\pi<\\phi\\le\\pi$.\n\n1. $x_1[n]=${c}$ gives the constant $y_1$.\n2. $x_2[n]=\\cos(${W2t}\\,n)$ gives $A_2\\cos(${W2t}\\,n+\\phi_2)$.\n3. $x_3[n]=${zIn}+2\\cos(${W3t}\\,n)$ gives $A_3\\cos(\\Omega_3n+\\phi_3)$ with $0<\\Omega_3<\\pi$.`,
      grids: [],
      parts: [{ q: "$y_1$", answer: num(c * H0) }, { q: "$A_2$", answer: num(cabs(H2)) }, angPart("$\\phi_2$ (radians)", H2), { q: "$\\Omega_3$", answer: num(W3) }, { q: "$A_3$", answer: num(cabs(H3)) }, angPart("$\\phi_3$ (radians)", H3)],
      solution: `$H(\\Omega)=\\sum_n h[n]e^{-j\\Omega n}=${h.map((x, n) => (!x ? "" : n === 0 ? nf(x) : `${x === 1 ? "" : x === -1 ? "-" : nf(x)}e^{-j${n === 1 ? "" : n}\\Omega}`)).filter(Boolean).join("+").replace(/\+-/g, "-")}$. Each frequency is scaled by $|H|$ and shifted by $\\angle H$.

1. $H(0)=${nf(H0)}$, so $y_1=${c}\\cdot${nf(H0)}=${nf(c * H0)}$.
2. $H(${W2t})=${ctex(H2)}$: $A_2=${nf(cabs(H2))}$, $\\phi_2=${nf(carg(H2))}$.
3. $H(${Wzt})=0$, so the ${Wz === 0 ? "constant" : Wz === PI ? "$(-1)^n$ term" : `$\\Omega=${Wzt}$ term`} is removed. Only $\\Omega_3=${W3t}$ is left: $2H(${W3t})=${ctex(H3)}$, so $A_3=${nf(cabs(H3))}$ and $\\phi_3=${nf(carg(H3))}$.`,
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

  // ---------------------------------------------------------------- 18. communication systems (L11)
  // Each generator also returns its parameters (_dm, _fdm, _amc, _amm) for scripts/check-drills-6300.js.
  const cx = (a) => { const r = snap(a.re), i = snap(a.im); if (!i) return nf(r); const im = `${Math.abs(i) === 1 ? "" : nf(Math.abs(i))}j`; return r ? `${nf(r)}${i < 0 ? "-" : "+"}${im}` : `${i < 0 ? "-" : ""}${im}`; };
  const frac = (v) => { const s = nice(v); return /^-?\d+(\/\d+)?$/.test(s) ? s : num(v); };

  // 18a. Synchronous demodulation with a phase error, a frequency error, or the wrong carrier.
  function demod(R) {
    const wm = R.pick([1, 2, 3]), wc = R.pick([20, 30, 40]), A = R.pick([2, 4, 6]), G = R.pick([1, 2, 4]), cut = 10;
    const [phi, phiT] = R.pick([[PI / 3, "\\pi/3"], [PI / 4, "\\pi/4"], [2 * PI / 3, "2\\pi/3"], [PI / 6, "\\pi/6"], [3 * PI / 4, "3\\pi/4"], [PI, "\\pi"]]);
    const dl = R.pick([0.5, 1.5, 2.5].filter((d) => d !== wm));
    const B = (G * A * Math.cos(phi)) / 2, hi = wm + dl, lo = Math.abs(wm - dl), A2 = (G * A) / 4;
    return {
      title: "Synchronous demodulation errors",
      statement: `**Demodulation errors.** The message $x(t)=${A}\\cos(${wm}t)$ is sent as $y(t)=x(t)\\cos(${wc}t)$ (frequencies in rad/s). The receiver forms $z(t)=y(t)\\,r(t)$ and passes $z$ through an ideal low-pass filter with gain $G=${G}$ and cutoff $${cut}$ rad/s. The filter output is $w(t)$.

**Part a.** The receiver's carrier has a phase error: $r(t)=\\cos(${wc}t+${phiT})$. Then $w(t)=B\\cos(${wm}t)$. Find $B$.

**Part b.** For which phase error $\\phi$ in $0<\\phi\\le\\pi$ is the output $w(t)$ zero for every message?

**Part c.** The receiver's carrier has a frequency error: $r(t)=\\cos(${wc + dl}t)$. Then $w(t)=A_1\\cos(\\omega_1t)+A_2\\cos(\\omega_2t)$ with $\\omega_1>\\omega_2\\ge0$. Find $\\omega_1$, $\\omega_2$, $A_1$, and $A_2$.

**Part d.** The receiver uses $r(t)=\\sin(${wc}t)$. What is the amplitude of $w(t)$?`,
      grids: [],
      parts: [{ q: "Part a: $B$", answer: num(B) }, { q: "Part b: $\\phi$", answer: "pi/2" }, { q: "Part c: $\\omega_1$ (rad/s)", answer: num(hi) }, { q: "Part c: $\\omega_2$ (rad/s)", answer: num(lo) },
        { q: "Part c: $A_1$", answer: num(A2) }, { q: "Part c: $A_2$", answer: num(A2) }, { q: "Part d: amplitude", answer: "0" }],
      solution: `Use $\\cos a\\cos b=\\frac12\\cos(a-b)+\\frac12\\cos(a+b)$. The sum-frequency terms are near $2\\cdot${wc}$ rad/s, far above the cutoff, so the filter removes them.

**Part a.** $\\cos(${wc}t)\\cos(${wc}t+\\phi)=\\frac12\\cos\\phi+\\frac12\\cos(${2 * wc}t+\\phi)$. After the filter: $w=G\\cdot\\frac12\\cos\\phi\\cdot x(t)$, so $B=\\frac{${G}\\cdot${A}}{2}\\cos(${phiT})=${nf(B)}$. A phase error scales the message by $\\cos\\phi$: the signal "fades".

**Part b.** $\\cos\\phi=0$ at $\\phi=\\pi/2$: the receiver's carrier is orthogonal to the transmitter's.

**Part c.** $\\cos(${wc}t)\\cos(${wc + dl}t)=\\frac12\\cos(${dl}t)+\\frac12\\cos(${2 * wc + dl}t)$. After the filter, $w=\\frac G2x(t)\\cos(${dl}t)=\\frac{${G}\\cdot${A}}{2}\\cos(${wm}t)\\cos(${dl}t)=\\frac{${G * A}}{4}\\left[\\cos(${hi}t)+\\cos(${lo}t)\\right]$. So $\\omega_1=${hi}$, $\\omega_2=${lo}$, and $A_1=A_2=${nf(A2)}$. A frequency error makes the message beat: its amplitude swings with $\\cos(${dl}t)$.

**Part d.** $\\cos(${wc}t)\\sin(${wc}t)=\\frac12\\sin(${2 * wc}t)$ has no low-frequency part, so $w=0$. This is the case $\\phi=-\\pi/2$.`,
      _dm: { wm, wc, A, G, phi, dl, cut },
    };
  }

  // 18b. Frequency-division multiplexing: bands, overlap, the receiver's cutoff range.
  function fdm(R) {
    const W = [R.pick([3, 4, 5]), R.pick([4, 5, 6]), R.pick([3, 5, 8])];
    const c1 = R.pick([40, 50, 60]), c2 = c1 + W[0] + W[1] + R.int(2, 6), c3 = c2 + W[1] + W[2] + R.int(2, 6);
    const c = [c1, c2, c3], s = R.int(0, 2);
    const cutMax = Math.min(2 * c[s] - W[s], ...c.map((cj, j) => (j === s ? Infinity : Math.abs(cj - c[s]) - W[j])));
    const off = R.pick([-3, -2, -1, 1, 2, 3]), alt = [c1, c1 + W[0] + W[1] + off];
    const overlap = off < 0;
    const minC3 = c2 + W[1] + W[2];
    return {
      title: "Frequency-division multiplexing",
      statement: `**FDM.** Three real messages $x_1,x_2,x_3$ are band-limited to $W_1=${W[0]}$, $W_2=${W[1]}$, and $W_3=${W[2]}$ kHz. Each is sent as $x_i(t)\\cos(2\\pi f_it)$ with carriers $f_1=${c1}$, $f_2=${c2}$, and $f_3=${c3}$ kHz, and the three are added. All frequencies are in kHz.

**Part a.** Which positive frequencies does station 2 occupy? Give the lowest and the highest.

**Part b.** Another plan uses $f_1=${alt[0]}$ and $f_2=${alt[1]}$ kHz for stations 1 and 2. Do their bands overlap?

**Part c.** To receive station ${s + 1}, the receiver multiplies the sum by $\\cos(2\\pi f_${s + 1}t)$ and applies an ideal low-pass filter. Give the filter gain, and the smallest and largest cutoffs that recover $x_${s + 1}(t)$ with no part of the other stations.

**Part d.** With $f_1$ and $f_2$ as given, what is the smallest carrier $f_3$ for which station 3 does not overlap station 2?`,
      grids: [],
      parts: [{ q: "Part a: lowest frequency (kHz)", answer: String(c2 - W[1]) }, { q: "Part a: highest frequency (kHz)", answer: String(c2 + W[1]) },
        { q: "Part b: overlap? (Yes or No)", accept: overlap ? ["yes", "y"] : ["no", "n"] },
        { q: "Part c: filter gain", answer: "2" }, { q: "Part c: smallest cutoff (kHz)", answer: String(W[s]) }, { q: "Part c: largest cutoff (kHz)", answer: String(cutMax) },
        { q: "Part d: smallest $f_3$ (kHz)", answer: String(minC3) }],
      solution: `Multiplying by $\\cos(2\\pi f_it)$ puts half-size copies of $X_i$ at $\\pm f_i$, so station $i$ occupies $f_i-W_i\\le|f|\\le f_i+W_i$.

**Part a.** $${c2}-${W[1]}=${c2 - W[1]}$ to $${c2}+${W[1]}=${c2 + W[1]}$ kHz.

**Part b.** Two bands do not overlap when the carriers are at least $W_1+W_2=${W[0] + W[1]}$ kHz apart. Here they are $${alt[1] - alt[0]}$ kHz apart: **${overlap ? "Yes" : "No"}**.

**Part c.** Multiplying by $\\cos(2\\pi f_${s + 1}t)$ shifts every band by $\\pm f_${s + 1}$. Station ${s + 1} lands at baseband with half size, so the gain is 2 and the cutoff must be at least $W_${s + 1}=${W[s]}$. The lowest unwanted copies are:
${c.map((cj, j) => (j === s ? `- station ${j + 1} itself at $2f_${j + 1}$: from $${2 * cj}-${W[j]}=${2 * cj - W[j]}$` : `- station ${j + 1} shifted down: from $|${cj}-${c[s]}|-${W[j]}=${Math.abs(cj - c[s]) - W[j]}$`)).join("\n")}

The largest cutoff is the smallest of these: $${cutMax}$ kHz.

**Part d.** Station 2 reaches $${c2}+${W[1]}=${c2 + W[1]}$, and station 3 starts at $f_3-${W[2]}$. So $f_3\\ge${c2 + W[1]}+${W[2]}=${minC3}$ kHz.`,
      _fdm: { W, c, s, alt, cutMax, minC3, overlap },
    };
  }

  // 18c. AM with carrier: envelope detection, modulation index, power, spectrum impulses.
  function amCarrier(R) {
    const a = R.pick([1, 2, 3, 4]), b = R.pick([0, 0, 1, 2].filter((v) => v < a + 1)), w1 = R.pick([1, 2]), wc = R.pick([50, 100]);
    const Cmin = a + b, C = Cmin * R.pick([1.5, 2, 4]), m = Cmin / C;
    const Pc = (C * C) / 2, Ps = (a * a + b * b) / 4, eff = Ps / (Pc + Ps);
    const xT = b ? `${a}\\cos(${w1}t)+${b}\\cos(${3 * w1}t)` : `${a}\\cos(${w1}t)`;
    const nImp = b ? 5 : 3;
    return {
      title: "AM with carrier",
      statement: `**AM with carrier.** The message is $x(t)=${xT}$. The transmitter sends $y(t)=\\big(x(t)+C\\big)\\cos(${wc}t)$ (frequencies in rad/s).

**Part a.** An envelope detector recovers $x$ only if $x(t)+C\\ge0$ for all $t$. Find the smallest such $C$.

From here on, $C=${nf(C)}$.

**Part b.** Find the modulation index $m=\\max|x(t)|/C$.

**Part c.** $Y(\\omega)$ is made of impulses. How many impulses are at positive frequencies? What are the areas of the impulses at $\\omega=${wc}$ and at $\\omega=${wc + w1}$? Give each area divided by $\\pi$.

**Part d.** Find the average power of the carrier term $C\\cos(${wc}t)$, the average power of the message term $x(t)\\cos(${wc}t)$, and the fraction of the total power that carries the message.`,
      grids: [],
      parts: [{ q: "Part a: smallest $C$", answer: num(Cmin) }, { q: "Part b: $m$", answer: num(m) }, { q: "Part c: number of impulses at $\\omega>0$", answer: String(nImp) },
        { q: `Part c: area at $\\omega=${wc}$, divided by $\\pi$`, answer: num(C) }, { q: `Part c: area at $\\omega=${wc + w1}$, divided by $\\pi$`, answer: num(a / 2) },
        { q: "Part d: carrier power", answer: num(Pc) }, { q: "Part d: message-term power", answer: num(Ps) }, { q: "Part d: message fraction of the total power", answer: num(eff) }],
      solution: `**Part a.** ${b ? `Both cosines reach $-1$ at the same time ($${w1}t=\\pi$ gives $${3 * w1}t=3\\pi$), so` : ""} $\\min x(t)=-${Cmin}$. So $C\\ge${Cmin}$.

**Part b.** $m=${Cmin}/${nf(C)}=${nf(m)}$.

**Part c.** $C\\cos(${wc}t)$ gives impulses of area $\\pi C$ at $\\pm${wc}$. Each term $a\\cos(\\omega_it)\\cos(${wc}t)=\\frac a2\\cos((${wc}-\\omega_i)t)+\\frac a2\\cos((${wc}+\\omega_i)t)$ gives impulses of area $\\pi\\frac a2$ at $\\pm(${wc}\\pm\\omega_i)$. At positive frequencies there are ${nImp} impulses: the carrier and ${nImp - 1} sideband${nImp > 2 ? "s" : ""}. Areas over $\\pi$: $${nf(C)}$ at $${wc}$ and $${nf(a / 2)}$ at $${wc + w1}$.

**Part d.** A cosine of amplitude $A$ has average power $A^2/2$. Carrier: $\\frac{${nf(C)}^2}{2}=${nf(Pc)}$. Message term: each sideband cosine has amplitude $\\frac a2$, so the power is $\\sum2\\cdot\\frac12\\left(\\frac a2\\right)^2=\\frac{${a * a}${b ? `+${b * b}` : ""}}{4}=${nf(Ps)}$. Fraction: $\\frac{${nf(Ps)}}{${nf(Pc)}+${nf(Ps)}}=${nf(eff)}$. The carrier takes most of the power, which is why AM with carrier is used for broadcast but not for battery devices.`,
      _amc: { a, b, w1, wc, C },
    };
  }

  // 18d. Modulation spectra: matching. X is a unit triangle on |ω|<1; panels show |Y(ω)| on a common scale.
  function amMatch(R) {
    const wc = R.pick([4, 5]), dl = 0.5, L = 2 * wc + 2, ws = Array.from({ length: 20 * L * 2 + 1 }, (_, i) => -L + i / 20);
    const T = (w) => Math.max(0, 1 - Math.abs(w));
    const sh = (h, w0, wd = 1) => (w) => h * T((w - w0) / wd);
    const sum = (...fs) => (w) => fs.reduce((s, f) => s + f(w), 0);
    const pool = [
      { tex: `x(t)\\cos(${wc}t)`, plain: `x·cos(${wc}t)`, Y: sum(sh(0.5, wc), sh(0.5, -wc)), imp: [], why: `Half-size copies at $\\pm${wc}$.` },
      { tex: `x(t)\\cos^2(${wc}t)`, plain: `x·cos²(${wc}t)`, Y: sum(sh(0.5, 0), sh(0.25, 2 * wc), sh(0.25, -2 * wc)), imp: [], why: `$\\cos^2=\\frac12+\\frac12\\cos(${2 * wc}t)$: a half-size copy at 0 and quarter-size copies at $\\pm${2 * wc}$.` },
      { tex: `x(t)e^{j${wc}t}`, plain: `x·exp(j${wc}t)`, Y: sh(1, wc), imp: [], why: `One full-size copy, shifted right to $${wc}$.` },
      { tex: `x(t)e^{-j${wc}t}`, plain: `x·exp(−j${wc}t)`, Y: sh(1, -wc), imp: [], why: `One full-size copy, shifted left to $-${wc}$.` },
      { tex: `x(t)\\cos(${wc}t)\\sin(${wc}t)`, plain: `x·cos(${wc}t)·sin(${wc}t)`, Y: sum(sh(0.25, 2 * wc), sh(0.25, -2 * wc)), imp: [], why: `$\\cos\\sin=\\frac12\\sin(${2 * wc}t)$: quarter-size copies at $\\pm${2 * wc}$ and nothing at 0.` },
      { tex: `x(t)\\cos(${wc}t)\\cos(${wc + dl}t)`, plain: `x·cos(${wc}t)·cos(${wc + dl}t)`, Y: sum(sh(0.25, dl), sh(0.25, -dl), sh(0.25, 2 * wc + dl), sh(0.25, -2 * wc - dl)), imp: [], why: `$\\frac12\\cos(${dl}t)+\\frac12\\cos(${2 * wc + dl}t)$: two quarter-size copies at $\\pm${dl}$ that overlap and add, and two at $\\pm${2 * wc + dl}$.` },
      { tex: `\\big(x(t)+1\\big)\\cos(${wc}t)`, plain: `(x+1)·cos(${wc}t)`, Y: sum(sh(0.5, wc), sh(0.5, -wc)), imp: [wc, -wc], why: `The copies of $x\\cos$, plus carrier impulses at $\\pm${wc}$.` },
      { tex: `x(t)\\cos(${2 * wc}t)`, plain: `x·cos(${2 * wc}t)`, Y: sum(sh(0.5, 2 * wc), sh(0.5, -2 * wc)), imp: [], why: `Half-size copies at $\\pm${2 * wc}$.` },
      { tex: `x(2t)\\cos(${wc}t)`, plain: `x(2t)·cos(${wc}t)`, Y: sum(sh(0.25, wc, 2), sh(0.25, -wc, 2)), imp: [], why: `$x(2t)\\leftrightarrow\\frac12X(\\omega/2)$: twice as wide and half as tall, then half-size copies at $\\pm${wc}$ (height $\\frac14$).` },
      { tex: `x(t)+x(t)\\cos(${wc}t)`, plain: `x + x·cos(${wc}t)`, Y: sum(sh(1, 0), sh(0.5, wc), sh(0.5, -wc)), imp: [], why: `The original at 0 plus half-size copies at $\\pm${wc}$.` },
      { tex: `x(t)\\big(\\cos(${wc}t)+\\cos(${2 * wc}t)\\big)`, plain: `x·(cos(${wc}t)+cos(${2 * wc}t))`, Y: sum(sh(0.5, wc), sh(0.5, -wc), sh(0.5, 2 * wc), sh(0.5, -2 * wc)), imp: [], why: `Half-size copies at $\\pm${wc}$ and $\\pm${2 * wc}$.` },
    ];
    const sel = R.shuffle(pool).slice(0, 7), extra = pool.filter((p) => !sel.includes(p)).slice(0, 2);
    // Impulses are drawn as spikes to the top of the panel.
    const ysOf = (p) => { const ys = ws.map(p.Y); for (const w0 of p.imp) ys[Math.round((w0 + L) * 20)] = 1.1; return ys; };
    const xt = [[-2 * wc, `−${2 * wc}`], [-wc, `−${wc}`], [0, "0"], [wc, String(wc)], [2 * wc, String(2 * wc)]];
    const ms = matchSet(R, sel.map((p) => ({ ys: ysOf(p) })), extra.map(ysOf), (i) => String.fromCharCode(65 + i),
      (lab, ys) => ({ label: lab, kind: "line", xs: ws, ys, yrange: [0, 1.12], xticks: xt, yticks: [[1, "1"], [0.5, "½"]], xlab: "ω" }));
    const top = panels([{ label: "X(ω)", kind: "line", xs: ws, ys: ws.map(T), yrange: [0, 1.12], xticks: [[-1, "−1"], [0, "0"], [1, "1"], [wc, String(wc)]], yticks: [[1, "1"]], xlab: "ω" }], 1, 360, 96);
    return {
      title: "Modulation spectra: matching",
      statement: `**Modulation spectra.** $x(t)$ is real, and its Fourier transform $X(\\omega)$ is the triangle below (height 1, zero for $|\\omega|\\ge1$).

${fig(top)}

Each plot shows $|Y(\\omega)|$ for a signal $y(t)$ made from $x(t)$. All plots use the same vertical scale (the marks ½ and 1 on the left give the height). A thin spike to the top of a plot is an impulse. Match each signal to its plot.

${sel.map((p, i) => `- $y_${i}(t)=${p.tex}$`).join("\n")}

${fig(panels(ms.panels, 3, 240, 126))}`,
      grids: [{ id: "m", caption: "Plot letter for each signal", rowLabels: sel.map((_, i) => `y${i}`), colLabels: ["plot"], answer: sel.map((_, i) => [ms.answer[i]]), kind: "text" }],
      parts: [],
      solution: `Multiplying by $e^{j\\omega_0t}$ shifts $X$ to $\\omega_0$. A cosine is half of each of $e^{\\pm j\\omega_0t}$, so it makes two half-size copies.

${sel.map((p, i) => `- $y_${i}=${p.tex}$: **${ms.answer[i]}**. ${p.why}`).join("\n")}`,
      _amm: { wc, dl, ws, sel: sel.map((p) => ({ plain: p.plain, imp: p.imp })), panels: Object.fromEntries(ms.panels.map((p) => [p.label, p.ys])), answer: ms.answer },
    };
  }

  // ---------------------------------------------------------------- 19. more DFT (L12-L13)
  // 19a. DFT properties: transform the signal, read off Y[k] from X[k].
  function dftProps(R) {
    const N = 8, pos = R.shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 3).sort((p, q) => p - q);
    const x = Array(N).fill(0); pos.forEach((p) => { x[p] = R.pick([-2, -1, 1, 2, 3]); });
    const X = dft(x), at = (k) => X[mod(k, N)];
    const k0 = R.int(1, 7), m = R.int(1, 3), q = R.int(1, 3);
    const ops = [
      { tex: `y[n]=x[(n-${m})\\bmod 8]`, Nn: 8, k: k0, Y: cmul(at(k0), cexp((-2 * PI * k0 * m) / N)), rule: `A circular delay by ${m}: $Y[k]=X[k]e^{-j2\\pi k\\cdot${m}/8}$.` },
      { tex: "y[n]=x[(-n)\\bmod 8]", Nn: 8, k: k0, Y: at(-k0), rule: `Circular time reversal: $Y[k]=X[-k]=X[${mod(-k0, N)}]$.` },
      { tex: "y[n]=(-1)^nx[n]", Nn: 8, k: k0, Y: at(k0 - 4), rule: `$(-1)^n=e^{j2\\pi\\cdot4n/8}$ shifts by 4 bins: $Y[k]=X[k-4]=X[${mod(k0 - 4, N)}]$.` },
      { tex: `y[n]=x[n]e^{j2\\pi\\cdot${q}n/8}`, Nn: 8, k: k0, Y: at(k0 - q), rule: `Modulation shifts by ${q} bins: $Y[k]=X[k-${q}]=X[${mod(k0 - q, N)}]$.` },
      { tex: "y[n]=x[n]\\text{ for }0\\le n<8,\\ 0\\text{ for }8\\le n<16", Nn: 16, k: 2 * k0, Y: cscale(at(k0), 0.5), rule: `Zero padding to 16: $Y[2k]=\\frac{8}{16}X[k]$, so $Y[${2 * k0}]=\\frac12X[${k0}]$.` },
      { tex: "y[n]=x[n\\bmod 8]\\text{ for }0\\le n<16", Nn: 16, k: 2 * k0, Y: at(k0), rule: `Two full periods: $Y[2k]=X[k]$ and $Y[2k+1]=0$, so $Y[${2 * k0}]=X[${k0}]$.` },
      { tex: "y[2n]=x[n],\\ y[2n+1]=0\\ (0\\le n<8)", Nn: 16, k: k0 + 8, Y: cscale(at(k0), 0.5), rule: `Inserting zeros: $Y[k]=\\frac12X[k\\bmod 8]$, so $Y[${k0 + 8}]=\\frac12X[${k0}]$.` },
      { tex: "y[n]=x[n]+x[(n-4)\\bmod 8]", Nn: 8, k: k0, Y: cscale(at(k0), 1 + (k0 % 2 ? -1 : 1)), rule: `$Y[k]=X[k](1+e^{-j\\pi k})=X[k](1+(-1)^k)$: ${k0 % 2 ? "0 for odd $k$" : "$2X[k]$ for even $k$"}.` },
    ];
    const sel = R.shuffle(ops).slice(0, 4);
    const sq = (v) => num(v);
    return {
      title: "DFT properties",
      statement: `**DFT properties.** $x[n]$ for $n=0,\\dots,7$ is ${x.join(", ")}. $X[k]$ is its 8-point DFT, $X[k]=\\frac18\\sum_{n=0}^{7}x[n]e^{-j2\\pi kn/8}$.

For each signal $y$ below, $Y$ is its DFT with the length shown (the same $\\frac1N$ convention). Find $Y$ at the index given. Use the properties: compute only the few values of $X$ that you need.

${sel.map((o, i) => `- **(${"abcd"[i]})** $${o.tex}$, $N=${o.Nn}$: find $Y[${o.k}]$.`).join("\n")}`,
      grids: [],
      parts: sel.flatMap((o, i) => [{ q: `(${"abcd"[i]}) $\\operatorname{Re}Y[${o.k}]$`, answer: sq(o.Y.re) }, { q: `(${"abcd"[i]}) $\\operatorname{Im}Y[${o.k}]$`, answer: sq(o.Y.im) }]),
      solution: `${sel.map((o, i) => `- **(${"abcd"[i]})** ${o.rule} $Y[${o.k}]=${cx(o.Y)}$.`).join("\n")}

All values of $X$: ${X.map((v, k) => `$X[${k}]=${cx(v)}$`).join(", ")}.`,
      _dp: { x, ops: sel.map((o) => ({ tex: o.tex, Nn: o.Nn, k: o.k })) },
    };
  }

  // 19b. Windowing, periodicity, and frequency resolution.
  function dftWindow(R) {
    // (a) DFT of a pulse of length L in an N-point window.
    const L = R.pick([2, 3, 4, 5]), qd = R.pick([2, 3, 4]), N = L * qd, k1 = R.int(1, qd - 1);
    const Xa = dft(Array.from({ length: N }, (_, n) => +(n < L)));
    // (b) A cosine that may not fit the window.
    const Nb = R.pick([32, 64]), r = R.int(1, 6) + R.pick([0, 0.5, 0.25]);
    let a = Math.round(8 * r), b = 4 * Nb; const gg = gcd(a, b); a /= gg; b /= gg; // Ω0/π = 2r/Nb = a/b
    const P = (2 * b) / gcd(a, 2), periodic = Nb % P === 0, onBin = Number.isInteger(r);
    const peakK = r % 1 === 0.5 ? null : Math.round(r);
    const om = `${a === 1 ? "" : a}\\pi n/${b}`;
    // (c) Hz and resolution.
    const fs = R.pick([8000, 16000, 44100]), Nc = R.pick([512, 1024, 2048]), kc = R.int(5, 40), want = R.pick([2, 5, 10]);
    let Nmin = 1; while (fs / Nmin > want) Nmin *= 2;
    const parts = [
      { q: "(a) $X[0]$", answer: frac(L / N) }, { q: "(a) smallest $k>0$ with $X[k]=0$", answer: String(qd) },
      { q: `(a) number of $k$ in $1\\le k\\le${N - 1}$ with $X[k]=0$`, answer: String(L - 1) }, { q: `(a) $|X[${k1}]|$`, answer: num(cabs(Xa[k1])) },
      { q: "(b) fundamental period of $x[n]$ (samples)", answer: String(P) }, { q: `(b) is $x[n]$ periodic in $N=${Nb}$? (Yes or No)`, accept: periodic ? ["yes", "y"] : ["no", "n"] },
    ];
    if (peakK !== null) parts.push({ q: `(b) $k$ of the largest $|X[k]|$ for $0<k<${Nb / 2}$`, answer: String(peakK) });
    if (onBin) parts.push({ q: `(b) that largest value $|X[k]|$`, answer: "1/2" });
    parts.push({ q: "(c) frequency of bin $k$ (Hz)", answer: num((kc * fs) / Nc) }, { q: "(c) largest error of that estimate, half a bin (Hz)", answer: num(fs / (2 * Nc)) },
      { q: `(c) smallest $N$ (a power of 2) with bin spacing at most ${want} Hz`, answer: String(Nmin) });
    return {
      title: "DFT windows and resolution",
      statement: `**Part a.** $x[n]=1$ for $0\\le n<${L}$ and 0 otherwise. $X[k]$ is its $N=${N}$ point DFT (with $\\frac1N$).

**Part b.** $x[n]=\\cos(${om})$, and $X[k]$ is its $N=${Nb}$ point DFT over $0\\le n<${Nb}$.

**Part c.** A recording is sampled at $f_s=${fs}$ Hz. An $N=${Nc}$ point DFT has its largest peak at $k=${kc}$.`,
      grids: [], parts,
      solution: `**Part a.** $X[k]=\\frac1N\\sum_{n=0}^{${L - 1}}e^{-j2\\pi kn/${N}}=\\frac1N\\,\\frac{\\sin(\\pi k${L}/${N})}{\\sin(\\pi k/${N})}e^{-j\\pi k(${L}-1)/${N}}$: samples of the DTFT of the pulse, scaled by $\\frac1N$. $X[0]=\\frac{${L}}{${N}}$. The numerator is 0 when $k${L}/${N}$ is an integer, that is $k$ a multiple of $${qd}$: $k=${Array.from({ length: L - 1 }, (_, i) => (i + 1) * qd).join(", ")}$ (${L - 1} values). $|X[${k1}]|=\\frac1{${N}}\\left|\\frac{\\sin(${L}\\pi\\cdot${k1}/${N})}{\\sin(\\pi\\cdot${k1}/${N})}\\right|=${nice(cabs(Xa[k1]))}$.

**Part b.** $\\Omega_0=${a === 1 ? "" : a}\\pi/${b}=2\\pi\\cdot${r}/${Nb}$, so the window holds ${r} cycles. The period is the smallest $P$ with $\\Omega_0P$ a multiple of $2\\pi$: $P=${P}$. ${periodic ? `$${Nb}$ is a multiple of $${P}$, so $x$ is periodic in $N$.` : `$${Nb}$ is not a multiple of $${P}$, so $x$ is not periodic in $N$: the periodic extension has a jump, and the energy leaks into many bins.`} ${onBin ? `On a bin, the DFT is exactly $\\frac12$ at $k=${r}$ and $k=${Nb - r}$ and 0 elsewhere.` : peakK !== null ? `The peak is at the nearest bin, $k=${peakK}$, with leakage around it.` : ""}

**Part c.** Bin $k$ is at $f=k\\frac{f_s}{N}=${kc}\\cdot\\frac{${fs}}{${Nc}}=${nice((kc * fs) / Nc)}$ Hz. The true peak can be up to half a bin away: $\\frac{f_s}{2N}=${nice(fs / (2 * Nc))}$ Hz. Bin spacing is $f_s/N$; it is at most ${want} Hz when $N\\ge${nice(fs / want)}$, so $N=${Nmin}$. More real data (a longer window) is what improves resolution.`,
      _dw: { L, N, k1, Nb, r, fs, Nc, kc, want },
    };
  }

  // 19c. Inverse DFT: X[k] given, find x[n] (synthesis has no 1/N).
  function idft(R) {
    const N = R.pick([4, 6, 8]), Xs = Array.from({ length: N }, () => C(0));
    const add = (k, v) => { Xs[mod(k, N)] = cadd(Xs[mod(k, N)], v); };
    let desc;
    if (R.chance(0.35)) {
      const al = R.pick([1, 2, -1]), be = R.pick([1, -1, 2, 3]), m = R.int(1, N - 1);
      for (let k = 0; k < N; k++) { add(k, C(al / N)); add(k, cscale(cexp((-2 * PI * k * m) / N), be / N)); }
      desc = `$X[k]=\\frac1{${N}}\\left(${al}${be < 0 ? "-" : "+"}${Math.abs(be) === 1 ? "" : Math.abs(be)}e^{-j2\\pi k\\cdot${m}/${N}}\\right)$ for all $k$.`;
    } else {
      const k1 = N === 6 ? R.pick([1, 2]) : N === 8 ? 2 : 1, a0 = R.int(-1, 2), c = R.pick([1, 2, -2]);
      add(0, C(a0)); add(k1, C(c / 2)); add(-k1, C(c / 2));
      if (N !== 6 && R.chance(0.7)) { const sv = R.pick([1, 2, -1]), k2 = N === 8 ? 2 : 1; add(k2, C(0, -sv / 2)); add(-k2, C(0, sv / 2)); }
      if (R.chance(0.5)) add(N / 2, C(R.pick([1, -1]) / 2));
      desc = `${Xs.map((v, k) => (cabs(v) > 1e-12 ? `$X[${k}]=${cx(v)}$` : null)).filter(Boolean).join(", ")}, and $X[k]=0$ for the other $k$ in $0\\le k<${N}$.`;
    }
    const x = Array.from({ length: N }, (_, n) => snap(Xs.reduce((s, v, k) => s + v.re * Math.cos((2 * PI * k * n) / N) - v.im * Math.sin((2 * PI * k * n) / N), 0)));
    return {
      title: "Inverse DFT",
      statement: `**Inverse DFT.** An $N=${N}$ point DFT (6.3000 convention: $X[k]=\\frac1N\\sum_n x[n]e^{-j2\\pi kn/N}$, so $x[n]=\\sum_{k=0}^{N-1}X[k]e^{j2\\pi kn/N}$) has ${desc} Find $x[n]$ for $0\\le n<${N}$. Fractions like 1/2 are fine.`,
      grids: [{ id: "x", caption: "x[n]", rowLabels: ["x[n]"], colLabels: x.map((_, n) => String(n)), answer: [x.map(frac)], kind: "value" }],
      parts: [{ q: "$\\sum_{n}x[n]$", answer: num(N * Xs[0].re) }],
      solution: `Pair the terms. $X[k_0]=X[N-k_0]=\\frac c2$ gives $c\\cos(2\\pi k_0n/N)$. $X[k_0]=-\\frac{js}2$, $X[N-k_0]=\\frac{js}2$ gives $s\\sin(2\\pi k_0n/N)$. $X[N/2]=d$ gives $d(-1)^n$. $X[k]=\\frac1Ne^{-j2\\pi km/N}$ for all $k$ is $\\delta[n-m]$ (remember the $\\frac1N$ in the analysis). The sum $\\sum_nx[n]=N\\,X[0]$.

$x[n]$: ${x.map((v, n) => `$x[${n}]=${nice(v)}$`).join(", ")}.`,
      _id2: { N, X: Xs },
    };
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
    ["A causal LTI system has $h[n]=0$ for all $n<0$.", true, "$y[n]=\\sum_k h[k]x[n-k]$ uses future inputs exactly when some $h[k]\\ne0$ with $k<0$."],
    ["An LTI system is BIBO stable exactly when $\\sum_n|h[n]|$ is finite.", true, "If the sum is finite, $|y|\\le B\\sum|h|$. If not, the input $x[n]=\\operatorname{sign}(h[-n])$ gives an unbounded $y[0]$."],
    ["An LTI system can turn $\\cos(\\Omega_0n)$ into $\\cos(2\\Omega_0n)$.", false, "LTI systems only scale and shift each frequency. They cannot make new frequencies."],
    ["A homogeneous system is always linear.", false, "$y=\\sqrt[3]{x[n]^3+x[n-1]^3}$ is homogeneous but not additive."],
    ["The response of an LTI system to $u[n]$ is the running sum of $h[n]$.", true, "$u[n]=\\sum_{k\\ge0}\\delta[n-k]$, so $s[n]=\\sum_{k\\le n}h[k]$."],
    ["Swapping the order of two LTI systems in a cascade can change the output.", false, "Convolution commutes: $h_1*h_2=h_2*h_1$."],
    ["$h[n]=(1.1)^nu[n]$ is the unit-sample response of a stable system.", false, "$\\sum(1.1)^n$ diverges."],
    ["A memoryless LTI system is a constant gain, $y[n]=c\\,x[n]$.", true, "Memoryless means $h[n]=0$ for $n\\ne0$, so $h=c\\,\\delta$."],
    ["$y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]$ is time-invariant.", true, "Shifting $x$ does not change the total sum, and the output is the same constant at every $n$."],
    ["$y[n]=x[n]\\cos(\\pi n/2)$ is time-invariant.", false, "Modulation by a fixed cosine depends on absolute time."],
    ["The frequency response of $y[n]=x[n]+\\alpha\\,x[n-m]$ has $m$ peaks for $0\\le\\Omega<2\\pi$.", true, "$e^{-jm\\Omega}$ goes around the unit circle $m$ times."],
    ["The inverse of $h_1[n]=\\delta[n]+\\tfrac12\\delta[n-1]$ is $\\delta[n]-\\tfrac12\\delta[n-1]$.", false, "The product leaves $-\\frac14\\delta[n-2]$. The inverse is $(-\\frac12)^nu[n]$."],
    ["Multiplying $x(t)$ by $e^{j\\omega_ct}$ gives a real signal if $x(t)$ is real.", false, "$e^{j\\omega_ct}x(t)$ is complex. A real transmitted signal needs both shifts: $2\\cos(\\omega_ct)x(t)$."],
    ["In synchronous demodulation, a carrier phase error $\\phi$ scales the recovered message by $\\cos\\phi$.", true, "$\\cos(\\omega_ct)\\cos(\\omega_ct+\\phi)=\\frac12\\cos\\phi+\\frac12\\cos(2\\omega_ct+\\phi)$."],
    ["Demodulating $x(t)\\cos(\\omega_ct)$ with $\\sin(\\omega_ct)$ recovers $x(t)$ after the low-pass filter.", false, "$\\cos\\sin=\\frac12\\sin(2\\omega_ct)$ has no low-frequency part: the output is 0."],
    ["Double-sideband AM of a message band-limited to $W$ occupies a band of width $2W$ around the carrier.", true, "Copies of $X$ from $\\omega_c-W$ to $\\omega_c+W$."],
    ["Envelope detection of $(x(t)+C)\\cos(\\omega_ct)$ works for any $C>0$.", false, "It needs $x(t)+C\\ge0$ for all $t$, so $C\\ge-\\min x$."],
    ["In AM with carrier, most of the transmitted power can be in the carrier.", true, "For speech the carrier can need about 1000 times the message power (lecture)."],
    ["Two stations with bandwidths $W_1$ and $W_2$ do not overlap if their carriers are at least $W_1+W_2$ apart.", true, "Station $i$ occupies $\\omega_i\\pm W_i$."],
    ["An antenna for efficient transmission should be about one wavelength in size, so voice-band frequencies need antennas hundreds of kilometers long.", true, "$\\lambda=c/f$: 3 kHz gives 100 km. Modulation moves the message to a frequency the medium suits."],
    ["$h[n]=h_{LPF}[n]\\cos(\\Omega_cn)$ is a band-pass filter centered at $\\pm\\Omega_c$.", true, "Multiplying by a cosine shifts $H_{LPF}$ to $\\pm\\Omega_c$ (recitation)."],
    ["The DFT $X[k]$ equals $\\frac1N$ times samples of the DTFT of the windowed signal at $\\Omega=2\\pi k/N$.", true, "$X[k]=\\frac1NX_w(2\\pi k/N)$, with $x_w[n]=x[n]$ for $0\\le n<N$."],
    ["Zero padding a signal before the DFT improves its frequency resolution.", false, "It only samples the same DTFT more finely. Resolution needs more real data, a longer window."],
    ["A cosine with a whole number of cycles in the DFT window gives exactly two nonzero DFT values (or one, at $k=0$ or $N/2$).", true, "It is periodic in $N$, so the DFT equals its Fourier series coefficients."],
    ["The main lobe of the DTFT of a length-$N$ rectangular window has width $4\\pi/N$.", true, "The first zeros are at $\\pm2\\pi/N$."],
    ["The DFT of $x[(n-m)\\bmod N]$ is $X[k]e^{-j2\\pi km/N}$.", true, "Circular shift property."],
    ["For a real signal, $X[N-k]=X^*[k]$.", true, "Conjugate symmetry of the DFT."],
    ["$x[n]=\\cos(3\\pi n/64)$ is periodic with period 64.", false, "$\\frac{3\\pi}{64}P=2\\pi m$ needs $P=\\frac{128m}{3}$: the period is 128."],
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
    s_sysprops: { name: "System properties", blurb: "Additive? Homogeneous? Time-invariant? For a table of systems, like the property tables on past quizzes.", gen: sysProps },
    s_sysclass: { name: "System types", blurb: "Linear, time-invariant, causal, memoryless, and BIBO stable, for 42 systems, with a reason for each answer.", gen: sysClass },
    s_couldlti: { name: "Could it be LTI?", blurb: "Input-output pairs: new frequencies, harmonics of square waves and |sin|, DT aliases, and two pairs from one system (HW6 Input-Output Pairs style).", gen: couldLTI },
    s_sysid: { name: "System identification", blurb: "Find h[n], or the constants of a difference or differential equation, from measured input-output pairs.", gen: sysId },
    s_diffeq: { name: "Difference equations", blurb: "Difference equation to h[n], H(0), and H(π); peaks and valleys of x+αx[n−m] and x+αy[n−m]; h[n] back to a difference equation.", gen: diffEq },
    s_blocks: { name: "Block diagrams", blurb: "Cascade, parallel, and feedback connections; echo removal and inverse systems; h[n] from a step response.", gen: blocks },
    s_ctsys: { name: "CT systems", blurb: "First-order differential equations (h(t), step response, gain, phase), x(t)−x(t−T), and running integrals.", gen: ctSys },
    s_sinusoid: { name: "Sinusoids through filters", blurb: "Constant and sinusoidal inputs to FIR filters: A, φ, and which frequency survives a zero of H (HW6 Expressible Filtering style).", gen: sinusoid },
    s_dtconv: { name: "DT convolution", blurb: "Convolution by superposition, self-convolution of pulses, and step responses.", gen: dtConv },
    s_circconv: { name: "Circular convolution via DFTs", blurb: "g whose DFT is F[k]·F[k] for several N: linear convolution, wrap, and divide by N (Fall 2023 style).", gen: circConv },
    s_freqresp: { name: "DT frequency response", blurb: "H(0), H(π), |H|, ∠H, and the A cos + B sin output for FIR and IIR systems.", gen: freqResp },
    s_cascade: { name: "CT cascades", blurb: "Gain and phase of cascaded first-order systems driven by a cosine (Spring 2022 style).", gen: ctCascade },
    s_am: { name: "Amplitude modulation", blurb: "Where the AM spectrum lives, the demodulator filter gain and cutoff range, and the minimum carrier.", gen: modulation },
    s_demod: { name: "Demodulation errors", blurb: "Synchronous demodulation with a phase error, a frequency error, or a sine carrier: what comes out of the low-pass filter.", gen: demod },
    s_fdm: { name: "Frequency-division multiplexing", blurb: "Station bands, overlap, the receiver's gain and cutoff range, and the closest legal carrier.", gen: fdm },
    s_amcarrier: { name: "AM with carrier", blurb: "Envelope detection, modulation index, impulse areas in Y(ω), and carrier versus message power.", gen: amCarrier },
    s_ammatch: { name: "Modulation spectra: matching", blurb: "Match x·cos, x·cos², x·e^{jωt}, x·cos·sin, carrier offsets, (x+1)·cos, and x(2t)·cos to spectrum plots.", gen: amMatch },
    s_dftprops: { name: "DFT properties", blurb: "Y[k] from X[k] for circular shifts, flips, (−1)ⁿ, modulation, zero padding, repetition, and inserted zeros.", gen: dftProps },
    s_dftwin: { name: "DFT windows and resolution", blurb: "DFT of a pulse (zeros and X[0]), cosines that do or do not fit the window, peak frequency in Hz, and the N for a given resolution.", gen: dftWindow },
    s_idft: { name: "Inverse DFT", blurb: "x[n] from sparse X[k]: cosines, sines, (−1)ⁿ, and shifted impulses, with the 1/N convention.", gen: idft },
    s_dftnum: { name: "DFT computations", blurb: "Bin spacing, bin indices, small DFTs by hand, conjugate symmetry, and Parseval.", gen: dftNumbers },
    s_facts: { name: "True or false", blurb: "Quick checks on transform properties, LTI systems, sampling, and the DFT.", gen: facts },
  };
  function generate(type, seed) { figSeq = 0; return Object.assign({ type, seed }, DRILLS[type].gen(rng(seed))); }
  const intro = "Each drill makes a new problem from a random seed, for 6.3000 Quiz 2 (everything up to Oct 29 and HW8). The matching drills draw their plots from the actual transforms, like the matching problems on past quizzes. Conventions follow 6.3000: Fourier series and DFT analysis carry 1/T or 1/N. Enter numbers or expressions such as 1/pi, sqrt(2)/2, or -3/8. The link of a drill keeps its seed.";

  root.Drills6300 = { DRILLS, generate, rng, intro, _dft: dft, _systems: SYSTEMS, _panels: panels, _cabs: cabs };
})(typeof window !== "undefined" ? window : globalThis);
