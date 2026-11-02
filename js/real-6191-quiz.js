// Transcribed text and redrawn figures for the 6.191 past Quiz 2 problems
// (Fall 2025, Spring 2025, Spring 2026). Keys match the "img" keys in problems-6191-real.js.
// The official answers stay in problems-6191-real.js (the graded parts).
(function (root) {
  const t = String.raw;
  const R = (root.REAL_6191 = root.REAL_6191 || {});
  const { t: tx, w, box, graph, svg, def, dot } = root.Fig;

  // ================================================================ Fall 2025

  R["q2fa25-p1"] = {
    statement: t`**Sequential circuits in Minispec (error-corrected communication).** Ben Bitdiddle implements a UART (Universal Asynchronous Receiver/Transmitter) protocol in Minispec. The protocol sends data serially, one bit at a time, with start and stop bits that mark the beginning and end of a packet. All of this data goes on a single [[tx]] (transmission) wire from a sender module to a receiver module. A standard frame is:

- 1 start bit (always 0)
- 8 data bits (LSB first)
- 1 parity bit (parity of the count of 1s in the data bits: 1 if odd, 0 if even)
- 1 stop bit (always 1)

**(A) (8 points)** Fill in the skeleton of the [[Transmit]] module so that it sends frames to this specification. The module starts in the [[Idle]] state and sends a 1 every cycle (the default value of [[tx]] is 1) until it receives valid input data. Then it sends a standard frame that begins with a start bit of 0. Each bit is sent for exactly 1 clock cycle. The data and parity bits are sent in the [[Sending]] state. The module ignores input that arrives when it is not in the [[Idle]] state.

~~~
typedef enum { Idle, Sending, Stop } TransmitState;

module Transmit;
   Reg#(Bit#(8)) currData;
   Reg#(TransmitState) state(Idle);
   Reg#(Bit#(1)) tx(1);
   Reg#(Bit#(4)) idx;
   Reg#(Bit#(1)) parity;

   input Maybe#(Bit#(8)) inputData default = Invalid;

   rule transmit;
      case (state)
         Idle: begin
            if (__________) begin
               __________ <= __________;
               __________ <= 0;
               __________ <= 0;
               state <= __________;
               idx <= __________;
            end
         end
         Sending: begin
            if (idx < ____) begin
               tx <= __________;
               parity <= __________ ^ __________;
               idx <= __________;
            end
            else begin
               tx <= __________;
               state <= Stop;
            end
         end
         Stop: begin
            __________ <= __________;
            state <= __________;
         end
      endcase
   endrule

   method Bit#(1) txWire;
      return __________;
   endmethod
endmodule
~~~

**(B) (3 points)** Fill in the table with the values of the internal registers of [[Transmit]] over 13 clock cycles, for the [[inputData]] values shown. All registers start with undefined values (?) unless they have an initial value. "Inv" is the Minispec [[Invalid]] and "V(x)" is [[Valid(x)]].

| Cycle | 0 | 1 | 2 | 3 | ... | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|
| inputData | V(0xA7) | Inv | Inv | Inv | ... | Inv | V(0x11) | Inv | Inv | Inv |
| currData | | | | | ... | | | | | |
| state | | | | | ... | | | | | |
| tx | | | | | ... | | | | | |
| idx | | | | | ... | | | | | |

**(C) (7 points)** Fill in the [[Receive]] module. It is always connected to the [[tx]] wire of a correct [[Transmit]] module. Keep the order of the incoming bits in mind. The module stays in [[Idle]] until it sees a 0, which it takes as a valid start bit. Then it goes to [[Receiving]] to process the data and parity. The method [[receivedByte]] returns [[Invalid]] unless the module just finished receiving a complete valid message. A frame that does not match the specification exactly (start, stop, and parity bits included) is invalid.

~~~
typedef enum { Idle, Receiving, Stop } ReceiveState;

module Receive;
   // Collects a single-byte message and only returns valid data
   // if the parity of the received data and the expectedParity bits match.
   // Expect the data to be coming in with the least-significant bit first
   // and ensure that the output is returned in the correct order.
   Reg#(ReceiveState) state(Idle);
   Reg#(Bit#(1)) parity, expectedParity;
   Reg#(Bit#(4)) idx;
   Reg#(Bit#(8)) data;

   input Bit#(1) txWire;

   rule receive;
      case (state)
         Idle: begin
            if (__________) begin
               state <= Receiving;
               // initialization logic
               expectedParity <= __________;
               idx <= __________;
               data <= __________;
            end
         end
         Receiving: begin
            if (idx == ____) begin
               state <= Stop;
               parity <= __________;
            end else begin
               data[idx] <= __________;
               expectedParity <= __________;
            end
            idx <= idx + 1;
         end
         Stop: begin
            state <= __________;
         end
      endcase
   endrule

   method Maybe#(Bit#(8)) receivedByte;
      return (state == ______)
          && (__________)
          && (__________) ? Valid(data) : Invalid;
   endmethod
endmodule
~~~`,
    solution: t`**(A)**

~~~
Idle: begin
   if (isValid(inputData)) begin
      currData <= fromMaybe(?, inputData);
      tx <= 0;
      parity <= 0;
      state <= Sending;
      idx <= 0;
   end
end
Sending: begin
   if (idx < 8) begin
      tx <= currData[idx];
      parity <= parity ^ currData[idx];
      idx <= idx + 1;
   end
   else begin
      tx <= parity;
      state <= Stop;
   end
end
Stop: begin
   tx <= 1;
   state <= Idle;
end
...
method Bit#(1) txWire;
   return tx;
endmethod
~~~

**(B)** 0xA7 = 1010 0111, so the data bits sent LSB first are 1, 1, 1, 0, 0, 1, 0, 1. The input V(0x11) in cycle 9 is ignored because the module is not in [[Idle]].

| Cycle | 0 | 1 | 2 | 3 | ... | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|
| inputData | V(0xA7) | Inv | Inv | Inv | ... | Inv | V(0x11) | Inv | Inv | Inv |
| currData | ? | 0xA7 | 0xA7 | 0xA7 | ... | 0xA7 | 0xA7 | 0xA7 | 0xA7 | 0xA7 |
| state | Idle | Sending | Sending | Sending | ... | Sending | Sending | Stop | Idle | Idle |
| tx | 1 | 0 | 1 | 1 | ... | 0 | 1 | 1 | 1 | 1 |
| idx | ? | 0 | 1 | 2 | ... | 7 | 8 | 8 | 8 | 8 |

**(C)**

~~~
Idle: begin
   if (txWire == 0) begin
      state <= Receiving;
      expectedParity <= 0;
      idx <= 0;
      data <= 0;
   end
end
Receiving: begin
   if (idx == 8) begin
      state <= Stop;
      parity <= txWire;
   end else begin
      data[idx] <= txWire;
      expectedParity <= expectedParity ^ txWire;
   end
   idx <= idx + 1;
end
Stop: begin
   state <= Idle;
end
...
method Maybe#(Bit#(8)) receivedByte;
   return (state == Stop)
       && (expectedParity == parity)
       && (txWire == 1) ? Valid(data) : Invalid;
endmethod
~~~`,
  };

  // ASSEMBLE dataflow graph. regs: { "a>b": count } places register dots (solutions).
  const ASM_NODES = {
    "@W": [180, 20, "W"], w5: [180, 80, "5ns"], "@X": [24, 160, "X"], n7: [92, 160, "7ns"],
    n1: [180, 160, "1ns"], n2: [266, 160, "2ns"], n3: [352, 160, "3ns"], n6: [180, 240, "6ns"],
    "@Y": [180, 304, "Y"], n5m: [266, 240, "5ns"], n5r: [352, 240, "5ns"], n4: [434, 200, "4ns"], "@Z": [492, 200, "Z"],
  };
  const ASM_EDGES = ["@W>w5", "@X>n7", "n7>n1", "w5>n1", "n6>n1", "@Y>n6", "n1>n2", "n2>n3", "n2>n5m", "n6>n5m",
    "n5m>n5r", "n5r>n3", "w5>n3", "n3>n4", "n5r>n4", "n4>@Z"];
  const assemble = (regs = {}) => svg(506, 322, graph(ASM_NODES, ASM_EDGES, { regs, rc: "acc" }));
  def("fa25-asm", assemble());
  def("fa25-asm-2", assemble({ "w5>n3": 1, "n2>n3": 1, "n5m>n5r": 1, "n4>@Z": 1 }));
  def("fa25-asm-max", assemble({
    "@W>w5": 1, "n7>n1": 1, "@Y>n6": 1, "w5>n3": [0.3, 0.75, 0.88], "n1>n2": 1, "n2>n3": [0.35, 0.65],
    "n6>n5m": 1, "n5m>n5r": 1, "n5r>n3": 1, "n5r>n4": 1, "n4>@Z": 1,
  }));
  def("fa25-asm-block", svg(330, 110,
    box(110, 15, 150, 80, "ASSEMBLE", { r: 12, s: 15 }),
    tx(60, 30, "W", { s: 15 }), w("72,30 110,30"), tx(60, 55, "X", { s: 15 }), w("72,55 110,55"),
    tx(60, 80, "Y", { s: 15 }), w("72,80 110,80"), w("260,55 300,55"), tx(314, 55, "Z", { s: 15 })));

  // DOUGH and SAUCE with their given registers (black dots).
  const DOUGH_N = {
    "@A": [20, 30, "A"], a1: [74, 30, "1ns"], "@B": [20, 90, "B"], b5: [74, 90, "5ns"], "@C": [20, 160, "C"], c2: [74, 160, "2ns"],
    n9: [170, 72, "9ns"], n4: [170, 160, "4ns"], n3: [266, 72, "3ns"], n8: [266, 160, "8ns"], "@F": [346, 72, "F"], "@G": [346, 160, "G"],
  };
  const DOUGH_E = [
    "@A>a1", "@B>b5", "@C>c2", "c2>n4", ["a1", "n9", { reg: 1 }], ["b5", "n9", { reg: 1 }], ["n4", "n9", { reg: 1 }],
    ["n9", "n3", { reg: 1 }], ["n9", "n8", { reg: 1 }], ["n4", "n8", { reg: [0.33, 0.66] }], "n8>n3",
    ["n3", "@F", { reg: 1 }], ["n8", "@G", { reg: 1 }],
  ];
  const SAUCE_N = {
    "@D": [20, 50, "D"], d5: [76, 50, "5ns"], "@E": [20, 140, "E"], e4: [76, 140, "4ns"], m3: [176, 50, "3ns"], m4: [176, 140, "4ns"],
    r3: [276, 50, "3ns"], r1: [276, 140, "1ns"], "@H": [354, 140, "H"],
  };
  const SAUCE_E = ["@D>d5", "@E>e4", ["d5", "m3", { reg: 1 }], ["e4", "m4", { reg: 1 }], "m4>m3", ["m3", "r3", { reg: 1 }],
    ["m4", "r1", { reg: 1 }], "r3>r1", ["r1", "@H", { reg: 1 }]];
  def("fa25-dough", svg(370, 190, graph(DOUGH_N, DOUGH_E)));
  def("fa25-sauce", svg(370, 190, graph(SAUCE_N, SAUCE_E)));

  def("fa25-pizza", svg(380, 190,
    box(40, 10, 300, 170, "", { r: 18, fill: false }), tx(358, 10, "PIZZA", { a: "end", s: 14 }),
    box(52, 24, 120, 72, "DOUGH", { r: 8 }), box(52, 108, 120, 62, "SAUCE", { r: 8 }), box(208, 24, 120, 146, "ASSEMBLE", { r: 8 }),
    ...["A", "B", "C"].map((l, i) => w(`10,${40 + i * 22} 52,${40 + i * 22}`) + tx(60, 40 + i * 22, l, { a: "start", s: 11 })),
    ...["D", "E"].map((l, i) => w(`10,${126 + i * 26} 52,${126 + i * 26}`) + tx(60, 126 + i * 26, l, { a: "start", s: 11 })),
    tx(164, 46, "F", { a: "end", s: 11 }), w("172,46 208,46"), tx(214, 46, "W", { a: "start", s: 11 }),
    tx(164, 74, "G", { a: "end", s: 11 }), w("172,74 208,74"), tx(214, 74, "X", { a: "start", s: 11 }),
    tx(164, 140, "H", { a: "end", s: 11 }), w("172,140 208,140"), tx(214, 140, "Y", { a: "start", s: 11 }),
    tx(320, 97, "Z", { a: "end", s: 11 }), w("328,97 372,97")));

  R["q2fa25-p2"] = {
    statement: t`**Arithmetic pipelines.** Papa Louie needs help with the last submodule of his pizza-making module, ASSEMBLE. ASSEMBLE takes three inputs, **W**, **X**, and **Y**, and has one output, **Z**. ASSEMBLE works, but its throughput is too low. Help pipeline it.

@fig fa25-asm-block

For each question, make a valid K-stage pipeline of the given circuit. Each component shows its propagation delay in nanoseconds. Show your pipelining contours, and put dots on the signal arrows where the pipeline registers go. Give the latency and throughput of each design for ideal registers ($t_{PD} = 0$, $t_{SETUP} = 0$). By convention, a pipeline register goes on each output. Invalid pipeline diagrams get 0 points.

@fig fa25-asm

**(A) (1 point)** What are the latency and throughput of the **1-stage pipeline** of ASSEMBLE? Look carefully at the direction of the arrows.

**(B) (3 points)** Show the **maximum-throughput 2-stage pipeline** of ASSEMBLE with a minimal number of registers. Give its latency and throughput.

**(C) (4 points)** Show the **maximum-throughput pipeline** of ASSEMBLE with a minimal number of registers. Give its latency and throughput.

**(D) (2 points)** Papa Louie gives you two more submodules. DOUGH makes the pizza dough. It has inputs **A**, **B**, **C** and outputs **F**, **G**. SAUCE cooks the sauce. It has inputs **D**, **E** and output **H**. The dots show their pipeline registers. Draw the contours through the given registers, and give the latency and throughput of each module.

**Figure 1:** DOUGH

@fig fa25-dough

**Figure 2:** SAUCE

@fig fa25-sauce

**(E) (6 points)** The complete PIZZA module sends the outputs of DOUGH and SAUCE into ASSEMBLE, which outputs the assembled pizza.

@fig fa25-pizza

1. Papa Louie wants maximum throughput for PIZZA. Which version of ASSEMBLE do you use: the 1-stage pipeline, the 2-stage pipeline, or the maximum-throughput pipeline? If two versions give the same throughput, choose the one with the better latency. Give the latency and throughput of PIZZA.

2. Now Papa Louie wants minimum latency for PIZZA. Which version of ASSEMBLE do you use? If two versions give the same latency, choose the one with the better throughput. Give the latency and throughput of PIZZA.`,
    solution: t`**(A)** The longest path is X → 7 → 1 → 2 → 5 → 5 → 3 → 4, so the latency is $27$ ns and the throughput is $1/27$ ns$^{-1}$.

**(B)** The orange dots are the registers. Stage 1 holds 7, 5 (W), 6, 1, 2, and the middle 5. Stage 2 holds the right 5, 3, and 4. The slowest stage is $7+1+2+5 = 15$ ns, so the latency is $2 \cdot 15 = 30$ ns and the throughput is $1/15$ ns$^{-1}$.

@fig fa25-asm-2

**(C)** The slowest component is 7 ns, so the best period is 7 ns. The stages are {7}, {5 (W), 6, 1}, {2, middle 5}, {right 5}, {3, 4}. Five stages give a latency of $5 \cdot 7 = 35$ ns and a throughput of $1/7$ ns$^{-1}$.

@fig fa25-asm-max

**(D)** DOUGH has 3 stages: {1, 5, 2, 4} (longest path $2 + 4 = 6$ ns), {9}, and {8, 3} ($8 + 3 = 11$ ns). The period is 11 ns, so the latency is $3 \cdot 11 = 33$ ns and the throughput is $1/11$ ns$^{-1}$. SAUCE has 3 stages: {5, 4}, {4, 3} ($4 + 3 = 7$ ns), and {3, 1} ($3 + 1 = 4$ ns). The period is 7 ns, so the latency is $3 \cdot 7 = 21$ ns and the throughput is $1/7$ ns$^{-1}$.

| Module | Latency (ns) | Throughput (ns$^{-1}$) |
|---|---|---|
| DOUGH | 33 | 1/11 |
| SAUCE | 21 | 1/7 |

**(E1)** Choose the **maximum-throughput pipeline**. ASSEMBLE is the throughput bottleneck in the 1-stage and 2-stage versions, so PIZZA would have throughput $1/27$ or $1/15$ ns$^{-1}$. With the maximum-throughput version, DOUGH is the bottleneck at $1/11$ ns$^{-1}$, so PIZZA has throughput $1/11$ ns$^{-1}$. PIZZA takes $3 + 5 = 8$ cycles (DOUGH and SAUCE run in parallel), so its latency is $8 \cdot 11 = 88$ ns.

**(E2)** Choose the **2-stage pipeline**. With the 1-stage version, PIZZA takes $3 + 1 = 4$ cycles of 27 ns, which is 108 ns. With the 2-stage version, PIZZA takes $3 + 2 = 5$ cycles of 15 ns, which is $75$ ns, with throughput $1/15$ ns$^{-1}$.`,
  };
  // mac1 processor: a third read port and a MAC unit. sol adds the solution labels.
  const macUnit = (x, y, ins = ["", "", ""]) => [
    box(x, y, 120, 64, "", { r: 2 }), tx(x + 60, y + 34, "MAC", { s: 16, b: true }), tx(x + 60, y + 54, "macOut", { s: 9 }),
    ...["A", "B", "C"].map((l, i) => tx(x + 20 + i * 40, y + 10, l, { s: 9 }) + w(`${x + 20 + i * 40},${y - 30} ${x + 20 + i * 40},${y}`)
      + (ins[i] ? tx(x + 20 + i * 40, y - 38, ins[i], { s: 12, c: "acc" }) : "")),
    w(`${x + 60},${y + 64} ${x + 60},${y + 88}`), tx(x + 68, y + 82, "macOut", { a: "start", s: 12 }),
  ];
  def("fa25-mac1", root.Fig.rvsc({ ra3: true, extra: macUnit(600, 60) }));
  def("fa25-mac1-sol", root.Fig.rvsc({
    ra3: true, ra3In: "rd", rd3Out: "rVal3", wd: ["0", "1", "2", "3"], wdIn: [, , , "macOut"],
    extra: macUnit(600, 60, ["rVal1", "rVal2", "rVal3"]),
  }));
  // mac2 processor: mSel mux, MAC Reg, and MAC unit above the register file (dy = 60).
  const macRegParts = (sol) => [
    w("502,14 502,40"), w("567,14 567,40"),
    sol ? tx(502, 6, "aluRes", { s: 12, c: "acc" }) + tx(567, 6, "macOut", { s: 12, c: "acc" }) : "",
    root.Fig.mux(470, 40, 130, 16, { dir: "down", labels: ["0", "1"] }), tx(606, 48, "mSel", { a: "start", s: 11 }),
    w("535,56 535,80"), box(450, 80, 190, 46, "", { r: 2 }),
    tx(472, 90, "MWE", { s: 9 }), tx(535, 90, "MWD", { s: 9 }), tx(618, 90, "MRD", { s: 9 }), tx(545, 110, "MAC Reg", { s: 15, b: true }),
    w("400,96 450,96"), sol ? tx(396, 96, "macRegWrEn", { a: "end", s: 12, c: "acc" }) : "",
    root.Fig.line("640,103 760,103"), w("760,103 760,150"), tx(700, 95, "macReg", { s: 12 }),
    box(660, 150, 120, 60, "", { r: 2 }), tx(720, 180, "MAC", { s: 16, b: true }), tx(720, 200, "macOut", { s: 9 }),
    ...["A", "B", "C"].map((l, i) => tx(680 + i * 40, 159, l, { s: 9 })),
    w("680,124 680,150"), w("720,124 720,150"),
    sol ? tx(680, 116, "rVal1", { s: 11, c: "acc" }) + tx(720, 116, "rVal2", { s: 11, c: "acc" }) : "",
    w("720,210 720,236"), tx(728, 230, "macOut", { a: "start", s: 12 }),
  ];
  def("fa25-mac2", root.Fig.rvsc({ dy: 60, w: 800, sigs: [["mSel"]], extra: macRegParts(false) }));
  def("fa25-mac2-sol", root.Fig.rvsc({
    dy: 60, w: 800, sigs: [["mSel"], ["macRegWrEn", "acc"]], wd: ["0", "1", "2", "3"], wdIn: [, , , "macReg"], extra: macRegParts(true),
  }));

  const decodeRows = (rows) => rows.map(([f, v]) => `| ${f} | ${v} |`).join("\n");
  const FIELDS = ["imm", "rs1", "rs2", "rd", "AluFunc", "BrFunc", "BSEL", "MemFunc", "MemEnable", "WDSEL", "WERF", "PCSEL"];
  R["q2fa25-p3"] = {
    statement: t`**Processor implementation.** Philip wants to do matrix multiplication in RISC-V assembly as fast as possible. He notices a pattern and makes a multiply-and-accumulate instruction:

~~~
mac1 rd, rs1, rs2    # reg[rd] <= (reg[rs1] * reg[rs2]) + reg[rd]
~~~

There are two problems: the ALU cannot multiply, and the register file cannot read three registers in one cycle. Philip adds a third read port to the register file, and a MAC unit with inputs a, b, c that computes $(a \cdot b) + c$.

**(A) (4 points)** The diagram is the lecture single-cycle processor with the MAC unit and a register file with an extra read port. Label all open arrows (for example the RA3 port), the decoder outputs, and the mux inputs, so that the processor supports [[mac1]].

@fig fa25-mac1

**(B) (4 points)** What must the decoder output for [[mac1 x2, x5, x10]]? Add any signals that you added in part (A). Mark don't-care values with ?.

| Field | Value |
|---|---|
${decodeRows(FIELDS.map((f) => [f, ""]))}

Philip makes a second ISA with the MAC unit and an extra register, [[macReg]], that only the MAC uses. The ISA has 3 new instructions:

~~~
macw rs1, constant   # macReg <= reg[rs1] + constant
macr rd              # reg[rd] <= macReg
mac2 rs1, rs2        # macReg <= (reg[rs1] * reg[rs2]) + macReg
~~~

**(C) (4 points)** This processor has the MAC unit and a MAC Reg unit. MAC Reg has write enable (MWE) and write data (MWD) inputs and a read data (MRD) output. Label all open arrows (for example the MWE port), add decoder outputs as needed, and label the mux inputs (especially the new mSel mux) so that the processor supports [[macw]], [[macr]], and [[mac2]].

@fig fa25-mac2

**(D) (4 points)** What must the decoder output for [[macw x0, 0x100]] and for [[macr x10]]? Add any signals that you added in part (C). Mark don't-care values with ?.

| Field | macw x0, 0x100 | macr x10 |
|---|---|---|
${[...FIELDS, "MSEL"].map((f) => `| ${f} | | |`).join("\n")}`,
    solution: t`**(A)** RA3 gets [[rd]], and RD3 gives rVal3. The MAC unit computes rVal1 · rVal2 + rVal3. WDSEL gets a fourth input, 3 = macOut.

@fig fa25-mac1-sol

**(B)**

| Field | mac1 x2, x5, x10 |
|---|---|
${decodeRows([["imm", "?"], ["rs1", "x5"], ["rs2", "x10"], ["rd", "x2"], ["AluFunc", "?"], ["BrFunc", "?"], ["BSEL", "?"], ["MemFunc", "?"], ["MemEnable", "0"], ["WDSEL", "3 (macOut)"], ["WERF", "1"], ["PCSEL", "0 (pc + 4)"]])}

Another accepted answer: MemFunc ∈ {Lw, Lh, Lhu, Lb, Lbu} with MemEnable = ?.

**(C)** mSel input 0 is aluRes ([[macw]] computes reg[rs1] + constant in the ALU), and input 1 is macOut ([[mac2]]). MWE is a new decoder output, macRegWrEn. MAC gets rVal1, rVal2, and macReg. WDSEL gets a fourth input, 3 = macReg ([[macr]]).

@fig fa25-mac2-sol

**(D)**

| Field | macw x0, 0x100 | macr x10 |
|---|---|---|
| imm | 0x100 | ? |
| rs1 | x0 | ? |
| rs2 | ? | ? |
| rd | ? | x10 |
| AluFunc | Add | ? |
| BrFunc | ? | ? |
| BSEL | 0 (imm) | ? |
| MemFunc | ? | ? |
| MemEnable | 0 | 0 |
| WDSEL | ? | 3 (macReg) |
| WERF | 0 | 1 |
| PCSEL | 0 (pc + 4) | 0 (pc + 4) |
| MSEL | 0 (aluRes) | ? |
| macRegWrEn | 1 | 0 |

Another accepted answer for both: MemFunc ∈ {Lw, Lh, Lhu, Lb, Lbu} with MemEnable = ?.`,
  };
  // Memory table, 3 address/data pairs per row: Mem[a] = (a - 0x200) / 4 from 0x200 to 0x248.
  const memRows = (() => {
    const hex = (v) => "0x" + v.toString(16).toUpperCase();
    const cells = Array.from({ length: 19 }, (_, i) => [hex(0x200 + 4 * i), hex(i)]);
    const rows = [];
    for (let r = 0; r < 7; r++) rows.push("| " + [0, 7, 14].map((c) => cells[c + r] || ["...", "..."]).map(([a, d]) => `${a} | ${d}`).join(" | ") + " |");
    return "{plain}\n| Address | Data | Address | Data | Address | Data |\n|---|---|---|---|---|---|\n" + rows.join("\n");
  })();

  R["q2fa25-p4"] = {
    statement: t`**Caches.** Memory holds 0 at address 0x200, 1 at 0x204, 2 at 0x208, 3 at 0x20C, and so on: each word is 1 more than the word before it. The pattern continues up to address 0x300.

**Main memory**

${memRows}

A direct-mapped cache holds 16 words in total and has a block size of 4 words. The cache is empty at the start (all valid bits are 0). Instructions and data use the same cache. Run this code:

~~~
. = 0x1000
lw x2, 0x228(x0)
sb x2, 0x237(x0)
sh x2, 0x238(x0)
lw x3, 0x274(x0)
~~~

**(A) (6 points)** Fill in all known values in the cache after the code runs. For an instruction, write the instruction name (for example [[lw]]). Write data in hexadecimal, with the values that these instructions put in memory.

| | Tag | V | D | Word 3 | Word 2 | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|
| 0 | | | | | | | |
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

**(B) (4 points)** How many instruction hits and misses, and data hits and misses, does the code make? The code runs on a single-cycle processor.

**(C) (2 points)** If data was written back to memory, list each affected word address and its new data (for example Mem[0x100] = 0x7).

**(D) (2 points)** What are the values of [[x2]] and [[x3]] after the code runs?

Now run this benchmark on a fully associative cache with a block size of 2 words and 16 words in total. Instructions and data use the same cache. The replacement policy is LRU. The loop runs 20 times. Then the program executes [[unimp]] once and halts.

~~~
. = 0
      mv x4, x0           // byte index into array
loop: lw x2, 0x400(x4)    // load next element of array
      slli x3, x2, 1      // perform computation
      sw x3, 0x700(x4)    // store result in second array
      addi x4, x4, 4      // byte index of next array element
      slti x2, x4, 80     // process 20 entries
      bnez x2, loop
      unimp               // halt
~~~

**(E) (2 points)** How many instruction fetches does the program make, and what is the instruction-fetch hit rate? Count one fetch for [[unimp]].

**(F) (2 points)** How many data accesses does the program make, and what is the data hit rate?`,
    solution: t`**(A)**

| | Tag | V | D | Word 3 | Word 2 | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|
| 0 | 0x40 | 1 | 0 | lw | sh | sb | lw |
| 1 | | 0 | | | | | |
| 2 | 0x8 | 1 | 0 | 0xB | 0xA | 0x9 | 0x8 |
| 3 | 0x9 | 1 | 0 | 0x1F | 0x1E | 0x1D | 0x1C |

- The instructions at 0x1000, 0x1004, 0x1008, and 0x100C have tag 0x40 and index 0. The first fetch brings the whole block into index 0.
- The load from 0x228 (tag 0x8, index 2, word 2) is a data miss. It brings 0x220, 0x224, 0x228, and 0x22C into index 2. The dirty bit stays 0.
- The store to byte 0x237 (tag 0x8, index 3, word 1, byte 3) brings 0x230 to 0x23C into index 3 with dirty bit 0. Then byte 3 of word 1 gets x2 = 0xA, so word 1 changes from 0x0D to 0x0A00000D, and the dirty bit becomes 1.
- The halfword store to 0x238 (tag 0x8, index 3, word 2) changes word 2 to 0xA.
- The load from 0x274 (tag 0x9, index 3, word 1) brings 0x270 to 0x27C into index 3. Index 3 is dirty, so its old block is written back to memory first.

**(B)** Instruction hits: 3. Instruction misses: 1. Data hits: 1. Data misses: 3. The first fetch misses and brings in the whole block, so the next three fetches hit. The load from 0x228 misses. The store to 0x237 misses. The store to 0x238 hits because its block is already in index 3. The load from 0x274 misses.

**(C)** Mem[0x230] = 0xC, Mem[0x234] = 0x0A00000D, Mem[0x238] = 0xA, Mem[0x23C] = 0xF.

**(D)** x2 = 0xA and x3 = 0x1D.

**(E)** The program makes $1 + 20 \cdot 6 + 1 = 122$ instruction fetches. There are 4 compulsory instruction misses (8 instructions in blocks of 2). After that the loop keeps the instructions from becoming LRU, so they stay in the cache. The hit rate is $118/122 = 59/61$.

**(F)** The program makes $20 \cdot 2 = 40$ data accesses. The block size is 2, so each miss on an array element makes the access to the next element a hit. The hit rate is $20/40 = 0.5$.`,
  };
  // Stage block diagram: stages is a list of groups (each group sits between pipeline
  // registers); top / bottom are bypass paths [fromBox, toBox] drawn above / below.
  function stageDiag(groups, top, bottom = []) {
    const bw = 52, bh = 40, gap = 6, rw = 10, y = 36, parts = [], pos = {};
    let x = 6;
    groups.forEach((g, gi) => {
      g.forEach((name, i) => {
        parts.push(box(x, y, bw, bh, name, { s: 11, b: true, r: 2 }));
        if (i) parts.push(root.Fig.line(`${x - gap},${y + bh / 2} ${x},${y + bh / 2}`));
        pos[name] = x + bw / 2;
        x += bw + gap;
      });
      if (gi < groups.length - 1) {
        parts.push(root.Fig.line(`${x - gap},${y + bh / 2} ${x + 6},${y + bh / 2}`), box(x + 6, y, rw, bh, "", { r: 1, c: "mut" }),
          root.Fig.line(`${x + 6 + rw},${y + bh / 2} ${x + 12 + rw},${y + bh / 2}`));
        x += rw + 18;
      }
    });
    top.forEach(([a, b], i) => {
      const yy = y - 8 - i * 9, xb = pos[b] - 10 + i * 7;
      parts.push(root.Fig.line(`${pos[a]},${y} ${pos[a]},${yy} ${xb},${yy}`), w(`${xb},${yy} ${xb},${y}`));
    });
    bottom.forEach(([a, b], i) => {
      const yy = y + bh + 10 + (bottom.length - 1 - i) * 9, xb = pos[b] - 4 + i * 7;
      parts.push(root.Fig.line(`${pos[a]},${y + bh} ${pos[a]},${yy} ${xb},${yy}`), w(`${xb},${yy} ${xb},${y + bh}`));
    });
    return svg(x, y + bh + 34, parts);
  }
  def("fa25-orig", stageDiag([["IF"], ["DEC", "BYP1"], ["EXE"], ["MEM"], ["WB"]], [["EXE", "BYP1"], ["MEM", "BYP1"], ["WB", "BYP1"]]));
  def("fa25-adv", stageDiag([["IF"], ["DEC", "BYP1"], ["EXE", "BYP2"], ["MEM"], ["WB"]],
    [["EXE", "BYP1"], ["MEM", "BYP1"], ["WB", "BYP1"]], [["MEM", "BYP2"], ["WB", "BYP2"]]));

  const blank = (first, n = 12) => ({
    IF: [first, ...Array(n - 1).fill("")], DEC: ["#", ...Array(n - 1).fill("")], EXE: ["#", "#", ...Array(n - 2).fill("")],
    MEM: ["#", "#", "#", ...Array(n - 3).fill("")], WB: ["#", "#", "#", "#", ...Array(n - 4).fill("")],
  });
  const rows = (s) => Object.fromEntries(s.trim().split("\n").map((l) => { const [k, ...v] = l.trim().split(/\s+/); return [k, v.map((c) => (c === "." ? "" : c))]; }));
  def("fa25-p5-blank", root.Fig.pipe({ start: 100, rows: blank("sh") }));
  def("fa25-p5-a", root.Fig.pipe({ start: 100, arrows: [["WB", "DEC", 105], ["MEM", "DEC", 108]], rows: rows(`
    IF  sh lw sw addi addi addi addi blt slli xor sh lw
    DEC # sh lw sw sw sw addi addi blt slli NOP sh
    EXE # # sh lw NOP NOP sw addi addi blt NOP NOP
    MEM # # # sh lw NOP NOP sw addi addi blt NOP
    WB  # # # # sh lw NOP NOP sw addi addi blt`) }));
  def("fa25-p5-b", root.Fig.pipe({ start: 100, arrows: [["WB", "EXE", 105], ["MEM", "DEC", 107], ["WB", "DEC", 109]], rows: rows(`
    IF  sh lw sw addi addi addi blt slli sh lw sw addi
    DEC # sh lw sw addi addi addi blt NOP sh lw sw
    EXE # # sh lw sw sw addi addi blt NOP sh lw
    MEM # # # sh lw NOP sw addi addi blt NOP sh
    WB  # # # # sh lw NOP sw addi addi blt NOP`) }));

  R["q2fa25-p5"] = {
    statement: t`**Pipelined processors.** The TAs write a data-processing kernel for an embedded system. The code goes through an array, updates a 16-bit status flag in each entry with [[sh]], and then copies the full 32-bit word into an element of a second array. They run it on a standard 5-stage processor that:

- has full bypassing
- always predicts that branches are not taken (always fetches from PC + 4)
- makes branch decisions in the EXE stage
- annuls the instructions after a taken branch
- completes all memory instructions in 1 cycle

~~~
// a1 holds the array base location
// a3 holds the length of the data array
// a4 holds the loop counter
// a5 holds the 16-bit status flag
. = 0x0
loop:
    sh a5, 0(a1)       // Modify lower half of array[i]
    lw a6, 0(a1)       // Load all 32 bits of array[i]
    sw a6, 100(a1)     // Store loaded value to new_array[i] with offset 100
    addi a4, a4, 1     // Increment loop counter
    addi a1, a1, 4     // Point to the next element of the array
    blt a4, a3, loop   // Branch if i < array length
    slli a7, a5, 2
    xor a7, a7, a6
~~~

**(A) (6 points)** Fill in the pipeline diagram. The loop runs in steady state and continues to loop. Cycle 100 starts with the fetch of [[sh]]. Draw any bypass arrows.

@fig fa25-p5-blank

**(B) (5 points)** The TAs design an advanced processor. It has the same 5 stages, with three changes:

- **Branch resolution in DEC:** branch decisions and target calculation move from EXE to DEC.
- **Delayed stalling:** an instruction with a data dependency can go on until it reaches the stage **immediately before** the stage that needs the value. (An instruction that needs data in EXE must bypass in DEC. An instruction that needs data in MEM must bypass in EXE.)
- **Extra bypassing:** the processor has more bypass paths for delayed stalling, including MEM → EXE and WB → EXE.

The original processor is a regular 5-stage pipeline with full bypassing:

@fig fa25-orig

The advanced processor has the extra bypass paths:

@fig fa25-adv

Fill in the diagram for the same loop on the advanced processor. The loop runs in steady state. Draw any bypass arrows.

@fig fa25-p5-blank

**(C) (2 points)** In steady state, how many cycles does one loop iteration take on the original processor, and on the advanced processor?

**(D) (3 points)** Moving the branch logic from EXE to DEC makes DEC slower and EXE faster. The original processor has one bypass module, BYP1, in DEC. The advanced processor has a second module, BYP2, for the extra bypass paths. The pipeline registers are ideal ($t_{PD} = t_{SETUP} = 0$). The stage delays are:

| | Original processor | Advanced processor |
|---|---|---|
| IF | 200 ns | 200 ns |
| DEC | 180 ns | 300 ns |
| BYP1 | 100 ns | 100 ns |
| EXE | 250 ns | 210 ns |
| BYP2 | NA | 80 ns |
| MEM | 240 ns | 240 ns |
| WB | 150 ns | 150 ns |

Give the minimum clock period and the total time per loop iteration of each processor. Which processor is faster for this loop?`,
    solution: t`**(A)** [[sw]] needs [[a6]] from [[lw]], so it stalls in DEC until [[lw]] reaches WB (bypass WB → DEC in cycle 105). [[blt]] needs [[a4]] and gets it from the [[addi]] in MEM (cycle 108). The branch is taken in EXE in cycle 109, so [[slli]] and [[xor]] are annulled.

@fig fa25-p5-a

**(B)** [[sw]] now goes on to EXE and gets [[a6]] there from WB (cycle 105). [[blt]] resolves in DEC, so it needs [[a4]] in DEC. It is in DEC in cycle 107 and gets [[a4]] from the [[addi]] in MEM. Only [[slli]] is annulled. In the next iteration, [[sh]] needs [[a1]] in DEC and gets it from WB (cycle 109).

@fig fa25-p5-b

**(C)** The original processor takes 10 cycles per iteration ([[sh]] is fetched in cycles 100 and 110). The advanced processor takes 8 cycles (cycles 100 and 108).

**(D)** In the original processor, the slowest path is a value bypassed from EXE through BYP1: $250 + 100 = 350$ ns. One iteration takes $10 \cdot 350 = 3500$ ns. In the advanced processor, the slowest path is DEC followed by BYP1: $300 + 100 = 400$ ns. One iteration takes $8 \cdot 400 = 3200$ ns. The **advanced processor** is faster for this loop.`,
  };
  // 5-stage processor with instruction and data caches; cache results return in DEC and WB.
  def("fa25-p6-cpu", svg(330, 330,
    box(40, 6, 70, 18, "PC", { s: 11, r: 2 }), box(100, 28, 80, 30, "Instruction\nCache", { s: 10, r: 2 }),
    w("75,24 75,66"), w("110,24 140,24 140,28"),
    box(20, 66, 220, 6, "", { r: 1, c: "mut" }), tx(270, 40, "IF", { a: "start", s: 14 }),
    box(40, 92, 70, 28, "Decode", { s: 11, r: 2 }), box(124, 88, 60, 34, "Register\nFile", { s: 10, r: 2 }),
    w("140,58 140,66"), w("75,72 75,92"), w("110,106 124,106"), w("40,72 40,138"), w("154,122 154,138"),
    box(20, 138, 220, 6, "", { r: 1, c: "mut" }), tx(270, 106, "DEC", { a: "start", s: 14 }),
    box(40, 158, 160, 26, "Execute", { s: 11, r: 2 }), w("120,144 120,158"), w("120,184 120,202"), w("30,144 30,202"),
    box(20, 202, 220, 6, "", { r: 1, c: "mut" }), tx(270, 172, "EXE", { a: "start", s: 14 }),
    box(110, 222, 80, 26, "Data Cache", { s: 10, r: 2 }), w("120,208 120,222"), w("150,248 150,262"), w("60,208 60,262"), w("30,208 30,262"),
    box(20, 262, 220, 6, "", { r: 1, c: "mut" }), tx(270, 234, "MEM", { a: "start", s: 14 }),
    root.Fig.mux(30, 276, 60, 12, { dir: "down" }), w("60,268 60,276"), w("60,288 60,300"),
    box(30, 300, 60, 26, "Register\nFile", { s: 10, r: 2 }), tx(270, 294, "WB", { a: "start", s: 14 })));

  def("fa25-p6-blank", root.Fig.pipe({ start: 0, n: 16, cw: 40, rows: blank("", 16) }));
  def("fa25-p6-a", root.Fig.pipe({ start: 0, cw: 40, arrows: [["EXE", "DEC", 3], ["EXE", "DEC", 4], ["WB", "DEC", 8], ["EXE", "DEC", 11]], rows: rows(`
    IF  slli add add lw add addi addi addi addi blt blt ? ? slli add add
    DEC # slli slli add lw add add add add addi addi blt ? NOP slli slli
    EXE # # NOP slli add lw NOP NOP NOP add NOP addi blt NOP NOP NOP
    MEM # # # NOP slli add lw NOP NOP NOP add NOP addi blt NOP NOP
    WB  # # # # NOP slli add lw lw NOP NOP add NOP addi blt NOP`) }));
  const diag = (s) => root.Fig.pipe({ start: 0, n: 16, cw: 38, rows: rows(s) });
  def("fa25-p6-I", diag(`
    IF  lw beq slli mv lw add
    DEC # lw beq slli NOP lw add
    EXE # # lw beq NOP NOP lw add
    MEM # # # lw beq NOP NOP lw add
    WB  # # # # lw beq NOP NOP lw add`));
  def("fa25-p6-II", diag(`
    IF  lw beq slli mv mv mv lw add
    DEC # lw beq slli slli slli mv lw add
    EXE # # lw beq NOP NOP slli mv lw add
    MEM # # # lw beq NOP NOP slli mv lw add
    WB  # # # # lw beq NOP NOP slli mv lw add`));
  def("fa25-p6-III", diag(`
    IF  lw beq slli slli slli mv lw lw lw add
    DEC # lw beq beq beq slli mv mv mv lw add add add
    EXE # # lw NOP NOP beq slli NOP NOP mv lw NOP NOP add
    MEM # # # lw NOP NOP beq slli NOP NOP mv lw NOP NOP add
    WB  # # # # lw NOP NOP beq slli NOP NOP mv lw NOP NOP add`));
  def("fa25-p6-IV", diag(`
    IF  lw NOP beq NOP NOP NOP NOP slli NOP mv NOP lw lw NOP add .
    DEC # lw NOP beq beq beq NOP NOP slli NOP mv mv mv lw NOP add
    EXE # # lw NOP NOP NOP beq NOP NOP slli NOP NOP NOP mv lw NOP
    MEM # # # lw NOP NOP NOP beq NOP NOP slli NOP NOP NOP mv lw
    WB  # # # # lw NOP NOP NOP beq NOP NOP slli NOP NOP NOP mv`));

  R["q2fa25-p6"] = {
    statement: t`**Pipelined processor performance.** Ben designs a 5-stage pipelined processor. He benchmarks it with this code, which goes through 16 elements of an array that starts at address 0x0.

~~~
// a0 contains the starting address of the array: 0x0
// a1 contains the length of the array: 16
// a2 contains the current index of iteration, starting at 0
// a3 contains a running sum, starting at 0
. = 0x100
L1:
    slli a4, a2, 2     // store index as a byte count in a4
    add a4, a4, a0     // add array base to a4
    lw a5, 0(a4)       // load arr[i] into a5
    add a3, a3, a5     // add a5 to the running sum
    addi a2, a2, 1     // increment i
    blt a2, a1, L1     // loop while i < 16
~~~

The processor is a standard 5-stage pipeline with branch annulment and full bypassing. It predicts that branches are not taken. Ben adds two direct-mapped caches, each with a single line of four words: one is the instruction cache and one is the data cache.

**A memory access takes 1 cycle on a cache hit, 2 cycles on a clean miss, and 3 cycles on a dirty miss, for both caches.**

The processor uses realistic cached memory with clocked reads. Cache results return in DEC (instruction cache) and WB (data cache).

@fig fa25-p6-cpu

**(A) (10 points)** Fill in the pipeline diagram for the first 16 cycles of the benchmark, with the stalls from cache misses. An instruction fetch restarts every cycle that the instruction is in IF: fetching an instruction again while it stalls in IF does not stop it from causing a cache miss. Draw arrows for bypassed values, and write ? for an unknown instruction. Then give the average CPI for the whole benchmark and explain how you got it. Hint: count all 16 array elements.

@fig fa25-p6-blank

Ben has his processors made. He drops the box and breaks them. Now every cache access is a hit, but other parts are broken. Each processor is one of two kinds:

- **Processor A:** the Part A processor with no cache misses and broken load-to-use bypassing. A load result is bypassed from EXE (not WB) with the value in the register file: [[lw a0, 0(x0)]] gives the current value of [[a0]] in the register file.
- **Processor B:** the Part A processor with no cache misses, broken nextPC speculation, and no bypassing. The processor stalls until it knows nextPC instead of speculating, and it always stalls on data hazards.

Ben runs this program on each processor. It loads the word 0x04030201 from address 0x0 and the word 0x80706050 from address 0x4, multiplies the first value by 2, and adds them.

~~~
// all registers start as 0
    lw a0, 0(x0)      // a0 = Mem[0]
    beq a0, x0, L2    // if (a0 != 0)
    slli a0, a0, 1    //     a0 *= 2
    mv a1, a0         //     a1 = a0
L2: lw a0, 4(x0)      // a0 = Mem[4]
    add a1, a1, a0    // a1 += a0
~~~

**(B) (6 points)** Match Processor A and Processor B to their pipeline diagrams (I, II, III, or IV). Give the value of the sum in [[a1]] at the end of the program for each processor. All memory accesses are cache hits, and all registers start at 0.

**Diagram I**

@fig fa25-p6-I

**Diagram II**

@fig fa25-p6-II

**Diagram III**

@fig fa25-p6-III

**Diagram IV**

@fig fa25-p6-IV`,
    solution: t`**(A)**

@fig fa25-p6-a

- In cycle 1 the processor stalls while [[slli]] comes back from the instruction cache: the fetch of 0x100 is a miss. The miss brings [[slli]], [[add]], [[lw]], and [[add]] into the cache, so their fetches after that are hits.
- In cycles 5 to 7, [[add]] stalls in DEC on a load-to-use hazard. The stall is longer because the first data fetch is a cache miss. In cycle 8, [[lw]] bypasses [[a5]] to DEC.
- [[addi]] is the 5th instruction, so it is in a new cache line, and its fetch misses (stalling in IF still misses).
- In cycle 14 (second iteration) there is another instruction-cache miss: the fetch of [[addi]] (0x110 to 0x11C) evicted 0x100 to 0x10C, which held [[slli]].

**Average CPI: 49/24.** The first [[slli]] reaches WB in cycle 5. Extending the diagram, the [[slli]] of the second iteration reaches WB in cycle 18, so the first iteration takes $18 - 5 = 13$ cycles. In the second, third, and fourth iterations, the data load is a cache hit, so [[a5]] is bypassed from WB to DEC one cycle earlier (cycle 7), and each of these iterations takes 12 cycles. The pattern repeats every 4 iterations (4 words per data cache line). So 4 iterations take $13 + 3 \cdot 12 = 49$ cycles for $6 \cdot 4 = 24$ instructions, and the CPI is $49/24$.

**(B)** Processor A is **Diagram I**, and its sum is **0x04030201**. The first [[lw]] is bypassed in EXE with the register value of [[a0]], which is 0, so the branch is taken. [[a0]] stays 0, and [[slli]] and [[mv]] are annulled. The second [[lw]] result is also bypassed to [[add]] with the current register value. By then the first [[lw]] has written back, so [[a0]] = 0x04030201, and [[add]] adds that to [[a1]].

Processor B is **Diagram IV**, and its sum is **0x88766452**. This processor computes the sum correctly, but slowly: $2 \cdot \texttt{0x04030201} + \texttt{0x80706050} = \texttt{0x88766452}$. With no speculation, every instruction that is not a branch or jump must reach DEC before the processor knows the next PC to fetch. With no bypassing, every data hazard stalls until the destination register is written back.`,
  };
  // ================================================================ Spring 2025

  // Game of Life examples: each grid is 4 rows of "#" (live) and "." (dead).
  const LIFE = [
    ["#.. ..#. ###. ....", ".... #.#. .##. .#..", ".... ..#. #.#. .##.", ".... .#.. ..## .##.", ".... ..#. ...# .###"],
    [".... .### ###. ....", "..#. #..# #..# .#..", ".... .### ###. ....", "..#. #..# #..# .#..", ".... .### ###. ...."],
  ];
  def("sp25-life", svg(5 * 96 + 4, 30 + 2 * 96, [
    ...["Generation 0\n(initial)", "Generation 1", "Generation 2", "Generation 3", "Generation 4"].map((h, i) => tx(i * 96 + 50, 14, h, { s: 11 })),
    ...LIFE.flatMap((row, r) => row.map((g, c) => {
      const cells = g.split(" ").map((s) => s.padStart(4, "."));
      let out = "";
      cells.forEach((line, y) => [...line].forEach((ch, x) => {
        out += `<rect class="${ch === "#" ? "live" : "dead"}" x="${c * 96 + 16 + x * 17}" y="${36 + r * 96 + y * 17}" width="17" height="17"/>`;
      }));
      return out;
    })),
  ]));

  R["q2sp25-p1"] = {
    statement: t`**Sequential logic in Minispec.** Ben builds a sequential circuit that simulates Conway's Game of Life. The game is a 2D grid of cells. Each cell is dead or live. The grid starts in some configuration and changes in steps called generations. At each step, each cell changes based on its neighbors, with three rules:

- Underpopulation: a live cell with fewer than 2 live neighbors becomes dead.
- Reproduction: a dead cell with exactly 3 live neighbors becomes live.
- Overpopulation: a live cell with more than 3 live neighbors becomes dead.

If no rule applies, the cell does not change. A cell has up to 8 neighbors: the cells next to it horizontally, vertically, and diagonally. The grids are finite, so cells at the edges have fewer neighbors.

In the examples below, live cells are filled and dead cells are empty. Each row is a separate example.

@fig sp25-life

**(A) (2 points)** Complete the combinational function that computes the next value of a cell from its current value and its count of live neighbors. A cell is 1 if live and 0 if dead.

~~~
function Bit#(1) evolveCell(Bit#(1) curValue, Bit#(4) liveNeighbors);
   ...
endfunction
~~~

**(B) (6 points)** Complete the sequential circuit, which simulates one tick of the game each clock cycle and updates all cells. The module simulates a square n-by-n grid. The [[start]] input gives the initial state, and the [[readCells]] method outputs the state every cycle. You can call [[evolveCell]] from part (A). Cells at the edges have fewer than 8 neighbors, so watch out for out-of-bounds indices.

~~~
// Sums 8 1-bit values
function Bit#(4) sum8(Bit#(1) v1, Bit#(1) v2, Bit#(1) v3, Bit#(1) v4,
                      Bit#(1) v5, Bit#(1) v6, Bit#(1) v7, Bit#(1) v8);
   Bit#(2) s1 = {0, v1} + {0, v2} + {0, v3};
   Bit#(2) s2 = {0, v4} + {0, v5} + {0, v6};
   Bit#(2) s3 = {0, v7} + {0, v8};
   return {0, s1} + {0, s2} + {0, s3};
endfunction

module GameOfLife#(Integer n);
   Vector#(n, Vector#(n, RegU#(Bit#(1)))) cells;

   input Maybe#(Vector#(n, Vector#(n, Bit#(1)))) start default = Invalid;

   rule tick;
      if (______________) begin
         // Load new input
         for (Integer i = 0; i < n; i = i + 1) begin
            for (Integer j = 0; j < n; j = j + 1) begin
               cells[i][j] <= ______________________;
            end
         end
      end else begin
         // Evolve all cells in the 2D grid
         for (Integer i = 0; i < n; i = i + 1) begin
            for (Integer j = 0; j < n; j = j + 1) begin
               Bit#(4) liveNeighbors = sum8(
                  ______________________________,
                  ______________________________,
                  ______________________________,
                  ______________________________,
                  ______________________________,
                  ______________________________,
                  ______________________________,
                  ______________________________);
               cells[i][j] <= ______________________;
            end
         end
      end
   endrule

   // map(map(readReg), cells) returns all the state in the correct format
   method Vector#(n, Vector#(n, Bit#(1))) readCells = map(map(readReg), cells);
endmodule
~~~

**(C) (8 points)** Complete the folded version of the circuit in part (B). It updates one row of the grid each cycle. Follow the comments near each blank. n is a power of 2. You can call [[evolveCell]]. Note: updating row i needs rows i-1, i, and i+1 of the current generation. Do not mix cell values from different generations.

~~~
module GameOfLifeFolded#(Integer n);
   Vector#(n, Reg#(Bit#(n))) rowRegs(0);
   Reg#(Bit#(log2(n))) curRowIdx(0);

   // Define additional state elements here

   input Maybe#(Vector#(n, Bit#(n))) start default = Invalid;

   rule tick;
      if (______________) begin
         // Load new input
         for (Integer i = 0; i < n; i = i + 1) begin
            rowRegs[i] <= ______________;
         end
         curRowIdx <= ______________;
      end else begin
         // Compute new values for row of cells at index curRowIdx
         Bit#(n) rowAbove = ______________________;
         Bit#(n) curRow = ______________________;
         Bit#(n) rowBelow = ______________________;

         Bit#(n) newRow = curRow;
         for (Integer j = 0; j < n; j = j+1) begin
            Bit#(4) liveNeighbors = sum8(
               (rowAbove >> 1)[j], rowAbove[j], (rowAbove << 1)[j],
               (curRow >> 1)[j], (curRow << 1)[j],
               (rowBelow >> 1)[j], rowBelow[j], (rowBelow << 1)[j]);
            newRow[j] = ______________________;
         end
         rowRegs[curRowIdx] <= ______________;
         curRowIdx <= ______________________;

         // Update any additional state elements below

      end
   endrule

   // Should return a valid output ONLY when rowRegs is fully updated
   // (i.e., rowRegs values are all from the same generation)
   // map(readReg, rowRegs) returns all the state in the correct format
   method Maybe#(Vector#(n, Bit#(n))) readCells = ______________ ?
      Valid(map(readReg, rowRegs)) : Invalid;
endmodule
~~~

**(D) (3 points)** For the circuits in parts (B) and (C), how do the area, the clock period, and the throughput (generations per second) grow with n? Use $\Theta(\cdot)$ notation. Propagation delay depends only on gate delays (ignore fanout and wire delays).

| | GameOfLife#(n) | GameOfLifeFolded#(n) |
|---|---|---|
| Area | $\Theta(\ )$ | $\Theta(\ )$ |
| $t_{CLK}$ | $\Theta(\ )$ | $\Theta(\ )$ |
| Throughput (generations/s) | $\Theta(\ )$ | $\Theta(\ )$ |`,
    solution: t`**(A)**

~~~
function Bit#(1) evolveCell(Bit#(1) curValue, Bit#(4) liveNeighbors);
   return (liveNeighbors < 2 || liveNeighbors > 3) ? 0 :
          (liveNeighbors == 3) ? 1 : curValue;
endfunction
~~~

Another solution:

~~~
function Bit#(1) evolveCell(Bit#(1) curValue, Bit#(4) liveNeighbors);
   if (curValue == 1 && (liveNeighbors < 2 || liveNeighbors > 3)) return 0;
   if (curValue == 0 && liveNeighbors == 3) return 1;
   return curValue;
endfunction
~~~

**(B)**

~~~
rule tick;
   if (isValid(start)) begin
      for (Integer i = 0; i < n; i = i + 1)
         for (Integer j = 0; j < n; j = j + 1)
            cells[i][j] <= fromMaybe(?, start)[i][j];
   end else begin
      for (Integer i = 0; i < n; i = i + 1) begin
         for (Integer j = 0; j < n; j = j + 1) begin
            Bit#(4) liveNeighbors = sum8(
               (i > 0 && j > 0)? cells[i-1][j-1] : 0,
               (i > 0)? cells[i-1][j] : 0,
               (i > 0 && j < n-1)? cells[i-1][j+1] : 0,
               (j > 0)? cells[i][j-1] : 0,
               (j < n-1)? cells[i][j+1] : 0,
               (i < n-1 && j > 0)? cells[i+1][j-1] : 0,
               (i < n-1)? cells[i+1][j] : 0,
               (i < n-1 && j < n-1)? cells[i+1][j+1] : 0);
            cells[i][j] <= evolveCell(cells[i][j], liveNeighbors);
         end
      end
   end
endrule
~~~

**(C)** The extra register [[lastRow]] keeps the old (current-generation) value of the row above, because that row was already overwritten with the next generation.

~~~
// Define additional state elements here
Reg#(Bit#(n)) lastRow(0);
...
if (isValid(start)) begin
   for (Integer i = 0; i < n; i = i + 1)
      rowRegs[i] <= fromMaybe(?, start)[i];
   curRowIdx <= 0;
end else begin
   Bit#(n) rowAbove = (curRowIdx == 0)? 0 : lastRow;
   Bit#(n) curRow = rowRegs[curRowIdx];
   Bit#(n) rowBelow = (curRowIdx == n-1)? 0 : rowRegs[curRowIdx+1];
   ...
      newRow[j] = evolveCell(curRow[j], liveNeighbors);
   ...
   rowRegs[curRowIdx] <= newRow;
   curRowIdx <= (curRowIdx == n-1)? 0 : (curRowIdx + 1);
   // Update any additional state elements below
   lastRow <= curRow;
end
...
method Maybe#(Vector#(n, Bit#(n))) readCells = (curRowIdx == 0) ?
   Valid(map(readReg, rowRegs)) : Invalid;
~~~

**(D)**

| | GameOfLife#(n) | GameOfLifeFolded#(n) |
|---|---|---|
| Area | $\Theta(n^2)$ | $\Theta(n^2)$ |
| $t_{CLK}$ | $\Theta(1)$ | $\Theta(\log n)$ (or $\Theta(1)$) |
| Throughput (generations/s) | $\Theta(1)$ | $\Theta(1/(n \log n))$ (or $\Theta(1/n)$ if $t_{CLK} = \Theta(1)$) |

- **Area:** both circuits have $n^2$ 1-bit registers, so the area is $\Theta(n^2)$.
- **$t_{CLK}$:** in GameOfLife#(n), the logic that updates each register checks a constant number of neighbors, so its delay does not grow with n: $\Theta(1)$. In GameOfLifeFolded#(n), reading a row goes through an n-to-1 mux in each read port, which adds $\Theta(\log n)$ delay. (The decoder for the write enables is also $\log n$.) This is easy to miss, so $\Theta(1)$ also got full credit. The unfolded circuit has much more logic, but each piece of logic only uses a local neighborhood: it does not choose one of n rows.
- **Throughput:** GameOfLife#(n) makes a new generation every cycle: $\Theta(1/t_{CLK}) = \Theta(1)$. GameOfLifeFolded#(n) makes a new generation every n cycles: $\Theta(1/(n \cdot t_{CLK})) = \Theta(1/(n \log n))$, or $\Theta(1/n)$ with $t_{CLK} = \Theta(1)$.`,
  };
  const SP25P2_N = {
    "@A": [20, 109, "A"], a7: [105, 109, "7 ns"], "@C": [207, 20, "C"], n8: [207, 109, "8 ns"], t2: [308, 109, "2 ns"],
    t7: [408, 109, "7 ns"], "@X": [489, 109, "X"], n1: [105, 208, "1 ns"], n4: [207, 208, "4 ns"], n6: [308, 208, "6 ns"],
    r5: [408, 260, "5 ns"], "@Y": [489, 260, "Y"], "@B": [20, 307, "B"], b2: [105, 307, "2 ns"], b5: [207, 307, "5 ns"], n3: [308, 307, "3 ns"],
  };
  const SP25P2_E = ["@A>a7", "a7>n1", "@C>n8", "n8>n4", "n8>t2", "n8>n6", "n1>n4", "@B>b2", "b2>n1", "n4>b5", "b2>b5",
    "b5>n3", "n3>n6", "t2>t7", "t7>@X", "n6>r5", "n3>r5", "r5>@Y"];
  const sp25p2 = (regs = {}) => svg(504, 330, graph(SP25P2_N, SP25P2_E, { regs, rc: "acc", bw: 54 }));
  def("sp25-p2", sp25p2());
  def("sp25-p2-b", sp25p2({ "n8>t2": [0.3, 0.6], "n8>n6": [0.3, 0.6], "n4>b5": 1, "b2>b5": 1, "n3>n6": 1, "n3>r5": 1, "t7>@X": 1, "r5>@Y": 1 }));
  def("sp25-p2-c", sp25p2({
    "@B>b2": 1, "a7>n1": 1, "n8>n4": 1, "n4>b5": 1, "b2>b5": 1, "n8>t2": [0.25, 0.5, 0.75], "t2>t7": 1, "t7>@X": 1,
    "n8>n6": [0.25, 0.5, 0.75], "n3>n6": 1, "n6>r5": 1, "n3>r5": [0.33, 0.66], "r5>@Y": 1,
  }));
  // (E): the 8 ns module is a 2-stage pipeline (4 ns + 4 ns) with its own two registers (orange bars).
  const SP25P2E_N = {
    "@C": [36, 20, "C"], mod: [52, 110, "", { w: 70, h: 32 }], t2: [150, 110, "2 ns"], t7: [256, 110, "7 ns"], "@X": [338, 110, "X"],
    "@A": [60, 212, "A"], n6: [150, 212, "6 ns"], r5: [256, 268, "5 ns"], "@Y": [338, 268, "Y"], "@B": [60, 316, "B"], n3: [150, 316, "3 ns"],
  };
  const SP25P2E_E = ["@C>mod", "mod>t2", "mod>n6", "@A>n6", "@B>n3", "n3>n6", "n6>r5", "n3>r5", "t2>t7", "t7>@X", "r5>@Y"];
  const sp25p2e = (regs = {}) => svg(352, 336, graph(SP25P2E_N, SP25P2E_E, { regs, rc: "acc", bw: 54 }),
    box(49, 94, 6, 32, "", { r: 0, c: "acc" }), box(81, 94, 6, 32, "", { r: 0, c: "acc" }),
    tx(34, 110, "4", { s: 14 }), tx(68, 110, "4", { s: 14 }));
  def("sp25-p2-e", sp25p2e());
  def("sp25-p2-e-sol", sp25p2e({ "t2>t7": 1, "t7>@X": 1, "@A>n6": [0.3, 0.6], "@B>n3": 1, "n3>n6": 1, "n6>r5": 1, "n3>r5": [0.33, 0.66], "r5>@Y": 1 }));

  R["q2sp25-p2"] = {
    statement: t`**Convoluted arithmetic pipelines.** For each question, make a valid K-stage pipeline of the given circuit. Each component shows its propagation delay in nanoseconds. Show your pipelining contours, and put dots on the signal arrows where the pipeline registers go. Give the latency and throughput of each design for ideal registers ($t_{PD} = 0$, $t_{SETUP} = 0$). By convention, a pipeline register goes on each output. Invalid pipeline diagrams get 0 points. Look carefully at the direction of the arrows.

@fig sp25-p2

**(A) (2 points)** What is the propagation delay $t_{PD}$ of the combinational circuit before pipelining?

**(B) (4 points)** Show a **maximum-throughput 3-stage pipeline** with a minimal number of registers. Give its latency and throughput.

**(C) (4 points)** Show a **maximum-throughput pipeline** with a minimal number of registers. Give its latency and throughput.

**(D) (2 points)** Suppose you only have registers with $t_{PD} = 1$ ns and $t_{SETUP} = 1$ ns instead of ideal registers. What are the latency and throughput of your circuit from part (C) with these registers?

**(E) (4 points)** Pipeline the new circuit below. The 8 ns component with input C is replaced with a 2-stage pipelined version of it, with 4 ns per stage. The orange bars are the registers that the pipelined component already has. Show a maximum-throughput pipeline with a minimal number of registers, and count the two registers in the component when you draw your contours. Give the latency and throughput.

@fig sp25-p2-e`,
    solution: t`**(A)** The longest path is C → 8 → 4 → 5 → 3 → 6 → 5 → Y: $8 + 4 + 5 + 3 + 6 + 5 = 31$ ns.

**(B)** The slowest stage is 12 ns (8 → 4, or 7 → 1 → 4). Stage 1: 7, 8, 1, 4, and the bottom 2. Stage 2: the bottom 5 and 3. Stage 3: the top 2, 7, 6, and the right 5. Latency $3 \cdot 12 = 36$ ns, throughput $1/12$ ns$^{-1}$.

@fig sp25-p2-b

**(C)** The slowest component is 8 ns, so the best period is 8 ns. Stage 1: 7 (A) and 8. Stage 2: the bottom 2, 1, and 4 ($2 + 1 + 4 = 7$). Stage 3: the bottom 5 and 3 ($5 + 3 = 8$). Stage 4: the top 2 and 6. Stage 5: the top 7 and the right 5. Latency $5 \cdot 8 = 40$ ns, throughput $1/8$ ns$^{-1}$.

@fig sp25-p2-c

**(D)** Each stage now needs $8 + t_{PD} + t_{SETUP} = 10$ ns. Latency $5 \cdot 10 = 50$ ns, throughput $1/10$ ns$^{-1}$.

**(E)** The slowest component is now 7 ns, so the best period is 7 ns. The pipelined component takes stages 1 and 2. Stage 2 also holds 3. Stage 3: 2 and 6. Stage 4: 7 and 5. Latency $4 \cdot 7 = 28$ ns, throughput $1/7$ ns$^{-1}$.

@fig sp25-p2-e-sol`,
  };
  // out32 register for xchgv, in the rvsimple coordinates.
  const out32 = (sol) => [
    box(677, 245, 30, 75, "", { r: 6 }), tx(692, 283, "out32", { s: 11, m: true, rot: 90 }),
    w("597,260 677,260"), tx(625, 251, "outWrEn", { s: 11, m: true }), w("597,305 677,305"), tx(632, 296, "outWrData", { s: 11, m: true }),
    root.Fig.line("707,283 729,283 729,368"), w("729,368 597,368"), tx(650, 359, "in32", { s: 11, m: true }),
    sol ? tx(591, 260, "outWrEn", { a: "end", s: 11, m: true, c: "acc" }) + tx(591, 305, "rVal1", { a: "end", s: 11, m: true, c: "acc" })
      + tx(591, 368, "to wdSel 3", { a: "end", s: 11, m: true, c: "acc" }) : "",
  ];
  def("sp25-cpu", root.Fig.rvsimple());
  def("sp25-xchg", root.Fig.rvsimple({ extra: out32(false) }));
  def("sp25-xchg-sol", root.Fig.rvsimple({ wd: ["0", "1", "2", "3"], wdIn: [, , , "in32"], sigs: [["outWrEn", "acc"]], extra: out32(true) }));
  def("sp25-int", root.Fig.rvsimple({ decIn: "interrupt", extra: tx(560, 245, "0x4 (interrupt vector)", { a: "start", s: 11, m: true }) }));
  def("sp25-int-sol", root.Fig.rvsimple({
    decIn: "interrupt", pc: ["0", "1", "2", "3"], pcIn: [, , , "0x4 (interrupt vector)"], wd: ["0", "1", "2", "3"], wdIn: [, , , "pc"],
  }));

  const ctl = (rows) => `| Field | Value |\n|---|---|\n` + rows.map(([f, v]) => `| ${f} | ${v} |`).join("\n");
  const SP_FIELDS = ["imm", "rs1", "rs2", "rd", "aluFunc", "brFunc", "bSel", "memFunc", "memEn", "wdSel", "rfWen", "pcSel"];
  R["q2sp25-p3"] = {
    statement: t`**(Not) sorry to interrupt! (Processor implementation.)** The RISC-V processors you built feel lonely running code on their own. Give them a basic way to communicate. Start with this generic single-cycle processor, which is like the one from lecture.

@fig sp25-cpu

For single-cycle operation without pipelining, memory reads (instruction and data) and register-file reads are combinational. The decoder outputs these fields:

| Field | Description | Possible values |
|---|---|---|
| imm | Immediate | 32-bit constant (sign-extended as needed) |
| rs1, rs2 | Source registers | 0 to 31 |
| rd | Destination register | 0 to 31 |
| aluFunc | ALU function | Add, Sub, And, Or, Xor, Sll, Sra, Srl |
| brFunc | Branch compare function | Eq, Neq, Lt, Leq, Gt, Geq |
| bSel | ALU/Br operand 2 select | 0 (rVal2), 1 (imm), 2, 3, ... (if extended later) |
| memFunc | Data memory function | Lw, Sw, Lh, Lhu, Sh, Lb, Lbu, Sb |
| memEn | Memory enable | True/False |
| wdSel | Write data select | 0 (pc + 4), 1 (dataOut), 2 (aluRes), 3, 4, ... (if extended later) |
| rfWen | Register file write enable | True/False |
| pcSel | Next PC select | 0 (jumpTarget), 1 (branchTarget), 2 (pc + 4), 3, 4, ... (if extended later) |

**(A) (2 points)** Warm-up: give the control signals for [[lui x15, 0xfff00]]. The value written to rd is the decoded 32-bit immediate plus 0. Use values from the table above, and write ? for don't-care values. Here is an example for [[add x2, x19, x5]]:

${ctl([["imm", "?"], ["rs1", "19"], ["rs2", "5"], ["rd", "2"], ["aluFunc", "Add"], ["brFunc", "?"], ["bSel", "0 (rVal2)"], ["memFunc", "?"], ["memEn", "False"], ["wdSel", "2 (aluRes)"], ["rfWen", "True"], ["pcSel", "2 (pc + 4)"]])}

**(B) (4 points)** Add input/output to the processor. The processor gets a 32-bit input [[in32]], whose value comes from a 32-bit register [[out32]]. Devices outside can also change [[out32]]; you do not need to know how. Implement Exchange Value, which stores rs1 into [[out32]] and stores [[in32]] into rd. This swaps the value in [[out32]] with a value in the processor.

~~~
xchgv rd, rs1    // reg[rd] <= in32; out32 <= reg[rs1];
~~~

Connect the inputs and output of [[out32]] in the diagram so that [[xchgv]] works. You can add decoder outputs and pcSel, wdSel, and bSel mux inputs. For full credit, add as few as possible.

@fig sp25-xchg

**(C) (4 points)** What must the decoder output for [[xchgv x6, x9]]? Write ? for don't-care values. List any decoder outputs and mux inputs that you added.

${ctl(SP_FIELDS.map((f) => [f, ""]))}

**(D) (6 points)** Now let the outside world tell the processor that something needs attention. A 1-bit wire, [[interrupt]], comes in from outside. It is usually low. When it goes high, the processor must abandon the current instruction and jump to a special function, the interrupt handler. To do this, the processor:

- stores the **current** pc (NOT pc + 4) in register **x31**, so that the handler can resume the current instruction when it finishes;
- jumps to the interrupt vector, address 0x4 (set pc = 0x4).

Wire the processor to support interrupts. Then give the decoder outputs when [[interrupt]] is high. This part is independent of parts (B) and (C): [[xchgv]] is not implemented. List any decoder outputs and mux inputs that you added. For full credit, add as few as possible.

@fig sp25-int

${ctl(SP_FIELDS.map((f) => [f, ""]))}`,
    solution: t`**(A)**

${ctl([["imm", "0xfff00000"], ["rs1", "0"], ["rs2", "?"], ["rd", "15"], ["aluFunc", "Add"], ["brFunc", "?"], ["bSel", "1 (imm)"], ["memFunc", "?"], ["memEn", "False"], ["wdSel", "2 (aluRes)"], ["rfWen", "True"], ["pcSel", "2 (pc + 4)"]])}

**(B)** Connect rVal1 to outWrData, and a new decoder output, outWrEn, to the write enable of [[out32]]. Connect [[in32]] to a new wdSel input, 3.

@fig sp25-xchg-sol

**(C)** New decoder output: outWrEn. New wdSel value: 3 (in32).

${ctl([["imm", "?"], ["rs1", "9"], ["rs2", "?"], ["rd", "6"], ["aluFunc", "?"], ["brFunc", "?"], ["bSel", "?"], ["memFunc", "?"], ["memEn", "False"], ["wdSel", "3 (in32)"], ["rfWen", "True"], ["pcSel", "2 (pc + 4)"], ["outWrEn", "True"]])}

**(D)** The [[interrupt]] wire goes into the decoder. Add pcSel input 3 = 0x4 (the interrupt vector) and wdSel input 3 = pc (the current pc).

@fig sp25-int-sol

${ctl([["imm", "?"], ["rs1", "?"], ["rs2", "?"], ["rd", "31"], ["aluFunc", "?"], ["brFunc", "?"], ["bSel", "?"], ["memFunc", "?"], ["memEn", "False"], ["wdSel", "3 (pc)"], ["rfWen", "True"], ["pcSel", "3 (int. vect.)"]])}`,
  };
  const loopCode = (o2, o3) => t`~~~
    mv x1, x0           // byte index into array
    li x2, 1000         // set bound for end of array
loop:                   // access elements from array
    lw x3, 0x0(x1)
    lw x4, 0x4(x1)
    lw x5, ${o2}(x1)
    lw x6, ${o3}(x1)
    lw x7, 0x0(x1)
    lw x8, 0x4(x1)
    lw x9, ${o2}(x1)
    lw x10, ${o3}(x1)
    addi x1, x1, 8      // process entries until we reach end of array
    ble x1, x2, loop
~~~`;
  // Gandalf's cache. Rows: set; columns: V, D, tag, word 1, word 0 for each way.
  const GANDALF = t`| Set | LRU | Way 1: V | D | tag | Word 1 | Word 0 | Way 0: V | D | tag | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0xA3 | 0x64A9 | 0x87B1 | 1 | 0 | 0x0F | 0x99C7 | 0xB69B |
| 1 | 1 | 1 | 0 | 0x27 | 0xE57B | 0x961C | 1 | 1 | 0x6B | 0x614D | 0x2448 |`;

  R["q2sp25-p4"] = {
    statement: t`**Caches.** Frodo and Sam want to reach Mount Doom as fast as possible, so they use a cache to speed up access to critical information.

**(A) (1 point)** They want an AMAT (average memory access time) of 3 cycles. A cache access takes 1 cycle. A miss takes 16 more cycles to get the data from main memory and update the cache. What hit ratio do they need?

**(B) (2 points)** Frodo proposes a 2-way set-associative cache with a block size of 2 words and 8 words in total. Addresses and words are 32 bits. Which address bits are the tag, word offset, byte offset, and cache index? Write X:X if a field needs no bits.

**(C) (1 point)** Sam proposes a direct-mapped cache with a block size of 2 words and 8 words in total. Which address bits are the tag, word offset, byte offset, and cache index?

**(D) (1 point)** Sam's direct-mapped cache is write-back and has valid bits. How many bits does it hold in total?

**(E) (3 points)** Analyze both caches on this program. The data and instruction caches are separate, and all data words start at 0x00000000. What is the steady-state hit ratio of Frodo's 2-way set-associative data cache?

${loopCode("0x14", "0x18")}

**(F) (3 points)** What is the steady-state hit ratio of Sam's direct-mapped data cache on the same program?

**(G) (3 points)** Now the offsets change:

${loopCode("0x20", "0x24")}

What is the steady-state hit ratio of Frodo's 2-way set-associative data cache on this new pattern?

**(H) (4 points)** Gandalf lends them his cache: a 2-way set-associative cache with this initial state.

${GANDALF}

For each access, decide whether it hits or misses. Consider each access on its own (each starts from the state above). If it hits, give the data returned and enter NA for the addresses to update. If it misses, enter NA for the data and list all memory addresses that must be updated, or NONE.

| Instruction | Data returned | Addresses to update |
|---|---|---|
| [[lw x1, 0x61C(x0)]] | | |
| [[lw x1, 0xA34(x0)]] | | |`,
    solution: t`**(A)** $3 = 1 + \text{miss ratio} \cdot 16$, so the miss ratio is $2/16 = 1/8$ and the hit ratio is $1 - 1/8 = 7/8$.

**(B)** Tag A[31:4], word offset A[2:2], byte offset A[1:0], cache index A[3:3]. (8 words in 2 ways of 2-word blocks gives 2 sets.)

**(C)** Tag A[31:5], word offset A[2:2], byte offset A[1:0], cache index A[4:3]. (8 words in 2-word blocks gives 4 lines.)

**(D)** Each line has 1 valid bit + 1 dirty bit + 27 tag bits + 64 data bits = 93 bits. 4 lines hold $4 \cdot 93 = 372$ bits.

**(E)** The table shows the cache at the end of each iteration (way 0 is LRU at the start). Each cell lists Word 1, Word 0 of a block. A[k] is the word at byte offset 4k.

| Iteration | Accesses | Hits | Set 0, way 0 | Set 1, way 0 | Set 0, way 1 | Set 1, way 1 |
|---|---|---|---|---|---|---|
| 1 | A0 A1 A5 A6 A0 A1 A5 A6 | 5/8 | A1, A0 | A7, A6 | A5, A4 | |
| 2 | A2 A3 A7 A8 A2 A3 A7 A8 | 6/8 | A9, A8 | A7, A6 | A5, A4 | A3, A2 |
| 3 | A4 A5 A9 A10 (twice) | 7/8 | A9, A8 | A7, A6 | A5, A4 | A11, A10 |
| 4 | A6 A7 A11 A12 (twice) | 7/8 | A9, A8 | A7, A6 | A13, A12 | A11, A10 |
| 5 | A8 A9 A13 A14 (twice) | 7/8 | A9, A8 | A15, A14 | A13, A12 | A11, A10 |

In iteration 1 the misses are A0, A5, A6. From iteration 3 on, only the last new element (A10, A12, A14, ...) misses: one miss per 8 accesses. The steady-state hit ratio is $7/8$.

**(F)** The direct-mapped cache, line by line at the end of each iteration (Word 1, Word 0):

| Iteration | Hits | Line 0 | Line 1 | Line 2 | Line 3 |
|---|---|---|---|---|---|
| 1 | 5/8 | A1, A0 | | A5, A4 | A7, A6 |
| 2 | 6/8 | A9, A8 | A3, A2 | A5, A4 | A7, A6 |
| 3 | 7/8 | A9, A8 | A11, A10 | A5, A4 | A7, A6 |
| 4 | 7/8 | A9, A8 | A11, A10 | A13, A12 | A7, A6 |
| 5 | 7/8 | A9, A8 | A11, A10 | A13, A12 | A15, A14 |

The pattern repeats with one miss per iteration, so the steady-state hit ratio is $7/8$.

**(G)** Now the accesses are A[i], A[i+1], A[i+8], A[i+9], twice each:

| Iteration | Accesses | Hits | Set 0, way 0 | Set 1, way 0 | Set 0, way 1 | Set 1, way 1 |
|---|---|---|---|---|---|---|
| 1 | A0 A1 A8 A9 (twice) | 6/8 | A1, A0 | | A9, A8 | |
| 2 | A2 A3 A10 A11 (twice) | 6/8 | A1, A0 | A3, A2 | A9, A8 | A11, A10 |
| 3 | A4 A5 A12 A13 (twice) | 6/8 | A5, A4 | A3, A2 | A13, A12 | A11, A10 |

Each iteration misses once on A[i] and once on A[i+8] (two new blocks) and hits on the other six accesses, so the steady-state hit ratio is $3/4$.

**(H)** The cache has 2 sets and 2-word blocks: byte offset A[1:0], word offset A[2], index A[3], tag A[31:4].

| Instruction | Data returned | Addresses to update |
|---|---|---|
| [[lw x1, 0x61C(x0)]] | NA | NONE |
| [[lw x1, 0xA34(x0)]] | NA | NONE |

- 0x61C has index 1 and tag 0x61. Neither way of set 1 has tag 0x61, so it misses. The LRU way of set 1 is way 1, and its D = 0, so nothing is written back.
- 0xA34 has index 0 and tag 0xA3. Way 1 of set 0 has tag 0xA3 but V = 0, so it misses. The replaced line has D = 0, so nothing is written back.`,
  };
  const snip = (lines) => "~~~\nloop: " + lines.join("\n      ") + "\n~~~";
  const P5 = {
    A: ["addi x15, x10, 2", "sub x13, x16, x10", "bne x10, x0, loop", "lw x17, 0(x10)", "addi x18, x10, 7"],
    B: ["addi x15, x10, 2", "sub x13, x15, x10", "bne x10, x0, loop", "lw x17, 0(x10)", "addi x18, x10, 7"],
    C: ["addi x15, x10, 2", "sub x13, x16, x10", "bne x10, x0, loop", "lw x17, 0(x10)", "addi x18, x17, 7"],
    D: ["addi x15, x10, 2", "sub x13, x16, x10", "bne x13, x0, loop", "lw x17, 0(x13)", "addi x18, x10, 7"],
    E: ["addi x15, x10, 2", "sub x13, x16, x10", "bne x10, x0, loop", "lw x17, 0(x15)", "addi x18, x10, 7"],
    F: ["addi x15, x10, 2", "sub x13, x16, x10", "lw x17, 0(x15)", "bne x13, x0, loop", "addi x18, x17, 7"],
  };
  // ins(list, after, nops): the snippet with a NOP line inserted after instruction index "after".
  const ins = (list, ...adds) => {
    const out = list.slice();
    adds.sort((a, b) => b[0] - a[0]).forEach(([after, n]) => out.splice(after + 1, 0, Array(n).fill("NOP").join("; ")));
    return out;
  };
  R["q2sp25-p5"] = {
    statement: t`**Software can fix everything.** A five-stage pipelined processor has no stall logic and no bypass logic. It does have speculation (nextPC = PC + 4) and annuls instructions on a misprediction. Branches resolve in EXE. For each snippet, insert NOPs so that the code gives the same results on this pipelined processor as on an unpipelined processor. For full credit, execute as few NOPs as possible. Write the NOPs between two instructions on one line, separated by semicolons. If no NOPs are needed, write "No NOPs required."

${Object.entries(P5).map(([k, v]) => `**(${k}) (2 points)**\n\n${snip(v)}`).join("\n\n")}`,
    solution: t`Without bypassing, a value written in WB can be read in DEC in the same cycle, so a dependent instruction must be 3 instructions after the one it depends on. The instructions after a taken [[bne]] are annulled, so a NOP after the branch only runs on the fall-through path.

**(A)** No NOPs required.

**(B)** [[sub]] reads [[x15]] from [[addi]]: 3 NOPs.

${snip(ins(P5.B, [0, 3]))}

**(C)** [[addi x18]] reads [[x17]] from [[lw]]: 3 NOPs.

${snip(ins(P5.C, [3, 3]))}

**(D)** [[bne]] reads [[x13]] from [[sub]]: 3 NOPs. Then [[lw]] is far enough from [[sub]].

${snip(ins(P5.D, [1, 3]))}

**(E)** [[lw]] reads [[x15]] from [[addi]]. One NOP after [[bne]] is enough, because it only runs when the loop exits. A NOP inside the loop (after [[addi]] or [[sub]]) would run every iteration, which is slower.

${snip(ins(P5.E, [2, 1]))}

**(F)** [[lw]] reads [[x15]] from [[addi]] (2 NOPs after [[sub]], which also give [[bne]] its distance from [[sub]]). [[addi x18]] reads [[x17]] from [[lw]] (2 NOPs after [[bne]]). 4 NOPs in total.

${snip(ins(P5.F, [1, 2], [3, 2]))}`,
  };
  def("sp25-p6-5st", stageDiag([["IF"], ["DEC", "BYP"], ["EXE"], ["MEM"], ["WB"]], [["EXE", "BYP"], ["MEM", "BYP"], ["WB", "BYP"]]));
  def("sp25-p6-4st", stageDiag([["IF"], ["DEC", "BYP"], ["EXE", "MEM"], ["WB"]], [["MEM", "BYP"], ["WB", "BYP"]]));
  def("sp25-p6-blank5", root.Fig.pipe({ start: 100, n: 13, rows: blank("lw", 13) }));
  def("sp25-p6-blank4", root.Fig.pipe({ start: 100, n: 13, lw: 64, rows: { IF: ["lw"], DEC: ["#"], "EXE/MEM": ["#", "#"], WB: ["#", "#", "#"] } }));
  def("sp25-p6-a", root.Fig.pipe({ start: 100, arrows: [["WB", "DEC", 105], ["MEM", "DEC", 107], ["EXE", "DEC", 109]], rows: rows(`
    IF  lw lw add sw sw sw sw addi bnez lw xori lw lw
    DEC # lw lw add add add sw sw addi bnez lw NOP lw
    EXE # # lw lw NOP NOP add sw sw addi bnez NOP NOP
    MEM # # # lw lw NOP NOP add sw sw addi bnez NOP
    WB  # # # # lw lw NOP NOP add sw sw addi bnez`) }));
  def("sp25-p6-b", root.Fig.pipe({ start: 100, lw: 64, arrows: [["WB", "DEC", 104], ["WB", "DEC", 106], ["EXE/MEM", "DEC", 108]], rows: rows(`
    IF  lw lw add sw sw sw addi bnez lw xori lw lw add
    DEC # lw lw add add sw sw addi bnez lw NOP lw lw
    EXE/MEM # # lw lw NOP add sw sw addi bnez NOP NOP lw
    WB  # # # lw lw NOP add sw sw addi bnez NOP NOP`) }));
  const DELAYS = t`| Stage | Delay |
|---|---|
| IF | 2 ns |
| DEC | 4 ns |
| EXE | 7 ns |
| MEM | 6 ns |
| WB | 3 ns |
| BYP | 1 ns |`;

  R["q2sp25-p6"] = {
    statement: t`**Pipelined processor performance.** Ben writes this loop to compute the 25th Fibonacci number into [[a0]]. Registers [[t1]] and [[t2]] hold writable memory addresses.

~~~
      addi t0, x0, 24      // t0 = 24
      addi a0, x0, 0       // fib(0) = 0
      sw a0, 0(t1)
      addi a1, x0, 1       // fib(1) = 1
      sw a1, 0(t2)
fib:  lw a0, 0(t1)
      lw a1, 0(t2)
      add a2, a0, a1       // fib(n) = fib(n-1) + fib(n-2)
      sw a1, 0(t1)         // update fib(n-2) to fib(n-1)
      sw a2, 0(t2)         // update fib(n-1) to fib(n)
      addi t0, t0, -1
      bnez t0, fib
      lw a0, 0(t2)         // a0 <- fib(25)
      xori a4, a2, 2
      ret
~~~

He runs it on a standard 5-stage processor with full bypassing and branch annulment. Branches are predicted not taken, and branch decisions are made in EXE. The loop runs many times and is in the middle of its execution.

**(A) (7 points)** Fill in the 5-stage pipeline diagram for cycles 100 to 112. The [[lw a0, 0(t1)]] is fetched in cycle 100. Draw arrows for each use of bypassing. Then answer: how many cycles does each iteration take in steady state? How many cycles per iteration are lost to stalls, and how many to annulments?

@fig sp25-p6-blank5

The processor has these combinational delays:

@fig sp25-p6-5st

${DELAYS}

What is the minimum clock period with ideal registers ($t_{PD} = t_{SETUP} = 0$)? How long does one iteration take?

Alice notices that memory operations are a large part of this code. She says that merging EXE and MEM will make each iteration faster, because it uses fewer cycles. Ben builds a 4-stage pipeline (IF, DEC, EXE/MEM, WB). Branches are predicted not taken, and branch decisions are made in EXE/MEM.

**(B) (7 points)** Fill in the 4-stage pipeline diagram for cycles 100 to 112. [[lw a0, 0(t1)]] is fetched in cycle 100. Draw arrows for bypassing. How many cycles does each iteration take, and how many are lost to stalls and to annulments?

@fig sp25-p6-blank4

@fig sp25-p6-4st

Was Alice correct? What is the minimum clock period with ideal registers, and how long does one iteration take?

**(C) (5 points)** Ben sees that the loop can be written without [[sw]] and [[lw]]. Rewrite it without them, with as few cycles per iteration as possible.

~~~
      addi t0, zero, 24    // t0 = 24
      addi a0, zero, 0     // fib(0) = 0
      addi a1, zero, 1     // fib(1) = 1
fib:  ______________
      ______________
      ______________
      ______________
      ______________
      ______________
      mv a0, ____          // a0 <- fib(25)
      xori a4, a2, 2       // Unrelated future instructions
      ret
~~~

Ben runs the new code on the 5-stage processor from part (A). How many cycles per iteration does it take in steady state, and how long is one iteration?`,
    solution: t`**(A)** Bypasses: [[lw a1]] to [[add]] from WB (cycle 105), [[add]] to [[sw a2]] from MEM (cycle 107), [[addi]] to [[bnez]] from EXE (cycle 109).

@fig sp25-p6-a

[[lw]] is fetched in cycles 100 and 111, so an iteration takes **11 cycles**. 2 cycles are lost to the load-to-use stall of [[add]], and 2 cycles to the annulled [[lw]] and [[xori]] after the taken branch.

The minimum clock period is **8 ns**: EXE followed by BYP ($7 + 1$). One iteration takes $11 \cdot 8 = 88$ ns.

**(B)** Bypasses from WB in cycles 104 and 106, and from EXE/MEM in cycle 108.

@fig sp25-p6-b

An iteration takes **10 cycles** ([[lw]] fetched in cycles 100 and 110): 1 cycle lost to stalls and 2 to annulments. But the minimum clock period is now **14 ns**: EXE + MEM + BYP ($7 + 6 + 1$). One iteration takes $10 \cdot 14 = 140$ ns, so Alice was **not** correct.

**(C)**

~~~
fib:  add a2, a0, a1
      mv a0, a1
      mv a1, a2
      addi t0, t0, -1
      bnez t0, fib
      mv a0, a1            // a0 <- fib(25)
~~~

Each iteration takes **7 cycles**: 5 instructions plus 2 annulled after the taken branch (full bypassing removes all stalls). One iteration takes $7 \cdot 8 = 56$ ns.`,
  };
  // ================================================================ Spring 2026

  R["q2sp26-p1"] = {
    statement: t`**Sequential circuits.** Sam Sequential and Carla Concurrent build a GCD multiplier. Sam builds the input-output interface, and Carla implements the computation. They did not agree on an interface:

- Carla's module accepts four inputs at the same time, computes, and returns four outputs.
- Sam's interface accepts one input and produces one output.

The rest of the team already uses Sam's interface, so Sam must connect it to Carla's module. A **serializer** turns a stream of N parallel values into a stream of one value at a time. A **deserializer** does the opposite: it collects N values and sends them out together.

**(A) (8 points)** Read the [[Deserializer]] module and fill in its cycle-by-cycle behavior.

~~~
module Deserializer#(Integer packSize, Integer width);
   Vector#(packSize, Reg#(Bit#(width))) buffer(0);
   Reg#(Bit#(log2(packSize)+1)) idx(0);
   input Maybe#(Bit#(width)) data_i default = Invalid;
   input Bool clear default = False;

   Bool is_done = idx == packSize;

   rule tick;
      if (clear) begin
         idx <= 0;
      end else if (idx < packSize && isValid(data_i)) begin
         buffer[idx] <= fromMaybe(?, data_i);
         idx <= idx + 1;
      end
   endrule

   method Maybe#(Vector#(packSize, Bit#(width))) out;
      if (is_done) begin
         Vector#(packSize, Bit#(width)) data_o;
         for (Integer i = 0; i < packSize; i = i + 1) begin
            data_o[i] = buffer[i];
         end
         return Valid(data_o);
      end else begin
         return Invalid;
      end
   endmethod
endmodule
~~~

Describe a [[Deserializer#(3, 32)]]. The inputs and cycle 1 are given. Write a vector as a list of numbers with index 0 on the left (as in cycle 1).

| Cycle | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| data_i | Valid(10) | Invalid | Valid(20) | Valid(30) | Valid(40) | Valid(50) | Valid(60) |
| clear | False | False | False | False | False | True | True |
| buffer | 0,0,0 | | | | | | |
| idx | 0 | | | | | | |
| is_done | False | | | | | | |
| out | Invalid | | | | | | |

**(B) (8 points)** Implement a [[Serializer]] module with this interface:

- The serializer is in one of two states: **Idle** (it can accept new data) or **HasData** (it has data to read out).
- If the module has no data, valid input data goes into its internal state.
- If the module has data: it ignores new data; it tracks the current element and gives it through [[get_data]]; and when [[next]] is set, it moves to the next element, or goes back to Idle if no valid data is left.

Fill in the blank, the rule, and the [[get_data]] method. The rule and the method can take several lines.

~~~
typedef enum { Idle, HasData } SerStates;

module Serializer#(Integer packSize, Integer width);
   Vector#(packSize, Reg#(Bit#(width))) buffer(0);
   Reg#(Bit#(log2(packSize)+1)) idx(0);
   Reg#(SerStates) state(______________);

   // Provide new data to the module
   input Maybe#(Vector#(packSize, Bit#(width))) data_i;
   // Should we move to the next element in the current buffer.
   input Bool next default = False;

   rule tick;
      // Fill in missing code
   endrule

   method Maybe#(Bit#(width)) get_data;
      // Fill in missing code
   endmethod
endmodule
~~~`,
    solution: t`**(A)**

| Cycle | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| data_i | Valid(10) | Invalid | Valid(20) | Valid(30) | Valid(40) | Valid(50) | Valid(60) |
| clear | False | False | False | False | False | True | True |
| buffer | 0,0,0 | 10,0,0 | 10,0,0 | 10,20,0 | 10,20,30 | 10,20,30 | 10,20,30 |
| idx | 0 | 1 | 1 | 2 | 3 | 3 | 0 |
| is_done | False | False | False | False | True | True | False |
| out | Invalid | Invalid | Invalid | Invalid | Valid(10,20,30) | Valid(10,20,30) | Invalid |

Valid(40) in cycle 5 is ignored because idx = packSize. In cycle 6, clear resets idx to 0.

**(B)**

~~~
Reg#(SerStates) state(Idle);
...
rule tick;
   if (state == Idle && isValid(data_i)) begin
      let info = fromMaybe(?, data_i);
      for (Integer i = 0; i < packSize; i = i + 1)
         buffer[i] <= info[i];
      state <= HasData;
      idx <= 0;
   end else if (state == HasData && next) begin
      if (idx == packSize - 1) begin
         // idx <= 0;   (could reset here too)
         state <= Idle;
      end else
         idx <= idx + 1;
   end
endrule

method Maybe#(Bit#(width)) get_data;
   return (state == HasData) ? Valid(buffer[idx]) : Invalid;
endmethod
~~~`,
  };
  // "Find the Bit" circuit. mod: true replaces the 8 with a 2-stage 4 + 4 component (given registers).
  const bitCircuit = (regs, mod) => {
    const N = {
      "@MM": [30, 30, "Maze\nMap", { w: 50, s: 12 }], m2: [114, 30, "2"], m1: [178, 30, "1"],
      "@CL": [30, 118, "Current\nLevel", { w: 50, s: 12 }], c4: [114, 118, "4"],
      "@HS": [30, 206, "Health\nStatus", { w: 50, s: 12 }], h3: [114, 206, "3"], h2: [178, 206, "2"],
      b3: [245, 206, "3"], b1: [312, 206, "1"], t5: [312, 30, "5"], m3: [312, 118, "3"],
      t3: [390, 30, "3"], mm2: [390, 118, "2"], b4: [390, 206, "4"], n4: [464, 118, "4"], "@SC": [536, 118, "Secret\nCode", { w: 50, s: 12 }],
    };
    if (mod) Object.assign(N, { qa: [178, 118, "4"], qb: [220, 118, "4"] });
    else N.n8 = [178, 118, "8"];
    const src = mod ? "qb" : "n8", dst = mod ? "qa" : "n8";
    const E = [
      "@MM>m2", "m2>m1", "@CL>c4", "@HS>h3", "h3>h2", `m1>${dst}`, `c4>${dst}`, `h2>${dst}`,
      [src, "t5", { via: [[256, 118], [256, 30]] }], `${src}>m3`, "h2>b3", "b3>b1", "b1>b4",
      "t5>t3", ["t5", "mm2", { via: [[358, 30], [358, 112]] }], "m3>mm2", ["m3", "b4", { via: [[358, 118], [358, 206]] }],
      "t3>n4", "mm2>n4", "b4>n4", "n4>@SC",
    ];
    if (mod) E.push(["qa", "qb", { reg: 1, rc: "" }]);
    // The component's output register sits on the shared wire before the branch to t5.
    const given = mod ? [dot(244, 118, 4.5)] : [];
    return svg(566, 230, graph(N, E, { regs, rc: "acc", bw: 30, bh: 30, font: { s: 16 } }), given);
  };
  def("sp26-bit", bitCircuit({}, false));
  def("sp26-bit-b", bitCircuit({
    "m1>n8": 1, "c4>n8": 1, "h2>n8": 1, "n8>m3": [0.3], "h2>b3": 1, "b3>b1": 1, "t3>n4": 1, "mm2>n4": 1, "b4>n4": 1, "n4>@SC": 1,
  }, false));
  def("sp26-bit-c0", bitCircuit({}, true));
  def("sp26-bit-c", bitCircuit({
    "m1>qa": 1, "c4>qa": 1, "h2>qa": 1, "h2>b3": [0.33, 0.66], "b3>b1": 1, "b1>b4": 1, "t5>t3": [0.25], "m3>mm2": [0.3],
    "t3>n4": 1, "mm2>n4": 1, "b4>n4": 1, "n4>@SC": 1,
  }, true));

  R["q2sp26-p2"] = {
    statement: t`**Arithmetic pipelines.** Ben plays a video game, "Find the Bit", where he goes through a maze to find a secret code that completes the level. He builds a circuit that takes the inputs of each level (Maze Map, Current Level, and Health Status) and outputs the secret code.

Each component shows its propagation delay in nanoseconds. For every pipeline, use a minimum number of registers, and put a register on each output. Mark registers with large dots on the signal arrows. Unless stated otherwise, registers are ideal ($t_{SETUP} = 0$, $t_{PD} = 0$).

@fig sp26-bit

**(A) (2 points)** What are the latency and throughput of the 1-stage pipeline of this circuit?

**(B) (4 points)** Pipeline the circuit for maximum throughput with a minimum number of registers. Give the latency and throughput.

**(C) (4 points)** One module can be replaced with a 2-stage pipelined component, as shown below. The two black dots are registers that the component already has. Show the maximum-throughput pipeline with a minimum number of registers, and give its latency and throughput.

@fig sp26-bit-c0

**(D) (2 points)** The game developers notice their mistake: anyone with all the game data can solve every level quickly. Now players must wait a day before they can access a new level's Maze Map and Current Level. Ben's circuits always produce the correct code and are idle until he gives them the new inputs. Which circuit should he use to finish a level as fast as possible after it becomes available: the 1-stage pipeline, the pipeline from part (B), or the pipeline from part (C)?

**(E) (2 points)** Ben spills coffee on his circuit and rebuilds it. He cannot use the component from part (C), and his registers have $t_{PD,REG} = 2$ ns and $t_{SETUP,REG} = 0$ ns. All components now have $t_{CD} = 1$ ns. If he pipelines for maximum throughput with minimal registers, what are the throughput and latency?`,
    solution: t`**(A)** The longest path is Health Status → 3 → 2 → 8 → 5 → 3 → 4 → Secret Code: 25 ns. Latency 25 ns, throughput $1/25$ ns$^{-1}$.

**(B)** The slowest component is 8 ns, so the best period is 8 ns. Stage 1: the 2 and 1 of Maze Map, the 4, and the 3 and 2 of Health Status. Stage 2: the 8 and the bottom 3. Stage 3: 5, 3 (top and middle), the middle 2, the bottom 1, and the bottom 4. Stage 4: the last 4. Latency $4 \cdot 8 = 32$ ns, throughput $1/8$ ns$^{-1}$.

@fig sp26-bit-b

**(C)** The slowest component is now 5 ns, so the best period is 5 ns. Stage 1: the inputs' first components (up to $3 + 2 = 5$ ns). Stages 2 and 3: the two halves of the component. Stage 4: 5 and the middle 3. Stage 5: the top 3, the middle 2, and the bottom 4. Stage 6: the last 4. The bottom 3 and 1 go in stages 2 to 4. Latency $6 \cdot 5 = 30$ ns, throughput $1/5$ ns$^{-1}$.

@fig sp26-bit-c

**(D)** **1-stage pipeline.** Ben only needs one output per set of inputs (the circuit runs once a day), so the circuit with the lowest latency finishes first: 25 ns, against 32 ns and 30 ns.

**(E)** Use the maximum-throughput pipeline from part (B). $t_{CLK} \ge t_{PD,REG} + 8 + t_{SETUP,REG} = 2 + 8 + 0 = 10$ ns. There are 4 stages, so the latency is $4 \cdot 10 = 40$ ns and the throughput is $1/10$ ns$^{-1}$.`,
  };
  def("sp26-rep-a", root.Fig.rvsc({ repclear: true }));
  def("sp26-rep-b", root.Fig.rvsc({ repclear: true, masel: true, w: 900 }));
  def("sp26-rep-sol", root.Fig.rvsc({ repclear: true, masel: true, w: 900, zIn: "branch", xIn: "offsetVal", yIn: "rVal2" }));
  const REPCODE = t`~~~
if (reg[rs1] >= 1)
    pc <= pc
    Mem[reg[rs2] + offset] <= 0
    reg[rs1] <= reg[rs1] - 1
    offset <= offset + 4
else
    pc <= pc + 4
endif
~~~`;

  R["q2sp26-p3"] = {
    statement: t`**Processor implementation.** Victor writes a program that clears an array (sets every element to 0). [[x1]] holds the array address, [[x2]] holds its size, and [[x3]] is a temporary.

~~~
      mv   x3, x1
loop: sw   x0, 0(x3)
      addi x3, x3, 4
      addi x2, x2, -1
      bnez x2, loop
~~~

The loop uses 4 instructions per array entry. Victor wants one instruction:

~~~
repclear rs1, rs2
~~~

[[repclear]] takes the array size in rs1 and a memory address in rs2, both unsigned. It sets one entry to zero, decrements the size, and moves to the next entry. It repeats (it does not go to pc + 4) until reg[rs1] is 0:

${REPCODE}

[[repclear]] can take many cycles, and it updates one array element per cycle. Victor adds an offset register that increments by 4 every cycle. Setting [[offsetReset]] to 1 resets it to 0, and [[offsetVal]] gives its value. He also adds 3 muxes (Z, WASEL, and MDSEL). All new control signals come from the decoder. The processor can do an ALU operation and an ALU Br operation in the same cycle, but both use the same inputs.

@fig sp26-rep-a

**(A) (3 points)** Victor cannot make [[repclear]] work with this hardware. One line of the pseudocode cannot be implemented. Which one? Explain why.

Victor adds more hardware: an adder with inputs X and Y, and a mux MASEL that selects the memory address.

@fig sp26-rep-b

**(B) (3 points)** Which internal signal or constant should X, Y, and Z connect to so that the processor can implement [[repclear]]?

**(C) (1 point)** What should [[offsetReset]] be for instructions that are not [[repclear]]?

**(D) (3 points)** For [[repclear]], what are the select values of MDSEL, MASEL, and WASEL?

**(E) (8 points)** For [[repclear]], what are the other decoder outputs? Each can be a constant or an internal signal. aluFunc is one of Add, Sub, And, Or, Xor, Slt, Sltu, Sll, Srl, Sra. brFunc is one of Eq, Neq, Lt, Ltu, Ge, Geu. MemFunc is one of Lw, Lh, Lhu, Lb, Lbu, Sw, Sh, Sb.

| Field | Value |
|---|---|
| imm | |
| aluFunc | |
| brFunc | |
| BSEL | |
| MemFunc | |
| MemEnable | |
| WDSEL | |
| WERF | |
| PCSEL | |`,
    solution: t`**(A)** The line [[Mem[reg[rs2] + offset] <= 0]] cannot be implemented. The ALU cannot add the offset to reg[rs2], and the ALU is already busy subtracting 1 from reg[rs1].

**(B)** X = offsetVal and Y = rVal2 (or the other way around). Z = branch (the ALU Br output: stay at pc while reg[rs1] ≥ 1).

@fig sp26-rep-sol

**(C)** offsetReset = 1 (True) for every other instruction, so the offset is 0 when [[repclear]] starts.

**(D)** MDSEL = 0 (store the constant 0), MASEL = 1 (address = reg[rs2] + offset), WASEL = 0 (write back to rs1).

**(E)**

| Field | Value |
|---|---|
| imm | 1 |
| aluFunc | Sub |
| brFunc | Ge or Geu |
| BSEL | 1 |
| MemFunc | Sw |
| MemEnable | branch |
| WDSEL | 1 |
| WERF | branch |
| PCSEL | 0 |

The ALU computes reg[rs1] − 1 and the ALU Br compares reg[rs1] ≥ 1 with the same inputs (imm = 1). The memory write and the register write only happen when [[branch]] is true. PCSEL = 0 selects the Z mux, which picks pc when [[branch]] is true and pc + 4 otherwise.`,
  };
  R["q2sp26-p4"] = {
    statement: t`**Cache reverse engineering.** Ben starts a company that designs RISC-V CPUs. He is not sure which cache geometry to use, so he reverse-engineers his competitors' caches by measuring their behavior on test programs.

Company 1's CPU has separate instruction and data caches. The data cache holds 64 words in total, with a block size of 4 words. It is either direct-mapped or 2-way set-associative with LRU replacement.

**(A) (2 points)** Which address bits are the data cache index in each of the two possible configurations?

Ben runs this program on Company 1's CPU, with the cache empty at the start:

~~~
      mv x1, x0           // byte index into array
      li x2, 128          // set bound for end of array
                          // (arrays contain 32 words = 128 bytes each)
loop: lw x3, 0x100(x1)    // load next value from array A
      lw x4, 0x180(x1)    // load next value from array B
      add x5, x3, x4      // add the values
      sw x5, 0x200(x1)    // store sum in array C
      addi x1, x1, 4      // increment array byte index
      blt x1, x2, loop    // process until end of array
      unimp

. = 0x100
A: .word 1                // 32-element integer array A
   ...
   .word 32
. = 0x180
B: .word 1                // 32-element integer array B
   ...
   .word 32
. = 0x200
C: .word 1                // 32-element integer array C
   ...
   .word 32
~~~

**(B) (3 points)** Ben sees a data cache hit ratio of 0%. Is Company 1's data cache direct-mapped or 2-way set-associative?

**(C) (4 points)** What would the data cache hit ratio be with the other cache type?

Company 2's CPU has a direct-mapped data cache with 64 words in total, but the block size is unknown. Ben runs this program with the cache empty at the start:

~~~
      mv x1, x0           // byte index into array
      li x2, 128          // set bound for end of array
                          // (array contains 32 words = 128 bytes)
loop: lw x3, 0x100(x1)    // load next value from array A
      addi x3, x3, 1      // increment the value
      sw x3, 0x100(x1)    // store the value back in array A
      addi x1, x1, 4      // increment array byte index
      blt x1, x2, loop    // process until end of array
      unimp

. = 0x100
A: .word 1                // 32-element integer array A
   ...
   .word 32
~~~

**(D) (3 points)** With a block size of 8 words, what data cache hit ratio would Ben see?

**(E) (2 points)** If Ben sees a 50% hit ratio, what is the block size (in words)?

**(F) (2 points)** If Ben sees a 7/8 hit ratio, what is the block size (in words)?

**(G) (2 points)** Ben measures an AMAT of 10 cycles for data accesses with a 7/8 hit ratio. A miss takes 64 more cycles to get the data from main memory and update the cache. What is the access time of the data cache?`,
    solution: t`**(A)** Direct-mapped: A[7:4]. 2-way: A[6:4]. In both, the byte offset is 2 bits and the word offset is 2 bits. The direct-mapped cache has $64 / 4 = 16$ sets (4 index bits). The 2-way cache has $64 / 4 / 2 = 8$ sets (3 index bits).

**(B)** **2-way set-associative.** In the 2-way cache, 0x100(x1), 0x180(x1), and 0x200(x1) all map to the same set. A goes in, then B. C evicts A (LRU). In the next iteration A evicts B, B evicts C, and so on. Every line is evicted before it is used again, so every access misses.

**(C)** **1/4.** In the direct-mapped cache, 0x100(x1) and 0x200(x1) map to the same line and evict each other every iteration, so they always miss. 0x180(x1) maps to a different line, so it misses once every 4 iterations (once per 4-word block) and hits the other 3 times. Over 4 iterations: $3$ hits in $12$ data accesses, $3/12 = 1/4$.

**(D)** For block size B: the first iteration's [[lw]] misses and its [[sw]] hits. The next $B - 1$ iterations use the same line and hit. Then the pattern repeats with the next line. The hit ratio is $(2B - 1)/(2B)$. With $B = 8$: $15/16$.

**(E)** $(2B - 1)/(2B) = 1/2$ gives $B = 1$ word.

**(F)** $(2B - 1)/(2B) = 7/8$ gives $B = 4$ words.

**(G)** $\text{AMAT} = \text{hit time} + (1 - \text{hit ratio}) \cdot \text{miss penalty}$: $10 = \text{hit time} + (1/8) \cdot 64$, so the hit time is $10 - 8 = 2$ cycles.`,
  };
  def("sp26-p5-blank", root.Fig.pipe({ start: 101, n: 14, cw: 42, rows: blank("beq", 14) }));
  def("sp26-p5-a", root.Fig.pipe({ start: 101, cw: 42, rows: rows(`
    IF  beq lw lw add mv mv mv mv jal mv ret beq lw lw
    DEC # beq lw lw add add add add mv jal mv NOP beq lw
    EXE # # beq lw lw NOP NOP NOP add mv jal NOP NOP beq
    MEM # # # beq lw lw NOP NOP NOP add mv jal NOP NOP
    WB  # # # # beq lw lw NOP NOP NOP add mv jal NOP`) }));
  def("sp26-p5-b", root.Fig.pipe({ start: 101, cw: 42, arrows: [["MEM", "DEC", 106], ["WB", "DEC", 110], ["MEM", "DEC", 114]], rows: rows(`
    IF  beq lw lw add mv mv jal mv beq lw lw add mv mv
    DEC # beq lw lw add add mv jal NOP beq lw lw add add
    EXE # # beq lw lw NOP add mv jal NOP beq lw lw NOP
    MEM # # # beq lw lw NOP add mv jal NOP beq lw lw
    WB  # # # # beq lw lw NOP add mv jal NOP beq lw`) }));
  const LLCODE = t`~~~
start:  li   t0, 0           (1)
        mv   t1, a0          (2)
loop:   beq  t1, x0, done    (3)
        lw   t3, 8(t1)       (4)
        lw   t2, 0(t1)       (5)
        add  t0, t0, t2      (6)
        mv   t1, t3          (7)
        jal  x0, loop        (8)
done:   mv   a0, t0          (9)
        ret                  (10)
~~~`;

  R["q2sp26-p5"] = {
    statement: t`**Pipelined processors.** A 5-stage in-order pipeline has the stages IF, DEC, EXE, MEM, WB, one cycle each. As usual:

- the register file is read in DEC and written in WB;
- branches resolve in EXE;
- [[jal]] changes control flow, and its target is known in EXE;
- the processor annuls on a misprediction and always predicts branches not taken;
- when a hazard cannot be resolved, the processor stalls (inserts NOPs).

Unlike most pipelined processors, this one returns load data **in the MEM stage** (in the same cycle).

${LLCODE}

The program sums the elements of a linked list. Each node holds its value at offset 0 and a pointer to the next node at offset 8. [[a0]] starts with a pointer to the first node. The program adds each value into [[t0]], follows the pointer, and stops when the pointer is null. The sum is returned in [[a0]]. (You do not need to understand the code for this problem.)

**(A) (7 points)** The processor has **no bypass paths**. The loop has run many times and keeps running. Fill in the pipeline diagram: in cycle 101 a new iteration begins with [[beq]]. What is the average CPI if the loop runs many times?

@fig sp26-p5-blank

**(B) (7 points)** Now the processor has **full bypassing**, and the [[jal]] target is known in **DEC**. Everything else is the same. Fill in the diagram (cycle 101 begins with [[beq]]) and draw arrows for each bypass. What is the average CPI?

@fig sp26-p5-blank

**(C) (2 points)** Using the processor of part (B), swap two instructions (by line number) so that the loop has no stalls in steady state, without changing what the program does. Explain briefly. More than one pair can work.`,
    solution: t`**(A)** [[beq]] is fetched in cycles 101 and 112: 11 cycles for 6 instructions, so the CPI is $11/6$.

@fig sp26-p5-a

**(B)** Bypasses: [[lw t2]] to [[add]] from MEM (cycle 106), [[mv t1]] to [[beq]] from WB (cycle 110), and [[lw t2]] to [[add]] again (cycle 114). [[beq]] is fetched in cycles 101 and 109: 8 cycles for 6 instructions, so the CPI is $8/6 = 4/3$.

@fig sp26-p5-b

**(C)** Swap lines **{4, 5}** or **{6, 7}**. Lines 5 and 6 have a load-to-use hazard. After either swap, [[add]] is two instructions after the [[lw]] it depends on, so the data arrives through the MEM → DEC bypass and the stall goes away.`,
  };
  def("sp26-p6-louis", stageDiag([["IF"], ["DEC", "BYP"], ["EXE"], ["MEM1"], ["MEM2"], ["WB"]],
    [["EXE", "BYP"], ["MEM1", "BYP"], ["MEM2", "BYP"], ["WB", "BYP"]]));
  def("sp26-p6-alyssa", stageDiag([["PRD", "IF"], ["DEC", "BYP"], ["EXE"], ["MEM"], ["WB"]],
    [["EXE", "BYP"], ["MEM", "BYP"], ["WB", "BYP"]], [["EXE", "PRD"]]));
  def("sp26-p6-blank-a", root.Fig.pipe({ start: 3, n: 16, cw: 40, rows: blank("lw", 16) }));
  def("sp26-p6-blank-c", root.Fig.pipe({ start: 100, n: 16, cw: 40, rows: blank("lw", 16) }));
  def("sp26-p6-a", root.Fig.pipe({ start: 3, cw: 40, arrows: [["WB", "DEC", 7], ["EXE", "DEC", 12], ["WB", "DEC", 18]], rows: rows(`
    IF  lw bge mv mv mv addi addi addi bnez sw ret lw bge mv mv mv
    DEC # lw bge bge bge mv NOP addi addi bnez sw NOP lw bge bge bge
    EXE # # lw NOP NOP bge NOP NOP addi addi bnez NOP NOP lw NOP NOP
    MEM # # # lw NOP NOP bge NOP NOP addi addi bnez NOP NOP lw NOP
    WB  # # # # lw NOP NOP bge NOP NOP addi addi bnez NOP NOP lw`) }));
  def("sp26-p6-c", root.Fig.pipe({ start: 100, cw: 40,
    arrows: [["WB", "DEC", 104], ["EXE", "DEC", 107], ["MEM", "DEC", 108], ["WB", "DEC", 111], ["EXE", "DEC", 114], ["MEM", "DEC", 115]], rows: rows(`
    IF  lw bge addi addi addi addi bnez lw bge addi addi addi addi bnez lw bge
    DEC # lw bge bge bge addi addi bnez lw bge bge bge addi addi bnez lw
    EXE # # lw NOP NOP bge addi addi bnez lw NOP NOP bge addi addi bnez
    MEM # # # lw NOP NOP bge addi addi bnez lw NOP NOP bge addi addi
    WB  # # # # lw NOP NOP bge addi addi bnez lw NOP NOP bge addi`) }));
  const dtab = (rows2) => "| Stage | Delay |\n|---|---|\n" + rows2.map(([a, b]) => `| ${a} | ${b} ns |`).join("\n");

  R["q2sp26-p6"] = {
    statement: t`**Pipelined processor performance.** Ben looks for the cheapest flight for spring break. He stores 1000 flight prices in an integer array in memory. He does not know that the prices are **already sorted in ascending order**. He writes this program to find the lowest price. [[t2]] holds the base address of the array, and all other registers start at 0.

~~~
       addi t0, x0, 1000
       lw a0, 0(t2)
loop:  lw a1, 0(t2)
       bge a1, a0, skip
       mv a0, a1
skip:  addi t2, t2, 4
       addi t0, t0, -1
       bnez t0, loop
       sw a0, 0x1000(x0)
       ret
~~~

He runs it on a standard 5-stage processor with full bypassing and branch annulment. Branches are predicted not taken, and branch decisions are made in EXE. The loop repeats many times. **The array is sorted, so [[bge]] is always taken.**

**(A) (8 points)** Fill in the pipeline diagram for cycles 3 to 18. [[lw a1, 0(t2)]] is fetched for the first time in cycle 3. Draw arrows for each use of bypassing.

@fig sp26-p6-blank-a

Ben's processor has these combinational delays:

@fig sp25-p6-5st

${dtab([["IF", 5], ["DEC", 10], ["EXE", 15], ["MEM", 20], ["WB", 10], ["BYP", 2]])}

What is the minimum clock period with ideal registers ($t_{PD} = t_{SETUP} = 0$)? In steady state, how many cycles does one iteration take, and how long is one iteration?

Louis suggests splitting the data memory into two pipeline stages, MEM1 and MEM2, one cycle each.

**(B) (3 points)** Louis' processor has these delays:

@fig sp26-p6-louis

${dtab([["IF", 5], ["DEC", 10], ["EXE", 15], ["MEM1", 12], ["MEM2", 12], ["WB", 10], ["BYP", 2]])}

What is its minimum clock period with ideal registers? How does the number of cycles per iteration change compared with Ben's processor?

- i. It stays the same.
- ii. It increases by one.
- iii. It increases by two.
- iv. It decreases by one.
- v. It decreases by two.

Alyssa knows that flight prices are always sorted, ascending or descending. Starting from Ben's original processor, she adds a branch predictor. The first time a branch executes, the processor predicts not taken. After that, it predicts the outcome of the most recent execution of that branch. For each branch, it records whether it was taken and its target address. When a branch resolves in EXE, the processor records the outcome. **When a branch that has executed before is in DEC, the predictor uses the recorded outcome to choose the next instruction to fetch in that same cycle.** The prediction logic (PRD) and the delays are:

@fig sp26-p6-alyssa

${dtab([["PRD", 2], ["IF", 5], ["DEC", 10], ["EXE", 15], ["MEM", 20], ["WB", 10], ["BYP", 2]])}

**(C) (7 points)** The loop is in the middle of its execution. Fill in the diagram for cycles 100 to 115; [[lw a1, 0(t2)]] is fetched in cycle 100. Draw arrows for each use of bypassing. Then give the minimum clock period, the cycles per iteration in steady state, and the time per iteration.

@fig sp26-p6-blank-c`,
    solution: t`**(A)**

@fig sp26-p6-a

The minimum clock period is **22 ns**: a value bypassed from MEM through BYP ($20 + 2$). [[lw a1]] is fetched in cycles 3 and 14, so an iteration takes **11 cycles**: $11 \cdot 22 = 242$ ns.

**(B)** The minimum clock period is **17 ns**: EXE through BYP ($15 + 2$). Answer **ii**: the number of cycles per iteration increases by one, because the load result now arrives one stage later, so the load-to-use stall of [[bge]] is one cycle longer.

**(C)** After the first iterations, the predictor knows that [[bge]] and [[bnez]] are taken, so the processor fetches their targets as soon as each branch is in DEC. No instruction is annulled and [[mv]] is never fetched. The only lost cycles are the load-to-use stall of [[bge]].

@fig sp26-p6-c

The minimum clock period is **22 ns** (EXE → BYP, or EXE → PRD → IF; MEM → BYP is also 22 ns). [[lw]] is fetched in cycles 100 and 107, so an iteration takes **7 cycles**: $7 \cdot 22 = 154$ ns.`,
  };
})(typeof window !== "undefined" ? window : globalThis);
