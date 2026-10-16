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
import { collect as collectPairs } from './i18n-collect.mjs';

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

/* Files whose { en, ml } pairs are SHOWN but never spoken — the menu's card
   names and the settings panel's labels. Translated (content/i18n), not baked. */
const NOT_SPOKEN = new Set(['settings-panel.js', 'kannada-alphabets.html']);

function collect() {
  const files = [];
  for (const dir of ['games', 'js']) {
    const d = join(ROOT, dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if ((f.endsWith('.html') || f.endsWith('.js')) && !NOT_SPOKEN.has(f)) files.push(join(d, f));
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
export function clipName(text, lang = 'ml') {
  // FNV-1a over the UTF-8 bytes: short, deterministic, no collisions in
  // a corpus this size, and it never depends on the filesystem's opinion
  // of Malayalam filenames.
  const bytes = new TextEncoder().encode(text.normalize('NFC'));
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return lang + '_' + h.toString(16).padStart(8, '0') + '.mp3';
}

function main() {
  const lines = collect();
  const sorted = [...lines.keys()].sort((a, b) => a.localeCompare(b, 'ml'));

  const manifest = {};
  for (const t of sorted) manifest[t] = clipName(t);

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  mkdirSync(dirname(OUT_JS), { recursive: true });

  /* ── the other three languages (universal language setting) ──────────
     What is spoken in Malayalam is what is spoken in every language: each
     Malayalam line is traced back to its English through content/i18n, and
     from there to Hindi and Kannada. A line with no English partner stays
     Malayalam-only and falls back to the device voice elsewhere. */
  const { variants } = collectPairs();
  const mlToEn = {};
  for (const [en, set] of variants) for (const ml of set) if (!mlToEn[ml]) mlToEn[ml] = en;
  const table = (l) => JSON.parse(readFileSync(join(ROOT, 'content', 'i18n', l + '.json'), 'utf8'));
  const TABLES = { hi: table('hi'), kn: table('kn') };
  const OTHER = { en: 'english.json', hi: 'hindi.json', kn: 'kannada.json' };
  const manifests = { ml: manifest };
  for (const [lang, file] of Object.entries(OTHER)) {
    const out = new Set();
    for (const t of sorted) {
      const en = mlToEn[t];
      if (!en) continue;
      const said = lang === 'en' ? en : TABLES[lang][en];
      if (said && said.length <= MAX_SPOKEN) out.add(said.trim());
    }
    const list = [...out].sort();
    const m = {};
    for (const t of list) m[t] = clipName(t, lang);
    manifests[lang] = m;
    writeFileSync(join(ROOT, 'content', 'voice', file), JSON.stringify({
      note: 'Generated by scripts/voice-lines.mjs from malayalam.json + content/i18n. Do not edit by hand.',
      voice: 'ai4bharat/indic-parler-tts', lang, count: list.length, lines: list, manifest: m
    }, null, 2), 'utf8');
    const dir = join(ROOT, 'assets', 'voice', lang);
    const have = existsSync(dir) ? new Set(readdirSync(dir)) : new Set();
    const baked = Object.values(m).filter((f) => have.has(f)).length;
    console.log(`${lang}: ${list.length} lines -> content/voice/${file}  (${baked}/${list.length} baked)`);
  }

  /* The runtime manifest is emitted as a plain script, not JSON. The app
     runs from file:// inside Electron, where fetching a local JSON file is
     an avoidable source of failure; a <script> tag never is.
     VOICE_MANIFEST (Malayalam) is kept for anything still reading it. */
  writeFileSync(OUT_JS, [
    '/* GENERATED by scripts/voice-lines.mjs - do not edit.',
    ' * Maps each spoken line to its baked clip, per language:',
    ' * assets/voice/<lang>/<file>. Read by js/voice-clips.js. */',
    'window.VOICE_MANIFESTS = ' + JSON.stringify(manifests) + ';',
    'window.VOICE_MANIFEST = window.VOICE_MANIFESTS.ml;',
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
