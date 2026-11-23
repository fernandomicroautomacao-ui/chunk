/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Copy,
  Check,
  MessageCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Volume2,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { SITUATION_GUIDES } from '../data/situationsData.ts';
import { ITALIAN_SITUATIONS } from '../data/italianData.ts';
import { SituationGuide, StudyLanguage } from '../types.ts';
import { playSpeech } from '../utils/speech.ts';
import SlotCustomizerModal from './SlotCustomizerModal.tsx';
import ConnectedSpeechModal from './ConnectedSpeechModal.tsx';

interface SituationsTabProps {
  language?: StudyLanguage;
}

export default function SituationsTab({ language = 'en' }: SituationsTabProps) {
  const activeGuides = language === 'it' ? ITALIAN_SITUATIONS : SITUATION_GUIDES;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSituationId, setSelectedSituationId] = useState<string>(activeGuides[0].id);
  const [copiedChunk, setCopiedChunk] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [customizerPhrase, setCustomizerPhrase] = useState<string | null>(null);
  const [speechModalPhrase, setSpeechModalPhrase] = useState<string | null>(null);

  // Sync selected situation when language changes
  React.useEffect(() => {
    setSelectedSituationId(activeGuides[0].id);
    setActiveCategory('all');
  }, [language, activeGuides]);

  const categories = React.useMemo(() => {
    return Array.from(new Set(activeGuides.map(s => s.category)));
  }, [activeGuides]);

  // Challenge answers state: record of situationId -> selected option index
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, number | null>>({});

  const filteredSituations = activeCategory === 'all'
    ? activeGuides
    : activeGuides.filter(s => s.category === activeCategory);

  const activeSituation = activeGuides.find(s => s.id === selectedSituationId) || activeGuides[0];

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedChunk(text);
      setTimeout(() => setCopiedChunk(null), 2000);
    } catch {
      // ignore
    }
  };

  const handlePlayAudio = (text: string) => {
    setPlayingAudio(text);
    playSpeech(text, language, 0.95, () => setPlayingAudio(null));
  };

  const handleSelectOption = (situationId: string, index: number) => {
    setChallengeAnswers(prev => ({
      ...prev,
      [situationId]: index
    }));
  };

  const selectedAnswerIndex = challengeAnswers[activeSituation.id] ?? null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg)] text-[var(--ink)] overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">

        {/* Hero Header */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4 md:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--c1)]" />
              <h2 className="text-base font-semibold tracking-tight text-[var(--ink)]">
                Situational Tips & Cultural Playbook
              </h2>
            </div>
            <p className="text-xs text-[var(--mute)] mt-1 max-w-2xl leading-relaxed">
              Descubra como os nativos realmente se comunicam em situações reais de alta pressão. Aprenda a polidez cultural, o que dizer (*DOs*), o que evitar (*DON&apos;Ts*) e pratique com desafios interativos.
            </p>
          </div>

          <div className="text-xs text-[var(--mute)] flex items-center gap-3 shrink-0 bg-[var(--bg)]/70 px-3 py-2 rounded-lg border border-[var(--line)]">
            <span className="flex items-center gap-1 font-medium text-[var(--ink)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {activeGuides.length} Cenários Reais
            </span>
            <span aria-hidden="true">·</span>
            <span>Prática Guiada</span>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              activeCategory === 'all'
                ? 'bg-[var(--line)]/40 text-[var(--ink)] font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            Todos os Cenários ({activeGuides.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeCategory === cat
                  ? 'bg-[var(--line)]/40 text-[var(--c1)] font-semibold'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main 2-Column Split: Scenarios List (Left) & Deep Dive View (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Scenarios Selector Cards (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-[var(--mute)] uppercase tracking-wider px-1">
              Selecione o Cenário
            </span>
            <div className="flex flex-col gap-2">
              {filteredSituations.map(sit => {
                const isSelected = sit.id === activeSituation.id;
                const isAnswered = challengeAnswers[sit.id] !== undefined && challengeAnswers[sit.id] !== null;
                const isCorrect = isAnswered && sit.practiceChallenge.options[challengeAnswers[sit.id]!].isBest;

                return (
                  <button
                    key={sit.id}
                    onClick={() => setSelectedSituationId(sit.id)}
                    className={`text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 relative group ${
                      isSelected
                        ? 'border-[var(--c1)] bg-[var(--panel)] shadow-xs ring-1 ring-[var(--c1)]/30'
                        : 'border-[var(--line)] bg-[var(--panel)]/60 hover:bg-[var(--panel)] hover:border-[var(--mute)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-[var(--c2)]">
                        {sit.category}
                      </span>
                      {isAnswered && (
                        <span className={`text-[11px] font-medium flex items-center gap-0.5 ${
                          isCorrect ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                          {isCorrect ? 'Desafio Superado' : 'Respondido'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-[var(--ink)] leading-snug">
                      {sit.title}
                    </h4>

                    <p className="text-[11px] text-[var(--mute)] line-clamp-2 leading-relaxed">
                      {sit.context}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[var(--mute)] pt-1 border-t border-[var(--line)]/40 mt-0.5">
                      <span>{sit.recommendedChunks.length} chunks recomendados</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-[var(--c1)]' : 'opacity-40'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Guide & Practice (8 cols on lg) */}
          <div className="lg:col-span-8 flex flex-col gap-5 bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 md:p-6 shadow-xs">

            {/* Header of selected scenario */}
            <div className="pb-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-2 text-xs text-[var(--mute)] mb-1">
                <span className="font-semibold text-[var(--c2)]">{activeSituation.category}</span>
                <span aria-hidden="true">·</span>
                <span>Guia Situacional Prático</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-[var(--ink)]">
                {activeSituation.title}
              </h3>
              <p className="text-xs text-[var(--mute)] mt-1.5 leading-relaxed">
                {activeSituation.context}
              </p>
            </div>

            {/* Cultural Tip Callout */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[var(--ink)] mb-1">
                  Dica de Ouro Cultural & Entonação
                </h4>
                <p className="text-xs text-[var(--ink)]/90 leading-relaxed">
                  {activeSituation.culturalTip}
                </p>
              </div>
            </div>

            {/* DOs & DONTs side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DOs */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DOs (O que fazer e dizer)</span>
                </div>
                <ul className="text-xs space-y-2 text-[var(--ink)] leading-relaxed">
                  {activeSituation.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DONTs */}
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>DON&apos;Ts (O que evitar a todo custo)</span>
                </div>
                <ul className="text-xs space-y-2 text-[var(--ink)] leading-relaxed">
                  {activeSituation.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Chunks for this situation */}
            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-semibold text-[var(--mute)] tracking-wider">
                  Chunks Recomendados para o Cenário
                </h4>
                <span className="text-[11px] text-[var(--mute)]">Clique no ícone para copiar</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {activeSituation.recommendedChunks.map((chunk, idx) => {
                  const isCopied = copiedChunk === chunk.starter;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)]/40 hover:bg-[var(--bg)] transition-colors flex items-start justify-between gap-3 group"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-semibold ${
                            chunk.type === 'question' ? 'text-[var(--c2)]' : 'text-[var(--c0)]'
                          }`}>
                            {chunk.label}
                          </span>
                          <span aria-hidden="true" className="text-[var(--mute)]">·</span>
                          <span className="text-[11px] text-[var(--mute)]">{chunk.purpose}</span>
                        </div>
                        <p className="text-xs font-mono font-medium text-[var(--ink)]">
                          {chunk.starter}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(chunk.starter)}
                          title="Ouvir pronúncia"
                          className="p-1.5 rounded-md border border-[var(--line)] text-[var(--mute)] hover:text-[var(--c1)] hover:border-[var(--c1)] transition-colors"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingAudio === chunk.starter ? 'animate-pulse text-[var(--c1)]' : ''}`} />
                        </button>

                        {chunk.starter.includes('[') && (
                          <button
                            type="button"
                            onClick={() => setCustomizerPhrase(chunk.starter)}
                            title="Personalizar slots desta frase"
                            className="p-1.5 rounded-md border border-[var(--line)] text-[var(--mute)] hover:text-[var(--c1)] hover:border-[var(--c1)] transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSpeechModalPhrase(chunk.starter)}
                          title="Analisar fala conectada e pronúncia nativa"
                          className="p-1.5 rounded-md border border-[var(--line)] text-[var(--mute)] hover:text-amber-500 hover:border-amber-500 transition-colors"
                        >
                          <AudioWaveform className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleCopy(chunk.starter)}
                          title="Copiar chunk"
                          className="p-1.5 rounded-md border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] hover:border-[var(--c1)] shrink-0 transition-colors"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample Dialogue Box */}
            <div className="rounded-lg border border-[var(--line)] p-4 bg-[var(--bg)]/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
                  <MessageCircle className="w-4 h-4 text-[var(--c1)]" />
                  <span>Exemplo de Diálogo Real</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlayAudio(`${activeSituation.sampleDialogue.textA}. ${activeSituation.sampleDialogue.textB}`)}
                  title="Ouvir diálogo completo"
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-[var(--line)] text-[var(--mute)] hover:text-[var(--c1)] hover:border-[var(--c1)]"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Ouvir Diálogo</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--line)]/60 text-[var(--mute)] flex items-start justify-between gap-2">
                  <span>{activeSituation.sampleDialogue.textA}</span>
                  <button
                    onClick={() => handlePlayAudio(activeSituation.sampleDialogue.textA)}
                    title="Ouvir"
                    className="p-1 text-[var(--mute)] hover:text-[var(--c1)] shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--c1)]/10 border border-[var(--c1)]/30 text-[var(--ink)] font-medium flex items-start justify-between gap-2">
                  <span>{activeSituation.sampleDialogue.textB}</span>
                  <button
                    onClick={() => handlePlayAudio(activeSituation.sampleDialogue.textB)}
                    title="Ouvir"
                    className="p-1 text-[var(--c1)] hover:opacity-80 shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Practice Challenge */}
            <div className="rounded-lg border border-[var(--line)] p-4 bg-[var(--panel)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-semibold text-[var(--ink)]">
                    Desafio Prático: Como você responderia?
                  </h4>
                </div>
                {selectedAnswerIndex !== null && (
                  <button
                    onClick={() => handleSelectOption(activeSituation.id, -1)}
                    className="text-[11px] text-[var(--mute)] hover:text-[var(--ink)] underline"
                  >
                    Tentar Novamente
                  </button>
                )}
              </div>

              <p className="text-xs text-[var(--ink)] font-medium">
                {activeSituation.practiceChallenge.prompt}
              </p>

              <div className="flex flex-col gap-2">
                {activeSituation.practiceChallenge.options.map((option, idx) => {
                  const isSelected = selectedAnswerIndex === idx;
                  const showResult = selectedAnswerIndex !== null && selectedAnswerIndex >= 0;

                  let optionStyles = 'border-[var(--line)] hover:border-[var(--c1)] bg-[var(--bg)]/40';
                  if (showResult) {
                    if (option.isBest) {
                      optionStyles = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200';
                    } else if (isSelected && !option.isBest) {
                      optionStyles = 'border-red-500 bg-red-500/10 text-red-950 dark:text-red-200';
                    } else {
                      optionStyles = 'opacity-50 border-[var(--line)]';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showResult}
                      onClick={() => handleSelectOption(activeSituation.id, idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex flex-col gap-1.5 ${optionStyles}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium leading-relaxed">{option.text}</span>
                        {showResult && option.isBest && (
                          <span className="shrink-0 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Recomendado
                          </span>
                        )}
                        {showResult && isSelected && !option.isBest && (
                          <span className="shrink-0 text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Evitar
                          </span>
                        )}
                      </div>

                      {showResult && (isSelected || option.isBest) && (
                        <p className={`text-[11px] leading-relaxed pt-1 border-t ${
                          option.isBest ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'border-red-500/30 text-red-700 dark:text-red-300'
                        }`}>
                          {option.feedback}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Slot Customizer Modal */}
      {customizerPhrase && (
        <SlotCustomizerModal
          initialPhrase={customizerPhrase}
          language={language}
          onClose={() => setCustomizerPhrase(null)}
        />
      )}

      {/* Connected Speech Breakdown Modal */}
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
