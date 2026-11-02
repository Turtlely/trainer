// Course structure for MIT 6.191 Computation Structures, Fall 2026.
// Lecture titles follow the Fall 2026 course site (6191.mit.edu/fall26). Quiz 2 covers L7-L15.
// Load this file after course.js.
(function (root) {
  root.addCourse({
    code: "6.191",
    name: "Computation Structures",
    term: "Fall 2026",
    source: "https://6191.mit.edu/fall26/resources/lectures",
    blurb: `Problems sorted by lecture. Lecture titles follow the
      <a class="link" href="https://6191.mit.edu/fall26/resources/lectures" target="_blank" rel="noopener">Fall 2026 course site</a>.
      Quiz 2 (Wed Nov 4, 7:30-9:30pm) covers L7-L15. Problems tagged <b>Past quiz</b> and <b>Worksheet</b>
      are the official ones, shown as the original pages with the official solutions; the past quizzes
      can also be taken as timed 2-hour exams. The other problems are written practice modeled on them.
      Hex (<code>0x1F</code>) and binary (<code>0b101</code>) answers are accepted, and integer answers must match exactly.`,
    answerPlaceholder: "e.g. 42, 0x1F4, 0b1011, 1/8, 49/24",
    units: [
      { name: "Background from Quiz 1", lectures: [
        { n: 6, title: "Sequential Circuits" },
      ] },
      { name: "Quiz 2: Lectures 7-15", lectures: [
        { n: 7, title: "Sequential Circuits in Minispec" },
        { n: 8, title: "Introduction to Pipelining" },
        { n: 9, title: "Design Tradeoffs in Sequential Circuits" },
        { n: 10, title: "Compilers and RISC-V Assembly" },
        { n: 11, title: "RISC-V Processor" },
        { n: 12, title: "Memory Hierarchy" },
        { n: 13, title: "Caches" },
        { n: 14, title: "Pipelined Processors" },
        { n: 15, title: "Data and Control Hazards in Pipelined Processors" },
      ], exam: { id: "quiz2", name: "Quiz 2" } },
    ],
    // The drawn quiz2 uses single-answer practice problems. The past quizzes are the real
    // six multi-part problems in two hours.
    exams: {
      quiz2: { name: "Quiz 2", from: 7, to: 15, count: 14, minutes: 120 },
      fa25: { name: "Fall 2025 Quiz 2", ids: [1501, 1502, 1503, 1504, 1505, 1506], minutes: 120 },
      sp25: { name: "Spring 2025 Quiz 2", ids: [1507, 1508, 1509, 1510, 1511, 1512], minutes: 120 },
      sp26: { name: "Spring 2026 Quiz 2", ids: [1513, 1514, 1515, 1516, 1517, 1518], minutes: 120 },
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
