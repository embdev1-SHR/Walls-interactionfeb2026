# Revamp plan — the 30 new activities

Written for: whoever picks this up next, including me. It assumes you have read
`PROJECT-GUIDE.md` and have seen `games/vehicles.html` and
`games/word-explorer.html` run.

---

## 1. What was actually wrong

Not a matter of polish. Three specific, checkable failures.

### 1.1 There was no goal

Ten of the thirty are `flashcard-deck.js` boards: a grid of cards where tapping
any card makes it glow and awards a star. **Every card is correct.** There is
nothing to get right, nothing to get wrong, and no way to be better at it on the
tenth go than the first. It keeps score without measuring anything.

Compare `word-explorer.html`, which has been in this repo the whole time: it
shows a hint, lays out the target word as empty slots, and offers letter tiles
**with letters that do not belong mixed in**. The child has to discriminate. The
tone climbs in pitch as slots fill (`440 + n*60` Hz), so progress is audible.
A wrong tap shakes the slot, costs nothing, and can be retried immediately.

### 1.2 The content was out of reach

`vehicles.html` sets `--playTop: 31%` and puts nothing interactive above it,
because a child standing at a wall cannot reach the top third of it.

Measured, highest tappable element as a percentage down the screen:

| Activity | Highest tap |
|---|---|
| `vehicles.html` | 48% |
| `pri-houses` (old) | **16%** |
| `sec-currency` | **10%** |

27 of the 30 share the same `<h1>` + `#board` structure that causes this. It is
structural, not a per-file slip.

### 1.3 The 3D and the voice were not there at all

- `pri-houses` referenced five `.glb` files. **None of them exist.** The only
  house asset on disk, `mud-house.gltf`, is itself incomplete — it references a
  `scene.bin` and four textures that are also absent. The popup has always
  fallen through to an emoji.
- `pri-houses` had `speak: false` written into it.
- 20 of 473 Malayalam lines are baked. The rest fall back to a device voice, and
  Windows ships no `ml-IN` voice — so on the wall, most lines are silent.

---

## 2. What is already built

| Piece | State |
|---|---|
| `js/guide.js` — കുട്ടു, the Malayalam guide | built, renders correctly |
| `js/learn-engine.js` — goal + distractors + stage journey | built, **not yet run** |
| `games/pri-houses.html` rebuilt on the engine | written, **not yet run** |
| `scripts/fetch-sketchfab.mjs` + `npm run models` | built, needs the API token |

> **Verification gap, stated plainly.** The engine and the houses rebuild have
> been written and self-reviewed but not executed — the sandbox's command
> classifier has been erroring. Nothing below should be rolled out across 29
> more files until `pri-houses` has been seen working. That is step 0.

Self-review already caught one real defect in the engine: the image fallback was
built as an HTML string with a quoted emoji inside a quoted `onerror` attribute,
which silently broke the markup for every item with a photo. It now builds DOM
nodes. Assume there are more like it until it has run.

---

## 3. The shared fixes — all 30

Applied to every activity regardless of group.

1. **A guide who speaks.** കുട്ടു asks the prompt in Malayalam, points at the
   answer after two misses, and cheers on success. Tapping him repeats the last
   line — the single most useful affordance for a child who missed it or wants
   it again.
2. **Voice on.** Remove every `speak: false`. `WALL.say()` already honours the
   teacher's mute and prefers a baked clip over the device voice.
3. **Reachable layout.** Top 32% carries information only. Enforced by the
   engine, not left to each file.
4. **Never punish.** Soft yellow glow, a wiggle, a low soft tone, no score lost,
   instantly retryable. The brief states this three times and it is the one rule
   that must not bend.
5. **1 or 3 players** where the activity suits it, each child on their own
   progress, with only panel 1 driving the voice so three panels do not talk
   over each other.

---

## 4. Group A — needs a real mechanic (10 remaining)

Currently `flashcard-deck.js`. These get rebuilt on `learn-engine.js` with two
stages: **meet** (explore each item, with its sound, fact and 3D where it
exists) then **find** (`pick` — കുട്ടു names one, the others are distractors).

| Activity | Stages | 3D slot |
|---|---|---|
| `pri-houses` | meet → find | `houses/*.glb` ✅ done |
| `pri-rooms` | meet → find | `rooms/*.glb` |
| `pri-flowers` | meet → find | — photos |
| `pp-animals` | wild → farm → find | — photos |
| `sec-currency` | coins → notes → pay | — drawn, `currency-svg.js` |
| `sec-daily-living` | meet → find | — drawn, `icon-sprite.js` |
| `sec-first-aid` | meet → use it | — photos |
| `sec-body-plant` | body → plant → find | `body/human.glb`, `plants/*.glb` |
| `sec-helpers-places` | helpers → places → match | — photos |
| `sec-mobile` | parts → make a call | — drawn |
| `voc-instruments` | meet → find by sound | — photos |

`sec-currency` and `sec-mobile` deserve a mode the engine does not have yet:
**do the task** (pay this amount; call this person). Add a `task` mode rather
than flattening them into a quiz — paying ₹15 with coins is the actual skill.

## 5. Group B — has a mechanic, needs the shell (19)

These already do something real — tracing, matching, building, dragging. They do
**not** need rebuilding. They need the section 3 list applied, plus a stated
goal and an endless pool so they do not run out.

`pri-letters` · `pri-flower-match` · `sec-name-id` · `sec-name-build` ·
`sec-bouquet` · `pp-animal-quiz` · `pp-odd-one-out` · `pp-hen-types` ·
`pp-animal-homes` · `pp-animal-young` · `pp-animal-puzzle` · `pp-animal-sort` ·
`pp-animal-path` · `voc-party-decorate` · `voc-card-handover` · `voc-cap-match` ·
`voc-cake-share` · `voc-photo` · `voc-card-craft`

Two need more than the shell:

- **`pp-size-quiz`** compares *different* animals by a `sizeRank` field, so it
  tests which animal is bigger in real life, not which picture is bigger. The
  brief asks for the same object at two sizes. Rework the data, not the code.
- **`voc-*`** are the vocational set. They were built as craft sequences with no
  failure state. Give each a checkable end condition.

---

## 6. Order of work

0. **Run `pri-houses`.** Fix what the run shows. Do not proceed until it is
   right — every later file inherits these mechanics.
1. Paste `SKETCHFAB_API_TOKEN` into `.env.local`, `npm run models`, confirm the
   12 slots fill and the licences in `assets/new/models/credits.json` are ones
   we can honour. **CC-BY requires visible credit in the app** — that is a build
   task, not a footnote.
2. Add the `task` mode to the engine (currency, mobile).
3. Group A, in menu order, verifying each in Electron as it lands.
4. Group B shell pass.
5. Re-run `node scripts/voice-lines.mjs`, then the **full 474-line bake**. Do
   this last: every prompt written in steps 2–4 adds lines, and baking twice
   wastes an hour of GPU.
6. Full 84-activity audit, then rebuild the installer.

---

## 7. The two things I cannot fix

**Malayalam.** Roughly 200 strings, none checked by a native speaker, several
transcribed from PDFs with encoding damage. I have already found and corrected
grammar errors I introduced myself (`മേജ്ജ` → `മേൽക്കൂര`, case endings that vary
by final sound). Strings sit in clearly marked `{en, ml}` blocks near the top of
each file so a reviewer has one place to look per activity. **This needs a
person, not another pass from me.**

**Whether the mechanics suit these particular children.** I have matched
`vehicles.html` and `word-explorer.html` because they are the two things in this
repo that were built for this room and work. Whether a two-stage meet-then-find
holds a child's attention at the Pangappara wall is a question for whoever is
standing next to them, and worth answering on `pri-houses` before it is copied
29 times.
