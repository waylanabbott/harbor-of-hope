export interface PublicStats {
  totalResidentsServed: number;
  totalDonationsReceived: number;
  successfulReintegrations: number;
  reintegrationRate: number;
}

export interface ImpactSnapshot {
  snapshotDate: string | null;
  headline: string | null;
  summaryText: string | null;
  month: string | null;
  avgHealthScore: number | null;
  educationProgress: number | null;
  totalResidents: number | null;
  donationsTotal: number | null;
}
