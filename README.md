# ProbTrainer

A LeetCode-style practice site for probability interview problems and MIT course quizzes.
A course selector in the top bar switches between 6.3700 (probability) and 6.191
(computation structures).

## Features

- 456 problems: Easy, Medium, and Hard, over 40 topics (dice, cards, Bayes, Markov chains,
  martingales, geometric probability, order statistics, inference, and more).
- A 6.3700 (MIT Introduction to Probability, Fall 2026) course view. Problems are grouped by lecture
  (Lectures 1-12 follow the Fall 2026 slides), with textbook sections (Bertsekas & Tsitsiklis)
  and per-lecture progress. 41 interview-style problems outside the syllabus are listed as extras.
- A 6.191 (MIT Computation Structures, Fall 2026) course view with 259 problems for Quiz 2
  (L7-L15: Minispec sequential circuits, pipelining, design tradeoffs, RISC-V assembly, the
  RISC-V processor, memory hierarchy, caches, pipelined processors, hazards), plus L6 timing review.
  79 are official problems: the Quiz 2 exams from Fall 2025, Spring 2025, and Spring 2026, and the
  Fall 2026 L7-L15 worksheets. Their text and official solutions are transcribed, and their
  diagrams (circuits, datapaths, pipeline diagrams, cache tables) are redrawn as SVG in the site
  style, so they follow the light and dark themes. Click a figure to see it at full size. Each
  numeric part has its own answer box. The other 180 are written practice problems modeled on
  them. The list has a source filter (past quiz, worksheet, written practice).
- 6.191 generated drills (the Drills tab). Each drill makes a new problem from a random seed, and
  the link keeps the seed. There are 13 types: pipeline diagrams for a loop (a past-quiz loop or a
  randomly generated one; fill in the grid and the bypass row, under random bypass paths, branch
  and jump resolve stages, and load timing; then stalls, annulments, CPI, clock period, and the
  unpipelined time), straight-line code from an empty pipeline (with the NOPs a compiler must
  insert when there is no stall logic), the same loop on two processors, cache traces (direct-mapped,
  set-associative, or fully associative; unified or split; fill in the final cache, hits, misses,
  and write-backs), cache hit ratios of loops, cache geometry and AMAT, K-stage pipelining of a
  circuit (you can also click edges to place registers, and the page checks that the pipeline is
  valid and gives its period and latency), composed pipelines, decoder outputs, pipeline and cache facts, Minispec state over
  cycles, Minispec writing (fill in the blanks of a module or function template, like Fall 2025
  Problem 1), and area and delay scaling. The progress page has a Drills section with results per
  drill type and the recent attempts. The answers come from `js/sim-6191.js`: a pipeline
  simulator (checked against 9 official pipeline diagrams by `scripts/check-sim.js`) and a cache
  simulator (checked against Fall 2025 Quiz 2 Problem 4 by `scripts/check-drills.js`).
  The generators are in `js/drills-6191.js`.
- 6.3700 generated drills for Quiz 2 (L8-L13), in the Drills tab when the course is 6.3700: linear
  combinations, joint PMF tables, the law of total variance, random sums, random parameters,
  indicator variances, joint PDFs, conditioning on an event, derived distributions, convolution,
  continuous and mixed Bayes, and true/false checks. The generators are in `js/drills-6370.js`
  and compute answers with exact fractions. `scripts/check-drills-6370.js` checks them by Monte
  Carlo simulation (901 answers) and by numeric integration.
- A 6.3000 (MIT Signal Processing, Fall 2026) course view for Quiz 2 (L1-L13: Fourier series and
  transforms, sampling, systems, convolution, frequency response, modulation, DFT, circular
  convolution). 72 written practice problems (`js/problems-6300.js`, answers recomputed by
  `scripts/check_6300.py` with numpy/scipy), 16 official problems from the Spring 2022, Fall 2022,
  Fall 2023, and Spring 2025 Quiz 2 exams (`js/problems-6300-real.js`; formula-defined plots are
  redrawn, hand-drawn ones link to the official PDF), the past quizzes as timed exams, and 17
  drill types (`js/drills-6300.js`) including plot-matching drills. `scripts/check-drills-6300.js`
  checks the drills by numerical integration, direct sums, DFT products, and numeric tests of the
  system-properties table. A Quiz 2 formula sheet is in `formula-sheet-6.3000.html`.
- A short Quiz 2 formula sheet for 6.3700 (`formula-sheet-6.3700.html`, A4), linked from the
  6.3700 course page.
- Timed practice exams (6.3700: Quiz 1, Quiz 2, Final; 6.191: Quiz 2) drawn at random across the
  lectures in scope. 6.191 also has the three past Quiz 2 exams as fixed 2-hour exams.
- Problem list with search, difficulty / status / topic filters, sorting, and stars.
- Problem page with a statement, hints, a solution, and notes.
- Answer checking: enter a number or an exact expression (`3/8`, `1-(5/6)^4`, `sqrt(2)/2`,
  `1/e`, `C(52,5)`, `0x1F`, `0b1011`). Answers within 0.05% relative error are accepted.
  Problems with `tol: 0` need an exact match (all integer, hex, and binary answers in 6.191).
- Status per problem (Todo / Attempted / Solved), submission history, and a manual
  "Mark as solved" toggle.
- Progress page with totals, acceptance rate, average tries to solve, average time to solve, total
  practice time, the hardest problems you tried (ranked by wrong tries, hints, opened solutions,
  time, and open status), per-difficulty averages, a per-topic table, and recent activity.
- Each problem page has a timer that counts active time over all visits. It counts while the page
  is visible and pauses after 5 idle minutes.
- Progress is saved in `localStorage`. Use Export / Import to back it up.

## Run

The site is static. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8123
```

Then go to http://localhost:8123.

## Keyboard

- `/` focuses the search box.
- `R` opens a random unsolved problem from the current filter.
- `Alt+Left` / `Alt+Right` go to the previous / next problem.
- `Enter` in the answer box submits.

## Add problems

Problems live in `js/problems-*.js`. Each entry has an `id`, `title`, `diff`, `topics`,
`answer` (an expression), `statement`, `hints`, and `solution`. Optional fields: `course`
(default `6.3700`), `lec` (the lecture number in that course) and `tol` (relative tolerance;
`0` means exact). `js/course.js` holds the course registry, the 6.3700 structure, and the
lecture map for 6.3700 problems without `lec`. `js/course-6191.js` holds the 6.191 structure.
An official problem (`js/problems-6191-real.js`) has `real` (`quiz` or `worksheet`), `source`,
`img` (the key of its text in `js/real-6191-quiz.js` or `js/real-6191-ws.js`), and `parts` (a
list of `{ q, answer }`) in place of `answer`. Parts without a number are self-checked.
Figures are SVG built with the helpers in `js/fig.js` (boxes, wires, muxes, dataflow graphs with
register dots, state machines, pipeline diagrams, and two RISC-V datapath drawings). To see every
figure at full size, serve the folder and open `scripts/figs.html` (add `?f=name` to filter).
To add a course, write a `course-*.js` file that calls `addCourse()`, and load it after
`course.js` in `index.html`.

Math uses `$...$` and `$$...$$` (KaTeX); write `\$` for a literal dollar sign. A paragraph that
starts with `~~~` is a code block, and `[[text]]` is inline code. Problem text can also use
`**bold**`, `- ` bullet lists, `| a | b |` tables (a `|---|` second row makes a header row), and
`@fig name` to insert a figure. After an edit, run:

```bash
node scripts/check.js
```

The script checks for duplicate ids, missing fields, answers that do not evaluate,
unbalanced `$` delimiters, unknown lectures, unknown figures, and control characters left by
bad escapes.

## Deploy to GitHub Pages

The workflow `.github/workflows/pages.yml` deploys the site on every push to `main`.
It runs `scripts/check.js`, `scripts/check-sim.js`, `scripts/check-drills.js`, and
`scripts/check-drills-6370.js` first, so a broken problem bank, simulator, or drill stops the deploy.

1. Create a repository on GitHub and push `main` to it.
2. In the repository, go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`, or run the workflow by hand from the **Actions** tab.

The site is then at `https://<user>.github.io/<repo>/`. All paths in the site are relative,
so it works under a sub-path. Progress is stored per browser and per origin, so progress
from `localhost` does not carry over. Use Export and Import to move it.
