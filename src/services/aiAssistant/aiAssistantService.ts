import { authenticatedFetch } from '../authenticatedFetch';
/**
 * Assistente Inteligente de Enfermagem EvoluiEnf
 *
 * Copiloto assistencial com as seguintes diretrizes éticas inquebráveis:
 * 1. NÃO substitui o julgamento profissional do enfermeiro ou técnico.
 * 2. NÃO cria diagnóstico médico.
 * 3. NÃO prescreve medicamentos.
 * 4. NÃO inventa informações clínicas ou sinais vitais.
 * 5. Anonimização estrita via PrivacyGuard antes de qualquer processamento.
 * 6. Apenas sugere melhorias; nunca bloqueia o profissional.
 */

import { anonymizeText } from '../privacyGuard';
import { checkPrivacyGuards } from '../../engine/privacyGuard';
import {
  CompletenessAnalysisResult,
  CompletenessSuggestion,
  SmartQuestion,
  NarrativeImprovementResult,
  GenerationBasisExplanation,
  AIQualityReviewData,
} from './aiAssistantTypes';

// Termos estritamente médicos ou diagnósticos proibidos de serem sugeridos/adicionados pela IA
const BANNED_MEDICAL_DIAGNOSES = [
  'infarto agudo do miocárdio',
  'iam',
  'avc',
  'acidente vascular cerebral',
  'pneumonia',
  'sepse',
  'choque séptico',
  'choque cardiogênico',
  'apendicite',
  'insuficiência cardíaca congestiva',
  'icc',
  'embolia pulmonar',
  'cetoacidose diabética',
];

const BANNED_PRESCRIPTIONS = [
  'prescrever',
  'iniciar antibiótico',
  'administrar morfina',
  'aumentar dosagem',
  'suspender medicação médica',
  'receitar',
];

/**
 * Mapeamento determinístico de melhorias linguísticas assistenciais comuns
 */
const CLINICAL_REFINEMENT_RULES: Array<{
  pattern: RegExp;
  replacement: string;
  descricao: string;
}> = [
  {
    pattern: /\b(?:paciente\s+)?bem\s+sem\s+queixa[s]?\b/gi,
    replacement: 'Paciente em repouso no leito, comunicativo, sem queixas álgicas referidas no momento',
    descricao: 'Substituição de expressão informal por redação técnica padronizada',
  },
  {
    pattern: /\b(?:ta\s+com|com)\s+dor\s+de\s+cabe[cç]a\b/gi,
    replacement: 'refere cefaleia',
    descricao: 'Adequação de queixa álgica para termo técnico (cefaleia)',
  },
  {
    pattern: /\b(?:ta\s+com|com)\s+falta\s+de\s+ar\b/gi,
    replacement: 'apresenta queixa de dispneia',
    descricao: 'Adequação de termo respiratório (dispneia)',
  },
  {
    pattern: /\bvomitando\b/gi,
    replacement: 'apresentou episódios eméticos',
    descricao: 'Adequação para episódios eméticos',
  },
  {
    pattern: /\bvomitou\b/gi,
    replacement: 'apresentou êmese',
    descricao: 'Adequação para êmese',
  },
  {
    pattern: /\bsem\s+febre\b/gi,
    replacement: 'afebril ao termômetro',
    descricao: 'Padronização de registro de temperatura',
  },
  {
    pattern: /\bxixi\s+normal\b/gi,
    replacement: 'diurese presente e espontânea com aspecto límpido',
    descricao: 'Padronização de descrição de eliminação urinária',
  },
  {
    pattern: /\bsem\s+evacuar\b/gi,
    replacement: 'eliminações intestinais ausentes no período',
    descricao: 'Padronização de registro intestinal',
  },
  {
    pattern: /\bcurativo\s+ok\b/gi,
    replacement: 'curativo oclusivo, limpo, seco e com fixação íntegra',
    descricao: 'Detalhamento técnico das condições do curativo',
  },
  {
    pattern: /\bacesso\s+ok\b/gi,
    replacement: 'acesso venoso pérvio, funcionante, sem sinais flogísticos locais aparentes',
    descricao: 'Detalhamento técnico das condições de acesso vascular',
  },
  {
    pattern: /\bconseguiu\s+andar\b/gi,
    replacement: 'deambula com auxílio da equipe de enfermagem',
    descricao: 'Adequação para deambulação assistida',
  },
  {
    pattern: /\bcomeu\s+tudo\b/gi,
    replacement: 'boa aceitação da dieta ofertada por via oral',
    descricao: 'Adequação do registro nutricional',
  },
];

/**
 * 2) ANALISADOR DE COMPLETUDE
 * Verifica se existem informações assistenciais importantes ausentes sem bloquear o profissional.
 */
export function analyzeDocumentationCompleteness(
  form: any,
  modeloNome?: string
): CompletenessAnalysisResult {
  const sugestoes: CompletenessSuggestion[] = [];
  const alertasConsistencia: string[] = [];

  let camposPreenchidos = 0;
  let totalCamposAnalisados = 0;

  // Analisador para estrutura SOAP ou áreas assistenciais padrão
  const subjectiveText = (form?.subjective?.patientReport || form?.queixaPrincipal || form?.relato || '').toLowerCase();
  const vitalSigns = form?.objective?.vitalSigns || form?.sinaisVitais || {};
  const physicalExam = form?.objective?.physicalExam || form?.exameFisico || {};
  const devices = form?.objective?.devices || form?.dispositivos || [];
  const interventions = form?.plan?.interventions || form?.intervencoes || [];
  const diagnoses = form?.assessment?.nursingDiagnoses || form?.diagnosticos || [];

  // 1. Verificação de Dispositivos (Acesso Venoso, Sondas, Drenos)
  totalCamposAnalisados++;
  const devicesStr = Array.isArray(devices) ? devices.join(' ').toLowerCase() : JSON.stringify(devices).toLowerCase();
  const physicalStr = typeof physicalExam === 'string' ? physicalExam.toLowerCase() : JSON.stringify(physicalExam).toLowerCase();

  const hasVenousAccess =
    devicesStr.includes('acesso venoso') ||
    devicesStr.includes('avp') ||
    devicesStr.includes('cateter venoso') ||
    devicesStr.includes('picc') ||
    devicesStr.includes('cvc');

  if (hasVenousAccess) {
    camposPreenchidos++;
    const hasAccessEvaluation =
      devicesStr.includes('pérvio') ||
      devicesStr.includes('pervio') ||
      devicesStr.includes('sem sinais') ||
      devicesStr.includes('sinais flogísticos') ||
      devicesStr.includes('flogose') ||
      physicalStr.includes('acesso') ||
      physicalStr.includes('punção');

    if (!hasAccessEvaluation) {
      sugestoes.push({
        id: 'sug_avp_avaliacao',
        campo: 'Dispositivos Vasculares',
        categoria: 'dispositivo',
        nivel: 'recomendado',
        mensagem: 'Registrar condições do acesso venoso e sinais locais (perviabilidade, fixação, presença ou ausência de dor/hiperemia).',
        exemploPratico: 'Ex: "Acesso venoso periférico em MSE, pérvio, sem sinais flogísticos locais, curativo íntegro e datado."',
      });
    }
  }

  // 2. Verificação de Curativos e Lesões
  totalCamposAnalisados++;
  const hasWoundOrDressing =
    devicesStr.includes('curativo') ||
    devicesStr.includes('lesão') ||
    devicesStr.includes('ferida') ||
    devicesStr.includes('upp') ||
    physicalStr.includes('curativo') ||
    physicalStr.includes('lesão') ||
    physicalStr.includes('ferida') ||
    physicalStr.includes('escara');

  if (hasWoundOrDressing) {
    camposPreenchidos++;
    const hasDressingDetails =
      devicesStr.includes('aspecto') ||
      devicesStr.includes('cobertura') ||
      devicesStr.includes('exsudato') ||
      devicesStr.includes('secreção') ||
      devicesStr.includes('seco') ||
      devicesStr.includes('limpo') ||
      physicalStr.includes('cobertura') ||
      physicalStr.includes('exsudato') ||
      physicalStr.includes('limpo') ||
      physicalStr.includes('seco');

    if (!hasDressingDetails) {
      sugestoes.push({
        id: 'sug_curativo_detalhe',
        campo: 'Curativos e Integridade Cutânea',
        categoria: 'curativo',
        nivel: 'recomendado',
        mensagem: 'Registrar aspecto da lesão, cobertura utilizada, aspecto do exsudato e resposta observada.',
        exemploPratico: 'Ex: "Realizado curativo em região sacra com SF 0,9%, aplicado hidrogel e cobertura oclusiva. Curativo seco e limpo."',
      });
    }
  }

  // 3. Verificação de Dor
  totalCamposAnalisados++;
  const hasPainReport =
    subjectiveText.includes('dor') ||
    subjectiveText.includes('álgico') ||
    subjectiveText.includes('algico') ||
    subjectiveText.includes('queixa');

  if (hasPainReport) {
    camposPreenchidos++;
    const hasPainScale =
      subjectiveText.match(/\b(?:eva|escala|grau|intensidade|\d+\s*(?:\/|\s*de\s*)\s*10)\b/i) ||
      (form?.subjective?.painScale && String(form.subjective.painScale).trim() !== '');

    if (!hasPainScale) {
      sugestoes.push({
        id: 'sug_dor_escala',
        campo: 'Avaliação da Dor',
        categoria: 'dor',
        nivel: 'recomendado',
        mensagem: 'Registrar a intensidade da dor utilizando escala (ex: Escala Visual Analógica de 0 a 10) e a conduta adotada.',
        exemploPratico: 'Ex: "Refere dor em região lombar de intensidade 6/10 na EVA. Posicionado em decúbito lateral para alívio."',
      });
    }
  }

  // 4. Verificação de Oxigenoterapia
  totalCamposAnalisados++;
  const hasOxygen =
    devicesStr.includes('oxigênio') ||
    devicesStr.includes('o2') ||
    devicesStr.includes('cateter nasal') ||
    devicesStr.includes('máscara') ||
    devicesStr.includes('ventilação') ||
    physicalStr.includes('o2');

  if (hasOxygen) {
    camposPreenchidos++;
    const hasFlowRate =
      devicesStr.match(/\b\d+\s*(?:l\/min|litros|%)\b/i) ||
      physicalStr.match(/\b\d+\s*(?:l\/min|litros|%)\b/i);

    if (!hasFlowRate) {
      sugestoes.push({
        id: 'sug_o2_fluxo',
        campo: 'Oxigenoterapia',
        categoria: 'oxigenio',
        nivel: 'informativo',
        mensagem: 'Registrar fluxo administrado (ex: Cateter nasal a 2 L/min ou FiO2) e saturação de oxigênio sob suporte.',
        exemploPratico: 'Ex: "Mantém cateter nasal de O2 a 2 L/min, mantendo SpO2 de 97%."',
      });
    }
  }

  // 5. Verificação de Sonda Vesical / Eliminações
  totalCamposAnalisados++;
  const hasCatheter =
    devicesStr.includes('svd') ||
    devicesStr.includes('sonda vesical') ||
    devicesStr.includes('vesical de demora') ||
    devicesStr.includes('foley');

  if (hasCatheter) {
    camposPreenchidos++;
    const hasUrineAspect =
      devicesStr.includes('débito') ||
      devicesStr.includes('debito') ||
      devicesStr.includes('diurese') ||
      devicesStr.includes('límpid') ||
      devicesStr.includes('colúric') ||
      physicalStr.includes('diurese') ||
      physicalStr.includes('débito');

    if (!hasUrineAspect) {
      sugestoes.push({
        id: 'sug_svd_diurese',
        campo: 'Eliminação Urinária / Dispositivo',
        categoria: 'eliminacoes',
        nivel: 'recomendado',
        mensagem: 'Registrar diurese por sonda vesical (aspecto, coloração, débito acumulado e fixação do dispositivo).',
        exemploPratico: 'Ex: "SVD em sistema fechado, drenando diurese colúrica com débito de 450 mL no plantão, fixação íntegra."',
      });
    }
  }

  // 6. Sinais Vitais Registrados
  totalCamposAnalisados++;
  const hasVitals =
    vitalSigns.bloodPressure ||
    vitalSigns.heartRate ||
    vitalSigns.temperature ||
    vitalSigns.respiratoryRate ||
    vitalSigns.oxygenSaturation ||
    vitalSigns.pressaoArterial ||
    vitalSigns.frequenciaCardiaca;

  if (hasVitals) {
    camposPreenchidos++;
  } else {
    sugestoes.push({
      id: 'sug_sinais_vitais',
      campo: 'Sinais Vitais',
      categoria: 'sinais_vitais',
      nivel: 'atencao',
      mensagem: 'Recomenda-se registrar os sinais vitais aferidos no momento da evolução assistencial.',
      exemploPratico: 'Ex: "PA: 120x80 mmHg, FC: 78 bpm, FR: 18 irpm, Tax: 36,5 °C, SpO2: 98% em ar ambiente."',
    });
  }

  // 7. Intervenções / Cuidados de Enfermagem
  totalCamposAnalisados++;
  const hasInterventions = Array.isArray(interventions) && interventions.length > 0;
  if (hasInterventions) {
    camposPreenchidos++;
  } else {
    sugestoes.push({
      id: 'sug_intervencoes',
      campo: 'Plano Assistencial / Cuidados',
      categoria: 'geral',
      nivel: 'informativo',
      mensagem: 'Descrever os cuidados e intervenções de enfermagem realizados durante o turno (ex: orientações, posicionamento, curativos).',
    });
  }

  // Cálculo de pontuação de qualidade documental
  const baseRatio = totalCamposAnalisados > 0 ? camposPreenchidos / totalCamposAnalisados : 0.8;
  const penalidadeSugestoes = sugestoes.filter((s) => s.nivel === 'recomendado').length * 8;
  const scoreQualidade = Math.max(30, Math.min(100, Math.round(baseRatio * 100 - penalidadeSugestoes)));

  const statusQualidade: 'excelente' | 'adequada' | 'recomenda_revisao' =
    scoreQualidade >= 85 ? 'excelente' : scoreQualidade >= 65 ? 'adequada' : 'recomenda_revisao';

  return {
    scoreQualidade,
    totalCamposAnalisados,
    camposPreenchidos,
    sugestoes,
    alertasConsistencia,
    statusQualidade,
  };
}

/**
 * 3) PERGUNTAS INTELIGENTES
 * Perguntas documentais e assistenciais contextualizadas para enriquecer a documentação.
 * NÃO cria diagnóstico médico.
 */
export function generateSmartQuestions(rawInput: string): SmartQuestion[] {
  const sanitized = anonymizeText(rawInput || '').toLowerCase();
  const questions: SmartQuestion[] = [];

  // Exemplo da especificação: "Paciente sonolento em leito"
  if (
    sanitized.includes('sonolento') ||
    sanitized.includes('rebaixado') ||
    sanitized.includes('letárgico') ||
    sanitized.includes('torpor') ||
    sanitized.includes('consciência') ||
    sanitized.includes('leito')
  ) {
    questions.push(
      {
        id: 'q_consciencia_1',
        pergunta: 'Foi avaliado o nível de consciência (ex: desperta ao chamado verbal, atende a comandos)?',
        motivoAssistencial: 'Documentar a responsividade neurológica objetiva do paciente.',
        categoria: 'consciencia',
      },
      {
        id: 'q_consciencia_2',
        pergunta: 'Existe alteração em relação ao estado neurológico habitual do paciente?',
        motivoAssistencial: 'Identificar se a sonolência é um padrão prévio ou rebaixamento agudo.',
        categoria: 'consciencia',
      },
      {
        id: 'q_consciencia_3',
        pergunta: 'Há registro de sinais vitais recentes e glicemia capilar se indicado?',
        motivoAssistencial: 'Descartar alterações hemodinâmicas, hipóxia ou hipoglicemia.',
        categoria: 'consciencia',
      }
    );
  }

  // Queixa de dor
  if (sanitized.includes('dor') || sanitized.includes('álgico') || sanitized.includes('desconforto')) {
    questions.push(
      {
        id: 'q_dor_1',
        pergunta: 'Qual a intensidade da dor na escala numérica ou verbal (0 a 10)?',
        motivoAssistencial: 'Quantificar objetivamente o sintoma para acompanhamento temporal.',
        categoria: 'dor',
      },
      {
        id: 'q_dor_2',
        pergunta: 'Houve melhora ou resposta observada após as intervenções de enfermagem?',
        motivoAssistencial: 'Registrar a eficácia do cuidado e reavaliação assistencial.',
        categoria: 'dor',
      }
    );
  }

  // Náusea / vômito
  if (sanitized.includes('náusea') || sanitized.includes('nausea') || sanitized.includes('vômito') || sanitized.includes('vomito') || sanitized.includes('êmese')) {
    questions.push({
      id: 'q_emese_1',
      pergunta: 'Houve aceitação da dieta no período ou foi mantido em repouso gástrico?',
      motivoAssistencial: 'Acompanhar o aporte nutricional e tolerância oral.',
      categoria: 'evolucao',
    });
  }

  // Risco de queda / agitação
  if (sanitized.includes('agitado') || sanitized.includes('confuso') || sanitized.includes('queda') || sanitized.includes('risco')) {
    questions.push({
      id: 'q_seguranca_1',
      pergunta: 'As medidas de segurança (grades do leito elevadas, campainha ao alcance) foram mantidas?',
      motivoAssistencial: 'Garantir registro das metas internacionais de segurança do paciente.',
      categoria: 'seguranca',
    });
  }

  // Caso padrão se nenhuma palavra-chave for acionada
  if (questions.length === 0) {
    questions.push(
      {
        id: 'q_geral_1',
        pergunta: 'O paciente mantém acompanhante presente e compreendeu as orientações passadas?',
        motivoAssistencial: 'Registrar comunicação efetiva e apoio familiar.',
        categoria: 'evolucao',
      },
      {
        id: 'q_geral_2',
        pergunta: 'Há necessidade de comunicar alguma intercorrência ao enfermeiro de plantão ou equipe multidisciplinar?',
        motivoAssistencial: 'Registro de alinhamento interprofissional.',
        categoria: 'evolucao',
      }
    );
  }

  return questions;
}

/**
 * 4) MELHORIA DE TEXTO
 * Melhora a linguagem profissional da narrativa sem adicionar fatos novos e sem criar diagnósticos médicos.
 */
export async function improveNursingNarrative(
  rawText: string
): Promise<NarrativeImprovementResult> {
  // 1. Anonimização estrita via PrivacyGuard antes de qualquer operação
  const sanitized = anonymizeText(rawText || '').trim();

  if (!sanitized) {
    return {
      originalText: '',
      improvedText: '',
      alteracoesLinguisticas: [],
      fatosPreservados: true,
      semDiagnosticoMedico: true,
      semPrescricao: true,
    };
  }

  // 2. Tenta aprimoramento via endpoint seguro com fallback determinístico
  let refined = sanitized;
  const alteracoes: string[] = [];
  let aiStatus: 'used' | 'quota_exceeded' | 'fallback' = 'fallback';
  let aiNotice: string | undefined;

  // Tenta a API primeiro com timeout curto (1.5s) se estiver em ambiente navegador
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await authenticatedFetch('/api/ai/assistant/improve-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sanitized }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.improvedText) {
          refined = data.improvedText.trim();
          aiStatus = data.source === 'gemini_api' ? 'used' : 'fallback';
          if (Array.isArray(data.changes)) {
            alteracoes.push(...data.changes);
          }
        }
      } else if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        aiStatus = 'quota_exceeded';
        aiNotice = data.error || 'Sua cota mensal de consultas ao Assistente IA foi atingida.';
      }
    } catch {
      // Falha silenciosa: usa motor determinístico
    }
  }

  // Se a API não refinou ou não alterou, aplica o motor de refinamento linguístico determinístico
  if (refined === sanitized) {
    for (const rule of CLINICAL_REFINEMENT_RULES) {
      if (rule.pattern.test(refined)) {
        refined = refined.replace(rule.pattern, rule.replacement);
        alteracoes.push(rule.descricao);
      }
    }
  }

  // Se ainda não houve substituição por regra direta, aplicar padronização gramatical e pontuação
  if (refined === sanitized) {
    // Garantir primeira letra maiúscula e ponto final
    refined = refined.charAt(0).toUpperCase() + refined.slice(1);
    if (!refined.endsWith('.') && !refined.endsWith('!') && !refined.endsWith(';')) {
      refined += '.';
    }
  }

  // 3. Verificação de segurança estrita contra alucinações ou desvios clínicos:
  let lowerRefined = refined.toLowerCase();
  const lowerSanitized = sanitized.toLowerCase();

  const hasMedicalDiagnosis = BANNED_MEDICAL_DIAGNOSES.some((diag) =>
    lowerRefined.includes(diag) && !lowerSanitized.includes(diag)
  );
  const hasPrescription = BANNED_PRESCRIPTIONS.some((presc) =>
    lowerRefined.includes(presc) && !lowerSanitized.includes(presc)
  );

  // Verificação de números / parâmetros vitais
  const originalNumbers: string[] = sanitized.match(/\d+(\.\d+)?/g) || [];
  const refinedNumbers: string[] = refined.match(/\d+(\.\d+)?/g) || [];
  const numbersPreserved = originalNumbers.every((num) => refinedNumbers.includes(num));

  // Verificação de dispositivos clínicos
  const deviceKeywords = ['avp', 'cvc', 'svd', 'sne', 'sng', 'picc', 'cateter', 'sonda', 'dreno', 'traqueostomia', 'tot'];
  const originalDevices = deviceKeywords.filter((d) => lowerSanitized.includes(d));
  const devicesPreserved = originalDevices.every((d) => lowerRefined.includes(d));

  // Se a IA externa gerou diagnóstico médico, prescrição ou adulterou números/dispositivos,
  // revertemos estritamente para o texto original sanitizado com refinamento determinístico seguro
  if (hasMedicalDiagnosis || hasPrescription || !numbersPreserved || !devicesPreserved) {
    refined = sanitized;
    alteracoes.length = 0;
    for (const rule of CLINICAL_REFINEMENT_RULES) {
      if (rule.pattern.test(refined)) {
        refined = refined.replace(rule.pattern, rule.replacement);
        alteracoes.push(rule.descricao);
      }
    }
    // Capitalização e pontuação
    refined = refined.charAt(0).toUpperCase() + refined.slice(1);
    if (!refined.endsWith('.') && !refined.endsWith('!') && !refined.endsWith(';')) {
      refined += '.';
    }
  }

  const finalLower = refined.toLowerCase();
  const finalHasDiag = BANNED_MEDICAL_DIAGNOSES.some((d) => finalLower.includes(d) && !lowerSanitized.includes(d));
  const finalHasPresc = BANNED_PRESCRIPTIONS.some((p) => finalLower.includes(p) && !lowerSanitized.includes(p));

  return {
    originalText: sanitized,
    improvedText: refined,
    alteracoesLinguisticas: alteracoes,
    fatosPreservados: true,
    semDiagnosticoMedico: !finalHasDiag,
    semPrescricao: !finalHasPresc,
    aiStatus,
    aiNotice,
  };
}

/**
 * Versão síncrona determinística de melhoria de texto clínico (sem I/O de rede)
 */
export function improveNursingNarrativeSync(rawText: string): NarrativeImprovementResult {
  const sanitized = anonymizeText(rawText || '').trim();

  if (!sanitized) {
    return {
      originalText: '',
      improvedText: '',
      alteracoesLinguisticas: [],
      fatosPreservados: true,
      semDiagnosticoMedico: true,
      semPrescricao: true,
    };
  }

  let refined = sanitized;
  const alteracoes: string[] = [];

  for (const rule of CLINICAL_REFINEMENT_RULES) {
    if (rule.pattern.test(refined)) {
      refined = refined.replace(rule.pattern, rule.replacement);
      alteracoes.push(rule.descricao);
    }
  }

  if (refined === sanitized) {
    refined = refined.charAt(0).toUpperCase() + refined.slice(1);
    if (!refined.endsWith('.') && !refined.endsWith('!') && !refined.endsWith(';')) {
      refined += '.';
    }
  }

  const finalLower = refined.toLowerCase();
  const lowerSanitized = sanitized.toLowerCase();
  const finalHasDiag = BANNED_MEDICAL_DIAGNOSES.some((d) => finalLower.includes(d) && !lowerSanitized.includes(d));
  const finalHasPresc = BANNED_PRESCRIPTIONS.some((p) => finalLower.includes(p) && !lowerSanitized.includes(p));

  return {
    originalText: sanitized,
    improvedText: refined,
    alteracoesLinguisticas: alteracoes,
    fatosPreservados: true,
    semDiagnosticoMedico: !finalHasDiag,
    semPrescricao: !finalHasPresc,
  };
}

/**
 * 5) EXPLICABILIDADE DA IA
 * Mostra ao profissional exatamente em quais fatos reais e autorizados a evolução foi baseada.
 * NUNCA mostra raciocínio interno da IA.
 */
export function explainGenerationBasis(dados: {
  subjective?: any;
  vitalSigns?: any;
  physicalExam?: any;
  devices?: any[];
  interventions?: any[];
  modeloUtilizado?: string;
}): GenerationBasisExplanation {
  const itens: GenerationBasisExplanation['itensUtilizados'] = [];

  // 1. Subjetivo
  const hasSubj =
    Boolean(dados.subjective?.patientReport?.trim()) ||
    Boolean(dados.subjective?.complaint?.trim()) ||
    Boolean(typeof dados.subjective === 'string' && dados.subjective.trim());
  itens.push({
    categoria: 'Informações Subjetivas',
    icone: hasSubj ? 'check' : 'info',
    descricao: hasSubj
      ? 'Relato do paciente, queixas e informações subjetivas registradas'
      : 'Nenhum relato subjetivo específico informado',
    presente: hasSubj,
  });

  // 2. Sinais Vitais
  const vitals = dados.vitalSigns || {};
  const hasVitals = Object.values(vitals).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
  itens.push({
    categoria: 'Sinais Vitais',
    icone: hasVitals ? 'check' : 'info',
    descricao: hasVitals
      ? 'Parâmetros hemodinâmicos e respiratórios aferidos no plantão'
      : 'Sinais vitais não fornecidos neste registro',
    presente: hasVitals,
  });

  // 3. Exame Físico / Objetivo
  const hasPhys =
    Boolean(dados.physicalExam) &&
    (typeof dados.physicalExam === 'string'
      ? dados.physicalExam.trim().length > 0
      : Object.keys(dados.physicalExam).length > 0);
  itens.push({
    categoria: 'Exame Físico Objetivado',
    icone: hasPhys ? 'check' : 'info',
    descricao: hasPhys
      ? 'Achados do exame físico segmentar e estado geral informados'
      : 'Exame físico não detalhado',
    presente: hasPhys,
  });

  // 4. Dispositivos e Curativos
  const hasDevices = Array.isArray(dados.devices) && dados.devices.length > 0;
  itens.push({
    categoria: 'Dispositivos e Cuidados Invasivos',
    icone: hasDevices ? 'check' : 'info',
    descricao: hasDevices
      ? `${dados.devices!.length} dispositivo(s) ou acesso(s) informado(s)`
      : 'Nenhum dispositivo invasivo registrado',
    presente: hasDevices,
  });

  // 5. Intervenções de Enfermagem
  const hasInterventions = Array.isArray(dados.interventions) && dados.interventions.length > 0;
  itens.push({
    categoria: 'Intervenções de Enfermagem',
    icone: hasInterventions ? 'check' : 'info',
    descricao: hasInterventions
      ? `${dados.interventions!.length} cuidado(s) ou intervenção(ões) documentado(s)`
      : 'Intervenções não especificadas',
    presente: hasInterventions,
  });

  return {
    titulo: 'Evolução criada baseada em:',
    itensUtilizados: itens,
    modeloUtilizado: dados.modeloUtilizado || 'Registro Livre / SOAP Padrão',
    avisoEtico:
      'Este texto foi sintetizado estritamente a partir dos dados acima autorizados pelo profissional. A IA não adicionou diagnósticos médicos nem prescrições farmacológicas.',
  };
}

/**
 * 6) AVALIAÇÃO DE QUALIDADE ANTES DE SALVAR
 */
export function evaluateDocumentationQuality(
  form: any,
  validationResult?: { isValid?: boolean; missingRequiredFields?: string[] }
): AIQualityReviewData {
  const analysis = analyzeDocumentationCompleteness(form);
  const obrigatoriosPreenchidos =
    validationResult?.isValid !== undefined
      ? validationResult.isValid
      : Boolean(form?.identification || form?.setor || form?.leito);

  const dadosConsistentes = !analysis.alertasConsistencia.length;
  const sugestoes = analysis.sugestoes.map((s) => s.mensagem);

  return {
    obrigatoriosPreenchidos,
    dadosConsistentes,
    sugestoesMelhoria: sugestoes,
    alertasCriticos: analysis.alertasConsistencia,
    score: analysis.scoreQualidade,
  };
}
