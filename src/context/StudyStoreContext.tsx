/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChunkMapData,
  DimensionKey,
  SentenceStarter,
  StudyLanguage
} from '../types.ts';
import { CHUNK_DATA, DIMS } from '../data/chunkMapData.ts';
import { ITALIAN_CHUNK_DATA, ITALIAN_STARTERS, ITALIAN_SITUATIONS } from '../data/italianData.ts';
import { DEFAULT_STARTERS } from '../data/startersData.ts';
import { SITUATION_GUIDES } from '../data/situationsData.ts';
import { CONNECTED_SPEECH_EXAMPLES } from '../data/connectedSpeechData.ts';

export interface GlobalPhraseEntry {
  id: string;
  phrase: string;
  source: string;
  category: 'chunk' | 'starter' | 'situation' | 'connected' | 'custom';
  dim?: DimensionKey;
  branch?: string;
  isCustom?: boolean;
}

const DEFAULT_SLOT_VOCAB_EN: Record<string, string[]> = {
  lugar: ['New York', 'the airport', 'downtown', 'the gym', 'the hotel', 'London'],
  coisa: ['a coffee', 'the report', 'my boarding pass', 'a taxi', 'this file', 'help'],
  verbo: ['check it', 'go home', 'reschedule', 'call back', 'talk later', 'finish this'],
  'verbo-ing': ['waiting', 'working late', 'going out', 'taking a taxi', 'looking for it'],
  prato: ['the pasta', 'a Caesar salad', 'the grilled salmon', 'the steak'],
  bebida: ['an espresso', 'some sparkling water', 'a cold beer', 'green tea'],
  assunto: ['my reservation', 'the invoice', 'our meeting', 'the delivery'],
  valor: ['$100', '$50', 'two hundred dollars'],
  máquina: ['printer', 'espresso machine', 'card reader', 'laptop'],
  motivo: ['a conference', 'a family dinner', 'work'],
  causa: ['we needed more time', 'it was urgent', 'the system crashed'],
  fato: ['the flight was moved', 'the meeting started early'],
  resultado: ['everything is on track', 'we solved the issue'],
  prazo: ['tomorrow morning', '5 PM', 'Friday'],
  topic: ['the new project', 'our schedule', 'this idea'],
  action: ['send the document', 'review the plan', 'join the call'],
  'verb-ing': ['helping out', 'explaining that again', 'waiting a minute'],
  'name/title': ['Sarah', 'Dr. Smith', 'David']
};

const DEFAULT_SLOT_VOCAB_IT: Record<string, string[]> = {
  lugar: ['Roma', 'stazione', 'centro', 'albergo', 'palestra', 'aeroporto'],
  coisa: ['un caffè', 'il biglietto', 'il conto', 'una mano', 'questo documento'],
  verbo: ['controllare', 'andare via', 'prenotare', 'richiamare', 'parlare dopo'],
  'verbo-ing': ['aspettando', 'lavorando', 'cercando', 'prendendo un taxi'],
  prato: ['la pasta alla carbonara', 'una pizza margherita', 'il risotto'],
  bebida: ['un espresso', 'un cappuccino', 'dell’acqua frizzante', 'un bicchiere di vino'],
  assunto: ['la prenotazione', 'la fattura', 'il nostro incontro'],
  valor: ['50 euro', '100 euro', 'venti euro'],
  máquina: ['stampante', 'macchina del caffè', 'computer'],
  motivo: ['una riunione', 'una vacanza', 'lavoro'],
  causa: ['era tardi', 'c’era traffico', 'era urgente'],
  fato: ['il treno è in ritardo', 'il negozio è chiuso'],
  resultado: ['tutto va bene', 'abbiamo risolto'],
  prazo: ['domani mattina', 'stasera', 'venerdì'],
  topic: ['questo progetto', 'il programma', 'l’orario'],
  action: ['mandare il file', 'spiegare di nuovo', 'entrare'],
  'verb-ing': ['aiutarmi', 'aspettare un attimo', 'ripetere']
};

function cloneChunkData(data: ChunkMapData): ChunkMapData {
  const copy: ChunkMapData = {};
  Object.keys(data).forEach(dim => {
    copy[dim] = {};
    Object.keys(data[dim]).forEach(branch => {
      copy[dim][branch] = [...data[dim][branch]];
    });
  });
  return copy;
}

function mergeChunkData(base: ChunkMapData, saved: ChunkMapData | null): ChunkMapData {
  const merged = cloneChunkData(base);
  if (!saved || typeof saved !== 'object') return merged;

  Object.keys(saved).forEach(dim => {
    if (!merged[dim]) merged[dim] = {};
    const branches = saved[dim];
    if (branches && typeof branches === 'object') {
      Object.keys(branches).forEach(branch => {
        const phrases = Array.isArray(branches[branch]) ? branches[branch] : [];
        if (!merged[dim][branch]) {
          merged[dim][branch] = [...phrases];
        } else {
          const existingSet = new Set(merged[dim][branch]);
          phrases.forEach(p => {
            if (!existingSet.has(p)) {
              merged[dim][branch].push(p);
              existingSet.add(p);
            }
          });
        }
      });
    }
  });
  return merged;
}

function mergeVocab(
  base: Record<string, string[]>,
  saved: Record<string, string[]> | null
): Record<string, string[]> {
  const merged: Record<string, string[]> = {};
  Object.keys(base).forEach(k => {
    merged[k] = [...base[k]];
  });
  if (saved && typeof saved === 'object') {
    Object.keys(saved).forEach(k => {
      const list = Array.isArray(saved[k]) ? saved[k] : [];
      if (!merged[k]) {
        merged[k] = [...list];
      } else {
        const lowerSet = new Set(merged[k].map(w => w.toLowerCase()));
        list.forEach(w => {
          if (!lowerSet.has(w.toLowerCase())) {
            merged[k].push(w);
            lowerSet.add(w.toLowerCase());
          }
        });
      }
    });
  }
  return merged;
}

interface StudyStoreContextValue {
  language: StudyLanguage;
  chunkData: ChunkMapData;
  isDefaultBranch: (dim: DimensionKey, branchName: string) => boolean;
  isDefaultPhrase: (dim: DimensionKey, branchName: string, phrase: string) => boolean;
  addBranch: (dim: DimensionKey, branchName: string, initialPhrases: string[]) => void;
  addPhraseToBranch: (dim: DimensionKey, branchName: string, phrase: string) => void;
  deleteCustomBranch: (dim: DimensionKey, branchName: string) => void;
  deleteCustomPhrase: (dim: DimensionKey, branchName: string, phrase: string) => void;
  starters: SentenceStarter[];
  addStarter: (starter: SentenceStarter) => void;
  deleteStarter: (id: string) => void;
  resetStarters: () => void;
  slotVocabulary: Record<string, string[]>;
  customWords: string[];
  addSlotWord: (slotName: string, word: string) => void;
  addCustomWord: (word: string) => void;
  globalPhrases: GlobalPhraseEntry[];
}

const StudyStoreContext = createContext<StudyStoreContextValue | null>(null);

export function StudyStoreProvider({
  language,
  children
}: {
  language: StudyLanguage;
  children: React.ReactNode;
}) {
  const baseChunkData = useMemo(
    () => (language === 'it' ? ITALIAN_CHUNK_DATA : CHUNK_DATA),
    [language]
  );
  const baseStarters = useMemo(
    () => (language === 'it' ? ITALIAN_STARTERS : DEFAULT_STARTERS),
    [language]
  );
  const baseVocab = useMemo(
    () => (language === 'it' ? DEFAULT_SLOT_VOCAB_IT : DEFAULT_SLOT_VOCAB_EN),
    [language]
  );

  const chunkStorageKey = `chunk_global_map_v1_${language}`;
  const starterStorageKey = `chunk_sentence_starters_${language}_v1`;
  const vocabStorageKey = `chunk_global_vocab_v1_${language}`;
  const wordsStorageKey = `chunk_global_words_v1_${language}`;

  const [chunkData, setChunkData] = useState<ChunkMapData>(() => {
    try {
      const saved = localStorage.getItem(chunkStorageKey);
      return mergeChunkData(baseChunkData, saved ? JSON.parse(saved) : null);
    } catch {
      return cloneChunkData(baseChunkData);
    }
  });

  const [starters, setStarters] = useState<SentenceStarter[]>(() => {
    try {
      const saved = localStorage.getItem(starterStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return baseStarters;
  });

  const [slotVocabulary, setSlotVocabulary] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(vocabStorageKey);
      return mergeVocab(baseVocab, saved ? JSON.parse(saved) : null);
    } catch {
      return mergeVocab(baseVocab, null);
    }
  });

  const [customWords, setCustomWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(wordsStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Sync when language switches
  useEffect(() => {
    try {
      const savedMap = localStorage.getItem(chunkStorageKey);
      setChunkData(mergeChunkData(baseChunkData, savedMap ? JSON.parse(savedMap) : null));
    } catch {
      setChunkData(cloneChunkData(baseChunkData));
    }

    try {
      const savedStarters = localStorage.getItem(starterStorageKey);
      setStarters(savedStarters ? JSON.parse(savedStarters) : baseStarters);
    } catch {
      setStarters(baseStarters);
    }

    try {
      const savedVocab = localStorage.getItem(vocabStorageKey);
      setSlotVocabulary(mergeVocab(baseVocab, savedVocab ? JSON.parse(savedVocab) : null));
    } catch {
      setSlotVocabulary(mergeVocab(baseVocab, null));
    }

    try {
      const savedWords = localStorage.getItem(wordsStorageKey);
      setCustomWords(savedWords ? JSON.parse(savedWords) : []);
    } catch {
      setCustomWords([]);
    }
  }, [language, chunkStorageKey, starterStorageKey, vocabStorageKey, wordsStorageKey, baseChunkData, baseStarters, baseVocab]);

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(chunkStorageKey, JSON.stringify(chunkData));
    } catch {
      // ignore
    }
  }, [chunkData, chunkStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(starterStorageKey, JSON.stringify(starters));
    } catch {
      // ignore
    }
  }, [starters, starterStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(vocabStorageKey, JSON.stringify(slotVocabulary));
    } catch {
      // ignore
    }
  }, [slotVocabulary, vocabStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(wordsStorageKey, JSON.stringify(customWords));
    } catch {
      // ignore
    }
  }, [customWords, wordsStorageKey]);

  const isDefaultBranch = useCallback(
    (dim: DimensionKey, branchName: string) => Boolean(baseChunkData[dim]?.[branchName]),
    [baseChunkData]
  );

  const isDefaultPhrase = useCallback(
    (dim: DimensionKey, branchName: string, phrase: string) =>
      Boolean(baseChunkData[dim]?.[branchName]?.includes(phrase)),
    [baseChunkData]
  );

  const addBranch = useCallback(
    (dim: DimensionKey, branchName: string, initialPhrases: string[]) => {
      const cleanName = branchName.trim().toLowerCase();
      const cleanedPhrases = initialPhrases.map(p => p.trim()).filter(Boolean);
      if (!cleanName || cleanedPhrases.length === 0) return;

      setChunkData(prev => {
        const next = cloneChunkData(prev);
        if (!next[dim]) next[dim] = {};
        if (!next[dim][cleanName]) {
          next[dim][cleanName] = [...cleanedPhrases];
        } else {
          const existingSet = new Set(next[dim][cleanName]);
          cleanedPhrases.forEach(p => {
            if (!existingSet.has(p)) {
              next[dim][cleanName].push(p);
              existingSet.add(p);
            }
          });
        }
        return next;
      });
    },
    []
  );

  const addPhraseToBranch = useCallback(
    (dim: DimensionKey, branchName: string, phrase: string) => {
      const trimmed = phrase.trim();
      if (!trimmed) return;
      setChunkData(prev => {
        const next = cloneChunkData(prev);
        if (!next[dim]) next[dim] = {};
        if (!next[dim][branchName]) next[dim][branchName] = [];
        if (!next[dim][branchName].includes(trimmed)) {
          next[dim][branchName] = [...next[dim][branchName], trimmed];
        }
        return next;
      });
    },
    []
  );

  const deleteCustomBranch = useCallback(
    (dim: DimensionKey, branchName: string) => {
      if (isDefaultBranch(dim, branchName)) return;
      setChunkData(prev => {
        const next = cloneChunkData(prev);
        if (next[dim]?.[branchName]) {
          delete next[dim][branchName];
        }
        return next;
      });
    },
    [isDefaultBranch]
  );

  const deleteCustomPhrase = useCallback(
    (dim: DimensionKey, branchName: string, phrase: string) => {
      if (isDefaultPhrase(dim, branchName, phrase)) return;
      setChunkData(prev => {
        const next = cloneChunkData(prev);
        if (next[dim]?.[branchName]) {
          next[dim][branchName] = next[dim][branchName].filter(p => p !== phrase);
        }
        return next;
      });
    },
    [isDefaultPhrase]
  );

  const addStarter = useCallback((starter: SentenceStarter) => {
    setStarters(prev => [starter, ...prev]);
  }, []);

  const deleteStarter = useCallback((id: string) => {
    setStarters(prev => prev.filter(s => s.id !== id));
  }, []);

  const resetStarters = useCallback(() => {
    setStarters(baseStarters);
  }, [baseStarters]);

  const addCustomWord = useCallback((word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    setCustomWords(prev => {
      if (prev.some(w => w.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [trimmed, ...prev];
    });
  }, []);

  const addSlotWord = useCallback(
    (slotName: string, word: string) => {
      const cleanSlot = slotName.trim().toLowerCase();
      const trimmed = word.trim();
      if (!cleanSlot || !trimmed) return;

      setSlotVocabulary(prev => {
        const existing = prev[cleanSlot] || [];
        if (existing.some(w => w.toLowerCase() === trimmed.toLowerCase())) return prev;
        return {
          ...prev,
          [cleanSlot]: [trimmed, ...existing]
        };
      });
      addCustomWord(trimmed);
    },
    [addCustomWord]
  );

  // Compute global unified phrase library across the whole app
  const globalPhrases = useMemo<GlobalPhraseEntry[]>(() => {
    const entries: GlobalPhraseEntry[] = [];
    const seen = new Set<string>();

    const pushEntry = (entry: GlobalPhraseEntry) => {
      const key = entry.phrase.trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      entries.push(entry);
    };

    // 1. Chunk Map (including custom branches and user-added phrases)
    DIMS.forEach(dim => {
      const branches = chunkData[dim] || {};
      Object.keys(branches).forEach(branch => {
        branches[branch].forEach((phrase, idx) => {
          const isCustom = !isDefaultPhrase(dim, branch, phrase);
          pushEntry({
            id: `chunk-${dim}-${branch}-${idx}`,
            phrase,
            source: `${dim} → ${branch}`,
            category: isCustom ? 'custom' : 'chunk',
            dim,
            branch,
            isCustom
          });
        });
      });
    });

    // 2. Sentence Starters (Q&A)
    starters.forEach(s => {
      pushEntry({
        id: `starter-${s.id}`,
        phrase: s.example || s.starter,
        source: `Q&A: ${s.intentTag}`,
        category: s.isCustom ? 'custom' : 'starter',
        isCustom: s.isCustom
      });
    });

    // 3. Situation Guides
    const guides = language === 'it' ? ITALIAN_SITUATIONS : SITUATION_GUIDES;
    guides.forEach(g => {
      g.recommendedChunks.forEach((c, idx) => {
        pushEntry({
          id: `sit-${g.id}-${idx}`,
          phrase: c.starter,
          source: `Situação: ${g.title}`,
          category: 'situation'
        });
      });
    });

    // 4. Connected Speech examples
    if (language === 'en') {
      CONNECTED_SPEECH_EXAMPLES.forEach(ex => {
        pushEntry({
          id: `cs-${ex.id}`,
          phrase: ex.carefulText,
          source: 'Fala Conectada',
          category: 'connected'
        });
      });
    }

    return entries;
  }, [chunkData, starters, language, isDefaultPhrase]);

  const value: StudyStoreContextValue = {
    language,
    chunkData,
    isDefaultBranch,
    isDefaultPhrase,
    addBranch,
    addPhraseToBranch,
    deleteCustomBranch,
    deleteCustomPhrase,
    starters,
    addStarter,
    deleteStarter,
    resetStarters,
    slotVocabulary,
    customWords,
    addSlotWord,
    addCustomWord,
    globalPhrases
  };

  return <StudyStoreContext.Provider value={value}>{children}</StudyStoreContext.Provider>;
}

export function useStudyStore() {
  const ctx = useContext(StudyStoreContext);
  if (!ctx) {
    throw new Error('useStudyStore must be used inside a StudyStoreProvider');
  }
  return ctx;
}
