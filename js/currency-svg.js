/**
 * currency-svg.js - procedural Indian currency artwork
 * ================================================================
 * Extracted verbatim from games/money-counter.html so the Secondary
 * "Indian Coins & Currency Notes" board can reuse it. The two
 * functions are unchanged; only their home moved.
 *
 *   coinSVG(val, sz)    val: 1 | 2 | 5 | 10        -> <svg> string
 *   noteSVG(val, w, h)  val: 10|20|50|100|200|500  -> <svg> string
 *
 * Each call mints unique gradient ids, so any number can share one
 * page. No assets, no network - safe for the offline wall build.
 */
(function (global) {
// ═══════════════════════════════
// COIN SVG
// ═══════════════════════════════
function coinSVG(val, sz) {
  sz = sz || 52;
  const r = sz / 2;
  const palettes = {
    1:  { rim:'#999', mid:'#CCC', hi:'#E8E8E8', text:'#555', face:'#DDD' },
    2:  { rim:'#8B6500', mid:'#C4880A', hi:'#E8B830', text:'#3a2200', face:'#D4A020' },
    5:  { rim:'#7A5800', mid:'#B87A00', hi:'#D4A020', text:'#3a2200', face:'#C49010' },
    10: { rim:'#5a4200', mid:'#A08830', hi:'#C8A848', text:'#3a2800', face:'#B89838' }
  };
  const c = palettes[val] || palettes[5];
  const id = 'coin_' + val + '_' + Math.random().toString(36).slice(2,7);
  // edge ticks
  let ticks = '';
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const x1 = (r + Math.cos(a) * (r - 1)).toFixed(1);
    const y1 = (r + Math.sin(a) * (r - 1)).toFixed(1);
    const x2 = (r + Math.cos(a) * (r - 3.5)).toFixed(1);
    const y2 = (r + Math.sin(a) * (r - 3.5)).toFixed(1);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.rim}" stroke-width="0.7" opacity="0.6"/>`;
  }
  const valStr = val === 10 ? '₹10' : (val === 5 ? '₹5' : (val === 2 ? '₹2' : '₹1'));
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cg_${id}" cx="35%" cy="28%" r="70%">
      <stop offset="0%" stop-color="${c.hi}"/>
      <stop offset="40%" stop-color="${c.mid}"/>
      <stop offset="85%" stop-color="${c.rim}"/>
      <stop offset="100%" stop-color="${c.rim}"/>
    </radialGradient>
    <radialGradient id="cs_${id}" cx="28%" cy="22%" r="45%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="cf_${id}"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.45)"/></filter>
  </defs>
  <circle cx="${r}" cy="${r}" r="${r - 0.5}" fill="url(#cg_${id})" filter="url(#cf_${id})"/>
  ${ticks}
  <circle cx="${r}" cy="${r}" r="${r - 5}" fill="none" stroke="${c.rim}" stroke-width="1" opacity="0.4"/>
  <circle cx="${r}" cy="${r}" r="${r - 7}" fill="none" stroke="${c.hi}" stroke-width="0.5" opacity="0.3"/>
  <text x="${r}" y="${r * 0.54}" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-weight="bold" font-size="${sz * 0.115}" fill="${c.text}" opacity="0.65">INDIA</text>
  <text x="${r}" y="${r * 1.05}" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-weight="900" font-size="${sz * 0.28}" fill="${c.text}" opacity="0.88">${valStr}</text>
  <text x="${r}" y="${sz - 4}" text-anchor="middle" dominant-baseline="auto" font-family="serif" font-size="${sz * 0.1}" fill="${c.text}" opacity="0.4">2024</text>
  <circle cx="${r}" cy="${r}" r="${r - 0.5}" fill="url(#cs_${id})"/>
  </svg>`;
}

// ═══════════════════════════════
// REALISTIC NOTE SVG
// ═══════════════════════════════
function noteSVG(val, w, h) {
  w = w || 108; h = h || 56;
  const notes = {
    10:  { c1:'#9c8b00', c2:'#d4bc00', c3:'#f0d800', acc:'#ffe566', lt:'#fffde7', name:'दस', sub:'TEN RUPEES',      ashoka:'#b8a000' },
    20:  { c1:'#7a3e00', c2:'#b05a00', c3:'#d97200', acc:'#ffb347', lt:'#fff3e0', name:'बीस', sub:'TWENTY RUPEES',   ashoka:'#8a4500' },
    50:  { c1:'#00558a', c2:'#0077c2', c3:'#0095f5', acc:'#64b5f6', lt:'#e3f2fd', name:'पचास', sub:'FIFTY RUPEES',   ashoka:'#004d7a' },
    100: { c1:'#1a5c00', c2:'#2e8b00', c3:'#3aac00', acc:'#81c784', lt:'#e8f5e9', name:'सौ', sub:'ONE HUNDRED',      ashoka:'#1a5200' },
    200: { c1:'#8b0000', c2:'#c62828', c3:'#ef5350', acc:'#ffab91', lt:'#fbe9e7', name:'दो सौ', sub:'TWO HUNDRED',   ashoka:'#7a0000' },
    500: { c1:'#3a006f', c2:'#6a1b9a', c3:'#8e24aa', acc:'#ce93d8', lt:'#f3e5f5', name:'पाँच सौ', sub:'FIVE HUNDRED', ashoka:'#4a0080' }
  };
  const d = notes[val] || notes[100];
  const id = 'note_' + val + '_' + Math.random().toString(36).slice(2,7);
  const serial = ['A','B','C','D','E','F','G','H'][Math.floor(Math.random()*8)] +
    ['P','Q','R','S','T'][Math.floor(Math.random()*5)] + ' ' +
    (10+Math.floor(Math.random()*89)) + ' ' +
    String(Math.floor(Math.random()*999999)).padStart(6,'0');

  // horizontal micro-lines (security feature look)
  let hlines = '';
  for (let i = 0; i < 8; i++) {
    hlines += `<line x1="${w*0.72}" y1="${h*(0.18+i*0.08)}" x2="${w*0.96}" y2="${h*(0.18+i*0.08)}" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>`;
  }
  // watermark circles
  const wm = `<circle cx="${w*0.5}" cy="${h*0.5}" r="${h*0.3}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    <circle cx="${w*0.5}" cy="${h*0.5}" r="${h*0.22}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nbg_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${d.c1}"/>
      <stop offset="50%" stop-color="${d.c2}"/>
      <stop offset="100%" stop-color="${d.c3}"/>
    </linearGradient>
    <linearGradient id="nst_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${d.acc}" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="${d.acc}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${d.acc}" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="nhi_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <clipPath id="ncp_${id}"><rect x="1.5" y="1.5" width="${w-3}" height="${h-3}" rx="5"/></clipPath>
    <filter id="nsh_${id}"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="rgba(0,0,0,0.45)"/></filter>
  </defs>
  <!-- Base note -->
  <rect x="1.5" y="1.5" width="${w-3}" height="${h-3}" rx="5" fill="url(#nbg_${id})" filter="url(#nsh_${id})"/>
  <!-- Top & bottom border strips -->
  <rect x="3" y="3" width="${w-6}" height="2.5" rx="1" fill="rgba(255,255,255,0.12)"/>
  <rect x="3" y="${h-5.5}" width="${w-6}" height="2.5" rx="1" fill="rgba(255,255,255,0.12)"/>
  <!-- Highlight overlay -->
  <rect x="1.5" y="1.5" width="${w-3}" height="${(h-3)*0.5}" rx="5" fill="url(#nhi_${id})"/>
  <!-- Watermark -->
  ${wm}
  <!-- Left white section (Ashoka pillar area) -->
  <rect x="1.5" y="1.5" width="${w*0.22}" height="${h-3}" rx="5" fill="${d.lt}" opacity="0.22" clip-path="url(#ncp_${id})"/>
  <!-- Security thread -->
  <rect x="${w*0.235}" y="1.5" width="${w*0.012}" height="${h-3}" fill="url(#nst_${id})" opacity="0.8"/>
  <!-- Ashoka Pillar simplified: stacked circles -->
  <ellipse cx="${w*0.115}" cy="${h*0.32}" rx="${w*0.06}" ry="${h*0.2}" fill="rgba(255,255,255,0.14)"/>
  <ellipse cx="${w*0.115}" cy="${h*0.25}" rx="${w*0.048}" ry="${h*0.13}" fill="rgba(255,255,255,0.16)"/>
  <ellipse cx="${w*0.115}" cy="${h*0.19}" rx="${w*0.036}" ry="${h*0.09}" fill="rgba(255,255,255,0.14)"/>
  <line x1="${w*0.103}" y1="${h*0.12}" x2="${w*0.127}" y2="${h*0.12}" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <line x1="${w*0.107}" y1="${h*0.38}" x2="${w*0.123}" y2="${h*0.38}" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
  <!-- RBI text -->
  <text x="${w*0.28}" y="${h*0.2}" font-family="serif" font-weight="700" font-size="${h*0.13}" fill="${d.lt}" opacity="0.95">भारतीय रिज़र्व बैंक</text>
  <text x="${w*0.28}" y="${h*0.32}" font-family="serif" font-size="${h*0.1}" fill="rgba(255,255,255,0.55)">RESERVE BANK OF INDIA</text>
  <text x="${w*0.28}" y="${h*0.44}" font-family="serif" font-size="${h*0.087}" fill="rgba(255,255,255,0.35)">I promise to pay the bearer</text>
  <text x="${w*0.28}" y="${h*0.54}" font-family="serif" font-size="${h*0.087}" fill="rgba(255,255,255,0.35)">the sum of ${d.sub}</text>
  <!-- Big denomination left -->
  <text x="${w*0.02}" y="${h*0.91}" font-family="'Baloo 2',sans-serif" font-weight="900" font-size="${h*0.48}" fill="rgba(255,255,255,0.97)" dominant-baseline="auto">₹${val}</text>
  <!-- Hindi name right top -->
  <text x="${w*0.97}" y="${h*0.2}" text-anchor="end" font-family="serif" font-weight="700" font-size="${h*0.135}" fill="${d.lt}" opacity="0.95">${d.name} रुपये</text>
  <!-- Denomination right big -->
  <text x="${w*0.97}" y="${h*0.91}" text-anchor="end" font-family="'Baloo 2',sans-serif" font-weight="900" font-size="${h*0.3}" fill="rgba(255,255,255,0.93)" dominant-baseline="auto">₹${val}</text>
  <!-- Gandhi portrait placeholder (stylised oval) -->
  <ellipse cx="${w*0.83}" cy="${h*0.48}" rx="${w*0.08}" ry="${h*0.3}" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.2)" stroke-width="0.7"/>
  <text x="${w*0.83}" y="${h*0.55}" text-anchor="middle" dominant-baseline="middle" font-size="${h*0.25}" fill="rgba(255,255,255,0.45)">🧔</text>
  <!-- Horizontal micro-lines -->
  ${hlines}
  <!-- Serial numbers -->
  <text x="${w*0.03}" y="${h*0.98}" dominant-baseline="auto" font-family="monospace" font-size="${h*0.095}" fill="rgba(255,255,255,0.38)">${serial}</text>
  <text x="${w*0.97}" y="${h*0.98}" text-anchor="end" dominant-baseline="auto" font-family="monospace" font-size="${h*0.095}" fill="rgba(255,255,255,0.38)">${serial}</text>
  <!-- Border lines -->
  <rect x="2" y="2" width="${w-4}" height="${h-4}" rx="4.5" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
  <rect x="4" y="4" width="${w-8}" height="${h-8}" rx="3" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  </svg>`;
}
  global.coinSVG = coinSVG;
  global.noteSVG = noteSVG;
})(typeof window !== 'undefined' ? window : globalThis);
