import { apiFetch } from './api';
import type { PagedResult } from '../types/Pagination';
import type {
  HomeVisitationItem,
  HomeVisitationFormData,
  HomeVisitationQueryParams,
} from '../types/HomeVisitation';

export function fetchHomeVisitations(
  params: HomeVisitationQueryParams
): Promise<PagedResult<HomeVisitationItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));

  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.residentId != null)
    searchParams.set('residentId', String(params.residentId));
  if (params.visitType) searchParams.set('visitType', params.visitType);

  return apiFetch<PagedResult<HomeVisitationItem>>(
    `/homevisitations?${searchParams.toString()}`
  );
}

export function fetchHomeVisitation(
  id: number
): Promise<HomeVisitationItem> {
  return apiFetch<HomeVisitationItem>(`/homevisitations/${id}`);
}

export function createHomeVisitation(
  data: HomeVisitationFormData
): Promise<HomeVisitationItem> {
  return apiFetch<HomeVisitationItem>('/homevisitations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateHomeVisitation(
  id: number,
  data: HomeVisitationFormData
): Promise<void> {
  return apiFetch<void>(`/homevisitations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteHomeVisitation(id: number): Promise<void> {
  return apiFetch<void>(`/homevisitations/${id}`, {
    method: 'DELETE',
  });
}
