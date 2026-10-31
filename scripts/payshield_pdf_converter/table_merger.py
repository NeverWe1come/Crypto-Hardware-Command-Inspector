"""Table merging logic across page breaks for payShield 10K PDF."""
from typing import List, Optional
from scripts.payshield_pdf_converter.table_model import ExtractedTable, CommandTableRow

class TableMerger:
    """Merges continuation tables across page boundaries."""

    @staticmethod
    def should_merge(prev_table: Optional[ExtractedTable], next_table: ExtractedTable, prev_page_num: int) -> bool:
        """Determines if next_table is a continuation of prev_table."""
        if not prev_table:
            return False

        # Only merge tables from strictly consecutive pages
        if next_table.page_num != prev_page_num + 1:
            return False

        # Only merge command_param tables
        if prev_table.kind != "command_param" or next_table.kind != "command_param":
            return False

        # If previous table ended with Message Trailer, the message definition is complete
        if any(isinstance(r, CommandTableRow) and "Message Trailer" in r.field for r in prev_table.rows):
            return False

        # If next table explicitly starts a RESPONSE MESSAGE, do not merge with COMMAND table
        if len(next_table.rows) > 0 and next_table.rows[0].is_section:
            sec_name = next_table.rows[0].field.upper()
            if "RESPONSE MESSAGE" in sec_name and "RESPONSE" not in prev_table.title.upper():
                return False

        # If next table has a distinct explicit title (e.g. new command title)
        if next_table.title and next_table.title != prev_table.title:
            return False

        return True

    @staticmethod
    def merge(prev_table: ExtractedTable, next_table: ExtractedTable) -> ExtractedTable:
        """Merges next_table into prev_table seamlessly."""
        if not next_table.rows:
            return prev_table

        # Check if first row of next_table is an orphan continuation row
        first_next = next_table.rows[0]
        remaining_rows = next_table.rows[1:]

        if isinstance(first_next, CommandTableRow) and not first_next.is_section and first_next.field == "":
            # Merge into the last row of prev_table
            if prev_table.rows:
                last_prev = prev_table.rows[-1]
                if isinstance(last_prev, CommandTableRow):
                    if first_next.has_subrows:
                        last_prev.subrows.extend(first_next.subrows)
                    if first_next.details:
                        if last_prev.details:
                            last_prev.details += "<br>" + first_next.details
                        else:
                            last_prev.details = first_next.details
                    if first_next.length_type and not last_prev.length_type:
                        last_prev.length_type = first_next.length_type
                else:
                    prev_table.rows.append(first_next)
            else:
                prev_table.rows.append(first_next)
        else:
            prev_table.rows.append(first_next)

        prev_table.rows.extend(remaining_rows)
        prev_table.has_colors = prev_table.has_colors or next_table.has_colors
        prev_table.continued_from_prev = True
        return prev_table
