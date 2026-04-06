export interface DonationTrend {
  month: string; // "2024-01"
  totalAmount: number;
  donationCount: number;
}

export interface ResidentOutcome {
  status: string; // "Completed", "In Progress", etc.
  count: number;
}

export interface SafehouseComparison {
  safehouseId: number;
  name: string;
  residentCount: number;
  avgHealthScore: number;
  avgEducationProgress: number;
  totalIncidents: number;
}

export interface ChurnPrediction {
  supporterId: number;
  riskLevel: string; // "Low", "Medium", "High", "Unknown"
  churnProbability: number;
}

// ML prediction response (matches MlPredictionResponse from backend proxy)
export interface MlPredictionResponse {
  model: string;
  prediction: number[];
  probabilities?: number[][];
  riskLevel?: string;
}
