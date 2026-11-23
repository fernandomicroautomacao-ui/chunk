/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  Square,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen,
  Info,
  CheckCircle2,
  Mic,
  Copy,
  Check,
  Maximize2,
  X,
  VolumeX,
  Play,
  Timer
} from 'lucide-react';
import { StudyLanguage } from '../types.ts';
import {
  ENGLISH_PHENOMENA,
  CONNECTED_SPEECH_EXAMPLES,
  ITALIAN_CONNECTED_PHENOMENA,
  ConnectedSpeechExample,
  getConnectedSpeechBreakdown
} from '../data/connectedSpeechData.ts';
import { playSpeech, stopSpeech } from '../utils/speech.ts';

interface ConnectedSpeechTabProps {
  language: StudyLanguage;
  onPracticeRhythm?: (phrase: string) => void;
}

export default function ConnectedSpeechTab({ language, onPracticeRhythm }: ConnectedSpeechTabProps) {
  // Active selected example
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeAudioType, setActiveAudioType] = useState<'careful' | 'natural' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState<string>('phenom-1');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [voicePracticeActive, setVoicePracticeActive] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [customPhrase, setCustomPhrase] = useState<string>('');
  const [addedToCards, setAddedToCards] = useState<boolean>(false);

  const phenomenaList = language === 'en' ? ENGLISH_PHENOMENA : ITALIAN_CONNECTED_PHENOMENA;
  const examplesList = CONNECTED_SPEECH_EXAMPLES;
  const currentExample = examplesList[selectedExampleIndex] || examplesList[0];

  const handlePlayAudio = (text: string, type: 'careful' | 'natural', customRate?: number) => {
    stopSpeech();
    setActiveAudioType(type);

    const rate = customRate || (type === 'careful' ? 0.75 : playbackSpeed);

    // If careful speech, pronounce with slight word-by-word pacing
    const spokenText = type === 'careful' ? text.replace(/\//g, ' , ') : text;

    playSpeech(spokenText, language, rate, () => {
      setActiveAudioType(null);
    });
  };

  const handleStopAudio = () => {
    stopSpeech();
    setActiveAudioType(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleAddToFlashcards = (example: ConnectedSpeechExample) => {
    try {
      const existing = JSON.parse(localStorage.getItem('chunk_custom_flashcards') || '[]');
      const newCard = {
        id: `cs-card-${Date.now()}`,
        front: `${example.carefulText}\n(Como o nativo falaria?)`,
        back: `${example.naturalText}\n\n${example.explanation}`,
        language: language,
        category: 'Fala Conectada'
      };
      localStorage.setItem('chunk_custom_flashcards', JSON.stringify([newCard, ...existing]));
      setAddedToCards(true);
      setTimeout(() => setAddedToCards(false), 2500);
    } catch {
      setAddedToCards(true);
      setTimeout(() => setAddedToCards(false), 2500);
    }
  };

  // Voice practice simulation using Web Speech API if supported
  const handleStartVoicePractice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoicePracticeActive(true);
      setUserTranscript('Modo de voz iniciado! Fale a frase em voz alta para treinar sua cadência e relaxamento de mandíbula.');
      return;
    }

    try {
      const SpeechRecognition = (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-US' : 'it-IT';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setVoicePracticeActive(true);
      setUserTranscript('Ouvindo... Fale agora!');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(`Você disse: "${transcript}"`);
      };

      recognition.onerror = () => {
        setUserTranscript('Não foi possível capturar o áudio. Tente repetir a pronúncia em voz alta!');
      };

      recognition.start();
    } catch {
      setVoicePracticeActive(true);
      setUserTranscript('Repita a frase em voz alta prestando atenção nas sílabas tônicas!');
    }
  };

  // Custom phrase breakdown analysis
  const customBreakdown = customPhrase.trim()
    ? getConnectedSpeechBreakdown(customPhrase, language)
    : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Banner / Introduction */}
      <div className="px-4 py-6 md:px-8 border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--c1)]/15 text-[var(--c1)] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Inglês da Vida Real' : 'Italiano Parlato'}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {language === 'en'
                  ? 'Como está escrito vs. Como um americano realmente fala'
                  : 'Scritto vs. Parlato Reale: La Melodia Naturale'}
              </h2>
              <p className="text-xs md:text-sm text-[var(--mute)] mt-1 max-w-2xl">
                {language === 'en'
                  ? 'Aprenda os 5 segredos fonéticos que os nativos usam para ligar palavras, reduzir vogais átonas ao Schwa e economizar energia ao falar.'
                  : 'Entenda os princípios fonéticos da língua falada: elisão, truncamento, raddoppiamento fonosintático e o ritmo cadenciado.'}
              </p>
            </div>

            {/* Infographic Badges / Quick Links to Infographics */}
            {language === 'en' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setZoomImage('/assets/aistudio/image_d2d73628.png')}
                  className="group flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] transition-all shadow-2xs hover:shadow-xs"
                >
                  <img
                    src="/assets/aistudio/image_d2d73628.png"
                    alt="Careful vs Natural Speech"
                    className="w-8 h-8 rounded object-cover border border-[var(--line)] group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <span className="block font-semibold text-[var(--ink)]">Tabela de Ligação</span>
                    <span className="block text-[10px] text-[var(--mute)]">Careful vs Natural</span>
                  </div>
                </button>

                <button
                  onClick={() => setZoomImage('/assets/aistudio/image_cc87620e.png')}
                  className="group flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c2)] transition-all shadow-2xs hover:shadow-xs"
                >
                  <img
                    src="/assets/aistudio/image_cc87620e.png"
                    alt="Schwa Chart"
                    className="w-8 h-8 rounded object-cover border border-[var(--line)] group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <span className="block font-semibold text-[var(--ink)]">Vogal Schwa /ə/</span>
                    <span className="block text-[10px] text-[var(--mute)]">A · E · I · O · U</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* SECTION 1: INTERACTIVE COMPARISON HERO (Como está escrito vs como fala) */}
        <section className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 md:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--c1)] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-semibold text-base text-[var(--ink)]">
                {language === 'en'
                  ? '1. Como está escrito vs. como um americano realmente fala'
                  : '1. Comparação Direta: Didática vs. Fala Natural'}
              </h3>
            </div>

            {/* Quick selector of standard examples */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {examplesList.map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setSelectedExampleIndex(idx);
                    setVoicePracticeActive(false);
                    setUserTranscript('');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
                    selectedExampleIndex === idx
                      ? 'bg-[var(--c1)] text-white font-semibold'
                      : 'bg-[var(--bg)] text-[var(--mute)] hover:text-[var(--ink)] border border-[var(--line)]'
                  }`}
                >
                  {ex.carefulText.replace(/\?|\./g, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Side by side comparison card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* Left Column: Escrita & Pronúncia didática (Palavras separadas) */}
            <div className="p-4 md:p-5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--mute)]">
                    Escrita Tradicional
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/10 text-[var(--mute)]">
                    Palavras separadas
                  </span>
                </div>
                <div className="text-lg md:text-xl font-medium text-[var(--ink)] font-mono">
                  {currentExample.carefulText}
                </div>
                <div className="mt-2 text-xs text-[var(--mute)] font-mono">
                  {currentExample.carefulText.split(' ').join(' / ')}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-xs text-[var(--mute)]">Pronúncia didática:</span>
                <button
                  onClick={() =>
                    activeAudioType === 'careful'
                      ? handleStopAudio()
                      : handlePlayAudio(currentExample.carefulText, 'careful', 0.75)
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeAudioType === 'careful'
                      ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                      : 'border-[var(--line)] text-[var(--ink)] hover:border-[var(--c1)] bg-[var(--panel)]'
                  }`}
                >
                  {activeAudioType === 'careful' ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Parar</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[var(--mute)]" />
                      <span>0.75× Ouvir pausado</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Fala natural americana (Connected Speech) */}
            <div className="p-4 md:p-5 rounded-xl bg-[var(--c1)]/5 border border-[var(--c1)]/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-[var(--c1)] text-white text-[10px] font-bold rounded-bl-lg">
                FALA NATURAL NATIVA
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--c1)]">
                    Como o nativo fala
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-[var(--ink)] tracking-tight">
                  {currentExample.naturalText}
                </div>
                {currentExample.phoneticBreakdown && (
                  <div className="mt-1 text-xs text-[var(--c1)] font-mono">
                    /{currentExample.phoneticBreakdown}/
                  </div>
                )}
              </div>

              {/* Audio Controls and Speed */}
              <div className="mt-6 pt-4 border-t border-[var(--c1)]/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      activeAudioType === 'natural'
                        ? handleStopAudio()
                        : handlePlayAudio(currentExample.carefulText, 'natural', playbackSpeed)
                    }
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-transform active:scale-95 ${
                      activeAudioType === 'natural'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[var(--c1)] text-white hover:opacity-90'
                    }`}
                  >
                    {activeAudioType === 'natural' ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Parar</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Reproduzir</span>
                      </>
                    )}
                  </button>

                  {/* Speed toggle pills */}
                  <div className="flex items-center bg-[var(--bg)] border border-[var(--line)] rounded-lg p-0.5 text-[11px]">
                    {[0.75, 1.0, 1.25].map(s => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          playbackSpeed === s
                            ? 'bg-[var(--c1)] text-white font-semibold'
                            : 'text-[var(--mute)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(currentExample.naturalText, currentExample.id)}
                    title="Copiar texto fonético"
                    className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--mute)] hover:text-[var(--ink)]"
                  >
                    {copiedId === currentExample.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Actions: Praticar no modo de voz, Adicionar aos cartões, Dar feedback */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartVoicePractice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] text-[var(--ink)] transition-colors shadow-2xs"
            >
              <Mic className="w-3.5 h-3.5 text-[var(--c1)]" />
              <span>Praticar no modo de voz</span>
            </button>

            <button
              onClick={() => handleAddToFlashcards(currentExample)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c2)] text-[var(--ink)] transition-colors shadow-2xs"
            >
              {addedToCards ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Adicionado aos cartões!
                  </span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-[var(--c2)]" />
                  <span>Adicionar aos cartões de memória</span>
                </>
              )}
            </button>

            {onPracticeRhythm && (
              <button
                onClick={() => onPracticeRhythm(currentExample.carefulText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--line)] bg-[var(--bg)] hover:border-rose-500 text-[var(--ink)] transition-colors shadow-2xs"
              >
                <Timer className="w-3.5 h-3.5 text-rose-500" />
                <span>Treinar ritmo no metrônomo</span>
              </button>
            )}
          </div>

          {/* Voice practice banner if active */}
          {voicePracticeActive && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--c1)]/30 text-xs flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[var(--ink)] font-medium">{userTranscript}</span>
              </div>
              <button
                onClick={() => setVoicePracticeActive(false)}
                className="text-[var(--mute)] hover:text-[var(--ink)] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fala Conectada Analysis: "Repare que:" breakdown requested by user */}
          <div className="mt-5 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[var(--c1)] flex items-center gap-1.5 mb-2.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Fala Conectada · Repare que:</span>
            </h4>

            {currentExample.id === 'cs-1' ? (
              <ul className="space-y-1.5 text-xs text-[var(--ink)]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-blue-500">I&apos;m</strong> se conecta suavemente com{' '}
                    <strong>flying</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-amber-500">to</strong> perde força e vira{' '}
                    <code className="px-1 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] text-amber-500 font-bold">
                      /tə/
                    </code>{' '}
                    (som de &quot;tâ&quot; relaxado / Schwa).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-emerald-500">FLY</strong> recebe o destaque e energia sonora
                    (Word Stress).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-emerald-500">YORK</strong> recebe destaque final antes do tom
                    descer (Intonation).
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-xs text-[var(--ink)] leading-relaxed">
                {currentExample.explanation}
              </p>
            )}

            {/* Color codes legend (Matching User Image 1) */}
            <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center gap-4 text-[11px]">
              <span className="font-semibold text-[var(--mute)]">Legenda visual:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[var(--ink)]">Azul: Linking (Ligação)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[var(--ink)]">Laranja: Elision (Elisão)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[var(--ink)]">Verde: Assimilation / Reduction</span>
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 2: OS 5 FENÔMENOS QUE VOCÊ PRECISA APRENDER */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--c2)] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-lg md:text-xl text-[var(--ink)]">
                  {language === 'en'
                    ? '2. Os 5 fenômenos que você precisa aprender'
                    : '2. Princípios Fonéticos da Fala Fluida'}
                </h3>
              </div>
              <p className="text-xs text-[var(--mute)] mt-0.5">
                Clique em cada fenômeno para ver a regra, exemplos sonoros e o comportamento acústico.
              </p>
            </div>
          </div>

          {/* Phenomenon selection cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {phenomenaList.map(ph => {
              const isSelected = selectedPhenomenonId === ph.id;
              return (
                <button
                  key={ph.id}
                  onClick={() => setSelectedPhenomenonId(ph.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--panel)] border-[var(--c1)] shadow-sm ring-1 ring-[var(--c1)]'
                      : 'bg-[var(--bg)] border-[var(--line)] hover:border-[var(--mute)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-[var(--c1)] text-white' : 'bg-gray-500/10 text-[var(--mute)]'
                        }`}
                      >
                        #{ph.number}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-[var(--ink)] line-clamp-1">{ph.title}</div>
                    <div className="text-[11px] text-[var(--mute)] line-clamp-2 mt-1">
                      {ph.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active phenomenon detailed showcase */}
          {(() => {
            const activePh = phenomenaList.find(p => p.id === selectedPhenomenonId) || phenomenaList[0];
            return (
              <div className="p-5 md:p-6 rounded-xl bg-[var(--panel)] border border-[var(--line)] shadow-2xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
                  <div>
                    <div className="text-xs font-bold text-[var(--c1)] uppercase tracking-wider">
                      Fenômeno #{activePh.number}
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-[var(--ink)]">{activePh.title}</h4>
                    <p className="text-xs text-[var(--mute)] mt-0.5">{activePh.tagline}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] max-w-md">
                    <strong className="text-[var(--c1)] font-semibold">Regra de ouro: </strong>
                    {activePh.keyRule}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-[var(--ink)] leading-relaxed">
                  {activePh.description}
                </p>

                {/* SPECIAL EMBED: IF PHENOMENON IS SCHWA, RENDER THE INTERACTIVE VOWEL CHART (MATCHING IMAGE 2) */}
                {activePh.id === 'phenom-2' && language === 'en' && (
                  <div className="p-4 md:p-5 rounded-xl bg-purple-500/5 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-serif">
                          /ə/
                        </span>
                        <div>
                          <h5 className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            SCHWA: A Vogal Camaleão
                          </h5>
                          <p className="text-[11px] text-[var(--mute)]">
                            Qualquer vogal (A, E, I, O, U) quando átona se transforma no Schwa /ə/
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setZoomImage('/assets/aistudio/image_cc87620e.png')}
                        className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Ver infográfico original</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {[
                        { letter: 'A', ex1: 'About', ex2: 'Maroon', schwaPart: 'A / oo' },
                        { letter: 'E', ex1: 'Tandem', ex2: 'Elevate', schwaPart: 'e / e' },
                        { letter: 'I', ex1: 'Gravity', ex2: 'Feminine', schwaPart: 'i / i' },
                        { letter: 'O', ex1: 'Octopus', ex2: 'Idiom', schwaPart: 'o / o' },
                        { letter: 'U', ex1: 'Circus', ex2: 'Surround', schwaPart: 'u / u' }
                      ].map(item => (
                        <div
                          key={item.letter}
                          className="p-3 rounded-lg bg-[var(--bg)] border border-purple-500/20 text-center flex flex-col justify-between"
                        >
                          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mb-1">
                            {item.letter}
                          </div>
                          <div className="space-y-1 text-xs">
                            <button
                              onClick={() => handlePlayAudio(item.ex1, 'natural', 0.9)}
                              className="w-full py-0.5 px-1 rounded hover:bg-purple-500/10 text-[var(--ink)] font-medium flex items-center justify-between"
                            >
                              <span>{item.ex1}</span>
                              <Volume2 className="w-3 h-3 text-purple-500" />
                            </button>
                            <button
                              onClick={() => handlePlayAudio(item.ex2, 'natural', 0.9)}
                              className="w-full py-0.5 px-1 rounded hover:bg-purple-500/10 text-[var(--ink)] font-medium flex items-center justify-between"
                            >
                              <span>{item.ex2}</span>
                              <Volume2 className="w-3 h-3 text-purple-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SPECIAL EMBED: IF PHENOMENON IS REDUCTIONS (MATCHING IMAGE 1) */}
                {activePh.id === 'phenom-4' && language === 'en' && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Careful Speech vs. Natural Connected Speech (Infográfico 1)
                      </h5>
                      <button
                        onClick={() => setZoomImage('/assets/aistudio/image_d2d73628.png')}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Ver infográfico original</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        {
                          written: 'What are you doing?',
                          spoken: 'Whaddaya doing?',
                          type: 'Elision / Linking'
                        },
                        {
                          written: 'Did you see it?',
                          spoken: 'Didja see it?',
                          type: 'Linking / Palatal'
                        },
                        {
                          written: 'Want to go?',
                          spoken: 'Wanna go?',
                          type: 'Assimilation / Reduction'
                        },
                        {
                          written: 'Out of time',
                          spoken: 'Outta time',
                          type: 'Reduction / Flap'
                        }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="text-[10px] text-[var(--mute)]">{item.written}</div>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                              {item.spoken}
                            </div>
                          </div>
                          <button
                            onClick={() => handlePlayAudio(item.written, 'natural', 1.0)}
                            className="mt-2.5 py-1 px-2 rounded bg-[var(--panel)] border border-[var(--line)] hover:border-emerald-500 text-[11px] font-medium flex items-center justify-center gap-1 text-[var(--ink)]"
                          >
                            <Volume2 className="w-3 h-3 text-emerald-500" />
                            <span>Ouvir</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phenomenon Examples with playable audio */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--mute)] uppercase tracking-wider">
                    Exemplos Práticos & Áudio
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activePh.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-[11px] text-[var(--mute)]">Escrita:</div>
                          <div className="font-semibold text-xs text-[var(--ink)]">{ex.written}</div>

                          <div className="mt-2 text-[11px] text-[var(--c1)]">Fala nativa:</div>
                          <div className="font-bold text-sm text-[var(--ink)]">{ex.spoken}</div>

                          <p className="mt-2 text-[11px] text-[var(--mute)] leading-relaxed">
                            {ex.notes}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-center justify-between">
                          <button
                            onClick={() => handlePlayAudio(ex.written, 'careful', 0.8)}
                            className="text-[11px] text-[var(--mute)] hover:text-[var(--ink)] flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Pausado</span>
                          </button>

                          <button
                            onClick={() => handlePlayAudio(ex.written, 'natural', 1.0)}
                            className="text-[11px] font-semibold text-[var(--c1)] hover:underline flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Natural</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* SECTION 3: LIVE SPEECH ANALYZER SANDBOX */}
        <section className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 md:p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[var(--c3)] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-base text-[var(--ink)]">
              Simulador & Analisador de Fala Conectada
            </h3>
          </div>
          <p className="text-xs text-[var(--mute)] mb-4">
            Digite uma frase ou escolha uma sugestão para ver como as palavras se fundem, quais sílabas
            viram Schwa e como o ritmo se organiza:
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customPhrase}
              onChange={e => setCustomPhrase(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Ex: What are you going to do tonight?'
                  : 'Ex: Ci è un bel problema da risolvere per favore...'
              }
              className="flex-1 px-3.5 py-2 text-xs md:text-sm rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--c1)]"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  setCustomPhrase(
                    language === 'en'
                      ? 'What are you going to do tonight?'
                      : 'Ci è un bel problema da risolvere per favore'
                  )
                }
                className="px-2.5 py-2 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--mute)] hover:text-[var(--ink)]"
              >
                Exemplo 1
              </button>
              <button
                onClick={() =>
                  setCustomPhrase(
                    language === 'en'
                      ? 'Could you give me a cup of coffee?'
                      : 'A casa di mia madre c’è un amico'
                  )
                }
                className="px-2.5 py-2 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--mute)] hover:text-[var(--ink)]"
              >
                Exemplo 2
              </button>
            </div>
          </div>

          {/* Breakdown output */}
          {customBreakdown && (
            <div className="mt-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--c1)]/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--panel)] border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--mute)] uppercase font-semibold">
                    Pronúncia Didática (Palavras Separadas)
                  </div>
                  <div className="text-sm font-mono mt-1 text-[var(--ink)]">
                    {customBreakdown.careful}
                  </div>
                  <button
                    onClick={() => handlePlayAudio(customPhrase, 'careful', 0.75)}
                    className="mt-2 text-xs flex items-center gap-1 text-[var(--mute)] hover:text-[var(--ink)]"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Ouvir Pausado</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[var(--c1)]/10 border border-[var(--c1)]/30">
                  <div className="text-[10px] text-[var(--c1)] uppercase font-bold">
                    Fala Natural / Conectada
                  </div>
                  <div className="text-sm font-bold mt-1 text-[var(--ink)] tracking-tight">
                    {customBreakdown.natural}
                  </div>
                  <button
                    onClick={() => handlePlayAudio(customPhrase, 'natural', playbackSpeed)}
                    className="mt-2 text-xs font-semibold flex items-center gap-1 text-[var(--c1)] hover:underline"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Ouvir Ritmo Real ({playbackSpeed}×)</span>
                  </button>
                </div>
              </div>

              {customBreakdown.notes.length > 0 && (
                <div className="pt-2 border-t border-[var(--line)] text-xs text-[var(--mute)] space-y-1">
                  <span className="font-semibold text-[var(--ink)]">Observações fonéticas:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {customBreakdown.notes.map((note, idx) => (
                      <li key={idx} className="text-[11px]">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 4: REFERENCE INFOGRAPHICS GALLERY */}
        {language === 'en' && (
          <section className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 md:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Infográficos Oficiais de Referência
                </h3>
                <p className="text-xs text-[var(--mute)]">
                  Mapas visuais de Careful Speech vs Natural Connected Speech e Redução para Schwa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image 1 Card */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] overflow-hidden flex flex-col justify-between">
                <div className="p-3 border-b border-[var(--line)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ink)]">
                    Careful Speech vs. Natural Connected Speech
                  </span>
                  <button
                    onClick={() => setZoomImage('/assets/aistudio/image_d2d73628.png')}
                    className="p-1 rounded text-[var(--mute)] hover:text-[var(--ink)]"
                    title="Ampliar imagem"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div
                  className="cursor-pointer overflow-hidden p-2 flex items-center justify-center bg-white"
                  onClick={() => setZoomImage('/assets/aistudio/image_d2d73628.png')}
                >
                  <img
                    src="/assets/aistudio/image_d2d73628.png"
                    alt="Careful Speech vs Natural Connected Speech Chart"
                    className="max-h-56 w-auto object-contain hover:scale-102 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 text-[11px] text-[var(--mute)] border-t border-[var(--line)] bg-[var(--panel)]">
                  Mostra a transição de Whaddaya, Didja, Wanna e Outta com código de cores (Azul, Laranja, Verde).
                </div>
              </div>

              {/* Image 2 Card */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] overflow-hidden flex flex-col justify-between">
                <div className="p-3 border-b border-[var(--line)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ink)]">
                    Tabela de Redução para Schwa (/ə/)
                  </span>
                  <button
                    onClick={() => setZoomImage('/assets/aistudio/image_cc87620e.png')}
                    className="p-1 rounded text-[var(--mute)] hover:text-[var(--ink)]"
                    title="Ampliar imagem"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div
                  className="cursor-pointer overflow-hidden p-2 flex items-center justify-center bg-gray-100"
                  onClick={() => setZoomImage('/assets/aistudio/image_cc87620e.png')}
                >
                  <img
                    src="/assets/aistudio/image_cc87620e.png"
                    alt="Schwa Chart A E I O U"
                    className="max-h-56 w-auto object-contain hover:scale-102 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 text-[11px] text-[var(--mute)] border-t border-[var(--line)] bg-[var(--panel)]">
                  Exemplos para as 5 vogais: About, Tandem, Gravity, Octopus, Circus.
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* MODAL ZOOM DE IMAGEM */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
              <span className="text-sm font-semibold text-[var(--ink)]">
                Visualização do Infográfico de Fala Conectada
              </span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-[var(--bg)] text-[var(--mute)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-neutral-900">
              <img
                src={zoomImage}
                alt="Infográfico Fonético Ampliado"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
