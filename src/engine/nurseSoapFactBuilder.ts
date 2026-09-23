import {
  NurseSoapForm,
  createInitialNurseSoapForm,
} from '../types/nurseSoap';
import {
  AuthorizedClinicalFacts,
  ClinicalFact,
} from './types';
import { AuthorizedDeviceRegistry } from './authorizedDeviceRegistry';
import { AuthorizedMedicationRegistry } from './authorizedMedicationRegistry';

/**
 * Normalizes user input in NurseSoapForm:
 * - Trims strings and removes excessive internal whitespace
 * - Strips units from vital signs (e.g., "120/80 mmHg" -> "120/80", "98%" -> "98", "36,5°C" -> "36.5")
 * - Sanitizes lists of devices and medications
 */
export function normalizeNurseSoapForm(raw: NurseSoapForm): NurseSoapForm {
  const base = raw || createInitialNurseSoapForm();

  const cleanStr = (s?: string) => (s ? s.trim() : '');
  const cleanVital = (s?: string) => {
    if (!s) return '';
    return s
      .replace(/mmhg|bpm|rpm|%|°c|c|mg\/dl/gi, '')
      .replace(/,/g, '.')
      .trim();
  };

  return {
    context: {
      date: cleanStr(base.context?.date),
      time: cleanStr(base.context?.time),
      unit: cleanStr(base.context?.unit),
      bedOrRoom: cleanStr(base.context?.bedOrRoom),
    },
    identification: {
      attendanceType: base.identification?.attendanceType || 'consulta de enfermagem',
      reasonForVisit: cleanStr(base.identification?.reasonForVisit),
    },
    subjective: {
      chiefComplaint: cleanStr(base.subjective?.chiefComplaint),
      informationSource: base.subjective?.informationSource || 'paciente',
      sourceDetails: cleanStr(base.subjective?.sourceDetails),
      reportedSymptoms: cleanStr(base.subjective?.reportedSymptoms),
      patientPerception: cleanStr(base.subjective?.patientPerception),
      familyInformation: cleanStr(base.subjective?.familyInformation),
    },
    objective: {
      vitalSigns: {
        bloodPressure: cleanVital(base.objective?.vitalSigns?.bloodPressure),
        meanArterialPressure: cleanVital(base.objective?.vitalSigns?.meanArterialPressure),
        heartRate: cleanVital(base.objective?.vitalSigns?.heartRate),
        respiratoryRate: cleanVital(base.objective?.vitalSigns?.respiratoryRate),
        oxygenSaturation: cleanVital(base.objective?.vitalSigns?.oxygenSaturation),
        temperature: cleanVital(base.objective?.vitalSigns?.temperature),
        bloodGlucose: cleanVital(base.objective?.vitalSigns?.bloodGlucose),
      },
      physicalExam: {
        neurological: cleanStr(base.objective?.physicalExam?.neurological),
        respiratory: cleanStr(base.objective?.physicalExam?.respiratory),
        cardiovascular: cleanStr(base.objective?.physicalExam?.cardiovascular),
        gastrointestinal: cleanStr(base.objective?.physicalExam?.gastrointestinal),
        urinary: cleanStr(base.objective?.physicalExam?.urinary),
        skin: cleanStr(base.objective?.physicalExam?.skin),
      },
      devices: Array.isArray(base.objective?.devices)
        ? base.objective.devices.map(cleanStr).filter(Boolean)
        : [],
      deviceDetails: cleanStr(base.objective?.deviceDetails),
      medicationsInUse: Array.isArray(base.objective?.medicationsInUse)
        ? base.objective.medicationsInUse.map(cleanStr).filter(Boolean)
        : [],
      medicationDetails: cleanStr(base.objective?.medicationDetails),
    },
    assessment: {
      nurseClinicalSynthesis: cleanStr(base.assessment?.nurseClinicalSynthesis),
    },
    nursingDiagnoses: {
      diagnoses: Array.isArray(base.nursingDiagnoses?.diagnoses)
        ? base.nursingDiagnoses.diagnoses.map(cleanStr).filter(Boolean)
        : [],
      diagnosesText: cleanStr(base.nursingDiagnoses?.diagnosesText),
      clinicalReasoning: cleanStr(base.nursingDiagnoses?.clinicalReasoning),
    },
    plan: {
      carePlan: cleanStr(base.plan?.carePlan),
      plannedMonitoring: cleanStr(base.plan?.plannedMonitoring),
      patientOrientations: cleanStr(base.plan?.patientOrientations),
      scheduledEvaluations: cleanStr(base.plan?.scheduledEvaluations),
    },
    interventions: {
      executedInterventions: Array.isArray(base.interventions?.executedInterventions)
        ? base.interventions.executedInterventions.map(cleanStr).filter(Boolean)
        : [],
      interventionDetails: cleanStr(base.interventions?.interventionDetails),
    },
    responseToCare: {
      observedResponse: cleanStr(base.responseToCare?.observedResponse),
    },
    additionalInfo: {
      notes: cleanStr(base.additionalInfo?.notes),
    },
  };
}

/**
 * Builds authorized clinical facts structure from normalized Nurse SOAP form data.
 */
export function buildAuthorizedNurseSoapFacts(norm: NurseSoapForm): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {};

  const addFact = (
    category: string,
    id: string,
    name: string,
    value: any,
    canonicalText?: string
  ) => {
    if (!facts[category]) {
      facts[category] = [];
    }
    facts[category].push({
      id,
      category,
      sourceField: name,
      value,
      canonicalText: canonicalText || (typeof value === 'string' ? value : JSON.stringify(value)),
    });
  };

  // 1. Context & Identification
  if (norm.context.date) addFact('context', 'fact-soap-date', 'Data da avaliação', norm.context.date, `Data: ${norm.context.date}`);
  if (norm.context.time) addFact('context', 'fact-soap-time', 'Horário da avaliação', norm.context.time, `Horário: ${norm.context.time}`);
  if (norm.context.unit) addFact('context', 'fact-soap-unit', 'Unidade de atendimento', norm.context.unit, `Unidade: ${norm.context.unit}`);
  if (norm.context.bedOrRoom) addFact('context', 'fact-soap-room', 'Leito/Consultório', norm.context.bedOrRoom, `Local/Consultório: ${norm.context.bedOrRoom}`);
  if (norm.identification.attendanceType) {
    addFact('identification', 'fact-soap-attendance-type', 'Tipo de atendimento', norm.identification.attendanceType, `Tipo de atendimento: ${norm.identification.attendanceType}`);
  }
  if (norm.identification.reasonForVisit) {
    addFact('identification', 'fact-soap-reason', 'Motivo do atendimento', norm.identification.reasonForVisit, `Motivo: ${norm.identification.reasonForVisit}`);
  }

  // 2. S - Subjetivo
  if (norm.subjective.chiefComplaint) {
    addFact('subjective', 'fact-soap-complaint', 'Queixa principal', norm.subjective.chiefComplaint, `Queixa principal: ${norm.subjective.chiefComplaint}`);
  }
  if (norm.subjective.informationSource) {
    const srcDetail = norm.subjective.sourceDetails ? ` (${norm.subjective.sourceDetails})` : '';
    addFact('subjective', 'fact-soap-source', 'Fonte da informação', norm.subjective.informationSource, `Fonte da informação: ${norm.subjective.informationSource}${srcDetail}`);
  }
  if (norm.subjective.reportedSymptoms) {
    addFact('subjective', 'fact-soap-symptoms', 'Sintomas relatados', norm.subjective.reportedSymptoms, `Sintomas relatados: ${norm.subjective.reportedSymptoms}`);
  }
  if (norm.subjective.patientPerception) {
    addFact('subjective', 'fact-soap-perception', 'Percepção do paciente', norm.subjective.patientPerception, `Percepção do paciente: ${norm.subjective.patientPerception}`);
  }
  if (norm.subjective.familyInformation) {
    addFact('subjective', 'fact-soap-family', 'Informações da família', norm.subjective.familyInformation, `Informações familiares: ${norm.subjective.familyInformation}`);
  }

  // 3. O - Objetivo (Sinais vitais)
  const vs = norm.objective.vitalSigns;
  if (vs.bloodPressure) addFact('vitalSigns', 'fact-soap-bp', 'Pressão arterial', vs.bloodPressure, `PA: ${vs.bloodPressure} mmHg`);
  if (vs.meanArterialPressure) addFact('vitalSigns', 'fact-soap-map', 'PAM aferida', vs.meanArterialPressure, `PAM aferida: ${vs.meanArterialPressure} mmHg`);
  if (vs.heartRate) addFact('vitalSigns', 'fact-soap-hr', 'Frequência cardíaca', vs.heartRate, `FC: ${vs.heartRate} bpm`);
  if (vs.respiratoryRate) addFact('vitalSigns', 'fact-soap-rr', 'Frequência respiratória', vs.respiratoryRate, `FR: ${vs.respiratoryRate} rpm`);
  if (vs.oxygenSaturation) addFact('vitalSigns', 'fact-soap-spo2', 'Saturação de oxigênio', vs.oxygenSaturation, `SpO2: ${vs.oxygenSaturation}%`);
  if (vs.temperature) addFact('vitalSigns', 'fact-soap-temp', 'Temperatura axilar', vs.temperature, `Tax: ${vs.temperature} °C`);
  if (vs.bloodGlucose) addFact('vitalSigns', 'fact-soap-glucose', 'Glicemia capilar', vs.bloodGlucose, `Glicemia: ${vs.bloodGlucose} mg/dL`);

  // O - Exame físico por sistemas
  const pe = norm.objective.physicalExam;
  if (pe.neurological) addFact('physicalExam', 'fact-soap-pe-neuro', 'Exame neurológico', pe.neurological, `Neurológico: ${pe.neurological}`);
  if (pe.respiratory) addFact('physicalExam', 'fact-soap-pe-resp', 'Exame respiratório', pe.respiratory, `Respiratório: ${pe.respiratory}`);
  if (pe.cardiovascular) addFact('physicalExam', 'fact-soap-pe-cardio', 'Exame cardiovascular', pe.cardiovascular, `Cardiovascular: ${pe.cardiovascular}`);
  if (pe.gastrointestinal) addFact('physicalExam', 'fact-soap-pe-gi', 'Exame gastrointestinal', pe.gastrointestinal, `Gastrointestinal: ${pe.gastrointestinal}`);
  if (pe.urinary) addFact('physicalExam', 'fact-soap-pe-uri', 'Exame urinário', pe.urinary, `Urinário: ${pe.urinary}`);
  if (pe.skin) addFact('physicalExam', 'fact-soap-pe-skin', 'Exame tegumentar', pe.skin, `Pele e mucosas: ${pe.skin}`);

  // O - Dispositivos
  if (norm.objective.devices.length > 0) {
    addFact('devices', 'fact-soap-devices', 'Dispositivos invasivos/suporte', norm.objective.devices, `Dispositivos: ${norm.objective.devices.join(', ')}`);
  }
  if (norm.objective.deviceDetails) {
    addFact('devices', 'fact-soap-dev-details', 'Detalhes dos dispositivos', norm.objective.deviceDetails, `Detalhes de dispositivos: ${norm.objective.deviceDetails}`);
  }

  // O - Medicamentos em uso
  if (norm.objective.medicationsInUse.length > 0) {
    addFact('medications', 'fact-soap-meds', 'Medicamentos em uso', norm.objective.medicationsInUse, `Medicamentos em uso: ${norm.objective.medicationsInUse.join(', ')}`);
  }
  if (norm.objective.medicationDetails) {
    addFact('medications', 'fact-soap-med-details', 'Detalhes das medicações', norm.objective.medicationDetails, `Detalhes farmacológicos: ${norm.objective.medicationDetails}`);
  }

  // 4. A - Avaliação
  if (norm.assessment.nurseClinicalSynthesis) {
    addFact('assessment', 'fact-soap-synthesis', 'Síntese clínica do enfermeiro', norm.assessment.nurseClinicalSynthesis, `Síntese do enfermeiro: ${norm.assessment.nurseClinicalSynthesis}`);
  }
  if (norm.nursingDiagnoses.diagnoses.length > 0) {
    addFact('nursingDiagnoses', 'fact-soap-diagnoses-list', 'Diagnósticos de enfermagem', norm.nursingDiagnoses.diagnoses, `Diagnósticos de enfermagem: ${norm.nursingDiagnoses.diagnoses.join('; ')}`);
  }
  if (norm.nursingDiagnoses.diagnosesText) {
    addFact('nursingDiagnoses', 'fact-soap-diagnoses-text', 'Diagnósticos de enfermagem (texto)', norm.nursingDiagnoses.diagnosesText, `Diagnósticos: ${norm.nursingDiagnoses.diagnosesText}`);
  }
  if (norm.nursingDiagnoses.clinicalReasoning) {
    addFact('nursingDiagnoses', 'fact-soap-reasoning', 'Raciocínio clínico do enfermeiro', norm.nursingDiagnoses.clinicalReasoning, `Raciocínio clínico: ${norm.nursingDiagnoses.clinicalReasoning}`);
  }

  // 5. P - Plano
  if (norm.plan.carePlan) {
    addFact('plan', 'fact-soap-careplan', 'Plano assistencial de enfermagem', norm.plan.carePlan, `Plano assistencial: ${norm.plan.carePlan}`);
  }
  if (norm.plan.plannedMonitoring) {
    addFact('plan', 'fact-soap-monitoring', 'Monitorização planejada', norm.plan.plannedMonitoring, `Monitorização programada: ${norm.plan.plannedMonitoring}`);
  }
  if (norm.plan.patientOrientations) {
    addFact('plan', 'fact-soap-orientations', 'Orientações ao paciente', norm.plan.patientOrientations, `Orientações: ${norm.plan.patientOrientations}`);
  }
  if (norm.plan.scheduledEvaluations) {
    addFact('plan', 'fact-soap-evaluations', 'Avaliações programadas', norm.plan.scheduledEvaluations, `Retornos e reavaliações: ${norm.plan.scheduledEvaluations}`);
  }

  // 6. Intervenções executadas & Resposta aos cuidados
  if (norm.interventions.executedInterventions.length > 0) {
    addFact('interventions', 'fact-soap-interventions', 'Intervenções realizadas', norm.interventions.executedInterventions, `Intervenções: ${norm.interventions.executedInterventions.join(', ')}`);
  }
  if (norm.interventions.interventionDetails) {
    addFact('interventions', 'fact-soap-interv-details', 'Detalhes das intervenções', norm.interventions.interventionDetails, `Conduta executada: ${norm.interventions.interventionDetails}`);
  }
  if (norm.responseToCare.observedResponse) {
    addFact('responseToCare', 'fact-soap-response', 'Resposta observada', norm.responseToCare.observedResponse, `Resposta do paciente: ${norm.responseToCare.observedResponse}`);
  }
  if (norm.additionalInfo.notes) {
    addFact('additionalInfo', 'fact-soap-notes', 'Informações adicionais', norm.additionalInfo.notes, `Observações adicionais: ${norm.additionalInfo.notes}`);
  }

  return facts;
}

/**
 * Validates clinical consistency of Nurse SOAP Form according to SOAP-CONS specifications.
 */
export function validateNurseSoapConsistency(norm: NurseSoapForm): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // SOAP-CONS-001: Campo subjetivo vazio
  const hasSubjective =
    Boolean(norm.subjective.chiefComplaint) ||
    Boolean(norm.subjective.reportedSymptoms) ||
    Boolean(norm.subjective.patientPerception) ||
    Boolean(norm.subjective.familyInformation);

  if (!hasSubjective) {
    errors.push('Campo subjetivo vazio: registre a queixa principal ou ao menos um sintoma relatado.');
  }

  // SOAP-CONS-002: Sinais vitais incompletos / formato inválido
  const vs = norm.objective.vitalSigns;
  if (vs.bloodPressure) {
    const bpPattern = /^\d{2,3}\s*\/\s*\d{2,3}$/;
    if (!bpPattern.test(vs.bloodPressure)) {
      errors.push('Pressão arterial informada com formato inválido (utilize o formato sistólica/diastólica, ex.: 120/80).');
    }
  }
  if (vs.heartRate && (Number(vs.heartRate) <= 0 || isNaN(Number(vs.heartRate)))) {
    errors.push('Frequência cardíaca inválida: deve ser um valor numérico positivo.');
  }
  if (vs.respiratoryRate && (Number(vs.respiratoryRate) <= 0 || isNaN(Number(vs.respiratoryRate)))) {
    errors.push('Frequência respiratória inválida: deve ser um valor numérico positivo.');
  }
  if (vs.oxygenSaturation && (Number(vs.oxygenSaturation) <= 0 || Number(vs.oxygenSaturation) > 100 || isNaN(Number(vs.oxygenSaturation)))) {
    errors.push('Saturação de SpO2 inválida: deve estar entre 1% e 100%.');
  }

  // SOAP-CONS-005: Dispositivo com detalhamento mas sem dispositivo selecionado
  if (norm.objective.deviceDetails && norm.objective.devices.length === 0) {
    errors.push('Detalhes de dispositivos informados sem que nenhum dispositivo tenha sido cadastrado.');
  }

  // SOAP-CONS-006: Medicamento com detalhamento mas sem medicamento selecionado
  if (norm.objective.medicationDetails && norm.objective.medicationsInUse.length === 0) {
    errors.push('Detalhes farmacológicos informados sem que nenhum medicamento tenha sido cadastrado.');
  }

  return { errors, warnings };
}

/**
 * Audits deterministic SOAP narrative against authorized facts.
 */
export function auditNurseSoapNarrative(
  narrative: string,
  facts: AuthorizedClinicalFacts
): {
  passed: boolean;
  untraceableSegments: string[];
} {
  const untraceableSegments: string[] = [];
  if (!narrative || !narrative.trim()) {
    return { passed: true, untraceableSegments: [] };
  }

  // Common stop words that should not count as specific clinical traceability tokens
  const GENERIC_AUDIT_STOPWORDS = new Set([
    'paciente',
    'enfermagem',
    'consulta',
    'outro',
    'outros',
    'equipe',
    'relato',
    'quadro',
    'dados',
    'sobre',
    'para',
    'pelo',
    'pela',
    'como',
  ]);

  // Collect all valid tokens and fragments from authorized facts
  const authorizedTokens = new Set<string>();
  const authorizedPhrases: string[] = [];

  Object.values(facts).forEach((factList) => {
    factList.forEach((fact) => {
      if (typeof fact.value === 'string' && fact.value.trim()) {
        const val = fact.value.toLowerCase().trim();
        if (!GENERIC_AUDIT_STOPWORDS.has(val) && val.length >= 4) {
          authorizedPhrases.push(val);
        }
        val
          .split(/[\s,.;:/()-]+/)
          .filter((w) => w.length > 2 && !GENERIC_AUDIT_STOPWORDS.has(w))
          .forEach((w) => authorizedTokens.add(w));
      } else if (Array.isArray(fact.value)) {
        fact.value.forEach((v) => {
          const str = String(v).toLowerCase().trim();
          if (!GENERIC_AUDIT_STOPWORDS.has(str) && str.length >= 4) {
            authorizedPhrases.push(str);
          }
          str
            .split(/[\s,.;:/()-]+/)
            .filter((w) => w.length > 2 && !GENERIC_AUDIT_STOPWORDS.has(w))
            .forEach((w) => authorizedTokens.add(w));
        });
      }
      if (fact.canonicalText) {
        const canonical = fact.canonicalText.toLowerCase().trim();
        if (!GENERIC_AUDIT_STOPWORDS.has(canonical) && canonical.length >= 4) {
          authorizedPhrases.push(canonical);
        }
      }
    });
  });

  // Structural header patterns in SOAP notes that are permitted
  const structuralHeaders = [
    /^registro\s+de\s+enfermagem/i,
    /^soap/i,
    /^s\s*[-–]\s*subjetivo/i,
    /^o\s*[-–]\s*objetivo/i,
    /^a\s*[-–]\s*avalia[çc][ãa]o/i,
    /^p\s*[-–]\s*plano/i,
    /^interven[çc][õo]es/i,
    /^resposta\s+aos\s+cuidados/i,
    /^informa[çc][õo]es\s+adicionais/i,
    /^contexto/i,
    /^identifica[çc][ãa]o/i,
    /^dados\s+do\s+atendimento/i,
    /^sinais\s+vitais/i,
    /^exame\s+f[íi]sico/i,
    /^exame\s+f[íi]sico\s+direcionado/i,
    /^avalia[çc][ãa]o\s+do\s+enfermeiro/i,
    /^plano\s+assistencial\s+mantido/i,
    /^dispositivos/i,
    /^medicamentos/i,
    /^diagn[oó]sticos/i,
    /^sem\s+altera[çc][õo]es/i,
    /^sem\s+queixas/i,
    /^n[ãa]o\s+relatado/i,
    /^n[ãa]o\s+informado/i,
  ];

  // Split narrative into meaningful sentences
  const sentences = narrative
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const sentence of sentences) {
    const isHeader = structuralHeaders.some((regex) => regex.test(sentence));
    if (isHeader) continue;

    const lower = sentence.toLowerCase();

    // Check if sentence matches any authorized phrase
    const matchesPhrase = authorizedPhrases.some((phrase) => lower.includes(phrase));
    if (matchesPhrase) continue;

    // Check if sentence contains sufficient authorized tokens
    const words = lower
      .split(/[\s,.;:/()-]+/)
      .filter((w) => w.length > 3 && !GENERIC_AUDIT_STOPWORDS.has(w));
    const matchingTokens = words.filter((w) => authorizedTokens.has(w));
    const ratio = words.length > 0 ? matchingTokens.length / words.length : 0;

    // If long sentence (> 3 words) has zero matching authorized facts or very low ratio, flag as untraceable
    if (words.length >= 3 && (matchingTokens.length === 0 || (words.length >= 4 && ratio < 0.35))) {
      untraceableSegments.push(sentence);
    }
  }

  return {
    passed: untraceableSegments.length === 0,
    untraceableSegments,
  };
}
