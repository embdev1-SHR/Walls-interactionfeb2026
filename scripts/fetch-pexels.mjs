/**
 * fetch-pexels.mjs — real photographs for the wall, fetched once at build time
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     node --env-file=.env.local scripts/fetch-pexels.mjs          # fetch what is missing
 *     node --env-file=.env.local scripts/fetch-pexels.mjs cow hen  # re-pick named ones
 *     node scripts/fetch-pexels.mjs --list                         # what is still missing
 *
 * Needs `PEXELS_API_KEY` in `.env.local` — free, from https://www.pexels.com/api/
 *
 * ──────────────────────────────────────────────────────────────────────────
 * THIS IS A BUILD STEP, NOT A RUNTIME ONE
 *
 * The wall runs with no internet. A Pexels call from inside an activity would
 * work on a developer's laptop and fail silently on the wall, which is the
 * worst of both worlds. So the photos are downloaded once, committed, and
 * shipped inside the installer — the same reasoning as the baked Malayalam
 * voice in VOICE.md.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHAT IS *NOT* FETCHED
 *
 * Only things a photograph genuinely helps with: animals, plants, flowers,
 * people, places, household objects. Everything else in this app is already
 * drawn and should stay drawn —
 *
 *   traffic signals, the 9 daily-life signs, phone icons  js/icon-sprite.js
 *   Indian coins and notes                                js/currency-svg.js
 *   the bouquet vase, the house exterior, the phone body  CSS
 *
 * A photograph of a NO ENTRY sign is worse than the vector: it comes with a
 * street behind it, a shadow, an angle. The vector is the sign.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * THE QUERIES ARE TUNED FOR INDIA, DELIBERATELY
 *
 * The Pangappara brief is explicit that children must recognise what they
 * actually meet: an Indie Tabby cat, an Indie Pariah dog, a Desi cow, a Kerala
 * house. A stock Holstein and a Persian cat defeat the entire point of the
 * change request. Hence "indian cow" rather than "cow".
 *
 * ──────────────────────────────────────────────────────────────────────────
 * CHOOSING, AND OVERRIDING
 *
 * The first square-ish result whose description names the subject. A file
 * already on disk is never replaced unless it is named on the command line —
 * so anyone can drop a better picture in and it stays.
 *
 * CREDIT: the Pexels licence needs no attribution, but their API guidelines
 * ask for the photographer where possible. `assets/new/images/credits.json`
 * records who took each one.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'assets', 'new', 'images');
const CREDITS = join(IMG, 'credits.json');

/**
 * target path (under assets/new/images/) -> Pexels search
 *
 * Keys are exactly what the activities ask for, so a delivered file appears
 * with no code change. Keep this list in step with ASSET-LIST*.md.
 */
const QUERIES = {
  /* ── animals: the flashcard set, the quiz distractors, the sorting set ── */
  'animals/cat.jpg':            'indian street cat tabby',
  'animals/cow.jpg':            'indian desi cow',
  'animals/hen.jpg':            'hen chicken standing',
  'animals/rooster.jpg':        'rooster crowing',
  'animals/colourful-hen.jpg':  'colourful hen feathers',
  'animals/sheep.jpg':          'sheep standing close',
  'animals/goat.jpg':           'goat standing',
  'animals/horse.jpg':          'brown horse portrait',
  'animals/duck.jpg':           'duck on water',
  'animals/pig.jpg':            'pig farm',
  'animals/tiger.jpg':          'bengal tiger',
  'animals/snake.jpg':          'snake indian',
  'animals/bear.jpg':           'bear portrait',
  'animals/frog.jpg':           'green frog',
  'animals/spider.jpg':         'spider web',
  'animals/turtle.jpg':         'turtle tortoise',
  'animals/bird.jpg':           'house sparrow bird',

  /* ── young ones ── */
  'animals/calf.jpg':     'calf baby cow',
  'animals/chick.jpg':    'baby chick',
  'animals/puppy.jpg':    'puppy indian street dog',
  'animals/kitten.jpg':   'kitten',
  'animals/kid-goat.jpg': 'baby goat kid',
  'animals/foal.jpg':     'foal baby horse',
  'animals/duckling.jpg': 'duckling',
  'animals/lamb.jpg':     'lamb baby sheep',

  /* ── animal homes ── */
  'homes/coop.jpg':        'chicken coop',
  'homes/cow-shed.jpg':    'cow shed barn',
  'homes/kennel.jpg':      'dog kennel house',
  'homes/goat-shed.jpg':   'goat shed pen',
  'homes/cat-basket.jpg':  'cat basket bed',
  'homes/stable.jpg':      'horse stable',
  'homes/pond.jpg':        'village pond',
  'homes/sheep-pen.jpg':   'sheep pen fence',

  /* ── Kerala flowers ── */
  'flowers/rose.jpg':        'red rose flower',
  'flowers/mulla.jpg':       'jasmine flower white',
  'flowers/jamanti.jpg':     'marigold flower',
  'flowers/lotus.jpg':       'pink lotus flower',
  'flowers/kanikonna.jpg':   'golden shower cassia fistula flower',
  'flowers/chembarathi.jpg': 'red hibiscus flower',
  'flowers/pichi.jpg':       'small white jasmine flower',

  /* ── first aid ── */
  'first-aid/box-closed.jpg': 'first aid kit box',
  'first-aid/bandage.jpg':    'adhesive bandage',
  'first-aid/scissors.jpg':   'scissors white background',
  'first-aid/antiseptic.jpg': 'antiseptic bottle',
  'first-aid/cotton.jpg':     'cotton wool',
  'first-aid/gauze.jpg':      'gauze roll bandage',

  /* ── body parts ── */
  'body/eyes.jpg':  'child eyes close up',
  'body/ears.jpg':  'human ear close up',
  'body/nose.jpg':  'nose smelling flower',
  'body/hands.jpg': 'child hands holding',
  'body/legs.jpg':  'child legs walking',

  /* ── plant parts ── */
  'plant/flower.jpg': 'single flower bloom',
  'plant/leaf.jpg':   'green leaf close up',
  'plant/stem.jpg':   'plant stem stalk',
  'plant/fruit.jpg':  'fruit on tree',
  'plant/roots.jpg':  'plant roots soil',

  /* ── helpers ── */
  'helpers/teacher.jpg':    'indian teacher classroom',
  'helpers/doctor.jpg':     'indian doctor',
  'helpers/postman.jpg':    'postman delivering mail',
  'helpers/police.jpg':     'indian police officer',
  'helpers/farmer.jpg':     'indian farmer field',
  'helpers/shopkeeper.jpg': 'indian shopkeeper shop',

  /* ── public places ── */
  'places/park.jpg':            'children park playground',
  'places/beach.jpg':           'kerala beach',
  'places/bus-stand.jpg':       'indian bus stand',
  'places/hospital.jpg':        'hospital building',
  'places/railway-station.jpg': 'indian railway station',

  /* ── good habits ── */
  'habits/brush.jpg':        'child brushing teeth',
  'habits/wash-hands.jpg':   'washing hands soap',
  'habits/bath.jpg':         'shower bathing',
  'habits/healthy-food.jpg': 'fruits vegetables healthy',
  'habits/dustbin.jpg':      'dustbin trash can',

  /* ── appliances ── */
  'appliances/washing-machine.jpg': 'washing machine',
  'appliances/iron.jpg':            'clothes iron',
  'appliances/mixer.jpg':           'mixer grinder blender',

  /* ── houses ── */
  'houses/mud-house.jpg':    'kerala traditional hut thatched roof',
  'houses/apartment.jpg':    'apartment building india',
  'houses/bungalow.jpg':     'kerala house bungalow',
  'houses/modern-house.jpg': 'modern house glass windows',
  'houses/tent.jpg':         'camping tent',

  /* ── rooms (landscape, they are full-screen backdrops) ── */
  'rooms/dining.jpg':  'dining room table',
  'rooms/bedroom.jpg': 'bedroom bed',
  'rooms/bathroom.jpg': 'bathroom shower',

  /* ── Kerala instruments ── */
  'instruments/chenda.jpg':   'chenda kerala drum',
  'instruments/maddalam.jpg': 'maddalam kerala drum',
  'instruments/chengila.jpg': 'bronze gong',
  'instruments/kaimani.jpg':  'brass hand bells',

  /* ── background ── */
  'farm-bg.jpg': 'green grass farm field',

  /* DELIBERATELY ABSENT — letters/{elephant,fish,rabbit}.png
   *
   * The Aksharachithram figures are the one thing here a photograph cannot
   * be. Each is a line drawing whose body IS the Malayalam letter — the
   * elephant's back is ത, the fish's loop is ര, the rabbit's face is മ —
   * and the brief contains the hand-drawn references. A photo of an
   * elephant is not that, at any resolution. They stay commissioned art;
   * until they arrive the activity shows a soft emoji silhouette. */
};

/* Rooms are backdrops, not cards: they want landscape, not square. */
const LANDSCAPE = new Set(['rooms/dining.jpg', 'rooms/bedroom.jpg',
                           'rooms/bathroom.jpg', 'farm-bg.jpg']);

const args = process.argv.slice(2);
const listOnly = args.includes('--list');
const named = args.filter((a) => !a.startsWith('--'));

function missing() {
  return Object.keys(QUERIES).filter((p) => !existsSync(join(IMG, p)));
}

async function main() {
  if (listOnly) {
    const m = missing();
    console.log(`${Object.keys(QUERIES).length} photo slots, ${m.length} still missing:\n`);
    m.forEach((p) => console.log('  ' + p));
    console.log(`\n${Object.keys(QUERIES).length - m.length} present.`);
    return;
  }

  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.error(
      '\n  PEXELS_API_KEY is not set.\n\n' +
      '  Put it in .env.local at the repo root:\n\n' +
      '      PEXELS_API_KEY=your-key-here\n\n' +
      '  then run:  node --env-file=.env.local scripts/fetch-pexels.mjs\n\n' +
      '  A free key comes from https://www.pexels.com/api/\n' +
      '  (Run with --list to see what is missing without a key.)\n'
    );
    process.exit(1);
  }

  /* Named targets are re-picked even if present; otherwise only gaps. */
  const targets = named.length
    ? Object.keys(QUERIES).filter((p) => named.some((n) => p.includes(n)))
    : missing();

  if (!targets.length) {
    console.log('nothing to fetch — every photo slot is filled');
    return;
  }

  const credits = existsSync(CREDITS)
    ? JSON.parse(readFileSync(CREDITS, 'utf8'))
    : {};

  console.log(`fetching ${targets.length} photo(s)\n`);
  let ok = 0;

  for (const path of targets) {
    const query = QUERIES[path];
    const orient = LANDSCAPE.has(path) ? 'landscape' : 'square';
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
                `&per_page=15&orientation=${orient}`;
    try {
      const res = await fetch(url, { headers: { Authorization: key } });
      if (!res.ok) { console.log(`  FAIL ${path} — HTTP ${res.status}`); continue; }
      const json = await res.json();
      const photos = json.photos || [];
      if (!photos.length) { console.log(`  none  ${path} — no result for "${query}"`); continue; }

      /* Prefer a result whose alt text actually names the subject. */
      const word = path.split('/').pop().replace('.jpg', '').split('-')[0];
      const pick = photos.find((p) => (p.alt || '').toLowerCase().includes(word)) || photos[0];

      /* Pexels serves the original format, so a handful of these come back as
         PNG behind a .jpg URL. Nothing breaks — browsers sniff the bytes — but
         a PNG photo is ~2.5 MB against ~250 KB for the same image as JPEG, and
         this ships inside a Windows installer. `fm=jpg` asks their CDN to
         convert, which costs nothing and keeps the extension honest. */
      const src = pick.src.large2x || pick.src.large;
      const bin = await fetch(src + (src.includes('?') ? '&' : '?') + 'fm=jpg');
      const buf = Buffer.from(await bin.arrayBuffer());
      const out = join(IMG, path);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, buf);

      credits[path] = { photographer: pick.photographer, url: pick.url, query };
      ok++;
      console.log(`  ok    ${path.padEnd(34)} ${pick.photographer}`);
    } catch (e) {
      console.log(`  FAIL  ${path} — ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));   // be polite to the API
  }

  mkdirSync(IMG, { recursive: true });
  writeFileSync(CREDITS, JSON.stringify(credits, null, 2), 'utf8');
  console.log(`\n${ok}/${targets.length} fetched. Credits -> assets/new/images/credits.json`);
  console.log('Photos are committed and shipped; the wall never calls Pexels.');
}

main();
