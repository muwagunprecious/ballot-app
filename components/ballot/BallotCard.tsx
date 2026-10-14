'use client';

import React, { forwardRef } from 'react';
import { LineupSelection, CardStylePreset, CardAspectRatio } from '@/types/ballot';
import { getCandidateById } from '@/lib/data/candidates';
import { getStateByCode, getSenatorialDistrict, getFederalConstituency } from '@/lib/data/states';
import { LandmarkSvg } from './LandmarkSvg';

interface BallotCardProps {
  lineup: LineupSelection;
  stylePreset?: CardStylePreset;
  aspectRatio?: CardAspectRatio;
  interactive?: boolean;
  onOfficeClick?: (office: 'PRESIDENT' | 'GOVERNOR' | 'SENATOR' | 'REPRESENTATIVE') => void;
}

export const BallotCard = forwardRef<HTMLDivElement, BallotCardProps>(({
  lineup,
  stylePreset = lineup.stylePreset || 'emerald_classic',
  aspectRatio = lineup.aspectRatio || 'twitter_landscape',
  interactive = false,
  onOfficeClick,
}, ref) => {
  const state = getStateByCode(lineup.stateCode);
  const { district } = getSenatorialDistrict(lineup.stateCode, lineup.senatorialDistrictId);
  const { constituency } = getFederalConstituency(lineup.stateCode, lineup.federalConstituencyId);

  const isPresUndecided = !lineup.presidentId || lineup.presidentId === 'undecided';
  const isGovUndecided = !lineup.governorId || lineup.governorId === 'undecided';
  const isSenUndecided = !lineup.senatorId || lineup.senatorId === 'undecided';
  const isRepUndecided = !lineup.representativeId || lineup.representativeId === 'undecided';

  const pres = isPresUndecided ? undefined : getCandidateById(lineup.presidentId);
  const gov = isGovUndecided ? undefined : getCandidateById(lineup.governorId);
  const sen = isSenUndecided ? undefined : getCandidateById(lineup.senatorId);
  const rep = isRepUndecided ? undefined : getCandidateById(lineup.representativeId);

  const isFCT = lineup.stateCode === 'FC';
  const isDark = stylePreset === 'obsidian_minimal';
  const isHeritage = stylePreset === 'civic_heritage';

  // Responsive dimensions for various platforms (Twitter, Instagram, WhatsApp status)
  const getContainerClasses = () => {
    switch (aspectRatio) {
      case 'twitter_landscape':
        return 'w-full max-w-[760px] min-h-[440px]';
      case 'instagram_square':
        return 'w-full max-w-[560px] min-h-[560px]';
      case 'instagram_portrait':
      case 'whatsapp_portrait':
        return 'w-full max-w-[500px] min-h-[600px]';
      case 'whatsapp_status':
        return 'w-full max-w-[440px] min-h-[700px]';
      default:
        return 'w-full max-w-[760px] min-h-[440px]';
    }
  };

  // Theme color tokens
  const cardBg = isDark
    ? 'bg-[#0E1511] text-[#F5F7F5]'
    : isHeritage
    ? 'bg-[#FAF8F5] text-[#14231A]'
    : 'bg-[#FFFFFF] text-[#0D1812]';

  const outerBorder = isDark
    ? 'border-[#26382E]'
    : isHeritage
    ? 'border-[#C2CFC6]'
    : 'border-[#086338]/30 shadow-2xl';

  const boxBg = isDark
    ? 'bg-[#141E18] border-[#25392D]'
    : isHeritage
    ? 'bg-[#F2ECE4] border-[#D3DDD7]'
    : 'bg-[#F8FAF9] border-[#D9E5DE]';

  const accentColor = isDark ? '#20C878' : '#086338';
  const mutedText = isDark ? 'text-[#8EA395]' : 'text-[#4F6859]';
  const watermarkOpacity = isDark ? 0.04 : 0.06;

  // Format user attribution
  const userName = lineup.userName || 'Emmanuel Okoegwale';
  const userHandle = lineup.userHandle ? (lineup.userHandle.startsWith('@') ? lineup.userHandle : `@${lineup.userHandle}`) : '@Em_0098';

  // Format location string
  const districtName = district?.name || 'Central';
  const constName = constituency?.name || 'Constituency';
  const locationHeader = isFCT
    ? `FCT ABUJA · ${constName.toUpperCase()}`
    : `${(state?.name || 'ABIA').toUpperCase()} · ${districtName.toUpperCase()} / ${constName.toUpperCase()}`;

  const renderSlot = (
    icon: string,
    title: string,
    candidate?: ReturnType<typeof getCandidateById>,
    isUndecided: boolean = false,
    subtitle?: string,
    disabled = false,
    officeKey?: 'PRESIDENT' | 'GOVERNOR' | 'SENATOR' | 'REPRESENTATIVE'
  ) => {
    return (
      <div
        onClick={() => interactive && officeKey && onOfficeClick && onOfficeClick(officeKey)}
        className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border ${boxBg} transition-all ${
          interactive ? 'cursor-pointer hover:border-[#20C878] hover:shadow-md' : ''
        }`}
      >
        {/* Slot Top Bar */}
        <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center space-x-1.5">
            <span className="text-[12px]">{icon}</span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase" style={{ color: accentColor }}>
              {title}
            </span>
          </div>
          {subtitle && (
            <span className={`text-[9px] font-mono uppercase font-semibold truncate max-w-[130px] sm:max-w-[180px] ${mutedText}`}>
              {subtitle}
            </span>
          )}
        </div>

        {/* Slot Content: Pure text-first candidate name + party, no images */}
        {disabled ? (
          <div className="py-3 text-center my-auto">
            <span className={`text-xs italic font-medium ${mutedText}`}>Office not applicable (FCT Federal Jurisdiction)</span>
          </div>
        ) : !isUndecided && candidate ? (
          <div className="my-auto py-2 space-y-1.5">
            <h4 className="text-sm sm:text-base font-extrabold tracking-tight truncate leading-snug text-black dark:text-white">
              {candidate.name}
            </h4>
            <div className="flex items-center space-x-2">
              <span
                className="px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black text-white tracking-wider shadow-2xs"
                style={{ backgroundColor: candidate.partyColor || '#086338' }}
              >
                {candidate.partyAcronym}
              </span>
              <span className={`text-[11px] font-medium truncate ${mutedText}`}>
                {candidate.partyId ? candidate.partyId.toUpperCase() : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="my-auto py-2 space-y-1.5">
            <h4 className="text-sm sm:text-base font-bold italic tracking-tight text-gray-400 dark:text-gray-500">
              Not Decided
            </h4>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-mono font-semibold text-gray-600 dark:text-gray-400">
                UNDECIDED
              </span>
              <span className={`text-[10px] ${mutedText}`}>
                {interactive ? 'Tap to choose' : 'Voter undecided'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      id="ballot-card-export-target"
      className={`relative overflow-hidden rounded-2xl border-2 ${cardBg} ${outerBorder} flex flex-col justify-between select-none ${getContainerClasses()}`}
    >
      {/* Background Landmark Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <LandmarkSvg
          type={state?.landmarkSvgType || 'generic_monument'}
          className="w-[110%] h-[110%] object-contain"
          opacity={watermarkOpacity}
          color={accentColor}
        />
      </div>

      {/* CARD HEADER */}
      <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg">🗳</span>
              <h2 className="text-sm sm:text-base font-black tracking-wider uppercase font-mono" style={{ color: accentColor }}>
                MY 2027 CANDIDATES LINEUP
              </h2>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wide uppercase text-[#086338] dark:text-[#20C878]">
              {locationHeader}
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <p className={`text-[10px] sm:text-[11px] font-medium ${mutedText}`}>
              Generating: <span className="font-bold text-black dark:text-white">{userName}</span>{' '}
              <span className="font-mono font-semibold" style={{ color: accentColor }}>{userHandle}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 CANDIDATE BOXES GRID */}
      <div className="relative z-10 p-3.5 sm:p-5 flex-1 flex flex-col justify-center">
        <div
          className={`grid gap-2.5 sm:gap-3 ${
            aspectRatio === 'twitter_landscape' || aspectRatio === 'instagram_square'
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {renderSlot('🇳🇬', 'PRESIDENT', pres, isPresUndecided, 'Federal Republic', false, 'PRESIDENT')}
          {renderSlot('🏛', 'GOVERNOR', gov, isGovUndecided, isFCT ? 'N/A (FCT)' : `${state?.name || ''} State`, isFCT, 'GOVERNOR')}
          {renderSlot('📜', 'SENATOR', sen, isSenUndecided, district?.code || districtName, false, 'SENATOR')}
          {renderSlot('🏛', 'HOUSE OF REP', rep, isRepUndecided, constituency?.code || constName, false, 'REPRESENTATIVE')}
        </div>
      </div>

      {/* CARD FOOTER */}
      <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] sm:text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-semibold opacity-90">
            Generate yours on X / Twitter —
          </span>
          <span className="font-mono font-black" style={{ color: accentColor }}>
            #My2027lineup
          </span>
        </div>
        <div className="font-mono font-bold opacity-75 hidden sm:block">
          #NaijaElections2027
        </div>
      </div>
    </div>
  );
});

BallotCard.displayName = 'BallotCard';
