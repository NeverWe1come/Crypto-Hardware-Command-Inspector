#!/usr/bin/env python3
"""
concat_atalla_with_toc.py

Concatenates the 24 modular Atalla AT1000 v8.60 Markdown files into a single unified file,
prepending:
  1. # Table of Contents (with internal anchor links to all sections/chapters)
  2. # List of Commands – Numerical Order (with internal anchor links to all 248 commands)

Preserves 100% of the content of the 24 chapter files without modifications.
"""

import os
import re
import pymupdf

BASE_DIR = os.path.abspath("docs/Utimaco_Atalla-AT1000/8.60/markdown_v8.60")
PDF_PATH = os.path.abspath("docs/Utimaco_Atalla-AT1000/8.60/AT1000 HSM Command Reference Manual v8.60 C9B60-9004Z.pdf")
OUTPUT_MD_DIR = BASE_DIR
OUTPUT_MD_PARENT = os.path.abspath("docs/Utimaco_Atalla-AT1000/8.60")
TARGET_FILENAME = "AT1000_HSM_Command_Reference_Manual_v8.60.md"

CHAPTER_FILES = [
    "00-front-matter.md",
    "01-introduction.md",
    "02-key-management.md",
    "03-pin-processing.md",
    "04-transaction-data.md",
    "05-data-authentication.md",
    "06-card-authorization.md",
    "07-emv-processing.md",
    "08-volatile-table.md",
    "09-asymmetric-crypto.md",
    "10-printing-commands.md",
    "11-error-messages.md",
    "12-cmd-00-1e.md",
    "13-cmd-30-39.md",
    "14-cmd-3a-9f.md",
    "15-cmd-ba-129.md",
    "16-cmd-12a-359.md",
    "17-cmd-35a-1351.md",
    "18-app-a-key-info.md",
    "19-app-b-example-forms.md",
    "20-app-c-summary.md",
    "21-app-d-support.md",
    "22-app-e-glossary.md",
    "23-app-f-history.md"
]

def slugify(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text).strip().lower()
    text = re.sub(r"[^\w\s\-]", "", text)
    return re.sub(r"\s", "-", text)

def build_toc():
    toc_items = [
        (1, "List of Commands – Numerical Order", "list-of-commands--numerical-order"),
        (1, "About this Document", "about-this-document"),
        (2, "Document content", "document-content"),
        (2, "Document conventions", "document-conventions"),
        (2, "New and changed information V8.60", "new-and-changed-information-v860"),
        (2, "Documentation feedback", "documentation-feedback"),
        (2, "Related documentation", "related-documentation"),
        (2, "Utimaco website", "utimaco-website"),
        (1, "Topics", "topics"),
        (1, "1 Introduction", "1-introduction"),
        (2, "Cryptographic functions", "cryptographic-functions"),
        (2, "Operating overview", "operating-overview"),
        (2, "Command and response format", "command-and-response-format"),
        (2, "Error responses", "error-responses"),
        (2, "Data formats", "data-formats"),
        (2, "Security precautions", "security-precautions"),
        (2, "Programming guidelines", "programming-guidelines"),
        (1, "2 Key types and management methods", "2-key-types-and-management-methods"),
        (2, "Master File Key", "master-file-key"),
        (2, "Key Exchange Key", "key-exchange-key"),
        (2, "Working keys", "working-keys"),
        (2, "Key management methods", "key-management-methods"),
        (2, "Atalla Key Block (version 1-3DES)", "atalla-key-block-version-1-3des"),
        (2, "Atalla Key Block - version 3 (AES wrapping)", "atalla-key-block---version-3-aes-wrapping"),
        (2, "Working key headers", "working-key-headers"),
        (2, "Key types", "key-types"),
        (2, "Importing and exporting working keys", "importing-and-exporting-working-keys"),
        (2, "TR-31 Key Block", "tr-31-key-block"),
        (2, "Encrypting decimalization/conversion tables", "encrypting-decimalizationconversion"),
        (2, "Migrating the non-AKB formatted working key database", "migrating-the-non-akb-formatted-working"),
        (2, "Non-volatile key table", "non-volatile-key-table"),
        (2, "Volatile table", "volatile-table"),
        (2, "Procedure to replace the current MFK with the pending MFK", "procedure-to-replace-the-current-mfk-with"),
        (1, "3 Processing Personal Identification Numbers", "3-processing-personal-identification"),
        (2, "About PIN processing", "about-pin-processing"),
        (2, "PIN processing tasks", "pin-processing-tasks"),
        (2, "PIN sanity error", "pin-sanity-error"),
        (2, "PIN block formats", "pin-block-formats"),
        (1, "4 Processing transaction data", "4-processing-transaction-data"),
        (2, "Data processing tasks", "data-processing-tasks"),
        (2, "Encrypting and decrypting data", "encrypting-and-decrypting-data"),
        (2, "Password management", "password-management"),
        (1, "5 Authenticating transaction data", "5-authenticating-transaction-data"),
        (2, "About data authentication", "about-data-authentication"),
        (1, "6 Authorizing Visa, MasterCard, American Express and Discover cards", "6-authorizing-visa-mastercard-american"),
        (2, "About CVVs, CVCs, and CSCs", "about-cvvs-cvcs-and-cscs"),
        (1, "7 Processing EMV and Visa stored value cards", "7-processing-emv-and-visa-stored-value"),
        (2, "EMV Master Key derivation", "emv-master-key-derivation"),
        (2, "Union Pay International support", "union-pay-international-support"),
        (2, "VSVC data elements", "vsvc-data-elements"),
        (1, "8 Storing values in the volatile table", "8-storing-values-in-the-volatile-table"),
        (2, "AKB Personality", "akb-personality"),
        (2, "Variant Personality", "variant-personality"),
        (2, "Referencing a location", "referencing-a-location"),
        (2, "Volatile table tasks", "volatile-table-tasks"),
        (1, "9 Asymmetric Cryptography", "9-asymmetric-cryptography"),
        (2, "RSA Keys", "rsa-keys"),
        (2, "ECC Keys", "ecc-keys"),
        (2, "Importing RSA keys", "importing-rsa-keys"),
        (2, "Command usage scenarios for NCR devices", "command-usage-scenarios-for-ncr"),
        (2, "Command usage scenarios for Diebold devices", "command-usage-scenarios-for-diebold"),
        (2, "Commands for sending TR-34 messages", "commands-for-sending-tr-34-messages"),
        (1, "10 Printing commands", "10-printing-commands"),
        (2, "Enable and disable printing commands", "enable-and-disable-printing-commands"),
        (2, "Letter template file", "letter-template-file"),
        (2, "Printing an encrypted PIN", "printing-an-encrypted-pin"),
        (2, "Printing a key component", "printing-a-key-component"),
        (2, "Printing a test page", "printing-a-test-page"),
        (2, "HP Printers", "hp-printers"),
        (2, "Managing printer sockets", "managing-printer-sockets"),
        (2, "Printing errors", "printing-errors"),
        (2, "Clearing the printer’s buffer", "clearing-the-printers-buffer"),
        (1, "11 Error messages", "11-error-messages"),
        (2, "Application error messages", "application-error-messages"),
        (1, "Commands", "commands-00---1e"),
        (2, "Commands 00 - 1E", "commands-00---1e"),
        (2, "Commands 30 - 39", "commands-30---39"),
        (2, "Commands 3A - 9F", "commands-3a---9f"),
        (2, "Commands BA - 129", "commands-ba---129"),
        (2, "Commands 12A - 359", "commands-12a---359"),
        (2, "Commands 35A - 1351", "commands-35a---1351"),
        (1, "Appendices", "a-key-information"),
        (2, "A Key information", "a-key-information"),
        (2, "B Example Forms for recording key data", "b-example-forms-for-recording-key-data"),
        (2, "C Summary of commands and options", "c-summary-of-commands-and-options"),
        (2, "D Obtaining technical support", "d-obtaining-technical-support"),
        (2, "E Glossary", "e-glossary"),
        (2, "Document Revision History", "document-revision-history")
    ]
    lines = ["# Table of Contents\n\n"]
    for level, title, slug in toc_items:
        indent = "  " * (level - 1)
        lines.append(f"{indent}- [{title}](#{slug})\n")
    return "".join(lines), toc_items

def build_command_list():
    doc = pymupdf.open(PDF_PATH)
    cmd_pdf = []
    for pno in range(8, 16):
        text = doc[pno].get_text()
        for line in text.splitlines():
            line = line.strip()
            if "command " in line.lower() and "...." in line:
                parts = re.split(r"\.{3,}\s*", line)
                title = parts[0].strip()
                page = parts[-1].strip() if len(parts) > 1 else ""
                cmd_pdf.append((title, page))

    cmd_headings = []
    for fname in CHAPTER_FILES[12:18]:
        fpath = os.path.join(BASE_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("## "):
                    h = line[3:].strip()
                    if re.match(r"^[0-9A-Fa-f]{2,4}\s*-", h) and h != "24-hour support":
                        cmd_headings.append(h)

    assert len(cmd_pdf) == len(cmd_headings) == 248, f"Mismatch: PDF has {len(cmd_pdf)}, MD has {len(cmd_headings)}"

    lines = [
        "# List of Commands – Numerical Order\n\n",
        "This list arranges commands in numerical (hexadecimal) order.\n\n"
    ]
    loc_items = []
    for idx, (title, page) in enumerate(cmd_pdf):
        md_h = cmd_headings[idx]
        slug = slugify(md_h)
        lines.append(f"- [{title}](#{slug})\n")
        loc_items.append((title, slug, page))

    return "".join(lines), loc_items

def main():
    print("Building Table of Contents...")
    toc_text, toc_items = build_toc()

    print("Building List of Commands – Numerical Order...")
    loc_text, loc_items = build_command_list()

    print("Reading 24 chapter files...")
    chapter_parts = []
    for fname in CHAPTER_FILES:
        fpath = os.path.join(BASE_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            chapter_parts.append(f.read().strip())

    combined_body = "\n\n---\n\n".join(chapter_parts)

    full_document = (
        f"{toc_text}\n\n"
        f"---\n\n"
        f"{loc_text}\n\n"
        f"---\n\n"
        f"{combined_body}\n"
    )

    # Verification of slugs
    print("Verifying link anchors in full document...")
    headings_in_doc = set(["list-of-commands--numerical-order"])
    for line in full_document.splitlines():
        if line.startswith("#"):
            m = re.match(r"^(#+)\s+(.*)", line)
            if m:
                headings_in_doc.add(slugify(m.group(2).strip()))

    bad_toc = [item for item in toc_items if item[2] not in headings_in_doc]
    if bad_toc:
        raise ValueError(f"Found {len(bad_toc)} broken TOC links: {bad_toc}")

    bad_loc = [item for item in loc_items if item[1] not in headings_in_doc]
    if bad_loc:
        raise ValueError(f"Found {len(bad_loc)} broken LOC links: {bad_loc}")

    print(f"Verified {len(toc_items)} TOC links: 100% OK")
    print(f"Verified {len(loc_items)} command links: 100% OK (all 248 commands)")

    # Write output to both destinations
    out_path1 = os.path.join(OUTPUT_MD_DIR, TARGET_FILENAME)
    out_path2 = os.path.join(OUTPUT_MD_PARENT, TARGET_FILENAME)

    with open(out_path1, "w", encoding="utf-8") as f:
        f.write(full_document)
    print(f"Written to: {out_path1} ({len(full_document)} bytes, {len(full_document.splitlines())} lines)")

    with open(out_path2, "w", encoding="utf-8") as f:
        f.write(full_document)
    print(f"Written to: {out_path2} ({len(full_document)} bytes, {len(full_document.splitlines())} lines)")

if __name__ == "__main__":
    main()
