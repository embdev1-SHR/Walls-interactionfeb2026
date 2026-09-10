# Asset List — Pre-Primary Module 2

Source: `PREPRIMARY 2 PDF.pdf` — 14 new activities + 7 changes to existing content.

## Build status (as of this pass)

**Built and verified — 9 new activities**
`pp-animals` (#1) · `pp-animal-quiz` (#2 identify + match) · `pp-animal-puzzle` (#3 + #5) ·
`pp-animal-homes` (#7) · `pp-animal-young` (#8) · `pp-hen-types` (#9) ·
`pp-odd-one-out` (#10) · `pp-animal-sort` (#13) · `pp-animal-path` (#14)
All wired into the Pre-Primary menu, Malayalam-first, running on existing assets + emoji.

**Changes made to existing content — 3**
* **Pattern Finder** — the 7 number sequences removed (even, odd, counting by 2/5/10).
  10 visual AB/ABC patterns remain. *No assets needed.*
* **Mosquito Clap** — 3 → 8 mosquitoes; the synthesized buzz was near-inaudible at 0.022
  gain and is now 0.055. *No assets needed.*
* **Colouring** — cat, cow and hen added, driven by the line art **already sitting unused in
  `assets/Draw/`**. Dog and goat appear automatically the moment their outlines land.

**Still to build**
* **#4 Animal parts identification** (tap a body part → zoom + Malayalam name). Needs
  per-animal hotspot coordinates, which can only be set against the real photographs — so
  it is genuinely blocked on §1a, not on effort.
* **Animal Hunt rework** (domestic animals: cow, cat, hen, goat, rabbit, pig replacing the
  wild set; smaller, clearer targets). Blocked on the same photographs.
* **Size Quiz rework** (small vs large of the *same* object). Not blocked — pending.
* **Feelings** (real faces instead of emoji). Blocked on §3 *and* on the Dora licensing
  question below.
* **Module 1 song.** Blocked — see §7.


Every path below is **exactly what the code looks for**. Drop the file in, it appears. No code
change, no rebuild step. Until then each slot falls back to an emoji, so everything is
demoable today.

**Photos:** JPG or PNG, clear single subject, **plain white or plain background — zero
clutter** (the brief insists on this three times), roughly square, **≥ 800×800**.
**Sounds:** MP3, **1–3 seconds**, normalised, no silent lead-in.

---

## 0. THE HEADLINE — what you already have

Before commissioning anything, note the repo already contains:

| Already here | Files |
|---|---|
| **Animal sounds** | `assets/Audio/animals/` — cow, tiger, elephant, bear, rabbit, wolf, owl, rattlesnake *(usable as snake hiss)*, plus 12 more |
| **Animal photos** | `assets/animals img/` — dog, lion, monkey, elephant, rabbit, giraffe, rhino |
| **Colouring outlines** | `assets/Draw/` — **cat, cow, hen** *(3 of the 5 the brief asks for)* |
| **3D animals** | `3dmodels/` — cow, hen, rabbit, monkey, tiger, lion, bear, cobra, elephant, peacock + 15 more |

**That covers 6 of the 12 flashcard animals' sounds and 4 of their photos outright.**
The list below is only what is genuinely missing.

---

## 1. Animal photos — 33 files → `assets/new/images/animals/`

### 1a. Farm / domestic — 10 new
`cat.jpg` · `cow.jpg` · `hen.jpg` · `rooster.jpg` · `colourful-hen.jpg` · `sheep.jpg` ·
`goat.jpg` · `horse.jpg` · `duck.jpg` · `pig.jpg`

> **Already have:** dog *(`assets/animals img/dog.webp`)*, rabbit *(`rabbit.png`)*
> The brief specifically wants **Indian/desi breeds** — Indie Tabby cat, Indie Pariah dog,
> Desi cow. Stock photos of Holstein cows and Persian cats will not read as familiar to
> these children, which is the entire point of the change request.

### 1b. Wild — 3 new
`tiger.jpg` · `snake.jpg` · `bear.jpg`

> **Already have:** lion, monkey, elephant *(reuse `Elephant.png` for കാട്ടാന)*

### 1c. Quiz distractors — 4 new
`frog.jpg` · `spider.jpg` · `turtle.jpg` · `bird.jpg`

> Needed by activity #2 (identify-the-right-animal) and #13 (sorting: 4 birds).

### 1d. Young ones — 8 new
`calf.jpg` · `chick.jpg` · `puppy.jpg` · `kitten.jpg` · `kid-goat.jpg` · `foal.jpg` ·
`duckling.jpg` · `lamb.jpg`

> Activity #8 pairs each with its mother. **Transparent PNG is better here** — the young one
> animates across the screen to stand beside the adult, and a white box around it will show.

### 1e. Animal homes — 8 new → `assets/new/images/homes/`
`coop.jpg` · `cow-shed.jpg` · `kennel.jpg` · `goat-shed.jpg` · `cat-basket.jpg` ·
`stable.jpg` · `pond.jpg` · `sheep-pen.jpg`

> Activity #7. Same note — **transparent PNG preferred**, since the animal walks *into* the
> home and the two images overlap.

---

## 2. Animal sounds — 13 files → `assets/new/audio/animals/`

| File | For | Brief's wording |
|---|---|---|
| `meow.mp3` | Cat | "Meow Sound → പൂച്ച" |
| `bark.mp3` | Dog | "Bark Sound → നായ" |
| `cluck.mp3` | Hen | "Cluck Sound കോഴി" |
| `rooster-crow.mp3` | Rooster | "Morning crow" (#9) |
| `bleat.mp3` | Goat | "Bleat Sound ആട്" |
| `baah.mp3` | Sheep | "Baah Sound ആട്" |
| `neigh.mp3` | Horse | "Gentle Neigh" (#8) |
| `quack.mp3` | Duck | "Soft Quack" (#8) |
| `oink.mp3` | Pig | Animal Hunt change request |
| `lion-roar.mp3` | Lion | "Soft Roar സിംഹം" |
| `monkey-chatter.mp3` | Monkey | "Chatter Sound കുരങ്ങ്" |
| `bird-chirp.mp3` | Birds | #13 sorting |
| `frog-ribbit.mp3` | Frog | #14 frog path |

**Reused, do not source:** cow (`cow.mp3`), tiger (`tiger.mp3`), elephant (`elephant.mp3`),
bear (`bear.mp3`), snake (`rattlesnake.mp3`), rabbit (`rabbit.mp3`).

**Do NOT source:** mosquito buzz, hop/boing, chimes, pops, sparkles, applause — all
synthesized at runtime. The mosquito buzz already exists and I have just made it audible.

---

## 3. Feelings — 12 faces → `assets/new/images/feelings/`

`happy.jpg` · `sad.jpg` · `angry.jpg` · `surprised.jpg` · `scared.jpg` · `excited.jpg` ·
`tired.jpg` · `love.jpg` · `silly.jpg` · `confused.jpg` · `bored.jpg` · `proud.jpg`

> The brief: *"Use real facial expressions instead of emojis. Do not use emojis; use real
> images like Dora (cartoon character)/illustrations instead."*
>
> **A licensing warning worth reading:** Dora the Explorer is Nickelodeon/Paramount
> intellectual property. Using her in software installed on a paid installation is
> copyright infringement, however small the deployment. Please either commission original
> illustrations in that friendly style, buy a licensed expression pack, or photograph
> consenting adults/staff. I have left the activity on emoji until you supply files, rather
> than shipping something that exposes you legally.
>
> Consistency matters more than realism here: **one face, twelve expressions** reads far
> better to an autistic child than twelve different people.

---

## 4. Colouring outlines — 2 new → `assets/Draw/`

`dog draw.png` · `goat draw.png`

> **Already have:** `cat draw.png`, `cow draw.png`, `hen draw.png`.
> Black line art on white, thick clean strokes, closed regions so flood-fill works.
> The brief asks for CAT, DOG, COW, GOAT, HEN — so you are 3 of 5 done already.

---

## 5. Puzzle pieces — 12 files → `assets/new/images/puzzle/`

Activities #3 and #5 need each animal cut into **3 parts** plus a silhouette:

| Animal | Files |
|---|---|
| Cow | `cow-head.png` · `cow-body.png` · `cow-tail.png` · `cow-silhouette.png` |
| Cat | `cat-head.png` · `cat-body.png` · `cat-tail.png` · `cat-silhouette.png` |
| Hen | `hen-head.png` · `hen-body.png` · `hen-tail.png` · `hen-silhouette.png` |

> **Transparent PNG, cut from the same source drawing**, so the pieces line up when
> assembled. The silhouette is that drawing filled flat grey at ~15% opacity.
> The brief limits beginner rounds to 3 parts deliberately — "to avoid visual overload".
> Please do not send 8-piece cuts.

---

## 6. Background — 1 file

`assets/new/images/farm-bg.jpg` — "a simple, calm farm/grassland background" for activity #9.

---

## 7. The song — 1 file, and a caution

The brief links `https://youtu.be/VrzO4oXWcZc` to be played alongside Module 1.

**This cannot be embedded.** The wall runs offline, so YouTube will not load; and
downloading YouTube audio to redistribute inside an installer breaches YouTube's terms
regardless of the video's own licence.

**What to send instead:** `assets/new/audio/module1-song.mp3` — either a licensed purchase
of that track, a Creative Commons equivalent, or a recording your own staff make. Tell me
which and I will wire the player.

---

## 8. Grand total

| Type | New files needed |
|---|---|
| Animal photos | 25 |
| Young-one photos *(transparent PNG)* | 8 |
| Home/habitat photos *(transparent PNG)* | 8 |
| Feelings faces | 12 |
| Colouring outlines | 2 |
| Puzzle pieces + silhouettes | 12 |
| Farm background | 1 |
| Animal sounds | 13 |
| Song | 1 |
| **Total** | **82** |

**Nothing here blocks development.** Every activity is being built now against emoji and the
existing assets, and each file you deliver silently upgrades its card.

---

## 9. Not an asset — but it needs your answer

1. **Two Malayalam errors in the brief itself.** Sheep is given as ആട്/ചെമ്മരിയാട് and Goat as
   വെള്ളാട്, but **both are then given the audio label "ആട്"** — so the two cards would speak
   the same word. Sheep should almost certainly be ചെമ്മരിയാട് and goat ആട്. Also #8 lists the
   young of both goat *and* sheep as ആട്ടിൻകുട്ടി; lamb is usually കുഞ്ഞാട്. Please confirm.
2. **Duplicate content.** Brief items #11 (Fruits vs Vegetables) and #12 (Vehicle
   Categorization) are **already built and live** — they are the two games you added at the
   start of this work. I have not rebuilt them. Confirm that is what you expected.
3. **"Parts identification"** appears twice — as a change request to the existing
   `model-cards-2` game and as new activity #4. I am treating #4 as the real spec and
   leaving `model-cards-2` alone. Say if you want the old one retired.
