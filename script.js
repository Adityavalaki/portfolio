document.addEventListener('DOMContentLoaded', () => {

  // Custom Cursor
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    // Add small delay to outline for smooth effect
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
  });

  // Cursor Hover Effects
  const links = document.querySelectorAll('a, button, .magnetic, .project-card, .highlight-card');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    link.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // Magnetic Buttons
  const magneticEls = document.querySelectorAll('.magnetic');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const position = el.getBoundingClientRect();
      const x = e.pageX - position.left - position.width / 2;
      const y = e.pageY - position.top - position.height / 2;
      
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
    });
    
    el.addEventListener('mouseout', () => {
      el.style.transform = 'translate(0px, 0px)';
    });
  });

  // 3D Tilt Effect for Cards
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });

  // Navbar Scroll Effect
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Scroll Animations (Intersection Observer)
  const fadeUpEls = document.querySelectorAll('.fade-up');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  fadeUpEls.forEach(el => observer.observe(el));

  // Contact Form Submission
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
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmitting...';
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        
        btn.innerHTML = '<i class="fas fa-check"></i> Redirecting to WhatsApp!';
        btn.style.background = 'linear-gradient(135deg, var(--emerald), #10b981)';
        form.reset();
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 3000);
      }, 500);
    });
  }

});
