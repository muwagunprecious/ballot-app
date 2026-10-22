import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0F0D] border-t border-[#1F2C23] pt-10 pb-8 text-[#A0ADA4] text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-[#151D18] border border-[#20C878]/40 flex items-center justify-center">
                <span className="text-[#20C878] font-bold text-xs">🗳️</span>
              </div>
              <span className="text-white font-bold tracking-tight text-sm">
                My 2027 ballot line-up Nigeria
              </span>
            </div>
            <p className="text-[#6D7B71] text-xs leading-relaxed">
              A civic technology initiative empowering Nigerian citizens to formulate, design, and share personalized electoral lineups for the 2027 General Elections.
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#6D7B71]">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for democracy in Nigeria</span>
            </div>
          </div>

          {/* Col 2: Initiative Info */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase font-mono">Civic Initiative</h4>
            <ul className="space-y-1.5 text-[#8E9F94]">
              <li>
                <Link href="/" className="hover:text-[#20C878] transition-colors">
                  Create Your Lineup
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Generate: </span>
                <span className="text-[#20C878] font-mono">GENERATE Yours at Www. 2027lineup.com</span>
              </li>
              <li>
                <span className="text-gray-400">Hashtag: </span>
                <span className="text-[#20C878] font-mono font-bold">#my2027lineup</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Civic Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase font-mono">Civic Transparency</h4>
            <div className="p-3 rounded-lg bg-[#101713] border border-[#1F2C23] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Not Official Ballot</span>
              </div>
              <p className="text-[11px] text-[#6D7B71] leading-relaxed">
                This platform is an independent civic engagement demonstration and is not affiliated with the Independent National Electoral Commission (INEC). All slates represent personal user choices.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#1A251E] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6D7B71]">
          <div>
            © 2026–2027 My 2027 Lineup Nigeria. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono">
            <span className="text-gray-300 font-semibold">GENERATE Yours at Www. 2027lineup.com.</span>
            <span className="text-amber-500 font-semibold">• NOT official Ballot. •</span>
            <span className="text-[#20C878] font-bold">#my2027lineup</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

