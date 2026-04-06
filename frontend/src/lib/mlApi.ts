import { apiFetch } from './api';
import type { MlPredictionResponse } from '../types/Reports';

export function fetchMlPrediction(
  modelName: string,
  features: Record<string, unknown>
): Promise<MlPredictionResponse> {
  return apiFetch<MlPredictionResponse>(`/mlprediction/predict/${modelName}`, {
    method: 'POST',
    body: JSON.stringify({ features }),
  });
}

export function fetchMlHealth(): Promise<{
  status: string;
  modelsLoaded: string[];
  modelsMissing: string[];
}> {
  return apiFetch('/mlprediction/health');
}
