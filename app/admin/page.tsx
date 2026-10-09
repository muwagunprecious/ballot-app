'use client';

import React, { useState } from 'react';
import { useBallotStore } from '@/lib/ballot/store';
import { Candidate, Office, CandidateStatus } from '@/types/ballot';
import { POLITICAL_PARTIES } from '@/lib/data/parties';
import { NIGERIAN_STATES, getStateByCode } from '@/lib/data/states';
import {
  ShieldAlert,
  Users,
  Building,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
} from 'lucide-react';

export default function AdminPage() {
  const {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    resetAllToDefaults,
    savedLineups,
  } = useBallotStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'parties' | 'states' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('ALL');

  // Candidate Create/Edit Modal State
  const [editingCandidate, setEditingCandidate] = useState<Partial<Candidate> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partyAcronym.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOffice = selectedOfficeFilter === 'ALL' || c.office === selectedOfficeFilter;
    return matchesSearch && matchesOffice;
  });

  const handleOpenCreateModal = () => {
    setEditingCandidate({
      id: `custom-cand-${Date.now()}`,
      name: '',
      office: 'PRESIDENT',
      partyId: 'apc',
      partyAcronym: 'APC',
      partyColor: '#008751',
      gender: 'M',
      age: 50,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: '',
      keyPledges: ['Economic empowerment', 'Education reform', 'Infrastructure'],
      education: 'B.Sc. Political Science',
      status: 'COMMUNITY_PROPOSED',
      stateCode: 'LA',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cand: Candidate) => {
    setEditingCandidate({ ...cand });
    setIsModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate || !editingCandidate.name) return;

    const fullCandidate: Candidate = {
      id: editingCandidate.id || `cand-${Date.now()}`,
      name: editingCandidate.name,
      office: editingCandidate.office || 'PRESIDENT',
      partyId: editingCandidate.partyId || 'apc',
      partyAcronym: editingCandidate.partyAcronym || 'APC',
      partyColor: editingCandidate.partyColor || '#087443',
      gender: editingCandidate.gender || 'M',
      age: Number(editingCandidate.age) || 50,
      avatarUrl: editingCandidate.avatarUrl,
      bio: editingCandidate.bio || 'Demo candidate biography and policy background.',
      keyPledges: Array.isArray(editingCandidate.keyPledges)
        ? editingCandidate.keyPledges
        : [editingCandidate.keyPledges || 'Civic infrastructure priority'],
      education: editingCandidate.education || 'Higher Education Degree',
      runningMate: editingCandidate.runningMate,
      status: editingCandidate.status || 'COMMUNITY_PROPOSED',
      stateCode: editingCandidate.stateCode,
      senatorialDistrictId: editingCandidate.senatorialDistrictId,
      federalConstituencyId: editingCandidate.federalConstituencyId,
    };

    const exists = candidates.some((c) => c.id === fullCandidate.id);
    if (exists) {
      updateCandidate(fullCandidate);
      showToast(`Updated candidate record for ${fullCandidate.name}`);
    } else {
      addCandidate(fullCandidate);
      showToast(`Created new candidate: ${fullCandidate.name}`);
    }

    setIsModalOpen(false);
    setEditingCandidate(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete candidate ${name}?`)) {
      deleteCandidate(id);
      showToast(`Deleted candidate ${name}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F5F7F5] py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27332B] pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-widest">
                Demo Administration Suite
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Admin & Data Control Center
            </h1>
            <p className="text-xs text-[#A0ADA4] mt-1">
              Manage candidate rosters, verify demo data statuses, inspect political parties, and configure electoral zones.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Candidate</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#151D18] border border-emerald-500/60 px-4 py-3 rounded-xl shadow-2xl text-xs text-emerald-300 flex items-center space-x-2 animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#27332B] pb-2 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: BarChart3 },
            { id: 'candidates', label: `Candidates (${candidates.length})`, icon: Users },
            { id: 'parties', label: `Political Parties (${POLITICAL_PARTIES.length})`, icon: Building },
            { id: 'states', label: `States & Constituencies (${NIGERIAN_STATES.length})`, icon: MapPin },
            { id: 'settings', label: 'Demo Data Settings', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#151D18] text-emerald-400 border border-[#27332B] font-bold'
                    : 'text-[#A0ADA4] hover:bg-[#101713] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== TAB 1: OVERVIEW METRICS ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-2">
                <span className="text-[10px] font-mono text-[#6D7B71] uppercase">Total Candidates</span>
                <div className="text-3xl font-black text-white">{candidates.length}</div>
                <p className="text-[11px] text-emerald-400">Pres: {candidates.filter(c => c.office === 'PRESIDENT').length} · Gov: {candidates.filter(c => c.office === 'GOVERNOR').length}</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-2">
                <span className="text-[10px] font-mono text-[#6D7B71] uppercase">Registered Parties</span>
                <div className="text-3xl font-black text-white">{POLITICAL_PARTIES.length}</div>
                <p className="text-[11px] text-[#A0ADA4]">APC, PDP, LP, NNPP, SDP, ADC, etc.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-2">
                <span className="text-[10px] font-mono text-[#6D7B71] uppercase">States & FCT</span>
                <div className="text-3xl font-black text-white">37</div>
                <p className="text-[11px] text-[#A0ADA4]">109 Senatorial Districts · 360 Fed Seats</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-2">
                <span className="text-[10px] font-mono text-[#6D7B71] uppercase">Saved Lineups</span>
                <div className="text-3xl font-black text-white">{savedLineups.length}</div>
                <p className="text-[11px] text-[#A0ADA4]">Persisted in demo session</p>
              </div>
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Quick Candidate Registration</span>
                </h3>
                <p className="text-xs text-[#A0ADA4] leading-relaxed">
                  Add new prospective candidates for any federal or state constituency. All additions immediately update the candidate directory and ballot wizard dropdowns.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-[#151D18] hover:bg-[#1C2820] text-emerald-400 border border-[#27332B] hover:border-[#20C878] text-xs font-bold transition-colors"
                >
                  Open Candidate Form
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span>Reset & Seed Demo Store</span>
                </h3>
                <p className="text-xs text-[#A0ADA4] leading-relaxed">
                  Restore default presidential, gubernatorial, and senatorial candidates to default state if you wish to reset your testing environment.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset all candidates and lineups to factory defaults?')) {
                      resetAllToDefaults();
                      showToast('Factory demo defaults restored.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#151D18] hover:bg-red-950/40 text-red-400 border border-[#27332B] hover:border-red-500/50 text-xs font-bold transition-colors"
                >
                  Reset to Factory Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CANDIDATES MANAGEMENT ==================== */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#101713] border border-[#27332B] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7B71]" />
                <input
                  type="text"
                  placeholder="Search candidate records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151D18] text-[#F5F7F5] border border-[#27332B] focus:border-[#20C878] rounded-xl pl-10 pr-4 py-2 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={selectedOfficeFilter}
                  onChange={(e) => setSelectedOfficeFilter(e.target.value)}
                  className="bg-[#151D18] text-[#F5F7F5] border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                >
                  <option value="ALL">All Offices</option>
                  <option value="PRESIDENT">President</option>
                  <option value="GOVERNOR">Governor</option>
                  <option value="SENATOR">Senator</option>
                  <option value="REPRESENTATIVE">House of Reps</option>
                </select>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 rounded-xl bg-[#20C878] text-[#0B0F0D] font-bold text-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              </div>
            </div>

            {/* Candidate Table */}
            <div className="rounded-2xl bg-[#101713] border border-[#27332B] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151D18] text-[#6D7B71] font-mono uppercase text-[10px] border-b border-[#27332B]">
                    <tr>
                      <th className="px-4 py-3.5">Candidate</th>
                      <th className="px-4 py-3.5">Office</th>
                      <th className="px-4 py-3.5">Party</th>
                      <th className="px-4 py-3.5">Territory</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27332B]">
                    {filteredCandidates.map((c) => {
                      const st = c.stateCode ? getStateByCode(c.stateCode) : null;
                      return (
                        <tr key={c.id} className="hover:bg-[#151D18]/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-800">
                                {c.avatarUrl ? (
                                  <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-emerald-900 font-bold">
                                    {c.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-white">{c.name}</div>
                                <div className="text-[11px] text-[#6D7B71]">{c.education}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-[#151D18] text-emerald-400 font-mono text-[10px] uppercase font-bold border border-emerald-500/20">
                              {c.office}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                              style={{ backgroundColor: c.partyColor || '#087443' }}
                            >
                              {c.partyAcronym}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#A0ADA4]">
                            {c.office === 'PRESIDENT' ? 'Nigeria (Federal)' : `${st?.name || ''} State`}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-mono text-[#6D7B71]">
                              {c.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditModal(c)}
                                className="p-1.5 rounded-lg bg-[#151D18] hover:bg-[#1C2820] text-[#A0ADA4] hover:text-white"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(c.id, c.name)}
                                className="p-1.5 rounded-lg bg-[#151D18] hover:bg-red-950/40 text-[#6D7B71] hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: POLITICAL PARTIES ==================== */}
        {activeTab === 'parties' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POLITICAL_PARTIES.map((party) => (
              <div
                key={party.id}
                className="p-5 rounded-2xl bg-[#101713] border border-[#27332B] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-1 rounded text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: party.color }}
                  >
                    {party.acronym}
                  </span>
                  <span className="text-[10px] font-mono text-[#6D7B71]">Estd. {party.foundedYear}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{party.name}</h3>
                <p className="text-xs text-[#A0ADA4] italic">“{party.motto}”</p>
                <div className="pt-2 border-t border-[#27332B] text-[11px] text-[#6D7B71] space-y-1">
                  <div>Chair: <strong className="text-white">{party.nationalChairman}</strong></div>
                  <div>HQ: <span className="text-[#A0ADA4]">{party.headquarters}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== TAB 4: STATES & CONSTITUENCIES ==================== */}
        {activeTab === 'states' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {NIGERIAN_STATES.slice(0, 10).map((st) => (
                <div
                  key={st.code}
                  className="p-5 rounded-2xl bg-[#101713] border border-[#27332B] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{st.code}</span>
                      <h4 className="text-sm font-bold text-white">{st.name} {st.code === 'FC' ? '' : 'State'}</h4>
                    </div>
                    <span className="text-[10px] text-[#6D7B71]">{st.geoZone}</span>
                  </div>
                  <div className="text-xs text-[#A0ADA4]">
                    Capital: <strong className="text-white">{st.capital}</strong> · Landmark: {st.landmarkName}
                  </div>
                  <div className="pt-2 border-t border-[#27332B] text-[11px] text-[#6D7B71]">
                    <strong>Senatorial Districts:</strong> {st.senatorialDistricts.map(d => d.code).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: DEMO SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl bg-[#101713] border border-[#27332B] space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-white">Local Demo Settings</h3>
            <p className="text-xs text-[#A0ADA4] leading-relaxed">
              Manage your local prototype state. All candidate modifications, custom lineups, and preferences are stored in the browser’s LocalStorage for instant, zero-backend demo reliability.
            </p>

            <div className="pt-4 border-t border-[#27332B] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Restore Initial Datasets</h4>
                <p className="text-[11px] text-[#6D7B71]">Resets candidates, sample lineups, and default preferences.</p>
              </div>
              <button
                onClick={() => {
                  resetAllToDefaults();
                  showToast('Datasets reset to defaults.');
                }}
                className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-bold transition-colors"
              >
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Modal Form */}
      {isModalOpen && editingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101713] border border-[#27332B] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#27332B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCandidate.name ? `Edit Candidate: ${editingCandidate.name}` : 'Register New Candidate'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-[#151D18] text-[#A0ADA4] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A0ADA4] font-semibold mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={editingCandidate.name || ''}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                  className="w-full bg-[#151D18] text-white border border-[#27332B] focus:border-[#20C878] rounded-xl px-3 py-2 text-xs"
                  placeholder="e.g. Dr. Ngozi Adeleke"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A0ADA4] font-semibold mb-1">Contested Office</label>
                  <select
                    value={editingCandidate.office}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, office: e.target.value as Office })}
                    className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="PRESIDENT">President</option>
                    <option value="GOVERNOR">Governor</option>
                    <option value="SENATOR">Senator</option>
                    <option value="REPRESENTATIVE">House of Reps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A0ADA4] font-semibold mb-1">Political Party</label>
                  <select
                    value={editingCandidate.partyAcronym}
                    onChange={(e) => {
                      const party = POLITICAL_PARTIES.find(p => p.acronym === e.target.value);
                      setEditingCandidate({
                        ...editingCandidate,
                        partyAcronym: e.target.value,
                        partyId: party?.id || 'apc',
                        partyColor: party?.color || '#087443',
                      });
                    }}
                    className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  >
                    {POLITICAL_PARTIES.map((p) => (
                      <option key={p.id} value={p.acronym}>
                        {p.acronym} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#A0ADA4] font-semibold mb-1">State</label>
                  <select
                    value={editingCandidate.stateCode || 'LA'}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, stateCode: e.target.value })}
                    className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#A0ADA4] font-semibold mb-1">Gender</label>
                  <select
                    value={editingCandidate.gender || 'M'}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, gender: e.target.value as 'M' | 'F' })}
                    className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A0ADA4] font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={editingCandidate.age || 50}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, age: parseInt(e.target.value) || 50 })}
                    className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A0ADA4] font-semibold mb-1">Candidate Photo / Avatar URL</label>
                <input
                  type="url"
                  value={editingCandidate.avatarUrl || ''}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, avatarUrl: e.target.value })}
                  className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[#A0ADA4] font-semibold mb-1">Biography & Executive Summary</label>
                <textarea
                  rows={3}
                  required
                  value={editingCandidate.bio || ''}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, bio: e.target.value })}
                  className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  placeholder="Career background, key achievements, governance vision..."
                />
              </div>

              <div>
                <label className="block text-[#A0ADA4] font-semibold mb-1">Education & Qualifications</label>
                <input
                  type="text"
                  value={editingCandidate.education || ''}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, education: e.target.value })}
                  className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                  placeholder="e.g. M.Sc. Economics, University of Ibadan"
                />
              </div>

              <div>
                <label className="block text-[#A0ADA4] font-semibold mb-1">Data Verification Status</label>
                <select
                  value={editingCandidate.status || 'COMMUNITY_PROPOSED'}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, status: e.target.value as CandidateStatus })}
                  className="w-full bg-[#151D18] text-white border border-[#27332B] rounded-xl px-3 py-2 text-xs"
                >
                  <option value="COMMUNITY_PROPOSED">COMMUNITY PROPOSED</option>
                  <option value="ILLUSTRATIVE_DEMO">ILLUSTRATIVE DEMO</option>
                  <option value="VERIFIED_DEMO">VERIFIED DEMO</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#27332B] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#151D18] text-[#A0ADA4] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] text-xs font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
