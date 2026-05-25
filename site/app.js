const LIMIT = 250;

const state = {
  lang: localStorage.getItem("d2ma-lang") || "ja",
  group: "equipment",
  section: "weapons",
  sort: "name",
  data: {},
  selectedHash: null,
};

const taxonomy = [
  { id: "character", defaultSection: "hunter", sections: ["all", "hunter", "warlock", "titan", "subclasses"] },
  { id: "equipment", defaultSection: "weapons", sections: ["all", "weapons", "armor", "ghosts", "ships", "sparrows", "emblems", "artifacts", "clan_banners"] },
  { id: "appearance", defaultSection: "emotes", sections: ["all", "emotes", "finishers", "shaders", "weapon_ornaments", "armor_ornaments", "ghost_projections", "transmat_effects"] },
  { id: "inventory", defaultSection: "quests", sections: ["all", "quests", "bounties", "lore", "engrams", "packages", "consumables", "materials", "currencies"] },
  { id: "mods", defaultSection: "weapon_mods", sections: ["all", "weapon_mods", "armor_mods", "ghost_mods", "perks", "traits", "intrinsics", "enhanced_traits"] },
  { id: "all", defaultSection: "all", sections: ["all"] },
];

const text = {
  ja: {
    title: "データベース",
    manifest: "Manifest",
    synced: "同期",
    loading: "読み込み中",
    search: "検索",
    searchPlaceholder: "名称、説明、カテゴリ、Hash",
    reset: "リセット",
    all: "すべて",
    results: "件",
    showing: "表示",
    noRows: "一致なし",
    name: "名前",
    category: "分類",
    type: "タイプ",
    detail: "詳細",
    sort: "並び替え",
    sortName: "名前",
    sortType: "タイプ",
    sortSection: "分類",
    sortRange: "射程",
    sortImpact: "威力",
    sortRpm: "RPM",
    filterWeaponType: "武器種",
    filterAmmo: "弾薬",
    filterDamage: "属性",
    filterWeaponSlot: "スロット",
    filterClass: "クラス",
    filterArmorSlot: "防具部位",
    filterRarity: "レアリティ",
    filterSection: "細分類",
    filterBucket: "所持枠",
    stats: "主要ステータス",
    metadata: "メタデータ",
    ttk: "PvP TTK",
    ttkPending: "未反映。Bungie更新情報、検証台帳、PvP体力+シールド基準を確認してから武器別に反映します。",
    ttkNote: "TTKは武器ごとのPvPデータとして保持します。タブではなく、この武器詳細に紐づく値です。",
    serverRequiredTitle: "ローカルサーバーで開いてください",
    serverRequiredBody: "このデータベースはJSONデータを読み込むため、HTMLファイルを直接開く file:// 表示では動きません。",
    serverRequiredCommand: "powershell -ExecutionPolicy Bypass -File scripts\\serve_site.ps1",
    serverRequiredUrl: "http://127.0.0.1:8788/",
    hash: "Hash",
    bucket: "スロット",
    rarity: "レアリティ",
    categories: "カテゴリ",
    plugSets: "Plug sets",
    class: "クラス",
    ammo: "弾薬",
    damage: "属性",
    weaponSlot: "武器スロット",
    mode: "モード",
    status: "状態",
    sandboxVersion: "Sandbox",
    resilienceTier: "耐久",
    optimalTtk: "最適TTK",
    bodyTtk: "胴撃ちTTK",
    conditions: "条件",
    source: "出典",
    notReady: "未反映",
    catalog: "全カタログ",
    weapons: "武器",
    armor: "防具",
    exoticArmor: "エキゾ防具",
    currentScope: "現在の範囲",
    groupLabels: {
      character: "キャラクター",
      equipment: "装備",
      appearance: "外観/コレクション",
      inventory: "所持品/進行",
      mods: "改造/パーク",
      all: "全データ",
    },
    groupSub: {
      character: "ハンター、ウォーロック、タイタン",
      equipment: "武器、防具、ゴースト、船など",
      appearance: "感情表現、装飾、シェーダー",
      inventory: "クエスト、伝承、素材、通貨",
      mods: "武器/防具/ゴースト改造と特性",
      all: "分類をまたいで検索",
    },
    sectionLabels: {
      all: "すべて",
      hunter: "ハンター",
      warlock: "ウォーロック",
      titan: "タイタン",
      subclasses: "サブクラス",
      weapons: "武器",
      armor: "防具",
      ghosts: "ゴースト",
      ships: "船",
      sparrows: "スパロー",
      emblems: "エンブレム",
      artifacts: "シーズンアーティファクト",
      clan_banners: "クランバナー",
      emotes: "感情表現",
      finishers: "フィニッシャー",
      shaders: "シェーダー",
      weapon_ornaments: "武器装飾",
      armor_ornaments: "防具装飾",
      ghost_projections: "ゴーストのプロジェクション",
      transmat_effects: "トランスマット効果",
      quests: "クエスト",
      bounties: "バウンティ",
      lore: "伝承",
      engrams: "エングラム",
      packages: "パッケージ",
      consumables: "消費アイテム",
      materials: "材料",
      currencies: "通貨",
      weapon_mods: "武器改造パーツ",
      armor_mods: "防具改造パーツ",
      ghost_mods: "ゴースト改造パーツ",
      perks: "パーク",
      traits: "特性",
      intrinsics: "内在効果",
      enhanced_traits: "強化特性",
      other: "その他",
    },
  },
  en: {
    title: "DATABASE",
    manifest: "Manifest",
    synced: "Synced",
    loading: "Loading",
    search: "Search",
    searchPlaceholder: "Name, description, category, hash",
    reset: "Reset",
    all: "All",
    results: "results",
    showing: "Showing",
    noRows: "No matches",
    name: "Name",
    category: "Category",
    type: "Type",
    detail: "Detail",
    sort: "Sort",
    sortName: "Name",
    sortType: "Type",
    sortSection: "Category",
    sortRange: "Range",
    sortImpact: "Impact",
    sortRpm: "RPM",
    filterWeaponType: "Weapon type",
    filterAmmo: "Ammo",
    filterDamage: "Damage",
    filterWeaponSlot: "Slot",
    filterClass: "Class",
    filterArmorSlot: "Armor slot",
    filterRarity: "Rarity",
    filterSection: "Subcategory",
    filterBucket: "Bucket",
    stats: "Core Stats",
    metadata: "Metadata",
    ttk: "PvP TTK",
    ttkPending: "Not applied. Fill per weapon after checking Bungie updates, verification tracking, and the PvP health+shield baseline.",
    ttkNote: "TTK is stored as weapon-level PvP data. It belongs to this weapon detail, not a sibling tab.",
    serverRequiredTitle: "Open through the local server",
    serverRequiredBody: "This catalog loads JSON data, so it cannot run from a direct file:// HTML page.",
    serverRequiredCommand: "powershell -ExecutionPolicy Bypass -File scripts\\serve_site.ps1",
    serverRequiredUrl: "http://127.0.0.1:8788/",
    hash: "Hash",
    bucket: "Slot",
    rarity: "Rarity",
    categories: "Categories",
    plugSets: "Plug sets",
    class: "Class",
    ammo: "Ammo",
    damage: "Damage",
    weaponSlot: "Weapon slot",
    mode: "Mode",
    status: "Status",
    sandboxVersion: "Sandbox",
    resilienceTier: "Resilience",
    optimalTtk: "Optimal TTK",
    bodyTtk: "Body TTK",
    conditions: "Conditions",
    source: "Source",
    notReady: "Not applied",
    catalog: "Catalog",
    weapons: "Weapons",
    armor: "Armor",
    exoticArmor: "Exotic armor",
    currentScope: "Current scope",
    groupLabels: {
      character: "Character",
      equipment: "Equipment",
      appearance: "Appearance/Collections",
      inventory: "Inventory/Progress",
      mods: "Mods/Perks",
      all: "All Data",
    },
    groupSub: {
      character: "Hunter, Warlock, Titan",
      equipment: "Weapons, armor, Ghosts, ships",
      appearance: "Emotes, ornaments, shaders",
      inventory: "Quests, lore, materials, currency",
      mods: "Weapon, armor, Ghost mods and traits",
      all: "Search across categories",
    },
    sectionLabels: {
      all: "All",
      hunter: "Hunter",
      warlock: "Warlock",
      titan: "Titan",
      subclasses: "Subclasses",
      weapons: "Weapons",
      armor: "Armor",
      ghosts: "Ghosts",
      ships: "Ships",
      sparrows: "Sparrows",
      emblems: "Emblems",
      artifacts: "Seasonal Artifacts",
      clan_banners: "Clan Banners",
      emotes: "Emotes",
      finishers: "Finishers",
      shaders: "Shaders",
      weapon_ornaments: "Weapon Ornaments",
      armor_ornaments: "Armor Ornaments",
      ghost_projections: "Ghost Projections",
      transmat_effects: "Transmat Effects",
      quests: "Quests",
      bounties: "Bounties",
      lore: "Lore",
      engrams: "Engrams",
      packages: "Packages",
      consumables: "Consumables",
      materials: "Materials",
      currencies: "Currencies",
      weapon_mods: "Weapon Mods",
      armor_mods: "Armor Mods",
      ghost_mods: "Ghost Mods",
      perks: "Perks",
      traits: "Traits",
      intrinsics: "Intrinsics",
      enhanced_traits: "Enhanced Traits",
      other: "Other",
    },
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
  groupNav: document.getElementById("groupNav"),
  sectionRail: document.getElementById("sectionRail"),
  summaryBand: document.getElementById("summaryBand"),
  searchLabel: document.getElementById("searchLabel"),
  searchInput: document.getElementById("searchInput"),
  clearButton: document.getElementById("clearButton"),
  filterPrimaryLabel: document.getElementById("filterPrimaryLabel"),
  filterSecondaryLabel: document.getElementById("filterSecondaryLabel"),
  filterTertiaryLabel: document.getElementById("filterTertiaryLabel"),
  filterQuaternaryLabel: document.getElementById("filterQuaternaryLabel"),
  sortLabel: document.getElementById("sortLabel"),
  primaryFilter: document.getElementById("primaryFilter"),
  secondaryFilter: document.getElementById("secondaryFilter"),
  tertiaryFilter: document.getElementById("tertiaryFilter"),
  quaternaryFilter: document.getElementById("quaternaryFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resultStatus: document.getElementById("resultStatus"),
  activeFilterLabel: document.getElementById("activeFilterLabel"),
  columnHead: document.getElementById("columnHead"),
  results: document.getElementById("results"),
  detail: document.getElementById("detail"),
};

const filterControls = [
  { label: els.filterPrimaryLabel, select: els.primaryFilter },
  { label: els.filterSecondaryLabel, select: els.secondaryFilter },
  { label: els.filterTertiaryLabel, select: els.tertiaryFilter },
  { label: els.filterQuaternaryLabel, select: els.quaternaryFilter },
];

function t(key) {
  return text[state.lang][key] || text.en[key] || key;
}

function groupLabel(id) {
  return t("groupLabels")[id] || id;
}

function groupSub(id) {
  return t("groupSub")[id] || "";
}

function sectionLabel(id) {
  return t("sectionLabels")[id] || id;
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

function displayValue(value) {
  return value === undefined || value === null || value === "" ? "-" : value;
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
    const [catalog, facets, summary] = await Promise.all([
      loadJson(`./data/catalog.${state.lang}.json`),
      loadJson(`./data/facets.${state.lang}.json`),
      loadJson(`./data/summary.${state.lang}.json`),
    ]);
    state.data[state.lang] = { catalog, facets, summary };
  }
}

function langData() {
  return state.data[state.lang] || {};
}

function currentTaxonomy() {
  return taxonomy.find((item) => item.id === state.group) || taxonomy[1];
}

function defaultSection(group = state.group) {
  return (taxonomy.find((item) => item.id === group) || taxonomy[1]).defaultSection;
}

function countFrom(list, id) {
  return (list || []).find((row) => row.label === id)?.count || 0;
}

function rowMatchesContext(row) {
  if (state.group !== "all" && !(row.groups || []).includes(state.group)) return false;
  if (state.section !== "all" && !(row.sections || []).includes(state.section)) return false;
  return true;
}

function contextRows() {
  return (langData().catalog || []).filter(rowMatchesContext);
}

function valueFor(row, key) {
  if (key === "section") return row.sectionLabel || sectionLabel(row.primarySection);
  if (key === "group") return groupLabel(row.primaryGroup);
  return row[key] || "";
}

function distinct(rows, key) {
  return [...new Set(rows.map((row) => valueFor(row, key)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function filterDefinitions() {
  if (state.section === "weapons") {
    return [
      ["weaponType", t("filterWeaponType")],
      ["ammo", t("filterAmmo")],
      ["damageType", t("filterDamage")],
      ["weaponSlot", t("filterWeaponSlot")],
    ];
  }
  if (state.section === "armor" || ["hunter", "warlock", "titan"].includes(state.section)) {
    return [
      ["class", t("filterClass")],
      ["armorSlot", t("filterArmorSlot")],
      ["tier", t("filterRarity")],
      ["type", t("type")],
    ];
  }
  return [
    ["section", t("filterSection")],
    ["type", t("type")],
    ["bucket", t("filterBucket")],
    ["tier", t("filterRarity")],
  ];
}

function sortOptions() {
  const base = [
    ["name", t("sortName")],
    ["section", t("sortSection")],
    ["type", t("sortType")],
  ];
  if (state.section === "weapons") {
    base.push(["range", t("sortRange")], ["impact", t("sortImpact")], ["rpm", t("sortRpm")]);
  }
  return base;
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("d2ma-lang", lang);
  document.documentElement.lang = lang;
  els.langJa.setAttribute("aria-pressed", String(lang === "ja"));
  els.langEn.setAttribute("aria-pressed", String(lang === "en"));
  refresh();
}

function setGroup(group) {
  state.group = group;
  state.section = defaultSection(group);
  state.selectedHash = null;
  state.sort = "name";
  clearFilters(false);
  refresh();
}

function setSection(section) {
  state.section = section;
  state.selectedHash = null;
  state.sort = "name";
  clearFilters(false);
  refresh();
}

function clearFilters(render = true) {
  els.searchInput.value = "";
  filterControls.forEach(({ select }) => {
    select.value = "";
  });
  state.sort = "name";
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

function updateLabels() {
  els.pageTitle.textContent = t("title");
  els.searchLabel.textContent = t("search");
  els.searchInput.placeholder = t("searchPlaceholder");
  els.clearButton.textContent = t("reset");
  els.sortLabel.textContent = t("sort");
  if (state.data.index) {
    els.manifestMeta.textContent = `${t("manifest")} ${shortVersion(state.data.index.manifestVersion)} / ${t("synced")} ${state.data.index.sourceSyncedAt}`;
  }
}

function renderGroupNav() {
  const summary = langData().summary || {};
  els.groupNav.innerHTML = taxonomy
    .map((group) => {
      const count = group.id === "all" ? summary.catalogCount : countFrom(summary.groupCounts, group.id);
      const active = group.id === state.group ? " is-active" : "";
      return `
        <button class="group-tab${active}" type="button" data-group="${esc(group.id)}">
          <span class="group-name">${esc(groupLabel(group.id))}</span>
          <span class="group-sub">${esc(groupSub(group.id))}</span>
          <span class="group-count">${esc(number(count))}</span>
        </button>
      `;
    })
    .join("");
  els.groupNav.querySelectorAll(".group-tab").forEach((button) => {
    button.addEventListener("click", () => setGroup(button.dataset.group));
  });
}

function renderSectionRail() {
  const summary = langData().summary || {};
  const sections = currentTaxonomy().sections;
  const rowsInGroup = state.group === "all" ? summary.catalogCount : countFrom(summary.groupCounts, state.group);
  els.sectionRail.innerHTML = sections
    .map((section) => {
      const count = section === "all" ? rowsInGroup : countFrom(summary.sectionCounts, section);
      const active = section === state.section ? " is-active" : "";
      return `
        <button class="section-chip${active}" type="button" data-section="${esc(section)}">
          <span>${esc(sectionLabel(section))}</span>
          <strong>${esc(number(count))}</strong>
        </button>
      `;
    })
    .join("");
  els.sectionRail.querySelectorAll(".section-chip").forEach((button) => {
    button.addEventListener("click", () => setSection(button.dataset.section));
  });
}

function updateSummary() {
  const summary = langData().summary;
  if (!summary) {
    els.summaryBand.innerHTML = "";
    return;
  }
  const topWeapon = summary.weaponTypes?.[0];
  const topSection = summary.sectionCounts?.[0];
  const scopeCount = contextRows().length;
  const metrics = [
    [t("currentScope"), number(scopeCount), `${groupLabel(state.group)} / ${sectionLabel(state.section)}`],
    [t("catalog"), number(summary.catalogCount), topSection ? `${sectionLabel(topSection.label)} ${number(topSection.count)}` : ""],
    [t("weapons"), number(summary.weaponCount), topWeapon ? `${topWeapon.label} ${number(topWeapon.count)}` : ""],
    [t("armor"), number(summary.armorCount), `${t("exoticArmor")} ${number(summary.exoticArmorCount)}`],
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
  const rows = contextRows();
  const defs = filterDefinitions();
  filterControls.forEach((control, index) => {
    const def = defs[index];
    const field = control.label.closest(".field");
    if (!def) {
      field.classList.add("is-hidden");
      control.select.innerHTML = "";
      control.select.dataset.key = "";
      return;
    }
    const [key, label] = def;
    field.classList.remove("is-hidden");
    control.label.textContent = label;
    control.select.dataset.key = key;
    populateSelect(control.select, distinct(rows, key), t("all"));
  });

  const options = sortOptions();
  els.sortSelect.innerHTML = options.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("");
  if (options.some(([value]) => value === state.sort)) {
    els.sortSelect.value = state.sort;
  } else {
    state.sort = "name";
    els.sortSelect.value = state.sort;
  }
}

function applyFilters(rows) {
  const query = els.searchInput.value.trim().toLowerCase();
  return rows
    .filter((row) => !query || row.search.includes(query) || String(row.hash).includes(query))
    .filter((row) => filterControls.every(({ select }) => {
      const key = select.dataset.key;
      if (!key || !select.value) return true;
      return valueFor(row, key) === select.value;
    }));
}

function sortRows(rows) {
  const sorted = [...rows];
  const sort = state.sort;
  sorted.sort((a, b) => {
    if (["range", "impact", "rpm"].includes(sort)) {
      return Number(b.stats?.[sort] || b[sort] || 0) - Number(a.stats?.[sort] || a[sort] || 0) || String(a.name).localeCompare(String(b.name));
    }
    if (sort === "section") {
      return String(a.sectionLabel || "").localeCompare(String(b.sectionLabel || "")) || String(a.name).localeCompare(String(b.name));
    }
    if (sort === "type") {
      return String(a.type || "").localeCompare(String(b.type || "")) || String(a.name).localeCompare(String(b.name));
    }
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
  return sorted;
}

function listRows() {
  return sortRows(applyFilters(contextRows()));
}

function renderColumnHead() {
  const cells = ["", t("name"), t("category"), t("type"), t("detail")];
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

function detailSummary(row) {
  if ((row.sections || []).includes("weapons")) {
    return [row.ammo, row.damageType, row.weaponSlot].filter(Boolean).join(" / ");
  }
  if ((row.sections || []).includes("armor")) {
    return [row.class, row.armorSlot, row.tier].filter(Boolean).join(" / ");
  }
  return [row.bucket, row.tier].filter(Boolean).join(" / ");
}

function renderList() {
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

function renderIcon(row, className) {
  if (!row.icon) return `<span class="${className} placeholder-icon"></span>`;
  return `<img class="${className}" src="${esc(row.icon)}" alt="">`;
}

function renderResultRow(row) {
  const selected = row.hash === state.selectedHash ? " is-selected" : "";
  const type = row.weaponType || row.armorSlot || row.type || row.sectionLabel;
  const detail = detailSummary(row);
  const sub = [row.bucket, row.tier].filter(Boolean).join(" / ");
  return `
    <button class="result-row${selected}" type="button" data-hash="${esc(row.hash)}">
      ${renderIcon(row, "item-icon")}
      <span>
        <span class="row-name">${esc(row.name)}</span>
        <span class="row-sub">${esc(sub)}</span>
      </span>
      <span class="row-cell">${esc(row.sectionLabel || sectionLabel(row.primarySection))}</span>
      <span class="row-cell mobile-hide">${esc(type)}</span>
      <span class="row-cell mobile-hide">${esc(detail || "-")}</span>
    </button>
  `;
}

function renderEmpty() {
  els.detail.innerHTML = `
    <div class="empty-state">
      <h2>${esc(t("noRows"))}</h2>
    </div>
  `;
}

function renderServerRequired() {
  els.groupNav.innerHTML = "";
  els.sectionRail.innerHTML = "";
  els.summaryBand.innerHTML = "";
  els.columnHead.innerHTML = "";
  els.results.innerHTML = "";
  els.resultStatus.textContent = "file://";
  els.activeFilterLabel.textContent = "";
  els.searchInput.disabled = true;
  els.clearButton.disabled = true;
  filterControls.forEach(({ label, select }) => {
    const field = label.closest(".field");
    field.classList.add("is-hidden");
    select.disabled = true;
  });
  els.sortSelect.disabled = true;
  els.detail.innerHTML = `
    <div class="detail-shell">
      <section class="panel server-required">
        <h2>${esc(t("serverRequiredTitle"))}</h2>
        <p>${esc(t("serverRequiredBody"))}</p>
        <div class="launch-box">
          <span>${esc(t("serverRequiredCommand"))}</span>
          <a href="${esc(t("serverRequiredUrl"))}">${esc(t("serverRequiredUrl"))}</a>
        </div>
      </section>
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

function renderKv(rows) {
  return `
    <table class="kv">
      ${rows
        .filter(([, value]) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length))
        .map(([label, value]) => `<tr><th>${esc(label)}</th><td>${esc(Array.isArray(value) ? value.join(", ") : value)}</td></tr>`)
        .join("")}
    </table>
  `;
}

function renderTtk(row) {
  if (!(row.sections || []).includes("weapons")) return "";
  const ttk = row.ttk || {};
  const hasValue = ttk.optimalTtkMs || ttk.bodyTtkMs;
  return `
    <div class="detail-grid wide-grid">
      <section class="panel">
        <h3>${esc(t("ttk"))}</h3>
        <div class="notice">${esc(hasValue ? t("ttkNote") : t("ttkPending"))}</div>
        ${renderKv([
          [t("status"), ttk.status || t("notReady")],
          [t("mode"), ttk.mode || "PvP"],
          [t("sandboxVersion"), ttk.sandboxVersion],
          [t("resilienceTier"), ttk.resilienceTier],
          [t("optimalTtk"), ttk.optimalTtkMs ? `${ttk.optimalTtkMs} ms` : ""],
          [t("bodyTtk"), ttk.bodyTtkMs ? `${ttk.bodyTtkMs} ms` : ""],
          [t("conditions"), ttk.conditions],
          [t("source"), ttk.sourceExtractionId || "data/static/ttk/ttk_candidates.csv"],
        ])}
      </section>
    </div>
  `;
}

function renderDetail(row) {
  if (!row) {
    renderEmpty();
    return;
  }
  const badges = [
    row.sectionLabel,
    row.weaponType || row.armorSlot || row.type,
    row.ammo,
    row.damageType,
    row.class,
    row.tier,
  ].filter(Boolean);
  const plugSets = row.plugSetHashes ? row.plugSetHashes.length : 0;

  els.detail.innerHTML = `
    <div class="detail-shell">
      <div class="detail-hero">
        ${renderIcon(row, "detail-icon")}
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
          ${renderKv([
            [t("hash"), row.hash],
            [t("category"), `${groupLabel(row.primaryGroup)} / ${row.sectionLabel || sectionLabel(row.primarySection)}`],
            [t("type"), row.type],
            [t("bucket"), row.bucket],
            [t("rarity"), row.tier],
            [t("class"), row.class],
            [t("weaponSlot"), row.weaponSlot],
            [t("ammo"), row.ammo],
            [t("damage"), row.damageType],
            [t("categories"), row.categories],
            [t("plugSets"), plugSets || ""],
          ])}
        </section>
      </div>

      ${renderTtk(row)}
    </div>
  `;
}

async function refresh() {
  updateLabels();
  if (location.protocol === "file:") {
    renderServerRequired();
    return;
  }
  els.resultStatus.textContent = t("loading");
  els.results.innerHTML = "";
  try {
    await ensureData();
    updateLabels();
    renderGroupNav();
    renderSectionRail();
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
els.searchInput.addEventListener("input", renderList);
filterControls.forEach(({ select }) => select.addEventListener("change", renderList));
els.sortSelect.addEventListener("change", () => {
  state.sort = els.sortSelect.value;
  renderList();
});
els.clearButton.addEventListener("click", () => clearFilters(true));

setLanguage(state.lang);
