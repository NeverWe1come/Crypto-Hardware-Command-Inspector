import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Multi-Hardware Command Processing and AnalysisPanel Live Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1512, height: 940 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-shell"]');
  });

  test('audits Thales payShield 10K live command processing and AnalysisPanel rendering', async ({ page }) => {
    // 1. Select Thales payShield 10K
    const thalesCard = page.getByTestId('device-card-thales-payshield-10k');
    if (await thalesCard.isVisible()) {
      await thalesCard.click();
    }
    await page.waitForTimeout(400);

    // 2. Insert Thales request command into CodeMirror editor
    const cmEditor = page.locator('.cm-content');
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('0000NC');
    await page.waitForTimeout(400);

    // Ensure general info is open
    const generalInfoTrigger = page.getByTestId('accordion-trigger-general-info');
    if ((await generalInfoTrigger.getAttribute('aria-expanded')) === 'false') {
      await generalInfoTrigger.click();
    }
    await page.waitForTimeout(300);

    const codeBadge = page.getByTestId('general-info-command-code');
    await expect(codeBadge).toContainText('NC');

    // Insert response command
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('0000ND00000001010101');
    await page.waitForTimeout(400);

    await expect(codeBadge).toContainText('ND');

    // Capture screenshot
    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '07-thales-interactive-audit.png'),
      fullPage: true
    });
  });

  test('audits Futurex Excrypt live command processing and AnalysisPanel rendering', async ({ page }) => {
    // 1. Select Futurex Excrypt
    const futurexCard = page.getByTestId('device-card-futurex-excrypt');
    if (await futurexCard.isVisible()) {
      await futurexCard.click();
    }
    await page.waitForTimeout(400);

    // 2. Insert Futurex tag-value request command
    const cmEditor = page.locator('.cm-content');
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('[AOADMN;CT1;]');
    await page.waitForTimeout(400);

    const generalInfoTrigger = page.getByTestId('accordion-trigger-general-info');
    if ((await generalInfoTrigger.getAttribute('aria-expanded')) === 'false') {
      await generalInfoTrigger.click();
    }
    await page.waitForTimeout(300);

    const codeBadge = page.getByTestId('general-info-command-code');
    await expect(codeBadge).toContainText('ADMN');

    // Ensure parameters table is rendered
    const fieldsTrigger = page.getByTestId('accordion-trigger-fields');
    if ((await fieldsTrigger.getAttribute('aria-expanded')) === 'false') {
      await fieldsTrigger.click();
    }
    await page.waitForTimeout(300);

    const fieldsTable = page.getByTestId('fields-breakdown-table');
    await expect(fieldsTable).toBeVisible();
    await expect(fieldsTable).toHaveClass(/table-fixed/);

    // Insert response command
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('[AOADMN;AM00;CT1;]');
    await page.waitForTimeout(400);

    await expect(codeBadge).toContainText('ADMN');
    await expect(fieldsTable).toBeVisible();

    // Capture screenshot
    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '08-futurex-interactive-audit.png'),
      fullPage: true
    });
  });

  test('audits Marvell LiquidSecurity coming-soon status and Working progress badging', async ({ page }) => {
    // 1. Filter by General Purpose HSM category
    const gpFilter = page.getByTestId('category-filter-hsm_gp');
    if (await gpFilter.isVisible()) {
      await gpFilter.click();
      await page.waitForTimeout(300);
    }

    // 2. Verify Marvell LiquidSecurity card displays Working progress badge and is disabled
    const liquidCard = page.getByTestId('device-card-marvell-liquid-security');
    await expect(liquidCard).toBeVisible();
    await expect(liquidCard).toHaveAttribute('aria-disabled', 'true');

    const badge = page.getByTestId('badge-coming-soon-marvell-liquid-security');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/Working progress/i);

    // Capture screenshot
    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '09-liquidsecurity-interactive-audit.png'),
      fullPage: true
    });
  });
});
