// Run against a local HTTP server. Uses the caller's existing Playwright installation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.ROCKSO_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.ROCKSO_BROWSER_PATH ? { executablePath: process.env.ROCKSO_BROWSER_PATH } : {}),
});
const baseURL = process.env.ROCKSO_BASE_URL || 'http://127.0.0.1:8086';
const widths = [320, 390, 480, 539, 640, 768, 899, 900, 1024, 1025, 1100, 1199, 1200, 1280, 1440, 1920, 2560];
const files = [
  'index.html', 'index-en.html', 'demo-login.html', 'demo-login-en.html', 'beta-access.html',
  'mentions-legales.html', 'legal-notice-en.html', 'privacy.html', 'privacy-en.html',
  'cgu.html', 'terms-en.html', 'account-deletion.html', 'account-deletion-en.html', 'demo-app.html',
];
const results = [];

async function checkProductGallery(page, file, width) {
  const label = `${file} @${width}: product gallery`;
  const english = file === 'index-en.html';
  const gallery = page.locator('[data-product-gallery]');
  const track = gallery.locator('[data-gallery-track]');
  const previous = gallery.locator('[data-gallery-previous]');
  const next = gallery.locator('[data-gallery-next]');
  const position = gallery.locator('[data-gallery-position]');
  assert.equal(await gallery.count(), 1, `${label}: gallery missing`);
  await page.waitForFunction(compact => {
    const rail = document.querySelector('[data-gallery-track]');
    return rail.tabIndex === (compact ? 0 : -1);
  }, width < 900, { timeout: 3000 });
  assert.deepEqual(
    await gallery.locator('[data-gallery-slide] figcaption').allTextContents(),
    english ? ['Activity', 'Injury', 'AI assistant', 'Map', 'Week']
      : ['Activité', 'Blessure', 'Assistant IA', 'Carte', 'Semaine'],
    `${label}: five localized captions required`,
  );
  assert.equal(await track.getAttribute('role'), 'region', `${label}: labelled region required`);
  assert.equal(await track.getAttribute('aria-label'), english
    ? 'Rockso app previews' : "Aperçus de l'application Rockso", `${label}: region label not localized`);
  for (const [button, expected] of [[previous, english ? 'Previous preview' : 'Aperçu précédent'],
    [next, english ? 'Next preview' : 'Aperçu suivant']]) {
    assert.equal(await button.getAttribute('aria-label'), expected, `${label}: button label not localized`);
    assert.equal(await button.getAttribute('aria-controls'), await track.getAttribute('id'), `${label}: button controls another region`);
  }
  assert.equal(await position.getAttribute('aria-live'), 'polite', `${label}: position must announce user navigation`);

  const geometry = () => gallery.evaluate(element => {
    const rail = element.querySelector('[data-gallery-track]');
    const cards = [...element.querySelectorAll('[data-gallery-slide]')];
    const rect = rail.getBoundingClientRect();
    const fullyVisible = card => {
      const cardRect = card.getBoundingClientRect();
      return cardRect.left >= rect.left - 1 && cardRect.right <= rect.right + 1;
    };
    return {
      scrollWidth: rail.scrollWidth,
      clientWidth: rail.clientWidth,
      scrollLeft: rail.scrollLeft,
      limit: Math.max(0, rail.scrollWidth - rail.clientWidth),
      step: cards[1].offsetLeft - cards[0].offsetLeft,
      overflowX: getComputedStyle(rail).overflowX,
      columns: getComputedStyle(rail).gridTemplateColumns.trim().split(/\s+/).length,
      fullCards: cards.filter(fullyVisible).length,
      firstFullyVisible: fullyVisible(cards[0]),
      lastFullyVisible: fullyVisible(cards.at(-1)),
      partialNext: cards.some(card => {
        const cardRect = card.getBoundingClientRect();
        return cardRect.left < rect.right - 1 && cardRect.right > rect.right + 1;
      }),
      captionsFit: cards.every(card => {
        const caption = card.querySelector('figcaption').getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        return caption.left >= cardRect.left - 1 && caption.right <= cardRect.right + 1;
      }),
      imagesLoaded: cards.every(card => card.querySelector('img').naturalWidth > 0),
    };
  });
  const waitForScroll = target => page.waitForFunction(expected => {
    const rail = document.querySelector('[data-gallery-track]');
    return Math.abs(rail.scrollLeft - expected) <= 2;
  }, target, { timeout: 3000 });

  if (width < 900) {
    await track.focus();
    assert.equal(await track.getAttribute('tabindex'), '0', `${label}: rail not reachable by keyboard`);
    await page.keyboard.press('Home');
    await waitForScroll(0);
    const start = await geometry();
    assert.ok(start.limit > 1 && ['auto', 'scroll'].includes(start.overflowX), `${label}: compact rail does not scroll`);
    assert.ok(start.fullCards >= 1 && start.fullCards <= 2, `${label}: compact layout must show one or two full previews`);
    assert.ok(start.partialNext, `${label}: no visible next preview to suggest scrolling`);
    assert.ok(start.firstFullyVisible && start.captionsFit && start.imagesLoaded, `${label}: first preview or captions clipped`);
    assert.ok(await previous.isVisible() && await next.isVisible(), `${label}: scrolling buttons hidden`);
    const stride = Math.min(start.step, start.limit);
    assert.ok(stride > 0, `${label}: no usable card stride`);
    await page.keyboard.press('ArrowRight');
    await waitForScroll(stride);
    await page.keyboard.press('ArrowLeft');
    await waitForScroll(0);
    await page.keyboard.press('End');
    await waitForScroll(start.limit);
    assert.ok((await geometry()).lastFullyVisible, `${label}: final preview unreachable by keyboard`);
    await page.waitForFunction(expected =>
      document.querySelector('[data-gallery-position]').textContent === expected,
    english ? 'Preview 5 of 5' : 'Aperçu 5 sur 5', { timeout: 3000 });
    await page.keyboard.press('Home');
    await waitForScroll(0);
    await next.click();
    await waitForScroll(stride);
    await previous.click();
    await waitForScroll(0);
    assert.ok((await geometry()).firstFullyVisible, `${label}: previous button cannot return to first preview`);
    for (let index = 0; index < 4; index += 1) {
      const before = await geometry();
      if (before.limit - before.scrollLeft <= 2) break;
      await next.click();
      await waitForScroll(Math.min(before.scrollLeft + before.step, before.limit));
    }
    assert.ok((await geometry()).lastFullyVisible, `${label}: final preview unreachable by next button`);
    await track.focus();
    await page.keyboard.press('Home');
    await waitForScroll(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    return { ...start, keyboardAndButtons: true, buttonsReachLast: true };
  }

  const desktop = await geometry();
  assert.ok(!['auto', 'scroll'].includes(desktop.overflowX) && desktop.columns === 5 && desktop.fullCards === 5, `${label}: desktop must show all five previews in one grid`);
  assert.ok(desktop.captionsFit && desktop.imagesLoaded, `${label}: desktop previews or captions clipped`);
  assert.ok(!await previous.isVisible() && !await next.isVisible(), `${label}: desktop scrolling buttons should be hidden`);
  assert.equal(await track.getAttribute('tabindex'), '-1', `${label}: desktop region is an unnecessary keyboard stop`);
  return desktop;
}

try {
  const context = await browser.newContext();
  // Prevent any contact with the real backend during this layout-only recipe.
  await context.route('**/*.supabase.co/**', route => route.abort());
  const page = await context.newPage();
  for (const file of files) {
    await page.goto(`${baseURL}/${file}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    assert.deepEqual(await page.evaluate(() => [...document.images].filter(e => !e.naturalWidth).map(e => e.src)), [], `${file}: image failed to load`);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const result = await page.evaluate(({ file, width }) => {
        const visible = e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
        const clippedContent = [...document.querySelectorAll('a, button, h1, h2, h3, p, nav, input, select, figcaption')]
          .filter(visible).filter(e => {
            // Off-rail captions are intentional only inside a real scroll container.
            // The gallery-specific checks below verify their fit and reachability.
            const rail = e.closest('[data-gallery-track]');
            if (rail && rail.scrollWidth > rail.clientWidth + 1
              && ['auto', 'scroll'].includes(getComputedStyle(rail).overflowX)) return false;
            const r = e.getBoundingClientRect();
            return r.left < -1 || r.right > innerWidth + 1;
          }).map(e => `${e.tagName}.${e.className}: ${e.textContent.trim().slice(0, 40)}`);
        const section = document.querySelector('.section-screens-hero');
        const background = section?.querySelector('.section-screens-hero-media img');
        const hero = document.querySelector('.hero-v2');
        const phone = hero?.querySelector('.mock-part.full img');
        const phoneRect = phone?.getBoundingClientRect();
        const frameRect = hero?.querySelector('.mock-part.full').getBoundingClientRect();
        const heroRect = hero?.getBoundingClientRect();
        const title = hero?.querySelector('h1');
        return {
          file, width, documentWidth: document.documentElement.scrollWidth, clippedContent,
          visibleScreens: [...document.querySelectorAll('.screens-row .screen-mockup')].filter(visible).length,
          backgroundCovers: !section || background.getBoundingClientRect().height >= section.getBoundingClientRect().height - 1,
          phoneFullyInHero: !hero || (frameRect.top >= heroRect.top - 1 && frameRect.bottom <= heroRect.bottom + 1),
          phoneUnobscured: !phone || [.32, .5, .68].every(point => document.elementFromPoint(phoneRect.x + phoneRect.width * point, phoneRect.y + phoneRect.height / 2) === phone),
          titleLines: title ? Math.round(title.getBoundingClientRect().height / (+getComputedStyle(title).lineHeight.replace('px', ''))) : null,
        };
      }, { file, width });
      results.push(result);
      assert.ok(result.documentWidth <= width + 1, `${file} @${width}: document overflow`);
      assert.deepEqual(result.clippedContent, [], `${file} @${width}: content clipped`);
      assert.ok(result.backgroundCovers, `${file} @${width}: product background too short`);
      if (file.startsWith('index')) {
        assert.equal(result.visibleScreens, 5, `${file} @${width}: missing product screens`);
        assert.ok(result.phoneFullyInHero, `${file} @${width}: central phone clipped by hero`);
        assert.ok(result.phoneUnobscured, `${file} @${width}: photos obscure central phone`);
        assert.equal(result.titleLines, 3, `${file} @${width}: headline phrases wrap`);
        result.gallery = await checkProductGallery(page, file, width);
      }
    }
    const toggle = page.locator('.nav-toggle-v2, .nav-toggle');
    if (await toggle.count()) {
      for (const viewport of [{ width: 390, height: 900 }, { width: 1024, height: 500 }]) {
        await page.goto(`${baseURL}/${file}`, { waitUntil: 'load' });
        await page.setViewportSize(viewport);
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true', `${file}: menu did not open`);
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false', `${file}: Escape did not close menu`);
        assert.ok(await toggle.evaluate(e => e === document.activeElement), `${file}: menu focus not restored`);
        await toggle.click();
        await page.locator('.main-nav-v2 a, .main-nav a').first().click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false', `${file}: link did not close menu`);
        await toggle.click();
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForFunction(() => document.querySelector('.nav-toggle-v2, .nav-toggle')?.getAttribute('aria-expanded') === 'false');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false', `${file}: desktop resize left menu open`);
      }
    }
    console.log(`${file}: ${widths.length} widths and navigation OK`);
  }
  if (process.env.ROCKSO_REPORT_PATH) await fs.writeFile(process.env.ROCKSO_REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`${results.length} page/viewport checks passed.`);
} finally {
  await browser.close();
}
