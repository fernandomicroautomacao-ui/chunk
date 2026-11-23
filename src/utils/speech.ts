/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudyLanguage } from '../types.ts';

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Plays text using Web Speech API in native English or Italian.
 */
export function playSpeech(
  text: string,
  language: StudyLanguage = 'en',
  rate: number = 0.95,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean placeholders like [topic] -> "topic" or remove brackets for natural speech
    const cleanText = text
      .replace(/\[([^\]]+)\]/g, '$1')
      .replace(/[()|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    utterance.lang = language === 'it' ? 'it-IT' : 'en-US';
    utterance.rate = rate; // 0.8 - 1.0

    // Try finding a matching native voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = language === 'it' ? 'it' : 'en';
    const voice = voices.find(v => v.lang.startsWith(targetLang) && !v.name.includes('Google') === false) ||
                  voices.find(v => v.lang.startsWith(targetLang));

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
