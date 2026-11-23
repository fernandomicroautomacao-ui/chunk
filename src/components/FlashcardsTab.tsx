/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronRight,
  Eye,
  HelpCircle,
  MessageSquare,
  Award
} from 'lucide-react';
import { DEFAULT_STARTERS } from '../data/startersData.ts';
import { ITALIAN_STARTERS } from '../data/italianData.ts';
import { getConnectorsForLanguage } from '../data/connectorsData.ts';
import { DIMS } from '../data/chunkMapData.ts';
import { SentenceStarter, StudyLanguage } from '../types.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';
import { playSpeech } from '../utils/speech.ts';
import SlotCustomizerModal from './SlotCustomizerModal.tsx';

interface FlashcardsTabProps {
  language: StudyLanguage;
}

export default function FlashcardsTab({ language }: FlashcardsTabProps) {
  const { starters, chunkData, isDefaultPhrase } = useStudyStore();

  // Deck of cards
  const deck = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      tag: string;
      type: 'question' | 'response' | 'connector';
      frontPrompt: string;
      blankedPhrase: string;
      fullPhrase: string;
      example: string;
      note: string;
    }> = [];

    starters.forEach((s: SentenceStarter) => {
      // Create blanked phrase (replace brackets with _______)
      const blanked = s.starter.replace(/\[([^\]]+)\]/g, '_______');
      list.push({
        id: s.id,
        title: s.type === 'question' ? 'Pergunta (Asking Starter)' : 'Resposta (Answering Starter)',
        tag: s.intentTag,
        type: s.type,
        frontPrompt: s.situation,
        blankedPhrase: blanked,
        fullPhrase: s.starter,
        example: s.example,
        note: `Exemplo real: "${s.example}"`
      });
    });

    const connectors = getConnectorsForLanguage(language);
    connectors.forEach(c => {
      list.push({
        id: c.id,
        title: 'Conector de Fala (Speech Bridge)',
        tag: c.category,
        type: 'connector',
        frontPrompt: `${c.purpose} (${c.translation})`,
        blankedPhrase: c.phrase.slice(0, 3) + '_______...',
        fullPhrase: c.phrase,
        example: c.example,
        note: `Tradução: ${c.translation}`
      });
    });

    // Include custom chunks and custom branches from the global Chunk Map
    DIMS.forEach(dim => {
      const branches = chunkData[dim] || {};
      Object.keys(branches).forEach(branch => {
        branches[branch].forEach((phrase, idx) => {
          if (!isDefaultPhrase(dim, branch, phrase)) {
            list.push({
              id: `custom-chunk-${dim}-${branch}-${idx}`,
              title: 'Chunk Personalizado do Grafo',
              tag: `${dim} → ${branch}`,
              type: 'response',
              frontPrompt: `Ramificação: ${dim} (${branch})`,
              blankedPhrase: phrase.replace(/\[([^\]]+)\]/g, '_______'),
              fullPhrase: phrase,
              example: phrase,
              note: `Criado por você em ${dim} → ${branch}`
            });
          }
        });
      });
    });

    // Shuffle deck
    return list.sort(() => Math.random() - 0.5);
  }, [starters, chunkData, isDefaultPhrase, language]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Slot customizer modal state
  const [customizerPhrase, setCustomizerPhrase] = useState<string | null>(null);

  // Reset index when language changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
  }, [language]);

  const currentCard = deck[currentIndex];

  const handlePlayAudio = (phrase: string) => {
    setIsPlayingAudio(true);
    playSpeech(phrase, language, 0.95, () => setIsPlayingAudio(false));
  };

  const handleNext = (mastered: boolean) => {
    if (!currentCard) return;

    if (mastered) {
      setMasteredIds(prev => new Set(prev).add(currentCard.id));
      setReviewIds(prev => {
        const next = new Set(prev);
        next.delete(currentCard.id);
        return next;
      });
    } else {
      setReviewIds(prev => new Set(prev).add(currentCard.id));
    }

    setIsRevealed(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
  };

  if (!currentCard || deck.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-8 h-8 text-[var(--c1)] mb-2" />
        <h3 className="text-base font-bold text-[var(--ink)]">Nenhum cartão disponível</h3>
      </div>
    );
  }

  const isCompleted = currentIndex >= deck.length - 1 && isRevealed && (masteredIds.has(currentCard.id) || reviewIds.has(currentCard.id));
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg)] text-[var(--ink)] overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full p-4 md:p-6 flex flex-col gap-5">

        {/* Header & Stats Bar */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--c1)]/10 text-[var(--c1)]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-[var(--ink)]">
                Flashcards & Treino Ativo de Chunks
              </h2>
              <p className="text-xs text-[var(--mute)]">
                Treine a formulação rápida de chunks e inícios de conversação ({language === 'it' ? 'Italiano 🇮🇹' : 'Inglês 🇬🇧'}).
              </p>
            </div>
          </div>

          {/* Counters */}
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {masteredIds.size} Dominados
            </span>
            <span aria-hidden="true" className="text-[var(--line)]">|</span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <RotateCcw className="w-3.5 h-3.5" />
              {reviewIds.size} Revisar
            </span>
            <button
              onClick={handleRestart}
              title="Reiniciar sessão"
              className="p-1 rounded-md border border-[var(--line)] hover:border-[var(--mute)] text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[var(--panel)] rounded-full h-2 overflow-hidden border border-[var(--line)]/50">
          <div
            className="bg-[var(--c1)] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--mute)] px-1">
          <span>Cartão {currentIndex + 1} de {deck.length}</span>
          <span>{progressPercent}% Concluído</span>
        </div>

        {/* The Flashcard */}
        <div className="bg-[var(--panel)] border-2 border-[var(--line)] rounded-2xl p-6 md:p-8 shadow-md flex flex-col justify-between min-h-[320px] transition-all">

          {/* Card Top: Category and Type badge */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]/60">
            <div className="flex items-center gap-2 text-xs">
              {currentCard.type === 'question' && (
                <span className="text-[var(--c2)] font-semibold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Pergunta
                </span>
              )}
              {currentCard.type === 'response' && (
                <span className="text-[var(--c0)] font-semibold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Resposta
                </span>
              )}
              {currentCard.type === 'connector' && (
                <span className="text-[var(--c3)] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Conector de Fala
                </span>
              )}
              <span aria-hidden="true" className="text-[var(--mute)]">·</span>
              <span className="text-[var(--mute)] font-mono text-[11px]">{currentCard.tag}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePlayAudio(isRevealed ? currentCard.fullPhrase : currentCard.example)}
                className="p-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--c1)] text-[var(--mute)] hover:text-[var(--c1)] transition-colors"
                title="Ouvir áudio"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-[var(--c1)]' : ''}`} />
              </button>

              {currentCard.fullPhrase.includes('[') && (
                <button
                  type="button"
                  onClick={() => setCustomizerPhrase(currentCard.fullPhrase)}
                  className="p-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--c1)] text-[var(--mute)] hover:text-[var(--c1)] transition-colors"
                  title="Personalizar slots desta frase"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Card Middle: Front Challenge vs Back Reveal */}
          <div className="my-6 flex flex-col justify-center items-center text-center gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--mute)]">
                Situação / Intenção Comunicativa
              </span>
              <p className="text-sm md:text-base font-medium text-[var(--ink)] mt-1 max-w-xl">
                {currentCard.frontPrompt}
              </p>
            </div>

            {!isRevealed ? (
              <div className="p-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)]/50 w-full max-w-lg">
                <span className="text-xs text-[var(--mute)] block mb-1">Como você começaria essa frase?</span>
                <p className="text-base font-serif italic text-[var(--mute)]">
                  &ldquo;{currentCard.blankedPhrase}&rdquo;
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border-2 border-[var(--c1)]/50 bg-[var(--c1)]/5 w-full max-w-lg flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-xs font-semibold text-[var(--c1)] uppercase tracking-wider">
                  Chunk Correto
                </span>
                <p className="text-base md:text-lg font-bold text-[var(--ink)] leading-snug">
                  {currentCard.fullPhrase}
                </p>
                <p className="text-xs text-[var(--mute)] italic pt-2 border-t border-[var(--line)]/50">
                  {currentCard.note}
                </p>
              </div>
            )}
          </div>

          {/* Card Bottom: Reveal / Actions */}
          <div className="pt-4 border-t border-[var(--line)]/60 flex items-center justify-between">
            {!isRevealed ? (
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                className="w-full py-2.5 rounded-xl bg-[var(--c1)] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-xs transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Revelar Resposta (Reveal Chunk)</span>
              </button>
            ) : (
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleNext(false)}
                  className="py-2.5 px-3 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Preciso Revisar (Hard)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNext(true)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Já Dominei (Easy)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Completion Modal / Message when finished */}
        {isCompleted && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-5 text-center flex flex-col items-center gap-2">
            <Award className="w-8 h-8 text-emerald-500" />
            <h4 className="text-base font-bold text-[var(--ink)]">
              Parabéns! Rodada Concluída!
            </h4>
            <p className="text-xs text-[var(--mute)] max-w-md">
              Você revisou todos os cartões desta sessão. Foram dominados {masteredIds.size} chunks!
            </p>
            <button
              onClick={handleRestart}
              className="mt-2 px-4 py-2 rounded-lg bg-[var(--c1)] text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Praticar Novamente</span>
            </button>
          </div>
        )}

      </div>

      {/* Slot Customizer Modal */}
      {customizerPhrase && (
        <SlotCustomizerModal
          initialPhrase={customizerPhrase}
          language={language}
          onClose={() => setCustomizerPhrase(null)}
        />
      )}
    </div>
  );
}
