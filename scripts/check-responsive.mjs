// Run against a local HTTP server. Uses the caller's existing Playwright installation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium, devices } = await import(process.env.ROCKSO_PLAYWRIGHT_MODULE || 'playwright');
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
    await gallery.locator('[data-gallery-slide] img').evaluateAll(images => images.map(image => image.alt)),
    english ? ['Rockso activity screen', 'Injury screen', 'AI coach assistant screen', 'Map screen', 'Week screen']
      : ['Écran activité Rockso', 'Écran blessure', 'Écran assistant coach IA', 'Écran carte', 'Écran semaine'],
    `${label}: five localized image descriptions required`,
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
      imagesLoaded: cards.every(card => card.querySelector('img').naturalWidth > 0),
    };
  });
  assert.equal(await gallery.locator('figcaption, #product-gallery-hint').count(), 0);
  const nav = gallery.locator('.product-gallery-nav');
  if (width < 900) {
    const imagesInsideSlides = await gallery.locator('[data-gallery-slide]').evaluateAll(slides =>
      slides.every(slide => {
        const card = slide.getBoundingClientRect();
        const image = slide.querySelector('img').getBoundingClientRect();
        return image.left >= card.left - 1 && image.right <= card.right + 1;
      }));
    assert.ok(imagesInsideSlides, `${label}: mobile image boxes must stay inside their slides`);
    const navBox = await nav.boundingBox();
    const railBox = await track.boundingBox();
    assert.ok(navBox && railBox && navBox.y >= railBox.y + railBox.height - 1, `${label}: controls must follow previews`);
    assert.equal((await nav.innerText()).trim(), await position.textContent());
    assert.equal(await position.evaluate(el => getComputedStyle(el).clipPath), 'inset(50%)');
    const dots = nav.locator('.gallery-dots > span');
    assert.equal(await dots.count(), 5);
    assert.equal(await nav.locator('.gallery-dots').getAttribute('aria-hidden'), 'true');

    // Verify the dot and live announcement when the actual slide reaches its snap point.
    const waitForSlide = index => page.waitForFunction(({index, text}) => {
      const rail = document.querySelector('[data-gallery-track]');
      const card = rail.children[index].getBoundingClientRect();
      const railBox = rail.getBoundingClientRect();
      const centered = rail.scrollLeft + card.left + card.width / 2 - railBox.left - rail.clientWidth / 2;
      const offset = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, centered));
      const active = document.querySelectorAll('.gallery-dots .is-active');
      return Math.abs(rail.scrollLeft - offset) <= 2 && active.length === 1
        && active[0] === document.querySelector('.gallery-dots').children[index]
        && document.querySelector('[data-gallery-position]').textContent === text;
    }, {index, text:english ? `Preview ${index+1} of 5` : `Aperçu ${index+1} sur 5`}, {timeout:3000});

    await track.focus();
    await page.keyboard.press('Home');
    await waitForSlide(0);
    const start = await geometry();
    assert.ok(start.limit > 1 && ['auto', 'scroll'].includes(start.overflowX), `${label}: rail does not scroll`);
    assert.ok(start.fullCards >= 1 && start.fullCards <= 2, `${label}: one or two complete previews expected`);
    assert.ok(start.firstFullyVisible && start.partialNext && start.imagesLoaded, `${label}: first slide or partial next slide missing`);
    assert.ok(await previous.isDisabled() && await next.isEnabled());
    await page.keyboard.press('ArrowRight');
    await waitForSlide(1);
    await page.keyboard.press('ArrowLeft');
    await waitForSlide(0);
    await page.keyboard.press('End');
    await waitForSlide(4);
    assert.ok((await geometry()).lastFullyVisible && await next.isDisabled());
    await page.keyboard.press('Home');
    await waitForSlide(0);
    for (let i = 1; i < 5; i++) {
      await next.click();
      await waitForSlide(i);
    }
    for (let i = 3; i >= 0; i--) {
      await previous.click();
      await waitForSlide(i);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    return { ...start, keyboardAndButtons: true, allFiveDots: true };
  }

  const desktop = await geometry();
  assert.ok(!['auto', 'scroll'].includes(desktop.overflowX) && desktop.columns === 5 && desktop.fullCards === 5, `${label}: desktop must show all five previews in one grid`);
  assert.ok(desktop.imagesLoaded, `${label}: desktop preview missing`);
  assert.ok(!await nav.isVisible(), `${label}: desktop navigation must be hidden`);
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
  for (const device of ['iPhone 13', 'Pixel 7']) {
    const touch = await browser.newContext({...devices[device], reducedMotion:'reduce'});
    await touch.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL).origin
      ? route.continue() : route.abort());
    const mobile = await touch.newPage();
    const cdp = await touch.newCDPSession(mobile);
    for (const file of ['index.html', 'index-en.html']) {
      await mobile.goto(`${baseURL}/${file}`);
      const track = mobile.locator('[data-gallery-track]');
      await track.scrollIntoViewIfNeeded();
      const box = await track.boundingBox();
      const y = box.y + box.height / 2;
      const point = fraction => [{x:box.x + box.width * fraction, y}];
      await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:point(.85)});
      for (const fraction of [.7, .55, .4, .25]) {
        await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:point(fraction)});
      }
      await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
      await mobile.waitForFunction(() => {
        const track = document.querySelector('[data-gallery-track]');
        const active = document.querySelector('.gallery-dots .is-active');
        const i = [...document.querySelector('.gallery-dots').children].indexOf(active);
        if (i < 1 || track.scrollLeft < 50) return false;
        const card = track.children[i].getBoundingClientRect();
        const center = track.getBoundingClientRect().left + track.clientWidth / 2;
        const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
        return (Math.abs(card.left + card.width / 2 - center) <= 2 || (atEnd && i === 4))
          && document.querySelector('[data-gallery-position]').textContent.includes(String(i + 1));
      });
      console.log(`${file}: ${device} native touch swipe OK`);
    }
    await touch.close();
  }
  if (process.env.ROCKSO_REPORT_PATH) await fs.writeFile(process.env.ROCKSO_REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`${results.length} page/viewport checks passed.`);
} finally {
  await browser.close();
}
