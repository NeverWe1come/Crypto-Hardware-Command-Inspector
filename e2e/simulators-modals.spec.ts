import { test, expect } from '@playwright/test';

test.describe('Hardware Simulators Modal E2E Flows', () => {
  test('opens Thales payShield 10K simulator modal and verifies controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Thales simulator button in Hub dropdown
    const hubBtn = page.getByTestId('simulators-hub-button');
    await expect(hubBtn).toBeVisible();
    await hubBtn.click();

    const thalesBtn = page.getByTestId('console-sim-thales-payshield');
    await expect(thalesBtn).toBeVisible();
    await thalesBtn.click();

    // Verify modal dialog appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Simulador Thales payShield 10K');

    // Capture screenshot for user guide
    await page.screenshot({
      path: 'docs/assets/screenshots/16-thales-simulator-modal.png',
      fullPage: false,
    });

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('opens Futurex Excrypt simulator modal and verifies controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Futurex simulator button in Hub dropdown
    const hubBtn = page.getByTestId('simulators-hub-button');
    await expect(hubBtn).toBeVisible();
    await hubBtn.click();

    const fxBtn = page.getByTestId('console-sim-futurex-excrypt');
    await expect(fxBtn).toBeVisible();
    await fxBtn.click();

    // Verify modal dialog appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Simulador Futurex Excrypt Plus');

    // Capture screenshot for user guide
    await page.screenshot({
      path: 'docs/assets/screenshots/17-futurex-simulator-modal.png',
      fullPage: false,
    });

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
