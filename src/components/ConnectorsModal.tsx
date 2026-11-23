/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Volume2, Copy, Check, Sparkles, Search, Filter } from 'lucide-react';
import { getConnectorsForLanguage, SpeechConnector } from '../data/connectorsData.ts';
import { StudyLanguage } from '../types.ts';
import { playSpeech } from '../utils/speech.ts';

interface ConnectorsModalProps {
  language: StudyLanguage;
  onClose: () => void;
}

export default function ConnectorsModal({ language, onClose }: ConnectorsModalProps) {
  const connectors = getConnectorsForLanguage(language);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = Array.from(new Set(connectors.map(c => c.category)));

  const filtered = connectors.filter(c => {
    if (activeCategory !== 'all' && c.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.phrase.toLowerCase().includes(q) ||
        c.translation.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q) ||
        c.example.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (phrase: string, id: string) => {
    try {
      navigator.clipboard.writeText(phrase);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handlePlayAudio = (phrase: string, id: string) => {
    setPlayingId(id);
    playSpeech(phrase, language, 0.95, () => setPlayingId(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl w-full max-w-2xl max-h-[85vh] p-5 md:p-6 shadow-2xl flex flex-col gap-4">

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--c2)]/10 text-[var(--c2)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-[var(--ink)]">
                Conectores de Pensamento & Fillers ({language === 'it' ? 'Italiano 🇮🇹' : 'Inglês 🇬🇧'})
              </h3>
              <p className="text-[11px] text-[var(--mute)]">
                Pontes de transição para soar fluente, ganhar tempo para pensar e conectar ideias.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--line)]/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar conector ou tradução..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-[var(--line)]/40 text-[var(--ink)] font-semibold'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              Todos ({connectors.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 text-xs rounded-md transition-colors shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[var(--line)]/40 text-[var(--c2)] font-semibold'
                    : 'text-[var(--mute)] hover:text-[var(--ink)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Connectors */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
          {filtered.length === 0 ? (
            <div className="text-xs text-[var(--mute)] p-6 text-center border border-dashed border-[var(--line)] rounded-lg">
              Nenhum conector encontrado com este filtro.
            </div>
          ) : (
            filtered.map((item: SpeechConnector) => {
              const isCopied = copiedId === item.id;
              const isPlaying = playingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]/30 hover:bg-[var(--bg)]/70 transition-colors flex flex-col gap-1.5 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--ink)] font-mono">
                        {item.phrase}
                      </span>
                      <span className="text-xs text-[var(--mute)]">
                        — {item.translation}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePlayAudio(item.phrase, item.id)}
                        className="p-1 rounded-md border border-[var(--line)] text-[var(--mute)] hover:text-[var(--c1)] hover:border-[var(--c1)] transition-colors"
                        title="Ouvir áudio"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse text-[var(--c1)]' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopy(item.phrase, item.id)}
                        className="p-1 rounded-md border border-[var(--line)] text-[var(--mute)] hover:text-[var(--c1)] hover:border-[var(--c1)] transition-colors"
                        title="Copiar conector"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--mute)]">
                    {item.purpose}
                  </p>

                  <div className="text-xs text-[var(--ink)] pt-1 border-t border-[var(--line)]/40 italic font-serif">
                    Ex: &ldquo;{item.example}&rdquo;
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--mute)]">
          <span>Dica: Use estes conectores no início da fala para soar mais natural e confiante.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]/20"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
