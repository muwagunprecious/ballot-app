import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0F0D] border-t border-[#27332B] pt-12 pb-8 text-[#A0ADA4] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Wordmark & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-[#151D18] border border-[#20C878]/40 flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-xs">27</span>
              </div>
              <span className="text-white font-semibold tracking-tight text-sm">
                My 2027 Lineup
              </span>
            </div>
            <p className="text-[#6D7B71] text-xs leading-relaxed">
              A civic technology initiative empowering Nigerian citizens to formulate, design, and share personalized electoral slates for the 2027 General Elections.
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#6D7B71]">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for democracy in Nigeria</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-xs tracking-wider uppercase font-mono">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/wizard" className="hover:text-emerald-400 transition-colors">
                  Create Your Lineup
                </Link>
              </li>
              <li>
                <Link href="/candidates" className="hover:text-emerald-400 transition-colors">
                  Candidate Directory
                </Link>
              </li>
              <li>
                <Link href="/states" className="hover:text-emerald-400 transition-colors">
                  States & Constituencies
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-400 transition-colors">
                  Demo User Profile
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Demo Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key States */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-xs tracking-wider uppercase font-mono">Explore States</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/states?state=LA" className="hover:text-emerald-400 transition-colors">
                  Lagos State Lineups
                </Link>
              </li>
              <li>
                <Link href="/states?state=FC" className="hover:text-emerald-400 transition-colors">
                  Federal Capital Territory
                </Link>
              </li>
              <li>
                <Link href="/states?state=KN" className="hover:text-emerald-400 transition-colors">
                  Kano State Lineups
                </Link>
              </li>
              <li>
                <Link href="/states?state=RV" className="hover:text-emerald-400 transition-colors">
                  Rivers State Lineups
                </Link>
              </li>
              <li>
                <Link href="/states?state=OY" className="hover:text-emerald-400 transition-colors">
                  Oyo State Lineups
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Civic Disclaimer & Transparency */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-xs tracking-wider uppercase font-mono">Civic Transparency</h4>
            <div className="p-3 rounded-lg bg-[#101713] border border-[#27332B] space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Non-Partisan Prototype</span>
              </div>
              <p className="text-[11px] text-[#6D7B71] leading-normal">
                This platform is an open-source civic demonstration. It is not affiliated with the Independent National Electoral Commission (INEC). All displayed candidacies represent demo records and personal user preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#27332B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6D7B71]">
          <div>
            © 2026–2027 My 2027 Lineup (MyNaijaBallot). All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/#transparency" className="hover:text-white transition-colors">
              Data Methodology
            </Link>
            <span>•</span>
            <Link href="/#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <span>•</span>
            <span className="text-[#20C878] font-mono">v1.0-editorial-preview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
