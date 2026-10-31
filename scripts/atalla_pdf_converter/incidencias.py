"""Issues and decisions tracking for incidencias.md according to Section 10."""
from typing import List, Dict, Any, Tuple

ATALLA_CHAPTERS: List[Tuple[str, int, int]] = [
    ("00-front-matter.md", 25, 30),
    ("01-introduction.md", 31, 42),
    ("02-key-management.md", 43, 70),
    ("03-pin-processing.md", 71, 86),
    ("04-transaction-data.md", 87, 94),
    ("05-data-authentication.md", 95, 98),
    ("06-card-authorization.md", 99, 100),
    ("07-emv-processing.md", 101, 104),
    ("08-volatile-table.md", 105, 106),
    ("09-asymmetric-crypto.md", 107, 116),
    ("10-printing-commands.md", 117, 122),
    ("11-error-messages.md", 123, 130),
    ("12-cmd-00-1e.md", 133, 190),
    ("13-cmd-30-39.md", 191, 404),
    ("14-cmd-3a-9f.md", 405, 620),
    ("15-cmd-ba-129.md", 621, 782),
    ("16-cmd-12a-359.md", 783, 1232),
    ("17-cmd-35a-1351.md", 1233, 1370),
    ("18-app-a-key-info.md", 1373, 1378),
    ("19-app-b-example-forms.md", 1379, 1382),
    ("20-app-c-summary.md", 1383, 1424),
    ("21-app-d-support.md", 1425, 1426),
    ("22-app-e-glossary.md", 1427, 1432),
    ("23-app-f-history.md", 1433, 1446),
]

def get_atalla_chapter_file(page: int) -> str:
    for filename, start, end in ATALLA_CHAPTERS:
        if start <= page <= end:
            return filename
    return "00-front-matter.md"

class IssueTracker:
    def __init__(self):
        self.issues: List[Dict[str, Any]] = []

    def log_issue(self, page: int, issue_type: str, decision: str, details: str = ""):
        """
        Record an issue.
        issue_type: 'single_color_table', 'unknown_color', 'multipage_ambiguity',
                    'split_row', 'original_typo', 'rasterized_page'
        """
        self.issues.append({
            "page": page,
            "type": issue_type,
            "decision": decision,
            "details": details
        })

    def generate_markdown(self) -> str:
        lines = [
            "# Informe de Incidencias y Decisiones de Conversión — Atalla AT1000",
            "",
            "> Este informe registra de forma exhaustiva todos los casos especiales, tablas multipágina,",
            "> divisiones de tablas con un solo color, subfilas partidas y decisiones tomadas durante",
            "> la conversión del manual AT1000 HSM v8.60 (C9B60-9004Z).",
            "",
            "| Revisado | Archivo Markdown | Página(s) | Tipo de Caso | Decisión Tomada | Detalles / Observaciones |",
            "| :---: | :--- | :---: | :--- | :--- | :--- |"
        ]
        
        if not self.issues:
            lines.append("| [ ] | - | - | Sin incidencias | N/A | El procesamiento se completó sin incidencias anómalas. |")
        else:
            for item in self.issues:
                p = item["page"]
                doc_file = get_atalla_chapter_file(p)
                p_str = str(p)
                t = item["type"].replace("|", "\\|")
                d = item["decision"].replace("|", "\\|")
                det = item["details"].replace("|", "\\|")
                lines.append(f"| [ ] | [{doc_file}]({doc_file}) | {p_str} | {t} | {d} | {det} |")
                
        return "\n".join(lines) + "\n"
