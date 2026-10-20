'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [daysRemaining, setDaysRemaining] = useState<number>(88);

  useEffect(() => {
    // 2027 Nigerian Presidential & National Assembly Election target date: Jan 16, 2027
    const targetDate = new Date('2027-01-16T08:00:00Z').getTime();
    const now = new Date().getTime();
    const diffDays = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    setDaysRemaining(diffDays);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F0D]/95 backdrop-blur-md border-b border-[#1A251E] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Wordmark */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded-md bg-[#131C16] border border-[#233529] flex items-center justify-center group-hover:border-[#20C878] transition-colors">
                <span className="text-[#20C878] font-mono font-bold text-xs">🗳️</span>
              </div>
              <span className="text-white font-bold tracking-tight text-sm sm:text-base group-hover:text-[#20C878] transition-colors font-sans">
                My 2027 ballot line-up Nigeria
              </span>
            </Link>
          </div>

          {/* Right: Accurate Countdown Timer using Jan 16, 2027 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#121B15] border border-[#23382A] text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-[#20C878] animate-pulse" />
              <span className="font-bold text-[#20C878]">{daysRemaining} Days to Go</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

