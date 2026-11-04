// Generated 6.191 drills. Each generator takes a seeded random source and returns a problem:
//   { title, statement, grids, parts, solution }
//   grids: [{ id, caption, rowLabels, colLabels, answer[r][c], given[r][c] (shown filled),
//             gray[r][c] (not graded), kind: "text" | "value", bypass: [sources per column] | null }]
//   parts: [{ q, answer, tol }] (numeric, checked with Expr) or [{ q, accept: [...] }] (text)
// The answers come from the simulators in js/sim-6191.js; the statement and solution use the
// problem-text markup (tables, @fig, code blocks).
(function (root) {
  const { parseProgram, window: pipeWindow, makeCache, STAGES } = root.Sim6191;
  const F = root.Fig;
  const hex = (v) => "0x" + (v >>> 0).toString(16).toUpperCase();
  let figSeq = 0;
  const fig = (markup) => { const k = `drill-${++figSeq}`; F.def(k, markup); return `@fig ${k}`; };

  // ---------------------------------------------------------------- random
  function rng(seed) {
    let a = seed >>> 0;
    const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const r = { next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), pick: (xs) => xs[Math.floor(next() * xs.length)],
      shuffle: (xs) => { const a2 = xs.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
      chance: (p) => next() < p };
    return r;
  }

  // ---------------------------------------------------------------- pipeline diagrams
  // Loops in the style of past quizzes. taken(si, k, prog) gives branch outcomes: the loop branch
  // is taken (the loop runs many times); other branches use a fixed outcome per problem.
  const LOOPS = [
    { name: "array sum", head: "loop", src: `
loop: lw a1, 0(a0)
      add a2, a2, a1
      addi a0, a0, 4
      addi a3, a3, -1
      bnez a3, loop
      mv a0, a2
      ret` },
    { name: "linked-list sum", head: "loop", src: `
loop: beqz a0, done
      lw a1, 0(a0)
      lw a0, 4(a0)
      add a2, a2, a1
      j loop
done: mv a0, a2
      ret`, other: false },
    { name: "Fibonacci with memory", head: "fib", src: `
fib:  lw a0, 0(t1)
      lw a1, 0(t2)
      add a2, a0, a1
      sw a1, 0(t1)
      sw a2, 0(t2)
      addi t0, t0, -1
      bnez t0, fib
      lw a0, 0(t2)
      xori a4, a2, 2` },
    { name: "running maximum", head: "loop", src: `
loop: lw a1, 0(t2)
      bge a0, a1, skip
      mv a0, a1
skip: addi t2, t2, 4
      addi t0, t0, -1
      bnez t0, loop
      sw a0, 0x100(x0)
      ret`, other: "random" },
    { name: "update and copy", head: "loop", src: `
loop: sh a5, 0(a1)
      lw a6, 0(a1)
      sw a6, 100(a1)
      addi a4, a4, 1
      addi a1, a1, 4
      blt a4, a3, loop
      slli a7, a5, 2
      xor a7, a7, a6` },
    { name: "indexed sum", head: "L1", src: `
L1:   slli a4, a2, 2
      add a4, a4, a0
      lw a5, 0(a4)
      add a3, a3, a5
      addi a2, a2, 1
      blt a2, a1, L1
      mv a0, a3
      ret` },
    { name: "count matches", head: "loop", src: `
loop: lw t0, 0(a2)
      bne t0, a1, next
      addi t1, t1, 1
next: addi a2, a2, 4
      blt a2, a3, loop
      xor a4, a0, a4
      slli a4, a4, 2`, other: "random" },
    { name: "string length", head: "loop", src: `
loop: lb t0, 0(a0)
      beqz t0, done
      addi a0, a0, 1
      addi a1, a1, 1
      j loop
done: mv a0, a1
      ret`, other: false },
    { name: "memory copy", head: "loop", src: `
loop: lw t0, 0(a0)
      sw t0, 0(a1)
      addi a0, a0, 4
      addi a1, a1, 4
      addi a2, a2, -1
      bnez a2, loop
      ret` },
    { name: "popcount", head: "loop", src: `
loop: andi t0, a0, 1
      add a1, a1, t0
      srli a0, a0, 1
      bnez a0, loop
      mv a0, a1
      ret` },
    { name: "two-branch loop", head: "L1", src: `
L1:   addi x10, x10, -4
      slti x11, x10, 10
      beqz x11, L2
      lw x12, 0x200(x10)
      j L3
L2:   lw x12, 0x300(x10)
L3:   sw x12, 0x400(x0)
      bnez x10, L1
      addi x12, x12, 1
      xor x12, x12, x0`, other: "random" },
  ];
  const CONFIGS = [
    { bypass: ["EXE", "MEM", "WB"], text: "full bypassing (EXE → DEC, MEM → DEC, WB → DEC)", short: "full bypassing" },
    { bypass: [], text: "no bypass paths (a value can be read from the register file in the cycle after the producer is in WB)", short: "no bypass paths" },
    { bypass: ["WB"], text: "only a WB → DEC bypass path", short: "WB → DEC only" },
    { bypass: ["MEM", "WB"], text: "MEM → DEC and WB → DEC bypass paths (no EXE → DEC)", short: "MEM and WB → DEC" },
    { bypass: ["EXE", "WB"], text: "EXE → DEC and WB → DEC bypass paths (no MEM → DEC)", short: "EXE and WB → DEC" },
    { bypass: ["EXE", "MEM"], text: "EXE → DEC and MEM → DEC bypass paths (no WB → DEC)", short: "EXE and MEM → DEC" },
    { bypass: ["EXE"], text: "only an EXE → DEC bypass path", short: "EXE → DEC only" },
    { bypass: ["MEM"], text: "only a MEM → DEC bypass path", short: "MEM → DEC only" },
  ];

  // A processor: bypass paths, where branches and jumps resolve, and when load data is ready.
  const machineKey = (m) => [m.bypass.join(), m.branchIn, m.loadReady, m.jalIn].join("|");
  function pickMachine(R, avoid) {
    for (;;) {
      const cfgPick = R.next() < 0.3 ? CONFIGS[0] : R.pick(CONFIGS);
      const branchIn = R.next() < 0.65 ? "EXE" : "DEC";
      const loadReady = R.next() < 0.75 ? "WB" : "MEM";
      const jalIn = branchIn === "DEC" ? "DEC" : R.next() < 0.6 ? "EXE" : "DEC";
      const m = { cfgPick, bypass: cfgPick.bypass, branchIn, loadReady, jalIn };
      if (!avoid || machineKey(m) !== machineKey(avoid)) return m;
    }
  }
  function machineSpec(m, { control = true } = {}) {
    const out = [`5-stage pipeline (IF, DEC, EXE, MEM, WB) with ${m.cfgPick.text}.`];
    if (control) {
      out.push(`Branches are predicted not taken (fetch PC + 4) and resolve in **${m.branchIn}**; ${m.branchIn === "DEC" ? "a branch in DEC needs its source registers there, like any other instruction" : "instructions fetched after a taken branch are annulled"}.`,
        `Jumps ([[j]]/[[jal]]) redirect fetch in **${m.jalIn}**; [[ret]]/[[jalr]] resolve in ${m.branchIn}.`);
    }
    out.push(m.bypass.length
      ? `Load data is ready in the **${m.loadReady}** stage${m.loadReady === "WB" ? " (clocked data memory, as in lecture)" : " (data memory returns in the same cycle)"}. A load value can use a bypass path from that stage or a later one, if the processor has that path.`
      : "Without bypass paths, a load result is also read from the register file only after the load leaves WB.",
      "The register file is written at the end of WB and read in DEC.");
    return out;
  }
  const simCfg = (m, taken) => ({ bypass: m.bypass, loadReady: m.loadReady, branchIn: m.branchIn, jalIn: m.jalIn, taken });
  const stageDelays = (R) => ({ IF: R.int(2, 5), DEC: R.int(3, 6), EXE: R.int(5, 10), MEM: R.int(4, 9), WB: R.int(2, 4), BYP: R.int(1, 2) });
  const delayText = (d) => `IF ${d.IF} ns, DEC ${d.DEC} ns, EXE ${d.EXE} ns, MEM ${d.MEM} ns, WB ${d.WB} ns, and the bypass muxes (in DEC) ${d.BYP} ns`;
  // Each bypass source stage drives the bypass muxes in the same cycle; DEC always goes through the muxes
  // when there is any bypass path.
  function clockOf(d, bypass) {
    const byp = new Set(bypass);
    const paths = [["IF", d.IF], [byp.size ? "DEC + BYP" : "DEC", d.DEC + (byp.size ? d.BYP : 0)]];
    for (const s of ["EXE", "MEM", "WB"]) paths.push([byp.has(s) ? `${s} + BYP` : s, d[s] + (byp.has(s) ? d.BYP : 0)]);
    const tclk = Math.max(...paths.map((p) => p[1]));
    return { tclk, crit: paths.find((p) => p[1] === tclk)[0] };
  }

  // ---- random code
  const ALU3 = ["add", "sub", "xor", "or", "and", "slt"];
  const ALUI = ["addi", "slli", "srli", "andi", "xori"];
  // Straight-line instructions with short dependency distances (mostly on the last 1-3 results).
  function genBody(R, n, ptr, { stores = true } = {}) {
    const pool = R.shuffle(["a1", "a2", "a4", "a5", "t0", "t1", "t2", "t3"]).slice(0, 5);
    const live = [];
    const src = () => (live.length && R.chance(0.8) ? live[live.length - 1 - Math.min(live.length - 1, R.int(0, 2))] : R.pick(pool));
    const dst = () => R.pick(pool);
    const off = () => 4 * R.int(0, 8);
    const body = [];
    for (let i = 0; i < n; i++) {
      const k = i === 0 ? "load" : R.pick(stores ? ["load", "alu", "alu", "alui", "store"] : ["load", "alu", "alu", "alui"]);
      if (k === "load") { const d = dst(); body.push(`${R.chance(0.85) ? "lw" : "lb"} ${d}, ${off()}(${ptr})`); live.push(d); }
      else if (k === "alu") { const a = src(); let b = src(); if (b === a) b = R.pick(pool.filter((x) => x !== a)); const d = dst(); body.push(`${R.pick(ALU3)} ${d}, ${a}, ${b}`); live.push(d); }
      else if (k === "alui") { const op = R.pick(ALUI), a = src(), d = dst(); body.push(`${op} ${d}, ${a}, ${op[0] === "s" ? R.int(1, 3) : R.int(1, 15)}`); live.push(d); }
      else body.push(`sw ${src()}, ${off()}(${ptr})`);
    }
    return { body, live, pool };
  }
  const fmtLines = (lines) => lines.map(([label, text]) => `${(label ? label + ":" : "").padEnd(6)}${text}`).join("\n");

  // A random loop: bottom-tested (bnez/bne back to loop) or top-tested (beqz to done + j loop),
  // sometimes with an if that skips one instruction.
  function genLoop(R) {
    const { body, live, pool } = genBody(R, R.int(3, 5), "a0");
    const at = (k) => R.int(1, body.length);
    body.splice(at(), 0, "addi a0, a0, 4");
    const top = R.chance(0.35);
    if (!top) body.splice(at(), 0, "addi a3, a3, -1");
    let skip = null;
    if (R.chance(0.45)) {
      const p = R.int(1, body.length - 1);
      const x = live[R.int(0, live.length - 1)];
      body.splice(p, 0, R.chance(0.5) ? `beqz ${x}, skip` : `blt ${x}, ${R.pick(pool)}, skip`);
      skip = p + 2; // the skipped instruction is body[p + 1]
    }
    const lines = body.map((t) => [null, t]);
    if (top) { lines.unshift([null, "beqz a3, done"]); lines.push([null, "addi a3, a3, -1"], [null, "j loop"]); if (skip !== null) skip += 1; }
    else lines.push([null, R.chance(0.6) ? "bnez a3, loop" : "bne a0, a6, loop"]);
    if (skip !== null) lines[skip][0] = "skip";
    lines[0][0] = "loop";
    const last = live[live.length - 1];
    lines.push([top ? "done" : null, `mv a0, ${last}`], [null, R.chance(0.5) ? "ret" : `sw ${last}, 0(a1)`]);
    return { name: "generated loop", head: "loop", src: fmtLines(lines), skipOutcome: R.chance(0.5) };
  }

  // Loop text, the program, and each branch's fixed outcome. The loop branch is taken, a top
  // test is never taken, other branches have one outcome per problem.
  function loopSetup(R) {
    const loop = R.next() < 0.5 ? R.pick(LOOPS) : genLoop(R);
    const prog = parseProgram(loop.src);
    const head = prog.findIndex((i) => i.label === loop.head);
    const outcome = {};
    const other = loop.skipOutcome !== undefined ? loop.skipOutcome : loop.other === "random" ? R.chance(0.5) : loop.other === true;
    prog.forEach((ins, i) => {
      if (ins.kind !== "branch") return;
      if (ins.ti === head) outcome[i] = true;
      else if (ins.target === "done" && loop.skipOutcome !== undefined) outcome[i] = false;
      else outcome[i] = other;
    });
    const loopBranch = Object.keys(outcome).find((i) => prog[i].ti === head);
    const others = Object.keys(outcome).filter((i) => prog[i].ti !== head);
    const text = `${loopBranch !== undefined ? "The loop branch is **always taken** (the loop runs many times)." : "The loop runs many times."}${others.map((i) => ` [[${prog[i].text}]] is **${outcome[i] ? "always taken" : "never taken"}**.`).join("")}`;
    return { loop, prog, head, taken: (si) => !!outcome[si], outcomeText: text };
  }

  function pipeFigure(rows, gray, arrows, start, len) {
    return F.pipe({ start, rows: Object.fromEntries(STAGES.map((s, r) => [s, rows[r].map((v, c) => (gray[r][c] ? "#" : v))])),
      arrows: arrows.filter(([s, , c]) => c < len && !gray[STAGES.indexOf(s)][c]).map(([s, , c]) => [s, "DEC", start + c]), cw: 44 });
  }

  function pipelineDrill(R) {
    const L = loopSetup(R);
    const m = pickMachine(R);
    const w = pipeWindow(L.prog, simCfg(m, L.taken), L.head, { iteration: 4 });
    const len = Math.min(w.len, 18);
    const start = R.pick([100, 200, 1000, 37, 64]);
    const d = stageDelays(R);
    const { tclk, crit } = clockOf(d, m.bypass);
    const single = d.IF + d.DEC + d.EXE + d.MEM + d.WB;
    const rows = STAGES.map((s) => w.rows[s].slice(0, len));
    const gray = rows.map((_, r) => rows[r].map((_, c) => c < r));
    const given = rows.map((_, r) => rows[r].map((_, c) => r === 0 && c === 0));
    const bypassAns = Array.from({ length: len }, (_, c) => w.arrows.filter(([s, , cc]) => cc === c && cc >= STAGES.indexOf(s)).map(([s]) => s));
    const colLabels = rows[0].map((_, c) => String(start + c));
    const statement = `**Pipeline diagram (${L.loop.name}).** This loop runs on a processor with these features:

${machineSpec(m).map((s) => "- " + s).join("\n")}

~~~
${L.loop.src.trim()}
~~~

${L.outcomeText} The loop is in steady state. In cycle ${start} the instruction at [[${L.loop.head}]] is fetched.

**(A)** Fill in the pipeline diagram for cycles ${start} to ${start + len - 1}. Write NOP for a bubble or an annulled slot. Cells shaded gray belong to earlier iterations and are not graded. In the **Bypass** row, write the stage(s) that bypass a value into DEC in that cycle (EXE, MEM, or WB, separated by spaces), or leave it empty.

**(B)** Give the cycles per loop iteration, the cycles lost to stalls, and the cycles lost to annulments.

**(C)** The stage delays are ${delayText(d)}. A bypassed value goes through its source stage and then the bypass muxes in the same cycle. Registers are ideal. Give the minimum clock period, the time per iteration, and the CPI of the loop. Then give the time per iteration on an unpipelined single-cycle processor built from the same logic (clock period = sum of the five stage delays, CPI = 1).`;
    const solution = `**(A)**

${fig(pipeFigure(rows, gray, w.arrows, start, len))}

**(B)** One iteration takes **${w.period}** cycles: ${w.executed} instructions complete, ${w.stalls} cycle${w.stalls === 1 ? " is" : "s are"} lost to stalls, and ${w.annulled} to annulled instructions.

**(C)** The slowest path is ${crit}: $t_{CLK} = ${tclk}$ ns. One iteration takes $${w.period} \\cdot ${tclk} = ${w.period * tclk}$ ns. CPI $= ${w.period}/${w.executed}$. Unpipelined: $t_{CLK} = ${single}$ ns and ${w.executed} instructions take $${w.executed} \\cdot ${single} = ${w.executed * single}$ ns.`;
    return {
      title: `Pipeline diagram: ${L.loop.name}, ${m.cfgPick.short}`,
      statement,
      grids: [{ id: "pipe", caption: "Pipeline diagram", rowLabels: STAGES, colLabels, answer: rows, given, gray, kind: "text", bypass: bypassAns }],
      parts: [
        { q: "Cycles per loop iteration", answer: String(w.period) },
        { q: "Cycles lost to stalls per iteration", answer: String(w.stalls) },
        { q: "Cycles lost to annulments per iteration", answer: String(w.annulled) },
        { q: "Minimum clock period (ns)", answer: String(tclk) },
        { q: "Time per iteration (ns)", answer: String(w.period * tclk) },
        { q: "CPI of the loop", answer: `${w.period}/${w.executed}` },
        { q: "Unpipelined time per iteration (ns)", answer: String(w.executed * single) },
      ],
      solution,
    };
  }

  // Straight-line code from an empty pipeline, and the NOPs a compiler must add without interlocks.
  function pipeStraightDrill(R) {
    let m, prog, src, sim, last, tries = 0;
    for (;;) {
      m = pickMachine(R);
      const n = m.bypass.length ? R.int(5, 7) : R.int(4, 5);
      const { body } = genBody(R, n, R.pick(["a0", "s0", "t4"]));
      src = body.join("\n");
      prog = parseProgram(src);
      sim = root.Sim6191.simulate(prog, simCfg(m, () => false), 60);
      last = sim.rows.WB.findIndex((v, c) => c > 0 && v !== "NOP" && sim.rows.WB.slice(c + 1).every((x) => x === "NOP"));
      if ((last + 1 <= 20 && sim.stalls.length) || ++tries > 30) break;
    }
    const len = last + 1;
    const rows = STAGES.map((s) => sim.rows[s].slice(0, len));
    const lastBusy = rows.map((row) => row.reduce((b, v, c) => (v !== "NOP" ? c : b), -1));
    const gray = rows.map((row, r) => row.map((_, c) => c < r || c > lastBusy[r]));
    const given = rows.map((row, r) => row.map((_, c) => r === 0 && c === 0));
    const bypassAns = Array.from({ length: len }, (_, c) => sim.arrows.filter(([, , cc]) => cc === c).map(([s]) => s));
    const nops = prog.map((_, i) => sim.stallSi.filter((x) => x === i).length);
    const total = nops.reduce((a, b) => a + b, 0);
    const statement = `**Straight-line code.** A processor has these features:

${machineSpec(m, { control: false }).map((s) => "- " + s).join("\n")}

The pipeline holds only NOPs before cycle 1. The first instruction is fetched in cycle 1.

~~~
${src}
~~~

**(A)** Fill in the pipeline diagram until the last instruction is in WB. Write NOP for a bubble. Gray cells hold NOPs before the code reaches the stage or after it leaves; they are not graded. In the **Bypass** row, write the stage(s) that bypass a value into DEC in that cycle.

**(B)** Now remove the stall logic (no interlocks) but keep the same bypass paths. The compiler must insert NOPs so that the code still gets the right values. How many NOPs must go right before each instruction (as few as possible)?

**(C)** In which cycle is the last instruction in WB, and how many stall cycles does the code have with interlocks?`;
    const solution = `**(A)**

${fig(pipeFigure(rows, gray, sim.arrows, 1, len))}

**(B)** Each stall cycle of an instruction in DEC is one NOP the compiler must insert right before that instruction: a NOP delays the instruction by one cycle, exactly as a stall does.

| Instruction | ${prog.map((p) => `[[${p.text}]]`).join(" | ")} |
|---|${prog.map(() => "---").join("|")}|
| NOPs before it | ${nops.join(" | ")} |

**(C)** The last instruction is in WB in cycle ${len}. With interlocks the code stalls ${total} cycle${total === 1 ? "" : "s"}.`;
    return {
      title: `Straight-line pipeline: ${m.cfgPick.short}`,
      statement,
      grids: [
        { id: "pipe", caption: "Pipeline diagram", rowLabels: STAGES, colLabels: rows[0].map((_, c) => String(c + 1)), answer: rows, given, gray, kind: "text", bypass: bypassAns },
        { id: "nops", caption: "(B) NOPs right before each instruction", rowLabels: prog.map((p) => p.text), colLabels: ["NOPs"], answer: nops.map((x) => [String(x)]), kind: "value" },
      ],
      parts: [
        { q: "(C) Cycle in which the last instruction is in WB", answer: String(len) },
        { q: "(C) Stall cycles with interlocks", answer: String(total) },
      ],
      solution,
    };
  }

  // The same loop on two processors: cycles per iteration, clock periods, and which is faster.
  function pipeCompareDrill(R) {
    const L = loopSetup(R);
    let A, B, wA, wB, tries = 0;
    do {
      A = pickMachine(R); B = pickMachine(R, A);
      wA = pipeWindow(L.prog, simCfg(A, L.taken), L.head, { iteration: 4 });
      wB = pipeWindow(L.prog, simCfg(B, L.taken), L.head, { iteration: 4 });
    } while (wA.period === wB.period && ++tries < 20);
    const d = stageDelays(R);
    const cA = clockOf(d, A.bypass), cB = clockOf(d, B.bypass);
    const tA = wA.period * cA.tclk, tB = wB.period * cB.tclk;
    const faster = tA < tB ? "A" : tB < tA ? "B" : "same";
    const list = (m) => machineSpec(m).slice(0, 4).join(" ");
    const statement = `**Comparing two processors.** This loop runs for many iterations. ${L.outcomeText}

~~~
${L.loop.src.trim()}
~~~

Processors A and B are built from the same stages, with delays ${delayText(d)}. A bypassed value goes through its source stage and then the bypass muxes in the same cycle. The bypass muxes are in DEC only if the processor has a bypass path. Registers are ideal.

- **Processor A:** ${list(A)}
- **Processor B:** ${list(B)}

Draw the steady-state pipeline diagram for each processor on paper. Then give, for each processor, the cycles per iteration, the minimum clock period, and the time per iteration. Which processor runs the loop faster (A, B, or same)?`;
    const solFor = (name, m, w, c) => {
      const len = Math.min(w.len, 18);
      const rows = STAGES.map((s) => w.rows[s].slice(0, len));
      const gray = rows.map((_, r) => rows[r].map((_, cc) => cc < r));
      return `**Processor ${name}** (${m.cfgPick.short}; branches in ${m.branchIn}, jumps in ${m.jalIn}, loads ready in ${m.loadReady}):

${fig(pipeFigure(rows, gray, w.arrows, 100, len))}

${w.period} cycles per iteration (${w.stalls} stall, ${w.annulled} annulled). $t_{CLK} = ${c.tclk}$ ns (${c.crit}). Time per iteration: $${w.period} \\cdot ${c.tclk} = ${w.period * c.tclk}$ ns.`;
    };
    return {
      title: `Compare processors: ${L.loop.name}`,
      statement,
      grids: [],
      parts: [
        { q: "A: cycles per iteration", answer: String(wA.period) }, { q: "B: cycles per iteration", answer: String(wB.period) },
        { q: "A: minimum clock period (ns)", answer: String(cA.tclk) }, { q: "B: minimum clock period (ns)", answer: String(cB.tclk) },
        { q: "A: time per iteration (ns)", answer: String(tA) }, { q: "B: time per iteration (ns)", answer: String(tB) },
        { q: "Faster processor (A, B, or same)", accept: faster === "same" ? ["same", "tie", "equal"] : [faster] },
      ],
      solution: `${solFor("A", A, wA, cA)}\n\n${solFor("B", B, wB, cB)}\n\n**Faster:** ${faster === "same" ? "neither; both take the same time" : `processor ${faster}`}.`,
    };
  }

  // ---------------------------------------------------------------- caches
  // A tiny machine: registers, word memory, and a cache (unified or split) on the access path.
  function runProgram(lines, codeBase, memInit, caches, maxSteps = 4000) {
    const prog = parseProgram(lines.join("\n"));
    const regs = Array(32).fill(0);
    const words = new Map();
    const memory = {
      read: (a) => (a >= codeBase && a < codeBase + 4 * prog.length ? { ins: prog[(a - codeBase) / 4].op } : words.has(a) ? words.get(a) : memInit(a)),
      write: (a, v) => { if (!(v && v.ins)) words.set(a, v); },
    };
    const stats = { ifetch: 0, ihit: 0, dacc: 0, dhit: 0 };
    let pc = 0, steps = 0;
    const occ = {};
    while (pc < prog.length && steps++ < maxSteps) {
      const ins = prog[pc];
      if (ins.op === "unimp") break;
      const iaddr = codeBase + 4 * pc;
      const ic = caches.i || caches.u;
      if (ic) { const r = ic.access(iaddr, memory, false); stats.ifetch++; if (r.hit) stats.ihit++; }
      const args = ins.text.slice(ins.op.length).split(",").map((s) => s.trim());
      const imm = (s) => Number(s);
      const memArg = (a) => { const m = a.match(/^(.*)\((\w+)\)$/); return (Number(m[1] || 0) + regs[root.Sim6191.reg(m[2])]) >>> 0; };
      const dc = caches.d || caches.u;
      let next = pc + 1;
      const set = (rd, v) => { if (rd) regs[rd] = v >>> 0; };
      const op = ins.op;
      if (["lw", "lh", "lhu", "lb", "lbu"].includes(op)) {
        const a = memArg(args[1]);
        const r = dc.access(a & ~3, memory, false); stats.dacc++; if (r.hit) stats.dhit++;
        const word = r.value >>> 0, sh = (a & 3) * 8;
        let v = word;
        if (op === "lb") v = ((word >>> sh) << 24) >> 24; else if (op === "lbu") v = (word >>> sh) & 0xff;
        else if (op === "lh") v = ((word >>> sh) << 16) >> 16; else if (op === "lhu") v = (word >>> sh) & 0xffff;
        set(ins.rd, v);
      } else if (["sw", "sh", "sb"].includes(op)) {
        const a = memArg(args[1]); const val = regs[ins.src[0] ?? 0] ?? 0;
        const srcReg = root.Sim6191.reg(args[0]); const v = regs[srcReg];
        const sh = (a & 3) * 8;
        const r = dc.access(a & ~3, memory, true, (old) => {
          old = old >>> 0;
          if (op === "sw") return v >>> 0;
          const mask = op === "sb" ? 0xff : 0xffff;
          return ((old & ~(mask << sh)) | ((v & mask) << sh)) >>> 0;
        });
        stats.dacc++; if (r.hit) stats.dhit++;
        void val;
      } else if (op === "addi") set(ins.rd, regs[ins.src[0] ?? 0] + imm(args[2]));
      else if (op === "li") set(ins.rd, imm(args[1]));
      else if (op === "mv") set(ins.rd, regs[ins.src[0] ?? 0]);
      else if (op === "add") set(ins.rd, regs[root.Sim6191.reg(args[1])] + regs[root.Sim6191.reg(args[2])]);
      else if (op === "slli") set(ins.rd, regs[root.Sim6191.reg(args[1])] << imm(args[2]));
      else if (op === "sub") set(ins.rd, regs[root.Sim6191.reg(args[1])] - regs[root.Sim6191.reg(args[2])]);
      else if (op === "slti") set(ins.rd, (regs[root.Sim6191.reg(args[1])] | 0) < imm(args[2]) ? 1 : 0);
      else if (op === "xor") set(ins.rd, regs[root.Sim6191.reg(args[1])] ^ regs[root.Sim6191.reg(args[2])]);
      else if (ins.kind === "branch") {
        const a = regs[root.Sim6191.reg(args[0])] | 0, b = BR1.includes(op) ? 0 : regs[root.Sim6191.reg(args[1])] | 0;
        const t = { beq: a === b, bne: a !== b, blt: a < b, bge: a >= b, beqz: a === 0, bnez: a !== 0 }[op];
        if (t) next = ins.ti;
      } else if (op === "j") next = ins.ti;
      else if (ins.kind !== "nop") throw new Error("runProgram: unsupported " + op);
      occ[pc] = (occ[pc] || 0) + 1;
      pc = next;
    }
    return { regs, stats, words, prog };
  }
  const BR1 = ["beqz", "bnez"];

  // Cache contents as table rows: [set/way label, tag, V, D, words high..low].
  function cacheRows(cache, cfg) {
    const out = [];
    cache.S.forEach((ways, set) => ways.forEach((l, w) => {
      const label = cfg.ways === 1 ? String(set) : cache.sets === 1 ? `way ${w}` : `set ${set}, way ${w}`;
      out.push([label, l.v ? hex(l.tag) : "", String(l.v), l.v ? String(l.d) : "",
        ...l.data.slice().reverse().map((x) => (!l.v ? "" : x && x.ins ? x.ins : hex(x)))]);
    }));
    return out;
  }
  const cacheKind = (cfg) => (cfg.ways === 1 ? "direct-mapped" : cfg.ways * cfg.block === cfg.words ? "fully associative" : `${cfg.ways}-way set-associative`);
  const cacheDesc = (cfg) => `${cacheKind(cfg)} cache with ${cfg.words} words in total and ${cfg.block} word${cfg.block > 1 ? "s" : ""} per block${cfg.ways > 1 ? " (LRU replacement)" : ""}, write-back, initially empty`;

  function cacheTraceDrill(R) {
    const cfg = R.pick([
      { words: 16, block: 4, ways: 1 }, { words: 8, block: 2, ways: 1 }, { words: 16, block: 2, ways: 1 }, { words: 16, block: 2, ways: 2 },
      { words: 8, block: 2, ways: 2 }, { words: 8, block: 2, ways: 4 }, { words: 16, block: 4, ways: 2 }, { words: 8, block: 1, ways: 2 },
    ]);
    const unified = R.chance(0.5);
    const base = R.pick([0x200, 0x300, 0x400]);
    const codeBase = R.pick([0x0, 0x1000, 0x100]);
    const memInit = (a) => (a >= base && a < base + 0x100 ? (a - base) / 4 : 0);
    const blockBytes = cfg.block * 4;
    const span = cfg.words * 4 * 2;
    const addrs = () => base + 4 * R.int(0, span / 4 - 1);
    const n = R.int(4, 6);
    const lines = [`. = ${hex(codeBase)}`];
    const code = [];
    const used = [], loaded = [];
    for (let i = 0; i < n; i++) {
      const kind = R.pick(["lw", "lw", "sw", "sb", "sh", "lw"]);
      let a = i > 0 && R.chance(0.35) ? used[R.int(0, used.length - 1)] + 4 * R.int(-1, 1) : addrs();
      if (a < base) a = base;
      if (kind === "sb") a += R.int(0, 3); else if (kind === "sh") a += R.pick([0, 2]);
      used.push(a & ~3);
      const rd = i === 0 ? "x2" : R.pick(["x2", "x3", "x4"]);
      // The first instruction is a load, so the stores have a loaded value to write.
      if (kind === "lw" || i === 0) { code.push(`lw ${rd}, ${hex(a & ~3)}(x0)`); loaded.push(rd); }
      else code.push(`${kind} ${R.pick(loaded)}, ${hex(a)}(x0)`);
    }
    code.push("unimp");
    void blockBytes;
    const ic = unified ? null : makeCache(cfg), dc = unified ? null : makeCache(cfg), uc = unified ? makeCache(cfg) : null;
    const run = runProgram(code, codeBase, memInit, unified ? { u: uc } : { i: ic, d: dc });
    const shown = unified ? uc : dc;
    const rowsAns = cacheRows(shown, cfg);
    const cols = ["Tag", "V", "D", ...Array.from({ length: cfg.block }, (_, i) => `Word ${cfg.block - 1 - i}`)];
    const memTable = (() => {
      const cells = Array.from({ length: 12 }, (_, i) => [hex(base + 4 * i), hex(i)]);
      const rws = [];
      for (let r = 0; r < 4; r++) rws.push("| " + [0, 4, 8].map((c) => cells[c + r]).map(([a, d]) => `${a} | ${d}`).join(" | ") + " |");
      return "{plain}\n| Address | Data | Address | Data | Address | Data |\n|---|---|---|---|---|---|\n" + rws.join("\n");
    })();
    const wb = (unified ? uc : dc).stats.writebacks;
    const istats = { hit: run.stats.ihit, miss: run.stats.ifetch - run.stats.ihit };
    const statement = `**Cache trace.** Memory holds ${hex(0)} at address ${hex(base)}, ${hex(1)} at ${hex(base + 4)}, ${hex(2)} at ${hex(base + 8)}, and so on (each word is 1 more than the word before it) up to ${hex(base + 0xfc)}. All other data words are 0.

${memTable}

The processor has ${unified ? "**one unified cache** for instructions and data" : "**separate instruction and data caches**, each"}: a ${cacheDesc(cfg)}. Run this code on a single-cycle processor. Registers start at 0. The processor halts at [[unimp]] without fetching it.

~~~
${[lines[0], ...code].join("\n")}
~~~

**(A)** Fill in the ${unified ? "cache" : "data cache"} after the code runs. Write tags and data in hex${unified ? ", and the instruction name (for example lw) for a word that holds an instruction" : ""}. Leave the other cells of an invalid line empty.${cfg.ways > 1 ? " The ways of a set may be filled in any order." : ""}

**(B)** Give the ${unified ? "instruction hits and misses, and the " : ""}data hits and misses, the number of words written back to memory, and the final values of x2 and x3.`;
    const rowLabels = rowsAns.map((r) => r[0]);
    const answer = rowsAns.map((r) => r.slice(1));
    const parts = [];
    if (unified) parts.push({ q: "Instruction hits", answer: String(istats.hit) }, { q: "Instruction misses", answer: String(istats.miss) });
    parts.push({ q: "Data hits", answer: String(run.stats.dhit) }, { q: "Data misses", answer: String(run.stats.dacc - run.stats.dhit) },
      { q: "Words written back to memory", answer: String(wb.length) },
      { q: "Final x2 (hex)", answer: hex(run.regs[2]) }, { q: "Final x3 (hex)", answer: hex(run.regs[3]) });
    const { offBits, idxBits } = shown;
    const solTable = "| Line | " + cols.join(" | ") + " |\n|---|" + cols.map(() => "---").join("|") + "|\n" + rowsAns.map((r) => "| " + r.map((x) => x || "").join(" | ") + " |").join("\n");
    const solution = `Address fields: byte offset A[1:0]${cfg.block > 1 ? `, block offset A[${offBits - 1}:2]` : ""}${idxBits ? `, index A[${offBits + idxBits - 1}:${offBits}]` : ""}, tag A[31:${offBits + idxBits}].

**(A)**

${solTable}

**(B)** ${unified ? `Instruction hits ${istats.hit}, misses ${istats.miss}. ` : ""}Data hits ${run.stats.dhit}, misses ${run.stats.dacc - run.stats.dhit}. ${wb.length ? `Written back: ${wb.map((x) => `Mem[${hex(x.addr)}] = ${x.value && x.value.ins ? x.value.ins : hex(x.value)}`).join(", ")}.` : "Nothing is written back."} x2 = ${hex(run.regs[2])}, x3 = ${hex(run.regs[3])}.`;
    return { title: `Cache trace: ${cacheKind(cfg)}, ${unified ? "unified" : "split I/D"}`, statement,
      grids: [{ id: "cache", caption: unified ? "Unified cache" : "Data cache", rowLabels, colLabels: cols, answer, kind: "value",
        // The ways of a set may be filled in any order.
        groups: cfg.ways > 1 ? shown.S.map((_, set) => Array.from({ length: cfg.ways }, (_, w) => set * cfg.ways + w)) : null }], parts, solution };
  }

  // Loop programs over arrays: whole-run instruction and data hit counts.
  const CLOOPS = [
    { name: "array sum", n: 16, src: (A) => `      mv x4, x0
loop: lw x2, ${hex(A)}(x4)
      add x1, x1, x2
      addi x4, x4, 4
      slti x2, x4, ${16 * 4}
      bnez x2, loop
      unimp` },
    { name: "double each element", n: 20, src: (A, B) => `      mv x4, x0
loop: lw x2, ${hex(A)}(x4)
      slli x3, x2, 1
      sw x3, ${hex(B)}(x4)
      addi x4, x4, 4
      slti x2, x4, ${20 * 4}
      bnez x2, loop
      unimp` },
    { name: "negate in place", n: 16, src: (A) => `      mv x1, x0
      li x2, 16
loop: slli x5, x1, 2
      lw x7, ${hex(A)}(x5)
      sub x7, x0, x7
      sw x7, ${hex(A)}(x5)
      addi x1, x1, 1
      blt x1, x2, loop
      unimp` },
    { name: "add two arrays", n: 8, src: (A, B, C) => `      mv x1, x0
      li x2, 32
loop: lw x3, ${hex(A)}(x1)
      lw x4, ${hex(B)}(x1)
      add x5, x3, x4
      sw x5, ${hex(C)}(x1)
      addi x1, x1, 4
      blt x1, x2, loop
      unimp` },
  ];
  function cacheLoopDrill(R) {
    const L = R.pick(CLOOPS);
    const cfg = R.pick([
      { words: 16, block: 2, ways: 1 }, { words: 16, block: 4, ways: 1 }, { words: 16, block: 2, ways: 2 }, { words: 32, block: 4, ways: 2 },
      { words: 16, block: 2, ways: 8 }, { words: 32, block: 1, ways: 1 }, { words: 64, block: 4, ways: 1 }, { words: 16, block: 4, ways: 4 },
    ]);
    const unified = R.chance(0.6);
    const A = R.pick([0x100, 0x200, 0x400]), B = A + R.pick([0x80, 0x100, 0x200]), C = B + R.pick([0x80, 0x100]);
    const lines = L.src(A, B, C).split("\n");
    const caches = unified ? { u: makeCache(cfg) } : { i: makeCache(cfg), d: makeCache(cfg) };
    const run = runProgram(lines, 0, (a) => (a >>> 2) & 0xff, caches);
    const { ifetch, ihit, dacc, dhit } = run.stats;
    const statement = `**Cache performance (${L.name}).** This benchmark runs from address 0 on a single-cycle processor (registers start at 0). It loops until the loop branch falls through and then executes [[unimp]] once and halts. Count one fetch for [[unimp]].

~~~
. = 0
${lines.join("\n")}
~~~

The processor has ${unified ? "**one unified cache** for instructions and data" : "**separate instruction and data caches**, each"}: a ${cacheDesc(cfg)}.

How many instruction fetches and data accesses does the program make, and what are the hit ratios for instruction fetches, for data accesses, and overall?`;
    const sol = `The program fetches ${ifetch} instructions (${ihit} hits) and makes ${dacc} data accesses (${dhit} hits).

- Instruction hit ratio: $${ihit}/${ifetch}$.
- Data hit ratio: $${dhit}/${dacc}$.
- Overall: $${ihit + dhit}/${ifetch + dacc}$.

The cache is simulated access by access (instruction fetch, then the data access of that instruction). ${unified ? "With a unified cache, instruction blocks and data blocks compete for the same lines." : "With split caches, instruction blocks never evict data blocks."} A block of ${cfg.block} word${cfg.block > 1 ? "s" : ""} means one miss brings in ${cfg.block} consecutive word${cfg.block > 1 ? "s" : ""}.`;
    return { title: `Cache performance: ${L.name}`, statement, grids: [], parts: [
      { q: "Instruction fetches", answer: String(ifetch) }, { q: "Data accesses", answer: String(dacc) },
      { q: "Instruction hit ratio", answer: `${ihit}/${ifetch}` }, { q: "Data hit ratio", answer: `${dhit}/${dacc}` },
      { q: "Overall hit ratio", answer: `${ihit + dhit}/${ifetch + dacc}` },
    ], solution: sol };
  }

  function cacheGeometryDrill(R) {
    const words = R.pick([16, 32, 64, 128, 256, 1024]);
    const block = R.pick([1, 2, 4, 8].filter((b) => b <= words / 2));
    const lines = words / block;
    const ways = R.pick([1, 2, 4, lines].filter((x) => x <= lines));
    const sets = lines / ways;
    const off = Math.log2(block) + 2, idx = Math.log2(sets), tag = 32 - off - idx;
    const hit = R.int(1, 4), pen = R.pick([10, 16, 20, 40, 64, 100]);
    const hr = R.pick([[7, 8], [15, 16], [9, 10], [19, 20], [3, 4], [31, 32]]);
    const amat = hit + (1 - hr[0] / hr[1]) * pen;
    const bits = 1 + 1 + tag + 32 * block;
    const statement = `**Cache geometry and AMAT.** A ${cacheKind({ words, block, ways })} write-back cache holds ${words} data words in total, with ${block} word${block > 1 ? "s" : ""} per block. Addresses and words are 32 bits.

**(A)** Which address bits are the block offset, the cache index, and the tag? Write them as [[high:low]] (for example [[31:7]]), or [[none]] if a field has no bits. (The byte offset is A[1:0].)

**(B)** Each line has a valid bit, a dirty bit, a tag, and its data. How many bits does one line hold, and how many bits does the whole cache hold?

**(C)** A hit takes ${hit} cycle${hit > 1 ? "s" : ""} and a miss takes ${pen} more cycles. With a hit ratio of $${hr[0]}/${hr[1]}$, what is the AMAT? What hit ratio gives an AMAT of ${hit + pen / 10} cycles?`;
    const r = (h, l) => (h < l ? "none" : `${h}:${l}`);
    const target = 1 - (pen / 10) / pen;
    return { title: `Cache geometry: ${cacheKind({ words, block, ways })}`, statement, grids: [], parts: [
      { q: "Block offset bits A[ : ]", accept: [r(off - 1, 2)] }, { q: "Index bits A[ : ]", accept: [r(off + idx - 1, off)] }, { q: "Tag bits A[ : ]", accept: [r(31, off + idx)] },
      { q: "Bits per line", answer: String(bits) }, { q: "Bits in the whole cache", answer: String(bits * lines) },
      { q: "AMAT (cycles)", answer: String(amat) }, { q: `Hit ratio for AMAT ${hit + pen / 10}`, answer: String(target) },
    ], solution: `Block offset: ${block} words → ${Math.log2(block)} bit${block === 2 ? "" : "s"}${block > 1 ? ` (A[${r(off - 1, 2)}])` : " (none)"}. ${lines} lines / ${ways} way${ways > 1 ? "s" : ""} = ${sets} set${sets > 1 ? "s" : ""} → ${idx} index bit${idx === 1 ? "" : "s"}${idx ? ` (A[${off + idx - 1}:${off}])` : " (none)"}. Tag: the remaining ${tag} bits, A[31:${off + idx}].

Each line: 1 + 1 + ${tag} + 32·${block} = ${bits} bits; ${lines} lines give ${bits * lines} bits.

AMAT $= ${hit} + (1 - ${hr[0]}/${hr[1]}) \\cdot ${pen} = ${amat}$. For AMAT ${hit + pen / 10}: $(1 - HR) \\cdot ${pen} = ${pen / 10}$, so $HR = ${target}$.` };
  }

  // ---------------------------------------------------------------- k-stage pipelining
  function dagDrill(R) {
    const layers = R.pick([[2, 2, 2, 1], [3, 2, 2, 1], [2, 3, 2, 1], [3, 3, 2, 1], [2, 2, 2, 2, 1]]);
    const nodes = [], edges = [];
    layers.forEach((n, l) => { for (let i = 0; i < n; i++) nodes.push({ id: `n${l}_${i}`, l, i, d: R.int(1, 9) }); });
    const byL = (l) => nodes.filter((x) => x.l === l);
    // Edges between neighboring layers form a monotone staircase from (top, top) to (bottom,
    // bottom): every node gets an edge, and two edges never cross. A skip edge (layer l-2 to l)
    // joins the two top nodes around the top of the drawing, or the two bottom nodes around the
    // bottom, so it crosses nothing either.
    // Edges also span at most 1.5 rows vertically, so no edge runs long past another box.
    const rowY = (l, i) => i + (3 - layers[l]) / 2;
    for (let l = 1; l < layers.length; l++) {
      const A = byL(l - 1), B = byL(l);
      let i = 0, j = 0;
      edges.push([A[0].id, B[0].id]);
      while (i < A.length - 1 || j < B.length - 1) {
        const steps = [[i + 1, j], [i, j + 1], [i + 1, j + 1]].filter(([a, b]) => a < A.length && b < B.length);
        const short = steps.filter(([a, b]) => Math.abs(rowY(l - 1, a) - rowY(l, b)) <= 1.5);
        [i, j] = R.pick(short.length ? short : steps.slice(-1));
        edges.push([A[i].id, B[j].id]);
      }
    }
    const skip = {};
    if (R.chance(0.45)) {
      const l = R.int(2, layers.length - 1), top = R.chance(0.5);
      const a = top ? byL(l - 2)[0] : byL(l - 2).slice(-1)[0], b = top ? byL(l)[0] : byL(l).slice(-1)[0];
      edges.push([a.id, b.id]);
      skip[`${a.id}>${b.id}`] = top ? 10 : 225;
    }
    nodes.sort((u, v) => u.l - v.l || u.i - v.i);
    const inputs = byL(0).map((v, i) => [`@${"ABCD"[i]}`, v.id]);
    const outs = byL(layers.length - 1).map((v, i) => [v.id, `@${"XYZ"[i]}`]);
    const D = Object.fromEntries(nodes.map((v) => [v.id, v.d]));
    const preds = (id) => edges.filter((e) => e[1] === id).map((e) => e[0]);
    // longest path
    const arr = {};
    for (const v of nodes) arr[v.id] = Math.max(0, ...preds(v.id).map((u) => arr[u])) + v.d;
    const comb = Math.max(...outs.map(([u]) => arr[u]));
    // ASAP stage assignment for clock period P (inputs arrive at stage 1, time 0)
    const assign = (P) => {
      const st = {}, at = {};
      for (const v of nodes) {
        let s = Math.max(1, ...preds(v.id).map((u) => st[u]));
        let a = Math.max(0, ...preds(v.id).filter((u) => st[u] === s).map((u) => at[u])) + v.d;
        if (a > P) { s += 1; a = v.d; }
        st[v.id] = s; at[v.id] = a;
      }
      return { st, K: Math.max(...outs.map(([u]) => st[u])) };
    };
    const maxD = Math.max(...nodes.map((v) => v.d));
    const best = assign(maxD);
    let P2 = maxD; while (assign(P2).K > 2) P2++;
    const k3 = Math.min(3, best.K);
    let P3 = maxD; while (assign(P3).K > k3) P3++;
    const tpd = R.int(1, 2), tsu = R.int(0, 1);
    // layout and figures
    const X = (l) => 110 + l * 100, Y = (l, i) => 40 + i * 70 + (3 - layers[l]) * 35;
    const gn = {};
    nodes.forEach((v) => { gn[v.id] = [X(v.l), Y(v.l, v.i), `${v.d} ns`]; });
    inputs.forEach(([t, v]) => { const n = nodes.find((x) => x.id === v); gn[t] = [30, Y(0, n.i), t.slice(1)]; });
    outs.forEach(([v, t]) => { const n = nodes.find((x) => x.id === v); gn[t] = [X(n.l) + 80, Y(n.l, n.i), t.slice(1)]; });
    const allE = [...inputs.map(([a, b]) => `${a}>${b}`), ...edges.map(([a, b]) => `${a}>${b}`), ...outs.map(([a, b]) => `${a}>${b}`)];
    const drawE = allE.map((e) => {
      if (!(e in skip)) return e;
      const [a, b] = e.split(">");
      return [a, b, { via: [[gn[a][0], skip[e]], [gn[b][0], skip[e]]] }];
    });
    const W = X(layers.length - 1) + 110, H = 40 + 3 * 70 + 10;
    const draw = (regs) => F.svg(W, H, F.graph(gn, drawE, { regs, rc: "acc" }));
    // kWant > K pads the pipeline with extra registers on the outputs (same period, more stages).
    const regsFor = ({ st, K }, kWant = K) => {
      const r = {};
      for (const [a, b] of edges) if (st[b] - st[a] > 0) r[`${a}>${b}`] = st[b] - st[a];
      for (const [a, b] of inputs) if (st[b] - 1 > 0) r[`${a}>${b}`] = st[b] - 1;
      for (const [a, b] of outs) r[`${a}>${b}`] = Math.max(K, kWant) - st[a] + 1;
      return r;
    };
    const statement = `**Pipelining a circuit.** Each component shows its propagation delay. Registers are ideal unless a part says otherwise, and every pipeline has a register on each output.

${fig(draw({}))}

**(A)** What are the latency and throughput of the combinational circuit (a 1-stage pipeline)?

**(B)** Pipeline the circuit for maximum throughput, with the fewest stages for that throughput. Place the registers in the figure below the questions, and give the latency and throughput.

**(C)** Give the latency and throughput of the best (maximum-throughput) **2-stage** pipeline${k3 === 3 ? ", and of the best **3-stage** pipeline" : ""}.

**(D)** Use the pipeline of (B) with registers that have $t_{PD} = ${tpd}$ ns and $t_{SETUP} = ${tsu}$ ns. What are the latency and throughput?`;
    const P = maxD, K = best.K, Pr = P + tpd + tsu;
    const parts = [
      { q: "(A) Latency (ns)", answer: String(comb) }, { q: "(A) Throughput (1/ns)", answer: `1/${comb}` },
      { q: "(B) Latency (ns)", answer: String(K * P) }, { q: "(B) Throughput (1/ns)", answer: `1/${P}` },
      { q: "(C) 2-stage latency (ns)", answer: String(2 * P2) }, { q: "(C) 2-stage throughput (1/ns)", answer: `1/${P2}` },
    ];
    if (k3 === 3) parts.push({ q: "(C) 3-stage latency (ns)", answer: String(3 * P3) }, { q: "(C) 3-stage throughput (1/ns)", answer: `1/${P3}` });
    parts.push({ q: "(D) Latency (ns)", answer: String(K * Pr) }, { q: "(D) Throughput (1/ns)", answer: `1/${Pr}` });
    const solution = `**(A)** The longest input-to-output path is ${comb} ns: latency ${comb} ns, throughput $1/${comb}$.

**(B)** The slowest component is ${P} ns, so the best period is ${P} ns. Placing each component in the earliest stage that keeps every stage at most ${P} ns needs **${K}** stages: latency $${K} \\cdot ${P} = ${K * P}$ ns, throughput $1/${P}$. One valid placement of the registers (orange dots):

${fig(draw(regsFor(best)))}

**(C)** The smallest period that fits in 2 stages is ${P2} ns: latency ${2 * P2} ns, throughput $1/${P2}$.${k3 === 3 ? ` In 3 stages it is ${P3} ns: latency ${3 * P3} ns, throughput $1/${P3}$.` : ""}

${fig(draw(regsFor(assign(P2), 2)))}

**(D)** $t_{CLK} = ${P} + t_{PD} + t_{SETUP} = ${Pr}$ ns. Latency $${K} \\cdot ${Pr} = ${K * Pr}$ ns, throughput $1/${Pr}$.`;
    // Interactive register placement (app.js draws it; evalPlacement grades it).
    const order = [...inputs.map(([t]) => t), ...nodes.map((v) => v.id), ...outs.map(([, t]) => t)];
    const targets = [{ label: "Maximum throughput (fewest stages)", K, P, regs: regsFor(best) },
      { label: "Best 2-stage pipeline", K: 2, P: P2, regs: regsFor(assign(P2), 2) }];
    if (k3 === 3) targets.push({ label: "Best 3-stage pipeline", K: 3, P: P3, regs: regsFor(assign(P3), 3) });
    const place = { gn, edges: allE, drawEdges: drawE, W, H, order, delay: D, outs: outs.map(([, t]) => t), targets };
    return { title: "Pipelining a circuit (K-stage)", statement, grids: [], parts, solution, place };
  }

  // Grades a register placement { "A>B": count } on a place object from dagDrill. A valid
  // pipeline has the same number of registers on every input-to-output path and a register on
  // each output. Returns { ok, K, P } or { ok: false, msg, bad: [node ids] }.
  function evalPlacement(pl, regs) {
    const E = pl.edges.map((s) => { const [a, b] = s.split(">"); return { a, b, k: regs[s] || 0 }; });
    const c = {}, t = {};
    for (const id of pl.order) {
      const inc = E.filter((e) => e.b === id);
      if (!inc.length) { c[id] = 0; t[id] = 0; continue; }
      const cs = [...new Set(inc.map((e) => c[e.a] + e.k))].sort((x, y) => x - y);
      if (cs.length > 1) {
        const what = id[0] === "@" ? `output ${id.slice(1)}` : `the ${pl.delay[id]} ns component (red)`;
        return { ok: false, bad: id[0] === "@" ? [] : [id], msg: `The paths into ${what} cross different numbers of registers (${cs.join(" and ")}). Their values would come from different inputs.` };
      }
      c[id] = cs[0];
      t[id] = (pl.delay[id] || 0) + Math.max(0, ...inc.map((e) => (e.k ? 0 : t[e.a])));
    }
    const Ks = [...new Set(pl.outs.map((o) => c[o]))];
    if (Ks.length > 1) return { ok: false, bad: [], msg: `The outputs have different numbers of registers (${Ks.join(" and ")}).` };
    const bare = pl.outs.filter((o) => E.some((e) => e.b === o && !e.k));
    if (bare.length) return { ok: false, bad: [], msg: `Output ${bare.map((o) => o.slice(1)).join(" and ")} has no register. In 6.191, every pipeline has a register on each output.` };
    const P = Math.max(...Object.values(t));
    return { ok: true, K: Ks[0], P };
  }

  // ---------------------------------------------------------------- control signals
  const CONV = `| Field | Values |
|---|---|
| aluFunc | Add, Sub, And, Or, Xor, Sll, Srl, Sra, Slt, Sltu |
| brFunc | Eq, Neq, Lt, Ge, Ltu, Geu |
| bSel | 0 (rVal2), 1 (imm) |
| memFunc | Lw, Lh, Lhu, Lb, Lbu, Sw, Sh, Sb |
| memEn | True (memory write enabled), False |
| wdSel | 0 (pc + 4), 1 (dataOut), 2 (aluRes) |
| rfWen | True, False |
| pcSel | 0 (jumpTarget = {aluRes[31:1], 0}), 1 (branchTarget = brTaken ? pc + imm : pc + 4), 2 (pc + 4) |`;
  function controlDrill(R) {
    const rr = () => R.int(1, 31);
    const imm12 = () => R.int(-64, 255);
    const kind = R.pick(["r", "i", "load", "store", "branch", "jalr", "lui", "r", "i", "load", "store", "branch"]);
    const Q = "?";
    let ins, f;
    const name = { add: "Add", sub: "Sub", and: "And", or: "Or", xor: "Xor", sll: "Sll", srl: "Srl", sra: "Sra", slt: "Slt", sltu: "Sltu" };
    if (kind === "r") {
      const op = R.pick(Object.keys(name)); const [d, a, b] = [rr(), rr(), rr()];
      ins = `${op} x${d}, x${a}, x${b}`;
      f = { imm: Q, rs1: a, rs2: b, rd: d, aluFunc: name[op], brFunc: Q, bSel: "0", memFunc: Q, memEn: "False", wdSel: "2", rfWen: "True", pcSel: "2" };
    } else if (kind === "i") {
      const op = R.pick(["addi", "andi", "ori", "xori", "slti", "slli", "srai"]); const [d, a] = [rr(), rr()];
      const v = op.startsWith("s") && op !== "slti" ? R.int(1, 31) : imm12();
      ins = `${op} x${d}, x${a}, ${v}`;
      f = { imm: v, rs1: a, rs2: Q, rd: d, aluFunc: name[op.slice(0, -1)] || { slt: "Slt", sra: "Sra", sll: "Sll" }[op.slice(0, -1)], brFunc: Q, bSel: "1", memFunc: Q, memEn: "False", wdSel: "2", rfWen: "True", pcSel: "2" };
    } else if (kind === "load") {
      const op = R.pick(["lw", "lw", "lb", "lhu"]); const [d, a] = [rr(), rr()]; const v = R.int(0, 64) * 4;
      ins = `${op} x${d}, ${v}(x${a})`;
      f = { imm: v, rs1: a, rs2: Q, rd: d, aluFunc: "Add", brFunc: Q, bSel: "1", memFunc: op[0].toUpperCase() + op.slice(1), memEn: ["False", Q], wdSel: "1", rfWen: "True", pcSel: "2" };
    } else if (kind === "store") {
      const op = R.pick(["sw", "sw", "sb", "sh"]); const [s, a] = [rr(), rr()]; const v = R.int(0, 64) * 4;
      ins = `${op} x${s}, ${v}(x${a})`;
      f = { imm: v, rs1: a, rs2: s, rd: Q, aluFunc: "Add", brFunc: Q, bSel: "1", memFunc: op[0].toUpperCase() + op.slice(1), memEn: "True", wdSel: Q, rfWen: "False", pcSel: "2" };
    } else if (kind === "branch") {
      const op = R.pick(["beq", "bne", "blt", "bge", "bltu", "bgeu"]); const [a, b] = [rr(), rr()]; const v = R.int(-16, 32) * 4;
      ins = `${op} x${a}, x${b}, ${v}   # offset ${v}`;
      f = { imm: v, rs1: a, rs2: b, rd: Q, aluFunc: Q, brFunc: { beq: "Eq", bne: "Neq", blt: "Lt", bge: "Ge", bltu: "Ltu", bgeu: "Geu" }[op], bSel: "0", memFunc: Q, memEn: "False", wdSel: Q, rfWen: "False", pcSel: "1" };
    } else if (kind === "jalr") {
      const [d, a] = [rr(), rr()]; const v = R.int(0, 16) * 4;
      ins = `jalr x${d}, ${v}(x${a})`;
      f = { imm: v, rs1: a, rs2: Q, rd: d, aluFunc: "Add", brFunc: Q, bSel: "1", memFunc: Q, memEn: "False", wdSel: "0", rfWen: "True", pcSel: "0" };
    } else {
      const d = rr(); const v = R.int(1, 0xfffff);
      ins = `lui x${d}, ${hex(v)}`;
      f = { imm: hex(v * 4096), rs1: 0, rs2: Q, rd: d, aluFunc: "Add", brFunc: Q, bSel: "1", memFunc: Q, memEn: "False", wdSel: "2", rfWen: "True", pcSel: "2" };
    }
    const FIELDS = ["imm", "rs1", "rs2", "rd", "aluFunc", "brFunc", "bSel", "memFunc", "memEn", "wdSel", "rfWen", "pcSel"];
    const parts = FIELDS.map((k) => {
      const v = f[k];
      const acc = Array.isArray(v) ? v : [v];
      return { q: k, accept: acc.map(String), dontCare: acc.includes(Q) };
    });
    const statement = `**Decoder outputs.** The single-cycle processor from lecture decodes this instruction:

~~~
${ins}
~~~

Give each decoder output. Write ? for a don't-care. Registers are numbers (5, or x5), and imm is the decoded 32-bit immediate (sign-extended; for [[lui]] it is already shifted left by 12). For [[lui]], the value is computed as imm + x0. The encodings of the select signals are:

${CONV}`;
    const solution = `| Field | Value |\n|---|---|\n${FIELDS.map((k) => `| ${k} | ${Array.isArray(f[k]) ? f[k].join(" or ") : f[k]} |`).join("\n")}\n\nWhy: ${{ r: "R-type ALU ops read rs1 and rs2 (bSel 0), write aluRes to rd, and go to pc + 4.", i: "I-type ALU ops use the immediate as the second operand (bSel 1) and write aluRes.", load: "Loads compute the address rs1 + imm in the ALU (Add, bSel 1) and write the memory data (wdSel 1); memory is not written.", store: "Stores compute the address rs1 + imm and write rs2 to memory (memEn True); no register is written, so wdSel is a don't-care.", branch: "Branches compare rs1 and rs2 (bSel 0) with brFunc; the next PC is brTaken ? pc + imm : pc + 4 (pcSel 1); nothing is written.", jalr: "jalr writes pc + 4 to rd (wdSel 0) and jumps to (rs1 + imm) with the low bit cleared (ALU Add, pcSel 0).", lui: "lui writes imm (already shifted) by adding it to x0 in the ALU." }[kind]}`;
    return { title: `Decoder outputs: ${ins.split(" ")[0]}`, statement, grids: [], parts, solution };
  }

  // ---------------------------------------------------------------- stage roles (question bank)
  const ROLES = [
    ["In the standard 5-stage pipeline, in which stage is the register file read?", ["DEC"]],
    ["In which stage is the register file written?", ["WB"]],
    ["In which stage does the ALU compute the result of an add?", ["EXE"]],
    ["In which stage is the branch condition evaluated in the standard 5-stage pipeline?", ["EXE"]],
    ["In which stage is the data memory accessed (the address sent)?", ["MEM"]],
    ["With a clocked data memory (lecture design), in which stage does load data become available to bypass?", ["WB"]],
    ["Which stage computes the address of a lw (rs1 + imm)?", ["EXE"]],
    ["In which stage does the instruction memory return the instruction?", ["IF", "DEC"]],
    ["If an instruction needs a value from a load that is in EXE, how many cycles must it stall in DEC with full bypassing (lecture design, data back in WB)?", ["2"]],
    ["With full bypassing, how many stall cycles does an add need right after an add that writes its source?", ["0"]],
    ["With no bypassing, how many instructions must separate a producer and its consumer (the consumer reads the register file the cycle after WB)?", ["3"]],
    ["With branches resolved in EXE and predict-not-taken, how many instructions are annulled on a taken branch?", ["2"]],
    ["With branches resolved in DEC, how many instructions are annulled on a taken branch?", ["1"]],
    ["Which kind of hazard does bypassing fix: data or control?", ["data"]],
    ["Which kind of hazard does annulment handle: data or control?", ["control"]],
    ["Which pipeline register write is disabled when DEC stalls: the IF/DEC register or the DEC/EXE register?", ["IF/DEC", "IFDEC", "IF-DEC"]],
    ["When DEC stalls, what is inserted into EXE?", ["NOP", "bubble"]],
    ["What is the CPI of a single-cycle (unpipelined) processor?", ["1"]],
    ["A pipeline has stage delays 3, 5, 4, 6, 2 ns with ideal registers and no bypass muxes. What is the minimum clock period (ns)?", ["6"]],
    ["Same stages (3, 5, 4, 6, 2 ns) but unpipelined: what is the clock period (ns)?", ["20"]],
    ["Which instruction type writes pc + 4 to rd: jal, sw, or beq?", ["jal"]],
    ["Which instructions use memFunc with memEn True in the lecture decoder: loads or stores?", ["stores", "store"]],
    ["Which signal selects the second ALU operand between rVal2 and imm?", ["bSel", "BSEL"]],
    ["Which signal selects what is written to the register file?", ["wdSel", "WDSEL"]],
    ["In a K-stage pipeline with clock period T, what is the latency?", ["K*T", "KT", "K T", "T*K"]],
    ["What is the throughput of a pipeline with clock period T?", ["1/T"]],
    ["Can a register file with 2 read ports serve an instruction that reads 3 registers in one cycle? (yes/no)", ["no"]],
    ["In a direct-mapped cache, how many places can a block go?", ["1"]],
    ["In a fully associative cache with N lines, how many places can a block go?", ["N"]],
    ["What is a compulsory miss also called?", ["cold miss", "cold"]],
    ["Which miss goes away with more associativity: conflict or compulsory?", ["conflict"]],
    ["Which kind of locality does a larger block size exploit: spatial or temporal?", ["spatial"]],
    ["When must a write-back cache write a line to memory?", ["when a dirty line is evicted", "eviction", "evicted", "on eviction"]],
    ["AMAT = hit time + miss ratio × ...?", ["miss penalty"]],
  ];
  function rolesDrill(R) {
    const qs = R.shuffle(ROLES).slice(0, 6);
    return { title: "Pipeline and cache facts", statement: "**Quick questions.** Answer each in a word or a number.", grids: [],
      parts: qs.map(([q, acc]) => ({ q, accept: acc })), solution: qs.map(([q, acc]) => `- ${q} **${acc[0]}**`).join("\n") };
  }

  // ---------------------------------------------------------------- Minispec traces
  function minispecDrill(R) {
    const t = R.pick(["fsm", "regs", "maybe"]);
    const cycles = 7;
    if (t === "fsm") {
      const states = ["A", "B", "C", "D"].slice(0, R.int(3, 4));
      const tr = {}; for (const s of states) tr[s] = [R.pick(states), R.pick(states)];
      const outS = R.pick(states);
      const ins = Array.from({ length: cycles }, () => R.int(0, 1));
      const st = [states[0]];
      for (let c = 0; c < cycles - 1; c++) st.push(tr[st[c]][ins[c]]);
      const code = `typedef enum { ${states.join(", ")} } State;

module Detector;
    Reg#(State) state(${states[0]});
    input Bit#(1) in;
    rule tick;
        case (state)
${states.map((s) => `            ${s}: state <= (in == 1) ? ${tr[s][1]} : ${tr[s][0]};`).join("\n")}
        endcase
    endrule
    method Bit#(1) out = (state == ${outS}) ? 1 : 0;
endmodule`;
      return { title: "Minispec: FSM over cycles", statement: `**Tracking a state machine.** Fill in the state and the output of [[out]] in each cycle. Cycle 0 is the first cycle after reset; the input [[in]] in each cycle is given.\n\n~~~\n${code}\n~~~`,
        grids: [{ id: "ms", caption: "Values in each cycle", rowLabels: ["in", "state", "out"], colLabels: Array.from({ length: cycles }, (_, c) => String(c)),
          answer: [ins.map(String), st, st.map((s) => (s === outS ? "1" : "0"))], given: [ins.map(() => true), st.map((_, c) => c === 0), st.map(() => false)], kind: "text" }],
        parts: [], solution: `The register updates at the end of each cycle from the input of that cycle, so the state in cycle c + 1 is the transition from the state in cycle c on in[c]. [[out]] depends only on the current state.\n\n| Cycle | ${st.map((_, c) => c).join(" | ")} |\n|---|${st.map(() => "---").join("|")}|\n| in | ${ins.join(" | ")} |\n| state | ${st.join(" | ")} |\n| out | ${st.map((s) => (s === outS ? 1 : 0)).join(" | ")} |` };
    }
    if (t === "regs") {
      const k = R.int(1, 3), m = R.pick([7, 15]);
      const ins = Array.from({ length: cycles }, () => R.int(0, 9));
      const x = [R.int(0, 3)], y = [R.int(0, 5)];
      const thr = R.int(3, 8);
      for (let c = 0; c < cycles - 1; c++) {
        const nx = (x[c] + ins[c]) & m;
        const ny = x[c] > thr ? (y[c] + k) & m : y[c];
        x.push(nx); y.push(ny);
      }
      const bits = m === 7 ? 3 : 4;
      const code = `module Acc;
    Reg#(Bit#(${bits})) x(${x[0]});
    Reg#(Bit#(${bits})) y(${y[0]});
    input Bit#(${bits}) in;
    rule tick;
        x <= x + in;
        if (x > ${thr}) y <= y + ${k};
    endrule
    method Bit#(${bits}) out = y;
endmodule`;
      return { title: "Minispec: registers over cycles", statement: `**Tracking registers.** Fill in x and y in each cycle (values at the start of the cycle, in decimal). Arithmetic wraps around in ${bits} bits. The input [[in]] in each cycle is given.\n\n~~~\n${code}\n~~~`,
        grids: [{ id: "ms", caption: "Register values", rowLabels: ["in", "x", "y"], colLabels: Array.from({ length: cycles }, (_, c) => String(c)),
          answer: [ins.map(String), x.map(String), y.map(String)], given: [ins.map(() => true), x.map((_, c) => c === 0), y.map((_, c) => c === 0)], kind: "value" }],
        parts: [], solution: `All register writes in a rule happen together at the end of the cycle, using the values at the start of the cycle (so [[y]] tests the old [[x]]). Values wrap modulo ${m + 1}.\n\n| Cycle | ${x.map((_, c) => c).join(" | ")} |\n|---|${x.map(() => "---").join("|")}|\n| in | ${ins.join(" | ")} |\n| x | ${x.join(" | ")} |\n| y | ${y.join(" | ")} |` };
    }
    // Maybe-input collector
    const n = R.int(2, 3);
    const ins = Array.from({ length: cycles }, () => (R.chance(0.65) ? R.int(1, 9) : null));
    let sum = 0, cnt = 0; const S = [], Cn = [], O = [];
    for (let c = 0; c < cycles; c++) {
      S.push(sum); Cn.push(cnt); O.push(cnt === n ? `V(${sum})` : "Inv");
      if (cnt === n) { sum = 0; cnt = 0; }
      else if (ins[c] !== null) { sum += ins[c]; cnt += 1; }
    }
    const code = `module Collect;
    Reg#(Bit#(8)) sum(0);
    Reg#(Bit#(2)) count(0);
    input Maybe#(Bit#(8)) in default = Invalid;
    rule tick;
        if (count == ${n}) begin
            sum <= 0;
            count <= 0;
        end else if (isValid(in)) begin
            sum <= sum + fromMaybe(?, in);
            count <= count + 1;
        end
    endrule
    method Maybe#(Bit#(8)) result = (count == ${n}) ? Valid(sum) : Invalid;
endmodule`;
    return { title: "Minispec: Maybe inputs over cycles", statement: `**Tracking a module with Maybe inputs.** Fill in [[sum]], [[count]], and [[result]] in each cycle. Write V(x) for Valid(x) and Inv for Invalid. The input in each cycle is given.\n\n~~~\n${code}\n~~~`,
      grids: [{ id: "ms", caption: "Values in each cycle", rowLabels: ["in", "sum", "count", "result"], colLabels: Array.from({ length: cycles }, (_, c) => String(c)),
        answer: [ins.map((v) => (v === null ? "Inv" : `V(${v})`)), S.map(String), Cn.map(String), O], given: [ins.map(() => true), S.map((_, c) => c === 0), Cn.map((_, c) => c === 0), O.map(() => false)], kind: "text" }],
      parts: [], solution: `When count reaches ${n}, [[result]] is valid for one cycle and the next cycle resets; inputs that arrive in that cycle are ignored.\n\n| Cycle | ${S.map((_, c) => c).join(" | ")} |\n|---|${S.map(() => "---").join("|")}|\n| in | ${ins.map((v) => (v === null ? "Inv" : `V(${v})`)).join(" | ")} |\n| sum | ${S.join(" | ")} |\n| count | ${Cn.join(" | ")} |\n| result | ${O.join(" | ")} |` };
  }

  // ---------------------------------------------------------------- Minispec writing (fill in a template, like Fall 2025 P1)
  // Code answers are compared after codeCanon: no spaces, lower case, number literals in decimal,
  // and grouping parentheses removed (call parentheses such as isValid(x) and Bit#(4) stay).
  function codeCanon(s) {
    let t = String(s).trim().replace(/;\s*$/, "");
    t = t.replace(/(\d*)'([bdh])([0-9a-f_]+)/gi, (_, w, b, d) => String(parseInt(d.replace(/_/g, ""), { b: 2, d: 10, h: 16 }[b.toLowerCase()])));
    t = t.replace(/\b0x([0-9a-f]+)\b/gi, (_, d) => String(parseInt(d, 16))).replace(/\b0b([01]+)\b/gi, (_, d) => String(parseInt(d, 2)));
    t = t.replace(/\s+/g, "").toLowerCase();
    const out = [], st = [];
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (ch === "(") { const call = i > 0 && /[\w#]/.test(t[i - 1]); st.push(call); if (call) out.push(ch); }
      else if (ch === ")") { if (st.pop()) out.push(ch); }
      else out.push(ch);
    }
    return out.join("");
  }
  const either = (a, op, b) => [`${a} ${op} ${b}`, `${b} ${op} ${a}`];
  const bitsFor = (n) => Math.max(1, Math.ceil(Math.log2(n)));
  const randBits = (R, L) => { let p; do p = Array.from({ length: L }, () => R.int(0, 1)).join(""); while (/^(.)\1*$/.test(p)); return p; };
  const ifThen = (cond, a, b, negCond) => [`(${cond}) ? ${a} : ${b}`, ...(negCond ? [`(${negCond}) ? ${b} : ${a}`] : [])];

  // @name@ in the code is a blank; blanks[name] lists the accepted answers (the first is shown in the solution).
  function fillTemplate(code, blanks) {
    const order = [];
    const stmt = code.replace(/@(\w+)@/g, (_, k) => { order.push(k); return `____(${order.length})____`; });
    const sol = code.replace(/@(\w+)@/g, (_, k) => blanks[k][0]);
    return { stmt, sol, parts: order.map((k, i) => ({ q: `Blank (${i + 1})`, accept: blanks[k], code: true })) };
  }

  const MSW = {
    counter(R) {
      let N; do N = R.int(5, 14); while ((N & (N - 1)) === 0);
      const w = bitsFor(N), m = N - 1;
      return { title: "Wrapping counter",
        task: `Write a counter that counts 0, 1, ..., ${m}, 0, 1, ... It goes up by one in each cycle where the input [[en]] is True. It holds its value in the other cycles. The method [[wrap]] is True in a cycle where [[en]] is True and the count is ${m} (so the count goes back to 0 at the end of that cycle).`,
        code: `module Counter;
    Reg#(Bit#(${w})) count(0);
    input Bool en default = False;

    rule tick;
        if (@en@) begin
            count <= @next@;
        end
    endrule

    method Bool wrap = @wrap@;
endmodule`,
        blanks: { en: ["en", "en == True"],
          next: [...ifThen(`count == ${m}`, "0", "count + 1", `count != ${m}`), ...ifThen(`count < ${m}`, "count + 1", "0", `count >= ${m}`)],
          wrap: [...either("en", "&&", `count == ${m}`), ...either("en", "&&", `${m} == count`)] },
        why: `[[count]] has ${w} bits. ${m} + 1 = ${N} fits in ${w} bits, so the count does not go back to 0 by itself (${N} is not a power of 2). The mux selects 0 when the count is ${m}.` };
    },

    fsm(R) {
      const L = R.int(3, 4), p = randBits(R, L);
      const next = (k, b) => { const s = p.slice(0, k) + b; for (let len = Math.min(L, s.length); len >= 0; len--) if (s.endsWith(p.slice(0, len))) return len; return 0; };
      const S = Array.from({ length: L + 1 }, (_, k) => `S${k}`);
      const blanks = { found: [`state == S${L}`, `S${L} == state`] };
      const rows = S.map((s, k) => { blanks[`t${k}a`] = [`S${next(k, "1")}`]; blanks[`t${k}b`] = [`S${next(k, "0")}`]; return `            ${s}: state <= (in == 1) ? @t${k}a@ : @t${k}b@;`; });
      return { title: "Sequence detector FSM",
        task: `Write a state machine that finds the input pattern ${p.split("").join(", ")} (oldest bit first) on the 1-bit input [[in]]. One bit arrives in each cycle. State S${"k"} means: the longest end of the inputs so far that matches the start of the pattern has k bits. The method [[found]] is True in the cycle after the last bit of the pattern arrives. Overlapping patterns count (after a match, the end of the match can be the start of the next one).`,
        code: `typedef enum { ${S.join(", ")} } State;

module Detect;
    Reg#(State) state(S0);
    input Bit#(1) in;

    rule tick;
        case (state)
${rows.join("\n")}
        endcase
    endrule

    method Bool found = @found@;
endmodule`,
        blanks,
        why: `From state S${"k"} with input b, take the first k pattern bits followed by b, then find the longest end of that string that is also a start of the pattern ${p}. ${S.map((s, k) => `${s}: 1 → S${next(k, "1")}, 0 → S${next(k, "0")}`).join("; ")}.` };
    },

    shift(R) {
      const L = R.int(4, 6), p = randBits(R, L), lsb = R.chance(0.5);
      const stored = lsb ? p : p.split("").reverse().join("");
      return { title: "Shift-register pattern detector",
        task: `Write a module that remembers the last ${L} bits of the 1-bit input [[in]] in the register [[last]]. Each new bit enters at the ${lsb ? "least" : "most"} significant end of [[last]], and the oldest bit leaves at the other end. The method [[found]] is True when the last ${L} inputs, oldest first, were ${p.split("").join(", ")}. (Ignore the first ${L - 1} cycles after reset.)`,
        code: `module Detect;
    Reg#(Bit#(${L})) last(0);
    input Bit#(1) in;

    rule tick;
        last <= @sh@;
    endrule

    method Bool found = @f@;
endmodule`,
        blanks: { sh: [lsb ? `{last[${L - 2}:0], in}` : `{in, last[${L - 1}:1]}`],
          f: either("last", "==", `${L}'b${stored}`) },
        why: lsb ? `The new bit goes in bit 0, so the oldest of the last ${L} bits is bit ${L - 1}. Read from the most significant bit, [[last]] holds the pattern in arrival order: ${L}'b${stored}.`
          : `The new bit goes in bit ${L - 1}, so the oldest bit is bit 0. Read from the most significant bit, [[last]] holds the pattern in reverse arrival order: ${L}'b${stored}.` };
    },

    loopfn(R) {
      const n = R.pick([4, 8, 16]), k = Math.log2(n) + 1;
      const kind = R.pick(["parity", "popcount", "reverse", "allones", "hamming"]);
      const F = {
        parity: { name: "parity", ret: 1, args: `Bit#(${n}) x`, lhs: "r", init: ["0"], body: either("r", "^", "x[i]"),
          task: `returns 1 if [[x]] has an odd number of 1 bits, and 0 otherwise`, why: "XOR of all the bits, starting from 0." },
        popcount: { name: "countOnes", ret: k, args: `Bit#(${n}) x`, lhs: "r", init: ["0"], body: either("r", "+", "zeroExtend(x[i])"),
          task: `returns the number of 1 bits in [[x]]`, why: `The result needs ${k} bits to hold ${n}. Each bit is zero-extended to ${k} bits before the add.` },
        reverse: { name: "reverseBits", ret: n, args: `Bit#(${n}) x`, lhs: "r[i]", init: ["0"], body: [`x[${n - 1} - i]`],
          task: `returns [[x]] with the order of its bits reversed (bit 0 goes to bit ${n - 1})`, why: `Bit i of the result is bit ${n - 1} − i of [[x]].` },
        allones: { name: "allOnes", ret: 1, args: `Bit#(${n}) x`, lhs: "r", init: ["1"], body: either("r", "&", "x[i]"),
          task: `returns 1 if every bit of [[x]] is 1, and 0 otherwise`, why: "AND of all the bits, starting from 1 (the identity of AND)." },
        hamming: { name: "distance", ret: k, args: `Bit#(${n}) a, Bit#(${n}) b`, lhs: "r", init: ["0"],
          body: [...either("r", "+", "zeroExtend(a[i] ^ b[i])"), ...either("r", "+", "zeroExtend(b[i] ^ a[i])")],
          task: `returns the number of bit positions where [[a]] and [[b]] are different`, why: `a[i] ^ b[i] is 1 where the bits are different. Zero-extend it to ${k} bits and add.` },
      }[kind];
      return { title: "Combinational function with a loop",
        task: `Write the function [[${F.name}]], which ${F.task}. Use the for loop.`,
        code: `function Bit#(${F.ret}) ${F.name}(${F.args});
    Bit#(${F.ret}) r = @init@;
    for (Integer i = 0; i < @bound@; i = i + 1) begin
        ${F.lhs} = @body@;
    end
    return r;
endfunction`,
        blanks: { init: F.init, bound: [String(n)], body: F.body },
        why: `${F.why} The loop has a constant bound, so the compiler unrolls it into ${n} copies of the loop body.` };
    },

    alu(R) {
      const w = R.pick([8, 16]), h = w / 2;
      const OPS = [
        ["a + b", either("a", "+", "b")],
        ["a − b", ["a - b"]],
        ["the bitwise AND of a and b", either("a", "&", "b")],
        ["the bitwise OR of a and b", either("a", "|", "b")],
        ["the bitwise XOR of a and b", either("a", "^", "b")],
        ["the bitwise NOT of a", ["~a"]],
        ["a shifted left by 1 (a 0 enters at bit 0)", ["a << 1", `{a[${w - 2}:0], 1'b0}`]],
        ["a shifted right by 1 (a 0 enters at the top)", ["a >> 1", `{1'b0, a[${w - 1}:1]}`]],
        ["the larger of a and b (unsigned)", [...ifThen("a > b", "a", "b", "a <= b"), ...ifThen("a >= b", "a", "b", "a < b"), ...ifThen("b > a", "b", "a", "b <= a"), ...ifThen("b < a", "a", "b")]],
        ["the smaller of a and b (unsigned)", [...ifThen("a < b", "a", "b", "a >= b"), ...ifThen("a <= b", "a", "b", "a > b"), ...ifThen("b < a", "b", "a", "b >= a"), ...ifThen("b > a", "a", "b")]],
        [`the low ${h} bits of a, then the low ${h} bits of b (a in the upper half)`, [`{a[${h - 1}:0], b[${h - 1}:0]}`]],
        ["1 if a equals b, else 0", [...ifThen("a == b", "1", "0", "a != b"), ...ifThen("b == a", "1", "0")]],
        ["the low 4 bits of a, sign-extended", ["signExtend(a[3:0])"]],
        ["the low 4 bits of a, zero-extended", ["zeroExtend(a[3:0])", `{${w - 4}'b0, a[3:0]}`]],
      ];
      const ops = R.shuffle(OPS).slice(0, 4);
      const blanks = {};
      ops.forEach(([, acc], i) => { blanks[`o${i}`] = acc; });
      return { title: "ALU with a case statement",
        task: `Write the function [[alu]]. The 2-bit [[op]] selects the result:\n\n| op | Result |\n|---|---|\n${ops.map(([d], i) => `| ${i} | ${d} |`).join("\n")}`,
        code: `function Bit#(${w}) alu(Bit#(${w}) a, Bit#(${w}) b, Bit#(2) op);
    Bit#(${w}) r = 0;
    case (op)
${ops.map((_, i) => `        ${i}: r = @o${i}@;`).join("\n")}
    endcase
    return r;
endfunction`,
        blanks, why: "Each case assigns one expression of the full width. A bit slice with a concatenation or an extend keeps the width correct." };
    },

    serial(R) {
      const W = R.pick([4, 6, 8]), lsb = R.chance(0.6), k = bitsFor(W);
      return { title: "Serial transmitter",
        task: `Write a transmitter like the UART in Fall 2025. The line [[tx]] is 1 when idle. When [[in]] is valid in the [[Idle]] state, the module saves the data and sends a start bit 0. Then it sends the ${W} data bits, ${lsb ? "least" : "most"} significant bit first, then a stop bit 1, and then it goes back to [[Idle]]. Each bit is on the line for exactly one cycle. The module ignores [[in]] when it is not in [[Idle]].`,
        code: `typedef enum { Idle, Sending, Stop } TxState;

module Transmit;
    Reg#(Bit#(${W})) data;
    Reg#(TxState) state(Idle);
    Reg#(Bit#(1)) tx(1);
    Reg#(Bit#(${k})) idx;
    input Maybe#(Bit#(${W})) in default = Invalid;

    rule tick;
        case (state)
            Idle: if (@v@) begin
                data <= @d@;
                tx <= @start@;
                idx <= @i0@;
                state <= Sending;
            end
            Sending: begin
                tx <= data[idx];
                if (idx == @last@) state <= Stop;
                idx <= @inc@;
            end
            Stop: begin
                tx <= @stop@;
                state <= @back@;
            end
        endcase
    endrule

    method Bit#(1) txWire = @out@;
endmodule`,
        blanks: { v: ["isValid(in)"], d: ["fromMaybe(?, in)"], start: ["0"], i0: [lsb ? "0" : String(W - 1)],
          last: [lsb ? String(W - 1) : "0"], inc: [lsb ? "idx + 1" : "idx - 1", lsb ? "1 + idx" : "idx + " + ((1 << k) - 1)],
          stop: ["1"], back: ["Idle"], out: ["tx"] },
        why: `A register write shows on the line one cycle later. The start bit goes out in the cycle after [[in]] is valid. The ${W} [[Sending]] cycles put bits ${lsb ? `0 to ${W - 1}` : `${W - 1} down to 0`} on the line, and the [[Stop]] state puts the stop bit 1 on the line. [[tx]] keeps 1 in [[Idle]] because no rule writes it there.` };
    },

    iter(R) {
      const kind = R.pick(["sum", "ones", "mult", "gcd"]);
      const pair = `typedef struct { Bit#(16) a; Bit#(16) b; } Pair;\n\n`;
      const V = {
        sum: { title: "Sum from 1 to n", task: "When [[in]] is Valid(n), compute 1 + 2 + ... + n with one addition in each cycle. [[result]] is Invalid while the module works and Valid(sum) when it is done. A new valid input starts a new computation.",
          code: `module SumTo;
    Reg#(Bit#(16)) i(0);
    Reg#(Bit#(16)) sum(0);
    input Maybe#(Bit#(16)) in default = Invalid;

    rule tick;
        if (@v@) begin
            i <= @load@;
            sum <= @zero@;
        end else if (@cond@) begin
            sum <= @acc@;
            i <= @dec@;
        end
    endrule

    method Maybe#(Bit#(16)) result = @res@;
endmodule`,
          blanks: { v: ["isValid(in)"], load: ["fromMaybe(?, in)"], zero: ["0"], cond: ["i != 0", "i > 0", "0 != i", "0 < i"],
            acc: either("sum", "+", "i"), dec: ["i - 1"], res: ifThen("i == 0", "Valid(sum)", "Invalid", "i != 0") },
          why: "The counter [[i]] goes from n down to 0. Each cycle adds the old [[i]] to [[sum]]. Both writes use the values from the start of the cycle." },
        ones: { title: "Count ones, one bit per cycle", task: "When [[in]] is Valid(x), count the 1 bits of x, one bit in each cycle: look at bit 0 and shift right. Stop when no 1 bits are left. [[result]] is Invalid while the module works and Valid(count) when it is done. A new valid input starts a new count.",
          code: `module CountOnes;
    Reg#(Bit#(16)) x(0);
    Reg#(Bit#(5)) count(0);
    input Maybe#(Bit#(16)) in default = Invalid;

    rule tick;
        if (@v@) begin
            x <= @load@;
            count <= @zero@;
        end else if (@cond@) begin
            count <= @acc@;
            x <= @dec@;
        end
    endrule

    method Maybe#(Bit#(5)) result = @res@;
endmodule`,
          blanks: { v: ["isValid(in)"], load: ["fromMaybe(?, in)"], zero: ["0"], cond: ["x != 0", "x > 0", "0 != x", "0 < x"],
            acc: either("count", "+", "zeroExtend(x[0])"), dec: ["x >> 1", "{1'b0, x[15:1]}"], res: ifThen("x == 0", "Valid(count)", "Invalid", "x != 0") },
          why: "Bit 0 is zero-extended to 5 bits before the add. The loop stops as soon as x is 0, so it can take fewer than 16 cycles." },
        mult: { title: "Multiply by repeated addition", task: "When [[in]] is Valid(p), compute p.a × p.b by adding p.a to an accumulator p.b times, one addition in each cycle. [[result]] is Invalid while the module works and Valid(product) when it is done. A new valid input starts a new computation.",
          code: `${pair}module Multiply;
    Reg#(Bit#(16)) a(0);
    Reg#(Bit#(16)) b(0);
    Reg#(Bit#(16)) acc(0);
    input Maybe#(Pair) in default = Invalid;

    rule tick;
        if (@v@) begin
            let p = @load@;
            a <= @la@;
            b <= @lb@;
            acc <= 0;
        end else if (@cond@) begin
            acc <= @acc@;
            b <= @dec@;
        end
    endrule

    method Maybe#(Bit#(16)) result = @res@;
endmodule`,
          blanks: { v: ["isValid(in)"], load: ["fromMaybe(?, in)"], la: ["p.a"], lb: ["p.b"], cond: ["b != 0", "b > 0", "0 != b", "0 < b"],
            acc: either("acc", "+", "a"), dec: ["b - 1"], res: ifThen("b == 0", "Valid(acc)", "Invalid", "b != 0") },
          why: "[[let]] names the struct inside the Maybe. [[b]] counts the additions that are left." },
        gcd: { title: "GCD by subtraction", task: "When [[in]] is Valid(p), compute the greatest common divisor of p.a and p.b (both are not 0). In each cycle, subtract the smaller value from the larger one. Stop when the two values are equal. [[result]] is Invalid while the module works and Valid(gcd) when it is done. A new valid input starts a new computation.",
          code: `${pair}module GCD;
    Reg#(Bit#(16)) x(1);
    Reg#(Bit#(16)) y(1);
    input Maybe#(Pair) in default = Invalid;

    rule tick;
        if (@v@) begin
            let p = @load@;
            x <= @la@;
            y <= @lb@;
        end else if (@c1@) begin
            x <= @sx@;
        end else if (@c2@) begin
            y <= @sy@;
        end
    endrule

    method Maybe#(Bit#(16)) result = @res@;
endmodule`,
          blanks: { v: ["isValid(in)"], load: ["fromMaybe(?, in)"], la: ["p.a"], lb: ["p.b"], c1: ["x > y", "y < x"], sx: ["x - y"],
            c2: ["y > x", "x < y"], sy: ["y - x"], res: [...ifThen("x == y", "Valid(x)", "Invalid", "x != y"), ...ifThen("x == y", "Valid(y)", "Invalid", "x != y"), ...ifThen("y == x", "Valid(x)", "Invalid")] },
          why: "gcd(x, y) = gcd(x − y, y) when x > y. When x = y, that value is the GCD. If x = y, neither branch runs, so the registers hold." },
      }[kind];
      return { ...V, title: V.title };
    },

    tracker(R) {
      const kind = R.pick(["max", "min", "count"]), T = R.int(20, 200);
      const V = {
        max: { title: "Running maximum", task: "[[best]] holds the largest valid input since the last clear. After reset or a clear, [[best]] is 0. If [[clear]] is True in a cycle, the module ignores [[in]] in that cycle.",
          init: "0", blanks: { init2: ["0"], v: ["isValid(in)"], cmp: ["v > best", "best < v"], upd: ["v"] } },
        min: { title: "Running minimum", task: "[[best]] holds the smallest valid input since the last clear. After reset or a clear, [[best]] is 255 (the largest 8-bit value). If [[clear]] is True in a cycle, the module ignores [[in]] in that cycle.",
          init: "255", blanks: { init2: ["255", "8'hFF", "~0"], v: ["isValid(in)"], cmp: ["v < best", "best > v"], upd: ["v"] } },
        count: { title: "Count large inputs", task: `[[best]] counts the valid inputs greater than ${T} since the last clear. After reset or a clear, it is 0. If [[clear]] is True in a cycle, the module ignores [[in]] in that cycle.`,
          init: "0", blanks: { init2: ["0"], v: ["isValid(in)"], cmp: [`v > ${T}`, `${T} < v`, `v >= ${T + 1}`], upd: either("best", "+", "1") } },
      }[kind];
      return { title: V.title, task: V.task,
        code: `module Tracker;
    Reg#(Bit#(8)) best(${V.init});
    input Maybe#(Bit#(8)) in default = Invalid;
    input Bool clear default = False;

    rule tick;
        if (clear) begin
            best <= @init2@;
        end else if (@v@) begin
            let v = fromMaybe(?, in);
            if (@cmp@) best <= @upd@;
        end
    endrule

    method Bit#(8) value = best;
endmodule`,
        blanks: V.blanks, why: "The [[if (clear)]] branch comes first, so a clear wins over a valid input in the same cycle." };
    },

    param(R) {
      const kind = R.pick(["rotl", "rotr", "swap", "vsum", "vor"]);
      const one = (name, ret, desc, ans, why) => ({ title: "Parametric function", task: `Write the parametric function [[${name}]], which ${desc}. It must work for any width n ≥ 2${name === "swapHalves" ? " (n even)" : ""}.`,
        code: `function ${ret} ${name}#(Integer n)(Bit#(n) x);
    return @e@;
endfunction`, blanks: { e: ans }, why });
      if (kind === "rotl") return one("rotl", "Bit#(n)", "rotates [[x]] left by one bit (the top bit moves to bit 0)", ["{x[n-2:0], x[n-1]}"], "The low n − 1 bits move up, and bit n − 1 goes to the bottom.");
      if (kind === "rotr") return one("rotr", "Bit#(n)", "rotates [[x]] right by one bit (bit 0 moves to the top)", ["{x[0], x[n-1:1]}"], "Bit 0 goes to the top, and the high n − 1 bits move down.");
      if (kind === "swap") return one("swapHalves", "Bit#(n)", "swaps the upper and lower halves of [[x]]", ["{x[n/2-1:0], x[n-1:n/2]}"], "The lower half becomes the upper half. Integer arithmetic such as n/2 is done at compile time.");
      const or = kind === "vor";
      return { title: "Parametric function over a Vector",
        task: `Write the parametric function [[${or ? "anyOf" : "vsum"}]], which returns the ${or ? "bitwise OR" : "sum (wrapping in w bits)"} of the n elements of [[v]].`,
        code: `function Bit#(w) ${or ? "anyOf" : "vsum"}#(Integer n, Integer w)(Vector#(n, Bit#(w)) v);
    Bit#(w) s = @init@;
    for (Integer i = 0; i < @bound@; i = i + 1) begin
        s = @body@;
    end
    return s;
endfunction`,
        blanks: { init: ["0"], bound: ["n"], body: either("s", or ? "|" : "+", "v[i]") },
        why: `The loop bound is the Integer parameter n, so the loop unrolls for each n that is used. 0 is the identity of ${or ? "OR" : "addition"}.` };
    },
  };

  function msWriteDrill(R) {
    const t = MSW[R.pick(Object.keys(MSW))](R);
    const f = fillTemplate(t.code, t.blanks);
    return { title: `Minispec writing: ${t.title}`,
      statement: `**${t.title}.** ${t.task}\n\nFill in each numbered blank with one expression. Spaces, extra parentheses, and the base of number literals do not matter. Some blanks have other correct answers than the ones the checker knows. If the checker marks your answer wrong, compare it with the solution.\n\n~~~\n${f.stmt}\n~~~`,
      grids: [], parts: f.parts, solution: `${t.why}\n\n~~~\n${f.sol}\n~~~` };
  }

  // ---------------------------------------------------------------- area and delay scaling
  const SCALE = [
    ["An n-bit ripple-carry adder", "n", "n"],
    ["An n-bit adder built from a parallel-prefix (carry-lookahead) network", "n log n", "log n"],
    ["An n-input AND built as a balanced tree of 2-input ANDs", "n", "log n"],
    ["An n-input AND built as a chain of 2-input ANDs", "n", "n"],
    ["An n-bit equality comparator (XNORs into an AND tree)", "n", "log n"],
    ["An n-to-1 multiplexer built as a tree of 2-to-1 muxes (1-bit data)", "n", "log n"],
    ["An n-bit by n-bit array multiplier built from ripple adders", "n^2", "n"],
    ["An n-bit barrel shifter (log n levels of muxes)", "n log n", "log n"],
    ["A Minispec function with a for loop that adds n numbers one after another (acc = acc + x[i])", "n", "n"],
    ["A Minispec function that adds n numbers with a balanced tree of adders (fixed-width numbers)", "n", "log n"],
    ["The read port of a register file with n registers (an n-to-1 mux of 32-bit values)", "n", "log n"],
    ["Counting the ones in an n-bit word with a tree of adders", "n", "log n"],
  ];
  const canon = (s) => s.toLowerCase().replace(/θ|theta|o\(|\(|\)|\s|\*/g, "").replace(/lg|log2/g, "log").replace(/²/g, "^2").replace(/nlogn|nlog\(n\)/, "nlogn");
  function scalingDrill(R) {
    const qs = R.shuffle(SCALE).slice(0, 4);
    const parts = qs.flatMap(([c, a, d]) => [{ q: `${c}: area Θ( )`, accept: [a], canon: true }, { q: `${c}: delay Θ( )`, accept: [d], canon: true }]);
    return { title: "Area and delay scaling", statement: "**Area and delay scaling.** For each circuit, give the area and the propagation delay as functions of n (for example 1, log n, n, n log n, n^2). Ignore fanout and wire delay.", grids: [], parts,
      solution: qs.map(([c, a, d]) => `- ${c}: area Θ(${a}), delay Θ(${d}).`).join("\n") };
  }

  // ---------------------------------------------------------------- composed pipelines
  function composeDrill(R) {
    const mk = () => { const k = R.int(1, 4), p = R.int(4, 12); return { k, p }; };
    const A = mk(), B = mk();
    const C = [mk(), mk(), mk()].map((c, i) => ({ ...c, name: ["1-stage", "2-stage", "max-throughput"][i] }));
    C[0].k = 1; C[1].k = 2; C[2].k = R.int(3, 5);
    C[0].p = R.int(18, 30); C[1].p = Math.ceil(C[0].p / 2) + R.int(0, 3); C[2].p = R.int(5, 9);
    const opts = C.map((c) => {
      const P = Math.max(A.p, B.p, c.p);
      const lat = (Math.max(A.k, B.k) + c.k) * P;
      return { ...c, P, lat };
    });
    const bestT = opts.slice().sort((x, y) => x.P - y.P || x.lat - y.lat)[0];
    const bestL = opts.slice().sort((x, y) => x.lat - y.lat || x.P - y.P)[0];
    const statement = `**Composing pipelines.** Modules M1 and M2 run in parallel and both feed module M3. Each is already pipelined: M1 has ${A.k} stage${A.k > 1 ? "s" : ""} with period ${A.p} ns, and M2 has ${B.k} stage${B.k > 1 ? "s" : ""} with period ${B.p} ns. M3 can be built three ways:

| M3 version | Stages | Period (ns) |
|---|---|---|
${C.map((c) => `| ${c.name} | ${c.k} | ${c.p} |`).join("\n")}

The whole system uses one clock. If M1 and M2 have different numbers of stages, the shorter one gets extra registers so both arrive together.

**(A)** Which M3 version gives the maximum throughput? (If there is a tie, choose the lower latency.) Give the system latency and throughput.

**(B)** Which version gives the minimum latency? (If there is a tie, choose the higher throughput.) Give the system latency and throughput.`;
    return { title: "Composing pipelined modules", statement, grids: [], parts: [
      { q: "(A) M3 version", accept: [bestT.name] }, { q: "(A) Latency (ns)", answer: String(bestT.lat) }, { q: "(A) Throughput (1/ns)", answer: `1/${bestT.P}` },
      { q: "(B) M3 version", accept: [bestL.name] }, { q: "(B) Latency (ns)", answer: String(bestL.lat) }, { q: "(B) Throughput (1/ns)", answer: `1/${bestL.P}` },
    ], solution: `The clock period is the slowest module's period, and the latency is (stages of the longer of M1, M2 + stages of M3) × period.\n\n| M3 version | Period (ns) | Stages | Latency (ns) |\n|---|---|---|---|\n${opts.map((o) => `| ${o.name} | ${o.P} | ${Math.max(A.k, B.k)} + ${o.k} | ${o.lat} |`).join("\n")}\n\n**(A)** ${bestT.name}: latency ${bestT.lat} ns, throughput $1/${bestT.P}$. **(B)** ${bestL.name}: latency ${bestL.lat} ns, throughput $1/${bestL.P}$.` };
  }

  const DRILLS = {
    pipeline: { name: "Pipeline diagrams", blurb: "Fill in a 5-stage pipeline diagram for a past-quiz loop or a randomly generated loop, under random bypass, branch, jump, and load-timing rules; then CPI, stalls, annulments, clock period, and the unpipelined comparison.", gen: pipelineDrill },
    pipestraight: { name: "Straight-line pipelines", blurb: "Fill in a diagram for random code from an empty pipeline, then count the NOPs a compiler must insert when there is no stall logic.", gen: pipeStraightDrill },
    pipecompare: { name: "Compare two processors", blurb: "The same loop on two processors with different bypass paths and branch timing: cycles per iteration, clock period, and which is faster.", gen: pipeCompareDrill },
    cachetrace: { name: "Cache traces", blurb: "Run a short program (with byte and halfword stores) through a direct-mapped, set-associative, or fully associative cache, unified or split; fill in the final cache and count hits, misses, and write-backs.", gen: cacheTraceDrill },
    cacheloop: { name: "Cache performance of loops", blurb: "Instruction and data hit ratios for array loops on unified or split caches of different shapes.", gen: cacheLoopDrill },
    cachegeom: { name: "Cache geometry and AMAT", blurb: "Address bit fields, bits per line, AMAT, and the hit ratio for a target AMAT.", gen: cacheGeometryDrill },
    kstage: { name: "Pipelining circuits", blurb: "Latency and throughput of combinational, max-throughput, 2- and 3-stage pipelines, and non-ideal registers, with a worked register placement.", gen: dagDrill },
    compose: { name: "Composed pipelines", blurb: "Pick a pipelined submodule for maximum throughput or minimum latency of a larger system (like PIZZA in Fall 2025).", gen: composeDrill },
    control: { name: "Decoder outputs", blurb: "Control signals for RISC-V instructions in the lecture single-cycle datapath.", gen: controlDrill },
    roles: { name: "Pipeline and cache facts", blurb: "What each stage does, hazards, stalls, annulment, and cache vocabulary.", gen: rolesDrill },
    minispec: { name: "Minispec over cycles", blurb: "Track FSM states, registers, and Maybe values cycle by cycle.", gen: minispecDrill },
    mswrite: { name: "Minispec writing", blurb: "Fill in the blanks of a Minispec template (like Fall 2025 P1): counters, FSMs, shift registers, loops, case statements, a serial transmitter, iterative modules, Maybe inputs, and parametric functions.", gen: msWriteDrill },
    scaling: { name: "Area and delay scaling", blurb: "Θ() area and delay of common circuits and Minispec patterns.", gen: scalingDrill },
  };
  function generate(type, seed) { figSeq = 0; return Object.assign({ type, seed }, DRILLS[type].gen(rng(seed))); }

  root.Drills6191 = { DRILLS, generate, canon, codeCanon, evalPlacement, rng, _runProgram: runProgram };
})(typeof window !== "undefined" ? window : globalThis);
