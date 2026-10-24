// Small, safe math-expression evaluator for answer checking.
// Supports: numbers, + - * / ^, parentheses, implicit multiplication,
// percent, factorial (!), constants (pi, e), and functions
// sqrt, cbrt, ln, log, log10, log2, exp, abs, sin, cos, tan, C/choose/binom.
(function (root) {
  const FUNCS = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, ln: Math.log, log: Math.log,
    log10: Math.log10, log2: Math.log2, exp: Math.exp, abs: Math.abs,
    sin: Math.sin, cos: Math.cos, tan: Math.tan, arcsin: Math.asin, asin: Math.asin,
    arccos: Math.acos, acos: Math.acos, arctan: Math.atan, atan: Math.atan,
    C: choose, choose: choose, binom: choose, nCr: choose,
  };
  const CONSTS = { pi: Math.PI, e: Math.E, π: Math.PI };

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0) throw new Error("factorial needs a non-negative integer");
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function choose(n, k) {
    if (!Number.isInteger(n) || !Number.isInteger(k)) throw new Error("C(n,k) needs integers");
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return Math.round(r);
  }

  function tokenize(src) {
    const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
      .replace(/\*\*/g, "^").replace(/√/g, "sqrt");
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (num) {
        // Avoid eating the constant "e" as an exponent marker ("2e" = 2*e).
        let text = num[0];
        if (num[2] === undefined) text = num[1];
        toks.push({ t: "num", v: parseFloat(text) });
        i += text.length;
        continue;
      }
      const id = /^([A-Za-z_]+|π)/.exec(s.slice(i));
      if (id) { toks.push({ t: "id", v: id[0] }); i += id[0].length; continue; }
      if ("+-*/^()!,%".includes(c)) { toks.push({ t: c }); i++; continue; }
      throw new Error(`Unexpected character "${c}"`);
    }
    return toks;
  }

  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const eat = (t) => {
      if (!toks[p] || toks[p].t !== t) throw new Error(`Expected "${t}"`);
      return toks[p++];
    };
    const startsPrimary = (tk) => tk && (tk.t === "num" || tk.t === "id" || tk.t === "(");

    function expr() {
      let v = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) {
        const op = toks[p++].t;
        const r = term();
        v = op === "+" ? v + r : v - r;
      }
      return v;
    }
    function term() {
      let v = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) {
          p++;
          const r = unary();
          v = tk.t === "*" ? v * r : v / r;
        } else if (startsPrimary(tk)) {
          v = v * unary(); // implicit multiplication: 2pi, 3sqrt(2), (1/2)(1/3)
        } else break;
      }
      return v;
    }
    function unary() {
      if (peek() && peek().t === "-") { p++; return -unary(); }
      if (peek() && peek().t === "+") { p++; return unary(); }
      return power();
    }
    function power() {
      const b = postfix();
      if (peek() && peek().t === "^") { p++; return Math.pow(b, unary()); }
      return b;
    }
    function postfix() {
      let v = primary();
      for (;;) {
        if (peek() && peek().t === "!") { p++; v = factorial(v); }
        else if (peek() && peek().t === "%") { p++; v = v / 100; }
        else break;
      }
      return v;
    }
    function primary() {
      const tk = peek();
      if (!tk) throw new Error("Unexpected end of input");
      if (tk.t === "num") { p++; return tk.v; }
      if (tk.t === "(") { p++; const v = expr(); eat(")"); return v; }
      if (tk.t === "id") {
        p++;
        const name = tk.v;
        if (Object.prototype.hasOwnProperty.call(FUNCS, name) && peek() && peek().t === "(") {
          p++;
          const args = [expr()];
          while (peek() && peek().t === ",") { p++; args.push(expr()); }
          eat(")");
          return FUNCS[name](...args);
        }
        if (Object.prototype.hasOwnProperty.call(CONSTS, name)) return CONSTS[name];
        throw new Error(`Unknown name "${name}"`);
      }
      throw new Error(`Unexpected "${tk.t}"`);
    }

    if (!toks.length) throw new Error("Empty answer");
    const v = expr();
    if (p < toks.length) throw new Error(`Unexpected "${toks[p].t === "num" ? toks[p].v : toks[p].t}"`);
    return v;
  }

  function evaluate(src) {
    const v = parse(String(src));
    if (!Number.isFinite(v)) throw new Error("Result is not a finite number");
    return v;
  }

  // Returns "correct", "close" (within 1%), or "wrong".
  function compare(got, want) {
    const err = Math.abs(got - want);
    const scale = Math.max(Math.abs(want), 1e-12);
    if (err <= 5e-4 * scale + 1e-12) return "correct";
    if (err <= 1e-2 * scale) return "close";
    return "wrong";
  }

  root.Expr = { evaluate, compare, choose, factorial };
})(typeof window !== "undefined" ? window : globalThis);
