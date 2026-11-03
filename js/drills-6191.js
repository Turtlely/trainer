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
    { bypass: ["EXE", "MEM", "WB"], text: "full bypassing (EXE → DEC, MEM → DEC, WB → DEC)" },
    { bypass: [], text: "no bypass paths (a value can be read from the register file the cycle after the producer is in WB)" },
    { bypass: ["WB"], text: "only a WB → DEC bypass path" },
    { bypass: ["MEM", "WB"], text: "MEM → DEC and WB → DEC bypass paths (no EXE → DEC)" },
    { bypass: ["EXE", "WB"], text: "EXE → DEC and WB → DEC bypass paths (no MEM → DEC)" },
    { bypass: ["EXE", "MEM"], text: "EXE → DEC and MEM → DEC bypass paths (no WB → DEC)" },
  ];

  function pipelineDrill(R) {
    const loop = R.pick(LOOPS);
    const prog = parseProgram(loop.src);
    const head = prog.findIndex((i) => i.label === loop.head);
    const loopBranch = prog.map((ins, i) => ins.kind === "branch" && ins.ti === head ? i : -1).filter((i) => i >= 0).pop();
    const other = loop.other === "random" ? R.chance(0.5) : loop.other === true;
    const cfgPick = R.next() < 0.4 ? CONFIGS[0] : R.pick(CONFIGS);
    const branchIn = R.next() < 0.7 ? "EXE" : "DEC";
    const loadReady = R.next() < 0.8 ? "WB" : "MEM";
    const jalIn = branchIn === "DEC" ? "DEC" : R.next() < 0.7 ? "EXE" : "DEC";
    const cfg = { bypass: cfgPick.bypass, loadReady, branchIn, jalIn, taken: (si) => (si === loopBranch ? true : other) };
    const w = pipeWindow(prog, cfg, head, { iteration: 4 });
    const len = Math.min(w.len, 18);
    const start = 100;
    const otherBranches = prog.filter((ins, i) => ins.kind === "branch" && i !== loopBranch);
    const outcomeText = otherBranches.length ? ` ${otherBranches.map((b) => `[[${b.text}]]`).join(", ")} is **${other ? "always taken" : "never taken"}**.` : "";
    const delays = { IF: R.int(2, 5), DEC: R.int(3, 6), EXE: R.int(5, 10), MEM: R.int(4, 9), WB: R.int(2, 4), BYP: R.int(1, 2) };
    const byp = new Set(cfgPick.bypass);
    const paths = [["IF", delays.IF], ["DEC", delays.DEC + (byp.size ? delays.BYP : 0)]];
    for (const s of ["EXE", "MEM", "WB"]) paths.push([s, delays[s] + (byp.has(s) ? delays.BYP : 0)]);
    const tclk = Math.max(...paths.map((p) => p[1]));
    const crit = paths.find((p) => p[1] === tclk);
    const single = delays.IF + delays.DEC + delays.EXE + delays.MEM + delays.WB;
    const rows = STAGES.map((s) => w.rows[s].slice(0, len));
    const gray = rows.map((_, r) => rows[r].map((_, c) => c < r));
    const given = rows.map((_, r) => rows[r].map((_, c) => r === 0 && c === 0));
    const bypassAns = Array.from({ length: len }, (_, c) => w.arrows.filter(([s, , cc]) => cc === c && cc >= STAGES.indexOf(s)).map(([s]) => s));
    const colLabels = rows[0].map((_, c) => String(start + c));
    const spec = [
      `5-stage pipeline (IF, DEC, EXE, MEM, WB) with ${cfgPick.text}.`,
      `Branches are predicted not taken (fetch PC + 4) and resolve in **${branchIn}**; ${branchIn === "DEC" ? "a branch in DEC needs its source registers there, like any other instruction" : "instructions fetched after a taken branch are annulled"}.`,
      `Jumps ([[j]]/[[jal]]) redirect fetch in **${jalIn}**; [[ret]]/[[jalr]] resolve in ${branchIn}.`,
      `Load data is available for bypassing from the **${loadReady}** stage${loadReady === "WB" ? " (clocked data memory, as in lecture)" : " (data memory returns in the same cycle)"}.`,
      "The register file is written at the end of WB and read in DEC.",
    ];
    const statement = `**Pipeline diagram (${loop.name}).** This loop runs on a processor with these features:

${spec.map((s) => "- " + s).join("\n")}

~~~
${loop.src.trim()}
~~~

${loopBranch !== undefined ? "The loop branch is **always taken** (the loop runs many times)." : "The loop runs many times."}${outcomeText} The loop is in steady state. In cycle ${start} the instruction at [[${loop.head}]] is fetched.

**(A)** Fill in the pipeline diagram for cycles ${start} to ${start + len - 1}. Write NOP for a bubble or an annulled slot. Cells shaded gray belong to earlier iterations and are not graded. In the **Bypass** row, write the stage(s) that bypass a value into DEC in that cycle (EXE, MEM, or WB, separated by spaces), or leave it empty.

**(B)** Give the cycles per loop iteration, the cycles lost to stalls, and the cycles lost to annulments.

**(C)** The stage delays are IF ${delays.IF} ns, DEC ${delays.DEC} ns, EXE ${delays.EXE} ns, MEM ${delays.MEM} ns, WB ${delays.WB} ns, and the bypass muxes (in DEC) ${delays.BYP} ns. A bypassed value goes through its source stage and then the bypass muxes in the same cycle. Registers are ideal. Give the minimum clock period, the time per iteration, and the CPI of the loop. Then give the time per iteration on an unpipelined single-cycle processor built from the same logic (clock period = sum of the five stage delays, CPI = 1).`;
    const solPipe = F.pipe({ start, rows: Object.fromEntries(STAGES.map((s, r) => [s, rows[r].map((v, c) => (gray[r][c] ? "#" : v))])),
      arrows: w.arrows.filter(([s, , c]) => c < len && c >= STAGES.indexOf(s)).map(([s, , c]) => [s, "DEC", start + c]), cw: 44 });
    const solution = `**(A)**

${fig(solPipe)}

**(B)** One iteration takes **${w.period}** cycles: ${w.executed} instructions complete, ${w.stalls} cycle${w.stalls === 1 ? " is" : "s are"} lost to stalls, and ${w.annulled} to annulled instructions.

**(C)** The slowest path is ${crit[0]}${crit[0] !== "IF" && (crit[0] === "DEC" || byp.has(crit[0])) ? " + BYP" : ""}: $t_{CLK} = ${tclk}$ ns. One iteration takes $${w.period} \\cdot ${tclk} = ${w.period * tclk}$ ns. CPI $= ${w.period}/${w.executed}$. Unpipelined: $t_{CLK} = ${single}$ ns and ${w.executed} instructions take $${w.executed} \\cdot ${single} = ${w.executed * single}$ ns.`;
    return {
      title: `Pipeline diagram: ${loop.name}`,
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
    for (const v of nodes) {
      if (v.l === 0) continue;
      const prev = byL(v.l - 1);
      const k = Math.min(prev.length, R.int(1, 2));
      for (const u of R.shuffle(prev).slice(0, k)) edges.push([u.id, v.id]);
      if (v.l >= 2 && R.chance(0.25)) edges.push([R.pick(byL(v.l - 2)).id, v.id]);
    }
    for (const u of nodes) if (u.l < layers.length - 1 && !edges.some((e) => e[0] === u.id)) edges.push([u.id, R.pick(byL(u.l + 1)).id]);
    const inputs = byL(0).map((v, i) => [`@${"ABCD"[i]}`, v.id]);
    if (R.chance(0.5)) inputs.push([`@${"ABCD"[inputs.length]}`, R.pick(byL(1)).id]);
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
    inputs.forEach(([t, v], i) => { const n = nodes.find((x) => x.id === v); gn[t] = [n.l === 0 ? 30 : X(n.l) - 60, n.l === 0 ? Y(0, n.i) : Y(n.l, n.i) + 30, t.slice(1)]; });
    outs.forEach(([v, t]) => { const n = nodes.find((x) => x.id === v); gn[t] = [X(n.l) + 80, Y(n.l, n.i), t.slice(1)]; });
    const allE = [...inputs.map(([a, b]) => `${a}>${b}`), ...edges.map(([a, b]) => `${a}>${b}`), ...outs.map(([a, b]) => `${a}>${b}`)];
    const W = X(layers.length - 1) + 110, H = 40 + 3 * 70 + 10;
    const draw = (regs) => F.svg(W, H, F.graph(gn, allE, { regs, rc: "acc" }));
    const regsFor = ({ st, K }) => {
      const r = {};
      for (const [a, b] of edges) if (st[b] - st[a] > 0) r[`${a}>${b}`] = st[b] - st[a];
      for (const [a, b] of inputs) if (st[b] - 1 > 0) r[`${a}>${b}`] = st[b] - 1;
      for (const [a, b] of outs) r[`${a}>${b}`] = K - st[a] + 1;
      return r;
    };
    const statement = `**Pipelining a circuit.** Each component shows its propagation delay. Registers are ideal unless a part says otherwise, and every pipeline has a register on each output.

${fig(draw({}))}

**(A)** What are the latency and throughput of the combinational circuit (a 1-stage pipeline)?

**(B)** Pipeline the circuit for maximum throughput. Give the latency and throughput.

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

${fig(draw(regsFor(assign(P2))))}

**(D)** $t_{CLK} = ${P} + t_{PD} + t_{SETUP} = ${Pr}$ ns. Latency $${K} \\cdot ${Pr} = ${K * Pr}$ ns, throughput $1/${Pr}$.`;
    return { title: "Pipelining a circuit (K-stage)", statement, grids: [], parts, solution };
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
    pipeline: { name: "Pipeline diagrams", blurb: "Fill in a 5-stage pipeline diagram for a loop, under random bypass, branch, jump, and load-timing rules; then CPI, stalls, annulments, clock period, and the unpipelined comparison.", gen: pipelineDrill },
    cachetrace: { name: "Cache traces", blurb: "Run a short program (with byte and halfword stores) through a direct-mapped, set-associative, or fully associative cache, unified or split; fill in the final cache and count hits, misses, and write-backs.", gen: cacheTraceDrill },
    cacheloop: { name: "Cache performance of loops", blurb: "Instruction and data hit ratios for array loops on unified or split caches of different shapes.", gen: cacheLoopDrill },
    cachegeom: { name: "Cache geometry and AMAT", blurb: "Address bit fields, bits per line, AMAT, and the hit ratio for a target AMAT.", gen: cacheGeometryDrill },
    kstage: { name: "Pipelining circuits", blurb: "Latency and throughput of combinational, max-throughput, 2- and 3-stage pipelines, and non-ideal registers, with a worked register placement.", gen: dagDrill },
    compose: { name: "Composed pipelines", blurb: "Pick a pipelined submodule for maximum throughput or minimum latency of a larger system (like PIZZA in Fall 2025).", gen: composeDrill },
    control: { name: "Decoder outputs", blurb: "Control signals for RISC-V instructions in the lecture single-cycle datapath.", gen: controlDrill },
    roles: { name: "Pipeline and cache facts", blurb: "What each stage does, hazards, stalls, annulment, and cache vocabulary.", gen: rolesDrill },
    minispec: { name: "Minispec over cycles", blurb: "Track FSM states, registers, and Maybe values cycle by cycle.", gen: minispecDrill },
    scaling: { name: "Area and delay scaling", blurb: "Θ() area and delay of common circuits and Minispec patterns.", gen: scalingDrill },
  };
  function generate(type, seed) { figSeq = 0; return Object.assign({ type, seed }, DRILLS[type].gen(rng(seed))); }

  root.Drills6191 = { DRILLS, generate, canon, rng, _runProgram: runProgram };
})(typeof window !== "undefined" ? window : globalThis);
