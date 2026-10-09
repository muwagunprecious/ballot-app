'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBallotStore, DEMO_USER_PROFILE } from '@/lib/ballot/store';
import { BallotCard } from '@/components/ballot/BallotCard';
import { getStateByCode } from '@/lib/data/states';
import { LineupSelection } from '@/types/ballot';
import {
  User,
  Vote,
  Calendar,
  MapPin,
  Trash2,
  Edit,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { savedLineups, deleteSavedLineup, updateCurrentLineup } = useBallotStore();
  const [selectedPreviewLineup, setSelectedPreviewLineup] = useState<LineupSelection | null>(
    savedLineups[0] || null
  );

  const handleEditLineup = (lineup: LineupSelection) => {
    updateCurrentLineup(lineup);
    router.push('/wizard');
  };

  const handleExportLineup = (lineup: LineupSelection) => {
    updateCurrentLineup(lineup);
    router.push('/export');
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F5F7F5] py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#101713] border border-[#27332B] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shrink-0 bg-zinc-800">
              <img
                src={DEMO_USER_PROFILE.avatarUrl}
                alt={DEMO_USER_PROFILE.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {DEMO_USER_PROFILE.name}
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase font-bold border border-emerald-500/20">
                  Demo Citizen
                </span>
              </div>
              <p className="text-xs font-mono text-[#20C878]">{DEMO_USER_PROFILE.handle}</p>
              <p className="text-xs text-[#A0ADA4] max-w-xl leading-relaxed pt-1">
                {DEMO_USER_PROFILE.bio}
              </p>
              <div className="flex items-center space-x-4 text-[11px] text-[#6D7B71] pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lagos State, Nigeria</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {DEMO_USER_PROFILE.joinedDate}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-[#27332B] pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono uppercase text-[#6D7B71]">Created Lineups</span>
              <div className="text-2xl font-mono font-bold text-white">{savedLineups.length}</div>
            </div>

            <Link
              href="/wizard"
              className="px-4 py-2 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Lineup</span>
            </Link>
          </div>
        </div>

        {/* 2-Column History & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Lineups List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
                <Vote className="w-4 h-4 text-emerald-400" />
                <span>Saved Lineup History ({savedLineups.length})</span>
              </h2>
              <span className="text-[11px] text-[#6D7B71]">Stored in browser session</span>
            </div>

            {savedLineups.length > 0 ? (
              <div className="space-y-3">
                {savedLineups.map((lineup) => {
                  const state = getStateByCode(lineup.stateCode);
                  const isSelected = selectedPreviewLineup?.id === lineup.id;
                  const dateStr = new Date(lineup.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={lineup.id}
                      onClick={() => setSelectedPreviewLineup(lineup)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#151D18] border-[#20C878] shadow-[0_0_12px_rgba(32,200,120,0.15)]'
                          : 'bg-[#101713] border-[#27332B] hover:border-[#384A3E]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {state?.name || 'Nigeria'}
                          </span>
                          <span className="text-[10px] text-[#6D7B71] font-mono">
                            {lineup.stylePreset.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{lineup.title}</h3>
                        <div className="flex items-center space-x-3 text-[11px] text-[#6D7B71]">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{dateStr}</span>
                          </span>
                          <span>•</span>
                          <span>Format: {lineup.aspectRatio.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportLineup(lineup);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs flex items-center space-x-1 transition-colors"
                          title="Export & Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLineup(lineup);
                          }}
                          className="p-1.5 rounded-lg bg-[#151D18] border border-[#27332B] hover:border-[#384A3E] text-[#A0ADA4] hover:text-white"
                          title="Edit Lineup"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedLineup(lineup.id);
                            if (selectedPreviewLineup?.id === lineup.id) {
                              setSelectedPreviewLineup(null);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#151D18] border border-[#27332B] hover:border-red-500/50 text-[#6D7B71] hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#101713] border border-[#27332B] text-center space-y-3">
                <Vote className="w-8 h-8 text-[#6D7B71] mx-auto" />
                <h3 className="text-sm font-bold text-white">No Saved Lineups Yet</h3>
                <p className="text-xs text-[#A0ADA4]">
                  Create your first personalized candidate card for 2027 to see it saved here.
                </p>
                <Link
                  href="/wizard"
                  className="inline-flex px-4 py-2 rounded-xl bg-[#20C878] text-[#0B0F0D] font-bold text-xs"
                >
                  Build a Lineup
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Active Selected Card Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#101713] border border-[#27332B] space-y-4 sticky top-28">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase font-bold text-white">Card Preview</h3>
                {selectedPreviewLineup && (
                  <button
                    onClick={() => handleExportLineup(selectedPreviewLineup)}
                    className="text-xs text-emerald-400 hover:text-white font-semibold flex items-center space-x-1"
                  >
                    <span>Full Export Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {selectedPreviewLineup ? (
                <div className="flex justify-center w-full">
                  <BallotCard
                    lineup={selectedPreviewLineup}
                    aspectRatio="twitter_landscape"
                    stylePreset={selectedPreviewLineup.stylePreset}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#6D7B71]">
                  Select a lineup from the list to preview its ballot card here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
