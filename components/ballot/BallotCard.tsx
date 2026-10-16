'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { LineupSelection, CardStylePreset, CardAspectRatio } from '@/types/ballot';
import { getCandidateById } from '@/lib/data/candidates';
import { getStateByCode, getSenatorialDistrict, getFederalConstituency } from '@/lib/data/states';
import { LandmarkSvg } from './LandmarkSvg';
import { PartyLogo } from './PartyLogo';

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
  const [daysRemaining, setDaysRemaining] = useState<number>(274);

  useEffect(() => {
    const targetDate = new Date('2027-01-16T08:00:00Z').getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    setDaysRemaining(diff);
  }, []);

  const state = getStateByCode(lineup.stateCode);
  const { district } = getSenatorialDistrict(lineup.stateCode, lineup.senatorialDistrictId);
  const { constituency } = getFederalConstituency(lineup.stateCode, lineup.federalConstituencyId);

  const isPresSelected = !!lineup.presidentId && lineup.presidentId !== 'undecided';
  const isGovSelected = !!lineup.governorId && lineup.governorId !== 'undecided';
  const isSenSelected = !!lineup.senatorId && lineup.senatorId !== 'undecided';
  const isRepSelected = !!lineup.representativeId && lineup.representativeId !== 'undecided';

  const pres = isPresSelected ? getCandidateById(lineup.presidentId) : undefined;
  const gov = isGovSelected ? getCandidateById(lineup.governorId) : undefined;
  const sen = isSenSelected ? getCandidateById(lineup.senatorId) : undefined;
  const rep = isRepSelected ? getCandidateById(lineup.representativeId) : undefined;

  const isFCT = lineup.stateCode === 'FC';
  const isDark = stylePreset === 'obsidian_minimal';
  const isHeritage = stylePreset === 'civic_heritage';

  const getContainerClasses = () => {
    switch (aspectRatio) {
      case 'twitter_landscape':
        return 'w-full max-w-[760px] min-h-[420px]';
      case 'facebook_post':
        return 'w-full max-w-[760px] min-h-[400px]';
      case 'instagram_square':
        return 'w-full max-w-[540px] min-h-[540px]';
      case 'instagram_portrait':
      case 'whatsapp_portrait':
        return 'w-full max-w-[480px] min-h-[600px]';
      case 'whatsapp_status':
        return 'w-full max-w-[420px] min-h-[700px]';
      default:
        return 'w-full max-w-[760px] min-h-[420px]';
    }
  };

  const cardBg = isDark
    ? 'bg-[#0A100C] text-[#F3F4F6]'
    : isHeritage
    ? 'bg-[#FAF8F5] text-[#14231A]'
    : 'bg-[#FFFFFF] text-[#0A100C]';

  const outerBorder = isDark
    ? 'border-[#1E3024]'
    : isHeritage
    ? 'border-[#B4C5BA]'
    : 'border-[#086338]/20 shadow-xl';

  const boxBg = isDark
    ? 'bg-[#111A14] border-[#1D2B20]'
    : isHeritage
    ? 'bg-[#F2ECE4] border-[#D3DDD7]'
    : 'bg-[#F8FAF9] border-[#DFE7E2]';

  const accentColor = isDark ? '#20C878' : '#086338';
  const mutedText = isDark ? 'text-[#8EA395]' : 'text-[#526D5C]';
  const watermarkOpacity = isDark ? 0.03 : 0.04;

  const constName = constituency?.name || constituency?.code || 'Constituency';
  const stateDisplayName = state?.name || 'Abia';
  const locationHeader = isFCT
    ? `${constName}, FCT Abuja`
    : `${constName}, ${stateDisplayName} State`;

  const hasUserAttribution = !!lineup.userName?.trim() || !!lineup.userHandle?.trim();
  const userName = lineup.userName?.trim();
  const userHandle = lineup.userHandle?.trim()
    ? lineup.userHandle.startsWith('@')
      ? lineup.userHandle
      : `@${lineup.userHandle}`
    : '';

  const renderSlot = (
    title: string,
    candidate?: ReturnType<typeof getCandidateById>,
    subtitle?: string,
    disabled = false,
    officeKey?: 'PRESIDENT' | 'GOVERNOR' | 'SENATOR' | 'REPRESENTATIVE'
  ) => {
    return (
      <div
        onClick={() => interactive && officeKey && onOfficeClick && onOfficeClick(officeKey)}
        className={`relative flex flex-col justify-between p-3 rounded-xl border ${boxBg} transition-all ${
          interactive ? 'cursor-pointer hover:border-[#20C878]' : ''
        }`}
      >
        {/* Top Label */}
        <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: accentColor }}>
            {title}
          </span>
          {subtitle && (
            <span className={`text-[9px] font-mono uppercase truncate max-w-[140px] sm:max-w-[180px] ${mutedText}`}>
              {subtitle}
            </span>
          )}
        </div>

        {/* Content */}
        {disabled ? (
          <div className="py-2.5 my-auto text-center">
            <span className={`text-xs italic ${mutedText}`}>No election (FCT)</span>
          </div>
        ) : candidate ? (
          <div className="my-auto py-2 flex items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <PartyLogo acronym={candidate.partyAcronym} size={32} className="shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold truncate leading-tight text-inherit">
                {candidate.name}
              </h4>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shrink-0"
              style={{ backgroundColor: candidate.partyColor || '#086338' }}
            >
              {candidate.partyAcronym}
            </span>
          </div>
        ) : (
          <div className="my-auto py-2 flex items-center space-x-2.5 opacity-50">
            <div className="w-8 h-8 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-gray-400">—</span>
            </div>
            <span className="text-xs text-gray-400 italic">Unselected</span>
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
          className="w-[115%] h-[115%] object-contain"
          opacity={watermarkOpacity}
          color={accentColor}
        />
      </div>

      {/* CARD HEADER */}
      <div className="relative z-10 px-4 sm:px-5 pt-3.5 pb-2 border-b border-black/10 dark:border-white/10">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase font-mono" style={{ color: accentColor }}>
              My 2027 Lineup [{daysRemaining}d to go]
            </h2>
            <p className="text-[10px] font-mono font-bold text-[#EAB308] dark:text-[#FBBF24]">
              Vote Jan 16 & Feb 06, 2027
            </p>
            <p className="text-[10px] font-bold tracking-wide uppercase text-black/80 dark:text-white/90">
              📍 {locationHeader}
            </p>
          </div>

          {/* Optional User Attribution */}
          {hasUserAttribution && (
            <div className="text-right flex flex-col items-end shrink-0 pl-2">
              {userName && (
                <span className="text-xs font-bold truncate max-w-[140px] text-black dark:text-white">
                  {userName}
                </span>
              )}
              {userHandle && (
                <span className="text-[11px] font-mono font-bold" style={{ color: accentColor }}>
                  {userHandle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4 CANDIDATE BOXES GRID */}
      <div className="relative z-10 p-3 sm:p-4 flex-1 flex flex-col justify-center">
        <div
          className={`grid gap-2.5 ${
            aspectRatio === 'twitter_landscape' || aspectRatio === 'facebook_post' || aspectRatio === 'instagram_square'
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {renderSlot('President', pres, 'Federal', false, 'PRESIDENT')}
          {renderSlot('Governor', gov, isFCT ? 'FCT' : `${stateDisplayName}`, isFCT, 'GOVERNOR')}
          {renderSlot('Senator', sen, district?.code || district?.name || 'District', false, 'SENATOR')}
          {renderSlot('House of Rep', rep, constName, false, 'REPRESENTATIVE')}
        </div>
      </div>

      {/* CARD FOOTER */}
      <div className="relative z-10 px-4 sm:px-5 py-2 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
        <span className="font-mono font-bold underline" style={{ color: accentColor }}>
          www.my2027lineup.com
        </span>
        <span className="font-mono text-gray-400">
          #my2027lineup
        </span>
      </div>
    </div>
  );
});

BallotCard.displayName = 'BallotCard';
