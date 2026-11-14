/* ══════════════════════════════════════════════════════════════════════
   UI — behaviour for the components in ui.css, on every page.

     Tooltip       icon-only buttons say what they do (Radix timing:
                   a short wait, then instant while you move between them)
     Toast         confirms a copy; pauses while hovered or focused
     Copy email    the footer's email button copies the address
     Search        ⌘K / Ctrl+K, or the header button: jump to any project,
                   any section of the current one, a page or an action
     Gliding pill  the comparison toggles and the home page filters
     Section bar   one underline that travels with the section you read,
                   and keeps itself in view on narrow screens
     Up next       hovering "Next project" previews where it goes

   Each part checks for its own markup and quietly does nothing without it.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  function mq(q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; }
  var reduced = mq('(prefers-reduced-motion: reduce)');
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  var MOD = /mac|iphone|ipad/i.test(platform) ? '⌘' : 'Ctrl';

  var EMAIL = 'srinivasmidhunw@gmail.com';
  var LINKEDIN = 'https://www.linkedin.com/in/srinivas-midhun';
  var RESUME = 'SrinivasMidhun_Resume.pdf';

  // The home page's order and words, so the search menu and the "Up next"
  // preview always match what the home page says.
  var PROJECTS = [
    { href: 'campus-copilot.html', title: 'Campus Copilot', line: 'Conversational AI assistant for students',
      tags: 'ai chatbot conversational assistant students penn state onboarding web product' },
    { href: 'floodlens.html', title: 'FloodLens', line: 'Sea-level rise, mapped for Miami Beach',
      tags: 'map gis 3d sea level flood geospatial data visualization web' },
    { href: 'executivedashboard.html', title: 'Executive Dashboard', line: 'Grant oversight for program leadership',
      tags: 'dashboard data visualization grant penntap rise pa b2b web' },
    { href: 'smartcharge.html', title: 'Smart Charge', line: 'Charging that acts before the anxiety does',
      tags: 'battery charging mobile ios notification product' },
    { href: 'paypal.html', title: 'PayPal Activity', line: 'Order for a cluttered activity feed',
      tags: 'paypal fintech payments activity feed mobile product' },
    { href: 'designiq.html', title: 'DesigniQ', line: 'An interior design app',
      tags: 'interior design ai app mobile ecommerce product' }
  ];
  PROJECTS.forEach(function (p) { p.thumb = 'images/thumbs/' + slug(p.href) + '.webp'; });

  function slug(path) {
    var s = String(path || '').split(/[?#]/)[0].split('/').pop().replace(/\.html$/, '');
    return s || 'index';
  }
  var here = slug(location.pathname);

  function el(tag, cls) { var n = doc.createElement(tag); if (cls) n.className = cls; return n; }

  function svg(paths, filled) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      (filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"') +
      '>' + paths + '</svg>';
  }
  var ICON = {
    search:   svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
    hash:     svg('<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>'),
    home:     svg('<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>'),
    user:     svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>'),
    file:     svg('<path d="M14 3H6.5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V7.5z"/><path d="M14 3v4.5h4.5M9 13h6M9 16.5h6"/>'),
    sun:      svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon:     svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    mail:     svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    link:     svg('<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>'),
    linkedin: svg('<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.83v1.64h.06c.53-1 1.84-2.06 3.79-2.06C21.4 8.58 22 11 22 14.16V21h-4v-6.06c0-1.45-.03-3.31-2.02-3.31-2.02 0-2.33 1.58-2.33 3.21V21h-4V9z"/>', true),
    external: svg('<path d="M7 17 17 7M8.5 7H17v8.5"/>'),
    check:    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };


  // ── Screen-reader announcements ────────────────────────────────────
  // One polite live region, in the page from the start, so what a toast
  // says is read out even though the toast itself is added later.
  var live = el('div', 'sr-only');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  doc.body.appendChild(live);
  function announce(text) {
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 60);
  }


  // ── Tooltip ────────────────────────────────────────────────────────
  // For the header's icon-only buttons (the footer's icons already show a
  // small label of their own), which carry an aria-label: the tooltip
  // repeats it for sighted users and is hidden from screen readers, so the
  // name is not read twice. Hover waits 500ms; moving straight on to the
  // next button (within 300ms) shows its tooltip at once. Keyboard focus
  // shows it immediately. Pressing the button, Escape or scrolling hides it.
  var tip = null, tipText = null, tipArrow = null, tipFor = null, tipTimer = 0, tipClosedAt = -1e9;

  function ensureTip() {
    if (tip) return;
    tip = el('div', 'ui-tip');
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<span class="ui-tip-text"></span><span class="ui-tip-arrow"></span>';
    tipText = tip.firstChild;
    tipArrow = tip.lastChild;
    doc.body.appendChild(tip);
  }

  function showTip(target) {
    ensureTip();
    var c = target.__uiTip && target.__uiTip();
    if (!c) return;
    tipText.textContent = c.text;
    Array.prototype.forEach.call(tip.querySelectorAll('.ui-kbd'), function (k) { k.remove(); });
    (c.keys || []).forEach(function (key) {
      var k = el('kbd', 'ui-kbd');
      k.textContent = key;
      tip.insertBefore(k, tipArrow);
    });

    tip.removeAttribute('data-state');
    var r = target.getBoundingClientRect();
    var w = tip.offsetWidth, h = tip.offsetHeight, gap = 9;
    var side = target.__uiTipSide || 'top';
    if (side === 'top' && r.top - h - gap < 8) side = 'bottom';
    else if (side === 'bottom' && r.bottom + h + gap > window.innerHeight - 8) side = 'top';
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), root.clientWidth - w - 8);
    var y = side === 'top' ? r.top - h - gap : r.bottom + gap;
    tip.style.left = Math.round(x) + 'px';
    tip.style.top = Math.round(y) + 'px';
    tip.style.setProperty('--arrow-x', Math.round(r.left + r.width / 2 - x) + 'px');
    tip.setAttribute('data-side', side);
    void tip.offsetWidth;                       // restart the pop
    tip.setAttribute('data-state', 'open');
    tipFor = target;
  }

  function hideTip(target) {
    clearTimeout(tipTimer);
    if (!tip || !tipFor || (target && tipFor !== target)) return;
    tip.setAttribute('data-state', 'closed');
    tipFor = null;
    tipClosedAt = performance.now();
  }

  function bindTip(target, content, side) {
    if (!target) return;
    target.__uiTip = content;
    target.__uiTipSide = side;
    target.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(tipTimer);
      var wait = performance.now() - tipClosedAt < 300 ? 0 : 500;
      tipTimer = setTimeout(function () { showTip(target); }, wait);
    });
    target.addEventListener('pointerleave', function () { hideTip(target); clearTimeout(tipTimer); });
    target.addEventListener('pointerdown', function () { hideTip(target); clearTimeout(tipTimer); });
    target.addEventListener('focus', function () {
      var visible = true;
      try { visible = target.matches(':focus-visible'); } catch (e) {}
      if (visible) showTip(target);
    });
    target.addEventListener('blur', function () { hideTip(target); });
  }
  addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
  addEventListener('scroll', function () { if (tipFor) hideTip(); }, { passive: true, capture: true });


  // ── Toast ──────────────────────────────────────────────────────────
  var toaster = null, current = null;

  function toast(o) {
    if (!toaster) {
      toaster = el('div', 'ui-toaster');
      toaster.setAttribute('role', 'region');
      toaster.setAttribute('aria-label', 'Notifications (F8)');
      doc.body.appendChild(toaster);
    }
    dismissToast(true);

    var t = el('div', 'ui-toast');
    t.innerHTML = '<span class="ui-toast-icon">' + ICON.check + '</span>' +
      '<span class="ui-toast-text"><span class="ui-toast-title"></span><span class="ui-toast-desc"></span></span>';
    t.querySelector('.ui-toast-title').textContent = o.title;
    var desc = t.querySelector('.ui-toast-desc');
    if (o.desc) desc.textContent = o.desc; else desc.remove();
    if (o.action) {
      var a = el('a', 'ui-toast-action');
      a.href = o.action.href;
      a.textContent = o.action.label;
      a.addEventListener('click', function () { dismissToast(false); });
      t.appendChild(a);
    }
    toaster.appendChild(t);
    announce(o.title + (o.desc ? '. ' + o.desc : ''));

    // auto-dismiss, paused while it is hovered or holds focus
    var remaining = o.duration || 5000, started = 0, timer = 0, holds = 0;
    function run() { clearTimeout(timer); started = performance.now(); timer = setTimeout(function () { dismissToast(false); }, remaining); }
    function hold() { if (holds++ === 0) { clearTimeout(timer); remaining = Math.max(1500, remaining - (performance.now() - started)); } }
    function release() { if (holds > 0 && --holds === 0) run(); }
    t.addEventListener('pointerenter', hold);
    t.addEventListener('pointerleave', release);
    t.addEventListener('focusin', hold);
    t.addEventListener('focusout', release);
    t.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); dismissToast(false); } });
    t.__stop = function () { clearTimeout(timer); };
    current = t;
    run();
  }

  function dismissToast(now) {
    var t = current;
    if (!t) return;
    current = null;
    t.__stop();
    var hadFocus = t.contains(doc.activeElement);
    function gone() {
      if (!t.parentNode) return;
      t.remove();
      if (hadFocus && lastFocus && doc.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
    if (now || reduced.matches) { gone(); return; }
    t.classList.add('is-leaving');
    t.addEventListener('animationend', gone, { once: true });
    setTimeout(gone, 300);
  }

  // F8 jumps to the notification, as in Radix; focus returns afterwards
  var lastFocus = null;
  addEventListener('keydown', function (e) {
    if (e.key !== 'F8' || !current) return;
    e.preventDefault();
    lastFocus = doc.activeElement;
    var target = current.querySelector('a, button');
    if (target) target.focus();
  });


  // ── Copy ───────────────────────────────────────────────────────────
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var prev = doc.activeElement;
      var ta = el('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) {}
      ta.remove();
      if (prev && prev.focus) prev.focus({ preventScroll: true });
      if (ok) resolve(); else reject();
    });
  }

  function copyEmail() {
    copy(EMAIL).then(function () {
      toast({ title: 'Email copied', desc: EMAIL, action: { label: 'Open mail app', href: 'mailto:' + EMAIL } });
    }, function () {
      location.href = 'mailto:' + EMAIL;          // no clipboard: fall back to the mail app
    });
  }

  function copyLink() {
    var url = location.href.split('#')[0];
    copy(url).then(function () {
      toast({ title: 'Link copied', desc: url.replace(/^https?:\/\//, '') });
    }, function () {});
  }

  // The footer's email button copies the address rather than opening a mail
  // app, which many visitors don't have set up. The toast offers the mail
  // app as the next step, and a modified click (new tab, etc.) still works
  // as a plain mailto link.
  // Its aria-label is also the small label the footer shows under each icon
  // on hover, so it names the new action in two words.
  Array.prototype.forEach.call(doc.querySelectorAll('footer a[href^="mailto:"]'), function (a) {
    a.setAttribute('aria-label', 'Copy email');
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      copyEmail();
    });
  });

  var themeBtn = doc.getElementById('theme-toggle');
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  bindTip(themeBtn, function () { return { text: isDark() ? 'Light mode' : 'Dark mode' }; }, 'bottom');


  // ── Search (command menu) ──────────────────────────────────────────
  // A native modal <dialog>: the browser keeps focus inside, makes the page
  // behind inert and handles Escape; this adds the shadcn command-menu
  // pattern on top (a combobox input driving a listbox).
  var searchBtns = Array.prototype.slice.call(doc.querySelectorAll('.ui-search-btn'));
  var hasDialog = typeof window.HTMLDialogElement === 'function';
  if (!hasDialog) searchBtns.forEach(function (b) { b.hidden = true; });

  var cmd = null, cmdInput = null, cmdList = null, cmdEmpty = null;
  var cmdGroups = [], cmdRows = [], cmdActive = -1, cmdReturn = null, cmdClosing = false;

  function cmdEntries() {
    var groups = [];
    groups.push({ name: 'Case studies', items: PROJECTS.map(function (p) {
      var isHere = slug(p.href) === here;
      return { label: p.title, sub: p.line, thumb: p.thumb, keys: p.tags, current: isHere,
               href: p.href, run: isHere ? toTop : function () { go(p.href); } };
    }) });

    var sections = Array.prototype.slice.call(doc.querySelectorAll('.section-nav a[href^="#"]'));
    if (sections.length) groups.push({ name: 'On this page', items: sections.map(function (a) {
      var hash = a.getAttribute('href');
      return { label: a.textContent.trim(), icon: 'hash', keys: 'section jump', run: function () { jump(hash); } };
    }) });

    groups.push({ name: 'Pages', items: [
      { label: 'Home', icon: 'home', keys: 'index work projects portfolio', current: here === 'index',
        href: 'index.html', run: here === 'index' ? toTop : function () { go('index.html'); } },
      { label: 'About Me', icon: 'user', keys: 'about bio timeline experience education', current: here === 'about',
        href: 'about.html', run: here === 'about' ? toTop : function () { go('about.html'); } },
      { label: 'Resume', icon: 'file', sub: 'PDF, opens in a new tab', keys: 'cv pdf', external: true,
        run: function () { window.open(RESUME, '_blank', 'noopener'); } }
    ] });

    groups.push({ name: 'Actions', items: [
      { label: isDark() ? 'Switch to light mode' : 'Switch to dark mode', icon: isDark() ? 'sun' : 'moon',
        keys: 'theme appearance dark light mode', run: toggleTheme },
      { label: 'Copy email address', sub: EMAIL, icon: 'mail', keys: 'email contact mail copy hire', run: copyEmail },
      { label: 'Copy link to this page', icon: 'link', keys: 'share url link copy', run: copyLink },
      { label: 'LinkedIn', sub: 'linkedin.com/in/srinivas-midhun', icon: 'linkedin', external: true,
        keys: 'social connect contact profile', run: function () { window.open(LINKEDIN, '_blank', 'noopener'); } }
    ] });
    return groups;
  }

  function go(href) { location.href = href; }
  function toTop() { window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }); }
  function jump(hash) {
    var target = doc.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  function toggleTheme() {
    if (themeBtn) { themeBtn.click(); return; }
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  }

  function buildCmd() {
    if (cmd) return;
    cmd = el('dialog', 'ui-cmd');
    cmd.setAttribute('aria-label', 'Search the site');
    cmd.innerHTML =
      '<div class="ui-cmd-panel">' +
        '<div class="ui-cmd-search">' + ICON.search +
          '<input class="ui-cmd-input" type="text" role="combobox" aria-expanded="true" aria-controls="ui-cmd-list"' +
          ' aria-autocomplete="list" aria-label="Search projects, pages and actions"' +
          ' placeholder="Search projects, pages and actions…" autocomplete="off" autocapitalize="off" spellcheck="false">' +
          '<kbd class="ui-kbd" aria-hidden="true">Esc</kbd>' +
        '</div>' +
        '<div class="ui-cmd-list" id="ui-cmd-list" role="listbox" aria-label="Results"></div>' +
        '<div class="ui-cmd-empty" role="status" hidden></div>' +
        '<div class="ui-cmd-foot" aria-hidden="true">' +
          '<span><kbd class="ui-kbd">↑</kbd><kbd class="ui-kbd">↓</kbd> to move</span>' +
          '<span><kbd class="ui-kbd">↵</kbd> to open</span>' +
          '<span class="ui-cmd-brand"><kbd class="ui-kbd">' + MOD + '</kbd><kbd class="ui-kbd">K</kbd> from any page</span>' +
        '</div>' +
      '</div>';
    doc.body.appendChild(cmd);
    cmdInput = cmd.querySelector('.ui-cmd-input');
    cmdList = cmd.querySelector('.ui-cmd-list');
    cmdEmpty = cmd.querySelector('.ui-cmd-empty');

    cmdInput.addEventListener('input', function () { renderCmd(cmdInput.value); });
    cmdInput.addEventListener('keydown', function (e) {
      var n = cmdRows.length;
      if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
        e.preventDefault(); if (n) select((cmdActive + 1) % n, true);
      } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
        e.preventDefault(); if (n) select((cmdActive - 1 + n) % n, true);
      } else if (e.key === 'Enter') {
        e.preventDefault(); if (cmdActive >= 0) runRow(cmdActive, e.metaKey || e.ctrlKey);
      }
    });
    // Escape: close with the same fade it opened with
    cmd.addEventListener('cancel', function (e) { e.preventDefault(); closeCmd(); });
    // A click on the dimmed page closes it; a drag that merely ends there
    // (selecting the query, say) does not.
    var downOnBackdrop = false;
    cmd.addEventListener('pointerdown', function (e) { downOnBackdrop = e.target === cmd; });
    cmd.addEventListener('click', function (e) { if (e.target === cmd && downOnBackdrop) closeCmd(); });
  }

  function score(it, terms) {
    if (!terms.length) return 1;
    var label = it.label.toLowerCase();
    var hay = label + ' ' + (it.sub || '').toLowerCase() + ' ' + (it.keys || '');
    var s = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (hay.indexOf(t) === -1) return 0;
      s += label.indexOf(t) === 0 ? 4 : label.indexOf(' ' + t) !== -1 ? 3 : label.indexOf(t) !== -1 ? 2 : 1;
    }
    return s;
  }

  // the typed letters, underlined in the label
  function highlight(node, text, terms) {
    var lower = text.toLowerCase(), marks = [];
    terms.forEach(function (t) {
      var i = lower.indexOf(t);
      if (i !== -1) marks.push([i, i + t.length]);
    });
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var at = 0;
    marks.forEach(function (m) {
      if (m[0] < at) return;
      if (m[0] > at) node.appendChild(doc.createTextNode(text.slice(at, m[0])));
      var mark = el('mark');
      mark.textContent = text.slice(m[0], m[1]);
      node.appendChild(mark);
      at = m[1];
    });
    if (at < text.length) node.appendChild(doc.createTextNode(text.slice(at)));
  }

  function renderRow(it, terms, idx) {
    var row = el('div', 'ui-cmd-item');
    row.id = 'ui-cmd-o' + idx;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', 'false');
    if (it.thumb) {
      var th = el('span', 'ui-cmd-thumb');
      var img = el('img');
      img.alt = '';
      img.decoding = 'async';
      img.src = it.thumb;
      th.appendChild(img);
      row.appendChild(th);
    } else {
      var ic = el('span', 'ui-cmd-icon');
      ic.innerHTML = ICON[it.icon] || '';
      row.appendChild(ic);
    }
    var text = el('span', 'ui-cmd-text');
    var label = el('span', 'ui-cmd-label');
    highlight(label, it.label, terms);
    text.appendChild(label);
    if (it.sub) {
      var sub = el('span', 'ui-cmd-sub');
      sub.textContent = it.sub;
      text.appendChild(sub);
    }
    row.appendChild(text);
    var meta = el('span', 'ui-cmd-meta');
    if (it.current) {
      var badge = el('span', 'ui-badge');
      badge.textContent = 'You’re here';
      meta.appendChild(badge);
    }
    if (it.external) meta.insertAdjacentHTML('beforeend', ICON.external);
    meta.insertAdjacentHTML('beforeend', '<kbd class="ui-kbd ui-cmd-enter" aria-hidden="true">↵</kbd>');
    row.appendChild(meta);
    // pointermove, not mouseenter: a list scrolling under a still pointer
    // must not steal the keyboard's choice
    row.addEventListener('pointermove', function () { if (cmdActive !== idx) select(idx, false); });
    row.addEventListener('click', function (e) { runRow(idx, e.metaKey || e.ctrlKey); });
    return row;
  }

  function renderCmd(query) {
    var q = query.trim().toLowerCase();
    var terms = q ? q.split(/\s+/) : [];
    cmdList.textContent = '';
    cmdRows = [];
    cmdActive = -1;
    var n = 0;
    cmdGroups.forEach(function (g, gi) {
      var hits = g.items
        .map(function (it, i) { return { it: it, s: score(it, terms), i: i }; })
        .filter(function (m) { return m.s > 0; });
      if (!hits.length) return;
      if (terms.length) hits.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
      var group = el('div', 'ui-cmd-group');
      group.setAttribute('role', 'group');
      var head = el('div', 'ui-cmd-heading');
      head.id = 'ui-cmd-g' + gi;
      head.textContent = g.name;
      group.setAttribute('aria-labelledby', head.id);
      group.appendChild(head);
      hits.forEach(function (m) {
        var row = renderRow(m.it, terms, n++);
        group.appendChild(row);
        cmdRows.push({ el: row, it: m.it });
      });
      cmdList.appendChild(group);
    });
    cmdList.hidden = !cmdRows.length;
    cmdEmpty.hidden = !!cmdRows.length;
    cmdEmpty.textContent = cmdRows.length ? '' : 'Nothing matches “' + query.trim() + '”.';
    if (cmdRows.length) select(0, true);
    else cmdInput.removeAttribute('aria-activedescendant');
  }

  function select(i, scroll) {
    if (cmdActive >= 0 && cmdRows[cmdActive]) cmdRows[cmdActive].el.setAttribute('aria-selected', 'false');
    cmdActive = i;
    var row = cmdRows[i] && cmdRows[i].el;
    if (!row) return;
    row.setAttribute('aria-selected', 'true');
    cmdInput.setAttribute('aria-activedescendant', row.id);
    if (scroll) {
      if (i === 0) cmdList.scrollTop = 0;     // keep the first heading in view too
      else row.scrollIntoView({ block: 'nearest' });
    }
  }

  function runRow(i, newTab) {
    var it = cmdRows[i] && cmdRows[i].it;
    if (!it) return;
    if (newTab && it.href) { window.open(it.href, '_blank', 'noopener'); return; }
    if (it.href && !it.current) {
      // leave at once; closed first so Back doesn't return to an open menu
      cmd.close();
      lockScroll(false);
      it.run();
      return;
    }
    closeCmd(it.run);
  }

  var lockedPad = '';
  function lockScroll(on) {
    if (on) {
      var bar = window.innerWidth - root.clientWidth;
      lockedPad = root.style.paddingRight;
      if (bar > 0) root.style.paddingRight = bar + 'px';
      root.classList.add('ui-locked');
    } else {
      root.classList.remove('ui-locked');
      root.style.paddingRight = lockedPad;
    }
  }

  function openCmd() {
    if (!hasDialog) return;
    buildCmd();
    if (cmd.open) return;
    hideTip();
    cmdReturn = doc.activeElement;
    cmdGroups = cmdEntries();
    cmdInput.value = '';
    renderCmd('');
    lockScroll(true);
    cmd.classList.remove('is-closing');
    cmdClosing = false;
    cmd.showModal();
    cmdInput.focus();
    searchBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  }

  function closeCmd(then) {
    if (!cmd || !cmd.open || cmdClosing) return;
    cmdClosing = true;
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      cmd.classList.remove('is-closing');
      cmd.close();
      cmdClosing = false;
      lockScroll(false);
      searchBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (cmdReturn && doc.contains(cmdReturn) && cmdReturn.focus) cmdReturn.focus({ preventScroll: true });
      if (typeof then === 'function') then();
    }
    if (reduced.matches) { finish(); return; }
    cmd.classList.add('is-closing');
    cmd.querySelector('.ui-cmd-panel').addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 220);
  }

  searchBtns.forEach(function (b) {
    b.setAttribute('aria-expanded', 'false');
    bindTip(b, function () { return { text: 'Search', keys: [MOD, 'K'] }; }, 'bottom');
    b.addEventListener('click', openCmd);
  });
  addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
      if (!hasDialog) return;
      e.preventDefault();
      if (cmd && cmd.open) closeCmd(); else openCmd();
    }
  });
  // a page restored from the back/forward cache must not come back locked
  addEventListener('pageshow', function () {
    if (cmd && cmd.open) cmd.close();
    cmdClosing = false;
    root.classList.remove('ui-locked');
  });


  // ── Gliding pill ───────────────────────────────────────────────────
  // A copy of the buttons in their chosen look, clipped to the chosen one.
  // The page's own click handlers still set .active; this only watches.
  function glide(container, sel) {
    if (!container || container.classList.contains('ui-has-glide') || !window.MutationObserver) return;
    var items = Array.prototype.filter.call(container.children, function (c) { return c.matches(sel); });
    if (items.length < 2) return;

    var layer = el('div', 'ui-glide is-instant');
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    items.forEach(function (it) {
      var c = it.cloneNode(true);
      c.classList.add('active');
      ['id', 'role', 'aria-pressed', 'aria-selected', 'aria-controls', 'data-filter'].forEach(function (a) { c.removeAttribute(a); });
      c.tabIndex = -1;
      layer.appendChild(c);
    });
    container.classList.add('ui-has-glide');
    container.appendChild(layer);

    function place(instant) {
      var act = items.filter(function (it) { return it.classList.contains('active'); })[0];
      var W = layer.offsetWidth, H = layer.offsetHeight;
      if (!act || !W) { layer.style.clipPath = 'inset(0 100% 100% 0)'; return; }
      var radius = parseFloat(getComputedStyle(act).borderTopLeftRadius) || 0;
      if (instant) layer.classList.add('is-instant');
      layer.style.clipPath = 'inset(' + act.offsetTop + 'px ' + (W - act.offsetLeft - act.offsetWidth) + 'px ' +
        (H - act.offsetTop - act.offsetHeight) + 'px ' + act.offsetLeft + 'px round ' + radius + 'px)';
      if (instant) { void layer.offsetWidth; layer.classList.remove('is-instant'); }
    }
    var mo = new MutationObserver(function () { place(false); });
    items.forEach(function (it) { mo.observe(it, { attributes: true, attributeFilter: ['class'] }); });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { place(true); });
      ro.observe(container);
      ro.observe(layer);        // hidden in the material styles: redraw when Flat shows it again
      items.forEach(function (it) { ro.observe(it); });
    }
    place(true);
  }

  // Radix Tabs keyboard: one tab stop for the group, arrows move and choose
  function rovingTabs(list, sel) {
    var tabs = Array.prototype.filter.call(list.children, function (c) { return c.matches(sel); });
    if (tabs.length < 2) return;
    function sync() {
      var act = tabs.filter(function (t) { return t.classList.contains('active'); })[0] || tabs[0];
      tabs.forEach(function (t) { t.tabIndex = t === act ? 0 : -1; });
    }
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(doc.activeElement);
      if (i === -1) return;
      var map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      var n = (map[e.key] + tabs.length) % tabs.length;
      tabs[n].focus();
      tabs[n].click();
    });
    var mo = new MutationObserver(sync);
    tabs.forEach(function (t) { mo.observe(t, { attributes: true, attributeFilter: ['class'] }); });
    sync();
  }

  Array.prototype.forEach.call(doc.querySelectorAll('.ba-toggle'), function (t) {
    glide(t, 'button');
    rovingTabs(t, 'button');
  });
  glide(doc.querySelector('.work .filters'), '.filter-btn');


  // ── Section bar ────────────────────────────────────────────────────
  // The page's scroll-spy sets .active on a link; one underline travels to
  // it, and on a narrow screen the bar scrolls sideways to keep it in view.
  Array.prototype.forEach.call(doc.querySelectorAll('.section-nav-inner'), function (inner) {
    var links = Array.prototype.slice.call(inner.querySelectorAll('a'));
    if (!links.length || !window.MutationObserver) return;
    var bar = el('span', 'ui-sn-bar is-instant');
    bar.setAttribute('aria-hidden', 'true');
    inner.classList.add('ui-has-bar');
    inner.appendChild(bar);
    var shown = null;

    function reveal(a) {
      if (inner.scrollWidth <= inner.clientWidth + 1) return;
      var pad = 28;
      if (a.offsetLeft - pad < inner.scrollLeft || a.offsetLeft + a.offsetWidth + pad > inner.scrollLeft + inner.clientWidth) {
        inner.scrollTo({ left: a.offsetLeft - (inner.clientWidth - a.offsetWidth) / 2,
                         behavior: reduced.matches ? 'auto' : 'smooth' });
      }
    }
    function place(instant) {
      var a = links.filter(function (l) { return l.classList.contains('active'); })[0];
      if (!a) { bar.classList.remove('is-visible'); shown = null; return; }
      var jumpCut = instant || !bar.classList.contains('is-visible');
      if (jumpCut) bar.classList.add('is-instant');
      bar.style.width = a.offsetWidth + 'px';
      bar.style.translate = a.offsetLeft + 'px ' + (a.offsetTop + a.offsetHeight - 0.5) + 'px';
      if (jumpCut) { void bar.offsetWidth; bar.classList.remove('is-instant'); }
      bar.classList.add('is-visible');
      if (a !== shown) { shown = a; reveal(a); }
    }
    var mo = new MutationObserver(function () { place(false); });
    links.forEach(function (l) { mo.observe(l, { attributes: true, attributeFilter: ['class'] }); });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { place(true); });
      ro.observe(inner);
      links.forEach(function (l) { ro.observe(l); });
    }
    place(true);
  });


  // ── Up next (hover card) ───────────────────────────────────────────
  // For sighted pointer and keyboard users only (Radix's rule for hover
  // cards); the link itself still says where it goes.
  var nextLink = doc.querySelector('.case-nav a[aria-label="Next case study"]');
  var nextProject = nextLink && PROJECTS.filter(function (p) { return slug(p.href) === slug(nextLink.getAttribute('href')); })[0];
  if (nextProject) {
    nextLink.setAttribute('aria-label', 'Next case study: ' + nextProject.title);
    var card = null, cardTimer = 0;
    var buildCard = function () {
      if (card) return;
      card = el('div', 'ui-hovercard');
      card.setAttribute('aria-hidden', 'true');
      card.innerHTML = '<span class="ui-hovercard-media"><img alt="" decoding="async"></span>' +
        '<span class="ui-hovercard-body"><span class="ui-hovercard-eyebrow">Up next</span>' +
        '<span class="ui-hovercard-title"></span><span class="ui-hovercard-line"></span></span>';
      card.querySelector('img').src = nextProject.thumb;
      card.querySelector('.ui-hovercard-title').textContent = nextProject.title;
      card.querySelector('.ui-hovercard-line').textContent = nextProject.line;
      doc.body.appendChild(card);
    };
    var showCard = function () {
      buildCard();
      card.removeAttribute('data-state');
      var r = nextLink.getBoundingClientRect(), w = card.offsetWidth, h = card.offsetHeight, gap = 14;
      var side = r.top - h - gap > 8 ? 'top' : 'bottom';
      var x = Math.min(Math.max(8, r.left), root.clientWidth - w - 8);
      var y = side === 'top' ? r.top - h - gap : r.bottom + gap;
      card.style.left = Math.round(x + window.scrollX) + 'px';
      card.style.top = Math.round(y + window.scrollY) + 'px';
      card.setAttribute('data-side', side);
      void card.offsetWidth;
      card.setAttribute('data-state', 'open');
    };
    var hideCard = function () { clearTimeout(cardTimer); if (card) card.setAttribute('data-state', 'closed'); };
    nextLink.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      buildCard();                               // the picture loads during the wait
      clearTimeout(cardTimer);
      cardTimer = setTimeout(showCard, 350);
    });
    nextLink.addEventListener('pointerleave', function () { clearTimeout(cardTimer); cardTimer = setTimeout(hideCard, 120); });
    nextLink.addEventListener('pointerdown', hideCard);
    nextLink.addEventListener('focus', function () {
      var visible = true;
      try { visible = nextLink.matches(':focus-visible'); } catch (e) {}
      if (visible) showCard();
    });
    nextLink.addEventListener('blur', hideCard);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') hideCard(); });
  }
})();
