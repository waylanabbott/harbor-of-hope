export interface DonorDonation {
  donationId: number;
  amount: number;
  donationType: string | null;
  donationDate: string | null;
  campaignName: string | null;
  isRecurring: boolean;
}

export interface AllocationSummary {
  safehouseName: string | null;
  programArea: string | null;
  totalAllocated: number;
}

export interface DonorImpact {
  totalDonated: number;
  donationCount: number;
  firstDonationDate: string | null;
  latestDonationDate: string | null;
  allocations: AllocationSummary[];
}
