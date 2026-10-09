export type Office = 'PRESIDENT' | 'GOVERNOR' | 'SENATOR' | 'REPRESENTATIVE';

export type GeoZone =
  | 'North Central'
  | 'North East'
  | 'North West'
  | 'South East'
  | 'South South'
  | 'South West';

export interface PoliticalParty {
  id: string;
  code: string;
  acronym: string;
  name: string;
  color: string;
  secondaryColor?: string;
  motto: string;
  foundedYear: number;
  nationalChairman?: string;
  headquarters?: string;
}

export interface SenatorialDistrict {
  id: string;
  name: string;
  code: string;
  stateCode: string;
  lgas: string[];
}

export interface FederalConstituency {
  id: string;
  name: string;
  code: string;
  stateCode: string;
  senatorialDistrictId: string;
  lgas: string[];
}

export interface StateInfo {
  code: string;
  name: string;
  capital: string;
  geoZone: GeoZone;
  senatorialDistricts: SenatorialDistrict[];
  federalConstituencies: FederalConstituency[];
  landmarkName: string;
  landmarkSvgType: 'lekki_bridge' | 'zuma_rock' | 'olumo_rock' | 'aso_rock' | 'cocoa_house' | 'national_theatre' | 'confluence' | 'generic_monument';
  registeredVotersDemo: string;
  collegesOrLgasCount: number;
}

export type CandidateStatus = 'VERIFIED_DEMO' | 'ILLUSTRATIVE_DEMO' | 'COMMUNITY_PROPOSED';

export interface Candidate {
  id: string;
  name: string;
  office: Office;
  partyId: string;
  partyAcronym: string;
  partyColor: string;
  stateCode?: string;
  senatorialDistrictId?: string;
  federalConstituencyId?: string;
  avatarUrl?: string;
  gender: 'M' | 'F';
  age: number;
  bio: string;
  keyPledges: string[];
  education: string;
  runningMate?: string;
  status: CandidateStatus;
}

export type CardStylePreset = 'emerald_classic' | 'obsidian_minimal' | 'civic_heritage';

export type CardAspectRatio =
  | 'twitter_landscape' // 1200x675 (16:9 approx)
  | 'instagram_square'   // 1080x1080 (1:1)
  | 'instagram_portrait' // 1080x1350 (4:5)
  | 'whatsapp_portrait'; // 1080x1350 (4:5 / 9:16 mobile)

export interface LineupSelection {
  id: string;
  userId?: string;
  userName?: string;
  userHandle?: string;
  title: string;
  stateCode: string;
  senatorialDistrictId: string;
  federalConstituencyId: string;
  presidentId?: string;
  governorId?: string;
  senatorId?: string;
  representativeId?: string;
  stylePreset: CardStylePreset;
  aspectRatio: CardAspectRatio;
  createdAt: string;
  updatedAt: string;
}

export type CaptionLanguage = 'english' | 'pidgin' | 'yoruba' | 'hausa' | 'igbo';

export type CaptionTone = 'direct' | 'community' | 'civic' | 'conversational';

export interface GeneratedCaption {
  language: CaptionLanguage;
  tone: CaptionTone;
  text: string;
  hashtags: string[];
}

export interface UserProfile {
  name: string;
  handle: string;
  stateCode: string;
  bio: string;
  avatarUrl: string;
  lineupCount: number;
  joinedDate: string;
}
