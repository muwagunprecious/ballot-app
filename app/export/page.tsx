'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBallotStore } from '@/lib/ballot/store';
import { BallotCard } from '@/components/ballot/BallotCard';
import { exportBallotAsPng, triggerCelebration } from '@/lib/export';
import { generateCaption } from '@/lib/captions';
import { CaptionLanguage, CaptionTone, CardAspectRatio, CardStylePreset } from '@/types/ballot';
import {
  Download,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  Edit,
  RotateCcw,
  Languages,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function ExportPage() {
  const router = useRouter();
  const { currentLineup, updateCurrentLineup, saveLineup } = useBallotStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<CaptionLanguage>('english');
  const [selectedTone, setSelectedTone] = useState<CaptionTone>('direct');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [customCaptionText, setCustomCaptionText] = useState('');

  // Generate initial caption
  useEffect(() => {
    const gen = generateCaption({
      lineup: currentLineup,
      language: selectedLanguage,
      tone: selectedTone,
    });
    setCustomCaptionText(gen.text + '\n\n' + gen.hashtags.join(' '));
  }, [currentLineup, selectedLanguage, selectedTone]);

  // Initial celebratory confetti when arriving on export page
  useEffect(() => {
    triggerCelebration();
  }, []);

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const stateSlug = currentLineup.stateCode ? `${currentLineup.stateCode.toLowerCase()}-` : '';
      const filename = `my-2027-lineup-${stateSlug}${currentLineup.aspectRatio}.png`;
      await exportBallotAsPng(cardRef.current, filename, currentLineup.aspectRatio);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(customCaptionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Platform sharing intents
  const handleShareOnX = () => {
    const shareText = encodeURIComponent(customCaptionText);
    const url = encodeURIComponent('https://my2027lineup.ng');
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`, '_blank');
  };

  const handleShareOnWhatsApp = () => {
    const shareText = encodeURIComponent(customCaptionText + '\nhttps://my2027lineup.ng');
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const handleShareOnFacebook = () => {
    const url = encodeURIComponent('https://my2027lineup.ng');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const aspectRatios: { id: CardAspectRatio; label: string; sub: string }[] = [
    { id: 'twitter_landscape', label: 'X / Landscape', sub: '1200 × 675' },
    { id: 'instagram_square', label: 'IG / Square', sub: '1080 × 1080' },
    { id: 'instagram_portrait', label: 'FB / Portrait', sub: '1080 × 1350' },
    { id: 'whatsapp_status', label: 'WhatsApp Status', sub: '1080 × 1920' },
  ];

  const stylePresets: { id: CardStylePreset; label: string }[] = [
    { id: 'emerald_classic', label: 'Emerald Classic' },
    { id: 'obsidian_minimal', label: 'Obsidian Dark' },
    { id: 'civic_heritage', label: 'Civic Heritage' },
  ];

  const languages: { id: CaptionLanguage; name: string }[] = [
    { id: 'english', name: 'English' },
    { id: 'pidgin', name: 'Nigerian Pidgin' },
    { id: 'yoruba', name: 'Yorùbá' },
    { id: 'hausa', name: 'Hausa' },
    { id: 'igbo', name: 'Asụsụ Igbo' },
  ];

  const tones: { id: CaptionTone; name: string }[] = [
    { id: 'direct', name: 'Short & Direct' },
    { id: 'community', name: 'Community-Focused' },
    { id: 'civic', name: 'Civic & Thoughtful' },
    { id: 'conversational', name: 'Casual & Conversational' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F5F7F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Success Banner */}
        <div className="p-6 rounded-2xl bg-[#151D18] border border-[#20C878]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono uppercase font-bold text-emerald-400">
                Lineup Generated Successfully
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Your 2027 General Election Lineup is Ready
            </h1>
            <p className="text-xs text-[#A0ADA4]">
              Inspect your card, customize caption language & tone, and export a high-resolution graphic for social media.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/wizard"
              className="px-3.5 py-2 rounded-xl bg-[#101713] border border-[#27332B] hover:border-[#384A3E] text-xs font-semibold text-[#A0ADA4] hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Selections</span>
            </Link>
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs flex items-center space-x-2 transition-all shadow-[0_4px_16px_rgba(32,200,120,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PNG...' : 'Download PNG'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Card Preview with Format & Theme Switchers */}
          <div className="lg:col-span-7 space-y-4">
            {/* Aspect Ratio & Theme Bar */}
            <div className="p-4 rounded-2xl bg-[#101713] border border-[#27332B] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Format switcher */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono text-[#6D7B71] uppercase mr-1">Format:</span>
                  {aspectRatios.map((ar) => (
                    <button
                      key={ar.id}
                      onClick={() => updateCurrentLineup({ aspectRatio: ar.id })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        currentLineup.aspectRatio === ar.id
                          ? 'bg-[#20C878] text-[#0B0F0D] font-bold'
                          : 'bg-[#151D18] text-[#A0ADA4] border border-[#27332B] hover:border-[#384A3E]'
                      }`}
                    >
                      <span>{ar.label}</span>
                    </button>
                  ))}
                </div>

                {/* Theme Preset switcher */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono text-[#6D7B71] uppercase mr-1">Style:</span>
                  {stylePresets.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateCurrentLineup({ stylePreset: st.id })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        (currentLineup.stylePreset || 'emerald_classic') === st.id
                          ? 'bg-[#151D18] text-emerald-400 border border-[#20C878] font-bold'
                          : 'bg-[#151D18] text-[#A0ADA4] border border-[#27332B] hover:border-[#384A3E]'
                      }`}
                    >
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High-Resolution Live Card Container */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#101713] border border-[#27332B] flex items-center justify-center overflow-hidden">
              <div className="w-full flex justify-center">
                <BallotCard
                  ref={cardRef}
                  lineup={currentLineup}
                  stylePreset={currentLineup.stylePreset}
                  aspectRatio={currentLineup.aspectRatio}
                />
              </div>
            </div>

            {/* Export Disclaimer & Tips */}
            <div className="p-4 rounded-xl bg-[#101713] border border-[#27332B] flex items-start space-x-3 text-xs text-[#A0ADA4]">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                The exported PNG contains only the crisp ballot graphic rendered at 2.5× retina resolution, ready for direct upload to social feeds and status stories.
              </p>
            </div>
          </div>

          {/* RIGHT: Actions, Social Sharing & AI Caption Generator */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Share Buttons */}
            <div className="p-5 rounded-2xl bg-[#101713] border border-[#27332B] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Lineup Card</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={handleShareOnX}
                  className="p-3 rounded-xl bg-[#151D18] border border-[#27332B] hover:border-[#384A3E] hover:bg-[#1C2820] flex flex-col items-center justify-center space-y-1 text-xs font-semibold text-white transition-colors"
                >
                  <TwitterIcon className="w-4 h-4 text-[#1DA1F2]" />
                  <span>X / Twitter</span>
                </button>

                <button
                  onClick={handleShareOnWhatsApp}
                  className="p-3 rounded-xl bg-[#151D18] border border-[#27332B] hover:border-[#384A3E] hover:bg-[#1C2820] flex flex-col items-center justify-center space-y-1 text-xs font-semibold text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleShareOnFacebook}
                  className="p-3 rounded-xl bg-[#151D18] border border-[#27332B] hover:border-[#384A3E] hover:bg-[#1C2820] flex flex-col items-center justify-center space-y-1 text-xs font-semibold text-white transition-colors"
                >
                  <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={handleDownloadPng}
                  disabled={isExporting}
                  className="flex-1 py-3 rounded-xl bg-[#20C878] hover:bg-[#1db56c] text-[#0B0F0D] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_2px_12px_rgba(32,200,120,0.25)]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : 'Download Card (PNG)'}</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-3 rounded-xl bg-[#151D18] border border-[#27332B] hover:border-[#384A3E] text-xs font-semibold text-[#A0ADA4] hover:text-white flex items-center space-x-1.5 transition-colors"
                  title="Copy Platform Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* AI Caption Generator */}
            <div className="p-5 rounded-2xl bg-[#101713] border border-[#27332B] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Caption Generator (Demo AI)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Multilingual
                </span>
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A0ADA4] flex items-center space-x-1">
                  <Languages className="w-3.5 h-3.5 text-[#6D7B71]" />
                  <span>Language</span>
                </label>
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLanguage(l.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedLanguage === l.id
                          ? 'bg-[#20C878] text-[#0B0F0D] font-bold'
                          : 'bg-[#151D18] text-[#A0ADA4] border border-[#27332B] hover:border-[#384A3E]'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A0ADA4] flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-[#6D7B71]" />
                  <span>Tone of Voice</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className={`p-2 rounded-xl text-left border text-xs transition-colors ${
                        selectedTone === t.id
                          ? 'bg-[#151D18] border-[#20C878] text-emerald-400 font-bold'
                          : 'bg-[#151D18] border-[#27332B] text-[#A0ADA4] hover:border-[#384A3E]'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6D7B71]">
                  <span>Generated Caption</span>
                  <span>{customCaptionText.length} characters</span>
                </div>

                <textarea
                  rows={6}
                  value={customCaptionText}
                  onChange={(e) => setCustomCaptionText(e.target.value)}
                  className="w-full bg-[#151D18] text-white border border-[#27332B] focus:border-[#20C878] focus:ring-1 focus:ring-[#20C878] rounded-xl p-3 text-xs leading-relaxed transition-colors font-sans resize-y"
                  placeholder="Your customized social caption..."
                />

                <button
                  onClick={handleCopyCaption}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    copiedCaption
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#151D18] text-white border border-[#27332B] hover:border-[#20C878] hover:text-[#20C878]'
                  }`}
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Caption Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Next Steps */}
            <div className="flex items-center justify-between text-xs text-[#A0ADA4] pt-2">
              <Link
                href="/profile"
                className="hover:text-emerald-400 underline underline-offset-4 transition-colors"
              >
                View in Demo History
              </Link>
              <Link
                href="/wizard"
                className="hover:text-emerald-400 underline underline-offset-4 transition-colors"
              >
                Create another lineup →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
