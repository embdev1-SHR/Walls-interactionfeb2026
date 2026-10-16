#!/usr/bin/env python3
"""
voice-tidy.py — trim every baked clip, and find the ones that ran on
════════════════════════════════════════════════════════════════════════════
    .venv/Scripts/python scripts/voice-tidy.py --lang hi            # trim + report
    .venv/Scripts/python scripts/voice-tidy.py --lang hi --report   # report only

WHY
    The model leaves up to a second of silence before a line and several after
    it. On a wall that is a child tapping a picture and hearing nothing for a
    second — long enough to tap again. And on short words it sometimes keeps
    going: says the word twice, or carries on into nonsense ("आम" came out at
    4.8 s; "Kennel" at 4.5 s of continuous speech).

WHAT IT DOES
    TRIM   every clip is cut to its voiced span plus a little air (80 ms before,
           200 ms after), faded so it never clicks. Lossless in effect: the
           speech itself is untouched.
    FLAG   a clip is SUSPECT when its voiced span is longer than its text
           could need, or — for a short line of one or two words — when it has
           more than one separate utterance (the word said twice). Suspects are
           written to content/voice/suspect-<lang>.json, which
               voice-bake.py --lang <l> --redo
           re-renders with several takes, keeping the first that passes.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CORPUS = {"ml": "malayalam.json", "en": "english.json", "hi": "hindi.json", "kn": "kannada.json"}
RATE = 22050
FRAME = 0.02
VOICED_DB = -38
SENT_BRIDGE = 0.45      # pauses shorter than this are inside one sentence
WORD_BRIDGE = 0.22      # for a one/two-word line: a longer gap means it was said again


def decode(path):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1",
                          "-ar", str(RATE), "pipe:1"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.int16).astype(np.float32) / 32768.0


def segments(w, bridge):
    n = int(RATE * FRAME)
    k = len(w) // n
    if k == 0:
        return []
    x = w[: k * n].reshape(k, n)
    db = 20 * np.log10(np.sqrt((x ** 2).mean(axis=1)) + 1e-9)
    v = db > VOICED_DB
    segs, s, gap = [], None, 0
    for i, on in enumerate(v):
        if on:
            if s is None:
                s = i
            gap = 0
        elif s is not None:
            gap += 1
            if gap * FRAME >= bridge:
                segs.append((s * FRAME, (i - gap + 1) * FRAME))
                s, gap = None, 0
    if s is not None:
        segs.append((s * FRAME, (k - gap) * FRAME))
    return [(a, b) for a, b in segs if b - a >= 0.06]


def limit_for(text):
    """The longest a clean reading of this text should take."""
    n = len(text)
    words = len(text.split())
    if words <= 2:
        return 0.14 * n + 1.1
    return 0.16 * n + 2.0


def judge(text, w):
    """(ok, span, reason) for one clip's audio."""
    short = len(text.split()) <= 2
    segs = segments(w, SENT_BRIDGE)
    if not segs:
        return False, None, "silent"
    span = (segs[0][0], segs[-1][1])
    dur = span[1] - span[0]
    if dur > limit_for(text):
        return False, span, f"runs on: {dur:.1f}s for {len(text)} chars"
    if short and len(segments(w, WORD_BRIDGE)) > 1 and len(segments(w, SENT_BRIDGE)) > 1:
        return False, span, "said more than once"
    return True, span, ""


def trim(path, span, total):
    a = max(0.0, span[0] - 0.08)
    b = min(total, span[1] + 0.20)
    if a < 0.12 and total - b < 0.15:
        return False                      # already tight
    tmp = path.with_suffix(".tmp.mp3")
    fade_out = max(0.0, (b - a) - 0.03)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(path),
                    "-af", f"afade=t=in:d=0.015,afade=t=out:st={fade_out:.3f}:d=0.03",
                    "-codec:a", "libmp3lame", "-qscale:a", "4", str(tmp)], check=True)
    tmp.replace(path)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", required=True, choices=sorted(CORPUS))
    ap.add_argument("--dir", default=None, help="clip folder (default assets/voice/<lang>)")
    ap.add_argument("--report", action="store_true", help="flag only, do not trim")
    args = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    folder = Path(args.dir) if args.dir else ROOT / "assets" / "voice" / args.lang
    manifest = json.loads((ROOT / "content" / "voice" / CORPUS[args.lang]).read_text(encoding="utf-8"))["manifest"]
    suspects, trimmed, seen = [], 0, 0
    for text, fname in manifest.items():
        p = folder / fname
        if not p.exists():
            continue
        seen += 1
        w = decode(p)
        ok, span, why = judge(text, w)
        if not ok:
            suspects.append({"text": text, "file": fname, "why": why})
        elif not args.report and trim(p, span, len(w) / RATE):
            trimmed += 1
    out = ROOT / "content" / "voice" / f"suspect-{args.lang}.json"
    out.write_text(json.dumps(suspects, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{args.lang}: {seen} clips, {trimmed} trimmed, {len(suspects)} suspect -> {out.name}")
    for s in suspects[:12]:
        print(f"   {s['why']:<34} {s['text'][:40]}")


if __name__ == "__main__":
    main()
