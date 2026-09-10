# Asset List — Primary & Secondary modules

**All 14 activities are built, wired and working right now with zero of these files.**
Every slot below has an emoji or synthesized fallback, so nothing is blocked and nothing
breaks while assets are outstanding. Delivering a file simply upgrades that card — no code
change, no redeploy step.

**Drop files at the exact paths below.** The filename is what the code looks for.

Photographs: clear subject, clutter-free background, roughly square, **≥ 800×800**, JPG.
Audio: MP3, **1–3 seconds** unless noted, normalised, no long silent lead-in.

---

## 1. Audio — 6 files

| # | Path | For | Priority |
|---|------|-----|----------|
| 1 | `assets/new/audio/elevator-chime.mp3` | Types of Houses → Apartment | High |
| 2 | `assets/new/audio/doorbell.mp3` | Types of Houses → Modern House | High |
| 3 | `assets/new/audio/wind.mp3` | Types of Houses → Tent | High |
| 4 | `assets/new/audio/plate-spoon-clink.mp3` | Rooms → Dining Hall | High |
| 5 | `assets/new/audio/lullaby-chime.mp3` | Rooms → Bedroom | High |
| 6 | `assets/new/audio/shower-water.mp3` | Rooms → Bathroom | High |

**That is the complete list** — verified by extracting every asset path the 14 activities
actually reference and diffing against what is on disk. Each falls back to a synthesized
stand-in, so all six are upgrades rather than blockers.

### Nice to have, not referenced by any of the 14
| Path | For |
|---|---|
| `assets/new/audio/park.mp3` | Public Places → Park (currently the neutral tap cue) |
| `assets/new/audio/hospital.mp3` | Public Places → Hospital (same) |
| `assets/new/audio/correct.mp3` | probed by the pre-existing Fruits vs Vegetables game |
| `assets/new/audio/bgm-vehicles.mp3` | pre-existing gap in the Vehicles game |

### Audio you do NOT need to source
Every chime, pop, click, sparkle, tracing tone, correct/incorrect cue, water splash **and the
3-second applause** are synthesized in the Web Audio API by `js/wall-common.js`. The earlier
dev doc listed `applause-3s.mp3` as a P0 ask — that turned out to be unnecessary, because the
celebration bed is generated at runtime. That removes ~15 files from this list.

### Audio already in the repo and in use
`assets/Audio/forest.mp3` (mud house ambience) · `assets/new/audio/bicycle-bell.mp3` (postman
helper card) · `assets/new/audio/bus.mp3` (bus stand) · `assets/new/audio/train-whistle.mp3`
(railway station) · `assets/Audio/Sea.mp3` (beach).

---

## 2. Photographs — 53 files

### `assets/new/images/houses/` — 5
`mud-house.jpg` · `apartment.jpg` · `bungalow.jpg` · `modern-house.jpg` · `tent.jpg`

### `assets/new/images/rooms/` — 3
`dining.jpg` · `bedroom.jpg` · `bathroom.jpg`
*Full-screen room backdrops — landscape, ≥ 1600×1000. The house exterior needs no image;
it is drawn in CSS.*
**Check `games/room-sorter.html` first** — it already models bedroom/kitchen/living rooms and
may contain reusable art.

### `assets/new/images/flowers/` — 7
`rose.jpg` · `mulla.jpg` · `jamanti.jpg` · `lotus.jpg` · `kanikonna.jpg` · `chembarathi.jpg` ·
`pichi.jpg`
*Shared by three activities: Kerala Flowers, Flower Matching, Flower Bouquet. One delivery
upgrades all three.* Pichi appears only in Matching round 2 but is needed.

### `assets/new/images/first-aid/` — 6
`box-closed.jpg` · `bandage.jpg` · `scissors.jpg` · `antiseptic.jpg` · `cotton.jpg` · `gauze.jpg`
*White background, per the brief.*

### `assets/new/images/body/` — 5
`eyes.jpg` · `ears.jpg` · `nose.jpg` · `hands.jpg` · `legs.jpg`
**Check `games/pp-body-parts.html` first** for reusable art.

### `assets/new/images/plant/` — 5
`flower.jpg` · `leaf.jpg` · `stem.jpg` · `fruit.jpg` · `roots.jpg`

### `assets/new/images/helpers/` — 6
`teacher.jpg` · `doctor.jpg` · `postman.jpg` · `police.jpg` · `farmer.jpg` · `shopkeeper.jpg`

### `assets/new/images/places/` — 5
`park.jpg` · `beach.jpg` · `bus-stand.jpg` · `hospital.jpg` · `railway-station.jpg`

### `assets/new/images/habits/` — 5
`brush.jpg` · `wash-hands.jpg` · `bath.jpg` · `healthy-food.jpg` · `dustbin.jpg`

### `assets/new/images/appliances/` — 3
`washing-machine.jpg` · `iron.jpg` · `mixer.jpg`

### `assets/new/images/letters/` — 3 *(PNG, transparent background)*
`elephant.png` · `fish.png` · `rabbit.png`
*The Aksharachithram figures — the animal drawn in light outline, sized so the giant Malayalam
letter forms its body. The brief contains hand-drawn references for all three. Transparent PNG,
≥ 1200px. Until delivered, a soft emoji silhouette stands in.*

---

## 3. 3D models — 5 files

Tapping a house card now opens an interactive 3D viewer: drag to spin, pinch to zoom, and a
**"Take a tour"** button that circles the house — front, side, back, high three-quarter — then
pushes in toward the front door.

### `assets/new/models/houses/` — 5
`mud-house.glb` · `apartment.glb` · `bungalow.glb` · `modern-house.glb` · `tent.glb`

**Format:** glTF binary (`.glb`), Y-up, textures embedded. **Keep each under ~8 MB** — the
existing vehicle models range from 320 KB to 28 MB, and the 28 MB one is painful to load on
the wall. The viewer auto-centres and auto-scales from the model's own bounding box, so
authored size and origin do not matter.

**Exterior models are enough.** The tour circles the outside and pushes toward the door; it
does not go indoors. Interior exploration is already a separate activity (Rooms in a House).
If you want the tour to actually enter the building, say so — the model would then need a
modelled interior and an open doorway, which is a much larger asset ask.

**Until the models arrive** the popup shows the house photo (or emoji) large with
"3D മാതൃക ഇനി ചേർക്കാനുണ്ട്" / "3D model not added yet", and the tour button greys out.
Verified working both ways.

### No other activity needs 3D
The remaining 13 use photos and vector art only, as the brief specifies. The repo's existing
3D (25 models in `3dmodels/`, 11 vehicle models in `assets/new/models/`) belongs to other
games and is untouched.

### One thing worth knowing about the viewer
It runs on the **locally vendored three.js**, not the CDN `<model-viewer>` that
`games/vehicles.html` uses. That was deliberate: this app must work with no internet, and a
CDN `<model-viewer>` never defines its element offline — the popup would open empty with no
error at all. `three` is already in `package.json` `build.files`, so it ships in the installer.

**This also means the Vehicles game's 3D popups do not work offline on the wall today.**
Pre-existing, not introduced here, but the same `js/model-popup.js` could replace it if you
want that fixed.

## 4. Assets deliberately NOT requested

| Not needed | Why |
|---|---|
| Indian coins and notes | Drawn procedurally by `js/currency-svg.js` — sharper at any zoom than a photo, and covers ₹1/2/5/10 and ₹10/20/50/100/200/500 exactly |
| Traffic signals (3) | Vector signs in `js/icon-sprite.js` |
| Daily-life signs (9) | Vector signs in `js/icon-sprite.js` |
| Phone feature icons (5) | Vector icons in `js/icon-sprite.js` |
| Bouquet vase | Drawn in CSS |
| House exterior | Drawn in CSS |
| Applause / all UI sounds | Synthesized at runtime |

---

## 5. On the icon set — a decision to confirm

You asked for an icon pack for the traffic signals and signs. The 17 vector glyphs are
**hand-authored in `js/icon-sprite.js`**, drawn on a 24×24 grid in the visual language of
Material Symbols, with statutory sign colours preserved (NO ENTRY red, information signs blue,
ENTRY/EXIT green).

They are not the Material Symbols pack itself. Vendoring the real pack means an npm install or
a download plus a licence file to ship, and the CDN is ruled out because this app runs offline
on the wall. Hand-authoring 17 simple geometric signs was cheaper than either and has no
licence footprint.

**If you would rather use the actual pack**, `@material-symbols/svg-400` (Apache-2.0) drops in
as extra `<symbol>` elements without touching a single call site. And if real-world fidelity
matters more than visual consistency — arguably it does, since the point is recognising actual
signage on an actual road — Wikimedia Commons carries public-domain **Indian** road-sign SVGs
that would be the better pedagogical choice. Say which you want and it is a contained swap.

---

## 6. Still outstanding, not in this list

- **Malayalam proofing.** Every Malayalam string across the 14 activities was transcribed from
  a PDF with encoding damage (several flower names appear spelled two different ways on
  different pages). A Malayalam-speaking teacher must proof the lot before wall deployment.
  Two names were never specified at all and are marked `NEEDS CONFIRMATION` in
  `games/pri-houses.html`: **Modern House** and **Tent**.
- **Vocational module** (Chenda/Maddalam/Chengila/Kaimani instruments, and the Thrissur Pooram
  / Temple Ulsavam / Onam festival scenes) — dropped on your instruction, along with the
  Postman narrative, which depends on character animation.
