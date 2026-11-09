// Official 6.3000 problems: past Quiz 2 exams (Spring 2022, Fall 2022, Fall 2023, Spring 2025)
// from sigproc.mit.edu/fall26/q2_info. Text is transcribed; plots that are defined by formulas are
// redrawn from those formulas (js/drills-6300.js panels). Problems that depend on hand-drawn
// figures link to the official PDF. Numeric parts are graded against the official answers.
// Load after fig.js and drills-6300.js.
(function (root) {
  const t = String.raw;
  const P = [];
  const D = root.Drills6300, Fig = root.Fig, PI = Math.PI;
  const PDF = "https://sigproc.mit.edu/_static/fall26/practice_quizzes/";
  const TERM = { "2022S": "Spring 2022", "2022F": "Fall 2022", "2023F": "Fall 2023", "2025S": "Spring 2025" };
  const links = (term) => `Official PDFs: <a class="link" href="${PDF}Q2-${term}.pdf" target="_blank" rel="noopener">quiz</a> · <a class="link" href="${PDF}Q2-${term}-solutions.pdf" target="_blank" rel="noopener">solutions</a>.`;
  const part = (q, answer) => ({ q, answer });
  const quiz = (id, term, n, lec, title, topics, statement, solution, parts = []) => P.push({
    id, course: "6.3000", lec, title: `${title} (${TERM[term]} Q2 P${n})`, diff: "Hard", topics, parts,
    real: "quiz", source: `${TERM[term]} Quiz 2, Problem ${n}`, text: true,
    statement: statement + `\n\n${links(term)}`, hints: [], solution,
  });
  const fig = (name, markup) => { Fig.def(name, markup); return `@fig ${name}`; };

  // ================================================================ Spring 2025
  quiz(3501, "2025S", 1, 8, "Short-answer questions: systems and frequency responses", ["Systems", "Fourier Transform", "Frequency Response"],
    t`**Part a.** For each system, decide whether it is additive, homogeneous, and time-invariant ($x$ is the input, $y$ the output).

| System | additive? | homogeneous? | time-invariant? |
|---|---|---|---|
| $y[n]=\left(-\frac12\right)^n\big(x[n]+1\big)$ | | | |
| $y[n]=\sin(x[n])$ | | | |
| $y(t)=\int_{-\infty}^{t}x(\tau)\,d\tau$ | | | |
| $y(t)=t\,x(t)$ | | | |

**Part b.** Find a closed form (no integrals or derivatives) for the frequency response $F(\omega)$ of the LTI system with impulse response $f(t)=1$ if $2<|t|<3$ and $0$ otherwise.

**Part c.** Find the frequency response of the LTI system with $g[n]=\delta[n]-\delta[n-2]$, and sketch its magnitude and angle for $-2\pi\le\Omega\le2\pi$.`,
    t`**Part a.**

| System | additive | homogeneous | time-invariant |
|---|---|---|---|
| $\left(-\frac12\right)^n(x[n]+1)$ | No | No | No |
| $\sin(x[n])$ | No | No | Yes |
| $\int_{-\infty}^t x(\tau)d\tau$ | Yes | Yes | Yes |
| $t\,x(t)$ | Yes | Yes | No |

The $+1$ breaks additivity and homogeneity, and $\left(-\frac12\right)^n$ depends on $n$. A substitution $\lambda=\tau-t_0$ shows the integrator is time-invariant. $t\,x(t-t_0)\ne(t-t_0)x(t-t_0)$.

**Part b.** $f$ is a pulse on $(-3,3)$ minus a pulse on $(-2,2)$: $F(\omega)=\dfrac{2\sin3\omega}{\omega}-\dfrac{2\sin2\omega}{\omega}$.

**Part c.** $G(\Omega)=1-e^{-j2\Omega}=e^{-j\Omega}(e^{j\Omega}-e^{-j\Omega})=j\,2\sin(\Omega)\,e^{-j\Omega}$. The magnitude is $2|\sin\Omega|$ (zeros at $0,\pm\pi,\pm2\pi$, peaks 2 at $\pm\pi/2$). The angle is $\frac\pi2-\Omega$ for $0<\Omega<\pi$, then jumps by $\pi$ where $\sin\Omega$ changes sign: a sawtooth between $-\frac\pi2$ and $\frac\pi2$.`,
    [part("Part c: $|G(\\pi/2)|$", "2"), part("Part b: $F(0)$", "2")]);

  quiz(3502, "2025S", 2, 9, "Cascaded systems with step responses", ["Convolution", "Cascade", "Geometric Sums"],
    t`**Part a.** System $S_1$ is LTI with unit-sample response $h_1[n]=u[n]$ (1 for $n\ge0$, else 0). The input is $x[n]=(0.9)^n$ for $n\ge0$ and 0 otherwise. Find $y_1[0]$ to $y_1[4]$ and a closed form for $y_1[n]$.

**Part b.** $S_{12}$ is $S_1$ followed by $S_2$, with $h_1[n]=h_2[n]=u[n]$. Find a closed form for $h_{12}[n]$.

**Part c.** $S_{123}$ cascades three systems with $h_1=h_2=h_3=u[n]$. Find $h_{123}[0]$ to $h_{123}[4]$.`,
    t`**Part a.** $y_1[n]=\sum_{m=0}^{n}0.9^m=\dfrac{1-0.9^{n+1}}{1-0.9}=10-9(0.9)^n$: $1,\ 1.9,\ 2.71,\ 3.439,\ 4.0951$.

**Part b.** $h_{12}=u*u$: $\sum_{m=0}^{n}1=(n+1)u[n]$.

**Part c.** $h_{123}[n]=\sum_{m=0}^{n}(m+1)=\dfrac{(n+1)(n+2)}{2}$: $1,3,6,10,15$.`,
    [part("$y_1[0]$", "1"), part("$y_1[1]$", "1.9"), part("$y_1[2]$", "2.71"), part("$y_1[3]$", "3.439"), part("$y_1[4]$", "4.0951"),
      part("$h_{12}[5]$", "6"), part("$h_{123}[0]$", "1"), part("$h_{123}[1]$", "3"), part("$h_{123}[2]$", "6"), part("$h_{123}[3]$", "10"), part("$h_{123}[4]$", "15")]);

  // P3: the nine magnitude plots, redrawn in the official order A-I.
  {
    const F = (w) => (Math.abs(w) < 1e-12 ? 2 : (2 * Math.sin(w)) / w), dF = (w) => (F(w + 1e-4) - F(w - 1e-4)) / 2e-4;
    const ws = Array.from({ length: 321 }, (_, i) => -4 * PI + (8 * PI * i) / 320);
    const official = [["A", (w) => Math.abs(F(w))], ["B", (w) => Math.abs(F(w - 2))], ["C", (w) => Math.abs(F(w + 2))], ["D", (w) => Math.abs(F(w / 2))],
      ["E", (w) => F(w) ** 2], ["F", (w) => Math.abs(F(2 * w))], ["G", (w) => Math.abs(dF(w))], ["H", (w) => Math.abs(F(w - 2) - F(w + 2))], ["I", (w) => Math.abs(F(w - 2) + F(w + 2))]];
    const xt = [[-4 * PI, "-4π"], [-2 * PI, "-2π"], [0, "0"], [2 * PI, "2π"], [4 * PI, "4π"]];
    const pan = official.map(([lab, m]) => { const ys = ws.map(m), mx = Math.max(...ys); return { label: lab, kind: "line", xs: ws, ys: ys.map((v) => v / mx), yrange: [0, 1.05], xticks: xt, xlab: "ω" }; });
    quiz(3503, "2025S", 3, 6, "Pulsed relations: transform properties matching", ["Fourier Transform", "Properties", "Matching"],
      t`Let $f(t)=1$ for $|t|<1$ and 0 otherwise, with Fourier transform $F(\omega)=\dfrac{2\sin\omega}{\omega}$. Each plot shows the magnitude of the Fourier transform of a signal derived from $f(t)$ (scales differ; each is drawn with peak 1). The plots are redrawn from the transforms, in the original lettering.

${fig("sp-q25-p3", D._panels(pan, 3, 200, 92))}

Identify which plot (A–I) shows the magnitude for each of: $f(t/2)$, $(f*f)(t)$, $f(2t)$, $f(t-1)$, $t\,f(t)$, $f(t)\sin(2t)$, $f(t)\cos(2t)$, $f(t)e^{j2t}$, $f(t)e^{-j2t}$.`,
      t`$f(t/2)$: **F** ($2F(2\omega)$, narrower). $(f*f)(t)$: **E** ($F^2$). $f(2t)$: **D** ($\frac12F(\omega/2)$, wider). $f(t-1)$: **A** (magnitude unchanged). $t\,f(t)$: **G** ($j\,dF/d\omega$, zero at $\omega=0$). $f(t)\sin2t$: **H**. $f(t)\cos2t$: **I**. $f(t)e^{j2t}$: **B** ($F(\omega-2)$). $f(t)e^{-j2t}$: **C** ($F(\omega+2)$).`);
  }

  quiz(3504, "2025S", 4, 13, "Pulses in, pulses out (DTFS and LTI systems)", ["DT Fourier Series", "LTI Systems"],
    t`Four signals $f_1[n]$ to $f_4[n]$, each periodic in $N=12$, and the magnitudes of their Fourier series coefficients are drawn in the official quiz. **Part a:** find $h_{24}[n]$ and $H_{24}[k]$ for the system that maps $f_2$ to $f_4$, and sketch $|H_{24}[k]|$. **Part b:** of the 16 systems $f_i\to f_o$, mark those that cannot be LTI. The signal plots are hand-drawn, so work this one from the PDF.`,
    t`See the official solutions PDF. Key ideas: an LTI system can only scale each harmonic, $F_o[k]=H[k]F_i[k]$, so a system cannot be LTI if the output has energy at a $k$ where the input has $F_i[k]=0$. With periodic signals, $h$ is found from $H[k]=F_4[k]/F_2[k]$.`);

  // ================================================================ Fall 2023
  quiz(3511, "2023F", 1, 13, "Relating transforms: DTFT values and circular convolution", ["DTFT", "DFT", "Circular Convolution"],
    t`$f[n]=1$ for $5\le n\le9$ and 0 otherwise, with DTFT $F(\Omega)$.

**Part a.** Find $F(0)$, $F(\pi/2)$, and $F(\pi)$.

**Parts b–d.** $F_N[k]$ is the DFT of $f[n]$ with analysis window $N$ (6.3000 convention, $\frac1N$ in the analysis equation). $g_N[n]$ is the signal whose DFT is $F_N[k]\cdot F_N[k]$. Find $g_N[0]$ to $g_N[4]$ for $N=15$, $N=12$, and $N=10$.`,
    t`**Part a.** $F(0)=5$. $F(\pi/2)=\sum_{n=5}^{9}(-j)^n=(-j)+(-1)+(j)+(1)+(-j)=-j$. $F(\pi)=\sum(-1)^n=-1$.

**Parts b–d.** A product of DFTs is $\frac1N$ times circular convolution: $g_N=\frac1N(f\circledast_N f)$. The linear convolution $f*f$ is a triangle on $10\le n\le18$ with peak 5 at $n=14$ ($1,2,3,4,5,4,3,2,1$). Wrap it modulo $N$:

- $N=15$: samples at $n=15..18$ ($4,3,2,1$) land on $n=0..3$: $g_{15}=\frac1{15}[4,3,2,1,0]$.
- $N=12$: $n=12..18$ ($3,4,5,4,3,2,1$) land on $0..6$: $g_{12}=\frac1{12}[3,4,5,4,3]$.
- $N=10$: $n=10..18$ land on $0..8$: $g_{10}=\frac1{10}[1,2,3,4,5]$.`,
    [part("$F(0)$", "5"), part("$\\operatorname{Re}F(\\pi/2)$", "0"), part("$\\operatorname{Im}F(\\pi/2)$", "-1"), part("$F(\\pi)$", "-1"),
      ...[4, 3, 2, 1, 0].map((v, n) => part(`$g_{15}[${n}]$`, `${v}/15`)), ...[3, 4, 5, 4, 3].map((v, n) => part(`$g_{12}[${n}]$`, `${v}/12`)), ...[1, 2, 3, 4, 5].map((v, n) => part(`$g_{10}[${n}]$`, `${v}/10`))]);

  quiz(3512, "2023F", 2, 7, "Finding time: inverse DTFTs", ["DTFT", "Inverse DTFT"],
    t`The quiz gives magnitude and angle plots of three DTFTs. Combined into closed form, they are:

- $F_1(\Omega)$: magnitude $|\cos2\Omega|$ with angle $\pi$ where $\cos2\Omega>0$ and 0 elsewhere, that is $F_1(\Omega)=-\cos(2\Omega)$.
- $F_2(\Omega)$: magnitude $|\sin\Omega|$ with angle $-\frac\pi2-\Omega$ (plus jumps of $\pi$ where $\sin$ changes sign), that is $F_2(\Omega)=-j\sin(\Omega)\,e^{-j\Omega}$.
- $F_3(\Omega)$: magnitude $|\cos\frac{3\Omega}2|$ with angle $-\frac\Omega2$ (plus jumps of $\pi$ at $\Omega=\pm\frac\pi3,\pm\pi$), that is $F_3(\Omega)=\cos\!\left(\frac{3\Omega}{2}\right)e^{-j\Omega/2}$.

Find $f_1[n]$, $f_2[n]$, and $f_3[n]$ (each has two nonzero samples).`,
    t`- $F_1=-\frac12e^{j2\Omega}-\frac12e^{-j2\Omega}$: $f_1[-2]=f_1[2]=-\frac12$.
- $-j\sin\Omega=-\frac12e^{j\Omega}+\frac12e^{-j\Omega}$, then the factor $e^{-j\Omega}$ delays by 1: $f_2[0]=-\frac12$, $f_2[2]=\frac12$.
- $\cos\frac{3\Omega}2e^{-j\Omega/2}=\frac12e^{j\Omega}+\frac12e^{-j2\Omega}$: $f_3[-1]=f_3[2]=\frac12$.

A linear angle with slope $-d$ is a delay by $d$; a jump of $\pi$ is a sign change.`,
    [part("$f_1[-2]$", "-1/2"), part("$f_1[2]$", "-1/2"), part("$f_2[0]$", "-1/2"), part("$f_2[2]$", "1/2"), part("$f_3[-1]$", "1/2"), part("$f_3[2]$", "1/2")]);

  quiz(3513, "2023F", 3, 10, "Find the system", ["Frequency Response", "LTI Systems"],
    t`**Part a.** An LTI system $S_1$ maps $x_1[n]=2^{-n/2}u[n]$ to $y_1[n]=\delta[n]$. Sketch the magnitude and phase of its frequency response.

**Part b.** An LTI system $S_2$ maps $x_2[n]=\delta[n]-0.8\,\delta[n-2]$ to $y_2[n]=(-0.8)^{n/2}$ for even $n\ge0$ (0 otherwise). Sketch the magnitude and phase of its frequency response.

The graded boxes below check key values of your sketches.`,
    t`**Part a.** $X_1(\Omega)=\frac{1}{1-\frac{1}{\sqrt2}e^{-j\Omega}}$ and $Y_1=1$, so $H_1(\Omega)=1-\frac1{\sqrt2}e^{-j\Omega}$. Magnitude: $1-\frac1{\sqrt2}$ at $\Omega=0$, $1+\frac1{\sqrt2}$ at $\pm\pi$. The phase stays between about $\pm\frac\pi4$ and is 0 at $0$ and $\pm\pi$.

**Part b.** $Y_2(\Omega)=\frac{1}{1+0.8e^{-j2\Omega}}$ and $X_2(\Omega)=1-0.8e^{-j2\Omega}$, so $H_2(\Omega)=\dfrac{1}{(1-0.8e^{-j2\Omega})(1+0.8e^{-j2\Omega})}=\dfrac{1}{1-0.64e^{-j4\Omega}}$. Peaks $\frac{1}{0.36}=\frac{25}{9}$ at $\Omega=0,\pm\frac\pi2,\pm\pi$; minima $\frac1{1.64}=\frac{25}{41}$ at $\pm\frac\pi4,\pm\frac{3\pi}4$.`,
    [part("$|H_1(0)|$", "1-1/sqrt(2)"), part("$|H_1(\\pi)|$", "1+1/sqrt(2)"), part("$|H_2(0)|$", "25/9"), part("$|H_2(\\pi/4)|$", "25/41")]);

  quiz(3514, "2023F", 4, 9, "Mixed transformations: convolving with a pulse train", ["Convolution", "Matching"],
    t`Eight signals $f_0(t)$ to $f_7(t)$ (drawn in the quiz) are each convolved with the periodic pulse train $g(t)=1$ if $\sin(2\pi t)\ge0$ and 0 otherwise. Match each result to one of the waveforms A–I. The figures are hand-drawn, so work this one from the PDF.`,
    t`See the official solutions PDF. Key ideas: convolving with a pulse train of period 1 gives a periodic result; a signal with zero area gives a zero-mean result; $(f*g)'=f'*g$, so convolving the derivative is often easier; an impulse $\delta(t-t_0)$ just shifts $g$.`);

  // ================================================================ Fall 2022
  quiz(3521, "2022F", 1, 10, "System identification: differential and difference equations", ["Systems", "Frequency Response", "Difference Equations"],
    t`**Part a.** CT LTI systems $S_1$ and $S_2$ are in cascade with $h_1(t)=e^{-t}u(t)$ and $h_2(t)=e^{-2t}u(t)$. Find a differential equation $a_0y+a_1y'+a_2y''+\dots=b_0x+b_1x'+\dots$ that relates the input $x(t)$ to the output $y(t)$ (no intermediate signals).

**Part b.** A DT LTI system has $h[n]=\sum_{i=0}^{\infty}\alpha^i\delta[n-4i]$ with $0<\alpha<1$. Find a difference equation that relates $x[n]$ and $y[n]$.`,
    t`**Part a.** $H_1=\frac1{1+j\omega}$, $H_2=\frac1{2+j\omega}$, so $H=\frac{1}{(1+j\omega)(2+j\omega)}=\frac{Y}{X}$ and $(2+3j\omega+(j\omega)^2)Y=X$: $\;2y(t)+3y'(t)+y''(t)=x(t)$.

**Part b.** $y[n]=x[n]+\alpha x[n-4]+\alpha^2x[n-8]+\dots$ and $\alpha y[n-4]=\alpha x[n-4]+\alpha^2x[n-8]+\dots$, so $y[n]-\alpha y[n-4]=x[n]$. (Equivalently $H(\Omega)=\frac1{1-\alpha e^{-j4\Omega}}$.)`,
    [part("Part a: $a_0$ when $a_2=1$", "2"), part("Part a: $a_1$ when $a_2=1$", "3")]);

  quiz(3522, "2022F", 2, 13, "Convolutions: alternating pulses and a DFT square", ["Convolution", "Circular Convolution", "DFT"],
    t`**Part a.** $f_1[n]=(-1)^n$ for $0\le n<6$ and 0 otherwise. Find $f_2=f_1*f_1$ for $n=0$ to $14$.

**Part b.** $g_1[n]$ has every even-numbered sample equal to 1 and every odd one 0. Compute its DFT $G_1$ with $N=6$ ($0\le n<6$), let $G_2[k]=G_1^2[k]$, take the inverse DFT of $G_2$, and multiply by $N=6$ to get $g_2$. Find $g_2[0]$ to $g_2[5]$.`,
    t`**Part a.** Each overlapping product is $(-1)^m(-1)^{n-m}=(-1)^n$, so $f_2[n]=(-1)^n\times$(overlap count): $1,-2,3,-4,5,-6,5,-4,3,-2,1,0,0,0,0$.

**Part b.** $N\cdot\text{IDFT}(G_1^2)$ is the circular convolution of the six samples $1,0,1,0,1,0$ with themselves. The linear convolution is $1,0,2,0,3,0,2,0,1$ ($n=0..8$); wrap modulo 6: $n=6,8$ add to $n=0,2$: $3,0,3,0,3,0$.`,
    [...[1, -2, 3, -4, 5, -6, 5, -4, 3, -2, 1, 0, 0, 0, 0].map((v, n) => part(`$f_2[${n}]$`, String(v))), ...[3, 0, 3, 0, 3, 0].map((v, n) => part(`$g_2[${n}]$`, String(v)))]);

  {
    const N = 32, ks = Array.from({ length: N }, (_, k) => k);
    const mag = (x) => { const X = D._dft(ks.map(x)).map(D._cabs); const m = Math.max(...X); return X.map((v) => v / m); };
    const sig = [
      ["x_0[n]=\\cos(9\\pi n/32)", (n) => Math.cos((9 * PI * n) / 32)], ["x_1[n]=\\cos(9\\pi n/16)", (n) => Math.cos((9 * PI * n) / 16)],
      ["x_2[n]=\\cos(9\\pi n/26)", (n) => Math.cos((9 * PI * n) / 26)], ["x_3[n]=\\cos(9\\pi n/36)", (n) => Math.cos((9 * PI * n) / 36)],
      ["x_4[n]=\\cos(2\\pi n/5)", (n) => Math.cos((2 * PI * n) / 5)], ["x_5[n]=|\\cos(9\\pi n/32)|", (n) => Math.abs(Math.cos((9 * PI * n) / 32))],
      ["x_6[n]=\\cos^2(9\\pi n/32)", (n) => Math.cos((9 * PI * n) / 32) ** 2], ["x_7[n]=\\cos^3(9\\pi n/32)", (n) => Math.cos((9 * PI * n) / 32) ** 3],
    ];
    // Redrawn with new letters (the original distractor plots are not reproduced): signals in a fixed shuffled order plus 4 distractors.
    const extra = [(n) => Math.cos((2 * PI * 3 * n) / 32), (n) => Math.cos((2 * PI * 5 * n) / 32) + Math.cos((2 * PI * 9 * n) / 32), (n) => Math.cos((2 * PI * 7 * n) / 32), (n) => Math.cos((9 * PI * n) / 32) * (n % 2 ? -1 : 1)];
    const order = [5, 9, 2, 0, 11, 7, 3, 10, 6, 1, 8, 4]; // panel i shows item order[i] (0-7 signals, 8-11 distractors)
    const all = [...sig.map((s) => s[1]), ...extra];
    const pan = order.map((j, i) => ({ label: String.fromCharCode(65 + i), kind: "stem", xs: ks, ys: mag(all[j]), yrange: [0, 1.05], xticks: [[0, "0"], [31, "31"]], xlab: "k" }));
    const letterOf = (j) => String.fromCharCode(65 + order.indexOf(j));
    quiz(3523, "2022F", 3, 12, "DFTs of sinusoids (matching)", ["DFT", "Sinusoids", "Matching"],
      t`32-point DFTs ($0\le n<32$) are computed for eight signals. Each plot shows $|X[k]|$, normalized to peak 1. **The plots are recomputed from the signals and lettered differently from the original paper** (the original's distractor plots are replaced by others). Match each signal to its plot.

${sig.map((s) => `- $${s[0]}$`).join("\n")}

${fig("sp-q22f-p3", D._panels(pan, 3, 200, 86))}`,
      t`${sig.map((s, j) => `- $${s[0]}$: **${letterOf(j)}**`).join("\n")}

$9\pi/32=2\pi\cdot4.5/32$ is halfway between bins, so $x_0$ leaks. $9\pi/16=2\pi\cdot9/32$ is on bin 9. $9\pi/26=2\pi\cdot5.54/32$ is off-bin (leaks around $k\approx5.5$), but $9\pi/36=\pi/4=2\pi\cdot4/32$ is exactly on bin 4 (two clean spikes). $2\pi/5=2\pi\cdot6.4/32$ is off-bin. $|\cos|$ is periodic with half the period, so it has a DC term and harmonics at multiples of 9. $\cos^2=\frac12+\frac12\cos(9\pi n/16)$ is DC plus bin 9. $\cos^3=\frac34\cos\theta+\frac14\cos3\theta$ leaks around 4.5 and 13.5.`);
  }

  quiz(3524, "2022F", 4, 12, "Related DFTs (magnitude and angle matching)", ["DFT", "Properties", "Matching"],
    t`$f[n]$ is periodic with $N=30$; one period and the magnitude and angle of its 30-point DFT are drawn in the quiz. Five signals are derived: $g_1[n]=f[-n]$, $g_2[n]=f[n-1]$, $g_3[n]=f[n+1]$, $g_4[n]=f^2[n]$, and $g_5[n]=f[n/2]$ for even $n$ (0 otherwise). Match each to magnitude panels A–J and angle panels a–j. The plots are hand-drawn, so work this one from the PDF.`,
    t`See the official solutions PDF. Key ideas: $f[-n]\to F[-k]$ (magnitude flipped, angle negated and flipped); a delay or advance by 1 keeps the magnitude and adds $\mp2\pi k/30$ to the angle; $f^2$ is the circular convolution of $F$ with itself; inserting zeros ($g_5$) compresses the spectrum and repeats it.`);

  // ================================================================ Spring 2022
  quiz(3531, "2022S", 1, 12, "Closing sums", ["DFT", "Geometric Sums"],
    t`$k$ and $n$ are integers and $N>0$ is even. Simplify each sum by closing it and removing indeterminate forms. Answers need only be valid for $0\le k<N$.

$f_0[k]=\sum_{n=0}^{N-1}e^{-j\frac{2\pi kn}{N}}$, $\quad f_1[k]=\sum_{n=0}^{N-1}e^{j\frac{2\pi k_0n}{N}}e^{-j\frac{2\pi kn}{N}}$, $\quad f_2[k]=\sum_{n=0}^{N-1}e^{-j\frac{4\pi kn}{N}}$.

The graded boxes use $N=8$ and $k_0=3$.`,
    t`- $f_0[k]=\dfrac{1-e^{-j2\pi k}}{1-e^{-j2\pi k/N}}=N\delta[k]$: the numerator is 0, and only $k=0$ makes the denominator 0 (then every term is 1).
- $f_1[k]=N\delta[k-k_0]$ (the same sum with $k-k_0$).
- $f_2[k]=N\delta[k]+N\delta[k-\frac N2]$: the denominator $1-e^{-j4\pi k/N}$ is 0 at $k=0$ and $k=N/2$.`,
    [part("$f_0[0]$", "8"), part("$f_0[3]$", "0"), part("$f_1[3]$", "8"), part("$f_1[0]$", "0"), part("$f_2[4]$", "8"), part("$f_2[2]$", "0")]);

  quiz(3532, "2022S", 3, 9, "Convolving steps (matching)", ["Convolution", "Matching"],
    t`Three signals $f_0,f_1,f_2$ and eight signals $g_0$ to $g_7$ are drawn in the quiz. For each $g_i$, decide whether it is a convolution of two of the $f$'s, and which. The plots are hand-drawn, so work this one from the PDF.`,
    t`See the official solutions PDF. Key ideas: the support of $a*b$ runs from the sum of the start times to the sum of the end times; areas multiply; convolving with a step integrates.`);

  quiz(3533, "2022S", 4, 10, "Systems: DT and CT sinusoidal steady state", ["Frequency Response", "Cascade"],
    t`**Part a.** $S$ is LTI with $h[n]=\left(\frac12\right)^n$ when $n$ is even and $n\ge0$, and 0 otherwise. The input is $x[n]=\cos(\pi n/4)$ and the output is $y[n]=A\cos(\pi n/4)+B\sin(\pi n/4)$. Find $A$ and $B$.

**Part b.** Three identical subsystems, each with $y_i(t)+\frac{d}{dt}y_i(t)=x_i(t)$, are cascaded. The input is $x(t)=\cos t$ and the output is $y(t)=C\cos(t-\phi)$. Find $C$ and $\phi$.`,
    t`**Part a.** $H(\Omega)=\sum_{m\ge0}\frac{1}{4^m}e^{-j2m\Omega}=\dfrac{1}{1-\frac14e^{-j2\Omega}}$. At $\Omega=\frac\pi4$, $e^{-j\pi/2}=-j$: $H=\dfrac{1}{1+\frac j4}=\dfrac{4}{4+j}=\dfrac{16-4j}{17}$. Then $y=\operatorname{Re}\{He^{j\pi n/4}\}$ gives $A=\frac{16}{17}$, $B=\frac{4}{17}$.

**Part b.** $H_i=\frac1{1+j\omega}$, so $H=\frac{1}{(1+j\omega)^3}$. At $\omega=1$: $\frac{1}{1+j}=\frac1{\sqrt2}e^{-j\pi/4}$, so $C=\frac1{2\sqrt2}$ and $\phi=\frac{3\pi}4$.`,
    [part("$A$", "16/17"), part("$B$", "4/17"), part("$C$", "1/(2*sqrt(2))"), part("$\\phi$", "3*pi/4")]);

  quiz(3534, "2022S", 5, 12, "DFT matching (real parts)", ["DFT", "Matching"],
    t`Eight signals $f_0$ to $f_7$ ($n=0..11$) and fourteen plots of the real part of 12-point DFTs (A–N) are drawn in the quiz. Match each signal to its plot. The plots are hand-drawn, so work this one from the PDF, or use the generated drill "DFT matching: real parts", which has the same format.`,
    t`See the official solutions PDF. Key ideas: $\delta[n-n_0]$ gives $\operatorname{Re}X[k]=\frac1{12}\cos(2\pi kn_0/12)$; real and even (circularly) signals give real DFTs; sines give purely imaginary DFTs (real part 0).`);

  for (const p of P) for (const q of p.parts) if (Number.isInteger(root.Expr.evaluate(q.answer))) q.tol = 0;
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
