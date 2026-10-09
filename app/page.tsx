'use client';

import React, { useState, useRef } from 'react';
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
  RefreshCw,
  Copy,
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

  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeOffice, setActiveOffice] = useState<Office>('PRESIDENT');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentState = getStateByCode(currentLineup.stateCode) || NIGERIAN_STATES[0];
  const isFCT = currentLineup.stateCode === 'FC';

  const activeDistrict = currentState.senatorialDistricts.find(
    (d) => d.id === currentLineup.senatorialDistrictId
  ) || currentState.senatorialDistricts[0];

  const activeConstituency = currentState.federalConstituencies.find(
    (c) => c.id === currentLineup.federalConstituencyId
  ) || currentState.federalConstituencies[0];

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
          (c.senatorialDistrictId === currentLineup.senatorialDistrictId || c.stateCode === currentLineup.stateCode)
      );
    }
    if (office === 'REPRESENTATIVE') {
      return candidates.filter(
        (c) =>
          c.office === 'REPRESENTATIVE' &&
          (c.federalConstituencyId === currentLineup.federalConstituencyId ||
            c.senatorialDistrictId === currentLineup.senatorialDistrictId ||
            c.stateCode === currentLineup.stateCode)
      );
    }
    return [];
  };

  const handleStateChange = (newCode: string) => {
    const newState = getStateByCode(newCode);
    if (!newState) return;
    const defaultDist = newState.senatorialDistricts[0]?.id || '';
    const defaultConst = newState.federalConstituencies[0]?.id || '';

    // Pick first available governor, senator, rep for new state
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

  const handleDistrictChange = (distId: string) => {
    const defaultConst = currentState.federalConstituencies.find((c) => c.senatorialDistrictId === distId)?.id || currentState.federalConstituencies[0]?.id;
    const newSen = candidates.find((c) => c.office === 'SENATOR' && c.senatorialDistrictId === distId);
    const newRep = candidates.find((c) => c.office === 'REPRESENTATIVE' && c.federalConstituencyId === defaultConst);

    updateCurrentLineup({
      senatorialDistrictId: distId,
      federalConstituencyId: defaultConst,
      senatorId: newSen ? newSen.id : currentLineup.senatorId,
      representativeId: newRep ? newRep.id : currentLineup.representativeId,
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
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const filename = `my-2027-ballot-${currentLineup.stateCode.toLowerCase()}.png`;
      await exportBallotAsPng(cardRef.current, filename, currentLineup.aspectRatio);
      triggerCelebration();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOnX = () => {
    const text = `Here is my official ballot line-up for the 2027 Nigerian Elections.\n\n📍 ${currentState.name} State (${activeDistrict?.name})\n\nCreate yours in 30 seconds 👇\n#My2027lineup #NaijaElections2027`;
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
    if (office === 'PRESIDENT') return candidates.find((c) => c.id === currentLineup.presidentId);
    if (office === 'GOVERNOR') return candidates.find((c) => c.id === currentLineup.governorId);
    if (office === 'SENATOR') return candidates.find((c) => c.id === currentLineup.senatorId);
    if (office === 'REPRESENTATIVE') return candidates.find((c) => c.id === currentLineup.representativeId);
  };

  return (
    <div className="space-y-10 pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1-LINE MINIMAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A251E]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🗳</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono uppercase">
              My 2027 Ballot Line-up
            </h1>
          </div>
          <p className="text-sm text-[#8EA395] mt-1 font-medium">
            Pick your candidates, generate your ballot card, and share on X / Twitter.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleShareOnX}
            className="px-4 py-2 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
          >
            <TwitterIcon className="w-3.5 h-3.5 fill-white" />
            <span>Share on X</span>
          </button>

          <button
            onClick={handleDownloadCard}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center space-x-2 transition-colors shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Saving...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN STUDIO: SELECTOR (LEFT) & LIVE BALLOT CARD (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 1-CLICK SELECTORS */}
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
                  value={currentLineup.senatorialDistrictId}
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
                  value={currentLineup.federalConstituencyId}
                  onChange={(e) => handleConstituencyChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {currentState.federalConstituencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141E18] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: CANDIDATE PICKER TABS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#20C878]">
                2. Pick Candidates
              </span>
              <span className="text-[10px] font-mono text-[#8EA395]">
                1-tap selection
              </span>
            </div>

            {/* OFFICE TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {officesList.map((off) => {
                const selected = getSelectedCandidateForOffice(off.key);
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
                      {selected ? selected.name.split(' ')[0] : 'Choose...'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* CANDIDATES LIST FOR ACTIVE OFFICE */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-mono text-[#8EA395]">
                Select candidate for <span className="text-white font-bold">{activeOffice}</span>:
              </p>

              {currentOfficeCandidates.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#26382E] rounded-xl text-xs text-[#8EA395]">
                  No candidates listed for this constituency yet. Default candidate selected.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                            : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-black/20 bg-zinc-800">
                          {cand.avatarUrl ? (
                            <img src={cand.avatarUrl} alt={cand.name} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: cand.partyColor || '#086338' }}
                            >
                              {cand.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Name & Party */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold truncate">{cand.name}</h4>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#20C878] shrink-0" />}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-black text-white"
                              style={{ backgroundColor: cand.partyColor || '#086338' }}
                            >
                              {cand.partyAcronym}
                            </span>
                            <span className="text-[10px] text-[#8EA395] truncate">
                              {cand.runningMate ? `Running: ${cand.runningMate.split(' ')[0]}` : cand.education?.split(',')[0] || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CARD STYLE CONTROLS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-[#8EA395]">Theme:</span>
              <div className="flex items-center space-x-1 bg-[#141E18] p-1 rounded-lg border border-[#26382E]">
                {(['emerald_classic', 'obsidian_minimal', 'civic_heritage'] as CardStylePreset[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateCurrentLineup({ stylePreset: st })}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                      currentLineup.stylePreset === st
                        ? 'bg-[#20C878] text-[#0A110D]'
                        : 'text-[#8EA395] hover:text-white'
                    }`}
                  >
                    {st === 'emerald_classic' ? 'Light' : st === 'obsidian_minimal' ? 'Obsidian' : 'Heritage'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-[#8EA395]">Format:</span>
              <div className="flex items-center space-x-1 bg-[#141E18] p-1 rounded-lg border border-[#26382E]">
                {(['twitter_landscape', 'instagram_square'] as CardAspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => updateCurrentLineup({ aspectRatio: ratio })}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                      currentLineup.aspectRatio === ratio
                        ? 'bg-[#20C878] text-[#0A110D]'
                        : 'text-[#8EA395] hover:text-white'
                    }`}
                  >
                    {ratio === 'twitter_landscape' ? 'X Landscape' : '1:1 Square'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE BALLOT CARD PREVIEW */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8EA395]">
            <span className="flex items-center space-x-1.5 font-bold uppercase text-white">
              <span className="w-2 h-2 rounded-full bg-[#20C878] animate-pulse" />
              <span>Live Generated Ballot</span>
            </span>
            <span>Auto-updating</span>
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
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleShareOnX}
              className="w-full py-3 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg"
            >
              <TwitterIcon className="w-4 h-4 fill-white" />
              <span>Share on X / Twitter</span>
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={isExporting}
              className="w-full py-3 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center justify-center space-x-2 transition-colors shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PNG...' : 'Download Card (PNG)'}</span>
            </button>
          </div>

          <p className="text-center text-[11px] font-mono text-[#627A6C]">
            Official watermark · #My2027lineup #NaijaElections2027
          </p>
        </div>
      </div>
    </div>
  );
}
