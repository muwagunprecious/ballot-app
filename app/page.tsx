'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BallotCard } from '@/components/ballot/BallotCard';
import { useBallotStore } from '@/lib/ballot/store';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import { POLITICAL_PARTIES } from '@/lib/data/parties';
import { exportBallotAsPng, triggerCelebration } from '@/lib/export';
import { Office, CardStylePreset, CardAspectRatio } from '@/types/ballot';
import {
  Vote,
  MapPin,
  Share2,
  Download,
  Sparkles,
  Check,
  ChevronRight,
  User,
  Sliders,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { currentLineup, updateCurrentLineup, candidates } = useBallotStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeOffice, setActiveOffice] = useState<Office>('PRESIDENT');
  const [isExporting, setIsExporting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(858);

  useEffect(() => {
    // 2027 Election target date
    const targetDate = new Date('2027-02-20T08:00:00Z').getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    setDaysRemaining(diff);
  }, []);

  const currentState = getStateByCode(currentLineup.stateCode) || NIGERIAN_STATES[0];
  const isFCT = currentLineup.stateCode === 'FC';

  // Active senatorial district
  const activeDistrict = currentState.senatorialDistricts.find(
    (d) => d.id === currentLineup.senatorialDistrictId
  ) || currentState.senatorialDistricts[0];

  // STRICT CASCADING: Only show federal constituencies belonging to active senatorial district
  const availableConstituencies = currentState.federalConstituencies.filter(
    (c) => c.senatorialDistrictId === activeDistrict?.id
  );

  const activeConstituency = availableConstituencies.find(
    (c) => c.id === currentLineup.federalConstituencyId
  ) || availableConstituencies[0] || currentState.federalConstituencies[0];

  // Candidates for active office
  const getCandidatesForOffice = (office: Office) => {
    if (office === 'PRESIDENT') {
      return candidates.filter((c) => c.office === 'PRESIDENT');
    }
    if (office === 'GOVERNOR') {
      return candidates.filter((c) => c.office === 'GOVERNOR' && c.stateCode === currentLineup.stateCode);
    }
    if (office === 'SENATOR') {
      return candidates.filter(
        (c) =>
          c.office === 'SENATOR' &&
          (c.senatorialDistrictId === activeDistrict?.id || c.stateCode === currentLineup.stateCode)
      );
    }
    if (office === 'REPRESENTATIVE') {
      return candidates.filter(
        (c) =>
          c.office === 'REPRESENTATIVE' &&
          (c.federalConstituencyId === activeConstituency?.id ||
            c.senatorialDistrictId === activeDistrict?.id ||
            c.stateCode === currentLineup.stateCode)
      );
    }
    return [];
  };

  // State Change: Cascade down to first district and first matching constituency
  const handleStateChange = (newCode: string) => {
    const newState = getStateByCode(newCode);
    if (!newState) return;
    const defaultDist = newState.senatorialDistricts[0]?.id || '';
    const matchingConsts = newState.federalConstituencies.filter((c) => c.senatorialDistrictId === defaultDist);
    const defaultConst = matchingConsts[0]?.id || newState.federalConstituencies[0]?.id || '';

    const newGov = candidates.find((c) => c.office === 'GOVERNOR' && c.stateCode === newCode);
    const newSen = candidates.find(
      (c) => c.office === 'SENATOR' && (c.senatorialDistrictId === defaultDist || c.stateCode === newCode)
    );
    const newRep = candidates.find(
      (c) =>
        c.office === 'REPRESENTATIVE' &&
        (c.federalConstituencyId === defaultConst || c.stateCode === newCode)
    );

    updateCurrentLineup({
      stateCode: newCode,
      senatorialDistrictId: defaultDist,
      federalConstituencyId: defaultConst,
      governorId: newGov ? newGov.id : undefined,
      senatorId: newSen ? newSen.id : undefined,
      representativeId: newRep ? newRep.id : undefined,
    });
  };

  // District Change: STRICT CASCADING - representative constituency MUST switch to matching district
  const handleDistrictChange = (distId: string) => {
    const matchingConsts = currentState.federalConstituencies.filter((c) => c.senatorialDistrictId === distId);
    const defaultConst = matchingConsts[0]?.id || currentState.federalConstituencies[0]?.id || '';

    const newSen = candidates.find((c) => c.office === 'SENATOR' && c.senatorialDistrictId === distId);
    const newRep = candidates.find((c) => c.office === 'REPRESENTATIVE' && c.federalConstituencyId === defaultConst);

    updateCurrentLineup({
      senatorialDistrictId: distId,
      federalConstituencyId: defaultConst,
      senatorId: newSen ? newSen.id : undefined,
      representativeId: newRep ? newRep.id : undefined,
    });
  };

  const handleConstituencyChange = (constId: string) => {
    const newRep = candidates.find((c) => c.office === 'REPRESENTATIVE' && c.federalConstituencyId === constId);
    updateCurrentLineup({
      federalConstituencyId: constId,
      representativeId: newRep ? newRep.id : currentLineup.representativeId,
    });
  };

  const handleDownloadCard = async () => {
    if (!agreedToTerms) {
      alert('Please check and accept the Terms & Conditions before downloading.');
      return;
    }
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const filename = `my-2027-candidates-lineup-${currentLineup.stateCode.toLowerCase()}.png`;
      await exportBallotAsPng(cardRef.current, filename, currentLineup.aspectRatio);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOnX = () => {
    if (!agreedToTerms) {
      alert('Please check and accept the Terms & Conditions before sharing.');
      return;
    }
    const text = `Here is my official candidates lineup for Nigeria 2027.\n\n📍 ${currentState.name} State (${activeDistrict?.name})\n\nBuild yours now 👇\n#My2027lineup #NaijaElections2027`;
    const url = 'https://my2027lineup.ng';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const officesList: { key: Office; label: string; icon: string }[] = [
    { key: 'PRESIDENT', label: 'President', icon: '🇳🇬' },
    ...(isFCT ? [] : [{ key: 'GOVERNOR' as Office, label: 'Governor', icon: '🏛' }]),
    { key: 'SENATOR', label: 'Senator', icon: '📜' },
    { key: 'REPRESENTATIVE', label: 'House of Rep', icon: '🏛' },
  ];

  const currentOfficeCandidates = getCandidatesForOffice(activeOffice);

  const getSelectedCandidateForOffice = (office: Office) => {
    let id: string | undefined;
    if (office === 'PRESIDENT') id = currentLineup.presidentId;
    if (office === 'GOVERNOR') id = currentLineup.governorId;
    if (office === 'SENATOR') id = currentLineup.senatorId;
    if (office === 'REPRESENTATIVE') id = currentLineup.representativeId;

    if (!id || id === 'undecided') return null;
    return candidates.find((c) => c.id === id);
  };

  const isOfficeUndecided = (office: Office) => {
    if (office === 'PRESIDENT') return !currentLineup.presidentId || currentLineup.presidentId === 'undecided';
    if (office === 'GOVERNOR') return !currentLineup.governorId || currentLineup.governorId === 'undecided';
    if (office === 'SENATOR') return !currentLineup.senatorId || currentLineup.senatorId === 'undecided';
    if (office === 'REPRESENTATIVE') return !currentLineup.representativeId || currentLineup.representativeId === 'undecided';
    return false;
  };

  return (
    <div className="space-y-8 pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* COUNTDOWN & ANNOUNCEMENT BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#112318] via-[#101b14] to-[#0d1410] border border-[#20C878]/30 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#20C878]/15 border border-[#20C878]/40 flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#20C878]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Nigeria 2027 General Elections
              </span>
              <span className="px-2 py-0.2 rounded-full bg-[#20C878]/20 text-[#20C878] font-mono font-black text-[10px]">
                {daysRemaining} Days to Go
              </span>
            </div>
            <p className="text-[11px] text-[#8EA395]">
              Generate and share your personalized election lineup card with friends and community.
            </p>
          </div>
        </div>
      </div>

      {/* 1-LINE MINIMAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A251E]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🗳</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono uppercase">
              My 2027 candidates lineup
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8EA395] mt-1 font-medium">
            Select preferred candidates, generate your branded lineup card, and share across social media.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleShareOnX}
            disabled={!agreedToTerms}
            className="px-4 py-2 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
          >
            <TwitterIcon className="w-3.5 h-3.5 fill-white" />
            <span>Share on X</span>
          </button>

          <button
            onClick={handleDownloadCard}
            disabled={isExporting || !agreedToTerms}
            className="px-4 py-2 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#0A110D] text-xs font-black flex items-center space-x-2 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Saving...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN STUDIO: SELECTOR (LEFT) & LIVE BALLOT CARD (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SELECTORS */}
        <div className="lg:col-span-6 space-y-6">
          {/* STEP 1: USER & LOCATION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#20C878]">
                1. Your Info & Voting Location
              </span>
              <span className="text-[10px] font-mono text-[#8EA395]">
                {currentState.name} · {activeDistrict?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={currentLineup.userName || ''}
                  onChange={(e) => updateCurrentLineup({ userName: e.target.value })}
                  placeholder="Emmanuel Okoegwale"
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">X / Twitter Handle</label>
                <input
                  type="text"
                  value={currentLineup.userHandle || ''}
                  onChange={(e) => updateCurrentLineup({ userHandle: e.target.value })}
                  placeholder="@Em_0098"
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-mono focus:outline-hidden focus:border-[#20C878]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">State</label>
                <select
                  value={currentLineup.stateCode}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code} className="bg-[#141E18] text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">Senatorial District</label>
                <select
                  value={activeDistrict?.id || ''}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {currentState.senatorialDistricts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#141E18] text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">Constituency (Rep)</label>
                <select
                  value={activeConstituency?.id || ''}
                  onChange={(e) => handleConstituencyChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {availableConstituencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141E18] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: LIGHTWEIGHT CANDIDATE SELECTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#20C878]">
                2. Pick Candidates
              </span>
              <span className="text-[10px] font-mono text-[#8EA395]">
                Candidate Name & Party
              </span>
            </div>

            {/* OFFICE TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {officesList.map((off) => {
                const selected = getSelectedCandidateForOffice(off.key);
                const isUndecided = isOfficeUndecided(off.key);
                const isActive = activeOffice === off.key;
                return (
                  <button
                    key={off.key}
                    onClick={() => setActiveOffice(off.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-[#19271E] border-[#20C878] text-white shadow-xs'
                        : 'bg-[#141E18] border-[#26382E] text-[#8EA395] hover:border-[#385141]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span>{off.icon} {off.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-[#20C878]" />}
                    </div>
                    <p className="text-[10px] font-medium truncate mt-1 text-white">
                      {isUndecided ? 'Not Decided' : selected ? selected.name.split(' ')[0] : 'Choose...'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* CANDIDATES LIST: LIGHTWEIGHT, NO PICTURES, WITH NOT DECIDED OPTION */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono text-[#8EA395]">
                  Select candidate for <span className="text-white font-bold">{activeOffice}</span>:
                </p>
                <span className="text-[10px] text-[#637C6D]">Fast, lightweight</span>
              </div>

              {/* NOT DECIDED / UNDECIDED BUTTON */}
              <div
                onClick={() => {
                  if (activeOffice === 'PRESIDENT') updateCurrentLineup({ presidentId: 'undecided' });
                  if (activeOffice === 'GOVERNOR') updateCurrentLineup({ governorId: 'undecided' });
                  if (activeOffice === 'SENATOR') updateCurrentLineup({ senatorId: 'undecided' });
                  if (activeOffice === 'REPRESENTATIVE') updateCurrentLineup({ representativeId: 'undecided' });
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isOfficeUndecided(activeOffice)
                    ? 'bg-[#1A261E] border-[#20C878] text-white ring-1 ring-[#20C878]'
                    : 'bg-[#141E18] border-[#26382E] text-[#8EA395] hover:border-[#385141]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full border border-gray-500 flex items-center justify-center">
                    {isOfficeUndecided(activeOffice) && <div className="w-1.5 h-1.5 rounded-full bg-[#20C878]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Not Decided / Undecided</h4>
                    <p className="text-[10px] text-[#8EA395]">Leave this office neutral or decide later</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-mono font-semibold text-gray-300">
                  UNDECIDED
                </span>
              </div>

              {/* CANDIDATE OPTIONS */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {currentOfficeCandidates.map((cand) => {
                  const isSelected =
                    (activeOffice === 'PRESIDENT' && currentLineup.presidentId === cand.id) ||
                    (activeOffice === 'GOVERNOR' && currentLineup.governorId === cand.id) ||
                    (activeOffice === 'SENATOR' && currentLineup.senatorId === cand.id) ||
                    (activeOffice === 'REPRESENTATIVE' && currentLineup.representativeId === cand.id);

                  return (
                    <div
                      key={cand.id}
                      onClick={() => {
                        if (activeOffice === 'PRESIDENT') updateCurrentLineup({ presidentId: cand.id });
                        if (activeOffice === 'GOVERNOR') updateCurrentLineup({ governorId: cand.id });
                        if (activeOffice === 'SENATOR') updateCurrentLineup({ senatorId: cand.id });
                        if (activeOffice === 'REPRESENTATIVE') updateCurrentLineup({ representativeId: cand.id });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                          : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cand.partyColor || '#086338' }}
                        />
                        <div className="truncate">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{cand.name}</h4>
                          <span className="text-[10px] text-[#8EA395]">{cand.partyAcronym} · Party Candidate</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black text-white"
                          style={{ backgroundColor: cand.partyColor || '#086338' }}
                        >
                          {cand.partyAcronym}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#20C878]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CARD FORMAT & THEME CONTROLS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#8EA395]">Format:</span>
                <div className="flex flex-wrap items-center gap-1 bg-[#141E18] p-1 rounded-lg border border-[#26382E]">
                  {[
                    { key: 'twitter_landscape', label: 'X / Twitter' },
                    { key: 'instagram_square', label: 'Instagram (1:1)' },
                    { key: 'instagram_portrait', label: 'FB/IG Post (4:5)' },
                    { key: 'whatsapp_status', label: 'WhatsApp Status (9:16)' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => updateCurrentLineup({ aspectRatio: item.key as CardAspectRatio })}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                        currentLineup.aspectRatio === item.key
                          ? 'bg-[#20C878] text-[#0A110D]'
                          : 'text-[#8EA395] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#8EA395]">Theme:</span>
                <div className="flex items-center space-x-1 bg-[#141E18] p-1 rounded-lg border border-[#26382E]">
                  {(['emerald_classic', 'obsidian_minimal', 'civic_heritage'] as CardStylePreset[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateCurrentLineup({ stylePreset: st })}
                      className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                        currentLineup.stylePreset === st
                          ? 'bg-[#20C878] text-[#0A110D]'
                          : 'text-[#8EA395] hover:text-white'
                      }`}
                    >
                      {st === 'emerald_classic' ? 'Light' : st === 'obsidian_minimal' ? 'Dark' : 'Heritage'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TERMS & CONDITIONS CONSENT CHECKBOX */}
            <div className="pt-3 border-t border-[#1A251E] flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-[#141E18] text-[#20C878] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#20C878]"
              />
              <label htmlFor="terms-checkbox" className="text-xs text-[#8EA395] cursor-pointer select-none">
                I accept the <span className="text-white font-medium underline">Terms of Use & Civic Guidelines</span>. I confirm this card represents my personal lineup choice for social sharing.
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE BALLOT CARD PREVIEW */}
        <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8EA395]">
            <span className="flex items-center space-x-1.5 font-bold uppercase text-white">
              <span className="w-2 h-2 rounded-full bg-[#20C878] animate-pulse" />
              <span>Realtime Lineup Card</span>
            </span>
            <span>{currentState.name} State</span>
          </div>

          {/* RENDERED BALLOT CARD */}
          <div className="flex justify-center p-2 sm:p-4 rounded-2xl bg-[#080D0A] border border-[#1A251E]">
            <BallotCard
              ref={cardRef}
              lineup={currentLineup}
              stylePreset={currentLineup.stylePreset}
              aspectRatio={currentLineup.aspectRatio}
              interactive={true}
              onOfficeClick={(off) => setActiveOffice(off)}
            />
          </div>

          {/* PRIMARY ACTION BUTTONS */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareOnX}
                disabled={!agreedToTerms}
                className="w-full py-3 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg"
              >
                <TwitterIcon className="w-4 h-4 fill-white" />
                <span>Share on X / Twitter</span>
              </button>

              <button
                onClick={handleDownloadCard}
                disabled={isExporting || !agreedToTerms}
                className="w-full py-3 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#0A110D] text-xs font-black flex items-center justify-center space-x-2 transition-colors shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating PNG...' : 'Download Card (PNG)'}</span>
              </button>
            </div>

            {!agreedToTerms && (
              <p className="text-center text-[10px] text-amber-400 font-mono">
                ⚠️ Please check the terms & conditions box above to enable sharing and download.
              </p>
            )}
          </div>

          <p className="text-center text-[11px] font-mono text-[#627A6C]">
            Cached in-browser · Zero server load · #My2027lineup #NaijaElections2027
          </p>
        </div>
      </div>
    </div>
  );
}
