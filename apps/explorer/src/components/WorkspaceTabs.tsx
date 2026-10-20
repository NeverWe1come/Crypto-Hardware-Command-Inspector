/**
 * @packageDocumentation
 * Horizontal workspace tabs bar for open cryptographic devices (`@chci/explorer`).
 */

import React from 'react';
import { useIntl } from 'react-intl';
import { getDeviceSpec } from '@chci/device-specs';
import { useWorkspace } from '../state/workspace-context';
import { Button } from './ui/button';
import { X, Cpu } from 'lucide-react';

/**
 * Horizontal tab bar displaying open cryptographic devices with device badges,
 * command counts, selection, and close buttons.
 *
 * @returns Workspace tabs bar JSX element, or null if no tabs are open.
 */
export function WorkspaceTabs() {
  const intl = useIntl();
  const { state, dispatch } = useWorkspace();

  if (state.tabs.length === 0) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label={intl.formatMessage({
        id: 'tabs.bar.label',
        defaultMessage: 'Dispositivos abiertos'
      })}
      data-testid="workspace-tabs-bar"
      className="flex items-center h-10 border-b border-border bg-card/40 px-2 gap-1 overflow-x-auto no-scrollbar shrink-0 select-none"
    >
      {state.tabs.map((tab) => {
        const isActive = tab.id === state.activeTabId;
        const spec = getDeviceSpec(tab.deviceId);
        const deviceName = spec?.name ?? tab.deviceId;

        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => dispatch({ type: 'SELECT_DEVICE_TAB', payload: { tabId: tab.id } })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch({ type: 'SELECT_DEVICE_TAB', payload: { tabId: tab.id } });
              }
            }}
            className={`group relative flex items-center gap-2 h-8 px-3 rounded-md text-xs font-medium cursor-pointer border transition-all ${
              isActive
                ? 'bg-background border-border text-foreground shadow-xs'
                : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            }`}
            data-testid={`workspace-tab-${tab.deviceId}`}
          >
            <Cpu className="size-3.5 text-primary/70 shrink-0" />
            <span className="truncate max-w-[160px]">{deviceName}</span>
            <span className="text-[10px] font-mono text-muted-foreground">v{tab.version}</span>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'CLOSE_DEVICE_TAB', payload: { tabId: tab.id } });
              }}
              className="size-4 p-0 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted opacity-60 group-hover:opacity-100"
              aria-label={intl.formatMessage({
                id: 'tabs.closeTab',
                defaultMessage: 'Cerrar pestaña'
              })}
              data-testid={`close-tab-${tab.deviceId}`}
            >
              <X className="size-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
