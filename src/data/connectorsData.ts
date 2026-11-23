/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudyLanguage } from '../types.ts';

export interface SpeechConnector {
  id: string;
  phrase: string;
  category: 'Buying Time' | 'Nuanced Contrast' | 'Adding Points' | 'Frankness & Honesty' | 'Smooth Transition';
  translation: string;
  purpose: string;
  example: string;
}

export const ENGLISH_CONNECTORS: SpeechConnector[] = [
  // Buying Time
  {
    id: 'enc-1',
    phrase: 'As a matter of fact...',
    category: 'Buying Time',
    translation: 'Na verdade... / Para falar a verdade...',
    purpose: 'Introduz uma informação precisa enquanto ganha 2 segundos de raciocínio',
    example: 'As a matter of fact, we just received the updated metrics this morning.'
  },
  {
    id: 'enc-2',
    phrase: 'Off the top of my head...',
    category: 'Buying Time',
    translation: 'De cabeça... / Sem consultar os dados...',
    purpose: 'Sinaliza que a resposta é preliminar sem se comprometer com números exatos',
    example: 'Off the top of my head, I’d say we have around forty active accounts.'
  },
  {
    id: 'enc-3',
    phrase: 'If I recall correctly...',
    category: 'Buying Time',
    translation: 'Se bem me lembro...',
    purpose: 'Preenche a pausa inicial de forma elegante enquanto recupera um fato',
    example: 'If I recall correctly, they agreed to deliver the assets by Thursday.'
  },

  // Nuanced Contrast
  {
    id: 'enc-4',
    phrase: 'Having said that...',
    category: 'Nuanced Contrast',
    translation: 'Dito isso... / Apesar disso...',
    purpose: 'Transição suave entre um elogio e uma ressalva crítica',
    example: 'The initial design looks great. Having said that, we still need to review mobile performance.'
  },
  {
    id: 'enc-5',
    phrase: 'At the same time...',
    category: 'Nuanced Contrast',
    translation: 'Ao mesmo tempo... / Por outro lado...',
    purpose: 'Equilibra dois pontos opostos sem desmerecer nenhum dos lados',
    example: 'We want to move quickly; at the same time, quality cannot be compromised.'
  },

  // Adding Points
  {
    id: 'enc-6',
    phrase: 'On top of that...',
    category: 'Adding Points',
    translation: 'Além disso... / Para completar...',
    purpose: 'Acrescenta um argumento decisivo com ênfase cumulativa',
    example: 'The team met all milestones, and on top of that, we stayed under budget.'
  },
  {
    id: 'enc-7',
    phrase: 'Not to mention...',
    category: 'Adding Points',
    translation: 'Sem contar que... / Nem preciso mencionar...',
    purpose: 'Adiciona um fator óbvio ou de grande impacto',
    example: 'It would save hours each week, not to mention reduce server costs.'
  },

  // Frankness & Honesty
  {
    id: 'enc-8',
    phrase: 'To be completely honest with you...',
    category: 'Frankness & Honesty',
    translation: 'Para ser completamente sincero com você...',
    purpose: 'Cria cumplicidade e prepara o interlocutor para um feedback genuíno',
    example: 'To be completely honest with you, I think we should rethink the onboarding step.'
  },
  {
    id: 'enc-9',
    phrase: 'Frankly speaking...',
    category: 'Frankness & Honesty',
    translation: 'Falando com franqueza...',
    purpose: 'Corta enrolações e vai direto ao cerne da questão com respeito',
    example: 'Frankly speaking, the current approach is not scalable long-term.'
  },

  // Smooth Transition
  {
    id: 'enc-10',
    phrase: 'In the meantime...',
    category: 'Smooth Transition',
    translation: 'Enquanto isso... / Nesse meio tempo...',
    purpose: 'Propõe uma ação provisória enquanto uma decisão maior é aguardada',
    example: 'The legal team is checking the terms; in the meantime, let’s finalize the slides.'
  },
  {
    id: 'enc-11',
    phrase: 'Speaking of which...',
    category: 'Smooth Transition',
    translation: 'Por falar nisso... / Aproveitando o gancho...',
    purpose: 'Aproveita um gancho da conversa para introduzir outro tópico relevante',
    example: 'Speaking of which, did you get a chance to review the budget proposal?'
  }
];

export const ITALIAN_CONNECTORS: SpeechConnector[] = [
  // Buying Time
  {
    id: 'itc-1',
    phrase: 'A dire il vero...',
    category: 'Buying Time',
    translation: 'A bem da verdade... / Para dizer a verdade...',
    purpose: 'Prende l’attenzione e dà qualche secondo per calibrare la risposta',
    example: 'A dire il vero, stiamo ancora aspettando la conferma definitiva dal cliente.'
  },
  {
    id: 'itc-2',
    phrase: 'Se non ricordo male...',
    category: 'Buying Time',
    translation: 'Se não me falha a memória...',
    purpose: 'Esprime un ricordo con prudenza senza rischiare affermazioni perentorie',
    example: 'Se non ricordo male, avevamo concordato la consegna per martedì prossimo.'
  },
  {
    id: 'itc-3',
    phrase: 'A quanto mi risulta...',
    category: 'Buying Time',
    translation: 'Pelo que me consta...',
    purpose: 'Introduce informazioni d’ufficio mantenendo una riserva di verifica',
    example: 'A quanto mi risulta, il bonifico è già stato inoltrato ieri mattina.'
  },

  // Nuanced Contrast
  {
    id: 'itc-4',
    phrase: 'Ciò premesso...',
    category: 'Nuanced Contrast',
    translation: 'Premisso isso... / Feita essa ressalva...',
    purpose: 'Classico connettore formale italiano per passare dalla premessa al punto critico',
    example: 'L’idea è stimolante. Ciò premesso, dobbiamo verificare la sostenibilità economica.'
  },
  {
    id: 'itc-5',
    phrase: 'D’altronde...',
    category: 'Nuanced Contrast',
    translation: 'Por outro lado... / Afinal de contas...',
    purpose: 'Giustifica un fatto evidenziando una realtà oggettiva o inevitabile',
    example: 'Il progetto è complesso, ma d’altronde non potevamo aspettarci un compito facile.'
  },

  // Adding Points
  {
    id: 'itc-6',
    phrase: 'Tra l’altro...',
    category: 'Adding Points',
    translation: 'Aliás... / Além do mais...',
    purpose: 'Aggiunge un elemento di supporto in modo naturale e spontaneo',
    example: 'I dati sono molto positivi e, tra l’altro, confermano il trend dello scorso anno.'
  },
  {
    id: 'itc-7',
    phrase: 'Oltretutto...',
    category: 'Adding Points',
    translation: 'Sobretudo... / E tem mais...',
    purpose: 'Rinforza un’argomentazione con un motivo ancora più pesante',
    example: 'Non abbiamo abbastanza tempo e, oltretutto, le risorse sono limitate.'
  },

  // Frankness & Honesty
  {
    id: 'itc-8',
    phrase: 'A carte scoperte...',
    category: 'Frankness & Honesty',
    translation: 'Falando às claras... / Com as cartas na mesa...',
    purpose: 'Invita alla massima trasparenza durante una trattativa o confronto',
    example: 'Parliamoci a carte scoperte: qual è il vostro budget massimo per questo trimestre?'
  },
  {
    id: 'itc-9',
    phrase: 'Sinceramente parlando...',
    category: 'Frankness & Honesty',
    translation: 'Falando com sinceridade...',
    purpose: 'Dà un tocco di autenticità a un’opinione personale in team',
    example: 'Sinceramente parlando, preferirei concentrare le energie su un solo prodotto.'
  },

  // Smooth Transition
  {
    id: 'itc-10',
    phrase: 'Nel frattempo...',
    category: 'Smooth Transition',
    translation: 'Enquanto isso... / No intervalo...',
    purpose: 'Focalizza l’azione immediata in attesa di un evento futuro',
    example: 'Aspettiamo l’ok della direzione; nel frattempo, noi prepariamo la documentazione.'
  },
  {
    id: 'itc-11',
    phrase: 'A proposito di questo...',
    category: 'Smooth Transition',
    translation: 'A propósito disso... / Falando nisso...',
    purpose: 'Collega due argomenti affini in una riunione senza strappi bruschi',
    example: 'A proposito di questo, hai avuto modo di sentire il responsabile dell’assistenza?'
  }
];

export function getConnectorsForLanguage(lang: StudyLanguage): SpeechConnector[] {
  return lang === 'it' ? ITALIAN_CONNECTORS : ENGLISH_CONNECTORS;
}
