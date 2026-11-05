// Generated drills for 6.3700 Quiz 2 (L8-L13): covariance, conditional expectation and variance,
// random sums, joint PDFs, derived distributions, convolution, conditioning, continuous Bayes.
// Each drill is a function of a seed. Answers are computed with exact fractions (class Fr) or,
// where e or logs appear, as expression strings that js/expr.js evaluates.
// Drill shape (same as js/drills-6191.js): { title, statement, grids: [], parts: [{ q, answer } |
// { q, accept }], solution }.
(function (root) {
  // ---------------------------------------------------------------- exact fractions
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  class Fr {
    constructor(n, d = 1) {
      if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error(`bad fraction ${n}/${d}`);
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d); this.n = n / g; this.d = d / g;
      if (!Number.isSafeInteger(this.n) || !Number.isSafeInteger(this.d)) throw new Error("fraction overflow");
    }
    add(o) { o = fr(o); return new Fr(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = fr(o); return new Fr(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = fr(o); return new Fr(this.n * o.n, this.d * o.d); }
    div(o) { o = fr(o); return new Fr(this.n * o.d, this.d * o.n); }
    neg() { return new Fr(-this.n, this.d); }
    pow(k) { let r = fr(1); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
    eq(o) { o = fr(o); return this.n === o.n && this.d === o.d; }
    sign() { return Math.sign(this.n); }
    val() { return this.n / this.d; }
    toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`; }
    tex() { return this.d === 1 ? `${this.n}` : `${this.n < 0 ? "-" : ""}\\frac{${Math.abs(this.n)}}{${this.d}}`; }
  }
  const fr = (n, d = 1) => (n instanceof Fr ? n : new Fr(n, d));
  const sum = (xs) => xs.reduce((a, b) => a.add(b), fr(0));
  const T = (x) => (x instanceof Fr ? x.tex() : String(x)); // TeX of a number
  const S = (x) => String(x); // answer string

  // ---------------------------------------------------------------- seeded random numbers
  function rng(seed) {
    let a = seed >>> 0;
    const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const R = {
      next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), pick: (xs) => xs[Math.floor(next() * xs.length)],
      chance: (p) => next() < p,
      shuffle: (xs) => { const a2 = xs.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
      nz: (lo, hi) => { let v; do v = R.int(lo, hi); while (v === 0); return v; },
    };
    return R;
  }
  const YES = ["yes", "y", "true", "t", "independent"], NO = ["no", "n", "false", "f", "dependent", "not independent"];
  const yesNo = (b) => (b ? YES : NO);

  // ---------------------------------------------------------------- 1. linear combinations
  function lincomb(R) {
    const sx = R.int(1, 4), sy = R.int(1, 4), rho = R.pick([fr(-1, 2), fr(-1, 4), fr(1, 4), fr(1, 2), fr(3, 4), fr(0)]);
    const cov = rho.mul(sx * sy), vx = sx * sx, vy = sy * sy, mx = R.int(-3, 5), my = R.int(-3, 5);
    const a = R.nz(-3, 3), b = R.nz(-3, 3), c = R.int(-5, 5), p = R.nz(-3, 3), q = R.nz(-2, 3), r = R.nz(-3, 3), s = R.nz(-3, 3);
    const EL = fr(a * mx + b * my + c);
    const VL = fr(a * a * vx + b * b * vy).add(cov.mul(2 * a * b));
    const CU = fr(p * q * vx).add(cov.mul(p * r));
    const EXY = cov.add(mx * my);
    const VD = fr(vx + vy).sub(cov.mul(2));
    const RHO = rho.mul(Math.sign(p * s));
    const lin = (k, v) => (k === 1 ? v : k === -1 ? `-${v}` : `${k}${v}`);
    const L = `${lin(a, "X")} ${b < 0 ? "-" : "+"} ${lin(Math.abs(b), "Y")} ${c < 0 ? "-" : "+"} ${Math.abs(c)}`;
    const U2 = `${lin(q, "X")} ${r < 0 ? "-" : "+"} ${lin(Math.abs(r), "Y")}`;
    return {
      title: "Variance and covariance of linear combinations",
      statement: `**Linear combinations.** $E[X]=${mx}$, $E[Y]=${my}$, $\\operatorname{Var}(X)=${vx}$, $\\operatorname{Var}(Y)=${vy}$, and the correlation coefficient is $\\rho(X,Y)=${rho.tex()}$. Find the quantities below.`,
      grids: [],
      parts: [
        { q: `$E[${L}]$`, answer: S(EL) },
        { q: `$\\operatorname{Var}(${L})$`, answer: S(VL) },
        { q: `$E[XY]$`, answer: S(EXY) },
        { q: `$\\operatorname{Var}(X-Y)$`, answer: S(VD) },
        { q: `$\\operatorname{cov}(${lin(p, "X")}+1,\\; ${U2})$`, answer: S(CU) },
        { q: `$\\rho(${lin(p, "X")}+2,\\; ${lin(s, "Y")}-3)$`, answer: S(RHO) },
      ],
      solution: `First, $\\operatorname{cov}(X,Y)=\\rho\\,\\sigma_X\\sigma_Y=${rho.tex()}\\cdot${sx}\\cdot${sy}=${cov.tex()}$.

- $E[${L}]=(${a})(${mx})+(${b})(${my})+(${c})=${EL.tex()}$ (constants shift the mean).
- $\\operatorname{Var}(aX+bY+c)=a^2\\operatorname{Var}X+b^2\\operatorname{Var}Y+2ab\\operatorname{cov}(X,Y)=${a * a}\\cdot${vx}+${b * b}\\cdot${vy}+(${2 * a * b})\\cdot(${cov.tex()})=${VL.tex()}$. The constant does not change the variance.
- $E[XY]=\\operatorname{cov}(X,Y)+E[X]E[Y]=${cov.tex()}+${mx * my}=${EXY.tex()}$.
- $\\operatorname{Var}(X-Y)=\\operatorname{Var}X+\\operatorname{Var}Y-2\\operatorname{cov}=${VD.tex()}$.
- Bilinearity: $\\operatorname{cov}(${lin(p, "X")}+1,\\,${U2})=(${p})(${q})\\operatorname{Var}X+(${p})(${r})\\operatorname{cov}(X,Y)=${CU.tex()}$.
- $\\rho(aX+b,cY+d)=\\operatorname{sign}(ac)\\,\\rho(X,Y)=${RHO.tex()}$: scaling does not change $|\\rho|$, only a sign flip does.`,
    };
  }

  // ---------------------------------------------------------------- 2. joint PMF table
  function jointpmf(R) {
    const xs = R.pick([[0, 1, 2], [-1, 0, 1], [1, 2, 3], [0, 1]]), ys = R.pick([[0, 1], [1, 2], [0, 1, 2]]);
    const mode = R.pick(["general", "general", "general", "indep", "uncorr"]);
    let w;
    if (mode === "indep") {
      const px = xs.map(() => R.int(1, 3)), py = ys.map(() => R.int(1, 3));
      w = ys.map((_, j) => xs.map((_, i) => px[i] * py[j]));
    } else if (mode === "uncorr" && xs[0] === -1) {
      // symmetric in x, so E[XY] = E[X]E[Y] = 0 although X and Y are dependent (most of the time)
      w = ys.map(() => { const e = R.int(0, 3), m = R.int(0, 3); return [e, m, e]; });
    } else {
      w = ys.map(() => xs.map(() => R.int(0, 4)));
    }
    for (let j = 0; j < ys.length; j++) if (w[j].every((v) => !v)) w[j][R.int(0, xs.length - 1)] = 1;
    for (let i = 0; i < xs.length; i++) if (w.every((row) => !row[i])) w[R.int(0, ys.length - 1)][i] += 1;
    const D = w.flat().reduce((a, b) => a + b, 0);
    const P = (i, j) => fr(w[j][i], D);
    const pX = xs.map((_, i) => sum(ys.map((_, j) => P(i, j)))), pY = ys.map((_, j) => sum(xs.map((_, i) => P(i, j))));
    const EX = sum(xs.map((x, i) => pX[i].mul(x))), EY = sum(ys.map((y, j) => pY[j].mul(y)));
    const EX2 = sum(xs.map((x, i) => pX[i].mul(x * x))), EY2 = sum(ys.map((y, j) => pY[j].mul(y * y)));
    const EXY = sum(ys.flatMap((y, j) => xs.map((x, i) => P(i, j).mul(x * y))));
    const VX = EX2.sub(EX.mul(EX)), VY = EY2.sub(EY.mul(EY)), COV = EXY.sub(EX.mul(EY));
    const indep = ys.every((_, j) => xs.every((_, i) => P(i, j).eq(pX[i].mul(pY[j]))));
    const condE = ys.map((_, j) => sum(xs.map((x, i) => P(i, j).div(pY[j]).mul(x))));
    const condV = ys.map((_, j) => sum(xs.map((x, i) => P(i, j).div(pY[j]).mul(x * x))).sub(condE[j].mul(condE[j])));
    const EV = sum(ys.map((_, j) => pY[j].mul(condV[j])));
    const VE = sum(ys.map((_, j) => pY[j].mul(condE[j].mul(condE[j])))).sub(EX.mul(EX));
    if (!EV.add(VE).eq(VX)) throw new Error("total variance check failed");
    const j0 = R.int(0, ys.length - 1), y0 = ys[j0];
    const table = `| | ${xs.map((x) => `$x=${x}$`).join(" | ")} |\n|---|${xs.map(() => "---").join("|")}|\n${ys.map((y, j) => `| $y=${y}$ | ${xs.map((_, i) => `$\\tfrac{${w[j][i]}}{${D}}$`).join(" | ")} |`).join("\n")}`;
    return {
      title: "Joint PMF: covariance and conditional expectation",
      statement: `**Joint PMF.** The table gives $p_{X,Y}(x,y)$.\n\n${table}\n\nFind the quantities below. For the independence question, answer yes or no.`,
      grids: [],
      parts: [
        { q: "$E[X]$", answer: S(EX) }, { q: "$E[Y]$", answer: S(EY) },
        { q: "$\\operatorname{cov}(X,Y)$", answer: S(COV) }, { q: "$\\operatorname{Var}(X+Y)$", answer: S(VX.add(VY).add(COV.mul(2))) },
        { q: `$E[X\\mid Y=${y0}]$`, answer: S(condE[j0]) }, { q: `$\\operatorname{Var}(X\\mid Y=${y0})$`, answer: S(condV[j0]) },
        { q: "$E[\\operatorname{Var}(X\\mid Y)]$", answer: S(EV) }, { q: "$\\operatorname{Var}(E[X\\mid Y])$", answer: S(VE) },
        { q: "Are $X$ and $Y$ independent?", accept: yesNo(indep) },
      ],
      solution: `Marginals: $p_X=(${pX.map(T).join(",\\ ")})$ on $x=${xs.join(",")}$; $p_Y=(${pY.map(T).join(",\\ ")})$ on $y=${ys.join(",")}$.

- $E[X]=${EX.tex()}$, $E[X^2]=${EX2.tex()}$, $\\operatorname{Var}X=${VX.tex()}$; $E[Y]=${EY.tex()}$, $\\operatorname{Var}Y=${VY.tex()}$.
- $E[XY]=\\sum xy\\,p(x,y)=${EXY.tex()}$, so $\\operatorname{cov}=${EXY.tex()}-(${EX.tex()})(${EY.tex()})=${COV.tex()}$.
- $\\operatorname{Var}(X+Y)=\\operatorname{Var}X+\\operatorname{Var}Y+2\\operatorname{cov}=${VX.add(VY).add(COV.mul(2)).tex()}$.
- Given $Y=y$, divide the row by $p_Y(y)$. ${ys.map((y, j) => `$Y=${y}$: $E[X\\mid Y]=${condE[j].tex()}$, $\\operatorname{Var}(X\\mid Y)=${condV[j].tex()}$`).join("; ")}.
- $E[\\operatorname{Var}(X\\mid Y)]=${EV.tex()}$ and $\\operatorname{Var}(E[X\\mid Y])=${VE.tex()}$. Check: they add to $\\operatorname{Var}X=${VX.tex()}$ (law of total variance).
- ${indep ? "Every entry equals $p_X(x)p_Y(y)$, so $X$ and $Y$ are independent." : COV.n === 0 ? "$\\operatorname{cov}=0$, but some entry differs from $p_X(x)p_Y(y)$: uncorrelated but **dependent**." : "Some entry differs from $p_X(x)p_Y(y)$ (and $\\operatorname{cov}\\ne0$), so they are dependent."}`,
    };
  }

  // ---------------------------------------------------------------- 3. law of total variance (mixtures)
  function totalvar(R) {
    const k = R.int(2, 3), wts = R.pick(k === 2 ? [[1, 1], [1, 2], [1, 3], [2, 3]] : [[1, 1, 2], [1, 2, 3], [1, 1, 1]]);
    const W = wts.reduce((a, b) => a + b, 0), p = wts.map((v) => fr(v, W));
    const fam = R.pick(["unif", "exp", "pois", "bin", "norm"]);
    let groups, story, desc;
    if (fam === "unif") {
      groups = p.map(() => { const a = R.int(0, 6), b = a + R.pick([2, 3, 4, 6]); return { m: fr(a + b, 2), v: fr((b - a) ** 2, 12), d: `uniform on $[${a},${b}]$`, s: (h) => h.unif(a, b) }; });
      story = "A bus arrives from one of several depots. The arrival time $X$ (minutes) depends on the depot $Y$.";
    } else if (fam === "exp") {
      groups = p.map(() => { const l = R.pick([fr(1), fr(2), fr(3), fr(4), fr(1, 2)]); return { m: fr(1).div(l), v: fr(1).div(l.mul(l)), d: `exponential with rate $${l.tex()}$`, s: (h) => h.exp(l.val()) }; });
      story = "A light bulb comes from one of several factories $Y$. Its lifetime $X$ depends on the factory.";
    } else if (fam === "pois") {
      groups = p.map(() => { const l = R.int(1, 8); return { m: fr(l), v: fr(l), d: `Poisson with mean $${l}$`, s: (h) => h.pois(l) }; });
      story = "A day is of type $Y$. The number $X$ of emails that day depends on the type.";
    } else if (fam === "bin") {
      const q = R.pick([fr(1, 2), fr(1, 3), fr(1, 4)]);
      groups = p.map(() => { const n = R.int(2, 10); return { m: q.mul(n), v: q.mul(n).mul(fr(1).sub(q)), d: `binomial with $n=${n}$, $p=${q.tex()}$`, s: (h) => h.bin(n, q.val()) }; });
      story = "A student picks a problem set $Y$ at random. The number $X$ of correct answers depends on the set.";
    } else {
      groups = p.map(() => { const m = R.int(-2, 8), v = R.int(1, 9); return { m: fr(m), v: fr(v), d: `normal with mean $${m}$ and variance $${v}$`, s: (h) => m + Math.sqrt(v) * h.norm() }; });
      story = "A sensor is in one of several modes $Y$. Its reading $X$ depends on the mode.";
    }
    desc = groups.map((g, i) => `- With probability $${p[i].tex()}$, $Y=${i + 1}$ and then $X$ is ${g.d}.`).join("\n");
    const EX = sum(groups.map((g, i) => p[i].mul(g.m)));
    const EV = sum(groups.map((g, i) => p[i].mul(g.v)));
    const VE = sum(groups.map((g, i) => p[i].mul(g.m.mul(g.m)))).sub(EX.mul(EX));
    return {
      _mc: { sample: (h) => { let u = h.u(), i = 0; while (i < k - 1 && u >= p[i].val()) { u -= p[i].val(); i++; } return { X: groups[i].s(h), M: groups[i].m.val(), V: groups[i].v.val() }; },
        parts: [["mean", "X"], ["mean", "V"], ["var", "M"], ["var", "X"]] },
      title: "Law of total variance",
      statement: `**Total variance.** ${story}\n\n${desc}\n\nFind the quantities below.`,
      grids: [],
      parts: [
        { q: "$E[X]$", answer: S(EX) },
        { q: "$E[\\operatorname{Var}(X\\mid Y)]$", answer: S(EV) },
        { q: "$\\operatorname{Var}(E[X\\mid Y])$", answer: S(VE) },
        { q: "$\\operatorname{Var}(X)$", answer: S(EV.add(VE)) },
      ],
      solution: `Read the conditional means and variances from each distribution:

| $Y$ | probability | $E[X\\mid Y]$ | $\\operatorname{Var}(X\\mid Y)$ |
|---|---|---|---|
${groups.map((g, i) => `| ${i + 1} | $${p[i].tex()}$ | $${g.m.tex()}$ | $${g.v.tex()}$ |`).join("\n")}

- Iterated expectations: $E[X]=\\sum_y P(Y=y)E[X\\mid Y=y]=${EX.tex()}$.
- $E[\\operatorname{Var}(X\\mid Y)]$ is the average of the last column: $${EV.tex()}$.
- $E[X\\mid Y]$ is a random variable with the values of the third column: $\\operatorname{Var}(E[X\\mid Y])=E[(E[X\\mid Y])^2]-(E[X])^2=${VE.tex()}$.
- Total variance: $\\operatorname{Var}X=${EV.tex()}+${VE.tex()}=${EV.add(VE).tex()}$.`,
    };
  }

  // ---------------------------------------------------------------- 4. random sums
  const NDIST = [
    () => ({ d: "the roll of a fair six-sided die", m: fr(7, 2), v: fr(35, 12), s: (h) => h.die(6) }),
    (R) => { const k = R.int(3, 8); return { d: `uniform on $\\{1,\\dots,${k}\\}$`, m: fr(k + 1, 2), v: fr(k * k - 1, 12), s: (h) => h.die(k) }; },
    (R) => { const m = R.int(3, 10), q = R.pick([fr(1, 2), fr(1, 3), fr(1, 4)]); return { d: `binomial with $n=${m}$, $p=${q.tex()}$`, m: q.mul(m), v: q.mul(m).mul(fr(1).sub(q)), s: (h) => h.bin(m, q.val()) }; },
    (R) => { const mu = R.int(2, 9); return { d: `Poisson with mean $${mu}$`, m: fr(mu), v: fr(mu), s: (h) => h.pois(mu) }; },
    (R) => { const q = R.pick([fr(1, 2), fr(1, 3), fr(1, 4)]); return { d: `geometric with parameter $${q.tex()}$ (values $1,2,\\dots$)`, m: fr(1).div(q), v: fr(1).sub(q).div(q.mul(q)), s: (h) => h.geom(q.val()) }; },
  ];
  const XDIST = [
    (R) => { const p = R.pick([fr(1, 2), fr(1, 3), fr(1, 4), fr(2, 3)]); return { d: `Bernoulli with $p=${p.tex()}$ (a fair coin when $p=\\frac12$)`, m: p, v: p.mul(fr(1).sub(p)), s: (h) => (h.u() < p.val() ? 1 : 0) }; },
    () => ({ d: "the roll of a fair six-sided die", m: fr(7, 2), v: fr(35, 12), s: (h) => h.die(6) }),
    (R) => { const a = R.int(1, 6) * 2; return { d: `uniform on $[0,${a}]$`, m: fr(a, 2), v: fr(a * a, 12), s: (h) => h.unif(0, a) }; },
    (R) => { const l = R.pick([fr(1), fr(2), fr(1, 2), fr(1, 3)]); return { d: `exponential with rate $${l.tex()}$`, m: fr(1).div(l), v: fr(1).div(l.mul(l)), s: (h) => h.exp(l.val()) }; },
    (R) => { const nu = R.int(1, 5); return { d: `Poisson with mean $${nu}$`, m: fr(nu), v: fr(nu), s: (h) => h.pois(nu) }; },
  ];
  function randsum(R) {
    const N = R.pick(NDIST)(R), X = R.pick(XDIST)(R), n0 = R.int(2, 6);
    const EY = N.m.mul(X.m), VY = N.m.mul(X.v).add(X.m.mul(X.m).mul(N.v)), CNY = X.m.mul(N.v);
    return {
      _mc: { sample: (h) => { const n = N.s(h); let y = 0, y0 = 0; for (let i = 0; i < n; i++) y += X.s(h); for (let i = 0; i < n0; i++) y0 += X.s(h); return { N: n, Y: y, Y0: y0 }; },
        parts: [["mean", "Y0"], ["mean", "Y"], ["var", "Y"], ["cov", "N", "Y"]] },
      title: "Sum of a random number of random variables",
      statement: `**Random sum.** $N$ is ${N.d}. Given $N$, we add $Y=X_1+\\dots+X_N$, where the $X_i$ are i.i.d., independent of $N$, and each $X_i$ is ${X.d}.`,
      grids: [],
      parts: [
        { q: `$E[Y\\mid N=${n0}]$`, answer: S(X.m.mul(n0)) },
        { q: "$E[Y]$", answer: S(EY) },
        { q: "$\\operatorname{Var}(Y)$", answer: S(VY) },
        { q: "$\\operatorname{cov}(N,Y)$", answer: S(CNY) },
      ],
      solution: `$E[N]=${N.m.tex()}$, $\\operatorname{Var}N=${N.v.tex()}$, $E[X]=${X.m.tex()}$, $\\operatorname{Var}X=${X.v.tex()}$.

- $E[Y\\mid N=n]=nE[X]$, so $E[Y\\mid N=${n0}]=${X.m.mul(n0).tex()}$ and $E[Y\\mid N]=N\\,E[X]$.
- $E[Y]=E[N]E[X]=${EY.tex()}$.
- $\\operatorname{Var}(Y)=E[N]\\operatorname{Var}X+(E[X])^2\\operatorname{Var}N=${N.m.mul(X.v).tex()}+${X.m.mul(X.m).mul(N.v).tex()}=${VY.tex()}$. The first term is $E[\\operatorname{Var}(Y\\mid N)]$, the second is $\\operatorname{Var}(E[Y\\mid N])$.
- $E[NY]=E[N\\,E[Y\\mid N]]=E[X]E[N^2]$, so $\\operatorname{cov}(N,Y)=E[X](E[N^2]-E[N]^2)=E[X]\\operatorname{Var}N=${CNY.tex()}$.`,
    };
  }

  // ---------------------------------------------------------------- 5. random parameters (hierarchical models)
  function hierarchy(R) {
    if (R.chance(0.6)) {
      let Q;
      if (R.chance(0.6)) {
        const [a, b] = R.pick([[0, 1], [0, 1], [fr(1, 2), fr(1)], [fr(0), fr(1, 2)], [fr(1, 4), fr(3, 4)]]).map((x) => fr(x));
        Q = { d: `uniform on $[${a.tex()},${b.tex()}]$`, m: a.add(b).div(2), v: b.sub(a).pow(2).div(12), s: (h) => h.unif(a.val(), b.val()) };
      } else {
        const q1 = R.pick([fr(1, 4), fr(1, 3), fr(1, 2)]), q2 = R.pick([fr(2, 3), fr(3, 4), fr(1)]), w = R.pick([fr(1, 2), fr(1, 3), fr(2, 3)]);
        const m = w.mul(q1).add(fr(1).sub(w).mul(q2));
        Q = { d: `$${q1.tex()}$ with probability $${w.tex()}$ and $${q2.tex()}$ otherwise`, m, v: w.mul(q1.mul(q1)).add(fr(1).sub(w).mul(q2.mul(q2))).sub(m.mul(m)), s: (h) => (h.u() < w.val() ? q1.val() : q2.val()) };
      }
      const n = R.int(3, 12), EQ2 = Q.v.add(Q.m.mul(Q.m));
      const EX = Q.m.mul(n), VX = Q.m.sub(EQ2).mul(n).add(Q.v.mul(n * n));
      return {
        _mc: { sample: (h) => { const q = Q.s(h), t = Array.from({ length: n }, () => (h.u() < q ? 1 : 0)); return { X1: t[0], X2: t[1], X12: t[0] * t[1], X: t.reduce((a2, b2) => a2 + b2, 0) }; },
          parts: [["mean", "X1"], ["mean", "X12"], ["cov", "X1", "X2"], ["mean", "X"], ["var", "X"]] },
        title: "Coin with a random bias",
        statement: `**Random bias.** A coin's probability of heads is a random variable $Q$, which is ${Q.d}. Given $Q=q$, we toss the coin $n=${n}$ times independently. $X_i$ is 1 if toss $i$ is heads, and $X$ is the number of heads.`,
        grids: [],
        parts: [
          { q: "$P(X_1=1)$", answer: S(Q.m) }, { q: "$P(X_1=1,\\ X_2=1)$", answer: S(EQ2) },
          { q: "$\\operatorname{cov}(X_1,X_2)$", answer: S(Q.v) }, { q: "$E[X]$", answer: S(EX) }, { q: "$\\operatorname{Var}(X)$", answer: S(VX) },
        ],
        solution: `$E[Q]=${Q.m.tex()}$, $\\operatorname{Var}Q=${Q.v.tex()}$, $E[Q^2]=${EQ2.tex()}$.

- $P(X_1=1)=E[P(X_1=1\\mid Q)]=E[Q]=${Q.m.tex()}$.
- $P(X_1=X_2=1)=E[Q^2]=${EQ2.tex()}$ (the tosses are independent only given $Q$).
- $\\operatorname{cov}(X_1,X_2)=E[Q^2]-E[Q]^2=\\operatorname{Var}Q=${Q.v.tex()}$${Q.v.n ? ": the tosses are dependent (heads makes a large $Q$ more likely)" : ""}.
- $E[X\\mid Q]=nQ$, $\\operatorname{Var}(X\\mid Q)=nQ(1-Q)$, so $E[X]=nE[Q]=${EX.tex()}$.
- $\\operatorname{Var}X=E[nQ(1-Q)]+\\operatorname{Var}(nQ)=n(E[Q]-E[Q^2])+n^2\\operatorname{Var}Q=${Q.m.sub(EQ2).mul(n).tex()}+${Q.v.mul(n * n).tex()}=${VX.tex()}$.`,
      };
    }
    let L;
    if (R.chance(0.5)) { const a = R.int(1, 6) * 2; L = { d: `uniform on $[0,${a}]$`, m: fr(a, 2), v: fr(a * a, 12), s: (h) => h.unif(0, a) }; }
    else { const t = R.pick([fr(1), fr(1, 2), fr(1, 3), fr(2)]); L = { d: `exponential with rate $${t.tex()}$`, m: fr(1).div(t), v: fr(1).div(t.mul(t)), s: (h) => h.exp(t.val()) }; }
    return {
      _mc: { sample: (h) => { const l = L.s(h); return { X: h.pois(l), L: l }; }, parts: [["mean", "X"], ["mean", "L"], ["var", "X"], ["cov", "X", "L"]] },
      title: "Poisson count with a random rate",
      statement: `**Random rate.** The rate $\\Lambda$ of calls in an hour is random and ${L.d}. Given $\\Lambda=\\lambda$, the number of calls $X$ is Poisson with mean $\\lambda$.`,
      grids: [],
      parts: [
        { q: "$E[X]$", answer: S(L.m) }, { q: "$E[\\operatorname{Var}(X\\mid\\Lambda)]$", answer: S(L.m) },
        { q: "$\\operatorname{Var}(X)$", answer: S(L.m.add(L.v)) }, { q: "$\\operatorname{cov}(X,\\Lambda)$", answer: S(L.v) },
      ],
      solution: `$E[X\\mid\\Lambda]=\\Lambda$ and $\\operatorname{Var}(X\\mid\\Lambda)=\\Lambda$ (Poisson).

- $E[X]=E[\\Lambda]=${L.m.tex()}$.
- $E[\\operatorname{Var}(X\\mid\\Lambda)]=E[\\Lambda]=${L.m.tex()}$, $\\operatorname{Var}(E[X\\mid\\Lambda])=\\operatorname{Var}\\Lambda=${L.v.tex()}$, so $\\operatorname{Var}X=${L.m.add(L.v).tex()}$ (more than a plain Poisson count).
- $E[X\\Lambda]=E[\\Lambda E[X\\mid\\Lambda]]=E[\\Lambda^2]$, so $\\operatorname{cov}(X,\\Lambda)=\\operatorname{Var}\\Lambda=${L.v.tex()}$.`,
    };
  }

  // ---------------------------------------------------------------- 6. counts as sums of indicators
  function indicators(R) {
    const kind = R.pick(["boxes", "runs", "dice", "hats"]);
    if (kind === "boxes") {
      const k = R.int(3, 4), n = R.int(3, 6);
      const a = fr(k - 1, k).pow(n), b = fr(k - 2, k).pow(n);
      const E = a.mul(k), V = E.add(b.mul(k * (k - 1))).sub(E.mul(E));
      return { _mc: { sample: (h) => { const c = Array(k).fill(0); for (let i = 0; i < n; i++) c[h.die(k) - 1]++; return { I1: +!c[0], I12: +(!c[0] && !c[1]), X: c.filter((v) => !v).length }; },
          parts: [["mean", "I1"], ["mean", "I12"], ["mean", "X"], ["var", "X"]] },
        title: "Indicators: empty boxes", statement: `**Empty boxes.** We throw $${n}$ balls independently and uniformly into $${k}$ boxes. $X$ is the number of empty boxes.`, grids: [],
        parts: [{ q: "$P(\\text{box 1 is empty})$", answer: S(a) }, { q: "$P(\\text{boxes 1 and 2 are both empty})$", answer: S(b) }, { q: "$E[X]$", answer: S(E) }, { q: "$\\operatorname{Var}(X)$", answer: S(V) }],
        solution: `Write $X=\\sum_{i=1}^{${k}}I_i$ with $I_i=1$ if box $i$ is empty.

- $E[I_i]=(1-\\frac1{${k}})^{${n}}=${a.tex()}$, so $E[X]=${k}\\cdot${a.tex()}=${E.tex()}$.
- $E[I_iI_j]=(1-\\frac2{${k}})^{${n}}=${b.tex()}$ for $i\\ne j$.
- $\\operatorname{Var}X=\\sum_i\\operatorname{Var}I_i+\\sum_{i\\ne j}\\operatorname{cov}(I_i,I_j)=E[X]+${k}\\cdot${k - 1}\\cdot${b.tex()}-(E[X])^2=${V.tex()}$.` };
    }
    if (kind === "runs") {
      const n = R.int(4, 10), p = R.pick([fr(1, 2), fr(1, 3), fr(2, 3)]);
      const p2 = p.pow(2), p3 = p.pow(3), p4 = p.pow(4);
      const E = p2.mul(n - 1), V = p2.sub(p4).mul(n - 1).add(p3.sub(p4).mul(2 * (n - 2)));
      return { _mc: { sample: (h) => { const t = Array.from({ length: n }, () => (h.u() < p.val() ? 1 : 0)), I = t.slice(1).map((v, i) => v * t[i]); return { X: I.reduce((a2, b2) => a2 + b2, 0), I1: I[0], I2: I[1], I3: I[2] }; },
          parts: [["mean", "X"], ["cov", "I1", "I2"], ["cov", "I1", "I3"], ["var", "X"]] },
        title: "Indicators: overlapping pairs", statement: `**Pairs of heads.** We toss a coin with $P(\\text{heads})=${p.tex()}$ $n=${n}$ times. $X$ is the number of $i\\in\\{1,\\dots,${n - 1}\\}$ such that tosses $i$ and $i+1$ are both heads.`, grids: [],
        parts: [{ q: "$E[X]$", answer: S(E) }, { q: "$\\operatorname{cov}(I_1,I_2)$, where $I_i$ marks the pair $(i,i+1)$", answer: S(p3.sub(p4)) }, { q: "$\\operatorname{cov}(I_1,I_3)$", answer: "0" }, { q: "$\\operatorname{Var}(X)$", answer: S(V) }],
        solution: `$X=\\sum_{i=1}^{${n - 1}}I_i$, $E[I_i]=p^2=${p2.tex()}$, so $E[X]=${n - 1}p^2=${E.tex()}$.

- Neighbors $I_i,I_{i+1}$ share a toss: $E[I_iI_{i+1}]=p^3$, $\\operatorname{cov}=p^3-p^4=${p3.sub(p4).tex()}$.
- Pairs that share no toss are independent: covariance 0.
- $\\operatorname{Var}X=${n - 1}(p^2-p^4)+2\\cdot${n - 2}(p^3-p^4)=${V.tex()}$ (there are ${n - 2} neighbor pairs, each counted twice in $\\sum_{i\\ne j}$).` };
    }
    if (kind === "dice") {
      const k = R.pick([4, 6, 8]), n = R.int(5, 30);
      const cov = fr(-n, k * k), V2 = fr(2, k).mul(fr(k - 2, k)).mul(n), rho = fr(-1, k - 1);
      return { _mc: { sample: (h) => { let A = 0, B = 0; for (let i = 0; i < n; i++) { const r = h.die(k); A += r === 1; B += r === 2; } return { A, B, S: A + B }; },
          parts: [["mean", "A"], ["cov", "A", "B"], ["corr", "A", "B"], ["var", "S"]] },
        title: "Indicators: counts of two faces", statement: `**Multinomial counts.** We roll a fair $${k}$-sided die $n=${n}$ times. $A$ is the number of 1s and $B$ is the number of 2s.`, grids: [],
        parts: [{ q: "$E[A]$", answer: S(fr(n, k)) }, { q: "$\\operatorname{cov}(A,B)$", answer: S(cov) }, { q: "$\\rho(A,B)$", answer: S(rho) }, { q: "$\\operatorname{Var}(A+B)$", answer: S(V2) }],
        solution: `$A=\\sum_t I_t$, $B=\\sum_t J_t$ with $I_t$ = roll $t$ is 1, $J_t$ = roll $t$ is 2.

- $E[A]=n/${k}=${fr(n, k).tex()}$, $\\operatorname{Var}A=n\\cdot\\frac1{${k}}\\cdot\\frac{${k - 1}}{${k}}$.
- Same roll: $I_tJ_t=0$, so $\\operatorname{cov}(I_t,J_t)=-\\frac1{${k * k}}$. Different rolls are independent. So $\\operatorname{cov}(A,B)=-\\frac{n}{${k * k}}=${cov.tex()}$.
- $\\rho=\\dfrac{-n/${k * k}}{n\\cdot${k - 1}/${k * k}}=${rho.tex()}$ (does not depend on $n$).
- $A+B$ counts rolls that are 1 or 2: binomial with $p=\\frac2{${k}}$, variance $${V2.tex()}$.` };
    }
    const n = R.int(3, 12), pij = fr(1, n * (n - 1)), cij = pij.sub(fr(1, n * n));
    return { _mc: { sample: (h) => { const pm = h.perm(n), I = pm.map((v, i) => +(v === i)); return { X: I.reduce((a2, b2) => a2 + b2, 0), I1: I[0], I2: I[1], I12: I[0] * I[1] }; },
        parts: [["mean", "X"], ["mean", "I12"], ["cov", "I1", "I2"], ["var", "X"]] },
      title: "Indicators: the hat problem", statement: `**Hats.** $n=${n}$ people throw their hats in a box, and each picks a hat uniformly at random (a random permutation). $X$ is the number of people who get their own hat.`, grids: [],
      parts: [{ q: "$E[X]$", answer: "1" }, { q: "$P(\\text{persons 1 and 2 both get their own hat})$", answer: S(pij) }, { q: "$\\operatorname{cov}(I_1,I_2)$", answer: S(cij) }, { q: "$\\operatorname{Var}(X)$", answer: "1" }],
      solution: `$X=\\sum_i I_i$, $E[I_i]=\\frac1n$, so $E[X]=1$.

- $P(I_1=I_2=1)=\\frac1n\\cdot\\frac1{n-1}=${pij.tex()}$.
- $\\operatorname{cov}(I_1,I_2)=\\frac1{n(n-1)}-\\frac1{n^2}=${cij.tex()}$ (positive).
- $\\operatorname{Var}X=n\\cdot\\frac1n(1-\\frac1n)+n(n-1)\\cdot\\frac1{n^2(n-1)}=1-\\frac1n+\\frac1n=1$.` };
  }

  // ---------------------------------------------------------------- 7. joint PDF with polynomial density
  // A density is a list of terms [coef, a, b] meaning coef * x^a * y^b, on the unit square (sq) or
  // the triangle 0 <= y <= x <= 1 (tri).
  const PDFS = [
    { reg: "sq", t: [[1, 1, 0], [1, 0, 1]], tex: "x+y" }, { reg: "sq", t: [[1, 1, 1]], tex: "xy" }, { reg: "sq", t: [[1, 2, 0], [1, 0, 1]], tex: "x^2+y" },
    { reg: "sq", t: [[1, 1, 0]], tex: "x" }, { reg: "sq", t: [[2, 0, 0], [1, 1, 1]], tex: "2+xy" }, { reg: "sq", t: [[1, 0, 0], [1, 1, 0], [1, 0, 1]], tex: "1+x+y" },
    { reg: "tri", t: [[1, 0, 0]], tex: "1" }, { reg: "tri", t: [[1, 1, 0]], tex: "x" }, { reg: "tri", t: [[1, 0, 1]], tex: "y" },
    { reg: "tri", t: [[1, 1, 1]], tex: "xy" }, { reg: "tri", t: [[1, 1, 0], [1, 0, 1]], tex: "x+y" },
  ];
  function jointpdf(R) {
    const D = R.pick(PDFS), tri = D.reg === "tri";
    const mono = (a, b) => (tri ? fr(1, (b + 1) * (a + b + 2)) : fr(1, (a + 1) * (b + 1)));
    const integ = (da, db) => sum(D.t.map(([c, a, b]) => mono(a + da, b + db).mul(c)));
    const c = fr(1).div(integ(0, 0));
    const EX = c.mul(integ(1, 0)), EY = c.mul(integ(0, 1)), EXY = c.mul(integ(1, 1)), COV = EXY.sub(EX.mul(EY));
    const y0 = fr(1, 2), lo = tri ? y0 : fr(0);
    const sliceInt = (da) => sum(D.t.map(([k, a, b]) => fr(k).mul(y0.pow(b)).mul(fr(1).sub(lo.pow(a + da + 1))).div(a + da + 1)));
    const fY = c.mul(sliceInt(0)), EXg = sliceInt(1).div(sliceInt(0));
    const indep = !tri && D.t.length === 1;
    const fmax = D.t.reduce((a2, [k2]) => a2 + k2, 0); // each term is at most its coefficient on [0,1]^2
    return {
      _mc: { sample: (h) => { for (;;) { const x = h.u(), y = h.u(); if (tri && y > x) continue; const f = D.t.reduce((a2, [k2, a, b]) => a2 + k2 * x ** a * y ** b, 0); if (h.u() * fmax <= f) return { X: x, Y: y }; } },
        parts: [null, ["mean", "X"], ["mean", "Y"], ["cov", "X", "Y"], null, null, null] },
      _dens: { tri, f: (x, y) => D.t.reduce((a2, [k2, a, b]) => a2 + k2 * x ** a * y ** b, 0) }, // unnormalized, for the numeric check
      title: "Joint PDF: marginals, covariance, conditioning",
      statement: `**Joint PDF.** $X$ and $Y$ have the joint PDF $f_{X,Y}(x,y)=c\\,(${D.tex})$ for ${tri ? "$0\\le y\\le x\\le1$" : "$0\\le x\\le1,\\ 0\\le y\\le1$"}, and 0 otherwise.`,
      grids: [],
      parts: [
        { q: "$c$", answer: S(c) }, { q: "$E[X]$", answer: S(EX) }, { q: "$E[Y]$", answer: S(EY) }, { q: "$\\operatorname{cov}(X,Y)$", answer: S(COV) },
        { q: "$f_Y(1/2)$", answer: S(fY) }, { q: "$E[X\\mid Y=1/2]$", answer: S(EXg) }, { q: "Are $X$ and $Y$ independent?", accept: yesNo(indep) },
      ],
      solution: `${tri ? "On the triangle, $\\int_0^1\\!\\int_0^x x^ay^b\\,dy\\,dx=\\frac{1}{(b+1)(a+b+2)}$." : "On the square, $\\int_0^1\\!\\int_0^1 x^ay^b\\,dx\\,dy=\\frac1{(a+1)(b+1)}$."}

- Normalize: $\\iint (${D.tex}) = ${integ(0, 0).tex()}$, so $c=${c.tex()}$.
- $E[X]=c\\iint x(${D.tex})=${EX.tex()}$, $E[Y]=${EY.tex()}$, $E[XY]=${EXY.tex()}$, so $\\operatorname{cov}=${EXY.tex()}-${EX.tex()}\\cdot${EY.tex()}=${COV.tex()}$.
- $f_Y(\\tfrac12)=\\int f_{X,Y}(x,\\tfrac12)\\,dx$ over ${tri ? "$x\\in[\\frac12,1]$ (the slice of the triangle)" : "$x\\in[0,1]$"}: $${fY.tex()}$.
- $f_{X\\mid Y}(x\\mid\\tfrac12)$ is the slice divided by $f_Y(\\frac12)$, so $E[X\\mid Y=\\tfrac12]=\\dfrac{\\int x\\,f(x,\\frac12)dx}{\\int f(x,\\frac12)dx}=${EXg.tex()}$.
- ${tri ? "The support is a triangle, not a product set, so they are **dependent**." : indep ? "The density factors as $g(x)h(y)$ on a square: **independent** (and cov = 0)." : "The density does not factor as $g(x)h(y)$: **dependent**."}`,
    };
  }

  // ---------------------------------------------------------------- 8. conditioning on an event
  function condevent(R) {
    const kind = R.pick(["unif", "exp", "lin"]);
    if (kind === "unif") {
      const a = R.int(0, 4), b = a + R.pick([4, 6, 8, 12]), s = a + R.int(1, (b - a) / 2 - 1), t = R.int(s + 1, b);
      const PA = fr(t - s, b - a), m = fr(s + t, 2), v = fr((t - s) ** 2, 12);
      return { _mc: { sample: (h) => { const x = h.unif(a, b); return { X: x, A: +(x >= s && x <= t) }; }, parts: [["mean", "A"], null, ["cmean", "X", "A"], ["cvar", "X", "A"]] },
        title: "Conditioning a uniform on an event", statement: `**Conditioning on an event.** $X$ is uniform on $[${a},${b}]$ and $A=\\{${s}\\le X\\le ${t}\\}$.`, grids: [],
        parts: [{ q: "$P(A)$", answer: S(PA) }, { q: "$f_{X\\mid A}(x)$ for $x\\in A$", answer: S(fr(1, t - s)) }, { q: "$E[X\\mid A]$", answer: S(m) }, { q: "$\\operatorname{Var}(X\\mid A)$", answer: S(v) }],
        solution: `$f_{X\\mid A}(x)=\\frac{f_X(x)}{P(A)}=\\frac{1/${b - a}}{${PA.tex()}}=\\frac1{${t - s}}$ on $[${s},${t}]$: uniform again. So $E[X\\mid A]=${m.tex()}$ and $\\operatorname{Var}(X\\mid A)=\\frac{${t - s}^2}{12}=${v.tex()}$.` };
    }
    if (kind === "exp") {
      const l = R.pick([1, 2]), t = R.int(1, l === 1 ? 3 : 2); // keeps P(A) = e^(-lt) >= e^(-4)
      return { _mc: { sample: (h) => { const x = h.exp(l); return { X: x, A: +(x > t), B: +(x > t + 1) }; }, parts: [["mean", "A"], ["cmean", "X", "A"], ["cvar", "X", "A"], ["cmean", "B", "A"]] },
        title: "Memorylessness", statement: `**Conditioning an exponential.** $X$ is exponential with rate $\\lambda=${l}$, and $A=\\{X>${t}\\}$.`, grids: [],
        parts: [{ q: "$P(A)$", answer: `exp(-${l * t})` }, { q: "$E[X\\mid A]$", answer: S(fr(t).add(fr(1, l))) }, { q: "$\\operatorname{Var}(X\\mid A)$", answer: S(fr(1, l * l)) }, { q: `$P(X>${t + 1}\\mid A)$`, answer: `exp(-${l})` }],
        solution: `$P(X>${t})=e^{-${l}\\cdot${t}}=e^{-${l * t}}$. Given $X>${t}$, $X-${t}$ is again exponential with rate ${l} (memoryless). So $E[X\\mid A]=${t}+\\frac1{${l}}$, $\\operatorname{Var}(X\\mid A)=\\frac1{${l * l}}$, and $P(X>${t + 1}\\mid A)=P(X>1)=e^{-${l}}$.` };
    }
    const s = R.pick([fr(1, 4), fr(1, 2), fr(1, 3)]);
    const PA = fr(1).sub(s.pow(2)), E1 = fr(2, 3).mul(fr(1).sub(s.pow(3))).div(PA), E2 = fr(1, 2).mul(fr(1).sub(s.pow(4))).div(PA);
    return { _mc: { sample: (h) => { const x = Math.sqrt(h.u()); return { X: x, X2: x * x, A: +(x > s.val()) }; }, parts: [["mean", "A"], ["cmean", "X", "A"], ["cmean", "X2", "A"], ["cvar", "X", "A"]] },
      title: "Conditioning a non-uniform PDF", statement: `**Conditioning on an event.** $X$ has PDF $f_X(x)=2x$ on $[0,1]$, and $A=\\{X>${s.tex()}\\}$.`, grids: [],
      parts: [{ q: "$P(A)$", answer: S(PA) }, { q: "$E[X\\mid A]$", answer: S(E1) }, { q: "$E[X^2\\mid A]$", answer: S(E2) }, { q: "$\\operatorname{Var}(X\\mid A)$", answer: S(E2.sub(E1.mul(E1))) }],
      solution: `$P(A)=\\int_{${s.tex()}}^1 2x\\,dx=1-(${s.tex()})^2=${PA.tex()}$, and $f_{X\\mid A}(x)=\\frac{2x}{P(A)}$ on $(${s.tex()},1]$.

- $E[X\\mid A]=\\frac1{P(A)}\\int 2x^2dx=\\frac{\\frac23(1-s^3)}{P(A)}=${E1.tex()}$.
- $E[X^2\\mid A]=\\frac{\\frac12(1-s^4)}{P(A)}=${E2.tex()}$, so $\\operatorname{Var}(X\\mid A)=${E2.sub(E1.mul(E1)).tex()}$.` };
  }

  // ---------------------------------------------------------------- 9. derived distributions
  function derived(R) {
    const kind = R.pick(["square", "linexp", "max", "min", "recip"]);
    if (kind === "square") {
      const [c, d] = R.pick([[-1, 2], [-2, 1], [-1, 3], [-3, 1], [-2, 4]]), L = d - c, m = Math.min(-c, d), M = Math.max(-c, d);
      const y1 = fr(m * m, 4), r2 = fr(m + M, 2), y2 = r2.mul(r2); // sqrt(y1)=m/2 in region 1, sqrt(y2)=r2 in region 2
      const F1 = fr(m, L), f1 = fr(1, L).div(fr(m, 2)), F2 = r2.add(m).div(L), f2 = fr(1, 2 * L).div(r2);
      return { _mc: { sample: (h) => { const y = h.unif(c, d) ** 2; return { A: +(y <= y1.val()), B: +(y <= y2.val()) }; }, parts: [["mean", "A"], null, ["mean", "B"], null] },
        title: "Derived distribution: Y = X²", statement: `**Derived distribution.** $X$ is uniform on $[${c},${d}]$ and $Y=X^2$ (so $Y\\in[0,${M * M}]$).`, grids: [],
        parts: [{ q: `$F_Y(${y1.tex()})$`, answer: S(F1) }, { q: `$f_Y(${y1.tex()})$`, answer: S(f1) }, { q: `$F_Y(${y2.tex()})$`, answer: S(F2) }, { q: `$f_Y(${y2.tex()})$`, answer: S(f2) }],
        solution: `$F_Y(y)=P(-\\sqrt y\\le X\\le\\sqrt y)$. Two cases:

- $0\\le y\\le ${m * m}$: both $\\pm\\sqrt y$ are in $[${c},${d}]$, so $F_Y(y)=\\frac{2\\sqrt y}{${L}}$ and $f_Y(y)=\\frac{1}{${L}\\sqrt y}$. At $y=${y1.tex()}$: $F=${F1.tex()}$, $f=${f1.tex()}$.
- $${m * m}<y\\le${M * M}$: the side at ${-c < d ? c : d} is cut off, so $F_Y(y)=\\frac{\\sqrt y+${m}}{${L}}$ and $f_Y(y)=\\frac{1}{2\\cdot${L}\\sqrt y}$. At $y=${y2.tex()}$: $F=${F2.tex()}$, $f=${f2.tex()}$.` };
    }
    if (kind === "linexp") {
      const l = R.pick([1, 2, 3]), a = R.int(2, 4), b = R.int(1, 5), y0 = b + a * R.int(1, 3), y1 = b + a * R.int(1, 2);
      return { _mc: { sample: (h) => { const y = a * h.exp(l) + b; return { Y: y, A: +(y > y1) }; }, parts: [null, ["mean", "A"], ["mean", "Y"], ["var", "Y"]] },
        title: "Derived distribution: linear function", statement: `**Linear function.** $X$ is exponential with rate $${l}$ and $Y=${a}X+${b}$.`, grids: [],
        parts: [{ q: `$f_Y(${y0})$`, answer: `${l}/${a}*exp(-${l}*(${y0}-${b})/${a})` }, { q: `$P(Y>${y1})$`, answer: `exp(-${l}*(${y1}-${b})/${a})` }, { q: "$E[Y]$", answer: S(fr(a, l).add(b)) }, { q: "$\\operatorname{Var}(Y)$", answer: S(fr(a * a, l * l)) }],
        solution: `$f_Y(y)=\\frac1{|a|}f_X\\!\\left(\\frac{y-b}{a}\\right)=\\frac{${l}}{${a}}e^{-${l}(y-${b})/${a}}$ for $y\\ge${b}$. $P(Y>y)=P(X>\\frac{y-${b}}{${a}})=e^{-${l}(y-${b})/${a}}$. $E[Y]=${a}\\cdot\\frac1{${l}}+${b}$, $\\operatorname{Var}Y=${a * a}\\cdot\\frac1{${l * l}}$.` };
    }
    if (kind === "max") {
      const n = R.int(2, 5), th = R.int(1, 4), y = fr(th, 2);
      return { _mc: { sample: (h) => { let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, h.unif(0, th)); return { M: m, A: +(m <= th / 2) }; }, parts: [["mean", "A"], null, ["mean", "M"]] },
        title: "Derived distribution: maximum", statement: `**Maximum.** $X_1,\\dots,X_{${n}}$ are i.i.d. uniform on $[0,${th}]$ and $M=\\max_i X_i$.`, grids: [],
        parts: [{ q: `$F_M(${y.tex()})$`, answer: S(fr(1, 2).pow(n)) }, { q: `$f_M(${y.tex()})$`, answer: S(fr(n, th).mul(fr(1, 2).pow(n - 1))) }, { q: "$E[M]$", answer: S(fr(n * th, n + 1)) }],
        solution: `$F_M(m)=P(\\text{all }X_i\\le m)=(m/${th})^{${n}}$, so $F_M(${y.tex()})=(\\frac12)^{${n}}$ and $f_M(m)=\\frac{${n}m^{${n - 1}}}{${th}^{${n}}}$, giving $f_M(${y.tex()})=${fr(n, th).mul(fr(1, 2).pow(n - 1)).tex()}$. $E[M]=\\int_0^{${th}}(1-F_M)\\,dm=\\frac{${n}}{${n + 1}}\\cdot${th}$.` };
    }
    if (kind === "min") {
      const ls = [R.int(1, 2), R.int(1, 2), R.int(1, 3)], L = ls[0] + ls[1] + ls[2], t = 1;
      return { _mc: { sample: (h) => { const x = ls.map((l) => h.exp(l)), m = Math.min(...x); return { T: m, A: +(m > t), F: +(x[0] === m) }; }, parts: [["mean", "A"], ["mean", "T"], ["mean", "F"]] },
        title: "Derived distribution: minimum of exponentials", statement: `**First failure.** Three independent parts fail at exponential times with rates $${ls.join(",\\ ")}$. $T$ is the time of the first failure.`, grids: [],
        parts: [{ q: `$P(T>${t})$`, answer: `exp(-${L * t})` }, { q: "$E[T]$", answer: S(fr(1, L)) }, { q: "$P(\\text{part 1 fails first})$", answer: S(fr(ls[0], L)) }],
        solution: `$P(T>t)=\\prod_i P(X_i>t)=e^{-(${ls.join("+")})t}=e^{-${L}t}$: $T$ is exponential with rate ${L}. $E[T]=\\frac1{${L}}$. $P(X_1$ is smallest$)=\\frac{\\lambda_1}{\\sum\\lambda_i}=${fr(ls[0], L).tex()}$.` };
    }
    const y0 = R.int(2, 6), y1 = R.int(2, 5);
    return { _mc: { sample: (h) => { const y = 1 / (1 - h.u()); return { A: +(y > y1), M: Math.min(y, 2) }; }, parts: [["mean", "A"], null, ["mean", "M"]] },
      title: "Derived distribution: Y = 1/X", statement: `**Reciprocal.** $X$ is uniform on $[0,1]$ and $Y=1/X$ (so $Y\\ge1$).`, grids: [],
      parts: [{ q: `$P(Y>${y1})$`, answer: S(fr(1, y1)) }, { q: `$f_Y(${y0})$`, answer: S(fr(1, y0 * y0)) }, { q: "$E[\\min(Y,2)]$", answer: "1+ln(2)" }],
      solution: `$P(Y>y)=P(X<1/y)=1/y$ for $y\\ge1$, so $f_Y(y)=1/y^2$ and $f_Y(${y0})=\\frac1{${y0 * y0}}$. ($E[Y]=\\int_1^\\infty y\\cdot y^{-2}dy=\\infty$.) $E[\\min(Y,2)]=\\int_0^2 P(\\min(Y,2)>u)\\,du=1+\\int_1^2\\frac{du}u=1+\\ln 2$.` };
  }

  // ---------------------------------------------------------------- 10. convolution
  function convolution(R) {
    const kind = R.pick(["disc", "disc", "unif", "exp"]);
    if (kind === "disc") {
      const xs = [0, 1, 2], ys = R.pick([[0, 1], [0, 1, 2], [1, 2]]);
      const wx = xs.map(() => R.int(1, 3)), wy = ys.map(() => R.int(1, 3)), Wx = wx.reduce((a, b) => a + b), Wy = wy.reduce((a, b) => a + b);
      const zs = []; for (let z = xs[0] + ys[0]; z <= xs[2] + ys[ys.length - 1]; z++) zs.push(z);
      const pz = zs.map((z) => sum(xs.map((x, i) => { const j = ys.indexOf(z - x); return j < 0 ? fr(0) : fr(wx[i], Wx).mul(fr(wy[j], Wy)); })));
      const draw = (h, vals, ws, W) => { let r = h.u() * W, i = 0; while (r >= ws[i]) { r -= ws[i]; i++; } return vals[i]; };
      return { _mc: { sample: (h) => { const z = draw(h, xs, wx, Wx) + draw(h, ys, wy, Wy), o = {}; zs.forEach((v) => { o["z" + v] = +(z === v); }); return o; }, parts: zs.map((v) => ["mean", "z" + v]) },
        title: "Convolution of PMFs", statement: `**Sum of independent discrete RVs.** $X$ and $Y$ are independent. $p_X(0),p_X(1),p_X(2)=${wx.map((v) => fr(v, Wx).tex()).join(",\\ ")}$ and $p_Y$ is $${wy.map((v) => fr(v, Wy).tex()).join(",\\ ")}$ on $y=${ys.join(",")}$. Find the PMF of $Z=X+Y$.`, grids: [],
        parts: zs.map((z, k) => ({ q: `$p_Z(${z})$`, answer: S(pz[k]) })),
        solution: `$p_Z(z)=\\sum_x p_X(x)p_Y(z-x)$ (flip $p_Y$, shift by $z$, multiply, add).\n\n${zs.map((z, k) => `- $p_Z(${z})=${pz[k].tex()}$`).join("\n")}\n\nCheck: the values add to 1.` };
    }
    if (kind === "unif") {
      const a = R.int(1, 2), b = a + R.int(1, 3), z1 = fr(a, 2), z2 = fr(a + b, 2), z3 = fr(2 * b + a, 2);
      const f = (z) => (z.val() <= a ? z.div(a * b) : z.val() <= b ? fr(1, b) : fr(a + b).sub(z).div(a * b));
      return { title: "Convolution of uniform PDFs", statement: `**Sum of independent uniforms.** $X$ is uniform on $[0,${a}]$, $Y$ is uniform on $[0,${b}]$, independent. $Z=X+Y$.`, grids: [],
        parts: [z1, z2, z3].map((z) => ({ q: `$f_Z(${z.tex()})$`, answer: S(f(z)) })),
        solution: `$f_Z(z)=\\int f_X(x)f_Y(z-x)dx=\\frac{1}{${a * b}}\\cdot(\\text{length of }\\{x\\in[0,${a}]: z-x\\in[0,${b}]\\})$. The PDF is a ${a === b ? "triangle" : "trapezoid"}: $\\frac{z}{${a * b}}$ on $[0,${a}]$, $\\frac1{${b}}$ on $[${a},${b}]$, $\\frac{${a + b}-z}{${a * b}}$ on $[${b},${a + b}]$.` };
    }
    const l = R.int(1, 3), z0 = R.int(1, 3);
    return { _mc: { sample: (h) => ({ Z: h.exp(l) + h.exp(l) }), parts: [null, ["mean", "Z"], ["var", "Z"]] },
      title: "Convolution of exponentials", statement: `**Sum of independent exponentials.** $X,Y$ are i.i.d. exponential with rate $${l}$ and $Z=X+Y$.`, grids: [],
      parts: [{ q: `$f_Z(${z0})$`, answer: `${l * l}*${z0}*exp(-${l * z0})` }, { q: "$E[Z]$", answer: S(fr(2, l)) }, { q: "$\\operatorname{Var}(Z)$", answer: S(fr(2, l * l)) }],
      solution: `$f_Z(z)=\\int_0^z \\lambda e^{-\\lambda x}\\lambda e^{-\\lambda(z-x)}dx=\\lambda^2 z e^{-\\lambda z}$ for $z\\ge0$ (limits: both $x\\ge0$ and $z-x\\ge0$). At $z=${z0}$: $${l * l}\\cdot${z0}\\,e^{-${l * z0}}$. Means and variances add: $E Z=\\frac2{${l}}$, $\\operatorname{Var}Z=\\frac2{${l * l}}$.` };
  }

  // ---------------------------------------------------------------- 11. continuous and mixed Bayes
  function bayes(R) {
    const kind = R.pick(["beta", "mixexp", "stick"]);
    if (kind === "beta") {
      const n = R.int(2, 8), k = R.int(0, n), q0 = R.pick([fr(1, 2), fr(1, 3), fr(1, 4)]);
      const dens = fr(n + 1).mul(C(n, k)).mul(q0.pow(k)).mul(fr(1).sub(q0).pow(n - k));
      // Sample (Q, K); keep the runs with K = k. Q given K = k has the posterior.
      return { _mc: { sample: (h) => { const q = h.u(); let kk = 0; for (let i = 0; i < n; i++) kk += h.u() < q; return { Q: q, K: +(kk === k), H: +(h.u() < q) }; }, parts: [null, ["cmean", "Q", "K"], null, ["cmean", "H", "K"]] },
        title: "Bayes: unknown coin bias", statement: `**Continuous prior, discrete data.** The bias $Q$ of a coin is uniform on $[0,1]$. We toss it $n=${n}$ times and see $k=${k}$ heads.`, grids: [],
        parts: [{ q: `$f_{Q\\mid K}(${q0.tex()}\\mid ${k})$`, answer: S(dens) }, { q: "$E[Q\\mid K=" + k + "]$", answer: S(fr(k + 1, n + 2)) }, { q: "The $q$ that maximizes the posterior", answer: S(fr(k, n)) }, { q: "$P(\\text{next toss is heads}\\mid K=" + k + ")$", answer: S(fr(k + 1, n + 2)) }],
        solution: `$f_{Q\\mid K}(q\\mid k)=\\dfrac{f_Q(q)\\,p_{K\\mid Q}(k\\mid q)}{p_K(k)}\\propto q^{${k}}(1-q)^{${n - k}}$ on $[0,1]$. Since $\\int_0^1 q^k(1-q)^{n-k}dq=\\frac{k!(n-k)!}{(n+1)!}$, the posterior is $(n+1)\\binom nk q^k(1-q)^{n-k}$; at $q=${q0.tex()}$ it is $${dens.tex()}$.

- Posterior mean: $\\frac{k+1}{n+2}=${fr(k + 1, n + 2).tex()}$. The maximum is at $q=\\frac kn=${fr(k, n).tex()}$.
- $P(\\text{heads next}\\mid K)=E[Q\\mid K]=${fr(k + 1, n + 2).tex()}$.` };
    }
    if (kind === "mixexp") {
      const l1 = R.int(1, 2), l2 = l1 + R.int(1, 2), p = R.pick([fr(1, 2), fr(1, 3), fr(2, 3)]), y = R.int(1, 2);
      const P = p.toString(), Q = fr(1).sub(p).toString();
      return { _mc: { sample: (h) => { const A = h.u() < p.val(), yv = h.exp(A ? l1 : l2); return { A: +A, G: +(yv > y), N: +(Math.abs(yv - y) < 0.02) }; }, parts: [null, ["cmean", "A", "N"], ["cmean", "A", "G"]] },
        title: "Bayes: discrete type, continuous observation", statement: `**Mixed Bayes.** A component is type A with probability $${p.tex()}$ and type B otherwise. Its lifetime $Y$ is exponential with rate $${l1}$ for type A and rate $${l2}$ for type B.`, grids: [],
        parts: [
          { q: `$f_Y(${y})$`, answer: `${P}*${l1}*exp(-${l1 * y})+${Q}*${l2}*exp(-${l2 * y})` },
          { q: `$P(\\text{A}\\mid Y=${y})$`, answer: `${P}*${l1}*exp(-${l1 * y})/(${P}*${l1}*exp(-${l1 * y})+${Q}*${l2}*exp(-${l2 * y}))` },
          { q: `$P(\\text{A}\\mid Y>${y})$`, answer: `${P}*exp(-${l1 * y})/(${P}*exp(-${l1 * y})+${Q}*exp(-${l2 * y}))` },
        ],
        solution: `Total probability: $f_Y(y)=${p.tex()}\\cdot${l1}e^{-${l1}y}+${fr(1).sub(p).tex()}\\cdot${l2}e^{-${l2}y}$.

- Observing the value $Y=${y}$ uses densities: $P(A\\mid Y=${y})=\\dfrac{${p.tex()}\\cdot${l1}e^{-${l1 * y}}}{f_Y(${y})}$.
- Observing the event $Y>${y}$ uses probabilities $P(Y>y\\mid\\cdot)=e^{-\\lambda y}$: $P(A\\mid Y>${y})=\\dfrac{${p.tex()}e^{-${l1 * y}}}{${p.tex()}e^{-${l1 * y}}+${fr(1).sub(p).tex()}e^{-${l2 * y}}}$. Type A lasts longer, so a long life makes A more likely.` };
    }
    const y0 = R.pick([fr(1, 2), fr(1, 4), fr(1, 3)]), x0 = R.pick([fr(2, 3), fr(3, 4)]);
    const yy = y0.toString(), xx = x0.toString();
    return { _mc: { sample: (h) => { const x = h.u(), yv = x * h.u(); return { X: x, Y: yv, N: +(Math.abs(yv - y0.val()) < 0.005) }; }, parts: [null, null, ["cmean", "X", "N"], ["mean", "Y"]] },
      title: "Bayes: breaking a stick", statement: `**Continuous Bayes.** $X$ is uniform on $[0,1]$. Given $X=x$, $Y$ is uniform on $[0,x]$. We observe $Y=${y0.tex()}$.`, grids: [],
      parts: [{ q: `$f_Y(${y0.tex()})$`, answer: `-ln(${yy})` }, { q: `$f_{X\\mid Y}(${x0.tex()}\\mid ${y0.tex()})$`, answer: `1/(${xx}*(-ln(${yy})))` }, { q: `$E[X\\mid Y=${y0.tex()}]$`, answer: `(1-${yy})/(-ln(${yy}))` }, { q: "$E[Y]$", answer: "1/4" }],
      solution: `$f_{X,Y}(x,y)=\\frac1x$ for $0\\le y\\le x\\le1$. $f_Y(y)=\\int_y^1\\frac{dx}x=-\\ln y$, so $f_Y(${y0.tex()})=\\ln ${fr(1).div(y0).tex()}$.

- $f_{X\\mid Y}(x\\mid y)=\\dfrac{1/x}{-\\ln y}$ for $y\\le x\\le1$.
- $E[X\\mid Y=y]=\\dfrac{\\int_y^1 x\\cdot\\frac1x dx}{-\\ln y}=\\dfrac{1-y}{-\\ln y}$.
- $E[Y]=E[E[Y\\mid X]]=E[X/2]=\\frac14$.` };
  }
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

  // ---------------------------------------------------------------- 12. true / false facts
  const FACTS = [
    ["If cov(X, Y) = 0, then X and Y are independent.", false, "Uncorrelated does not imply independent: $X\\sim U[-1,1]$, $Y=X^2$."],
    ["If X and Y are independent, then cov(X, Y) = 0.", true, "$E[XY]=E[X]E[Y]$."],
    ["E[X | Y] is a random variable.", true, "It is a function of $Y$."],
    ["E[X | Y = y] is a random variable.", false, "It is a number for each $y$."],
    ["Var(X + Y) = Var(X) + Var(Y) needs X and Y to be independent.", false, "Uncorrelated is enough."],
    ["Var(X − Y) = Var(X) − Var(Y) for independent X, Y.", false, "Variances add: $\\operatorname{Var}(X-Y)=\\operatorname{Var}X+\\operatorname{Var}Y$."],
    ["E[E[X | Y]] = E[X].", true, "Law of iterated expectations."],
    ["Var(X) ≥ E[Var(X | Y)].", true, "Total variance adds the nonnegative term $\\operatorname{Var}(E[X\\mid Y])$."],
    ["Var(X) ≥ Var(E[X | Y]).", true, "Total variance."],
    ["A PDF value can be larger than 1.", true, "Only the area must be 1 (for example U[0, 1/2] has density 2)."],
    ["If the joint PDF is positive only on a triangle, X and Y can be independent.", false, "Independence needs the support to be a product set (a rectangle)."],
    ["ρ(2X + 3, −Y) = −ρ(X, Y).", true, "$\\rho(aX+b,cY+d)=\\operatorname{sign}(ac)\\rho$."],
    ["cov(X, X) = Var(X).", true, "By the definition."],
    ["If |ρ(X, Y)| = 1, then Y is a linear function of X (with probability 1).", true, "$Y-EY=c(X-EX)$."],
    ["The sum of two independent uniform random variables is uniform.", false, "The PDF is a triangle or a trapezoid."],
    ["The sum of two independent normal random variables is normal.", true, "Means add and variances add."],
    ["For a random sum, Var(Y) = E[N]·Var(X).", false, "Add $(E[X])^2\\operatorname{Var}(N)$."],
    ["E[g(Y)·X | Y] = g(Y)·E[X | Y].", true, "Given $Y$, $g(Y)$ is a constant."],
    ["If X and Y are independent, then E[X | Y] = E[X].", true, "Knowing $Y$ tells nothing about $X$."],
    ["For a continuous random variable X, P(X = a) = 0 for every a.", true, "A single point has no length."],
    ["The minimum of independent exponentials is exponential.", true, "The rate is the sum of the rates."],
    ["cov(aX + b, Y) = a·cov(X, Y) + b.", false, "Constants drop out: $a\\operatorname{cov}(X,Y)$."],
  ];
  function facts(R) {
    const qs = R.shuffle(FACTS).slice(0, 8);
    return { title: "True or false", statement: "**True or false.** Answer each with true or false.", grids: [],
      parts: qs.map(([q, a]) => ({ q, accept: a ? ["true", "t", "yes"] : ["false", "f", "no"] })),
      solution: qs.map(([q, a, why]) => `- ${q} **${a ? "True" : "False"}.** ${why}`).join("\n") };
  }

  // ---------------------------------------------------------------- registry
  const DRILLS = {
    p_lincomb: { name: "Linear combinations", blurb: "Var(aX + bY + c), E[XY], cov of combinations, and ρ under scaling, from means, variances, and ρ.", gen: lincomb },
    p_jointpmf: { name: "Joint PMF tables", blurb: "Covariance, Var(X + Y), E[X | Y = y], Var(X | Y = y), both terms of total variance, and independence from a table.", gen: jointpmf },
    p_totalvar: { name: "Law of total variance", blurb: "Mixtures: X depends on a random group Y (uniform, exponential, Poisson, binomial, normal groups).", gen: totalvar },
    p_randsum: { name: "Random sums", blurb: "Y = X₁ + … + X_N: E[Y], Var(Y), and cov(N, Y) for many N and X distributions.", gen: randsum },
    p_hierarchy: { name: "Random parameters", blurb: "Coin with a random bias and Poisson with a random rate: E, Var, and the covariance between tosses.", gen: hierarchy },
    p_indicators: { name: "Indicator variances", blurb: "Variance of counts with covariances of indicators: empty boxes, overlapping pairs, multinomial counts, hats.", gen: indicators },
    p_jointpdf: { name: "Joint PDFs", blurb: "Normalize, means, covariance, a marginal value, a conditional mean, and independence for polynomial densities.", gen: jointpdf },
    p_condevent: { name: "Conditioning on an event", blurb: "f(x | A), E[X | A], and Var(X | A) for uniform, exponential (memoryless), and linear PDFs.", gen: condevent },
    p_derived: { name: "Derived distributions", blurb: "CDF method for Y = X², linear functions, max, min of exponentials, and Y = 1/X.", gen: derived },
    p_convolution: { name: "Convolution", blurb: "PMF of a sum of discrete RVs, sums of uniforms (triangle and trapezoid), sums of exponentials.", gen: convolution },
    p_bayes: { name: "Continuous and mixed Bayes", blurb: "Uniform prior on a coin bias, discrete type with an exponential observation, and the stick example.", gen: bayes },
    p_facts: { name: "True or false", blurb: "Quick checks on independence, correlation, conditional expectation, and total variance.", gen: facts },
  };
  function generate(type, seed) { return Object.assign({ type, seed }, DRILLS[type].gen(rng(seed))); }
  const intro = "Each drill makes a new problem from a random seed, for 6.3700 Quiz 2 (L8–L13: continuous random variables, derived distributions, covariance, conditional expectation and variance). The answers are computed with exact fractions. You can type fractions and expressions such as 7/48, exp(-2), ln(2), and sqrt(3). The link of a drill keeps its seed, so you can come back to the same problem.";

  root.Drills6370 = { DRILLS, generate, rng, Fr, intro };
})(typeof window !== "undefined" ? window : globalThis);
