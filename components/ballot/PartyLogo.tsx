'use client';

import React, { useState } from 'react';
import { getPartyByAcronym } from '@/lib/data/parties';

interface PartyLogoProps {
  acronym: string;
  size?: number;
  className?: string;
  showBadge?: boolean;
}

export const PartyLogo: React.FC<PartyLogoProps> = ({
  acronym,
  size = 36,
  className = '',
  showBadge = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const party = getPartyByAcronym(acronym);
  const code = (acronym || '').toUpperCase();
  const primaryColor = party?.color || '#086338';
  const secondaryColor = party?.secondaryColor || '#FFFFFF';

  // Specific party vector iconography fallback
  const renderPartyEmblem = () => {
    switch (code) {
      case 'APC':
        return (
          <g>
            <path d="M12 24 L20 10 L22 10 L14 24 Z" fill="#F8FAFC" opacity="0.9" />
            <path d="M15 24 L21 11 L23 11 L17 24 Z" fill="#38BDF8" />
            <path d="M18 24 L23 12 L24 13 L19 24 Z" fill="#EF4444" />
            <rect x="18" y="22" width="6" height="2" rx="1" fill="#D97706" />
          </g>
        );
      case 'PDP':
        return (
          <g>
            <path d="M8 20 Q18 8 28 20 Z" fill="#EF4444" />
            <path d="M13 20 Q18 9 23 20 Z" fill="#F8FAFC" />
            <path d="M16 20 Q18 10 20 20 Z" fill="#15803D" />
            <path d="M18 20 L18 26 Q18 28 16 28" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'LP':
        return (
          <g>
            <circle cx="18" cy="18" r="10" stroke="#009944" strokeWidth="2" fill="none" strokeDasharray="3 2" />
            <circle cx="15" cy="14" r="2" fill="#FFFFFF" />
            <circle cx="21" cy="15" r="1.8" fill="#FFFFFF" />
            <path d="M12 22 Q15 17 18 22 Z" fill="#FFFFFF" />
            <path d="M18 22 Q21 18 24 22 Z" fill="#FFFFFF" opacity="0.8" />
          </g>
        );
      case 'NNPP':
        return (
          <g>
            <path d="M11 18 Q18 27 25 18 Z" fill="#FFD100" />
            <circle cx="15" cy="16" r="2.5" fill="#EF4444" />
            <circle cx="18" cy="14" r="2.5" fill="#22C55E" />
            <circle cx="21" cy="16" r="2.5" fill="#F97316" />
            <path d="M12 18 L24 18" stroke="#78350F" strokeWidth="1.5" />
          </g>
        );
      case 'APGA':
        return (
          <g>
            <path d="M14 24 Q15 16 20 15 Q24 15 22 20 Q20 24 14 24 Z" fill="#FBBF24" />
            <path d="M19 13 Q21 10 23 13 Q24 14 22 15 Z" fill="#EF4444" />
            <circle cx="20" cy="14" r="0.8" fill="#18181B" />
          </g>
        );
      case 'AAC':
        return (
          <g>
            <rect x="15" y="14" width="6" height="7" rx="2" fill="#FFFFFF" />
            <rect x="14" y="20" width="8" height="5" rx="1.5" fill="#FFFFFF" />
            <circle cx="16" cy="13" r="1" fill="#FFFFFF" />
            <circle cx="18" cy="12.5" r="1" fill="#FFFFFF" />
            <circle cx="20" cy="13" r="1" fill="#FFFFFF" />
          </g>
        );
      case 'SDP':
        return (
          <g>
            <path d="M13 23 L16 16 L20 14 L24 16 L22 20 L24 24 L20 21 L16 23 Z" fill="#FFFFFF" />
            <circle cx="21" cy="13" r="1.5" fill="#FFFFFF" />
          </g>
        );
      case 'ADC':
        return (
          <g>
            <path d="M11 18 L16 21 L20 18 L25 21" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M11 21 L16 18 L20 21 L25 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'PRP':
        return (
          <g>
            <circle cx="15" cy="15" r="3.5" stroke="#FBBF24" strokeWidth="2" fill="none" />
            <line x1="18" y1="17" x2="25" y2="23" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="20" x2="24" y2="18" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="22" x2="26" y2="20" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 'YPP':
        return (
          <g>
            <path d="M18 25 C18 19 12 17 12 12 C17 12 21 16 21 21 Z" fill="#F59E0B" />
            <path d="M18 25 C18 19 24 17 24 12 C19 12 15 16 15 21 Z" fill="#10B981" />
          </g>
        );
      default:
        return (
          <text
            x="18"
            y="21"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="10"
            fontWeight="900"
            fontFamily="monospace"
          >
            {code.slice(0, 3)}
          </text>
        );
    }
  };

  const hasRealLogo = !!party?.logoUrl && !imgError;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-lg overflow-hidden border border-black/10 shadow-xs bg-white ${className}`}
      style={{
        width: size,
        height: size,
      }}
      title={`${party?.name || code} (${code})`}
    >
      {hasRealLogo ? (
        <img
          src={party.logoUrl}
          alt={`${party?.name || code} logo`}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-0.5"
          crossOrigin="anonymous"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <svg
            viewBox="0 0 36 36"
            width={size}
            height={size}
            className="w-full h-full"
          >
            {renderPartyEmblem()}
          </svg>
        </div>
      )}
    </div>
  );
};
