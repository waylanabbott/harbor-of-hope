import { apiFetch } from './api';
import type {
  DonationTrend,
  ResidentOutcome,
  SafehouseComparison,
  ChurnPrediction,
} from '../types/Reports';

export function fetchDonationTrends(): Promise<DonationTrend[]> {
  return apiFetch<DonationTrend[]>('/reports/donation-trends');
}

export function fetchResidentOutcomes(): Promise<ResidentOutcome[]> {
  return apiFetch<ResidentOutcome[]>('/reports/resident-outcomes');
}

export function fetchSafehouseComparison(): Promise<SafehouseComparison[]> {
  return apiFetch<SafehouseComparison[]>('/reports/safehouse-comparison');
}

export function fetchBatchChurnPredictions(
  supporterIds: number[]
): Promise<ChurnPrediction[]> {
  return apiFetch<ChurnPrediction[]>('/reports/batch-churn', {
    method: 'POST',
    body: JSON.stringify({ supporterIds }),
  });
}
