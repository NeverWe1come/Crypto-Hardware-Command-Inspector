/**
 * @packageDocumentation
 * Security warning banner displayed exclusively in web sandbox mode (`@chci/explorer`).
 *
 * Informs users that the web application is a public demonstration environment,
 * strictly warns against entering sensitive cryptographic material (keys, PIN blocks),
 * and advises downloading the offline desktop build for production air-gapped security.
 */

import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AlertTriangle, Download, ExternalLink, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface WebSandboxBannerProps {
  /**
   * Target deployment environment identifier.
   * Defaults to `import.meta.env.VITE_TARGET`.
   */
  target?: string;
  /**
   * Optional callback triggered when the user explicitly dismisses the banner.
   */
  onDismiss?: () => void;
  /**
   * Optional additional CSS classes for custom styling.
   */
  className?: string;
}

/**
 * Renders a persistent yet dismissible security banner when running in `web` target mode.
 * Returns `null` when operating in native desktop mode or when dismissed.
 */
export function WebSandboxBanner({
  target,
  onDismiss,
  className
}: WebSandboxBannerProps) {
  const intl = useIntl();
  const [isDismissed, setIsDismissed] = useState(false);

  const effectiveTarget =
    target ??
    (typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_TARGET
      : undefined);

  // Only render if running specifically in web sandbox mode and not dismissed
  if (effectiveTarget !== 'web' || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <aside
      role="alert"
      data-testid="web-sandbox-banner"
      aria-live="polite"
      className={cn(
        'w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 text-xs transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
        <AlertTriangle
          data-testid="web-sandbox-alert-icon"
          className="size-4 text-amber-600 dark:text-amber-400 shrink-0"
          aria-hidden="true"
        />

        <Badge
          variant="warning"
          appearance="outline"
          size="sm"
          className="font-mono text-[10px] uppercase tracking-wider font-semibold border-amber-500/40 text-amber-700 dark:text-amber-300 shrink-0"
        >
          <FormattedMessage id="webSandbox.badge" defaultMessage="Sandbox Web" />
        </Badge>

        <span className="font-semibold text-foreground shrink-0">
          <FormattedMessage id="webSandbox.title" defaultMessage="Entorno Web de Demostración" />:
        </span>

        <span className="text-muted-foreground">
          <FormattedMessage
            id="webSandbox.warning"
            defaultMessage="Advertencia de seguridad: No introduzcas claves criptográficas reales, PIN blocks de producción ni datos sensibles en este entorno web."
          />
        </span>

        <span className="font-medium text-foreground hidden md:inline">
          <FormattedMessage
            id="webSandbox.offlineRecommendation"
            defaultMessage="Para un aislamiento total sin conexión a red (air-gapped), utiliza la aplicación de escritorio oficial de CHCI."
          />
        </span>

        <a
          href="https://github.com/ramp1953/CryptoCommandExplorer/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-primary/80 shrink-0 ml-1"
        >
          <Download className="size-3.5" aria-hidden="true" />
          <FormattedMessage
            id="webSandbox.downloadDesktop"
            defaultMessage="Descargar versión de escritorio"
          />
          <ExternalLink className="size-3 opacity-70" aria-hidden="true" />
        </a>
      </div>

      <Button
        variant="ghost"
        size="sm"
        mode="icon"
        onClick={handleDismiss}
        aria-label={intl.formatMessage({
          id: 'webSandbox.dismiss',
          defaultMessage: 'Descartar aviso de entorno web'
        })}
        data-testid="web-sandbox-dismiss-button"
        className="size-6 text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="size-3.5" aria-hidden="true" />
      </Button>
    </aside>
  );
}
