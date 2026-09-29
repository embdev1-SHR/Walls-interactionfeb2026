# The Malayalam voice

One voice, rendered once, committed, served as static files. No runtime TTS, no API key at play
time, no per-device accent lottery, and it works on a wall with no signal.

---

## Why

Every Malayalam line in this app goes through `js/tts-engine.js` to the machine's own speech
engine. **Windows ships no `ml-IN` voice.** On a wall with none installed that is either silence
or an English/Hindi voice reading Malayalam script — which is worse than silence, because it
teaches the wrong pronunciation.

This removes the dependency entirely.

---

## Running it

```bash
node scripts/voice-lines.mjs     # what has to be said   -> content/voice/malayalam.json
python scripts/voice-bake.py     # say it                -> assets/voice/ml/*.mp3
node scripts/voice-lines.mjs     # again: coverage report
```

`voice-lines.mjs` is safe and instant — it reads the codebase and writes two files.
`voice-bake.py` needs Python and, realistically, a GPU.

**Install into a dedicated venv, not your system Python.** On this machine a bare
`pip install` would have landed ~4.5 GB of CUDA PyTorch inside an unrelated tool's
virtualenv, because that is what `python` resolves to on PATH:

```bash
python -m venv .venv
.venv/Scripts/python.exe -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
.venv/Scripts/python.exe -m pip install numpy soundfile git+https://github.com/huggingface/parler-tts.git
.venv/Scripts/python.exe -m pip install "sentencepiece==0.2.0"
```

**Those last two pins are not optional on Windows, and both fail as a bare segfault
rather than as an error message:**

| Pin | Without it |
|---|---|
| `torchaudio` from the **same index as torch** | pip resolves it from PyPI and installs a build for a much newer torch. Mismatched ABI, no warning. |
| `sentencepiece==0.2.0` | the 0.2.2 Windows wheel's native extension access-violates the moment it loads. It is pulled in by T5's tokenizer, which this model's text encoder uses, so it only shows up deep inside `from parler_tts import ...`. |

Diagnosing this a second time is avoidable — `python -X faulthandler -c "import sentencepiece"`
names the faulting module in one line, where bisecting imports by hand does not.

`.venv/` is gitignored and is **not** in `build.files`, so it never reaches the installer.
ffmpeg must be on PATH for `.mp3`; without it the script writes `.wav`.

Then use the npm shortcuts:

```bash
npm run voice:lines
npm run voice:bake -- --limit 12     # listen first
npm run voice:bake                   # the full 474
npm run voice:lines                  # coverage
```

**Render a dozen first and listen before committing to the full set:**

```bash
python scripts/voice-bake.py --limit 12
```

**The two steps are separate on purpose.** `voice-bake.py` only makes audio; `voice-lines.mjs`
owns the manifest and writes it from what is actually in the folder. So the render can happen
anywhere — this machine, Colab, a Hugging Face Space — and getting the result home is just
copying the files into `assets/voice/ml/` and re-running `voice-lines.mjs`.

---

## The corpus

**474 distinct lines, 6,932 characters**, collected from 46 files.

Only `ml:` property values are collected. Every line the wall speaks reaches `WALL.say()` as an
`{ en, ml }` object; nothing else is ever read aloud. An earlier version swept every Malayalam
string literal and pulled in 839 "lines" — button captions, half-sentences waiting to be joined
with a variable, and the Malayalam-named `.wav` paths under `assets/Audio`. None of those is
ever spoken, and baking them would have made the coverage figure meaningless.

---

## The voice

**`ai4bharat/indic-parler-tts`** — Apache-2.0, speaks Malayalam.

The weights are Apache-2.0, but **ai4bharat's own repo is gated**: pulling it needs a Hugging
Face account that has accepted the terms, plus `huggingface-cli login`. So `MODELS` in
`voice-bake.py` lists the official repo first and an ungated mirror second, and falls through
on `OSError`. Official first, so that having proper access always wins over a third-party copy.

The mirror was checked rather than trusted — same architecture, `flan-t5-large` text encoder,
`dac_44khz` audio encoder, 24 decoder layers, 9 codebooks. It is also already in this machine's
Hugging Face cache from the Tamil project, so the render downloads nothing.

It is description-guided, so the accent and the pace are a sentence rather than a pair of
settings. That sentence is `DESCRIPTION` in `scripts/voice-bake.py` and it is the most important
line in the pipeline: **change it and every clip changes.** If you change it, delete
`assets/voice/ml/` and render everything again — a folder half in one voice and half in another
is the one outcome worth avoiding, which is also why `SEED` is fixed and why a resumed render
produces the same audio as an uninterrupted one.

> ⚠️ **Confirm the speaker name before a full render.** `DESCRIPTION` names *Anjali*, on the
> basis that the model's recommended-speaker list is per language. Check it against the model
> card and listen to `--limit 12` before rendering 474 lines.

### Text the model hears vs. text the clip is filed under

The clip is always stored under the **exact** string the app speaks, so the manifest, the screen
and the content stay untouched. Only what the model is handed is adjusted, by `speakable()`:

| On screen | Model hears | Why |
|---|---|---|
| `കുടിൽ / ഓലമേഞ്ഞ വീട്` | `കുടിൽ, ഓലമേഞ്ഞ വീട്` | a slash read aloud is a stumble |
| `₹5 അഞ്ച് രൂപ നാണയം` | `അഞ്ച് രൂപ നാണയം` | the Malayalam already says "five"; expanding `₹5` would render "five five rupee coin" |
| `4 കാലുകൾ` | `നാല് കാലുകൾ` | Indic Parler-TTS reads a bare digit in **Hindi** whatever the description says |
| `🏠 മെനു` | `മെനു` | 40 of the lines are captions that open with an emoji. On screen it is an icon; handed to the model it is one more thing to pronounce. |

Emoji are stripped by Unicode category `So`, **not** by "is this character in the Malayalam
block". That second test is the obvious one and it is wrong here: chillu letters (ൻ, ർ, ൽ) are
written with ZERO WIDTH JOINER, which sits outside the Malayalam block, so that filter would
quietly alter real words.

---

## How it is played

```
baked clip  →  device voice  →  silence
```

`js/voice-clips.js` maps the spoken text to a file. `WALL.say()` asks it first and falls through
to `TTSEngine` if there is no clip.

**A missing clip is normal, not an error.** Content is written long before anyone re-runs the
renderer, so an unbaked line simply uses the device voice, exactly as before this existed.
Nothing regressed by adding it; lines only get better as they bake. A clip that is listed but
not on disk fails once, is remembered, and never delays a tap again.

Both voice files are optional. Remove them and every activity behaves as it did.

### Load order in an activity

```html
<script src="../js/tts-engine.js"></script>
<script src="../js/voice-manifest.js"></script>   <!-- generated -->
<script src="../js/voice-clips.js"></script>
<script src="../js/wall-common.js"></script>
```

Already wired into all 30 activities that use `WALL`.

---

## What is where

| Path | What | Generated? |
|---|---|---|
| `scripts/voice-lines.mjs` | collects the lines, writes the manifest, reports coverage | no |
| `scripts/voice-bake.py` | renders the audio | no |
| `content/voice/malayalam.json` | the corpus + manifest, for the renderer | **yes** |
| `js/voice-manifest.js` | the same manifest as a plain script, for the app | **yes** |
| `js/voice-clips.js` | lookup and playback | no |
| `assets/voice/ml/*.mp3` | the clips | **yes** |

The runtime manifest is a `<script>` rather than JSON on purpose: the app runs from `file://`
inside Electron, where fetching a local JSON file is an avoidable source of failure.

Packaging needs no change — `build.files` already globs `assets/**` and `js/**`.

---

## What was *not* reused from TutionApp_PSG

That project has two voice systems, and only one of them transfers:

- **Supertonic 3** is English-only — Tamil is explicitly excluded there, and Malayalam is not in
  its language list either. It also pulls **398 MB from a CDN at runtime**, which a wall with no
  internet cannot do. Not usable here at all.
- **The Tamil pipeline** is the one worth copying, and it is not a "TTS engine to drop in" — it
  is exactly this: `indic-parler-tts`, rendered ahead of time, committed, played from a manifest
  with the device voice as fallback. That distinction matters, because it means the work needs a
  machine with a GPU for one render, not a library added to the app.
