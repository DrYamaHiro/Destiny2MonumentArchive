-- D2 Monument Archive static DB schema draft
-- Text-first schema for GitHub-friendly storage.

CREATE TABLE IF NOT EXISTS manifest_version (
  manifest_version TEXT PRIMARY KEY,
  synced_at_utc TEXT NOT NULL,
  source_endpoint TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS entity (
  entity_hash INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL,
  manifest_version TEXT NOT NULL,
  icon_path TEXT,
  item_type INTEGER,
  item_sub_type INTEGER,
  tier_type INTEGER,
  class_type INTEGER,
  bucket_type_hash INTEGER,
  equipment_slot_type_hash INTEGER,
  ammo_type INTEGER,
  FOREIGN KEY (manifest_version) REFERENCES manifest_version(manifest_version)
);

CREATE TABLE IF NOT EXISTS entity_i18n (
  entity_hash INTEGER NOT NULL,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type_display_name TEXT,
  PRIMARY KEY (entity_hash, language),
  FOREIGN KEY (entity_hash) REFERENCES entity(entity_hash)
);

CREATE TABLE IF NOT EXISTS weapon_static (
  weapon_hash INTEGER PRIMARY KEY,
  weapon_type TEXT,
  ammo_type INTEGER,
  damage_type_hash INTEGER,
  frame_name TEXT,
  rpm INTEGER,
  burst_count INTEGER,
  charge_time_ms INTEGER,
  draw_time_ms INTEGER,
  source_quality TEXT NOT NULL DEFAULT 'manifest_partial',
  FOREIGN KEY (weapon_hash) REFERENCES entity(entity_hash)
);

CREATE TABLE IF NOT EXISTS weapon_stat_value (
  weapon_hash INTEGER NOT NULL,
  stat_hash INTEGER NOT NULL,
  value REAL,
  minimum REAL,
  maximum REAL,
  PRIMARY KEY (weapon_hash, stat_hash),
  FOREIGN KEY (weapon_hash) REFERENCES weapon_static(weapon_hash)
);

CREATE TABLE IF NOT EXISTS plug_static (
  plug_hash INTEGER PRIMARY KEY,
  plug_category_hash INTEGER,
  plug_category_identifier TEXT,
  icon_path TEXT,
  FOREIGN KEY (plug_hash) REFERENCES entity(entity_hash)
);

CREATE TABLE IF NOT EXISTS weapon_plug_reference (
  weapon_hash INTEGER NOT NULL,
  plug_hash INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  PRIMARY KEY (weapon_hash, plug_hash, source_type),
  FOREIGN KEY (weapon_hash) REFERENCES weapon_static(weapon_hash),
  FOREIGN KEY (plug_hash) REFERENCES plug_static(plug_hash)
);

CREATE TABLE IF NOT EXISTS sandbox_version (
  sandbox_version_id TEXT PRIMARY KEY,
  effective_date TEXT NOT NULL,
  manifest_version TEXT,
  source_url TEXT,
  source_title TEXT,
  verification_status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS ttk_profile (
  ttk_profile_id TEXT PRIMARY KEY,
  sandbox_version_id TEXT NOT NULL,
  weapon_hash INTEGER,
  archetype_label TEXT,
  mode TEXT NOT NULL DEFAULT 'pvp',
  resilience_tier INTEGER,
  optimal_ttk_ms INTEGER,
  body_ttk_ms INTEGER,
  crit_required INTEGER,
  body_required INTEGER,
  damage_crit REAL,
  damage_body REAL,
  effective_range_m REAL,
  conditions TEXT,
  source_quality TEXT NOT NULL DEFAULT 'needs_verification',
  notes TEXT,
  FOREIGN KEY (sandbox_version_id) REFERENCES sandbox_version(sandbox_version_id),
  FOREIGN KEY (weapon_hash) REFERENCES weapon_static(weapon_hash)
);
