'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBallotStore } from '@/lib/ballot/store';
import { Candidate, Office } from '@/types/ballot';
import { POLITICAL_PARTIES } from '@/lib/data/parties';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import {
  Search,
  Users,
  Check,
  Plus,
  X,
  Vote,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function CandidateDirectoryPage() {
  const router = useRouter();
  const { candidates, updateCurrentLineup, currentLineup } = useBallotStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string>('ALL');
  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [inspectCandidate, setInspectCandidate] = useState<Candidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.partyAcronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOffice = selectedOffice === 'ALL' || c.office === selectedOffice;
      const matchesParty = selectedParty === 'ALL' || c.partyAcronym === selectedParty;
      return matchesSearch && matchesOffice && matchesParty;
    });
  }, [candidates, searchQuery, selectedOffice, selectedParty]);

  const handleAddCandidateToLineup = (candidate: Candidate) => {
    const updates: Partial<typeof currentLineup> = {};
    if (candidate.office === 'PRESIDENT') updates.presidentId = candidate.id;
    if (candidate.office === 'GOVERNOR') {
      updates.governorId = candidate.id;
      if (candidate.stateCode) updates.stateCode = candidate.stateCode;
    }
    if (candidate.office === 'SENATOR') {
      updates.senatorId = candidate.id;
      if (candidate.stateCode) updates.stateCode = candidate.stateCode;
      if (candidate.senatorialDistrictId) updates.senatorialDistrictId = candidate.senatorialDistrictId;
    }
    if (candidate.office === 'REPRESENTATIVE') {
      updates.representativeId = candidate.id;
      if (candidate.stateCode) updates.stateCode = candidate.stateCode;
      if (candidate.senatorialDistrictId) updates.senatorialDistrictId = candidate.senatorialDistrictId;
      if (candidate.federalConstituencyId) updates.federalConstituencyId = candidate.federalConstituencyId;
    }

    updateCurrentLineup(updates);
    setToastMessage(`Added ${candidate.name} to your ${candidate.office.toLowerCase()} slot!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F5F7F5] py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A251E] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#20C878] uppercase font-bold">
              <span>National Roster</span>
              <span>•</span>
              <span>2027 General Elections</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Candidate Directory
            </h1>
          </div>

          <button
            onClick={() => router.push('/wizard')}
            className="btn-emerald-solid px-3.5 py-1.5 text-xs flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#152219] border border-[#20C878] px-4 py-2.5 rounded-lg shadow-2xl text-xs text-[#20C878] flex items-center space-x-2 animate-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter Command Bar */}
        <div className="obsidian-panel p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#55675B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by candidate, party, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F0D] text-white border border-[#1F2C23] focus:border-[#20C878] rounded-md pl-9 pr-3 py-1.5 text-xs placeholder-[#55675B]"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="bg-[#141E18] text-white border border-[#233529] rounded-md px-2.5 py-1.5 text-xs"
            >
              <option value="ALL">All Offices</option>
              <option value="PRESIDENT">President</option>
              <option value="GOVERNOR">Governor</option>
              <option value="SENATOR">Senator</option>
              <option value="REPRESENTATIVE">House of Reps</option>
            </select>

            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="bg-[#141E18] text-white border border-[#233529] rounded-md px-2.5 py-1.5 text-xs"
            >
              <option value="ALL">All Parties</option>
              {POLITICAL_PARTIES.map((p) => (
                <option key={p.id} value={p.acronym}>
                  {p.acronym}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-mono text-[#55675B] hidden md:inline">
              {filteredCandidates.length} records
            </span>
          </div>
        </div>

        {/* High-Density Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCandidates.map((c) => {
            const state = c.stateCode ? getStateByCode(c.stateCode) : null;
            return (
              <div
                key={c.id}
                className="obsidian-row p-3.5 rounded-lg flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-[#20C878] bg-[#142219] px-1.5 py-0.2 rounded border border-[#20C878]/30">
                      {c.office}
                    </span>
                    <span className="text-[10px] font-mono text-[#55675B]">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 border border-[#243429] bg-zinc-900">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#152319] text-[#20C878] font-bold text-xs">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-white truncate">{c.name}</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span
                          className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white font-mono"
                          style={{ backgroundColor: c.partyColor }}
                        >
                          {c.partyAcronym}
                        </span>
                        <span className="text-[10px] text-[#8E9F94] truncate">
                          {c.office === 'PRESIDENT' ? 'Nigeria (Federal)' : `${state?.name || ''} State`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8E9F94] line-clamp-2 leading-relaxed">
                    {c.bio}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1F2C23] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setInspectCandidate(c)}
                    className="text-[11px] text-[#8E9F94] hover:text-white underline underline-offset-2"
                  >
                    Manifesto
                  </button>

                  <button
                    onClick={() => handleAddCandidateToLineup(c)}
                    className="px-2.5 py-1 rounded bg-[#141E18] hover:bg-[#20C878] hover:text-[#07130C] text-[#8E9F94] hover:font-bold border border-[#233529] text-[11px] font-mono transition-colors"
                  >
                    + Add to Slate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Modal */}
      {inspectCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="obsidian-panel-elevated max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-md overflow-hidden border border-[#243429] bg-zinc-900">
                  {inspectCandidate.avatarUrl ? (
                    <img src={inspectCandidate.avatarUrl} alt={inspectCandidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#152319] text-[#20C878] font-bold text-sm">
                      {inspectCandidate.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{inspectCandidate.name}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5 text-xs">
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white font-mono"
                      style={{ backgroundColor: inspectCandidate.partyColor }}
                    >
                      {inspectCandidate.partyAcronym}
                    </span>
                    <span className="text-[#8E9F94] text-[11px]">{inspectCandidate.office}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectCandidate(null)}
                className="p-1 rounded bg-[#141E18] text-[#8E9F94] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs border-t border-[#1F2C23] pt-3 text-[#8E9F94] leading-relaxed">
              <div>
                <strong className="text-white font-mono uppercase text-[10px] block mb-0.5">Biography</strong>
                <p>{inspectCandidate.bio}</p>
              </div>

              <div>
                <strong className="text-white font-mono uppercase text-[10px] block mb-0.5">Education</strong>
                <p>{inspectCandidate.education}</p>
              </div>

              {inspectCandidate.keyPledges && (
                <div>
                  <strong className="text-white font-mono uppercase text-[10px] block mb-1">Key Pledges</strong>
                  <ul className="space-y-1">
                    {inspectCandidate.keyPledges.map((pl, i) => (
                      <li key={i} className="flex items-start space-x-1.5 text-[11px]">
                        <span className="text-[#20C878] font-mono">•</span>
                        <span>{pl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#1F2C23] flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  handleAddCandidateToLineup(inspectCandidate);
                  setInspectCandidate(null);
                }}
                className="btn-emerald-solid px-3.5 py-1.5 text-xs"
              >
                Add to My Lineup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
