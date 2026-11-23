/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SentenceStarter, StudyLanguage } from '../types.ts';
import { getConnectorsForLanguage } from '../data/connectorsData.ts';

export function exportStartersToAnki(
  starters: SentenceStarter[],
  language: StudyLanguage
): void {
  const langTitle = language === 'it' ? 'Italiano' : 'English';
  const fileName = `chunks_anki_${language}_${Date.now()}.txt`;

  // Anki tab-delimited deck with metadata
  let content = `#separator:tab\n#html:true\n#tags column:3\n`;

  starters.forEach(item => {
    const front = `<b>[${item.type === 'question' ? 'Pergunta / Asking' : 'Resposta / Answering'}]</b><br/>${escapeForAnki(item.situation)}<br/><br/><i>Qual chunk usar?</i>`;
    const back = `<span style="font-size: 1.2em; color: #6d28d9;"><b>${escapeForAnki(item.starter)}</b></span><br/><br/><b>Exemplo:</b> "${escapeForAnki(item.example)}"`;
    const tag = `Chunks::${item.intentTag.replace(/\s+/g, '_')} Language::${langTitle}`;

    content += `${front}\t${back}\t${tag}\n`;
  });

  // Also include connectors for rich deck!
  const connectors = getConnectorsForLanguage(language);
  connectors.forEach(c => {
    const front = `<b>[Conector de Fala]</b><br/>${escapeForAnki(c.purpose)}<br/>(<i>${escapeForAnki(c.translation)}</i>)`;
    const back = `<span style="font-size: 1.2em; color: #0e7490;"><b>${escapeForAnki(c.phrase)}</b></span><br/><br/><b>Exemplo:</b> "${escapeForAnki(c.example)}"`;
    const tag = `Chunks::Conectores Language::${langTitle}`;

    content += `${front}\t${back}\t${tag}\n`;
  });

  downloadFile(fileName, content, 'text/plain;charset=utf-8');
}

function escapeForAnki(text: string): string {
  return text.replace(/\t/g, ' ').replace(/\n/g, '<br/>');
}

function downloadFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
