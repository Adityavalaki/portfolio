document.addEventListener('DOMContentLoaded', () => {

  // Subtle Cursor Follower (only on fine pointers)
  const cursorOutline = document.getElementById('cursor-outline');
  const fineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursorOutline && fineCursor) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      cursorOutline.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Simple hover state on interactive elements
    const interactive = document.querySelectorAll('a, button, .glass-card, .highlight-card, .tag');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  } else if (cursorOutline) {
    cursorOutline.remove();
  }

  // Navbar Scroll Effect
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // Scroll Animations (Intersection Observer)
  const fadeUpEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  fadeUpEls.forEach(el => observer.observe(el));

  // Contact Form Submission -> WhatsApp
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const message = document.getElementById('contactMessage').value;

      const whatsappNumber = "918866215250";
      const text = `*New Contact Form Submission*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');

        btn.innerHTML = '<i class="fas fa-check"></i> Redirecting to WhatsApp!';
        btn.style.background = 'linear-gradient(135deg, var(--emerald), #10b981)';
        form.reset();

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 3000);
      }, 400);
    });
  }

});
