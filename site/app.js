const LIMIT = 250;
const DATA_VERSION = "20260610-mot-970-db";

const state = {
  lang: localStorage.getItem("d2ma-lang") || "ja",
  theme: localStorage.getItem("d2ma-theme") || "white",
  group: "equipment",
  section: "weapons",
  sort: "weaponType",
  data: {},
  selectedHash: null,
  selectedPlugs: {},
  manualArmor: {},
  armorTertiary: {},
  openPlugSockets: {},
  armorSetPieces: {},
  armorSetExotics: {},
  armorSetBonuses: {},
  armorBulk: {},
  classBuildWeapons: {},
  classBuildAbilities: {},
  weaponVariantSelections: {},
};

const taxonomy = [
  { id: "character", defaultSection: "build_simulator", sections: ["all", "build_simulator", "subclasses", "abilities", "hunter", "warlock", "titan"] },
  { id: "equipment", defaultSection: "weapons", sections: ["all", "weapons", "armor", "ghosts", "ships", "sparrows", "emblems", "artifacts", "clan_banners"] },
  { id: "appearance", defaultSection: "emotes", sections: ["all", "emotes", "finishers", "shaders", "weapon_ornaments", "armor_ornaments", "ghost_projections", "transmat_effects"] },
  { id: "inventory", defaultSection: "quests", sections: ["all", "quests", "bounties", "lore", "engrams", "packages", "consumables", "materials", "currencies"] },
  { id: "mods", defaultSection: "weapon_mods", sections: ["all", "weapon_mods", "armor_mods", "ghost_mods", "perks", "traits", "intrinsics", "enhanced_traits"] },
  { id: "all", defaultSection: "all", sections: ["all"] },
];

const weaponGenerationOrder = [
  "year1_fixed",
  "year2_random",
  "craftable",
  "enhanceable",
  "new_tiered",
  "fixed_exotic",
  "fixed_legacy",
];

const text = {
  ja: {
    title: "データベース",
    manifest: "Manifest",
    synced: "同期",
    themeWhite: "ホワイト",
    themeBlack: "ブラック",
    loading: "読み込み中",
    search: "検索",
    searchPlaceholder: "名称、説明、カテゴリ、入手元",
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
    sortWeaponSystem: "世代",
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
    enhancedPlug: "強化",
    selectedEffects: "選択中の効果",
    noPlugOptions: "選択候補なし",
    noStatChanges: "ステータス補正なし",
    openChoices: "候補を開く",
    closeChoices: "候補を閉じる",
    armorTertiary: "固有パラメータ",
    armorTier5: "Tier 5基準",
    armorSetBuilder: "Tier5 防具セット",
    armorSetBaseline: "全身Tier5基準",
    armorPieceConfig: "5部位設定",
    armorSetTotals: "パラメータ合計",
    armorArchetype: "アーキタイプ",
    armorGeneralMod: "一般Mod",
    armorFocusMod: "特化Mod",
    armorNoMod: "Modなし",
    armorLowestThreeStats: "低い3ステータス",
    armorExotic: "エキゾチック防具",
    armorExoticSlot: "エキゾ枠",
    armorNoExotic: "未選択",
    armorSetBonus: "セットボーナス",
    armorSetBonusMode: "構成",
    armorSetBonusNone: "なし",
    armorSetBonusTwoTwo: "2 + 2",
    armorSetBonusTwoFour: "2 + 4",
    armorSetBonusPrimary: "セットA",
    armorSetBonusSecondary: "セットB",
    armorSetBonusFour: "4部位セット",
    armorSetBonusEffect: "セット効果",
    armorSetBonusTwoPiece: "2部位",
    armorSetBonusFourPiece: "4部位",
    armorSetPieces: "構成部位",
    allClasses: "全クラス",
    armorSetDetailNote: "防具セットの構成とセット効果を確認できます。ビルド調整はキャラクターのビルドシミュレーターで行います。",
    armorViewItem: "装備詳細を見る",
    armorSetPieceVariants: "同部位候補",
    armorOfficialNames: "正式名称",
    armorOfficialNamePending: "正式名称未照合",
    armorLegacySet: "旧防具セット",
    armorLegacyNoBuild: "旧仕様またはセットボーナスなしの防具セットです。装備詳細の閲覧のみ行い、Tier5パラメータビルドは無効です。",
    armorLegacyNoBuildShort: "詳細閲覧のみ",
    armorSetEffectUnknown: "効果未登録。Manifest上ではセット選択ソケットのみ確認済みです。",
    armorSetSelectorNote: "セット変換Mod",
    armorTotalNote: "固有パラメータ、一般Mod、特化Mod、エキゾ枠、セットボーナス構成のみを比較します。",
    manualArmorTuning: "旧防具ステータス調整",
    manualArmorNote: "旧仕様防具は実値を0-42で手動調整します。",
    buildSimulator: "ビルドシミュレーター",
    buildSimulatorSub: "クラス別のスキル・防具調整",
    buildSimulatorDescription: "クラスごとのサブクラス、アビリティ、Tier5防具パラメータ、エキゾチック防具、セットボーナスを横並びで確認します。",
    buildSimulatorNoLegendary: "レジェンダリー防具選択なし",
    buildSkillConfig: "クラス / スキル構成",
    buildSubclass: "サブクラス",
    buildSuper: "スーパー",
    buildGrenade: "グレネード",
    buildMelee: "近接",
    buildClassAbility: "クラススキル",
    buildMovement: "移動",
    buildAspect1: "特性 1",
    buildAspect2: "特性 2",
    buildFragment1: "かけら 1",
    buildFragment2: "かけら 2",
    buildFragment3: "かけら 3",
    buildFragment4: "かけら 4",
    noAbilitySelected: "未選択",
    abilityIndex: "アビリティ一覧",
    abilityIndexSub: "サブクラス・特性・かけら・スキル",
    abilityIndexDescription: "Manifestから取得できるサブクラス関連のアビリティ、特性、かけら、スーパースキル、近接、グレネード、クラススキル、移動スキルを一覧化します。",
    armorSet: "防具セット",
    armorSetReadOnly: "セット閲覧",
    armorSlotPending: "部位データ未照合",
    armorSetAssumedComplete: "5部位セットとして表示",
    armorBulkSetup: "防具一括設定",
    armorBulkNote: "よく使う組み合わせを5部位へまとめて反映します。",
    applyToAllArmor: "全スロットへ適用",
    classSwitch: "クラス切替",
    weaponSimulation: "武器シミュレーション",
    armorSimulation: "防具シミュレーション",
    weaponLoadout: "武器構成",
    weaponVersions: "別シーズン",
    weaponVersionsSub: "同名武器",
    latestWeaponVersion: "最新",
    selectedWeaponVersion: "選択中",
    armorLoadout: "防具構成",
    kineticSlot: "キネティック枠",
    energySlot: "エネルギー枠",
    powerSlot: "パワー枠",
    selectWeapon: "武器を選択",
    noWeaponSelected: "未選択",
    weaponDetails: "武器詳細",
    classEmblem: "代表エンブレム",
    class: "クラス",
    ammo: "弾薬",
    damage: "属性",
    weaponSlot: "武器スロット",
    weaponFrame: "フレーム",
    weaponArchetype: "アーキタイプ",
    weaponSystemLabels: {
      year1_fixed: "固定パーク",
      year2_random: "ランダムパーク",
      craftable: "クラフト武器",
      enhanceable: "強化武器",
      new_tiered: "新武器 / Tier付き",
      fixed_exotic: "エキゾチック / 固定パーク",
      fixed_legacy: "固定ロール / 儀式・レア等",
      new: "新武器 / Tier付き",
      legacy: "旧武器",
    },
    release: "追加情報",
    releaseWatermark: "シーズン/拡張アイコン",
    releaseInline: "追加時期",
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
      build_simulator: "ビルドシミュレーター",
      abilities: "アビリティ",
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
    themeWhite: "WHITE",
    themeBlack: "BLACK",
    loading: "Loading",
    search: "Search",
    searchPlaceholder: "Name, description, category, source",
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
    sortWeaponSystem: "Generation",
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
    enhancedPlug: "Enhanced",
    selectedEffects: "Selected effects",
    noPlugOptions: "No selectable options",
    noStatChanges: "No stat changes",
    openChoices: "Open choices",
    closeChoices: "Close choices",
    armorTertiary: "Tertiary Stat",
    armorTier5: "Tier 5 baseline",
    armorSetBuilder: "Tier 5 Armor Set",
    armorSetBaseline: "Full Tier 5 baseline",
    armorPieceConfig: "Five-piece setup",
    armorSetTotals: "Stat Totals",
    armorArchetype: "Archetype",
    armorGeneralMod: "General Mod",
    armorFocusMod: "Focus Mod",
    armorNoMod: "No mod",
    armorLowestThreeStats: "Lowest 3 stats",
    armorExotic: "Exotic Armor",
    armorExoticSlot: "Exotic slot",
    armorNoExotic: "Not selected",
    armorSetBonus: "Set Bonus",
    armorSetBonusMode: "Layout",
    armorSetBonusNone: "None",
    armorSetBonusTwoTwo: "2 + 2",
    armorSetBonusTwoFour: "2 + 4",
    armorSetBonusPrimary: "Set A",
    armorSetBonusSecondary: "Set B",
    armorSetBonusFour: "4-piece set",
    armorSetBonusEffect: "Set Effect",
    armorSetBonusTwoPiece: "2-piece",
    armorSetBonusFourPiece: "4-piece",
    armorSetPieces: "Set pieces",
    allClasses: "All classes",
    armorSetDetailNote: "Review set pieces and set effects here. Build tuning lives in the Character build simulator.",
    armorViewItem: "View item details",
    armorSetPieceVariants: "Slot variants",
    armorOfficialNames: "Official names",
    armorOfficialNamePending: "Official name pending",
    armorLegacySet: "Legacy armor set",
    armorLegacyNoBuild: "Legacy or no-set-bonus armor set. Item details remain available, but Tier 5 stat build tools are disabled.",
    armorLegacyNoBuildShort: "Details only",
    armorSetEffectUnknown: "Effect not registered. The Manifest currently exposes only the set selector socket.",
    armorSetSelectorNote: "Set conversion mod",
    armorTotalNote: "Compare only tertiary stats, general mods, focus mods, the Exotic slot, and set bonus layout.",
    manualArmorTuning: "Legacy Armor Stat Tuning",
    manualArmorNote: "Legacy armor stats can be adjusted manually from 0-42.",
    buildSimulator: "Build Simulator",
    buildSimulatorSub: "Class skill and armor tuning",
    buildSimulatorDescription: "Compare subclass, abilities, Tier 5 armor stats, Exotic armor, and set bonus layout for each class.",
    buildSimulatorNoLegendary: "No Legendary armor selection",
    buildSkillConfig: "Class / Skill Setup",
    buildSubclass: "Subclass",
    buildSuper: "Super",
    buildGrenade: "Grenade",
    buildMelee: "Melee",
    buildClassAbility: "Class Ability",
    buildMovement: "Movement",
    buildAspect1: "Aspect 1",
    buildAspect2: "Aspect 2",
    buildFragment1: "Fragment 1",
    buildFragment2: "Fragment 2",
    buildFragment3: "Fragment 3",
    buildFragment4: "Fragment 4",
    noAbilitySelected: "None",
    abilityIndex: "Ability Index",
    abilityIndexSub: "Subclasses, aspects, fragments, and abilities",
    abilityIndexDescription: "Lists subclass-related abilities, aspects, fragments, Supers, melees, grenades, class abilities, and movement abilities available from the manifest.",
    armorSet: "Armor Set",
    armorSetReadOnly: "Set Browser",
    armorSlotPending: "Slot data pending",
    armorSetAssumedComplete: "Displayed as a 5-piece set",
    armorBulkSetup: "Bulk Armor Setup",
    armorBulkNote: "Apply a common armor setup across all five slots.",
    applyToAllArmor: "Apply to all slots",
    classSwitch: "Class Switch",
    weaponSimulation: "Weapon Simulation",
    armorSimulation: "Armor Simulation",
    weaponLoadout: "Weapon Loadout",
    weaponVersions: "Other Seasons",
    weaponVersionsSub: "Same-name weapons",
    latestWeaponVersion: "Latest",
    selectedWeaponVersion: "Selected",
    armorLoadout: "Armor Loadout",
    kineticSlot: "Kinetic Slot",
    energySlot: "Energy Slot",
    powerSlot: "Power Slot",
    selectWeapon: "Select weapon",
    noWeaponSelected: "Not selected",
    weaponDetails: "Weapon Details",
    classEmblem: "Representative Emblem",
    class: "Class",
    ammo: "Ammo",
    damage: "Damage",
    weaponSlot: "Weapon slot",
    weaponFrame: "Frame",
    weaponArchetype: "Archetype",
    weaponSystemLabels: {
      year1_fixed: "Fixed roll",
      year2_random: "Random roll",
      craftable: "Craftable",
      enhanceable: "Enhanceable",
      new_tiered: "New / tiered",
      fixed_exotic: "Exotic / fixed roll",
      fixed_legacy: "Legacy fixed roll",
      new: "New / tiered",
      legacy: "Legacy",
    },
    release: "Release info",
    releaseWatermark: "Season/expansion watermark",
    releaseInline: "Release",
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
      build_simulator: "Build Simulator",
      abilities: "Abilities",
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
const armorTertiaryStatOrder = ["health", "melee", "grenade", "super", "classAbility", "weaponStat"];
const armorTier5Values = { primary: 30, secondary: 25, tertiary: 20 };
const armorArchetypeStats = {
  1418248448: { primary: "super", secondary: "health" },
  4227065942: { primary: "super", secondary: "melee" },
  549468645: { primary: "health", secondary: "classAbility" },
  2503381935: { primary: "health", secondary: "grenade" },
  1687144140: { primary: "melee", secondary: "weaponStat" },
  2937665788: { primary: "grenade", secondary: "super" },
  2222960133: { primary: "grenade", secondary: "classAbility" },
  3349393475: { primary: "melee", secondary: "health" },
  1807652646: { primary: "weaponStat", secondary: "grenade" },
  544009373: { primary: "weaponStat", secondary: "super" },
  351770835: { primary: "classAbility", secondary: "melee" },
  2230428468: { primary: "classAbility", secondary: "weaponStat" },
};

const armorClassOrder = ["hunter", "warlock", "titan"];
const armorSetHashes = { hunter: -9101, warlock: -9102, titan: -9103 };
const armorSetHashClasses = Object.fromEntries(Object.entries(armorSetHashes).map(([key, value]) => [String(value), key]));
const buildSimulatorClassOrder = ["titan", "hunter", "warlock"];
const classBuildHashes = { titan: -9201, hunter: -9202, warlock: -9203 };
const classBuildEmblemHashes = { titan: 1907674139, hunter: 1907674138, warlock: 1907674137 };
const classBuildEmblemFallbacks = {
  titan: "https://www.bungie.net/common/destiny2_content/icons/93844c8b76ea80683a880479e3506980.jpg",
  hunter: "https://www.bungie.net/common/destiny2_content/icons/d914fab82fe3f1d6f751627e04338f51.jpg",
  warlock: "https://www.bungie.net/common/destiny2_content/icons/24e9133c9cc157853762de5a2c3853aa.jpg",
};
const buildWeaponSlots = [
  { id: "kinetic", labelKey: "kineticSlot" },
  { id: "energy", labelKey: "energySlot" },
  { id: "power", labelKey: "powerSlot" },
];
const armorPieceSlots = [
  { id: "head", ja: "ヘルメット", en: "Helmet" },
  { id: "arms", ja: "ガントレット", en: "Arms" },
  { id: "chest", ja: "チェスト", en: "Chest" },
  { id: "legs", ja: "レッグ", en: "Legs" },
  { id: "class", ja: "クラスアイテム", en: "Class Item" },
];
const armorSlotGlyphLabels = {
  head: { ja: "頭", en: "HD" },
  arms: { ja: "腕", en: "AR" },
  chest: { ja: "胴", en: "CH" },
  legs: { ja: "脚", en: "LG" },
  class: { ja: "職", en: "CL" },
};
const defaultArmorArchetypeHash = 549468645;
const defaultArmorTertiary = "melee";

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

const enhancedBadgeCache = new Map();

const armorSetBonusEffectData = {
  139044974: {
    en: {
      two: { name: "Paroli", description: "Primary ammo weapons gain a bonus to flinch resistance after sliding." },
      four: { name: "Martingale", description: "Your weapons gain a temporary increase to handling and aim-down-sights speed when an ally is defeated or you revive an ally." },
    },
    ja: {
      two: { name: "Paroli", description: "スライディング後、メインウェポンのひるみ耐性が上昇する。" },
      four: { name: "Martingale", description: "味方が倒される、または味方を蘇生すると、短時間、武器のハンドリングと照準速度が上昇する。" },
    },
  },
  139044987: {
    en: {
      two: { name: "Balestra", description: "Damaging a target with a Sword, Glaive, or melee attack exhausts them. Exhausted targets deal reduced outgoing damage." },
      four: { name: "Stresso Tempo", description: "Blocking attacks with a Sword or Glaive grants a short period of combatant damage resistance when you next drop your guard." },
    },
    ja: {
      two: { name: "Balestra", description: "剣、グレイブ、または近接攻撃で標的にダメージを与えると疲労状態にする。疲労状態の標的は与ダメージが低下する。" },
      four: { name: "Stresso Tempo", description: "剣またはグレイブで攻撃をガードすると、次にガードを解除した時に短時間、戦闘員からのダメージ耐性を得る。" },
    },
  },
  721111598: {
    en: {
      two: { name: "Wrecker", description: "You deal significantly increased Kinetic damage to combatant shields, overshields, vehicles, and constructs." },
      four: { name: "Concussive Rounds", description: "Defeating powerful combatants or breaking a combatant shield with Kinetic damage releases a disorienting Kinetic shockwave." },
    },
    ja: {
      two: { name: "破壊者", description: "戦闘員のシールド、2つ目のシールド、ビークル、建造物に対するキネティックダメージが大幅に上昇する。" },
      four: { name: "震とう弾", description: "強力な戦闘員を倒すか、キネティックダメージで戦闘員のシールドを破壊すると、混乱を適用するキネティック衝撃波を発生させる。" },
    },
  },
  721111611: {
    en: {
      two: { name: "Terminal Velocity", description: "Final blows with Primary ammo weapons grant your Primary ammo weapons temporarily increased reload speed." },
      four: { name: "Power Loader", description: "Picking up an Orb of Power grants Special ammo progress." },
    },
    ja: {
      two: { name: "終端速度", description: "メインウェポンでトドメを刺すと、一時的にメインウェポンのリロード速度が上昇する。" },
      four: { name: "パワーローダー", description: "力のオーブを拾うと特殊ウェポン弾の進行を獲得できる。" },
    },
  },
  1012508294: {
    en: {
      two: { name: "Fanfare", description: "Gain increased reload speed for the bottom half of your equipped weapon's magazine." },
      four: { name: "Suros Harmony", description: "Reloading a weapon grants bonus handling and reduced incoming flinch for a short time. Weapons with SUROS Synergy gain increased range instead." },
    },
    ja: {
      two: { name: "Fanfare", description: "装備中の武器のマガジンが半分以下の間、リロード速度が上昇する。" },
      four: { name: "Suros Harmony", description: "武器をリロードすると短時間ハンドリングが上昇し、受けるひるみが減少する。SUROSシナジーの起源特性を持つ武器は代わりに射程が上昇する。" },
    },
  },
  1012508307: {
    en: {
      two: { name: "Rapid Repair", description: "When your shields begin to regenerate, gain flinch resistance and damage resistance for a short time." },
      four: { name: "Built From Scratch", description: "While reserves are low, combatant weapon final blows provide additional ammo progress based on ammo type." },
    },
    ja: {
      two: { name: "Rapid Repair", description: "シールドの回復が始まると、短時間ひるみ耐性とダメージ耐性を得る。" },
      four: { name: "Built From Scratch", description: "予備弾薬が少ない間、武器で戦闘員にトドメを刺すと弾薬タイプに応じた追加の弾薬進行を得る。" },
    },
  },
  1220635053: {
    en: {
      two: { name: "Crook and Flail", description: "Picking up an ammo brick heals you." },
      four: { name: "Gift of Sight", description: "Final blows with Primary ammo weapons grant you briefly increased radar resolution." },
    },
    ja: {
      two: { name: "クルックとフレイル", description: "弾薬箱を拾うと体力が回復する。" },
      four: { name: "賜りし視覚", description: "メインウェポンでトドメを刺すと、一時的にレーダーの解像度が上がる。" },
    },
  },
  1220635064: {
    en: {
      two: { name: "Iaido", description: "Final blows with freshly drawn or reloaded weapons heal you." },
      four: { name: "Unfaltering Focus", description: "Bow, Shotgun, or Sword final blows temporarily reduce incoming damage. Damaging targets with those weapons extends the effect." },
    },
    ja: {
      two: { name: "居合道", description: "リロードしたばかりの武器または構えたばかりの武器でトドメを刺すと、体力が回復する。" },
      four: { name: "揺るぎない集中", description: "弓、ショットガン、または剣でトドメを刺すと、一時的に被ダメージが減少する。これらの武器で標的にダメージを与えると、効果が延長される。" },
    },
  },
  1404854454: {
    en: {
      two: { name: "Force Converter", description: "After a final blow with a Rocket Launcher, Grenade Launcher, or micro-missile, sprint for a short time to gain Speed Booster." },
      four: { name: "Reactive Booster", description: "Once per Force Converter activation, sprinting at critical health, being suspended, or being slowed by Stasis immediately grants Speed Booster for a short time." },
    },
    ja: {
      two: { name: "動力変換器", description: "ロケットランチャー、グレネードランチャー、またはマイクロミサイルでトドメを刺した後に短い時間ダッシュすると、スピードブースターを獲得する。" },
      four: { name: "反応性ブースター", description: "動力変換器の発動につき1回のみ、瀕死状態でのダッシュ、または停止・遅延状態になると、即座に短時間スピードブースターを獲得する。" },
    },
  },
  1530138662: {
    en: {
      two: { name: "Special Relativity", description: "Picking up ammo reloads stowed Special weapons from reserves." },
      four: { name: "Superluminal Motion", description: "After dealing damage with your Super, health and shields regenerate over time while you are in motion. Additional Super damage refreshes this effect." },
    },
    ja: {
      two: { name: "Special Relativity", description: "弾薬を拾うと、しまっている特殊ウェポンが予備弾薬からリロードされる。" },
      four: { name: "Superluminal Motion", description: "スーパースキルでダメージを与えた後、移動中に体力とシールドが徐々に回復する。追加のスーパーダメージでこの効果が更新される。" },
    },
  },
  1841728090: {
    en: {
      two: { name: "Combat Meditation", description: "Sword hits return grenade and class energy. Bonus energy is granted if Blade Focus is active." },
      four: { name: "Blade Focus", description: "Briefly guard with a Sword to ready Blade Focus. While readied, Sword hits increase Sword damage and lunge distance for a moderate duration." },
    },
    ja: {
      two: { name: "Combat Meditation", description: "剣で攻撃を当てるとグレネードエネルギーとクラススキルエネルギーが戻る。Blade Focusが有効な場合は追加エネルギーを得る。" },
      four: { name: "Blade Focus", description: "剣で短くガードするとBlade Focusを準備する。準備中に剣を当てると、一定時間、剣ダメージと突進距離が上昇する。" },
    },
  },
  2824493179: {
    en: {
      two: { name: "Accretion", description: "Picking up an ammo brick gives you a stacking bonus to weapon swap and stow speeds until you die." },
      four: { name: "Doppler Effect", description: "Suspend, unravel, and sever effects applied to targets, and radiant and restoration effects applied to you have increased duration." },
    },
    ja: {
      two: { name: "降着", description: "弾薬箱を拾うと、死ぬまで武器の切り替えと収納速度にスタック可能なボーナスが適用される。" },
      four: { name: "ドップラー効果", description: "標的に適用された停止、分解、切断効果と、自分に付与された発光と回復効果の持続時間が延長される。" },
    },
  },
  2872740129: {
    en: {
      two: { name: "Opening Act", description: "Grenade final blows grant Heat weapons stability and vent speed, and Primary ammo weapons bonus stability and reload speed." },
      four: { name: "Room Clearing", description: "Multiple final blows with Heat or Primary ammo weapons grant bonuses to weapon and grenade stats and increased ammo generation." },
    },
    ja: {
      two: { name: "Opening Act", description: "グレネードでトドメを刺すと、ヒート武器には安定性と放熱速度、メインウェポンには安定性とリロード速度のボーナスが付与される。" },
      four: { name: "Room Clearing", description: "ヒート武器またはメインウェポンで複数のトドメを刺すと、武器とグレネードのステータスが上昇し、弾薬生成量が増加する。" },
    },
  },
  3573256294: {
    en: {
      two: { name: "Pleas Heard", description: "Reloading an Auto Rifle, Scout Rifle, or Sidearm after a final blow slowly restores health until you reenter combat." },
      four: { name: "Magnificent Duty", description: "At critical health, or when healing an ally at critical health, Auto Rifles, Scout Rifles, and Sidearms gain increased range, stability, and reload speed." },
    },
    ja: {
      two: { name: "Pleas Heard", description: "オートライフル、スカウトライフル、またはピストルでトドメを刺した後にリロードすると、再び戦闘に入るまで体力が徐々に回復する。" },
      four: { name: "Magnificent Duty", description: "瀕死状態になる、または瀕死の味方を回復すると、オートライフル、スカウトライフル、ピストルの射程、安定性、リロード速度が上昇する。" },
    },
  },
  3573256307: {
    en: {
      two: { name: "Ride Together, Die Together", description: "Picking up an Orb of Power grants a brief period of rapidly decaying damage reduction." },
      four: { name: "Too Old For This", description: "Defeating a powerful combatant with a finisher grants Special ammo progress and replenishes a small amount of health." },
    },
    ja: {
      two: { name: "Ride Together, Die Together", description: "力のオーブを拾うと、急速に減衰する短時間のダメージ耐性を得る。" },
      four: { name: "Too Old For This", description: "強力な戦闘員をフィニッシャーで倒すと、特殊ウェポン弾の進行を獲得し、少量の体力を回復する。" },
    },
  },
  3782433407: {
    en: {
      two: { name: "Photogalvanic", description: "Receiving healing temporarily grants your Solar weapons increased flinch resistance, handling, and reload speed." },
      four: { name: "Cauterize", description: "Rapid Solar final blows heal you." },
    },
    ja: {
      two: { name: "感光起電", description: "回復を受けると、一時的にソーラー武器のひるみ耐性、ハンドリング、リロード速度が向上する。" },
      four: { name: "焼灼", description: "ソーラーで素早くトドメを刺すと回復する。" },
    },
  },
  3834187337: {
    en: {
      two: { name: "Vigilant Watch", description: "As your health gets lower, your weapons gain increased stability and handling. Weapon final blows while shields are depleted heal you." },
      four: { name: "Iron Conviction", description: "When your shields break, gain increased ammo generation, flinch resistance, and combatant damage resistance for a short time. Final blows extend the effect." },
    },
    ja: {
      two: { name: "Vigilant Watch", description: "体力が低くなるほど武器の安定性とハンドリングが上昇する。シールドがない間の武器でのトドメは体力を回復する。" },
      four: { name: "Iron Conviction", description: "シールドが破壊されると、短時間、弾薬生成、ひるみ耐性、戦闘員からのダメージ耐性が上昇する。トドメを刺すと効果が延長される。" },
    },
  },
  3874641219: {
    en: {
      two: { name: "Reflex Action", description: "Swapping to a Heat weapon, Submachine Gun, or Hand Cannon grants increased handling and accuracy for a short time. Damaging with that weapon extends the effect." },
      four: { name: "Hotshot", description: "Final blows while Reflex Action is active increase weapon stat, stability, reload, and aim assist for Heat weapons, Submachine Guns, and Hand Cannons." },
    },
    ja: {
      two: { name: "Reflex Action", description: "ヒート武器、サブマシンガン、またはハンドキャノンに持ち替えると、短時間ハンドリングと命中精度が上昇する。その武器でダメージを与えると効果が延長される。" },
      four: { name: "Hotshot", description: "Reflex Actionの発動中にトドメを刺すと、ヒート武器、サブマシンガン、ハンドキャノンの武器ステータス、安定性、リロード、照準補佐が上昇する。" },
    },
  },
  4119627352: {
    en: {
      two: { name: "Force Absorption", description: "Final blows with a Rocket Launcher, Grenade Launcher, or micro-missile temporarily decrease incoming area-of-effect damage." },
      four: { name: "Reactive Shock", description: "When Force Absorption is active, taking melee damage causes you to emit a disorienting burst once." },
    },
    ja: {
      two: { name: "動力吸収", description: "ロケットランチャー、グレネードランチャー、またはマイクロミサイルでトドメを刺すと、一時的に範囲攻撃から受けるダメージを軽減する。" },
      four: { name: "反応性ショック", description: "動力吸収の発動中に近接ダメージを受けると、1回だけ混乱の衝撃波を発生させる。" },
    },
  },
};

const els = {
  pageTitle: document.getElementById("pageTitle"),
  manifestMeta: document.getElementById("manifestMeta"),
  langJa: document.getElementById("langJa"),
  langEn: document.getElementById("langEn"),
  themeWhite: document.getElementById("themeWhite"),
  themeBlack: document.getElementById("themeBlack"),
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

function formatTtkSource(source) {
  const value = String(source || "").trim();
  if (!value) return state.lang === "ja" ? "PvP Potential台帳" : "PvP Potential table";
  if (/^WeaponStat:/i.test(value)) return state.lang === "ja" ? "WeaponStat共有表" : "WeaponStat shared sheet";
  if (/^DrYamaHiro:/i.test(value)) return state.lang === "ja" ? "DrYamaHiro検証台帳" : "DrYamaHiro reference sheet";
  if (/data\/static\/ttk|ttk_candidates/i.test(value)) return state.lang === "ja" ? "PvP Potential台帳" : "PvP Potential table";
  return value;
}

function releaseSummary(row, includeInternal = true) {
  const release = row.release || {};
  const parts = [];
  const season = releaseSeasonLabel(row);
  if (season) {
    parts.push(season);
  }
  if (release.sourceString) {
    parts.push(release.sourceString);
  }
  if (release.watermarkIcon || release.watermarkShelvedIcon || release.versionWatermarkIcons?.length) {
    parts.push(t("releaseWatermark"));
  }
  if (includeInternal && release.collectibleHash) {
    parts.push(`${t("collectible")} ${release.collectibleHash}`);
  }
  return parts.join(" / ");
}

function releaseIcon(row) {
  const release = row.release || {};
  return release.watermarkIcon || release.watermarkShelvedIcon || release.versionWatermarkIcons?.[0] || "";
}

function releaseSeasonLabel(row) {
  const release = row.release || {};
  if (release.seasonNumber && release.seasonName) return `S${release.seasonNumber} ${release.seasonName}`;
  if (release.seasonNumber) return `S${release.seasonNumber}`;
  return release.releaseVersion ? release.releaseVersion.toUpperCase() : "";
}

function releaseSourceLabel(row) {
  const textValue = String(row.release?.sourceString || "").trim();
  if (!textValue) return "";
  return textValue
    .replace(/^入手方法[:：]\s*/u, "")
    .replace(/^Source[:：]\s*/i, "")
    .replace(/^Random perks?:?\s*/i, "")
    .replace(/^ランダムパーク[:：]\s*/u, "")
    .trim();
}

function releaseListLabel(row) {
  const season = releaseSeasonLabel(row);
  if (season) return season;
  const source = releaseSourceLabel(row);
  if (source && !/コレクションから再入手|Collections/i.test(source)) return source;
  if (releaseIcon(row)) return t("releaseInline");
  return "";
}

function renderReleaseInline(row) {
  const icon = releaseIcon(row);
  const label = releaseListLabel(row);
  if (!icon && !label) return "";
  const title = releaseSummary(row, false) || label || t("releaseInline");
  return `
    <span class="row-release" title="${esc(title)}">
      ${icon ? `<img src="${esc(icon)}" alt="">` : ""}
      <span>${esc(label || t("releaseInline"))}</span>
    </span>
  `;
}

function releaseLabel(release = {}) {
  const row = { release };
  return [releaseSeasonLabel(row), releaseSourceLabel(row), release.releaseVersion]
    .filter(Boolean)
    .join(" ");
}

function releaseVersionNumber(value = {}) {
  const release = value.release || value;
  const match = String(release.releaseVersion || "").match(/v(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function releaseSortNumber(value = {}) {
  const release = value.release || value;
  return releaseVersionNumber(release) || Number(release.seasonNumber || 0);
}

function compareReleaseDesc(a, b) {
  return compareNumberDesc(releaseSortNumber(a), releaseSortNumber(b))
    || compareNumberDesc(a?.release?.seasonNumber ?? a?.seasonNumber, b?.release?.seasonNumber ?? b?.seasonNumber)
    || compareText(b?.release?.releaseVersion ?? b?.releaseVersion, a?.release?.releaseVersion ?? a?.releaseVersion);
}

function stableNegativeHash(value) {
  let hash = 2166136261;
  String(value || "").split("").forEach((char) => {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return -Math.max(1, hash >>> 0);
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripArmorSlotSuffix(coreName) {
  const prefixPattern = /^(Helmet|Helm|Hood|Mask|Cowl|Casque|Headpiece|Gauntlets|Gloves|Grips|Grasps|Sleeves|Vambraces|Chest Armor|Chestplate|Plate|Vest|Jacket|Tunic|Robes|Robe|Cuirass|Leg Armor|Legguards|Legplates|Legs|Pants|Boots|Greaves|Strides|Steps|Cloak|Mark|Bond|Visor|Coat|Duster|Hat|Crown|Wrap|Wraps|Mantle|Facade|Treads|Chassis|Overcoat|Chest Rig|Harness|Rig|Cage|Fists|Guard|Armor)\s+of\s+/i;
  const slotSuffixes = [
    "Chest Armor",
    "Chestplate",
    "Class Item",
    "Leg Armor",
    "Headpiece",
    "Legguards",
    "Legplates",
    "Legs",
    "Pants",
    "Vambraces",
    "Gauntlets",
    "Gloves",
    "Grasps",
    "Greaves",
    "Helmet",
    "Sleeves",
    "Strides",
    "Steps",
    "Chaps",
    "Cloaked Stetson",
    "Vestment",
    "Tunic",
    "Mind",
    "Boots",
    "Casque",
    "Cloak",
    "Cover",
    "Cowl",
    "Grips",
    "Helm",
    "Hood",
    "Mark",
    "Mask",
    "Plate",
    "Robes",
    "Robe",
    "Vest",
    "Jacket",
    "Bond",
    "Cuirass",
    "ヘッドアーマー",
    "チェストアーマー",
    "チェストプレート",
    "クラスアイテム",
    "レッグアーマー",
    "レッグプレート",
    "レッグガード",
    "ヘッドピース",
    "レッグ",
    "ガントレット",
    "グローブ",
    "グラスプ",
    "グリーブ",
    "ストライド",
    "スリーブ",
    "ヘルメット",
    "キュイラス",
    "プレート",
    "クローク",
    "クローク付きステットソン",
    "カスク",
    "カバー",
    "フード",
    "ブーツ",
    "グリップ",
    "ジャケット",
    "チャップス",
    "ステップ",
    "チュニック",
    "パンツ",
    "腕甲",
    "ヘルム",
    "マスク",
    "ローブ",
    "式服",
    "ベスト",
    "意志",
    "心",
    "バンド",
    "紋章",
    "ボンド",
    "マント",
    "ケープ",
  ];
  const namedPieceSuffixes = [
    "Visor",
    "Coat",
    "Duster",
    "Hat",
    "Crown",
    "Wrap",
    "Wraps",
    "Mantle",
    "Facade",
    "Treads",
    "Chassis",
    "Overcoat",
    "Chest Rig",
    "Harness",
    "Rig",
    "Cage",
    "Fists",
    "Guard",
    "Armor",
    "Footsteps",
    "バイザー",
    "コート",
    "ハット",
    "王冠",
    "ラップ",
    "マントル",
    "ファサード",
    "トレッド",
    "シャーシ",
    "オーバーコート",
    "チェストリグ",
    "ハーネス",
    "リグ",
    "ケージ",
    "冠",
    "アーマー",
    "足跡",
    "拳",
    "ガード",
    "サークレット",
    "覆い",
  ];
  const undelimitedPieceSuffixes = [
    "オーバーコート",
    "チェストリグ",
    "ハーネス",
    "サークレット",
    "覆い",
    "ケープ",
    "コート",
    "ハット",
  ];
  const prefixed = coreName.replace(prefixPattern, "");
  const slotStripped = [...slotSuffixes].sort((a, b) => b.length - a.length).reduce((name, suffix) => {
    const escaped = escapeRegExp(suffix);
    const englishPattern = new RegExp(`\\s+${escaped}$`, "i");
    const japanesePattern = new RegExp(`(?:の)?${escaped}$`, "u");
    return name.replace(englishPattern, "").replace(japanesePattern, "").trim();
  }, prefixed);
  const namedStripped = [...namedPieceSuffixes].sort((a, b) => b.length - a.length).reduce((name, suffix) => {
    const escaped = escapeRegExp(suffix);
    const englishPattern = new RegExp(`\\s+${escaped}$`, "i");
    const japanesePattern = new RegExp(`の${escaped}$`, "u");
    return name.replace(englishPattern, "").replace(japanesePattern, "").trim();
  }, slotStripped);
  return [...undelimitedPieceSuffixes].sort((a, b) => b.length - a.length).reduce((name, suffix) => {
    const escaped = escapeRegExp(suffix);
    const japanesePattern = new RegExp(`${escaped}$`, "u");
    return name.replace(japanesePattern, "").trim();
  }, namedStripped).replace(/[・\s-]+$/u, "").trim();
}

function armorSetName(row) {
  const raw = String(row.name || "").trim();
  if (!raw) return "";
  const variantMatch = raw.match(/\s*(\([^)]*\)|（[^）]*）)$/u);
  const variant = variantMatch ? variantMatch[1] : "";
  const core = variant ? raw.slice(0, -variant.length).trim() : raw;
  const stripped = stripArmorSlotSuffix(core);
  return [stripped || core, variant].filter(Boolean).join(" ").trim();
}

function armorSetNameKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\s'’"“”・\-_:：/／]+/gu, "")
    .toLowerCase();
}

function isReadableArmorSetName(value) {
  const key = armorSetNameKey(value);
  if (!key) return false;
  return key.length >= 3 || /[\u3040-\u30ff\u3400-\u9fff]/u.test(key);
}

function armorSetFamilyName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\s・-]*(?:タイプ|TYPE)\s*[0-9０-９]+$/iu, "")
    .replace(/[\s・-]*(?:[0-9０-９]+[A-Z]{1,3}[0-9０-９]+|[A-Z]{1,3}\s*[0-9０-９]+|[0-9０-９]+(?:\.[0-9０-９]+)?)$/iu, "")
    .replace(/[\s・-]+(?:I|II|III|IV|V|VI|VII|VIII|IX|X)$/iu, "")
    .replace(/[\s・-]+(?:Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ)$/u, "")
    .trim();
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

function weaponGenerationId(row) {
  if (!isWeaponRow(row)) return "";
  if (row.weaponGeneration) return row.weaponGeneration;
  if (row.weaponSystem === "new") return "new_tiered";
  if (row.weaponSystem === "legacy") return "year2_random";
  return row.weaponSystem || "";
}

function weaponSystemLabel(row) {
  if (!isWeaponRow(row)) return "";
  const generation = weaponGenerationId(row);
  return t("weaponSystemLabels")[generation] || generation;
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
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${path}${separator}v=${DATA_VERSION}`);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

async function ensureData() {
  if (!state.data.index) {
    state.data.index = await loadJson("./data/index.json");
  }
  if (!state.data[state.lang]) {
    const [facets, summary, plugOptions] = await Promise.all([
      loadJson(`./data/facets.${state.lang}.json`),
      loadJson(`./data/summary.${state.lang}.json`),
      loadJson(`./data/plug_options.${state.lang}.json`).catch(() => ({})),
    ]);
    state.data[state.lang] = { catalog: [], catalogContexts: {}, catalogShards: {}, facets, summary, plugOptions };
  }
  await ensureCatalogForContext();
  await ensureCharacterSupportCatalogs();
}

function langData() {
  return state.data[state.lang] || {};
}

function shardIndexForLang() {
  return state.data.index?.catalogShards?.[state.lang] || {};
}

function catalogShardPathsForContext(group = state.group, section = state.section) {
  const shards = shardIndexForLang();
  const sections = shards.sections || {};

  if (group === "all") {
    if (section === "all") {
      return Object.values(sections).flatMap((groupSections) => Object.values(groupSections || {}));
    }
    return Object.values(sections)
      .map((groupSections) => groupSections?.[section])
      .filter(Boolean);
  }

  if (section === "all") {
    return Object.values(sections[group] || {});
  }

  return sections[group]?.[section] ? [sections[group][section]] : [];
}

function catalogContextKey(group = state.group, section = state.section) {
  return `${group}:${section}`;
}

function mergeCatalogRows(shards) {
  const seen = new Set();
  const rows = [];
  shards.flat().forEach((row) => {
    const key = String(row.hash || "");
    if (!key || seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  });
  return rows;
}

async function loadCatalogShard(path) {
  const data = langData();
  if (!data.catalogShards[path]) {
    data.catalogShards[path] = loadJson(`./data/${path}`);
  }
  return data.catalogShards[path];
}

async function ensureCatalogForContext() {
  const data = langData();
  const key = catalogContextKey();
  if (data.catalogContexts[key]) {
    data.catalog = data.catalogContexts[key];
    return;
  }
  const paths = catalogShardPathsForContext();
  const shardRows = await Promise.all(paths.map(loadCatalogShard));
  data.catalogContexts[key] = mergeCatalogRows(shardRows);
  data.catalog = data.catalogContexts[key];
}

function needsBuildSupport(group = state.group, section = state.section) {
  return group === "character" && ["all", "build_simulator"].includes(section);
}

function needsAbilitySupport(group = state.group, section = state.section) {
  return group === "character";
}

async function ensureSupportCatalog(group, section) {
  const data = langData();
  const key = catalogContextKey(group, section);
  if (data.catalogContexts[key]) return data.catalogContexts[key];
  const paths = catalogShardPathsForContext(group, section);
  const shardRows = await Promise.all(paths.map(loadCatalogShard));
  data.catalogContexts[key] = mergeCatalogRows(shardRows);
  return data.catalogContexts[key];
}

async function ensureCharacterSupportCatalogs() {
  const requests = [];
  if (needsBuildSupport()) {
    requests.push(ensureSupportCatalog("equipment", "weapons"));
    requests.push(ensureSupportCatalog("equipment", "armor"));
    requests.push(ensureSupportCatalog("equipment", "emblems"));
    requests.push(ensureSupportCatalog("character", "subclasses"));
  }
  if (needsAbilitySupport()) {
    requests.push(ensureSupportCatalog("mods", "perks"));
    requests.push(ensureSupportCatalog("mods", "traits"));
  }
  await Promise.all(requests);
}

function supportRows(group, section) {
  return langData().catalogContexts?.[catalogContextKey(group, section)] || [];
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

function rawContextRows() {
  return (langData().catalog || []).filter(rowMatchesContext);
}

function isArmorSetContext() {
  return state.group === "equipment" && state.section === "armor";
}

function armorCatalogRows() {
  const catalog = langData().catalog || [];
  const rows = catalog.some((row) => (row.sections || []).includes("armor")) ? catalog : supportRows("equipment", "armor");
  return rows.filter((row) => (row.sections || []).includes("armor") && !row.isArmorSet);
}

function weaponCatalogRows() {
  const catalog = langData().catalog || [];
  const rows = supportRows("equipment", "weapons").length
    ? supportRows("equipment", "weapons")
    : catalog;
  return rows.filter((row) => (row.sections || []).includes("weapons") && !row.isBuildSimulator);
}

function weaponVariantGroupKey(row) {
  const key = armorSetNameKey(row?.name || "");
  return key || String(row?.name || row?.hash || "").normalize("NFKC").trim().toLowerCase();
}

function compareWeaponVariantLatest(a, b) {
  return compareReleaseDesc(a, b)
    || compareText(a.name, b.name)
    || Number(b.hash || 0) - Number(a.hash || 0);
}

function weaponVariantsFor(row, rows = weaponCatalogRows()) {
  const key = weaponVariantGroupKey(row);
  if (!key) return [];
  return rows
    .filter((candidate) => weaponVariantGroupKey(candidate) === key)
    .sort(compareWeaponVariantLatest);
}

function selectedWeaponVariantForGroup(groupRows) {
  const key = weaponVariantGroupKey(groupRows[0]);
  const selectedHash = state.weaponVariantSelections[key];
  if (selectedHash) {
    const selected = weaponVariantsFor(groupRows[0]).find((row) => Number(row.hash) === Number(selectedHash));
    if (selected) return selected;
  }
  return [...groupRows].sort(compareWeaponVariantLatest)[0] || groupRows[0];
}

function groupWeaponRows(rows) {
  const groups = new Map();
  const passthrough = [];
  rows.forEach((row) => {
    if (!isWeaponRow(row)) {
      passthrough.push(row);
      return;
    }
    const key = weaponVariantGroupKey(row);
    if (!key) {
      passthrough.push(row);
      return;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.values()].map(selectedWeaponVariantForGroup).concat(passthrough);
}

function emblemCatalogRows() {
  const catalog = langData().catalog || [];
  const rows = supportRows("equipment", "emblems").length
    ? supportRows("equipment", "emblems")
    : catalog;
  return rows.filter((row) => (row.sections || []).includes("emblems"));
}

function classIdForRow(row) {
  const explicit = (row.classIds || []).find((id) => armorClassOrder.includes(id));
  if (explicit) return explicit;
  const value = `${row.class || ""} ${row.search || ""}`.toLowerCase();
  if (value.includes("hunter") || value.includes("ハンター")) return "hunter";
  if (value.includes("warlock") || value.includes("ウォーロック")) return "warlock";
  if (value.includes("titan") || value.includes("タイタン")) return "titan";
  return "";
}

function classLabelForId(id, rows = armorCatalogRows()) {
  const match = rows.find((row) => classIdForRow(row) === id && row.class);
  if (match?.class) return match.class;
  return { hunter: state.lang === "ja" ? "ハンター" : "Hunter", warlock: state.lang === "ja" ? "ウォーロック" : "Warlock", titan: state.lang === "ja" ? "タイタン" : "Titan" }[id] || id;
}

function classLabelsForIds(ids, rows = armorCatalogRows()) {
  const ordered = armorClassOrder.filter((id) => ids.includes(id));
  if (ordered.length === armorClassOrder.length) return t("allClasses");
  return ordered.map((id) => classLabelForId(id, rows)).filter(Boolean).join(" / ");
}

function armorSetItemsSorted(items) {
  const seen = new Set();
  return [...items]
    .filter((row) => {
      const key = String(row.hash || "");
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const slotDiff = armorPieceSlots.findIndex((slot) => slot.id === armorSlotId(a)) - armorPieceSlots.findIndex((slot) => slot.id === armorSlotId(b));
      return slotDiff || compareReleaseDesc(a, b) || compareText(a.name, b.name) || Number(a.hash || 0) - Number(b.hash || 0);
    });
}

function armorSetBestRelease(items) {
  return [...items]
    .sort((a, b) => compareReleaseDesc(a, b) || compareText(a.name, b.name))[0]?.release || {};
}

function armorSetItemsBySlot(row) {
  const groups = new Map();
  (row.armorSetItems || []).forEach((item) => {
    const slotId = armorSlotId(item);
    if (!slotId) return;
    if (!groups.has(slotId)) groups.set(slotId, []);
    groups.get(slotId).push(item);
  });
  armorPieceSlots.forEach((slot) => {
    if (groups.has(slot.id)) {
      groups.set(slot.id, armorSetItemsSorted(groups.get(slot.id)));
    }
  });
  return groups;
}

function armorSetDisplaySlots(row) {
  const bySlot = armorSetItemsBySlot(row);
  return armorPieceSlots.map((slot) => {
    const items = bySlot.get(slot.id) || [];
    return {
      slot,
      item: items[0] || null,
      count: items.length,
      missing: !items.length,
    };
  });
}

function armorSetGroupSlots(group) {
  return new Set((group.items || []).map(armorSlotId).filter(Boolean));
}

function armorSetGroupClassId(group) {
  return armorClassOrder.find((id) => group.classIds?.has(id)) || group.classId || "";
}

function armorSetNamesLooselyRelated(shortName, longName) {
  const shortKey = armorSetNameKey(armorSetFamilyName(shortName) || shortName);
  const longKey = armorSetNameKey(armorSetFamilyName(longName) || longName);
  if (!shortKey || !longKey) return false;
  if (shortKey === longKey) return true;
  if (shortKey.length < 3 || longKey.length < 3) return false;
  return longKey.startsWith(shortKey) || shortKey.startsWith(longKey);
}

const armorClassItemSetAliases = [
  {
    classItems: ["binaryphoenix", "双頭のフェニックス"],
    sets: ["anchorseeker", "アンカーシーカー", "swordflight", "ソードフライト", "phoenixstrife", "フェニックスの対立"],
  },
  {
    classItems: ["shelter", "シェルター"],
    sets: ["shelterinplace", "シェルターインプレイス"],
  },
  {
    classItems: ["remembrance", "追憶"],
    sets: ["ironremembrance", "鉄の追憶"],
  },
  {
    classItems: ["efrideet", "エフリディート", "radegast", "ラデガスト", "timur", "ティムール"],
    sets: ["irontribute", "鉄の賛辞"],
  },
  {
    classItems: ["winterhart", "winterborn", "ウィンターボーン"],
    sets: ["winterhart", "ウィンターハート"],
  },
  {
    classItems: ["judgment", "判定"],
    sets: ["flowing", "流動", "crushing", "粉砕"],
  },
  {
    classItems: ["synapticconstruct", "シナプスコンストラクト"],
    sets: ["tesseracttrace", "テセラクトトレース"],
  },
  {
    classItems: ["hodiocentrist", "ホディオセントリスト"],
    sets: ["insightvikti", "洞察のシャーマン"],
  },
  {
    classItems: ["clandestinemaneuvers", "内密作戦"],
    sets: ["insightrover", "洞察の放浪者"],
  },
  {
    classItems: ["antiherovictory", "英雄に抗う勝利"],
    sets: ["insightunyielding", "揺るぎない洞察"],
  },
];

const armorSharedClassItemSetAliases = [
  {
    shared: ["shadow", "影"],
    sets: ["fulminator", "ファルミネイター", "rull", "ラル", "acedefiant", "誇り高きエース"],
  },
];

function armorSetMatchesAlias(name, aliases = []) {
  const key = armorSetNameKey(armorSetFamilyName(name) || name);
  return Boolean(key && aliases.some((alias) => key.includes(armorSetNameKey(alias))));
}

function armorSetAliasRelated(classItemName, targetSetName) {
  const classItemKey = armorSetNameKey(armorSetFamilyName(classItemName) || classItemName);
  const targetKey = armorSetNameKey(armorSetFamilyName(targetSetName) || targetSetName);
  if (!classItemKey || !targetKey) return false;
  return armorClassItemSetAliases.some((entry) => {
    const classMatch = entry.classItems.some((alias) => classItemKey.includes(armorSetNameKey(alias)));
    const setMatch = entry.sets.some((alias) => targetKey.includes(armorSetNameKey(alias)));
    return classMatch && setMatch;
  });
}

function armorSetSharedClassItemRelated(sourceName, targetSetName) {
  return armorSharedClassItemSetAliases.some((entry) => armorSetMatchesAlias(sourceName, entry.shared) && armorSetMatchesAlias(targetSetName, entry.sets));
}

function armorSetGroupsShareTier(a, b) {
  const aTiers = [...(a.tiers || [])].filter(Boolean);
  const bTiers = [...(b.tiers || [])].filter(Boolean);
  if (!aTiers.length || !bTiers.length) return true;
  return aTiers.some((tier) => b.tiers?.has(tier));
}

function armorSetGroupReleaseKey(group) {
  const release = armorSetBestRelease(group.items || []);
  return String(release.seasonNumber || release.releaseVersion || "");
}

function armorSetGroupsShareReleaseWindow(a, b) {
  const aKey = armorSetGroupReleaseKey(a);
  const bKey = armorSetGroupReleaseKey(b);
  if (!aKey || !bKey) return true;
  return aKey === bKey;
}

function armorReleaseHasConcreteSource(release = {}) {
  const source = String(release.sourceString || "");
  if (!source && !release.sourceHash) return false;
  return !/ランダムパーク|random perks?|コレクションから再入手|cannot be reacquired/i.test(source);
}

function armorSetConcreteSourceRelease(group) {
  return (group.items || [])
    .map((item) => item.release || {})
    .find(armorReleaseHasConcreteSource);
}

function armorSetSourceRelease(group) {
  const releases = (group.items || []).map((item) => item.release || {}).filter((release) => release.sourceHash || release.sourceString);
  return armorSetConcreteSourceRelease(group) || releases[0] || armorSetBestRelease(group.items);
}

function armorSetReleaseSourceKey(group) {
  const release = armorSetConcreteSourceRelease(group);
  if (!release) return "";
  const source = release.sourceHash || release.sourceString || "";
  if (!source) return "";
  return [release.seasonNumber || "", release.releaseVersion || "", source].join("|");
}

function armorSetGroupsShareReleaseSource(a, b) {
  const aKey = armorSetReleaseSourceKey(a);
  const bKey = armorSetReleaseSourceKey(b);
  return Boolean(aKey && bKey && aKey === bKey);
}

function armorSetCommonNamePrefix(names) {
  const cleanNames = names.map((name) => String(name || "").trim()).filter(Boolean);
  if (cleanNames.length < 2) return "";
  let prefix = cleanNames[0];
  cleanNames.slice(1).forEach((name) => {
    let index = 0;
    while (index < prefix.length && index < name.length && prefix[index] === name[index]) index += 1;
    prefix = prefix.slice(0, index);
  });
  const endsAtBoundary = /[の・\s-]$/u.test(prefix);
  const isFullName = cleanNames.some((name) => name === prefix);
  const trimmed = prefix.replace(/[の・\s-]+$/u, "").trim();
  if (!endsAtBoundary && !isFullName) return "";
  return trimmed;
}

function armorSourceCollectionName(group) {
  const release = armorSetConcreteSourceRelease(group) || armorSetSourceRelease(group);
  const source = releaseSourceLabel({ release })
    .replace(/で入手できる。?$/u, "")
    .replace(/^このアイテムは.+$/u, "")
    .trim();
  const season = releaseSeasonLabel({ release });
  const base = source || season || group.setName;
  return state.lang === "ja" ? `${base} 防具セット` : `${base} Armor Set`;
}

function armorMergedSourceSetName(entries, fallbackGroup) {
  const nonClassNames = entries
    .map(([, group]) => group)
    .filter((group) => !armorSetGroupSlots(group).has("class"))
    .map((group) => group.setName);
  const prefix = armorSetCommonNamePrefix(nonClassNames);
  if (isReadableArmorSetName(prefix)) return prefix;
  if (nonClassNames.length === 1 && isReadableArmorSetName(nonClassNames[0])) return nonClassNames[0];
  return armorSourceCollectionName(fallbackGroup);
}

function armorReadableSetNameFromItems(items = []) {
  const bodyNames = items
    .filter((item) => armorSlotId(item) && armorSlotId(item) !== "class")
    .map((item) => armorSetName(item))
    .filter(Boolean);
  const uniqueNames = [...new Set(bodyNames)];
  if (uniqueNames.length === 1 && isReadableArmorSetName(uniqueNames[0])) return uniqueNames[0];
  const prefix = armorSetCommonNamePrefix(bodyNames);
  return isReadableArmorSetName(prefix) ? prefix : "";
}

function mergeArmorSetGroup(target, source) {
  (source.items || []).forEach((item) => target.items.push(item));
  (source.sourceNames || new Set()).forEach((name) => target.sourceNames.add(name));
  (source.tiers || new Set()).forEach((tier) => target.tiers.add(tier));
  (source.classIds || new Set()).forEach((id) => target.classIds.add(id));
}

function mergeArmorSetClassItemGroups(groups) {
  [...groups.entries()].forEach(([sourceKey, sourceGroup]) => {
    if (!groups.has(sourceKey)) return;
    const sourceSlots = armorSetGroupSlots(sourceGroup);
    if (sourceSlots.size !== 1 || !sourceSlots.has("class")) return;
    const classId = armorSetGroupClassId(sourceGroup);
    const candidates = [...groups.entries()].filter(([targetKey, targetGroup]) => {
      if (targetKey === sourceKey) return false;
      if (armorSetGroupClassId(targetGroup) !== classId) return false;
      const targetSlots = armorSetGroupSlots(targetGroup);
      if (targetSlots.has("class")) return false;
      if (targetSlots.size < 2) return false;
      if (!armorSetGroupsShareTier(sourceGroup, targetGroup)) return false;
      if (!armorSetGroupsShareReleaseWindow(sourceGroup, targetGroup)) return false;
      if (armorSetNamesLooselyRelated(sourceGroup.setName, targetGroup.setName)) return true;
      if (armorSetAliasRelated(sourceGroup.setName, targetGroup.setName)) return true;
      return targetSlots.size >= 4 && armorSetGroupsShareReleaseSource(sourceGroup, targetGroup);
    });
    const completeCandidates = candidates.filter(([, targetGroup]) => armorSetGroupSlots(targetGroup).size >= 4);
    const selected = completeCandidates.length === 1 ? completeCandidates[0] : candidates.length === 1 ? candidates[0] : null;
    if (!selected) return;
    mergeArmorSetGroup(selected[1], sourceGroup);
    groups.delete(sourceKey);
  });
}

function duplicateArmorSetClassItems(target, source) {
  const existing = new Set((target.items || []).map((item) => String(item.hash || "")));
  (source.items || [])
    .filter((item) => armorSlotId(item) === "class")
    .forEach((item) => {
      const key = String(item.hash || "");
      if (key && existing.has(key)) return;
      target.items.push(item);
      if (key) existing.add(key);
      target.sourceNames.add(item.name);
    });
}

function duplicateSharedArmorClassItems(groups) {
  const entries = [...groups.entries()];
  entries.forEach(([, sourceGroup]) => {
    const sourceSlots = armorSetGroupSlots(sourceGroup);
    if (!sourceSlots.has("class")) return;
    const classItems = (sourceGroup.items || []).filter((item) => armorSlotId(item) === "class");
    if (!classItems.length) return;
    const classId = armorSetGroupClassId(sourceGroup);
    entries.forEach(([targetKey, targetGroup]) => {
      if (!groups.has(targetKey) || sourceGroup === targetGroup) return;
      if (armorSetGroupClassId(targetGroup) !== classId) return;
      const targetSlots = armorSetGroupSlots(targetGroup);
      if (targetSlots.has("class")) return;
      if (targetSlots.size < 4) return;
      if (!armorSetGroupsShareTier(sourceGroup, targetGroup)) return;
      if (!armorSetGroupsShareReleaseWindow(sourceGroup, targetGroup)) return;
      if (!armorSetSharedClassItemRelated(sourceGroup.setName, targetGroup.setName)) return;
      duplicateArmorSetClassItems(targetGroup, sourceGroup);
    });
  });
}

function mergeReleaseSourceArmorSetGroups(groups) {
  const buckets = new Map();
  [...groups.entries()].forEach(([groupKey, group]) => {
    const sourceKey = armorSetReleaseSourceKey(group);
    if (!sourceKey) return;
    if (armorSetGroupSlots(group).size >= 5) return;
    const bucketKey = [armorSetGroupClassId(group), sourceKey].join("|");
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push([groupKey, group]);
  });
  buckets.forEach((entries) => {
    if (entries.length < 2 || entries.length > 8) return;
    const unionSlots = new Set();
    entries.forEach(([, group]) => armorSetGroupSlots(group).forEach((slot) => unionSlots.add(slot)));
    if (unionSlots.size !== 5) return;
    const [targetKey, targetGroup] = entries
      .slice()
      .sort((a, b) => armorSetGroupSlots(b[1]).size - armorSetGroupSlots(a[1]).size || b[1].items.length - a[1].items.length)[0];
    entries.forEach(([sourceKey, sourceGroup]) => {
      if (sourceKey === targetKey) return;
      if (!groups.has(sourceKey)) return;
      mergeArmorSetGroup(targetGroup, sourceGroup);
      groups.delete(sourceKey);
    });
    targetGroup.setName = armorMergedSourceSetName(entries, targetGroup);
  });
}

function isLowTierArmorTier(tier) {
  const value = String(tier || "").toLowerCase();
  return ["一般", "コモン", "アンコモン", "レア", "common", "uncommon", "rare"].includes(value);
}

function isLowTierArmorGroup(group) {
  return [...(group.tiers || [])].some(isLowTierArmorTier);
}

function armorLowTierBucketKey(group) {
  const release = armorSetBestRelease(group.items);
  const classId = armorSetGroupClassId(group);
  const tierKey = [...(group.tiers || [])].filter(Boolean).sort().join("+") || "low";
  return [classId, tierKey, release.seasonNumber || "", release.releaseVersion || ""].join("|");
}

function armorLowTierCollectionName(group) {
  const release = armorSetBestRelease(group.items);
  const tier = [...(group.tiers || [])].find(Boolean) || (state.lang === "ja" ? "低レア" : "Low-tier");
  const season = releaseSeasonLabel({ release });
  const base = state.lang === "ja" ? `${tier}防具セット` : `${tier} Armor Set`;
  return [base, season].filter(Boolean).join(" ");
}

function mergeLowTierArmorSetFragments(groups) {
  const buckets = new Map();
  [...groups.entries()].forEach(([groupKey, group]) => {
    if (!isLowTierArmorGroup(group)) return;
    if (armorSetGroupSlots(group).size >= 5) return;
    const bucketKey = armorLowTierBucketKey(group);
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push([groupKey, group]);
  });
  buckets.forEach((entries) => {
    const unionSlots = new Set();
    entries.forEach(([, group]) => {
      armorSetGroupSlots(group).forEach((slot) => unionSlots.add(slot));
    });
    if (unionSlots.size < 5) return;
    const [targetKey, targetGroup] = entries
      .slice()
      .sort((a, b) => armorSetGroupSlots(b[1]).size - armorSetGroupSlots(a[1]).size || b[1].items.length - a[1].items.length)[0];
    entries.forEach(([sourceKey, sourceGroup]) => {
      if (sourceKey === targetKey) return;
      if (!groups.has(sourceKey)) return;
      mergeArmorSetGroup(targetGroup, sourceGroup);
      groups.delete(sourceKey);
    });
    targetGroup.setName = armorLowTierCollectionName(targetGroup);
  });
}

function shouldShowArmorSetGroup(group) {
  if (isLowTierArmorGroup(group) && armorSetGroupSlots(group).size < 5) return false;
  return true;
}

function armorSlotGlyph(slotId) {
  return armorSlotGlyphLabels[slotId]?.[state.lang] || armorSlotLabel(slotId).slice(0, 2).toUpperCase();
}

function renderArmorSlotIcon(entry, className = "armor-set-mini-icon") {
  if (entry.item?.icon) {
    return `<img class="${className}" src="${esc(entry.item.icon)}" alt="${esc(armorSlotLabel(entry.slot.id))}" title="${esc(entry.item.name)}">`;
  }
  return `<span class="${className} is-missing" title="${esc(`${armorSlotLabel(entry.slot.id)} / ${t("armorSlotPending")}`)}">${esc(armorSlotGlyph(entry.slot.id))}</span>`;
}

function renderArmorSetIconStrip(row) {
  return `
    <span class="armor-set-icon-strip" aria-label="${esc(t("armorSetPieces"))}">
      ${armorSetDisplaySlots(row).map((entry) => renderArmorSlotIcon(entry)).join("")}
    </span>
  `;
}

function armorSetRows(rows = armorCatalogRows()) {
  const groups = new Map();
  rows
    .filter((row) => row.tier !== "Exotic" && row.tier !== "エキゾチック")
    .forEach((row) => {
      const classId = classIdForRow(row);
      const slotId = armorSlotId(row);
      if (!classId || !slotId) return;
      const setName = armorSetName(row);
      if (!setName) return;
      const setFamily = armorSetFamilyName(setName) || setName;
      const familyKey = armorSetNameKey(setFamily) || setFamily;
      const tierKey = armorSetNameKey(row.tier || "tier");
      const seasonKey = row.release?.seasonNumber || row.release?.releaseVersion || "unknown";
      const groupKey = [classId, tierKey, seasonKey, familyKey].join("|");
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          classId,
          familyKey,
          setName: setFamily,
          classIds: new Set(),
          tiers: new Set(),
          items: [],
          sourceNames: new Set(),
        });
      }
      groups.get(groupKey).classIds.add(classId);
      if (row.tier) groups.get(groupKey).tiers.add(row.tier);
      groups.get(groupKey).items.push(row);
      groups.get(groupKey).sourceNames.add(row.name);
    });

  mergeArmorSetClassItemGroups(groups);
  duplicateSharedArmorClassItems(groups);
  mergeReleaseSourceArmorSetGroups(groups);
  mergeLowTierArmorSetFragments(groups);
  groups.forEach((group) => {
    if (isLowTierArmorGroup(group)) return;
    const readableName = armorReadableSetNameFromItems(group.items);
    if (readableName) group.setName = readableName;
  });

  return [...groups.entries()]
    .filter(([, group]) => shouldShowArmorSetGroup(group))
    .map(([groupKey, group]) => {
      const items = armorSetItemsSorted(group.items);
      const release = armorSetBestRelease(items);
      const slots = new Set(items.map(armorSlotId).filter(Boolean));
      const classItem = items.find((row) => armorSlotId(row) === "class") || items[0] || {};
      const classIds = armorClassOrder.filter((id) => group.classIds.has(id));
      const classFilterLabels = classIds.map((id) => classLabelForId(id, rows)).filter(Boolean);
      const classLabel = classLabelsForIds(classIds, rows);
      const setBonusPlug = armorSetBonusOptionForName(group.setName);
      const hasSetBonus = Boolean(setBonusPlug) || items.some((row) => (row.plugSockets || []).some((socket) => socket.kind === "set_bonus"));
      const name = group.setName;
      const slotCount = slots.size;
      const armorSlot = state.lang === "ja" ? "5/5部位" : "5/5 pieces";
      const tier = [...group.tiers][0] || "Tier";
      const hash = stableNegativeHash(groupKey);
      const variantCount = items.length;
      const sourceNames = [...group.sourceNames].join(" ");
      return {
        hash,
        isArmorSet: true,
        armorSetKey: groupKey,
        armorSetName: group.setName,
        armorSetClassId: classIds[0] || "",
        armorSetClassIds: classIds,
        armorSetItems: items,
        armorSetBonusHash: setBonusPlug?.hash || "",
        armorSetCanBuild: false,
        armorSetHasSetBonus: hasSetBonus,
        armorSetSlotCount: 5,
        armorSetActualSlotCount: slotCount,
        armorSetVariantCount: variantCount,
        name,
        description: hasSetBonus ? t("armorSetDetailNote") : t("armorLegacyNoBuild"),
        icon: classItem.icon || "",
        type: t("armorSet"),
        bucket: hasSetBonus ? t("armorSetReadOnly") : t("armorLegacyNoBuildShort"),
        tier,
        itemType: "armor_set",
        groups: ["equipment"],
        sections: ["armor"],
        primaryGroup: "equipment",
        primarySection: "armor",
        sectionLabel: sectionLabel("armor"),
        class: classLabel,
        classIds,
        classFilterLabels,
        categories: [classLabel, t("armor"), group.setName],
        armorSlot,
        stats: {},
        release,
        search: `${name} ${group.setName} ${sourceNames} ${classLabel} ${classFilterLabels.join(" ")} ${tier} ${armorSlot} ${slotCount} ${variantCount} ${releaseLabel(release)} ${hasSetBonus ? t("armorSetBonus") : t("armorLegacyNoBuild")}`.toLowerCase(),
      };
    })
    .sort((a, b) => compareText(a.armorSetName, b.armorSetName) || armorClassOrder.indexOf(a.armorSetClassId) - armorClassOrder.indexOf(b.armorSetClassId) || compareNumberAsc(releaseSortNumber(a), releaseSortNumber(b)));
}

function isBuildSimulatorRow(row) {
  return Boolean(row?.isBuildSimulator);
}

function isAbilityRow(row) {
  return state.group === "character" && (row?.sections || []).includes("abilities");
}

function classBuildEmblem(classId) {
  const hash = classBuildEmblemHashes[classId];
  const row = emblemCatalogRows().find((candidate) => Number(candidate.hash) === Number(hash));
  if (row) return row;
  return {
    hash,
    name: classLabelForId(classId),
    icon: classBuildEmblemFallbacks[classId] || "",
  };
}

function buildSimulatorRows() {
  return buildSimulatorClassOrder.map((classId) => {
    const classLabel = classLabelForId(classId);
    const emblem = classBuildEmblem(classId);
    const name = `${classLabel} ${t("buildSimulator")}`;
    return {
      hash: classBuildHashes[classId],
      isBuildSimulator: true,
      buildClassId: classId,
      name,
      description: t("buildSimulatorDescription"),
      icon: emblem.icon || "",
      type: t("buildSimulator"),
      bucket: t("buildSimulatorNoLegendary"),
      tier: t("armorTier5"),
      itemType: "build_simulator",
      groups: ["character"],
      sections: ["build_simulator"],
      primaryGroup: "character",
      primarySection: "build_simulator",
      sectionLabel: sectionLabel("build_simulator"),
      class: classLabel,
      classIds: [classId],
      categories: [t("buildSimulator"), classLabel, t("buildSkillConfig"), t("armorLoadout")],
      stats: {},
      release: {},
      search: `${name} ${classLabel} ${emblem.name || ""} ${t("buildSimulator")} ${t("buildSkillConfig")} ${t("armorLoadout")}`.toLowerCase(),
    };
  });
}

function abilityBaseType(type) {
  return String(type || "")
    .replace(/\s*\|\s*.*Ability$/i, "")
    .replace(/\s*\|\s*.+スキル$/u, "")
    .trim();
}

function isCharacterAbilityType(row) {
  if ((row.sections || []).includes("weapons") || row.weaponType) return false;
  const type = String(row.type || "").trim();
  const base = abilityBaseType(type);
  const english = /^(Arc|Solar|Void|Stasis|Strand) (Aspect|Trait|Fragment|Grenade|Melee|Super)$|^Prismatic Fragment$|^Class Ability$|^Movement Ability$|^Super Ability$|^Utility Ability$|^Melee$/i;
  const japanese = /^(アーク|ソーラー|ボイド|ステイシス|ストランド)(のかけら|グレネード|近接|近接攻撃|スーパースキル|アスペクト|特性)$|^プリズムのかけら$|^クラススキル$|^移動スキル$|^スーパースキル$|^近接攻撃$/u;
  return english.test(base) || japanese.test(base);
}

function characterAbilityRows() {
  const seen = new Set();
  return [...supportRows("mods", "perks"), ...supportRows("mods", "traits")]
    .filter(isCharacterAbilityType)
    .filter((row) => {
      const key = `${String(row.name || "").toLowerCase()}|${abilityBaseType(row.type).toLowerCase()}|${String(row.class || "").toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row) => ({
      ...row,
      type: abilityBaseType(row.type) || row.type,
      groups: ["character"],
      sections: ["abilities"],
      primaryGroup: "character",
      primarySection: "abilities",
      sectionLabel: sectionLabel("abilities"),
      categories: [t("abilityIndex"), row.type, row.class].filter(Boolean),
      search: `${row.search || ""} ${t("abilityIndex")} ${abilityBaseType(row.type)} ${row.class || ""}`.toLowerCase(),
    }))
    .sort((a, b) => compareText(a.type, b.type) || compareText(a.class, b.class) || compareText(a.name, b.name));
}

const buildAbilitySlots = [
  { id: "super", labelKey: "buildSuper" },
  { id: "grenade", labelKey: "buildGrenade" },
  { id: "melee", labelKey: "buildMelee" },
  { id: "classAbility", labelKey: "buildClassAbility" },
  { id: "movement", labelKey: "buildMovement" },
  { id: "aspect1", labelKey: "buildAspect1" },
  { id: "aspect2", labelKey: "buildAspect2" },
  { id: "fragment1", labelKey: "buildFragment1" },
  { id: "fragment2", labelKey: "buildFragment2" },
  { id: "fragment3", labelKey: "buildFragment3" },
  { id: "fragment4", labelKey: "buildFragment4" },
];

function buildClassIdForRow(row) {
  const explicit = (row.classIds || []).find((id) => armorClassOrder.includes(id));
  if (explicit) return explicit;
  const sections = row.sections || [];
  const sectionClass = armorClassOrder.find((id) => sections.includes(id));
  if (sectionClass) return sectionClass;
  return classIdForRow(row);
}

function buildSubclassRows(classId) {
  const seen = new Set();
  return supportRows("character", "subclasses")
    .filter((row) => buildClassIdForRow(row) === classId)
    .filter((row) => !/未集束|unfocused/i.test(`${row.name || ""} ${row.type || ""}`))
    .filter((row) => {
      const key = armorSetNameKey(row.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => compareText(a.name, b.name));
}

function buildElementId(value = "") {
  const textValue = String(value || "").toLowerCase();
  if (/プリズム|prismatic/.test(textValue)) return "prismatic";
  if (/アーク|arc|ストライカー|アークストライダー|ストームマスター/.test(textValue)) return "arc";
  if (/ソーラー|solar|ガンスリンガー|サンブレーカー|ドーンブレード/.test(textValue)) return "solar";
  if (/ボイド|void|ナイトクローラー|センティネル|ボイドウォーカー/.test(textValue)) return "void";
  if (/ステイシス|stasis|レベナント|ベヒーモス|シェードバインダー/.test(textValue)) return "stasis";
  if (/ストランド|strand|スレッドランナー|バーサーカー|ブルードウィーバー/.test(textValue)) return "strand";
  return "";
}

function subclassElementId(row) {
  return buildElementId(`${row?.name || ""} ${row?.type || ""} ${row?.search || ""}`);
}

function abilityKind(row) {
  const type = abilityBaseType(row.type);
  if (/アスペクト|Aspect/i.test(type) || /^(アーク|ソーラー|ボイド|ステイシス|ストランド)特性/u.test(type) || /^(Arc|Solar|Void|Stasis|Strand) (Trait|Aspect)$/i.test(type)) return "aspect";
  if (/かけら|Fragment/i.test(type)) return "fragment";
  if (/グレネード|Grenade/i.test(type)) return "grenade";
  if (/近接|Melee/i.test(type)) return "melee";
  if (/スーパー|Super/i.test(type)) return "super";
  if (/クラススキル|Class Ability/i.test(type)) return "classAbility";
  if (/移動|Movement/i.test(type)) return "movement";
  return "";
}

const abilityClassPatterns = {
  super: {
    hunter: /ゴールデンガン|刃の雨|アークポール|嵐の鋭刃|シャドウショット|亡霊の刃|沈黙と悲鳴|シルクストライク|golden gun|blade barrage|arc staff|gathering storm|shadowshot|spectral blades|silence and squall|silkstrike|storm'?s edge/i,
    warlock: /デイブレイク|炎のさえずり|ノヴァボム|ノヴァワープ|ストームトランス|カオスリーチ|冬の怒り|ニードルストーム|輝く泉|ラディエンスの泉|daybreak|song of flame|nova bomb|nova warp|stormtrance|chaos reach|winter'?s wrath|needle storm|needlestorm|well of radiance/i,
    titan: /サンハンマー|モールバーニング|ハボックフィスト|サンダークラッシュ|センティネルシールド|ドーン・ウォード|トワイライトアーセナル|氷河の揺れ|ブレードフューリー|hammer of sol|burning maul|fists of havoc|thundercrash|sentinel shield|ward of dawn|twilight arsenal|glacial quake|bladefury/i,
  },
  melee: {
    hunter: /ナイフトリック|投げナイフ|軽量ナイフ|爆破ナイフ|スネア爆弾|煙玉|衰弱の刃|嵐の打撃|コンビネーションブロー|スレッドスパイク|knife trick|throwing knife|weighted knife|lightweight knife|proximity explosive knife|snare bomb|smoke bomb|withering blade|combination blow|disorienting blow|threaded spike/i,
    warlock: /焼却の指鳴らし|天の炎|アーケインニードル|連鎖する稲妻|稲妻の波動|ポケット・シンギュラリティ|ペナンブラルブラスト|incinerator snap|celestial fire|arcane needle|chain lightning|ball lightning|pocket singularity|penumbral blast/i,
    titan: /ハンマーストライク|ハンマー投げ|シールドバッシュ|シールド投げ|地震攻撃|サンダークラップ|弾道スラム|氷河の一撃|フレンジーブレード|hammer strike|throwing hammer|shield bash|shield throw|seismic strike|thunderclap|ballistic slam|shiver strike|frenzied blade/i,
  },
  classAbility: {
    hunter: /回避|曲芸師|dodge|acrobat/i,
    warlock: /リフト|フェニックスダイブ|rift|phoenix dive/i,
    titan: /バリケード|スラスター|barricade|thruster/i,
  },
  movement: {
    hunter: /ジャンプ|跳躍|トリプルジャンプ|ストレイフジャンプ|ハイジャンプ|jump|triple jump|strafe jump|high jump/i,
    warlock: /グライド|グライディング|ブリンク|glide|blink/i,
    titan: /リフト|カタパルト|スライドリフト|ハイリフト|lift|catapult|strafe lift|high lift/i,
  },
  aspect: {
    hunter: /オン・ユア・マーク|ガンパウダーギャンブル|一網打尽|致死電流|嵐の打撃|無我の境地|飛昇|消足|罠師の奇襲|粋な処刑人|シャッターダイブ|冬の帳|冬の気配|ウィドーズシルク|エンスネア・スラム|スレッドスペクター|大旋渦|on your mark|gunpowder gamble|knock '?em down|lethal current|tempest strike|flow state|ascension|vanishing step|trapper'?s ambush|stylish executioner|shatterdive|winter'?s shroud|touch of winter|widow'?s silk|ensnaring slam|threaded specter|whirling maelstrom/i,
    warlock: /イカロスダッシュ|熱上昇|炎の囁き|アークソウル|静電気の心|ライトニングサージ|イオン番兵|カオス促進剤|古き神々の子|ボイドの餌|爆破解体|アイスフレアボルト|フロストパルス|冷たい監視者|氷河の恵み|心の紡ぎし祈り|織り手の呼び声|ザ・ワンダラー|ウィーブウォーク|icarus dash|heat rises|touch of flame|arc soul|electrostatic mind|lightning surge|ionic sentry|chaos accelerant|child of the old gods|feed the void|controlled demolition|iceflare bolts|frostpulse|bleak watcher|glacial harvest|mindspun invocation|weaver'?s call|the wanderer|weavewalk/i,
    titan: /ソル・インビクタス|燃えさかる炎|聖別|乱暴者|ノックアウト|ジャガーノート|雷の造形|嵐の砦|バスティオン|攻勢防壁|難攻不落|クライオクラズム|ダイアモンドスピア|嵐の遠吠え|構造的収穫|ドレングルの鞭|フレシェット・ストーム|戦旗|騒乱の渦中|sol invictus|roaring flames|consecration|knockout|juggernaut|touch of thunder|bastion|offensive bulwark|unbreakable|cryoclasm|diamond lance|howl of the storm|tectonic harvest|drengr'?s lash|flechette storm|banner of war|into the fray/i,
  },
};

function abilityClassHint(row, kind) {
  const explicit = classIdForRow(row);
  if (explicit) return explicit;
  const patterns = abilityClassPatterns[kind];
  if (!patterns) return "";
  const primaryValue = `${row.name || ""} ${row.type || ""} ${row.class || ""}`;
  const primaryMatches = armorClassOrder.filter((id) => patterns[id]?.test(primaryValue));
  if (primaryMatches.length === 1) return primaryMatches[0];
  if (kind === "movement") return "";
  const value = `${primaryValue} ${row.description || ""} ${row.search || ""}`;
  const matches = armorClassOrder.filter((id) => patterns[id]?.test(value));
  return matches.length === 1 ? matches[0] : "";
}

function abilityMatchesClass(row, classId, kind) {
  const hintedClass = abilityClassHint(row, kind);
  if (hintedClass) return hintedClass === classId;
  if (["super", "melee", "classAbility", "movement", "aspect"].includes(kind)) return false;
  return true;
}

function buildAbilityOptions(classId, slotId, subclass) {
  const kind = slotId.startsWith("aspect") ? "aspect" : slotId.startsWith("fragment") ? "fragment" : slotId;
  const element = subclassElementId(subclass);
  const seen = new Set();
  return characterAbilityRows()
    .filter((row) => abilityKind(row) === kind)
    .filter((row) => abilityMatchesClass(row, classId, kind))
    .filter((row) => {
      if (!["super", "grenade", "melee", "aspect", "fragment"].includes(kind)) return true;
      if (!element || element === "prismatic") return true;
      const abilityElement = buildElementId(`${row.type || ""} ${row.name || ""} ${row.search || ""}`);
      return !abilityElement || abilityElement === element;
    })
    .filter((row) => {
      const key = `${armorSetNameKey(row.name)}|${kind}`;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => compareText(abilityBaseType(a.type), abilityBaseType(b.type)) || compareText(a.name, b.name));
}

function classBuildAbilityState(classId) {
  if (!state.classBuildAbilities[classId]) {
    state.classBuildAbilities[classId] = { subclassHash: "", slots: {} };
  }
  const entry = state.classBuildAbilities[classId];
  if (!entry.slots) entry.slots = {};
  const subclasses = buildSubclassRows(classId);
  if (!entry.subclassHash || !subclasses.some((row) => Number(row.hash) === Number(entry.subclassHash))) {
    entry.subclassHash = subclasses[0]?.hash || "";
    entry.slots = {};
  }
  return entry;
}

function selectedBuildSubclass(classId) {
  const entry = classBuildAbilityState(classId);
  return buildSubclassRows(classId).find((row) => Number(row.hash) === Number(entry.subclassHash)) || null;
}

function selectedBuildAbility(classId, slotId) {
  const entry = classBuildAbilityState(classId);
  const hash = entry.slots?.[slotId];
  if (!hash) return null;
  return characterAbilityRows().find((row) => Number(row.hash) === Number(hash)) || null;
}

function contextRows() {
  const rows = rawContextRows();
  if (state.group === "character" && state.section === "build_simulator") return buildSimulatorRows();
  if (state.group === "character" && state.section === "abilities") return characterAbilityRows();
  if (state.group === "character" && state.section === "all") return [...buildSimulatorRows(), ...rows, ...characterAbilityRows()];
  return isArmorSetContext() ? armorSetRows(rows) : rows;
}

function valueFor(row, key) {
  if (key === "section") return row.sectionLabel || sectionLabel(row.primarySection);
  if (key === "group") return groupLabel(row.primaryGroup);
  if (key === "weaponSystem") return weaponSystemLabel(row);
  return row[key] || "";
}

function filterValuesFor(row, key) {
  if (key === "class" && row.classFilterLabels?.length) return row.classFilterLabels;
  const value = valueFor(row, key);
  return value ? [value] : [];
}

function distinct(rows, key) {
  if (key === "weaponSystem") {
    const ordered = weaponGenerationOrder.map((generation) => t("weaponSystemLabels")[generation]).filter(Boolean);
    return ordered.filter((value) => rows.some((row) => valueFor(row, key) === value));
  }
  return [...new Set(rows.flatMap((row) => filterValuesFor(row, key)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
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

function setTheme(theme) {
  const nextTheme = theme === "black" ? "black" : "white";
  state.theme = nextTheme;
  localStorage.setItem("d2ma-theme", nextTheme);
  document.documentElement.dataset.theme = nextTheme;
  els.themeWhite.setAttribute("aria-pressed", String(nextTheme === "white"));
  els.themeBlack.setAttribute("aria-pressed", String(nextTheme === "black"));
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
  els.themeWhite.textContent = t("themeWhite");
  els.themeBlack.textContent = t("themeBlack");
  els.sortLabel.textContent = t("sort");
  if (state.data.index) {
    els.manifestMeta.textContent = `${t("manifest")} ${shortVersion(state.data.index.manifestVersion)} / ${t("synced")} ${state.data.index.sourceSyncedAt}`;
  }
}

function characterVirtualCount(section = "all") {
  if (section === "build_simulator") return buildSimulatorRows().length;
  if (section === "abilities") return characterAbilityRows().length;
  if (section === "all") return buildSimulatorRows().length + characterAbilityRows().length;
  return 0;
}

function renderGroupNav() {
  const summary = langData().summary || {};
  els.groupNav.innerHTML = taxonomy
    .map((group) => {
      const baseCount = group.id === "all" ? summary.catalogCount : countFrom(summary.groupCounts, group.id);
      const count = baseCount + (group.id === "character" ? characterVirtualCount() : 0);
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
  const rowsInGroup = (state.group === "all" ? summary.catalogCount : countFrom(summary.groupCounts, state.group)) + (state.group === "character" ? characterVirtualCount() : 0);
  els.sectionRail.innerHTML = sections
    .map((section) => {
      const count = section === "all"
        ? rowsInGroup
        : state.group === "character" && ["build_simulator", "abilities"].includes(section)
          ? characterVirtualCount(section)
          : countFrom(summary.sectionCounts, section);
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
      return filterValuesFor(row, key).includes(select.value);
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
  const rank = weaponGenerationOrder.indexOf(weaponGenerationId(row));
  return rank === -1 ? 98 : rank;
}

function sortRows(rows) {
  const sorted = [...rows];
  const sort = state.sort;
  sorted.sort((a, b) => {
    const fallback = compareText(a.name, b.name) || Number(a.hash || 0) - Number(b.hash || 0);
    if (isBuildSimulatorRow(a) && isBuildSimulatorRow(b)) {
      return buildSimulatorClassOrder.indexOf(a.buildClassId) - buildSimulatorClassOrder.indexOf(b.buildClassId) || fallback;
    }
    if (isArmorSetRow(a) && isArmorSetRow(b)) {
      return armorClassOrder.indexOf(a.armorSetClassId) - armorClassOrder.indexOf(b.armorSetClassId) || fallback;
    }
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
    if (["section", "type", "class", "armorSlot", "tier"].includes(sort)) {
      return compareText(valueFor(a, sort), valueFor(b, sort)) || fallback;
    }
    return fallback;
  });
  return sorted;
}

function listRows() {
  const filtered = applyFilters(contextRows());
  const rows = state.group === "equipment" && state.section === "weapons"
    ? groupWeaponRows(filtered)
    : filtered;
  return sortRows(rows);
}

function renderColumnHead() {
  const armorSetList = isArmorSetContext();
  const cells = armorSetList ? [t("armorSetPieces"), t("name"), t("class")] : ["", t("name"), t("category"), t("type"), t("detail")];
  els.columnHead.classList.toggle("column-head--armor-set", armorSetList);
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

function isEnhancedPlug(plug) {
  if (!plug) return false;
  const category = `${plug.category || ""}`;
  const name = `${plug.name || ""}`;
  const identifier = `${plug.identifier || ""}`;
  return /enhanced/i.test(category) || /強化/.test(category) || /^enhanced\s/i.test(name) || /^強化/.test(name) || /enhanced/i.test(identifier);
}

function enhancedBaseText(value) {
  return String(value || "")
    .replace(/^Enhanced\s+/i, "")
    .replace(/^強化版\s*/u, "")
    .replace(/^強化型\s*/u, "")
    .replace(/^強化\s*/u, "")
    .replace(/^強化版/u, "")
    .trim()
    .toLowerCase();
}

function enhancedCounterpartIcon(plug) {
  if (!plug?.hash) return "";
  const cacheKey = `${state.lang}:${plug.hash}`;
  if (enhancedBadgeCache.has(cacheKey)) return enhancedBadgeCache.get(cacheKey);
  const nameKey = enhancedBaseText(plug.name);
  const categoryKey = enhancedBaseText(plug.category);
  const counterpart = Object.values(langData().plugOptions || {}).find((candidate) => {
    if (!candidate || Number(candidate.hash) === Number(plug.hash) || isEnhancedPlug(candidate)) return false;
    if (enhancedBaseText(candidate.name) !== nameKey) return false;
    return candidate.identifier === plug.identifier || enhancedBaseText(candidate.category) === categoryKey;
  });
  const icon = counterpart?.icon || "";
  enhancedBadgeCache.set(cacheKey, icon);
  return icon;
}

function shouldShowEnhancedMark(plug) {
  if (!isEnhancedPlug(plug)) return false;
  const counterpartIcon = enhancedCounterpartIcon(plug);
  return !counterpartIcon || counterpartIcon === plug.icon;
}

function renderPlugIcon(plug, className, fallback = "") {
  const enhanced = isEnhancedPlug(plug);
  const showMark = shouldShowEnhancedMark(plug);
  const label = enhanced ? ` title="${esc(t("enhancedPlug"))}" aria-label="${esc(t("enhancedPlug"))}"` : "";
  const icon = plug?.icon
    ? `<img class="${esc(className)}" src="${esc(plug.icon)}" alt="">`
    : `<span class="${esc(className)} placeholder-icon">${esc(fallback)}</span>`;
  return `
    <span class="plug-icon-wrap${showMark ? " is-enhanced" : ""}"${label}>
      ${icon}
      ${showMark ? `<span class="enhanced-mark" aria-hidden="true">↑</span>` : ""}
    </span>
  `;
}

function fixedPlugFor(row, socket, options = plugOptionsFor(row, socket)) {
  return options.length === 1 ? options[0] : null;
}

function selectedPlugSummary(row, socket, options = plugOptionsFor(row, socket)) {
  const plug = selectedPlugFor(row, socket);
  const displayPlug = plug || fixedPlugFor(row, socket, options);
  if (!displayPlug) {
    return {
      name: t("selectPlug"),
      icon: "",
      deltas: {},
      description: "",
      plug: null,
    };
  }
  return {
    name: displayPlug.name,
    icon: displayPlug.icon,
    deltas: displayStatDeltas(row, displayPlug),
    description: displayPlug.description || "",
    plug: displayPlug,
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
  return (row.plugSockets || []).map((socket) => selectedPlugFor(row, socket) || fixedPlugFor(row, socket)).filter(Boolean);
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
  return armorTertiaryStatOrder;
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
    deltas[tertiary] = Number(deltas[tertiary] || 0) + armorTier5Values.tertiary;
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
  const values = armorStatKeys.map((key) => Number(deltas[key] || 0));
  const magnitude = values[0] || 0;
  return magnitude > 0 && values.every((value) => value === magnitude);
}

function isArmorStatTradeoffPlug(plug) {
  const entries = Object.entries(plug?.statDeltas || {})
    .filter(([key, value]) => armorStatKeys.includes(key) && Number(value || 0) !== 0)
    .map(([key, value]) => [key, Number(value || 0)]);
  const positives = entries.filter(([, value]) => value > 0);
  const negatives = entries.filter(([, value]) => value < 0);
  return entries.length === 2
    && positives.length === 1
    && negatives.length === 1
    && positives[0][1] === 5
    && negatives[0][1] === -5;
}

function isNewArmorFocusPlug(plug) {
  if (!/core\.gear_systems\.armor_tiering\.plugs\.tuning\.mods/i.test(plug?.identifier || "")) return false;
  return isBalancedArmorTuningPlug(plug) || isArmorStatTradeoffPlug(plug);
}

function balancedArmorTuningMagnitude(plug) {
  return isBalancedArmorTuningPlug(plug) ? Number(plug?.statDeltas?.[armorStatKeys[0]] || 0) : 0;
}

function lowestArmorStatKeys(stats, count = 3) {
  return [...armorTertiaryStatOrder]
    .sort((a, b) => Number(stats[a] || 0) - Number(stats[b] || 0) || armorTertiaryStatOrder.indexOf(a) - armorTertiaryStatOrder.indexOf(b))
    .slice(0, count);
}

function balancedArmorTuningDeltas(stats, plug) {
  const magnitude = balancedArmorTuningMagnitude(plug);
  if (!magnitude) return {};
  return Object.fromEntries(lowestArmorStatKeys(stats, 3).map((key) => [key, magnitude]));
}

function armorModDeltaSummary(plug) {
  if (isBalancedArmorTuningPlug(plug)) {
    return `${t("armorLowestThreeStats")} ${signedValue(balancedArmorTuningMagnitude(plug))}`;
  }
  const entries = Object.entries(plug?.statDeltas || {}).filter(([key, value]) => armorStatKeys.includes(key) && Number(value || 0) !== 0);
  return entries.map(([key, value]) => `${statLabel(key, true)} ${signedValue(value)}`).join(" / ");
}

function armorModOptionLabel(plug) {
  const summary = armorModDeltaSummary(plug);
  return `${plug.name}${summary ? ` (${summary})` : ""}`;
}

function addArmorModStats(stats, plug) {
  const deltas = isBalancedArmorTuningPlug(plug)
    ? balancedArmorTuningDeltas(stats, plug)
    : plug?.statDeltas || {};
  Object.entries(deltas).forEach(([key, value]) => {
    if (!armorStatKeys.includes(key)) return;
    stats[key] += Number(value || 0);
  });
}

function isArmorTuningAllowed(row, plug) {
  if (!isArmorRow(row) || !isArmorTuningPlug(plug)) return true;
  return true;
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

function armorRowStatsBeforeBalancedTuning(row, balancedPlug) {
  const stats = {};
  armorStatKeys.forEach((key) => { stats[key] = Number(row.stats?.[key] || 0); });
  Object.entries(armorArchetypeDeltas(row)).forEach(([key, value]) => {
    if (!armorStatKeys.includes(key)) return;
    stats[key] += Number(value || 0);
  });
  selectedPlugsFor(row).forEach((plug) => {
    if (!plug || Number(plug.hash) === Number(balancedPlug?.hash) || isBalancedArmorTuningPlug(plug)) return;
    const deltas = armorMasterworkDeltas(row, plug) ?? plug.statDeltas ?? {};
    Object.entries(deltas).forEach(([key, value]) => {
      if (!armorStatKeys.includes(key)) return;
      stats[key] += Number(value || 0);
    });
  });
  return stats;
}

function applicableStatDeltas(row, plug) {
  if (armorArchetypeConfigForPlug(plug)) return {};
  if (!isArmorTuningAllowed(row, plug)) return {};
  if (isArmorRow(row) && isBalancedArmorTuningPlug(plug)) {
    return balancedArmorTuningDeltas(armorRowStatsBeforeBalancedTuning(row, plug), plug);
  }
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

function isArmorSetRow(row) {
  return Boolean(row?.isArmorSet);
}

function armorSlotLabel(slotId) {
  const slot = armorPieceSlots.find((entry) => entry.id === slotId);
  return slot ? slot[state.lang] : slotId;
}

function armorSlotId(row) {
  const value = `${row.armorSlot || ""} ${row.type || ""}`.toLowerCase();
  if (value.includes("helmet") || value.includes("helm") || value.includes("mask") || value.includes("hood") || value.includes("cowl") || value.includes("ヘルメット") || value.includes("ヘルム") || value.includes("マスク") || value.includes("フード")) return "head";
  if (value.includes("gauntlet") || value.includes("glove") || value.includes("grip") || value.includes("arms") || value.includes("ガントレット") || value.includes("グローブ") || value.includes("グリップ")) return "arms";
  if (value.includes("chest") || value.includes("plate") || value.includes("vest") || value.includes("robe") || value.includes("チェスト") || value.includes("プレート") || value.includes("ベスト") || value.includes("ローブ")) return "chest";
  if (value.includes("leg") || value.includes("boot") || value.includes("greave") || value.includes("stride") || value.includes("レッグ") || value.includes("ブーツ") || value.includes("グリーブ") || value.includes("ストライド")) return "legs";
  if (value.includes("class") || value.includes("cloak") || value.includes("mark") || value.includes("bond") || value.includes("クラス") || value.includes("クローク") || value.includes("紋章") || value.includes("バンド")) return "class";
  return "";
}

function armorSetKey(classId) {
  return classId || "all";
}

function armorSetPieceState(classId, slotId) {
  const key = armorSetKey(classId);
  if (!state.armorSetPieces[key]) state.armorSetPieces[key] = {};
  if (!state.armorSetPieces[key][slotId]) {
    state.armorSetPieces[key][slotId] = {
      archetypeHash: defaultArmorArchetypeHash,
      tertiary: defaultArmorTertiary,
      generalModHash: "",
      focusModHash: "",
    };
  }
  return state.armorSetPieces[key][slotId];
}

function armorSetExoticState(classId) {
  const key = armorSetKey(classId);
  if (!state.armorSetExotics[key]) {
    state.armorSetExotics[key] = { slot: "head", hash: "" };
  }
  return state.armorSetExotics[key];
}

function armorSetBonusState(classId) {
  const key = armorSetKey(classId);
  if (!state.armorSetBonuses[key]) {
    state.armorSetBonuses[key] = { mode: "none", primaryHash: "", secondaryHash: "" };
  }
  return state.armorSetBonuses[key];
}

function armorBulkState(setKey) {
  const key = armorSetKey(setKey);
  if (!state.armorBulk[key]) {
    state.armorBulk[key] = {
      archetypeHash: defaultArmorArchetypeHash,
      tertiary: defaultArmorTertiary,
      generalModHash: "",
      focusModHash: "",
    };
  }
  return normalizeArmorPieceState(state.armorBulk[key]);
}

function applyArmorBulkState(setKey) {
  const bulk = armorBulkState(setKey);
  armorPieceSlots.forEach((slot) => {
    const piece = armorSetPieceState(setKey, slot.id);
    piece.archetypeHash = Number(bulk.archetypeHash || defaultArmorArchetypeHash);
    piece.tertiary = bulk.tertiary || defaultArmorTertiary;
    piece.generalModHash = bulk.generalModHash || "";
    piece.focusModHash = bulk.focusModHash || "";
    normalizeArmorPieceState(piece);
  });
}

function armorPlugOption(hash) {
  return hash ? (langData().plugOptions || {})[String(hash)] || null : null;
}

function armorArchetypeOptions() {
  return Object.keys(armorArchetypeStats)
    .map((hash) => armorPlugOption(hash) || { hash, name: String(hash), statDeltas: {} })
    .sort((a, b) => compareText(a.name, b.name));
}

function armorTertiaryOptionsForArchetype(archetypeHash) {
  return armorTertiaryStatOrder;
}

function normalizeArmorPieceState(piece) {
  const options = armorTertiaryOptionsForArchetype(piece.archetypeHash);
  if (!options.includes(piece.tertiary)) {
    piece.tertiary = options[0] || "";
  }
  if (piece.focusModHash && !isNewArmorFocusPlug(armorPlugOption(piece.focusModHash))) {
    piece.focusModHash = "";
  }
  return piece;
}

function armorModOptions(kind) {
  const plugs = Object.values(langData().plugOptions || {}).filter((plug) => {
    const identifier = String(plug.identifier || "");
    const deltas = plug.statDeltas || {};
    if (!armorStatKeys.some((key) => Number(deltas[key] || 0) !== 0)) return false;
    if (kind === "general") return /enhancements\.v2_general/i.test(identifier);
    if (kind === "focus") return isNewArmorFocusPlug(plug);
    return false;
  });
  const seen = new Set();
  return plugs
    .filter((plug) => {
      const key = `${plug.name}|${JSON.stringify(plug.statDeltas || {})}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => compareText(armorModSortLabel(a), armorModSortLabel(b)));
}

function armorModSortLabel(plug) {
  const deltas = plug.statDeltas || {};
  const positive = armorStatKeys.find((key) => Number(deltas[key] || 0) > 0) || "";
  const magnitude = Math.max(...Object.values(deltas).map((value) => Math.abs(Number(value || 0))), 0);
  return `${armorStatKeys.indexOf(positive)}:${999 - magnitude}:${plug.name || ""}`;
}

function armorPieceStats(piece) {
  normalizeArmorPieceState(piece);
  const stats = {};
  armorStatKeys.forEach((key) => { stats[key] = 0; });
  const config = armorArchetypeStats[String(piece.archetypeHash)] || {};
  if (config.primary) stats[config.primary] += armorTier5Values.primary;
  if (config.secondary) stats[config.secondary] += armorTier5Values.secondary;
  if (piece.tertiary) stats[piece.tertiary] += armorTier5Values.tertiary;
  addArmorModStats(stats, armorPlugOption(piece.generalModHash));
  addArmorModStats(stats, armorPlugOption(piece.focusModHash));
  return stats;
}

function armorSetTotals(classId) {
  const totals = {};
  armorStatKeys.forEach((key) => { totals[key] = 0; });
  armorPieceSlots.forEach((slot) => {
    const piece = armorSetPieceState(classId, slot.id);
    Object.entries(armorPieceStats(piece)).forEach(([key, value]) => {
      totals[key] += Number(value || 0);
    });
  });
  return totals;
}

function armorSetBonusOptions() {
  return Object.values(langData().plugOptions || {})
    .filter((plug) => /item_sets\.selectors/i.test(plug.identifier || "") && plug.name && !/empty|空の/i.test(plug.name))
    .sort((a, b) => compareText(cleanSetBonusName(a.name), cleanSetBonusName(b.name)));
}

function cleanSetBonusName(value) {
  return String(value || "")
    .replace(/set bonus\s*:\s*/i, "")
    .replace(/セットボーナス\s*:\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedSetBonusName(value) {
  return cleanSetBonusName(value)
    .replace(/\s*\([^)]*\)$/u, "")
    .replace(/\s*（[^）]*）$/u, "")
    .replace(/\s+set$/i, "")
    .replace(/のセット$/u, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
}

function armorSetBonusAliasName(value) {
  const key = normalizedSetBonusName(value);
  const aliases = {
    collectivepsyche: "Accretion",
    集団精神: "降着",
  };
  return aliases[key] || value;
}

function armorSetBonusOptionForName(value) {
  const target = normalizedSetBonusName(armorSetBonusAliasName(value));
  if (!target) return null;
  return armorSetBonusOptions().find((plug) => normalizedSetBonusName(plug.name) === target) || null;
}

function armorSetBonusEffectsForPlug(plug) {
  if (!plug?.hash) return null;
  return armorSetBonusEffectData[String(plug.hash)]?.[state.lang] || armorSetBonusEffectData[String(plug.hash)]?.en || null;
}

function renderSetBonusEffectCard(plug, tier) {
  if (!plug) return "";
  const effects = armorSetBonusEffectsForPlug(plug);
  const effect = effects?.[tier];
  const tierLabel = tier === "four" ? t("armorSetBonusFourPiece") : t("armorSetBonusTwoPiece");
  const name = effect?.name || cleanSetBonusName(plug.name);
  const description = effect?.description || t("armorSetEffectUnknown");
  return `
    <article class="set-bonus-effect-card${effect ? "" : " is-unknown"}">
      <div class="set-bonus-effect-head">
        <span>${esc(tierLabel)}</span>
        <strong>${esc(name)}</strong>
      </div>
      <p>${esc(description)}</p>
    </article>
  `;
}

function renderSetBonusEffects(plug, tiers = ["two", "four"]) {
  if (!plug) return "";
  return `
    <div class="set-bonus-effects">
      ${tiers.map((tier) => renderSetBonusEffectCard(plug, tier)).join("")}
      ${plug.description ? `<p class="set-bonus-note">${esc(t("armorSetSelectorNote"))}: ${esc(plug.description)}</p>` : ""}
    </div>
  `;
}

function armorExoticOptions(classId, slotId) {
  const seen = new Set();
  return armorCatalogRows()
    .filter((row) => row.tier === "Exotic" || row.tier === "エキゾチック")
    .filter((row) => classIdForRow(row) === classId && armorSlotId(row) === slotId)
    .filter((row) => {
      const key = `${row.name}|${armorSlotId(row)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => compareText(a.name, b.name));
}

function selectedArmorExotic(setKey, classId) {
  const exotic = armorSetExoticState(setKey);
  return armorExoticOptions(classId, exotic.slot).find((row) => Number(row.hash) === Number(exotic.hash)) || null;
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

function renderPlugBuilder(row, embedded = false) {
  const sockets = row.plugSockets || [];
  const manualArmor = renderManualArmorTuning(row);
  if (!sockets.length && !manualArmor) return "";
  return `
    <section class="${embedded ? "plug-builder plug-builder--embedded" : "panel plug-builder"}">
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
          const summary = selectedPlugSummary(row, socket, options);
          const toggleLabel = isOpen ? t("closeChoices") : t("openChoices");
          const tertiarySelector = socket.kind === "armor_archetype" ? renderArmorTertiarySelector(row) : "";
          const fixedOnly = options.length === 1;
          const fixedHash = fixedOnly ? options[0].hash : "";
          return `
            <div class="plug-field${isOpen ? " is-open" : ""}">
              <button class="plug-toggle" type="button" data-plug-toggle data-socket-index="${esc(socket.index)}" aria-expanded="${esc(String(isOpen))}">
                ${summary.plug ? renderPlugIcon(summary.plug, "plug-toggle-icon") : `<span class="plug-toggle-icon plug-toggle-icon--empty">OFF</span>`}
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
                      ${
                        fixedOnly
                          ? ""
                          : `<button class="plug-option plug-option--clear${selectedHash ? "" : " is-selected"}" type="button" data-plug-button data-socket-index="${esc(socket.index)}" data-plug-hash="" title="${esc(t("selectPlug"))}" aria-pressed="${esc(String(!selectedHash))}">
                              <span class="plug-option-icon">OFF</span>
                              <span class="plug-option-name">${esc(t("selectPlug"))}</span>
                            </button>`
                      }
                      ${options.map((plug) => renderPlugOption(row, socket, plug, selectedHash, fixedHash)).join("")}
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

function renderPlugOption(row, socket, plug, selectedHash, fixedHash = "") {
  const isSelected = Number(selectedHash) === Number(plug.hash) || (!selectedHash && Number(fixedHash) === Number(plug.hash));
  const title = plugOptionLabel(row, plug);
  return `
    <button class="plug-option${isSelected ? " is-selected" : ""}" type="button" data-plug-button data-socket-index="${esc(socket.index)}" data-plug-hash="${esc(plug.hash)}" title="${esc(title)}" aria-pressed="${esc(String(isSelected))}">
      ${renderPlugIcon(plug, "plug-option-icon")}
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
  if (isBuildSimulatorRow(row)) {
    return [row.class, t("buildSkillConfig"), t("armorLoadout")].filter(Boolean).join(" / ");
  }
  if (isArmorSetRow(row)) {
    return [row.class, row.armorSlot, row.tier].filter(Boolean).map(compactMetaLabel).join(" / ");
  }
  if ((row.sections || []).includes("weapons")) {
    return [row.ammo, row.damageType, row.weaponSlot].filter(Boolean).map(compactMetaLabel).join(" / ");
  }
  if ((row.sections || []).includes("armor")) {
    return [row.class, row.armorSlot, row.tier].filter(Boolean).map(compactMetaLabel).join(" / ");
  }
  return [row.bucket, row.tier].filter(Boolean).map(compactMetaLabel).join(" / ");
}

function renderList() {
  const fullBuildSimulator = state.group === "character" && state.section === "build_simulator";
  document.body?.classList.toggle("is-build-sim-full", fullBuildSimulator);
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
  const release = renderReleaseInline(row);
  if (isArmorSetRow(row)) {
    return `
      <button class="result-row result-row--armor-set${selected}" type="button" data-hash="${esc(row.hash)}">
        ${renderArmorSetIconStrip(row)}
        <span>
          <span class="row-name">${esc(row.name)}</span>
          <span class="row-sub"><span class="row-sub-base">${esc(sub)}</span>${release}</span>
        </span>
        <span class="row-cell">${esc(row.class || "-")}</span>
      </button>
    `;
  }
  return `
    <button class="result-row${selected}" type="button" data-hash="${esc(row.hash)}">
      ${renderIcon(row, "item-icon")}
      <span>
        <span class="row-name">${esc(row.name)}</span>
        <span class="row-sub"><span class="row-sub-base">${esc(sub)}</span>${release}</span>
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

function weaponVersionMeta(row) {
  return [
    weaponSystemLabel(row),
    compactMetaLabel(row.ammo),
    compactMetaLabel(row.damageType),
    compactMetaLabel(row.weaponSlot),
  ].filter(Boolean).join(" / ");
}

function renderWeaponVersionSwitcher(row) {
  if (!isWeaponRow(row)) return "";
  const variants = weaponVariantsFor(row);
  if (variants.length <= 1) return "";
  const latestHash = variants[0]?.hash;
  return `
    <section class="panel weapon-version-panel">
      <div class="panel-heading-row">
        <div>
          <h3>${esc(t("weaponVersions"))}</h3>
          <p>${esc(t("weaponVersionsSub"))}</p>
        </div>
      </div>
      <div class="weapon-version-list">
        ${variants.map((variant) => {
          const isSelected = Number(variant.hash) === Number(row.hash);
          const isLatest = Number(variant.hash) === Number(latestHash);
          const season = releaseSeasonLabel(variant) || releaseSourceLabel(variant) || String(variant.release?.releaseVersion || variant.hash);
          const meta = weaponVersionMeta(variant);
          return `
            <button class="weapon-version-chip${isSelected ? " is-selected" : ""}" type="button" data-weapon-version="${esc(variant.hash)}" aria-pressed="${esc(String(isSelected))}" title="${esc(releaseSummary(variant, false) || season)}">
              <span class="weapon-version-season">${esc(season)}</span>
              ${meta ? `<span class="weapon-version-meta">${esc(meta)}</span>` : ""}
              <span class="weapon-version-flags">
                ${isLatest ? `<span>${esc(t("latestWeaponVersion"))}</span>` : ""}
                ${isSelected ? `<span>${esc(t("selectedWeaponVersion"))}</span>` : ""}
              </span>
            </button>
          `;
        }).join("")}
      </div>
    </section>
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
      ${hasValue ? "" : `<div class="notice compact-notice">${esc(t("ttkPending"))}</div>`}
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
    </section>
  `;
}

function selectOptions(rows, selectedValue, labelAll, valueKey = "hash", labelFn = (row) => row.name) {
  return `<option value="">${esc(labelAll)}</option>${rows
    .map((row) => {
      const value = String(row[valueKey] ?? "");
      return `<option value="${esc(value)}"${String(selectedValue || "") === value ? " selected" : ""}>${esc(labelFn(row))}</option>`;
    })
    .join("")}`;
}

function statSummaryLine(stats) {
  return armorStatKeys
    .filter((key) => Number(stats[key] || 0) !== 0)
    .map((key) => `<span class="armor-stat-pill"><span>${esc(statLabel(key, true))}</span><strong>${esc(stats[key])}</strong></span>`)
    .join("");
}

function renderArmorSetStats(totals) {
  const max = 200;
  return `
    <div class="armor-total-grid">
      ${armorStatKeys
        .map((key) => {
          const value = Number(totals[key] || 0);
          const pct = Math.max(0, Math.min(100, (value / max) * 100));
          return `
            <div class="armor-total-row">
              <div class="stat-head">
                <span>${esc(statLabel(key, true))}</span>
                <strong>${esc(value)}</strong>
              </div>
              <div class="stat-meter" role="meter" aria-valuemin="0" aria-valuemax="${esc(max)}" aria-valuenow="${esc(value)}">
                <span class="bar"><span class="bar-base" style="width:${pct}%"></span></span>
                <span class="stat-scale"><span>0</span><span>${esc(max)}</span></span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderArmorPieceCard(setKey, slot) {
  const piece = normalizeArmorPieceState(armorSetPieceState(setKey, slot.id));
  const archetype = armorPlugOption(piece.archetypeHash);
  const pieceStats = armorPieceStats(piece);
  const tertiaryOptions = armorTertiaryOptionsForArchetype(piece.archetypeHash);
  const generalMods = armorModOptions("general");
  const focusMods = armorModOptions("focus");
  return `
    <section class="armor-piece-card">
      <div class="armor-piece-head">
        <h4>${esc(armorSlotLabel(slot.id))}</h4>
        <span>${esc(archetype?.name || "")}</span>
      </div>
      <div class="armor-piece-controls">
        <label class="field">
          <span>${esc(t("armorArchetype"))}</span>
          <select data-armor-piece-archetype="${esc(slot.id)}">
            ${armorArchetypeOptions()
              .map((option) => `<option value="${esc(option.hash)}"${Number(piece.archetypeHash) === Number(option.hash) ? " selected" : ""}>${esc(option.name)}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorTertiary"))}</span>
          <select data-armor-piece-tertiary="${esc(slot.id)}">
            ${tertiaryOptions
              .map((key) => `<option value="${esc(key)}"${piece.tertiary === key ? " selected" : ""}>${esc(statLabel(key, true))}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorGeneralMod"))}</span>
          <select data-armor-piece-general="${esc(slot.id)}">
            ${selectOptions(generalMods, piece.generalModHash, t("armorNoMod"), "hash", armorModOptionLabel)}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorFocusMod"))}</span>
          <select data-armor-piece-focus="${esc(slot.id)}">
            ${selectOptions(focusMods, piece.focusModHash, t("armorNoMod"), "hash", armorModOptionLabel)}
          </select>
        </label>
      </div>
      <div class="armor-piece-stats">${statSummaryLine(pieceStats)}</div>
    </section>
  `;
}

function renderArmorBulkControls(setKey) {
  const bulk = armorBulkState(setKey);
  const tertiaryOptions = armorTertiaryOptionsForArchetype(bulk.archetypeHash);
  const generalMods = armorModOptions("general");
  const focusMods = armorModOptions("focus");
  return `
    <section class="armor-bulk-panel">
      <div class="armor-bulk-head">
        <h4>${esc(t("armorBulkSetup"))}</h4>
        <span>${esc(t("armorBulkNote"))}</span>
      </div>
      <div class="armor-config-grid">
        <label class="field">
          <span>${esc(t("armorArchetype"))}</span>
          <select data-armor-bulk-archetype>
            ${armorArchetypeOptions()
              .map((option) => `<option value="${esc(option.hash)}"${Number(bulk.archetypeHash) === Number(option.hash) ? " selected" : ""}>${esc(option.name)}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorTertiary"))}</span>
          <select data-armor-bulk-tertiary>
            ${tertiaryOptions
              .map((key) => `<option value="${esc(key)}"${bulk.tertiary === key ? " selected" : ""}>${esc(statLabel(key, true))}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorGeneralMod"))}</span>
          <select data-armor-bulk-general>
            ${selectOptions(generalMods, bulk.generalModHash, t("armorNoMod"), "hash", armorModOptionLabel)}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorFocusMod"))}</span>
          <select data-armor-bulk-focus>
            ${selectOptions(focusMods, bulk.focusModHash, t("armorNoMod"), "hash", armorModOptionLabel)}
          </select>
        </label>
      </div>
      <button class="apply-bulk-btn" type="button" data-armor-bulk-apply>${esc(t("applyToAllArmor"))}</button>
    </section>
  `;
}

function renderArmorExoticPanel(setKey, classId) {
  const exotic = armorSetExoticState(setKey);
  const options = armorExoticOptions(classId, exotic.slot);
  if (exotic.hash && !options.some((row) => Number(row.hash) === Number(exotic.hash))) {
    exotic.hash = "";
  }
  const selected = selectedArmorExotic(setKey, classId);
  const perkCards = selected
    ? (selected.plugSockets || [])
        .filter((socket) => socket.kind === "intrinsic")
        .flatMap((socket) => plugOptionsFor(selected, socket))
        .filter((plug) => plug.name)
    : [];
  return `
    <section class="panel armor-config-panel">
      <h3>${esc(t("armorExotic"))}</h3>
      <div class="armor-config-grid armor-config-grid--two">
        <label class="field">
          <span>${esc(t("armorExoticSlot"))}</span>
          <select data-armor-exotic-slot>
            ${armorPieceSlots.map((slot) => `<option value="${esc(slot.id)}"${exotic.slot === slot.id ? " selected" : ""}>${esc(armorSlotLabel(slot.id))}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>${esc(t("armorExotic"))}</span>
          <select data-armor-exotic>
            ${selectOptions(options, exotic.hash, t("armorNoExotic"), "hash", (row) => row.name)}
          </select>
        </label>
      </div>
      ${
        selected
          ? `<div class="selected-exotic">
              ${renderIcon(selected, "item-icon")}
              <div>
                <strong>${esc(selected.name)}</strong>
                <span>${esc([selected.class, selected.armorSlot].filter(Boolean).join(" / "))}</span>
                ${perkCards.length ? `<div class="exotic-perk-list">${perkCards.map((plug) => `<p><strong>${esc(plug.name)}</strong>${plug.description ? ` - ${esc(plug.description)}` : ""}</p>`).join("")}</div>` : ""}
              </div>
            </div>`
          : ""
      }
    </section>
  `;
}

function renderSelectedSetBonusEffects(primary, secondary, mode) {
  if (mode === "none") return "";
  const blocks = [];
  if (primary) {
    blocks.push(`
      <div class="set-bonus-selection">
        <h4>${esc(cleanSetBonusName(primary.name))}</h4>
        ${renderSetBonusEffects(primary, mode === "2+4" ? ["two", "four"] : ["two"])}
      </div>
    `);
  }
  if (mode === "2+2" && secondary) {
    blocks.push(`
      <div class="set-bonus-selection">
        <h4>${esc(cleanSetBonusName(secondary.name))}</h4>
        ${renderSetBonusEffects(secondary, ["two"])}
      </div>
    `);
  }
  return blocks.join("");
}

function renderArmorSetBonusPanel(setKey) {
  const bonus = armorSetBonusState(setKey);
  const options = armorSetBonusOptions();
  const primary = options.find((plug) => Number(plug.hash) === Number(bonus.primaryHash));
  const secondary = options.find((plug) => Number(plug.hash) === Number(bonus.secondaryHash));
  return `
    <section class="panel armor-config-panel">
      <h3>${esc(t("armorSetBonus"))}</h3>
      <div class="armor-mode-row" role="group" aria-label="${esc(t("armorSetBonusMode"))}">
        ${[
          ["none", t("armorSetBonusNone")],
          ["2+2", t("armorSetBonusTwoTwo")],
          ["2+4", t("armorSetBonusTwoFour")],
        ]
          .map(([mode, label]) => `<button class="seg armor-mode${bonus.mode === mode ? " is-active" : ""}" type="button" data-armor-bonus-mode="${esc(mode)}" aria-pressed="${esc(String(bonus.mode === mode))}">${esc(label)}</button>`)
          .join("")}
      </div>
      ${
        bonus.mode === "none"
          ? ""
          : `<div class="armor-config-grid armor-config-grid--two">
              <label class="field">
                <span>${esc(bonus.mode === "2+4" ? t("armorSetBonusFour") : t("armorSetBonusPrimary"))}</span>
                <select data-armor-bonus-primary>
                  ${selectOptions(options, bonus.primaryHash, t("selectPlug"), "hash", (plug) => cleanSetBonusName(plug.name))}
                </select>
              </label>
              ${
                bonus.mode === "2+2"
                  ? `<label class="field">
                      <span>${esc(t("armorSetBonusSecondary"))}</span>
                      <select data-armor-bonus-secondary>
                        ${selectOptions(options, bonus.secondaryHash, t("selectPlug"), "hash", (plug) => cleanSetBonusName(plug.name))}
                      </select>
                    </label>`
                  : ""
              }
            </div>`
      }
      <div class="armor-bonus-summary">
        ${primary ? `<span class="badge">${esc(cleanSetBonusName(primary.name))}${bonus.mode === "2+4" ? " 2/4" : " 2"}</span>` : ""}
        ${bonus.mode === "2+2" && secondary ? `<span class="badge">${esc(cleanSetBonusName(secondary.name))} 2</span>` : ""}
      </div>
      ${renderSelectedSetBonusEffects(primary, secondary, bonus.mode)}
    </section>
  `;
}

function renderArmorSetOfficialNames(items = []) {
  const rows = armorSetItemsSorted(items);
  if (!rows.length) return `<span class="armor-piece-name-empty">${esc(t("armorOfficialNamePending"))}</span>`;
  return `
    <ul class="armor-piece-name-list">
      ${rows
        .map((item) => {
          const meta = [releaseSeasonLabel(item), item.tier].filter(Boolean).join(" / ");
          return `
            <li>
              <span>${esc(item.name)}</span>
              ${meta ? `<small>${esc(meta)}</small>` : ""}
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

function renderArmorSetPiecesPanel(row) {
  const bySlot = armorSetItemsBySlot(row);
  const cards = armorPieceSlots
    .map((slotDef) => {
      const items = bySlot.get(slotDef.id) || [];
      const slot = {
        slot: slotDef,
        item: items[0] || null,
        count: items.length,
        missing: !items.length,
      };
      const primary = slot.item;
      const variant = slot.count > 1 ? `<span class="armor-piece-note">${esc(t("armorSetPieceVariants"))}: ${esc(slot.count)}</span>` : "";
      const officialNames =
        slot.count > 1
          ? `<span class="armor-piece-official-label">${esc(t("armorOfficialNames"))}</span>${renderArmorSetOfficialNames(items)}`
          : slot.missing
            ? `<span class="armor-piece-name-empty">${esc(t("armorOfficialNamePending"))}</span>`
            : "";
      return `
        <article class="armor-set-piece-card${slot.missing ? " is-missing" : ""}">
          ${renderArmorSlotIcon(slot, "item-icon")}
          <div class="armor-piece-copy">
            <strong>${esc(armorSlotLabel(slot.slot.id))}</strong>
            <span class="armor-piece-main-name">${esc(primary?.name || t("armorOfficialNamePending"))}</span>
            ${variant}
            ${officialNames}
          </div>
        </article>
      `;
    })
    .filter(Boolean)
    .join("");
  if (!cards) return "";
  return `
    <section class="panel armor-set-pieces-panel">
      <h3>${esc(t("armorSetPieces"))}</h3>
      <div class="armor-set-piece-list">
        ${cards}
      </div>
    </section>
  `;
}

function renderArmorSetIntrinsicBonus(row) {
  const plug = armorSetBonusOptionForName(row.armorSetName || row.name);
  if (!plug && !row.armorSetHasSetBonus) return "";
  return `
    <section class="panel armor-set-intrinsic-bonus">
      <h3>${esc(t("armorSetBonusEffect"))}</h3>
      ${
        plug
          ? `<div class="set-bonus-selection">
              <h4>${esc(cleanSetBonusName(plug.name))}</h4>
              ${renderSetBonusEffects(plug)}
            </div>`
          : `<div class="set-bonus-effects">${renderSetBonusEffectCard({ name: row.armorSetName || row.name }, "two")}</div>`
      }
    </section>
  `;
}

function classBuildArmorKey(classId) {
  return `class-build:${classId}`;
}

function classBuildWeaponKey(classId, slotId) {
  return `${classId}:${slotId}`;
}

function classBuildWeaponState(classId, slotId) {
  const key = classBuildWeaponKey(classId, slotId);
  return state.classBuildWeapons[key] || "";
}

function weaponBuildSlotId(row) {
  const rank = slotRank(row);
  if (rank === 0) return "kinetic";
  if (rank === 1) return "energy";
  if (rank === 2) return "power";
  return "";
}

function weaponOptionsForBuildSlot(slotId) {
  return weaponCatalogRows()
    .filter((row) => weaponBuildSlotId(row) === slotId)
    .sort((a, b) => ammoRank(a) - ammoRank(b) || compareText(a.weaponType, b.weaponType) || compareText(a.name, b.name));
}

function selectedBuildWeapon(classId, slotId) {
  const hash = classBuildWeaponState(classId, slotId);
  if (!hash) return null;
  return weaponCatalogRows().find((row) => Number(row.hash) === Number(hash)) || null;
}

function selectedBuildWeaponByHash(hash) {
  if (!hash) return null;
  return weaponCatalogRows().find((row) => Number(row.hash) === Number(hash)) || null;
}

function buildWeaponOptionLabel(row) {
  return [row.name, row.weaponType, compactMetaLabel(row.ammo), releaseListLabel(row)].filter(Boolean).join(" / ");
}

function renderBuildWeaponSelector(classId, slot) {
  const options = weaponOptionsForBuildSlot(slot.id);
  const selected = classBuildWeaponState(classId, slot.id);
  return `
    <label class="field build-weapon-select">
      <span>${esc(t(slot.labelKey))}</span>
      <select data-build-weapon-slot="${esc(slot.id)}">
        ${selectOptions(options, selected, t("selectWeapon"), "hash", buildWeaponOptionLabel)}
      </select>
    </label>
  `;
}

function renderWeaponPvpCompact(row) {
  const ttk = row.ttk || {};
  const hasValue = [ttk.precisionDamage, ttk.bodyDamage, ttk.optimalTtkMs, ttk.bodyTtkMs, ttk.critShots, ttk.bodyShots, ttk.bodyForgivenessShots, ttk.bodyForgivenessPct].some(hasDisplayValue);
  return `
    <div class="build-weapon-pvp">
      <h4>${esc(t("ttk"))}</h4>
      ${hasValue ? "" : `<div class="notice compact-notice">${esc(t("ttkPending"))}</div>`}
      ${renderMetricCards([
        [t("precisionDamage"), displayValue(ttk.precisionDamage)],
        [t("bodyDamage"), displayValue(ttk.bodyDamage)],
        [t("optimalTtk"), formatMs(ttk.optimalTtkMs)],
        [t("bodyTtk"), formatMs(ttk.bodyTtkMs)],
        [t("critShots"), displayValue(ttk.critShots)],
        [t("bodyShots"), displayValue(ttk.bodyShots)],
        [t("bodyForgiveness"), formatBodyForgiveness(ttk)],
      ], "pvp-metric-grid")}
    </div>
  `;
}

function renderBuildWeaponCard(classId, slot) {
  const row = selectedBuildWeapon(classId, slot.id);
  if (!row) {
    return `
      <section class="build-weapon-card is-empty" data-build-slot="${esc(slot.id)}">
        <div class="build-weapon-head">
          <h4>${esc(t(slot.labelKey))}</h4>
          <span>${esc(t("noWeaponSelected"))}</span>
        </div>
        <div class="notice compact-notice">${esc(t("selectWeapon"))}</div>
      </section>
    `;
  }
  const deltas = statDeltasFor(row);
  const plugBuilder = renderPlugBuilder(row, true);
  return `
    <section class="build-weapon-card" data-build-slot="${esc(slot.id)}" data-build-weapon-card data-build-weapon-hash="${esc(row.hash)}">
      <div class="build-weapon-head">
        ${renderIcon(row, "item-icon")}
        <div>
          <h4>${esc(row.name)}</h4>
          <span>${esc([row.weaponType, compactMetaLabel(row.ammo), compactMetaLabel(row.damageType)].filter(Boolean).join(" / "))}</span>
        </div>
      </div>
      ${renderFrameSummary(row)}
      <div class="build-weapon-stats">
        ${renderStats(row.stats, deltas, false)}
      </div>
      ${plugBuilder ? `<div class="build-weapon-builder">${plugBuilder}</div>` : ""}
      ${renderWeaponPvpCompact(row)}
    </section>
  `;
}

function renderBuildWeaponsPanel(row) {
  const classId = row.buildClassId;
  return `
    <section class="panel build-sim-panel build-sim-weapons">
      <h3>${esc(t("weaponSimulation"))}</h3>
      <div class="build-weapon-controls">
        ${buildWeaponSlots.map((slot) => renderBuildWeaponSelector(classId, slot)).join("")}
      </div>
      <div class="build-weapon-stack">
        ${buildWeaponSlots.map((slot) => renderBuildWeaponCard(classId, slot)).join("")}
      </div>
    </section>
  `;
}

function renderBuildAbilitySelector(classId, slot, subclass) {
  const entry = classBuildAbilityState(classId);
  const options = buildAbilityOptions(classId, slot.id, subclass);
  const selected = entry.slots?.[slot.id] || "";
  return `
    <label class="field build-ability-field">
      <span>${esc(t(slot.labelKey))}</span>
      <select data-build-ability-slot="${esc(slot.id)}">
        <option value="">${esc(t("noAbilitySelected"))}</option>
        ${options
          .map((option) => `<option value="${esc(option.hash)}"${Number(selected) === Number(option.hash) ? " selected" : ""}>${esc(option.name)}</option>`)
          .join("")}
      </select>
    </label>
  `;
}

function renderBuildAbilityPanel(row) {
  const classId = row.buildClassId;
  const entry = classBuildAbilityState(classId);
  const subclasses = buildSubclassRows(classId);
  const subclass = selectedBuildSubclass(classId);
  const selectedRows = [
    subclass,
    ...buildAbilitySlots.map((slot) => selectedBuildAbility(classId, slot.id)),
  ].filter(Boolean);
  return `
    <section class="panel build-sim-panel build-skill-panel">
      <h3>${esc(t("buildSkillConfig"))}</h3>
      ${renderBuildClassSwitcher(classId)}
      <div class="build-skill-grid">
        <label class="field build-ability-field build-ability-field--subclass">
          <span>${esc(t("buildSubclass"))}</span>
          <select data-build-subclass>
            ${subclasses
              .map((option) => `<option value="${esc(option.hash)}"${Number(entry.subclassHash) === Number(option.hash) ? " selected" : ""}>${esc(option.name)}</option>`)
              .join("")}
          </select>
        </label>
        ${buildAbilitySlots.map((slot) => renderBuildAbilitySelector(classId, slot, subclass)).join("")}
      </div>
      ${selectedRows.length ? `<div class="build-skill-summary">${selectedRows.map((selected) => `<span class="badge">${esc(selected.name)}</span>`).join("")}</div>` : ""}
    </section>
  `;
}

function renderBuildArmorPanel(row) {
  const classId = row.buildClassId;
  const setKey = classBuildArmorKey(classId);
  const totals = armorSetTotals(setKey);
  return `
    <div class="build-sim-armor">
      <section class="panel build-sim-panel">
        <h3>${esc(t("armorSimulation"))}</h3>
        <div class="notice compact-notice">${esc(t("buildSimulatorNoLegendary"))}</div>
        <h4>${esc(t("armorSetTotals"))}</h4>
        ${renderArmorSetStats(totals)}
      </section>
      <section class="panel build-sim-panel armor-pieces-panel">
        <h3>${esc(t("armorPieceConfig"))}</h3>
        <div class="armor-piece-grid">
          ${armorPieceSlots.map((slot) => renderArmorPieceCard(setKey, slot)).join("")}
        </div>
      </section>
      <div class="build-armor-side">
        ${renderArmorExoticPanel(setKey, classId)}
        ${renderArmorSetBonusPanel(setKey)}
      </div>
    </div>
  `;
}

function renderBuildClassSwitcher(activeClassId) {
  return `
    <div class="build-class-switcher" aria-label="${esc(t("classSwitch"))}">
      ${buildSimulatorRows()
        .map((row) => `
          <button class="build-class-chip${row.buildClassId === activeClassId ? " is-active" : ""}" type="button" data-build-class-target="${esc(row.buildClassId)}" aria-pressed="${esc(String(row.buildClassId === activeClassId))}">
            ${renderIcon(row, "build-class-icon")}
            <span>${esc(row.class)}</span>
          </button>
        `)
        .join("")}
    </div>
  `;
}

function renderBuildSimulatorDetail(row) {
  const classId = row.buildClassId;
  const emblem = classBuildEmblem(classId);
  const metadata = [
    [t("class"), row.class],
    [t("classEmblem"), emblem.name],
    [t("buildSkillConfig"), selectedBuildSubclass(classId)?.name || ""],
    [t("armorLoadout"), t("armorTier5")],
  ];
  els.detail.innerHTML = `
    <div class="detail-shell build-sim-shell">
      <div class="detail-hero">
        ${renderIcon(row, "detail-icon")}
        <div>
          <div class="detail-title-row">
            <h2>${esc(row.name)}</h2>
            ${renderMetadataHover(metadata)}
          </div>
          <div class="badge-line">
            <span class="badge">${esc(row.class)}</span>
            <span class="badge">${esc(t("buildSkillConfig"))}</span>
            <span class="badge">${esc(t("armorLoadout"))}</span>
            <span class="badge">${esc(t("armorTier5"))}</span>
          </div>
          <p class="description">${esc(t("buildSimulatorDescription"))}</p>
        </div>
      </div>

      ${renderBuildAbilityPanel(row)}

      <div class="build-sim-layout build-sim-layout--armor-only">
        <div class="build-sim-column build-sim-column--armor">
          ${renderBuildArmorPanel(row)}
        </div>
      </div>
    </div>
  `;
  bindBuildSimulatorControls(row);
}

function bindBuildWeaponPlugControls(buildRow) {
  els.detail.querySelectorAll("[data-build-weapon-card] [data-plug-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-build-weapon-card]");
      const weapon = selectedBuildWeaponByHash(card?.dataset.buildWeaponHash);
      const socket = (weapon?.plugSockets || []).find((entry) => String(entry.index) === String(button.dataset.socketIndex));
      if (!weapon || !socket) return;
      const key = selectionKey(weapon, socket);
      if (button.dataset.plugHash) {
        state.selectedPlugs[key] = Number(button.dataset.plugHash);
      } else {
        delete state.selectedPlugs[key];
      }
      delete state.openPlugSockets[key];
      renderDetail(buildRow);
    });
  });
  els.detail.querySelectorAll("[data-build-weapon-card] [data-plug-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-build-weapon-card]");
      const weapon = selectedBuildWeaponByHash(card?.dataset.buildWeaponHash);
      const socket = (weapon?.plugSockets || []).find((entry) => String(entry.index) === String(button.dataset.socketIndex));
      if (!weapon || !socket) return;
      const key = selectionKey(weapon, socket);
      state.openPlugSockets[key] = !state.openPlugSockets[key];
      renderDetail(buildRow);
    });
  });
}

function bindBuildSimulatorControls(row) {
  const classId = row.buildClassId;
  els.detail.querySelectorAll("[data-build-class-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = buildSimulatorRows().find((candidate) => candidate.buildClassId === button.dataset.buildClassTarget);
      if (!next) return;
      state.selectedHash = next.hash;
      renderList();
    });
  });
  els.detail.querySelector("[data-build-subclass]")?.addEventListener("change", (event) => {
    const entry = classBuildAbilityState(classId);
    entry.subclassHash = event.target.value ? Number(event.target.value) : "";
    entry.slots = {};
    renderDetail(row);
  });
  els.detail.querySelectorAll("[data-build-ability-slot]").forEach((select) => {
    select.addEventListener("change", () => {
      const entry = classBuildAbilityState(classId);
      entry.slots[select.dataset.buildAbilitySlot] = select.value ? Number(select.value) : "";
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-build-weapon-slot]").forEach((select) => {
    select.addEventListener("change", () => {
      const key = classBuildWeaponKey(classId, select.dataset.buildWeaponSlot);
      state.classBuildWeapons[key] = select.value ? Number(select.value) : "";
      renderDetail(row);
    });
  });
  bindBuildWeaponPlugControls(row);
  bindArmorSetControls(row, classBuildArmorKey(classId), classId);
}

function renderAbilityDetail(row) {
  const badges = [row.type, row.class, row.tier].filter(Boolean);
  const metadata = [
    [t("hash"), row.hash],
    [t("category"), `${groupLabel(row.primaryGroup)} / ${row.sectionLabel || sectionLabel(row.primarySection)}`],
    [t("type"), row.type],
    [t("class"), row.class],
    [t("bucket"), row.bucket],
    [t("rarity"), row.tier],
  ];
  els.detail.innerHTML = `
    <div class="detail-shell ability-shell">
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
          ${row.description ? `<p class="description">${esc(row.description)}</p>` : `<p class="description">${esc(t("abilityIndexDescription"))}</p>`}
        </div>
      </div>
      <section class="panel ability-detail-panel">
        <h3>${esc(t("abilityIndex"))}</h3>
        ${renderKv([
          [t("type"), row.type],
          [t("class"), row.class],
          [t("category"), row.categories],
        ])}
      </section>
    </div>
  `;
}

function renderArmorSetDetail(row) {
  const classId = row.armorSetClassId || armorSetHashClasses[String(row.hash)] || "hunter";
  const setKey = row.armorSetKey || classId;
  const description = row.armorSetHasSetBonus ? t("armorSetDetailNote") : t("armorLegacyNoBuild");
  const metadata = [
    [t("class"), row.class],
    [t("type"), row.type],
    [t("armorSetBonus"), row.armorSetHasSetBonus ? t("armorSetBonusEffect") : ""],
    [t("armorSetPieces"), row.armorSetVariantCount],
    [t("release"), releaseSeasonLabel(row)],
  ];
  els.detail.innerHTML = `
    <div class="detail-shell armor-set-shell">
      <div class="detail-hero">
        ${renderIcon(row, "detail-icon")}
        <div>
          <div class="detail-title-row">
            <h2>${esc(row.name)}</h2>
            ${renderMetadataHover(metadata)}
          </div>
          <div class="badge-line">
            <span class="badge">${esc(row.class)}</span>
            <span class="badge">${esc(row.armorSlot || "")}</span>
            <span class="badge">${esc(t("armorSetReadOnly"))}</span>
            ${row.armorSetHasSetBonus ? `<span class="badge">${esc(t("armorSetBonus"))}</span>` : ""}
          </div>
          <p class="description">${esc(description)}</p>
        </div>
      </div>

      <div class="armor-set-layout armor-set-layout--single">
        <div class="armor-set-main">
          ${renderArmorSetPiecesPanel(row)}
          ${renderArmorSetIntrinsicBonus(row)}
        </div>
      </div>
    </div>
  `;
  bindArmorSetControls(row, setKey, classId);
}

function bindArmorSetControls(row, setKey, classId) {
  els.detail.querySelectorAll("[data-armor-item-hash]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (row.armorSetItems || []).find((candidate) => Number(candidate.hash) === Number(button.dataset.armorItemHash));
      if (item) renderDetail(item);
    });
  });
  els.detail.querySelectorAll("[data-armor-piece-archetype]").forEach((select) => {
    select.addEventListener("change", () => {
      const slotId = select.dataset.armorPieceArchetype;
      const piece = armorSetPieceState(setKey, slotId);
      piece.archetypeHash = Number(select.value || defaultArmorArchetypeHash);
      normalizeArmorPieceState(piece);
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-armor-piece-tertiary]").forEach((select) => {
    select.addEventListener("change", () => {
      armorSetPieceState(setKey, select.dataset.armorPieceTertiary).tertiary = select.value;
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-armor-piece-general]").forEach((select) => {
    select.addEventListener("change", () => {
      armorSetPieceState(setKey, select.dataset.armorPieceGeneral).generalModHash = select.value;
      renderDetail(row);
    });
  });
  els.detail.querySelectorAll("[data-armor-piece-focus]").forEach((select) => {
    select.addEventListener("change", () => {
      armorSetPieceState(setKey, select.dataset.armorPieceFocus).focusModHash = select.value;
      renderDetail(row);
    });
  });
  els.detail.querySelector("[data-armor-bulk-archetype]")?.addEventListener("change", (event) => {
    const bulk = armorBulkState(setKey);
    bulk.archetypeHash = Number(event.target.value || defaultArmorArchetypeHash);
    normalizeArmorPieceState(bulk);
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-bulk-tertiary]")?.addEventListener("change", (event) => {
    armorBulkState(setKey).tertiary = event.target.value;
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-bulk-general]")?.addEventListener("change", (event) => {
    armorBulkState(setKey).generalModHash = event.target.value;
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-bulk-focus]")?.addEventListener("change", (event) => {
    armorBulkState(setKey).focusModHash = event.target.value;
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-bulk-apply]")?.addEventListener("click", () => {
    applyArmorBulkState(setKey);
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-exotic-slot]")?.addEventListener("change", (event) => {
    const exotic = armorSetExoticState(setKey);
    exotic.slot = event.target.value;
    exotic.hash = "";
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-exotic]")?.addEventListener("change", (event) => {
    armorSetExoticState(setKey).hash = event.target.value;
    renderDetail(row);
  });
  els.detail.querySelectorAll("[data-armor-bonus-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const bonus = armorSetBonusState(setKey);
      bonus.mode = button.dataset.armorBonusMode || "none";
      renderDetail(row);
    });
  });
  els.detail.querySelector("[data-armor-bonus-primary]")?.addEventListener("change", (event) => {
    armorSetBonusState(setKey).primaryHash = event.target.value;
    renderDetail(row);
  });
  els.detail.querySelector("[data-armor-bonus-secondary]")?.addEventListener("change", (event) => {
    armorSetBonusState(setKey).secondaryHash = event.target.value;
    renderDetail(row);
  });
}

function renderDetail(row) {
  if (!row) {
    renderEmpty();
    return;
  }
  if (isBuildSimulatorRow(row)) {
    renderBuildSimulatorDetail(row);
    return;
  }
  if (isArmorSetRow(row)) {
    renderArmorSetDetail(row);
    return;
  }
  if (isAbilityRow(row)) {
    renderAbilityDetail(row);
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
  const ttk = row.ttk || {};
  const ttkAudit = (row.sections || []).includes("weapons")
    ? [
        [t("ttkScope"), ttkScopeLabel(ttk.sourceScope)],
        [t("status"), ttkStatusLabel(ttk.status)],
        [t("mode"), ttk.mode || "PvP"],
        [t("sandboxVersion"), displayValue(ttk.sandboxVersion)],
        [t("conditions"), ttk.conditions],
        [t("source"), formatTtkSource(ttk.sourceExtractionId)],
      ]
    : [];
  const plugBuilder = isArmorRow(row) ? "" : renderPlugBuilder(row);
  const ttkPanel = renderTtk(row);
  const metadata = [...metadataRows(row, release, plugSets), ...ttkAudit];
  const weaponVersionSwitcher = renderWeaponVersionSwitcher(row);

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

      ${weaponVersionSwitcher}

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
  els.detail.querySelectorAll("[data-weapon-version]").forEach((button) => {
    button.addEventListener("click", () => {
      const hash = Number(button.dataset.weaponVersion);
      const variant = weaponCatalogRows().find((entry) => Number(entry.hash) === hash);
      if (!variant) return;
      state.weaponVariantSelections[weaponVariantGroupKey(variant)] = hash;
      state.selectedHash = hash;
      renderList();
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
els.themeWhite.addEventListener("click", () => setTheme("white"));
els.themeBlack.addEventListener("click", () => setTheme("black"));
els.searchInput.addEventListener("input", renderList);
filterControls.forEach(({ select }) => select.addEventListener("change", renderList));
els.sortSelect.addEventListener("change", () => {
  state.sort = els.sortSelect.value;
  renderList();
});
els.clearButton.addEventListener("click", () => clearFilters(true));

setTheme(state.theme);
setLanguage(state.lang);
