/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, GitBranch, Timer, Check } from 'lucide-react';
import { DIMS } from '../data/chunkMapData.ts';
import { DimensionKey } from '../types.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';

interface NewBranchModalProps {
  initialDim?: DimensionKey;
  initialBranchName?: string;
  onClose: () => void;
  onCreated?: (dim: DimensionKey, branchName: string, primaryPhrase: string, openRhythm: boolean) => void;
}

export default function NewBranchModal({
  initialDim = 'lugar',
  initialBranchName = '',
  onClose,
  onCreated
}: NewBranchModalProps) {
  const { language, chunkData, customWords, addBranch, addCustomWord } = useStudyStore();

  const [selectedDim, setSelectedDim] = useState<DimensionKey>(initialDim);
  const [branchName, setBranchName] = useState<string>(initialBranchName);
  const [phrasesText, setPhrasesText] = useState<string>('');
  const [newWordHelper, setNewWordHelper] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const existingBranches = Object.keys(chunkData[selectedDim] || {});

  const handleInsertSnippet = (snippet: string) => {
    setPhrasesText(prev => (prev ? `${prev}${prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' '}${snippet}` : snippet));
  };

  const handleAddGlobalWordAndInsert = () => {
    const w = newWordHelper.trim();
    if (!w) return;
    addCustomWord(w);
    handleInsertSnippet(w);
    setNewWordHelper('');
  };

  const handleSubmit = (openRhythm: boolean) => {
    const cleanBranch = branchName.trim().toLowerCase();
    const lines = phrasesText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (!cleanBranch) {
      setErrorMsg('Informe o nome da nova ramificação (ex: academia, hotel, reunião).');
      return;
    }
    if (lines.length === 0) {
      setErrorMsg('Adicione pelo menos uma frase ou chunk para esta ramificação.');
      return;
    }

    addBranch(selectedDim, cleanBranch, lines);
    onClose();
    onCreated?.(selectedDim, cleanBranch, lines[0], openRhythm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl w-full max-w-lg p-5 md:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Expandir Grafo & Base Global</span>
            </div>
            <h3 className="text-base font-bold text-[var(--ink)]">
              Criar Nova Ramificação
            </h3>
            <p className="text-[11px] text-[var(--mute)]">
              Crie um novo nó de contexto ou adicione novos chunks a uma ramificação existente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--bg)] border border-[var(--line)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dimension Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)] block">
            1. Dimensão do Grafo
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {DIMS.map((d, i) => {
              const active = selectedDim === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDim(d)}
                  style={active ? { borderColor: `var(--c${i})`, color: `var(--c${i})` } : undefined}
                  className={`py-1.5 px-1 rounded-lg border text-[11px] font-semibold capitalize transition-colors ${
                    active
                      ? 'bg-[var(--bg)] ring-1 ring-current'
                      : 'border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Branch Name Input + quick pick existing */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)] block">
            2. Nome da Ramificação (Nó)
          </label>
          <input
            type="text"
            value={branchName}
            onChange={e => {
              setBranchName(e.target.value);
              setErrorMsg('');
            }}
            placeholder={
              language === 'en'
                ? 'Ex: academia, hotel, reunião, aeroporto...'
                : 'Ex: palestra, stazione, albergo...'
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
          />
          <div className="flex flex-wrap gap-1 pt-0.5">
            <span className="text-[10px] text-[var(--mute)] self-center mr-1">Existentes:</span>
            {existingBranches.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setBranchName(b)}
                className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                  branchName.toLowerCase() === b.toLowerCase()
                    ? 'border-[var(--c1)] text-[var(--c1)] bg-[var(--c1)]/10 font-semibold'
                    : 'border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Chunks / Phrases Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--ink)] block">
            3. Chunks / Frases desta ramificação (uma por linha)
          </label>
          <textarea
            rows={3}
            value={phrasesText}
            onChange={e => {
              setPhrasesText(e.target.value);
              setErrorMsg('');
            }}
            placeholder={
              language === 'en'
                ? "Ex:\nI'm going to the gym after work.\nCould I book [coisa] for tomorrow?"
                : 'Ex:\nVado in palestra dopo il lavoro.\nPosso prenotare [coisa] per domani?'
            }
            className="w-full p-3 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
          />

          {/* Quick slot & global word helpers */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[var(--mute)] font-semibold">Inserir slot:</span>
            {['[lugar]', '[coisa]', '[verbo]', '[prazo]'].map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => handleInsertSnippet(slot)}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--c1)]/10 text-[var(--c1)] border border-[var(--c1)]/25 hover:bg-[var(--c1)]/20"
              >
                + {slot}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newWordHelper}
              onChange={e => setNewWordHelper(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGlobalWordAndInsert();
                }
              }}
              placeholder="Incluir nova palavra global na frase..."
              className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-dashed border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddGlobalWordAndInsert}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-[var(--line)] hover:border-emerald-500 text-[var(--ink)] flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-emerald-500" />
              <span>Incluir Palavra</span>
            </button>
          </div>

          {customWords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {customWords.slice(0, 8).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleInsertSnippet(w)}
                  className="px-2 py-0.5 text-[10px] rounded border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)]"
                >
                  + {w}
                </button>
              ))}
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
        )}

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Criar Ramificação</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-xs"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Criar & Ir para Rhythm Lab</span>
          </button>
        </div>
      </div>
    </div>
  );
}
