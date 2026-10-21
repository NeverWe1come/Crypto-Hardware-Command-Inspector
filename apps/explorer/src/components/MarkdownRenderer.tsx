/**
 * @packageDocumentation
 * Safe, zero-XSS React Markdown renderer tailored for cryptographic HSM specifications and manuals.
 * Supports GFM tables with AKB/Variant row tinting, interactive code blocks with copy-to-clipboard,
 * inline code, key management badges, multi-level lists, clickable cross-references,
 * and official vendor notice boxes (NOTE, CAUTION, IMPORTANT, TIP) with exact manual color schemes.
 */

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Copy,
  Check,
  Terminal,
  ExternalLink
} from 'lucide-react';

export interface MarkdownRendererProps {
  readonly markdown: string;
  readonly className?: string;
  readonly onNavigateLink?: (href: string) => void;
}

/**
 * Interactive code block with syntax framing, line styling, and copy button.
 */
function CodeBlock({ code, lang }: { readonly code: string; readonly lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCommandSyntax =
    code.trim().startsWith('<') && (code.trim().includes('#') || code.trim().endsWith('>'));

  return (
    <div className="my-3 rounded-md bg-[#0e1424] border border-[#2e3b5b] overflow-hidden group shadow-xs">
      <div className="px-3 py-1.5 bg-[#141b2d] border-b border-[#2e3b5b] flex items-center justify-between text-[11px] font-mono text-[#94a3b8]">
        <div className="flex items-center gap-1.5">
          <Terminal className="size-3 text-[#38bdf8]" />
          <span className="uppercase tracking-wider font-semibold text-[#cbd5e1]">
            {isCommandSyntax ? 'Trama Criptográfica' : lang || 'Sintaxis'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#1a2236] text-[#cbd5e1] hover:text-[#feffff] hover:bg-[#283350] border border-[#2e3b5b] transition-colors cursor-pointer"
          title="Copiar trama al portapapeles"
        >
          {copied ? (
            <>
              <Check className="size-3 text-[#0da845]" />
              <span className="text-[#0da845]">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="size-3 text-[#94a3b8]" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-[#38bdf8] overflow-x-auto whitespace-pre leading-relaxed select-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Render inline formatting (bold, italic, code, badges, links, <br>) into safe React elements.
 */
function renderInlineFormatting(
  text: string,
  onNavigateLink?: (href: string) => void
): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Line break <br> / <br/>
    const brMatch = remaining.match(/^<br\s*\/?>/i);
    if (brMatch) {
      tokens.push(<br key={`br-${keyIdx++}`} className="my-1" />);
      remaining = remaining.slice(brMatch[0].length);
      continue;
    }

    // 2. Inline code: `...`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch && codeMatch[1] !== undefined) {
      tokens.push(
        <code
          key={`code-${keyIdx++}`}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#131927] text-[#38bdf8] border border-[#2e3b5b]"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 3. Markdown links: [Text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch[1] !== undefined && linkMatch[2] !== undefined) {
      const linkText = linkMatch[1];
      const linkHref = linkMatch[2];
      tokens.push(
        <button
          key={`link-${keyIdx++}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigateLink?.(linkHref);
          }}
          className="inline-flex items-center gap-1 font-medium text-[#38bdf8] hover:text-[#7dd3fc] underline underline-offset-2 decoration-[#38bdf8]/40 hover:decoration-[#38bdf8] cursor-pointer text-left transition-colors"
          title={`Navegar a ${linkHref}`}
        >
          <span>{linkText}</span>
          <ExternalLink className="size-2.5 opacity-70" />
        </button>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 4. Bold italic: ***...***
    const boldItalicMatch = remaining.match(/^\*\*\*([^*]+)\*\*\*/);
    if (boldItalicMatch && boldItalicMatch[1] !== undefined) {
      tokens.push(
        <strong key={`bi-${keyIdx++}`} className="font-bold italic text-[#feffff]">
          {boldItalicMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldItalicMatch[0].length);
      continue;
    }

    // 5. Bold: **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch[1] !== undefined) {
      tokens.push(
        <strong key={`bold-${keyIdx++}`} className="font-semibold text-[#feffff]">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 6. Italic: *...*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch && italicMatch[1] !== undefined) {
      tokens.push(
        <em key={`em-${keyIdx++}`} className="italic text-[#cbd5e1]">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 7. Special AKB / Variant Badges
    const akbBadge = remaining.match(/^(🌸\s*AKB|🟧\s*AKB|🟩\s*AKB)/);
    if (akbBadge) {
      tokens.push(
        <span
          key={`akb-${keyIdx++}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#FBD5CD]/20 text-[#f472b6] border border-[#f472b6]/40 mr-1"
        >
          AKB
        </span>
      );
      remaining = remaining.slice(akbBadge[0].length);
      continue;
    }

    const variantBadge = remaining.match(/^(🟪\s*Variant)/);
    if (variantBadge) {
      tokens.push(
        <span
          key={`var-${keyIdx++}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 mr-1"
        >
          Variant
        </span>
      );
      remaining = remaining.slice(variantBadge[0].length);
      continue;
    }

    // 8. Regular plain text slice until next formatting trigger
    const nextSpecial = remaining.search(/[`*🌸🟧🟩🟪[<]/u);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return tokens;
}

/**
 * Pure React Markdown renderer for technical documentation.
 */
export function MarkdownRenderer({
  markdown,
  className = '',
  onNavigateLink
}: MarkdownRendererProps) {
  const blocks = useMemo(() => {
    const rawLines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let blockIdx = 0;

    while (i < rawLines.length) {
      const line = rawLines[i] ?? '';
      const trimmed = line.trim();

      // Skip HTML comment markers: <!-- Page 135 -->
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
        i++;
        continue;
      }

      // 1. Fenced Code Block: ```...```
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < rawLines.length && !rawLines[i]?.trim().startsWith('```')) {
          codeLines.push(rawLines[i] ?? '');
          i++;
        }
        if (i < rawLines.length) i++; // Consume closing ```

        elements.push(
          <CodeBlock
            key={`code-block-${blockIdx++}`}
            code={codeLines.join('\n')}
            lang={lang}
          />
        );
        continue;
      }

      // 2. Official Notices / Blockquotes (> [!NOTE], > **CAUTION:**, > **IMPORTANT:**, > **TIP:**, > **NOTE:**)
      if (
        trimmed.startsWith('>') ||
        /^\*{0,2}(CAUTION|IMPORTANT|TIP|NOTE)\s*:\*{0,2}/i.test(trimmed)
      ) {
        const quoteLines: string[] = [];
        while (i < rawLines.length) {
          const qLine = rawLines[i]?.trim() ?? '';
          if (qLine === '') break;
          if (
            qLine.startsWith('>') ||
            /^\*{0,2}(CAUTION|IMPORTANT|TIP|NOTE)\s*:\*{0,2}/i.test(qLine)
          ) {
            quoteLines.push(qLine.replace(/^>\s*/, ''));
            i++;
          } else {
            quoteLines.push(qLine);
            i++;
          }
        }

        const fullNotice = quoteLines.join(' ');
        const isCaution = /CAUTION/i.test(fullNotice);
        const isImportant = /IMPORTANT/i.test(fullNotice);
        const isTip = /TIP/i.test(fullNotice);
        const isNote = /NOTE/i.test(fullNotice);

        const cleanNotice = fullNotice
          .replace(/^\[!(CAUTION|IMPORTANT|TIP|NOTE)\]\s*/i, '')
          .replace(/^\[(CAUTION|IMPORTANT|TIP|NOTE)\]\s*/i, '')
          .replace(/^\*{0,2}(CAUTION|IMPORTANT|TIP|NOTE)\s*:\*{0,2}\s*/i, '')
          .trim();

        if (isCaution) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3.5 rounded-md bg-[#ff7800]/10 border-l-4 border-l-[#ff7800] border border-[#ff7800]/30 text-xs text-[#feffff] space-y-1 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[#ff7800] font-bold text-[11px] uppercase tracking-wider">
                <AlertTriangle className="size-3.5" />
                <span>CAUTION</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">
                {renderInlineFormatting(cleanNotice, onNavigateLink)}
              </p>
            </div>
          );
          continue;
        }

        if (isImportant) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3.5 rounded-md bg-[#ef4444]/10 border-l-4 border-l-[#ef4444] border border-[#ef4444]/30 text-xs text-[#feffff] space-y-1 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[#ef4444] font-bold text-[11px] uppercase tracking-wider">
                <AlertCircle className="size-3.5" />
                <span>IMPORTANT</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">
                {renderInlineFormatting(cleanNotice, onNavigateLink)}
              </p>
            </div>
          );
          continue;
        }

        if (isTip) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3.5 rounded-md bg-[#018934]/10 border-l-4 border-l-[#018934] border border-[#018934]/30 text-xs text-[#feffff] space-y-1 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[#0da845] font-bold text-[11px] uppercase tracking-wider">
                <CheckCircle className="size-3.5" />
                <span>TIP</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">
                {renderInlineFormatting(cleanNotice, onNavigateLink)}
              </p>
            </div>
          );
          continue;
        }

        if (isNote) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3.5 rounded-md bg-[#0284c7]/10 border-l-4 border-l-[#0284c7] border border-[#0284c7]/30 text-xs text-[#feffff] space-y-1 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold text-[11px] uppercase tracking-wider">
                <Info className="size-3.5" />
                <span>NOTE</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">
                {renderInlineFormatting(cleanNotice, onNavigateLink)}
              </p>
            </div>
          );
          continue;
        }

        // Generic blockquote
        elements.push(
          <blockquote
            key={`quote-${blockIdx++}`}
            className="my-3 p-2.5 rounded bg-[#131927] border-l-4 border-l-[#38bdf8] border border-[#2e3b5b] text-xs text-[#94a3b8] italic leading-relaxed"
          >
            {renderInlineFormatting(cleanNotice, onNavigateLink)}
          </blockquote>
        );
        continue;
      }

      // 3. Table (| ... | ... |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i]?.trim().startsWith('|')) {
          tableLines.push(rawLines[i]?.trim() ?? '');
          i++;
        }

        if (tableLines.length >= 2) {
          const splitRow = (r: string) =>
            r
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim());

          const headerRow = splitRow(tableLines[0] ?? '');
          const sepRow = splitRow(tableLines[1] ?? '');
          const isSep = sepRow.every((c) => /^:?-+:?$/.test(c));

          const headers = isSep ? headerRow : [];
          const alignments: Array<'left' | 'center' | 'right'> = isSep
            ? sepRow.map((c) => {
                if (c.startsWith(':') && c.endsWith(':')) return 'center';
                if (c.endsWith(':')) return 'right';
                return 'left';
              })
            : headerRow.map(() => 'left');

          const dataRows = (isSep ? tableLines.slice(2) : tableLines).map(splitRow);

          elements.push(
            <div
              key={`table-${blockIdx++}`}
              className="my-3 overflow-x-auto rounded border border-[#2e3b5b] bg-[#131927] shadow-xs"
            >
              <table className="w-full text-left text-xs border-collapse">
                {headers.length > 0 && (
                  <thead>
                    <tr className="border-b border-[#2e3b5b] bg-[#1a2236] text-[11px] font-semibold text-[#feffff]">
                      {headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          style={{ textAlign: alignments[hIdx] ?? 'left' }}
                          className="py-2.5 px-3 text-[#38bdf8] border-r border-[#2e3b5b] last:border-r-0 uppercase tracking-wider font-mono text-[10px]"
                        >
                          {renderInlineFormatting(h, onNavigateLink)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-[#2e3b5b]/60">
                  {dataRows.map((row, rIdx) => {
                    const rowText = row.join(' ');
                    const isAkbRow = rowText.includes('🌸') || rowText.includes('(AKB)');
                    const isVarRow = rowText.includes('🟪') || rowText.includes('(Variant)');

                    const rowClass = isAkbRow
                      ? 'bg-[#FBD5CD]/5 hover:bg-[#FBD5CD]/15 border-l-2 border-l-[#f472b6] transition-colors'
                      : isVarRow
                        ? 'bg-purple-500/5 hover:bg-purple-500/15 border-l-2 border-l-purple-400 transition-colors'
                        : 'hover:bg-[#1a2236]/50 transition-colors';

                    return (
                      <tr key={rIdx} className={rowClass}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{ textAlign: alignments[cIdx] ?? 'left' }}
                            className="py-2 px-3 text-[#cbd5e1] border-r border-[#2e3b5b] last:border-r-0 leading-relaxed align-top"
                          >
                            {renderInlineFormatting(cell, onNavigateLink)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 4. Headings
      if (trimmed.startsWith('#')) {
        const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (hMatch && hMatch[1] && hMatch[2]) {
          const level = hMatch[1].length;
          const text = hMatch[2];
          i++;

          if (level === 1) {
            elements.push(
              <h1
                key={`h1-${blockIdx++}`}
                className="text-base font-bold text-[#feffff] mt-5 mb-2 pb-1.5 border-b border-[#2e3b5b] flex items-center justify-between"
              >
                <span>{renderInlineFormatting(text, onNavigateLink)}</span>
              </h1>
            );
          } else if (level === 2) {
            elements.push(
              <h2
                key={`h2-${blockIdx++}`}
                className="text-sm font-semibold text-[#38bdf8] mt-4 mb-2 flex items-center gap-2"
              >
                <span>{renderInlineFormatting(text, onNavigateLink)}</span>
              </h2>
            );
          } else if (level === 3) {
            elements.push(
              <h3
                key={`h3-${blockIdx++}`}
                className="text-xs font-semibold text-[#ff7800] mt-3 mb-1.5 uppercase tracking-wide"
              >
                {renderInlineFormatting(text, onNavigateLink)}
              </h3>
            );
          } else {
            elements.push(
              <h4
                key={`h4-${blockIdx++}`}
                className="text-xs font-medium text-[#feffff] mt-2.5 mb-1 flex items-center gap-1.5"
              >
                {renderInlineFormatting(text, onNavigateLink)}
              </h4>
            );
          }
          continue;
        }
      }

      // 5. Horizontal rule
      if (/^(\*\*\*|---|___)$/.test(trimmed)) {
        elements.push(<hr key={`hr-${blockIdx++}`} className="my-4 border-[#2e3b5b]" />);
        i++;
        continue;
      }

      // 6. List items (- or * or 1.)
      if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
        const listItems: Array<{ indent: number; text: string; isOrdered: boolean }> = [];
        while (i < rawLines.length) {
          const rawItem = rawLines[i] ?? '';
          if (/^\s*[-*]\s+/.test(rawItem) || /^\s*\d+\.\s+/.test(rawItem)) {
            const indentMatch = rawItem.match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1]?.length ?? 0 : 0;
            const isOrdered = /^\s*\d+\.\s+/.test(rawItem);
            const itemText = rawItem.trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
            listItems.push({ indent, text: itemText, isOrdered });
            i++;
          } else if (rawItem.trim() !== '' && !rawItem.trim().startsWith('#') && !rawItem.trim().startsWith('|')) {
            if (listItems.length > 0) {
              const last = listItems[listItems.length - 1];
              if (last) {
                last.text += ' ' + rawItem.trim();
              }
            }
            i++;
          } else {
            break;
          }
        }

        elements.push(
          <ul key={`list-${blockIdx++}`} className="my-2.5 space-y-1.5 text-xs text-[#cbd5e1]">
            {listItems.map((item, itIdx) => {
              const isSub = item.indent >= 2;
              return (
                <li
                  key={itIdx}
                  className={`leading-relaxed flex items-start gap-2 ${isSub ? 'pl-5 text-[#94a3b8]' : ''}`}
                >
                  <span className={`shrink-0 select-none ${isSub ? 'text-[#ff7800] text-[10px]' : 'text-[#38bdf8]'}`}>
                    {isSub ? '▪' : '•'}
                  </span>
                  <span>{renderInlineFormatting(item.text, onNavigateLink)}</span>
                </li>
              );
            })}
          </ul>
        );
        continue;
      }

      // 7. Regular paragraph
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${blockIdx++}`} className="my-2 text-xs leading-relaxed text-[#cbd5e1]">
            {renderInlineFormatting(trimmed, onNavigateLink)}
          </p>
        );
      }
      i++;
    }

    return elements;
  }, [markdown, onNavigateLink]);

  return (
    <div
      data-testid="markdown-renderer"
      className={`prose prose-invert max-w-none text-xs ${className}`}
    >
      {blocks}
    </div>
  );
}
