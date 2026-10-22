/**
 * @packageDocumentation
 * Full cryptographic hardware documentation viewer modal (`@chci/explorer`).
 * Provides indexed multi-chapter navigation across vendor manuals, protocol specifications,
 * command reference appendices, and official architectural guides with category filters
 * and cross-referencing link navigation.
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { DeviceSpec, HardwareDocSectionSpec, LocalizedString } from '@chci/parser-core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { BookOpen, Search, FileText, Cpu, ArrowLeft, Terminal } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Input } from './ui/input';

export interface HardwareDocsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly deviceSpec?: DeviceSpec | null;
  readonly locale: 'es' | 'en' | 'gl';
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
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'chapter' | 'command' | 'appendix'>('all');

  const resolve = useCallback(
    (ls?: LocalizedString | { es: string; en: string; gl?: string } | null) => {
      if (!ls) return '';
      return (locale === 'gl' ? ls.gl : ls[locale]) ?? ls.es ?? ls.en ?? '';
    },
    [locale]
  );

  // Combine documentation sections with individual command reference docs
  const allSections = useMemo<readonly HardwareDocSectionSpec[]>(() => {
    const baseSections = deviceSpec?.documentationSections ?? [];

    const cmdSections: HardwareDocSectionSpec[] = [];
    if (deviceSpec) {
      const defaultVer = deviceSpec.defaultVersion;
      const verSpec = deviceSpec.versions[defaultVer];
      const commands = verSpec?.commands ?? [];
      const requestCommands = commands.filter(
        (c) => c.direction === 'request' && c.markdownDoc
      );
      for (const cmd of requestCommands) {
        cmdSections.push({
          id: `cmd-${cmd.id.toLowerCase()}`,
          title: {
            es: `Comando ${cmd.code} - ${resolve(cmd.name).replace(/\s*\(Petición\)$/i, '')}`,
            en: `Command ${cmd.code} - ${resolve(cmd.name).replace(/\s*\(Request\)$/i, '')}`
          },
          category: 'command' as unknown as 'chapter',
          markdown: cmd.markdownDoc!
        });
      }
    }
    return [...baseSections, ...cmdSections];
  }, [deviceSpec, resolve]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: allSections.length,
      chapter: allSections.filter((s) => s.category === 'chapter').length,
      command: allSections.filter((s) => (s.category as string) === 'command').length,
      appendix: allSections.filter((s) => s.category === 'appendix').length
    };
  }, [allSections]);

  // Filter sections by search query and category
  const filteredSections = useMemo(() => {
    let list = allSections;
    if (categoryFilter !== 'all') {
      list = list.filter((s) => (s.category as string) === categoryFilter);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((s) => {
      const title = resolve(s.title).toLowerCase();
      const md = resolve(s.markdown).toLowerCase();
      return title.includes(q) || md.includes(q) || s.id.toLowerCase().includes(q);
    });
  }, [allSections, categoryFilter, searchQuery, resolve]);

  // Active section (default to 'overview' or first section)
  const activeSection = useMemo(() => {
    if (filteredSections.length === 0) return null;
    if (selectedSectionId) {
      const match = allSections.find((s) => s.id === selectedSectionId);
      if (match) return match;
    }
    const overview = allSections.find((s) => s.id === 'overview');
    return overview ?? filteredSections[0] ?? null;
  }, [allSections, filteredSections, selectedSectionId]);

  // Handle clickable links inside Markdown
  const handleNavigateLink = useCallback(
    (href: string) => {
      const cleanHref = href.trim();
      // 1. Commands: e.g. commands/cmd-15-change-atm-communications-key,-docutel.md or cmd-15
      const fullCmdMatch = cleanHref.match(/cmd-([a-zA-Z0-9_,-]+)(?:\.md)?/i);
      if (fullCmdMatch && fullCmdMatch[1]) {
        const slug = fullCmdMatch[1].toLowerCase().replace(/,/g, '');
        const targetSec = allSections.find((s) => {
          const sid = s.id.toLowerCase();
          return sid.includes(slug) || slug.split('-').every((part) => sid.includes(part) || resolve(s.title).toLowerCase().includes(part));
        });
        if (targetSec) {
          setSelectedSectionId(targetSec.id);
          return;
        }

        // Fallback by code
        const code = slug.split('-')[0];
        if (code) {
          const fallbackSec = allSections.find((s) => s.id.toLowerCase().includes(`-${code}-`) || s.id.toLowerCase().endsWith(`-${code}`));
          if (fallbackSec) {
            setSelectedSectionId(fallbackSec.id);
            return;
          }
        }
      }
      // 2. Chapters: chapters/ch01-... or ch01
      const chMatch =
        cleanHref.match(/chapters\/(ch\d+)/i) || cleanHref.match(/^(ch\d+)/i);
      if (chMatch && chMatch[1]) {
        const chId = chMatch[1].toLowerCase();
        const targetSec = allSections.find((s) => s.id.startsWith(chId));
        if (targetSec) {
          setSelectedSectionId(targetSec.id);
          return;
        }
      }
      // 3. Appendices: appendices/app-a-... or app-a
      const appMatch =
        cleanHref.match(/appendices\/(app-[a-f])/i) ||
        cleanHref.match(/^(app-[a-f])/i);
      if (appMatch && appMatch[1]) {
        const appId = appMatch[1].toLowerCase();
        const targetSec = allSections.find((s) => s.id.startsWith(appId));
        if (targetSec) {
          setSelectedSectionId(targetSec.id);
          return;
        }
      }
    },
    [allSections, resolve]
  );

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
            className="w-80 shrink-0 flex flex-col bg-[#131927] overflow-hidden"
          >
            {/* Search filter */}
            <div className="p-3 border-b border-[#2e3b5b] shrink-0 space-y-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-2.5 text-[#94a3b8]" />
                <Input
                  type="text"
                  placeholder="Buscar en el manual o comandos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-[#1a2236] border-[#2e3b5b] text-[#feffff] placeholder:text-[#64748b] rounded-xs"
                />
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1 bg-[#1a2236] p-0.5 rounded border border-[#2e3b5b] text-[11px]">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`flex-1 py-1 px-1.5 rounded-xs font-medium text-center transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-[#ff7800] text-[#131927] font-semibold'
                      : 'text-[#94a3b8] hover:text-[#feffff]'
                  }`}
                >
                  Todos ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('chapter')}
                  className={`py-1 px-1.5 rounded-xs font-medium text-center transition-colors ${
                    categoryFilter === 'chapter'
                      ? 'bg-[#ff7800] text-[#131927] font-semibold'
                      : 'text-[#94a3b8] hover:text-[#feffff]'
                  }`}
                >
                  Capítulos ({counts.chapter})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('command')}
                  className={`py-1 px-1.5 rounded-xs font-medium text-center transition-colors ${
                    categoryFilter === 'command'
                      ? 'bg-[#ff7800] text-[#131927] font-semibold'
                      : 'text-[#94a3b8] hover:text-[#feffff]'
                  }`}
                >
                  Comandos ({counts.command})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('appendix')}
                  className={`py-1 px-1.5 rounded-xs font-medium text-center transition-colors ${
                    categoryFilter === 'appendix'
                      ? 'bg-[#ff7800] text-[#131927] font-semibold'
                      : 'text-[#94a3b8] hover:text-[#feffff]'
                  }`}
                >
                  Apéndices ({counts.appendix})
                </button>
              </div>
            </div>

            {/* Sections list */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSections.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#94a3b8]">
                  No se encontraron resultados para "{searchQuery}"
                </div>
              ) : (
                filteredSections.map((sec) => {
                  const isSelected = activeSection?.id === sec.id;
                  const cat = sec.category as string;
                  const catBadgeColor =
                    cat === 'overview'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : cat === 'chapter'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : cat === 'command'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                  const icon =
                    cat === 'command' ? (
                      <Terminal
                        className={`size-3.5 shrink-0 ${isSelected ? 'text-[#131927]' : 'text-amber-400'}`}
                      />
                    ) : (
                      <FileText
                        className={`size-3.5 shrink-0 ${isSelected ? 'text-[#131927]' : 'text-[#38bdf8]'}`}
                      />
                    );

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
                        {icon}
                        <span className="truncate">{resolve(sec.title)}</span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-mono px-1 py-0.5 rounded border shrink-0 ${
                          isSelected
                            ? 'bg-[#131927]/20 text-[#131927] border-[#131927]/30'
                            : catBadgeColor
                        }`}
                      >
                        {cat}
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
                  <div className="flex items-center gap-2">
                    {activeSection.id !== 'overview' && (
                      <button
                        type="button"
                        onClick={() => setSelectedSectionId('overview')}
                        className="text-xs text-[#38bdf8] hover:text-[#7dd3fc] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="size-3.5" />
                        <span>Índice Maestro</span>
                      </button>
                    )}
                    {activeSection.id !== 'overview' && (
                      <span className="text-[#64748b]">/</span>
                    )}
                    <h2 className="text-sm font-bold text-[#feffff] truncate max-w-xl">
                      {resolve(activeSection.title)}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#283350] text-[#38bdf8] border border-[#2e3b5b] shrink-0">
                    {activeSection.id}
                  </span>
                </div>
                <MarkdownRenderer
                  markdown={resolve(activeSection.markdown)}
                  onNavigateLink={handleNavigateLink}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#94a3b8] space-y-2">
                <BookOpen className="size-8 text-[#64748b]" />
                <p className="text-xs">
                  Selecciona un comando o capítulo en el menú lateral para leer su documentación completa.
                </p>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
