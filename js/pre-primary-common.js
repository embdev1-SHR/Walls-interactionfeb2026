/**
 * Pre-Primary Common Helpers  (v3 — wall edition)
 * ─────────────────────────────────────────────────
 * PP.init()             — inject font + touch rings, wire back & lang via delegation
 * PP.back()             — navigate to ../index.html
 * PP.bindTouch(el,fn)   — dual click+touchend with ghost-click guard
 * PP.param(key)         — read URL query param
 * PP.toolbarHTML()      — ← Menu + 🌐 EN/ML buttons (right-middle of screen)
 * PP.initLangToggle(cb) — wire lang toggle, call cb(isMl) on change
 * PP.modelPlaceholder(container, emoji, label)
 *
 * No confetti, no score popups.
 * Lang toggle lives in the right-middle toolbar.
 */
const PP = (() => {

  /* ── Noto Sans Malayalam ─────────────────────────────────────── */
  function _injectFont() {
    if (document.getElementById('pp-noto-link')) return;
    const link = document.createElement('link');
    link.id   = 'pp-noto-link';
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;700;900&display=swap';
    document.head.appendChild(link);
  }

  /* ── Touch-ring visual feedback ─────────────────────────────── */
  function _injectTouchRing() {
    if (document.getElementById('pp-ring-style')) return;
    const s = document.createElement('style');
    s.id = 'pp-ring-style';
    s.textContent = `
      @keyframes ppRingPop{
        0%  { transform:translate(-50%,-50%) scale(0);   opacity:1 }
        100%{ transform:translate(-50%,-50%) scale(2.2); opacity:0 }
      }
      .pp-touch-ring{
        position:fixed;width:64px;height:64px;
        border:3px solid rgba(155,127,219,.55);
        border-radius:50%;pointer-events:none;z-index:9999;
        animation:ppRingPop .45s ease forwards;
      }
      /* Language classes */
      .pp-ml { display:none; font-family:'Noto Sans Malayalam','Nunito',sans-serif }
      body.pp-ml-mode .pp-en { display:none }
      body.pp-ml-mode .pp-ml { display:inline }
    `;
    document.head.appendChild(s);

    document.addEventListener('touchstart', e => {
      for (const t of e.changedTouches) {
        const ring = document.createElement('div');
        ring.className = 'pp-touch-ring';
        ring.style.left = t.clientX + 'px';
        ring.style.top  = t.clientY + 'px';
        document.body.appendChild(ring);
        ring.addEventListener('animationend', () => ring.remove());
      }
    }, { passive: true });
  }

  /* ── Back navigation ─────────────────────────────────────────── */
  function back() {
    if (window.location.pathname.includes('/games/')) {
      window.location.href = '../index.html';
    } else {
      window.location.href = 'index.html';
    }
  }

  /* ── Back button via event delegation ───────────────────────── */
  function _wireBackDelegation() {
    document.addEventListener('click', e => {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      if (e.target.closest('#pp-back')) back();
    });
    document.addEventListener('touchend', e => {
      if (e.target.closest('#pp-back')) { e.preventDefault(); back(); }
    }, { passive: false });
  }

  /* ── Language toggle ─────────────────────────────────────────── */
  let _isMl   = false;
  let _langCb = null;

  function _wireLangDelegation() {
    document.addEventListener('click', e => {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      if (e.target.closest('#pp-lang')) _doLangToggle();
    });
    document.addEventListener('touchend', e => {
      if (e.target.closest('#pp-lang')) { e.preventDefault(); _doLangToggle(); }
    }, { passive: false });
  }

  function _doLangToggle() {
    _isMl = !_isMl;
    document.body.classList.toggle('pp-ml-mode', _isMl);
    const btn = document.getElementById('pp-lang');
    if (btn) btn.textContent = _isMl ? '🌐 ML' : '🌐 EN';
    if (_langCb) _langCb(_isMl);
  }

  function initLangToggle(cb) {
    _langCb = cb;
    return { isMl: () => _isMl };
  }

  /* ── URL query param ─────────────────────────────────────────── */
  function param(key) {
    return new URLSearchParams(window.location.search).get(key) || '';
  }

  /* ── Bind click + touchend (ghost-click guard) ───────────────── */
  function bindTouch(el, fn) {
    if (!el) return;
    el.addEventListener('click', e => {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      fn(e);
    });
    el.addEventListener('touchend', e => {
      e.preventDefault();
      fn(e);
    });
  }

  /* ── Toolbar HTML — right-middle, Menu + Lang ────────────────── */
  function toolbarHTML() {
    if (window !== window.top) return '';  // hidden inside iframes
    return `
    <div id="pp-toolbar" style="
      position:fixed;right:14px;top:50%;transform:translateY(-50%);
      z-index:500;display:flex;flex-direction:column;gap:8px;align-items:stretch;">
      <button id="pp-back" style="
        padding:10px 18px;border-radius:20px;border:2px solid #9B7FDB;
        background:linear-gradient(135deg,#E8D5FF,#C8A8FF);
        color:#4A235A;font-weight:900;font-size:clamp(13px,1.8vw,16px);
        cursor:pointer;font-family:inherit;white-space:nowrap;
        box-shadow:0 3px 10px rgba(155,127,219,.3);
        transition:all .2s;">← Menu</button>
      <button id="pp-lang" style="
        padding:8px 14px;border-radius:20px;border:2px solid #9B7FDB;
        background:rgba(255,255,255,.5);backdrop-filter:blur(6px);
        color:#4A235A;font-weight:900;font-size:clamp(11px,1.5vw,14px);
        cursor:pointer;font-family:inherit;
        box-shadow:0 3px 10px rgba(155,127,219,.2);
        transition:all .2s;">🌐 EN</button>
    </div>`;
  }

  /* ── Model placeholder cube ──────────────────────────────────── */
  function modelPlaceholder(container, emoji, label) {
    if (!document.getElementById('pp-cube-style')) {
      const s = document.createElement('style');
      s.id = 'pp-cube-style';
      s.textContent = `
        .pp-model-placeholder{display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:12px;height:100%;width:100%}
        .pp-cube-emoji{font-size:clamp(64px,12vw,120px);
          animation:ppCubeSpin 4s linear infinite;
          filter:drop-shadow(0 8px 16px rgba(0,0,0,.25))}
        @keyframes ppCubeSpin{
          0%  {transform:rotateY(0deg)   rotateX(0deg)   scale(1)}
          50% {transform:rotateY(180deg) rotateX(8deg)   scale(1.04)}
          100%{transform:rotateY(360deg) rotateX(0deg)   scale(1)}}
        .pp-cube-label{font-size:clamp(14px,2vw,22px);font-weight:700;
          color:#4A235A;text-align:center;font-family:'Nunito','Segoe UI',sans-serif}
      `;
      document.head.appendChild(s);
    }
    const wrap = document.createElement('div');
    wrap.className = 'pp-model-placeholder';
    wrap.innerHTML = `<div class="pp-cube-emoji">${emoji}</div>
                      <div class="pp-cube-label">${label}</div>`;
    container.appendChild(wrap);
  }

  /* ── No-op stubs kept for any leftover calls ─────────────────── */
  function confetti()  {}
  function scorePopup(){}

  /* ── Main init ────────────────────────────────────────────────── */
  function init() {
    _injectFont();
    _injectTouchRing();
    _wireBackDelegation();
    _wireLangDelegation();
  }

  return {
    init,
    back,
    bindTouch,
    param,
    toolbarHTML,
    initLangToggle,
    modelPlaceholder,
    confetti,
    scorePopup
  };
})();
