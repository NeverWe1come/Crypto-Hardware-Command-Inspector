/**
 * @packageDocumentation
 * Component test suite for `WebSandboxBanner` (`@chci/explorer`).
 *
 * Verifies that the security sandbox banner is displayed ONLY when running
 * in a web environment (`import.meta.env.VITE_TARGET === 'web'`), alerts users
 * against entering sensitive cryptographic material in browsers, recommends the
 * offline desktop build, supports dismissal, and complies with WAI-ARIA standards.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSandboxBanner } from '../WebSandboxBanner';
import { Shell } from '../Shell';
import { WorkspaceProvider } from '../../state/workspace-context';
import { LOCALE_MESSAGES } from '../../i18n';

/**
 * Helper to render WebSandboxBanner with react-intl.
 */
function renderBanner(
  props: React.ComponentProps<typeof WebSandboxBanner> = {},
  locale: 'es' | 'en' = 'es'
) {
  return {
    user: userEvent.setup(),
    ...render(
      <IntlProvider locale={locale} messages={LOCALE_MESSAGES[locale]}>
        <WebSandboxBanner {...props} />
      </IntlProvider>
    )
  };
}

/**
 * Helper to render Shell with react-intl and WorkspaceProvider.
 */
function renderShellWithTarget(target?: string) {
  if (target !== undefined) {
    vi.stubEnv('VITE_TARGET', target);
    (import.meta.env as Record<string, unknown>).VITE_TARGET = target;
  }
  return {
    user: userEvent.setup(),
    ...render(
      <WorkspaceProvider>
        <Shell />
      </WorkspaceProvider>
    )
  };
}

describe('WebSandboxBanner Component', () => {
  const originalViteTarget = import.meta.env.VITE_TARGET;

  beforeEach(() => {
    vi.unstubAllEnvs();
    (import.meta.env as Record<string, unknown>).VITE_TARGET = originalViteTarget;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    (import.meta.env as Record<string, unknown>).VITE_TARGET = originalViteTarget;
  });

  describe('Environment-Driven Rendering', () => {
    it('renders the banner when import.meta.env.VITE_TARGET is "web"', () => {
      vi.stubEnv('VITE_TARGET', 'web');
      (import.meta.env as Record<string, unknown>).VITE_TARGET = 'web';

      renderBanner();

      const banner = screen.getByTestId('web-sandbox-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('role', 'alert');
    });

    it('renders the banner when target prop is explicitly passed as "web"', () => {
      renderBanner({ target: 'web' });

      expect(screen.getByTestId('web-sandbox-banner')).toBeInTheDocument();
    });

    it('does NOT render anything (returns null) when import.meta.env.VITE_TARGET is undefined', () => {
      vi.stubEnv('VITE_TARGET', '');
      delete (import.meta.env as Record<string, unknown>).VITE_TARGET;

      renderBanner();

      expect(screen.queryByTestId('web-sandbox-banner')).not.toBeInTheDocument();
    });

    it('does NOT render anything when import.meta.env.VITE_TARGET is "desktop"', () => {
      vi.stubEnv('VITE_TARGET', 'desktop');
      (import.meta.env as Record<string, unknown>).VITE_TARGET = 'desktop';

      renderBanner();

      expect(screen.queryByTestId('web-sandbox-banner')).not.toBeInTheDocument();
    });

    it('does NOT render anything when target prop is "desktop"', () => {
      renderBanner({ target: 'desktop' });

      expect(screen.queryByTestId('web-sandbox-banner')).not.toBeInTheDocument();
    });
  });

  describe('Bilingual Content & Security Warnings', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_TARGET', 'web');
      (import.meta.env as Record<string, unknown>).VITE_TARGET = 'web';
    });

    it('displays warning icon, badge, and security texts in Spanish (default)', () => {
      renderBanner({}, 'es');

      // Security warning icon
      expect(screen.getByTestId('web-sandbox-alert-icon')).toBeInTheDocument();

      // Title & Badge
      expect(screen.getByText(/Sandbox Web/i)).toBeInTheDocument();
      expect(screen.getByText(/Entorno Web de Demostración/i)).toBeInTheDocument();

      // Warning text prohibiting real keys/PINs
      expect(
        screen.getByText(/No introduzcas claves criptográficas reales, PIN blocks de producción/i)
      ).toBeInTheDocument();

      // Offline desktop recommendation
      expect(
        screen.getByText(/Para un aislamiento total sin conexión a red \(air-gapped\)/i)
      ).toBeInTheDocument();

      // Desktop link / button
      const downloadLink = screen.getByRole('link', { name: /Descargar versión de escritorio/i });
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink).toHaveAttribute('href');
    });

    it('displays warning icon, badge, and security texts in English', () => {
      renderBanner({}, 'en');

      // Title & Badge
      expect(screen.getByText(/Web Sandbox/i)).toBeInTheDocument();
      expect(screen.getByText(/Web Demonstration Environment/i)).toBeInTheDocument();

      // English warning text
      expect(
        screen.getByText(/Security warning: Do not enter real cryptographic keys/i)
      ).toBeInTheDocument();

      // English offline recommendation
      expect(
        screen.getByText(/For 100% offline, air-gapped security/i)
      ).toBeInTheDocument();

      // English desktop link
      const downloadLink = screen.getByRole('link', { name: /Download desktop app/i });
      expect(downloadLink).toBeInTheDocument();
    });
  });

  describe('Dismissal & User Interaction', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_TARGET', 'web');
      (import.meta.env as Record<string, unknown>).VITE_TARGET = 'web';
    });

    it('dismisses the banner when user clicks the close button', async () => {
      const onDismissMock = vi.fn();
      const { user } = renderBanner({ onDismiss: onDismissMock });

      const banner = screen.getByTestId('web-sandbox-banner');
      expect(banner).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /Descartar aviso de entorno web/i });
      await user.click(closeButton);

      // Banner should disappear from document
      expect(screen.queryByTestId('web-sandbox-banner')).not.toBeInTheDocument();
      expect(onDismissMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility & WAI-ARIA Compliance', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_TARGET', 'web');
      (import.meta.env as Record<string, unknown>).VITE_TARGET = 'web';
    });

    it('has role="alert" for immediate screen reader announcement', () => {
      renderBanner();

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('data-testid', 'web-sandbox-banner');
    });

    it('provides an accessible aria-label on the dismiss button', () => {
      renderBanner({}, 'es');

      const closeButton = screen.getByTestId('web-sandbox-dismiss-button');
      expect(closeButton).toHaveAttribute('aria-label', 'Descartar aviso de entorno web');
    });

    it('provides an accessible aria-label on the dismiss button in English', () => {
      renderBanner({}, 'en');

      const closeButton = screen.getByTestId('web-sandbox-dismiss-button');
      expect(closeButton).toHaveAttribute('aria-label', 'Dismiss web sandbox banner');
    });
  });

  describe('Integration with Shell', () => {
    it('renders WebSandboxBanner in Shell when VITE_TARGET is "web"', () => {
      renderShellWithTarget('web');

      expect(screen.getByTestId('web-sandbox-banner')).toBeInTheDocument();
    });

    it('does NOT render WebSandboxBanner in Shell when VITE_TARGET is "desktop"', () => {
      renderShellWithTarget('desktop');

      expect(screen.queryByTestId('web-sandbox-banner')).not.toBeInTheDocument();
    });
  });
});
