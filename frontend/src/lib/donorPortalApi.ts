import { apiFetch } from './api';
import type { DonorDonation, DonorImpact } from '../types/DonorPortal';

export const fetchMyDonations = () =>
  apiFetch<DonorDonation[]>('/donor/donations');
export const fetchMyImpact = () => apiFetch<DonorImpact>('/donor/impact');

export const createDonation = (data: {
  amount: number;
  donationType: string;
  campaignName: string;
  isRecurring: boolean;
}) =>
  apiFetch<DonorDonation>('/donor/donate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
