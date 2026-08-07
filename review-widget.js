/* DUS review widget: sign-in, text highlighting, and comments on review pages.
   Reviewers only; the page renders normally for everyone else. */
(function () {
  'use strict';

  var PAGE = location.pathname.replace(/^\/pages\//, '').replace(/\.html$/, '').replace(/\/$/, '') || 'index';
  var state = { me: null, comments: [], open: false };
  var pending = null;          /* selection attached to the composer */
  var pendingCandidate = null; /* selection captured on mouseup */

  /* ---------- styles ---------- */
  var css = [
    '.rw-pill{position:fixed;right:22px;bottom:22px;z-index:900;background:#015270;color:#fff;border:none;border-radius:999px;',
    'padding:12px 20px;font:700 13px/1 Lato,sans-serif;letter-spacing:.06em;cursor:pointer;box-shadow:0 4px 14px rgba(2,66,92,.35)}',
    '.rw-pill:hover{background:#0A7196}',
    '.rw-panel{position:fixed;top:0;right:0;bottom:0;width:340px;max-width:92vw;z-index:950;background:#fff;border-left:1px solid #d8dee2;',
    'box-shadow:-6px 0 24px rgba(2,66,92,.12);display:flex;flex-direction:column;font-family:Lato,sans-serif}',
    '.rw-head{padding:16px 18px;border-bottom:1px solid #e4e9ec;display:flex;align-items:center;justify-content:space-between}',
    '.rw-head b{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#015270}',
    '.rw-head button{background:none;border:none;font-size:16px;cursor:pointer;color:#444}',
    '.rw-list{flex:1;overflow-y:auto;padding:14px 18px}',
    '.rw-c{border:1px solid #e4e9ec;border-left:3px solid #41BE48;padding:10px 12px;margin-bottom:12px;border-radius:4px}',
    '.rw-c.rw-resolved{opacity:.55;border-left-color:#b7c2c9}',
    '.rw-q{font-size:12px;color:#5a6b74;background:#fff;border:1px solid #c9d3d9;border-left:3px solid #0A7196;padding:5px 8px;border-radius:3px;margin-bottom:7px;cursor:pointer;display:block;text-align:left;width:100%;font-family:Lato,sans-serif}',
    '.rw-b{font-size:14px;line-height:1.5;color:#2B2B2B;white-space:pre-wrap}',
    '.rw-m{font-size:11px;color:#8a969d;margin-top:7px;display:flex;justify-content:space-between;align-items:center}',
    '.rw-m button{background:none;border:none;color:#015270;font-size:11px;cursor:pointer;text-decoration:underline;padding:0;margin-left:8px}',
    '.rw-compose{border-top:1px solid #e4e9ec;padding:14px 18px}',
    '.rw-compose textarea{width:100%;min-height:64px;border:1px solid #c9d3d9;border-radius:4px;padding:8px;font:14px/1.5 Lato,sans-serif;box-sizing:border-box}',
    '.rw-ctx{font-size:12px;color:#015270;background:#fff;border:1px solid #c9d3d9;border-left:3px solid #0A7196;padding:5px 8px;border-radius:3px;margin-bottom:8px;display:none}',
    '.rw-btn{background:#015270;color:#fff;border:none;border-radius:4px;padding:9px 16px;font:700 13px Lato,sans-serif;cursor:pointer;margin-top:8px}',
    '.rw-btn:hover{background:#0A7196}',
    '.rw-cancel{background:none;color:#5a6b74;border:none;font-size:13px;cursor:pointer;margin-left:10px}',
    '.rw-login{display:flex;flex-direction:column;gap:10px;padding:22px 18px}',
    '.rw-login input{border:1px solid #c9d3d9;border-radius:4px;padding:10px;font:14px Lato,sans-serif}',
    '.rw-err{color:#B3261E;font-size:13px;display:none}',
    '.rw-sel{position:absolute;z-index:960;background:#015270;color:#fff;border:none;border-radius:4px;padding:7px 13px;font:700 12px Lato,sans-serif;cursor:pointer;box-shadow:0 3px 10px rgba(2,66,92,.3)}',
    'mark.rw-hl{background:rgba(126,192,214,.45);color:inherit;cursor:pointer;border-bottom:2px solid #0A7196}',
    'mark.rw-hl.rw-hl-resolved{background:rgba(183,194,201,.3);border-bottom-color:#b7c2c9}',
    'body.rw-shift{margin-right:340px}',
    '@media (max-width:900px){body.rw-shift{margin-right:0}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- api ---------- */
  function api(method, path, body) {
    return fetch(path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, status: r.status, data: j }; });
    });
  }

  /* ---------- skeleton ---------- */
  var pill = document.createElement('button');
  pill.className = 'rw-pill';
  pill.textContent = 'Reviewer sign in';
  document.body.appendChild(pill);

  var panel = document.createElement('div');
  panel.className = 'rw-panel';
  panel.style.display = 'none';
  document.body.appendChild(panel);

  var selBtn = document.createElement('button');
  selBtn.className = 'rw-sel';
  selBtn.textContent = 'Comment';
  selBtn.style.display = 'none';
  document.body.appendChild(selBtn);

  function openPanel() {
    panel.style.display = 'flex';
    document.body.classList.add('rw-shift');
    state.open = true;
    render();
  }
  function closePanel() {
    panel.style.display = 'none';
    document.body.classList.remove('rw-shift');
    state.open = false;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  /* ---------- render ---------- */
  function render() {
    if (!state.me) {
      pill.textContent = 'Reviewer sign in';
      panel.innerHTML =
        '<div class="rw-head"><b>Reviewer sign in</b><button data-x>&times;</button></div>' +
        '<div class="rw-login">' +
        '<input type="email" placeholder="Email address" data-email>' +
        '<input type="password" placeholder="Password" data-pass>' +
        '<div class="rw-err" data-err></div>' +
        '<button class="rw-btn" data-go>Sign in</button></div>';
      panel.querySelector('[data-x]').onclick = closePanel;
      panel.querySelector('[data-go]').onclick = doLogin;
      panel.querySelector('[data-pass]').onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
      return;
    }
    pill.textContent = 'Comments (' + state.comments.filter(function (c) { return !c.resolved; }).length + ')';
    var list = state.comments.map(function (c) {
      return (
        '<div class="rw-c' + (c.resolved ? ' rw-resolved' : '') + '" data-cid="' + c.id + '">' +
        (c.quote ? '<button class="rw-q" data-jump="' + c.id + '">&ldquo;' + esc(c.quote.slice(0, 120)) + '&rdquo;</button>' : '') +
        '<div class="rw-b">' + esc(c.body) + '</div>' +
        '<div class="rw-m"><span>' + esc(c.email.split('@')[0]) + ' &middot; ' + new Date(c.created_at).toLocaleDateString() + '</span>' +
        '<span><button data-res="' + c.id + '">' + (c.resolved ? 'Reopen' : 'Resolve') + '</button>' +
        (c.email === state.me ? '<button data-del="' + c.id + '">Delete</button>' : '') +
        '</span></div></div>'
      );
    }).join('') || '<p style="font:14px Lato;color:#5a6b74">No comments yet. Select any text on the page to comment on it, or leave a page-level note below.</p>';

    panel.innerHTML =
      '<div class="rw-head"><b>Comments</b><span><button data-out style="font-size:12px;text-decoration:underline;color:#5a6b74">sign out</button> <button data-x>&times;</button></span></div>' +
      '<div class="rw-list">' + list + '</div>' +
      '<div class="rw-compose"><div class="rw-ctx" data-ctx></div>' +
      '<textarea placeholder="Leave a comment for Jenny…" data-body></textarea>' +
      '<div><button class="rw-btn" data-send>Post comment</button>' +
      '<button class="rw-cancel" data-clear style="display:none">clear selection</button></div></div>';

    panel.querySelector('[data-x]').onclick = closePanel;
    panel.querySelector('[data-out]').onclick = function () {
      api('DELETE', '/api/login').then(function () { state.me = null; state.comments = []; paint(); render(); });
    };
    panel.querySelector('[data-send]').onclick = post;
    panel.querySelectorAll('[data-res]').forEach(function (b) {
      b.onclick = function () {
        var c = state.comments.find(function (x) { return x.id === Number(b.dataset.res); });
        api('PATCH', '/api/comments', { id: c.id, resolved: !c.resolved }).then(load);
      };
    });
    panel.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () { api('DELETE', '/api/comments', { id: Number(b.dataset.del) }).then(load); };
    });
    panel.querySelectorAll('[data-jump]').forEach(function (b) {
      b.onclick = function () {
        var m = document.querySelector('mark.rw-hl[data-id="' + b.dataset.jump + '"]');
        if (m) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
    });
    if (pending) {
      var ctx = panel.querySelector('[data-ctx]');
      ctx.style.display = 'block';
      ctx.textContent = '“' + pending.quote.slice(0, 120) + '”';
      var clear = panel.querySelector('[data-clear]');
      clear.style.display = 'inline';
      clear.onclick = function () { pending = null; render(); };
      panel.querySelector('[data-body]').focus();
    }
  }

  function doLogin() {
    var email = panel.querySelector('[data-email]').value;
    var pass = panel.querySelector('[data-pass]').value;
    api('POST', '/api/login', { email: email, password: pass }).then(function (r) {
      if (!r.ok) {
        var err = panel.querySelector('[data-err]');
        err.style.display = 'block';
        err.textContent = (r.data && r.data.error) || 'Sign-in failed.';
        return;
      }
      state.me = r.data.email;
      load();
    });
  }

  function post() {
    var body = panel.querySelector('[data-body]').value.trim();
    if (!body) return;
    var payload = { page: PAGE, body: body };
    if (pending) { payload.quote = pending.quote; payload.prefix = pending.prefix; payload.suffix = pending.suffix; }
    api('POST', '/api/comments', payload).then(function () { pending = null; load(); });
  }

  function load() {
    api('GET', '/api/comments?page=' + encodeURIComponent(PAGE)).then(function (r) {
      if (r.status === 401) { state.me = null; render(); return; }
      state.me = r.data.me;
      state.comments = r.data.comments || [];
      paint();
      render();
    });
  }

  /* ---------- highlights ---------- */
  function textNodesUnder(root) {
    var out = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var name = p.nodeName;
        if (name === 'SCRIPT' || name === 'STYLE' || name === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.rw-panel,.rw-sel,.rw-pill')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) out.push(n);
    return out;
  }

  function clearMarks() {
    document.querySelectorAll('mark.rw-hl').forEach(function (m) {
      var parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  }

  function paint() {
    clearMarks();
    var nodes = textNodesUnder(document.body);
    var plain = nodes.map(function (n) { return n.nodeValue; }).join('');
    state.comments.forEach(function (c) {
      if (!c.quote) return;
      var idx = -1;
      if (c.prefix || c.suffix) {
        idx = plain.indexOf((c.prefix || '') + c.quote + (c.suffix || ''));
        if (idx >= 0) idx += (c.prefix || '').length;
      }
      if (idx < 0) idx = plain.indexOf(c.quote);
      if (idx < 0) return; /* text changed since the comment; it still shows in the sidebar */
      markRange(nodes, idx, idx + c.quote.length, c);
      /* re-walk after DOM mutation so later offsets stay correct */
      nodes = textNodesUnder(document.body);
      plain = nodes.map(function (n) { return n.nodeValue; }).join('');
    });
  }

  function markRange(nodes, start, end, c) {
    var segs = [];
    var pos = 0;
    for (var i = 0; i < nodes.length; i++) {
      var len = nodes[i].nodeValue.length;
      var s = Math.max(start, pos);
      var e = Math.min(end, pos + len);
      if (s < e) segs.push({ node: nodes[i], s: s - pos, e: e - pos });
      pos += len;
      if (pos >= end) break;
    }
    segs.forEach(function (seg) {
      var r = document.createRange();
      r.setStart(seg.node, seg.s);
      r.setEnd(seg.node, seg.e);
      var mark = document.createElement('mark');
      mark.className = 'rw-hl' + (c.resolved ? ' rw-hl-resolved' : '');
      mark.dataset.id = c.id;
      mark.addEventListener('click', function () {
        openPanel();
        var el = panel.querySelector('.rw-c[data-cid="' + c.id + '"]');
        if (el) el.scrollIntoView({ block: 'center' });
      });
      try { r.surroundContents(mark); } catch (err) { /* skip un-wrappable segment */ }
    });
  }

  /* ---------- selection capture ---------- */
  document.addEventListener('mouseup', function (e) {
    if (!state.me) return;
    if (e.target.closest && e.target.closest('.rw-panel,.rw-sel,.rw-pill')) return;
    setTimeout(function () {
      var sel = window.getSelection();
      var text = sel ? String(sel).trim() : '';
      if (!text || text.length < 3 || text.length > 600) { selBtn.style.display = 'none'; return; }
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      selBtn.style.display = 'block';
      selBtn.style.top = window.scrollY + rect.top - 40 + 'px';
      selBtn.style.left = window.scrollX + Math.max(10, rect.left + rect.width / 2 - 40) + 'px';
      var nodes = textNodesUnder(document.body);
      var plain = nodes.map(function (n) { return n.nodeValue; }).join('');
      var i = plain.indexOf(text);
      pendingCandidate = {
        quote: text,
        prefix: i > 0 ? plain.slice(Math.max(0, i - 30), i) : '',
        suffix: i >= 0 ? plain.slice(i + text.length, i + text.length + 30) : ''
      };
    }, 10);
  });
  selBtn.onclick = function () {
    pending = pendingCandidate;
    selBtn.style.display = 'none';
    window.getSelection().removeAllRanges();
    openPanel();
  };

  pill.onclick = function () { state.open ? closePanel() : openPanel(); };

  /* ---------- boot ---------- */
  api('GET', '/api/login').then(function (r) {
    if (r.data && r.data.email) { state.me = r.data.email; load(); }
  }).catch(function () { /* api unavailable: widget stays dormant except the pill */ });
})();
