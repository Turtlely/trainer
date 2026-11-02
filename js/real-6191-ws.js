// Transcribed text and redrawn figures for the 6.191 Fall 2026 lecture worksheets (L7-L15).
// Keys match the "img" keys in problems-6191-real.js. Worksheet problems are self-checked.
// A draft of this text came from the worksheet solution PDFs (code font = code, red = answers),
// then each problem was checked against the original pages.
(function (root) {
  const t = String.raw;
  const R = (root.REAL_6191 = root.REAL_6191 || {});
  const { t: tx, w, box, graph, svg, def, dot, line, mux, pipe, fsm, gate, fields } = root.Fig;

  // ================================================================ L7

  def("l07-lock", svg(590, 150, fsm({
    S0: [70, 75, "S0", "U=0"], S1: [180, 75, "S1", "U=0"], S2: [290, 75, "S2", "U=0"], S3: [400, 75, "S3", "U=0"], S4: [510, 75, "S4", "U=1"],
  }, [
    ["S0", "S0", "1", { loop: "left" }], ["S0", "S1", "0"], ["S1", "S1", "0", { loop: "bottom" }], ["S1", "S2", "1"],
    ["S2", "S1", "0", { bend: 22 }], ["S2", "S3", "1"], ["S3", "S4", "0"], ["S3", "S0", "1", { bend: 60 }],
    ["S4", "S1", "0", { bend: -62 }], ["S4", "S2", "1", { bend: -30 }],
  ])));

  R["l07-p1"] = {
    statement: t`Implement the combination lock finite-state machine (FSM) from Lecture 6 as a Minispec module. The lock FSM should unlock only when the last four input bits have been 0110. The diagram below shows the FSM's state-transition diagram.

@fig l07-lock

**(A)** Implement this state-transition diagram by filling in the code skeleton below. Use the State enum to ensure state values can only be S0-S4.

~~~
typedef enum { S0, S1, S2, S3, S4 } State;

module Lock;
    Reg#(State) state(S0);

    input Bit#(1) in;

    rule tick;
        state <= case (state)
            S0: __________________;
            S1: __________________;
            S2: __________________;
            S3: __________________;
            S4: __________________;
        endcase;
    endrule

    method Bool unlock = _____________;
endmodule
~~~

**(B)** How many flip-flops does this lock FSM require to encode all possible states?

**(C)** Consider an alternative implementation of the Lock module that stores the last four input bits. Fill in the skeleton code below to complete this implementation.

~~~
module Lock;
    Reg#(Bit#(4)) lastFourBits(4'b1111);

    input Bit#(1) in;

    rule tick;
        lastFourBits <= _______________________;
    endrule

    method Bool unlock = ________________________;
endmodule
~~~`,
    solution: t`**(A)**

~~~
typedef enum { S0, S1, S2, S3, S4 } State;

module Lock;
    Reg#(State) state(S0);

    input Bit#(1) in;

    rule tick;
        state <= case (state)
            S0: (in == 0)? S1 : S0;
            S1: (in == 0)? S1 : S2;
            S2: (in == 0)? S1 : S3;
            S3: (in == 0)? S4 : S0;
            S4: (in == 0)? S1 : S2;
        endcase;
    endrule

    method Bool unlock = (state == S4);
endmodule
~~~

We describe our state machine transitions by using a case statement. With 1 input, we see:

| Current state | Next state if in = 0 | Next state if in = 1 |
|---|---|---|
| S0 | S1 | S0 |
| S1 | S1 | S2 |
| S2 | S1 | S3 |
| S3 | S4 | S0 |
| S4 | S1 | S2 |

Our case statement converts this table into code.

**(B)**

5 possible states → 3 bits

5 states mean we have states numbered: 0, 1, 2, 3, 4. We need 3 bits to encode 4 into binary.

**(C)**

~~~
module Lock;
    Reg#(Bit#(4)) lastFourBits(4'b1111);

    input Bit#(1) in;

    rule tick;
        lastFourBits <= {lastFourBits[2:0], in};
    endrule

    method Bool unlock = (lastFourBits == 4'b0110);
endmodule
~~~

We update the registers with the most recent 3 bits ([[lastFourBits[2:0]]]), and then concatenating with the input [[in]].`,
  };

  R["l07-p2"] = {
    statement: t`Below is an implementation of a 4-bit lock, [[Lock4]], that matches against an arbitrary pattern, given as a module argument. Use [[Lock4]] to implement [[Lock8]], a lock module that unlocks with an 8-bit combination.

~~~
module Lock4(Bit#(4) combo);
    // Storing the most significant bit, inverted will ensure
    // that we will not unlock in less than four cycles
    Reg#(Bit#(4)) lastFourBits(signExtend(~combo[3]));

    input Bit#(1) in;

    rule tick;
        lastFourBits <= {lastFourBits[2:0], in};
    endrule

    method Bool unlock = (lastFourBits == combo);
endmodule
~~~

The worksheet gives this skeleton twice, for two different solutions:

~~~
module Lock8(Bit#(8) combo);
    Lock4 upper(__________);
    Lock4 lower(__________);
    ________________________;

    input Bit#(1) in;

    rule tick;
        ________________________
        ________________________
        ________________________
    endrule

    method Bool unlock = ________________________;
endmodule
~~~`,
    solution: t`**Variant 1: run upper 4 cycles behind.**

~~~
module Lock8(Bit#(8) combo);
    Lock4 upper(combo[7:4]);
    Lock4 lower(combo[3:0]);
    Reg#(Bit#(4)) lastFourBits(signExtend(~combo[7]));

    input Bit#(1) in;

    rule tick;
        lower.in = in;
        upper.in = lastFourBits[3];
        lastFourBits <= {lastFourBits[2:0], in};
    endrule

    method Bool unlock = upper.unlock && lower.unlock;
endmodule
~~~

For the first variant, we want upper to be taking in bits 4 cycles behind lower. Thus, we always feed in the current input bit to lower. However, we also append the input to the register [[lastFourBits]]. This register represents the stored input to upper. Thus, if lower is receiving input in on cycle N, upper will only receive that input when it is the most significant bit of [[lastFourBits]]. This will be 4 cycles from now. We only want to return when both are "unlocked", i.e., the combo is satisfied.

**Variant 2: run upper and lower in lockstep, remember upper's decisions.**

~~~
module Lock8(Bit#(8) combo);
    Lock4 upper(combo[7:4]);
    Lock4 lower(combo[3:0]);
    Reg#(Bit#(4)) lastUpperUnlocks(0);

    input Bit#(1) in;

    rule tick;
        lower.in = in;
        upper.in = in;
        lastUpperUnlocks <= {lastUpperUnlocks[2:0], upper.unlock? 1: 0};
    endrule

    method Bool unlock = (lastUpperUnlocks[3] == 1) && lower.unlock;
endmodule
~~~

In variant 2, we are feeding the input to both upper and lower at the same time. However, we want to keep track of whether or not upper had unlocked 4 cycles earlier. If it had and lower has unlocked this cycle, it means we can return true. We keep track of this using the register [[lastUpperUnlocks]]. Because we are shifting it to the left each iteration, if [[lastUpperUnlocks[i]==1]], that means that upper unlocked i+1 iterations ago (it's zero indexed). Thus, [[lastUpperUnlocks[3]==1]] means that upper unlocked 4 cycles ago.`,
  };

  R["l07-p3"] = {
    statement: t`**(A)** Composing two 4-bit Lock modules to make an 8-bit Lock module is kludgy. Instead, we can make a parametric module, [[Lock#(n)]], that unlocks on an n-bit combination sequence (given as a module argument). Implement [[Lock#(n)]] by filling out the code skeleton below.

~~~
module Lock#(Integer n)(_____________);

    Reg#(_______) lastBits(_______________________);

    input Bit#(1) in;

    rule tick;
        ________________________
    endrule

    method Bool unlock = ___________________;
endmodule
~~~

**(B)** Test your [[Lock#(n)]] module by completing the testbench module below, called [[LockTest]]. Ideally, your testbench should test all possible 8-bit input sequences; at a minimum, it should check a few incorrect sequences as well as the correct sequence. Your testbench should print PASS if all tests are correct, and FAIL otherwise. You can add additional registers or submodules, though they aren't needed.

~~~
module LockTest;
    Bit#(8) combo = 8'b01100111;
    Lock#(8) lock(combo);
    Reg#(Bit#(16)) cycle(0);

    rule test;
        // Feed the lock all the possible input patterns
        // An easy way to do this is by giving it all possible
        // 8-bit sequences one after the other; this will have
        // many duplicate patterns, but covers the whole space
        ________________________
        ________________________
        ________________________

        // Check whether output matches what we expect.
        // We derive the last few bits from cycle,
        // but you could keep them in a register
        ________________________
        ________________________
        ________________________
        ________________________
        ________________________
        ________________________

        // We pass once we've tested all the patterns
        ________________________
        ________________________

        cycle <= cycle + 1;
    endrule
endmodule
~~~`,
    solution: t`**(A)**

~~~
module Lock#(Integer n)(Bit#(n) combo);

    Reg#(Bit#(n)) lastBits(signExtend(~combo[n-1]));

    input Bit#(1) in;

    rule tick;
        lastBits <= {lastBits[n-2:0], in};
    endrule

    method Bool unlock = (lastBits == combo);
endmodule
~~~

We can simply keep track of the last n elements and unlock if the last n elements match the combo specified. We initialize [[lastBits]] to [[signExtend(~combo[n-1])]] to prevent the lock from unlocking in less than n cycles. This is because [[signExtend(~combo[n-1])]] does not have the MSB of the combo, so the user has to enter the correct MSB and that input bit has to be moved to the MSB position of [[lastBits]] over n cycles before the possibility of unlocking.

**(B)**

~~~
module LockTest;
    Bit#(8) combo = 8'b01100111;
    Lock#(8) lock(combo);
    Reg#(Bit#(16)) cycle(0);

    rule test;
        // Feed the lock all the possible input patterns
        // An easy way to do this is by giving it all possible
        // 8-bit sequences one after the other; this will have
        // many duplicate patterns, but covers the whole space
        Bit#(8) curPattern = cycle[10:3];
        Bit#(3) curIdx = cycle[2:0];
        lock.in = curPattern[7 - curIdx];

        // Check whether output matches what we expect.
        // We derive the last few bits from cycle,
        // but you could keep them in a register
        Bit#(16) inputWindow = {curPattern-1, curPattern};
        Bit#(4) winIdx = {0, curIdx};
        Bit#(8) lastBits = inputWindow[15-winIdx:8-winIdx];

        if (lastBits == combo && !lock.unlock) begin
            $display("FAIL: lock didn't unlock with correct combo");
            $finish;
        end
~~~

if (lastBits != combo && lock.unlock) begin

~~~
            $display("FAIL: unlocked with wrong combo %b", lastBits);
            $finish;
        end

        // We pass once we've tested all the patterns
        if (cycle == 1<<12) begin
            $display("PASS after testing %d patterns", cycle-1);
            $finish;
        end

        cycle <= cycle + 1;
    endrule
endmodule
~~~

Running [[%%sim LockTest]] prints:

~~~
PASS after testing 4095 patterns
~~~

We would like to iterate from 0 to 2**8 and check that the module behaves properly for each value of combo in this range. Thus, we must keep track of our current value of combo. This is done in cycle. In addition to our current value of combo, we must keep track of which bit of this combo we are currently feeding in, as it takes 8 cycles to feed in one combo. The index of the current value of combo is specified in the 3 least significant bits of cycle. The value of combo is specified in bits 10:3 of cycle. The register cycle is incremented by 1 every iteration, so the index is increased by 1 until it is equal to 7. Then index is set to 0, and the value of combo is increased by 1, representing a test for a new combination.

For each cycle, we would like to check if the past 8 bits we have fed in were equal to combo or not. This can tell us whether or not we want to unlock. The current combo is represented by curPattern. The previous combo is represented by curPattern - 1. We also know that index of the current combo is curIdx, or winIdx when expressed in 4 bits. Thus, we can index {curPattern-1, curPattern} as specified above to get the last 8 bits fed in.`,
  };

  // Register with an enable input E on the left and a clock mark on the bottom.

  // Register with an enable input E on the left and a clock mark on the bottom.
  const regE = (x, y, label) => box(x, y, 70, 44, "", { r: 2 }) + tx(x + 10, y + 18, "E", { s: 11 })
    + tx(x + 44, y + 22, label, { s: 15 }) + line(`${x + 24},${y + 44} ${x + 30},${y + 37} ${x + 36},${y + 44}`);
  const fibParts = [
    regE(150, 110, "I"), regE(290, 110, "Y"), regE(430, 110, "X"),
    box(40, 92, 52, 28, "> 0", { r: 12 }), box(90, 20, 48, 28, "−", { r: 12, s: 16 }), box(443, 30, 44, 26, "+", { r: 12, s: 15 }),
  ];
  def("l07-fib", svg(520, 230, fibParts));
  def("l07-fib-sol", svg(520, 230, fibParts,
    line("185,154 185,190 114,190 114,106"), w("114,106 114,48"), dot(114, 106, 3), w("114,106 92,106"),
    w("138,34 185,34 185,110"),
    line("66,120 66,214 410,214"), w("130,214 130,128 150,128"), w("270,214 270,128 290,128"), w("410,214 410,128 430,128"),
    dot(130, 214, 3), dot(270, 214, 3),
    line("465,154 465,190 505,190 505,10 325,10"), w("325,10 325,110"), dot(505, 43, 3), w("505,43 487,43"),
    line("325,154 325,190 360,190 360,43"), w("360,43 443,43"), w("465,56 465,110")));

  R["l07-p4"] = {
    statement: t`In this problem, we construct a sequential circuit to compute the $N$th Fibonacci number, denoted by $F_N$. The following recurrence relation defines the Fibonacci sequence:

$$F_0 = 0, \quad F_1 = 1, \quad F_N = F_{N-1} + F_{N-2} \quad \forall\, N \ge 2$$

There are two registers **x** and **y** that store the Fibonacci values for two consecutive integers. In addition, a counter register **i** is initialized to N-1 and decremented each cycle. The computation stops when register **i** goes down to 0 and the result ($F_N$) is available in register **x**.

**(A)** What are the initial values for registers **x** and **y**?

**(B)** Derive the next state computation equations for the three registers.

**(C)** Derive the logic for the enable signal that determines when the registers are updated using the next state logic. Note that all three registers are controlled by a single enable signal.

**(D)** Implement the sequential circuit using the next state and enable logic derived above.

@fig l07-fib

Implement the Fibonacci FSM by filling in the code skeleton below.

~~~
// Use 32-bit values
typedef Bit#(32) Word;

module Fibonacci;
    Reg#(Word) x(0);
    Reg#(Word) y(0);
    Reg#(Word) i(0);

    input Maybe#(Word) in default = Invalid;

    rule tick;
        ______________________
            _______
            _______
            ________________________
        ______________________
            ___________
            _______
            ___________
        ______
    endrule

    method Maybe#(Word) result = ________________________;
endmodule
~~~`,
    solution: t`**(A)** The initial values are y = 0, x = 1 respectively.

**(B)**

$$i^{t+1} = i^t - 1, \qquad y^{t+1} = x^t, \qquad x^{t+1} = x^t + y^t$$

**(C)** $i^t > 0$. This ensures that computation stops when counter i becomes 0.

**(D)**

@fig l07-fib-sol

~~~
// Use 32-bit values
typedef Bit#(32) Word;

module Fibonacci;
    Reg#(Word) x(0);
    Reg#(Word) y(0);
    Reg#(Word) i(0);

    input Maybe#(Word) in default = Invalid;

    rule tick;
        if (isValid(in)) begin
            x <= 1;
            y <= 0;
            i <= fromMaybe(?, in) - 1;
        end else if (i > 0) begin
            x <= x + y;
            y <= x;
            i <= i - 1;
        end
    endrule

    method Maybe#(Word) result = (i == 0)? Valid(x) : Invalid;
endmodule
~~~

The next state computation equations are $i^{t+1} = i^t - 1$, $y^{t+1} = x^t$, $x^{t+1} = x^t + y^t$. Note that we update x, y, and i at each clock cycle. We check for a valid input [[in]] to load into i, and the result is found at x when i == 0.`,
  };

  // Factorial datapath. sol labels the blocks, the mux inputs, and the sel formula.
  const fact = (sol) => svg(720, 380,
    tx(14, 238, "in", { a: "start", s: 16, c: "acc" }), w("34,238 63,238"), line("65,215 65,262"),
    line("70,215 70,28 199,28"), w("199,28 199,72"), tx(60, 150, "value", { s: 11, rot: -90 }),
    line("65,262 135,262 135,340"), w("135,340 250,340"), tx(80, 272, "valid", { a: "start", s: 11 }),
    mux(165, 72, 205, 18, { dir: "down", labels: ["0", "1", "2"] }), w("130,81 168,81"), tx(124, 81, "sel", { a: "end", s: 14 }),
    w("267,46 267,72"), w("336,46 336,72"), w("267,90 267,104"), root.Fig.reg(163, 104, 207, 46, "x", { s: 16 }),
    mux(410, 72, 205, 18, { dir: "down", labels: ["0", "1", "2"] }), w("650,81 612,81"), tx(656, 81, "sel", { a: "start", s: 14 }),
    w("444,46 444,72"), w("512,46 512,72"), w("581,46 581,72"), w("512,90 512,104"), root.Fig.reg(408, 104, 207, 46, "f", { s: 16 }),
    sol ? tx(267, 38, "x-1", { s: 13 }) + tx(336, 38, "x", { s: 13 }) + tx(444, 38, "1", { s: 13 }) + tx(512, 38, "f*x", { s: 13 }) + tx(581, 38, "f", { s: 13 }) : "",
    line("266,150 266,188 485,188"), w("266,188 266,205"), w("388,188 388,205"), w("485,188 485,205"), dot(266, 188, 3), dot(388, 188, 3),
    line("512,150 512,176"), w("512,176 512,205"), dot(512, 176, 3), line("512,176 588,176 588,230"), w("588,230 625,230"),
    box(243, 205, 46, 35, sol ? "-1" : "", { r: 2 }), box(365, 205, 46, 35, sol ? ">1" : "", { r: 2 }), box(473, 205, 52, 35, sol ? "*" : "", { r: 2 }),
    w("266,240 266,254"), w("498,240 498,254"), line("388,240 388,290"),
    sol ? tx(266, 266, "x-1", { s: 13 }) + tx(400, 262, "x>1", { s: 13 }) + tx(498, 266, "f*x", { s: 13 }) : "",
    line("345,290 520,290"), w("345,290 345,320"), dot(388, 290, 3),
    root.Fig.gate("not", 520, 280, 44, 22), line("570,291 588,291 588,262"), w("588,262 625,262"),
    line("627,222 627,270"), w("627,247 652,247"), tx(658, 247, "result", { a: "start", s: 16, c: "acc" }),
    tx(606, 222, "value", { s: 10 }), tx(606, 271, "valid", { s: 10 }),
    box(250, 320, 102, 37, "", { r: 2 }), tx(258, 338, "start", { a: "start", s: 12 }), w("352,338 372,338"),
    sol ? tx(378, 338, "sel = start ? 0 :", { a: "start", s: 14 }) + tx(430, 362, "(x>1) ? 1 : 2;", { a: "start", s: 14 }) : "");
  def("l07-fact", fact(false));
  def("l07-fact-sol", fact(true));

  R["l07-p5"] = {
    statement: t`Implement a sequential circuit to compute the factorial of a 16-bit number.

**(A)** Design the circuit as a sequential Minispec module by filling in the skeleton code below. The circuit should start a new factorial computation when a [[Valid]] input is given. Register [[x]] should be initialized to the input argument, and register [[f]] should eventually hold the output. When the computation is finished, the [[result]] method should return a [[Valid]] result; while the computation is ongoing, [[result]] should return [[Invalid]].

You can use the multiplication operator (*). * performs unsigned multiplication of [[Bit#(n)]] inputs. Assume inputs and results are unsigned. Though we have not yet seen how to multiply two numbers, lab 3 includes the design of a multiplier from scratch.

~~~
module Factorial;
    Reg#(Bit#(16)) x(0);
    Reg#(Bit#(16)) f(0);

    input Maybe#(Bit#(16)) in default = Invalid;

    rule factorialStep;
        ______________________
            ______________________
            _______
        ______________________
            ___________
            ___________
        ______
    endrule

    method Maybe#(Bit#(16)) result = ________________________;
endmodule
~~~

**(B)** Manually synthesize your [[Factorial]] module into a sequential circuit with registers and combinational logic blocks (similar to how Lecture 7 does this with GCD). No need to draw the implementation of all basic signals (e.g., you can give formulas, like for the [[sel]] signal in Lecture 7).

@fig l07-fact`,
    solution: t`**(A)**

~~~
module Factorial;
    Reg#(Bit#(16)) x(0);
    Reg#(Bit#(16)) f(0);

    input Maybe#(Bit#(16)) in default = Invalid;

    rule factorialStep;
        if (isValid(in)) begin
            x <= fromMaybe(?, in);
            f <= 1;
        end else if (x > 1) begin
            x <= x - 1;
            f <= f * x;
        end
    endrule

    method Maybe#(Bit#(16)) result = (x <= 1)? Valid(f) : Invalid;
endmodule
~~~

Similarly to Problem 4, we initialize our values with valid input [[in]]. Then, x stores the number of iterations in the factorial computation, and f stores the product.

**(B)**

@fig l07-fact-sol

We use the structure of the GCD circuit as a base. The shaded blocks of x and f are registers (indicated by the clock notch on the side).

For x:

- We start at value in (sel = 0)
- Once valid in, each subsequent clock pulse will select x-1 to multiply.
- Once done, we hold the value of x at x

For f:

- We start at value 1 (sel = 1)
- Once loaded, each subsequent clock pulse will select f*x into f
- Once done, we hold the value of f at f

Using registers:

- We calculate x-1 through subtracting the value out of x
- We check for x <= 1 as ~(x > 1)
- We calculate f*x through multiplying f and x.

Sel:

- A start signal makes sel = 0
- If the factorial is still being computed (x > 1), sel = 1
- When we are done and need to hold value (x <= 1), sel = 2`,
  };

  def("l07-argfeeder", svg(600, 150,
    box(150, 6, 420, 138, "", { r: 2 }), tx(560, 26, "ArgFeeder", { a: "end", s: 16 }),
    root.Fig.reg(160, 14, 44, 22, "x", { s: 11 }), root.Fig.reg(210, 14, 44, 22, "y", { s: 11 }), root.Fig.reg(260, 14, 58, 22, "out", { s: 11 }),
    box(470, 60, 96, 80, "", { r: 2 }), tx(556, 76, "SC", { a: "end", s: 15 }), tx(476, 104, "in", { a: "start", s: 12 }), tx(476, 128, "getResult()", { a: "start", s: 12 }),
    box(258, 86, 76, 34, "tick", { r: 16, s: 14 }),
    tx(110, 102, "Maybe#(Bit#(32))", { a: "end", s: 11 }), w("114,102 150,102"), tx(156, 102, "in_x", { a: "start", s: 12 }),
    tx(110, 128, "Maybe#(Bit#(32))", { a: "end", s: 11 }), w("150,128 114,128"), tx(156, 128, "getResult()", { a: "start", s: 12 }),
    tx(422, 104, "Maybe#(Args)", { a: "end", s: 11 }), w("426,104 470,104"),
    tx(422, 128, "Maybe#(Bit#(32))", { a: "end", s: 11 }), w("470,128 426,128")));

  R["l07-p6"] = {
    statement: t`You join a startup building hardware to mine Dogecoins. In this cryptocurrency, mining coins requires repeatedly evaluating a function with two arguments, [[sc(x, y)]]. [[x]] is given to you, and mining requires trying different values of [[y]] until you find a [[y]] for which [[sc(x, y)]] is below a threshold value. Finding such a [[y]] value yields several Dogecoins as a reward, which you can then exchange for cold hard cash.

Because the [[sc]] function is expensive, it is implemented as a multi-cycle sequential module, called [[SC]]. [[SC]] is given to you. Its implementation is irrelevant, and its interface, shown below, is the usual interface for multi-cycle modules: [[SC]] has a single input, [[in]], and a single method, [[getResult()]]. To start a new computation, the module user sets [[in]] to a [[Valid]] [[Args]] struct containing arguments [[x]] and [[y]]. Some cycles later, [[SC]] produces the result as a [[Valid]] output of its [[getResult()]] method. While [[SC]] is processing an input, the [[getResult()]] method returns [[Invalid]] and [[in]] should stay [[Invalid]].

~~~
module SC;
    input Maybe#(Args) in default = Invalid;

    method Maybe#(Bit#(32)) getResult();
      // unknown implementation
    endmethod

    // unknown rules
endmodule

// input struct to SC
typedef struct {
    Bit#(32) x;
    Bit#(32) y;
} Args;
~~~

You are asked to design the [[ArgFeeder]] module, which accepts an input [[x]], and feeds a sequence of inputs [[(x, 0)]], [[(x, 1)]], [[(x, 2)]], ..., [[(x, y-1)]], [[(x, y)]] to the [[SC]] module. [[ArgFeeder]] keeps feeding values to [[SC]] until [[SC]]'s result is less than [[threshold]] (a parameter to your module). At that point, [[ArgFeeder]] should return the [[y]] such that [[(x, y)]] meets this condition through its [[getResult()]] method. The diagram below sketches the implementation of [[ArgFeeder]]. Like [[SC]], [[ArgFeeder]] follows the usual interface for a multi-cycle module.

@fig l07-argfeeder

Implement the [[ArgFeeder]] module by completing the implementation of the [[getResult()]] method and the [[tick]] rule. The rule considers three cases: (i) a new input is provided to [[ArgFeeder]], (ii) [[SC]] returns a [[Valid]] result, and it is *less* than the threshold value, and (iii) [[SC]] returns a [[Valid]] result, but it is *not less* than the threshold value.

**You may use any Minispec operator, including arithmetic (+, -, *, /). You will not need additional registers to complete this problem. Do not add additional rules, methods, or functions.**

~~~
module ArgFeeder#(Integer threshold);
    SC sc;
    Reg#(Maybe#(Bit#(32))) out(Invalid);
    RegU#(Bit#(32)) x;
    RegU#(Bit#(32)) y;

    input Maybe#(Bit#(32)) in_x default = Invalid;

    method Maybe#(Bit#(32)) getResult();
        // implement the getResult() method
        return __________;
    endmethod

    rule tick;
        if (isValid(in_x)) begin
            // case (i): received a new input; start a new sequence of (x, y) pairs
            sc.in = Valid(Args{x: __________________, y: ______});
            out <= _______;
            x <= __________________;
            y <= ______;
        end else if (isValid(sc.getResult())) begin
            if (fromMaybe(?, sc.getResult()) < threshold) begin
                // case (ii): result satisfies threshold
                out <= __________;
            end else begin
                // case (iii): result does not yet satisfy target
                //   send next (x, y) pair to SC
                sc.in = Valid(Args{x: ______, y: ______});
                y <= ______;
            end
        end
    endrule
endmodule
~~~`,
    solution: t`~~~
module ArgFeeder#(Integer threshold);
    SC sc;
    Reg#(Maybe#(Bit#(32))) out(Invalid);
    RegU#(Bit#(32)) x;
    RegU#(Bit#(32)) y;

    input Maybe#(Bit#(32)) in_x default = Invalid;

    method Maybe#(Bit#(32)) getResult();
        // implement the getResult() method
        return out;
    endmethod

    rule tick;
        if (isValid(in_x)) begin
            // case (i): received a new input; start a new sequence of (x, y) pairs
            sc.in = Valid(Args{x: fromMaybe(?, in_x), y: 0});
            out <= Invalid;
            x <= fromMaybe(?, in_x);
            y <= 1;
        end else if (isValid(sc.getResult())) begin
            if (fromMaybe(?, sc.getResult()) < threshold) begin
                // case (ii): result satisfies threshold
                out <= Valid(y-1);
            end else begin
                // case (iii): result does not yet satisfy target
                //   send next (x, y) pair to SC
                sc.in = Valid(Args{x: x, y: y});
                y <= y + 1;
            end
        end
    endrule
endmodule
~~~

If we receive a new input, we want to store x and initialize y. We also want to pass the new input into sc. We set y to equal 1 as y will only equal 1 on the next clock cycle, where it will go into the third branch.

If our result is valid, we want to update our output register. It is y-1 as it is the value of y in the previous cycle that was fed to sc to produce this valid result.

If our result is not valid, we simply query sc again. We increment y for the next cycle.`,
  };

  R["l07-p7"] = {
    statement: t`The incomplete Minispec module, [[FindLongestBitRun]], below counts the length of the longest string of 1's in a 32-bit word. The algorithm works by repeatedly performing a bitwise AND of the word with a version of itself that has been left-shifted by one. This repeats until the word is 0. The number of iterations required is the longest string of 1's in the word. This works because each iteration converts the last 1 in any string of 1's into a 0. The word will not equal zero until its longest string of 1's has all been converted into 0's.

The circuit should start a new computation when a [[Valid]]  input is given and [[bitString]]  is 0. The [[bitString]]  register should be initialized to the input argument, and register [[n]]  should hold the output. When the computation is finished, the [[result]]  method should return a [[Valid]]  result; while the computation is ongoing, [[result]]  should return [[Invalid]].

~~~
typedef Bit#(32) Word;

module FindLongestBitRun;
    Reg#(Bool) initialized(False);
    Reg#(Bit#(6)) n(0);
    Reg#(Word) bitString(0);

    input Maybe#(Word) in default = Invalid;

    method Maybe#(Bit#(6)) result;
        return (initialized && bitString == 0) ? _[Part A1]_ : ___[Part A1]__;
    endmethod

    rule tick;
        if (isValid(in) && bitString == 0) begin
            n <= 0;
            bitString <= _____[Part A2]______;
            initialized <= True;
        end else if (initialized && (bitString != 0)) begin
            n <= n + 1;
            bitString <= _________[Part A3]________;
        end
    endrule
endmodule
~~~

**(A)** There are blanks in the code above labeled [Part A#]. Fill in the missing code, by copying each of the lines below and filling in the blanks corresponding to parts A1, A2, and A3.

You may use any Minispec operators, built-in functions, and literals. You will not need additional registers to complete this problem. Do not add other rules, methods, or functions.

~~~
A1: return (initialized && bitString == 0) ? ________: _______;
A2: bitString <= ________________________;
A3: bitString <= ____________________________;
~~~

**(B)** At cycle 0, the input is set to [[Valid(32'b0111)]]. Copy and fill in the table below.

| Cycle | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Input | 0b0111 | Invalid | 0b1111 | Invalid | 0b0001 | Invalid | Invalid |
| result() output | | | | | | | |
| value in register n | | | | | | | |
| value in bitString | | | | | | | |`,
    solution: t`**(A)**

~~~
A1: return (initialized && bitString == 0) ? Valid(n) : Invalid;
A2: bitString <= fromMaybe(?, in);
A3: bitString <= bitString & (bitString << 1);
~~~

**(B)**

| Cycle | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Input | 0b0111 | Invalid | 0b1111 | Invalid | 0b0001 | Invalid | Invalid |
| result() output | Invalid | Invalid | Invalid | Invalid | 3 | Invalid | 1 |
| value in register n | 0 | 0 | 1 | 2 | 3 | 0 | 1 |
| value in bitString | 0 | 0b0111 | 0b0110 | 0b0100 | 0b0000 | 0b0001 | 0b0000 |

For part A, we would like to keep track of the number of zeros seen in the register n. Therefore, when we have received an input (initialized = True) and are done processing the input (bitstring = 0), we can return the result n. When we receive a new input in, we want to store that in the register bitString. Lastly, every iteration we and bitstring with itself left shifted by 1, as the problem specifies.

For part B, all registers take a cycle to update, which is why bitString only registers a value on cycle 1. N is incremented by 1 each cycle until the value of bitString is zero, which causes the program to go into the first if statement and set n to be 0 on the next cycle.

A new input can only be received when bitString is 0, which is on cycle 5. Bitstring gets updated with this input a cycle after.

The value of bitString can be found by looking at the value of bitString on the previous cycle and anding it with itself left shifted by 1.`,
  };

  def("l07-pow2", svg(380, 270, fsm({
    A: [110, 60, "A", "U=0"], B: [300, 60, "B", "U=1"], C: [300, 200, "C", "U=0"], D: [110, 200, "D", "U=?"],
  }, [
    ["A", "A", "0", { loop: "left" }], ["A", "B", "1", { bend: 40 }], ["B", "C", "1"], ["C", "C", "1", { loop: "right" }],
    ["C", "D", "0", { bend: 40 }], ["B", "D", "0", { bend: 8 }], ["D", "B", "?", { bend: 8 }],
  ]), w("86,200 40,200"), tx(32, 200, "?", { s: 12 }), tx(66, 190, "?", { s: 12 }),
  `<circle class="ln" cx="110" cy="60" r="28"/>`));

  R["l07-p8"] = {
    statement: t`Suppose we want to create a system that decides if the concatenation of its **previous** 2 single-bit inputs is a power of 2 (where the MSB is the input from 2 cycles ago and the LSB is from 1 cycle ago). If the previous 2 bits (prior to the current input) are a power-of-two the system outputs a 1, otherwise it outputs 0. Before any input is sent, assume the initial previous 2 bits are 2'b00.

A partial FSM diagram of this circuit is shown below. Before receiving any inputs the FSM is in state A (the state with the double outline).

@fig l07-pow2

**(A)** For this FSM to provide the correct answer, to what existing states must D transition to (A, B, C, or D), and what output does D give (0 or 1)?

- Current State = D, Input = 0, Next State = ______
- Current State = D, Input = 1, Next State = ______
- Current State = D, Output = ______

**(B)** Using the partial FSM, fill out the truth table below.

| State | Input | Next State | Output |
|---|---|---|---|
| A | 0 | A | 0 |
| A | 1 | | |
| B | 0 | D | |
| B | 1 | | |
| C | 0 | D | 0 |
| C | 1 | C | |
| D | 0 | Part A | Part A |
| D | 1 | Part A | |

**(C)** We now want to implement a different version of this is-power-of-2 sequential circuit in minispec. In this version, if the previous 5 bits are a power of 2 the module's [[getOutput]] method will return log2(previous 5 bits), otherwise it will return -1.

To determine is-power-of-2, we will use the following identity for integers $X \ge 0$ and $N > 0$: $X = 0$ or $X = 2^N \Rightarrow X \,\&\, (X-1) = 0$.

The module has 2 registers:

- [[prevBits]]: contains the 5 bits to check for is-power-of-2 in the current cycle.
- [[newOneIndex]]: contains the index of the most recent "1" bit in [[prevBits]]. Hint: how does this relate to log2(prevBits)? (Note: this value is stored as a 4-bit 2's complement value to support initializing it to -1.)

Fill in the minispec implementation of the described module:

~~~
module PowTwo;
    Reg#(Bit#(5)) prevBits(0);
    Reg#(Bit#(4)) newOneIndex(-1);
    input Bit#(1) in;

    rule tick;
        prevBits <= ______________________________;
        if (in == 1) newOneIndex <= ______________________;
        else if (________________) newOneIndex <= _______________;
        else if (________________)
            newOneIndex <= _______________;
    endrule

    method Bit#(4) getOutput();
        // fill in missing code for this method
        ________________________
        ________________________
    endmethod
endmodule
~~~`,
    solution: t`**(A)** Next state for input 0: **A**. Next state for input 1: **B**. Output of D: **1**.

A represents 00, C represents 11, B represents 01, and D represents 10. Therefore, receiving an input of 0 at state D would lead to state 00, and receiving an input of 1 at state D would lead to state 01. If you are currently at D, the previous two bits are a power of 2, leading the output to be 1.

**(B)**

| State | Input | Next State | Output |
|---|---|---|---|
| A | 0 | A | 0 |
| A | 1 | **B** | 0 |
| B | 0 | D | **1** |
| B | 1 | **C** | **1** |
| C | 0 | D | 0 |
| C | 1 | C | 0 |

A represents 00, C represents 11, B represents 01, and D represents 10. Therefore, receiving an input of 1 for A would lead to 01. A is not a power of 2, so the output is 0. Receiving an input of 1 at B would lead to state 11. 01 is a power of 2, so the output at state B is a 1.

**(C)**

~~~
module PowTwo;
    Reg#(Bit#(5)) prevBits(0);
    Reg#(Bit#(4)) newOneIndex(-1);
    input Bit#(1) in;

    rule tick;
        prevBits <= {prevBits[3:0], in};
        if (in == 1) newOneIndex <= 0;
        else if (newOneIndex == 4) newOneIndex <= -1;
        else if (newOneIndex != -1)
            newOneIndex <= newOneIndex + 1;
    endrule

    method Bit#(4) getOutput();
        // fill in missing code for this method
        if ((prevBits & (prevBits - 1)) == 0) return newOneIndex;
        else return -1;
    endmethod
endmodule
~~~

We update [[prevBits]] every cycle as we receive a new bit as input every cycle. Thus, the last 5 bits change. [[newOneIndex]] represents the index of the most recent one. Thus, when we see that [[in]] is equal to 1, we are receiving a new 1 that will become the last bit of our [[prevBits]]. Thus, we initialize [[newOneIndex]] to be 0. Every cycle, we add 1 to [[newOneIndex]]. This is because the 1 gets shifted to the left every time we add a new bit. When [[newOneIndex]] is equal to 4, we know that in the next iteration, there will no longer be a 1 in [[prevBits]]. Thus, we set [[newOneIndex]] equal to -1.

In [[getOutput()]], we only want to return [[newOneIndex]] if the condition above is satisfied. Else, we return -1.`,
  };

  // ================================================================ L8

  const L8P1_N = {
    "@in": [14, 23, ""], a1: [68, 23, "1ns"], a2: [145, 23, "2ns"], a3: [223, 23, "3ns"], a4: [300, 23, "4ns"],
    b4: [145, 90, "4ns"], m2: [300, 90, "2ns"], c2: [235, 160, "2ns"], "@out": [358, 90, ""],
  };
  const L8P1_E = ["@in>a1", "a1>a2", ["a1", "b4", { via: [[105, 23], [105, 90]] }], "a2>a3", "a3>a4", "a4>m2", "b4>m2",
    ["b4", "c2", { via: [[188, 90], [188, 160]] }], ["c2", "m2", { via: [[300, 160]] }], "m2>@out"];
  const l08p1 = (regs = {}) => svg(370, 184, graph(L8P1_N, L8P1_E, { regs, rc: "acc" }));
  def("l08-p1", l08p1());
  def("l08-p1-a", l08p1({ "m2>@out": 1 }));
  def("l08-p1-b", l08p1({ "a3>a4": 1, "b4>m2": [0.1], "m2>@out": 1 }));
  def("l08-p1-c", l08p1({ "a1>a2": [0.3], "a3>a4": 1, "b4>m2": [0.1], "m2>@out": 1 }));
  def("l08-p1-d", l08p1({ "a2>a3": 1, "a3>a4": 1, "a1>b4": [0.4, 0.6], "b4>m2": [0.1], "a4>m2": 1, "m2>@out": 1 }));

  R["l08-p1"] = {
    statement: t`A simple combinational circuit is to be pipelined for **maximum throughput using a minimal number of registers**. For each of the questions below, please create a valid K-stage pipeline. **Show your pipelining contours** and place large black circles (●) on the signal arrows to **indicate the placement of ideal pipeline registers** ($t_{PD} = 0$, $t_{SETUP} = 0$). Give the latency and throughput for each design. Remember that our convention is to place a pipeline register on each output.

@fig l08-p1

**(A)** Show the maximum-throughput 1-stage pipeline. Give the latency (ns) and throughput (ns$^{-1}$).

**(B)** Show the maximum-throughput 2-stage pipeline using a minimal number of registers. Give the latency and throughput.

**(C)** Show the maximum-throughput 3-stage pipeline using a minimal number of registers. Give the latency and throughput.

**(D)** Show the maximum-throughput 4-stage pipeline using a minimal number of registers. Give the latency and throughput.`,
    solution: t`**(A)** Latency: 12 ns. Throughput: 1/12 ns$^{-1}$.

@fig l08-p1-a

As is our convention, there is a pipeline register on the output. The entire circuit is one stage so we don't add any other registers. The longest path is 1 → 2 → 3 → 4 → 2. It has latency 12ns, and the throughput is its reciprocal (1/12).

**(B)** Latency: 2*6 = 12 ns. Throughput: 1/6 ns$^{-1}$.

@fig l08-p1-b

Both stages have latency 6ns, which is the best possible, since the total latency is still at least 12ns. So the clock period is 6ns and the throughput is 1/6ns.

**(C)** Latency: 3*6 = 18 ns. Throughput: 1/6 ns$^{-1}$.

@fig l08-p1-c

There is no way to improve the throughput over the 2-stage pipeline. You can see this by considering the critical path: if you wanted a throughput of more than 1/6, each stage latency would have to be <6ns. But you can only fit the 1ns and 2ns components in the first stage, the 3ns component in the second stage, and then the 4ns component in the third stage, so it's impossible. So our 3-stage pipeline still has throughput 1/6ns. To use a minimal number of registers, we just add one register to our 2-stage pipeline; other answers are possible.

**(D)** Latency: 4*4 = 16 ns. Throughput: 1/4 ns$^{-1}$.

@fig l08-p1-d

The four stages have latency 3ns, 3ns, 4ns, and 4ns.

The latency is the number of stages times the clock period, which equals the maximum latency of one stage, or 4ns here.

The throughput is 1 over the clock period, or 1/4.`,
  };

  // L8 P2 grid circuit. mod: the "3" is a 2-stage pipelined component (1.5 ns per stage).
  const l08p2 = (regs = {}, mod = false) => {
    const N = {
      "@A": [30, 35, "A"], "@B": [30, 140, "B"], "@C": [30, 253, "C"], "@D": [30, 358, "D"], "@Z": [520, 358, "Z"],
      n11: [138, 35, "1"], n21: [138, 140, "2"], n22: [245, 140, "2"], n31: [138, 253, "2"], n32: [245, 253, mod ? "" : "3", mod ? { w: 70 } : {}],
      n33: [347, 253, "2"], n41: [138, 358, "2"], n42: [245, 358, "2"], n43: [347, 358, "2"], n44: [455, 358, "1"],
    };
    const E = ["@A>n11", "@B>n21", "@C>n31", "@D>n41", "n11>n21", ["n11", "n22", { via: [[245, 35]] }], "n21>n22", "n21>n31",
      "n22>n32", ["n22", "n33", { via: [[347, 140]] }], "n31>n32", "n31>n41", "n32>n33", "n32>n42", "n41>n42", "n42>n43", "n33>n43",
      ["n33", "n44", { via: [[455, 253]] }], "n43>n44", "n44>@Z"];
    return svg(540, 390, graph(N, E, { regs, rc: "acc", bw: 46, bh: 46, font: { s: 16 } }), mod ? line("245,230 245,276") + tx(228, 253, "1.5", { s: 14 }) + tx(262, 253, "1.5", { s: 14 }) : "");
  };
  def("l08-p2", l08p2({ "n44>@Z": [0.45] }));
  def("l08-p2-a", l08p2({
    "n11>n22": [0.75], "n21>n22": 1, "n21>n31": 1, "n22>n32": 1, "@C>n31": 1, "n31>n32": 1, "n22>n33": [0.45, 0.75], "n32>n33": 1,
    "n31>n41": 1, "n32>n42": 1, "n33>n43": 1, "n33>n44": [0.7], "@D>n41": [0.35, 0.65], "n41>n42": 1, "n42>n43": 1, "n44>@Z": [0.45],
  }));
  def("l08-p2-b0", l08p2({ "n44>@Z": [0.45] }, true));
  def("l08-p2-b", l08p2({
    "@B>n21": 1, "n11>n21": 1, "n11>n22": [0.4, 0.75], "@C>n31": [0.35, 0.65], "n21>n22": 1, "n21>n31": 1, "n22>n32": 1, "n31>n32": 1,
    "n31>n41": 1, "@D>n41": [0.25, 0.5, 0.75], "n41>n42": [0.35, 0.65], "n22>n33": [0.3, 0.55, 0.8], "n33>n43": 1, "n42>n43": 1,
    "n43>n44": 1, "n33>n44": [0.45, 0.75], "n44>@Z": [0.45],
  }, true));

  R["l08-p2"] = {
    statement: t`The following 1-stage pipelined circuit computes Z from the four inputs A, B, C, and D. Each component is annotated with its propagation delay in ns.

@fig l08-p2

**(A)** Please pipeline the circuit above for maximum throughput with the minimum possible latency using ideal pipeline registers ($t_{PD} = 0$, $t_{SETUP} = 0$). Show the location of pipeline registers in the diagram above using filled-in circles, like the one shown on the Z output. Please give the latency and throughput of the resulting pipelined circuit.

**(B)** Now suppose the "3" component is replaced by a 2-stage pipelined component with a minimum $t_{CLK}$ of 1.5ns. Again, please pipeline the circuit below for maximum throughput with the minimum possible latency using ideal pipeline registers. Show the location of pipeline registers in the diagram below using filled-in circles, like the one shown on the Z output. Please give the latency and throughput of the resulting pipelined circuit.

@fig l08-p2-b0`,
    solution: t`**(A)** Latency: 5*3 = 15 ns. Throughput: 1/3 ns$^{-1}$.

@fig l08-p2-a

Since there's a component with latency 3, and each component must be wholly in one pipeline stage, there will always be a pipeline stage with latency at least 3ns. So the minimum clock period is 3ns and the maximum throughput is 1/3ns. Every pair of connected components with one output connected to another's input must be separated into different pipeline stages if the components' total latency is more than 3, which is almost every pair, only excluding the 2+1 and 1+2 at the start and end. We end up with 5 contours and 5 stages.

**(B)** Latency: 8*2 = 16 ns. Throughput: 1/2 ns$^{-1}$.

@fig l08-p2-b

Now the maximum throughput is 1/2ns, and every pair of connected components with one output connected to another's input must be separated into different pipeline stages. Note that we don't add registers to the new 2-stage pipelined component. We assume it comes with its own internal registers, 2 along every input-output path, for the purpose of ensuring every path goes through the same number of registers. We end up with 8 contours and 8 stages.

Note that the new 2-staged pipeline component (1.5/1.5) has a pipeline register between the two stages in the component and a pipeline register at the output of the component, therefore we do not need to draw a register dot on the parts of the pipeline curves that pass through the component (i.e. the register is implicit there).`,
  };

  const L8P3_N = {
    "@X": [30, 40, "X"], "@Y": [30, 285, "Y"], "@Z": [770, 272, "Z"],
    A: [215, 40, "A\n20ns"], B: [350, 40, "B\n20ns"], C: [485, 40, "C\n30ns"], D: [215, 155, "D\n20ns"], E: [350, 155, "E\n20ns"],
    F: [485, 155, "F\n30ns"], G: [350, 272, "G\n60ns"], H: [485, 272, "H\n30ns"], J: [620, 272, "J\n30ns"],
  };
  const L8P3_E = ["@X>A", "A>B", "A>D", "B>C", "B>E", "C>F", "D>E", ["D", "G", { via: [[215, 262], [300, 262]] }], "E>F", "E>G",
    "F>H", ["F", "J", { via: [[600, 155]] }], ["C", "J", { via: [[640, 40]] }], "G>H", "H>J", "@Y>G", "J>@Z"];
  const l08p3 = (regs = {}) => svg(790, 310, graph(L8P3_N, L8P3_E, { regs, rc: "acc", bw: 66, bh: 44, font: { s: 13 } }));
  def("l08-p3", l08p3());
  def("l08-p3-sol", l08p3({ "B>C": 1, "C>J": [0.3], "E>F": 1, "F>J": [0.4], "E>G": 1, "D>G": [0.7], "@Y>G": [0.75], "G>H": 1, "J>@Z": 1 }));

  R["l08-p3"] = {
    statement: t`An unidentified government agency has a design for a combinational device depicted below:

@fig l08-p3

Although you don't know the function of each of the component modules, they are each combinational and marked with their respective propagation delays. You have been hired to analyze and improve the performance of this device.

**(A)** What are the throughput and latency for the unpipelined combinational device?

**(B)** Show how to pipeline the above circuit for maximum throughput, by marking locations in the diagram where registers are to be inserted. **Use a minimum number of registers, but be sure to include one on the output.** Assume that the registers have 0 $t_{PD}$ and $t_{SETUP}$.

**(C)** What are the latency and throughput of your pipelined circuit?`,
    solution: t`**(A)** Latency: 180 ns. Throughput: 1/180 ns$^{-1}$. The longest path is A → (B or D) → E → G → H → J, for 20+20+20+60+30+30ns.

**(B)**

@fig l08-p3-sol

Since G has the maximum latency of any component, 60ns, the maximum throughput is 1/60ns. It makes sense to draw contours right before and after G, and then in the right places so every stage has latency at most 60ns, and it turns out it works with three stages.

**(C)** Latency: 180 ns. Throughput: 1/60 ns$^{-1}$. Each stage has latency 60ns, so the clock period is 60ns. The pipelined circuit's latency is the number of stages times that, or 180 ns. The throughput is 1 over the clock period.`,
  };

  // F = A + B + 5 with six full adders: top row adds A and B, bottom row adds 101.
  const L8P4_N = {
    T2: [90, 110, "FA"], T1: [280, 110, "FA"], T0: [470, 110, "FA"], U2: [108, 260, "FA"], U1: [298, 260, "FA"], U0: [488, 260, "FA"],
    "@A2": [72, 20, "A₂"], "@B2": [108, 20, "B₂"], "@A1": [262, 20, "A₁"], "@B1": [298, 20, "B₁"], "@A0": [452, 20, "A₀"], "@B0": [488, 20, "B₀"],
    "@c2": [126, 196, "1"], "@c1": [316, 196, "0"], "@c0": [506, 196, "1"], "@z0": [545, 110, "0"], "@z1": [563, 260, "0"],
    "@F2": [108, 352, "F₂"], "@F1": [298, 352, "F₁"], "@F0": [488, 352, "F₀"],
  };
  const inE = (t, x, n) => [t, n, { via: [[x, 76]] }];
  const L8P4_E = [
    inE("@A2", 72, "T2"), inE("@B2", 108, "T2"), inE("@A1", 262, "T1"), inE("@B1", 298, "T1"), inE("@A0", 452, "T0"), inE("@B0", 488, "T0"),
    ["T2", "U2", { via: [[90, 200]] }], ["T1", "U1", { via: [[280, 200]] }], ["T0", "U0", { via: [[470, 200]] }],
    ["@c2", "U2", { via: [[126, 212]] }], ["@c1", "U1", { via: [[316, 212]] }], ["@c0", "U0", { via: [[506, 212]] }],
    "@z0>T0", "T0>T1", "T1>T2", "@z1>U0", "U0>U1", "U1>U2", "U2>@F2", "U1>@F1", "U0>@F0",
  ];
  const l08p4 = (regs = {}) => svg(590, 372, graph(L8P4_N, L8P4_E, { regs, rc: "acc", bw: 70, bh: 70, font: { s: 18 } }));
  def("l08-p4", l08p4());
  def("l08-p4-sol", l08p4({
    "@A2>T2": [0.35, 0.65], "@B2>T2": [0.35, 0.65], "@A1>T1": 1, "@B1>T1": 1, "T0>T1": 1, "T1>T2": 1, "T0>U0": [0.4], "T1>U1": [0.4],
    "T2>U2": [0.4], "U0>U1": 1, "U1>U2": 1, "U0>@F0": [0.25, 0.5, 0.75], "U1>@F1": [0.35, 0.65], "U2>@F2": 1,
  }));

  R["l08-p4"] = {
    statement: t`The following circuit uses six full adder modules (as you've seen in lecture and lab) arranged in a combinational circuit that computes a 3-bit value **F = A + B + 5** for 3-bit inputs **A** and **B**:

@fig l08-p4

The full adders have a $t_{PD}$ of 6ns.

**(A)** Give the latency and throughput of the combinational circuit.

**(B)** Indicate, on the above diagram, appropriate locations to place ideal (zero-delay) registers to pipeline the circuit for *maximum throughput* using a *minimum number of registers*. Be sure to include a register on each output.

**(C)** Give the latency and throughput of your pipelined circuit.`,
    solution: t`**(A)** Latency: 24 ns. Throughput: 1/24 ns$^{-1}$. The longest paths go from A0 or B0 through 4 full adders to F2, so the latency is 4 * the full adders' propagation delay.

**(B)**

@fig l08-p4-sol

As shown, we ensure no two connected full adders are in the same stage, and also that every input-output path goes through every contour.

**(C)** Latency: 24 ns. Throughput: 1/6 ns$^{-1}$. Clock cycle is 6ns.`,
  };

  // L8 P5: 3x3 grid; the arrows from the bottom row into the middle row point up (bold in the original).
  const L8P5_N = {
    "@X": [22, 100, "X"], "@Y": [199, 18, "Y"], "@Out": [380, 192, "Out", { w: 30 }],
    a7: [107, 100, "7"], a2: [199, 100, "2"], a3: [293, 100, "3"], b1: [107, 192, "1"], b2: [199, 192, "2"], b6: [293, 192, "6"],
    c3: [107, 285, "3"], c3b: [199, 285, "3"], c1: [293, 285, "1"],
  };
  const L8P5_E = ["@X>a7", "a7>a2", "@Y>a2", "a2>a3", "a7>b1", "a2>b2", "a3>b6", "b1>b2", "b2>b6", "b6>@Out", "b1>c3", "c3>c3b",
    ["c3b", "b2", { c: "acc" }], "c3b>c1", ["c1", "b6", { c: "acc" }]];
  const l08p5 = (regs = {}) => svg(400, 310, graph(L8P5_N, L8P5_E, { regs, rc: "acc", bw: 36, bh: 36, font: { s: 15 } }));
  def("l08-p5", l08p5());
  def("l08-p5-b", l08p5({ "@Y>a2": 1, "a7>a2": 1, "a2>a3": 1, "a7>b1": 1, "a2>b2": 1, "b1>b2": 1, "c3b>b2": 1, "c3b>c1": 1, "b6>@Out": 1 }));
  def("l08-p5-c", l08p5({
    "@Y>a2": 1, "a7>a2": 1, "a2>a3": 1, "a7>b1": 1, "a2>b2": 1, "b1>b2": 1, "a3>b6": 1, "b2>b6": 1, "c3>c3b": 1, "c3b>c1": 1, "b6>@Out": 1,
  }));

  R["l08-p5"] = {
    statement: t`**(A)** You are provided with the circuit shown below. Each box represents some combinational logic. The number in each box is the $t_{PD}$ of that combinational logic. The circuit has two inputs, X and Y, and one output Out. Pay close attention to the direction of the arrows, especially the two arrows shown in orange (bold in the original), which point **up**. What is the latency and throughput of this combinational circuit?

@fig l08-p5

**(B)** Draw contours through the circuit above to produce a valid pipelined circuit **whose $t_{CLK}$ = 9ns with minimum latency**. Please use a large dot to **indicate the location of each pipeline register**. Assume that you have ideal pipeline registers ($t_{PD} = t_{CD} = t_{SETUP} = t_{HOLD} = 0$ ns). Pay close attention to the direction of each arrow to ensure that you produce a valid pipeline. What is the latency and throughput of this pipelined circuit?

**(C)** You are now asked to consider the performance of this circuit using different clock periods while achieving the minimum latency. For each suggested $t_{CLK}$, specify whether or not you can create a **valid** pipelined circuit using that clock period. If you can, then provide the latency and throughput of the resulting circuit and specify the number of registers at each input. If it results in an invalid pipeline, enter NA for the rest of the row.

| $t_{CLK}$ | Valid/Invalid | Latency (ns) | Throughput (1/ns) | Pipeline registers at input X | Pipeline registers at input Y |
|---|---|---|---|---|---|
| 6 ns | | | | | |
| 7 ns | | | | | |`,
    solution: t`**(A)** Latency: 22 ns. Throughput: 1/22 ns$^{-1}$. Longest path is 7 → 1 → 3 → 3 → 2 → 6.

**(B)** Latency: 27 ns. Throughput: 1/9 ns$^{-1}$. 3 pipeline stages.

@fig l08-p5-b

**(C)**

| $t_{CLK}$ | Valid/Invalid | Latency (ns) | Throughput (1/ns) | Pipeline registers at input X | Pipeline registers at input Y |
|---|---|---|---|---|---|
| 6 ns | Invalid | NA | NA | NA | NA |
| 7 ns | Valid | 28 | 1/7 | 0 | 1 or 2 |

With one component of latency 7ns, a clock period of 6ns is not possible. There are several possible solutions for a clock period of 7ns. One solution, with 1 register on Y:

@fig l08-p5-c`,
  };

  R["l08-p6"] = {
    statement: t`A complex combinational circuit is constructed entirely from 2-input NAND gates having a propagation delay of 1 ns. If this circuit is pipelined for maximal throughput by adding (non-ideal) registers whose setup time and propagation delay are each 1 ns, what is the throughput of the resulting pipeline? Enter a number, a formula, or "CAN'T TELL".`,
    solution: t`Throughput: 1/3 ns$^{-1}$.

$t_{CLK} \ge t_{PD,R} + t_{PD,NAND} + t_{SETUP,R} = 1 + 1 + 1 = 3$ ns.`,
  };

  // L8 P7: F(X,Y) and G(X,Y). mod: the 7 is a 2-stage pipelined component (4 ns per stage).
  const l08p7 = (regs = {}, mod = false) => {
    const N = {
      "@X": [20, 90, "X"], "@Y": [20, 190, "Y"], "@F": [430, 90, "F(X,Y)", { w: 60 }], "@G": [430, 190, "G(X,Y)", { w: 60 }],
      x4: [80, 90, "4"], y3: [80, 190, "3"], t5: [175, 40, "5"], m3: [175, 140, "3"], b5: [175, 240, "5"],
      t3: [265, 40, "3"], m7: [265, 140, mod ? "4 · 4" : "7", mod ? { w: 54 } : {}], b4: [265, 240, "4"], f4: [355, 90, "4"], g3: [355, 190, "3"],
    };
    const E = ["@X>x4", "@Y>y3", "x4>t5", "x4>m3", "y3>m3", "y3>b5", "t5>t3", "m3>m7", "b5>b4", "t3>f4", "m7>f4", "m7>g3", "b4>g3", "f4>@F", "g3>@G"];
    return svg(470, 270, graph(N, E, { regs, rc: "acc", bw: 38, bh: 38, font: { s: 16 } }));
  };
  def("l08-p7", l08p7());
  def("l08-p7-a", l08p7({ "x4>t5": 1, "t5>t3": 1, "m3>m7": 1, "y3>b5": 1, "b5>b4": 1, "m7>f4": 1, "m7>g3": 1, "f4>@F": 1, "g3>@G": 1 }));
  def("l08-p7-b0", l08p7({}, true));
  def("l08-p7-b", l08p7({
    "x4>t5": 1, "x4>m3": 1, "y3>m3": 1, "y3>b5": 1, "t5>t3": 1, "m3>m7": 1, "b5>b4": 1, "t3>f4": [0.35, 0.65], "b4>g3": [0.35, 0.65],
    "f4>@F": 1, "g3>@G": 1,
  }, true));

  R["l08-p7"] = {
    statement: t`The following combinational circuit computes F(X,Y) and G(X,Y) from inputs X and Y. The $t_{PD}$ (in ns) of each individual component is shown inside its box.

@fig l08-p7

**(A)** Using ideal zero-delay registers, mark the location of the minimal number of registers necessary to achieve maximum throughput. Give the latency and throughput of your pipelined circuit.

Rummaging through the stockroom you find a pipelined component with two pipeline stages that can replace the "7" module. The minimum $t_{CLK}$ for the new component is 4ns. The updated circuit is shown below.

@fig l08-p7-b0

**(B)** Using ideal zero-delay registers, mark the location of the minimal number of registers necessary to achieve maximum throughput. Give the latency and throughput of your pipelined circuit.`,
    solution: t`**(A)** Latency: 21 ns. Throughput: 1/7 ns$^{-1}$. The clock period is at least 7ns, the maximum latency of one component. 3 stages work.

@fig l08-p7-a

**(B)** Latency: 25 ns. Throughput: 1/5 ns$^{-1}$. Now the minimum clock period is 5ns and 5 stages work. The new component has its own two registers (between its stages and on its output), so no dots are drawn through it.

@fig l08-p7-b`,
  };

  // ================================================================ L9

  // Adder and register symbols, and the 2-stage adder tree.
  const adder = (x, y) => box(x, y, 50, 56, "", { r: 1 }) + tx(x + 8, y + 12, "A", { s: 11 }) + tx(x + 8, y + 44, "B", { s: 11 })
    + tx(x + 28, y + 28, "+", { s: 16 }) + tx(x + 44, y + 28, "S", { s: 11 });
  const dff = (x, y, name) => box(x, y, 46, 56, "", { r: 1 }) + tx(x + 10, y + 12, "D", { s: 10 }) + tx(x + 36, y + 12, "Q", { s: 10 })
    + line(`${x},${y + 34} ${x + 8},${y + 40} ${x},${y + 46}`) + w(`${x - 30},${y + 40} ${x},${y + 40}`) + tx(x - 34, y + 40, "CLK", { a: "end", s: 9 })
    + (name ? tx(x + 23, y - 8, name, { s: 10 }) : "");
  def("l09-parts", svg(520, 80, tx(0, 12, "32-bit adder:", { a: "start", s: 12 }), adder(30, 20), w("8,32 30,32"), w("8,64 30,64"), w("80,48 120,48"),
    tx(124, 48, "out", { a: "start", s: 11 }), tx(270, 12, "Register:", { a: "start", s: 12 }), dff(340, 20), w("300,32 340,32"), w("386,32 420,32"),
    tx(424, 32, "out", { a: "start", s: 11 })));
  def("l09-add4", svg(560, 220,
    tx(26, 26, "x[0]", { a: "end", s: 11 }), w("30,26 60,26"), tx(26, 62, "x[1]", { a: "end", s: 11 }), w("30,62 60,62"), adder(60, 16),
    tx(26, 152, "x[2]", { a: "end", s: 11 }), w("30,152 60,152"), tx(26, 188, "x[3]", { a: "end", s: 11 }), w("30,188 60,188"), adder(60, 142),
    w("110,44 190,44"), dff(190, 20, "pipeReg1 Elem0"), w("110,170 190,170"), dff(190, 146, "pipeReg1 Elem1"),
    line("236,32 290,32 290,86"), w("290,86 330,86"), line("236,158 290,158 290,124"), w("290,124 330,124"), adder(330, 77),
    w("380,105 450,105"), dff(450, 81, "pipeReg2"), w("496,93 540,93"), tx(544, 93, "out", { a: "start", s: 11 })));

  R["l09-p1"] = {
    statement: t`The following Minispec function implements a combinational circuit that adds four 32-bit numbers:

~~~
typedef Bit#(32) Word;

function Word add4(Vector#(4, Word) x);
    return x[0] + x[1] + x[2] + x[3];
endfunction
~~~

**(A)** Draw the maximum-throughput 2-stage pipeline for this circuit. The components you have available to you are:

@fig l09-parts

**(B)** Implement this 2-stage pipeline as a Minispec module by implementing the rule below. Assume the producer and consumer give and take one input and output every cycle, so no valid bits or stall logic are needed.

~~~
module PipelinedAdd4;
    RegU#(Vector#(2, Word)) pipeReg1;
    RegU#(Word) pipeReg2;
    input Vector#(4, Word) in;
    method Word out = pipeReg2;

    rule tick;
        // First stage
        ___________________
        _____________________
        _____________________
        ______________
        // Second stage
        ________________________
    endrule
endmodule
~~~

**(C)** Complete the skeleton code below to implement a 2-stage pipeline with valid bits (but no stall logic).

~~~
module PipelinedAdd4;
    Reg#(Maybe#(Vector#(2, Word))) pipeReg1(Invalid);
    Reg#(Maybe#(Word)) pipeReg2(Invalid);

    input Maybe#(Vector#(4, Word)) in default = Invalid;
    method Maybe#(Word) out = pipeReg2;

    rule tick;
            // First stage
            ______________________
                ________________________
                ___________________
                ___________________
                ___________________
                _____________________
            ________________________

            // Second stage
            ________________________
                ________________________
                ________________________
            ________________________
    endrule
endmodule
~~~

**(D)** Complete the skeleton code below to implement a 2-stage pipeline with valid bits and stall logic. Your pipeline should make progress if one of the stages has an invalid value.

~~~
module PipelinedAdd4;
    Reg#(Maybe#(Vector#(2, Word))) pipeReg1(Invalid);
    Reg#(Maybe#(Word)) pipeReg2(Invalid);

    input Maybe#(Vector#(4, Word)) in default = Invalid;
    method Maybe#(Word) out = pipeReg2;
    input Bool stallOutput default = False;

    // isFull signal is used by consumer to stall producer
    // consumer will stall producer if consumer can't take inputs
    // and pipeline stages for PipelinedAdd4 are full
    method Bool isFull = ________________________;

    rule tick;
        // Per-stage stall signals
        ________________________
        ________________________

        // First stage
        __________________
            ______________________
                ________________________
                ___________________
                ___________________
                ___________________
                _____________________
            ________________________
        ______
        // Second stage
        __________________
            ________________________
                ________________________
                ________________________
            ________________________
        ______
    endrule
endmodule
~~~`,
    solution: t`**(A)**

@fig l09-add4

**(B)**

~~~
module PipelinedAdd4;
    RegU#(Vector#(2, Word)) pipeReg1;
    RegU#(Word) pipeReg2;
    input Vector#(4, Word) in;
    method Word out = pipeReg2;

    rule tick;
        // First stage
        Vector#(2, Word) v;
        v[0] = in[0] + in[1];
        v[1] = in[2] + in[3];
        pipeReg1 <= v;

        // Second stage
        pipeReg2 <= pipeReg1[0] + pipeReg1[1];
    endrule
endmodule
~~~

We assume that there is a valid input every single cycle and that the consumer accepts an output every cycle. This means that we will never encounter problems with [[in]] or [[pipeReg1]] being [[Invalid]], and we will not need to stall our pipeline from producing outputs. In code, this means that we do not need to have [[if]] statements to check [[isValid(in)]] and [[isValid(pipeReg1)]], and we do not need to create or check stall signals before performing the computations for each stage.

**(C)**

~~~
module PipelinedAdd4;
    Reg#(Maybe#(Vector#(2, Word))) pipeReg1(Invalid);
    Reg#(Maybe#(Word)) pipeReg2(Invalid);

    input Maybe#(Vector#(4, Word)) in default = Invalid;
    method Maybe#(Word) out = pipeReg2;

    rule tick;
            // First stage
            if (isValid(in)) begin
                Vector#(4, Word) x = fromMaybe(?, in);
                Vector#(2, Word) v;
                v[0] = x[0] + x[1];
                v[1] = x[2] + x[3];
                pipeReg1 <= Valid(v);
            end else pipeReg1 <= Invalid;

            // Second stage
            if (isValid(pipeReg1)) begin
                Vector#(2, Word) x = fromMaybe(?, pipeReg1);
                pipeReg2 <= Valid(x[0] + x[1]);
            end else pipeReg2 <= Invalid;
    endrule
endmodule
~~~

We may not have an input [[in]] from the producer every cycle, so we need to check that [[in]] and [[pipeReg1]] are valid before performing the computations for each stage.

**(D)**

~~~
module PipelinedAdd4;
    Reg#(Maybe#(Vector#(2, Word))) pipeReg1(Invalid);
    Reg#(Maybe#(Word)) pipeReg2(Invalid);

    input Maybe#(Vector#(4, Word)) in default = Invalid;
    method Maybe#(Word) out = pipeReg2;
    input Bool stallOutput default = False;

    // isFull signal is used by consumer to stall producer
    // consumer will stall producer if consumer can't take inputs
    // and pipeline stages for PipelinedAdd4 are full
    method Bool isFull = isValid(pipeReg2) && isValid(pipeReg1);

    rule tick;
        // Per-stage stall signals
        Bool stall2 = stallOutput && isValid(pipeReg2);
        Bool stall1 = stall2 && isValid(pipeReg1);

        // First stage
        if (!stall1) begin
            if (isValid(in)) begin
                Vector#(4, Word) x = fromMaybe(?, in);
                Vector#(2, Word) v;
                v[0] = x[0] + x[1];
                v[1] = x[2] + x[3];
                pipeReg1 <= Valid(v);
            end else pipeReg1 <= Invalid;
        end
        // Second stage
        if (!stall2) begin
            if (isValid(pipeReg1)) begin
                Vector#(2, Word) x = fromMaybe(?, pipeReg1);
                pipeReg2 <= Valid(x[0] + x[1]);
            end else pipeReg2 <= Invalid;
        end
    endrule
endmodule
~~~

Deriving [[stall2]]: The second stage stalls if the consumer is not ready to accept an output (i.e. [[stallOutput]] is [[True]]) and [[pipeReg2]] contains a valid sum to output to the consumer. If [[pipeReg2]] is [[Invalid]] when [[stallOutput]] is [[True]], the second stage can still proceed to fill [[pipeReg2]] with a valid sum (so there is no need to stall the second stage in that case).

Deriving [[stall1]]: Similarly, the first stage must stall if the second stage is stalled and [[pipeReg1]] holds a valid partial sum that needs to be passed to the second pipelined stage.`,
  };

  // Adder tree for PipelinedAddN#(8); orange bars are registers.
  const rbar = (x, y) => box(x, y, 10, 46, "", { r: 1, c: "acc" });
  const plus = (x, y) => box(x, y, 50, 50, "+", { s: 20, r: 2 });
  def("l09-addn-parts", svg(360, 64, tx(0, 12, "N-bit adder:", { a: "start", s: 12 }), plus(40, 14), w("10,26 40,26"), w("10,52 40,52"),
    tx(6, 26, "a", { a: "end", s: 11 }), tx(6, 52, "b", { a: "end", s: 11 }), w("90,39 120,39"), tx(124, 39, "sum", { a: "start", s: 11 }),
    tx(220, 12, "Register:", { a: "start", s: 12 }), rbar(290, 6)));
  def("l09-addn8", svg(660, 430, (() => {
    let o = "";
    for (let i = 0; i < 4; i++) {
      const y = 20 + i * 92;
      o += box(46, y - 8, 146, 74, "", { r: 8, dash: true, fill: false, c: "mut" });
      o += tx(40, y + 12, `in[${2 * i}]`, { a: "end", s: 11 }) + w(`44,${y + 12} 70,${y + 12}`) + tx(40, y + 38, `in[${2 * i + 1}]`, { a: "end", s: 11 }) + w(`44,${y + 38} 70,${y + 38}`);
      o += plus(70, y) + line(`120,${y + 25} 150,${y + 25}`) + rbar(150, y + 2);
      const ty = i % 2 ? 210 + (i > 1 ? 184 - 210 + 26 : 0) : 0;
    }
    for (let j = 0; j < 2; j++) {
      const y = 62 + j * 184;
      o += box(42, y - 54, 330, 166, "", { r: 12, dash: true, fill: false });
      o += line(`160,${45 + j * 184} 230,${45 + j * 184} 230,${y + 12}`) + w(`230,${y + 12} 260,${y + 12}`);
      o += line(`160,${137 + j * 184} 230,${137 + j * 184} 230,${y + 38}`) + w(`230,${y + 38} 260,${y + 38}`);
      o += plus(260, y) + line(`310,${y + 25} 340,${y + 25}`) + rbar(340, y + 2);
    }
    o += line("350,87 410,87 410,159") + w("410,159 450,159") + line("350,271 410,271 410,185") + w("410,185 450,185");
    o += plus(450, 147) + line("500,172 530,172") + rbar(530, 149) + w("540,172 590,172") + tx(594, 172, "sum[7:0]", { a: "start", s: 12 });
    o += box(36, 4, 584, 382, "", { r: 20, dash: true, fill: false, c: "ok" });
    o += tx(40, 410, "dashed boxes: grey = PipelinedAddN#(2), white = PipelinedAddN#(4), green = PipelinedAddN#(8)", { a: "start", s: 11 });
    return o;
  })()));

  R["l09-p2"] = {
    statement: t`Complete the skeleton code below to implement a parametric adder.

~~~
module PipelinedAddN#(2);
    Reg#(Maybe#(Word)) result(Invalid);

    input Maybe#(Vector#(2, Word)) in default = Invalid;
    method Maybe#(Word) out = result;

    rule tick;
        if (isValid(in)) begin
             ________________________
             ________________________
        end else begin
             __________________
        end
    endrule
endmodule

module PipelinedAddN#(Integer n);
    Reg#(Maybe#(Word)) result(Invalid);
    PipelinedAddN#(n / 2) low;
    PipelinedAddN#(n / 2) high;

    input Maybe#(Vector#(n, Word))  in default = Invalid;
    method Maybe#(Word) out = result;

    rule tick;
        // Stage 1
        if (___________) begin
             ________________________
             ________________________
        end else begin
             _________________
             __________________
        end

        // Stage 2
        if (________________________) begin
             ________________________
        end else begin
             __________________
        end
    endrule
endmodule
~~~

Manually synthesize [[PipelinedAddN#(8)]]. The components you have available to you are:

@fig l09-addn-parts
`,
    solution: t`~~~
module PipelinedAddN#(2);
    Reg#(Maybe#(Word)) result(Invalid);

    input Maybe#(Vector#(2, Word)) in default = Invalid;
    method Maybe#(Word) out = result;

    rule tick;
        if (isValid(in)) begin
             Vector#(2, Word) x = fromMaybe(?, in);
             result <= Valid(x[0] + x[1]);
        end else begin
             result <= Invalid;
        end
    endrule
endmodule

module PipelinedAddN#(Integer n);
    Reg#(Maybe#(Word)) result(Invalid);
    PipelinedAddN#(n / 2) low;
    PipelinedAddN#(n / 2) high;

    input Maybe#(Vector#(n, Word))  in default = Invalid;
    method Maybe#(Word) out = result;

    rule tick;
        // Stage 1
        if (isValid(in)) begin
             low.in = Valid(take(fromMaybe(?, in)));
             high.in = Valid(takeTail(fromMaybe(?, in)));
        end else begin
             low.in = Invalid;
             high.in = Invalid;
        end

        // Stage 2
        if (isValid(low.out) && isValid(high.out)) begin
             result <= Valid(fromMaybe(?, low.out) + fromMaybe(?, high.out));
        end else begin
             result <= Invalid;
        end
    endrule
endmodule
~~~

The synthesized [[PipelinedAddN#(8)]]:

@fig l09-addn8`,
  };

  def("l09-multifact", svg(690, 400,
    box(4, 4, 680, 390, "", { r: 2, dash: true, fill: false, c: "mut" }), tx(14, 378, "MultiFactorial", { a: "start", s: 13 }),
    mux(120, 30, 22, 50, { labels: ["0", "1"], k: 0.2 }), box(175, 24, 24, 62, "", { r: 2 }), tx(187, 55, "head", { s: 11, rot: 90 }),
    w("142,55 175,55"), line("199,55 250,55 250,12 60,12 60,72"), w("60,42 120,42"), w("60,72 75,72"), box(75, 62, 32, 20, "+1", { s: 11 }), w("107,72 120,72"),
    box(62, 100, 152, 34, "If (dequeue && inFlight > 0)\n? 1 : 0", { s: 10 }), w("131,100 131,76"),
    mux(390, 22, 22, 74, { labels: ["0", "1", "2"], k: 0.15 }), box(440, 20, 24, 78, "", { r: 2 }), tx(452, 59, "inFlight", { s: 11, rot: 90 }),
    w("412,59 440,59"), line("464,59 520,59 520,8 330,8 330,85"), w("330,33 345,33"), box(345, 24, 30, 18, "−1", { s: 11 }), w("375,33 390,33"),
    w("330,59 390,59"), w("330,85 345,85"), box(345, 76, 30, 18, "+1", { s: 11 }), w("375,85 390,85"),
    w("520,59 560,59"), box(560, 48, 50, 22, "==2", { s: 12 }), w("610,59 660,59"), tx(640, 48, "isFull", { s: 12 }),
    box(318, 110, 140, 50, "0: dequeueing\n1: not changing\n2: enqueueing", { s: 10 }), w("401,110 401,92"),
    w("10,250 300,250"), tx(12, 238, "enqueue", { a: "start", s: 12 }), `<polygon class="bx" points="300,232 320,222 320,288 300,278"/>`,
    tx(312, 236, "0", { s: 9 }), tx(312, 274, "1", { s: 9 }),
    w("320,236 380,236"), tx(350, 226, "f0.in", { s: 11 }), box(380, 224, 120, 24, "f0", { s: 12 }), w("500,236 560,236"), tx(530, 226, "f0.result", { s: 11 }),
    w("320,274 380,274"), tx(350, 264, "f1.in", { s: 11 }), box(380, 262, 120, 24, "f1", { s: 12 }), w("500,274 560,274"), tx(530, 290, "f1.result", { s: 11 }),
    mux(560, 222, 20, 66, { labels: ["0", "1"], k: 0.15 }), w("580,255 660,255"), tx(640, 244, "result", { s: 12 }),
    w("570,320 570,286"), tx(570, 330, "head", { s: 12 }), w("310,316 310,284"), tx(310, 326, "tail", { s: 12 }),
    box(240, 336, 170, 40, "If can enqueue, update tail:\ntail = head + inFlight[0]", { s: 10 }),
    w("10,300 80,300"), tx(12, 290, "dequeue", { a: "start", s: 12 })));

  R["l09-p3"] = {
    statement: t`In lecture, we have seen how to increase throughput with pipelining. But we cannot easily pipeline multi-cycle sequential circuits. To increase throughput in this case, we can instead use several multi-cycle circuits in parallel.

Consider the [[Factorial]] module from the L07 worksheet (reproduced below for completeness, although you do not need to understand its internals, only its interface):

~~~
module Factorial;
    Reg#(Bit#(16)) x(0);
    Reg#(Bit#(16)) f(0);

    input Maybe#(Bit#(16)) in default = Invalid;

    rule factorialStep;
        if (isValid(in)) begin
            x <= fromMaybe(?, in);
            f <= 1;
        end else if (x > 1) begin
            x <= x - 1;
            f <= f * x;
        end
    endrule

    method Maybe#(Bit#(16)) result =
        (x <= 1)? Valid(f) : Invalid;
endmodule
~~~

We want to implement a module [[MultiFactorial]] that uses two copies of the [[Factorial]] module to improve throughput. [[MultiFactorial]] has a similar interface to [[Factorial]]: it has a [[Maybe]] input [[enqueue]] that, when set to [[Valid]], starts a new factorial computation, and a [[Maybe]] output [[result]], which is [[Valid]] when there is a new factorial result.

However, [[MultiFactorial]] can perform up to two computations in parallel: the module user can give up to two [[Valid]] inputs (over different cycles), and the module will return their outputs through the [[result]] method, in the same order that the inputs were given.

Under the covers, [[MultiFactorial]] should implement this behavior by alternating computations between its two [[Factorial]] submodules, [[f[0]]] and [[f[1]]].

Since there are multiple computations in flight, the interface of [[MultiFactorial]] is similar to that of a FIFO queue. Specifically:

- The user of [[MultiFactorial]] enqueues a new input by setting the [[enqueue]] input to a [[Valid]] value. [[MultiFactorial]] also includes an [[isFull]] method to signal whether it's ready to accept a new input. If [[isFull]] is [[True]], [[enqueue]] should not be set to a [[Valid]] value, and [[MultiFactorial]] need not process the value at the [[enqueue]] input.

- The user of [[MultiFactorial]] reads a ready output through the [[result]] method, and consumes it by setting the [[dequeue]] input to [[True]]. When [[dequeue]] is set to [[True]], MultiFactorial should advance its output to the next result. [[MultiFactorial]] should produce results in the same order that the inputs were given. [[result]] should return [[Invalid]] if the next result to be consumed is not ready yet, or if there are no ongoing computations.

**(A)** Complete the skeleton code below to implement [[MultiFactorial]].

~~~
module MultiFactorial;
    Vector#(2, Factorial) f;

    Reg#(Bit#(1)) head(0);     // use output of this module
    Reg#(Bit#(2)) inFlight(0); // number of computations
                               // in flight (0, 1, or 2)

    input Maybe#(Bit#(16)) enqueue default = Invalid;
    method Bool isFull = ________________

    input Bool dequeue default = False;
    method Maybe#(Bit#(16)) result =
        ________________________

    rule tick;
        let nextInFlight = inFlight;
        if (dequeue && inFlight > 0) begin
            ______________
            ________________________
        end
        if (isValid(enqueue) && nextInFlight < 2) begin
            ________________________
            _____________________
            ________________________
        end
        inFlight <= ____________;
    endrule
endmodule
~~~

**(B)** Manually synthesize the [[MultiFactorial]] module. Use the [[Factorial]] submodules as black boxes (i.e., connect their inputs and outputs but do not draw their internals).
`,
    solution: t`**(A)**

~~~
module MultiFactorial;
    Vector#(2, Factorial) f;

    Reg#(Bit#(1)) head(0);     // use output of this module
    Reg#(Bit#(2)) inFlight(0); // number of computations
                               // in flight (0, 1, or 2)

    input Maybe#(Bit#(16)) enqueue default = Invalid;
    method Bool isFull = (inFlight == 2);

    input Bool dequeue default = False;
    method Maybe#(Bit#(16)) result =
        (inFlight > 0)? f[head].result : Invalid;

    rule tick;
        let nextInFlight = inFlight;
        if (dequeue && inFlight > 0) begin
            head <= ~head;
            nextInFlight = nextInFlight - 1;
        end
        if (isValid(enqueue) && nextInFlight < 2) begin
            let tail = head ^ inFlight[0];
            f[tail].in = enqueue;
            nextInFlight = nextInFlight + 1;
        end
        inFlight <= nextInFlight;
    endrule
endmodule
~~~

NOTE: This solution accepts a new input even when [[isFull==True]] as long as [[dequeue]] is also set to [[True]] on the same cycle (so both [[Factorial]] submodules can be kept fully utilized). Simpler solutions that do not do this are also correct, e.g., by checking for [[inFlight < 2]] instead of [[nextInFlight < 2]] (and in this case, the rule need not handle dequeues before enqueues). However, they wouldn't work with the skeleton code that was provided.

**(B)**

@fig l09-multifact`,
  };

  R["l09-p4"] = {
    statement: t`Partial Products, Inc., has hired you as its vice president of marketing. Your immediate task is to determine the sale prices of three newly announced multiplier modules. The top-of-the-line Cooker is a pipelined multiplier. The Sizzler is a combinational multiplier. The Grunter is a slower sequential multiplier. Their performance figures are as follows (T is some constant time interval):

| | Throughput | Latency |
|---|---|---|
| Cooker | 1/T | 5T |
| Sizzler | 1/4T | 4T |
| Grunter | 1/32T | 32T |

Customers follow a single principle: Buy the cheapest combination of hardware that meets their performance requirements. These requirements may be specified as a maximum allowable latency, a minimum acceptable throughput, or some combination of these. Customers are willing to try any parallel or pipelined configuration of multipliers in an attempt to achieve the requisite performance.

You may neglect the cost (both financial and as a decrease in performance) of any routing, registers, or other hardware needed to construct a configuration. Concentrate only on the inherent capabilities of the arrangement of multipliers itself.

It has been decided that the Cooker will sell for \$1000. The following questions deal with determining the selling prices of Sizzlers and Grunters.

**(A)** How much can you charge for Sizzlers and still sell any? That is, is there some price for Sizzlers above which any performance demands that could be met by a Sizzler could also be met by some combination of Cookers costing less? If there is no such maximum price, indicate a performance requirement that could be met by a Sizzler but not by any combination of Cookers. If there is a maximum selling price, give the price and explain your reasoning.

**(B)** How little can you charge for Sizzlers and still sell any Cookers? In other words, is there a price for the Sizzler below which every customer would prefer to buy Sizzlers rather than a Cooker? Explain your reasoning.

**(C)** Is there a maximum price for the Grunter above which every customer would prefer to buy Cookers instead? Give the price if it exists, and explain your reasoning.

**(D)** Is there a minimum price for the Grunter below which every customer would prefer to buy Grunters rather than a Cooker? Give the price if it exists, and explain your reasoning.

**(E)** Suppose that, as a customer, you have an application in which 64 pairs of numbers appear all at once, and their 64 products must be generated in as short a time as practicable. You have \$1000 to spend. (1) At what price would you consider using Sizzlers? (2) Given the price in which you selected for (1), at what price would you strictly prefer to use Grunters?`,
    solution: t`**(A)**

If there is a performance requirement for the latency to be < 5T, then there is no combination of Cookers that will meet this performance requirement. So it is in theory possible to sell some Sizzlers at any price. Using multiple Cookers can further improve the overall multiplier throughput, but their latency cannot be shortened.

**(B)**

The price of a Sizzler must be >\$250 if we want to continue to sell Cookers. If the price of a Sizzler is \$250 or lower, 4 Sizzlers could be used in parallel to achieve the same throughput as a Cooker with a better latency in the bargain.

**(C)**

The price for the Grunter must be <\$1000, since for applications that can accept long latencies (>= 32T) or low throughputs, it's worth buying a Grunter if it saves any money at all.

**(D)**

There is no minimum price for a Grunter that would cause every customer to buy Grunters instead of Cookers. The latency of the Grunter will always be 32T, so when performance requirements demand latencies < 32T, Grunters won't do the job.

**(E)**

(1) Sizzlers will be considered when they cost \$250. A single Cooker on its own would have a latency of 68T, so in order to achieve a latency of 68T or less with Sizzlers, we must put 4 Sizzlers in parallel. By doing so, we would have each Sizzler handling 16 of the 64 computations for a total latency of 64T.

(2) If Sizzlers cost \$250, a solution consisting only of Grunters is strictly preferable if they cost \$1000/64 = \$15.62 or less (as 64 Grunters in parallel achieve a 32T latency). If we have 32 Grunters in parallel, then we could handle two products on each Grunter for a total latency of 64T. In order to have a total latency less than 64T, we must ensure that no Grunter performs more than one operation, so we must have 64 Grunters in parallel.`,
  };

  // ================================================================ L10

  R["l10-p1"] = {
    statement: t`Assume a RISC-V processor starts with the following values in the register file (and program counter):

| PC | x0 | x1 | x2 | x3 | x4 | x5 |
|---|---|---|---|---|---|---|
| 0x0100 | 0x0000 | 0x0000 | 0x0000 | 0x0000 | 0x0000 | 0x0000 |

Fill in the state of the register file after each instruction is executed (assume the instruction labelled [[jmplabel]] resides in memory at [[0x0200]]):

| Instruction | PC | x0 | x1 | x2 | x3 | x4 | x5 |
|---|---|---|---|---|---|---|---|
| [[addi x1, x0, 0xAA]] | | | | | | | |
| [[ori x2, x1, 0x01]] | | | | | | | |
| [[srai x3, x2, 0x01]] | | | | | | | |
| [[add x5, x3, x1]] | | | | | | | |
| [[addi x4, x0, 0xFF]] | | | | | | | |
| [[beq x5, x4, jmplabel]] | | | | | | | |
| [[jmplabel: jalr x1, 0x100(x0)]] | | | | | | | |`,
    solution: t`| Instruction | PC | x0 | x1 | x2 | x3 | x4 | x5 |
|---|---|---|---|---|---|---|---|
| [[addi x1, x0, 0xAA]] | 0x0104 | 0x0000 | 0x00AA | 0x0000 | 0x0000 | 0x0000 | 0x0000 |
| [[ori x2, x1, 0x01]] | 0x0108 | 0x0000 | 0x00AA | 0x00AB | 0x0000 | 0x0000 | 0x0000 |
| [[srai x3, x2, 0x01]] | 0x010C | 0x0000 | 0x00AA | 0x00AB | 0x0055 | 0x0000 | 0x0000 |
| [[add x5, x3, x1]] | 0x0110 | 0x0000 | 0x00AA | 0x00AB | 0x0055 | 0x0000 | 0x00FF |
| [[addi x4, x0, 0xFF]] | 0x0114 | 0x0000 | 0x00AA | 0x00AB | 0x0055 | 0x00FF | 0x00FF |
| [[beq x5, x4, jmplabel]] | 0x0200 | 0x0000 | 0x00AA | 0x00AB | 0x0055 | 0x00FF | 0x00FF |
| [[jmplabel: jalr x1, 0x100(x0)]] | 0x0100 | 0x0000 | 0x0204 | 0x00AB | 0x0055 | 0x00FF | 0x00FF |`,
  };

  R["l10-p2"] = {
    statement: t`RISC-V assembly provides a lot of helpful pseudo-instructions, that do not have their own encoding, however, can be written as one or more actual instructions which when executed perform the operation of the pseudo-instruction. For each of these pseudo-instructions, write one or more actual instructions that perform the same function:

(assume [[rX]], [[rY]], and [[rZ]] are any general registers, [[constantN]] is a constant of size N bits, and [[label]] is any general instruction label)

~~~
mv rX, rY
______________
neg rX
______________
call label
_____________
ret
______________
bgt rX, rY, label
_________________
beqz rX, label
_________________
li rX, constant12
_______________________
li rX, constant32
________________________
________________________
~~~`,
    solution: t`~~~
mv rX, rY
add rX, rY, x0
neg rX
sub rX, x0, rX
call label
jal ra, label
ret
jalr x0, 0(ra)
bgt rX, rY, label
blt rY, rX, label
beqz rX, label
beq rX, x0, label
li rX, constant12
addi rX, x0, constant12
li rX, constant32
lui rX, constant32[31:12] + constant32[11]
addi rX, rX, constant32[11:0]
~~~

We add constant32[11] here to offset the sign extension done by addi. If constant32[11] is 1 then constant32[11:0] will be treated as a negative number and will be sign extended by adding many 1's in front of it. This is effectively the same as adding a -1 in the 12th bit position, so can be reversed by adding a 1 back in the 12th bit position.`,
  };

  R["l10-p3"] = {
    statement: t`Consider the following two pieces of C code that do population counting (find the total number of ones in a binary number):

~~~
int popcnt(int y) {
    int s = 0;
    while (y) {
        if (y & 0x1) s++;
        y >>= 1;
    }
    return s;
}
~~~

~~~
int popcnt(int y) {
    int s = 0;
    while (y) {
        if (y & 0x80000000) s++;
        y <<= 1;
    }
    return s;
}
~~~

**(A)** Do both pieces of code perform the correct function? If yes, how? If no, what do we need to change in either piece of code in order to make it work properly? Hint: think about what happens when [[y]] is negative.

**(B)** Translate the first piece of code (after applying fixes, if any) into RISC-V assembly. Note that in RISC-V, by convention, the arguments are passed in the [[ax]] registers and the return value is saved in [[a0]], so the input [[y]] will be in the [[a0]] register and the return value [[s]] should also be saved in the [[a0]] register. Also mention which register each variable is stored in.

Write the assembly for each line of C:

~~~
int s = 0;            ________

while (y) {           _______
                      _____________

if (y & 0x1) s++;     ________________
                      _______________
                      ________________

y >>= 1;              _______
                      ________________
}

return s;             ________
                      ______
                      _________
                      ______
~~~`,
    solution: t`**(A)**

The value [[y]] needs to be an [[unsigned int]] otherwise the right shifts in the first piece of code will be arithmetic, leading to additional 1s shifted into [[y]] and never-ending execution if [[y]] is negative.

**(B)**

~~~
                      // int s = 0;
        li   a1, 0
                      // while (y) {
_start:
        beqz a0, _end
                      // if (y & 0x1) s++;
        andi a2, a0, 0x1
        beqz a2, _shift
        addi a1, a1, 0x1
                      // y >>= 1;
_shift:
        srli a0, a0, 0x1
                      // }
        j    _start
                      // return s;
_end:
        mv   a0, a1
        ret
~~~

y is stored in a0, s is stored in a1, and the intermediate result of y & 0x1 is stored in a2.

Share this Godbolt link (https://godbolt.org/z/P9rdesjqh) and go through it and the differences between handwritten assembly and compiler generated assembly (with -O1, because -O0 makes for unreadable assembly). Main difference is that you can add the result of the and operation directly to the variable [[s]] without having an extra branch. Mention that *BRANCHES BAD*

Another difference is that the compiler prefers to move y out of a0 and accumulate the final result in a0 itself. Probably because having the return result in a0 always means you can return anytime with the ret instruction.

Another optimization made at higher -Ox levels is that the instructions with data dependencies are pushed apart to reduce stalling. See the difference between -O1 and -O3, where add and srli are interchanged. Also some redundant code elimination where li a0, 0 is removed right after a comparison between a0 and 0.

Mention that Godbolt is your best friend when trying to understand compilation from source to assembly. Also that compilers are smart (smarter than us), and can perform all sorts of crazy optimizations, such as recognizing a popcnt when they see one, and replacing the entire thing with a popcnt instruction if it exists on the target.`,
  };

  // Control flow graphs for L10 P4. cfgLoop draws the loop body after the first optimizations.
  const cfgBox = (x, y, wd, label) => box(x, y, wd, 26 + 18 * (label.split("\n").length - 1), label, { s: 12, r: 5 });
  const cfgLoop = (init, c1, c2) => {
    const ih = 26 + 18 * (init.split("\n").length - 1), y1 = 52 + ih + 34, y2 = y1 + 70, y3 = y2 + 66;
    return svg(400, y3 + 110,
      cfgBox(200, 10, 130, "start"), w("265,36 265,52"), cfgBox(200, 52, 130, init), w(`265,${52 + ih} 265,${y1}`),
      cfgBox(200, y1, 130, c1), w(`235,${y1 + 26} 180,${y2}`), tx(198, y2 - 22, "T", { s: 12 }), w(`300,${y1 + 26} 325,${y2}`), tx(324, y2 - 30, "F", { s: 12 }),
      cfgBox(110, y2, 120, "x += 3"), cfgBox(260, y2, 130, c2), w(`325,${y2 + 26} 325,${y3}`), tx(334, y3 - 18, "T", { s: 12 }),
      cfgBox(260, y3, 130, "x -= 3"),
      line(`110,${y2 + 13} 92,${y2 + 13} 92,${y1 - 10} 222,${y1 - 10}`), w(`222,${y1 - 10} 222,${y1}`),
      line(`272,${y2 + 26} 272,${y2 + 44} 76,${y2 + 44} 76,${y1 - 18} 238,${y1 - 18}`), w(`238,${y1 - 18} 238,${y1}`), tx(284, y2 + 36, "F", { s: 12 }),
      line(`325,${y3 + 26} 325,${y3 + 44} 60,${y3 + 44} 60,${y1 - 26} 252,${y1 - 26}`), w(`252,${y1 - 26} 252,${y1}`),
      cfgBox(200, y3 + 76, 130, "end"));
  };
  def("l10-cfg-a", svg(420, 470,
    cfgBox(160, 10, 130, "start"), w("225,36 225,52"), cfgBox(160, 52, 130, "t = 35\nx = 60\ny = 2\nif (true)"),
    w("200,132 140,162"), tx(176, 142, "T", { s: 12 }), cfgBox(70, 162, 130, "if (x < 2*t)"),
    w("100,188 100,218"), tx(90, 202, "T", { s: 12 }), cfgBox(40, 218, 120, "x += 3"),
    w("180,188 270,218"), tx(240, 196, "F", { s: 12 }), cfgBox(210, 218, 130, "if (x > 2*t)"),
    w("300,244 300,290"), tx(310, 268, "T", { s: 12 }), cfgBox(235, 290, 130, "x -= 3"),
    w("100,244 190,350"), w("230,244 205,350"), tx(224, 262, "F", { s: 12 }), w("300,316 230,350"),
    cfgBox(150, 350, 120, "if (true)"),
    line("170,376 170,392 24,392 24,150 120,150"), w("120,150 120,162"), tx(178, 392, "T", { s: 12 }),
    w("215,376 215,420"), tx(225, 396, "F", { s: 12 }), cfgBox(150, 420, 130, "end"),
    line("290,100 400,100 400,410 300,410"), w("300,410 280,428"), tx(298, 92, "F", { s: 12 })));
  def("l10-cfg-b", cfgLoop("t = 35\nx = 60", "if (x < 2*t)", "if (x > 2*t)"));
  def("l10-cfg-c", cfgLoop("t = 35\nx = 60", "if (x < 2*35)", "if (x > 2*35)"));
  def("l10-cfg-d", cfgLoop("t = 35\nx = 60", "if (x < 70)", "if (x > 70)"));
  def("l10-cfg-e", cfgLoop("x = 60", "if (x < 70)", "if (x > 70)"));

  R["l10-p4"] = {
    statement: t`Consider the following C code.

~~~
int t = 35;
int x = 60;
int y = 2;

while (true) {
    if (x < 2*t) {
        x += 3;
    } else if (x > 2*t) {
        x -= 3;
    }
}
~~~

**(A)** Draw the IR (intermediate representation) control flow graph for this code.

**(B)** Perform dead code elimination on the IR control flow graph. Dead code includes all dead stores, unreachable code, and spurious conditionals.

**(C)** Perform constant propagation.

**(D)** Perform constant folding.

**(E)** Perform dead code elimination again.`,
    solution: t`**(A)**

@fig l10-cfg-a

**(B)** The dead store [[y = 2]] is removed, and the spurious conditionals [[if (true)]] are removed. The loop never exits, so [[end]] is unreachable.

@fig l10-cfg-b

**(C)**

@fig l10-cfg-c

**(D)**

@fig l10-cfg-d

**(E)** After constant propagation and folding, [[t = 35]] is a dead store.

@fig l10-cfg-e`,
  };

  R["l10-p5"] = {
    statement: t`Consider the following two ways to implement the factorial function. Compile them to assembly. Assume that we are using the RV32M ISA, which has hardware support for the [[mul rd, rs1, rs2]] instruction.

~~~
int fact1(int n) {
    int r = 1;
    while (n > 1) {
        r *= n;
        n--;
    }
    return r;
}
~~~

~~~
int fact2(int n) {
    if (n == 1) return 1;
    else return n * fact2(n-1);
}
~~~`,
    solution: t`~~~
int fact1(int n) {
    int r = 1;
    while (n > 1) {
        r *= n;
        n--;
    }
    return r;
}
~~~

~~~
fact1:
        mv      a5, a0
        li      a4, 1
        ble     a0, a4, _end
        li      a0, 1
_while:
        mul     a0, a0, a5
        addi    a5, a5, -1
        bne     a5, a4, _while
        ret
_end:
        li      a0, 1
        ret
~~~

a0: r, a5: n, a4: 1 (for comparison)

~~~
int fact2(int n) {
    if (n == 1) return 1;
    else return n * fact2(n-1);
}
~~~

~~~
fact2:
        addi    sp, sp, -8
        sw      ra, 4(sp)
        sw      s0, 0(sp)
        mv      s0, a0
        li      a5, 1
        bne     a0, a5, _else
_end:
        mv      a0, s0
        lw      ra, 4(sp)
        lw      s0, 0(sp)
        addi    sp, sp, 8
        ret
_else:
        addi    a0, a0, -1
        call    fact2
        mul     s0, s0, a0
        j       _end
~~~

The stack saves ra and s0. s0 saves the value of a0 (i.e. n passed in). a5 stores 1 for comparison.

Finally, check https://godbolt.org/z/haEr6Ez47 to see what other optimizations are possible at higher -Ox levels. Main one being that at -O2 and above, the compiler realizes what the recursion is doing and basically emits the same assembly for both.`,
  };

  R["l10-p6"] = {
    statement: t`For the following C functions, does the corresponding RISC-V assembly obey the RISC-V calling conventions? If not, rewrite the function so that it does obey the calling conventions.

For each function, answer yes or no. If no, rewrite the assembly.

**(A)**

~~~
int function_A(int a, int b) {
    some_other_function();
    return a + b;
}

function_A:
    addi sp, sp, -8
    sw a0, 8(sp)
    sw a1, 4(sp)
    sw ra, 0(sp)
    jal some_other_function
    lw a0, 8(sp)
    lw a1, 4(sp)
    add a0, a0, a1
    lw ra, 0(sp)
    addi sp, sp, 8
    ret
~~~

**(B)**

~~~
int function_B(int a, int b) {
    int i = foo((a + b) ^ (a - b));
    ret (i + 1) ^ i;
}

function_B:
    addi sp, sp, -4
    sw ra, 0(sp)
    add t0, a0, a1
    sub a0, a0, a1
    xor a0, t0, a0
    jal foo
    addi t0, a0, 1
    xor a0, t0, a0
    lw ra, 0(sp)
    addi sp, sp, 4
    ret
~~~

**(C)**

~~~
int function_C(int x) {
    foo(1, x);
    bar(2, x);
    baz(3, x);
    return 0;
}

function_C:
    addi sp, sp, -4
    sw ra, 0(sp)
    mv a1, a0
    li a0, 1
    jal foo
    li a0, 2
    jal bar
    li a0, 3
    jal baz
    li a0, 0
    lw ra, 0(sp)
    addi sp, sp, 4
    ret
~~~

**(D)**

~~~
int function_D(int x, int y) {
    int i = foo(1, 2);
    return i + x + y;
}
~~~

~~~
function_D:
    addi sp, sp, -4
    sw ra, 0(sp)
    mv s0, a0
    mv s1, a1
    li a0, 1
    li a1, 2
    jal foo
    add a0, a0, s0
    add a0, a0, s1
    lw ra, 0(sp)
    addi sp, sp, 4
    ret
~~~`,
    solution: t`**(A)** No.

[[addi sp, sp, -8]] only allocates two words on the stack, [[0(sp)]] (i.e. [[sp + 0]]) and [[4(sp)]] (i.e. [[sp + 4]]). Therefore, using the address [[8(sp)]] violates the calling convention because we have not allocated space for a third word. We can fix it just by replacing the [[-8]] with [[-12]], and the [[8]] with [[12]] at the end:

~~~
function_A:
    addi sp, sp, -12
    sw a0, 8(sp)
    sw a1, 4(sp)
    sw ra, 0(sp)
    jal some_other_function
    lw a0, 8(sp)
    lw a1, 4(sp)
    add a0, a0, a1
    lw ra, 0(sp)
    addi sp, sp, 12
    ret
~~~

Everything else is correct. We save [[a0]] and [[a1]] onto the stack and restore them after calling [[some_other_function]], since they are caller saved, and that function is allowed to overwrite them. Then we add them and put the result in [[a0]], where it is returned to the caller.

**(B)** Yes.

Nothing is wrong here. [[addi sp, sp, -4]] allocates the address [[0(sp)]], which we use to store and restore [[ra]], so that it's OK when [[ra]] is overwritten by calling [[foo]]. [[sp]] is also restored to the old value at the end. All used registers [[a0]], [[a1]], [[t0]] are caller-saved registers, so we are allowed to modify them. Since we also don't assume that [[foo]] preserves any of those registers when called, as we only need its return value, which appears in [[a0]]. Thus, we do not need to restore [[a0]], [[a1]], [[t0]] or save them to the stack.

**(C)** No. The code assumes that its argument [[x]] will stay in register [[a1]] as it calls functions [[foo]] and [[bar]], because it needs to pass the same argument to [[bar]] and [[baz]]. However, those functions are allowed to overwrite [[a1]] by calling convention, since [[a1]] is a caller saved register. Instead, we must store [[x]] in the stack and restore it when we need it again. (Note that we only need to store [[x]] once, and we can load it twice; that part of the stack belongs to this function, so neither [[foo]] nor [[bar]] is allowed to modify it. Also, we do not need to restore [[a1]] after returning from [[baz]], because we don't need it anymore and we aren't required to preserve it by calling convention.)

~~~
function_C:
    addi sp, sp, -8
    sw ra, 0(sp)
    mv a1, a0
    sw a1, 4(sp)
    li a0, 1
    jal foo
    lw a1, 4(sp)
    li a0, 2
    jal bar
    lw a1, 4(sp)
    li a0, 3
    jal baz
    li a0, 0
    lw ra, 0(sp)
    addi sp, sp, 8
    ret
~~~

**(D)** No.

If we want to use callee saved registers [[s0]] and [[s1]], we must preserve them for our caller to abide by the calling convention. So we need to allocate additional space on the stack, store the initial values of the saved registers, and restore them before we return. Otherwise, this is a legal and reasonable use of [[s0]] and [[s1]] to store values ([[x]] and [[y]]) that we don't want the call to [[foo]] to overwrite.

~~~
function_D:
    addi sp, sp, -12
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    mv s0, a0
    mv s1, a1
    li a0, 1
    li a1, 2
    jal foo
    add a0, a0, s0
    add a0, a0, s1
    lw ra, 0(sp)
    lw s0, 4(sp)
    lw s1, 8(sp)
    addi sp, sp, 12
    ret
~~~

An alternative would be to forgo the usage of [[s0]] and [[s1]] entirely, and simply store and restore [[a0]] and [[a1]] to/from the stack directly. We can choose any caller-saved registers other than [[a0]] to restore those values to; below we choose [[t0]] and [[t1]].

~~~
function_D:
    addi sp, sp, -12



    sw ra, 0(sp)
    sw a0, 4(sp)
    sw a1, 8(sp)
    li a0, 1
    li a1, 2
    jal foo
    lw t0, 4(sp)
    lw t1, 8(sp)
    add a0, a0, t0
    add a0, a0, t1
    lw ra, 0(sp)
    addi sp, sp, 12
    ret
~~~`,
  };

  R["l10-p7"] = {
    statement: t`Consider the following function in C:

~~~
void do_something(int x) {
f(x);
g(x);
h(x);
}
~~~

**(A)** Write this function in RISC-V assembly using the stack to save and restore the value [[x]] before each function call to [[f]], [[g]], or [[h]].

~~~
_____________
_______________
____________
____________
______
____________
______
____________
______
____________
______________
~~~

**(B)** Write this function in RISC-V assembly using a saved register to restore the value [[x]] before each function call to [[f]], [[g]], or [[h]].

~~~
_____________
_______________
____________
____________
_________
______
_________
______
_________
______
____________
____________
______________
~~~

**(C)** What are the advantages of each approach? Which should a compiler likely choose?`,
    solution: t`**(A)**

~~~
do_something:
    addi sp, sp, -8
    sw ra, 0(sp)
    sw a0, 4(sp)
    call f
    lw a0, 4(sp)
    call g
    lw a0, 4(sp)
    call h
    lw ra, 0(sp)
    addi sp, sp, 8
~~~

**(B)**

~~~
do_something:
    addi sp, sp, -8
    sw ra, 0(sp)
    sw s0, 4(sp)
    mv s0, a0
    call f
    mv a0, s0
    call g
    mv a0, s0
    call h
    lw ra, 0(sp)
    lw s0, 4(sp)
    addi sp, sp, 8
~~~

**(C)**

Approach (A) has fewer instructions. Approach (B) has fewer loads and stores to the stack. Since interactions with memory typically take a long time, the compiler should choose approach B.`,
  };

  R["l10-p8"] = {
    statement: t`Integer arrays [[season1]] and [[season2]] contain points Ben Bitdiddle had scored at each game over two seasons during his time at MIT Intramural Basketball Team. Please write a RISC-V assembly function [[greaterthan20]] which counts the number of games he scored more than 20 points. An equivalent C function and a sample use case are given below. Note that the base addresses for arrays [[season1]] and [[season2]] along with their size are passed down to function [[greaterthan20]].

~~~
int greaterthan20(int a[], int b[], int size) {
    int count = 0;
    for (int i = 0; i < size; ++i) {
        if (a[i] > 20)
            count += 1;
        if (b[i] > 20)
            count += 1;
    }
    return count;
}

int main() {
    int season1[] = {18, 28, 19, 33, 25, 11, 20};
    int season2[] = {30, 12, 13, 33, 37, 19, 22};
    int result = greaterthan20(season1, season2, 7);
}
~~~

~~~
// Beginning of your assembly code
greaterthan20:
    li t0, 0        // t0 <- count
    li t1, 0        // t1 <- index
    li t2, 20
loop:
    ____________________
    ____________________
    ...
~~~`,
    solution: t`We are translating the for loop of the original [[greaterthan20]] code into something more easily translated into assembly code, like a while loop of the form:

~~~
// while i < size:
//     (body of loop goes here)
//     i = i + 1
~~~

~~~
greaterthan20:
    li t0, 0               // t0 <- count
    li t1, 0               // t1 <- index
    li t2, 20
loop:
    ble a2, t1, endloop    // if a2 (= size) <= t1 (= i), jump to endloop
                           // (that is, stop the loop if i < size is false)
    slli t3, t1, 2         // t3 <- 4 × index
checka:
    add t4, a0, t3         // t4 <- a0 (= base of array a) + t3
                           // (a0 + t3 = address of a[i])
    lw t5, 0(t4)           // t5 = value at address t4 = value of a[i]
    ble t5, t2, checkb     // if a[i] <= 20, then skip to checking b[i]
    addi t0, t0, 1         // increment count
checkb:
    add t4, a1, t3         // t4 <- a1 (= base of array b) + t3
                           // (a1 + t3 = address of b[i])
    lw t5, 0(t4)           // t5 = contents of address t4 = value of b[i]
    ble t5, t2, endcompare // if b[i] <= 20, then go to endcompare
    addi t0, t0, 1         // increment count
endcompare:
    addi t1, t1, 1         // increment index i
    j loop                 // restart loop from the condition check
endloop:
    mv a0, t0              // move count to a0, the register for holding the return value
    ret
~~~`,
  };

  // ================================================================ L11

  R["l11-p1"] = {
    statement: t`Decode the following 32-bit RISC-V instructions:

~~~
1. 0100000 00001 00100 000 00011 0110011
2. 0100000 00101 00010 101 00111 0010011
~~~`,
    solution: t`**1.** The fields are [[0100000 | rs2 | rs1 | 000 | rd | 0110011]]: **SUB x3, x4, x1**.

The first step is to check the [[opcode]], or [[inst[6:0]]]. In this case, [[0110011]] tells us that this is an [[OP]] type instruction. Next, [[funct3]], or [[inst[14:12]]], informs us that in particular we have an [[ADD]] or [[SUB]]. Finally, since [[inst[30] = 1]] this is a sub rather than add operation. Now, we can convert the [[rs1]], [[rs2]], and [[rd]] parts into 4, 1, and 3 respectively, giving [[x4]], [[x1]], and [[x3]] as the operand registers.

**2.** The fields are [[0100000 | shamt | rs1 | 101 | rd | 0010011]]: **SRAI x7, x2, 5**.

Again, the [[opcode]] informs us the broad instruction class, this time an [[OPIMM]]. Next, [[funct3]] tells us that we're looking at a right shift, and [[funct7]] reveals that it's an arithmetic one. Note that shift instructions only use the bottom 5 bits of the immediate as the actual shift amount, so from that we get the value 5.`,
  };

  R["l11-p2"] = {
    statement: t`Add a branch if greater-than ([[BGT]]) instruction to the provided RISC-V processor. The instruction encoding should match other branch instructions, but have [[funct3 = 3'b010]].

~~~
Bit#(7) opBranch = 7'b1100011;
______________________

function DecodedInst decode(Bit#(32) inst);
    let opcode = inst[6:0];
    let funct3 = inst[14:12];
    let funct7 = inst[31:25];
    let dst    = inst[11:7];
    let src1   = inst[19:15];
    let src2   = inst[24:20];
    Maybe#(RIndx) validDst = Valid(dst);
    Maybe#(RIndx) dDst = Invalid; // default value
    RIndx dSrc = 5'b0;
    // DEFAULT VALUES - Use the following for your default values:
    // dst: dDst, src1: dSrc, src2: dSrc, imm: immD, BrFunc: Dbr, AluFunc: ?,
    // MemFunc: ?
    // We have provided a default value and done immD for you.
    Word immD = signExtend(1'b0); // default value
    ________________________
    ________________________
    Word immU = 0; // TODO
    Word immI = 0; // TODO
    Word immJ = 0; // TODO
    Word immS = 0; // TODO

    DecodedInst dInst = unpack(0);
    dInst.iType = Unsupported; // unsupported by default
    case (opcode)
        // Lots of omitted code from Lab 4
        ________: // TODO
            case (funct3)
                ________________________
                ________________________
                ________________________
            // Lots of omitted code from Lab 4
    endcase
    return dInst;
endfunction

// Branch function enumeration
typedef enum {Eq, Neq, Lt, Ltu, Ge, Geu, ______, Dbr} BrFunc;

function Bool aluBr(Word a, Word b, BrFunc brFunc);
    Bool res = case (brFunc)
        Eq:     (a == b);
        Neq:    (a != b);
        Lt:     signedLT(a, b);
        Ltu:    (a < b);
        Ge:     signedGE(a, b);
        Geu:    (a >= b);
        _______________________
        default: False;
    endcase;
    return res;
endfunction

________ ________________________
    ________________________
    ________________________
    ______ ____________
___________
~~~`,
    solution: t`~~~
Bit#(7) opBranch = 7'b1100011;
Bit#(3) fnGt = 3'b010;            // <- Required funct3

function DecodedInst decode(Bit#(32) inst);
    ...
    Word immD = signExtend(1'b0); // default value
    // decode branch immediate
    Word immB = signExtend({inst[31], inst[7], inst[30:25], inst[11:8], 1'b0});
    ...
    case (opcode)
        // Lots of omitted code from Lab 4
        opBranch:
            case (funct3)
                // put together all the fields of dInst
                fnGt: dInst = DecodedInst{dst: Invalid, src1: src1,
                        src2: src2, imm: immB, brFunc: Gt, aluFunc: ?,
                        memFunc: ?, iType: BRANCH};
            // Lots of omitted code from Lab 4
    endcase
    return dInst;
endfunction

// Branch function enumeration
typedef enum {Eq, Neq, Lt, Ltu, Ge, Geu, Gt, Dbr} BrFunc;

function Bool aluBr(Word a, Word b, BrFunc brFunc);
    Bool res = case (brFunc)
        Eq:     (a == b);
        Neq:    (a != b);
        Lt:     signedLT(a, b);
        Ltu:    (a < b);
        Ge:     signedGE(a, b);
        Geu:    (a >= b);
        Gt:     signedGT(a, b);   // <- Using a new 'signedGT' function
        default: False;
    endcase;
    return res;
endfunction

function Bool signedGT(Word a, Word b);
    Int#(32) aInt = unpack(a);
    Int#(32) bInt = unpack(b);
    return aInt > bInt;
endfunction
~~~`,
  };

  def("l11-lui-format", root.Fig.fields([["imm[31:12]", 31, 12], ["rd", 11, 7], ["0110111", 6, 0]], { unit: 14 }));
  def("l11-cpu", root.Fig.rvsc({ pc4: true, wd: ["0", "1", "2"] }));
  def("l11-lui-sol", root.Fig.rvsc({ pc4: true, wd: ["0", "1", "2", "3"], wdIn: [, , , "imm"] }));

  R["l11-p3"] = {
    statement: t`The RISC-V [[LUI]] instruction, Load Upper Immediate, loads a 20-bit immediate into the upper 20 bits of the specified destination register (and sets the lower 12 bits to zero). What modifications to the processor datapath are needed to implement the [[LUI]] instruction?

@fig l11-cpu`,
    solution: t`[[LUI rd, immU]]: reg[rd] <= immU << 12

@fig l11-lui-format

Modifications needed:

- Extract 20-bit immediate from instruction [in decode]
- Shift left 12 bits (just add 12 zeros on the right) [in decode]
- Extend final datapath mux (WDSEL) to take new value

@fig l11-lui-sol`,
  };

  def("l11-cmvz", root.Fig.rvsc({ pc4: true, bsel3: true, werfsel: true, wd: ["0", "1", "2", "3"], wdIn: [, , , "Z"],
    sigs: [["WERFSEL"]] }));
  def("l11-cmvz-sol", root.Fig.rvsc({ pc4: true, bsel3: true, werfsel: true, wd: ["0", "1", "2", "3"], wdIn: [, , , "Z = rVal2"],
    yIn: "0", xIn: "branch", sigs: [["WERFSEL"]] }));

  R["l11-p4"] = {
    statement: t`We want to add the following instruction to the RISC-V ISA:

~~~
cmvz rd, rs1, rs2
~~~

This new [[cmvz]] instruction is a conditional move: it checks the contents of source register [[rs1]], and if it's 0, copies the contents of source register [[rs2]] into [[rd]]. In other words:

~~~
if (reg[rs1] == 0) begin
  reg[rd] <= reg[rs2];
end
~~~

We would like to update the hardware diagram of the single-cycle processor to support this new instruction, reusing the existing branch ALU comparison logic to check if [[rs1]] is [[0]]. In the diagram below, we have added extra inputs to the [[BSEL]], [[WDSEL]], and [[WERFSEL]] muxes to support reusing the branch ALU in this way.

Assume that when the decoder decodes [[CMVZ]], it outputs [[BrFunc = Eq]], [[BSEL = 2]], [[WDSEL = 3]], and [[WERFSEL = 2]]. It also outputs [[PCSEL = 0]] so that the next value of [[PC]] will be [[PC + 4]].

@fig l11-cmvz

Summary of some of the relevant processor components in the above diagram:

- One register in the register file can be written to each cycle by providing the register index in [[WA]] and the data to write in [[WD]]. The data is only written if the write enable signal, [[WE]], is 1.
- The ALU receives two inputs, [[A]] and [[B]]. It computes an arithmetic operation on them specified by [[AluFunc]], outputting the 32-bit result to [[aluResult]], and a comparison specified by [[BrFunc]], outputting the 1-bit result to branch.

**(A)** For each of the missing inputs X, Y, and Z, write down either a constant or the name of a different wire or port in the processor hardware diagram that should be connected to each input, so that the processor executes [[CMVZ]] correctly.

**(B)** We would like to check that our processor can still decode and execute the old RISC-V instructions correctly. Suppose the processor is decoding an [[OPIMM]] instruction, such as [[ADDI]]. For each of the select signals we changed, write down the correct signals that the decoder should produce for such an instruction: BSEL, WDSEL, and WERFSEL.`,
    solution: t`**(A)** X: **branch**. Y: **0**. Z: **rVal2**.

@fig l11-cmvz-sol

By setting Y to 0, we make sure that the Branch ALU that is being reused properly compares rs1 to 0. As a result, we can use the 'branch' signal in the mux for WERFSEL to use this result to decide if rd should have its value updated. The value we're supposed to write is rVal2, so that's what Z is set to.

**(B)** BSEL: **1**. WDSEL: **1**. WERFSEL: **1**.

OPIMM instructions operate on the 'immI' immediate, hence BSEL being 1. Additionally, we do want to write the result back to a register, and in particular we're writing the output of the ALU, so WDSEL and WERFSEL are also both 1.`,
  };

  def("l11-mul-format", fields([["0000001", 31, 25], ["rs2", 24, 20], ["rs1", 19, 15], ["000", 14, 12], ["rd", 11, 7], ["0110011", 6, 0]], { unit: 14 }));
  def("l11-mulh-format", fields([["0000001", 31, 25], ["rs2", 24, 20], ["rs1", 19, 15], ["001", 14, 12], ["rd", 11, 7], ["0110011", 6, 0]], { unit: 14 }));

  R["l11-p5"] = {
    statement: t`**(A)** The RISC-V [[MUL]] instruction multiplies two 32-bit values together and places the lower 32 bits of the product in the destination register. It has an [[opcode]] of [[7'b0110011]], which is the same as the other [[OP]] type instructions, and a [[funct7]] of [[7'b0000001]], and a [[funct3]] of [[3'b000]]. What changes to the processor datapath would be needed to support the [[MUL]] instruction? Use the combinational multiplier from Lecture 8.

Write the instruction's semantics and encoding, and fill in the [[execute]] function:

~~~
function ExecInst execute(DecodedInst dInst, Word rVal1, Word rVal2, Word pc);
    let imm = dInst.imm;
    let brFunc = dInst.brFunc;
    let aluFunc = dInst.aluFunc;
    let aluVal2 = dInst.iType == OPIMM ? imm : rVal2;
    ________________________
    Word data = case (dInst.iType)
        // other cases not shown
        OP: case (funct7)
            ________________________
                ______________________
                ___________
                ________
            default: ?;
            endcase;
        default: 0;
    endcase;
~~~

**(B)** The RISC-V [[MULH]] instruction performs the same multiplication in (A), but returns the upper 32 bits of the product in the destination register. It has the same [[opcode]] and [[funct7]] codes, but its [[funct3]] is [[3'b001]]. What modifications to (A) would be needed to support the [[MULH]] instruction? Fill in the same skeleton for [[MULH]].`,
    solution: t`**(A)** [[MUL rd, rs1, rs2]]: reg[rd] <= (reg[rs1] × reg[rs2])[31:0]

@fig l11-mul-format

Modifications needed:

- Add multiplier to ALU [in execute]
- Select lower 32 bits for writeback data

For your information, adding this to the Minispec Execute module would look something like this:

~~~
function ExecInst execute(DecodedInst dInst, Word rVal1, Word rVal2, Word pc);
    let imm = dInst.imm;
    let brFunc = dInst.brFunc;
    let aluFunc = dInst.aluFunc;
    let aluVal2 = dInst.iType == OPIMM ? imm : rVal2;
    Bit#(64) product = multiply_by_adding(rVal1, rVal2);
    Word data = case (dInst.iType)
        // other cases not shown
        OP: case (funct7)
            7'b0000001: case (funct3)
                3'b000: product[31:0];
                default: ?;
                endcase;
            default: ?;
            endcase;
        default: 0;
    endcase;
~~~

**(B)** [[MULH rd, rs1, rs2]]: reg[rd] <= (reg[rs1] × reg[rs2])[63:32]

@fig l11-mulh-format

Modifications needed:

- Same as MUL, except select higher 32 bits for writeback data with multiplexer.
- Add the following to [[case (funct3)]] above: [[3'b001: product[63:32];]]

This has a slightly different implementation in Minispec:

~~~
function ExecInst execute(DecodedInst dInst, Word rVal1, Word rVal2, Word pc);
    let imm = dInst.imm;
    let brFunc = dInst.brFunc;
    let aluFunc = dInst.aluFunc;
    let aluVal2 = dInst.iType == OPIMM ? imm : rVal2;
    Bit#(64) product = multiply_by_adding(rVal1, rVal2);
    Word data = case (dInst.iType)
        // other cases not shown
        OP: case (funct7)
            7'b0000001: case (funct3)
                3'b001: product[63:32];   // <- HERE
                default: ?;
                endcase;
            default: ?;
            endcase;
        default: 0;
    endcase;
~~~`,
  };

  R["l11-p6"] = {
    statement: t`Assume that [[aluBr]] has been replaced with the new branch ALU function, [[newAluBr]], shown below. This new branch ALU is controlled by two control signals: [[newBrFunc]] and [[negate]]. When the result of this function is true, the next PC is going to be computed as [[pc + imm]].

~~~
typedef enum {Eq, Lt, Ltu} NewBrFunc;
function Bool newAluBr(Word a, Word b, NewBrFunc newBrFunc, Bool negate);
    Bool res = case (newBrFunc)
        Eq:     (a == b);
        Lt:     signedLT(a, b);
        Ltu:    (a < b);
    endcase;
    return negate ? !res : res;
endfunction
~~~

**(A)** Fill in the decoding table below to specify what the control signals should be for each [[funct3]]. Write an "X" in the table for entries that don't matter. (Use the ISA reference card from the course website.)

| funct3 | newBrFunc | negate |
|---|---|---|
| 3'b000 | | |
| 3'b001 | | |
| 3'b010 | | |
| 3'b011 | | |
| 3'b100 | | |
| 3'b101 | | |
| 3'b110 | | |
| 3'b111 | | |`,
    solution: t`| funct3 | newBrFunc | negate | Instruction |
|---|---|---|---|
| 3'b000 | Eq | False | BEQ |
| 3'b001 | Eq | True | BNE |
| 3'b010 | X | X | |
| 3'b011 | X | X | |
| 3'b100 | Lt | False | BLT |
| 3'b101 | Lt | True | BGE |
| 3'b110 | Ltu | False | BLTU |
| 3'b111 | Ltu | True | BGEU |`,
  };

  def("l11-andxori-format", root.Fig.fields([["imm[9:3]", 31, 25], ["rs2", 24, 20], ["rs1", 19, 15], ["imm[2:0]", 14, 12], ["rd", 11, 7], ["0110100", 6, 0]], { unit: 15 }));
  const xorParts = (sol) => [
    box(380, 500, 46, 24, "XOR", { s: 11, c: "acc" }), w("403,482 403,500"), tx(398, 474, "immA", { a: "end", s: 12, b: true }),
    dot(510, 512, 2.5), w("510,512 426,512"), w("380,512 344,512"), tx(338, 512, "axRes", { a: "end", s: 12, b: true }),
    sol ? tx(560, 554, "axRes", { a: "start", s: 11, c: "acc" }) : "",
  ];
  def("l11-andxori", root.Fig.rvsc({ pc4: true, bselSwap: true, extra: xorParts(false) }));
  def("l11-andxori-sol", root.Fig.rvsc({ pc4: true, bselSwap: true, wd: ["0", "1", "2", "3"], wdIn: [, , , "axRes"], extra: xorParts(false) }));

  R["l11-p7"] = {
    statement: t`Giuseppe is writing a large RISC-V assembly program, and is tired of getting confused by how to properly maintain the stack pointer sp. He's heard that other ISAs have push and pop instructions, which handle both allocating/freeing the space for a word on the stack, and storing it from/loading it to a register. Giuseppe decides that he'd like to implement them in the RISC-V ISA. Their syntaxes are as follows:

~~~
push rs2
pop rd
~~~

And the following is a Python-like description of how each works:

~~~
push:
    reg[sp] = reg[sp] - 4
    Mem[reg[sp]] = reg[rs2]
pop:
    reg[rd] = Mem[reg[sp]]
    reg[sp] = reg[sp] + 4
~~~

**(A)** (4 points) Giuseppe hopes to be able to simply add some new signals as inputs to the selection muxes in the existing RISC-V processor diagram. For each instruction being added, can this be done with the existing processor components as described in lecture and shown in the diagram below? If not, describe the limitation that prevents it.

- Can push be implemented with existing components?
- Can pop be implemented with existing components?

Giuseppe's friend Jeffrey tells him that the push and pop instructions can cause issues when pipelining his processor later on. Giuseppe, knowing nothing about processor pipelining, decides to take his word for it and find a different solution to his problem.

His goal now is to remove a large amount of the uses of stack, so that he doesn't have as many opportunities to become confused. The main limitation that causes him to use the stack so much is that he's running out of registers to hold temporary values. In order to overcome this, he wants to combine multiple steps into a single instruction. In particular, he wants to combine the [[AND]]ing of two registers and [[XOR]]ing the result with an immediate into a single instruction. All immediates he uses are 10 bits or less, so he comes up with the following instruction syntax, definition, and encoding:

~~~
andxori rd, rs1, rs2, imm
andxori:
    reg[rd] = ((reg[rs1] & reg[rs2]) ^ signExtend(imm))
~~~

@fig l11-andxori-format

**(B)** (2 points) Encode the following instruction as a 32-bit binary word, and give it in hexadecimal:

~~~
andxori x7, x1, x16, 0x1BC
~~~

In the diagram below, Giuseppe has decoded and sign extended the immediate used for the [[andxori]] instruction, labelling this signal [[immA]]. He also added an additional dedicated XOR module used in the instruction's computation. The output of this new XOR module is labelled [[axRes]].

@fig l11-andxori

**(C)** (3 points) For each of the following signals, does the mux being controlled by that signal need an extra input to accommodate the new instruction? If so, indicate the name of the signal that needs to be added as an input to the mux. If not, indicate which existing value of the mux control signal is required to make the instruction work properly.

- BSEL: needs new input? (YES / NO). New input or existing control value: ______
- WDSEL: needs new input? (YES / NO). New input or existing control value: ______

**(D)** (3 points) Decide for each of the following control signals what their values should be when executing the [[andxori]] instruction. If the value of the signal doesn't matter, then put N/A. The possible values for each signal are:

- AluFunc: Add, Sub, And, Or, Xor, Slt, Sltu, Sll, Srl, Sra
- BrFunc: Eq, Neq, Lt, Ltu, Ge, Geu
- WERF: True, False
- MemFunc: Lw, Lh, Lhu, Lb, Lbu, Sw, Sh, Sb
- MemEnable: True, False`,
    solution: t`**(A)** **push: yes.** The rs1 port of the register file can be used to read reg[sp] and the ALU can be used to subtract 4 from it. This value is sent to the Memory as an address and reg[rs2] is sent to the Memory as data.

**pop: no.** The proposed [[pop]] instruction needs to write to two different registers but our register file only has one write port.

**(B)** **0x6F00C3B4.**

**(C)** BSEL: **NO**, use the existing value **0 (rVal2)**. WDSEL: **YES**, add the new input **axRes**.

@fig l11-andxori-sol

**(D)**

| Signal | Value |
|---|---|
| AluFunc | And |
| BrFunc | N/A |
| WERF | True |
| MemFunc, MemEnable | MemFunc N/A with MemEnable False, OR MemFunc in {Lw, Lh, Lhu, Lb, Lbu} with MemEnable N/A |`,
  };

  // ================================================================ L12

  R["l12-p1"] = {
    statement: t`Belly Eyelash is designing a processor and is analyzing the performance of different numbers of cache levels. Without any caches, Belly's main memory has an access time of 140 cycles.

**(A)** As a test, Belly adds a 32 KB Level 1 (L1) cache that has single-cycle reads/writes, and runs a long computation, during which she observes a new AMAT of 10. What is the hit ratio for the Level 1 cache during this test?

**(B)** Next, Belly adds a 256 KB Level 2 (L2) cache between the L1 cache and main memory. The L2 cache takes 4 cycles to decide if a memory access is a hit or a miss. After running the same computation with this new memory hierarchy, Belly observes an improved AMAT of 1.45. Assume that the hit rate for the L1 cache is the same as in (A). What is the hit ratio for the Level 2 cache during this test?

**(C)** Finally, Belly adds a 10 MB Level 3 (L3) cache between the L2 cache and main memory. After running the same test as before, she observes that the main memory was accessed once for every 140 accesses to the L3 cache. If Belly wants to achieve an AMAT of 1.3 for this computation, what is the maximum number of clock cycles that the Level 3 cache can take to decide if a memory access is a hit or a miss? Assume that the L1 and L2 caches can not be changed and they have the same hit rates observed in (A) and (B).`,
    solution: t`**(A)** $\text{AMAT} = 10 = 1 + (1 - \text{HitRatio}) \cdot 140$, so $\text{HitRatio} = 131/140$.

**(B)** $\text{AMAT} = 1.45 = 1 + \frac{9}{140}\left(4 + (1 - \text{HitRatio}) \cdot 140\right)$. Then $0.45 \cdot \frac{140}{9} - 4 = 7 - 4 = (1 - \text{HitRatio}) \cdot 140$, so $\text{HitRatio} = 137/140$.

**(C)** $\text{AMAT} = 1.3 = 1 + \frac{9}{140}\left(4 + \frac{3}{140}\left(\text{HitTime} + \frac{1}{140} \cdot 140\right)\right)$.

$0.3 \cdot 140^2 = 9 \cdot 140 \cdot \left(4 + 3(\text{HitTime} + 1)\right)$, so $\text{HitTime} = (0.3 \cdot 140^2 - 36 \cdot 140)/27 - 1$.

To achieve AMAT ≤ 1.3, **HitTime ≤ 30** cycles.`,
  };

  R["l12-p2"] = {
    statement: t`The RISC-V Engineering Team is working on the design of a cache. They've decided that the cache will have a total of $2^{10} = 1024$ data words, but are still thinking about the other aspects of the cache architecture.

First assume the team chooses to build a direct-mapped cache with a block size of 4 words.

**(A)** Please answer the following questions: the number of lines in the cache, and the number of bits in the tag field for each cache entry.

**(B)** This cache takes 2 clock cycles to determine if a memory access is a hit or a miss and, if it's a hit, return data to the processor. If the access is a miss, the cache takes 20 additional clock cycles to fill the cache line and return the requested word to the processor. If the hit rate is 90%, what is the processor's average memory access time in clock cycles?`,
    solution: t`**(A)** Number of lines: **256**. Tag bits: **20**. (Tag: 20 bits, Index: 8 bits, Offset: 4 bits.)

**(B)** **4 cycles.** HitTime = 2 clock cycles, MissRatio = 1 − HitRatio = 1 − 90%, MissPenalty = 20.

$$\text{AMAT} = 2 + (1 - 0.90) \times 20 = 4$$`,
  };

  R["l12-p3"] = {
    statement: t`**(A)** The timing for a particular cache is as follows: checking the cache takes 1 cycle. If there's a hit the data is returned to the CPU at the end of the first cycle. If there's a miss, it takes 10 additional cycles to retrieve the word from main memory, store it in the cache, and return it to the CPU. If we want an average memory access time of 1.4 cycles, what is the minimum possible value for the cache's hit ratio?

**(B)** If the cache block size, i.e., words/cache line, is doubled but the total number of data words in the cache is unchanged, how will the following cache parameters change? Choose from: UNCHANGED, +1, −1, 2x, 0.5x, CAN'T TELL.

- # of block offset bits
- # of tag bits
- # of cache lines

Consider a direct-mapped cache with 64 total data words with 1 word/cache line.

**(C)** If cache line number 5 is valid and its tag field has the value 0x1234, what is the address in main memory of the data word currently residing in cache line 5?`,
    solution: t`**(A)** **0.96.** $1.4 = 1 + (1 - HR) \cdot 10 \Rightarrow HR = 0.96$.

**(B)** Block offset bits: **+1**. Tag bits: **UNCHANGED**. Cache lines: **0.5x**.

**(C)** **0x123414.** 64 total data words with 1 word/cache line → 64 total cache lines → 64 cache lines in a direct-mapped cache → 6 line index bits. Block size of 1 word → 0 block offset bits. There are 2 byte offset bits (i.e., the last two bits are always 0). The remaining bits are tag bits.

Tag: 24 bits (0x001234), Line index: 6 bits (line 5 = 000101), Byte offset: 2 bits (00).`,
  };

  R["l12-p4"] = {
    statement: t`Consider a direct-mapped cache with 64 total data words with 1 word/cache line.

The program below repeatedly executes an inner loop that sums the 16 elements of an array that is stored starting in location 0x310.

**The program is executed for many iterations**, then a measurement of the cache statistics is made during one iteration through all the code, i.e., starting with the execution of the instruction labeled [[outer_loop:]] until just before the next time that instruction is executed.

~~~
  . = 0               // tell assembler to start at
                      // address 0
outer_loop:
  addi x4, x0, 16     // initialize loop index J
  mv x1, x0           // x1 holds sum, initially 0

loop:                 // add up elements in array
  subi x4, x4, 1      // decrement index
  slli x2, x4, 2      // convert to byte offset
  lw x3, 0x310(x2)    // load value from A[J]
  add x1, x1, x3      // add to sum
  bne x4, x0, loop    // loop until all words are summed

  j outer_loop        // perform test again!
~~~

**(A)** In total, how many instruction fetches occur during one complete iteration of the outer loop? How many data reads?

**(B)** How many instruction fetch misses occur during one complete iteration of the outer loop? How many data read misses? Hint: remember that the array starts at address 0x310.

**(C)** What is the hit ratio measured after one complete iteration of the outer loop?`,
    solution: t`**(A)** Instruction fetches: **83** = 2 + 5·16 + 1 (2 instructions before the inner loop + 5 instructions in the inner loop × 16 iterations + 1 jump instruction). Data reads: **16**.

**(B)** Instruction fetch misses: **4**. Data read misses: **4**.

All data reads and instruction fetches operate on main memory and therefore interact with the cache. The data array starts at address 0x310 (line index = 4). The next array element is at 0x314 (line index = 5). The entire 16-element data array maps to cache lines 4-19.

The instructions start at address 0x0 (denoted by the ". = 0") which maps to line 0. The next instruction (mv x1, x0) starts at address 0x4 (line index = 1). The next instruction (subi) maps to line 2 and so on. The instructions therefore map to cache lines 0-7.

Between the data and instructions there are conflicts in cache lines 4-7. As the inner loop iterates over the entire data array, each one of these lines will, one at a time, evict the instruction with the data and then, on the next iteration, evict the data with the instruction. Thus, each of the conflicting lines will see one instruction miss and one data miss. Note that the assembly code iterates over the array backwards, but this does not change the reasoning.

The conflicting addresses are the data at 0x310, 0x314, 0x318, 0x31C and the instructions at 0x10 (lw), 0x14 (add), 0x18 (bne), 0x1C (j).

**(C)** **91/99.** Total cache hits = (83 instruction fetches − 4 instruction misses) + (16 data reads − 4 data misses) = 91. Total memory operations = 83 + 16 = 99.`,
  };

  R["l12-p5"] = {
    statement: t`Bob is tired of supporting half-word and byte instructions in his cache. He complains that users can achieve the same thing with RISC-V instructions! Translate the following RISC-V half-word or byte load/store instructions to sequences of instructions that do not use half-word or byte load/store instructions.

**(A)** [[lh x2, offset(x1)]]

**(B)** [[sb x2, offset(x1)]]

**(C)** For a sequence of instructions that do not contain any half-word or byte-level stores or loads, is Bob's scheme faster or slower? (Slower / No Change / Faster)

**(D)** For a sequence of instructions with many half-word and byte-level stores and loads, is Bob's scheme faster or slower? (Slower / No Change / Faster)`,
    solution: t`**(A)**

~~~
    addi x4, x1, offset   // Calculate address
    andi x5, x4, 2        // Get half-word offset
    andi x3, x4, ~2       // Calculate base word address
    lw x2, 0x0(x3)        // Load entire word into x2
    beqz x5, else         // Check if equal to 0
    srai x2, 16           // If offset != 0, shift right by 16
    j endif
else:
    slli x2, 16           // If offset = 0, shift left by 16
                          // (to get rid of upper bits)
    srai x2, 16           // Then shift back right by 16
                          // (sign extends appropriately)
endif:
~~~

**(B)**

~~~
    addi x4, x1, offset   // Calculate address
    andi x6, x4, 3        // Get byte offset
    andi x7, x4, ~3       // Calculate base word address
    lw x3, 0x0(x7)        // Load current word
    slli x6, x6, 3        // Multiply byte offset by 8
    li x5, 0xFF           // Load byte of all 1s
    and x2, x2, x5        // And x2 with byte mask
    sll x2, x2, x6        // Shift x2 to byte offset position
    sll x5, x5, x6        // Shift mask to byte offset position
    xori x5, x5, ~0       // Reverse byte mask
    and x3, x3, x5        // And x3 with reversed byte mask
    add x2, x2, x3        // Add x2 (just byte we want) and
                          // x3 (minus byte we want)
    sw x2, 0x0(x7)        // Store new x2 into address
~~~

**(C)** **Faster** (or no change). It takes some extra circuitry to compute half-word and byte-level stores and loads. If the cache determines the clock in our system, and this computation is on the critical path, it would make our clock period longer, and thus Bob's scheme is faster. If this is not on the critical path, then there would be no change.

**(D)** **Slower.** Each half-word or byte-level store or load gets translated into several instructions. This is especially true if the byte and half-word offsets are not known in advance (as is the case in (A) and (B)). Even if each cycle is slightly shorter by omitting the circuitry to read and write at the half word and byte level, so many more cycles are consumed by the extra instructions that the instruction sequence will run slower.`,
  };

  // ================================================================ L13

  R["l13-p1"] = {
    statement: t`The RISC-V Engineering Team is working on the design of a cache.  They've decided that the cache will have a total of $2^{10} = 1024$ data words, but are still thinking about the other aspects of the cache architecture.

First assume the team chooses to build a direct-mapped cache with a block size of 4 words.

**(A)** Please answer the following questions:

Number of lines in the cache:

Number of bits in the tag field for each cache entry:

**(B)** This cache takes 2 clock cycles to determine if a memory access is a hit or a miss and, if it's a hit, return data to the processor.  If the access is a miss, the cache takes 20 additional clock cycles to fill the cache line and return the requested word to the processor.   If the hit rate is 90%, what is the processor's average memory access time in clock cycles?

Average memory access time assuming 90% hit rate (clock cycles):

Now assume the team chooses to build a 2-way set-associative write-back cache with a block size of 4 words.  The total number of data words in the entire cache is still 1024.  The cache uses a LRU replacement strategy.

**(C)** Please answer the following questions:

Address bits used as block offset: A[ : ]

Address bits used as cache line index: A[ : ]

Address bits used for tag comparison: A[ : ]

**(D)** To implement the LRU replacement strategy this cache requires some additional state for each set.  How many state bits are required for each set?

Number of state bits needed for each set for LRU:

To test this set-associative cache, the team runs the benchmark code shown on the right.  The code sums the elements of a 16-element array.  The first instruction of the code is at location 0x0 and the first element of the array is at location 0x10000.  Assume that the cache is empty when execution starts and remember the cache has a block size of 4 words.

**(E)** How many instruction misses will occur when running the benchmark?

Number of instruction misses when running the benchmark:

~~~
. = 0x0
   mv x3, x0 // index
   mv x1, x0 // sum
   // x4 = 0x10000
   lui x4, 0x10

L: add x5, x4, x3
   lw x2, 0(x5)
   add x1, x1, x2
   addi x3, x3, 4
   slti x2, x3, 64
   bnez x2, L
   unimp      // halt

. = 0x10000
A: .word 0x1
   .word 0x2
   …
   .word 0xF
   .word 0x10
~~~

Fill in the cache contents after the benchmark runs (4 sets shown):

| Index | Way 0: Word 3 | Word 2 | Word 1 | Word 0 | Way 1: Word 3 | Word 2 | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|---|
| 0000 00 | | | | | | | | |
| 0000 01 | | | | | | | | |
| 0000 10 | | | | | | | | |
| 0000 11 | | | | | | | | |

**(F)** How many data misses (i.e., misses caused by the memory access from the LD instruction) will occur when running the benchmark?

Number of data misses when running the benchmark:

**(G)** What's the exact hit rate when the complete benchmark is executed?

Benchmark hit rate:`,
    solution: t`**(A)** Number of lines: **256**. In a direct-mapped cache, each line has one block. If each block has 4 words and we want a total of 1024 words, we must have (1024 words) / (4 words/block) / (1 block/line) = 256 cache lines.

Tag bits: **20**. With 256 cache lines, we need 8 bits to index into them (index bits). This gives us one block. Within each block, we have 4 words. Each word is 4 bytes. Thus, within a block, we need 2 bits to index into the block and retrieve the word (block offset) and then 2 bits to index into the word to retrieve an individual byte (byte offset). Since memory addresses are 32 bits wide, we have 32 - 8 - 2 - 2 = 20 bits remaining for the tag.

**(B)** **4.** $2 + (1 - 90\%) \cdot 20 = 4$.

**(C)** 1024/4 words/2 ways = 128 lines. Block offset: A[3:2]. Cache line index: A[10:4]. Tag: A[31:11].

**(D)** **1** bit to select which of the two ways was most recently used for each set.

**(E)** **3.**

Note: this explanation (which covers both 2E and 2F) is similar to that for problem 1E.

As we see in part (C), for each memory access, we look at bits [10:4] of the address to determine which index in the cache that particular memory address maps to. Remember that both instructions and the array are stored in memory. Thus, each instruction fetch is a memory access and is also cached along with all "normal" memory accesses in the form of lw (or sw) instructions.

In addition, note that each block in this cache contains four (4) words. Therefore, when we fetch a new line into the cache, we will be adding four instructions/array values into our cache. Because our instructions are mostly executed linearly and because our array is accessed in a strictly linear fashion, this pattern allows us to take huge advantage of spatial locality to reduce the number of instruction/data fetches that we must execute.

We start from the top with the mv instruction at address 0x0. Bits [10:4] = 0b0. Therefore, we check index 0 of the cache for the mv instruction. However, since our cache starts empty, there is nothing there (the valid bit == 0). This is a cache miss, so we load a cache line into that slot in way 1 of our cache. Since each line contains four words, we load in the instructions at addresses [0x0, 0x4, 0x8, 0xC] - i.e. the next three instructions in addition to the current instruction. Thus, the next three instructions are all cache hits. The fifth instruction, lw, is at address 0x10. Bits[10:4] = 0b1, so this instruction is cached at index 1. The pattern should be evident: every fourth instruction is cached at the next cache index.

We fetch and cache the lw instruction next at index 1. The lw instruction accesses address 0x10000 (the first element of the array). Bits [10:4] of 0x10000 are 0b0. This is the first data read miss. Note that we have already loaded in something in our cache at that index - the first set of four instructions. However, since our cache has two (2) ways, we can use the other way to load in another line of 4 words of array values. Thus, we only have a data fetch miss every fourth iteration of the loop L.

Since there are 16 array values and 10 instructions, we have that there are 16 // 4 = 4 data misses and 10 // 4 = 3 instruction misses.

Here is the final cache picture:

| Index | Way 0: Word 3 | Word 2 | Word 1 | Word 0 | Way 1: Word 3 | Word 2 | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|---|
| 0000 00 | add | lui | mv | mv | Mem[0x1000C] | Mem[0x10008] | Mem[0x10004] | Mem[0x10000] |
| 0000 01 | slti | addi | add | lw | Mem[0x1001C] | Mem[0x10018] | Mem[0x10014] | Mem[0x10010] |
| 0000 10 | - | - | unimp | bnez | Mem[0x1002C] | Mem[0x10028] | Mem[0x10024] | Mem[0x10020] |
| 0000 11 | | | | | Mem[0x1003C] | Mem[0x10038] | Mem[0x10034] | Mem[0x10030] |

**(F)** **4.**

**(G)** **109/116.** Instruction fetches = 3 instructions before + 6 instructions/iteration of loop × 16 iterations + 1 instruction after = 100. Data fetches = 16. Misses = 7. Hits = 116 − 7 = 109.`,
  };

  R["l13-p2"] = {
    statement: t`Bob has a direct mapped cache containing 32 total words with 8 words per line. Assume all words in data memory start off as 0x00000000. Assume there is a separate data and instruction cache. Bob executes the following code to test his cache.

~~~
. = 0x0
li x1, 0xABCD1234
li x4, 0x77337733
sw x1, 0x500(x0)
lh x2, 0x502(x0)
lb x5, 0x660(x0)
sh x1, 0x660(x0)
sb x4, 0x395(x0)
sb x1, 0x51B(x0)
li x3, 0x61916191
sb x3, 0x503(x0)
~~~

**(A)** What are the values of the following registers after execution of the code?

~~~
x2: ___________________________


x5: ___________________________
~~~

**(B)** What are the values at the following locations in memory after execution of the code?

~~~
0x500: ___________________________
0x660: ___________________________
0x394: ___________________________
0x518: ___________________________
~~~

**(C)** How many hits and misses did the data cache receive?

Hits: _________________

Misses: _________________`,
    solution: t`**(A)**

~~~
x2: 0xFFFFABCD


x5: 0x00000000
~~~

x2 contains the value of loading the half word at address 0x502. This is word address 0x500 with a byte offset of 0x2, so the upper half-word of 0x500. The address 0x500 currently contains 0xABCD1234 (written during the previous instruction), so the half word in question is 0xABCD. Sign extending this, we get 0xFFFFABCD.

x5 contains the value of loading the byte at address 0x660. This is word address 0x660 with a byte offset of 0x0. This address has not yet been written to, so it is all zeros.

**(B)**

~~~
0x500: 0x91CD1234
0x660: 0x00001234
0x394: 0x00003300
0x518: 0x34000000
~~~

The word at 0x500 is written to twice; once with a sw to address 0x500 and once with a sb to address 0x503. The address 0x503 is word address 0x500 plus a byte offset of 0x3. First, the value 0xABCD1234 is stored at this address. Then, the byte in x3 is stored at a byte offset of 3 into 0x500. This is the upper byte of this word. x3 contains 0x61916191, and the least significant 8 bits of this are 0x91, so these get stored into the upper byte of 0x500. This results in a value of 0x91CD1234.

The word at 0x660 is written to once, with a sh to address 0x660. This is word address 0x660 with byte offset 0x0, so the lower half-word is affected. The register x1 contains 0xABCD1234, and the least-significant 16 bits are 0x1234. So, 0x1234 is stored in the lower half word of 0x660, resulting in 0x00001234.

The word 0x394 is written to once, with a sb to 0x395. This is word address 0x394 with byte offset 0x1, so the byte at offset 1 is affected. The register x4 contains 0x77337733, and the least- significant 8 bits are 0x33. So, 0x33 is stored into the byte at offset 1, resulting in 0x00003300.

The word 0x518 is written to once, with a sb to 0x51B. This is word address 0x518 with byte offset 0x3, so the byte at offset 3 (most significant byte) is affected. The register x1 contains 0xABCD1234, and the least-significant 8 bits are 0x34. So 0x34 is stored into the byte at offset 3, resulting in 0x34000000.

**(C)** Hits: **3**. Misses: **4**.

With 32 total words and 8 words per line, the cache has 2 index bits and 3 offset bits.

The cache begins empty.

The first access to 0x500 is a miss, since nothing is in the cache. Then all 8 words from 0x500 - 0x51C are placed in the cache. They are placed at index 0.

The second access to 0x502 is a hit, since the word 0x500 is in the cache and this is a half-word access to part of that word.

The access to 0x660 is a miss. The line containing 0x660 is brought into the cache at index 3.

The next access to 0x660 is a hit, since it is now in the cache.

The access to 0x395 is a miss. It is part of the word 0x394. It maps to index 0, so must kick out the line containing address 0x500-0x51C.

The access to 0x51B is a miss. It is in the word 0x518. The line containing 0x500-0x51C is brought back into the cache again.

The access to 0x503 is a hit. It is in the word 0x500, which is now in the cache.`,
  };

  R["l13-p3"] = {
    statement: t`Assume the program shown below is being run on a RISC-V processor with a cache with the following parameters:

- 2-way set-associative

- block size of 2, i.e., 2 data words are stored in each cache line

- total number of data words in the cache is 32

- LRU replacement strategy

~~~
. = 0x244          // start of program
test:
  addi x4, x0, 16  // initialize loop index J to size of array
  mv x1, x0        // x1: sum
loop:              // add up elements in array
  subi x4, x4, 1   // decrement index
  slli x2, x4, 2   // convert to byte offset
  lw x3, 0x420(x2) // load value from A[J]
  add x1, x1, x3   // add to sum
  bnez x4, loop    // loop N times
  j test           // perform test again!

// allocate space to hold array
. = 0x420
A: .word A[0]
   .word A[1]
   ...
~~~

**(A)** The cache will divide the 32-bit address supplied by the processor into four fields: 2 bits of byte offset, B bits of block offset, L bits of cache line index, and T bits of tag field.   Based on the cache parameters given above, what are the appropriate values for B, L, and T?

value for B:

value for L:

value for T:

**(B)** If the ADDI instruction is resident in a cache line, what will be its cache line index? the value of the tag field for the cache? The block offset? Cache line index for ADDI when resident in cache: Tag field for ADDI when resident in cache: Block offset for ADDI when resident in cache:

**(C)** If the SLLI instruction is resident in a cache line, what will be its cache line index? the value of the tag field for the cache? The block offset? Cache line index for SLLI when resident in cache: Tag field for SLLI when resident in cache: Block offset for SLLI when resident in cache:

**(D)** Given that the code begins at address 0x244 and the array begins at address 0x420, and that there are 16 elements in the array as shown in the code above, list all the values j (0 ≤ j < 16) where the location holding the value A[j] will map to the same cache line index as the [[SLLI]] instruction in the program.



**(E)** If the outer loop is run many times, give the steady-state hit ratio for the cache, i.e., assume that the number of compulsory misses as the cache is first filled are insignificant compared to the number of hits and misses during execution.`,
    solution: t`**(A)** B = **1** (2 words per line; $\log_2 2 = 1$). L = **3** (8 lines per way). T = **26** (32 − 6).

**(B)**

Instruction address = base + instruction_index × 4 = 0x244 + 0×4 = 0x244. 0x244 = 0b00000000000000000000001001_000_100. Cache line index **0**, tag **0x9**, block offset **0x1**.

**(C)**

Instruction address = base + instruction_index × 4 = 0x244 + 3×4 = 0x250. 0x250 = 0b00000000000000000000001001_010_000. Cache line index **2**, tag **0x9**, block offset **0x0**.

**(D)**

The array addresses that overlap are: 0x450=0b00000000000000000000010001_010_000 and 0x454=0b00000000000000000000010001_010_100

These correspond to the 12th and 13th elements of the array: **j = 12, 13**.

**(E)**

Since this is a 2-way cache, the instructions and data will never conflict (they will be stored in two different ways even if they have the same line index). Thus, at steady-state, there is a **100%** hit ratio.`,
  };

  R["l13-p4"] = {
    statement: t`Consider a 2-way set-associative cache where each way has 4 cache lines with a block size of 2 words.  Each cache line includes a valid bit (V) and a dirty bit (D), which is used to implement a write-back strategy.  The replacement policy is least-recently-used (LRU).  The cache is used for both instruction fetch and data (LD,ST) accesses.   Please use this cache when answering questions (A) through (D).

**(A)** Using this cache, a particular benchmark program experiences an average memory access time (AMAT) of 1.3 cycles.  The access time on a cache hit is 1 cycle; the miss penalty (i.e., additional access time) is 10 cycles.  What is the hit ratio when running the benchmark program?  You can express your answer as a formula if you wish:

**(B)** The circuitry for this cache uses various address bits as the block offset, cache line index and tag field.  Please indicate which address bits A[31:0] are used for each purpose by placing a "B" in each address bit used for the block offset, "L" in each address bit used for the cache line index, and "T" in each address bit used for the tag field.

| Bit | 31 | 30 | 29 | ... | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Field | | | | ... | | | | | | 0 | 0 |

**(C)** This cache needs room to store new data and based on the LRU replacement policy has chosen the cache line whose information is shown below for replacement.   Since the current contents of that line are marked as dirty (D = 1), the cache must write some information back to main memory.  What is the address of each memory location to be written?  Please give each address in hex.

| Way | Cache line index | Valid bit (V) | Dirty bit (D) | Tag field |
|---|---|---|---|---|
| 0 | 3 | 1 | 1 | 0x123 |

**(D)** This cache is used to run the following benchmark program.  The code starts at memory address 0; the array referenced by the code has its first element at memory address 0x200. First determine the number of memory accesses (both instruction and data) made during each iteration through the loop.  Then estimate the steady-state average hit ratio for the program, i.e., the average hit ratio after many iterations through the loop.

~~~
. = 0
    mv x3, x0          // byte index into array
    mv x1, x0          // initialize checksum accumulator
loop:
    lw x2, 0x200(x3)   // load next element of array
    slli x1, x1, 1     // shift checksum
    addi x1, x1, 1     // increment checksum
    add x1, x1, x2     // include data value in checksum
    addi x3, x3, 4     // byte index of next array element
    slti x2, x3, 1000  // process 250 entries
    bnez x2, loop
    unimp              // halt

. = 0x200
array:
    ... array contents here ...
~~~`,
    solution: t`**(A)** **0.97.** AMAT = hit_time + (1 − hit_ratio) × miss_penalty: $1.3 = 1 + (1 - HR) \cdot 10$.

**(B)** A[31:5] = T (27 bits), A[4:3] = L, A[2] = B, A[1:0] = 00.

Block Size = 2Words = 8Byte: Block Offset 1bit, Byte Offset 2bit (2bits are 2'b00) 4 lines/each way = 4 sets cache: Index 2bits Remaining bits are all tag bits: 27 bits

**(C)** **0x2478, 0x247C.** Block offset: 1-bit value: 0b1 or 0b0; Byte offset: 2-bit value 0b00 Index: 2-bit 3 = 0b11 Tag: 27-bit 0x123 = 0b000 0000 0000 0000 0001 0010 0011 Address = [[{27'b tag, 2'b index, 1'b block offset, 2'b byte offset}]] 1) Block Offset (0b0): 0b000…00_0010_0100_0111_1000 = 0x2478 2) Block Offset (0b1): 0b000…00_0010_0100_0111_1100 = 0x247C

**(D)** **8** memory accesses per iteration; steady-state hit ratio **15/16**.

In steady state: each loop fetches 7 instructions and 1 data (lw). - Loop starts at instruction address 0x8=0b1000 - If you calculate the index bits for every two instructions (since each cache line contains two words) in the loop, you will see that none of them overlap. In addition, they can all be inserted into Way 0 of the cache. Thus, there are no instruction cache misses!

The other way of our cache can be used to load data from our array starting at address 0x200. Every time we encounter a new element of the array not in the cache, our cache load request will actually fetch two words (i.e. to contiguous elements in our array); thus, in the next iteration of our loop, we will not need to fetch again, as the next element is already in our cache.

Thus, the data fetch instruction only (lw) misses every other iteration of the while loop. Since there are 8 total memory accesses per while loop iteration, we see that one out of every 2*8=16 memory accesses is a miss.

Steady-state hit ratio = (8 − 0.5)/8 = 15/16.`,
  };

  // 2-way set-associative cache, 8 rows, 1-word lines (sections A and B).
  def("l13-2way", svg(520, 300, (() => {
    let o = "";
    for (const [x0, name] of [[120, "A"], [330, "B"]]) {
      o += tx(x0 + 80, 10, name, { s: 13, b: true }) + tx(x0 + 7, 26, "Valid bit", { s: 9 }) + tx(x0 + 42, 34, "Tag", { s: 10 }) + tx(x0 + 110, 34, "Data[31:0]", { s: 10 });
      for (let i = 0; i < 8; i++) {
        const y = 40 + i * 16;
        o += box(x0, y, 14, 16, "", { r: 0 }) + box(x0 + 14, y, 56, 16, "", { r: 0 }) + box(x0 + 70, y, 80, 16, "", { r: 0 });
      }
    }
    for (let i = 0; i < 8; i++) o += tx(300, 48 + i * 16, `Row ${i}`, { s: 9 });
    o += line("114,40 114,168") + w("40,104 110,104") + tx(36, 104, "Cache index", { a: "end", s: 10 });
    o += line("50,190 360,190") + tx(46, 190, "Tag field", { a: "end", s: 10 });
    for (const [tx0, dx] of [[162, 230], [372, 440]]) {
      o += w(`${tx0},168 ${tx0},202`) + w(`${tx0 - 12},190 ${tx0 - 12},206`) + root.Fig.circle(tx0, 215, 13, "=?", { s: 10 });
      o += w(`${dx},168 ${dx},222`) + `<polygon class="bx" points="${dx - 10},222 ${dx + 10},222 ${dx},240"/>` + w(`${tx0 + 13},215 ${dx - 6},230`, { arrow: "none" });
      o += line(`${dx},240 ${dx},275`);
    }
    o += line("162,228 162,243 140,243") + line("372,228 372,257 140,257");
    o += `<g transform="translate(240 0) scale(-1 1)">${root.Fig.gate("or", 100, 236, 40, 28)}</g>` + w("100,250 40,250") + tx(34, 250, "Hit?", { a: "end", s: 10 });
    o += line("440,275 230,275") + w("230,275 40,275") + tx(34, 275, "Data to CPU", { a: "end", s: 10 });
    return o;
  })()));

  R["l13-p5"] = {
    statement: t`Consider the diagram below for a 2-way set associative cache to be used with our RISC-V processor. Each cache line holds a single 32-bit word of data along with its associated tag and valid bit (0 when the cache line is invalid, 1 when the cache line is valid).

@fig l13-2way

**(A)** The RISC-V produces 32-bit byte addresses, A[31:0]. To ensure the best cache performance, which address bits should be used for the cache index? For the tag field?

**(B)** Suppose the processor does a read of location 0x5678. Identify which cache location(s) would be checked to see if that location is in the cache. For each location specify the cache section (A or B) and row number (0 through 7). E.g., **3A** for row 3, section A. If there is a cache hit on this access what would be the contents of the tag data for the cache line that holds the data for this location?

**(C)** Assume that checking the cache on each read takes 1 cycle and that refilling the cache on a miss takes an *additional* 8 cycles. If we wanted the *average* access time over many reads to be 1.1 cycles, what is the minimum hit ratio the cache must achieve during that period of time? You needn't simplify your answer.

**(D)** Estimate the approximate cache hit ratio for the following program. Assume the cache is empty before execution begins (all the valid bits are 0) and that an LRU replacement strategy is used. Remember the cache is used for both instruction and data (LD) accesses.

~~~
. = 0
      addi x4, x0, 0x100
      mv x1, x0
      lui x2, 1            // x2 = 0x1000
loop: lw x3, 0(x4)
      addi x4, x4, 4
      add x1, x1, x3
      addi x2, x2, -1
      bnez x2, loop
      sw x1, 0x100(x0)
      unimp                // halt

. = 0x100
source:
. = . + 0x4000             // Set source to 0x100, reserve 0x1000 words
~~~

**(E)** After the program of part (D) has finished execution what information is stored in row 4 of the cache? Give the addresses for the two locations that are cached (one in each of the sections) or briefly explain why that information can't be determined.`,
    solution: t`**(A)** Cache index: **A[4:2]**. Tag field: **A[31:5]**. As always, 2 bits for byte offset (both 0). 1 word per block implies block offset = 0 bits (no need to select). 8 lines/way implies index = 3 bits. Remaining 27 bits are tag bits.

**(B)** Locations checked: **6A and 6B**. Tag on a hit: **0x2B3**.

0x5678 in binary: 0b 0101 0110 011 1 1000. Line: 3'b110 = 6. Tag: 0b0010_1011_0011 = 0x2B3. Remember, all ways are checked in parallel when searching a set-associative cache.

**(C)** $1.1 = 1 + (1 - HR) \cdot 8$, so $HR = 79/80$.

**(D)** **5/6.** The first instruction in the loop (lw) is at 0xC = 0b1100. Extracting the index bits from this address, we see that the instructions within the loop body (lw - bnez) occupy lines 3-7 of one of the ways in the cache.

Thus, one way is always free for data. Each iteration causes a data fetch that is a cache miss (since there is only a single word per cache line → no spatial locality). Thus, each iteration there are 5 instruction fetches (hits) and 1 data fetch (always a miss).

**(E)** **0x10 and 0x40F0.**

- 0x10 holds [[addi x4, x4, 4]], which maps to row 4.
- Data access ends at 0x4100 − 4 = 0x40FC (it starts from 0x100 and runs 0x1000 times, with the next element at +4), at row 7. Going back, 0x40F0 is at row 4, 0x40F4 at row 5, 0x40F8 at row 6, and 0x40FC at row 7.`,
  };

  R["l13-p6"] = {
    statement: t`A standard unpipelined RISC-V is connected to a 2-way set-associative cache containing 8 sets, with a block size of 4 32-bit words.  The cache uses a LRU replacement strategy.  At a particular point during execution, a snapshot is taken of the cache contents, which are shown below. All values are in hex; **assume that any hex digits not shown are 0**. The line number L selects the set; the tag comparison (=) of each way gives AHIT/BHIT, and the word select B picks a word from the block.

**Way #1**

| Line | V | D | TAG | A3 | A2 | A1 | A0 |
|---|---|---|---|---|---|---|---|
| 7 | 1 | 1 | f29 | a6218800 | 77f70002 | c01f0034 | 8359c800 |
| 6 | 1 | 0 | 027 | c01f0037 | 73fffefa7 | 77ee0002 | d33ac000 |
| 5 | 0 | 0 | 000 | 00000000 | 00000000 | 00000000 | 00000000 |
| 4 | 1 | 0 | 33a | 8358c000 | 73fa0002 | c17f0f0f | 73fffef0 |
| 3 | 1 | 0 | 801 | 641f0608 | 60ff0600 | c01f0043 | 80200000 |
| 2 | 1 | 0 | 002 | 90072800 | 73fffeb0 | 80a42800 | d0052ca0 |
| 1 | 1 | 0 | 5c8 | 80400000 | 8358c000 | 73ff0003 | a5ab6000 |
| 0 | 1 | 0 | a11 | c01f0045 | d1cd7f0f | 7f1f0091a | 77e00002 |

**Way #2**

| Line | V | D | TAG | B3 | B2 | B1 | B0 |
|---|---|---|---|---|---|---|---|
| 7 | 1 | 0 | 77e | d01e001e | 61040008 | c01f0044 | 80a32800 |
| 6 | 1 | 0 | 1f0 | c23f0394 | 77e00002 | 80400000 | c01f0046 |
| 5 | 1 | 0 | d1c | f79c0001 | e809ffff | aaaaaaaa | 55555555 |
| 4 | 1 | 0 | 00a | d37affff | dc000000 | 73fffe93 | 80600000 |
| 3 | 1 | 0 | 01b | c01f0035 | d01e04b0 | 80a42800 | 73fffeab |
| 2 | 1 | 0 | 02b | c6510001 | 77f90002 | 90082800 | c01f0041 |
| 1 | 1 | 0 | f99 | 77ee0002 | f39b001f | 64040000 | fc000000 |
| 0 | 1 | 0 | 7af | a9ab6000 | c01f003b | 77e00002 | fb5c0011 |

**(A)** The cache uses bits from the 32-bit byte address produced by the processor to select the appropriate set (L), as input to the tag comparisons (T) and to select the appropriate word from the data block (B).  For correct and optimal performance what are the appropriate portions of the address to use for L, T and B?  Express your answer in the form "A[N:M]" for N and M in the range 0 to 31, or write "CAN'T TELL".

**(B)** For the following addresses, if the contents of the specified location appear in the cache, give the location's 32-bit contents in hex (determined by using the appropriate value from the cache).  If the contents of the specified location are NOT in the cache, write "MISS".

**(C)** Ignoring the current contents of the cache, is it possible for the contents of locations 0x0 and 0x1000 to both be present in the cache simultaneously?

**(D)** Give a one-sentence explanation of how the [[D]] bit got set to 1 for Line #7 of Way #1. At what point should the [[D]] bit be reset to 0?

**(E)** The following code snippet sums the elements of the 32-element integer array [[X]].  Assume this code is executing on a RISC-V processor with a cache architecture as described above and that, initially, the cache is empty, i.e., all the [[V]] bits have been set to 0.  Compute the hit ratio as this program runs until it executes the unimp instruction, a total of 2 + (6*32) + 1 = 195 instruction fetches and 32 data accesses.

~~~
. = 0
      mv x4, x0           // loop counter
      mv x1, x0           // accumulated sum
loop: slli x2, x4, 2      // convert loop counter to byte offset
      lw x3, 0x100(x2)    // load next value from array
      add x1, x1, x3      // add value to sum
      addi x4, x4, 1      // increment loop counter
      slti x2, x4, 32     // finished with all 32 elements?
      bnez x2, loop       // nope, keep going
      unimp               // all done, sum in x1

. = 0x100
X:  .word 1               // the 32-element integer array X
    .word 2
    ...
    .word 32
~~~`,
    solution: t`**(A)** L: **A[6:4]**. T: **A[31:7]**. B: **A[3:2]**.

4 bytes/word → 2-bit byte offset (as always) 4 word (16 Byte) cache block -> 2-bit block offset 8 rows per way (8-set cache) -> 3-bit index Address -> [[{25'b tag, 3'b index, 2'b block offset, 2'b byte offset}]]

**(B)** 0xA1100: **MISS** (tag 0x1422, line 0, word 0: neither way of line 0 has tag 0x1422). 0x548: **0xDC000000** (tag 0x00A, line 4, word 2: way #2 line 4 has tag 00a, and B2 = dc000000).

**(C)** **YES.** The cache has 2 ways, so yes, even though their index bits match.

**(D)**

ST updated a value of a word in that line in cache, but hasn't yet been written back to memory (Dirty). It will be reset when that line is evicted from the cache and written to memory.

**(E)** **216/227.**

Cache stores 4 words per line: First four instructions (mv, mv, slli, lw) map to cache index "0" and the other 4 instructions (add, addi, slti, bnez) map to cache index "1". Unimp is mapped to index "3"

For 32 words in the array, 4 are grouped into a cache block and stored in another way of the cache (total 8 lines)

3 instruction misses and 8 data misses (Compulsory - initially cache empty) No more misses after that. Total instruction fetches: 2 + 6*(32) + 1 = 195, total data fetches: 32

Hit ratio = (195 + 32 − 3 − 8)/(195 + 32) = 216/227.`,
  };

  R["l13-p7"] = {
    statement: t`After his geek hit single I Hit the Line, renegade singer Johnny Cache has decided he'd better actually learn how a cache works.  He bought three RISC-V processors, identical except for their cache architectures:

- Proc1 has a 64-line direct-mapped cache

- Proc2 has a 2-way set associative cache, LRU, with a total of 64 lines

- Proc3 has a 4-way set associative cache, LRU, with a total of 64 lines

Note that each cache has the same total capacity: 64 lines, each holding a single 32-bit word of data or instruction.  All three machines use the same cache for data and instructions fetched from main memory. Johnny has written a simple test program:

~~~
// Try a little cache benchmark
// Assume x7 = 0x2000 (data region A)
// Assume x8 = 0x3000 (data region B)
// Assume x9 = 4 (size of data region in Words)

. = 0x1000                     // start program here
P:  addi x6, x0, 1000          // outer loop count
Q:  mv x3, x9                  // loop index i (array offset)
    slli x3, x3, 2
R:  addi x3, x3, -4            // i = i-1
    add x10, x3, x7            // x10 = address of A[i]
    add x11, x3, x8            // x11 = address of B[i]
    lw x1, 0(x10)              // read A[i]
    lw x2, 0(x11)              // read B[i]
    bnez x3, R
    addi x6, x6, -1            // repeat many times
    bnez x6, Q
    unimp                      // halt
~~~

Johnny runs his program on each processor, and finds that one processor model outperforms the other two.

**(A)** Which processor model gets the highest hit ratio on the above benchmark? (Proc1 / Proc2 / Proc3)

**(B)** Johnny changes the value of [[B]] in his program to [[0x2000]] (same as [[A]]), and finds a substantial improvement in the hit rate attained by one of the processor models (approaching 100%). Which model shows this marked improvement? (Proc1 / Proc2 / Proc3)

**(C)** Finally, Johnny moves the code region to 0x0 and the two data regions [[A]], and [[B]] each to [[0x0]], and sets x9 to [[16]]. What is the TOTAL number of cache misses that will occur executing this version of the program on each of the processor models?`,
    solution: t`**(A)** **Proc3.** There are 3 regions: 0x1000 (instructions), 0x2000 (array A), 0x3000 (array B).

**(B)** **Proc2.** There are 2 regions (array A is now equal to array B), so 2 ways is sufficient.

**(C)** Proc1: **16**. Proc2: **16**. Proc3: **16**. One region (code and data) needs to fetch 16 elements once in all caches ("compulsory misses").`,
  };

  R["l13-p8"] = {
    statement: t`**(A)** We would like to design a cache with an AMAT (average memory access time) of 1.5 cycles. Accessing our cache takes 1 cycle, and on a miss, it takes an additional 10 cycles to retrieve the data from main memory and update the cache. What does our hit ratio need to be in order to achieve the target AMAT?

We choose to implement a 2-way set-associative cache with a block size of 4 (i.e. 4 words per line). The number of sets in the cache is 4. Assume that addresses and data words are 32 bits.

**(B)** To ensure the best cache performance, which address bits should be used for the block offset, the cache index, and the tag field?

Byte offset: A[1:0] (given). Give the block offset, cache index, and tag field bits.

**(C)** Assuming the cache uses a writeback policy, what is the total number of bits per cache line? Please show your work for partial credit.

We want to analyze the performance of this cache on the following assembly program, which iterates through a 1000-word array [[A]] and sets each element to [[A[i] = -A[i]]]. The base address of array A is [[0x3000]].

~~~
. = 0x100 // The following code starts at address 0x100

// Assume the following registers are initialized:
// x1=0 (loop index)
// x2=1000 (number of array elements)
// x3=0x3000 (base address of array A)

loop:
slli x5, x1, 2   // x5 = byte offset of the ith element
add x6, x5, x3   // x6 = address of A[i]
lw x7, 0(x6)     // x7 = A[i]
sub x7, x0, x7   // x7 = -A[i]
sw x7, 0(x6)     // store A[i] = -A[i]
addi x1, x1, 1   // increment i
blt x1, x2, loop // continue looping
~~~

**(D)** Below is the cache state the first time the program is about to enter the loop at [[loop]]. Assume that the cache uses a least-recently used (LRU) replacement policy, and that all cache lines in Way 1 are currently the least-recently used. Mark up the cache below to indicate the state of the cache immediately after one loop iteration (after executing the [[blt]] instruction for the first time). You do not need to specify the value of data words, but do specify the values of D (dirty bit), V (valid bit), and Tag.

**Way 0**

| Set | D | V | Tag |
|---|---|---|---|
| 0 | 0 | 1 | 0x0 |
| 1 | 0 | 1 | 0x0 |
| 2 | 0 | 1 | 0x0 |
| 3 | - | 0 | - |

**Way 1**

| Set | D | V | Tag |
|---|---|---|---|
| 0 | - | 0 | - |
| 1 | - | 0 | - |
| 2 | - | 0 | - |
| 3 | - | 0 | - |

(The data words are not needed.)

**(E)** How many instruction fetches and data accesses occur per iteration of the loop?

**(F)** After the program has been running for many loop iterations, what is the steady-state hit ratio for instruction fetches and data accesses?`,
    solution: t`**(A)** **0.95.** AMAT = HitTime + MissPenalty × MissRatio: 1.5 cycles = 1 cycle + (10 cycles) × (1 − HitRatio), so 0.05 = 1 − HitRatio.

**(B)** Block offset: **A[3:2]**. Cache index: **A[5:4]**. Tag: **A[31:6]**.

**(C)** **156 bits.** Bits per line = 1 valid bit + 1 dirty bit + 26 tag bits + 4 × 32 data bits = 28 + 128 = 156 bits.

**(D)** Changes: Way 0, set 0 gets D = 1 and tag 0xC0 (the array block, written by sw). Way 1, sets 0 and 1 get D = 0, V = 1, tag 0x4 (the loop instructions at 0x100-0x11B).

**Way 0**

| Set | D | V | Tag |
|---|---|---|---|
| 0 | **1** | 1 | **0xC0** |
| 1 | 0 | 1 | 0x0 |
| 2 | 0 | 1 | 0x0 |
| 3 | - | 0 | - |

**Way 1**

| Set | D | V | Tag |
|---|---|---|---|
| 0 | **0** | **1** | **0x4** |
| 1 | **0** | **1** | **0x4** |
| 2 | - | 0 | - |
| 3 | - | 0 | - |

**(E)** Instruction fetches: **7**. Data accesses: **2**.

**(F)**

All instructions fetches fit in Way 1. They are never replaced by data since they are always accessed more recently than the previous set of data. So in steady state, there is an instruction hit rate of 100%.

The data array is large enough that in steady state every time you access a new block of data you get 1 miss.  However, when you get the miss, you bring in 4 consecutive data elements, each of which is accessed twice through a lw followed by a sw.  So for every 8 data accesses, you get 1 miss, or a hit rate of 7/8.

Instruction-fetch hit ratio: **1** (100%). Data hit ratio: **7/8**.`,
  };

  R["l13-p9"] = {
    statement: t`Anne and Ben just learned about caches in 6.004 and decided to design their own.

**(A)** They would like to design a cache with an AMAT (average memory access time) of 3 cycles. Accessing the cache should take 1 cycle, and on a miss, it should take an additional 16 cycles to retrieve the data from main memory, update the cache, and return the requested word to the processor. What should their hit ratio be in order to achieve the target AMAT?

Ben suggests implementing a 2-way set-associative cache with a block size of 4 (i.e. 4 words per line). The number of sets in the cache is 8. Assume that addresses and data words are 32 bits wide.

**(B)** To ensure the best cache performance, which address bits should be used for the block offset, the cache index, and the tag field?

Byte offset: A[1:0] (given). Give the block offset, cache index, and tag field bits.

**(C)** Anne agrees with the appropriateness of a 2-way set-associative implementation, but she suspects that a larger block size might result in a higher hit rate. Suppose the block size of the cache is doubled to 8. If the total number of data words in the cache remains unchanged, how would the number of cache lines change? Choose from: UNCHANGED, +1, −1, 2x, 0.5x, CAN'T TELL.

Ultimately, they choose to implement Ben's 2-way, 4-block cache. Below is a snapshot of the cache during the execution of some unknown code. The column labeled Word x corresponds to the xth word of the block. The V bit specifies whether or not the line is valid, and the D bit specifies whether or not the line is dirty.

**(D)** Would a load request to address 0x193C result in a hit or a miss? If it results in a hit, specify what value is returned; if it is a miss, write N/A.

| Set | V | D | Tag | Word 3 | Word 2 | Word 1 | Word 0 | V | D | Tag | Word 3 | Word 2 | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1 | 0 | 0x32 | 0x3A | 0x2A | 0x1A | 0x0A | 1 | 0 | 0x33 | 0x83 | 0x82 | 0x81 | 0x80 |
| 1 | 1 | 0 | 0x32 | 0x7B | 0x6B | 0x5B | 0x4B | 1 | 1 | 0x33 | 0xB7 | 0xB6 | 0xB5 | 0xB4 |
| 2 | 1 | 0 | 0x32 | 0x0C | 0x1C | 0x2C | 0x3C | 1 | 0 | 0x95 | 0xC0 | 0xC1 | 0xC2 | 0xC3 |
| 3 | 1 | 0 | 0x32 | 0x4D | 0x5D | 0x6D | 0x7D | 1 | 0 | 0x95 | 0xD6 | 0xD5 | 0xD4 | 0xD3 |
| 4 | 1 | 1 | 0x50 | 0x03 | 0x13 | 0x23 | 0x33 | 1 | 0 | 0x22 | 0x86 | 0x87 | 0x88 | 0x89 |
| 5 | 1 | 1 | 0x50 | 0x14 | 0x24 | 0x34 | 0x44 | 1 | 0 | 0xA0 | 0x95 | 0x94 | 0x93 | 0x92 |
| 6 | 0 | 0 | 0x43 | 0x85 | 0x75 | 0x65 | 0x55 | 1 | 1 | 0x37 | 0xF8 | 0xF7 | 0xF6 | 0xF5 |
| 7 | 1 | 0 | 0x66 | 0x96 | 0x86 | 0x76 | 0x66 | 1 | 1 | 0x18 | 0xAA | 0xA9 | 0xA8 | 0xA7 |

(Columns 2-8 are one way and columns 9-15 are the other way.)

Anne and Ben want to analyze the performance of this cache on the following assembly program, which calculates the first 256 terms in the Fibonacci sequence and stores them in an array [[A]]. The base address of array [[A]] is [[0x3000]].

~~~
// Assume the following registers are initialized:
// x1 = 0 (initial loop index)
// x2 = 256 - 2 = 254 (number of Fibonacci elements to calculate)
// x3 = 0x3000 (base address of array A)

. = 0x100 // The following code starts at address 0x100
fibonacci:
   li x4, 1         // x4 = 1 (second element in sequence)
   sw x0, 0(x3)     // A[0] = 0
   sw x4, 4(x3)     // A[1] = 1
loop:
   slli x4, x1, 2   // x4 = byte offset of the ith element
   add x5, x4, x3   // x5 = address of A[i]
   lw x6, 0(x5)     // x6 = A[i]
   lw x7, 4(x5)     // x7 = A[i+1]
   add x6, x6, x7   // x6 = A[i] + A[i+1]
   sw x6, 8(x5)     // A[i+2] = x6
   addi x1, x1, 1   // increment i
   blt x1, x2, loop // continue looping
~~~

Answer the following questions about the behavior of the cache during execution of the above code. Assume that the cache uses a least recently used (LRU) replacement policy, that the cache is initially empty, and that all cache lines in Way 0 are currently the least-recently used.

**(E)** How many instruction fetches and data accesses occur per iteration of the loop?

**(F)** After the program has been running for many loop iterations, what is the steady-state hit ratio for instruction fetches and data accesses?  Hint: Note that in steady state each array element is accessed in multiple loop iterations.`,
    solution: t`**(A)** Hit ratio: **7/8** ($3 = 1 + (1 - HR) \cdot 16$).

**(B)** Block offset: **A[3:2]**. Cache index: **A[6:4]**. Tag: **A[31:7]**.

**(C)** **0.5x.**

**(D)** **Hit**, value **0x4D**. (0x193C has tag 0x32, set 3, word 3.)

**(E)** Instruction fetches: **8**. Data accesses: **3**.

**(F)** Instruction fetches: **1** (100%). Data accesses: **11/12**.`,
  };

  R["l13-p10"] = {
    statement: t`Dilvina and Saniel are analyzing 4.006 grade statistics and are performing some hefty calculations, so they suspect that a cache could improve their system's performance.

**(A)** They are considering using a 2-way set-associative cache with a block size of 4 (i.e. 4 words per line). The cache can store a total of 64 words. Assume that addresses and data words are 32 bits wide. To properly make use of locality, which address bits should be used for the block offset, the cache index, and the tag field?

Byte offset: A[1:0] (given). Give the tag field, block offset, and cache index bits.

**(B)** If Dilvina and Saniel instead used a direct-mapped cache with the same total capacity (64 words) and same block size (4 words), how would the following parameters in their system change?

- Change in # of cache lines (UNCHANGED, +1, −1, 2x, 0.5x, CAN'T TELL)
- Change in # of bits in tag field (UNCHANGED, +1, −1, 2x, 0.5x, CAN'T TELL)

Ultimately, they decided that the 2-way set associative cache would probably have better performance for their application, so the remainder of the problem will be considering a 2-way set associative cache. Below is a snapshot of this cache during the execution of some unknown code. V is the valid bit and D is the dirty bit of each set.

| Set | Way 0: V | D | Tag | Word 3 | Word 2 | Word 1 | Word 0 | Way 1: V | D | Tag | Word 3 | Word 2 | Word 1 | Word 0 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1 | 0 | 0x32 | 0x3A | 0x2A | 0x1A | 0x0A | 1 | 0 | 0x33 | 0x83 | 0x82 | 0x81 | 0x80 |
| 1 | 1 | 0 | 0x32 | 0x7B | 0x6B | 0x5B | 0x4B | 1 | 0 | 0x33 | 0xB7 | 0xB6 | 0xB5 | 0xB4 |
| 2 | 1 | 0 | 0x32 | 0x0C | 0x1C | 0x2C | 0x3C | 1 | 0 | 0x95 | 0xC0 | 0xC1 | 0xC2 | 0xC3 |
| 3 | 1 | 0 | 0x32 | 0x4D | 0x5D | 0x6D | 0x7D | 1 | 0 | 0x95 | 0xD6 | 0xD5 | 0xD4 | 0xD3 |
| 4 | 1 | 1 | 0x50 | 0x03 | 0x13 | 0x23 | 0x33 | 1 | 1 | 0x22 | 0x86 | 0x87 | 0x88 | 0x89 |
| 5 | 1 | 1 | 0x50 | 0x14 | 0x24 | 0x34 | 0x44 | 1 | 1 | 0xA0 | 0x95 | 0x94 | 0x93 | 0x92 |
| 6 | 0 | 0 | 0x43 | 0x85 | 0x75 | 0x65 | 0x55 | 0 | 0 | 0x37 | 0xF8 | 0xF7 | 0xF6 | 0xF5 |
| 7 | 1 | 0 | 0x66 | 0x96 | 0x86 | 0x76 | 0x66 | 1 | 0 | 0x18 | 0xAA | 0xA9 | 0xA8 | 0xA7 |

**(C)** Would the following memory accesses result in a hit or a miss? If it results in a hit, specify what value is returned; if it is a miss, explain why in a few words or by showing your work.

For each address, give the line index, tag, block offset, and the returned value (on a hit) or a short explanation (on a miss):

- 0x4AB4
- 0x21E0

Dilvina and Saniel want to analyze the performance of this same cache on the following assembly program, which averages the quiz 2 scores for the 225 students in 4.006. The students' scores are stored in an array A whose base address is at 0x3000.

~~~
// Assume the following registers are initialized:
// x1 = 0 (loop index)
// x2 = 225 (number of 4.006 students)
// x3 = 0x3000 (base address of array A)
// x6 = 0 (used for summing)

. = 0x0 // The following code starts at address 0x0
sum_loop:

slli x4, x1, 2

// x4 = 4*i
add x5, x4, x3
// x5 = address of A[i]
lw x5, 0(x5)

// x5 = A[i]
add x6, x6, x5
// x6 = sum(A[i:0])
addi x1, x1, 1

// increment i
blt x1, x2, sum_loop
// continue looping

divide_by_n:


// divide by 225 here
~~~

Answer the following questions about the behavior of the cache during execution of the above code. Assume that the cache uses a least recently used (LRU) replacement policy, that the cache is initially empty, and that all cache lines in Way 0 are currently the least-recently used.

**(D)** How many instruction fetches and data accesses occur per iteration of the loop?

**(E)** What is the hit ratio for all memory accesses (both instruction fetches and data accesses) the first time through the loop?

**(F)** After the program has been running for many loop iterations, what is the steady-state hit ratio for all memory accesses (both instruction fetches and data accesses)?

**(G)** Dilvina and Saniel want to use the cache above in their memory hierarchy between the CPU and main memory. The cache takes 5 cycles to determine if a memory access is a miss or a hit, and the main memory in their system takes an additional 140 cycles for each memory access that reaches it. What is the steady-state AMAT of their memory system during the test that they ran above?`,
    solution: t`**(A)** Tag: **A[31:7]**. Block offset: **A[3:2]**. Cache index: **A[6:4]**.

Block size of 4 → 2 bits for block offset. 64 words / 4 words per block = 16 blocks. 16 blocks / 2 ways = 8 sets → 3 bits for cache index. 32 − 3 − 2 − 2 = 25 bits of tag.

**(B)** Cache lines: **UNCHANGED** (2x was also accepted, because the 2-way cache has ½ the number of sets of the direct-mapped cache, but the number of cache lines is actually the same). Tag bits: **−1**.

Block size of 4 → 2 bits for block offset. 64 words / 4 words per block = 16 blocks → 4 bits for cache line index. 32 − 4 − 2 − 2 = 24 bits of tag.

**(C)**

| Address | Line index | Tag | Block offset | Result |
|---|---|---|---|---|
| 0x4AB4 | 3 | 0x95 | 1 | Hit: 0xD4 |
| 0x21E0 | 6 | 0x43 | 0 | Miss: the valid bit is 0 |

**(D)** Instruction fetches: **6**. Data accesses: **1**.

**(E)** **4/7.** The first instruction misses, and the next 3 hit because the block size is 4. The fifth instruction misses, and the sixth instruction hits. The data access is a miss.

**(F)** **27/28.** All instructions hit. The data access misses once every 4 iterations. So 1 miss per four iterations, or a 27/28 hit rate.

**(G)** **10 cycles.** AMAT = hit_time + (1 − HR)(miss penalty) = 5 + (1/28)(140) = 10.`,
  };

  // ================================================================ L14

  def("l14-p1-pipe", root.Fig.pipe({ start: 100, rows: {
    IF: ["slli", "lw", "add", "bnez", "bnez", "bnez"], DEC: ["addi", "slli", "lw", "add", "add", "add"],
    EXE: ["NOP", "addi", "slli", "lw", "NOP", "NOP"], MEM: ["NOP", "NOP", "addi", "slli", "lw", "NOP"], WB: ["bnez", "NOP", "NOP", "addi", "slli", "lw"],
  } }));

  R["l14-p1"] = {
    statement: t`The program shown below is executed on a 5-stage pipelined RISC-V processor with full bypassing.

The program has been running for a while and execution is halted at the end of cycle 105.

The pipeline diagram below shows the history of execution at the time the program was halted.

**(A)** Please indicate on which cycle(s), 100 through 105, each of the following actions occurred. If the action did not occur in any cycle, write "NONE".

- Register value used from Register File
- Register value bypassed from EXE stage to DEC stage
- Register value bypassed from MEM stage to DEC stage
- Register value bypassed from WB stage to DEC stage

~~~
  . = 0
outer_loop:
  addi x11, x0, 16   // initialize loop index J
  addi x12, x0, 0

loop:                // add up elements in array
  addi x11, x11, -1  // decrement index
  slli x13, x11, 2   // convert to byte offset
  lw x14, 0x310(x13) // load value from A[J]
  add x12, x12, x14  // add to sum
  bnez x11, loop

  j outer_loop       // perform test again!
~~~

@fig l14-p1-pipe

**(B)** Why is the NOP instruction inserted in cycle 104?`,
    solution: t`**(A)** Register file: **100, 105**. EXE → DEC: **101, 102**. MEM → DEC: **NONE**. WB → DEC: **105**.

In cycle 101, decoding the slli instruction requires the value of x11. However, x11 was modified by the addi instruction immediately before it. Therefore, we cannot use the value of x11 that is currently in the register file since that will not be updated until the end of cycle 103 when the addi instruction goes through the write-back stage. However, we can get the value that will ultimately be stored in x11 by looking at the result of executing the addi instruction (i.e. bypassing the result of the EXE stage to the DEC stage, EXE → DEC bypass).

Similarly, decoding the lw instruction in cycle 102 requires the updated value in x13, which is modified by the slli instruction. Once again, we can bypass from the EXE stage, where the addi instruction has now passed through the ALU (EXE → DEC bypass).

In cycle 103, we attempt to decode the add instruction in the DEC stage, but this requires knowing x12 and x14. We can get x12 from the register file, but x14 was updated by a lw operation. The lw operation cannot actually get the data from memory until the start of the WB stage, and it doesn't update the x14 register until the end of the WB stage. At cycle 103, the lw instruction has not reached the WB stage yet. We must insert NOPs into the pipeline until the lw hits the WB stage (cycle 105), at which point we can bypass the value retrieved from memory back into the DEC stage (WB → DEC bypass). The value of x12 can just be retrieved from the register file.

**(B)**

The add must wait until the lw is in the WB stage in order to be able to get the results of the lw via a bypass path. See previous part for a more detailed explanation.`,
  };

  R["l14-p2"] = {
    statement: t`The following program fragments are being executed on the 5-stage pipelined RISC-V processor with full bypassing.  For each fragment, the pipeline diagram shows the state of the pipeline for cycle 1000 of execution.  Please fill in the diagram for cycle 1001; use "?" if you cannot tell what opcode to write into a stage. Then for both cycles use arrows to indicate any bypassing from the EXE/MEM/WB stages back to the DEC stage.

**(A)**

~~~
…
sw x1,  0(x0)
lw x17, 0xC(x1)
addi x2, x2, -4
slli x11, x17, 2
sw x11, 0(x2)
jal ra, fact
…
~~~

| Cycle | 1000 | 1001 |
|---|---|---|
| IF | sw | |
| DEC | slli | |
| EXE | addi | |
| MEM | lw | |
| WB | sw | |

**(B)**

~~~
…
xor x11, x11, x12
slli x12, x12, 3
sub x13, x12, x11
and x12, x13, x11
add x13, x12, x13
sw x13, 0x100(x0)
…
~~~

| Cycle | 1000 | 1001 |
|---|---|---|
| IF | add | |
| DEC | and | |
| EXE | sub | |
| MEM | slli | |
| WB | xor | |`,
    solution: t`**(A)**

| Cycle | 1000 | 1001 |
|---|---|---|
| IF | sw | sw |
| DEC | slli | slli |
| EXE | addi | NOP |
| MEM | lw | addi |
| WB | sw | lw |

To figure out if we need to add a NOP, we look at the instruction we are decoding: slli x11, x17, 2. Not all of these values are available to us by cycle 1000. Specifically, x17 was modified by the lw instruction. Notice from the pipeline diagram that lw is still in the MEM stage at cycle 1000, meaning that it has just sent a request to the data memory. However, the data memory does not return the data until one clock cycle later. Therefore, we need to insert a NOP to wait for the lw to reach the WB stage. At the end of cycle 1001, the lw has reached the WB stage which means the data has been retrieved from memory and can be bypassed up to the DEC instruction to decode the slli instruction that has been stalled there for one cycle.

**(B)**

| Cycle | 1000 | 1001 |
|---|---|---|
| IF | add | sw |
| DEC | and | add |
| EXE | sub | and |
| MEM | slli | sub |
| WB | xor | slli |

In cycle 1000, the and instruction is being decoded in the DEC stage. The and instruction relies on registers x11 and x13. Both of these registers were updated within 3 cycles of the and instruction, so the results of these registers have not yet been written back into the register files. The value of x13 is set by the sub instruction which is currently in the EXE stage. Similarly, the value for x11 needs to be bypassed from the WB stage since it is set by the xor instruction.

Since all required register values could be retrieved in cycle 1000, there is no need for a NOP. We process the next instruction which is a sw instruction. The add instruction is now being decoded and requires the values in x12 and x13. These were modified by the and and sub instructions, so we need to bypass from the EXE and MEM stages.

`,
  };

  // Stage block diagram (as in the past quizzes): groups of stages between pipeline registers,
  // with bypass paths drawn above (top) or below (bottom).
  const stageDiag = (groups, top, bottom = []) => {
    const bw = 52, bh = 40, gap = 6, rw = 10, y = 36, parts = [], pos = {};
    let x = 6;
    groups.forEach((g, gi) => {
      g.forEach((name, i) => {
        parts.push(box(x, y, bw, bh, name, { s: 11, b: true, r: 2 }));
        if (i) parts.push(line(`${x - gap},${y + bh / 2} ${x},${y + bh / 2}`));
        pos[name] = x + bw / 2;
        x += bw + gap;
      });
      if (gi < groups.length - 1) {
        parts.push(line(`${x - gap},${y + bh / 2} ${x + 6},${y + bh / 2}`), box(x + 6, y, rw, bh, "", { r: 1, c: "acc" }), line(`${x + 6 + rw},${y + bh / 2} ${x + 12 + rw},${y + bh / 2}`));
        x += rw + 18;
      }
    });
    top.forEach(([a, b], i) => { const yy = y - 8 - i * 9, xb = pos[b] - 10 + i * 7; parts.push(line(`${pos[a]},${y} ${pos[a]},${yy} ${xb},${yy}`), w(`${xb},${yy} ${xb},${y}`)); });
    bottom.forEach(([a, b], i) => { const yy = y + bh + 10 + (bottom.length - 1 - i) * 9, xb = pos[b] - 4 + i * 7; parts.push(line(`${pos[a]},${y + bh} ${pos[a]},${yy} ${xb},${yy}`), w(`${xb},${yy} ${xb},${y + bh}`)); });
    return svg(x, y + bh + 34, parts);
  };
  def("l14-p3-a", stageDiag([["IF"], ["DEC"], ["EX"], ["WB"]], []));
  def("l14-p3-b", stageDiag([["IF"], ["DEC", "BYP"], ["EX"], ["WB"]], [], [["WB", "BYP"]]));
  const rows4 = (src) => Object.fromEntries(src.trim().split("\n").map((l) => { const [k, ...v] = l.trim().split(/\s+/); return [k, v.map((c) => (c === "." ? "" : c))]; }));
  def("l14-p3-pa", pipe({ start: 1, n: 11, rows: rows4(`
    IF  lw add addi addi addi blt lw lw lw add addi
    DEC . lw add add add addi blt blt blt lw add
    EXE . . lw NOP NOP add addi NOP NOP blt lw
    WB  . . . lw NOP NOP add addi NOP NOP blt`) }));
  def("l14-p3-pb", pipe({ start: 1, n: 11, rows: rows4(`
    IF  lw add addi addi blt lw lw add . . .
    DEC . lw add add addi blt blt lw add add .
    EXE . . lw NOP add addi NOP blt lw NOP add
    WB  . . . lw NOP add addi NOP blt lw NOP`) }));

  R["l14-p3"] = {
    statement: t`You are designing a four stage RISC-V processor (IF, DEC, EXE, WB). Currently you are trying to decide whether to include bypassing from the write-back stage to the decode stage. As part of this evaluation, you construct two processors:

**Processor A:** No bypass paths (i.e. no bypassing from WB and EXE to DEC).

**Processor B:** Bypassing from WB to DEC.

You are using the following loop of an important program to evaluate the performance of the processor:

~~~
L1:
lw t0, 0(a0)
add a1, a1, t0
addi a0, a0, 4
blt a0, a2, L1
~~~

For the following questions, assume this loop has been running for a long time.  Assume that both processors will always predict the direction of the [[blt]] correctly so there are no control hazards.

**(A)** How many cycles per loop iteration does the decode stage stall due to read after write hazards in the following cases?

**(B)** How many cycles does this loop take to execute in the following cases?

Processor A has the following propagation delays for each of the pipeline stages:

IF: 2 ns, DEC: 3.0 ns, EX: 3.5 ns, WB: 1.0 ns.

@fig l14-p3-a

The logic for the bypassing path of processor B can be viewed as taking the output from the DEC and WB stages of processor A and adding an additional bypass logic (BYP) as shown in the picture below.

@fig l14-p3-b

Assuming the BYP logic has a propagation delay of 1 ns and that all registers are ideal.

**(C)** What is the minimum clock period for each processor?

**(D)** For the loop shown above, what is the average cycles per instruction for the two processors:

**(E)** For the loop shown above, what is the average number of instructions per second for the two processors:`,
    solution: t`**(A)** Processor A: **4** decode stall cycles per iteration. Processor B: **2**.

**(B)** Processor A: **8** cycles per iteration. Processor B: **6**.

Processor A:

@fig l14-p3-pa

Processor B:

@fig l14-p3-pb

**(C)** Processor A: **3.5 ns**. Processor B: **4 ns**.

**(D)** Processor A: 8/4 = **2**. Processor B: 6/4 = **3/2**.

**(E)** Processor A: **1/(7 ns)**. Processor B: **1/(6 ns)**.

Instr/sec = 1/((cycles/instr)(sec/cycle)). A: 1/(2 × 3.5 ns) = 1/(7 ns). B: 1/((3/2) × 4 ns) = 1/(6 ns).`,
  };

  const rows4b = (src) => Object.fromEntries(src.trim().split("\n").map((l) => { const [k, ...v] = l.trim().split(/\s+/); return [k, v.map((c) => (c === "." ? "" : c))]; }));
  def("l14-p4-b", pipe({ start: 1, n: 9, rows: rows4b(`
    IF  addi beqz sub lw sw . . . .
    DEC . addi beqz sub lw sw sw . .
    EXE . . addi beqz sub lw NOP sw .
    WB  . . . addi beqz sub lw NOP sw`) }));
  def("l14-p4-c", pipe({ start: 0, n: 12, rows: rows4b(`
    IF  addi beqz andi sub lw lw lw sw . . . .
    DEC . addi beqz andi sub sub sub lw sw sw . .
    EXE . . addi beqz andi NOP NOP sub lw NOP sw .
    WB  . . . addi beqz andi NOP NOP sub lw NOP sw`) }));
  def("l14-p4-d", pipe({ start: 0, n: 14, cw: 42, rows: rows4b(`
    IF  addi beqz andi sub lw lw lw sw sw sw sw . . .
    DEC . addi beqz andi sub sub sub lw lw lw lw sw . .
    EXE . . addi beqz andi NOP NOP sub NOP NOP NOP lw sw .
    WB  . . . addi beqz andi NOP NOP sub NOP NOP NOP lw sw`) }));

  R["l14-p4"] = {
    statement: t`For the following questions, assume that you are running code on the 4-stage pipelined processor whose stages are shown below. As usual, there are registers between pipeline stages. Unless otherwise indicated, memory responds in the next cycle to any request. Also assume that there is no bypassing.

Instruction Fetch → Decode & Register File Read → Execute & Memory Request → Memory Response & Writeback to RF

The problems will ask about pipeline hazards; we will say a hazard is **observable** if it causes the pipeline to stall.

Note: For some problems it might be helpful to draw a pipeline diagram (IF, DEC, EXE, WB).

~~~
0x108       addi a4, a4, 1
0x10C       beqz a0, L0
0x110       andi a2, a1, 0x001
0x114   L0: sub  a3, a0, a2
0x118       lw   a5, 4(sp)
0x11C       sw   a3, 0(sp)
~~~

**(A)** Identify all the potential data hazards in the code above. The number at the beginning of each line corresponds to the address of that line of code. For each hazard, write Lines a and b if a register is written in the line at address a and read in the line at address b. If there are more spaces than you need, leave the extra spaces blank (the worksheet has four spaces, (1) to (4)).

For each of the scenarios below, whenever you are asked to list the observable hazards, specify the number to the left of the hazard you are referring to from part A. So, if the hazards labelled (1) and (3) in part A of your answer are observable, then enter 1, 3 as your observable hazards response. Enter None if there are no observable hazards.

**(B)** Which of the hazards from part A are observable when the branch (address 0x10C) is **taken** and is correctly predicted as being taken? How many nops are inserted (i.e., for how many cycles is the pipeline stalled)?

**(C)** Which of the hazards from part A are observable when the branch is **not taken** and is correctly predicted as being not taken? How many nops are inserted (i.e., for how many cycles is the pipeline stalled) in this case?

**(D)** Now reconsider part (C) where the branch is *not taken* and is correctly predicted as being not taken. However, this time assume that there is a cache miss fetching the [[lw]] instruction at address 0x118 causing [[lw]] to stall for 3 cycles in the DEC stage. Which hazards are now observable? How many nops are inserted in this case? Do not count the nops inserted due to the cache miss on the [[lw]] instruction fetch.

**(E)** Once again reconsider part (C) where the branch is *not taken* and is correctly predicted as being not taken. However, now suppose we add bypassing from the writeback stage to the decode stage. Now which hazards are observable? How many nops are in this case? Do not count the nops inserted due to the cache miss on the [[lw]] instruction fetch.`,
    solution: t`**(A)** (1) 0x110 → 0x114: andi writes a2, sub reads a2. (2) 0x114 → 0x11C: sub writes a3, sw reads a3.

**(B)** Observable: **2** (0x114-0x11C, sub & sw). Nops: **1**.

@fig l14-p4-b

**(C)** Observable: **1** (0x110-0x114, andi & sub) and **2** (0x114-0x11C, sub & sw). Nops: **3**.

@fig l14-p4-c

**(D)** Observable: **1** (0x110-0x114, andi & sub). Nops: **2**. The delay of the lw fetch lets sub complete by the time sw is in the DEC stage.

@fig l14-p4-d

**(E)** Observable: **1** (0x110-0x114, andi & sub). Nops: **1**. Bypass from WB to DEC saves one cycle for sub, so only 1 NOP instead of 2.`,
  };

  // ================================================================ L15

  // Pipeline rows from a compact string: one line per stage, "." for an empty cell, "#" shaded.
  const prow = (src) => Object.fromEntries(src.trim().split("\n").map((l) => { const [k, ...v] = l.trim().split(/\s+/); return [k, v.map((c) => (c === "." ? "" : c))]; }));
  const pblank = (start, n, first = "") => pipe({ start, n, rows: { IF: [first], DEC: [], EXE: [], MEM: [], WB: [] } });
  def("l15-p1-blank", pblank(300, 10));
  def("l15-p1-a", pipe({ start: 300, arrows: [["EXE", "DEC", 302], ["EXE", "DEC", 303], ["WB", "DEC", 304], ["WB", "DEC", 309]], rows: prow(`
    IF  addi slti beqz lw j lw sw bnez bnez bnez
    DEC NOP addi slti beqz lw NOP lw sw sw sw
    EXE NOP . addi slti beqz NOP NOP lw NOP NOP
    MEM bnez . . addi slti beqz NOP NOP lw NOP
    WB  sw . . . addi slti beqz NOP NOP lw`) }));
  def("l15-p1-e", pipe({ start: 300, arrows: [["EXE", "DEC", 302], ["EXE", "DEC", 303], ["WB", "DEC", 308]], rows: prow(`
    IF  addi slti beqz lw lw sw bnez bnez bnez addi
    DEC NOP addi slti beqz NOP lw sw sw sw bnez
    EXE bnez . addi slti beqz NOP lw NOP NOP sw
    MEM sw . . addi slti beqz NOP lw NOP NOP
    WB  NOP . . . addi slti beqz NOP lw NOP`) }));

  R["l15-p1"] = {
    statement: t`The loop below has been executing for a while on our standard 5-stage pipelined RISC-V processor with branch annulment and full bypassing.

~~~
    …
L1: addi x10, x10, -4
    slti x11, x10, 10
    beqz x11, L2
    lw x12, 0x200(x10)
    j L3
L2: lw x12, 0x300(x10)
L3: sw x12, 0x400(x0)
    bnez x10, L1
    addi x12, x12, 1
    xor x12, x12, x0
    …
~~~

@fig l15-p1-blank

**(A)** **Fill in the pipeline diagram** for cycles 301-309 assuming that at cycle 300 the instruction at L1 is fetched. Also, assume that the branch to L2 is taken, as well as the final branch back to L1. Finally, assume that the value for x10 is available in the register file prior to cycle 300. **Indicate which bypass/forwarding paths are active in each cycle by drawing a vertical arrow in the pipeline diagram** from pipeline stage X in a column to the RF stage in the same column if an operand would be bypassed from stage X back to the RF stage that cycle. Note that there may be more than one vertical arrow in a column.

**(B)** Assume that the previous iteration of the loop executed the same instructions as the iteration shown in part (A). Please complete the pipeline diagram for cycle 300 by filling in the OPCODEs for the instructions in the DEC, EXE, MEM, and WB stages.

**(C)** Indicate which branches are taken by providing the cycle in which the taken branch instruction enters the IF stage.

**(D)** During which cycle(s), if any, do we have stalled instructions?

Now consider a modified processor, P2, which has extra hardware in the decode stage (DEC) to resolve simple branches one cycle earlier: the decode stage includes both a circuit to check whether a register is equal to zero, and an extra adder to compute the branch target for taken branches. This processor can thus compute nextPC for [[beqz]] and [[bnez]] in DEC instead of EXE.

**(E)** Redo part A using processor P2 assuming the same path is taken through the code.

**(F)** Compare the number of cycles per loop iteration using the original processor and the modified processor.`,
    solution: t`**(A)** and **(B)** (cycle 300 is the answer to part B):

@fig l15-p1-a

**(C)** **302, 307.**

**(D)** **307, 308.**

**(E)**

@fig l15-p1-e

**(F)** Original processor: **12** cycles per loop. Processor P2: **10**.`,
  };

  def("l15-p2-c1", pipe({ start: 0, n: 7, rows: prow(`
    IF  addi jal slli addi add jr .
    DEC . addi jal NOP addi add jr
    EXE . . addi jal NOP addi add
    MEM . . . addi jal NOP addi
    WB  . . . . addi jal NOP`) }));

  R["l15-p2"] = {
    statement: t`You've discovered a secret room in the basement of the Stata center full of discarded 5-stage pipelined RISC-V processors. Unfortunately, many have certain defects. You discover that they fall into four categories:

- **C1:** A modified, completely functional 5-stage RISC-V processor with working bypass paths, annulment, and other components, as well as extra hardware support that allows the nextPC to be calculated in the Decode stage.
- **C2:** A defective version of **C1** with a bad register file: all data read from the register file is zero.
- **C3:** A defective version of **C1** with broken bypass muxes: all source operands come from the register file, even if they should be read from bypassed paths.
- **C4:** A defective version of **C1** without annulment of instructions following branches.

To help sort the processors into the above classes, you write the following small test program:

~~~
. = 0x0
// Start at 0x0, with ZERO
// in all registers…
    addi x10, x0, 4
    jal x12, X
    slli x12, x12, 1
X:  addi x12, x12, -4
    add x13, x12, x10
    jr x13
~~~

Your plan is to single-step through the program using each processor, carefully noting the address the final [[jr]] loads into the PC. Your goal is to determine which of the above four classes a chip falls into by this [[jr]] address.

For each class of RISC-V processor described above, specify the value that will be loaded into the PC by the final [[jr]] instruction.

Pipeline diagram showing first 7 cycles of test program executing on C1:

@fig l15-p2-c1`,
    solution: t`C1: **8**. C2: **4**. C3: **0**. C4: **16**.

| | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| after addi, jal | x10 = 4, x12 = 8 | x10 = 4, x12 = 8 | x10 = 4, x12 = 8 | x10 = 4, x12 = 8 |
| after slli | (annulled) | (annulled) | (annulled) | x12 = 16 |
| after addi (X) | x12 = 4 | x12 = 4 | x12 = −4 | x12 = 12 |
| after add | x13 = 8 | x13 = 4 | x13 = 0 | x13 = 16 |

For C2: the add wants x12 from a bypass (which works) and x10 from the register file (which reads as 0).`,
  };

  def("l15-p3-a", pipe({ start: 0, arrows: [["WB", "DEC", 4]], rows: prow(`
    IF  lw beqz add add add sub lw . . . .
    DEC . lw beqz beqz beqz add NOP lw . . .
    EXE . . lw NOP NOP beqz NOP NOP lw . .
    MEM . . . lw NOP NOP beqz NOP NOP lw .
    WB  . . . . lw NOP NOP beqz NOP NOP lw`) }));
  def("l15-p3-b", pipe({ start: 0, arrows: [["WB", "DEC", 4], ["EXE", "DEC", 6]], rows: prow(`
    IF  lw beqz add add add sub lw . . . .
    DEC . lw beqz beqz beqz add sub lw . . .
    EXE . . lw NOP NOP beqz add sub lw . .
    MEM . . . lw NOP NOP beqz add sub lw .
    WB  . . . . lw NOP NOP beqz add sub lw`) }));
  def("l15-p3-c", pipe({ start: 0, arrows: [["WB", "DEC", 4]], rows: prow(`
    IF  lw beqz add add add lw . . . . .
    DEC . lw beqz beqz beqz NOP lw . . . .
    EXE . . lw NOP NOP beqz NOP lw . . .
    MEM . . . lw NOP NOP beqz NOP lw . .
    WB  . . . . lw NOP NOP beqz NOP lw .`) }));
  def("l15-p3-d", pipe({ start: 0, cw: 42, arrows: [["WB", "DEC", 6]], rows: prow(`
    IF1  lw beqz add sub sub sub sub lw . . . . . .
    IF2  . lw beqz add add add add NOP lw . . . . .
    DEC  . . lw beqz beqz beqz beqz NOP NOP lw . . . .
    EXE  . . . lw NOP NOP NOP beqz NOP NOP lw . . .
    MEM1 . . . . lw NOP NOP NOP beqz NOP NOP lw . .
    MEM2 . . . . . lw NOP NOP NOP beqz NOP NOP lw .
    WB   . . . . . . lw NOP NOP NOP beqz NOP NOP lw`) }));

  R["l15-p3"] = {
    statement: t`**(A)** How many cycles does it take to run each iteration of the following loop (assuming the [[beqz]] is always taken) on a standard 5-stage pipelined RISC-V processor with branch annulment and full bypassing?

~~~
loop: lw x10, 0x100(x0)
      beqz x10, loop
      add x12, x10, x11
      sub x13, x12, x1
~~~

**(B)** Assuming a defective 5-stage pipelined RISC-V processor where the instructions following a taken branch are not annulled, which of the following statements would be true?

1. The [[add]] instruction would be executed each time through the loop.
2. The loop would take 5 cycles to execute.
3. The value of the register x10 that is tested by the [[beqz]] instruction comes from a bypass path.
4. The value of register x10 that is accessed by the [[add]] instruction comes from the register file.

**(C)** Consider a modified processor, P2, which has extra hardware for the special case of checking if a register is equal to zero or not in the decode stage, as well as computing the branch target i.e. the same P2 from Problem 1. What would be the number of cycles per loop iteration in this case?

**(D)** Now consider a third processor, P3, whose instruction and data memories are pipelined and take 2 clock cycles to respond. The IF and MEM stages have been broken up into sub-stages called IF1/IF2 and MEM1/MEM2 to account for this 2 cycle response time. P3 also has the extra hardware for checking if a register is equal to zero or not in the decode stage. What would be the number of cycles per loop iteration using P3?`,
    solution: t`**(A)** **6** cycles per iteration ([[lw]] is fetched in cycles 0 and 6).

@fig l15-p3-a

**(B)** Statements **1, 3, and 4** are true. (Statement 2 is false: the loop still takes 6 cycles.) For such a defective processor, the instruction flow diagram looks like this:

@fig l15-p3-b

**(C)** **5** cycles per iteration on P2.

@fig l15-p3-c

**(D)** **7** cycles per iteration on P3.

@fig l15-p3-d`,
  };

  def("l15-p4-a", pipe({ start: 0, cw: 50, rows: prow(`
    IF  lw NOP NOP NOP sll bnez NOP NOP lw/add
    DEC . lw NOP NOP NOP sll bnez NOP NOP
    EXE . . lw NOP NOP NOP sll bnez NOP
    MEM . . . lw NOP NOP NOP sll bnez
    WB  . . . . lw NOP NOP NOP sll`) }));
  def("l15-p4-b", pipe({ start: 0, arrows: [["WB", "DEC", 4]], rows: prow(`
    IF  lw sll bnez bnez bnez add NOP lw
    DEC . lw sll sll sll bnez add NOP
    EXE . . lw NOP NOP sll bnez NOP
    MEM . . . lw NOP NOP sll bnez
    WB  . . . . lw NOP NOP sll`) }));

  R["l15-p4"] = {
    statement: t`You've been given a 5-stage pipelined RISC-V processor. Unfortunately, the processor you've been given is defective: it has no bypass paths, branch annulment, or pipeline stalls.

~~~
      nop
      nop
      nop
      nop
loop:
      lw x10, 0x0(x10)
AA:
      sll x14, x10, x11
BB:
      bnez x10, loop
CC:
      add x13, x10, x13
      nop
      nop
      nop
      nop
~~~

You decide to modify this existing code written for a non-pipelined RISC-V processor to run on your defective pipelined processor. The code fragment provided is part of the program you need to adapt. Insert the minimum number of NOP (no operation) instructions at the labeled locations in the code to make it produce the same results on your defective pipelined RISC-V as it does on a standard non-pipelined RISC-V.

Note that the code scrap begins and ends with sequences of NOPs; thus, you don't need to worry about pipeline hazards involving interactions with instructions outside of the region shown.

**(A)** Specify the minimal number of **NOP** instructions (*defined as add x0, x0, x0*) to be added at each of the labeled points in the above program: Loop, AA, BB, and CC.

**(B)** On a **fully functional** 5-stage pipeline (with working bypass, annul, and stall logic), the above code will run fine with no added **NOP**s. How many clock cycles of execution time are required by the fully functional 5-stage pipelined RISC-V **for each iteration** through the loop?`,
    solution: t`**(A)** NOPs at Loop: **0**. At AA: **3**. At BB: **0**. At CC: **2**.

Below is a diagram of the instruction flow for this program. Note that nextPC is available in the execute stage of the bnez instruction even without bypassing.

@fig l15-p4-a

**(B)** **7** clocks per loop iteration. Below is a diagram of the instruction flow for this program.

@fig l15-p4-b`,
  };

  def("l15-p5-alyssa", stageDiag([["PRD", "IF"], ["DEC"], ["EXE"], ["MEM"], ["WB"]], [], [["DEC", "PRD"]]));
  def("l15-p5-ben", stageDiag([["IF"], ["DEC"], ["EXE"], ["MEM"], ["WB"]], []));
  def("l15-p5-blank", pblank(0, 11));
  def("l15-p5-bend", pipe({ start: 0, n: 11, rows: prow(`
    IF  lw bne addi addi addi addi blt xor slli lw .
    DEC . lw bne bne bne addi addi blt xor NOP .
    EXE . . lw NOP NOP bne addi addi blt NOP .
    MEM . . . lw NOP NOP bne addi addi blt .
    WB  . . . . lw NOP NOP bne addi addi .`) }));
  def("l15-p5-alyd", pipe({ start: 0, n: 11, rows: prow(`
    IF  lw bne addi addi addi addi blt lw . . .
    DEC . lw bne bne bne addi addi blt . . .
    EXE . . lw NOP NOP bne addi addi . . .
    MEM . . . lw NOP NOP bne addi . . .
    WB  . . . . lw NOP NOP bne . . .`) }));

  R["l15-p5"] = {
    statement: t`Ben Bitdiddle and Alyssa P. Hacker are building a five stage RISC-V processor to help grade 6.004 exams. Their pipeline has the standard stages and functionality presented in lecture (IF, DEC, EXE, MEM, and WB). You may assume that instruction and data memories are single-cycle memories with clocked reads and writes.

The following code segment simulates counting the number of correct answers on a question. It loads a student answer, increments the count if its correct, and then loops back to the next student.

~~~
...
grade_question:
    lw t0, 0(a2)                // load a student's answer
    bne t0, a1, next_student    // check answer; assume bne is NOT TAKEN
    addi t1, t1, 1              // increment num correct
next_student:
    addi a2, a2, 4
    blt a2, a3, grade_question  // next student; assume blt is ALWAYS TAKEN
next_question:
    xor a4, a0, a4
    slli a4, a4, 2
...
~~~

6.004 students are doing well on the exam and are all getting the questions right, so **the bne branch is never taken**. Also, the processor is in the middle of grading exams, so **the blt branch is always taken.**

Ben starts out with a fully functional 5-stage RISC-V processor with **full bypassing and annulment hardware**. Assume branch decisions are made in the EXE stage. Ben's processor always speculates that nextPC will be PC + 4.

Alyssa thinks she can achieve better performance with a smarter branch predictor to better handle loops. Her processor includes additional hardware to speculate that the branch is not taken (i.e. nextPC = PC + 4) on all forward branches (i.e. the branch target address is greater than the current PC) and that the branch is taken on all backwards branches. More formally:

$$nextPC = \begin{cases} PC + immB, & immB \le 0 \\ PC + 4, & immB > 0 \end{cases}$$

When the branch is detected in the DEC stage, the hardware will make its prediction based on immB and impact the instruction fetched **in that same cycle**. The following schematic shows the position of the prediction logic (PRD). The orange bars represent the pipeline registers.

@fig l15-p5-alyssa

The following pipeline diagram may be useful. You are not required to fill it out.

@fig l15-p5-blank

**(A)** How many cycles does this loop take to execute in each of the processors?

**(B)** Within one iteration of this loop, how many instructions need to be annulled due to incorrect speculation?

**(C)** For this loop, what is the average cycles per instruction (CPI) for each of the processors?

The logic for Ben's processor is shown below with the orange bars representing pipeline registers.

@fig l15-p5-ben

The logic for the additional hardware that Alyssa added can be viewed as taking values from the DEC stage and adding additional prediction logic (PRD) as shown below (diagram copied from above).

@fig l15-p5-alyssa

Assume that all registers are ideal ($t_{SETUP} = t_{HOLD} = t_{PD} = t_{CD} = 0$ ns) and each pipeline stage/piece of combinational logic has the following propagation delays.

| Logic | Delay |
|---|---|
| PRD | 1 ns |
| IF | 3 ns |
| DEC | 4 ns |
| EXE | 7 ns |
| MEM | 5 ns |
| WB | 2 ns |

**(D)** What is the minimum clock period for each processor?

**(E)** Which processor takes less time to execute one iteration of this loop, and how much faster is it?`,
    solution: t`Ben's pipeline diagram:

@fig l15-p5-bend

Alyssa's pipeline diagram:

@fig l15-p5-alyd

**(A)** Ben: **9** cycles per iteration. Alyssa: **7**.

**(B)** Annulled instructions: Ben **2**, Alyssa **0**.

**(C)** Average CPI: Ben **9/5**, Alyssa **7/5**.

**(D)** Minimum clock period: Ben **7 ns** (EXE). Alyssa **8 ns** (DEC → PRD → IF: 4 + 1 + 3).

**(E)** **Alyssa's** processor is faster, by **7 ns** per iteration: $9 \cdot 7 = 63$ ns against $7 \cdot 8 = 56$ ns.`,
  };

  def("l15-p6-blank", pblank(1, 14, "addi"));
  def("l15-p6-a", pipe({ start: 1, n: 14, cw: 42, arrows: [["EXE", "DEC", 3], ["EXE", "DEC", 4], ["EXE", "DEC", 5], ["WB", "DEC", 8], ["EXE", "DEC", 12]], rows: prow(`
    IF  addi slli add lw bge mv mv mv ori addi blt add add add
    DEC . addi slli add lw bge bge bge mv NOP addi blt add NOP
    EXE . . addi slli add lw NOP NOP bge NOP NOP addi blt NOP
    MEM . . . addi slli add lw NOP NOP bge NOP NOP addi blt
    WB  . . . . addi slli add lw NOP NOP bge NOP NOP addi`) }));
  def("l15-p6-d", pipe({ start: 1, n: 14, cw: 42, rows: prow(`
    IF  addi slli add add add add lw lw lw lw bge bge bge bge
    DEC . addi slli slli slli slli add add add add lw lw lw lw
    EXE . . addi NOP NOP NOP slli NOP NOP NOP add NOP NOP NOP
    MEM . . . addi NOP NOP NOP slli NOP NOP NOP add NOP NOP
    WB  . . . . addi NOP NOP NOP slli NOP NOP NOP add NOP`) }));

  R["l15-p6"] = {
    statement: t`Val wants to have a Thanksgiving party, but there's a nasty virus going around. Instead, she will buy the most expensive vegan turkey, a tomato, and a celery. She is at Whole Foods. She already knows that she can buy a vegan turkey for \$10 at Wal-Mart, so she will be looking for something more expensive. Val wants to figure out how much her vegan meal will cost so she writes some C code, before converting it into assembly (shown below). Assume the registers are initialized to the values specified in the assembly code comments.

**C code**

~~~
int price[6] = {7, 5, 8, 10, 15, 7};
int maximum = 10;
int celery = 3;
int tomato = 5;
for (int i = 0; i < 6; i++) {
    if (price[i] > maximum)
        maximum = price[i];
}
int total_cost = maximum + celery
                 + tomato;
~~~

**Assembly code**

~~~
// x4 = 0x24  - length of price in bytes
// x5 = 0x3   - celery
// x6 = 0x5   - tomato
// x7 = 0xA   - maximum
// x1 = 0x400 - address of price[0]

start:  addi x2, x0, 0
        slli x2, x2, 2
loop:   add  x8, x2, x1
        lw x3, 0(x8)
        bge x7, x3, skip
        mv x7, x3
        ori x7, x7, 0
skip:   addi x2, x2, 4
        blt x2, x4, loop
        add x7, x7, x5
        add x7, x7, x6
~~~

In the following five-stage pipelined RISC-V processor (IF, DEC, EXE, MEM, WB):

- All branches are predicted not-taken. (Always fetch from PC + 4).
- Branch decisions are made in the EXE stage.
- The pipeline has **full bypassing**.
- The processor annuls instructions following taken branches.
- Assume that in the first iteration of the loop **both branches are taken.**

**(A)** Her program just started running "start". **Fill in the pipeline diagram for the first 14 cycles. Show all bypasses used in each cycle.**

@fig l15-p6-blank

**(B)** How many cycles did it take to execute the first loop iteration on this processor? Make sure not to include the first two instructions at label [[start]] in your cycle count.

**(C)** If you could modify your fetch stage to always fetch the correct next instruction instead of predicting all branches not taken, how many cycles will it now take to execute the first iteration of the loop on this modified processor? Explain your answer.

**(D)** Val spent so much money on vegan turkey that she couldn't afford a processor with bypassing. In the cheapo processor she bought, **all data hazards are resolved by stalling.** Also, once again, **all branches are predicted not taken.**

Her program just started running "start". **Fill in the pipeline diagram for the first 14 cycles:**

@fig l15-p6-blank

**(E)** How many cycles did it take to execute the first loop on this processor? Hint: To answer this question use the bypass and stall information you determined in parts (A) and (D) to calculate how many cycles the first iteration of the loop would take on the cheapo processor. **Explain how you arrived at your solution.**`,
    solution: t`**(A)**

@fig l15-p6-a

**(B)** **11** cycles.

**(C)** **7.** Fetching the correct next instruction removes both branch annulments, so it saves 4 cycles, making the cycles per iteration 11 − 4 = 7.

**(D)**

@fig l15-p6-d

**(E)** **24.** Without bypasses, there is a 3-cycle penalty for each EXE → DEC bypass used in the bypassed pipeline, and a 1-cycle penalty for every WB → DEC bypass used. In part B there were 4 EXE → DEC bypasses and 1 WB → DEC bypass, so cycles = 11 + 4·3 + 1·1 = 24.`,
  };

  // The Twofer 6-stage pipeline (simplified sketch: units, pipeline registers, main data flow).
  def("l15-twofer", svg(730, 220,
    ...[["IF", 70], ["DEC", 200], ["EXA", 330], ["EXB", 458], ["MEM", 570], ["WB", 672]].map(([l, x]) => tx(x, 14, l, { s: 15 })),
    ...[122, 258, 390, 522, 620].map((x) => box(x, 30, 8, 180, "", { r: 1, c: "acc" })),
    box(16, 64, 20, 70, "", { r: 2 }), tx(26, 99, "PC", { s: 11, rot: -90 }), w("26,150 26,134"), tx(36, 160, "nextPC", { a: "start", s: 11, i: true }),
    w("36,84 50,84"), box(50, 64, 64, 40, "Instr\nCache", { s: 11, r: 2 }), w("114,84 122,84"),
    box(136, 50, 24, 156, "", { r: 2 }), tx(148, 128, "Decode", { s: 11, rot: -90 }), w("130,84 136,84"),
    box(172, 64, 76, 38, "RegFileA\n(x0-x15)", { s: 10, r: 2 }), w("160,83 172,83"), w("248,83 258,83"),
    box(276, 50, 84, 56, "ExecuteA", { s: 11, r: 2 }), w("266,78 276,78"), w("360,78 390,78"),
    box(276, 150, 84, 40, "RegFileB\n(x16-x31)", { s: 10, r: 2 }), w("266,170 276,170"), w("160,180 258,180"),
    box(364, 150, 10, 40, "", { r: 1, c: "acc" }), w("360,170 364,170"), w("374,170 390,170"),
    box(404, 140, 84, 56, "ExecuteB", { s: 11, r: 2 }), w("398,168 404,168"), w("488,168 522,168"),
    line("398,78 510,78"), w("510,78 522,78"),
    box(530, 70, 12, 28, "", { r: 1 }), box(530, 150, 12, 28, "", { r: 1 }), w("542,84 556,110"),
    box(556, 100, 56, 54, "Data\nCache", { s: 11, r: 2 }), w("542,164 556,140"), w("612,127 620,127"),
    box(632, 60, 12, 28, "", { r: 1 }), box(632, 150, 12, 28, "", { r: 1 }), w("628,100 632,74"), w("628,150 632,164"),
    box(650, 56, 74, 36, "RegFileA\n(x0-x15)", { s: 10, r: 2 }), w("644,74 650,74"),
    box(650, 146, 74, 36, "RegFileB\n(x16-x31)", { s: 10, r: 2 }), w("644,164 650,164")));
  const byp = (n = 3) => "| Value of reg | Bypassed from | Bypassed to |\n|---|---|---|\n" + Array(n).fill("| | | |").join("\n");

  R["l15-p7"] = {
    statement: t`Piper Twain is building a RISC-V processor to accelerate machine learning applications in low-power systems. These applications execute mostly ALU operations, so Piper is building the *Twofer*, a new processor that can perform two ALU operations in a single instruction. She is imposing some restrictions on these operations to make the Twofer's implementation very cheap: the processor requires two ALUs but avoids using register files with many ports.

To this end, Piper designs a new RISC-V instruction type, **D-type** (for double-op), that encodes two ALU operations. In assembly, a D-type instruction is written as two operations separated by a semicolon:

~~~
aop ard, ars1, ars2; bop brd, brs1, brs2
~~~

For instance, the following two examples are valid D-type instructions:

~~~
(1)   add x3, x2, x1; sub x27, x18, x25
(2)   and x18, x2, x1; xor x7, x18, x25
~~~

These fields have the following semantics and restrictions:

- The operations ([[aop, bop]]) can be any of the 10 ALU operations for R-type instructions ([[add, sub, sll, srl, sra, slt, sltu, and, or, xor]]).
- The source registers for operation A ([[ars1,ars2]]) must be within the top (lower index) 16 registers ([[x0-x15]]); and the source registers for operation B ([[brs1,brs2]]) must be within the bottom (higher index) 16 registers ([[x16-x31]]).
- The destination registers for operations A and B must be in separate halves of the registers: one operation must write to the top half of the registers ([[x0-x15]]), and the other must write to the bottom half ([[x16-x31]]), but [[ard]] and [[brd]] must never be in the same half.
- Within the same instruction, both operations have serial semantics. That is, if operation A writes to a register that operation B reads, operation B uses the value written by operation A (this may only happen if A writes to a bottom-half register and B writes to a top-half register). For example, in example (2) above, A ([[and]]) writes to [[x18]], and B ([[xor]]) reads [[x18]]. The [[xor]] operation should use the value of [[x18]] produced by the [[and]] operation.

D-type instructions can be encoded in 32 bits and added to a RISC-V processor, but their specific encoding is not needed for this problem.

Piper has designed the following 6-stage pipeline for the Twofer:

@fig l15-twofer

This pipeline uses two separate register files, RegFileA and RegFileB, which hold the top and bottom halves of the RISC-V registers. Each of these register files has only 2 read ports and 1 write port, and 16 registers, so together they are as cheap as the standard 32-register RISC-V register file.

The IF and MEM stages are like those in the standard 5-stage pipeline. The DEC stage reads the source registers for operation A (from RegFileA). The EXA stage executes operation A and, in parallel, reads the source registers for operation B (from RegFileB). The EXB stage executes operation B. Both results are sent down to the MEM stage. Finally, the WB stage writes to both RegFileA and RegFileB; because operations A and B cannot both write to the same register file, a single write port suffices for each.

Having operations A and B happen in separate stages makes implementing serial semantics easy: if operation A writes to one of the source registers of operation B, the muxes at the outputs of RegFileB (orange in the figure) pass this updated value to EXB.

Beyond D-type instructions, this pipeline supports all other RISC-V instruction types. *Other instructions execute on EXA or EXB depending on the registers they use.* Every instruction performs its operation in EXA if its source register(s) are in the top half, and in EXB if in the bottom half. For instructions with two source registers in separate halves (this includes register-register ALU and branch instructions), one of the source registers is read in DEC, the other in EXA, and execution happens in EXB.

You don't need to draw pipeline diagrams to answer the following questions, and we recommend you don't.

**(A)** For each of the following code fragments, find out how many cycles are lost to stalls due to data hazards. **Assume full bypassing**, and for each example, list **all** bypass paths are used, if any. Note that bypassing here is more involved than in the 5-stage pipeline: bypassed data is not only routed to DEC. For each bypass path used, fill the given table to list the register whose value is bypassed and the stages it is bypassed from and to.

*Note:* **Bypassing always happens from a later to an earlier pipeline stage, so the muxes in EXA used to implement serial semantics on operations A and B are not a bypass.**

Example:

~~~
lw x20, 0(x2)
add x16, x20, x22
~~~

Cycles lost to stalls: 2. Bypass paths (since [[add]] runs on EXB):

| Value of reg | Bypassed from | Bypassed to |
|---|---|---|
| x20 | WB | EXA |

Fragments:

~~~
1. lw x2, 0(x2)
   add x2, x2, x2

2. add x1, x2, x1; or x17, x18, x17
   sub x1, x2, x1; xor x17, x18, x17

3. add x1, x2, x1; or x19, x18, x17
   add x17, x1, x19

4. add x18, x2, x1; or x1, x18, x17
   add x1, x2, x1
~~~

**(B)** Assume that the pipeline always predicts branches not taken. What is the minimum and maximum number of cycles lost to taken branches in this pipeline? Briefly explain what causes this penalty. How would you write code to minimize this penalty?

**(C)** Consider the following RISC-V code. Assume that the pipeline has full bypassing and that the branch at the end of the loop is predicted taken, so that in steady state there are no cycles lost to control hazards. Rewrite the four R-type instructions shaded in grey (marked below), using D-type instructions to maximize performance. In steady state, how many cycles does each loop iteration take, in both the original code and your code?

- You may have to change the registers used by these instructions to maximize performance.
- Registers x4, x5, x6, and x7 are written and read only by these instructions.
- Registers x10, x11, and x12 hold constant values. These constants are replicated in x20, x21, and x22, so you can use x20 in place of x10, etc.
- You may not modify the code (instructions or registers) outside of the shaded block.

~~~
loop: lw x16, 0(x1)
      addi x1, x1, 4
      srl x4, x16, x10     // shaded
      sll x5, x7, x11      // shaded
      or x6, x5, x12       // shaded
      xor x7, x6, x4       // shaded
      blt x1, x13, loop
~~~

**(D)** Bypasses are expensive, so Piper is considering not implementing them. Are there any RISC-V instruction sequences that would incur some stalls in a conventional 5-stage pipeline without bypasses but that, when modified to use D-type instructions, would incur fewer stalls in the Twofer 6-stage pipeline without bypasses? If so, give such a sequence; in any case, briefly explain why or why not.`,
    solution: t`**(A)**

1. Cycles lost: **3** ([[add]] runs on EXA in this case).

| Value of reg | Bypassed from | Bypassed to |
|---|---|---|
| x2 | WB | DEC |

2. Cycles lost: **0**.

| Value of reg | Bypassed from | Bypassed to |
|---|---|---|
| x1 | EXA | DEC |
| x17 | EXB | EXA |

3. Cycles lost: **0** ([[add]] runs on EXB). Note the bypasses happen on different cycles. It's also correct to say the x1 value is bypassed from EXB to EXA (then both bypasses would be in the same cycle).

| Value of reg | Bypassed from | Bypassed to |
|---|---|---|
| x1 | EXA | DEC |
| x19 | EXB | EXA |

4. Cycles lost: **1** ([[add]] runs on EXA).

| Value of reg | Bypassed from | Bypassed to |
|---|---|---|
| x1 | EXB | DEC |

**(B)** Minimum: **2**. Maximum: **3**. This penalty depends on whether branches are resolved in EXA (2 cycles) or EXB (3 cycles). To minimize this penalty, we should use branches that run on EXA, by operating on the top half of the registers (x0-x15).

**(C)**

~~~
sll x5, x7, x11; srl x17, x16, x20
or x18, x5, x12; xor x7, x18, x17
~~~

(x17 and x18 can be any bottom-half registers.)

Original code: **8** cycles per iteration (7 instructions + 1 stall cycle due to the lw → srl dependency, as srl runs on EXB). Modified code: **6** (5 instructions + 1 stall cycle due to the lw → srl dependency).

**(D)** **Yes.** The following pair of instructions:

~~~
add x16, x1, x1
add x1, x16, x16
~~~

suffers a 3-cycle stall on the 5-stage pipeline, while the equivalent D-type instruction:

~~~
add x16, x1, x1; add x1, x16, x16
~~~

has no stalls.`,
  };

  def("l15-p8-full", stageDiag([["IF"], ["DEC"], ["EXE"], ["MEM"], ["WB"]], [["EXE", "DEC"], ["MEM", "DEC"], ["WB", "DEC"]]));
  def("l15-p8-extra", stageDiag([["IF"], ["DEC"], ["EXE"], ["MEM"], ["WB"]], [["EXE", "DEC"], ["MEM", "DEC"], ["WB", "DEC"]],
    [["MEM", "EXE"], ["WB", "EXE"], ["WB", "MEM"]]));
  def("l15-p8-acexm", stageDiag([["IF"], ["DEC"], ["AC"], ["EXM"], ["WB"]], [["EXM", "DEC"], ["WB", "DEC"]], [["EXM", "AC"], ["WB", "AC"], ["WB", "EXM"]]));
  const p8blank = () => pipe({ start: 100, n: 10, rows: { IF: [], DEC: ["#"], EXE: ["#", "#"], MEM: ["#", "#", "#"], WB: ["#", "#", "#", "#"] } });
  def("l15-p8-blank", p8blank());
  def("l15-p8-a", pipe({ start: 100, arrows: [["WB", "DEC", 104], ["WB", "DEC", 105]], rows: prow(`
    IF  lw lw add bnez bnez mv addi lw lw add
    DEC # lw lw add add bnez mv NOP lw lw
    EXE # # lw lw NOP add bnez NOP NOP lw
    MEM # # # lw lw NOP add bnez NOP NOP
    WB  # # # # lw lw NOP add bnez NOP`) }));
  def("l15-p8-c", pipe({ start: 100, arrows: [["WB", "EXE", 104], ["WB", "EXE", 105], ["MEM", "DEC", 105]], rows: prow(`
    IF  lw lw add bnez mv addi ret lw lw add
    DEC # lw lw add bnez mv addi NOP lw lw
    AC  # # lw lw add bnez mv NOP NOP lw
    EXM # # # lw lw add bnez NOP NOP NOP
    WB  # # # # lw lw add bnez NOP NOP`) }));
  def("l15-p8-blank-c", pipe({ start: 100, n: 10, rows: { IF: [], DEC: ["#"], AC: ["#", "#"], EXM: ["#", "#", "#"], WB: ["#", "#", "#", "#"] } }));
  const LLOOP = t`~~~
loop: lw a1, 0(a0)
      lw a0, 4(a0)
      add a2, a2, a1
      bnez a0, loop
      mv a0, a2
      addi sp, sp, 8
      ret
~~~`;

  R["l15-p8"] = {
    statement: t`Consider the loop below, which sums the values in a linked list. We run this code on a standard 5-stage RISC-V processor with full bypassing. Assume that branches are always predicted not taken and that branch decisions are made in the EXE stage. Assume that the loop repeats many times and it's currently in the middle of its execution.

${LLOOP}

**(A)** (7 points) Fill in the pipeline diagram for cycles 100-109, assuming that at cycle 100 the [[lw a1, 0(a0)]] instruction is fetched. **Draw arrows indicating each use of bypassing.** Ignore any cells shaded in gray.

@fig l15-p8-blank

How many cycles does each iteration of the loop take? For each loop iteration, how many cycles are wasted due to stalls? How many are wasted due to annulments?

Ben Bitdiddle is looking to improve the performance of his processor. He observes that it is possible to save some cycles with extra bypass paths. Despite its name, *full* bypassing is not using as many bypasses as possible: it is bypassing to DEC from all later stages, but it is only bypassing to DEC. Sometimes, instructions do not need their inputs in the EXE stage, but at a later stage, and stalling on DEC wastes cycles.

To solve this, Ben proposes a new bypassing scheme called **extra bypassing**. In extra bypassing:

- There is a bypass path from each stage to DEC and all other stages between DEC and the source of the bypass. For example, the 5-stage pipeline has paths EXE->DEC, MEM->DEC, WB->DEC, MEM->EXE, WB->EXE, and WB->MEM. (Note full bypassing has only the first 3 of these paths.)
- As usual, each bypass path bypasses to the end of the stage (e.g., MEM->DEC bypasses to the end of DEC, right before the DEC-EXE pipeline register and after register reads, and MEM->EXE bypasses to the end of EXE, right before the EXE-MEM pipeline register and after the ALU).
- If an instruction depends on a value produced by an earlier instruction, and the value is still not available (on either the register file or a bypass path), the instruction *does not stall until the stage before where the value is needed*. For example, if a value is needed in EXE and has not been produced yet, the instruction will stall in DEC (as with full bypassing). But if the value is needed in MEM, the instruction will proceed from DEC to EXE, and stall in EXE until the value becomes available through a bypass path.
- Instructions capture missing inputs from bypass paths on the first opportunity they get, even if they are stalled for other reasons. (This ensures that, if an instruction advances past DEC, it always gets to bypass the correct input value before it needs it.)

The diagrams below show the bypass paths in full vs. extra bypassing.

**Pipeline with full bypassing**

@fig l15-p8-full

**Pipeline with extra bypassing**

@fig l15-p8-extra

**(B)** (4 points) Give an example 2-instruction sequence that incurs two cycles worth of stalls with full bypassing, but only one cycle with extra bypassing. Specify which bypass paths are exercised in each case.

To better leverage extra bypassing, Ben implements a new 5-stage pipeline, shown below, where **the ALU is placed in the fourth stage**:

- In this pipeline, the first two stages, IF and DEC, work as in the standard 5-stage pipeline; the third stage, AC, performs address calculation for loads and stores; the fourth stage, EXM, performs ALU operations and data accesses; and the fifth stage, WB, works as in the standard pipeline.
- Branches are predicted not-taken and resolved in the EXM stage.
- The pipeline has extra bypassing.

@fig l15-p8-acexm

Consider again the code from part (A):

${LLOOP}

**(C)** (7 points) Fill in the pipeline diagram for cycles 100-109, assuming that at cycle 100 the [[lw a1, 0(a0)]] instruction is fetched. **Draw arrows indicating each use of bypassing.** Ignore any cells shaded in gray. **Recall that the Execute module is in the EXM pipeline stage.**

@fig l15-p8-blank-c

How many cycles does each iteration of the loop take? For each loop iteration, how many cycles are wasted due to stalls? How many are wasted due to annulments?`,
    solution: t`**(A)**

@fig l15-p8-a

Cycles per loop iteration: **7**. Wasted due to stalls: **1**. Wasted due to annulments: **2**.

**(B)**

~~~
lw a1, 0(a0)
sw a1, 0(a2)
~~~

Bypass paths exercised with full bypassing: **WB->DEC**. With extra bypassing: **WB->EXE**.

**(C)**

@fig l15-p8-c

Cycles per loop iteration: **7**. Wasted due to stalls: **0**. Wasted due to annulments: **3**.`,
  };

})(typeof window !== "undefined" ? window : globalThis);
