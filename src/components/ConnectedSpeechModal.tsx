/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Volume2, Square, Sparkles, Copy, Check, BookOpen, Layers } from 'lucide-react';
import { StudyLanguage } from '../types.ts';
import { getConnectedSpeechBreakdown } from '../data/connectedSpeechData.ts';
import { playSpeech, stopSpeech } from '../utils/speech.ts';

interface ConnectedSpeechModalProps {
  phrase: string;
  language: StudyLanguage;
  onClose: () => void;
  onOpenSpeechTab?: () => void;
}

export default function ConnectedSpeechModal({
  phrase,
  language,
  onClose,
  onOpenSpeechTab
}: ConnectedSpeechModalProps) {
  const [isPlaying, setIsPlaying] = useState<'careful' | 'natural' | null>(null);
  const [copied, setCopied] = useState(false);

  const breakdown = getConnectedSpeechBreakdown(phrase, language);

  const handlePlay = (type: 'careful' | 'natural') => {
    stopSpeech();
    setIsPlaying(type);
    const rate = type === 'careful' ? 0.75 : 1.0;
    const textToSpeak = type === 'careful' ? phrase.replace(/\//g, ' , ') : phrase;

    playSpeech(textToSpeak, language, rate, () => {
      setIsPlaying(null);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${breakdown.natural}\n(Original: ${phrase})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl p-5 md:p-6 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm md:text-base text-[var(--ink)]">
                Análise de Fala Conectada
              </h3>
              <p className="text-[11px] text-[var(--mute)]">
                Como um falante nativo pronuncia esta frase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-[var(--bg)] text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Careful */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--mute)]">
                Pronúncia Didática (Palavras Separadas)
              </span>
              <p className="text-xs font-mono mt-1.5 text-[var(--ink)] leading-relaxed">
                {breakdown.careful}
              </p>
            </div>
            <button
              onClick={() => (isPlaying === 'careful' ? stopSpeech() : handlePlay('careful'))}
              className="mt-3 flex items-center gap-1.5 text-xs text-[var(--mute)] hover:text-[var(--ink)] font-medium pt-2 border-t border-[var(--line)]"
            >
              {isPlaying === 'careful' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current text-rose-500" />
                  <span className="text-rose-500">Parar</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>0.75× Ouvir pausado</span>
                </>
              )}
            </button>
          </div>

          {/* Natural */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                Fala Natural Nativa
              </span>
              <p className="text-sm font-bold mt-1.5 text-[var(--ink)] leading-relaxed tracking-tight">
                {breakdown.natural}
              </p>
            </div>
            <button
              onClick={() => (isPlaying === 'natural' ? stopSpeech() : handlePlay('natural'))}
              className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold pt-2 border-t border-amber-500/20"
            >
              {isPlaying === 'natural' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current text-rose-500" />
                  <span className="text-rose-500">Parar</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>1.0× Ouvir ritmo real</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Phonetic Observations */}
        <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Fenômenos Fonéticos Identificados:</span>
          </div>
          <ul className="space-y-1 text-xs text-[var(--mute)] pl-1">
            {breakdown.notes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="text-[var(--ink)] text-[11px] leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--line)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Análise</span>
              </>
            )}
          </button>

          {onOpenSpeechTab && (
            <button
              onClick={() => {
                onClose();
                onOpenSpeechTab();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--c1)] text-white hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver os 5 Fenômenos</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
