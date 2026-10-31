"""Data structures for tables and split tables."""
from typing import List, Optional, Tuple, Dict, Any

class SubRow:
    """A subrow for a key management method (salmon = AKB, lilac = Variant, none = Common)."""
    def __init__(self, method: str, length: str, description: str, y_bounds: Tuple[float, float]):
        self.method = method # 'akb', 'variant', 'common'
        self.length = length
        self.description = description
        self.y_bounds = y_bounds

class CommandTableRow:
    """A row in a Command or Response table."""
    def __init__(self, field_id: str, contents: str, y_bounds: Tuple[float, float]):
        self.field_id = field_id
        self.contents = contents
        self.y_bounds = y_bounds
        self.akb_subrow: Optional[SubRow] = None
        self.variant_subrow: Optional[SubRow] = None
        self.common_subrow: Optional[SubRow] = None

    @property
    def is_colored(self) -> bool:
        return (self.akb_subrow is not None) or (self.variant_subrow is not None)

class GenericTableRow:
    """A row in an uncolored or generic table."""
    def __init__(self, cells: List[str], y_bounds: Tuple[float, float]):
        self.cells = cells
        self.y_bounds = y_bounds

class ExtractedTable:
    """Represents an extracted table before or after multi-page merging."""
    def __init__(self, table_type: str, headers: List[str], col_x_bounds: List[Tuple[float, float]], page_num: int):
        self.table_type = table_type # 'command_param', 'key_type', 'usage_notes', 'generic'
        self.headers = headers
        self.col_x_bounds = col_x_bounds
        self.start_page = page_num
        self.end_page = page_num
        self.title: str = ""
        self.bbox: Tuple[float, float, float, float] = (0, 0, 0, 0)
        self.rows: List[Any] = [] # List[CommandTableRow] or List[GenericTableRow]
        self.has_colors: bool = False
