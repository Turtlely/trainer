// Official 6.3000 problems: past Quiz 2 exams (Spring 2022, Fall 2022, Fall 2023, Spring 2025)
// from sigproc.mit.edu/fall26/q2_info. Text is transcribed. Every plot and block diagram is redrawn
// as SVG from the signal that it shows (the formula, or the samples read from the official plot),
// with the original panel letters. Numeric parts are graded against the official answers; text
// parts (plot letters, Yes/No, "f0*f2") are graded by app.js partToks.
// scripts/check-real-6300.js recomputes every matching answer from the panel data.
// Load after fig.js and drills-6300.js.
(function (root) {
  const t = String.raw;
  const P = [];
  const D = root.Drills6300, F = root.Fig, PI = Math.PI;
  const PDF = "https://sigproc.mit.edu/_static/fall26/practice_quizzes/";
  const TERM = { "2022S": "Spring 2022", "2022F": "Fall 2022", "2023F": "Fall 2023", "2025S": "Spring 2025" };
  const links = (term) => `Official PDFs: [quiz](${PDF}Q2-${term}.pdf) · [solutions](${PDF}Q2-${term}-solutions.pdf).`;
  const part = (q, answer) => ({ q, answer });
  // A text part: answer is shown in the key; accept lists other spellings.
  const tpart = (q, answer, hint = "letter", more = []) => ({ q, answer, accept: [answer, ...more], hint });
  const yn = (q, v) => tpart(q, v ? "Yes" : "No", "Yes or No");
  const quiz = (id, term, n, lec, title, topics, statement, solution, parts = []) => P.push({
    id, course: "6.3000", lec, title: `${title} (${TERM[term]} Q2 P${n})`, diff: "Hard", topics, parts,
    real: "quiz", source: `${TERM[term]} Quiz 2, Problem ${n}`, text: true,
    statement: statement + `\n\n${links(term)}`, hints: [], solution,
  });
  const fig = (name, markup) => { F.def(name, markup); return `@fig ${name}`; };
  // Panel data for scripts/check-real-6300.js.
  const DBG = (root.Real6300Data = root.Real6300Data || {});

  // ---------------------------------------------------------------- shared helpers
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  const ints = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const C = (re, im = 0) => ({ re, im });
  const cmul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const cexp = (th) => C(Math.cos(th), Math.sin(th));
  const cabs = (a) => Math.hypot(a.re, a.im);
  const carg = (a) => { if (cabs(a) < 1e-9) return 0; const th = Math.atan2(a.im, a.re); return th <= -PI + 1e-9 ? PI : th; };
  const mod = (a, n) => ((a % n) + n) % n;
  const norm = (ys) => { const m = Math.max(1e-12, ...ys.map(Math.abs)); return ys.map((v) => v / m); };
  const stem = (label, xs, ys, o = {}) => Object.assign({ label, kind: "stem", xs, ys }, o);
  const curve = (label, xs, f, o = {}) => Object.assign({ label, kind: "line", xs, ys: xs.map(f) }, o);
  // Piecewise-linear signal from [t, value] corners (repeat t for a jump).
  const pw = (label, pts, o = {}) => Object.assign({ label, kind: "line", xs: pts.map((p) => p[0]), ys: pts.map((p) => p[1]) }, o);
  const tk = (xs) => xs.map((x) => [x, String(x).replace("-", "−")]);
  const piT = (m, lab) => [m * PI, lab];
  const W_TICKS = [piT(-2, "−2π"), piT(-1, "−π"), [0, "0"], piT(1, "π"), piT(2, "2π")];
  const ANG_TICKS = [[PI, "π"], [PI / 2, "π/2"], [-PI / 2, "−π/2"], [-PI, "−π"]];

  // Block diagram: items = [signal, system, signal, ..., signal]. An empty signal label joins two
  // boxes with one arrow. o.outer draws a dashed box with that label around all the systems.
  function chain(items, o = {}) {
    const cw = (s) => (s ? s.length * 7 + 8 : 0);
    const y = o.outer ? 44 : 22, bx = [];
    let x = 4, s = "";
    items.forEach((it, i) => {
      if (i % 2 === 0) {
        if (it) { s += F.t(x + cw(it) / 2, y, it, { i: true }); x += cw(it); }
        if (i < items.length - 1 && (it || i === 0)) { s += F.w([[x + 2, y], [x + 30, y]]); x += 32; }
      } else {
        s += F.box(x, y - 15, 52, 30, it); bx.push(x); x += 52;
        s += F.w([[x, y], [x + 30, y]]); x += 32;
      }
    });
    if (o.outer) {
      const x0 = bx[0] - 12, x1 = bx[bx.length - 1] + 64;
      s = F.box(x0, y - 27, x1 - x0, 54, "", { fill: false, dash: true, c: "mut" }) + F.t((x0 + x1) / 2, y - 36, o.outer) + s;
    }
    return F.svg(x + 4, y + 32, s);
  }
  // Numerical convolution of two functions on a grid (midpoint rule over tau in [lo, hi]).
  function cconv(fa, fb, ts, lo, hi, dt) {
    const taus = [];
    for (let v = lo + dt / 2; v < hi; v += dt) taus.push(v);
    const fav = taus.map(fa);
    return ts.map((tt) => { let s = 0; taus.forEach((v, i) => { if (fav[i]) s += fav[i] * fb(tt - v); }); return s * dt; });
  }
  // Linear convolution of finite DT sequences.
  const dconv = (a, b) => { const y = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((z, j) => { y[i + j] += x * z; })); return y; };

  // ================================================================ Spring 2025
  {
    const fPulse = pw("f(t)", [[-4, 0], [-3, 0], [-3, 1], [-2, 1], [-2, 0], [2, 0], [2, 1], [3, 1], [3, 0], [4, 0]], { yrange: [-0.2, 1.25], xticks: tk([-3, -2, 0, 2, 3]), xlab: "t" });
    const ws = range(-2 * PI, 2 * PI, 600).map((w) => w + 1e-7);
    const G = (w) => C(1 - Math.cos(2 * w), Math.sin(2 * w)); // 1 - e^{-j2w}
    const gSketch = [curve("|G(Ω)|", ws, (w) => cabs(G(w)), { yrange: [-0.2, 2.2], xticks: W_TICKS, yticks: [[2, "2"]], xlab: "Ω" }),
      curve("∠G(Ω)", ws, (w) => carg(G(w)), { yrange: [-PI / 2 - 0.3, PI / 2 + 0.3], xticks: W_TICKS, yticks: [[PI / 2, "π/2"], [-PI / 2, "−π/2"]], xlab: "Ω", padL: 36 })];
    F.def("sp-q25-p1-f", D._panels([fPulse], 1, 340, 100));
    F.def("sp-q25-p1-g", D._panels(gSketch, 2, 300, 120));
    const tbl = [["$y[n]=\\left(-\\frac12\\right)^n\\big(x[n]+1\\big)$", 0, 0, 0], ["$y[n]=\\sin(x[n])$", 0, 0, 1], ["$y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,d\\tau$", 1, 1, 1], ["$y(t)=t\\,x(t)$", 1, 1, 0]];
    quiz(3501, "2025S", 1, 8, "Short-answer questions: systems and frequency responses", ["Systems", "Fourier Transform", "Frequency Response"],
      t`**Part a.** For each system, decide whether it is additive, homogeneous, and time-invariant ($x$ is the input, $y$ the output). Enter Yes or No in the boxes below.

| System | additive? | homogeneous? | time-invariant? |
|---|---|---|---|
| $y[n]=\left(-\frac12\right)^n\big(x[n]+1\big)$ | | | |
| $y[n]=\sin(x[n])$ | | | |
| $y(t)=\int_{-\infty}^{t}x(\tau)\,d\tau$ | | | |
| $y(t)=t\,x(t)$ | | | |

**Part b.** Find a closed form (no integrals or derivatives) for the frequency response $F(\omega)$ of the LTI system with impulse response $f(t)=1$ if $2<|t|<3$ and $0$ otherwise.

@fig sp-q25-p1-f

**Part c.** Find the frequency response of the LTI system with $g[n]=\delta[n]-\delta[n-2]$, and sketch its magnitude and angle for $-2\pi\le\Omega\le2\pi$. Label the key points.`,
      t`**Part a.**

| System | additive | homogeneous | time-invariant |
|---|---|---|---|
| $\left(-\frac12\right)^n(x[n]+1)$ | No | No | No |
| $\sin(x[n])$ | No | No | Yes |
| $\int_{-\infty}^t x(\tau)d\tau$ | Yes | Yes | Yes |
| $t\,x(t)$ | Yes | Yes | No |

The $+1$ breaks additivity and homogeneity, and $\left(-\frac12\right)^n$ depends on $n$. A substitution $\lambda=\tau-t_0$ shows the integrator is time-invariant. $t\,x(t-t_0)\ne(t-t_0)x(t-t_0)$.

**Part b.** $f$ is a pulse on $(-3,3)$ minus a pulse on $(-2,2)$: $F(\omega)=\dfrac{2\sin3\omega}{\omega}-\dfrac{2\sin2\omega}{\omega}$.

**Part c.** $G(\Omega)=1-e^{-j2\Omega}=e^{-j\Omega}(e^{j\Omega}-e^{-j\Omega})=j\,2\sin(\Omega)\,e^{-j\Omega}$. The magnitude is $2|\sin\Omega|$ (zeros at $0,\pm\pi,\pm2\pi$, peaks 2 at $\pm\pi/2$). The angle is $\frac\pi2-\Omega$ for $0<\Omega<\pi$, then jumps by $\pi$ where $\sin\Omega$ changes sign: a sawtooth between $-\frac\pi2$ and $\frac\pi2$.

@fig sp-q25-p1-g`,
      [...tbl.flatMap(([s, a, h, ti], i) => [yn(`a${i + 1}: ${s} additive?`, a), yn(`a${i + 1}: homogeneous?`, h), yn(`a${i + 1}: time-invariant?`, ti)]),
        part("Part b: $F(0)$", "2"), part("Part c: $|G(\\pi/2)|$", "2")]);
  }

  F.def("sp-q25-p2-a", chain(["x[n]", "S₁", "y₁[n]"]));
  F.def("sp-q25-p2-b", chain(["x[n]", "S₁", "y₁[n]", "S₂", "y₂[n]"], { outer: "S₁₂" }));
  F.def("sp-q25-p2-c", chain(["x[n]", "S₁", "y₁[n]", "S₂", "y₂[n]", "S₃", "y₃[n]"], { outer: "S₁₂₃" }));
  quiz(3502, "2025S", 2, 9, "Cascaded systems with step responses", ["Convolution", "Cascade", "Geometric Sums"],
    t`**Part a.** System $S_1$ is LTI with unit-sample response $h_1[n]=u[n]$ (1 for $n\ge0$, else 0).

@fig sp-q25-p2-a

The input is $x[n]=(0.9)^n$ for $n\ge0$ and 0 otherwise. Find $y_1[0]$ to $y_1[4]$ and a closed form for $y_1[n]$ (a fixed number of operations for every $n$).

**Part b.** $S_{12}$ is $S_1$ followed by $S_2$, with $h_1[n]=h_2[n]=u[n]$. Find a closed form for the unit-sample response $h_{12}[n]$.

@fig sp-q25-p2-b

**Part c.** $S_{123}$ cascades three systems with $h_1=h_2=h_3=u[n]$. Find $h_{123}[0]$ to $h_{123}[4]$.

@fig sp-q25-p2-c`,
    t`**Part a.** $y_1[n]=\sum_{m=0}^{n}0.9^m=\dfrac{1-0.9^{n+1}}{1-0.9}=10-9(0.9)^n$: $1,\ 1.9,\ 2.71,\ 3.439,\ 4.0951$.

**Part b.** $h_{12}=u*u$: $\sum_{m=0}^{n}1=(n+1)u[n]$.

**Part c.** $h_{123}[n]=\sum_{m=0}^{n}(m+1)=\dfrac{(n+1)(n+2)}{2}$: $1,3,6,10,15$.`,
    [part("$y_1[0]$", "1"), part("$y_1[1]$", "1.9"), part("$y_1[2]$", "2.71"), part("$y_1[3]$", "3.439"), part("$y_1[4]$", "4.0951"),
      part("$h_{12}[5]$", "6"), part("$h_{123}[0]$", "1"), part("$h_{123}[1]$", "3"), part("$h_{123}[2]$", "6"), part("$h_{123}[3]$", "10"), part("$h_{123}[4]$", "15")]);

  // P3: the nine magnitude plots in the official order A-I. The modulation frequency is 2π.
  {
    const Fw = (w) => (Math.abs(w) < 1e-12 ? 2 : (2 * Math.sin(w)) / w), dF = (w) => (Fw(w + 1e-4) - Fw(w - 1e-4)) / 2e-4;
    const ws = range(-5 * PI, 5 * PI, 500), W2 = 2 * PI;
    const official = [["A", (w) => Math.abs(Fw(w))], ["B", (w) => Math.abs(Fw(w - W2))], ["C", (w) => Math.abs(Fw(w + W2))], ["D", (w) => Math.abs(Fw(w / 2))],
      ["E", (w) => Fw(w) ** 2], ["F", (w) => Math.abs(Fw(2 * w))], ["G", (w) => Math.abs(dF(w))], ["H", (w) => Math.abs(Fw(w - W2) - Fw(w + W2))], ["I", (w) => Math.abs(Fw(w - W2) + Fw(w + W2))]];
    const xt = [piT(-4, "−4π"), piT(-2, "−2π"), [0, "0"], piT(2, "2π"), piT(4, "4π")];
    const pan = official.map(([lab, m]) => ({ label: lab, kind: "line", xs: ws, ys: norm(ws.map(m)), yrange: [0, 1.05], xticks: xt, xlab: "ω" }));
    F.def("sp-q25-p3-f", D._panels([pw("f(t)", [[-3, 0], [-1, 0], [-1, 1], [1, 1], [1, 0], [3, 0]], { yrange: [-0.1, 1.2], xticks: tk([-3, -1, 0, 1, 3]), xlab: "t" }),
      { label: "F(ω)", kind: "line", xs: ws, ys: ws.map(Fw), yrange: [-0.6, 2.1], xticks: xt, yticks: [[2, "2"]], xlab: "ω" }], 2, 280, 104));
    F.def("sp-q25-p3", D._panels(pan, 3, 200, 92));
    DBG[3503] = { xs: ws, panels: Object.fromEntries(pan.map((q) => [q.label, q.ys])) };
    const ask = [["$f(t/2)$", "F"], ["$(f*f)(t)$", "E"], ["$f(2t)$", "D"], ["$f(t-1)$", "A"], ["$t\\,f(t)$", "G"], ["$f(t)\\sin(2\\pi t)$", "H"], ["$f(t)\\cos(2\\pi t)$", "I"], ["$f(t)e^{j2\\pi t}$", "B"], ["$f(t)e^{-j2\\pi t}$", "C"]];
    quiz(3503, "2025S", 3, 6, "Pulsed relations: transform properties matching", ["Fourier Transform", "Properties", "Matching"],
      t`Let $f(t)=1$ for $|t|<1$ and 0 otherwise, with Fourier transform $F(\omega)=2\dfrac{\sin\omega}{\omega}$.

@fig sp-q25-p3-f

Each plot below shows the magnitude of the Fourier transform of a signal derived from $f(t)$. The magnitude scales are not given and may differ from one plot to another.

@fig sp-q25-p3

Identify which plot (A–I) shows the magnitude for each of: ${ask.map((a) => a[0]).join(", ")}.`,
      t`${ask.map(([s, l]) => `${s}: **${l}**`).join(". ")}.

- $f(t/2)\leftrightarrow2F(2\omega)$: narrower and taller. $f(2t)\leftrightarrow\frac12F(\omega/2)$: wider.
- $f*f\leftrightarrow F^2$: the side lobes shrink fast.
- $f(t-1)\leftrightarrow e^{-j\omega}F(\omega)$: the magnitude does not change.
- $t\,f(t)\leftrightarrow j\,dF/d\omega$: zero at $\omega=0$, where $F$ is flat.
- $e^{\pm j2\pi t}$ shifts $F$ to $\pm2\pi$. $\cos(2\pi t)$ gives $\frac12[F(\omega-2\pi)+F(\omega+2\pi)]$ and $\sin(2\pi t)$ gives $\frac1{2j}[F(\omega-2\pi)-F(\omega+2\pi)]$. Both are 0 at $\omega=0$ because $F(\pm2\pi)=0$; they differ between the two main lobes, where the sum and the difference of the side lobes differ.`,
      ask.map(([s, l]) => tpart(s, l)));
  }

  // P4: four pulses of length 1-4, periodic in N=12.
  {
    const N = 12, ns = ints(0, 11), ks = ints(-6, 6);
    const sig = [1, 2, 3, 4].map((L) => ns.map((n) => +(n < L)));
    const mags = sig.map((x) => { const X = D._dft(x).map(D._cabs); return ks.map((k) => X[mod(k, N)]); });
    const list = [];
    sig.forEach((x, i) => {
      list.push(stem(`f${"₁₂₃₄"[i]}[n]`, ns, x, { yrange: [0, 1.15], xticks: tk([0, 2, 4, 6, 8, 10]), xlab: "n" }));
      list.push(stem(`|F${"₁₂₃₄"[i]}[k]|`, ks, norm(mags[i]), { yrange: [0, 1.15], xticks: tk([-6, -4, -2, 0, 2, 4, 6]), xlab: "k" }));
    });
    F.def("sp-q25-p4", D._panels(list, 2, 270, 86));
    F.def("sp-q25-p4-s", chain(["f₂[n]", "S₂₄", "f₄[n]"]));
    F.def("sp-q25-p4-io", chain(["fᵢ[n]", "Sᵢₒ", "fₒ[n]"]));
    const H = ks.map((k) => cabs(C(1 + Math.cos((PI * k) / 3), -Math.sin((PI * k) / 3))));
    F.def("sp-q25-p4-h", D._panels([stem("|H₂₄[k]|", ks, H, { yrange: [0, 2.2], yticks: [[2, "2"]], xticks: tk([-6, -4, -2, 0, 2, 4, 6]), xlab: "k" })], 1, 320, 100));
    const rows = ["none", "1 3", "1 2 4", "1 2 3"];
    quiz(3504, "2025S", 4, 13, "Pulses in, pulses out (DTFS and LTI systems)", ["DT Fourier Series", "LTI Systems"],
      t`The first 12 samples of four **periodic** signals, each periodic in $N=12$, are shown in the left column. The magnitudes of their Fourier series coefficients are shown in the right column (each scaled to its own peak).

@fig sp-q25-p4

**Part a.** System $S_{24}$ produces $f_4[n]$ as output when $f_2[n]$ is its input.

@fig sp-q25-p4-s

Find the unit-sample response $h_{24}[n]$ and the frequency response $H_{24}[k]$, and sketch the magnitude of $H_{24}[k]$.

**Part b.** There are 16 possible systems $S_{io}$, each defined by its input $f_i[n]$ and its output $f_o[n]$ ($i,o\in\{1,2,3,4\}$).

@fig sp-q25-p4-io

Some of these systems could be LTI; others cannot. For each input $i$, list the outputs $o$ for which $S_{io}$ **cannot** be LTI (for example "1 3", or "none").`,
      t`**Part a.** $f_4[n]=f_2[n]+f_2[n-2]$, so $h_{24}[n]=\delta[n]+\delta[n-2]$ and $H_{24}[k]=1+e^{-j\pi k/3}$ (with $N=12$, a delay of 2 multiplies harmonic $k$ by $e^{-j2\pi k\cdot2/12}$). $|H_{24}[k]|=2|\cos(\pi k/6)|$: 2 at $k=0$, 0 at $k=\pm3$.

@fig sp-q25-p4-h

**Part b.** An LTI system can only scale each harmonic: $F_o[k]=H[k]F_i[k]$. So $S_{io}$ cannot be LTI if $F_i[k]=0$ at some $k$ where $F_o[k]\ne0$.

- Row 1: every $F_1[k]$ is nonzero, so every $S_{1o}$ could be LTI.
- Row 2: $F_2[6]=0$, but $F_1[6]\ne0$ and $F_3[6]\ne0$. $F_4[6]=0$ too, so $S_{24}$ is possible. Cannot: 1, 3.
- Row 3: $F_3[\pm4]=0$, and only $f_3$ itself is 0 there. Cannot: 1, 2, 4.
- Row 4: $F_4[\pm3]=F_4[6]=0$, and $f_1,f_2,f_3$ are not 0 at $k=\pm3$. Cannot: 1, 2, 3.`,
      [part("$H_{24}[0]$", "2"), part("$|H_{24}[1]|$", "sqrt(3)"), part("$H_{24}[3]$", "0"),
        ...rows.map((r, i) => tpart(`Input $f_${i + 1}$: outputs that cannot be LTI`, r, "e.g. 1 3, or none"))]);
  }

  // ================================================================ Fall 2023
  F.def("sp-q23f-p1", D._panels([stem("f[n]", ints(-2, 14), ints(-2, 14).map((n) => +(n >= 5 && n <= 9)), { yrange: [0, 1.2], xticks: tk([0, 5, 9]), xlab: "n" })], 1, 360, 96));
  quiz(3511, "2023F", 1, 13, "Relating transforms: DTFT values and circular convolution", ["DTFT", "DFT", "Circular Convolution"],
    t`$f[n]=1$ for $5\le n\le9$ and 0 otherwise, with DTFT $F(\Omega)$.

@fig sp-q23f-p1

**Part a.** Find $F(0)$, $F(\pi/2)$, and $F(\pi)$.

**Parts b–d.** $F_N[k]$ is the DFT of $f[n]$ with analysis window $N$ (6.3000 convention, $\frac1N$ in the analysis equation). $g_N[n]$ is the signal whose DFT is $F_N[k]\cdot F_N[k]$. Find $g_N[0]$ to $g_N[4]$ for $N=15$, $N=12$, and $N=10$.`,
    t`**Part a.** $F(0)=5$. $F(\pi/2)=\sum_{n=5}^{9}(-j)^n=(-j)+(-1)+(j)+(1)+(-j)=-j$. $F(\pi)=\sum(-1)^n=-1$.

**Parts b–d.** A product of DFTs is $\frac1N$ times circular convolution: $g_N=\frac1N(f\circledast_N f)$. The linear convolution $f*f$ is a triangle on $10\le n\le18$ with peak 5 at $n=14$ ($1,2,3,4,5,4,3,2,1$). Wrap it modulo $N$:

- $N=15$: samples at $n=15..18$ ($4,3,2,1$) land on $n=0..3$: $g_{15}=\frac1{15}[4,3,2,1,0]$.
- $N=12$: $n=12..18$ ($3,4,5,4,3,2,1$) land on $0..6$: $g_{12}=\frac1{12}[3,4,5,4,3]$.
- $N=10$: $n=10..18$ land on $0..8$: $g_{10}=\frac1{10}[1,2,3,4,5]$.`,
    [part("$F(0)$", "5"), part("$\\operatorname{Re}F(\\pi/2)$", "0"), part("$\\operatorname{Im}F(\\pi/2)$", "-1"), part("$F(\\pi)$", "-1"),
      ...[4, 3, 2, 1, 0].map((v, n) => part(`$g_{15}[${n}]$`, `${v}/15`)), ...[3, 4, 5, 4, 3].map((v, n) => part(`$g_{12}[${n}]$`, `${v}/12`)), ...[1, 2, 3, 4, 5].map((v, n) => part(`$g_{10}[${n}]$`, `${v}/10`))]);

  // P2: magnitude and angle plots of three DTFTs, drawn from the transforms.
  {
    const ws = range(-PI, PI, 600).map((w) => w + 1e-7);
    const xt = [piT(-1, "−π"), piT(-0.5, "−π/2"), [0, "0"], piT(0.5, "π/2"), piT(1, "π")];
    const xt3 = [piT(-1, "−π"), piT(-2 / 3, "−2π/3"), piT(-1 / 3, "−π/3"), [0, "0"], piT(1 / 3, "π/3"), piT(2 / 3, "2π/3"), piT(1, "π")];
    const Fs = [
      ["F₁", "|cos(2Ω)|", (w) => C(-Math.cos(2 * w)), xt],
      ["F₂", "|sin(Ω)|", (w) => cmul(C(0, -Math.sin(w)), cexp(-w)), xt],
      ["F₃", "|cos(3Ω/2)|", (w) => cmul(C(Math.cos(1.5 * w)), cexp(-w / 2)), xt3],
    ];
    Fs.forEach(([nm, mlab, f, x], i) => F.def(`sp-q23f-p2-${i + 1}`, D._panels([
      { label: `|${nm}(Ω)| = ${mlab}`, kind: "line", xs: ws, ys: ws.map((w) => cabs(f(w))), yrange: [0, 1.15], xticks: x, xlab: "Ω" },
      { label: `∠${nm}(Ω)`, kind: "line", xs: ws, ys: ws.map((w) => carg(f(w))), yrange: [-PI - 0.3, PI + 0.3], xticks: x, yticks: ANG_TICKS, xlab: "Ω", padL: 40 }], 2, 320, 120)));
    quiz(3512, "2023F", 2, 7, "Finding time: inverse DTFTs", ["DTFT", "Inverse DTFT"],
      t`**Part a.** $f_1[n]$ is a DT signal whose DTFT has the magnitude and angle shown below. Find $f_1[n]$ and label the value of each nonzero sample.

@fig sp-q23f-p2-1

**Part b.** The same for $f_2[n]$.

@fig sp-q23f-p2-2

**Part c.** The same for $f_3[n]$.

@fig sp-q23f-p2-3

Each signal has two nonzero samples.`,
      t`- **Part a.** An angle of $\pi$ is a sign change, so $F_1(\Omega)=-\cos(2\Omega)=-\frac12e^{j2\Omega}-\frac12e^{-j2\Omega}$: $f_1[-2]=f_1[2]=-\frac12$.
- **Part b.** Apart from the jumps, the angle has slope $-1$: a delay by 1. Remove it: $G(\Omega)=F_2(\Omega)e^{j\Omega}$ has angle $-\frac\pi2$ for $0<\Omega<\pi$ and $+\frac\pi2$ for $-\pi<\Omega<0$, so $G=-j\sin\Omega=-\frac12e^{j\Omega}+\frac12e^{-j\Omega}$ and $g[n]=-\frac12\delta[n+1]+\frac12\delta[n-1]$. Delay by 1: $f_2[0]=-\frac12$, $f_2[2]=\frac12$.
- **Part c.** The jumps of $\pi$ at $\pm\frac\pi3$ and $\pm\pi$ are where $\cos\frac{3\Omega}2$ changes sign. The remaining angle has slope $-\frac12$: $F_3=\cos\frac{3\Omega}2e^{-j\Omega/2}=\frac12e^{j\Omega}+\frac12e^{-j2\Omega}$: $f_3[-1]=f_3[2]=\frac12$.

A linear angle with slope $-d$ is a delay by $d$; a jump of $\pi$ is a sign change.`,
      [part("$f_1[-2]$", "-1/2"), part("$f_1[2]$", "-1/2"), part("$f_2[0]$", "-1/2"), part("$f_2[2]$", "1/2"), part("$f_3[-1]$", "1/2"), part("$f_3[2]$", "1/2")]);
  }

  {
    const ns = ints(-2, 8), ns2 = ints(-2, 9);
    const io = (xs, x, y, yr) => D._panels([stem("x₁[n]".replace("₁", x[0]), xs, xs.map(x[1]), { yrange: yr, xticks: tk([0]), xlab: "n" }),
      stem("y₁[n]".replace("₁", y[0]), xs, xs.map(y[1]), { yrange: yr, xticks: tk([0]), xlab: "n" })], 2, 260, 90);
    F.def("sp-q23f-p3-a", io(ns, ["₁", (n) => (n >= 0 ? 2 ** (-n / 2) : 0)], ["₁", (n) => +(n === 0)], [0, 1.15]));
    F.def("sp-q23f-p3-b", io(ns2, ["₂", (n) => (n === 0 ? 1 : n === 2 ? -0.8 : 0)], ["₂", (n) => (n >= 0 && n % 2 === 0 ? (-0.8) ** (n / 2) : 0)], [-1.1, 1.1]));
    F.def("sp-q23f-p3-sa", chain(["x₁[n]", "S₁", "y₁[n]"]));
    F.def("sp-q23f-p3-sb", chain(["x₂[n]", "S₂", "y₂[n]"]));
    const ws = range(-PI, PI, 600);
    const H1 = (w) => C(1 - Math.cos(w) / Math.SQRT2, Math.sin(w) / Math.SQRT2);
    const H2 = (w) => { const d = C(1 - 0.64 * Math.cos(4 * w), 0.64 * Math.sin(4 * w)), m = d.re * d.re + d.im * d.im; return C(d.re / m, -d.im / m); };
    const xt = [piT(-1, "−π"), piT(-0.5, "−π/2"), [0, "0"], piT(0.5, "π/2"), piT(1, "π")];
    F.def("sp-q23f-p3-h1", D._panels([
      curve("|H₁(Ω)|", ws, (w) => cabs(H1(w)), { yrange: [0, 1.85], xticks: xt, yticks: [[1 + Math.SQRT1_2, "1+1/√2"], [1 - Math.SQRT1_2, "1−1/√2"]], xlab: "Ω", padL: 50 }),
      curve("∠H₁(Ω)", ws, (w) => carg(H1(w)), { yrange: [-PI / 2, PI / 2], xticks: xt, yticks: [[PI / 4, "π/4"], [-PI / 4, "−π/4"]], xlab: "Ω", padL: 36 })], 2, 320, 130));
    F.def("sp-q23f-p3-h2", D._panels([
      curve("|H₂(Ω)|", ws, (w) => cabs(H2(w)), { yrange: [0, 2.9], xticks: [piT(-1, "−π"), piT(-0.75, "−3π/4"), piT(-0.5, "−π/2"), piT(-0.25, "−π/4"), [0, "0"], piT(0.25, "π/4"), piT(0.5, "π/2"), piT(0.75, "3π/4"), piT(1, "π")], yticks: [[25 / 9, "1/0.36"], [25 / 41, "1/1.64"]], xlab: "Ω", padL: 46 }),
      curve("∠H₂(Ω)", ws, (w) => carg(H2(w)), { yrange: [-PI / 3, PI / 3], xticks: xt, yticks: [[PI / 4, "π/4"], [-PI / 4, "−π/4"]], xlab: "Ω", padL: 36 })], 2, 320, 130));
    quiz(3513, "2023F", 3, 10, "Find the system", ["Frequency Response", "LTI Systems"],
      t`**Part a.** $S_1$ is a DT LTI system. The input $x_1[n]=2^{-n/2}$ for $n\ge0$ (0 otherwise) gives the output $y_1[n]=\delta[n]$.

@fig sp-q23f-p3-a

@fig sp-q23f-p3-sa

Sketch the magnitude and phase of the frequency response of $S_1$. Label the important values.

**Part b.** $S_2$ is a DT LTI system. The input $x_2[n]=\delta[n]-0.8\,\delta[n-2]$ gives the output $y_2[n]=(-0.8)^{n/2}$ for even $n\ge0$ (0 otherwise).

@fig sp-q23f-p3-b

@fig sp-q23f-p3-sb

Sketch the magnitude and phase of the frequency response of $S_2$. Label the important values.

The graded boxes below check key values of your sketches.`,
      t`**Part a.** $X_1(\Omega)=\frac{1}{1-\frac{1}{\sqrt2}e^{-j\Omega}}$ and $Y_1=1$, so $H_1(\Omega)=1-\frac1{\sqrt2}e^{-j\Omega}$. Magnitude: $1-\frac1{\sqrt2}$ at $\Omega=0$, $1+\frac1{\sqrt2}$ at $\pm\pi$. The phase stays between about $\pm\frac\pi4$ and is 0 at $0$ and $\pm\pi$.

@fig sp-q23f-p3-h1

**Part b.** $Y_2(\Omega)=\frac{1}{1+0.8e^{-j2\Omega}}$ and $X_2(\Omega)=1-0.8e^{-j2\Omega}$, so $H_2(\Omega)=\dfrac{1}{(1-0.8e^{-j2\Omega})(1+0.8e^{-j2\Omega})}=\dfrac{1}{1-0.64e^{-j4\Omega}}$. Peaks $\frac{1}{0.36}=\frac{25}{9}$ at $\Omega=0,\pm\frac\pi2,\pm\pi$; minima $\frac1{1.64}=\frac{25}{41}$ at $\pm\frac\pi4,\pm\frac{3\pi}4$.

@fig sp-q23f-p3-h2`,
      [part("$|H_1(0)|$", "1-1/sqrt(2)"), part("$|H_1(\\pi)|$", "1+1/sqrt(2)"), part("$|H_2(0)|$", "25/9"), part("$|H_2(\\pi/4)|$", "25/41")]);
  }

  // P4: eight signals convolved with a square pulse train; the results are computed numerically.
  {
    const ramp = (a, b, va, vb) => (x) => (x >= a && x < b ? va + ((vb - va) * (x - a)) / (b - a) : 0);
    const sum = (...fs) => (x) => fs.reduce((s, f) => s + f(x), 0);
    const fs = [
      sum(ramp(0, 0.5, 0, 1)),
      sum(ramp(0, 0.5, 0, 1), ramp(0.5, 1, 0, 1)),
      sum(ramp(0, 0.5, 0, 1), ramp(1, 1.5, 0, 1)),
      sum(ramp(0.5, 1, 1, 0)),
      sum(ramp(0, 0.5, 0, 1), ramp(0.5, 1, 1, 0)),
      sum(ramp(0, 0.5, 1, 0), ramp(1, 1.5, 0, 1)),
      (x) => (x >= 0 ? Math.exp(-3 * x) : 0),
      (x) => (x < 0 ? Math.exp(3 * x) : 0),
    ];
    const g = (x) => +(mod(x, 1) < 0.5);
    const ts = range(-2, 2, 400), tt = range(-1.4, 1.7, 620);
    const half = [[0, "0"], [0.5, "½"], [1, "1"]];
    const fP = fs.map((f, i) => ({ label: `f${"₀₁₂₃₄₅₆₇"[i]}(t)`, kind: "line", xs: tt, ys: tt.map(f), yrange: [-0.1, 1.15], xticks: half, xlab: "t" }));
    const conv = (f, gg = g) => cconv(f, gg, ts, -3, 3, 0.005);
    const res = { B: conv(fs[0]), I: conv(fs[1]), C: conv(fs[3]), G: conv(fs[4]), A: conv(fs[5]), F: conv(fs[6]), H: conv(fs[7]) };
    res.E = conv(fs[6], (x) => (x >= 0 ? g(x) : 0)); // the same input, but the pulse train starts at t = 0
    res.D = res.E.slice().reverse();
    const xt = [[-1, "−1"], [-0.5, "−½"], [0, "0"], [0.5, "½"], [1, "1"]];
    const rP = "ABCDEFGHI".split("").map((L) => { const ys = res[L], m = Math.max(...ys), lo = Math.min(0, ...ys); return { label: L, kind: "line", xs: ts, ys, yrange: [lo - 0.05 * (m - lo), m + 0.12 * (m - lo)], xticks: xt, xlab: "t" }; });
    F.def("sp-q23f-p4-f", D._panels(fP, 4, 170, 90));
    F.def("sp-q23f-p4-g", D._panels([{ label: "g(t)", kind: "line", xs: range(-2, 2, 800), ys: range(-2, 2, 800).map(g), yrange: [-0.1, 1.2], xticks: xt, xlab: "t" }], 1, 360, 84));
    F.def("sp-q23f-p4", D._panels(rP, 3, 220, 92));
    DBG[3514] = { ts, panels: res };
    const key = ["B", "I", "B", "C", "G", "A", "F", "H"];
    quiz(3514, "2023F", 4, 9, "Mixed transformations: convolving with a pulse train", ["Convolution", "Matching"],
      t`Each signal $f_0(t)$ to $f_7(t)$ below is zero outside the region shown. ($f_6$ and $f_7$ are decaying exponentials.)

@fig sp-q23f-p4-f

Each signal is convolved with the periodic train of rectangular pulses $g(t)=1$ if $\sin(2\pi t)\ge0$ and 0 otherwise:

@fig sp-q23f-p4-g

Which waveform (A to I) shows each result $f_i*g$? The same waveform may be used more than once. The vertical scales are not given.

@fig sp-q23f-p4`,
      t`${key.map((L, i) => `$f_${i}*g$: **${L}**`).join(". ")}.

- $g$ is periodic with period 1, so every result is periodic with period 1 (A, B, C, F, G, H, I). D and E are not periodic, so they are never answers.
- $f_0$: a ramp on $[0,\frac12)$. Sliding it over the pulses gives rounded humps (B).
- $f_1$ is two copies of $f_0$, $\frac12$ apart. $g(t)+g(t-\frac12)=1$, so the result is a constant (I).
- $f_2$ is two copies of $f_0$, 1 apart. A shift by one period changes nothing, so $f_2*g=2(f_0*g)$: the same shape as $f_0*g$ (B).
- $f_3$ is $f_0$ reversed in time and delayed: the humps lean the other way (C).
- $f_4$ is a triangle: the smoothest result (G).
- $f_5$: a falling ramp on $[0,\frac12)$ plus a rising ramp one period later. Modulo 1, the two ramps add to a constant on $[0,\frac12)$, a pulse of width $\frac12$. A pulse convolved with the pulse train is a triangle wave (A).
- $f_6$ is a causal exponential: the output follows each pulse edge with an exponential rise and decay (F). $f_7$ is the time-reversed exponential: the same shape reversed in time (H).`,
      key.map((L, i) => tpart(`$f_${i}*g$`, L)));
  }

  // ================================================================ Fall 2022
  F.def("sp-q22f-p1", chain(["x(t)", "S₁", "", "S₂", "y(t)"]));
  quiz(3521, "2022F", 1, 10, "System identification: differential and difference equations", ["Systems", "Frequency Response", "Difference Equations"],
    t`**Part a.** CT LTI systems $S_1$ and $S_2$ are in cascade, with $h_1(t)=e^{-t}u(t)$ and $h_2(t)=e^{-2t}u(t)$.

@fig sp-q22f-p1

Find a differential equation $a_0y+a_1y'+a_2y''+\dots=b_0x+b_1x'+\dots$ that relates the input $x(t)$ to the output $y(t)$ (no intermediate signals).

**Part b.** A DT LTI system has $h[n]=\sum_{i=0}^{\infty}\alpha^i\delta[n-4i]$ with $0<\alpha<1$. Find a difference equation that relates $x[n]$ and $y[n]$.`,
    t`**Part a.** $H_1=\frac1{1+j\omega}$, $H_2=\frac1{2+j\omega}$, so $H=\frac{1}{(1+j\omega)(2+j\omega)}=\frac{Y}{X}$ and $(2+3j\omega+(j\omega)^2)Y=X$: $\;2y(t)+3y'(t)+y''(t)=x(t)$.

**Part b.** $y[n]=x[n]+\alpha x[n-4]+\alpha^2x[n-8]+\dots$ and $\alpha y[n-4]=\alpha x[n-4]+\alpha^2x[n-8]+\dots$, so $y[n]-\alpha y[n-4]=x[n]$. (Equivalently $H(\Omega)=\frac1{1-\alpha e^{-j4\Omega}}$.)`,
    [part("Part a: $a_0$ when $a_2=1$", "2"), part("Part a: $a_1$ when $a_2=1$", "3")]);

  {
    const f1 = ints(0, 5).map((n) => (n % 2 ? -1 : 1)), f2 = dconv(f1, f1);
    const g1 = [1, 0, 1, 0, 1, 0], lin = dconv(g1, g1), g2 = [3, 0, 3, 0, 3, 0];
    F.def("sp-q22f-p2-a", D._panels([stem("f₁[n]", ints(-3, 15), ints(-3, 15).map((n) => (n >= 0 && n < 6 ? f1[n] : 0)), { yrange: [-1.2, 1.2], xticks: tk([0, 5, 10, 15]), xlab: "n" })], 1, 380, 90));
    F.def("sp-q22f-p2-as", D._panels([stem("f₂[n] = (f₁∗f₁)[n]", ints(-3, 15), ints(-3, 15).map((n) => f2[n] || 0), { yrange: [-6.5, 6.5], yticks: [[6, "6"], [-6, "−6"]], xticks: tk([0, 5, 10, 15]), xlab: "n" })], 1, 380, 130));
    F.def("sp-q22f-p2-b", D._panels([stem("g₁[n] (n = 0 … 5)", ints(0, 5), g1, { yrange: [0, 1.2], xticks: tk([0, 5]), xlab: "n" })], 1, 260, 84));
    F.def("sp-q22f-p2-bs", D._panels([stem("(g₁∗g₁)[n], linear", ints(0, 9), ints(0, 9).map((n) => lin[n] || 0), { yrange: [0, 3.3], yticks: [[3, "3"]], xticks: tk([0, 9]), xlab: "n" }),
      stem("g₂[n] (aliased, N = 6)", ints(0, 5), g2, { yrange: [0, 3.3], yticks: [[3, "3"]], xticks: tk([0, 5]), xlab: "n" })], 2, 260, 100));
    quiz(3522, "2022F", 2, 13, "Convolutions: alternating pulses and a DFT square", ["Convolution", "Circular Convolution", "DFT"],
      t`**Part a.** $f_1[n]=(-1)^n$ for $0\le n<6$ and 0 otherwise. Let $f_2=f_1*f_1$. Find $f_2[0]$ to $f_2[14]$.

@fig sp-q22f-p2-a

**Part b.** $g_1[n]$ has every even-numbered sample equal to 1 and every odd one 0.

@fig sp-q22f-p2-b

- Use an analysis window $N=6$ ($0\le n<6$) to compute the DFT $G_1$ of $g_1$.
- Let $G_2[k]=G_1^2[k]$.
- Take the inverse DFT of $G_2$ and multiply by $N=6$ to get $g_2$.

Find $g_2[0]$ to $g_2[5]$.`,
      t`**Part a.** Each overlapping product is $(-1)^m(-1)^{n-m}=(-1)^n$, so $f_2[n]=(-1)^n\times$(overlap count): $1,-2,3,-4,5,-6,5,-4,3,-2,1,0,0,0,0$.

@fig sp-q22f-p2-as

**Part b.** $N\cdot\text{IDFT}(G_1^2)$ is the circular convolution of the six samples $1,0,1,0,1,0$ with themselves. The linear convolution is $1,0,2,0,3,0,2,0,1$ ($n=0..8$); wrap modulo 6: $n=6,8$ add to $n=0,2$: $3,0,3,0,3,0$.

@fig sp-q22f-p2-bs`,
      [...f2.concat([0, 0, 0, 0]).slice(0, 15).map((v, n) => part(`$f_2[${n}]$`, String(v))), ...g2.map((v, n) => part(`$g_2[${n}]$`, String(v)))]);
  }

  // P3: the 15 official panels A-O, recomputed from the signals they show.
  {
    const N = 32, ns = ints(0, N - 1);
    const mag = (x) => norm(D._dft(ns.map(x)).map(D._cabs));
    const cb = (b) => (n) => Math.cos((2 * PI * b * n) / N);
    const x0 = (n) => Math.cos((9 * PI * n) / 32);
    const sig = [
      ["x_0[n]=\\cos(9\\pi n/32)", x0, "J"], ["x_1[n]=\\cos(9\\pi n/16)", (n) => Math.cos((9 * PI * n) / 16), "B"],
      ["x_2[n]=\\cos(9\\pi n/26)", (n) => Math.cos((9 * PI * n) / 26), "K"], ["x_3[n]=\\cos(9\\pi n/36)", (n) => Math.cos((9 * PI * n) / 36), "A"],
      ["x_4[n]=\\cos(2\\pi n/5)", (n) => Math.cos((2 * PI * n) / 5), "L"], ["x_5[n]=\\left|\\cos(9\\pi n/32)\\right|", (n) => Math.abs(x0(n)), "N"],
      ["x_6[n]=\\cos^2(9\\pi n/32)", (n) => x0(n) ** 2, "C"], ["x_7[n]=\\cos^3(9\\pi n/32)", (n) => x0(n) ** 3, "M"],
    ];
    const add = (...fs) => (n) => fs.reduce((s, f) => s + f(n), 0);
    const byL = {
      A: sig[3][1], B: sig[1][1], C: sig[6][1], D: add(cb(4), cb(9)), E: add(cb(4), cb(5)),
      F: add(cb(5), cb(6)), G: add(cb(8), cb(9)), H: add(cb(9), cb(10)), I: (n) => cb(9)(n) * (1 + cb(1)(n)), J: x0,
      K: sig[2][1], L: sig[4][1], M: sig[7][1], N: sig[5][1], O: add(x0, cb(10)),
    };
    // Official layout: three columns A-E, F-J, K-O.
    const order = [0, 1, 2, 3, 4].flatMap((r) => [r, r + 5, r + 10]).map((i) => "ABCDEFGHIJKLMNO"[i]);
    const pan = order.map((L) => ({ label: L, kind: "stem", xs: ns, ys: mag(byL[L]), yrange: [0, 1.1], xticks: [[0, "0"], [31, "31"]], xlab: "k" }));
    F.def("sp-q22f-p3", D._panels(pan, 3, 200, 86));
    DBG[3523] = { panels: Object.fromEntries(pan.map((q) => [q.label, q.ys])) };
    quiz(3523, "2022F", 3, 12, "DFTs of sinusoids (matching)", ["DFT", "Sinusoids", "Matching"],
      t`Eight signals are defined by functions of discrete time $n$:

${sig.map((s) => `- $${s[0]}$`).join("\n")}

DFTs of length $N=32$ ($0\le n<32$) are computed for each signal. Which plot shows the magnitude of each DFT as a function of the frequency index $k$? Each plot is normalized so that its peak magnitude is 1.

@fig sp-q22f-p3`,
      t`${sig.map((s) => `- $${s[0]}$: **${s[2]}**`).join("\n")}

Write each frequency as $2\pi b/32$ to find its bin $b$:

- $9\pi/32=2\pi\cdot4.5/32$ is halfway between bins 4 and 5, so $x_0$ leaks (J).
- $9\pi/16=2\pi\cdot9/32$ is exactly on bin 9 (B).
- $9\pi/26=2\pi\cdot5.54/32$ leaks around $k\approx5.5$ (K).
- $9\pi/36=\pi/4=2\pi\cdot4/32$ is exactly on bin 4: two clean spikes (A).
- $2\pi/5=2\pi\cdot6.4/32$ leaks around 6.4 (L).
- $|\cos|$ has half the period, so it has a DC term and harmonics at multiples of bin 9 (N).
- $\cos^2=\frac12+\frac12\cos(9\pi n/16)$: DC plus bin 9 (C).
- $\cos^3=\frac34\cos\theta+\frac14\cos3\theta$: leakage around 4.5 and around 13.5 (M).

The other plots (D to I, O) are sums of sinusoids that are not in the list.`,
      sig.map((s) => tpart(`$${s[0].split("=")[0]}$`, s[2])));
  }

  // P4: f[n] is a 5-sample bump centered at n=2 (samples read from the official plot).
  {
    const N = 30, ns = ints(0, N - 1), ks = ns;
    const fv = [0.2, 0.65, 1, 0.65, 0.2];
    const f = ns.map((n) => fv[n] || 0);
    const Fk = D._dft(f);
    const at = (k) => Fk[mod(k, N)];
    const dftOf = (x) => D._dft(x);
    const sq = dftOf(f.map((v) => v * v));
    const magP = {
      A: ks.map((k) => cabs(at(k))), B: ks.map((k) => (k % 2 ? 0 : cabs(at(k)))), C: ks.map((k) => (k % 2 ? cabs(at(k)) : 0)),
      D: ks.map((k) => ((k - 15) % 2 ? 0 : cabs(at(k - 15)))), E: ks.map((k) => ((k - 15) % 2 ? cabs(at(k - 15)) : 0)),
      F: sq.map(cabs), G: ks.map((k) => cabs(at(k + 5))), H: ks.map((k) => cabs(at(k - 5))), I: ks.map((k) => cabs(at(2 * k))),
      J: dftOf(f.map((v, n) => v * Math.cos((2 * PI * 10 * n) / N))).map(cabs),
    };
    const angP = {
      a: ks.map(() => 0), b: ks.map((k) => carg(cmul(at(k), cexp((2 * PI * k) / N)))), c: ks.map((k) => carg(at(k))),
      d: ks.map((k) => carg(at(k - 5))), e: ks.map((k) => carg(at(k + 5))),
      f: ks.map((k) => (k % 2 ? 0 : carg(at(k)))), g: ks.map((k) => (k % 2 ? carg(at(k)) : 0)),
      h: ks.map((k) => carg(cmul(at(k), cexp((-2 * PI * k) / N)))), i: ks.map((k) => carg(at(2 * k))), j: ks.map((k) => -carg(at(k)) || 0),
    };
    const xt = tk([0, 10, 20, 29]);
    DBG[3524] = { f, mag: Object.fromEntries(Object.entries(magP).map(([k, v]) => [k, norm(v)])), ang: angP };
    const two = (labs) => [0, 1, 2, 3, 4].flatMap((r) => [labs[r], labs[r + 5]]);
    F.def("sp-q22f-p4-f", D._panels([stem("f[n]", ns, f, { yrange: [0, 1.15], yticks: [[1, "1"]], xticks: xt, xlab: "n" }),
      stem("|F[k]| (normalized)", ks, norm(magP.A), { yrange: [0, 1.15], yticks: [[1, "1"]], xticks: xt, xlab: "k" }),
      stem("∠F[k]", ks, angP.c, { yrange: [-PI - 0.2, PI + 0.2], yticks: [[PI, "π"], [-PI, "−π"]], xticks: xt, xlab: "k" })], 3, 230, 110));
    F.def("sp-q22f-p4-m", D._panels(two("ABCDEFGHIJ".split("")).map((L) => stem(L, ks, norm(magP[L]), { yrange: [0, 1.12], yticks: [[1, "1"]], xticks: xt, xlab: "k" })), 2, 280, 112));
    F.def("sp-q22f-p4-a", D._panels(two("abcdefghij".split("")).map((L) => stem(L, ks, angP[L], { yrange: [-PI - 0.2, PI + 0.2], yticks: [[PI, "π"], [-PI, "−π"]], xticks: xt, xlab: "k" })), 2, 280, 116));
    const gs = [["g_1[n]=f[-n]", "A", "j"], ["g_2[n]=f[n-1]", "A", "h"], ["g_3[n]=f[n+1]", "A", "b"], ["g_4[n]=f^2[n]", "F", "c"], ["g_5[n]=f[n/2]\\text{ for even }n\\text{, else }0", "I", "i"]];
    quiz(3524, "2022F", 4, 12, "Related DFTs (magnitude and angle matching)", ["DFT", "Properties", "Matching"],
      t`$f[n]$ is periodic with period $N=30$, so $f[n]=f[n+30]$. The plots show one period of $f[n]$ and the magnitude and angle of its DFT with an analysis window of length $N=30$. The magnitude is scaled so that its maximum is 1.

@fig sp-q22f-p4-f

Five signals are derived from $f[n]$:

${gs.map((g) => `- $${g[0]}$`).join("\n")}

Which panel (A–J) shows the magnitude of the DFT of each derived signal, and which panel (a–j) shows its angle? The same panel may be used more than once.

**Magnitude panels** (each scaled so that its largest magnitude is 1):

@fig sp-q22f-p4-m

**Angle panels:**

@fig sp-q22f-p4-a`,
      t`${gs.map((g) => `- $${g[0]}$: magnitude **${g[1]}**, angle **${g[2]}**`).join("\n")}

$f$ is real and symmetric about $n=2$, so $F[k]=R[k]e^{-j2\pi k\cdot2/30}$ with $R[k]>0$: its angle is a line of slope $-4\pi/30$ that wraps at $k\approx7.5$ and $22.5$ (panel c).

- $g_1=f[-n]$: $G_1[k]=F[-k]=F^*[k]$. Same magnitude, negated angle (j).
- $g_2=f[n-1]$: the center moves to $n=3$: same magnitude, slope $-6\pi/30$, wraps every 5 bins (h).
- $g_3=f[n+1]$: the center moves to $n=1$: slope $-2\pi/30$, one wrap at $k=15$ (b).
- $g_4=f^2$: $G_4$ is the circular convolution of $F$ with itself, which is wider (F). $f^2$ is still symmetric about $n=2$, so the angle is the same as $F$'s (c).
- $g_5$ puts $f[m]$ at $n=2m$: $G_5[k]=F[2k]$. The spectrum is compressed and repeats every 15 bins (I), and the center at $n=4$ gives a slope of $-8\pi/30$ (i).`,
      gs.flatMap((g) => [tpart(`$${g[0].split("=")[0]}$: magnitude`, g[1]), tpart(`$${g[0].split("=")[0]}$: angle`, g[2])]));
  }

  // ================================================================ Spring 2022
  quiz(3531, "2022S", 1, 12, "Closing sums", ["DFT", "Geometric Sums"],
    t`$k$ and $n$ are integers and $N>0$ is even. Simplify each sum by closing it and removing indeterminate forms. Answers need only be valid for $0\le k<N$.

$f_0[k]=\sum_{n=0}^{N-1}e^{-j\frac{2\pi kn}{N}}$, $\quad f_1[k]=\sum_{n=0}^{N-1}e^{j\frac{2\pi k_0n}{N}}e^{-j\frac{2\pi kn}{N}}$, $\quad f_2[k]=\sum_{n=0}^{N-1}e^{-j\frac{4\pi kn}{N}}$.

The graded boxes use $N=8$ and $k_0=3$.`,
    t`- $f_0[k]=\dfrac{1-e^{-j2\pi k}}{1-e^{-j2\pi k/N}}=N\delta[k]$: the numerator is 0, and only $k=0$ makes the denominator 0 (then every term is 1).
- $f_1[k]=N\delta[k-k_0]$ (the same sum with $k-k_0$).
- $f_2[k]=N\delta[k]+N\delta[k-\frac N2]$: the denominator $1-e^{-j4\pi k/N}$ is 0 at $k=0$ and $k=N/2$.`,
    [part("$f_0[0]$", "8"), part("$f_0[3]$", "0"), part("$f_1[3]$", "8"), part("$f_1[0]$", "0"), part("$f_2[4]$", "8"), part("$f_2[2]$", "0")]);

  F.def("sp-q22s-p2-f", D._panels([pw("f(t)", [[-4, 0], [-3, 0], [-3, 1], [-2, 1], [-2, 0], [2, 0], [2, 1], [3, 1], [3, 0], [4, 0]], { yrange: [-0.2, 1.25], yticks: [[1, "1"]], xticks: tk([-3, -2, 2, 3]), xlab: "t" })], 1, 340, 100));
  quiz(3535, "2022S", 2, 6, "Frequency responses: a pulse pair and a two-tap filter", ["Fourier Transform", "Frequency Response"],
    t`**Part a.** Find the frequency response $F(\omega)$ of the LTI system with impulse response $f(t)=1$ if $2<|t|<3$ and 0 otherwise. Give a closed form.

@fig sp-q22s-p2-f

**Part b.** Find the frequency response of the LTI system with unit-sample response $g[n]=\delta[n]-\delta[n-2]$. Sketch its magnitude and angle for $-2\pi\le\Omega\le2\pi$, and label the key points.`,
    t`**Part a.** $f$ is a pulse from $-3$ to $3$ minus a pulse from $-2$ to $2$. $\int_{-3}^{3}e^{-j\omega t}dt=2\frac{\sin3\omega}{\omega}$, so $F(\omega)=2\dfrac{\sin3\omega}{\omega}-2\dfrac{\sin2\omega}{\omega}$.

**Part b.** $G(\Omega)=1-e^{-j2\Omega}=e^{-j\Omega}\left(e^{j\Omega}-e^{-j\Omega}\right)=j2\sin(\Omega)e^{-j\Omega}$. The magnitude is $2|\sin\Omega|$. The angle has three parts: $j$ gives $+\frac\pi2$, the sign of $\sin\Omega$ adds a jump of $\pi$, and $e^{-j\Omega}$ subtracts $\Omega$. The result is a sawtooth between $-\frac\pi2$ and $\frac\pi2$.

@fig sp-q25-p1-g`,
    [part("Part a: $F(0)$", "2"), part("Part b: $|G(\\pi/2)|$", "2")]);

  // P3: convolving steps. g0..g7 are drawn from the exact piecewise-linear results.
  {
    const box = (a, b, v = 1) => (x) => (x > a && x < b ? v : 0);
    const f0 = (x) => box(-1, 0, -1)(x) + box(0, 1)(x), f1 = box(-1, 1), f2 = (x) => box(-1, -0.5)(x) + box(0.5, 1)(x);
    const ts = range(-3, 3, 600);
    const cv = (a, b) => cconv(a, b, ts, -1.2, 1.2, 0.002);
    const tri = (pts) => (x) => { for (let i = 0; i + 1 < pts.length; i++) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1]; if (x >= xa && x <= xb) return ya + ((yb - ya) * (x - xa)) / (xb - xa); } return 0; };
    const gs = [
      cv(f0, f1).map((v) => -v), cv(f0, f2), ts.map(tri([[-2, 0], [0, 1], [2, 0]])), cv(f0, f0),
      ts.map(tri([[-2, 0], [-1, 1], [0, -1], [1, 1], [2, 0]])), cv(f1, f2), cv(f2, f2), cv(f1, f1),
    ];
    const fx = tk([-3, 3]);
    DBG[3532] = { ts, panels: gs };
    F.def("sp-q22s-p3-f", D._panels([
      pw("f₀(t)", [[-3, 0], [-1, 0], [-1, -1], [0, -1], [0, 1], [1, 1], [1, 0], [3, 0]], { yrange: [-1.3, 1.3], yticks: [[1, "1"], [-1, "−1"]], xticks: fx, xlab: "t" }),
      pw("f₁(t)", [[-3, 0], [-1, 0], [-1, 1], [1, 1], [1, 0], [3, 0]], { yrange: [-1.3, 1.3], yticks: [[1, "1"], [-1, "−1"]], xticks: fx, xlab: "t" }),
      pw("f₂(t)", [[-3, 0], [-1, 0], [-1, 1], [-0.5, 1], [-0.5, 0], [0.5, 0], [0.5, 1], [1, 1], [1, 0], [3, 0]], { yrange: [-1.3, 1.3], yticks: [[1, "1"], [-1, "−1"]], xticks: fx, xlab: "t" })], 3, 200, 96));
    F.def("sp-q22s-p3", D._panels(gs.map((ys, i) => ({ label: `g${"₀₁₂₃₄₅₆₇"[i]}(t)`, kind: "line", xs: ts, ys, yrange: [-2.2, 2.2], yticks: [[1, "1"]], xticks: tk([-3, 0, 3]), xlab: "t" })), 2, 280, 116));
    const key = [["X", "X*X"], ["f0*f2"], ["X", "X*X"], ["f0*f0"], ["X", "X*X"], ["f1*f2"], ["f2*f2"], ["f1*f1"]];
    quiz(3532, "2022S", 3, 9, "Convolving steps (matching)", ["Convolution", "Matching"],
      t`$f_0(t)$, $f_1(t)$, and $f_2(t)$ are the signals below.

@fig sp-q22s-p3-f

Can each signal below be made by convolving ($f_0$ or $f_1$ or $f_2$) with ($f_0$ or $f_1$ or $f_2$)? If it can, enter the two signals, for example "f0*f2". If it cannot, enter X. All plots use the same scale.

@fig sp-q22s-p3`,
      t`$g_0$: **X**. $g_1$: **$f_0*f_2$**. $g_2$: **X**. $g_3$: **$f_0*f_0$**. $g_4$: **X**. $g_5$: **$f_1*f_2$**. $g_6$: **$f_2*f_2$**. $g_7$: **$f_1*f_1$**.

Convolution is commutative, so there are only six different results. The signals are piecewise constant, so each convolution is piecewise linear, and its values at the breakpoints are enough.

- $f_0*f_0$ at $t=-1,0,1$: $1,-2,1$ (the negative parts overlap, then each part overlaps the opposite sign, then the positive parts overlap). This is $g_3$.
- $f_1*f_1$: $1,2,1$ at $t=-1,0,1$, a triangle with peak 2. This is $g_7$. ($g_2$ has peak 1, so it is not $f_1*f_1$.)
- $f_0*f_1$: $-1,0,1$ at $t=-1,0,1$. That is $-g_0$, which is not an option.
- $f_2$ has breakpoints at half-integers, so evaluate at $t=-2.5,-2,\dots,2.5$. $f_2*f_0$: $-\frac12,-\frac12,\frac12,0,-\frac12,\frac12,\frac12$ is $g_1$. $f_2*f_1$: $\frac12,\frac12,\frac12,1,\frac12,\frac12,\frac12$ is $g_5$. $f_2*f_2$: $\frac12,0,0,1,0,0,\frac12$ is $g_6$.

$g_0$, $g_2$, and $g_4$ cannot be made from any pair.`,
      key.map((a, i) => tpart(`$g_${i}(t)$`, a[0], "f0*f2 or X", a.slice(1))));
  }

  F.def("sp-q22s-p4-h", D._panels([stem("h[n]", ints(-2, 10), ints(-2, 10).map((n) => (n >= 0 && n % 2 === 0 ? 0.5 ** n : 0)), { yrange: [0, 1.15], yticks: [[1, "1"]], xticks: tk([0, 2, 4, 6, 8, 10]), xlab: "n" })], 1, 340, 90));
  F.def("sp-q22s-p4-b", chain(["x(t)", "S", "", "S", "", "S", "y(t)"]));
  quiz(3533, "2022S", 4, 10, "Systems: DT and CT sinusoidal steady state", ["Frequency Response", "Cascade"],
    t`**Part a.** $S$ is LTI with $h[n]=\left(\frac12\right)^n$ when $n$ is even and $n\ge0$, and 0 otherwise.

@fig sp-q22s-p4-h

The input is $x[n]=\cos(\pi n/4)$ and the output is $y[n]=A\cos(\pi n/4)+B\sin(\pi n/4)$. Find $A$ and $B$.

**Part b.** Three identical subsystems are cascaded. Each subsystem obeys $y_i(t)+\frac{d}{dt}y_i(t)=x_i(t)$.

@fig sp-q22s-p4-b

The input is $x(t)=\cos t$ and the output is $y(t)=C\cos(t-\phi)$. Find $C$ and $\phi$.`,
    t`**Part a.** $H(\Omega)=\sum_{m\ge0}\frac{1}{4^m}e^{-j2m\Omega}=\dfrac{1}{1-\frac14e^{-j2\Omega}}$. At $\Omega=\frac\pi4$, $e^{-j\pi/2}=-j$: $H=\dfrac{1}{1+\frac j4}=\dfrac{4}{4+j}=\dfrac{16-4j}{17}$. Then $y=\operatorname{Re}\{He^{j\pi n/4}\}$ gives $A=\frac{16}{17}$, $B=\frac{4}{17}$.

**Part b.** $H_i=\frac1{1+j\omega}$, so $H=\frac{1}{(1+j\omega)^3}$. At $\omega=1$: $\frac{1}{1+j}=\frac1{\sqrt2}e^{-j\pi/4}$, so $C=\frac1{2\sqrt2}$ and $\phi=\frac{3\pi}4$.`,
    [part("$A$", "16/17"), part("$B$", "4/17"), part("$C$", "1/(2*sqrt(2))"), part("$\\phi$", "3*pi/4")]);

  // P5: DFT matching. The 14 official panels A-N are the real parts of 12-point DFTs.
  {
    const N = 12, ns = ints(0, N - 1);
    const sigs = [
      (n) => +(n % 2 === 0), (n) => [1, 0, -1, 0][n % 4], (n) => +(n % 3 === 0), (n) => [1, 0, 0, -1, 0, 0][n % 6],
      (n) => +(n === 0 || n === 6), (n) => (n === 0 ? 1 : n === 6 ? -1 : 0), (n) => (n === 1 || n === 11 ? 0.5 : 0), (n) => (n === 5 || n === 7 ? 0.5 : 0),
    ];
    const re = (x) => D._dft(ns.map(x)).map((c) => (Math.abs(c.re) < 1e-12 ? 0 : c.re));
    const byL = {
      A: re(sigs[6]), B: re(sigs[2]), C: re(sigs[7]), D: ns.map((k) => Math.cos((PI * k) / 3)), E: re(sigs[0]), F: re(sigs[3]), G: ns.map((k) => +(k === 6)),
      H: re(sigs[5]), I: ns.map((k) => +(k === 4 || k === 8)), J: ns.map((k) => +(k > 0 && k % 2 === 0)), K: re(sigs[1]), L: ns.map((k) => +(k % 5 === 0)),
      M: ns.map((k) => +(k % 3 === 0)), N: re(sigs[4]),
    };
    const key = ["E", "K", "B", "F", "N", "H", "A", "C"];
    DBG[3534] = { sigs, panels: Object.fromEntries(Object.entries(byL).map(([k, v]) => [k, norm(v)])) };
    const nt = tk([0, 2, 4, 6, 8, 10]);
    F.def("sp-q22s-p5-f", D._panels(sigs.map((x, i) => stem(`f${"₀₁₂₃₄₅₆₇"[i]}[n]`, ns, ns.map(x), { yrange: [-1.15, 1.15], yticks: [[1, "1"], [-1, "−1"]], xticks: nt, xlab: "n" })), 2, 270, 84));
    F.def("sp-q22s-p5", D._panels("ABCDEFGHIJKLMN".split("").map((L) => stem(L, ns, norm(byL[L]), { yrange: [-1.15, 1.15], xticks: nt, xlab: "k" })), 2, 270, 84));
    quiz(3534, "2022S", 5, 12, "DFT matching (real parts)", ["DFT", "Matching"],
      t`Each plot shows samples $n=0$ through $n=11$ of a DT signal $f_i[n]$.

@fig sp-q22s-p5-f

Which plot (A–N) shows the real part of the 12-point DFT of each signal? Each plot is scaled so that its largest value is drawn at full height.

@fig sp-q22s-p5`,
      t`${key.map((L, i) => `$f_${i}$: **${L}**`).join(". ")}.

- $f_0$ (every second sample) has period 2: only $k=0$ and $k=6$ (E).
- $f_1=\cos(2\pi\cdot3n/12)$: $k=3$ and $k=9$ (K).
- $f_2$ (every third sample) has period 3: $k=0,4,8$ (B).
- $f_3$ alternates $1,-1$ every 3 samples (period 6, odd symmetry over half a period): $k=2,6,10$ (F).
- $f_4=\delta[n]+\delta[n-6]$: $\frac1{12}(1+(-1)^k)$, the even $k$ (N). $f_5=\delta[n]-\delta[n-6]$: the odd $k$ (H).
- $f_6=\frac12\delta[n-1]+\frac12\delta[n-11]$ is even: $\frac1{12}\cos(2\pi k/12)$ (A). $f_7=\frac12\delta[n-5]+\frac12\delta[n-7]$: $\frac1{12}\cos(2\pi\cdot5k/12)$ (C).`,
      key.map((L, i) => tpart(`$f_${i}[n]$`, L)));
  }

  for (const p of P) for (const q of p.parts) if (!q.accept && Number.isInteger(root.Expr.evaluate(q.answer))) q.tol = 0;
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
