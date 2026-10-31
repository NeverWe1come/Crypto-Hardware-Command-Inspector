"""Multi-page table continuation detection and merging."""
from typing import List
from scripts.atalla_pdf_converter.table_model import ExtractedTable, CommandTableRow

def are_tables_continuing(prev: ExtractedTable, curr: ExtractedTable) -> bool:
    """Check if curr is a continuation of prev according to Section 5.1."""
    if curr.start_page != prev.end_page + 1:
        return False
        
    if prev.table_type != curr.table_type:
        return False
        
    # Same column structure
    if len(prev.headers) != len(curr.headers):
        return False
        
    # Check title continuation
    prev_title_clean = prev.title.replace(" (Continued)", "").strip().lower()
    curr_title_clean = curr.title.replace(" (Continued)", "").strip().lower()
    
    if "(continued)" in curr.title.lower():
        if not curr_title_clean or curr_title_clean in prev_title_clean or prev_title_clean in curr_title_clean:
            return True
            
    if prev_title_clean and curr_title_clean and prev_title_clean == curr_title_clean:
        return True
        
    # If curr has orphan subrows, it definitely belongs to prev
    if curr.orphan_subrows:
        return True
        
    # Check field sequence for command_param tables
    if prev.table_type == "command_param" and prev.rows and curr.rows:
        try:
            prev_id = int(prev.rows[-1].field_id.strip("[]"))
            curr_id = int(curr.rows[0].field_id.strip("[]"))
            if curr_id == prev_id or curr_id == prev_id + 1:
                return True
        except ValueError:
            pass
            
    return False

def merge_tables(tables: List[ExtractedTable]) -> List[ExtractedTable]:
    """Merges consecutive continuing tables into single complete tables."""
    if not tables:
        return []
        
    merged: List[ExtractedTable] = []
    
    for curr in tables:
        if not merged:
            merged.append(curr)
            continue
            
        prev = merged[-1]
        if are_tables_continuing(prev, curr):
            # 1. Attach orphan subrows from curr to prev.rows[-1]
            if curr.orphan_subrows and prev.rows:
                for o in curr.orphan_subrows:
                    if o.method == "variant" and not prev.rows[-1].variant_subrow:
                        prev.rows[-1].variant_subrow = o
                    elif o.method == "akb" and not prev.rows[-1].akb_subrow:
                        prev.rows[-1].akb_subrow = o
            
            # 2. Check if first row of curr is split continuation of last row of prev
            start_idx = 0
            if prev.rows and curr.rows and isinstance(prev.rows[-1], CommandTableRow) and isinstance(curr.rows[0], CommandTableRow):
                if prev.rows[-1].field_id == curr.rows[0].field_id:
                    # Merge field
                    p_row = prev.rows[-1]
                    c_row = curr.rows[0]
                    if c_row.contents and c_row.contents not in p_row.contents:
                        p_row.contents += " " + c_row.contents
                    if c_row.akb_subrow:
                        if not p_row.akb_subrow:
                            p_row.akb_subrow = c_row.akb_subrow
                        else:
                            p_row.akb_subrow.description += " " + c_row.akb_subrow.description
                    if c_row.variant_subrow:
                        if not p_row.variant_subrow:
                            p_row.variant_subrow = c_row.variant_subrow
                        else:
                            p_row.variant_subrow.description += " " + c_row.variant_subrow.description
                    start_idx = 1
                    
            # 3. Append remaining rows
            prev.rows.extend(curr.rows[start_idx:])
            prev.end_page = curr.end_page
            if curr.has_colors:
                prev.has_colors = True
        else:
            merged.append(curr)
            
    return merged
