// Problem bank, part 2: continuous distributions, geometric probability, order statistics,
// random walks, Markov chains, permutations, stochastic processes, branching processes.
(function (root) {
  const t = String.raw;
  const P = (root.PROBLEMS = root.PROBLEMS || []);
  const add = (p) => P.push(p);

  add({ id: 91, title: "Broken Stick Triangle", diff: "Medium", topics: ["Geometric Probability"], answer: "1/4",
    statement: t`You break a stick of length $1$ at two points chosen independently and uniformly. What is the probability that the three pieces can form a triangle?`,
    hints: [t`The pieces form a triangle exactly when every piece is shorter than $1/2$.`],
    solution: t`Draw the unit square of break points $(x,y)$. The region where all three pieces are shorter than $1/2$ is two triangles with total area $1/4$.` });

  add({ id: 92, title: "Longer Piece", diff: "Easy", topics: ["Continuous Distributions"], answer: "3/4",
    statement: t`You break a stick of length $1$ at one uniform point. What is the expected length of the longer piece?`,
    hints: [t`The longer piece has length $\max(U, 1-U)$, which is uniform on $[1/2, 1]$.`],
    solution: t`$\max(U, 1-U)$ is uniform on $[1/2,1]$, so its mean is $3/4$.` });

  add({ id: 93, title: "Shortest of Three Pieces", diff: "Hard", topics: ["Order Statistics", "Geometric Probability"], answer: "1/9",
    statement: t`You break a stick of length $1$ at two independent uniform points. What is the expected length of the shortest piece?`,
    hints: [t`The three spacings are exchangeable. $P(\min > x) = (1 - 3x)^2$ for $0 \le x \le 1/3$.`],
    solution: t`$P(\min > x)$ means each piece is longer than $x$. After removing $x$ from each piece, the remaining length $1 - 3x$ is split the same way, so $P = (1-3x)^2$.
$$E[\min] = \int_0^{1/3} (1 - 3x)^2\,dx = \frac{1}{9}.$$` });

  add({ id: 94, title: "Longest of Three Pieces", diff: "Hard", topics: ["Order Statistics", "Geometric Probability"], answer: "11/18",
    statement: t`You break a stick of length $1$ at two independent uniform points. What is the expected length of the longest piece?`,
    hints: [t`For $n$ pieces, the expected $k$-th smallest spacing is $\frac1n\sum_{j=n-k+1}^{n}\frac1j$.`],
    solution: t`With $3$ pieces, the expected sorted lengths are $\tfrac13\cdot\tfrac13$, $\tfrac13(\tfrac13 + \tfrac12)$, $\tfrac13(\tfrac13+\tfrac12+1)$. The largest is $\tfrac13\cdot\tfrac{11}{6} = \tfrac{11}{18}$. (Check: $\tfrac19 + \tfrac5{18} + \tfrac{11}{18} = 1$.)` });

  add({ id: 95, title: "Smallest Gap", diff: "Hard", topics: ["Order Statistics", "Geometric Probability"], answer: "1/16",
    statement: t`Three points are chosen independently and uniformly on $[0,1]$. They cut the interval into $4$ pieces. What is the expected length of the shortest piece?`,
    hints: [t`$P(\min > x) = (1 - 4x)^3$.`],
    solution: t`$$E = \int_0^{1/4} (1 - 4x)^3\,dx = \frac{1}{16}.$$ In general, $n$ points give $E[\min] = 1/(n+1)^2$.` });

  add({ id: 96, title: "Max of Two Uniforms", diff: "Easy", topics: ["Order Statistics", "Continuous Distributions"], answer: "2/3",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is $E[\max(X,Y)]$?`,
    hints: [t`$P(\max \le m) = m^2$.`],
    solution: t`The density is $2m$, so $E = \int_0^1 2m^2\,dm = 2/3$.` });

  add({ id: 97, title: "Uniform Distance", diff: "Medium", topics: ["Continuous Distributions"], answer: "1/3",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is $E|X - Y|$?`,
    hints: [t`$|X-Y| = \max - \min$.`],
    solution: t`$E[\max] - E[\min] = 2/3 - 1/3 = 1/3$.` });

  add({ id: 98, title: "Max of Five Uniforms", diff: "Easy", topics: ["Order Statistics"], answer: "5/6",
    statement: t`$X_1,\dots,X_5$ are independent and uniform on $[0,1]$. What is $E[\max X_i]$?`,
    hints: [t`$E[U_{(k)}] = \frac{k}{n+1}$.`],
    solution: t`$5/6$.` });

  add({ id: 99, title: "Second Largest of Five", diff: "Easy", topics: ["Order Statistics"], answer: "2/3",
    statement: t`$X_1,\dots,X_5$ are independent and uniform on $[0,1]$. What is the expected value of the second largest?`,
    hints: [t`The $k$-th smallest of $n$ uniforms has mean $k/(n+1)$.`],
    solution: t`The second largest is the $4$-th smallest: $4/6 = 2/3$.` });

  add({ id: 100, title: "Min-Max Correlation", diff: "Hard", topics: ["Order Statistics", "Covariance"], answer: "1/2",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. Let $m = \min(X,Y)$ and $M = \max(X,Y)$. What is the correlation of $m$ and $M$?`,
    hints: [t`$mM = XY$, so $E[mM] = 1/4$.`, t`$\operatorname{Var}(M) = \operatorname{Var}(m) = 1/18$.`],
    solution: t`$\operatorname{Cov}(m, M) = E[XY] - E[m]E[M] = \tfrac14 - \tfrac13\cdot\tfrac23 = \tfrac{1}{36}$. $\operatorname{Var}(M) = E[M^2] - E[M]^2 = \tfrac12 - \tfrac49 = \tfrac1{18}$, and the same holds for $m$. So $\rho = \frac{1/36}{1/18} = \frac12$.` });

  add({ id: 101, title: "Meeting at the Cafe", diff: "Medium", topics: ["Geometric Probability"], answer: "7/16",
    statement: t`Two friends each arrive at a cafe at a uniform random time between 12:00 and 13:00, independently. Each one waits $15$ minutes for the other and then leaves. What is the probability that they meet?`,
    hints: [t`They meet when $|X - Y| \le 1/4$ (in hours).`],
    solution: t`The region where they do not meet is two triangles with total area $(3/4)^2$. So $P = 1 - 9/16 = 7/16$.` });

  add({ id: 102, title: "Sum Below One", diff: "Easy", topics: ["Geometric Probability"], answer: "1/6",
    statement: t`$X, Y, Z$ are independent and uniform on $[0,1]$. What is $P(X + Y + Z < 1)$?`,
    hints: [t`This is the volume of a simplex.`],
    solution: t`The volume of $\{x+y+z < 1\}$ in the unit cube is $1/3! = 1/6$.` });

  add({ id: 103, title: "One Beats the Other Two", diff: "Medium", topics: ["Geometric Probability"], answer: "1/6",
    statement: t`$X, Y, Z$ are independent and uniform on $[0,1]$. What is $P(X > Y + Z)$?`,
    hints: [t`Condition on $X = x$: $P(Y + Z < x) = x^2/2$.`],
    solution: t`$\int_0^1 \frac{x^2}{2}\,dx = \frac16$.` });

  add({ id: 104, title: "Sum Exceeds One", diff: "Medium", topics: ["Expected Value", "Continuous Distributions"], answer: "e",
    statement: t`You draw independent uniform $[0,1]$ numbers until their running sum is greater than $1$. What is the expected number of draws?`,
    hints: [t`$P(N > n) = P(U_1 + \dots + U_n < 1) = 1/n!$.`],
    solution: t`$E[N] = \sum_{n \ge 0} P(N > n) = \sum_{n\ge0} \frac{1}{n!} = e$.` });

  add({ id: 105, title: "Until It Drops", diff: "Hard", topics: ["Expected Value", "Permutations"], answer: "e",
    statement: t`You draw independent uniform $[0,1]$ numbers $X_1, X_2, \dots$. You stop at the first $n$ with $X_n < X_{n-1}$. What is the expected number of draws?`,
    hints: [t`$N > n$ means the first $n$ values are increasing.`],
    solution: t`$P(N > n) = P(X_1 < \dots < X_n) = 1/n!$. So $E[N] = \sum_{n\ge0} 1/n! = e$.` });

  add({ id: 106, title: "Real Roots", diff: "Medium", topics: ["Geometric Probability"], answer: "1/12",
    statement: t`$B$ and $C$ are independent and uniform on $[0,1]$. What is the probability that $x^2 + Bx + C = 0$ has real roots?`,
    hints: [t`You need $B^2 \ge 4C$.`],
    solution: t`$\int_0^1 \frac{b^2}{4}\,db = \frac{1}{12}$.` });

  add({ id: 107, title: "Product Below One Half", diff: "Medium", topics: ["Continuous Distributions"], answer: "1/2+ln(2)/2",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is $P(XY < 1/2)$?`,
    hints: [t`$P(XY \le t) = t - t\ln t$.`],
    solution: t`$P(XY \le t) = t + \int_t^1 \frac{t}{x}\,dx = t - t\ln t$. With $t = 1/2$: $\frac12 + \frac12\ln 2 \approx 0.8466$.` });

  add({ id: 108, title: "Ratio Rounds to Even", diff: "Hard", topics: ["Continuous Distributions"], answer: "(5-pi)/4",
    statement: t`$X, Y$ are independent and uniform on $(0,1)$. What is the probability that $X/Y$, rounded to the nearest integer, is even? (Rounding to $0$ counts as even.)`,
    hints: [t`$P(X/Y < 1/2) = 1/4$.`, t`For $k \ge 1$, $P(2k - \tfrac12 < X/Y < 2k + \tfrac12)$ is a thin triangle with area $\tfrac12\left(\tfrac{1}{2k - 1/2} - \tfrac{1}{2k+1/2}\right)$.`],
    solution: t`$$P = \frac14 + \sum_{k\ge1}\left(\frac{1}{4k-1} - \frac{1}{4k+1}\right) = \frac14 + \left(1 - \frac{\pi}{4}\right) = \frac{5 - \pi}{4} \approx 0.4646,$$ by the Leibniz series $1 - \tfrac13 + \tfrac15 - \dots = \tfrac\pi4$.` });

  add({ id: 109, title: "Ratio of Min to Max", diff: "Medium", topics: ["Continuous Distributions"], answer: "1/2",
    statement: t`$X, Y$ are independent and uniform on $[0,1]$. What is $E\left[\min(X,Y)/\max(X,Y)\right]$?`,
    hints: [t`Find $P(\min/\max \le r)$.`],
    solution: t`$P(Y/X \le r,\, Y < X) = r/2$. By symmetry, $P(\min/\max \le r) = r$. So the ratio is uniform on $[0,1]$, with mean $1/2$.` });

  add({ id: 110, title: "Point in a Disk", diff: "Easy", topics: ["Geometric Probability"], answer: "2/3",
    statement: t`A point is chosen uniformly in the unit disk. What is its expected distance from the center?`,
    hints: [t`The density of the radius is $2r$.`],
    solution: t`$\int_0^1 r\cdot 2r\,dr = 2/3$.` });

  add({ id: 111, title: "Ball in a Cube", diff: "Easy", topics: ["Geometric Probability"], answer: "pi/6",
    statement: t`A point is chosen uniformly in the unit cube. What is the probability that it is within distance $1/2$ of the center of the cube?`,
    hints: [t`The ball of radius $1/2$ fits inside the cube.`],
    solution: t`$\frac43\pi\left(\frac12\right)^3 = \frac{\pi}{6} \approx 0.5236$.` });

  add({ id: 112, title: "Closer to the Center", diff: "Hard", topics: ["Geometric Probability"], answer: "(4*sqrt(2)-5)/3",
    statement: t`A point is chosen uniformly in a unit square. What is the probability that it is closer to the center of the square than to the boundary of the square?`,
    hints: [t`Use symmetry: work in one of the $8$ triangles, where the nearest edge is fixed.`, t`The boundary of the region is a parabola.`],
    solution: t`Put the center at the origin and take the triangle where the nearest edge is $y = -1/2$. The condition is $\sqrt{x^2 + y^2} < y + \tfrac12$, so $y > x^2 - \tfrac14$. Integrating over the triangle and multiplying by $8$ gives
$$P = \frac{4\sqrt2 - 5}{3} \approx 0.2190.$$` });

  add({ id: 113, title: "Distance in a Square", diff: "Hard", topics: ["Geometric Probability"], answer: "(2+sqrt(2)+5*ln(1+sqrt(2)))/15",
    statement: t`Two points are chosen independently and uniformly in the unit square. What is the expected distance between them? (Give the exact value or $4$ significant digits.)`,
    hints: [t`The differences $|X_1 - X_2|$ and $|Y_1 - Y_2|$ have the triangular density $2(1 - u)$ on $[0,1]$.`, t`Compute $\int_0^1\!\!\int_0^1 4(1-u)(1-v)\sqrt{u^2 + v^2}\,du\,dv$ in polar coordinates.`],
    solution: t`$$E = \int_0^1\!\!\int_0^1 4(1-u)(1-v)\sqrt{u^2+v^2}\,du\,dv = \frac{2 + \sqrt2 + 5\ln(1+\sqrt2)}{15} \approx 0.5214.$$` });

  add({ id: 114, title: "Buffon's Needle", diff: "Medium", topics: ["Geometric Probability"], answer: "2/pi",
    statement: t`A floor has parallel lines at spacing $1$. You drop a needle of length $1$ at a random position and angle. What is the probability that the needle crosses a line?`,
    hints: [t`Let $y \in [0, 1/2]$ be the distance from the center to the nearest line, and $\theta \in [0, \pi/2]$ the angle. The needle crosses when $y \le \tfrac12\sin\theta$.`],
    solution: t`$$P = \frac{\int_0^{\pi/2} \tfrac12 \sin\theta\,d\theta}{\tfrac12\cdot\tfrac{\pi}{2}} = \frac{2}{\pi} \approx 0.6366.$$` });

  add({ id: 115, title: "Triangle Contains the Center", diff: "Medium", topics: ["Geometric Probability"], answer: "1/4",
    statement: t`Three points are chosen independently and uniformly on a circle. What is the probability that the triangle they form contains the center of the circle?`,
    hints: [t`The triangle misses the center exactly when all three points lie in a semicircle.`],
    solution: t`$P(\text{all in a semicircle}) = n/2^{n-1} = 3/4$ for $n = 3$. So the answer is $1/4$. (This is also the probability that the triangle is acute.)` });

  add({ id: 116, title: "Four Points in a Semicircle", diff: "Medium", topics: ["Geometric Probability"], answer: "1/2",
    statement: t`Four points are chosen uniformly on a circle. What is the probability that all four lie in some semicircle?`,
    hints: [t`For each point $i$, let $A_i$ be the event that the other points lie in the semicircle clockwise from point $i$. These events are disjoint.`],
    solution: t`$P(A_i) = (1/2)^{n-1}$, and the events are disjoint. So $P = n/2^{n-1} = 4/8 = 1/2$.` });

  add({ id: 117, title: "Tetrahedron Contains the Center", diff: "Hard", topics: ["Geometric Probability"], answer: "1/8",
    statement: t`Four points are chosen uniformly on the surface of a sphere. What is the probability that the tetrahedron they form contains the center of the sphere?`,
    hints: [t`Fix three random lines through the center. Each point is one of the two ends of its line, chosen by a coin flip.`, t`Of the $8$ sign choices for three points, exactly one works with the fourth point.`],
    solution: t`Choose $3$ random diameters and the fourth point $P_4$. Each of the first three points is one end of its diameter, with $2^3 = 8$ equally likely choices. Exactly one of the $8$ choices gives a tetrahedron that contains the center. So $P = 1/8$.` });

  add({ id: 118, title: "Random Chord Length", diff: "Medium", topics: ["Geometric Probability"], answer: "4/pi",
    statement: t`Two points are chosen independently and uniformly on the circumference of the unit circle. What is the expected length of the chord between them?`,
    hints: [t`The central angle $\Theta$ is uniform on $[0, 2\pi)$ and the chord length is $2|\sin(\Theta/2)|$.`],
    solution: t`$$E = \frac{1}{2\pi}\int_0^{2\pi} 2\sin\frac{\theta}{2}\,d\theta = \frac{1}{2\pi}\cdot 8 = \frac{4}{\pi} \approx 1.273.$$` });

  add({ id: 119, title: "Ants on a Triangle", diff: "Easy", topics: ["Combinatorics"], answer: "1/4",
    statement: t`Three ants sit on the corners of a triangle. Each ant independently picks one of the two edges and walks along it at the same speed. What is the probability that no two ants collide?`,
    hints: [t`No collision means all ants walk in the same rotational direction.`],
    solution: t`All clockwise or all counterclockwise: $2/2^3 = 1/4$.` });

  add({ id: 120, title: "Normal Fourth Moment", diff: "Easy", topics: ["Normal Distribution"], answer: "3",
    statement: t`$X \sim N(0,1)$. What is $E[X^4]$?`,
    hints: [t`Use $E[X^{2k}] = (2k-1)!!$, or integrate by parts.`],
    solution: t`$E[X^4] = 3!! = 3$.` });

  add({ id: 121, title: "Mean Absolute Normal", diff: "Medium", topics: ["Normal Distribution"], answer: "sqrt(2/pi)",
    statement: t`$X \sim N(0,1)$. What is $E|X|$?`,
    hints: [t`$2\int_0^\infty x\,\phi(x)\,dx$.`],
    solution: t`$$E|X| = 2\int_0^\infty \frac{x}{\sqrt{2\pi}}e^{-x^2/2}\,dx = \frac{2}{\sqrt{2\pi}} = \sqrt{\frac{2}{\pi}} \approx 0.7979.$$` });

  add({ id: 122, title: "Max of Two Normals", diff: "Medium", topics: ["Normal Distribution", "Order Statistics"], answer: "1/sqrt(pi)",
    statement: t`$X, Y$ are independent $N(0,1)$. What is $E[\max(X,Y)]$?`,
    hints: [t`$\max(X,Y) = \frac{X + Y}{2} + \frac{|X - Y|}{2}$.`],
    solution: t`$X - Y \sim N(0, 2)$, so $E|X-Y| = \sqrt2\sqrt{2/\pi} = 2/\sqrt\pi$. Then $E[\max] = 0 + \frac12\cdot\frac{2}{\sqrt\pi} = \frac{1}{\sqrt\pi} \approx 0.5642$.` });

  add({ id: 123, title: "Max of Three Normals", diff: "Hard", topics: ["Normal Distribution", "Order Statistics"], answer: "3/(2*sqrt(pi))",
    statement: t`$X_1, X_2, X_3$ are independent $N(0,1)$. What is $E[\max X_i]$?`,
    hints: [t`$E[\max] = 3\int x\,\phi(x)\,\Phi(x)^2\,dx$. Integrate by parts using $x\phi(x) = -\phi'(x)$.`, t`$\int \phi(x)^2\,\Phi(x)\,dx = \frac{1}{2}\int\phi(x)^2\,dx$ by symmetry.`],
    solution: t`Integrate by parts: $E[\max] = 3\int \phi(x)\cdot 2\Phi(x)\phi(x)\,dx = 6\int\phi^2\Phi\,dx$. By symmetry this equals $3\int\phi^2\,dx = 3\cdot\frac{1}{2\sqrt\pi} = \frac{3}{2\sqrt{\pi}} \approx 0.8463$.` });

  add({ id: 124, title: "Shifted Normal Race", diff: "Medium", topics: ["Normal Distribution"], answer: "0.7602499",
    statement: t`$X \sim N(1, 1)$ and $Y \sim N(0,1)$ are independent. What is $P(X > Y)$? (Give $4$ decimal places.)`,
    hints: [t`$X - Y \sim N(1, 2)$.`],
    solution: t`$P(X - Y > 0) = \Phi(1/\sqrt2) \approx \Phi(0.7071) \approx 0.7602$.` });

  add({ id: 125, title: "Inside the Unit Circle", diff: "Medium", topics: ["Normal Distribution"], answer: "1-exp(-1/2)",
    statement: t`$X, Y$ are independent $N(0,1)$. What is $P(X^2 + Y^2 < 1)$?`,
    hints: [t`$X^2 + Y^2$ is exponential with mean $2$.`],
    solution: t`$R^2 = X^2 + Y^2 \sim \text{Exp}(1/2)$. So $P(R^2 < 1) = 1 - e^{-1/2} \approx 0.3935$.` });

  add({ id: 126, title: "Conditioning on the Sum", diff: "Easy", topics: ["Normal Distribution", "Conditional Expectation"], answer: "1",
    statement: t`$X, Y$ are independent $N(0,1)$. What is $E[X \mid X + Y = 2]$?`,
    hints: [t`Use symmetry.`],
    solution: t`$E[X \mid S] = E[Y \mid S]$ and their sum is $S$. So $E[X \mid S = 2] = 1$.` });

  add({ id: 127, title: "Conditional Second Moment", diff: "Medium", topics: ["Normal Distribution", "Conditional Expectation"], answer: "3/2",
    statement: t`$X, Y$ are independent $N(0,1)$. What is $E[X^2 \mid X + Y = 2]$?`,
    hints: [t`Given $S = s$, $X \sim N(s/2, 1/2)$.`],
    solution: t`$E[X^2 \mid S=2] = \operatorname{Var} + \text{mean}^2 = \tfrac12 + 1 = \tfrac32$.` });

  add({ id: 128, title: "Correlation of X and X Squared", diff: "Medium", topics: ["Covariance", "Continuous Distributions"], answer: "sqrt(15)/4",
    statement: t`$X$ is uniform on $[0,1]$ and $Y = X^2$. What is the correlation of $X$ and $Y$?`,
    hints: [t`$E[X^k] = 1/(k+1)$.`],
    solution: t`$\operatorname{Cov} = \tfrac14 - \tfrac12\cdot\tfrac13 = \tfrac1{12}$. $\operatorname{Var}X = \tfrac1{12}$. $\operatorname{Var}Y = \tfrac15 - \tfrac19 = \tfrac4{45}$.
$$\rho = \frac{1/12}{\sqrt{\tfrac{1}{12}\cdot\tfrac{4}{45}}} = \frac{\sqrt{15}}{4} \approx 0.9682.$$` });

  add({ id: 129, title: "Variance of a Dice Sum", diff: "Easy", topics: ["Variance", "Dice"], answer: "175/6",
    statement: t`You roll a fair die $10$ times. What is the variance of the sum?`,
    hints: [t`One die has variance $35/12$.`],
    solution: t`$10 \cdot \tfrac{35}{12} = \tfrac{175}{6} \approx 29.17$.` });

  add({ id: 130, title: "Exponential Ratio", diff: "Medium", topics: ["Continuous Distributions", "Exponential"], answer: "1/3",
    statement: t`$X, Y$ are independent exponential random variables with rate $1$. What is $P(X > 2Y)$?`,
    hints: [t`Condition on $Y$.`],
    solution: t`$\int_0^\infty e^{-y}e^{-2y}\,dy = 1/3$.` });

  add({ id: 131, title: "Fastest of Three Clocks", diff: "Easy", topics: ["Exponential"], answer: "1/6",
    statement: t`Three independent exponential timers have rates $1$, $2$, and $3$. What is the expected time until the first one goes off?`,
    hints: [t`The minimum of independent exponentials is exponential with the sum of the rates.`],
    solution: t`The minimum is $\text{Exp}(6)$, with mean $1/6$.` });

  add({ id: 132, title: "Slowest of Three", diff: "Medium", topics: ["Exponential", "Order Statistics"], answer: "11/6",
    statement: t`$X_1, X_2, X_3$ are independent exponential random variables with rate $1$. What is $E[\max X_i]$?`,
    hints: [t`Use memorylessness. The gaps between order statistics are exponential with rates $3$, $2$, $1$.`],
    solution: t`$\tfrac13 + \tfrac12 + 1 = \tfrac{11}{6}$.` });

  add({ id: 133, title: "Exponential Tail Mean", diff: "Easy", topics: ["Exponential", "Conditional Expectation"], answer: "2",
    statement: t`$X$ is exponential with rate $1$. What is $E[X \mid X > 1]$?`,
    hints: [t`Memorylessness.`],
    solution: t`Given $X > 1$, $X - 1$ is again $\text{Exp}(1)$. So $E = 1 + 1 = 2$.` });

  add({ id: 134, title: "Post Office", diff: "Medium", topics: ["Exponential"], answer: "1/2",
    statement: t`You enter a post office with two clerks. Both are busy, each with a customer, and you are next. All service times are independent exponentials with the same rate. What is the probability that you are the last of the three customers to leave?`,
    hints: [t`When one clerk becomes free, you start service. What does memorylessness say about the other customer?`],
    solution: t`When you start, the other customer's remaining time has the same distribution as yours. So you finish last with probability $1/2$.` });

  add({ id: 135, title: "Quiet Half Hour", diff: "Easy", topics: ["Poisson Process"], answer: "exp(-1)",
    statement: t`Customers arrive as a Poisson process with rate $2$ per hour. What is the probability that no customer arrives in a given $30$-minute window?`,
    hints: [t`The count in $30$ minutes is $\text{Poisson}(1)$.`],
    solution: t`$e^{-1} \approx 0.3679$.` });

  add({ id: 136, title: "Bus Waiting Time", diff: "Easy", topics: ["Poisson Process"], answer: "10",
    statement: t`Buses arrive at a stop as a Poisson process with an average of one bus every $10$ minutes. You arrive at a random time. What is your expected wait in minutes?`,
    hints: [t`Memorylessness.`],
    solution: t`The wait is exponential with mean $10$ minutes. It does not matter how long ago the last bus left.` });

  add({ id: 137, title: "Inspection Paradox", diff: "Medium", topics: ["Poisson Process"], answer: "20",
    statement: t`Buses arrive as a Poisson process with mean gap $10$ minutes. You arrive at a random time. What is the expected length (in minutes) of the gap between the bus before you and the bus after you?`,
    hints: [t`Look backward and forward from your arrival time.`],
    solution: t`The time since the last bus and the time until the next bus are both $\text{Exp}$ with mean $10$ (ignoring the start of the process). So the gap you land in has mean $20$. Long gaps are more likely to contain your arrival.` });

  add({ id: 138, title: "Poisson Reciprocal", diff: "Medium", topics: ["Poisson Process", "Expected Value"], answer: "1-exp(-1)",
    statement: t`$X \sim \text{Poisson}(1)$. What is $E\left[\frac{1}{X+1}\right]$?`,
    hints: [t`$\frac{1}{k+1}\cdot\frac{\lambda^k}{k!} = \frac{1}{\lambda}\cdot\frac{\lambda^{k+1}}{(k+1)!}$.`],
    solution: t`$$E\left[\tfrac{1}{X+1}\right] = \frac{e^{-\lambda}}{\lambda}\sum_{k\ge0}\frac{\lambda^{k+1}}{(k+1)!} = \frac{1 - e^{-\lambda}}{\lambda}.$$ With $\lambda = 1$: $1 - 1/e \approx 0.6321$.` });

  add({ id: 139, title: "Exit Time from an Interval", diff: "Medium", topics: ["Random Walks", "Martingales"], answer: "25",
    statement: t`A simple symmetric random walk starts at $0$. Each step is $+1$ or $-1$ with equal probability. What is the expected number of steps until the walk first reaches $+5$ or $-5$?`,
    hints: [t`$S_n^2 - n$ is a martingale.`],
    solution: t`By optional stopping, $E[\tau] = E[S_\tau^2] = 25$. In general, the exit time from $(-a, b)$ has mean $ab$.` });

  add({ id: 140, title: "Ballot Problem", diff: "Hard", topics: ["Random Walks", "Combinatorics"], answer: "1/5",
    statement: t`In an election, candidate A gets $6$ votes and candidate B gets $4$ votes. The votes are counted in a uniformly random order. What is the probability that A is strictly ahead during the whole count?`,
    hints: [t`The ballot theorem: $P = \frac{a - b}{a + b}$.`, t`Use the reflection principle on paths whose first vote is for B.`],
    solution: t`$\frac{6 - 4}{6+4} = \frac15$.` });

  add({ id: 141, title: "Opposite Corner of a Cube", diff: "Hard", topics: ["Markov Chains", "Random Walks"], answer: "10",
    statement: t`A bug walks on the vertices of a cube. Each step it moves to one of its $3$ neighbors uniformly at random. What is the expected number of steps to go from one corner to the opposite corner?`,
    hints: [t`Group the vertices by distance $3, 2, 1, 0$ from the target.`],
    solution: t`$E_3 = 1 + E_2$, $E_2 = 1 + \tfrac23E_1 + \tfrac13E_3$, $E_1 = 1 + \tfrac23E_2$. Solving gives $E_2 = 9$ and $E_3 = 10$.` });

  add({ id: 142, title: "Opposite Vertex of a Hexagon", diff: "Medium", topics: ["Markov Chains", "Random Walks"], answer: "9",
    statement: t`A frog sits on a vertex of a regular hexagon. Each step it jumps to one of the two adjacent vertices with equal probability. What is the expected number of jumps until it reaches the opposite vertex?`,
    hints: [t`Unfold the hexagon: this is a walk from $0$ that stops at $\pm3$.`],
    solution: t`The exit time from $(-3, 3)$ has mean $3 \cdot 3 = 9$.` });

  add({ id: 143, title: "Brownian Hitting Probability", diff: "Easy", topics: ["Brownian Motion", "Martingales"], answer: "1/3",
    statement: t`A standard Brownian motion starts at $0$. What is the probability that it hits $2$ before $-1$?`,
    hints: [t`$B_t$ is a martingale.`],
    solution: t`$0 = 2p - (1 - p)$, so $p = 1/3$.` });

  add({ id: 144, title: "Brownian Exit Time", diff: "Medium", topics: ["Brownian Motion", "Martingales"], answer: "2",
    statement: t`A standard Brownian motion starts at $0$. What is the expected time until it first hits $2$ or $-1$?`,
    hints: [t`$B_t^2 - t$ is a martingale.`],
    solution: t`$E[\tau] = E[B_\tau^2] = \tfrac13\cdot4 + \tfrac23\cdot1 = 2$. This matches the formula $ab = 2\cdot 1$.` });

  add({ id: 145, title: "Positive at Times 1 and 2", diff: "Hard", topics: ["Brownian Motion", "Normal Distribution"], answer: "3/8",
    statement: t`$B_t$ is a standard Brownian motion. What is $P(B_1 > 0 \text{ and } B_2 > 0)$?`,
    hints: [t`$(B_1, B_2)$ is bivariate normal with correlation $1/\sqrt2$.`, t`For a standard bivariate normal with correlation $\rho$, $P(X>0, Y>0) = \frac14 + \frac{\arcsin\rho}{2\pi}$.`],
    solution: t`$\rho = \frac{1}{\sqrt{2}}$ and $\arcsin\rho = \pi/4$. So $P = \frac14 + \frac{1}{8} = \frac38$.` });

  add({ id: 146, title: "Running Maximum", diff: "Hard", topics: ["Brownian Motion"], answer: "0.3173105",
    statement: t`$B_t$ is a standard Brownian motion. What is $P\left(\max_{0 \le t\le1} B_t > 1\right)$? (Give $4$ decimal places.)`,
    hints: [t`Reflection principle: $P(\max > a) = 2P(B_1 > a)$.`],
    solution: t`$2\left(1 - \Phi(1)\right) \approx 2 \cdot 0.15866 = 0.3173$.` });

  add({ id: 147, title: "Expected Cycles", diff: "Hard", topics: ["Permutations", "Linearity of Expectation"], answer: "137/60",
    statement: t`What is the expected number of cycles in a uniformly random permutation of $\{1,2,3,4,5\}$?`,
    hints: [t`Each element $i$ belongs to a cycle of length $L_i$. Count each cycle as $\sum_{i} 1/L_i$.`, t`$L_i$ is uniform on $\{1,\dots,n\}$.`],
    solution: t`$E[\text{cycles}] = n\,E[1/L_1] = \sum_{k=1}^n \frac1k = H_5 = \frac{137}{60} \approx 2.283$.` });

  add({ id: 148, title: "Length of My Cycle", diff: "Medium", topics: ["Permutations"], answer: "11/2",
    statement: t`A uniformly random permutation of $\{1, \dots, 10\}$ is chosen. What is the expected length of the cycle that contains element $1$?`,
    hints: [t`Follow $1 \to \pi(1) \to \dots$. At each step the cycle closes with probability $1/(\text{remaining})$.`],
    solution: t`The cycle length containing $1$ is uniform on $\{1,\dots,10\}$, so the mean is $5.5$.` });

  add({ id: 149, title: "Same Cycle", diff: "Hard", topics: ["Permutations"], answer: "1/2",
    statement: t`A uniformly random permutation of $\{1,\dots,n\}$ is chosen, with $n \ge 2$. What is the probability that $1$ and $2$ are in the same cycle?`,
    hints: [t`Condition on the length $L$ of the cycle containing $1$. It is uniform on $\{1,\dots,n\}$.`],
    solution: t`Given $L = k$, the other $k-1$ elements of the cycle are a uniform subset of the $n-1$ others. So $P(2 \text{ is in it}) = \frac{k-1}{n-1}$. Average over $k$: $\frac{1}{n}\sum_{k=1}^n\frac{k-1}{n-1} = \frac12$.` });

  add({ id: 150, title: "100 Prisoners", diff: "Hard", topics: ["Permutations", "Games & Strategy"], answer: "0.3118278207",
    statement: t`$100$ prisoners each have a number from $1$ to $100$. A room holds $100$ boxes with the numbers in a uniformly random arrangement. Each prisoner may open $50$ boxes and must find their own number. All prisoners go free only if every prisoner succeeds. They use the best strategy: open the box with your own label, then the box labeled with the number you found, and so on. What is their probability of success? (Give $4$ decimal places.)`,
    hints: [t`The strategy fails exactly when the permutation has a cycle longer than $50$.`, t`$P(\text{a cycle of length } k > n/2) = 1/k$, and at most one such cycle can exist.`],
    solution: t`$$P(\text{success}) = 1 - \sum_{k=51}^{100}\frac{1}{k} = 1 - (H_{100} - H_{50}) \approx 1 - 0.68817 = 0.31183.$$ As $n \to \infty$ this goes to $1 - \ln 2$.` });

  add({ id: 151, title: "Records", diff: "Medium", topics: ["Permutations", "Linearity of Expectation"], answer: "7381/2520",
    statement: t`$X_1,\dots,X_{10}$ are i.i.d. continuous random variables. $X_k$ is a record if it is larger than all of $X_1,\dots,X_{k-1}$ ($X_1$ is always a record). What is the expected number of records?`,
    hints: [t`$P(X_k \text{ is a record}) = 1/k$.`],
    solution: t`$H_{10} = \frac{7381}{2520} \approx 2.929$.` });

  add({ id: 152, title: "Local Maxima", diff: "Medium", topics: ["Permutations", "Linearity of Expectation"], answer: "11/3",
    statement: t`A uniformly random permutation of $1,\dots,10$ is written in a row. A position is a local maximum if its value is larger than every neighbor (end positions have only one neighbor). What is the expected number of local maxima?`,
    hints: [t`An interior position is a local maximum with probability $1/3$. An end position: $1/2$.`],
    solution: t`$2\cdot\tfrac12 + 8\cdot\tfrac13 = \tfrac{11}{3} \approx 3.667$.` });

  add({ id: 153, title: "Inversions", diff: "Easy", topics: ["Permutations", "Linearity of Expectation"], answer: "45/2",
    statement: t`What is the expected number of inversions (pairs $i<j$ with $\pi(i) > \pi(j)$) in a uniformly random permutation of $\{1,\dots,10\}$?`,
    hints: [t`Each pair is inverted with probability $1/2$.`],
    solution: t`$\binom{10}{2}/2 = 22.5$.` });

  add({ id: 154, title: "Airplane Seating", diff: "Medium", topics: ["Permutations", "Symmetry"], answer: "1/2",
    statement: t`$100$ passengers board a plane with $100$ assigned seats. The first passenger lost their boarding pass and sits in a uniformly random seat. Each later passenger sits in their own seat if it is free, and otherwise in a uniformly random free seat. What is the probability that the last passenger gets their own seat?`,
    hints: [t`The process ends when someone takes seat $1$ or seat $100$. These two seats are always treated the same way.`],
    solution: t`At each random choice, seat $1$ and seat $100$ are equally likely. The last seat left is one of these two. So the answer is $1/2$.` });

  add({ id: 155, title: "Couples at a Round Table", diff: "Medium", topics: ["Linearity of Expectation", "Permutations"], answer: "8/7",
    statement: t`Four married couples sit at random around a round table with $8$ seats. What is the expected number of couples who sit next to each other?`,
    hints: [t`Fix one spouse. The other spouse is in one of $7$ seats, and $2$ of them are adjacent.`],
    solution: t`$4\cdot\frac{2}{7} = \frac{8}{7}$.` });

  add({ id: 156, title: "Hat Rounds", diff: "Hard", topics: ["Permutations", "Martingales"], answer: "10",
    statement: t`$10$ people throw their hats in a pile and each takes a random hat. Everyone who gets their own hat leaves. The rest repeat the process with their hats. What is the expected number of rounds until everyone has left?`,
    hints: [t`Each round, the expected number of people who leave is exactly $1$.`, t`$X_k + k$ is a martingale, where $X_k$ is the number of people left after round $k$.`],
    solution: t`Each round removes $1$ person on average, so $X_k + k$ is a martingale. At the end, $X_\tau = 0$. Optional stopping gives $E[\tau] = X_0 = 10$.` });

  add({ id: 157, title: "Noodle Loops", diff: "Hard", topics: ["Expected Value", "Combinatorics"], answer: "1+1/3+1/5+1/7+1/9",
    statement: t`A bowl has $5$ noodles, so there are $10$ free ends. You repeatedly pick two free ends uniformly at random and tie them together, until no free ends remain. What is the expected number of loops?`,
    hints: [t`When there are $k$ noodles (counting joined strands as one), the first end you pick is tied to its own strand's other end with probability $\frac{1}{2k-1}$.`],
    solution: t`Each tie reduces the number of strands by one. With $k$ strands, a loop forms with probability $\frac{1}{2k-1}$. So
$$E = \sum_{k=1}^{5}\frac{1}{2k-1} = 1 + \tfrac13 + \tfrac15 + \tfrac17 + \tfrac19 = \tfrac{563}{315} \approx 1.787.$$` });

  add({ id: 158, title: "Free Throws", diff: "Hard", topics: ["Polya Urn"], answer: "1/99",
    statement: t`A player shoots $100$ free throws. She makes the first and misses the second. After that, on each shot the probability of a make equals the fraction of shots made so far. What is the probability that she makes exactly $50$ of the $100$ shots?`,
    hints: [t`This is a Polya urn that starts with one ball of each color.`, t`Prove by induction: after $n$ shots, the number of makes is uniform on $\{1,\dots,n-1\}$.`],
    solution: t`After $n$ shots, the number of makes is uniform on $\{1, \dots, n-1\}$. With $n = 100$, each of the $99$ values has probability $1/99$.` });

  add({ id: 159, title: "Polya Urn", diff: "Hard", topics: ["Polya Urn"], answer: "1/11",
    statement: t`An urn starts with $1$ red and $1$ blue ball. Each step you draw a ball at random, then put it back together with one more ball of the same color. After $10$ draws, what is the probability that exactly $5$ of the drawn balls were red?`,
    hints: [t`The number of red draws after $n$ steps is uniform on $\{0,\dots,n\}$.`],
    solution: t`Any specific sequence with $k$ reds out of $n$ has probability $\frac{k!(n-k)!}{(n+1)!}$. Multiply by $\binom nk$ to get $\frac{1}{n+1}$. So the answer is $1/11$.` });

  add({ id: 160, title: "Bacteria Extinction", diff: "Medium", topics: ["Branching Processes"], answer: "1/3",
    statement: t`A bacterium dies with probability $1/4$ or splits into two bacteria with probability $3/4$. Every bacterium does the same, independently. Starting from one bacterium, what is the probability that the population eventually dies out?`,
    hints: [t`$s = \tfrac14 + \tfrac34 s^2$. Take the smallest root in $[0,1]$.`],
    solution: t`$3s^2 - 4s + 1 = 0$ has roots $1$ and $1/3$. The extinction probability is the smaller root, $1/3$.` });

  add({ id: 161, title: "Amoeba", diff: "Hard", topics: ["Branching Processes"], answer: "sqrt(2)-1",
    statement: t`An amoeba dies, stays the same, splits into $2$, or splits into $3$, each with probability $1/4$. Each new amoeba does the same, independently. Starting from one amoeba, what is the probability that the population eventually dies out?`,
    hints: [t`$s = \frac{1 + s + s^2 + s^3}{4}$.`],
    solution: t`$s^3 + s^2 - 3s + 1 = 0$ factors as $(s - 1)(s^2 + 2s - 1) = 0$. The smallest root in $[0,1]$ is $\sqrt2 - 1 \approx 0.4142$.` });

  add({ id: 162, title: "Hitting a Large Total", diff: "Hard", topics: ["Renewal Theory", "Dice"], answer: "2/7",
    statement: t`You roll a fair die repeatedly and keep a running total. Let $p_N$ be the probability that the running total equals $N$ exactly at some point. What is $\lim_{N\to\infty} p_N$?`,
    hints: [t`On average, the running total moves $3.5$ per roll.`],
    solution: t`By the renewal theorem, the long-run density of visited totals is $1/E[\text{step}] = 1/3.5 = 2/7$.` });

  add({ id: 163, title: "Secretary Problem", diff: "Medium", topics: ["Optimal Stopping"], answer: "1/e",
    statement: t`You interview $n$ candidates in a random order and see only their relative ranks. After each interview you must accept or reject the candidate at once. You win only if you accept the single best candidate. As $n \to \infty$, what is the best possible probability of winning?`,
    hints: [t`Reject the first $rn$ candidates. Then accept the first candidate who is better than all before.`],
    solution: t`The win probability of the cutoff rule is about $-r\ln r$. It is largest at $r = 1/e$, where it equals $1/e \approx 0.3679$.` });

  add({ id: 164, title: "Kelly Fraction", diff: "Medium", topics: ["Games & Strategy", "Expected Value"], answer: "0.2",
    statement: t`You can repeatedly bet on a game that pays even money (win $1$ per $1$ bet) and that you win with probability $0.6$. You bet a fixed fraction $f$ of your wealth each round. Which $f$ maximizes the long-run growth rate $E[\log(\text{wealth})]$?`,
    hints: [t`Maximize $g(f) = 0.6\ln(1+f) + 0.4\ln(1-f)$.`],
    solution: t`$g'(f) = \frac{0.6}{1+f} - \frac{0.4}{1-f} = 0$ gives $f = 0.6 - 0.4 = 0.2$.` });

  add({ id: 165, title: "Triangles in a Random Graph", diff: "Easy", topics: ["Linearity of Expectation", "Graphs"], answer: "15",
    statement: t`A random graph on $10$ vertices includes each of the $\binom{10}{2}$ possible edges independently with probability $1/2$. What is the expected number of triangles?`,
    hints: [t`Use one indicator per set of $3$ vertices.`],
    solution: t`$\binom{10}{3}\cdot(1/2)^3 = 120/8 = 15$.` });

  add({ id: 166, title: "Boy Until Stop", diff: "Easy", topics: ["Expected Value"], answer: "1/2",
    statement: t`In a country, every family has children until they have a boy, and then stops. Each birth is a boy with probability $1/2$, independently. In the long run, what fraction of all children are boys?`,
    hints: [t`Every birth is still a fair coin flip.`],
    solution: t`Each family has exactly $1$ boy and an expected $1$ girl (a geometric count of failures). So the fraction of boys is $1/2$. The stopping rule cannot change the ratio.` });

  add({ id: 167, title: "Both Genders", diff: "Easy", topics: ["Expected Value"], answer: "3",
    statement: t`A family has children until they have at least one boy and at least one girl. Each child is a boy with probability $1/2$. What is the expected number of children?`,
    hints: [t`The first child is either sex. Then wait for the other one.`],
    solution: t`$1 + 2 = 3$.` });
})(typeof window !== "undefined" ? window : globalThis);
