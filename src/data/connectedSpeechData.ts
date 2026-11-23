/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudyLanguage } from '../types.ts';

export interface ConnectedSpeechExample {
  id: string;
  carefulText: string;
  naturalText: string;
  phoneticBreakdown: string;
  phenomena: Array<'linking' | 'schwa' | 'stress' | 'reduction' | 'intonation'>;
  explanation: string;
  colorAnnotations?: Array<{
    text: string;
    type: 'linking' | 'elision' | 'reduction' | 'stress';
  }>;
}

export interface PhenomenonGuide {
  id: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  keyRule: string;
  examples: Array<{
    written: string;
    spoken: string;
    notes: string;
  }>;
}

export const ENGLISH_PHENOMENA: PhenomenonGuide[] = [
  {
    id: 'phenom-1',
    number: 1,
    title: 'Linking (Ligação)',
    tagline: 'As palavras se unem em um fluxo contínuo sem pausas artificiais.',
    description: 'Nativos americanos não falam palavra por palavra. Quando uma palavra termina em som de consoante e a próxima começa com som de vogal, elas se fundem como se fossem uma única palavra.',
    keyRule: 'Consoante + Vogal se fundem diretamente (an + apple = "anapple").',
    examples: [
      {
        written: 'an apple',
        spoken: 'a·napple',
        notes: 'O /n/ salta para o início da palavra "apple".'
      },
      {
        written: 'hold on a second',
        spoken: 'hol·do·nə second',
        notes: 'O /d/ liga com "on" e o /n/ liga com o Schwa /ə/.'
      },
      {
        written: 'Did you see it?',
        spoken: 'Didja see it?',
        notes: 'O /d/ de "did" encontra o /y/ de "you" e vira o som /dʒ/ ("dja").'
      }
    ]
  },
  {
    id: 'phenom-2',
    number: 2,
    title: 'Schwa (/ə/)',
    tagline: 'O som vocálico mais comum do inglês americano: relaxado, curto e neutro.',
    description: 'Vogais em sílabas átonas (sem ênfase) perdem seu som original e viram o som relaxado "â" (/ə/). Isso permite falar rápido com o menor esforço muscular possível.',
    keyRule: 'Palavras funcionais como "to", "for", "at", "a", "of" quase sempre viram Schwa (/tə/, /fər/, /ət/, /ə/, /əv/).',
    examples: [
      {
        written: 'to New York',
        spoken: 'tə New YORK',
        notes: '"to" perde o som longo de "u" e vira um estalo curto /tə/.'
      },
      {
        written: 'a cup of coffee',
        spoken: 'ə cup·ə coffee',
        notes: '"a" vira /ə/ e "of" perde o /v/, virando /ə/.'
      },
      {
        written: 'about / circus / tandem',
        spoken: 'ə·BOUT / CIR·kəs / TAN·dəm',
        notes: 'Todas as vogais destacadas viram o som idêntico de Schwa.'
      }
    ]
  },
  {
    id: 'phenom-3',
    number: 3,
    title: 'Word & Sentence Stress (Ênfase & Ritmo)',
    tagline: 'O inglês é uma língua "stress-timed": o ritmo depende das sílabas fortes.',
    description: 'Palavras de conteúdo (substantivos, verbos principais, adjetivos) recebem força e volume. Palavras gramaticais (preposições, artigos, pronomes) são comprimidas e faladas muito mais rápido.',
    keyRule: 'Destaque as palavras-chave (EM MAIÚSCULAS) e passe rápido pelas palavras de ligação.',
    examples: [
      {
        written: "I'm flying to New York.",
        spoken: "I'm FLY-ing tə New YORK.",
        notes: 'FLY e YORK recebem 70% da energia sonora da frase.'
      },
      {
        written: 'Could you give me a hand with this?',
        spoken: 'Couldya GIVE me ə HAND with this?',
        notes: 'GIVE e HAND são os pilares de significado.'
      },
      {
        written: 'I decided to leave.',
        spoken: 'I de·CI·ded tə LEAVE.',
        notes: 'CI e LEAVE são os pontos altos da onda sonora.'
      }
    ]
  },
  {
    id: 'phenom-4',
    number: 4,
    title: 'Reductions & Elision (Reduções e Elissões)',
    tagline: 'Expressões frequentes se fundem e perdem letras na fala natural.',
    description: 'Reduções não são "gírias erradas", são atalhos fonéticos automáticos de qualquer falante nativo para manter a cadência e economizar ar.',
    keyRule: 'Identifique reduções comuns: going to → gonna, want to → wanna, out of → outta.',
    examples: [
      {
        written: 'What are you doing?',
        spoken: 'Whaddaya doing?',
        notes: '"What are you" vira um bloco único "Whaddaya".'
      },
      {
        written: 'Want to go?',
        spoken: 'Wanna go?',
        notes: '"Want to" se funde em "Wanna".'
      },
      {
        written: 'Out of time',
        spoken: 'Outta time',
        notes: '"Out of" se funde em "Outta".'
      }
    ]
  },
  {
    id: 'phenom-5',
    number: 5,
    title: 'Intonation (Entonação & Melodia)',
    tagline: 'A voz sobe ou desce no final da frase conforme a sua intenção comunicativa.',
    description: 'No inglês, a melodia expressa certeza, dúvida, polidez ou surpresa. Mudar a entonação pode transformar uma frase amigável em uma cobrança ríspida.',
    keyRule: 'Perguntas Sim/Não SOBEM no final (↗). Perguntas WH- e afirmações DESCEM no final (↘).',
    examples: [
      {
        written: 'Can you hear me? (Sim/Não)',
        spoken: 'Can you hear ME? ↗ (Subida)',
        notes: 'O tom sobe na última sílaba para sinalizar dúvida aberta.'
      },
      {
        written: 'Where is the gate? (Pergunta WH)',
        spoken: 'Where is the GATE? ↘ (Descida)',
        notes: 'O tom cai na palavra final, soando seguro e direto.'
      },
      {
        written: 'That sounds great. (Afirmação)',
        spoken: 'That sounds GREAT. ↘ (Descida firme)',
        notes: 'Sinaliza encerramento de pensamento e concordância.'
      }
    ]
  }
];

export const CONNECTED_SPEECH_EXAMPLES: ConnectedSpeechExample[] = [
  {
    id: 'cs-1',
    carefulText: "I'm flying to New York.",
    naturalText: "I'm FLY-ing tə New YORK.",
    phoneticBreakdown: "aɪm ˈflaɪ.ɪŋ tə nuː ˈjɔːrk",
    phenomena: ['stress', 'schwa', 'linking'],
    explanation: "'I'm' se conecta suavemente com 'flying'. 'to' perde a força e se reduz ao Schwa /tə/. 'FLY' e 'YORK' recebem o estresse principal.",
    colorAnnotations: [
      { text: "I'm flying", type: 'linking' },
      { text: "tə", type: 'reduction' },
      { text: "YORK", type: 'stress' }
    ]
  },
  {
    id: 'cs-2',
    carefulText: 'What are you doing?',
    naturalText: 'Whaddaya doing?',
    phoneticBreakdown: 'ˈwʌd.ə.jə ˈduː.ɪŋ',
    phenomena: ['reduction', 'linking'],
    explanation: "'What are you' se funde no bloco 'Whaddaya' com som de 'flap T' suave (/d/) e Schwa.",
    colorAnnotations: [
      { text: 'Whaddaya', type: 'reduction' },
      { text: 'doing', type: 'stress' }
    ]
  },
  {
    id: 'cs-3',
    carefulText: 'Did you see it?',
    naturalText: 'Didja see it?',
    phoneticBreakdown: 'ˈdɪdʒ.ə siː ɪt',
    phenomena: ['linking', 'reduction'],
    explanation: "O som final /d/ de 'did' se assimila com o /y/ de 'you', produzindo 'Didja' (/dɪdʒə/).",
    colorAnnotations: [
      { text: 'Didja', type: 'linking' },
      { text: 'see it', type: 'linking' }
    ]
  },
  {
    id: 'cs-4',
    carefulText: 'Want to go?',
    naturalText: 'Wanna go?',
    phoneticBreakdown: 'ˈwɑː.nə ɡoʊ',
    phenomena: ['reduction', 'intonation'],
    explanation: "'Want to' é assimilado como 'wanna'. A entonação sobe no final (↗) por ser uma pergunta informal sim/não.",
    colorAnnotations: [
      { text: 'Wanna', type: 'reduction' },
      { text: 'go?', type: 'stress' }
    ]
  },
  {
    id: 'cs-5',
    carefulText: 'Out of time',
    naturalText: 'Outta time',
    phoneticBreakdown: 'ˈaʊ.t̬ə taɪm',
    phenomena: ['reduction', 'linking'],
    explanation: "'Out of' perde a consoante /v/ e o 't' se torna uma batida suave com Schwa ('Outta').",
    colorAnnotations: [
      { text: 'Outta', type: 'reduction' },
      { text: 'time', type: 'stress' }
    ]
  },
  {
    id: 'cs-6',
    carefulText: 'Could you give me a hand?',
    naturalText: 'Couldja gimme ə HAND?',
    phoneticBreakdown: 'ˈkʊdʒ.ə ˈɡɪm.i ə hænd',
    phenomena: ['linking', 'reduction', 'schwa', 'stress'],
    explanation: "'Could you' vira 'Couldja', 'give me' vira 'gimme', 'a' vira Schwa /ə/, e 'HAND' recebe a ênfase máxima.",
    colorAnnotations: [
      { text: 'Couldja', type: 'linking' },
      { text: 'gimme', type: 'reduction' },
      { text: 'ə', type: 'reduction' },
      { text: 'HAND', type: 'stress' }
    ]
  },
  {
    id: 'cs-7',
    carefulText: 'Would you mind helping me?',
    naturalText: 'Wouldja mind HELP-ing me?',
    phoneticBreakdown: 'ˈwʊdʒ.ə maɪnd ˈhelp.ɪŋ mi',
    phenomena: ['linking', 'stress'],
    explanation: "'Would you' vira 'Wouldja' com ligação palatal. O verbo de ação 'HELP' recebe a ênfase principal.",
    colorAnnotations: [
      { text: 'Wouldja', type: 'linking' },
      { text: 'HELP-ing', type: 'stress' }
    ]
  }
];

export const ITALIAN_CONNECTED_PHENOMENA: PhenomenonGuide[] = [
  {
    id: 'it-ph-1',
    number: 1,
    title: 'Elisione & Troncamento',
    tagline: 'Queda de vogal final antes de outra palavra com vogal ou consoante.',
    description: 'Em italiano a fala é melódica e evita o encontro incômodo de vogais (iato). Ocorre o apóstrofo obrigatório (l’amico, c’è, quest’anno) ou o truncamento natural (un po’, bel ragazzo, far bene).',
    keyRule: 'Vogal final cai diante de outra vogal: "ci è" vira "c’è", "una amica" vira "un’amica".',
    examples: [
      {
        written: 'Ci è un problema',
        spoken: 'C’è un problema',
        notes: 'Fusão fonética indispensável para soar natural.'
      },
      {
        written: 'Bello ragazzo / Fare bene',
        spoken: 'Bel ragazzo / Far bene',
        notes: 'Truncamento elegante sem apóstrofo.'
      }
    ]
  },
  {
    id: 'it-ph-2',
    number: 2,
    title: 'Raddoppiamento Fonosintattico',
    tagline: 'A consoante inicial dobra de intensidade na fala após certas palavras.',
    description: 'Quando palavras curtas acentuadas (a, da, che, chi, già, più) precedem uma palavra iniciada por consoante, essa consoante é pronunciada com força dupla na fala culta e espontânea.',
    keyRule: '"A casa" soa como [akˈkasa], "E poi" soa como [epˈpɔi].',
    examples: [
      {
        written: 'A casa',
        spoken: '[akˈkaza]',
        notes: 'O "c" é pronunciado forte como se houvesse duas letras.'
      },
      {
        written: 'Che fai?',
        spoken: '[kefˈfai]',
        notes: 'O "f" ganha intensidade rítmica.'
      }
    ]
  },
  {
    id: 'it-ph-3',
    number: 3,
    title: 'Accento Tonico & Melodia',
    tagline: 'A quase totalidade das palavras italianas é parossítona (acento na penúltima sílaba).',
    description: 'O italiano possui uma musicalidade cadenciada onde a vogal tônica é ligeiramente mais longa. As consoantes duplas (geminate) definem o ritmo da frase.',
    keyRule: 'Distinga consoantes simples de duplas: "pala" (pá) vs "palla" (bola); "pena" (pena) vs "penna" (caneta).',
    examples: [
      {
        written: 'Un caffè al banco',
        spoken: 'Un caf·FÈ al BAN·co',
        notes: 'Ênfase nítida na última sílaba de caffè e na penúltima de banco.'
      }
    ]
  }
];

/**
 * Helper to analyze any arbitrary chunk text for natural connected speech features
 */
export function getConnectedSpeechBreakdown(phrase: string, language: StudyLanguage): {
  careful: string;
  natural: string;
  notes: string[];
} {
  if (language === 'it') {
    return {
      careful: phrase,
      natural: phrase.replace(/c'è/gi, "C'È").replace(/per favore/gi, "per fa·VO·re"),
      notes: [
        'Atenção ao ritmo das vogais abertas e ao acento tônico.',
        'Mantenha a fluidez entre as palavras evitando pausas bruscas.'
      ]
    };
  }

  // English heuristic breakdown
  let natural = phrase;
  const notes: string[] = [];

  if (/what are you/i.test(natural)) {
    natural = natural.replace(/what are you/gi, 'Whaddaya');
    notes.push('Redução: "What are you" → Whaddaya (Flap T + Schwa)');
  }
  if (/did you/i.test(natural)) {
    natural = natural.replace(/did you/gi, 'Didja');
    notes.push('Linking / Assimilação: "Did you" → Didja');
  }
  if (/could you/i.test(natural)) {
    natural = natural.replace(/could you/gi, 'Couldja');
    notes.push('Linking: "Could you" → Couldja');
  }
  if (/would you/i.test(natural)) {
    natural = natural.replace(/would you/gi, 'Wouldja');
    notes.push('Linking: "Would you" → Wouldja');
  }
  if (/want to/i.test(natural)) {
    natural = natural.replace(/want to/gi, 'wanna');
    notes.push('Redução informal: "want to" → wanna');
  }
  if (/going to/i.test(natural)) {
    natural = natural.replace(/going to/gi, 'gonna');
    notes.push('Redução informal: "going to" → gonna');
  }
  if (/out of/i.test(natural)) {
    natural = natural.replace(/out of/gi, 'outta');
    notes.push('Redução: "out of" → outta');
  }
  if (/\bto\b/i.test(natural)) {
    natural = natural.replace(/\bto\b/gi, 'tə');
    notes.push('Schwa: "to" perde o som longo de /uː/ e vira /tə/');
  }
  if (/\ba\b/i.test(natural)) {
    natural = natural.replace(/\ba\b/g, 'ə');
    notes.push('Schwa: o artigo "a" é pronunciado como /ə/');
  }

  // Highlight capitalized key stress words
  const words = natural.split(' ');
  const stressedWords = words.map((w, idx) => {
    // If it's a content word and longer than 4 chars, give it stress highlight
    if (w.length > 4 && !w.startsWith('[') && !w.includes('ə')) {
      return w.toUpperCase();
    }
    return w;
  });

  return {
    careful: phrase.split(' ').join(' / '),
    natural: stressedWords.join(' '),
    notes: notes.length > 0 ? notes : [
      'As palavras gramaticais (preposições, artigos) são pronunciadas com Schwa /ə/.',
      'As palavras de conteúdo principais recebem o maior volume e tempo de sustentação (stress).'
    ]
  };
}
