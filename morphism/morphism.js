/* ══════════════════════════════════════════════════════════════════════
   Morphism — behaviour only. The boot script in <head> has already set
   html[data-morphism] before first paint and defined window.MORPHISM:
   the storage key, the systems this page renders, and its fallback.

   Pages differ in one way. The home page renders all five systems, Flat
   included, and carries the switcher. A case study renders the four
   material systems and has no switcher: Flat there is simply the page's
   own stylesheet, which means no attribute at all (and no fallback).

   Theme state and page state are independent by construction: switching
   only rewrites one attribute on <html>, so a chosen filter, an open row
   and the scroll position all stay exactly where they were.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var root = document.documentElement;
  var cfg = window.MORPHISM;
  if (!cfg) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return 'unavailable'; } }

  // The attribute this page carries for a stored choice: the choice itself
  // if the page renders it, otherwise the page's fallback, if it has one.
  function resolve(value) {
    return cfg.systems.indexOf(value) !== -1 ? value : (cfg.fallback || null);
  }
  function set(value) {
    if (value) root.setAttribute('data-morphism', value);
    else root.removeAttribute('data-morphism');
  }

  // Cross-fade between two finished states. Where view transitions are not
  // supported, or motion is reduced, or the tab is in the background, the
  // switch is simply immediate.
  function morph(update) {
    if (document.startViewTransition && !reduced.matches && document.visibilityState === 'visible') {
      document.startViewTransition(update);
    } else {
      update();
    }
  }
  // Exposed for the light/dark toggle, so both kinds of switch fade alike.
  cfg.transition = morph;

  // Another tab changed it: follow along, without a transition.
  addEventListener('storage', function (e) {
    if (e.key !== cfg.key) return;
    set(resolve(e.newValue));
    syncSwitch();
  });


  // ── header state ─────────────────────────────────────────────────
  // Neumorphic and glass headers only separate from the page once content
  // is actually passing beneath them.
  var scrolled = null;
  function onScroll() {
    var s = window.scrollY > 8;
    if (s !== scrolled) { scrolled = s; root.classList.toggle('is-scrolled', s); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // iOS only applies :active (the press feedback) when a touch listener exists.
  document.addEventListener('touchstart', function () {}, { passive: true });


  // ── the switcher (home page only) ────────────────────────────────
  var group = document.getElementById('morph-switch');
  var inputs = group ? Array.prototype.slice.call(group.querySelectorAll('.morph-input')) : [];

  function syncSwitch() {
    var current = root.getAttribute('data-morphism');
    inputs.forEach(function (input) { input.checked = input.value === current; });
  }

  if (!group || !root.hasAttribute('data-morphism')) return;

  var hint = document.getElementById('morph-hint');
  var HINT_KEY = 'morphism-hint-seen';

  function choose(next) {
    if (cfg.systems.indexOf(next) === -1 || next === root.getAttribute('data-morphism')) return;
    morph(function () { root.setAttribute('data-morphism', next); });
    store(cfg.key, next);
    dismissHint();
  }

  group.addEventListener('change', function (e) {
    if (e.target && e.target.classList.contains('morph-input')) choose(e.target.value);
  });

  // bfcache and form restoration can hand the radios back in a stale state
  addEventListener('pageshow', syncSwitch);
  syncSwitch();


  // ── one-time hint ────────────────────────────────────────────────
  // Only for a first visit: never once a system has been chosen, never
  // twice. Marked as seen the moment it appears, so a visitor who ignores
  // it is not asked again.
  var hintTimer = 0;
  function dismissHint() {
    clearTimeout(hintTimer);
    if (!hint || hint.hidden) return;
    hint.classList.remove('is-visible');
    setTimeout(function () { hint.hidden = true; }, reduced.matches ? 0 : 240);
  }
  if (hint && !read(HINT_KEY) && !read(cfg.key)) {
    hintTimer = setTimeout(function () {
      // phones have no switcher, so nothing to point at — and it must not
      // be marked as seen when nobody could have seen it
      if (!group.getClientRects().length) return;
      hint.hidden = false;
      store(HINT_KEY, '1');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { hint.classList.add('is-visible'); });
      });
      hintTimer = setTimeout(dismissHint, 8000);
    }, 1400);
    var close = hint.querySelector('.morph-hint-close');
    if (close) close.addEventListener('click', dismissHint);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') dismissHint(); });
  }
})();
