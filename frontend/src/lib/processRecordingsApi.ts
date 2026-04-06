import { apiFetch } from './api';
import type { PagedResult } from '../types/Pagination';
import type {
  ProcessRecordingItem,
  ProcessRecordingFormData,
  ProcessRecordingQueryParams,
} from '../types/ProcessRecording';

export function fetchProcessRecordings(
  params: ProcessRecordingQueryParams
): Promise<PagedResult<ProcessRecordingItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));

  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.residentId != null)
    searchParams.set('residentId', String(params.residentId));
  if (params.sessionType)
    searchParams.set('sessionType', params.sessionType);

  return apiFetch<PagedResult<ProcessRecordingItem>>(
    `/processrecordings?${searchParams.toString()}`
  );
}

export function fetchProcessRecording(
  id: number
): Promise<ProcessRecordingItem> {
  return apiFetch<ProcessRecordingItem>(`/processrecordings/${id}`);
}

export function createProcessRecording(
  data: ProcessRecordingFormData
): Promise<ProcessRecordingItem> {
  return apiFetch<ProcessRecordingItem>('/processrecordings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProcessRecording(
  id: number,
  data: ProcessRecordingFormData
): Promise<void> {
  return apiFetch<void>(`/processrecordings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProcessRecording(id: number): Promise<void> {
  return apiFetch<void>(`/processrecordings/${id}`, {
    method: 'DELETE',
  });
}
