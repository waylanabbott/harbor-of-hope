/**
 * Categorical values aligned with seeded `lighthouse_csv_v7` CSVs.
 * Use for admin form dropdowns to keep entries consistent with existing data.
 */

export const CASE_STATUSES = ['Active', 'Closed', 'Transferred'] as const;

/** Stored values match CSV (`F` / `M`); labels are human-readable. */
export const SEX_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'F', label: 'Female' },
  { value: 'M', label: 'Male' },
];

export const BIRTH_STATUSES = ['Marital', 'Non-Marital'] as const;

export const RELIGIONS = [
  'Buddhism',
  'Evangelical',
  'Islam',
  "Jehovah's Witness",
  'Other',
  'Roman Catholic',
  'Seventh-day Adventist',
  'Unspecified',
] as const;

export const CASE_CATEGORIES = [
  'Abandoned',
  'Foundling',
  'Neglected',
  'Surrendered',
] as const;

export const REFERRAL_SOURCES = [
  'Community',
  'Court Order',
  'Government Agency',
  'NGO',
  'Police',
  'Self-Referral',
] as const;

export const PWD_TYPES = ['Hearing', 'Intellectual', 'Other'] as const;

export const REINTEGRATION_TYPES = [
  'Adoption (Domestic)',
  'Adoption (Inter-Country)',
  'Family Reunification',
  'Foster Care',
  'Independent Living',
  'None',
] as const;

export const REINTEGRATION_STATUSES = [
  'Completed',
  'In Progress',
  'Not Started',
  'On Hold',
] as const;

export const SUPPORTER_REGIONS = ['Luzon', 'Mindanao', 'Visayas'] as const;

export const SUPPORTER_COUNTRIES = [
  'Canada',
  'Philippines',
  'Singapore',
  'USA',
] as const;

export const SUPPORTER_RELATIONSHIP_TYPES = [
  'International',
  'Local',
  'PartnerOrganization',
] as const;

export const ACQUISITION_CHANNELS = [
  'Church',
  'Event',
  'PartnerReferral',
  'SocialMedia',
  'Website',
  'WordOfMouth',
] as const;

/** Matches `home_visitations.csv` */
export const HOME_VISIT_TYPES = [
  'Emergency',
  'Initial Assessment',
  'Post-Placement Monitoring',
  'Reintegration Assessment',
  'Routine Follow-Up',
] as const;

export const FAMILY_COOPERATION_LEVELS = [
  'Cooperative',
  'Highly Cooperative',
  'Neutral',
  'Uncooperative',
  /** Earlier UI used coarse High/Medium/Low; kept so existing rows stay selectable */
  'High',
  'Medium',
  'Low',
] as const;

export const VISIT_OUTCOMES = [
  'Favorable',
  'Inconclusive',
  'Needs Improvement',
  'Unfavorable',
] as const;

/** Seeded data uses Individual + Group; Family/Crisis kept for UI consistency with common practice. */
export const SESSION_TYPES = ['Individual', 'Group', 'Family', 'Crisis'] as const;

export const EMOTIONAL_STATES_START = [
  'Angry',
  'Anxious',
  'Calm',
  'Distressed',
  'Happy',
  'Hopeful',
  'Sad',
  'Withdrawn',
] as const;

export const EMOTIONAL_STATES_END = [
  'Anxious',
  'Calm',
  'Happy',
  'Hopeful',
  'Sad',
  'Withdrawn',
] as const;
