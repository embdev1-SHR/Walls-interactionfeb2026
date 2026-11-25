/**
 * fetch-animal-sounds.mjs — real animal recordings from Wikimedia Commons
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/fetch-animal-sounds.mjs --list          # candidates per animal
 *   node scripts/fetch-animal-sounds.mjs                 # fetch the chosen files
 *
 * WHY
 *   js/animal-data.js asks for thirteen sounds under assets/new/audio/animals/
 *   (meow, bark, cluck…) that were never delivered — the folder did not exist —
 *   so every page that played them fell back to a tap blip. Commons has real,
 *   freely licensed recordings of all of them and needs no API key.
 *
 * WHAT IT DOES
 *   Each chosen file is downloaded once (build time; the wall is offline),
 *   cut to its first few seconds with the silence trimmed, loudness-matched,
 *   and written as MP3. Licence and author go to credits.json beside them for
 *   the ⓘ credits page — CC BY / CC BY-SA require it.
 *
 * CHOOSING
 *   CHOSEN names an exact Commons file per sound, picked from --list by title,
 *   licence and length. A file that fails to download is reported, never
 *   silently replaced by a different animal.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'new', 'audio', 'animals');
const CREDITS = join(OUT, 'credits.json');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = { 'User-Agent': 'AuticareBlueroom/1.7 (offline classroom wall; build-time asset fetch)' };

/* output file -> Commons search used by --list */
const SEARCH = {
  'meow.mp3':           'cat meow',
  'bark.mp3':           'dog barking',
  'baah.mp3':           'sheep bleating',
  'bleat.mp3':          'goat bleating',
  'cluck.mp3':          'hen clucking',
  'rooster-crow.mp3':   'rooster crowing',
  'neigh.mp3':          'horse neigh',
  'quack.mp3':          'duck quack',
  'oink.mp3':           'pig grunt',
  'lion-roar.mp3':      'Panthera leo roaring',
  'monkey-chatter.mp3': 'monkey calls',
  'frog-ribbit.mp3':    'Rana frog calls',
  'bird-chirp.mp3':     'Passer domesticus song'
};

/* output file -> exact Commons file title (filled in from --list) */
const CHOSEN = {
  'meow.mp3':           'File:Maullido de gata hembra joven.ogg',            // CC0
  'bark.mp3':           'File:Barking of a dog.ogg',                         // CC BY-SA 3.0
  'baah.mp3':           'File:Sheep bleating.ogg',                           // public domain
  'bleat.mp3':          'File:Herd of goats bleating.ogg',                   // public domain
  'cluck.mp3':          'File:Hen announcing shes lain an egg.ogg',          // public domain
  'rooster-crow.mp3':   'File:Medium rooster crowing.ogg',                   // public domain
  'neigh.mp3':          'File:Wiehern.ogg',                                  // public domain
  'quack.mp3':          'File:Pekin duck & mallard.ogg',                     // CC BY-SA 4.0
  'oink.mp3':           'File:Pig grunt - Erdie.ogg',                        // CC BY 3.0
  'lion-roar.mp3':      'File:Lion raring-sound1TamilNadu178.ogg',           // public domain
  'monkey-chatter.mp3': 'File:Dusky-leaf-monkey-call-kaeng-krachan.ogg',     // CC BY-SA 4.0
  'frog-ribbit.mp3':    'File:Hyla arborea (HS).ogg',                        // CC BY-SA 3.0
  'bird-chirp.mp3':     'File:Passer domesticus - House Sparrow XC108385.mp3' // CC BY-SA 4.0
};

async function api(params) {
  const u = API + '?' + new URLSearchParams(Object.assign({ format: 'json', origin: '*' }, params));
  const r = await fetch(u, { headers: UA });
  return r.json();
}

async function info(titles) {
  const j = await api({ action: 'query', prop: 'imageinfo', titles: titles.join('|'),
                        iiprop: 'url|size|mime|extmetadata|metadata' });
  return Object.values(j.query.pages || {});
}

function strip(html) { return String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function duration(page) {
  const md = (page.imageinfo && page.imageinfo[0].metadata) || [];
  const d = md.find((m) => m.name === 'length' || m.name === 'playtime_seconds');
  return d ? Number(d.value) : null;
}

async function list() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  for (const [out, q] of Object.entries(SEARCH)) {
    if (only.length && !only.includes(out)) continue;
    const s = await api({ action: 'query', list: 'search', srsearch: q + ' filetype:audio',
                          srnamespace: 6, srlimit: 12 });
    const titles = (s.query.search || []).map((x) => x.title);
    console.log(`\n${out}  ("${q}")`);
    if (!titles.length) { console.log('   (nothing)'); continue; }
    for (const p of await info(titles)) {
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii) continue;
      const em = ii.extmetadata || {};
      const lic = strip(em.LicenseShortName && em.LicenseShortName.value);
      const dur = duration(p);
      console.log(`   ${(dur != null ? dur.toFixed(1) + 's' : '  ?  ').padStart(6)}  ${lic.padEnd(14)} ${p.title}`);
    }
    await new Promise((r) => setTimeout(r, 2500));   // Commons rate-limits quick bursts
  }
}

async function fetchChosen() {
  mkdirSync(OUT, { recursive: true });
  const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {};
  for (const [out, title] of Object.entries(CHOSEN)) {
    if (existsSync(join(OUT, out)) && credits[out] && !process.argv.includes('--force')) continue;
    await new Promise((r) => setTimeout(r, 4000));   // Commons rate-limits quick bursts
    const [p] = await info([title]);
    const ii = p && p.imageinfo && p.imageinfo[0];
    if (!ii) { console.log(`  FAIL ${out} — ${title} not found`); continue; }
    const em = ii.extmetadata || {};
    const raw = join(OUT, out + '.src');
    const r = await fetch(ii.url, { headers: UA });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || /text|html|json/.test(type)) { console.log(`  FAIL ${out} — HTTP ${r.status} ${type} (rate-limited? run again)`); continue; }
    writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    /* first sound only: drop leading silence, keep at most 3.5 s, fade out,
       and bring every animal to the same loudness */
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af',
      'silenceremove=start_periods=1:start_threshold=-40dB,atrim=0:3.5,afade=t=out:st=3.1:d=0.4,loudnorm=I=-18:TP=-2',
      '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-qscale:a', '4', join(OUT, out)]);
    unlinkSync(raw);
    credits[out] = {
      file: title, url: ii.descriptionurl,
      licence: strip(em.LicenseShortName && em.LicenseShortName.value),
      author: strip(em.Artist && em.Artist.value)
    };
    console.log(`  ok   ${out.padEnd(20)} ${credits[out].licence.padEnd(12)} ${title}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  writeFileSync(CREDITS, JSON.stringify(credits, null, 2), 'utf8');
}

(process.argv.includes('--list') ? list : fetchChosen)().catch((e) => { console.error(e.message); process.exit(1); });
