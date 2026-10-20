import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('CHCI Visual Workflows & Automated High-Res Screenshots', () => {
  test('captures complete visual workflow screenshots for documentation', async ({ page }) => {
    // Set desktop high-res viewport (1512x940)
    await page.setViewportSize({ width: 1512, height: 940 });

    // Open application
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-shell"]');

    // Wait for initial render and tabs to mount
    await expect(page.getByTestId('app-header')).toBeVisible();

    // -------------------------------------------------------------
    // Screenshot 1: Overview and Hardware Catalog (Light Mode)
    // -------------------------------------------------------------
    // Ensure light mode is set
    const themeButton = page.getByTestId('theme-select');
    // If current theme is not light, click until light
    for (let i = 0; i < 3; i++) {
      const themeText = await themeButton.innerText();
      if (themeText.toLowerCase().includes('light')) break;
      await themeButton.click();
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '01-catalog-overview-light.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 2: Overview and Hardware Catalog (Dark Mode)
    // -------------------------------------------------------------
    for (let i = 0; i < 3; i++) {
      const themeText = await themeButton.innerText();
      if (themeText.toLowerCase().includes('dark')) break;
      await themeButton.click();
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '02-catalog-overview-dark.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 3: Futurex Excrypt Command Inspection
    // -------------------------------------------------------------
    // Open Futurex Excrypt device tab from sidebar
    const futurexCard = page.getByTestId('device-card-futurex-excrypt');
    await futurexCard.click();
    await page.waitForTimeout(300);

    // Enter Futurex command: [AOECHO;AGhola;]
    const cmEditor = page.locator('.cm-content');
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('[AOECHO;AGhola;]');
    await page.waitForTimeout(400);

    // Open Parameters and Frame View accordions if not open
    const fieldsTrigger = page.getByTestId('accordion-trigger-fields');
    if ((await fieldsTrigger.getAttribute('aria-expanded')) === 'false') {
      await fieldsTrigger.click();
    }
    const frameViewTrigger = page.getByTestId('accordion-trigger-frame-view');
    if ((await frameViewTrigger.getAttribute('aria-expanded')) === 'false') {
      await frameViewTrigger.click();
    }
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '03-futurex-command-inspection.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 4: Thales payShield 10K & Sensitive Field Masking
    // -------------------------------------------------------------
    // Open Thales payShield tab
    const thalesCard = page.getByTestId('device-card-thales-payshield-10k');
    await thalesCard.click();
    await page.waitForTimeout(300);

    // Type Thales command with LMK key: A00000U0123456789ABCDEF0123456789ABCDEF
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('A00000U0123456789ABCDEF0123456789ABCDEF');
    await page.waitForTimeout(400);

    // Ensure parameters table is open
    if ((await fieldsTrigger.getAttribute('aria-expanded')) === 'false') {
      await fieldsTrigger.click();
    }
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '04-thales-command-masking.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 5: Request ↔ Response Linked Correlation
    // -------------------------------------------------------------
    // Add response command in Thales tab
    const addCmdBtn = page.getByTestId('add-command-button');
    await addCmdBtn.click();
    await page.waitForTimeout(300);

    // Set command #2 as response
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('A100');
    await page.waitForTimeout(400);

    // Open Correlation accordion in analysis panel
    const correlationTrigger = page.getByTestId('accordion-trigger-correlation');
    if (await correlationTrigger.isVisible()) {
      if ((await correlationTrigger.getAttribute('aria-expanded')) === 'false') {
        await correlationTrigger.click();
      }
    }
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '05-correlation-request-response.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 6: Utimaco Atalla AT1000 Error Diagnostics
    // -------------------------------------------------------------
    // Open Atalla AT1000 tab
    const atallaCard = page.getByTestId('device-card-utimaco-atalla-at1000');
    await atallaCard.click();
    await page.waitForTimeout(300);

    // Type error response command: <31#Y#01#>
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('<31#Y#01#>');
    await page.waitForTimeout(400);

    // Open Diagnostics and Error Code accordions
    const diagTrigger = page.getByTestId('accordion-trigger-diagnostics');
    if (await diagTrigger.isVisible()) {
      if ((await diagTrigger.getAttribute('aria-expanded')) === 'false') {
        await diagTrigger.click();
      }
    }
    const errCodeTrigger = page.getByTestId('accordion-trigger-error-code');
    if (await errCodeTrigger.isVisible()) {
      if ((await errCodeTrigger.getAttribute('aria-expanded')) === 'false') {
        await errCodeTrigger.click();
      }
    }
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '06-atalla-error-diagnostics.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 7: Session Library & JSON Export/Import Modal
    // -------------------------------------------------------------
    const sessionsButton = page.getByTestId('sessions-button');
    await sessionsButton.click();
    await page.waitForTimeout(300);

    // Fill session name
    const sessionInput = page.getByTestId('session-name-input');
    await sessionInput.fill('HSM Production PCI-DSS Audit');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '07-session-manager-modal.png'),
      fullPage: true
    });

    // Close session modal (press Escape)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Screenshot 8: Flat History Modal (.chci_history)
    // -------------------------------------------------------------
    const historyButton = page.getByTestId('history-button');
    await historyButton.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '08-history-modal.png'),
      fullPage: true
    });

    // Close history modal (press Escape)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Screenshot 9: Bilingual UI in English (EN)
    // -------------------------------------------------------------
    const langButton = page.getByTestId('language-select');
    await langButton.click();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '09-i18n-english.png'),
      fullPage: true
    });
  });
});
