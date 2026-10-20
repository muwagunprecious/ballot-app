'use client';

import React, { useState, useRef } from 'react';
import { BallotCard } from '@/components/ballot/BallotCard';
import { PartyLogo } from '@/components/ballot/PartyLogo';
import { useBallotStore } from '@/lib/ballot/store';
import {
  NIGERIAN_STATES,
  getStateByCode,
  GOVERNORSHIP_STATES,
  OFF_CYCLE_GOV_STATE_CODES,
} from '@/lib/data/states';
import { getCandidatesForRace } from '@/lib/data/candidates';
import { exportBallotAsPng, triggerCelebration } from '@/lib/export';
import { CardStylePreset, CardAspectRatio } from '@/types/ballot';
import {
  Download,
  Search,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  X,
  Vote,
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

type OfficeType = 'PRESIDENT' | 'GOVERNOR' | 'SENATOR' | 'REPRESENTATIVE';

export default function HomePage() {
  const { currentLineup, updateCurrentLineup } = useBallotStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeModal, setActiveModal] = useState<OfficeType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentState = getStateByCode(currentLineup.stateCode) || NIGERIAN_STATES[0];
  const isOffCycleGov = OFF_CYCLE_GOV_STATE_CODES.includes(currentLineup.stateCode);

  // Senatorial District: strictly use selection, NO default fallback
  const activeDistrict = currentLineup.senatorialDistrictId
    ? currentState.senatorialDistricts.find((d) => d.id === currentLineup.senatorialDistrictId)
    : undefined;

  // Available constituencies: ONLY those belonging to the selected senatorial district
  const availableConstituencies = activeDistrict
    ? currentState.federalConstituencies.filter((c) => c.senatorialDistrictId === activeDistrict.id)
    : [];

  // Federal Constituency: strictly use selection, NO default fallback
  const activeConstituency = currentLineup.federalConstituencyId
    ? availableConstituencies.find((c) => c.id === currentLineup.federalConstituencyId)
    : undefined;

  const presidentialCandidates = getCandidatesForRace({ office: 'PRESIDENT' });

  const governorshipCandidates = isOffCycleGov
    ? []
    : getCandidatesForRace({ office: 'GOVERNOR', stateCode: currentLineup.stateCode });

  const senatorialCandidates = activeDistrict
    ? getCandidatesForRace({
        office: 'SENATOR',
        stateCode: currentLineup.stateCode,
        senatorialDistrictId: activeDistrict.id,
      })
    : [];

  const repCandidates = activeConstituency
    ? getCandidatesForRace({
        office: 'REPRESENTATIVE',
        stateCode: currentLineup.stateCode,
        senatorialDistrictId: activeDistrict?.id,
        federalConstituencyId: activeConstituency.id,
      })
    : [];

  const selectedPresident = presidentialCandidates.find((c) => c.id === currentLineup.presidentId);
  const selectedGovernor = governorshipCandidates.find((c) => c.id === currentLineup.governorId);
  const selectedSenator = senatorialCandidates.find((c) => c.id === currentLineup.senatorId);
  const selectedRep = repCandidates.find((c) => c.id === currentLineup.representativeId);

  // Cascading update: Changing State resets Senate and House selections
  const handleStateChange = (newCode: string) => {
    const newState = getStateByCode(newCode);
    if (!newState) return;

    updateCurrentLineup({
      stateCode: newCode,
      senatorialDistrictId: undefined,
      federalConstituencyId: undefined,
      governorId: undefined,
      senatorId: undefined,
      representativeId: undefined,
    });
  };

  // Cascading update: Changing Senatorial District makes House selection blank and requires an update
  const handleDistrictChange = (distId: string) => {
    updateCurrentLineup({
      senatorialDistrictId: distId || undefined,
      federalConstituencyId: undefined,
      senatorId: undefined,
      representativeId: undefined,
    });
  };

  // Constituency change
  const handleConstituencyChange = (constId: string) => {
    updateCurrentLineup({
      federalConstituencyId: constId || undefined,
      representativeId: undefined,
    });
  };

  const handleCandidateSelect = (candId: string) => {
    if (activeModal === 'PRESIDENT') {
      updateCurrentLineup({ presidentId: candId });
      setActiveModal(null);
      setCurrentStep(2);
    } else if (activeModal === 'GOVERNOR') {
      updateCurrentLineup({ governorId: candId });
      setActiveModal(null);
      setCurrentStep(3);
    } else if (activeModal === 'SENATOR') {
      updateCurrentLineup({ senatorId: candId });
      setActiveModal(null);
      setCurrentStep(4);
    } else if (activeModal === 'REPRESENTATIVE') {
      updateCurrentLineup({ representativeId: candId });
      setActiveModal(null);
      setCurrentStep(5);
    }
  };

  const getModalCandidates = () => {
    let list: typeof presidentialCandidates = [];
    if (activeModal === 'PRESIDENT') list = presidentialCandidates;
    else if (activeModal === 'GOVERNOR') list = governorshipCandidates;
    else if (activeModal === 'SENATOR') list = senatorialCandidates;
    else if (activeModal === 'REPRESENTATIVE') list = repCandidates;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.partyAcronym.toLowerCase().includes(q)
    );
  };

  const getModalTitle = () => {
    if (activeModal === 'PRESIDENT') return 'Select President';
    if (activeModal === 'GOVERNOR') return `Select State's Governorship Candidate (${currentState.name} State)`;
    if (activeModal === 'SENATOR') return `Select Senator (${activeDistrict?.name || 'District'})`;
    if (activeModal === 'REPRESENTATIVE') return `Select Representative (${activeConstituency?.name || 'Constituency'})`;
    return '';
  };

  const getModalSelectedId = () => {
    if (activeModal === 'PRESIDENT') return currentLineup.presidentId;
    if (activeModal === 'GOVERNOR') return currentLineup.governorId;
    if (activeModal === 'SENATOR') return currentLineup.senatorId;
    if (activeModal === 'REPRESENTATIVE') return currentLineup.representativeId;
    return undefined;
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
    const locText = activeDistrict ? `${activeDistrict.name}, ${currentState.name} State` : `${currentState.name} State`;
    const text = `Here is my 2027 ballot line-up Nigeria!\n\n📍 ${locText}\n🗳 Make yours: https://www.2027lineup.com\n#My2027Lineup`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const locText = activeDistrict ? `${activeDistrict.name}, ${currentState.name} State` : `${currentState.name} State`;
    const text = `Here is my 2027 ballot line-up Nigeria! 🇳🇬\n📍 ${locText}\n🗳 Make yours: https://www.2027lineup.com\n#My2027Lineup`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const steps = [
    { num: 1, label: 'President' },
    { num: 2, label: 'Governor' },
    { num: 3, label: 'Senate' },
    { num: 4, label: 'House' },
    { num: 5, label: 'Customize Card' },
  ];

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
                setActiveModal(null);
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
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1310] border border-[#1A251E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div>
                  <h3 className="text-base font-bold text-white">Select President</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Choose your 2027 presidential candidate.</p>
                </div>
                {currentLineup.presidentId && (
                  <button
                    onClick={() => updateCurrentLineup({ presidentId: undefined })}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#131B15] border border-[#212E25]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* CARD SELECTOR */}
              {selectedPresident ? (
                <div
                  onClick={() => {
                    setActiveModal('PRESIDENT');
                    setSearchQuery('');
                  }}
                  className="p-4 rounded-xl bg-[#14231A] border-2 border-[#20C878] cursor-pointer hover:bg-[#182C20] transition-all flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <PartyLogo acronym={selectedPresident.partyAcronym} size={36} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#20C878] font-bold uppercase tracking-wider">Presidential Choice</div>
                      <div className="text-sm sm:text-base font-bold text-white break-words">{selectedPresident.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white"
                      style={{ backgroundColor: selectedPresident.partyColor || '#086338' }}
                    >
                      {selectedPresident.partyAcronym}
                    </span>
                    <span className="text-xs text-[#20C878] group-hover:underline font-bold ml-1">Change →</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('PRESIDENT');
                    setSearchQuery('');
                  }}
                  className="w-full p-5 rounded-xl bg-[#121A15] border-2 border-dashed border-[#233529] hover:border-[#20C878] hover:bg-[#16241C] cursor-pointer transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1A261E] border border-[#2A3E31] flex items-center justify-center text-[#20C878] group-hover:scale-105 transition-transform">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white group-hover:text-[#20C878] transition-colors">
                        Select President
                      </div>
                      <div className="text-xs text-gray-400">Click to view all 22 candidates</div>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-[#20C878] text-[#08120B] text-xs font-bold flex items-center space-x-1 group-hover:bg-[#1AB36B] transition-colors">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              )}

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  (Undecided) Skip
                </button>

                <button
                  onClick={() => setCurrentStep(2)}
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
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1310] border border-[#1A251E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div>
                  <h3 className="text-base font-bold text-white">Select Governor</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Select State&apos;s Governorship candidate.</p>
                </div>
                {currentLineup.governorId && (
                  <button
                    onClick={() => updateCurrentLineup({ governorId: undefined })}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#131B15] border border-[#212E25]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* STATE DROPDOWN (ONLY 28 CONDUCTING STATES) */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">State (2027 Governorship Elections)</label>
                <select
                  value={isOffCycleGov ? '' : currentLineup.stateCode}
                  onChange={(e) => {
                    if (e.target.value) handleStateChange(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                >
                  {isOffCycleGov && (
                    <option value="" disabled className="bg-[#131B15] text-gray-400">
                      {currentState.name} State (Off-cycle - No election)
                    </option>
                  )}
                  {GOVERNORSHIP_STATES.map((s) => (
                    <option key={s.code} value={s.code} className="bg-[#131B15] text-white">
                      {s.name} State
                    </option>
                  ))}
                </select>
              </div>

              {isOffCycleGov ? (
                <div className="p-4 rounded-xl bg-[#121A15] border border-[#1F2C23] text-center text-xs text-gray-400 space-y-1">
                  <p className="font-semibold text-amber-400">
                    No governorship election in {currentState.name} State in 2027.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {currentLineup.stateCode === 'FC'
                      ? 'The Federal Capital Territory does not have a Governor.'
                      : `${currentState.name} is one of 8 off-cycle states with a separate election timetable.`}
                  </p>
                </div>
              ) : selectedGovernor ? (
                <div
                  onClick={() => {
                    setActiveModal('GOVERNOR');
                    setSearchQuery('');
                  }}
                  className="p-4 rounded-xl bg-[#14231A] border-2 border-[#20C878] cursor-pointer hover:bg-[#182C20] transition-all flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <PartyLogo acronym={selectedGovernor.partyAcronym} size={36} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#20C878] font-bold uppercase tracking-wider">Governorship Choice</div>
                      <div className="text-sm sm:text-base font-bold text-white break-words">{selectedGovernor.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white"
                      style={{ backgroundColor: selectedGovernor.partyColor || '#086338' }}
                    >
                      {selectedGovernor.partyAcronym}
                    </span>
                    <span className="text-xs text-[#20C878] group-hover:underline font-bold ml-1">Change →</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('GOVERNOR');
                    setSearchQuery('');
                  }}
                  className="w-full p-5 rounded-xl bg-[#121A15] border-2 border-dashed border-[#233529] hover:border-[#20C878] hover:bg-[#16241C] cursor-pointer transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1A261E] border border-[#2A3E31] flex items-center justify-center text-[#20C878] group-hover:scale-105 transition-transform">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white group-hover:text-[#20C878] transition-colors">
                        Select Governor
                      </div>
                      <div className="text-xs text-gray-400">Click to choose candidate for {currentState.name} State</div>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-[#20C878] text-[#08120B] text-xs font-bold flex items-center space-x-1 group-hover:bg-[#1AB36B] transition-colors">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
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

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    (Undecided) Skip
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
            </div>
          )}

          {/* ===================== STEP 3: SENATORIAL DISTRICT ===================== */}
          {currentStep === 3 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1310] border border-[#1A251E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div>
                  <h3 className="text-base font-bold text-white">Select Senator</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeDistrict ? `Pick senator for ${activeDistrict.name}.` : `Select senatorial district in ${currentState.name} State.`}
                  </p>
                </div>
                {currentLineup.senatorId && (
                  <button
                    onClick={() => updateCurrentLineup({ senatorId: undefined })}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#131B15] border border-[#212E25]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* DISTRICT DROPDOWN - NO PRE-SELECTION */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Senatorial District ({currentState.name} State)</label>
                <select
                  value={currentLineup.senatorialDistrictId || ''}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                >
                  <option value="" className="bg-[#131B15] text-gray-400">
                    -- Select Senatorial District --
                  </option>
                  {currentState.senatorialDistricts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#131B15] text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSenator ? (
                <div
                  onClick={() => {
                    setActiveModal('SENATOR');
                    setSearchQuery('');
                  }}
                  className="p-4 rounded-xl bg-[#14231A] border-2 border-[#20C878] cursor-pointer hover:bg-[#182C20] transition-all flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <PartyLogo acronym={selectedSenator.partyAcronym} size={36} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#20C878] font-bold uppercase tracking-wider">Senatorial Choice</div>
                      <div className="text-sm sm:text-base font-bold text-white break-words">{selectedSenator.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white"
                      style={{ backgroundColor: selectedSenator.partyColor || '#086338' }}
                    >
                      {selectedSenator.partyAcronym}
                    </span>
                    <span className="text-xs text-[#20C878] group-hover:underline font-bold ml-1">Change →</span>
                  </div>
                </div>
              ) : activeDistrict ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('SENATOR');
                    setSearchQuery('');
                  }}
                  className="w-full p-5 rounded-xl bg-[#121A15] border-2 border-dashed border-[#233529] hover:border-[#20C878] hover:bg-[#16241C] cursor-pointer transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1A261E] border border-[#2A3E31] flex items-center justify-center text-[#20C878] group-hover:scale-105 transition-transform">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white group-hover:text-[#20C878] transition-colors">
                        Select Senator
                      </div>
                      <div className="text-xs text-gray-400">Click to choose candidate for {activeDistrict.name}</div>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-[#20C878] text-[#08120B] text-xs font-bold flex items-center space-x-1 group-hover:bg-[#1AB36B] transition-colors">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-[#121A15] border border-[#1F2C23] text-center text-xs text-gray-400">
                  Please select a Senatorial District above to view candidates.
                </div>
              )}

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    (Undecided) Skip
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
            </div>
          )}

          {/* ===================== STEP 4: HOUSE OF REP ===================== */}
          {currentStep === 4 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1310] border border-[#1A251E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div>
                  <h3 className="text-base font-bold text-white">Select House of Reps</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeConstituency
                      ? `Pick representative for ${activeConstituency.name}.`
                      : activeDistrict
                      ? `Select constituency within ${activeDistrict.name}.`
                      : 'Select senatorial district first.'}
                  </p>
                </div>
                {currentLineup.representativeId && (
                  <button
                    onClick={() => updateCurrentLineup({ representativeId: undefined })}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#131B15] border border-[#212E25]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {!currentLineup.senatorialDistrictId ? (
                <div className="p-4 rounded-xl bg-[#121A15] border border-[#1F2C23] text-center text-xs text-gray-400 space-y-2">
                  <p>Please select a Senatorial District in Step 3 first.</p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-3 py-1.5 rounded-lg bg-[#20C878] text-[#08120B] font-bold text-xs"
                  >
                    ← Back to Step 3 (Senate)
                  </button>
                </div>
              ) : (
                <>
                  {/* CONSTITUENCY DROPDOWN (ONLY CONSTITUENCIES IN THIS SENATORIAL DISTRICT) */}
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Federal Constituency ({activeDistrict?.name})
                    </label>
                    <select
                      value={currentLineup.federalConstituencyId || ''}
                      onChange={(e) => handleConstituencyChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                    >
                      <option value="" className="bg-[#131B15] text-gray-400">
                        -- Select Federal Constituency --
                      </option>
                      {availableConstituencies.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#131B15] text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRep ? (
                    <div
                      onClick={() => {
                        setActiveModal('REPRESENTATIVE');
                        setSearchQuery('');
                      }}
                      className="p-4 rounded-xl bg-[#14231A] border-2 border-[#20C878] cursor-pointer hover:bg-[#182C20] transition-all flex items-center justify-between group shadow-lg"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <PartyLogo acronym={selectedRep.partyAcronym} size={36} className="shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] text-[#20C878] font-bold uppercase tracking-wider">Representative Choice</div>
                          <div className="text-sm sm:text-base font-bold text-white break-words">{selectedRep.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white"
                          style={{ backgroundColor: selectedRep.partyColor || '#086338' }}
                        >
                          {selectedRep.partyAcronym}
                        </span>
                        <span className="text-xs text-[#20C878] group-hover:underline font-bold ml-1">Change →</span>
                      </div>
                    </div>
                  ) : activeConstituency ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal('REPRESENTATIVE');
                        setSearchQuery('');
                      }}
                      className="w-full p-5 rounded-xl bg-[#121A15] border-2 border-dashed border-[#233529] hover:border-[#20C878] hover:bg-[#16241C] cursor-pointer transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#1A261E] border border-[#2A3E31] flex items-center justify-center text-[#20C878] group-hover:scale-105 transition-transform">
                          <Vote className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-white group-hover:text-[#20C878] transition-colors">
                            Select Representative
                          </div>
                          <div className="text-xs text-gray-400">Click to choose candidate for {activeConstituency.name}</div>
                        </div>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-lg bg-[#20C878] text-[#08120B] text-xs font-bold flex items-center space-x-1 group-hover:bg-[#1AB36B] transition-colors">
                        <span>Select</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#121A15] border border-[#1F2C23] text-center text-xs text-gray-400">
                      Please select a Federal Constituency above to view candidates.
                    </div>
                  )}
                </>
              )}

              {/* CONTROLS */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1A251E]">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-3 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    (Undecided) Skip
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
            </div>
          )}

          {/* ===================== STEP 5: CUSTOMIZE CARD ===================== */}
          {currentStep === 5 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1310] border border-[#1A251E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A251E]">
                <div>
                  <h3 className="text-base font-bold text-white">Customize Card</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Enter details, pick platform format, and generate.</p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#20C878] hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Edit Lineup</span>
                </button>
              </div>

              {/* STRICT REQUIRED ORDER: Name (1st) -> Format (2nd) -> Handle (3rd) -> Theme (4th) */}
              <div className="space-y-3.5">
                {/* 1. NAME (FIRST) */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">1. Your Name (optional)</label>
                  <input
                    type="text"
                    value={currentLineup.userName || ''}
                    onChange={(e) => updateCurrentLineup({ userName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  />
                </div>

                {/* 2. FORMAT (SECOND) */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">2. Social Media Platform / Format</label>
                  <select
                    value={currentLineup.aspectRatio}
                    onChange={(e) => updateCurrentLineup({ aspectRatio: e.target.value as CardAspectRatio })}
                    className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  >
                    <option value="twitter_landscape">X / Twitter Landscape (16:9)</option>
                    <option value="whatsapp_status">WhatsApp Status / Stories (9:16)</option>
                    <option value="facebook_post">Facebook Feed Post (1.91:1)</option>
                    <option value="instagram_square">Instagram Square (1:1)</option>
                  </select>
                </div>

                {/* 3. SOCIAL MEDIA HANDLE (THIRD) */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">3. Social Media Handle (optional)</label>
                  <input
                    type="text"
                    value={currentLineup.userHandle || ''}
                    onChange={(e) => updateCurrentLineup({ userHandle: e.target.value })}
                    placeholder="@handle"
                    className="w-full px-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  />
                </div>

                {/* 4. THEME (FOURTH) */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">4. Card Theme</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'obsidian_minimal', label: 'Dark' },
                      { key: 'emerald_classic', label: 'White' },
                      { key: 'civic_heritage', label: 'Heritage' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => updateCurrentLineup({ stylePreset: t.key as CardStylePreset })}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
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

              {/* ACTION BUTTON: THE ONLY PRIMARY GENERATE BUTTON IN USER SECTION */}
              <div className="space-y-2.5 pt-3 border-t border-[#1A251E]">
                <button
                  onClick={handleDownloadCard}
                  disabled={isExporting}
                  className="w-full py-3.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#08120B] text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PNG...' : 'Generate Ballot Card'}</span>
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
            <span className="font-bold text-white">Live Lineup Card</span>
            <span>
              {activeDistrict ? `${activeDistrict.name}, ` : ''}{currentState.name} State
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
        </div>
      </div>

      {/* ===================== CANDIDATE POPUP MODAL ===================== */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveModal(null);
            }
          }}
        >
          <div className="bg-[#0D1410] border border-[#213025] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* MODAL HEADER */}
            <div className="p-4 border-b border-[#1A251E] flex items-center justify-between bg-[#111A14]">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{getModalTitle()}</h3>
                <p className="text-xs text-[#20C878] mt-0.5">Click candidate to select and go to next step</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A251E] transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEARCH BAR */}
            <div className="p-3 border-b border-[#1A251E] bg-[#0A0F0C]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter candidate or party..."
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                />
              </div>
            </div>

            {/* CANDIDATE LIST */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {getModalCandidates().map((cand) => {
                const isSelected = getModalSelectedId() === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => handleCandidateSelect(cand.id)}
                    className={`px-3 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18291F] border-[#20C878] text-white shadow-sm'
                        : 'bg-[#121914] border-[#1D2720] text-gray-200 hover:border-[#20C878] hover:bg-[#16231A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center shrink-0">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#20C878]" />}
                      </div>
                      <PartyLogo acronym={cand.partyAcronym} size={30} className="shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-white break-words">{cand.name}</span>
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

              {getModalCandidates().length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">
                  No candidates match your search.
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3 border-t border-[#1A251E] bg-[#0A0F0C] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  if (activeModal === 'PRESIDENT') setCurrentStep(2);
                  else if (activeModal === 'GOVERNOR') setCurrentStep(3);
                  else if (activeModal === 'SENATOR') setCurrentStep(4);
                  else if (activeModal === 'REPRESENTATIVE') setCurrentStep(5);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                (Undecided) Skip →
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#131B15] border border-[#212E25] text-white text-xs hover:bg-[#1A251E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
