// Simulators for the 6.191 drills: a 5-stage RISC-V pipeline (cycle-level, as drawn in
// 6.191 pipeline diagrams) and a cache. Pure functions, so scripts/check-sim.js can test them
// against the official diagrams.
(function (root) {
  // ---------------------------------------------------------------- assembly
  const ABI = { zero: 0, ra: 1, sp: 2, gp: 3, tp: 4, t0: 5, t1: 6, t2: 7, s0: 8, fp: 8, s1: 9, a0: 10, a1: 11, a2: 12, a3: 13,
    a4: 14, a5: 15, a6: 16, a7: 17, s2: 18, s3: 19, s4: 20, s5: 21, s6: 22, s7: 23, s8: 24, s9: 25, s10: 26, s11: 27, t3: 28, t4: 29, t5: 30, t6: 31 };
  const reg = (s) => { s = s.trim(); if (/^x\d+$/.test(s)) return +s.slice(1); if (s in ABI) return ABI[s]; throw new Error("bad register " + s); };
  const R3 = "add sub and or xor sll srl sra slt sltu mul mulh".split(" ");
  const I2 = "addi andi ori xori slli srli srai slti sltiu".split(" ");
  const LOADS = "lw lh lb lhu lbu".split(" ");
  const STORES = "sw sh sb".split(" ");
  const BR2 = "beq bne blt bge bltu bgeu bgt ble".split(" ");
  const BR1 = "beqz bnez bltz bgez blez bgtz".split(" ");

  // Parses one line like "loop: lw a1, 0(a0)  // comment" into an instruction record.
  function parseLine(line) {
    line = line.replace(/\/\/.*$|#.*$/, "").trim();
    let label = null;
    const m = line.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (m) { label = m[1]; line = m[2]; }
    if (!line) return { label, empty: true };
    const op = line.split(/\s+/)[0].toLowerCase();
    const args = line.slice(op.length).split(",").map((a) => a.trim()).filter(Boolean);
    const ins = { label, op, text: line, rd: 0, src: [], kind: "alu" };
    const mem = (a) => { const mm = a.match(/^(.*)\((\w+)\)$/); return mm ? reg(mm[2]) : reg(a); };
    if (R3.includes(op)) { ins.rd = reg(args[0]); ins.src = [reg(args[1]), reg(args[2])]; }
    else if (I2.includes(op)) { ins.rd = reg(args[0]); ins.src = [reg(args[1])]; }
    else if (op === "mv" || op === "neg" || op === "not" || op === "seqz" || op === "snez") { ins.rd = reg(args[0]); ins.src = [reg(args[1])]; }
    else if (op === "li" || op === "lui" || op === "auipc" || op === "la") { ins.rd = reg(args[0]); }
    else if (LOADS.includes(op)) { ins.rd = reg(args[0]); ins.src = [mem(args[1])]; ins.kind = "load"; }
    else if (STORES.includes(op)) { ins.src = [reg(args[0]), mem(args[1])]; ins.kind = "store"; }
    else if (BR2.includes(op)) { ins.src = [reg(args[0]), reg(args[1])]; ins.kind = "branch"; ins.target = args[2]; }
    else if (BR1.includes(op)) { ins.src = [reg(args[0])]; ins.kind = "branch"; ins.target = args[1]; }
    else if (op === "j") { ins.kind = "jal"; ins.target = args[0]; }
    else if (op === "jal") { ins.kind = "jal"; if (args.length === 2) { ins.rd = reg(args[0]); ins.target = args[1]; } else { ins.rd = 1; ins.target = args[0]; } }
    else if (op === "call") { ins.kind = "jal"; ins.rd = 1; ins.target = args[0]; }
    else if (op === "jr") { ins.kind = "jalr"; ins.src = [reg(args[0])]; }
    else if (op === "ret") { ins.kind = "jalr"; ins.src = [1]; }
    else if (op === "jalr") { ins.kind = "jalr"; ins.rd = reg(args[0]); ins.src = [mem(args[1] || args[0])]; }
    else if (op === "nop" || op === "unimp" || op === "ecall") { ins.kind = "nop"; }
    else throw new Error("unknown op " + op);
    ins.src = ins.src.filter((r) => r !== 0);
    return ins;
  }
  function parseProgram(src) {
    const prog = [];
    let pending = null;
    for (const line of src.split("\n")) {
      const ins = parseLine(line);
      if (ins.empty) { if (ins.label) pending = ins.label; continue; }
      if (!ins.label && pending) ins.label = pending;
      pending = null;
      prog.push(ins);
    }
    const labels = {};
    prog.forEach((ins, i) => { if (ins.label) labels[ins.label] = i; });
    prog.forEach((ins) => { if (ins.target !== undefined) { if (!(ins.target in labels)) throw new Error("no label " + ins.target); ins.ti = labels[ins.target]; } });
    return prog;
  }

  // ---------------------------------------------------------------- pipeline
  // cfg: {
  //   bypass: subset of ["EXE", "MEM", "WB"]: stages that bypass to DEC (full bypassing = all three),
  //   loadReady: "WB" (standard: load data returns in WB) or "MEM",
  //   branchIn: "EXE" or "DEC" (where branches and jalr resolve; DEC needs their operands in DEC),
  //   jalIn: "EXE" or "DEC",
  //   taken(staticIndex, occurrence) -> bool  (branch outcomes; predicted not taken),
  // }
  // Returns { rows: { IF, DEC, EXE, MEM, WB } arrays of names, arrows: [[fromStage, "DEC", cycle]],
  //   fetches: [{ si, cycle, annulled }], stalls (cycle list), cycles }.
  const STAGES = ["IF", "DEC", "EXE", "MEM", "WB"];
  function simulate(prog, cfg, nCycles = 80, startSi = 0) {
    const bypass = new Set(cfg.bypass);
    const readyIdx = { alu: 2, jal: 2, jalr: 2, load: cfg.loadReady === "MEM" ? 3 : 4 };
    const branchIn = cfg.branchIn || "EXE", jalIn = cfg.jalIn || branchIn;
    const occ = {}; // branch occurrences resolved so far, per static index
    let seq = 0;
    let fetchSi = startSi;
    const mk = (si) => (si >= 0 && si < prog.length ? { si, seq: seq++, ins: prog[si] } : { nop: true });
    const NOP = () => ({ nop: true });
    let st = { IF: mk(fetchSi++), DEC: NOP(), EXE: NOP(), MEM: NOP(), WB: NOP() };
    const issued = []; // { ins, seq, exeCycle } for instructions that left DEC
    const rows = { IF: [], DEC: [], EXE: [], MEM: [], WB: [] };
    const arrows = [], fetches = [{ si: startSi, cycle: 0 }], stalls = [];
    const name = (e) => (e.nop ? "NOP" : e.ins.op);
    // Where the value of register r for instruction d comes from at cycle c: null (stall), "RF", or a stage.
    function source(d, r, c) {
      for (let k = issued.length - 1; k >= 0; k--) {
        const p = issued[k];
        if (p.seq >= d.seq || p.ins.rd !== r) continue;
        const idx = c - p.exeCycle + 2; // stage index of p at cycle c
        if (idx > 4) return "RF";
        const ready = readyIdx[p.ins.kind] ?? 2;
        if (idx >= ready && bypass.has(STAGES[idx])) return STAGES[idx];
        return null;
      }
      return "RF";
    }
    const takenNow = (e) => {
      const k = (occ[e.si] = (occ[e.si] ?? -1) + 1);
      return cfg.taken(e.si, k);
    };
    for (let c = 0; c < nCycles; c++) {
      for (const s of STAGES) rows[s].push(name(st[s]));
      const next = { WB: st.MEM, MEM: st.EXE };
      // 1. redirect from EXE
      let redirect = null;
      const e = st.EXE;
      if (!e.nop) {
        const k = e.ins.kind;
        if ((k === "branch" && branchIn === "EXE" && takenNow(e)) || (k === "jal" && jalIn === "EXE") || (k === "jalr" && branchIn === "EXE")) {
          redirect = k === "jalr" ? (cfg.jalrTarget ? cfg.jalrTarget(e.si) : 0) : e.ins.ti;
        }
      }
      if (redirect !== null) {
        // The annulled DEC instruction still reads its operands this cycle (diagrams draw that bypass).
        if (!st.DEC.nop) {
          const srcs = st.DEC.ins.src.map((r) => source(st.DEC, r, c));
          if (!srcs.includes(null)) for (const s of new Set(srcs)) if (s !== "RF") arrows.push([s, "DEC", c]);
        }
        if (!st.DEC.nop) fetches.find((f) => f.seq === st.DEC.seq) && (fetches.find((f) => f.seq === st.DEC.seq).annulled = true);
        if (!st.IF.nop) fetches.find((f) => f.seq === st.IF.seq) && (fetches.find((f) => f.seq === st.IF.seq).annulled = true);
        next.EXE = NOP(); next.DEC = NOP();
        fetchSi = redirect;
        next.IF = mk(fetchSi++); fetches.push({ si: next.IF.si, cycle: c + 1, seq: next.IF.seq });
      } else {
        const d = st.DEC;
        let stall = false, srcs = [];
        if (!d.nop) {
          for (const r of d.ins.src) { const s = source(d, r, c); if (s === null) stall = true; else srcs.push(s); }
        }
        let decRedirect = null;
        if (!d.nop && !stall) {
          const k = d.ins.kind;
          if ((k === "branch" && branchIn === "DEC" && takenNow(d)) || (k === "jal" && jalIn === "DEC") || (k === "jalr" && branchIn === "DEC")) {
            decRedirect = k === "jalr" ? (cfg.jalrTarget ? cfg.jalrTarget(d.si) : 0) : d.ins.ti;
          }
        }
        if (stall) {
          stalls.push(c);
          next.EXE = NOP(); next.DEC = st.DEC; next.IF = st.IF;
        } else {
          if (!d.nop) { issued.push({ ins: d.ins, seq: d.seq, exeCycle: c + 1 }); for (const s of new Set(srcs)) if (s !== "RF") arrows.push([s, "DEC", c]); }
          next.EXE = d;
          if (decRedirect !== null) {
            const f = fetches.find((x) => x.seq === st.IF.seq); if (f && !st.IF.nop) f.annulled = true;
            next.DEC = NOP(); fetchSi = decRedirect;
          } else next.DEC = st.IF;
          next.IF = mk(fetchSi++); fetches.push({ si: next.IF.si, cycle: c + 1, seq: next.IF.seq });
        }
      }
      st = next;
    }
    return { rows, arrows, fetches, stalls, cycles: nCycles };
  }

  // Steady-state window: starts when the loop head (static index head) is fetched for the
  // iteration-th time (not annulled). Returns rows sliced to [start, start + len), arrows in the
  // window, and per-iteration counts.
  function window(prog, cfg, head, opts = {}) {
    const iter = opts.iteration ?? 4;
    const sim = simulate(prog, cfg, opts.cycles || 160, opts.startSi || 0);
    const heads = [];
    for (const f of sim.fetches) if (f.si === head && !f.annulled && !heads.some((h) => h.cycle === f.cycle)) heads.push(f);
    // A fetch of the head repeats while IF stalls; keep the first cycle of each distinct fetch (seq).
    const uniq = [];
    for (const f of sim.fetches) if (f.si === head && !f.annulled && !uniq.some((u) => u.seq === f.seq)) uniq.push(f);
    const start = uniq[iter].cycle, nextStart = uniq[iter + 1].cycle;
    const period = nextStart - start;
    const len = opts.len || Math.min(Math.max(period + 2, 10), 16);
    const rows = {};
    for (const s of STAGES) rows[s] = sim.rows[s].slice(start, start + len);
    const arrows = sim.arrows.filter(([, , c]) => c >= start && c < start + len).map(([a, b, c]) => [a, b, c - start]);
    // counts for one iteration: instructions completed (non-NOP leaving WB), annulled fetches
    let executed = 0;
    for (let c = start + 4; c < nextStart + 4; c++) if (sim.rows.WB[c] !== "NOP") executed++;
    const seqs = sim.fetches.filter((f) => f.cycle >= start && f.cycle < nextStart && f.seq !== undefined);
    const annulled = new Set(seqs.filter((f) => f.annulled).map((f) => f.seq)).size;
    const stalls = period - executed - annulled;
    return { rows, arrows, period, executed, annulled, stalls, start, len };
  }

  // ---------------------------------------------------------------- cache
  // cfg: { words (total data words), block (words per line), ways (1 = direct mapped;
  //   ways = words / block = fully associative), writeBack: true }. LRU replacement.
  function makeCache(cfg) {
    const lines = cfg.words / cfg.block, sets = lines / cfg.ways;
    const S = Array.from({ length: sets }, () => Array.from({ length: cfg.ways }, () => ({ v: 0, d: 0, tag: 0, data: Array(cfg.block).fill(null), lru: 0 })));
    let clock = 0;
    const stats = { hits: 0, misses: 0, writebacks: [] };
    const offBits = Math.log2(cfg.block) + 2, idxBits = Math.log2(sets);
    const split = (addr) => ({ word: (addr >>> 2) % cfg.block, set: (addr >>> offBits) % sets, tag: addr >>> (offBits + idxBits) });
    // access(addr, write, mem, newWord?) where mem.read(wordAddr) gives the word; returns {hit}
    function access(addr, mem, write, newWordFn, label) {
      const { word, set, tag } = split(addr);
      const ways = S[set];
      let w = ways.findIndex((x) => x.v && x.tag === tag);
      const hit = w >= 0;
      if (hit) stats.hits++; else {
        stats.misses++;
        w = ways.findIndex((x) => !x.v);
        if (w < 0) w = ways.reduce((b, x, i) => (x.lru < ways[b].lru ? i : b), 0);
        const victim = ways[w];
        if (victim.v && victim.d) {
          const base = ((victim.tag << idxBits) | set) << offBits;
          for (let i = 0; i < cfg.block; i++) { stats.writebacks.push({ addr: base + 4 * i, value: victim.data[i] }); mem.write(base + 4 * i, victim.data[i]); }
        }
        const base = addr - (addr % (cfg.block * 4));
        Object.assign(victim, { v: 1, d: 0, tag, data: Array.from({ length: cfg.block }, (_, i) => mem.read(base + 4 * i)) });
      }
      const line = ways[w];
      line.lru = ++clock;
      if (write) { line.data[word] = newWordFn(line.data[word]); if (cfg.writeBack !== false) line.d = 1; }
      return { hit, set, way: w, word, tag, value: line.data[word] };
    }
    return { S, stats, access, split, sets, offBits, idxBits };
  }

  root.Sim6191 = { parseProgram, simulate, window, makeCache, STAGES, reg };
})(typeof window !== "undefined" ? window : globalThis);
