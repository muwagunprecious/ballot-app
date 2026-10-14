'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BallotCard } from '@/components/ballot/BallotCard';
import { useBallotStore } from '@/lib/ballot/store';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import { exportBallotAsPng, triggerCelebration } from '@/lib/export';
import { Office } from '@/types/ballot';
import {
  Download,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Share2,
  Clock,
} from 'lucide-react';

const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function WizardPage() {
  const router = useRouter();
  const { currentLineup, updateCurrentLineup, candidates } = useBallotStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const currentState = getStateByCode(currentLineup.stateCode) || NIGERIAN_STATES[0];
  const isFCT = currentLineup.stateCode === 'FC';

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

  const handleStateChange = (newCode: string) => {
    const newState = getStateByCode(newCode);
    if (!newState) return;
    const defaultDist = newState.senatorialDistricts[0]?.id || '';
    const matchingConsts = newState.federalConstituencies.filter((c) => c.senatorialDistrictId === defaultDist);
    const defaultConst = matchingConsts[0]?.id || newState.federalConstituencies[0]?.id || '';

    const newGov = candidates.find((c) => c.office === 'GOVERNOR' && c.stateCode === newCode);
    const newSen = candidates.find((c) => c.office === 'SENATOR' && (c.senatorialDistrictId === defaultDist || c.stateCode === newCode));
    const newRep = candidates.find((c) => c.office === 'REPRESENTATIVE' && (c.federalConstituencyId === defaultConst || c.stateCode === newCode));

    updateCurrentLineup({
      stateCode: newCode,
      senatorialDistrictId: defaultDist,
      federalConstituencyId: defaultConst,
      governorId: newGov?.id,
      senatorId: newSen?.id,
      representativeId: newRep?.id,
    });
  };

  const handleDistrictChange = (distId: string) => {
    const matchingConsts = currentState.federalConstituencies.filter((c) => c.senatorialDistrictId === distId);
    const defaultConst = matchingConsts[0]?.id || currentState.federalConstituencies[0]?.id || '';

    const newSen = candidates.find((c) => c.office === 'SENATOR' && c.senatorialDistrictId === distId);
    const newRep = candidates.find((c) => c.office === 'REPRESENTATIVE' && c.federalConstituencyId === defaultConst);

    updateCurrentLineup({
      senatorialDistrictId: distId,
      federalConstituencyId: defaultConst,
      senatorId: newSen?.id,
      representativeId: newRep?.id,
    });
  };

  const getCandidatesForOffice = (office: Office) => {
    if (office === 'PRESIDENT') return candidates.filter((c) => c.office === 'PRESIDENT');
    if (office === 'GOVERNOR') return candidates.filter((c) => c.office === 'GOVERNOR' && c.stateCode === currentLineup.stateCode);
    if (office === 'SENATOR') return candidates.filter((c) => c.office === 'SENATOR' && (c.senatorialDistrictId === activeDistrict?.id || c.stateCode === currentLineup.stateCode));
    if (office === 'REPRESENTATIVE') return candidates.filter((c) => c.office === 'REPRESENTATIVE' && (c.federalConstituencyId === activeConstituency?.id || c.senatorialDistrictId === activeDistrict?.id || c.stateCode === currentLineup.stateCode));
    return [];
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

  const stepsList = [
    { num: 1, label: 'Location & Name' },
    { num: 2, label: 'President' },
    ...(isFCT ? [] : [{ num: 3, label: 'Governor' }]),
    { num: 4, label: 'Senator' },
    { num: 5, label: 'House of Rep' },
    { num: 6, label: 'Export & Share' },
  ];

  return (
    <div className="space-y-8 pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* 1-LINE STEP BAR */}
      <div className="flex items-center justify-between overflow-x-auto pb-3 border-b border-[#1A251E] gap-2">
        {stepsList.map((s, idx) => {
          const isActive = step === s.num;
          const isPassed = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-[#20C878] text-[#0A110D]'
                  : isPassed
                  ? 'bg-[#19271E] text-[#20C878] border border-[#20C878]/30'
                  : 'bg-[#141E18] text-[#8EA395]'
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{s.label}</span>
              {isPassed && <Check className="w-3 h-3 text-[#20C878]" />}
            </button>
          );
        })}
      </div>

      {/* MAIN TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE STEP FORM */}
        <div className="lg:col-span-6 space-y-6">
          {/* STEP 1: IDENTITY & JURISDICTION */}
          {step === 1 && (
            <div className="p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-[#20C878]">1. State & Constituencies</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#8EA395] mb-1">Your Name</label>
                  <input
                    type="text"
                    value={currentLineup.userName || ''}
                    onChange={(e) => updateCurrentLineup({ userName: e.target.value })}
                    placeholder="Emmanuel Okoegwale"
                    className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#8EA395] mb-1">X Handle</label>
                  <input
                    type="text"
                    value={currentLineup.userHandle || ''}
                    onChange={(e) => updateCurrentLineup({ userHandle: e.target.value })}
                    placeholder="@Em_0098"
                    className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs font-mono focus:outline-hidden focus:border-[#20C878]"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-[#8EA395] mb-1">State</label>
                  <select
                    value={currentLineup.stateCode}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
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
                    className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  >
                    {currentState.senatorialDistricts.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#141E18] text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8EA395] mb-1">Federal Constituency (Rep)</label>
                  <select
                    value={activeConstituency?.id || ''}
                    onChange={(e) => updateCurrentLineup({ federalConstituencyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#141E18] border border-[#26382E] text-white text-xs focus:outline-hidden focus:border-[#20C878]"
                  >
                    {availableConstituencies.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#141E18] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center justify-center space-x-1"
              >
                <span>Continue to President</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PRESIDENT */}
          {step === 2 && (
            <div className="p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-[#20C878]">2. Pick President</h2>

              {/* Undecided option */}
              <div
                onClick={() => updateCurrentLineup({ presidentId: 'undecided' })}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  !currentLineup.presidentId || currentLineup.presidentId === 'undecided'
                    ? 'bg-[#1A261E] border-[#20C878] text-white ring-1 ring-[#20C878]'
                    : 'bg-[#141E18] border-[#26382E] text-[#8EA395]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-white">Not Decided / Undecided</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-gray-300">UNDECIDED</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {getCandidatesForOffice('PRESIDENT').map((cand) => {
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
                      <div className="flex items-center space-x-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cand.partyColor }} />
                        <h4 className="text-xs font-bold text-white">{cand.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black text-white" style={{ backgroundColor: cand.partyColor }}>
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(isFCT ? 4 : 3)}
                  className="flex-1 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center justify-center space-x-1"
                >
                  <span>{isFCT ? 'Continue to Senator' : 'Continue to Governor'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GOVERNOR (NON-FCT) */}
          {step === 3 && !isFCT && (
            <div className="p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-[#20C878]">3. Pick Governor ({currentState.name} State)</h2>

              {/* Undecided option */}
              <div
                onClick={() => updateCurrentLineup({ governorId: 'undecided' })}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  !currentLineup.governorId || currentLineup.governorId === 'undecided'
                    ? 'bg-[#1A261E] border-[#20C878] text-white ring-1 ring-[#20C878]'
                    : 'bg-[#141E18] border-[#26382E] text-[#8EA395]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-white">Not Decided / Undecided</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-gray-300">UNDECIDED</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {getCandidatesForOffice('GOVERNOR').map((cand) => {
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
                      <div className="flex items-center space-x-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cand.partyColor }} />
                        <h4 className="text-xs font-bold text-white">{cand.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black text-white" style={{ backgroundColor: cand.partyColor }}>
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center justify-center space-x-1"
                >
                  <span>Continue to Senator</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SENATOR */}
          {step === 4 && (
            <div className="p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-[#20C878]">4. Pick Senator ({activeDistrict?.name})</h2>

              {/* Undecided option */}
              <div
                onClick={() => updateCurrentLineup({ senatorId: 'undecided' })}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  !currentLineup.senatorId || currentLineup.senatorId === 'undecided'
                    ? 'bg-[#1A261E] border-[#20C878] text-white ring-1 ring-[#20C878]'
                    : 'bg-[#141E18] border-[#26382E] text-[#8EA395]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-white">Not Decided / Undecided</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-gray-300">UNDECIDED</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {getCandidatesForOffice('SENATOR').map((cand) => {
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
                      <div className="flex items-center space-x-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cand.partyColor }} />
                        <h4 className="text-xs font-bold text-white">{cand.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black text-white" style={{ backgroundColor: cand.partyColor }}>
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep(isFCT ? 2 : 3)}
                  className="px-4 py-2.5 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center justify-center space-x-1"
                >
                  <span>Continue to House of Rep</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: HOUSE OF REP */}
          {step === 5 && (
            <div className="p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-[#20C878]">5. Pick House of Rep ({activeConstituency?.name})</h2>

              {/* Undecided option */}
              <div
                onClick={() => updateCurrentLineup({ representativeId: 'undecided' })}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  !currentLineup.representativeId || currentLineup.representativeId === 'undecided'
                    ? 'bg-[#1A261E] border-[#20C878] text-white ring-1 ring-[#20C878]'
                    : 'bg-[#141E18] border-[#26382E] text-[#8EA395]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-white">Not Decided / Undecided</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-gray-300">UNDECIDED</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {getCandidatesForOffice('REPRESENTATIVE').map((cand) => {
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
                      <div className="flex items-center space-x-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cand.partyColor }} />
                        <h4 className="text-xs font-bold text-white">{cand.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black text-white" style={{ backgroundColor: cand.partyColor }}>
                        {cand.partyAcronym}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl bg-[#141E18] border border-[#26382E] text-white text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] text-[#0A110D] text-xs font-black flex items-center justify-center space-x-1"
                >
                  <span>Review & Export</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: EXPORT & SHARE */}
          {step === 6 && (
            <div className="p-5 rounded-2xl bg-[#0E1511] border border-[#1A251E] space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-[#20C878]">6. Lineup Ready to Share</h2>
              <p className="text-xs text-[#8EA395]">Your 2027 election candidates lineup is compiled and ready for social sharing.</p>

              {/* Terms checkbox */}
              <div className="p-3.5 rounded-xl bg-[#141E18] border border-[#26382E] flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="wizard-terms-checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-[#0E1511] text-[#20C878] focus:ring-0 cursor-pointer accent-[#20C878]"
                />
                <label htmlFor="wizard-terms-checkbox" className="text-xs text-[#8EA395] cursor-pointer select-none">
                  I accept the <span className="text-white font-medium underline">Terms of Use & Civic Guidelines</span>. I confirm this card represents my personal lineup choice for social sharing.
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleShareOnX}
                  disabled={!agreedToTerms}
                  className="w-full py-3 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center space-x-2"
                >
                  <TwitterIcon className="w-4 h-4 fill-white" />
                  <span>Share Lineup on X / Twitter</span>
                </button>

                <button
                  onClick={handleDownloadCard}
                  disabled={isExporting || !agreedToTerms}
                  className="w-full py-3 rounded-xl bg-[#20C878] hover:bg-[#1AB36B] disabled:opacity-40 text-[#0A110D] text-xs font-black flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : 'Download Lineup Card (PNG)'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#1A251E] flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-mono text-[#8EA395] hover:text-white"
                >
                  ← Edit Selections
                </button>
                <span className="text-[11px] text-[#637C6D]">Zero hosting cost · In-browser cached</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REALTIME BALLOT CARD */}
        <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8EA395]">
            <span className="text-white font-bold uppercase flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#20C878]" />
              <span>Realtime Lineup Card</span>
            </span>
            <span>{currentState.name} State</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#080D0A] border border-[#1A251E] flex justify-center">
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
    </div>
  );
}
