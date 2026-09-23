import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { buildAuthorizedAdmissionFacts } from './admissionClinicalFactBuilder';
import { buildTechnicianAdmissionNote } from './technicianAdmissionNoteBuilder';
import { validateAdmissionClinicalConsistency } from './admissionConsistencyValidator';
import { verifyAdmissionAIRefinedResponse } from './admissionPostGenerationVerifier';
import { checkPrivacyGuards } from './privacyGuard';
import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialAdmissionForm,
  createSampleAdmissionForm,
  normalizeAdmissionForm,
  getAdmissionSectionStatuses,
  calculateAdmissionSectionStatus,
} from '../utils/admissionValidator';

export function runAdmissionEngineTests(): EngineTestSummary {
  const results: EngineTestOutcome[] = [];

  // ==========================================
  // ADM-001: Admissão padrão PS
  // ==========================================
  try {
    const form: any = {
      context: { moment: 'Admito/Recebo paciente', location: 'Sala Vermelha', accompaniment: 'Familiar' },
      origin: {
        patientOrigin: 'UPA',
        arrivalModes: ['Maca', 'Ambulância'],
        accompaniedByTransportTeam: 'Não',
      },
      identification: { wristbandChecked: 'Sim', bedSignChecked: 'Sim', allergies: 'Não referidas', precaution: 'Padrão' },
      reportedInformation: { admissionReason: 'dor abdominal', complaints: 'Sem queixas referidas no momento' },
      arrivalCondition: { behavior: ['Calmo', 'Cooperativo'], hygiene: 'Preservada' },
      vitalSigns: { systolicBP: '128', diastolicBP: '76', heartRate: '82', respiratoryRate: '18', oxygenSaturation: '97', temperature: '36.5' },
      neurological: { consciousnessLevel: 'Consciente', orientation: 'Orientado em tempo e espaço' },
      respiratory: { respiratorySupport: 'Ar ambiente', respiratoryDistress: 'Ausente' },
      elimination: { diuresis: 'Presente', urinaryRoute: 'Espontânea' },
      admissionCare: { careItems: ['Acomodação no leito', 'Monitorização de sinais vitais', 'Grades de proteção elevadas'] },
      complications: { hasComplication: 'Não' },
      finalStatus: { conditions: ['Permanece no setor sob cuidados'] },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed =
      text.includes('Recebo paciente em Sala Vermelha') &&
      text.includes('proveniente de UPA') &&
      text.includes('128/76 mmHg') &&
      text.includes('Sem intercorrências registradas');
    results.push({
      id: 'ADM-001',
      name: 'Admissão padrão PS',
      passed,
      message: passed ? 'Anotação determinística de admissão gerada com sucesso.' : 'Falha na geração dos termos padrão.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-001', name: 'Admissão padrão PS', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-002: Recepção via SAMU com equipe
  // ==========================================
  try {
    const form: any = {
      context: { moment: 'Admito/Recebo paciente', location: 'Sala Vermelha', accompaniment: 'Equipe assistencial' },
      origin: {
        patientOrigin: 'SAMU',
        arrivalModes: ['Maca', 'Ambulância'],
        accompaniedByTransportTeam: 'Sim',
        transportTeamType: 'SAMU',
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('proveniente de SAMU') && text.includes('transporte assistido por SAMU');
    results.push({
      id: 'ADM-002',
      name: 'Recepção via SAMU com equipe',
      passed,
      message: passed ? 'Procedência SAMU e equipe de transporte registradas.' : 'Dados do SAMU ausentes.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-002', name: 'Recepção via SAMU com equipe', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-003: Recepção via UPA com maca e ambulância
  // ==========================================
  try {
    const form: any = {
      origin: { patientOrigin: 'UPA', arrivalModes: ['Ambulância', 'Maca'], accompaniedByTransportTeam: 'Não' },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('proveniente de UPA') && text.includes('ambulância') && text.includes('maca');
    results.push({
      id: 'ADM-003',
      name: 'Recepção via UPA com maca e ambulância',
      passed,
      message: passed ? 'Chegada em maca e ambulância registradas.' : 'Falha nos modos de chegada.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-003', name: 'Recepção via UPA com maca e ambulância', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-004: Admissão sem queixas referidas
  // ==========================================
  try {
    const form: any = {
      reportedInformation: { complaints: 'Sem queixas referidas no momento' },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Sem queixas referidas no momento da admissão');
    results.push({
      id: 'ADM-004',
      name: 'Admissão sem queixas referidas',
      passed,
      message: passed ? 'Ausência de queixas expressa corretamente.' : 'Texto de queixas ausente.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-004', name: 'Admissão sem queixas referidas', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-005: Admissão com dor intensa
  // ==========================================
  try {
    const form: any = {
      pain: {
        assessmentType: 'Escala numérica 0–10',
        numericScaleValue: 8,
        location: 'região lombar',
        characteristics: 'em pontada',
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Refere dor 8/10 em escala numérica') && text.includes('região lombar');
    results.push({
      id: 'ADM-005',
      name: 'Admissão com dor intensa',
      passed,
      message: passed ? 'Escala de dor e localização registradas.' : 'Falha na descrição da dor.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-005', name: 'Admissão com dor intensa', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-006: Admissão de paciente sedado
  // ==========================================
  try {
    const form: any = {
      neurological: { consciousnessLevel: 'Sedado', rassType: 'score', rassScore: -4 },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('sedado') && text.includes('Escala RASS: -4');
    results.push({
      id: 'ADM-006',
      name: 'Admissão de paciente sedado',
      passed,
      message: passed ? 'Nível sedado e RASS -4 registrados.' : 'Falha nos dados de sedação.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-006', name: 'Admissão de paciente sedado', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-007: Admissão de paciente desorientado
  // ==========================================
  try {
    const form: any = {
      neurological: { consciousnessLevel: 'Consciente', orientation: 'Desorientado', glasgowType: 'score', glasgowScore: 13 },
      arrivalCondition: { behavior: ['Agitado', 'Ansioso'] },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('desorientado') && text.includes('agitado e ansioso') && text.includes('Glasgow: 13');
    results.push({
      id: 'ADM-007',
      name: 'Admissão de paciente desorientado/agitado',
      passed,
      message: passed ? 'Desorientação e agitação registradas.' : 'Falha no relato neurológico.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-007', name: 'Admissão de paciente desorientado/agitado', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-008: Admissão em oxigenoterapia
  // ==========================================
  try {
    const form: any = {
      respiratory: {
        respiratorySupport: 'Oxigenoterapia',
        oxygenDevice: 'Cateter nasal',
        oxygenFlowRate: '3',
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Em oxigenoterapia sob cateter nasal a 3 L/min');
    results.push({
      id: 'ADM-008',
      name: 'Admissão em oxigenoterapia',
      passed,
      message: passed ? 'Dispositivo e fluxo de O2 registrados.' : 'Falha na oxigenoterapia.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-008', name: 'Admissão em oxigenoterapia', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-009: Admissão em VMI
  // ==========================================
  try {
    const form: any = {
      respiratory: { respiratorySupport: 'VMI', vmiAirway: 'TOT' },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Em ventilação mecânica invasiva via TOT');
    results.push({
      id: 'ADM-009',
      name: 'Admissão em VMI',
      passed,
      message: passed ? 'VMI via TOT registrada.' : 'Falha no relato de VMI.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-009', name: 'Admissão em VMI', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-010: Admissão com múltiplos dispositivos já presentes
  // ==========================================
  try {
    const form: any = {
      existingDevices: {
        list: [
          { id: 'dev-1', type: 'AVP', location: 'MSD', permeability: 'Pérvio', functioning: 'Funcionante', dressingClean: true, dressingDry: true, dressingIntact: true, phlogisticSigns: 'Ausentes' },
          { id: 'dev-2', type: 'SVD', location: 'região vesical', permeability: 'Pérvio', functioning: 'Funcionante', dressingClean: false, dressingDry: false, dressingIntact: false, phlogisticSigns: 'Ausentes' },
        ],
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('AVP em MSD já presente na admissão') && text.includes('SVD em região vesical já presente na admissão');
    results.push({
      id: 'ADM-010',
      name: 'Múltiplos dispositivos já presentes',
      passed,
      message: passed ? 'Dispositivos prévios descritos como presentes na chegada.' : 'Falha nos dispositivos prévios.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-010', name: 'Múltiplos dispositivos já presentes', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-011: Admissão com dispositivo instalado durante admissão
  // ==========================================
  try {
    const form: any = {
      installedDevices: {
        installedInAdmission: 'Sim',
        list: [{ id: 'dev-inst-1', type: 'AVP', location: 'MSE' }],
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Realizada instalação/punção de AVP em MSE durante a admissão');
    results.push({
      id: 'ADM-011',
      name: 'Dispositivo instalado na admissão',
      passed,
      message: passed ? 'Procedimento de instalação registrado com precisão.' : 'Falha na punção durante admissão.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-011', name: 'Dispositivo instalado na admissão', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-012: Admissão com pertences entregues
  // ==========================================
  try {
    const form: any = {
      belongings: { status: 'Entregues ao acompanhante/responsável' },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Pertences: entregues ao acompanhante/responsável');
    results.push({
      id: 'ADM-012',
      name: 'Pertences entregues ao acompanhante',
      passed,
      message: passed ? 'Destino dos pertences registrado.' : 'Falha no relato de pertences.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-012', name: 'Pertences entregues ao acompanhante', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-013: Admissão com intercorrência e conduta
  // ==========================================
  try {
    const form: any = {
      complications: {
        hasComplication: 'Sim',
        time: '14:20',
        description: 'episódio de êmese',
        actionsTaken: 'decúbito lateralizado e higiene oral',
        patientResponse: 'estabilizado sem novos episódios',
        communicatedToTeam: 'Sim',
        communicatedWho: 'enfermeiro responsável',
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed =
      text.includes('Às 14:20, episódio de êmese') &&
      text.includes('Condutas realizadas: decúbito lateralizado e higiene oral') &&
      text.includes('Comunicado a enfermeiro responsável');
    results.push({
      id: 'ADM-013',
      name: 'Admissão com intercorrência e conduta',
      passed,
      message: passed ? 'Intercorrência, horário, conduta e comunicação registrados.' : 'Falha no relato da intercorrência.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-013', name: 'Admissão com intercorrência e conduta', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-014: Admissão sem intercorrências
  // ==========================================
  try {
    const form: any = {
      complications: { hasComplication: 'Não' },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Sem intercorrências registradas durante a admissão.');
    results.push({
      id: 'ADM-014',
      name: 'Admissão sem intercorrências',
      passed,
      message: passed ? 'Registro negativo de intercorrência gerado.' : 'Falha no registro sem intercorrências.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-014', name: 'Admissão sem intercorrências', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-015: Admissão com comunicação ao médico
  // ==========================================
  try {
    const form: any = {
      communications: {
        communicationNeeded: 'Sim',
        professionalType: 'Equipe médica',
        time: '15:00',
        description: 'paciente admitido no leito',
      },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Realizada comunicação com Equipe médica às 15:00: paciente admitido no leito');
    results.push({
      id: 'ADM-015',
      name: 'Comunicação à equipe médica',
      passed,
      message: passed ? 'Comunicação estruturada registrada.' : 'Falha na comunicação.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-015', name: 'Comunicação à equipe médica', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-016: Situação final vazia NÃO cria destino / preenchida formata corretamente
  // ==========================================
  try {
    const emptyForm: any = {
      context: { location: 'Sala Vermelha' },
      finalStatus: { conditions: [] },
    };
    const emptyText = buildTechnicianAdmissionNote(emptyForm);
    const filledForm: any = {
      finalStatus: { conditions: ['Transferência em andamento'] },
    };
    const filledText = buildTechnicianAdmissionNote(filledForm);
    const passed =
      !emptyText.includes('transferência') &&
      !emptyText.includes('alta') &&
      !emptyText.includes('aguardando') &&
      filledText.toLowerCase().includes('transferência em andamento');
    results.push({
      id: 'ADM-016',
      name: 'Situação final vazia não cria destino',
      passed,
      message: passed ? 'Situação final vazia não gerou texto indevido e preenchida gerou com precisão.' : 'Falha no tratamento da situação final.',
      generatedText: emptyText,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-016', name: 'Situação final vazia não cria destino', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-017: Admissão mínima com dados básicos
  // ==========================================
  try {
    const form: any = {
      context: { moment: 'Admito/Recebo paciente', location: 'Box', accompaniment: 'Desacompanhado' },
      origin: { patientOrigin: 'Domicílio', arrivalModes: ['Deambulando'], accompaniedByTransportTeam: 'Não' },
    };
    const text = buildTechnicianAdmissionNote(form);
    const passed = text.includes('Recebo paciente em Box') && text.includes('proveniente de Domicílio') && text.includes('desacompanhado');
    results.push({
      id: 'ADM-017',
      name: 'Admissão mínima',
      passed,
      message: passed ? 'Admissão mínima concisa gerada com sucesso.' : 'Falha na admissão mínima.',
      generatedText: text,
    });
  } catch (e: any) {
    results.push({ id: 'ADM-017', name: 'Admissão mínima', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-018: Bloqueio de PII na admissão (PrivacyGuard)
  // ==========================================
  try {
    const piiCheck1 = checkPrivacyGuards('Paciente João da Silva, CPF 123.456.789-00 admitido.');
    const piiCheck2 = checkPrivacyGuards('Paciente admitido sem intercorrências no box 2.');
    const passed = piiCheck1.hasPotentialPII === true && piiCheck2.hasPotentialPII === false;
    results.push({
      id: 'ADM-018',
      name: 'Bloqueio de PII (PrivacyGuard)',
      passed,
      message: passed ? 'Detecção e bloqueio de CPF executados com sucesso.' : 'Falha no PrivacyGuard.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-018', name: 'Bloqueio de PII (PrivacyGuard)', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-019: Bloqueio de inferência de estabilização (OriginFactLock)
  // ==========================================
  try {
    const form: any = {
      origin: { patientOrigin: 'UPA', arrivalModes: ['Maca'] },
    };
    const facts = buildAuthorizedAdmissionFacts(form);
    const aiInferredResponse = {
      paragraphs: [
        {
          text: 'Paciente transferido após estabilização em UPA, trazido por ambulância.',
          factIds: ['adm-origin-source', 'adm-origin-arrival-mode'],
        },
      ],
    };
    const verifyResult = verifyAdmissionAIRefinedResponse(aiInferredResponse, facts, 'Recebo paciente proveniente de UPA.');
    const passed = verifyResult.approved === false && verifyResult.details.originLock.passed === false;
    results.push({
      id: 'ADM-019',
      name: 'Bloqueio de inferência de estabilização (OriginFactLock)',
      passed,
      message: passed ? 'Inferência não autorizada ("após estabilização") bloqueada com sucesso.' : 'Falha no OriginFactLock.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-019', name: 'Bloqueio de inferência de estabilização (OriginFactLock)', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-020: Bloqueio de transformação de dispositivo existente em procedimento instalado (ExistingVsInstalledDevicesLock)
  // ==========================================
  try {
    const form: any = {
      existingDevices: {
        list: [{ type: 'CVC', location: 'subclávia direita' }],
      },
      installedDevices: {
        installedInAdmission: 'Não',
        list: [],
      },
    };
    const facts = buildAuthorizedAdmissionFacts(form);
    const aiFabricatedResponse = {
      paragraphs: [
        {
          text: 'Realizada instalação de CVC em subclávia direita durante a admissão.',
          factIds: ['adm-existing-dev-0'],
        },
      ],
    };
    const verifyResult = verifyAdmissionAIRefinedResponse(aiFabricatedResponse, facts, 'Mantém CVC em subclávia direita já presente na admissão.');
    const passed = verifyResult.approved === false && verifyResult.details.existingVsInstalledDevicesLock.passed === false;
    results.push({
      id: 'ADM-020',
      name: 'Bloqueio de dispositivo existente transformado em instalado',
      passed,
      message: passed ? 'Tentativa de transformar dispositivo prévio em procedimento realizado foi rejeitada.' : 'Falha no ExistingVsInstalledDevicesLock.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-020', name: 'Bloqueio de dispositivo existente transformado em instalado', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-001: Sedado + queixa direta
  // ==========================================
  try {
    const form: any = {
      neurological: { consciousnessLevel: 'Sedado' },
      reportedInformation: { informationSource: 'Paciente', complaints: 'Com queixa', complaintsDetails: 'cefaleia' },
    };
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-001');
    results.push({
      id: 'ADM-CONS-001',
      name: 'Inconsistência: Sedado + queixa direta',
      passed,
      message: passed ? 'Alerta ADM-CONS-001 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-001', name: 'Inconsistência: Sedado + queixa direta', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-002: Glasgow 7 + deambulação
  // ==========================================
  try {
    const form: any = {
      neurological: { glasgowScore: 7 },
      mobility: { condition: 'Deambula sem auxílio' },
    };
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-002');
    results.push({
      id: 'ADM-CONS-002',
      name: 'Inconsistência: Glasgow 7 + deambulação',
      passed,
      message: passed ? 'Alerta ADM-CONS-002 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-002', name: 'Inconsistência: Glasgow 7 + deambulação', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-003: VMI + deambulação
  // ==========================================
  try {
    const form = {
      respiratory: { respiratorySupport: 'VMI' },
      mobility: { condition: 'Deambula com auxílio' },
    } as any;
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-003');
    results.push({
      id: 'ADM-CONS-003',
      name: 'Inconsistência: VMI + deambulação',
      passed,
      message: passed ? 'Alerta ADM-CONS-003 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-003', name: 'Inconsistência: VMI + deambulação', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-004: Dispositivo existente duplicado em instalado
  // ==========================================
  try {
    const form = {
      existingDevices: { list: [{ type: 'AVP', location: 'MSD' }] },
      installedDevices: { installedInAdmission: 'Sim', list: [{ type: 'AVP', location: 'MSD' }] },
    } as any;
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-004');
    results.push({
      id: 'ADM-CONS-004',
      name: 'Inconsistência: Dispositivo duplicado em existente e instalado',
      passed,
      message: passed ? 'Alerta ADM-CONS-004 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-004', name: 'Inconsistência: Dispositivo duplicado em existente e instalado', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-005: Maca + deambula sem auxílio
  // ==========================================
  try {
    const form = {
      origin: { arrivalModes: ['Maca'] },
      mobility: { condition: 'Deambula sem auxílio' },
    } as any;
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-005');
    results.push({
      id: 'ADM-CONS-005',
      name: 'Inconsistência: Chegada em maca + deambula sem auxílio',
      passed,
      message: passed ? 'Alerta ADM-CONS-005 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-005', name: 'Inconsistência: Chegada em maca + deambula sem auxílio', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-006: Intercorrência sim sem descrição
  // ==========================================
  try {
    const form = {
      complications: { hasComplication: 'Sim', description: '' },
    } as any;
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-006');
    results.push({
      id: 'ADM-CONS-006',
      name: 'Inconsistência: Intercorrência sem descrição',
      passed,
      message: passed ? 'Alerta ADM-CONS-006 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-006', name: 'Inconsistência: Intercorrência sem descrição', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-007: Comunicação sim sem destinatário
  // ==========================================
  try {
    const form = {
      communications: { communicationNeeded: 'Sim', professionalType: '' },
    } as any;
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.some((a) => a.id === 'ADM-CONS-007');
    results.push({
      id: 'ADM-CONS-007',
      name: 'Inconsistência: Comunicação sem destinatário',
      passed,
      message: passed ? 'Alerta ADM-CONS-007 disparado corretamente.' : 'Alerta não detectado.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-007', name: 'Inconsistência: Comunicação sem destinatário', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-CONS-008: Caso consistente sem alertas
  // ==========================================
  try {
    const form = {
      neurological: { consciousnessLevel: 'Consciente', orientation: 'Orientado em tempo e espaço', glasgowScore: 15 },
      mobility: { condition: 'Deambula sem auxílio' },
      respiratory: { respiratorySupport: 'Ar ambiente' },
      complications: { hasComplication: 'Não' },
      communications: { communicationNeeded: 'Não' },
    } as any;
    const alerts = validateAdmissionClinicalConsistency(form);
    const passed = alerts.length === 0;
    results.push({
      id: 'ADM-CONS-008',
      name: 'Validação consistente sem falsos alertas',
      passed,
      message: passed ? 'Nenhum alerta indevido disparado para dados consistentes.' : 'Falsos alertas detectados.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-CONS-008', name: 'Validação consistente sem falsos alertas', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-001: Formulário inicial limpo (20 seções not_started)
  // ==========================================
  try {
    const initialForm = createInitialAdmissionForm();
    const statuses = getAdmissionSectionStatuses(initialForm);
    const passed = statuses.length === 20 && statuses.every((s) => s === 'not_started');
    results.push({
      id: 'ADM-UI-001',
      name: 'Formulário inicial com 20 seções não iniciadas',
      passed,
      message: passed ? 'Todas as 20 seções iniciam como not_started.' : 'Alguma seção iniciou com status incorreto.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-001', name: 'Formulário inicial com 20 seções não iniciadas', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-002: Preenchimento do contexto atualiza status
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    form.context.moment = 'Admito/Recebo paciente';
    form.context.location = 'Sala Vermelha';
    const status = calculateAdmissionSectionStatus(form, 0);
    const passed = status === 'completed';
    results.push({
      id: 'ADM-UI-002',
      name: 'Cálculo de status de seção de contexto',
      passed,
      message: passed ? 'Seção de contexto marcada como completed quando preenchida.' : 'Falha no cálculo de status.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-002', name: 'Cálculo de status de seção de contexto', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-003: Nenhuma opção clínica pré-selecionada na inicialização
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    const passed =
      form.context.moment === '' &&
      form.context.location === '' &&
      form.origin.patientOrigin === '' &&
      form.origin.arrivalModes.length === 0 &&
      form.identification.wristbandChecked === '' &&
      form.neurological.consciousnessLevel === '' &&
      form.respiratory.respiratorySupport === '';
    results.push({
      id: 'ADM-UI-003',
      name: 'Ausência de pré-seleções clínicas no formulário inicial',
      passed,
      message: passed ? 'Nenhum campo clínico vem previamente selecionado.' : 'Campos pré-selecionados encontrados.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-003', name: 'Ausência de pré-seleções clínicas no formulário inicial', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-004: Normalização limpa tolerância quando banho é 'Não'
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    form.hygiene.bathPerformed = 'Não';
    form.hygiene.tolerance = 'Boa';
    const normalized = normalizeAdmissionForm(form);
    const passed = normalized.hygiene.tolerance === '';
    results.push({
      id: 'ADM-UI-004',
      name: 'Normalização: Banho Não limpa tolerância',
      passed,
      message: passed ? 'Tolerância ao banho limpa com sucesso.' : 'Tolerância indevida mantida.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-004', name: 'Normalização: Banho Não limpa tolerância', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-005: Normalização limpa intercorrência quando hasComplication é 'Não'
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    form.complications.hasComplication = 'Não';
    form.complications.description = 'episódio de náusea';
    form.complications.time = '10:00';
    const normalized = normalizeAdmissionForm(form);
    const passed = normalized.complications.description === '' && normalized.complications.time === '';
    results.push({
      id: 'ADM-UI-005',
      name: 'Normalização: Intercorrência Não limpa detalhes',
      passed,
      message: passed ? 'Detalhes de intercorrência limpos com sucesso.' : 'Detalhes indevidos mantidos.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-005', name: 'Normalização: Intercorrência Não limpa detalhes', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-006: Normalização limpa comunicação quando communicationNeeded é 'Não'
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    form.communications.communicationNeeded = 'Não';
    form.communications.professionalType = 'Equipe médica';
    const normalized = normalizeAdmissionForm(form);
    const passed = normalized.communications.professionalType === '';
    results.push({
      id: 'ADM-UI-006',
      name: 'Normalização: Comunicação Não limpa detalhes',
      passed,
      message: passed ? 'Detalhes de comunicação limpos com sucesso.' : 'Detalhes indevidos mantidos.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-006', name: 'Normalização: Comunicação Não limpa detalhes', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-007: Normalização limpa lesões quando pele é 'Íntegra'
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    form.skin.integrity = 'Íntegra';
    form.skin.lesionLocation = 'calcâneo';
    const normalized = normalizeAdmissionForm(form);
    const passed = normalized.skin.lesionLocation === '';
    results.push({
      id: 'ADM-UI-007',
      name: 'Normalização: Pele Íntegra limpa lesão',
      passed,
      message: passed ? 'Detalhes de lesão limpos com sucesso.' : 'Detalhes de lesão mantidos.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-007', name: 'Normalização: Pele Íntegra limpa lesão', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-008: Normalização limpa lista de instalados quando installedInAdmission é 'Não'
  // ==========================================
  try {
    const form = createInitialAdmissionForm();
    form.installedDevices.installedInAdmission = 'Não';
    form.installedDevices.list = [{ id: '1', type: 'AVP' } as any];
    const normalized = normalizeAdmissionForm(form);
    const passed = normalized.installedDevices.list.length === 0;
    results.push({
      id: 'ADM-UI-008',
      name: 'Normalização: Dispositivos instalados Não limpa lista',
      passed,
      message: passed ? 'Lista de dispositivos instalados limpa com sucesso.' : 'Dispositivos indevidos mantidos.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-008', name: 'Normalização: Dispositivos instalados Não limpa lista', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-009: Lista de status de seções contém exatamente 20 elementos válidos
  // ==========================================
  try {
    const sample = createSampleAdmissionForm();
    const statuses = getAdmissionSectionStatuses(sample);
    const validValues = ['completed', 'partial', 'not_started'];
    const passed = statuses.length === 20 && statuses.every((s) => validValues.includes(s));
    results.push({
      id: 'ADM-UI-009',
      name: 'Array de status das 20 seções válido',
      passed,
      message: passed ? 'Array de 20 status calculados perfeitamente.' : 'Status de seções inválido.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-009', name: 'Array de status das 20 seções válido', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-010: Fatos autorizados tratam valores vazios sem exceções
  // ==========================================
  try {
    const emptyForm = createInitialAdmissionForm();
    const facts = buildAuthorizedAdmissionFacts(emptyForm);
    const passed = facts !== null && typeof facts === 'object';
    results.push({
      id: 'ADM-UI-010',
      name: 'Construção de fatos autorizados segura para formulário vazio',
      passed,
      message: passed ? 'Fatos autorizados gerados com segurança sem exceptions.' : 'Exceção ao gerar fatos.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-010', name: 'Construção de fatos autorizados segura para formulário vazio', passed: false, message: e.message });
  }

  // ==========================================
  // ADM-UI-011: Amostra padrão preenche todas as 20 seções ativamente
  // ==========================================
  try {
    const sample = createSampleAdmissionForm();
    const statuses = getAdmissionSectionStatuses(sample);
    const passed = statuses.every((s) => s === 'completed' || s === 'in_progress');
    results.push({
      id: 'ADM-UI-011',
      name: 'Amostra de admissão cobre as 20 seções com sucesso',
      passed,
      message: passed ? 'Amostra cobre 100% das seções de forma preenchida/em progresso.' : 'Alguma seção da amostra não iniciou.',
    });
  } catch (e: any) {
    results.push({ id: 'ADM-UI-011', name: 'Amostra de admissão cobre as 20 seções com sucesso', passed: false, message: e.message });
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  };
}
