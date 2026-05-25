import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function importArtifactTool() {
  try {
    return await import("@oai/artifact-tool");
  } catch (error) {
    const moduleRoots = (process.env.NODE_PATH || "")
      .split(path.delimiter)
      .map((entry) => entry.trim())
      .filter(Boolean);
    for (const root of moduleRoots) {
      const candidate = path.join(root, "@oai", "artifact-tool", "dist", "artifact_tool.mjs");
      try {
        await fs.access(candidate);
        return await import(pathToFileURL(candidate).href);
      } catch {
        // Try the next configured module root.
      }
    }
    throw error;
  }
}

const { SpreadsheetFile, Workbook } = await importArtifactTool();

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(projectRoot, "docs", "D2_Monument_Archive_Damage_Update_Tracker.xlsx");
const ttkDataDir = path.join(projectRoot, "data", "static", "ttk");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }
  if (rows.length === 0) {
    return [];
  }
  const headers = rows.shift();
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function readCsvRecords(fileName) {
  try {
    const text = await fs.readFile(path.join(ttkDataDir, fileName), "utf8");
    return parseCsv(text);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function recordsToSheetRows(records, fields, limit) {
  return records.slice(0, limit).map((record) => fields.map((field) => record[field] ?? ""));
}

const [queueRecords, extractionRecords, ttkRecords] = await Promise.all([
  readCsvRecords("source_patch_notes.csv"),
  readCsvRecords("damage_extraction.csv"),
  readCsvRecords("ttk_candidates.csv"),
]);

const workbook = Workbook.create();

function setTitle(sheet, title, subtitle) {
  sheet.showGridLines = false;
  sheet.getRange("A1:H1").merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format = {
    fill: "#243B59",
    font: { bold: true, color: "#FFFFFF", size: 18 },
  };
  sheet.getRange("A2:H2").merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format = {
    fill: "#E9F1FB",
    font: { color: "#1D2430", italic: true },
    wrapText: true,
  };
}

function styleHeader(range) {
  range.format = {
    fill: "#0F766E",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
}

function styleInputHeader(range) {
  range.format = {
    fill: "#B7791F",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
}

const dashboard = workbook.worksheets.add("Dashboard");
const queue = workbook.worksheets.add("Patch Note Queue");
const extraction = workbook.worksheets.add("Damage Extraction");
const ttk = workbook.worksheets.add("PvP Potential");
const lists = workbook.worksheets.add("Lists");

// Lists sheet
lists.showGridLines = false;
lists.getRange("A1:E1").values = [["Status", "Article Type", "Scope", "Verification", "DB Apply"]];
styleHeader(lists.getRange("A1:E1"));
lists.getRange("A2:A8").values = [
  ["Backlog"],
  ["Needs Extraction"],
  ["Extracted"],
  ["Needs Verification"],
  ["Verified"],
  ["Applied"],
  ["Skipped"],
];
lists.getRange("B2:B7").values = [
  ["TWID"],
  ["Patch Notes"],
  ["Developer Insight"],
  ["Sandbox Preview"],
  ["Known Issues"],
  ["Other"],
];
lists.getRange("C2:C7").values = [
  ["PvP"],
  ["PvE"],
  ["Both"],
  ["Unknown"],
  ["Weapon"],
  ["Armor/Ability"],
];
lists.getRange("D2:D7").values = [
  ["Not Started"],
  ["Needs Source Check"],
  ["Needs Calculation"],
  ["Needs In-Game Test"],
  ["Verified"],
  ["Rejected"],
];
lists.getRange("E2:E5").values = [["No"], ["Ready"], ["Applied"], ["Skipped"]];
setWidths(lists, [180, 170, 130, 190, 120]);
lists.freezePanes.freezeRows(1);

// Dashboard sheet
setTitle(
  dashboard,
  "D2 Monument Archive - Damage Update Tracker",
  "Track Bungie weapon damage notes from newest to oldest, extract PvP-relevant changes, and promote verified rows into the PvP Potential DB."
);
dashboard.getRange("A4:B10").values = [
  ["Metric", "Value"],
  ["Patch notes in queue", ""],
  ["Needs extraction", ""],
  ["Damage rows extracted", ""],
  ["Needs verification", ""],
  ["Verified", ""],
  ["Applied to PvP Potential DB", ""],
];
styleHeader(dashboard.getRange("A4:B4"));
dashboard.getRange("B5:B10").formulas = [
  ['=COUNTA(\'Patch Note Queue\'!C6:C205)'],
  ['=COUNTIF(\'Patch Note Queue\'!B6:B205,"Needs Extraction")'],
  ['=COUNTA(\'Damage Extraction\'!E6:E305)'],
  ['=COUNTIF(\'Damage Extraction\'!B6:B305,"Needs Verification")'],
  ['=COUNTIF(\'Damage Extraction\'!B6:B305,"Verified")'],
  ['=COUNTIF(\'PvP Potential\'!Y6:Y305,"Applied")'],
];
dashboard.getRange("A12:H16").values = [
  ["Operating Notes", "", "", "", "", "", "", ""],
  ["1. Add Bungie news/patch-note URLs to Patch Note Queue from newest to oldest.", "", "", "", "", "", "", ""],
  ["2. Extract PvP damage changes into Damage Extraction with source row IDs.", "", "", "", "", "", "", ""],
  ["3. Promote rows with enough information into PvP Potential.", "", "", "", "", "", "", ""],
  ["4. Only rows marked Applied should be converted into data/static/ttk text DB files.", "", "", "", "", "", "", ""],
];
dashboard.getRange("A12:H12").merge();
dashboard.getRange("A13:H13").merge();
dashboard.getRange("A14:H14").merge();
dashboard.getRange("A15:H15").merge();
dashboard.getRange("A16:H16").merge();
styleInputHeader(dashboard.getRange("A12:H12"));
dashboard.getRange("A13:H16").format = { fill: "#FFF3D8", wrapText: true };
setWidths(dashboard, [230, 140, 120, 120, 120, 120, 120, 120]);

// Patch Note Queue
setTitle(
  queue,
  "Patch Note Queue",
  "One row per Bungie source. Sort by Source Date descending. Keep all source URLs official unless explicitly marked otherwise."
);
const queueHeaders = [
  "Source ID",
  "Status",
  "Source Date",
  "Article Type",
  "Title",
  "URL",
  "Sandbox Version",
  "Scope",
  "PvP Damage Mention?",
  "Weapons Mentioned",
  "Summary",
  "Extractor",
  "Last Checked",
  "Notes",
];
queue.getRange("A5:N5").values = [queueHeaders];
styleHeader(queue.getRange("A5:N5"));
const queueRows = recordsToSheetRows(
  queueRecords,
  [
    "source_id",
    "status",
    "source_date",
    "article_type",
    "title",
    "url",
    "sandbox_version",
    "scope",
    "pvp_damage_mention",
    "weapons_mentioned",
    "summary",
    "extractor",
    "last_checked",
    "notes",
  ],
  200
);
if (queueRows.length) {
  queue.getRangeByIndexes(5, 0, queueRows.length, queueHeaders.length).values = queueRows;
}
queue.tables.add("A5:N205", true, "PatchNoteQueue");
queue.freezePanes.freezeRows(5);
setWidths(queue, [150, 150, 120, 140, 280, 360, 160, 100, 150, 220, 360, 110, 120, 280]);
queue.getRange("B6:B205").dataValidation = { rule: { type: "list", formula1: "Lists!$A$2:$A$8" } };
queue.getRange("D6:D205").dataValidation = { rule: { type: "list", formula1: "Lists!$B$2:$B$7" } };
queue.getRange("H6:H205").dataValidation = { rule: { type: "list", formula1: "Lists!$C$2:$C$7" } };
queue.getRange("I6:I205").dataValidation = { rule: { type: "list", values: ["Yes", "No", "Unclear"] } };
queue.getRange("C6:C205").setNumberFormat("yyyy-mm-dd");
queue.getRange("M6:M205").setNumberFormat("yyyy-mm-dd");
queue.getRange("A6:N205").format = { wrapText: true };

// Damage Extraction
setTitle(
  extraction,
  "Damage Extraction",
  "Extract PvP-relevant weapon damage changes. Keep claims source-linked and mark uncertainty honestly."
);
const extractionHeaders = [
  "Extraction ID",
  "Status",
  "Source ID",
  "Source Date",
  "Weapon / Archetype",
  "Weapon Hash",
  "Weapon Type",
  "Scope",
  "Change Type",
  "Old Body",
  "New Body",
  "Body Delta %",
  "Old Crit",
  "New Crit",
  "Crit Delta %",
  "RPM",
  "Burst Count",
  "Charge/Draw ms",
  "PvP Only?",
  "Raw Bungie Text / Paraphrase",
  "Assumptions",
  "Verification",
  "Notes",
];
extraction.getRange("A5:W5").values = [extractionHeaders];
styleHeader(extraction.getRange("A5:W5"));
const extractionRows = recordsToSheetRows(
  extractionRecords,
  [
    "extraction_id",
    "status",
    "source_id",
    "source_date",
    "weapon_or_archetype",
    "weapon_hash",
    "weapon_type",
    "scope",
    "change_type",
    "old_body",
    "new_body",
    "body_delta_pct",
    "old_crit",
    "new_crit",
    "crit_delta_pct",
    "rpm",
    "burst_count",
    "charge_draw_ms",
    "pvp_only",
    "raw_bungie_text_or_paraphrase",
    "assumptions",
    "verification",
    "notes",
  ],
  300
);
if (extractionRows.length) {
  extraction.getRangeByIndexes(5, 0, extractionRows.length, extractionHeaders.length).values = extractionRows;
}
extraction.getRange("L6").formulas = [["=IF(OR(J6=\"\",J6=0,K6=\"\"),\"\",K6/J6-1)"]];
extraction.getRange("O6").formulas = [["=IF(OR(M6=\"\",M6=0,N6=\"\"),\"\",N6/M6-1)"]];
extraction.getRange("L6:L305").fillDown();
extraction.getRange("O6:O305").fillDown();
extraction.tables.add("A5:W305", true, "DamageExtraction");
extraction.freezePanes.freezeRows(5);
extraction.freezePanes.freezeColumns(4);
setWidths(extraction, [130, 150, 150, 115, 230, 120, 140, 90, 150, 95, 95, 110, 95, 95, 110, 80, 90, 115, 95, 380, 280, 170, 280]);
extraction.getRange("B6:B305").dataValidation = { rule: { type: "list", formula1: "Lists!$A$2:$A$8" } };
extraction.getRange("H6:H305").dataValidation = { rule: { type: "list", formula1: "Lists!$C$2:$C$7" } };
extraction.getRange("S6:S305").dataValidation = { rule: { type: "list", values: ["Yes", "No", "Unclear"] } };
extraction.getRange("V6:V305").dataValidation = { rule: { type: "list", formula1: "Lists!$D$2:$D$7" } };
extraction.getRange("D6:D305").setNumberFormat("yyyy-mm-dd");
extraction.getRange("L6:L305").setNumberFormat("0.0%");
extraction.getRange("O6:O305").setNumberFormat("0.0%");
extraction.getRange("A6:W305").format = { wrapText: true };

// PvP Potential
setTitle(
  ttk,
  "PvP Potential",
  "Convert verified damage rows into candidate PvP Potential rows. Formula TTK is only valid for simple single-shot RPM weapons."
);
const ttkHeaders = [
  "Potential ID",
  "Source Extraction ID",
  "Sandbox Version",
  "Weapon Hash",
  "Weapon / Archetype",
  "Mode",
  "Resilience Tier",
  "Target HP",
  "WP",
  "WP Max Bonus %",
  "WP Bonus %",
  "Precision Damage",
  "Body Damage",
  "Effective Precision Damage",
  "Effective Body Damage",
  "RPM",
  "Burst Count",
  "Crits to Kill",
  "Body Shots to Kill",
  "Optimal TTK ms",
  "BS TTK ms",
  "BS Forgiveness Count",
  "BS Forgiveness %",
  "Formula Confidence",
  "DB Apply",
  "Conditions",
  "Notes",
];
ttk.getRange("A5:AA5").values = [ttkHeaders];
styleHeader(ttk.getRange("A5:AA5"));
const ttkRows = recordsToSheetRows(
  ttkRecords,
  [
    "ttk_id",
    "source_extraction_id",
    "sandbox_version",
    "weapon_hash",
    "weapon_or_archetype",
    "mode",
    "resilience_tier",
    "target_hp",
    "weapon_parameter",
    "wp_max_bonus_pct",
    "wp_bonus_pct",
    "crit_damage",
    "body_damage",
    "effective_crit_damage",
    "effective_body_damage",
    "rpm",
    "burst_count",
    "crit_required",
    "body_required",
    "optimal_ttk_ms",
    "body_ttk_ms",
    "body_forgiveness_count",
    "body_forgiveness_pct",
    "formula_confidence",
    "db_apply",
    "conditions",
    "notes",
  ],
  300
);
if (ttkRows.length) {
  ttk.getRangeByIndexes(5, 0, ttkRows.length, ttkHeaders.length).values = ttkRows;
}
ttk.getRange("K6").formulas = [["=IF(OR(I6=\"\",J6=\"\"),\"\",MAX(0,MIN(I6,200)-100)/100*J6)"]];
ttk.getRange("N6").formulas = [["=IF(L6=\"\",\"\",ROUND(L6*(1+IF(K6=\"\",0,K6)),3))"]];
ttk.getRange("O6").formulas = [["=IF(M6=\"\",\"\",ROUND(M6*(1+IF(K6=\"\",0,K6)),3))"]];
ttk.getRange("R6").formulas = [["=IF(OR(H6=\"\",N6=\"\",N6=0),\"\",ROUNDUP(H6/N6,0))"]];
ttk.getRange("S6").formulas = [["=IF(OR(H6=\"\",O6=\"\",O6=0),\"\",ROUNDUP(H6/O6,0))"]];
ttk.getRange("T6").formulas = [["=IF(OR(P6=\"\",P6=0,R6=\"\"),\"\",ROUND((R6-1)*60000/P6,0))"]];
ttk.getRange("U6").formulas = [["=IF(OR(P6=\"\",P6=0,S6=\"\"),\"\",ROUND((S6-1)*60000/P6,0))"]];
ttk.getRange("V6").formulas = [["=IF(OR(N6=\"\",O6=\"\",H6=\"\",R6=\"\",N6<=O6),\"\",MAX(0,MIN(R6,INT((R6*N6-H6)/(N6-O6)))))"]];
ttk.getRange("W6").formulas = [["=IF(OR(V6=\"\",R6=\"\",R6=0),\"\",V6/R6)"]];
ttk.getRange("K6:K305").fillDown();
ttk.getRange("N6:O305").fillDown();
ttk.getRange("R6:W305").fillDown();
ttk.tables.add("A5:AA305", true, "PvPPotentialCandidates");
ttk.freezePanes.freezeRows(5);
ttk.freezePanes.freezeColumns(5);
setWidths(ttk, [120, 150, 155, 120, 240, 90, 110, 95, 75, 120, 105, 120, 110, 145, 135, 80, 90, 105, 130, 115, 100, 135, 120, 170, 100, 300, 260]);
ttk.getRange("F6:F305").dataValidation = { rule: { type: "list", values: ["PvP", "PvE", "Both"] } };
ttk.getRange("G6:G305").dataValidation = { rule: { type: "whole", operator: "between", formula1: 0, formula2: 10 } };
ttk.getRange("J6:K305").setNumberFormat("0.0%");
ttk.getRange("W6:W305").setNumberFormat("0.0%");
ttk.getRange("X6:X305").dataValidation = { rule: { type: "list", formula1: "Lists!$D$2:$D$7" } };
ttk.getRange("Y6:Y305").dataValidation = { rule: { type: "list", formula1: "Lists!$E$2:$E$5" } };
ttk.getRange("A6:AA305").format = { wrapText: true };

const sheets = [dashboard, queue, extraction, ttk, lists];
for (const sheet of sheets) {
  const used = sheet.getUsedRange();
  if (used) {
    used.format.font = { name: "Aptos", size: 10 };
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });

const overview = await workbook.inspect({
  kind: "sheet,table",
  maxChars: 4000,
  tableMaxRows: 4,
  tableMaxCols: 8,
});
console.log(overview.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["Dashboard", "Patch Note Queue", "Damage Extraction", "PvP Potential"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const previewPath = path.join(projectRoot, "tmp", `${sheetName.replace(/[^A-Za-z0-9]+/g, "_")}.png`);
  await fs.mkdir(path.dirname(previewPath), { recursive: true });
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
  console.log(`rendered ${sheetName}`);
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`saved ${outputPath}`);
