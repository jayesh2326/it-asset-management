import { expect, test } from "@playwright/test";

const loginEmail = process.env.E2E_LOGIN_EMAIL ?? "jayesh@example.com";
const loginPassword = process.env.E2E_LOGIN_PASSWORD ?? "admin@123";

test("seeded admin can log in and see the dashboard shell", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(loginEmail);
  await page.getByLabel("Password").fill(loginPassword);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Signed in as")).toBeVisible();
  await expect(page.getByText("Asset Nexus")).toBeVisible();
});
