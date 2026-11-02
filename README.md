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
- A 6.191 (MIT Computation Structures, Fall 2026) course view with 180 problems for Quiz 2
  (L7-L15: Minispec sequential circuits, pipelining, design tradeoffs, RISC-V assembly, the
  RISC-V processor, memory hierarchy, caches, pipelined processors, hazards), plus L6 timing review.
  The problems are modeled on the course worksheets, practice quizzes, and the 6.004 OCW worksheets.
- Timed practice exams (6.3700: Quiz 1, Quiz 2, Final; 6.191: Quiz 2) drawn at random across the
  lectures in scope.
- Problem list with search, difficulty / status / topic filters, sorting, and stars.
- Problem page with a statement, hints, a solution, and notes.
- Answer checking: enter a number or an exact expression (`3/8`, `1-(5/6)^4`, `sqrt(2)/2`,
  `1/e`, `C(52,5)`, `0x1F`, `0b1011`). Answers within 0.05% relative error are accepted.
  Problems with `tol: 0` need an exact match (all integer, hex, and binary answers in 6.191).
- Status per problem (Todo / Attempted / Solved), submission history, and a manual
  "Mark as solved" toggle.
- Progress page with totals, acceptance rate, a per-topic table, and recent activity.
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
To add a course, write a `course-*.js` file that calls `addCourse()`, and load it after
`course.js` in `index.html`.

Math uses `$...$` and `$$...$$` (KaTeX). A paragraph that starts with `~~~` is a code block,
and `[[text]]` is inline code. After an edit, run:

```bash
node scripts/check.js
```

The script checks for duplicate ids, missing fields, answers that do not evaluate,
unbalanced `$` delimiters, unknown lectures, and control characters left by bad escapes.

## Deploy to GitHub Pages

The workflow `.github/workflows/pages.yml` deploys the site on every push to `main`.
It runs `scripts/check.js` first, so a broken problem bank stops the deploy.

1. Create a repository on GitHub and push `main` to it.
2. In the repository, go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`, or run the workflow by hand from the **Actions** tab.

The site is then at `https://<user>.github.io/<repo>/`. All paths in the site are relative,
so it works under a sub-path. Progress is stored per browser and per origin, so progress
from `localhost` does not carry over. Use Export and Import to move it.
