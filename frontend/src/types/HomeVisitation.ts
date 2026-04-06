export interface HomeVisitationItem {
  visitationId: number;
  residentId: number;
  residentCode: string | null;
  visitDate: string | null;
  socialWorker: string | null;
  visitType: string | null;
  locationVisited: string | null;
  familyMembersPresent: string | null;
  purpose: string | null;
  observations: string | null;
  familyCooperationLevel: string | null;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes: string | null;
  visitOutcome: string | null;
}

export type HomeVisitationFormData = Omit<
  HomeVisitationItem,
  'visitationId' | 'residentCode'
>;

export interface HomeVisitationQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  residentId?: number;
  visitType?: string;
}
