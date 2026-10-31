"""Color classification for payShield 10K PDF."""
from typing import Tuple, Optional

# RGB Definitions (0.0 to 1.0)
ROSA_RGB = (0.949, 0.859, 0.859)            # Variant LMK (#F2DBDB)
AZUL_RGB = (0.859, 0.898, 0.945)            # Key Block LMK (#DBE5F1)
ROSA_OSCURO_1 = (0.851, 0.584, 0.580)       # Nested table header inside pink (#D99594)
ROSA_OSCURO_2 = (0.898, 0.722, 0.718)       # Nested table header inside pink (#E5B8B7)
AZUL_OSCURO = (0.722, 0.800, 0.894)         # Nested table header inside blue (#B8CCE4)
VERDE_CLARO = (0.918, 0.945, 0.867)         # Conditional sections (#EAF1DD)
VERDE_MEDIO = (0.839, 0.890, 0.737)         # Conditional sections (#D6E3BC)
LILA_RGB = (0.898, 0.875, 0.925)            # Optional blocks subsection (#E5DFEC)
CYAN_LINE_RGB = (0.000, 0.706, 0.867)       # Page header / footer decorative lines

def is_color_match(c1: Tuple[float, float, float], c2: Tuple[float, float, float], tolerance: float = 0.035) -> bool:
    """Check if two RGB tuples match within tolerance."""
    return (
        abs(c1[0] - c2[0]) <= tolerance and
        abs(c1[1] - c2[1]) <= tolerance and
        abs(c1[2] - c2[2]) <= tolerance
    )

def is_gray(c: Tuple[float, float, float]) -> bool:
    """Check if color is neutral gray."""
    if abs(c[0] - c[1]) < 0.03 and abs(c[1] - c[2]) < 0.03:
        # Gray header or neutral line
        return True
    return False

def classify_color(c: Optional[Tuple[float, float, float]], tolerance: float = 0.035) -> Optional[str]:
    """
    Classify color into logical category:
    - 'variant' (pink or dark pink)
    - 'key_block' (blue or dark blue)
    - 'green' (conditional sections)
    - 'lilac' (optional blocks)
    - 'gray' (neutral)
    - 'cyan' (running header/footer rule)
    - None (white / uncolored)
    """
    if not c or len(c) < 3:
        return None
    
    rgb = (float(c[0]), float(c[1]), float(c[2]))
    
    # Ignore pure black lines or pure white
    if all(x < 0.08 for x in rgb) or all(x > 0.985 for x in rgb):
        return None
        
    if is_color_match(rgb, CYAN_LINE_RGB, tolerance=0.06):
        return 'cyan'
        
    if is_color_match(rgb, ROSA_RGB, tolerance) or \
       is_color_match(rgb, ROSA_OSCURO_1, tolerance) or \
       is_color_match(rgb, ROSA_OSCURO_2, tolerance):
        return 'variant'
        
    if is_color_match(rgb, AZUL_RGB, tolerance) or \
       is_color_match(rgb, AZUL_OSCURO, tolerance):
        return 'key_block'
        
    if is_color_match(rgb, VERDE_CLARO, tolerance) or \
       is_color_match(rgb, VERDE_MEDIO, tolerance):
        return 'green'
        
    if is_color_match(rgb, LILA_RGB, tolerance):
        return 'lilac'
        
    if is_gray(rgb):
        return 'gray'
        
    return 'unknown'

def is_nested_table_header(c: Optional[Tuple[float, float, float]], tolerance: float = 0.035) -> Optional[str]:
    """Check if color is specifically a dark nested table header."""
    if not c or len(c) < 3:
        return None
    rgb = (float(c[0]), float(c[1]), float(c[2]))
    if is_color_match(rgb, ROSA_OSCURO_1, tolerance) or is_color_match(rgb, ROSA_OSCURO_2, tolerance):
        return 'variant_dark'
    if is_color_match(rgb, AZUL_OSCURO, tolerance):
        return 'key_block_dark'
    return None
