export const NEIGHBOURHOODS = [
  'Hackney',
  'Dalston',
  'Stoke Newington',
  'Shoreditch',
  'Bethnal Green',
  'Homerton',
  'Clapton',
  'De Beauvoir',
] as const;

export type Neighbourhood = typeof NEIGHBOURHOODS[number];
