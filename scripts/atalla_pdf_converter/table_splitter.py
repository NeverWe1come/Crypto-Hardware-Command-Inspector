"""Splits color-coded tables into AKB and Variant markdown tables according to Section 4."""
from typing import List, Tuple
from scripts.atalla_pdf_converter.table_model import ExtractedTable, CommandTableRow, GenericTableRow

def format_markdown_table(headers: List[str], rows: List[List[str]]) -> str:
    """Formats headers and rows into GitHub Flavored Markdown table."""
    if not headers or not rows:
        return ""
    col_widths = [len(h) for h in headers]
    for row in rows:
        for idx, cell in enumerate(row):
            if idx < len(col_widths):
                col_widths[idx] = max(col_widths[idx], len(cell))
            else:
                col_widths.append(len(cell))
                
    header_line = "| " + " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers)) + " |"
    separator_line = "|-" + "-|-".join("-" * col_widths[i] for i in range(len(headers))) + "-|"
    
    row_lines = []
    for row in rows:
        padded = row + [""] * (len(headers) - len(row))
        line = "| " + " | ".join(padded[i].ljust(col_widths[i]) for i in range(len(headers))) + " |"
        row_lines.append(line)
        
    return "\n".join([header_line, separator_line] + row_lines)

def split_table_to_markdown(table: ExtractedTable) -> str:
    """
    Splits table if colored, or formats single table if uncolored.
    Returns complete markdown string including bold headers.
    """
    if table.table_type != "command_param" or not table.has_colors:
        headers = table.headers
        rows = []
        for r in table.rows:
            if isinstance(r, CommandTableRow):
                if r.common_subrow:
                    rows.append([r.field_id, r.contents, r.common_subrow.length, r.common_subrow.description])
                elif r.akb_subrow:
                    rows.append([r.field_id, r.contents, r.akb_subrow.length, r.akb_subrow.description])
                elif r.variant_subrow:
                    rows.append([r.field_id, r.contents, r.variant_subrow.length, r.variant_subrow.description])
            elif isinstance(r, GenericTableRow):
                rows.append(r.cells)
                
        md = format_markdown_table(headers, rows)
        if table.title:
            return f"**{table.title}**\n\n{md}"
        return md

    # Colored table: Split into AKB and Variant per Section 4.4
    base_title = table.title.replace(" (Continued)", "").strip()
    if not base_title:
        akb_title = "**AKB**"
        variant_title = "**Variant**"
    elif "command" in base_title.lower():
        akb_title = "**Command table: AKB**"
        variant_title = "**Command table: Variant**"
    elif "response" in base_title.lower():
        akb_title = "**Response table: AKB**"
        variant_title = "**Response table: Variant**"
    else:
        akb_title = f"**{base_title}: AKB**"
        variant_title = f"**{base_title}: Variant**"

    akb_rows = []
    variant_rows = []
    
    for r in table.rows:
        if not isinstance(r, CommandTableRow):
            continue
            
        if r.common_subrow:
            akb_rows.append([r.field_id, r.contents, r.common_subrow.length, r.common_subrow.description])
            variant_rows.append([r.field_id, r.contents, r.common_subrow.length, r.common_subrow.description])
        else:
            if r.akb_subrow:
                akb_rows.append([r.field_id, r.contents, r.akb_subrow.length, r.akb_subrow.description])
            if r.variant_subrow:
                variant_rows.append([r.field_id, r.contents, r.variant_subrow.length, r.variant_subrow.description])

    akb_md = format_markdown_table(table.headers, akb_rows)
    variant_md = format_markdown_table(table.headers, variant_rows)
    
    return f"{akb_title}\n\n{akb_md}\n\n{variant_title}\n\n{variant_md}"
