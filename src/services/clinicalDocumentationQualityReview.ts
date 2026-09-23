/**
 * ClinicalDocumentationQualityReview
 *
 * Avaliador transversal de qualidade documental para todos os módulos assistenciais do EvoluiEnf.
 *
 * DIRETRIZES FUNDAMENTAIS:
 * 1. NÃO bloqueia o registro nem o salvamento em nenhuma hipótese (apenas alertas consultivos).
 * 2. Avalia:
 *    - Campos essenciais preenchidos
 *    - Inconsistências fisiológicas ou clínicas
 *    - Dados ausentes relevantes
 *    - Sugestões práticas de melhoria
 * 3. Compatível com Técnico (PS, UTI, CM, CC, Ped, Adm) e Enfermeiro (PS, UTI, CM, CC, Ped, Wounds, SOAP).
 */

export interface QualityCheckField {
  name: string;
  category: 'identificacao' | 'sinais_vitais' | 'neurologico' | 'respiratorio' | 'dispositivos' | 'conduta';
  present: boolean;
  required: boolean;
  hint?: string;
}

export interface QualityInconsistencyAlert {
  id: string;
  severity: 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

export interface MissingRelevantData {
  id: string;
  field: string;
  impact: string;
  suggestedPrompt: string;
}

export interface DocumentationQualityReviewResult {
  moduleType: string;
  role: 'technician' | 'nurse';
  totalEssentialFields: number;
  completedEssentialFields: number;
  completionScore: number; // 0 a 100
  status: 'excelente' | 'adequada' | 'requer_atencao';
  essentialFields: QualityCheckField[];
  inconsistencies: QualityInconsistencyAlert[];
  missingData: MissingRelevantData[];
  suggestions: string[];
  blocksSubmission: false; // NUNCA bloqueia
}

export class ClinicalDocumentationQualityReview {
  /**
   * Avalia a qualidade documental de qualquer formulário clínico do EvoluiEnf.
   */
  static evaluate(
    form: Record<string, any>,
    options: {
      moduleType: string;
      role: 'technician' | 'nurse';
      area?: string;
    }
  ): DocumentationQualityReviewResult {
    const fields: QualityCheckField[] = [];
    const inconsistencies: QualityInconsistencyAlert[] = [];
    const missingData: MissingRelevantData[] = [];
    const suggestions: string[] = [];

    const stringified = JSON.stringify(form || {}).toLowerCase();

    // 1. Campos Essenciais
    // A) Identificação / Contexto
    const hasMoment = Boolean(
      form?.context?.moment ||
      form?.context?.momentOfCare ||
      form?.context?.horario ||
      form?.data ||
      form?.horario ||
      form?.subjective
    );
    fields.push({
      name: 'Momento / Contexto do Atendimento',
      category: 'identificacao',
      present: hasMoment,
      required: true,
      hint: 'Horário do plantão ou momento assistencial',
    });

    // B) Sinais Vitais
    const vitals = form?.vitalSigns || form?.objective?.vitalSigns || {};
    const hasPA = Boolean(vitals?.bloodPressure || vitals?.pressaoArterial || vitals?.pas || vitals?.pa);
    const hasFC = Boolean(vitals?.heartRate || vitals?.frequenciaCardiaca || vitals?.fc);
    const hasSpO2 = Boolean(vitals?.oxygenSaturation || vitals?.saturacaoO2 || vitals?.spo2);
    const hasTemp = Boolean(vitals?.temperature || vitals?.temperaturaAxilar || vitals?.tax);
    const hasFR = Boolean(vitals?.respiratoryRate || vitals?.frequenciaRespiratoria || vitals?.fr);

    const hasVitalsCore = hasPA || hasFC || hasSpO2;
    fields.push({
      name: 'Parâmetros Vitais Principais (PA, FC, SpO2)',
      category: 'sinais_vitais',
      present: hasVitalsCore,
      required: true,
      hint: 'Aferição hemodinâmica atual',
    });

    // C) Nível de Consciência / Neurológico
    const hasNeuro = Boolean(
      form?.neurological?.consciousness ||
      form?.neurological?.gcs ||
      form?.neurological?.nivelConsciencia ||
      form?.neurological?.sedationScale ||
      form?.physicalExam?.neurological ||
      form?.objective?.physicalExam ||
      form?.generalState?.consciousness
    );
    fields.push({
      name: 'Nível de Consciência / Resposta Neurológica',
      category: 'neurologico',
      present: hasNeuro,
      required: true,
      hint: 'Escala de Glasgow, RASS ou estado lúcido/sonolento',
    });

    // D) Padrão Respiratório
    const hasResp = Boolean(
      form?.respiratory?.pattern ||
      form?.respiratory?.support ||
      form?.respiratory?.ventilatoryPattern ||
      form?.physicalExam?.respiratory ||
      form?.respiratorySupport
    );
    fields.push({
      name: 'Padrão Respiratório e Suporte Ventilatório',
      category: 'respiratorio',
      present: hasResp,
      required: true,
      hint: 'Respiração espontânea, oxigenoterapia ou ventilação mecânica',
    });

    // E) Dispositivos e Eliminações
    const hasDispositivos = Boolean(
      (Array.isArray(form?.invasiveDevices) && form.invasiveDevices.length > 0) ||
      (Array.isArray(form?.devices) && form.devices.length > 0) ||
      form?.dispositivosInvasivos ||
      form?.eliminations ||
      stringified.includes('cateter') ||
      stringified.includes('sonda') ||
      stringified.includes('dreno') ||
      stringified.includes('acesso')
    );
    fields.push({
      name: 'Dispositivos Invasivos e Acessos',
      category: 'dispositivos',
      present: hasDispositivos,
      required: false,
      hint: 'Acessos venosos, sondas, drenos ou curativos',
    });

    // F) Conduta / Intervenções Realizadas
    const hasConduta = Boolean(
      (Array.isArray(form?.interventions) && form.interventions.length > 0) ||
      (Array.isArray(form?.care) && form.care.length > 0) ||
      form?.plan ||
      form?.planoCuidado ||
      form?.nursePrescription ||
      form?.intervencoesEnfermagem
    );
    fields.push({
      name: 'Conduta / Cuidados Assistenciais Executados',
      category: 'conduta',
      present: hasConduta,
      required: true,
      hint: 'Ações de enfermagem, orientações e posicionamento no leito',
    });

    // 2. Análise de Inconsistências
    // Consciência alterada vs deambulação
    const isSedatedOrComatose =
      stringified.includes('comatoso') ||
      stringified.includes('sedação contínua') ||
      stringified.includes('rass -4') ||
      stringified.includes('rass -5') ||
      stringified.includes('gcs 3');

    const isAmbulating =
      stringified.includes('deambulando') ||
      stringified.includes('marcha sem apoio') ||
      stringified.includes('deambula');

    if (isSedatedOrComatose && isAmbulating) {
      inconsistencies.push({
        id: 'INC-001',
        severity: 'warning',
        title: 'Conflito de Mobilidade e Nível de Consciência',
        description: 'Consta paciente em sedação profunda/coma concomitantemente registrado como deambulando.',
        recommendation: 'Revisar se o paciente está em repouso no leito sob sedação.',
      });
    }

    // SpO2 baixa sem menção a oxigenoterapia
    if (hasSpO2) {
      const spo2Val = parseInt(
        vitals?.oxygenSaturation || vitals?.saturacaoO2 || vitals?.spo2 || '100',
        10
      );
      if (!isNaN(spo2Val) && spo2Val < 90 && !stringified.includes('o2') && !stringified.includes('oxig')) {
        inconsistencies.push({
          id: 'INC-002',
          severity: 'warning',
          title: 'Hipoxemia sem Suporte de Oxigênio Descrito',
          description: `SpO2 registrada em ${spo2Val}% sem especificação de oferta de oxigenoterapia ou conduta adotada.`,
          recommendation: 'Descrever se houve instalação de cateter nasal, máscara ou comunicação à equipe.',
        });
      }
    }

    // PA sistólica extrema sem conduta informada
    if (hasPA) {
      const paStr = String(vitals?.bloodPressure || vitals?.pressaoArterial || '');
      const matchSys = paStr.match(/^(\d{2,3})/);
      if (matchSys) {
        const sys = parseInt(matchSys[1], 10);
        if (sys >= 180 || sys <= 80) {
          inconsistencies.push({
            id: 'INC-003',
            severity: 'info',
            title: 'Parâmetro Pressórico com Desvio Significativo',
            description: `PA sistólica registrada de ${sys} mmHg.`,
            recommendation: 'Certifique-se de registrar a comunicação imediata ao enfermeiro responsável ou médico plantonista.',
          });
        }
      }
    }

    // 3. Dados Ausentes Relevantes
    if (!hasVitalsCore) {
      missingData.push({
        id: 'MIS-001',
        field: 'Sinais Vitais',
        impact: 'Aferição é fundamental para o respaldo ético e legal do registro.',
        suggestedPrompt: 'Registrar PA, FC, FR, Temp e SpO2 no início ou término do atendimento.',
      });
    }

    if (!hasNeuro) {
      missingData.push({
        id: 'MIS-002',
        field: 'Avaliação Neurológica',
        impact: 'Sem registro do estado de consciência e orientação temporal-espacial.',
        suggestedPrompt: 'Informar se lúcido, orientado, sonolento, torporoso ou sob sedação.',
      });
    }

    if (hasDispositivos && !stringified.includes('pérvio') && !stringified.includes('pervio') && !stringified.includes('funcionante')) {
      missingData.push({
        id: 'MIS-003',
        field: 'Permeabilidade dos Dispositivos',
        impact: 'Dispositivos mencionados sem menção expressa de permeabilidade ou fixação.',
        suggestedPrompt: 'Informar se o cateter ou sonda está pérvio, com curativo limpo e seco.',
      });
    }

    // 4. Sugestões de Melhoria
    if (options.role === 'nurse') {
      suggestions.push('Documentar evolução das queixas relatadas pelo paciente em relação ao plantão anterior.');
      suggestions.push('Detalhar a resposta clínica às intervenções de enfermagem prescritas.');
    } else {
      suggestions.push('Registrar queixas espontâneas e relato de dor com escala quando aplicável.');
      suggestions.push('Descrever intercorrências ou estabilidade ao passar o plantão.');
    }

    // Cálculo de Score
    const requiredFields = fields.filter((f) => f.required);
    const completedRequired = requiredFields.filter((f) => f.present).length;
    const completionScore = Math.round((completedRequired / Math.max(1, requiredFields.length)) * 100);

    const status =
      completionScore >= 80 && inconsistencies.length === 0
        ? 'excelente'
        : completionScore >= 60
        ? 'adequada'
        : 'requer_atencao';

    return {
      moduleType: options.moduleType,
      role: options.role,
      totalEssentialFields: requiredFields.length,
      completedEssentialFields: completedRequired,
      completionScore,
      status,
      essentialFields: fields,
      inconsistencies,
      missingData,
      suggestions,
      blocksSubmission: false,
    };
  }
}
