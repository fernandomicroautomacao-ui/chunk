/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Volume2, Copy, Check, Sparkles, RefreshCw, Sliders, Plus, Timer } from 'lucide-react';
import { playSpeech } from '../utils/speech.ts';
import { StudyLanguage } from '../types.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';

interface SlotCustomizerModalProps {
  initialPhrase: string;
  language: StudyLanguage;
  contextNote?: string;
  onClose: () => void;
  onPracticeRhythm?: (phrase: string) => void;
}

export default function SlotCustomizerModal({
  initialPhrase,
  language,
  contextNote,
  onClose,
  onPracticeRhythm
}: SlotCustomizerModalProps) {
  const { slotVocabulary, addSlotWord } = useStudyStore();
  const [newWordInputs, setNewWordInputs] = useState<Record<string, string>>({});
  // Extract all [slots] from the phrase
  const slots = useMemo(() => {
    const matches = initialPhrase.match(/\[([^\]]+)\]/g) || [];
    // Deduplicate slot names while preserving order
    return Array.from(new Set(matches.map(m => m.slice(1, -1))));
  }, [initialPhrase]);

  // State for user inputs for each slot
  const [slotValues, setSlotValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    slots.forEach(slot => {
      initial[slot] = '';
    });
    return initial;
  });

  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Compute final substituted phrase
  const finalPhrase = useMemo(() => {
    let result = initialPhrase;
    slots.forEach(slot => {
      const val = slotValues[slot]?.trim();
      const replacement = val || `[${slot}]`;
      // Replace all occurrences of [slot]
      result = result.split(`[${slot}]`).join(replacement);
    });
    return result;
  }, [initialPhrase, slots, slotValues]);

  const handleInputChange = (slot: string, value: string) => {
    setSlotValues(prev => ({
      ...prev,
      [slot]: value
    }));
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(finalPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    playSpeech(finalPhrase, language, 0.95, () => setIsPlayingAudio(false));
  };

  const handleClearSlots = () => {
    const empty: Record<string, string> = {};
    slots.forEach(s => { empty[s] = ''; });
    setSlotValues(empty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl w-full max-w-lg p-5 md:p-6 shadow-xl flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--c1)]" />
            <h3 className="text-sm font-semibold text-[var(--ink)]">
              Preenchedor Dinâmico de Slots
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--line)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Context / Formula info */}
        <div>
          <span className="text-[11px] font-semibold text-[var(--mute)] uppercase tracking-wider">
            Fórmula Base do Chunk
          </span>
          <p className="text-xs font-mono text-[var(--mute)] bg-[var(--bg)]/70 p-2.5 rounded-lg border border-[var(--line)]/60 mt-1">
            {initialPhrase}
          </p>
          {contextNote && (
            <p className="text-[11px] text-[var(--mute)] mt-1 italic">
              Contexto: {contextNote}
            </p>
          )}
        </div>

        {/* Slot Input Fields */}
        {slots.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--ink)]">
                Preencha os campos variáveis:
              </span>
              <button
                type="button"
                onClick={handleClearSlots}
                className="text-[11px] text-[var(--mute)] hover:text-[var(--ink)] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Limpar campos
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {slots.map(slot => {
                const suggestions = slotVocabulary[slot.toLowerCase()] || [];
                return (
                  <div key={slot} className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[var(--bg)]/60 border border-[var(--line)]">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-[var(--c1)] font-mono">
                        [{slot}]
                      </label>
                      <input
                        type="text"
                        value={slotValues[slot] || ''}
                        onChange={e => handleInputChange(slot, e.target.value)}
                        placeholder={`Digite o valor para [${slot}]...`}
                        className="flex-1 max-w-xs px-2.5 py-1 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)] transition-colors"
                      />
                    </div>
                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {suggestions.slice(0, 10).map(word => (
                          <button
                            key={word}
                            type="button"
                            onClick={() => handleInputChange(slot, word)}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                              (slotValues[slot] || '').toLowerCase() === word.toLowerCase()
                                ? 'bg-[var(--c1)] text-white border-[var(--c1)] font-semibold'
                                : 'bg-[var(--panel)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--c1)]'
                            }`}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newWordInputs[slot] || ''}
                        onChange={e => setNewWordInputs(prev => ({ ...prev, [slot]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const w = (newWordInputs[slot] || '').trim();
                            if (w) {
                              addSlotWord(slot, w);
                              handleInputChange(slot, w);
                              setNewWordInputs(prev => ({ ...prev, [slot]: '' }));
                            }
                          }
                        }}
                        placeholder={`Incluir nova palavra global em [${slot}]...`}
                        className="flex-1 px-2 py-1 text-[10px] rounded-md border border-dashed border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const w = (newWordInputs[slot] || '').trim();
                          if (w) {
                            addSlotWord(slot, w);
                            handleInputChange(slot, w);
                            setNewWordInputs(prev => ({ ...prev, [slot]: '' }));
                          }
                        }}
                        className="px-2 py-1 text-[10px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-0.5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--mute)] p-3 bg-[var(--bg)] rounded-lg">
            Essa frase não possui slots entre colchetes. Ela já está completa e pronta para uso!
          </div>
        )}

        {/* Live Result Preview Box */}
        <div className="rounded-xl border-2 border-[var(--c1)]/40 bg-[var(--c1)]/5 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--c1)] flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Resultado Final Pronto para Uso
            </span>
            <span className="text-[11px] font-mono text-[var(--mute)]">
              {language === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English'}
            </span>
          </div>

          <p className="text-sm font-semibold text-[var(--ink)] leading-relaxed">
            {finalPhrase}
          </p>
        </div>

        {/* Actions (Audio & Copy & Rhythm Lab) */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isPlayingAudio ? 'text-[var(--c1)] border-[var(--c1)]' : 'text-[var(--ink)] hover:border-[var(--c1)]'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-[var(--c1)]' : ''}`} />
            <span>{isPlayingAudio ? 'Reproduzindo...' : 'Ouvir Pronúncia'}</span>
          </button>

          {onPracticeRhythm && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPracticeRhythm(finalPhrase);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Rhythm Lab</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-1.5 rounded-lg bg-[var(--c1)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Frase Pronta</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
