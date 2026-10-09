'use client';

import React, { useState, useMemo } from 'react';
import { Candidate, Office } from '@/types/ballot';
import { POLITICAL_PARTIES } from '@/lib/data/parties';
import {
  Search,
  CheckCircle2,
  Info,
  Award,
  BookOpen,
  Sparkles,
  UserCheck,
  PlusCircle,
  X,
} from 'lucide-react';

interface StepCandidateSelectProps {
  office: Office;
  officeTitle: string;
  officeDescription: string;
  territoryContext: string;
  candidates: Candidate[];
  selectedCandidateId?: string;
  onSelectCandidate: (candidateId: string) => void;
  onDeselectCandidate?: () => void;
}

export const StepCandidateSelect: React.FC<StepCandidateSelectProps> = ({
  office,
  officeTitle,
  officeDescription,
  territoryContext,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onDeselectCandidate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [inspectCandidate, setInspectCandidate] = useState<Candidate | null>(null);

  // Filter candidates by search query and party
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.partyAcronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesParty = selectedParty === 'ALL' || c.partyAcronym.toUpperCase() === selectedParty.toUpperCase();
      return matchesSearch && matchesParty;
    });
  }, [candidates, searchQuery, selectedParty]);

  // Unique parties in candidate pool
  const partyList = useMemo(() => {
    const set = new Set(candidates.map((c) => c.partyAcronym));
    return ['ALL', ...Array.from(set)];
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Office Header */}
      <div className="border-b border-[#27332B] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase font-bold border border-emerald-500/20">
                OFFICE · {office}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mt-1">
              {officeTitle}
            </h3>
            <p className="text-xs text-[#A0ADA4] mt-0.5">
              {officeDescription}
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#101713] border border-[#27332B] text-right">
            <span className="text-[10px] text-[#6D7B71] uppercase font-mono block">Territory</span>
            <span className="text-xs font-bold text-emerald-400">{territoryContext}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7B71]" />
          <input
            type="text"
            placeholder={`Search ${office.toLowerCase()} candidates by name, manifesto keywords, or party...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101713] text-[#F5F7F5] border border-[#27332B] focus:border-[#20C878] focus:ring-1 focus:ring-[#20C878] rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-[#6D7B71] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6D7B71] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Party Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-[#6D7B71] mr-1 font-mono uppercase">Filter:</span>
          {partyList.map((p) => {
            const isSelected = selectedParty === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedParty(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#20C878] text-[#0B0F0D]'
                    : 'bg-[#101713] text-[#A0ADA4] border border-[#27332B] hover:border-[#384A3E] hover:text-white'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((c) => {
            const isSelected = selectedCandidateId === c.id;
            return (
              <div
                key={c.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#151D18] border-[#20C878] shadow-[0_0_16px_rgba(32,200,120,0.18)]'
                    : 'bg-[#101713] border-[#27332B] hover:border-[#384A3E] hover:bg-[#151D18]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-800">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-white font-bold text-base">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-tl"
                        style={{ backgroundColor: c.partyColor || '#20C878' }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {c.name}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: c.partyColor || '#087443' }}
                        >
                          {c.partyAcronym}
                        </span>
                        <span className="text-[10px] text-[#6D7B71] font-mono">
                          {c.gender === 'F' ? 'Female' : 'Male'} · {c.age} yrs
                        </span>
                      </div>

                      <p className="text-xs text-[#A0ADA4] mt-1 line-clamp-2 leading-relaxed">
                        {c.bio}
                      </p>

                      {/* Key Pledges teaser */}
                      {c.keyPledges && c.keyPledges.length > 0 && (
                        <div className="mt-2 text-[11px] text-[#6D7B71] flex items-center space-x-1.5">
                          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate italic">
                            Pledge: “{c.keyPledges[0]}”
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected && onDeselectCandidate) {
                          onDeselectCandidate();
                        } else {
                          onSelectCandidate(c.id);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#20C878] text-[#0B0F0D] shadow-sm'
                          : 'bg-[#151D18] text-white border border-[#27332B] hover:border-[#20C878] hover:text-[#20C878]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select Choice</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectCandidate(c)}
                      className="text-[11px] text-[#6D7B71] hover:text-emerald-400 underline underline-offset-2 transition-colors"
                    >
                      View Manifesto
                    </button>
                  </div>
                </div>

                {/* Status disclaimer badge */}
                <div className="mt-3 pt-2 border-t border-[#27332B]/60 flex items-center justify-between text-[10px] text-[#6D7B71]">
                  <span>Status: <strong className="text-[#A0ADA4]">{c.status.replace(/_/g, ' ')}</strong></span>
                  {c.runningMate && <span>Running Mate: <strong className="text-white">{c.runningMate}</strong></span>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-xl bg-[#101713] border border-[#27332B] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#151D18] border border-[#27332B] flex items-center justify-center mx-auto text-[#6D7B71]">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">No candidates match this filter</h4>
            <p className="text-xs text-[#A0ADA4] max-w-sm mx-auto">
              Try clearing your search query or party filter. You can also view all candidate profiles in the full candidate directory.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedParty('ALL');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#151D18] border border-[#27332B] text-xs text-emerald-400 hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {inspectCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101713] border border-[#27332B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-zinc-800">
                  {inspectCandidate.avatarUrl ? (
                    <img
                      src={inspectCandidate.avatarUrl}
                      alt={inspectCandidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-white font-bold text-lg">
                      {inspectCandidate.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectCandidate.name}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: inspectCandidate.partyColor || '#087443' }}
                    >
                      {inspectCandidate.partyAcronym}
                    </span>
                    <span className="text-xs text-[#A0ADA4]">
                      {POLITICAL_PARTIES.find(p => p.acronym === inspectCandidate.partyAcronym)?.name}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectCandidate(null)}
                className="p-1.5 rounded-lg bg-[#151D18] text-[#A0ADA4] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs border-t border-[#27332B] pt-3">
              <div>
                <h4 className="text-white font-semibold font-mono uppercase text-[11px] mb-1">Biography</h4>
                <p className="text-[#A0ADA4] leading-relaxed">{inspectCandidate.bio}</p>
              </div>

              <div>
                <h4 className="text-white font-semibold font-mono uppercase text-[11px] mb-1">Education & Background</h4>
                <p className="text-[#A0ADA4]">{inspectCandidate.education}</p>
              </div>

              {inspectCandidate.keyPledges && inspectCandidate.keyPledges.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold font-mono uppercase text-[11px] mb-1.5">Key Manifesto Pledges</h4>
                  <ul className="space-y-1.5">
                    {inspectCandidate.keyPledges.map((pledge, i) => (
                      <li key={i} className="flex items-start space-x-2 text-[#A0ADA4]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pledge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#27332B] flex items-center justify-between">
              <span className="text-[11px] text-[#6D7B71]">
                Record: {inspectCandidate.status.replace(/_/g, ' ')}
              </span>
              <button
                onClick={() => {
                  onSelectCandidate(inspectCandidate.id);
                  setInspectCandidate(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#20C878] text-[#0B0F0D] font-bold text-xs hover:bg-[#1db56c] transition-colors"
              >
                Choose This Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
