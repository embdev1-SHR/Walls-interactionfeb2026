/**
 * fetch-commons-clip.mjs — one excerpt of one Wikimedia Commons recording
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/fetch-commons-clip.mjs "<File:Title.ogg>" <out.mp3> [startSec] [lengthSec]
 *
 * Build-time only (the wall is offline). Cuts [start, start+length), fades
 * the ends, matches loudness, writes MP3, and records title / licence / author
 * in credits.json beside the output for the ⓘ credits page — CC BY and
 * CC BY-SA require it.
 */
import { writeFileSync, existsSync, readFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { dirname, join, basename, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const [title, outArg, start = '0', len = '4'] = process.argv.slice(2);
if (!title || !outArg) { console.error('usage: "<File:...>" <out.mp3> [start] [length]'); process.exit(1); }
const out = resolve(outArg);
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = { 'User-Agent': 'AuticareBlueroom/1.7 (offline classroom wall; build-time asset fetch)' };
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const q = await (await fetch(API + '?' + new URLSearchParams({ format: 'json', action: 'query', prop: 'imageinfo',
  titles: title, iiprop: 'url|extmetadata' }), { headers: UA })).json();
const ii = Object.values(q.query.pages)[0].imageinfo?.[0];
if (!ii) { console.error('not found: ' + title); process.exit(1); }
const r = await fetch(ii.url, { headers: UA });
if (!r.ok || /text|html|json/.test(r.headers.get('content-type') || '')) { console.error('download failed ' + r.status); process.exit(1); }
mkdirSync(dirname(out), { recursive: true });
const raw = out + '.src';
writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
const L = Number(len);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', start, '-t', String(L), '-i', raw, '-af',
  `afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, L - 0.4)}:d=0.4,loudnorm=I=-18:TP=-2`,
  '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-qscale:a', '4', out]);
unlinkSync(raw);
const cf = join(dirname(out), 'credits.json');
const credits = existsSync(cf) ? JSON.parse(readFileSync(cf, 'utf8')) : {};
const em = ii.extmetadata || {};
credits[basename(out)] = { file: title, url: ii.descriptionurl, excerpt: `${start}s +${L}s`,
  licence: strip(em.LicenseShortName && em.LicenseShortName.value), author: strip(em.Artist && em.Artist.value) };
writeFileSync(cf, JSON.stringify(credits, null, 2), 'utf8');
console.log(`ok ${basename(out)}  ${credits[basename(out)].licence}  ${title}`);
