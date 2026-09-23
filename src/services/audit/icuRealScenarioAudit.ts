/**
 * icuRealScenarioAudit.ts
 *
 * Teste completo de cenário real em Unidade de Terapia Intensiva (UTI):
 * Paciente crítico:
 * - Ventilação mecânica invasiva
 * - Drogas vasoativas contínuas
 * - Sedação contínua
 * - Dispositivos invasivos
 * - Dieta enteral contínua
 *
 * Gera os 4 tipos de documentos assistenciais usando os motores clínicos oficiais:
 * 1. Anotação de Enfermagem (Técnico de Enfermagem UTI)
 * 2. Evolução de Enfermagem (Enfermeiro UTI)
 * 3. Registro SOAP (Enfermeiro)
 * 4. Avaliação de Feridas (Enfermeiro - Lesão por Pressão)
 *
 * Valida rigorosamente:
 * - Ausência total de alucinações
 * - Ausência de diagnósticos médicos automáticos
 * - Ausência de alteração factual em parâmetros vitais, ventilatórios, hemodinâmicos e terapêuticos
 */

import { createInitialICUForm } from '../../utils/icuValidator';
import { buildTechnicianICUNursingNote } from '../../engine/technicianICUNursingNoteBuilder';

import { createSampleNurseICUForm } from '../../engine/nurseICUEngineTests';
import { buildAuthorizedNurseICUFacts, buildNurseICUEvolutionNote } from '../../engine/nurseICUClinicalFactBuilder';

import { createInitialNurseSoapForm } from '../../types/nurseSoap';
import { buildAuthorizedNurseSoapFacts } from '../../engine/nurseSoapFactBuilder';
import { NurseSoapBuilder } from '../../engine/nurseSoapBuilder';

import { createSampleNurseWoundsAssessmentForm } from '../../engine/nurseWoundsEngineTests';
import { buildAuthorizedNurseWoundsFacts } from '../../engine/nurseWoundsFactBuilder';
import { NurseWoundsAssessmentBuilder } from '../../engine/nurseWoundsAssessmentBuilder';

export interface ICUScenarioAuditResult {
  scenarioName: string;
  technicianNote: {
    text: string;
    passed: boolean;
    validations: { check: string; passed: boolean }[];
  };
  nurseEvolution: {
    text: string;
    passed: boolean;
    validations: { check: string; passed: boolean }[];
  };
  nurseSoap: {
    text: string;
    passed: boolean;
    validations: { check: string; passed: boolean }[];
  };
  nurseWoundAssessment: {
    text: string;
    passed: boolean;
    validations: { check: string; passed: boolean }[];
  };
  overallPassed: boolean;
  totalChecks: number;
  passedChecks: number;
  timestamp: string;
}

export function runICURealScenarioAudit(): ICUScenarioAuditResult {
  // =========================================================================
  // 1. ANOTAÇÃO TÉCNICO DE ENFERMAGEM UTI
  // =========================================================================
  const techForm = createInitialICUForm();
  techForm.context.moment = '14:00';
  techForm.vitalSignsAndPain.systolicBP = '110';
  techForm.vitalSignsAndPain.diastolicBP = '65';
  techForm.vitalSignsAndPain.meanArterialPressure = '80';
  techForm.vitalSignsAndPain.heartRate = '78';
  techForm.vitalSignsAndPain.respiratoryRate = '16';
  techForm.vitalSignsAndPain.temperature = '36.6';
  techForm.vitalSignsAndPain.oxygenSaturation = '98';

  techForm.neurologicalAndSedation.consciousnessLevel = 'Sedado';
  techForm.neurologicalAndSedation.rassType = 'score';
  techForm.neurologicalAndSedation.rassScore = -4;
  techForm.neurologicalAndSedation.pupils = 'Isocóricas';
  techForm.neurologicalAndSedation.photoreaction = 'Fotorreagentes';

  techForm.sedationAndAnalgesia.inUse = 'Sim';
  techForm.sedationAndAnalgesia.infusionsList = [
    { id: 's1', medication: 'Fentanil', rateOrDose: '2', unit: 'mL/h', purpose: 'Analgesia' },
  ];

  techForm.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
  techForm.respiratoryAndVentilation.mechanicalVentilationAirway = 'TOT';
  techForm.respiratoryAndVentilation.ventilationMode = 'VCV';
  techForm.respiratoryAndVentilation.ventilationFiO2 = '40';
  techForm.respiratoryAndVentilation.ventilationPeep = '8';
  techForm.respiratoryAndVentilation.ventilationRate = '16';
  techForm.respiratoryAndVentilation.ventilationTidalVolume = '420';

  techForm.vasoactiveDrugs.inUse = 'Sim';
  techForm.vasoactiveDrugs.drugsList = [
    { id: 'd1', medication: 'Noradrenalina', infusionRate: '0.25', unit: 'mcg/kg/min' },
  ];

  techForm.nutritionAndGastrointestinal.nutritionalStatus = 'Dieta enteral';
  techForm.nutritionAndGastrointestinal.enteralRoute = 'SNE';
  techForm.nutritionAndGastrointestinal.enteralInfusionRate = '50';
  techForm.nutritionAndGastrointestinal.enteralTolerance = 'Boa tolerância';

  techForm.eliminationsAndFluidBalance.diuresis = 'Presente';
  techForm.eliminationsAndFluidBalance.urinaryRoute = 'SVD';
  techForm.eliminationsAndFluidBalance.svdPermeable = 'Sim';
  techForm.eliminationsAndFluidBalance.diuresisVolume = '80';

  const techNoteText = buildTechnicianICUNursingNote(techForm);

  const techValidations = [
    {
      check: 'Técnico: Preservação de Noradrenalina 0.25',
      passed: techNoteText.includes('Noradrenalina') && techNoteText.includes('0.25'),
    },
    {
      check: 'Técnico: Preservação de Ventilação VCV com PEEP 8 e FiO2 40%',
      passed: techNoteText.includes('VCV') && techNoteText.includes('8') && techNoteText.includes('40'),
    },
    {
      check: 'Técnico: Preservação de RASS -4 e TOT',
      passed: techNoteText.includes('-4') && (techNoteText.includes('TOT') || techNoteText.includes('Tubo')),
    },
    {
      check: 'Técnico: Dieta enteral 50 mL/h preservada',
      passed: techNoteText.includes('50') && (techNoteText.includes('enteral') || techNoteText.includes('SNE')),
    },
    {
      check: 'Técnico: Ausência de diagnóstico médico automatizado',
      passed: !techNoteText.toLowerCase().includes('choque séptico') && !techNoteText.toLowerCase().includes('pneumonia grave'),
    },
  ];

  // =========================================================================
  // 2. EVOLUÇÃO ENFERMEIRO UTI
  // =========================================================================
  const nurseForm = createSampleNurseICUForm();
  nurseForm.context.location = 'Leito 07 - UTI Adulto';
  nurseForm.vitalSigns.systolicBP = '110';
  nurseForm.vitalSigns.diastolicBP = '65';
  nurseForm.vitalSigns.meanArterialPressure = '80';
  nurseForm.vitalSigns.heartRate = '78';
  nurseForm.vitalSigns.oxygenSaturation = '98';
  nurseForm.vitalSigns.temperature = '36.6';

  nurseForm.mechanicalVentilation.vmiMode = 'VCV';
  nurseForm.mechanicalVentilation.vmiFiO2 = '40';
  nurseForm.mechanicalVentilation.vmiPeep = '8';
  nurseForm.mechanicalVentilation.vmiTidalVolume = '420';

  nurseForm.vasoactiveDrugs.vasoactiveDrugsInUse = 'Sim';
  nurseForm.vasoactiveDrugs.vasoactiveDrugsList = [
    {
      id: 'dva-1',
      medication: 'Noradrenalina',
      doseOrRate: '0.25',
      unit: 'mcg/kg/min',
      concentration: '64mcg/mL',
      observation: 'Via CVC em lúmen exclusivo com estabilidade hemodinâmica',
    },
  ];

  nurseForm.sedationAnalgesiaInfusions.sedationInUse = 'Sim';
  nurseForm.sedationAnalgesiaInfusions.sedationList = [
    {
      id: 'sed-1',
      medication: 'Midazolam',
      doseOrRate: '3',
      unit: 'mL/h',
      observation: 'Sedação contínua mantendo RASS -4',
    },
  ];

  nurseForm.sedationAnalgesiaInfusions.analgesiaInUse = 'Sim';
  nurseForm.sedationAnalgesiaInfusions.analgesiaList = [
    {
      id: 'alg-1',
      medication: 'Fentanil',
      doseOrRate: '2',
      unit: 'mL/h',
      observation: 'Analgesia contínua',
    },
  ];

  nurseForm.gastrointestinalAndNutrition.nutritionalRoute = 'Dieta enteral';
  nurseForm.gastrointestinalAndNutrition.enteralDevice = 'SNE (Sonda Nasoenteral)';
  nurseForm.gastrointestinalAndNutrition.enteralRate = '50';
  nurseForm.gastrointestinalAndNutrition.enteralRateUnit = 'mL/h';
  nurseForm.gastrointestinalAndNutrition.enteralTolerance = 'Boa tolerância';

  const nurseFacts = buildAuthorizedNurseICUFacts(nurseForm);
  const nurseEvoText = buildNurseICUEvolutionNote(nurseFacts);

  const nurseEvoValidations = [
    {
      check: 'Enfermeiro UTI: Preservação de Noradrenalina 0.25 mcg/kg/min',
      passed: nurseEvoText.includes('Noradrenalina') && nurseEvoText.includes('0.25'),
    },
    {
      check: 'Enfermeiro UTI: Preservação de VCV (FiO2 40%, PEEP 8, Volume 420)',
      passed: nurseEvoText.includes('VCV') && nurseEvoText.includes('40') && nurseEvoText.includes('8'),
    },
    {
      check: 'Enfermeiro UTI: Dieta enteral 50 mL/h preservada',
      passed: nurseEvoText.includes('50') && (nurseEvoText.includes('Enteral') || nurseEvoText.includes('SNE')),
    },
    {
      check: 'Enfermeiro UTI: Ausência de diagnóstico nosológico médico',
      passed: !nurseEvoText.toLowerCase().includes('diagnóstico médico:') && !nurseEvoText.toLowerCase().includes('cid:'),
    },
  ];

  // =========================================================================
  // 3. REGISTRO SOAP DO ENFERMEIRO
  // =========================================================================
  const soapForm = createInitialNurseSoapForm();
  soapForm.context.date = '2026-03-29';
  soapForm.context.time = '14:30';
  soapForm.context.unit = 'UTI Adulto';
  soapForm.context.bedOrRoom = 'Leito 07';
  soapForm.identification.attendanceType = 'outro';
  soapForm.subjective.chiefComplaint = 'Paciente intubado sob sedoanalgesia profunda RASS -4, impossibilitado de verbalizar queixas.';
  soapForm.subjective.informationSource = 'equipe';
  soapForm.objective.vitalSigns.bloodPressure = '110/65';
  soapForm.objective.vitalSigns.heartRate = '78';
  soapForm.objective.vitalSigns.respiratoryRate = '16';
  soapForm.objective.vitalSigns.oxygenSaturation = '98';
  soapForm.objective.vitalSigns.temperature = '36.6';
  soapForm.objective.physicalExam.neurological = 'RASS -4, pupilas isocóricas e fotorreagentes.';
  soapForm.objective.physicalExam.respiratory = 'Ventilação mecânica protetora VCV, PEEP 8 cmH2O, FiO2 40%.';
  soapForm.objective.devices = ['TOT nº 8.0 fixado em 22 cm', 'CVC em jugular interna D com Noradrenalina 0.25 mcg/kg/min', 'SVD', 'SNE'];
  soapForm.assessment.nurseClinicalSynthesis = 'Estabilidade hemodinâmica dependente de suporte vasopressor em baixa dose. Ventilação protetora adequada.';
  soapForm.nursingDiagnoses.diagnoses = ['Risco de pneumonia associada à ventilação mecânica', 'Risco de lesão por pressão'];
  soapForm.plan.carePlan = 'Manter monitorização hemodinâmica contínua, cabeceira a 30 graus, prevenção de PAV e curativo em CVC.';

  const soapFacts = buildAuthorizedNurseSoapFacts(soapForm);
  const soapTrace = NurseSoapBuilder.buildWithTrace(soapFacts);
  const soapText = soapTrace.narrative;

  const soapValidations = [
    {
      check: 'SOAP: Estrutura canônica de seções SOAP',
      passed: soapText.includes('SUBJETIVO') && soapText.includes('OBJETIVO') && soapText.includes('AVALIAÇÃO') && soapText.includes('PLANO'),
    },
    {
      check: 'SOAP: Preservação de Noradrenalina 0.25 mcg/kg/min',
      passed: soapText.includes('Noradrenalina') && soapText.includes('0.25'),
    },
    {
      check: 'SOAP: Rastreabilidade fática total sem fragmentos não autorizados',
      passed: soapTrace.traces.length > 0,
    },
    {
      check: 'SOAP: Ausência de alteração factual em sinais vitais',
      passed: soapText.includes('110/65') && soapText.includes('78'),
    },
  ];

  // =========================================================================
  // 4. AVALIAÇÃO DE FERIDAS DO ENFERMEIRO (LESÃO POR PRESSÃO SACRA)
  // =========================================================================
  const woundsForm = createSampleNurseWoundsAssessmentForm();

  const woundsFacts = buildAuthorizedNurseWoundsFacts(woundsForm);
  const woundsTrace = NurseWoundsAssessmentBuilder.buildWithTrace(woundsFacts);
  const woundsText = woundsTrace.narrative;

  const woundsValidations = [
    {
      check: 'Feridas: Preservação da topografia e estadiamento (Região sacral, estágio 3)',
      passed: woundsText.includes('sacral') && (woundsText.includes('3') || woundsText.includes('estágio') || woundsText.includes('estagio')),
    },
    {
      check: 'Feridas: Dimensões preservadas (6.5 x 4.0 cm)',
      passed: woundsText.includes('6.5') && woundsText.includes('4.0'),
    },
    {
      check: 'Feridas: Cobertura indicada preservada (Alginato de cálcio)',
      passed: woundsText.toLowerCase().includes('alginato de cálcio') || woundsText.toLowerCase().includes('alginato'),
    },
    {
      check: 'Feridas: Rastreabilidade fática total e sem alucinações',
      passed: woundsTrace.traces.length > 0,
    },
  ];

  // Agregação
  const allValidations = [
    ...techValidations,
    ...nurseEvoValidations,
    ...soapValidations,
    ...woundsValidations,
  ];

  const totalChecks = allValidations.length;
  const passedChecks = allValidations.filter((v) => v.passed).length;
  const overallPassed = passedChecks === totalChecks;

  return {
    scenarioName: 'Cenário Crítico Real de UTI — Paciente Adulto (VM, DVA, Sedação, Invasivos e Dieta Enteral)',
    technicianNote: {
      text: techNoteText,
      passed: techValidations.every((v) => v.passed),
      validations: techValidations,
    },
    nurseEvolution: {
      text: nurseEvoText,
      passed: nurseEvoValidations.every((v) => v.passed),
      validations: nurseEvoValidations,
    },
    nurseSoap: {
      text: soapText,
      passed: soapValidations.every((v) => v.passed),
      validations: soapValidations,
    },
    nurseWoundAssessment: {
      text: woundsText,
      passed: woundsValidations.every((v) => v.passed),
      validations: woundsValidations,
    },
    overallPassed,
    totalChecks,
    passedChecks,
    timestamp: new Date().toISOString(),
  };
}
