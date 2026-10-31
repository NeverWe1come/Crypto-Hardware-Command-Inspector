"""CLI runner for payShield 10K PDF to Markdown conversion."""
import os
import sys
import argparse
import time
import pymupdf
from pathlib import Path
from scripts.payshield_pdf_converter.markdown_generator import MarkdownGenerator
from scripts.payshield_pdf_converter.incidencias import IncidentTracker
from scripts.payshield_pdf_converter.validator import MarkdownValidator

DEFAULT_PDF = "docs/Thales_Payshield10K/2.3/007-001515-023 payShield 10K Core Host Commands V2.3a - Rev B1.pdf"
DEFAULT_OUT_DIR = "docs/Thales_Payshield10K/2.3/markdown_v2.3"

CHAPTERS = [
    {"num": 0, "name": "00_Front_Matter", "start": 1, "end": 13, "title": "Front Matter"},
    {"num": 1, "name": "01_General", "start": 14, "end": 15, "title": "1 General"},
    {"num": 2, "name": "02_Introduction", "start": 16, "end": 36, "title": "2 Introduction"},
    {"num": 3, "name": "03_Key_Management_Commands", "start": 37, "end": 265, "title": "3 Key Management Commands"},
    {"num": 4, "name": "04_Magnetic_Stripe_Issuing_Commands", "start": 266, "end": 311, "title": "4 Magnetic Stripe Issuing Commands"},
    {"num": 5, "name": "05_Magnetic_Stripe_Transaction_Processing", "start": 312, "end": 427, "title": "5 Magnetic Stripe Transaction Processing"},
    {"num": 6, "name": "06_Data_Protection_Commands", "start": 428, "end": 467, "title": "6 Data Protection Commands"},
    {"num": 7, "name": "07_User_Authentication_Commands", "start": 468, "end": 494, "title": "7 User Authentication Commands"},
    {"num": 8, "name": "08_HSM_Management_Commands", "start": 495, "end": 536, "title": "8 HSM Management Commands"},
    {"num": 9, "name": "09_EMV_Transaction_Processing_Commands", "start": 537, "end": 563, "title": "9 EMV Transaction Processing Commands"},
    {"num": 10, "name": "10_EMV_Chip_Contactless_and_Mobile_Issuing", "start": 564, "end": 647, "title": "10 EMV Chip, Contactless & Mobile Issuing"},
    {"num": 11, "name": "11_AS2805_Transaction_Processing", "start": 648, "end": 740, "title": "11 AS2805 Transaction Processing"},
    {"num": 12, "name": "12_Error_Codes", "start": 741, "end": 743, "title": "12 Error Codes"},
    {"num": 13, "name": "13_Card_Issuing_Appendices", "start": 744, "end": 776, "title": "13 Card Issuing Appendices"},
    {"num": 14, "name": "14_AS2805_Appendices", "start": 777, "end": 819, "title": "14 AS2805 Appendices"},
]

PILOT_SECTIONS = [
    {"name": "pilot_p38_39_uncolored", "start": 38, "end": 39, "title": "Pilot: Uncolored Generic Tables (p.38-39)"},
    {"name": "pilot_p43_48_command_a0", "start": 43, "end": 48, "title": "Pilot: Multi-page Table with Lilac & Blue (p.43-48)"},
    {"name": "pilot_p60_66_derive_key", "start": 60, "end": 66, "title": "Pilot: Derive a Key & Nested Tables (p.60-66)"},
    {"name": "pilot_p76_80_import_key", "start": 76, "end": 80, "title": "Pilot: Import a Key & Dark Headers (p.76-80)"},
    {"name": "pilot_p345_347_translate_pin", "start": 345, "end": 347, "title": "Pilot: Green Conditional Sections (p.345-347)"},
]

def run_pilot(doc: pymupdf.Document, out_dir: str):
    """Executes pilot tests on target pages specified in Section 12."""
    pilot_dir = os.path.join(out_dir, "pilot")
    os.makedirs(pilot_dir, exist_ok=True)
    tracker = IncidentTracker()
    gen = MarkdownGenerator(doc, tracker)

    print(f"=== INICIANDO PRUEBA PILOTO (5 Secciones Objetivo) ===")
    total_errors = 0

    for sec in PILOT_SECTIONS:
        sec_name = sec["name"]
        start_p, end_p = sec["start"], sec["end"]
        print(f"-> Procesando {sec['title']} (páginas {start_p} a {end_p})...")
        t0 = time.time()
        md = gen.generate_chapter(start_p, end_p, sec["title"])
        elapsed = time.time() - t0

        out_file = os.path.join(pilot_dir, f"{sec_name}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(md)

        # Validate
        errs = MarkdownValidator.validate_file(md, out_file)
        if errs:
            print(f"   [ALERTA] {len(errs)} advertencias/errores en {sec_name}:")
            for e in errs[:5]:
                print(f"     - {e}")
            total_errors += len(errs)
        else:
            print(f"   [OK] Generado en {elapsed:.2f}s (0 errores)")

    # Write pilot incidencias.md
    inc_file = os.path.join(pilot_dir, "incidencias.md")
    with open(inc_file, "w", encoding="utf-8") as f:
        f.write(tracker.generate_report())
    print(f"-> Informe de incidencias piloto guardado en: {inc_file}")

    if total_errors == 0:
        print("=== PRUEBA PILOTO COMPLETADA CON ÉXITO (0 ERRORES) ===")
    else:
        print(f"=== PRUEBA PILOTO COMPLETADA CON {total_errors} ALERTAS ===")

def run_full(doc: pymupdf.Document, out_dir: str):
    """Processes all 14 chapters + front matter across all 819 pages."""
    os.makedirs(out_dir, exist_ok=True)
    tracker = IncidentTracker()
    gen = MarkdownGenerator(doc, tracker)

    print(f"=== INICIANDO CONVERSIÓN COMPLETA DE 819 PÁGINAS (15 Módulos) ===")
    start_total = time.time()
    total_errors = 0

    for ch in CHAPTERS:
        ch_name = ch["name"]
        start_p, end_p = ch["start"], ch["end"]
        title = ch["title"]
        print(f"-> Capítulo {ch['num']}: {title} (páginas {start_p} a {end_p})...")
        t0 = time.time()
        md = gen.generate_chapter(start_p, end_p, title)
        elapsed = time.time() - t0

        out_file = os.path.join(out_dir, f"{ch_name}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(md)

        errs = MarkdownValidator.validate_file(md, out_file)
        if errs:
            print(f"   [ALERTA] {len(errs)} errores en {ch_name}:")
            for e in errs[:5]:
                print(f"     - {e}")
            total_errors += len(errs)
        else:
            print(f"   [OK] Guardado {out_file} ({elapsed:.2f}s, {len(md):,} caracteres)")

    # Write global incidencias.md
    inc_file = os.path.join(out_dir, "incidencias.md")
    with open(inc_file, "w", encoding="utf-8") as f:
        f.write(tracker.generate_report())
    print(f"-> Informe global de incidencias guardado en: {inc_file}")

    total_time = time.time() - start_total
    print(f"=== CONVERSIÓN TOTAL COMPLETADA EN {total_time:.2f}s ({total_errors} errores) ===")

def main():
    parser = argparse.ArgumentParser(description="Convert payShield 10K PDF to Markdown.")
    parser.add_argument("--pdf", default=DEFAULT_PDF, help="Path to PDF file")
    parser.add_argument("--out", default=DEFAULT_OUT_DIR, help="Output directory")
    parser.add_argument("--pilot", action="store_true", help="Run pilot tests on target pages")
    parser.add_argument("--all", action="store_true", help="Run full conversion of all 819 pages")
    parser.add_argument("--chapter", type=int, help="Run specific chapter number (0 to 14)")
    parser.add_argument("--start", type=int, help="Start page (1-based)")
    parser.add_argument("--end", type=int, help="End page (1-based)")

    args = parser.parse_args()

    if not os.path.exists(args.pdf):
        print(f"Error: PDF file not found at {args.pdf}")
        sys.exit(1)

    doc = pymupdf.open(args.pdf)
    print(f"Cargado PDF: {args.pdf} ({len(doc)} páginas)")

    if args.pilot:
        run_pilot(doc, args.out)
    elif args.all:
        run_full(doc, args.out)
    elif args.chapter is not None:
        ch = next((c for c in CHAPTERS if c["num"] == args.chapter), None)
        if not ch:
            print(f"Error: Capítulo {args.chapter} no encontrado (0 a 14)")
            sys.exit(1)
        os.makedirs(args.out, exist_ok=True)
        tracker = IncidentTracker()
        gen = MarkdownGenerator(doc, tracker)
        print(f"Procesando Capítulo {ch['num']}: {ch['title']} ({ch['start']} a {ch['end']})...")
        md = gen.generate_chapter(ch["start"], ch["end"], ch["title"])
        out_file = os.path.join(args.out, f"{ch['name']}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(md)
        errs = MarkdownValidator.validate_file(md, out_file)
        print(f"Guardado {out_file} ({len(md):,} caracteres, {len(errs)} errores)")
    elif args.start and args.end:
        os.makedirs(args.out, exist_ok=True)
        tracker = IncidentTracker()
        gen = MarkdownGenerator(doc, tracker)
        print(f"Procesando páginas {args.start} a {args.end}...")
        md = gen.generate_chapter(args.start, args.end)
        out_file = os.path.join(args.out, f"pages_{args.start}_{args.end}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(md)
        errs = MarkdownValidator.validate_file(md, out_file)
        print(f"Guardado {out_file} ({len(md):,} caracteres, {len(errs)} errores)")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
