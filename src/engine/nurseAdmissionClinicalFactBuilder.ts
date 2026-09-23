import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';

/**
 * Builds authorized clinical facts for NurseAdmissionForm.
 * Extracts purely explicit, objective facts and avoids any inference.
 */
export function buildAuthorizedNurseAdmissionFacts(
  data: Partial<NurseAdmissionForm>
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts & { [key: string]: ClinicalFact[] | undefined } = {};

  // 1. Contexto
  if (data.context) {
    const cFacts: ClinicalFact[] = [];
    const c = data.context;
    if (c.moment) {
      cFacts.push({
        id: 'nurse-adm-ctx-moment',
        category: 'context',
        sourceField: 'context.moment',
        value: c.moment,
        canonicalText: `Momento: ${c.moment}`,
      });
    }
    if (c.location) {
      const locStr = c.location === 'Outro' && c.locationCustom ? c.locationCustom : c.location;
      cFacts.push({
        id: 'nurse-adm-ctx-location',
        category: 'context',
        sourceField: 'context.location',
        value: locStr,
        canonicalText: `Local da admissão: ${locStr}`,
      });
    }
    if (c.accompaniment && c.accompaniment !== 'Não informado') {
      const accStr = c.accompaniment === 'Outro' && c.accompanimentCustom ? c.accompanimentCustom : c.accompaniment;
      cFacts.push({
        id: 'nurse-adm-ctx-accompaniment',
        category: 'context',
        sourceField: 'context.accompaniment',
        value: accStr,
        canonicalText: `Acompanhamento: ${accStr}`,
      });
    }
    if (cFacts.length > 0) facts.context = cFacts;
  }

  // 2. Procedência
  if (data.origin) {
    const oFacts: ClinicalFact[] = [];
    const o = data.origin;
    if (o.patientOrigin && o.patientOrigin !== 'Não informado') {
      const origStr = o.patientOrigin === 'Outro' && o.originCustom ? o.originCustom : o.patientOrigin;
      oFacts.push({
        id: 'nurse-adm-origin-source',
        category: 'origin',
        sourceField: 'origin.patientOrigin',
        value: origStr,
        canonicalText: `Procedência: ${origStr}`,
      });
    }
    if (o.arrivalModes && o.arrivalModes.length > 0 && !o.arrivalModes.includes('Não informado')) {
      oFacts.push({
        id: 'nurse-adm-origin-modes',
        category: 'origin',
        sourceField: 'origin.arrivalModes',
        value: o.arrivalModes,
        canonicalText: `Forma de chegada: ${o.arrivalModes.join(', ')}`,
      });
    }
    if (o.accompaniedByTransportTeam === 'Sim') {
      const tType = o.transportTeamType === 'Outra' && o.transportTeamTypeCustom ? o.transportTeamTypeCustom : o.transportTeamType || 'equipe de transporte';
      oFacts.push({
        id: 'nurse-adm-origin-team',
        category: 'origin',
        sourceField: 'origin.transportTeamType',
        value: tType,
        canonicalText: `Transporte realizado por: ${tType}`,
      });
    }
    if (oFacts.length > 0) facts.origin = oFacts;
  }

  // 3. Identificação e Segurança
  if (data.identification) {
    const idFacts: ClinicalFact[] = [];
    const id = data.identification;
    if (id.wristbandChecked && id.wristbandChecked !== 'Não informado') {
      idFacts.push({
        id: 'nurse-adm-id-wristband',
        category: 'identification',
        sourceField: 'identification.wristbandChecked',
        value: id.wristbandChecked,
        canonicalText: `Pulseira de identificação: ${id.wristbandChecked}`,
      });
    }
    if (id.allergies && id.allergies !== 'Não informado') {
      const allStr = id.allergies === 'Sim' && id.allergiesDetails ? `Sim (${id.allergiesDetails})` : id.allergies;
      idFacts.push({
        id: 'nurse-adm-id-allergies',
        category: 'identification',
        sourceField: 'identification.allergies',
        value: allStr,
        canonicalText: `Alergias relatadas: ${allStr}`,
      });
    }
    if (id.precaution && id.precaution !== 'Não informado') {
      idFacts.push({
        id: 'nurse-adm-id-precaution',
        category: 'identification',
        sourceField: 'identification.precaution',
        value: id.precaution,
        canonicalText: `Precaução: ${id.precaution}`,
      });
    }
    if (idFacts.length > 0) facts.identification = idFacts;
  }

  // 4. Histórico de Enfermagem
  if (data.nursingHistory) {
    const hFacts: ClinicalFact[] = [];
    const h = data.nursingHistory;
    if (h.admissionReason) {
      hFacts.push({
        id: 'nurse-adm-hist-reason',
        category: 'history',
        sourceField: 'nursingHistory.admissionReason',
        value: h.admissionReason,
        canonicalText: `Motivo da admissão: ${h.admissionReason}`,
      });
    }
    if (h.historyOfPresentIllness) {
      hFacts.push({
        id: 'nurse-adm-hist-hpi',
        category: 'history',
        sourceField: 'nursingHistory.historyOfPresentIllness',
        value: h.historyOfPresentIllness,
        canonicalText: `Histórico atual: ${h.historyOfPresentIllness}`,
      });
    }
    if (h.pastMedicalHistory) {
      hFacts.push({
        id: 'nurse-adm-hist-pmh',
        category: 'history',
        sourceField: 'nursingHistory.pastMedicalHistory',
        value: h.pastMedicalHistory,
        canonicalText: `Antecedentes: ${h.pastMedicalHistory}`,
      });
    }
    if (h.homeMedicationsReported) {
      hFacts.push({
        id: 'nurse-adm-hist-meds',
        category: 'history',
        sourceField: 'nursingHistory.homeMedicationsReported',
        value: h.homeMedicationsReported,
        canonicalText: `Medicações de uso domiciliar: ${h.homeMedicationsReported}`,
      });
    }
    if (hFacts.length > 0) facts.history = hFacts;
  }

  // 5. Sinais Vitais e Dor
  if (data.vitalSignsAndPain) {
    const vFacts: ClinicalFact[] = [];
    const v = data.vitalSignsAndPain;
    if (v.systolicBP && v.diastolicBP) {
      vFacts.push({
        id: 'nurse-adm-bp',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.systolicBP',
        value: `${v.systolicBP}/${v.diastolicBP} mmHg`,
        canonicalText: `Pressão Arterial: ${v.systolicBP}/${v.diastolicBP} mmHg`,
      });
    }
    if (v.meanArterialPressure) {
      vFacts.push({
        id: 'nurse-adm-map',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.meanArterialPressure',
        value: `${v.meanArterialPressure} mmHg`,
        canonicalText: `PAM: ${v.meanArterialPressure} mmHg`,
      });
    }
    if (v.heartRate) {
      vFacts.push({
        id: 'nurse-adm-hr',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.heartRate',
        value: `${v.heartRate} bpm`,
        canonicalText: `Frequência Cardíaca: ${v.heartRate} bpm`,
      });
    }
    if (v.respiratoryRate) {
      vFacts.push({
        id: 'nurse-adm-rr',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.respiratoryRate',
        value: `${v.respiratoryRate} irpm`,
        canonicalText: `Frequência Respiratória: ${v.respiratoryRate} irpm`,
      });
    }
    if (v.oxygenSaturation) {
      vFacts.push({
        id: 'nurse-adm-spo2',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.oxygenSaturation',
        value: `${v.oxygenSaturation}%`,
        canonicalText: `Saturação de O₂: ${v.oxygenSaturation}%`,
      });
    }
    if (v.temperature) {
      vFacts.push({
        id: 'nurse-adm-temp',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.temperature',
        value: `${v.temperature} °C`,
        canonicalText: `Temperatura: ${v.temperature} °C`,
      });
    }
    if (v.bloodGlucose) {
      vFacts.push({
        id: 'nurse-adm-glucose',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.bloodGlucose',
        value: `${v.bloodGlucose} mg/dL`,
        canonicalText: `Glicemia Capilar: ${v.bloodGlucose} mg/dL`,
      });
    }
    if (v.painAssessmentType === 'Escala numérica 0–10' && v.painScaleValue !== undefined) {
      vFacts.push({
        id: 'nurse-adm-pain',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.painScaleValue',
        value: v.painScaleValue,
        canonicalText: `Dor: ${v.painScaleValue}/10 na escala numérica`,
      });
    }
    if (vFacts.length > 0) facts.vitalSigns = vFacts;
  }

  // 6. Exame Físico - Neurológico
  if (data.neurological) {
    const nFacts: ClinicalFact[] = [];
    const n = data.neurological;
    if (n.consciousnessLevel) {
      nFacts.push({
        id: 'nurse-adm-neuro-consc',
        category: 'neurological',
        sourceField: 'neurological.consciousnessLevel',
        value: n.consciousnessLevel,
        canonicalText: `Nível de consciência: ${n.consciousnessLevel}`,
      });
    }
    if (n.orientation) {
      nFacts.push({
        id: 'nurse-adm-neuro-orient',
        category: 'neurological',
        sourceField: 'neurological.orientation',
        value: n.orientation,
        canonicalText: `Orientação: ${n.orientation}`,
      });
    }
    if (n.glasgowScore !== undefined) {
      nFacts.push({
        id: 'nurse-adm-neuro-glasgow',
        category: 'neurological',
        sourceField: 'neurological.glasgowScore',
        value: n.glasgowScore,
        canonicalText: `Escala de Coma de Glasgow: ${n.glasgowScore}`,
      });
    }
    if (nFacts.length > 0) facts.neurological = nFacts;
  }

  // 6b. Exame Físico - Respiratório
  if (data.respiratory) {
    const respFacts: ClinicalFact[] = [];
    const r = data.respiratory;
    if (r.respiratorySupport) {
      respFacts.push({
        id: 'nurse-adm-resp-support',
        category: 'respiratory',
        sourceField: 'respiratory.respiratorySupport',
        value: r.respiratorySupport,
        canonicalText: `Suporte ventilatório: ${r.respiratorySupport}`,
      });
    }
    if (r.respiratoryPattern) {
      respFacts.push({
        id: 'nurse-adm-resp-pattern',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryPattern',
        value: r.respiratoryPattern,
        canonicalText: `Padrão respiratório: ${r.respiratoryPattern}`,
      });
    }
    if (r.respiratoryDistress) {
      respFacts.push({
        id: 'nurse-adm-resp-distress',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryDistress',
        value: r.respiratoryDistress,
        canonicalText: `Desconforto respiratório: ${r.respiratoryDistress}`,
      });
    }
    if (r.breathSounds) {
      respFacts.push({
        id: 'nurse-adm-resp-sounds',
        category: 'respiratory',
        sourceField: 'respiratory.breathSounds',
        value: r.breathSounds,
        canonicalText: `Ausculta pulmonar: ${r.breathSounds}`,
      });
    }
    if (respFacts.length > 0) facts.respiratory = respFacts;
  }

  // 6c. Exame Físico - Cardiovascular
  if (data.cardiovascular) {
    const cardFacts: ClinicalFact[] = [];
    const c = data.cardiovascular;
    if (c.peripheralPerfusion) {
      cardFacts.push({
        id: 'nurse-adm-card-perf',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.peripheralPerfusion',
        value: c.peripheralPerfusion,
        canonicalText: `Perfusão periférica: ${c.peripheralPerfusion}`,
      });
    }
    if (c.extremities) {
      cardFacts.push({
        id: 'nurse-adm-card-extrem',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.extremities',
        value: c.extremities,
        canonicalText: `Extremidades: ${c.extremities}`,
      });
    }
    if (c.capillaryRefillTime) {
      cardFacts.push({
        id: 'nurse-adm-card-tec',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.capillaryRefillTime',
        value: c.capillaryRefillTime,
        canonicalText: `Tempo de enchimento capilar: ${c.capillaryRefillTime}`,
      });
    }
    if (c.edema) {
      cardFacts.push({
        id: 'nurse-adm-card-edema',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.edema',
        value: c.edema,
        canonicalText: `Edema: ${c.edema}`,
      });
    }
    if (cardFacts.length > 0) facts.cardiovascular = cardFacts;
  }

  // 6d. Exame Físico - Gastrointestinal
  if (data.gastrointestinal) {
    const giFacts: ClinicalFact[] = [];
    const g = data.gastrointestinal;
    if (g.abdomenInspection) {
      giFacts.push({
        id: 'nurse-adm-gi-insp',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinal.abdomenInspection',
        value: g.abdomenInspection,
        canonicalText: `Abdome inspeção: ${g.abdomenInspection}`,
      });
    }
    if (g.abdomenPalpation) {
      giFacts.push({
        id: 'nurse-adm-gi-palp',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinal.abdomenPalpation',
        value: g.abdomenPalpation,
        canonicalText: `Abdome palpação: ${g.abdomenPalpation}`,
      });
    }
    if (g.bowelSounds) {
      giFacts.push({
        id: 'nurse-adm-gi-rha',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinal.bowelSounds',
        value: g.bowelSounds,
        canonicalText: `Ruídos hidroaéreos: ${g.bowelSounds}`,
      });
    }
    if (giFacts.length > 0) facts.gastrointestinal = giFacts;
  }

  // 6e. Exame Físico - Eliminações
  if (data.elimination) {
    const elimFacts: ClinicalFact[] = [];
    const e = data.elimination;
    if (e.diuresis) {
      elimFacts.push({
        id: 'nurse-adm-elim-diuresis',
        category: 'elimination',
        sourceField: 'elimination.diuresis',
        value: e.diuresis,
        canonicalText: `Diurese: ${e.diuresis}`,
      });
    }
    if (e.bowelMovement) {
      elimFacts.push({
        id: 'nurse-adm-elim-bowel',
        category: 'elimination',
        sourceField: 'elimination.bowelMovement',
        value: e.bowelMovement,
        canonicalText: `Evacuação: ${e.bowelMovement}`,
      });
    }
    if (elimFacts.length > 0) facts.elimination = elimFacts;
  }

  // 7. Riscos Assistenciais
  if (data.riskAssessment) {
    const rFacts: ClinicalFact[] = [];
    const r = data.riskAssessment;
    if (r.fallRisk && r.fallRisk !== 'Não avaliado') {
      rFacts.push({
        id: 'nurse-adm-risk-fall',
        category: 'risks',
        sourceField: 'riskAssessment.fallRisk',
        value: r.fallRisk,
        canonicalText: `Risco de queda: ${r.fallRisk}`,
      });
    }
    if (r.pressureInjuryRisk && r.pressureInjuryRisk !== 'Não avaliado') {
      rFacts.push({
        id: 'nurse-adm-risk-lpp',
        category: 'risks',
        sourceField: 'riskAssessment.pressureInjuryRisk',
        value: r.pressureInjuryRisk,
        canonicalText: `Risco de lesão por pressão: ${r.pressureInjuryRisk}`,
      });
    }
    if (rFacts.length > 0) facts.risks = rFacts;
  }

  // 8. Cuidados Iniciais de Enfermagem
  if (data.initialNursingCare?.careItems && data.initialNursingCare.careItems.length > 0) {
    facts.care = data.initialNursingCare.careItems.map((item, idx) => ({
      id: `nurse-adm-care-${idx}`,
      category: 'care',
      sourceField: `initialNursingCare.careItems[${idx}]`,
      value: item,
      canonicalText: item,
    }));
  }

  // 9. Dispositivos Já Presentes
  if (data.existingDevices?.list && data.existingDevices.list.length > 0) {
    facts.existingDevices = data.existingDevices.list.map((dev, idx) => ({
      id: `nurse-adm-existing-dev-${idx}`,
      category: 'existingDevices',
      sourceField: `existingDevices.list[${idx}]`,
      value: dev,
      canonicalText: `Dispositivo já presente: ${dev.type} em ${dev.location || 'local informado'}`,
    }));
  }

  // 10. Plano Inicial de Cuidados
  if (data.nursingPlan?.planItems && data.nursingPlan.planItems.length > 0) {
    facts.nursingPlan = data.nursingPlan.planItems.map((item, idx) => ({
      id: `nurse-adm-plan-${idx}`,
      category: 'nursingPlan',
      sourceField: `nursingPlan.planItems[${idx}]`,
      value: item,
      canonicalText: item,
    }));
  }

  // 11. Situação Final
  if (data.finalStatus?.conditions && data.finalStatus.conditions.length > 0) {
    facts.finalStatus = [
      {
        id: 'nurse-adm-final-status',
        category: 'finalStatus',
        sourceField: 'finalStatus.conditions',
        value: data.finalStatus.conditions,
        canonicalText: `Situação final: ${data.finalStatus.conditions.join(', ')}`,
      },
    ];
  }

  return facts;
}
