"""Table extraction from a single page."""
import pymupdf
from typing import List, Tuple, Optional, Dict, Any
from scripts.atalla_pdf_converter.page_elements import PageElements
from scripts.atalla_pdf_converter.table_model import (
    ExtractedTable, CommandTableRow, GenericTableRow, SubRow
)

def clean_cell_text(text: str) -> str:
    """Escape pipes and format internal linebreaks."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    cleaned = " ".join(lines)
    return cleaned.replace("|", "\\|")

def find_table_title(pe: PageElements, y_top: float) -> Tuple[str, Optional[Tuple[float, float, float, float, str, int, int]]]:
    """
    Find the title of the table immediately preceding y_top.
    Returns (title_string, title_block_to_consume).
    """
    for b in reversed(pe.blocks):
        if b[3] <= y_top and b[3] >= y_top - 90:
            txt = b[4].strip()
            lines = [l.strip() for l in txt.split("\n") if l.strip()]
            non_legend = [l for l in lines if not l.startswith("Colors specific") and not l.startswith("= AKB") and not l.startswith("= Variant")]
            if non_legend:
                candidate = non_legend[-1]
                cand_lower = candidate.lower()
                if "command description" in cand_lower or "response description" in cand_lower or candidate.startswith("Table "):
                    return candidate, b
                if len(candidate) <= 45 and not candidate.endswith(".") and not candidate.endswith(":") and not candidate.startswith("<"):
                    return candidate, b
    return "", None

class TableExtractor:
    def __init__(self, pe: PageElements):
        self.pe = pe
        self.tables: List[ExtractedTable] = []
        self.consumed_blocks: List[Any] = []
        self._extract_tables()

    def _extract_tables(self):
        gray_rects = sorted(self.pe.gray_header_rects, key=lambda r: (r.y0, r.x0))
        groups: List[List[pymupdf.Rect]] = []
        for r in gray_rects:
            if not groups or abs(r.y0 - groups[-1][0].y0) > 3.0:
                groups.append([r])
            else:
                groups[-1].append(r)
                
        for idx, g in enumerate(groups):
            g.sort(key=lambda r: r.x0)
            h_names = [self.pe.get_text_in_rect(r).replace("\n", " ").strip() for r in g]
            y_top = min(r.y0 for r in g)
            y_h_bot = max(r.y1 for r in g)
            x_min = g[0].x0
            x_max = g[-1].x1
            
            table_v_lines = [v for v in self.pe.v_lines if x_min - 3 <= v[0] <= x_max + 3 and abs(v[1] - y_top) <= 5.0]
            if table_v_lines:
                y_bottom = max(v[2] for v in table_v_lines)
            else:
                table_h_lines = [y for y, x0, x1 in self.pe.h_lines if y > y_h_bot and x0 <= x_min + 5 and x1 >= x_max - 5]
                y_bottom = min(table_h_lines, default=self.pe.content_bottom)
                
            title, title_block = find_table_title(self.pe, y_top)
            
            # Key Type tables never have an explicit title
            if any("Key Type" in name for name in h_names):
                title = ""
                title_block = None
            elif title_block:
                self.consumed_blocks.append(title_block)
                
            cols = [(r.x0, r.x1) for r in g]
            
            if h_names == ["Field", "Contents", "Length", "Description"]:
                table = self._extract_command_table(cols, y_top, y_h_bot, y_bottom, title)
            else:
                table = self._extract_generic_table(h_names, cols, y_top, y_h_bot, y_bottom, title)
                
            self.tables.append(table)

    def _extract_command_table(self, cols: List[Tuple[float, float]],
                               y_top: float, y_h_bot: float, y_bottom: float, title: str) -> ExtractedTable:
        table = ExtractedTable("command_param", ["Field", "Contents", "Length", "Description"], cols, self.pe.page_num_1)
        table.title = title
        table.bbox = (cols[0][0], y_top, cols[-1][1], y_bottom)
        table.orphan_subrows = []
        
        words = self.pe.page.get_text("words")
        col0_words = [w for w in words if cols[0][0] - 2 <= w[0] < cols[0][1] - 2 and y_h_bot <= w[1] <= y_bottom]
        col0_words.sort(key=lambda w: w[1])
        
        fields = []
        for w in col0_words:
            if not fields or abs(w[1] - fields[-1]["y0"]) > 8.0:
                fields.append({"text": w[4], "y0": w[1], "y1": w[3]})
            else:
                fields[-1]["text"] += " " + w[4]
                fields[-1]["y1"] = max(fields[-1]["y1"], w[3])
                
        salmons = [r for r in self.pe.salmon_rects if y_h_bot - 2 <= r.y0 < y_bottom and r.x0 >= cols[1][1] - 5]
        lilacs = [r for r in self.pe.lilac_rects if y_h_bot - 2 <= r.y0 < y_bottom and r.x0 >= cols[1][1] - 5]
        
        def group_subrows(rects):
            res = []
            for r in rects:
                m = next((item for item in res if abs(item["y0"] - r.y0) < 4.0), None)
                if not m:
                    res.append({"y0": r.y0, "y1": r.y1, "rects": [r]})
                else:
                    m["rects"].append(r)
                    m["y0"] = min(m["y0"], r.y0)
                    m["y1"] = max(m["y1"], r.y1)
            res.sort(key=lambda item: item["y0"])
            return res

        s_subrows = group_subrows(salmons)
        l_subrows = group_subrows(lilacs)
        
        first_f_y = fields[0]["y0"] if fields else y_bottom
        for sr in s_subrows:
            if sr["y1"] <= first_f_y:
                l_rect = pymupdf.Rect(cols[2][0] - 2, sr["y0"], cols[2][1] + 2, sr["y1"])
                d_rect = pymupdf.Rect(cols[3][0] - 2, sr["y0"], cols[3][1] + 2, sr["y1"])
                table.orphan_subrows.append(SubRow("akb", clean_cell_text(self.pe.get_text_in_rect(l_rect)),
                                                   clean_cell_text(self.pe.get_text_in_rect(d_rect)), (sr["y0"], sr["y1"])))
                table.has_colors = True
        for lr in l_subrows:
            if lr["y1"] <= first_f_y:
                l_rect = pymupdf.Rect(cols[2][0] - 2, lr["y0"], cols[2][1] + 2, lr["y1"])
                d_rect = pymupdf.Rect(cols[3][0] - 2, lr["y0"], cols[3][1] + 2, lr["y1"])
                table.orphan_subrows.append(SubRow("variant", clean_cell_text(self.pe.get_text_in_rect(l_rect)),
                                                   clean_cell_text(self.pe.get_text_in_rect(d_rect)), (lr["y0"], lr["y1"])))
                table.has_colors = True

        for i, f in enumerate(fields):
            y_start = y_h_bot if i == 0 and not table.orphan_subrows else f["y0"] - 2.0
            y_end = fields[i+1]["y0"] - 2.0 if i+1 < len(fields) else y_bottom
            
            c1_rect = pymupdf.Rect(cols[1][0] - 2, y_start, cols[1][1] + 2, y_end)
            contents = clean_cell_text(self.pe.get_text_in_rect(c1_rect))
            row = CommandTableRow(f["text"], contents, (y_start, y_end))
            
            f_salmons = [sr for sr in s_subrows if sr["y1"] > y_start + 4.0 and sr["y0"] < y_end - 4.0]
            f_lilacs = [lr for lr in l_subrows if lr["y1"] > y_start + 4.0 and lr["y0"] < y_end - 4.0]
            
            if f_salmons:
                sr = f_salmons[0]
                l_rect = pymupdf.Rect(cols[2][0] - 2, sr["y0"], cols[2][1] + 2, sr["y1"])
                d_rect = pymupdf.Rect(cols[3][0] - 2, sr["y0"], cols[3][1] + 2, sr["y1"])
                row.akb_subrow = SubRow("akb", clean_cell_text(self.pe.get_text_in_rect(l_rect)),
                                        clean_cell_text(self.pe.get_text_in_rect(d_rect)), (sr["y0"], sr["y1"]))
                table.has_colors = True
                
            if f_lilacs:
                lr = f_lilacs[0]
                l_rect = pymupdf.Rect(cols[2][0] - 2, lr["y0"], cols[2][1] + 2, lr["y1"])
                d_rect = pymupdf.Rect(cols[3][0] - 2, lr["y0"], cols[3][1] + 2, lr["y1"])
                row.variant_subrow = SubRow("variant", clean_cell_text(self.pe.get_text_in_rect(l_rect)),
                                            clean_cell_text(self.pe.get_text_in_rect(d_rect)), (lr["y0"], lr["y1"]))
                table.has_colors = True
                
            if not f_salmons and not f_lilacs:
                l_rect = pymupdf.Rect(cols[2][0] - 2, y_start, cols[2][1] + 2, y_end)
                d_rect = pymupdf.Rect(cols[3][0] - 2, y_start, cols[3][1] + 2, y_end)
                row.common_subrow = SubRow("common", clean_cell_text(self.pe.get_text_in_rect(l_rect)),
                                           clean_cell_text(self.pe.get_text_in_rect(d_rect)), (y_start, y_end))
            table.rows.append(row)
            
        return table

    def _extract_generic_table(self, headers: List[str], cols: List[Tuple[float, float]],
                              y_top: float, y_h_bot: float, y_bottom: float, title: str) -> ExtractedTable:
        ttype = "generic"
        if any("Key Type" in h for h in headers):
            ttype = "key_type"
            title = ""
        elif any("usage notes" in h.lower() for h in headers):
            ttype = "usage_notes"
            
        table = ExtractedTable(ttype, headers, cols, self.pe.page_num_1)
        table.title = title
        table.bbox = (cols[0][0], y_top, cols[-1][1], y_bottom)
        table.orphan_subrows = []
        
        h_lines = [y for y, x0, x1 in self.pe.h_lines if y_h_bot - 2 <= y <= y_bottom + 2]
        c_lines = []
        for r in self.pe.salmon_rects + self.pe.lilac_rects:
            if y_h_bot - 2 <= r.y0 < y_bottom:
                c_lines.extend([r.y0, r.y1])
        boundaries = sorted(set([y_h_bot] + h_lines + c_lines + [y_bottom]))
        
        merged_b = []
        for b in boundaries:
            if not merged_b or b - merged_b[-1] >= 4.0:
                merged_b.append(b)
            else:
                merged_b[-1] = max(merged_b[-1], b)
                
        for i in range(len(merged_b) - 1):
            r_y0 = merged_b[i]
            r_y1 = merged_b[i+1]
            if r_y1 - r_y0 < 5.0:
                continue
            cells = []
            for c_x0, c_x1 in cols:
                c_rect = pymupdf.Rect(c_x0 - 2, r_y0, c_x1 + 2, r_y1)
                cells.append(clean_cell_text(self.pe.get_text_in_rect(c_rect)))
            if any(cells):
                table.rows.append(GenericTableRow(cells, (r_y0, r_y1)))
                
        return table
