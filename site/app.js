const LIMIT = 250;

const state = {
  lang: localStorage.getItem("d2ma-lang") || "ja",
  group: "equipment",
  section: "weapons",
  sort: "weaponType",
  data: {},
  selectedHash: null,
  selectedPlugs: {},
  manualArmor: {},
  armorTertiary: {},
  openPlugSockets: {},
};

const taxonomy = [
  { id: "character", defaultSection: "subclasses", sections: ["all", "subclasses", "hunter", "warlock", "titan"] },
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
    sortWeaponType: "武器種",
    sortAmmo: "弾薬",
    sortSlot: "スロット",
    sortDamage: "属性",
    sortFrame: "フレーム",
    sortTtk: "PvP Potential",
    sortWeaponSystem: "新武器",
    filterWeaponType: "武器種",
    filterAmmo: "弾薬",
    filterDamage: "属性",
    filterWeaponSlot: "スロット",
    filterWeaponSystem: "武器世代",
    filterClass: "クラス",
    filterArmorSlot: "防具部位",
    filterRarity: "レアリティ",
    filterSection: "細分類",
    filterBucket: "所持枠",
    stats: "主要ステータス",
    metadata: "メタデータ",
    metadataHint: "メタデータを見る",
    ttk: "PvP POTENTIAL",
    ttkPending: "未反映。Bungie更新情報、検証台帳、PvP体力+シールド基準を確認してから、フレーム基準でダメージ/TTK/BS許容を反映します。",
    ttkNote: "PvP POTENTIALはフレーム基準値を各武器へ継承し、武器固有の例外だけ個別値で上書きします。",
    serverRequiredTitle: "ローカルサーバーで開いてください",
    serverRequiredBody: "このデータベースはJSONデータを読み込むため、HTMLファイルを直接開く file:// 表示では動きません。",
    serverRequiredCommand: "powershell -ExecutionPolicy Bypass -File scripts\\serve_site.ps1",
    serverRequiredUrl: "http://127.0.0.1:8788/",
    hash: "Hash",
    bucket: "スロット",
    rarity: "レアリティ",
    categories: "カテゴリ",
    plugSets: "Plug sets",
    perksMods: "パーク / Mod",
    selectPlug: "未選択（基準値）",
    selectedEffects: "選択中の効果",
    noPlugOptions: "選択候補なし",
    noStatChanges: "ステータス補正なし",
    openChoices: "候補を開く",
    closeChoices: "候補を閉じる",
    armorTertiary: "固有パラメータ",
    armorTier5: "Tier 5基準",
    manualArmorTuning: "旧防具ステータス調整",
    manualArmorNote: "旧仕様防具は実値を0-42で手動調整します。",
    class: "クラス",
    ammo: "弾薬",
    damage: "属性",
    weaponSlot: "武器スロット",
    weaponFrame: "フレーム",
    weaponArchetype: "アーキタイプ",
    weaponSystemNew: "新武器 / Tier式",
    weaponSystemLegacy: "旧式 / 非Tier",
    release: "追加情報",
    releaseWatermark: "シーズン/拡張アイコン",
    collectible: "Collectible",
    mode: "モード",
    status: "状態",
    sandboxVersion: "Sandbox",
    resilienceTier: "耐久",
    targetHp: "対象HP",
    weaponParameter: "WP",
    wpBonus: "WP補正",
    basePrecisionDamage: "基準精密ダメージ",
    baseBodyDamage: "基準ボディダメージ",
    precisionDamage: "実効精密ダメージ",
    bodyDamage: "実効ボディダメージ",
    optimalTtk: "Optimal TTK",
    bodyTtk: "BS TTK",
    critShots: "全弾精密キル弾数",
    bodyShots: "全弾BSキル弾数",
    bodyForgiveness: "最速キルBS許容",
    conditions: "条件",
    source: "出典",
    ttkScope: "適用単位",
    ttkScopeFrame: "フレーム基準",
    ttkScopeWeapon: "武器個別",
    ttkScopePending: "未確定",
    notReady: "未反映",
    referenceNeedsVerification: "参照値 / 要検証",
    referenceEdgeCase: "参照値 / 特殊要検証",
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
      character: "サブクラス、クラス設定",
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
    sortWeaponType: "Weapon type",
    sortAmmo: "Ammo",
    sortSlot: "Slot",
    sortDamage: "Damage",
    sortFrame: "Frame",
    sortTtk: "PvP Potential",
    sortWeaponSystem: "New weapon",
    filterWeaponType: "Weapon type",
    filterAmmo: "Ammo",
    filterDamage: "Damage",
    filterWeaponSlot: "Slot",
    filterWeaponSystem: "Weapon generation",
    filterClass: "Class",
    filterArmorSlot: "Armor slot",
    filterRarity: "Rarity",
    filterSection: "Subcategory",
    filterBucket: "Bucket",
    stats: "Core Stats",
    metadata: "Metadata",
    metadataHint: "View metadata",
    ttk: "PvP POTENTIAL",
    ttkPending: "Not applied. Fill frame-baseline damage, TTK, and body-shot forgiveness after checking Bungie updates, verification tracking, and the PvP health+shield baseline.",
    ttkNote: "PvP Potential inherits frame-baseline values into each weapon, with weapon-specific exceptions applied as overrides.",
    serverRequiredTitle: "Open through the local server",
    serverRequiredBody: "This catalog loads JSON data, so it cannot run from a direct file:// HTML page.",
    serverRequiredCommand: "powershell -ExecutionPolicy Bypass -File scripts\\serve_site.ps1",
    serverRequiredUrl: "http://127.0.0.1:8788/",
    hash: "Hash",
    bucket: "Slot",
    rarity: "Rarity",
    categories: "Categories",
    plugSets: "Plug sets",
    perksMods: "Perks / Mods",
    selectPlug: "No selection (base)",
    selectedEffects: "Selected effects",
    noPlugOptions: "No selectable options",
    noStatChanges: "No stat changes",
    openChoices: "Open choices",
    closeChoices: "Close choices",
    armorTertiary: "Tertiary Stat",
    armorTier5: "Tier 5 baseline",
    manualArmorTuning: "Legacy Armor Stat Tuning",
    manualArmorNote: "Legacy armor stats can be adjusted manually from 0-42.",
    class: "Class",
    ammo: "Ammo",
    damage: "Damage",
    weaponSlot: "Weapon slot",
    weaponFrame: "Frame",
    weaponArchetype: "Archetype",
    weaponSystemNew: "New / tiered",
    weaponSystemLegacy: "Legacy / non-tiered",
    release: "Release info",
    releaseWatermark: "Season/expansion watermark",
    collectible: "Collectible",
    mode: "Mode",
    status: "Status",
    sandboxVersion: "Sandbox",
    resilienceTier: "Resilience",
    targetHp: "Target HP",
    weaponParameter: "WP",
    wpBonus: "WP Bonus",
    basePrecisionDamage: "Base Precision Damage",
    baseBodyDamage: "Base Body Damage",
    precisionDamage: "Effective Precision Damage",
    bodyDamage: "Effective Body Damage",
    optimalTtk: "Optimal TTK",
    bodyTtk: "BS TTK",
    critShots: "Crits to Kill",
    bodyShots: "Body Shots to Kill",
    bodyForgiveness: "Body Shot Forgiveness",
    conditions: "Conditions",
    source: "Source",
    ttkScope: "Scope",
    ttkScopeFrame: "Frame baseline",
    ttkScopeWeapon: "Weapon override",
    ttkScopePending: "Pending",
    notReady: "Not applied",
    referenceNeedsVerification: "Reference / needs verification",
    referenceEdgeCase: "Reference / edge-case review",
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
      character: "Subclasses and class setup",
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
    weaponStat: "武器",
    melee: "近接",
    grenade: "グレネード",
    super: "スーパースキル",
    classAbility: "クラス",
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
    weaponStat: "Weapons",
    melee: "Melee",
    grenade: "Grenade",
    super: "Super",
    classAbility: "Class",
  },
};

const boundedStats = new Set([
  "impact",
  "range",
  "stability",
  "handling",
  "reload",
  "aimAssist",
  "recoil",
  "blastRadius",
  "velocity",
  "accuracy",
  "airborne",
  "defense",
  "health",
  "weaponStat",
  "melee",
  "grenade",
  "super",
  "classAbility",
]);

const armorStatKeys = ["weaponStat", "health", "classAbility", "grenade", "super", "melee"];
const armorTier5Values = { primary: 30, secondary: 25, tertiary: 20 };
const armorArchetypeStats = {
  4227065942: { primary: "super", secondary: "melee" },
  549468645: { primary: "health", secondary: "classAbility" },
  2937665788: { primary: "grenade", secondary: "super" },
  3349393475: { primary: "melee", secondary: "health" },
  1807652646: { primary: "weaponStat", secondary: "grenade" },
  2230428468: { primary: "classAbility", secondary: "weaponStat" },
};

const statGlyphLabels = {
  weaponStat: "WPN",
  health: "HP",
  classAbility: "CLS",
  grenade: "GRN",
  super: "SUP",
  melee: "MEL",
};

const armorStatAbbrevLabels = {
  weaponStat: "WPN",
  health: "HP",
  classAbility: "CLS",
  grenade: "GRN",
  super: "SUP",
  melee: "MEL",
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
  filterQuinaryLabel: document.getElementById("filterQuinaryLabel"),
  sortLabel: document.getElementById("sortLabel"),
  primaryFilter: document.getElementById("primaryFilter"),
  secondaryFilter: document.getElementById("secondaryFilter"),
  tertiaryFilter: document.getElementById("tertiaryFilter"),
  quaternaryFilter: document.getElementById("quaternaryFilter"),
  quinaryFilter: document.getElementById("quinaryFilter"),
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
  { label: els.filterQuinaryLabel, select: els.quinaryFilter },
];

function t(key) {
  return text[state.lang][key] || text.en[key] || key;
}

function statLabel(key, compactArmor = false) {
  if (compactArmor && armorStatKeys.includes(key)) {
    return armorStatAbbrevLabels[key] || key.slice(0, 3).toUpperCase();
  }
  return statLabels[state.lang][key] || key;
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

function hasDisplayValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function formatMs(value) {
  return hasDisplayValue(value) ? `${displayValue(value)} ms` : displayValue(value);
}

function formatPercent(value) {
  if (!hasDisplayValue(value)) return "";
  const raw = String(value).trim();
  if (raw.endsWith("%")) return raw;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw;
  const percent = numeric > 1 ? numeric : numeric * 100;
  return `${new Intl.NumberFormat(state.lang === "ja" ? "ja-JP" : "en-US", {
    maximumFractionDigits: 1,
  }).format(percent)}%`;
}

function formatBodyForgiveness(ttk) {
  const shots = hasDisplayValue(ttk.bodyForgivenessShots) ? displayValue(ttk.bodyForgivenessShots) : "";
  const pct = formatPercent(ttk.bodyForgivenessPct);
  if (shots && pct) return `${shots} (${pct})`;
  return shots || pct || "-";
}

function formatWpBonus(ttk) {
  const bonus = formatPercent(ttk.wpBonusPct);
  const maxBonus = formatPercent(ttk.wpMaxBonusPct);
  if (bonus && maxBonus) return `${bonus} / max ${maxBonus}`;
  return bonus || "-";
}

function ttkStatusLabel(status) {
  if (!status) return t("notReady");
  const normalized = String(status).toLowerCase();
  if (normalized === "reference_needs_verification") return t("referenceNeedsVerification");
  if (normalized === "reference_edge_case") return t("referenceEdgeCase");
  if (normalized === "pending") return t("notReady");
  return status;
}

function ttkScopeLabel(scope) {
  const normalized = String(scope || "").toLowerCase();
  if (normalized === "frame_baseline") return t("ttkScopeFrame");
  if (normalized === "weapon_override") return t("ttkScopeWeapon");
  return t("ttkScopePending");
}

function releaseSummary(row) {
  const release = row.release || {};
  const parts = [];
  if (release.watermarkIcon || release.watermarkShelvedIcon || release.versionWatermarkIcons?.length) {
    parts.push(t("releaseWatermark"));
  }
  if (release.collectibleHash) {
    parts.push(`${t("collectible")} ${release.collectibleHash}`);
  }
  return parts.join(" / ");
}

function compactMetaLabel(value) {
  const map = {
    キネティックウェポン: "キネティック",
    エネルギーウェポン: "エネルギー",
    パワーウェポン: "パワー",
    ヘビーウェポン: "ヘビー",
    "Kinetic Weapons": "Kinetic",
    "Energy Weapons": "Energy",
    "Power Weapons": "Power",
    "Heavy Weapons": "Heavy",
  };
  return map[value] || value;
}

function isWeaponRow(row) {
  return (row.sections || []).includes("weapons");
}

function masterworkPlugOptions(row) {
  const options = langData().plugOptions || {};
  return (row.plugSockets || [])
    .filter((socket) => socket.kind === "masterwork")
    .flatMap((socket) => (socket.plugHashes || []).map((hash) => options[String(hash)]).filter(Boolean));
}

function isTieredWeapon(row) {
  if (!isWeaponRow(row)) return false;
  return masterworkPlugOptions(row).some((plug) => {
    const text = `${plug.name || ""} ${plug.description || ""} ${plug.identifier || ""}`.toLowerCase();
    return /\btier\s+\d+\s*:/.test(text) || /weapon's tier|equal to the weapon|武器のレベル|武器のティア|ティア\s*\d+|レベル\s*\d+/.test(text);
  });
}

function weaponSystemLabel(row) {
  if (!isWeaponRow(row)) return "";
  return isTieredWeapon(row) ? t("weaponSystemNew") : t("weaponSystemLegacy");
}

function metadataRows(row, release, plugSets) {
  return [
    [t("hash"), row.hash],
    [t("category"), `${groupLabel(row.primaryGroup)} / ${row.sectionLabel || sectionLabel(row.primarySection)}`],
    [t("type"), row.type],
    [t("bucket"), row.bucket],
    [t("rarity"), row.tier],
    [t("class"), row.class],
    [t("weaponSlot"), row.weaponSlot],
    [t("weaponFrame"), row.weaponFrame],
    [t("weaponArchetype"), row.weaponArchetype],
    [t("filterWeaponSystem"), weaponSystemLabel(row)],
    [t("ammo"), row.ammo],
    [t("damage"), row.damageType],
    [t("release"), release],
    [t("categories"), row.categories],
    [t("plugSets"), plugSets || ""],
  ];
}

function hasKvRows(rows) {
  return rows.some(([, value]) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length));
}

function renderMetadataHover(rows) {
  if (!hasKvRows(rows)) return "";
  return `
    <span class="metadata-popover">
      <button class="metadata-trigger" type="button" aria-label="${esc(t("metadataHint"))}" title="${esc(t("metadata"))}">i</button>
      <span class="metadata-card" role="tooltip">
        ${renderKv(rows)}
      </span>
    </span>
  `;
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
    const [catalog, facets, summary, plugOptions] = await Promise.all([
      loadJson(`./data/catalog.${state.lang}.json`),
      loadJson(`./data/facets.${state.lang}.json`),
      loadJson(`./data/summary.${state.lang}.json`),
      loadJson(`./data/plug_options.${state.lang}.json`).catch(() => ({})),
    ]);
    state.data[state.lang] = { catalog, facets, summary, plugOptions };
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

function defaultSort(section = state.section) {
  return section === "weapons" ? "weaponType" : "name";
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
  if (key === "weaponSystem") return weaponSystemLabel(row);
  return row[key] || "";
}

function distinct(rows, key) {
  if (key === "weaponSystem") {
    const ordered = [t("weaponSystemNew"), t("weaponSystemLegacy")];
    return ordered.filter((value) => rows.some((row) => valueFor(row, key) === value));
  }
  return [...new Set(rows.map((row) => valueFor(row, key)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function filterDefinitions() {
  if (state.section === "weapons") {
    return [
      ["weaponType", t("filterWeaponType")],
      ["ammo", t("filterAmmo")],
      ["damageType", t("filterDamage")],
      ["weaponSlot", t("filterWeaponSlot")],
      ["weaponSystem", t("filterWeaponSystem")],
    ];
  }
  if (state.section === "armor" || (state.group !== "character" && ["hunter", "warlock", "titan"].includes(state.section))) {
    return [
      ["class", t("filterClass")],
      ["armorSlot", t("filterArmorSlot")],
      ["tier", t("filterRarity")],
      ["type", t("type")],
    ];
  }
  if (state.group === "character") {
    return [
      ["type", t("type")],
      ["class", t("filterClass")],
      ["bucket", t("filterBucket")],
      ["tier", t("filterRarity")],
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
    return [
      ["name", t("sortName")],
      ["weaponType", t("sortWeaponType")],
      ["ammo", t("sortAmmo")],
      ["weaponSlot", t("sortSlot")],
      ["damageType", t("sortDamage")],
      ["weaponFrame", t("sortFrame")],
      ["weaponSystem", t("sortWeaponSystem")],
      ["ttk", t("sortTtk")],
      ["rpm", t("sortRpm")],
      ["range", t("sortRange")],
      ["impact", t("sortImpact")],
    ];
  }
  if (state.section === "armor" || (state.group !== "character" && ["hunter", "warlock", "titan"].includes(state.section))) {
    return [
      ["name", t("sortName")],
      ["class", t("filterClass")],
      ["armorSlot", t("filterArmorSlot")],
      ["tier", t("filterRarity")],
      ["type", t("sortType")],
    ];
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
  state.sort = defaultSort(state.section);
  clearFilters(false);
  refresh();
}

function setSection(section) {
  state.section = section;
  state.selectedHash = null;
  state.sort = defaultSort(section);
  clearFilters(false);
  refresh();
}

function clearFilters(render = true) {
  els.searchInput.value = "";
  filterControls.forEach(({ select }) => {
    select.value = "";
  });
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
    state.sort = defaultSort();
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

function compareText(a, b) {
  return String(a || "").localeCompare(String(b || ""), state.lang === "ja" ? "ja-JP" : "en-US", {
    numeric: true,
    sensitivity: "base",
  });
}

function compareNumberDesc(a, b) {
  return Number(b || 0) - Number(a || 0);
}

function compareNumberAsc(a, b) {
  const aMissing = !hasDisplayValue(a);
  const bMissing = !hasDisplayValue(b);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  const av = Number(a);
  const bv = Number(b);
  return av - bv;
}

function statSortValue(row, key) {
  return Number(row.stats?.[key] || row[key] || 0);
}

function ammoRank(row) {
  const label = String(row.ammo || "").toLowerCase();
  if (row.ammoType === 1 || label.includes("primary") || label.includes("プライマリ")) return 0;
  if (row.ammoType === 2 || label.includes("special") || label.includes("特殊")) return 1;
  if (row.ammoType === 3 || label.includes("heavy") || label.includes("ヘビー")) return 2;
  return 99;
}

function slotRank(row) {
  const label = String(row.weaponSlot || row.bucket || "").toLowerCase();
  if (label.includes("kinetic") || label.includes("キネティック")) return 0;
  if (label.includes("energy") || label.includes("エネルギー")) return 1;
  if (label.includes("power") || label.includes("heavy") || label.includes("パワー") || label.includes("ヘビー")) return 2;
  return 99;
}

function damageRank(row) {
  const label = String(row.damageType || "").toLowerCase();
  const order = [
    ["kinetic", "キネティック"],
    ["strand", "ストランド"],
    ["stasis", "ステイシス"],
    ["arc", "アーク"],
    ["solar", "ソーラー"],
    ["void", "ボイド"],
  ];
  const index = order.findIndex((tokens) => tokens.some((token) => label.includes(token)));
  return index === -1 ? 99 : index;
}

function weaponSystemRank(row) {
  if (!isWeaponRow(row)) return 99;
  return isTieredWeapon(row) ? 0 : 1;
}

function ttkHasValue(row) {
  const ttk = row.ttk || {};
  return [
    ttk.basePrecisionDamage,
    ttk.baseBodyDamage,
    ttk.precisionDamage,
    ttk.bodyDamage,
    ttk.optimalTtkMs,
    ttk.bodyTtkMs,
    ttk.critShots,
    ttk.bodyShots,
    ttk.bodyForgivenessShots,
    ttk.bodyForgivenessPct,
  ].some(hasDisplayValue);
}

function sortRows(rows) {
  const sorted = [...rows];
  const sort = state.sort;
  sorted.sort((a, b) => {
    const fallback = compareText(a.name, b.name) || Number(a.hash || 0) - Number(b.hash || 0);
    if (["range", "impact", "rpm"].includes(sort)) {
      return compareNumberDesc(statSortValue(a, sort), statSortValue(b, sort)) || fallback;
    }
    if (sort === "weaponType") {
      return compareText(a.weaponType, b.weaponType) || ammoRank(a) - ammoRank(b) || compareNumberDesc(statSortValue(a, "rpm"), statSortValue(b, "rpm")) || fallback;
    }
    if (sort === "ammo") {
      return ammoRank(a) - ammoRank(b) || compareText(a.weaponType, b.weaponType) || fallback;
    }
    if (sort === "weaponSlot") {
      return slotRank(a) - slotRank(b) || compareText(a.weaponType, b.weaponType) || fallback;
    }
    if (sort === "damageType") {
      return damageRank(a) - damageRank(b) || compareText(a.weaponType, b.weaponType) || fallback;
    }
    if (sort === "weaponFrame") {
      return compareText(a.weaponArchetype || a.weaponFrame, b.weaponArchetype || b.weaponFrame) || compareText(a.weaponType, b.weaponType) || fallback;
    }
    if (sort === "weaponSystem") {
      return weaponSystemRank(a) - weaponSystemRank(b) || compareText(a.weaponType, b.weaponType) || fallback;
    }
    if (sort === "ttk") {
      return Number(!ttkHasValue(a)) - Number(!ttkHasValue(b)) || compareNumberAsc(a.ttk?.optimalTtkMs, b.ttk?.optimalTtkMs) || compareText(a.weaponType, b.weaponType) || fallback;
    }
    if (["section", "type", "class", "armorSlot", "tier"].includes(sort)) {
      return compareText(valueFor(a, sort), valueFor(b, sort)) || fallback;
    }
    return fallback;
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
  if (!boundedStats.has(key)) return null;
  const value = Number(statValue(row, key) || 0);
  return Math.max(0, Math.min(100, value));
}

function clampStat(value) {
  const numeric = Number(value || 0);
  return Math.max(0, Math.min(100, numeric));
}

function signedValue(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric === 0) return "";
  const formatted = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1).replace(/\.0$/, "");
  return `${numeric > 0 ? "+" : ""}${formatted}`;
}

function selectionKey(row, socket) {
  return `${row.hash}:${socket.index}`;
}

function tertiarySelectionKey(row) {
  return `${row.hash}:tertiary-toggle`;
}

function plugFieldOpen(row, socket) {
  return Boolean(state.openPlugSockets[selectionKey(row, socket)]);
}

function selectedPlugSummary(row, socket) {
  const plug = selectedPlugFor(row, socket);
  if (!plug) {
    return {
      name: t("selectPlug"),
      icon: "",
      deltas: {},
      description: "",
    };
  }
  return {
    name: plug.name,
    icon: plug.icon,
    deltas: displayStatDeltas(row, plug),
    description: plug.description || "",
  };
}

function dedupePlugOptions(socket, plugs) {
  if (["masterwork", "armor_archetype"].includes(socket.kind)) return plugs;
  const seen = new Set();
  return plugs.filter((plug) => {
    const key = [
      plug.name || "",
      plug.description || "",
      plug.icon || "",
      plug.identifier || "",
      JSON.stringify(plug.statDeltas || {}),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function plugOptionsFor(row, socket) {
  const options = langData().plugOptions || {};
  let plugs = (socket.plugHashes || []).map((hash) => options[String(hash)]).filter(Boolean);
  if (isArmorRow(row) && socket.kind === "armor_tuning") {
    plugs = plugs.filter((plug) => isArmorTuningAllowed(row, plug));
  }
  return dedupePlugOptions(socket, plugs);
}

function selectedPlugFor(row, socket) {
  const hash = state.selectedPlugs[selectionKey(row, socket)];
  if (!hash) return null;
  return (langData().plugOptions || {})[String(hash)] || null;
}

function selectedPlugsFor(row) {
  return (row.plugSockets || []).map((socket) => selectedPlugFor(row, socket)).filter(Boolean);
}

function armorArchetypeSocket(row) {
  return (row.plugSockets || []).find((socket) => socket.kind === "armor_archetype") || null;
}

function armorArchetypeConfigForPlug(plug) {
  return armorArchetypeStats[String(plug?.hash)] || null;
}

function armorTertiaryStateKey(row) {
  return `${row.hash}:tertiary`;
}

function armorArchetypeSelection(row) {
  const socket = armorArchetypeSocket(row);
  if (!socket) return null;
  const plug = selectedPlugFor(row, socket);
  const config = armorArchetypeConfigForPlug(plug);
  if (!plug || !config) return null;
  return { socket, plug, config };
}

function armorTertiaryOptions(row) {
  const selection = armorArchetypeSelection(row);
  if (!selection) return [];
  const fixed = new Set([selection.config.primary, selection.config.secondary]);
  return armorStatKeys.filter((key) => !fixed.has(key));
}

function selectedArmorTertiary(row) {
  const selected = state.armorTertiary[armorTertiaryStateKey(row)];
  return armorTertiaryOptions(row).includes(selected) ? selected : "";
}

function armorArchetypeBaseDeltas(plug) {
  const config = armorArchetypeConfigForPlug(plug);
  if (!config) return {};
  return {
    [config.primary]: armorTier5Values.primary,
    [config.secondary]: armorTier5Values.secondary,
  };
}

function armorArchetypeDeltas(row) {
  const selection = armorArchetypeSelection(row);
  if (!selection) return {};
  const deltas = armorArchetypeBaseDeltas(selection.plug);
  const tertiary = selectedArmorTertiary(row);
  if (tertiary) {
    deltas[tertiary] = armorTier5Values.tertiary;
  }
  return deltas;
}

function isArmorMasterworkPlug(plug) {
  return /v460\.plugs\.armor\.masterworks/i.test(plug?.identifier || "");
}

function isArmorTuningPlug(plug) {
  return /core\.gear_systems\.armor_tiering\.plugs\.tuning\.mods/i.test(plug?.identifier || "");
}

function positiveArmorStatForPlug(plug) {
  const positives = armorStatKeys.filter((key) => Number(plug?.statDeltas?.[key] || 0) > 0);
  return positives.length === 1 ? positives[0] : "";
}

function isBalancedArmorTuningPlug(plug) {
  const deltas = plug?.statDeltas || {};
  return armorStatKeys.every((key) => Number(deltas[key] || 0) === 1);
}

function isArmorTuningAllowed(row, plug) {
  if (!isArmorRow(row) || !isArmorTuningPlug(plug)) return true;
  const deltas = plug?.statDeltas || {};
  if (!Object.keys(deltas).length || isBalancedArmorTuningPlug(plug)) return true;
  const tertiary = selectedArmorTertiary(row);
  return Boolean(tertiary && positiveArmorStatForPlug(plug) === tertiary);
}

function clearInvalidArmorTuningSelection(row) {
  (row.plugSockets || [])
    .filter((socket) => socket.kind === "armor_tuning")
    .forEach((socket) => {
      const key = selectionKey(row, socket);
      const plug = selectedPlugFor(row, socket);
      if (plug && !isArmorTuningAllowed(row, plug)) {
        delete state.selectedPlugs[key];
      }
    });
}

function armorMasterworkDeltas(row, plug) {
  if (!isArmorRow(row) || !isArmorMasterworkPlug(plug)) return null;
  const selection = armorArchetypeSelection(row);
  if (!selection) return plug?.statDeltas || {};
  const tertiary = selectedArmorTertiary(row);
  if (!tertiary) return {};
  const topStats = new Set([selection.config.primary, selection.config.secondary, tertiary]);
  return Object.fromEntries(
    Object.entries(plug?.statDeltas || {}).filter(([key]) => armorStatKeys.includes(key) && !topStats.has(key))
  );
}

function applicableStatDeltas(row, plug) {
  if (armorArchetypeConfigForPlug(plug)) return {};
  if (!isArmorTuningAllowed(row, plug)) return {};
  const deltas = armorMasterworkDeltas(row, plug) ?? plug?.statDeltas ?? {};
  const allowed = new Set(Object.keys(row.stats || {}));
  if (isArmorRow(row)) {
    armorStatKeys.forEach((key) => allowed.add(key));
  }
  if (!allowed.size) return deltas;
  return Object.fromEntries(
    Object.entries(deltas).filter(([key]) => allowed.has(key))
  );
}

function displayStatDeltas(row, plug) {
  if (armorArchetypeConfigForPlug(plug)) {
    const selection = armorArchetypeSelection(row);
    if (selection && Number(selection.plug.hash) === Number(plug.hash)) {
      return armorArchetypeDeltas(row);
    }
    return armorArchetypeBaseDeltas(plug);
  }
  return applicableStatDeltas(row, plug);
}

function statDeltasFor(row) {
  const deltas = {};
  Object.entries(armorArchetypeDeltas(row)).forEach(([key, value]) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric) || numeric === 0) return;
    deltas[key] = (deltas[key] || 0) + numeric;
  });
  selectedPlugsFor(row).forEach((plug) => {
    Object.entries(applicableStatDeltas(row, plug)).forEach(([key, value]) => {
      const numeric = Number(value || 0);
      if (!Number.isFinite(numeric) || numeric === 0) return;
      deltas[key] = (deltas[key] || 0) + numeric;
    });
  });
  Object.entries(manualArmorDeltas(row)).forEach(([key, value]) => {
    deltas[key] = (deltas[key] || 0) + Number(value || 0);
  });
  return deltas;
}

function isArmorRow(row) {
  return (row.sections || []).includes("armor");
}

function isClassItem(row) {
  return /class items|class armor|cloak|mark|bond|クラス/i.test(`${row.armorSlot || ""} ${row.type || ""}`);
}

function hasNewArmorStats(row) {
  return armorStatKeys.some((key) => Number(row.stats?.[key] || 0) > 0);
}

function hasNewArmorSystem(row) {
  return (row.plugSockets || []).some((socket) => ["armor_archetype", "armor_tuning"].includes(socket.kind));
}

function shouldShowManualArmor(row) {
  return isArmorRow(row) && !isClassItem(row) && !hasNewArmorStats(row) && !hasNewArmorSystem(row);
}

function manualArmorValues(row) {
  const existing = state.manualArmor[row.hash] || {};
  const values = {};
  armorStatKeys.forEach((key) => {
    const raw = existing[key] ?? row.stats?.[key] ?? 0;
    values[key] = Math.max(0, Math.min(42, Number(raw || 0)));
  });
  return values;
}

function manualArmorDeltas(row) {
  if (!shouldShowManualArmor(row)) return {};
  const values = manualArmorValues(row);
  const deltas = {};
  armorStatKeys.forEach((key) => {
    const base = Number(row.stats?.[key] || 0);
    deltas[key] = values[key] - base;
  });
  return deltas;
}

function adjustedStats(stats, deltas) {
  const merged = { ...(stats || {}) };
  Object.entries(deltas || {}).forEach(([key, delta]) => {
    const base = Number(merged[key] || 0);
    if (!Number.isFinite(base)) return;
    merged[key] = base + Number(delta || 0);
  });
  return merged;
}

function statDeltaChips(deltas, compactArmor = false) {
  const entries = Object.entries(deltas || {}).filter(([, value]) => Number(value || 0) !== 0);
  if (!entries.length) return `<span class="delta-empty">${esc(t("noStatChanges"))}</span>`;
  return entries
    .map(([key, value]) => {
      const numeric = Number(value || 0);
      const tone = numeric > 0 ? "positive" : "negative";
      const label = statLabel(key, compactArmor);
      return `<span class="delta-chip delta-chip--${tone}">${esc(label)} ${esc(signedValue(numeric))}</span>`;
    })
    .join("");
}

function plugOptionLabel(row, plug) {
  const deltaText = Object.entries(displayStatDeltas(row, plug))
    .filter(([, value]) => Number(value || 0) !== 0)
    .map(([key, value]) => `${statLabel(key, isArmorRow(row))} ${signedValue(value)}`)
    .join(" / ");
  return deltaText ? `${plug.name} (${deltaText})` : plug.name;
}

function renderPlugBuilder(row) {
  const sockets = row.plugSockets || [];
  const manualArmor = renderManualArmorTuning(row);
  if (!sockets.length && !manualArmor) return "";
  return `
    <section class="panel plug-builder">
      <h3>${esc(t("perksMods"))}</h3>
      ${sockets.length ? renderSocketSelectors(row, sockets) : ""}
      ${manualArmor}
    </section>
  `;
}

function renderSocketSelectors(row, sockets) {
  return `
    <div class="plug-grid">
      ${sockets
        .map((socket) => {
          const selectedHash = state.selectedPlugs[selectionKey(row, socket)] || "";
          const options = plugOptionsFor(row, socket);
          if (!options.length) return "";
          const isOpen = plugFieldOpen(row, socket);
          const summary = selectedPlugSummary(row, socket);
          const toggleLabel = isOpen ? t("closeChoices") : t("openChoices");
          const tertiarySelector = socket.kind === "armor_archetype" ? renderArmorTertiarySelector(row) : "";
          return `
            <div class="plug-field${isOpen ? " is-open" : ""}">
              <button class="plug-toggle" type="button" data-plug-toggle data-socket-index="${esc(socket.index)}" aria-expanded="${esc(String(isOpen))}">
                ${summary.icon ? `<img class="plug-toggle-icon" src="${esc(summary.icon)}" alt="">` : `<span class="plug-toggle-icon plug-toggle-icon--empty">OFF</span>`}
                <span class="plug-toggle-main">
                  <strong>${esc(socket.label)}</strong>
                  <span>${esc(summary.name)}</span>
                  <span class="plug-toggle-deltas">${statDeltaChips(summary.deltas, isArmorRow(row))}</span>
                </span>
                <span class="plug-toggle-action">${esc(toggleLabel)}</span>
              </button>
              ${
                isOpen
                  ? `<div class="plug-option-grid" role="listbox" aria-label="${esc(socket.label)}">
                      <button class="plug-option plug-option--clear${selectedHash ? "" : " is-selected"}" type="button" data-plug-button data-socket-index="${esc(socket.index)}" data-plug-hash="" title="${esc(t("selectPlug"))}" aria-pressed="${esc(String(!selectedHash))}">
                        <span class="plug-option-icon">OFF</span>
                        <span class="plug-option-name">${esc(t("selectPlug"))}</span>
                      </button>
                      ${options.map((plug) => renderPlugOption(row, socket, plug, selectedHash)).join("")}
                    </div>`
                  : ""
              }
            </div>
            ${tertiarySelector}
          `;
        })
        .join("")}
    </div>
  `;
}

function renderArmorTertiarySelector(row) {
  const options = armorTertiaryOptions(row);
  if (!options.length) return "";
  const current = selectedArmorTertiary(row);
  const isOpen = Boolean(state.openPlugSockets[tertiarySelectionKey(row)]);
  const currentLabel = current ? statLabel(current, true) : t("selectPlug");
  const toggleLabel = isOpen ? t("closeChoices") : t("openChoices");
  return `
    <div class="plug-field plug-field--tertiary${isOpen ? " is-open" : ""}">
      <button class="plug-toggle" type="button" data-armor-tertiary-toggle aria-expanded="${esc(String(isOpen))}">
        <span class="plug-toggle-icon stat-glyph">${esc(current ? statGlyphLabels[current] || current.slice(0, 3).toUpperCase() : "T5")}</span>
        <span class="plug-toggle-main">
          <strong>${esc(t("armorTertiary"))} <span class="plug-field-sub">${esc(t("armorTier5"))}</span></strong>
          <span>${esc(currentLabel)}</span>
          <span class="plug-toggle-deltas">${current ? statDeltaChips({ [current]: armorTier5Values.tertiary }, true) : statDeltaChips({})}</span>
        </span>
        <span class="plug-toggle-action">${esc(toggleLabel)}</span>
      </button>
      ${
        isOpen
          ? `<div class="plug-option-grid plug-option-grid--stat" role="listbox" aria-label="${esc(t("armorTertiary"))}">
              ${options
                .map((key) => {
                  const label = statLabel(key, true);
                  const isSelected = current === key;
                  return `
                    <button class="plug-option plug-option--stat${isSelected ? " is-selected" : ""}" type="button" data-armor-tertiary="${esc(key)}" title="${esc(`${label} +${armorTier5Values.tertiary}`)}" aria-pressed="${esc(String(isSelected))}">
                      <span class="plug-option-icon stat-glyph">${esc(statGlyphLabels[key] || label.slice(0, 3).toUpperCase())}</span>
                      <span class="plug-option-name">${esc(label)}</span>
                      <span class="plug-option-delta">+${esc(armorTier5Values.tertiary)}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>`
          : ""
      }
    </div>
  `;
}

function renderPlugOption(row, socket, plug, selectedHash) {
  const isSelected = Number(selectedHash) === Number(plug.hash);
  const title = plugOptionLabel(row, plug);
  return `
    <button class="plug-option${isSelected ? " is-selected" : ""}" type="button" data-plug-button data-socket-index="${esc(socket.index)}" data-plug-hash="${esc(plug.hash)}" title="${esc(title)}" aria-pressed="${esc(String(isSelected))}">
      ${plug.icon ? `<img class="plug-option-icon" src="${esc(plug.icon)}" alt="">` : `<span class="plug-option-icon placeholder-icon"></span>`}
      <span class="plug-option-name">${esc(plug.name)}</span>
    </button>
  `;
}

function renderManualArmorTuning(row) {
  if (!shouldShowManualArmor(row)) return "";
  const values = manualArmorValues(row);
  return `
    <div class="manual-armor">
      <div class="manual-armor-head">
        <h4>${esc(t("manualArmorTuning"))}</h4>
        <span>${esc(t("manualArmorNote"))}</span>
      </div>
      <div class="manual-armor-grid">
        ${armorStatKeys
          .map((key) => `
            <label class="manual-stat">
              <span>${esc(statLabel(key, true))}</span>
              <input type="range" min="0" max="42" step="1" value="${esc(values[key])}" data-armor-stat="${esc(key)}">
              <strong>${esc(values[key])}</strong>
            </label>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function detailSummary(row) {
  if ((row.sections || []).includes("weapons")) {
    return [row.ammo, row.damageType, row.weaponSlot].filter(Boolean).map(compactMetaLabel).join(" / ");
  }
  if ((row.sections || []).includes("armor")) {
    return [row.class, row.armorSlot, row.tier].filter(Boolean).map(compactMetaLabel).join(" / ");
  }
  return [row.bucket, row.tier].filter(Boolean).map(compactMetaLabel).join(" / ");
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
  const type = compactMetaLabel(row.weaponType || row.armorSlot || row.type || row.sectionLabel);
  const detail = detailSummary(row);
  const sub = [row.bucket, row.tier].filter(Boolean).map(compactMetaLabel).join(" / ");
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

function renderFrameSummary(row) {
  if (!isWeaponRow(row)) return "";
  const rows = [
    [t("weaponFrame"), row.weaponFrame],
    [t("weaponArchetype"), row.weaponArchetype],
    [statLabel("rpm"), row.rpm],
    [t("filterWeaponSystem"), weaponSystemLabel(row)],
  ].filter(([, value]) => hasDisplayValue(value));
  if (!rows.length) return "";
  return `
    <div class="frame-summary">
      ${rows
        .map(([label, value]) => `
          <span class="frame-chip">
            <span>${esc(label)}</span>
            <strong>${esc(value)}</strong>
          </span>
        `)
        .join("")}
    </div>
  `;
}

function renderStats(stats, deltas = {}, compactArmor = false) {
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
    "weaponStat",
    "health",
    "classAbility",
    "grenade",
    "super",
    "melee",
    "defense",
  ];
  const rows = order.filter((key) => stats?.[key] !== undefined || deltas?.[key] !== undefined);
  if (!rows.length) return `<div class="notice">${esc(t("notReady"))}</div>`;
  return `
    <div class="stat-grid">
      ${rows
        .map((key) => {
          const value = stats?.[key] ?? 0;
          const delta = Number(deltas[key] || 0);
          const adjusted = Number(value || 0) + delta;
          const pct = statPercent({ stats }, key);
          const adjustedPct = boundedStats.has(key) ? clampStat(adjusted) : null;
          const deltaText = signedValue(delta);
          const deltaTone = delta > 0 ? "positive" : "negative";
          const deltaBar =
            pct !== null && delta > 0 && adjustedPct > pct
              ? `<span class="bar-delta bar-delta--positive" style="left:${pct}%;width:${adjustedPct - pct}%"></span>`
              : pct !== null && delta < 0 && adjustedPct < pct
                ? `<span class="bar-delta bar-delta--negative" style="left:${adjustedPct}%;width:${pct - adjustedPct}%"></span>`
                : "";
          return `
            <div class="stat-row${pct === null ? " stat-row--raw" : ""}">
              <div class="stat-head">
                <span>${esc(statLabel(key, compactArmor))}</span>
                <strong class="stat-value">
                  ${esc(displayValue(delta ? adjusted : value))}
                  ${deltaText ? `<em class="stat-delta stat-delta--${deltaTone}">${esc(deltaText)}</em>` : ""}
                </strong>
              </div>
              ${
                pct === null
                  ? ""
                  : `<div class="stat-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${esc(adjustedPct)}">
                      <span class="bar">
                        <span class="bar-base" style="width:${pct}%"></span>
                        ${deltaBar}
                      </span>
                      <span class="stat-scale"><span>0</span><span>100</span></span>
                    </div>`
              }
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

function renderMetricCards(rows, className = "") {
  const cards = rows
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => `
      <div class="metric-card">
        <span>${esc(label)}</span>
        <strong>${esc(value)}</strong>
      </div>
    `)
    .join("");
  return `<div class="metric-grid ${esc(className)}">${cards}</div>`;
}

function renderTtk(row) {
  if (!(row.sections || []).includes("weapons")) return "";
  const ttk = row.ttk || {};
  const hasValue = [
    ttk.basePrecisionDamage,
    ttk.baseBodyDamage,
    ttk.precisionDamage,
    ttk.bodyDamage,
    ttk.optimalTtkMs,
    ttk.bodyTtkMs,
    ttk.critShots,
    ttk.bodyShots,
    ttk.bodyForgivenessShots,
    ttk.bodyForgivenessPct,
  ].some(hasDisplayValue);
  return `
    <section class="panel pvp-panel">
      <h3>${esc(t("ttk"))}</h3>
      <div class="notice compact-notice">${esc(hasValue ? t("ttkNote") : t("ttkPending"))}</div>
      ${renderMetricCards([
        [t("basePrecisionDamage"), displayValue(ttk.basePrecisionDamage)],
        [t("baseBodyDamage"), displayValue(ttk.baseBodyDamage)],
        [t("precisionDamage"), displayValue(ttk.precisionDamage)],
        [t("bodyDamage"), displayValue(ttk.bodyDamage)],
        [t("optimalTtk"), formatMs(ttk.optimalTtkMs)],
        [t("bodyTtk"), formatMs(ttk.bodyTtkMs)],
        [t("critShots"), displayValue(ttk.critShots)],
        [t("bodyShots"), displayValue(ttk.bodyShots)],
        [t("bodyForgiveness"), formatBodyForgiveness(ttk)],
      ], "pvp-metric-grid")}
      ${renderKv([
        [t("ttkScope"), ttkScopeLabel(ttk.sourceScope)],
        [t("status"), ttkStatusLabel(ttk.status)],
        [t("mode"), ttk.mode || "PvP"],
        [t("sandboxVersion"), displayValue(ttk.sandboxVersion)],
        [t("conditions"), ttk.conditions],
        [t("source"), ttk.sourceExtractionId || "data/static/ttk/ttk_candidates.csv"],
      ])}
    </section>
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
  const statDeltas = statDeltasFor(row);
  const release = releaseSummary(row);
  const plugBuilder = renderPlugBuilder(row);
  const ttkPanel = renderTtk(row);
  const metadata = metadataRows(row, release, plugSets);

  els.detail.innerHTML = `
    <div class="detail-shell">
      <div class="detail-hero">
        ${renderIcon(row, "detail-icon")}
        <div>
          <div class="detail-title-row">
            <h2>${esc(row.name)}</h2>
            ${renderMetadataHover(metadata)}
          </div>
          <div class="badge-line">
            ${badges.map((badge) => `<span class="badge">${esc(badge)}</span>`).join("")}
          </div>
          ${row.description ? `<p class="description">${esc(row.description)}</p>` : ""}
        </div>
      </div>

      <div class="detail-workspace${ttkPanel ? "" : " detail-workspace--no-ttk"}">
        <div class="detail-main">
          <section class="panel">
            <h3>${esc(t("stats"))}</h3>
            ${renderFrameSummary(row)}
            ${renderStats(row.stats, statDeltas, isArmorRow(row))}
          </section>
          ${plugBuilder ? `<div class="detail-builder">${plugBuilder}</div>` : ""}
        </div>
        ${ttkPanel ? `<aside class="detail-side">${ttkPanel}</aside>` : ""}
      </div>
    </div>
  `;

  els.detail.querySelectorAll("[data-plug-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const socket = (row.plugSockets || []).find((entry) => String(entry.index) === String(button.dataset.socketIndex));
      if (!socket) return;
      const key = selectionKey(row, socket);
      if (button.dataset.plugHash) {
        state.selectedPlugs[key] = Number(button.dataset.plugHash);
      } else {
        delete state.selectedPlugs[key];
      }
      if (socket.kind === "armor_archetype") {
        const tertiaryKey = armorTertiaryStateKey(row);
        const tertiary = state.armorTertiary[tertiaryKey];
        if (tertiary && !armorTertiaryOptions(row).includes(tertiary)) {
          delete state.armorTertiary[tertiaryKey];
        }
        state.openPlugSockets[tertiarySelectionKey(row)] = Boolean(button.dataset.plugHash);
        clearInvalidArmorTuningSelection(row);
      }
      delete state.openPlugSockets[key];
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-plug-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const socket = (row.plugSockets || []).find((entry) => String(entry.index) === String(button.dataset.socketIndex));
      if (!socket) return;
      const key = selectionKey(row, socket);
      state.openPlugSockets[key] = !state.openPlugSockets[key];
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-armor-tertiary-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = tertiarySelectionKey(row);
      state.openPlugSockets[key] = !state.openPlugSockets[key];
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-armor-tertiary]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.armorTertiary;
      if (!key) return;
      state.armorTertiary[armorTertiaryStateKey(row)] = key;
      delete state.openPlugSockets[tertiarySelectionKey(row)];
      clearInvalidArmorTuningSelection(row);
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-armor-stat]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.armorStat;
      if (!key) return;
      if (!state.manualArmor[row.hash]) {
        state.manualArmor[row.hash] = manualArmorValues(row);
      }
      state.manualArmor[row.hash][key] = Number(input.value || 0);
      renderDetail(row);
    });
  });
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
