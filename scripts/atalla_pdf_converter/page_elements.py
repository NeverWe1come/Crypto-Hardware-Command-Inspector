"""Page elements extraction and filtering."""
import pymupdf
from typing import List, Dict, Any, Tuple, Optional
from scripts.atalla_pdf_converter.colors import (
    classify_color, SALMON_RGB, LILAC_RGB, GRAY_HEADER_RGB
)

class PageElements:
    def __init__(self, doc: pymupdf.Document, page_num_0: int):
        self.doc = doc
        self.page_num_0 = page_num_0
        self.page_num_1 = page_num_0 + 1
        self.page = doc[page_num_0]
        self.rect = self.page.rect # (0, 0, 612, 792)
        
        # Content bounds: ignore header (y < 65) and footer (y > 745)
        self.content_top = 65.0
        self.content_bottom = 745.0
        
        self.drawings = self.page.get_drawings()
        self._classify_drawings()
        self._extract_text()

    def _classify_drawings(self):
        self.salmon_rects: List[pymupdf.Rect] = []
        self.lilac_rects: List[pymupdf.Rect] = []
        self.gray_header_rects: List[pymupdf.Rect] = []
        self.h_lines: List[Tuple[float, float, float]] = [] # (y, x0, x1)
        self.v_lines: List[Tuple[float, float, float]] = [] # (x, y0, y1)
        
        for d in self.drawings:
            rect = d.get("rect")
            fill = d.get("fill")
            color = d.get("color")
            
            if not rect or rect.y0 < self.content_top or rect.y1 > self.content_bottom:
                continue
            
            c_type = classify_color(fill)
            
            # Table cells have width > 35 (ignore small swatches width < 35 in legends)
            if c_type == 'salmon' and rect.width > 35:
                self.salmon_rects.append(rect)
            elif c_type == 'lilac' and rect.width > 35:
                self.lilac_rects.append(rect)
            elif c_type == 'gray_header':
                # Check if it is a callout box (NOTE:, CAUTION:, etc. or single full-width box)
                txt = self.get_text_in_rect(rect)
                is_callout = any(txt.startswith(prefix) for prefix in ["NOTE:", "CAUTION:", "IMPORTANT:", "TIP:"])
                if not is_callout:
                    self.gray_header_rects.append(rect)
            
            # Check lines (black strokes or thin filled rects)
            is_black = (fill and all(c < 0.1 for c in fill)) or (color and all(c < 0.1 for c in color))
            if is_black:
                if rect.height <= 2.0 and rect.width > 10.0:
                    y = (rect.y0 + rect.y1) / 2.0
                    self.h_lines.append((y, rect.x0, rect.x1))
                elif rect.width <= 2.0 and rect.height > 10.0:
                    x = (rect.x0 + rect.x1) / 2.0
                    self.v_lines.append((x, rect.y0, rect.y1))

    def _extract_text(self):
        raw_blocks = self.page.get_text("blocks")
        self.blocks = []
        for b in raw_blocks:
            # b: (x0, y0, x1, y1, text, block_no, block_type)
            if b[3] <= self.content_top or b[1] >= self.content_bottom:
                continue
            self.blocks.append(b)
        
        self.blocks.sort(key=lambda b: (b[1], b[0]))

    def get_text_in_rect(self, rect: pymupdf.Rect) -> str:
        """Extract clean text clipped to rect."""
        return self.page.get_text("text", clip=rect).strip()
