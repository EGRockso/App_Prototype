/* Native swipe/trackpad scrolling, with equivalent keyboard and button controls. */
document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('[data-gallery-track]');
  const slides = [...gallery.querySelectorAll('[data-gallery-slide]')];
  const previous = gallery.querySelector('[data-gallery-previous]');
  const next = gallery.querySelector('[data-gallery-next]');
  const dots = gallery.querySelector('.gallery-dots');
  const position = gallery.querySelector('[data-gallery-position]');
  if (!track || slides.length < 2 || !previous || !next || !dots || !position) return;

  const compact = matchMedia('(max-width: 899px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const english = document.documentElement.lang === 'en';
  const indicators = slides.map(() => dots.appendChild(document.createElement('span')));
  let offsets = [];
  let active = -1;
  let frame = 0;

  function update() {
    const left = track.scrollLeft;
    const index = offsets.reduce((nearest, offset, i) =>
      Math.abs(offset - left) < Math.abs(offsets[nearest] - left) ? i : nearest, 0);
    if (index === active) return;
    active = index;
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    indicators.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    position.textContent = english ? `Preview ${active + 1} of ${slides.length}`
      : `Aperçu ${active + 1} sur ${slides.length}`;
  }

  function measure() {
    const limit = Math.max(0, track.scrollWidth - track.clientWidth);
    const scrollable = compact.matches && limit > 1;
    gallery.dataset.galleryScrollable = String(scrollable);
    track.tabIndex = scrollable ? 0 : -1;
    // Match native center snapping, including the clamped first and last slides.
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    offsets = slides.map(slide => {
      const rect = slide.getBoundingClientRect();
      return Math.max(0, Math.min(limit, track.scrollLeft + rect.left + rect.width / 2 - center));
    });
    update();
  }

  function goTo(index) {
    track.scrollTo({
      left: offsets[Math.max(0, Math.min(index, slides.length - 1))],
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  previous.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  track.addEventListener('keydown', (event) => {
    if (!compact.matches || event.target !== track || event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  compact.addEventListener('change', measure);
  new ResizeObserver(measure).observe(track);
  measure();
});
