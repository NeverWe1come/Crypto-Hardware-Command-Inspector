"""Markdown generation for payShield 10K chapters."""
import re
import pymupdf
from typing import List, Dict, Any, Tuple, Optional
from scripts.payshield_pdf_converter.page_elements import PageElements
from scripts.payshield_pdf_converter.table_model import ExtractedTable, CommandTableRow
from scripts.payshield_pdf_converter.table_extractor import TableExtractor
from scripts.payshield_pdf_converter.table_merger import TableMerger
from scripts.payshield_pdf_converter.table_splitter import TableSplitter
from scripts.payshield_pdf_converter.incidencias import IncidentTracker

def clean_non_table_text(text: str) -> str:
    """Cleans and formats non-table paragraphs and lists."""
    if not text:
        return ""
    lines = text.splitlines()
    cleaned = []
    for l in lines:
        s = l.strip()
        if not s:
            continue
        # Format bullet points
        if s.startswith("•") or s.startswith("➢"):
            item_text = s.lstrip("•➢ ").strip()
            cleaned.append(f"- {item_text}")
        elif s.startswith("- "):
            cleaned.append(s)
        else:
            # Checkbox replacements
            s_box = s.replace("\uf0fe", "[x]").replace("\uf0a8", "[ ]")
            cleaned.append(s_box)
    return "\n".join(cleaned)

class MarkdownGenerator:
    """Generates markdown for a range of pages within a chapter."""

    def __init__(self, doc: pymupdf.Document, tracker: IncidentTracker):
        self.doc = doc
        self.tracker = tracker
        self.toc = doc.get_toc()

    def generate_chapter(self, start_page_1: int, end_page_1: int, chapter_title: str = "") -> str:
        """Processes pages start_page_1 to end_page_1 and returns complete markdown."""
        md_parts = []
        active_table: Optional[ExtractedTable] = None
        prev_table_cols: Optional[List[Tuple[float, float]]] = None

        for p_num in range(start_page_1, end_page_1 + 1):
            p_idx = p_num - 1
            pe = PageElements(self.doc, p_idx)
            te = TableExtractor(pe, prev_table_cols=prev_table_cols)

            # Check images or figures
            images = pe.page.get_images()
            if len(images) > 0 and p_num > 1:
                self.tracker.record(
                    p_num, "Figura",
                    f"{len(images)} imágenes detectadas en la página",
                    "Marcador [Figura en página N] insertado"
                )

            # Separate non-table blocks and page tables
            page_tables = list(te.tables)
            table_bboxes = [t.bbox for t in page_tables]

            # Merge tables if applicable
            merged_page_tables: List[ExtractedTable] = []
            for t in page_tables:
                if active_table and TableMerger.should_merge(active_table, t, p_num - 1):
                    TableMerger.merge(active_table, t)
                    self.tracker.record(
                        p_num, "Fusión de Tabla",
                        f"Tabla en página {p_num} fusionada con tabla previa de página {p_num - 1}",
                        "Cabecera repetida descartada, filas concatenadas"
                    )
                else:
                    if active_table:
                        merged_page_tables.append(active_table)
                        active_table = None
                    if t.kind == "command_param":
                        active_table = t
                    else:
                        merged_page_tables.append(t)
                        active_table = None

            # Determine if active_table continues onto the next page
            if active_table:
                has_trailer = any(
                    isinstance(r, CommandTableRow) and "Message Trailer" in r.field
                    for r in active_table.rows
                )
                is_last_page = (p_num == end_page_1)

                continues_to_next = False
                if not has_trailer and not is_last_page:
                    next_pe = PageElements(self.doc, p_idx + 1)
                    next_te = TableExtractor(next_pe, prev_table_cols=active_table.cols)
                    if next_te.tables and TableMerger.should_merge(active_table, next_te.tables[0], p_num):
                        continues_to_next = True

                if not continues_to_next:
                    merged_page_tables.append(active_table)
                    active_table = None
                    prev_table_cols = None
                else:
                    prev_table_cols = active_table.cols
            else:
                prev_table_cols = None

            # Collect non-table blocks for this page
            non_table_blocks = []
            for b in pe.blocks:
                y0, y1 = b[1], b[3]
                # Check if block overlaps any table on this page
                is_in_table = any(
                    (tb[1] - 4.0 <= y0 <= tb[3] + 4.0 or tb[1] - 4.0 <= y1 <= tb[3] + 4.0)
                    for tb in table_bboxes
                )
                if not is_in_table:
                    non_table_blocks.append(b)

            # Render non-table content and tables in vertical order
            rendered_items = []
            for b in non_table_blocks:
                rendered_items.append((b[1], self._format_block(b, p_num)))

            for t in merged_page_tables:
                t_md = TableSplitter.split_to_markdown(t)
                rendered_items.append((t.bbox[1], t_md))

            # Sort by vertical position y
            rendered_items.sort(key=lambda item: item[0])

            page_md = "\n\n".join(txt for y, txt in rendered_items if txt.strip())
            if page_md.strip():
                md_parts.append(page_md)

        # Flush any remaining active table
        if active_table:
            t_md = TableSplitter.split_to_markdown(active_table)
            md_parts.append(t_md)

        return "\n\n".join(md_parts) + "\n"

    def _format_block(self, block: Tuple[float, float, float, float, str, int, int], page_num: int) -> str:
        """Formats a non-table block into heading, bullet list, or paragraph."""
        text = block[4].strip()
        if not text:
            return ""

        # Match with TOC headings
        for level, toc_title, toc_p in self.toc:
            if toc_p == page_num and (toc_title == text or text.startswith(toc_title)):
                hashes = "#" * level
                return f"{hashes} {text}"

        # Check font characteristics using dict spans
        spans = []
        try:
            page = self.doc[page_num - 1]
            b_dict = page.get_text("dict", clip=pymupdf.Rect(block[0], block[1], block[2], block[3]))
            for b in b_dict.get("blocks", []):
                for l in b.get("lines", []):
                    for s in l.get("spans", []):
                        spans.append(s)
        except Exception:
            pass

        if spans:
            max_size = max(s["size"] for s in spans)
            first_font = spans[0]["font"]
            is_bold = "Bold" in first_font

            if max_size >= 24.0 and is_bold:
                return f"# {text}"
            if max_size >= 16.0 and is_bold:
                return f"## {text}"
            if max_size >= 13.0 and is_bold:
                # Command title
                return f"### {text}"

        # Standard paragraph or list
        return clean_non_table_text(text)
