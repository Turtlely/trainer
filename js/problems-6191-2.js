// Problem bank for 6.191 Computation Structures (Fall 2026), part 2: L10-L12
// (RISC-V assembly and calling convention, the single-cycle RISC-V processor, memory hierarchy).
// Assembly answers were checked with a small RV32I simulator.
(function (root) {
  const t = String.raw;
  const P = [];
  const add = (p) => P.push(p);

  // ---------- L10: compilers and RISC-V assembly
  add({ id: 1101, lec: 10, title: "Bitwise Warm-Up", diff: "Easy", topics: ["RISC-V Assembly", "Bitwise Ops"], answer: "0xFFF",
    statement: t`What is in [[x5]] after this code runs? Answer in hex.

~~~
li  x1, 0x0F0F
li  x2, 0x00FF
xor x3, x1, x2
and x4, x1, x2
or  x5, x3, x4
~~~`,
    hints: [t`Work one hex digit at a time.`],
    solution: t`[[x3]] $=$ [[0x0F0F ^ 0x00FF]] $=$ [[0x0FF0]]. [[x4]] $=$ [[0x000F]]. [[x5]] $=$ [[0x0FF0 | 0x000F]] $=$ [[0x0FFF]].` });

  add({ id: 1102, lec: 10, title: "Arithmetic vs Logical Shift", diff: "Easy", topics: ["RISC-V Assembly", "Shifts"], answer: "15",
    statement: t`[[x1]] holds $-16$. The code runs [[srai x2, x1, 2]] and [[srli x3, x1, 28]]. [[x2]] is $-4$. What is the value of [[x3]] as an unsigned decimal number?`,
    hints: [t`$-16$ is [[0xFFFFFFF0]]. A logical shift fills with zeros.`],
    solution: t`[[0xFFFFFFF0 >> 28]] (logical) is [[0xF]] $= 15$. The arithmetic shift copies the sign bit, so [[srai]] gives $-4$.` });

  add({ id: 1103, lec: 10, title: "Building a 32-bit Constant", diff: "Medium", topics: ["RISC-V Assembly", "Immediates"], answer: "0xDEADC",
    statement: t`You load [[0xDEADBEEF]] into [[x1]] with two instructions: [[lui x1, U]] then [[addi x1, x1, I]], where $I$ is a 12-bit signed immediate. What is $U$? Answer in hex.`,
    hints: [t`[[addi]] sign-extends its immediate. The low 12 bits are [[0xEEF]], which has bit 11 set.`],
    solution: t`The low 12 bits [[0xEEF]] read as a signed number are $0xEEF - 0x1000 = -273$. So [[addi]] subtracts 273, and [[lui]] must supply one more in the upper bits: $U =$ [[0xDEADB + 1]] $=$ [[0xDEADC]]. Check: [[0xDEADC000 - 0x111 = 0xDEADBEEF]].` });

  add({ id: 1104, lec: 10, title: "Off-by-One with lui", diff: "Easy", topics: ["RISC-V Assembly", "Immediates"], answer: "0x12344FFF",
    statement: t`What is in [[x1]] after [[lui x1, 0x12345]] and then [[addi x1, x1, -1]]? Answer in hex.`,
    hints: [t`[[lui]] puts its immediate in bits $[31:12]$ and zeros in the low 12 bits.`],
    solution: t`[[lui]] gives [[0x12345000]]. Subtracting 1 gives [[0x12344FFF]].` });

  add({ id: 1105, lec: 10, title: "Counting Down", diff: "Easy", topics: ["RISC-V Assembly", "Loops"], answer: "32",
    statement: t`How many instructions does this code execute, not counting [[unimp]]?

~~~
      li   x1, 0
      li   x2, 10
loop: add  x1, x1, x2
      addi x2, x2, -1
      bnez x2, loop
      unimp
~~~`,
    hints: [t`The loop body runs 10 times.`],
    solution: t`$2 + 3 \cdot 10 = 32$ instructions. At the end [[x1]] $= 10 + 9 + \dots + 1 = 55$.` });

  add({ id: 1106, lec: 10, title: "Signed vs Unsigned Compare", diff: "Easy", topics: ["RISC-V Assembly", "Comparisons"], answer: "1",
    statement: t`[[x1]] holds $-1$ and [[x2]] holds $1$. [[slt x3, x1, x2]] and [[sltu x4, x1, x2]] run. What is [[x3 + x4]]?`,
    hints: [t`As an unsigned number, $-1$ is [[0xFFFFFFFF]].`],
    solution: t`Signed, $-1 < 1$, so [[x3]] $= 1$. Unsigned, [[0xFFFFFFFF]] $> 1$, so [[x4]] $= 0$. The sum is $1$.` });

  add({ id: 1107, lec: 10, title: "Sign-Extended Byte Load", diff: "Medium", topics: ["RISC-V Assembly", "Loads"], answer: "0xFFFFFFA4",
    statement: t`The word at address [[0x2000]] is [[0x80F7A4C3]]. RISC-V is little-endian. [[x1]] holds [[0x2000]]. What does [[lb x2, 1(x1)]] put in [[x2]]? Answer in hex.`,
    hints: [t`Byte 0 is the least significant byte, [[0xC3]].`],
    solution: t`The bytes at [[0x2000..0x2003]] are [[C3, A4, F7, 80]]. Byte 1 is [[0xA4]], and its top bit is 1, so [[lb]] sign-extends it to [[0xFFFFFFA4]]. ([[lbu]] would give [[0x000000A4]].)` });

  add({ id: 1108, lec: 10, title: "Halfword Load", diff: "Medium", topics: ["RISC-V Assembly", "Loads"], answer: "0xFFFF80F7",
    statement: t`Use the same memory as the previous problem: the word at [[0x2000]] is [[0x80F7A4C3]]. What does [[lh x4, 2(x1)]] put in [[x4]] if [[x1 = 0x2000]]? Answer in hex.`,
    hints: [t`The halfword at byte offset 2 is the upper half of the word.`],
    solution: t`The halfword at [[0x2002]] is [[0x80F7]]. Bit 15 is 1, so [[lh]] sign-extends it to [[0xFFFF80F7]].` });

  add({ id: 1109, lec: 10, title: "Storing a Byte", diff: "Medium", topics: ["RISC-V Assembly", "Stores"], answer: "0x11AB3344",
    statement: t`The word at [[0x2000]] is [[0x11223344]]. With [[x1 = 0x2000]] and [[x2 = 0xAB]], the code runs [[sb x2, 2(x1)]] and then [[lw x3, 0(x1)]]. What is [[x3]]? Answer in hex.`,
    hints: [t`Byte offset 2 holds bits $[23:16]$.`],
    solution: t`Byte 2 is [[0x22]] (bits 23:16). The store replaces it with [[0xAB]], so the word becomes [[0x11AB3344]].` });

  add({ id: 1110, lec: 10, title: "Population Count", diff: "Medium", topics: ["RISC-V Assembly", "Loops"], answer: "43",
    statement: t`How many instructions does this code execute, not counting [[unimp]]?

~~~
      li   a0, 0xB6
      li   a1, 0
loop: beqz a0, done
      andi t0, a0, 1
      add  a1, a1, t0
      srli a0, a0, 1
      j    loop
done: unimp
~~~`,
    hints: [t`[[0xB6]] $=$ [[0b10110110]] has 8 significant bits, so the loop body runs 8 times.`],
    solution: t`The setup takes 2 instructions. The loop body runs 8 times at 5 instructions each, which is 40. The final [[beqz]] that exits is 1 more. The total is $2 + 40 + 1 = 43$. At the end, [[a1]] $= 5$, the number of ones.` });

  add({ id: 1111, lec: 10, title: "Summing an Array", diff: "Easy", topics: ["RISC-V Assembly", "Arrays"], answer: "14",
    statement: t`What is in [[a2]] when the code reaches [[unimp]]?

~~~
. = 0
      li   a0, 0x100
      li   a1, 5
      li   a2, 0
loop: lw   t0, 0(a0)
      add  a2, a2, t0
      addi a0, a0, 4
      addi a1, a1, -1
      bnez a1, loop
      unimp
. = 0x100
.word 3, -2, 7, 10, -4
~~~`,
    hints: [t`The loop visits all 5 words.`],
    solution: t`$3 - 2 + 7 + 10 - 4 = 14$.` });

  add({ id: 1112, lec: 10, title: "Running Maximum", diff: "Medium", topics: ["RISC-V Assembly", "Branches"], answer: "34",
    statement: t`How many instructions does this code execute, not counting [[unimp]]?

~~~
. = 0
      li   a0, 0x200
      li   a1, 6
      lw   a2, 0(a0)
loop: addi a1, a1, -1
      beqz a1, done
      addi a0, a0, 4
      lw   t0, 0(a0)
      bge  a2, t0, loop
      mv   a2, t0
      j    loop
done: unimp
. = 0x200
.word 4, 9, -3, 12, 12, 7
~~~`,
    hints: [t`The loop compares 5 elements. The [[mv]] and [[j]] run only when a new maximum appears.`],
    solution: t`Setup: 3 instructions. Each of the 5 comparisons runs [[addi, beqz, addi, lw, bge]], which is $5 \cdot 5 = 25$. New maxima appear at 9 and at the first 12, so [[mv, j]] runs twice, which adds 4. The exit runs [[addi, beqz]], which adds 2. The total is $3 + 25 + 4 + 2 = 34$, and [[a2]] ends at 12.` });

  add({ id: 1113, lec: 10, title: "Return Address", diff: "Easy", topics: ["RISC-V Assembly", "Procedures"], answer: "0x404",
    statement: t`The instruction [[jal ra, f]] is at address [[0x400]]. What value does it write into [[ra]]? Answer in hex.`,
    hints: [t`[[jal]] saves the address of the next instruction.`],
    solution: t`[[ra]] $=$ PC $+ 4 =$ [[0x404]].` });

  add({ id: 1114, lec: 10, title: "Recursive Sum Stack Depth", diff: "Hard", topics: ["RISC-V Assembly", "Stack", "Calling Convention"], answer: "32",
    statement: t`[[sp]] starts at [[0x1000]] and the code calls [[sum]] with [[a0 = 5]]:

~~~
sum:  li   t0, 1
      bgt  a0, t0, rec
      li   a0, 1
      ret
rec:  addi sp, sp, -8
      sw   ra, 4(sp)
      sw   a0, 0(sp)
      addi a0, a0, -1
      call sum
      lw   t1, 0(sp)
      add  a0, a0, t1
      lw   ra, 4(sp)
      addi sp, sp, 8
      ret
~~~

How many bytes below [[0x1000]] does [[sp]] go at its lowest point?`,
    hints: [t`Which calls push a frame? The call with [[a0 = 1]] returns without one.`],
    solution: t`The calls with [[a0]] $= 5, 4, 3, 2$ each push an 8-byte frame. The call with [[a0 = 1]] is the base case and pushes nothing. So the lowest [[sp]] is $0x1000 - 4 \cdot 8 =$ [[0xFE0]], which is $32$ bytes below. The result is [[a0 = 15]].` });

  add({ id: 1115, lec: 10, title: "Callee-Saved Registers", diff: "Medium", topics: ["Calling Convention"], answer: "3",
    statement: t`A procedure uses [[s0]] and [[s1]] to hold values across a call to another procedure. It also uses [[t0]]–[[t2]] and [[a0]]–[[a2]] but needs none of them after the call. Under the RISC-V calling convention, what is the minimum number of registers it must save on the stack?`,
    hints: [t`Callee-saved registers that it overwrites must be saved. It makes a call, so [[ra]] is overwritten.`],
    solution: t`It must save [[s0]] and [[s1]] (callee-saved and overwritten) and [[ra]] (the call overwrites it). It need not save [[t]] or [[a]] registers it does not need after the call. That is $3$ registers.` });

  add({ id: 1116, lec: 10, title: "Signed Overflow", diff: "Medium", topics: ["RISC-V Assembly", "Comparisons"], answer: "1",
    statement: t`[[t0]] holds [[0x7FFFFFFF]]. The code runs [[addi t1, t0, 1]] and then [[slt t2, t1, t0]]. What is [[t2]]?`,
    hints: [t`[[0x7FFFFFFF + 1]] wraps to [[0x80000000]], the most negative 32-bit number.`],
    solution: t`[[t1]] $=$ [[0x80000000]] $= -2^{31}$. As a signed number this is less than [[t0]], so [[t2 = 1]]. RISC-V does not trap on overflow.` });

  add({ id: 1117, lec: 10, title: "Procedure Result", diff: "Medium", topics: ["RISC-V Assembly", "Procedures"], answer: "34",
    statement: t`[[sq]] returns [[a0 * a0]] (by repeated addition). It uses only [[t]] registers. What is in [[a0]] at the end?

~~~
      li   sp, 0x1000
      li   a0, 5
      call sq
      mv   s0, a0
      li   a0, 3
      call sq
      add  a0, a0, s0
~~~`,
    hints: [t`[[s0]] keeps the first result across the second call.`],
    solution: t`The first call returns 25, which is kept in [[s0]]. The second call returns 9. $25 + 9 = 34$.` });

  // ---------- L11: single-cycle RISC-V processor
  add({ id: 1121, lec: 11, title: "Decode an Immediate", diff: "Medium", topics: ["RISC-V Processor", "Instruction Encoding"], answer: "-4",
    statement: t`The instruction word [[0xFFC58593]] is an [[addi]] (opcode [[0010011]], funct3 [[000]]). What is its immediate, as a signed decimal number?`,
    hints: [t`The I-type immediate is bits $[31:20]$, sign-extended.`],
    solution: t`Bits $[31:20]$ are [[0xFFC]]. As a 12-bit signed number that is $-4$. The instruction is [[addi x11, x11, -4]].` });

  add({ id: 1122, lec: 11, title: "Decode a Register Field", diff: "Easy", topics: ["RISC-V Processor", "Instruction Encoding"], answer: "11",
    statement: t`For the instruction word [[0xFFC58593]], what is [[rd]], the destination register number (bits $[11:7]$)?`,
    hints: [t`[[0x593]] $=$ [[0b0101_1001_0011]]. The low 7 bits are the opcode.`],
    solution: t`The low 12 bits are [[0101 1001 0011]]. Removing the opcode [[0010011]] leaves bits $[11:7] =$ [[01011]] $= 11$.` });

  add({ id: 1123, lec: 11, title: "Branch Target", diff: "Hard", topics: ["RISC-V Processor", "Instruction Encoding", "Branches"], answer: "0x1000",
    statement: t`The branch [[0xFE0298E3]] is at address [[0x1010]]. It is [[bne x5, x0, imm]]. If it is taken, what is the next PC? Answer in hex.`,
    hints: [t`The B-type immediate is $\{inst[31], inst[7], inst[30:25], inst[11:8], 0\}$, sign-extended.`, t`Here $inst[31] = 1$, $inst[7] = 1$, $inst[30:25] =$ [[111111]] and $inst[11:8] =$ [[1000]].`],
    solution: t`The immediate bits are [[1 1 111111 1000 0]] $=$ [[0b1111111110000]], which is $-16$. The target is [[0x1010 - 16 = 0x1000]].` });

  add({ id: 1124, lec: 11, title: "Store Offset", diff: "Medium", topics: ["RISC-V Processor", "Instruction Encoding"], answer: "-12",
    statement: t`The word [[0xFE642A23]] is a store word ([[sw]], opcode [[0100011]]). What is its offset, as a signed decimal number?`,
    hints: [t`The S-type immediate is $\{inst[31:25], inst[11:7]\}$.`],
    solution: t`$inst[31:25] =$ [[1111111]] and $inst[11:7] =$ [[10100]]. Together that is [[0b111111110100]], which is $-12$. The instruction is [[sw x6, -12(x8)]].` });

  add({ id: 1125, lec: 11, title: "JAL Offset", diff: "Hard", topics: ["RISC-V Processor", "Instruction Encoding"], answer: "-8",
    statement: t`[[0xFF9FF06F]] is a [[jal]] instruction. What is its jump offset, in bytes (signed decimal)?`,
    hints: [t`The J-type immediate is $\{inst[31], inst[19:12], inst[20], inst[30:21], 0\}$.`],
    solution: t`$imm[20] = inst[31] = 1$, $imm[19:12] = inst[19:12] =$ [[11111111]], $imm[11] = inst[20] = 1$, $imm[10:1] = inst[30:21] =$ [[1111111100]], and $imm[0] = 0$. The 21-bit value is [[1_11111111_1_1111111100_0]], which is all ones except the low 3 bits. That is $-8$, so the instruction is [[jal x0, -8]].` });

  add({ id: 1126, lec: 11, title: "Single-Cycle Clock Period", diff: "Medium", topics: ["RISC-V Processor", "Timing"], answer: "29",
    statement: t`In a single-cycle RISC-V processor the [[lw]] instruction sets the clock period. Its path is: PC register ($t_{PD} = 1$ ns) → instruction memory (8) → decoder (2) → register file read (3) → ALU (5) → data memory (8) → write-data mux (1) → register file setup (1). What is the minimum clock period, in ns?`,
    hints: [t`Add all the delays on the path.`],
    solution: t`$1 + 8 + 2 + 3 + 5 + 8 + 1 + 1 = 29$ ns.` });

  add({ id: 1127, lec: 11, title: "Program Run Time", diff: "Easy", topics: ["RISC-V Processor", "Performance"], answer: "2900",
    statement: t`The single-cycle processor from the previous problem ($t_{CLK} = 29$ ns) runs a program of 100 dynamic instructions. How many ns does it take?`,
    hints: [t`A single-cycle processor has CPI $= 1$.`],
    solution: t`Time $=$ instructions $\times$ CPI $\times\ t_{CLK} = 100 \cdot 1 \cdot 29 = 2900$ ns.` });

  add({ id: 1128, lec: 11, title: "Branch ALU Output", diff: "Easy", topics: ["RISC-V Processor", "Branches"], answer: "1",
    statement: t`The processor runs [[bge x1, x2, L]] with [[Reg[x1] = 7]] and [[Reg[x2] = -3]]. What is the [[branch]] signal from the branch ALU, 0 or 1?`,
    hints: [t`[[bge]] compares signed values.`],
    solution: t`$7 \ge -3$, so the branch is taken and [[branch = 1]].` });

  add({ id: 1129, lec: 11, title: "AUIPC Result", diff: "Easy", topics: ["RISC-V Processor", "Immediates"], answer: "0x10200",
    statement: t`[[auipc x5, 0x10]] is at address [[0x200]]. What does it write into [[x5]]? Answer in hex.`,
    hints: [t`[[auipc]] adds [[imm << 12]] to the PC of the instruction.`],
    solution: t`[[0x200 + (0x10 << 12) = 0x200 + 0x10000 = 0x10200]].` });

  add({ id: 1130, lec: 11, title: "JALR Target", diff: "Medium", topics: ["RISC-V Processor", "Procedures"], answer: "0x3004",
    statement: t`[[jalr ra, 7(t0)]] runs with [[t0 = 0x2FFD]]. What is the next PC? Answer in hex.`,
    hints: [t`[[jalr]] computes [[(Reg[rs1] + imm) & ~1]].`],
    solution: t`[[0x2FFD + 7 = 0x3004]]. Bit 0 is already 0, so the target is [[0x3004]].` });

  add({ id: 1131, lec: 11, title: "Write-Back Value of JAL", diff: "Easy", topics: ["RISC-V Processor"], answer: "0x108",
    statement: t`[[jal ra, 0x40]] is at address [[0x104]]. What value goes to the register file's write-data port? Answer in hex.`,
    hints: [t`The target is [[0x144]], but that is not what is written.`],
    solution: t`[[jal]] writes [[pc + 4 = 0x108]] into [[ra]] and jumps to [[0x144]].` });

  add({ id: 1132, lec: 11, title: "Register File Ports", diff: "Easy", topics: ["RISC-V Processor", "Register File"], answer: "3",
    statement: t`How many ports does the register file of the standard single-cycle RISC-V processor have in total (read ports plus write ports)?`,
    hints: [t`R-type instructions read two registers and write one.`],
    solution: t`Two combinational read ports and one clocked write port: $3$.` });

  add({ id: 1133, lec: 11, title: "Sign-Extended Store Offset", diff: "Medium", topics: ["RISC-V Processor", "Stores"], answer: "0x1FF8",
    statement: t`[[sw x6, -8(x7)]] runs with [[x7 = 0x2000]]. What address does the data memory see? Answer in hex.`,
    hints: [t`The ALU adds the sign-extended offset to [[rs1]].`],
    solution: t`[[0x2000 - 8 = 0x1FF8]].` });

  add({ id: 1134, lec: 11, title: "SLLI Result", diff: "Easy", topics: ["RISC-V Processor", "ALU"], answer: "0xF0000000",
    statement: t`The ALU runs [[slli x3, x4, 28]] with [[x4 = 0x1234567F]]. What is the result? Answer in hex.`,
    hints: [t`Only the lowest 4 bits survive a 28-bit left shift.`],
    solution: t`The low nibble is [[0xF]]. Shifted left by 28 bits it becomes [[0xF0000000]].` });

  // ---------- L12: memory hierarchy
  add({ id: 1141, lec: 12, title: "SRAM Cell Transistors", diff: "Easy", topics: ["Memory Technology"], answer: "6",
    statement: t`How many transistors are in a standard SRAM cell?`,
    hints: [t`Two cross-coupled inverters plus two access transistors.`],
    solution: t`$4 + 2 = 6$ transistors. A DRAM cell has 1 transistor and 1 capacitor.` });

  add({ id: 1142, lec: 12, title: "Basic AMAT", diff: "Easy", topics: ["AMAT", "Caches"], answer: "1.32",
    statement: t`A cache responds in 1 cycle. A miss costs 8 more cycles. The hit ratio is 0.96. What is the AMAT, in cycles?`,
    hints: [t`$\text{AMAT} = \text{HitTime} + \text{MissRatio} \cdot \text{MissPenalty}$.`],
    solution: t`$1 + 0.04 \cdot 8 = 1.32$ cycles.` });

  add({ id: 1143, lec: 12, title: "Required Hit Ratio", diff: "Medium", topics: ["AMAT"], answer: "0.96",
    statement: t`A cache takes 1 cycle to check. A miss takes 10 more cycles. You want an AMAT of at most 1.4 cycles. What is the minimum hit ratio?`,
    hints: [t`Solve $1.4 = 1 + (1 - HR) \cdot 10$.`],
    solution: t`$(1 - HR) \cdot 10 = 0.4$, so $HR = 0.96$.` });

  add({ id: 1144, lec: 12, title: "Hit Ratio from AMAT", diff: "Medium", topics: ["AMAT"], answer: "131/140",
    statement: t`Main memory takes 140 cycles. You add an L1 cache with a 1-cycle hit time and measure an AMAT of 10 cycles. What is the L1 hit ratio?`,
    hints: [t`$10 = 1 + (1 - HR)\cdot 140$.`],
    solution: t`$(1 - HR) = 9/140$, so $HR = 131/140 \approx 0.936$.` });

  add({ id: 1145, lec: 12, title: "Two-Level AMAT", diff: "Hard", topics: ["AMAT", "Multilevel Caches"], answer: "137/140",
    statement: t`Use the L1 cache from the previous problem ($HR_1 = 131/140$, 1-cycle hit time, memory 140 cycles). You add an L2 that takes 4 cycles to decide hit or miss. The AMAT drops to 1.45 cycles. What is the L2 hit ratio?`,
    hints: [t`$1.45 = 1 + \frac{9}{140}\left(4 + (1 - HR_2)\cdot 140\right)$.`],
    solution: t`$0.45 \cdot \frac{140}{9} = 7 = 4 + (1 - HR_2)\cdot 140$. So $(1 - HR_2) = 3/140$ and $HR_2 = 137/140$.` });

  add({ id: 1146, lec: 12, title: "Lines and Tag Bits", diff: "Medium", topics: ["Caches", "Address Breakdown"], answer: "20",
    statement: t`A direct-mapped cache holds 1024 words in blocks of 4 words. Addresses are 32-bit byte addresses. How many tag bits does each line store?`,
    hints: [t`Count the byte-offset, word-offset and index bits first.`],
    solution: t`There are $1024/4 = 256$ lines, so 8 index bits. The 2 byte-offset bits and 2 word-offset bits make 4 offset bits. The tag is $32 - 8 - 4 = 20$ bits.` });

  add({ id: 1147, lec: 12, title: "AMAT With a Slow Cache", diff: "Easy", topics: ["AMAT"], answer: "4",
    statement: t`The cache from the previous problem takes 2 cycles to return a hit. A miss takes 20 more cycles. The hit rate is 90%. What is the AMAT, in cycles?`,
    hints: [t`$2 + 0.1 \cdot 20$.`],
    solution: t`$2 + 0.1 \cdot 20 = 4$ cycles.` });

  add({ id: 1148, lec: 12, title: "Address From Tag and Line", diff: "Medium", topics: ["Caches", "Address Breakdown"], answer: "0x123414",
    statement: t`A direct-mapped cache has 64 lines of 1 word each. Line 5 is valid and has tag [[0x1234]]. What byte address in main memory does it hold? Answer in hex.`,
    hints: [t`Address $=$ tag $\cdot 2^{8}$ + line $\cdot 4$, because there are 6 index bits and 2 byte-offset bits.`],
    solution: t`[[0x1234 << 8]] $=$ [[0x123400]]. Line 5 adds $5 \cdot 4 = 20 =$ [[0x14]]. The address is [[0x123414]].` });

  add({ id: 1149, lec: 12, title: "Doubling the Block Size", diff: "Medium", topics: ["Caches", "Address Breakdown"], answer: "-1",
    statement: t`A direct-mapped cache keeps its total data capacity but doubles its block size. By how much does the number of index bits change? (For example, answer $-1$ for one fewer bit.)`,
    hints: [t`The number of lines halves.`],
    solution: t`Half as many lines means one fewer index bit: $-1$. The block offset gains one bit, and the tag width does not change.` });

  add({ id: 1150, lec: 12, title: "Three-Level AMAT Budget", diff: "Hard", topics: ["AMAT", "Multilevel Caches"], answer: "30",
    statement: t`Use the L1 ($HR_1 = 131/140$, 1 cycle) and L2 ($HR_2 = 137/140$, 4 cycles) from the earlier problems, and main memory at 140 cycles. You add an L3 between L2 and memory. Memory is accessed once for every 140 L3 accesses. What is the largest L3 hit time, in cycles, that keeps the AMAT at or below 1.3?`,
    hints: [t`$\text{AMAT} = 1 + \frac{9}{140}\left(4 + \frac{3}{140}\left(H_3 + \frac{1}{140}\cdot 140\right)\right)$.`],
    solution: t`Set the AMAT to 1.3: $\frac{0.3 \cdot 140}{9} = \frac{14}{3} = 4 + \frac{3}{140}(H_3 + 1)$. So $\frac{2}{3} = \frac{3}{140}(H_3 + 1)$ and $H_3 + 1 = \frac{280}{9} \approx 31.1$. So $H_3 \le 30.1$, and the largest whole number of cycles is $30$.` });

  add({ id: 1151, lec: 12, title: "SRAM Ports and Area", diff: "Easy", topics: ["Memory Technology"], answer: "90",
    statement: t`SRAM area grows as $O(N^2)$ in the number of ports $N$, because each port adds a wordline and a bitline pair to every cell. A 1-port SRAM array has an area of $10\ \text{mm}^2$. Under this model, what is the area of a 3-port array of the same capacity, in $\text{mm}^2$?`,
    hints: [t`Scale by $N^2$.`],
    solution: t`$10 \cdot 3^2 = 90\ \text{mm}^2$. This is why register files with many ports stay small.` });

  add({ id: 1152, lec: 12, title: "Loop Hit Ratio", diff: "Hard", topics: ["Caches", "Locality"], answer: "91/99",
    statement: t`A direct-mapped cache has 64 one-word lines and serves both instructions and data. This program starts at address 0. It runs for many iterations, and then you measure one full pass of the outer loop:

~~~
. = 0
outer: addi x4, x0, 16
       mv   x1, x0
loop:  addi x4, x4, -1
       slli x2, x4, 2
       lw   x3, 0x310(x2)
       add  x1, x1, x3
       bne  x4, x0, loop
       j    outer
~~~

What is the hit ratio for that pass?`,
    hints: [t`Instructions use lines 0–7. The array at [[0x310..0x34C]] uses lines 4–19.`, t`Lines 4–7 are shared. Each shared line gives one instruction miss and one data miss per pass.`],
    solution: t`There are $2 + 5 \cdot 16 + 1 = 83$ instruction fetches and 16 data reads. Lines 4–7 hold both the instructions [[lw, add, bne, j]] and four array words. Each pass, those four words evict the instructions, and the instructions evict the words. That gives 4 instruction misses and 4 data misses. The hits are $(83 - 4) + (16 - 4) = 91$ of $99$ accesses, so the hit ratio is $91/99$. (This is a worksheet problem from L12.)` });

  // Integer answers must match exactly.
  for (const p of P) {
    p.course = "6.191";
    if (p.tol === undefined && Number.isInteger(root.Expr.evaluate(p.answer))) p.tol = 0;
  }
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
