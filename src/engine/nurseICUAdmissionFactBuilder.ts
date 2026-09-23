import {
  NurseICUAdmissionForm,
  createInitialNurseICUAdmissionForm,
} from '../types/nurseICUAdmission';
import {
  AuthorizedClinicalFacts,
  ClinicalFact,
  ClinicalConsistencyAlert,
} from './types';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * Normalizes NurseICUAdmissionForm to ensure consistent state and clean conditional dependencies.
 */
export function normalizeNurseICUAdmissionForm(form: NurseICUAdmissionForm): NurseICUAdmissionForm {
  const cloned: NurseICUAdmissionForm = JSON.parse(JSON.stringify(form));

  // Suporte respiratório sem VMI -> limpa parâmetros ventilatórios invasivos
  if (cloned.respiratorySupport.supportType !== 'VMI') {
    cloned.mechanicalVentilation = {
      airwayType: 'TOT',
      tubeCaliber: '',
      fixationMark: '',
      ventilationMode: '',
      fio2: '',
      peep: '',
      tidalVolume: '',
      respiratoryRateSet: '',
    };
  }

  // Drogas vasoativas Não -> limpa lista
  if (cloned.vasoactiveDrugs.hasVasoactiveDrugs === 'Não') {
    cloned.vasoactiveDrugs.drugs = [];
  }

  // Sedação/analgesia contínua Não -> limpa lista
  if (cloned.sedationAnalgesia.hasSedationAnalgesia === 'Não') {
    cloned.sedationAnalgesia.continuousInfusions = [];
  }

  // Dieta diferente de enteral -> limpa dispositivo enteral
  if (cloned.nutrition.dietType !== 'enteral') {
    cloned.nutrition.enteralDevice = '';
    cloned.nutrition.infusionRate = '';
    cloned.nutrition.tolerance = '';
  }

  // Dispositivos invasivos Não -> limpa lista
  if (cloned.invasiveDevices.hasInvasiveDevices === 'Não') {
    cloned.invasiveDevices.devices = [];
  }

  // Pele íntegra -> limpa campos de lesão
  if (cloned.skinIntegrity.integrity === 'íntegra') {
    cloned.skinIntegrity.lesionLocation = '';
    cloned.skinIntegrity.lesionDescription = '';
    cloned.skinIntegrity.dressingApplied = '';
  }

  // Intercorrências Não ou Não informado -> limpa detalhes
  if (cloned.complications.hasComplication !== 'Sim') {
    cloned.complications.description = '';
    cloned.complications.immediateAction = '';
    cloned.complications.communicationDone = '';
    cloned.complications.complicationTime = '';
  }

  // Comunicação Não -> limpa detalhes
  if (cloned.multiprofessionalCommunication.hasCommunication !== 'Sim') {
    cloned.multiprofessionalCommunication.targetTeam = '';
    cloned.multiprofessionalCommunication.reason = '';
    cloned.multiprofessionalCommunication.observedResponse = '';
  }

  return cloned;
}

/**
 * Builds AuthorizedClinicalFacts strictly from normalized admission form.
 */
export function buildAuthorizedNurseICUAdmissionFacts(form: NurseICUAdmissionForm): AuthorizedClinicalFacts {
  const norm = normalizeNurseICUAdmissionForm(form);
  const facts: AuthorizedClinicalFacts = {};

  const addFact = (
    category: string,
    id: string,
    sourceField: string,
    value: any,
    canonicalText: string
  ) => {
    if (!facts[category]) {
      facts[category] = [];
    }
    facts[category]!.push({
      id,
      category,
      sourceField,
      value,
      canonicalText,
    });
  };

  // 1. Contexto da admissão
  const momentText = norm.admissionContext.customMoment?.trim() || norm.admissionContext.moment;
  const bedText = norm.admissionContext.bedLocation?.trim()
    ? ` no leito/box ${norm.admissionContext.bedLocation.trim()}`
    : '';
  addFact(
    'context',
    'FACT-ADM-ICU-001',
    'admissionContext',
    { moment: momentText, bed: norm.admissionContext.bedLocation },
    `${momentText}${bedText}.`
  );

  // 2. Origem/procedência
  const originText = norm.origin.patientOrigin || 'PS';
  const originDetail = norm.origin.originDetails?.trim()
    ? ` (${norm.origin.originDetails.trim()})`
    : '';
  addFact(
    'context',
    'FACT-ADM-ICU-002',
    'origin',
    norm.origin,
    `Procedência: ${originText}${originDetail}.`
  );

  // 3. Transporte e chegada
  const arrivalMode = norm.arrivalTransport.customArrivalMode?.trim() || norm.arrivalTransport.arrivalMode;
  const transportSupport = norm.arrivalTransport.transportSupport?.trim()
    ? `, sob suporte de ${norm.arrivalTransport.transportSupport.trim()}`
    : '';
  addFact(
    'context',
    'FACT-ADM-ICU-003',
    'arrivalTransport',
    norm.arrivalTransport,
    `Chegada à unidade em ${arrivalMode}${transportSupport}.`
  );

  // 4. Identificação e segurança
  addFact(
    'context',
    'FACT-ADM-ICU-004',
    'safetyIdentification',
    norm.safetyIdentification,
    `Identificação do paciente: pulseira conferida (${norm.safetyIdentification.wristbandChecked || 'Sim'}), identificação de leito conferida (${norm.safetyIdentification.bedSignChecked || 'Sim'}).`
  );

  // 5. Acompanhante (sem identificação nominal)
  const companion = norm.companion.customCompanionType?.trim() || norm.companion.companionType;
  const companionSentence =
    companion === 'desacompanhado'
      ? 'Paciente admitido desacompanhado de familiares/responsáveis.'
      : `Admissão acompanhada por ${companion}.`;
  addFact(
    'context',
    'FACT-ADM-ICU-005',
    'companion',
    norm.companion,
    companionSentence
  );

  // 6. Alergias
  const allergyText =
    norm.allergies.hasAllergies === 'Sim' && norm.allergies.allergiesDetails?.trim()
      ? `Alergias relatadas: ${norm.allergies.allergiesDetails.trim()}.`
      : norm.allergies.hasAllergies === 'Nega'
      ? 'Alergias: nega histórico de alergias medicamentosas ou alimentares conhecidas.'
      : 'Alergias: não informado no momento da admissão.';
  addFact(
    'context',
    'FACT-ADM-ICU-006',
    'allergies',
    norm.allergies,
    allergyText
  );

  // 7. Precauções/isolamento
  const precType = norm.precautions.customPrecaution?.trim() || norm.precautions.precautionType || 'Padrão';
  addFact(
    'context',
    'FACT-ADM-ICU-007',
    'precautions',
    norm.precautions,
    `Medida de precaução institucional adotada: ${precType}.`
  );

  // 8. Motivo informado da internação
  if (norm.admissionReason.reasonText?.trim()) {
    addFact(
      'context',
      'FACT-ADM-ICU-008',
      'admissionReason',
      norm.admissionReason.reasonText.trim(),
      `Motivo da internação em UTI informado: ${norm.admissionReason.reasonText.trim()}.`
    );
  }

  // 9. Histórico informado
  const historyParts: string[] = [];
  if (norm.reportedHistory.pastHistoryText?.trim()) {
    historyParts.push(`Histórico prévio: ${norm.reportedHistory.pastHistoryText.trim()}`);
  }
  if (norm.reportedHistory.comorbidities?.trim()) {
    historyParts.push(`Comorbidades informadas: ${norm.reportedHistory.comorbidities.trim()}`);
  }
  if (norm.reportedHistory.homeMedications?.trim()) {
    historyParts.push(`Medicamentos de uso contínuo domiciliar referidos: ${norm.reportedHistory.homeMedications.trim()}`);
  }
  if (historyParts.length > 0) {
    addFact(
      'context',
      'FACT-ADM-ICU-009',
      'reportedHistory',
      norm.reportedHistory,
      historyParts.join('. ') + '.'
    );
  }

  // 10. Avaliação geral
  const generalState = norm.generalAssessment.generalState || 'Grave';
  let complaintStr = '';
  if (norm.generalAssessment.complaints === 'Sem queixas') {
    complaintStr = 'sem queixas verbais espontâneas no momento';
  } else if (norm.generalAssessment.complaints === 'Não contactante') {
    complaintStr = 'paciente não contactante';
  } else if (norm.generalAssessment.complaintsDescription?.trim()) {
    complaintStr = `queixa referida de ${norm.generalAssessment.complaintsDescription.trim()}`;
  } else {
    complaintStr = 'queixas não referidas';
  }
  addFact(
    'general',
    'FACT-ADM-ICU-010',
    'generalAssessment',
    norm.generalAssessment,
    `Estado geral na admissão: ${generalState}, ${complaintStr}.`
  );

  // 11. Nível de consciência
  const consciousness = norm.neurologicalState.customConsciousness?.trim() || norm.neurologicalState.consciousness;
  addFact(
    'neurological',
    'FACT-ADM-ICU-011',
    'neurologicalState',
    norm.neurologicalState,
    `Nível de consciência: paciente ${consciousness}.`
  );

  // 12. Glasgow
  if (norm.glasgow.score?.trim()) {
    addFact(
      'neurological',
      'FACT-ADM-ICU-012',
      'glasgow',
      norm.glasgow.score.trim(),
      `Escala de Coma de Glasgow na admissão: ${norm.glasgow.score.trim()}.`
    );
  }

  // 13. RASS
  if (norm.rass.score?.trim()) {
    addFact(
      'neurological',
      'FACT-ADM-ICU-013',
      'rass',
      norm.rass.score.trim(),
      `Escala de Sedação e Agitação de Richmond (RASS): ${norm.rass.score.trim()}.`
    );
  }

  // 14. Pupilas
  const pupilEqual = norm.pupils.equality || 'isocóricas';
  const pupilReact = norm.pupils.reactivity || 'fotorreagentes';
  addFact(
    'neurological',
    'FACT-ADM-ICU-014',
    'pupils',
    norm.pupils,
    `Avaliação pupilar: pupilas ${pupilEqual}, ${pupilReact}.`
  );

  // 15. Dor
  const painScale = norm.pain.scale || 'não avaliável';
  let painText = `Avaliação álgica: escala ${painScale}`;
  if (norm.pain.score?.trim()) {
    painText += ` com escore ${norm.pain.score.trim()}`;
  }
  if (norm.pain.location?.trim()) {
    painText += `, localização ${norm.pain.location.trim()}`;
  }
  addFact(
    'pain',
    'FACT-ADM-ICU-015',
    'pain',
    norm.pain,
    painText + '.'
  );

  // 16. Sinais vitais (PAM manual preservada, nunca calculada)
  const vs = norm.vitalSigns;
  const vsParts: string[] = [];
  if (vs.systolicBP && vs.diastolicBP) {
    vsParts.push(`PA: ${vs.systolicBP}x${vs.diastolicBP} mmHg`);
  }
  if (vs.meanArterialPressure?.trim()) {
    vsParts.push(`PAM (aferição manual direta): ${vs.meanArterialPressure.trim()} mmHg`);
  }
  if (vs.heartRate?.trim()) {
    vsParts.push(`FC: ${vs.heartRate.trim()} bpm`);
  }
  if (vs.respiratoryRate?.trim()) {
    vsParts.push(`FR: ${vs.respiratoryRate.trim()} rpm`);
  }
  if (vs.oxygenSaturation?.trim()) {
    vsParts.push(`SpO₂: ${vs.oxygenSaturation.trim()}%`);
  }
  if (vs.temperature?.trim()) {
    vsParts.push(`Temperatura: ${vs.temperature.trim()} °C`);
  }
  if (vs.bloodGlucose?.trim()) {
    vsParts.push(`Glicemia capilar: ${vs.bloodGlucose.trim()} mg/dL`);
  }
  if (vsParts.length > 0) {
    addFact(
      'vitalSigns',
      'FACT-ADM-ICU-016',
      'vitalSigns',
      norm.vitalSigns,
      `Sinais vitais admissionais: ${vsParts.join(', ')}.`
    );
  }

  // 17. Suporte respiratório
  const respType = norm.respiratorySupport.supportType || 'ar ambiente';
  let respDetail = '';
  if (norm.respiratorySupport.deviceDetails?.trim()) {
    respDetail += ` (${norm.respiratorySupport.deviceDetails.trim()})`;
  }
  if (norm.respiratorySupport.oxygenFlowRate?.trim()) {
    respDetail += `, fluxo de O₂ a ${norm.respiratorySupport.oxygenFlowRate.trim()}`;
  }
  addFact(
    'respiratory',
    'FACT-ADM-ICU-017',
    'respiratorySupport',
    norm.respiratorySupport,
    `Padrão respiratório e suporte: em ${respType}${respDetail}.`
  );

  // 18. Ventilação mecânica (se VMI)
  if (norm.respiratorySupport.supportType === 'VMI') {
    const mv = norm.mechanicalVentilation;
    const mvParts: string[] = [];
    mvParts.push(`via aérea artificial por ${mv.airwayType || 'TOT'}`);
    if (mv.tubeCaliber?.trim()) mvParts.push(`calibre ${mv.tubeCaliber.trim()}`);
    if (mv.fixationMark?.trim()) mvParts.push(`fixação na marca ${mv.fixationMark.trim()}`);
    if (mv.ventilationMode?.trim()) mvParts.push(`modo ventilatório ${mv.ventilationMode.trim()}`);
    if (mv.fio2?.trim()) mvParts.push(`FiO₂ ${mv.fio2.trim()}`);
    if (mv.peep?.trim()) mvParts.push(`PEEP ${mv.peep.trim()}`);
    if (mv.tidalVolume?.trim()) mvParts.push(`VC ${mv.tidalVolume.trim()}`);
    if (mv.respiratoryRateSet?.trim()) mvParts.push(`FR ajustada ${mv.respiratoryRateSet.trim()}`);

    addFact(
      'respiratory',
      'FACT-ADM-ICU-018',
      'mechanicalVentilation',
      norm.mechanicalVentilation,
      `Parâmetros de ventilação mecânica invasiva: ${mvParts.join(', ')}.`
    );
  }

  // 19. Avaliação cardiovascular
  const cv = norm.cardiovascularAssessment;
  const cvParts: string[] = [];
  cvParts.push(`perfusão periférica ${cv.perfusion || 'adequada'}`);
  cvParts.push(`extremidades ${cv.extremities || 'aquecidas'}`);
  if (cv.capillaryRefillTime) cvParts.push(`tempo de enchimento capilar ${cv.capillaryRefillTime}`);
  if (cv.edema && cv.edema !== 'Ausente') {
    cvParts.push(`edema presente${cv.edemaDetails?.trim() ? ` (${cv.edemaDetails.trim()})` : ''}`);
  } else {
    cvParts.push('sem edema periférico');
  }
  if (cv.heartRhythm?.trim()) cvParts.push(`ritmo cardíaco: ${cv.heartRhythm.trim()}`);
  addFact(
    'cardiovascular',
    'FACT-ADM-ICU-019',
    'cardiovascularAssessment',
    norm.cardiovascularAssessment,
    `Avaliação cardiovascular na admissão: ${cvParts.join(', ')}.`
  );

  // 20. Drogas vasoativas
  if (norm.vasoactiveDrugs.hasVasoactiveDrugs === 'Sim' && norm.vasoactiveDrugs.drugs.length > 0) {
    const dvaDescriptions = norm.vasoactiveDrugs.drugs.map((d) => {
      const conc = d.concentration?.trim() ? ` (${d.concentration.trim()})` : '';
      const route = d.route?.trim() ? ` via ${d.route.trim()}` : '';
      return `${d.drugName}${conc} a ${d.flowRate} ${d.rateUnit}${route}`;
    });
    addFact(
      'vasoactive',
      'FACT-ADM-ICU-020',
      'vasoactiveDrugs',
      norm.vasoactiveDrugs.drugs,
      `Drogas vasoativas em infusão contínua instaladas: ${dvaDescriptions.join('; ')}.`
    );
  } else {
    addFact(
      'vasoactive',
      'FACT-ADM-ICU-020',
      'vasoactiveDrugs',
      'Não',
      'Drogas vasoativas: sem infusão contínua de drogas vasoativas no momento da admissão.'
    );
  }

  // 21. Sedação e analgesia contínua
  if (norm.sedationAnalgesia.hasSedationAnalgesia === 'Sim' && norm.sedationAnalgesia.continuousInfusions.length > 0) {
    const sedDescriptions = norm.sedationAnalgesia.continuousInfusions.map((s) => {
      const ind = s.indication?.trim() ? ` para ${s.indication.trim()}` : '';
      return `${s.drugName} a ${s.flowRate} ${s.rateUnit}${ind}`;
    });
    addFact(
      'sedationAnalgesia',
      'FACT-ADM-ICU-021',
      'sedationAnalgesia',
      norm.sedationAnalgesia.continuousInfusions,
      `Sedação e analgesia contínua em infusão: ${sedDescriptions.join('; ')}.`
    );
  } else {
    addFact(
      'sedationAnalgesia',
      'FACT-ADM-ICU-021',
      'sedationAnalgesia',
      'Não',
      'Sedação e analgesia contínua: sem infusão contínua de sedativos ou analgésicos na admissão.'
    );
  }

  // 22. Avaliação gastrointestinal
  const gi = norm.gastrointestinal;
  addFact(
    'gastrointestinal',
    'FACT-ADM-ICU-022',
    'gastrointestinal',
    norm.gastrointestinal,
    `Exame gastrointestinal: abdome ${gi.abdomenAspect || 'plano'}, ruídos hidroaéreos ${gi.bowelSounds || 'presentes'}, náuseas e vômitos ${gi.nauseaVomiting || 'ausentes'}.`
  );

  // 23. Nutrição
  const nut = norm.nutrition;
  let nutText = `Suporte nutricional: ${nut.dietType || 'jejum'}`;
  if (nut.dietType === 'enteral') {
    if (nut.enteralDevice) nutText += ` por dispositivo ${nut.enteralDevice}`;
    if (nut.infusionRate?.trim()) nutText += ` com vazão de ${nut.infusionRate.trim()}`;
    if (nut.tolerance?.trim()) nutText += `, tolerância ${nut.tolerance.trim()}`;
  }
  addFact(
    'nutrition',
    'FACT-ADM-ICU-023',
    'nutrition',
    norm.nutrition,
    nutText + '.'
  );

  // 24. Eliminações
  const elim = norm.eliminations;
  let diuresisText = `diurese ${elim.diuresisType || 'espontânea'}`;
  if (elim.diuresisCharacteristics?.trim()) {
    diuresisText += ` (${elim.diuresisCharacteristics.trim()})`;
  }
  let bowelText = `evacuação ${elim.bowelElimination || 'ausente'}`;
  if (elim.bowelCharacteristics?.trim()) {
    bowelText += ` (${elim.bowelCharacteristics.trim()})`;
  }
  addFact(
    'eliminations',
    'FACT-ADM-ICU-024',
    'eliminations',
    norm.eliminations,
    `Eliminações fisiológicas na admissão: ${diuresisText}, ${bowelText}.`
  );

  // 25. Balanço hídrico inicial
  const wb = norm.initialWaterBalance;
  let wbText = `Balanço hídrico inicial: ${wb.status || 'Zerado na admissão'}`;
  if (wb.balanceValue?.trim()) {
    wbText += ` (volume: ${wb.balanceValue.trim()} mL)`;
  }
  if (wb.observations?.trim()) {
    wbText += `, observações: ${wb.observations.trim()}`;
  }
  addFact(
    'waterBalance',
    'FACT-ADM-ICU-025',
    'initialWaterBalance',
    norm.initialWaterBalance,
    wbText + '.'
  );

  // 26. Dispositivos invasivos
  if (norm.invasiveDevices.hasInvasiveDevices === 'Sim' && norm.invasiveDevices.devices.length > 0) {
    const devList = norm.invasiveDevices.devices.map((d) => {
      const side = d.insertionSide?.trim() ? ` ${d.insertionSide.trim()}` : '';
      const perm = d.permeability ? `, permeabilidade: ${d.permeability}` : '';
      const func = d.functioningStatus ? `, funcionamento: ${d.functioningStatus}` : '';
      const dress = d.dressingCondition ? `, curativo: ${d.dressingCondition}` : '';
      return `${d.deviceType} em ${d.anatomicalSite}${side}${perm}${func}${dress}`;
    });
    addFact(
      'devices',
      'FACT-ADM-ICU-026',
      'invasiveDevices',
      norm.invasiveDevices.devices,
      `Dispositivos invasivos conferidos na admissão: ${devList.join('; ')}.`
    );
  } else {
    addFact(
      'devices',
      'FACT-ADM-ICU-026',
      'invasiveDevices',
      'Não',
      'Dispositivos invasivos: nenhum dispositivo invasivo adicional relatado na admissão além dos já citados.'
    );
  }

  // 27. Pele e integridade cutânea
  const skin = norm.skinIntegrity;
  if (skin.integrity === 'lesão') {
    const loc = skin.lesionLocation?.trim() ? ` em ${skin.lesionLocation.trim()}` : '';
    const desc = skin.lesionDescription?.trim() ? ` caracterizada por ${skin.lesionDescription.trim()}` : '';
    const dress = skin.dressingApplied?.trim() ? `, curativo: ${skin.dressingApplied.trim()}` : '';
    addFact(
      'skin',
      'FACT-ADM-ICU-027',
      'skinIntegrity',
      norm.skinIntegrity,
      `Integridade cutânea: presença de lesão cutânea${loc}${desc}${dress}.`
    );
  } else {
    addFact(
      'skin',
      'FACT-ADM-ICU-027',
      'skinIntegrity',
      'íntegra',
      'Integridade cutânea: pele íntegra, sem novas lesões por pressão evidentes à inspeção admissional.'
    );
  }

  // 28. Riscos assistenciais
  const risks = norm.careRisks;
  const riskParts: string[] = [];
  if (risks.risksList && risks.risksList.length > 0) {
    riskParts.push(`riscos identificados: ${risks.risksList.join(', ')}`);
  }
  riskParts.push(`grades do leito elevadas (${risks.bedRailsRaised || 'Sim'})`);
  if (risks.preventativeMeasures?.trim()) {
    riskParts.push(`medidas preventivas: ${risks.preventativeMeasures.trim()}`);
  }
  addFact(
    'care',
    'FACT-ADM-ICU-028',
    'careRisks',
    norm.careRisks,
    `Riscos assistenciais e segurança: ${riskParts.join(', ')}.`
  );

  // 29. Cuidados realizados na admissão
  const careActions = [...(norm.admissionCare.actions || [])];
  if (norm.admissionCare.customActions?.trim()) {
    careActions.push(norm.admissionCare.customActions.trim());
  }
  if (careActions.length > 0) {
    addFact(
      'care',
      'FACT-ADM-ICU-029',
      'admissionCare',
      careActions,
      `Cuidados de enfermagem executados na admissão: ${careActions.join('; ')}.`
    );
  }

  // 30. Intercorrências
  const comp = norm.complications;
  if (comp.hasComplication === 'Sim') {
    const time = comp.complicationTime?.trim() ? ` às ${comp.complicationTime.trim()}` : '';
    const desc = comp.description?.trim() ? `: ${comp.description.trim()}` : '';
    const cond = comp.immediateAction?.trim() ? `, conduta imediata: ${comp.immediateAction.trim()}` : '';
    const comm = comp.communicationDone?.trim() ? `, equipe comunicada: ${comp.communicationDone.trim()}` : '';
    addFact(
      'complications',
      'FACT-ADM-ICU-030',
      'complications',
      norm.complications,
      `Intercorrência registrada na admissão${time}${desc}${cond}${comm}.`
    );
  } else {
    addFact(
      'complications',
      'FACT-ADM-ICU-030',
      'complications',
      comp.hasComplication || 'Não',
      'Intercorrências: sem intercorrências clínicas registradas durante o processo de admissão na UTI.'
    );
  }

  // 31. Comunicação multiprofissional
  const comm = norm.multiprofessionalCommunication;
  if (comm.hasCommunication === 'Sim') {
    const team = comm.targetTeam?.trim() ? ` com ${comm.targetTeam.trim()}` : '';
    const reason = comm.reason?.trim() ? `, motivo: ${comm.reason.trim()}` : '';
    const resp = comm.observedResponse?.trim() ? `, alinhamento assistencial: ${comm.observedResponse.trim()}` : '';
    addFact(
      'communication',
      'FACT-ADM-ICU-031',
      'multiprofessionalCommunication',
      norm.multiprofessionalCommunication,
      `Comunicação multiprofissional realizada${team}${reason}${resp}.`
    );
  }

  // 32. Situação após admissão
  const status = norm.postAdmissionStatus;
  const stText = status.customStatus?.trim() || status.patientStatus || 'Permanece no leito em monitorização contínua';
  const pending = status.pendingIssues?.trim() ? `, pendências assistenciais: ${status.pendingIssues.trim()}` : '';
  addFact(
    'finalStatus',
    'FACT-ADM-ICU-032',
    'postAdmissionStatus',
    norm.postAdmissionStatus,
    `Situação ao término da admissão: ${stText}${pending}.`
  );

  return facts;
}

/**
 * Consistency validation for Nurse ICU Admission.
 * Validates clinical business rules:
 * - NUR-ADM-ICU-CONS-001: VMI sem parâmetros
 * - NUR-ADM-ICU-CONS-002: Dieta enteral sem dispositivo
 * - NUR-ADM-ICU-CONS-003: DVA sem medicamento
 * - NUR-ADM-ICU-CONS-004: Sedação sem medicação
 * - NUR-ADM-ICU-CONS-005: Dispositivo sem localização
 * - NUR-ADM-ICU-CONS-006: Intercorrência sem conduta
 * - NUR-ADM-ICU-CONS-007: Cenário válido sem alerta
 */
export function validateNurseICUAdmissionConsistency(form: NurseICUAdmissionForm): {
  errors: string[];
  warnings: string[];
  alerts: ClinicalConsistencyAlert[];
} {
  const alerts: ClinicalConsistencyAlert[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // NUR-ADM-ICU-CONS-001: VMI sem parâmetros
  if (form.respiratorySupport.supportType === 'VMI') {
    const mv = form.mechanicalVentilation;
    const hasAnyParam =
      Boolean(mv.ventilationMode?.trim()) ||
      Boolean(mv.fio2?.trim()) ||
      Boolean(mv.peep?.trim()) ||
      Boolean(mv.tidalVolume?.trim()) ||
      Boolean(mv.respiratoryRateSet?.trim());

    if (!hasAnyParam) {
      const msg = 'Ventilação Mecânica Invasiva (VMI) selecionada sem registro dos parâmetros ventilatórios (Modo, FiO2 ou PEEP).';
      errors.push(msg);
      alerts.push({
        id: 'NUR-ADM-ICU-CONS-001',
        severity: 'error',
        message: msg,
        sectionIndex: 17,
        fieldNames: ['mechanicalVentilation.ventilationMode', 'mechanicalVentilation.fio2', 'mechanicalVentilation.peep'],
      });
    }
  }

  // NUR-ADM-ICU-CONS-002: Dieta enteral sem dispositivo
  if (form.nutrition.dietType === 'enteral') {
    if (!form.nutrition.enteralDevice || !form.nutrition.enteralDevice.trim()) {
      const msg = 'Dieta enteral selecionada sem especificação do dispositivo de acesso (SNE, SNG ou GTT).';
      errors.push(msg);
      alerts.push({
        id: 'NUR-ADM-ICU-CONS-002',
        severity: 'error',
        message: msg,
        sectionIndex: 22,
        fieldNames: ['nutrition.enteralDevice'],
      });
    }
  }

  // NUR-ADM-ICU-CONS-003: DVA sem medicamento
  if (form.vasoactiveDrugs.hasVasoactiveDrugs === 'Sim') {
    const hasValidDrug =
      form.vasoactiveDrugs.drugs &&
      form.vasoactiveDrugs.drugs.length > 0 &&
      form.vasoactiveDrugs.drugs.some((d) => Boolean(d.drugName?.trim()));

    if (!hasValidDrug) {
      const msg = 'Uso de drogas vasoativas assinalado como "Sim", mas nenhuma droga foi cadastrada.';
      errors.push(msg);
      alerts.push({
        id: 'NUR-ADM-ICU-CONS-003',
        severity: 'error',
        message: msg,
        sectionIndex: 19,
        fieldNames: ['vasoactiveDrugs.drugs'],
      });
    }
  }

  // NUR-ADM-ICU-CONS-004: Sedação sem medicação
  if (form.sedationAnalgesia.hasSedationAnalgesia === 'Sim') {
    const hasValidSedation =
      form.sedationAnalgesia.continuousInfusions &&
      form.sedationAnalgesia.continuousInfusions.length > 0 &&
      form.sedationAnalgesia.continuousInfusions.some((s) => Boolean(s.drugName?.trim()));

    if (!hasValidSedation) {
      const msg = 'Sedação/analgesia contínua assinalada como "Sim", mas nenhuma medicação foi cadastrada.';
      errors.push(msg);
      alerts.push({
        id: 'NUR-ADM-ICU-CONS-004',
        severity: 'error',
        message: msg,
        sectionIndex: 20,
        fieldNames: ['sedationAnalgesia.continuousInfusions'],
      });
    }
  }

  // NUR-ADM-ICU-CONS-005: Dispositivo sem localização
  if (form.invasiveDevices.hasInvasiveDevices === 'Sim') {
    const invalidDevice = form.invasiveDevices.devices.find((d) => !d.anatomicalSite?.trim());
    if (invalidDevice) {
      const msg = `Dispositivo invasivo (${invalidDevice.deviceType || 'Dispositivo'}) cadastrado sem especificação do sítio anatômico de inserção.`;
      errors.push(msg);
      alerts.push({
        id: 'NUR-ADM-ICU-CONS-005',
        severity: 'error',
        message: msg,
        sectionIndex: 25,
        fieldNames: ['invasiveDevices.devices.anatomicalSite'],
      });
    }
  }

  // NUR-ADM-ICU-CONS-006: Intercorrência sem conduta
  if (form.complications.hasComplication === 'Sim') {
    if (!form.complications.immediateAction?.trim()) {
      const msg = 'Intercorrência na admissão registrada sem especificação da conduta imediata adotada.';
      errors.push(msg);
      alerts.push({
        id: 'NUR-ADM-ICU-CONS-006',
        severity: 'error',
        message: msg,
        sectionIndex: 29,
        fieldNames: ['complications.immediateAction'],
      });
    }
  }

  return {
    errors,
    warnings,
    alerts,
  };
}

/**
 * Audits deterministic narrative ensuring 100% trace of authorized facts.
 */
export function auditNurseICUAdmissionNarrative(
  narrativeText: string,
  authorizedFacts: AuthorizedClinicalFacts
): { passed: boolean; untraceableSegments: string[] } {
  const untraceable: string[] = [];
  const normNarrative = narrativeText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [, category] of Object.entries(authorizedFacts)) {
    if (Array.isArray(category)) {
      for (const fact of category) {
        if (fact.canonicalText) {
          const sample = fact.canonicalText
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .substring(0, Math.min(fact.canonicalText.length, 25));

          if (sample && !normNarrative.includes(sample)) {
            untraceable.push(`[${fact.id}] ${fact.canonicalText}`);
          }
        }
      }
    }
  }

  return {
    passed: untraceable.length === 0,
    untraceableSegments: untraceable,
  };
}
