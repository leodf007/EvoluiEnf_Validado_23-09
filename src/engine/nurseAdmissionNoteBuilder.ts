import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import {
  formatSentence,
  joinWithAnd,
  haveIdenticalDeviceStatus,
  buildDeviceStatusDescription,
} from './outputRules';

/**
 * NurseAdmissionNoteBuilder
 * 
 * Generates an objective, structured deterministic nursing admission note
 * for Nurses (Enfermeiro → Admissão de Enfermagem → PS/Emergência).
 * 
 * CRITICAL SAFETY RULES:
 * 1. Strictly relies on facts provided in the structured form.
 * 2. NO automated generation of NANDA/ICNP diagnoses or unselected prescriptions.
 * 3. Clinical measurements and scores are reported without speculative interpretation.
 * 4. Empty final status fields produce no destination strings.
 */
export function buildNurseAdmissionNote(rawForm: Partial<NurseAdmissionForm>): string {
  const form: Partial<NurseAdmissionForm> = rawForm || {};
  const paragraphs: string[] = [];

  // ==========================================
  // PARÁGRAFO 1: Acolhimento, Procedência, Forma de Chegada, Acompanhamento, Identificação, Alergia e Precaução
  // ==========================================
  const p1Sentences: string[] = [];
  const ctx = form.context;
  const orig = form.origin;

  let lead = 'Realizada admissão de enfermagem';
  if (ctx?.location && ctx.location.trim()) {
    const loc = ctx.location === 'Outro' && ctx.locationCustom ? ctx.locationCustom : ctx.location;
    lead = loc.toLowerCase().startsWith('leito') ? 'Realizada admissão de enfermagem no leito' : `Realizada admissão de enfermagem em ${loc}`;
  }

  const modifiers: string[] = [];
  if (orig?.patientOrigin && orig.patientOrigin !== 'Não informado' && orig.patientOrigin.trim()) {
    const origStr = orig.patientOrigin === 'Outro' && orig.originCustom ? orig.originCustom : orig.patientOrigin;
    modifiers.push(`proveniente de ${origStr}`);
  }

  let arrivalInMaca = false;
  if (orig?.arrivalModes && orig.arrivalModes.length > 0 && !orig.arrivalModes.includes('Não informado')) {
    const modes = orig.arrivalModes.map((m) => {
      if (m === 'Ambulância') return 'trazido por ambulância';
      if (m === 'Maca') {
        arrivalInMaca = true;
        return 'chegando em maca';
      }
      if (m === 'Cadeira de rodas') return 'chegando em cadeira de rodas';
      if (m === 'Deambulando') return 'chegando deambulando';
      if (m === 'Outro' && orig.arrivalModesCustom) return orig.arrivalModesCustom;
      return m.toLowerCase();
    });
    modifiers.push(joinWithAnd(modes));
  }

  if (ctx?.accompaniment && ctx.accompaniment !== 'Não informado' && ctx.accompaniment.trim()) {
    if (ctx.accompaniment === 'Desacompanhado') modifiers.push('desacompanhado');
    else if (ctx.accompaniment === 'Familiar') modifiers.push('acompanhado por familiar');
    else if (ctx.accompaniment === 'Responsável') modifiers.push('acompanhado por responsável');
    else if (ctx.accompaniment === 'Cuidador') modifiers.push('acompanhado por cuidador');
    else if (ctx.accompaniment === 'Equipe assistencial') modifiers.push('acompanhado por equipe assistencial');
    else if (ctx.accompaniment === 'Outro' && ctx.accompanimentCustom) modifiers.push(`acompanhado por ${ctx.accompanimentCustom}`);
  }

  if (orig?.accompaniedByTransportTeam === 'Sim' && orig.transportTeamType) {
    const tType = orig.transportTeamType === 'Outra' && orig.transportTeamTypeCustom ? orig.transportTeamTypeCustom : orig.transportTeamType;
    modifiers.push(`transporte assistido por ${tType}`);
  }

  if (modifiers.length > 0) {
    p1Sentences.push(formatSentence(`${lead}, ${modifiers.join(', ')}`));
  } else if (ctx?.location || ctx?.moment) {
    p1Sentences.push(formatSentence(lead));
  }

  // Identificação e Segurança
  const iden = form.identification;
  const idParts: string[] = [];
  if (iden?.wristbandChecked === 'Sim' && iden?.bedSignChecked === 'Sim') {
    idParts.push('identificação conferida por pulseira e placa do leito');
  } else if (iden?.wristbandChecked === 'Sim') {
    idParts.push('identificação conferida por pulseira');
  } else if (iden?.bedSignChecked === 'Sim') {
    idParts.push('identificação conferida por placa do leito');
  }

  if (iden?.allergies && iden.allergies !== 'Não informado' && iden.allergies.trim()) {
    if (iden.allergies === 'Não referidas') idParts.push('sem alergias referidas');
    else if (iden.allergies === 'Sim') {
      idParts.push(iden.allergiesDetails ? `alergia(s) relatada(s): ${iden.allergiesDetails}` : 'alergias relatadas');
    }
  }

  if (iden?.precaution && iden.precaution !== 'Não informado' && iden.precaution.trim()) {
    if (iden.precaution === 'Padrão') idParts.push('em precaução padrão');
    else if (iden.precaution === 'Contato') idParts.push('em precaução de contato');
    else if (iden.precaution === 'Gotículas') idParts.push('em precaução de gotículas');
    else if (iden.precaution === 'Aerossóis') idParts.push('em precaução por aerossóis');
    else if (iden.precaution === 'Outra' && iden.precautionCustom) idParts.push(`em precaução ${iden.precautionCustom}`);
  }

  if (idParts.length > 0) {
    p1Sentences.push(formatSentence(joinWithAnd(idParts)));
  }

  if (p1Sentences.length > 0) {
    paragraphs.push(p1Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 2: Histórico de Enfermagem (Queixa Principal, HMA, Antecedentes e Medicações)
  // ==========================================
  const p2Sentences: string[] = [];
  const hist = form.nursingHistory;
  if (hist) {
    const src = hist.informationSource && hist.informationSource !== 'Não informado' && hist.informationSource !== 'Paciente'
      ? ` (informado por ${hist.informationSource === 'Outra' && hist.informationSourceCustom ? hist.informationSourceCustom : hist.informationSource.toLowerCase()})`
      : '';

    if (hist.admissionReason?.trim()) {
      p2Sentences.push(`Motivo da admissão / queixa referida: ${hist.admissionReason.trim()}${src}.`);
    }
    if (hist.historyOfPresentIllness?.trim()) {
      p2Sentences.push(`Histórico atual referido: ${hist.historyOfPresentIllness.trim()}.`);
    }
    if (hist.pastMedicalHistory?.trim()) {
      p2Sentences.push(`Comorbidades / antecedentes informados: ${hist.pastMedicalHistory.trim()}.`);
    }
    if (hist.homeMedicationsReported?.trim()) {
      p2Sentences.push(`Uso relatado de medicações domiciliares: ${hist.homeMedicationsReported.trim()}.`);
    }
  }

  if (p2Sentences.length > 0) {
    paragraphs.push(p2Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 3: Sinais Vitais, Avaliação da Dor e Exame Físico Geral / Neurológico
  // ==========================================
  const p3Sentences: string[] = [];
  const vitals = form.vitalSignsAndPain;
  if (vitals) {
    const vitalsList: string[] = [];
    if (vitals.systolicBP && vitals.diastolicBP) vitalsList.push(`PA ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`);
    else if (vitals.systolicBP) vitalsList.push(`PA sistólica ${vitals.systolicBP} mmHg`);
    if (vitals.meanArterialPressure) vitalsList.push(`PAM ${vitals.meanArterialPressure} mmHg`);
    if (vitals.heartRate) vitalsList.push(`FC ${vitals.heartRate} bpm`);
    if (vitals.respiratoryRate) vitalsList.push(`FR ${vitals.respiratoryRate} irpm`);
    if (vitals.oxygenSaturation) vitalsList.push(`SpO₂ ${vitals.oxygenSaturation}%`);
    if (vitals.temperature) vitalsList.push(`temperatura ${vitals.temperature} °C`);
    if (vitals.bloodGlucose) vitalsList.push(`glicemia capilar ${vitals.bloodGlucose} mg/dL`);

    if (vitalsList.length > 0) {
      p3Sentences.push(`Parâmetros vitais na admissão: ${joinWithAnd(vitalsList)}.`);
    }

    if (vitals.painAssessmentType === 'Escala numérica 0–10' && vitals.painScaleValue !== undefined) {
      let pStr = `Dor avaliada em ${vitals.painScaleValue}/10 em escala numérica`;
      const pD: string[] = [];
      if (vitals.painLocation) pD.push(`em ${vitals.painLocation}`);
      if (vitals.painCharacteristics) pD.push(`tipo ${vitals.painCharacteristics}`);
      if (pD.length > 0) pStr += ` (${pD.join(', ')})`;
      p3Sentences.push(formatSentence(pStr));
    } else if (vitals.painAssessmentType === 'Não avaliável') {
      p3Sentences.push('Dor não avaliável na admissão.');
    }
  }

  // Neurológico
  const neuro = form.neurological;
  if (neuro) {
    const nObs: string[] = [];
    if (neuro.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado' && neuro.consciousnessLevel.trim()) {
      nObs.push(neuro.consciousnessLevel === 'Outro' && neuro.consciousnessCustom ? neuro.consciousnessCustom.toLowerCase() : neuro.consciousnessLevel.toLowerCase());
    }
    if (neuro.orientation && neuro.orientation !== 'Não avaliado' && neuro.orientation !== 'Não avaliável' && neuro.orientation.trim()) {
      nObs.push(neuro.orientation.toLowerCase());
    }
    if (neuro.pupils && neuro.pupils !== 'Não avaliado' && neuro.pupils.trim()) {
      nObs.push(`pupilas ${neuro.pupils.toLowerCase()}`);
    }
    if (neuro.photoreaction && neuro.photoreaction !== 'Não avaliado' && neuro.photoreaction.trim()) {
      nObs.push(`fotorreagência ${neuro.photoreaction.toLowerCase()}`);
    }
    if (nObs.length > 0) {
      p3Sentences.push(formatSentence(`Exame neurológico: ${joinWithAnd(nObs)}`));
    }
    if (neuro.glasgowScore !== undefined) {
      p3Sentences.push(`Escala de Coma de Glasgow: ${neuro.glasgowScore}.`);
    }
    if (neuro.rassScore !== undefined) {
      const sign = neuro.rassScore > 0 ? '+' : '';
      p3Sentences.push(`Escala RASS: ${sign}${neuro.rassScore}.`);
    }
    if (neuro.motorResponse?.trim()) {
      p3Sentences.push(`Resposta motora: ${neuro.motorResponse.trim()}.`);
    }
  }

  if (p3Sentences.length > 0) {
    paragraphs.push(p3Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 4: Exame Físico por Sistemas (Respiratório, Cardiovascular, Gastrointestinal, Geniturinário, Tegumentar)
  // ==========================================
  const p4Sentences: string[] = [];

  // Respiratório
  const resp = form.respiratory;
  if (resp) {
    const rObs: string[] = [];
    if (resp.respiratoryPattern && resp.respiratoryPattern !== 'Não informado' && resp.respiratoryPattern.trim()) {
      rObs.push(`padrão ${resp.respiratoryPattern.toLowerCase()}`);
    }
    if (resp.respiratoryDistress === 'Ausente') rObs.push('sem desconforto respiratório observado');
    else if (resp.respiratoryDistress === 'Presente') rObs.push('com desconforto respiratório');

    if (resp.breathSounds && resp.breathSounds !== 'Não avaliada' && resp.breathSounds.trim()) {
      const loc = resp.breathSoundsLocation ? ` (${resp.breathSoundsLocation})` : '';
      rObs.push(`ausculta pulmonar com ${resp.breathSounds.toLowerCase()}${loc}`);
    }

    if (resp.respiratorySupport === 'Oxigenoterapia') {
      const dev = resp.oxygenDevice ? ` sob ${resp.oxygenDevice.toLowerCase()}` : '';
      const flow = resp.oxygenFlowRate ? ` a ${resp.oxygenFlowRate} L/min` : '';
      rObs.push(`em oxigenoterapia${dev}${flow}`);
    } else if (resp.respiratorySupport === 'Ar ambiente') {
      rObs.push('em ar ambiente');
    }

    if (rObs.length > 0) {
      p4Sentences.push(formatSentence(`Sistema respiratório: ${joinWithAnd(rObs)}`));
    }
  }

  // Cardiovascular
  const cardio = form.cardiovascular;
  if (cardio) {
    const cObs: string[] = [];
    if (cardio.peripheralPerfusion && cardio.peripheralPerfusion !== 'Não avaliada' && cardio.peripheralPerfusion.trim()) {
      cObs.push(`perfusão periférica ${cardio.peripheralPerfusion.toLowerCase()}`);
    }
    if (cardio.extremities && cardio.extremities !== 'Não avaliadas' && cardio.extremities.trim()) {
      cObs.push(`extremidades ${cardio.extremities.toLowerCase()}`);
    }
    if (cardio.capillaryRefillTime && cardio.capillaryRefillTime !== 'Não avaliado' && cardio.capillaryRefillTime.trim()) {
      const tec = cardio.capillaryRefillTime === 'Informar valor' && cardio.capillaryRefillTimeValue ? `TEC ${cardio.capillaryRefillTimeValue}s` : `TEC ${cardio.capillaryRefillTime}`;
      cObs.push(tec);
    }
    if (cardio.peripheralPulses && cardio.peripheralPulses.trim()) {
      cObs.push(`pulsos periféricos ${cardio.peripheralPulses.toLowerCase()}`);
    }
    if (cardio.edema === 'Ausente') cObs.push('sem edema');
    else if (cardio.edema === 'Presente') {
      const loc = cardio.edemaLocations?.length ? ` em ${cardio.edemaLocations.join(', ')}` : '';
      cObs.push(`edema presente${loc}`);
    }
    if (cObs.length > 0) {
      p4Sentences.push(formatSentence(`Sistema cardiovascular: ${joinWithAnd(cObs)}`));
    }
  }

  // Gastrointestinal
  const gastro = form.gastrointestinal;
  if (gastro) {
    const gObs: string[] = [];
    if (gastro.nutritionalStatus && gastro.nutritionalStatus !== 'Não informado' && gastro.nutritionalStatus.trim()) {
      gObs.push(`status nutricional: ${gastro.nutritionalStatus.toLowerCase()}`);
    }
    if (gastro.abdomenInspection && gastro.abdomenInspection.trim()) {
      gObs.push(`abdome ${gastro.abdomenInspection.toLowerCase()}`);
    }
    if (gastro.abdomenPalpation && gastro.abdomenPalpation.trim()) {
      gObs.push(`palpação: ${gastro.abdomenPalpation.toLowerCase()}`);
    }
    if (gastro.bowelSounds && gastro.bowelSounds.trim()) {
      gObs.push(`ruídos hidroaéreos ${gastro.bowelSounds.toLowerCase()}`);
    }
    if (gObs.length > 0) {
      p4Sentences.push(formatSentence(`Sistema gastrointestinal: ${joinWithAnd(gObs)}`));
    }
  }

  // Geniturinário e Eliminações
  const elim = form.elimination;
  if (elim) {
    const eObs: string[] = [];
    if (elim.diuresis && elim.diuresis !== 'Não informado' && elim.diuresis !== 'Não avaliada' && elim.diuresis.trim()) {
      const route = elim.urinaryRoute ? ` via ${elim.urinaryRoute.toLowerCase()}` : '';
      const asp = elim.urinaryAspect ? ` (${elim.urinaryAspect.toLowerCase()})` : '';
      eObs.push(`diurese ${elim.diuresis.toLowerCase()}${route}${asp}`);
    }
    if (elim.bowelMovement && elim.bowelMovement !== 'Não informado' && elim.bowelMovement !== 'Não avaliada' && elim.bowelMovement.trim()) {
      const bAsp = elim.bowelAspect ? ` (${elim.bowelAspect.toLowerCase()})` : '';
      eObs.push(`eliminação intestinal ${elim.bowelMovement.toLowerCase()}${bAsp}`);
    }
    if (eObs.length > 0) {
      p4Sentences.push(formatSentence(`Eliminações: ${joinWithAnd(eObs)}`));
    }
  }

  // Tegumentar
  const skin = form.skin;
  if (skin) {
    if (skin.integrity === 'Íntegra') {
      const hyd = skin.hydration ? `, ${skin.hydration.toLowerCase()}` : '';
      const col = skin.coloration ? `, ${skin.coloration.toLowerCase()}` : '';
      p4Sentences.push(`Pele íntegra${hyd}${col}.`);
    } else if (skin.integrity === 'Com alteração/lesão') {
      const lLoc = skin.lesionLocation ? ` em ${skin.lesionLocation}` : '';
      const lDesc = skin.lesionDescription ? ` (${skin.lesionDescription})` : '';
      const lDress = skin.lesionDressingPresent === 'Sim' ? ' com curativo presente' : '';
      p4Sentences.push(formatSentence(`Integridade cutânea alterada com lesão${lLoc}${lDesc}${lDress}`));
    }
  }

  if (p4Sentences.length > 0) {
    paragraphs.push(p4Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 5: Dispositivos Já Presentes, Riscos Assistenciais, Cuidados Executados, Pertences, Intercorrências, Comunicação, Condutas/Plano e Situação Final
  // ==========================================
  const p5Sentences: string[] = [];

  // Dispositivos já presentes
  const existingDevs = form.existingDevices?.list?.filter((d) => d.type?.trim() || d.location?.trim()) || [];
  if (existingDevs.length > 0) {
    if (existingDevs.length === 2 && haveIdenticalDeviceStatus(existingDevs[0], existingDevs[1])) {
      const d1Name = existingDevs[0].type === 'Outro' && existingDevs[0].customType ? existingDevs[0].customType : existingDevs[0].type;
      const d2Name = existingDevs[1].type === 'Outro' && existingDevs[1].customType ? existingDevs[1].customType : existingDevs[1].type;
      const d1Loc = existingDevs[0].location || 'sítio informado';
      const d2Loc = existingDevs[1].location || 'sítio informado';
      const statusStr = buildDeviceStatusDescription(existingDevs[0], true);
      p5Sentences.push(
        formatSentence(`Mantém ${d1Name} em ${d1Loc} e ${d2Name} em ${d2Loc} já presentes na admissão${statusStr ? `, ${statusStr}` : ''}`)
      );
    } else {
      existingDevs.forEach((dev) => {
        const name = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type || 'Dispositivo';
        const loc = dev.location ? ` em ${dev.location}` : '';
        const statusStr = buildDeviceStatusDescription(dev, false);
        p5Sentences.push(formatSentence(`Mantém ${name}${loc} já presente na admissão${statusStr ? `, ${statusStr}` : ''}`));
      });
    }
  }

  // Riscos assistenciais identificados
  const risk = form.riskAssessment;
  if (risk) {
    const rList: string[] = [];
    if (risk.fallRisk && risk.fallRisk !== 'Não avaliado' && risk.fallRisk.trim()) {
      rList.push(`risco de queda: ${risk.fallRisk.toLowerCase()}`);
    }
    if (risk.pressureInjuryRisk && risk.pressureInjuryRisk !== 'Não avaliado' && risk.pressureInjuryRisk.trim()) {
      rList.push(`risco de lesão por pressão: ${risk.pressureInjuryRisk.toLowerCase()}`);
    }
    if (risk.aspirationRisk === 'Presente') {
      rList.push('risco de broncoaspiração presente');
    }
    if (risk.deviceDislodgementRisk === 'Presente') {
      rList.push('risco de perda de dispositivos invasivos');
    }
    if (rList.length > 0) {
      p5Sentences.push(formatSentence(`Avaliação de riscos assistenciais: ${joinWithAnd(rList)}`));
    }
  }

  // Cuidados e Procedimentos Realizados pelo Enfermeiro
  const care = form.initialNursingCare;
  if (care?.careItems && care.careItems.length > 0) {
    p5Sentences.push(formatSentence(`Cuidados e intervenções executadas na admissão: ${joinWithAnd(care.careItems.map((c) => c.toLowerCase()))}`));
  }
  if (care?.otherCareDescription?.trim()) {
    p5Sentences.push(formatSentence(`Outros cuidados de admissão: ${care.otherCareDescription.trim()}`));
  }

  // Dispositivos instalados na admissão
  const inst = form.installedDevices;
  if (inst?.installedInAdmission === 'Sim' && inst.list && inst.list.length > 0) {
    inst.list.forEach((dev) => {
      const name = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type || 'dispositivo';
      const loc = dev.location ? ` em ${dev.location}` : '';
      p5Sentences.push(formatSentence(`Realizada instalação/punção de ${name}${loc} durante o acolhimento`));
    });
  }

  // Pertences
  const bel = form.belongings;
  if (bel?.status && bel.status !== 'Não informado' && bel.status !== 'Sem pertences informados' && bel.status.trim()) {
    const belStr = bel.status === 'Outro' && bel.statusCustom ? bel.statusCustom : bel.status;
    p5Sentences.push(formatSentence(`Pertences: ${belStr.toLowerCase()}`));
  }

  // Intercorrências e Comunicação Médica
  const comp = form.complicationsAndCommunication;
  if (comp?.hasComplication && comp.hasComplication !== 'Não informado' && comp.hasComplication.trim()) {
    if (comp.hasComplication === 'Não') {
      p5Sentences.push('Sem intercorrências registradas durante a admissão.');
    } else if (comp.hasComplication === 'Sim') {
      const t = comp.complicationTime ? `Às ${comp.complicationTime}, ` : '';
      const d = comp.complicationDescription || 'intercorrência registrada';
      p5Sentences.push(formatSentence(`${t}${d}`));
      if (comp.nursingActionsTaken) p5Sentences.push(formatSentence(`Condutas imediatas de enfermagem: ${comp.nursingActionsTaken}`));
      if (comp.patientResponse) p5Sentences.push(formatSentence(`Evolução do quadro: ${comp.patientResponse}`));
    }
  }
  if (comp?.communicatedToMedicalTeam === 'Sim') {
    const cT = comp.communicationTime ? ` às ${comp.communicationTime}` : '';
    p5Sentences.push(formatSentence(`Caso e condutas discutidos com equipe médica${cT}`));
  }

  // Condutas e Plano Inicial de Cuidados de Enfermagem
  const plan = form.nursingPlan;
  if (plan?.planItems && plan.planItems.length > 0) {
    p5Sentences.push(formatSentence(`Plano inicial de cuidados de enfermagem: ${joinWithAnd(plan.planItems.map((p) => p.toLowerCase()))}`));
  }
  if (plan?.customPlanDetails?.trim()) {
    p5Sentences.push(formatSentence(`Orientações assistenciais específicas: ${plan.customPlanDetails.trim()}`));
  }

  // Situação Final (SOMENTE se preenchida)
  const fin = form.finalStatus;
  if (fin?.conditions && fin.conditions.length > 0 && !fin.conditions.includes('Não informado')) {
    const valid = fin.conditions.filter((c) => c && c.trim());
    if (valid.length > 0) {
      const fStrs = valid.map((c) => {
        if (c === 'Outra situação' && fin.conditionCustom) return fin.conditionCustom;
        return c.toLowerCase();
      });
      p5Sentences.push(formatSentence(joinWithAnd(fStrs)));
    }
  }

  if (p5Sentences.length > 0) {
    paragraphs.push(p5Sentences.join(' '));
  }

  if (paragraphs.length === 0) {
    return 'Nenhum dado clínico registrado para a admissão de enfermagem.';
  }

  return paragraphs.join('\n\n');
}
