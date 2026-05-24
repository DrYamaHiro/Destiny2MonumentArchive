const LIMIT = 250;

const state = {
  lang: localStorage.getItem("d2ma-lang") || "ja",
  view: "weapons",
  sort: "name",
  data: {},
  selectedHash: null,
};

const text = {
  ja: {
    title: "静的DB",
    manifest: "Manifest",
    synced: "同期",
    loading: "読み込み中",
    search: "検索",
    searchPlaceholder: "名前、タイプ、Hash",
    type: "タイプ",
    ammo: "弾薬",
    class: "クラス",
    slot: "部位",
    sort: "並び替え",
    reset: "リセット",
    all: "すべて",
    tabWeapons: "武器",
    tabArmor: "エキゾ防具",
    tabTtk: "TTK",
    results: "件",
    showing: "表示",
    noRows: "一致なし",
    item: "項目",
    name: "名前",
    range: "射程",
    stat: "数値",
    stats: "主要ステータス",
    metadata: "メタデータ",
    sourceStatus: "出典/状態",
    hash: "Hash",
    bucket: "スロット",
    rarity: "レアリティ",
    categories: "カテゴリ",
    plugSets: "Plug sets",
    weapons: "武器",
    exoticArmor: "エキゾ防具",
    topType: "最多タイプ",
    topClass: "最多クラス",
    textOnly: "テキストDB",
    ttk: "TTK",
    ttkBody: "TTKはBungie更新情報と検証台帳から順次反映します。Manifestだけでは確定しません。",
    notReady: "未反映",
    sortName: "名前",
    sortType: "タイプ",
    sortRange: "射程",
    sortImpact: "威力",
    sortRpm: "RPM",
    sortClass: "クラス",
  },
  en: {
    title: "Static DB",
    manifest: "Manifest",
    synced: "Synced",
    loading: "Loading",
    search: "Search",
    searchPlaceholder: "Name, type, hash",
    type: "Type",
    ammo: "Ammo",
    class: "Class",
    slot: "Slot",
    sort: "Sort",
    reset: "Reset",
    all: "All",
    tabWeapons: "Weapons",
    tabArmor: "Exotic Armor",
    tabTtk: "TTK",
    results: "results",
    showing: "Showing",
    noRows: "No matches",
    item: "Item",
    name: "Name",
    range: "Range",
    stat: "Stat",
    stats: "Core Stats",
    metadata: "Metadata",
    sourceStatus: "Source/Status",
    hash: "Hash",
    bucket: "Slot",
    rarity: "Rarity",
    categories: "Categories",
    plugSets: "Plug sets",
    weapons: "Weapons",
    exoticArmor: "Exotic armor",
    topType: "Top type",
    topClass: "Top class",
    textOnly: "Text DB",
    ttk: "TTK",
    ttkBody: "TTK will be filled from Bungie updates and verification tracking. It cannot be finalized from Manifest alone.",
    notReady: "Not applied",
    sortName: "Name",
    sortType: "Type",
    sortRange: "Range",
    sortImpact: "Impact",
    sortRpm: "RPM",
    sortClass: "Class",
  },
};

const statLabels = {
  ja: {
    impact: "威力",
    range: "射程距離",
    stability: "安定性",
    handling: "ハンドリング",
    reload: "リロード",
    aimAssist: "照準補佐",
    zoom: "ズーム",
    recoil: "反動方向",
    rpm: "RPM",
    magazine: "マガジン",
    blastRadius: "爆発範囲",
    velocity: "速度",
    chargeTime: "チャージ時間",
    drawTime: "ドロー時間",
    accuracy: "命中精度",
    airborne: "空中効果",
    defense: "防御",
    health: "体力",
  },
  en: {
    impact: "Impact",
    range: "Range",
    stability: "Stability",
    handling: "Handling",
    reload: "Reload",
    aimAssist: "Aim Assist",
    zoom: "Zoom",
    recoil: "Recoil",
    rpm: "RPM",
    magazine: "Magazine",
    blastRadius: "Blast Radius",
    velocity: "Velocity",
    chargeTime: "Charge Time",
    drawTime: "Draw Time",
    accuracy: "Accuracy",
    airborne: "Airborne",
    defense: "Defense",
    health: "Health",
  },
};

const els = {
  pageTitle: document.getElementById("pageTitle"),
  manifestMeta: document.getElementById("manifestMeta"),
  langJa: document.getElementById("langJa"),
  langEn: document.getElementById("langEn"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  summaryBand: document.getElementById("summaryBand"),
  searchLabel: document.getElementById("searchLabel"),
  searchInput: document.getElementById("searchInput"),
  clearButton: document.getElementById("clearButton"),
  filterPrimaryLabel: document.getElementById("filterPrimaryLabel"),
  filterSecondaryLabel: document.getElementById("filterSecondaryLabel"),
  sortLabel: document.getElementById("sortLabel"),
  primaryFilter: document.getElementById("primaryFilter"),
  secondaryFilter: document.getElementById("secondaryFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resultStatus: document.getElementById("resultStatus"),
  activeFilterLabel: document.getElementById("activeFilterLabel"),
  columnHead: document.getElementById("columnHead"),
  results: document.getElementById("results"),
  detail: document.getElementById("detail"),
};

function t(key) {
  return text[state.lang][key] || text.en[key] || key;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function number(value) {
  return new Intl.NumberFormat(state.lang === "ja" ? "ja-JP" : "en-US").format(value || 0);
}

function shortVersion(value) {
  if (!value) return "";
  return String(value).split("-")[0];
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

async function ensureData() {
  if (!state.data.index) {
    state.data.index = await loadJson("./data/index.json");
  }
  if (!state.data[state.lang]) {
    const [weapons, armor, facets, summary] = await Promise.all([
      loadJson(`./data/weapons.${state.lang}.json`),
      loadJson(`./data/exotic_armor.${state.lang}.json`),
      loadJson(`./data/facets.${state.lang}.json`),
      loadJson(`./data/summary.${state.lang}.json`),
    ]);
    state.data[state.lang] = { weapons, armor, facets, summary };
  }
}

function currentRows() {
  const langData = state.data[state.lang];
  if (!langData) return [];
  if (state.view === "armor") return langData.armor;
  if (state.view === "ttk") return [];
  return langData.weapons;
}

function rowPrimary(row) {
  return state.view === "armor" ? row.class : row.type;
}

function rowSecondary(row) {
  return state.view === "armor" ? row.type : row.ammo;
}

function defaultSort(view = state.view) {
  return view === "armor" ? "class" : "name";
}

function displayValue(value) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

function distinct(rows, getter) {
  return [...new Set(rows.map(getter).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("d2ma-lang", lang);
  document.documentElement.lang = lang;
  els.langJa.setAttribute("aria-pressed", String(lang === "ja"));
  els.langEn.setAttribute("aria-pressed", String(lang === "en"));
  refresh();
}

function setView(view) {
  state.view = view;
  state.selectedHash = null;
  state.sort = defaultSort(view);
  els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === view));
  clearFilters(false);
  refresh();
}

function clearFilters(render = true) {
  els.searchInput.value = "";
  els.primaryFilter.value = "";
  els.secondaryFilter.value = "";
  state.sort = defaultSort();
  if (els.sortSelect) els.sortSelect.value = state.sort;
  if (render) renderList();
}

function populateSelect(select, values, labelAll) {
  const selected = select.value;
  select.innerHTML = `<option value="">${esc(labelAll)}</option>${values
    .map((value) => `<option value="${esc(value)}">${esc(value)}</option>`)
    .join("")}`;
  if (values.includes(selected)) select.value = selected;
}

function sortOptions() {
  if (state.view === "armor") {
    return [
      ["class", t("sortClass")],
      ["name", t("sortName")],
      ["type", t("sortType")],
    ];
  }
  return [
    ["name", t("sortName")],
    ["type", t("sortType")],
    ["range", t("sortRange")],
    ["impact", t("sortImpact")],
    ["rpm", t("sortRpm")],
  ];
}

function updateLabels() {
  els.pageTitle.textContent = t("title");
  els.searchLabel.textContent = t("search");
  els.searchInput.placeholder = t("searchPlaceholder");
  els.clearButton.textContent = t("reset");
  els.filterPrimaryLabel.textContent = state.view === "armor" ? t("class") : t("type");
  els.filterSecondaryLabel.textContent = state.view === "armor" ? t("slot") : t("ammo");
  els.sortLabel.textContent = t("sort");
  els.tabs.forEach((tab) => {
    if (tab.dataset.view === "weapons") tab.textContent = t("tabWeapons");
    if (tab.dataset.view === "armor") tab.textContent = t("tabArmor");
    if (tab.dataset.view === "ttk") tab.textContent = t("tabTtk");
  });

  if (state.data.index) {
    els.manifestMeta.textContent = `${t("manifest")} ${shortVersion(state.data.index.manifestVersion)} / ${t("synced")} ${state.data.index.sourceSyncedAt}`;
  }
}

function updateSummary() {
  const langData = state.data[state.lang];
  if (!langData) {
    els.summaryBand.innerHTML = "";
    return;
  }
  const summary = langData.summary;
  const topType = summary.weaponTypes?.[0];
  const topClass = summary.armorClasses?.[0];
  const topAmmo = summary.ammo?.[0];
  const metrics = [
    [t("weapons"), number(summary.weaponCount), topType ? `${topType.label} ${number(topType.count)}` : ""],
    [t("exoticArmor"), number(summary.exoticArmorCount), topClass ? `${topClass.label} ${number(topClass.count)}` : ""],
    [state.view === "armor" ? t("topClass") : t("topType"), state.view === "armor" ? (topClass?.label || "") : (topType?.label || ""), state.view === "armor" ? `${number(topClass?.count)} ${t("results")}` : `${number(topType?.count)} ${t("results")}`],
    [t("textOnly"), "JSON / CSV", topAmmo ? `${topAmmo.label} ${number(topAmmo.count)}` : shortVersion(summary.manifestVersion)],
  ];

  els.summaryBand.innerHTML = metrics
    .map(([label, value, sub]) => `
      <div class="metric">
        <span class="metric-label">${esc(label)}</span>
        <span class="metric-value">${esc(value)}</span>
        <span class="metric-sub">${esc(sub)}</span>
      </div>
    `)
    .join("");
}

function updateControls() {
  const rows = currentRows();
  const isTtk = state.view === "ttk";
  els.searchInput.disabled = isTtk;
  els.primaryFilter.disabled = isTtk;
  els.secondaryFilter.disabled = isTtk;
  els.sortSelect.disabled = isTtk;
  els.clearButton.disabled = isTtk;

  populateSelect(els.primaryFilter, isTtk ? [] : distinct(rows, rowPrimary), t("all"));
  populateSelect(els.secondaryFilter, isTtk ? [] : distinct(rows, rowSecondary), t("all"));

  const options = sortOptions();
  els.sortSelect.innerHTML = options.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("");
  if (options.some(([value]) => value === state.sort)) els.sortSelect.value = state.sort;
}

function applyFilters(rows) {
  const query = els.searchInput.value.trim().toLowerCase();
  const primary = els.primaryFilter.value;
  const secondary = els.secondaryFilter.value;
  return rows
    .filter((row) => !query || row.search.includes(query) || String(row.hash).includes(query))
    .filter((row) => !primary || rowPrimary(row) === primary)
    .filter((row) => !secondary || rowSecondary(row) === secondary);
}

function sortRows(rows) {
  const sorted = [...rows];
  const sort = state.sort;
  sorted.sort((a, b) => {
    if (sort === "range" || sort === "impact" || sort === "rpm") {
      return Number(b.stats?.[sort] || b[sort] || 0) - Number(a.stats?.[sort] || a[sort] || 0) || String(a.name).localeCompare(String(b.name));
    }
    if (sort === "class") {
      return String(a.class || "").localeCompare(String(b.class || "")) || String(a.type || "").localeCompare(String(b.type || "")) || String(a.name).localeCompare(String(b.name));
    }
    if (sort === "type") {
      return String(a.type || "").localeCompare(String(b.type || "")) || String(a.name).localeCompare(String(b.name));
    }
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
  return sorted;
}

function listRows() {
  return sortRows(applyFilters(currentRows()));
}

function renderColumnHead() {
  if (state.view === "ttk") {
    els.columnHead.innerHTML = "";
    return;
  }
  const cells = state.view === "armor"
    ? ["", t("name"), t("class"), t("slot"), t("stat")]
    : ["", t("name"), t("type"), t("ammo"), t("range")];
  els.columnHead.innerHTML = cells.map((cell) => `<span>${esc(cell)}</span>`).join("");
}

function statValue(row, key) {
  return row.stats?.[key] ?? row[key] ?? "";
}

function statPercent(row, key) {
  const value = Number(statValue(row, key) || 0);
  const max = key === "rpm" || key === "chargeTime" || key === "drawTime" ? 1000 : key === "magazine" ? 120 : 100;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function renderList() {
  if (state.view === "ttk") {
    els.resultStatus.textContent = t("notReady");
    els.activeFilterLabel.textContent = "";
    els.results.innerHTML = "";
    renderColumnHead();
    renderTtkDetail();
    return;
  }

  const all = listRows();
  const visible = all.slice(0, LIMIT);
  els.resultStatus.textContent = `${number(all.length)} ${t("results")}`;
  els.activeFilterLabel.textContent = all.length > LIMIT ? `${t("showing")} ${number(LIMIT)}` : "";
  renderColumnHead();

  if (!visible.length) {
    state.selectedHash = null;
    els.results.innerHTML = `<div class="result-head">${esc(t("noRows"))}</div>`;
    renderEmpty();
    return;
  }

  if (!state.selectedHash || !visible.some((row) => row.hash === state.selectedHash)) {
    state.selectedHash = visible[0].hash;
  }

  els.results.innerHTML = visible.map(renderResultRow).join("");
  els.results.querySelectorAll(".result-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedHash = Number(button.dataset.hash);
      renderList();
    });
  });
  renderDetail(visible.find((row) => row.hash === state.selectedHash));
}

function renderResultRow(row) {
  const selected = row.hash === state.selectedHash ? " is-selected" : "";
  const mainSub = state.view === "armor"
    ? [row.class, row.type, row.bucket].filter(Boolean).join(" / ")
    : [row.bucket, row.tier].filter(Boolean).join(" / ");
  const third = state.view === "armor" ? row.class : row.type;
  const fourth = state.view === "armor" ? row.type : row.ammo;
  const statKey = state.view === "armor" ? "health" : "range";
  const stat = statValue(row, statKey);
  const pct = statPercent(row, statKey);

  return `
    <button class="result-row${selected}" type="button" data-hash="${esc(row.hash)}">
      <img class="item-icon" src="${esc(row.icon)}" alt="">
      <span>
        <span class="row-name">${esc(row.name)}</span>
        <span class="row-sub">${esc(mainSub)}</span>
      </span>
      <span class="row-cell">${esc(third)}</span>
      <span class="row-cell mobile-hide">${esc(fourth)}</span>
      <span class="row-stat mobile-hide">
        <span>${esc(displayValue(stat))}</span>
        <span class="mini-bar"><span style="width:${pct}%"></span></span>
      </span>
    </button>
  `;
}

function renderEmpty() {
  els.detail.innerHTML = `
    <div class="empty-state">
      <h2>${esc(t("item"))}</h2>
    </div>
  `;
}

function renderTtkDetail() {
  els.detail.innerHTML = `
    <div class="detail-shell">
      <div class="detail-hero">
        <div class="detail-icon"></div>
        <div>
          <div class="detail-title-row">
            <h2>${esc(t("ttk"))}</h2>
            <span class="hash-chip">${esc(t("notReady"))}</span>
          </div>
          <div class="badge-line">
            <span class="badge">source_patch_notes.csv</span>
            <span class="badge">damage_extraction.csv</span>
            <span class="badge">ttk_candidates.csv</span>
          </div>
          <p class="description">${esc(t("ttkBody"))}</p>
        </div>
      </div>
      <div class="detail-grid wide-grid">
        <section class="panel">
          <h3>${esc(t("sourceStatus"))}</h3>
          <ul class="source-list">
            <li>data/static/ttk/source_patch_notes.csv</li>
            <li>data/static/ttk/damage_extraction.csv</li>
            <li>data/static/ttk/ttk_candidates.csv</li>
            <li>docs/D2_Monument_Archive_Damage_Update_Tracker.xlsx</li>
          </ul>
        </section>
      </div>
    </div>
  `;
}

function renderStats(stats) {
  const order = [
    "impact",
    "range",
    "stability",
    "handling",
    "reload",
    "aimAssist",
    "zoom",
    "recoil",
    "rpm",
    "magazine",
    "blastRadius",
    "velocity",
    "chargeTime",
    "drawTime",
    "accuracy",
    "airborne",
    "defense",
    "health",
  ];
  const rows = order.filter((key) => stats?.[key] !== undefined);
  if (!rows.length) return `<div class="notice">${esc(t("notReady"))}</div>`;
  return `
    <div class="stat-grid">
      ${rows
        .map((key) => {
          const value = stats[key];
          const pct = statPercent({ stats }, key);
          return `
            <div class="stat-row">
              <span>${esc(statLabels[state.lang][key] || key)}</span>
              <span class="bar"><span style="width:${pct}%"></span></span>
              <strong>${esc(displayValue(value))}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderDetail(row) {
  if (!row) {
    renderEmpty();
    return;
  }
  const badges = [row.tier, row.type, row.ammo || row.class, row.bucket].filter(Boolean);
  const plugSets = row.plugSetHashes ? row.plugSetHashes.length : 0;

  els.detail.innerHTML = `
    <div class="detail-shell">
      <div class="detail-hero">
        <img class="detail-icon" src="${esc(row.icon)}" alt="">
        <div>
          <div class="detail-title-row">
            <h2>${esc(row.name)}</h2>
            <span class="hash-chip">${esc(row.hash)}</span>
          </div>
          <div class="badge-line">
            ${badges.map((badge) => `<span class="badge">${esc(badge)}</span>`).join("")}
          </div>
          ${row.description ? `<p class="description">${esc(row.description)}</p>` : ""}
        </div>
      </div>

      <div class="detail-grid">
        <section class="panel">
          <h3>${esc(t("stats"))}</h3>
          ${renderStats(row.stats)}
        </section>
        <section class="panel">
          <h3>${esc(t("metadata"))}</h3>
          <table class="kv">
            <tr><th>${esc(t("hash"))}</th><td>${esc(row.hash)}</td></tr>
            <tr><th>${esc(t("type"))}</th><td>${esc(row.type)}</td></tr>
            <tr><th>${esc(t("bucket"))}</th><td>${esc(row.bucket)}</td></tr>
            <tr><th>${esc(t("rarity"))}</th><td>${esc(row.tier)}</td></tr>
            <tr><th>${esc(t("categories"))}</th><td>${esc((row.categories || []).join(", "))}</td></tr>
            ${state.view === "weapons" ? `<tr><th>${esc(t("plugSets"))}</th><td>${esc(plugSets)}</td></tr>` : ""}
          </table>
        </section>
      </div>

      <div class="detail-grid wide-grid">
        <section class="panel">
          <h3>${esc(t("ttk"))}</h3>
          <div class="notice">${esc(t("ttkBody"))}</div>
        </section>
      </div>
    </div>
  `;
}

async function refresh() {
  updateLabels();
  els.resultStatus.textContent = t("loading");
  els.results.innerHTML = "";
  try {
    await ensureData();
    updateLabels();
    updateSummary();
    updateControls();
    renderList();
  } catch (error) {
    els.detail.innerHTML = `<div class="notice error">${esc(error.message)}</div>`;
    els.resultStatus.textContent = "Error";
  }
}

els.langJa.addEventListener("click", () => setLanguage("ja"));
els.langEn.addEventListener("click", () => setLanguage("en"));
els.tabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
els.searchInput.addEventListener("input", renderList);
els.primaryFilter.addEventListener("change", renderList);
els.secondaryFilter.addEventListener("change", renderList);
els.sortSelect.addEventListener("change", () => {
  state.sort = els.sortSelect.value;
  renderList();
});
els.clearButton.addEventListener("click", () => clearFilters(true));

setLanguage(state.lang);
