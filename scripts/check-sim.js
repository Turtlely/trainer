// Tests the pipeline simulator (js/sim-6191.js) against official 6.191 pipeline diagrams.
// Run: node scripts/check-sim.js
const path = require("path");
require(path.join(__dirname, "..", "js", "sim-6191.js"));
const { parseProgram, window } = globalThis.Sim6191;

let fails = 0;
function check(name, src, cfg, head, expect, opts = {}) {
  const prog = parseProgram(src);
  const lines = expect.trim().split("\n").map((l) => l.trim().split(/\s+/));
  const len = lines[0].length - 1;
  const w = window(prog, cfg, head, Object.assign({ len }, opts));
  let ok = true;
  for (const l of lines) {
    const st = l[0], want = l.slice(1);
    const got = w.rows[st];
    want.forEach((cell, i) => { if (cell !== "#" && cell !== "?" && cell.toLowerCase() !== got[i].toLowerCase()) ok = false; });
  }
  if (opts.arrows) {
    // Arrows whose source cell is in the shaded staircase are not graded.
    const got = w.arrows.filter(([a, , c]) => c >= ["IF", "DEC", "EXE", "MEM", "WB"].indexOf(a)).map(([a, , c]) => `${a}@${c}`).sort().join(" ");
    if (got !== opts.arrows.slice().sort().join(" ")) { ok = false; console.log("  arrows got", got, "want", opts.arrows.join(" ")); }
  }
  if (opts.period !== undefined && w.period !== opts.period) { ok = false; console.log("  period", w.period, "want", opts.period); }
  if (opts.stalls !== undefined && w.stalls !== opts.stalls) { ok = false; console.log("  stalls", w.stalls, "want", opts.stalls); }
  if (opts.annulled !== undefined && w.annulled !== opts.annulled) { ok = false; console.log("  annulled", w.annulled, "want", opts.annulled); }
  console.log(ok ? "ok  " : "FAIL", name);
  if (!ok) { fails++; for (const st of Object.keys(w.rows)) console.log("   ", st.padEnd(4), w.rows[st].join(" ")); }
}
const always = (v) => () => v;
const FULL = ["EXE", "MEM", "WB"];

// Fall 2025 Q2 P5 (A): full bypassing, branch in EXE, blt taken.
check("fa25 p5a", `
loop: sh a5, 0(a1)
      lw a6, 0(a1)
      sw a6, 100(a1)
      addi a4, a4, 1
      addi a1, a1, 4
      blt a4, a3, loop
      slli a7, a5, 2
      xor a7, a7, a6`, { bypass: FULL, loadReady: "WB", branchIn: "EXE", taken: always(true) }, 0, `
IF  sh lw sw addi addi addi addi blt slli xor sh lw
DEC # sh lw sw sw sw addi addi blt slli NOP sh
EXE # # sh lw NOP NOP sw addi addi blt NOP NOP
MEM # # # sh lw NOP NOP sw addi addi blt NOP
WB  # # # # sh lw NOP NOP sw addi addi blt`, { arrows: ["WB@5", "MEM@8"], period: 10 });

// Spring 2025 Q2 P6 (A): Fibonacci loop.
const FIB = `
      addi t0, x0, 24
      addi a0, x0, 0
      sw a0, 0(t1)
      addi a1, x0, 1
      sw a1, 0(t2)
fib:  lw a0, 0(t1)
      lw a1, 0(t2)
      add a2, a0, a1
      sw a1, 0(t1)
      sw a2, 0(t2)
      addi t0, t0, -1
      bnez t0, fib
      lw a0, 0(t2)
      xori a4, a2, 2
      ret`;
check("sp25 p6a", FIB, { bypass: FULL, loadReady: "WB", branchIn: "EXE", taken: always(true) }, 5, `
IF  lw lw add sw sw sw sw addi bnez lw xori lw lw
DEC # lw lw add add add sw sw addi bnez lw NOP lw
EXE # # lw lw NOP NOP add sw sw addi bnez NOP NOP
MEM # # # lw lw NOP NOP add sw sw addi bnez NOP
WB  # # # # lw lw NOP NOP add sw sw addi bnez`, { arrows: ["WB@5", "MEM@7", "EXE@9"], period: 11, stalls: 2, annulled: 2 });

// Spring 2026 Q2 P5: linked list. (A) no bypassing; (B) full bypassing, loads return in MEM, jal in DEC.
const LL = `
start: li t0, 0
       mv t1, a0
loop:  beq t1, x0, done
       lw t3, 8(t1)
       lw t2, 0(t1)
       add t0, t0, t2
       mv t1, t3
       jal x0, loop
done:  mv a0, t0
       ret`;
check("sp26 p5a", LL, { bypass: [], loadReady: "MEM", branchIn: "EXE", jalIn: "EXE", taken: always(false) }, 2, `
IF  beq lw lw add mv mv mv mv jal mv ret beq lw lw
DEC # beq lw lw add add add add mv jal mv NOP beq lw
EXE # # beq lw lw NOP NOP NOP add mv jal NOP NOP beq
MEM # # # beq lw lw NOP NOP NOP add mv jal NOP NOP
WB  # # # # beq lw lw NOP NOP NOP add mv jal NOP`, { period: 11 });
check("sp26 p5b", LL, { bypass: FULL, loadReady: "MEM", branchIn: "EXE", jalIn: "DEC", taken: always(false) }, 2, `
IF  beq lw lw add mv mv jal mv beq lw lw add mv mv
DEC # beq lw lw add add mv jal NOP beq lw lw add add
EXE # # beq lw lw NOP add mv jal NOP beq lw lw NOP
MEM # # # beq lw lw NOP add mv jal NOP beq lw lw
WB  # # # # beq lw lw NOP add mv jal NOP beq lw`, { arrows: ["MEM@5", "WB@9", "MEM@13"], period: 8 });

// Spring 2026 Q2 P6 (A): bge always taken.
check("sp26 p6a", `
      addi t0, x0, 1000
      lw a0, 0(t2)
loop: lw a1, 0(t2)
      bge a1, a0, skip
      mv a0, a1
skip: addi t2, t2, 4
      addi t0, t0, -1
      bnez t0, loop
      sw a0, 0x1000(x0)
      ret`, { bypass: FULL, loadReady: "WB", branchIn: "EXE", taken: always(true) }, 2, `
IF  lw bge mv mv mv addi addi addi bnez sw ret lw bge mv mv mv
DEC # lw bge bge bge mv NOP addi addi bnez sw NOP lw bge bge bge
EXE # # lw NOP NOP bge NOP NOP addi addi bnez NOP NOP lw NOP NOP
MEM # # # lw NOP NOP bge NOP NOP addi addi bnez NOP NOP lw NOP
WB  # # # # lw NOP NOP bge NOP NOP addi addi bnez NOP NOP lw`, { arrows: ["WB@4", "EXE@9", "WB@15"], period: 11 });

// Fall 2025 Q2 P6 (B), processor B: no bypassing, stall until nextPC known (branch/jal in DEC? no:
// not modeled). Processor A diagram I is a bypass-from-EXE bug, not modeled either.

// L15 P3 (A): beqz always taken, full bypassing.
check("l15 p3a", `
loop: lw x10, 0x100(x0)
      beqz x10, loop
      add x12, x10, x11
      sub x13, x12, x1`, { bypass: FULL, loadReady: "WB", branchIn: "EXE", taken: always(true) }, 0, `
IF  lw beqz add add add sub lw
DEC # lw beqz beqz beqz add NOP
EXE # # lw NOP NOP beqz NOP
MEM # # # lw NOP NOP beqz
WB  # # # # lw NOP NOP`, { arrows: ["WB@4"], period: 6 });
// L15 P3 (C): branch resolved in DEC.
check("l15 p3c", `
loop: lw x10, 0x100(x0)
      beqz x10, loop
      add x12, x10, x11
      sub x13, x12, x1`, { bypass: FULL, loadReady: "WB", branchIn: "DEC", taken: always(true) }, 0, `
IF  lw beqz add add add lw
DEC # lw beqz beqz beqz NOP
EXE # # lw NOP NOP beqz
MEM # # # lw NOP NOP
WB  # # # # lw NOP`, { arrows: ["WB@4"], period: 5 });

// L15 P1 (A): beqz to L2 taken, bnez back taken.
const L15P1 = `
L1: addi x10, x10, -4
    slti x11, x10, 10
    beqz x11, L2
    lw x12, 0x200(x10)
    j L3
L2: lw x12, 0x300(x10)
L3: sw x12, 0x400(x0)
    bnez x10, L1
    addi x12, x12, 1
    xor x12, x12, x0`;
check("l15 p1a", L15P1, { bypass: FULL, loadReady: "WB", branchIn: "EXE", taken: always(true) }, 0, `
IF  addi slti beqz lw j lw sw bnez bnez bnez
DEC NOP addi slti beqz lw NOP lw sw sw sw
EXE # # addi slti beqz NOP NOP lw NOP NOP
MEM # # # addi slti beqz NOP NOP lw NOP
WB  # # # # addi slti beqz NOP NOP lw`, { arrows: ["EXE@2", "EXE@3", "WB@4", "WB@9"], period: 12 });
check("l15 p1e", L15P1, { bypass: FULL, loadReady: "WB", branchIn: "DEC", taken: always(true) }, 0, `
IF  addi slti beqz lw lw sw bnez bnez bnez addi
DEC NOP addi slti beqz NOP lw sw sw sw bnez
EXE # # addi slti beqz NOP lw NOP NOP sw
MEM # # # addi slti beqz NOP lw NOP NOP
WB  # # # # addi slti beqz NOP lw NOP`, { period: 10 });

process.exit(fails ? 1 : 0);
