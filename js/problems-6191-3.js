// Problem bank for 6.191 Computation Structures (Fall 2026), part 3: L13-L15
// (caches, pipelined processors, data and control hazards).
// Cache answers were checked with a cache simulator (LRU, write-back, write-allocate), and
// pipeline answers with a timing model of the 6.191 5-stage pipeline: branches resolve in EXE,
// predict not-taken, annul two instructions on a taken branch or jump, load data is bypassed
// from WB, and without bypassing a register is read in DEC only after the writer leaves WB.
(function (root) {
  const t = String.raw;
  const P = [];
  const add = (p) => P.push(p);

  const PIPE = t`Assume the standard 6.191 5-stage pipeline (IF, DEC, EXE, MEM, WB): registers are read in DEC and written in WB; branches and jumps resolve in EXE; the processor predicts not-taken and annuls the two younger instructions after a taken branch or jump; a load's data is available for bypassing in WB.`;

  // ---------- L13: caches
  add({ id: 1201, lec: 13, title: "Which Line to Check", diff: "Easy", topics: ["Caches", "Address Breakdown"], answer: "41",
    statement: t`A direct-mapped cache has 64 lines with a block size of 1 word. Which line does [[lw x2, 0x5A4(x0)]] check?`,
    hints: [t`Drop the 2 byte-offset bits, then take the low 6 bits.`],
    solution: t`The word address is [[0x5A4 >> 2 = 0x169]] $= 361$. The line is $361 \bmod 64 = 41$.` });

  add({ id: 1202, lec: 13, title: "Tag of an Address", diff: "Easy", topics: ["Caches", "Address Breakdown"], answer: "0x5",
    statement: t`Same cache as the previous problem: 64 lines, 1 word per line. What tag does address [[0x5A4]] have? Answer in hex.`,
    hints: [t`The tag is the address bits above the 6 index bits and 2 byte-offset bits.`],
    solution: t`[[0x5A4 >> 8 = 0x5]].` });

  add({ id: 1203, lec: 13, title: "Set Index in a 2-Way Cache", diff: "Medium", topics: ["Caches", "Set Associativity", "Address Breakdown"], answer: "3",
    statement: t`A 2-way set-associative cache holds 128 words in blocks of 4 words. Which set does byte address [[0x1234]] map to?`,
    hints: [t`$128 / 4 / 2 = 16$ sets, so 4 index bits. The offset is 4 bits (2 byte bits and 2 word bits).`],
    solution: t`The index is bits $[7:4]$ of the address: [[(0x1234 >> 4) & 0xF = 0x123 & 0xF = 3]].` });

  add({ id: 1204, lec: 13, title: "Index Bits: DM vs 2-Way", diff: "Medium", topics: ["Caches", "Set Associativity"], answer: "6",
    statement: t`A data cache holds 64 words in blocks of 4 words, with 32-bit byte addresses. If it is 2-way set-associative, its set index is the address bits $A[h:4]$. What is $h$?`,
    hints: [t`The 2-way cache has $64/4/2 = 8$ sets.`],
    solution: t`8 sets need 3 index bits, which sit right above the 4 offset bits: $A[6:4]$. So $h_2 = 6$. (The direct-mapped cache has 16 lines and uses $A[7:4]$.)` });

  add({ id: 1205, lec: 13, title: "Three Arrays, Direct Mapped", diff: "Hard", topics: ["Caches", "Conflict Misses"], answer: "1/4",
    statement: t`A data cache holds 64 words with a block size of 4 words. It is direct mapped. This loop runs from an empty cache (count only data accesses):

~~~
      mv   x1, x0
      li   x2, 128
loop: lw   x3, 0x100(x1)   // A
      lw   x4, 0x180(x1)   // B
      add  x5, x3, x4
      sw   x5, 0x200(x1)   // C
      addi x1, x1, 4
      blt  x1, x2, loop
~~~

What is the data hit ratio?`,
    hints: [t`The cache is 256 bytes. [[0x100]] and [[0x200]] map to the same lines. [[0x180]] maps to other lines.`],
    solution: t`A and C evict each other every iteration, so those accesses always miss. B misses once per 4-word block and then hits 3 times. Over 4 iterations there are 12 accesses and 3 hits, so the hit ratio is $1/4$. (Spring 2026 Quiz 2 used this setup.)` });

  add({ id: 1206, lec: 13, title: "Three Arrays, 2-Way LRU", diff: "Hard", topics: ["Caches", "Set Associativity", "LRU"], answer: "0",
    statement: t`Use the loop from the previous problem, but now the 64-word cache (block size 4) is 2-way set-associative with LRU replacement. What is the data hit ratio?`,
    hints: [t`With 8 sets, the cache is 128 bytes per way. All three arrays map to the same set.`],
    solution: t`A, B and C fight over a 2-way set. Each new block evicts the least recently used one, which is always the next one needed. Every access misses, so the hit ratio is $0$.` });

  add({ id: 1207, lec: 13, title: "Three Arrays, 4-Way LRU", diff: "Medium", topics: ["Caches", "Set Associativity"], answer: "3/4",
    statement: t`Use the same loop, but the 64-word cache (block size 4) is now 4-way set-associative with LRU. What is the data hit ratio?`,
    hints: [t`Now the three blocks fit in one set.`],
    solution: t`All three current blocks fit, so each block misses once and then hits 3 times: $3/4$.` });

  add({ id: 1208, lec: 13, title: "Read-Modify-Write Loop", diff: "Medium", topics: ["Caches", "Block Size"], answer: "15/16",
    statement: t`A direct-mapped data cache holds 64 words with a block size of 8 words. This loop runs once over a 32-word array from an empty cache:

~~~
loop: lw   x3, 0x100(x1)
      addi x3, x3, 1
      sw   x3, 0x100(x1)
      addi x1, x1, 4
      blt  x1, x2, loop
~~~

What is the data hit ratio?`,
    hints: [t`For block size $B$, each block gives 1 miss and $2B - 1$ hits.`],
    solution: t`Each 8-word block has 16 accesses: the first [[lw]] misses, and the other 15 hit. The hit ratio is $(2B - 1)/(2B) = 15/16$.` });

  add({ id: 1209, lec: 13, title: "Find the Block Size", diff: "Medium", topics: ["Caches", "Block Size"], answer: "4",
    statement: t`For the loop in the previous problem, you measure a data hit ratio of $7/8$. What is the block size, in words?`,
    hints: [t`Solve $(2B - 1)/(2B) = 7/8$.`],
    solution: t`$16B - 8 = 14B$, so $B = 4$ words.` });

  add({ id: 1210, lec: 13, title: "Copying Between Conflicting Arrays", diff: "Medium", topics: ["Caches", "Conflict Misses"], answer: "1/2",
    statement: t`A data cache holds 64 words with a block size of 2. This loop copies 16 words from [[0x400]] to [[0x800]]:

~~~
loop: lw   x3, 0x400(x1)
      sw   x3, 0x800(x1)
      addi x1, x1, 4
      blt  x1, x2, loop
~~~

If the cache is direct mapped, every access misses. What is the data hit ratio if the cache is 2-way set-associative with LRU?`,
    hints: [t`Both arrays map to the same set, but a set now has room for both blocks.`],
    solution: t`The first access to each block misses and the second hits. Each block of 2 words gets 1 miss and 1 hit for A, and the same for B. The hit ratio is $1/2$.` });

  add({ id: 1211, lec: 13, title: "LRU Can Lose", diff: "Hard", topics: ["Caches", "LRU", "Set Associativity"], answer: "1",
    statement: t`A cache holds 8 one-word blocks. Consider the byte addresses [[0x0, 0x10, 0x20, 0x0, 0x10, 0x30, 0x0, 0x20, 0x4, 0x14, 0x0]] from an empty cache. A direct-mapped version gets 2 hits. How many hits does a 2-way set-associative version with LRU get?`,
    hints: [t`2-way means 4 sets. Set $= (\text{addr} \gg 2) \bmod 4$. Addresses [[0x0, 0x10, 0x20, 0x30]] all map to set 0.`],
    solution: t`Set 0 sees 0, 10, 20, 0, 10, 30, 0, 20, then 0 at the end. With 2 ways and LRU, each of the first 8 accesses misses. Before the final access the set holds 0 and 20, so the last [[0x0]] hits. [[0x4]] and [[0x14]] go to set 1 and miss. That is $1$ hit. Associativity does not always help.` });

  add({ id: 1212, lec: 13, title: "Fully Associative Hits", diff: "Medium", topics: ["Caches", "LRU"], answer: "5",
    statement: t`Use the address sequence from the previous problem with a fully associative cache of 8 one-word blocks (LRU). How many hits?`,
    hints: [t`Only 6 distinct addresses appear, so nothing is evicted.`],
    solution: t`There are 6 distinct addresses, so 6 compulsory misses and $11 - 6 = 5$ hits.` });

  add({ id: 1213, lec: 13, title: "Write-Backs", diff: "Medium", topics: ["Caches", "Write-Back"], answer: "4",
    statement: t`A direct-mapped, write-back, write-allocate cache has 4 one-word lines and starts empty. How many words are written back to memory during these accesses? [[sw 0x0]], [[sw 0x10]], [[lw 0x0]], [[sw 0x4]], [[lw 0x14]], [[lw 0x4]], [[sw 0x20]], [[lw 0x0]]`,
    hints: [t`Line $= (\text{addr} \gg 2) \bmod 4$. A write-back happens only when a dirty line is evicted.`],
    solution: t`Line 0 gets [[0x0]] (dirty), then [[0x10]] evicts it (write-back 1), then [[0x0]] evicts dirty [[0x10]] (2). Line 1 gets [[0x4]] (dirty), then [[0x14]] evicts it (3), and [[0x4]] evicts the clean [[0x14]] (no write-back). [[0x20]] evicts the clean [[0x0]] and becomes dirty. The last [[lw 0x0]] evicts it (4). The total is $4$.` });

  add({ id: 1214, lec: 13, title: "Column-Major Thrashing", diff: "Medium", topics: ["Caches", "Locality"], answer: "0",
    statement: t`An $8\times 8$ matrix of words is stored row by row at [[0x1000]]. A direct-mapped cache holds 32 words with a block size of 4. A loop reads the whole matrix column by column (all of column 0, then column 1, and so on) from an empty cache. How many of the 64 reads hit?`,
    hints: [t`Each row is 8 words, so rows $i$ and $i + 4$ map to the same lines.`],
    solution: t`One column touches 8 blocks, one per row. Rows $i$ and $i+4$ collide, so by the time the loop returns for the next column, each needed block has been evicted. All 64 reads miss: $0$ hits. Reading row by row gives 48 hits instead.` });

  add({ id: 1215, lec: 13, title: "Bigger Cache, Same Loop", diff: "Medium", topics: ["Caches", "Locality"], answer: "48",
    statement: t`Use the column-by-column read of the $8\times 8$ word matrix from the previous problem, but the direct-mapped cache now holds 64 words (block size 4). How many of the 64 reads hit?`,
    hints: [t`The whole matrix now fits in the cache.`],
    solution: t`The 16 blocks of the matrix all fit with no conflicts. Each block misses once: 16 misses and $64 - 16 = 48$ hits.` });

  add({ id: 1216, lec: 13, title: "LRU Thrash on a Loop", diff: "Hard", topics: ["Caches", "LRU"], answer: "0",
    statement: t`A fully associative LRU cache holds 8 one-word blocks. A program reads words [[0x0, 0x4, ..., 0x20]] (9 words) in order, over and over. What is the steady-state hit ratio?`,
    hints: [t`When word 8 arrives, LRU evicts word 0, which is the next one needed.`],
    solution: t`Each access evicts the block needed soonest, so every access misses: $0$. A direct-mapped cache of 8 lines does better here: only words 0 and 8 conflict, so it hits $7/9$ of the time.` });

  add({ id: 1217, lec: 13, title: "Total Cache Storage", diff: "Medium", topics: ["Caches", "Cache Cost"], answer: "38400",
    statement: t`A direct-mapped, write-back cache has 256 lines with 4 words per line. Addresses are 32 bits. Each line stores a valid bit, a dirty bit, a tag, and the data. How many bits of storage does the cache have in total?`,
    hints: [t`Tag $= 32 - 8 - 4 = 20$ bits. Data $= 128$ bits.`],
    solution: t`Each line has $1 + 1 + 20 + 128 = 150$ bits. $256 \cdot 150 = 38400$ bits.` });

  add({ id: 1218, lec: 13, title: "Load Halfword From Cache", diff: "Easy", topics: ["Caches", "Loads"], answer: "0xABCD",
    statement: t`The word at address [[0x100]] is [[0xABCD5678]]. What does [[lhu]] from address [[0x102]] return? Answer in hex.`,
    hints: [t`Offset 2 is the upper halfword.`],
    solution: t`The upper halfword is [[0xABCD]]. [[lhu]] zero-extends it, so the result is [[0x0000ABCD]]. ([[lh]] would give [[0xFFFFABCD]].)` });

  add({ id: 1219, lec: 13, title: "Instruction Fetch Hit Rate", diff: "Hard", topics: ["Caches", "Locality"], answer: "59/61",
    statement: t`A fully associative LRU cache of 16 words with a block size of 2 holds both instructions and data. This program runs once:

~~~
. = 0
      mv   x4, x0
loop: lw   x2, 0x400(x4)
      slli x3, x2, 1
      sw   x3, 0x700(x4)
      addi x4, x4, 4
      slti x2, x4, 80
      bnez x2, loop
      unimp
~~~

Count every instruction fetch, including one for [[unimp]]. What is the hit rate of the instruction fetches?`,
    hints: [t`The loop runs 20 times. That is $1 + 6\cdot 20 + 1 = 122$ fetches.`],
    solution: t`The 8 instructions occupy 4 blocks, so there are 4 compulsory misses. The loop keeps those blocks recently used, so they are never evicted. The hit rate is $118/122 = 59/61$. (Fall 2025 Quiz 2, problem 4E.)` });

  // ---------- L14: pipelined processors
  add({ id: 1231, lec: 14, title: "Iron Law", diff: "Easy", topics: ["Performance", "Pipelined Processors"], answer: "1500",
    statement: t`A program executes 1000 instructions with an average CPI of 1.5 on a 1 GHz processor. How long does it take, in ns?`,
    hints: [t`Time $=$ instructions $\times$ CPI $\times\ t_{CLK}$.`],
    solution: t`$1000 \cdot 1.5 \cdot 1\text{ ns} = 1500$ ns.` });

  add({ id: 1232, lec: 14, title: "Pipelined Clock Period", diff: "Medium", topics: ["Pipelined Processors", "Timing"], answer: "22",
    statement: t`A 5-stage pipelined processor has ideal pipeline registers. The stage logic delays are IF 5 ns, DEC 10 ns, EXE 15 ns, MEM 20 ns and WB 10 ns. The bypass muxes in DEC add 2 ns to any path that bypasses a value from the end of EXE, MEM or WB logic into DEC. What is the minimum clock period, in ns?`,
    hints: [t`Check each stage alone and each bypass path (stage logic + 2 ns).`],
    solution: t`The stages alone need at most 20 ns. The bypass paths need EXE $+ 2 = 17$, MEM $+ 2 = 22$ and WB $+ 2 = 12$ ns. The clock period is $22$ ns, set by the MEM-to-DEC bypass.` });

  add({ id: 1233, lec: 14, title: "Speedup Over Single-Cycle", diff: "Medium", topics: ["Performance", "Pipelined Processors"], answer: "29/12",
    statement: t`A single-cycle processor has $t_{CLK} = 29$ ns and CPI $= 1$. A 5-stage pipelined version has $t_{CLK} = 8$ ns and an average CPI of 1.5 on the same program. What is the speedup of the pipelined processor?`,
    hints: [t`Compare time per instruction: $\text{CPI} \cdot t_{CLK}$.`],
    solution: t`Single-cycle: $29$ ns per instruction. Pipelined: $1.5 \cdot 8 = 12$ ns. The speedup is $29/12 \approx 2.42$.` });

  add({ id: 1234, lec: 14, title: "Straight-Line Code, Full Bypass", diff: "Medium", topics: ["Pipelined Processors", "Bypassing", "Stalls"], answer: "10",
    statement: t`${PIPE} The processor has full bypassing. The first instruction is fetched in cycle 0. In how many cycles (cycle 0 through the last WB, inclusive) do these four instructions complete?

~~~
add  x1, x2, x3
lw   x4, 0(x1)
addi x5, x4, 1
sw   x5, 4(x1)
~~~`,
    hints: [t`Only the load-to-use dependence ([[lw]] → [[addi]]) stalls. It costs 2 cycles.`],
    solution: t`Without stalls, 4 instructions finish in $4 + 4 = 8$ cycles. The [[addi]] waits in DEC until the [[lw]] reaches WB, which adds 2 cycles. The total is $10$ cycles (the last WB is in cycle 9).` });

  add({ id: 1235, lec: 14, title: "Straight-Line Code, No Bypass", diff: "Medium", topics: ["Pipelined Processors", "Stalls"], answer: "17",
    statement: t`${PIPE} Now the processor has no bypass paths: an instruction reads a register in DEC only in the cycle after the writer finishes WB. The first instruction is fetched in cycle 0. In how many cycles do the same four instructions complete?

~~~
add  x1, x2, x3
lw   x4, 0(x1)
addi x5, x4, 1
sw   x5, 4(x1)
~~~`,
    hints: [t`Each adjacent dependence costs 3 stall cycles.`],
    solution: t`There are 3 adjacent dependences ([[add]]→[[lw]], [[lw]]→[[addi]], [[addi]]→[[sw]]). Each costs 3 cycles, which adds 9. The total is $8 + 9 = 17$ cycles.` });

  add({ id: 1236, lec: 14, title: "Bypass Path Used", diff: "Easy", topics: ["Pipelined Processors", "Bypassing"], answer: "2",
    statement: t`With full bypassing, this code runs:

~~~
add x1, x2, x3
and x4, x2, x5
sll x6, x1, x3
~~~

When [[sll]] is in DEC, the [[add]] that produces [[x1]] is in which stage? Answer 1 for EXE, 2 for MEM, 3 for WB.`,
    hints: [t`[[sll]] is two instructions behind [[add]].`],
    solution: t`[[add]] is two stages ahead of [[sll]]. When [[sll]] is in DEC, [[add]] is in MEM, so the value comes over the MEM→DEC bypass. The answer is $2$.` });

  add({ id: 1237, lec: 14, title: "Load-to-Use Penalty", diff: "Easy", topics: ["Pipelined Processors", "Stalls"], answer: "2",
    statement: t`${PIPE} With full bypassing, an instruction right after a [[lw]] uses the loaded register. How many stall cycles does it take?`,
    hints: [t`The consumer must stay in DEC until the load is in WB.`],
    solution: t`When the consumer first reaches DEC, the load is in EXE. The load reaches WB two cycles later, so the penalty is $2$ cycles.` });

  add({ id: 1238, lec: 14, title: "Dependent ALU Chain", diff: "Medium", topics: ["Pipelined Processors", "Stalls"], answer: "20/6",
    statement: t`${PIPE} The processor has no bypassing. This loop runs many times. What is its CPI?

~~~
loop: add  x1, x2, x3
      sub  x4, x1, x5
      and  x6, x4, x1
      or   x7, x6, x4
      addi x9, x9, -1
      bnez x9, loop
~~~`,
    hints: [t`Find the adjacent dependences. Each costs 3 cycles. Then add the 2 annulled slots of the taken branch.`],
    solution: t`[[add]]→[[sub]], [[sub]]→[[and]], [[and]]→[[or]] and [[addi]]→[[bnez]] are adjacent dependences: $4 \cdot 3 = 12$ stall cycles. The taken branch costs 2 more. One iteration takes $6 + 12 + 2 = 20$ cycles for 6 instructions, so CPI $= 20/6 \approx 3.33$. With full bypassing it would be $8/6$.` });

  add({ id: 1239, lec: 14, title: "Same Chain, Full Bypass", diff: "Easy", topics: ["Pipelined Processors", "Bypassing"], answer: "8/6",
    statement: t`${PIPE} The processor has full bypassing. What is the CPI of the loop from the previous problem?`,
    hints: [t`ALU results bypass without stalls.`],
    solution: t`No data stalls. The taken branch costs 2 cycles: $(6 + 2)/6 = 4/3$.` });

  add({ id: 1240, lec: 14, title: "Instructions in Flight", diff: "Easy", topics: ["Pipelined Processors"], answer: "5",
    statement: t`In a 5-stage pipeline with no stalls, at most how many instructions are in the pipeline in one cycle?`,
    hints: [t`One per stage.`],
    solution: t`$5$, one in each stage.` });

  // ---------- L15: data and control hazards
  add({ id: 1251, lec: 15, title: "Array Sum Loop", diff: "Medium", topics: ["Hazards", "CPI"], answer: "2",
    statement: t`${PIPE} The processor has full bypassing. The loop runs many times. What is its CPI?

~~~
loop: lw   a1, 0(a0)
      add  a2, a2, a1
      addi a0, a0, 4
      bne  a0, a3, loop
~~~`,
    hints: [t`Load-to-use costs 2 cycles. The taken branch costs 2 cycles.`],
    solution: t`One iteration takes $4 + 2 + 2 = 8$ cycles for 4 instructions, so CPI $= 2$.` });

  add({ id: 1252, lec: 15, title: "Reordering the Loop", diff: "Medium", topics: ["Hazards", "Scheduling"], answer: "7/4",
    statement: t`${PIPE} The processor has full bypassing. The loop from the previous problem is reordered so that [[addi]] comes right after the load:

~~~
loop: lw   a1, 0(a0)
      addi a0, a0, 4
      add  a2, a2, a1
      bne  a0, a3, loop
~~~

What is the CPI now?`,
    hints: [t`The [[add]] is now two instructions after the [[lw]].`],
    solution: t`When [[add]] reaches DEC, the [[lw]] is in MEM. It must wait one cycle for WB. The iteration takes $4 + 1 + 2 = 7$ cycles: CPI $= 7/4$.` });

  add({ id: 1253, lec: 15, title: "Array Sum, No Bypass", diff: "Hard", topics: ["Hazards", "Stalls"], answer: "3",
    statement: t`${PIPE} The processor has no bypassing (it stalls until the writer leaves WB). What is the CPI of the original loop?

~~~
loop: lw   a1, 0(a0)
      add  a2, a2, a1
      addi a0, a0, 4
      bne  a0, a3, loop
~~~`,
    hints: [t`Two adjacent dependences, 3 cycles each, plus 2 for the taken branch.`],
    solution: t`[[lw]]→[[add]] and [[addi]]→[[bne]] each cost 3 cycles. One iteration takes $4 + 6 + 2 = 12$ cycles: CPI $= 3$.` });

  add({ id: 1254, lec: 15, title: "Minimum Stalls", diff: "Medium", topics: ["Hazards", "Stalls"], answer: "1",
    statement: t`${PIPE} The processor has full bypassing. How many stall cycles does this sequence need?

~~~
add x1, x2, x3
lw  x3, 0(x2)
or  x4, x1, x2
and x5, x2, x3
~~~`,
    hints: [t`[[and]] uses [[x3]], loaded two instructions earlier.`],
    solution: t`[[or]] gets [[x1]] by bypass with no stall. [[and]] needs [[x3]] from the [[lw]] two instructions ahead. When [[and]] is in DEC the load is in MEM, so it waits $1$ cycle.` });

  add({ id: 1255, lec: 15, title: "Always-Taken Branch Loop", diff: "Medium", topics: ["Control Hazards", "CPI"], answer: "5/3",
    statement: t`${PIPE} The processor has full bypassing. The [[beq]] is always taken. What is the average CPI of this 3-instruction loop?

~~~
loop: add x1, x2, x3
      lw  x4, 0(x2)
      beq x2, x1, loop
      and x5, x2, x3
      xor x6, x2, x1
~~~`,
    hints: [t`[[beq]] does not use [[x4]], so the load causes no stall.`],
    solution: t`Each iteration annuls the [[and]] and [[xor]]: $3 + 2 = 5$ cycles per 3 instructions. CPI $= 5/3$.` });

  add({ id: 1256, lec: 15, title: "Load Then Branch", diff: "Hard", topics: ["Hazards", "Control Hazards"], answer: "11/5",
    statement: t`${PIPE} The processor has full bypassing. The array is sorted, so [[bge]] is always taken. What is the CPI of the steady-state loop (the [[mv]] never completes)?

~~~
      li   t0, 100
loop: lw   a1, 0(t2)
      bge  a1, a0, skip
      mv   a0, a1
skip: addi t2, t2, 4
      addi t0, t0, -1
      bnez t0, loop
~~~

Count only the instructions that complete: [[lw, bge, addi, addi, bnez]].`,
    hints: [t`[[bge]] needs [[a1]] right after the load: 2 stalls. Then two taken branches each cost 2.`],
    solution: t`One iteration takes 5 instructions + 2 (load-to-use) + 2 ([[bge]] taken) + 2 ([[bnez]] taken) $= 11$ cycles. CPI $= 11/5 = 2.2$. (Spring 2026 Quiz 2, problem 6, uses this loop.)` });

  add({ id: 1257, lec: 15, title: "String Length Loop", diff: "Medium", topics: ["Hazards", "CPI"], answer: "2",
    statement: t`${PIPE} The processor has full bypassing. This loop scans bytes until it finds a zero, and it runs many times before the exit. What is its CPI?

~~~
loop: lbu  t0, 0(a0)
      addi a0, a0, 1
      bnez t0, loop
~~~`,
    hints: [t`[[bnez]] uses [[t0]], loaded two instructions earlier.`],
    solution: t`[[bnez]] waits 1 cycle for the load to reach WB. The taken branch costs 2. One iteration takes $3 + 1 + 2 = 6$ cycles, so CPI $= 2$.` });

  add({ id: 1258, lec: 15, title: "Linked List Walk", diff: "Hard", topics: ["Hazards", "Control Hazards"], answer: "9/5",
    statement: t`${PIPE} The processor has full bypassing. The list is long. What is the CPI of the loop?

~~~
loop: beqz a0, done
      lw   t1, 0(a0)
      add  t0, t0, t1
      lw   a0, 4(a0)
      j    loop
~~~`,
    hints: [t`[[add]] uses [[t1]] right after the load.`, t`The jump annuls two instructions. By the time [[beqz]] reaches DEC, the second [[lw]] has finished WB.`],
    solution: t`Load-to-use on [[t1]] costs 2 cycles. The [[j]] costs 2 annulled slots. The [[lw a0]] is far enough ahead of [[beqz]] because of the jump. One iteration takes $5 + 2 + 2 = 9$ cycles: CPI $= 9/5$.` });

  add({ id: 1259, lec: 15, title: "Annulled per Taken Branch", diff: "Easy", topics: ["Control Hazards"], answer: "2",
    statement: t`${PIPE} How many instructions are annulled each time a branch is taken?`,
    hints: [t`When the branch is in EXE, which stages hold wrong-path instructions?`],
    solution: t`The instructions in IF and DEC are on the wrong path: $2$.` });

  add({ id: 1260, lec: 15, title: "Branch Resolved in DEC", diff: "Medium", topics: ["Control Hazards", "CPI"], answer: "4/3",
    statement: t`A variant of the pipeline resolves branches in DEC instead of EXE, so a taken branch annuls only 1 instruction. Assume no data stalls. What is the CPI of the 3-instruction loop from "Always-Taken Branch Loop" ([[add]], [[lw]], [[beq]], always taken)?`,
    hints: [t`Only one wrong-path instruction per iteration.`],
    solution: t`$(3 + 1)/3 = 4/3$. (In practice, moving branch logic to DEC can lengthen the clock period, as Fall 2025 Quiz 2 showed.)` });

  add({ id: 1261, lec: 15, title: "Stall or Annul", diff: "Easy", topics: ["Control Hazards", "Hazards"], answer: "1",
    statement: t`A taken branch in EXE wants to annul the instruction in DEC. In the same cycle, that DEC instruction wants to stall for a load. Should the processor annul (answer 1) or stall (answer 0)?`,
    hints: [t`The DEC instruction is on the wrong path.`],
    solution: t`Annul ($1$). The instruction in DEC should never execute, so there is no reason to stall for its data.` });

  add({ id: 1262, lec: 15, title: "Time per Iteration", diff: "Hard", topics: ["Performance", "Control Hazards"], answer: "3200",
    statement: t`A loop takes 10 cycles per iteration on processor A ($t_{CLK} = 350$ ns) and 8 cycles per iteration on processor B ($t_{CLK} = 400$ ns). How many ns does one iteration take on the faster processor?`,
    hints: [t`Compare cycles $\times\ t_{CLK}$.`],
    solution: t`A: $10 \cdot 350 = 3500$ ns. B: $8 \cdot 400 = 3200$ ns. B is faster at $3200$ ns, even with a slower clock.` });

  add({ id: 1263, lec: 15, title: "Linked List Without Bypass", diff: "Hard", topics: ["Hazards", "Stalls"], answer: "2",
    statement: t`${PIPE} The processor now has no bypassing. What is the CPI of the linked-list loop from "Linked List Walk"?

~~~
loop: beqz a0, done
      lw   t1, 0(a0)
      add  t0, t0, t1
      lw   a0, 4(a0)
      j    loop
~~~`,
    hints: [t`[[lw t1]]→[[add]] costs 3 cycles. Check whether [[beqz]] must wait for [[lw a0]].`],
    solution: t`The adjacent dependence costs 3. The [[j]] costs 2. When [[beqz]] reaches DEC, [[lw a0]] has just left WB, so there is no stall. One iteration takes $5 + 3 + 2 = 10$ cycles: CPI $= 2$.` });

  // Integer answers must match exactly.
  for (const p of P) {
    p.course = "6.191";
    if (p.tol === undefined && Number.isInteger(root.Expr.evaluate(p.answer))) p.tol = 0;
  }
  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
