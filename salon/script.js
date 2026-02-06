// ============================================
// Studio Aura — Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile nav toggle ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // --- Nav scroll shadow ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 40);
    lastScroll = y;
  }, { passive: true });

  // --- Scroll reveal ---
  const revealEls = document.querySelectorAll(
    '.card-servico, .sobre__img-col, .sobre__text-col, .galeria__item, .depo-card, .cta__inner, .contato__info, .contato__form'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // --- Depoimentos carousel ---
  const track = document.getElementById('depoTrack');
  const prevBtn = document.getElementById('depoPrev');
  const nextBtn = document.getElementById('depoNext');
  let currentSlide = 0;

  function getVisibleCards() {
    const w = window.innerWidth;
    if (w <= 768) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function getTotalCards() {
    return track.children.length;
  }

  function getMaxSlide() {
    return Math.max(0, getTotalCards() - getVisibleCards());
  }

  function updateCarousel() {
    const card = track.children[0];
    if (!card) return;
    const gap = 24; // 1.5rem
    const cardW = card.offsetWidth + gap;
    track.style.transform = `translateX(-${currentSlide * cardW}px)`;
  }

  prevBtn.addEventListener('click', () => {
    currentSlide = Math.max(0, currentSlide - 1);
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentSlide = Math.min(getMaxSlide(), currentSlide + 1);
    updateCarousel();
  });

  window.addEventListener('resize', () => {
    currentSlide = Math.min(currentSlide, getMaxSlide());
    updateCarousel();
  });

  // --- Phone mask ---
  const phoneInput = document.getElementById('telefone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);

      if (v.length > 6) {
        v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      e.target.value = v;
    });
  }

  // --- Smooth active link highlight ---
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav__links a:not(.btn)');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.style.color = '';
      if (a.getAttribute('href') === `#${current}`) {
        a.style.color = 'var(--c-dark)';
      }
    });
  }, { passive: true });

});

// --- Form submit handler ---
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // Simula envio
  setTimeout(() => {
    btn.textContent = 'Agendamento enviado!';
    btn.style.background = '#5a8a60';

    setTimeout(() => {
      form.reset();
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 2500);
  }, 1200);
}
