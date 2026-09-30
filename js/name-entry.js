/**
 * name-entry.js — the on-screen keyboard for the class name list
 * ══════════════════════════════════════════════════════════════════
 *
 * Staff need to put the real children's names into the wall, and the wall
 * has no keyboard. This is that keyboard: a full-screen panel with the
 * current list, an A-Z pad, and add/remove.
 *
 * It reads and writes WALL.names() / WALL.setNames(), which is the list
 * sec-name-build and sec-name-id already share, so a name typed once
 * appears in both.
 *
 * FOR STAFF, NOT CHILDREN. That is why it is plain, dense and unanimated
 * where the activities are none of those things: it is opened from the
 * teacher's toolbar, used for a minute at the start of term, and closed.
 * Making it playful would invite a child to open it and delete the list.
 *
 * Names are stored uppercase because every activity that consumes them
 * lays them out as letter tiles, and mixed case would give a child two
 * different-looking tiles for the same letter.
 */
(function (global) {
  'use strict';

  var MAX = 24;          // a class list, not a database
  var MAXLEN = 12;       // longest name that still fits as letter tiles

  function injectCSS() {
    if (document.getElementById('ne-css')) return;
    var st = document.createElement('style');
    st.id = 'ne-css';
    st.textContent = [
      '.ne-wrap{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;',
      '  align-items:center;gap:1.4vh;padding:2.4vh 2vw;background:rgba(246,248,252,.985);',
      '  font-family:"Baloo 2",system-ui,sans-serif;overflow:auto}',
      '.ne-h{font-weight:800;font-size:clamp(16px,2.6vw,26px);color:#1e293b}',
      '.ne-sub{font-size:clamp(11px,1.5vw,15px);color:#64748b;margin-top:-1vh}',
      '.ne-list{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:1000px}',
      '.ne-name{display:flex;align-items:center;gap:7px;background:#fff;border:2px solid #cbd5e1;',
      '  border-radius:10px;padding:5px 9px;font-weight:700;font-size:clamp(12px,1.7vw,17px);color:#1e293b}',
      '.ne-x{background:#ef4444;color:#fff;border:0;border-radius:6px;width:20px;height:20px;',
      '  font-weight:800;cursor:pointer;line-height:1}',
      '.ne-in{font-weight:900;letter-spacing:.16em;font-size:clamp(19px,3.4vw,34px);color:#2563eb;',
      '  background:#fff;border:3px solid #93c5fd;border-radius:12px;padding:5px 20px;',
      '  min-width:min(440px,74vw);min-height:1.5em;text-align:center}',
      '.ne-pad{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-width:880px}',
      '.ne-k{width:clamp(34px,4.6vw,54px);height:clamp(34px,4.6vw,50px);border-radius:9px;',
      '  border:2px solid #cbd5e1;background:#fff;font-weight:800;font-size:clamp(13px,1.9vw,20px);',
      '  color:#1e293b;cursor:pointer}',
      '.ne-k:active{transform:translateY(2px)}',
      '.ne-row{display:flex;gap:9px;flex-wrap:wrap;justify-content:center}',
      '.ne-b{border:0;border-radius:11px;padding:9px 22px;font-weight:800;cursor:pointer;',
      '  font-size:clamp(13px,1.8vw,18px);font-family:inherit}',
      '.ne-add{background:#2563eb;color:#fff}.ne-del{background:#e2e8f0;color:#334155}',
      '.ne-done{background:#16a34a;color:#fff}'
    ].join('');
    document.head.appendChild(st);
  }

  function open(opts) {
    opts = opts || {};
    injectCSS();
    var list = (global.WALL && WALL.names() || []).slice();
    var typed = '';

    var wrap = document.createElement('div');
    wrap.className = 'ne-wrap';
    wrap.innerHTML =
      '<div class="ne-h">Class names</div>' +
      '<div class="ne-sub">Type a name, then Add. These appear in the name activities.</div>' +
      '<div class="ne-list"></div>' +
      '<div class="ne-in"></div>' +
      '<div class="ne-pad"></div>' +
      '<div class="ne-row">' +
        '<button class="ne-b ne-del">⌫ Delete</button>' +
        '<button class="ne-b ne-add">+ Add name</button>' +
        '<button class="ne-b ne-done">Done</button>' +
      '</div>';
    document.body.appendChild(wrap);

    var listEl = wrap.querySelector('.ne-list');
    var inEl   = wrap.querySelector('.ne-in');
    var padEl  = wrap.querySelector('.ne-pad');

    function drawList() {
      listEl.innerHTML = '';
      if (!list.length) {
        listEl.innerHTML = '<div class="ne-sub">No names yet.</div>';
        return;
      }
      list.forEach(function (n, i) {
        var d = document.createElement('div');
        d.className = 'ne-name';
        d.textContent = n;
        var x = document.createElement('button');
        x.className = 'ne-x'; x.textContent = '×';
        x.onclick = function () { list.splice(i, 1); drawList(); };
        d.appendChild(x);
        listEl.appendChild(d);
      });
    }

    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (c) {
      var k = document.createElement('button');
      k.className = 'ne-k'; k.textContent = c;
      k.onclick = function () {
        if (typed.length < MAXLEN) { typed += c; inEl.textContent = typed; }
      };
      padEl.appendChild(k);
    });

    wrap.querySelector('.ne-del').onclick = function () {
      typed = typed.slice(0, -1); inEl.textContent = typed;
    };
    wrap.querySelector('.ne-add').onclick = function () {
      var n = typed.trim().toUpperCase();
      /* Silently ignoring a duplicate is better than an error here: staff
         adding the same name twice meant to have it once. */
      if (n && list.indexOf(n) === -1 && list.length < MAX) list.push(n);
      typed = ''; inEl.textContent = '';
      drawList();
    };
    wrap.querySelector('.ne-done').onclick = function () {
      if (global.WALL) WALL.setNames(list);
      wrap.remove();
      if (opts.onSave) opts.onSave(list);
    };

    drawList();
    return wrap;
  }

  /** Adds a Names button to an already-built wall toolbar. */
  function addToToolbar(label, onSave) {
    var body = document.querySelector('#wallToolbar .wall-tb-body');
    if (!body || document.getElementById('wallNames')) return;
    var b = document.createElement('button');
    b.className = 'wall-tb';
    b.id = 'wallNames';
    b.textContent = label || '✏️ Names';
    if (global.WALL) WALL.bindTouch(b, function () { open({ onSave: onSave }); });
    else b.onclick = function () { open({ onSave: onSave }); };
    body.appendChild(b);
  }

  global.NAME_ENTRY = { open: open, addToToolbar: addToToolbar };
})(typeof window !== 'undefined' ? window : globalThis);
