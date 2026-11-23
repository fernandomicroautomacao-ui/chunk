/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudyLanguage = 'en' | 'it';

export type DimensionKey = 'lugar' | 'acontecimento' | 'pessoa' | 'canal' | 'tom';

export interface ChunkMapData {
  [dim: string]: {
    [category: string]: string[];
  };
}

export type StarterType = 'question' | 'response';

export interface SentenceStarter {
  id: string;
  type: StarterType;
  intentTag: string;
  starter: string;
  situation: string;
  example: string;
  isCustom?: boolean;
}

export interface ScenarioChunk {
  label: string;
  starter: string;
  type: 'question' | 'response';
  purpose: string;
}

export interface SituationGuide {
  id: string;
  category: 'Travel' | 'Workplace' | 'Dining' | 'Customer Support' | 'Social & Networking' | 'Written Comms';
  title: string;
  context: string;
  culturalTip: string;
  dos: string[];
  donts: string[];
  recommendedChunks: ScenarioChunk[];
  sampleDialogue: {
    speakerA: string;
    textA: string;
    speakerB: string;
    textB: string;
  };
  practiceChallenge: {
    prompt: string;
    options: {
      text: string;
      isBest: boolean;
      feedback: string;
    }[];
  };
}

export interface NodeItem {
  label: string;
  type: 'center' | 'hub' | 'item' | 'chunk';
  dim: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hub?: NodeItem;
  pk?: NodeItem;
}

export interface LinkItem {
  a: NodeItem;
  b: NodeItem;
  len: number;
}
