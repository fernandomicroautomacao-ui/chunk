/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChunkMapData, SentenceStarter, SituationGuide } from '../types.ts';

export const ITALIAN_CHUNK_DATA: ChunkMapData = {
  lugar: {
    "aeroporto": ["Sto prendendo il volo per [luogo].", "Potrei avere [cosa]?"],
    "taxi": ["Mi potrebbe portare a [luogo]?", "Tenga pure il resto."],
    "ristorante": ["Prendo [piatto].", "Ci porta il conto, per favore?"],
    "strada": ["Come arrivo a [luogo]?", "È lontano da qui?"],
    "università": ["Potrebbe ripetere [cosa]?", "Potrei avere una proroga?"],
    "bar": ["Un caffè [tipo], per favore.", "Offro io questo giro."],
    "supermercato": ["Dove posso trovare [cosa]?", "È in offerta?"],
    "banca": ["Vorrei (prelevare | depositare) [importo].", "La mia carta non funziona."]
  },
  acontecimento: {
    "imprevisto": ["Il mio volo è stato (ritardato | cancellato).", "Ho finito per [verbo]."],
    "guasto": ["La [macchina] ha smesso di funzionare.", "Si è scoperto che [causa]."],
    "problema con cliente": ["L'ordine (è arrivato in ritardo | era sbagliato).", "Stiamo ancora aspettando [cosa]."],
    "fraintendimento": ["C'è stato un malinteso su [cosa].", "Pensavo intendessi [cosa]."],
    "notizia": ["Ho appena saputo che [fatto].", "Non me l'aspettavo proprio."],
    "viaggio o evento": ["Siamo andati a [luogo] per [motivo].", "La parte migliore è stata [cosa]."],
    "decisione": ["Ho deciso di [verbo] perché [causa].", "Finora, [risultato]."],
    "sorpresa": ["Non indovinerai mai cos'è successo.", "Che coincidenza!"]
  },
  pessoa: {
    "sconosciuto": ["Mi scusi,", "Scusi il disturbo, ma"],
    "operatore": ["Mi potrebbe aiutare a [verbo]?", "Avrei una domanda su [cosa]."],
    "collega": ["Hai un minuto?", "Mi daresti una mano con [cosa]?"] ,
    "capo": ["Volevo aggiornarla su [cosa].", "Le dispiacerebbe se [verbo]?"],
    "cliente": ["Grazie per la pazienza.", "Possiamo offrirle [cosa]."],
    "amico": ["Indovina un po'?", "Ti va di [verbo]?"]
  },
  canal: {
    "di persona": ["Piacere di conoscerti.", "Ti mostro subito."],
    "telefono": ["Chiamo a proposito di [argomento].", "Potrebbe attendere un attimo?"],
    "e-mail": ["Le scrivo per [verbo].", "In allegato trova [cosa]."],
    "WhatsApp": ["Un messaggio veloce riguardo a [cosa].", "A presto!"],
    "videochiamata": ["Mi sentite bene?", "Sei su muto."]
  },
  tom: {
    "educato": ["Le dispiacerebbe [verbo]?", "Le sarei grato se potesse [verbo]."],
    "urgente": ["È piuttosto urgente.", "Ho bisogno di [cosa] entro [scadenza]."],
    "frustrato": ["Temo ci sia un problema con [cosa].", "Non è quello che mi aspettavo."],
    "entusiasta": ["Sono davvero entusiasta di [cosa].", "È un'ottima notizia!"],
    "preoccupato": ["Sono un po' preoccupato per [cosa].", "Temo che [fatto]."]
  }
};

export const ITALIAN_STARTERS: SentenceStarter[] = [
  // --- ASKING STARTERS (DOMANDE) ---
  {
    id: 'it-q-1',
    type: 'question',
    intentTag: 'Richiesta di Informazioni',
    starter: 'Mi potrebbe spiegare meglio come funziona [argomento]?',
    situation: 'Richiedere chiarimenti dettagliati in un contesto formale o lavorativo',
    example: 'Mi potrebbe spiegare meglio come funziona la procedura di rimborso?'
  },
  {
    id: 'it-q-2',
    type: 'question',
    intentTag: 'Richiesta di Informazioni',
    starter: 'Saprebbe per caso dirmi dove si trova [luogo/oggetto]?',
    situation: 'Chiedere indicazioni per strada o in un edificio con garbo',
    example: 'Saprebbe per caso dirmi dove si trova la stazione ferroviaria?'
  },
  {
    id: 'it-q-3',
    type: 'question',
    intentTag: 'Cortesia & Favori',
    starter: 'Le dispiacerebbe [verbo all’infinito] [azione]?',
    situation: 'Richiesta formale e rispettosa rivolta a colleghi o superiori',
    example: 'Le dispiacerebbe dare un’occhiata a questa relazione?'
  },
  {
    id: 'it-q-4',
    type: 'question',
    intentTag: 'Cortesia & Favori',
    starter: 'Ti andrebbe di darmi una mano con [compito]?',
    situation: 'Chiedere un aiuto informale a un amico o collega vicino',
    example: 'Ti andrebbe di darmi una mano con la presentazione di domani?'
  },
  {
    id: 'it-q-5',
    type: 'question',
    intentTag: 'Chiarimento & Conferma',
    starter: 'Solo per essere sicuro di aver capito bene, intendi dire che [riassunto]?',
    situation: 'Riformulare le parole dell’interlocutore per confermare l’allineamento',
    example: 'Solo per essere sicuro di aver capito bene, intendi dire che rimandiamo il lancio?'
  },
  {
    id: 'it-q-6',
    type: 'question',
    intentTag: 'Chiarimento & Conferma',
    starter: 'Che cosa intende esattamente con l’espressione [termine]?',
    situation: 'Chiedere delucidazioni su una nozione tecnica o poco chiara',
    example: 'Che cosa intende esattamente con l’espressione "consegna graduale"?'
  },
  {
    id: 'it-q-7',
    type: 'question',
    intentTag: 'Opinione & Prospettiva',
    starter: 'Cosa ne pensi riguardo a [proposta/tema]?',
    situation: 'Invitare qualcuno a esprimere un parere sincero',
    example: 'Cosa ne pensi riguardo alla nuova strategia di marketing?'
  },
  {
    id: 'it-q-8',
    type: 'question',
    intentTag: 'Risoluzione Problemi & Ostacoli',
    starter: 'Quale sembra essere il problema principale con [sistema/attività]?',
    situation: 'Indagare su un malfunzionamento o intoppo tecnico',
    example: 'Quale sembra essere il problema principale con il server di posta?'
  },
  {
    id: 'it-q-9',
    type: 'question',
    intentTag: 'Avanzamento & Scadenze',
    starter: 'A che punto siamo con il progetto [nome progetto]?',
    situation: 'Verificare lo stato di avanzamento senza risultare assillante',
    example: 'A che punto siamo con il progetto di ristrutturazione del sito?'
  },
  {
    id: 'it-q-10',
    type: 'question',
    intentTag: 'Proposte Alternative',
    starter: 'E se invece provassimo a [alternativa]?',
    situation: 'Lanciare un’idea alternativa durante una discussione di gruppo',
    example: 'E se invece provassimo a fare una prova pilota la prossima settimana?'
  },

  // --- ANSWERING STARTERS (RISPOSTE) ---
  {
    id: 'it-r-1',
    type: 'response',
    intentTag: 'Accordo Diretto & Accettazione',
    starter: 'Mi sembra un’ottima idea perché [motivo].',
    situation: 'Approvare un’iniziativa aggiungendo una motivazione solida',
    example: 'Mi sembra un’ottima idea perché ci consentirà di risparmiare tempo prezioso.'
  },
  {
    id: 'it-r-2',
    type: 'response',
    intentTag: 'Accordo Diretto & Accettazione',
    starter: 'Certamente, me ne occupo subito io.',
    situation: 'Risposta pronta e professionale di presa in carico',
    example: 'Certamente, me ne occupo subito io e ti aggiorno nel pomeriggio.'
  },
  {
    id: 'it-r-3',
    type: 'response',
    intentTag: 'Rifiuto Cortese & Limiti',
    starter: 'Mi piacerebbe molto poterti aiutare, ma al momento sono sommerso da [priorità].',
    situation: 'Declinare gentilmente una richiesta senza chiudere i rapporti',
    example: 'Mi piacerebbe molto poterti aiutare, ma al momento sono sommerso dalla chiusura di bilancio.'
  },
  {
    id: 'it-r-4',
    type: 'response',
    intentTag: 'Rifiuto Cortese & Limiti',
    starter: 'Purtroppo non è fattibile al momento a causa di [vincolo].',
    situation: 'Spiegare l’impossibilità per motivi normativi, di budget o tecnici',
    example: 'Purtroppo non è fattibile al momento a causa di vincoli tecnici dell’infrastruttura.'
  },
  {
    id: 'it-r-5',
    type: 'response',
    intentTag: 'Prendere Tempo / Esitazione',
    starter: 'È un’ottima domanda, fammi controllare un attimo [dettaglio] prima di confermare.',
    situation: 'Prendere qualche istante per verificare i fatti con professionalità',
    example: 'È un’ottima domanda, fammi controllare un attimo i dati sul portale prima di confermare.'
  },
  {
    id: 'it-r-6',
    type: 'response',
    intentTag: 'Riformulazione & Chiarimento',
    starter: 'Quello che intendevo dire in realtà è che [chiarimento].',
    situation: 'Correggere un malinteso con serenità',
    example: 'Quello che intendevo dire in realtà è che la documentazione è pronta, ma mancano le firme.'
  },
  {
    id: 'it-r-7',
    type: 'response',
    intentTag: 'Proposta di Soluzione Alternativa',
    starter: 'Al posto di [opzione A], perché non consideriamo [opzione B]?',
    situation: 'Reindirizzare la discussione verso un’opzione più praticabile',
    example: 'Al posto di riscrivere il modulo, perché non consideriamo una patch temporanea?'
  },
  {
    id: 'it-r-8',
    type: 'response',
    intentTag: 'Incertezza & Prudenza',
    starter: 'Per quanto ne so io, [affermazione], anche se preferirei verificare con [persona].',
    situation: 'Fornire una prima informazione con la dovuta cautela',
    example: 'Per quanto ne so io, il cliente ha confermato la data, anche se preferirei verificare con Marco.'
  },
  {
    id: 'it-r-9',
    type: 'response',
    intentTag: 'Avanzamento & Risultati',
    starter: 'Finora tutto sta procedendo secondo la tabella di marcia riguardo a [attività].',
    situation: 'Tranquillizzare il team o il cliente sui progressi',
    example: 'Finora tutto sta procedendo secondo la tabella di marcia riguardo al rilascio dell’aggiornamento.'
  },
  {
    id: 'it-r-10',
    type: 'response',
    intentTag: 'Empatia & Rassicurazione',
    starter: 'Comprendo perfettamente il tuo disappunto riguardo a [situazione], troviamo una soluzione insieme.',
    situation: 'Disinnescare una tensione con empatia e spirito collaborativo',
    example: 'Comprendo perfettamente il tuo disappunto riguardo al ritardo della consegna, troviamo una soluzione insieme.'
  }
];

export const ITALIAN_SITUATIONS: SituationGuide[] = [
  {
    id: 'it-sit-1',
    category: 'Dining',
    title: 'Al Bar Italiano: Il Rito del Caffè & Al Banco vs Al Tavolo',
    context: 'In Italia entrare in un bar è un rito sociale con regole implicite: scontrino prima alla cassa, scelta tra consumazione al banco o al tavolo.',
    culturalTip: 'In Italia ordinare "un caffè" significa automaticamente un espresso corto e denso. Bere il cappuccino dopo le 11 del mattino o dopo pranzo è considerato insolito (il cappuccino è una bevanda strettamente legata alla colazione). Al banco il prezzo è spesso calmierato rispetto al servizio al tavolo.',
    dos: [
      'Ordina con naturalezza: "Un espresso al volo, per favore" o "Un macchiato caldo al banco."',
      'Fai lo scontrino prima alla cassa nelle grandi città o stazioni, poi mostralo al barista.',
      'Per l’acqua insieme al caffè: "Mi darebbe anche un bicchierino d’acqua, per favore?"'
    ],
    donts: [
      'Non chiedere "un caffè grande" (non esiste come concetto nei bar tradizionali, chiedi al massimo "un caffè americano" o "doppio").',
      'Non ordinare il cappuccino dopo un piatto di pasta se vuoi evitare sguardi perplessi del cameriere.'
    ],
    recommendedChunks: [
      {
        label: 'Ordinazione classica',
        starter: 'Un caffè [macchiato / ristretto / decaffeinato], per favore.',
        type: 'question',
        purpose: 'Ordinazione standard al banco'
      },
      {
        label: 'Chiedere il conto',
        starter: 'Quant’è per il caffè e la brioche?',
        type: 'question',
        purpose: 'Chiedere l’importo alla cassa'
      },
      {
        label: 'Offrire con garbo',
        starter: 'Lascia fare, offro io questo giro!',
        type: 'response',
        purpose: 'Espressione tipica di cortesia tra amici'
      }
    ],
    sampleDialogue: {
      speakerA: 'Barista: "Buongiorno! Cosa vi porto?"',
      textA: 'Barista: "Buongiorno! Cosa vi porto?"',
      speakerB: 'Tu: "Buongiorno! Un espresso e una pasta alla crema al banco, per favore."',
      textB: 'Tu: "Buongiorno! Un espresso e una pasta alla crema al banco, per favore."'
    },
    practiceChallenge: {
      prompt: 'Sei al banco di un bar a Roma e vuoi un espresso con una goccia di latte freddo. Qual è l’espressione corretta?',
      options: [
        {
          text: 'Voglio caffè con latte freddo dentro.',
          isBest: false,
          feedback: 'Molto macchinoso e sgrammaticato per un bar.'
        },
        {
          text: 'Un caffè macchiato freddo, per favore.',
          isBest: true,
          feedback: 'Perfetto! "Caffè macchiato freddo" è la formula naturale e universale in tutta Italia.'
        },
        {
          text: 'Dammi un espresso grande con latte.',
          isBest: false,
          feedback: 'Imperativo brusco ed espressione non comune in Italia.'
        }
      ]
    }
  },
  {
    id: 'it-sit-2',
    category: 'Workplace',
    title: 'Ambiente di Lavoro: Il "Lei" di Rispetto e le Riunioni',
    context: 'In Italia il passaggio dal "Lei" (formale) al "Tu" (informale) è cruciale nel mondo degli affari, banche ed enti pubblici.',
    culturalTip: 'Con clienti, fornitori esterni e superiori gerarchici si inizia sempre dando del "Lei" ("Potrebbe verificare...", "La ringrazio"). Si passa al "Tu" solo quando la persona più anziana o di grado superiore propone: "Diamoci pure del tu".',
    dos: [
      'Inizia formale se non conosci l’interlocutore: "Buongiorno Dottore / Ingegniere, Le scrivo per..."',
      'Accetta con piacere il passaggio all’informale: "Volentieri, con piacere!"',
      'Nelle e-mail formali usa formule di chiusura consolidate: "Cordiali saluti" o "Resto a Sua completa disposizione."'
    ],
    donts: [
      'Non dare del "tu" di default al capo o a un cliente al primo incontro.',
      'Non usare abbreviazioni stile chat (tipo "cmq", "k") nelle comunicazioni professionali formali.'
    ],
    recommendedChunks: [
      {
        label: 'Apertura formale',
        starter: 'Le rubo soltanto due minuti per aggiornarLa su [progetto].',
        type: 'response',
        purpose: 'Introduzione formale e rispettosa del tempo altrui'
      },
      {
        label: 'Richiesta di revisione',
        starter: 'Le andrebbe di dare una rapida occhiata a questa bozza prima dell’invio?',
        type: 'question',
        purpose: 'Coinvolgere il referente con discrezione'
      },
      {
        label: 'Disponibilità a chiarimenti',
        starter: 'Resto a Sua disposizione per qualsiasi eventuale chiarimento.',
        type: 'response',
        purpose: 'Chiusura formale ineccepibile per e-mail'
      }
    ],
    sampleDialogue: {
      speakerA: 'Cliente: "Buongiorno, abbiamo ricevuto la Vostra proposta commerciale."',
      textA: 'Cliente: "Buongiorno, abbiamo ricevuto la Vostra proposta commerciale."',
      speakerB: 'Tu: "Buongiorno! La ringrazio per il riscontro. Ha avuto modo di visionare i dettagli sul cronoprogramma?"',
      textB: 'Tu: "Buongiorno! La ringrazio per il riscontro. Ha avuto modo di visionare i dettagli sul cronoprogramma?"'
    },
    practiceChallenge: {
      prompt: 'Devi chiedere a un nuovo cliente importante di inviarti un documento contabile. Come ti esprimi al meglio?',
      options: [
        {
          text: 'Inviami subito il documento che mi serve.',
          isBest: false,
          feedback: 'Usa il "tu" ed è un ordine secco, inadatto nei rapporti commerciali italiani.'
        },
        {
          text: 'Quando Le è possibile, Le chiederei cortesemente di trasmetterci il documento in allegato.',
          isBest: true,
          feedback: 'Impeccabile! Forma di cortesia col "Lei", condizionale di rispetto e massima professionalità.'
        },
        {
          text: 'Perché non mi hai mandato il file?',
          isBest: false,
          feedback: 'Accusatorio, sgarbato e privo di formalità.'
        }
      ]
    }
  },
  {
    id: 'it-sit-3',
    category: 'Travel',
    title: 'Stazione & Treni: Biglietti, Convalida e Coincidenze',
    context: 'Viaggiare in treno in Italia con Trenitalia o Italo richiede attenzione a binari (spesso modificati all’ultimo) e convalida dei biglietti regionali.',
    culturalTip: 'I biglietti cartacei regionali vanno sempre "obliterati" (timbrati) nelle macchinette gialle/verdi prima di salire a bordo, pena salate multe da parte del capotreno! I biglietti digitali (Frecciarossa/Italo con posto prenotato) necessitano solo del codice PNR.',
    dos: [
      'Chiedi conferma del binario al personale: "Mi scusi, è questo il binario per il treno diretto a Firenze?"',
      'Chiedi al capotreno in caso di ritardo: "Riuscirò a prendere la coincidenza a Bologna con questo ritardo?"',
      'Ringrazia sempre: "Grazie mille per l’informazione."'
    ],
    donts: [
      'Non salire sui treni regionali con biglietto cartaceo senza averlo timbrato.',
      'Non aspettare l’ultimo secondo per raggiungere il binario nelle grandi stazioni (Milano Centrale o Roma Termini richiedono diversi minuti a piedi).'
    ],
    recommendedChunks: [
      {
        label: 'Verifica binario',
        starter: 'Mi scusi, sa da quale binario parte il treno per [città]?',
        type: 'question',
        purpose: 'Chiedere informazioni sul binario corretto'
      },
      {
        label: 'Coincidenza a rischio',
        starter: 'Ho una coincidenza a [stazione], secondo Lei ce la faccio con [minuti] minuti di ritardo?',
        type: 'question',
        purpose: 'Verifica fattibilità cambio treno'
      },
      {
        label: 'Acquisto biglietto',
        starter: 'Vorrei un biglietto di andata e ritorno per [città] in seconda classe.',
        type: 'response',
        purpose: 'Acquisto chiaro in biglietteria'
      }
    ],
    sampleDialogue: {
      speakerA: 'Annuncio: "Attenzione, il treno regionale per Venezia partirà dal binario 8 anziché dal binario 4."',
      textA: 'Annuncio: "Attenzione, il treno regionale per Venezia partirà dal binario 8 anziché dal binario 4."',
      speakerB: 'Tu (al personale): "Mi scusi, conferma che il regionale per Venezia è stato spostato al binario 8?"',
      textB: 'Tu (al personale): "Mi scusi, conferma che il regionale per Venezia è stato spostato al binario 8?"'
    },
    practiceChallenge: {
      prompt: 'Sei sul treno e il tuo posto prenotato è occupato da un altro passeggero. Come chiedi gentilmente di liberarlo?',
      options: [
        {
          text: 'Alzati, questo è il mio posto!',
          isBest: false,
          feedback: 'Molto aggressivo e suscettibile di provocare una lite.'
        },
        {
          text: 'Mi scusi, credo che questo sia il posto 42 carrozza 5 indicato sul mio biglietto. Potremmo controllare insieme?',
          isBest: true,
          feedback: 'Ottimo! Cortese, preciso, fa riferimento al biglietto ed evita accuse sgarbate.'
        },
        {
          text: 'Non sai leggere i numeri dei sedili?',
          isBest: false,
          feedback: 'Offensivo e sconsigliatissimo.'
        }
      ]
    }
  }
];
