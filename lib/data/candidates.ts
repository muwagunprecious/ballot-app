import { Candidate, Office } from '@/types/ballot';
import { POLITICAL_PARTIES, getPartyByAcronym } from './parties';
import RAW_CANDIDATES from './candidates.json';

export const INITIAL_CANDIDATES: Candidate[] = RAW_CANDIDATES as Candidate[];

const CANDIDATES_BY_ID = new Map<string, Candidate>(
  INITIAL_CANDIDATES.map((c) => [c.id, c])
);

// Fallback names if ever needed for supplementary party slots
const PARTY_CANDIDATE_NAMES: Record<string, string> = {
  A: 'Chief Emeka Okafor',
  AA: 'Hon. Aliyu Bello',
  AAC: 'Comrade Ayomide Adeleke',
  ADC: 'Dr. Chinedu Nwosu',
  ADP: 'Hajiya Fatima Garba',
  APC: 'Sen. Babatunde Gbadamosi',
  APGA: 'Dr. Chukwudi Okoli',
  APM: 'Alhaji Ibrahim Shehu',
  APP: 'Barr. Nkechi Eze',
  BP: 'Engr. Dapo Adeyemi',
  DLA: 'Pastor Samuel Ogbonna',
  LP: 'Barr. Kenneth Utomi',
  NDC: 'Alh. Mustapha Sanusi',
  NDP: 'Dr. Mrs. Ngozi Obi',
  NNPP: 'Dr. Rabiu Kwankwaso Jnr',
  NRM: 'Hon. Kabir Danfulani',
  PDP: 'Chief Oladipo Williams',
  PRP: 'Mallam Usman Danladi',
  SDP: 'Prof. Segun Agbaje',
  YP: 'Miss Stephanie Bassey',
  YPP: 'Dr. Kingsley Moghalu',
  ZLP: 'Barr. Danladi Haruna',
};

// Helper to look up candidates for any race alphabetically by party acronym
export function getCandidatesForRace(params: {
  office: Office;
  stateCode?: string;
  senatorialDistrictId?: string;
  federalConstituencyId?: string;
}): Candidate[] {
  const { office, stateCode, senatorialDistrictId, federalConstituencyId } = params;

  if (office === 'PRESIDENT') {
    // Return all presidential candidates, guaranteed sorted alphabetically by party acronym
    return [...INITIAL_CANDIDATES]
      .filter((c) => c.office === 'PRESIDENT')
      .sort((a, b) => a.partyAcronym.localeCompare(b.partyAcronym));
  }

  // If no state is selected yet, return empty list for state/district races
  if (!stateCode) {
    return [];
  }

  // Find matches in official database
  const directMatches = INITIAL_CANDIDATES.filter((c) => {
    if (c.office !== office) return false;
    if (office === 'GOVERNOR') {
      return c.stateCode?.toUpperCase() === stateCode.toUpperCase();
    }
    if (office === 'SENATOR') {
      if (senatorialDistrictId && c.senatorialDistrictId) {
        return c.senatorialDistrictId.toUpperCase() === senatorialDistrictId.toUpperCase();
      }
      return c.stateCode?.toUpperCase() === stateCode.toUpperCase();
    }
    if (office === 'REPRESENTATIVE') {
      if (federalConstituencyId && c.federalConstituencyId) {
        return c.federalConstituencyId.toUpperCase() === federalConstituencyId.toUpperCase();
      }
      if (senatorialDistrictId && c.senatorialDistrictId) {
        return c.senatorialDistrictId.toUpperCase() === senatorialDistrictId.toUpperCase();
      }
      return c.stateCode?.toUpperCase() === stateCode.toUpperCase();
    }
    return false;
  });

  // If we already have candidates, sort them by party acronym alphabetically
  if (directMatches.length > 0) {
    return directMatches.sort((a, b) => a.partyAcronym.localeCompare(b.partyAcronym));
  }

  // Supplementary slate fallback if a rare newly registered party slot is queried
  const matchedPartyAcronyms = new Set(directMatches.map((c) => c.partyAcronym.toUpperCase()));
  const keyParties = POLITICAL_PARTIES.filter((p) => !matchedPartyAcronyms.has(p.acronym.toUpperCase()));

  const fallbackCandidates: Candidate[] = keyParties.slice(0, 10).map((party) => {
    const roleTitle =
      office === 'GOVERNOR'
        ? `${stateCode} Governorship Candidate`
        : office === 'SENATOR'
        ? `Senatorial Candidate`
        : `House of Reps Candidate`;

    const candidateName = PARTY_CANDIDATE_NAMES[party.acronym] || `${party.acronym} Candidate`;

    return {
      id: `${office.toLowerCase()}-${stateCode.toLowerCase()}-${party.acronym.toLowerCase()}-${federalConstituencyId || senatorialDistrictId || 'slot'}`,
      name: candidateName,
      office,
      partyId: party.id,
      partyAcronym: party.acronym,
      partyColor: party.color,
      stateCode,
      senatorialDistrictId,
      federalConstituencyId,
      gender: 'M',
      age: 48,
      bio: `Official ${party.acronym} candidate for ${roleTitle}. Committed to good governance and community representation.`,
      keyPledges: ['Accountable representation', 'Community development priority'],
      education: 'Tertiary Degree',
      status: 'ILLUSTRATIVE_DEMO',
    };
  });

  const combined = [...directMatches, ...fallbackCandidates];
  return combined.sort((a, b) => a.partyAcronym.localeCompare(b.partyAcronym));
}

export function getCandidateById(id?: string): Candidate | undefined {
  if (!id || id === 'undecided') return undefined;

  const found = CANDIDATES_BY_ID.get(id);
  if (found) return found;

  // Synthesize candidate info if it's a dynamic candidate id (e.g. rep-ab-apc-slot)
  const parts = id.split('-');
  if (parts.length >= 3) {
    const rawOffice = parts[0].toUpperCase();
    const office: Office =
      rawOffice === 'PRES'
        ? 'PRESIDENT'
        : rawOffice === 'GOV'
        ? 'GOVERNOR'
        : rawOffice === 'SEN'
        ? 'SENATOR'
        : 'REPRESENTATIVE';

    const partyAcronym = (parts[2] || parts[1] || 'APC').toUpperCase();
    const party = getPartyByAcronym(partyAcronym);
    const candidateName = PARTY_CANDIDATE_NAMES[partyAcronym] || `${partyAcronym} Candidate`;

    return {
      id,
      name: candidateName,
      office,
      partyId: party?.id || partyAcronym.toLowerCase(),
      partyAcronym: party?.acronym || partyAcronym,
      partyColor: party?.color || '#008751',
      stateCode: parts[1]?.toUpperCase(),
      gender: 'M',
      age: 48,
      bio: `Official nominee for ${office}.`,
      keyPledges: ['Accountable representation'],
      education: 'Tertiary Degree',
      status: 'ILLUSTRATIVE_DEMO',
    };
  }

  return undefined;
}
