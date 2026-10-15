'use client';

import React from 'react';
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
  const party = getPartyByAcronym(acronym);
  const code = (acronym || '').toUpperCase();
  const primaryColor = party?.color || '#086338';
  const secondaryColor = party?.secondaryColor || '#FFFFFF';

  // Specific party iconography
  const renderPartyEmblem = () => {
    switch (code) {
      case 'APC':
        // Broom motif + tricolor
        return (
          <g>
            <path d="M12 24 L20 10 L22 10 L14 24 Z" fill="#F8FAFC" opacity="0.9" />
            <path d="M15 24 L21 11 L23 11 L17 24 Z" fill="#38BDF8" />
            <path d="M18 24 L23 12 L24 13 L19 24 Z" fill="#EF4444" />
            <rect x="18" y="22" width="6" height="2" rx="1" fill="#D97706" />
          </g>
        );
      case 'PDP':
        // Umbrella motif (Red, White, Green)
        return (
          <g>
            <path d="M8 20 Q18 8 28 20 Z" fill="#EF4444" />
            <path d="M13 20 Q18 9 23 20 Z" fill="#F8FAFC" />
            <path d="M16 20 Q18 10 20 20 Z" fill="#15803D" />
            <path d="M18 20 L18 26 Q18 28 16 28" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'LP':
        // Family / Wheel motif
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
        // Basket of fruits
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
        // Rooster / Cock silhouette
        return (
          <g>
            <path d="M14 24 Q15 16 20 15 Q24 15 22 20 Q20 24 14 24 Z" fill="#FBBF24" />
            <path d="M19 13 Q21 10 23 13 Q24 14 22 15 Z" fill="#EF4444" />
            <circle cx="20" cy="14" r="0.8" fill="#18181B" />
          </g>
        );
      case 'AAC':
        // Raised Clenched Fist
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
        // White galloping horse
        return (
          <g>
            <path d="M13 23 L16 16 L20 14 L24 16 L22 20 L24 24 L20 21 L16 23 Z" fill="#FFFFFF" />
            <circle cx="21" cy="13" r="1.5" fill="#FFFFFF" />
          </g>
        );
      case 'ADC':
        // Handshake / Synergy
        return (
          <g>
            <path d="M11 18 L16 21 L20 18 L25 21" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M11 21 L16 18 L20 21 L25 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'PRP':
        // Golden Key
        return (
          <g>
            <circle cx="15" cy="15" r="3.5" stroke="#FBBF24" strokeWidth="2" fill="none" />
            <line x1="18" y1="17" x2="25" y2="23" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="20" x2="24" y2="18" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="22" x2="26" y2="20" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 'YPP':
        // Leaves / Sprouts
        return (
          <g>
            <path d="M18 25 C18 19 12 17 12 12 C17 12 21 16 21 21 Z" fill="#F59E0B" />
            <path d="M18 25 C18 19 24 17 24 12 C19 12 15 16 15 21 Z" fill="#10B981" />
          </g>
        );
      case 'A':
        // Accord Thumbs Up
        return (
          <g>
            <path d="M13 18 L17 18 L19 12 Q20 11 21 13 L20 18 L24 18 Q25 18 25 20 L23 25 L15 25 Z" fill="#1D4ED8" />
            <rect x="11" y="18" width="3" height="7" rx="1" fill="#1E40AF" />
          </g>
        );
      case 'AA':
        // Soaring Eagle wings
        return (
          <g>
            <path d="M10 16 Q18 12 26 16 Q18 20 10 16 Z" fill="#FFFFFF" />
            <circle cx="18" cy="15" r="2" fill="#FEF08A" />
            <path d="M15 18 L18 24 L21 18 Z" fill="#2563EB" />
          </g>
        );
      case 'ADP':
        // Open book
        return (
          <g>
            <path d="M11 16 Q18 14 18 24 Q14 23 11 23 Z" fill="#FFFFFF" />
            <path d="M25 16 Q18 14 18 24 Q22 23 25 23 Z" fill="#F3E8FF" />
          </g>
        );
      case 'APP':
        // Rising Sun
        return (
          <g>
            <circle cx="18" cy="20" r="5" fill="#FEF08A" />
            <path d="M18 12 L18 14 M12 16 L14 17 M24 16 L22 17" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 'APM':
        // Cassava / Plant shoot
        return (
          <g>
            <line x1="18" y1="26" x2="18" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="14" cy="17" rx="3" ry="1.5" transform="rotate(-30 14 17)" fill="#FEF08A" />
            <ellipse cx="22" cy="17" rx="3" ry="1.5" transform="rotate(30 22 17)" fill="#FEF08A" />
          </g>
        );
      case 'BP':
        // Boot outline
        return (
          <g>
            <path d="M15 13 L19 13 L19 20 L24 21 L24 24 L14 24 L14 18 L15 13 Z" fill="#FFFFFF" />
          </g>
        );
      case 'DLA':
        // Scales of justice
        return (
          <g>
            <line x1="18" y1="12" x2="18" y2="25" stroke="#F59E0B" strokeWidth="2" />
            <line x1="12" y1="15" x2="24" y2="15" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="12" cy="19" r="2" fill="#FFFFFF" />
            <circle cx="24" cy="19" r="2" fill="#FFFFFF" />
          </g>
        );
      case 'NDC':
        // Torch
        return (
          <g>
            <path d="M17 18 L19 18 L19 25 L17 25 Z" fill="#FACC15" />
            <path d="M18 12 Q21 15 18 17 Q15 15 18 12 Z" fill="#EF4444" />
          </g>
        );
      case 'NDP':
        // Star & banner
        return (
          <g>
            <polygon points="18,12 20,16 24,17 21,20 22,24 18,22 14,24 15,20 12,17 16,16" fill="#FFFFFF" />
          </g>
        );
      case 'NRM':
        // Bee / Wings
        return (
          <g>
            <ellipse cx="18" cy="19" rx="3" ry="4" fill="#18181B" />
            <ellipse cx="14" cy="16" rx="3.5" ry="2" transform="rotate(-30 14 16)" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="22" cy="16" rx="3.5" ry="2" transform="rotate(30 22 16)" fill="#FFFFFF" opacity="0.9" />
          </g>
        );
      case 'YP':
        // Dynamic Y / Star
        return (
          <g>
            <path d="M13 14 L18 19 L23 14 M18 19 L18 25" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'ZLP':
        // Zenith bridge / Arch
        return (
          <g>
            <path d="M12 24 Q18 12 24 24" stroke="#FFD700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="18" cy="14" r="2" fill="#FFFFFF" />
          </g>
        );
      default:
        // Generic crisp emblem with acronym
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

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-lg overflow-hidden border border-black/10 shadow-xs ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: primaryColor,
      }}
      title={`${party?.name || code} (${code})`}
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
  );
};
