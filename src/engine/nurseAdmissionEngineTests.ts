import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import { buildNurseAdmissionNote } from './nurseAdmissionNoteBuilder';
import { buildAuthorizedNurseAdmissionFacts } from './nurseAdmissionClinicalFactBuilder';
import { validateNurseAdmissionClinicalConsistency } from './nurseAdmissionConsistencyValidator';
import { verifyNurseAdmissionAIRefinedResponse } from './nurseAdmissionPostGenerationVerifier';
import { checkPrivacyGuards } from './privacyGuard';
import {
  createInitialNurseAdmissionForm,
  createSampleNurseAdmissionForm,
  normalizeNurseAdmissionForm,
  getNurseAdmissionSectionStatuses,
} from '../utils/nurseAdmissionValidator';

export interface NurseAdmissionTestResult {
  id: string;
  name: string;
  passed: boolean;
  message?: string;
  generatedText?: string;
}

export interface NurseAdmissionSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: NurseAdmissionTestResult[];
}

export function runNurseAdmissionEngineTests(): NurseAdmissionSuiteSummary {
  const results: NurseAdmissionTestResult[] = [];

  // NUR-ADM-001: Admissão completa do enfermeiro
  try {
    const form = createSampleNurseAdmissionForm();
    const text = buildNurseAdmissionNote(form);
    const passed =
      text.includes('Realizada admissão de enfermagem em Sala Vermelha') &&
      text.includes('proveniente de UPA') &&
      text.toLowerCase().includes('identificação conferida por pulseira e placa do leito') &&
      text.includes('PA 135/85 mmHg') &&
      text.includes('Pele íntegra') &&
      text.includes('risco de queda: médio risco');
    results.push({
      id: 'NUR-ADM-001',
      name: 'Admissão completa do enfermeiro',
      passed,
      message: passed ? 'Narrativa completa estruturada com sucesso.' : 'Campos fundamentais ausentes na narrativa.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-001', name: 'Admissão completa do enfermeiro', passed: false, message: e.message });
  }

  // NUR-ADM-002: Histórico e queixa principal
  try {
    const form: any = {
      nursingHistory: {
        admissionReason: 'cefaleia súbita e escotomas',
        historyOfPresentIllness: 'início há 1 hora em repouso',
        informationSource: 'Paciente',
      },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = text.includes('Motivo da admissão / queixa referida: cefaleia súbita e escotomas') && text.includes('Histórico atual referido: início há 1 hora em repouso');
    results.push({
      id: 'NUR-ADM-002',
      name: 'Histórico de enfermagem e queixa',
      passed,
      message: passed ? 'Histórico registrado com fidedignidade.' : 'Falha no relato do histórico.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-002', name: 'Histórico de enfermagem e queixa', passed: false, message: e.message });
  }

  // NUR-ADM-003: Exame neurológico e Glasgow
  try {
    const form: any = {
      neurological: {
        consciousnessLevel: 'Consciente',
        orientation: 'Orientado em tempo e espaço',
        pupils: 'Isocóricas',
        photoreaction: 'Fotorreagentes',
        glasgowScore: 15,
      },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = text.includes('consciente') && text.includes('pupilas isocóricas') && text.includes('Glasgow: 15');
    results.push({
      id: 'NUR-ADM-003',
      name: 'Exame neurológico estruturado',
      passed,
      message: passed ? 'Neurológico, fotorreagência e Glasgow descritos.' : 'Falha no exame neurológico.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-003', name: 'Exame neurológico estruturado', passed: false, message: e.message });
  }

  // NUR-ADM-004: Exame respiratório e ausculta
  try {
    const form: any = {
      respiratory: {
        respiratorySupport: 'Ar ambiente',
        respiratoryPattern: 'Eupneico',
        respiratoryDistress: 'Ausente',
        breathSounds: 'murmúrio vesicular presente bilateralmente',
      },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = text.includes('padrão eupneico') && text.includes('ausculta pulmonar com murmúrio vesicular presente bilateralmente') && text.includes('em ar ambiente');
    results.push({
      id: 'NUR-ADM-004',
      name: 'Exame respiratório e ausculta',
      passed,
      message: passed ? 'Ausculta e padrão respiratório registrados.' : 'Falha no exame respiratório.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-004', name: 'Exame respiratório e ausculta', passed: false, message: e.message });
  }

  // NUR-ADM-005: Exame cardiovascular e perfusão
  try {
    const form: any = {
      cardiovascular: {
        peripheralPerfusion: 'Adequada',
        extremities: 'Aquecidas',
        capillaryRefillTime: '< 3 segundos',
        peripheralPulses: 'Cheios e simétricos',
        edema: 'Ausente',
      },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = text.includes('perfusão periférica adequada') && text.includes('extremidades aquecidas') && text.includes('TEC < 3 segundos') && text.includes('sem edema');
    results.push({
      id: 'NUR-ADM-005',
      name: 'Exame cardiovascular e perfusão',
      passed,
      message: passed ? 'Parâmetros hemodinâmicos e perfusão descritos.' : 'Falha no cardiovascular.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-005', name: 'Exame cardiovascular e perfusão', passed: false, message: e.message });
  }

  // NUR-ADM-006: Avaliação de riscos de enfermagem
  try {
    const form: any = {
      riskAssessment: {
        fallRisk: 'Alto risco',
        pressureInjuryRisk: 'Risco moderado',
        aspirationRisk: 'Presente',
        deviceDislodgementRisk: 'Presente',
      },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = text.includes('risco de queda: alto risco') && text.includes('risco de lesão por pressão: risco moderado') && text.includes('risco de broncoaspiração presente');
    results.push({
      id: 'NUR-ADM-006',
      name: 'Avaliação de riscos assistenciais',
      passed,
      message: passed ? 'Riscos assistenciais descritos com precisão.' : 'Falha nos riscos assistenciais.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-006', name: 'Avaliação de riscos assistenciais', passed: false, message: e.message });
  }

  // NUR-ADM-007: Condutas e plano inicial de cuidados
  try {
    const form: any = {
      nursingPlan: {
        planItems: [
          'Manter monitorização eletrocardiográfica contínua',
          'Manter grades do leito elevadas para prevenção de quedas',
        ],
      },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = text.includes('Plano inicial de cuidados de enfermagem') && text.includes('manter monitorização eletrocardiográfica contínua') && text.includes('manter grades do leito elevadas para prevenção de quedas');
    results.push({
      id: 'NUR-ADM-007',
      name: 'Plano inicial de cuidados de enfermagem',
      passed,
      message: passed ? 'Plano de cuidados registrado sem diagnósticos automáticos.' : 'Falha no plano de cuidados.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-007', name: 'Plano inicial de cuidados de enfermagem', passed: false, message: e.message });
  }

  // NUR-ADM-008: Sem diagnóstico automático ou prescrição não solicitada
  try {
    const form: any = {
      nursingHistory: { admissionReason: 'dor precordial' },
      vitalSignsAndPain: { systolicBP: '160', diastolicBP: '100' },
    };
    const text = buildNurseAdmissionNote(form);
    const passed =
      !text.includes('diagnóstico de enfermagem') &&
      !text.includes('NANDA') &&
      !text.includes('prescrição médica automática');
    results.push({
      id: 'NUR-ADM-008',
      name: 'Ausência de diagnósticos ou prescrições automáticas',
      passed,
      message: passed ? 'Segurança respeitada: nenhum diagnóstico/prescrição não selecionado foi gerado.' : 'Falha: conteúdo automático indevido detectado.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-008', name: 'Ausência de diagnósticos ou prescrições automáticas', passed: false, message: e.message });
  }

  // NUR-ADM-009: Situação final vazia NÃO cria destino
  try {
    const form: any = {
      context: { location: 'Sala Vermelha' },
      finalStatus: { conditions: [] },
    };
    const text = buildNurseAdmissionNote(form);
    const passed = !text.includes('transferência') && !text.includes('alta') && !text.includes('aguardando vaga');
    results.push({
      id: 'NUR-ADM-009',
      name: 'Situação final vazia não cria destino',
      passed,
      message: passed ? 'Nenhum destino ou situação final gerado indevidamente.' : 'Texto gerou situação final sem preenchimento.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-009', name: 'Situação final vazia não cria destino', passed: false, message: e.message });
  }

  // NUR-ADM-010: Fatos autorizados do enfermeiro
  try {
    const form = createSampleNurseAdmissionForm();
    const facts = buildAuthorizedNurseAdmissionFacts(form);
    const passed =
      Boolean(facts.vitalSigns && facts.vitalSigns.length > 0) &&
      Boolean(facts.context && facts.context.length > 0) &&
      Boolean(facts.origin && facts.origin.length > 0);
    results.push({
      id: 'NUR-ADM-010',
      name: 'Construção de fatos autorizados do enfermeiro',
      passed,
      message: passed ? 'Fatos autorizados extraídos com sucesso.' : 'Fatos clínicos autorizados ausentes.',
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-010', name: 'Construção de fatos autorizados do enfermeiro', passed: false, message: e.message });
  }

  // NUR-ADM-011: Consistência clínica do enfermeiro (NUR-CONS-001)
  try {
    const form: any = {
      neurological: { consciousnessLevel: 'Sedado' },
      nursingHistory: { admissionReason: 'dor', informationSource: 'Paciente' },
    };
    const alerts = validateNurseAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'NUR-CONS-001');
    results.push({
      id: 'NUR-ADM-011',
      name: 'Validação de consistência clínica (Sedado + Fonte Paciente)',
      passed,
      message: passed ? 'Alerta NUR-CONS-001 disparado com precisão.' : 'Alerta de consistência não disparado.',
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-011', name: 'Validação de consistência clínica (Sedado + Fonte Paciente)', passed: false, message: e.message });
  }

  // NUR-ADM-012: Bloqueio de termos proibidos (AI PostGenerationVerifier)
  try {
    const form = createSampleNurseAdmissionForm();
    const facts = buildAuthorizedNurseAdmissionFacts(form);
    const refinedWithBadTerm = {
      paragraphs: [{ text: 'Paciente com prognóstico reservado e evolução estável.', factIds: ['nurse-adm-ctx-moment'] }],
    };
    const verif = verifyNurseAdmissionAIRefinedResponse(refinedWithBadTerm, facts, 'Baseline');
    const passed = verif.approved === false;
    results.push({
      id: 'NUR-ADM-012',
      name: 'Bloqueio de termos não autorizados (prognóstico)',
      passed,
      message: passed ? 'Termo não autorizado ("prognóstico reservado") bloqueado com sucesso.' : 'Falha no verificador pós-geração.',
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-012', name: 'Bloqueio de termos não autorizados (prognóstico)', passed: false, message: e.message });
  }

  // NUR-ADM-013: Normalização de dados do formulário do enfermeiro
  try {
    const dirtyForm: any = {
      skin: { integrity: 'Íntegra', lesionLocation: 'sacro', lesionDescription: 'LPP' },
      installedDevices: { installedInAdmission: 'Não', list: [{ type: 'AVP' }] },
      complicationsAndCommunication: { hasComplication: 'Não', complicationDescription: 'vômitos' },
    };
    const cleaned = normalizeNurseAdmissionForm(dirtyForm);
    const passed =
      cleaned.skin.lesionLocation === '' &&
      cleaned.installedDevices.list.length === 0 &&
      cleaned.complicationsAndCommunication.complicationDescription === '';
    results.push({
      id: 'NUR-ADM-013',
      name: 'Normalização estrutural de condicionais do enfermeiro',
      passed,
      message: passed ? 'Campos condicionais inconsistentes limpos com sucesso.' : 'Falha na normalização.',
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-013', name: 'Normalização estrutural de condicionais do enfermeiro', passed: false, message: e.message });
  }

  // NUR-ADM-014: Status das 20 seções do formulário do enfermeiro
  try {
    const emptyForm = createInitialNurseAdmissionForm();
    const statuses = getNurseAdmissionSectionStatuses(emptyForm);
    const passed = statuses.length === 20 && statuses.every((s) => s === 'not_started');
    results.push({
      id: 'NUR-ADM-014',
      name: 'Inicialização limpa de 20 seções (not_started)',
      passed,
      message: passed ? 'Todas as 20 seções inicializadas sem seleções prévias.' : 'Status inicial incorreto.',
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-014', name: 'Inicialização limpa de 20 seções (not_started)', passed: false, message: e.message });
  }

  // NUR-ADM-015: Proteção de privacidade no texto do enfermeiro
  try {
    const piiCheck = checkPrivacyGuards('Paciente Maria Oliveira CPF 987.654.321-00 admitida.');
    const safeCheck = checkPrivacyGuards('Admissão de enfermagem realizada no leito de emergência.');
    const passed = piiCheck.hasPotentialPII === true && safeCheck.hasPotentialPII === false;
    results.push({
      id: 'NUR-ADM-015',
      name: 'Proteção de privacidade (PrivacyGuard) no enfermeiro',
      passed,
      message: passed ? 'Detecção e alerta de CPF funcionando perfeitamente.' : 'Falha no PrivacyGuard.',
    });
  } catch (e: any) {
    results.push({ id: 'NUR-ADM-015', name: 'Proteção de privacidade (PrivacyGuard) no enfermeiro', passed: false, message: e.message });
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  };
}
