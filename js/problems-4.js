// Problem bank, part 4: 6.3700-style problems for lectures that parts 1-3 do not cover well
// (PMFs, PDFs, derived distributions, random sums, Bernoulli/Poisson processes, Markov chains,
// limit theorems, Bayesian and classical inference). `lec` is the 6.3700 lecture number.
// `tol` (optional) is the relative tolerance for answers that come from normal tables.
(function (root) {
  const t = String.raw;
  const P = (root.PROBLEMS = root.PROBLEMS || []);
  const add = (p) => P.push(p);

  // ---------- Lecture 5: discrete random variables, PMFs, expectation
  add({ id: 202, lec: 5, title: "Binomial PMF", diff: "Easy", topics: ["Discrete Distributions"], answer: "C(5,2)*0.3^2*0.7^3",
    statement: t`$X$ is binomial with $n = 5$ and $p = 0.3$. What is $P(X = 2)$?`,
    hints: [t`$p_X(k) = \binom nk p^k(1-p)^{n-k}$.`],
    solution: t`$\binom52(0.3)^2(0.7)^3 = 10\cdot0.09\cdot0.343 = 0.3087$.` });

  add({ id: 203, lec: 5, title: "Geometric Memorylessness", diff: "Easy", topics: ["Discrete Distributions", "Conditional Expectation"], answer: "8",
    statement: t`$X$ is geometric with parameter $p = 0.2$ (the number of trials up to and including the first success). What is $E[X \mid X > 3]$?`,
    hints: [t`Given $X > 3$, the variable $X - 3$ is again geometric with parameter $p$.`],
    solution: t`$E[X \mid X > 3] = 3 + E[X] = 3 + 1/0.2 = 8$.` });

  add({ id: 204, lec: 5, title: "Geometric Variance", diff: "Easy", topics: ["Discrete Distributions", "Variance"], answer: "12",
    statement: t`$X$ is geometric with parameter $p = 1/4$. What is $\operatorname{Var}(X)$?`,
    hints: [t`$\operatorname{Var}(X) = \frac{1-p}{p^2}$.`],
    solution: t`$\frac{3/4}{1/16} = 12$.` });

  add({ id: 205, lec: 5, title: "Poisson PMF", diff: "Easy", topics: ["Discrete Distributions"], answer: "3*exp(-2)",
    statement: t`$X$ is Poisson with mean $2$. What is $P(X \le 1)$?`,
    hints: [t`$p_X(k) = e^{-\lambda}\lambda^k/k!$.`],
    solution: t`$e^{-2}(1 + 2) = 3e^{-2} \approx 0.4060$.` });

  add({ id: 206, lec: 5, title: "Discrete Uniform Variance", diff: "Easy", topics: ["Discrete Distributions", "Variance"], answer: "10",
    statement: t`$X$ is uniform on the integers $\{0, 1, \dots, 10\}$. What is $\operatorname{Var}(X)$?`,
    hints: [t`For a uniform PMF on $n$ consecutive integers, $\operatorname{Var} = \frac{n^2 - 1}{12}$.`],
    solution: t`$n = 11$, so $\operatorname{Var}(X) = \frac{121 - 1}{12} = 10$.` });

  add({ id: 207, lec: 5, title: "Conditioned Binomial", diff: "Medium", topics: ["Discrete Distributions", "Conditional Expectation"], answer: "12/7",
    statement: t`$X$ is binomial with $n = 3$ and $p = 1/2$. What is $E[X \mid X \ge 1]$?`,
    hints: [t`$E[X] = E[X \mid X\ge1]P(X\ge1) + 0$.`],
    solution: t`$E[X \mid X \ge 1] = \frac{E[X]}{P(X\ge1)} = \frac{3/2}{7/8} = \frac{12}{7}$.` });

  // ---------- Lectures 6-7: joint PMFs, multiple discrete random variables
  add({ id: 208, lec: 6, title: "Joint PMF Table", diff: "Medium", topics: ["Joint Distributions"], answer: "13/6",
    statement: t`The joint PMF of $X$ and $Y$ is $p_{X,Y}(x,y) = c\,(x + y)$ for $x, y \in \{1, 2, 3\}$, and $0$ otherwise. What is $E[X]$?`,
    hints: [t`First find $c$ from the normalization. Then find the marginal $p_X(x) = \sum_y p_{X,Y}(x,y)$.`],
    solution: t`$\sum_{x,y}(x+y) = 36$, so $c = 1/36$. $p_X(x) = \frac{3x + 6}{36}$. So
$$E[X] = \frac{1\cdot9 + 2\cdot12 + 3\cdot15}{36} = \frac{78}{36} = \frac{13}{6}.$$` });

  add({ id: 209, lec: 6, title: "First Die Given the Sum", diff: "Easy", topics: ["Joint Distributions", "Conditional Expectation"], answer: "4",
    statement: t`You roll two fair dice. $X$ is the first die and $S$ is the sum. What is $E[X \mid S = 8]$?`,
    hints: [t`List the outcomes with sum $8$, or use symmetry.`],
    solution: t`$E[X \mid S] = E[Y \mid S]$ and they add to $S$. So $E[X \mid S=8] = 4$.` });

  add({ id: 210, lec: 7, title: "Correlated Bernoullis", diff: "Medium", topics: ["Variance", "Covariance"], answer: "2/3",
    statement: t`$X$ and $Y$ are Bernoulli random variables, each with parameter $1/2$. $P(X = 1, Y = 1) = 1/3$. What is $\operatorname{Var}(X + Y)$?`,
    hints: [t`$\operatorname{Var}(X+Y) = \operatorname{Var}X + \operatorname{Var}Y + 2\operatorname{Cov}(X,Y)$.`],
    solution: t`$\operatorname{Cov} = E[XY] - E[X]E[Y] = \tfrac13 - \tfrac14 = \tfrac1{12}$. So $\operatorname{Var}(X+Y) = \tfrac14 + \tfrac14 + \tfrac16 = \tfrac23$.` });

  add({ id: 211, lec: 7, title: "Hypergeometric Variance", diff: "Medium", topics: ["Variance", "Linearity of Expectation"], answer: "75/76",
    statement: t`An urn has $10$ red and $10$ black balls. You draw $5$ balls without replacement. $X$ is the number of red balls drawn. What is $\operatorname{Var}(X)$?`,
    hints: [t`Write $X = \sum_{i=1}^5 I_i$. For $i \ne j$, $P(I_i = I_j = 1) = \frac{10}{20}\cdot\frac{9}{19}$.`],
    solution: t`$\operatorname{Var}(I_i) = \tfrac14$ and $\operatorname{Cov}(I_i, I_j) = \tfrac{9}{38} - \tfrac14 = -\tfrac{1}{76}$.
$$\operatorname{Var}(X) = 5\cdot\tfrac14 + 20\cdot\left(-\tfrac1{76}\right) = \tfrac54 - \tfrac{20}{76} = \tfrac{75}{76} \approx 0.987.$$` });

  // ---------- Lecture 8: continuous random variables
  add({ id: 212, lec: 8, title: "Normalize a PDF", diff: "Easy", topics: ["Continuous Distributions"], answer: "7/8",
    statement: t`$X$ has PDF $f_X(x) = c\,x^2$ for $0 \le x \le 2$, and $0$ otherwise. What is $P(X > 1)$?`,
    hints: [t`$\int_0^2 cx^2\,dx = 1$ gives $c = 3/8$.`],
    solution: t`$c = 3/8$. $P(X > 1) = \frac38\int_1^2 x^2\,dx = \frac38\cdot\frac73 = \frac78$.` });

  add({ id: 213, lec: 8, title: "Exponential Median", diff: "Easy", topics: ["Exponential", "Continuous Distributions"], answer: "ln(2)/2",
    statement: t`$X$ is exponential with rate $\lambda = 2$. What is the median of $X$ (the value $m$ with $P(X \le m) = 1/2$)?`,
    hints: [t`$F_X(x) = 1 - e^{-\lambda x}$.`],
    solution: t`$1 - e^{-2m} = \tfrac12$ gives $m = \frac{\ln 2}{2} \approx 0.3466$.` });

  add({ id: 214, lec: 8, title: "Normal Table Lookup", diff: "Easy", topics: ["Normal Distribution"], answer: "0.0668072", tol: 0.01,
    statement: t`$X$ is normal with mean $10$ and variance $4$. What is $P(X > 13)$? (Use a normal table. Answers within $1\%$ are accepted.)`,
    hints: [t`Standardize: $Z = (X - 10)/2$.`],
    solution: t`$P(Z > 1.5) = 1 - \Phi(1.5) \approx 1 - 0.9332 = 0.0668$.` });

  add({ id: 215, lec: 8, title: "Uniform Variance", diff: "Easy", topics: ["Continuous Distributions", "Variance"], answer: "3",
    statement: t`$X$ is uniform on $[2, 8]$. What is $\operatorname{Var}(X)$?`,
    hints: [t`$\operatorname{Var} = (b-a)^2/12$.`],
    solution: t`$36/12 = 3$.` });

  // ---------- Lecture 9: multiple continuous random variables
  add({ id: 216, lec: 9, title: "Uniform on a Triangle", diff: "Medium", topics: ["Joint Distributions", "Continuous Distributions"], answer: "1/3",
    statement: t`$(X, Y)$ is uniform on the triangle $\{0 \le y \le x \le 1\}$. What is $E[Y]$?`,
    hints: [t`The joint PDF is $2$ on the triangle. Find the marginal $f_Y(y)$.`],
    solution: t`$f_Y(y) = \int_y^1 2\,dx = 2(1 - y)$. So $E[Y] = \int_0^1 2y(1-y)\,dy = \tfrac13$.` });

  add({ id: 217, lec: 9, title: "Joint PDF x + y", diff: "Medium", topics: ["Joint Distributions", "Continuous Distributions"], answer: "1/3",
    statement: t`$(X, Y)$ has joint PDF $f(x,y) = x + y$ on the unit square $[0,1]^2$. What is $P(X + Y < 1)$?`,
    hints: [t`Integrate over the triangle $x + y < 1$.`],
    solution: t`$$\int_0^1\!\!\int_0^{1-x}(x+y)\,dy\,dx = \int_0^1 \left(x(1-x) + \tfrac{(1-x)^2}{2}\right)dx = \tfrac16 + \tfrac16 = \tfrac13.$$` });

  add({ id: 218, lec: 9, title: "Conditional on a Disk", diff: "Easy", topics: ["Joint Distributions", "Conditional Expectation"], answer: "1/2",
    statement: t`$(X, Y)$ is uniform on the unit disk. What is $E[\,|Y| \mid X = 0\,]$?`,
    hints: [t`Given $X = 0$, $Y$ is uniform on $[-1, 1]$.`],
    solution: t`Given $X = 0$, $Y$ is uniform on $[-1,1]$, so $|Y|$ is uniform on $[0,1]$ with mean $1/2$.` });

  add({ id: 219, lec: 9, title: "Two Exponentials Sum Below One", diff: "Medium", topics: ["Exponential", "Joint Distributions"], answer: "1-2*exp(-1)",
    statement: t`$X, Y$ are independent exponential random variables with rate $1$. What is $P(X + Y \le 1)$?`,
    hints: [t`$X + Y$ has the Erlang (Gamma) density $s\,e^{-s}$.`],
    solution: t`$\int_0^1 s e^{-s}\,ds = 1 - 2e^{-1} \approx 0.2642$.` });

  // ---------- Lecture 10: continuous Bayes rule, derived distributions
  add({ id: 220, lec: 10, title: "MAP Rate of a Lifetime", diff: "Medium", topics: ["Bayesian Inference", "Exponential"], answer: "4/3",
    statement: t`A light bulb has an unknown failure rate $\Theta$, uniform on $[1, 2]$. Given $\Theta = \theta$, the lifetime $X$ is exponential with rate $\theta$. You observe $X = 0.75$. What is the MAP estimate of $\Theta$?`,
    hints: [t`The posterior is proportional to $\theta e^{-\theta x}$ on $[1,2]$.`],
    solution: t`$\frac{d}{d\theta}\left(\theta e^{-\theta x}\right) = 0$ gives $\theta = 1/x = 4/3$. This value is inside $[1,2]$, so the MAP estimate is $4/3$.` });

  add({ id: 221, lec: 10, title: "Log of a Uniform", diff: "Easy", topics: ["Derived Distributions"], answer: "exp(-2)",
    statement: t`$X$ is uniform on $(0, 1]$ and $Y = -\ln X$. What is $P(Y > 2)$?`,
    hints: [t`$Y > 2$ exactly when $X < e^{-2}$.`],
    solution: t`$P(X < e^{-2}) = e^{-2} \approx 0.1353$. In fact $Y$ is exponential with rate $1$.` });

  add({ id: 222, lec: 10, title: "Square of a Normal", diff: "Medium", topics: ["Derived Distributions", "Normal Distribution"], answer: "exp(-1/2)/sqrt(2*pi)",
    statement: t`$X$ is standard normal and $Y = X^2$. What is the value of the PDF $f_Y(y)$ at $y = 1$?`,
    hints: [t`$F_Y(y) = P(-\sqrt y \le X \le \sqrt y)$. Differentiate.`],
    solution: t`$f_Y(y) = \frac{1}{2\sqrt y}\left(f_X(\sqrt y) + f_X(-\sqrt y)\right) = \frac{1}{\sqrt{2\pi y}}e^{-y/2}$. At $y = 1$: $\frac{e^{-1/2}}{\sqrt{2\pi}} \approx 0.2420$.` });

  add({ id: 223, lec: 10, title: "Ratio CDF", diff: "Medium", topics: ["Derived Distributions"], answer: "3/4",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$, and $Z = X/Y$. What is $P(Z \le 2)$?`,
    hints: [t`$Z > 2$ means $Y < X/2$.`],
    solution: t`$P(Y < X/2) = \int_0^1 \frac x2\,dx = \frac14$. So $P(Z \le 2) = \frac34$.` });

  // ---------- Lecture 11: derived distributions, convolution, covariance
  add({ id: 224, lec: 11, title: "Triangular Convolution", diff: "Easy", topics: ["Convolution"], answer: "1/2",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is the value of the PDF of $X + Y$ at $1.5$?`,
    hints: [t`The convolution of two unit uniforms is a triangle on $[0, 2]$ with peak $1$ at $1$.`],
    solution: t`$f_{X+Y}(s) = 2 - s$ for $1 \le s \le 2$. At $s = 1.5$ the value is $0.5$.` });

  add({ id: 225, lec: 11, title: "Sum of Poissons", diff: "Easy", topics: ["Convolution", "Discrete Distributions"], answer: "exp(-3)*9/2",
    statement: t`$X \sim \text{Poisson}(1)$ and $Y \sim \text{Poisson}(2)$ are independent. What is $P(X + Y = 2)$?`,
    hints: [t`The sum of independent Poissons is Poisson.`],
    solution: t`$X + Y \sim \text{Poisson}(3)$, so $P = e^{-3}\frac{3^2}{2!} \approx 0.2240$.` });

  add({ id: 226, lec: 11, title: "Dependent but Uncorrelated", diff: "Easy", topics: ["Covariance"], answer: "0",
    statement: t`$X$ is uniform on $\{-1, 0, 1\}$ and $Y = X^2$. What is the correlation coefficient of $X$ and $Y$?`,
    hints: [t`$\operatorname{Cov}(X, Y) = E[X^3] - E[X]E[X^2]$.`],
    solution: t`$E[X^3] = 0$ and $E[X] = 0$, so the covariance is $0$. The correlation is $0$ even though $Y$ is a function of $X$.` });

  add({ id: 227, lec: 11, title: "Correlation with a Sum", diff: "Medium", topics: ["Covariance"], answer: "1/sqrt(2)",
    statement: t`$X, Y$ are independent with the same variance $\sigma^2 > 0$. What is the correlation coefficient of $X$ and $X + Y$?`,
    hints: [t`$\operatorname{Cov}(X, X+Y) = \operatorname{Var}(X)$.`],
    solution: t`$\rho = \frac{\sigma^2}{\sigma\cdot\sqrt2\sigma} = \frac{1}{\sqrt2} \approx 0.7071$.` });

  add({ id: 228, lec: 11, title: "Variance of a Combination", diff: "Easy", topics: ["Covariance", "Variance"], answer: "4",
    statement: t`$\operatorname{Var}(X) = 4$, $\operatorname{Var}(Y) = 1$, and $\operatorname{Cov}(X,Y) = 1$. What is $\operatorname{Var}(X - 2Y + 3)$?`,
    hints: [t`$\operatorname{Var}(aX + bY + c) = a^2\operatorname{Var}X + b^2\operatorname{Var}Y + 2ab\operatorname{Cov}(X,Y)$.`],
    solution: t`$4 + 4\cdot1 + 2\cdot1\cdot(-2)\cdot1 = 4$.` });

  // ---------- Lecture 12: iterated expectations, random sums
  add({ id: 229, lec: 12, title: "Random Number of Customers", diff: "Medium", topics: ["Random Sums", "Variance"], answer: "1000",
    statement: t`The number of customers $N$ in a day is Poisson with mean $5$. Each customer spends an amount that is exponential with mean $10$, independently of $N$ and of each other. What is the variance of the total amount spent?`,
    hints: [t`Law of total variance: $\operatorname{Var}(S) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)E[X]^2$.`],
    solution: t`$\operatorname{Var}(X) = 100$ and $E[X] = 10$. So $\operatorname{Var}(S) = 5\cdot100 + 5\cdot100 = 1000$.` });

  add({ id: 230, lec: 12, title: "Roll a Die, Roll That Many", diff: "Medium", topics: ["Random Sums", "Variance"], answer: "735/16",
    statement: t`You roll a fair die to get $N$. Then you roll $N$ more fair dice and add them to get $S$. What is $\operatorname{Var}(S)$?`,
    hints: [t`$E[N] = 3.5$, $\operatorname{Var}(N) = 35/12$, and the same for each die $X_i$.`],
    solution: t`$$\operatorname{Var}(S) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)E[X]^2 = 3.5\cdot\tfrac{35}{12} + \tfrac{35}{12}\cdot 12.25 = \tfrac{35}{12}\cdot15.75 = \tfrac{735}{16} \approx 45.94.$$` });

  add({ id: 231, lec: 12, title: "Break Twice", diff: "Easy", topics: ["Conditional Expectation"], answer: "1/4",
    statement: t`You break a stick of length $1$ at a uniform point and keep the left piece. Then you break that piece at a uniform point and keep its left piece. What is the expected length of the final piece?`,
    hints: [t`$E[Y] = E[E[Y \mid X]] = E[X/2]$.`],
    solution: t`$E[Y] = E[X]/2 = 1/4$.` });

  // ---------- Lecture 13: Bernoulli process
  add({ id: 232, lec: 13, title: "Third Success on Trial Six", diff: "Medium", topics: ["Bernoulli Process"], answer: "C(5,2)*0.2^3*0.8^3",
    statement: t`In a Bernoulli process with success probability $p = 0.2$, what is the probability that the third success occurs exactly at trial $6$?`,
    hints: [t`The time of the $k$-th success has the Pascal PMF $\binom{t-1}{k-1}p^k(1-p)^{t-k}$.`],
    solution: t`$\binom52(0.2)^3(0.8)^3 = 10\cdot0.008\cdot0.512 = 0.04096$.` });

  add({ id: 233, lec: 13, title: "Pascal Variance", diff: "Easy", topics: ["Bernoulli Process", "Variance"], answer: "60",
    statement: t`In a Bernoulli process with $p = 0.2$, what is the variance of the time of the third success?`,
    hints: [t`It is a sum of $3$ independent geometric interarrival times.`],
    solution: t`$3\cdot\frac{1-p}{p^2} = 3\cdot\frac{0.8}{0.04} = 60$.` });

  add({ id: 234, lec: 13, title: "Merged Bernoulli Processes", diff: "Easy", topics: ["Bernoulli Process"], answer: "2",
    statement: t`Two independent Bernoulli processes have success probabilities $1/3$ and $1/4$. In the merged process, a trial is a success if either process has a success. What is the expected number of trials until the first success of the merged process?`,
    hints: [t`The merged process is Bernoulli with $p = 1 - (1 - p_1)(1-p_2)$.`],
    solution: t`$p = 1 - \tfrac23\cdot\tfrac34 = \tfrac12$. The expected time is $1/p = 2$.` });

  add({ id: 235, lec: 13, title: "Fresh Start", diff: "Easy", topics: ["Bernoulli Process"], answer: "8",
    statement: t`In a Bernoulli process with $p = 1/4$, the first $10$ trials were all failures. What is the expected number of additional trials until two more successes occur?`,
    hints: [t`The process starts fresh after any fixed time.`],
    solution: t`The past does not matter. Two successes take $2/p = 8$ trials on average.` });

  // ---------- Lectures 14-15: Poisson process
  add({ id: 236, lec: 14, title: "Arrivals in Half an Hour", diff: "Easy", topics: ["Poisson Process"], answer: "exp(-2)*2^3/6",
    statement: t`Calls arrive as a Poisson process with rate $4$ per hour. What is the probability of exactly $3$ calls in a $30$-minute period?`,
    hints: [t`The count is Poisson with mean $\lambda\tau = 2$.`],
    solution: t`$e^{-2}\frac{2^3}{3!} \approx 0.1804$.` });

  add({ id: 237, lec: 14, title: "Third Arrival by Time One", diff: "Medium", topics: ["Poisson Process"], answer: "1-5*exp(-2)",
    statement: t`Arrivals form a Poisson process with rate $2$. What is the probability that the third arrival happens by time $1$?`,
    hints: [t`$Y_3 \le 1$ exactly when there are at least $3$ arrivals in $[0,1]$.`],
    solution: t`$P(N(1) \ge 3) = 1 - e^{-2}\left(1 + 2 + \tfrac{4}{2}\right) = 1 - 5e^{-2} \approx 0.3233$.` });

  add({ id: 238, lec: 14, title: "Splitting Email", diff: "Easy", topics: ["Poisson Process"], answer: "exp(-1)",
    statement: t`Emails arrive as a Poisson process with rate $10$ per hour. Each email is spam with probability $0.3$, independently. What is the probability that no spam arrives in a $20$-minute period?`,
    hints: [t`Spam arrivals form a Poisson process with rate $3$ per hour.`],
    solution: t`The spam count in $1/3$ hour is Poisson with mean $1$. $P(0) = e^{-1} \approx 0.3679$.` });

  add({ id: 239, lec: 15, title: "Red Cars First", diff: "Easy", topics: ["Poisson Process"], answer: "4/25",
    statement: t`Red cars pass as a Poisson process with rate $2$ per minute and blue cars as an independent Poisson process with rate $3$ per minute. What is the probability that the first two cars are both red?`,
    hints: [t`In the merged process, each arrival is red with probability $\frac{2}{2+3}$, independently.`],
    solution: t`$(2/5)^2 = 4/25$.` });

  add({ id: 240, lec: 15, title: "Reds Before the First Blue", diff: "Medium", topics: ["Poisson Process"], answer: "2/3",
    statement: t`With the same red (rate $2$) and blue (rate $3$) car processes, what is the expected number of red cars that pass before the first blue car?`,
    hints: [t`Count failures before the first success, with success probability $3/5$.`],
    solution: t`$\frac{1-p}{p} = \frac{2/5}{3/5} = \frac23$.` });

  add({ id: 241, lec: 15, title: "Where Was the Arrival?", diff: "Easy", topics: ["Poisson Process"], answer: "1/4",
    statement: t`A Poisson process had exactly one arrival in the interval $[0, 2]$. What is the probability that this arrival happened in $[0, 0.5]$?`,
    hints: [t`Given one arrival, its time is uniform on the interval.`],
    solution: t`$0.5/2 = 1/4$.` });

  add({ id: 242, lec: 15, title: "First of Three Arrivals", diff: "Medium", topics: ["Poisson Process", "Order Statistics"], answer: "1/4",
    statement: t`A Poisson process had exactly $3$ arrivals in $[0, 1]$. What is the expected time of the first arrival?`,
    hints: [t`Given $3$ arrivals, the times are the order statistics of $3$ uniforms on $[0,1]$.`],
    solution: t`The minimum of $3$ uniforms has mean $\frac{1}{3+1} = \frac14$.` });

  // ---------- Lectures 16-18: Markov chains
  add({ id: 243, lec: 17, title: "Two-State Steady State", diff: "Easy", topics: ["Markov Chains"], answer: "2/3",
    statement: t`A Markov chain has states $1$ and $2$. From state $1$ it moves to $2$ with probability $0.2$ (otherwise it stays). From state $2$ it moves to $1$ with probability $0.4$. What is the steady-state probability $\pi_1$?`,
    hints: [t`Balance equation: $\pi_1\cdot0.2 = \pi_2\cdot0.4$.`],
    solution: t`$\pi_1 = 2\pi_2$ and $\pi_1 + \pi_2 = 1$, so $\pi_1 = 2/3$.` });

  add({ id: 244, lec: 16, title: "Two-Step Transition", diff: "Easy", topics: ["Markov Chains"], answer: "0.72",
    statement: t`Use the same two-state chain ($p_{12} = 0.2$, $p_{21} = 0.4$). What is $P(X_2 = 1 \mid X_0 = 1)$?`,
    hints: [t`$r_{11}(2) = p_{11}p_{11} + p_{12}p_{21}$.`],
    solution: t`$0.8\cdot0.8 + 0.2\cdot0.4 = 0.72$.` });

  add({ id: 245, lec: 17, title: "Mean Recurrence Time", diff: "Easy", topics: ["Markov Chains"], answer: "3/2",
    statement: t`Use the same two-state chain ($p_{12} = 0.2$, $p_{21} = 0.4$). Starting in state $1$, what is the expected number of steps until the chain is in state $1$ again (after at least one step)?`,
    hints: [t`The mean recurrence time of state $i$ is $1/\pi_i$.`],
    solution: t`$1/\pi_1 = 3/2$. Check: with probability $0.8$ the return takes $1$ step; otherwise it takes $1 + 2.5$ steps on average. $0.8 + 0.2\cdot3.5 = 1.5$.` });

  add({ id: 246, lec: 17, title: "Birth-Death Steady State", diff: "Medium", topics: ["Markov Chains"], answer: "27/65",
    statement: t`A chain on states $\{0, 1, 2, 3\}$ moves up by one with probability $0.4$ and down by one with probability $0.6$. At state $0$ a down move is replaced by staying at $0$, and at state $3$ an up move is replaced by staying at $3$. What is the steady-state probability $\pi_0$?`,
    hints: [t`For a birth-death chain, $\pi_i b_i = \pi_{i+1}d_{i+1}$. Here $\pi_{i+1} = \frac{2}{3}\pi_i$.`],
    solution: t`$\pi_i \propto (2/3)^i$, so $\pi_0 = \frac{1}{1 + \frac23 + \frac49 + \frac8{27}} = \frac{27}{65} \approx 0.4154$.` });

  add({ id: 247, lec: 17, title: "Three-State Chain", diff: "Medium", topics: ["Markov Chains"], answer: "1/4",
    statement: t`A chain on $\{1,2,3\}$ has these transitions. From $1$: stay $0.5$, to $2$ $0.5$. From $2$: to $1$ $0.25$, stay $0.5$, to $3$ $0.25$. From $3$: to $2$ $0.5$, stay $0.5$. What is $\pi_1$?`,
    hints: [t`Balance across each cut: $0.5\pi_1 = 0.25\pi_2$ and $0.25\pi_2 = 0.5\pi_3$.`],
    solution: t`$\pi_2 = 2\pi_1$ and $\pi_3 = \pi_1$. Normalizing gives $\pi_1 = 1/4$.` });

  add({ id: 248, lec: 18, title: "Absorption Probability", diff: "Medium", topics: ["Markov Chains"], answer: "5/11",
    statement: t`A chain on $\{1,2,3,4\}$ has absorbing states $1$ and $4$. From $2$: to $1$ with probability $0.3$, stay $0.2$, to $3$ $0.5$. From $3$: to $2$ with probability $0.4$, stay $0.2$, to $4$ $0.4$. Starting at $2$, what is the probability of absorption at $4$?`,
    hints: [t`Let $a_i$ be the probability of absorption at $4$ from state $i$. Then $a_1 = 0$ and $a_4 = 1$.`],
    solution: t`$a_2 = 0.2a_2 + 0.5a_3$ and $a_3 = 0.4a_2 + 0.2a_3 + 0.4$. So $a_2 = \tfrac58 a_3$ and $a_3 = \tfrac12a_2 + \tfrac12$. Then $a_2 = \tfrac{5}{16}a_2 + \tfrac{5}{16}$, which gives $a_2 = \tfrac{5}{11}$.` });

  add({ id: 249, lec: 18, title: "Expected Time to Absorption", diff: "Medium", topics: ["Markov Chains"], answer: "65/22",
    statement: t`Use the same chain as in "Absorption Probability". Starting at $2$, what is the expected number of steps until absorption?`,
    hints: [t`$\mu_i = 1 + \sum_j p_{ij}\mu_j$ for transient $i$, with $\mu = 0$ at absorbing states.`],
    solution: t`$0.8\mu_2 = 1 + 0.5\mu_3$ and $0.8\mu_3 = 1 + 0.4\mu_2$, so $\mu_3 = 1.25 + 0.5\mu_2$. Then $0.8\mu_2 = 1.625 + 0.25\mu_2$, which gives $\mu_2 = \frac{1.625}{0.55} = \frac{65}{22} \approx 2.955$.` });

  // ---------- Lecture 19: inequalities and the weak law of large numbers
  add({ id: 250, lec: 19, title: "Chebyshev Bound", diff: "Easy", topics: ["Limit Theorems"], answer: "4/25",
    statement: t`$X$ has mean $10$ and variance $4$. What upper bound does the Chebyshev inequality give for $P(|X - 10| \ge 5)$?`,
    hints: [t`$P(|X - \mu| \ge c) \le \sigma^2/c^2$.`],
    solution: t`$4/25 = 0.16$.` });

  add({ id: 251, lec: 19, title: "Markov Bound", diff: "Easy", topics: ["Limit Theorems"], answer: "0.2",
    statement: t`$X \ge 0$ has mean $2$. What upper bound does the Markov inequality give for $P(X \ge 10)$?`,
    hints: [t`$P(X \ge a) \le E[X]/a$.`],
    solution: t`$2/10 = 0.2$.` });

  add({ id: 252, lec: 19, title: "Sample Mean Bound", diff: "Easy", topics: ["Limit Theorems"], answer: "0.09",
    statement: t`$X_1, \dots, X_{100}$ are i.i.d. with mean $\mu$ and variance $9$. $M$ is their sample mean. What upper bound does Chebyshev give for $P(|M - \mu| \ge 1)$?`,
    hints: [t`$\operatorname{Var}(M) = \sigma^2/n$.`],
    solution: t`$\operatorname{Var}(M) = 0.09$, so the bound is $0.09/1^2 = 0.09$.` });

  add({ id: 253, lec: 19, title: "Poll Size by Chebyshev", diff: "Medium", topics: ["Limit Theorems"], answer: "50000",
    statement: t`You estimate a fraction $p$ by the sample mean $M_n$ of $n$ independent Bernoulli($p$) votes. Using only Chebyshev and the bound $p(1-p) \le 1/4$, what is the smallest $n$ that guarantees $P(|M_n - p| \ge 0.01) \le 0.05$?`,
    hints: [t`You need $\frac{1}{4n(0.01)^2} \le 0.05$.`],
    solution: t`$n \ge \frac{1}{4\cdot0.0001\cdot0.05} = 50{,}000$.` });

  // ---------- Lecture 20: central limit theorem
  add({ id: 254, lec: 20, title: "Sum of 48 Uniforms", diff: "Easy", topics: ["Limit Theorems", "Normal Distribution"], answer: "0.1586553", tol: 0.02,
    statement: t`$X_1, \dots, X_{48}$ are i.i.d. uniform on $[0,1]$. Use the CLT to approximate $P(X_1 + \dots + X_{48} > 26)$. (Answers within $2\%$ are accepted.)`,
    hints: [t`The sum has mean $24$ and variance $48/12 = 4$.`],
    solution: t`$z = (26 - 24)/2 = 1$, so $P \approx 1 - \Phi(1) \approx 0.1587$.` });

  add({ id: 255, lec: 20, title: "Hundred Dice", diff: "Medium", topics: ["Limit Theorems", "Normal Distribution", "Dice"], answer: "0.1207833", tol: 0.02,
    statement: t`You roll $100$ fair dice. Use the CLT, without a continuity correction, to approximate the probability that the sum is at least $370$. (Answers within $2\%$ are accepted.)`,
    hints: [t`Mean $350$, variance $100\cdot35/12$.`],
    solution: t`$\sigma = \sqrt{291.67} \approx 17.08$. $z = 20/17.08 \approx 1.171$. $P \approx 1 - \Phi(1.17) \approx 0.121$.` });

  add({ id: 256, lec: 20, title: "Thousand Coin Flips", diff: "Medium", topics: ["Limit Theorems", "Normal Distribution", "Coins"], answer: "0.0288898", tol: 0.03,
    statement: t`You flip a fair coin $1000$ times. Use the CLT, without a continuity correction, to approximate $P(\text{heads} \ge 530)$. (Answers within $3\%$ are accepted.)`,
    hints: [t`Mean $500$, standard deviation $\sqrt{250} \approx 15.81$.`],
    solution: t`$z = 30/15.81 \approx 1.897$. $P \approx 1 - \Phi(1.90) \approx 0.029$.` });

  add({ id: 257, lec: 20, title: "Poll Size by CLT", diff: "Medium", topics: ["Limit Theorems", "Classical Inference"], answer: "9604", tol: 0.005,
    statement: t`You estimate a fraction $p$ with $n$ independent votes. Use the CLT, the bound $p(1-p) \le 1/4$, and $z = 1.96$. What is the smallest $n$ such that $P(|M_n - p| \ge 0.01) \le 0.05$?`,
    hints: [t`You need $\frac{1.96}{2\sqrt n} \le 0.01$.`],
    solution: t`$\sqrt n \ge 98$, so $n \ge 9604$. Compare with $50{,}000$ from Chebyshev.` });

  // ---------- Lectures 21-22: Bayesian inference
  add({ id: 258, lec: 21, title: "MAP for a Coin", diff: "Easy", topics: ["Bayesian Inference"], answer: "0.7",
    statement: t`A coin has unknown bias $\Theta$ with a uniform prior on $[0,1]$. You see $7$ heads in $10$ flips. What is the MAP estimate of $\Theta$?`,
    hints: [t`The posterior is proportional to $\theta^7(1-\theta)^3$.`],
    solution: t`The posterior is maximized at $\theta = 7/10$.` });

  add({ id: 259, lec: 22, title: "LMS for a Coin", diff: "Medium", topics: ["Bayesian Inference"], answer: "2/3",
    statement: t`Same setup: uniform prior on the bias $\Theta$, and $7$ heads in $10$ flips. What is the LMS estimate $E[\Theta \mid \text{data}]$?`,
    hints: [t`The posterior is $\text{Beta}(8, 4)$, with mean $\frac{8}{8+4}$.`],
    solution: t`$\frac{h+1}{n+2} = \frac{8}{12} = \frac23$.` });

  add({ id: 260, lec: 22, title: "Normal Prior, Normal Noise", diff: "Medium", topics: ["Bayesian Inference", "Normal Distribution"], answer: "1",
    statement: t`$\Theta \sim N(0, 1)$ and $X = \Theta + W$, where $W \sim N(0,1)$ is independent of $\Theta$. You observe $X = 2$. What is the LMS estimate of $\Theta$?`,
    hints: [t`The posterior mean is a weighted average of the prior mean and the observation, with weights proportional to precisions.`],
    solution: t`$E[\Theta \mid X = x] = \frac{\sigma_\Theta^2}{\sigma_\Theta^2 + \sigma_W^2}x = \frac12\cdot2 = 1$.` });

  add({ id: 261, lec: 22, title: "Posterior Variance", diff: "Medium", topics: ["Bayesian Inference", "Normal Distribution"], answer: "1/2",
    statement: t`Same setup: $\Theta \sim N(0,1)$ and $X = \Theta + W$ with $W \sim N(0,1)$. What is the mean squared error of the LMS estimator?`,
    hints: [t`For normal models, the posterior variance does not depend on $x$: $\frac{1}{1/\sigma_\Theta^2 + 1/\sigma_W^2}$.`],
    solution: t`$\frac{1}{1 + 1} = \frac12$.` });

  add({ id: 262, lec: 21, title: "Posterior Hypothesis Probability", diff: "Medium", topics: ["Bayesian Inference", "Normal Distribution"], answer: "0.3*exp(-0.32)/(0.3*exp(-0.32)+0.7*exp(-0.72))",
    statement: t`Under hypothesis $H_0$ (prior $0.7$), $X \sim N(0,1)$. Under $H_1$ (prior $0.3$), $X \sim N(2,1)$. You observe $X = 1.2$. What is $P(H_1 \mid X = 1.2)$?`,
    hints: [t`The likelihoods are proportional to $e^{-(x-\mu)^2/2}$.`],
    solution: t`$$\frac{0.3e^{-0.8^2/2}}{0.3e^{-0.8^2/2} + 0.7e^{-1.2^2/2}} = \frac{0.3e^{-0.32}}{0.3e^{-0.32} + 0.7e^{-0.72}} \approx 0.390.$$ So the MAP rule picks $H_0$.` });

  add({ id: 263, lec: 22, title: "Linear LMS", diff: "Medium", topics: ["Bayesian Inference"], answer: "8",
    statement: t`$\Theta$ has mean $0$ and variance $4$. $X = \Theta + W$, where $W$ has mean $0$, variance $1$, and is uncorrelated with $\Theta$. You observe $X = 10$. What is the linear LMS estimate of $\Theta$?`,
    hints: [t`$\hat\Theta = E[\Theta] + \frac{\operatorname{Cov}(\Theta, X)}{\operatorname{Var}(X)}(X - E[X])$.`],
    solution: t`$\operatorname{Cov}(\Theta, X) = 4$ and $\operatorname{Var}(X) = 5$. So $\hat\Theta = \frac45\cdot10 = 8$.` });

  add({ id: 264, lec: 22, title: "Poisson with Exponential Prior", diff: "Hard", topics: ["Bayesian Inference"], answer: "3/2",
    statement: t`$\Theta$ is exponential with rate $1$. Given $\Theta = \theta$, $X$ is Poisson with mean $\theta$. You observe $X = 2$. What is $E[\Theta \mid X = 2]$?`,
    hints: [t`The posterior is proportional to $e^{-\theta}\cdot e^{-\theta}\theta^2$.`],
    solution: t`The posterior is proportional to $\theta^2e^{-2\theta}$, a Gamma density with shape $3$ and rate $2$. Its mean is $3/2$.` });

  // ---------- Lectures 23-25: classical inference
  add({ id: 265, lec: 23, title: "Exponential MLE", diff: "Easy", topics: ["Classical Inference"], answer: "1/2",
    statement: t`You observe i.i.d. exponential samples $1, 2, 3$ with unknown rate $\theta$. What is the maximum likelihood estimate of $\theta$?`,
    hints: [t`Maximize $\theta^n e^{-\theta\sum x_i}$.`],
    solution: t`$\hat\theta = n/\sum x_i = 3/6 = 1/2$.` });

  add({ id: 266, lec: 23, title: "Uniform MLE", diff: "Easy", topics: ["Classical Inference"], answer: "5",
    statement: t`You observe i.i.d. samples $2, 5, 3$ from a uniform distribution on $[0, \theta]$. What is the maximum likelihood estimate of $\theta$?`,
    hints: [t`The likelihood is $\theta^{-n}$ when $\theta \ge \max x_i$, and $0$ otherwise.`],
    solution: t`The likelihood decreases in $\theta$, so take the smallest allowed value: $\hat\theta = \max x_i = 5$.` });

  add({ id: 267, lec: 24, title: "Unbiased Uniform Estimator", diff: "Medium", topics: ["Classical Inference", "Order Statistics"], answer: "4/3",
    statement: t`$X_1, X_2, X_3$ are i.i.d. uniform on $[0, \theta]$. The MLE $\max X_i$ is biased. By what constant $c$ must you multiply it to get an unbiased estimator?`,
    hints: [t`$E[\max] = \frac{n}{n+1}\theta$.`],
    solution: t`$E[\max] = \tfrac34\theta$, so $c = \tfrac43$.` });

  add({ id: 268, lec: 24, title: "Known-Variance Interval", diff: "Easy", topics: ["Classical Inference", "Normal Distribution"], answer: "1.96", tol: 0.01,
    statement: t`You take $n = 100$ i.i.d. samples with known standard deviation $\sigma = 10$. What is the half-width of the $95\%$ confidence interval for the mean, based on the CLT?`,
    hints: [t`Half-width $= 1.96\,\sigma/\sqrt n$.`],
    solution: t`$1.96\cdot10/10 = 1.96$.` });

  add({ id: 269, lec: 24, title: "Unbiased Sample Variance", diff: "Easy", topics: ["Classical Inference", "Variance"], answer: "20/3",
    statement: t`You observe the samples $2, 4, 6, 8$. What is the unbiased estimate of the variance, $\frac{1}{n-1}\sum(x_i - \bar x)^2$?`,
    hints: [t`$\bar x = 5$.`],
    solution: t`$\sum(x_i - 5)^2 = 9 + 1 + 1 + 9 = 20$. Divide by $3$: $20/3 \approx 6.667$.` });

  add({ id: 270, lec: 24, title: "Poll Confidence Interval", diff: "Medium", topics: ["Classical Inference"], answer: "1.96*sqrt(0.55*0.45/400)", tol: 0.01,
    statement: t`In a poll of $400$ voters, $220$ say yes. Using the estimated standard error, what is the half-width of the approximate $95\%$ confidence interval for the true fraction?`,
    hints: [t`$\hat p = 0.55$. Half-width $= 1.96\sqrt{\hat p(1-\hat p)/n}$.`],
    solution: t`$1.96\sqrt{0.55\cdot0.45/400} \approx 1.96\cdot0.02487 \approx 0.0488$.` });

  add({ id: 271, lec: 25, title: "Fair Coin Test", diff: "Medium", topics: ["Hypothesis Testing", "Limit Theorems"], answer: "9.8", tol: 0.01,
    statement: t`You test $H_0$: "the coin is fair" with $100$ flips. You reject $H_0$ when $|\text{heads} - 50| > c$. Using the CLT, which $c$ gives a significance level of $5\%$?`,
    hints: [t`Under $H_0$, heads has mean $50$ and standard deviation $5$.`],
    solution: t`$c = 1.96\cdot5 = 9.8$.` });

  add({ id: 272, lec: 25, title: "Power of a Test", diff: "Hard", topics: ["Hypothesis Testing", "Normal Distribution"], answer: "0.2595110", tol: 0.02,
    statement: t`Under $H_0$, $X \sim N(0,1)$. Under $H_1$, $X \sim N(1,1)$. You reject $H_0$ when $X > \xi$, with $\xi$ chosen for a false rejection probability of $0.05$. What is the probability of rejecting $H_0$ when $H_1$ is true (the power)? (Answers within $2\%$ are accepted.)`,
    hints: [t`$\xi = 1.645$. Under $H_1$, $X - 1 \sim N(0,1)$.`],
    solution: t`Power $= P(X > 1.645 \mid H_1) = 1 - \Phi(0.645) \approx 0.2595$. By the Neyman-Pearson lemma, this threshold test is the most powerful test at this level.` });
})(typeof window !== "undefined" ? window : globalThis);
