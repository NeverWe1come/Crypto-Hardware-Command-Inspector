import { test, expect } from '@playwright/test';

test.describe('HSM Simulators Hub and Dropdown Controls', () => {
  test('opens simulators hub dropdown and verifies all 4 hardware simulators with dedicated ports', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on unified Simulators Hub button in header
    const hubBtn = page.getByTestId('simulators-hub-button');
    await expect(hubBtn).toBeVisible();
    await hubBtn.click();

    // Verify popover menu appears
    const popover = page.getByTestId('simulators-hub-popover');
    await expect(popover).toBeVisible();

    // Verify all 4 hardware simulators are listed
    await expect(page.getByTestId('sim-row-atalla-at1000')).toBeVisible();
    await expect(page.getByTestId('sim-row-thales-payshield')).toBeVisible();
    await expect(page.getByTestId('sim-row-futurex-excrypt')).toBeVisible();
    await expect(page.getByTestId('sim-row-marvell-liquidsecurity')).toBeVisible();

    // Verify dedicated non-overlapping ports
    await expect(popover).toContainText('TCP :7000');
    await expect(popover).toContainText('TCP :1500');
    await expect(popover).toContainText('TCP :9000');
    await expect(popover).toContainText('TCP :2225');

    // Capture screenshot of dropdown hub for user guide
    await page.screenshot({
      path: 'docs/assets/screenshots/18-simulators-hub-dropdown.png',
      fullPage: false,
    });

    // Click on LiquidSecurity console button
    const liquidConsoleBtn = page.getByTestId('console-sim-marvell-liquidsecurity');
    await expect(liquidConsoleBtn).toBeVisible();
    await liquidConsoleBtn.click();

    // Verify LiquidSecurity modal appears
    const liquidModal = page.getByTestId('liquidsecurity-simulator-modal');
    await expect(liquidModal).toBeVisible();
    await expect(liquidModal).toContainText('Simulador Marvell LiquidSecurity HSM');
    await expect(liquidModal).toContainText('3.4.0');

    // Capture screenshot of LiquidSecurity simulator console
    await page.screenshot({
      path: 'docs/assets/screenshots/19-liquidsecurity-simulator-modal.png',
      fullPage: false,
    });

    // Close modal
    await page.keyboard.press('Escape');
    await expect(liquidModal).not.toBeVisible();
  });
});
