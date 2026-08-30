import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

const INDEX_URL = "file://" + path.resolve(__dirname, "..", "index.html");

const VIEW = { width: 1280, height: 720 };
const BOTTOM_Y = VIEW.height - 20; // dentro dos 60px de sensibilidade da base
const SIDE_X = VIEW.width - 4; // dentro dos 12px de sensibilidade lateral
const CENTER = { x: VIEW.width / 2, y: VIEW.height / 2 };

async function enter(page: Page) {
  await page.mouse.move(CENTER.x, BOTTOM_Y);
  await expect(page.locator(".window.is-in")).toHaveCount(4);
}

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_URL);
});

test("intro é exibida e terminais ocultos no carregamento", async ({ page }) => {
  const intro = page.getByRole("button", { name: "Entrar no portfolio" });
  await expect(intro).toBeVisible();
  await expect(intro.getByText("AKEMISTICO")).toBeVisible();
  await expect(page.locator(".window.is-in")).toHaveCount(0);
});

test("deslizar o mouse na base abre os terminais", async ({ page }) => {
  const intro = page.getByRole("button", { name: "Entrar no portfolio" });
  await page.mouse.move(CENTER.x, BOTTOM_Y);
  await expect(intro).toBeHidden();
  await expect(page.locator(".window.is-in")).toHaveCount(4);
});

test("mover o mouse para a lateral volta ao menu inicial", async ({ page }) => {
  const intro = page.getByRole("button", { name: "Entrar no portfolio" });
  await enter(page);
  await expect(intro).toBeHidden();

  await page.mouse.move(CENTER.x, CENTER.y); // "arma" o retorno
  await page.mouse.move(SIDE_X, CENTER.y); // toca a lateral
  await expect(intro).toBeVisible();
});

test("as 4 janelas exibem os tópicos corretos", async ({ page }) => {
  await enter(page);
  for (const title of [
    "~ quem-eu-sou",
    "~ o-que-eu-faco",
    "~ projetos",
    "~ contato",
  ]) {
    await expect(page.getByText(title)).toBeVisible();
  }
});

test("conteúdo das janelas está presente", async ({ page }) => {
  await enter(page);
  await expect(page.getByText("nadil nunes da silva junior")).toBeVisible();
  await expect(page.getByText("programador python.")).toBeVisible();
  await expect(page.getByText("akemisticosim@gmail.com")).toBeVisible();
  await expect(page.getByText("discord").locator("..")).toContainText("Akemistico");
});

test("links apontam para GitHub e email", async ({ page }) => {
  await enter(page);
  const github = page.locator('a[href*="github.com/Akemastico"]');
  await expect(github).toHaveCount(2);
  const mail = page.locator('a[href="mailto:akemisticosim@gmail.com"]');
  await expect(mail).toHaveCount(1);
});

test("relógio exibe hora no formato HH:MM:SS", async ({ page }) => {
  const clock = page.locator("#clock");
  await expect(clock).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
});
