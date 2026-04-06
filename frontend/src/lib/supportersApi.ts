import { apiFetch } from './api';
import type { PagedResult } from '../types/Pagination';
import type {
  SupporterItem,
  SupporterFormData,
  SupporterQueryParams,
} from '../types/Supporter';

export function fetchSupporters(
  params: SupporterQueryParams
): Promise<PagedResult<SupporterItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));

  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.supporterType)
    searchParams.set('supporterType', params.supporterType);

  return apiFetch<PagedResult<SupporterItem>>(
    `/supporters?${searchParams.toString()}`
  );
}

export function fetchSupporter(id: number): Promise<SupporterItem> {
  return apiFetch<SupporterItem>(`/supporters/${id}`);
}

export function createSupporter(
  data: SupporterFormData
): Promise<SupporterItem> {
  return apiFetch<SupporterItem>('/supporters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSupporter(
  id: number,
  data: SupporterFormData
): Promise<void> {
  return apiFetch<void>(`/supporters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSupporter(id: number): Promise<void> {
  return apiFetch<void>(`/supporters/${id}`, {
    method: 'DELETE',
  });
}
