/**
 * voice-lines.mjs — collect every Malayalam line the wall speaks
 * ══════════════════════════════════════════════════════════════════
 *
 *   node scripts/voice-lines.mjs
 *
 * Writes content/voice/malayalam.json — the list of distinct strings that
 * voice-bake.py renders to MP3. Run it again after baking and it reports
 * coverage and names any clip nothing asks for any more.
 *
 * WHY THIS EXISTS
 *   Every Malayalam line in this app currently goes to the tablet's own
 *   speech engine via tts-engine.js. On a machine with no `ml-IN` voice
 *   installed — which is the normal case on Windows — that means either
 *   silence or an English/Hindi voice mangling Malayalam script. Baking
 *   the lines to MP3 ahead of time removes that dependency completely
 *   and is the only approach that survives the wall being offline.
 *
 * SAFE AND INSTANT
 *   Reads only; writes one JSON file. It never touches an activity.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = join(ROOT, 'content', 'voice', 'malayalam.json');
const CLIP_DIR = join(ROOT, 'assets', 'voice', 'ml');
const OUT_JS   = join(ROOT, 'js', 'voice-manifest.js');

/* Malayalam block. If a string has one of these in it, it is a line. */
const HAS_ML = /[ഀ-ൿ]/;

/* Where spoken Malayalam actually lives in this codebase.
 *
 * Only `ml:` property values are collected, and that is deliberate. Every
 * line the wall speaks reaches WALL.say() as an { en, ml } object — the
 * label/sub/fact/name pairs the activities are built from, or a one-off
 * WALL.say({ ml: '…' }). Nothing else is ever read aloud.
 *
 * An earlier version swept every Malayalam string literal instead. It
 * pulled in 839 "lines" that included button captions, half-sentences
 * waiting to be concatenated with a variable, and the Malayalam-named
 * .wav paths under assets/Audio — none of which a child ever hears.
 * Baking those would have cost render time and shipped audio for text
 * that is never spoken, while making the coverage figure meaningless. */
const QUOTED = /\bml\s*:\s*'([^'\n]*)'/g;

/* Strings that are shown but never spoken. Baking them is harmless but
   pointless, and it makes the coverage number lie. */
const SKIP = [
  /^[\s\d/:.,()–—-]*$/,          // punctuation and numbers only
  /[<>]/,                        // HTML fragments with Malayalam inside them
  /\$\{/,                        // template-literal pieces, not a whole line
  /^\s*[&|]/,                    // CSS/JS operators that caught a stray quote
];

/* Lines longer than this are descriptive prose from the 3D model cards —
   paragraphs a child never hears read aloud. Baking them would add minutes
   of render time and megabytes of audio for nothing. */
const MAX_SPOKEN = 90;

function collect() {
  const files = [];
  for (const dir of ['games', 'js']) {
    const d = join(ROOT, dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (f.endsWith('.html') || f.endsWith('.js')) files.push(join(d, f));
    }
  }

  const lines = new Map();   // text -> Set(file)
  for (const file of files) {
    let src = readFileSync(file, 'utf8');
    // drop the leading banner comment so documentation prose is not collected
    const end = src.indexOf('-->');
    if (end > -1 && end < 9000) src = src.slice(end + 3);

    QUOTED.lastIndex = 0;
    let m;
    while ((m = QUOTED.exec(src))) {
      const text = m[1].trim();
      if (!text || text.length < 2) continue;
      if (!HAS_ML.test(text)) continue;
      if (text.length > MAX_SPOKEN) continue;
      if (SKIP.some((r) => r.test(text))) continue;
      if (!lines.has(text)) lines.set(text, new Set());
      lines.get(text).add(basename(file));
    }
  }
  return lines;
}

/** The filename a line is stored under. Stable, and safe on Windows. */
export function clipName(text) {
  // FNV-1a over the UTF-8 bytes: short, deterministic, no collisions in
  // a corpus this size, and it never depends on the filesystem's opinion
  // of Malayalam filenames.
  const bytes = new TextEncoder().encode(text.normalize('NFC'));
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 'ml_' + h.toString(16).padStart(8, '0') + '.mp3';
}

function main() {
  const lines = collect();
  const sorted = [...lines.keys()].sort((a, b) => a.localeCompare(b, 'ml'));

  const manifest = {};
  for (const t of sorted) manifest[t] = clipName(t);

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  mkdirSync(dirname(OUT_JS), { recursive: true });

  /* The runtime manifest is emitted as a plain script, not JSON. The app
     runs from file:// inside Electron, where fetching a local JSON file is
     an avoidable source of failure; a <script> tag never is. */
  writeFileSync(OUT_JS, [
    '/* GENERATED by scripts/voice-lines.mjs - do not edit.',
    ' * Maps each spoken Malayalam line to its baked clip.',
    ' * Read by js/voice-clips.js. */',
    'window.VOICE_MANIFEST = ' + JSON.stringify(manifest) + ';',
    ''
  ].join('\n'), 'utf8');

  writeFileSync(OUT_JSON, JSON.stringify({
    note: 'Generated by scripts/voice-lines.mjs. Do not edit by hand.',
    voice: 'ai4bharat/indic-parler-tts',
    count: sorted.length,
    lines: sorted,
    manifest
  }, null, 2), 'utf8');

  const chars = sorted.reduce((n, t) => n + t.length, 0);
  console.log(`collected ${sorted.length} distinct Malayalam lines (${chars} characters)`);
  console.log(`  from ${new Set([...lines.values()].flatMap((s) => [...s])).size} files`);
  console.log('  -> content/voice/malayalam.json');
  console.log('  -> js/voice-manifest.js');

  /* coverage, once anything has been baked */
  if (existsSync(CLIP_DIR)) {
    const have = new Set(readdirSync(CLIP_DIR).filter((f) => f.endsWith('.mp3')));
    const want = new Set(Object.values(manifest));
    const missing = [...want].filter((f) => !have.has(f));
    const orphan = [...have].filter((f) => !want.has(f));
    const pct = want.size ? Math.round(((want.size - missing.length) / want.size) * 100) : 0;
    console.log(`\ncoverage: ${want.size - missing.length}/${want.size} clips baked (${pct}%)`);
    if (orphan.length) {
      console.log(`\n${orphan.length} clip(s) nothing asks for any more (reworded lines):`);
      orphan.slice(0, 20).forEach((f) => console.log('  ' + f));
      console.log('  (named, not deleted)');
    }
  } else {
    console.log(`\nnothing baked yet — run scripts/voice-bake.py, see VOICE.md`);
  }

  /* the ten longest, as a sanity check on what got swept up */
  console.log('\nlongest lines collected:');
  [...sorted].sort((a, b) => b.length - a.length).slice(0, 8)
    .forEach((t) => console.log(`  ${String(t.length).padStart(3)}  ${t.slice(0, 58)}`));
}

main();
