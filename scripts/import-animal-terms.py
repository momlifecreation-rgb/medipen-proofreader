"""Import workbook cells as reviewable JSON; no spreadsheet macros are executed."""
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
with zipfile.ZipFile(sys.argv[1]) as archive:
    strings = ["".join(e.itertext()) for e in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", ns)]
    sheets = []
    names = [s.get("name") for s in ET.fromstring(archive.read("xl/workbook.xml")).findall("m:sheets/m:sheet", ns)]
    for i, name in enumerate(names, 1):
        rows = []
        for row in ET.fromstring(archive.read(f"xl/worksheets/sheet{i}.xml")).findall(".//m:sheetData/m:row", ns):
            cells = {}
            for cell in row.findall("m:c", ns):
                value = cell.find("m:v", ns)
                if value is not None and value.text:
                    cells[''.join(c for c in cell.get("r") if c.isalpha())] = strings[int(value.text)] if cell.get("t") == "s" else value.text
            if cells:
                rows.append({"row": int(row.get("r")), **cells})
        sheets.append({"name": name, "rows": rows})
Path("src/data/animalMedicalWorkbook.json").write_text(json.dumps(sheets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
