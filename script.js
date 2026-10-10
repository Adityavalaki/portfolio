/* Race Programme — page behaviour. Plain JavaScript, no dependencies.
   The page is complete without it; this adds the running header, contents
   overlay, scroll-linked type, reveals, the spec drawing links, copy and the form. */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  /* ---------- loading intro: one lap of the racing line, then fade ---------- */
  var loader = $('#loader');
  if (loader && !doc.documentElement.classList.contains('intro-seen')) {
    var lap = $('.loader__lap', loader);
    var lapped = reduce || !lap;                  // reduced motion: the line is drawn already
    var loaded = doc.readyState === 'complete';
    var started = false;
    var finish = function () {
      if (started) return;
      started = true;
      setTimeout(function () {
        loader.classList.add('is-done');
        setTimeout(function () { loader.remove(); }, 600);
      }, reduce ? 600 : 250);
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    };
    var maybeGo = function () { if (lapped && loaded) finish(); };
    if (!lapped) lap.addEventListener('animationend', function () { lapped = true; maybeGo(); });
    if (!loaded) window.addEventListener('load', function () { loaded = true; maybeGo(); });
    maybeGo();
    setTimeout(finish, 4000);         // never hold the page on a slow asset
  } else if (loader) {
    loader.remove();
  }

  /* ---------- running header + scroll-linked type ---------- */
  var runner = $('#runner');
  var runnerSec = $('#runnerSec');
  var runnerBar = $('#runnerBar');
  var cover = $('.cover');
  var drift = $$('[data-drift]');
  var photo = $('[data-parallax]');
  var floaters = $$('[data-float]');
  var sections = $$('[data-n]');
  var runnerFocusables = runner ? $$('a, button', runner) : [];
  var runnerOn = false;

  function setRunner(on) {
    if (!runner || on === runnerOn) return;
    runnerOn = on;
    runner.classList.toggle('is-on', on);
    runner.setAttribute('aria-hidden', String(!on));
    runnerFocusables.forEach(function (el) { el.tabIndex = on ? 0 : -1; });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var max = Math.max(1, doc.documentElement.scrollHeight - vh);
    var coverH = cover ? cover.offsetHeight : 600;

    setRunner(y > coverH * 0.8);
    if (runnerBar) runnerBar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';

    var current = null;
    var probe = y + vh * 0.35;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top + y <= probe) current = s; });
    if (runnerSec) runnerSec.textContent = current ? pad(current.dataset.n) + ' · ' + current.dataset.name : 'Cover';

    if (reduce) return;
    var p = Math.min(1, y / coverH);
    drift.forEach(function (el) { el.style.transform = 'translate3d(' + (p * 70 * +el.dataset.drift).toFixed(1) + 'px,0,0)'; });
    if (photo) photo.style.transform = 'translate3d(0,' + (-p * 36).toFixed(1) + 'px,0)';
    floaters.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var f = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
      el.style.transform = 'translate3d(0,' + (f * 40).toFixed(1) + 'px,0)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- contents overlay ---------- */
  var contents = $('#contents');
  var openBtn = $('#contentsBtn');
  var closeBtn = $('#contentsClose');
  var lastFocus = null;
  function openContents() {
    lastFocus = doc.activeElement;
    contents.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    doc.body.style.overflow = 'hidden';
    var first = $('a', contents);
    if (first) first.focus();
  }
  function closeContents(restore) {
    if (contents.hidden) return;
    contents.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    doc.body.style.overflow = '';
    if (restore !== false && lastFocus) lastFocus.focus();
  }
  var openers = $$('[data-contents]');
  if (contents && openers.length) {
    openers.forEach(function (b) { b.addEventListener('click', function () { openBtn = b; openContents(); }); });
    closeBtn.addEventListener('click', function () { closeContents(); });
    contents.addEventListener('click', function (e) {
      if (e.target === contents) closeContents();
      if (e.target.closest('a')) closeContents(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (contents.hidden) return;
      if (e.key === 'Escape') closeContents();
      if (e.key === 'Tab') { // keep focus inside the panel
        var f = $$('a, button', contents);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- reveals ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- technical specification: link drawing parts and rows ---------- */
  var tech = $('.tech');
  if (tech) {
    var linked = $$('[data-part]', tech);
    var pinned = null;
    var light = function (name) {
      linked.forEach(function (el) { el.classList.toggle('is-hot', !!name && el.dataset.part === name); });
    };
    linked.forEach(function (el) {
      var name = el.dataset.part;
      el.addEventListener('mouseenter', function () { light(name); });
      el.addEventListener('mouseleave', function () { light(pinned); });
      el.addEventListener('focus', function () { light(name); });
      el.addEventListener('blur', function () { light(pinned); });
      el.addEventListener('click', function () { // touch: tap to pin, tap again to clear
        pinned = pinned === name ? null : name;
        light(pinned);
      });
    });
  }

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(function (btn) {
    var label = $('span', btn);
    var idle = label.textContent;
    function say(t) { label.textContent = t; setTimeout(function () { label.textContent = idle; }, 1800); }
    function selectText() {
      var t = $('#emailAddr');
      if (!t) return;
      var r = doc.createRange(); r.selectNodeContents(t);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      say('Selected');
    }
    btn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(btn.dataset.copy).then(function () { say('Copied'); }, selectText);
      } else { selectText(); }
    });
  });

  /* ---------- contact form ---------- */
  // Web3Forms access key — public by design, it only lets the form email this inbox.
  var WEB3FORMS_ACCESS_KEY = '9bccc536-0da5-42b4-bd2e-66e7baf5aab6';
  var form = $('#contactForm');
  if (form) {
    var status = $('#cf-status');
    var submit = $('#cf-submit');
    var email = ($('[data-copy]') || { dataset: {} }).dataset.copy || '';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name.'; },
      email: function (v) { return EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Write at least 10 characters.'; }
    };

    function setError(input, text) {
      var id = input.id + '-err';
      var err = doc.getElementById(id);
      if (text) {
        if (!err) { err = doc.createElement('span'); err.id = id; err.className = 'field__err'; input.parentNode.appendChild(err); }
        err.textContent = text;
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', id);
      } else {
        if (err) err.remove();
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    }
    function say(text, withMail) {
      status.textContent = text;
      if (withMail) {
        var a = doc.createElement('a');
        a.href = 'mailto:' + withMail;
        a.textContent = withMail;
        status.appendChild(a);
        status.appendChild(doc.createTextNode('.'));
      }
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid')) setError(input, rules[name](input.value)); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        var msg = rules[name](input.value);
        setError(input, msg);
        if (msg && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      submit.disabled = true;
      submit.textContent = 'Sending…';
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 9000);

      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'New portfolio message from ' + form.elements.name.value.trim(),
          from_name: 'Portfolio Contact Form',
          name: form.elements.name.value,
          email: form.elements.email.value,
          replyto: form.elements.email.value,
          message: form.elements.message.value,
          botcheck: form.elements.company.value
        }),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (b) { return { res: res, body: b }; }); })
        .then(function (r) {
          if (r.res.ok && r.body.success !== false) { form.reset(); say('Message sent. Thank you, I will reply soon.'); }
          else if (r.res.status === 400 && r.body.errors) {
            Object.keys(r.body.errors).forEach(function (k) { if (form.elements[k]) setError(form.elements[k], r.body.errors[k]); });
            say('Check the highlighted fields.');
          } else if (r.res.status === 429) { say(r.body.message || 'Too many messages. Try again in a few minutes.'); }
          else { say('The form cannot send from here right now. Email me at ', email); }
        })
        .catch(function () { say('The form cannot send from here right now. Email me at ', email); })
        .then(function () { clearTimeout(timer); submit.disabled = false; submit.textContent = 'Send message'; });
    });
  }
})();
