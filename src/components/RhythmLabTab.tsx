/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Square,
  Volume2,
  Sparkles,
  RotateCcw,
  Hand,
  Timer,
  Wand2,
  Library,
  Search,
  Save,
  Check,
  Plus
} from 'lucide-react';
import { DimensionKey, StudyLanguage } from '../types.ts';
import { DIMS } from '../data/chunkMapData.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';
import { playSpeech, stopSpeech } from '../utils/speech.ts';

type WordState = 'normal' | 'stress' | 'reduced';

interface WordToken {
  text: string;
  state: WordState;
}

interface RhythmLabTabProps {
  language?: StudyLanguage;
  incomingPhrase?: { text: string; id: number } | null;
}

const ENGLISH_FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'from', 'with', 'by',
  'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'i', "i'm", 'you', "you're", 'he', "he's", 'she', "she's", 'it', "it's",
  'we', "we're", 'they', "they're", 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'will', 'would',
  'shall', 'should', 'may', 'might', 'must',
  'and', 'or', 'but', 'if', 'so', 'that', 'this', 'these', 'those', 'there'
]);

const ITALIAN_FUNCTION_WORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', "un'",
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'dal', 'dallo', 'dalla', 'nel', 'nello', 'nella', 'sul', 'sulla',
  'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'mi', 'ti', 'ci', 'vi', 'si',
  'è', 'sono', 'sei', 'siamo', 'siete', 'ho', 'hai', 'ha', 'abbiamo', 'hanno',
  'e', 'o', 'ma', 'che', 'se', 'c’è', "c'è"
]);

function tokenizePhrase(text: string): WordToken[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => ({ text: word, state: 'normal' as WordState }));
}

export default function RhythmLabTab({
  language = 'en',
  incomingPhrase
}: RhythmLabTabProps) {
  const {
    chunkData,
    globalPhrases,
    customWords,
    addBranch
  } = useStudyStore();

  const defaultPhrase =
    language === 'it'
      ? 'Vado in palestra dopo il lavoro.'
      : "I'm going to the gym after work.";

  const [phraseInput, setPhraseInput] = useState<string>(defaultPhrase);
  const [tokens, setTokens] = useState<WordToken[]>(() => tokenizePhrase(defaultPhrase));

  // Global Library browser & Save to Branch state
  const [showGlobalLibrary, setShowGlobalLibrary] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'custom' | 'chunk' | 'starter'>('all');
  const [showSavePanel, setShowSavePanel] = useState<boolean>(false);
  const [saveDim, setSaveDim] = useState<DimensionKey>('lugar');
  const [saveBranch, setSaveBranch] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Metronome state
  const [bpm, setBpm] = useState<number>(90);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Pronto para praticar.');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);

  const filteredGlobalPhrases = useMemo(() => {
    return globalPhrases.filter(entry => {
      if (libraryFilter === 'custom' && !entry.isCustom) return false;
      if (libraryFilter === 'chunk' && entry.category !== 'chunk' && entry.category !== 'custom') return false;
      if (libraryFilter === 'starter' && entry.category !== 'starter') return false;
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        return (
          entry.phrase.toLowerCase().includes(q) ||
          entry.source.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [globalPhrases, libraryFilter, librarySearch]);

  // Refs for Web Audio API, interval & tap tempo
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const beatIdxRef = useRef<number>(0);
  const tapsRef = useRef<number[]>([]);

  // Update default phrase when study language changes (unless user got an incoming phrase)
  useEffect(() => {
    const nextDefault =
      language === 'it'
        ? 'Vado in palestra dopo il lavoro.'
        : "I'm going to the gym after work.";
    setPhraseInput(nextDefault);
    setTokens(tokenizePhrase(nextDefault));
  }, [language]);

  // Apply incoming phrase from other tabs (ChunkMap / Starters / ConnectedSpeech)
  useEffect(() => {
    if (incomingPhrase?.text) {
      const cleaned = incomingPhrase.text.trim();
      setPhraseInput(cleaned);
      setTokens(tokenizePhrase(cleaned));
    }
  }, [incomingPhrase]);

  const stopMetronome = useCallback((customStatus?: string) => {
    setIsRunning(false);
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveBeat(null);
    setStatus(customStatus ?? 'Metrônomo parado.');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playTickSound = useCallback((isAccent: boolean) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = isAccent ? 1250 : 800;
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.065);
  }, []);

  const startMetronomeWithParams = useCallback(
    async (targetBpm: number, targetBeats: number) => {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        setStatus('Áudio não suportado neste navegador.');
        return;
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AC();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }

      beatIdxRef.current = 0;
      setIsRunning(true);
      setStatus('Metrônomo tocando.');

      const tick = () => {
        const currentIdx = beatIdxRef.current;
        playTickSound(currentIdx === 0);
        setActiveBeat(currentIdx);
        beatIdxRef.current = (currentIdx + 1) % targetBeats;
      };

      tick();
      intervalRef.current = window.setInterval(tick, 60000 / targetBpm);
    },
    [playTickSound]
  );

  const handleStart = () => {
    if (isRunning) return;
    startMetronomeWithParams(bpm, beatsPerMeasure);
  };

  const handleBpmChange = (nextBpm: number) => {
    setBpm(nextBpm);
    if (isRunning) {
      startMetronomeWithParams(nextBpm, beatsPerMeasure);
    }
  };

  const handleBeatsChange = (nextBeats: number) => {
    setBeatsPerMeasure(nextBeats);
    if (isRunning) {
      startMetronomeWithParams(bpm, nextBeats);
    }
  };

  const handleTapTempo = () => {
    const now = performance.now();
    tapsRef.current.push(now);
    if (tapsRef.current.length > 5) {
      tapsRef.current.shift();
    }

    if (tapsRef.current.length > 1) {
      const diffs = tapsRef.current
        .slice(1)
        .map((val, i) => val - tapsRef.current[i]);
      const avg = diffs.reduce((acc, v) => acc + v, 0) / diffs.length;
      const computedBpm = Math.max(50, Math.min(180, Math.round(60000 / avg)));
      setBpm(computedBpm);
      setStatus(`Tap tempo: ${computedBpm} BPM`);
      if (isRunning) {
        startMetronomeWithParams(computedBpm, beatsPerMeasure);
      }
    } else {
      setStatus('Toque novamente no ritmo desejado.');
    }
  };

  const handleBuildWords = () => {
    setTokens(tokenizePhrase(phraseInput));
  };

  const handleLoadExample = (text: string, stressedWords: string[]) => {
    setPhraseInput(text);
    const built = tokenizePhrase(text).map(tok => {
      const clean = tok.text.toLowerCase().replace(/[.,!?;:"'()[\]]/g, '');
      return {
        text: tok.text,
        state: stressedWords.includes(clean) ? ('stress' as WordState) : ('reduced' as WordState)
      };
    });
    setTokens(built);
  };

  const handleAutoDetectStress = () => {
    const funcSet = language === 'it' ? ITALIAN_FUNCTION_WORDS : ENGLISH_FUNCTION_WORDS;
    const built = tokenizePhrase(phraseInput).map(tok => {
      const clean = tok.text.toLowerCase().replace(/[.,!?;:"()[\]]/g, '');
      return {
        text: tok.text,
        state: funcSet.has(clean) ? ('reduced' as WordState) : ('stress' as WordState)
      };
    });
    setTokens(built);
  };

  const cycleWordState = (index: number) => {
    setTokens(prev =>
      prev.map((tok, i) => {
        if (i !== index) return tok;
        const nextState: WordState =
          tok.state === 'normal'
            ? 'stress'
            : tok.state === 'stress'
            ? 'reduced'
            : 'normal';
        return { ...tok, state: nextState };
      })
    );
  };

  const handleSpeakPhrase = () => {
    if (isPlayingSpeech) {
      stopSpeech();
      setIsPlayingSpeech(false);
      return;
    }
    setIsPlayingSpeech(true);
    playSpeech(phraseInput, language, 0.95, () => {
      setIsPlayingSpeech(false);
    });
  };

  const secondsPerBeat = (60 / bpm).toFixed(2).replace('.', ',');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--bg)] text-[var(--ink)]">
      {/* Header Banner */}
      <div className="px-4 py-5 md:px-8 border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 mb-1.5">
              <Timer className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'English Rhythm Lab' : 'Laboratorio di Ritmo'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Laboratório de Ritmo & Stress
            </h2>
            <p className="text-xs md:text-sm text-[var(--mute)] mt-0.5">
              Digite frases, marque as palavras fortes (stress) e reduzidas, e pratique a cadência com um metrônomo ajustável.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-5">
        {/* SECTION 1: SUA FRASE */}
        <section className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm md:text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--c1)] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>Sua frase</span>
            </h3>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {language === 'en' ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadExample("I'm going to the gym after work.", ['going', 'gym', 'work'])
                    }
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
                  >
                    Exemplo GO GYM
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadExample("I'm flying to New York tomorrow.", ['flying', 'new', 'york', 'tomorrow'])
                    }
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
                  >
                    New York
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadExample('Could you give me a hand with this?', ['give', 'hand'])
                    }
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
                  >
                    Give me a hand
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadExample('Vado in palestra dopo il lavoro.', ['vado', 'palestra', 'dopo', 'lavoro'])
                    }
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
                  >
                    Exemplo Palestra
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadExample('Vorrei un caffè al banco, per favore.', ['vorrei', 'caffè', 'banco', 'favore'])
                    }
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors"
                  >
                    Un caffè al banco
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            value={phraseInput}
            onChange={e => setPhraseInput(e.target.value)}
            rows={2}
            placeholder={
              language === 'en'
                ? "Digite uma frase em inglês... Ex: I'm going to the gym after work."
                : 'Digite uma frase em italiano... Ex: Vado in palestra dopo il lavoro.'
            }
            className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c1)]/40"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBuildWords}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Montar palavras</span>
            </button>

            <button
              type="button"
              onClick={handleAutoDetectStress}
              className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5 text-[var(--c1)]" />
              <span>Auto-marcar Stress</span>
            </button>

            <button
              type="button"
              onClick={handleBuildWords}
              title="Resetar marcações"
              className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--mute)] text-[var(--mute)] hover:text-[var(--ink)] text-xs font-medium transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar marcações</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGlobalLibrary(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                showGlobalLibrary
                  ? 'bg-[var(--c1)] text-white border-[var(--c1)]'
                  : 'border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--c1)]'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Base Global ({globalPhrases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSavePanel(prev => !prev);
                if (!saveBranch) {
                  const first = Object.keys(chunkData[saveDim] || {})[0] || '';
                  setSaveBranch(first);
                }
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                savedNotice
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                  : 'border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-emerald-500'
              }`}
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvo no Grafo!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Salvar no Mapa</span>
                </>
              )}
            </button>
          </div>

          {/* Save Current Phrase to Global Chunk Map */}
          {showSavePanel && (
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-emerald-500/30 space-y-2">
              <div className="text-xs font-semibold text-[var(--ink)]">
                Salvar frase na Base Global (Grafo de Chunks):
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={saveDim}
                  onChange={e => {
                    const nextDim = e.target.value as DimensionKey;
                    setSaveDim(nextDim);
                    const first = Object.keys(chunkData[nextDim] || {})[0] || '';
                    setSaveBranch(first);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]"
                >
                  {DIMS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={saveBranch}
                  onChange={e => setSaveBranch(e.target.value)}
                  placeholder="Nome da ramificação (ex: academia)"
                  className="flex-1 min-w-[160px] px-2.5 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!phraseInput.trim() || !saveBranch.trim()) return;
                    addBranch(saveDim, saveBranch, [phraseInput.trim()]);
                    setSavedNotice(true);
                    setShowSavePanel(false);
                    setTimeout(() => setSavedNotice(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* Global Word & Phrase Browser */}
          {showGlobalLibrary && (
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[var(--mute)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={e => setLibrarySearch(e.target.value)}
                    placeholder="Buscar na base global de frases e chunks..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:border-[var(--c1)]"
                  />
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  {(
                    [
                      ['all', 'Todas'],
                      ['custom', 'Personalizadas'],
                      ['chunk', 'Grafo'],
                      ['starter', 'Q&A']
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setLibraryFilter(k)}
                      className={`px-2 py-1 rounded-md border transition-colors ${
                        libraryFilter === k
                          ? 'bg-[var(--c1)] text-white border-[var(--c1)] font-semibold'
                          : 'bg-[var(--panel)] border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {customWords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[var(--line)]/60">
                  <span className="text-[10px] font-bold text-[var(--mute)] uppercase">
                    Palavras adicionadas:
                  </span>
                  {customWords.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        const next = `${phraseInput.trim()} ${w}`.trim();
                        setPhraseInput(next);
                        setTokens(tokenizePhrase(next));
                      }}
                      className="px-2 py-0.5 text-[11px] rounded border border-[var(--line)] bg-[var(--panel)] hover:border-emerald-500 text-[var(--ink)] flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5 text-emerald-500" />
                      <span>{w}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {filteredGlobalPhrases.length === 0 ? (
                  <p className="text-xs text-[var(--mute)] text-center py-3">
                    Nenhuma frase encontrada com esse filtro.
                  </p>
                ) : (
                  filteredGlobalPhrases.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPhraseInput(item.phrase);
                        setTokens(tokenizePhrase(item.phrase));
                      }}
                      className="w-full text-left p-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--c1)] transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-medium text-[var(--ink)] truncate">
                        {item.phrase}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--mute)] shrink-0">
                        {item.source}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-[var(--mute)]">
            Clique nas palavras abaixo para alternar:{' '}
            <strong className="text-[var(--ink)]">normal</strong> →{' '}
            <strong className="text-red-500">forte (vermelho)</strong> →{' '}
            <strong className="text-[var(--mute)]">reduzida (escura/discreta)</strong>.
          </p>
        </section>

        {/* SECTION 2: IDENTIFIQUE O STRESS */}
        <section className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm md:text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>Identifique o stress</span>
            </h3>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                Vermelho = stressed
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--mute)] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-neutral-950 border border-[var(--line)]" />
                Preto/cinza = reduced
              </span>
            </div>
          </div>

          {/* Clickable Word Buttons */}
          <div className="flex flex-wrap gap-2">
            {tokens.length === 0 ? (
              <span className="text-xs text-[var(--mute)]">
                Digite uma frase acima e clique em &ldquo;Montar palavras&rdquo;.
              </span>
            ) : (
              tokens.map((tok, idx) => {
                const stateClasses =
                  tok.state === 'stress'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs scale-[1.03]'
                    : tok.state === 'reduced'
                    ? 'bg-neutral-900 dark:bg-black text-neutral-400 border-neutral-700 opacity-80'
                    : 'bg-[var(--bg)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--c1)]';

                return (
                  <button
                    key={`${tok.text}-${idx}`}
                    type="button"
                    onClick={() => cycleWordState(idx)}
                    className={`px-3.5 py-2 rounded-xl border text-sm font-bold transition-all select-none cursor-pointer ${stateClasses}`}
                  >
                    {tok.text}
                  </button>
                );
              })
            )}
          </div>

          {/* Live Readout Box */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-base md:text-lg leading-loose flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
              {tokens.map((tok, idx) => {
                if (tok.state === 'stress') {
                  return (
                    <span
                      key={idx}
                      className="text-red-500 font-extrabold tracking-tight text-lg md:text-xl"
                    >
                      {tok.text}
                    </span>
                  );
                }
                if (tok.state === 'reduced') {
                  return (
                    <span key={idx} className="text-[var(--mute)] opacity-70 font-normal text-sm">
                      {tok.text}
                    </span>
                  );
                }
                return (
                  <span key={idx} className="text-[var(--ink)] font-normal">
                    {tok.text}
                  </span>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSpeakPhrase}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isPlayingSpeech
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  : 'bg-[var(--panel)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--c1)]'
              }`}
            >
              {isPlayingSpeech ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Parar</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[var(--c1)]" />
                  <span>Ouvir frase</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-[var(--mute)]">
            Marque em vermelho as palavras que carregam a mensagem principal:{' '}
            <strong>GO, GYM, WORK</strong> etc. As palavras gramaticais ficam reduzidas entre uma batida e outra.
          </p>
        </section>

        {/* SECTION 3: METRÔNOMO */}
        <section className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span>Metrônomo</span>
            </h3>
            <span className="text-xs font-bold text-emerald-500">{status}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                <span>Velocidade</span>
                <span className="text-sm font-bold text-[var(--c1)] tabular-nums">{bpm} BPM</span>
              </label>
              <input
                type="range"
                min={50}
                max={180}
                value={bpm}
                onChange={e => handleBpmChange(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--mute)]">
                <span>50 BPM (Lento)</span>
                <span>180 BPM (Rápido)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--ink)] block">
                Batidas por compasso
              </label>
              <select
                value={beatsPerMeasure}
                onChange={e => handleBeatsChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--c1)]/40"
              >
                <option value={2}>2 batidas</option>
                <option value={3}>3 batidas</option>
                <option value={4}>4 batidas</option>
              </select>
            </div>
          </div>

          {/* Visual Beats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => {
              const isActive = activeBeat === i;
              return (
                <div
                  key={i}
                  className={`py-3.5 px-2 rounded-xl text-center font-extrabold text-xs md:text-sm border transition-all ${
                    isActive
                      ? 'bg-red-600 text-white border-red-500 scale-[1.03] shadow-sm'
                      : 'bg-[var(--bg)] text-[var(--mute)] border-[var(--line)]'
                  }`}
                >
                  {i + 1} {i === 0 ? '• forte' : '• fraca'}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleStart}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar</span>
            </button>

            <button
              type="button"
              onClick={() => stopMetronome()}
              disabled={!isRunning}
              className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Parar</span>
            </button>

            <button
              type="button"
              onClick={handleTapTempo}
              className="px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Hand className="w-3.5 h-3.5 text-[var(--c1)]" />
              <span>Tap tempo</span>
            </button>
          </div>

          <p className="text-xs text-[var(--mute)] leading-relaxed">
            <strong>{bpm} BPM</strong> = uma batida a cada <strong>{secondsPerBeat} segundo(s)</strong>. O primeiro tempo do compasso tem um som mais agudo. Dica: fale cada palavra marcada em vermelho exatamente no clique da batida!
          </p>
        </section>
      </div>
    </div>
  );
}
