"""Full Markdown generation for pages and chapters."""
import pymupdf
import re
from typing import List, Dict, Any, Tuple, Optional
from scripts.atalla_pdf_converter.page_elements import PageElements
from scripts.atalla_pdf_converter.table_extractor import TableExtractor
from scripts.atalla_pdf_converter.table_merger import merge_tables
from scripts.atalla_pdf_converter.table_splitter import split_table_to_markdown
from scripts.atalla_pdf_converter.table_model import ExtractedTable, CommandTableRow
from scripts.atalla_pdf_converter.incidencias import IssueTracker
from scripts.atalla_pdf_converter.validator import ValidationReport, validate_table

class MarkdownGenerator:
    def __init__(self, doc: pymupdf.Document, tracker: IssueTracker, report: ValidationReport):
        self.doc = doc
        self.tracker = tracker
        self.report = report

    def process_range(self, start_page_1: int, end_page_1: int) -> str:
        """
        Converts pages from start_page_1 to end_page_1 (inclusive, 1-based) to markdown.
        """
        pages_elements = []
        raw_tables = []
        consumed_blocks_by_page: Dict[int, List[Any]] = {}
        
        for pno_1 in range(start_page_1, end_page_1 + 1):
            pno_0 = pno_1 - 1
            pe = PageElements(self.doc, pno_0)
            pages_elements.append(pe)
            extractor = TableExtractor(pe)
            raw_tables.extend(extractor.tables)
            consumed_blocks_by_page[pno_1] = extractor.consumed_blocks
            
        merged_tables = merge_tables(raw_tables)
        
        for t in merged_tables:
            if t.end_page > t.start_page:
                self.tracker.log_issue(
                    page=t.start_page,
                    issue_type="multipage_table_merged",
                    decision=f"Fusionada tabla '{t.title}' desde pág. {t.start_page} hasta pág. {t.end_page} sin cortes de página.",
                    details=f"Total filas: {len(t.rows)}, tipo: {t.table_type}"
                )
                
            if t.table_type == "command_param" and t.has_colors:
                akb_count = sum(1 for r in t.rows if isinstance(r, CommandTableRow) and r.akb_subrow)
                var_count = sum(1 for r in t.rows if isinstance(r, CommandTableRow) and r.variant_subrow)
                if akb_count > 0 and var_count == 0:
                    self.tracker.log_issue(
                        page=t.start_page,
                        issue_type="single_color_table_akb",
                        decision="Tabla contiene solo color salmón (AKB). Se generaron ambas tablas (AKB y Variant), conteniendo Variant solo filas comunes.",
                        details=f"Tabla: '{t.title}', pág: {t.start_page}-{t.end_page}"
                    )
                elif var_count > 0 and akb_count == 0:
                    self.tracker.log_issue(
                        page=t.start_page,
                        issue_type="single_color_table_variant",
                        decision="Tabla contiene solo color lila (Variant). Se generaron ambas tablas (AKB y Variant), conteniendo AKB solo filas comunes.",
                        details=f"Tabla: '{t.title}', pág: {t.start_page}-{t.end_page}"
                    )
                            
            validate_table(t, self.report, 2 if t.has_colors else 0, 2 if t.has_colors else 0)

        doc_parts = []
        
        tables_by_start: Dict[int, List[ExtractedTable]] = {}
        for t in merged_tables:
            tables_by_start.setdefault(t.start_page, []).append(t)
            
        continuing_tables_by_page: Dict[int, List[ExtractedTable]] = {}
        for t in merged_tables:
            for p in range(t.start_page + 1, t.end_page + 1):
                continuing_tables_by_page.setdefault(p, []).append(t)
                
        for pe in pages_elements:
            pno_1 = pe.page_num_1
            page_content = self._render_page(
                pe,
                tables_by_start.get(pno_1, []),
                continuing_tables_by_page.get(pno_1, []),
                consumed_blocks_by_page.get(pno_1, [])
            )
            if page_content.strip():
                doc_parts.append(page_content.strip())
                
        return "\n\n".join(doc_parts) + "\n"

    def _render_page(self, pe: PageElements, starting_tables: List[ExtractedTable],
                     continuing_tables: List[ExtractedTable], consumed_blocks: List[Any]) -> str:
        items: List[Tuple[float, str, Any]] = []
        table_skip_boxes = []
        
        for t in starting_tables:
            table_md = split_table_to_markdown(t)
            items.append((t.bbox[1], "table", table_md))
            table_skip_boxes.append((t.bbox[1] - 5, t.bbox[3] + 5))
            
        for t in continuing_tables:
            table_skip_boxes.append((pe.content_top, pe.content_bottom))

        for b in pe.blocks:
            b_top = b[1]
            b_bot = b[3]
            txt = b[4].strip()
            if not txt:
                continue
                
            inside_table = any(box_top <= b_top and b_bot <= box_bot for box_top, box_bot in table_skip_boxes)
            if inside_table:
                continue
                
            # If consumed as table title, skip
            if any(b == cb for cb in consumed_blocks):
                continue
                
            # Check legend
            if "Colors specific to key management method" in txt:
                if pe.page_num_1 == 34:
                    clean_legend = (
                        "Colors specific to key management method:\n\n"
                        "- **Sin color:** información que aplica a AKB y Variant.\n"
                        "- **Salmón (AKB):** información específica de AKB.\n"
                        "- **Lila (Variant):** información específica de Variant."
                    )
                    items.append((b_top, "text", clean_legend))
                continue
                
            if "(Continued)" in txt:
                continue
                
            # On page 34, rewrite color bullets if present
            if pe.page_num_1 == 34 and "" in txt:
                txt = txt.replace(" No color is information that applies to both the AKB and Variant.",
                                  "- **Sin color:** información que aplica a AKB y Variant.")
                txt = txt.replace(" color is information specific to the AKB.",
                                  "- **Salmón (AKB):** información específica de AKB.")
                txt = txt.replace(" color is information specific to the Variant.",
                                  "- **Lila (Variant):** información específica de Variant.")
                
            formatted = self._format_block(b, pe, txt)
            if formatted:
                items.append((b_top, "text", formatted))
                
        items.sort(key=lambda x: x[0])
        rendered = [content for pos, itype, content in items]
        return "\n\n".join(rendered)

    def _format_block(self, b: Tuple[float, float, float, float, str, int, int], pe: PageElements, txt: str) -> str:
        if not txt:
            return ""
            
        if (txt.startswith("<") and ">" in txt) or (txt.startswith("[<") and ">" in txt):
            return f"```\n{txt}\n```"
            
        if txt.startswith("NOTE:") or txt.startswith("CAUTION:") or txt.startswith("IMPORTANT:") or txt.startswith("TIP:"):
            return f"> {txt.replace(chr(10), ' ')}"

        font_info = self._get_block_font_info(b, pe)
        max_size = font_info.get("max_size", 10.0)
        is_bold = font_info.get("is_bold", False)
        
        lines = [l.strip() for l in txt.split("\n") if l.strip()]
        is_short = len(lines) <= 2 and len(txt) < 120
        
        if is_short:
            if max_size >= 24.0:
                return f"# {txt}"
            elif max_size >= 18.0:
                return f"## {txt}"
            elif max_size >= 13.0 and is_bold:
                return f"### {txt}"
            elif max_size >= 11.5 and is_bold:
                return f"#### {txt}"
                
        if txt.startswith("") or txt.startswith("•") or txt.startswith("–") or txt.startswith("\uf0a2") or txt.startswith("\uf06e"):
            clean_list = re.sub(r'^[•–\uf0a2\uf06e][\uf020\s]*', '- ', txt)
            return clean_list
            
        joined = " ".join(lines)
        return joined

    def _get_block_font_info(self, b: Tuple[float, float, float, float, str, int, int], pe: PageElements) -> Dict[str, Any]:
        rect = pymupdf.Rect(b[0], b[1], b[2], b[3])
        page_dict = pe.page.get_text("dict", clip=rect)
        max_size = 10.0
        is_bold = False
        for blk in page_dict.get("blocks", []):
            for line in blk.get("lines", []):
                for span in line.get("spans", []):
                    sz = span.get("size", 10.0)
                    if sz > max_size:
                        max_size = sz
                    font_name = span.get("font", "").lower()
                    if "bold" in font_name or "medium" in font_name:
                        is_bold = True
        return {"max_size": max_size, "is_bold": is_bold}
