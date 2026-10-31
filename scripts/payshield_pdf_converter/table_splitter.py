"""Table splitting logic for Variant and Key Block LMK methods."""
from typing import List, Tuple, Optional
from scripts.payshield_pdf_converter.table_model import ExtractedTable, CommandTableRow, GenericTableRow

class TableSplitter:
    """Splits colored command tables into Variant and Key Block tables."""

    @staticmethod
    def split_to_markdown(table: ExtractedTable) -> str:
        """
        Converts an ExtractedTable to Markdown.
        If table.has_colors is False, outputs a single table.
        If True, outputs two tables: Variant first, Key Block second.
        """
        if table.kind == "generic":
            return TableSplitter._render_generic_table(table)

        if not table.has_colors:
            return TableSplitter._render_single_command_table(table)

        return TableSplitter._render_split_command_tables(table)

    @staticmethod
    def _render_generic_table(table: ExtractedTable) -> str:
        lines = []
        if table.title:
            lines.append(f"**{table.title}**\n")
        header_line = "| " + " | ".join(table.headers) + " |"
        sep_line = "| " + " | ".join(["---"] * len(table.headers)) + " |"
        lines.append(header_line)
        lines.append(sep_line)
        for r in table.rows:
            if isinstance(r, GenericTableRow):
                # Ensure correct column count
                cells = list(r.cells)
                while len(cells) < len(table.headers):
                    cells.append("")
                row_line = "| " + " | ".join(cells[:len(table.headers)]) + " |"
                lines.append(row_line)
        return "\n".join(lines) + "\n"

    @staticmethod
    def _render_single_command_table(table: ExtractedTable) -> str:
        lines = []
        if table.title:
            lines.append(f"**{table.title}**\n")
        lines.append("| Field | Length & Type | Details |")
        lines.append("|---|---|---|")
        for r in table.rows:
            if isinstance(r, CommandTableRow):
                if r.is_section:
                    lines.append(f"| {r.field} | | |")
                else:
                    lines.append(f"| {r.field} | {r.length_type} | {r.details} |")
        return "\n".join(lines) + "\n"

    @staticmethod
    def _render_split_command_tables(table: ExtractedTable) -> str:
        v_title, kb_title = TableSplitter._get_split_titles(table.title)
        v_rows = TableSplitter._build_rows_for_method(table.rows, "variant")
        kb_rows = TableSplitter._build_rows_for_method(table.rows, "key_block")

        lines = []
        # Variant Table
        lines.append(f"**{v_title}**\n")
        lines.append("| Field | Length & Type | Details |")
        lines.append("|---|---|---|")
        for f, lt, d, is_sec in v_rows:
            if is_sec:
                lines.append(f"| {f} | | |")
            else:
                lines.append(f"| {f} | {lt} | {d} |")

        lines.append("")  # Blank line between tables

        # Key Block Table
        lines.append(f"**{kb_title}**\n")
        lines.append("| Field | Length & Type | Details |")
        lines.append("|---|---|---|")
        for f, lt, d, is_sec in kb_rows:
            if is_sec:
                lines.append(f"| {f} | | |")
            else:
                lines.append(f"| {f} | {lt} | {d} |")

        return "\n".join(lines) + "\n"

    @staticmethod
    def _build_rows_for_method(
        rows: List[CommandTableRow], target_method: str
    ) -> List[Tuple[str, str, str, bool]]:
        """
        Builds rows for target_method ('variant' or 'key_block').
        Handles section inheritance: if a section is scoped to one method,
        its child rows are only included in that method.
        """
        result = []
        current_section_scope: Optional[str] = None

        for r in rows:
            if not isinstance(r, CommandTableRow):
                continue

            if r.is_section:
                # Check if section title itself indicates a method
                f_lower = r.field.lower()
                if "key block format" in f_lower or "key block lmk" in f_lower:
                    current_section_scope = "key_block"
                elif "variant lmk" in f_lower:
                    current_section_scope = "variant"
                elif r.section_method:
                    current_section_scope = r.section_method
                else:
                    current_section_scope = None

                # Should this section header be included in this method?
                if current_section_scope is None or current_section_scope == target_method:
                    result.append((r.field, "", "", True))
                continue

            # Check if row is inside a method-scoped section
            if current_section_scope and current_section_scope != target_method:
                # Row belongs to a different section scope, skip
                continue

            if r.has_subrows:
                # Find matching subrow for target_method
                matching_subs = [sr for sr in r.subrows if sr.method == target_method]
                if matching_subs:
                    for sr in matching_subs:
                        result.append((r.field, sr.length_type, sr.details, False))
                # If row only had subrows for the OTHER method, it is omitted here (Section 6.2 rule 6)
            else:
                # Common row: include in both tables
                result.append((r.field, r.length_type, r.details, False))

        return result

    @staticmethod
    def _get_split_titles(title: str) -> Tuple[str, str]:
        """Derives titles according to Section 6.4."""
        t_clean = title.strip() if title else ""
        t_upper = t_clean.upper()

        if "COMMAND" in t_upper:
            return "Command: Variant", "Command: Key Block"
        if "RESPONSE" in t_upper:
            return "Response: Variant", "Response: Key Block"
        if t_clean:
            return f"{t_clean}: Variant", f"{t_clean}: Key Block"
        return "Variant", "Key Block"
