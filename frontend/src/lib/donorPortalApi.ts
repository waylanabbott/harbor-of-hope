import { apiFetch } from './api';
import type { DonorDonation, DonorImpact } from '../types/DonorPortal';

export const fetchMyDonations = () =>
  apiFetch<DonorDonation[]>('/donor/donations');
export const fetchMyImpact = () => apiFetch<DonorImpact>('/donor/impact');
