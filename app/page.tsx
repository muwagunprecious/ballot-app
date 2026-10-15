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
  ChevronLeft,
  Clock,
  ArrowRight,
  User,
  CheckCircle2,
  RotateCcw,
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
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: President, 2: Governor, 3: Senator, 4: Rep, 5: Customize & Download

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

  // Step labels for the navigation progress bar
  const steps = [
    { num: 1, label: 'President', office: 'PRESIDENT' },
    { num: 2, label: 'Governor', office: 'GOVERNOR' },
    { num: 3, label: 'Senator', office: 'SENATOR' },
    { num: 4, label: 'House of Rep', office: 'REPRESENTATIVE' },
    { num: 5, label: 'Card & Share', office: 'CUSTOMIZE' },
  ];

  return (
    <div className="space-y-6 pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* PROGRESS STEP TABS / BREADCRUMBS */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 px-1 custom-scrollbar">
        {steps.map((st) => {
          const isActive = currentStep === st.num;
          const isPassed = currentStep > st.num;
          return (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl border text-center transition-all ${
                isActive
                  ? 'bg-[#192B20] border-[#20C878] text-white shadow-xs ring-1 ring-[#20C878]'
                  : isPassed
                  ? 'bg-[#121C16] border-[#23352A] text-[#20C878] hover:border-[#385141]'
                  : 'bg-[#0E1511] border-[#1A251E] text-[#8EA395] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-1.5 text-xs font-mono font-bold">
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                    isActive
                      ? 'bg-[#20C878] text-[#0A110D]'
                      : isPassed
                      ? 'bg-[#20C878]/20 text-[#20C878]'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {isPassed ? '✓' : st.num}
                </span>
                <span className="truncate">{st.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* TWO-COLUMN STUDIO: ONLY CURRENT SECTION SHOWN (LEFT) & REALTIME BALLOT CARD (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE STEP SECTION */}
        <div className="lg:col-span-6 space-y-4">
          {/* ===================== STEP 1: PRESIDENT ===================== */}
          {currentStep === 1 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Step 1: President of Nigeria
                  </h3>
                </div>
                {currentLineup.presidentId && currentLineup.presidentId !== 'undecided' && (
                  <button
                    onClick={() => updateCurrentLineup({ presidentId: undefined })}
                    className="text-[11px] text-gray-400 hover:text-white underline font-mono"
                  >
                    Clear choice
                  </button>
                )}
              </div>

              <p className="text-xs text-[#8EA395]">
                Pick your preferred candidate from the registered parties (listed alphabetically). Once selected, click <strong className="text-white">Next</strong> to proceed:
              </p>

              {/* CANDIDATES LIST BY PARTIES ALPHABETICALLY */}
              <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {presidentialCandidates.map((cand) => {
                  const isSelected = currentLineup.presidentId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ presidentId: cand.id })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                          : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Radio circle */}
                        <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                        </div>

                        <PartyLogo acronym={cand.partyAcronym} size={30} className="shrink-0" />

                        <div className="truncate">
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
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

              {/* STEP 1 NAVIGATION BUTTONS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-mono text-[#8EA395] hover:text-white underline py-2"
                >
                  Skip for now
                </button>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-black flex items-center space-x-2 transition-all shadow-md ml-auto"
                >
                  <span>Next: Choose Governor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: GOVERNOR ===================== */}
          {currentStep === 2 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Step 2: Governor (State Election)
                  </h3>
                </div>
                {currentLineup.governorId && currentLineup.governorId !== 'undecided' && (
                  <button
                    onClick={() => updateCurrentLineup({ governorId: undefined })}
                    className="text-[11px] text-gray-400 hover:text-white underline font-mono"
                  >
                    Clear choice
                  </button>
                )}
              </div>

              {/* STATE DROPDOWN (ALPHABETICAL, DEFAULT ABIA) */}
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Voting State (Alphabetical · Default: Abia)
                </label>
                <select
                  value={currentLineup.stateCode}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code} className="bg-[#141E18] text-white">
                      {s.name} State {s.code === 'FC' ? '(Federal Jurisdiction)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {isFCT ? (
                <div className="p-4 rounded-xl bg-[#141E18] border border-[#26382E] text-center text-xs text-[#8EA395]">
                  FCT Abuja is under federal jurisdiction. Governorship election does not apply.
                </div>
              ) : (
                <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {governorshipCandidates.map((cand) => {
                    const isSelected = currentLineup.governorId === cand.id;
                    return (
                      <div
                        key={cand.id}
                        onClick={() => updateCurrentLineup({ governorId: cand.id })}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                            : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                          </div>
                          <PartyLogo acronym={cand.partyAcronym} size={30} className="shrink-0" />
                          <div className="truncate">
                            <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
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

              {/* STEP 2 NAVIGATION BUTTONS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-2 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-mono flex items-center space-x-1.5 hover:border-[#385141]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to President</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-black flex items-center space-x-2 transition-all shadow-md"
                >
                  <span>Next: Senatorial District</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 3: SENATORIAL DISTRICT ===================== */}
          {currentStep === 3 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Step 3: Senatorial District
                  </h3>
                </div>
                {currentLineup.senatorId && currentLineup.senatorId !== 'undecided' && (
                  <button
                    onClick={() => updateCurrentLineup({ senatorId: undefined })}
                    className="text-[11px] text-gray-400 hover:text-white underline font-mono"
                  >
                    Clear choice
                  </button>
                )}
              </div>

              {/* SENATORIAL DISTRICT DROPDOWN */}
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Select Senatorial District ({currentState.name} State)
                </label>
                <select
                  value={activeDistrict?.id || ''}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {currentState.senatorialDistricts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#141E18] text-white">
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {senatorialCandidates.map((cand) => {
                  const isSelected = currentLineup.senatorId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ senatorId: cand.id })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                          : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                        </div>
                        <PartyLogo acronym={cand.partyAcronym} size={30} className="shrink-0" />
                        <div className="truncate">
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
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

              {/* STEP 3 NAVIGATION BUTTONS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3.5 py-2 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-mono flex items-center space-x-1.5 hover:border-[#385141]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Governor</span>
                </button>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-black flex items-center space-x-2 transition-all shadow-md"
                >
                  <span>Next: House of Rep</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: HOUSE OF REP ===================== */}
          {currentStep === 4 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Step 4: House of Representatives
                  </h3>
                </div>
                {currentLineup.representativeId && currentLineup.representativeId !== 'undecided' && (
                  <button
                    onClick={() => updateCurrentLineup({ representativeId: undefined })}
                    className="text-[11px] text-gray-400 hover:text-white underline font-mono"
                  >
                    Clear choice
                  </button>
                )}
              </div>

              {/* STRICTLY CONSTRAINED FEDERAL CONSTITUENCY DROPDOWN */}
              <div>
                <label className="block text-[11px] font-mono text-[#8EA395] mb-1">
                  Federal Constituency (In {activeDistrict?.name || 'District'})
                </label>
                <select
                  value={activeConstituency?.id || ''}
                  onChange={(e) => handleConstituencyChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
                >
                  {availableConstituencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141E18] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {repCandidates.map((cand) => {
                  const isSelected = currentLineup.representativeId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ representativeId: cand.id })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#192B20] border-[#20C878] text-white ring-1 ring-[#20C878]'
                          : 'bg-[#141E18] border-[#26382E] text-[#D0DED4] hover:border-[#385141]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                        </div>
                        <PartyLogo acronym={cand.partyAcronym} size={30} className="shrink-0" />
                        <div className="truncate">
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
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

              {/* STEP 4 NAVIGATION BUTTONS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-3.5 py-2 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-mono flex items-center space-x-1.5 hover:border-[#385141]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Senator</span>
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-black flex items-center space-x-2 transition-all shadow-md"
                >
                  <span>Next: Customize Card</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 5: CUSTOMIZE & SHARE ===================== */}
          {currentStep === 5 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#20C878]/20 text-[#20C878] text-[11px] font-mono font-bold flex items-center justify-center">
                    5
                  </span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Step 5: Customize & Share Card
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#20C878] hover:underline font-mono flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Edit Candidates</span>
                </button>
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
                    className="w-full px-3 py-2.5 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
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
                    className="w-full px-3 py-2.5 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-mono focus:outline-hidden focus:border-[#20C878]"
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
                    className="w-full px-3 py-2.5 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-medium focus:outline-hidden focus:border-[#20C878]"
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
                        className={`py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all border ${
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

              {/* PRIMARY ACTION BUTTONS */}
              <div className="space-y-2.5 pt-2 border-t border-[#1A251E]">
                <button
                  onClick={handleDownloadCard}
                  disabled={isExporting}
                  className="w-full py-3.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#08120B] text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PNG...' : 'Download Card (PNG)'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleShareOnX}
                    className="w-full py-2.5 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                  >
                    <TwitterIcon className="w-3.5 h-3.5 fill-white" />
                    <span>Share on X</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* BACK BUTTON */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-3.5 py-2 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-mono flex items-center space-x-1.5 hover:border-[#385141]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to House of Rep</span>
                </button>
              </div>
            </div>
          )}
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

          {/* QUICK ACTION BAR */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadCard}
              disabled={isExporting}
              className="py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#08120B] text-xs font-black flex items-center justify-center space-x-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Saving...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handleShareOnX}
              className="py-2.5 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md"
            >
              <TwitterIcon className="w-3.5 h-3.5 fill-white" />
              <span>Share on X</span>
            </button>
          </div>

          <p className="text-center text-[10px] font-mono text-[#627A6C]">
            Fast · Instant preview · Zero server load · www.my2027lineup.com
          </p>
        </div>
      </div>
    </div>
  );
}
