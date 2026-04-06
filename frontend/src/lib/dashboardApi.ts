import { apiFetch } from './api';
import type { DashboardStats } from '../types/Dashboard';

export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/dashboard');
}
