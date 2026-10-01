import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function collectPageErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

test("EN home loads without console errors", async ({ page }) => {
  const errors = await collectPageErrors(page);
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("h1")).toContainText("Deploy to your own servers");
  expect(errors, errors.join("\n")).toEqual([]);
});

test("PT-BR home loads without console errors", async ({ page }) => {
  const errors = await collectPageErrors(page);
  const response = await page.goto("/pt/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("h1")).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("EN and PT-BR have no serious axe violations", async ({ page }) => {
  for (const path of ["/", "/pt/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  }
});
