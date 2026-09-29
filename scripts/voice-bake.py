#!/usr/bin/env python3
"""
voice-bake.py — render the wall's Malayalam lines to MP3, once, ahead of time
════════════════════════════════════════════════════════════════════════════

    node scripts/voice-lines.mjs     # what has to be said
    python scripts/voice-bake.py     # say it          <- this file
    node scripts/voice-lines.mjs     # again, for coverage

WHY THIS EXISTS
    Every Malayalam line currently goes to the machine's own speech engine.
    Windows ships no `ml-IN` voice, so on the wall that is either silence or
    an English/Hindi voice reading Malayalam script. Baking the lines removes
    the dependency entirely: one voice, correct pronunciation, identical on
    every machine, and it works with no network — which the wall does not have.

WHY THIS MODEL
    `ai4bharat/indic-parler-tts` — Apache-2.0, no API key, and it speaks
    Malayalam. It is the same model and the same approach used for Tamil in
    the TutionApp_PSG project.

    Note what is NOT reused from there: Supertonic is English-only and pulls
    398 MB from a CDN at runtime, so it could never work here. The part worth
    copying was never a "TTS engine to drop in" — it is this: render ahead of
    time, commit the audio, ship static files.

    The model is description-guided, so the voice is a sentence you write
    rather than a pair of settings. DESCRIPTION below is the most important
    line in this file. Change it and every clip changes — so if you change it,
    delete assets/voice/ml/ and render everything again. A folder half in one
    voice and half in another is the one outcome worth avoiding, which is also
    why SEED is fixed and why a resumed render matches an uninterrupted one.

SETUP  (needs Python and, realistically, a GPU)
    pip install torch --index-url https://download.pytorch.org/whl/cu124
    pip install git+https://github.com/huggingface/parler-tts.git soundfile
    # MP3 encoding needs ffmpeg on PATH; without it this writes .wav instead.

THE RENDER CAN HAPPEN ANYWHERE
    This machine, Colab, a Hugging Face Space. Getting the result home is
    copying the files into assets/voice/ml/ and re-running voice-lines.mjs.
    The manifest is owned by voice-lines.mjs, never by the renderer — a
    manifest written here would describe the machine that rendered rather
    than the repo being shipped.
"""

import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINES = ROOT / "content" / "voice" / "malayalam.json"
OUT = ROOT / "assets" / "voice" / "ml"

# What the model was actually handed for each clip, recorded at render time.
#
# The manifest is keyed by the ON-SCREEN text, so a clip's filename says nothing
# about which normalisation rules were in force when it was made. Change a rule
# — spell out a number, stop turning a slash into a comma — and every affected
# clip keeps a perfectly valid name while holding audio that is now wrong. There
# is no way to notice by looking; you have to listen to 474 clips in a language
# you may not speak.
#
# Recording the heard text turns that into a comparison. It lives beside the
# corpus rather than in assets/ so that only clips ship in the installer.
HEARD = ROOT / "content" / "voice" / "heard.json"

# ──────────────────────────────────────────────────────────────────────────
# WHICH COPY OF THE MODEL
#
# The weights are Apache-2.0, but ai4bharat's own repo is GATED: downloading it
# needs a Hugging Face account that has accepted the terms, plus a token. That
# is a fine thing to do once, and if you have done it the official repo is used.
#
# Without a token it fails as `OSError: You are trying to access a gated repo`,
# so the mirror below is tried next. It is the same architecture and the same
# weights (verified: ParlerTTSForConditionalGeneration, flan-t5-large text
# encoder, dac_44khz audio encoder, 24 decoder layers, 9 codebooks) and it is
# already in the Hugging Face cache on this machine from the Tamil project.
#
# Order matters: official first, so that having proper access is always
# preferred over a third-party copy.
# ──────────────────────────────────────────────────────────────────────────
MODELS = [
    "ai4bharat/indic-parler-tts",   # official, gated, needs `huggingface-cli login`
    "RXD03/indic-parler-tts",       # ungated mirror, already cached here
]

# ──────────────────────────────────────────────────────────────────────────
# THE VOICE
#
# Naming a speaker is what keeps the timbre steady between clips; an unnamed
# voice is re-imagined on every call and the set ends up sounding like several
# different people.
#
# "Anjali" is one of the model's recommended Malayalam speakers. CONFIRM THIS
# against the model card before a full render — the recommended-speaker list
# is per language and it is the one thing here worth checking rather than
# trusting. Render a dozen lines first (--limit 12) and listen.
#
# The language is stated twice on purpose. This model speaks twenty-one
# languages and picks one from context; opening with "speaks in Malayalam"
# and closing with the script constraint leaves it far less room to choose,
# and costs nothing.
#
# "slowly", "clearly", "as if teaching a young child" are doing the real work.
# Resist making it florid — every adjective is another thing the model
# balances, and "expressive" in particular spends its budget on drama rather
# than on the clarity these children need.
# ──────────────────────────────────────────────────────────────────────────
DESCRIPTION = (
    "Anjali speaks in Malayalam. She speaks slowly and very clearly, "
    "pronouncing every Malayalam letter and word carefully and correctly, "
    "in a warm, gentle, friendly tone, as if teaching a young child. "
    "The recording is studio quality with no background noise."
)

SEED = 7


# ──────────────────────────────────────────────────────────────────────────
# Text the model HEARS, versus text the app FILES the clip under.
#
# The clip is always stored under the exact string the app speaks, so the
# manifest, the screen and the content stay untouched. Only what the model
# is handed is adjusted.
# ──────────────────────────────────────────────────────────────────────────

# A slash means two different things in this corpus and they need opposite
# treatment, which the spacing happens to distinguish reliably:
#
#   "കുടിൽ / ഓലമേഞ്ഞ വീട്"   spaced  -> alternative names. A comma gives the
#                                      pause a teacher would give.
#   "കി.മീ/മണിക്കൂർ"          tight   -> a unit, "per". A comma here produces
#                                      "kilometre, hour", which is wrong.
#
# The tight case is only made safe by rewriting the source line into natural
# Malayalam word order ("മണിക്കൂറിൽ 56 കിലോമീറ്റർ"), so what is left to do here
# is simply not to invent a pause that was never in the text.
_SLASH_SPACED = re.compile(r"\s+/\s+")
_SLASH_TIGHT = re.compile(r"(?<=\S)/(?=\S)")

# Written abbreviations. The model reads "കി.മീ" as letters with a full stop in
# the middle; spelled out, it reads as the word a teacher would say.
_ABBREV = [
    (re.compile(r"\bകി\.\s*മീ\.?"), "കിലോമീറ്റർ"),
    (re.compile(r"\bസെ\.\s*മീ\.?"), "സെന്റിമീറ്റർ"),
    (re.compile(r"\bമീ\."), "മീറ്റർ"),
]

# Thousands are written with a group separator — "40,000". Left alone, the digit
# rule below sees 40 and 000 as two separate numbers and says "forty, zero".
_GROUPED = re.compile(r"(?<=\d),(?=\d{3}\b)")

# Digits. Indic Parler-TTS reads a bare digit in Hindi whatever the description
# says, so every number this corpus uses is spelled out in Malayalam.
#
# This is a table of the numbers that actually appear, NOT a general number
# speller. Malayalam compounds its numerals with sandhi — 48 is നാൽപത്തിയെട്ട്,
# not നാൽപത് എട്ട് — and a speller written by someone who does not speak the
# language would produce confident nonsense. A table can be checked line by line
# by the native speaker who proofs the rest of the content.
#
# The cost of a table is that a number nobody listed falls back to a Hindi digit
# SILENTLY. That is how 48, 56, 180 and 360 shipped wrong. `unknown_numbers()`
# now makes that loud at render time, so the next gap is reported, not heard.
_NUM_ML = {
    0: "പൂജ്യം", 1: "ഒന്ന്", 2: "രണ്ട്", 3: "മൂന്ന്", 4: "നാല്", 5: "അഞ്ച്",
    6: "ആറ്", 7: "ഏഴ്", 8: "എട്ട്", 9: "ഒമ്പത്", 10: "പത്ത്",
    11: "പതിനൊന്ന്", 12: "പന്ത്രണ്ട്", 13: "പതിമൂന്ന്", 14: "പതിനാല്",
    15: "പതിനഞ്ച്", 16: "പതിനാറ്", 17: "പതിനേഴ്", 18: "പതിനെട്ട്",
    19: "പത്തൊമ്പത്", 20: "ഇരുപത്", 30: "മുപ്പത്", 40: "നാൽപത്",
    48: "നാൽപത്തിയെട്ട്", 50: "അമ്പത്", 56: "അമ്പത്തിയാറ്",
    100: "നൂറ്", 180: "നൂറ്റി എൺപത്", 200: "ഇരുനൂറ്",
    360: "മുന്നൂറ്റി അറുപത്", 500: "അഞ്ഞൂറ്", 40000: "നാൽപതിനായിരം",
}


def strip_symbols(text: str) -> str:
    """Drop decorative emoji and arrows, keeping every Malayalam character.

    40 of the 474 lines are menu and button captions that open with an emoji —
    "🏠 മെനു", "↩ പിന്നോട്ട്". On screen it is an icon; handed to the model it is
    something to pronounce, and what comes out is either a pause or an English
    word in the middle of a Malayalam phrase.

    This deliberately does NOT filter by "is it in the Malayalam block", which
    is the obvious approach and is wrong: chillu letters (ൻ, ർ, ൽ) are written
    with ZERO WIDTH JOINER, U+200D, which sits outside that block. Stripping it
    would silently alter real words. Unicode category So — "symbol, other" —
    covers emoji, arrows and dingbats and contains no letter of any script, so
    it is the safe test. U+FE0F is the variation selector that follows emoji
    like ✂️ and has to go with them.
    """
    out = [c for c in text
           if unicodedata.category(c) != "So" and c != "️"]
    return "".join(out)


def unknown_numbers(lines) -> dict:
    """Numbers with no Malayalam spelling, which would be read out in Hindi.

    A missing entry in _NUM_ML is not a crash and not a bad-looking clip — it is
    a Malayalam sentence with one Hindi word in the middle, which only someone
    listening closely in the right language would catch. Four of these shipped
    before anyone heard them. Reporting it before the render costs nothing.
    """
    found = {}
    for line in lines:
        prepared = _GROUPED.sub("", strip_symbols(line))
        prepared = re.sub(r"₹\s*\d+", "", prepared)
        for group in re.findall(r"\d+", prepared):
            if int(group) not in _NUM_ML:
                found.setdefault(group, []).append(line)
    return found


def speakable(text: str) -> str:
    """The line as the model should hear it."""
    text = strip_symbols(text)
    text = _SLASH_SPACED.sub(", ", text)   # alternatives: pause
    text = _SLASH_TIGHT.sub(" ", text)     # units: no pause, no comma
    text = _GROUPED.sub("", text)          # 40,000 -> 40000, before digits
    for pat, full in _ABBREV:
        text = pat.sub(full, text)

    # Currency labels read "₹5 അഞ്ച് രൂപ നാണയം" — the numeral and the Malayalam
    # both say five. Expanding the numeral would render "അഞ്ച് അഞ്ച് രൂപ നാണയം",
    # i.e. "five five rupee coin". The Malayalam already carries the number, so
    # the ₹N token is dropped whole rather than spelled out.
    text = re.sub(r"₹\s*\d+", "", text)

    text = re.sub(r"\d+", lambda m: _NUM_ML.get(int(m.group()), m.group()), text)
    return re.sub(r"\s{2,}", " ", text).strip()


def utf8_console() -> None:
    """Let the progress lines print Malayalam without killing the render.

    The Windows console is cp1252 here, so printing a Malayalam filename raises
    UnicodeEncodeError — and because that happens inside the render loop, a
    purely cosmetic problem throws away every clip generated so far. Whatever
    the console can show, the render must not be the thing that stops.
    """
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


def have_ffmpeg() -> bool:
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except Exception:
        return False


def main() -> None:
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0,
                    help="render only the first N lines (use this first, and listen)")
    ap.add_argument("--longest", type=int, default=0,
                    help="sample the N longest lines instead of the first N")
    ap.add_argument("--force", action="store_true",
                    help="re-render lines that already have a clip")
    args = ap.parse_args()
    utf8_console()

    if not LINES.exists():
        sys.exit(f"{LINES} is not there. Run: node scripts/voice-lines.mjs")

    data = json.loads(LINES.read_text(encoding="utf-8"))
    manifest = data["manifest"]
    items = list(manifest.items())

    # --limit takes the first N, and the manifest is sorted, so emoji sort to the
    # front and the sample comes out as a dozen two-word menu captions. Those say
    # nothing about the case that actually breaks TTS models: a long sentence,
    # where they drift, truncate or run out of patience mid-clause. --longest
    # samples from that end instead, so a dozen clips can cover both.
    if args.longest:
        items = sorted(items, key=lambda kv: len(kv[0]), reverse=True)[: args.longest]
    elif args.limit:
        items = items[: args.limit]

    OUT.mkdir(parents=True, exist_ok=True)
    mp3 = have_ffmpeg()
    if not mp3:
        print("! ffmpeg not found - writing .wav. Install ffmpeg for .mp3,")
        print("  or convert afterwards; voice-lines.mjs expects .mp3 names.")

    gaps = unknown_numbers(t for t, _ in items)
    if gaps:
        print(f"\n! {len(gaps)} number(s) have no Malayalam spelling and will be")
        print("  read out in Hindi. Add them to _NUM_ML and re-render those lines:")
        for group, where in sorted(gaps.items(), key=lambda kv: -len(kv[1])):
            print(f"    {group:>7}  in {len(where)} line(s)  e.g. {where[0][:50]}")
        print()

    heard = {}
    if HEARD.exists():
        heard = json.loads(HEARD.read_text(encoding="utf-8"))

    # A clip is stale when what the model was handed then differs from what it
    # would be handed now. A clip with no record predates this file; it is left
    # alone rather than assumed bad, since re-rendering everything on the first
    # run after adding this would be a surprising amount of GPU time.
    stale = [f for t, f in items
             if (OUT / f).exists() and f in heard and heard[f] != speakable(t)]
    if stale:
        print(f"! {len(stale)} clip(s) were rendered under older text rules "
              f"and will be redone")

    todo = [(t, f) for t, f in items
            if args.force or not (OUT / f).exists() or f in set(stale)]
    print(f"{len(items)} lines, {len(items) - len(todo)} already rendered, "
          f"{len(todo)} to do")
    if not todo:
        print("nothing to do")
        return

    # Imported late so --help works without the heavy stack installed.
    import torch
    import soundfile as sf
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        print("! no GPU - this will be slow. Consider Colab; copy the files back.")

    model = tok = None
    problems = []
    for repo in MODELS:
        try:
            print(f"loading {repo} on {device} ...")
            model = ParlerTTSForConditionalGeneration.from_pretrained(repo).to(device)
            tok = AutoTokenizer.from_pretrained(repo)
            MODEL_USED = repo
            break
        except OSError as e:
            # gated repo, no network, or a partial cache - try the next one
            problems.append(f"  {repo}: {str(e).splitlines()[0]}")
            print(f"  unavailable, trying next")
    if model is None:
        sys.exit("could not load the model from any source:\n" + "\n".join(problems))

    desc_tok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)

    # ParlerTTSConfig carries this as a plain attribute rather than something
    # stored in config.json, so read it once here and fail loudly if it is
    # missing - a wrong sample rate writes files that play at the wrong pitch,
    # which is easy to miss and annoying to trace back.
    rate = getattr(model.config, "sampling_rate", None)
    if not rate:
        sys.exit("model config has no sampling_rate")
    print(f"using {MODEL_USED} @ {rate} Hz")

    desc = desc_tok(DESCRIPTION, return_tensors="pt").to(device)

    for i, (text, fname) in enumerate(todo, 1):
        torch.manual_seed(SEED)
        said = speakable(text)
        prompt = tok(said, return_tensors="pt").to(device)

        with torch.no_grad():
            audio = model.generate(
                input_ids=desc.input_ids,
                attention_mask=desc.attention_mask,
                prompt_input_ids=prompt.input_ids,
                prompt_attention_mask=prompt.attention_mask,
            )
        wav = audio.cpu().numpy().squeeze()

        wav_path = OUT / (fname[:-4] + ".wav")
        sf.write(wav_path, wav, rate)

        if mp3:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
                 "-codec:a", "libmp3lame", "-qscale:a", "4", str(OUT / fname)],
                check=True,
            )
            wav_path.unlink()

        # Written as we go, not at the end: a render of 474 lines gets
        # interrupted, and a record that only lands on a clean exit would mark
        # every clip from a stopped run as "predates this file" and never
        # re-check it again.
        heard[fname] = said
        HEARD.write_text(json.dumps(heard, ensure_ascii=False, indent=1),
                         encoding="utf-8")

        print(f"  [{i}/{len(todo)}] {fname}  {text[:44]}")

    print("\ndone. Now run:  node scripts/voice-lines.mjs   (for coverage)")


if __name__ == "__main__":
    main()
