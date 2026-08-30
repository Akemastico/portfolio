import { test, expect } from "@playwright/test";
import path from "node:path";

const INDEX_URL = "file://" + path.resolve(__dirname, "..", "index.html");

test.use({ viewport: { width: 375, height: 667 } });

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_URL);
});

test("sem overflow horizontal em viewport mobile", async ({ page }) => {
  await page.mouse.click(187, 640); // entra
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw).toBeLessThanOrEqual(cw);
});

test("toque na lateral retorna ao menu no mobile", async ({ page }) => {
  const intro = page.getByRole("button", { name: "Entrar no portfolio" });
  await page.mouse.click(187, 640); // entra
  await expect(intro).toBeHidden();
  await page.mouse.click(370, 333); // toca a borda direita
  await expect(intro).toBeVisible();
});
