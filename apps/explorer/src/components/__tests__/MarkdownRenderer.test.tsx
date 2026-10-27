import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownRenderer } from '../MarkdownRenderer';

describe('MarkdownRenderer Component', () => {
  it('renders headings and paragraphs correctly', () => {
    const md = `# Document Title\n\n## Subheading\n\nThis is a standard paragraph with **bold** and *italic* text.`;
    render(<MarkdownRenderer markdown={md} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Document Title');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Subheading');
    expect(screen.getByText(/This is a standard paragraph/)).toBeInTheDocument();
  });

  it('renders official vendor notices with proper types and icons', () => {
    const md = `
> [!CAUTION]
> **CAUTION:** Irreversible key deletion will occur.

> [!IMPORTANT]
> **IMPORTANT:** Option 88 must be enabled.

> [!TIP]
> **TIP:** Use odd-parity keys.

> [!NOTE]
> **NOTE:** Trailing CRLF is optional.
`;
    render(<MarkdownRenderer markdown={md} />);

    expect(screen.getByText('CAUTION')).toBeInTheDocument();
    expect(screen.getByText(/Irreversible key deletion/)).toBeInTheDocument();

    expect(screen.getByText('IMPORTANT')).toBeInTheDocument();
    expect(screen.getByText(/Option 88 must be enabled/)).toBeInTheDocument();

    expect(screen.getByText('TIP')).toBeInTheDocument();
    expect(screen.getByText(/Use odd-parity keys/)).toBeInTheDocument();

    expect(screen.getByText('NOTE')).toBeInTheDocument();
    expect(screen.getByText(/Trailing CRLF is optional/)).toBeInTheDocument();
  });

  it('renders interactive code blocks with copy-to-clipboard functionality', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true
    });

    const md = '```\n<10#1VUNE000##D#>\n```';
    render(<MarkdownRenderer markdown={md} />);

    expect(screen.getByText(/Trama Criptográfica/i)).toBeInTheDocument();
    expect(screen.getByText('<10#1VUNE000##D#>')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Copiar/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('<10#1VUNE000##D#>');
    expect(screen.getByText(/Copiado/i)).toBeInTheDocument();
  });

  it('renders GFM tables with AKB and Variant row tinting and <br> line breaks', () => {
    const md = `
| Field | Name | Length | Description |
| :--- | :--- | :---: | :--- |
| 0 | Command ID | 2 | 10 |
| 1 | 🌸 Key Usage (AKB) | 8 | AKB Key Header.<br>Second line of desc. |
| 1 | 🟪 Key Usage (Variant) | 1, 2 | Decimal variant 0-31. |
`;
    const { container } = render(<MarkdownRenderer markdown={md} />);

    expect(screen.getByText('Command ID')).toBeInTheDocument();
    expect(screen.getByText(/AKB Key Header/)).toBeInTheDocument();
    expect(screen.getByText(/Second line of desc/)).toBeInTheDocument();
    expect(screen.getByText(/Decimal variant 0-31/)).toBeInTheDocument();

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);

    // Row 1 (AKB) should have pink border-l
    expect(rows[1]?.className).toContain('border-l-[#f472b6]');

    // Row 2 (Variant) should have purple border-l
    expect(rows[2]?.className).toContain('border-l-purple-400');
  });

  it('calls onNavigateLink when a markdown link is clicked', async () => {
    const user = userEvent.setup();
    const navigateMock = vi.fn();

    const md = 'See [Command 10](commands/cmd-10-generate-key.md) for full details.';
    render(<MarkdownRenderer markdown={md} onNavigateLink={navigateMock} />);

    const linkBtn = screen.getByRole('button', { name: /Command 10/i });
    expect(linkBtn).toBeInTheDocument();

    await user.click(linkBtn);
    expect(navigateMock).toHaveBeenCalledWith('commands/cmd-10-generate-key.md');
  });

  it('renders multi-level bulleted lists correctly', () => {
    const md = `
- Top level bullet 1
  - Sub-bullet 1.1
  - Sub-bullet 1.2
- Top level bullet 2
`;
    render(<MarkdownRenderer markdown={md} />);

    expect(screen.getByText('Top level bullet 1')).toBeInTheDocument();
    expect(screen.getByText('Sub-bullet 1.1')).toBeInTheDocument();
    expect(screen.getByText('Sub-bullet 1.2')).toBeInTheDocument();
    expect(screen.getByText('Top level bullet 2')).toBeInTheDocument();
  });
});
