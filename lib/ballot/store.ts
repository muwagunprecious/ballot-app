'use client';

import { useState, useEffect } from 'react';
import { Candidate, LineupSelection, CardStylePreset, CardAspectRatio, UserProfile } from '@/types/ballot';
import { INITIAL_CANDIDATES } from '@/lib/data/candidates';

export const DEFAULT_LINEUP: LineupSelection = {
  id: 'lineup-abia-demo',
  title: 'My 2027 candidates lineup',
  userName: 'Emmanuel Okoegwale',
  userHandle: '@Em_0098',
  stateCode: 'AB',
  senatorialDistrictId: 'AB-C',
  federalConstituencyId: 'AB-IKWUANO-UMUAHIA',
  presidentId: 'pres-2',
  governorId: 'gov-ab-1',
  senatorId: 'sen-ab-c-1',
  representativeId: 'rep-ab-ikw-1',
  stylePreset: 'emerald_classic',
  aspectRatio: 'twitter_landscape',
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

export const DEMO_USER_PROFILE: UserProfile = {
  name: 'Ademola Adebayo',
  handle: '@ademola_demo',
  stateCode: 'LA',
  bio: 'Civic tech enthusiast, urban planning advocate & Lagos resident voting for clean governance.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  lineupCount: 3,
  joinedDate: 'October 2026',
};

const SAMPLE_SAVED_LINEUPS: LineupSelection[] = [
  {
    id: 'lineup-1',
    title: 'Lagos Island Civic Ballot',
    stateCode: 'LA',
    senatorialDistrictId: 'LA-C',
    federalConstituencyId: 'LA-ETI-OSA',
    presidentId: 'pres-2',
    governorId: 'gov-la-2',
    senatorId: 'sen-la-c-2',
    representativeId: 'rep-la-eti-2',
    stylePreset: 'emerald_classic',
    aspectRatio: 'twitter_landscape',
    createdAt: '2026-10-01T14:32:00.000Z',
    updatedAt: '2026-10-01T14:32:00.000Z',
  },
  {
    id: 'lineup-2',
    title: 'FCT Capital Reform Lineup',
    stateCode: 'FC',
    senatorialDistrictId: 'FC-C',
    federalConstituencyId: 'FC-AMAC-BWARI',
    presidentId: 'pres-1',
    governorId: undefined,
    senatorId: 'sen-fc-c-1',
    representativeId: 'rep-fc-amac-1',
    stylePreset: 'civic_heritage',
    aspectRatio: 'instagram_square',
    createdAt: '2026-09-28T09:15:00.000Z',
    updatedAt: '2026-09-28T09:15:00.000Z',
  },
  {
    id: 'lineup-3',
    title: 'Oyo State Progressive Slate',
    stateCode: 'OY',
    senatorialDistrictId: 'OY-S',
    federalConstituencyId: 'OY-IBADAN-NORTH',
    presidentId: 'pres-3',
    governorId: 'gov-oy-1',
    senatorId: undefined,
    representativeId: undefined,
    stylePreset: 'obsidian_minimal',
    aspectRatio: 'instagram_portrait',
    createdAt: '2026-09-20T18:40:00.000Z',
    updatedAt: '2026-09-20T18:40:00.000Z',
  }
];

export function useBallotStore() {
  const [currentLineup, setCurrentLineup] = useState<LineupSelection>(DEFAULT_LINEUP);
  const [savedLineups, setSavedLineups] = useState<LineupSelection[]>(SAMPLE_SAVED_LINEUPS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage safely on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedLineup = localStorage.getItem('my2027_current_lineup');
      if (storedLineup) {
        setCurrentLineup(JSON.parse(storedLineup));
      }
      
      const storedSaved = localStorage.getItem('my2027_saved_lineups');
      if (storedSaved) {
        setSavedLineups(JSON.parse(storedSaved));
      }

      const storedCandidates = localStorage.getItem('my2027_candidates');
      if (storedCandidates) {
        setCandidates(JSON.parse(storedCandidates));
      }
    } catch (e) {
      console.error('Failed to load stored ballot data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateCurrentLineup = (updater: Partial<LineupSelection> | ((prev: LineupSelection) => LineupSelection)) => {
    setCurrentLineup(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater, updatedAt: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('my2027_current_lineup', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  const saveLineup = (lineupToSave?: LineupSelection) => {
    const item = lineupToSave || {
      ...currentLineup,
      id: `lineup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedLineups(prev => {
      const existingIdx = prev.findIndex(l => l.id === item.id);
      let updated: LineupSelection[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = item;
      } else {
        updated = [item, ...prev];
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('my2027_saved_lineups', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });

    return item;
  };

  const deleteSavedLineup = (id: string) => {
    setSavedLineups(prev => {
      const updated = prev.filter(l => l.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('my2027_saved_lineups', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates(prev => {
      const updated = [candidate, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('my2027_candidates', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const updateCandidate = (candidate: Candidate) => {
    setCandidates(prev => {
      const updated = prev.map(c => c.id === candidate.id ? candidate : c);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('my2027_candidates', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const deleteCandidate = (id: string) => {
    setCandidates(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('my2027_candidates', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const resetAllToDefaults = () => {
    setCurrentLineup(DEFAULT_LINEUP);
    setSavedLineups(SAMPLE_SAVED_LINEUPS);
    setCandidates(INITIAL_CANDIDATES);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('my2027_current_lineup');
        localStorage.removeItem('my2027_saved_lineups');
        localStorage.removeItem('my2027_candidates');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return {
    currentLineup,
    updateCurrentLineup,
    savedLineups,
    saveLineup,
    deleteSavedLineup,
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    resetAllToDefaults,
    isLoaded,
  };
}
