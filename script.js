document.addEventListener('DOMContentLoaded', () => {

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ----------------------------------------------------------
     Page loader
  ---------------------------------------------------------- */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), 500));
    // Fallback in case 'load' already fired
    setTimeout(() => loader.classList.add('done'), 2200);
  }

  /* ----------------------------------------------------------
     Custom cursor — teal dot + outline with hover color shift
  ---------------------------------------------------------- */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');

  if (finePointer && !prefersReduced && cursorDot && cursorOutline) {
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let outlineX = mouseX, outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const renderCursor = () => {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    // Color-shift on interactive elements
    document.querySelectorAll('a, button, .glass-card, .highlight-card, .project-card, .tag, .timeline-item, input, textarea')
      .forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
  } else {
    if (cursorDot) cursorDot.remove();
    if (cursorOutline) cursorOutline.remove();
  }

  /* ----------------------------------------------------------
     Scroll progress bar
  ---------------------------------------------------------- */
  const progress = document.getElementById('scrollProgress');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? scrollTop / docHeight : 0;

    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (nav) nav.classList.toggle('scrolled', scrollTop > 50);

    // Active nav link based on section in view
    let current = '';
    sections.forEach(sec => {
      if (scrollTop >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     Animated timeline draw (line fills as you scroll past)
  ---------------------------------------------------------- */
  const timeline = document.querySelector('.timeline');
  if (timeline && !prefersReduced) {
    const drawTimeline = () => {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const total = r.height;
      const drawn = Math.min(Math.max(start - r.top, 0), total);
      const pct = total > 0 ? (drawn / total) * 100 : 0;
      timeline.style.setProperty('--draw', `${pct}%`);
      requestAnimationFrame(drawTimeline);
    };
    drawTimeline();
  } else if (timeline) {
    timeline.style.setProperty('--draw', '100%');
  }

  /* ----------------------------------------------------------
     Reveal on scroll + stagger within groups
  ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-up');
  // Apply stagger based on index within parent
  fadeEls.forEach(el => {
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('fade-up'));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx * 0.08, 0.5)}s`;
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  fadeEls.forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     Animated number counters
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(eased * target) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        prefersReduced
          ? entry.target.textContent = entry.target.dataset.count + (entry.target.dataset.suffix || '')
          : animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => countObserver.observe(el));

  /* ----------------------------------------------------------
     Contact form -> Email (Web3Forms) + WhatsApp
  ---------------------------------------------------------- */

  // 🔑 SETUP STEP — get a free Web3Forms access key (takes 30 seconds):
  //   1. Visit https://web3forms.com/
  //   2. Enter adityavalaki1110@gmail.com → click "Create Access Key"
  //   3. Check that inbox → copy the key from the welcome email
  //   4. Paste it below, replacing YOUR_WEB3FORMS_ACCESS_KEY
  // Until you replace the placeholder, the form will still open WhatsApp
  // but won't email you a copy.
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  const NOTIFY_EMAIL = 'adityavalaki1110@gmail.com';

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      // ---- 1. Open WhatsApp synchronously (inside the click gesture so
      //         popup blockers don't swallow it). ----
      const whatsappNumber = '918866215250'; // +91 8866215250
      const text = `*New Contact Form Submission*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      const waWin = window.open(whatsappUrl, '_blank');

      // ---- 2. Fire-and-forget email via Web3Forms in the background. ----
      if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            to: NOTIFY_EMAIL,
            from_name: 'Portfolio Contact Form',
            subject: `New portfolio message from ${name}`,
            name,
            email,
            message,
            replyto: email,
            botcheck: '',
          }),
        }).catch(() => { /* silent — WhatsApp still went through */ });
      }

      // ---- 3. UI feedback / fallback. ----
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
        // Popup blocked — fall back to same-tab WhatsApp redirect.
        window.location.href = whatsappUrl;
        return;
      }

      btn.innerHTML = '<i class="fas fa-check"></i> Message sent — opening WhatsApp…';
      btn.style.background = 'linear-gradient(135deg, var(--emerald), #10b981)';
      form.reset();
      setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; }, 3500);
    });
  }

});
