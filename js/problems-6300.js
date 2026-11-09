// Problem bank for 6.3000 Signal Processing (Fall 2026), Quiz 2 scope (L1-L13).
// Written practice modeled on the 6.3000 homework, recitations, and past quizzes.
// Conventions: a_k = (1/T)∫ f e^{-jkω0t} dt; X[k] = (1/N) Σ x[n] e^{-j2πkn/N}.
// Every numeric answer is recomputed by scripts/check_6300.py.
(function (root) {
  const t = String.raw;
  const P = [];
  const add = (p) => P.push(Object.assign({ course: "6.3000" }, p));

  // ---------- L1: CT Fourier series, trig form
  add({ id: 3001, lec: 1, title: "DC Term of a Pulse Train", diff: "Easy", topics: ["Fourier Series"], answer: "1/4",
    statement: t`A periodic signal with period $T=4$ is $f(t)=1$ for $0<t<1$ and $f(t)=0$ for $1<t<4$. In the trig form $f(t)=c_0+\sum_{k\ge1}c_k\cos(k\omega_0t)+d_k\sin(k\omega_0t)$, what is $c_0$?`,
    hints: [t`$c_0=\frac1T\int_T f(t)\,dt$ is the average value.`],
    solution: t`$c_0=\frac14\int_0^1 1\,dt=\frac14$.` });
  add({ id: 3002, lec: 1, title: "Square Wave Harmonic", diff: "Medium", topics: ["Fourier Series", "Square Wave"], answer: "4/(3*pi)",
    statement: t`A square wave with period $2\pi$ is $f(t)=1$ for $0<t<\pi$ and $f(t)=-1$ for $\pi<t<2\pi$. Its trig-form series is $f(t)=\sum_k d_k\sin(kt)$. Find $d_3$.`,
    hints: [t`$d_k=\frac2T\int_T f(t)\sin(k\omega_0t)\,dt$.`, t`Only odd $k$ survive, and $d_k=\frac{4}{\pi k}$.`],
    solution: t`$d_k=\frac{2}{2\pi}\left[\int_0^\pi\sin(kt)dt-\int_\pi^{2\pi}\sin(kt)dt\right]=\frac{2(1-\cos k\pi)}{\pi k}$, which is $\frac{4}{\pi k}$ for odd $k$. So $d_3=\frac{4}{3\pi}\approx0.424$.` });
  add({ id: 3003, lec: 1, title: "Fundamental Period of a Sum", diff: "Easy", topics: ["Periodicity"], answer: "4*pi/3",
    statement: t`What is the fundamental period of $f(t)=\cos(3t)+\sin(4.5t)$?`,
    hints: [t`The fundamental frequency is the largest $\omega_0$ such that $3$ and $4.5$ are both integer multiples of it.`],
    solution: t`$3=2\cdot1.5$ and $4.5=3\cdot1.5$, so $\omega_0=1.5$ rad/s and $T=\frac{2\pi}{1.5}=\frac{4\pi}{3}$.` });
  add({ id: 3004, lec: 1, title: "Trig Identity as a Series", diff: "Easy", topics: ["Fourier Series", "Trig Identities"], answer: "-1/2",
    statement: t`Write $f(t)=\sin^2(t)$ as a trig-form Fourier series $c_0+\sum_k c_k\cos(kt)+d_k\sin(kt)$. What is $c_2$?`,
    hints: [t`$\sin^2\theta=\frac{1-\cos2\theta}{2}$.`],
    solution: t`$\sin^2 t=\frac12-\frac12\cos(2t)$, so $c_0=\frac12$ and $c_2=-\frac12$.` });
  add({ id: 3005, lec: 1, title: "Average of a Rectified Cosine", diff: "Easy", topics: ["Fourier Series"], answer: "2/pi",
    statement: t`What is the DC term $c_0$ of $f(t)=|\cos t|$?`,
    hints: [t`The period is $\pi$. Average $\cos t$ over $-\pi/2<t<\pi/2$.`],
    solution: t`$c_0=\frac1\pi\int_{-\pi/2}^{\pi/2}\cos t\,dt=\frac{2}{\pi}\approx0.637$.` });

  // ---------- L2: sinusoids and the complex form
  add({ id: 3011, lec: 2, title: "Combining Sinusoids", diff: "Easy", topics: ["Sinusoids", "Complex Numbers"], answer: "5",
    statement: t`Write $3\cos(2t)+4\sin(2t)$ as $A\cos(2t-\phi)$ with $A>0$. What is $A$?`,
    hints: [t`$A\cos(2t-\phi)=A\cos\phi\cos2t+A\sin\phi\sin2t$.`],
    solution: t`$A\cos\phi=3$, $A\sin\phi=4$, so $A=\sqrt{9+16}=5$.` });
  add({ id: 3012, lec: 2, title: "Phase of a Combination", diff: "Easy", topics: ["Sinusoids", "Complex Numbers"], answer: "atan(4/3)",
    statement: t`For $3\cos(2t)+4\sin(2t)=A\cos(2t-\phi)$ with $A>0$, what is $\phi$ (radians, in $(-\pi,\pi]$)?`,
    hints: [t`$\tan\phi=4/3$ with $\cos\phi>0$.`],
    solution: t`Phasors: $3\cos(2t)+4\sin(2t)=\operatorname{Re}\{(3-4j)e^{j2t}\}$ and $A\cos(2t-\phi)=\operatorname{Re}\{Ae^{-j\phi}e^{j2t}\}$. So $Ae^{-j\phi}=3-4j=5e^{-j\arctan(4/3)}$ and $\phi=\arctan(4/3)\approx0.9273$ rad.` });
  add({ id: 3013, lec: 2, title: "Powers of 1+j", diff: "Easy", topics: ["Complex Numbers"], answer: "16",
    statement: t`$(1+j)^8$ is a real number. What is it?`,
    hints: [t`$1+j=\sqrt2e^{j\pi/4}$.`],
    solution: t`$(1+j)^8=(\sqrt2)^8e^{j2\pi}=16$.` });
  add({ id: 3014, lec: 2, title: "Three-Phase Sum", diff: "Medium", topics: ["Sinusoids", "Complex Numbers"], answer: "0",
    statement: t`What is the amplitude of $\cos(t)+\cos(t+2\pi/3)+\cos(t+4\pi/3)$?`,
    hints: [t`Add the phasors $1+e^{j2\pi/3}+e^{j4\pi/3}$.`],
    solution: t`The three phasors are equally spaced on the unit circle and add to $0$, so the sum is $0$ for all $t$.` });
  add({ id: 3015, lec: 2, title: "Complex Coefficient of a Shifted Cosine", diff: "Easy", topics: ["Fourier Series", "Complex Form"], answer: "sqrt(2)/4",
    statement: t`$f(t)=\cos(3t+\pi/4)$ is written as $\sum_k a_ke^{jkt}$. What is $\operatorname{Re}\,a_3$?`,
    hints: [t`$\cos\theta=\frac{e^{j\theta}+e^{-j\theta}}2$.`],
    solution: t`$a_3=\frac12e^{j\pi/4}$, so $\operatorname{Re}a_3=\frac12\cos\frac\pi4=\frac{\sqrt2}{4}$.` });

  // ---------- L3: Fourier series (complex form and properties)
  add({ id: 3021, lec: 3, title: "Pulse Train Coefficient", diff: "Medium", topics: ["Fourier Series", "Pulse Train"], answer: "sqrt(2)/(2*pi)",
    statement: t`A periodic signal with period $T$ is $f(t)=1$ for $|t|<T/8$ and $0$ for the rest of each period. Find $a_1$ (it is real).`,
    hints: [t`$a_k=\frac1T\int_{-T/8}^{T/8}e^{-jk\omega_0t}dt=\frac{\sin(\pi k/4)}{\pi k}$.`],
    solution: t`$a_1=\frac{\sin(\pi/4)}{\pi}=\frac{\sqrt2}{2\pi}\approx0.225$.` });
  add({ id: 3022, lec: 3, title: "Half-Period Shift", diff: "Medium", topics: ["Fourier Series", "Time Shift"], answer: "-1/pi",
    statement: t`$f(t)$ has period $T$ and coefficients $a_k=\frac{\sin(\pi k/2)}{\pi k}$ (a centered square wave of duty $\frac12$). Let $g(t)=f(t-T/2)$. What is $b_1$, the coefficient of $g$?`,
    hints: [t`A shift by $t_0$ multiplies $a_k$ by $e^{-jk\omega_0t_0}$.`],
    solution: t`$b_k=a_ke^{-jk\pi}=(-1)^ka_k$, so $b_1=-a_1=-\frac1\pi$.` });
  add({ id: 3023, lec: 3, title: "Parseval and a Famous Sum", diff: "Hard", topics: ["Fourier Series", "Parseval"], answer: "pi^2/8",
    statement: t`The $\pm1$ square wave has $a_k=\frac{2}{j\pi k}$ for odd $k$ and 0 otherwise. Use Parseval's relation $\frac1T\int_T|f|^2dt=\sum_k|a_k|^2$ to find $\sum_{k\text{ odd}, k>0}\frac1{k^2}$.`,
    hints: [t`The power of a $\pm1$ signal is 1. Count both $\pm k$.`],
    solution: t`$1=\sum_{k\text{ odd}}\frac{4}{\pi^2k^2}=2\cdot\frac4{\pi^2}\sum_{k>0\text{ odd}}\frac1{k^2}$, so the sum is $\frac{\pi^2}{8}\approx1.234$.` });
  add({ id: 3024, lec: 3, title: "Derivative Property", diff: "Medium", topics: ["Fourier Series", "Derivative"], answer: "1",
    statement: t`$f(t)$ has $\omega_0=2$ and $a_k=\frac{1}{1+k^2}$. Let $g(t)=\frac{d}{dt}f(t)$ with coefficients $b_k$. What is $\operatorname{Im}\,b_1$?`,
    hints: [t`$\frac{d}{dt}\leftrightarrow jk\omega_0$.`],
    solution: t`$b_k=jk\omega_0a_k$, so $b_1=j\cdot2\cdot\frac12=j$ and $\operatorname{Im}b_1=1$.` });
  add({ id: 3025, lec: 3, title: "Triangle Wave Decay", diff: "Medium", topics: ["Fourier Series", "Convergence"], answer: "1/9",
    statement: t`For a triangle wave, $a_k\propto\frac1{k^2}$ for odd $k$ (and 0 for even $k\neq0$). What is $a_3/a_1$?`,
    hints: [t`The triangle is the integral of a square wave, whose coefficients fall like $1/k$.`],
    solution: t`$\frac{1/9}{1/1}=\frac19$. Smoother signals have coefficients that decay faster: jumps give $1/k$, corners give $1/k^2$.` });
  add({ id: 3026, lec: 3, title: "Real Signal Symmetry", diff: "Easy", topics: ["Fourier Series", "Symmetry"], answer: "-2",
    statement: t`A real-valued periodic signal has $a_3=1+2j$. What is $\operatorname{Im}\,a_{-3}$?`,
    hints: [t`Real signals have $a_{-k}=a_k^*$.`],
    solution: t`$a_{-3}=a_3^*=1-2j$, so $\operatorname{Im}a_{-3}=-2$.` });

  // ---------- L4: sampling and aliasing
  add({ id: 3031, lec: 4, title: "Aliased Tone", diff: "Easy", topics: ["Sampling", "Aliasing"], answer: "300",
    statement: t`$\cos(2\pi\cdot700t)$ is sampled at $f_s=1000$ Hz and reconstructed ideally (keeping $|\Omega|\le\pi$). What frequency, in Hz, comes out?`,
    hints: [t`Frequencies $f$ and $f_s-f$ give the same samples of a cosine.`],
    solution: t`$700$ Hz is above $f_s/2=500$ Hz, so it aliases to $1000-700=300$ Hz.` });
  add({ id: 3032, lec: 4, title: "Nyquist Rate", diff: "Easy", topics: ["Sampling"], answer: "500",
    statement: t`What is the minimum sampling rate (Hz) that avoids aliasing for $x(t)=\cos(2\pi\cdot100t)+\sin(2\pi\cdot250t)$?`,
    hints: [t`Twice the highest frequency.`],
    solution: t`$2\cdot250=500$ Hz (strictly, any rate above 500 Hz).` });
  add({ id: 3033, lec: 4, title: "DT Frequency of a Sampled Tone", diff: "Easy", topics: ["Sampling", "Frequency"], answer: "pi/4",
    statement: t`A 1 kHz cosine is sampled at 8 kHz. What is the DT frequency $\Omega$ of the samples, in rad/sample?`,
    hints: [t`$\Omega=\omega/f_s=2\pi f/f_s$.`],
    solution: t`$\Omega=2\pi\cdot\frac{1000}{8000}=\frac\pi4$.` });
  add({ id: 3034, lec: 4, title: "Sampling Below Nyquist", diff: "Medium", topics: ["Sampling", "Aliasing"], answer: "1",
    statement: t`$x(t)=\cos(2\pi\cdot3t)$ is sampled at $f_s=4$ Hz. The samples are reconstructed ideally. What frequency (Hz) comes out?`,
    hints: [t`$x[n]=\cos(3\pi n/2)=\cos(\pi n/2)$.`],
    solution: t`$\Omega=2\pi\cdot3/4=3\pi/2\equiv-\pi/2$, so $|\Omega|=\pi/2$, which is $f=\frac{\pi/2}{2\pi}\cdot4=1$ Hz.` });
  add({ id: 3035, lec: 4, title: "DT Period", diff: "Easy", topics: ["Periodicity", "DT Signals"], answer: "16",
    statement: t`What is the fundamental period $N_0$ of $x[n]=\cos(3\pi n/8)$?`,
    hints: [t`$\frac{3\pi}{8}=2\pi\cdot\frac{3}{16}$.`],
    solution: t`$\Omega=2\pi\cdot\frac3{16}$ with $\gcd(3,16)=1$, so $N_0=16$.` });

  // ---------- L5: DT Fourier series
  add({ id: 3041, lec: 5, title: "DTFS of a Raised Cosine", diff: "Easy", topics: ["DT Fourier Series"], answer: "1/2",
    statement: t`$x[n]=1+\cos(\pi n/2)$ is periodic with $N=4$. With $a_k=\frac1N\sum_{n}x[n]e^{-j2\pi kn/N}$, what is $a_1$?`,
    hints: [t`$\cos(\pi n/2)=\frac12e^{j2\pi n/4}+\frac12e^{-j2\pi n/4}$.`],
    solution: t`$a_0=1$, $a_1=a_{-1}=a_3=\frac12$, $a_2=0$.` });
  add({ id: 3042, lec: 5, title: "Periodic Impulse Train", diff: "Easy", topics: ["DT Fourier Series"], answer: "1/8",
    statement: t`$x[n]=\sum_m\delta[n-8m]$ (period $N=8$). What is $a_5$?`,
    hints: [t`Only $n=0$ contributes in one period.`],
    solution: t`$a_k=\frac18\cdot1=\frac18$ for every $k$.` });
  add({ id: 3043, lec: 5, title: "Alternating Signal", diff: "Easy", topics: ["DT Fourier Series"], answer: "1",
    statement: t`$x[n]=(-1)^n$, taken with period $N=6$. What is $a_3$?`,
    hints: [t`$(-1)^n=e^{j\pi n}=e^{j2\pi\cdot3n/6}$.`],
    solution: t`$x[n]=e^{j2\pi(3)n/6}$, so $a_3=1$ and all other $a_k=0$.` });
  add({ id: 3044, lec: 5, title: "Short Pulse Coefficient", diff: "Medium", topics: ["DT Fourier Series"], answer: "sqrt(2)/4",
    statement: t`One period ($N=4$) of $x[n]$ is $1,1,0,0$ for $n=0,1,2,3$. What is $|a_1|$?`,
    hints: [t`$a_1=\frac14(1+e^{-j\pi/2})$.`],
    solution: t`$a_1=\frac{1-j}{4}$, so $|a_1|=\frac{\sqrt2}{4}\approx0.354$.` });
  add({ id: 3045, lec: 5, title: "DT Parseval", diff: "Medium", topics: ["DT Fourier Series", "Parseval"], answer: "5/4",
    statement: t`One period ($N=4$) of $x[n]$ is $1,2,0,0$. What is $\sum_{k=0}^{3}|a_k|^2$?`,
    hints: [t`$\sum_k|a_k|^2=\frac1N\sum_n|x[n]|^2$.`],
    solution: t`$\frac14(1+4)=\frac54$.` });

  // ---------- L6: CT Fourier transform
  add({ id: 3051, lec: 6, title: "Exponential Decay Spectrum", diff: "Easy", topics: ["Fourier Transform"], answer: "1/(2*sqrt(2))",
    statement: t`$x(t)=e^{-2t}u(t)$. What is $|X(2)|$?`,
    hints: [t`$X(\omega)=\frac{1}{2+j\omega}$.`],
    solution: t`$|X(2)|=\frac{1}{|2+2j|}=\frac{1}{2\sqrt2}\approx0.354$.` });
  add({ id: 3052, lec: 6, title: "Pulse Spectrum Value", diff: "Easy", topics: ["Fourier Transform", "Pulse"], answer: "4/pi",
    statement: t`$x(t)=1$ for $|t|<1$ and 0 otherwise. What is $X(\pi/2)$?`,
    hints: [t`$X(\omega)=\frac{2\sin\omega}{\omega}$.`],
    solution: t`$X(\pi/2)=\frac{2\cdot1}{\pi/2}=\frac4\pi$.` });
  add({ id: 3053, lec: 6, title: "Area from the Spectrum", diff: "Easy", topics: ["Fourier Transform"], answer: "4",
    statement: t`$x(t)$ is a triangle with base from $t=-2$ to $t=2$ and height 2 at $t=0$. What is $X(0)$?`,
    hints: [t`$X(0)=\int x(t)\,dt$.`],
    solution: t`The area is $\frac12\cdot4\cdot2=4$.` });
  add({ id: 3054, lec: 6, title: "Ideal Low-Pass Impulse Response", diff: "Medium", topics: ["Fourier Transform", "Inverse Transform"], answer: "1",
    statement: t`$X(\omega)=1$ for $|\omega|<\pi$ and 0 otherwise. What is $x(0)$?`,
    hints: [t`$x(0)=\frac1{2\pi}\int X(\omega)d\omega$.`],
    solution: t`$x(0)=\frac{1}{2\pi}\cdot2\pi=1$ (and $x(t)=\frac{\sin\pi t}{\pi t}$).` });
  add({ id: 3055, lec: 6, title: "Energy by Parseval", diff: "Medium", topics: ["Fourier Transform", "Parseval"], answer: "1/2",
    statement: t`What is $\frac{1}{2\pi}\int_{-\infty}^{\infty}|X(\omega)|^2d\omega$ for $x(t)=e^{-t}u(t)$?`,
    hints: [t`Parseval: it equals $\int|x(t)|^2dt$.`],
    solution: t`$\int_0^\infty e^{-2t}dt=\frac12$.` });
  add({ id: 3056, lec: 6, title: "Time Scaling", diff: "Medium", topics: ["Fourier Transform", "Scaling"], answer: "1/3",
    statement: t`$f(t)$ has $F(1)=1$. Let $g(t)=f(3t)$. What is $G(3)$?`,
    hints: [t`$f(at)\leftrightarrow\frac1{|a|}F(\omega/a)$.`],
    solution: t`$G(3)=\frac13F(1)=\frac13$.` });

  // ---------- L7: DT Fourier transform
  add({ id: 3061, lec: 7, title: "Geometric Sequence at DC", diff: "Easy", topics: ["DTFT"], answer: "2",
    statement: t`$x[n]=(1/2)^nu[n]$. What is $X(0)$?`,
    hints: [t`$X(\Omega)=\frac{1}{1-\frac12e^{-j\Omega}}$.`],
    solution: t`$X(0)=\frac{1}{1-\frac12}=2$ (the sum of all samples).` });
  add({ id: 3062, lec: 7, title: "Geometric Sequence at Pi", diff: "Easy", topics: ["DTFT"], answer: "2/3",
    statement: t`$x[n]=(1/2)^nu[n]$. What is $X(\pi)$?`,
    hints: [t`$e^{-j\pi}=-1$.`],
    solution: t`$X(\pi)=\frac{1}{1+\frac12}=\frac23$.` });
  add({ id: 3063, lec: 7, title: "Two-Point Average", diff: "Easy", topics: ["DTFT"], answer: "sqrt(2)",
    statement: t`$x[n]=\delta[n]+\delta[n-1]$. What is $|X(\pi/2)|$?`,
    hints: [t`$X(\Omega)=1+e^{-j\Omega}$.`],
    solution: t`$|1-j|=\sqrt2$.` });
  add({ id: 3064, lec: 7, title: "Reading Samples from a DTFT", diff: "Easy", topics: ["DTFT", "Inverse"], answer: "1/2",
    statement: t`A signal has DTFT $X(\Omega)=\cos(2\Omega)$. What is $x[2]$?`,
    hints: [t`$\cos2\Omega=\frac12e^{j2\Omega}+\frac12e^{-j2\Omega}$.`],
    solution: t`$x[n]=\frac12\delta[n+2]+\frac12\delta[n-2]$, so $x[2]=\frac12$.` });
  add({ id: 3065, lec: 7, title: "Ideal DT Low-Pass", diff: "Medium", topics: ["DTFT", "Filters"], answer: "1/4",
    statement: t`An ideal DT low-pass filter passes $|\Omega|<\pi/4$ (gain 1) and blocks the rest of $(-\pi,\pi]$. What is $h[0]$?`,
    hints: [t`$h[0]=\frac1{2\pi}\int_{-\pi}^{\pi}H(\Omega)d\Omega$.`],
    solution: t`$h[0]=\frac{1}{2\pi}\cdot\frac{2\pi}{4}=\frac14$; in general $h[n]=\frac{\sin(\pi n/4)}{\pi n}$.` });
  add({ id: 3066, lec: 7, title: "Sample at Zero", diff: "Easy", topics: ["DTFT", "Inverse"], answer: "1",
    statement: t`$X(\Omega)=1+2\cos\Omega$. What is $x[0]$?`,
    hints: [t`Write the cosine with exponentials.`],
    solution: t`$X=1+e^{j\Omega}+e^{-j\Omega}$, so $x[-1]=x[0]=x[1]=1$.` });

  // ---------- L8: systems
  add({ id: 3071, lec: 8, title: "Counting LTI Systems", diff: "Medium", topics: ["Systems", "Linearity", "Time Invariance"], answer: "2",
    statement: t`How many of these systems are linear and time-invariant?

1. $y[n]=x[n-1]+2x[n]$
2. $y[n]=n\,x[n]$
3. $y[n]=x[n]^2$
4. $y[n]=\sum_{k=-\infty}^{n}x[k]$
5. $y[n]=x[2n]$`,
    hints: [t`Check each: an explicit $n$ or a changed argument usually breaks time invariance.`],
    solution: t`1 and 4 are LTI. 2 is time-varying, 3 is nonlinear, 5 (downsampling) is time-varying. Answer: $2$.` });
  add({ id: 3072, lec: 8, title: "An Affine System", diff: "Easy", topics: ["Systems", "Linearity"], answer: "1",
    statement: t`$y[n]=2x[n]+3$. Of the three properties additive, homogeneous, and time-invariant, how many does it have?`,
    hints: [t`Zero input gives output 3.`],
    solution: t`Not additive, not homogeneous (the constant 3), but time-invariant: $1$.` });
  add({ id: 3073, lec: 8, title: "Unit-Sample Response from a Difference Equation", diff: "Easy", topics: ["Systems", "Difference Equations"], answer: "1/8",
    statement: t`$y[n]-\frac12y[n-1]=x[n]$, initially at rest. What is $h[3]$?`,
    hints: [t`Run the recursion with $x=\delta$.`],
    solution: t`$h[0]=1$, $h[1]=\frac12$, $h[2]=\frac14$, $h[3]=\frac18$.` });
  add({ id: 3074, lec: 8, title: "Superposition", diff: "Medium", topics: ["Systems", "LTI"], answer: "4",
    statement: t`An LTI system maps $\delta[n]$ to $h[n]=\delta[n]+2\delta[n-1]$. What is the output at $n=2$ for input $x[n]=2\delta[n-1]$?`,
    hints: [t`Scale and shift $h$.`],
    solution: t`$y[n]=2h[n-1]=2\delta[n-1]+4\delta[n-2]$, so $y[2]=4$.` });
  add({ id: 3075, lec: 8, title: "Cascade Unit-Sample Response", diff: "Medium", topics: ["Systems", "Cascade"], answer: "4",
    statement: t`Two LTI systems in cascade have $h_1[n]=u[n]$ and $h_2[n]=u[n]$. What is $h[3]$ of the cascade?`,
    hints: [t`$h=h_1*h_2$.`],
    solution: t`$(u*u)[n]=(n+1)u[n]$, so $h[3]=4$.` });

  // ---------- L9: unit-sample response and convolution
  add({ id: 3081, lec: 9, title: "Short Convolution", diff: "Easy", topics: ["Convolution"], answer: "5",
    statement: t`$x=[1,2,3]$ and $h=[1,1]$, both starting at $n=0$. What is $(x*h)[2]$?`,
    hints: [t`$y[2]=x[2]h[0]+x[1]h[1]$.`],
    solution: t`$3+2=5$. The full result is $1,3,5,3$.` });
  add({ id: 3082, lec: 9, title: "Geometric Convolution", diff: "Medium", topics: ["Convolution"], answer: "19/36",
    statement: t`$a[n]=(1/2)^nu[n]$ and $b[n]=(1/3)^nu[n]$. What is $(a*b)[2]$?`,
    hints: [t`$\sum_{k=0}^{2}a[k]b[2-k]$.`],
    solution: t`$\frac19+\frac12\cdot\frac13+\frac14=\frac{4+6+9}{36}=\frac{19}{36}$.` });
  add({ id: 3083, lec: 9, title: "Two Unit Pulses", diff: "Easy", topics: ["Convolution", "CT"], answer: "1/2",
    statement: t`$p(t)=1$ for $0<t<1$ and 0 otherwise. What is $(p*p)(1.5)$?`,
    hints: [t`The result is a triangle on $[0,2]$ with peak 1 at $t=1$.`],
    solution: t`$(p*p)(t)=2-t$ for $1\le t\le2$, so the value is $\frac12$.` });
  add({ id: 3084, lec: 9, title: "Exponential Into a Step", diff: "Medium", topics: ["Convolution", "CT"], answer: "1-exp(-1)",
    statement: t`What is $(e^{-t}u(t))*u(t)$ evaluated at $t=1$?`,
    hints: [t`$\int_0^1e^{-\tau}d\tau$.`],
    solution: t`$1-e^{-1}\approx0.632$.` });
  add({ id: 3085, lec: 9, title: "Sum of a Convolution", diff: "Easy", topics: ["Convolution"], answer: "12",
    statement: t`$x[n]$ has samples that add to 4 and $h[n]$ has samples that add to 3. What is $\sum_n(x*h)[n]$?`,
    hints: [t`Evaluate the DTFT of $y=x*h$ at $\Omega=0$.`],
    solution: t`$Y(0)=X(0)H(0)=4\cdot3=12$.` });
  add({ id: 3086, lec: 9, title: "Length of a Convolution", diff: "Easy", topics: ["Convolution"], answer: "12",
    statement: t`$x[n]$ is nonzero only for $0\le n\le7$, and $h[n]$ only for $0\le n\le4$. How many samples can $(x*h)[n]$ have that are nonzero, at most?`,
    hints: [t`$0\le n\le7+4$.`],
    solution: t`$n$ from 0 to 11: $8+5-1=12$ samples.` });

  // ---------- L10: frequency response and filtering
  add({ id: 3091, lec: 10, title: "Moving Average Gain", diff: "Easy", topics: ["Frequency Response"], answer: "sqrt(2)/2",
    statement: t`$y[n]=\frac12(x[n]+x[n-1])$. What is $|H(\pi/2)|$?`,
    hints: [t`$H(\Omega)=\frac12(1+e^{-j\Omega})=e^{-j\Omega/2}\cos(\Omega/2)$.`],
    solution: t`$|\cos(\pi/4)|=\frac{\sqrt2}{2}$.` });
  add({ id: 3092, lec: 10, title: "Cosine Through a Comb", diff: "Medium", topics: ["Frequency Response", "Filtering"], answer: "2",
    statement: t`$h[n]=\delta[n]-\delta[n-2]$. The input is $\cos(\pi n/2)$. What is the amplitude of the output?`,
    hints: [t`$H(\pi/2)=1-e^{-j\pi}$.`],
    solution: t`$H(\pi/2)=2$, so $y[n]=2\cos(\pi n/2)$ and the amplitude is $2$.` });
  add({ id: 3093, lec: 10, title: "RC Phase", diff: "Medium", topics: ["Frequency Response", "CT"], answer: "-pi/4",
    statement: t`$H(\omega)=\frac{1}{1+j\omega}$. The input is $\cos t$. The output is $C\cos(t+\theta)$. What is $\theta$?`,
    hints: [t`$\theta=\angle H(1)$.`],
    solution: t`$H(1)=\frac1{1+j}=\frac{1}{\sqrt2}e^{-j\pi/4}$: $\theta=-\frac\pi4$ (and $C=\frac1{\sqrt2}$).` });
  add({ id: 3094, lec: 10, title: "Ideal High-Pass", diff: "Medium", topics: ["Filtering", "Ideal Filters"], answer: "1",
    statement: t`An ideal DT high-pass filter passes $\frac\pi2<|\Omega|\le\pi$ (gain 1) and blocks $|\Omega|<\frac\pi2$. The input is $x[n]=1+\cos(\pi n/4)+\cos(3\pi n/4)$. What is $y[0]$?`,
    hints: [t`Only $\cos(3\pi n/4)$ passes.`],
    solution: t`$y[n]=\cos(3\pi n/4)$, so $y[0]=1$.` });
  add({ id: 3095, lec: 10, title: "Notch Frequency", diff: "Medium", topics: ["Frequency Response", "Filtering"], answer: "pi/2",
    statement: t`$y[n]=x[n]+x[n-2]$ completely blocks one frequency in $0\le\Omega\le\pi$. Which?`,
    hints: [t`Solve $1+e^{-j2\Omega}=0$.`],
    solution: t`$e^{-j2\Omega}=-1$ when $\Omega=\frac\pi2$.` });
  add({ id: 3096, lec: 10, title: "Echo Cancellation Zero", diff: "Medium", topics: ["Frequency Response", "CT"], answer: "0",
    statement: t`$y(t)=x(t)+x(t-1)$. What is $|H(\pi)|$?`,
    hints: [t`$H(\omega)=1+e^{-j\omega}$.`],
    solution: t`$|1+e^{-j\pi}|=0$.` });

  // ---------- L11: communication systems
  add({ id: 3101, lec: 11, title: "AM Bandwidth", diff: "Easy", topics: ["Modulation", "AM"], answer: "10",
    statement: t`A message band-limited to 5 kHz is sent with double-sideband AM. What bandwidth (kHz) does the transmitted signal occupy?`,
    hints: [t`The copy at $\omega_c$ spans $\omega_c\pm W$.`],
    solution: t`$2\cdot5=10$ kHz.` });
  add({ id: 3102, lec: 11, title: "Synchronous Demodulation Gain", diff: "Easy", topics: ["Modulation", "Demodulation"], answer: "2",
    statement: t`$y(t)=x(t)\cos(\omega_ct)$ is multiplied again by $\cos(\omega_ct)$ and low-pass filtered. What filter gain recovers exactly $x(t)$?`,
    hints: [t`$\cos^2=\frac12+\frac12\cos2\theta$.`],
    solution: t`The baseband part is $\frac12x(t)$, so the gain is $2$.` });
  add({ id: 3103, lec: 11, title: "Carrier Phase Error", diff: "Medium", topics: ["Modulation", "Demodulation"], answer: "1/2",
    statement: t`The receiver multiplies by $\cos(\omega_ct+\theta)$ instead of $\cos(\omega_ct)$, then low-pass filters with gain 2. With $\theta=\pi/3$, the output is $Kx(t)$. What is $K$?`,
    hints: [t`$\cos a\cos b=\frac12\cos(a-b)+\frac12\cos(a+b)$.`],
    solution: t`The baseband part is $\frac12x(t)\cos\theta$; with gain 2, $K=\cos\frac\pi3=\frac12$.` });
  add({ id: 3104, lec: 11, title: "Frequency-Division Multiplexing", diff: "Medium", topics: ["Modulation", "FDM"], answer: "26",
    statement: t`Three messages, each band-limited to 4 kHz, are sent with DSB AM on adjacent carriers, with a 1 kHz guard band between neighboring channels. What total bandwidth (kHz) do they use?`,
    hints: [t`Each channel uses 8 kHz.`],
    solution: t`$3\cdot8+2\cdot1=26$ kHz.` });
  add({ id: 3105, lec: 11, title: "Sideband Power", diff: "Hard", topics: ["Modulation", "AM", "Power"], answer: "1/3",
    statement: t`$y(t)=(1+\cos\omega_mt)\cos\omega_ct$ with $\omega_c\gg\omega_m$. What fraction of the average power is in the sidebands?`,
    hints: [t`Expand into three cosines.`],
    solution: t`$y=\cos\omega_ct+\frac12\cos(\omega_c+\omega_m)t+\frac12\cos(\omega_c-\omega_m)t$. Powers: $\frac12$, $\frac18$, $\frac18$. Fraction $\frac{1/4}{3/4}=\frac13$.` });

  // ---------- L12: DFT 1
  add({ id: 3111, lec: 12, title: "Bin Spacing", diff: "Easy", topics: ["DFT", "Resolution"], answer: "31.25",
    statement: t`A 256-point DFT is computed on a signal sampled at 8 kHz. What is the bin spacing in Hz?`,
    hints: [t`$f_s/N$.`],
    solution: t`$8000/256=31.25$ Hz.` });
  add({ id: 3112, lec: 12, title: "DFT of a Delayed Impulse", diff: "Easy", topics: ["DFT"], answer: "-1/4",
    statement: t`$x[n]=\delta[n-1]$ with $N=4$. Using $X[k]=\frac1N\sum x[n]e^{-j2\pi kn/N}$, what is $\operatorname{Im}X[1]$?`,
    hints: [t`$X[1]=\frac14e^{-j\pi/2}$.`],
    solution: t`$X[1]=-\frac j4$, so $\operatorname{Im}X[1]=-\frac14$.` });
  add({ id: 3113, lec: 12, title: "DFT DC Bin", diff: "Easy", topics: ["DFT"], answer: "5/2",
    statement: t`$x=[1,2,3,4]$ with $N=4$. What is $X[0]$ (6.3000 convention)?`,
    hints: [t`$X[0]$ is the average.`],
    solution: t`$\frac{1+2+3+4}{4}=\frac52$.` });
  add({ id: 3114, lec: 12, title: "Cosine on a Bin", diff: "Easy", topics: ["DFT", "Sinusoids"], answer: "1/2",
    statement: t`$x[n]=\cos(2\pi\cdot3n/16)$ for $0\le n<16$, $N=16$. What is $X[3]$?`,
    hints: [t`$\cos$ splits into two exponentials of weight $\frac12$.`],
    solution: t`$X[3]=X[13]=\frac12$, all other bins 0.` });
  add({ id: 3115, lec: 12, title: "DFT as DTFT Samples", diff: "Hard", topics: ["DFT", "DTFT"], answer: "0.32664",
    statement: t`$x[n]=1$ for $0\le n\le3$. An $N=8$ point DFT (with zero padding) is computed. What is $|X[1]|$? Give 4 digits.`,
    hints: [t`$X[k]=\frac1N X(2\pi k/N)$ and $|X(\Omega)|=\left|\frac{\sin(2\Omega)}{\sin(\Omega/2)}\right|$.`],
    solution: t`$X(\pi/4)$ has magnitude $\frac{\sin(\pi/2)}{\sin(\pi/8)}=2.6131$, so $|X[1]|=\frac{2.6131}{8}=0.3266$.` });
  add({ id: 3116, lec: 12, title: "Zero Bins of a Pulse", diff: "Medium", topics: ["DFT", "DTFT"], answer: "0",
    statement: t`$x[n]=1$ for $0\le n\le3$, $N=8$. What is $X[2]$?`,
    hints: [t`$X(\pi/2)=\sum_{n=0}^3(-j)^n$.`],
    solution: t`$1-j-1+j=0$.` });

  // ---------- L13: DFT 2 and circular convolution
  add({ id: 3121, lec: 13, title: "Four-Point Circular Convolution", diff: "Medium", topics: ["Circular Convolution"], answer: "5",
    statement: t`Find $y[0]$ of the 4-point circular convolution of $x=[1,2,3,4]$ and $h=[1,1,0,0]$.`,
    hints: [t`$y[n]=\sum_m x[m]h[(n-m)\bmod4]$.`],
    solution: t`Linear: $1,3,5,7,4$. Wrap $n=4$ onto $n=0$: $y=[5,3,5,7]$, so $y[0]=5$.` });
  add({ id: 3122, lec: 13, title: "Avoiding Wraparound", diff: "Easy", topics: ["Circular Convolution"], answer: "7",
    statement: t`Signals of lengths 5 and 3 are circularly convolved. What is the smallest $N$ for which the result equals the linear convolution?`,
    hints: [t`The linear result has length $5+3-1$.`],
    solution: t`$N\ge7$.` });
  add({ id: 3123, lec: 13, title: "Product of DFTs", diff: "Medium", topics: ["Circular Convolution", "DFT"], answer: "1/2",
    statement: t`$f=[1,1,0,0]$, $N=4$, and $F[k]$ is its DFT (with $\frac1N$). $g$ has DFT $F[k]^2$. What is $g[1]$?`,
    hints: [t`$g=\frac1N(f\circledast f)$.`],
    solution: t`$f*f=[1,2,1]$ (no wrap), so $g=\frac14[1,2,1,0]$ and $g[1]=\frac12$.` });
  add({ id: 3124, lec: 13, title: "DFT Parseval", diff: "Easy", topics: ["DFT", "Parseval"], answer: "1",
    statement: t`$x=[1,-1,1,-1]$, $N=4$. What is $\sum_k|X[k]|^2$?`,
    hints: [t`$\sum_k|X[k]|^2=\frac1N\sum_n|x[n]|^2$.`],
    solution: t`$\frac44=1$ (indeed $X[2]=1$, the rest 0).` });
  add({ id: 3125, lec: 13, title: "Circular Shift", diff: "Medium", topics: ["DFT", "Properties"], answer: "-1",
    statement: t`$x[n]$ has DFT $X[k]$ with $N=8$ and $X[2]=1$. Let $y[n]=x[(n-2)\bmod 8]$ (a circular delay by 2). What is $Y[2]$?`,
    hints: [t`$Y[k]=X[k]e^{-j2\pi k\cdot2/8}$.`],
    solution: t`$Y[2]=X[2]e^{-j2\pi\cdot2\cdot2/8}=e^{-j\pi}=-1$.` });
  add({ id: 3126, lec: 13, title: "Main Lobe Width", diff: "Medium", topics: ["DFT", "Windowing"], answer: "pi/8",
    statement: t`A length-32 rectangular window has a DTFT whose main lobe runs between the first zeros on each side of $\Omega=0$. How wide is the main lobe, in rad/sample?`,
    hints: [t`The first zeros are at $\Omega=\pm2\pi/N$.`],
    solution: t`$\frac{4\pi}{32}=\frac\pi8$.` });

  root.PROBLEMS = (root.PROBLEMS || []).concat(P);
})(typeof window !== "undefined" ? window : globalThis);
