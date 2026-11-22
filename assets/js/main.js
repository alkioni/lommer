(() => {
  const nav = document.getElementById('nav');
  const toggle = nav && nav.querySelector('.nav__toggle');

  // Nav: hairline on scroll, mobile menu
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('.nav__links a').forEach(a =>
      a.addEventListener('click', () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); })
    );
  }

  // Reveal on scroll
  const els = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('is-in'));
  }

  // Horizontal rails: arrow buttons
  document.querySelectorAll('[data-rail]').forEach(rail => {
    const track = rail.querySelector('.rail__track');
    const btns = rail.querySelectorAll('.rail__btn');
    if (!btns.length) return;
    const update = () => {
      btns[0].disabled = track.scrollLeft <= 4;
      btns[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    btns.forEach(b => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.7, behavior: 'smooth' });
    }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // EvaTwo colour swatches
  document.querySelectorAll('[data-swap]').forEach(box => {
    const imgs = box.querySelectorAll('img');
    const sw = box.querySelectorAll('.swatch');
    sw.forEach((s, i) => s.addEventListener('click', () => {
      imgs.forEach((im, j) => im.classList.toggle('is-on', i === j));
      sw.forEach((x, j) => x.classList.toggle('is-on', i === j));
    }));
  });

  // Gentle parallax on the statement image
  document.querySelectorAll('[data-parallax]').forEach(bg => {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const sec = bg.parentElement;
    const tick = () => {
      const r = sec.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height) / (innerHeight + r.height); // 1 → 0
        bg.style.transform = `translateY(${(p - 1) * 12}%)`;
      }
    };
    tick();
    window.addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
  }
  });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
