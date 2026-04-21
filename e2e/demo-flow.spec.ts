import { expect, test } from "@playwright/test";

test("demo user can log in and see dashboard shell", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@company.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Asset Manager")).toBeVisible();
});
