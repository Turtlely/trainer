# ProbTrainer

A LeetCode-style practice site for probability interview problems.

## Features

- 456 problems: Easy, Medium, and Hard, over 40 topics (dice, cards, Bayes, Markov chains,
  martingales, geometric probability, order statistics, inference, and more).
- A 6.3700 (MIT Introduction to Probability, Fall 2026) course view. Problems are grouped by lecture
  (Lectures 1-12 follow the Fall 2026 slides), with textbook sections (Bertsekas & Tsitsiklis)
  and per-lecture progress. 41 interview-style problems outside the syllabus are listed as extras.
- Timed practice exams (Quiz 1, Quiz 2, Final) drawn at random across the lectures in scope.
- Problem list with search, difficulty / status / topic filters, sorting, and stars.
- Problem page with a statement, hints, a solution, and notes.
- Answer checking: enter a number or an exact expression (`3/8`, `1-(5/6)^4`, `sqrt(2)/2`,
  `1/e`, `C(52,5)`). Answers within 0.05% relative error are accepted.
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
`answer` (an expression), `statement`, `hints`, and `solution`. Optional fields: `lec` (the
6.3700 lecture number) and `tol` (relative tolerance, for answers read from normal tables).
`js/course.js` holds the course structure and the lecture map for problems without `lec`. Math uses `$...$` and
`$$...$$` (KaTeX). After an edit, run:

```bash
node scripts/check.js
```

The script checks for duplicate ids, missing fields, answers that do not evaluate, and
unbalanced `$` delimiters.

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
