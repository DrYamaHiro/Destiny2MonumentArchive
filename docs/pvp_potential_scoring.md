# PvP Potential Scoring Proposal

作成日: 2026-05-25

## 方針

PvP POTENTIALは「この武器がPvPでどれだけ強く見えるか」を1つの数字に押し込むものではなく、閲覧時に比較しやすくするための補助スコアとして扱う。

武器種をまたいで直接比較すると歪むため、スコアは原則として `weaponTypeId + ammoType + archetype/rpm` の近いグループ内で正規化する。例: 140 RPMハンドキャノン同士、600 RPMオートライフル同士。

## データ粒度

PvP POTENTIALの基準値は、武器個別ではなくフレーム/アーキタイプ単位を正本にする。

理由:

- BungieのPvPダメージ調整は、多くの場合「武器そのもの」ではなく「フレーム」「RPM帯」「武器タイプ」に対して入る
- 同じフレームの武器は、基礎ダメージ、必要弾数、基礎TTKを共有することが多い
- 各武器へ個別に同じTTKを複製すると、更新時の修正漏れが起きやすい
- 射程、安定性、照準補佐、パーク、Mod、マスターワーク差分は、同じフレーム基準値の上に武器個別の評価として重ねる方が読みやすい

DBでは次の優先順で適用する。

1. 武器個別例外: エキゾチック固有挙動、固有発射モード、Bungieが武器名で指定した変更
2. フレーム基準: 武器タイプ + フレーム/アーキタイプ + RPM帯
3. 未確定: フレーム同定またはダメージ根拠が不足しているもの

公開ビューア上では各武器詳細にPvP POTENTIALを表示するが、値の出典単位として `フレーム基準` または `武器個別` を明示する。

## 表示項目

PvP POTENTIALの基本表示項目は以下とする。

- Precision Damage / 精密ダメージ
- Body Damage / ボディダメージ
- Optimal TTK
- BS TTK
- Crits to Kill / 全弾精密キル弾数
- Body Shots to Kill / 全弾BSキル弾数
- Body Shot Forgiveness / 最速キルBS許容

初期計算では、ガーディアンの対象HPを体力+シールド合計 `230` として扱う。

WPは防具側のWeapons parameterとして扱う。初期計算では、WP 100以下はPvP武器ダメージ補正 `0%`、WP 100から200までを線形に伸ばし、WP 200で最大 `+5%` とする。以前の公開情報には `+6%` が残っている場合があるが、D2 Monument Archiveではゲーム内確認を優先して `+5%` を現行Sandboxの基準値にする。Sandboxや実測で補正値が変わる可能性があるため、最大補正は `wp_max_bonus_pct` としてDBに保持する。

```text
WP補正 = max(0, min(WP, 200) - 100) / 100 * wp_max_bonus_pct
実効ダメージ = 基準ダメージ * (1 + WP補正)
```

```text
BS許容数 = floor((CritsToKill * EffectivePrecisionDamage - TargetHP) / (EffectivePrecisionDamage - EffectiveBodyDamage))
BS許容数 = 0 から CritsToKill の範囲に丸める
BS許容率 = BS許容数 / CritsToKill
```

## 正規化

各入力値はグループ内で0から100に変換する。

- 高いほど良い値: Accuracy、Aim Assist、Range、Stability、Handlingなどは percentile(value)
- 低いほど良い値: Optimal TTK、BS TTK、必要弾数は 100 - percentile(value)
- 欠損値: 50点の中立値を仮置きし、別途 `score_confidence` を下げる

## 推奨スコア

```text
PvP Potential Score =
  0.45 * Lethality Score
+ 0.40 * Consistency Score
+ 0.15 * Readiness Score
```

### Lethality Score

```text
Lethality =
  0.38 * OptimalTTKScore
+ 0.22 * BSTTKScore
+ 0.22 * BodyShotForgivenessScore
+ 0.18 * KillRequirementScore
```

キル速度だけを過大評価しないため、BS TTKとBS許容を入れる。最速TTKが速くても、全弾精密前提でしか成立しない武器はここで少し抑えられる。

### Consistency Score

```text
Consistency =
  0.25 * AccuracyScore
+ 0.25 * AimAssistScore
+ 0.20 * RangeScore
+ 0.15 * StabilityScore
+ 0.15 * RecoilDirectionScore
```

Accuracyは「弾が相手に吸われる/命中判定がまとまる側」、Aim Assistは「照準が相手に寄る側」として別項目で扱う。Manifest上でAccuracyが取れない武器は欠損値扱いにする。

反動方向は高いほど良いが、Destiny 2では下一桁が5に近いほど縦反動として扱いやすい。暫定式は以下。

```text
VerticalBonus =
  10点: 下一桁が5
   5点: 下一桁が4または6
   0点: それ以外

RecoilDirectionScore = min(100, RecoilDirection + VerticalBonus)
```

### Readiness Score

```text
Readiness =
  0.70 * HandlingScore
+ 0.20 * ReloadScore
+ 0.10 * AirborneEffectivenessScore
```

撃ち始め、武器持ち替え、ADS移行の体感に近い部分を補助評価する。PvPでの取り回しを見るため、Handlingを強めに置く。

## 信頼度

スコア本体とは別に、必ず `score_confidence` を表示する。

```text
score_confidence =
  0.50 * data_fill_rate
+ 0.30 * source_quality
+ 0.20 * sandbox_freshness
```

- `data_fill_rate`: 必要項目の充足率
- `source_quality`: 公式パッチノート、実測、コミュニティ検証の質
- `sandbox_freshness`: 現行Sandboxと一致しているか

特に6月最終アップデート後は、Sandboxが変わった時点でPvP POTENTIALを再計算し、旧Sandboxの数値は履歴として残す。
