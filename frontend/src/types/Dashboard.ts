export interface DashboardStats {
  totalResidents: number;
  activeCases: number;
  totalDonations: number;
  reintegrationRate: number;
  recentDonations: RecentDonation[];
  residentsNeedingAttention: AttentionResident[];
}

export interface RecentDonation {
  donationId: number;
  supporterName: string | null;
  amount: number;
  donationType: string | null;
  donationDate: string | null;
}

export interface AttentionResident {
  residentId: number;
  caseControlNo: string | null;
  safehouseName: string | null;
  currentRiskLevel: string | null;
  caseStatus: string | null;
}
