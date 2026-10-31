#!/usr/bin/env python3
"""
Full, pristine, robust generator for Utimaco Atalla AT1000 v8.60 command specifications.
Reads docs/Utimaco_Atalla-AT1000/8.60/markdown_v8.60/AT1000_HSM_Command_Reference_Manual_v8.60.md
and produces:
1. packages/device-specs/src/devices/utimaco-atalla-v860-commands.ts
2. packages/device-specs/src/devices/utimaco-atalla-v860-errors.ts
3. packages/device-specs/src/devices/utimaco-atalla-docs.ts
4. packages/device-specs/src/__tests__/fixtures/atalla-v860-examples.json
5. docs/Utimaco_Atalla-AT1000/8.60/markdown_v8.60/generator-report.md
"""

import os
import re
import json

MANUAL_PATH = "docs/Utimaco_Atalla-AT1000/8.60/markdown_v8.60/AT1000_HSM_Command_Reference_Manual_v8.60.md"
COMMANDS_OUT_TS = "packages/device-specs/src/devices/utimaco-atalla-v860-commands.ts"
ERRORS_OUT_TS = "packages/device-specs/src/devices/utimaco-atalla-v860-errors.ts"
DOCS_OUT_TS = "packages/device-specs/src/devices/utimaco-atalla-docs.ts"
EXAMPLES_JSON = "packages/device-specs/src/__tests__/fixtures/atalla-v860-examples.json"
REPORT_MD = "docs/Utimaco_Atalla-AT1000/8.60/markdown_v8.60/generator-report.md"

with open(MANUAL_PATH, "r", encoding="utf-8") as f:
    full_text = f.read()

# ----------------------------------------------------------------------
# 1. Parse Error Tables 11-1 and 11-2
# ----------------------------------------------------------------------
ch11_pos = full_text.find("# 11 Error messages")
error_specs_11_1 = {}
detailed_errors_11_2 = {}

if ch11_pos != -1:
    ch11_text = full_text[ch11_pos:]
    t1_match = re.search(r"\*\*Table 11-1 Error types\*\*\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)", ch11_text)
    if t1_match:
        for row in t1_match.group(1).strip().split("\n"):
            cols = [c.strip() for c in row.split("|")[1:-1]]
            if len(cols) >= 2:
                err_code = cols[0].replace("*", "").strip()
                desc = cols[1].strip()
                error_specs_11_1[err_code] = desc

    t2_match = re.search(r"\*\*Table 11-2 Detailed Application Errors\*\*\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)", ch11_text)
    if t2_match:
        for row in t2_match.group(1).strip().split("\n"):
            cols = [c.strip() for c in row.split("|")[1:-1]]
            if len(cols) >= 2:
                err_code = cols[0].strip()
                desc = cols[1].strip()
                detailed_errors_11_2[err_code] = desc

# ----------------------------------------------------------------------
# 2. Parse Length Helper
# ----------------------------------------------------------------------
def parse_length(len_str, is_optional=False):
    if not len_str:
        return {"kind": "variable"}, "varies"
    raw_s = len_str.strip()
    clean = raw_s.replace("[", "").replace("]", "").replace("`", "").strip()
    # Remove thousands commas: 15,000 -> 15000
    clean = re.sub(r"(\d),(\d{3})\b", r"\1\2", clean)

    if "pin block data" in clean.lower() or "variable" in clean.lower() or "varies" in clean.lower() or clean.lower() == "none":
        return {"kind": "variable"}, raw_s

    # check if set format "16, 32" or "0, 74, 90, 106, 110"
    if "," in clean:
        nums = [int(n) for n in re.findall(r"\b\d+\b", clean)]
        if nums:
            # check if numbers are distinct
            uniq = sorted(list(set(nums)))
            if len(uniq) == 1:
                if uniq[0] == 0:
                    return {"kind": "set", "values": [0]}, raw_s
                return {"kind": "fixed", "length": uniq[0]}, raw_s
            return {"kind": "set", "values": uniq}, raw_s

    # check range "10 - 20" or "4-16" or "2-15000"
    m_range = re.match(r"^(\d+)\s*[-–]\s*(\d+)$", clean)
    if m_range:
        min_v = int(m_range.group(1))
        max_v = int(m_range.group(2))
        if min_v == max_v:
            return {"kind": "fixed", "length": min_v}, raw_s
        return {"kind": "range", "min": min_v, "max": max_v}, raw_s

    m_int = re.match(r"^\d+$", clean)
    if m_int:
        v = int(m_int.group(0))
        if v == 0:
            return {"kind": "set", "values": [0]}, raw_s
        return {"kind": "fixed", "length": v}, raw_s

    return {"kind": "variable"}, raw_s

def infer_encoding(name, desc):
    t = (name + " " + desc).lower()
    if "," in name or "challenge or status" in name.lower() or "status" in name.lower():
        return "ascii"
    if "printable ascii" in t or "ascii characters" in t or "key header" in t or "headers supported" in t or "commas" in t or "parenthes" in t or "quotation" in t or "quote" in t or "version" in name.lower() or "information" in name.lower() or "serial number" in name.lower():
        return "ascii"
    # Format, indicator, type, mode flags, method, algorithm are alphanumeric
    if any(k in name.lower() for k in ["format", "indicator", "mode", "type", "flag", "pad", "character", "scheme", "method", "algorithm"]):
        return "alphanumeric"
    if "0-9, a-f" in t or "hexadecimal" in t or "hex characters" in t or "hex digits" in t:
        if ("," in t and "header" in t) or "commas" in t or "parenthes" in t or "quotation" in t or "quote" in t:
            return "ascii"
        return "hex-ascii"
    if "0-9" in t and "a-f" not in t and "b" not in t and "letter" not in t:
        return "decimal"
    if "alphanumeric" in t:
        return "alphanumeric"
    return "ascii"

def is_sensitive(name, desc):
    # Strip brackets, optional markers, hashes, punctuation for clean comparison
    n = re.sub(r'[\[\]#\(\)\,\.]', '', name).lower().strip()

    # Pure numeric values (e.g. '0', '1', '11', '13') or 1-2 char constant selectors are never sensitive
    if n.isdigit() or (len(n) <= 2 and n not in ["s1", "s2", "s3"]):
        return False

    # Metadata indicators in the field name:
    # If the field name specifies a property/metadata of the secret rather than the secret itself,
    # it is not sensitive.
    metadata_suffixes = [
        "length", "format", "indicator", "identifier", "algorithm",
        "flag", "index", "mode", "type", "parity", "check digit", "check digits",
        "check value", "checksum", "method", "slot", "serial number",
        "pad character", "padding", "version", "usage", "mode-of-use", "mapping",
        "header", "count", "bits", "bytes"
    ]

    # If name ends with or is exactly one of the metadata suffixes, it's not sensitive
    # e.g. "ATM Master Key Length", "PIN Block Format", "Key Type", "Cryptogram Type"
    for ms in metadata_suffixes:
        if n.endswith(ms) or n.endswith(ms + "s") or n == ms or n.endswith(f" {ms}"):
            return False

    keywords = [
        "key", "pin", "cryptogram", "secret", "cvv", "cvc", "csc",
        "password", "passcode", "seed", "component", "private", "kek", "pek", "dek",
        "signature", "pvn", "pvv"
    ]

    words = set(re.findall(r'[a-z0-9]+', n))
    for k in keywords:
        if k in words:
            return True

    # Check for compound names like "ePIN", "dCVV", "Working Key"
    if "key" in n or "pin" in n or "cryptogram" in n or "secret" in n or "cvv" in n or "cvc" in n or "csc" in n or "signature" in n:
        return True

    return False

# ----------------------------------------------------------------------
# 3. Command Section Parser
# ----------------------------------------------------------------------
cmd_heading_pattern = re.compile(r"^##\s+([0-9A-Fa-f]{2,4})\s+-\s+(.+)$", re.MULTILINE)
matches = list(cmd_heading_pattern.finditer(full_text))

all_commands = []
oracle_examples = []
anomalies = []

for idx, m in enumerate(matches):
    code = m.group(1).upper()
    title = m.group(2).strip()
    start_pos = m.start()
    end_pos = matches[idx+1].start() if idx+1 < len(matches) else full_text.find("# A Key information")
    if end_pos == -1 or end_pos < start_pos:
        end_pos = len(full_text)
    
    sec_text = full_text[start_pos:end_pos]
    sec_text = re.sub(r"(#[0-9A-Za-f]+#?>)\s*(Variant Examples?)", r"\1\n\n### \2\n", sec_text)
    
    # 3.1 Extract Syntax
    cmd_syn_match = re.search(r"### Command\s*\n\s*```[^\n]*\n([^`]+)```", sec_text)
    if not cmd_syn_match:
        # Check alternative headers like ## Command – ECB-Mode
        cmd_syn_match = re.search(r"##\s*Command[^\n]*\s*\n\s*```[^\n]*\n([^`]+)```", sec_text)
    
    cmd_syntax = cmd_syn_match.group(1).strip().replace("\r", "").replace("\n", "") if cmd_syn_match else f"<{code}#>"
    
    resp_syn_match = re.search(r"### Response\s*\n\s*```[^\n]*\n([^`]+)```", sec_text)
    if not resp_syn_match:
        resp_syn_match = re.search(r"##\s*Response[^\n]*\s*\n\s*```[^\n]*\n([^`]+)```", sec_text)
    
    resp_syntax = resp_syn_match.group(1).strip().replace("\r", "").replace("\n", "") if resp_syn_match else ""

    # Response Code
    resp_code = None
    if code == "9A":
        resp_code = "AA"
    elif resp_syntax:
        m_rc = re.search(r"<([0-9A-Fa-f]{2,4})#", resp_syntax)
        if m_rc:
            resp_code = m_rc.group(1).upper()
    if not resp_code:
        # Default increment
        if code.isdigit():
            c_int = int(code, 16) if any(c in code for c in "ABCDEF") else int(code)
            # Standard Atalla response rule: odd first digit + 1
            first_d = int(code[0])
            resp_code = str(first_d + 1) + code[1:]
        elif code == "3A":
            resp_code = "4A"
        elif code == "3D":
            resp_code = "4D"
        elif code == "3E":
            resp_code = "4E"
        elif code == "5C":
            resp_code = "6C"
        elif code == "5D":
            resp_code = "6D"
        elif code == "5E":
            resp_code = "6E"
        elif code == "5F":
            resp_code = "6F"
        elif code == "7C":
            resp_code = "8C"
        elif code == "7E":
            resp_code = "8E"
        elif code == "7F":
            resp_code = "8F"
        elif code == "9A":
            resp_code = "AA"
        elif code == "9B":
            resp_code = "AB"
        elif code == "9D":
            resp_code = "AD"
        elif code == "9E":
            resp_code = "AE"
        elif code == "9F":
            resp_code = "AF"
        elif code == "BA":
            resp_code = "CA"
        elif code == "BB":
            resp_code = "CB"
        elif code == "BD":
            resp_code = "CD"
        elif code == "BE":
            resp_code = "CE"
        elif code == "BF":
            resp_code = "CF"
        elif code == "D0":
            resp_code = "E0"
        elif code == "00":
            resp_code = "00"
        else:
            resp_code = code

    # 3.2 Key Management Table
    km_matrix = []
    km_match = re.search(r"\|\s*Key Type\s*\|\s*Default Setting\s*\|\s*MFK Type\s*\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)", sec_text)
    if km_match:
        for row in km_match.group(1).strip().split("\n"):
            cols = [c.strip() for c in row.split("|")[1:-1]]
            if len(cols) >= 3:
                ktype = cols[0].lower()
                def_set = cols[1].lower() == "enabled"
                mfk = cols[2]
                if "akb" in ktype:
                    km_matrix.append({"mode": "akb", "defaultEnabled": def_set, "mfk": mfk})
                elif "variant" in ktype:
                    km_matrix.append({"mode": "variant", "defaultEnabled": def_set, "mfk": mfk})

    # 3.3 Discriminator Detection
    discriminator = None
    sub_variant = None
    if ", " in title:
        sub_variant = title.split(", ", 1)[1].strip()

    # Special discriminator rules
    if code == "14":
        if "Diebold" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["1"]}
        elif "IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["3"]}
        elif "IBM 4731" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["4"]}
    elif code == "15":
        if "Diebold" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["1"]}
        elif "Docutel" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["2"]}
        elif "IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["3"]}
        elif "IBM 4731" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["4"]}
    elif code == "16":
        if "Diebold" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["1"]}
        elif "Docutel" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["2"]}
        elif "IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["3"]}
    elif code == "31":
        if "DUKPT" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["7"]}
        else:
            discriminator = {"fieldIndex": 0, "match": "oneOf", "values": ["1", "2", "3", "4", "5", "9"]}
    elif code == "32":
        if "Identikey" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["1"]}
        elif "IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["2"]}
        elif "Visa" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["3"]}
        elif "Atalla DES BiLevel" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["4"]}
        elif "Diebold" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["5"]}
        elif "NCR" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["6"]}
        elif "Clear-PIN Comparison" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["7"]}
        elif "PIN-Block Comparison" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["8"]}
        elif "Burroughs" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["F"]}
        elif "Atalla 2x2" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["I"]}
    elif code == "33":
        if "ANSI to ANSI" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["11"]}
        elif "ANSI to PIN/Pad" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["13"]}
        elif "ANSI to IBM 4731" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["19"]}
        elif "IBM 3624 to IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["22"]}
        elif "IBM 3624 to PIN/Pad" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["23"]}
        elif "PIN/Pad to ANSI" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["31"]}
        elif "PIN/Pad to PIN/Pad" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["33"]}
        elif "PIN/Pad to IBM 4731" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["39"]}
        elif "IBM 4731 to ANSI" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["91"]}
        elif "IBM 4731 to PIN/Pad" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["93"]}
        elif "IBM 4731 to IBM 4731" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["99"]}
    elif code == "37":
        if "Identikey" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["1"]}
        elif "IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["2"]}
        elif "Visa" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["3"]}
        elif "Atalla DES Bilevel" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["4"]}
        elif "Diebold" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["5"]}
        elif "NCR" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["6"]}
    elif code == "3A":
        if "IBM 3624" in title:
            discriminator = {"fieldIndex": 0, "match": "beforeComma", "values": ["2"]}
        elif "Visa" in title:
            discriminator = {"fieldIndex": 0, "match": "beforeComma", "values": ["3"]}
        elif "Atalla Bilevel" in title:
            discriminator = {"fieldIndex": 0, "match": "beforeComma", "values": ["4"]}
        elif "NCR" in title:
            discriminator = {"fieldIndex": 0, "match": "beforeComma", "values": ["6"]}
    elif code == "9A":
        if "AKB Header Mapping" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["AKB2TR31"]}
        elif "HSM Configuration Status" in title:
            discriminator = {"fieldIndex": 0, "match": "oneOf", "values": ["CONFIG-ON", "CONFIG-ALL", "CONFIG-OFF", "CONFIG"]}
        elif "HSM Count Status" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["COUNT"]}
        elif "HSM DIAGTEST" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["DIAGTEST"]}
        elif "AKB Headers" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["HEADERS"]}
        elif "HSM Status ID" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["ID"]}
        elif "HSM Security Information" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["INFO"]}
        elif "HSM Status Key" in title:
            discriminator = {"fieldIndex": 0, "match": "exact", "values": ["KEY"]}
        elif "Utility" in title:
            discriminator = {"fieldIndex": 0, "match": "oneOf", "values": ["CMD", "SECURE", "POLICY", "PREMIUM", "UTIL", "OPTION", "AUDIT"]}

    # 3.4 Parse Tables
    def parse_markdown_table(table_text):
        fields = []
        rows = [r.strip() for r in table_text.strip().split("\n") if r.strip()]
        for r in rows:
            if not r.startswith("|"): continue
            cols = [c.strip() for c in r.split("|")[1:-1]]
            if len(cols) < 4: continue
            f_idx_str = cols[0].replace("*", "").strip()
            if not re.match(r"^\d+$", f_idx_str): continue
            f_idx = int(f_idx_str)

            fname = cols[1].strip()
            flen_str = cols[2].strip()
            fdesc = cols[3].strip()
            if not fname:
                fname = "Reserved" if "reserved" in fdesc.lower() else "Empty Field"
            if not fdesc:
                fdesc = fname

            is_opt = "[" in fname or "]" in fname or "[" in flen_str or "]" in flen_str or "optional" in fdesc.lower() or "present only" in fdesc.lower()
            flen_allows_zero = flen_str.strip().startswith("0") or "0," in flen_str or "0 -" in flen_str or "0–" in flen_str or "or empty" in fdesc.lower() or "can be empty" in fdesc.lower() or "may be empty" in fdesc.lower()

            presence = "required"
            if is_opt:
                presence = "optional"
            elif flen_allows_zero:
                presence = "may-be-empty"

            flen_spec, len_txt = parse_length(flen_str, is_opt)
            if "location" in fname.lower():
                flen_spec = {"kind": "range", "min": 1, "max": 4}
                len_txt = "1 - 4"
            if "pin block data" in fname.lower():
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if ("pan" in fname.lower() or "account number" in fname.lower()) and "sequence" not in fname.lower() and "partial" not in fname.lower():
                flen_spec = {"kind": "range", "min": 10, "max": 19}
                len_txt = "10 - 19"
            if "partial pan" in fname.lower():
                flen_spec = {"kind": "range", "min": 1, "max": 16}
                len_txt = "1 - 16"
            if "sequence" in fname.lower() and "pan" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 2]}
                len_txt = "1, 2"
            if code == "00" and fname == "Version":
                flen_spec = {"kind": "set", "values": [2, 6]}
                len_txt = "2, 6"
            if code == "9A" and fname.lower() == "filter":
                presence = "optional"
                is_opt = True
            if code == "9A" and fname.upper() == "ID":
                flen_spec = {"kind": "fixed", "length": 2}
                len_txt = "2"
            if code == "108" and "challenge" in fname.lower():
                flen_spec = {"kind": "set", "values": [6, 16]}
                len_txt = "6, 16"
            if code == "33" and "pin block" in fname.lower():
                flen_spec = {"kind": "set", "values": [16, 18, 32]}
                len_txt = "16, 18, 32"
            if code == "33" and re.match(r"^[0-9]{2}$", fname):
                flen_spec = {"kind": "fixed", "length": 2}
                len_txt = "2"
            if code == "33" and "icv" in fname.lower():
                presence = "optional"
                is_opt = True
            if code == "37" and ("new pvn" in fname.lower() or "new-pvn" in fname.lower() or "new offset" in fname.lower() or "pvv" in fname.lower()):
                flen_spec = {"kind": "set", "values": [4, 6, 8, 16]}
                len_txt = "4, 6, 8, 16"
            if code == "126" and ("digest" in fname.lower() or "result" in fname.lower()):
                flen_spec = {"kind": "set", "values": [32, 40, 48, 56, 64, 80, 96, 102, 106, 110, 126, 128, 136]}
                len_txt = "32 - 136"
            if code == "12F" and ("public key" in fname.lower() or "key block data" in fname.lower()):
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "3E" and "ksn" in fname.lower():
                flen_spec = {"kind": "set", "values": [16, 20]}
                len_txt = "16, 20"
            if code == "352" and "mac" in fname.lower() and "length" not in fname.lower():
                flen_spec = {"kind": "set", "values": [8, 12, 16, 32, 74]}
                len_txt = "8, 12, 16, 32, 74"
            if code == "90" and "offset" in fname.lower():
                flen_spec = {"kind": "range", "min": 1, "max": 16}
                len_txt = "1 - 16"
            if code == "90" and "pin" in fname.lower():
                flen_spec = {"kind": "range", "min": 1, "max": 12}
                len_txt = "1 - 12"
            if code == "BD" and "insertion position" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 2]}
                len_txt = "1, 2"
            if code == "BD" and fname.lower() == "data":
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "D0" and fname.upper() == "PIN":
                flen_spec = {"kind": "range", "min": 4, "max": 12}
                len_txt = "4 - 12"
            if code == "159" and "pin length" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 2, 4, 6, 8, 12, 16, 18, 32]}
                len_txt = "1, 2, 4, 6, 8, 12, 16, 18, 32"
            if code == "356" and "[h#" in fname.lower():
                flen_spec = {"kind": "set", "values": [8, 16]}
                len_txt = "8, 16"
            if code in ["357", "359"] and "verification flag" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 3, 5]}
                len_txt = "1, 3, 5"
            if code == "393" and "key or component" in fname.lower():
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "3FD" and "script message" in fname.lower():
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "1102" and fname.lower() == "name":
                flen_spec = {"kind": "range", "min": 1, "max": 32}
                len_txt = "1 - 32"
            if code == "1111":
                flen_spec = {"kind": "set", "values": [6, 12, 14]}
                len_txt = "6, 12, 14"
            if code == "1350":
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "13F" and "exportability" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 3]}
                len_txt = "1, 3"
            if "ip address" in fname.lower() or "ip-address" in fname.lower():
                flen_spec = {"kind": "range", "min": 7, "max": 15}
                len_txt = "7 - 15"
            if "cmac" in fname.lower() and "key" not in fname.lower() and "algorithm" not in fname.lower():
                flen_spec = {"kind": "set", "values": [8, 16, 32]}
                len_txt = "8, 16, 32"
            if "cmac" in fname.lower() and "algorithm" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 2]}
                len_txt = "1, 2"
            if code == "97" and "usage" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 2]}
                len_txt = "1, 2"
            if code == "11C" and "check digit" in fname.lower():
                flen_spec = {"kind": "range", "min": 4, "max": 30}
                len_txt = "4 - 30"
            if "check digits or public key" in fname.lower() or "public key" in fname.lower():
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "90" and fname.lower() == "pin block":
                flen_spec = {"kind": "set", "values": [16, 18, 32]}
                len_txt = "16, 18, 32"
            if code == "90" and "format" in fname.lower():
                flen_spec = {"kind": "set", "values": [1, 2, 3]}
                len_txt = "1, 2, 3"
            if code == "90" and "data" in fname.lower():
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "90" and "pin encryption key" in fname.lower():
                flen_spec = {"kind": "set", "values": [16, 32, 74, 106]}
                len_txt = "16, 32, 74, 106"
            if ("check digit" in fname.lower() or "check digits" in fname.lower()) and "public key" not in fname.lower():
                if "method" in fname.lower():
                    flen_spec = {"kind": "set", "values": [1, 2]}
                    len_txt = "1, 2"
                else:
                    flen_spec = {"kind": "set", "values": [4, 6, 7, 8, 9, 10, 13, 14, 16, 32, 64]}
                    len_txt = "4 - 64"
            if flen_spec.get("kind") == "set" and 74 in flen_spec.get("values", []):
                vals = sorted(list(set(flen_spec.get("values", []) + [78, 106, 110])))
                flen_spec = {"kind": "set", "values": vals}
                len_txt = flen_str.strip()
            elif flen_spec.get("kind") == "fixed" and flen_spec.get("length") == 74:
                flen_spec = {"kind": "set", "values": [74, 78, 106, 110]}
                len_txt = flen_str.strip()
            if code == "390" and "ending initialization vector" in fname.lower():
                flen_spec = {"kind": "set", "values": [0, 1, 32, 58, 74]}
                len_txt = "0, 1, 32, 58, 74"
                presence = "optional"
                is_opt = True
            if code == "3FC" and "application data" in fname.lower():
                flen_spec = {"kind": "variable"}
                len_txt = "varies"
            if code == "1227" and "reset" in fname.lower():
                flen_spec = {"kind": "fixed", "length": 22}
                len_txt = "22"
            if code == "1227" and "mode" in fname.lower():
                presence = "optional"
                is_opt = True
                flen_spec = {"kind": "set", "values": [0, 5]}
                len_txt = "0, 5"
            if code == "15" and "exchange key" in fname.lower():
                flen_spec = {"kind": "set", "values": [16, 32, 74, 106]}
                len_txt = "16, 32, 74, 106"
            if code == "1A" and "key spec" in fname.lower():
                flen_spec = {"kind": "set", "values": [4, 12, 16, 32, 74, 106]}
                len_txt = "4, 12, 16, 32, 74, 106"
                encoding = "ascii"
            if code == "1E" and "new base derivation key" in fname.lower():
                flen_spec = {"kind": "set", "values": [0, 1, 16, 32, 74, 106]}
                len_txt = "0, 1, 16, 32, 74, 106"
                presence = "optional"
                is_opt = True
            if code == "3A" and "card verification flag" in fname.lower():
                flen_spec = {"kind": "range", "min": 1, "max": 10}
                len_txt = "1 - 10"

            encoding = infer_encoding(fname, fdesc)
            if code == "3A" and "card verification flag" in fname.lower():
                encoding = "ascii"
            if code == "354" and "master key" in fname.lower():
                encoding = "ascii"
            if code == "37" and ("new pvn" in fname.lower() or "new-pvn" in fname.lower() or "new offset" in fname.lower() or "pvv" in fname.lower()):
                encoding = "alphanumeric"
            if code == "126" and ("digest" in fname.lower() or "result" in fname.lower()):
                encoding = "ascii"
            sensitive = is_sensitive(fname, fdesc)
            allows_vol = "volatile table location" in fdesc.lower()

            fid = re.sub(r"[^a-zA-Z0-9]+", "-", fname.lower()).strip("-")
            if not fid:
                fid = f"field-{f_idx}"

            fields.append({
                "id": fid,
                "_raw_index": f_idx,
                "name": {"es": fname, "en": fname},
                "description": {"es": fdesc, "en": fdesc},
                "position": f_idx - 1,
                "length": flen_spec,
                "lengthText": len_txt,
                "encoding": encoding,
                "required": (presence == "required"),
                "presence": presence,
                "allowsVolatileLocation": allows_vol,
                "sensitive": sensitive
            })
        return fields

    def parse_section_tables(stext):
        pattern = r"\*\*([^\*\n]*(?:table|description|no color)[^\*\n]*)\*\*\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)"
        cmd_tbls = {"common_before": [], "akb": [], "variant": [], "common_after": []}
        resp_tbls = {"common_before": [], "akb": [], "variant": [], "common_after": []}
        
        for match in re.finditer(pattern, stext, re.I):
            hdr = match.group(1).strip()
            tbl = match.group(2)
            h_lower = hdr.lower()
            
            if "legend" in h_lower or "legal characters" in h_lower:
                continue
                
            if "command" in h_lower:
                if "continued" in h_lower:
                    cmd_tbls["common_after"].append(tbl)
                elif "akb" in h_lower and "variant" not in h_lower:
                    cmd_tbls["akb"].append(tbl)
                elif "variant" in h_lower and "akb" not in h_lower:
                    cmd_tbls["variant"].append(tbl)
                else:
                    cmd_tbls["common_before"].append(tbl)
            elif "response" in h_lower:
                if "continued" in h_lower:
                    resp_tbls["common_after"].append(tbl)
                elif "akb" in h_lower and "variant" not in h_lower:
                    resp_tbls["akb"].append(tbl)
                elif "variant" in h_lower and "akb" not in h_lower:
                    resp_tbls["variant"].append(tbl)
                else:
                    resp_tbls["common_before"].append(tbl)
            elif "no color" in h_lower:
                if h_lower.endswith("akb") or ": akb" in h_lower:
                    cmd_tbls["akb"].append(tbl)
                elif h_lower.endswith("variant") or ": variant" in h_lower:
                    cmd_tbls["variant"].append(tbl)

        return cmd_tbls, resp_tbls

    def assemble_fields(common_before, mode_table, common_after):
        all_raw_fields = []
        for tbl in common_before:
            all_raw_fields.extend(parse_markdown_table(tbl))
        for tbl in mode_table:
            all_raw_fields.extend(parse_markdown_table(tbl))
        for tbl in common_after:
            all_raw_fields.extend(parse_markdown_table(tbl))
        
        # Merge fields by _raw_index so alternative tables for the same field index dont create duplicate fields!
        fields_by_index = {}
        for f in all_raw_fields:
            raw_idx = f.get("_raw_index")
            if raw_idx == 0:
                continue # Skip Command/Response ID
            if raw_idx not in fields_by_index:
                fields_by_index[raw_idx] = f
            else:
                existing = fields_by_index[raw_idx]
                curr_lens = existing["length"].get("values") or ([existing["length"]["length"]] if existing["length"].get("kind") == "fixed" else [])
                new_lens = f["length"].get("values") or ([f["length"]["length"]] if f["length"].get("kind") == "fixed" else [])
                if curr_lens and new_lens:
                    merged = sorted(list(set(curr_lens + new_lens)))
                    existing["length"] = {"kind": "set", "values": merged}
                    existing["lengthText"] = ", ".join(str(x) for x in merged)
                elif f["length"].get("kind") == "range" or existing["length"].get("kind") == "range":
                    min_v = min(existing["length"].get("min", 0), f["length"].get("min", 0))
                    max_v = max(existing["length"].get("max", 9999), f["length"].get("max", 9999))
                    existing["length"] = {"kind": "range", "min": min_v, "max": max_v}
                if f.get("presence") == "optional" or existing.get("presence") == "optional":
                    existing["presence"] = "optional"
                elif f.get("presence") == "may-be-empty" or existing.get("presence") == "may-be-empty":
                    existing["presence"] = "may-be-empty"
                if f.get("allowsVolatileLocation"):
                    existing["allowsVolatileLocation"] = True
                if f.get("sensitive") or existing.get("sensitive"):
                    existing["sensitive"] = True
                if existing.get("encoding") != f.get("encoding"):
                    existing["encoding"] = "ascii"
                if f["name"]["en"] != existing["name"]["en"] and f["name"]["en"] not in existing["name"]["en"]:
                    existing["name"]["en"] = f"{existing['name']['en']} / {f['name']['en']}"
                    existing["name"]["es"] = existing["name"]["en"]

        # Sort strictly by raw_idx
        sorted_fields = [fields_by_index[k] for k in sorted(fields_by_index.keys())]
        for p_idx, f in enumerate(sorted_fields):
            f["position"] = p_idx
            if "_raw_index" in f:
                del f["_raw_index"]
        return sorted_fields

    raw_cmd_tbls, raw_resp_tbls = parse_section_tables(sec_text)

    # Find Command tables
    cmd_tables = {}
    if raw_cmd_tbls["akb"] or raw_cmd_tbls["variant"]:
        akb_f = assemble_fields(raw_cmd_tbls["common_before"], raw_cmd_tbls["akb"], raw_cmd_tbls["common_after"])
        var_f = assemble_fields(raw_cmd_tbls["common_before"], raw_cmd_tbls["variant"], raw_cmd_tbls["common_after"])
        if akb_f: cmd_tables["akb"] = akb_f
        if var_f: cmd_tables["variant"] = var_f
        if akb_f and var_f and len(akb_f) > len(var_f):
            import copy
            existing_ids = {f["id"] for f in var_f}
            max_var_pos = max((f["position"] for f in var_f), default=-1)
            for f in akb_f:
                if f["id"] not in existing_ids and f["position"] > max_var_pos:
                    f_c = copy.deepcopy(f)
                    f_c["position"] = len(var_f)
                    var_f.append(f_c)
    elif raw_cmd_tbls["common_before"] or raw_cmd_tbls["common_after"]:
        gen_f = assemble_fields(raw_cmd_tbls["common_before"], [], raw_cmd_tbls["common_after"])
        cmd_tables["akb"] = gen_f
        cmd_tables["variant"] = gen_f

    if code == "15" and "IBM 4731" in title:
        for km_k in ["akb", "variant"]:
            if km_k in cmd_tables:
                if len(cmd_tables[km_k]) == 3:
                    cmd_tables[km_k].append({
                        "id": "key-usage",
                        "name": {"es": "[Key Usage#]", "en": "[Key Usage#]"},
                        "description": {"es": "The Key Usage / Variant applied.", "en": "The Key Usage / Variant applied."},
                        "position": 3,
                        "length": {"kind": "fixed", "length": 1},
                        "lengthText": "1",
                        "encoding": "ascii",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    })

    # Find Response tables
    resp_tables = {}
    if raw_resp_tbls["akb"] or raw_resp_tbls["variant"]:
        akb_f = assemble_fields(raw_resp_tbls["common_before"], raw_resp_tbls["akb"], raw_resp_tbls["common_after"])
        var_f = assemble_fields(raw_resp_tbls["common_before"], raw_resp_tbls["variant"], raw_resp_tbls["common_after"])
        if akb_f: resp_tables["akb"] = akb_f
        if var_f: resp_tables["variant"] = var_f
    elif raw_resp_tbls["common_before"] or raw_resp_tbls["common_after"]:
        gen_f = assemble_fields(raw_resp_tbls["common_before"], [], raw_resp_tbls["common_after"])
        resp_tables["akb"] = gen_f
        resp_tables["variant"] = gen_f

    # Synthesize 18B response if table was missing in PDF markdown
    if code == "18B" and not resp_tables.get("akb") and not resp_tables.get("variant"):
        f18b_resp = [
            {
                "id": "sensitive-data-or-sanity-error",
                "name": {"es": "Sensitive Data or Sanity Error", "en": "Sensitive Data or Sanity Error"},
                "description": {"es": "The sensitive data encrypted under the sensitive data encryption key.", "en": "The sensitive data encrypted under the sensitive data encryption key."},
                "position": 0,
                "length": {"kind": "variable"},
                "lengthText": "16, 32, 48, 64, 80, 96, 112, 128",
                "encoding": "hex-ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": True
            },
            {
                "id": "length",
                "name": {"es": "Length", "en": "Length"},
                "description": {"es": "The length of the unencrypted sensitive data in bytes.", "en": "The length of the unencrypted sensitive data in bytes."},
                "position": 1,
                "length": {"kind": "range", "min": 1, "max": 4},
                "lengthText": "1-4",
                "encoding": "decimal",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "check-digits",
                "name": {"es": "[Check Digits#]", "en": "[Check Digits#]"},
                "description": {"es": "Check digits.", "en": "Check digits."},
                "position": 2,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": False
            }
        ]
        resp_tables["akb"] = f18b_resp
        resp_tables["variant"] = f18b_resp

    if code == "33":
        if "IBM 3624 to IBM 3624" in title:
            for km_k in ["akb", "variant"]:
                if km_k in cmd_tables:
                    cmd_tables[km_k] = [f for f in cmd_tables[km_k] if f["id"] != "icv"]
        for km_k in ["akb", "variant"]:
            if km_k in resp_tables:
                subf_exists = any(f["id"] == "subformat" for f in resp_tables[km_k])
                if not subf_exists:
                    resp_tables[km_k].append({
                        "id": "subformat",
                        "name": {"es": "[Subformat#]", "en": "[Subformat#]"},
                        "description": {"es": "Echoed incoming/outgoing subformat indicator.", "en": "Echoed incoming/outgoing subformat indicator."},
                        "position": len(resp_tables[km_k]),
                        "length": {"kind": "set", "values": [1, 2]},
                        "lengthText": "1, 2",
                        "encoding": "alphanumeric",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    })

    if code == "35":
        for km_k in ["akb", "variant"]:
            if km_k in cmd_tables and len(cmd_tables[km_k]) >= 2:
                key_len = {"kind": "set", "values": [74, 106]} if km_k == "akb" else {"kind": "set", "values": [16, 32]}
                key_len_txt = "74, 106" if km_k == "akb" else "16, 32"
                key_enc = "ascii" if km_k == "akb" else "hex-ascii"
                cmd_tables[km_k] = [
                    cmd_tables[km_k][0],
                    cmd_tables[km_k][1],
                    {
                        "id": "pin-block-format",
                        "name": {"es": "PIN Block Format", "en": "PIN Block Format"},
                        "description": {"es": "PIN Block Format", "en": "PIN Block Format"},
                        "position": 2,
                        "length": {"kind": "fixed", "length": 1},
                        "lengthText": "1",
                        "encoding": "alphanumeric",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    },
                    {
                        "id": "incoming-pin-key",
                        "name": {"es": "Incoming PIN Key", "en": "Incoming PIN Key"},
                        "description": {"es": "Incoming PIN Key", "en": "Incoming PIN Key"},
                        "position": 3,
                        "length": key_len,
                        "lengthText": key_len_txt,
                        "encoding": key_enc,
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": True,
                        "sensitive": True
                    },
                    {
                        "id": "outgoing-pin-key",
                        "name": {"es": "Outgoing PIN Key", "en": "Outgoing PIN Key"},
                        "description": {"es": "Outgoing PIN Key", "en": "Outgoing PIN Key"},
                        "position": 4,
                        "length": key_len,
                        "lengthText": key_len_txt,
                        "encoding": key_enc,
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": True,
                        "sensitive": True
                    },
                    {
                        "id": "pin-block",
                        "name": {"es": "PIN Block", "en": "PIN Block"},
                        "description": {"es": "Incoming encrypted PIN block", "en": "Incoming encrypted PIN block"},
                        "position": 5,
                        "length": {"kind": "set", "values": [16, 18, 32]},
                        "lengthText": "16, 18, 32",
                        "encoding": "hex-ascii",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": True
                    },
                    {
                        "id": "account-number",
                        "name": {"es": "[Account Number#]", "en": "[Account Number#]"},
                        "description": {"es": "Account number / PAN", "en": "Account number / PAN"},
                        "position": 6,
                        "length": {"kind": "range", "min": 10, "max": 19},
                        "lengthText": "10 - 19",
                        "encoding": "alphanumeric",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    }
                ]

    if code == "37" and "Visa" in title:
        for km_k in ["akb", "variant"]:
            if km_k in cmd_tables:
                cmd_tables[km_k] = [f for f in cmd_tables[km_k] if f["id"] != "pin-verification-key2"]
                has_f6 = any(f["id"] in ["reserved", "pin-verification-key-right"] for f in cmd_tables[km_k])
                if not has_f6:
                    new_fields = []
                    for f in cmd_tables[km_k]:
                        if f["position"] < 5:
                            new_fields.append(f)
                        else:
                            f["position"] = f["position"] + 1
                            new_fields.append(f)
                    if km_k == "akb":
                        reserved_f = {
                            "id": "reserved",
                            "name": {"es": "[Reserved#]", "en": "[Reserved#]"},
                            "description": {"es": "Must be empty.", "en": "Must be empty."},
                            "position": 5,
                            "length": {"kind": "set", "values": [0]},
                            "lengthText": "0",
                            "encoding": "ascii",
                            "required": False,
                            "presence": "optional",
                            "allowsVolatileLocation": False,
                            "sensitive": False
                        }
                    else:
                        reserved_f = {
                            "id": "pin-verification-key-right",
                            "name": {"es": "[PIN Verification Key Right#]", "en": "[PIN Verification Key Right#]"},
                            "description": {"es": "The PIN Verification Key Right.", "en": "The PIN Verification Key Right."},
                            "position": 5,
                            "length": {"kind": "set", "values": [0, 16, 32]},
                            "lengthText": "0, 16, 32",
                            "encoding": "hex-ascii",
                            "required": False,
                            "presence": "optional",
                            "allowsVolatileLocation": False,
                            "sensitive": True
                        }
                    new_fields.insert(5, reserved_f)
                    cmd_tables[km_k] = new_fields
                for idx, f in enumerate(cmd_tables[km_k]):
                    f["position"] = idx

    if code == "D0":
        for km_k in ["akb", "variant"]:
            if km_k in cmd_tables and len(cmd_tables[km_k]) >= 2:
                key_len = {"kind": "set", "values": [74, 106]} if km_k == "akb" else {"kind": "set", "values": [16, 32]}
                key_len_txt = "74, 106" if km_k == "akb" else "16, 32"
                key_enc = "ascii" if km_k == "akb" else "hex-ascii"
                cmd_tables[km_k] = [
                    cmd_tables[km_k][0],
                    cmd_tables[km_k][1],
                    {
                        "id": "pin",
                        "name": {"es": "PIN", "en": "PIN"},
                        "description": {"es": "Clear PIN", "en": "Clear PIN"},
                        "position": 2,
                        "length": {"kind": "range", "min": 4, "max": 12},
                        "lengthText": "4 - 12",
                        "encoding": "decimal",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": True
                    },
                    {
                        "id": "reserved",
                        "name": {"es": "[Reserved#]", "en": "[Reserved#]"},
                        "description": {"es": "Must be empty", "en": "Must be empty"},
                        "position": 3,
                        "length": {"kind": "set", "values": [0]},
                        "lengthText": "0",
                        "encoding": "ascii",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    },
                    {
                        "id": "conversion-table",
                        "name": {"es": "[Conversion Table#]", "en": "[Conversion Table#]"},
                        "description": {"es": "Conversion Table in AKB or variant", "en": "Conversion Table in AKB or variant"},
                        "position": 4,
                        "length": {"kind": "set", "values": [0, 16, 32, 74, 106]},
                        "lengthText": "0, 16, 32, 74, 106",
                        "encoding": "ascii",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": True,
                        "sensitive": False
                    },
                    {
                        "id": "offset",
                        "name": {"es": "Offset", "en": "Offset"},
                        "description": {"es": "Offset", "en": "Offset"},
                        "position": 5,
                        "length": {"kind": "range", "min": 1, "max": 16},
                        "lengthText": "1 - 16",
                        "encoding": "alphanumeric",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    },
                    {
                        "id": "validation-data",
                        "name": {"es": "Validation Data", "en": "Validation Data"},
                        "description": {"es": "Validation Data", "en": "Validation Data"},
                        "position": 6,
                        "length": {"kind": "range", "min": 1, "max": 16},
                        "lengthText": "1 - 16",
                        "encoding": "alphanumeric",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    },
                    {
                        "id": "pad",
                        "name": {"es": "Pad", "en": "Pad"},
                        "description": {"es": "Pad character", "en": "Pad character"},
                        "position": 7,
                        "length": {"kind": "fixed", "length": 1},
                        "lengthText": "1",
                        "encoding": "alphanumeric",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    },
                    {
                        "id": "check-length",
                        "name": {"es": "Check Length", "en": "Check Length"},
                        "description": {"es": "Check length parameter", "en": "Check length parameter"},
                        "position": 8,
                        "length": {"kind": "range", "min": 1, "max": 2},
                        "lengthText": "1 - 2",
                        "encoding": "alphanumeric",
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    },
                    {
                        "id": "pin-verification-key",
                        "name": {"es": "PIN Verification Key", "en": "PIN Verification Key"},
                        "description": {"es": "PIN Verification Key", "en": "PIN Verification Key"},
                        "position": 9,
                        "length": key_len,
                        "lengthText": key_len_txt,
                        "encoding": key_enc,
                        "required": True,
                        "presence": "required",
                        "allowsVolatileLocation": True,
                        "sensitive": True
                    }
                ]

    if code == "159":
        f159_resp = [
            {
                "id": "offset",
                "name": {"es": "[Offset#]", "en": "[Offset#]"},
                "description": {"es": "Resulting offset value", "en": "Resulting offset value"},
                "position": 0,
                "length": {"kind": "set", "values": [0, 4, 5, 6, 7, 8, 9, 10, 11, 12]},
                "lengthText": "0, 4 - 12",
                "encoding": "alphanumeric",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "sanity-check-indicator",
                "name": {"es": "Sanity Check Indicator", "en": "Sanity Check Indicator"},
                "description": {"es": "Sanity check indicator", "en": "Sanity check indicator"},
                "position": 1,
                "length": {"kind": "fixed", "length": 1},
                "lengthText": "1",
                "encoding": "alphanumeric",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "pin-block",
                "name": {"es": "[PIN Block#]", "en": "[PIN Block#]"},
                "description": {"es": "Generated PIN block", "en": "Generated PIN block"},
                "position": 2,
                "length": {"kind": "set", "values": [16, 32]},
                "lengthText": "16, 32",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": True
            }
        ]
        resp_tables["akb"] = f159_resp
        resp_tables["variant"] = f159_resp

    if code == "182":
        f182_resp = [
            {
                "id": "mac-or-cryptogram",
                "name": {"es": "MAC / Cryptogram", "en": "MAC / Cryptogram"},
                "description": {"es": "MAC or Cryptogram", "en": "MAC or Cryptogram"},
                "position": 0,
                "length": {"kind": "set", "values": [8, 16, 32]},
                "lengthText": "8, 16, 32",
                "encoding": "hex-ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "check-digits-1",
                "name": {"es": "[Check Digits 1#]", "en": "[Check Digits 1#]"},
                "description": {"es": "Check digits 1", "en": "Check digits 1"},
                "position": 1,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "check-digits-2",
                "name": {"es": "[Check Digits 2#]", "en": "[Check Digits 2#]"},
                "description": {"es": "Check digits 2", "en": "Check digits 2"},
                "position": 2,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": False
            }
        ]
        resp_tables["akb"] = f182_resp
        resp_tables["variant"] = f182_resp

    if code == "189":
        f189_resp = [
            {
                "id": "status",
                "name": {"es": "Status", "en": "Status"},
                "description": {"es": "Verification Status", "en": "Verification Status"},
                "position": 0,
                "length": {"kind": "fixed", "length": 1},
                "lengthText": "1",
                "encoding": "alphanumeric",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "key-1",
                "name": {"es": "Key 1", "en": "Key 1"},
                "description": {"es": "Encrypted Key 1", "en": "Encrypted Key 1"},
                "position": 1,
                "length": {"kind": "set", "values": [16, 32, 74, 78, 106, 110]},
                "lengthText": "16 - 110",
                "encoding": "ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": True,
                "sensitive": True
            },
            {
                "id": "key-2",
                "name": {"es": "Key 2", "en": "Key 2"},
                "description": {"es": "Encrypted Key 2", "en": "Encrypted Key 2"},
                "position": 2,
                "length": {"kind": "set", "values": [16, 32, 74, 78, 106, 110]},
                "lengthText": "16 - 110",
                "encoding": "ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": True,
                "sensitive": True
            },
            {
                "id": "check-digits",
                "name": {"es": "[Check Digits#]", "en": "[Check Digits#]"},
                "description": {"es": "Check Digits", "en": "Check Digits"},
                "position": 3,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": False
            }
        ]
        resp_tables["akb"] = f189_resp
        resp_tables["variant"] = f189_resp

    if code == "18A":
        f18a_resp = [
            {
                "id": "component-1",
                "name": {"es": "Component 1", "en": "Component 1"},
                "description": {"es": "Component 1", "en": "Component 1"},
                "position": 0,
                "length": {"kind": "set", "values": [16, 32, 48, 64]},
                "lengthText": "16, 32, 48, 64",
                "encoding": "hex-ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": True
            },
            {
                "id": "check-digits-1",
                "name": {"es": "Check Digits 1", "en": "Check Digits 1"},
                "description": {"es": "Check Digits 1", "en": "Check Digits 1"},
                "position": 1,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "component-2",
                "name": {"es": "Component 2", "en": "Component 2"},
                "description": {"es": "Component 2", "en": "Component 2"},
                "position": 2,
                "length": {"kind": "set", "values": [16, 32, 48, 64]},
                "lengthText": "16, 32, 48, 64",
                "encoding": "hex-ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": True
            },
            {
                "id": "check-digits-2",
                "name": {"es": "Check Digits 2", "en": "Check Digits 2"},
                "description": {"es": "Check Digits 2", "en": "Check Digits 2"},
                "position": 3,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": True,
                "presence": "required",
                "allowsVolatileLocation": False,
                "sensitive": False
            },
            {
                "id": "component-3",
                "name": {"es": "[Component 3#]", "en": "[Component 3#]"},
                "description": {"es": "Component 3", "en": "Component 3"},
                "position": 4,
                "length": {"kind": "set", "values": [16, 32, 48, 64]},
                "lengthText": "16, 32, 48, 64",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": True
            },
            {
                "id": "check-digits-3",
                "name": {"es": "[Check Digits 3#]", "en": "[Check Digits 3#]"},
                "description": {"es": "Check Digits 3", "en": "Check Digits 3"},
                "position": 5,
                "length": {"kind": "set", "values": [4, 6, 8, 10]},
                "lengthText": "4, 6, 8, 10",
                "encoding": "hex-ascii",
                "required": False,
                "presence": "optional",
                "allowsVolatileLocation": False,
                "sensitive": False
            }
        ]
        resp_tables["akb"] = f18a_resp
        resp_tables["variant"] = f18a_resp

    if code == "3A":
        for km_k in ["akb", "variant"]:
            if km_k in cmd_tables:
                if len(cmd_tables[km_k]) in [11, 12, 13]:
                    cmd_tables[km_k].append({
                        "id": "key-serial-number",
                        "name": {"es": "[Key Serial Number#]", "en": "[Key Serial Number#]"},
                        "description": {"es": "The DUKPT Key Serial Number (KSN).", "en": "The DUKPT Key Serial Number (KSN)."},
                        "position": len(cmd_tables[km_k]),
                        "length": {"kind": "set", "values": [16, 20]},
                        "lengthText": "16, 20",
                        "encoding": "hex-ascii",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    })
                    cmd_tables[km_k].append({
                        "id": "dukpt-variant",
                        "name": {"es": "[DUKPT Variant#]", "en": "[DUKPT Variant#]"},
                        "description": {"es": "The DUKPT variant indicator.", "en": "The DUKPT variant indicator."},
                        "position": len(cmd_tables[km_k]),
                        "length": {"kind": "fixed", "length": 1},
                        "lengthText": "1",
                        "encoding": "alphanumeric",
                        "required": False,
                        "presence": "optional",
                        "allowsVolatileLocation": False,
                        "sensitive": False
                    })

    # 3.5 Usage Notes
    usage_notes = {"akb": [], "variant": []}
    un_match = re.search(r"\*\*Usage Notes\*\*\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)", sec_text)
    if un_match:
        for row in un_match.group(1).strip().split("\n"):
            cols = [c.strip() for c in row.split("|")[1:-1]]
            if len(cols) >= 2:
                if cols[0]: usage_notes["akb"].append({"es": cols[0], "en": cols[0]})
                if cols[1]: usage_notes["variant"].append({"es": cols[1], "en": cols[1]})

    # 3.6 Extract Real Examples from Blocks
    examples = []
    # Match examples with title
    ex_blocks = re.finditer(r"(?:####|###)\s*([^\n]+Example[^\n]*)\s*\n([\s\S]*?)(?=(?:####|###|\Z))", sec_text)
    for eb in ex_blocks:
        ex_title = eb.group(1).strip()
        eb_content = eb.group(2)
        # find frames
        m_frames = re.findall(r"```[^\n]*\n([^`]+)```", eb_content)
        for mf in m_frames:
            m_cut = re.search(r"<[^>]+>", mf.strip().replace("\r", "").replace("\n", "").replace("[CRLF]", ""))
            if not m_cut:
                continue
            cleaned_mf = m_cut.group(0)
            if cleaned_mf.endswith(">") and not cleaned_mf.endswith("#>") and "#" in cleaned_mf:
                cleaned_mf = cleaned_mf[:-1] + "#>"
            if cleaned_mf.startswith("<") and cleaned_mf.endswith(">") and "#" in cleaned_mf:
                examples.append({
                    "title": {"es": ex_title, "en": ex_title},
                    "raw": cleaned_mf,
                    "description": {"es": ex_title, "en": ex_title}
                })
                # record to oracle examples fixture
                f_code = cleaned_mf[1:].split("#")[0].upper()
                f_tokens = cleaned_mf[1:-1].split("#")
                if code == "00":
                    f_dir = "response" if len(f_tokens) > 2 else "request"
                    sec_code = code
                elif f_code == resp_code:
                    f_dir = "response"
                    sec_code = code
                elif f_code == code:
                    f_dir = "request"
                    sec_code = code
                else:
                    f_dir = "request"
                    sec_code = f_code
                mode = "akb" if "akb" in ex_title.lower() else "variant" if "variant" in ex_title.lower() else "auto"
                oracle_examples.append({
                    "sectionCode": sec_code,
                    "sectionTitle": title,
                    "subVariant": sub_variant,
                    "frame": cleaned_mf,
                    "direction": f_dir,
                    "mode": mode,
                    "title": ex_title
                })

    # Fallback default fields if table was empty
    default_cmd_fields = cmd_tables.get("akb") or cmd_tables.get("variant") or []
    default_resp_fields = resp_tables.get("akb") or resp_tables.get("variant") or []

    # Attach variants to fields when akb and/or variant modes exist
    def attach_variants(fields_dict, default_fields):
        akb_list = fields_dict.get("akb", [])
        var_list = fields_dict.get("variant", [])
        all_positions = set()
        for f in default_fields + akb_list + var_list:
            all_positions.add(f.get("position", 0))
        pos_variants = {}
        for pos in sorted(all_positions):
            akb_f = akb_list[pos] if pos < len(akb_list) else None
            var_f = var_list[pos] if pos < len(var_list) else None
            v_list = []
            if akb_f and var_f:
                if akb_f.get("length") == var_f.get("length") and akb_f.get("description", {}).get("en") == var_f.get("description", {}).get("en"):
                    v_list.append({
                        "mode": "both",
                        "lengthText": akb_f.get("lengthText") or var_f.get("lengthText") or "varies",
                        "length": akb_f["length"],
                        "description": akb_f["description"]
                    })
                else:
                    v_list.append({
                        "mode": "akb",
                        "lengthText": akb_f.get("lengthText") or "varies",
                        "length": akb_f["length"],
                        "description": akb_f["description"]
                    })
                    v_list.append({
                        "mode": "variant",
                        "lengthText": var_f.get("lengthText") or "varies",
                        "length": var_f["length"],
                        "description": var_f["description"]
                    })
            elif akb_f:
                v_list.append({
                    "mode": "akb",
                    "lengthText": akb_f.get("lengthText") or "varies",
                    "length": akb_f["length"],
                    "description": akb_f["description"]
                })
            elif var_f:
                v_list.append({
                    "mode": "variant",
                    "lengthText": var_f.get("lengthText") or "varies",
                    "length": var_f["length"],
                    "description": var_f["description"]
                })
            else:
                def_f = default_fields[pos] if pos < len(default_fields) else None
                if def_f:
                    v_list.append({
                        "mode": "both",
                        "lengthText": def_f.get("lengthText") or "varies",
                        "length": def_f["length"],
                        "description": def_f["description"]
                    })
            pos_variants[pos] = v_list
        for f in default_fields + akb_list + var_list:
            pos = f.get("position", 0)
            if pos in pos_variants and pos_variants[pos]:
                f["variants"] = pos_variants[pos]

    attach_variants(cmd_tables, default_cmd_fields)
    attach_variants(resp_tables, default_resp_fields)

    # Build Request Command Spec
    cmd_id_slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    req_id = f"atalla-{code.lower()}-{cmd_id_slug}-req"
    resp_id = f"atalla-{code.lower()}-{cmd_id_slug}-resp"
    if code == "BF":
        req_id = "atalla-bf-req"
        resp_id = "atalla-cf-res"

    # Category determination
    cat_name = "Key Management"
    if code in ["30", "31", "32", "33", "35", "36", "37", "39", "3A", "3D", "3E", "90"]:
        cat_name = "PIN Processing"
    elif code in ["55", "97", "146", "388", "390"]:
        cat_name = "Data Processing"
    elif code in ["58", "59", "5C", "98", "99", "304", "305", "348", "386", "39B", "39C"]:
        cat_name = "Data Authentication"
    elif code in ["5D", "5E", "35A", "35B", "35F", "359", "365", "36A"]:
        cat_name = "Card Authorization"
    elif code in ["BE", "BF", "131", "132", "178", "179", "17B", "185", "187", "18A", "18B", "18C", "350", "351", "352", "354", "356", "357", "3FC", "3FD", "3FE"]:
        cat_name = "EMV & Stored Value Cards"
    elif code in ["70", "71", "72", "73", "74", "7F"]:
        cat_name = "Volatile Table"
    elif code in ["120", "121", "122", "123", "124", "125", "126", "129", "12A", "12B", "12C", "12F", "130", "135", "136", "137", "138", "139", "140", "141", "142", "143", "147", "154", "155", "156", "157", "158", "15A", "15C", "15D"]:
        cat_name = "Asymmetric Cryptography"
    elif code in ["161", "162", "163", "16E", "16F"]:
        cat_name = "Printing Commands"
    elif code in ["00", "93", "94", "95", "96", "9A", "9B", "9D", "9E", "9F", "101", "102", "105", "106", "107", "108", "109", "1100", "1101", "1102", "1104", "1105", "1110", "1111", "1113", "1120", "1200", "1204", "1205", "1216", "1221", "1222", "1223", "1224", "1225", "1226", "1227", "1228", "1230", "1350", "1351"]:
        cat_name = "Diagnostics & Configuration"

    req_spec = {
        "id": req_id,
        "code": code,
        "direction": "request",
        "pairedCode": resp_code,
        "name": {"es": title, "en": title},
        "summary": {"es": title, "en": title},
        "description": {"es": title, "en": title},
        "category": {"es": cat_name, "en": cat_name},
        "syntax": cmd_syntax,
        "source": f"Utimaco Atalla AT1000 Command Reference Manual v8.60 ({code} - {title})",
        "fields": default_cmd_fields,
        "examples": examples,
        "markdownDoc": {"es": sec_text, "en": sec_text}
    }
    if sub_variant:
        req_spec["subVariant"] = {"es": sub_variant, "en": sub_variant}
    if discriminator:
        req_spec["discriminator"] = discriminator
    if km_matrix:
        req_spec["keyManagement"] = km_matrix
    if cmd_tables.get("akb") or cmd_tables.get("variant"):
        req_spec["fieldsByMode"] = {
            k: v for k, v in [("akb", cmd_tables.get("akb")), ("variant", cmd_tables.get("variant"))] if v
        }
    if usage_notes.get("akb") or usage_notes.get("variant"):
        req_spec["usageNotes"] = {
            k: v for k, v in [("akb", usage_notes.get("akb")), ("variant", usage_notes.get("variant"))] if v
        }

    all_commands.append(req_spec)

    # Build Response Command Spec
    resp_spec = {
        "id": resp_id,
        "code": resp_code,
        "direction": "response",
        "pairedCode": code,
        "name": {"es": f"Response to {title}", "en": f"Response to {title}"},
        "summary": {"es": f"HSM response for command {code} ({title})", "en": f"HSM response for command {code} ({title})"},
        "description": {"es": f"HSM response frame for command {code} ({title})", "en": f"HSM response frame for command {code} ({title})"},
        "category": {"es": cat_name, "en": cat_name},
        "syntax": resp_syntax,
        "source": f"Utimaco Atalla AT1000 Command Reference Manual v8.60 (Response {resp_code} for {code})",
        "fields": default_resp_fields,
        "markdownDoc": {"es": sec_text, "en": sec_text}
    }
    if sub_variant:
        resp_spec["subVariant"] = {"es": sub_variant, "en": sub_variant}
    if discriminator:
        if code in ["14", "15", "16", "31"]:
            resp_spec["discriminator"] = discriminator
        elif code == "9A":
            if "DIAGTEST" in title:
                resp_spec["discriminator"] = {
                    "fieldIndex": 0,
                    "match": "exact",
                    "values": ["OK"]
                }
            elif "Configuration" in title:
                resp_spec["discriminator"] = {
                    "fieldIndex": 1,
                    "match": discriminator["match"],
                    "values": discriminator["values"]
                }
            else:
                resp_spec["discriminator"] = {
                    "fieldIndex": 0,
                    "match": discriminator["match"],
                    "values": discriminator["values"]
                }
    if km_matrix:
        resp_spec["keyManagement"] = km_matrix
    if resp_tables.get("akb") or resp_tables.get("variant"):
        resp_spec["fieldsByMode"] = {
            k: v for k, v in [("akb", resp_tables.get("akb")), ("variant", resp_tables.get("variant"))] if v
        }

    all_commands.append(resp_spec)

print(f"Total compiled command specifications: {len(all_commands)} (248 requests + 248 responses)")
print(f"Total extracted real examples for golden corpus: {len(oracle_examples)}")

# Write Commands TS
os.makedirs(os.path.dirname(COMMANDS_OUT_TS), exist_ok=True)
with open(COMMANDS_OUT_TS, "w", encoding="utf-8") as f:
    f.write("/**\n")
    f.write(" * @packageDocumentation\n")
    f.write(" * Auto-generated Atalla AT1000 v8.60 Command Specifications.\n")
    f.write(" * Generated by scripts/atalla_spec_generator/generate.py\n")
    f.write(" */\n\n")
    f.write("import type { CommandSpec } from '@chci/parser-core';\n\n")
    f.write("export const atallaV860Commands: readonly CommandSpec[] = ")
    json.dump(all_commands, f, indent=2, ensure_ascii=False)
    f.write(";\n")

# Write Errors TS
with open(ERRORS_OUT_TS, "w", encoding="utf-8") as f:
    f.write("/**\n")
    f.write(" * @packageDocumentation\n")
    f.write(" * Official Utimaco Atalla AT1000 Error Code Specifications (Table 11-1 and Table 11-2).\n")
    f.write(" * Generated by scripts/atalla_spec_generator/generate.py\n")
    f.write(" */\n\n")
    f.write("import type { ErrorCodeSpec } from '@chci/parser-core';\n\n")
    f.write("export const ATALLA_ERROR_CODES_11_1: Readonly<Record<string, ErrorCodeSpec>> = {\n")
    for ecode, edesc in sorted(error_specs_11_1.items()):
        f.write(f'  "{ecode}": {{\n')
        f.write(f'    code: "{ecode}",\n')
        f.write(f'    title: {{ es: "{edesc}", en: "{edesc}" }},\n')
        f.write(f'    description: {{ es: "{edesc}", en: "{edesc}" }}\n')
        f.write("  },\n")
    f.write("};\n\n")
    f.write("export const ATALLA_DETAILED_ERRORS_11_2: Readonly<Record<string, string>> = ")
    json.dump(detailed_errors_11_2, f, indent=2, ensure_ascii=False)
    f.write(";\n")

# Write Fixture JSON
os.makedirs(os.path.dirname(EXAMPLES_JSON), exist_ok=True)
with open(EXAMPLES_JSON, "w", encoding="utf-8") as f:
    json.dump(oracle_examples, f, indent=2, ensure_ascii=False)

# Write Generator Report
with open(REPORT_MD, "w", encoding="utf-8") as f:
    f.write("# Atalla AT1000 v8.60 Specification Generation Report\n\n")
    f.write(f"- Total Sections Parsed: {len(matches)}\n")
    f.write(f"- Total Command Specs Created: {len(all_commands)}\n")
    f.write(f"- Total Golden Examples Extracted: {len(oracle_examples)}\n")
    f.write(f"- Table 11-1 Errors Extracted: {len(error_specs_11_1)}\n")
    f.write(f"- Table 11-2 Detailed Errors Extracted: {len(detailed_errors_11_2)}\n")

print("Specification generation finished successfully.")
