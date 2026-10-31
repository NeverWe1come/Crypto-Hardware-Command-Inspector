"""Page elements extraction and filtering for payShield 10K PDF."""
import pymupdf
from typing import List, Dict, Any, Tuple, Optional
from scripts.payshield_pdf_converter.colors import (
    classify_color, is_nested_table_header
)

class PageElements:
    """Extracts and filters layout elements, drawings, and text from a single PDF page."""

    def __init__(self, doc: pymupdf.Document, page_num_0: int):
        self.doc = doc
        self.page_num_0 = page_num_0
        self.page_num_1 = page_num_0 + 1
        self.page = doc[page_num_0]
        self.rect = self.page.rect  # (0, 0, 595.44, 841.92)

        # Content bounds: strictly ignore running header (y <= 51.5) and footer (y >= 786.5)
        self.content_top = 52.0
        self.content_bottom = 786.0

        self.drawings = self.page.get_drawings()
        self._classify_drawings()
        self._extract_text()

    def _classify_drawings(self):
        self.fill_rects: List[Tuple[pymupdf.Rect, Tuple[float, float, float], Optional[str]]] = []
        self.h_lines: List[Tuple[float, float, float]] = []  # (y, x0, x1)
        self.v_lines: List[Tuple[float, float, float]] = []  # (x, y0, y1)

        for d in self.drawings:
            rect = d.get("rect")
            fill = d.get("fill")
            color = d.get("color")

            if not rect:
                continue

            # Skip header and footer area
            if rect.y1 <= self.content_top or rect.y0 >= self.content_bottom:
                continue

            # Filled rectangles
            if fill and len(fill) >= 3:
                rgb = (float(fill[0]), float(fill[1]), float(fill[2]))
                cat = classify_color(rgb)
                if cat != 'cyan':  # Ignore cyan lines
                    # Ignore black thin lines registered as fills
                    is_black = all(x < 0.08 for x in rgb)
                    if not is_black and rect.width >= 5 and rect.height >= 2:
                        self.fill_rects.append((rect, rgb, cat))

            # Lines (black strokes or thin filled rects)
            is_black = (fill and all(x < 0.08 for x in fill)) or (color and all(x < 0.08 for x in color))
            if is_black and rect:
                if rect.height <= 2.5 and rect.width > 10.0:
                    y = (rect.y0 + rect.y1) / 2.0
                    self.h_lines.append((y, rect.x0, rect.x1))
                elif rect.width <= 2.5 and rect.height > 8.0:
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

        # Extract words inside content bounds
        all_words = self.page.get_text("words")
        self.words = [w for w in all_words if self.content_top <= w[1] <= self.content_bottom]

    def get_color_at_point(self, x: float, y: float) -> Optional[str]:
        """
        Determine color category at (x, y) by sampling the topmost fill rect.
        Returns 'variant', 'key_block', 'green', 'lilac', 'gray', or None.
        """
        last_cat = None
        for rect, rgb, cat in self.fill_rects:
            if rect.x0 <= x <= rect.x1 and rect.y0 <= y <= rect.y1:
                last_cat = cat
        return last_cat

    def get_raw_color_at_point(self, x: float, y: float) -> Optional[Tuple[float, float, float]]:
        """Determine raw RGB at (x, y) by sampling topmost fill rect."""
        last_rgb = None
        for rect, rgb, cat in self.fill_rects:
            if rect.x0 <= x <= rect.x1 and rect.y0 <= y <= rect.y1:
                last_rgb = rgb
        return last_rgb

    def get_text_in_rect(self, rect: pymupdf.Rect) -> str:
        """Extract clean text clipped to rect."""
        return self.page.get_text("text", clip=rect).strip()
