"""CLI driver for converting AT1000 HSM Command Reference Manual PDF to Markdown."""
import argparse
import os
import sys
import time
import pymupdf

from scripts.atalla_pdf_converter.markdown_generator import MarkdownGenerator
from scripts.atalla_pdf_converter.incidencias import IssueTracker
from scripts.atalla_pdf_converter.validator import ValidationReport

DEFAULT_PDF = "docs/Utimaco_Atalla-AT1000/8.60/AT1000 HSM Command Reference Manual v8.60 C9B60-9004Z.pdf"
DEFAULT_OUTPUT_DIR = "docs/Utimaco_Atalla-AT1000/8.60/markdown_v8.60"

# Document chapter definitions
CHAPTERS = [
    {"name": "00-front-matter", "title": "About this Document", "start": 25, "end": 30},
    {"name": "01-introduction", "title": "1 Introduction", "start": 31, "end": 42},
    {"name": "02-key-management", "title": "2 Key types and management methods", "start": 43, "end": 70},
    {"name": "03-pin-processing", "title": "3 Processing Personal Identification Numbers", "start": 71, "end": 86},
    {"name": "04-transaction-data", "title": "4 Processing transaction data", "start": 87, "end": 94},
    {"name": "05-data-authentication", "title": "5 Authenticating transaction data", "start": 95, "end": 98},
    {"name": "06-card-authorization", "title": "6 Authorizing Visa, MasterCard, American Express and Discover cards", "start": 99, "end": 100},
    {"name": "07-emv-processing", "title": "7 Processing EMV and Visa stored value cards", "start": 101, "end": 104},
    {"name": "08-volatile-table", "title": "8 Storing values in the volatile table", "start": 105, "end": 106},
    {"name": "09-asymmetric-crypto", "title": "9 Asymmetric Cryptography", "start": 107, "end": 116},
    {"name": "10-printing-commands", "title": "10 Printing commands", "start": 117, "end": 122},
    {"name": "11-error-messages", "title": "11 Error messages", "start": 123, "end": 130},
    {"name": "12-cmd-00-1e", "title": "Commands 00 - 1E", "start": 133, "end": 190},
    {"name": "13-cmd-30-39", "title": "Commands 30 - 39", "start": 191, "end": 404},
    {"name": "14-cmd-3a-9f", "title": "Commands 3A - 9F", "start": 405, "end": 620},
    {"name": "15-cmd-ba-129", "title": "Commands BA - 129", "start": 621, "end": 782},
    {"name": "16-cmd-12a-359", "title": "Commands 12A - 359", "start": 783, "end": 1232},
    {"name": "17-cmd-35a-1351", "title": "Commands 35A - 1351", "start": 1233, "end": 1370},
    {"name": "18-app-a-key-info", "title": "A Key information", "start": 1373, "end": 1378},
    {"name": "19-app-b-example-forms", "title": "B Example Forms for recording key data", "start": 1379, "end": 1382},
    {"name": "20-app-c-summary", "title": "C Summary of commands and options", "start": 1383, "end": 1424},
    {"name": "21-app-d-support", "title": "D Obtaining technical support", "start": 1425, "end": 1426},
    {"name": "22-app-e-glossary", "title": "E Glossary", "start": 1427, "end": 1432},
    {"name": "23-app-f-history", "title": "Document Revision History", "start": 1433, "end": 1446},
]

def run_pilot(doc: pymupdf.Document, output_dir: str):
    """
    Pilot test (Section 8.2 Step 1):
    25-30 pages covering:
    - uncolored tables (p. 27, 32, 35)
    - color table AKB & Variant (p. 34)
    - multipage tables & color (Cmd 10: p. 135-139)
    """
    pilot_dir = os.path.join(output_dir, "pilot")
    os.makedirs(pilot_dir, exist_ok=True)
    tracker = IssueTracker()
    report = ValidationReport()
    generator = MarkdownGenerator(doc, tracker, report)
    
    print("=== Running Pilot Test (Section 8.2 Step 1) ===")
    
    # 1. Pilot Part 1: Chapter 1 (Introduction, pages 25-42: includes uncolored tables and page 34 AKB/Variant)
    print("Processing Pilot Part 1: Pages 25 to 42...")
    md_p1 = generator.process_range(25, 42)
    p1_path = os.path.join(pilot_dir, "pilot-ch01-introduction.md")
    with open(p1_path, "w", encoding="utf-8") as f:
        f.write(md_p1)
    print(f"  Wrote: {p1_path} ({len(md_p1)} bytes)")

    # 2. Pilot Part 2: Command 00 & Command 10 (Pages 134-142: includes multipage tables and color)
    print("Processing Pilot Part 2: Pages 134 to 142 (Commands 00 and 10)...")
    md_p2 = generator.process_range(134, 142)
    p2_path = os.path.join(pilot_dir, "pilot-cmd-10-multipage.md")
    with open(p2_path, "w", encoding="utf-8") as f:
        f.write(md_p2)
    print(f"  Wrote: {p2_path} ({len(md_p2)} bytes)")

    # 3. Write incidencias.md
    incidencias_path = os.path.join(pilot_dir, "incidencias.md")
    with open(incidencias_path, "w", encoding="utf-8") as f:
        f.write(tracker.generate_markdown())
    print(f"  Wrote: {incidencias_path}")

    # 4. Print Validation Summary
    print("\n=== Pilot Validation Summary ===")
    print(f"Tables validated: {report.stats['tables_validated']}")
    print(f"Divided tables: {report.stats['divided_tables']}")
    print(f"Common rows checked: {report.stats['common_rows_checked']}")
    print(f"Validation errors: {len(report.errors)}")
    print(f"Validation warnings: {len(report.warnings)}")
    for err in report.errors:
        print(f"  ERROR: {err}")
    for warn in report.warnings:
        print(f"  WARN:  {warn}")

def main():
    parser = argparse.ArgumentParser(description="Convert AT1000 PDF to Markdown")
    parser.add_argument("--pdf", default=DEFAULT_PDF, help="Path to PDF file")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="Output directory")
    parser.add_argument("--pilot", action="store_true", help="Run pilot test (25-30 pages)")
    parser.add_argument("--all", action="store_true", help="Convert all chapters")
    parser.add_argument("--start", type=int, help="Start page (1-based)")
    parser.add_argument("--end", type=int, help="End page (1-based)")
    args = parser.parse_args()

    if not os.path.exists(args.pdf):
        print(f"Error: PDF not found at {args.pdf}")
        sys.exit(1)

    doc = pymupdf.open(args.pdf)
    print(f"Loaded PDF: {args.pdf} ({len(doc)} pages)")
    os.makedirs(args.output_dir, exist_ok=True)

    if args.pilot:
        run_pilot(doc, args.output_dir)
        return

    if args.start and args.end:
        tracker = IssueTracker()
        report = ValidationReport()
        generator = MarkdownGenerator(doc, tracker, report)
        print(f"Converting pages {args.start} to {args.end}...")
        md = generator.process_range(args.start, args.end)
        out_file = os.path.join(args.output_dir, f"pages_{args.start}_{args.end}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(md)
        inc_file = os.path.join(args.output_dir, f"incidencias_{args.start}_{args.end}.md")
        with open(inc_file, "w", encoding="utf-8") as f:
            f.write(tracker.generate_markdown())
        print(f"Done. Wrote {out_file} and {inc_file}")
        return

    if args.all:
        tracker = IssueTracker()
        report = ValidationReport()
        generator = MarkdownGenerator(doc, tracker, report)
        t0 = time.time()
        for ch in CHAPTERS:
            print(f"Converting {ch['name']} (Pages {ch['start']} to {ch['end']}): {ch['title']}...")
            md = generator.process_range(ch["start"], ch["end"])
            out_file = os.path.join(args.output_dir, f"{ch['name']}.md")
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(md)
            print(f"  -> {out_file} ({len(md)} bytes)")
            
        inc_file = os.path.join(args.output_dir, "incidencias.md")
        with open(inc_file, "w", encoding="utf-8") as f:
            f.write(tracker.generate_markdown())
        print(f"\nAll chapters completed in {time.time() - t0:.1f}s.")
        print(f"Wrote global issues report to {inc_file}")
        return

    print("Specify --pilot, --all, or --start and --end. See --help.")

if __name__ == "__main__":
    main()
