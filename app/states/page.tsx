'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBallotStore } from '@/lib/ballot/store';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import { LandmarkSvg } from '@/components/ballot/LandmarkSvg';
import { GeoZone } from '@/types/ballot';
import {
  MapPin,
  Search,
  Building,
  Landmark,
  Users,
  Vote,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const GEO_ZONES: GeoZone[] = [
  'North Central',
  'North East',
  'North West',
  'South East',
  'South South',
  'South West',
];

function StatesExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateQuery = searchParams.get('state');

  const { updateCurrentLineup, candidates } = useBallotStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [activeStateCode, setActiveStateCode] = useState<string>(stateQuery || 'LA');

  const activeState = getStateByCode(activeStateCode) || NIGERIAN_STATES[0];

  const filteredStates = useMemo(() => {
    return NIGERIAN_STATES.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = selectedZone === 'ALL' || st.geoZone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, selectedZone]);

  const stateCandidates = useMemo(() => {
    return candidates.filter((c) => c.stateCode === activeState.code);
  }, [candidates, activeState.code]);

  const handleStartLineupForState = (stCode: string) => {
    const st = getStateByCode(stCode);
    if (!st) return;
    updateCurrentLineup({
      stateCode: st.code,
      senatorialDistrictId: st.senatorialDistricts[0]?.id || '',
      federalConstituencyId: st.federalConstituencies[0]?.id || '',
      governorId: undefined,
      senatorId: undefined,
      representativeId: undefined,
    });
    router.push('/wizard');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27332B] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-widest">
              Federal Republic of Nigeria
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            States & Constituencies Explorer
          </h1>
          <p className="text-xs text-[#A0ADA4] mt-1">
            Inspect senatorial districts, federal constituencies, landmark heritage, and local candidate rosters for all 36 states and the FCT.
          </p>
        </div>

        <button
          onClick={() => handleStartLineupForState(activeState.code)}
          className="px-5 py-2.5 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs flex items-center space-x-2 transition-all shadow-md self-start md:self-auto"
        >
          <Vote className="w-4 h-4" />
          <span>Build Lineup for {activeState.name}</span>
        </button>
      </div>

      {/* 2-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: State Search & Grid Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#101713] border border-[#27332B] space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7B71]" />
              <input
                type="text"
                placeholder="Search state by name or capital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151D18] text-[#F5F7F5] border border-[#27332B] focus:border-[#20C878] focus:ring-1 focus:ring-[#20C878] rounded-xl pl-10 pr-4 py-2 text-xs placeholder-[#6D7B71] transition-colors"
              />
            </div>

            {/* Geo Zone Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedZone('ALL')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedZone === 'ALL'
                    ? 'bg-[#20C878] text-[#0B0F0D]'
                    : 'bg-[#151D18] text-[#A0ADA4] hover:text-white'
                }`}
              >
                All Zones
              </button>
              {GEO_ZONES.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selectedZone === zone
                      ? 'bg-[#20C878] text-[#0B0F0D]'
                      : 'bg-[#151D18] text-[#A0ADA4] hover:text-white'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable States List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredStates.map((st) => {
              const isSelected = activeStateCode === st.code;
              return (
                <button
                  key={st.code}
                  onClick={() => setActiveStateCode(st.code)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#151D18] border-[#20C878] shadow-sm'
                      : 'bg-[#101713] border-[#27332B] hover:border-[#384A3E] hover:bg-[#151D18]'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{st.code}</span>
                      <h4 className="text-xs font-bold text-white">{st.name} {st.code === 'FC' ? '(FCT)' : 'State'}</h4>
                    </div>
                    <p className="text-[11px] text-[#6D7B71] mt-0.5">
                      Cap: {st.capital} · {st.geoZone}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#A0ADA4] bg-[#0B0F0D] px-2 py-0.5 rounded border border-[#27332B]">
                      {st.senatorialDistricts.length} Senate Dists
                    </span>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-[#6D7B71]'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Active State Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {/* State Main Card */}
          <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-6 relative overflow-hidden">
            {/* Landmark Watermark */}
            <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-10">
              <LandmarkSvg type={activeState.landmarkSvgType} />
            </div>

            {/* Title & Metadata */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27332B] pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                    {activeState.code}
                  </span>
                  <span className="text-xs font-mono text-[#6D7B71] uppercase">
                    {activeState.geoZone} Zone
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                  {activeState.name} {activeState.code === 'FC' ? '' : 'State'}
                </h2>
                <p className="text-xs text-[#A0ADA4] mt-0.5">
                  State Capital: <strong className="text-white">{activeState.capital}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[10px] font-mono uppercase text-[#6D7B71]">Est. Registered Voters</div>
                <div className="text-base font-mono font-bold text-emerald-400">{activeState.registeredVotersDemo}</div>
                <div className="text-[10px] text-[#6D7B71]">{activeState.collegesOrLgasCount} Local Governments</div>
              </div>
            </div>

            {/* Landmark info */}
            <div className="relative z-10 p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#101713] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#6D7B71]">State Landmark & Heritage</span>
                <h4 className="text-xs font-bold text-white">{activeState.landmarkName}</h4>
              </div>
            </div>

            {/* Senatorial Districts */}
            <div className="relative z-10 space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold text-white flex items-center space-x-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Senatorial Districts (Senate of Nigeria)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeState.senatorialDistricts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] space-y-1.5"
                  >
                    <span className="text-xs font-bold text-emerald-400">{d.code}</span>
                    <h4 className="text-xs font-semibold text-white leading-snug">{d.name}</h4>
                    <p className="text-[11px] text-[#6D7B71] leading-relaxed">
                      LGAs: {d.lgas.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Federal Constituencies */}
            <div className="relative z-10 space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Federal Constituencies (House of Representatives)</span>
              </h3>

              <div className="space-y-2">
                {activeState.federalConstituencies.map((fc) => (
                  <div
                    key={fc.id}
                    className="p-3 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{fc.name}</h4>
                      <p className="text-[11px] text-[#6D7B71]">Includes: {fc.lgas.join(', ')}</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {fc.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* State Demo Candidates */}
            <div className="relative z-10 space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Demo Candidates Running in {activeState.name} ({stateCandidates.length})</span>
              </h3>

              {stateCandidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stateCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center space-x-3"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-800">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-white font-bold text-xs">
                            {c.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono text-[#6D7B71] uppercase block">{c.office}</span>
                        <h5 className="text-xs font-bold text-white truncate">{c.name}</h5>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white"
                            style={{ backgroundColor: c.partyColor }}
                          >
                            {c.partyAcronym}
                          </span>
                          <span className="text-[10px] text-[#6D7B71] truncate">{c.education}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#151D18] border border-[#27332B] text-center text-xs text-[#6D7B71]">
                  No state-level candidates registered in demo mode yet. You can add one via the Admin Demo panel!
                </div>
              )}
            </div>

            {/* Build Button Footer */}
            <div className="relative z-10 pt-4 border-t border-[#27332B]">
              <button
                onClick={() => handleStartLineupForState(activeState.code)}
                className="w-full py-3.5 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs tracking-tight flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                <Vote className="w-4 h-4" />
                <span>Start 2027 Lineup for {activeState.name} State</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatesPage() {
  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F5F7F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="p-12 text-center text-xs text-emerald-400">Loading Nigerian States Explorer...</div>}>
          <StatesExplorerContent />
        </Suspense>
      </div>
    </div>
  );
}
