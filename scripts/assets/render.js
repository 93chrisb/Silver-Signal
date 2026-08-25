#!/usr/bin/env node
// One-off image renderer: turns the HTML templates in this folder into the
// PNG assets used for og:image and JSON-LD logo/publisher.logo. Not part of
// the regular `npm run build` — run manually with `node scripts/assets/render.js`
// whenever the brand visuals need to change.
const path = require("path");
const { chromium } = require("playwright-core");

const EXECUTABLE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const ROOT = path.join(__dirname, "..", "..");

async function shot(htmlFile, outFile, width, height) {
  const browser = await chromium.launch({ executablePath: EXECUTABLE });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(__dirname, htmlFile));
  await page.waitForTimeout(300); // let webfonts settle
  await page.screenshot({ path: path.join(ROOT, outFile) });
  await browser.close();
  console.log("wrote", outFile);
}

(async () => {
  await shot("og-image.html", "images/og-image.png", 1200, 630);
  await shot("logo.html", "images/logo.png", 512, 512);
})();
