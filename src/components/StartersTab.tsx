/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X,
  Volume2,
  Sliders,
  Download,
  AudioWaveform,
  Timer
} from 'lucide-react';
import { ALL_INTENT_TAGS } from '../data/startersData.ts';
import { SentenceStarter, StarterType, StudyLanguage } from '../types.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';
import { playSpeech } from '../utils/speech.ts';
import { exportStartersToAnki } from '../utils/exportAnki.ts';
import SlotCustomizerModal from './SlotCustomizerModal.tsx';
import ConnectorsModal from './ConnectorsModal.tsx';
import ConnectedSpeechModal from './ConnectedSpeechModal.tsx';

interface StartersTabProps {
  language?: StudyLanguage;
  onPracticeRhythm?: (phrase: string) => void;
}

export default function StartersTab({ language = 'en', onPracticeRhythm }: StartersTabProps) {
  const { starters, addStarter, deleteStarter, resetStarters } = useStudyStore();

  // Reset UI filters when language changes
  useEffect(() => {
    setPairedQuestion(null);
    setPairedResponse(null);
    setActiveIntentTag('all');
    setActiveTypeFilter('all');
  }, [language]);

  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'question' | 'response'>('all');
  const [activeIntentTag, setActiveIntentTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pairing Sandbox State
  const [pairedQuestion, setPairedQuestion] = useState<SentenceStarter | null>(null);
  const [pairedResponse, setPairedResponse] = useState<SentenceStarter | null>(null);
  const [pairedCopied, setPairedCopied] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // New Modals State
  const [customizerPhrase, setCustomizerPhrase] = useState<string | null>(null);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [speechModalPhrase, setSpeechModalPhrase] = useState<string | null>(null);

  // Modal State for adding new starter
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<StarterType>('question');
  const [newIntentTag, setNewIntentTag] = useState<string>('Information Seeking');
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [newStarter, setNewStarter] = useState<string>('');
  const [newSituation, setNewSituation] = useState<string>('');
  const [newExample, setNewExample] = useState<string>('');

  // Set default pairing on mount for instant delight
  useEffect(() => {
    if (!pairedQuestion) {
      const q = starters.find(s => s.type === 'question');
      if (q) setPairedQuestion(q);
    }
    if (!pairedResponse) {
      const r = starters.find(s => s.type === 'response');
      if (r) setPairedResponse(r);
    }
  }, [starters, pairedQuestion, pairedResponse]);

  // Distinct intent tags available in the current starter set
  const availableIntentTags = useMemo(() => {
    const tags = new Set<string>();
    starters.forEach(s => {
      if (activeTypeFilter === 'all' || s.type === activeTypeFilter) {
        tags.add(s.intentTag);
      }
    });
    return Array.from(tags).sort();
  }, [starters, activeTypeFilter]);

  // Filtered lists
  const filteredStarters = useMemo(() => {
    return starters.filter(item => {
      if (activeTypeFilter !== 'all' && item.type !== activeTypeFilter) return false;
      if (activeIntentTag !== 'all' && item.intentTag !== activeIntentTag) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStarter = item.starter.toLowerCase().includes(q);
        const matchSituation = item.situation.toLowerCase().includes(q);
        const matchExample = item.example.toLowerCase().includes(q);
        const matchTag = item.intentTag.toLowerCase().includes(q);
        return matchStarter || matchSituation || matchExample || matchTag;
      }
      return true;
    });
  }, [starters, activeTypeFilter, activeIntentTag, searchQuery]);

  const questionsList = useMemo(
    () => filteredStarters.filter(s => s.type === 'question'),
    [filteredStarters]
  );

  const responsesList = useMemo(
    () => filteredStarters.filter(s => s.type === 'response'),
    [filteredStarters]
  );

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyPair = () => {
    if (!pairedQuestion && !pairedResponse) return;
    const text = `Q: ${pairedQuestion ? pairedQuestion.starter : ''}\nA: ${pairedResponse ? pairedResponse.starter : ''}`;
    try {
      navigator.clipboard.writeText(text);
      setPairedCopied(true);
      setTimeout(() => setPairedCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePlayAudio = (phrase: string) => {
    setPlayingAudio(phrase);
    playSpeech(phrase, language, 0.95, () => setPlayingAudio(null));
  };

  const handleExportAnki = () => {
    exportStartersToAnki(starters, language);
  };

  const handleAddNewStarter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStarter.trim()) return;

    const finalTag = customTagInput.trim() || newIntentTag;

    const newItem: SentenceStarter = {
      id: `custom-${Date.now()}`,
      type: newType,
      intentTag: finalTag,
      starter: newStarter.trim(),
      situation: newSituation.trim() || 'Custom sentence starter added by user',
      example: newExample.trim() || newStarter.trim(),
      isCustom: true
    };

    addStarter(newItem);
    setIsAddModalOpen(false);

    // Reset inputs
    setNewStarter('');
    setNewSituation('');
    setNewExample('');
    setCustomTagInput('');
  };

  const handleDeleteCustom = (id: string) => {
    deleteStarter(id);
    if (pairedQuestion?.id === id) setPairedQuestion(null);
    if (pairedResponse?.id === id) setPairedResponse(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar a biblioteca original de inícios de frases?')) {
      resetStarters();
      setActiveIntentTag('all');
      setActiveTypeFilter('all');
    }
  };

  // Helper to render phrase with bracket highlights
  const renderHighlightedPhrase = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return (
      <span>
        {parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            return (
              <span
                key={index}
                className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--line)]/30 font-semibold text-[var(--c1)]"
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg)] text-[var(--ink)] overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">

        {/* Pairing / Dialogue Simulation Sandbox */}
        <section className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4 md:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--line)]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--c1)]" />
                <h2 className="text-sm font-semibold tracking-tight text-[var(--ink)]">
                  Dialogue Flow Builder · Pairing Sandbox
                </h2>
              </div>
              <p className="text-xs text-[var(--mute)] mt-0.5">
                Simulate a real-time exchange by pairing an asking starter with an answering starter.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handlePlayAudio(`${pairedQuestion?.starter || ''}. ${pairedResponse?.starter || ''}`)}
                disabled={!pairedQuestion && !pairedResponse}
                title="Ouvir diálogo completo"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] transition-colors disabled:opacity-50"
              >
                <Volume2 className={`w-3.5 h-3.5 ${playingAudio ? 'animate-pulse text-[var(--c1)]' : ''}`} />
                <span>Ouvir Diálogo</span>
              </button>

              <button
                onClick={handleCopyPair}
                disabled={!pairedQuestion && !pairedResponse}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] transition-colors disabled:opacity-50"
              >
                {pairedCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Dialogue Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Q&A Pair</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question side */}
            <div className="rounded-lg border border-[var(--line)] p-3 bg-[var(--bg)]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--mute)] mb-1.5">
                  <span className="font-semibold text-[var(--c2)] flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Question (Asking Starter)
                  </span>
                  {pairedQuestion && (
                    <span className="text-[11px] font-mono text-[var(--mute)]">
                      {pairedQuestion.intentTag}
                    </span>
                  )}
                </div>
                {pairedQuestion ? (
                  <div className="text-sm font-medium leading-relaxed mt-1 text-[var(--ink)]">
                    {renderHighlightedPhrase(pairedQuestion.starter)}
                    <p className="text-xs text-[var(--mute)] mt-2 italic">
                      Ex: &ldquo;{pairedQuestion.example}&rdquo;
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--mute)] py-4 text-center">
                    Click &ldquo;Pair&rdquo; on any question starter below.
                  </p>
                )}
              </div>
            </div>

            {/* Response side */}
            <div className="rounded-lg border border-[var(--line)] p-3 bg-[var(--bg)]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--mute)] mb-1.5">
                  <span className="font-semibold text-[var(--c0)] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Response (Answering Starter)
                  </span>
                  {pairedResponse && (
                    <span className="text-[11px] font-mono text-[var(--mute)]">
                      {pairedResponse.intentTag}
                    </span>
                  )}
                </div>
                {pairedResponse ? (
                  <div className="text-sm font-medium leading-relaxed mt-1 text-[var(--ink)]">
                    {renderHighlightedPhrase(pairedResponse.starter)}
                    <p className="text-xs text-[var(--mute)] mt-2 italic">
                      Ex: &ldquo;{pairedResponse.example}&rdquo;
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--mute)] py-4 text-center">
                    Click &ldquo;Pair&rdquo; on any response starter below.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar & Filter Controls */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search starter, keyword, or slot (e.g. [topic], clarify)..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--ink)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions: Connectors, Anki Export, Add New & Reset Defaults */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsConnectorsOpen(true)}
                title="Conectores de Pensamento & Fillers"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--c2)] hover:text-[var(--c2)] transition-colors text-[var(--ink)] shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--c2)]" />
                <span>Conectores</span>
              </button>

              <button
                type="button"
                onClick={handleExportAnki}
                title="Exportar biblioteca para cartões do Anki (.txt)"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--c3)] hover:text-[var(--c3)] transition-colors text-[var(--ink)] shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[var(--c3)]" />
                <span>Exportar Anki</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--c1)] text-white hover:opacity-90 transition-opacity shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sentence Starter</span>
              </button>

              <button
                onClick={handleResetDefaults}
                title="Restore default starters"
                className="p-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--mute)] text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Segmented Controls for Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-[var(--panel)] border border-[var(--line)] rounded-lg">
              <button
                onClick={() => setActiveTypeFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTypeFilter === 'all'
                    ? 'bg-[var(--line)]/40 text-[var(--ink)] font-semibold'
                    : 'text-[var(--mute)] hover:text-[var(--ink)]'
                }`}
              >
                All Starters ({starters.length})
              </button>
              <button
                onClick={() => setActiveTypeFilter('question')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTypeFilter === 'question'
                    ? 'bg-[var(--line)]/40 text-[var(--c2)] font-semibold'
                    : 'text-[var(--mute)] hover:text-[var(--ink)]'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                Asking Starters ({starters.filter(s => s.type === 'question').length})
              </button>
              <button
                onClick={() => setActiveTypeFilter('response')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTypeFilter === 'response'
                    ? 'bg-[var(--line)]/40 text-[var(--c0)] font-semibold'
                    : 'text-[var(--mute)] hover:text-[var(--ink)]'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                Answering Starters ({starters.filter(s => s.type === 'response').length})
              </button>
            </div>

            {/* Intent Tag Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              <span className="text-[11px] text-[var(--mute)] font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Intent:
              </span>
              <button
                onClick={() => setActiveIntentTag('all')}
                className={`px-2 py-0.5 text-xs rounded-md transition-colors shrink-0 ${
                  activeIntentTag === 'all'
                    ? 'font-semibold text-[var(--ink)] underline underline-offset-4'
                    : 'text-[var(--mute)] hover:text-[var(--ink)]'
                }`}
              >
                All Tags
              </button>
              {availableIntentTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveIntentTag(tag)}
                  className={`px-2 py-0.5 text-xs rounded-md transition-colors shrink-0 ${
                    activeIntentTag === tag
                      ? 'font-semibold text-[var(--c1)] underline underline-offset-4'
                      : 'text-[var(--mute)] hover:text-[var(--ink)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Dual Column Content: Asking (Questions) & Answering (Responses) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Asking Starters Column */}
          {(activeTypeFilter === 'all' || activeTypeFilter === 'question') && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--c2)]" />
                  <h3 className="text-sm font-semibold text-[var(--ink)]">
                    Início de Frases para Perguntar
                  </h3>
                </div>
                <span className="text-xs text-[var(--mute)] tabular-nums">
                  {questionsList.length} {questionsList.length === 1 ? 'starter' : 'starters'}
                </span>
              </div>

              {questionsList.length === 0 ? (
                <div className="text-xs text-[var(--mute)] p-6 text-center border border-dashed border-[var(--line)] rounded-lg">
                  No asking starters found matching your filters.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {questionsList.map(item => (
                    <StarterCard
                      key={item.id}
                      item={item}
                      accentColor="var(--c2)"
                      isCopied={copiedId === item.id}
                      isPaired={pairedQuestion?.id === item.id}
                      isPlaying={playingAudio === item.starter}
                      onPlayAudio={() => handlePlayAudio(item.starter)}
                      onAnalyzeSpeech={() => setSpeechModalPhrase(item.example || item.starter)}
                      onPracticeRhythm={onPracticeRhythm ? () => onPracticeRhythm(item.example || item.starter) : undefined}
                      onCustomize={item.starter.includes('[') ? () => setCustomizerPhrase(item.starter) : undefined}
                      onCopy={() => handleCopy(item.starter, item.id)}
                      onPair={() => setPairedQuestion(item)}
                      onDelete={item.isCustom ? () => handleDeleteCustom(item.id) : undefined}
                      renderPhrase={renderHighlightedPhrase}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Answering Starters Column */}
          {(activeTypeFilter === 'all' || activeTypeFilter === 'response') && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--c0)]" />
                  <h3 className="text-sm font-semibold text-[var(--ink)]">
                    Início de Frases para Responder
                  </h3>
                </div>
                <span className="text-xs text-[var(--mute)] tabular-nums">
                  {responsesList.length} {responsesList.length === 1 ? 'starter' : 'starters'}
                </span>
              </div>

              {responsesList.length === 0 ? (
                <div className="text-xs text-[var(--mute)] p-6 text-center border border-dashed border-[var(--line)] rounded-lg">
                  No answering starters found matching your filters.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {responsesList.map(item => (
                    <StarterCard
                      key={item.id}
                      item={item}
                      accentColor="var(--c0)"
                      isCopied={copiedId === item.id}
                      isPaired={pairedResponse?.id === item.id}
                      isPlaying={playingAudio === item.starter}
                      onPlayAudio={() => handlePlayAudio(item.starter)}
                      onAnalyzeSpeech={() => setSpeechModalPhrase(item.example || item.starter)}
                      onPracticeRhythm={onPracticeRhythm ? () => onPracticeRhythm(item.example || item.starter) : undefined}
                      onCustomize={item.starter.includes('[') ? () => setCustomizerPhrase(item.starter) : undefined}
                      onCopy={() => handleCopy(item.starter, item.id)}
                      onPair={() => setPairedResponse(item)}
                      onDelete={item.isCustom ? () => handleDeleteCustom(item.id) : undefined}
                      renderPhrase={renderHighlightedPhrase}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

      </div>

      {/* Add New Starter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl w-full max-w-lg p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                Adicionar Início de Frase (Sentence Starter)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--mute)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewStarter} className="flex flex-col gap-3 text-xs">
              {/* Type selector */}
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">Tipo de Início</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('question')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      newType === 'question'
                        ? 'border-[var(--c2)] bg-[var(--c2)]/10 text-[var(--c2)] font-semibold'
                        : 'border-[var(--line)] text-[var(--mute)]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Para Perguntar (Question)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('response')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      newType === 'response'
                        ? 'border-[var(--c0)] bg-[var(--c0)]/10 text-[var(--c0)] font-semibold'
                        : 'border-[var(--line)] text-[var(--mute)]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Para Responder (Response)
                  </button>
                </div>
              </div>

              {/* Intent Tag */}
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">Tag de Intenção (Intent Tag)</label>
                <select
                  value={newIntentTag}
                  onChange={e => setNewIntentTag(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
                >
                  {ALL_INTENT_TAGS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="custom">-- Custom Intent Tag --</option>
                </select>
                {newIntentTag === 'custom' && (
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={e => setCustomTagInput(e.target.value)}
                    placeholder="Enter custom intent tag..."
                    className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
                    required
                  />
                )}
              </div>

              {/* Starter formula */}
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Início de Frase (Use [slots] para variáveis substituíveis)
                </label>
                <input
                  type="text"
                  value={newStarter}
                  onChange={e => setNewStarter(e.target.value)}
                  placeholder="Ex: Would you mind [verb-ing] [item]?"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)] font-mono text-xs"
                  required
                />
              </div>

              {/* Context / Situation */}
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">Situação / Contexto de Uso</label>
                <input
                  type="text"
                  value={newSituation}
                  onChange={e => setNewSituation(e.target.value)}
                  placeholder="Ex: Soft request when asking a supervisor or client"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
                />
              </div>

              {/* Full Example */}
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">Exemplo de Frase Completa</label>
                <input
                  type="text"
                  value={newExample}
                  onChange={e => setNewExample(e.target.value)}
                  placeholder="Ex: Would you mind reviewing this proposal tomorrow?"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--c1)] text-white font-medium hover:opacity-90"
                >
                  Salvar Início
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Slot Customizer Modal */}
      {customizerPhrase && (
        <SlotCustomizerModal
          initialPhrase={customizerPhrase}
          language={language}
          onClose={() => setCustomizerPhrase(null)}
          onPracticeRhythm={onPracticeRhythm}
        />
      )}

      {/* Connectors Modal */}
      {isConnectorsOpen && (
        <ConnectorsModal
          language={language}
          onClose={() => setIsConnectorsOpen(false)}
        />
      )}

      {/* Connected Speech Modal */}
      {speechModalPhrase && (
        <ConnectedSpeechModal
          phrase={speechModalPhrase}
          language={language}
          onClose={() => setSpeechModalPhrase(null)}
        />
      )}
    </div>
  );
}

interface StarterCardProps {
  item: SentenceStarter;
  accentColor: string;
  isCopied: boolean;
  isPaired: boolean;
  isPlaying?: boolean;
  onPlayAudio: () => void;
  onAnalyzeSpeech?: () => void;
  onPracticeRhythm?: () => void;
  onCustomize?: () => void;
  onCopy: () => void;
  onPair: () => void;
  onDelete?: () => void;
  renderPhrase: (text: string) => React.ReactNode;
}

function StarterCard({
  item,
  accentColor,
  isCopied,
  isPaired,
  isPlaying,
  onPlayAudio,
  onAnalyzeSpeech,
  onPracticeRhythm,
  onCustomize,
  onCopy,
  onPair,
  onDelete,
  renderPhrase
}: StarterCardProps) {
  return (
    <div
      style={{ borderLeftColor: accentColor }}
      className={`group bg-[var(--panel)] border border-[var(--line)] border-l-3 rounded-lg p-3 shadow-2xs hover:shadow-xs transition-shadow flex flex-col gap-2 ${
        isPaired ? 'ring-1 ring-[var(--c1)] bg-[var(--bg)]/30' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-[var(--mute)]">
          <span className="font-semibold text-[var(--ink)]">{item.intentTag}</span>
          {item.isCustom && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[11px] text-[var(--c1)] font-mono">Custom</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPlayAudio}
            title="Ouvir pronúncia"
            className="text-xs p-1 rounded-md border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] text-[var(--mute)] transition-colors"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse text-[var(--c1)]' : ''}`} />
          </button>

          {onAnalyzeSpeech && (
            <button
              type="button"
              onClick={onAnalyzeSpeech}
              title="Analisar fala conectada e pronúncia nativa"
              className="text-xs p-1 rounded-md border border-[var(--line)] hover:border-amber-500 hover:text-amber-500 text-[var(--mute)] transition-colors"
            >
              <AudioWaveform className="w-3.5 h-3.5" />
            </button>
          )}

          {onPracticeRhythm && (
            <button
              type="button"
              onClick={onPracticeRhythm}
              title="Treinar ritmo no Rhythm Lab"
              className="text-xs p-1 rounded-md border border-[var(--line)] hover:border-rose-500 hover:text-rose-500 text-[var(--mute)] transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
            </button>
          )}

          {onCustomize && (
            <button
              type="button"
              onClick={onCustomize}
              title="Personalizar slots desta frase"
              className="text-xs p-1 rounded-md border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] text-[var(--mute)] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onPair}
            title="Use in Dialogue Pairing Sandbox"
            className={`text-xs px-2 py-0.5 rounded-md border transition-colors flex items-center gap-1 ${
              isPaired
                ? 'border-[var(--c1)] text-[var(--c1)] font-medium bg-[var(--c1)]/10'
                : 'border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <ArrowRight className="w-3 h-3" />
            <span>{isPaired ? 'Paired' : 'Pair'}</span>
          </button>

          <button
            onClick={onCopy}
            title="Copy starter formula"
            className="text-xs p-1 rounded-md border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] text-[var(--mute)] transition-colors"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete custom starter"
              className="text-xs p-1 rounded-md border border-[var(--line)] hover:border-red-500 hover:text-red-500 text-[var(--mute)] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="text-sm font-medium leading-relaxed text-[var(--ink)]">
        {renderPhrase(item.starter)}
      </div>

      <div className="text-xs text-[var(--mute)] flex flex-col gap-0.5 pt-1 border-t border-[var(--line)]/50">
        <div className="flex items-baseline gap-1">
          <span className="font-medium text-[var(--ink)] shrink-0">Context:</span>
          <span className="italic">{item.situation}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-medium text-[var(--ink)] shrink-0">Example:</span>
          <span className="font-serif text-[13px] text-[var(--ink)]">&ldquo;{item.example}&rdquo;</span>
        </div>
      </div>
    </div>
  );
}
