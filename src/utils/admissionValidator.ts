import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { SectionStatus } from '../types/clinical';

/**
 * Creates a completely clean initial TechnicianAdmissionForm.
 * CRITICAL RULE: No clinical answers are pre-filled by default.
 * All selections and fields start empty or undefined so that all sections
 * start in the 'not_started' state.
 */
export function createInitialAdmissionForm(): TechnicianAdmissionForm {
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
    reportedInformation: {
      admissionReason: '',
      relevantComorbidities: '',
      complaints: '',
      complaintsDetails: '',
      informationSource: '',
      informationSourceCustom: '',
    },
    arrivalCondition: {
      behavior: [],
      behaviorCustom: '',
      hygiene: '',
    },
    vitalSigns: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
    },
    pain: {
      assessmentType: '',
      numericScaleValue: undefined,
      otherScaleName: '',
      otherScaleResult: '',
      location: '',
      characteristics: '',
    },
    neurological: {
      consciousnessLevel: '',
      consciousnessCustom: '',
      orientation: '',
      glasgowType: 'not_applied',
      glasgowScore: undefined,
      rassType: 'not_applied',
      rassScore: undefined,
      pupils: '',
      pupilsCustom: '',
      photoreaction: '',
      photoreactionCustom: '',
    },
    respiratory: {
      respiratorySupport: '',
      supportCustom: '',
      oxygenDevice: '',
      oxygenDeviceCustom: '',
      oxygenFlowRate: '',
      oxygenFiO2: '',
      vniInterface: '',
      vniFiO2: '',
      vniPeepEpap: '',
      vniIpapPinsp: '',
      vniOtherParams: '',
      vmiAirway: '',
      vmiAirwayCustom: '',
      vmiCaliber: '',
      vmiVentilatoryMode: '',
      vmiPeep: '',
      vmiFiO2: '',
      vmiProgrammedRR: '',
      vmiTidalVolume: '',
      vmiSupportPressure: '',
      respiratoryPattern: '',
      respiratoryPatternCustom: '',
      respiratoryDistress: '',
      respiratoryDistressDetails: '',
      accessoryMuscles: '',
      secretion: '',
      secretionDetails: '',
      breathSounds: '',
      breathSoundsLocation: '',
      adventitiousSounds: [],
    },
    cardiovascular: {
      peripheralPerfusion: '',
      extremities: '',
      extremitiesCustom: '',
      capillaryRefillTime: '',
      capillaryRefillTimeValue: '',
      edema: '',
      edemaLocations: [],
      edemaLocationCustom: '',
      edemaIntensity: '',
    },
    nutrition: {
      status: '',
      statusCustom: '',
      oralAcceptance: '',
      enteralDevice: '',
      enteralRate: '',
      enteralTolerance: '',
    },
    gastrointestinal: {
      abdominalShape: '',
      consistency: '',
      palpation: '',
      bowelSounds: '',
    },
    elimination: {
      diuresis: '',
      urinaryRoute: '',
      urinaryRouteCustom: '',
      svdCaliber: '',
      svdPatent: '',
      svdAspect: '',
      svdColor: '',
      svdOutputVolume: '',
      bowelMovement: '',
      bowelAspect: '',
    },
    existingDevices: {
      list: [],
    },
    skin: {
      integrity: '',
      hydration: '',
      hydrationCustom: '',
      lesionLocation: '',
      lesionDescription: '',
      lesionDressingPresent: '',
      lesionObservedCondition: '',
      lesionCarePerformed: '',
    },
    mobility: {
      condition: '',
      conditionCustom: '',
      bedRailsUsed: '',
      headOfBedElevated: '',
      headOfBedAngle: '',
    },
    hygiene: {
      bathPerformed: '',
      bathCustom: '',
      tolerance: '',
      toleranceDetails: '',
    },
    admissionCare: {
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
    complications: {
      hasComplication: '',
      description: '',
      time: '',
      actionsTaken: '',
      patientResponse: '',
      communicatedToTeam: '',
      communicatedWho: '',
      communicationTime: '',
    },
    communications: {
      communicationNeeded: '',
      professionalType: '',
      professionalTypeCustom: '',
      time: '',
      description: '',
    },
    finalStatus: {
      conditions: [],
      conditionCustom: '',
    },
    additionalInformation: '',
  };
}

/**
 * Creates a sample populated form for preview and testing purposes.
 */
export function createSampleAdmissionForm(): TechnicianAdmissionForm {
  return {
    context: {
      moment: 'Admito/Recebo paciente',
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
      accompaniedByTransportTeam: 'Não',
      transportTeamType: '',
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
    reportedInformation: {
      admissionReason: 'dor abdominal em hipocôndrio direito',
      relevantComorbidities: 'HAS e DM tipo 2',
      complaints: 'Com queixa',
      complaintsDetails: 'dor em abdome',
      informationSource: 'Paciente',
      informationSourceCustom: '',
    },
    arrivalCondition: {
      behavior: ['Calmo', 'Cooperativo'],
      behaviorCustom: '',
      hygiene: 'Preservada',
    },
    vitalSigns: {
      systolicBP: '128',
      diastolicBP: '76',
      meanArterialPressure: '93',
      heartRate: '82',
      respiratoryRate: '18',
      oxygenSaturation: '97',
      temperature: '36.5',
    },
    pain: {
      assessmentType: 'Escala numérica 0–10',
      numericScaleValue: 5,
      otherScaleName: '',
      otherScaleResult: '',
      location: 'abdome',
      characteristics: 'em cólica',
    },
    neurological: {
      consciousnessLevel: 'Consciente',
      consciousnessCustom: '',
      orientation: 'Orientado em tempo e espaço',
      glasgowType: 'score',
      glasgowScore: 15,
      rassType: 'not_applied',
      rassScore: undefined,
      pupils: 'Isocóricas',
      pupilsCustom: '',
      photoreaction: 'Fotorreagentes',
      photoreactionCustom: '',
    },
    respiratory: {
      respiratorySupport: 'Ar ambiente',
      supportCustom: '',
      oxygenDevice: '',
      oxygenDeviceCustom: '',
      oxygenFlowRate: '',
      oxygenFiO2: '',
      vniInterface: '',
      vniFiO2: '',
      vniPeepEpap: '',
      vniIpapPinsp: '',
      vniOtherParams: '',
      vmiAirway: '',
      vmiAirwayCustom: '',
      vmiCaliber: '',
      vmiVentilatoryMode: '',
      vmiPeep: '',
      vmiFiO2: '',
      vmiProgrammedRR: '',
      vmiTidalVolume: '',
      vmiSupportPressure: '',
      respiratoryPattern: 'Eupneico',
      respiratoryPatternCustom: '',
      respiratoryDistress: 'Ausente',
      respiratoryDistressDetails: '',
      accessoryMuscles: 'Ausente',
      secretion: 'Ausente',
      secretionDetails: '',
      breathSounds: 'Murmúrio vesicular presente bilateralmente',
      breathSoundsLocation: '',
      adventitiousSounds: [],
    },
    cardiovascular: {
      peripheralPerfusion: 'Adequada',
      extremities: 'Quentes',
      extremitiesCustom: '',
      capillaryRefillTime: '< 3 segundos',
      capillaryRefillTimeValue: '',
      edema: 'Ausente',
      edemaLocations: [],
      edemaLocationCustom: '',
      edemaIntensity: '',
    },
    nutrition: {
      status: 'Jejum',
      statusCustom: '',
      oralAcceptance: '',
      enteralDevice: '',
      enteralRate: '',
      enteralTolerance: '',
    },
    gastrointestinal: {
      abdominalShape: 'Plano',
      consistency: 'Normotenso',
      palpation: 'Indolor',
      bowelSounds: 'Presentes',
    },
    elimination: {
      diuresis: 'Presente',
      urinaryRoute: 'Espontânea',
      urinaryRouteCustom: '',
      svdCaliber: '',
      svdPatent: 'Pérvio',
      svdAspect: 'Clara',
      svdColor: 'Amarelo claro',
      svdOutputVolume: '',
      bowelMovement: 'Não avaliada',
      bowelAspect: '',
    },
    existingDevices: {
      list: [
        {
          id: 'dev-existing-1',
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
    skin: {
      integrity: 'Íntegra',
      hydration: 'Hidratada',
      hydrationCustom: '',
      lesionLocation: '',
      lesionDescription: '',
      lesionDressingPresent: 'Não',
      lesionObservedCondition: '',
      lesionCarePerformed: '',
    },
    mobility: {
      condition: 'Em maca',
      conditionCustom: '',
      bedRailsUsed: 'Sim',
      headOfBedElevated: 'Sim',
      headOfBedAngle: '30°',
    },
    hygiene: {
      bathPerformed: 'Não',
      bathCustom: '',
      tolerance: '',
      toleranceDetails: '',
    },
    admissionCare: {
      careItems: [
        'Acomodação no leito',
        'Monitorização de sinais vitais',
        'Grades de proteção elevadas',
        'Instalação/troca de soroterapia',
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
    complications: {
      hasComplication: 'Não',
      description: '',
      time: '',
      actionsTaken: '',
      patientResponse: '',
      communicatedToTeam: 'Não',
      communicatedWho: '',
      communicationTime: '',
    },
    communications: {
      communicationNeeded: 'Não',
      professionalType: '',
      professionalTypeCustom: '',
      time: '',
      description: '',
    },
    finalStatus: {
      conditions: ['Permanece no setor sob cuidados'],
      conditionCustom: '',
    },
    additionalInformation: '',
  };
}

/**
 * Normalizes technician admission form data before generating facts or narratives.
 * Cleans up inconsistent conditional fields (e.g. if bathPerformed === 'Não', clears tolerance).
 */
export function normalizeAdmissionForm(form: TechnicianAdmissionForm): TechnicianAdmissionForm {
  const cloned: TechnicianAdmissionForm = JSON.parse(JSON.stringify(form));

  // 1. Hygiene & Bath
  if (cloned.hygiene.bathPerformed === 'Não' || !cloned.hygiene.bathPerformed) {
    cloned.hygiene.tolerance = '';
    cloned.hygiene.toleranceDetails = '';
    cloned.hygiene.bathCustom = '';
  }

  // 2. Complications
  if (cloned.complications.hasComplication === 'Não' || !cloned.complications.hasComplication) {
    cloned.complications.description = '';
    cloned.complications.time = '';
    cloned.complications.actionsTaken = '';
    cloned.complications.patientResponse = '';
    cloned.complications.communicatedToTeam = 'Não';
    cloned.complications.communicatedWho = '';
    cloned.complications.communicationTime = '';
  }

  // 3. Communications
  if (cloned.communications.communicationNeeded === 'Não' || !cloned.communications.communicationNeeded) {
    cloned.communications.professionalType = '';
    cloned.communications.professionalTypeCustom = '';
    cloned.communications.time = '';
    cloned.communications.description = '';
  }

  // 4. Installed Devices
  if (cloned.installedDevices.installedInAdmission === 'Não' || !cloned.installedDevices.installedInAdmission) {
    cloned.installedDevices.list = [];
  }

  // 5. Skin
  if (cloned.skin.integrity === 'Íntegra' || !cloned.skin.integrity) {
    cloned.skin.lesionLocation = '';
    cloned.skin.lesionDescription = '';
    cloned.skin.lesionDressingPresent = '';
    cloned.skin.lesionObservedCondition = '';
    cloned.skin.lesionCarePerformed = '';
  }

  // 6. Origin Transport Team
  if (cloned.origin.accompaniedByTransportTeam === 'Não' || !cloned.origin.accompaniedByTransportTeam) {
    cloned.origin.transportTeamType = '';
    cloned.origin.transportTeamTypeCustom = '';
  }

  return cloned;
}

/**
 * Calculates section status for any section in the Technician Admission form.
 * Ensures that sections only become 'completed' or 'partial' if user has explicitly filled data.
 */
export function calculateAdmissionSectionStatus(
  form: TechnicianAdmissionForm,
  sectionIndex: number
): SectionStatus {
  switch (sectionIndex) {
    case 0: {
      // 0: Contexto
      const hasLoc = Boolean(form.context?.location && form.context.location.trim());
      const hasMom = Boolean(form.context?.moment && form.context.moment.trim());
      const hasAcc = Boolean(form.context?.accompaniment && form.context.accompaniment.trim());
      if (hasLoc && hasMom) return 'completed';
      if (hasLoc || hasMom || hasAcc) return 'in_progress';
      return 'not_started';
    }
    case 1: {
      // 1: Procedência e chegada
      const hasOrig = Boolean(form.origin?.patientOrigin && form.origin.patientOrigin.trim());
      const hasModes = Boolean(form.origin?.arrivalModes && form.origin.arrivalModes.length > 0);
      const hasTeam = Boolean(form.origin?.accompaniedByTransportTeam && form.origin.accompaniedByTransportTeam.trim());
      if (hasOrig && hasModes) return 'completed';
      if (hasOrig || hasModes || hasTeam) return 'in_progress';
      return 'not_started';
    }
    case 2: {
      // 2: Identificação
      const hasWrist = Boolean(form.identification?.wristbandChecked && form.identification.wristbandChecked.trim());
      const hasAllerg = Boolean(form.identification?.allergies && form.identification.allergies.trim());
      const hasBed = Boolean(form.identification?.bedSignChecked && form.identification.bedSignChecked.trim());
      const hasPrec = Boolean(form.identification?.precaution && form.identification.precaution.trim());
      if (hasWrist && hasAllerg) return 'completed';
      if (hasWrist || hasAllerg || hasBed || hasPrec) return 'in_progress';
      return 'not_started';
    }
    case 3: {
      // 3: Informações referidas
      const hasReason = Boolean(form.reportedInformation?.admissionReason && form.reportedInformation.admissionReason.trim());
      const hasCompl = Boolean(form.reportedInformation?.complaints && form.reportedInformation.complaints.trim());
      const hasComorb = Boolean(form.reportedInformation?.relevantComorbidities && form.reportedInformation.relevantComorbidities.trim());
      if (hasReason || hasCompl) return 'completed';
      if (hasComorb) return 'in_progress';
      return 'not_started';
    }
    case 4: {
      // 4: Condições observadas na chegada
      const hasBeh = Boolean(form.arrivalCondition?.behavior && form.arrivalCondition.behavior.length > 0);
      const hasHyg = Boolean(form.arrivalCondition?.hygiene && form.arrivalCondition.hygiene.trim());
      if (hasBeh && hasHyg) return 'completed';
      if (hasBeh || hasHyg) return 'in_progress';
      return 'not_started';
    }
    case 5: {
      // 5: Sinais vitais e dor
      const hasBp = Boolean(form.vitalSigns?.systolicBP && form.vitalSigns.systolicBP.trim());
      const hasHr = Boolean(form.vitalSigns?.heartRate && form.vitalSigns.heartRate.trim());
      const hasPain = Boolean(form.pain?.assessmentType && form.pain.assessmentType.trim());
      if (hasBp && hasHr) return 'completed';
      if (hasBp || hasHr || hasPain || form.vitalSigns?.respiratoryRate || form.vitalSigns?.temperature) return 'in_progress';
      return 'not_started';
    }
    case 6: {
      // 6: Neurológico
      const hasConsc = Boolean(form.neurological?.consciousnessLevel && form.neurological.consciousnessLevel.trim());
      const hasOrient = Boolean(form.neurological?.orientation && form.neurological.orientation.trim());
      const hasGlas = form.neurological?.glasgowScore !== undefined;
      if (hasConsc && (hasOrient || hasGlas)) return 'completed';
      if (hasConsc || hasOrient || hasGlas || form.neurological?.rassScore !== undefined) return 'in_progress';
      return 'not_started';
    }
    case 7: {
      // 7: Respiratório
      const hasSupp = Boolean(form.respiratory?.respiratorySupport && form.respiratory.respiratorySupport.trim());
      const hasPat = Boolean(form.respiratory?.respiratoryPattern && form.respiratory.respiratoryPattern.trim());
      const hasDist = Boolean(form.respiratory?.respiratoryDistress && form.respiratory.respiratoryDistress.trim());
      if (hasSupp && (hasPat || hasDist)) return 'completed';
      if (hasSupp || hasPat || hasDist) return 'in_progress';
      return 'not_started';
    }
    case 8: {
      // 8: Perfusão / Cardiovascular
      const hasPerf = Boolean(form.cardiovascular?.peripheralPerfusion && form.cardiovascular.peripheralPerfusion.trim());
      const hasExt = Boolean(form.cardiovascular?.extremities && form.cardiovascular.extremities.trim());
      const hasTec = Boolean(form.cardiovascular?.capillaryRefillTime && form.cardiovascular.capillaryRefillTime.trim());
      if (hasPerf && (hasExt || hasTec)) return 'completed';
      if (hasPerf || hasExt || hasTec || form.cardiovascular?.edema) return 'in_progress';
      return 'not_started';
    }
    case 9: {
      // 9: Nutrição / Gastrointestinal
      const hasNut = Boolean(form.nutrition?.status && form.nutrition.status.trim());
      if (hasNut) return 'completed';
      return 'not_started';
    }
    case 10: {
      // 10: Eliminações
      const hasDiur = Boolean(form.elimination?.diuresis && form.elimination.diuresis.trim());
      const hasRoute = Boolean(form.elimination?.urinaryRoute && form.elimination.urinaryRoute.trim());
      const hasBowel = Boolean(form.elimination?.bowelMovement && form.elimination.bowelMovement.trim());
      if (hasDiur && (hasRoute || hasBowel)) return 'completed';
      if (hasDiur || hasRoute || hasBowel) return 'in_progress';
      return 'not_started';
    }
    case 11: {
      // 11: Dispositivos já presentes
      const hasDevs = Boolean(form.existingDevices?.list && form.existingDevices.list.length > 0);
      return hasDevs ? 'completed' : 'not_started';
    }
    case 12: {
      // 12: Pele
      const hasSkin = Boolean(form.skin?.integrity && form.skin.integrity.trim());
      if (hasSkin) return 'completed';
      return 'not_started';
    }
    case 13: {
      // 13: Mobilidade
      const hasMob = Boolean(form.mobility?.condition && form.mobility.condition.trim());
      const hasRails = Boolean(form.mobility?.bedRailsUsed && form.mobility.bedRailsUsed.trim());
      if (hasMob && hasRails) return 'completed';
      if (hasMob || hasRails || form.mobility?.headOfBedElevated) return 'in_progress';
      return 'not_started';
    }
    case 14: {
      // 14: Higiene / Banho
      const hasBath = Boolean(form.hygiene?.bathPerformed && form.hygiene.bathPerformed.trim());
      if (hasBath) return 'completed';
      return 'not_started';
    }
    case 15: {
      // 15: Cuidados realizados
      const hasCare = Boolean(
        (form.admissionCare?.careItems && form.admissionCare.careItems.length > 0) ||
        (form.admissionCare?.otherCareDescription && form.admissionCare.otherCareDescription.trim())
      );
      return hasCare ? 'completed' : 'not_started';
    }
    case 16: {
      // 16: Dispositivos instalados
      const hasInst = Boolean(form.installedDevices?.installedInAdmission && form.installedDevices.installedInAdmission.trim());
      if (hasInst) return 'completed';
      return 'not_started';
    }
    case 17: {
      // 17: Pertences
      const hasBel = Boolean(form.belongings?.status && form.belongings.status.trim());
      if (hasBel) return 'completed';
      return 'not_started';
    }
    case 18: {
      // 18: Intercorrências e comunicação
      const hasComp = Boolean(form.complications?.hasComplication && form.complications.hasComplication.trim());
      const hasComm = Boolean(form.communications?.communicationNeeded && form.communications.communicationNeeded.trim());
      if (hasComp && hasComm) return 'completed';
      if (hasComp || hasComm) return 'in_progress';
      return 'not_started';
    }
    case 19: {
      // 19: Situação final
      const hasFinal = Boolean(form.finalStatus?.conditions && form.finalStatus.conditions.length > 0);
      const hasAdd = Boolean(form.additionalInformation && form.additionalInformation.trim());
      if (hasFinal) return 'completed';
      if (hasAdd) return 'in_progress';
      return 'not_started';
    }
    default:
      return 'not_started';
  }
}

/**
 * Returns the status array for all 20 sections of TechnicianAdmissionForm.
 */
export function getAdmissionSectionStatuses(form: TechnicianAdmissionForm): SectionStatus[] {
  const statuses: SectionStatus[] = [];
  for (let i = 0; i < 20; i++) {
    statuses.push(calculateAdmissionSectionStatus(form, i));
  }
  return statuses;
}
