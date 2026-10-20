/**
 * @packageDocumentation
 * Cryptographic hardware catalog navigation sidebar (`@chci/explorer`).
 */

import React, { useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { DEVICE_CATALOG } from '@chci/device-specs';
import { useWorkspace } from '../state/workspace-context';
import type { CategoryFilter } from '../state/types';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Server, Cpu, Cloud, KeyRound, Layers } from 'lucide-react';

interface CategoryOption {
  readonly id: CategoryFilter;
  readonly labelId: string;
  readonly defaultLabel: string;
}

const CATEGORIES: readonly CategoryOption[] = [
  { id: 'ALL', labelId: 'sidebar.categories.all', defaultLabel: 'Todos' },
  { id: 'HSM_FINANCIAL', labelId: 'sidebar.categories.hsm_financial', defaultLabel: 'HSM Financiero' },
  { id: 'HSM_GP', labelId: 'sidebar.categories.hsm_gp', defaultLabel: 'HSM Propósito General' },
  { id: 'KMS', labelId: 'sidebar.categories.kms', defaultLabel: 'KMS' },
  { id: 'HSMAAS', labelId: 'sidebar.categories.hsmaas', defaultLabel: 'HSM as a Service' }
];

/**
 * Resolves the visual icon component for a cryptographic hardware category.
 *
 * @param cat - Active category filter identifier.
 * @returns React icon node.
 */
function getCategoryIcon(cat: CategoryFilter) {
  switch (cat) {
    case 'HSM_FINANCIAL':
      return <Cpu className="size-3.5 text-blue-400 shrink-0" />;
    case 'HSM_GP':
      return <Server className="size-3.5 text-emerald-400 shrink-0" />;
    case 'KMS':
      return <KeyRound className="size-3.5 text-amber-400 shrink-0" />;
    case 'HSMAAS':
      return <Cloud className="size-3.5 text-purple-400 shrink-0" />;
    default:
      return <Layers className="size-3.5 text-muted-foreground shrink-0" />;
  }
}

/**
 * Hardware catalog sidebar with search bar, family category filters, and list
 * of supported (Atalla, Thales, Futurex) and coming-soon devices with status badges.
 *
 * @returns Catalog sidebar JSX element.
 */
export function CatalogSidebar() {
  const intl = useIntl();
  const { state, dispatch } = useWorkspace();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SIDEBAR_QUERY', payload: e.target.value });
  };

  const handleSelectCategory = (cat: CategoryFilter) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: cat });
  };

  const handleOpenDevice = (deviceId: string, status: string) => {
    if (status !== 'supported') {
      return;
    }
    dispatch({ type: 'OPEN_DEVICE_TAB', payload: { deviceId } });
  };

  const filteredDevices = useMemo(() => {
    return DEVICE_CATALOG.filter((device) => {
      // Category filter
      if (state.selectedCategory !== 'ALL' && device.category !== state.selectedCategory) {
        return false;
      }
      // Search term filter
      if (state.catalogSearchQuery.trim()) {
        const query = state.catalogSearchQuery.toLowerCase().trim();
        const matchesName = device.name.toLowerCase().includes(query);
        const matchesVendor = device.vendor.toLowerCase().includes(query);
        const matchesId = device.id.toLowerCase().includes(query);
        return matchesName || matchesVendor || matchesId;
      }
      return true;
    });
  }, [state.selectedCategory, state.catalogSearchQuery]);

  return (
    <aside
      data-testid="catalog-sidebar"
      className="flex flex-col h-full bg-card/60 backdrop-blur-xs select-none border-r border-border overflow-hidden"
    >
      {/* Sidebar search input */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={state.catalogSearchQuery}
            onChange={handleSearchChange}
            placeholder={intl.formatMessage({
              id: 'sidebar.search.placeholder',
              defaultMessage: 'Buscar hardware o KMS...'
            })}
            aria-label={intl.formatMessage({
              id: 'sidebar.search.placeholder',
              defaultMessage: 'Buscar hardware o KMS...'
            })}
            data-testid="catalog-search-input"
            className="pl-8 h-8 text-xs bg-muted/40"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div
        className="px-3 py-2 border-b border-border flex items-center gap-1 overflow-x-auto no-scrollbar"
        data-testid="category-filters"
      >
        {CATEGORIES.map((cat) => {
          const isActive = state.selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-2 py-1 rounded-sm text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
              data-testid={`category-filter-${cat.id.toLowerCase()}`}
            >
              {getCategoryIcon(cat.id)}
              <FormattedMessage id={cat.labelId} defaultMessage={cat.defaultLabel} />
            </button>
          );
        })}
      </div>

      {/* Catalog device list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5" data-testid="device-list">
        {filteredDevices.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            <FormattedMessage
              id="sidebar.search.empty"
              defaultMessage="No se encontraron dispositivos coincidentes"
            />
          </div>
        ) : (
          filteredDevices.map((device) => {
            const isSupported = device.status === 'supported';
            const isTabActive = state.tabs.some((t) => t.deviceId === device.id && t.id === state.activeTabId);
            const isTabOpen = state.tabs.some((t) => t.deviceId === device.id);

            return (
              <button
                type="button"
                key={device.id}
                disabled={!isSupported}
                aria-disabled={!isSupported}
                onClick={() => handleOpenDevice(device.id, device.status)}
                className={`w-full text-left p-2.5 rounded-md border transition-all text-xs flex flex-col gap-1 ${
                  isSupported
                    ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/40 ' +
                      (isTabActive
                        ? 'border-primary/70 bg-primary/10'
                        : isTabOpen
                          ? 'border-border/80 bg-muted/20'
                          : 'border-border/40 bg-card')
                    : 'cursor-not-allowed opacity-55 border-dashed border-border/40 bg-muted/10'
                }`}
                data-testid={`device-card-${device.id}`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-semibold text-foreground truncate">{device.name}</span>
                  {isSupported ? (
                    <Badge
                      variant="success"
                      appearance="light"
                      size="xs"
                      data-testid={`badge-supported-${device.id}`}
                    >
                      <FormattedMessage id="sidebar.badges.supported" defaultMessage="Soportado" />
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      appearance="outline"
                      size="xs"
                      data-testid={`badge-coming-soon-${device.id}`}
                    >
                      <FormattedMessage id="sidebar.badges.comingSoon" defaultMessage="Próximamente" />
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">{device.vendor}</span>
                  <span>•</span>
                  <span className="font-mono uppercase">{device.category}</span>
                </div>

                <p className="text-[11px] text-muted-foreground/90 line-clamp-2 leading-relaxed">
                  {device.summary[state.locale] ?? device.summary.en}
                </p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
