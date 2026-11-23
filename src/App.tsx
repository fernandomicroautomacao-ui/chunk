/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Network, MessageSquareShare, Compass, Brain, Moon, Sun, Globe, Sparkles, AudioWaveform, Timer } from 'lucide-react';
import ChunkMap from './components/ChunkMap.tsx';
import StartersTab from './components/StartersTab.tsx';
import SituationsTab from './components/SituationsTab.tsx';
import FlashcardsTab from './components/FlashcardsTab.tsx';
import ConnectedSpeechTab from './components/ConnectedSpeechTab.tsx';
import RhythmLabTab from './components/RhythmLabTab.tsx';
import LanguageSelectScreen from './components/LanguageSelectScreen.tsx';
import ConnectorsModal from './components/ConnectorsModal.tsx';
import { StudyStoreProvider } from './context/StudyStoreContext.tsx';
import { StudyLanguage } from './types.ts';

type TabType = 'map' | 'starters' | 'situations' | 'speech' | 'rhythm' | 'flashcards';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [rhythmIncomingPhrase, setRhythmIncomingPhrase] = useState<{ text: string; id: number } | null>(null);

  // Study language state (defaults to null on fresh visits to show the welcome screen)
  const [studyLanguage, setStudyLanguage] = useState<StudyLanguage | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chunk_study_language');
      if (saved === 'en' || saved === 'it') return saved;
    }
    return null;
  });

  // Modal to change language
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Modal for Speech Connectors / Fillers
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chunk_map_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('chunk_map_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectLanguage = (lang: StudyLanguage) => {
    setStudyLanguage(lang);
    setIsLangModalOpen(false);
    try {
      localStorage.setItem('chunk_study_language', lang);
    } catch {
      // ignore
    }
  };

  const handlePracticeRhythm = (phrase: string) => {
    setRhythmIncomingPhrase({ text: phrase, id: Date.now() });
    setActiveTab('rhythm');
  };

  // If user hasn't chosen an initial language yet, show the full welcome screen
  if (!studyLanguage) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <header className="h-12 shrink-0 flex items-center justify-between px-4 bg-[var(--panel)] border-b border-[var(--line)] z-20">
          <h1 className="text-sm font-semibold tracking-tight text-[var(--ink)]">
            Mapa de Chunks
          </h1>
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>
        <LanguageSelectScreen
          currentLanguage="en"
          onSelectLanguage={handleSelectLanguage}
        />
      </div>
    );
  }

  const currentLangBadge = studyLanguage === 'en' ? (
    <span className="flex items-center gap-1.5 font-medium">
      <span className="text-sm">🇬🇧</span>
      <span className="hidden sm:inline">English</span>
      <span className="sm:hidden">EN</span>
    </span>
  ) : (
    <span className="flex items-center gap-1.5 font-medium">
      <span className="text-sm">🇮🇹</span>
      <span className="hidden sm:inline">Italiano</span>
      <span className="sm:hidden">IT</span>
    </span>
  );

  return (
    <StudyStoreProvider language={studyLanguage}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Bar Header */}
      <header className="h-12 shrink-0 flex items-center justify-between px-3 md:px-4 bg-[var(--panel)] border-b border-[var(--line)] z-20 gap-2">
        {/* Zone 1: Brand title & Language Switcher */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <h1 className="text-sm md:text-base font-semibold tracking-tight whitespace-nowrap text-[var(--ink)]">
            Mapa de Chunks
          </h1>

          {/* Language Selector Button with Flag */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            title="Alternar idioma de estudo (Inglês ou Italiano)"
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c1)] transition-colors text-[var(--ink)] shrink-0 shadow-2xs"
          >
            {currentLangBadge}
            <Globe className="w-3 h-3 text-[var(--mute)] ml-0.5" />
          </button>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 p-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-lg overflow-x-auto max-w-[calc(100vw-240px)] md:max-w-none">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'map'
                ? 'bg-[var(--panel)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[var(--c1)]" />
            <span>Grafo de Chunks</span>
          </button>

          <button
            onClick={() => setActiveTab('starters')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'starters'
                ? 'bg-[var(--panel)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <MessageSquareShare className="w-3.5 h-3.5 text-[var(--c2)]" />
            <span>Início de Frases (Q&A)</span>
          </button>

          <button
            onClick={() => setActiveTab('situations')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'situations'
                ? 'bg-[var(--panel)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[var(--c3)]" />
            <span>Tips & Situations</span>
          </button>

          <button
            onClick={() => setActiveTab('speech')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'speech'
                ? 'bg-[var(--panel)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <AudioWaveform className="w-3.5 h-3.5 text-amber-500" />
            <span>Fala Conectada</span>
          </button>

          <button
            onClick={() => setActiveTab('rhythm')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'rhythm'
                ? 'bg-[var(--panel)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-rose-500" />
            <span>Rhythm Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'flashcards'
                ? 'bg-[var(--panel)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--mute)] hover:text-[var(--ink)]'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-[var(--c1)]" />
            <span>Flashcards & Treino</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Connectors quick modal & Theme toggle) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsConnectorsOpen(true)}
            title="Conectores de Pensamento & Fillers"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--c2)] hover:text-[var(--c2)] transition-colors text-[var(--ink)] shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--c2)]" />
            <span className="hidden md:inline">Conectores</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Alternar tema claro e escuro"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="p-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--c1)] text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className={`w-full h-full flex flex-col ${activeTab === 'map' ? 'flex' : 'hidden'}`}>
          <ChunkMap key={studyLanguage} language={studyLanguage} onPracticeRhythm={handlePracticeRhythm} />
        </div>
        <div className={`w-full h-full flex flex-col ${activeTab === 'starters' ? 'flex' : 'hidden'}`}>
          <StartersTab key={studyLanguage} language={studyLanguage} onPracticeRhythm={handlePracticeRhythm} />
        </div>
        <div className={`w-full h-full flex flex-col ${activeTab === 'situations' ? 'flex' : 'hidden'}`}>
          <SituationsTab key={studyLanguage} language={studyLanguage} />
        </div>
        <div className={`w-full h-full flex flex-col ${activeTab === 'speech' ? 'flex' : 'hidden'}`}>
          <ConnectedSpeechTab key={studyLanguage} language={studyLanguage} onPracticeRhythm={handlePracticeRhythm} />
        </div>
        <div className={`w-full h-full flex flex-col ${activeTab === 'rhythm' ? 'flex' : 'hidden'}`}>
          <RhythmLabTab key={studyLanguage} language={studyLanguage} incomingPhrase={rhythmIncomingPhrase} />
        </div>
        <div className={`w-full h-full flex flex-col ${activeTab === 'flashcards' ? 'flex' : 'hidden'}`}>
          <FlashcardsTab key={studyLanguage} language={studyLanguage} />
        </div>
      </main>

      {/* Language Switcher Modal */}
      {isLangModalOpen && (
        <LanguageSelectScreen
          currentLanguage={studyLanguage}
          onSelectLanguage={handleSelectLanguage}
          onClose={() => setIsLangModalOpen(false)}
          isModal={true}
        />
      )}

      {/* Connectors / Speech Bridges Modal */}
      {isConnectorsOpen && (
        <ConnectorsModal
          language={studyLanguage}
          onClose={() => setIsConnectorsOpen(false)}
        />
      )}
      </div>
    </StudyStoreProvider>
  );
}
