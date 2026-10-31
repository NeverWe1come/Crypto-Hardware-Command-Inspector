"""Automated validation of generated Markdown according to Section 13."""
import re
from typing import List, Dict, Any, Tuple

class MarkdownValidator:
    """Validates generated markdown files against strict quality rules."""

    @staticmethod
    def validate_file(md_content: str, filename: str) -> List[str]:
        """
        Runs validations on a generated markdown string.
        Returns a list of error/warning messages.
        """
        errors = []
        lines = md_content.splitlines()

        # 1. Header / footer residues
        for idx, line in enumerate(lines, 1):
            if "payShield 10K Core Host Commands" in line:
                errors.append(f"Line {idx}: Residue of running header found: '{line}'")
            if re.search(r"Page\s+\d+\s+of\s+819", line):
                errors.append(f"Line {idx}: Residue of running footer page number found: '{line}'")
            if "© Thales Group" in line:
                errors.append(f"Line {idx}: Residue of copyright footer found: '{line}'")
            if "All Rights Reserved" in line:
                errors.append(f"Line {idx}: Residue of footer rights found: '{line}'")

        # 2. Table column consistency & no repeated headers
        in_table = False
        table_start_line = 0
        table_cols = 0
        current_table_lines = []

        def get_cells(line_str: str) -> List[str]:
            # Split only on unescaped pipes
            parts = re.split(r"(?<!\\)\|", line_str)
            # Remove leading and trailing empty items from the enclosing pipes
            if parts and parts[0] == "":
                parts = parts[1:]
            if parts and parts[-1] == "":
                parts = parts[:-1]
            return [c.strip() for c in parts]

        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith("|") and stripped.endswith("|"):
                if not in_table:
                    in_table = True
                    table_start_line = idx
                    current_table_lines = [stripped]
                    cells = get_cells(stripped)
                    table_cols = len(cells)
                else:
                    current_table_lines.append(stripped)
                    cells = get_cells(stripped)
                    if len(cells) != table_cols:
                        errors.append(
                            f"Line {idx}: Column count mismatch in table starting at line {table_start_line}. "
                            f"Expected {table_cols}, got {len(cells)}: '{stripped}'"
                        )
                    # Check for repeated header inside the table
                    if "Field" in cells and ("Length & Type" in cells or "Details" in cells) and idx > table_start_line + 1:
                        errors.append(
                            f"Line {idx}: Repeated table header found inside table starting at line {table_start_line}!"
                        )
            else:
                if in_table:
                    in_table = False
                    current_table_lines = []

        # 3. Check color/text coherence in split tables
        # If in a Variant table, must not contain "For a Key Block LMK"
        # If in a Key Block table, must not contain "For a Variant LMK"
        active_table_type = None  # 'variant', 'key_block', or None
        in_split_table = False
        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            if "**Command: Variant**" in stripped or "**Response: Variant**" in stripped or stripped == "**Variant**":
                active_table_type = "variant"
                in_split_table = False
            elif "**Command: Key Block**" in stripped or "**Response: Key Block**" in stripped or stripped == "**Key Block**":
                active_table_type = "key_block"
                in_split_table = False
            elif stripped.startswith("#"):
                active_table_type = None
                in_split_table = False

            if stripped.startswith("|") and stripped.endswith("|"):
                if active_table_type:
                    in_split_table = True
            else:
                if in_split_table:
                    # Table has ended
                    active_table_type = None
                    in_split_table = False

            if active_table_type == "variant" and in_split_table:
                if "For a Key Block LMK" in line and not line.startswith("•") and not line.startswith("-"):
                    errors.append(
                        f"Line {idx}: 'For a Key Block LMK' found inside Variant table! Line: '{line[:80]}...'"
                    )
            elif active_table_type == "key_block" and in_split_table:
                if "For a Variant LMK" in line and not line.startswith("•") and not line.startswith("-"):
                    errors.append(
                        f"Line {idx}: 'For a Variant LMK' found inside Key Block table! Line: '{line[:80]}...'"
                    )

        return errors
