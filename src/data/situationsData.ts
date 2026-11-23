/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SituationGuide } from '../types.ts';

export const SITUATION_GUIDES: SituationGuide[] = [
  {
    id: 'sit-1',
    category: 'Travel',
    title: 'Aeroporto: Voo Atrasado ou Conexão Perdida',
    context: 'Você chega ao portão e descobre que o voo foi remarcado ou cancelado, arriscando uma conexão internacional.',
    culturalTip: 'Nos aeroportos dos EUA e Reino Unido, atendentes lidam com centenas de passageiros exaltados. O passageiro que usa linguagem suavizadora ("I know this is not your fault, but...") ganha empatia imediata e vouchers com prioridade.',
    dos: [
      'Use estruturas indiretas gentis: "Could you possibly check if there are alternative flights?"',
      'Reconheça a situação da equipe: "I appreciate your patience while looking into this."',
      'Pergunte sobre acomodação de forma objetiva: "Would the airline be able to provide hotel accommodation?"'
    ],
    donts: [
      'Nunca comece com exigências secas: "I want a new flight now" (soa agressivo e hostil).',
      'Não traduza "Eu exijo": prefira "What options do we have at this stage?"',
      'Não interrompa o atendente enquanto ele digita no sistema terminal.'
    ],
    recommendedChunks: [
      {
        label: 'Checar alternativas',
        starter: 'Could you possibly check if there’s another flight to [destination] today?',
        type: 'question',
        purpose: 'Pedido cortês de reacomodação'
      },
      {
        label: 'Acomodação e vouchers',
        starter: 'Would it be possible to get a voucher for meals while we wait?',
        type: 'question',
        purpose: 'Solicitação de suporte sem soar autoritário'
      },
      {
        label: 'Compreensão mútua',
        starter: 'I understand this is out of your hands, but any assistance would be greatly appreciated.',
        type: 'response',
        purpose: 'Construção de rapport com o atendente'
      }
    ],
    sampleDialogue: {
      speakerA: 'Agent: "Unfortunately, the flight to Chicago is delayed by four hours due to weather."',
      textA: 'Agent: "Unfortunately, the flight to Chicago is delayed by four hours due to weather."',
      speakerB: 'You: "I understand. Would it be possible to check if there are any connecting options through Atlanta instead?"',
      textB: 'You: "I understand. Would it be possible to check if there are any connecting options through Atlanta instead?"'
    },
    practiceChallenge: {
      prompt: 'O atendente diz que não há vagas hoje no seu destino. Qual é a melhor forma de pedir ajuda para o dia seguinte?',
      options: [
        {
          text: 'I want you to book me tomorrow morning immediately!',
          isBest: false,
          feedback: 'Muito imperativo e rude. Em inglês, ordens diretas geram resistência do atendente.'
        },
        {
          text: 'Could you please check what the earliest flight available tomorrow would be?',
          isBest: true,
          feedback: 'Excelente! O uso de "Could you please check..." é formal, polido e claro.'
        },
        {
          text: 'Give me hotel voucher because you canceled.',
          isBest: false,
          feedback: 'Gramaticalmente incompleto e com tom agressivo.'
        }
      ]
    }
  },
  {
    id: 'sit-2',
    category: 'Workplace',
    title: 'Reunião de Trabalho: Discordar com Elegância',
    context: 'Durante uma reunião de planejamento, um colega ou gestor propõe uma ideia que você acredita que trará riscos.',
    culturalTip: 'Em reuniões corporativas em inglês, usa-se a técnica do "Sanduíche Diplomático": valide primeiro o objetivo da pessoa ("I see the merit in that"), aponte a preocupação com suavidade ("my only concern is...") e proponha uma alternativa construtiva.',
    dos: [
      'Valide a intenção antes de contrastar: "I like the thinking behind that, though we might want to consider [risk]."',
      'Use conectores de suavização: "Having said that...", "Just playing devil’s advocate here..."',
      'Convide o colega a co-criar a solução: "How would we address [concern] if we take that route?"'
    ],
    donts: [
      'Evite o "No, that’s wrong" ou "That won’t work" (soa como ataque pessoal).',
      'Não fique em silêncio por vergonha: use inícios como "Do you mind if I jump in with another perspective?"'
    ],
    recommendedChunks: [
      {
        label: 'Intervenção suave',
        starter: 'Do you mind if I chime in with a quick thought on [topic]?',
        type: 'question',
        purpose: 'Pedir a palavra com polidez'
      },
      {
        label: 'Apresentar preocupação',
        starter: 'I see where you’re coming from, but my main concern is [issue].',
        type: 'response',
        purpose: 'Contraponto respeitoso'
      },
      {
        label: 'Propor alternativa',
        starter: 'Instead of [option A], what if we tested [option B] on a smaller scale?',
        type: 'question',
        purpose: 'Sugestão construtiva e pragmática'
      }
    ],
    sampleDialogue: {
      speakerA: 'Manager: "Let’s launch the entire redesign this Friday to beat the quarter deadline."',
      textA: 'Manager: "Let’s launch the entire redesign this Friday to beat the quarter deadline."',
      speakerB: 'You: "I definitely see why speed matters here. My only worry is QA coverage. What if we do a beta release first?"',
      textB: 'You: "I definitely see why speed matters here. My only worry is QA coverage. What if we do a beta release first?"'
    },
    practiceChallenge: {
      prompt: 'Seu chefe propõe um prazo impossível para um projeto. Como você responde de forma profissional?',
      options: [
        {
          text: 'That deadline is impossible, we can never do that.',
          isBest: false,
          feedback: 'Muito cru e pessimista. Não oferece soluções nem demonstra compromisso.'
        },
        {
          text: 'Given our current backlog, that timeline might be tight. Could we prioritize the core features first?',
          isBest: true,
          feedback: 'Perfeito! Apresenta o contexto realista e sugere imediatamente uma priorização executável.'
        },
        {
          text: 'Yes, no problem, we will try.',
          isBest: false,
          feedback: 'Concordar sabendo que não vai entregar é perigoso no ambiente profissional internacional.'
        }
      ]
    }
  },
  {
    id: 'sit-3',
    category: 'Dining',
    title: 'Restaurante & Cafeteria: Pedidos e Problemas com Pratos',
    context: 'Você está almoçando ou jantando fora e seu prato veio frio, com ingrediente trocado ou você quer dividir a conta.',
    culturalTip: 'Nos EUA e Canadá, garçons dependem diretamente de gorjetas (tips) e são receptivos a resolver problemas rapidamente. Dizer "Excuse me, I hate to be a bother, but..." faz com que troquem seu prato na hora com um sorriso.',
    dos: [
      'Use "Could I get..." ou "I’ll have..." em vez de "Give me..."',
      'Ao pedir a conta: "Could we have the check, please?" ou "Can we split the bill?"',
      'Ao relatar um prato errado: "I think there might be a mix-up with this order."'
    ],
    donts: [
      'Nunca chame o garçom gritando "Waiter!" ou estalando os dedos (falta grave de etiqueta).',
      'Não diga "The food is terrible": prefira "I’m afraid this isn’t quite what I expected."'
    ],
    recommendedChunks: [
      {
        label: 'Fazer o pedido',
        starter: 'Could I get [dish/drink] with [request] on the side, please?',
        type: 'question',
        purpose: 'Pedido natural de restaurante'
      },
      {
        label: 'Avisar erro gentilmente',
        starter: 'Excuse me, I’m sorry to trouble you, but I think this is meant for another table.',
        type: 'response',
        purpose: 'Correção descontraída de prato trocado'
      },
      {
        label: 'Pedir a conta',
        starter: 'Whenever you have a moment, could we get the check?',
        type: 'question',
        purpose: 'Pedir a conta sem pressa agressiva'
      }
    ],
    sampleDialogue: {
      speakerA: 'Waiter: "How is everything tasting over here?"',
      textA: 'Waiter: "How is everything tasting over here?"',
      speakerB: 'You: "The salad is delicious, but I’m afraid the soup came out a bit cold. Would it be possible to have it warmed up?"',
      textB: 'You: "The salad is delicious, but I’m afraid the soup came out a bit cold. Would it be possible to have it warmed up?"'
    },
    practiceChallenge: {
      prompt: 'Você quer pedir um café sem açúcar e com leite vegetal. Qual chunk soa mais natural?',
      options: [
        {
          text: 'Could I get an iced latte with oat milk and no sugar, please?',
          isBest: true,
          feedback: 'Excelente! Fórmula clássica: "Could I get [item] with [customization], please?".'
        },
        {
          text: 'I want coffee, put oat milk, do not put sugar.',
          isBest: false,
          feedback: 'Muito fragmentado e soa como uma lista de ordens.'
        },
        {
          text: 'Make me an oat latte now.',
          isBest: false,
          feedback: 'Rude e desrespeitoso com o barista.'
        }
      ]
    }
  },
  {
    id: 'sit-4',
    category: 'Customer Support',
    title: 'Atendimento & Suporte: Resolver Cobranças Indevidas',
    context: 'Você nota uma cobrança duplicada no extrato ou uma compra online que não foi entregue.',
    culturalTip: 'No atendimento telefônico ou chat em inglês, agentes têm roteiros rígidos. Apresentar os dados de forma calma ("I have my reference number ready...") e declarar claramente o objetivo reduz o tempo de chamada pela metade.',
    dos: [
      'Apresente o objetivo na primeira frase: "I’m calling regarding an unexpected charge on my statement."',
      'Tenha o número de transação em mãos: "The transaction ID is [number]."',
      'Pergunte pelos prazos: "What is the typical turnaround time for this refund?"'
    ],
    donts: [
      'Evite xingar ou gritar com o atendente de primeiro nível (ele raramente tem poder de decisão direta se for hostilizado).',
      'Não desligue sem anotar o número de protocolo (ticket / case number).'
    ],
    recommendedChunks: [
      {
        label: 'Abertura de chamado',
        starter: 'I’m contacting you about an issue with order number [number].',
        type: 'response',
        purpose: 'Declaração clara do motivo de contato'
      },
      {
        label: 'Pedir esclarecimento',
        starter: 'Could you help me understand why this extra fee was applied?',
        type: 'question',
        purpose: 'Questionar taxa sem acusar de má-fé'
      },
      {
        label: 'Confirmação de prazo',
        starter: 'Just to confirm, should I expect the refund within [number] business days?',
        type: 'question',
        purpose: 'Alinhar expectativa de entrega'
      }
    ],
    sampleDialogue: {
      speakerA: 'Support: "Thanks for holding. How can I assist you today?"',
      textA: 'Support: "Thanks for holding. How can I assist you today?"',
      speakerB: 'You: "Hi, I noticed two identical charges on my card for order #4829. Could you help me check if it was processed twice?"',
      textB: 'You: "Hi, I noticed two identical charges on my card for order #4829. Could you help me check if it was processed twice?"'
    },
    practiceChallenge: {
      prompt: 'Como pedir educadamente o número de protocolo do atendimento antes de desligar?',
      options: [
        {
          text: 'Give me the protocol code.',
          isBest: false,
          feedback: 'Em inglês não se usa "protocol" para suporte ao cliente, e sim "ticket number" ou "case reference".'
        },
        {
          text: 'Could you give me the case reference number for my records, please?',
          isBest: true,
          feedback: 'Perfeito! "Case reference number for my records" é o padrão exato usado no mundo corporativo.'
        },
        {
          text: 'Write down what we talked about.',
          isBest: false,
          feedback: 'Vago e pouco profissional.'
        }
      ]
    }
  },
  {
    id: 'sit-5',
    category: 'Social & Networking',
    title: 'Small Talk & Networking: Conectar e Manter o Ritmo',
    context: 'No intervalo de uma palestra, café da empresa ou recepção de evento, você quer puxar conversa sem parecer forçado.',
    culturalTip: 'Em inglês, o segredo do "Small Talk" é o efeito ping-pong: responda brevemente compartilhando um detalhe e devolva a bola com uma pergunta aberta ("How about yourself?", "What brings you to this event?").',
    dos: [
      'Quebre o gelo com algo do ambiente compartilhado: "Quite a turnout today, isn’t it?"',
      'Demonstre escuta ativa com micro-chunks: "That’s fascinating!", "No way!", "I bet!"',
      'Finalize cordialmente: "It was great chatting with you, let’s stay in touch on LinkedIn."'
    ],
    donts: [
      'Não responda apenas "Yes" ou "No" (mata a conversa imediatamente).',
      'Evite temas espinhosos de início (salário exato, política partidária, religião).'
    ],
    recommendedChunks: [
      {
        label: 'Quebra-gelo em eventos',
        starter: 'What brought you to this conference today?',
        type: 'question',
        purpose: 'Início de conversa aberto e natural'
      },
      {
        label: 'Aprofundar interesse',
        starter: 'How long have you been working with [industry/company]?',
        type: 'question',
        purpose: 'Demonstrar interesse profissional genuíno'
      },
      {
        label: 'Saída elegante',
        starter: 'I don’t want to take up all your time, but it was really wonderful meeting you.',
        type: 'response',
        purpose: 'Despedida calorosa sem parecer evasiva'
      }
    ],
    sampleDialogue: {
      speakerA: 'Attendee: "That keynote was a bit technical, wasn’t it?"',
      textA: 'Attendee: "That keynote was a bit technical, wasn’t it?"',
      speakerB: 'You: "It definitely was! The machine learning slides were intense. Are you working in that field as well?"',
      textB: 'You: "It definitely was! The machine learning slides were intense. Are you working in that field as well?"'
    },
    practiceChallenge: {
      prompt: 'Alguém pergunta "How was your weekend?". Qual resposta mantém a conversa viva de forma agradável?',
      options: [
        {
          text: 'Good.',
          isBest: false,
          feedback: 'Resposta monossilábica que encerra qualquer possibilidade de conexão.'
        },
        {
          text: 'Pretty relaxing! I checked out a new coffee shop downtown. How about yours?',
          isBest: true,
          feedback: 'Sensacional! Dá um gancho interessante (coffee shop) e devolve a pergunta ("How about yours?").'
        },
        {
          text: 'I stayed home because I have no money.',
          isBest: false,
          feedback: 'Muito pesado e constrangedor para small talk casual com conhecidos.'
        }
      ]
    }
  },
  {
    id: 'sit-6',
    category: 'Written Comms',
    title: 'E-mails & Slack: Cobrança Suave e Anexos',
    context: 'Você precisa cobrar uma resposta de um cliente ou colega sem parecer impaciente, ou enviar um documento importante.',
    culturalTip: 'Em mensagens escritas em inglês, o uso de "Just following up..." ou "Just checking in..." suaviza cobranças de prazo. O advérbio "Just" diminui a pressão e acelera a resposta sem gerar atrito.',
    dos: [
      'Use o clássico de acompanhamento: "Just following up on my previous message regarding [topic]."',
      'Indique anexos com precisão: "Please find attached the updated report for your review."',
      'Encerre com disponibilidade: "Let me know if you have any questions or need further clarification."'
    ],
    donts: [
      'Não escreva apenas "Why haven’t you replied yet?" (muito agressivo).',
      'Evite escrever palavras inteiras em maiúsculas (ALL CAPS soa como grito).'
    ],
    recommendedChunks: [
      {
        label: 'Cobrança delicada',
        starter: 'Just wanted to check in and see if you had a chance to look at [document]?',
        type: 'question',
        purpose: 'Follow-up sem tom de cobrança pesada'
      },
      {
        label: 'Envio de material',
        starter: 'Please find attached [file/link] with the latest revisions.',
        type: 'response',
        purpose: 'Fórmula padrão de e-mail corporativo'
      },
      {
        label: 'Fechamento colaborativo',
        starter: 'Looking forward to hearing your thoughts whenever you have a moment.',
        type: 'response',
        purpose: 'Encerramento cordial com convite de feedback'
      }
    ],
    sampleDialogue: {
      speakerA: 'Subject: "Proposal Review - Quick follow-up"',
      textA: 'Subject: "Proposal Review - Quick follow-up"',
      speakerB: 'You: "Hi Mark, just following up on the proposal sent Tuesday. No rush at all, just making sure it didn’t get buried in your inbox. Thanks!"',
      textB: 'You: "Hi Mark, just following up on the proposal sent Tuesday. No rush at all, just making sure it didn’t get buried in your inbox. Thanks!"'
    },
    practiceChallenge: {
      prompt: 'Como cobrar uma resposta pendente sem soar impaciente por e-mail ou Slack?',
      options: [
        {
          text: 'Reply to me, deadline is approaching.',
          isBest: false,
          feedback: 'Muito autoritário e seco.'
        },
        {
          text: 'Just wanted to follow up on this to ensure we stay on schedule. Let me know if you need any input from my side!',
          isBest: true,
          feedback: 'Perfeito! Mostra proatividade, oferece ajuda e lembra o prazo de forma diplomática.'
        },
        {
          text: 'Did you forget to answer my email?',
          isBest: false,
          feedback: 'Acusatório e defensivo.'
        }
      ]
    }
  }
];

export const SITUATION_CATEGORIES = Array.from(
  new Set(SITUATION_GUIDES.map(s => s.category))
);
