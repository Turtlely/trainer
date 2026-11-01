// Course structure for MIT 6.3700 Introduction to Probability, Fall 2026.
// Lectures 1-12 and their readings follow the Fall 2026 lecture slides.
// Lectures 13+ are not out yet; they follow the order of the OCW version of the course
// (6.041SC) and may not match this term's numbering exactly.
// Readings are sections of Bertsekas & Tsitsiklis, "Introduction to Probability", 2nd ed.
// Load this file after all problem files.
(function (root) {
  const COURSE = {
    code: "6.3700",
    name: "Introduction to Probability",
    term: "Fall 2026",
    source: "https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/",
    units: [
      { name: "Quiz 1: Lectures 1-7", lectures: [
        { n: 1, title: "Probability Models and Axioms", reading: "§1.1-1.2" },
        { n: 2, title: "Conditioning and Bayes' Rule", reading: "§1.3-1.4" },
        { n: 3, title: "Independence", reading: "§1.5" },
        { n: 4, title: "Counting", reading: "§1.6" },
        { n: 5, title: "Random Variables; PMFs; Expectation; Variance", reading: "§2.1-2.4" },
        { n: 6, title: "Conditional PMFs; Geometric; Total Expectation; Joint PMFs", reading: "§2.4-2.6" },
        { n: 7, title: "Multiple Discrete Random Variables; Independence", reading: "Ch. 2" },
      ], exam: { id: "quiz1", name: "Quiz 1" } },
      { name: "Quiz 2: Lectures 8-12", lectures: [
        { n: 8, title: "Continuous Random Variables: PDFs, CDFs, Normal, Exponential", reading: "§3.1-3.3" },
        { n: 9, title: "Joint PDFs; Conditioning on an Event or a Random Variable", reading: "§3.4-3.5" },
        { n: 10, title: "Continuous Total Probability and Expectation; Bayes' Rule", reading: "§3.5-3.6" },
        { n: 11, title: "Derived Distributions", reading: "§4.1" },
        { n: 12, title: "Sums of Independent RVs (Convolution); Covariance and Correlation", reading: "§4.1-4.2" },
      ], exam: { id: "quiz2", name: "Quiz 2" } },
      { name: "After Quiz 2 (OCW order; may differ this term)", lectures: [
        { n: 13, title: "Iterated Expectations; Sum of a Random Number of RVs", reading: "§4.3, 4.5" },
        { n: 14, title: "Bernoulli Process", reading: "Ch. 6" },
        { n: 15, title: "Poisson Process I", reading: "Ch. 6" },
        { n: 16, title: "Poisson Process II", reading: "Ch. 6" },
        { n: 17, title: "Markov Chains I", reading: "Ch. 7" },
        { n: 18, title: "Markov Chains II", reading: "Ch. 7" },
        { n: 19, title: "Markov Chains III", reading: "Ch. 7" },
        { n: 20, title: "Weak Law of Large Numbers", reading: "Ch. 5" },
        { n: 21, title: "Central Limit Theorem", reading: "Ch. 5" },
        { n: 22, title: "Bayesian Statistical Inference I", reading: "Ch. 8" },
        { n: 23, title: "Bayesian Statistical Inference II", reading: "Ch. 8" },
        { n: 24, title: "Classical Statistical Inference I", reading: "Ch. 9" },
        { n: 25, title: "Classical Inference II", reading: "Ch. 9" },
        { n: 26, title: "Classical Inference III", reading: "Ch. 9" },
      ], exam: { id: "final", name: "Final Exam" } },
    ],
  };

  // Practice exam scopes. Quizzes are two hours and the final is three hours.
  COURSE.exams = {
    quiz1: { name: "Quiz 1", from: 1, to: 7, count: 8, minutes: 120 },
    quiz2: { name: "Quiz 2", from: 8, to: 12, count: 10, minutes: 120 },
    final: { name: "Final Exam", from: 1, to: 26, count: 14, minutes: 180 },
  };

  // Lecture assignments for problems in parts 1-3, in the OCW numbering (6.041SC).
  // Problems not listed are interview-style extras outside the syllabus.
  const MAP = {
    1: [1, 31, 34, 46, 91, 101, 106, 119],
    2: [3, 9, 10, 11, 47, 48, 56, 83, 85, 86, 87, 88, 90],
    3: [2, 55, 57, 70, 71, 89, 200],
    4: [8, 16, 18, 19, 20, 21, 22, 24, 25, 28, 30, 33, 43, 44, 45, 54, 67, 73, 178, 179, 185, 196],
    5: [4, 38, 39, 40, 41, 42, 58, 59, 74, 77, 166, 167, 198, 199],
    6: [6, 7, 49, 79, 80, 172, 194],
    7: [14, 15, 17, 23, 26, 27, 50, 51, 52, 53, 68, 69, 129, 147, 148, 151, 152, 153, 155, 165, 171, 177, 195, 197, 201],
    8: [92, 96, 98, 110, 111, 120, 121, 133],
    9: [93, 95, 97, 99, 102, 103, 104, 125, 130, 131, 132],
    10: [84, 107, 109, 189],
    11: [100, 122, 123, 124, 128, 190],
    12: [35, 36, 37, 126, 127, 138, 193],
    13: [5, 60, 61, 62, 63, 64, 65, 66, 78, 192],
    14: [135, 136],
    15: [134, 137],
    16: [76, 141, 142, 168],
    17: [72, 169, 170],
    18: [12, 13, 75, 139, 175, 176, 191],
  };

  // OCW lectures 10-11 are split differently this term. These problems move to a
  // specific Fall 2026 lecture; all other OCW numbers shift by the rule in toFall().
  const OVERRIDE = {
    // derived distributions -> Lecture 11
    107: 11, 109: 11, 122: 11, 123: 11, 221: 11, 222: 11, 223: 11,
    // convolution, sums of normals, covariance -> Lecture 12
    100: 12, 124: 12, 128: 12, 190: 12, 224: 12, 225: 12, 226: 12, 227: 12, 228: 12,
    // conditional normal tail -> Lecture 8
    189: 8,
  };
  const toFall = (ocw, id) => {
    if (OVERRIDE[id]) return OVERRIDE[id];
    if (ocw <= 10) return ocw;
    if (ocw === 11) return 12;
    return ocw + 1; // OCW 12 (iterated expectations) and later move down one slot
  };

  // Parts 5-6 already use Fall 2026 numbers. Parts 1-4 use OCW numbers.
  const FALL_NATIVE = (id) => id >= 300;
  const byId = new Map((root.PROBLEMS || []).map((p) => [p.id, p]));
  for (const [lec, ids] of Object.entries(MAP)) {
    for (const id of ids) {
      const p = byId.get(id);
      if (p) p.lec = +lec;
    }
  }
  for (const p of root.PROBLEMS || []) {
    if (p.lec !== undefined && !FALL_NATIVE(p.id)) p.lec = toFall(p.lec, p.id);
  }

  COURSE.lecture = (n) => {
    for (const u of COURSE.units) for (const l of u.lectures) if (l.n === n) return l;
    return null;
  };
  COURSE.MAP = MAP;
  root.COURSE = COURSE;
})(typeof window !== "undefined" ? window : globalThis);
