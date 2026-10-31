"""Table extraction for payShield 10K PDF."""
import re
import pymupdf
from typing import List, Tuple, Optional, Dict, Any
from scripts.payshield_pdf_converter.page_elements import PageElements
from scripts.payshield_pdf_converter.table_model import (
    ExtractedTable, CommandTableRow, GenericTableRow, SubRow
)
from scripts.payshield_pdf_converter.colors import (
    classify_color, is_nested_table_header
)

def clean_cell_text(text: str) -> str:
    """Escape markdown pipes and format linebreaks cleanly."""
    if not text:
        return ""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return ""
    joined = " ".join(lines)
    return joined.replace("|", "\\|")

def extract_cell_with_nested_tables(page: pymupdf.Page, cell_rect: pymupdf.Rect, pe: PageElements) -> str:
    """
    Extracts text from a Details cell, detecting and flattening any nested tables
    into Markdown format: **Col1 | Col2**<br>val1 | val2.
    """
    dark_headers = []
    for rect, rgb, cat in pe.fill_rects:
        if cell_rect.x0 - 2 <= rect.x0 and rect.x1 <= cell_rect.x1 + 2:
            if cell_rect.y0 - 2 <= rect.y0 and rect.y1 <= cell_rect.y1 + 2:
                dark_type = is_nested_table_header(rgb)
                if dark_type and rect.width > 15 and rect.height >= 8:
                    dark_headers.append((rect, rgb, dark_type))

    if not dark_headers:
        txt = page.get_text("text", clip=cell_rect).strip()
        lines = [l.strip() for l in txt.splitlines() if l.strip()]
        return "<br>".join(lines).replace("|", "\\|")

    dark_headers.sort(key=lambda x: (x[0].y0, x[0].x0))
    y_h_top = dark_headers[0][0].y0
    y_h_bot = max(r.y1 for r, _, _ in dark_headers if abs(r.y0 - y_h_top) < 4.0)
    h_rects = [r for r, _, _ in dark_headers if abs(r.y0 - y_h_top) < 4.0]

    cols: List[pymupdf.Rect] = []
    for r in sorted(h_rects, key=lambda r: r.x0):
        if not cols or r.x0 > cols[-1].x1 - 5:
            cols.append(r)

    header_cols = [(r.x0, r.x1) for r in cols]
    header_texts = [page.get_text("text", clip=r).strip().replace("\n", " ") for r in cols]

    pre_rect = pymupdf.Rect(cell_rect.x0, cell_rect.y0, cell_rect.x1, y_h_top)
    pre_txt = page.get_text("text", clip=pre_rect).strip()
    pre_lines = [l.strip() for l in pre_txt.splitlines() if l.strip()]

    nested_h_lines = [
        y for y, x0, x1 in pe.h_lines
        if y_h_bot - 2 < y <= cell_rect.y1 + 2 and x0 >= cell_rect.x0 - 5 and x1 <= cell_rect.x1 + 5
    ]
    nested_h_lines = sorted(set(nested_h_lines))
    if not nested_h_lines:
        nested_h_lines = [cell_rect.y1]
    y_nested_bottom = max(nested_h_lines)

    row_y_ranges = []
    curr_y = y_h_bot
    for yh in nested_h_lines:
        if yh > curr_y + 3:
            row_y_ranges.append((curr_y, yh))
            curr_y = yh

    nested_rows = []
    nested_rows.append("**" + " \\| ".join(header_texts) + "**")
    for ry0, ry1 in row_y_ranges:
        row_vals = []
        for cx0, cx1 in header_cols:
            r = pymupdf.Rect(cx0, ry0, cx1, ry1)
            val = page.get_text("text", clip=r).strip().replace("\n", " ")
            row_vals.append(val.replace("|", "\\|"))
        nested_rows.append(" \\| ".join(row_vals))

    post_rect = pymupdf.Rect(cell_rect.x0, y_nested_bottom, cell_rect.x1, cell_rect.y1)
    post_txt = page.get_text("text", clip=post_rect).strip()
    post_lines = [l.strip() for l in post_txt.splitlines() if l.strip()]

    parts = []
    if pre_lines:
        parts.extend(pre_lines)
    parts.extend(nested_rows)
    if post_lines:
        parts.extend(post_lines)

    return "<br>".join(parts)

class TableExtractor:
    """Extracts tables from a PageElements instance."""

    def __init__(self, pe: PageElements, prev_table_cols: Optional[List[Tuple[float, float]]] = None):
        self.pe = pe
        self.prev_table_cols = prev_table_cols
        self.tables: List[ExtractedTable] = []
        self._extract_tables()

    def _extract_tables(self):
        hdr_candidates = self._find_command_headers()
        
        if not hdr_candidates:
            if self.prev_table_cols and self._is_headerless_continuation(self.prev_table_cols):
                table = self._extract_command_table(
                    y_h_top=self.pe.content_top,
                    y_h_bot=self.pe.content_top + 2.0,
                    y_max=self.pe.content_bottom,
                    cols=self.prev_table_cols,
                    is_top=True
                )
                if table and len(table.rows) > 0:
                    table.continued_from_prev = True
                    self.tables.append(table)
                    return

            self._extract_generic_tables()
            return

        for idx, (h_y_top, h_y_bot, cols, is_top) in enumerate(hdr_candidates):
            next_y_top = hdr_candidates[idx + 1][0] if idx + 1 < len(hdr_candidates) else self.pe.content_bottom
            table = self._extract_command_table(h_y_top, h_y_bot, next_y_top, cols, is_top)
            if table and len(table.rows) > 0:
                self.tables.append(table)

    def _is_headerless_continuation(self, cols: List[Tuple[float, float]]) -> bool:
        """Checks if page top contains words aligned to cols without a header or title."""
        if len(cols) < 3:
            return False

        # If page top has non-table blocks like headings or function descriptions
        for b in self.pe.blocks:
            if b[1] < 120.0:
                txt = b[4].strip()
                if txt.startswith("Function:") or txt.startswith("Notes:") or "Available in package" in txt:
                    return False
                if len(txt) > 0:
                    try:
                        b_dict = self.pe.page.get_text("dict", clip=pymupdf.Rect(b[0], b[1], b[2], b[3]))
                        for bb in b_dict.get("blocks", []):
                            for l in bb.get("lines", []):
                                for s in l.get("spans", []):
                                    if s.get("size", 0) >= 13.0 or ("Bold" in s.get("font", "") and s.get("size", 0) >= 11.0):
                                        return False
                    except Exception:
                        pass

        top_words = [w for w in self.pe.words if self.pe.content_top <= w[1] <= 110.0]
        if not top_words:
            return False
        col0_w = [w for w in top_words if cols[0][0] - 2 <= w[0] < cols[0][1] - 2]
        col1_w = [w for w in top_words if cols[1][0] - 2 <= w[0] < cols[1][1] - 2]
        col2_w = [w for w in top_words if cols[2][0] - 2 <= w[0] < cols[2][1] - 2]
        return len(col0_w) > 0 and len(col1_w) > 0 and len(col2_w) > 0

    def _find_command_headers(self) -> List[Tuple[float, float, List[Tuple[float, float]], bool]]:
        """Finds all occurrences of Field | Length & Type | Details header rows on the page."""
        results = []
        words = self.pe.words

        f_words = [w for w in words if w[4] == "Field" and 50 <= w[0] <= 85]
        for fw in sorted(f_words, key=lambda w: w[1]):
            y = fw[1]
            row_words = [w for w in words if abs(w[1] - y) < 6.0 and w[4] in ["Length", "&", "Type", "Details"]]
            word_texts = [w[4] for w in row_words]
            if "Details" in word_texts and ("Length" in word_texts or "Type" in word_texts):
                y_h_top = y - 6.0
                y_h_bot = y + 14.0

                v_lines = [
                    v[0] for v in self.pe.v_lines
                    if abs(v[1] - y_h_top) < 14.0 or (v[1] <= y_h_top and v[2] >= y_h_bot)
                ]
                v_lines = sorted(set(v_lines))

                x0 = min([v for v in v_lines if abs(v - 54.0) < 6.0], default=53.78)
                x1 = min([v for v in v_lines if 150.0 <= v <= 180.0], default=165.0)
                x2 = min([v for v in v_lines if 230.0 <= v <= 250.0], default=244.0)
                x3 = max([v for v in v_lines if 540.0 <= v <= 555.0], default=547.9)

                cols = [(x0, x1), (x1, x2), (x2, x3)]
                is_top = (y <= 75.0)
                results.append((y_h_top, y_h_bot, cols, is_top))

        return results

    def _extract_command_table(
        self, y_h_top: float, y_h_bot: float, y_max: float,
        cols: List[Tuple[float, float]], is_top: bool
    ) -> ExtractedTable:
        """Extracts a Command / Response table starting at y_h_top."""
        table = ExtractedTable(
            kind="command_param",
            headers=["Field", "Length & Type", "Details"],
            cols=cols,
            page_num=self.pe.page_num_1
        )
        table.bbox = (cols[0][0], y_h_top, cols[-1][1], y_max)

        table_v_lines = [v for v in self.pe.v_lines if cols[0][0] - 5 <= v[0] <= cols[-1][1] + 5 and v[2] > y_h_bot]
        if table_v_lines:
            y_table_bot = min(max(v[2] for v in table_v_lines), y_max)
        else:
            y_table_bot = y_max

        if not is_top:
            table.title = self._find_title_above(y_h_top)

        t_words = [w for w in self.pe.words if y_h_bot - 2 <= w[1] <= y_table_bot]

        col0_words = [w for w in t_words if cols[0][0] - 2 <= w[0] < cols[0][1] - 2]
        col0_words.sort(key=lambda w: (w[1], w[0]))

        field_items: List[Dict[str, Any]] = []
        for w in col0_words:
            if not field_items or abs(w[1] - field_items[-1]["y0"]) > 5.0:
                field_items.append({"text": w[4], "y0": w[1], "y1": w[3]})
            else:
                field_items[-1]["text"] += " " + w[4]
                field_items[-1]["y1"] = max(field_items[-1]["y1"], w[3])

        if not field_items:
            full_rect = pymupdf.Rect(cols[0][0], y_h_bot, cols[-1][1], y_table_bot)
            txt = self.pe.get_text_in_rect(full_rect)
            if txt:
                table.rows.append(CommandTableRow(field=clean_cell_text(txt), is_section=True, y_span=(y_h_bot, y_table_bot)))
            return table

        # Check for COMMAND MESSAGE / RESPONSE MESSAGE banner between y_h_bot and first field
        first_f_y = field_items[0]["y0"]
        if first_f_y > y_h_bot + 6.0:
            top_rect = pymupdf.Rect(cols[0][0] - 2, y_h_bot, cols[-1][1] + 2, first_f_y - 2.0)
            top_txt = self.pe.get_text_in_rect(top_rect).strip()
            top_upper = top_txt.upper()
            if "RESPONSE MESSAGE" in top_upper:
                table.title = "RESPONSE MESSAGE"
            elif "COMMAND MESSAGE" in top_upper:
                table.title = "COMMAND MESSAGE"
            elif is_top:
                orphan_row = self._parse_field_row("", (y_h_bot, first_f_y - 2.0), cols)
                if orphan_row:
                    table.rows.append(orphan_row)
                    if orphan_row.has_subrows:
                        table.has_colors = True

        for i, f in enumerate(field_items):
            y_start = f["y0"] - 2.0 if i > 0 else (first_f_y - 2.0 if table.title in ["COMMAND MESSAGE", "RESPONSE MESSAGE"] else y_h_bot)
            y_end = field_items[i + 1]["y0"] - 2.0 if i + 1 < len(field_items) else y_table_bot

            row_full_words = [w for w in t_words if y_start <= w[1] <= y_end]
            row_full_text = " ".join(w[4] for w in row_full_words).strip()
            row_full_lower = row_full_text.lower()
            f_lower = f["text"].lower()

            is_sec = (
                "applies only when" in row_full_lower or
                "applies when" in row_full_lower or
                "the following section" in row_full_lower or
                "following section apply" in row_full_lower or
                "following section applies" in row_full_lower or
                "the following fields" in row_full_lower or
                "following fields apply" in row_full_lower or
                "these fields are not required" in row_full_lower or
                "if either source pin" in row_full_lower or
                "if the message is sent" in row_full_lower or
                f["text"].strip().startswith("COMMAND MESSAGE") or
                f["text"].strip().startswith("RESPONSE MESSAGE")
            )

            if is_sec:
                full_row_rect = pymupdf.Rect(cols[0][0] - 2, y_start, cols[-1][1] + 2, y_end)
                sec_text = self.pe.get_text_in_rect(full_row_rect).replace("\n", " ").strip()
                sec_color = self.pe.get_color_at_point((cols[0][0] + cols[-1][1]) / 2.0, (y_start + y_end) / 2.0)
                sec_method = sec_color if sec_color in ['variant', 'key_block'] else None
                if not sec_method:
                    st_lower = sec_text.lower()
                    if "variant lmk" in st_lower:
                        sec_method = "variant"
                    elif "key block lmk" in st_lower or "key block format" in st_lower:
                        sec_method = "key_block"
                sec_row = CommandTableRow(
                    field=clean_cell_text(sec_text),
                    is_section=True,
                    section_method=sec_method,
                    y_span=(y_start, y_end)
                )
                if sec_method:
                    table.has_colors = True
                table.rows.append(sec_row)
            else:
                row = self._parse_field_row(f["text"], (y_start, y_end), cols)
                if row:
                    table.rows.append(row)
                    if row.has_subrows:
                        table.has_colors = True

        return table

    def _parse_field_row(self, field_name: str, y_span: Tuple[float, float], cols: List[Tuple[float, float]]) -> Optional[CommandTableRow]:
        """Parses a logical row within [y_span[0], y_span[1]], detecting subrows and nested tables."""
        y_start, y_end = y_span
        if y_end <= y_start + 2.0:
            return None

        details_rects = [
            (r, cat) for r, rgb, cat in self.pe.fill_rects
            if r.x0 >= cols[1][1] - 5 and r.y0 < y_end - 2 and r.y1 > y_start + 2
        ]

        bands = []
        for r, cat in sorted(details_rects, key=lambda x: x[0].y0):
            fam = cat if cat in ['variant', 'key_block'] else 'common'
            if fam == 'common':
                continue
            if not bands or bands[-1]["fam"] != fam or r.y0 > bands[-1]["y1"] + 5.0:
                bands.append({"y0": max(r.y0, y_start), "y1": min(r.y1, y_end), "fam": fam})
            else:
                bands[-1]["y1"] = max(bands[-1]["y1"], min(r.y1, y_end))

        c1_rect = pymupdf.Rect(cols[1][0] - 2, y_start, cols[1][1] + 2, y_end)
        common_len = clean_cell_text(self.pe.get_text_in_rect(c1_rect))

        row = CommandTableRow(field=field_name, y_span=y_span)

        if not bands:
            c2_rect = pymupdf.Rect(cols[2][0] - 2, y_start, cols[2][1] + 2, y_end)
            details_text = extract_cell_with_nested_tables(self.pe.page, c2_rect, self.pe)
            row.length_type = common_len
            row.details = details_text

            # Check if details_text embeds both Variant and Key Block text without background color
            kb_match = re.search(r"(?i)(?:<br>\s*|\n\s*|^)(For a Key Block (?:LMK|format)[\s\S]*)", details_text)
            if kb_match:
                v_part = details_text[:kb_match.start(1)].strip()
                if v_part.endswith("<br>"):
                    v_part = v_part[:-4].strip()
                kb_part = kb_match.group(1).strip()
                if v_part:
                    row.subrows.append(SubRow(
                        method="variant",
                        length_type=common_len,
                        details=v_part,
                        y_span=y_span
                    ))
                    row.subrows.append(SubRow(
                        method="key_block",
                        length_type=common_len,
                        details=kb_part,
                        y_span=y_span
                    ))
                    return row

            return row

        for b in [x for x in bands if x["fam"] == "variant"]:
            sub_rect_c1 = pymupdf.Rect(cols[1][0] - 2, b["y0"], cols[1][1] + 2, b["y1"])
            sub_rect_c2 = pymupdf.Rect(cols[2][0] - 2, b["y0"], cols[2][1] + 2, b["y1"])
            len_txt = clean_cell_text(self.pe.get_text_in_rect(sub_rect_c1))
            if not len_txt:
                len_txt = common_len
            det_txt = extract_cell_with_nested_tables(self.pe.page, sub_rect_c2, self.pe)
            row.subrows.append(SubRow(
                method="variant",
                length_type=len_txt,
                details=det_txt,
                y_span=(b["y0"], b["y1"])
            ))

        for b in [x for x in bands if x["fam"] == "key_block"]:
            sub_rect_c1 = pymupdf.Rect(cols[1][0] - 2, b["y0"], cols[1][1] + 2, b["y1"])
            sub_rect_c2 = pymupdf.Rect(cols[2][0] - 2, b["y0"], cols[2][1] + 2, b["y1"])
            len_txt = clean_cell_text(self.pe.get_text_in_rect(sub_rect_c1))
            if not len_txt:
                len_txt = common_len
            det_txt = extract_cell_with_nested_tables(self.pe.page, sub_rect_c2, self.pe)
            row.subrows.append(SubRow(
                method="key_block",
                length_type=len_txt,
                details=det_txt,
                y_span=(b["y0"], b["y1"])
            ))

        return row

    def _find_title_above(self, y_top: float) -> str:
        """Finds table title immediately preceding y_top."""
        for b in reversed(self.pe.blocks):
            if b[3] <= y_top and b[3] >= y_top - 60:
                txt = b[4].strip()
                if txt.startswith("COMMAND") or txt.startswith("RESPONSE") or "Message" in txt:
                    return txt.replace("\n", " ")
                if len(txt) <= 50 and not txt.endswith("."):
                    return txt.replace("\n", " ")
        return ""

    def _extract_generic_tables(self):
        """Extracts non-command tables (e.g. key usage tables, status tables)."""
        tabs = self.pe.page.find_tables()
        for t in tabs.tables:
            if t.col_count < 2 or t.row_count < 2:
                continue
            data = t.extract()
            if not data or not data[0]:
                continue
            headers = [clean_cell_text(c) if c else "" for c in data[0]]
            cols = []
            for col_idx in range(t.col_count):
                if col_idx < len(t.cells) and t.cells[col_idx]:
                    cell_bbox = t.cells[col_idx]
                    cols.append((cell_bbox[0], cell_bbox[2]))
                else:
                    cols.append((0.0, 0.0))

            g_table = ExtractedTable(
                kind="generic",
                headers=headers,
                cols=cols,
                page_num=self.pe.page_num_1,
                bbox=t.bbox
            )
            for row in data[1:]:
                cleaned_row = [clean_cell_text(c) if c else "" for c in row]
                g_table.rows.append(GenericTableRow(cells=cleaned_row))
            self.tables.append(g_table)
