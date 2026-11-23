/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChunkMapData, DimensionKey } from '../types.ts';

export const DIMS: DimensionKey[] = ["lugar", "acontecimento", "pessoa", "canal", "tom"];

export const DIM_COLORS = [
  "var(--c0)",
  "var(--c1)",
  "var(--c2)",
  "var(--c3)",
  "var(--c4)",
  "var(--c5)"
];

export const ORDER = [3, 2, 4, 1, 0];

export const CHUNK_DATA: ChunkMapData = {
  lugar: {
    "aeroporto": ["I’m flying to [lugar].", "Could I get [coisa]?"],
    "táxi": ["Could you take me to [lugar]?", "Keep the change."],
    "restaurante": ["I’ll have [prato].", "Could we have the check?"],
    "rua": ["How do I get to [lugar]?", "Is it far from here?"],
    "universidade": ["Could you repeat [coisa]?", "Could I get an extension?"],
    "bar": ["Could I get [bebida]?", "This round is on me."],
    "supermercado": ["Where can I find [coisa]?", "Is it on sale?"],
    "banco": ["I’d like to (withdraw | deposit) [valor].", "My card isn’t working."]
  },
  acontecimento: {
    "imprevisto": ["My flight was (delayed | canceled).", "I ended up [verbo-ing]."],
    "quebra": ["The [máquina] stopped working.", "It turned out that [causa]."],
    "problema com cliente": ["The order (arrived late | was wrong).", "We’re still waiting for [coisa]."],
    "mal-entendido": ["There was a mix-up about [coisa].", "I thought you meant [coisa]."],
    "notícia": ["I just found out that [fato].", "I didn’t see that coming."],
    "viagem ou evento": ["We went to [lugar] for [motivo].", "The best part was [coisa]."],
    "decisão": ["I decided to [verbo] because [causa].", "So far, [resultado]."],
    "surpresa": ["You won’t believe what happened.", "What are the odds?"]
  },
  pessoa: {
    "estranho": ["Excuse me,", "Sorry to bother you, but"],
    "atendente": ["Could you help me [verbo]?", "I have a question about [coisa]."],
    "colega": ["Do you have a minute?", "Can you give me a hand with [coisa]?"],
    "chefe": ["I wanted to update you on [coisa].", "Would it be okay if I [verbo]?"],
    "cliente": ["Thanks for your patience.", "We can offer you [coisa]."],
    "amigo": ["Guess what?", "Wanna [verbo]?"]
  },
  canal: {
    "pessoalmente": ["Nice to meet you.", "Let me show you."],
    "telefone": ["I’m calling about [assunto].", "Could you hold on a second?"],
    "e-mail": ["I’m writing to [verbo].", "Please find attached [coisa]."],
    "WhatsApp": ["Just a quick message about [coisa].", "Talk soon!"],
    "videochamada": ["Can you hear me?", "You’re on mute."]
  },
  tom: {
    "educado": ["Would you mind [verbo-ing]?", "I’d appreciate it if you could [verbo]."],
    "urgente": ["This is quite urgent.", "I need [coisa] by [prazo]."],
    "frustrado": ["I’m afraid there’s a problem with [coisa].", "This isn’t what I expected."],
    "animado": ["I’m really excited about [coisa].", "That’s great news!"],
    "preocupado": ["I’m a bit concerned about [coisa].", "I’m worried that [fato]."]
  }
};
