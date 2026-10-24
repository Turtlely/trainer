// Problem bank, part 1: dice, coins, cards, combinatorics, conditional probability.
// Fields: id, title, diff (Easy|Medium|Hard), topics, answer (expression evaluated by Expr),
// statement / hints / solution (text; $...$ and $$...$$ are rendered with KaTeX).
(function (root) {
  const t = String.raw;
  const P = (root.PROBLEMS = root.PROBLEMS || []);
  const add = (p) => P.push(p);

  add({ id: 1, title: "Lucky Seven", diff: "Easy", topics: ["Dice"], answer: "1/6",
    statement: t`You roll two fair six-sided dice. What is the probability that the sum is $7$?`,
    hints: [t`Count the ordered pairs $(a,b)$ with $a+b=7$.`],
    solution: t`There are $36$ equally likely ordered outcomes. The pairs $(1,6),(2,5),\dots,(6,1)$ give $6$ of them, so the probability is $6/36 = 1/6$.` });

  add({ id: 2, title: "At Least One Six", diff: "Easy", topics: ["Dice", "Complementary Counting"], answer: "1-(5/6)^4",
    statement: t`You roll a fair die $4$ times. What is the probability that at least one roll is a $6$?`,
    hints: [t`Use the complement: no sixes at all.`],
    solution: t`$P(\text{no six}) = (5/6)^4 = 625/1296$. So $P(\text{at least one six}) = 1 - 625/1296 = 671/1296 \approx 0.5177$.` });

  add({ id: 3, title: "Two Children", diff: "Easy", topics: ["Conditional Probability"], answer: "1/3",
    statement: t`A family has two children. You learn that at least one of them is a boy. What is the probability that both are boys? (Assume each child is independently a boy or girl with probability $1/2$.)`,
    hints: [t`List the four equally likely outcomes BB, BG, GB, GG and remove the ones that are excluded.`],
    solution: t`Given "at least one boy", the possible outcomes are BB, BG, GB with equal probability. Only BB has two boys, so the answer is $1/3$.` });

  add({ id: 4, title: "Waiting for a Six", diff: "Easy", topics: ["Expected Value", "Dice"], answer: "6",
    statement: t`You roll a fair die until a $6$ appears. What is the expected number of rolls, including the final roll?`,
    hints: [t`The number of rolls is geometric with success probability $p = 1/6$.`, t`Or condition on the first roll: $E = 1 + \tfrac56 E$.`],
    solution: t`$E = 1 + \tfrac56 E$, so $E = 6$. In general a geometric random variable with success probability $p$ has mean $1/p$.` });

  add({ id: 5, title: "Heads-Heads", diff: "Medium", topics: ["Expected Value", "Coins", "Markov Chains"], answer: "6",
    statement: t`You flip a fair coin until you get two heads in a row. What is the expected number of flips?`,
    hints: [t`Define states by how much of the pattern you currently have: nothing, or one H.`, t`Write one equation per state and solve.`],
    solution: t`Let $E_0$ be the expected flips from scratch and $E_1$ the expected flips after one H.
$$E_0 = 1 + \tfrac12 E_1 + \tfrac12 E_0, \qquad E_1 = 1 + \tfrac12\cdot 0 + \tfrac12 E_0.$$
From the first, $E_0 = 2 + E_1$. Substituting, $E_1 = 1 + \tfrac12(2+E_1)$, so $E_1 = 4$ and $E_0 = 6$.` });

  add({ id: 6, title: "Heads Then Tails", diff: "Medium", topics: ["Expected Value", "Coins"], answer: "4",
    statement: t`You flip a fair coin until the pattern HT (a head immediately followed by a tail) appears. What is the expected number of flips?`,
    hints: [t`Once you have flipped an H, you never "lose progress": you just wait for a T.`],
    solution: t`Wait for the first H: expected $2$ flips. After that, each later T completes the pattern and each H keeps you in the same state, so you wait an expected $2$ more flips. Total $= 4$. Compare with HH (expected $6$), where a T resets progress.` });

  add({ id: 7, title: "Maximum of Two Dice", diff: "Medium", topics: ["Expected Value", "Dice", "Order Statistics"], answer: "161/36",
    statement: t`You roll two fair dice. What is the expected value of the larger of the two numbers?`,
    hints: [t`$P(\max \le k) = (k/6)^2$.`, t`Use $E[M] = \sum_{k=1}^{6} P(M \ge k)$.`],
    solution: t`$P(M = k) = \frac{k^2 - (k-1)^2}{36} = \frac{2k-1}{36}$. So
$$E[M] = \sum_{k=1}^6 k\,\frac{2k-1}{36} = \frac{1+6+15+28+45+66}{36} = \frac{161}{36} \approx 4.472.$$` });

  add({ id: 8, title: "Birthday Threshold", diff: "Easy", topics: ["Combinatorics", "Complementary Counting"], answer: "23",
    statement: t`Birthdays are uniform over $365$ days (ignore leap years). What is the smallest number of people needed so that the probability that two of them share a birthday is greater than $1/2$?`,
    hints: [t`$P(\text{all distinct}) = \prod_{i=0}^{n-1} \frac{365-i}{365}$.`],
    solution: t`For $n=22$ the probability that all birthdays differ is about $0.524$; for $n = 23$ it is about $0.493$. So $23$ people are enough for the probability of a shared birthday to exceed $1/2$.` });

  add({ id: 9, title: "Monty Hall", diff: "Easy", topics: ["Conditional Probability", "Games & Strategy"], answer: "2/3",
    statement: t`There are $3$ doors. A car is behind one door and goats are behind the other two. You pick a door. The host, who knows where the car is, opens a different door that shows a goat, and offers you a switch. What is your probability of winning the car if you always switch?`,
    hints: [t`Switching wins exactly when your first pick was a goat.`],
    solution: t`Your first pick is a goat with probability $2/3$. In that case the host must open the other goat door, and switching gives the car. So switching wins with probability $2/3$.` });

  add({ id: 10, title: "Rare Disease Test", diff: "Medium", topics: ["Bayes"], answer: "1/6",
    statement: t`A disease affects $1\%$ of the population. A test gives a positive result for $99\%$ of sick people and for $5\%$ of healthy people. A random person tests positive. What is the probability that this person has the disease?`,
    hints: [t`Compare $P(\text{sick and } +)$ with $P(\text{healthy and } +)$.`],
    solution: t`$P(\text{sick}, +) = 0.01 \cdot 0.99 = 0.0099$ and $P(\text{healthy}, +) = 0.99 \cdot 0.05 = 0.0495$.
$$P(\text{sick} \mid +) = \frac{0.0099}{0.0099 + 0.0495} = \frac{0.0099}{0.0594} = \frac16.$$` });

  add({ id: 11, title: "Two Positive Tests", diff: "Medium", topics: ["Bayes"], answer: "0.01*0.99^2/(0.01*0.99^2+0.99*0.05^2)",
    statement: t`Use the same test as before: prevalence $1\%$, sensitivity $99\%$, false-positive rate $5\%$. A random person takes the test twice and gets two positive results. The two results are independent given the true disease status. What is the probability that the person has the disease?`,
    hints: [t`Square the likelihoods: $0.99^2$ and $0.05^2$.`],
    solution: t`$$P = \frac{0.01 \cdot 0.99^2}{0.01 \cdot 0.99^2 + 0.99 \cdot 0.05^2} = \frac{0.009801}{0.009801 + 0.002475} \approx 0.7984.$$` });

  add({ id: 12, title: "Fair Gambler's Ruin", diff: "Medium", topics: ["Random Walks", "Martingales"], answer: "3/10",
    statement: t`You have $3$ dollars. You bet $1$ dollar on fair coin flips until you have $10$ dollars or $0$ dollars. What is the probability that you reach $10$?`,
    hints: [t`Your wealth is a martingale. Use optional stopping.`],
    solution: t`Your wealth $W_n$ is a martingale and stops at $0$ or $10$. So $3 = E[W_\tau] = 10\,p$, which gives $p = 3/10$.` });

  add({ id: 13, title: "Biased Gambler's Ruin", diff: "Hard", topics: ["Random Walks", "Martingales"], answer: "(1-(2/3)^2)/(1-(2/3)^5)",
    statement: t`You start with $2$ dollars and bet $1$ dollar per round. You win each round with probability $0.6$ and lose with probability $0.4$. You stop when you reach $5$ dollars or $0$ dollars. What is the probability that you reach $5$?`,
    hints: [t`$(q/p)^{W_n}$ is a martingale, with $q/p = 2/3$.`],
    solution: t`Let $r = q/p = 2/3$. Then $r^{W_n}$ is a martingale, so
$$P(\text{reach } 5) = \frac{1 - r^2}{1 - r^5} = \frac{5/9}{211/243} = \frac{135}{211} \approx 0.6398.$$` });

  add({ id: 14, title: "Collect All Faces", diff: "Medium", topics: ["Expected Value", "Linearity of Expectation", "Dice"], answer: "6*(1+1/2+1/3+1/4+1/5+1/6)",
    statement: t`You roll a fair die until every face $1$ through $6$ has appeared at least once. What is the expected number of rolls?`,
    hints: [t`Split the process into stages. In stage $k$ you already have $k$ distinct faces.`, t`Stage $k$ is geometric with success probability $(6-k)/6$.`],
    solution: t`$$E = \sum_{k=0}^{5} \frac{6}{6-k} = 6\left(1 + \tfrac12 + \tfrac13 + \tfrac14 + \tfrac15 + \tfrac16\right) = 6 \cdot \frac{49}{20} = 14.7.$$` });

  add({ id: 15, title: "Hat Check Fixed Points", diff: "Easy", topics: ["Permutations", "Linearity of Expectation"], answer: "1",
    statement: t`Ten people put their hats in a pile. Each person then takes a hat uniformly at random (a uniformly random permutation). What is the expected number of people who get their own hat back?`,
    hints: [t`Use indicator variables.`],
    solution: t`Person $i$ gets their own hat with probability $1/10$. By linearity, the expected count is $10 \cdot \tfrac{1}{10} = 1$. The answer is $1$ for any number of people.` });

  add({ id: 16, title: "Derangement of Four", diff: "Medium", topics: ["Permutations", "Inclusion-Exclusion"], answer: "3/8",
    statement: t`Four letters are put into four addressed envelopes uniformly at random. What is the probability that no letter is in its correct envelope?`,
    hints: [t`Use inclusion-exclusion: $D_n = n!\sum_{k=0}^n \frac{(-1)^k}{k!}$.`],
    solution: t`$D_4 = 24\left(1 - 1 + \tfrac12 - \tfrac16 + \tfrac1{24}\right) = 9$. So the probability is $9/24 = 3/8$.` });

  add({ id: 17, title: "Fixed Point Variance", diff: "Medium", topics: ["Permutations", "Linearity of Expectation"], answer: "1",
    statement: t`Let $X$ be the number of fixed points of a uniformly random permutation of $\{1,\dots,20\}$. What is $\operatorname{Var}(X)$?`,
    hints: [t`Write $X = \sum I_i$. Find $E[I_iI_j]$ for $i \ne j$.`],
    solution: t`$E[X] = 1$. $E[X^2] = \sum_i E[I_i] + \sum_{i\ne j} E[I_iI_j] = 1 + n(n-1)\cdot\frac{1}{n(n-1)} = 2$. So $\operatorname{Var}(X) = 2 - 1 = 1$.` });

  add({ id: 18, title: "Top Two Aces", diff: "Easy", topics: ["Cards"], answer: "1/221",
    statement: t`A standard $52$-card deck is shuffled. What is the probability that the top two cards are both aces?`,
    hints: [t`Multiply the conditional probabilities.`],
    solution: t`$\frac{4}{52}\cdot\frac{3}{51} = \frac{12}{2652} = \frac{1}{221}$.` });

  add({ id: 19, title: "Full House", diff: "Medium", topics: ["Cards", "Combinatorics"], answer: "3744/2598960",
    statement: t`You are dealt $5$ cards from a standard $52$-card deck. What is the probability of a full house (three cards of one rank and two cards of another rank)?`,
    hints: [t`Choose the rank of the triple, its suits, the rank of the pair, and its suits.`],
    solution: t`$13 \cdot \binom43 \cdot 12 \cdot \binom42 = 13\cdot4\cdot12\cdot6 = 3744$. Divide by $\binom{52}{5} = 2{,}598{,}960$ to get $\approx 0.001441$.` });

  add({ id: 20, title: "Two Pair", diff: "Medium", topics: ["Cards", "Combinatorics"], answer: "123552/2598960",
    statement: t`You are dealt $5$ cards from a standard deck. What is the probability of exactly two pair (two cards of one rank, two of another rank, and a fifth card of a third rank)?`,
    hints: [t`Choose the two pair ranks together: $\binom{13}{2}$. Do not order them.`],
    solution: t`$\binom{13}{2}\binom42^2 \cdot 44 = 78 \cdot 36 \cdot 44 = 123{,}552$. Divide by $2{,}598{,}960$ to get $\approx 0.04754$.` });

  add({ id: 21, title: "Any Straight", diff: "Medium", topics: ["Cards", "Combinatorics"], answer: "10*4^5/2598960",
    statement: t`You are dealt $5$ cards. What is the probability that the ranks form a straight (five consecutive ranks; the ace can be high or low; straight flushes count)?`,
    hints: [t`There are $10$ possible rank sequences, from A-2-3-4-5 up to 10-J-Q-K-A.`],
    solution: t`$10$ rank sequences and $4^5$ suit choices: $10 \cdot 1024 = 10{,}240$. Probability $= 10240/2598960 \approx 0.003940$.` });

  add({ id: 22, title: "At Least One Ace", diff: "Easy", topics: ["Cards", "Complementary Counting"], answer: "1-C(48,5)/C(52,5)",
    statement: t`You are dealt $5$ cards from a standard deck. What is the probability that your hand has at least one ace?`,
    hints: [t`Count hands with no aces.`],
    solution: t`$1 - \binom{48}{5}/\binom{52}{5} = 1 - 1712304/2598960 \approx 0.3412$.` });

  add({ id: 23, title: "First Ace Position", diff: "Medium", topics: ["Cards", "Linearity of Expectation"], answer: "53/5",
    statement: t`A standard deck is shuffled. You turn cards over one at a time until you see the first ace. What is the expected position of the first ace?`,
    hints: [t`The $4$ aces split the $48$ other cards into $5$ gaps. By symmetry, each gap has the same expected size.`],
    solution: t`Each non-ace card is before all $4$ aces with probability $1/5$. So the expected number of non-aces before the first ace is $48/5$, and the expected position is $48/5 + 1 = 53/5 = 10.6$.` });

  add({ id: 24, title: "After the First Ace", diff: "Hard", topics: ["Cards", "Permutations"], answer: "1/52",
    statement: t`A standard deck is shuffled. You turn over cards until the first ace appears. What is the probability that the next card is the ace of spades? (If the first ace is itself the ace of spades, the event fails.)`,
    hints: [t`Remove the ace of spades from the deck, then put it back in a random spot. When does it land just after the first ace?`],
    solution: t`Shuffle the other $51$ cards and insert the ace of spades in one of $52$ equally likely positions. The event happens exactly when it goes directly after the first ace of the other $51$ cards. That is $1$ position out of $52$, so the probability is $1/52$. The same argument gives $1/52$ for any specific card, such as the king of hearts.` });

  add({ id: 25, title: "Adjacent Aces", diff: "Medium", topics: ["Cards", "Permutations"], answer: "1/26",
    statement: t`A standard deck is shuffled. What is the probability that the ace of spades and the ace of hearts are next to each other?`,
    hints: [t`There are $51$ adjacent position pairs. Each unordered pair of positions is equally likely.`],
    solution: t`The two cards occupy a uniformly random pair of the $\binom{52}{2}$ position pairs. $51$ of those pairs are adjacent. So the probability is $51/\binom{52}{2} = 2/52 = 1/26$.` });

  add({ id: 26, title: "Red-Red Neighbors", diff: "Medium", topics: ["Cards", "Linearity of Expectation"], answer: "51*(26/52)*(25/51)",
    statement: t`A standard deck is shuffled. What is the expected number of positions $i$ ($1 \le i \le 51$) such that cards $i$ and $i+1$ are both red?`,
    hints: [t`Use one indicator variable per adjacent pair.`],
    solution: t`Each adjacent pair is red-red with probability $\frac{26}{52}\cdot\frac{25}{51}$. Multiply by $51$ pairs: $\frac{26\cdot25}{52} = 12.5$.` });

  add({ id: 27, title: "First Red Card", diff: "Medium", topics: ["Cards", "Linearity of Expectation"], answer: "53/27",
    statement: t`A standard deck has $26$ red and $26$ black cards. After a shuffle, what is the expected position of the first red card?`,
    hints: [t`The red cards split the black cards into $27$ gaps.`],
    solution: t`Each black card is before all red cards with probability $1/27$. The expected number of black cards before the first red is $26/27$. So the expected position is $1 + 26/27 = 53/27 \approx 1.963$.` });

  add({ id: 28, title: "One Ace Each", diff: "Hard", topics: ["Cards", "Combinatorics"], answer: "(39*26*13)/(51*50*49)",
    statement: t`A standard deck is dealt into four bridge hands of $13$ cards each. What is the probability that each player gets exactly one ace?`,
    hints: [t`Place the aces one at a time into the $52$ card slots.`],
    solution: t`Put the first ace anywhere. The second ace must go to one of the $39$ slots in other hands, out of $51$. The third: $26$ of $50$. The fourth: $13$ of $49$.
$$P = \frac{39\cdot26\cdot13}{51\cdot50\cdot49} \approx 0.1055.$$` });

  add({ id: 29, title: "Stop Before a Red", diff: "Medium", topics: ["Cards", "Optimal Stopping", "Martingales"], answer: "1/2",
    statement: t`A dealer turns over a shuffled deck of $26$ red and $26$ black cards one at a time. At any moment, before the next card is turned, you may say "stop". You win if the next card is red. You must stop before the deck runs out. With optimal play, what is your probability of winning?`,
    hints: [t`Look at the fraction of red cards left in the deck. How does it change on average?`],
    solution: t`The fraction of red cards remaining is a martingale. Whenever you stop, your win probability equals that fraction. By optional stopping, its expectation is still $1/2$. No strategy beats $1/2$, and every strategy gets $1/2$.` });

  add({ id: 30, title: "Lottery: Three Matches", diff: "Medium", topics: ["Combinatorics"], answer: "C(6,3)*C(43,3)/C(49,6)",
    statement: t`A lottery draws $6$ numbers from $\{1,\dots,49\}$. You pick $6$ numbers. What is the probability that exactly $3$ of your numbers are drawn?`,
    hints: [t`This is hypergeometric.`],
    solution: t`$$\frac{\binom63\binom{43}{3}}{\binom{49}{6}} = \frac{20 \cdot 12341}{13983816} \approx 0.01765.$$` });

  add({ id: 31, title: "Divisible by 3, 5, or 7", diff: "Easy", topics: ["Inclusion-Exclusion"], answer: "543/1000",
    statement: t`An integer is chosen uniformly from $\{1, 2, \dots, 1000\}$. What is the probability that it is divisible by $3$, $5$, or $7$?`,
    hints: [t`Use inclusion-exclusion with floor counts.`],
    solution: t`$333 + 200 + 142 - 66 - 47 - 28 + 9 = 543$. So the probability is $0.543$.` });

  add({ id: 32, title: "Coprime Integers", diff: "Medium", topics: ["Number Theory"], answer: "6/pi^2",
    statement: t`Two integers are chosen independently and uniformly from $\{1,\dots,N\}$. As $N \to \infty$, what is the probability that they are coprime?`,
    hints: [t`For each prime $p$, both numbers are divisible by $p$ with probability $1/p^2$.`, t`Use the Euler product for $\zeta(2)$.`],
    solution: t`$$\prod_p \left(1 - \frac{1}{p^2}\right) = \frac{1}{\zeta(2)} = \frac{6}{\pi^2} \approx 0.6079.$$` });

  add({ id: 33, title: "Committee with Women", diff: "Easy", topics: ["Combinatorics"], answer: "31/42",
    statement: t`A committee of $5$ is chosen uniformly at random from $6$ men and $4$ women. What is the probability that the committee has at least $2$ women?`,
    hints: [t`Subtract the cases with $0$ or $1$ women.`],
    solution: t`$\binom{10}{5} = 252$. Zero women: $\binom65 = 6$. One woman: $\binom64\binom41 = 60$. So $P = 1 - 66/252 = 186/252 = 31/42$.` });

  add({ id: 34, title: "Prime Sum", diff: "Easy", topics: ["Dice"], answer: "5/12",
    statement: t`You roll two fair dice. What is the probability that the sum is a prime number?`,
    hints: [t`The possible prime sums are $2, 3, 5, 7, 11$.`],
    solution: t`Counts: $2\!:\!1$, $3\!:\!2$, $5\!:\!4$, $7\!:\!6$, $11\!:\!2$. Total $15$, so $15/36 = 5/12$.` });

  add({ id: 35, title: "Dice Then Coins", diff: "Easy", topics: ["Expected Value", "Conditional Expectation"], answer: "7/4",
    statement: t`You roll a fair die. Then you flip a fair coin as many times as the number on the die. What is the expected number of heads?`,
    hints: [t`Use the tower property: $E[H] = E[E[H \mid D]]$.`],
    solution: t`$E[H \mid D] = D/2$. So $E[H] = E[D]/2 = 3.5/2 = 1.75$.` });

  add({ id: 36, title: "Sum Until Six", diff: "Medium", topics: ["Expected Value", "Dice"], answer: "21",
    statement: t`You roll a fair die until a $6$ appears. What is the expected sum of all rolls, including the final $6$?`,
    hints: [t`The rolls before the $6$ are uniform on $\{1,\dots,5\}$.`, t`Use Wald's identity.`],
    solution: t`The number of rolls $N$ has mean $6$, so there are $5$ non-six rolls on average. Each one is uniform on $\{1,\dots,5\}$ with mean $3$. Expected sum $= 5 \cdot 3 + 6 = 21$. (Wald gives the same: $E[N]\cdot 3.5 = 21$.)` });

  add({ id: 37, title: "All Evens Until Six", diff: "Hard", topics: ["Conditional Expectation", "Dice"], answer: "3/2",
    statement: t`You roll a fair die until the first $6$. Given that every roll was even (that is, you saw only $2$, $4$, and $6$), what is the expected number of rolls?`,
    hints: [t`The intuitive answer of $3$ is wrong. The condition strongly favors short sequences.`, t`Compute $P(N = n, \text{all even}) = (1/3)^{n-1}\cdot (1/6)$.`],
    solution: t`$P(N=n, \text{all even}) = (2/6)^{n-1}(1/6)$. This is proportional to $(1/3)^{n-1}$, so given the condition, $N$ is geometric with success probability $2/3$. So $E = 3/2$. Another view: roll until the first odd or $6$. The process stops at each roll with probability $4/6$, and the stopping time does not depend on which of these values ends it.` });

  add({ id: 38, title: "One Reroll", diff: "Medium", topics: ["Optimal Stopping", "Dice", "Games & Strategy"], answer: "17/4",
    statement: t`You roll a fair die and win the face value in dollars. After seeing the first roll, you may reroll once, and then you must take the second result. With optimal play, what is your expected winnings?`,
    hints: [t`Reroll exactly when the first roll is below $3.5$.`],
    solution: t`Keep $4$, $5$, $6$; reroll $1$, $2$, $3$.
$$E = \tfrac{4+5+6}{6} + \tfrac36\cdot3.5 = 2.5 + 1.75 = 4.25.$$` });

  add({ id: 39, title: "Two Rerolls", diff: "Medium", topics: ["Optimal Stopping", "Dice", "Games & Strategy"], answer: "14/3",
    statement: t`Same game as before, but you may roll up to three times. After each of the first two rolls you may stop and take that value. With optimal play, what is the expected payoff?`,
    hints: [t`Work backward. With two rolls left, the value is $4.25$.`],
    solution: t`With two rolls left the value is $4.25$. On the first roll, keep $5$ or $6$ and reroll otherwise:
$$E = \tfrac{5+6}{6} + \tfrac46\cdot 4.25 = \tfrac{11}{6} + \tfrac{17}{6} = \tfrac{14}{3} \approx 4.667.$$` });

  add({ id: 40, title: "Pay to Reroll", diff: "Hard", topics: ["Optimal Stopping", "Dice", "Games & Strategy"], answer: "4",
    statement: t`You roll a fair die. You may take the face value in dollars, or pay $1$ dollar to roll again. You can reroll as many times as you like. With optimal play, what is the expected net payoff of the game?`,
    hints: [t`The optimal strategy is a threshold: stop when the face is at least $t$.`, t`For threshold $t$, the value $V$ satisfies $V = \frac{1}{6}\sum_{k\ge t} k + \frac{t-1}{6}(V - 1)$.`],
    solution: t`For threshold $t$: $V\cdot\frac{7-t}{6} = \frac{1}{6}\sum_{k=t}^{6} k - \frac{t-1}{6}$.
$t=5$: $V = 3.5$. $t=4$: $V = (15 - 3)/3 = 4$. $t=3$: $V = (18-2)/4 = 4$. $t = 6$: $V = 1$.
The best value is $4$ (thresholds $3$ and $4$ tie). Check: with $V=4$ you should stop on $4$ or more and reroll on $1$ or $2$, because a reroll is worth $V - 1 = 3$.` });

  add({ id: 41, title: "Square of a Die", diff: "Easy", topics: ["Expected Value", "Dice"], answer: "91/6",
    statement: t`You roll a fair die and receive the square of the result in dollars. What is the expected payoff?`,
    hints: [t`$\sum_{k=1}^{6} k^2 = 91$.`],
    solution: t`$E[X^2] = 91/6 \approx 15.17$. Note that this is larger than $E[X]^2 = 12.25$.` });

  add({ id: 42, title: "Product of Two Dice", diff: "Easy", topics: ["Expected Value", "Dice"], answer: "49/4",
    statement: t`You roll two fair dice. What is the expected product of the two numbers?`,
    hints: [t`The dice are independent.`],
    solution: t`$E[XY] = E[X]E[Y] = 3.5^2 = 12.25$.` });

  add({ id: 43, title: "Strictly Increasing", diff: "Easy", topics: ["Dice", "Combinatorics"], answer: "5/54",
    statement: t`You roll a fair die three times. What is the probability that the results are strictly increasing?`,
    hints: [t`Every set of $3$ distinct values can be arranged in increasing order in exactly one way.`],
    solution: t`$\binom63 = 20$ increasing sequences out of $216$. $20/216 = 5/54$.` });

  add({ id: 44, title: "Three Dice Sum to Ten", diff: "Medium", topics: ["Dice", "Combinatorics"], answer: "1/8",
    statement: t`You roll three fair dice. What is the probability that the sum is $10$?`,
    hints: [t`Count solutions of $a+b+c = 10$ with $1 \le a,b,c \le 6$, using stars and bars with inclusion-exclusion.`],
    solution: t`Set $a' = a - 1$ etc. Then $a'+b'+c' = 7$ with each value at most $5$. Without the bound there are $\binom92 = 36$ solutions. Remove those with some variable $\ge 6$: $3\binom{3}{2} = 9$. So $27$ outcomes, and $27/216 = 1/8$.` });

  add({ id: 45, title: "Four Different Faces", diff: "Easy", topics: ["Dice", "Combinatorics"], answer: "5/18",
    statement: t`You roll four fair dice. What is the probability that all four show different numbers?`,
    hints: [t`Count ordered outcomes: $6\cdot5\cdot4\cdot3$.`],
    solution: t`$360/1296 = 5/18$.` });

  add({ id: 46, title: "Yahtzee", diff: "Easy", topics: ["Dice"], answer: "1/1296",
    statement: t`You roll five fair dice once. What is the probability that all five show the same number?`,
    hints: [t`The first die can be anything.`],
    solution: t`$(1/6)^4 = 1/1296$.` });

  add({ id: 47, title: "At Least One Six, Both Six", diff: "Easy", topics: ["Conditional Probability", "Dice"], answer: "1/11",
    statement: t`You roll two fair dice. Given that at least one die shows a $6$, what is the probability that both show $6$?`,
    hints: [t`How many outcomes have at least one $6$?`],
    solution: t`$11$ outcomes have at least one six. Only $(6,6)$ has two sixes. Answer $1/11$.` });

  add({ id: 48, title: "Big Sum, Doubles", diff: "Easy", topics: ["Conditional Probability", "Dice"], answer: "1/3",
    statement: t`You roll two fair dice. Given that the sum is at least $10$, what is the probability that you rolled doubles?`,
    hints: [t`List the outcomes with sum $10$, $11$, or $12$.`],
    solution: t`Sum $10$: $(4,6),(5,5),(6,4)$. Sum $11$: $(5,6),(6,5)$. Sum $12$: $(6,6)$. That is $6$ outcomes. Two of them are doubles, so the answer is $1/3$.` });

  add({ id: 49, title: "Max of Three Dice", diff: "Medium", topics: ["Expected Value", "Order Statistics", "Dice"], answer: "119/24",
    statement: t`You roll three fair dice. What is the expected value of the largest result?`,
    hints: [t`$E[M] = \sum_{k=1}^{6} P(M \ge k) = \sum_{k=1}^6 \left(1 - \left(\frac{k-1}{6}\right)^3\right)$.`],
    solution: t`$$E[M] = 6 - \frac{0 + 1 + 8 + 27 + 64 + 125}{216} = 6 - \frac{225}{216} = \frac{119}{24} \approx 4.958.$$` });

  add({ id: 50, title: "Distinct Faces in Six Rolls", diff: "Medium", topics: ["Linearity of Expectation", "Dice"], answer: "6*(1-(5/6)^6)",
    statement: t`You roll a fair die $6$ times. What is the expected number of distinct faces that appear?`,
    hints: [t`Use one indicator per face: "face $k$ appears at least once".`],
    solution: t`Each face appears with probability $1 - (5/6)^6$. So $E = 6\left(1 - (5/6)^6\right) \approx 3.991$.` });

  add({ id: 51, title: "Empty Boxes", diff: "Medium", topics: ["Linearity of Expectation"], answer: "10*0.9^10",
    statement: t`You throw $10$ balls independently and uniformly into $10$ boxes. What is the expected number of empty boxes?`,
    hints: [t`A given box is empty with probability $(9/10)^{10}$.`],
    solution: t`$10 \cdot 0.9^{10} \approx 3.487$. For large $n$, the expected fraction of empty boxes goes to $1/e$.` });

  add({ id: 52, title: "Shared Birthday Pairs", diff: "Easy", topics: ["Linearity of Expectation"], answer: "435/365",
    statement: t`There are $30$ people in a room. Birthdays are uniform over $365$ days. What is the expected number of unordered pairs of people who share a birthday?`,
    hints: [t`Use one indicator per pair.`],
    solution: t`$\binom{30}{2}\cdot\frac{1}{365} = \frac{435}{365} \approx 1.192$.` });

  add({ id: 53, title: "Elevator Stops", diff: "Medium", topics: ["Linearity of Expectation"], answer: "10*(1-0.9^5)",
    statement: t`Five people enter an elevator on the ground floor. Each person independently picks one of $10$ upper floors uniformly. What is the expected number of floors where the elevator stops?`,
    hints: [t`A floor gets a stop unless all five people skip it.`],
    solution: t`$10\left(1 - 0.9^5\right) = 10(1 - 0.59049) = 4.0951$.` });

  add({ id: 54, title: "Exactly Five Heads", diff: "Easy", topics: ["Coins", "Combinatorics"], answer: "63/256",
    statement: t`You flip a fair coin $10$ times. What is the probability of exactly $5$ heads?`,
    hints: [t`$\binom{10}{5} = 252$.`],
    solution: t`$252/1024 = 63/256 \approx 0.2461$.` });

  add({ id: 55, title: "One More Coin", diff: "Medium", topics: ["Coins", "Symmetry"], answer: "1/2",
    statement: t`Alice flips $11$ fair coins and Bob flips $10$ fair coins. What is the probability that Alice gets strictly more heads than Bob?`,
    hints: [t`Compare Bob's $10$ with Alice's first $10$, then look at Alice's last coin.`, t`Alice has more heads exactly when she has more heads than Bob or more tails than Bob, but never both.`],
    solution: t`Alice has $11$ coins and Bob has $10$, so exactly one of these is true: Alice has more heads, or Alice has more tails. By symmetry between heads and tails, the two events have the same probability. So each is $1/2$.` });

  add({ id: 56, title: "Three Flips, Given One Head", diff: "Easy", topics: ["Conditional Probability", "Coins"], answer: "3/7",
    statement: t`You flip three fair coins. Given that at least one is heads, what is the probability of exactly two heads?`,
    hints: [t`$P(\text{at least one H}) = 7/8$.`],
    solution: t`$\dfrac{3/8}{7/8} = \dfrac37$.` });

  add({ id: 57, title: "First Head on an Even Flip", diff: "Easy", topics: ["Coins", "Geometric Series"], answer: "1/3",
    statement: t`You flip a fair coin until the first head. What is the probability that the first head comes on an even-numbered flip?`,
    hints: [t`Let $p$ be the answer. Condition on the first flip, or sum a geometric series.`],
    solution: t`$\sum_{k\ge1} (1/2)^{2k} = \frac{1/4}{1 - 1/4} = 1/3$.` });

  add({ id: 58, title: "See Both Sides", diff: "Easy", topics: ["Expected Value", "Coins"], answer: "3",
    statement: t`You flip a fair coin until you have seen at least one head and at least one tail. What is the expected number of flips?`,
    hints: [t`The first flip is either side. Then wait for the other side.`],
    solution: t`$1 + 2 = 3$.` });

  add({ id: 59, title: "Two Heads Total", diff: "Easy", topics: ["Expected Value", "Coins"], answer: "4",
    statement: t`You flip a fair coin until you have seen two heads in total (not necessarily consecutive). What is the expected number of flips?`,
    hints: [t`Add two geometric waiting times.`],
    solution: t`Each head takes $2$ flips on average, so $2 + 2 = 4$.` });

  add({ id: 60, title: "Three in a Row", diff: "Medium", topics: ["Expected Value", "Coins", "Markov Chains"], answer: "14",
    statement: t`You flip a fair coin until you get three heads in a row. What is the expected number of flips?`,
    hints: [t`Use states $0$, $1$, $2$ for the current run of heads.`, t`In general, $k$ heads in a row takes $2^{k+1} - 2$ flips on average.`],
    solution: t`$E_0 = 1 + \tfrac12E_1 + \tfrac12E_0$, $E_1 = 1 + \tfrac12E_2 + \tfrac12E_0$, $E_2 = 1 + \tfrac12E_0$. Solving gives $E_0 = 14$.` });

  add({ id: 61, title: "HTH", diff: "Medium", topics: ["Expected Value", "Coins", "Martingales"], answer: "10",
    statement: t`You flip a fair coin until the pattern HTH appears. What is the expected number of flips?`,
    hints: [t`Use the gambler (ABRACADABRA) argument: add $2^k$ for each $k$ where the length-$k$ prefix equals the length-$k$ suffix.`],
    solution: t`The pattern HTH matches itself at length $3$ (the full pattern) and length $1$ (H). So $E = 2^3 + 2^1 = 10$.` });

  add({ id: 62, title: "HTHT", diff: "Medium", topics: ["Expected Value", "Coins", "Martingales"], answer: "20",
    statement: t`You flip a fair coin until the pattern HTHT appears. What is the expected number of flips?`,
    hints: [t`Find every $k$ such that the first $k$ letters equal the last $k$ letters.`],
    solution: t`The overlaps are at lengths $4$ (HTHT) and $2$ (HT). So $E = 2^4 + 2^2 = 20$.` });

  add({ id: 63, title: "Same Side Three Times", diff: "Medium", topics: ["Expected Value", "Coins"], answer: "7",
    statement: t`You flip a fair coin until three consecutive flips show the same side (HHH or TTT). What is the expected number of flips?`,
    hints: [t`After the first flip, each new flip either extends the run or starts a new run of length $1$.`],
    solution: t`Let $E_r$ be the expected remaining flips with a current run of length $r$. $E_2 = 1 + \tfrac12E_1$ and $E_1 = 1 + \tfrac12E_2 + \tfrac12E_1$. So $E_1 = 2 + E_2 = 3 + \tfrac12 E_1$, which gives $E_1 = 6$. The total is $1 + E_1 = 7$.` });

  add({ id: 64, title: "HH Before TH", diff: "Medium", topics: ["Coins", "Penney's Game"], answer: "1/4",
    statement: t`You flip a fair coin repeatedly. What is the probability that HH appears before TH?`,
    hints: [t`Once a T has appeared, can HH ever come first?`],
    solution: t`If any T appears before HH, then the first HH must be preceded by a T, so TH appears first. Thus HH wins only if the first two flips are HH. Probability $1/4$.` });

  add({ id: 65, title: "HHT vs HTT", diff: "Hard", topics: ["Coins", "Penney's Game", "Markov Chains"], answer: "2/3",
    statement: t`You flip a fair coin repeatedly. What is the probability that HHT appears before HTT?`,
    hints: [t`Both patterns start with H. Track the states H, HH, HT.`],
    solution: t`Let $a = P(\text{win} \mid H)$, $b = P(\text{win} \mid HH)$, $c = P(\text{win} \mid HT)$. Then $b = 1$ (from HH, the next T wins and an H keeps you in HH). $a = \tfrac12 b + \tfrac12 c$. $c = \tfrac12 a + \tfrac12\cdot 0$. So $a = \tfrac12 + \tfrac14 a$, and $a = 2/3$. You need an H to start either pattern, so the answer is $2/3$.` });

  add({ id: 66, title: "THH vs HHH", diff: "Medium", topics: ["Coins", "Penney's Game"], answer: "7/8",
    statement: t`You flip a fair coin repeatedly. What is the probability that THH appears before HHH?`,
    hints: [t`When can HHH come first?`],
    solution: t`If any T appears before HHH is complete, then the first HHH is preceded by THH. So HHH wins only if the first three flips are HHH. THH wins with probability $1 - 1/8 = 7/8$.` });

  add({ id: 67, title: "No Two Heads in a Row", diff: "Medium", topics: ["Coins", "Combinatorics", "Recursion"], answer: "144/1024",
    statement: t`You flip a fair coin $10$ times. What is the probability that no two consecutive flips are both heads?`,
    hints: [t`The number of valid length-$n$ strings follows the Fibonacci recursion $a_n = a_{n-1} + a_{n-2}$.`],
    solution: t`$a_1 = 2$, $a_2 = 3$, $a_3 = 5, \dots$, $a_{10} = 144$. Probability $144/1024 = 9/64 \approx 0.1406$.` });

  add({ id: 68, title: "Expected Runs", diff: "Medium", topics: ["Linearity of Expectation", "Coins"], answer: "11/2",
    statement: t`You flip a fair coin $10$ times. A run is a maximal block of equal consecutive flips (for example, HHTHH has $3$ runs). What is the expected number of runs?`,
    hints: [t`Count the places where the flip changes from the previous flip.`],
    solution: t`Runs $= 1 + (\text{number of changes})$. Each of the $9$ adjacent pairs is a change with probability $1/2$. $E = 1 + 4.5 = 5.5$.` });

  add({ id: 69, title: "Overlapping HH Count", diff: "Easy", topics: ["Linearity of Expectation", "Coins"], answer: "9/4",
    statement: t`You flip a fair coin $10$ times. What is the expected number of indices $i$ such that flips $i$ and $i+1$ are both heads?`,
    hints: [t`Use one indicator per adjacent pair.`],
    solution: t`$9 \cdot \tfrac14 = 2.25$.` });

  add({ id: 70, title: "First to Roll a Six", diff: "Easy", topics: ["Games & Strategy", "Geometric Series"], answer: "6/11",
    statement: t`Alice and Bob take turns rolling a fair die, and Alice goes first. The first person to roll a $6$ wins. What is the probability that Alice wins?`,
    hints: [t`Let $p$ be Alice's win probability. If both miss once, the game restarts.`],
    solution: t`$p = \tfrac16 + \tfrac{25}{36}p$, so $p = \tfrac{6}{11}$.` });

  add({ id: 71, title: "Duel", diff: "Easy", topics: ["Games & Strategy", "Geometric Series"], answer: "1/2",
    statement: t`Two duelists take turns shooting. A goes first and hits with probability $1/3$. B hits with probability $1/2$. The first hit wins. What is the probability that A wins?`,
    hints: [t`A round where both miss has probability $\tfrac23\cdot\tfrac12$.`],
    solution: t`$p = \tfrac13 + \tfrac23\cdot\tfrac12\,p$, so $\tfrac23 p = \tfrac13$ and $p = \tfrac12$.` });

  add({ id: 72, title: "Win from Deuce", diff: "Medium", topics: ["Games & Strategy", "Markov Chains"], answer: "9/13",
    statement: t`In tennis, from deuce a player must win two points in a row (net) to win the game. You win each point independently with probability $0.6$. What is the probability that you win the game from deuce?`,
    hints: [t`After two points, you have won, lost, or returned to deuce.`],
    solution: t`$p = 0.36 + 2(0.6)(0.4)\,p$, so $p = \frac{0.36}{1 - 0.48} = \frac{0.36}{0.52} = \frac{9}{13} \approx 0.6923$.` });

  add({ id: 73, title: "Seven-Game Series", diff: "Medium", topics: ["Combinatorics", "Games & Strategy"], answer: "5/16",
    statement: t`Two evenly matched teams play a best-of-seven series. Each game is a fair coin flip. What is the probability that the series goes to all $7$ games?`,
    hints: [t`The series goes to $7$ games exactly when the first $6$ games are split $3$-$3$.`],
    solution: t`$\binom63/2^6 = 20/64 = 5/16$.` });

  add({ id: 74, title: "Expected Series Length", diff: "Medium", topics: ["Expected Value", "Games & Strategy"], answer: "93/16",
    statement: t`In the same best-of-seven series between evenly matched teams, what is the expected number of games played?`,
    hints: [t`$P(\text{ends in game } k) = 2\binom{k-1}{3}/2^k$.`],
    solution: t`$P(4) = 1/8$, $P(5) = 1/4$, $P(6) = 5/16$, $P(7) = 5/16$.
$$E = 4\cdot\tfrac18 + 5\cdot\tfrac14 + 6\cdot\tfrac{5}{16} + 7\cdot\tfrac5{16} = \tfrac{93}{16} = 5.8125.$$` });

  add({ id: 75, title: "Craps", diff: "Medium", topics: ["Dice", "Games & Strategy", "Conditional Probability"], answer: "244/495",
    statement: t`In craps, you roll two dice. You win at once on $7$ or $11$ and lose at once on $2$, $3$, or $12$. Any other sum becomes your "point". You then roll until you get the point again (win) or a $7$ (lose). What is your probability of winning?`,
    hints: [t`For point $s$, $P(\text{point before } 7) = \frac{p_s}{p_s + 6/36}$.`],
    solution: t`Immediate win: $8/36$. For points $4,10$: $\frac{3}{36}\cdot\frac{3}{9}$ each. For $5,9$: $\frac{4}{36}\cdot\frac{4}{10}$ each. For $6,8$: $\frac{5}{36}\cdot\frac{5}{11}$ each. The total is $\frac{244}{495} \approx 0.4929$.` });

  add({ id: 76, title: "Twelve Before Two Sevens", diff: "Hard", topics: ["Dice", "Markov Chains"], answer: "7/13",
    statement: t`You roll a pair of dice repeatedly. What is the probability that a sum of $12$ appears before two consecutive rolls with sum $7$?`,
    hints: [t`Use two states: "last roll was not a $7$" and "last roll was a $7$".`],
    solution: t`Let $p$ be the win probability from the start state and $q$ the win probability right after a $7$.
$p = \tfrac1{36} + \tfrac16 q + \tfrac{29}{36}p$ and $q = \tfrac1{36} + \tfrac{29}{36}p$.
Substitute: $\tfrac{7}{36}p = \tfrac1{36} + \tfrac1{216} + \tfrac{29}{216}p$. Multiply by $216$: $42p = 7 + 29p$, so $p = 7/13$.` });

  add({ id: 77, title: "Two Sevens", diff: "Easy", topics: ["Expected Value", "Dice"], answer: "12",
    statement: t`You roll a pair of dice repeatedly. What is the expected number of rolls until a sum of $7$ has appeared twice (not necessarily in a row)?`,
    hints: [t`Each $7$ takes a geometric number of rolls with mean $6$.`],
    solution: t`$6 + 6 = 12$.` });

  add({ id: 78, title: "Same Face Twice in a Row", diff: "Medium", topics: ["Expected Value", "Dice"], answer: "7",
    statement: t`You roll a fair die until two consecutive rolls show the same number. What is the expected number of rolls?`,
    hints: [t`After the first roll, each new roll matches the previous roll with probability $1/6$.`],
    solution: t`$1 + 6 = 7$.` });

  add({ id: 79, title: "Both Five and Six", diff: "Medium", topics: ["Expected Value", "Dice"], answer: "9",
    statement: t`You roll a fair die until both a $5$ and a $6$ have appeared. What is the expected number of rolls?`,
    hints: [t`First wait for either one, then wait for the other.`],
    solution: t`The first of $\{5,6\}$ takes $6/2 = 3$ rolls on average. The other one then takes $6$ more. Total $9$.` });

  add({ id: 80, title: "Sixes Before a One", diff: "Medium", topics: ["Expected Value", "Dice"], answer: "1",
    statement: t`You roll a fair die until the first $1$. What is the expected number of $6$s you see before the first $1$?`,
    hints: [t`Ignore the rolls that are neither $1$ nor $6$.`],
    solution: t`Among rolls that are $1$ or $6$, each is equally likely. The number of $6$s before the first $1$ is geometric (counting failures) with $p = 1/2$, which has mean $1$.` });

  add({ id: 81, title: "123456 in a Row", diff: "Medium", topics: ["Expected Value", "Dice", "Martingales"], answer: "6^6",
    statement: t`You roll a fair die until the sequence $1,2,3,4,5,6$ appears as six consecutive rolls. What is the expected number of rolls?`,
    hints: [t`The pattern has no self-overlap.`],
    solution: t`By the overlap formula, $E = 6^6 = 46656$ because the only prefix that is also a suffix is the full pattern.` });

  add({ id: 82, title: "ABRACADABRA", diff: "Hard", topics: ["Martingales", "Expected Value"], answer: "26^11+26^4+26",
    statement: t`A monkey types capital letters uniformly at random from the $26$-letter alphabet. What is the expected number of keystrokes until the word ABRACADABRA first appears?`,
    hints: [t`Imagine a new gambler who joins at each keystroke and bets everything on the next letter of the word at fair odds.`, t`The total payout when the word is completed comes from every gambler whose bets are still alive.`],
    solution: t`At completion, the gambler who started ABRACADABRA holds $26^{11}$, the one on the final ABRA holds $26^4$, and the one on the final A holds $26$. The net winnings form a martingale, so
$$E[\tau] = 26^{11} + 26^4 + 26.$$` });

  add({ id: 83, title: "Coin from a Bag", diff: "Medium", topics: ["Bayes", "Coins"], answer: "4/5",
    statement: t`A bag holds $3$ coins. One coin has heads on both sides and the other two are fair. You pick a coin at random and flip it $3$ times. You get $3$ heads. What is the probability that you picked the double-headed coin?`,
    hints: [t`Likelihoods: $1$ for the double-headed coin and $1/8$ for a fair coin.`],
    solution: t`$$\frac{\tfrac13\cdot 1}{\tfrac13 \cdot 1 + \tfrac23\cdot\tfrac18} = \frac{1/3}{5/12} = \frac45.$$` });

  add({ id: 84, title: "Unknown Bias", diff: "Medium", topics: ["Bayes", "Continuous Distributions"], answer: "4/5",
    statement: t`A coin has an unknown heads probability $p$, with $p$ uniform on $[0,1]$. You flip it $3$ times and get $3$ heads. What is the probability that the next flip is heads?`,
    hints: [t`The posterior is $\text{Beta}(4,1)$.`, t`Laplace's rule of succession: $(h+1)/(n+2)$.`],
    solution: t`$$P = \frac{\int_0^1 p^4\,dp}{\int_0^1 p^3\,dp} = \frac{1/5}{1/4} = \frac45.$$` });

  add({ id: 85, title: "Bertrand's Box", diff: "Easy", topics: ["Conditional Probability"], answer: "2/3",
    statement: t`There are three cards. One is red on both sides, one is blue on both sides, and one is red on one side and blue on the other. You draw a random card and look at a random side. It is red. What is the probability that the other side is also red?`,
    hints: [t`Count red faces, not cards.`],
    solution: t`There are $3$ red faces, all equally likely. $2$ of them belong to the red-red card. So the answer is $2/3$.` });

  add({ id: 86, title: "Boy Born on Tuesday", diff: "Hard", topics: ["Conditional Probability"], answer: "13/27",
    statement: t`A family has two children. You learn that at least one of them is a boy born on a Tuesday. What is the probability that both children are boys? (Sex and weekday are uniform and independent.)`,
    hints: [t`Each child has $14$ equally likely sex-day types. Count ordered pairs.`],
    solution: t`Pairs with at least one Tuesday boy: $14^2 - 13^2 = 27$. Of these, pairs where both are boys: $7^2 - 6^2 = 13$. So the answer is $13/27$.` });

  add({ id: 87, title: "Taxi Witness", diff: "Medium", topics: ["Bayes"], answer: "12/29",
    statement: t`In a city, $85\%$ of taxis are green and $15\%$ are blue. A witness says that a taxi in an accident was blue. Tests show the witness identifies the color correctly $80\%$ of the time. What is the probability that the taxi was blue?`,
    hints: [t`$P(\text{says blue}) = 0.15\cdot0.8 + 0.85\cdot0.2$.`],
    solution: t`$$\frac{0.15\cdot0.8}{0.15\cdot 0.8 + 0.85\cdot0.2} = \frac{0.12}{0.29} = \frac{12}{29} \approx 0.414.$$` });

  add({ id: 88, title: "Is It Raining?", diff: "Medium", topics: ["Bayes"], answer: "8/11",
    statement: t`You call three friends in a city and ask if it is raining. Each friend tells the truth with probability $2/3$ and lies with probability $1/3$, independently. All three say "yes". Before the calls, you believed it was raining with probability $1/4$. What is the probability that it is raining?`,
    hints: [t`Likelihood of "yes, yes, yes": $(2/3)^3$ if raining, $(1/3)^3$ if not.`],
    solution: t`$$\frac{\tfrac14\cdot\tfrac{8}{27}}{\tfrac14\cdot\tfrac8{27} + \tfrac34\cdot\tfrac1{27}} = \frac{8}{8+3} = \frac{8}{11}.$$` });

  add({ id: 89, title: "Rain in Half an Hour", diff: "Easy", topics: ["Independence"], answer: "0.6",
    statement: t`The probability that it rains at least once in a one-hour period is $0.84$. Assume that the two half-hours are independent and identical. What is the probability of rain in a given half-hour?`,
    hints: [t`$(1 - p)^2 = 0.16$.`],
    solution: t`$1 - p = \sqrt{0.16} = 0.4$, so $p = 0.6$.` });

  add({ id: 90, title: "Russian Roulette", diff: "Medium", topics: ["Conditional Probability", "Games & Strategy"], answer: "3/4",
    statement: t`A revolver has $6$ chambers. Two adjacent chambers hold bullets. The cylinder is spun, the gun is fired at you, and it clicks (the chamber was empty). The cylinder then advances one chamber. You can fire again without spinning, or spin first. If you do not spin, what is the probability that you survive the next shot?`,
    hints: [t`Which empty chambers are followed by another empty chamber?`],
    solution: t`Let the bullets be in chambers $1$ and $2$. The empty chambers are $3,4,5,6$, followed by $4,5,6,1$. Only one of these four (chamber $1$) has a bullet. So you survive with probability $3/4$, which is better than $4/6$ if you spin.` });
})(typeof window !== "undefined" ? window : globalThis);
