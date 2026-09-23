import { TechnicianAdmissionForm } from '../types/admissionClinical';
import {
  formatSentence,
  joinWithAnd,
  haveIdenticalDeviceStatus,
  buildDeviceStatusDescription,
} from './outputRules';
import { normalizeAdmissionForm } from '../utils/admissionValidator';

export const ADMISSION_CARE_TEXT_MAP: Record<string, string> = {
  'Acomodação no leito': 'paciente acomodado no leito',
  'Orientações iniciais conforme rotina institucional': 'orientações iniciais fornecidas conforme rotina institucional',
  'Monitorização de sinais vitais': 'realizada monitorização de sinais vitais',
  'Instalação de monitorização multiparamétrica': 'instalada monitorização multiparamétrica',
  'Administração de medicamentos conforme prescrição': 'administração de medicamentos conforme prescrição',
  'Instalação/troca de soroterapia': 'instalação/troca de soroterapia',
  'Cuidados com dispositivos': 'cuidados com dispositivos',
  'Higiene corporal': 'realizada higiene corporal',
  'Higiene oral': 'realizada higiene oral',
  'Mudança de decúbito': 'realizada mudança de decúbito',
  'Aspiração de vias aéreas': 'realizada aspiração de vias aéreas',
  'Controle de balanço hídrico': 'controle de balanço hídrico',
  'Coleta de exames laboratoriais': 'coleta de exames laboratoriais',
  'Curativo': 'realizado curativo',
  'Cabeceira elevada': 'mantida cabeceira elevada',
  'Grades de proteção elevadas': 'mantidas grades de proteção elevadas',
};

/**
 * TechnicianAdmissionNoteBuilder
 * 
 * Generates an objective, deterministic nursing admission note (Admissão — Anotação de Enfermagem)
 * strictly tailored for Nursing Technicians in ER / Emergency.
 * 
 * Strict Narrative Order:
 * 1. Recebimento (momento, local)
 * 2. Procedência
 * 3. Forma de chegada
 * 4. Acompanhante
 * 5. Identificação e segurança
 * 6. Alergia / precaução
 * 7. Motivo informado e comorbidades
 * 8. Condições observadas / queixas
 * 9. Sinais vitais
 * 10. Dor
 * 11. Neurológico
 * 12. Respiratório
 * 13. Perfusão / cardiovascular
 * 14. Nutrição / gastrointestinal
 * 15. Eliminações
 * 16. Dispositivos já presentes na admissão
 * 17. Pele
 * 18. Mobilidade / higiene
 * 19. Cuidados realizados na admissão
 * 20. Dispositivos / procedimentos instalados durante a admissão
 * 21. Pertences
 * 22. Intercorrências
 * 23. Comunicação
 * 24. Situação final (SOMENTE se preenchida)
 */
export function buildTechnicianAdmissionNote(rawForm: Partial<TechnicianAdmissionForm>): string {
  // Normalize fields first
  const form: Partial<TechnicianAdmissionForm> = rawForm ? (rawForm as any) : {};
  const paragraphs: string[] = [];

  // ==========================================
  // PARÁGRAFO 1: Recebimento, Procedência, Forma de Chegada, Acompanhamento, Identificação, Alergia, Motivo e Comorbidades
  // ==========================================
  const p1Sentences: string[] = [];

  // 1. Recebimento
  const ctx = form.context;
  const orig = form.origin;

  let leadRecebimento = 'Recebo paciente';
  if (ctx?.location && ctx.location.trim()) {
    const loc = ctx.location === 'Outro' && ctx.locationCustom ? ctx.locationCustom : ctx.location;
    leadRecebimento = loc.toLowerCase().startsWith('leito') ? 'Recebo paciente no leito' : `Recebo paciente em ${loc}`;
  }

  const receptionModifiers: string[] = [];

  // 2. Procedência
  if (orig?.patientOrigin && orig.patientOrigin !== 'Não informado' && orig.patientOrigin.trim()) {
    const origStr = orig.patientOrigin === 'Outro' && orig.originCustom ? orig.originCustom : orig.patientOrigin;
    receptionModifiers.push(`proveniente de ${origStr}`);
  }

  // 3. Forma de chegada
  let arrivalInMaca = false;
  let arrivalInWheelchair = false;
  if (orig?.arrivalModes && orig.arrivalModes.length > 0 && !orig.arrivalModes.includes('Não informado')) {
    const modes = orig.arrivalModes.map((m) => {
      if (m === 'Ambulância') return 'trazido por ambulância';
      if (m === 'Maca') {
        arrivalInMaca = true;
        return 'chegando ao setor em maca';
      }
      if (m === 'Cadeira de rodas') {
        arrivalInWheelchair = true;
        return 'chegando ao setor em cadeira de rodas';
      }
      if (m === 'Deambulando') return 'chegando deambulando';
      if (m === 'Outro' && orig.arrivalModesCustom) return orig.arrivalModesCustom;
      return m.toLowerCase();
    });
    receptionModifiers.push(joinWithAnd(modes));
  }

  // 4. Acompanhamento
  if (ctx?.accompaniment && ctx.accompaniment !== 'Não informado' && ctx.accompaniment.trim()) {
    if (ctx.accompaniment === 'Desacompanhado') {
      receptionModifiers.push('desacompanhado');
    } else if (ctx.accompaniment === 'Familiar') {
      receptionModifiers.push('acompanhado por familiar');
    } else if (ctx.accompaniment === 'Responsável') {
      receptionModifiers.push('acompanhado por responsável');
    } else if (ctx.accompaniment === 'Cuidador') {
      receptionModifiers.push('acompanhado por cuidador');
    } else if (ctx.accompaniment === 'Equipe assistencial') {
      receptionModifiers.push('acompanhado por equipe assistencial');
    } else if (ctx.accompaniment === 'Outro' && ctx.accompanimentCustom) {
      receptionModifiers.push(`acompanhado por ${ctx.accompanimentCustom}`);
    }
  }

  // Equipe de transporte (opcional)
  if (orig?.accompaniedByTransportTeam === 'Sim' && orig.transportTeamType) {
    const tType = orig.transportTeamType === 'Outra' && orig.transportTeamTypeCustom ? orig.transportTeamTypeCustom : orig.transportTeamType;
    receptionModifiers.push(`transporte assistido por ${tType}`);
  }

  if (receptionModifiers.length > 0) {
    p1Sentences.push(formatSentence(`${leadRecebimento}, ${receptionModifiers.join(', ')}`));
  } else if (ctx?.location || ctx?.moment) {
    p1Sentences.push(formatSentence(leadRecebimento));
  }

  // 5. Identificação e Segurança
  const iden = form.identification;
  const idParts: string[] = [];
  if (iden?.wristbandChecked === 'Sim' && iden?.bedSignChecked === 'Sim') {
    idParts.push('identificação conferida por pulseira e placa de identificação do leito');
  } else if (iden?.wristbandChecked === 'Sim') {
    idParts.push('identificação conferida por pulseira');
  } else if (iden?.bedSignChecked === 'Sim') {
    idParts.push('identificação conferida por placa de identificação do leito');
  }

  // 6. Alergias e Precaução
  if (iden?.allergies && iden.allergies !== 'Não informado' && iden.allergies.trim()) {
    if (iden.allergies === 'Não referidas') {
      idParts.push('sem alergias referidas');
    } else if (iden.allergies === 'Sim') {
      idParts.push(iden.allergiesDetails ? `alergia(s) informada(s): ${iden.allergiesDetails}` : 'alergias referidas');
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

  // 7. Motivo informado e comorbidades
  const rep = form.reportedInformation;
  if (rep?.admissionReason?.trim()) {
    p1Sentences.push(`Motivo informado da admissão: ${rep.admissionReason.trim()}.`);
  }
  if (rep?.relevantComorbidities?.trim()) {
    p1Sentences.push(`Comorbidades informadas: ${rep.relevantComorbidities.trim()}.`);
  }

  if (p1Sentences.length > 0) {
    paragraphs.push(p1Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 2: Condições Observadas na Chegada, Queixas, Nível de Consciência, Sinais Vitais e Dor
  // ==========================================
  const p2Sentences: string[] = [];

  // Consciência e Orientação
  const neuro = form.neurological;
  const neuroObs: string[] = [];
  if (neuro?.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado' && neuro.consciousnessLevel.trim()) {
    const cLevel = neuro.consciousnessLevel === 'Outro' && neuro.consciousnessCustom ? neuro.consciousnessCustom : neuro.consciousnessLevel;
    neuroObs.push(cLevel.toLowerCase());
  }
  if (neuro?.orientation && neuro.orientation !== 'Não avaliado' && neuro.orientation !== 'Não avaliável' && neuro.orientation.trim()) {
    neuroObs.push(neuro.orientation.toLowerCase());
  }

  // Comportamento e Higiene observada
  const arr = form.arrivalCondition;
  if (arr?.behavior && arr.behavior.length > 0 && !arr.behavior.includes('Não avaliado')) {
    const behStr = joinWithAnd(arr.behavior.map((b) => b.toLowerCase()));
    neuroObs.push(behStr);
  }
  if (arr?.hygiene && arr.hygiene !== 'Não informado' && arr.hygiene !== 'Não avaliada' && arr.hygiene.trim()) {
    if (arr.hygiene === 'Preservada') neuroObs.push('com higiene preservada');
    else if (arr.hygiene === 'Necessita cuidados') neuroObs.push('necessitando de cuidados de higiene');
    else if (arr.hygiene === 'Higiene prejudicada') neuroObs.push('com higiene prejudicada');
  }

  if (neuroObs.length > 0) {
    p2Sentences.push(formatSentence(`Apresenta-se ${neuroObs.join(', ')}`));
  }

  // Queixas na chegada
  if (rep?.complaints && rep.complaints !== 'Não informado' && rep.complaints !== 'Não avaliado' && rep.complaints.trim()) {
    const srcStr = rep.informationSource && rep.informationSource !== 'Não informado' && rep.informationSource !== 'Paciente'
      ? ` (informado por ${rep.informationSource === 'Outra' && rep.informationSourceCustom ? rep.informationSourceCustom : rep.informationSource.toLowerCase()})`
      : '';
    if (rep.complaints === 'Sem queixas referidas no momento') {
      p2Sentences.push('Sem queixas referidas no momento da admissão.');
    } else if (rep.complaints === 'Com queixa') {
      p2Sentences.push(rep.complaintsDetails ? `Refere queixa de ${rep.complaintsDetails}${srcStr}.` : `Refere queixas no momento${srcStr}.`);
    } else if (rep.complaints === 'Impossibilitado de informar') {
      p2Sentences.push(`Impossibilitado de informar queixas no momento${srcStr}.`);
    }
  }

  // Escalas neurológicas (Glasgow, RASS)
  if (neuro?.glasgowScore !== undefined) {
    p2Sentences.push(`Escala de Coma de Glasgow: ${neuro.glasgowScore}.`);
  }
  if (neuro?.rassScore !== undefined) {
    const sign = neuro.rassScore > 0 ? '+' : '';
    p2Sentences.push(`Escala RASS: ${sign}${neuro.rassScore}.`);
  }

  // 9. Sinais Vitais Aferidos (SEM INTERPRETAÇÃO)
  const vitals = form.vitalSigns;
  const vitalsList: string[] = [];
  if (vitals) {
    if (vitals.systolicBP && vitals.diastolicBP) {
      vitalsList.push(`PA ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`);
    } else if (vitals.systolicBP) {
      vitalsList.push(`PA sistólica ${vitals.systolicBP} mmHg`);
    }
    if (vitals.meanArterialPressure) {
      vitalsList.push(`PAM ${vitals.meanArterialPressure} mmHg`);
    }
    if (vitals.heartRate) {
      vitalsList.push(`FC ${vitals.heartRate} bpm`);
    }
    if (vitals.respiratoryRate) {
      vitalsList.push(`FR ${vitals.respiratoryRate} irpm`);
    }
    if (vitals.oxygenSaturation) {
      vitalsList.push(`SpO₂ ${vitals.oxygenSaturation}%`);
    }
    if (vitals.temperature) {
      vitalsList.push(`temperatura ${vitals.temperature} °C`);
    }
    if (vitalsList.length > 0) {
      p2Sentences.push(`Sinais vitais aferidos: ${joinWithAnd(vitalsList)}.`);
    }
  }

  // 10. Dor
  const pain = form.pain;
  if (pain) {
    if (pain.assessmentType === 'Escala numérica 0–10' && pain.numericScaleValue !== undefined) {
      let painText = `Refere dor ${pain.numericScaleValue}/10 em escala numérica`;
      const painDetails: string[] = [];
      if (pain.location) painDetails.push(`em ${pain.location}`);
      if (pain.characteristics) painDetails.push(`tipo ${pain.characteristics}`);
      if (painDetails.length > 0) {
        painText += ` (${painDetails.join(', ')})`;
      }
      p2Sentences.push(formatSentence(painText));
    } else if (pain.assessmentType === 'Outra escala' && pain.otherScaleName) {
      let painText = `Dor avaliada pela escala ${pain.otherScaleName}: ${pain.otherScaleResult || 'sem valor'}`;
      if (pain.location) painText += ` em ${pain.location}`;
      p2Sentences.push(formatSentence(painText));
    } else if (pain.assessmentType === 'Não avaliável') {
      p2Sentences.push('Dor não avaliável na admissão.');
    }
  }

  if (p2Sentences.length > 0) {
    paragraphs.push(p2Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 3: Respiratório, Perfusão/Cardiovascular, Nutrição/Gastrointestinal, Eliminações e Dispositivos Já Presentes
  // ==========================================
  const p3Sentences: string[] = [];

  // Respiratório
  const resp = form.respiratory;
  if (resp) {
    if (resp.respiratorySupport && resp.respiratorySupport !== 'Não informado' && resp.respiratorySupport.trim()) {
      if (resp.respiratorySupport === 'Ar ambiente') {
        let disc = '';
        if (resp.respiratoryDistress === 'Ausente') disc = ', sem sinais observados de desconforto respiratório';
        else if (resp.respiratoryDistress === 'Presente') disc = ', com desconforto respiratório observado';
        p3Sentences.push(`Em ar ambiente${disc}.`);
      } else if (resp.respiratorySupport === 'Oxigenoterapia') {
        const o2Parts: string[] = [];
        if (resp.oxygenDevice) o2Parts.push(`sob ${resp.oxygenDevice.toLowerCase()}`);
        if (resp.oxygenFlowRate) o2Parts.push(`a ${resp.oxygenFlowRate} L/min`);
        if (resp.oxygenFiO2) o2Parts.push(`(FiO₂ estimada: ${resp.oxygenFiO2}%)`);
        p3Sentences.push(formatSentence(`Em oxigenoterapia ${o2Parts.join(' ')}`));
      } else if (resp.respiratorySupport === 'VNI') {
        p3Sentences.push('Em ventilação não invasiva (VNI).');
      } else if (resp.respiratorySupport === 'VMI') {
        const vmiVia = resp.vmiAirway ? ` via ${resp.vmiAirway}` : '';
        p3Sentences.push(`Em ventilação mecânica invasiva${vmiVia}.`);
      }
    }
  }

  // Cardiovascular / Perfusão objetiva
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
    if (cardio.edema && cardio.edema !== 'Não avaliado' && cardio.edema.trim()) {
      if (cardio.edema === 'Ausente') cObs.push('sem edema');
      else if (cardio.edema === 'Presente') {
        const loc = cardio.edemaLocations?.length ? ` em ${cardio.edemaLocations.join(', ')}` : '';
        cObs.push(`edema presente${loc}`);
      }
    }
    if (cObs.length > 0) {
      p3Sentences.push(formatSentence(`Perfusão e circulação: ${joinWithAnd(cObs)}`));
    }
  }

  // Nutrição / Gastrointestinal
  const nut = form.nutrition;
  if (nut?.status && nut.status !== 'Não informado' && nut.status.trim()) {
    if (nut.status === 'Dieta por via oral') {
      const acc = nut.oralAcceptance ? `, com aceitação ${nut.oralAcceptance.toLowerCase()}` : '';
      p3Sentences.push(`Em dieta por via oral${acc}.`);
    } else if (nut.status === 'Dieta enteral') {
      p3Sentences.push('Em dieta enteral.');
    } else if (nut.status === 'Jejum') {
      p3Sentences.push('Em jejum.');
    } else if (nut.status === 'Dieta parenteral') {
      p3Sentences.push('Em nutrição parenteral.');
    }
  }

  // Eliminações
  const elim = form.elimination;
  if (elim) {
    if (elim.diuresis && elim.diuresis !== 'Não informado' && elim.diuresis !== 'Não avaliada' && elim.diuresis.trim()) {
      if (elim.urinaryRoute === 'Espontânea') {
        p3Sentences.push('Diurese espontânea presente.');
      } else if (elim.urinaryRoute === 'SVD') {
        const svdParts: string[] = [];
        if (elim.svdCaliber) svdParts.push(`calibre ${elim.svdCaliber}`);
        if (elim.svdAspect) svdParts.push(`aspecto ${elim.svdAspect.toLowerCase()}`);
        if (elim.svdOutputVolume) svdParts.push(`volume: ${elim.svdOutputVolume} mL`);
        p3Sentences.push(
          formatSentence(`Diurese por SVD${svdParts.length > 0 ? ` (${svdParts.join(', ')})` : ''}`)
        );
      } else {
        p3Sentences.push(`Diurese ${elim.diuresis.toLowerCase()}.`);
      }
    }

    if (elim.bowelMovement && elim.bowelMovement !== 'Não informado' && elim.bowelMovement !== 'Não avaliada' && elim.bowelMovement.trim()) {
      if (elim.bowelMovement === 'Presente') {
        const asp = elim.bowelAspect ? ` (${elim.bowelAspect.toLowerCase()})` : '';
        p3Sentences.push(`Evacuação presente${asp}.`);
      } else if (elim.bowelMovement === 'Ausente') {
        p3Sentences.push('Sem evacuação relatada na chegada.');
      }
    }
  }

  // Dispositivos JÁ PRESENTES na admissão
  const existingDevs = form.existingDevices?.list?.filter((d) => d.type?.trim() || d.location?.trim()) || [];
  if (existingDevs.length > 0) {
    if (existingDevs.length === 2 && haveIdenticalDeviceStatus(existingDevs[0], existingDevs[1])) {
      const d1Name = existingDevs[0].type === 'Outro' && existingDevs[0].customType ? existingDevs[0].customType : existingDevs[0].type;
      const d2Name = existingDevs[1].type === 'Outro' && existingDevs[1].customType ? existingDevs[1].customType : existingDevs[1].type;
      const d1Loc = existingDevs[0].location || 'sítio informado';
      const d2Loc = existingDevs[1].location || 'sítio informado';
      const statusStr = buildDeviceStatusDescription(existingDevs[0], true);
      p3Sentences.push(
        formatSentence(
          `Mantém ${d1Name} em ${d1Loc} e ${d2Name} em ${d2Loc} já presentes na admissão${statusStr ? `, ${statusStr}` : ''}`
        )
      );
    } else {
      existingDevs.forEach((dev) => {
        const name = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type || 'Dispositivo';
        const loc = dev.location ? ` em ${dev.location}` : '';
        const statusStr = buildDeviceStatusDescription(dev, false);
        p3Sentences.push(
          formatSentence(`Mantém ${name}${loc} já presente na admissão${statusStr ? `, ${statusStr}` : ''}`)
        );
      });
    }
  }

  if (p3Sentences.length > 0) {
    paragraphs.push(p3Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 4: Pele, Mobilidade, Cuidados Realizados, Dispositivos Instalados na Admissão, Pertences, Intercorrências e Comunicação
  // ==========================================
  const p4Sentences: string[] = [];

  // Pele
  const skin = form.skin;
  if (skin?.integrity && skin.integrity !== 'Não avaliada' && skin.integrity.trim()) {
    if (skin.integrity === 'Íntegra') {
      p4Sentences.push('Pele íntegra.');
    } else if (skin.integrity === 'Com alteração/lesão') {
      const lesionParts: string[] = [];
      if (skin.lesionLocation) lesionParts.push(`em ${skin.lesionLocation}`);
      if (skin.lesionDressingPresent === 'Sim') lesionParts.push('com curativo presente');
      if (skin.lesionDescription) lesionParts.push(`(${skin.lesionDescription})`);
      p4Sentences.push(formatSentence(`Presença de alteração/lesão cutânea ${lesionParts.join(' ')}`));
    }
  }

  // Mobilidade na admissão (avoid duplicate "Em maca" if already reported upon arrival)
  const mob = form.mobility;
  if (mob?.condition && mob.condition !== 'Não avaliada' && mob.condition.trim()) {
    if (mob.condition === 'Deambula sem auxílio') {
      p4Sentences.push('Deambula sem auxílio.');
    } else if (mob.condition === 'Deambula com auxílio') {
      p4Sentences.push('Deambula com auxílio.');
    } else if (mob.condition === 'Cadeira de rodas' && !arrivalInWheelchair) {
      p4Sentences.push('Em uso de cadeira de rodas.');
    } else if (mob.condition === 'Em maca' && !arrivalInMaca) {
      p4Sentences.push('Em maca.');
    } else if (mob.condition === 'Restrito ao leito') {
      p4Sentences.push('Restrito ao leito.');
    }
  }

  // Banho realizado na admissão
  const hyg = form.hygiene;
  if (hyg?.bathPerformed && hyg.bathPerformed !== 'Não informado' && hyg.bathPerformed.trim()) {
    if (hyg.bathPerformed === 'Não') {
      // Clean omission
    } else {
      let bStr = `Realizado ${hyg.bathPerformed.toLowerCase()}`;
      if (hyg.tolerance && hyg.tolerance !== 'Não avaliada' && hyg.tolerance !== 'Não informado') {
        bStr += `, com tolerância ${hyg.tolerance.toLowerCase()}`;
      }
      p4Sentences.push(formatSentence(bStr));
    }
  }

  // Cuidados realizados na admissão (apenas os selecionados)
  const care = form.admissionCare;
  const careActionList: string[] = [];
  if (care?.careItems && care.careItems.length > 0) {
    care.careItems.forEach((item) => {
      if (item === 'Outro' && care.otherCareDescription) {
        careActionList.push(care.otherCareDescription);
      } else if (ADMISSION_CARE_TEXT_MAP[item]) {
        careActionList.push(ADMISSION_CARE_TEXT_MAP[item]);
      }
    });
  }

  // Segurança (grades / cabeceira)
  if (mob?.headOfBedElevated === 'Sim' && !careActionList.some((c) => c.includes('cabeceira'))) {
    careActionList.push('mantida cabeceira elevada');
  }
  if (mob?.bedRailsUsed === 'Sim' && !careActionList.some((c) => c.includes('grades'))) {
    careActionList.push('mantidas grades de proteção elevadas');
  }

  if (careActionList.length > 0) {
    p4Sentences.push(formatSentence(joinWithAnd(careActionList)));
  }

  // Dispositivos instalados DURANTE a admissão
  const inst = form.installedDevices;
  if (inst?.installedInAdmission === 'Sim' && inst.list && inst.list.length > 0) {
    inst.list.forEach((dev) => {
      const name = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type || 'dispositivo';
      const loc = dev.location ? ` em ${dev.location}` : '';
      p4Sentences.push(formatSentence(`Realizada instalação/punção de ${name}${loc} durante a admissão`));
    });
  }

  // Pertences
  const bel = form.belongings;
  if (bel?.status && bel.status !== 'Não informado' && bel.status !== 'Sem pertences informados' && bel.status.trim()) {
    let belStr = bel.status === 'Outro' && bel.statusCustom ? bel.statusCustom : bel.status;
    if (bel.statusCustom && bel.status !== 'Outro') {
      belStr += ` (${bel.statusCustom})`;
    }
    p4Sentences.push(formatSentence(`Pertences: ${belStr.toLowerCase()}`));
  }

  // Intercorrências na admissão
  const comp = form.complications;
  if (comp?.hasComplication && comp.hasComplication !== 'Não informado' && comp.hasComplication.trim()) {
    if (comp.hasComplication === 'Não') {
      p4Sentences.push('Sem intercorrências registradas durante a admissão.');
    } else if (comp.hasComplication === 'Sim') {
      const tPrefix = comp.time ? `Às ${comp.time}, ` : '';
      const cDesc = comp.description || 'registrada intercorrência durante a admissão';
      p4Sentences.push(formatSentence(`${tPrefix}${cDesc}`));
      if (comp.actionsTaken) p4Sentences.push(formatSentence(`Condutas realizadas: ${comp.actionsTaken}`));
      if (comp.patientResponse) p4Sentences.push(formatSentence(`Resposta observada: ${comp.patientResponse}`));
      if (comp.communicatedToTeam === 'Sim' && comp.communicatedWho) {
        const commTime = comp.communicationTime ? ` às ${comp.communicationTime}` : '';
        p4Sentences.push(formatSentence(`Comunicado a ${comp.communicatedWho}${commTime}`));
      }
    }
  }

  // Comunicação adicional
  const comm = form.communications;
  if (comm?.communicationNeeded === 'Sim' && comm.professionalType) {
    const who = comm.professionalType === 'Outro profissional' && comm.professionalTypeCustom ? comm.professionalTypeCustom : comm.professionalType;
    const t = comm.time ? ` às ${comm.time}` : '';
    const d = comm.description ? `: ${comm.description}` : '';
    p4Sentences.push(formatSentence(`Realizada comunicação com ${who}${t}${d}`));
  }

  // Situação final - CRITICAL RULE (ADM-016):
  // When finalStatus.conditions is empty or absent, DO NOT create any destination string!
  const finalSt = form.finalStatus;
  if (finalSt?.conditions && finalSt.conditions.length > 0 && !finalSt.conditions.includes('Não informado')) {
    const validConditions = finalSt.conditions.filter((c) => c && c.trim());
    if (validConditions.length > 0) {
      const finStrs = validConditions.map((c) => {
        if (c === 'Outra situação' && finalSt.conditionCustom) return finalSt.conditionCustom;
        if (c === 'Permanece no setor sob cuidados') return 'permanece no setor sob cuidados de enfermagem';
        if (c === 'Mantido em monitorização') return 'mantido em monitorização contínua';
        if (c === 'Encaminhado para outro setor') return 'encaminhado para outro setor assistencial';
        if (c === 'Transferência em andamento') return 'transferência em andamento';
        return c.toLowerCase();
      });
      p4Sentences.push(formatSentence(joinWithAnd(finStrs)));
    }
  }

  if (p4Sentences.length > 0) {
    paragraphs.push(p4Sentences.join(' '));
  }

  // Fallback if form is completely empty
  if (paragraphs.length === 0) {
    return 'Nenhum dado clínico registrado para a anotação de admissão de enfermagem.';
  }

  return paragraphs.join('\n\n');
}
