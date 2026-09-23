import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';

/**
 * Builds authorized clinical facts for TechnicianAdmissionForm.
 * Strictly avoids inferences or fabricated data.
 */
export function buildAuthorizedAdmissionFacts(
  data: Partial<TechnicianAdmissionForm>
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts & { [key: string]: ClinicalFact[] | undefined } = {};

  // 1. Contexto da admissão
  if (data.context) {
    const ctxFacts: ClinicalFact[] = [];
    const c = data.context;

    if (c.moment) {
      ctxFacts.push({
        id: 'adm-ctx-moment',
        category: 'context',
        sourceField: 'context.moment',
        value: c.moment,
        canonicalText: `Momento: ${c.moment}`,
      });
    }
    if (c.location) {
      const locStr = c.location === 'Outro' && c.locationCustom ? c.locationCustom : c.location;
      ctxFacts.push({
        id: 'adm-ctx-location',
        category: 'context',
        sourceField: 'context.location',
        value: locStr,
        canonicalText: `Local da admissão: ${locStr}`,
      });
    }
    if (c.accompaniment && c.accompaniment !== 'Não informado') {
      const accStr = c.accompaniment === 'Outro' && c.accompanimentCustom ? c.accompanimentCustom : c.accompaniment;
      ctxFacts.push({
        id: 'adm-ctx-accompaniment',
        category: 'context',
        sourceField: 'context.accompaniment',
        value: accStr,
        canonicalText: `Acompanhamento: ${accStr}`,
      });
    }

    if (ctxFacts.length > 0) facts.context = ctxFacts;
  }

  // 2. Procedência e forma de chegada
  if (data.origin) {
    const origFacts: ClinicalFact[] = [];
    const o = data.origin;

    if (o.patientOrigin && o.patientOrigin !== 'Não informado') {
      const origStr = o.patientOrigin === 'Outro' && o.originCustom ? o.originCustom : o.patientOrigin;
      origFacts.push({
        id: 'adm-origin-source',
        category: 'origin',
        sourceField: 'origin.patientOrigin',
        value: origStr,
        canonicalText: `Procedência: ${origStr}`,
      });
    }
    if (o.arrivalModes && o.arrivalModes.length > 0 && !o.arrivalModes.includes('Não informado')) {
      origFacts.push({
        id: 'adm-origin-arrival-mode',
        category: 'origin',
        sourceField: 'origin.arrivalModes',
        value: o.arrivalModes,
        canonicalText: `Forma de chegada: ${o.arrivalModes.join(', ')}`,
      });
    }
    if (o.accompaniedByTransportTeam === 'Sim') {
      const teamStr =
        o.transportTeamType === 'Outra' && o.transportTeamTypeCustom
          ? o.transportTeamTypeCustom
          : o.transportTeamType || 'equipe de transporte';
      origFacts.push({
        id: 'adm-origin-transport-team',
        category: 'origin',
        sourceField: 'origin.transportTeamType',
        value: teamStr,
        canonicalText: `Transporte realizado por: ${teamStr}`,
      });
    }

    if (origFacts.length > 0) facts.origin = origFacts;
  }

  // 3. Identificação e segurança
  if (data.identification) {
    const idFacts: ClinicalFact[] = [];
    const id = data.identification;

    if (id.wristbandChecked && id.wristbandChecked !== 'Não informado' && id.wristbandChecked !== 'Não se aplica') {
      idFacts.push({
        id: 'adm-id-wristband',
        category: 'identification',
        sourceField: 'identification.wristbandChecked',
        value: id.wristbandChecked,
        canonicalText: `Pulseira de identificação: ${id.wristbandChecked}`,
      });
    }
    if (id.bedSignChecked && id.bedSignChecked !== 'Não informado' && id.bedSignChecked !== 'Não se aplica') {
      idFacts.push({
        id: 'adm-id-bedsign',
        category: 'identification',
        sourceField: 'identification.bedSignChecked',
        value: id.bedSignChecked,
        canonicalText: `Placa de identificação do leito: ${id.bedSignChecked}`,
      });
    }
    if (id.allergies && id.allergies !== 'Não informado') {
      const allStr = id.allergies === 'Sim' && id.allergiesDetails ? `Sim (${id.allergiesDetails})` : id.allergies;
      idFacts.push({
        id: 'adm-id-allergies',
        category: 'identification',
        sourceField: 'identification.allergies',
        value: allStr,
        canonicalText: `Alergias: ${allStr}`,
      });
    }
    if (id.precaution && id.precaution !== 'Não informado') {
      const precStr = id.precaution === 'Outra' && id.precautionCustom ? id.precautionCustom : id.precaution;
      idFacts.push({
        id: 'adm-id-precaution',
        category: 'identification',
        sourceField: 'identification.precaution',
        value: precStr,
        canonicalText: `Precaução: ${precStr}`,
      });
    }

    if (idFacts.length > 0) facts.identification = idFacts;
  }

  // 4. Informações referidas
  if (data.reportedInformation) {
    const repFacts: ClinicalFact[] = [];
    const r = data.reportedInformation;

    if (r.admissionReason?.trim()) {
      repFacts.push({
        id: 'adm-rep-reason',
        category: 'reported',
        sourceField: 'reportedInformation.admissionReason',
        value: r.admissionReason.trim(),
        canonicalText: `Motivo informado da admissão: ${r.admissionReason.trim()}`,
      });
    }
    if (r.relevantComorbidities?.trim()) {
      repFacts.push({
        id: 'adm-rep-comorbidities',
        category: 'reported',
        sourceField: 'reportedInformation.relevantComorbidities',
        value: r.relevantComorbidities.trim(),
        canonicalText: `Comorbidades informadas: ${r.relevantComorbidities.trim()}`,
      });
    }
    if (r.complaints && r.complaints !== 'Não informado' && r.complaints !== 'Não avaliado') {
      const compStr = r.complaints === 'Com queixa' && r.complaintsDetails ? `Com queixa (${r.complaintsDetails})` : r.complaints;
      repFacts.push({
        id: 'adm-rep-complaints',
        category: 'reported',
        sourceField: 'reportedInformation.complaints',
        value: compStr,
        canonicalText: `Queixa na admissão: ${compStr}`,
      });
    }
    if (r.informationSource && r.informationSource !== 'Não informado') {
      const srcStr = r.informationSource === 'Outra' && r.informationSourceCustom ? r.informationSourceCustom : r.informationSource;
      repFacts.push({
        id: 'adm-rep-source',
        category: 'reported',
        sourceField: 'reportedInformation.informationSource',
        value: srcStr,
        canonicalText: `Fonte da informação: ${srcStr}`,
      });
    }

    if (repFacts.length > 0) facts.reported = repFacts;
  }

  // 5. Condições observadas na chegada
  if (data.arrivalCondition) {
    const arrFacts: ClinicalFact[] = [];
    const a = data.arrivalCondition;

    if (a.behavior && a.behavior.length > 0 && !a.behavior.includes('Não avaliado')) {
      arrFacts.push({
        id: 'adm-arr-behavior',
        category: 'arrivalCondition',
        sourceField: 'arrivalCondition.behavior',
        value: a.behavior,
        canonicalText: `Comportamento na chegada: ${a.behavior.join(', ')}`,
      });
    }
    if (a.hygiene && a.hygiene !== 'Não informado' && a.hygiene !== 'Não avaliada') {
      arrFacts.push({
        id: 'adm-arr-hygiene',
        category: 'arrivalCondition',
        sourceField: 'arrivalCondition.hygiene',
        value: a.hygiene,
        canonicalText: `Condição de higiene na chegada: ${a.hygiene}`,
      });
    }

    if (arrFacts.length > 0) facts.arrivalCondition = arrFacts;
  }

  // 6. Sinais vitais
  if (data.vitalSigns) {
    const vsFacts: ClinicalFact[] = [];
    const vs = data.vitalSigns;

    if (vs.systolicBP && vs.diastolicBP) {
      vsFacts.push({
        id: 'adm-vs-blood-pressure',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.bloodPressure',
        value: `${vs.systolicBP}/${vs.diastolicBP} mmHg`,
        canonicalText: `PA: ${vs.systolicBP}/${vs.diastolicBP} mmHg`,
      });
    }
    if (vs.meanArterialPressure) {
      vsFacts.push({
        id: 'adm-vs-map',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.meanArterialPressure',
        value: `${vs.meanArterialPressure} mmHg`,
        canonicalText: `PAM: ${vs.meanArterialPressure} mmHg`,
      });
    }
    if (vs.heartRate) {
      vsFacts.push({
        id: 'adm-vs-heart-rate',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.heartRate',
        value: `${vs.heartRate} bpm`,
        canonicalText: `FC: ${vs.heartRate} bpm`,
      });
    }
    if (vs.respiratoryRate) {
      vsFacts.push({
        id: 'adm-vs-respiratory-rate',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.respiratoryRate',
        value: `${vs.respiratoryRate} irpm`,
        canonicalText: `FR: ${vs.respiratoryRate} irpm`,
      });
    }
    if (vs.oxygenSaturation) {
      vsFacts.push({
        id: 'adm-vs-spo2',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.oxygenSaturation',
        value: `${vs.oxygenSaturation}%`,
        canonicalText: `SpO₂: ${vs.oxygenSaturation}%`,
      });
    }
    if (vs.temperature) {
      vsFacts.push({
        id: 'adm-vs-temperature',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.temperature',
        value: `${vs.temperature} °C`,
        canonicalText: `Temperatura: ${vs.temperature} °C`,
      });
    }

    if (vsFacts.length > 0) facts.vitalSigns = vsFacts;
  }

  // 7. Dor
  if (data.pain) {
    const painFacts: ClinicalFact[] = [];
    const p = data.pain;

    if (p.assessmentType && p.assessmentType !== 'Não informado') {
      painFacts.push({
        id: 'adm-pain-assessment',
        category: 'pain',
        sourceField: 'pain.assessmentType',
        value: p,
        canonicalText:
          p.assessmentType === 'Escala numérica 0–10' && p.numericScaleValue !== undefined
            ? `Dor: ${p.numericScaleValue}/10${p.location ? ` em ${p.location}` : ''}`
            : `Dor: ${p.assessmentType}`,
      });
    }

    if (painFacts.length > 0) facts.pain = painFacts;
  }

  // 8. Neurológico
  if (data.neurological) {
    const neuroFacts: ClinicalFact[] = [];
    const n = data.neurological;

    if (n.consciousnessLevel && n.consciousnessLevel !== 'Não avaliado') {
      const cStr = n.consciousnessLevel === 'Outro' && n.consciousnessCustom ? n.consciousnessCustom : n.consciousnessLevel;
      neuroFacts.push({
        id: 'adm-neuro-consciousness',
        category: 'neurological',
        sourceField: 'neurological.consciousnessLevel',
        value: cStr,
        canonicalText: `Consciência: ${cStr}`,
      });
    }
    if (n.orientation && n.orientation !== 'Não avaliado') {
      neuroFacts.push({
        id: 'adm-neuro-orientation',
        category: 'neurological',
        sourceField: 'neurological.orientation',
        value: n.orientation,
        canonicalText: `Orientação: ${n.orientation}`,
      });
    }
    if (n.glasgowType === 'score' && n.glasgowScore !== undefined) {
      neuroFacts.push({
        id: 'adm-neuro-glasgow',
        category: 'neurological',
        sourceField: 'neurological.glasgowScore',
        value: n.glasgowScore,
        canonicalText: `Glasgow: ${n.glasgowScore}`,
      });
    }
    if (n.rassType === 'score' && n.rassScore !== undefined) {
      neuroFacts.push({
        id: 'adm-neuro-rass',
        category: 'neurological',
        sourceField: 'neurological.rassScore',
        value: n.rassScore,
        canonicalText: `RASS: ${n.rassScore > 0 ? `+${n.rassScore}` : n.rassScore}`,
      });
    }

    if (neuroFacts.length > 0) facts.neurological = neuroFacts;
  }

  // 9. Respiratório
  if (data.respiratory) {
    const respFacts: ClinicalFact[] = [];
    const r = data.respiratory;

    if (r.respiratorySupport && r.respiratorySupport !== 'Não informado') {
      respFacts.push({
        id: 'adm-resp-support',
        category: 'respiratory',
        sourceField: 'respiratory.respiratorySupport',
        value: r.respiratorySupport,
        canonicalText: `Suporte respiratório: ${r.respiratorySupport}`,
      });
    }
    if (r.respiratoryPattern && r.respiratoryPattern !== 'Não avaliado') {
      respFacts.push({
        id: 'adm-resp-pattern',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryPattern',
        value: r.respiratoryPattern,
        canonicalText: `Padrão respiratório: ${r.respiratoryPattern}`,
      });
    }
    if (r.respiratoryDistress && r.respiratoryDistress !== 'Não avaliado') {
      respFacts.push({
        id: 'adm-resp-distress',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryDistress',
        value: r.respiratoryDistress,
        canonicalText: `Desconforto respiratório: ${r.respiratoryDistress}`,
      });
    }

    if (respFacts.length > 0) facts.respiratory = respFacts;
  }

  // 10. Cardiovascular / Perfusão
  if (data.cardiovascular) {
    const cardFacts: ClinicalFact[] = [];
    const c = data.cardiovascular;

    if (c.peripheralPerfusion && c.peripheralPerfusion !== 'Não avaliada') {
      cardFacts.push({
        id: 'adm-card-perfusion',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.peripheralPerfusion',
        value: c.peripheralPerfusion,
        canonicalText: `Perfusão: ${c.peripheralPerfusion}`,
      });
    }
    if (c.extremities && c.extremities !== 'Não avaliadas') {
      cardFacts.push({
        id: 'adm-card-extremities',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.extremities',
        value: c.extremities,
        canonicalText: `Extremidades: ${c.extremities}`,
      });
    }
    if (c.capillaryRefillTime && c.capillaryRefillTime !== 'Não avaliado') {
      const tecStr = c.capillaryRefillTime === 'Informar valor' && c.capillaryRefillTimeValue ? `${c.capillaryRefillTimeValue}s` : c.capillaryRefillTime;
      cardFacts.push({
        id: 'adm-card-tec',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.capillaryRefillTime',
        value: tecStr,
        canonicalText: `TEC: ${tecStr}`,
      });
    }
    if (c.edema && c.edema !== 'Não avaliado') {
      cardFacts.push({
        id: 'adm-card-edema',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.edema',
        value: c.edema,
        canonicalText: `Edema: ${c.edema}`,
      });
    }

    if (cardFacts.length > 0) facts.cardiovascular = cardFacts;
  }

  // 11. Nutrição e Gastrointestinal
  if (data.nutrition) {
    const nutFacts: ClinicalFact[] = [];
    const n = data.nutrition;

    if (n.status && n.status !== 'Não informado') {
      nutFacts.push({
        id: 'adm-nut-status',
        category: 'nutrition',
        sourceField: 'nutrition.status',
        value: n.status,
        canonicalText: `Nutrição: ${n.status}`,
      });
    }

    if (nutFacts.length > 0) facts.nutrition = nutFacts;
  }

  // 12. Eliminações
  if (data.elimination) {
    const elimFacts: ClinicalFact[] = [];
    const e = data.elimination;

    if (e.diuresis && e.diuresis !== 'Não informado' && e.diuresis !== 'Não avaliada') {
      elimFacts.push({
        id: 'adm-elim-diuresis',
        category: 'elimination',
        sourceField: 'elimination.diuresis',
        value: e.diuresis,
        canonicalText: `Diurese: ${e.diuresis}`,
      });
    }
    if (e.urinaryRoute && e.urinaryRoute !== 'Não informado') {
      elimFacts.push({
        id: 'adm-elim-route',
        category: 'elimination',
        sourceField: 'elimination.urinaryRoute',
        value: e.urinaryRoute,
        canonicalText: `Via urinária: ${e.urinaryRoute}`,
      });
    }
    if (e.bowelMovement && e.bowelMovement !== 'Não informado' && e.bowelMovement !== 'Não avaliada') {
      elimFacts.push({
        id: 'adm-elim-bowel',
        category: 'elimination',
        sourceField: 'elimination.bowelMovement',
        value: e.bowelMovement,
        canonicalText: `Evacuação: ${e.bowelMovement}`,
      });
    }

    if (elimFacts.length > 0) facts.elimination = elimFacts;
  }

  // 13. Dispositivos já presentes na admissão
  if (data.existingDevices?.list && data.existingDevices.list.length > 0) {
    const devFacts: ClinicalFact[] = [];
    data.existingDevices.list.forEach((dev, idx) => {
      const devName = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
      devFacts.push({
        id: `adm-existing-dev-${idx}`,
        category: 'existingDevices',
        sourceField: `existingDevices.list[${idx}]`,
        value: dev,
        canonicalText: `${devName || 'Dispositivo'} já presente na admissão em ${dev.location || 'sítio informado'}`,
      });
    });
    if (devFacts.length > 0) facts.existingDevices = devFacts;
  }

  // 14. Pele e integridade cutânea
  if (data.skin) {
    const skinFacts: ClinicalFact[] = [];
    const s = data.skin;

    if (s.integrity && s.integrity !== 'Não avaliada') {
      skinFacts.push({
        id: 'adm-skin-integrity',
        category: 'skin',
        sourceField: 'skin.integrity',
        value: s.integrity,
        canonicalText: `Integridade da pele: ${s.integrity}`,
      });
    }

    if (skinFacts.length > 0) facts.skin = skinFacts;
  }

  // 15. Mobilidade e segurança
  if (data.mobility) {
    const mobFacts: ClinicalFact[] = [];
    const m = data.mobility;

    if (m.condition && m.condition !== 'Não avaliada') {
      mobFacts.push({
        id: 'adm-mob-condition',
        category: 'mobility',
        sourceField: 'mobility.condition',
        value: m.condition,
        canonicalText: `Mobilidade na chegada: ${m.condition}`,
      });
    }
    if (m.bedRailsUsed && m.bedRailsUsed !== 'Não informado') {
      mobFacts.push({
        id: 'adm-mob-bedrails',
        category: 'mobility',
        sourceField: 'mobility.bedRailsUsed',
        value: m.bedRailsUsed,
        canonicalText: `Grades de proteção elevadas: ${m.bedRailsUsed}`,
      });
    }
    if (m.headOfBedElevated && m.headOfBedElevated !== 'Não informado') {
      mobFacts.push({
        id: 'adm-mob-head-of-bed',
        category: 'mobility',
        sourceField: 'mobility.headOfBedElevated',
        value: m.headOfBedElevated,
        canonicalText: `Cabeceira elevada: ${m.headOfBedElevated}${m.headOfBedAngle ? ` (${m.headOfBedAngle})` : ''}`,
      });
    }

    if (mobFacts.length > 0) facts.mobility = mobFacts;
  }

  // 16. Banho / Higiene na admissão
  if (data.hygiene?.bathPerformed && data.hygiene.bathPerformed !== 'Não informado') {
    facts.bath = [
      {
        id: 'adm-bath-fact',
        category: 'bath',
        sourceField: 'hygiene.bathPerformed',
        value: data.hygiene,
        canonicalText: `Banho na admissão: ${data.hygiene.bathPerformed}`,
      },
    ];
  }

  // 17. Cuidados realizados na admissão
  if (data.admissionCare?.careItems && data.admissionCare.careItems.length > 0) {
    facts.care = data.admissionCare.careItems.map((item, idx) => ({
      id: `adm-care-item-${idx}`,
      category: 'care',
      sourceField: `admissionCare.careItems[${idx}]`,
      value: item,
      canonicalText: item === 'Outro' && data.admissionCare?.otherCareDescription ? data.admissionCare.otherCareDescription : item,
    }));
  }

  // 18. Dispositivos instalados durante a admissão
  if (data.installedDevices?.installedInAdmission === 'Sim' && data.installedDevices.list && data.installedDevices.list.length > 0) {
    const instFacts: ClinicalFact[] = [];
    data.installedDevices.list.forEach((dev, idx) => {
      const devName = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
      instFacts.push({
        id: `adm-installed-dev-${idx}`,
        category: 'installedDevices',
        sourceField: `installedDevices.list[${idx}]`,
        value: dev,
        canonicalText: `Instalado/procedimento realizado na admissão: ${devName || 'Dispositivo'} em ${dev.location || 'sítio informado'}`,
      });
    });
    if (instFacts.length > 0) facts.installedDevices = instFacts;
  }

  // 19. Pertences
  if (data.belongings?.status && data.belongings.status !== 'Não informado') {
    const belStr = data.belongings.status === 'Outro' && data.belongings.statusCustom ? data.belongings.statusCustom : data.belongings.status;
    facts.belongings = [
      {
        id: 'adm-belongings-fact',
        category: 'belongings',
        sourceField: 'belongings.status',
        value: belStr,
        canonicalText: `Pertences na admissão: ${belStr}`,
      },
    ];
  }

  // 20. Intercorrências
  if (data.complications?.hasComplication && data.complications.hasComplication !== 'Não informado') {
    const comp = data.complications;
    const compStr =
      comp.hasComplication === 'Sim'
        ? `Sim${comp.time ? ` às ${comp.time}` : ''}${comp.description ? `: ${comp.description}` : ''}`
        : 'Não';
    facts.complications = [
      {
        id: 'adm-comp-fact',
        category: 'complications',
        sourceField: 'complications.hasComplication',
        value: comp,
        canonicalText: `Intercorrências na admissão: ${compStr}`,
      },
    ];
  }

  // 21. Comunicação
  if (data.communications?.communicationNeeded === 'Sim') {
    const comm = data.communications;
    const commWho = comm.professionalType === 'Outro profissional' && comm.professionalTypeCustom ? comm.professionalTypeCustom : comm.professionalType;
    facts.communications = [
      {
        id: 'adm-comm-fact',
        category: 'communications',
        sourceField: 'communications.communicationNeeded',
        value: comm,
        canonicalText: `Comunicação realizada a ${commWho || 'equipe'}${comm.time ? ` às ${comm.time}` : ''}`,
      },
    ];
  }

  // 22. Situação final
  if (data.finalStatus?.conditions && data.finalStatus.conditions.length > 0 && !data.finalStatus.conditions.includes('Não informado')) {
    facts.finalStatus = [
      {
        id: 'adm-final-status-fact',
        category: 'finalStatus',
        sourceField: 'finalStatus.conditions',
        value: data.finalStatus.conditions,
        canonicalText: `Situação após admissão: ${data.finalStatus.conditions.join(', ')}`,
      },
    ];
  }

  // 23. Informações adicionais
  const addStr = data.additionalInformation?.trim();
  if (addStr) {
    facts.additional = [
      {
        id: 'adm-additional-fact',
        category: 'additional',
        sourceField: 'additionalInformation',
        value: addStr,
        canonicalText: `Informações adicionais: ${addStr}`,
      },
    ];
  }

  return facts;
}
