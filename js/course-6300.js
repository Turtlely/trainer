// Course structure for MIT 6.3000 Signal Processing, Fall 2026.
// Lecture titles and order follow the Fall 2026 calendar on sigproc.mit.edu/fall26.
// Quiz 2 (Tue Nov 10) covers lectures and recitations up to Oct 29 and Homework 8 (L1-L13 here).
// Load this file after course.js.
(function (root) {
  root.addCourse({
    code: "6.3000",
    name: "Signal Processing",
    term: "Fall 2026",
    source: "https://sigproc.mit.edu/fall26",
    blurb: `Problems sorted by lecture. Lecture titles follow the
      <a class="link" href="https://sigproc.mit.edu/fall26" target="_blank" rel="noopener">Fall 2026 course site</a>.
      Quiz 2 (Tue Nov 10, 2:05-3:55pm, Walker 50-340) covers everything up to Oct 29 and Homework 8:
      Fourier series and transforms, systems, convolution, frequency response, communication systems, and the DFT.
      Conventions follow 6.3000: Fourier series and DFT analysis equations carry the 1/T or 1/N factor;
      ω is CT angular frequency (rad/s) and Ω is DT angular frequency (rad/sample).
      Answers can be expressions such as <code>pi/4</code>, <code>sqrt(2)/2</code>, or <code>1/(1-0.5)</code>.`,
    answerPlaceholder: "e.g. 3, -1/2, pi/4, sqrt(2), 2/pi",
    units: [
      { name: "Quiz 1 background: Fourier series and transforms", lectures: [
        { n: 1, title: "Signal Processing (CT Fourier series, trig form)" },
        { n: 2, title: "Sinusoids and Series (complex form)" },
        { n: 3, title: "Fourier Series" },
        { n: 4, title: "Sampling and Aliasing" },
        { n: 5, title: "DT Fourier Series" },
        { n: 6, title: "CT Fourier Transform" },
        { n: 7, title: "DT Fourier Transform" },
      ] },
      { name: "Quiz 2: systems, filtering, and the DFT", lectures: [
        { n: 8, title: "Systems" },
        { n: 9, title: "Unit-Sample Response and Convolution" },
        { n: 10, title: "Frequency Response and Filtering" },
        { n: 11, title: "Communication Systems" },
        { n: 12, title: "Discrete Fourier Transform 1" },
        { n: 13, title: "Discrete Fourier Transform 2 (circular convolution)" },
      ], exam: { id: "quiz2", name: "Quiz 2" } },
    ],
    // The drawn quiz uses single-answer practice problems. The past quizzes are the real
    // problems (some link to the official PDF for hand-drawn figures).
    exams: {
      quiz2: { name: "Quiz 2 (drawn)", from: 1, to: 13, count: 14, minutes: 110 },
      sp25: { name: "Spring 2025 Quiz 2", ids: [3501, 3502, 3503, 3504], minutes: 110 },
      fa23: { name: "Fall 2023 Quiz 2", ids: [3511, 3512, 3513, 3514], minutes: 110 },
      fa22: { name: "Fall 2022 Quiz 2", ids: [3521, 3522, 3523, 3524], minutes: 110 },
      sp22: { name: "Spring 2022 Quiz 2", ids: [3531, 3532, 3533, 3534], minutes: 110 },
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
