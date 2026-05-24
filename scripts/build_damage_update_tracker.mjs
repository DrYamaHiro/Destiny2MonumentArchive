import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(projectRoot, "docs", "D2_Monument_Archive_Damage_Update_Tracker.xlsx");

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
const ttk = workbook.worksheets.add("TTK Candidates");
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
  "Track Bungie weapon damage notes from newest to oldest, extract PvP-relevant changes, and promote verified rows into the TTK DB."
);
dashboard.getRange("A4:B10").values = [
  ["Metric", "Value"],
  ["Patch notes in queue", ""],
  ["Needs extraction", ""],
  ["Damage rows extracted", ""],
  ["Needs verification", ""],
  ["Verified", ""],
  ["Applied to TTK DB", ""],
];
styleHeader(dashboard.getRange("A4:B4"));
dashboard.getRange("B5:B10").formulas = [
  ['=COUNTA(\'Patch Note Queue\'!C6:C205)'],
  ['=COUNTIF(\'Patch Note Queue\'!B6:B205,"Needs Extraction")'],
  ['=COUNTA(\'Damage Extraction\'!E6:E305)'],
  ['=COUNTIF(\'Damage Extraction\'!B6:B305,"Needs Verification")'],
  ['=COUNTIF(\'Damage Extraction\'!B6:B305,"Verified")'],
  ['=COUNTIF(\'TTK Candidates\'!Q6:Q305,"Applied")'],
];
dashboard.getRange("A12:H16").values = [
  ["Operating Notes", "", "", "", "", "", "", ""],
  ["1. Add Bungie news/patch-note URLs to Patch Note Queue from newest to oldest.", "", "", "", "", "", "", ""],
  ["2. Extract PvP damage changes into Damage Extraction with source row IDs.", "", "", "", "", "", "", ""],
  ["3. Promote rows with enough information into TTK Candidates.", "", "", "", "", "", "", ""],
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
const queueExamples = [
  [
    "SRC-2026-06-09-001",
    "Backlog",
    "2026-06-09",
    "Patch Notes",
    "Monument of Triumph launch notes",
    "TBD",
    "post-2026-06-09",
    "Both",
    "",
    "",
    "Replace with official Bungie source after final update.",
    "",
    "",
    "",
  ],
  [
    "SRC-2026-05-21-001",
    "Needs Extraction",
    "2026-05-21",
    "TWID",
    "Destiny 2: Every End is a New Beginning",
    "https://www.bungie.net/7/en/News/Article/d2_may_21_2026",
    "pre-2026-06-09",
    "Both",
    "No",
    "",
    "Known final-update planning source; use mainly for timeline/context.",
    "",
    "2026-05-25",
    "",
  ],
];
queue.getRange("A6:N7").values = queueExamples;
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
extraction.getRange("A6:W6").values = [[
  "DMG-0001",
  "Needs Verification",
  "SRC-2026-06-09-001",
  "2026-06-09",
  "Example adaptive hand cannon",
  "",
  "Hand Cannon",
  "PvP",
  "Damage scalar",
  0,
  0,
  "",
  0,
  0,
  "",
  140,
  1,
  "",
  "Yes",
  "Example row. Replace with source-backed Bungie wording.",
  "Manual verification required.",
  "Needs Calculation",
  "",
]];
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

// TTK Candidates
setTitle(
  ttk,
  "TTK Candidates",
  "Convert verified damage rows into candidate TTK DB rows. Formula TTK is only valid for simple single-shot RPM weapons."
);
const ttkHeaders = [
  "TTK ID",
  "Source Extraction ID",
  "Sandbox Version",
  "Weapon Hash",
  "Weapon / Archetype",
  "Mode",
  "Resilience Tier",
  "Crit Damage",
  "Body Damage",
  "RPM",
  "Burst Count",
  "Crit Required",
  "Body Required",
  "Optimal TTK ms",
  "Body TTK ms",
  "Formula Confidence",
  "DB Apply",
  "Conditions",
  "Notes",
];
ttk.getRange("A5:S5").values = [ttkHeaders];
styleHeader(ttk.getRange("A5:S5"));
ttk.getRange("A6:S6").values = [[
  "TTK-0001",
  "DMG-0001",
  "post-2026-06-09",
  "",
  "Example adaptive hand cannon",
  "PvP",
  7,
  "",
  "",
  140,
  1,
  "",
  "",
  "",
  "",
  "Needs Verification",
  "No",
  "Simple RPM formula only; manual review required.",
  "",
]];
ttk.getRange("N6").formulas = [["=IF(OR(J6=\"\",J6=0,L6=\"\"),\"\",ROUND((L6-1)*60000/J6,0))"]];
ttk.getRange("O6").formulas = [["=IF(OR(J6=\"\",J6=0,M6=\"\"),\"\",ROUND((M6-1)*60000/J6,0))"]];
ttk.getRange("N6:O305").fillDown();
ttk.tables.add("A5:S305", true, "TTKCandidates");
ttk.freezePanes.freezeRows(5);
ttk.freezePanes.freezeColumns(5);
setWidths(ttk, [120, 150, 155, 120, 240, 90, 110, 100, 100, 80, 90, 110, 110, 115, 115, 170, 100, 300, 260]);
ttk.getRange("F6:F305").dataValidation = { rule: { type: "list", values: ["PvP", "PvE", "Both"] } };
ttk.getRange("G6:G305").dataValidation = { rule: { type: "whole", operator: "between", formula1: 0, formula2: 10 } };
ttk.getRange("P6:P305").dataValidation = { rule: { type: "list", formula1: "Lists!$D$2:$D$7" } };
ttk.getRange("Q6:Q305").dataValidation = { rule: { type: "list", formula1: "Lists!$E$2:$E$5" } };
ttk.getRange("A6:S305").format = { wrapText: true };

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

for (const sheetName of ["Dashboard", "Patch Note Queue", "Damage Extraction", "TTK Candidates"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const previewPath = path.join(projectRoot, "tmp", `${sheetName.replace(/[^A-Za-z0-9]+/g, "_")}.png`);
  await fs.mkdir(path.dirname(previewPath), { recursive: true });
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
  console.log(`rendered ${sheetName}`);
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`saved ${outputPath}`);
