import { apiFetch } from './api';
import type { PagedResult } from '../types/Pagination';
import type {
  ResidentListItem,
  ResidentDetail,
  ResidentFormData,
  ResidentQueryParams,
} from '../types/Resident';

export function fetchResidents(
  params: ResidentQueryParams
): Promise<PagedResult<ResidentListItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));

  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.search) searchParams.set('search', params.search);
  if (params.safehouseId != null)
    searchParams.set('safehouseId', String(params.safehouseId));
  if (params.status) searchParams.set('status', params.status);
  if (params.riskLevel) searchParams.set('riskLevel', params.riskLevel);
  if (params.category) searchParams.set('category', params.category);

  return apiFetch<PagedResult<ResidentListItem>>(
    `/residents?${searchParams.toString()}`
  );
}

export function fetchResident(id: number): Promise<ResidentDetail> {
  return apiFetch<ResidentDetail>(`/residents/${id}`);
}

export function createResident(
  data: ResidentFormData
): Promise<ResidentDetail> {
  return apiFetch<ResidentDetail>('/residents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateResident(
  id: number,
  data: ResidentFormData
): Promise<void> {
  return apiFetch<void>(`/residents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteResident(id: number): Promise<void> {
  return apiFetch<void>(`/residents/${id}`, {
    method: 'DELETE',
  });
}
