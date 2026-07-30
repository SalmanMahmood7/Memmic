import { chromium } from "playwright";

const outDir = "/tmp/claude-1000/-mnt-d-Work-MEMMIC/07615f56-c998-4ba1-88e9-5e8c7ebcbebe/scratchpad";

const browser = await chromium.launch({ args: ["--no-sandbox"] });

async function run(viewport, label) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

  await page.goto("http://localhost:5183", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${label}-hero.png` });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${label}-about.png` });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${label}-cases.png` });

  console.log(`[${label}] console errors:`, errors.length ? errors : "none");
  await page.close();
}

await run({ width: 1440, height: 900 }, "desktop");
await run({ width: 390, height: 844 }, "mobile");

// mobile menu open state
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:5183", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click("text=Menu");
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/mobile-menu-open.png` });
  await page.close();
}

await browser.close();
console.log("done");
