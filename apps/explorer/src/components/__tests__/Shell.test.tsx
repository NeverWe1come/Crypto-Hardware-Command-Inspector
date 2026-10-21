/**
 * @packageDocumentation
 * Component integration tests for the main application Shell (`@chci/explorer`).
 */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Shell } from '../Shell';
import { WorkspaceProvider } from '../../state/workspace-context';
import type { WorkspaceState } from '../../state/types';

/**
 * Custom render helper wrapping the Shell inside WorkspaceProvider and react-intl.
 */
function renderShell(initialState?: Partial<WorkspaceState>) {
  return {
    user: userEvent.setup(),
    ...render(
      <WorkspaceProvider initialState={initialState}>
        <Shell />
      </WorkspaceProvider>
    )
  };
}

describe('Application Shell Integration', () => {
  describe('Header Navigation & Status', () => {
    it('renders Header with application title, language toggle, and persistence buttons', () => {
      renderShell();

      // Title
      expect(
        screen.getByRole('heading', { name: /Crypto Hardware Command Inspector/i })
      ).toBeInTheDocument();

      // Language toggle
      expect(screen.getByTestId('language-select')).toBeInTheDocument();

      // Quick action buttons for history and sessions
      expect(screen.getByTestId('history-button')).toBeInTheDocument();
      expect(screen.getByTestId('sessions-button')).toBeInTheDocument();
    });

    it('toggles application locale when clicking language toggle button', async () => {
      const { user } = renderShell();

      const langButton = screen.getByTestId('language-select');
      expect(langButton).toHaveTextContent(/ES/i);

      // Toggle to English
      await user.click(langButton);
      expect(langButton).toHaveTextContent(/EN/i);

      // Toggle back to Spanish
      await user.click(langButton);
      expect(langButton).toHaveTextContent(/ES/i);
    });
  });

  describe('Sidebar Catalog & Filtering', () => {
    it('renders the 3 hardware categories (HSM, KMS, HSMAAS) and collapse toggle', () => {
      renderShell();

      expect(screen.getByTestId('category-filter-hsm')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-kms')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-hsmaas')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-collapse-toggle')).toBeInTheDocument();
    });

    it('filters devices when clicking a category filter pill and allows collapsing', async () => {
      const { user } = renderShell();

      // In HSMs (default), financial HSMs are visible
      expect(screen.getByTestId('device-card-utimaco-atalla-at1000')).toBeInTheDocument();
      expect(screen.getByTestId('device-card-thales-payshield-10k')).toBeInTheDocument();
      expect(screen.getByTestId('device-card-futurex-excrypt')).toBeInTheDocument();
      // KMS devices are not in HSM view
      expect(screen.queryByTestId('device-card-aws-kms')).not.toBeInTheDocument();

      // Click KMS category
      await user.click(screen.getByTestId('category-filter-kms'));

      // KMS devices appear, financial HSM devices are filtered out
      expect(screen.getByTestId('device-card-aws-kms')).toBeInTheDocument();
      expect(screen.queryByTestId('device-card-utimaco-atalla-at1000')).not.toBeInTheDocument();

      // Click HSM category again
      await user.click(screen.getByTestId('category-filter-hsm'));
      expect(screen.getByTestId('device-card-utimaco-atalla-at1000')).toBeInTheDocument();

      // Toggle collapse mode
      const collapseToggle = screen.getByTestId('sidebar-collapse-toggle');
      await user.click(collapseToggle);
      // In collapsed mode, the device card is still clickable by device-id
      expect(screen.getByTestId('device-card-utimaco-atalla-at1000')).toBeInTheDocument();
      // Un-collapse
      await user.click(collapseToggle);
    });

    it('filters devices dynamically via search input', () => {
      renderShell();

      const searchInput = screen.getByTestId('catalog-search-input');
      fireEvent.change(searchInput, { target: { value: 'thales' } });

      // Only Thales devices should be visible
      expect(screen.getByTestId('device-card-thales-payshield-10k')).toBeInTheDocument();
      expect(screen.queryByTestId('device-card-utimaco-atalla-at1000')).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByTestId('device-card-utimaco-atalla-at1000')).toBeInTheDocument();
    });

    it('displays Soportado badge on MVP devices and Próximamente badge on roadmap devices', async () => {
      const { user } = renderShell();

      // Supported MVP badges in HSM category
      expect(screen.getByTestId('badge-supported-utimaco-atalla-at1000')).toHaveTextContent(/Soportado/i);
      expect(screen.getByTestId('badge-supported-thales-payshield-10k')).toHaveTextContent(/Soportado/i);
      expect(screen.getByTestId('badge-supported-futurex-excrypt')).toHaveTextContent(/Soportado/i);

      // Coming soon badge in general purpose HSM
      expect(screen.getByTestId('badge-coming-soon-thales-luna-7')).toHaveTextContent(/Próximamente/i);

      // Switch to KMS for AWS KMS coming-soon badge
      await user.click(screen.getByTestId('category-filter-kms'));
      expect(screen.getByTestId('badge-coming-soon-aws-kms')).toHaveTextContent(/Próximamente/i);
    });
  });

  describe('Workspace Tab Interactivity & Idempotency', () => {
    it('opens a workspace tab when clicking a supported device card', async () => {
      const { user } = renderShell();

      // Empty workspace initial state
      expect(screen.getByTestId('empty-workspace-state')).toBeInTheDocument();
      expect(screen.queryByTestId('workspace-tabs-bar')).not.toBeInTheDocument();

      // Click Utimaco Atalla AT1000
      const atallaCard = screen.getByTestId('device-card-utimaco-atalla-at1000');
      await user.click(atallaCard);

      // Workspace tab bar is now visible and contains Atalla tab
      const tabsBar = screen.getByTestId('workspace-tabs-bar');
      expect(tabsBar).toBeInTheDocument();
      expect(screen.getByTestId('workspace-tab-utimaco-atalla-at1000')).toBeInTheDocument();

      // Active workspace view replaces empty state
      expect(screen.queryByTestId('empty-workspace-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('active-workspace-view')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Atalla AT1000/i })).toBeInTheDocument();
      expect(screen.getByTestId('header-add-command-button')).toBeInTheDocument();
    });

    it('enforces single-tab-per-device rule: clicking already open device does NOT create a duplicate tab', async () => {
      const { user } = renderShell();

      const atallaCard = screen.getByTestId('device-card-utimaco-atalla-at1000');
      await user.click(atallaCard);

      // Click Thales
      const thalesCard = screen.getByTestId('device-card-thales-payshield-10k');
      await user.click(thalesCard);

      const tabsBar = screen.getByTestId('workspace-tabs-bar');
      const tabsBefore = within(tabsBar).getAllByRole('tab');
      expect(tabsBefore).toHaveLength(2);

      // Click Atalla again
      await user.click(atallaCard);

      // Length should still be 2 (no duplicate tab created)
      const tabsAfter = within(tabsBar).getAllByRole('tab');
      expect(tabsAfter).toHaveLength(2);

      // Atalla tab is active
      const atallaTab = screen.getByTestId('workspace-tab-utimaco-atalla-at1000');
      expect(atallaTab).toHaveAttribute('aria-selected', 'true');
    });

    it('closes tab when clicking the close button and restores empty state if no tabs remain', async () => {
      const { user } = renderShell();

      await user.click(screen.getByTestId('device-card-utimaco-atalla-at1000'));
      expect(screen.getByTestId('workspace-tab-utimaco-atalla-at1000')).toBeInTheDocument();

      const closeButton = screen.getByTestId('close-tab-utimaco-atalla-at1000');
      await user.click(closeButton);

      expect(screen.queryByTestId('workspace-tab-utimaco-atalla-at1000')).not.toBeInTheDocument();
      expect(screen.getByTestId('empty-workspace-state')).toBeInTheDocument();
    });

    it('renders coming-soon devices as disabled and prevents opening a tab when clicked', async () => {
      const { user } = renderShell();

      // Switch to KMS category where aws-kms is located
      await user.click(screen.getByTestId('category-filter-kms'));

      const awsCard = screen.getByTestId('device-card-aws-kms');
      expect(awsCard).toHaveAttribute('aria-disabled', 'true');

      // Click disabled card
      await user.click(awsCard);

      // No tab should be opened
      expect(screen.queryByTestId('workspace-tabs-bar')).not.toBeInTheDocument();
      expect(screen.getByTestId('empty-workspace-state')).toBeInTheDocument();
    });
  });

  describe('3-Panel Resizable Layout', () => {
    it('renders the ResizablePanelGroup containing the 3 core panels', () => {
      renderShell();

      expect(screen.getByTestId('workspace-resizable-group')).toBeInTheDocument();

      // 1. Sidebar catalog panel
      const sidebarPanel = screen.getByTestId('sidebar-panel');
      expect(sidebarPanel).toBeInTheDocument();
      expect(sidebarPanel).toHaveAttribute('aria-label', 'Panel de catálogo');

      // 2. Center editor / commands workspace panel
      const editorPanel = screen.getByTestId('editor-panel');
      expect(editorPanel).toBeInTheDocument();
      expect(editorPanel).toHaveAttribute('aria-label', 'Área de comandos y editor');

      // 3. Right analysis panel
      const analysisPanel = screen.getByTestId('analysis-panel');
      expect(analysisPanel).toBeInTheDocument();
      expect(analysisPanel).toHaveAttribute('aria-label', 'Panel de análisis');
      expect(screen.getByTestId('analysis-panel-placeholder')).toBeInTheDocument();
    });
  });

  describe('Hardware Documentation Integration', () => {
    it('renders the hardware documentation button before the add command button and opens modal on click', async () => {
      const { user } = renderShell();

      // Open a tab so header action buttons become active
      await user.click(screen.getByTestId('device-card-utimaco-atalla-at1000'));

      const docsButton = screen.getByTestId('header-hardware-docs-button');
      const addButton = screen.getByTestId('header-add-command-button');

      expect(docsButton).toBeInTheDocument();
      expect(addButton).toBeInTheDocument();

      // Ensure docsButton precedes addButton in DOM order
      expect(
        docsButton.compareDocumentPosition(addButton) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();

      // Modal initially closed
      expect(screen.queryByTestId('hardware-docs-modal')).not.toBeInTheDocument();

      // Click docs button to open modal
      await user.click(docsButton);
      expect(screen.getByTestId('hardware-docs-modal')).toBeInTheDocument();
    });
  });
});
