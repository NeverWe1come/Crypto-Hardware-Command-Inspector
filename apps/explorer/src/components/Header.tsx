/**
 * @packageDocumentation
 * Application top navigation header (`@chci/explorer`).
 */

import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useWorkspace } from '../state/workspace-context';
import { Button } from './ui/button';
import { Globe, History, FolderKanban } from 'lucide-react';
import { SessionManagerModal } from './SessionManagerModal';
import { HistoryModal } from './HistoryModal';
import { AtallaSimulatorModal } from './AtallaSimulatorModal';
import { ThalesSimulatorModal } from './ThalesSimulatorModal';
import { FuturexSimulatorModal } from './FuturexSimulatorModal';
import { LiquidSecuritySimulatorModal } from './LiquidSecuritySimulatorModal';
import { SimulatorsDropdown } from './SimulatorsDropdown';
import { BrandLogo } from './BrandLogo';

/**
 * Top application header providing brand identity, session library access,
 * `.chci_history` modal trigger, and language selector (ES/EN).
 *
 * @returns Header navigation JSX element.
 */
export function Header() {
  const intl = useIntl();
  const { state, dispatch } = useWorkspace();
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [atallaAutoStart, setAtallaAutoStart] = useState(false);
  const [thalesSimulatorOpen, setThalesSimulatorOpen] = useState(false);
  const [thalesAutoStart, setThalesAutoStart] = useState(false);
  const [futurexSimulatorOpen, setFuturexSimulatorOpen] = useState(false);
  const [futurexAutoStart, setFuturexAutoStart] = useState(false);
  const [liquidSimulatorOpen, setLiquidSimulatorOpen] = useState(false);
  const [liquidAutoStart, setLiquidAutoStart] = useState(false);

  const handleToggleLocale = () => {
    const nextLocale = state.locale === 'es' ? 'gl' : state.locale === 'gl' ? 'en' : 'es';
    dispatch({ type: 'SET_LOCALE', payload: nextLocale });
  };

  const handleLoadCommandIntoActive = (raw: string) => {
    const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
    if (activeTab?.activeCommandId) {
      dispatch({
        type: 'UPDATE_COMMAND_RAW',
        payload: {
          tabId: activeTab.id,
          commandId: activeTab.activeCommandId,
          raw
        }
      });
    }
  };

  return (
    <>
      <header
        data-testid="app-header"
        className="h-14 border-b border-border bg-card px-4 flex items-center justify-between select-none shrink-0"
      >
        {/* Brand title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={30} />
            <h1 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
              <FormattedMessage id="app.title" defaultMessage="Crypto Hardware Command Inspector" />
              <span className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-normal">
                v1.0
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Actions & Preferences */}
        <div className="flex items-center gap-2">
          {/* Session history & library buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
            aria-label={intl.formatMessage({
              id: 'header.actions.history',
              defaultMessage: 'Historial (.chci_history)'
            })}
            data-testid="history-button"
          >
            <History className="size-3.5 text-[#ff7800]" />
            <span className="hidden sm:inline">
              <FormattedMessage id="header.actions.history" defaultMessage="Historial" />
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSessionsOpen(true)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
            aria-label={intl.formatMessage({
              id: 'header.actions.sessions',
              defaultMessage: 'Biblioteca de Sesiones'
            })}
            data-testid="sessions-button"
          >
            <FolderKanban className="size-3.5 text-[#0da845]" />
            <span className="hidden sm:inline">
              <FormattedMessage id="header.actions.sessions" defaultMessage="Sesiones" />
            </span>
          </Button>

          {/* Unified HSM Simulators Dropdown Control Hub */}
          <SimulatorsDropdown
            onOpenAtallaConsole={(autoStart) => {
              setAtallaAutoStart(Boolean(autoStart));
              setSimulatorOpen(true);
            }}
            onOpenThalesConsole={(autoStart) => {
              setThalesAutoStart(Boolean(autoStart));
              setThalesSimulatorOpen(true);
            }}
            onOpenFuturexConsole={(autoStart) => {
              setFuturexAutoStart(Boolean(autoStart));
              setFuturexSimulatorOpen(true);
            }}
            onOpenLiquidConsole={(autoStart) => {
              setLiquidAutoStart(Boolean(autoStart));
              setLiquidSimulatorOpen(true);
            }}
          />

          <div className="h-4 w-px bg-border mx-1" />

          {/* Locale toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLocale}
            className="h-8 px-2 text-xs font-mono font-medium gap-1 text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label={intl.formatMessage({ id: 'header.language', defaultMessage: 'Idioma' })}
            data-testid="language-select"
          >
            <Globe className="size-3.5 text-muted-foreground" />
            <span className="uppercase font-semibold text-[#feffff]">{state.locale}</span>
          </Button>
        </div>
      </header>

      {/* Persistence & Tooling Modals */}
      <SessionManagerModal open={sessionsOpen} onOpenChange={setSessionsOpen} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
      <AtallaSimulatorModal
        open={simulatorOpen}
        onOpenChange={(open) => {
          setSimulatorOpen(open);
          if (!open) setAtallaAutoStart(false);
        }}
        onLoadCommand={handleLoadCommandIntoActive}
        autoStart={atallaAutoStart}
      />
      <ThalesSimulatorModal
        open={thalesSimulatorOpen}
        onOpenChange={(open) => {
          setThalesSimulatorOpen(open);
          if (!open) setThalesAutoStart(false);
        }}
        onLoadCommand={handleLoadCommandIntoActive}
        autoStart={thalesAutoStart}
      />
      <FuturexSimulatorModal
        open={futurexSimulatorOpen}
        onOpenChange={(open) => {
          setFuturexSimulatorOpen(open);
          if (!open) setFuturexAutoStart(false);
        }}
        onLoadCommand={handleLoadCommandIntoActive}
        autoStart={futurexAutoStart}
      />
      <LiquidSecuritySimulatorModal
        open={liquidSimulatorOpen}
        onOpenChange={(open) => {
          setLiquidSimulatorOpen(open);
          if (!open) setLiquidAutoStart(false);
        }}
        onLoadCommand={handleLoadCommandIntoActive}
        autoStart={liquidAutoStart}
      />
    </>
  );
}
