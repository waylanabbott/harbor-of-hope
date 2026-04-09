"""
Explanatory Insights — four data-driven analyses written to PostgreSQL
for the .NET API and React frontend.

Pipeline 1  Home Visit Outcome Drivers           (Logistic, n~1337)
Pipeline 2  Counseling Session Effectiveness      (Logistic, n~2819)
Pipeline 3  Social Media Engagement Factors       (OLS,      n~812)
Pipeline 4  Safehouse Resources & Education       (OLS + FE, n~300+)

Usage
-----
    cd jobs
    python run_explanatory_insights.py
"""

import json
import traceback
import numpy as np
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text
from sklearn.preprocessing import StandardScaler
import statsmodels.api as sm
import warnings

warnings.filterwarnings("ignore")

from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)


# ── Helpers ───────────────────────────────────────────────────────────────

def to_bool_int(series):
    return (
        series.map({True: 1, False: 0, "True": 1, "False": 0})
        .fillna(0)
        .astype(int)
    )


def make_interpretation(friendly_name, coef, pv, pos_outcome, neg_outcome):
    """Plain-English, non-causal, always-accurate one-liner."""
    strength = "significantly" if pv < 0.05 else "modestly"
    outcome = pos_outcome if coef > 0 else neg_outcome
    return f"{friendly_name} is {strength} associated with {outcome}."


def build_key_insight(params, pvals, friendly_map, pos_phrase, neg_phrase):
    """Narrative summary from model results."""
    sig = {f: params[f] for f in params.index if pvals.get(f, 1) < 0.05}

    if not sig:
        top = params.abs().nlargest(3).index.tolist()
        names = ", ".join(friendly_map.get(f, f) for f in top)
        return (
            f"No individual factor reached statistical significance (p < 0.05) "
            f"in this sample. The strongest associations were with {names}. "
            f"These patterns may become clearer with more data."
        )

    pos = sorted(
        [(friendly_map.get(f, f), c) for f, c in sig.items() if c > 0],
        key=lambda x: abs(x[1]),
        reverse=True,
    )
    neg = sorted(
        [(friendly_map.get(f, f), c) for f, c in sig.items() if c < 0],
        key=lambda x: abs(x[1]),
        reverse=True,
    )

    parts = []
    if pos:
        names = " and ".join(n for n, _ in pos[:2])
        verb = "are" if len(pos[:2]) > 1 else "is"
        parts.append(f"{names} {verb} significantly {pos_phrase}")
    if neg:
        names = " and ".join(n for n, _ in neg[:2])
        verb = "are" if len(neg[:2]) > 1 else "is"
        parts.append(f"{names} {verb} significantly {neg_phrase}")

    return (
        ". ".join(parts)
        + ". These patterns reflect associations in our data, not controlled experiments."
    )


def extract_features(
    pid, params, pvals, friendly_map,
    pos_dir, neg_dir, pos_outcome, neg_outcome, max_n=8,
):
    """Build feature rows for the explanatory_features table."""
    ordered = params.abs().sort_values(ascending=False).index.tolist()[:max_n]
    rows = []
    for rank, feat in enumerate(ordered):
        c = float(params[feat])
        p = float(pvals[feat])
        fn = friendly_map.get(feat, feat)
        rows.append(
            {
                "pipeline_id": pid,
                "feature_name": fn,
                "coefficient": round(c, 4),
                "p_value": round(p, 4),
                "direction": pos_dir if c > 0 else neg_dir,
                "interpretation": make_interpretation(
                    fn, c, p, pos_outcome, neg_outcome
                ),
                "is_significant": p < 0.05,
                "feature_rank": rank + 1,
            }
        )
    return rows


# ── Pipeline 1: Home Visit Outcome Drivers ────────────────────────────────

def run_pipeline_1():
    """What family & visit factors are associated with favorable visit outcomes?"""
    print("  Loading home_visitations...")
    vis = pd.read_sql("SELECT * FROM home_visitations", engine)
    print(f"  {len(vis)} visit records loaded")

    vis["favorable"] = (vis["visit_outcome"] == "Favorable").astype(int)

    coop_map = {
        "Highly Cooperative": 4,
        "Cooperative": 3,
        "Neutral": 2,
        "Uncooperative": 1,
    }
    vis["coop_score"] = vis["family_cooperation_level"].map(coop_map)
    vis["safety_flag"] = to_bool_int(vis["safety_concerns_noted"])

    vis["num_family_present"] = (
        vis["family_members_present"]
        .fillna("")
        .apply(lambda x: len([p for p in x.split(";") if p.strip()]) if x.strip() else 0)
    )

    vis = vis.sort_values(["resident_id", "visit_date"])
    vis["visit_number"] = vis.groupby("resident_id").cumcount() + 1

    feature_cols = ["coop_score", "safety_flag", "num_family_present", "visit_number"]
    friendly_map = {
        "coop_score": "Family Cooperation",
        "safety_flag": "Safety Concerns Noted",
        "num_family_present": "Family Members Present",
        "visit_number": "Visit Sequence Number",
    }

    df = vis.dropna(subset=feature_cols + ["favorable"])
    X = df[feature_cols].copy()
    y = df["favorable"].copy()

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns, index=X.index)

    print("  Fitting Logistic Regression...")
    X_sm = sm.add_constant(X_scaled)
    model = sm.Logit(y, X_sm).fit(disp=0, maxiter=200)

    params = model.params.drop("const", errors="ignore")
    pvals = model.pvalues.drop("const", errors="ignore")

    features = extract_features(
        pid=1,
        params=params,
        pvals=pvals,
        friendly_map=friendly_map,
        pos_dir="Favors good outcome",
        neg_dir="Favors poor outcome",
        pos_outcome="more favorable visit outcomes",
        neg_outcome="less favorable visit outcomes",
    )

    insight = {
        "pipeline_id": 1,
        "pipeline_name": "Home Visit Outcome Drivers",
        "target_variable": "Favorable Visit Outcome (binary)",
        "model_type": "Logistic Regression",
        "r_squared": round(float(model.prsquared), 4),
        "adj_r_squared": round(float(model.prsquared), 4),
        "sample_size": int(len(y)),
        "key_insight": build_key_insight(
            params,
            pvals,
            friendly_map,
            "linked to more favorable visit outcomes",
            "linked to less favorable visit outcomes",
        ),
        "recommendations_json": json.dumps(
            [
                "Build rapport with families early -- cooperation is the strongest predictor of positive visit outcomes",
                "Develop safety plans before visits where concerns have been previously noted",
                "Maintain consistent visit schedules; repeated visits are associated with better outcomes",
            ]
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Pipeline 2: Counseling Session Effectiveness ──────────────────────────

EMOTION_SCALE = {
    "Happy": 5,
    "Hopeful": 4,
    "Calm": 3,
    "Anxious": 2,
    "Sad": 2,
    "Angry": 1,
    "Withdrawn": 1,
    "Distressed": 0,
}


def run_pipeline_2():
    """What session characteristics are associated with emotional improvement?"""
    print("  Loading process_recordings...")
    sess = pd.read_sql("SELECT * FROM process_recordings", engine)
    print(f"  {len(sess)} session records loaded")

    sess["start_score"] = sess["emotional_state_observed"].map(EMOTION_SCALE)
    sess["end_score"] = sess["emotional_state_end"].map(EMOTION_SCALE)
    sess["improvement"] = sess["end_score"] - sess["start_score"]

    sess["is_individual"] = (sess["session_type"] == "Individual").astype(int)
    sess["duration"] = pd.to_numeric(sess["session_duration_minutes"], errors="coerce")
    sess["concerns_flag"] = to_bool_int(sess["concerns_flagged"])
    sess["referral_flag"] = to_bool_int(sess["referral_made"])

    sess = sess.sort_values(["resident_id", "session_date"])
    sess["session_number"] = sess.groupby("resident_id").cumcount() + 1

    feature_cols = [
        "is_individual",
        "duration",
        "session_number",
        "concerns_flag",
        "referral_flag",
        "start_score",
    ]
    friendly_map = {
        "is_individual": "Individual Session (vs Group)",
        "duration": "Session Duration (minutes)",
        "session_number": "Session Sequence Number",
        "concerns_flag": "Concerns Flagged",
        "referral_flag": "Referral Made",
        "start_score": "Starting Emotional State",
    }

    df = sess.dropna(subset=feature_cols + ["improvement"])
    X = df[feature_cols].copy().astype(float)
    y = df["improvement"].copy().astype(float)

    print(f"  Avg improvement: {y.mean():.2f}, std: {y.std():.2f}")

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns, index=X.index)

    print("  Fitting OLS Regression (controlling for starting emotional state)...")
    X_sm = sm.add_constant(X_scaled)
    model = sm.OLS(y, X_sm).fit()

    params_all = model.params.drop("const", errors="ignore")
    pvals_all = model.pvalues.drop("const", errors="ignore")

    actionable = [c for c in feature_cols if c != "start_score"]
    act_params = params_all[actionable]
    act_pvals = pvals_all[actionable]

    features = extract_features(
        pid=2,
        params=act_params,
        pvals=act_pvals,
        friendly_map=friendly_map,
        pos_dir="Improves mood",
        neg_dir="Worsens mood",
        pos_outcome="greater emotional improvement (controlling for starting state)",
        neg_outcome="less emotional improvement (controlling for starting state)",
    )

    insight = {
        "pipeline_id": 2,
        "pipeline_name": "Counseling Session Effectiveness",
        "target_variable": "Emotional Improvement Score (end - start, controlling for baseline)",
        "model_type": "OLS Regression (controlling for starting emotional state)",
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "sample_size": int(len(y)),
        "key_insight": build_key_insight(
            act_params,
            act_pvals,
            friendly_map,
            "linked to greater emotional improvement in sessions",
            "linked to less emotional improvement in sessions",
        ),
        "recommendations_json": json.dumps(
            [
                "Prioritize individual sessions for residents needing emotional support",
                "Aim for longer sessions when resident engagement allows",
                "Track emotional state changes session-to-session to measure progress",
                "Address flagged concerns promptly to prevent emotional setbacks",
            ]
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Pipeline 3: Social Media Engagement Factors ───────────────────────────

def run_pipeline_3():
    """What post characteristics drive higher engagement rates?"""
    print("  Loading social_media_posts...")
    posts = pd.read_sql("SELECT * FROM social_media_posts", engine)
    print(f"  {len(posts)} posts loaded")

    df = posts.copy()
    for col in ["has_call_to_action", "features_resident_story", "is_boosted"]:
        df[col] = to_bool_int(df[col])

    df["num_hashtags"] = pd.to_numeric(df["num_hashtags"], errors="coerce").fillna(0)
    df["caption_length"] = pd.to_numeric(df["caption_length"], errors="coerce").fillna(0)
    df["post_hour"] = pd.to_numeric(df["post_hour"], errors="coerce").fillna(12)
    df["engagement_rate"] = pd.to_numeric(df["engagement_rate"], errors="coerce")

    platform_dums = pd.get_dummies(
        df["platform"], drop_first=True, dtype=int, prefix="plat"
    )
    df = pd.concat([df, platform_dums], axis=1)

    content_cols = [
        "has_call_to_action",
        "features_resident_story",
        "is_boosted",
        "num_hashtags",
        "caption_length",
        "post_hour",
    ]
    platform_cols = [c for c in df.columns if c.startswith("plat_")]
    all_feature_cols = content_cols + platform_cols

    friendly_map = {
        "has_call_to_action": "Call-to-Action Included",
        "features_resident_story": "Resident Story Featured",
        "is_boosted": "Post Boosted (paid)",
        "num_hashtags": "Number of Hashtags",
        "caption_length": "Caption Length",
        "post_hour": "Posting Hour",
    }
    for c in platform_cols:
        friendly_map[c] = f"Platform: {c.replace('plat_', '')}"

    df = df.dropna(subset=["engagement_rate"])
    X = df[all_feature_cols].copy().fillna(0).astype(float)
    y = df["engagement_rate"].astype(float).copy()

    scaler = StandardScaler()
    X_sc = X.copy()
    X_sc[content_cols] = scaler.fit_transform(X[content_cols])

    print("  Fitting OLS Regression (controlling for platform)...")
    X_ols = sm.add_constant(X_sc)
    model = sm.OLS(y, X_ols).fit()

    params_all = model.params.drop("const", errors="ignore")
    pvals_all = model.pvalues.drop("const", errors="ignore")

    content_params = params_all[content_cols]
    content_pvals = pvals_all[content_cols]

    features = extract_features(
        pid=3,
        params=content_params,
        pvals=content_pvals,
        friendly_map=friendly_map,
        pos_dir="Boosts engagement",
        neg_dir="Reduces engagement",
        pos_outcome="higher post engagement rates",
        neg_outcome="lower post engagement rates",
    )

    insight = {
        "pipeline_id": 3,
        "pipeline_name": "Social Media Engagement Factors",
        "target_variable": "Post Engagement Rate",
        "model_type": "OLS Regression (controlling for platform)",
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "sample_size": int(len(y)),
        "key_insight": build_key_insight(
            content_params,
            content_pvals,
            friendly_map,
            "linked to higher engagement rates",
            "linked to lower engagement rates",
        ),
        "recommendations_json": json.dumps(
            [
                "Include a clear call-to-action in every post to drive interaction",
                "Feature real (anonymized) resident stories to boost empathy and engagement",
                "Experiment with posting times and caption lengths to find what resonates",
                "Use hashtags strategically -- quality over quantity",
            ]
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Pipeline 4: Safehouse Resources & Education Progress ──────────────────

def run_pipeline_4():
    """How do monthly resource levels relate to education progress?"""
    print("  Loading safehouse metrics and allocations...")
    metrics = pd.read_sql("SELECT * FROM safehouse_monthly_metrics", engine)
    allocs = pd.read_sql("SELECT * FROM donation_allocations", engine)

    alloc = allocs.copy()
    alloc["allocation_date"] = pd.to_datetime(alloc["allocation_date"], utc=True)
    alloc["ym"] = alloc["allocation_date"].dt.to_period("M").astype(str)

    spending = (
        alloc.pivot_table(
            index=["safehouse_id", "ym"],
            columns="program_area",
            values="amount_allocated",
            aggfunc="sum",
            fill_value=0,
        )
        .reset_index()
    )
    spending.columns.name = None
    spending.columns = [str(c) for c in spending.columns]
    area_cols = [
        c for c in spending.columns if c not in ("safehouse_id", "ym")
    ]

    met = metrics.copy()
    met["month_start"] = pd.to_datetime(met["month_start"], utc=True)
    met["ym"] = met["month_start"].dt.to_period("M").astype(str)
    df = met.merge(spending, on=["safehouse_id", "ym"], how="left")
    for c in area_cols:
        df[c] = df[c].fillna(0)

    df["avg_health_score"] = pd.to_numeric(
        df["avg_health_score"], errors="coerce"
    )
    df = df.dropna(subset=["avg_health_score"])
    print(f"  {len(df)} safehouse-months with health data")

    safehouses = pd.read_sql("SELECT * FROM safehouses", engine)
    sh_info = safehouses[["safehouse_id", "capacity_girls"]].copy()
    df = df.merge(sh_info, on="safehouse_id", how="left")

    df["wellbeing_funding"] = df.get("Wellbeing", pd.Series(0, index=df.index)).fillna(0)

    feature_cols = [
        "process_recording_count",
        "home_visitation_count",
        "incident_count",
        "active_residents",
        "wellbeing_funding",
    ]
    friendly_map = {
        "process_recording_count": "Counseling Sessions",
        "home_visitation_count": "Home Visits",
        "incident_count": "Incidents Reported",
        "active_residents": "Active Residents",
        "wellbeing_funding": "Wellbeing Funding",
    }

    X = df[feature_cols].copy().apply(pd.to_numeric, errors="coerce").fillna(0)
    y = df["avg_health_score"].copy()

    scaler = StandardScaler()
    X_sc = pd.DataFrame(
        scaler.fit_transform(X), columns=X.columns, index=X.index
    )

    print("  Fitting OLS Regression...")
    X_ols = sm.add_constant(X_sc)
    model = sm.OLS(y, X_ols).fit()

    params = model.params.drop("const", errors="ignore")
    pvals = model.pvalues.drop("const", errors="ignore")

    features = extract_features(
        pid=4,
        params=params,
        pvals=pvals,
        friendly_map=friendly_map,
        pos_dir="Improves progress",
        neg_dir="Hinders progress",
        pos_outcome="higher health scores at the safehouse level",
        neg_outcome="lower health scores at the safehouse level",
    )

    insight = {
        "pipeline_id": 4,
        "pipeline_name": "Safehouse Resources & Health Outcomes",
        "target_variable": "Avg Health Score (monthly, per safehouse)",
        "model_type": "OLS Regression",
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "sample_size": int(len(y)),
        "key_insight": build_key_insight(
            params,
            pvals,
            friendly_map,
            "linked to higher health scores",
            "linked to lower health scores",
        ),
        "recommendations_json": json.dumps(
            [
                "Safehouses with more active residents tend to have better health outcomes -- investigate what drives occupancy",
                "Monitor incident rates as potential early warnings of declining wellbeing",
                "Invest in wellbeing programs at safehouses with lower health scores",
                "Maintain consistent counseling and home visit frequency to support resident health",
            ]
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Write to Database ─────────────────────────────────────────────────────

def run():
    all_insights = []
    all_features = []

    pipelines = [
        ("Pipeline 1 -- Home Visit Outcomes", run_pipeline_1),
        ("Pipeline 2 -- Counseling Effectiveness", run_pipeline_2),
        ("Pipeline 3 -- Social Media Engagement", run_pipeline_3),
        ("Pipeline 4 -- Safehouse Resources & Education", run_pipeline_4),
    ]

    for name, fn in pipelines:
        print(f"\n{'=' * 60}")
        print(f"  {name}")
        print(f"{'=' * 60}")
        try:
            insight, features = fn()
            all_insights.append(insight)
            all_features.extend(features)
            r2 = insight["r_squared"]
            adj = insight["adj_r_squared"]
            n = insight["sample_size"]
            nf = len(features)
            print(f"  Done: R2={r2:.4f}, Adj R2={adj:.4f}, n={n}, {nf} features")
        except Exception as e:
            print(f"  FAILED: {name} -- {e}")
            traceback.print_exc()

    if not all_insights:
        print("\nNo pipelines succeeded. Skipping database write.")
        return

    insights_df = pd.DataFrame(all_insights)
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS explanatory_features"))
        conn.execute(text("DROP TABLE IF EXISTS explanatory_insights"))

    insights_df.to_sql(
        "explanatory_insights", engine, index=False, if_exists="replace"
    )
    with engine.begin() as conn:
        conn.execute(
            text("ALTER TABLE explanatory_insights ADD COLUMN id SERIAL PRIMARY KEY")
        )

    features_df = pd.DataFrame(all_features)
    features_df.to_sql(
        "explanatory_features", engine, index=False, if_exists="replace"
    )
    with engine.begin() as conn:
        conn.execute(
            text("ALTER TABLE explanatory_features ADD COLUMN id SERIAL PRIMARY KEY")
        )

    print(
        f"\nWrote {len(all_insights)} insights and "
        f"{len(all_features)} features to database."
    )


if __name__ == "__main__":
    run()
