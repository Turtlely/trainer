// Problem bank, part 6: Quiz 1 basics for 6.3700 Fall 2026, Lectures 1-7
// (probability models, conditioning, Bayes, independence, counting, discrete random
// variables, PMFs, expectation, variance, conditional and joint PMFs).
// Original problems written in the style of the course. `lec` uses Fall 2026 numbers.
(function (root) {
  const t = String.raw;
  const P = (root.PROBLEMS = root.PROBLEMS || []);
  const add = (p) => P.push(p);

  // ---------- Lecture 1: models and axioms
  add({ id: 500, lec: 1, title: "Geometric Sample Space", diff: "Easy", topics: ["Probability Axioms"], answer: "1/9",
    statement: t`The sample space is $\{1, 2, 3, \dots\}$ and $P(\{n\}) = c\,3^{-n}$. What is $P(\text{outcome} \ge 3)$?`,
    hints: [t`First find $c$ from $\sum_n c3^{-n} = c/2 = 1$.`],
    solution: t`$c = 2$. $P(n \ge 3) = 2\sum_{n\ge3}3^{-n} = 2\cdot\frac{1/27}{2/3} = \frac19$.` });

  add({ id: 501, lec: 1, title: "Exactly One of Two", diff: "Easy", topics: ["Probability Axioms", "Inclusion-Exclusion"], answer: "0.5",
    statement: t`$P(A) = 0.6$, $P(B) = 0.5$, and $P(A \cup B) = 0.8$. What is the probability that exactly one of $A$, $B$ occurs?`,
    hints: [t`$P(A \cap B) = P(A) + P(B) - P(A\cup B)$.`],
    solution: t`$P(A\cap B) = 0.3$. Exactly one: $P(A\cup B) - P(A \cap B) = 0.5$.` });

  add({ id: 502, lec: 1, title: "Union of Independent Events", diff: "Easy", topics: ["Probability Axioms", "Independence"], answer: "0.58",
    statement: t`$A$ and $B$ are independent with $P(A) = 0.3$ and $P(B) = 0.4$. What is $P(A \cup B)$?`,
    hints: [t`$1 - P(A^c)P(B^c)$.`],
    solution: t`$1 - 0.7\cdot0.6 = 0.58$.` });

  add({ id: 503, lec: 1, title: "Dartboard Rings", diff: "Medium", topics: ["Probability Axioms", "Expected Value"], answer: "14.8",
    statement: t`A dartboard has radius $10$. A dart lands uniformly on the board (probability proportional to area). It scores $50$ within $2$ of the center, $20$ between $2$ and $6$, and $10$ otherwise. What is the expected score of one throw?`,
    hints: [t`Ring probabilities are ratios of areas: $(2/10)^2$, $(6/10)^2 - (2/10)^2$, and the rest.`],
    solution: t`The probabilities are $0.04$, $0.32$, $0.64$. $E = 50(0.04) + 20(0.32) + 10(0.64) = 2 + 6.4 + 6.4 = 14.8$.` });

  // ---------- Lecture 2: conditioning, total probability, Bayes
  add({ id: 510, lec: 2, title: "Sum Eight, a Six Appears", diff: "Easy", topics: ["Conditional Probability", "Dice"], answer: "2/5",
    statement: t`You roll two fair six-sided dice. Given that the sum is $8$, what is the probability that at least one die shows $6$?`,
    hints: [t`List the $5$ outcomes with sum $8$.`],
    solution: t`$(2,6),(3,5),(4,4),(5,3),(6,2)$. Two contain a $6$: $2/5$.` });

  add({ id: 511, lec: 2, title: "Lost Dog, Failed Search", diff: "Medium", topics: ["Bayes", "Conditional Probability"], answer: "9/44",
    statement: t`A dog is in forest A with probability $0.3$ and in forest B with probability $0.7$. A day of searching forest A finds the dog with probability $0.4$ if it is there. You search A for one day and do not find the dog. What is the probability that it is in A?`,
    hints: [t`$P(\text{not found}) = 0.3\cdot0.6 + 0.7\cdot1$.`],
    solution: t`$\frac{0.3\cdot0.6}{0.18 + 0.7} = \frac{0.18}{0.88} = \frac{9}{44} \approx 0.205$.` });

  add({ id: 512, lec: 2, title: "Three Machines", diff: "Easy", topics: ["Bayes"], answer: "6/17",
    statement: t`Machines 1, 2, 3 make $50\%$, $30\%$, and $20\%$ of the parts. Their defect rates are $1\%$, $2\%$, and $3\%$. A random part is defective. What is the probability that machine 3 made it?`,
    hints: [t`$P(D) = 0.005 + 0.006 + 0.006$.`],
    solution: t`$\frac{0.2\cdot0.03}{0.017} = \frac{6}{17} \approx 0.353$.` });

  add({ id: 513, lec: 2, title: "Repeated Blood Test", diff: "Medium", topics: ["Bayes", "Discrete Distributions"], answer: "0.1*0.3456/(0.1*0.3456+0.9*0.0486)",
    statement: t`A test is positive with probability $0.6$ for a sick patient and $0.1$ for a healthy one. A patient is sick with probability $0.1$. The test is run $4$ times independently (given the patient's status), and exactly $2$ results are positive. What is the probability that the patient is sick?`,
    hints: [t`$P(X = 2 \mid \text{sick}) = \binom42(0.6)^2(0.4)^2$ and $P(X=2\mid\text{healthy}) = \binom42(0.1)^2(0.9)^2$.`],
    solution: t`The likelihoods are $0.3456$ and $0.0486$. $$\frac{0.1\cdot0.3456}{0.1\cdot0.3456 + 0.9\cdot0.0486} = \frac{0.03456}{0.0783} \approx 0.441.$$` });

  add({ id: 514, lec: 2, title: "Three Tosses, One Head", diff: "Easy", topics: ["Conditional Probability", "Coins"], answer: "1/3",
    statement: t`A coin with $P(H) = p$ is tossed $3$ times. Given that there was exactly one head, what is the probability that the first toss was the head?`,
    hints: [t`Each of HTT, THT, TTH has probability $p(1-p)^2$.`],
    solution: t`The three arrangements are equally likely, so the answer is $1/3$ for any $p$.` });

  // ---------- Lecture 3: independence
  add({ id: 520, lec: 3, title: "Two Paths", diff: "Easy", topics: ["Independence", "Reliability"], answer: "1-(1-0.81)^2",
    statement: t`A network has two parallel paths from A to B. Each path has two links in series. Each link works with probability $0.9$, independently. What is the probability that A and B are connected?`,
    hints: [t`A path works with probability $0.81$.`],
    solution: t`$1 - (1 - 0.81)^2 = 1 - 0.0361 = 0.9639$.` });

  add({ id: 521, lec: 3, title: "Same Coin Twice", diff: "Medium", topics: ["Independence", "Conditional Probability"], answer: "0.82",
    statement: t`You pick one of two coins at random. Coin A has $P(H) = 0.9$; coin B has $P(H) = 0.1$. You toss the chosen coin twice. Given that the first toss is heads, what is the probability that the second toss is heads?`,
    hints: [t`The tosses are independent given the coin, but not unconditionally.`],
    solution: t`$P(HH) = \frac12(0.81 + 0.01) = 0.41$ and $P(H) = 0.5$. So $P(H_2 \mid H_1) = 0.82$.` });

  add({ id: 522, lec: 3, title: "At Least Two of Three", diff: "Easy", topics: ["Independence"], answer: "0.65",
    statement: t`Independent events $A$, $B$, $C$ have probabilities $0.5$, $0.6$, $0.7$. What is the probability that at least two of them occur?`,
    hints: [t`Add the three "exactly two" cases and the "all three" case.`],
    solution: t`Exactly two: $0.5\cdot0.6\cdot0.3 + 0.5\cdot0.4\cdot0.7 + 0.5\cdot0.6\cdot0.7 = 0.09 + 0.14 + 0.21$. All three: $0.21$. Total $0.65$.` });

  add({ id: 523, lec: 3, title: "Tetrahedral Dice Independence", diff: "Easy", topics: ["Independence", "Dice"], answer: "1/4",
    statement: t`You roll two fair four-sided dice. $A$ is "the first die is even" and $B$ is "the sum is $5$". What is $P(B \mid A)$? (Compare it with $P(B)$.)`,
    hints: [t`Given $A$, the first die is $2$ or $4$.`],
    solution: t`$P(B\mid A) = \frac{2/16}{1/2} = \frac14 = P(B)$. So $A$ and $B$ are independent.` });

  add({ id: 524, lec: 3, title: "Neighbor Also Wins", diff: "Medium", topics: ["Independence", "Conditional Probability"], answer: "(4/5)^6",
    statement: t`Six people sit at a round table. Each person points at one of the $6$ people (possibly themselves), uniformly and independently. A person wins if nobody points at them. Given that your clockwise neighbor wins, what is the probability that you also win?`,
    hints: [t`Given your neighbor wins, each person points uniformly at one of the other $5$ people.`],
    solution: t`$P(\text{both win}) = (4/6)^6$ and $P(\text{neighbor wins}) = (5/6)^6$. The ratio is $(4/5)^6 \approx 0.262$, less than $P(\text{you win}) = (5/6)^6 \approx 0.335$. So the events are not independent.` });

  add({ id: 525, lec: 3, title: "Pointing Game: Expected Winners", diff: "Easy", topics: ["Linearity of Expectation"], answer: "6*(5/6)^6",
    statement: t`Same game with $6$ people. What is the expected number of winners?`,
    hints: [t`Use one indicator per person.`],
    solution: t`$6(5/6)^6 \approx 2.009$.` });

  // ---------- Lecture 4: counting
  add({ id: 530, lec: 4, title: "Three Letters Together", diff: "Easy", topics: ["Combinatorics"], answer: "1/7",
    statement: t`The $7$ letters A to G are arranged in a uniformly random order. What is the probability that A, B, and C are next to each other (in any order)?`,
    hints: [t`Glue A, B, C into one block.`],
    solution: t`$\frac{3!\cdot5!}{7!} = \frac{720}{5040} = \frac17$.` });

  add({ id: 531, lec: 4, title: "First Ace on the Fifth Card", diff: "Medium", topics: ["Combinatorics", "Cards"], answer: "48*47*46*45*4/(52*51*50*49*48)",
    statement: t`Cards are dealt one at a time from a shuffled deck. What is the probability that the first ace is the fifth card?`,
    hints: [t`The first four cards are non-aces, then an ace.`],
    solution: t`$\frac{48}{52}\cdot\frac{47}{51}\cdot\frac{46}{50}\cdot\frac{45}{49}\cdot\frac{4}{48} \approx 0.0599$.` });

  add({ id: 532, lec: 4, title: "Thirteenth Card", diff: "Easy", topics: ["Combinatorics", "Cards", "Symmetry"], answer: "1/13",
    statement: t`Thirteen cards are dealt in order from a shuffled deck. What is the probability that the $13$th card dealt is a king?`,
    hints: [t`Every position is equally likely to hold any given card.`],
    solution: t`By symmetry, $4/52 = 1/13$.` });

  add({ id: 533, lec: 4, title: "Urn with Three Colors", diff: "Medium", topics: ["Combinatorics"], answer: "C(10,2)^3/C(30,6)",
    statement: t`An urn has $10$ red, $10$ green, and $10$ blue balls. You draw $6$ without replacement. What is the probability of exactly $2$ of each color?`,
    hints: [t`Multivariate hypergeometric.`],
    solution: t`$\frac{\binom{10}{2}^3}{\binom{30}{6}} = \frac{91125}{593775} \approx 0.1535$.` });

  add({ id: 534, lec: 4, title: "First Two Get Their Hats", diff: "Easy", topics: ["Combinatorics", "Permutations"], answer: "1/30",
    statement: t`Six people pick hats at random (a uniform permutation). What is the probability that persons 1 and 2 both get their own hats?`,
    hints: [t`$(n - m)!/n!$.`],
    solution: t`$\frac{4!}{6!} = \frac{1}{30}$.` });

  add({ id: 535, lec: 4, title: "Distinct Months", diff: "Easy", topics: ["Combinatorics"], answer: "12*11*10*9*8/12^5",
    statement: t`Five people each have a birth month that is uniform over $12$ months, independently. What is the probability that all five months differ?`,
    hints: [t`Count ordered choices.`],
    solution: t`$\frac{12\cdot11\cdot10\cdot9\cdot8}{12^5} \approx 0.382$.` });

  add({ id: 536, lec: 4, title: "Balanced Committee", diff: "Easy", topics: ["Combinatorics"], answer: "10/21",
    statement: t`A committee of $4$ is chosen at random from $5$ men and $5$ women. What is the probability of $2$ men and $2$ women?`,
    hints: [t`$\binom52^2/\binom{10}{4}$.`],
    solution: t`$\frac{100}{210} = \frac{10}{21}$.` });

  add({ id: 537, lec: 4, title: "MISSISSIPPI", diff: "Easy", topics: ["Combinatorics"], answer: "34650",
    statement: t`How many distinct arrangements are there of the letters of MISSISSIPPI?`,
    hints: [t`Divide $11!$ by the repeats: I four times, S four times, P twice.`],
    solution: t`$\frac{11!}{4!\,4!\,2!} = 34650$.` });

  add({ id: 538, lec: 4, title: "Same Study Group", diff: "Medium", topics: ["Combinatorics"], answer: "3/11",
    statement: t`Twelve students are split at random into $3$ groups of $4$. What is the probability that two specific students end up in the same group?`,
    hints: [t`Place the first student. The second student is in one of the $11$ remaining spots.`],
    solution: t`$3$ of the $11$ remaining spots are in the first student's group: $3/11$.` });

  add({ id: 539, lec: 4, title: "Commercial Orders", diff: "Easy", topics: ["Combinatorics"], answer: "35",
    statement: t`A break has $7$ commercials: $3$ identical long ones and $4$ identical short ones. How many distinct orders are there?`,
    hints: [t`Choose the positions of the long ones.`],
    solution: t`$\binom73 = 35$.` });

  // ---------- Lecture 5: random variables, PMF, expectation, variance
  add({ id: 540, lec: 5, title: "Minimum of Two Tetrahedral Dice", diff: "Easy", topics: ["Discrete Distributions"], answer: "5/16",
    statement: t`You roll two fair four-sided dice. $X$ is the minimum. What is $p_X(2)$?`,
    hints: [t`$P(X = 2) = P(X \ge 2) - P(X \ge 3)$.`],
    solution: t`$\frac{9}{16} - \frac{4}{16} = \frac{5}{16}$.` });

  add({ id: 541, lec: 5, title: "Average Speed Trap", diff: "Easy", topics: ["Expected Value"], answer: "201/2",
    statement: t`You travel $200$ miles at a constant speed $V$, where $V$ is $1$ or $200$ mph with probability $1/2$ each. What is the expected travel time in hours?`,
    hints: [t`$E[200/V] \ne 200/E[V]$.`],
    solution: t`$\frac12\cdot200 + \frac12\cdot1 = 100.5$ hours, far from $200/E[V] \approx 1.99$.` });

  add({ id: 542, lec: 5, title: "Binomial Variance", diff: "Easy", topics: ["Discrete Distributions", "Variance"], answer: "2.1",
    statement: t`$X \sim \text{Bin}(10, 0.3)$. What is $\operatorname{Var}(X)$?`,
    hints: [t`$np(1-p)$.`],
    solution: t`$10\cdot0.3\cdot0.7 = 2.1$.` });

  add({ id: 543, lec: 5, title: "Empty Servers", diff: "Easy", topics: ["Linearity of Expectation"], answer: "4*(3/4)^10",
    statement: t`$10$ requests go to $4$ servers, each request to a uniformly random server. What is the expected number of servers that get no requests?`,
    hints: [t`A given server is empty with probability $(3/4)^{10}$.`],
    solution: t`$4(3/4)^{10} \approx 0.225$.` });

  add({ id: 544, lec: 5, title: "Dartboard Variance", diff: "Medium", topics: ["Variance"], answer: "729.6",
    statement: t`Use the dartboard from "Dartboard Rings" (scores $50$, $20$, $10$ with probabilities $0.04$, $0.32$, $0.64$). What is the variance of the total score of $10$ independent throws?`,
    hints: [t`$E[X^2] = 2500(0.04) + 400(0.32) + 100(0.64) = 292$.`],
    solution: t`$\operatorname{Var}(X) = 292 - 14.8^2 = 72.96$. For $10$ independent throws: $729.6$.` });

  add({ id: 545, lec: 5, title: "Bullseye PMF", diff: "Easy", topics: ["Discrete Distributions"], answer: "C(10,2)*0.04^2*0.96^8",
    statement: t`With the same dartboard, each throw is a $50$-point bullseye with probability $0.04$. What is the probability of exactly $2$ bullseyes in $10$ throws?`,
    hints: [t`Binomial.`],
    solution: t`$\binom{10}{2}(0.04)^2(0.96)^8 \approx 0.0519$.` });

  add({ id: 546, lec: 5, title: "Sum of Indicators", diff: "Easy", topics: ["Linearity of Expectation"], answer: "1",
    statement: t`A coin with $P(H) = 1/3$ is tossed $10$ times. What is the expected number of indices $k$ such that tosses $k$ and $k+1$ are both heads?`,
    hints: [t`$9$ adjacent pairs.`],
    solution: t`$9\cdot\frac19 = 1$.` });

  // ---------- Lecture 6: conditional PMF, geometric, total expectation
  add({ id: 550, lec: 6, title: "Conditional Uniform Mean", diff: "Easy", topics: ["Conditional Expectation"], answer: "3",
    statement: t`$X$ is uniform on $\{1, 2, 3, 4\}$. Let $A = \{X \ge 2\}$. What is $E[X \mid A]$?`,
    hints: [t`Given $A$, $X$ is uniform on $\{2,3,4\}$.`],
    solution: t`$3$.` });

  add({ id: 551, lec: 6, title: "Geometric Past the Wait", diff: "Easy", topics: ["Discrete Distributions", "Conditional Expectation"], answer: "5",
    statement: t`$X$ is geometric with $p = 1/3$. What is $E[X \mid X > 2]$?`,
    hints: [t`Memorylessness.`],
    solution: t`$2 + 1/p = 5$.` });

  add({ id: 552, lec: 6, title: "Bullseye Waiting", diff: "Easy", topics: ["Discrete Distributions"], answer: "25",
    statement: t`Each throw is a bullseye with probability $0.04$. Your first $10$ throws missed. What is the expected number of additional throws until the first bullseye?`,
    hints: [t`The geometric distribution is memoryless.`],
    solution: t`$1/0.04 = 25$.` });

  add({ id: 553, lec: 6, title: "Commercial Break Length", diff: "Easy", topics: ["Conditional Expectation", "Discrete Distributions"], answer: "3",
    statement: t`Each commercial is $30$ s or $1$ min with probability $1/2$ each. After each one, another commercial airs with probability $0.75$; otherwise the break ends. What is the expected length of a break in minutes?`,
    hints: [t`The number of commercials is geometric with $p = 0.25$.`],
    solution: t`$E[N] = 4$ commercials of mean length $0.75$ min: $3$ minutes.` });

  add({ id: 554, lec: 6, title: "Short Commercial Break", diff: "Medium", topics: ["Conditional Probability", "Discrete Distributions"], answer: "19/64",
    statement: t`Same commercials (lengths $0.5$ or $1$ min, continue with probability $0.75$). What is the probability that a break lasts less than $80$ seconds?`,
    hints: [t`One commercial always works. Two commercials work only if both are $30$ s.`],
    solution: t`$P(N = 1) = 0.25$. $P(N = 2, \text{both short}) = 0.75\cdot0.25\cdot\frac14 = \frac{3}{64}$. Total $\frac{16}{64} + \frac{3}{64} = \frac{19}{64}$.` });

  add({ id: 555, lec: 6, title: "Die Then Coins: Two Heads", diff: "Medium", topics: ["Total Probability", "Discrete Distributions"], answer: "33/128",
    statement: t`You roll a fair six-sided die to get $T$, then toss a fair coin $T$ times. $X$ is the number of heads. What is $P(X = 2)$?`,
    hints: [t`$P(X = 2) = \frac16\sum_{t=2}^{6}\binom t2 2^{-t}$.`],
    solution: t`$\frac16\left(\frac14 + \frac38 + \frac{6}{16} + \frac{10}{32} + \frac{15}{64}\right) = \frac16\cdot\frac{99}{64} = \frac{33}{128}$.` });

  add({ id: 556, lec: 6, title: "Die Then Coins: Bayes", diff: "Medium", topics: ["Bayes", "Discrete Distributions"], answer: "8/33",
    statement: t`Same experiment. Given $X = 2$, what is the probability that $T = 4$?`,
    hints: [t`$P(T = 4, X = 2) = \frac16\cdot\frac{6}{16}$.`],
    solution: t`$\frac{1/16}{33/128} = \frac{8}{33}$.` });

  add({ id: 557, lec: 6, title: "Die Then Coins: Mean", diff: "Easy", topics: ["Conditional Expectation"], answer: "7/4",
    statement: t`Same experiment. What is $E[X]$?`,
    hints: [t`$E[X\mid T] = T/2$.`],
    solution: t`$E[T]/2 = 3.5/2 = 1.75$.` });

  // ---------- Lecture 7: joint PMFs, independence, expectations of products
  add({ id: 560, lec: 7, title: "Joint PMF Constant", diff: "Easy", topics: ["Joint Distributions"], answer: "1/43",
    statement: t`$p_{X,Y}(x,y) = c(x^2 + y^2)$ for $x \in \{1,2,3\}$ and $y \in \{1,2\}$. What is $c$?`,
    hints: [t`Sum over all $6$ pairs.`],
    solution: t`$\sum = 2(1 + 4 + 9) + 3(1 + 4) = 28 + 15 = 43$. So $c = 1/43$.` });

  add({ id: 561, lec: 7, title: "Joint PMF: Y Below X", diff: "Easy", topics: ["Joint Distributions"], answer: "28/43",
    statement: t`Same PMF: $p_{X,Y}(x,y) = (x^2 + y^2)/43$ for $x \in \{1,2,3\}$, $y\in\{1,2\}$. What is $P(Y < X)$?`,
    hints: [t`The pairs are $(2,1)$, $(3,1)$, $(3,2)$.`],
    solution: t`$\frac{5 + 10 + 13}{43} = \frac{28}{43}$.` });

  add({ id: 562, lec: 7, title: "Joint PMF: Mean of X", diff: "Medium", topics: ["Joint Distributions"], answer: "102/43",
    statement: t`Same PMF. What is $E[X]$?`,
    hints: [t`$p_X(x) = \frac{2x^2 + 5}{43}$.`],
    solution: t`$\frac{1\cdot7 + 2\cdot13 + 3\cdot23}{43} = \frac{102}{43} \approx 2.372$.` });

  add({ id: 563, lec: 7, title: "Shopping Hours: Two Books", diff: "Medium", topics: ["Joint Distributions", "Total Probability"], answer: "77/300",
    statement: t`$K$ is uniform on $\{1, \dots, 5\}$ hours. Given $K = k$, the number of books $N$ is uniform on $\{1, \dots, k\}$. What is $p_N(2)$?`,
    hints: [t`$p_N(2) = \sum_{k\ge2}\frac15\cdot\frac1k$.`],
    solution: t`$\frac15\left(\frac12 + \frac13 + \frac14 + \frac15\right) = \frac15\cdot\frac{77}{60} = \frac{77}{300}$.` });

  add({ id: 564, lec: 7, title: "Shopping Hours: Bayes", diff: "Medium", topics: ["Joint Distributions", "Bayes"], answer: "15/77",
    statement: t`Same model. Given $N = 2$, what is $P(K = 4)$?`,
    hints: [t`$p_{K,N}(4, 2) = \frac15\cdot\frac14$.`],
    solution: t`$\frac{1/20}{77/300} = \frac{15}{77}$.` });

  add({ id: 565, lec: 7, title: "Product of Geometrics", diff: "Medium", topics: ["Variance", "Discrete Distributions"], answer: "144",
    statement: t`$X, Y$ are i.i.d. geometric with $p = 1/3$. What is $\operatorname{Var}(XY)$?`,
    hints: [t`$E[X^2] = \frac{2 - p}{p^2}$. Independence gives $E[X^2Y^2] = E[X^2]^2$.`],
    solution: t`$E[X] = 3$ and $E[X^2] = 15$. $\operatorname{Var}(XY) = 15^2 - 3^4 = 225 - 81 = 144$.` });

  add({ id: 566, lec: 7, title: "Geometric Mix of Moments", diff: "Easy", topics: ["Expected Value", "Discrete Distributions"], answer: "8",
    statement: t`$X, Y$ are i.i.d. geometric with $p = 1/2$. What is $E[X + Y^2]$?`,
    hints: [t`$E[Y^2] = \operatorname{Var}(Y) + E[Y]^2$.`],
    solution: t`$E[X] = 2$ and $E[Y^2] = 2 + 4 = 6$. Total $8$.` });

  add({ id: 567, lec: 7, title: "Records at a Tasting", diff: "Medium", topics: ["Linearity of Expectation", "Permutations"], answer: "1+1/2+1/3+1/4+1/5+1/6",
    statement: t`A judge tastes $6$ ciders in a random order. She writes a cider's name on a card whenever it beats every cider tasted before it (the first is always written). What is the expected number of names written?`,
    hints: [t`The $k$-th cider is written with probability $1/k$.`],
    solution: t`$H_6 = 1 + \frac12 + \dots + \frac16 = 2.45$.` });

  add({ id: 568, lec: 7, title: "Independent or Not", diff: "Medium", topics: ["Joint Distributions", "Independence"], answer: "0",
    statement: t`$X$ is uniform on $\{-1, 0, 1\}$ and $Y = |X|$. What is $E[XY] - E[X]E[Y]$? (Then decide whether $X$ and $Y$ are independent.)`,
    hints: [t`$XY = X|X| \in \{-1, 0, 1\}$ with symmetric probabilities.`],
    solution: t`$E[XY] = 0$ and $E[X] = 0$, so the difference is $0$. But $X$ and $Y$ are not independent: $P(X = 0, Y = 1) = 0 \ne P(X=0)P(Y=1)$.` });

  add({ id: 569, lec: 7, title: "Conditional Mean and Variance of Hours", diff: "Hard", topics: ["Joint Distributions", "Conditional Expectation"], answer: "1065/961",
    statement: t`Use the shopping model: $K$ uniform on $\{1,\dots,5\}$ and $N \mid K = k$ uniform on $\{1,\dots,k\}$. Given that $2 \le N \le 3$, what is $\operatorname{Var}(K)$?`,
    hints: [t`$P(K = k, 2 \le N \le 3) = \frac15\cdot\frac{\#\{n \in\{2,3\}: n \le k\}}{k}$.`],
    solution: t`The weights for $k = 2,3,4,5$ are proportional to $\frac12, \frac23, \frac24, \frac25$, that is $30, 40, 30, 24$ over $124$. $E[K] = \frac{60 + 120 + 120 + 120}{124} = \frac{420}{124} = \frac{105}{31}$. $E[K^2] = \frac{120 + 360 + 480 + 600}{124} = \frac{1560}{124} = \frac{390}{31}$. $\operatorname{Var}(K) = \frac{390}{31} - \left(\frac{105}{31}\right)^2 = \frac{12090 - 11025}{961} = \frac{1065}{961}$.` });
})(typeof window !== "undefined" ? window : globalThis);
