#!/usr/bin/env python3
"""
voice-bake-kn.py — record the Kannada letters to MP3, once, ahead of time
════════════════════════════════════════════════════════════════════════════
    .venv/Scripts/python scripts/voice-bake-kn.py            # what is missing
    .venv/Scripts/python scripts/voice-bake-kn.py --force    # all 49 again
    .venv/Scripts/python scripts/voice-bake-kn.py --only ka,kha

WHY A SEPARATE SCRIPT
    voice-bake.py is built around Malayalam: its manifest is collected from
    `ml:` strings, its voice description says Malayalam, and its number
    spelling is Malayalam. Teaching that file a second language would put the
    shipping Malayalam bake at risk for the sake of 49 short clips. This one
    shares the model and the approach and nothing else.

WHY BAKED AT ALL
    Windows has no Kannada speech voice. Without these clips the letters are
    silent — or worse, an English voice guessing at Kannada script, which
    teaches the wrong sound.

WHAT IT READS
    js/kannada-letters.js — the same file the activity shows. Each letter's
    id names its clip: assets/voice/kn/kn_<id>.mp3.

A LONE LETTER IS THE HARDEST INPUT THERE IS
    Handed "ಕ." the model often says it once and then keeps going — the first
    test said ಕ eight times in five seconds, ಅ three times. So each letter is
    rendered as several TAKES (seeds × endings), every take is measured, and
    the one kept is a take in which the letter is said exactly ONCE: one
    voiced stretch, 0.2-1.3 s long. If no take is clean, the first utterance
    of the best take is cut out and kept, and the letter is FLAGGED in
    content/voice/kannada-takes.json so a Kannada speaker knows which clips
    to check first. Nothing is guessed silently.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "js" / "kannada-letters.js"
LINES_SRC = ROOT / "js" / "kannada-voice.js"     # what കുട്ടു says on Kannada pages
OUT = ROOT / "assets" / "voice" / "kn"

MODELS = [
    "ai4bharat/indic-parler-tts",   # official, gated
    "RXD03/indic-parler-tts",       # ungated mirror, already cached here
]

# Anu is one of the model's two recommended Kannada speakers, and the female
# one. The rest of the sentence matches the Malayalam voice the room asked for:
# female, bright, child-friendly, slow and exact.
DESCRIPTION = (
    "Anu, a young woman, speaks in Kannada with a clear female voice. "
    "Her voice is bright, high-pitched and cheerful, warm and affectionate, "
    "like a kind kindergarten teacher showing a small child the alphabet. "
    "She says each letter slowly and very clearly, pronouncing it carefully "
    "and correctly, with a gentle smile in her voice. "
    "The recording is studio quality with no background noise."
)
SEEDS = [7, 11, 23, 42, 101, 202]
ENDINGS = [".", "!"]
TAKES_LOG = ROOT / "content" / "voice" / "kannada-takes.json"

LINE = re.compile(r"\{\s*id:\s*'(\w+)',\s*l:\s*'([^']+)'")

FRAME = 0.02        # analysis frame, seconds
VOICED_DB = -35     # louder than this is speech
BRIDGE = 0.12       # gaps shorter than this are inside one utterance
MIN_SEG = 0.08      # shorter voiced blips are breath or clicks, not a syllable


def segments(wav, rate):
    """Voiced stretches of a take, as (start_s, end_s)."""
    import numpy as np
    n = max(1, int(rate * FRAME))
    frames = len(wav) // n
    if frames == 0:
        return []
    x = wav[: frames * n].reshape(frames, n)
    db = 20 * np.log10(np.sqrt((x ** 2).mean(axis=1)) + 1e-9)
    voiced = db > VOICED_DB
    segs, start, gap = [], None, 0
    for i, v in enumerate(voiced):
        if v:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap * FRAME >= BRIDGE:
                segs.append((start * FRAME, (i - gap + 1) * FRAME))
                start, gap = None, 0
    if start is not None:
        segs.append((start * FRAME, (frames - gap) * FRAME))
    return [(a, b) for a, b in segs if b - a >= MIN_SEG]


def judge(wav, rate):
    """(clean, first_segment, segment_count) for one take."""
    if len(wav) < int(0.1 * rate):       # an empty take: nothing was said
        return False, None, 0
    segs = segments(wav, rate)
    if not segs:
        return False, None, 0
    a, b = segs[0]
    clean = len(segs) == 1 and 0.2 <= b - a <= 1.3
    return clean, (a, b), len(segs)


def cut(wav, rate, seg):
    """The utterance with a little air either side, faded so it never clicks,
    peak-normalised so every letter plays at the same loudness."""
    import numpy as np
    a = max(0, int((seg[0] - 0.06) * rate))
    b = min(len(wav), int((seg[1] + 0.14) * rate))
    out = wav[a:b].astype("float32").copy()
    fade = int(0.04 * rate)
    if len(out) > 2 * fade:
        out[:fade] *= np.linspace(0, 1, fade)
        out[-fade:] *= np.linspace(1, 0, fade)
    peak = float(np.abs(out).max()) or 1.0
    return out * (0.7 / peak)


KN_LINE = re.compile(r"\{\s*id:\s*'(\w+)',\s*kn:\s*'([^']+)'")


def lines():
    """കുട്ടു's Kannada sentences, as (id, text)."""
    return KN_LINE.findall(LINES_SRC.read_text(encoding="utf-8"))


def letters():
    src = SRC.read_text(encoding="utf-8")
    found = LINE.findall(src)
    if len(found) != 49:
        sys.exit(f"expected 49 letters in {SRC.name}, found {len(found)}")
    return found


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", default="", help="comma-separated letter ids")
    ap.add_argument("--out", default=None, help="audition into another folder")
    args = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    out = Path(args.out) if args.out else OUT
    out.mkdir(parents=True, exist_ok=True)
    items = letters()
    if args.only:
        want = set(args.only.split(","))
        items = [x for x in items if x[0] in want]
    todo = [(i, l) for i, l in items if args.force or not (out / f"kn_{i}.mp3").exists()]
    print(f"{len(items)} letters, {len(items) - len(todo)} already recorded, {len(todo)} to do")
    said = lines()
    if args.only:
        said = [x for x in said if x[0] in want]
    line_todo = [(i, t) for i, t in said
                 if args.force or not (out / f"kn_line_{i}.mp3").exists()]
    print(f"{len(said)} lines, {len(said) - len(line_todo)} already recorded, {len(line_todo)} to do")
    if not todo and not line_todo:
        return

    import numpy as np
    import torch
    import soundfile as sf
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    model = tok = None
    for repo in MODELS:
        try:
            print(f"loading {repo} on {device} ...")
            model = ParlerTTSForConditionalGeneration.from_pretrained(repo).to(device)
            tok = AutoTokenizer.from_pretrained(repo)
            break
        except OSError:
            print("  unavailable, trying next")
    if model is None:
        sys.exit("could not load the model")
    desc_tok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    rate = model.config.sampling_rate
    desc = desc_tok(DESCRIPTION, return_tensors="pt").to(device)

    log = json.loads(TAKES_LOG.read_text(encoding="utf-8")) if TAKES_LOG.exists() else {}

    def take(text, seed):
        torch.manual_seed(seed)
        prompt = tok(text, return_tensors="pt").to(device)
        with torch.no_grad():
            audio = model.generate(
                input_ids=desc.input_ids, attention_mask=desc.attention_mask,
                prompt_input_ids=prompt.input_ids,
                prompt_attention_mask=prompt.attention_mask,
            )
        # atleast_1d: a take the model ends at once comes back as a 0-d array
        return np.atleast_1d(audio.cpu().numpy().squeeze())

    for n, (lid, letter) in enumerate(todo, 1):
        chosen = None          # (wav, seg, seed, ending, clean)
        fallback = None        # best unclean take: the one whose FIRST utterance is most letter-like
        tried = 0
        for seed in SEEDS:
            for ending in ENDINGS:
                tried += 1
                wav = take(letter + ending, seed)
                clean, seg, count = judge(wav, rate)
                if clean:
                    chosen = (wav, seg, seed, ending, True)
                    break
                if seg and 0.15 <= seg[1] - seg[0] <= 1.3:
                    # prefer fewer repeats: the first of two is cleaner than the first of eight
                    if fallback is None or count < fallback[5]:
                        fallback = (wav, seg, seed, ending, False, count)
            if chosen:
                break
        if not chosen and fallback:
            chosen = fallback[:5]
        if not chosen:
            print(f"  [{n}/{len(todo)}] kn_{lid}  {letter}  NO USABLE TAKE in {tried} - skipped")
            log[lid] = {"letter": letter, "flag": "no usable take"}
            continue

        wav, seg, seed, ending, clean = chosen
        wav_path = out / f"kn_{lid}.wav"
        sf.write(wav_path, cut(wav, rate, seg), rate)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
             "-codec:a", "libmp3lame", "-qscale:a", "4", str(out / f"kn_{lid}.mp3")],
            check=True,
        )
        wav_path.unlink()
        log[lid] = {"letter": letter, "seed": seed, "prompt": letter + ending,
                    "seconds": round(seg[1] - seg[0], 2), "takes": tried,
                    "flag": None if clean else "first utterance cut from a repeating take"}
        TAKES_LOG.parent.mkdir(parents=True, exist_ok=True)
        TAKES_LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")
        mark = "clean" if clean else "CUT - check by ear"
        print(f"  [{n}/{len(todo)}] kn_{lid}.mp3  {letter}  {seg[1] - seg[0]:.2f}s  "
              f"take {tried}  {mark}")

    # ── കുട്ടു's sentences ──────────────────────────────────────────────────
    # A sentence is not a lone letter, but the model can still run on past
    # the end of one. A take is kept when its voiced span fits the text: no
    # longer than about 0.17 s a character plus a second and a half.
    for n, (lid, text) in enumerate(line_todo, 1):
        limit = len(text) * 0.17 + 1.5
        best = None
        for k, seed in enumerate(SEEDS, 1):
            wav = take(text, seed)
            if len(wav) < int(0.3 * rate):
                continue
            segs = segments(wav, rate)
            if not segs:
                continue
            span = (segs[0][0], segs[-1][1])
            dur = span[1] - span[0]
            if dur <= limit:
                best = (wav, span, seed, k, True)
                break
            if best is None or dur < best[1][1] - best[1][0]:
                best = (wav, span, seed, k, False)
        if best is None:
            print(f"  [line {n}/{len(line_todo)}] {lid}  NO USABLE TAKE - skipped")
            log["line:" + lid] = {"text": text, "flag": "no usable take"}
            continue
        wav, span, seed, k, ok = best
        wav_path = out / f"kn_line_{lid}.wav"
        sf.write(wav_path, cut(wav, rate, span), rate)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
             "-codec:a", "libmp3lame", "-qscale:a", "4", str(out / f"kn_line_{lid}.mp3")],
            check=True,
        )
        wav_path.unlink()
        log["line:" + lid] = {"text": text, "seed": seed, "seconds": round(span[1] - span[0], 2),
                              "flag": None if ok else "longer than the text suggests - may run on"}
        TAKES_LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"  [line {n}/{len(line_todo)}] kn_line_{lid}.mp3  {span[1] - span[0]:.2f}s "
              f"(limit {limit:.1f}s)  take {k}  {'ok' if ok else 'CHECK BY EAR'}")

    flagged = [k for k, v in log.items() if v.get("flag")]
    print(f"\ndone. {len(flagged)} letter(s) flagged for a Kannada speaker to check: "
          + (", ".join(flagged) or "none"))


if __name__ == "__main__":
    main()
