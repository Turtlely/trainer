// Problem bank for 6.191 Computation Structures (Fall 2026), part 1: L6-L9
// (sequential timing, sequential circuits in Minispec, pipelining, design tradeoffs).
// Original problems modeled on the 6.191 worksheets, practice quizzes, and the 6.004 OCW
// worksheets. Integer answers must match exactly (tol 0 is set at the end of the file).
(function (root) {
  const t = String.raw;
  const P = [];
  const add = (p) => P.push(p);

  // ---------- L6: sequential circuits (timing background from Quiz 1)
  add({ id: 1001, lec: 6, title: "Minimum Clock Period", diff: "Easy", topics: ["Timing", "Registers"], answer: "13",
    statement: t`A register feeds a block of combinational logic whose output feeds the same register. The register has $t_{PD} = 2$ ns and $t_{SETUP} = 1$ ns. The logic has $t_{PD} = 10$ ns. What is the minimum clock period, in ns?`,
    hints: [t`A value leaves the register $t_{PD,reg}$ after the edge, crosses the logic, and must be stable $t_{SETUP}$ before the next edge.`],
    solution: t`$t_{CLK} \ge t_{PD,reg} + t_{PD,logic} + t_{SETUP} = 2 + 10 + 1 = 13$ ns.` });

  add({ id: 1002, lec: 6, title: "Hold Time Budget", diff: "Medium", topics: ["Timing", "Hold Time"], answer: "2",
    statement: t`A register has contamination delay $t_{CD,reg} = 1$ ns and hold time $t_{HOLD} = 3$ ns. Its output goes through combinational logic and back into a register of the same type. What is the smallest contamination delay of the logic, in ns, that avoids a hold-time violation?`,
    hints: [t`The new value must not reach the next register's input until $t_{HOLD}$ after the clock edge.`],
    solution: t`The hold constraint is $t_{CD,reg} + t_{CD,logic} \ge t_{HOLD}$. So $t_{CD,logic} \ge 3 - 1 = 2$ ns.` });

  add({ id: 1003, lec: 6, title: "Two-Register Loop Frequency", diff: "Medium", topics: ["Timing", "Registers"], answer: "1000/15", tol: 1e-3,
    statement: t`Register R1 drives logic L1 ($t_{PD} = 7$ ns) into register R2. Register R2 drives logic L2 ($t_{PD} = 12$ ns) back into R1. Both registers have $t_{PD} = 1$ ns and $t_{SETUP} = 2$ ns. What is the maximum clock frequency, in MHz?`,
    hints: [t`Check every register-to-register path. The slowest one sets the clock period.`],
    solution: t`Path R1→R2: $1 + 7 + 2 = 10$ ns. Path R2→R1: $1 + 12 + 2 = 15$ ns. The clock period must be at least $15$ ns, so $f_{max} = 1/(15\text{ ns}) = 1000/15 \approx 66.7$ MHz.` });

  add({ id: 1004, lec: 6, title: "Logic Budget at 250 MHz", diff: "Easy", topics: ["Timing"], answer: "3.2",
    statement: t`A design must run at 250 MHz. Its registers have $t_{PD} = 0.5$ ns and $t_{SETUP} = 0.3$ ns. What is the largest propagation delay, in ns, that the logic between two registers can have?`,
    hints: [t`$t_{CLK} = 1/(250\text{ MHz}) = 4$ ns.`],
    solution: t`$t_{PD,logic} \le t_{CLK} - t_{PD,reg} - t_{SETUP} = 4 - 0.5 - 0.3 = 3.2$ ns.` });

  add({ id: 1005, lec: 6, title: "Fixing a Hold Violation", diff: "Medium", topics: ["Timing", "Hold Time"], answer: "4",
    statement: t`A short path goes from a register output, through logic with $t_{CD} = 0.5$ ns, into another register. The registers have $t_{CD} = 0.5$ ns and $t_{HOLD} = 2$ ns. You fix the hold violation by adding buffers in series on the path. Each buffer has $t_{CD} = 0.25$ ns. What is the minimum number of buffers?`,
    hints: [t`You need $0.5 + 0.5 + 0.25k \ge 2$.`],
    solution: t`$t_{CD,reg} + t_{CD,logic} + 0.25k \ge t_{HOLD}$ gives $1 + 0.25k \ge 2$, so $k \ge 4$. The answer is $4$ buffers.` });

  add({ id: 1006, lec: 6, title: "State Bits for an FSM", diff: "Easy", topics: ["FSM", "Registers"], answer: "4",
    statement: t`An FSM has 9 states and uses a binary state encoding. How many flip-flops does its state register need?`,
    hints: [t`$k$ bits encode $2^k$ states.`],
    solution: t`$2^3 = 8 < 9 \le 16 = 2^4$, so the state register needs $\lceil \log_2 9 \rceil = 4$ flip-flops.` });

  // ---------- L7: sequential circuits in Minispec
  add({ id: 1011, lec: 7, title: "Counter Wraparound", diff: "Easy", topics: ["Minispec", "Registers"], answer: "5",
    statement: t`Consider this module:

~~~
module Count;
    Reg#(Bit#(4)) r(0);
    rule tick;
        r <= r + 3;
    endrule
endmodule
~~~

What is the value of [[r]] after 7 clock cycles?`,
    hints: [t`A [[Bit#(4)]] value wraps modulo $16$.`],
    solution: t`After 7 cycles, $r = 7 \cdot 3 = 21 \bmod 16 = 5$.` });

  add({ id: 1012, lec: 7, title: "Simultaneous Register Updates", diff: "Medium", topics: ["Minispec", "Registers"], answer: "71",
    statement: t`Consider this module:

~~~
module Fib;
    Reg#(Bit#(8)) a(3);
    Reg#(Bit#(8)) b(7);
    rule step;
        a <= b;
        b <= a + b;
    endrule
endmodule
~~~

What is the value of [[a]] after 6 clock cycles? Give a decimal number.`,
    hints: [t`Every register read in a rule sees the value from the start of the cycle. All register writes happen together at the clock edge.`],
    solution: t`The pair $(a, b)$ goes $(3,7) \to (7,10) \to (10,17) \to (17,27) \to (27,44) \to (44,71) \to (71,115)$. After 6 cycles $a = 71$. No value exceeds $255$, so there is no wraparound.` });

  add({ id: 1013, lec: 7, title: "Accumulator Under Test", diff: "Medium", topics: ["Minispec", "Inputs and Methods"], answer: "12",
    statement: t`Consider these modules:

~~~
module Acc;
    Reg#(Bit#(8)) total(0);
    input Maybe#(Bit#(8)) in default = Invalid;
    method Bit#(8) out = total;
    rule tick;
        if (isValid(in)) total <= total + fromMaybe(?, in);
    endrule
endmodule
module AccTest;
    Acc acc;
    Reg#(Bit#(4)) cyc(0);
    rule test;
        if (cyc[0] == 0) acc.in = Valid(zeroExtend(cyc));
        $display("cycle %d: out = %d", cyc, acc.out);
        cyc <= cyc + 1;
        if (cyc == 7) $finish;
    endrule
endmodule
~~~

The test runs with [[sim AccTest]]. What value of [[out]] does the last line printed show?`,
    hints: [t`The input is Valid on cycles $0, 2, 4, 6$, with the cycle number as its value.`, t`A method returns the register value at the start of the cycle. An update on cycle $k$ is visible on cycle $k+1$.`],
    solution: t`The accumulator adds $0, 2, 4, 6$ at the ends of cycles $0, 2, 4, 6$. The last line is printed on cycle 7. By then all four updates are visible, so it prints $0 + 2 + 4 + 6 = 12$.` });

  add({ id: 1014, lec: 7, title: "Detecting Two Ones", diff: "Medium", topics: ["Minispec", "FSM"], answer: "3",
    statement: t`Consider this Moore FSM:

~~~
typedef enum { S0, S1, S2 } State;
module TwoOnes;
    Reg#(State) state(S0);
    input Bit#(1) in;
    method Bool out = (state == S2);
    rule tick;
        case (state)
            S0: state <= (in == 1) ? S1 : S0;
            S1: state <= (in == 1) ? S2 : S0;
            S2: state <= (in == 1) ? S2 : S0;
        endcase
    endrule
endmodule
~~~

On cycles $0$ through $7$ the input is $1, 1, 0, 1, 1, 1, 0, 1$. On how many of the cycles $0$ through $8$ is [[out]] True?`,
    hints: [t`The output on cycle $k$ depends only on the state on cycle $k$. That state depends on the inputs from cycles $0$ to $k-1$.`],
    solution: t`The states on cycles $0..8$ are S0, S1, S2, S0, S1, S2, S2, S0, S1. The output is True on cycles 2, 5 and 6. That is $3$ cycles.` });

  add({ id: 1015, lec: 7, title: "Overlapping 101 Detector", diff: "Medium", topics: ["FSM", "Minispec"], answer: "4",
    statement: t`A Moore FSM detects the pattern $101$, and overlapping matches count. It has four states: S0 (no progress), S1 (seen 1), S2 (seen 10), and S3 (seen 101; output 1). From S3, an input of 1 goes to S1 and an input of 0 goes to S2. The FSM starts in S0. On cycles $0..9$ the input is $1,0,1,0,1,1,0,1,0,1$. On how many of the cycles $0..10$ is the output 1?`,
    hints: [t`From S3, the last "1" can start a new match, so S3 goes to S2 on a 0.`],
    solution: t`The states on cycles $0..10$ are S0, S1, S2, S3, S2, S3, S1, S2, S3, S2, S3. The output is 1 on cycles 3, 5, 8 and 10. That is $4$ cycles.` });

  add({ id: 1016, lec: 7, title: "Rotating a Byte", diff: "Easy", topics: ["Minispec", "Registers"], answer: "0x04",
    statement: t`[[Reg#(Bit#(8)) x(1);]] is updated every cycle by [[x <= (x << 1) | (x >> 7);]]. What is [[x]] after 10 cycles? You can answer in hex.`,
    hints: [t`This rotates left by one bit each cycle. After 8 cycles the byte is back where it started.`],
    solution: t`Ten rotations equal $10 \bmod 8 = 2$ rotations. So $x = 1 \ll 2 = 4 =$ [[0x04]].` });

  add({ id: 1017, lec: 7, title: "GCD Cycle Count", diff: "Medium", topics: ["Minispec", "Sequential Algorithms"], answer: "6",
    statement: t`This module computes a GCD by repeated subtraction:

~~~
module GCD;
    Reg#(Bit#(8)) a(15);
    Reg#(Bit#(8)) b(6);
    rule step;
        if (b != 0) begin
            if (a >= b) a <= a - b;
            else begin a <= b; b <= a; end
        end
    endrule
    method Bool done = (b == 0);
endmodule
~~~

After how many clock cycles does [[done]] first become True?`,
    hints: [t`Trace the pair $(a, b)$ one cycle at a time. A swap takes one cycle.`],
    solution: t`The pair goes $(15,6) \to (9,6) \to (3,6) \to (6,3) \to (3,3) \to (0,3) \to (3,0)$. That is 6 cycles, and the result $a = 3$ is correct.` });

  add({ id: 1018, lec: 7, title: "GCD Result and Time", diff: "Medium", topics: ["Minispec", "Sequential Algorithms"], answer: "8",
    statement: t`Use the GCD module from the previous problem, but with initial values [[a(64)]] and [[b(24)]]. How many cycles does it take until [[b == 0]]?`,
    hints: [t`$(64,24) \to (40,24) \to \dots$`],
    solution: t`The pair goes $(64,24) \to (40,24) \to (16,24) \to (24,16) \to (8,16) \to (16,8) \to (8,8) \to (0,8) \to (8,0)$. That is $8$ cycles, and $\gcd = 8$.` });

  add({ id: 1019, lec: 7, title: "Packing Nibbles", diff: "Hard", topics: ["Minispec", "Maybe Types"], answer: "0x4321",
    statement: t`This module packs four 4-bit inputs into a 16-bit word. New nibbles enter at the top:

~~~
module Pack;
    Reg#(Bit#(16)) buf(0);
    Reg#(Bit#(2)) cnt(0);
    Reg#(Bool) full(False);
    input Maybe#(Bit#(4)) in default = Invalid;
    method Maybe#(Bit#(16)) out = full ? Valid(buf) : Invalid;
    rule tick;
        full <= isValid(in) && (cnt == 3);
        if (isValid(in)) begin
            buf <= {fromMaybe(?, in), buf[15:4]};
            cnt <= cnt + 1;
        end
    endrule
endmodule
~~~

On cycles $0..5$ the input is [[Valid(1)]], [[Valid(2)]], [[Invalid]], [[Valid(3)]], [[Valid(4)]], [[Valid(5)]], and on cycle 6 it is [[Invalid]]. During cycles $0..6$, [[out]] is Valid on exactly one cycle. What value does it hold on that cycle? Answer in hex.`,
    hints: [t`[[cnt]] counts valid inputs. It equals 3 when the fourth valid nibble arrives.`, t`Each valid nibble shifts [[buf]] right by 4 and places the new nibble in bits $[15:12]$.`],
    solution: t`After the valid inputs 1, 2, 3, 4, [[buf]] is [[0x1000]], [[0x2100]], [[0x3210]], [[0x4321]]. The fourth valid input arrives on cycle 4 with [[cnt == 3]], so [[full]] is True on cycle 5. On cycle 5, [[out]] is [[Valid(0x4321)]]. The new nibble 5 changes [[buf]] only at the end of cycle 5.` });

  add({ id: 1020, lec: 7, title: "When Is the Packed Word Ready", diff: "Easy", topics: ["Minispec", "Maybe Types"], answer: "5",
    statement: t`Use the [[Pack]] module and inputs from the previous problem. On which cycle number is [[out]] Valid?`,
    hints: [t`[[full]] is a register, so it shows the condition from the previous cycle.`],
    solution: t`The fourth valid nibble arrives on cycle 4. [[full]] becomes True at the end of cycle 4, so [[out]] is Valid on cycle $5$.` });

  add({ id: 1021, lec: 7, title: "Counting Flip-Flops", diff: "Easy", topics: ["Minispec", "Registers"], answer: "36",
    statement: t`A Minispec module declares [[Vector#(4, Reg#(Bit#(8))) regs(0);]], [[Reg#(Bit#(3)) idx(0);]] and [[Reg#(Bool) busy(False);]]. It has no submodules. How many flip-flops does it contain?`,
    hints: [t`A [[Bool]] is 1 bit.`],
    solution: t`$4 \cdot 8 + 3 + 1 = 36$ flip-flops.` });

  add({ id: 1022, lec: 7, title: "LFSR Period", diff: "Medium", topics: ["Minispec", "Registers"], answer: "15",
    statement: t`[[Reg#(Bit#(4)) r(1);]] is updated every cycle by [[r <= {r[2:0], r[3] ^ r[2]};]]. After how many cycles does [[r]] first return to [[4'b0001]]?`,
    hints: [t`Trace it. A 4-bit LFSR with good taps visits every nonzero state.`],
    solution: t`The sequence is 0001, 0010, 0100, 1001, 0011, 0110, 1101, 1010, 0101, 1011, 0111, 1111, 1110, 1100, 1000, 0001. It returns after $15$ cycles, the maximum for 4 bits.` });

  add({ id: 1023, lec: 7, title: "Display Before Update", diff: "Easy", topics: ["Minispec", "Registers"], answer: "10",
    statement: t`A rule contains [[x <= x + 5;]] followed by [[$display(x);]]. [[Reg#(Bit#(8)) x(0);]] starts at 0. What value does the [[$display]] print on cycle 2 (the third cycle)?`,
    hints: [t`[[$display]] in a rule sees the register value at the start of the cycle, even if it comes after the write.`],
    solution: t`At the start of cycles 0, 1, 2, $x$ is 0, 5, 10. The write takes effect only at the clock edge, so cycle 2 prints $10$.` });

  // ---------- L8: introduction to pipelining
  const CHAIN = t`A combinational circuit is a chain of four components from input X to output Z: $A$ (4 ns) → $B$ (3 ns) → $C$ (5 ns) → $D$ (2 ns).`;
  add({ id: 1031, lec: 8, title: "Chain: Combinational Latency", diff: "Easy", topics: ["Pipelining", "Latency"], answer: "14",
    statement: t`${CHAIN} What is the latency of the combinational circuit, in ns?`,
    hints: [t`Latency is the longest input-to-output path delay.`],
    solution: t`$4 + 3 + 5 + 2 = 14$ ns. The throughput is $1/14$ per ns.` });

  add({ id: 1032, lec: 8, title: "Chain: Max-Throughput Latency", diff: "Easy", topics: ["Pipelining", "Latency", "Throughput"], answer: "20",
    statement: t`${CHAIN} You pipeline it for maximum throughput with ideal registers ($t_{PD} = t_{SETUP} = 0$), one register on the output, and the fewest stages. What is the latency, in ns?`,
    hints: [t`The slowest component sets $t_{CLK} = 5$ ns. Group neighbors only if their sum fits in 5 ns.`],
    solution: t`$t_{CLK} = 5$ ns. No pair of neighbors fits in 5 ns ($4+3$, $3+5$, $5+2$ all exceed 5). So there are 4 stages and the latency is $4 \cdot 5 = 20$ ns. The throughput is $1/5$ per ns.` });

  add({ id: 1033, lec: 8, title: "Chain: Best 2-Stage Pipeline", diff: "Medium", topics: ["Pipelining", "Throughput"], answer: "1/7",
    statement: t`${CHAIN} What is the highest throughput, in ns$^{-1}$, of a valid 2-stage pipeline of this circuit with ideal registers?`,
    hints: [t`Choose one cut point in the chain. The slower half sets $t_{CLK}$.`],
    solution: t`The cuts give $\max(4, 10) = 10$, $\max(7, 7) = 7$, or $\max(12, 2) = 12$. The best is $t_{CLK} = 7$ ns, so the throughput is $1/7$ per ns and the latency is $14$ ns.` });

  add({ id: 1034, lec: 8, title: "Chain With Real Registers", diff: "Medium", topics: ["Pipelining", "Timing"], answer: "26",
    statement: t`${CHAIN} Now the pipeline registers have $t_{PD} = 1$ ns and $t_{SETUP} = 0.5$ ns. You pipeline for maximum throughput with the fewest stages. What is the latency, in ns?`,
    hints: [t`$t_{CLK} = t_{PD,reg} + (\text{slowest stage logic}) + t_{SETUP}$.`],
    solution: t`The slowest stage still holds only $C$, so $t_{CLK} = 1 + 5 + 0.5 = 6.5$ ns. With 6.5 ns, no two neighbors fit in a stage, so there are still 4 stages. The latency is $4 \cdot 6.5 = 26$ ns.` });

  const DAG = t`A circuit has inputs X and Y and output Z. Its components and delays (ns) are $A = 2$, $B = 3$, $C = 6$, $D = 4$, $E = 1$, $F = 5$. The connections are: X→A, X→B, A→C, B→D, Y→D, C→F, D→E, E→F, F→Z.`;
  add({ id: 1035, lec: 8, title: "Two-Path Circuit: Latency", diff: "Easy", topics: ["Pipelining", "Latency"], answer: "13",
    statement: t`${DAG} What is the latency of the combinational circuit, in ns?`,
    hints: [t`List the input-to-output paths and add their delays.`],
    solution: t`The paths are X-A-C-F $= 13$, X-B-D-E-F $= 13$ and Y-D-E-F $= 10$. The latency is $13$ ns.` });

  add({ id: 1036, lec: 8, title: "Two-Path Circuit: Max Throughput", diff: "Medium", topics: ["Pipelining", "Contours"], answer: "18",
    statement: t`${DAG} You pipeline it for maximum throughput with ideal registers and the minimum latency for that throughput. What is the latency, in ns?`,
    hints: [t`$t_{CLK} = 6$ ns, the delay of $C$. Place each component in the earliest stage where its path still fits in 6 ns.`],
    solution: t`With $t_{CLK} = 6$: $A$ (ends at 2) and $B$ (3) are in stage 1. $C$ cannot join $A$ ($2 + 6 > 6$), so it is in stage 2. $D$ cannot join $B$ ($3+4 > 6$), so it is in stage 2, and $E$ ends there at 5. $F$ cannot fit after $C$ in stage 2, so it is in stage 3. That gives 3 stages and a latency of $18$ ns at throughput $1/6$.` });

  add({ id: 1037, lec: 8, title: "Two-Path Circuit: 2 Stages", diff: "Hard", topics: ["Pipelining", "Contours"], answer: "16",
    statement: t`${DAG} What is the latency, in ns, of the maximum-throughput 2-stage pipeline with ideal registers?`,
    hints: [t`Find the smallest $t_{CLK}$ for which 2 stages are enough.`, t`One contour must cut both the A-C-F path and the B-D-E-F path. $F$ alone is 5 ns.`],
    solution: t`Put the contour just before $F$. Stage 1 holds $A, C$ (8 ns) and $B, D, E$ (8 ns), and stage 2 holds $F$ (5 ns). That gives $t_{CLK} = 8$. A smaller period fails: with $t_{CLK} < 8$, $C$ cannot share a stage with $A$, and then $F$ needs a third stage. The latency is $2 \cdot 8 = 16$ ns and the throughput is $1/8$.` });

  add({ id: 1038, lec: 8, title: "Two-Path Circuit: Real Registers", diff: "Hard", topics: ["Pipelining", "Timing"], answer: "24",
    statement: t`${DAG} The registers now have $t_{PD} = 1$ ns and $t_{SETUP} = 1$ ns. You pipeline for maximum throughput and minimum latency. What is the latency, in ns?`,
    hints: [t`Register overhead adds 2 ns to every stage. Each stage can still hold 6 ns of logic.`],
    solution: t`$t_{CLK} = 1 + 6 + 1 = 8$ ns. The logic budget per stage is 6 ns, so the stage assignment is the same as the ideal case: 3 stages. The latency is $3 \cdot 8 = 24$ ns.` });

  add({ id: 1039, lec: 8, title: "Registers on Every Path", diff: "Medium", topics: ["Pipelining", "Contours"], answer: "3",
    statement: t`In a well-formed 3-stage pipeline (with the convention of a register on each output), how many pipeline registers lie on every path from any input to any output?`,
    hints: [t`This is the definition of a $K$-stage pipeline.`],
    solution: t`A $K$-stage pipeline has exactly $K$ registers on every input-to-output path. Here $K = 3$.` });

  add({ id: 1040, lec: 8, title: "Pipelining a Tree of Adders", diff: "Medium", topics: ["Pipelining", "Throughput"], answer: "8",
    statement: t`A circuit computes $a\cdot b + c\cdot d + e\cdot f + g\cdot h$. It uses four multipliers (4 ns each) in parallel, two adders (2 ns each) that add pairs of products, and a final adder (2 ns). You pipeline it for maximum throughput with ideal registers and minimum latency. What is the latency, in ns?`,
    hints: [t`$t_{CLK} = 4$ ns. Two adders in series take exactly 4 ns.`],
    solution: t`Stage 1 holds the multipliers. Stage 2 holds both adder levels ($2 + 2 = 4$ ns). There are 2 stages at 4 ns, so the latency is $8$ ns.` });

  add({ id: 1041, lec: 8, title: "Throughput of a Long Run", diff: "Easy", topics: ["Pipelining", "Throughput"], answer: "1007",
    statement: t`An 8-stage pipeline has $t_{CLK} = 1$ ns. How many ns does it take to process 1000 inputs, from when the first input is applied until the 1000th output appears?`,
    hints: [t`The first output takes the full latency. After that, one output appears every cycle.`],
    solution: t`The first output appears after $8$ ns. The other 999 appear one per ns. The total is $8 + 999 = 1007$ ns.` });

  add({ id: 1042, lec: 8, title: "Pipelining a NAND Circuit", diff: "Hard", topics: ["Pipelining", "Timing"], answer: "1/3",
    statement: t`A large combinational circuit is built only from 2-input NAND gates with $t_{PD} = 1$ ns. You pipeline it for maximum throughput. The registers have $t_{PD} = 1$ ns and $t_{SETUP} = 1$ ns. What is the throughput, in ns$^{-1}$?`,
    hints: [t`The finest pipelining puts one gate per stage.`],
    solution: t`The best you can do is one NAND per stage, so $t_{CLK} = 1 + 1 + 1 = 3$ ns. The throughput is $1/3$ per ns. (This is a classic 6.004 worksheet question.)` });

  // ---------- L9: design tradeoffs in sequential circuits
  add({ id: 1051, lec: 9, title: "Adders in an Array Multiplier", diff: "Easy", topics: ["Multipliers", "Area"], answer: "15",
    statement: t`A combinational 16-bit by 16-bit multiplier adds the partial products with a chain of 16-bit adders, as in lecture. How many adders does it use?`,
    hints: [t`The first partial product needs no adder.`],
    solution: t`An $N$-bit multiplier needs $N - 1$ adders. For $N = 16$ that is $15$.` });

  add({ id: 1052, lec: 9, title: "Product Width", diff: "Easy", topics: ["Multipliers"], answer: "40",
    statement: t`How many bits do you need to hold the full product of a 24-bit unsigned number and a 16-bit unsigned number?`,
    hints: [t`An $N$-digit number times an $M$-digit number has at most $N + M$ digits.`],
    solution: t`$24 + 16 = 40$ bits.` });

  add({ id: 1053, lec: 9, title: "Folded Multiplier Throughput", diff: "Medium", topics: ["Folding", "Throughput"], answer: "64",
    statement: t`A folded 32-bit multiplier uses one adder and handles one bit of the multiplier per cycle, so a multiply takes 32 cycles. The clock period is 2 ns, and a new multiply starts as soon as the last one finishes. How many ns pass between consecutive results?`,
    hints: [t`Throughput of a folded design $= 1/(N \cdot t_{CLK})$.`],
    solution: t`$32 \cdot 2 = 64$ ns per result.` });

  add({ id: 1054, lec: 9, title: "Pipelined Multiplier Throughput", diff: "Medium", topics: ["Pipelining", "Multipliers"], answer: "1/3",
    statement: t`A 32-bit multiplier is a chain of 31 adders. Each adder has $t_{PD} = 3$ ns. You put an ideal register after every adder. What is the throughput, in results per ns?`,
    hints: [t`Each stage has one adder.`],
    solution: t`$t_{CLK} = 3$ ns, so the throughput is $1/3$ per ns. The latency is $31 \cdot 3 = 93$ ns, the same as the combinational version.` });

  add({ id: 1055, lec: 9, title: "Throughput per Area", diff: "Hard", topics: ["Area", "Throughput", "Folding"], answer: "(93*3100)/(96*160)",
    statement: t`An adder costs 100 area units and a 32-bit register costs 20 units. Design C is a combinational 32-bit multiplier: 31 adders, no registers, and $t_{PD} = 31 \cdot 3 = 93$ ns. Design F is folded: 1 adder, 3 registers, $t_{CLK} = 3$ ns, and 32 cycles per result. Define efficiency as (results per ns)/(area). By what factor is F's efficiency larger than C's?`,
    hints: [t`C: area $3100$, throughput $1/93$. F: area $100 + 3\cdot 20 = 160$, throughput $1/96$.`],
    solution: t`C: $\frac{1/93}{3100}$. F: $\frac{1/96}{160}$. The ratio is $\frac{93 \cdot 3100}{96 \cdot 160} = \frac{288300}{15360} \approx 18.8$. Folding cuts the area by a factor of $19.4$, and the throughput drops only by $96/93$.` });

  add({ id: 1056, lec: 9, title: "Valid Bits Through a Pipeline", diff: "Easy", topics: ["Minispec", "Pipelining", "Maybe Types"], answer: "3",
    statement: t`A 3-stage Minispec pipeline uses [[Maybe]] types for its input and its pipeline registers, so invalid inputs flow through as [[Invalid]]. The output is the last pipeline register. A single [[Valid]] input arrives on cycle 0, and all other inputs are [[Invalid]]. On which cycle is the output Valid?`,
    hints: [t`The value is written into the first register at the end of cycle 0.`],
    solution: t`The value is in register 1 on cycle 1, register 2 on cycle 2, and register 3 (the output) on cycle $3$.` });

  add({ id: 1057, lec: 9, title: "Stall Signals", diff: "Medium", topics: ["Minispec", "Pipelining", "Stalls"], answer: "1",
    statement: t`A 2-stage pipeline uses valid bits and stall logic, as in the L9 worksheet:

~~~
Bool stall2 = stallOutput && isValid(pipeReg2);
Bool stall1 = stall2 && isValid(pipeReg1);
~~~

On one cycle, [[stallOutput]] is True, [[pipeReg2]] is Valid, and [[pipeReg1]] is Invalid. How many of the two stages stall? Answer 0, 1 or 2.`,
    hints: [t`A stage stalls only if it holds a valid value that cannot move forward.`],
    solution: t`[[stall2]] is True because the consumer is not ready and stage 2 holds a value. [[stall1]] is False because [[pipeReg1]] is empty, so stage 1 can accept a new input into the empty register. So $1$ stage stalls.` });

  add({ id: 1058, lec: 9, title: "Interleaving for Throughput", diff: "Medium", topics: ["Interleaving", "Throughput"], answer: "1/4",
    statement: t`A combinational module has $t_{PD} = 12$ ns. You build a 3-way interleaved version of it. Ignore the delay of the steering logic. What is its throughput, in results per ns?`,
    hints: [t`An $N$-way interleaved module behaves like an $N$-stage pipeline.`],
    solution: t`It takes 3 inputs per 12 ns, so the throughput is $3/12 = 1/4$ per ns. The latency stays $12$ ns.` });

  add({ id: 1059, lec: 9, title: "Folded Reduction", diff: "Medium", topics: ["Folding", "Latency"], answer: "35",
    statement: t`You add up 8 numbers with a single folded adder. It adds one new number to an accumulator register per cycle, and the first cycle loads the first number. So 8 cycles are needed per sum. The clock period is the adder delay, 4 ns, plus 0.375 ns of mux and register overhead. What is the latency of one sum, in ns?`,
    hints: [t`$t_{CLK} = 4.375$ ns.`],
    solution: t`$8 \cdot 4.375 = 35$ ns. A tree of 7 adders would finish in $3 \cdot 4 = 12$ ns but uses 7 times the adder area.` });

  add({ id: 1060, lec: 9, title: "Area Ratio of Adder Tree", diff: "Easy", topics: ["Area"], answer: "7",
    statement: t`A combinational tree that adds 8 numbers uses 2-input adders. How many adders does it need?`,
    hints: [t`Each adder reduces the count of numbers by one.`],
    solution: t`Going from 8 numbers to 1 removes 7 numbers, and each adder removes one. So it needs $7$ adders (4 + 2 + 1).` });

  // Integer answers must match exactly.
  for (const p of P) {
    p.course = "6.191";
    if (p.tol === undefined && Number.isInteger(root.Expr.evaluate(p.answer))) p.tol = 0;
  }
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
