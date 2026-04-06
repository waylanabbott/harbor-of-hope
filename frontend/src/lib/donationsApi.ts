import { apiFetch } from './api';
import type { PagedResult } from '../types/Pagination';
import type {
  DonationItem,
  DonationFormData,
  DonationQueryParams,
} from '../types/Donation';

export function fetchDonations(
  params: DonationQueryParams
): Promise<PagedResult<DonationItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));

  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.search) searchParams.set('search', params.search);
  if (params.supporterId != null)
    searchParams.set('supporterId', String(params.supporterId));
  if (params.donationType)
    searchParams.set('donationType', params.donationType);

  return apiFetch<PagedResult<DonationItem>>(
    `/donations?${searchParams.toString()}`
  );
}

export function fetchDonation(id: number): Promise<DonationItem> {
  return apiFetch<DonationItem>(`/donations/${id}`);
}

export function createDonation(
  data: DonationFormData
): Promise<DonationItem> {
  return apiFetch<DonationItem>('/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDonation(
  id: number,
  data: DonationFormData
): Promise<void> {
  return apiFetch<void>(`/donations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDonation(id: number): Promise<void> {
  return apiFetch<void>(`/donations/${id}`, {
    method: 'DELETE',
  });
}
