// Run against a local HTTP server. Uses the caller's existing Playwright installation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.ROCKSO_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.ROCKSO_BROWSER_PATH ? { executablePath: process.env.ROCKSO_BROWSER_PATH } : {}),
});
const baseURL = process.env.ROCKSO_BASE_URL || 'http://127.0.0.1:8086';
const widths = [320, 390, 480, 640, 768, 900, 1024, 1100, 1199, 1200, 1280, 1440, 1920, 2560];
const files = [
  'index.html', 'index-en.html', 'demo-login.html', 'demo-login-en.html', 'beta-access.html',
  'mentions-legales.html', 'legal-notice-en.html', 'privacy.html', 'privacy-en.html',
  'cgu.html', 'terms-en.html', 'account-deletion.html', 'account-deletion-en.html', 'demo-app.html',
];
const results = [];
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
        const clippedContent = [...document.querySelectorAll('a, button, h1, h2, h3, p, nav, input, select')]
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
