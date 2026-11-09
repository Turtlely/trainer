"""Recomputes the answers of js/problems-6300.js with numpy/scipy and compares them.
Run: python scripts/check_6300.py   (exit code 1 on any mismatch)"""
import math, re, sys, pathlib
import numpy as np
from scipy.integrate import quad

src = pathlib.Path(__file__).resolve().parent.parent / "js" / "problems-6300.js"
text = src.read_text(encoding="utf-8")
answers = {int(m.group(1)): m.group(2) for m in re.finditer(r'id: (\d+),.*?answer: "([^"]+)"', text, re.S)}

def ev(s):
    s = s.replace("^", "**")
    return eval(s, {"__builtins__": {}}, {"pi": math.pi, "sqrt": math.sqrt, "exp": math.exp, "atan": math.atan, "ln": math.log})

def dft(x, N=None):
    x = np.asarray(x, dtype=complex)
    if N: x = np.concatenate([x, np.zeros(N - len(x))])
    return np.fft.fft(x) / len(x)  # 6.3000 convention: 1/N in the analysis equation

def ctfs(f, T, k):
    w0 = 2 * math.pi / T
    re_ = quad(lambda t: f(t) * math.cos(k * w0 * t), 0, T, limit=400)[0] / T
    im_ = -quad(lambda t: f(t) * math.sin(k * w0 * t), 0, T, limit=400)[0] / T
    return complex(re_, im_)

def dtft(x, n0, W):
    return sum(v * np.exp(-1j * W * (n0 + i)) for i, v in enumerate(x))

def lin_sys_count():
    # numeric LTI test of the five systems in 3071
    rng = np.random.default_rng(1)
    def test(S):
        n = np.arange(-30, 31); x1 = rng.normal(size=200); x2 = rng.normal(size=200)
        X = lambda arr: (lambda m: arr[m + 100] if -100 <= m < 100 else 0.0)
        y = lambda x: [S(x, m) for m in n]
        a = np.allclose(y(X(x1 + x2)), np.add(y(X(x1)), y(X(x2))))
        h = np.allclose(y(X(-2.5 * x1)), -2.5 * np.array(y(X(x1))))
        sh = np.roll(x1, 3); sh[:3] = 0
        ti = np.allclose(y(X(sh))[3:], y(X(x1))[:-3])
        return a and h and ti
    systems = [lambda x, m: x(m - 1) + 2 * x(m), lambda x, m: m * x(m), lambda x, m: x(m) ** 2,
               lambda x, m: sum(x(k) for k in range(-100, m + 1)), lambda x, m: x(2 * m)]
    return sum(test(S) for S in systems)

sq = lambda t: 1.0 if (t % (2 * math.pi)) < math.pi else -1.0
calc = {
    3001: ctfs(lambda t: 1.0 if (t % 4) < 1 else 0.0, 4, 0).real,
    3002: -2 * ctfs(sq, 2 * math.pi, 3).imag,
    3003: 2 * math.pi / 1.5,
    3004: 2 * ctfs(lambda t: math.sin(t) ** 2, 2 * math.pi, 2).real,
    3005: ctfs(lambda t: abs(math.cos(t)), math.pi, 0).real,
    3011: abs(3 - 4j), 3012: -np.angle(3 - 4j), 3013: ((1 + 1j) ** 8).real,
    3014: abs(1 + np.exp(2j * math.pi / 3) + np.exp(4j * math.pi / 3)),
    3015: ctfs(lambda t: math.cos(3 * t + math.pi / 4), 2 * math.pi, 3).real,
    3021: ctfs(lambda t: 1.0 if min(t % 1, 1 - t % 1) < 1 / 8 else 0.0, 1, 1).real,
    3022: ctfs(lambda t: 1.0 if min((t - 0.5) % 1, 1 - (t - 0.5) % 1) < 1 / 4 else 0.0, 1, 1).real,
    3023: sum(1 / k ** 2 for k in range(1, 200001, 2)),
    3024: (1j * 1 * 2 * (1 / (1 + 1))).imag,
    3025: ctfs(lambda t: 1 - 2 * abs(((t + 0.5) % 1) - 0.5), 1, 3).real / ctfs(lambda t: 1 - 2 * abs(((t + 0.5) % 1) - 0.5), 1, 1).real,
    3026: np.conj(1 + 2j).imag,
    3031: (lambda W: abs(W) * 1000 / (2 * math.pi))((2 * math.pi * 700 / 1000 + math.pi) % (2 * math.pi) - math.pi),
    3032: 2 * 250, 3033: 2 * math.pi * 1000 / 8000,
    3034: (lambda W: abs(W) * 4 / (2 * math.pi))((2 * math.pi * 3 / 4 + math.pi) % (2 * math.pi) - math.pi),
    3035: next(N for N in range(1, 100) if np.allclose(np.cos(3 * math.pi * (np.arange(50) + N) / 8), np.cos(3 * math.pi * np.arange(50) / 8))),
    3041: dft([1 + math.cos(math.pi * n / 2) for n in range(4)])[1].real,
    3042: dft([1, 0, 0, 0, 0, 0, 0, 0])[5].real,
    3043: dft([(-1) ** n for n in range(6)])[3].real,
    3044: abs(dft([1, 1, 0, 0])[1]), 3045: float(np.sum(abs(dft([1, 2, 0, 0])) ** 2)),
    3051: abs(1 / (2 + 2j)), 3052: quad(lambda t: math.cos(math.pi / 2 * t), -1, 1)[0],
    3053: quad(lambda t: max(0, 2 - abs(t)), -2, 2)[0],
    3054: quad(lambda w: 1, -math.pi, math.pi)[0] / (2 * math.pi),
    3055: quad(lambda t: math.exp(-2 * t), 0, 50)[0],
    3056: 1 / 3,  # scaling identity: G(w) = F(w/3)/3 with F(1) = 1
    3061: sum(0.5 ** n for n in range(200)), 3062: sum(0.5 ** n * (-1) ** n for n in range(200)),
    3063: abs(dtft([1, 1], 0, math.pi / 2)),
    3064: quad(lambda W: math.cos(2 * W) * math.cos(W * 2), -math.pi, math.pi)[0] / (2 * math.pi),
    3065: quad(lambda W: 1, -math.pi / 4, math.pi / 4)[0] / (2 * math.pi),
    3066: quad(lambda W: 1 + 2 * math.cos(W), -math.pi, math.pi)[0] / (2 * math.pi),
    3071: lin_sys_count(),
    3072: 1,  # additive no, homogeneous no, time-invariant yes (y = 2x + 3)
    3073: (lambda: [h := [1.0], [h.append(0.5 * h[-1]) for _ in range(3)], h[3]][-1])(),
    3074: np.convolve([0, 2], [1, 2])[2],
    3075: np.convolve(np.ones(10), np.ones(10))[3],
    3081: np.convolve([1, 2, 3], [1, 1])[2], 3082: np.convolve(0.5 ** np.arange(10), (1 / 3) ** np.arange(10))[2],
    3083: quad(lambda tau: (0 < tau < 1) * (0 < 1.5 - tau < 1), 0, 1.5, points=[0.5, 1])[0],
    3084: quad(lambda tau: math.exp(-tau), 0, 1)[0], 3085: 4 * 3, 3086: 8 + 5 - 1,
    3091: abs(0.5 * (1 + np.exp(-1j * math.pi / 2))), 3092: abs(1 - np.exp(-2j * math.pi / 2)),
    3093: np.angle(1 / (1 + 1j)), 3094: math.cos(0),
    3095: next(W for W in np.linspace(0, math.pi, 100001) if abs(1 + np.exp(-2j * W)) < 1e-4),
    3096: abs(1 + np.exp(-1j * math.pi)),
    3101: 2 * 5, 3102: 2, 3103: math.cos(math.pi / 3), 3104: 3 * 8 + 2 * 1,
    3105: (lambda t: np.mean(((1 + np.cos(t)) * np.cos(50 * t)) ** 2 - np.cos(50 * t) ** 2) / np.mean(((1 + np.cos(t)) * np.cos(50 * t)) ** 2))(np.linspace(0, 2 * math.pi, 400000, endpoint=False)),
    3111: 8000 / 256, 3112: dft([0, 1, 0, 0])[1].imag, 3113: dft([1, 2, 3, 4])[0].real,
    3114: dft([math.cos(2 * math.pi * 3 * n / 16) for n in range(16)])[3].real,
    3115: abs(dft([1, 1, 1, 1], 8)[1]), 3116: abs(dft([1, 1, 1, 1], 8)[2]),
    3121: (lambda y: y[0])(np.real(np.fft.ifft(np.fft.fft([1, 2, 3, 4]) * np.fft.fft([1, 1, 0, 0])))),
    3122: 5 + 3 - 1,
    3123: (lambda F: np.real(np.fft.ifft(F * F) * 4)[1])(dft([1, 1, 0, 0])),
    3124: float(np.sum(abs(dft([1, -1, 1, -1])) ** 2)),
    3125: (lambda x: dft(np.roll(x, 2))[2] / dft(x)[2])(np.cos(2 * math.pi * 2 * np.arange(8) / 8) + 0.3 * np.arange(8)).real,
    3126: 2 * (2 * math.pi / 32),
}
bad = 0
for pid, ans in sorted(answers.items()):
    if pid not in calc:
        print(f"MISSING check for {pid}"); bad += 1; continue
    a, c = ev(ans), float(np.real(calc[pid]))
    if abs(a - c) > 2e-4 * max(1, abs(c)):
        print(f"FAIL {pid}: answer {ans} = {a:.6f}, computed {c:.6f}"); bad += 1
extra = set(calc) - set(answers)
if extra: print("checks without problems:", sorted(extra))
print(f"{len(answers)} answers checked, {bad} problems")
sys.exit(1 if bad else 0)
