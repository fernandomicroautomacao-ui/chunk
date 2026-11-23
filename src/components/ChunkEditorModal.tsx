/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Plus,
  Timer,
  Save,
  Tag
} from 'lucide-react';
import { DimensionKey } from '../types.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';
import { playSpeech } from '../utils/speech.ts';

interface ChunkEditorModalProps {
  dim: DimensionKey;
  branchName: string;
  initialChunk: string;
  onClose: () => void;
  onPracticeRhythm?: (phrase: string) => void;
}

export default function ChunkEditorModal({
  dim,
  branchName,
  initialChunk,
  onClose,
  onPracticeRhythm
}: ChunkEditorModalProps) {
  const {
    language,
    slotVocabulary,
    customWords,
    addSlotWord,
    addCustomWord,
    addPhraseToBranch
  } = useStudyStore();

  // Extract [slot] placeholders
  const slots = useMemo(() => {
    const matches = initialChunk.match(/\[([^\]]+)\]/g) || [];
    return Array.from(new Set(matches.map(m => m.slice(1, -1))));
  }, [initialChunk]);

  const [slotValues, setSlotValues] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    slots.forEach(s => {
      obj[s] = '';
    });
    return obj;
  });

  // Per-slot quick add word input
  const [newSlotWordInputs, setNewSlotWordInputs] = useState<Record<string, string>>({});

  // Custom extension / direct word inclusion
  const computedFromSlots = useMemo(() => {
    let result = initialChunk;
    slots.forEach(s => {
      const val = slotValues[s]?.trim();
      if (val) {
        result = result.split(`[${s}]`).join(val);
      }
    });
    return result;
  }, [initialChunk, slots, slotValues]);

  const [editedPhrase, setEditedPhrase] = useState<string>(initialChunk);
  const [isManuallyEdited, setIsManuallyEdited] = useState<boolean>(false);

  // Sync slot updates into editedPhrase unless user manually typed in the final phrase box
  useEffect(() => {
    if (!isManuallyEdited) {
      setEditedPhrase(computedFromSlots);
    }
  }, [computedFromSlots, isManuallyEdited]);

  const [quickWordInput, setQuickWordInput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAddWordToSlot = (slot: string) => {
    const val = (newSlotWordInputs[slot] || '').trim();
    if (!val) return;
    addSlotWord(slot, val);
    setSlotValues(prev => ({ ...prev, [slot]: val }));
    setNewSlotWordInputs(prev => ({ ...prev, [slot]: '' }));
    setIsManuallyEdited(false);
  };

  const handleAppendQuickWord = (wordToInsert?: string) => {
    const w = (wordToInsert ?? quickWordInput).trim();
    if (!w) return;
    addCustomWord(w);

    setEditedPhrase(prev => {
      const trimmed = prev.trim();
      const trailingPunct = /[.!?]$/.test(trimmed) ? trimmed.slice(-1) : '';
      const body = trailingPunct ? trimmed.slice(0, -1).trimEnd() : trimmed;
      return `${body} ${w}${trailingPunct}`;
    });
    setIsManuallyEdited(true);
    if (!wordToInsert) {
      setQuickWordInput('');
    }
  };

  const cleanFinalPhrase = editedPhrase.trim();

  const handleSaveToBranch = () => {
    if (!cleanFinalPhrase) return;
    addPhraseToBranch(dim, branchName, cleanFinalPhrase);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSendToRhythmLab = () => {
    if (!cleanFinalPhrase) return;
    // Also save any custom variation to the global branch if modified and doesn't contain raw brackets
    if (cleanFinalPhrase !== initialChunk && !cleanFinalPhrase.includes('[')) {
      addPhraseToBranch(dim, branchName, cleanFinalPhrase);
    }
    onClose();
    onPracticeRhythm?.(cleanFinalPhrase);
  };

  const handlePlay = () => {
    setIsPlayingAudio(true);
    playSpeech(cleanFinalPhrase, language, 0.95, () => setIsPlayingAudio(false));
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(cleanFinalPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl w-full max-w-xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c1)] mb-0.5">
              <Tag className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">
                {dim} → {branchName}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--ink)]">
              Incluir Palavras & Editar Chunk
            </h3>
            <p className="text-[11px] text-[var(--mute)]">
              Adicione novas palavras à base global, personalize este chunk ou envie direto ao Rhythm Lab.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--bg)] border border-[var(--line)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Original Chunk */}
        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
          <span className="text-[10px] uppercase font-bold text-[var(--mute)] tracking-wider block mb-1">
            Chunk Selecionado
          </span>
          <span className="text-sm font-mono font-semibold text-[var(--ink)]">
            {initialChunk}
          </span>
        </div>

        {/* Dynamic Slots with Global Word Picker & Add New Word */}
        {slots.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--ink)] block">
              Preencher ou incluir nova palavra no slot:
            </span>
            {slots.map(slot => {
              const suggestions = slotVocabulary[slot.toLowerCase()] || [];
              return (
                <div
                  key={slot}
                  className="p-3 rounded-xl bg-[var(--bg)]/60 border border-[var(--line)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--c1)]">
                      [{slot}]
                    </span>
                    <input
                      type="text"
                      value={slotValues[slot] || ''}
                      onChange={e => {
                        setIsManuallyEdited(false);
                        setSlotValues(prev => ({ ...prev, [slot]: e.target.value }));
                      }}
                      placeholder={`Digite valor para [${slot}]...`}
                      className="flex-1 max-w-xs px-2.5 py-1 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
                    />
                  </div>

                  {/* Global Word Chips for this slot */}
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.slice(0, 12).map(word => {
                        const isActive =
                          (slotValues[slot] || '').toLowerCase() === word.toLowerCase();
                        return (
                          <button
                            key={word}
                            type="button"
                            onClick={() => {
                              setIsManuallyEdited(false);
                              setSlotValues(prev => ({ ...prev, [slot]: word }));
                            }}
                            className={`px-2 py-0.5 text-[11px] rounded-md border transition-colors ${
                              isActive
                                ? 'bg-[var(--c1)] text-white border-[var(--c1)] font-semibold'
                                : 'bg-[var(--panel)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--c1)]'
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Add a brand new word directly into the global vocab for this slot */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newSlotWordInputs[slot] || ''}
                      onChange={e =>
                        setNewSlotWordInputs(prev => ({ ...prev, [slot]: e.target.value }))
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWordToSlot(slot);
                        }
                      }}
                      placeholder={`Nova palavra global para [${slot}]...`}
                      className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddWordToSlot(slot)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Salvar Palavra</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Append/Insert New Words Directly to the Chunk */}
        <div className="space-y-2 p-3 rounded-xl bg-[var(--bg)]/60 border border-[var(--line)]">
          <label className="text-xs font-bold text-[var(--ink)] block">
            Incluir nova palavra ou complemento direto na frase:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={quickWordInput}
              onChange={e => setQuickWordInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAppendQuickWord();
                }
              }}
              placeholder={
                language === 'en'
                  ? 'Ex: tomorrow, right now, please, after work...'
                  : 'Ex: domani, per favore, adesso, dopo lavoro...'
              }
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
            />
            <button
              type="button"
              onClick={() => handleAppendQuickWord()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--c1)] text-white hover:opacity-90 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Incluir</span>
            </button>
          </div>

          {customWords.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[var(--mute)] font-semibold">
                Suas palavras globais:
              </span>
              {customWords.slice(0, 10).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleAppendQuickWord(w)}
                  className="px-2 py-0.5 text-[11px] rounded-md border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
                >
                  + {w}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editable Final Output Box */}
        <div className="p-4 rounded-xl border-2 border-[var(--c1)]/40 bg-[var(--c1)]/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--c1)] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Frase Final (Editável)</span>
            </span>
            {isManuallyEdited && (
              <button
                type="button"
                onClick={() => {
                  setIsManuallyEdited(false);
                  setEditedPhrase(computedFromSlots);
                }}
                className="text-[11px] text-[var(--mute)] hover:text-[var(--ink)] underline"
              >
                Restaurar
              </button>
            )}
          </div>
          <textarea
            rows={2}
            value={editedPhrase}
            onChange={e => {
              setIsManuallyEdited(true);
              setEditedPhrase(e.target.value);
            }}
            className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] text-sm font-semibold focus:outline-none focus:border-[var(--c1)]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePlay}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--c1)] text-xs font-medium text-[var(--ink)] flex items-center gap-1"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  isPlayingAudio ? 'animate-pulse text-[var(--c1)]' : 'text-[var(--mute)]'
                }`}
              />
              <span>Ouvir</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--c1)] text-xs font-medium text-[var(--ink)] flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--mute)]" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToBranch}
              disabled={!cleanFinalPhrase}
              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-emerald-500 text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Salvo na ramificação!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Salvar no Mapa</span>
                </>
              )}
            </button>

            {onPracticeRhythm && (
              <button
                type="button"
                onClick={handleSendToRhythmLab}
                disabled={!cleanFinalPhrase}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Abrir no Rhythm Lab</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
