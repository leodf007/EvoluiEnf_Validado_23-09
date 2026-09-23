import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
  ClinicalArea,
} from './types';
import {
  NurseSoapForm,
  createInitialNurseSoapForm,
} from '../../types/nurseSoap';
import {
  normalizeNurseSoapForm,
  buildAuthorizedNurseSoapFacts,
  validateNurseSoapConsistency,
  auditNurseSoapNarrative,
} from '../nurseSoapFactBuilder';
import { buildNurseSoapNote } from '../nurseSoapBuilder';
import { verifyNurseSoapAIRefinedResponse } from '../nurseSoapPostGenerationVerifier';

export const NURSE_SOAP_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: false,
  supportsCardiovascularAssessment: true,
  supportsNutrition: true,
  supportsEliminations: true,
  supportsDevices: true,
  supportsSkinAssessment: true,
  supportsInfusions: true,
  supportsRiskAssessment: true,
  supportsResponseToCare: true,
  supportsNurseClinicalSynthesis: true,
};

export const NURSE_SOAP_DEFINITION: ClinicalModuleDefinition = {
  id: 'NURSE_SOAP',
  moduleId: 'nurse_soap',
  professionalRole: 'nurse',
  documentType: 'SOAP',
  clinicalArea: ClinicalArea.ALL,
  title: 'Registro SOAP de Enfermagem',
  capabilities: NURSE_SOAP_CAPABILITIES,
  status: 'available',
  sections: [
    {
      id: 'sec-soap-context',
      title: 'Contexto do Registro',
      description: 'Data, horário, unidade e consultório/leito',
      componentId: 'SoapContextInputs',
      order: 1,
      optional: false,
    },
    {
      id: 'sec-soap-identification',
      title: 'Identificação da Avaliação',
      description: 'Tipo de atendimento e motivo da consulta',
      componentId: 'SoapIdentificationInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-soap-subjective',
      title: 'S - Subjetivo',
      description: 'Queixa principal, fonte e sintomas relatados',
      componentId: 'SoapSubjectiveInputs',
      order: 3,
      optional: false,
    },
    {
      id: 'sec-soap-objective',
      title: 'O - Objetivo',
      description: 'Sinais vitais, exame físico, dispositivos e medicamentos',
      componentId: 'SoapObjectiveInputs',
      order: 4,
      optional: false,
      capabilityRequirement: 'supportsVitalSigns',
    },
    {
      id: 'sec-soap-assessment',
      title: 'Avaliação Clínica do Enfermeiro',
      description: 'Síntese clínica manual exclusiva do enfermeiro',
      componentId: 'SoapAssessmentInputs',
      order: 5,
      optional: false,
      capabilityRequirement: 'supportsNurseClinicalSynthesis',
    },
    {
      id: 'sec-soap-diagnoses',
      title: 'Diagnósticos de Enfermagem Manuais',
      description: 'Diagnósticos de enfermagem e raciocínio clínico',
      componentId: 'SoapDiagnosesInputs',
      order: 6,
      optional: true,
    },
    {
      id: 'sec-soap-plan',
      title: 'P - Plano Assistencial',
      description: 'Cuidados, monitorização, orientações e avaliações',
      componentId: 'SoapPlanInputs',
      order: 7,
      optional: false,
    },
    {
      id: 'sec-soap-interventions',
      title: 'Intervenções Registradas',
      description: 'Ações de enfermagem já executadas',
      componentId: 'SoapInterventionsInputs',
      order: 8,
      optional: true,
    },
    {
      id: 'sec-soap-response',
      title: 'Resposta Observada',
      description: 'Tolerância e resposta do paciente aos cuidados',
      componentId: 'SoapResponseInputs',
      order: 9,
      optional: true,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-soap-additional',
      title: 'Informações Adicionais',
      description: 'Observações pertinentes, encaminhamentos e pendências',
      componentId: 'SoapAdditionalInputs',
      order: 10,
      optional: true,
    },
  ],
};

export const NURSE_SOAP_CONTRACT: ClinicalModuleContract<
  NurseSoapForm,
  NurseSoapForm,
  any
> = {
  definition: NURSE_SOAP_DEFINITION,
  route: 'nurse-soap',
  formComponentId: 'NurseSoapFormScreen',
  createInitialForm: createInitialNurseSoapForm,
  normalizer: normalizeNurseSoapForm,
  factsBuilder: buildAuthorizedNurseSoapFacts,
  deterministicBuilder: (norm: NurseSoapForm) => {
    const facts = buildAuthorizedNurseSoapFacts(norm);
    return buildNurseSoapNote(facts);
  },
  consistencyValidator: (form: NurseSoapForm) => {
    const result = validateNurseSoapConsistency(form);
    return [
      ...result.errors.map((msg) => ({ severity: 'error', message: msg })),
      ...result.warnings.map((msg) => ({ severity: 'warning', message: msg })),
    ];
  },
  narrativeAuditor: (traces: any, facts: any) => {
    const narrative = Array.isArray(traces)
      ? traces.map((t: any) => t.text || '').join(' ')
      : String(traces);
    const auditRes = auditNurseSoapNarrative(narrative, facts);
    return {
      passed: auditRes.passed,
      unauthorizedSegments: auditRes.untraceableSegments,
    };
  },
  postGenerationVerifier: (rawResponse, facts, canonical) => {
    const vResult = verifyNurseSoapAIRefinedResponse(rawResponse, facts, canonical);
    return {
      approved: vResult.approved,
      rejectionReasons: vResult.reasons,
    };
  },
  aiRefinementPolicy: {
    common: true,
    specificRole: 'nurse',
  },
};
