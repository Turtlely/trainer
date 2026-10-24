// Problem bank, part 3: harder mixed problems (random walks on graphs, geometry, games).
(function (root) {
  const t = String.raw;
  const P = (root.PROBLEMS = root.PROBLEMS || []);
  const add = (p) => P.push(p);

  add({ id: 168, title: "Grid Walk to the Center", diff: "Medium", topics: ["Markov Chains", "Random Walks"], answer: "6",
    statement: t`A token sits on a corner square of a $3\times3$ grid. Each step it moves to a uniformly random square that shares an edge with its current square. What is the expected number of steps until it reaches the center square?`,
    hints: [t`There are only three kinds of squares: corner, edge, center.`],
    solution: t`From a corner, both neighbors are edge squares: $E_c = 1 + E_e$. From an edge square, $2$ of $3$ neighbors are corners and $1$ is the center: $E_e = 1 + \tfrac23E_c$. So $E_c = 2 + \tfrac23E_c$, which gives $E_c = 6$.` });

  add({ id: 169, title: "Knight Returns Home", diff: "Hard", topics: ["Markov Chains", "Random Walks", "Graphs"], answer: "168",
    statement: t`A knight starts in a corner of an $8\times8$ chessboard. Each move it picks one of its legal moves uniformly at random. What is the expected number of moves until it first returns to the starting corner?`,
    hints: [t`For a random walk on a connected graph, the stationary distribution is $\pi(v) = \deg(v)/(2|E|)$.`, t`The expected return time to $v$ is $1/\pi(v)$. Find the sum of all knight-move degrees on the board.`],
    solution: t`The degrees of the $64$ squares sum to $336$ (the knight graph has $168$ edges). The corner has degree $2$. So the expected return time is $336/2 = 168$.` });

  add({ id: 170, title: "King Returns Home", diff: "Hard", topics: ["Markov Chains", "Random Walks", "Graphs"], answer: "140",
    statement: t`A king starts in a corner of an $8\times8$ chessboard. Each move it goes to a uniformly random adjacent square (including diagonals). What is the expected number of moves until it first returns to the starting corner?`,
    hints: [t`Count edges: horizontal, vertical, and the two diagonal directions.`],
    solution: t`Horizontal and vertical edges: $2\cdot 8\cdot 7 = 112$. Diagonal edges: $2\cdot7\cdot7 = 98$. Total $210$ edges, so the degrees sum to $420$. The corner has degree $3$, so the expected return time is $420/3 = 140$.` });

  add({ id: 171, title: "All Four Suits", diff: "Medium", topics: ["Expected Value", "Cards"], answer: "25/3",
    statement: t`You draw cards from a shuffled standard deck with replacement (you put each card back and reshuffle). What is the expected number of draws until you have seen all four suits?`,
    hints: [t`This is the coupon collector problem with $4$ coupons.`],
    solution: t`$4\left(1 + \tfrac12 + \tfrac13 + \tfrac14\right) = \tfrac{25}{3} \approx 8.333$.` });

  add({ id: 172, title: "First Repeated Face", diff: "Medium", topics: ["Expected Value", "Dice"], answer: "1223/324",
    statement: t`You roll a fair die until you roll a number that you have already rolled. What is the expected number of rolls, including the repeated one?`,
    hints: [t`$P(N > k)$ is the probability that the first $k$ rolls are all different.`],
    solution: t`$P(N>k) = \frac{6\cdot5\cdots(6-k+1)}{6^k}$ for $k=0,\dots,6$: $1, 1, \tfrac56, \tfrac59, \tfrac5{18}, \tfrac5{54}, \tfrac5{324}$.
$$E[N] = \sum_{k=0}^6 P(N>k) = \frac{1223}{324} \approx 3.775.$$` });

  add({ id: 173, title: "Return of a Biased Walk", diff: "Hard", topics: ["Random Walks"], answer: "0.8",
    statement: t`A random walk starts at $0$. Each step is $+1$ with probability $0.6$ and $-1$ with probability $0.4$. What is the probability that the walk ever returns to $0$?`,
    hints: [t`After the first step, find the probability of ever coming back from $+1$ and from $-1$.`, t`From $-1$ the walk drifts up, so it surely returns. From $+1$ the return probability is $q/p$.`],
    solution: t`From $-1$ the walk returns with probability $1$. From $+1$ it returns with probability $q/p = 2/3$. So $P = 0.4\cdot 1 + 0.6\cdot\tfrac23 = 0.8$. In general the answer is $1 - |p - q|$.` });

  add({ id: 174, title: "Climbing Against the Wind", diff: "Medium", topics: ["Random Walks"], answer: "1/2",
    statement: t`A random walk starts at $0$. Each step is $+1$ with probability $1/3$ and $-1$ with probability $2/3$. What is the probability that it ever reaches $+1$?`,
    hints: [t`Let $x$ be the answer. To reach $+1$ from $-1$ you must climb twice.`],
    solution: t`$x = \tfrac13 + \tfrac23x^2$. The roots are $1$ and $\tfrac12$. Since the walk drifts down, the answer is the smaller root, $\tfrac12 = p/q$.` });

  add({ id: 175, title: "Fair Ruin Duration", diff: "Medium", topics: ["Random Walks", "Martingales"], answer: "21",
    statement: t`You have $3$ dollars and bet $1$ dollar on each fair coin flip until you have $0$ or $10$ dollars. What is the expected number of flips?`,
    hints: [t`$W_n^2 - n$ is a martingale.`],
    solution: t`$E[\tau] = E[W_\tau^2] - 9 = 100\cdot\tfrac{3}{10} - 9 = 21$. In general the duration is $k(N - k) = 3\cdot7$.` });

  add({ id: 176, title: "Biased Ruin Duration", diff: "Hard", topics: ["Random Walks", "Martingales"], answer: "1265/211",
    statement: t`You start with $2$ dollars and bet $1$ dollar per round. You win each round with probability $0.6$. You stop at $0$ or $5$ dollars. What is the expected number of rounds?`,
    hints: [t`$W_n - (p - q)n$ is a martingale.`, t`You already know $P(\text{reach } 5) = 135/211$.`],
    solution: t`$E[W_\tau] = 2 + 0.2\,E[\tau]$, and $E[W_\tau] = 5\cdot\tfrac{135}{211}$. So
$$E[\tau] = \frac{5\cdot\tfrac{135}{211} - 2}{0.2} = \frac{1265}{211} \approx 5.995.$$` });

  add({ id: 177, title: "Last Blue Ball", diff: "Medium", topics: ["Order Statistics", "Combinatorics"], answer: "4",
    statement: t`An urn has $3$ red and $2$ blue balls. You draw balls one by one without replacement until both blue balls have been drawn. What is the expected number of draws?`,
    hints: [t`The blue balls occupy a uniform random pair of the positions $1,\dots,5$. Find the expected larger position.`],
    solution: t`The maximum of $k$ random positions out of $n$ has mean $\frac{k(n+1)}{k+1} = \frac{2\cdot6}{3} = 4$.` });

  add({ id: 178, title: "Non-Crossing Chords", diff: "Hard", topics: ["Combinatorics", "Geometric Probability"], answer: "2/15",
    statement: t`$8$ points lie on a circle. You pair them up into $4$ chords uniformly at random among all perfect matchings. What is the probability that no two chords cross?`,
    hints: [t`The number of perfect matchings of $2n$ points is $(2n-1)!! = 1\cdot3\cdot5\cdots(2n-1)$.`, t`Non-crossing matchings are counted by the Catalan numbers.`],
    solution: t`There are $7!! = 105$ matchings and $C_4 = 14$ non-crossing ones. So $P = 14/105 = 2/15$.` });

  add({ id: 179, title: "Involutions", diff: "Medium", topics: ["Permutations", "Combinatorics"], answer: "5/12",
    statement: t`A uniformly random permutation $\pi$ of $\{1,2,3,4\}$ is chosen. What is the probability that $\pi\circ\pi$ is the identity?`,
    hints: [t`$\pi$ must consist only of fixed points and $2$-cycles.`],
    solution: t`Count: identity ($1$), one transposition ($6$), two transpositions ($3$). That is $10$ of $24$, so $5/12$.` });

  add({ id: 180, title: "Matching Socks", diff: "Hard", topics: ["Expected Value", "Combinatorics"], answer: "5.675463855",
    statement: t`A drawer has $10$ distinct pairs of socks ($20$ socks). You draw socks one at a time, uniformly at random without replacement, until you hold a matching pair. What is the expected number of socks drawn? (Give $4$ decimal places.)`,
    hints: [t`$P(N > k) = P(\text{no pair among the first } k) = \binom{10}{k}2^k \big/ \binom{20}{k}$.`],
    solution: t`$$E[N] = \sum_{k=0}^{10}\frac{\binom{10}{k}2^k}{\binom{20}{k}} \approx 5.6755.$$` });

  add({ id: 181, title: "Best of Two Uniforms", diff: "Medium", topics: ["Optimal Stopping", "Continuous Distributions"], answer: "89/128",
    statement: t`You may draw up to $3$ independent uniform $[0,1]$ numbers, one at a time. After each draw you may stop and keep that number, or discard it and draw again. You must keep the last draw. With optimal play, what is your expected payoff?`,
    hints: [t`With one draw left the value is $v_1 = 1/2$. Keep $x$ if $x > v_{k}$.`, t`$v_{k+1} = E[\max(U, v_k)] = \frac{1 + v_k^2}{2}$.`],
    solution: t`$v_1 = \tfrac12$, $v_2 = \tfrac{1 + 1/4}{2} = \tfrac58$, $v_3 = \tfrac{1 + 25/64}{2} = \tfrac{89}{128} \approx 0.6953$.` });

  add({ id: 182, title: "Redraw Duel", diff: "Hard", topics: ["Games & Strategy", "Continuous Distributions"], answer: "(sqrt(5)-1)/2",
    statement: t`Two players each privately draw a uniform $[0,1]$ number. Each player may, once, throw away their number and draw a new one, without knowing what the other player did. The higher final number wins. In the symmetric equilibrium, each player redraws when their first number is below a threshold $t$. What is $t$?`,
    hints: [t`If your opponent uses threshold $t$, their final number $Y$ has CDF $F(y) = ty + \max(0, y - t)$.`, t`At $x = t$ you must be indifferent: $F(t) = \int_0^1 F(u)\,du$.`],
    solution: t`$F(t) = t^2$ and $\int_0^1 F = \frac t2 + \frac{(1-t)^2}{2}$. Setting them equal gives $t^2 + t - 1 = 0$, so $t = \frac{\sqrt5 - 1}{2} \approx 0.618$.` });

  add({ id: 183, title: "Random Triangle in a Square", diff: "Hard", topics: ["Geometric Probability"], answer: "11/144",
    statement: t`Three points are chosen independently and uniformly in the unit square. What is the expected area of the triangle they form?`,
    hints: [t`This is a known but hard integral. A useful route: compute the probability that a fourth uniform point lands inside the triangle.`, t`$E[\text{area}] = P(\text{4th point inside the triangle})$, and $P(4 \text{ points in convex position}) = 1 - 4E[\text{area}]$. Sylvester's problem for the square gives $25/36$.`],
    solution: t`Sylvester's four-point problem for a square gives $P(\text{convex position}) = 25/36$. A random point is inside the triangle of the other three with probability $E[\text{area}]$, and any of the $4$ points can be the inner one, so $1 - 4E[\text{area}] = 25/36$. That gives $E[\text{area}] = 11/144 \approx 0.0764$.` });

  add({ id: 184, title: "Random Triangle on a Circle", diff: "Hard", topics: ["Geometric Probability"], answer: "3/(2*pi)",
    statement: t`Three points are chosen independently and uniformly on the unit circle. What is the expected area of the triangle they form?`,
    hints: [t`Let the arcs between consecutive points be $\alpha, \beta, \gamma$ with $\alpha+\beta+\gamma = 2\pi$. The area is $\frac12(\sin\alpha + \sin\beta + \sin\gamma)$.`, t`Each arc has density $\frac{1}{\pi}\left(1 - \frac{\alpha}{2\pi}\right)$ on $[0, 2\pi]$.`],
    solution: t`By symmetry, $E[\text{area}] = \frac32E[\sin\alpha]$. With density $\frac1\pi\left(1 - \frac{\alpha}{2\pi}\right)$,
$$E[\sin\alpha] = \frac1\pi\int_0^{2\pi}\left(1-\frac{\alpha}{2\pi}\right)\sin\alpha\,d\alpha = \frac{1}{\pi}.$$ So $E[\text{area}] = \frac{3}{2\pi} \approx 0.4775$.` });

  add({ id: 185, title: "Someone Shares My Birthday", diff: "Medium", topics: ["Complementary Counting"], answer: "253",
    statement: t`Birthdays are uniform over $365$ days. What is the smallest number $n$ of other people such that the probability that at least one of them has your birthday is greater than $1/2$?`,
    hints: [t`$1 - (364/365)^n > 1/2$.`],
    solution: t`$n > \frac{\ln 2}{\ln(365/364)} \approx 252.65$. So $n = 253$. Compare with $23$ for any shared birthday.` });

  add({ id: 186, title: "Sum Exceeds Two", diff: "Hard", topics: ["Expected Value", "Continuous Distributions"], answer: "e^2-e",
    statement: t`You draw independent uniform $[0,1]$ numbers until their running sum is greater than $2$. What is the expected number of draws?`,
    hints: [t`Let $m(x)$ be the expected number of draws to exceed $x$. Then $m(x) = 1 + \int_{\max(0,x-1)}^{x} m(y)\,dy$.`, t`For $x \le 1$, $m(x) = e^x$.`],
    solution: t`For $1 \le x \le 2$, differentiate: $m'(x) = m(x) - m(x - 1) = m(x) - e^{x-1}$. With $m(1) = e$, the solution is $m(x) = e^x - (x-1)e^{x-1}$. So $m(2) = e^2 - e \approx 4.671$.` });

  add({ id: 187, title: "Acute Broken Stick", diff: "Hard", topics: ["Geometric Probability"], answer: "3*ln(2)-2",
    statement: t`You break a stick of length $1$ at two independent uniform points. What is the probability that the three pieces form an acute triangle?`,
    hints: [t`The pieces $(a,b,c)$ are uniform on the simplex $a+b+c=1$. Acute means $c^2 < a^2 + b^2$ for each choice of $c$.`, t`If $c > 1/2$ then $c^2 > a^2+b^2$ automatically. So the three events $\{c^2 > a^2+b^2\}$, $\{a^2 > b^2+c^2\}$, $\{b^2 > a^2+c^2\}$ are disjoint and cover every non-acute case.`],
    solution: t`$(a,b)$ has density $2$ on $\{a + b < 1\}$, and $c = 1 - a - b$. The condition $c^2 > a^2 + b^2$ simplifies to $b < \frac{1-2a}{2(1-a)}$ (with $a < 1/2$). So
$$P(c^2 > a^2+b^2) = 2\int_0^{1/2}\frac{1-2a}{2(1-a)}\,da = \int_0^{1/2}\left(2 - \frac{1}{1-a}\right)da = 1 - \ln 2.$$
The three events are disjoint, so $P(\text{acute}) = 1 - 3(1 - \ln 2) = 3\ln 2 - 2 \approx 0.0794$. Only about a third of the triangles you can form are acute.` });

  add({ id: 188, title: "Break the Bigger Piece", diff: "Hard", topics: ["Geometric Probability"], answer: "2*ln(2)-1",
    statement: t`You break a stick of length $1$ at a uniform point. Then you break the longer piece at a uniform point on it. What is the probability that the three pieces form a triangle?`,
    hints: [t`Let the longer piece have length $L$, uniform on $[1/2, 1]$. Break it at $V$, uniform on $[0, L]$.`, t`You need $V < 1/2$ and $L - V < 1/2$.`],
    solution: t`Given $L$, the condition is $L - \tfrac12 < V < \tfrac12$, which has probability $\frac{1-L}{L}$. Average over $L$ uniform on $[\tfrac12, 1]$:
$$2\int_{1/2}^1 \frac{1 - L}{L}\,dL = 2\left(\ln 2 - \tfrac12\right) = 2\ln 2 - 1 \approx 0.3863.$$` });

  add({ id: 189, title: "Normal Tail Ratio", diff: "Medium", topics: ["Normal Distribution", "Conditional Probability"], answer: "0.1433931",
    statement: t`$X \sim N(0,1)$. What is $P(X > 2 \mid X > 1)$? (Give $4$ decimal places. $\Phi(1) \approx 0.84134$, $\Phi(2) \approx 0.97725$.)`,
    hints: [t`$P(X > 2)/P(X > 1)$.`],
    solution: t`$\frac{1 - \Phi(2)}{1 - \Phi(1)} = \frac{0.02275}{0.15866} \approx 0.1434$.` });

  add({ id: 190, title: "Correlation with the Max", diff: "Hard", topics: ["Normal Distribution", "Covariance", "Order Statistics"], answer: "0.5/sqrt(1-1/pi)",
    statement: t`$X, Y$ are independent $N(0,1)$, and $M = \max(X,Y)$. What is the correlation of $X$ and $M$?`,
    hints: [t`Write $M = \frac{X+Y}{2} + \frac{|X-Y|}{2}$. Note that $X+Y$ and $X-Y$ are independent.`, t`$E[M^2] = 1$, since $M^2$ and $\min(X,Y)^2$ have the same distribution.`],
    solution: t`$\operatorname{Cov}(X, M) = E[XM] = \tfrac12 E[X(X+Y)] + \tfrac12E[X|X-Y|] = \tfrac12 + 0$. $\operatorname{Var}(M) = 1 - \tfrac1\pi$. So
$$\rho = \frac{1/2}{\sqrt{1 - 1/\pi}} \approx 0.6056.$$` });

  add({ id: 191, title: "Reflecting Path", diff: "Medium", topics: ["Random Walks", "Markov Chains"], answer: "100",
    statement: t`A walker on $\{0, 1, \dots, 10\}$ starts at $0$. From $0$ it always steps to $1$. From any other position it steps $\pm1$ with equal probability. What is the expected number of steps until it first reaches $10$?`,
    hints: [t`Let $T_k$ be the expected time to go from $k$ to $k+1$. Then $T_0 = 1$ and $T_k = 1 + \tfrac12(T_{k-1} + T_k)$.`],
    solution: t`$T_k = 2 + T_{k-1}$, so $T_k = 2k + 1$. Total $\sum_{k=0}^{9}(2k+1) = 10^2 = 100$.` });

  add({ id: 192, title: "Double Six", diff: "Medium", topics: ["Expected Value", "Dice", "Martingales"], answer: "42",
    statement: t`You roll a fair die until you get two $6$s in a row. What is the expected number of rolls?`,
    hints: [t`Use the overlap formula, or states "no 6" and "one 6".`],
    solution: t`The pattern 66 overlaps itself at lengths $2$ and $1$, so $E = 6^2 + 6 = 42$.` });

  add({ id: 193, title: "Nested Uniforms", diff: "Medium", topics: ["Conditional Expectation", "Variance"], answer: "7/144",
    statement: t`$X$ is uniform on $[0,1]$. Given $X$, $Y$ is uniform on $[0, X]$. What is $\operatorname{Var}(Y)$?`,
    hints: [t`$E[Y] = E[X]/2$ and $E[Y^2] = E[X^2]/3$.`],
    solution: t`$E[Y] = \tfrac14$ and $E[Y^2] = \tfrac13\cdot\tfrac13 = \tfrac19$. So $\operatorname{Var}(Y) = \tfrac19 - \tfrac1{16} = \tfrac{7}{144}$.` });

  add({ id: 194, title: "Two Heads with a Biased Coin", diff: "Medium", topics: ["Expected Value", "Coins"], answer: "12",
    statement: t`A coin shows heads with probability $1/3$. You flip it until you get two heads in a row. What is the expected number of flips?`,
    hints: [t`For HH with heads probability $p$, $E = \frac{1 + p}{p^2}$.`],
    solution: t`$E_0 = 1 + pE_1 + qE_0$ and $E_1 = 1 + qE_0$. Solving gives $E_0 = \frac{1+p}{p^2} = \frac{4/3}{1/9} = 12$.` });

  add({ id: 195, title: "Fixed Points Given One", diff: "Medium", topics: ["Permutations", "Conditional Expectation"], answer: "2",
    statement: t`A uniformly random permutation of $\{1,\dots,10\}$ is chosen. Given that $1$ is a fixed point, what is the expected number of fixed points?`,
    hints: [t`Given $\pi(1) = 1$, the rest is a uniform permutation of $9$ elements.`],
    solution: t`$1 + 9\cdot\tfrac19 = 2$.` });

  add({ id: 196, title: "One Pair", diff: "Medium", topics: ["Cards", "Combinatorics"], answer: "1098240/2598960",
    statement: t`You are dealt $5$ cards. What is the probability of exactly one pair (two cards of one rank, and three cards of three other different ranks)?`,
    hints: [t`Choose the pair rank and suits, then $3$ other ranks and a suit for each.`],
    solution: t`$13\binom42\binom{12}{3}4^3 = 13\cdot6\cdot220\cdot64 = 1{,}098{,}240$. Probability $\approx 0.4226$.` });

  add({ id: 197, title: "Suits in a Hand", diff: "Medium", topics: ["Cards", "Linearity of Expectation"], answer: "4*(1-C(39,5)/C(52,5))",
    statement: t`You are dealt $5$ cards. What is the expected number of different suits in your hand?`,
    hints: [t`A given suit is missing with probability $\binom{39}{5}/\binom{52}{5}$.`],
    solution: t`$4\left(1 - \binom{39}{5}\big/\binom{52}{5}\right) \approx 3.114$.` });

  add({ id: 198, title: "Fair Bit from a Biased Coin", diff: "Medium", topics: ["Expected Value", "Coins"], answer: "9/2",
    statement: t`A coin shows heads with probability $1/3$. To make a fair bit, you use von Neumann's trick: flip twice; HT means $0$, TH means $1$, and HH or TT means start again. What is the expected number of flips to produce one fair bit?`,
    hints: [t`Each pair of flips succeeds with probability $2pq$.`],
    solution: t`Each round uses $2$ flips and succeeds with probability $2\cdot\tfrac13\cdot\tfrac23 = \tfrac49$. Expected flips $= 2/(4/9) = 4.5$.` });

  add({ id: 199, title: "Die from Three Coins", diff: "Medium", topics: ["Expected Value", "Coins"], answer: "4",
    statement: t`You want to simulate a fair die with a fair coin. You flip $3$ coins to get a number from $0$ to $7$. If it is $0$ to $5$, you output it plus $1$. Otherwise you start again. What is the expected number of coin flips?`,
    hints: [t`Each round of $3$ flips succeeds with probability $3/4$.`],
    solution: t`$3 / (3/4) = 4$. (A smarter scheme that reuses the leftover randomness gets $11/3$.)` });

  add({ id: 200, title: "Sum Divisible by Six", diff: "Easy", topics: ["Dice", "Symmetry"], answer: "1/6",
    statement: t`You roll $10$ fair dice. What is the probability that the sum is divisible by $6$?`,
    hints: [t`Condition on the first $9$ dice. Then exactly one value of the last die works.`],
    solution: t`Whatever the first $9$ dice show, exactly one face of the last die makes the sum divisible by $6$. So $P = 1/6$.` });

  add({ id: 201, title: "Isolated Vertices", diff: "Easy", topics: ["Linearity of Expectation", "Graphs"], answer: "10*(1/2)^9",
    statement: t`A random graph on $10$ vertices includes each possible edge independently with probability $1/2$. What is the expected number of isolated vertices (vertices with no edges)?`,
    hints: [t`A given vertex is isolated when all $9$ of its possible edges are missing.`],
    solution: t`$10\cdot 2^{-9} = 10/512 \approx 0.01953$.` });
})(typeof window !== "undefined" ? window : globalThis);
