#!/usr/bin/env python3
"""
make-instrument-sounds.py — one distinct, recognisable sound per Kerala instrument
════════════════════════════════════════════════════════════════════════════
    .venv/Scripts/python scripts/make-instrument-sounds.py

WHY
    The room: "the sound of each instrument is repeating — each instrument
    should have a unique sound". The activity synthesized every instrument live
    from the same two or three sine tones at different pitches, so the three
    drums were one drum and the three metals were one bell.

    Chenda is a real recording (scripts/fetch-commons-clip.mjs, Commons, CC
    BY-SA). For the other five no free recording of the instrument itself
    exists, so each is rendered here from a model of what it physically is,
    played as a short phrase in its own character — a child hears a different
    THING, not the same thing higher or lower:

      maddalam   barrel drum, two hands: deep open "thom" and a sharp slap
      udukku     hourglass drum; squeezing the strings bends the pitch UP
      chengila   small bronze gong struck with a stick: a bright ringing "chenk"
      ilathalam  pair of cymbals: a clash and a long shimmer
      kaimani    small hand bells: a jingle

    Deterministic (fixed seed): the same files every run.
OUT assets/new/audio/instruments/<name>.mp3
"""
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "new" / "audio" / "instruments"
SR = 44100
rng = np.random.default_rng(7)

# vibration modes of a circular membrane (Bessel zeros, relative to the fundamental)
MEMBRANE = [1.0, 1.594, 2.136, 2.296, 2.653, 2.918, 3.156, 3.501]


def env_exp(t, tau):
    return np.exp(-t / tau)


def band_noise(n, lo, hi):
    """White noise band-limited in the frequency domain."""
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def membrane_hit(f0, dur, decay, bright=0.5, glide=0.0, glide_t=0.06, bend=0.0, bend_t=0.0,
                 stick=0.3, stick_band=(800, 5000)):
    """One stroke on a drum head. glide: the pitch drop just after the hit;
    bend: a deliberate pitch rise over bend_t (the udukku squeeze)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    pitch = f0 * (1 + glide * np.exp(-t / glide_t))
    if bend:
        pitch *= 1 + bend * np.clip(t / bend_t, 0, 1)
    phase0 = 2 * np.pi * np.cumsum(pitch) / SR
    y = np.zeros(n)
    for k, r in enumerate(MEMBRANE):
        amp = (bright ** k) * (1.0 if k == 0 else 0.8)
        y += amp * np.sin(phase0 * r + k) * env_exp(t, decay / (1 + 0.6 * k))
    a = int(0.004 * SR)
    y[:a] *= np.linspace(0, 1, a)
    s = band_noise(n, *stick_band) * env_exp(t, 0.012) * stick
    return y + s


def metal_hit(f0, dur, decay, ratios, amps, beat=1.5, noise=0.15, noise_band=(2000, 9000)):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for r, a in zip(ratios, amps):
        f = f0 * r
        # each partial is two slightly detuned components: the slow "wah" of real bronze
        y += a * (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * (f + beat * r) * t)) \
            * env_exp(t, decay / (0.6 + 0.4 * r))
    y += noise * band_noise(n, *noise_band) * env_exp(t, 0.03)
    a = int(0.002 * SR)
    y[:a] *= np.linspace(0, 1, a)
    return y


def place(total, events):
    """Mix (start_seconds, signal) events into one buffer."""
    out = np.zeros(int(total * SR))
    for start, sig in events:
        i = int(start * SR)
        j = min(len(out), i + len(sig))
        out[i:j] += sig[: j - i]
    return out


def maddalam():
    thom = lambda: membrane_hit(92, 1.1, 0.42, bright=0.38, glide=0.12, stick=0.12, stick_band=(300, 2000))
    slap = lambda: membrane_hit(205, 0.4, 0.09, bright=0.62, glide=0.05, stick=0.45, stick_band=(1500, 7000))
    return place(2.6, [(0.0, thom()), (0.62, thom()), (0.98, slap()), (1.2, thom()), (1.62, slap()), (1.82, thom())])


def udukku():
    tok = lambda b: membrane_hit(240, 0.42, 0.16, bright=0.55, glide=0.04, bend=b, bend_t=0.18, stick=0.2,
                                 stick_band=(1200, 6000))
    return place(2.4, [(0.0, tok(0.0)), (0.3, tok(0.18)), (0.6, tok(0.35)), (0.9, tok(0.55)),
                       (1.3, membrane_hit(240, 1.0, 0.35, bright=0.5, bend=0.7, bend_t=0.5, stick=0.2))])


def chengila():
    hit = lambda: metal_hit(640, 1.6, 0.85, ratios=[1.0, 2.42, 3.87, 5.31, 6.9], amps=[1, 0.6, 0.38, 0.22, 0.12],
                            beat=2.2, noise=0.25, noise_band=(1500, 7000))
    return place(2.8, [(0.0, hit()), (0.55, hit()), (1.1, hit())])


def ilathalam():
    def clash(strength):
        n = int(1.4 * SR)
        t = np.arange(n) / SR
        shimmer = band_noise(n, 3000, 12000) * env_exp(t, 0.45)
        partials = metal_hit(1180, 1.4, 0.6, ratios=[1.0, 1.47, 2.09, 2.56, 3.3, 4.1],
                             amps=[0.5, 0.45, 0.4, 0.3, 0.25, 0.2], beat=6, noise=0.0)
        return strength * (0.75 * shimmer + 0.5 * partials / (np.abs(partials).max() + 1e-9))
    return place(2.6, [(0.0, clash(1.0)), (0.5, clash(0.7)), (1.0, clash(1.0))])


def kaimani():
    events = []
    for burst in (0.0, 0.85):
        for k in range(7):
            f0 = 2300 * (1 + rng.uniform(-0.06, 0.06))
            events.append((burst + k * rng.uniform(0.02, 0.05),
                           metal_hit(f0, 0.9, 0.32, ratios=[1.0, 2.0, 2.76, 4.07, 5.4],
                                     amps=[1, 0.35, 0.5, 0.2, 0.15], beat=4, noise=0.05) * rng.uniform(0.5, 1.0)))
    return place(2.2, events)


def write(name, y):
    y = y / (np.abs(y).max() + 1e-9) * 0.9
    fade = int(0.25 * SR)
    y[-fade:] *= np.linspace(1, 0, fade)
    OUT.mkdir(parents=True, exist_ok=True)
    wav = OUT / f"{name}.wav"
    import soundfile as sf
    sf.write(wav, y.astype(np.float32), SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-18:TP=-2",
                    "-ar", "44100", "-codec:a", "libmp3lame", "-qscale:a", "4", str(OUT / f"{name}.mp3")], check=True)
    wav.unlink()
    print(f"{name}.mp3  {len(y) / SR:.1f}s")


if __name__ == "__main__":
    for name, fn in [("maddalam", maddalam), ("udukku", udukku), ("chengila", chengila),
                     ("ilathalam", ilathalam), ("kaimani", kaimani)]:
        write(name, fn())
