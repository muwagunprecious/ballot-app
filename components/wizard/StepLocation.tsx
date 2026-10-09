'use client';

import React from 'react';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import { MapPin, Landmark, Building2, CheckCircle2 } from 'lucide-react';

interface StepLocationProps {
  stateCode: string;
  senatorialDistrictId: string;
  federalConstituencyId: string;
  onChange: (updates: {
    stateCode: string;
    senatorialDistrictId: string;
    federalConstituencyId: string;
    clearDownstreamCandidates?: boolean;
  }) => void;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  stateCode,
  senatorialDistrictId,
  federalConstituencyId,
  onChange,
}) => {
  const currentState = getStateByCode(stateCode) || NIGERIAN_STATES[0];

  const handleStateChange = (newCode: string) => {
    const nextState = getStateByCode(newCode);
    if (!nextState) return;

    const firstDistrict = nextState.senatorialDistricts[0]?.id || '';
    const firstConstituency = nextState.federalConstituencies[0]?.id || '';

    onChange({
      stateCode: newCode,
      senatorialDistrictId: firstDistrict,
      federalConstituencyId: firstConstituency,
      clearDownstreamCandidates: true,
    });
  };

  const handleDistrictChange = (newDistrictId: string) => {
    // Check if current federal constituency still belongs to this district
    const matchingConstituencies = currentState.federalConstituencies.filter(
      c => c.senatorialDistrictId === newDistrictId
    );
    const nextConstituencyId = matchingConstituencies[0]?.id || currentState.federalConstituencies[0]?.id || '';

    onChange({
      stateCode,
      senatorialDistrictId: newDistrictId,
      federalConstituencyId: nextConstituencyId,
      clearDownstreamCandidates: false,
    });
  };

  const handleConstituencyChange = (newConstituencyId: string) => {
    const constituency = currentState.federalConstituencies.find(c => c.id === newConstituencyId);
    onChange({
      stateCode,
      senatorialDistrictId: constituency?.senatorialDistrictId || senatorialDistrictId,
      federalConstituencyId: newConstituencyId,
    });
  };

  // Filter federal constituencies by the active senatorial district if available
  const availableConstituencies = currentState.federalConstituencies.filter(
    c => !c.senatorialDistrictId || c.senatorialDistrictId === senatorialDistrictId
  );
  const activeConstituencies = availableConstituencies.length > 0
    ? availableConstituencies
    : currentState.federalConstituencies;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-[#27332B] pb-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>Select Your Nigerian Electoral Location</span>
        </h3>
        <p className="text-xs text-[#A0ADA4] mt-1">
          Your state and constituency selections determine which Governor, Senator, and House of Reps candidates appear on your ballot lineup.
        </p>
      </div>

      {/* State Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase font-semibold text-[#A0ADA4]">
          1. State / Territory (36 States + FCT)
        </label>
        <div className="relative">
          <select
            value={stateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-[#101713] text-[#F5F7F5] border border-[#27332B] focus:border-[#20C878] focus:ring-1 focus:ring-[#20C878] rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer transition-colors"
          >
            {NIGERIAN_STATES.map((st) => (
              <option key={st.code} value={st.code} className="bg-[#101713] text-white">
                {st.name} {st.code === 'FC' ? '(FCT)' : 'State'} — {st.geoZone}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6D7B71]">
            ▼
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-[#6D7B71]">
          <span>Capital: <strong className="text-[#A0ADA4]">{currentState.capital}</strong></span>
          <span>•</span>
          <span>Landmark: <strong className="text-emerald-400">{currentState.landmarkName}</strong></span>
          <span>•</span>
          <span>Est. Voters: <strong className="text-[#A0ADA4]">{currentState.registeredVotersDemo}</strong></span>
        </div>
      </div>

      {/* Senatorial District Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase font-semibold text-[#A0ADA4]">
          2. Senatorial District (Red Chamber)
        </label>
        {currentState.senatorialDistricts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentState.senatorialDistricts.map((district) => {
              const selected = district.id === senatorialDistrictId;
              return (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => handleDistrictChange(district.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selected
                      ? 'bg-[#151D18] border-[#20C878] text-white shadow-[0_0_12px_rgba(32,200,120,0.15)]'
                      : 'bg-[#101713] border-[#27332B] text-[#A0ADA4] hover:border-[#384A3E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{district.code}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-[#6D7B71] mt-1 line-clamp-2">
                    {district.lgas.slice(0, 3).join(', ')}
                    {district.lgas.length > 3 ? ` +${district.lgas.length - 3} LGAs` : ''}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-amber-400">No senatorial districts found for this state.</p>
        )}
      </div>

      {/* Federal Constituency Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase font-semibold text-[#A0ADA4]">
          3. Federal Constituency (House of Representatives / Green Chamber)
        </label>
        {currentState.federalConstituencies.length > 0 ? (
          <div className="relative">
            <select
              value={federalConstituencyId}
              onChange={(e) => handleConstituencyChange(e.target.value)}
              className="w-full bg-[#101713] text-[#F5F7F5] border border-[#27332B] focus:border-[#20C878] focus:ring-1 focus:ring-[#20C878] rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer transition-colors"
            >
              {currentState.federalConstituencies.map((fc) => (
                <option key={fc.id} value={fc.id} className="bg-[#101713] text-white">
                  {fc.name} ({fc.lgas.join(', ')})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6D7B71]">
              ▼
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-400">No federal constituencies found for this state.</p>
        )}
        <p className="text-[11px] text-[#6D7B71]">
          This is the federal seat for the national House of Representatives in Abuja (not state assembly).
        </p>
      </div>

      {/* Selected Location Banner */}
      <div className="p-3.5 rounded-xl bg-[#151D18] border border-[#27332B] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-white">
              Active Voting Zone: {currentState.name} State
            </div>
            <div className="text-[11px] text-[#A0ADA4]">
              {currentState.senatorialDistricts.find(d => d.id === senatorialDistrictId)?.name || 'Senatorial District'} • {currentState.federalConstituencies.find(c => c.id === federalConstituencyId)?.name || 'Federal Constituency'}
            </div>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded bg-[#20C878]/10 border border-[#20C878]/30 text-emerald-400 text-xs font-mono font-bold">
          Configured
        </div>
      </div>
    </div>
  );
};
