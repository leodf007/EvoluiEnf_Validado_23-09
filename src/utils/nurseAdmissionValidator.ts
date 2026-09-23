import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import { SectionStatus } from '../types/clinical';

/**
 * Creates a clean initial NurseAdmissionForm where all fields start empty/unselected.
 */
export function createInitialNurseAdmissionForm(): NurseAdmissionForm {
  return {
    context: {
      moment: '',
      location: '',
      locationCustom: '',
      accompaniment: '',
      accompanimentCustom: '',
    },
    origin: {
      patientOrigin: '',
      originCustom: '',
      arrivalModes: [],
      arrivalModesCustom: '',
      accompaniedByTransportTeam: '',
      transportTeamType: '',
      transportTeamTypeCustom: '',
    },
    identification: {
      wristbandChecked: '',
      bedSignChecked: '',
      allergies: '',
      allergiesDetails: '',
      precaution: '',
      precautionCustom: '',
    },
    nursingHistory: {
      admissionReason: '',
      historyOfPresentIllness: '',
      pastMedicalHistory: '',
      homeMedicationsReported: '',
      informationSource: '',
      informationSourceCustom: '',
    },
    vitalSignsAndPain: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      bloodGlucose: '',
      painAssessmentType: '',
      painScaleValue: undefined,
      painLocation: '',
      painCharacteristics: '',
    },
    neurological: {
      consciousnessLevel: '',
      consciousnessCustom: '',
      orientation: '',
      glasgowScore: undefined,
      rassScore: undefined,
      pupils: '',
      pupilsCustom: '',
      photoreaction: '',
      motorResponse: '',
    },
    respiratory: {
      respiratorySupport: '',
      supportCustom: '',
      oxygenDevice: '',
      oxygenFlowRate: '',
      respiratoryPattern: '',
      respiratoryDistress: '',
      breathSounds: '',
      breathSoundsLocation: '',
      secretion: '',
      secretionDetails: '',
    },
    cardiovascular: {
      peripheralPerfusion: '',
      extremities: '',
      capillaryRefillTime: '',
      capillaryRefillTimeValue: '',
      peripheralPulses: '',
      edema: '',
      edemaLocations: [],
    },
    gastrointestinal: {
      nutritionalStatus: '',
      abdomenInspection: '',
      abdomenPalpation: '',
      bowelSounds: '',
    },
    elimination: {
      diuresis: '',
      urinaryRoute: '',
      urinaryAspect: '',
      bowelMovement: '',
      bowelAspect: '',
    },
    skin: {
      integrity: '',
      hydration: '',
      coloration: '',
      lesionLocation: '',
      lesionDescription: '',
      lesionDressingPresent: '',
    },
    existingDevices: {
      list: [],
    },
    riskAssessment: {
      fallRisk: '',
      pressureInjuryRisk: '',
      aspirationRisk: '',
      deviceDislodgementRisk: '',
    },
    initialNursingCare: {
      careItems: [],
      otherCareDescription: '',
    },
    installedDevices: {
      installedInAdmission: '',
      list: [],
    },
    belongings: {
      status: '',
      statusCustom: '',
    },
    complicationsAndCommunication: {
      hasComplication: '',
      complicationTime: '',
      complicationDescription: '',
      nursingActionsTaken: '',
      patientResponse: '',
      communicatedToMedicalTeam: '',
      communicationTime: '',
    },
    nursingPlan: {
      planItems: [],
      customPlanDetails: '',
    },
    finalStatus: {
      conditions: [],
      conditionCustom: '',
    },
    additionalInformation: '',
  };
}

/**
 * Creates a sample NurseAdmissionForm for testing and preview purposes.
 */
export function createSampleNurseAdmissionForm(): NurseAdmissionForm {
  return {
    context: {
      moment: 'Admissão de Enfermagem realizada',
      location: 'Sala Vermelha',
      locationCustom: '',
      accompaniment: 'Familiar',
      accompanimentCustom: '',
    },
    origin: {
      patientOrigin: 'UPA',
      originCustom: '',
      arrivalModes: ['Maca', 'Ambulância'],
      arrivalModesCustom: '',
      accompaniedByTransportTeam: 'Sim',
      transportTeamType: 'SAMU',
      transportTeamTypeCustom: '',
    },
    identification: {
      wristbandChecked: 'Sim',
      bedSignChecked: 'Sim',
      allergies: 'Não referidas',
      allergiesDetails: '',
      precaution: 'Padrão',
      precautionCustom: '',
    },
    nursingHistory: {
      admissionReason: 'dor precordial ventilatório-dependente há 2 horas',
      historyOfPresentIllness: 'Acompanhante relata início súbito após esforço físico moderado.',
      pastMedicalHistory: 'HAS em tratamento irregular',
      homeMedicationsReported: 'Losartana 50mg/dia',
      informationSource: 'Paciente e familiar',
      informationSourceCustom: '',
    },
    vitalSignsAndPain: {
      systolicBP: '135',
      diastolicBP: '85',
      meanArterialPressure: '101',
      heartRate: '88',
      respiratoryRate: '19',
      oxygenSaturation: '96',
      temperature: '36.6',
      bloodGlucose: '112',
      painAssessmentType: 'Escala numérica 0–10',
      painScaleValue: 6,
      painLocation: 'região precordial',
      painCharacteristics: 'em aperto',
    },
    neurological: {
      consciousnessLevel: 'Consciente',
      consciousnessCustom: '',
      orientation: 'Orientado em tempo e espaço',
      glasgowScore: 15,
      rassScore: undefined,
      pupils: 'Isocóricas',
      pupilsCustom: '',
      photoreaction: 'Fotorreagentes',
      motorResponse: 'Preservada bilateralmente',
    },
    respiratory: {
      respiratorySupport: 'Ar ambiente',
      supportCustom: '',
      oxygenDevice: '',
      oxygenFlowRate: '',
      respiratoryPattern: 'Eupneico',
      respiratoryDistress: 'Ausente',
      breathSounds: 'Murmúrio vesicular presente bilateralmente sem ruídos adventícios',
      breathSoundsLocation: '',
      secretion: 'Ausente',
      secretionDetails: '',
    },
    cardiovascular: {
      peripheralPerfusion: 'Adequada',
      extremities: 'Aquecidas',
      capillaryRefillTime: '< 3 segundos',
      capillaryRefillTimeValue: '',
      peripheralPulses: 'Cheios e simétricos',
      edema: 'Ausente',
      edemaLocations: [],
    },
    gastrointestinal: {
      nutritionalStatus: 'Jejum',
      abdomenInspection: 'Plano',
      abdomenPalpation: 'Indolor, flácido e sem massas palpáveis',
      bowelSounds: 'Presentes e normoativos',
    },
    elimination: {
      diuresis: 'Presente',
      urinaryRoute: 'Espontânea',
      urinaryAspect: 'Límpida e amarelada',
      bowelMovement: 'Ausente no momento',
      bowelAspect: '',
    },
    skin: {
      integrity: 'Íntegra',
      hydration: 'Hidratada',
      coloration: 'Normocorada',
      lesionLocation: '',
      lesionDescription: '',
      lesionDressingPresent: 'Não',
    },
    existingDevices: {
      list: [
        {
          id: 'dev-nurse-1',
          type: 'AVP',
          location: 'MSD',
          permeability: 'Pérvio',
          functioning: 'Funcionante',
          dressingClean: true,
          dressingDry: true,
          dressingIntact: true,
          phlogisticSigns: 'Ausentes',
        },
      ],
    },
    riskAssessment: {
      fallRisk: 'Médio risco',
      pressureInjuryRisk: 'Baixo risco',
      aspirationRisk: 'Ausente',
      deviceDislodgementRisk: 'Baixo risco',
    },
    initialNursingCare: {
      careItems: [
        'Acolhimento e acomodação no leito com cabeceira elevada a 30°',
        'Monitorização multiparamétrica contínua e ECG inicial',
        'Instalação de acesso venoso periférico',
        'Coleta de exames laboratoriais e marcadores de necrose miocárdica',
        'Orientação ao paciente e acompanhante quanto aos fluxos do setor',
      ],
      otherCareDescription: '',
    },
    installedDevices: {
      installedInAdmission: 'Não',
      list: [],
    },
    belongings: {
      status: 'Pertences permanecem com paciente',
      statusCustom: '',
    },
    complicationsAndCommunication: {
      hasComplication: 'Não',
      complicationTime: '',
      complicationDescription: '',
      nursingActionsTaken: '',
      patientResponse: '',
      communicatedToMedicalTeam: 'Sim',
      communicationTime: '10:15',
    },
    nursingPlan: {
      planItems: [
        'Manter monitorização eletrocardiográfica contínua',
        'Vigilância rigorosa de padrão de dor precordial e estabilidade hemodinâmica',
        'Manter grades do leito elevadas para prevenção de quedas',
        'Garantir permeabilidade do acesso venoso periférico',
      ],
      customPlanDetails: '',
    },
    finalStatus: {
      conditions: ['Permanece no setor sob cuidados de enfermagem'],
      conditionCustom: '',
    },
    additionalInformation: '',
  };
}

/**
 * Normalizes nurse admission form data.
 */
export function normalizeNurseAdmissionForm(form: NurseAdmissionForm): NurseAdmissionForm {
  const cloned: NurseAdmissionForm = JSON.parse(JSON.stringify(form));

  if (cloned.skin.integrity === 'Íntegra' || !cloned.skin.integrity) {
    cloned.skin.lesionLocation = '';
    cloned.skin.lesionDescription = '';
    cloned.skin.lesionDressingPresent = '';
  }

  if (cloned.installedDevices.installedInAdmission === 'Não' || !cloned.installedDevices.installedInAdmission) {
    cloned.installedDevices.list = [];
  }

  if (cloned.complicationsAndCommunication.hasComplication === 'Não' || !cloned.complicationsAndCommunication.hasComplication) {
    cloned.complicationsAndCommunication.complicationTime = '';
    cloned.complicationsAndCommunication.complicationDescription = '';
    cloned.complicationsAndCommunication.nursingActionsTaken = '';
    cloned.complicationsAndCommunication.patientResponse = '';
  }

  return cloned;
}

/**
 * Calculates section status for Nurse Admission form sections (0 to 19).
 */
export function calculateNurseAdmissionSectionStatus(
  form: NurseAdmissionForm,
  sectionIndex: number
): SectionStatus {
  switch (sectionIndex) {
    case 0: {
      const hasLoc = Boolean(form.context?.location && form.context.location.trim());
      const hasMom = Boolean(form.context?.moment && form.context.moment.trim());
      if (hasLoc && hasMom) return 'completed';
      if (hasLoc || hasMom || form.context?.accompaniment) return 'in_progress';
      return 'not_started';
    }
    case 1: {
      const hasOrig = Boolean(form.origin?.patientOrigin && form.origin.patientOrigin.trim());
      const hasModes = Boolean(form.origin?.arrivalModes && form.origin.arrivalModes.length > 0);
      if (hasOrig && hasModes) return 'completed';
      if (hasOrig || hasModes || form.origin?.accompaniedByTransportTeam) return 'in_progress';
      return 'not_started';
    }
    case 2: {
      const hasWrist = Boolean(form.identification?.wristbandChecked && form.identification.wristbandChecked.trim());
      const hasAllerg = Boolean(form.identification?.allergies && form.identification.allergies.trim());
      if (hasWrist && hasAllerg) return 'completed';
      if (hasWrist || hasAllerg || form.identification?.precaution) return 'in_progress';
      return 'not_started';
    }
    case 3: {
      const hasReason = Boolean(form.nursingHistory?.admissionReason && form.nursingHistory.admissionReason.trim());
      if (hasReason) return 'completed';
      if (form.nursingHistory?.pastMedicalHistory || form.nursingHistory?.historyOfPresentIllness) return 'in_progress';
      return 'not_started';
    }
    case 4: {
      const hasBp = Boolean(form.vitalSignsAndPain?.systolicBP && form.vitalSignsAndPain.systolicBP.trim());
      const hasHr = Boolean(form.vitalSignsAndPain?.heartRate && form.vitalSignsAndPain.heartRate.trim());
      if (hasBp && hasHr) return 'completed';
      if (hasBp || hasHr || form.vitalSignsAndPain?.oxygenSaturation || form.vitalSignsAndPain?.painAssessmentType) return 'in_progress';
      return 'not_started';
    }
    case 5: {
      const hasConsc = Boolean(form.neurological?.consciousnessLevel && form.neurological.consciousnessLevel.trim());
      const hasOrient = Boolean(form.neurological?.orientation && form.neurological.orientation.trim());
      if (hasConsc && hasOrient) return 'completed';
      if (hasConsc || hasOrient || form.neurological?.glasgowScore !== undefined) return 'in_progress';
      return 'not_started';
    }
    case 6: {
      const hasSupp = Boolean(form.respiratory?.respiratorySupport && form.respiratory.respiratorySupport.trim());
      const hasPat = Boolean(form.respiratory?.respiratoryPattern && form.respiratory.respiratoryPattern.trim());
      if (hasSupp && hasPat) return 'completed';
      if (hasSupp || hasPat || form.respiratory?.breathSounds) return 'in_progress';
      return 'not_started';
    }
    case 7: {
      const hasPerf = Boolean(form.cardiovascular?.peripheralPerfusion && form.cardiovascular.peripheralPerfusion.trim());
      if (hasPerf) return 'completed';
      if (form.cardiovascular?.extremities || form.cardiovascular?.capillaryRefillTime) return 'in_progress';
      return 'not_started';
    }
    case 8: {
      const hasNut = Boolean(form.gastrointestinal?.nutritionalStatus && form.gastrointestinal.nutritionalStatus.trim());
      if (hasNut) return 'completed';
      if (form.gastrointestinal?.abdomenPalpation || form.gastrointestinal?.bowelSounds) return 'in_progress';
      return 'not_started';
    }
    case 9: {
      const hasDiur = Boolean(form.elimination?.diuresis && form.elimination.diuresis.trim());
      if (hasDiur) return 'completed';
      if (form.elimination?.urinaryRoute || form.elimination?.bowelMovement) return 'in_progress';
      return 'not_started';
    }
    case 10: {
      const hasSkin = Boolean(form.skin?.integrity && form.skin.integrity.trim());
      if (hasSkin) return 'completed';
      if (form.skin?.hydration || form.skin?.coloration) return 'in_progress';
      return 'not_started';
    }
    case 11: {
      const hasDevs = Boolean(form.existingDevices?.list && form.existingDevices.list.length > 0);
      return hasDevs ? 'completed' : 'not_started';
    }
    case 12: {
      const hasFall = Boolean(form.riskAssessment?.fallRisk && form.riskAssessment.fallRisk.trim());
      const hasLpp = Boolean(form.riskAssessment?.pressureInjuryRisk && form.riskAssessment.pressureInjuryRisk.trim());
      if (hasFall && hasLpp) return 'completed';
      if (hasFall || hasLpp || form.riskAssessment?.aspirationRisk) return 'in_progress';
      return 'not_started';
    }
    case 13: {
      const hasCare = Boolean(
        (form.initialNursingCare?.careItems && form.initialNursingCare.careItems.length > 0) ||
        (form.initialNursingCare?.otherCareDescription && form.initialNursingCare.otherCareDescription.trim())
      );
      return hasCare ? 'completed' : 'not_started';
    }
    case 14: {
      const hasInst = Boolean(form.installedDevices?.installedInAdmission && form.installedDevices.installedInAdmission.trim());
      if (hasInst) return 'completed';
      return 'not_started';
    }
    case 15: {
      const hasBel = Boolean(form.belongings?.status && form.belongings.status.trim());
      if (hasBel) return 'completed';
      return 'not_started';
    }
    case 16: {
      const hasComp = Boolean(form.complicationsAndCommunication?.hasComplication && form.complicationsAndCommunication.hasComplication.trim());
      if (hasComp) return 'completed';
      if (form.complicationsAndCommunication?.communicatedToMedicalTeam) return 'in_progress';
      return 'not_started';
    }
    case 17: {
      const hasPlan = Boolean(
        (form.nursingPlan?.planItems && form.nursingPlan.planItems.length > 0) ||
        (form.nursingPlan?.customPlanDetails && form.nursingPlan.customPlanDetails.trim())
      );
      return hasPlan ? 'completed' : 'not_started';
    }
    case 18: {
      const hasFinal = Boolean(form.finalStatus?.conditions && form.finalStatus.conditions.length > 0);
      if (hasFinal) return 'completed';
      return 'not_started';
    }
    case 19: {
      const hasAdd = Boolean(form.additionalInformation && form.additionalInformation.trim());
      return hasAdd ? 'completed' : 'not_started';
    }
    default:
      return 'not_started';
  }
}

export function getNurseAdmissionSectionStatuses(form: NurseAdmissionForm): SectionStatus[] {
  const statuses: SectionStatus[] = [];
  for (let i = 0; i < 20; i++) {
    statuses.push(calculateNurseAdmissionSectionStatus(form, i));
  }
  return statuses;
}
