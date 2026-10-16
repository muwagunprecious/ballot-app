'use client';

import React, { useState, useRef } from 'react';
import { BallotCard } from '@/components/ballot/BallotCard';
import { PartyLogo } from '@/components/ballot/PartyLogo';
import { useBallotStore } from '@/lib/ballot/store';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import { getCandidatesForRace } from '@/lib/data/candidates';
import { exportBallotAsPng, triggerCelebration } from '@/lib/export';
import { CardStylePreset, CardAspectRatio } from '@/types/ballot';
import {
  Download,
  Search,
  ChevronLeft,
  ArrowRight,
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const currentState = getStateByCode(currentLineup.stateCode) || NIGERIAN_STATES[0];
  const isFCT = currentLineup.stateCode === 'FC';

  const activeDistrict =
    currentState.senatorialDistricts.find((d) => d.id === currentLineup.senatorialDistrictId) ||
    currentState.senatorialDistricts[0];

  const availableConstituencies = currentState.federalConstituencies.filter(
    (c) => c.senatorialDistrictId === activeDistrict?.id
  );

  const activeConstituency =
    availableConstituencies.find((c) => c.id === currentLineup.federalConstituencyId) ||
    availableConstituencies[0] ||
    currentState.federalConstituencies[0];

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
      const filename = `my-2027-lineup-${currentLineup.stateCode.toLowerCase()}.png`;
      await exportBallotAsPng(cardRef.current, filename, currentLineup.aspectRatio);
      triggerCelebration();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOnX = () => {
    const constName = activeConstituency?.name || 'Constituency';
    const text = `Here is my 2027 candidates lineup!\n\n📍 ${constName}, ${currentState.name} State\n🗳 Make yours: https://www.my2027lineup.com\n#my2027lineup`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const constName = activeConstituency?.name || 'Constituency';
    const text = `Here is my 2027 candidates lineup! 🇳🇬\n📍 ${constName}, ${currentState.name} State\n🗳 Make yours: https://www.my2027lineup.com\n#my2027lineup`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const steps = [
    { num: 1, label: 'President' },
    { num: 2, label: 'Governor' },
    { num: 3, label: 'Senate' },
    { num: 4, label: 'House' },
    { num: 5, label: 'Card' },
  ];

  const filterList = (list: typeof presidentialCandidates) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.partyAcronym.toLowerCase().includes(q)
    );
  };

  return (
    <div className="pb-16 pt-2 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4">
      {/* MINIMAL PROGRESS STEP TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {steps.map((st) => {
          const isActive = currentStep === st.num;
          const isPassed = currentStep > st.num;
          return (
            <button
              key={st.num}
              onClick={() => {
                setCurrentStep(st.num);
                setSearchQuery('');
              }}
              className={`flex-1 min-w-[70px] py-1.5 px-2.5 rounded-lg border text-center transition-all ${
                isActive
                  ? 'bg-[#192B20] border-[#20C878] text-[#20C878] font-bold'
                  : isPassed
                  ? 'bg-[#111A14] border-[#1F2C23] text-white hover:border-[#334639]'
                  : 'bg-[#0D1310] border-[#18221C] text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-mono">{st.num}. {st.label}</span>
            </button>
          );
        })}
      </div>

      {/* TWO-COLUMN: CLEAN STEP (LEFT) & CARD PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: FOCUSED ACTIVE STEP */}
        <div className="lg:col-span-6 space-y-3">
          {/* ===================== STEP 1: PRESIDENT ===================== */}
          {currentStep === 1 && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#0D1310] border border-[#1A251E] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1A251E]">
                <h3 className="text-sm font-bold text-white">Select President</h3>
                {currentLineup.presidentId && (
                  <button
                    onClick={() => updateCurrentLineup({ presidentId: undefined })}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* SEARCH FILTER */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter candidate or party..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              {/* CLEAN 1-LINE CANDIDATE ROWS */}
              <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                {filterList(presidentialCandidates).map((cand) => {
                  const isSelected = currentLineup.presidentId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ presidentId: cand.id })}
                      className={`px-3 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#18291F] border-[#20C878] text-white'
                          : 'bg-[#121914] border-[#1D2720] text-gray-200 hover:border-[#2D3E32]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#20C878]" />}
                        </div>
                        <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                        <span className="text-xs font-semibold truncate">{cand.name}</span>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shrink-0 ml-2"
                        style={{ backgroundColor: cand.partyColor || '#086338' }}
                      >
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => {
                    setCurrentStep(2);
                    setSearchQuery('');
                  }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Skip
                </button>

                <button
                  onClick={() => {
                    setCurrentStep(2);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ml-auto"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: GOVERNOR ===================== */}
          {currentStep === 2 && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#0D1310] border border-[#1A251E] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1A251E]">
                <h3 className="text-sm font-bold text-white">Select Governor</h3>
                {currentLineup.governorId && (
                  <button
                    onClick={() => updateCurrentLineup({ governorId: undefined })}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* STATE DROPDOWN */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">State</label>
                <select
                  value={currentLineup.stateCode}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code} className="bg-[#131B15] text-white">
                      {s.name} State {s.code === 'FC' ? '(FCT)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {isFCT ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No governorship election in FCT.
                </div>
              ) : (
                <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                  {governorshipCandidates.map((cand) => {
                    const isSelected = currentLineup.governorId === cand.id;
                    return (
                      <div
                        key={cand.id}
                        onClick={() => updateCurrentLineup({ governorId: cand.id })}
                        className={`px-3 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#18291F] border-[#20C878] text-white'
                            : 'bg-[#121914] border-[#1D2720] text-gray-200 hover:border-[#2D3E32]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#20C878]" />}
                          </div>
                          <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                          <span className="text-xs font-semibold truncate">{cand.name}</span>
                        </div>

                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shrink-0 ml-2"
                          style={{ backgroundColor: cand.partyColor || '#086338' }}
                        >
                          {cand.partyAcronym}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 3: SENATORIAL DISTRICT ===================== */}
          {currentStep === 3 && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#0D1310] border border-[#1A251E] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1A251E]">
                <h3 className="text-sm font-bold text-white">Select Senator</h3>
                {currentLineup.senatorId && (
                  <button
                    onClick={() => updateCurrentLineup({ senatorId: undefined })}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* DISTRICT DROPDOWN */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">District</label>
                <select
                  value={activeDistrict?.id || ''}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                >
                  {currentState.senatorialDistricts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#131B15] text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                {senatorialCandidates.map((cand) => {
                  const isSelected = currentLineup.senatorId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ senatorId: cand.id })}
                      className={`px-3 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#18291F] border-[#20C878] text-white'
                          : 'bg-[#121914] border-[#1D2720] text-gray-200 hover:border-[#2D3E32]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#20C878]" />}
                        </div>
                        <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                        <span className="text-xs font-semibold truncate">{cand.name}</span>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shrink-0 ml-2"
                        style={{ backgroundColor: cand.partyColor || '#086338' }}
                      >
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: HOUSE OF REP ===================== */}
          {currentStep === 4 && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#0D1310] border border-[#1A251E] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1A251E]">
                <h3 className="text-sm font-bold text-white">Select House of Reps</h3>
                {currentLineup.representativeId && (
                  <button
                    onClick={() => updateCurrentLineup({ representativeId: undefined })}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* CONSTITUENCY DROPDOWN */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Constituency</label>
                <select
                  value={activeConstituency?.id || ''}
                  onChange={(e) => handleConstituencyChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                >
                  {availableConstituencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#131B15] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                {repCandidates.map((cand) => {
                  const isSelected = currentLineup.representativeId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => updateCurrentLineup({ representativeId: cand.id })}
                      className={`px-3 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#18291F] border-[#20C878] text-white'
                          : 'bg-[#121914] border-[#1D2720] text-gray-200 hover:border-[#2D3E32]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#20C878]" />}
                        </div>
                        <PartyLogo acronym={cand.partyAcronym} size={28} className="shrink-0" />
                        <span className="text-xs font-semibold truncate">{cand.name}</span>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shrink-0 ml-2"
                        style={{ backgroundColor: cand.partyColor || '#086338' }}
                      >
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-3 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] text-[#08120B] text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <span>Finish Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 5: CARD DETAILS & SHARE ===================== */}
          {currentStep === 5 && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#0D1310] border border-[#1A251E] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1A251E]">
                <h3 className="text-sm font-bold text-white">Card Details</h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#20C878] hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* NAME & HANDLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    value={currentLineup.userName || ''}
                    onChange={(e) => updateCurrentLineup({ userName: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Handle (optional)</label>
                  <input
                    type="text"
                    value={currentLineup.userHandle || ''}
                    onChange={(e) => updateCurrentLineup({ userHandle: e.target.value })}
                    placeholder="@handle"
                    className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  />
                </div>
              </div>

              {/* FORMAT & THEME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Format</label>
                  <select
                    value={currentLineup.aspectRatio}
                    onChange={(e) => updateCurrentLineup({ aspectRatio: e.target.value as CardAspectRatio })}
                    className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  >
                    <option value="twitter_landscape">X / Twitter (16:9)</option>
                    <option value="facebook_post">Facebook (1.91:1)</option>
                    <option value="whatsapp_status">WhatsApp Status (9:16)</option>
                    <option value="instagram_square">Instagram (1:1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Theme</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { key: 'obsidian_minimal', label: 'Dark' },
                      { key: 'emerald_classic', label: 'White' },
                      { key: 'civic_heritage', label: 'Heritage' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => updateCurrentLineup({ stylePreset: t.key as CardStylePreset })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                          currentLineup.stylePreset === t.key
                            ? 'bg-[#20C878] text-[#0A110D] border-[#20C878]'
                            : 'bg-[#131B15] border-[#212E25] text-gray-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-[#1A251E]">
                <button
                  onClick={handleDownloadCard}
                  disabled={isExporting}
                  className="w-full py-3 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#08120B] text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PNG...' : 'Download Card'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleShareOnX}
                    className="w-full py-2.5 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <TwitterIcon className="w-3.5 h-3.5 fill-white" />
                    <span>Share on X</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* BACK */}
              <div className="pt-1">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-3 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REALTIME BALLOT CARD PREVIEW */}
        <div className="lg:col-span-6 lg:sticky lg:top-16 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-bold text-white">Live Preview</span>
            <span>
              {activeConstituency?.code || 'Constituency'}, {currentState.name}
            </span>
          </div>

          {/* RENDERED BALLOT CARD */}
          <div className="flex justify-center p-2 rounded-xl bg-[#080D0A] border border-[#1A251E] overflow-hidden">
            <BallotCard
              ref={cardRef}
              lineup={currentLineup}
              stylePreset={currentLineup.stylePreset}
              aspectRatio={currentLineup.aspectRatio}
              interactive={false}
            />
          </div>

          {/* QUICK DOWNLOAD & SHARE */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadCard}
              disabled={isExporting}
              className="py-2.5 rounded-lg bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#08120B] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Saving...' : 'Download'}</span>
            </button>

            <button
              onClick={handleShareOnX}
              className="py-2.5 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <TwitterIcon className="w-3.5 h-3.5 fill-white" />
              <span>Share on X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
