'use client';

import React from 'react';
import { LineupSelection, CardStylePreset, CardAspectRatio } from '@/types/ballot';
import { getCandidateById } from '@/lib/data/candidates';
import { getStateByCode, getSenatorialDistrict, getFederalConstituency } from '@/lib/data/states';
import {
  CheckCircle2,
  AlertCircle,
  Edit3,
  Sparkles,
  LayoutTemplate,
  Ratio,
  ArrowRight,
} from 'lucide-react';

interface StepReviewProps {
  lineup: LineupSelection;
  onUpdateLineup: (updates: Partial<LineupSelection>) => void;
  onJumpToStep: (stepIndex: number) => void;
  onProceedToExport: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  lineup,
  onUpdateLineup,
  onJumpToStep,
  onProceedToExport,
}) => {
  const state = getStateByCode(lineup.stateCode);
  const { district } = getSenatorialDistrict(lineup.stateCode, lineup.senatorialDistrictId);
  const { constituency } = getFederalConstituency(lineup.stateCode, lineup.federalConstituencyId);

  const pres = getCandidateById(lineup.presidentId);
  const gov = getCandidateById(lineup.governorId);
  const sen = getCandidateById(lineup.senatorId);
  const rep = getCandidateById(lineup.representativeId);

  const isFCT = lineup.stateCode === 'FC';

  const stylePresets: { id: CardStylePreset; name: string; desc: string }[] = [
    {
      id: 'emerald_classic',
      name: 'Emerald Classic',
      desc: 'Clean white background, deep emerald green typography, official aesthetic.',
    },
    {
      id: 'obsidian_minimal',
      name: 'Obsidian Dark',
      desc: 'Signature charcoal-black card with sharp emerald accents and high contrast.',
    },
    {
      id: 'civic_heritage',
      name: 'Civic Heritage',
      desc: 'Parchment-toned finish with double border rules and civic seal styling.',
    },
  ];

  const aspectRatios: { id: CardAspectRatio; name: string; ratioLabel: string; platform: string }[] = [
    { id: 'twitter_landscape', name: 'X / Twitter Post', ratioLabel: '1200 × 675 (16:9)', platform: 'X / Twitter' },
    { id: 'instagram_square', name: 'Instagram Square', ratioLabel: '1080 × 1080 (1:1)', platform: 'Instagram Feed' },
    { id: 'instagram_portrait', name: 'Instagram Portrait', ratioLabel: '1080 × 1350 (4:5)', platform: 'IG / WhatsApp Status' },
  ];

  const missingSelections = [
    !pres && 'President',
    !isFCT && !gov && 'Governor',
    !sen && 'Senator',
    !rep && 'House of Representatives',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#27332B] pb-4">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Review Your 2027 Lineup & Card Styling</span>
        </h3>
        <p className="text-xs text-[#A0ADA4] mt-1">
          Verify your candidate selections across all four tiers of government before generating your final high-resolution shareable card.
        </p>
      </div>

      {/* Missing Selections Notice */}
      {missingSelections.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300">
              Incomplete Lineup ({missingSelections.length} missing):
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              You haven&apos;t picked a candidate for: <strong className="text-amber-100">{missingSelections.join(', ')}</strong>.
              You can still proceed, and those slots will appear as &quot;Undecided&quot; on your card.
            </p>
          </div>
        </div>
      )}

      {/* Location Box */}
      <div className="p-4 rounded-xl bg-[#101713] border border-[#27332B] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-[#6D7B71] uppercase">Selected Electoral Zone</span>
          <h4 className="text-sm font-bold text-white mt-0.5">
            {state?.name || 'Nigeria'} State • {district?.name || 'Senatorial District'}
          </h4>
          <p className="text-xs text-[#A0ADA4]">{constituency?.name || 'Federal Constituency'}</p>
        </div>
        <button
          type="button"
          onClick={() => onJumpToStep(0)}
          className="px-3 py-1.5 rounded-lg bg-[#151D18] border border-[#27332B] hover:border-[#20C878] text-xs font-semibold text-[#20C878] flex items-center space-x-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Location</span>
        </button>
      </div>

      {/* Selected Candidates Summary */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase font-bold text-[#A0ADA4]">Selected Candidates (4 Offices)</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* President */}
          <div className="p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">1. President</span>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {pres ? pres.name : <span className="text-[#6D7B71] italic">Undecided</span>}
              </p>
              {pres && (
                <span
                  className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold text-white mt-1"
                  style={{ backgroundColor: pres.partyColor }}
                >
                  {pres.partyAcronym}
                </span>
              )}
            </div>
            <button
              onClick={() => onJumpToStep(1)}
              className="text-[#6D7B71] hover:text-white p-1.5"
              title="Change President"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Governor */}
          <div className="p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">2. Governor</span>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {isFCT ? (
                  <span className="text-[#6D7B71] italic">Not Applicable (FCT)</span>
                ) : gov ? (
                  gov.name
                ) : (
                  <span className="text-[#6D7B71] italic">Undecided</span>
                )}
              </p>
              {gov && (
                <span
                  className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold text-white mt-1"
                  style={{ backgroundColor: gov.partyColor }}
                >
                  {gov.partyAcronym}
                </span>
              )}
            </div>
            {!isFCT && (
              <button
                onClick={() => onJumpToStep(2)}
                className="text-[#6D7B71] hover:text-white p-1.5"
                title="Change Governor"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Senator */}
          <div className="p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">3. Senator</span>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {sen ? sen.name : <span className="text-[#6D7B71] italic">Undecided</span>}
              </p>
              {sen && (
                <span
                  className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold text-white mt-1"
                  style={{ backgroundColor: sen.partyColor }}
                >
                  {sen.partyAcronym}
                </span>
              )}
            </div>
            <button
              onClick={() => onJumpToStep(3)}
              className="text-[#6D7B71] hover:text-white p-1.5"
              title="Change Senator"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Representative */}
          <div className="p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">4. House of Reps</span>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {rep ? rep.name : <span className="text-[#6D7B71] italic">Undecided</span>}
              </p>
              {rep && (
                <span
                  className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold text-white mt-1"
                  style={{ backgroundColor: rep.partyColor }}
                >
                  {rep.partyAcronym}
                </span>
              )}
            </div>
            <button
              onClick={() => onJumpToStep(4)}
              className="text-[#6D7B71] hover:text-white p-1.5"
              title="Change Representative"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Visual Style Preset */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase font-bold text-[#A0ADA4] flex items-center space-x-1.5">
          <LayoutTemplate className="w-4 h-4 text-emerald-400" />
          <span>Card Theme Preset</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stylePresets.map((preset) => {
            const isSelected = (lineup.stylePreset || 'emerald_classic') === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onUpdateLineup({ stylePreset: preset.id })}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#151D18] border-[#20C878] shadow-[0_0_12px_rgba(32,200,120,0.18)]'
                    : 'bg-[#101713] border-[#27332B] hover:border-[#384A3E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{preset.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-[#6D7B71] mt-1">{preset.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Format Switcher */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase font-bold text-[#A0ADA4] flex items-center space-x-1.5">
          <Ratio className="w-4 h-4 text-emerald-400" />
          <span>Export Aspect Ratio & Social Platform</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aspectRatios.map((ratio) => {
            const isSelected = (lineup.aspectRatio || 'twitter_landscape') === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => onUpdateLineup({ aspectRatio: ratio.id })}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#151D18] border-[#20C878] shadow-[0_0_12px_rgba(32,200,120,0.18)]'
                    : 'bg-[#101713] border-[#27332B] hover:border-[#384A3E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{ratio.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">{ratio.ratioLabel}</span>
                <p className="text-[10px] text-[#6D7B71] mt-0.5">{ratio.platform}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 border-t border-[#27332B]">
        <button
          type="button"
          onClick={onProceedToExport}
          className="w-full py-4 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-sm tracking-tight flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(32,200,120,0.3)] hover:scale-[1.01]"
        >
          <span>Generate & Export My 2027 Lineup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
