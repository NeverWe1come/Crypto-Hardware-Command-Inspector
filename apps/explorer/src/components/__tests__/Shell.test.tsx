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
    it('renders Header with application title, language toggle, theme toggle, and offline badge', () => {
      renderShell();

      // Title
      expect(
        screen.getByRole('heading', { name: /Crypto Hardware Command Inspector/i })
      ).toBeInTheDocument();

      // 100% Local status indicator badge
      const statusBadge = screen.getByTestId('status-indicator');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveTextContent(/100% Local/i);

      // Language and theme selectors
      expect(screen.getByTestId('language-select')).toBeInTheDocument();
      expect(screen.getByTestId('theme-select')).toBeInTheDocument();

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

      // Verify that UI labels switched to English
      expect(screen.getByTestId('status-indicator')).toHaveTextContent(/100% Local & Secure/i);

      // Toggle back to Spanish
      await user.click(langButton);
      expect(langButton).toHaveTextContent(/ES/i);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent(/100% Local y Seguro/i);
    });

    it('cycles visual theme when clicking theme toggle button', async () => {
      const { user } = renderShell();

      const themeButton = screen.getByTestId('theme-select');
      expect(themeButton).toHaveTextContent(/dark/i);

      // Dark -> Light
      await user.click(themeButton);
      expect(themeButton).toHaveTextContent(/light/i);

      // Light -> System
      await user.click(themeButton);
      expect(themeButton).toHaveTextContent(/system/i);

      // System -> Dark
      await user.click(themeButton);
      expect(themeButton).toHaveTextContent(/dark/i);
    });
  });

  describe('Sidebar Catalog & Filtering', () => {
    it('renders the 4 hardware categories (KMS, HSM_FINANCIAL, HSM_GP, HSMAAS) plus ALL', () => {
      renderShell();

      expect(screen.getByTestId('category-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-hsm_financial')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-hsm_gp')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-kms')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-hsmaas')).toBeInTheDocument();
    });

    it('filters devices when clicking a category filter pill', async () => {
      const { user } = renderShell();

      // Initially all devices are visible (supported + coming soon)
      expect(screen.getByTestId('device-card-utimaco-atalla-at1000')).toBeInTheDocument();
      expect(screen.getByTestId('device-card-aws-kms')).toBeInTheDocument();

      // Click KMS category
      await user.click(screen.getByTestId('category-filter-kms'));

      // KMS devices remain, financial HSM devices are filtered out
      expect(screen.getByTestId('device-card-aws-kms')).toBeInTheDocument();
      expect(screen.queryByTestId('device-card-utimaco-atalla-at1000')).not.toBeInTheDocument();

      // Click HSM_FINANCIAL category
      await user.click(screen.getByTestId('category-filter-hsm_financial'));
      expect(screen.getByTestId('device-card-utimaco-atalla-at1000')).toBeInTheDocument();
      expect(screen.getByTestId('device-card-thales-payshield-10k')).toBeInTheDocument();
      expect(screen.getByTestId('device-card-futurex-excrypt')).toBeInTheDocument();
      expect(screen.queryByTestId('device-card-aws-kms')).not.toBeInTheDocument();
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

    it('displays Soportado badge on MVP devices and Próximamente badge on roadmap devices', () => {
      renderShell();

      // Supported MVP badges
      expect(screen.getByTestId('badge-supported-utimaco-atalla-at1000')).toHaveTextContent(/Soportado/i);
      expect(screen.getByTestId('badge-supported-thales-payshield-10k')).toHaveTextContent(/Soportado/i);
      expect(screen.getByTestId('badge-supported-futurex-excrypt')).toHaveTextContent(/Soportado/i);

      // Coming-soon roadmap badges
      expect(screen.getByTestId('badge-coming-soon-aws-kms')).toHaveTextContent(/Próximamente/i);
      expect(screen.getByTestId('badge-coming-soon-thales-luna-7')).toHaveTextContent(/Próximamente/i);
      expect(screen.getByTestId('badge-coming-soon-azure-payment-hsm')).toHaveTextContent(/Próximamente/i);
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
      expect(screen.getByText(/Firmware v8.60/i)).toBeInTheDocument();
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
});
