// Problem bank, part 5: Quiz 2 practice for 6.3700 Fall 2026, Lectures 8-12
// (continuous random variables, joint and conditional PDFs, continuous Bayes rule,
// derived distributions, convolution, covariance and correlation).
// These are original problems written in the style of the course. `lec` uses the
// Fall 2026 lecture numbers. `tol` is set for answers that come from the normal table.
(function (root) {
  const t = String.raw;
  const P = (root.PROBLEMS = root.PROBLEMS || []);
  const add = (p) => P.push(p);
  const NT = "(Use the normal table. Answers within $1\\%$ are accepted.)";

  // ======================================================================
  // Lecture 8: PDFs, CDFs, uniform, normal, exponential, mixed distributions
  // ======================================================================
  add({ id: 300, lec: 8, title: "Linear Density", diff: "Easy", topics: ["Continuous Distributions"], answer: "5/9",
    statement: t`$X$ has PDF $f_X(x) = c(1 - x)$ for $0 \le x \le 1$, and $0$ otherwise. What is $P(X \le 1/3)$?`,
    hints: [t`Normalize first: $\int_0^1 c(1-x)\,dx = c/2$.`, t`$F_X(x) = 1 - (1-x)^2$ on $[0,1]$.`],
    solution: t`$c = 2$. $P(X \le 1/3) = \int_0^{1/3} 2(1-x)\,dx = 1 - (2/3)^2 = 5/9$.` });

  add({ id: 301, lec: 8, title: "Piecewise Constant PDF", diff: "Easy", topics: ["Continuous Distributions"], answer: "1/2",
    statement: t`$X$ has PDF $f_X(x) = c$ for $0 \le x \le 2$, $f_X(x) = 3c$ for $2 < x \le 3$, and $0$ otherwise. What is $P(1 \le X \le 2.5)$?`,
    hints: [t`Total area: $2c + 3c = 1$.`],
    solution: t`$c = 1/5$. $P(1 \le X \le 2.5) = c\cdot1 + 3c\cdot0.5 = 2.5c = 1/2$.` });

  add({ id: 302, lec: 8, title: "Uniform Third Moment", diff: "Easy", topics: ["Continuous Distributions"], answer: "10",
    statement: t`$X$ is uniform on $[1, 3]$. What is $E[X^3]$?`,
    hints: [t`$E[g(X)] = \int g(x)f_X(x)\,dx$ with $f_X = 1/2$.`],
    solution: t`$\frac12\int_1^3 x^3\,dx = \frac12\cdot\frac{81 - 1}{4} = 10$. Note that $E[X]^3 = 8 \ne 10$.` });

  add({ id: 303, lec: 8, title: "Uniform from Mean and Variance", diff: "Easy", topics: ["Continuous Distributions"], answer: "1/6",
    statement: t`$X$ is uniform on an interval $[a, b]$, with $E[X] = 5$ and $\operatorname{Var}(X) = 3$. What is $P(X > 7)$?`,
    hints: [t`$(b-a)^2/12 = 3$ and $(a+b)/2 = 5$.`],
    solution: t`$b - a = 6$ and $a + b = 10$, so $X$ is uniform on $[2, 8]$. $P(X > 7) = 1/6$.` });

  add({ id: 304, lec: 8, title: "Server Outage Window", diff: "Easy", topics: ["Exponential"], answer: "exp(-0.2)-exp(-0.4)",
    statement: t`The time until a server first fails is exponential with mean $5$ hours. What is the probability that the first failure happens between hour $1$ and hour $2$?`,
    hints: [t`$P(X > x) = e^{-\lambda x}$ with $\lambda = 1/5$.`],
    solution: t`$P(1 < X < 2) = e^{-1/5} - e^{-2/5} \approx 0.8187 - 0.6703 = 0.1484$.` });

  add({ id: 305, lec: 8, title: "Exponential from a Tail", diff: "Medium", topics: ["Exponential"], answer: "5^(-1/3)-5^(-2/3)",
    statement: t`A job's waiting time $T$ (hours) is exponential. You know $P(T > 3) = 0.2$. What is $P(1 < T < 2)$?`,
    hints: [t`$e^{-3\lambda} = 1/5$, so $e^{-\lambda} = 5^{-1/3}$.`],
    solution: t`$P(1 < T < 2) = e^{-\lambda} - e^{-2\lambda} = 5^{-1/3} - 5^{-2/3} \approx 0.5848 - 0.3420 = 0.2428$.` });

  add({ id: 306, lec: 8, title: "Exponential Median from a Tail", diff: "Easy", topics: ["Exponential"], answer: "3*ln(2)/ln(5)",
    statement: t`Same model: $T$ is exponential with $P(T > 3) = 0.2$. What is the median of $T$?`,
    hints: [t`Solve $e^{-\lambda m} = 1/2$ with $\lambda = \ln 5 / 3$.`],
    solution: t`$m = \frac{\ln 2}{\lambda} = \frac{3\ln 2}{\ln 5} \approx 1.292$ hours.` });

  add({ id: 307, lec: 8, title: "Exponential Variance", diff: "Easy", topics: ["Exponential", "Variance"], answer: "1/9",
    statement: t`$X$ is exponential with parameter $\lambda = 3$. What is $\operatorname{Var}(X)$?`,
    hints: [t`$E[X] = 1/\lambda$ and $E[X^2] = 2/\lambda^2$.`],
    solution: t`$\operatorname{Var}(X) = 2/\lambda^2 - 1/\lambda^2 = 1/\lambda^2 = 1/9$.` });

  add({ id: 308, lec: 8, title: "Memoryless Lifetime", diff: "Easy", topics: ["Exponential", "Conditional Probability"], answer: "exp(-1.5)",
    statement: t`A bulb's lifetime $X$ is exponential with mean $2$ years. Given that the bulb still works after $2$ years, what is the probability that it still works after $5$ years?`,
    hints: [t`$P(X > c + x \mid X > c) = P(X > x)$.`],
    solution: t`$P(X > 5 \mid X > 2) = P(X > 3) = e^{-3/2} \approx 0.2231$.` });

  add({ id: 309, lec: 8, title: "Within One Standard Deviation", diff: "Medium", topics: ["Exponential"], answer: "1-exp(-2)",
    statement: t`$X$ is exponential with parameter $\lambda$. What is $P\big(|X - E[X]| < \sigma_X\big)$? (The answer does not depend on $\lambda$.)`,
    hints: [t`$E[X] = \sigma_X = 1/\lambda$.`],
    solution: t`The event is $0 < X < 2/\lambda$. Its probability is $1 - e^{-2} \approx 0.8647$.` });

  add({ id: 310, lec: 8, title: "Above the Mean", diff: "Easy", topics: ["Exponential"], answer: "exp(-1)",
    statement: t`$X$ is exponential with parameter $\lambda$. What is $P(X > E[X])$?`,
    hints: [t`$E[X] = 1/\lambda$.`],
    solution: t`$e^{-\lambda\cdot(1/\lambda)} = e^{-1} \approx 0.368$. An exponential is below its mean more often than not.` });

  add({ id: 311, lec: 8, title: "Normal Interval", diff: "Easy", topics: ["Normal Distribution"], answer: "0.6247", tol: 0.01,
    statement: t`$Y$ is normal with mean $100$ and variance $36$. What is $P(91 < Y < 103)$? ${NT}`,
    hints: [t`Standardize with $\sigma = 6$.`],
    solution: t`$P\left(-1.5 < Z < 0.5\right) = \Phi(0.5) - \Phi(-1.5) = 0.6915 - (1 - 0.9332) = 0.6247$.` });

  add({ id: 312, lec: 8, title: "Normal Tail", diff: "Easy", topics: ["Normal Distribution"], answer: "0.1587", tol: 0.01,
    statement: t`$X \sim N(-1, 9)$. What is $P(X > 2)$? ${NT}`,
    hints: [t`$\sigma = 3$.`],
    solution: t`$P\left(Z > \frac{2 - (-1)}{3}\right) = 1 - \Phi(1) = 0.1587$.` });

  add({ id: 313, lec: 8, title: "Symmetric Normal Window", diff: "Easy", topics: ["Normal Distribution"], answer: "0.8664", tol: 0.01,
    statement: t`$X \sim N(-1, 9)$. What is $P(|X + 1| < 4.5)$? ${NT}`,
    hints: [t`This is $P(|Z| < 1.5)$.`],
    solution: t`$2\Phi(1.5) - 1 = 2(0.9332) - 1 = 0.8664$.` });

  add({ id: 314, lec: 8, title: "Normal Percentile", diff: "Easy", topics: ["Normal Distribution"], answer: "13", tol: 0.005,
    statement: t`$X \sim N(10, 4)$. Find $c$ such that $P(X \le c) = 0.9332$.`,
    hints: [t`$\Phi(1.5) = 0.9332$.`],
    solution: t`$\frac{c - 10}{2} = 1.5$, so $c = 13$.` });

  add({ id: 315, lec: 8, title: "Standardizing Constant", diff: "Easy", topics: ["Normal Distribution"], answer: "-17.5",
    statement: t`$Y$ is normal with mean $70$ and variance $16$. Find $b$ such that $Z = \tfrac14 Y + b$ has mean $0$ and variance $1$.`,
    hints: [t`$E[Z] = \tfrac14\cdot70 + b$.`],
    solution: t`$b = -70/4 = -17.5$. Then $Z = (Y - 70)/4 \sim N(0,1)$.` });

  add({ id: 316, lec: 8, title: "Linear Map of a Normal", diff: "Easy", topics: ["Normal Distribution"], answer: "0.1587", tol: 0.01,
    statement: t`$X \sim N(0,1)$ and $Y = 3 - 2X$. What is $P(Y > 5)$? ${NT}`,
    hints: [t`$Y > 5$ is the same event as $X < -1$.`],
    solution: t`$P(X < -1) = 1 - \Phi(1) = 0.1587$. Also, $Y \sim N(3, 4)$, which gives the same answer.` });

  add({ id: 317, lec: 8, title: "Mean Absolute Value of a Normal", diff: "Medium", topics: ["Normal Distribution"], answer: "2*sqrt(2/pi)",
    statement: t`$X$ is normal with mean $0$ and variance $4$. What is $E[|X|]$?`,
    hints: [t`$X = 2Z$, and $E|Z| = \sqrt{2/\pi}$.`, t`$E|Z| = 2\int_0^\infty z\frac{1}{\sqrt{2\pi}}e^{-z^2/2}\,dz$.`],
    solution: t`$E|X| = 2E|Z| = 2\sqrt{2/\pi} \approx 1.596$.` });

  add({ id: 318, lec: 8, title: "Mixed Distribution", diff: "Medium", topics: ["Continuous Distributions", "Mixed Distributions"], answer: "11/9",
    statement: t`With probability $1/3$, $X = 1$ exactly. Otherwise, $X$ is uniform on $[0, 2]$. What is $E[X^2]$?`,
    hints: [t`Use total expectation over the two cases.`, t`For uniform on $[0,2]$, $E[X^2] = 4/3$.`],
    solution: t`$E[X^2] = \tfrac13\cdot1 + \tfrac23\cdot\tfrac43 = \tfrac13 + \tfrac89 = \tfrac{11}{9}$.` });

  add({ id: 319, lec: 8, title: "Mean from a Mixed CDF", diff: "Medium", topics: ["Continuous Distributions", "Mixed Distributions"], answer: "11/8",
    statement: t`$X$ has CDF $F(x) = 0$ for $x < 0$, $F(x) = x/4$ for $0 \le x < 1$, $F(x) = 1/2$ for $1 \le x < 2$, and $F(x) = 1$ for $x \ge 2$. What is $E[X]$?`,
    hints: [t`Jumps in the CDF are point masses. Here $P(X=1) = 1/4$ and $P(X = 2) = 1/2$.`, t`On $[0,1)$ there is a density $1/4$.`],
    solution: t`$E[X] = \int_0^1 \frac x4\,dx + 1\cdot\frac14 + 2\cdot\frac12 = \frac18 + \frac14 + 1 = \frac{11}{8}$.` });

  add({ id: 320, lec: 8, title: "Mean from the Tail", diff: "Medium", topics: ["Continuous Distributions"], answer: "1/2",
    statement: t`$X \ge 0$ has $P(X > x) = (1 + x)^{-3}$ for $x \ge 0$. What is $E[X]$?`,
    hints: [t`For $X \ge 0$, $E[X] = \int_0^\infty P(X > x)\,dx$.`],
    solution: t`$\int_0^\infty (1+x)^{-3}\,dx = \left[-\tfrac12(1+x)^{-2}\right]_0^\infty = \tfrac12$.` });

  add({ id: 321, lec: 8, title: "Height Above the Base", diff: "Medium", topics: ["Continuous Distributions", "Geometric Probability"], answer: "3/4",
    statement: t`A point is chosen uniformly in a triangle of height $2$. $X$ is the distance from the point to the base. What is $P(X \le 1)$?`,
    hints: [t`$P(X > x)$ is the area of the small similar triangle above height $x$, divided by the total area.`],
    solution: t`$P(X > x) = (1 - x/h)^2$. With $h = 2$ and $x = 1$: $P(X > 1) = 1/4$, so $P(X \le 1) = 3/4$.` });

  add({ id: 322, lec: 8, title: "Density Above the Base", diff: "Medium", topics: ["Continuous Distributions", "Geometric Probability"], answer: "3/4",
    statement: t`Same triangle of height $2$. What is the value of the PDF $f_X(x)$ at $x = 0.5$?`,
    hints: [t`Differentiate $F_X(x) = 1 - (1 - x/2)^2$.`],
    solution: t`$f_X(x) = 2\cdot\frac12(1 - x/2) = 1 - x/2$. At $x = 0.5$: $0.75$.` });

  add({ id: 323, lec: 8, title: "Heavy Tail", diff: "Easy", topics: ["Continuous Distributions"], answer: "1/3",
    statement: t`$X$ has PDF $f_X(x) = 1/x^2$ for $x \ge 1$, and $0$ otherwise. What is $P(X > 3)$?`,
    hints: [t`$\int_3^\infty x^{-2}\,dx$.`],
    solution: t`$1/3$. (Note that $E[X] = \int_1^\infty \frac1x\,dx$ is infinite.)` });

  add({ id: 324, lec: 8, title: "Meteor Before Noon", diff: "Easy", topics: ["Exponential"], answer: "1-exp(-0.05)",
    statement: t`The time until a meteor first lands in a desert is exponential with mean $10$ days. It is now midnight. What is the probability that the first meteor lands before noon today?`,
    hints: [t`Noon is $0.5$ days away.`],
    solution: t`$1 - e^{-0.5/10} = 1 - e^{-0.05} \approx 0.0488$.` });

  // ======================================================================
  // Lecture 9: joint PDFs, marginals, independence, conditioning
  // ======================================================================
  add({ id: 330, lec: 9, title: "Joint Density Constant", diff: "Easy", topics: ["Joint Distributions"], answer: "1/4",
    statement: t`$f_{X,Y}(x,y) = a x^2$ on the region $0 \le y \le x \le 2$, and $0$ otherwise. What is $a$?`,
    hints: [t`Integrate $y$ first: $\int_0^x a x^2\,dy = a x^3$.`],
    solution: t`$\int_0^2 a x^3\,dx = 4a = 1$, so $a = 1/4$.` });

  add({ id: 331, lec: 9, title: "Marginal from a Triangle", diff: "Medium", topics: ["Joint Distributions"], answer: "7/12",
    statement: t`Same joint PDF: $f_{X,Y}(x,y) = x^2/4$ on $0 \le y \le x \le 2$. What is $f_Y(1)$?`,
    hints: [t`For fixed $y$, $x$ ranges from $y$ to $2$.`],
    solution: t`$f_Y(y) = \int_y^2 \frac{x^2}{4}\,dx = \frac{8 - y^3}{12}$. At $y = 1$: $7/12$.` });

  add({ id: 332, lec: 9, title: "Mean of Y on a Triangle", diff: "Medium", topics: ["Joint Distributions", "Conditional Expectation"], answer: "4/5",
    statement: t`Same joint PDF: $f_{X,Y}(x,y) = x^2/4$ on $0 \le y \le x \le 2$. What is $E[Y]$?`,
    hints: [t`Given $X = x$, $Y$ is uniform on $[0, x]$.`],
    solution: t`$f_X(x) = x^3/4$ and $E[Y \mid X] = X/2$. So $E[Y] = \tfrac12 E[X] = \tfrac12\int_0^2 \frac{x^4}{4}\,dx = \tfrac12\cdot\tfrac{8}{5} = \tfrac45$.` });

  add({ id: 333, lec: 9, title: "Coffee Line Constant", diff: "Easy", topics: ["Joint Distributions"], answer: "1/4",
    statement: t`$f_{X,Y}(x,y) = c(x + y)$ for $0 < y < x < 2$, and $0$ otherwise. What is $c$?`,
    hints: [t`$\int_0^x (x+y)\,dy = \tfrac32x^2$.`],
    solution: t`$c\int_0^2 \tfrac32 x^2\,dx = 4c = 1$, so $c = 1/4$.` });

  add({ id: 334, lec: 9, title: "Coffee Line Deadline", diff: "Medium", topics: ["Joint Distributions"], answer: "1/3",
    statement: t`Same joint PDF: $f_{X,Y}(x,y) = (x+y)/4$ for $0 < y < x < 2$. What is $P(X + Y < 2)$?`,
    hints: [t`Sketch the region. With $y$ outside, $y$ goes from $0$ to $1$ and $x$ from $y$ to $2 - y$.`],
    solution: t`$$\int_0^1\!\int_y^{2-y}\frac{x+y}{4}\,dx\,dy = \int_0^1 \frac{2 - 2y^2}{4}\,dy = \frac{1}{4}\left(2 - \frac23\right) = \frac13.$$` });

  add({ id: 335, lec: 9, title: "Joint CDF on the Square", diff: "Easy", topics: ["Joint Distributions"], answer: "0.3",
    statement: t`$(X,Y)$ is uniform on the unit square. What is the joint CDF $F_{X,Y}(0.5, 0.6)$?`,
    hints: [t`$F_{X,Y}(x,y) = P(X \le x, Y \le y)$.`],
    solution: t`$0.5\cdot0.6 = 0.3$. For points outside the square, clip each coordinate to $[0,1]$ first.` });

  add({ id: 336, lec: 9, title: "Conditional Mean on a Wedge", diff: "Medium", topics: ["Joint Distributions", "Conditional Expectation"], answer: "0.4",
    statement: t`$f_{X,Y}(x,y) = 8xy$ for $0 < y < x < 1$. What is $E[Y \mid X = 0.6]$?`,
    hints: [t`$f_{Y|X}(y \mid x) = \frac{8xy}{f_X(x)}$ with $f_X(x) = 4x^3$.`],
    solution: t`$f_{Y|X}(y\mid x) = 2y/x^2$ on $[0,x]$. $E[Y \mid X = x] = \int_0^x y\frac{2y}{x^2}\,dy = \frac{2x}{3}$. At $x = 0.6$: $0.4$.` });

  add({ id: 337, lec: 9, title: "Marginal of the Wedge", diff: "Easy", topics: ["Joint Distributions"], answer: "1/16",
    statement: t`$f_{X,Y}(x,y) = 8xy$ for $0 < y < x < 1$. What is $P(X < 1/2)$?`,
    hints: [t`$f_X(x) = \int_0^x 8xy\,dy = 4x^3$.`],
    solution: t`$P(X < 1/2) = (1/2)^4 = 1/16$. Note that $X$ and $Y$ are not independent: the support is not a rectangle.` });

  add({ id: 338, lec: 9, title: "Disk Marginal", diff: "Medium", topics: ["Joint Distributions", "Geometric Probability"], answer: "1.6/pi",
    statement: t`$(X, Y)$ is uniform on the unit disk. What is $f_X(0.6)$?`,
    hints: [t`$f_X(x) = \int \frac1\pi\,dy$ over the vertical chord at $x$.`],
    solution: t`The chord has length $2\sqrt{1 - x^2}$, so $f_X(x) = \frac{2}{\pi}\sqrt{1 - x^2}$. At $x = 0.6$: $\frac{2\cdot0.8}{\pi} \approx 0.509$.` });

  add({ id: 339, lec: 9, title: "Who Finishes First", diff: "Easy", topics: ["Exponential", "Joint Distributions"], answer: "5/8",
    statement: t`Alice and Bob work independently. Their finishing times are exponential with means $3$ and $5$ hours. What is the probability that Alice finishes first?`,
    hints: [t`$P(A < B) = \frac{\lambda_A}{\lambda_A + \lambda_B}$.`],
    solution: t`$\frac{1/3}{1/3 + 1/5} = \frac{5}{8}$.` });

  add({ id: 340, lec: 9, title: "Who Finishes First, Given a Slow Start", diff: "Hard", topics: ["Exponential", "Joint Distributions", "Conditional Probability"], answer: "(5/8)*exp(-0.6)",
    statement: t`Same model: means $3$ (Alice) and $5$ (Bob) hours. Given that Alice took more than $3$ hours, what is the probability that she finished before Bob?`,
    hints: [t`Compute $P(3 < A < B)$ and divide by $P(A > 3)$.`, t`Bob must also last past $3$ hours. After that, memorylessness restarts both clocks.`],
    solution: t`For Alice to win, Bob must survive past $3$: probability $e^{-3/5}$. Then both clocks restart, and Alice wins with probability $5/8$. So the answer is $\frac58e^{-0.6} \approx 0.343$.` });

  add({ id: 341, lec: 9, title: "An Hour Apart", diff: "Hard", topics: ["Exponential", "Joint Distributions"], answer: "(5/8)*exp(-1/5)+(3/8)*exp(-1/3)",
    statement: t`Same model: means $3$ (Alice) and $5$ (Bob) hours. What is the probability that one of them finishes at least one hour before the other?`,
    hints: [t`$P(B > A + 1) = P(A < B)\cdot e^{-\lambda_B}$ by memorylessness.`],
    solution: t`$P(B > A + 1) = \frac58e^{-1/5}$ and $P(A > B + 1) = \frac38e^{-1/3}$. The total is $\approx 0.5117 + 0.2687 = 0.7804$.` });

  add({ id: 342, lec: 9, title: "Back-to-Back Appointments", diff: "Medium", topics: ["Exponential", "Conditional Expectation"], answer: "30+20*exp(-0.5)",
    statement: t`Two appointments are booked for the same time. Each lasts an independent exponential time with mean $20$ minutes. The first student arrives on time. The second arrives $10$ minutes late and waits for the first appointment to end. What is the expected time from the first student's arrival to the second student's departure?`,
    hints: [t`The second appointment starts at $\max(T_1, 10)$.`, t`$E[\max(T_1, 10)] = 10 + E[(T_1 - 10)^+] = 10 + P(T_1 > 10)\cdot 20$.`],
    solution: t`$E[\max(T_1,10)] = 10 + 20e^{-1/2}$. Add the second appointment: $30 + 20e^{-1/2} \approx 42.13$ minutes.` });

  add({ id: 343, lec: 9, title: "Short Needle", diff: "Easy", topics: ["Geometric Probability", "Joint Distributions"], answer: "1/pi",
    statement: t`Parallel lines are $d = 2$ apart. A needle of length $\ell = 1$ is dropped at random. What is the probability that it crosses a line?`,
    hints: [t`Buffon: $P = \frac{2\ell}{\pi d}$ for $\ell \le d$.`],
    solution: t`$\frac{2\cdot1}{\pi\cdot2} = \frac{1}{\pi} \approx 0.318$.` });

  add({ id: 344, lec: 9, title: "Conditioning on a Tail Event", diff: "Medium", topics: ["Conditional Expectation", "Continuous Distributions"], answer: "28/9",
    statement: t`$X$ has PDF $f_X(x) = x/8$ for $0 \le x \le 4$. Let $A = \{X \ge 2\}$. What is $E[X \mid A]$?`,
    hints: [t`$P(A) = 3/4$, and $f_{X|A}(x) = \frac{x/8}{3/4}$ on $[2,4]$.`],
    solution: t`$E[X\mid A] = \frac{1}{3/4}\int_2^4 \frac{x^2}{8}\,dx = \frac43\cdot\frac{56}{24} = \frac{28}{9} \approx 3.111$.` });

  add({ id: 345, lec: 9, title: "Conditional Density of a Heavy Tail", diff: "Medium", topics: ["Conditional Expectation", "Continuous Distributions"], answer: "1/8",
    statement: t`$X$ has PDF $1/x^2$ for $x \ge 1$. What is the conditional PDF $f_{X|X>2}(x)$ at $x = 4$?`,
    hints: [t`$f_{X|A}(x) = f_X(x)/P(A)$ for $x \in A$.`],
    solution: t`$P(X > 2) = 1/2$, so $f_{X|X>2}(x) = 2/x^2$ for $x > 2$. At $x = 4$: $1/8$.` });

  add({ id: 346, lec: 9, title: "Mail Time Density", diff: "Easy", topics: ["Continuous Distributions", "Total Probability"], answer: "7/18",
    statement: t`With probability $1/3$, a package arrives at a time uniform on $[0, 2]$. Otherwise it arrives at a time uniform on $[1, 4]$. What is the PDF of the arrival time at $1.5$?`,
    hints: [t`$f_X(x) = \sum_i P(A_i) f_{X|A_i}(x)$.`],
    solution: t`$\frac13\cdot\frac12 + \frac23\cdot\frac13 = \frac16 + \frac29 = \frac{7}{18}$.` });

  add({ id: 347, lec: 9, title: "Conditional Exponential Density", diff: "Easy", topics: ["Exponential", "Conditional Probability"], answer: "0.5*exp(-1)",
    statement: t`$X$ is exponential with $\lambda = 1/2$. For small $\delta > 0$, $P(4 \le X \le 4 + \delta \mid X > 2) \approx c\,\delta$. What is $c$?`,
    hints: [t`Given $X > 2$, $X - 2$ is again exponential with the same $\lambda$.`],
    solution: t`$c = f_{X|X>2}(4) = \lambda e^{-\lambda(4-2)} = \tfrac12e^{-1} \approx 0.184$.` });

  add({ id: 348, lec: 9, title: "Two Bulbs, One Survives", diff: "Easy", topics: ["Exponential", "Joint Distributions"], answer: "(1-exp(-1))*(1-exp(-2))",
    statement: t`Two independent bulbs have exponential lifetimes with rates $1$ and $2$. What is the probability that both have failed by time $1$?`,
    hints: [t`$P(\max \le 1) = P(X_1 \le 1)P(X_2 \le 1)$.`],
    solution: t`$(1 - e^{-1})(1 - e^{-2}) \approx 0.6321\cdot0.8647 = 0.5466$.` });

  add({ id: 349, lec: 9, title: "Median of Three", diff: "Medium", topics: ["Order Statistics", "Joint Distributions"], answer: "5/32",
    statement: t`$X_1, X_2, X_3$ are independent and uniform on $[0,1]$. $M$ is their median. What is $P(M \le 1/4)$?`,
    hints: [t`$M \le y$ means at least $2$ of the $3$ values are $\le y$.`],
    solution: t`$P(M \le y) = 3y^2(1 - y) + y^3 = 3y^2 - 2y^3$. At $y = 1/4$: $\frac{3}{16} - \frac{2}{64} = \frac{5}{32}$.` });

  add({ id: 350, lec: 9, title: "Under a Parabola", diff: "Medium", topics: ["Joint Distributions", "Conditional Expectation"], answer: "3/10",
    statement: t`$(X, Y)$ is uniform on the region $\{0 \le x \le 1,\ 0 \le y \le x^2\}$. What is $E[Y]$?`,
    hints: [t`The region has area $1/3$, so the density is $3$. Then $f_X(x) = 3x^2$.`, t`Given $X = x$, $Y$ is uniform on $[0, x^2]$.`],
    solution: t`$E[Y] = E[X^2/2] = \tfrac12\int_0^1 x^2\cdot3x^2\,dx = \tfrac12\cdot\tfrac35 = \tfrac{3}{10}$.` });

  add({ id: 351, lec: 9, title: "Above a Parabola", diff: "Easy", topics: ["Joint Distributions", "Geometric Probability"], answer: "2/3",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is $P(Y > X^2)$?`,
    hints: [t`$\int_0^1 (1 - x^2)\,dx$.`],
    solution: t`$1 - 1/3 = 2/3$.` });

  add({ id: 352, lec: 9, title: "Independent Product Density", diff: "Easy", topics: ["Joint Distributions"], answer: "1/2",
    statement: t`$f_{X,Y}(x,y) = 4xy$ on the unit square. What is $P(X < Y)$?`,
    hints: [t`The joint PDF factors as $2x\cdot2y$, so $X$ and $Y$ are i.i.d.`],
    solution: t`$X$ and $Y$ are independent with the same continuous distribution. By symmetry $P(X < Y) = 1/2$.` });

  add({ id: 353, lec: 9, title: "Sum Above One and a Half", diff: "Easy", topics: ["Joint Distributions", "Geometric Probability"], answer: "1/8",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is $P(X + Y > 1.5)$?`,
    hints: [t`The region is a corner triangle with legs $1/2$.`],
    solution: t`$\frac12\cdot\frac12\cdot\frac12 = \frac18$.` });

  // ======================================================================
  // Lecture 10: continuous total probability / expectation, Bayes rule
  // ======================================================================
  add({ id: 360, lec: 10, title: "Drone or Robot: Mean", diff: "Easy", topics: ["Total Probability", "Conditional Expectation"], answer: "21/4",
    statement: t`A campus order is delivered by drone with probability $1/4$, and then the delivery time $T$ is uniform on $[1, 5]$ minutes. Otherwise a robot delivers it, and $T$ is uniform on $[3, 9]$. What is $E[T]$?`,
    hints: [t`Total expectation: $E[T] = P(A)E[T\mid A] + P(A^c)E[T \mid A^c]$.`],
    solution: t`$\frac14\cdot3 + \frac34\cdot6 = 5.25$ minutes.` });

  add({ id: 361, lec: 10, title: "Drone or Robot: Density", diff: "Easy", topics: ["Total Probability"], answer: "3/16",
    statement: t`Same model (drone $1/4$ with $T \sim U[1,5]$; robot $3/4$ with $T \sim U[3,9]$). What is $f_T(4)$?`,
    hints: [t`Both conditional densities are positive at $t = 4$.`],
    solution: t`$\frac14\cdot\frac14 + \frac34\cdot\frac16 = \frac1{16} + \frac18 = \frac{3}{16}$.` });

  add({ id: 362, lec: 10, title: "Drone or Robot: Bayes", diff: "Medium", topics: ["Bayes", "Mixed Bayes"], answer: "1/3",
    statement: t`Same model. The order arrives at exactly $T = 4$ minutes. What is the probability that a drone delivered it?`,
    hints: [t`$P(A \mid T = t) = \frac{P(A)f_{T|A}(t)}{f_T(t)}$.`],
    solution: t`$\frac{1/16}{3/16} = \frac13$.` });

  add({ id: 363, lec: 10, title: "Drone or Robot: Variance", diff: "Hard", topics: ["Variance", "Conditional Expectation"], answer: "205/48",
    statement: t`Same model. What is $\operatorname{Var}(T)$?`,
    hints: [t`Find $E[T^2]$ by total expectation, using $E[T^2 \mid A] = \operatorname{Var}(T\mid A) + E[T \mid A]^2$.`],
    solution: t`$E[T^2 \mid A] = \tfrac{16}{12} + 9 = \tfrac{31}{3}$ and $E[T^2 \mid A^c] = 3 + 36 = 39$. So $E[T^2] = \tfrac14\cdot\tfrac{31}3 + \tfrac34\cdot39 = \tfrac{191}{6}$. Then $\operatorname{Var}(T) = \tfrac{191}{6} - \tfrac{441}{16} = \tfrac{205}{48} \approx 4.271$.` });

  add({ id: 364, lec: 10, title: "Stick Broken Twice: Density", diff: "Medium", topics: ["Total Probability", "Joint Distributions"], answer: "ln(4)",
    statement: t`Break a stick of length $1$ at $X \sim U[0,1]$, keep $[0, X]$, then break that at $Y \sim U[0, X]$. What is $f_Y(1/4)$?`,
    hints: [t`$f_{X,Y}(x,y) = \frac1x$ for $0 \le y \le x \le 1$.`],
    solution: t`$f_Y(y) = \int_y^1 \frac{1}{x}\,dx = \ln(1/y)$. At $y = 1/4$: $\ln 4 \approx 1.386$.` });

  add({ id: 365, lec: 10, title: "Stick Broken Twice: Probability", diff: "Medium", topics: ["Total Probability"], answer: "1/2+ln(2)/2",
    statement: t`Same stick: $X \sim U[0,1]$ and $Y \mid X \sim U[0, X]$. What is $P(Y < 1/2)$?`,
    hints: [t`Integrate $f_Y(y) = -\ln y$ from $0$ to $1/2$.`, t`Or: $P(Y < 1/2 \mid X = x) = \min(1, \frac{1}{2x})$.`],
    solution: t`$\int_0^{1/2}-\ln y\,dy = \left[y - y\ln y\right]_0^{1/2} = \frac12 + \frac12\ln2 \approx 0.847$.` });

  add({ id: 366, lec: 10, title: "Longer, Then Shorter", diff: "Medium", topics: ["Conditional Expectation"], answer: "3/16",
    statement: t`Break a stick of length $1$ at a uniform point and keep the longer piece. Break that piece at a uniform point and keep the shorter piece. What is the expected length of the final piece?`,
    hints: [t`The longer piece $L$ is uniform on $[1/2, 1]$.`, t`Given $L$, the shorter piece of $L$ is uniform on $[0, L/2]$.`],
    solution: t`$E[S] = E[L/4] = \frac14\cdot\frac34 = \frac{3}{16}$.` });

  add({ id: 367, lec: 10, title: "Random Bias: Heads", diff: "Easy", topics: ["Bayes", "Mixed Bayes"], answer: "2/3",
    statement: t`A coin's heads probability $P$ has PDF $f_P(p) = 2p$ on $[0,1]$. You toss it once. What is the probability of heads?`,
    hints: [t`$P(H) = \int_0^1 p f_P(p)\,dp = E[P]$.`],
    solution: t`$\int_0^1 2p^2\,dp = 2/3$.` });

  add({ id: 368, lec: 10, title: "Random Bias: Posterior Density", diff: "Medium", topics: ["Bayes", "Mixed Bayes"], answer: "3/4",
    statement: t`Same coin: $f_P(p) = 2p$. The first toss is heads. What is the posterior density $f_{P|H}(p)$ at $p = 1/2$?`,
    hints: [t`$f_{P|H}(p) = \frac{f_P(p)\cdot p}{P(H)}$.`],
    solution: t`$f_{P|H}(p) = \frac{2p\cdot p}{2/3} = 3p^2$. At $p = 1/2$: $3/4$.` });

  add({ id: 369, lec: 10, title: "Random Bias: Next Toss", diff: "Medium", topics: ["Bayes", "Mixed Bayes"], answer: "3/4",
    statement: t`Same coin: $f_P(p) = 2p$. The first toss is heads. What is the probability that the second toss is heads?`,
    hints: [t`Tosses are independent given $P$, but not unconditionally.`, t`$P(H_2 \mid H_1) = E[P^2]/E[P]$.`],
    solution: t`$E[P^2] = \int_0^1 2p^3\,dp = \tfrac12$. So $P(H_2 \mid H_1) = \frac{1/2}{2/3} = \frac34$, more than $P(H) = 2/3$.` });

  add({ id: 370, lec: 10, title: "Defective Mint: Heads", diff: "Medium", topics: ["Bayes", "Mixed Bayes"], answer: "e-2",
    statement: t`A machine makes coins whose heads probability $Q$ has PDF $f_Q(q) = q e^q$ on $[0, 1]$. What is the probability that a toss of a random coin is heads?`,
    hints: [t`$\int p^2e^p\,dp = e^p(p^2 - 2p + 2)$.`],
    solution: t`$\int_0^1 q^2e^q\,dq = e(1 - 2 + 2) - 2 = e - 2 \approx 0.718$.` });

  add({ id: 371, lec: 10, title: "Defective Mint: Next Toss", diff: "Hard", topics: ["Bayes", "Mixed Bayes"], answer: "(6-2*e)/(e-2)",
    statement: t`Same machine: $f_Q(q) = q e^q$ on $[0,1]$. The first toss is heads. What is the probability that the second toss is heads?`,
    hints: [t`$P(H_2\mid H_1) = \frac{E[Q^2]}{E[Q]}$.`, t`$\int q^3e^q\,dq = (q^3 - 3q^2 + 6q - 6)e^q$.`],
    solution: t`$E[Q^2] = \int_0^1 q^3e^q\,dq = (1 - 3 + 6 - 6)e + 6 = 6 - 2e$. So $P = \frac{6 - 2e}{e - 2} \approx 0.784$.` });

  add({ id: 372, lec: 10, title: "Uniform Prior, One Head", diff: "Easy", topics: ["Bayes", "Mixed Bayes"], answer: "3/4",
    statement: t`$Y$ is uniform on $[0,1]$. Given $Y = y$, $K$ is Bernoulli with parameter $y$. You observe $K = 1$. What is $P(Y > 1/2 \mid K = 1)$?`,
    hints: [t`The posterior density is $2y$.`],
    solution: t`$f_{Y|K}(y\mid1) = \frac{1\cdot y}{1/2} = 2y$. $\int_{1/2}^1 2y\,dy = 3/4$.` });

  add({ id: 373, lec: 10, title: "Two Heads in Three", diff: "Medium", topics: ["Bayes", "Mixed Bayes"], answer: "3/5",
    statement: t`A coin has bias $Y$ uniform on $[0,1]$. Exactly two of the first three tosses are heads. What is the probability that the fourth toss is heads?`,
    hints: [t`The posterior is proportional to $y^2(1 - y)$.`],
    solution: t`$P(H_4 \mid \text{data}) = \frac{\int_0^1 y^3(1-y)\,dy}{\int_0^1 y^2(1-y)\,dy} = \frac{1/20}{1/12} = \frac35$.` });

  add({ id: 374, lec: 10, title: "Which Toss Was Heads", diff: "Easy", topics: ["Bayes", "Symmetry"], answer: "2/3",
    statement: t`A coin has random bias with any prior. Exactly two of the first three tosses are heads. What is the probability that the first toss was heads?`,
    hints: [t`Given the bias, all $3$ arrangements of HHT are equally likely.`],
    solution: t`Given $Y = y$, each of HHT, HTH, THH has probability $y^2(1-y)$. So they stay equally likely after you average over $Y$. The first toss is heads in $2$ of the $3$: $2/3$.` });

  add({ id: 375, lec: 10, title: "Fast or Slow Signal", diff: "Medium", topics: ["Bayes", "Mixed Bayes", "Exponential"], answer: "1/(1+e)",
    statement: t`A bit $K$ is $1$ with probability $1/3$. Given $K = 1$, a delay $Y$ is exponential with rate $2$; given $K = 0$, $Y$ is exponential with rate $1$. You observe $Y = 1$. What is $P(K = 1 \mid Y = 1)$?`,
    hints: [t`$p_{K|Y}(1 \mid y) = \frac{p_K(1)f_{Y|K}(y\mid1)}{\sum_k p_K(k)f_{Y|K}(y\mid k)}$.`],
    solution: t`$$\frac{\tfrac13\cdot2e^{-2}}{\tfrac13\cdot2e^{-2} + \tfrac23\cdot e^{-1}} = \frac{e^{-2}}{e^{-2} + e^{-1}} = \frac{1}{1 + e} \approx 0.269.$$` });

  add({ id: 376, lec: 10, title: "Bulb Type: Survival", diff: "Easy", topics: ["Total Probability", "Exponential"], answer: "0.5*exp(-1)+0.5*exp(-3)",
    statement: t`A bulb is type A or type B with probability $1/2$ each. Type A lifetimes are exponential with rate $1$; type B with rate $3$. What is the probability that a random bulb lasts longer than $1$?`,
    hints: [t`Total probability.`],
    solution: t`$\tfrac12e^{-1} + \tfrac12e^{-3} \approx 0.2088$.` });

  add({ id: 377, lec: 10, title: "Bulb Type: Given It Survived", diff: "Medium", topics: ["Bayes", "Exponential"], answer: "1/(1+exp(-2))",
    statement: t`Same bulbs. Given that a bulb lasted longer than $1$, what is the probability that it is type A?`,
    hints: [t`Bayes with the event $\{X > 1\}$.`],
    solution: t`$\frac{e^{-1}}{e^{-1} + e^{-3}} = \frac{1}{1 + e^{-2}} \approx 0.881$.` });

  add({ id: 378, lec: 10, title: "Uniform Inside a Uniform", diff: "Hard", topics: ["Bayes", "Continuous Distributions"], answer: "0.75/ln(4)",
    statement: t`$\Theta$ is uniform on $[0,1]$. Given $\Theta = \theta$, $X$ is uniform on $[0, \theta]$. You observe $X = 1/4$. What is $E[\Theta \mid X = 1/4]$?`,
    hints: [t`The posterior is proportional to $1/\theta$ on $[1/4, 1]$.`],
    solution: t`$f_{\Theta|X}(\theta \mid x) = \frac{1/\theta}{\ln(1/x)}$ on $[x, 1]$. So $E[\Theta \mid X = x] = \frac{1 - x}{\ln(1/x)} = \frac{0.75}{\ln 4} \approx 0.541$.` });

  add({ id: 379, lec: 10, title: "Sum of Exponentials: Split", diff: "Easy", topics: ["Bayes", "Exponential"], answer: "1/4",
    statement: t`$X, Y$ are i.i.d. exponential with parameter $\lambda$, and $Z = X + Y$. Given $Z = 4$, what is $P(X < 1)$?`,
    hints: [t`$f_{X|Z}(x\mid z) \propto \lambda e^{-\lambda x}\cdot\lambda e^{-\lambda(z - x)}$, which does not depend on $x$.`],
    solution: t`Given $Z = z$, $X$ is uniform on $[0, z]$. So $P(X < 1 \mid Z = 4) = 1/4$.` });

  add({ id: 380, lec: 10, title: "Sum of Normals: Estimate", diff: "Medium", topics: ["Bayes", "Normal Distribution"], answer: "8",
    statement: t`$X \sim N(0, 4)$ and $Y \sim N(0, 1)$ are independent, and $Z = X + Y$. What is $E[X \mid Z = 10]$?`,
    hints: [t`Given $Z = z$, $X$ is normal with mean $\frac{\sigma_X^2}{\sigma_X^2 + \sigma_Y^2}z$.`],
    solution: t`$\frac{4}{5}\cdot10 = 8$.` });

  add({ id: 381, lec: 10, title: "Sum of Normals: Spread", diff: "Medium", topics: ["Bayes", "Normal Distribution"], answer: "4/5",
    statement: t`Same model: $X \sim N(0,4)$, $Y \sim N(0,1)$, $Z = X + Y$. What is $\operatorname{Var}(X \mid Z = z)$?`,
    hints: [t`$\frac{\sigma_X^2\sigma_Y^2}{\sigma_X^2 + \sigma_Y^2}$.`],
    solution: t`$\frac{4\cdot1}{5} = 0.8$. It does not depend on $z$.` });

  add({ id: 382, lec: 10, title: "Uniform Square Range", diff: "Easy", topics: ["Conditional Expectation"], answer: "2/3",
    statement: t`$Y$ is uniform on $[0, 2]$. Given $Y = y$, $X$ is uniform on $[0, y^2]$. What is $E[X]$?`,
    hints: [t`$E[X] = \int f_Y(y)E[X \mid Y = y]\,dy$.`],
    solution: t`$E[X \mid Y] = Y^2/2$, and $E[Y^2] = 4/3$. So $E[X] = 2/3$.` });

  add({ id: 383, lec: 10, title: "Exponential Beats Uniform", diff: "Easy", topics: ["Total Probability", "Exponential"], answer: "1-exp(-1)",
    statement: t`$X$ is exponential with rate $1$ and $Y$ is uniform on $[0,1]$, independent. What is $P(X > Y)$?`,
    hints: [t`$P(X > Y) = \int_0^1 P(X > y)\,dy$.`],
    solution: t`$\int_0^1 e^{-y}\,dy = 1 - e^{-1} \approx 0.632$.` });

  add({ id: 384, lec: 10, title: "Second Bus: Probability", diff: "Medium", topics: ["Joint Distributions", "Exponential"], answer: "0.5*(1-exp(-0.5))",
    statement: t`Bus X arrives at a time uniform on $[0, 1]$ hour. Bus Y arrives at an independent exponential time with rate $1$ per hour. You take whichever bus arrives second. What is the probability that you board within half an hour?`,
    hints: [t`The second arrival is $W = \max(X, Y)$. $P(W \le w) = P(X \le w)P(Y \le w)$.`],
    solution: t`$P(W \le 0.5) = 0.5\cdot(1 - e^{-0.5}) \approx 0.1967$.` });

  add({ id: 385, lec: 10, title: "Second Bus: Density", diff: "Medium", topics: ["Derived Distributions", "Exponential"], answer: "1-0.5*exp(-0.5)",
    statement: t`Same buses. What is the PDF of your waiting time $W = \max(X, Y)$ at $w = 0.5$?`,
    hints: [t`For $0 \le w \le 1$, $F_W(w) = w(1 - e^{-w})$.`],
    solution: t`$f_W(w) = (1 - e^{-w}) + we^{-w}$. At $w = 0.5$: $1 - 0.5e^{-0.5} \approx 0.697$.` });

  // ======================================================================
  // Lecture 11: derived distributions
  // ======================================================================
  add({ id: 390, lec: 11, title: "Square of a Uniform", diff: "Easy", topics: ["Derived Distributions"], answer: "1/4",
    statement: t`$X$ is uniform on $[0, 2]$ and $Y = X^2$. What is $f_Y(1)$?`,
    hints: [t`$F_Y(y) = P(X \le \sqrt y) = \sqrt y/2$.`],
    solution: t`$f_Y(y) = \frac{1}{4\sqrt y}$ for $0 < y \le 4$. At $y = 1$: $1/4$.` });

  add({ id: 391, lec: 11, title: "Cube of a Uniform", diff: "Easy", topics: ["Derived Distributions"], answer: "1/6",
    statement: t`$X$ is uniform on $[0, 2]$ and $Y = X^3$. What is $f_Y(1)$?`,
    hints: [t`$F_Y(y) = P(X \le y^{1/3}) = y^{1/3}/2$.`],
    solution: t`$f_Y(y) = \frac{1}{6y^{2/3}}$ for $0 < y \le 8$. At $y = 1$: $1/6$.` });

  add({ id: 392, lec: 11, title: "Trip Time Density", diff: "Medium", topics: ["Derived Distributions"], answer: "4/15",
    statement: t`A $200$-mile trip is driven at a constant speed $V$ that is uniform on $[30, 60]$ mph. $T = 200/V$ is the trip time in hours. What is $f_T(5)$?`,
    hints: [t`$F_T(t) = P(V \ge 200/t)$.`],
    solution: t`$F_T(t) = \frac{60 - 200/t}{30}$, so $f_T(t) = \frac{200}{30t^2}$ for $\frac{10}{3} \le t \le \frac{20}{3}$. At $t = 5$: $\frac{200}{750} = \frac{4}{15}$.` });

  add({ id: 393, lec: 11, title: "Trip Time Mean", diff: "Medium", topics: ["Derived Distributions", "Expected Value"], answer: "(20/3)*ln(2)",
    statement: t`Same trip: $V \sim U[30, 60]$ and $T = 200/V$. What is $E[T]$?`,
    hints: [t`You do not need $f_T$: use $E[g(V)] = \int g(v)f_V(v)\,dv$.`],
    solution: t`$\int_{30}^{60}\frac{200}{v}\cdot\frac{1}{30}\,dv = \frac{20}{3}\ln 2 \approx 4.621$ hours, which is more than $200/E[V] = 4.444$.` });

  add({ id: 394, lec: 11, title: "Square of an Off-Center Uniform", diff: "Medium", topics: ["Derived Distributions"], answer: "1/2",
    statement: t`$X$ is uniform on $[-1, 3]$ and $Y = X^2$. What is $f_Y(1/4)$?`,
    hints: [t`For $0 < y < 1$, both $\pm\sqrt y$ are possible. For $1 < y < 9$, only $+\sqrt y$ is.`],
    solution: t`For $0 < y < 1$: $F_Y(y) = P(-\sqrt y \le X \le \sqrt y) = \frac{2\sqrt y}{4}$, so $f_Y(y) = \frac{1}{4\sqrt y}$. At $y = 1/4$: $1/2$.` });

  add({ id: 395, lec: 11, title: "Square of an Off-Center Uniform, Far Side", diff: "Medium", topics: ["Derived Distributions"], answer: "1/16",
    statement: t`Same: $X \sim U[-1, 3]$ and $Y = X^2$. What is $f_Y(4)$?`,
    hints: [t`For $1 < y < 9$, $F_Y(y) = P(-1 \le X \le \sqrt y) = \frac{\sqrt y + 1}{4}$.`],
    solution: t`$f_Y(y) = \frac{1}{8\sqrt y}$ on $(1, 9)$. At $y = 4$: $1/16$. The density drops by half at $y = 1$.` });

  add({ id: 396, lec: 11, title: "Exponential of a Uniform", diff: "Easy", topics: ["Derived Distributions"], answer: "1/2",
    statement: t`$X$ is uniform on $[0,1]$ and $Y = e^X$. What is $f_Y(2)$?`,
    hints: [t`$f_Y(y) = f_X(\ln y)\cdot\frac{1}{y}$.`],
    solution: t`$f_Y(y) = 1/y$ on $[1, e]$. At $y = 2$: $1/2$.` });

  add({ id: 397, lec: 11, title: "Exponential of an Exponential", diff: "Easy", topics: ["Derived Distributions", "Exponential"], answer: "1/4",
    statement: t`$X$ is exponential with rate $1$ and $Y = e^X$. What is $P(Y > 4)$?`,
    hints: [t`$Y > 4$ means $X > \ln 4$.`],
    solution: t`$e^{-\ln 4} = 1/4$. In fact $f_Y(y) = 1/y^2$ for $y \ge 1$.` });

  add({ id: 398, lec: 11, title: "Linear Map of an Exponential", diff: "Easy", topics: ["Derived Distributions", "Exponential"], answer: "(2/3)*exp(-2)",
    statement: t`$X$ is exponential with rate $2$ and $Y = 3X + 1$. What is $f_Y(4)$?`,
    hints: [t`$f_Y(y) = \frac{1}{|a|}f_X\left(\frac{y - b}{a}\right)$.`],
    solution: t`$f_Y(4) = \frac13 f_X(1) = \frac13\cdot2e^{-2} \approx 0.0902$.` });

  add({ id: 399, lec: 11, title: "Scaled Exponential", diff: "Easy", topics: ["Derived Distributions", "Exponential"], answer: "2/5",
    statement: t`$X$ is exponential with rate $2$. $Y = 5X$ is also exponential. What is its rate?`,
    hints: [t`$P(Y > y) = P(X > y/5)$.`],
    solution: t`$P(Y > y) = e^{-2y/5}$, so the rate is $2/5$. (Adding a constant $b \ne 0$ would break the exponential form.)` });

  add({ id: 400, lec: 11, title: "Reciprocal Transform", diff: "Medium", topics: ["Derived Distributions", "Exponential"], answer: "4*exp(-1)",
    statement: t`$X$ is exponential with rate $1$ and $Y = 1/(1 + X)$. What is $f_Y(1/2)$?`,
    hints: [t`The inverse is $h(y) = 1/y - 1$, with $|h'(y)| = 1/y^2$.`],
    solution: t`$f_Y(y) = e^{-(1/y - 1)}\cdot\frac{1}{y^2}$ for $0 < y \le 1$. At $y = 1/2$: $e^{-1}\cdot4 \approx 1.472$.` });

  add({ id: 401, lec: 11, title: "Square of a Heavy Tail", diff: "Medium", topics: ["Derived Distributions"], answer: "1/16",
    statement: t`$X$ has PDF $1/x^2$ for $x \ge 1$, and $Y = X^2$. What is $f_Y(4)$?`,
    hints: [t`$F_Y(y) = P(X \le \sqrt y) = 1 - 1/\sqrt y$.`],
    solution: t`$f_Y(y) = \frac{1}{2}y^{-3/2}$ for $y \ge 1$. At $y = 4$: $\frac{1}{2\cdot8} = \frac{1}{16}$.` });

  add({ id: 402, lec: 11, title: "Losing Archer of Three", diff: "Easy", topics: ["Derived Distributions", "Order Statistics"], answer: "3/4",
    statement: t`Three archers shoot. Each shot's distance from the center is uniform on $[0, 1]$, independently. $Z$ is the distance of the worst shot. What is $f_Z(1/2)$?`,
    hints: [t`$F_Z(z) = z^3$.`],
    solution: t`$f_Z(z) = 3z^2$. At $z = 1/2$: $3/4$.` });

  add({ id: 403, lec: 11, title: "Radius in a Disk", diff: "Easy", topics: ["Derived Distributions", "Geometric Probability"], answer: "1/2",
    statement: t`A point is uniform in a disk of radius $2$. $R$ is its distance from the center. What is $f_R(1)$?`,
    hints: [t`$F_R(r) = \frac{\pi r^2}{4\pi} = r^2/4$.`],
    solution: t`$f_R(r) = r/2$. At $r = 1$: $1/2$.` });

  add({ id: 404, lec: 11, title: "Ratio Density", diff: "Medium", topics: ["Derived Distributions"], answer: "1/8",
    statement: t`$(X, Y)$ is uniform on the unit square and $Z = Y/X$. What is $f_Z(2)$?`,
    hints: [t`For $z \ge 1$, $F_Z(z) = 1 - P(Y > zX) = 1 - \frac{1}{2z}$.`],
    solution: t`$f_Z(z) = \frac{1}{2z^2}$ for $z > 1$. At $z = 2$: $1/8$. (For $0 \le z \le 1$, $f_Z = 1/2$.)` });

  add({ id: 405, lec: 11, title: "Difference of Exponentials", diff: "Medium", topics: ["Derived Distributions", "Exponential"], answer: "exp(-1)",
    statement: t`$X, Y$ are i.i.d. exponential with rate $1$ and $Z = X - Y$. What is $P(|Z| > 1)$?`,
    hints: [t`$f_Z(z) = \frac12e^{-|z|}$ (a two-sided exponential).`],
    solution: t`$P(|Z| > 1) = 2\int_1^\infty\frac12e^{-z}\,dz = e^{-1} \approx 0.368$.` });

  add({ id: 406, lec: 11, title: "Max of 2X and Y: CDF", diff: "Medium", topics: ["Derived Distributions"], answer: "1/2",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$, and $Z = \max(2X, Y)$. What is $P(Z \le 1)$?`,
    hints: [t`$P(Z \le z) = P(X \le z/2)\,P(Y \le z)$.`],
    solution: t`$P(X \le 1/2)P(Y \le 1) = \frac12$.` });

  add({ id: 407, lec: 11, title: "Max of 2X and Y: Mean", diff: "Medium", topics: ["Derived Distributions"], answer: "13/12",
    statement: t`Same: $Z = \max(2X, Y)$ with $X, Y$ i.i.d. uniform on $[0,1]$. What is $E[Z]$?`,
    hints: [t`$F_Z(z) = z^2/2$ on $[0,1]$ and $z/2$ on $[1, 2]$.`],
    solution: t`$f_Z(z) = z$ on $[0,1]$ and $1/2$ on $[1,2]$. $E[Z] = \int_0^1 z^2\,dz + \int_1^2 \frac z2\,dz = \frac13 + \frac34 = \frac{13}{12}$.` });

  add({ id: 408, lec: 11, title: "Minimum of Two Uniforms", diff: "Easy", topics: ["Derived Distributions", "Order Statistics"], answer: "0.49",
    statement: t`$X, Y$ are i.i.d. uniform on $[0,1]$. What is $P(\min(X,Y) > 0.3)$?`,
    hints: [t`Both must exceed $0.3$.`],
    solution: t`$0.7^2 = 0.49$. So $F_{\min}(z) = 1 - (1 - z)^2$ and $f_{\min}(z) = 2(1 - z)$.` });

  add({ id: 409, lec: 11, title: "Inverse Transform: Exponential", diff: "Easy", topics: ["Derived Distributions", "Simulation"], answer: "ln(4)/2",
    statement: t`To sample an exponential with rate $2$, you set $Y = -\frac12\ln(1 - U)$ with $U$ uniform on $(0,1)$. Your random number generator gives $U = 0.75$. What is $Y$?`,
    hints: [t`Substitute.`],
    solution: t`$Y = -\frac12\ln 0.25 = \frac{\ln 4}{2} \approx 0.693$.` });

  add({ id: 410, lec: 11, title: "Inverse Transform: Power Law", diff: "Easy", topics: ["Derived Distributions", "Simulation"], answer: "1/2",
    statement: t`You want samples with CDF $F(y) = y^3$ on $[0,1]$. With the inverse-transform method, which value of $Y$ corresponds to $U = 1/8$?`,
    hints: [t`$Y = F^{-1}(U)$.`],
    solution: t`$Y = U^{1/3} = 1/2$.` });

  add({ id: 411, lec: 11, title: "Wrong Way to Fill a Disk", diff: "Easy", topics: ["Derived Distributions", "Simulation"], answer: "1/2",
    statement: t`To place a point "uniformly" in the unit disk, someone sets the radius $R = U$ and the angle $\Theta = 2\pi V$, with $U, V$ i.i.d. uniform on $(0,1)$. With this method, what is the probability that the point lands in the inner disk of radius $1/2$? (A correct method gives $1/4$.)`,
    hints: [t`$P(R \le 1/2) = P(U \le 1/2)$.`],
    solution: t`$1/2$. The method puts too much mass near the center. The fix is $R = \sqrt U$, so that $P(R \le r) = r^2$.` });

  add({ id: 412, lec: 11, title: "Folded Normal", diff: "Easy", topics: ["Derived Distributions", "Normal Distribution"], answer: "2*exp(-0.5)/sqrt(2*pi)",
    statement: t`$X$ is standard normal and $Y = |X|$. What is $f_Y(1)$?`,
    hints: [t`Two values of $x$ map to each $y > 0$.`],
    solution: t`$f_Y(y) = 2\phi(y)$ for $y > 0$. At $y = 1$: $\frac{2}{\sqrt{2\pi}}e^{-1/2} \approx 0.484$.` });

  add({ id: 413, lec: 11, title: "Tangent of a Uniform Angle", diff: "Medium", topics: ["Derived Distributions"], answer: "1/(2*pi)",
    statement: t`$\Theta$ is uniform on $(-\pi/2, \pi/2)$ and $Y = \tan\Theta$. What is $f_Y(1)$?`,
    hints: [t`$g$ is increasing with inverse $h(y) = \arctan y$ and $h'(y) = \frac{1}{1+y^2}$.`],
    solution: t`$f_Y(y) = \frac{1}{\pi}\cdot\frac{1}{1 + y^2}$ (the Cauchy density). At $y = 1$: $\frac{1}{2\pi} \approx 0.159$.` });

  add({ id: 414, lec: 11, title: "Discrete Derived PMF", diff: "Easy", topics: ["Derived Distributions"], answer: "2/5",
    statement: t`$X$ is uniform on $\{-2, -1, 0, 1, 2\}$ and $Y = X^2$. What is $p_Y(1)$?`,
    hints: [t`Add $p_X(x)$ over all $x$ with $x^2 = 1$.`],
    solution: t`$p_X(-1) + p_X(1) = 2/5$.` });

  add({ id: 415, lec: 11, title: "Hidden Uniform", diff: "Medium", topics: ["Derived Distributions"], answer: "1",
    statement: t`$X$ has PDF $f_X(x) = 2x$ on $[0,1]$, and $Y = 1 - X^2$. What is $f_Y(0.3)$?`,
    hints: [t`Compute $F_Y(y) = P(X \ge \sqrt{1 - y})$.`],
    solution: t`$F_Y(y) = 1 - (1 - y) = y$ on $[0,1]$. So $Y$ is uniform and $f_Y(0.3) = 1$.` });

  add({ id: 416, lec: 11, title: "Distance in the Square", diff: "Easy", topics: ["Derived Distributions", "Geometric Probability"], answer: "pi/4",
    statement: t`$(X,Y)$ is uniform on the unit square and $Z = \sqrt{X^2 + Y^2}$. What is $P(Z \le 1)$?`,
    hints: [t`The event is a quarter disk.`],
    solution: t`$\pi/4 \approx 0.785$.` });

  add({ id: 417, lec: 11, title: "Ratio CDF Above One", diff: "Medium", topics: ["Derived Distributions"], answer: "5/6",
    statement: t`$(X, Y)$ is uniform on the unit square and $Z = Y/X$. What is $P(Z \le 3)$?`,
    hints: [t`$P(Z > 3) = P(Y > 3X)$ is a thin triangle.`],
    solution: t`$P(Y > 3X) = \frac12\cdot\frac13\cdot1 = \frac16$. So $P(Z \le 3) = 5/6$.` });

  add({ id: 418, lec: 11, title: "Log-Uniform Mean", diff: "Easy", topics: ["Derived Distributions", "Expected Value"], answer: "e-1",
    statement: t`$X$ is uniform on $[0,1]$ and $Y = e^X$. What is $E[Y]$?`,
    hints: [t`You do not need the PDF of $Y$.`],
    solution: t`$\int_0^1 e^x\,dx = e - 1 \approx 1.718$.` });

  // ======================================================================
  // Lecture 12: convolution, sums of normals, covariance, correlation
  // ======================================================================
  add({ id: 420, lec: 12, title: "Discrete Convolution", diff: "Easy", topics: ["Convolution"], answer: "1/3",
    statement: t`$X$ is uniform on $\{1, 2, 3\}$ and $Y$ is uniform on $\{0, 1\}$, independent. What is $P(X + Y = 2)$?`,
    hints: [t`$p_Z(2) = \sum_x p_X(x)p_Y(2 - x)$.`],
    solution: t`$p_X(2)p_Y(0) + p_X(1)p_Y(1) = \frac16 + \frac16 = \frac13$.` });

  add({ id: 421, lec: 12, title: "Sum of Binomials", diff: "Easy", topics: ["Convolution", "Discrete Distributions"], answer: "5/16",
    statement: t`$X \sim \text{Bin}(2, 1/2)$ and $Y \sim \text{Bin}(3, 1/2)$ are independent. What is $P(X + Y = 2)$?`,
    hints: [t`The sum of independent binomials with the same $p$ is binomial.`],
    solution: t`$X + Y \sim \text{Bin}(5, 1/2)$. $P = \binom52/32 = 10/32 = 5/16$.` });

  add({ id: 422, lec: 12, title: "Sum of Geometrics", diff: "Medium", topics: ["Convolution", "Discrete Distributions"], answer: "3/16",
    statement: t`$X, Y$ are i.i.d. geometric with $p = 1/2$ (values $1, 2, \dots$). What is $P(X + Y = 4)$?`,
    hints: [t`$\sum_{k=1}^{3}p_X(k)p_Y(4 - k)$.`],
    solution: t`Each of the $3$ terms equals $(1/2)^4$. So $P = 3/16$.` });

  add({ id: 423, lec: 12, title: "Uniform Plus Uniform: Plateau", diff: "Medium", topics: ["Convolution"], answer: "1/6",
    statement: t`$X \sim U[0, 1]$ and $Y \sim U[0, 3]$ are independent, and $Z = X + Y$. What is $f_Z(3.5)$?`,
    hints: [t`$f_Z(z) = \int f_X(x)f_Y(z - x)\,dx$. For $3 \le z \le 4$, you need $z - 3 \le x \le 1$.`],
    solution: t`$f_Z(z) = \frac{1}{3}(4 - z)$ on $[3, 4]$. At $z = 3.5$: $1/6$. (The density is $z/3$ on $[0,1]$ and $1/3$ on $[1,3]$.)` });

  add({ id: 424, lec: 12, title: "Uniform Plus Uniform: Start", diff: "Medium", topics: ["Convolution"], answer: "1/6",
    statement: t`Same: $X \sim U[0, 1]$, $Y \sim U[0, 3]$, $Z = X + Y$. What is $P(Z \le 1)$?`,
    hints: [t`On $[0,1]$, $f_Z(z) = z/3$.`],
    solution: t`$\int_0^1 \frac z3\,dz = \frac16$.` });

  add({ id: 425, lec: 12, title: "Shifted Uniforms", diff: "Medium", topics: ["Convolution"], answer: "1/2",
    statement: t`$X \sim U[0, 2]$ and $Y \sim U[3, 4]$ are independent. What is $f_{X+Y}(4.5)$?`,
    hints: [t`The density is a trapezoid on $[3, 6]$.`],
    solution: t`For $4 \le z \le 5$, the window $z - 4 \le x \le z - 3$ lies inside $[0,2]$. So $f_Z(z) = \int_{z-4}^{z-3}\frac12\,dx = \frac12$.` });

  add({ id: 426, lec: 12, title: "Erlang Density", diff: "Easy", topics: ["Convolution", "Exponential"], answer: "2*exp(-2)",
    statement: t`$X, Y$ are i.i.d. exponential with rate $1$. What is the PDF of $X + Y$ at $2$?`,
    hints: [t`For nonnegative variables, the convolution runs from $0$ to $z$.`],
    solution: t`$f_Z(z) = \int_0^z e^{-x}e^{-(z-x)}\,dx = ze^{-z}$. At $z = 2$: $2e^{-2} \approx 0.271$.` });

  add({ id: 427, lec: 12, title: "Exponential Plus Uniform", diff: "Medium", topics: ["Convolution", "Exponential"], answer: "exp(-1)-exp(-2)",
    statement: t`$X$ is exponential with rate $1$ and $Y$ is uniform on $[0,1]$, independent. What is the PDF of $Z = X + Y$ at $z = 2$?`,
    hints: [t`$f_Z(z) = \int_0^1 f_X(z - y)\,dy$. Only $z - y \ge 0$ counts.`],
    solution: t`For $z \ge 1$: $f_Z(z) = \int_0^1 e^{-(z - y)}\,dy = e^{-(z-1)} - e^{-z}$. At $z = 2$: $e^{-1} - e^{-2} \approx 0.233$.` });

  add({ id: 428, lec: 12, title: "Coin Plus Uniform", diff: "Easy", topics: ["Convolution"], answer: "1/2",
    statement: t`$X$ is $0$ or $1$ with probability $1/2$ each, and $Y$ is uniform on $[0, 1]$, independent. What is the PDF of $X + Y$ at $1.5$?`,
    hints: [t`$f_Z(z) = \sum_x p_X(x)f_Y(z - x)$.`],
    solution: t`$\frac12f_Y(1.5) + \frac12f_Y(0.5) = 0 + \frac12$. In fact $Z$ is uniform on $[0, 2]$.` });

  add({ id: 429, lec: 12, title: "Three Uniforms", diff: "Medium", topics: ["Convolution"], answer: "3/4",
    statement: t`$X_1, X_2, X_3$ are i.i.d. uniform on $[0,1]$. What is the PDF of $X_1 + X_2 + X_3$ at $1.5$?`,
    hints: [t`Convolve the triangle density of $X_1 + X_2$ with one more uniform: $f(1.5) = \int_{0.5}^{1.5} f_{X_1+X_2}(s)\,ds$.`],
    solution: t`$\int_{0.5}^{1}s\,ds + \int_1^{1.5}(2 - s)\,ds = \frac38 + \frac38 = \frac34$.` });

  add({ id: 430, lec: 12, title: "Sum of Normals Tail", diff: "Easy", topics: ["Normal Distribution", "Convolution"], answer: "0.1587", tol: 0.01,
    statement: t`$X \sim N(1, 4)$ and $Y \sim N(2, 5)$ are independent. What is $P(X + Y > 6)$? ${NT}`,
    hints: [t`$X + Y \sim N(3, 9)$.`],
    solution: t`$P\left(Z > \frac{6 - 3}{3}\right) = 1 - \Phi(1) = 0.1587$.` });

  add({ id: 431, lec: 12, title: "Which Normal Is Bigger", diff: "Medium", topics: ["Normal Distribution", "Convolution"], answer: "0.3694", tol: 0.01,
    statement: t`$X \sim N(1, 4)$ and $Y \sim N(2, 5)$ are independent. What is $P(X > Y)$? ${NT}`,
    hints: [t`$X - Y \sim N(-1, 9)$.`],
    solution: t`$P(X - Y > 0) = 1 - \Phi(1/3) \approx 1 - 0.6306 = 0.3694$.` });

  add({ id: 432, lec: 12, title: "Combination of Normals", diff: "Easy", topics: ["Normal Distribution"], answer: "0.6826", tol: 0.01,
    statement: t`$X, Y$ are i.i.d. $N(0,1)$. What is $P\left(|2X - 3Y| < \sqrt{13}\right)$? ${NT}`,
    hints: [t`$2X - 3Y \sim N(0, 13)$.`],
    solution: t`$P(|Z| < 1) = 2\Phi(1) - 1 = 0.6826$.` });

  add({ id: 433, lec: 12, title: "Average of Four Normals", diff: "Easy", topics: ["Normal Distribution"], answer: "0.1587", tol: 0.01,
    statement: t`$X_1, \dots, X_4$ are i.i.d. $N(10, 16)$ and $M$ is their average. What is $P(M > 12)$? ${NT}`,
    hints: [t`$M \sim N(10, 16/4)$.`],
    solution: t`$\sigma_M = 2$, so $P(M > 12) = 1 - \Phi(1) = 0.1587$.` });

  add({ id: 434, lec: 12, title: "Covariance of Products", diff: "Medium", topics: ["Covariance"], answer: "-6",
    statement: t`$X, Y, Z$ are independent. $E[X] = 1$, $\operatorname{Var}(X) = 2$, $E[Y] = 3$, $E[Z] = -1$. What is $\operatorname{Cov}(XY, XZ)$?`,
    hints: [t`$\operatorname{Cov}(XY, XZ) = E[X^2YZ] - E[XY]E[XZ]$.`],
    solution: t`$E[X^2] = 3$. $E[X^2YZ] = 3\cdot3\cdot(-1) = -9$. $E[XY]E[XZ] = 3\cdot(-1) = -3$. So $\operatorname{Cov} = -9 + 3 = -6$.` });

  add({ id: 435, lec: 12, title: "Variance of a Correlated Sum", diff: "Medium", topics: ["Covariance", "Variance"], answer: "35",
    statement: t`$X_1, \dots, X_5$ have $E[X_i] = 2$ and $\operatorname{Var}(X_i) = 3$. For $i \ne j$, $E[X_iX_j] = 5$. What is $\operatorname{Var}(X_1 + \dots + X_5)$?`,
    hints: [t`$\operatorname{Cov}(X_i, X_j) = 5 - 4 = 1$. There are $20$ ordered pairs $i \ne j$.`],
    solution: t`$5\cdot3 + 20\cdot1 = 35$.` });

  add({ id: 436, lec: 12, title: "Correlation of X and X Cubed", diff: "Medium", topics: ["Covariance", "Normal Distribution"], answer: "3/sqrt(15)",
    statement: t`$X$ is standard normal. Use $E[X^4] = 3$ and $E[X^6] = 15$. What is the correlation coefficient of $X$ and $X^3$?`,
    hints: [t`$\operatorname{Cov}(X, X^3) = E[X^4]$ and $\operatorname{Var}(X^3) = E[X^6]$.`],
    solution: t`$\rho = \frac{3}{\sqrt{1\cdot15}} = \frac{3}{\sqrt{15}} \approx 0.775$. $X^3$ is a function of $X$, but not a linear one, so $|\rho| < 1$.` });

  add({ id: 437, lec: 12, title: "Correlation of X and X Squared Plus X", diff: "Medium", topics: ["Covariance", "Normal Distribution"], answer: "1/sqrt(3)",
    statement: t`$X$ is standard normal. What is the correlation coefficient of $X$ and $X^2 + X$? (Use $E[X^3] = 0$, $E[X^4] = 3$.)`,
    hints: [t`$\operatorname{Var}(X^2) = 3 - 1 = 2$ and $\operatorname{Cov}(X^2, X) = 0$.`],
    solution: t`$\operatorname{Cov}(X, X^2 + X) = 0 + 1 = 1$. $\operatorname{Var}(X^2 + X) = 2 + 1 = 3$. So $\rho = 1/\sqrt3 \approx 0.577$.` });

  add({ id: 438, lec: 12, title: "Heads and Tails", diff: "Easy", topics: ["Covariance"], answer: "-1",
    statement: t`You toss a coin with bias $p$ ten times. $X$ is the number of heads and $Y$ the number of tails. What is the correlation coefficient of $X$ and $Y$?`,
    hints: [t`$Y = 10 - X$.`],
    solution: t`$Y$ is a decreasing linear function of $X$, so $\rho = -1$.` });

  add({ id: 439, lec: 12, title: "Sum and Difference", diff: "Easy", topics: ["Covariance"], answer: "-5",
    statement: t`$\operatorname{Var}(X) = 4$, $\operatorname{Var}(Y) = 9$, and $\operatorname{Cov}(X, Y) = 1$. What is $\operatorname{Cov}(X + Y, X - Y)$?`,
    hints: [t`Expand by bilinearity. The cross terms cancel.`],
    solution: t`$\operatorname{Var}(X) - \operatorname{Var}(Y) = -5$. When the variances are equal, $X + Y$ and $X - Y$ are uncorrelated.` });

  add({ id: 440, lec: 12, title: "Correlation from a Table", diff: "Easy", topics: ["Covariance", "Joint Distributions"], answer: "0.6",
    statement: t`$X, Y \in \{0,1\}$ with $P(0,0) = 0.4$, $P(0,1) = 0.1$, $P(1,0) = 0.1$, $P(1,1) = 0.4$. What is the correlation coefficient of $X$ and $Y$?`,
    hints: [t`Each marginal is Bernoulli$(1/2)$.`],
    solution: t`$\operatorname{Cov} = 0.4 - 0.25 = 0.15$ and each variance is $0.25$. $\rho = 0.6$.` });

  add({ id: 441, lec: 12, title: "Covariance on a Triangle", diff: "Medium", topics: ["Covariance", "Joint Distributions"], answer: "1/36",
    statement: t`$(X, Y)$ is uniform on the triangle $0 \le y \le x \le 1$. What is $\operatorname{Cov}(X, Y)$?`,
    hints: [t`$E[X] = 2/3$, $E[Y] = 1/3$. Find $E[XY] = \int\!\!\int 2xy$.`],
    solution: t`$E[XY] = \int_0^1 2x\cdot\frac{x^2}{2}\,dx = \frac14$. $\operatorname{Cov} = \frac14 - \frac29 = \frac{1}{36}$.` });

  add({ id: 442, lec: 12, title: "Correlation on a Triangle", diff: "Medium", topics: ["Covariance", "Joint Distributions"], answer: "1/2",
    statement: t`Same triangle: $(X, Y)$ uniform on $0 \le y \le x \le 1$. What is the correlation coefficient of $X$ and $Y$?`,
    hints: [t`$f_X(x) = 2x$ and $f_Y(y) = 2(1 - y)$.`],
    solution: t`$\operatorname{Var}(X) = \frac12 - \frac49 = \frac1{18}$ and $\operatorname{Var}(Y) = \frac16 - \frac19 = \frac1{18}$. $\rho = \frac{1/36}{1/18} = \frac12$.` });

  add({ id: 443, lec: 12, title: "Dependent but Uncorrelated Disk", diff: "Hard", topics: ["Covariance", "Joint Distributions"], answer: "-1/48",
    statement: t`$(X, Y)$ is uniform on the unit disk. $\operatorname{Cov}(X, Y) = 0$, but $X$ and $Y$ are dependent. To see the dependence, find $\operatorname{Cov}(X^2, Y^2)$.`,
    hints: [t`Use polar coordinates: $E[X^2Y^2] = \frac{1}{\pi}\int_0^{2\pi}\!\!\int_0^1 r^4\cos^2\theta\sin^2\theta\,r\,dr\,d\theta$.`, t`$E[X^2] = E[Y^2] = \frac14$.`],
    solution: t`$E[X^2Y^2] = \frac1\pi\cdot\frac16\cdot\frac\pi4 = \frac1{24}$. $\operatorname{Cov}(X^2, Y^2) = \frac{1}{24} - \frac{1}{16} = -\frac{1}{48}$. Nonzero, so $X$ and $Y$ are not independent.` });

  add({ id: 444, lec: 12, title: "Negatively Correlated Sum", diff: "Easy", topics: ["Covariance", "Variance"], answer: "3",
    statement: t`$\operatorname{Var}(X) = 1$, $\operatorname{Var}(Y) = 4$, and $\rho(X, Y) = -0.5$. What is $\operatorname{Var}(X + Y)$?`,
    hints: [t`$\operatorname{Cov} = \rho\sigma_X\sigma_Y$.`],
    solution: t`$\operatorname{Cov} = -0.5\cdot1\cdot2 = -1$. $\operatorname{Var}(X+Y) = 1 + 4 - 2 = 3$.` });

  add({ id: 445, lec: 12, title: "Correlation After Rescaling", diff: "Easy", topics: ["Covariance"], answer: "-0.3",
    statement: t`$\rho(X, Y) = 0.3$. What is $\rho(-2X + 1,\ 3Y + 7)$?`,
    hints: [t`Shifts do nothing. Scaling by $a$ and $c$ multiplies $\rho$ by $\operatorname{sign}(ac)$.`],
    solution: t`$-0.3$.` });

  add({ id: 446, lec: 12, title: "Indicator Covariance", diff: "Easy", topics: ["Covariance"], answer: "0.1",
    statement: t`$P(A) = 0.5$, $P(B) = 0.4$, and $P(A \cap B) = 0.3$. What is $\operatorname{Cov}(I_A, I_B)$?`,
    hints: [t`$E[I_AI_B] = P(A \cap B)$.`],
    solution: t`$0.3 - 0.5\cdot0.4 = 0.1$.` });

  add({ id: 447, lec: 12, title: "Balls in Two Bins", diff: "Medium", topics: ["Covariance", "Linearity of Expectation"], answer: "-0.4",
    statement: t`You throw $10$ balls independently and uniformly into $5$ bins. $N_1$ and $N_2$ are the counts in bins $1$ and $2$. What is $\operatorname{Cov}(N_1, N_2)$?`,
    hints: [t`Write $N_1 = \sum_i A_i$ and $N_2 = \sum_j B_j$ with ball indicators. A single ball cannot be in both bins.`],
    solution: t`For the same ball, $\operatorname{Cov}(A_i, B_i) = 0 - \frac15\cdot\frac15$. Different balls are independent. So $\operatorname{Cov} = -10\cdot\frac{1}{25} = -0.4$.` });

  add({ id: 448, lec: 12, title: "Variance of a Difference", diff: "Easy", topics: ["Covariance", "Variance"], answer: "19",
    statement: t`$\operatorname{Var}(X) = 9$, $\operatorname{Var}(Y) = 16$, and $\rho(X,Y) = 0.25$. What is $\operatorname{Var}(X - Y)$?`,
    hints: [t`$\operatorname{Var}(X - Y) = \operatorname{Var}X + \operatorname{Var}Y - 2\operatorname{Cov}$.`],
    solution: t`$\operatorname{Cov} = 0.25\cdot3\cdot4 = 3$. $9 + 16 - 6 = 19$.` });

  add({ id: 449, lec: 12, title: "Reward Indicators Variance", diff: "Hard", topics: ["Covariance", "Variance", "Linearity of Expectation"], answer: "3/4",
    statement: t`You toss a fair coin at times $0, 1, \dots, 10$. At each time $k = 1, \dots, 10$ you get a reward of $1$ if toss $k - 1$ is H and toss $k$ is T. $R$ is the total reward. What is $\operatorname{Var}(R)$?`,
    hints: [t`$R = \sum I_k$ with $E[I_k] = 1/4$.`, t`Neighbors cannot both pay: $E[I_kI_{k+1}] = 0$. Indicators two or more apart are independent.`],
    solution: t`$\operatorname{Var}(I_k) = \frac14 - \frac1{16} = \frac{3}{16}$. Each of the $9$ neighbor pairs has covariance $-\frac{1}{16}$. $\operatorname{Var}(R) = 10\cdot\frac3{16} + 2\cdot9\cdot\left(-\frac1{16}\right) = \frac{30 - 18}{16} = \frac34$.` });
})(typeof window !== "undefined" ? window : globalThis);
