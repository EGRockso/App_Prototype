/* Native swipe/trackpad scrolling, with equivalent keyboard and button controls. */
document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('[data-gallery-track]');
  const slides = [...gallery.querySelectorAll('[data-gallery-slide]')];
  const previous = gallery.querySelector('[data-gallery-previous]');
  const next = gallery.querySelector('[data-gallery-next]');
  const position = gallery.querySelector('[data-gallery-position]');
  if (!track || slides.length < 2 || !previous || !next || !position) return;

  const compact = matchMedia('(max-width: 899px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const english = document.documentElement.lang === 'en';
  let frame = 0;

  const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
  const scrollTo = (left) => track.scrollTo({
    left,
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
  });

  function update() {
    const limit = Math.max(0, track.scrollWidth - track.clientWidth);
    const scrollable = compact.matches && limit > 1;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= limit - 2;
    gallery.dataset.galleryScrollable = String(scrollable);
    track.tabIndex = scrollable ? 0 : -1;
    previous.disabled = !scrollable || atStart;
    next.disabled = !scrollable || atEnd;
    const index = atEnd && scrollable ? slides.length - 1
      : Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / step())));
    const text = english ? `Preview ${index + 1} of ${slides.length}`
      : `Aperçu ${index + 1} sur ${slides.length}`;
    if (position.textContent !== text) position.textContent = text;
  }

  previous.addEventListener('click', () => scrollTo(track.scrollLeft - step()));
  next.addEventListener('click', () => scrollTo(track.scrollLeft + step()));
  track.addEventListener('keydown', (event) => {
    if (!compact.matches || event.target !== track || event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = {
      ArrowLeft: track.scrollLeft - step(),
      ArrowRight: track.scrollLeft + step(),
      Home: 0,
      End: track.scrollWidth - track.clientWidth,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    scrollTo(destinations[event.key]);
  });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  compact.addEventListener('change', () => {
    track.scrollTo({ left: 0, behavior: 'auto' });
    update();
  });
  new ResizeObserver(update).observe(track);
  update();
});
