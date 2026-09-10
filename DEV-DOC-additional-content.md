# Dev Doc — Pangappara Blueroom Additional Contents

**Source:** `REMAINING script pangappara blueroom-1-23.pdf`
**Status:** BUILT. 14 of 17 activities implemented, wired and verified.
**Scope:** 14 activities across 2 new menu modules (Primary, Secondary).

> ### Scope change — 3 activities dropped
> On instruction, the **Vocational module was dropped entirely** (V1 Classical Ensemble
> Instruments and V2 Event-Based Visual Layouts — the chenda/melam and festival scenes),
> together with **anything depending on commissioned animation**. That also removes
> **S3 Postman & Letter Delivery**, whose four-phase script is a character-animation
> sequence (the postman walks, unlocks the box, bags the letter, walks to a house) that
> cannot be built honestly without animated artwork.
>
> Sections 2, 4 and 6 below still describe all 17 for reference. The three dropped ones
> are marked. Nothing was half-built: the 14 that shipped are complete.
>
> ### What actually got built
> **Shared:** `js/wall-common.js` · `js/flashcard-deck.js` · `js/currency-svg.js` ·
> `js/icon-sprite.js` · `js/flower-data.js`
> **Primary (5):** `pri-houses` `pri-rooms` `pri-letters` `pri-flowers` `pri-flower-match`
> **Secondary (9):** `sec-name-id` `sec-name-build` `sec-first-aid` `sec-currency`
> `sec-body-plant` `sec-helpers-places` `sec-mobile` `sec-bouquet` `sec-daily-living`
>
> All 14 verified in the real Electron runtime: every menu entry routes to a file that
> exists, every page loads with a clean console, and the interactions were exercised
> (tap/glow/star, tab switching, line-drawing, drag-to-vase, canvas tracing, letter
> assembly). Asset requests are in **`ASSET-LIST.md`** — the deliverable list, superseding
> section 6 here.
>
> Two findings changed the earlier estimate:
> * **`applause-3s.mp3` is no longer needed.** It was listed P0; the celebration bed is
>   synthesized in `WALL.sfx.celebrate()`, which removes ~15 audio files from the ask.
> * **Every image is optional.** All 14 activities are demoable and testable today with
>   zero delivered assets, because each art slot falls back to emoji or vector.

---

## 1. What already exists (read this before writing anything)

### 1.1 The app
Electron desktop app (`package.json` → `electron` + `electron-builder`, entry `main.js`),
shipped to the Blueroom wall as an NSIS installer. `build.files` uses the globs
`games/**/*`, `js/**/*`, `assets/**/*`, `3dmodels/**/*` — **new files in those folders are
packaged automatically. No packaging change is needed for any activity in this doc.**

### 1.2 The four wiring points for every new game
A game is not reachable until all four are done. There is no auto-discovery.

| # | File | What to add |
|---|------|-------------|
| 1 | `index.html` | A `.game-card` div — **top-level module cards only**, not per-activity |
| 2 | `js/game-loader.js` → `CATEGORIES` | `{ name, game }` entry under the module key |
| 3 | `js/game-loader.js` → `loadGame()` switch | `case '<key>': window.location.href = 'games/<key>.html'` |
| 4 | `js/audio-manager.js` → `audioMap` | `'<key>': '<bgm file stem>'` |

**Invariant to preserve:** `audio-manager.js` derives its lookup key from the *filename*
(`getPageName()` splits `location.pathname`). So for every activity:

> game key === html filename stem === audioMap key

Skip step 4 only if the game manages its own background audio and does **not** include
`audio-manager.js` (this is what `games/vehicles.html` deliberately does — see its header).

### 1.3 Session / licensing gating
`Session.isGameAllowed()` in `js/session.js` currently returns `true` unconditionally, and
`AuticareConfig.MULTIPLAYER_GAMES` feeds only `isMultiplayerGame()`, which nothing calls.
**No gating work is required for these 17 activities.** Do not add keys to
`MULTIPLAYER_GAMES` expecting an effect.

### 1.4 The two newest games are the reference implementation
`games/vehicles.html` and `games/fruits-vegetables.html` already implement the exact
teacher-control set the PDF demands on nearly every page. Read them first; they are the
house style for everything below.

They also document the real constraints, in their own file headers:

- **Offline is a hard requirement.** `fruits-vegetables.html` is "verified working with no
  internet". Google Fonts degrade gracefully (the OS Malayalam font takes over);
  **`model-viewer` loaded from `ajax.googleapis.com` does not** — 3D popups die with no
  network. `three` IS vendored locally (`node_modules/three/build/three.module.js`, and it
  is listed in `build.files`).
- **Malayalam speech needs an `ml-IN` voice installed on the wall machine.** On-screen
  Malayalam is unaffected. Every activity must stay fully usable with speech off.
- **Optional assets 404 by design** and fall back to synthesized Web Audio. Keep this pattern.

### 1.5 Existing shared JS

| Module | API | Note |
|---|---|---|
| `js/tts-engine.js` | `TTSEngine.speak(text, lang, word)`, `.kidsYell()` | Picks the best `ml-IN` / `en` voice. Use for all speech. |
| `js/pre-primary-common.js` | `PP.init/back/bindTouch/param/toolbarHTML/initLangToggle/modelPlaceholder` | Older toolbar (`← Menu` + `EN/ML` only). **The two newest games bypass it entirely** and inline their own helpers. This drift is resolved in section 3.1. |
| `js/audio-manager.js` | auto-inits from filename | Background music only. |
| `js/session.js`, `js/api-client.js` | `Session.logActivity()` | Fire-and-forget; no-op offline. |

### 1.6 Reusable code already in the repo (do not rewrite)

- **`coinSVG(val, sz)` and `noteSVG(val, w, h)` in `games/money-counter.html`** procedurally
  render Indian currency. `noteSVG` supports exactly **10 / 20 / 50 / 100 / 200 / 500** and
  `coinSVG` covers **1 / 2 / 5 / 10** — *precisely* the denominations the PDF asks for in
  Secondary #5. That makes it a **zero-new-asset** build. Extract, do not clone.
- Data-shape convention, from `games/model-cards.html`:
  `{ id, name:{en, ml}, emoji, glb, ... }` — follow it everywhere.
- Teacher toolbar: CSS at `games/vehicles.html` lines 288–306, handlers at lines 869–905.

---

## 2. Activity inventory and module mapping

17 activities. Keys use a module prefix, matching the existing `pp-` convention for
pre-primary. Every file is `games/<key>.html`.

### PRIMARY module (`data-category="primary"`) — 5 activities

| # | PDF item | Key | Engine |
|---|-----|-----|--------|
| P1 | 1. Types of Houses | `pri-houses` | A — Flashcard |
| P2 | 2. Exploring Rooms in a House | `pri-rooms` | D — Scene |
| P3 | 3. Letter Learning (Aksharachithram) | `pri-letters` | C — Tracing |
| P4 | 4. Kerala Flowers Flashcards | `pri-flowers` | A — Flashcard |
| P5 | 5. Flower Matching Activity | `pri-flower-match` | B — Matching |

### SECONDARY module (`data-category="secondary"`) — 10 activities

| # | PDF item | Key | Engine |
|---|-----|-----|--------|
| S1 | 1. Student Name Identification | `sec-name-id` | E — Name |
| S2 | 2. Floating Letter / Name Building | `sec-name-build` | E — Name |
| ~~S3~~ | ~~3. Postman & Letter Delivery~~ | — | **DROPPED — needs animation** |
| S4 | 4. First Aid Box Items | `sec-first-aid` | A — Flashcard |
| S5 | 5. Indian Coins & Currency Notes | `sec-currency` | A — Flashcard |
| S6 | 6. Body Parts & Parts of a Plant | `sec-body-plant` | A — Flashcard |
| S7 | 7. Our Helpers & Public Places | `sec-helpers-places` | A — Flashcard |
| S8 | 8. Mobile Phone Skills | `sec-mobile` | A — Flashcard |
| S9 | 9. Flower Arrangement & Bouquet | `sec-bouquet` | B — Drag/drop |
| S10 | 10. Daily Living, Life Symbols & Skills | `sec-daily-living` | A — 5 boards |

### ~~VOCATIONAL module~~ — DROPPED IN FULL

| # | PDF item | Key | Engine |
|---|-----|-----|--------|
| ~~V1~~ | ~~1. Classical Ensemble Instruments~~ | — | **DROPPED** |
| ~~V2~~ | ~~2. Event-Based Visual Layouts~~ | — | **DROPPED** |

### The key estimate: 5 engines, not 17 games

**10 of the 17 activities (P1, P4, S4, S5, S6, S7, S8, S10, V1 — S10 counting as 5 boards)
are the same interaction**, spelled out identically in the PDF each time:

> tap card → bright glowing green border + gentle bounce + glowing star badge
> [+ optional sound effect] … explore all → floating balloons + 3-second applause

Build that once as a data-driven engine (section 3.2) and those activities become **data
files plus art**, not code. This is where the schedule is won or lost.

---

## 3. Shared infrastructure to build FIRST (Phase 0)

Nothing in section 2 should start before these land.

### 3.1 `js/wall-common.js` — teacher toolbar and wall helpers

Extract the behavior from `games/vehicles.html` (CSS 288–306, handlers 869–905) so all 17
activities get identical controls. The PDF asks for "Height Shift (Up/Down)" and "Target
Scaling (Zoom In/Out)" on almost every page; this is that, already built and proven.

```
WALL.bindTouch(el, fn)          // click + touchend, ghost-click guarded
WALL.toolbar({ menu, lang, voice, size, height, reset, home })  // injects markup + CSS
WALL.onSize(cb)                 // SIZE_STEPS [.75,.88,1,1.15,1.35,1.6], start idx 2
WALL.onHeight(cb)               // HEIGHT_STEP 34px, HEIGHT_MAX 120px
WALL.isMl() / WALL.onLang(cb)   // Malayalam-first, default true
WALL.voiceOn()
WALL.say(text, lang, word)      // wraps TTSEngine, no-ops when voice is off
WALL.sfx.chime|pop|star|soft()  // synthesized Web Audio, zero assets
WALL.celebrate()                // floating balloons + 3s applause (the PDF "Finish" step)
WALL.home()                     // -> ../index.html
```

Decision: **a new module, not an extension of `PP`.** `PP.toolbarHTML()` renders a different,
older two-button toolbar that several shipped `pp-*` games depend on; changing it risks
regressions there. `wall-common.js` is purely additive. Migrating the `pp-*` games onto it
later is optional cleanup and explicitly **out of scope** for this work.

### 3.2 `js/flashcard-deck.js` — the Engine A workhorse

```
DECK.mount(containerEl, {
  items: [{
    id, label:{en,ml}, sub:{en,ml},                 // sub = the "Usage:" / caption line
    art: { emoji } | { img } | { svg } | { glb },   // first one present wins
    sound,                                          // optional url; falls back to WALL.sfx
  }],
  columns,
  starOnTap: true,
  onAllExplored: WALL.celebrate
})
```

Handles: green glow border, bounce, star badge, explored-set tracking, SIZE/HEIGHT wiring,
`WALL.say()` of the label when voice is on, and the finish celebration. Art is
**fallback-tolerant** — a missing `img` renders the `emoji` — so every deck is demoable
before a single photo arrives. Precedent: `fruits-vegetables.html` is 100% emoji and ships
today.

### 3.3 `js/currency-svg.js`
Move `coinSVG` / `noteSVG` out of `games/money-counter.html` into a shared module and have
`money-counter.html` include it. Behavior-preserving refactor — verify the shop game still
renders notes before moving on. Unblocks S5 with zero new art.

### 3.4 `assets/new/icons/signs.svg` + `js/icon-sprite.js`
Self-hosted SVG `<symbol>` sprite for traffic signals, daily-life symbols and phone icons.
See section 5 for the icon-pack decision.

### 3.5 Menu scaffolding
Three new cards in `index.html` and three `CATEGORIES` keys. Suggested palette additions,
matching the existing `.card-*` gradient convention:

```css
.card-primary   {background:linear-gradient(135deg,#dbeafe,#93c5fd)}
.card-secondary {background:linear-gradient(135deg,#ede9fe,#c4b5fd)}
.card-vocational{background:linear-gradient(135deg,#fee2e2,#fca5a5)}
```

Icons: Primary 🏫, Secondary 🎓, Vocational 🥁.

**Submenu layout note:** `.pp-grid` (a hard 3-column grid, `index.html:222-224`) is currently
applied only when `categoryName === 'pre-primary'`. Secondary has 10 entries and Primary 5 —
generalise that check to all module categories, or those submenus render as a single tall
column of 10.

---

## 4. Per-activity specification

Malayalam strings below are transcribed from the PDF. Several PDF glyphs are mojibake — the
document has encoding damage, e.g. flower names appear as both `ററാസപ്പൂവ്` and
`ററാസപ്പറവ്` on different pages. **Every Malayalam string must be confirmed with the
Pangappara teaching staff before it goes on the wall.** Flagged again in section 8.

### PRIMARY

**P1 `pri-houses` — Types of Houses** (Engine A)
Cards, extra-large by default, each with a distinct real-world sound on tap.

| House | Malayalam | Sound |
|---|---|---|
| Mud House / Hut | കുടിൽ / ഓലമേഞ്ഞ വീട് | rustling leaves + village birds |
| Apartment / Flat | അപ്പാർട്ട്മെന്റ് / ഫ്ലാറ്റ് | elevator chime |
| Bungalow / Villa | ബംഗ്ലാവ് / വലിയ വീട് | *(PDF cuts off — confirm)* |
| Modern House | *(confirm)* | doorbell |
| Tent | *(confirm)* | wind |

The PDF fully specifies 3 house types, then references "Doorbell for Modern House, Wind for
Tent" in the interaction script — so **5 cards**, two of which need their Malayalam names and
visuals confirmed.

**P2 `pri-rooms` — Exploring Rooms in a House** (Engine D)
House exterior with 3 tappable openings → zoom into a full-screen room → tappable items
inside → extra-large "Back to House" button. Rooms: Dining Hall (ഊണുമുറി), Bedroom
(കിടപ്പുമുറി), Bathroom (കുളിമുറി). Room sounds: plate/spoon clink, lullaby chime, running
water. Tapping an item inside plays its own sound (e.g. the tap plays water).
*Reuse note:* `games/room-sorter.html` already models bedroom/kitchen/living rooms and takes
a `?room=` param — audit it for reusable room art before commissioning new photos.

**P3 `pri-letters` — Aksharachithram letter tracing** (Engine C)
Three letters, each forming an animal outline. One page, three rounds (or a `?letter=` param,
following the `room-sorter.html?room=` precedent).

| Letter | Figure | Side word cards | Completion |
|---|---|---|---|
| ത | Elephant ആന | ആന, താമര, താറാവ് | golden glow |
| ര | Fish മത്സ്യം / മീൻ | രഥം, രാജാവ്, റോക്കറ്റ് | blue glow, fish swishes its tail + bubbles, splash sound |
| മ | Rabbit മുയൽ | മുയൽ, മാങ്ങ, മയിൽ | golden glow |

Required behavior: pulsing green start dot; a glowing beam fills the stroke under the finger;
**forgiving tracing** — straying off-path holds the trail, with *no* red marks and *no* error
sound. Precedents to lift from: `games/pp-path-tracer.html`, `games/animal-drawing.html`,
`games/creature-creator.html`.

**P4 `pri-flowers` — Kerala Flowers Flashcards** (Engine A)
Rose (റോസപ്പൂവ്), Mulla/Jasmine (മുല്ലപ്പൂവ്), Jamanti, Lotus (താമരപ്പൂവ്),
Kanikonna (കണിക്കൊന്ന), Chembarathi (ചെമ്പരത്തി). PDF: **no voice narration and no sound
effects** on this one — calm bgm only. Tap = glow + bounce + star.

**P5 `pri-flower-match` — Flower Matching** (Engine B)
Two columns of 3, right side shuffled; tap-then-tap or drag a line. Correct = green glowing
line + both cards bounce + sparkles + spoken "ശരിയാണ്!". Incorrect = the line wiggles and
fades with a soft yellow glow; **no buzzer, no red X**. Two round sets are defined in the PDF:
R1 Rose / Mulla / Chembarathi, R2 Pichi (പിച്ചിപ്പൂവ്) / Lotus / Kanikonna.
*Pichi is a 7th flower not in the P4 deck — it needs art too.*
This activity **does** use voice, unlike P4.

### SECONDARY

**S1 `sec-name-id` — Student Name Identification**
Teacher panel: free-text name field (**names must be editable** — the PDF is emphatic), TTS
pronunciation, plus an **optional 2-second teacher voice recording** that overrides TTS.
Tap the name → green glow, per-letter bounce, star particles, bgm ducks, name is spoken.
*Implementation note:* the mic override needs `MediaRecorder` plus a persisted blob. Store it
in `localStorage` per name, and confirm Electron grants microphone permission in the packaged
build — this is the riskiest unknown in the Secondary set. Ship TTS-only first, mic override
second.

**S2 `sec-name-build` — Floating Letter Selection**
Empty slot box at top; letter blocks drift across the canvas. Tap a floating letter → it
stops, glows green, flies into the next slot, "pop" sound. Tap a letter in the box → it
returns to floating. All slots filled → blocks merge into one name card with a golden frame
and the full name is spoken. Teacher controls add **Float Speed (Slow / Medium / Static)** on
top of the standard SIZE/HEIGHT. Precedents: `games/word-creator.html`,
`games/alphabet-explorer.html`.

**S3 `sec-postman` — Postman & Letter Delivery** (Engine F, most bespoke)
Four phases: meet the postman (tap → waves, **bicycle bell**) → post the letter (drag the card
into the box, swoosh) → postman unlocks the box and bags the letter (key turn + paper rustle)
→ walks to a house, name card pops up, announces "അരുൺ! അരുണിന് ഒരു കത്തുണ്ട്!", child taps
to receive, card opens full-screen. Teacher panel: recipient name + occasion (Onam / Birthday
/ General). Shares its name source with S1 — put the name store in `wall-common.js` so both
read it.

**S4 `sec-first-aid`** (Engine A) — a closed box opens to reveal 6 items: First Aid Box,
Bandage, Scissors, Antiseptic Liquid, Cotton, Gauze Roll. No voice narration.

**S5 `sec-currency`** (Engine A) — 4 coins (₹1/2/5/10) + 6 notes (₹10/20/50/100/200/500),
**all from `js/currency-svg.js`. Zero new assets.** No voice narration.

**S6 `sec-body-plant`** (Engine A, two boards) — Body parts, each with a Usage line
(Eyes/കണ്ണുകൾ→കാണാൻ, Ears/ചെവികൾ→കേൾക്കാൻ, Nose/മൂക്ക്→മണക്കാൻ,
Hands/കൈകൾ→തൊടാനും പിടിക്കാനും, Legs/കാലുകൾ→നടക്കാൻ) and Parts of a Plant
(Flower/പൂവ്, Leaf/ഇല, Stem/തണ്ട്, Fruit/പഴം, Roots/വേരുകൾ).
*Reuse note:* `games/pp-body-parts.html` exists — audit it for art and labels first.

**S7 `sec-helpers-places`** (Engine A, two boards) — 6 helpers (Teacher, Doctor, Postman,
Police Officer, Farmer, Shopkeeper) + 5 public places (Park, Beach, Bus Stand, Hospital,
Railway Station). Places can reuse existing audio: `bus.mp3`, `train-whistle.mp3`, `Sea.mp3`.

**S8 `sec-mobile`** (Engine A) — a giant phone frame with 5 icons (Calls, Text Message, Voice
Message, Video Call, Calculator); tapping opens a simple full-screen graphic of that feature.
Icons come from the sprite (section 5). No photography needed.

**S9 `sec-bouquet`** (Engine B) — 3 flowers left, 3 right, empty vase centre; drag each in, it
snaps into a growing arrangement with ribbon effects; all placed → sparkles + applause.
Reuses the P4/P5 flower art entirely; only the vase is new.

**S10 `sec-daily-living`** — five boards behind one card, selected with `?board=`:
`habits` (5 good habits) · `appliances` (washing machine / iron / mixer, 3 steps each) ·
`traffic` (red/yellow/green → STOP/WAIT/GO) · `symbols` (9 daily-life signs) ·
`calendar` (days, months, tap today's date to highlight it).
`traffic` and `symbols` are pure sprite work — no photography. `calendar` is a small bespoke
widget, not Engine A.

### VOCATIONAL

**V1 `voc-instruments`** (Engine A + audio) — Chenda (ചെണ്ട), Maddalam (മദ്ദളം),
Chengila (ചെങ്ങില), Kaimani (കൈമണി). Tap → glow + bounce + **2–3 seconds of the authentic
instrument** + star. These four recordings are the highest-value new audio in the project and
cannot be synthesized or substituted.

**V2 `voc-events`** (Engine D) — three cultural scenes; the PDF explicitly asks for
**animation, not stills**: Thrissur Pooram Melam, Temple Ulsavam, Onam Celebration Melam.
Each highlights where each instrument sits in the ensemble (foreground Chenda, midground
Maddalam + Ilathalam, background Kombu). Zero voice narration.
*This is the single largest asset ask in the document* — see section 6.4 for the fallback.

---

## 5. Traffic signals and daily-life symbols — icon pack decision

**Requirement:** 3 traffic lights + 9 daily-life symbols + 5 phone icons = 17 glyphs.

**Do not use emoji for these.** The source PDF itself demonstrates the failure — ENTRY, EXIT,
NO PARKING, ZEBRA CROSSING and THIS WAY all render as tofu boxes in it. On the wall, an
unrenderable sign is a blank card.

**Do not use an icon CDN or a webfont.** Per section 1.4, this app runs offline.

**Recommendation — a self-hosted SVG sprite, from two sources:**

1. **Material Symbols (Apache-2.0)** for the UI-shaped glyphs. Vendor individual SVGs from the
   `@material-symbols/svg-400` npm package or the Google Fonts icon site — **not** the variable
   font, **not** the CDN. Apache-2.0 permits redistribution inside the installer.
   Expected glyph names (verify each at download time; do not assume):
   `call`, `sms`, `mic`, `videocam`, `calculate`, `no_smoking`, `local_parking`, `man`,
   `woman`, `wc`, `traffic`, `directions`, `block`, `arrow_forward`, `login`, `logout`.

2. **Hand-authored SVG, in-repo,** for the true road signs the pack has no faithful form for:
   **zebra crossing**, **Indian-style NO PARKING** (P with a red slash), and **ENTRY / EXIT**
   doorway signage. These are trivial geometry — bars, a circle, a slash, an arrow — and
   authoring them costs less than sourcing them. The traffic signal is likewise a drawn
   3-lamp housing rather than an icon: it needs the active lamp to light up.

   *Alternative, if real-world fidelity matters more than visual consistency:* Wikimedia
   Commons carries public-domain Indian road-sign SVGs. For students being taught to recognise
   actual signage on an actual road, that is arguably the better pedagogical choice, at the
   cost of a less uniform look beside the Material glyphs. **This is a call for the Pangappara
   team, not one to make silently in code.**

**Delivery:** one `assets/new/icons/signs.svg` sprite of `<symbol id="…">` elements, drawn via
`<use href="#id">`. Use `currentColor` fills so a sign can glow green on tap, and get infinite
scaling for the SIZE control — both things a PNG cannot do.

---

## 6. Asset list

> **SUPERSEDED by `ASSET-LIST.md`**, which reflects what the built
> activities actually reference. Kept here for the reasoning.

### 6.1 Reuse — already in the repo, no sourcing needed

| Need | Existing file |
|---|---|
| ₹ coins and notes, all denominations | `coinSVG`/`noteSVG` in `games/money-counter.html` |
| Postman bicycle bell (S3 phase 1) | `assets/new/audio/bicycle-bell.mp3` |
| Bus Stand (S7) | `assets/new/audio/bus.mp3` |
| Railway Station (S7) | `assets/new/audio/train-whistle.mp3` |
| Beach (S7) | `assets/Audio/Sea.mp3` |
| Mud house — birds / leaves (P1) | `assets/Audio/forest.mp3` |
| Rabbit figure (P3 മ) | `3dmodels/rabbit.glb`, `assets/images/rabbit.png` |
| Elephant figure (P3 ത) | `3dmodels/elephant__gajah.glb`, `assets/images/Elephant.png` |
| Background music, all modules | `assets/Audio/*.mp3` (13 tracks) |
| Room art (P2) | audit `games/room-sorter.html` |
| Body-part art / labels (S6) | audit `games/pp-body-parts.html` |
| Fish art (P3 ര) | audit `games/fish-it.html`, `games/underwater-explorer.html` |

### 6.2 Synthesize in Web Audio — do NOT source these
Every chime, pop, click, sparkle, tracing tone, correct/incorrect cue and lullaby chime.
`fruits-vegetables.html` already synthesizes its full effect set; reuse that approach via
`WALL.sfx`. This removes roughly 15 asset requests from the list below.

### 6.3 NEW — audio to source (11 files)

| File | For | Priority |
|---|---|---|
| `applause-3s.mp3` | shared "Finish" celebration, ~8 activities | **P0** |
| `chenda.mp3` | V1 | **P0** — authentic, irreplaceable |
| `maddalam.mp3` | V1 | **P0** |
| `chengila.mp3` | V1 | **P0** |
| `kaimani.mp3` | V1 | **P0** |
| `elevator-chime.mp3` | P1 apartment | P1 |
| `doorbell.mp3` | P1 modern house | P1 |
| `wind.mp3` | P1 tent | P1 |
| `shower-water.mp3` | P2 bathroom | P1 |
| `plate-spoon-clink.mp3` | P2 dining hall | P1 |
| `envelope-swoosh`, `key-turn`, `paper-rustle` | S3 | P2 — synthesizable if needed |

### 6.4 NEW — images to source

The PDF demands "high-definition **real photos** on clutter-free backgrounds" throughout.

| Set | Count | Detail |
|---|---|---|
| P1 Houses | 5 | mud hut, apartment block, bungalow, modern house, tent |
| P2 Rooms | 4 | house exterior + dining hall, bedroom, bathroom interiors |
| P4/P5/S9 Flowers | **7** | rose, mulla, jamanti, lotus, kanikonna, chembarathi, **pichi** |
| S9 Vase | 1 | empty bouquet vase / wrapping basket |
| S4 First Aid | 7 | box closed, box open, bandage, scissors, antiseptic, cotton, gauze |
| S6 Body & Plant | 6 | eyes, ears, nose, hands, legs + one labelled plant diagram |
| S7 Helpers & Places | 11 | 6 helpers, 5 public places |
| S10 Habits & Appliances | 8 | 5 habits + 3 appliances (step art can be drawn) |
| V1 Instruments | 4 | chenda, maddalam, chengila, kaimani |
| S3 Postman | 4 | postman character, red post box, greeting card, house backdrop |
| **V2 Event scenes** | **3** | **animated** — Thrissur Pooram, Temple Ulsavam, Onam Melam |

**Total: ~60 images + 3 animations.**

**On V2:** three bespoke cultural animations are, realistically, the long pole of this entire
project — likely longer than the other 16 activities combined. Recommended fallback, to be
confirmed with the Pangappara team: build V2 against **high-resolution stills with a slow
Ken-Burns pan and tappable instrument hotspots that play that instrument's V1 recording**.
That satisfies "highlights where each instrument is played", reuses the V1 audio, ships in
days rather than weeks, and can be upgraded to true animation later without touching the
activity's structure. **V2 should be scheduled last regardless.**

**Every image slot ships with an emoji or SVG fallback** (section 3.2), so all 17 activities
are demoable and testable before a single photograph is delivered.

---

## 7. Build order

| Phase | Contents | Unblocks |
|---|---|---|
| **0** | `wall-common.js`, `flashcard-deck.js`, `currency-svg.js`, sign sprite, 3 menu cards + categories, `.pp-grid` generalisation | everything |
| **1** | S5 (zero assets), S8, S10 traffic + symbols (sprite only), S4, S6, S7, P1, P4, V1 | 10 activities, mostly data |
| **2** | P5, S9 | matching / drag |
| **3** | P3 (3 letters) | tracing |
| **4** | P2, S10 calendar + habits + appliances | scenes |
| **5** | S1, S2 | name work (mic override last) |
| **6** | S3, then V2 | narrative, then the animation-dependent one |

Phase 1 deliberately front-loads the activities that need **no new art at all** (S5, S8,
S10-traffic, S10-symbols) so something is running on the wall before any asset sourcing
completes.

---

## 8. Conventions and open questions

**Conventions**
- Malayalam-first display; English secondary. Speech is always optional and toggleable.
- Never punish a wrong answer: no buzzers, no red X, no stressful sound. The PDF states this
  three separate times. Wrong = soft yellow glow, wiggle, fade.
- Extra-large default sizing everywhere, with SIZE/HEIGHT teacher controls on every page.
- Dual `click` + `touchend` binding with the ghost-click guard — `WALL.bindTouch`, always.
- Every asset reference is fallback-tolerant; a missing file degrades, never breaks.
- One `<title>`, one home button to `../index.html`, Escape returns to the menu.

**Open questions — need answers from the Pangappara team**
1. **Malayalam text is unverified.** The source PDF has encoding damage; several flower names
   appear in two different spellings across pages. All on-screen Malayalam must be proofed by
   a native-speaking teacher before wall deployment. *(Blocking for sign-off, not for building.)*
2. **P1:** Malayalam names and reference visuals for **Modern House** and **Tent**, which the
   PDF references in the interaction script but never specifies. Also the Bungalow sound.
3. **V2:** is the Ken-Burns-stills fallback (section 6.4) acceptable, or is true animation a
   hard requirement? This single answer swings the schedule more than anything else here.
4. **Traffic / road signs:** uniform Material Symbols look, or true-to-life Indian road signs
   (section 5)?
5. **S1:** is the teacher voice-recording override in scope for v1, or is TTS enough? Requires
   verifying microphone permission in the packaged Electron build.
6. **S10** is one menu card with five boards. Confirm that matches how teachers expect to find
   it, rather than five separate cards.

**Discovered during the build**
- **Letter tracing is not stroke-order aware.** `pri-letters` rasterises the real font glyph
  and uses its alpha as both hit-test and clip mask, so the beam can only ever fill the letter
  and straying off it is harmless — exactly the forgiveness the brief demands. The trade is
  that a child may fill the letter in any order, and the start dot is the topmost ink rather
  than a taught starting stroke. True stroke-order teaching needs ordered per-letter path data
  authored by someone who writes Malayalam. Worth doing; deliberately not faked here.
- **Malayalam needs grapheme segmentation, not character splitting.** അരുൺ is 4 code points
  but 3 graphemes (അ / രു / ൺ). Both name activities use `Intl.Segmenter` so a vowel sign is
  never stranded on its own tile.
- **The praise line in Flower Matching is built grammatically.** The brief's
  "ശരിയാണ്! റോസപ്പൂവും റോസപ്പൂവും!" needs the -ഉം suffix applied per-word: a chandrakkala
  ending drops it (റോസപ്പൂവ് → റോസപ്പൂവും), a vowel ending takes -യും (ചെമ്പരത്തി →
  ചെമ്പരത്തിയും). Simplified rule covering the seven names in play; needs teacher review.

**Known technical risks**
- `model-viewer` is CDN-loaded, so any activity using 3D is degraded offline. `three` is
  vendored — prefer it, or vendor `model-viewer` into `node_modules` + `build.files`.
- An `ml-IN` voice may be absent on the wall machine; all speech must be non-essential.
- 60+ new images will grow the installer. `release.zip` is already 734 MB and untracked —
  worth a separate conversation about asset compression and what belongs in git.
