/**
 * @packageDocumentation
 * Full cryptographic hardware documentation viewer modal (`@chci/explorer`).
 * Provides indexed multi-chapter navigation across vendor manuals, protocol specifications,
 * command reference appendices, and official architectural guides.
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { DeviceSpec } from '@chci/parser-core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { BookOpen, Search, FileText, Cpu } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Input } from './ui/input';

export interface HardwareDocsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly deviceSpec?: DeviceSpec | null;
  readonly locale: 'es' | 'en';
}

/**
 * Modal dialog for inspecting the full official hardware documentation of the active device.
 */
export function HardwareDocsModal({
  isOpen,
  onClose,
  deviceSpec,
  locale
}: HardwareDocsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const sections = useMemo(() => {
    return deviceSpec?.documentationSections ?? [];
  }, [deviceSpec?.documentationSections]);

  const resolve = useCallback(
    (ls?: { es: string; en: string } | null) => {
      if (!ls) return '';
      return ls[locale] ?? ls.es ?? ls.en ?? '';
    },
    [locale]
  );

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => {
      const title = resolve(s.title).toLowerCase();
      const md = resolve(s.markdown).toLowerCase();
      return title.includes(q) || md.includes(q);
    });
  }, [sections, searchQuery, resolve]);

  // Active section (default to first section or 'overview')
  const activeSection = useMemo(() => {
    if (filteredSections.length === 0) return null;
    if (selectedSectionId) {
      const match = filteredSections.find((s) => s.id === selectedSectionId);
      if (match) return match;
    }
    return filteredSections[0] ?? null;
  }, [filteredSections, selectedSectionId]);

  if (!deviceSpec) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="hardware-docs-modal"
        className="max-w-6xl w-[95vw] h-[88vh] flex flex-col bg-[#1a2236] border-[#2e3b5b] text-[#feffff] p-0 overflow-hidden"
      >
        {/* Top Header */}
        <DialogHeader className="px-6 py-3.5 border-b border-[#2e3b5b] shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-[#283350] flex items-center justify-center border border-[#ff7800]/40 text-[#ff7800]">
              <Cpu className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-[#feffff] flex items-center gap-2">
                <span>Documentación Hardware: {deviceSpec.name}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#018934]/20 text-[#0da845] border border-[#018934]/40">
                  v{deviceSpec.defaultVersion}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#94a3b8]">
                Manuales de referencia oficiales, especificaciones de trama y arquitectura de seguridad
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2-Column Body: Navigation Sidebar + Markdown Content Pane */}
        <div className="flex-1 flex min-h-0 overflow-hidden divide-x divide-[#2e3b5b]">
          {/* Left Navigation Sidebar */}
          <aside
            data-testid="hardware-docs-sidebar"
            className="w-72 shrink-0 flex flex-col bg-[#131927] overflow-hidden"
          >
            {/* Search filter */}
            <div className="p-3 border-b border-[#2e3b5b] shrink-0">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-2.5 text-[#94a3b8]" />
                <Input
                  type="text"
                  placeholder="Buscar en el manual..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-[#1a2236] border-[#2e3b5b] text-[#feffff] placeholder:text-[#64748b] rounded-xs"
                />
              </div>
            </div>

            {/* Sections list */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSections.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#94a3b8]">
                  No se encontraron secciones para "{searchQuery}"
                </div>
              ) : (
                filteredSections.map((sec) => {
                  const isSelected = activeSection?.id === sec.id;
                  const catBadgeColor =
                    sec.category === 'overview'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : sec.category === 'chapter'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                  return (
                    <button
                      key={sec.id}
                      type="button"
                      data-testid={`hardware-doc-item-${sec.id}`}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`w-full text-left p-2 rounded-xs transition-colors flex items-center justify-between text-xs select-none ${
                        isSelected
                          ? 'bg-[#ff7800] text-[#131927] font-semibold shadow-xs'
                          : 'text-[#cbd5e1] hover:bg-[#1a2236] hover:text-[#feffff]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className={`size-3.5 shrink-0 ${isSelected ? 'text-[#131927]' : 'text-[#38bdf8]'}`} />
                        <span className="truncate">{resolve(sec.title)}</span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-mono px-1 py-0.5 rounded border shrink-0 ${
                          isSelected ? 'bg-[#131927]/20 text-[#131927] border-[#131927]/30' : catBadgeColor
                        }`}
                      >
                        {sec.category}
                      </span>
                    </button>
                  );
                })
              )}
            </nav>
          </aside>

          {/* Right Content Pane */}
          <main
            data-testid="hardware-docs-content"
            className="flex-1 overflow-y-auto p-6 bg-[#1a2236] flex flex-col space-y-4"
          >
            {activeSection ? (
              <div className="max-w-4xl mx-auto w-full space-y-4">
                <div className="pb-3 border-b border-[#2e3b5b] flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#feffff]">
                    {resolve(activeSection.title)}
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#283350] text-[#38bdf8] border border-[#2e3b5b]">
                    {activeSection.id}
                  </span>
                </div>
                <MarkdownRenderer markdown={resolve(activeSection.markdown)} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#94a3b8] space-y-2">
                <BookOpen className="size-8 text-[#64748b]" />
                <p className="text-xs">Selecciona un capítulo en el menú lateral para leer su contenido.</p>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
