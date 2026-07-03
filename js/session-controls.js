/* ============================================================
   Session Controls — floating in-menu widget.
   Shown on the main menu (index.html). Lets the operator:
     • switch the active student (individual mode) without a full
       re-login — ends the current session (→ report) and starts
       a fresh one for the new student.
     • exit back to the login menu (mode / guest / department).
   Depends on Session + AuticareAPI (loaded on index.html).
   ============================================================ */
(function () {
  if (typeof Session === 'undefined') return;
  var s = Session.get();
  if (!s) return; // gate will already redirect

  var isIndividual = s.mode === 'online' && s.submode === 'individual';
  var isOnline = s.mode === 'online';

  function newSessionId() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 's-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  // ---- styles ----
  var style = document.createElement('style');
  style.textContent = [
    '#brm-ctrl{position:fixed;top:16px;right:16px;z-index:99999;font-family:"Nunito","Segoe UI",sans-serif}',
    '#brm-ctrl .brm-btn{display:flex;align-items:center;gap:8px;background:rgba(85,110,230,.95);color:#fff;',
    'border:none;border-radius:14px;padding:10px 14px;font-weight:800;font-size:13px;cursor:pointer;',
    'box-shadow:0 6px 18px rgba(0,0,0,.25)}',
    '#brm-ctrl .brm-panel{margin-top:8px;background:#fff;color:#1e293b;border-radius:16px;padding:14px;',
    'width:280px;box-shadow:0 18px 50px rgba(0,0,0,.35);display:none}',
    '#brm-ctrl.open .brm-panel{display:block}',
    '#brm-ctrl .brm-cur{font-size:12px;color:#64748b;font-weight:700;margin-bottom:10px}',
    '#brm-ctrl .brm-cur b{color:#1e293b}',
    '#brm-ctrl select{width:100%;padding:10px;border-radius:10px;border:1.5px solid #e2e8f0;font-size:14px;margin-bottom:10px}',
    '#brm-ctrl .brm-act{width:100%;border:none;border-radius:10px;padding:11px;font-weight:800;font-size:13px;cursor:pointer;margin-top:6px}',
    '#brm-ctrl .brm-primary{background:#556ee6;color:#fff}',
    '#brm-ctrl .brm-ghost{background:#f1f5f9;color:#475569}',
    '#brm-ctrl .brm-danger{background:#f46a6a;color:#fff}',
    '#brm-ctrl .brm-msg{font-size:12px;color:#64748b;margin-top:8px;min-height:14px}'
  ].join('');
  document.head.appendChild(style);

  // ---- markup ----
  var wrap = document.createElement('div');
  wrap.id = 'brm-ctrl';
  var label = s.mode === 'guest'
    ? 'Guest / Offline'
    : (isIndividual ? (s.studentName || 'Student') : (s.className || 'Class'));
  wrap.innerHTML =
    '<button class="brm-btn" id="brm-toggle">☰ ' + label + '</button>' +
    '<div class="brm-panel">' +
      '<div class="brm-cur">Center: <b>' + (s.center ? s.center.CenterName : '—') + '</b><br>' +
        'Mode: <b>' + (s.mode === 'guest' ? 'Guest' : s.submode) + '</b>' +
        (s.className ? '<br>Class: <b>' + s.className + '</b>' : '') +
        (isIndividual ? '<br>Student: <b>' + (s.studentName || '—') + '</b>' : '') +
      '</div>' +
      (isIndividual ? '<label style="font-size:11px;font-weight:800;color:#556ee6">SWITCH STUDENT</label><select id="brm-student"></select><button class="brm-act brm-primary" id="brm-switch">Switch Student</button>' : '') +
      '<button class="brm-act brm-ghost" id="brm-menu">Back to Login Menu</button>' +
      '<button class="brm-act brm-danger" id="brm-end">End Session &amp; Exit</button>' +
      '<div class="brm-msg" id="brm-msg"></div>' +
    '</div>';
  document.body.appendChild(wrap);

  var msg = function (t) { document.getElementById('brm-msg').textContent = t || ''; };

  document.getElementById('brm-toggle').onclick = function () {
    wrap.classList.toggle('open');
    if (wrap.classList.contains('open') && isIndividual) loadStudents();
  };

  // ---- populate students for switching ----
  async function loadStudents() {
    var sel = document.getElementById('brm-student');
    if (!sel || sel.dataset.loaded) return;
    try {
      var students = await AuticareAPI.getStudents(s.classId, s.token);
      if (!Array.isArray(students)) students = [];
      sel.innerHTML = students.map(function (st) {
        return '<option value="' + st.StudentID + '"' + (String(st.StudentID) === String(s.studentId) ? ' selected' : '') + '>' + st.StudentName + '</option>';
      }).join('');
      sel.dataset.loaded = '1';
    } catch (e) { msg('Could not load students.'); }
  }

  // ---- switch student: end current session -> start a fresh one ----
  if (isIndividual) {
    document.getElementById('brm-switch').onclick = async function () {
      var sel = document.getElementById('brm-student');
      if (!sel.value) return;
      if (String(sel.value) === String(s.studentId)) { msg('Already this student.'); return; }
      msg('Switching…');
      try {
        await Session.endLiveSession();               // close current -> becomes a report
        var updated = Session.get();
        updated.studentId = sel.value;
        updated.studentName = sel.options[sel.selectedIndex].text;
        updated.sessionId = newSessionId();           // brand-new session for the new student
        Session.set(updated);
        await Session.startLiveSession();
        location.reload();                            // menu resets; monitor re-inits
      } catch (e) { msg('Switch failed.'); }
    };
  }

  // ---- back to login menu (keeps device activated) ----
  document.getElementById('brm-menu').onclick = async function () {
    try { await Session.endLiveSession(); } catch (e) {}
    Session.clear();
    location.href = 'login.html';
  };

  // ---- end session & exit ----
  document.getElementById('brm-end').onclick = async function () {
    try { await Session.endLiveSession(); } catch (e) {}
    Session.clear();
    location.href = 'login.html';
  };
})();
