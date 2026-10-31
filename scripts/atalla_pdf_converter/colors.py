"""Color definitions and matching for AT1000 PDF."""
from typing import Tuple, Optional

# Expected RGB values (0.0 to 1.0)
SALMON_RGB = (1.0, 0.867, 0.828)      # AKB (#FFDDD3)
LILAC_RGB = (0.758, 0.730, 0.863)     # Variant (#C1BADC)
GRAY_HEADER_RGB = (0.902, 0.902, 0.902) # Table Header (#E6E6E6)
BLUE_TOP_RGB = (0.0, 0.406, 0.707)    # Top banner to ignore
GRAY_FOOTER_RGB = (0.773, 0.773, 0.777) # Footer line to ignore

TOLERANCE = 0.04

def color_matches(rgb: Optional[Tuple[float, ...]], target: Tuple[float, float, float], tol: float = TOLERANCE) -> bool:
    if not rgb or len(rgb) < 3:
        return False
    return all(abs(a - b) <= tol for a, b in zip(rgb[:3], target))

def classify_color(rgb: Optional[Tuple[float, ...]], tol: float = TOLERANCE) -> str:
    """Returns 'salmon', 'lilac', 'gray_header', 'blue_top', 'gray_footer', or 'other' / 'none'."""
    if not rgb:
        return 'none'
    if color_matches(rgb, SALMON_RGB, tol):
        return 'salmon'
    if color_matches(rgb, LILAC_RGB, tol):
        return 'lilac'
    if color_matches(rgb, GRAY_HEADER_RGB, tol):
        return 'gray_header'
    if color_matches(rgb, BLUE_TOP_RGB, tol):
        return 'blue_top'
    if color_matches(rgb, GRAY_FOOTER_RGB, tol):
        return 'gray_footer'
    return 'other'
