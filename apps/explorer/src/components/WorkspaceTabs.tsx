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
            onAuxClick={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                dispatch({ type: 'CLOSE_DEVICE_TAB', payload: { tabId: tab.id } });
              }
            }}
            onMouseUp={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                dispatch({ type: 'CLOSE_DEVICE_TAB', payload: { tabId: tab.id } });
              }
            }}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch({ type: 'SELECT_DEVICE_TAB', payload: { tabId: tab.id } });
              }
            }}
            className={`group relative flex items-center gap-2 h-8 px-3 rounded-md text-xs font-medium cursor-pointer border transition-all ${
              isActive
                ? 'bg-[#202940] border-[#2e3b5b] border-b-2 border-b-[#ff7800] text-[#feffff] font-semibold shadow-xs'
                : 'bg-transparent border-transparent text-[#94a3b8] hover:bg-[#283350]/50 hover:text-[#feffff]'
            }`}
            data-testid={`workspace-tab-${tab.deviceId}`}
          >
            <Cpu className={`size-3.5 shrink-0 ${isActive ? 'text-[#0da845]' : 'text-[#94a3b8]'}`} />
            <span className="truncate max-w-[160px]">{deviceName}</span>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'CLOSE_DEVICE_TAB', payload: { tabId: tab.id } });
              }}
              className="size-4 p-0 rounded-xs text-[#94a3b8] hover:text-[#feffff] hover:bg-[#283350] opacity-60 group-hover:opacity-100"
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
