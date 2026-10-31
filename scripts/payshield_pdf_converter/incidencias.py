"""Incident tracking for payShield 10K conversion."""
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass, field

PAYSHIELD_CHAPTERS: List[Tuple[str, int, int]] = [
    ("00_Front_Matter.md", 1, 13),
    ("01_General.md", 14, 15),
    ("02_Introduction.md", 16, 36),
    ("03_Key_Management_Commands.md", 37, 265),
    ("04_Magnetic_Stripe_Issuing_Commands.md", 266, 311),
    ("05_Magnetic_Stripe_Transaction_Processing.md", 312, 427),
    ("06_Data_Protection_Commands.md", 428, 467),
    ("07_User_Authentication_Commands.md", 468, 494),
    ("08_HSM_Management_Commands.md", 495, 536),
    ("09_EMV_Transaction_Processing_Commands.md", 537, 563),
    ("10_EMV_Chip_Contactless_and_Mobile_Issuing.md", 564, 647),
    ("11_AS2805_Transaction_Processing.md", 648, 740),
    ("12_Error_Codes.md", 741, 743),
    ("13_Card_Issuing_Appendices.md", 744, 776),
    ("14_AS2805_Appendices.md", 777, 819),
]

def get_payshield_chapter_file(page_num: int) -> str:
    for filename, start, end in PAYSHIELD_CHAPTERS:
        if start <= page_num <= end:
            return filename
    return "00_Front_Matter.md"

@dataclass
class Incident:
    page_num: int
    category: str
    description: str
    decision: str

class IncidentTracker:
    """Tracks and reports conversion incidents and edge cases."""

    def __init__(self):
        self.incidents: List[Incident] = []

    def record(self, page_num: int, category: str, description: str, decision: str):
        self.incidents.append(Incident(
            page_num=page_num,
            category=category,
            description=description,
            decision=decision
        ))

    def generate_report(self) -> str:
        lines = [
            "# Informe de Incidencias — Conversión payShield 10K v2.3a",
            "",
            "Este documento registra los casos especiales, fusiones de tablas entre páginas,",
            "tablas anidadas aplanadas, secciones condicionales y decisiones tomadas durante la conversión.",
            "",
            "| Revisado | Archivo Markdown | Página | Categoría | Descripción | Decisión Tomada |",
            "| :---: | :--- | :---: | :--- | :--- | :--- |"
        ]

        if not self.incidents:
            lines.append("| [ ] | — | — | Ninguna | No se registraron incidencias. | — |")
        else:
            for inc in sorted(self.incidents, key=lambda x: (x.page_num, x.category)):
                doc_file = get_payshield_chapter_file(inc.page_num)
                desc = inc.description.replace("|", "\\|").replace("\n", " ")
                dec = inc.decision.replace("|", "\\|").replace("\n", " ")
                lines.append(f"| [ ] | [{doc_file}]({doc_file}) | {inc.page_num} | {inc.category} | {desc} | {dec} |")

        return "\n".join(lines) + "\n"
