"""
Explanatory Insights: runs all 4 explanatory analyses against PostgreSQL,
writes results to `explanatory_insights` and `explanatory_features` tables.

Mirrors the prediction pipeline pattern:
  Notebook (CSV) -> job script (DB) -> PostgreSQL tables -> .NET API -> React

Usage:
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
warnings.filterwarnings('ignore')

from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

# ── Helpers ──────────────────────────────────────────────────────────────

def parse_duration_months(s):
    if pd.isna(s):
        return np.nan
    try:
        parts = str(s).split()
        return int(parts[0]) * 12 + int(parts[2])
    except Exception:
        return np.nan

def to_bool_int(series):
    return series.map({True: 1, False: 0, 'True': 1, 'False': 0}).fillna(0).astype(int)


# Friendly display names for features
FRIENDLY_NAMES = {
    'avg_severity': 'Incident Severity',
    'total_incidents': 'Number of Incidents',
    'safety_concern_rate': 'Safety Concerns in Visits',
    'avg_family_coop': 'Family Cooperation',
    'avg_attendance': 'School Attendance',
    'progress_rate': 'Counseling Progress',
    'achieved_rate': 'Intervention Goals Achieved',
    'abuse_types_count': 'Number of Abuse Types',
    'concern_rate': 'Counseling Concern Rate',
    'total_sessions': 'Total Counseling Sessions',
    'avg_health': 'Average Health Score',
    'avg_nutrition': 'Average Nutrition Score',
    'attendance_slope': 'Attendance Trend',
    'progress_slope': 'Progress Trend',
    'avg_progress': 'Average School Progress',
    'max_progress': 'Peak School Progress',
    'edu_months': 'Months in Education',
    'stay_months': 'Length of Stay',
    'total_visits': 'Total Home Visits',
    'family_risk_count': 'Family Risk Factors',
    'has_call_to_action': 'Has Call-to-Action',
    'features_resident_story': 'Features Resident Story',
    'is_boosted': 'Is Boosted Post',
    'boost_budget_php': 'Boost Budget (PHP)',
    'Wellbeing': 'Wellbeing Funding',
    'Education': 'Education Funding',
    'Operations': 'Operations Funding',
    'Transport': 'Transport Funding',
    'capacity_girls': 'Safehouse Capacity',
    'active_residents': 'Active Residents',
}

def friendly(name):
    return FRIENDLY_NAMES.get(name, name.replace('_', ' ').title())


def interpret_coef(name, coef, context):
    """Generate honest interpretation from the actual coefficient sign."""
    direction = 'higher' if coef > 0 else 'lower'
    fn = friendly(name)

    if context == 'risk':
        return f'{fn} is associated with {direction} risk levels'
    elif context == 'improvement':
        word = 'more' if coef > 0 else 'less'
        return f'{fn} is associated with {word} risk improvement'
    elif context == 'completion':
        word = 'higher' if coef > 0 else 'lower'
        return f'{fn} is associated with {word} reintegration completion'
    elif context == 'donation':
        word = 'higher' if coef > 0 else 'lower'
        return f'{fn} is associated with {word} donation value'
    elif context == 'health':
        word = 'higher' if coef > 0 else 'lower'
        return f'{fn} is associated with {word} health scores'
    else:
        return f'{fn} is associated with {direction} outcomes'


# ── Pipeline 1: Risk Factors ────────────────────────────────────────────

def run_pipeline_1():
    print("  Loading data...")
    residents = pd.read_sql("SELECT * FROM residents", engine)
    education = pd.read_sql("SELECT * FROM education_records", engine)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", engine)
    incidents = pd.read_sql("SELECT * FROM incident_reports", engine)
    sessions = pd.read_sql("SELECT * FROM process_recordings", engine)
    visitations = pd.read_sql("SELECT * FROM home_visitations", engine)
    interventions = pd.read_sql("SELECT * FROM intervention_plans", engine)

    r1 = residents.copy()
    r1['age_months'] = r1['age_upon_admission'].apply(parse_duration_months)
    r1['stay_months'] = r1['length_of_stay'].apply(parse_duration_months)

    bool_cols = [c for c in r1.columns if c.startswith('sub_cat_') or c.startswith('family_')
                 or c in ['is_pwd', 'has_special_needs']]
    for col in bool_cols:
        r1[col] = to_bool_int(r1[col])

    abuse_cols = [c for c in r1.columns if c.startswith('sub_cat_')]
    r1['abuse_types_count'] = r1[abuse_cols].sum(axis=1)
    r1['family_risk_count'] = r1[['family_solo_parent', 'family_indigenous',
                                   'family_parent_pwd', 'family_informal_settler']].sum(axis=1)

    edu_agg = education.groupby('resident_id').agg(
        avg_attendance=('attendance_rate', 'mean'),
        avg_progress=('progress_percent', 'mean'),
    ).reset_index()

    health_agg = health.groupby('resident_id').agg(
        avg_health=('general_health_score', 'mean'),
    ).reset_index()

    inc = incidents.copy()
    inc['severity_num'] = inc['severity'].map({'Low': 1, 'Medium': 2, 'High': 3})
    incident_agg = inc.groupby('resident_id').agg(
        total_incidents=('incident_id', 'count'),
        avg_severity=('severity_num', 'mean')
    ).reset_index()

    sess = sessions.copy()
    sess['concern_flag'] = to_bool_int(sess['concerns_flagged'])
    sess['progress_flag'] = to_bool_int(sess['progress_noted'])
    session_agg = sess.groupby('resident_id').agg(
        total_sessions=('recording_id', 'count'),
        progress_rate=('progress_flag', 'mean')
    ).reset_index()

    vis = visitations.copy()
    vis['safety_flag'] = to_bool_int(vis['safety_concerns_noted'])
    vis['coop_score'] = vis['family_cooperation_level'].map(
        {'Cooperative': 3, 'Neutral': 2, 'Uncooperative': 1}).fillna(2)
    visit_agg = vis.groupby('resident_id').agg(
        avg_family_coop=('coop_score', 'mean'),
        safety_concern_rate=('safety_flag', 'mean')
    ).reset_index()

    int_agg = interventions.groupby('resident_id').agg(
        achieved_rate=('status', lambda x: (x == 'Achieved').mean())
    ).reset_index()

    # Merge aggregated features
    df1 = r1[['resident_id', 'initial_risk_level', 'current_risk_level',
              'abuse_types_count', 'family_risk_count']].copy()

    for agg in [edu_agg, health_agg, incident_agg, session_agg, visit_agg, int_agg]:
        df1 = df1.merge(agg, on='resident_id', how='left')

    df1['total_incidents'] = df1['total_incidents'].fillna(0)
    df1['total_sessions'] = df1['total_sessions'].fillna(0)
    for col in ['progress_rate', 'safety_concern_rate', 'achieved_rate', 'avg_severity']:
        df1[col] = df1[col].fillna(0)

    # Target: risk improvement = initial_risk - current_risk
    # Positive = resident improved (risk went down), Negative = worsened
    risk_map = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
    df1['initial_risk'] = df1['initial_risk_level'].map(risk_map)
    df1['current_risk'] = df1['current_risk_level'].map(risk_map)
    df1['risk_improvement'] = df1['initial_risk'] - df1['current_risk']
    df1 = df1.dropna(subset=['risk_improvement'])

    print(f"  Risk improvement stats: mean={df1['risk_improvement'].mean():.2f}, "
          f"std={df1['risk_improvement'].std():.2f}, range=[{df1['risk_improvement'].min()}, {df1['risk_improvement'].max()}]")

    # Use features that services can influence — cap at 6 for n≈60
    feature_cols = ['total_incidents', 'avg_health', 'progress_rate',
                    'avg_attendance', 'total_sessions', 'achieved_rate']
    feature_cols = [c for c in feature_cols if c in df1.columns]

    X = df1[feature_cols].copy().apply(pd.to_numeric, errors='coerce')
    y = df1['risk_improvement'].copy()
    mask = X.notna().all(axis=1)
    X, y = X.loc[mask], y.loc[mask]

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns, index=X.index)

    print("  Fitting OLS model...")
    X_ols = sm.add_constant(X_scaled)
    model = sm.OLS(y, X_ols).fit()

    params = model.params.drop('const', errors='ignore')
    pvals = model.pvalues.drop('const', errors='ignore')

    sorted_features = params.abs().sort_values(ascending=False).index.tolist()

    features = []
    for rank, feat in enumerate(sorted_features):
        coef = float(params[feat])
        pv = float(pvals[feat])
        features.append({
            'pipeline_id': 1,
            'feature_name': friendly(feat),
            'coefficient': round(coef, 4),
            'p_value': round(pv, 4),
            'direction': 'Helps improvement' if coef > 0 else 'Hinders improvement',
            'interpretation': interpret_coef(feat, coef, 'improvement'),
            'is_significant': pv < 0.05,
            'feature_rank': rank + 1,
        })

    insight = {
        'pipeline_id': 1,
        'pipeline_name': 'Resident Risk Improvement Analysis',
        'target_variable': 'Risk Improvement (initial risk - current risk)',
        'model_type': 'OLS Linear Regression',
        'r_squared': round(float(model.rsquared), 4),
        'adj_r_squared': round(float(model.rsquared_adj), 4),
        'sample_size': int(len(y)),
        'key_insight': _summarize_key_findings(params, pvals, 'improvement'),
        'recommendations_json': json.dumps([
            "Monitor incident frequency — fewer incidents correlate with better outcomes",
            "Track health scores as an early indicator of progress",
            "Consistent counseling sessions support risk reduction over time",
        ]),
        'prediction_timestamp': datetime.utcnow().isoformat(),
    }

    return insight, features


def _summarize_key_findings(params, pvals, context):
    """Generate key insight from actual significant features."""
    sig = pvals[pvals < 0.05].index.tolist()
    if not sig:
        top = params.abs().nlargest(3).index.tolist()
        names = ', '.join(friendly(f) for f in top)
        return (f"No features reached statistical significance (p < 0.05) with this "
                f"sample size. The strongest associations were with {names}. "
                f"A larger sample may reveal clearer patterns.")

    increasing = [friendly(f) for f in sig if params[f] > 0]
    decreasing = [friendly(f) for f in sig if params[f] < 0]

    parts = []
    if context == 'risk':
        if increasing:
            parts.append(f"{', '.join(increasing)} {'are' if len(increasing) > 1 else 'is'} "
                        f"significantly associated with higher risk")
        if decreasing:
            parts.append(f"{', '.join(decreasing)} {'are' if len(decreasing) > 1 else 'is'} "
                        f"significantly associated with lower risk (protective)")
    elif context == 'improvement':
        if increasing:
            parts.append(f"{', '.join(increasing)} {'are' if len(increasing) > 1 else 'is'} "
                        f"significantly associated with greater risk improvement")
        if decreasing:
            parts.append(f"{', '.join(decreasing)} {'are' if len(decreasing) > 1 else 'is'} "
                        f"significantly associated with less improvement")
    elif context == 'donation':
        if increasing:
            parts.append(f"{', '.join(increasing)} {'are' if len(increasing) > 1 else 'is'} "
                        f"significantly associated with higher donation value")
        if decreasing:
            parts.append(f"{', '.join(decreasing)} {'are' if len(decreasing) > 1 else 'is'} "
                        f"significantly associated with lower donation value")
    elif context == 'health':
        if increasing:
            parts.append(f"{', '.join(increasing)} {'are' if len(increasing) > 1 else 'is'} "
                        f"significantly associated with better health outcomes")
        if decreasing:
            parts.append(f"{', '.join(decreasing)} {'are' if len(decreasing) > 1 else 'is'} "
                        f"significantly associated with lower health outcomes")
    else:
        if increasing:
            parts.append(f"{', '.join(increasing)} significantly increase the outcome")
        if decreasing:
            parts.append(f"{', '.join(decreasing)} significantly decrease the outcome")

    return '. '.join(parts) + '.'


# ── Pipeline 2: Education → Reintegration ────────────────────────────────

def run_pipeline_2():
    print("  Loading data...")
    residents = pd.read_sql("SELECT * FROM residents", engine)
    education = pd.read_sql("SELECT * FROM education_records", engine)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", engine)
    sessions = pd.read_sql("SELECT * FROM process_recordings", engine)

    def calc_slope(group, col):
        vals = group[col].dropna().values
        if len(vals) < 2:
            return 0.0
        x = np.arange(len(vals))
        return np.polyfit(x, vals, 1)[0]

    edu_sorted = education.sort_values(['resident_id', 'record_date'])
    edu_traj = edu_sorted.groupby('resident_id').apply(
        lambda g: pd.Series({
            'attendance_slope': calc_slope(g, 'attendance_rate'),
            'progress_slope': calc_slope(g, 'progress_percent'),
            'avg_attendance': g['attendance_rate'].mean(),
            'avg_progress': g['progress_percent'].mean(),
            'max_progress': g['progress_percent'].max(),
            'edu_months': len(g),
        })
    ).reset_index()

    health_avg = health.groupby('resident_id').agg(
        avg_health=('general_health_score', 'mean'),
    ).reset_index()

    sess_count = sessions.groupby('resident_id')['recording_id'].count().reset_index()
    sess_count.columns = ['resident_id', 'total_sessions']

    r2 = residents.copy()
    r2['stay_months'] = r2['length_of_stay'].apply(parse_duration_months)
    r2_bool = [c for c in r2.columns if c.startswith('sub_cat_')]
    for col in r2_bool:
        r2[col] = to_bool_int(r2[col])
    r2['abuse_types_count'] = r2[r2_bool].sum(axis=1)

    df2 = r2[['resident_id', 'reintegration_status', 'stay_months',
               'abuse_types_count']].copy()
    df2 = df2.merge(edu_traj, on='resident_id', how='left')
    df2 = df2.merge(health_avg, on='resident_id', how='left')
    df2 = df2.merge(sess_count, on='resident_id', how='left')
    df2['total_sessions'] = df2['total_sessions'].fillna(0)

    df2['reint_completed'] = (df2['reintegration_status'] == 'Completed').astype(int)
    df2 = df2.dropna(subset=['avg_attendance', 'avg_health', 'stay_months'])

    feature_cols = ['attendance_slope', 'progress_slope', 'avg_attendance', 'avg_progress',
                    'max_progress', 'edu_months', 'avg_health',
                    'total_sessions', 'stay_months', 'abuse_types_count']
    X = df2[feature_cols].copy()
    y = df2['reint_completed'].copy()

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns, index=X.index)

    print("  Fitting Logistic Regression...")
    X_sm = sm.add_constant(X_scaled)
    try:
        model = sm.Logit(y, X_sm).fit(disp=0, maxiter=100)
    except Exception:
        # Fallback to regularized if perfect separation
        model = sm.Logit(y, X_sm).fit_regularized(disp=0)

    params = model.params.drop('const', errors='ignore')
    pvals = model.pvalues.drop('const', errors='ignore')

    sorted_features = params.abs().sort_values(ascending=False).index.tolist()
    top_features = sorted_features[:7]

    features = []
    for rank, feat in enumerate(top_features):
        coef = float(params[feat])
        pv = float(pvals[feat])
        features.append({
            'pipeline_id': 2,
            'feature_name': friendly(feat),
            'coefficient': round(coef, 4),
            'p_value': round(pv, 4),
            'direction': 'Increases odds' if coef > 0 else 'Decreases odds',
            'interpretation': interpret_coef(feat, coef, 'completion'),
            'is_significant': pv < 0.05,
            'feature_rank': rank + 1,
        })

    insight = {
        'pipeline_id': 2,
        'pipeline_name': 'Education Momentum \u2192 Reintegration',
        'target_variable': 'Reintegration Completed (binary)',
        'model_type': 'Logistic Regression (statsmodels)',
        'r_squared': round(float(model.prsquared), 4),
        'adj_r_squared': round(float(model.prsquared), 4),
        'sample_size': int(len(y)),
        'key_insight': _summarize_key_findings(params, pvals, 'completion'),
        'recommendations_json': json.dumps([
            "Track school attendance month-to-month; a sustained drop should trigger support",
            "Set progress checkpoints to prompt plan reviews",
            "Focus on consistent attendance, not just a high average",
        ]),
        'prediction_timestamp': datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Pipeline 3: Social Media → Donations ─────────────────────────────────

def run_pipeline_3():
    print("  Loading data...")
    social_media = pd.read_sql("SELECT * FROM social_media_posts", engine)

    sm_df = social_media.copy()
    for col in ['has_call_to_action', 'is_boosted', 'features_resident_story']:
        sm_df[col] = to_bool_int(sm_df[col])

    sm_df['boost_budget_php'] = pd.to_numeric(sm_df['boost_budget_php'], errors='coerce').fillna(0)
    sm_df['estimated_donation_value_php'] = pd.to_numeric(
        sm_df['estimated_donation_value_php'], errors='coerce').fillna(0)
    sm_df['caption_length'] = pd.to_numeric(sm_df['caption_length'], errors='coerce').fillna(0)
    sm_df['num_hashtags'] = pd.to_numeric(sm_df['num_hashtags'], errors='coerce').fillna(0)
    sm_df['post_hour'] = pd.to_numeric(sm_df['post_hour'], errors='coerce').fillna(12)

    sm_df['log_donation_value'] = np.log1p(sm_df['estimated_donation_value_php'])

    # Use only actionable content features — no engagement metrics (those are outcomes)
    feature_cols = ['has_call_to_action', 'features_resident_story', 'is_boosted',
                    'boost_budget_php', 'caption_length', 'num_hashtags', 'post_hour']
    X = sm_df[feature_cols].copy().fillna(0)
    y = sm_df['log_donation_value'].copy()

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns, index=X.index)

    print("  Fitting OLS model...")
    X_ols = sm.add_constant(X_scaled)
    model = sm.OLS(y, X_ols).fit()

    params = model.params.drop('const', errors='ignore')
    pvals = model.pvalues.drop('const', errors='ignore')

    sorted_features = params.abs().sort_values(ascending=False).index.tolist()
    top_features = sorted_features[:7]

    features = []
    for rank, feat in enumerate(top_features):
        coef = float(params[feat])
        pv = float(pvals[feat])
        features.append({
            'pipeline_id': 3,
            'feature_name': friendly(feat),
            'coefficient': round(coef, 4),
            'p_value': round(pv, 4),
            'direction': 'Increases' if coef > 0 else 'Decreases',
            'interpretation': interpret_coef(feat, coef, 'donation'),
            'is_significant': pv < 0.05,
            'feature_rank': rank + 1,
        })

    insight = {
        'pipeline_id': 3,
        'pipeline_name': 'Social Media Content \u2192 Donation Impact',
        'target_variable': 'Estimated Donation Value (\u20b1, log-transformed)',
        'model_type': 'OLS Regression on log(1 + donation_value)',
        'r_squared': round(float(model.rsquared), 4),
        'adj_r_squared': round(float(model.rsquared_adj), 4),
        'sample_size': int(len(y)),
        'key_insight': _summarize_key_findings(params, pvals, 'donation'),
        'recommendations_json': json.dumps([
            "Include a clear call-to-action in every fundraising post",
            "Share resident stories regularly — they drive engagement",
            "Use boost budget on posts that match highest-performing formats",
        ]),
        'prediction_timestamp': datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Pipeline 4: Funding → Outcomes ───────────────────────────────────────

def run_pipeline_4():
    print("  Loading data...")
    allocations = pd.read_sql("SELECT * FROM donation_allocations", engine)
    safehouse_metrics = pd.read_sql("SELECT * FROM safehouse_monthly_metrics", engine)
    safehouses = pd.read_sql("SELECT * FROM safehouses", engine)

    alloc = allocations.copy()
    alloc['allocation_date'] = pd.to_datetime(alloc['allocation_date'], utc=True)
    alloc['month_start'] = alloc['allocation_date'].dt.to_period('M').dt.to_timestamp().dt.tz_localize('UTC')

    alloc_pivot = alloc.pivot_table(
        index=['safehouse_id', 'month_start'],
        columns='program_area',
        values='amount_allocated',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    alloc_pivot.columns.name = None
    alloc_pivot.columns = [str(c) for c in alloc_pivot.columns]

    area_cols = [c for c in alloc_pivot.columns if c not in ['safehouse_id', 'month_start']]
    alloc_pivot['total_allocation'] = alloc_pivot[area_cols].sum(axis=1)

    metrics = safehouse_metrics.copy()
    metrics['month_start'] = pd.to_datetime(metrics['month_start'], utc=True)

    df4 = metrics.merge(alloc_pivot, on=['safehouse_id', 'month_start'], how='left')
    df4[area_cols + ['total_allocation']] = df4[area_cols + ['total_allocation']].fillna(0)
    df4 = df4.dropna(subset=['avg_health_score'])

    sh_info = safehouses[['safehouse_id', 'capacity_girls']].copy()
    df4 = df4.merge(sh_info, on='safehouse_id', how='left')

    # Use safehouse fixed effects to control for between-safehouse differences
    df4 = pd.get_dummies(df4, columns=['safehouse_id'], drop_first=True, dtype=int, prefix='sh')

    exclude = ['metric_id', 'month_start', 'month_end', 'avg_health_score',
               'avg_education_progress', 'notes', 'total_allocation']
    feature_cols = [c for c in df4.columns if c not in exclude
                    and df4[c].dtype in ['int64', 'float64', 'int32', 'uint8', 'int8']]
    X = df4[feature_cols].copy().apply(pd.to_numeric, errors='coerce').fillna(0)
    y = df4['avg_health_score'].copy()

    scaler = StandardScaler()
    non_dummy_cols = [c for c in X.columns if not c.startswith('sh_')]
    X_sc = X.copy()
    if non_dummy_cols:
        X_sc[non_dummy_cols] = scaler.fit_transform(X[non_dummy_cols])

    print("  Fitting OLS with safehouse fixed effects...")
    X_ols = sm.add_constant(X_sc)
    model = sm.OLS(y, X_ols).fit()

    # Only show non-safehouse-dummy features
    params = model.params.drop('const', errors='ignore')
    pvals = model.pvalues.drop('const', errors='ignore')

    non_sh = [f for f in params.index if not f.startswith('sh_')]
    sorted_non_sh = sorted(non_sh, key=lambda f: abs(params[f]), reverse=True)
    top_features = sorted_non_sh[:6]

    features = []
    for rank, feat in enumerate(top_features):
        coef = float(params[feat])
        pv = float(pvals[feat])
        features.append({
            'pipeline_id': 4,
            'feature_name': friendly(feat),
            'coefficient': round(coef, 4),
            'p_value': round(pv, 4),
            'direction': 'Increases' if coef > 0 else 'Decreases',
            'interpretation': interpret_coef(feat, coef, 'health'),
            'is_significant': pv < 0.05,
            'feature_rank': rank + 1,
        })

    # Build key insight from non-dummy significant features
    non_sh_params = params[non_sh]
    non_sh_pvals = pvals[non_sh]

    insight = {
        'pipeline_id': 4,
        'pipeline_name': 'Funding Allocation \u2192 Safehouse Outcomes',
        'target_variable': 'Avg Health Score (with safehouse fixed effects)',
        'model_type': 'OLS Regression with Fixed Effects',
        'r_squared': round(float(model.rsquared), 4),
        'adj_r_squared': round(float(model.rsquared_adj), 4),
        'sample_size': int(len(y)),
        'key_insight': _summarize_key_findings(non_sh_params, non_sh_pvals, 'health'),
        'recommendations_json': json.dumps([
            "Protect wellbeing and education funding when budgets are tight",
            "Try small, planned budget shifts for 1\u20132 months and watch outcomes",
            "Expect delays: improvements may show up the next month",
        ]),
        'prediction_timestamp': datetime.utcnow().isoformat(),
    }

    return insight, features


# ── Write to database ────────────────────────────────────────────────────

def run():
    all_insights = []
    all_features = []

    pipelines = [
        ("Pipeline 1 — Risk Factors", run_pipeline_1),
        ("Pipeline 2 — Education \u2192 Reintegration", run_pipeline_2),
        ("Pipeline 3 — Social Media \u2192 Donations", run_pipeline_3),
        ("Pipeline 4 — Funding \u2192 Outcomes", run_pipeline_4),
    ]

    for name, fn in pipelines:
        print(f"\n{'='*50}")
        print(f"  {name}")
        print(f"{'='*50}")
        try:
            insight, features = fn()
            all_insights.append(insight)
            all_features.extend(features)
            print(f"  Done: R\u00b2={insight['r_squared']}, Adj R\u00b2={insight['adj_r_squared']}, "
                  f"n={insight['sample_size']}, {len(features)} features")
        except Exception as e:
            print(f"  FAILED: {name} \u2014 {e}")
            traceback.print_exc()

    if not all_insights:
        print("\nNo pipelines succeeded. Skipping database write.")
        return

    # Write insights table
    insights_df = pd.DataFrame(all_insights)
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS explanatory_features"))
        conn.execute(text("DROP TABLE IF EXISTS explanatory_insights"))

    insights_df.to_sql("explanatory_insights", engine, index=False, if_exists="replace")
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE explanatory_insights ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    # Write features table
    features_df = pd.DataFrame(all_features)
    features_df.to_sql("explanatory_features", engine, index=False, if_exists="replace")
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE explanatory_features ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"\nWrote {len(all_insights)} insights and {len(all_features)} features to database.")


if __name__ == "__main__":
    run()
