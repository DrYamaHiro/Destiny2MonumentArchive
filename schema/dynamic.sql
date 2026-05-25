-- D2 Monument Archive BATTLE LOG schema draft
-- Public outputs should be aggregate-only. Raw player/match logs stay private/local.

CREATE TABLE IF NOT EXISTS match_observed (
  activity_id TEXT PRIMARY KEY,
  period_utc TEXT NOT NULL,
  mode_hash INTEGER,
  mode_name TEXT,
  map_hash INTEGER,
  map_name TEXT,
  manifest_version TEXT,
  source_scope TEXT NOT NULL,
  ingested_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS match_player_observed (
  activity_id TEXT NOT NULL,
  player_key TEXT NOT NULL,
  character_class TEXT,
  team INTEGER,
  standing INTEGER,
  kills INTEGER,
  deaths INTEGER,
  assists INTEGER,
  score INTEGER,
  completed BOOLEAN,
  PRIMARY KEY (activity_id, player_key),
  FOREIGN KEY (activity_id) REFERENCES match_observed(activity_id)
);

CREATE TABLE IF NOT EXISTS match_weapon_observed (
  activity_id TEXT NOT NULL,
  player_key TEXT NOT NULL,
  weapon_hash INTEGER NOT NULL,
  kills INTEGER,
  precision_kills INTEGER,
  shots_fired INTEGER,
  shots_landed INTEGER,
  PRIMARY KEY (activity_id, player_key, weapon_hash),
  FOREIGN KEY (activity_id, player_key) REFERENCES match_player_observed(activity_id, player_key)
);

CREATE TABLE IF NOT EXISTS loadout_snapshot_observed (
  snapshot_id TEXT PRIMARY KEY,
  activity_id TEXT,
  player_key TEXT NOT NULL,
  character_key TEXT,
  captured_at_utc TEXT NOT NULL,
  capture_lag_seconds INTEGER,
  confidence TEXT NOT NULL DEFAULT 'low',
  source_scope TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loadout_equipment_observed (
  snapshot_id TEXT NOT NULL,
  slot_name TEXT NOT NULL,
  item_hash INTEGER NOT NULL,
  item_instance_key TEXT,
  PRIMARY KEY (snapshot_id, slot_name),
  FOREIGN KEY (snapshot_id) REFERENCES loadout_snapshot_observed(snapshot_id)
);

CREATE TABLE IF NOT EXISTS loadout_weapon_perk_observed (
  snapshot_id TEXT NOT NULL,
  weapon_hash INTEGER NOT NULL,
  item_instance_key TEXT,
  plug_hash INTEGER NOT NULL,
  socket_index INTEGER,
  PRIMARY KEY (snapshot_id, weapon_hash, plug_hash, socket_index),
  FOREIGN KEY (snapshot_id) REFERENCES loadout_snapshot_observed(snapshot_id)
);

CREATE TABLE IF NOT EXISTS agg_weapon_daily (
  agg_date TEXT NOT NULL,
  mode_name TEXT NOT NULL,
  sandbox_version_id TEXT,
  weapon_hash INTEGER NOT NULL,
  observed_players INTEGER,
  observed_users INTEGER,
  observed_kills INTEGER,
  usage_share REAL,
  kill_share REAL,
  ku_index REAL,
  precision_rate REAL,
  sample_note TEXT,
  PRIMARY KEY (agg_date, mode_name, weapon_hash)
);

CREATE TABLE IF NOT EXISTS agg_weapon_perk_daily (
  agg_date TEXT NOT NULL,
  mode_name TEXT NOT NULL,
  weapon_hash INTEGER NOT NULL,
  plug_hash INTEGER NOT NULL,
  observed_users INTEGER,
  observed_kills INTEGER,
  ku_index REAL,
  weapon_baseline_ku REAL,
  delta_ku REAL,
  confidence TEXT NOT NULL,
  PRIMARY KEY (agg_date, mode_name, weapon_hash, plug_hash)
);

CREATE TABLE IF NOT EXISTS agg_exotic_armor_daily (
  agg_date TEXT NOT NULL,
  mode_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  exotic_armor_hash INTEGER NOT NULL,
  observed_users INTEGER,
  adoption_share REAL,
  win_proxy REAL,
  kd_proxy REAL,
  confidence TEXT NOT NULL,
  PRIMARY KEY (agg_date, mode_name, class_name, exotic_armor_hash)
);
