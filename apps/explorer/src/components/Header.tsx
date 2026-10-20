/**
 * @packageDocumentation
 * Application top navigation header (`@chci/explorer`).
 */

import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useWorkspace } from '../state/workspace-context';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShieldCheck, Moon, Sun, Laptop, Globe, History, FolderKanban } from 'lucide-react';
import { SessionManagerModal } from './SessionManagerModal';
import { HistoryModal } from './HistoryModal';

/**
 * Top application header providing brand identity, 100% offline security status badge,
 * session library access, `.chci_history` modal trigger, language selector (ES/EN),
 * and light/dark theme toggle.
 *
 * @returns Header navigation JSX element.
 */
export function Header() {
  const intl = useIntl();
  const { state, dispatch } = useWorkspace();
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleToggleLocale = () => {
    const nextLocale = state.locale === 'es' ? 'en' : 'es';
    dispatch({ type: 'SET_LOCALE', payload: nextLocale });
  };

  const handleToggleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(state.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length]!;
    dispatch({ type: 'SET_THEME', payload: nextTheme });
  };

  return (
    <>
      <header
        data-testid="app-header"
        className="h-14 border-b border-border bg-card px-4 flex items-center justify-between select-none shrink-0"
      >
        {/* Brand title & Offline status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs tracking-wider border border-primary/20">
              CHCI
            </div>
            <h1 className="font-semibold text-sm tracking-tight text-foreground">
              <FormattedMessage id="app.title" defaultMessage="Crypto Hardware Command Inspector" />
            </h1>
          </div>

          <Badge
            variant="success"
            appearance="outline"
            size="sm"
            className="gap-1 font-mono text-[10px] uppercase tracking-wider"
            data-testid="status-indicator"
          >
            <ShieldCheck className="size-3 text-emerald-500" />
            <FormattedMessage id="header.badge.offline" defaultMessage="100% Local y Seguro" />
          </Badge>
        </div>

        {/* Quick Actions & Preferences */}
        <div className="flex items-center gap-2">
          {/* Session history & library buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label={intl.formatMessage({
              id: 'header.actions.history',
              defaultMessage: 'Historial (.chci_history)'
            })}
            data-testid="history-button"
          >
            <History className="size-3.5" />
            <span className="hidden sm:inline">
              <FormattedMessage id="header.actions.history" defaultMessage="Historial" />
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSessionsOpen(true)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label={intl.formatMessage({
              id: 'header.actions.sessions',
              defaultMessage: 'Biblioteca de Sesiones'
            })}
            data-testid="sessions-button"
          >
            <FolderKanban className="size-3.5" />
            <span className="hidden sm:inline">
              <FormattedMessage id="header.actions.sessions" defaultMessage="Sesiones" />
            </span>
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Locale toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLocale}
            className="h-8 px-2 text-xs font-mono font-medium gap-1 text-muted-foreground hover:text-foreground"
            aria-label={intl.formatMessage({ id: 'header.language', defaultMessage: 'Idioma' })}
            data-testid="language-select"
          >
            <Globe className="size-3.5 text-muted-foreground" />
            <span className="uppercase">{state.locale}</span>
          </Button>

          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleTheme}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground capitalize"
            aria-label={intl.formatMessage({ id: 'header.theme', defaultMessage: 'Tema' })}
            data-testid="theme-select"
          >
            {state.theme === 'dark' && <Moon className="size-3.5" />}
            {state.theme === 'light' && <Sun className="size-3.5" />}
            {state.theme === 'system' && <Laptop className="size-3.5" />}
            <span className="hidden md:inline ml-1">{state.theme}</span>
          </Button>
        </div>
      </header>

      {/* Persistence Modals */}
      <SessionManagerModal open={sessionsOpen} onOpenChange={setSessionsOpen} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  );
}
