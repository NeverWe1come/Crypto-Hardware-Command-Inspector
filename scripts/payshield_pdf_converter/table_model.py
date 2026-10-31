"""Data models for extracted payShield 10K tables."""
from typing import List, Tuple, Optional, Union
from dataclasses import dataclass, field

@dataclass
class SubRow:
    """Represents a method-specific subrow within a field."""
    method: str  # 'variant' | 'key_block' | 'common'
    length_type: str
    details: str
    y_span: Tuple[float, float] = (0.0, 0.0)

@dataclass
class CommandTableRow:
    """Represents a row in a Command / Response table (Field | Length & Type | Details)."""
    field: str
    length_type: str = ""
    details: str = ""
    subrows: List[SubRow] = field(default_factory=list)
    is_section: bool = False
    section_method: Optional[str] = None  # None (common), 'variant', or 'key_block'
    y_span: Tuple[float, float] = (0.0, 0.0)

    @property
    def has_subrows(self) -> bool:
        return len(self.subrows) > 0

@dataclass
class GenericTableRow:
    """Represents a row in a generic non-command table."""
    cells: List[str]
    y_span: Tuple[float, float] = (0.0, 0.0)

@dataclass
class ExtractedTable:
    """Represents a table extracted from one or more pages."""
    kind: str  # 'command_param' | 'generic'
    headers: List[str]
    cols: List[Tuple[float, float]]
    page_num: int
    title: str = ""
    has_colors: bool = False
    rows: List[Union[CommandTableRow, GenericTableRow]] = field(default_factory=list)
    bbox: Tuple[float, float, float, float] = (0.0, 0.0, 0.0, 0.0)
    continued_from_prev: bool = False
    continues_to_next: bool = False
