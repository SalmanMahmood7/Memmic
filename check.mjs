import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForSelector("text=The media company, built");
await page.screenshot({ path: "/tmp/claude-1000/-mnt-d-Work-MEMMIC/1faa9c13-7ff8-4d83-b746-776e57186b0f/scratchpad/home.png", fullPage: true });

await page.getByRole("link", { name: "Read more about us" }).click();
await page.waitForURL("**/about");
await page.waitForSelector("text=How we operate.");
await page.screenshot({ path: "/tmp/claude-1000/-mnt-d-Work-MEMMIC/1faa9c13-7ff8-4d83-b746-776e57186b0f/scratchpad/about.png", fullPage: true });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
