/**
 * @packageDocumentation
 * Safe, zero-XSS React Markdown renderer tailored for cryptographic HSM specifications and manuals.
 * Supports GFM tables, fenced code blocks, inline code, key management badges, lists,
 * and official vendor notice boxes (NOTE, CAUTION, IMPORTANT, TIP) with exact manual color schemes.
 */

import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface MarkdownRendererProps {
  readonly markdown: string;
  readonly className?: string;
}

/**
 * Render inline formatting (bold, italic, code, badges) into safe React elements.
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex parsing inline tokens: `code`, **bold**, *italic*, badges
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Inline code: `...`
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

    // 2. Bold italic: ***...***
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

    // 3. Bold: **...**
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

    // 4. Italic: *...*
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

    // 5. Special AKB / Variant Badges
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

    // 6. Regular plain text slice until next formatting trigger
    const nextSpecial = remaining.search(/[`*🌸🟧🟩🟪]/u);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Unmatched single character
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
export function MarkdownRenderer({ markdown, className = '' }: MarkdownRendererProps) {
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
          <div
            key={`code-block-${blockIdx++}`}
            className="my-3 rounded-md bg-[#0e1424] border border-[#2e3b5b] overflow-hidden"
          >
            {lang && (
              <div className="px-3 py-1 bg-[#1a2236] border-b border-[#2e3b5b] text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">
                {lang}
              </div>
            )}
            <pre className="p-3 text-xs font-mono text-[#38bdf8] overflow-x-auto whitespace-pre leading-relaxed">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 2. Official Notices / Blockquotes (> **CAUTION:**, > **IMPORTANT:**, > **TIP:**, > **NOTE:**)
      if (trimmed.startsWith('>') || /^\*{0,2}(CAUTION|IMPORTANT|TIP|NOTE)\s*:\*{0,2}/i.test(trimmed)) {
        const quoteLines: string[] = [];
        while (i < rawLines.length) {
          const qLine = rawLines[i]?.trim() ?? '';
          if (qLine === '') break;
          if (qLine.startsWith('>') || /^\*{0,2}(CAUTION|IMPORTANT|TIP|NOTE)\s*:\*{0,2}/i.test(qLine)) {
            quoteLines.push(qLine.replace(/^>\s*/, ''));
            i++;
          } else {
            // Continuation line of quote
            quoteLines.push(qLine);
            i++;
          }
        }

        const fullNotice = quoteLines.join(' ');
        const isCaution = /CAUTION\s*:/i.test(fullNotice);
        const isImportant = /IMPORTANT\s*:/i.test(fullNotice);
        const isTip = /TIP\s*:/i.test(fullNotice);
        const isNote = /NOTE\s*:/i.test(fullNotice);

        const cleanNotice = fullNotice
          .replace(/^\[(CAUTION|IMPORTANT|TIP|NOTE)\]\s*/i, '')
          .replace(/^\*{0,2}(CAUTION|IMPORTANT|TIP|NOTE)\s*:\*{0,2}\s*/i, '')
          .trim();

        if (isCaution) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3 rounded-md bg-[#ff7800]/10 border-l-4 border-l-[#ff7800] border border-[#ff7800]/30 text-xs text-[#feffff] space-y-1"
            >
              <div className="flex items-center gap-1.5 text-[#ff7800] font-bold text-[11px] uppercase tracking-wider">
                <AlertTriangle className="size-3.5" />
                <span>CAUTION</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">{renderInlineFormatting(cleanNotice)}</p>
            </div>
          );
          continue;
        }

        if (isImportant) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3 rounded-md bg-[#ef4444]/10 border-l-4 border-l-[#ef4444] border border-[#ef4444]/30 text-xs text-[#feffff] space-y-1"
            >
              <div className="flex items-center gap-1.5 text-[#ef4444] font-bold text-[11px] uppercase tracking-wider">
                <AlertCircle className="size-3.5" />
                <span>IMPORTANT</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">{renderInlineFormatting(cleanNotice)}</p>
            </div>
          );
          continue;
        }

        if (isTip) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3 rounded-md bg-[#018934]/10 border-l-4 border-l-[#018934] border border-[#018934]/30 text-xs text-[#feffff] space-y-1"
            >
              <div className="flex items-center gap-1.5 text-[#0da845] font-bold text-[11px] uppercase tracking-wider">
                <CheckCircle className="size-3.5" />
                <span>TIP</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">{renderInlineFormatting(cleanNotice)}</p>
            </div>
          );
          continue;
        }

        if (isNote) {
          elements.push(
            <div
              key={`notice-${blockIdx++}`}
              className="my-3 p-3 rounded-md bg-[#0284c7]/10 border-l-4 border-l-[#0284c7] border border-[#0284c7]/30 text-xs text-[#feffff] space-y-1"
            >
              <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold text-[11px] uppercase tracking-wider">
                <Info className="size-3.5" />
                <span>NOTE</span>
              </div>
              <p className="leading-relaxed text-[#cbd5e1]">{renderInlineFormatting(cleanNotice)}</p>
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
            {renderInlineFormatting(cleanNotice)}
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
              className="my-3 overflow-x-auto rounded border border-[#2e3b5b] bg-[#131927]"
            >
              <table className="w-full text-left text-xs border-collapse">
                {headers.length > 0 && (
                  <thead>
                    <tr className="border-b border-[#2e3b5b] bg-[#1a2236] text-[11px] font-semibold text-[#feffff]">
                      {headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          style={{ textAlign: alignments[hIdx] ?? 'left' }}
                          className="py-2 px-3 text-[#38bdf8] border-r border-[#2e3b5b] last:border-r-0"
                        >
                          {renderInlineFormatting(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-[#2e3b5b]/60">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#1a2236]/50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{ textAlign: alignments[cIdx] ?? 'left' }}
                          className="py-1.5 px-3 text-[#cbd5e1] border-r border-[#2e3b5b] last:border-r-0 leading-relaxed"
                        >
                          {renderInlineFormatting(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
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
                className="text-base font-bold text-[#feffff] mt-5 mb-2 pb-1.5 border-b border-[#2e3b5b]"
              >
                {renderInlineFormatting(text)}
              </h1>
            );
          } else if (level === 2) {
            elements.push(
              <h2
                key={`h2-${blockIdx++}`}
                className="text-sm font-semibold text-[#38bdf8] mt-4 mb-2"
              >
                {renderInlineFormatting(text)}
              </h2>
            );
          } else if (level === 3) {
            elements.push(
              <h3
                key={`h3-${blockIdx++}`}
                className="text-xs font-semibold text-[#ff7800] mt-3 mb-1.5 uppercase tracking-wide"
              >
                {renderInlineFormatting(text)}
              </h3>
            );
          } else {
            elements.push(
              <h4
                key={`h4-${blockIdx++}`}
                className="text-xs font-medium text-[#feffff] mt-2.5 mb-1"
              >
                {renderInlineFormatting(text)}
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
      if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const isOrdered = /^\d+\.\s+/.test(trimmed);
        const listItems: string[] = [];
        while (i < rawLines.length) {
          const lLine = rawLines[i]?.trim() ?? '';
          if (/^[-*]\s+/.test(lLine) || /^\d+\.\s+/.test(lLine)) {
            listItems.push(lLine.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''));
            i++;
          } else if (lLine !== '' && !lLine.startsWith('#') && !lLine.startsWith('|')) {
            // Continuation of list item
            if (listItems.length > 0) {
              listItems[listItems.length - 1] += ' ' + lLine;
            }
            i++;
          } else {
            break;
          }
        }

        if (isOrdered) {
          elements.push(
            <ol key={`ol-${blockIdx++}`} className="my-2 space-y-1 list-decimal list-inside text-xs text-[#cbd5e1]">
              {listItems.map((item, itIdx) => (
                <li key={itIdx} className="leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${blockIdx++}`} className="my-2 space-y-1 list-disc list-inside text-xs text-[#cbd5e1]">
              {listItems.map((item, itIdx) => (
                <li key={itIdx} className="leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }
        continue;
      }

      // 7. Regular paragraph
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${blockIdx++}`} className="my-2 text-xs leading-relaxed text-[#cbd5e1]">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      }
      i++;
    }

    return elements;
  }, [markdown]);

  return (
    <div
      data-testid="markdown-renderer"
      className={`prose prose-invert max-w-none text-xs ${className}`}
    >
      {blocks}
    </div>
  );
}
