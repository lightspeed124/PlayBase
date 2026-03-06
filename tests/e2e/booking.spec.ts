import { test, expect } from "@playwright/test";

test("complete booking workflow", async ({ page }) => {
  // Seed a favourite so the booking page has an item
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("jumpfun_favorites", JSON.stringify(["26"]));
  });

  // Go to booking page
  await page.goto("/booking");
  await expect(page.getByText("What would you like to rent?")).toBeVisible();

  // Step 1 — item is pre-selected, click Next
  await expect(page.getByText("Castle jumper")).toBeVisible();
  await page.getByRole("button", { name: /next: event details/i }).click();

  // Step 2 — fill event details
  await expect(page.getByRole("heading", { name: "Event Details" })).toBeVisible();
  await page.locator('input[type="date"]').fill("2026-07-04");
  await page.getByRole("button", { name: "Backyard" }).click();
  await page.getByPlaceholder(/street address/i).fill("123 Main St, San Francisco, CA 94105");
  await page.getByRole("button", { name: /next: contact info/i }).click();

  // Step 3 — fill contact info
  await expect(page.getByRole("heading", { name: /contact info/i })).toBeVisible();
  await page.getByPlaceholder("Jane Smith").fill("Test User");
  await page.getByPlaceholder("(415) 555-1234").fill("4155550000");
  await page.getByPlaceholder("jane@example.com").fill("test@example.com");
  await page.getByRole("button", { name: /submit booking request/i }).click();

  // Confirmation screen
  await expect(page.getByText("Booking Received!")).toBeVisible();
  await expect(page.getByText("test@example.com")).toBeVisible();
});
