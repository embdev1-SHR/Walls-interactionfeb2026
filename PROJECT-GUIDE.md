# Project Guide — Auticare Blueroom Interactive Wall

A plain-English tour of what this is and where every setting lives.

---

## 1. What this project is

An **offline Electron desktop app** that drives a large touch-sensitive wall at the
Pangappara Blueroom, a centre for autistic children. It is a launcher plus **84 activities** —
each one a self-contained HTML page — grouped into learning modules and played by children
standing at the wall, with a teacher adjusting size and height for each child.

It is not a website. It installs as a Windows app, runs full-screen with no window frame, and
**must work with no internet**.

```
login.html  ──►  index.html  ──►  games/<activity>.html
(licence +      (the menu,       (one file = one activity)
 session mode)   84 cards)
```

### Design rules the whole project follows

These come from the Pangappara briefs and are non-negotiable:

| Rule | Why |
|---|---|
| **Malayalam first, English underneath** | It is the children's language. English is the secondary line. |
| **Extra-large by default** | Children with visual-tracking and fine-motor delays need big targets. |
| **Never punish a wrong answer** | No buzzers, no red X, no stressful sound. A wrong tap gets a soft yellow glow and a gentle wiggle — nothing else. The briefs state this three separate times. |
| **Nothing breaks when an asset is missing** | Every image falls back to an emoji, every sound to a synthesized cue. |
| **Teacher controls on every page** | Size and height, because children are different heights. |

---

## 2. Running it

```bash
npm start        # launches the app
npm run build    # builds the Windows installer into release/
```

There is no dev server and no build step for the activities — they are plain HTML files.
Edit one, relaunch, done.

> `npm install` is **not** normally needed; `node_modules/` is committed-adjacent and complete
> (electron, three, electron-builder).

---

## 3. Where every setting lives

### 3.1 The window — `main.js`

| Setting | Value | Meaning |
|---|---|---|
| `width` / `height` | 1920 × 1080 | nominal size |
| `fullscreen` | `true` | kiosk-style |
| `frame` | `false` | no title bar or close button |
| `backgroundColor` | `#000000` | prevents a white flash on launch |
| `nodeIntegration` | `true` | pages can `require()` — the licence manager needs it |
| `contextIsolation` | `false` | same reason |
| `webSecurity` | `false` | allows `file://` pages to load local media freely |
| `preload` | `js/blueroom-monitor.js` | runs on **every** page to capture touches and session heartbeats |
| entry point | `login.html` | the licence + session gate, **not** the menu |

### 3.2 Server & integration — `js/auticare-config.js`

One object, `AuticareConfig`:

- **`BASE_URL`** — `https://api.myauticare.com`
- **`ENDPOINTS`** — the API paths. Only `centerAuth` is a real documented endpoint; the rest are
  marked PLACEHOLDER in the file and need confirming server-side.
- **`MULTIPLAYER_GAMES`** — a list of activity keys.
  ⚠️ **This list currently does nothing.** It feeds `Session.isMultiplayerGame()`, which nothing
  calls. Adding a key here has no effect today.

### 3.3 Session modes — `js/session.js`

Stored in `localStorage` under **`auticareSession`**:

```js
{ mode: 'guest' | 'online', submode: 'class' | 'individual',
  token, center, classId, studentId, ... }
```

- **Guest** — fully offline, nothing recorded.
- **Online / Class** — activity logged against the class.
- **Online / Individual** — activity logged against one named student.

⚠️ **`Session.isGameAllowed()` returns `true` unconditionally.** All activities are visible in
every mode. The mode governs *how activity is recorded*, not what is shown.

### 3.4 Teacher controls — `js/wall-common.js`

The ☰ button on the right edge of every new activity. Tunables at the top of the file:

| Setting | Default | Notes |
|---|---|---|
| `SIZE_STEPS` | `[0.75, 0.88, 1.0, 1.15, 1.35, 1.6]` | the ➕ / ➖ zoom steps |
| starting step | index `2` (= 1.0) | |
| `HEIGHT_STEP` | `34` px | one ⬆ / ⬇ press |
| `HEIGHT_MAX` | `120` px | travel limit each way |
| `ml` | `true` | **Malayalam is the default language** |
| `voice` | `true` | speech on by default, where an activity uses it |

Every label in the toolbar follows the 🌐 ML/EN toggle. Size is exposed to CSS as
`var(--wall-scale)`, which is why activities scale as one piece.

### 3.5 Background music — `js/audio-manager.js`

One lookup table, `audioMap`. **The key is the filename** — `getPageName()` reads it from the
URL — so the rule is:

> activity key === HTML filename === `audioMap` key

```js
'pri-houses': 'Daily life scenarios',   // plays assets/Audio/Daily life scenarios.mp3
```

An activity that manages its own audio simply **does not include `audio-manager.js`**
(`vehicles.html` and the six Birthday modules do this deliberately).

### 3.6 The menu — `js/game-loader.js` + `index.html`

`CATEGORIES` defines the 11 modules and their entries:

```js
'primary': {
  title: 'Primary', titleMl: 'പ്രൈമറി',
  options: [ { name: 'Types of Houses', ml: '🏠 വീടുകളുടെ തരങ്ങൾ', game: 'pri-houses' } ]
}
```

`ml` is optional — entries without it render English-only (the older categories do this).

### 3.7 Per-child data — `localStorage`

| Key | Holds |
|---|---|
| `auticareSession` | the current session mode |
| `auticareWallNames` | the class name list (My Name / Build My Name share it) |
| `auticareNameRecordings` | teacher voice recordings, keyed by name |
| `fishHighScore`, `butterflyHighScore` | old per-game scores |

---

## 4. Adding a new activity

Four edits. **Nothing is auto-discovered.**

1. `games/<key>.html` — the activity itself
2. `js/game-loader.js` → `CATEGORIES` — the menu entry
3. `js/game-loader.js` → `loadGame()` switch — the route
4. `js/audio-manager.js` → `audioMap` — background music *(skip if self-managed)*

A top-level module also needs a `.game-card` in `index.html`.

Packaging needs **no** change — `package.json` `build.files` globs `games/**`, `js/**`,
`assets/**`, `3dmodels/**`.

---

## 5. The shared building blocks

Most activities are thin data files on top of these:

| File | Does |
|---|---|
| `wall-common.js` | Teacher toolbar, language, synthesized sound effects, confetti, celebration |
| `flashcard-deck.js` | The tap → green glow → bounce → star → celebrate board. Powers ~15 activities |
| `model-popup.js` | 3D viewer with drag-to-spin and a guided tour (local three.js) |
| `icon-sprite.js` | 17 vector traffic signs, daily-life symbols and phone icons |
| `currency-svg.js` | Draws Indian coins and notes procedurally — no photos needed |
| `animal-data.js`, `flower-data.js` | Shared item lists so one fix lands everywhere |
| `birthday-common.js` | Synthesized Happy Birthday + the party sound effects |
| `tts-engine.js` | Malayalam / English speech, picks the best installed voice |

---

## 6. Things worth knowing before you change anything

- **Offline is a hard requirement.** Google Fonts degrade gracefully; `model-viewer` from a CDN
  does **not** — it silently never defines its element, so the popup opens empty. New 3D work
  should use `js/model-popup.js`, which runs on the locally vendored three.js.
  *(The older `vehicles.html` still uses the CDN and so its 3D does not work offline.)*
- **Malayalam speech needs an `ml-IN` voice installed on the wall machine.** On-screen Malayalam
  is unaffected. Nothing may depend on speech having been heard.
- **Malayalam speech no longer depends on an installed `ml-IN` voice** once the clips are
  baked. See `VOICE.md`. Until then it falls back to the device voice as before.
- **All Malayalam is currently unproofed.** It was transcribed from PDFs with encoding damage
  and has not been checked by a native speaker. Strings sit in clearly-marked `{ en, ml }` pairs
  near the top of each file.
- **`release.zip` is 734 MB and untracked.** Don't commit it.

---

## 7. The other docs

| File | For |
|---|---|
| `ASSET-LIST.md` | Assets needed for the Primary + Secondary modules |
| `ASSET-LIST-PREPRIMARY.md` | Assets needed for Pre-Primary Module 2 |
| `DEV-DOC-additional-content.md` | How the Primary/Secondary build was planned |
| `VOICE.md` | The baked Malayalam voice: how to render and how it plays |
| `README.md`, `QUICKSTART.md` | The original project notes |
