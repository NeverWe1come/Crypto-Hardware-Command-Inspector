/**
 * @packageDocumentation
 * Cryptographic hardware catalog navigation sidebar (`@chci/explorer`).
 */

import React, { useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { DEVICE_CATALOG, type DeviceCatalogEntry } from '@chci/device-specs';
import { useWorkspace } from '../state/workspace-context';
import type { CategoryFilter } from '../state/types';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Search,
  Server,
  Cpu,
  Cloud,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface MainCategoryOption {
  readonly id: CategoryFilter;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const MAIN_CATEGORIES: readonly MainCategoryOption[] = [
  { id: 'HSM', label: 'HSMs', icon: Cpu },
  { id: 'KMS', label: 'KMS', icon: KeyRound },
  { id: 'HSMAAS', label: 'HSMaaS', icon: Cloud }
];

/**
 * Hardware catalog sidebar with search bar, 3 main category filters (HSMs, KMS, HSMaaS),
 * collapsible sidebar view, and detailed device cards with example commands.
 *
 * @returns Catalog sidebar JSX element.
 */
export function CatalogSidebar() {
  const intl = useIntl();
  const { state, dispatch } = useWorkspace();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Active category: if currently 'ALL' or 'HSM_FINANCIAL' or 'HSM_GP', treat as 'HSM'
  const activeCategory: CategoryFilter =
    state.selectedCategory === 'KMS'
      ? 'KMS'
      : state.selectedCategory === 'HSMAAS'
        ? 'HSMAAS'
        : 'HSM';

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

  // Filter devices by category and search term
  const filteredDevices = useMemo(() => {
    return DEVICE_CATALOG.filter((device) => {
      // Category filter
      if (activeCategory === 'HSM') {
        if (device.category !== 'HSM_FINANCIAL' && device.category !== 'HSM_GP') {
          return false;
        }
      } else if (device.category !== activeCategory) {
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
  }, [activeCategory, state.catalogSearchQuery]);

  // For HSM category, group into Financial and General Purpose
  const financialHsms = useMemo(
    () => filteredDevices.filter((d) => d.category === 'HSM_FINANCIAL'),
    [filteredDevices]
  );
  const generalPurposeHsms = useMemo(
    () => filteredDevices.filter((d) => d.category === 'HSM_GP'),
    [filteredDevices]
  );

  const renderDeviceCard = (device: DeviceCatalogEntry) => {
    const isSupported = device.status === 'supported';
    const isTabActive = state.tabs.some(
      (t) => t.deviceId === device.id && t.id === state.activeTabId
    );
    const isTabOpen = state.tabs.some((t) => t.deviceId === device.id);

    if (isCollapsed) {
      const initials = device.name
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('');

      return (
        <button
          type="button"
          key={device.id}
          disabled={!isSupported}
          aria-disabled={!isSupported}
          onClick={() => handleOpenDevice(device.id, device.status)}
          title={device.name}
          className={`w-full text-center p-2 rounded-md border text-[11px] font-bold uppercase transition-all select-none ${
            isSupported ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          } ${
            isTabActive
              ? 'bg-[#283350] border-[#ff7800] text-[#feffff] shadow-xs'
              : isTabOpen
                ? 'bg-[#202940] border-[#018934] text-[#feffff]'
                : 'bg-[#202940] border-[#2e3b5b] text-[#94a3b8] hover:text-[#feffff] hover:bg-[#283350]'
          }`}
          data-testid={`device-card-${device.id}`}
        >
          {initials || device.name.slice(0, 2)}
        </button>
      );
    }

    const typeLabel =
      device.category === 'HSM_FINANCIAL'
        ? 'Payment'
        : device.category === 'HSM_GP'
          ? 'General'
          : device.category;

    return (
      <button
        type="button"
        key={device.id}
        disabled={!isSupported}
        aria-disabled={!isSupported}
        onClick={() => handleOpenDevice(device.id, device.status)}
        className={`w-full text-left p-3 rounded-md border transition-all text-xs flex flex-col gap-2 select-none ${
          isSupported
            ? 'cursor-pointer ' +
              (isTabActive
                ? 'bg-[#283350] border-[#ff7800] border-l-4 border-l-[#ff7800] shadow-md shadow-[#ff7800]/10 text-[#feffff]'
                : isTabOpen
                  ? 'bg-[#202940] border-[#018934] border-l-4 border-l-[#018934] shadow-xs text-[#feffff]'
                  : 'bg-[#202940] border-[#2e3b5b] hover:border-[#3d4d75] hover:bg-[#25304b] text-[#feffff]/90')
            : 'cursor-not-allowed opacity-50 border-dashed border-[#2e3b5b] bg-[#1a2236]'
        }`}
        data-testid={`device-card-${device.id}`}
      >
        {/* Title: ONLY device name + status badge */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="font-semibold text-foreground text-xs truncate">
            {device.name}
          </span>
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

        {/* Second Line: Vendor (left) and Type: Payment/General (right) */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Vendor: <strong className="text-foreground/90 font-medium">{device.vendor}</strong>
          </span>
          <span className="font-mono uppercase text-[9px] px-1.5 py-0.5 rounded bg-[#131927] text-[#94a3b8] border border-[#2e3b5b]">
            Tipo: {typeLabel}
          </span>
        </div>

        {/* Third Line: Description (example command removed) */}
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {device.summary[state.locale] ?? device.summary.en}
        </p>
      </button>
    );
  };

  return (
    <aside
      data-testid="catalog-sidebar"
      className={`flex flex-col h-full bg-[#161f33] select-none border-r border-border overflow-hidden transition-all duration-200 ${
        isCollapsed ? 'w-16 min-w-[64px] max-w-[64px]' : 'w-72 min-w-[288px]'
      }`}
    >
      {/* Sidebar search input + Collapse Toggle */}
      <div className={`p-3 border-b border-border flex items-center gap-2 ${isCollapsed ? 'justify-center p-2' : ''}`}>
        {!isCollapsed && (
          <div className="relative flex-1">
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
              className="pl-8 h-8 text-xs bg-[#131927] border-[#2e3b5b]"
            />
          </div>
        )}

        {/* Collapse / Expand toggle button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="size-8 p-0 text-muted-foreground hover:text-foreground hover:bg-[#283350] shrink-0"
          title={isCollapsed ? 'Expandir catálogo' : 'Colapsar catálogo'}
          aria-label={isCollapsed ? 'Expandir catálogo' : 'Colapsar catálogo'}
          data-testid="sidebar-collapse-toggle"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-4 text-[#ff7800]" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      {/* 3 Main Category filter tabs: HSMs, KMS, HSMaaS */}
      {!isCollapsed && (
        <div
          className="px-3 py-2 border-b border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#131927]"
          data-testid="category-filters"
        >
          {MAIN_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#283350] border-[#ff7800] text-[#feffff] shadow-xs'
                    : 'bg-[#1a2236] border-transparent text-[#94a3b8] hover:bg-[#283350]/60 hover:text-[#feffff]'
                }`}
                data-testid={`category-filter-${cat.id.toLowerCase()}`}
              >
                <Icon className={`size-3.5 ${isActive ? 'text-[#ff7800]' : 'text-[#94a3b8]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Catalog device list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2" data-testid="device-list">
        {filteredDevices.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            <FormattedMessage
              id="sidebar.search.empty"
              defaultMessage="No se encontraron dispositivos coincidentes"
            />
          </div>
        ) : activeCategory === 'HSM' ? (
          /* HSM Category: Show Financial first, then separator and General Purpose */
          <>
            {financialHsms.length > 0 && (
              <div className="space-y-1.5">
                {!isCollapsed && (
                  <div className="px-1 py-1 text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="size-3 text-[#38bdf8]" />
                    <span>HSMs Financieros (Payment)</span>
                  </div>
                )}
                {financialHsms.map(renderDeviceCard)}
              </div>
            )}

            {generalPurposeHsms.length > 0 && (
              <div className="space-y-1.5 mt-3">
                {!isCollapsed && (
                  <div className="pt-2 border-t border-[#2e3b5b] px-1 py-1 text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="size-3 text-[#38bdf8]" />
                    <span>Propósito General</span>
                  </div>
                )}
                {generalPurposeHsms.map(renderDeviceCard)}
              </div>
            )}
          </>
        ) : (
          /* KMS or HSMaaS: Standard list */
          <div className="space-y-1.5">
            {filteredDevices.map(renderDeviceCard)}
          </div>
        )}
      </div>
    </aside>
  );
}
