export interface ProcessRecordingItem {
  recordingId: number;
  residentId: number;
  residentCode: string | null;
  sessionDate: string | null;
  socialWorker: string | null;
  sessionType: string | null;
  sessionDurationMinutes: number | null;
  emotionalStateObserved: string | null;
  emotionalStateEnd: string | null;
  sessionNarrative: string | null;
  interventionsApplied: string | null;
  followUpActions: string | null;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
}

export type ProcessRecordingFormData = Omit<
  ProcessRecordingItem,
  'recordingId' | 'residentCode'
>;

export interface ProcessRecordingQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  residentId?: number;
  sessionType?: string;
}
