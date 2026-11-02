// Real 6.191 problems: the Quiz 2 exams from Fall 2025, Spring 2025, and Spring 2026, and the
// Fall 2026 lecture worksheets for L7-L15. The transcribed text and redrawn figures are in
// js/real-6191-quiz.js and js/real-6191-ws.js, under each problem's "img" key. Numeric parts
// have answer boxes graded against the official answers; other parts are self-checked.
(function (root) {
  const t = String.raw;
  const P = [];

  const TERM = { fa25: "Fall 2025", sp25: "Spring 2025", sp26: "Spring 2026" };

  // part(label, answer): one graded box. Labels use the quiz's own part letters.
  const part = (q, answer) => ({ q, answer });

  // quiz(id, term, n, lec, title, topics, parts, note)
  const quiz = (id, term, n, lec, title, topics, parts, note = "") => P.push({
    id, lec, title: `${title} (${TERM[term]} Q2 P${n})`, diff: "Hard", topics, parts,
    real: "quiz", source: `${TERM[term]} Quiz 2, Problem ${n}`, img: `q2${term}-p${n}`,
    statement: note, hints: [], solution: "",
  });

  // ws(id, lec, n, title, topics, parts, note)
  const ws = (id, lec, n, title, topics, parts = [], note = "") => P.push({
    id, lec, title: `${title} (L${lec} worksheet P${n})`, diff: "Medium", topics, parts,
    real: "worksheet", source: `Fall 2026 L${lec} worksheet, Problem ${n}`, img: `l${String(lec).padStart(2, "0")}-p${n}`,
    statement: note, hints: [], solution: "",
  });

  // ---------------------------------------------------------------- Fall 2025 Quiz 2
  quiz(1501, "fa25", 1, 7, "UART transmit and receive in Minispec", ["Minispec", "FSM"], [],
    t`All parts are code and register tables. Write them on paper, then compare with the official solution.`);
  quiz(1502, "fa25", 2, 8, "Pipelining ASSEMBLE, DOUGH, SAUCE, and PIZZA", ["Pipelining", "Contours"], [
    part(t`(A) 1-stage latency (ns)`, "27"), part(t`(A) 1-stage throughput (1/ns)`, "1/27"),
    part(t`(B) 2-stage latency (ns)`, "30"), part(t`(B) 2-stage throughput (1/ns)`, "1/15"),
    part(t`(C) Max-throughput latency (ns)`, "35"), part(t`(C) Max-throughput throughput (1/ns)`, "1/7"),
    part(t`(D) DOUGH latency (ns)`, "33"), part(t`(D) DOUGH throughput (1/ns)`, "1/11"),
    part(t`(D) SAUCE latency (ns)`, "21"), part(t`(D) SAUCE throughput (1/ns)`, "1/7"),
    part(t`(E1) PIZZA latency for max throughput (ns)`, "88"), part(t`(E1) PIZZA throughput (1/ns)`, "1/11"),
    part(t`(E2) PIZZA latency for min latency (ns)`, "75"), part(t`(E2) PIZZA throughput (1/ns)`, "1/15"),
  ], t`Draw the contours on paper. The boxes grade the latency and throughput values.`);
  quiz(1503, "fa25", 3, 11, "Adding a multiply-accumulate instruction", ["RISC-V Processor", "Datapath", "Control Signals"], [],
    t`All parts are datapath wiring and decoder tables. Compare your work with the official solution.`);
  quiz(1504, "fa25", 4, 13, "Direct-mapped and fully associative cache traces", ["Caches", "Write-Back"], [
    part(t`(B) Instruction hits`, "3"), part(t`(B) Instruction misses`, "1"),
    part(t`(B) Data hits`, "1"), part(t`(B) Data misses`, "3"),
    part(t`(C) Value written back to Mem[0x234]`, "0x0A00000D"), part(t`(C) Value written back to Mem[0x238]`, "0xA"),
    part(t`(D) Final value of x2`, "0xA"), part(t`(D) Final value of x3`, "0x1D"),
    part(t`(E) Number of instruction fetches`, "122"), part(t`(E) Instruction-fetch hit rate`, "59/61"),
    part(t`(F) Number of data accesses`, "40"), part(t`(F) Data hit rate`, "1/2"),
  ], t`Part (A) is the final cache table. Compare it with the official solution.`);
  quiz(1505, "fa25", 5, 15, "sh/lw/sw loop: branch in DEC and delayed stalling", ["Pipeline Diagrams", "Bypassing", "Control Hazards"], [
    part(t`(C) Cycles per iteration, original processor`, "10"), part(t`(C) Cycles per iteration, advanced processor`, "8"),
    part(t`(D) Minimum clock period, original (ns)`, "350"), part(t`(D) Time per iteration, original (ns)`, "3500"),
    part(t`(D) Minimum clock period, advanced (ns)`, "400"), part(t`(D) Time per iteration, advanced (ns)`, "3200"),
  ], t`Parts (A) and (B) are pipeline diagrams. Fill them in on paper.`);
  quiz(1506, "fa25", 6, 15, "Pipelined processor with tiny caches; broken processors", ["Performance", "Caches", "Pipeline Diagrams"], [
    part(t`(A) Average CPI for the benchmark`, "49/24"),
    part(t`(B) Sum in a1 computed by Processor A`, "0x04030201"), part(t`(B) Sum in a1 computed by Processor B`, "0x88766452"),
  ], t`Part (A) also asks for the pipeline diagram, and part (B) for the matching diagram numbers. Check those with the official solution.`);

  // ---------------------------------------------------------------- Spring 2025 Quiz 2
  quiz(1507, "sp25", 1, 7, "Game of Life in Minispec, plain and folded", ["Minispec", "Folding", "Throughput"], [],
    t`All parts are code and order-of-growth answers. Compare your work with the official solution.`);
  quiz(1508, "sp25", 2, 8, "Convoluted arithmetic pipelines", ["Pipelining", "Contours"], [
    part(t`(A) $t_{PD}$ of the combinational circuit (ns)`, "31"),
    part(t`(B) 3-stage latency (ns)`, "36"), part(t`(B) 3-stage throughput (1/ns)`, "1/12"),
    part(t`(C) Max-throughput latency (ns)`, "40"), part(t`(C) Max-throughput throughput (1/ns)`, "1/8"),
    part(t`(D) Latency with $t_{PD}=t_{SETUP}=1$ registers (ns)`, "50"), part(t`(D) Throughput with those registers (1/ns)`, "1/10"),
    part(t`(E) Latency with the pipelined 8 ns module (ns)`, "28"), part(t`(E) Throughput (1/ns)`, "1/7"),
  ]);
  quiz(1509, "sp25", 3, 11, "xchgv and interrupts in the single-cycle processor", ["RISC-V Processor", "Datapath", "Control Signals"], [
    part(t`(A) imm for [[lui x15, 0xfff00]]`, "0xfff00000"), part(t`(A) rs1 for [[lui]]`, "0"),
    part(t`(C) wdSel for [[xchgv x6, x9]] (new mux input)`, "3"), part(t`(D) rd when the interrupt is asserted`, "31"),
  ], t`Wire the datapath on paper. The boxes grade a few decoder values; check the full tables with the official solution.`);
  quiz(1510, "sp25", 4, 13, "Frodo's and Sam's caches", ["Caches", "Address Breakdown", "AMAT"], [
    part(t`(A) Required hit ratio`, "7/8"),
    part(t`(B) 2-way cache: lowest tag bit`, "4"), part(t`(B) 2-way cache: index bit`, "3"),
    part(t`(C) Direct-mapped cache: lowest tag bit`, "5"), part(t`(C) Direct-mapped cache: highest index bit`, "4"),
    part(t`(D) Total bits in Sam's cache`, "372"),
    part(t`(E) Steady-state hit ratio, Frodo's 2-way cache`, "7/8"), part(t`(F) Steady-state hit ratio, Sam's direct-mapped cache`, "7/8"),
    part(t`(G) Steady-state hit ratio, new pattern on the 2-way cache`, "3/4"),
  ], t`Part (H) is a hit/miss table. Compare it with the official solution.`);
  quiz(1511, "sp25", 5, 15, "Software can fix everything: inserting NOPs", ["Hazards", "Stalls"], [
    part(t`(A) Minimum NOPs`, "0"), part(t`(B) Minimum NOPs`, "3"), part(t`(C) Minimum NOPs`, "3"),
    part(t`(D) Minimum NOPs`, "3"), part(t`(E) Minimum NOPs`, "1"), part(t`(F) Minimum NOPs (total)`, "4"),
  ], t`Enter the total number of NOPs each snippet needs. The official solution also shows where they go.`);
  quiz(1512, "sp25", 6, 15, "Fibonacci loop: 5-stage vs merged EXE/MEM", ["Performance", "Pipeline Diagrams", "CPI"], [
    part(t`(A) Cycles per iteration`, "11"), part(t`(A) Cycles lost to stalls`, "2"), part(t`(A) Cycles lost to annulments`, "2"),
    part(t`(A) Minimum clock period (ns)`, "8"), part(t`(A) Time per iteration (ns)`, "88"),
    part(t`(B) Cycles per iteration, 4-stage`, "10"), part(t`(B) Cycles lost to stalls`, "1"), part(t`(B) Cycles lost to annulments`, "2"),
    part(t`(B) Minimum clock period (ns)`, "14"), part(t`(B) Time per iteration (ns)`, "140"),
    part(t`(C) Cycles per iteration, rewritten loop`, "7"), part(t`(C) Time per iteration (ns)`, "56"),
  ], t`Fill in the pipeline diagrams on paper too.`);

  // ---------------------------------------------------------------- Spring 2026 Quiz 2
  quiz(1513, "sp26", 1, 7, "Deserializer and Serializer", ["Minispec", "Registers"], [],
    t`Part (A) is a cycle table and part (B) is code. Compare your work with the official solution.`);
  quiz(1514, "sp26", 2, 8, "Find the Bit: pipelining for throughput and latency", ["Pipelining", "Contours"], [
    part(t`(A) 1-stage latency (ns)`, "25"), part(t`(A) 1-stage throughput (1/ns)`, "1/25"),
    part(t`(B) Max-throughput latency (ns)`, "32"), part(t`(B) Max-throughput throughput (1/ns)`, "1/8"),
    part(t`(C) Latency with the 2-stage component (ns)`, "30"), part(t`(C) Throughput (1/ns)`, "1/5"),
    part(t`(E) Latency with non-ideal registers (ns)`, "40"), part(t`(E) Throughput (1/ns)`, "1/10"),
  ], t`Part (D) is a choice. Check it with the official solution.`);
  quiz(1515, "sp26", 3, 11, "repclear: a repeating clear instruction", ["RISC-V Processor", "Datapath", "Control Signals"], [
    part(t`(C) offsetReset for non-repclear instructions`, "1"),
    part(t`(D) MDSEL for repclear`, "0"), part(t`(D) MASEL for repclear`, "1"), part(t`(D) WASEL for repclear`, "0"),
    part(t`(E) imm for repclear`, "1"), part(t`(E) BSEL for repclear`, "1"), part(t`(E) PCSEL for repclear`, "0"),
  ], t`Parts (A), (B), and the rest of (E) name signals. Check them with the official solution.`);
  quiz(1516, "sp26", 4, 13, "Cache reverse engineering", ["Caches", "Address Breakdown", "Block Size", "AMAT"], [
    part(t`(A) Direct-mapped index: highest bit`, "7"), part(t`(A) Direct-mapped index: lowest bit`, "4"),
    part(t`(A) 2-way index: highest bit`, "6"), part(t`(A) 2-way index: lowest bit`, "4"),
    part(t`(C) Hit ratio with the other cache type`, "1/4"),
    part(t`(D) Hit ratio with 8-word blocks`, "15/16"), part(t`(E) Block size for a 50% hit ratio (words)`, "1"),
    part(t`(F) Block size for a 7/8 hit ratio (words)`, "4"), part(t`(G) Data cache access time (cycles)`, "2"),
  ], t`Part (B) is a choice. Check it with the official solution.`);
  quiz(1517, "sp26", 5, 15, "Linked-list sum with loads returned in MEM", ["Pipeline Diagrams", "Bypassing", "CPI"], [
    part(t`(A) Average CPI, no bypassing`, "11/6"), part(t`(B) Average CPI, full bypassing and jal in DEC`, "4/3"),
  ], t`Fill in both pipeline diagrams on paper. Part (C) asks which lines to swap; check it with the official solution.`);
  quiz(1518, "sp26", 6, 15, "Cheapest flight: MEM split and a branch predictor", ["Performance", "Pipeline Diagrams", "Control Hazards"], [
    part(t`(A) Minimum clock period (ns)`, "22"), part(t`(A) Cycles per iteration`, "11"), part(t`(A) Time per iteration (ns)`, "242"),
    part(t`(B) Minimum clock period with MEM1/MEM2 (ns)`, "17"),
    part(t`(C) Minimum clock period with the predictor (ns)`, "22"), part(t`(C) Cycles per iteration`, "7"),
    part(t`(C) Time per iteration (ns)`, "154"),
  ], t`Fill in the pipeline diagrams on paper. Part (B) also has a multiple-choice question; check it with the official solution.`);

  // ---------------------------------------------------------------- Fall 2026 worksheets, L7-L15
  // Worksheet problems are self-checked against the official worksheet solutions.
  ws(1601, 7, 1, "Combination-lock FSM in Minispec", ["Minispec", "FSM"]);
  ws(1602, 7, 2, "Lock8 from two Lock4 modules", ["Minispec", "Registers"]);
  ws(1603, 7, 3, "Parametric Lock#(n)", ["Minispec", "Parametric Modules"]);
  ws(1604, 7, 4, "Sequential Fibonacci circuit", ["Minispec", "Sequential Algorithms"]);
  ws(1605, 7, 5, "Sequential factorial circuit", ["Minispec", "Sequential Algorithms"]);
  ws(1606, 7, 6, "Dogecoin miner (Fall 2019 quiz)", ["Minispec", "Sequential Algorithms"]);
  ws(1607, 7, 7, "FindLongestBitRun (Spring 2020 quiz)", ["Minispec", "Sequential Algorithms"]);
  ws(1608, 7, 8, "Power-of-2 detector on the last 2 inputs (Fall 2020 quiz)", ["Minispec", "FSM"]);
  ws(1609, 8, 1, "K-stage pipelines of a simple circuit", ["Pipelining", "Contours"]);
  ws(1610, 8, 2, "Pipelining a 4-input circuit", ["Pipelining", "Contours"]);
  ws(1611, 8, 3, "The government agency's device", ["Pipelining", "Latency"]);
  ws(1612, 8, 4, "Pipelining six full adders (F = A + B + 5)", ["Pipelining", "Throughput"]);
  ws(1613, 8, 5, "Circuit with inputs X and Y", ["Pipelining", "Contours"]);
  ws(1614, 8, 6, "NAND-gate circuit with non-ideal registers", ["Pipelining", "Timing"]);
  ws(1615, 8, 7, "Pipelining F(X,Y) and G(X,Y)", ["Pipelining", "Contours"]);
  ws(1616, 9, 1, "Adding four 32-bit numbers: combinational to pipelined", ["Minispec", "Pipelining", "Maybe Types"]);
  ws(1617, 9, 2, "Parametric PipelinedAddN", ["Minispec", "Pipelining", "Parametric Modules"]);
  ws(1618, 9, 3, "Multi-cycle circuits in parallel", ["Folding", "Throughput"]);
  ws(1619, 9, 4, "Pricing three multiplier modules", ["Throughput", "Latency"]);
  ws(1620, 10, 1, "Instruction following", ["RISC-V Assembly"]);
  ws(1621, 10, 2, "Pseudo-instruction deconstruction", ["RISC-V Assembly", "Pseudoinstructions"]);
  ws(1622, 10, 3, "Compiling popcount by hand", ["RISC-V Assembly", "Loops"]);
  ws(1623, 10, 4, "Intermediate representation optimization", ["Compilers"]);
  ws(1624, 10, 5, "Two ways to compute factorial", ["RISC-V Assembly", "Procedures"]);
  ws(1625, 10, 6, "Protocols and procedures: calling conventions", ["RISC-V Assembly", "Calling Convention"]);
  ws(1626, 10, 7, "To save or not to save", ["RISC-V Assembly", "Calling Convention"]);
  ws(1627, 10, 8, "Using the stack: greaterthan", ["RISC-V Assembly", "Stack"]);
  ws(1628, 11, 1, "Decode two 32-bit instructions", ["RISC-V Processor", "Instruction Encoding"]);
  ws(1629, 11, 2, "Adding BGT to the processor", ["RISC-V Processor", "Branches"]);
  ws(1630, 11, 3, "Datapath changes for LUI", ["RISC-V Processor", "Immediates"]);
  ws(1631, 11, 4, "Conditional move cmvz", ["RISC-V Processor", "Datapath"]);
  ws(1632, 11, 5, "Adding MUL", ["RISC-V Processor", "Instruction Encoding"]);
  ws(1633, 11, 6, "New branch ALU with negate", ["RISC-V Processor", "Branches"]);
  ws(1634, 11, 7, "Push and pop instructions (past quiz)", ["RISC-V Processor", "Datapath"]);
  ws(1635, 12, 1, "Multi-level cache AMAT", ["AMAT", "Memory Hierarchy"]);
  ws(1636, 12, 2, "Designing a 1024-word cache", ["Caches", "Address Breakdown"]);
  ws(1637, 12, 3, "Cache timing and AMAT", ["AMAT"]);
  ws(1638, 12, 4, "Direct-mapped cache with 1-word lines", ["Caches", "Conflict Misses"]);
  ws(1639, 12, 5, "Byte and half-word access with word instructions", ["RISC-V Assembly", "Loads"]);
  ws(1640, 13, 1, "Designing a 1024-word cache, continued", ["Caches", "Address Breakdown"]);
  ws(1641, 13, 2, "Bob's direct-mapped cache with 8-word lines", ["Caches", "Block Size"]);
  ws(1642, 13, 3, "Program on a 2-way cache with 2-word blocks", ["Caches", "Locality"]);
  ws(1643, 13, 4, "2-way write-back cache contents", ["Caches", "Write-Back"]);
  ws(1644, 13, 5, "2-way cache hardware diagram", ["Caches", "Associativity"]);
  ws(1645, 13, 6, "Snapshot of a 2-way, 8-set cache", ["Caches", "Associativity"]);
  ws(1646, 13, 7, "Johnny Cache's three processors", ["Caches", "Conflict Misses"]);
  ws(1647, 13, 8, "Designing for an AMAT of 1.5 cycles", ["AMAT", "Caches"]);
  ws(1648, 13, 9, "Anne and Ben's cache", ["AMAT", "Caches"]);
  ws(1649, 13, 10, "4.006 grade statistics cache (past quiz)", ["Caches", "Locality"]);
  ws(1650, 14, 1, "Reading a halted pipeline at cycle 105", ["Pipeline Diagrams", "Bypassing"]);
  ws(1651, 14, 2, "Pipeline state at cycle 1000", ["Pipeline Diagrams", "Stalls"]);
  ws(1652, 14, 3, "4-stage processor: is WB bypass worth it?", ["Pipelined Processors", "Bypassing"]);
  ws(1653, 14, 4, "4-stage pipelined processor questions", ["Pipelined Processors", "Stalls"]);
  ws(1654, 15, 1, "Loop at cycles 300-309", ["Pipeline Diagrams", "Control Hazards"]);
  ws(1655, 15, 2, "Defective processors in the Stata basement", ["Hazards", "Pipeline Diagrams"]);
  ws(1656, 15, 3, "Cycles per iteration of a beqz loop", ["Control Hazards", "CPI"]);
  ws(1657, 15, 4, "Processor with no bypass, annul, or stall", ["Hazards", "Stalls"]);
  ws(1658, 15, 5, "Exam-grading processor", ["Pipelined Processors", "Performance"]);
  ws(1659, 15, 6, "Val's shopping loop (past quiz)", ["Pipeline Diagrams", "CPI"]);
  ws(1660, 15, 7, "The Twofer processor (past quiz)", ["Pipelined Processors", "Performance"]);
  ws(1661, 15, 8, "Linked-list sum (Fall 2022 quiz)", ["Pipeline Diagrams", "Control Hazards"]);

  const TEXT = root.REAL_6191 || {};
  for (const p of P) {
    p.course = "6.191";
    const x = TEXT[p.img];
    if (x) Object.assign(p, { text: true, statement: x.statement, solution: x.solution });
    for (const q of p.parts) if (Number.isInteger(root.Expr.evaluate(q.answer))) q.tol = 0;
  }
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
