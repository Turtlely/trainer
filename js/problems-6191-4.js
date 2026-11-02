// Problem bank for 6.191 Computation Structures (Fall 2026), part 4: more Quiz 2 practice
// in the formats the quizzes use: Minispec code reading, pipelining contours, datapath and
// decode values, cache traces, and pipeline diagrams. Answers were checked with the same
// RV32I simulator, cache simulator, and 5-stage timing model as part 3.
(function (root) {
  const t = String.raw;
  const P = [];
  const add = (p) => P.push(p);

  const PIPE = t`Assume the standard 6.191 5-stage pipeline (IF, DEC, EXE, MEM, WB): registers are read in DEC and written in WB; branches and jumps resolve in EXE; the processor predicts not-taken and annuls the two younger instructions after a taken branch or jump; a load's data is available for bypassing in WB.`;

  // ---------- L7: Minispec code reading
  const SHIFT = t`~~~
module Shift4;
    Vector#(4, Reg#(Bit#(8))) sr(0);
    input Bit#(8) in;
    method Bit#(8) out = sr[3];
    rule tick;
        sr[0] <= in;
        for (Integer i = 1; i < 4; i = i + 1)
            sr[i] <= sr[i-1];
    endrule
endmodule
~~~`;
  add({ id: 1301, lec: 7, title: "Shift Register Output", diff: "Easy", topics: ["Minispec", "Registers"], answer: "6",
    statement: t`Consider this module:

${SHIFT}

A test module sets [[in]] to $3k$ on cycle $k$ (so 0, 3, 6, 9, ...). What does [[out]] return on cycle 6?`,
    hints: [t`A value applied on cycle $k$ is in [[sr[0]]] on cycle $k+1$ and in [[sr[3]]] on cycle $k+4$.`],
    solution: t`[[out]] on cycle 6 shows the input from cycle $6 - 4 = 2$, which is $3 \cdot 2 = 6$.` });

  add({ id: 1302, lec: 7, title: "Shift Register Start-Up", diff: "Easy", topics: ["Minispec", "Registers"], answer: "4",
    statement: t`Use [[Shift4]] and the test from the previous problem. What is the first cycle on which [[out]] shows a value that came from [[in]] (not the reset value 0)?`,
    hints: [t`Count the registers between [[in]] and [[out]].`],
    solution: t`The cycle-0 input reaches [[sr[3]]] after 4 clock edges, so it appears on cycle $4$. (That value is 0 as well, because $3 \cdot 0 = 0$.)` });

  add({ id: 1303, lec: 7, title: "Reset Has Priority", diff: "Medium", topics: ["Minispec", "Inputs and Methods"], answer: "2",
    statement: t`Consider this module:

~~~
module Ctr;
    Reg#(Bit#(4)) c(0);
    input Bool reset default = False;
    input Bool inc default = False;
    method Bit#(4) val = c;
    rule tick;
        if (reset) c <= 0;
        else if (inc) c <= c + 1;
    endrule
endmodule
~~~

On every cycle $0..9$, [[inc]] is True. [[reset]] is True only on cycles 4 and 7. What does [[val]] return on cycle 10?`,
    hints: [t`[[val]] on cycle $k$ shows the register after the update at the end of cycle $k-1$.`],
    solution: t`[[val]] on cycles $0..10$ is 0, 1, 2, 3, 4, 0, 1, 2, 0, 1, 2. The reset on cycle 4 clears it for cycle 5, and the reset on cycle 7 clears it for cycle 8. On cycle 10 it is $2$.` });

  add({ id: 1304, lec: 7, title: "Largest Count Seen", diff: "Easy", topics: ["Minispec", "Inputs and Methods"], answer: "4",
    statement: t`Use [[Ctr]] and the inputs from the previous problem. What is the largest value [[val]] returns on cycles $0..10$?`,
    hints: [t`The counter runs freely until the first reset.`],
    solution: t`It counts 0, 1, 2, 3, 4 on cycles 0–4. The reset on cycle 4 takes effect for cycle 5. The largest value is $4$.` });

  add({ id: 1305, lec: 7, title: "Mealy Output", diff: "Medium", topics: ["Minispec", "FSM"], answer: "3",
    statement: t`Consider this module:

~~~
typedef enum { S0, S1 } State;
module Pair;
    Reg#(State) state(S0);
    input Bit#(1) in;
    method Bool out = (state == S1) && (in == 1);
    rule tick;
        state <= (in == 1) ? S1 : S0;
    endrule
endmodule
~~~

On cycles $0..7$ the input is $1, 1, 1, 0, 1, 0, 1, 1$. On how many of these cycles is [[out]] True?`,
    hints: [t`The state on cycle $k$ is the input from cycle $k-1$. The output also depends on the input on cycle $k$, so this is a Mealy output.`],
    solution: t`[[out]] is True when the inputs on cycles $k-1$ and $k$ are both 1. That happens on cycles 1, 2 and 7: $3$ cycles.` });

  add({ id: 1306, lec: 7, title: "Subtract or Add", diff: "Medium", topics: ["Minispec", "Registers"], answer: "9",
    statement: t`Consider this module:

~~~
module Wobble;
    Reg#(Bit#(8)) x(10);
    Reg#(Bit#(8)) y(3);
    rule step;
        if (x > y) begin
            x <= x - y;
            y <= y + 1;
        end else
            x <= x + y;
    endrule
endmodule
~~~

What is [[x]] after 5 clock cycles?`,
    hints: [t`Trace $(x, y)$ one cycle at a time. Both registers read their old values.`],
    solution: t`$(10,3) \to (7,4) \to (3,5) \to (8,5) \to (3,6) \to (9,6)$. After 5 cycles $x = 9$.` });

  const SER = t`~~~
typedef enum { Idle, HasData } SerState;
module Ser3;
    Vector#(3, Reg#(Bit#(8))) buf(0);
    Reg#(Bit#(2)) idx(0);
    Reg#(SerState) state(Idle);
    input Maybe#(Vector#(3, Bit#(8))) data_i default = Invalid;
    input Bool next default = False;
    method Maybe#(Bit#(8)) get = (state == HasData) ? Valid(buf[idx]) : Invalid;
    rule tick;
        if (state == Idle && isValid(data_i)) begin
            let v = fromMaybe(?, data_i);
            for (Integer i = 0; i < 3; i = i + 1) buf[i] <= v[i];
            idx <= 0;
            state <= HasData;
        end else if (state == HasData && next) begin
            if (idx == 2) state <= Idle;
            else idx <= idx + 1;
        end
    endrule
endmodule
~~~`;
  add({ id: 1307, lec: 7, title: "Serializer: Value on a Cycle", diff: "Medium", topics: ["Minispec", "Maybe Types"], answer: "8",
    statement: t`Consider this serializer:

${SER}

On cycle 0, [[data_i]] is [[Valid([7, 8, 9])]] (index 0 is 7). It is [[Invalid]] after that. [[next]] is True on cycles 2, 3, 4 and 5, and False otherwise. What value does [[get]] hold on cycle 3?`,
    hints: [t`The data is loaded at the end of cycle 0. [[next]] on cycle $k$ moves [[idx]] for cycle $k+1$.`],
    solution: t`Cycle 1: [[idx = 0]], value 7. Cycle 2: still 7, and [[next]] moves [[idx]] to 1. Cycle 3: [[get]] is [[Valid(8)]]. The answer is $8$.` });

  add({ id: 1308, lec: 7, title: "Serializer: Valid Cycles", diff: "Medium", topics: ["Minispec", "Maybe Types"], answer: "4",
    statement: t`Use [[Ser3]] and the inputs from the previous problem. On how many of the cycles $0..6$ is [[get]] Valid?`,
    hints: [t`[[next]] on cycle 4 happens with [[idx == 2]].`],
    solution: t`Cycle 0 is Idle (the data arrives at the end of the cycle). Cycles 1–4 are HasData with values 7, 7, 8, 9. On cycle 4, [[next]] with [[idx == 2]] returns the module to Idle, so cycles 5 and 6 are Invalid. The answer is $4$ cycles.` });

  add({ id: 1309, lec: 7, title: "Moore or Mealy", diff: "Easy", topics: ["FSM"], answer: "1",
    statement: t`A method returns [[state == S2]] and reads no inputs. Is this a Moore output (answer 1) or a Mealy output (answer 0)?`,
    hints: [t`A Moore output depends only on the current state.`],
    solution: t`It depends only on the state, so it is a Moore output: $1$.` });

  // ---------- L8: pipelining
  const DAG2 = t`A circuit has inputs X and Y and output Z. Its components and delays (ns) are $A = 4$, $B = 2$, $C = 3$, $D = 5$, $E = 2$, $G = 3$. The connections are: X→A, A→B, B→D, X→C, C→D, Y→E, E→G, D→G, G→Z. Use ideal registers ($t_{PD} = t_{SETUP} = 0$) and a register on the output.`;
  add({ id: 1321, lec: 8, title: "Circuit E: Latency", diff: "Easy", topics: ["Pipelining", "Latency"], answer: "14",
    statement: t`${DAG2} What is the latency of the unpipelined (combinational) circuit, in ns?`,
    hints: [t`The longest path goes through $A$, $B$, $D$ and $G$.`],
    solution: t`X-A-B-D-G is $4 + 2 + 5 + 3 = 14$ ns. The other paths are shorter (X-C-D-G is 11, Y-E-G is 5).` });

  add({ id: 1322, lec: 8, title: "Circuit E: Max Throughput", diff: "Medium", topics: ["Pipelining", "Contours"], answer: "20",
    statement: t`${DAG2} You pipeline for maximum throughput with minimum latency. What is the latency, in ns?`,
    hints: [t`$t_{CLK} = 5$ ns. Place each component as early as possible.`],
    solution: t`Stage 1: $A$ (4), $C$ (3), $E$ (2). $B$ cannot follow $A$ ($4 + 2 > 5$), so stage 2: $B$ (2). $D$ cannot follow $B$ ($2 + 5 > 5$), so stage 3: $D$. $G$ cannot follow $D$, so stage 4: $G$. That is 4 stages at 5 ns, a latency of $20$ ns.` });

  add({ id: 1323, lec: 8, title: "Circuit E: 2 Stages", diff: "Hard", topics: ["Pipelining", "Contours"], answer: "16",
    statement: t`${DAG2} What is the latency, in ns, of the maximum-throughput 2-stage pipeline?`,
    hints: [t`Try a contour just after $B$ and $C$, and a second one at the output.`],
    solution: t`Stage 1: $A, B$ (6 ns), $C$ (3) and $E$ (2). Stage 2: $D, G$ (8 ns). So $t_{CLK} = 8$ and the latency is $16$ ns. A shorter period fails: with $t_{CLK} < 8$, $D$ and $G$ cannot share a stage, and $D$ cannot share a stage with $A$ and $B$ either, so 3 stages are needed.` });

  add({ id: 1324, lec: 8, title: "Circuit E: 3 Stages", diff: "Hard", topics: ["Pipelining", "Contours"], answer: "18",
    statement: t`${DAG2} What is the latency, in ns, of the maximum-throughput 3-stage pipeline?`,
    hints: [t`Find the smallest $t_{CLK}$ that 3 stages can meet.`],
    solution: t`With $t_{CLK} = 6$: stage 1 holds $A, B$ (6), $C$ and $E$. Stage 2 holds $D$ (5). Stage 3 holds $G$ (3). With $t_{CLK} = 5$ you need 4 stages (previous problems). So $t_{CLK} = 6$ and the latency is $3 \cdot 6 = 18$ ns.` });

  add({ id: 1325, lec: 8, title: "Using a Pipelined Component", diff: "Hard", topics: ["Pipelining", "Pipelined Components"], answer: "20",
    statement: t`A chain goes X → $A$ (4 ns) → $P$ → $B$ (5 ns) → Z. $P$ is a 2-stage pipelined component: 3 ns of logic, an internal register, 3 more ns of logic, and a register on its output. With ideal registers, you pipeline the chain for maximum throughput and minimum latency, counting $P$'s two registers. What is the latency, in ns?`,
    hints: [t`$B$ alone needs 5 ns, so $t_{CLK} \ge 5$.`, t`At $t_{CLK} = 5$, $A$ and the first half of $P$ do not fit together ($4 + 3 > 5$).`],
    solution: t`$t_{CLK} = 5$. Stage 1: $A$. Stage 2: first half of $P$. Stage 3: second half of $P$. Stage 4: $B$. The latency is $4 \cdot 5 = 20$ ns at throughput $1/5$. With a combinational 6 ns part instead of $P$, the best is $t_{CLK} = 6$ with 3 stages (18 ns latency, throughput $1/6$).` });

  add({ id: 1326, lec: 8, title: "Counting Pipeline Registers", diff: "Medium", topics: ["Pipelining", "Contours"], answer: "3",
    statement: t`A circuit has input X and output Z. X feeds $A$ (3 ns) and $B$ (6 ns). Both $A$ and $B$ feed $C$ (3 ns), and $C$ drives Z. You pipeline it for maximum throughput with the fewest registers, including one on the output. How many registers do you use?`,
    hints: [t`$t_{CLK} = 6$. $A$ and $C$ fit in one stage, but $B$ and $C$ do not.`],
    solution: t`A contour must separate $B$ from $C$. Put it on the two edges into $C$ (after $A$ and after $B$), and add the output register. That is $3$ registers, for 2 stages at 6 ns.` });

  add({ id: 1327, lec: 8, title: "Latency vs Throughput Choice", diff: "Medium", topics: ["Pipelining", "Latency"], answer: "14",
    statement: t`Circuit E (combinational latency 14 ns) can be built as the combinational circuit, a 2-stage pipeline (latency 16 ns, throughput $1/8$), or a 4-stage pipeline (latency 20 ns, throughput $1/5$). You need one result as soon as possible after a single input arrives, and the circuit is idle otherwise. What is the shortest time to get that result, in ns?`,
    hints: [t`For a single input, only latency matters.`],
    solution: t`Pick the design with the lowest latency: the combinational circuit at $14$ ns.` });

  // ---------- L9: design tradeoffs
  add({ id: 1341, lec: 9, title: "Valid Bits: First Output", diff: "Easy", topics: ["Minispec", "Pipelining", "Maybe Types"], answer: "2",
    statement: t`A 2-stage Minispec pipeline uses [[Maybe]] registers [[pipeReg1]] and [[pipeReg2]], and [[out]] returns [[pipeReg2]]. The inputs on cycles $0..6$ are Valid, Valid, Invalid, Valid, Invalid, Invalid, Invalid. On which cycle is [[out]] first Valid?`,
    hints: [t`A Valid input on cycle $k$ shows at the output on cycle $k + 2$.`],
    solution: t`The cycle-0 input is in [[pipeReg1]] on cycle 1 and in [[pipeReg2]] on cycle $2$.` });

  add({ id: 1342, lec: 9, title: "Valid Bits: Count", diff: "Easy", topics: ["Minispec", "Pipelining", "Maybe Types"], answer: "3",
    statement: t`Use the pipeline and inputs from the previous problem. On how many of the cycles $0..6$ is [[out]] Valid?`,
    hints: [t`Each valid input produces exactly one valid output, 2 cycles later.`],
    solution: t`The valid inputs on cycles 0, 1 and 3 appear on cycles 2, 3 and 5: $3$ cycles.` });

  add({ id: 1343, lec: 9, title: "Folded vs Pipelined Area", diff: "Medium", topics: ["Folding", "Area"], answer: "98/22",
    statement: t`An 8-bit multiplier can be built as a chain of 7 adders with a register after each (pipelined, 7 registers), or as one adder used for 8 cycles with 3 registers (folded). An adder costs 10 area units and a register costs 4. What is the area of the pipelined design divided by the area of the folded design?`,
    hints: [t`Pipelined: $7 \cdot 10 + 7 \cdot 4$. Folded: $10 + 3 \cdot 4$.`],
    solution: t`Pipelined: $70 + 28 = 98$. Folded: $10 + 12 = 22$. The ratio is $98/22 \approx 4.45$. The folded design is about 4.5 times smaller but has 8 times lower throughput.` });

  add({ id: 1344, lec: 9, title: "Throughput of Two Designs", diff: "Medium", topics: ["Folding", "Throughput"], answer: "8",
    statement: t`The pipelined and folded 8-bit multipliers from the previous problem both run at the same clock period. The folded one takes 8 cycles per result, and the pipelined one finishes one result per cycle. How many times higher is the pipelined design's throughput?`,
    hints: [t`Compare results per cycle.`],
    solution: t`Pipelined: 1 result per cycle. Folded: $1/8$ per cycle. The ratio is $8$.` });

  // ---------- L10: more RISC-V assembly
  add({ id: 1351, lec: 10, title: "Shift-and-Add Multiply", diff: "Medium", topics: ["RISC-V Assembly", "Loops"], answer: "143",
    statement: t`What is in [[a2]] when this code reaches [[unimp]]?

~~~
      li   a0, 13
      li   a1, 11
      li   a2, 0
loop: beqz a1, done
      andi t0, a1, 1
      beqz t0, skip
      add  a2, a2, a0
skip: slli a0, a0, 1
      srli a1, a1, 1
      j    loop
done: unimp
~~~`,
    hints: [t`This adds [[a0]] shifted left by $i$ whenever bit $i$ of [[a1]] is 1.`],
    solution: t`It computes $13 \cdot 11 = 143$. $11 =$ [[0b1011]], so it adds $13 + 26 + 104 = 143$.` });

  add({ id: 1352, lec: 10, title: "Shift-and-Add Instruction Count", diff: "Hard", topics: ["RISC-V Assembly", "Loops"], answer: "31",
    statement: t`For the code in the previous problem, how many instructions run, not counting [[unimp]]?`,
    hints: [t`The loop runs once per bit of [[11]] (4 times). The [[add]] runs only for the 1 bits.`],
    solution: t`Setup: 3. Each of 4 iterations runs [[beqz, andi, beqz, slli, srli, j]] (6), and 3 of them also run [[add]]: $24 + 3 = 27$. The exit [[beqz]] adds 1. The total is $3 + 27 + 1 = 31$.` });

  add({ id: 1353, lec: 10, title: "Byte Copy", diff: "Hard", topics: ["RISC-V Assembly", "Loads", "Stores"], answer: "0x6655",
    statement: t`Memory at [[0x300]] is all zeros. What is in [[a4]] at the end?

~~~
. = 0
      li   a0, 0x200
      li   a1, 0x300
      li   a2, 6
loop: lb   t0, 0(a0)
      sb   t0, 0(a1)
      addi a0, a0, 1
      addi a1, a1, 1
      addi a2, a2, -1
      bnez a2, loop
      lw   a3, 0x300(x0)
      lw   a4, 0x304(x0)
      unimp
. = 0x200
.word 0x44332211, 0x88776655
~~~

Answer in hex.`,
    hints: [t`The loop copies 6 bytes. Little-endian: byte [[0x204]] is [[0x55]].`],
    solution: t`Bytes [[0x204]] and [[0x205]] ([[0x55]], [[0x66]]) are copied to [[0x304]] and [[0x305]]. The other two bytes of that word stay 0, so [[a4 = 0x00006655]].` });

  add({ id: 1354, lec: 10, title: "Unsigned Branch", diff: "Easy", topics: ["RISC-V Assembly", "Branches"], answer: "1",
    statement: t`What is in [[a2]] at the end?

~~~
      li   a0, -5
      li   a1, 3
      bltu a0, a1, L
      li   a2, 1
      j    E
L:    li   a2, 2
E:    unimp
~~~`,
    hints: [t`As an unsigned number, $-5$ is [[0xFFFFFFFB]].`],
    solution: t`[[0xFFFFFFFB]] is not less than 3 unsigned, so the branch is not taken and [[a2 = 1]].` });

  add({ id: 1355, lec: 10, title: "Fibonacci Array", diff: "Medium", topics: ["RISC-V Assembly", "Arrays"], answer: "21",
    statement: t`What is in [[a2]] at the end?

~~~
. = 0
      li   a0, 0x400
      li   a1, 2
      li   t2, 8
loop: lw   t0, -8(a0)
      lw   t1, -4(a0)
      add  t0, t0, t1
      sw   t0, 0(a0)
      addi a0, a0, 4
      addi a1, a1, 1
      blt  a1, t2, loop
      lw   a2, -4(a0)
      unimp
. = 0x3F8
.word 1, 1
~~~`,
    hints: [t`Each iteration stores the sum of the two previous words. The loop runs for [[a1]] $= 2..7$.`],
    solution: t`The stored words are 2, 3, 5, 8, 13, 21. [[a2]] loads the last one: $21$.` });

  add({ id: 1356, lec: 10, title: "Recursive Fibonacci Calls", diff: "Hard", topics: ["RISC-V Assembly", "Procedures", "Stack"], answer: "15",
    statement: t`[[fib(n)]] returns $n$ for $n < 2$ and [[fib(n-1) + fib(n-2)]] otherwise. It is written in RISC-V with a [[jal ra, fib]] for each recursive call. The main program runs [[jal ra, fib]] once with [[a0 = 5]]. How many [[jal]] instructions run in total?`,
    hints: [t`Count the nodes in the call tree of [[fib(5)]].`],
    solution: t`Let $c(n)$ be the number of calls for [[fib(n)]]: $c(0) = c(1) = 1$ and $c(n) = 1 + c(n-1) + c(n-2)$. So $c(2) = 3$, $c(3) = 5$, $c(4) = 9$, $c(5) = 15$. Each call is one [[jal]]: $15$.` });

  add({ id: 1357, lec: 10, title: "Fibonacci Stack Depth", diff: "Hard", topics: ["Stack", "Calling Convention"], answer: "48",
    statement: t`In the recursive [[fib]] from the previous problem, each call with $n \ge 2$ pushes a 12-byte frame ([[ra]], [[a0]], and the first result). The base cases ($n < 2$) push nothing. For [[fib(5)]], how many bytes below its starting value does [[sp]] go at its lowest point?`,
    hints: [t`The deepest chain is [[fib(5)]] → [[fib(4)]] → [[fib(3)]] → [[fib(2)]] → [[fib(1)]].`],
    solution: t`Calls with $n = 5, 4, 3, 2$ are active at once, each with a 12-byte frame: $4 \cdot 12 = 48$ bytes.` });

  // ---------- L11: datapath and decode values
  add({ id: 1361, lec: 11, title: "ALU Output for a Load", diff: "Easy", topics: ["RISC-V Processor", "Datapath"], answer: "0x1004",
    statement: t`The processor runs [[lw x5, -4(x6)]] with [[x6 = 0x1008]]. What value is on the ALU output? Answer in hex.`,
    hints: [t`The ALU computes the address.`],
    solution: t`[[0x1008 + (-4) = 0x1004]]. This goes to the data memory address port.` });

  add({ id: 1362, lec: 11, title: "Next PC of a Not-Taken Branch", diff: "Easy", topics: ["RISC-V Processor", "Branches"], answer: "0x204",
    statement: t`[[beq x1, x2, -64]] is at [[0x200]], with [[x1 = 3]] and [[x2 = 4]]. What is the next PC? Answer in hex.`,
    hints: [t`Is the branch taken?`],
    solution: t`$3 \ne 4$, so the branch is not taken and the next PC is [[0x204]].` });

  add({ id: 1363, lec: 11, title: "LUI Write Data", diff: "Easy", topics: ["RISC-V Processor", "Immediates"], answer: "0xABCDE000",
    statement: t`What value does [[lui x5, 0xABCDE]] write into [[x5]]? Answer in hex.`,
    hints: [t`The immediate goes into bits $[31:12]$.`],
    solution: t`[[0xABCDE << 12 = 0xABCDE000]].` });

  add({ id: 1364, lec: 11, title: "Which Types Write Registers", diff: "Medium", topics: ["RISC-V Processor", "Control Signals"], answer: "5",
    statement: t`Consider these seven instruction types: OP, OP-IMM, LW, SW, BRANCH, JAL, JALR. For how many of them must [[WERF]] (register file write enable) be 1?`,
    hints: [t`Stores and branches produce no register result.`],
    solution: t`OP, OP-IMM, LW, JAL and JALR write [[rd]] (the jumps write [[pc + 4]]). SW and BRANCH do not. That is $5$.` });

  add({ id: 1365, lec: 11, title: "Which Types Use Data Memory", diff: "Easy", topics: ["RISC-V Processor", "Control Signals"], answer: "2",
    statement: t`Of the same seven types (OP, OP-IMM, LW, SW, BRANCH, JAL, JALR), how many need [[MemEnable]] (any data memory access) to be 1?`,
    hints: [t`Only loads and stores touch data memory.`],
    solution: t`LW and SW: $2$.` });

  add({ id: 1366, lec: 11, title: "Decode SLTI", diff: "Medium", topics: ["RISC-V Processor", "Instruction Encoding"], answer: "-2048",
    statement: t`The word [[0x8002A293]] has opcode [[0010011]] and funct3 [[010]], so it is [[slti]]. What is its immediate, in signed decimal?`,
    hints: [t`Bits $[31:20]$ are [[0x800]].`],
    solution: t`[[0x800]] as a 12-bit signed number is $-2048$, the most negative I-type immediate. The instruction is [[slti x5, x5, -2048]].` });

  add({ id: 1367, lec: 11, title: "Decode a Load Offset", diff: "Medium", topics: ["RISC-V Processor", "Instruction Encoding"], answer: "2044",
    statement: t`[[0x7FC12483]] is a [[lw]]. What is its offset, in decimal?`,
    hints: [t`I-type: bits $[31:20]$.`],
    solution: t`Bits $[31:20]$ are [[0x7FC]] $= 2044$, which is positive. The instruction is [[lw x9, 2044(x2)]].` });

  add({ id: 1368, lec: 11, title: "Read Ports for a 3-Source Instruction", diff: "Easy", topics: ["RISC-V Processor", "Register File"], answer: "3",
    statement: t`You add [[mac rd, rs1, rs2]], which computes [[reg[rd] <= reg[rs1] * reg[rs2] + reg[rd]]], to a single-cycle processor. How many register file read ports does the processor need now?`,
    hints: [t`[[rd]] is also read.`],
    solution: t`The instruction reads [[rs1]], [[rs2]] and [[rd]] in one cycle, so it needs $3$ read ports. (Fall 2025 Quiz 2, problem 3, added a third port for this.)` });

  add({ id: 1369, lec: 11, title: "MAC Result", diff: "Easy", topics: ["RISC-V Processor", "Datapath"], answer: "0x2E",
    statement: t`[[mac x2, x5, x10]] computes [[x2 <= x5 * x10 + x2]]. Before it runs, [[x2 = 0x10]], [[x5 = 6]] and [[x10 = 5]]. What is [[x2]] after it runs? Answer in hex.`,
    hints: [t`$6 \cdot 5 = 30$.`],
    solution: t`$30 + 16 = 46 =$ [[0x2E]].` });

  add({ id: 1370, lec: 11, title: "Repeat-Until-Zero Instruction", diff: "Hard", topics: ["RISC-V Processor", "Datapath"], answer: "5",
    statement: t`A custom instruction [[repclear rs1, rs2]] clears one array word per cycle: while [[reg[rs1] >= 1]] it stores 0 to [[reg[rs2] + offset]], decrements [[reg[rs1]]], adds 4 to [[offset]], and keeps [[pc]] the same. When [[reg[rs1] = 0]] it moves to [[pc + 4]]. With [[reg[rs1] = 4]] at the start, how many cycles does this one instruction take on a single-cycle processor?`,
    hints: [t`Count the cycle that finds [[reg[rs1] = 0]].`],
    solution: t`Four cycles clear four words (counts 4, 3, 2, 1). A fifth cycle sees 0 and moves on. The answer is $5$ cycles.` });

  // ---------- L12-L13: cache traces
  const TRACE = t`Memory word [[0x300 + 4k]] holds [[0x10 + k]] (so [[0x318]] holds [[0x16]] and [[0x324]] holds [[0x19]]). A direct-mapped, write-back, write-allocate cache holds 16 words with a block size of 4 words, and it holds both instructions and data. It starts empty. This code runs on a single-cycle processor:

~~~
. = 0x1000
lw x2, 0x318(x0)
sb x2, 0x325(x0)
lw x3, 0x324(x0)
lw x4, 0x364(x0)
lw x5, 0x324(x0)
~~~`;
  add({ id: 1381, lec: 13, title: "Trace: Value After a Byte Store", diff: "Medium", topics: ["Caches", "Stores"], answer: "0x1619",
    statement: t`${TRACE}

What value ends up in [[x3]]? Answer in hex.`,
    hints: [t`[[sb]] to [[0x325]] writes byte 1 of the word at [[0x324]].`],
    solution: t`[[x2 = 0x16]]. The word at [[0x324]] is [[0x19]]. Writing [[0x16]] into byte 1 gives [[0x1619]].` });

  add({ id: 1382, lec: 13, title: "Trace: Data Misses", diff: "Hard", topics: ["Caches", "Conflict Misses"], answer: "4",
    statement: t`${TRACE}

How many of the 5 data accesses miss?`,
    hints: [t`Index $= (\text{addr} \gg 4) \bmod 4$. [[0x324]] and [[0x364]] share index 2.`, t`The fifth instruction is at [[0x1010]], index 1, the same line as [[0x318]].`],
    solution: t`[[0x318]] misses (index 1). [[0x325]] misses (index 2). [[0x324]] hits (same block). [[0x364]] misses and evicts the dirty [[0x320]] block. The last [[0x324]] misses again. That is $4$ misses and 1 hit.` });

  add({ id: 1383, lec: 13, title: "Trace: Instruction Misses", diff: "Medium", topics: ["Caches", "Locality"], answer: "2",
    statement: t`${TRACE}

How many of the 5 instruction fetches miss?`,
    hints: [t`[[0x1000..0x100C]] form one block. [[0x1010]] starts the next block.`],
    solution: t`The fetch of [[0x1000]] misses and brings in the block, so [[0x1004]]–[[0x100C]] hit. [[0x1010]] is in a new block and misses. That is $2$ misses. (It also evicts the [[0x310]] data block from index 1.)` });

  add({ id: 1384, lec: 13, title: "Trace: Written-Back Word", diff: "Hard", topics: ["Caches", "Write-Back"], answer: "0x1619",
    statement: t`${TRACE}

When the dirty block is written back to memory, what value is written to [[Mem[0x324]]]? Answer in hex.`,
    hints: [t`Which access evicts the dirty block?`],
    solution: t`[[lw x4, 0x364]] evicts the dirty block [[0x320..0x32C]]. The words written back are [[0x18]], [[0x1619]], [[0x1A]], [[0x1B]]. [[Mem[0x324]]] gets [[0x1619]], so the last load reads the stored byte correctly.` });

  add({ id: 1385, lec: 13, title: "Trace: Load From Another Block", diff: "Easy", topics: ["Caches", "Loads"], answer: "0x29",
    statement: t`${TRACE}

What value ends up in [[x4]]? Answer in hex.`,
    hints: [t`$k = (0x364 - 0x300)/4$.`],
    solution: t`$k = 0x64/4 = 25$, so [[x4 = 0x10 + 25 = 0x29]].` });

  add({ id: 1386, lec: 13, title: "2-Way LRU Trace", diff: "Medium", topics: ["Caches", "LRU", "Set Associativity"], answer: "2",
    statement: t`A 2-way set-associative LRU cache has 4 sets of one-word blocks. How many hits occur for the byte addresses [[0x104, 0x204, 0x104, 0x304, 0x404, 0x304, 0x204]], from an empty cache?`,
    hints: [t`Set $= (\text{addr} \gg 2) \bmod 4$. All of these map to set 1.`],
    solution: t`104 miss, 204 miss, 104 hit, 304 miss (evicts 204), 404 miss (evicts 104), 304 hit, 204 miss. That is $2$ hits.` });

  add({ id: 1387, lec: 13, title: "Block Size and Hits", diff: "Medium", topics: ["Caches", "Block Size"], answer: "5",
    statement: t`A direct-mapped cache holds 16 words with a block size of 4. How many hits occur for the byte addresses [[0x0, 0x4, 0x8, 0xC, 0x40, 0x44, 0x0, 0x4, 0x48, 0x8]], from an empty cache? (With a block size of 1, there would be 0 hits.)`,
    hints: [t`Index $= (\text{addr} \gg 4) \bmod 4$. [[0x0]] and [[0x40]] map to index 0.`],
    solution: t`0 miss, 4 hit, 8 hit, C hit, 40 miss (evicts block 0), 44 hit, 0 miss, 4 hit, 48 miss, 8 miss. That is $5$ hits.` });

  // ---------- L14-L15: pipeline diagrams
  const G1 = t`~~~
addi x1, x0, 0x100
lw   x2, 0(x1)
add  x3, x2, x1
sw   x3, 8(x1)
xor  x4, x3, x2
~~~`;
  add({ id: 1401, lec: 14, title: "Diagram: When Does add Write Back", diff: "Medium", topics: ["Pipeline Diagrams", "Stalls"], answer: "9",
    statement: t`${PIPE} The processor has full bypassing. The first instruction is in IF on cycle 1.

${G1}

On which cycle is the [[add]] in WB?`,
    hints: [t`[[add]] waits in DEC for the load-to-use hazard.`],
    solution: t`[[addi]] is in IF on cycle 1, [[lw]] on 2, [[add]] on 3. [[add]] enters DEC on cycle 4 and stays until the [[lw]] is in WB (cycle 6). It is in EXE on 7, MEM on 8 and WB on $9$.` });

  add({ id: 1402, lec: 14, title: "Diagram: Cycles in DEC", diff: "Easy", topics: ["Pipeline Diagrams", "Stalls"], answer: "3",
    statement: t`${PIPE} Full bypassing, same code as the previous problem:

${G1}

For how many cycles is the [[add]] in DEC?`,
    hints: [t`One normal cycle plus the stall cycles.`],
    solution: t`Cycles 4, 5 and 6: $3$ cycles (1 + 2 stalls).` });

  add({ id: 1403, lec: 14, title: "Diagram: Last Write-Back", diff: "Medium", topics: ["Pipeline Diagrams"], answer: "11",
    statement: t`${PIPE} Full bypassing, same code:

${G1}

On which cycle is the [[xor]] in WB?`,
    hints: [t`[[sw]] and [[xor]] follow [[add]] with no more stalls.`],
    solution: t`[[add]] WB 9, [[sw]] WB 10, [[xor]] WB $11$. Five instructions take $5 + 4 + 2 = 11$ cycles.` });

  add({ id: 1404, lec: 14, title: "Diagram Without Bypassing", diff: "Hard", topics: ["Pipeline Diagrams", "Stalls"], answer: "18",
    statement: t`${PIPE} Now the processor has no bypass paths: a register is read in DEC only on the cycle after its writer is in WB. The first instruction is in IF on cycle 1.

${G1}

On which cycle is the [[xor]] in WB?`,
    hints: [t`[[addi]]→[[lw]], [[lw]]→[[add]] and [[add]]→[[sw]] are adjacent dependences. Does [[xor]] wait too?`],
    solution: t`Each adjacent dependence costs 3 cycles: $3 \cdot 3 = 9$ stalls. [[xor]] needs [[x3]] from [[add]], which is two instructions ahead. By the time [[xor]] reaches DEC, [[add]] has left WB, so it does not wait. The write-backs are: [[addi]] on 5, [[lw]] on 9, [[add]] on 13, [[sw]] on 17, and [[xor]] on $18$.` });

  add({ id: 1405, lec: 15, title: "Diagram: Branch Target Fetch", diff: "Easy", topics: ["Pipeline Diagrams", "Control Hazards"], answer: "5",
    statement: t`${PIPE} The first instruction is in IF on cycle 1.

~~~
      addi x1, x0, 1
      beq  x1, x1, tgt
      addi x2, x0, 2
      addi x3, x0, 3
tgt:  addi x4, x0, 4
~~~

On which cycle is the [[addi x4]] at [[tgt]] first in IF?`,
    hints: [t`The branch is in EXE on cycle 4.`],
    solution: t`[[beq]] is in IF on 2, DEC on 3, EXE on 4, where it resolves as taken. The two wrong-path [[addi]] instructions are annulled, and [[tgt]] is fetched on cycle $5$.` });

  add({ id: 1406, lec: 15, title: "Call and Return Loop", diff: "Hard", topics: ["Control Hazards", "CPI", "Procedures"], answer: "13/7",
    statement: t`${PIPE} The processor has full bypassing. What is the CPI of this loop, counting the instructions in [[f]]?

~~~
loop: lw   a0, 0(s0)
      jal  ra, f
      add  s1, s1, a0
      addi s0, s0, 4
      bne  s0, s2, loop
      ...
f:    slli a0, a0, 1
      ret
~~~`,
    hints: [t`There are three taken control transfers per iteration: [[jal]], [[ret]] and [[bne]].`, t`Does [[slli]] have to wait for the [[lw]]?`],
    solution: t`Each of [[jal]], [[ret]] and [[bne]] annuls 2 instructions: 6 cycles. The [[jal]] and its annulled slots separate [[lw]] from [[slli]], so there is no load stall. One iteration is $7 + 6 = 13$ cycles for 7 instructions: CPI $= 13/7$.` });

  add({ id: 1407, lec: 15, title: "Call Loop Without Bypass", diff: "Hard", topics: ["Hazards", "CPI"], answer: "16/7",
    statement: t`${PIPE} Now there is no bypassing. What is the CPI of the loop from the previous problem?`,
    hints: [t`Most dependences are spread out by the jumps. Look at [[addi]] → [[bne]].`],
    solution: t`The control transfers still cost 6 cycles. [[addi]] → [[bne]] is adjacent and costs 3 cycles. The other dependences are at least 3 slots apart. One iteration is $7 + 6 + 3 = 16$ cycles: CPI $= 16/7$.` });

  add({ id: 1408, lec: 15, title: "Branches Resolved in DEC", diff: "Medium", topics: ["Control Hazards", "CPI"], answer: "10/7",
    statement: t`A variant of the pipeline resolves branches and jumps in DEC, so a taken one annuls only 1 instruction. It has full bypassing. What is the CPI of the call-and-return loop ([[lw, jal, slli, ret, add, addi, bne]])?`,
    hints: [t`Three taken transfers at 1 cycle each.`],
    solution: t`$7 + 3 = 10$ cycles per iteration: CPI $= 10/7$.` });

  add({ id: 1409, lec: 15, title: "Loads Returning in MEM", diff: "Medium", topics: ["Hazards", "Bypassing"], answer: "7/4",
    statement: t`A variant of the pipeline returns load data in MEM, so a load can bypass from MEM to DEC. It has full bypassing and resolves branches in EXE. What is the CPI of this loop?

~~~
loop: lw   a1, 0(a0)
      add  a2, a2, a1
      addi a0, a0, 4
      bne  a0, a3, loop
~~~`,
    hints: [t`Load-to-use now costs 1 cycle instead of 2.`],
    solution: t`$4 + 1 + 2 = 7$ cycles per iteration: CPI $= 7/4$.` });

  add({ id: 1410, lec: 15, title: "If-Then-Else Loop", diff: "Hard", topics: ["Control Hazards", "CPI"], answer: "19/11",
    statement: t`${PIPE} Full bypassing. [[a0]] counts up from 0, so the loop alternates between odd and even values. What is the average CPI?

~~~
loop: andi t0, a0, 1
      beqz t0, even
      addi a1, a1, 1
      j    next
even: addi a2, a2, 1
next: addi a0, a0, 1
      bne  a0, a3, loop
~~~`,
    hints: [t`Take one even and one odd iteration together.`, t`Even: [[beqz]] is taken. Odd: [[beqz]] falls through, then [[j]] is taken.`],
    solution: t`Even iteration: [[andi, beqz]] (taken), [[addi, addi, bne]] (taken): 5 instructions + 4 = 9 cycles. Odd iteration: [[andi, beqz, addi, j]] (taken), [[addi, bne]] (taken): 6 instructions + 4 = 10 cycles. Together: 19 cycles for 11 instructions, CPI $= 19/11$.` });

  // Integer answers must match exactly.
  for (const p of P) {
    p.course = "6.191";
    if (p.tol === undefined && Number.isInteger(root.Expr.evaluate(p.answer))) p.tol = 0;
  }
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
