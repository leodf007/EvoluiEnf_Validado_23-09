import { ClinicalEvolutionForm } from '../types/clinical';
import { PrivacyGuardMatch, PrivacyGuardResult } from './types';

// Regex patterns for potential Personally Identifiable Information (PII)
const CPF_REGEX = /\b(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})\b/g;
const CPF_EXPLICIT_REGEX = /\b(?:cpf|cpf:)\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{9,11})\b/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})\b/g;
const PRONTUARIO_REGEX = /\b(?:prontu[aá]rio|pront|pront\.|prontu[aá]rio\s*n[ºo°.]?)\s*:?\s*(\d{3,12})\b/gi;
const RG_REGEX = /\b(?:rg|rg:)\s*(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]|\d{7,10})\b/gi;
const CNS_REGEX = /\b(?:cns|cns:)\s*(\d{15})\b/gi;

interface TextFieldToScan {
  field: string;
  label: string;
  value?: string;
}

function extractTextFields(form: any): TextFieldToScan[] {
  if (!form) return [];
  if (typeof form === 'string') {
    return [{ field: 'text', label: 'Texto Clínico', value: form }];
  }
  const fields: TextFieldToScan[] = [
    { field: 'context.locationCustom', label: 'Localização Customizada', value: form.context?.locationCustom },
    { field: 'context.accompanimentCustom', label: 'Acompanhante Customizado', value: form.context?.accompanimentCustom },
    { field: 'context.allergiesDetails', label: 'Detalhes de Alergias', value: form.context?.allergiesDetails || form.identification?.allergiesDetails || form.context?.allergyDescription },
    { field: 'context.precautionCustom', label: 'Precaução Customizada', value: form.context?.precautionCustom || form.identification?.precautionCustom },
    { field: 'context.admissionReason', label: 'Motivo da Admissão / Queixa', value: form.context?.admissionReason || form.reportedInformation?.admissionReason },
    { field: 'context.relevantComorbidities', label: 'Comorbidades Informadas', value: form.context?.relevantComorbidities || form.reportedInformation?.relevantComorbidities },

    // Nurse ICU specific fields
    { field: 'evolutionState.nursingSynthesis', label: 'Síntese de Enfermagem', value: form.evolutionState?.nursingSynthesis },
    { field: 'evolutionState.additionalNotes', label: 'Informações Adicionais', value: form.evolutionState?.additionalNotes },
    { field: 'evolutionState.customStatusChange', label: 'Status Comparativo Customizado', value: form.evolutionState?.customStatusChange },
    { field: 'evolutionState.customCurrentStatus', label: 'Situação Atual Customizada', value: form.evolutionState?.customCurrentStatus },
    { field: 'responseToCare.structuredResponseText', label: 'Resposta aos Cuidados', value: form.responseToCare?.structuredResponseText },
    { field: 'communication.target', label: 'Comunicação Interprofissional', value: form.communication?.target },
    { field: 'communication.reason', label: 'Motivo da Comunicação', value: form.communication?.reason },
    { field: 'communication.responseObserved', label: 'Retorno da Comunicação', value: form.communication?.responseObserved },
    { field: 'complications.description', label: 'Descrição da Intercorrência', value: form.complications?.description },
    { field: 'complications.interventionDone', label: 'Conduta na Intercorrência', value: form.complications?.interventionDone },

    // Admission specific fields
    { field: 'origin.originCustom', label: 'Procedência Customizada', value: form.origin?.originCustom },
    { field: 'origin.arrivalModesCustom', label: 'Forma de Chegada Customizada', value: form.origin?.arrivalModesCustom },
    { field: 'origin.transportTeamTypeCustom', label: 'Equipe de Transporte Customizada', value: form.origin?.transportTeamTypeCustom },
    { field: 'identification.allergiesDetails', label: 'Detalhes de Alergias', value: form.identification?.allergiesDetails },
    { field: 'identification.precautionCustom', label: 'Precaução Customizada', value: form.identification?.precautionCustom },
    { field: 'reportedInformation.admissionReason', label: 'Motivo da Admissão', value: form.reportedInformation?.admissionReason },
    { field: 'reportedInformation.relevantComorbidities', label: 'Comorbidades Informadas', value: form.reportedInformation?.relevantComorbidities },
    { field: 'reportedInformation.complaintsDetails', label: 'Detalhes de Queixas', value: form.reportedInformation?.complaintsDetails },
    { field: 'reportedInformation.informationSourceCustom', label: 'Fonte da Informação Customizada', value: form.reportedInformation?.informationSourceCustom },
    { field: 'arrivalCondition.behaviorCustom', label: 'Comportamento Customizado', value: form.arrivalCondition?.behaviorCustom },
    { field: 'admissionCare.otherCareDescription', label: 'Outro Cuidado de Admissão', value: form.admissionCare?.otherCareDescription },
    { field: 'belongings.statusCustom', label: 'Pertences Customizados', value: form.belongings?.statusCustom },
    { field: 'communications.professionalTypeCustom', label: 'Profissional Comunicado Customizado', value: form.communications?.professionalTypeCustom },
    { field: 'communications.description', label: 'Descrição da Comunicação', value: form.communications?.description },

    { field: 'generalAssessment.complaintsDetails', label: 'Detalhes de Queixas', value: form.generalAssessment?.complaintsDetails },
    { field: 'generalAssessment.mobilityCustom', label: 'Mobilidade Customizada', value: form.generalAssessment?.mobilityCustom || form.mobility?.conditionCustom },

    { field: 'pain.otherScaleName', label: 'Nome da Escala de Dor', value: form.pain?.otherScaleName },
    { field: 'pain.otherScaleResult', label: 'Resultado da Escala de Dor', value: form.pain?.otherScaleResult },
    { field: 'pain.location', label: 'Localização da Dor', value: form.pain?.location },
    { field: 'pain.characteristics', label: 'Características da Dor', value: form.pain?.characteristics },

    { field: 'neurological.consciousnessCustom', label: 'Nível de Consciência Customizado', value: form.neurological?.consciousnessCustom },
    { field: 'neurological.pupilsCustom', label: 'Pupilas Customizadas', value: form.neurological?.pupilsCustom },
    { field: 'neurological.photoreactionCustom', label: 'Fotorreação Customizada', value: form.neurological?.photoreactionCustom },
    { field: 'neurological.neurologicalAlterationDetails', label: 'Déficit Neurológico', value: form.neurological?.neurologicalAlterationDetails },

    { field: 'respiratory.supportCustom', label: 'Suporte Respiratório Customizado', value: form.respiratory?.supportCustom },
    { field: 'respiratory.oxygenDeviceCustom', label: 'Dispositivo O₂ Customizado', value: form.respiratory?.oxygenDeviceCustom },
    { field: 'respiratory.vniInterface', label: 'Interface VNI', value: form.respiratory?.vniInterface },
    { field: 'respiratory.vmiAirwayCustom', label: 'Via Aérea VMI Customizada', value: form.respiratory?.vmiAirwayCustom },
    { field: 'respiratory.vmiCaliber', label: 'Calibre/Fixação VMI', value: form.respiratory?.vmiCaliber },
    { field: 'respiratory.vmiVentilatoryMode', label: 'Modo Ventilatório VMI', value: form.respiratory?.vmiVentilatoryMode },
    { field: 'respiratory.secretionColor', label: 'Coloração Secreção', value: form.respiratory?.secretionColor },
    { field: 'respiratory.secretionConsistency', label: 'Consistência Secreção', value: form.respiratory?.secretionConsistency },
    { field: 'respiratory.secretionQuantity', label: 'Quantidade Secreção', value: form.respiratory?.secretionQuantity },
    { field: 'respiratory.breathSoundsLocation', label: 'Localização Ausculta', value: form.respiratory?.breathSoundsLocation },

    { field: 'cardiovascular.extremitiesCustom', label: 'Extremidades Customizadas', value: form.cardiovascular?.extremitiesCustom },
    { field: 'cardiovascular.edemaLocationCustom', label: 'Localização de Edema Customizada', value: form.cardiovascular?.edemaLocationCustom },

    { field: 'gastrointestinal.palpationLocation', label: 'Localização da Dor à Palpação', value: form.gastrointestinal?.palpationLocation },
    { field: 'gastrointestinal.palpationObservations', label: 'Observações Palpação', value: form.gastrointestinal?.palpationObservations },
    { field: 'nutrition.statusCustom', label: 'Dieta Customizada', value: form.nutrition?.statusCustom },
    { field: 'nutrition.enteralDeviceCustom', label: 'Dispositivo Enteral Customizado', value: form.nutrition?.enteralDeviceCustom },
    { field: 'nutrition.vomitingDetails', label: 'Detalhes de Vômito', value: form.nutrition?.vomitingDetails },

    { field: 'bowelElimination.aspectCustom', label: 'Aspecto Fezes Customizado', value: form.bowelElimination?.aspectCustom },
    { field: 'bowelElimination.frequencyOrQuantity', label: 'Frequência/Qtd Fezes', value: form.bowelElimination?.frequencyOrQuantity },
    { field: 'bowelElimination.ostomyType', label: 'Tipo de Ostomia', value: form.bowelElimination?.ostomyType },
    { field: 'bowelElimination.ostomyStomaCondition', label: 'Aspecto Estoma/Efluente', value: form.bowelElimination?.ostomyStomaCondition },

    { field: 'urinary.spontaneousColor', label: 'Coloração Diurese Espontânea', value: form.urinary?.spontaneousColor },
    { field: 'urinary.spontaneousAspect', label: 'Aspecto Diurese Espontânea', value: form.urinary?.spontaneousAspect },
    { field: 'urinary.spontaneousVolume', label: 'Volume Diurese Espontânea', value: form.urinary?.spontaneousVolume },
    { field: 'urinary.svdCaliber', label: 'Calibre SVD', value: form.urinary?.svdCaliber },
    { field: 'urinary.svdColor', label: 'Coloração SVD', value: form.urinary?.svdColor },
    { field: 'urinary.svdAspect', label: 'Aspecto SVD', value: form.urinary?.svdAspect },
    { field: 'urinary.svdOutputVolume', label: 'Volume SVD', value: form.urinary?.svdOutputVolume },

    { field: 'skin.lesionLocation', label: 'Localização da Lesão', value: form.skin?.lesionLocation },
    { field: 'skin.lesionDescription', label: 'Descrição da Lesão', value: form.skin?.lesionDescription },
    { field: 'skin.lesionCarePerformed', label: 'Cuidados com a Lesão', value: form.skin?.lesionCarePerformed },

    { field: 'nursingCare.otherCareDescription', label: 'Outro Cuidado de Enfermagem', value: form.nursingCare?.otherCareDescription },
    { field: 'bath.toleranceDetails', label: 'Tolerância ao Banho', value: form.bath?.toleranceDetails },

    { field: 'complications.description', label: 'Descrição da Intercorrência', value: form.complications?.description },
    { field: 'complications.actionsTaken', label: 'Condutas na Intercorrência', value: form.complications?.actionsTaken },
    { field: 'complications.patientResponse', label: 'Resposta do Paciente', value: form.complications?.patientResponse },

    { field: 'comparison.evidenceDescription', label: 'Evidência da Mudança Evolutiva', value: form.comparison?.evidenceDescription },
    { field: 'finalStatus.conditionCustom', label: 'Situação Final Customizada', value: form.finalStatus?.conditionCustom },
    { field: 'additionalInformation', label: 'Informações Adicionais / Observações', value: typeof form.additionalInformation === 'string' ? form.additionalInformation : (form.additionalInformation as any)?.notes },
  ];

  // Also include dynamic lists:
  form.vasoactiveDrugs?.drugsList?.forEach((d: any, idx: number) => {
    fields.push({
      field: `vasoactiveDrugs.drugsList[${idx}].observations`,
      label: `Droga Vasoativa #${idx + 1} - Observações`,
      value: d.observations,
    });
    fields.push({
      field: `vasoactiveDrugs.drugsList[${idx}].concentration`,
      label: `Droga Vasoativa #${idx + 1} - Concentração`,
      value: d.concentration,
    });
  });

  form.sedationAnalgesia?.medicationsList?.forEach((s: any, idx: number) => {
    fields.push({
      field: `sedationAnalgesia.medicationsList[${idx}].observations`,
      label: `Sedação #${idx + 1} - Observações`,
      value: s.observations,
    });
    fields.push({
      field: `sedationAnalgesia.medicationsList[${idx}].concentration`,
      label: `Sedação #${idx + 1} - Concentração`,
      value: s.concentration,
    });
  });

  form.devices?.list?.forEach((dev: any, idx: number) => {
    fields.push({
      field: `devices.list[${idx}].location`,
      label: `Dispositivo #${idx + 1} - Localização`,
      value: dev.location,
    });
    fields.push({
      field: `devices.list[${idx}].observations`,
      label: `Dispositivo #${idx + 1} - Observações`,
      value: dev.observations,
    });
  });

  form.existingDevices?.list?.forEach((dev: any, idx: number) => {
    fields.push({
      field: `existingDevices.list[${idx}].location`,
      label: `Dispositivo Existente #${idx + 1} - Localização`,
      value: dev.location,
    });
    fields.push({
      field: `existingDevices.list[${idx}].observations`,
      label: `Dispositivo Existente #${idx + 1} - Observações`,
      value: dev.observations,
    });
  });

  form.installedDevices?.list?.forEach((dev: any, idx: number) => {
    fields.push({
      field: `installedDevices.list[${idx}].location`,
      label: `Dispositivo Instalado #${idx + 1} - Localização`,
      value: dev.location,
    });
    fields.push({
      field: `installedDevices.list[${idx}].observations`,
      label: `Dispositivo Instalado #${idx + 1} - Observações`,
      value: dev.observations,
    });
  });

  return fields.filter((f) => f.value && f.value.trim().length > 0);
}

/**
 * Checks all text entries in clinical form for potential patient personal identifiers.
 */
export function checkPrivacyGuards(formData: any): PrivacyGuardResult {
  const fields = extractTextFields(formData);
  const matches: PrivacyGuardMatch[] = [];

  for (const { field, label, value } of fields) {
    if (!value) continue;

    // 1. Check CPFs
    const cpfMatches = value.match(CPF_REGEX) || value.match(CPF_EXPLICIT_REGEX);
    if (cpfMatches) {
      for (const m of cpfMatches) {
        matches.push({
          field,
          label,
          type: 'CPF',
          description: 'Número com formato similar a CPF detectado.',
          snippet: m,
        });
      }
    }

    // 2. Check E-mails
    const emailMatches = value.match(EMAIL_REGEX);
    if (emailMatches) {
      for (const m of emailMatches) {
        matches.push({
          field,
          label,
          type: 'EMAIL',
          description: 'Endereço de e-mail detectado.',
          snippet: m,
        });
      }
    }

    // 3. Check Brazilian Phones (e.g. 11987654321, (11) 98765-4321)
    // Filter out common clinical false positives (like "120/80", "100%", "36.5")
    const phoneMatches = value.match(PHONE_REGEX);
    if (phoneMatches) {
      for (const m of phoneMatches) {
        const cleanDigits = m.replace(/\D/g, '');
        if (cleanDigits.length >= 10 && cleanDigits.length <= 13) {
          matches.push({
            field,
            label,
            type: 'PHONE',
            description: 'Número de telefone/contato detectado.',
            snippet: m,
          });
        }
      }
    }

    // 4. Check Prontuário / RG / CNS
    const prontMatches = value.match(PRONTUARIO_REGEX);
    if (prontMatches) {
      for (const m of prontMatches) {
        matches.push({
          field,
          label,
          type: 'PRONTUARIO',
          description: 'Identificador de prontuário detectado.',
          snippet: m,
        });
      }
    }

    const rgMatches = value.match(RG_REGEX);
    if (rgMatches) {
      for (const m of rgMatches) {
        matches.push({
          field,
          label,
          type: 'DOCUMENT',
          description: 'Registro de documento (RG) detectado.',
          snippet: m,
        });
      }
    }

    const cnsMatches = value.match(CNS_REGEX);
    if (cnsMatches) {
      for (const m of cnsMatches) {
        matches.push({
          field,
          label,
          type: 'DOCUMENT',
          description: 'Cartão Nacional de Saúde (CNS) detectado.',
          snippet: m,
        });
      }
    }
  }

  return {
    hasPotentialPII: matches.length > 0,
    matches,
  };
}
