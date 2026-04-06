import { apiFetch } from './api';
import type { PublicStats, ImpactSnapshot } from '../types/PublicImpact';

export const fetchPublicStats = () => apiFetch<PublicStats>('/public/stats');
export const fetchImpactSnapshots = () =>
  apiFetch<ImpactSnapshot[]>('/public/impact');
