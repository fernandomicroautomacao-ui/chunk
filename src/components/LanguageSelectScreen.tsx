/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight, Check, Compass, Network, MessageSquare, X } from 'lucide-react';
import { StudyLanguage } from '../types.ts';

interface LanguageSelectScreenProps {
  currentLanguage: StudyLanguage;
  onSelectLanguage: (lang: StudyLanguage) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function LanguageSelectScreen({
  currentLanguage,
  onSelectLanguage,
  onClose,
  isModal = false
}: LanguageSelectScreenProps) {
  return (
    <div className={`${isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm' : 'flex-1 flex flex-col justify-center items-center p-4 md:p-8 bg-[var(--bg)] text-[var(--ink)] overflow-y-auto'}`}>
      <div className={`w-full max-w-4xl bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 md:p-8 shadow-lg flex flex-col gap-6 relative`}>

        {/* Close button if in modal mode */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--line)]/20 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c1)] px-3 py-1 rounded-full bg-[var(--c1)]/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Treinamento de Fluência por Chunks</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Escolha o Idioma de Estudo
          </h2>
          <p className="text-xs md:text-sm text-[var(--mute)] leading-relaxed">
            Selecione qual idioma você deseja praticar hoje. Todo o grafo interativo de nós, inícios de perguntas e respostas e dicas situacionais se adaptarão ao idioma escolhido.
          </p>
        </div>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">

          {/* Card: Inglês */}
          <div
            onClick={() => onSelectLanguage('en')}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all flex flex-col justify-between gap-4 relative group hover:shadow-md ${
              currentLanguage === 'en'
                ? 'border-[var(--c2)] bg-[var(--c2)]/5 shadow-xs'
                : 'border-[var(--line)] bg-[var(--bg)]/30 hover:border-[var(--c2)]/60'
            }`}
          >
            {currentLanguage === 'en' && (
              <span className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold text-[var(--c2)] bg-[var(--panel)] border border-[var(--c2)]/30 px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Ativo
              </span>
            )}

            <div className="flex flex-col gap-3">
              {/* Flag & Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-3xl shadow-2xs shrink-0 select-none">
                  🇬🇧
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                    <span>Inglês</span>
                    <span className="text-xs font-normal text-[var(--mute)]">(English)</span>
                  </h3>
                  <p className="text-xs text-[var(--mute)] mt-0.5">
                    Conversação cotidiana, negócios e viagens internacionais.
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]/50 text-xs text-[var(--ink)]/90">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-[var(--c1)] shrink-0" />
                  <span>Grafo com 40+ chunks em 5 dimensões contextuais</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--c2)] shrink-0" />
                  <span>Inícios de perguntas e respostas com tags de intenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[var(--c3)] shrink-0" />
                  <span>Cenários reais: Aeroportos, Reuniões e E-mails</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                currentLanguage === 'en'
                  ? 'bg-[var(--c2)] text-white hover:opacity-90'
                  : 'bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] group-hover:border-[var(--c2)] group-hover:text-[var(--c2)]'
              }`}
            >
              <span>{currentLanguage === 'en' ? 'Continuar em Inglês' : 'Estudar Inglês'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card: Italiano */}
          <div
            onClick={() => onSelectLanguage('it')}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all flex flex-col justify-between gap-4 relative group hover:shadow-md ${
              currentLanguage === 'it'
                ? 'border-[var(--c3)] bg-[var(--c3)]/5 shadow-xs'
                : 'border-[var(--line)] bg-[var(--bg)]/30 hover:border-[var(--c3)]/60'
            }`}
          >
            {currentLanguage === 'it' && (
              <span className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold text-[var(--c3)] bg-[var(--panel)] border border-[var(--c3)]/30 px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Attivo
              </span>
            )}

            <div className="flex flex-col gap-3">
              {/* Flag & Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-3xl shadow-2xs shrink-0 select-none">
                  🇮🇹
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                    <span>Italiano</span>
                    <span className="text-xs font-normal text-[var(--mute)]">(Italian)</span>
                  </h3>
                  <p className="text-xs text-[var(--mute)] mt-0.5">
                    Conversazione naturale, il rito del caffè e il &ldquo;Lei&rdquo; formale.
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]/50 text-xs text-[var(--ink)]/90">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-[var(--c1)] shrink-0" />
                  <span>Grafo di chunk nativi: Luogo, Accadimento, Persona, Canale, Tono</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--c0)] shrink-0" />
                  <span>Inizi di frasi per chiedere e rispondere con tag di intenzione</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[var(--c3)] shrink-0" />
                  <span>Guide situazionali: Al bar, Treni & stazioni, Ufficio formale</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectLanguage('it')}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                currentLanguage === 'it'
                  ? 'bg-[var(--c3)] text-white hover:opacity-90'
                  : 'bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] group-hover:border-[var(--c3)] group-hover:text-[var(--c3)]'
              }`}
            >
              <span>{currentLanguage === 'it' ? 'Continua in Italiano' : 'Studia Italiano'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-[var(--mute)] pt-2 border-t border-[var(--line)]/40 flex items-center justify-center gap-2">
          <span>Você pode alternar de idioma a qualquer momento pelo botão de bandeira no topo.</span>
        </div>

      </div>
    </div>
  );
}
