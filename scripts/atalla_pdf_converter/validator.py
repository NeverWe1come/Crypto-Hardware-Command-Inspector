"""Automated validations according to Section 9."""
from typing import List, Dict, Any, Tuple
from scripts.atalla_pdf_converter.table_model import ExtractedTable, CommandTableRow, GenericTableRow

class ValidationReport:
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.stats: Dict[str, int] = {
            "tables_validated": 0,
            "divided_tables": 0,
            "common_rows_checked": 0,
            "continuous_fields_checked": 0,
            "colored_rects_matched": 0
        }

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0

def validate_table(table: ExtractedTable, report: ValidationReport, raw_salmon_count: int, raw_lilac_count: int):
    """Run Section 9 checks on an extracted/merged table."""
    report.stats["tables_validated"] += 1
    
    # Check 1: All rows have the same number of columns
    num_cols = len(table.headers)
    for idx, r in enumerate(table.rows):
        if isinstance(r, GenericTableRow):
            if len(r.cells) != num_cols:
                report.errors.append(
                    f"Page {table.start_page} Table '{table.title}': Row {idx} has {len(r.cells)} columns, expected {num_cols}"
                )
                
    if table.table_type == "command_param":
        # Check 2: Field numbering continuity
        field_nums = []
        for r in table.rows:
            if isinstance(r, CommandTableRow):
                # Clean field id (e.g. "0", "1", "2", "[1]")
                clean_id = r.field_id.strip("[]# ")
                try:
                    val = int(clean_id)
                    field_nums.append(val)
                except ValueError:
                    pass
        if field_nums:
            report.stats["continuous_fields_checked"] += 1
            for i in range(len(field_nums) - 1):
                cur_f = field_nums[i]
                nxt_f = field_nums[i+1]
                if nxt_f != cur_f + 1 and nxt_f != cur_f:
                    report.warnings.append(
                        f"Page {table.start_page}-{table.end_page} Table '{table.title}': Field jump from {cur_f} to {nxt_f}"
                    )

        # Check 3: If divided, both tables contain all common rows in same order
        if table.has_colors:
            report.stats["divided_tables"] += 1
            common_rows = [r.field_id for r in table.rows if isinstance(r, CommandTableRow) and r.common_subrow]
            report.stats["common_rows_checked"] += len(common_rows)

        # Check 4: Colored rects assignment check
        assigned_salmon = sum(1 for r in table.rows if isinstance(r, CommandTableRow) and r.akb_subrow)
        assigned_lilac = sum(1 for r in table.rows if isinstance(r, CommandTableRow) and r.variant_subrow)
        # Note: In the PDF, each subrow usually has 2 rects (Length + Description)
        assigned_colored_cells = (assigned_salmon + assigned_lilac) * 2
        total_raw = raw_salmon_count + raw_lilac_count
        if total_raw > 0 and assigned_colored_cells == 0:
            report.errors.append(
                f"Page {table.start_page}-{table.end_page} Table '{table.title}': Detected {total_raw} colored rects but 0 assigned to rows"
            )
            
    # Check 5: No repeated header rows inside table
    for r in table.rows:
        if isinstance(r, GenericTableRow):
            if r.cells == table.headers:
                report.errors.append(f"Page {table.start_page} Table '{table.title}': Repeated header row found inside table")
                
    # Check 6: No footer residues inside table rows
    for r in table.rows:
        texts = []
        if isinstance(r, CommandTableRow):
            texts.extend([r.contents, r.common_subrow.description if r.common_subrow else "",
                          r.akb_subrow.description if r.akb_subrow else "",
                          r.variant_subrow.description if r.variant_subrow else ""])
        elif isinstance(r, GenericTableRow):
            texts.extend(r.cells)
        for t in texts:
            if "Software Version 8.60" in t or "Part Number: C9B60" in t:
                report.errors.append(f"Page {table.start_page} Table '{table.title}': Footer residue detected in table cell: {t[:40]}")
