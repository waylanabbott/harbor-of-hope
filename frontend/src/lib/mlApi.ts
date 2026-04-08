import { apiFetch } from './api';

// ---- Prediction types (pre-computed from PostgreSQL) ----

export interface ChurnPredictionRow {
  id: number;
  supporterId: number;
  supporterName: string;
  supporterType: string | null;
  email: string | null;
  churnProbability: number;
  churnPrediction: number;
  churnRiskLevel: string;
  predictionTimestamp: string;
}

export interface IncidentRiskPredictionRow {
  id: number;
  residentId: number;
  residentCode: string;
  safehouseName: string | null;
  caseStatus: string | null;
  riskProbability: number;
  riskPrediction: number;
  riskLevel: string;
  predictionTimestamp: string;
}

export interface CampaignPredictionRow {
  id: number;
  postId: number;
  platform: string;
  campaignName: string | null;
  postType: string;
  estimatedDonationValuePhp: number;
  predictedDonationValuePhp: number;
  predictionErrorPhp: number;
  hasCallToAction: boolean;
  featuresResidentStory: boolean;
  isBoosted: boolean;
  boostBudgetPhp: number;
  mediaType: string | null;
  contentTopic: string | null;
  predictionTimestamp: string;
}

// ---- Fetch functions ----

export function fetchChurnPredictions(): Promise<ChurnPredictionRow[]> {
  return apiFetch<ChurnPredictionRow[]>('/predictions/churn');
}

export function fetchIncidentRiskPredictions(): Promise<IncidentRiskPredictionRow[]> {
  return apiFetch<IncidentRiskPredictionRow[]>('/predictions/incident-risk');
}

export function fetchCampaignPredictions(): Promise<CampaignPredictionRow[]> {
  return apiFetch<CampaignPredictionRow[]>('/predictions/campaign');
}
