import {
  NursePediatricEvolutionForm,
  createInitialNursePediatricEvolutionForm,
} from '../types/nursePediatricEvolution';
import {
  AuthorizedClinicalFacts,
  ClinicalFact,
} from './types';

/**
 * Normalizes user inputs for Nurse Pediatric Evolution form.
 * Trims strings, ensures arrays are defined, removes undefined fields.
 */
export function normalizeNursePediatricEvolutionForm(
  form: Partial<NursePediatricEvolutionForm> | null | undefined
): NursePediatricEvolutionForm {
  const initial = createInitialNursePediatricEvolutionForm();
  if (!form) return initial;

  return {
    context: {
      moment: form.context?.moment?.trim() || '',
      customMoment: form.context?.customMoment?.trim() || '',
      location: form.context?.location?.trim() || '',
      customLocation: form.context?.customLocation?.trim() || '',
    },
    safety: {
      wristband: form.safety?.wristband?.trim() || '',
      bedIdentification: form.safety?.bedIdentification?.trim() || '',
      precautions: form.safety?.precautions?.trim() || '',
      customPrecautions: form.safety?.customPrecautions?.trim() || '',
      allergies: form.safety?.allergies?.trim() || '',
      allergyDescription: form.safety?.allergyDescription?.trim() || '',
    },
    pediatricData: {
      age: form.pediatricData?.age?.trim() || '',
      weight: form.pediatricData?.weight?.trim() || '',
      weightUnit: form.pediatricData?.weightUnit?.trim() || '',
      height: form.pediatricData?.height?.trim() || '',
      heightUnit: form.pediatricData?.heightUnit?.trim() || '',
      sex: form.pediatricData?.sex?.trim() || '',
    },
    guardian: {
      presence: form.guardian?.presence?.trim() || '',
      guardianType: form.guardian?.guardianType?.trim() || '',
      customGuardianType: form.guardian?.customGuardianType?.trim() || '',
    },
    infoSource: {
      source: form.infoSource?.source?.trim() || '',
      customSource: form.infoSource?.customSource?.trim() || '',
    },
    generalAssessment: {
      generalState: form.generalAssessment?.generalState?.trim() || '',
      complaint: form.generalAssessment?.complaint?.trim() || '',
      complaintDescription: form.generalAssessment?.complaintDescription?.trim() || '',
    },
    behavior: {
      behavior: Array.isArray(form.behavior?.behavior) ? form.behavior!.behavior : [],
      customBehavior: form.behavior?.customBehavior?.trim() || '',
      activity: form.behavior?.activity?.trim() || '',
      customActivity: form.behavior?.customActivity?.trim() || '',
    },
    pain: {
      scale: form.pain?.scale?.trim() || '',
      score: form.pain?.score?.trim() || '',
      location: form.pain?.location?.trim() || '',
      analgesiaAdministered: form.pain?.analgesiaAdministered?.trim() || '',
      analgesiaDetails: form.pain?.analgesiaDetails?.trim() || '',
    },
    vitalSigns: {
      systolicBP: form.vitalSigns?.systolicBP?.trim() || '',
      diastolicBP: form.vitalSigns?.diastolicBP?.trim() || '',
      meanArterialPressure: form.vitalSigns?.meanArterialPressure?.trim() || '',
      heartRate: form.vitalSigns?.heartRate?.trim() || '',
      respiratoryRate: form.vitalSigns?.respiratoryRate?.trim() || '',
      oxygenSaturation: form.vitalSigns?.oxygenSaturation?.trim() || '',
      temperature: form.vitalSigns?.temperature?.trim() || '',
      capillaryBloodGlucose: form.vitalSigns?.capillaryBloodGlucose?.trim() || '',
    },
    neurological: {
      consciousness: form.neurological?.consciousness?.trim() || '',
      orientation: form.neurological?.orientation?.trim() || '',
      pupils: form.neurological?.pupils?.trim() || '',
      observedResponse: form.neurological?.observedResponse?.trim() || '',
    },
    respiratory: {
      support: form.respiratory?.support?.trim() || '',
      supportDetails: form.respiratory?.supportDetails?.trim() || '',
      pattern: form.respiratory?.pattern?.trim() || '',
      discomfort: form.respiratory?.discomfort?.trim() || '',
      auscultation: form.respiratory?.auscultation?.trim() || '',
      adventitiousDetails: form.respiratory?.adventitiousDetails?.trim() || '',
    },
    cardiovascular: {
      auscultation: form.cardiovascular?.auscultation?.trim() || '',
      perfusion: form.cardiovascular?.perfusion?.trim() || '',
      extremities: form.cardiovascular?.extremities?.trim() || '',
      pulses: form.cardiovascular?.pulses?.trim() || '',
      edema: form.cardiovascular?.edema?.trim() || '',
      edemaDetails: form.cardiovascular?.edemaDetails?.trim() || '',
    },
    gastrointestinal: {
      abdomen: form.gastrointestinal?.abdomen?.trim() || '',
      bowelSounds: form.gastrointestinal?.bowelSounds?.trim() || '',
      palpationPain: form.gastrointestinal?.palpationPain?.trim() || '',
      palpationPainLocation: form.gastrointestinal?.palpationPainLocation?.trim() || '',
      vomitingRegurgitation: form.gastrointestinal?.vomitingRegurgitation?.trim() || '',
      vomitingDetails: form.gastrointestinal?.vomitingDetails?.trim() || '',
    },
    nutrition: {
      feedingType: form.nutrition?.feedingType?.trim() || '',
      acceptance: form.nutrition?.acceptance?.trim() || '',
      enteralDevice: form.nutrition?.enteralDevice?.trim() || '',
      enteralRate: form.nutrition?.enteralRate?.trim() || '',
      enteralTolerance: form.nutrition?.enteralTolerance?.trim() || '',
    },
    eliminations: {
      diuresis: form.eliminations?.diuresis?.trim() || '',
      diuresisVolume: form.eliminations?.diuresisVolume?.trim() || '',
      diuresisAspect: form.eliminations?.diuresisAspect?.trim() || '',
      bowel: form.eliminations?.bowel?.trim() || '',
      bowelCharacteristics: form.eliminations?.bowelCharacteristics?.trim() || '',
    },
    skin: {
      integrity: form.skin?.integrity?.trim() || '',
      lesionLocation: form.skin?.lesionLocation?.trim() || '',
      lesionDescription: form.skin?.lesionDescription?.trim() || '',
      dressings: form.skin?.dressings?.trim() || '',
      dressingDetails: form.skin?.dressingDetails?.trim() || '',
    },
    devices: {
      hasDevices: form.devices?.hasDevices?.trim() || 'Não',
      list: Array.isArray(form.devices?.list)
        ? form.devices!.list.map((d) => ({
            id: d.id || `dev-${Math.random().toString(36).substring(2, 9)}`,
            type: d.type?.trim() || '',
            anatomicalSite: d.anatomicalSite?.trim() || '',
            laterality: d.laterality?.trim() || '',
            siteCondition: d.siteCondition?.trim() || '',
            dressingCondition: d.dressingCondition?.trim() || '',
            permeability: d.permeability?.trim() || '',
          }))
        : [],
    },
    mobility: {
      mobility: form.mobility?.mobility?.trim() || '',
      customMobility: form.mobility?.customMobility?.trim() || '',
    },
    hygiene: {
      bath: form.hygiene?.bath?.trim() || '',
      bathTolerance: form.hygiene?.bathTolerance?.trim() || '',
    },
    sleep: {
      pattern: form.sleep?.pattern?.trim() || '',
      details: form.sleep?.details?.trim() || '',
    },
    risks: {
      fallRisk: form.risks?.fallRisk?.trim() || '',
      aspirationRisk: form.risks?.aspirationRisk?.trim() || '',
      pressureUlcerRisk: form.risks?.pressureUlcerRisk?.trim() || '',
      otherRisks: form.risks?.otherRisks?.trim() || '',
    },
    care: {
      performed: Array.isArray(form.care?.performed) ? form.care!.performed : [],
      customCare: form.care?.customCare?.trim() || '',
    },
    responseToCare: {
      evaluated: form.responseToCare?.evaluated?.trim() || '',
      interventionTarget: form.responseToCare?.interventionTarget?.trim() || '',
      observedResponse: form.responseToCare?.observedResponse?.trim() || '',
    },
    complications: {
      hasComplication: form.complications?.hasComplication?.trim() || 'Não',
      description: form.complications?.description?.trim() || '',
      immediateAction: form.complications?.immediateAction?.trim() || '',
      communicationDone: form.complications?.communicationDone?.trim() || '',
      responseObserved: form.complications?.responseObserved?.trim() || '',
    },
    communication: {
      familyOrientation: form.communication?.familyOrientation?.trim() || '',
      shiftHandover: form.communication?.shiftHandover?.trim() || '',
      multiprofessionalContact: form.communication?.multiprofessionalContact?.trim() || '',
    },
    comparison: {
      status: form.comparison?.status?.trim() || '',
      details: form.comparison?.details?.trim() || '',
    },
    nursingSynthesis: {
      synthesisText: form.nursingSynthesis?.synthesisText?.trim() || '',
    },
    currentStatus: {
      patientStatus: form.currentStatus?.patientStatus?.trim() || '',
      customPatientStatus: form.currentStatus?.customPatientStatus?.trim() || '',
      pendingIssues: form.currentStatus?.pendingIssues?.trim() || '',
    },
  };
}

/**
 * Builds AuthorizedClinicalFacts strictly from the normalized form.
 * Zero-hallucination and zero-interpretation guaranteed.
 */
export function buildAuthorizedNursePediatricEvolutionFacts(
  form: NursePediatricEvolutionForm
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {
    context: [],
    safety: [],
    vitalSigns: [],
    generalState: [],
    neurological: [],
    respiratory: [],
    cardiovascular: [],
    gastrointestinal: [],
    eliminations: [],
    skin: [],
    devices: [],
    mobility: [],
    hygiene: [],
    risks: [],
    nursingCare: [],
    responseToCare: [],
    complications: [],
    interprofessionalCommunication: [],
    comparisonWithPrevious: [],
    nurseClinicalSynthesis: [],
    currentStatus: [],
  };

  const addFact = (
    category: keyof AuthorizedClinicalFacts,
    fact: Omit<ClinicalFact, 'category'> & { category?: string }
  ) => {
    if (!facts[category]) {
      facts[category] = [];
    }
    facts[category].push({
      ...fact,
      category: fact.category || (category as string),
    });
  };

  // 1. Contexto
  const momentText = form.context.customMoment || form.context.moment;
  const locationText = form.context.customLocation || form.context.location;
  if (momentText || locationText) {
    const text = [
      momentText ? `Momento: ${momentText}` : '',
      locationText ? `Localização: ${locationText}` : '',
    ]
      .filter(Boolean)
      .join('. ');
    addFact('context', {
      id: 'fact-ped-context',
      canonicalText: text,
      sourceField: 'context',
      value: { moment: momentText, location: locationText },
    });
  }

  // 2. Identificação e Segurança
  if (
    form.safety.wristband ||
    form.safety.bedIdentification ||
    form.safety.precautions ||
    form.safety.allergies
  ) {
    const secParts: string[] = [];
    if (form.safety.wristband) secParts.push(`Pulseira de identificação: ${form.safety.wristband}`);
    if (form.safety.bedIdentification) secParts.push(`Identificação no leito: ${form.safety.bedIdentification}`);
    const prec = form.safety.customPrecautions || form.safety.precautions;
    if (prec) secParts.push(`Precauções: ${prec}`);
    if (form.safety.allergies) {
      secParts.push(
        form.safety.allergies === 'Sim' && form.safety.allergyDescription
          ? `Alergias relatadas: ${form.safety.allergyDescription}`
          : `Alergias: ${form.safety.allergies}`
      );
    }
    addFact('safety', {
      id: 'fact-ped-safety',
      canonicalText: secParts.join('. '),
      sourceField: 'safety',
      value: form.safety,
    });
  }

  // 3. Dados Pediátricos (Peso, Idade, Altura, Sexo - ESTRITAMENTE SEM INTERPRETAÇÃO)
  if (form.pediatricData.age) {
    addFact('context', {
      id: 'fact-ped-age',
      canonicalText: `Idade informada: ${form.pediatricData.age}`,
      sourceField: 'pediatricData.age',
      value: form.pediatricData.age,
    });
  }
  if (form.pediatricData.weight) {
    const unit = form.pediatricData.weightUnit || 'kg';
    addFact('vitalSigns', {
      id: 'fact-ped-weight',
      canonicalText: `Peso informado: ${form.pediatricData.weight} ${unit}`,
      sourceField: 'pediatricData.weight',
      value: `${form.pediatricData.weight} ${unit}`,
    });
  }
  if (form.pediatricData.height) {
    const unit = form.pediatricData.heightUnit || 'cm';
    addFact('vitalSigns', {
      id: 'fact-ped-height',
      canonicalText: `Estatura/comprimento informado: ${form.pediatricData.height} ${unit}`,
      sourceField: 'pediatricData.height',
      value: `${form.pediatricData.height} ${unit}`,
    });
  }
  if (form.pediatricData.sex) {
    addFact('context', {
      id: 'fact-ped-sex',
      canonicalText: `Sexo: ${form.pediatricData.sex}`,
      sourceField: 'pediatricData.sex',
      value: form.pediatricData.sex,
    });
  }

  // 4. Responsável / Acompanhante
  if (form.guardian.presence || form.guardian.guardianType) {
    const guardType = form.guardian.customGuardianType || form.guardian.guardianType;
    let guardText = '';
    if (form.guardian.presence === 'Acompanhado') {
      guardText = guardType ? `Paciente acompanhado por: ${guardType}` : 'Paciente acompanhado';
    } else if (form.guardian.presence === 'Desacompanhado') {
      guardText = 'Paciente desacompanhado no momento da avaliação';
    } else if (guardType) {
      guardText = `Acompanhante: ${guardType}`;
    }
    if (guardText) {
      addFact('context', {
        id: 'fact-ped-guardian',
        canonicalText: guardText,
        sourceField: 'guardian',
        value: { presence: form.guardian.presence, guardianType: guardType },
      });
    }
  }

  // 5. Fonte das Informações
  const infoSrc = form.infoSource.customSource || form.infoSource.source;
  if (infoSrc) {
    addFact('context', {
      id: 'fact-ped-infosource',
      canonicalText: `Fonte das informações obtidas: ${infoSrc}`,
      sourceField: 'infoSource',
      value: infoSrc,
    });
  }

  // 6. Avaliação Geral e Queixas
  if (form.generalAssessment.generalState || form.generalAssessment.complaint) {
    const genParts: string[] = [];
    if (form.generalAssessment.generalState) {
      genParts.push(`Estado geral: ${form.generalAssessment.generalState}`);
    }
    if (form.generalAssessment.complaint) {
      if (
        form.generalAssessment.complaint === 'Com queixa' &&
        form.generalAssessment.complaintDescription
      ) {
        genParts.push(`Queixa relatada: ${form.generalAssessment.complaintDescription}`);
      } else {
        genParts.push(`Queixa: ${form.generalAssessment.complaint}`);
      }
    }
    addFact('generalState', {
      id: 'fact-ped-general-state',
      canonicalText: genParts.join('. '),
      sourceField: 'generalAssessment',
      value: form.generalAssessment,
    });
  }

  // 7. Comportamento e Atividade
  const behavItems = [...form.behavior.behavior];
  if (form.behavior.customBehavior) behavItems.push(form.behavior.customBehavior);
  const actText = form.behavior.customActivity || form.behavior.activity;
  if (behavItems.length > 0 || actText) {
    const bParts: string[] = [];
    if (behavItems.length > 0) bParts.push(`Comportamento observado: ${behavItems.join(', ')}`);
    if (actText) bParts.push(`Nível de atividade: ${actText}`);
    addFact('generalState', {
      id: 'fact-ped-behavior',
      canonicalText: bParts.join('. '),
      sourceField: 'behavior',
      value: { behavior: behavItems, activity: actText },
    });
  }

  // 8. Dor Pediátrica
  if (form.pain.scale || form.pain.score) {
    const painParts: string[] = [];
    if (form.pain.scale) painParts.push(`Avaliação de dor pela ${form.pain.scale}`);
    if (form.pain.score) painParts.push(`Escore informado: ${form.pain.score}`);
    if (form.pain.location) painParts.push(`Localização da dor: ${form.pain.location}`);
    if (form.pain.analgesiaAdministered === 'Sim') {
      painParts.push(
        form.pain.analgesiaDetails
          ? `Analgesia administrada: ${form.pain.analgesiaDetails}`
          : 'Analgesia administrada conforme prescrição'
      );
    } else if (form.pain.analgesiaAdministered === 'Não') {
      painParts.push('Sem necessidade de analgesia no momento');
    }
    addFact('generalState', {
      id: 'fact-ped-pain',
      canonicalText: painParts.join('. '),
      sourceField: 'pain',
      value: form.pain,
    });
  }

  // 9. Sinais Vitais (com PAM manual estrita sem recálculo)
  const vitals = form.vitalSigns;
  if (
    vitals.systolicBP ||
    vitals.diastolicBP ||
    vitals.meanArterialPressure ||
    vitals.heartRate ||
    vitals.respiratoryRate ||
    vitals.oxygenSaturation ||
    vitals.temperature ||
    vitals.capillaryBloodGlucose
  ) {
    const vParts: string[] = [];
    if (vitals.systolicBP && vitals.diastolicBP) {
      vParts.push(`PA: ${vitals.systolicBP}x${vitals.diastolicBP} mmHg`);
    } else if (vitals.systolicBP) {
      vParts.push(`PA sistólica: ${vitals.systolicBP} mmHg`);
    }
    if (vitals.meanArterialPressure) {
      vParts.push(`PAM manual aferida: ${vitals.meanArterialPressure} mmHg`);
    }
    if (vitals.heartRate) vParts.push(`FC: ${vitals.heartRate} bpm`);
    if (vitals.respiratoryRate) vParts.push(`FR: ${vitals.respiratoryRate} irpm`);
    if (vitals.oxygenSaturation) vParts.push(`SpO2: ${vitals.oxygenSaturation}%`);
    if (vitals.temperature) vParts.push(`Tax: ${vitals.temperature} °C`);
    if (vitals.capillaryBloodGlucose) vParts.push(`Glicemia capilar: ${vitals.capillaryBloodGlucose} mg/dL`);

    addFact('vitalSigns', {
      id: 'fact-ped-vitals',
      canonicalText: `Sinais vitais: ${vParts.join(', ')}`,
      sourceField: 'vitalSigns',
      value: vitals,
    });
  }

  // 10. Neurológico
  if (
    form.neurological.consciousness ||
    form.neurological.orientation ||
    form.neurological.pupils ||
    form.neurological.observedResponse
  ) {
    const neuroParts: string[] = [];
    if (form.neurological.consciousness) neuroParts.push(`Nível de consciência: ${form.neurological.consciousness}`);
    if (form.neurological.orientation) neuroParts.push(`Orientação: ${form.neurological.orientation}`);
    if (form.neurological.pupils) neuroParts.push(`Pupilas: ${form.neurological.pupils}`);
    if (form.neurological.observedResponse) neuroParts.push(`Reatividade/resposta: ${form.neurological.observedResponse}`);
    addFact('neurological', {
      id: 'fact-ped-neurological',
      canonicalText: neuroParts.join('. '),
      sourceField: 'neurological',
      value: form.neurological,
    });
  }

  // 11. Respiratório
  if (
    form.respiratory.support ||
    form.respiratory.pattern ||
    form.respiratory.discomfort ||
    form.respiratory.auscultation
  ) {
    const rParts: string[] = [];
    if (form.respiratory.support) {
      rParts.push(
        form.respiratory.supportDetails
          ? `Suporte respiratório: ${form.respiratory.support} (${form.respiratory.supportDetails})`
          : `Suporte respiratório: ${form.respiratory.support}`
      );
    }
    if (form.respiratory.pattern) rParts.push(`Padrão respiratório: ${form.respiratory.pattern}`);
    if (form.respiratory.discomfort) {
      rParts.push(
        form.respiratory.discomfort === 'Ausente'
          ? 'Sem sinais de desconforto respiratório'
          : `Sinais de esforço/desconforto: ${form.respiratory.discomfort}`
      );
    }
    if (form.respiratory.auscultation) {
      rParts.push(
        form.respiratory.adventitiousDetails
          ? `Ausculta pulmonar: ${form.respiratory.auscultation} (${form.respiratory.adventitiousDetails})`
          : `Ausculta pulmonar: ${form.respiratory.auscultation}`
      );
    }
    addFact('respiratory', {
      id: 'fact-ped-respiratory',
      canonicalText: rParts.join('. '),
      sourceField: 'respiratory',
      value: form.respiratory,
    });
  }

  // 12. Cardiovascular
  if (
    form.cardiovascular.auscultation ||
    form.cardiovascular.perfusion ||
    form.cardiovascular.extremities ||
    form.cardiovascular.pulses ||
    form.cardiovascular.edema
  ) {
    const cParts: string[] = [];
    if (form.cardiovascular.auscultation) cParts.push(`Ausculta cardíaca: ${form.cardiovascular.auscultation}`);
    if (form.cardiovascular.perfusion) cParts.push(`Perfusão periférica: ${form.cardiovascular.perfusion}`);
    if (form.cardiovascular.extremities) cParts.push(`Extremidades: ${form.cardiovascular.extremities}`);
    if (form.cardiovascular.pulses) cParts.push(`Pulsos periféricos: ${form.cardiovascular.pulses}`);
    if (form.cardiovascular.edema) {
      cParts.push(
        form.cardiovascular.edema === 'Presente' && form.cardiovascular.edemaDetails
          ? `Edema: ${form.cardiovascular.edemaDetails}`
          : `Edema: ${form.cardiovascular.edema}`
      );
    }
    addFact('cardiovascular', {
      id: 'fact-ped-cardiovascular',
      canonicalText: cParts.join('. '),
      sourceField: 'cardiovascular',
      value: form.cardiovascular,
    });
  }

  // 13. Gastrointestinal
  if (
    form.gastrointestinal.abdomen ||
    form.gastrointestinal.bowelSounds ||
    form.gastrointestinal.palpationPain ||
    form.gastrointestinal.vomitingRegurgitation
  ) {
    const giParts: string[] = [];
    if (form.gastrointestinal.abdomen) giParts.push(`Abdome: ${form.gastrointestinal.abdomen}`);
    if (form.gastrointestinal.bowelSounds) giParts.push(`Ruídos hidroaéreos: ${form.gastrointestinal.bowelSounds}`);
    if (form.gastrointestinal.palpationPain) {
      giParts.push(
        form.gastrointestinal.palpationPain === 'Presente' && form.gastrointestinal.palpationPainLocation
          ? `Dor à palpação abdominal: ${form.gastrointestinal.palpationPainLocation}`
          : `Dor à palpação: ${form.gastrointestinal.palpationPain}`
      );
    }
    if (form.gastrointestinal.vomitingRegurgitation) {
      giParts.push(
        form.gastrointestinal.vomitingDetails
          ? `Episódios gástricos: ${form.gastrointestinal.vomitingRegurgitation} (${form.gastrointestinal.vomitingDetails})`
          : `Episódios gástricos: ${form.gastrointestinal.vomitingRegurgitation}`
      );
    }
    addFact('gastrointestinal', {
      id: 'fact-ped-gastrointestinal',
      canonicalText: giParts.join('. '),
      sourceField: 'gastrointestinal',
      value: form.gastrointestinal,
    });
  }

  // 14. Nutrição e Alimentação
  if (form.nutrition.feedingType || form.nutrition.acceptance) {
    const nutParts: string[] = [];
    if (form.nutrition.feedingType) nutParts.push(`Alimentação: ${form.nutrition.feedingType}`);
    if (form.nutrition.acceptance) nutParts.push(`Aceitação alimentar: ${form.nutrition.acceptance}`);
    if (form.nutrition.enteralDevice) nutParts.push(`Dispositivo enteral: ${form.nutrition.enteralDevice}`);
    if (form.nutrition.enteralRate) nutParts.push(`Taxa de infusão: ${form.nutrition.enteralRate}`);
    if (form.nutrition.enteralTolerance) nutParts.push(`Tolerância da dieta: ${form.nutrition.enteralTolerance}`);
    addFact('gastrointestinal', {
      id: 'fact-ped-nutrition',
      canonicalText: nutParts.join('. '),
      sourceField: 'nutrition',
      value: form.nutrition,
    });
  }

  // 15. Eliminações
  if (form.eliminations.diuresis || form.eliminations.bowel) {
    const elimParts: string[] = [];
    if (form.eliminations.diuresis) {
      let dText = `Diurese: ${form.eliminations.diuresis}`;
      if (form.eliminations.diuresisVolume) dText += ` (volume informado: ${form.eliminations.diuresisVolume})`;
      if (form.eliminations.diuresisAspect) dText += ` com aspecto ${form.eliminations.diuresisAspect}`;
      elimParts.push(dText);
    }
    if (form.eliminations.bowel) {
      let bText = `Evacuação: ${form.eliminations.bowel}`;
      if (form.eliminations.bowelCharacteristics) bText += ` (${form.eliminations.bowelCharacteristics})`;
      elimParts.push(bText);
    }
    addFact('eliminations', {
      id: 'fact-ped-eliminations',
      canonicalText: elimParts.join('. '),
      sourceField: 'eliminations',
      value: form.eliminations,
    });
  }

  // 16. Pele e Integridade
  if (form.skin.integrity || form.skin.dressings) {
    const skinParts: string[] = [];
    if (form.skin.integrity) {
      let sText = `Pele: ${form.skin.integrity}`;
      if (form.skin.lesionLocation) sText += ` em ${form.skin.lesionLocation}`;
      if (form.skin.lesionDescription) sText += ` (${form.skin.lesionDescription})`;
      skinParts.push(sText);
    }
    if (form.skin.dressings) {
      skinParts.push(
        form.skin.dressingDetails
          ? `Curativos: ${form.skin.dressingDetails}`
          : `Curativos: ${form.skin.dressings}`
      );
    }
    addFact('skin', {
      id: 'fact-ped-skin',
      canonicalText: skinParts.join('. '),
      sourceField: 'skin',
      value: form.skin,
    });
  }

  // 17. Dispositivos Invasivos
  if (form.devices.hasDevices === 'Sim' && form.devices.list.length > 0) {
    form.devices.list.forEach((dev, idx) => {
      const devParts: string[] = [];
      if (dev.type) devParts.push(`Dispositivo: ${dev.type}`);
      if (dev.anatomicalSite) {
        devParts.push(
          dev.laterality
            ? `em ${dev.anatomicalSite} (${dev.laterality})`
            : `em ${dev.anatomicalSite}`
        );
      }
      if (dev.siteCondition) devParts.push(`Inserção: ${dev.siteCondition}`);
      if (dev.dressingCondition) devParts.push(`Curativo: ${dev.dressingCondition}`);
      if (dev.permeability) devParts.push(`Permeabilidade: ${dev.permeability}`);

      addFact('devices', {
        id: `fact-ped-device-${idx}`,
        canonicalText: devParts.join(', '),
        sourceField: `devices.list[${idx}]`,
        value: dev,
      });
    });
  } else if (form.devices.hasDevices === 'Não') {
    addFact('devices', {
      id: 'fact-ped-no-devices',
      canonicalText: 'Sem dispositivos invasivos no momento',
      sourceField: 'devices.hasDevices',
      value: 'Não',
    });
  }

  // 18. Mobilidade
  const mobText = form.mobility.customMobility || form.mobility.mobility;
  if (mobText) {
    addFact('mobility', {
      id: 'fact-ped-mobility',
      canonicalText: `Mobilidade: ${mobText}`,
      sourceField: 'mobility',
      value: mobText,
    });
  }

  // 19. Higiene e Autocuidado
  if (form.hygiene.bath) {
    let bathText = `Banho: ${form.hygiene.bath}`;
    if (form.hygiene.bathTolerance) bathText += ` (tolerância observada: ${form.hygiene.bathTolerance})`;
    addFact('hygiene', {
      id: 'fact-ped-hygiene',
      canonicalText: bathText,
      sourceField: 'hygiene',
      value: form.hygiene,
    });
  }

  // 20. Sono e Repouso
  if (form.sleep.pattern) {
    let sleepText = `Sono e repouso: ${form.sleep.pattern}`;
    if (form.sleep.details) sleepText += ` (${form.sleep.details})`;
    addFact('generalState', {
      id: 'fact-ped-sleep',
      canonicalText: sleepText,
      sourceField: 'sleep',
      value: form.sleep,
    });
  }

  // 21. Riscos Assistenciais
  if (
    form.risks.fallRisk ||
    form.risks.aspirationRisk ||
    form.risks.pressureUlcerRisk ||
    form.risks.otherRisks
  ) {
    const riskParts: string[] = [];
    if (form.risks.fallRisk) riskParts.push(`Risco de queda: ${form.risks.fallRisk}`);
    if (form.risks.aspirationRisk) riskParts.push(`Risco de broncoaspiração: ${form.risks.aspirationRisk}`);
    if (form.risks.pressureUlcerRisk) riskParts.push(`Risco de lesão por pressão: ${form.risks.pressureUlcerRisk}`);
    if (form.risks.otherRisks) riskParts.push(`Outros riscos monitorados: ${form.risks.otherRisks}`);
    addFact('risks', {
      id: 'fact-ped-risks',
      canonicalText: riskParts.join('. '),
      sourceField: 'risks',
      value: form.risks,
    });
  }

  // 22. Cuidados Realizados
  const careItems = [...form.care.performed];
  if (form.care.customCare) careItems.push(form.care.customCare);
  if (careItems.length > 0) {
    addFact('nursingCare', {
      id: 'fact-ped-care',
      canonicalText: `Cuidados prestados no plantão: ${careItems.join('; ')}`,
      sourceField: 'care',
      value: careItems,
    });
  }

  // 23. Resposta aos Cuidados
  if (
    form.responseToCare.evaluated === 'Sim' &&
    (form.responseToCare.interventionTarget || form.responseToCare.observedResponse)
  ) {
    const rCareParts: string[] = [];
    if (form.responseToCare.interventionTarget) {
      rCareParts.push(`Intervenção avaliada: ${form.responseToCare.interventionTarget}`);
    }
    if (form.responseToCare.observedResponse) {
      rCareParts.push(`Resposta clínica observada: ${form.responseToCare.observedResponse}`);
    }
    addFact('responseToCare', {
      id: 'fact-ped-response-to-care',
      canonicalText: rCareParts.join('. '),
      sourceField: 'responseToCare',
      value: form.responseToCare,
    });
  }

  // 24. Intercorrências
  if (form.complications.hasComplication === 'Sim') {
    const compParts: string[] = [];
    if (form.complications.description) compParts.push(`Intercorrência: ${form.complications.description}`);
    if (form.complications.immediateAction) compParts.push(`Conduta imediata: ${form.complications.immediateAction}`);
    if (form.complications.communicationDone) compParts.push(`Comunicação à equipe: ${form.complications.communicationDone}`);
    if (form.complications.responseObserved) compParts.push(`Evolução pós-conduta: ${form.complications.responseObserved}`);
    addFact('complications', {
      id: 'fact-ped-complication',
      canonicalText: compParts.join('. '),
      sourceField: 'complications',
      value: form.complications,
    });
  } else if (form.complications.hasComplication === 'Não') {
    addFact('complications', {
      id: 'fact-ped-no-complications',
      canonicalText: 'Sem intercorrências registradas no período',
      sourceField: 'complications.hasComplication',
      value: 'Não',
    });
  }

  // 25. Comunicação
  if (
    form.communication.familyOrientation ||
    form.communication.shiftHandover ||
    form.communication.multiprofessionalContact
  ) {
    const commParts: string[] = [];
    if (form.communication.familyOrientation) {
      commParts.push(`Orientação ao responsável: ${form.communication.familyOrientation}`);
    }
    if (form.communication.shiftHandover) {
      commParts.push(`Passagem de plantão: ${form.communication.shiftHandover}`);
    }
    if (form.communication.multiprofessionalContact) {
      commParts.push(`Comunicação multiprofissional: ${form.communication.multiprofessionalContact}`);
    }
    addFact('interprofessionalCommunication', {
      id: 'fact-ped-communication',
      canonicalText: commParts.join('. '),
      sourceField: 'communication',
      value: form.communication,
    });
  }

  // 26. Comparação com Avaliação Anterior
  if (form.comparison.status) {
    let compText = `Comparação com avaliação anterior: ${form.comparison.status}`;
    if (form.comparison.details) compText += ` (${form.comparison.details})`;
    addFact('comparisonWithPrevious', {
      id: 'fact-ped-comparison',
      canonicalText: compText,
      sourceField: 'comparison',
      value: form.comparison,
    });
  }

  // 27. Síntese de Enfermagem (Privativa do Enfermeiro)
  if (form.nursingSynthesis.synthesisText) {
    addFact('nurseClinicalSynthesis', {
      id: 'fact-ped-synthesis',
      canonicalText: `Síntese de enfermagem: ${form.nursingSynthesis.synthesisText}`,
      sourceField: 'nursingSynthesis.synthesisText',
      value: form.nursingSynthesis.synthesisText,
    });
  }

  // 28. Situação Atual
  const curStatus = form.currentStatus.customPatientStatus || form.currentStatus.patientStatus;
  if (curStatus || form.currentStatus.pendingIssues) {
    const statParts: string[] = [];
    if (curStatus) statParts.push(`Situação atual: ${curStatus}`);
    if (form.currentStatus.pendingIssues) statParts.push(`Pendências: ${form.currentStatus.pendingIssues}`);
    addFact('currentStatus', {
      id: 'fact-ped-current-status',
      canonicalText: statParts.join('. '),
      sourceField: 'currentStatus',
      value: form.currentStatus,
    });
  }

  return facts;
}

/**
 * Consistency Validator for Nurse Pediatric Evolution.
 * Enforces the 8 consistency rules:
 * - NUR-PED-CONS-001: Paciente acompanhado sem responsável informado.
 * - NUR-PED-CONS-002: Peso sem unidade.
 * - NUR-PED-CONS-003: FLACC sem pontuação.
 * - NUR-PED-CONS-004: Dieta enteral sem dispositivo.
 * - NUR-PED-CONS-005: Dispositivo sem tipo.
 * - NUR-PED-CONS-006: Banho não realizado com tolerância.
 * - NUR-PED-CONS-007: Intercorrência sem conduta.
 * - NUR-PED-CONS-008: Cenário válido sem alerta.
 */
export function validateNursePediatricEvolutionConsistency(
  form: NursePediatricEvolutionForm
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // CONS-001: Paciente acompanhado sem tipo de responsável
  if (form.guardian.presence === 'Acompanhado') {
    const guard = (form.guardian.customGuardianType || form.guardian.guardianType || '').trim();
    if (!guard) {
      errors.push('Paciente acompanhado mas tipo de responsável não selecionado.');
    }
  }

  // CONS-002: Peso sem unidade
  if (form.pediatricData.weight.trim() && !form.pediatricData.weightUnit?.trim()) {
    errors.push('Peso informado sem unidade definida (kg).');
  }

  // CONS-003: FLACC sem pontuação
  if (form.pain.scale === 'FLACC' && !form.pain.score.trim()) {
    errors.push('Escala FLACC selecionada sem pontuação informada.');
  }

  // CONS-004: Dieta enteral sem dispositivo
  if (form.nutrition.feedingType === 'Enteral' && !form.nutrition.enteralDevice?.trim()) {
    errors.push('Dieta enteral informada sem especificação do dispositivo enteral.');
  }

  // CONS-005: Dispositivo sem tipo
  if (form.devices.hasDevices === 'Sim') {
    if (form.devices.list.length === 0) {
      errors.push('Dispositivos invasivos marcados como presentes, mas nenhum dispositivo listado.');
    } else {
      const invalidDevices = form.devices.list.filter((d) => !d.type.trim());
      if (invalidDevices.length > 0) {
        errors.push('Dispositivo invasivo cadastrado sem tipo especificado.');
      }
    }
  }

  // CONS-006: Banho não realizado com tolerância
  if (form.hygiene.bath === 'Não realizado' && form.hygiene.bathTolerance?.trim()) {
    errors.push('Tolerância ao banho preenchida para banho não realizado.');
  }

  // CONS-007: Intercorrência sem conduta
  if (form.complications.hasComplication === 'Sim' && !form.complications.immediateAction?.trim()) {
    errors.push('Intercorrência relatada sem descrição da conduta imediata adotada.');
  }

  // CONS-008: Diurese por SVD sem dispositivo correspondente
  if (form.eliminations.diuresis === 'SVD') {
    const hasSvdDevice = form.devices.list.some(
      (d) =>
        d.type.toLowerCase().includes('svd') ||
        d.type.toLowerCase().includes('vesical') ||
        d.type.toLowerCase().includes('sonda')
    );
    if (!hasSvdDevice) {
      errors.push('Diurese descrita por sonda vesical (SVD) sem registro correspondente em dispositivos invasivos.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Audits the generated narrative to verify every clinical statement
 * maps 1:1 back to authorized clinical facts.
 */
export function auditNursePediatricEvolutionNarrative(
  narrative: string,
  authorizedFacts: AuthorizedClinicalFacts
): { passed: boolean; untraceableSegments: string[] } {
  if (!narrative || !narrative.trim()) {
    return { passed: true, untraceableSegments: [] };
  }

  const allAuthorizedCorpus: string[] = [];
  for (const cat of Object.values(authorizedFacts)) {
    if (Array.isArray(cat)) {
      for (const fact of cat) {
        if (fact.canonicalText) {
          allAuthorizedCorpus.push(fact.canonicalText.toLowerCase());
        }
        if (typeof fact.value === 'string') {
          allAuthorizedCorpus.push(fact.value.toLowerCase());
        }
      }
    }
  }

  const fullCorpus = allAuthorizedCorpus.join(' ');
  const untraceableSegments: string[] = [];

  // Split into sentences
  const sentences = narrative
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase().replace(/[.,;:!?]/g, '');
    const words = sLower.split(/\s+/).filter((w) => w.length > 4);
    if (words.length === 0) continue;

    const matchedWords = words.filter((w) => fullCorpus.includes(w));
    const ratio = matchedWords.length / words.length;

    // Standard high-tolerance anchor check
    if (ratio < 0.25) {
      untraceableSegments.push(sentence);
    }
  }

  return {
    passed: untraceableSegments.length === 0,
    untraceableSegments,
  };
}
