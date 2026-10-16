#!/usr/bin/env python3
"""
voice-redo.py — re-record the clips voice-tidy.py flagged
════════════════════════════════════════════════════════════════════════════
    .venv/Scripts/python scripts/voice-tidy.py --lang hi     # trims, writes suspect-hi.json
    .venv/Scripts/python scripts/voice-redo.py --lang hi     # re-records the suspects

Each flagged line is rendered as up to eight TAKES (seeds × with/without a full
stop) in the same voice as the rest of its language (the description comes from
voice-bake.py, so the timbre matches). Every take is judged by the same test
voice-tidy.py used; the first that passes is kept, trimmed. If none passes, the
shortest take is kept and the line stays in suspect-<lang>.json, so it is listed
for a person to listen to rather than silently shipped.
"""
import argparse
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


bake = load("voice_bake", "voice-bake.py")
tidy = load("voice_tidy", "voice-tidy.py")
SEEDS = [11, 23, 42, 101]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", required=True, choices=sorted(bake.LANG_CFG))
    ap.add_argument("--dir", default=None)
    args = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    bake.LANG = args.lang                          # number spelling, symbol rules
    folder = Path(args.dir) if args.dir else ROOT / "assets" / "voice" / args.lang
    sus_path = ROOT / "content" / "voice" / f"suspect-{args.lang}.json"
    suspects = json.loads(sus_path.read_text(encoding="utf-8")) if sus_path.exists() else []
    if not suspects:
        print(f"{args.lang}: nothing to redo")
        return

    import torch
    import soundfile as sf
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    model = tok = None
    for repo in bake.MODELS:
        try:
            model = ParlerTTSForConditionalGeneration.from_pretrained(repo).to(device)
            tok = AutoTokenizer.from_pretrained(repo)
            break
        except OSError:
            continue
    if model is None:
        sys.exit("could not load the model")
    desc_tok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    rate = model.config.sampling_rate
    desc = desc_tok(bake.LANG_CFG[args.lang]["desc"], return_tensors="pt").to(device)

    still = []
    for n, s in enumerate(suspects, 1):
        text, fname = s["text"], s["file"]
        said = bake.speakable(text)
        variants = [said] if said.endswith((".", "!", "?", "।")) else [said + ".", said]
        best = None
        tries = 0
        for seed in SEEDS:
            for v in variants:
                tries += 1
                torch.manual_seed(seed)
                prompt = tok(v, return_tensors="pt").to(device)
                with torch.no_grad():
                    audio = model.generate(input_ids=desc.input_ids, attention_mask=desc.attention_mask,
                                           prompt_input_ids=prompt.input_ids,
                                           prompt_attention_mask=prompt.attention_mask)
                wav = np.atleast_1d(audio.cpu().numpy().squeeze()).astype(np.float32)
                if len(wav) < int(0.2 * rate):
                    continue
                # judge at the tidy sample rate
                w22 = np.interp(np.linspace(0, len(wav) - 1, int(len(wav) * tidy.RATE / rate)),
                                np.arange(len(wav)), wav).astype(np.float32)
                ok, span, why = tidy.judge(text, w22)
                if span is None:
                    continue
                dur = span[1] - span[0]
                if ok:
                    best = (wav, span, True, tries)
                    break
                if best is None or (not best[2] and dur < best[1][1] - best[1][0]):
                    best = (wav, span, False, tries)
            if best and best[2]:
                break
        if best is None:
            print(f"  [{n}/{len(suspects)}] NO TAKE  {text}")
            still.append(s)
            continue
        wav, span, ok, tries = best
        a = max(0, int((span[0] - 0.08) * rate))
        b = min(len(wav), int((span[1] + 0.20) * rate))
        cut = wav[a:b].copy()
        fade = int(0.02 * rate)
        if len(cut) > 2 * fade:
            cut[:fade] *= np.linspace(0, 1, fade)
            cut[-fade:] *= np.linspace(1, 0, fade)
        tmp = folder / (fname[:-4] + ".redo.wav")
        sf.write(tmp, cut, rate)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-codec:a", "libmp3lame",
                        "-qscale:a", "4", str(folder / fname)], check=True)
        tmp.unlink()
        if not ok:
            still.append(dict(s, why="best of %d takes still flagged" % tries))
        print(f"  [{n}/{len(suspects)}] {'ok   ' if ok else 'CHECK'} take {tries:<2} "
              f"{span[1] - span[0]:.2f}s  {text[:40]}")

    sus_path.write_text(json.dumps(still, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n{args.lang}: {len(suspects) - len(still)} fixed, {len(still)} still to check by ear")


if __name__ == "__main__":
    main()
