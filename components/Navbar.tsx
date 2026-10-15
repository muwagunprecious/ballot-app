'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(858);

  useEffect(() => {
    // 2027 Nigerian Presidential & National Assembly Election target date: Jan 16, 2027
    const targetDate = new Date('2027-01-16T08:00:00Z').getTime();
    const now = new Date().getTime();
    const diffDays = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    setDaysRemaining(diffDays);
  }, []);

  const navLinks = [
    { name: 'Generate', href: '/' },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F0D]/95 backdrop-blur-md border-b border-[#1A251E] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Wordmark */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded-md bg-[#131C16] border border-[#233529] flex items-center justify-center group-hover:border-[#20C878] transition-colors">
                <span className="text-[#20C878] font-mono font-bold text-xs">27</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-white font-bold tracking-tight text-sm group-hover:text-[#20C878] transition-colors font-sans">
                  My 2027 elections line-up
                </span>
                <span className="text-[10px] text-[#55675B] font-mono uppercase hidden sm:inline">
                  Nigeria
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1A251E]">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#152219] text-[#20C878] border border-[#20C878]/30 font-semibold'
                        : 'text-[#8E9F94] hover:text-white hover:bg-[#121A15]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center / Right: Election Countdown Timer */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#121B15] border border-[#23382A] text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-[#20C878] animate-pulse" />
              <span className="text-[#8E9F94] hidden sm:inline">2027 Election:</span>
              <span className="font-bold text-[#20C878]">{daysRemaining} Days to Go</span>
            </div>

            <Link
              href="/wizard"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-md bg-[#20C878] hover:bg-[#2ae08a] text-[#07130C] font-semibold text-xs tracking-tight transition-all shadow-[0_0_12px_rgba(32,200,120,0.2)]"
            >
              Generate
            </Link>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Link
                href="/wizard"
                className="px-2.5 py-1 rounded-md bg-[#20C878] text-[#07130C] font-bold text-xs"
              >
                Generate
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-md bg-[#101713] border border-[#1F2C23] text-[#8E9F94] hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F0D] border-b border-[#1A251E] px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium ${
                isActive(link.href)
                  ? 'bg-[#152219] text-[#20C878]'
                  : 'text-[#8E9F94] hover:bg-[#121A15] hover:text-white'
              }`}
            >
              <span>{link.name}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          ))}
          <div className="pt-2 border-t border-[#1A251E] flex items-center justify-between text-xs text-[#8E9F94]">
            <span>Countdown:</span>
            <span className="font-mono font-bold text-[#20C878]">{daysRemaining} Days to Go</span>
          </div>
        </div>
      )}
    </header>
  );
};
