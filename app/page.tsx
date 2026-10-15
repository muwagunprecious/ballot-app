'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BallotCard } from '@/components/ballot/BallotCard';
import { PartyLogo } from '@/components/ballot/PartyLogo';
import { useBallotStore } from '@/lib/ballot/store';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import { POLITICAL_PARTIES } from '@/lib/data/parties';
import { getCandidatesForRace, getCandidateById } from '@/lib/data/candidates';
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
  Clock,
  Palette,
  Layout,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const TwitterIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.476-.15-.677.15-.2.301-.777.978-.952 1.179-.175.2-.351.226-.652.075-1.928-.962-3.197-2.148-4.475-4.343-.339-.582.339-.54.97-1.802.106-.214.053-.402-.027-.552-.08-.15-.677-1.63-.928-2.233-.245-.587-.494-.508-.677-.517l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.278.496 1.715.635.722.23 1.379.197 1.9.12.58-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.176-1.429-.076-.125-.276-.201-.577-.351zM12.04 2C6.516 2 2.028 6.488 2.028 12.012c0 1.92.544 3.716 1.488 5.253L2 22l4.89-1.455a9.98 9.98 0 005.15 1.43c5.524 0 10.013-4.488 10.013-10.012C22.053 6.488 17.564 2 12.04 2z" />
  </svg>
);

export default function HomePage() {
  const { currentLineup, updateCurrentLineup } = useBallotStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(274);
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    // 2027 General Elections Presidential target: Jan 16, 2027
    const targetDate = new Date('2027-01-16T08:00:00Z').getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    setDaysRemaining(diff);
  }, []);

  const currentState = getStateByCode(currentLineup.stateCode) || NIGERIAN_STATES[0];
  const isFCT = currentLineup.stateCode === 'FC';

  // Active senatorial district
  const activeDistrict =
    currentState.senatorialDistricts.find((d) => d.id === currentLineup.senatorialDistrictId) ||
    currentState.senatorialDistricts[0];

  // STRICT CASCADING: Only show federal constituencies belonging to active senatorial district
  const availableConstituencies = currentState.federalConstituencies.filter(
    (c) => c.senatorialDistrictId === activeDistrict?.id
  );

  const activeConstituency =
    availableConstituencies.find((c) => c.id === currentLineup.federalConstituencyId) ||
    availableConstituencies[0] ||
    currentState.federalConstituencies[0];

  // Candidates for the 4 steps, all sorted alphabetically by party acronym
  const presidentialCandidates = getCandidatesForRace({ office: 'PRESIDENT' });

  const governorshipCandidates = isFCT
    ? []
    : getCandidatesForRace({ office: 'GOVERNOR', stateCode: currentLineup.stateCode });

  const senatorialCandidates = getCandidatesForRace({
    office: 'SENATOR',
    stateCode: currentLineup.stateCode,
    senatorialDistrictId: activeDistrict?.id,
  });

  const repCandidates = getCandidatesForRace({
    office: 'REPRESENTATIVE',
    stateCode: currentLineup.stateCode,
    senatorialDistrictId: activeDistrict?.id,
    federalConstituencyId: activeConstituency?.id,
  });

  // State Change: Cascade down to first district and matching constituency
  const handleStateChange = (newCode: string) => {
    const newState = getStateByCode(newCode);
    if (!newState) return;
    const defaultDist = newState.senatorialDistricts[0]?.id || '';
    const matchingConsts = newState.federalConstituencies.filter(
      (c) => c.senatorialDistrictId === defaultDist
    );
    const defaultConst = matchingConsts[0]?.id || newState.federalConstituencies[0]?.id || '';

    // Automatically update governorship/senator/rep candidate if needed
    const newGovs = getCandidatesForRace({ office: 'GOVERNOR', stateCode: newCode });
    const newSens = getCandidatesForRace({ office: 'SENATOR', stateCode: newCode, senatorialDistrictId: defaultDist });
    const newReps = getCandidatesForRace({
      office: 'REPRESENTATIVE',
      stateCode: newCode,
      senatorialDistrictId: defaultDist,
      federalConstituencyId: defaultConst,
    });

    updateCurrentLineup({
      stateCode: newCode,
      senatorialDistrictId: defaultDist,
      federalConstituencyId: defaultConst,
      governorId: newCode === 'FC' ? undefined : newGovs[0]?.id,
      senatorId: newSens[0]?.id,
      representativeId: newReps[0]?.id,
    });
  };

  // District Change: Strictly cascades federal constituency to matching district
  const handleDistrictChange = (distId: string) => {
    const matchingConsts = currentState.federalConstituencies.filter(
      (c) => c.senatorialDistrictId === distId
    );
    const defaultConst = matchingConsts[0]?.id || currentState.federalConstituencies[0]?.id || '';

    const newSens = getCandidatesForRace({
      office: 'SENATOR',
      stateCode: currentLineup.stateCode,
      senatorialDistrictId: distId,
    });
    const newReps = getCandidatesForRace({
      office: 'REPRESENTATIVE',
      stateCode: currentLineup.stateCode,
      senatorialDistrictId: distId,
      federalConstituencyId: defaultConst,
    });

    updateCurrentLineup({
      senatorialDistrictId: distId,
      federalConstituencyId: defaultConst,
      senatorId: newSens[0]?.id,
      representativeId: newReps[0]?.id,
    });
  };

  const handleConstituencyChange = (constId: string) => {
    const newReps = getCandidatesForRace({
      office: 'REPRESENTATIVE',
      stateCode: currentLineup.stateCode,
      senatorialDistrictId: activeDistrict?.id,
      federalConstituencyId: constId,
    });
    updateCurrentLineup({
      federalConstituencyId: constId,
      representativeId: newReps[0]?.id,
    });
  };

  // Instant export without terms checkbox barrier
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const filename = `my-2027-elections-lineup-${currentLineup.stateCode.toLowerCase()}.png`;
      await exportBallotAsPng(cardRef.current, filename, currentLineup.aspectRatio);
      triggerCelebration();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOnX = () => {
    const constName = activeConstituency?.name || 'Federal Constituency';
    const text = `Here is my official candidates lineup for Nigeria 2027!\n\n📍 ${constName}, ${currentState.name} State\n🗳 Make your 2027 lineup: https://www.my2027lineup.com\n\n#my2027lineup #NaijaElections2027`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const constName = activeConstituency?.name || 'Federal Constituency';
    const text = `Here is my official candidates lineup for Nigeria 2027! 🇳🇬\n\n📍 ${constName}, ${currentState.name} State\n🗳 Create and share your lineup here: https://www.my2027lineup.com\n#my2027lineup`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Top marquee candidates
  const keyContenders = [
    { name: 'Bola Ahmed Tinubu', party: 'APC', id: 'pres-apc' },
    { name: 'Peter Gregory Obi', party: 'LP', id: 'pres-lp' },
    { name: 'Atiku Abubakar', party: 'PDP', id: 'pres-pdp' },
    { name: 'Rabiu Musa Kwankwaso', party: 'NNPP', id: 'pres-nnpp' },
    { name: 'Omoyele Sowore', party: 'AAC', id: 'pres-aac' },
    { name: 'Prince Adewole Adebayo', party: 'SDP', id: 'pres-sdp' },
  ];

  return (
    <div className="space-y-6 pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* TOP COUNTDOWN & ELECTION BANNER */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0C1A11] via-[#112417] to-[#0A140E] border border-[#20C878]/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#20C878]/15 border border-[#20C878]/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#20C878]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white font-mono uppercase tracking-wider">
                  My 2027 elections line-up [{daysRemaining} days to go!]
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#EAB308]/20 text-[#FACC15] font-mono font-bold text-[10px]">
                  Vote on Jan 16 and Feb 06, 2027
                </span>
              </div>
              <p className="text-xs text-[#8EA395] mt-0.5 font-medium">
                Select your preferred candidates across 4 fast steps, customize, and share your official lineup card.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleShareOnX}
              className="px-3 py-1.5 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <TwitterIcon className="w-3.5 h-3.5 fill-white" />
              <span>Share on X</span>
            </button>
            <button
              onClick={handleDownloadCard}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-black flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LEADING PRESIDENTIAL CANDIDATES HEADER ROW */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#20C878] flex items-center space-x-1.5">
            <span>Leading Presidential Contenders</span>
            <span className="text-[10px] text-[#637C6D] lowercase font-normal">(1-click select)</span>
          </span>
          <span className="text-[10px] font-mono text-[#8EA395]">Presidential Slate</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-0.5">
          {keyContenders.map((cand) => {
            const isSelected = currentLineup.presidentId === cand.id;
            return (
              <button
                key={cand.id}
                onClick={() => updateCurrentLineup({ presidentId: cand.id })}
                className={`p-2 rounded-xl border flex items-center space-x-2 transition-all text-left ${
                  isSelected
                    ? 'bg-[#192B20] border-[#20C878] ring-1 ring-[#20C878]'
                    : 'bg-[#141E18] border-[#26382E] hover:border-[#3A5443]'
                }`}
              >
                <PartyLogo acronym={cand.party} size={28} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-bold text-white truncate leading-tight">{cand.name}</h4>
                  <span className="text-[9px] font-mono font-bold text-[#8EA395]">{cand.party}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#20C878] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN STUDIO: 4 LEAN STEPS (LEFT) & LIVE BALLOT CARD (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 4 STEPS SELECTION + CUSTOMIZE CARD */}
        <div className="lg:col-span-6 space-y-5">
          {/* STEP 1: PRESIDENTIAL */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  President — Federal Republic of Nigeria
                </h3>
              </div>
              {currentLineup.presidentId && currentLineup.presidentId !== 'undecided' && (
                <button
                  onClick={() => updateCurrentLineup({ presidentId: undefined })}
                  className="text-[10px] text-gray-400 hover:text-white underline font-mono"
                >
                  Clear choice
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#8EA395]">
              Options listed alphabetically by registered party acronym:
            </p>

            {/* CANDIDATES LIST BY PARTIES ALPHABETICALLY */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {presidentialCandidates.map((cand) => {
                const isSelected = currentLineup.presidentId === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => updateCurrentLineup({ presidentId: cand.id })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                        : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {/* Radio button circle */}
                      <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                      </div>

                      <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />

                      <div className="truncate">
                        <span className="text-xs font-extrabold text-white truncate block">
                          {cand.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8EA395]">
                          {cand.partyAcronym} · {POLITICAL_PARTIES.find((p) => p.acronym === cand.partyAcronym)?.name}
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black text-white shrink-0 ml-2"
                      style={{ backgroundColor: cand.partyColor || '#086338' }}
                    >
                      {cand.partyAcronym}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: GOVERNOR (WITH STATE DROPDOWN STARTING WITH ABIA) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Governor — State Dropdown & Candidates
                </h3>
              </div>
              {currentLineup.governorId && currentLineup.governorId !== 'undecided' && (
                <button
                  onClick={() => updateCurrentLineup({ governorId: undefined })}
                  className="text-[10px] text-gray-400 hover:text-white underline font-mono"
                >
                  Clear choice
                </button>
              )}
            </div>

            {/* STATE DROPDOWN */}
            <div>
              <label className="block text-[11px] font-mono text-[#8EA395] mb-1">Select State (Alphabetical, Default: Abia)</label>
              <select
                value={currentLineup.stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code} className="bg-[#141E18] text-white">
                    {s.name} State {s.code === 'FC' ? '(Federal Jurisdiction)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {isFCT ? (
              <div className="p-3 rounded-xl bg-[#141E18] border border-[#26382E] text-center text-xs text-[#8EA395]">
                FCT Abuja is under federal jurisdiction. Governorship election does not apply.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {governorshipCandidates.map((cand) => {
                  const isSelected = currentLineup.governorId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ governorId: cand.id })}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                          : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                        </div>
                        <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-extrabold text-white truncate block">
                            {cand.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#8EA395]">
                            {cand.partyAcronym} · {POLITICAL_PARTIES.find((p) => p.acronym === cand.partyAcronym)?.name}
                          </span>
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black text-white shrink-0 ml-2"
                        style={{ backgroundColor: cand.partyColor || '#086338' }}
                      >
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: SENATORIAL DISTRICT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Senatorial District — Dropdown & Candidates
                </h3>
              </div>
              {currentLineup.senatorId && currentLineup.senatorId !== 'undecided' && (
                <button
                  onClick={() => updateCurrentLineup({ senatorId: undefined })}
                  className="text-[10px] text-gray-400 hover:text-white underline font-mono"
                >
                  Clear choice
                </button>
              )}
            </div>

            {/* SENATORIAL DISTRICT DROPDOWN */}
            <div>
              <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                Senatorial District ({currentState.name})
              </label>
              <select
                value={activeDistrict?.id || ''}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
              >
                {currentState.senatorialDistricts.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#141E18] text-white">
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {senatorialCandidates.map((cand) => {
                const isSelected = currentLineup.senatorId === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => updateCurrentLineup({ senatorId: cand.id })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                        : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                      </div>
                      <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-extrabold text-white truncate block">
                          {cand.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8EA395]">
                          {cand.partyAcronym} · {POLITICAL_PARTIES.find((p) => p.acronym === cand.partyAcronym)?.name}
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black text-white shrink-0 ml-2"
                      style={{ backgroundColor: cand.partyColor || '#086338' }}
                    >
                      {cand.partyAcronym}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: HOUSE OF REP (DROPDOWN CONSTRAINED TO SENATORIAL DISTRICT) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  House of Rep — Constrained Constituency & Candidates
                </h3>
              </div>
              {currentLineup.representativeId && currentLineup.representativeId !== 'undecided' && (
                <button
                  onClick={() => updateCurrentLineup({ representativeId: undefined })}
                  className="text-[10px] text-gray-400 hover:text-white underline font-mono"
                >
                  Clear choice
                </button>
              )}
            </div>

            {/* FEDERAL CONSTITUENCY DROPDOWN (ONLY CONSTITUENCIES IN ACTIVE SENATORIAL DISTRICT) */}
            <div>
              <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                Federal Constituency (In {activeDistrict?.name || 'District'})
              </label>
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

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {repCandidates.map((cand) => {
                const isSelected = currentLineup.representativeId === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => updateCurrentLineup({ representativeId: cand.id })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                        : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                      </div>
                      <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-extrabold text-white truncate block">
                          {cand.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8EA395]">
                          {cand.partyAcronym} · {POLITICAL_PARTIES.find((p) => p.acronym === cand.partyAcronym)?.name}
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black text-white shrink-0 ml-2"
                      style={{ backgroundColor: cand.partyColor || '#086338' }}
                    >
                      {cand.partyAcronym}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CUSTOMIZE CARD: OPTIONAL NAME, HANDLE, FORMAT & THEME */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#20C878]">
                Customize Card
              </span>
              <span className="text-[10px] font-mono text-[#8EA395]">
                Mandatory: State & Constituency
              </span>
            </div>

            {/* OPTIONAL NAME & HANDLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Your Name <span className="text-[10px] text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={currentLineup.userName || ''}
                  onChange={(e) => updateCurrentLineup({ userName: e.target.value })}
                  placeholder="e.g. Precious Muwagun"
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Social Handle <span className="text-[10px] text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={currentLineup.userHandle || ''}
                  onChange={(e) => updateCurrentLineup({ userHandle: e.target.value })}
                  placeholder="@yourhandle"
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-mono focus:outline-hidden focus:border-[#20C878]"
                />
              </div>
            </div>

            {/* FORMAT DROPDOWN & THEME SELECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Card Format (Platform Size)
                </label>
                <select
                  value={currentLineup.aspectRatio}
                  onChange={(e) => updateCurrentLineup({ aspectRatio: e.target.value as CardAspectRatio })}
                  className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  <option value="twitter_landscape">X / Twitter (16:9 Landscape)</option>
                  <option value="facebook_post">Facebook (1.91:1 Landscape)</option>
                  <option value="whatsapp_status">WhatsApp Status (9:16 Story)</option>
                  <option value="instagram_square">Instagram (1:1 Square)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Card Theme
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'obsidian_minimal', label: 'Dark' },
                    { key: 'emerald_classic', label: 'White' },
                    { key: 'civic_heritage', label: 'Heritage' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => updateCurrentLineup({ stylePreset: t.key as CardStylePreset })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                        currentLineup.stylePreset === t.key
                          ? 'bg-[#20C878] text-[#0A110D] border-[#20C878]'
                          : 'bg-[#141E18] border-[#26382E] text-[#8EA395] hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY REALTIME BALLOT CARD PREVIEW */}
        <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8EA395]">
            <span className="flex items-center space-x-1.5 font-bold uppercase text-white">
              <span className="w-2 h-2 rounded-full bg-[#20C878] animate-pulse" />
              <span>Realtime Lineup Card</span>
            </span>
            <span>
              {activeConstituency?.code || 'Constituency'}, {currentState.name}
            </span>
          </div>

          {/* RENDERED BALLOT CARD */}
          <div className="flex justify-center p-2 sm:p-3 rounded-2xl bg-[#080D0A] border border-[#1A251E] overflow-hidden">
            <BallotCard
              ref={cardRef}
              lineup={currentLineup}
              stylePreset={currentLineup.stylePreset}
              aspectRatio={currentLineup.aspectRatio}
              interactive={false}
            />
          </div>

          {/* INSTANT DOWNLOAD & SHARE BUTTONS (ZERO TERMS BARRIER) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={handleDownloadCard}
              disabled={isExporting}
              className="w-full py-3 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#08120B] text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Saving PNG...' : 'Download Card'}</span>
            </button>

            <button
              onClick={handleShareOnX}
              className="w-full py-3 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <TwitterIcon className="w-4 h-4 fill-white" />
              <span>Share on X</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </button>
          </div>

          <p className="text-center text-[10px] font-mono text-[#627A6C]">
            Fast · In-browser cache · Zero server load · www.my2027lineup.com
          </p>
        </div>
      </div>
    </div>
  );
}
