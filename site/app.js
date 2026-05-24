const state = {
  lang: localStorage.getItem("d2ma-lang") || "ja",
  view: "weapons",
  data: {},
  facets: {},
  selectedHash: null,
};

const text = {
  ja: {
    title: "静的DBプレビュー",
    loading: "読み込み中...",
    search: "検索",
    type: "タイプ",
    ammo: "弾薬",
    class: "クラス",
    slot: "部位",
    all: "すべて",
    results: "件",
    selectTitle: "項目を選択",
    selectBody: "左の一覧から選択してください。",
    stats: "主要ステータス",
    metadata: "メタデータ",
    ttk: "TTK",
    ttkBody: "TTKはManifestから自動確定できないため、Bungie更新情報と検証台帳から順次反映します。",
    source: "出典/状態",
    notReady: "未反映",
    noRows: "一致する項目がありません",
    tabWeapons: "武器",
    tabArmor: "エキゾ防具",
    tabTtk: "TTK",
    manifest: "Manifest",
    synced: "同期",
    hash: "Hash",
    bucket: "スロット",
    rarity: "レアリティ",
    categories: "カテゴリ",
    plugSets: "Plug sets",
  },
  en: {
    title: "Static DB Preview",
    loading: "Loading...",
    search: "Search",
    type: "Type",
    ammo: "Ammo",
    class: "Class",
    slot: "Slot",
    all: "All",
    results: "results",
    selectTitle: "Select an item",
    selectBody: "Choose a row from the list.",
    stats: "Core Stats",
    metadata: "Metadata",
    ttk: "TTK",
    ttkBody: "TTK cannot be finalized from the Manifest alone. It will be filled from Bungie updates and verification tracking.",
    source: "Source/Status",
    notReady: "Not applied",
    noRows: "No matching items",
    tabWeapons: "Weapons",
    tabArmor: "Exotic Armor",
    tabTtk: "TTK",
    manifest: "Manifest",
    synced: "Synced",
    hash: "Hash",
    bucket: "Slot",
    rarity: "Rarity",
    categories: "Categories",
    plugSets: "Plug sets",
  },
};

const statLabels = {
  ja: {
    impact: "威力",
    range: "射程距離",
    stability: "安定性",
    handling: "ハンドリング",
    reload: "リロード速度",
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
  searchLabel: document.getElementById("searchLabel"),
  filterPrimaryLabel: document.getElementById("filterPrimaryLabel"),
  filterSecondaryLabel: document.getElementById("filterSecondaryLabel"),
  searchInput: document.getElementById("searchInput"),
  primaryFilter: document.getElementById("primaryFilter"),
  secondaryFilter: document.getElementById("secondaryFilter"),
  resultStatus: document.getElementById("resultStatus"),
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

function distinct(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${response.status} ${path}`);
  }
  return response.json();
}

async function ensureData() {
  if (!state.data.index) {
    state.data.index = await loadJson("./data/index.json");
  }
  const lang = state.lang;
  if (!state.data[lang]) {
    const [weapons, armor, facets] = await Promise.all([
      loadJson(`./data/weapons.${lang}.json`),
      loadJson(`./data/exotic_armor.${lang}.json`),
      loadJson(`./data/facets.${lang}.json`),
    ]);
    state.data[lang] = { weapons, armor };
    state.facets[lang] = facets;
  }
}

function currentRows() {
  const langData = state.data[state.lang];
  if (!langData) return [];
  if (state.view === "armor") return langData.armor;
  if (state.view === "ttk") return [];
  return langData.weapons;
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
  els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === view));
  els.searchInput.value = "";
  refresh();
}

function populateSelect(select, values, labelAll) {
  const selected = select.value;
  select.innerHTML = `<option value="">${esc(labelAll)}</option>${values
    .map((value) => `<option value="${esc(value)}">${esc(value)}</option>`)
    .join("")}`;
  if (values.includes(selected)) select.value = selected;
}

function updateLabels() {
  els.pageTitle.textContent = t("title");
  els.searchLabel.textContent = t("search");
  els.searchInput.placeholder = state.lang === "ja" ? "名前、タイプ、Hash" : "Name, type, hash";
  els.filterPrimaryLabel.textContent = state.view === "armor" ? t("class") : t("type");
  els.filterSecondaryLabel.textContent = state.view === "armor" ? t("slot") : t("ammo");
  els.tabs.forEach((tab) => {
    if (tab.dataset.view === "weapons") tab.textContent = t("tabWeapons");
    if (tab.dataset.view === "armor") tab.textContent = t("tabArmor");
    if (tab.dataset.view === "ttk") tab.textContent = t("tabTtk");
  });
  if (state.data.index) {
    els.manifestMeta.textContent = `${t("manifest")}: ${state.data.index.manifestVersion} / ${t("synced")}: ${state.data.index.sourceSyncedAt}`;
  }
}

function updateFilters() {
  const rows = currentRows();
  if (state.view === "ttk") {
    els.primaryFilter.disabled = true;
    els.secondaryFilter.disabled = true;
    populateSelect(els.primaryFilter, [], t("all"));
    populateSelect(els.secondaryFilter, [], t("all"));
    return;
  }
  els.primaryFilter.disabled = false;
  els.secondaryFilter.disabled = false;
  populateSelect(els.primaryFilter, distinct(rows, state.view === "armor" ? "class" : "type"), t("all"));
  populateSelect(els.secondaryFilter, distinct(rows, state.view === "armor" ? "type" : "ammo"), t("all"));
}

function filteredRows() {
  if (state.view === "ttk") return [];
  const query = els.searchInput.value.trim().toLowerCase();
  const primary = els.primaryFilter.value;
  const secondary = els.secondaryFilter.value;
  const primaryKey = state.view === "armor" ? "class" : "type";
  const secondaryKey = state.view === "armor" ? "type" : "ammo";

  return currentRows()
    .filter((row) => !query || row.search.includes(query) || String(row.hash).includes(query))
    .filter((row) => !primary || row[primaryKey] === primary)
    .filter((row) => !secondary || row[secondaryKey] === secondary)
    .slice(0, 250);
}

function renderResults(rows) {
  if (state.view === "ttk") {
    els.resultStatus.textContent = t("notReady");
    els.results.innerHTML = "";
    renderTtkDetail();
    return;
  }

  els.resultStatus.textContent = `${rows.length} ${t("results")}`;
  if (!rows.length) {
    els.results.innerHTML = `<div class="result-status">${esc(t("noRows"))}</div>`;
    renderEmpty();
    return;
  }

  if (!state.selectedHash || !rows.some((row) => row.hash === state.selectedHash)) {
    state.selectedHash = rows[0].hash;
  }

  els.results.innerHTML = rows
    .map((row) => {
      const selected = row.hash === state.selectedHash ? " is-selected" : "";
      const meta = state.view === "armor" ? [row.class, row.type].filter(Boolean).join(" / ") : [row.type, row.ammo].filter(Boolean).join(" / ");
      return `
        <button class="result-row${selected}" type="button" data-hash="${esc(row.hash)}">
          <img class="item-icon" src="${esc(row.icon)}" alt="">
          <span>
            <span class="row-name">${esc(row.name)}</span>
            <span class="row-meta">${esc(meta)}</span>
          </span>
          <span class="row-hash">${esc(row.hash)}</span>
        </button>
      `;
    })
    .join("");

  els.results.querySelectorAll(".result-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedHash = Number(button.dataset.hash);
      renderResults(filteredRows());
    });
  });

  const selected = rows.find((row) => row.hash === state.selectedHash);
  renderDetail(selected);
}

function renderEmpty() {
  els.detail.innerHTML = `
    <div class="empty-state">
      <h2>${esc(t("selectTitle"))}</h2>
      <p>${esc(t("selectBody"))}</p>
    </div>
  `;
}

function renderTtkDetail() {
  els.detail.innerHTML = `
    <div class="detail-shell">
      <div class="notice">
        <strong>${esc(t("ttk"))}</strong><br>
        ${esc(t("ttkBody"))}
      </div>
      <div class="detail-grid">
        <section class="panel">
          <h3>${esc(t("source"))}</h3>
          <table class="kv">
            <tr><th>CSV</th><td>data/static/ttk/source_patch_notes.csv</td></tr>
            <tr><th>CSV</th><td>data/static/ttk/damage_extraction.csv</td></tr>
            <tr><th>CSV</th><td>data/static/ttk/ttk_candidates.csv</td></tr>
            <tr><th>XLSX</th><td>docs/D2_Monument_Archive_Damage_Update_Tracker.xlsx</td></tr>
          </table>
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
  const rows = order.filter((key) => stats[key] !== undefined);
  if (!rows.length) return `<p class="meta">${esc(t("notReady"))}</p>`;

  return rows
    .map((key) => {
      const value = stats[key];
      const max = key === "rpm" || key === "chargeTime" || key === "drawTime" ? 1000 : key === "magazine" ? 120 : 100;
      const pct = Math.max(0, Math.min(100, (Number(value) / max) * 100));
      return `
        <div class="stat-row">
          <span>${esc(statLabels[state.lang][key] || key)}</span>
          <span class="bar"><span style="width:${pct}%"></span></span>
          <strong>${esc(value)}</strong>
        </div>
      `;
    })
    .join("");
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
      <div class="detail-head">
        <img class="detail-icon" src="${esc(row.icon)}" alt="">
        <div>
          <h2>${esc(row.name)}</h2>
          <div class="badge-line">
            ${badges.map((badge) => `<span class="badge">${esc(badge)}</span>`).join("")}
          </div>
          ${row.description ? `<p class="description">${esc(row.description)}</p>` : ""}
        </div>
      </div>

      <div class="detail-grid">
        <section class="panel">
          <h3>${esc(t("stats"))}</h3>
          ${renderStats(row.stats || {})}
        </section>
        <section class="panel">
          <h3>${esc(t("metadata"))}</h3>
          <table class="kv">
            <tr><th>${esc(t("hash"))}</th><td>${esc(row.hash)}</td></tr>
            <tr><th>${esc(t("bucket"))}</th><td>${esc(row.bucket)}</td></tr>
            <tr><th>${esc(t("rarity"))}</th><td>${esc(row.tier)}</td></tr>
            <tr><th>${esc(t("categories"))}</th><td>${esc((row.categories || []).join(", "))}</td></tr>
            ${state.view === "weapons" ? `<tr><th>${esc(t("plugSets"))}</th><td>${esc(plugSets)}</td></tr>` : ""}
          </table>
        </section>
      </div>

      <div class="detail-grid">
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
  els.results.innerHTML = `<div class="result-status">${esc(t("loading"))}</div>`;
  try {
    await ensureData();
    updateLabels();
    updateFilters();
    renderResults(filteredRows());
  } catch (error) {
    els.detail.innerHTML = `<div class="notice error">${esc(error.message)}</div>`;
    els.resultStatus.textContent = "Error";
  }
}

els.langJa.addEventListener("click", () => setLanguage("ja"));
els.langEn.addEventListener("click", () => setLanguage("en"));
els.tabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
els.searchInput.addEventListener("input", () => renderResults(filteredRows()));
els.primaryFilter.addEventListener("change", () => renderResults(filteredRows()));
els.secondaryFilter.addEventListener("change", () => renderResults(filteredRows()));

setLanguage(state.lang);
