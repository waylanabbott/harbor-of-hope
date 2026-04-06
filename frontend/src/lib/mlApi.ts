import { apiFetch } from './api';

// ---- Prediction types (pre-computed from PostgreSQL) ----

export interface ChurnPredictionRow {
  id: number;
  supporterId: number;
  churnProbability: number;
  churnPrediction: number;
  churnRiskLevel: string;
  predictionTimestamp: string;
}

export interface SocialMediaPredictionRow {
  id: number;
  postId: number;
  predictedEngagementRate: number;
  actualEngagementRate: number;
  residual: number;
  recommendation: string;
  predictionTimestamp: string;
}

export interface CounselingPredictionRow {
  id: number;
  recordingId: number;
  residentId: number;
  predictedImprovement: number;
  actualImprovement: number;
  sessionType: string;
  effectivenessLabel: string;
  predictionTimestamp: string;
}

// ---- Fetch functions ----

export function fetchChurnPredictions(): Promise<ChurnPredictionRow[]> {
  return apiFetch<ChurnPredictionRow[]>('/predictions/churn');
}

export function fetchSocialMediaPredictions(): Promise<SocialMediaPredictionRow[]> {
  return apiFetch<SocialMediaPredictionRow[]>('/predictions/social-media');
}

export function fetchCounselingPredictions(): Promise<CounselingPredictionRow[]> {
  return apiFetch<CounselingPredictionRow[]>('/predictions/counseling');
}
