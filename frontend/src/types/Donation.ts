export interface DonationItem {
  donationId: number;
  supporterId: number;
  supporterDisplayName: string | null;
  donationType: string | null;
  donationDate: string | null;
  isRecurring: boolean;
  campaignName: string | null;
  channelSource: string | null;
  currencyCode: string | null;
  amount: number;
  estimatedValue: number | null;
  impactUnit: string | null;
  notes: string | null;
  referralPostId: number | null;
}

export type DonationFormData = Omit<
  DonationItem,
  'donationId' | 'supporterDisplayName'
>;

export interface DonationQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  supporterId?: number;
  donationType?: string;
}
