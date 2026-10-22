import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Atalla AT1000 Command Processing and AnalysisPanel Live Verification', () => {
  test('processes request and response commands in textarea and updates AnalysisPanel', async ({ page }) => {
    await page.setViewportSize({ width: 1512, height: 940 });

    await page.goto('/');
    await page.waitForSelector('[data-testid="app-shell"]');

    // 1. Select Atalla AT1000 tab or card
    const atallaCard = page.getByTestId('device-card-utimaco-atalla-at1000');
    if (await atallaCard.isVisible()) {
      await atallaCard.click();
    }
    await page.waitForTimeout(300);

    // 2. Put an Atalla request command into CodeEditor
    const cmEditor = page.locator('.cm-content');
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('<10#1VUNE000##D#>');
    await page.waitForTimeout(400);

    // Open General Info accordion to view command code badge
    const generalInfoTrigger = page.getByTestId('accordion-trigger-general-info');
    if ((await generalInfoTrigger.getAttribute('aria-expanded')) === 'false') {
      await generalInfoTrigger.click();
    }
    await page.waitForTimeout(300);

    // Assert AnalysisPanel displays command code 10
    const codeBadge = page.getByTestId('general-info-command-code');
    await expect(codeBadge).toContainText('10');

    // Ensure parameters accordion is open
    const fieldsTrigger = page.getByTestId('accordion-trigger-fields');
    if ((await fieldsTrigger.getAttribute('aria-expanded')) === 'false') {
      await fieldsTrigger.click();
    }
    await page.waitForTimeout(300);

    // Verify parameter table rendered with table-fixed layout
    const fieldsTable = page.getByTestId('fields-breakdown-table');
    await expect(fieldsTable).toBeVisible();
    await expect(fieldsTable).toHaveClass(/table-fixed/);

    // 3. Put an Atalla response command into CodeEditor
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('<20#1VUNE000,499D7190CFCC3045CDD1E6D26D472A884BD0769C4DBE71F2,73A64E0E0F37391B##08D7#>');
    await page.waitForTimeout(400);

    // Assert AnalysisPanel displays response code 20
    await expect(codeBadge).toContainText('20');
    await expect(fieldsTable).toBeVisible();

    // 4. Capture screenshot of live verification
    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '06-atalla-interactive-audit.png'),
      fullPage: true
    });
  });
});
