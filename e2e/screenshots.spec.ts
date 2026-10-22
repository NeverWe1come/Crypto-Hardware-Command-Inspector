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
    // Screenshot 1 & 2: Overview and Hardware Catalog
    // -------------------------------------------------------------
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '01-catalog-overview-light.png'),
      fullPage: true
    });

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
    // Screenshot 5: Expected Response & Command Lifecycle
    // -------------------------------------------------------------
    // Add command in Thales tab via header button
    const addCmdBtn = page.getByTestId('header-add-command-button');
    await addCmdBtn.click();
    await page.waitForTimeout(300);

    // Set command #2 as response
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('A100');
    await page.waitForTimeout(400);

    // Open Expected Response accordion in analysis panel
    const expectedRespTrigger = page.getByTestId('accordion-trigger-expected-response');
    if (await expectedRespTrigger.isVisible()) {
      if ((await expectedRespTrigger.getAttribute('aria-expanded')) === 'false') {
        await expectedRespTrigger.click();
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

    // Switch back to Spanish for remaining technical workflow captures
    await langButton.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Screenshot 10: Offline Hardware Documentation Viewer
    // -------------------------------------------------------------
    const docsBtn = page.getByTestId('header-hardware-docs-button');
    if (await docsBtn.isVisible()) {
      await docsBtn.click();
      await page.waitForTimeout(400);
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select command BF in documentation
      const docItemBf = page.getByTestId('hardware-doc-item-cmd-bf');
      if (await docItemBf.isVisible()) {
        await docItemBf.click();
        await page.waitForTimeout(300);
      }

      await page.screenshot({
        path: path.join('docs', 'assets', 'screenshots', '10-hardware-docs-viewer.png'),
        fullPage: true
      });

      // Close documentation modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // Screenshot 11: Utimaco Atalla AT1000 Simulator Modal
    // -------------------------------------------------------------
    const simBtn = page.getByTestId('simulator-button');
    if (await simBtn.isVisible()) {
      await simBtn.click();
      await page.waitForTimeout(400);
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.screenshot({
        path: path.join('docs', 'assets', 'screenshots', '11-atalla-simulator-modal.png'),
        fullPage: true
      });

      // Close simulator modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // Screenshot 12: Direct Hardware Connections (TCP/TLS/mTLS)
    // -------------------------------------------------------------
    const atallaConnBtn = page.getByTestId('device-connections-button-utimaco-atalla-at1000');
    if (await atallaConnBtn.isVisible()) {
      await atallaConnBtn.click();
      await page.waitForTimeout(400);
      await expect(page.getByRole('dialog')).toBeVisible();

      // Click "Nueva Conexión" button to show full configuration form
      const addConnBtn = page.getByTestId('add-connection-button');
      if (await addConnBtn.isVisible()) {
        await addConnBtn.click();
        await page.waitForTimeout(300);
      }

      await page.screenshot({
        path: path.join('docs', 'assets', 'screenshots', '12-direct-hardware-connections.png'),
        fullPage: true
      });

      // Close connections modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // Screenshot 13: Dual-Mode AKB vs Variant & Expandable Info
    // -------------------------------------------------------------
    // Switch to Atalla AT1000 tab
    await atallaCard.click();
    await page.waitForTimeout(300);

    // Input Atalla command BF with 74-character AKB key
    const akbFrame = '<BF#1#11#00000000#1#1K100000000000000000000000000000000000000000000000000000000000000000000000#0#>';
    await cmEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(akbFrame);
    await page.waitForTimeout(400);

    // Expand parameters accordion if not open
    if ((await fieldsTrigger.getAttribute('aria-expanded')) === 'false') {
      await fieldsTrigger.click();
    }
    await page.waitForTimeout(300);

    // Expand the first field description button (i)
    const infoButton = page.locator('button[data-testid^="field-info-btn-"]').first();
    if (await infoButton.isVisible()) {
      await infoButton.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '13-akb-variant-dual-mode.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Screenshot 14: Multi-Interface Selector (Standard vs Proprietary)
    // -------------------------------------------------------------
    // Open Thales Luna 7 tab which has multiple interfaces (PKCS#11 Callable APIs & CLI)
    const lunaCard = page.getByTestId('device-card-thales-luna-7');
    if (await lunaCard.isVisible()) {
      await lunaCard.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: path.join('docs', 'assets', 'screenshots', '14-multi-interface-selector.png'),
        fullPage: true
      });
    }

    // -------------------------------------------------------------
    // Screenshot 15: Cross-Platform Distribution Architecture
    // -------------------------------------------------------------
    // Return to main view with catalog
    const allCategoryTab = page.locator('button').filter({ hasText: 'Todos' }).first();
    if (await allCategoryTab.isVisible()) {
      await allCategoryTab.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: path.join('docs', 'assets', 'screenshots', '15-installer-and-distribution.png'),
      fullPage: true
    });
  });
});
