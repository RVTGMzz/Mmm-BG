"""CH-19: synthesise a natural single-die roll on a wooden table.

Timed to the painted dice animation (src/ui/diceRollCh19.ts): the die lands at
0.32 s, bounces at 0.66 s and 0.88 s, then rattles to rest. Each hit is a
plastic "click" (a few damped modes + a noise transient) layered with a short
wooden "thud"; a small room reverb glues it together. Deterministic seed.

usage: python scripts/synth-dice-roll-ch19.py public/audio/sfx/dice-roll-ch19.wav
"""
import sys
import wave

import numpy as np

SR = 22050
rng = np.random.default_rng(1919)
out = np.zeros(int(SR * 1.45))


def add(sig: np.ndarray, at: float) -> None:
    i = int(at * SR)
    n = min(len(sig), len(out) - i)
    if n > 0:
        out[i:i + n] += sig[:n]


def click(amp: float, bright: float = 1.0) -> np.ndarray:
    """Hard plastic edge hitting wood: damped modes + a tiny noise burst."""
    n = int(SR * 0.06)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f, d, a in ((2900, 55, 1.0), (4300, 75, 0.7), (6100, 95, 0.45), (1700, 40, 0.5)):
        f *= rng.uniform(0.93, 1.07) * (0.9 + 0.1 * bright)
        s += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-d * t)
    burst = rng.standard_normal(n) * np.exp(-900 * t) * 0.9
    return amp * (s * 0.35 * bright + burst)


def thud(amp: float) -> np.ndarray:
    """The table answering: a soft low knock."""
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * rng.uniform(150, 190) * t) * np.exp(-38 * t)
    body += 0.5 * np.sin(2 * np.pi * rng.uniform(310, 360) * t) * np.exp(-55 * t)
    noise = np.convolve(rng.standard_normal(n), np.ones(18) / 18, mode='same') * np.exp(-60 * t)
    return amp * (body * 0.8 + noise * 1.6)


def hit(at: float, amp: float) -> None:
    add(thud(amp), at)
    add(click(amp * 0.9), at + 0.001)
    # the die chatters on its edges right after a landing
    for k in range(int(2 + amp * 4)):
        add(click(amp * 0.28 * (0.65 ** k), 0.8), at + 0.018 + k * rng.uniform(0.016, 0.03))


# a faint spin-whoosh while airborne
n = int(SR * 0.3)
t = np.arange(n) / SR
whoosh = np.convolve(rng.standard_normal(n), np.ones(40) / 40, mode='same') * np.sin(np.pi * t / 0.3) ** 2 * 0.05
add(whoosh, 0.0)

hit(0.32, 1.0)
hit(0.66, 0.62)
hit(0.88, 0.38)
# rolls over a couple of times and settles: quickening, fading little knocks
at, amp, gap = 0.93, 0.26, 0.055
for _ in range(6):
    add(click(amp, 0.7), at)
    add(thud(amp * 0.35), at)
    at += gap
    gap *= 0.72
    amp *= 0.7

# small room: short decaying noise impulse response
ir_n = int(SR * 0.18)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 28)
ir[0] = 0
L = len(out) + ir_n
wet = np.fft.irfft(np.fft.rfft(out, L) * np.fft.rfft(ir, L), L)[:len(out)]
mix = out + wet * 0.035

# gentle high cut, normalise, fade tail
mix = np.convolve(mix, [0.25, 0.5, 0.25], mode='same')
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.82
fade = int(SR * 0.08)
mix[-fade:] *= np.linspace(1, 0, fade)

pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(sys.argv[1], f'{len(pcm) / SR:.2f}s')
