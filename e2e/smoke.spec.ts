import { expect, test } from '@playwright/test';

test('renders Crypto Hardware Command Inspector shell', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Crypto Hardware Command Inspector/i })
  ).toBeVisible();
});
