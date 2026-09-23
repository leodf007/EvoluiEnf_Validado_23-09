import { TechnicianICUNursingNoteForm } from '../types/icuClinical';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';

function cleanAnatomy(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bfemural\b/gi, 'femoral')
    .replace(/\bjugular\s+esq\b/gi, 'jugular esquerda')
    .replace(/\bjugular\s+dir\b/gi, 'jugular direita')
    .trim();
}

function cleanColor(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bamarelo\b/gi, 'amarela')
    .replace(/\bclaro\b/gi, 'clara')
    .replace(/\bescuro\b/gi, 'escura')
    .replace(/\bvermelho\b/gi, 'avermelhada')
    .trim();
}

function cleanAspect(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bfluida\b/gi, 'fluido')
    .replace(/\bespessa\b/gi, 'espesso')
    .replace(/\bgrumosa\b/gi, 'grumoso')
    .trim();
}

/**
 * Builds authorized clinical facts from Technician ICU nursing note data.
 * Adheres strictly to the Gold Rule:
 * RAW FORM does not grant narrative authorization; only AUTHORIZED CLINICAL FACT grants authorization.
 */
export function buildAuthorizedICUFacts(form: Partial<TechnicianICUNursingNoteForm>): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {
    context: [],
    generalAssessment: [],
    vitalSigns: [],
    neurological: [],
    respiratory: [],
    cardiovascular: [],
    vasoactiveDrugs: [],
    sedationAndAnalgesia: [],
    nutrition: [],
    elimination: [],
    devices: [],
    skin: [],
    mobility: [],
    hygiene: [],
    care: [],
    complications: [],
    finalStatus: [],
    additional: [],
  };

  // 1. Context
  const ctx = form.context;
  if (ctx) {
    if (ctx.moment) {
      facts.context!.push({
        id: 'icu-ctx-moment',
        category: 'context',
        sourceField: 'context.moment',
        value: ctx.moment,
        canonicalText: `${ctx.moment} em UTI`,
      });
    }
    if (ctx.accompaniment && ctx.accompaniment !== 'Não informado') {
      const accStr = ctx.accompaniment === 'Outro' && ctx.accompanimentCustom ? ctx.accompanimentCustom : ctx.accompaniment;
      facts.context!.push({
        id: 'icu-ctx-accompaniment',
        category: 'context',
        sourceField: 'context.accompaniment',
        value: accStr,
        canonicalText: `Acompanhamento: ${accStr.toLowerCase()}`,
      });
    }
    if (ctx.wristbandChecked && ctx.wristbandChecked !== 'Não informado') {
      facts.context!.push({
        id: 'icu-ctx-wristband',
        category: 'context',
        sourceField: 'context.wristbandChecked',
        value: ctx.wristbandChecked,
        canonicalText: `Pulseira de identificação: ${ctx.wristbandChecked.toLowerCase()}`,
      });
    }
    if (ctx.bedSignChecked && ctx.bedSignChecked !== 'Não informado') {
      facts.context!.push({
        id: 'icu-ctx-bedsign',
        category: 'context',
        sourceField: 'context.bedSignChecked',
        value: ctx.bedSignChecked,
        canonicalText: `Placa de identificação do leito: ${ctx.bedSignChecked.toLowerCase()}`,
      });
    }
    if (ctx.allergies && ctx.allergies !== 'Não informado') {
      const det = ctx.allergies === 'Sim' && ctx.allergiesDetails ? `: ${ctx.allergiesDetails}` : '';
      facts.context!.push({
        id: 'icu-ctx-allergies',
        category: 'context',
        sourceField: 'context.allergies',
        value: `${ctx.allergies}${det}`,
        canonicalText: ctx.allergies === 'Sim' ? `Alergias referidas${det}` : 'Sem alergias referidas',
      });
    }
    if (ctx.precaution && ctx.precaution !== 'Não informado') {
      const pStr = ctx.precaution === 'Outra' && ctx.precautionCustom ? ctx.precautionCustom : ctx.precaution;
      facts.context!.push({
        id: 'icu-ctx-precaution',
        category: 'context',
        sourceField: 'context.precaution',
        value: pStr,
        canonicalText: `Precaução: ${pStr.toLowerCase()}`,
      });
    }
  }

  // 2. Observed condition
  const cond = form.observedCondition;
  if (cond) {
    if (cond.behavior && cond.behavior.length > 0 && !cond.behavior.includes('Não avaliado')) {
      const bList = cond.behavior.map((b) => (b === 'Outro' && cond.behaviorCustom ? cond.behaviorCustom : b));
      facts.generalAssessment!.push({
        id: 'icu-cond-behavior',
        category: 'generalAssessment',
        sourceField: 'observedCondition.behavior',
        value: bList.join(', '),
        canonicalText: `Condição observada: ${bList.join(', ').toLowerCase()}`,
      });
    }
    if (cond.complaints && cond.complaints !== 'Não informado' && cond.complaints !== 'Não avaliado') {
      const det = cond.complaints === 'Com queixa' && cond.complaintsDetails ? `: ${cond.complaintsDetails}` : '';
      const src = cond.informationSource && cond.informationSource !== 'Não informado' ? ` (informado por: ${cond.informationSource.toLowerCase()})` : '';
      facts.generalAssessment!.push({
        id: 'icu-cond-complaints',
        category: 'generalAssessment',
        sourceField: 'observedCondition.complaints',
        value: `${cond.complaints}${det}${src}`,
        canonicalText: cond.complaints === 'Sem queixas referidas' ? 'Sem queixas referidas no momento' : `Queixa apresentada${det}${src}`,
      });
    }
  }

  // 3. Vital signs and pain
  const vitals = form.vitalSignsAndPain;
  if (vitals) {
    if (vitals.systolicBP && vitals.diastolicBP) {
      facts.vitalSigns!.push({
        id: 'vs-blood-pressure',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.systolicBP',
        value: `${vitals.systolicBP}/${vitals.diastolicBP} mmHg`,
        canonicalText: `PA: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`,
      });
    } else if (vitals.systolicBP) {
      facts.vitalSigns!.push({
        id: 'vs-systolic',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.systolicBP',
        value: `${vitals.systolicBP} mmHg`,
        canonicalText: `PA sistólica: ${vitals.systolicBP} mmHg`,
      });
    }

    // PAM (vs-map) - Preserved exactly
    if (vitals.meanArterialPressure) {
      facts.vitalSigns!.push({
        id: 'vs-map',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.meanArterialPressure',
        value: `${vitals.meanArterialPressure} mmHg`,
        canonicalText: `PAM: ${vitals.meanArterialPressure} mmHg`,
      });
    }

    if (vitals.heartRate) {
      facts.vitalSigns!.push({
        id: 'vs-heart-rate',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.heartRate',
        value: `${vitals.heartRate} bpm`,
        canonicalText: `FC: ${vitals.heartRate} bpm`,
      });
    }

    if (vitals.respiratoryRate) {
      facts.vitalSigns!.push({
        id: 'vs-respiratory-rate',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.respiratoryRate',
        value: `${vitals.respiratoryRate} irpm`,
        canonicalText: `FR: ${vitals.respiratoryRate} irpm`,
      });
    }

    if (vitals.oxygenSaturation) {
      facts.vitalSigns!.push({
        id: 'vs-spo2',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.oxygenSaturation',
        value: `${vitals.oxygenSaturation}%`,
        canonicalText: `SpO₂: ${vitals.oxygenSaturation}%`,
      });
    }

    if (vitals.temperature) {
      facts.vitalSigns!.push({
        id: 'vs-temperature',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.temperature',
        value: `${vitals.temperature} °C`,
        canonicalText: `Tax: ${vitals.temperature} °C`,
      });
    }

    if (vitals.bloodGlucose) {
      facts.vitalSigns!.push({
        id: 'vs-glucose',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.bloodGlucose',
        value: `${vitals.bloodGlucose} mg/dL`,
        canonicalText: `Glicemia capilar: ${vitals.bloodGlucose} mg/dL`,
      });
    }

    // Pain
    if (vitals.painAssessmentType && vitals.painAssessmentType !== 'Não informado' && vitals.painAssessmentType !== 'Não avaliada') {
      if (vitals.painAssessmentType === 'Escala numérica 0–10' && vitals.painNumericScaleValue !== undefined) {
        facts.vitalSigns!.push({
          id: 'icu-pain-numeric',
          category: 'vitalSigns',
          sourceField: 'vitalSignsAndPain.painNumericScaleValue',
          value: `${vitals.painNumericScaleValue}/10`,
          canonicalText: `Dor avaliada em ${vitals.painNumericScaleValue}/10 em escala numérica`,
        });
      } else if (vitals.painAssessmentType === 'Outra escala' && vitals.painOtherScaleName) {
        facts.vitalSigns!.push({
          id: 'icu-pain-other',
          category: 'vitalSigns',
          sourceField: 'vitalSignsAndPain.painOtherScaleName',
          value: `${vitals.painOtherScaleName}: ${vitals.painOtherScaleResult || ''}`,
          canonicalText: `Dor pela escala ${vitals.painOtherScaleName}: ${vitals.painOtherScaleResult || 'informada'}`,
        });
      } else if (vitals.painAssessmentType === 'Não avaliável') {
        facts.vitalSigns!.push({
          id: 'icu-pain-unassessed',
          category: 'vitalSigns',
          sourceField: 'vitalSignsAndPain.painAssessmentType',
          value: 'Não avaliável',
          canonicalText: 'Dor não avaliável',
        });
      } else if (vitals.painAssessmentType === 'Sem dor') {
        facts.vitalSigns!.push({
          id: 'icu-pain-none',
          category: 'vitalSigns',
          sourceField: 'vitalSignsAndPain.painAssessmentType',
          value: 'Sem dor',
          canonicalText: 'Sem dor referida',
        });
      }
    }
  }

  // 4. Neurological and sedation
  const neuro = form.neurologicalAndSedation;
  if (neuro) {
    if (neuro.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado') {
      const cStr = neuro.consciousnessLevel === 'Outro' && neuro.consciousnessCustom ? neuro.consciousnessCustom : neuro.consciousnessLevel;
      facts.neurological!.push({
        id: 'icu-neuro-consciousness',
        category: 'neurological',
        sourceField: 'neurologicalAndSedation.consciousnessLevel',
        value: cStr,
        canonicalText: `Nível de consciência: ${cStr.toLowerCase()}`,
      });
    }
    if (neuro.orientation && neuro.orientation !== 'Não avaliado' && neuro.orientation !== 'Não avaliável') {
      facts.neurological!.push({
        id: 'icu-neuro-orientation',
        category: 'neurological',
        sourceField: 'neurologicalAndSedation.orientation',
        value: neuro.orientation,
        canonicalText: `Orientação: ${neuro.orientation.toLowerCase()}`,
      });
    }
    if (neuro.glasgowScore !== undefined) {
      facts.neurological!.push({
        id: 'icu-neuro-glasgow',
        category: 'neurological',
        sourceField: 'neurologicalAndSedation.glasgowScore',
        value: String(neuro.glasgowScore),
        canonicalText: `Glasgow: ${neuro.glasgowScore}`,
      });
    }
    if (neuro.rassScore !== undefined) {
      const sign = neuro.rassScore > 0 ? '+' : '';
      facts.neurological!.push({
        id: 'icu-neuro-rass',
        category: 'neurological',
        sourceField: 'neurologicalAndSedation.rassScore',
        value: `${sign}${neuro.rassScore}`,
        canonicalText: `RASS: ${sign}${neuro.rassScore}`,
      });
    }
    if (neuro.pupils && neuro.pupils !== 'Não avaliadas') {
      const pStr = neuro.pupils === 'Outra' && neuro.pupilsCustom ? neuro.pupilsCustom : neuro.pupils;
      facts.neurological!.push({
        id: 'icu-neuro-pupils',
        category: 'neurological',
        sourceField: 'neurologicalAndSedation.pupils',
        value: pStr,
        canonicalText: `Pupilas: ${pStr.toLowerCase()}`,
      });
    }
    if (neuro.photoreaction && neuro.photoreaction !== 'Não avaliada') {
      const phStr = neuro.photoreaction === 'Outra' && neuro.photoreactionCustom ? neuro.photoreactionCustom : neuro.photoreaction;
      facts.neurological!.push({
        id: 'icu-neuro-photoreaction',
        category: 'neurological',
        sourceField: 'neurologicalAndSedation.photoreaction',
        value: phStr,
        canonicalText: `Fotorreação: ${phStr.toLowerCase()}`,
      });
    }
  }

  // 5. Respiratory and ventilation
  const resp = form.respiratoryAndVentilation;
  if (resp) {
    if (resp.respiratorySupport && resp.respiratorySupport !== 'Não informado') {
      const sStr = resp.respiratorySupport === 'Outro' && resp.respiratorySupportCustom ? resp.respiratorySupportCustom : resp.respiratorySupport;
      facts.respiratory!.push({
        id: 'icu-resp-support',
        category: 'respiratory',
        sourceField: 'respiratoryAndVentilation.respiratorySupport',
        value: sStr,
        canonicalText: `Suporte respiratório: ${sStr}`,
      });
    }
    if (resp.respiratorySupport === 'Oxigenoterapia') {
      if (resp.oxygenDevice) {
        const dStr = resp.oxygenDevice === 'Outro' && resp.oxygenDeviceCustom ? resp.oxygenDeviceCustom : resp.oxygenDevice;
        facts.respiratory!.push({
          id: 'icu-resp-ox-device',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.oxygenDevice',
          value: dStr,
          canonicalText: `Dispositivo de O₂: ${dStr}`,
        });
      }
      if (resp.oxygenFlowRate) {
        facts.respiratory!.push({
          id: 'icu-resp-ox-flow',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.oxygenFlowRate',
          value: `${resp.oxygenFlowRate} L/min`,
          canonicalText: `Fluxo de O₂: ${resp.oxygenFlowRate} L/min`,
        });
      }
      if (resp.oxygenFiO2) {
        facts.respiratory!.push({
          id: 'icu-resp-ox-fio2',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.oxygenFiO2',
          value: `${resp.oxygenFiO2}%`,
          canonicalText: `FiO₂: ${resp.oxygenFiO2}%`,
        });
      }
    }
    if (resp.respiratorySupport === 'Ventilação mecânica invasiva') {
      if (resp.mechanicalVentilationAirway) {
        const aStr = resp.mechanicalVentilationAirway === 'Outro' && resp.mechanicalVentilationAirwayCustom ? resp.mechanicalVentilationAirwayCustom : resp.mechanicalVentilationAirway;
        facts.respiratory!.push({
          id: 'icu-resp-vmi-airway',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.mechanicalVentilationAirway',
          value: aStr,
          canonicalText: `Via aérea VMI: ${aStr}`,
        });
      }
      if (resp.ventilationMode) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-mode',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationMode',
          value: resp.ventilationMode,
          canonicalText: `Modo ventilatório: ${resp.ventilationMode}`,
        });
      }
      if (resp.ventilationFiO2) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-fio2',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationFiO2',
          value: `${resp.ventilationFiO2}%`,
          canonicalText: `FiO₂: ${resp.ventilationFiO2}%`,
        });
      }
      if (resp.ventilationPeep) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-peep',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationPeep',
          value: `${resp.ventilationPeep} cmH₂O`,
          canonicalText: `PEEP: ${resp.ventilationPeep} cmH₂O`,
        });
      }
      if (resp.ventilationRate) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-rate',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationRate',
          value: `${resp.ventilationRate} irpm`,
          canonicalText: `FR programada: ${resp.ventilationRate} irpm`,
        });
      }
      if (resp.ventilationTidalVolume) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-volume',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationTidalVolume',
          value: `${resp.ventilationTidalVolume} mL`,
          canonicalText: `Volume corrente: ${resp.ventilationTidalVolume} mL`,
        });
      }
      if (resp.ventilationSupportPressure) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-ps',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationSupportPressure',
          value: `${resp.ventilationSupportPressure} cmH₂O`,
          canonicalText: `Pressão de suporte: ${resp.ventilationSupportPressure} cmH₂O`,
        });
      }
      if (resp.ventilationInspiratoryPressure) {
        facts.respiratory!.push({
          id: 'icu-resp-vmi-pinsp',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.ventilationInspiratoryPressure',
          value: `${resp.ventilationInspiratoryPressure} cmH₂O`,
          canonicalText: `Pressão inspiratória: ${resp.ventilationInspiratoryPressure} cmH₂O`,
        });
      }
    }

    // Airway specific details
    if (resp.totNumber || resp.totFixation || resp.totPositionMarking) {
      facts.respiratory!.push({
        id: 'icu-resp-tot-details',
        category: 'respiratory',
        sourceField: 'respiratoryAndVentilation.totNumber',
        value: `Nº ${resp.totNumber || ''} ${resp.totFixation ? `fixado com ${resp.totFixation}` : ''} ${resp.totPositionMarking ? `marcação ${resp.totPositionMarking}` : ''}`.trim(),
        canonicalText: `Detalhes TOT: nº ${resp.totNumber || 'não informado'}, fixação ${resp.totFixation || 'não informada'}, marcação ${resp.totPositionMarking || 'não informada'}`,
      });
    }
    if (resp.tracheostomyCaliber || resp.tracheostomyStomaCondition || resp.tracheostomyFixation || resp.tracheostomyDressing) {
      facts.respiratory!.push({
        id: 'icu-resp-tqt-details',
        category: 'respiratory',
        sourceField: 'respiratoryAndVentilation.tracheostomyCaliber',
        value: `Calibre ${resp.tracheostomyCaliber || ''}, estoma ${resp.tracheostomyStomaCondition || ''}`,
        canonicalText: `Detalhes traqueostomia: calibre ${resp.tracheostomyCaliber || ''}, estoma ${resp.tracheostomyStomaCondition || ''}`,
      });
    }

    // Padrão e Desconforto Respiratório (Explicit facts required)
    if (resp.respiratoryPattern && resp.respiratoryPattern !== 'Não avaliado' && resp.respiratoryPattern !== 'Não informado') {
      const patStr = resp.respiratoryPattern === 'Outro' && resp.respiratoryPatternCustom ? resp.respiratoryPatternCustom : resp.respiratoryPattern;
      facts.respiratory!.push({
        id: 'icu-resp-pattern',
        category: 'respiratory',
        sourceField: 'respiratoryAndVentilation.respiratoryPattern',
        value: patStr,
        canonicalText: `Padrão respiratório: ${patStr.toLowerCase()}`,
      });
    }

    if (resp.respiratoryDistress && resp.respiratoryDistress !== 'Não avaliado' && resp.respiratoryDistress !== 'Não informado') {
      facts.respiratory!.push({
        id: 'icu-resp-distress',
        category: 'respiratory',
        sourceField: 'respiratoryAndVentilation.respiratoryDistress',
        value: resp.respiratoryDistress,
        canonicalText: resp.respiratoryDistress === 'Ausente' ? 'Sem desconforto respiratório' : 'Com sinais de desconforto respiratório',
      });
    }

    if (resp.accessoryMuscleUse && resp.accessoryMuscleUse !== 'Não avaliado' && resp.accessoryMuscleUse !== 'Não informado') {
      facts.respiratory!.push({
        id: 'icu-resp-accessory-muscles',
        category: 'respiratory',
        sourceField: 'respiratoryAndVentilation.accessoryMuscleUse',
        value: resp.accessoryMuscleUse,
        canonicalText: resp.accessoryMuscleUse === 'Ausente' ? 'Sem uso de musculatura acessória' : 'Com uso de musculatura acessória',
      });
    }

    // Secretions
    if (resp.secretionsPresence && resp.secretionsPresence !== 'Não avaliada' && resp.secretionsPresence !== 'Não informado') {
      if (resp.secretionsPresence === 'Ausente') {
        facts.respiratory!.push({
          id: 'icu-resp-secretions',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.secretionsPresence',
          value: 'Ausente',
          canonicalText: 'Sem secreções traqueais no período',
        });
      } else if (resp.secretionsPresence === 'Presente') {
        const q = resp.secretionsQuantity ? `em ${resp.secretionsQuantity}` : '';
        const col = resp.secretionsColor ? `de coloração ${cleanColor(resp.secretionsColor)}` : '';
        const asp = resp.secretionsAspect ? `e aspecto ${cleanAspect(resp.secretionsAspect)}` : '';
        const cons = resp.secretionsConsistency ? `consistência ${cleanAspect(resp.secretionsConsistency)}` : '';

        // Odor handling: never "odor não"
        let od = '';
        if (resp.secretionsOdor && resp.secretionsOdor !== 'Não avaliado' && resp.secretionsOdor !== 'Não informado') {
          if (resp.secretionsOdor.toLowerCase() === 'ausente' || resp.secretionsOdor.toLowerCase() === 'sem odor') {
            od = 'odor ausente';
          } else if (resp.secretionsOdor.toLowerCase() !== 'não') {
            od = `odor ${resp.secretionsOdor.toLowerCase()}`;
          }
        }

        const sParts = [q, col, asp, cons, od].filter(Boolean).join(' ');
        facts.respiratory!.push({
          id: 'icu-resp-secretions',
          category: 'respiratory',
          sourceField: 'respiratoryAndVentilation.secretionsPresence',
          value: `Presente (${sParts.trim()})`,
          canonicalText: `Presença de secreção em vias aéreas ${sParts.trim()}`.replace(/\s+/g, ' ').trim(),
        });
      }
    }
  }

  // 6. Cardiovascular and perfusion
  const cardio = form.cardiovascularAndPerfusion;
  if (cardio) {
    if (cardio.peripheralPerfusion && cardio.peripheralPerfusion !== 'Não avaliada') {
      facts.cardiovascular!.push({
        id: 'icu-cardio-perfusion',
        category: 'cardiovascular',
        sourceField: 'cardiovascularAndPerfusion.peripheralPerfusion',
        value: cardio.peripheralPerfusion,
        canonicalText: `Perfusão periférica: ${cardio.peripheralPerfusion.toLowerCase()}`,
      });
    }
    if (cardio.extremities && cardio.extremities !== 'Não avaliadas') {
      const eStr = cardio.extremities === 'Outra' && cardio.extremitiesCustom ? cardio.extremitiesCustom : cardio.extremities;
      facts.cardiovascular!.push({
        id: 'icu-cardio-extremities',
        category: 'cardiovascular',
        sourceField: 'cardiovascularAndPerfusion.extremities',
        value: eStr,
        canonicalText: `Extremidades: ${eStr.toLowerCase()}`,
      });
    }
    if (cardio.capillaryRefillTime && cardio.capillaryRefillTime !== 'Não avaliado') {
      const tec = cardio.capillaryRefillTime === 'Informar valor' && cardio.capillaryRefillTimeValue ? `TEC ${cardio.capillaryRefillTimeValue}s` : `TEC ${cardio.capillaryRefillTime}`;
      facts.cardiovascular!.push({
        id: 'icu-cardio-tec',
        category: 'cardiovascular',
        sourceField: 'cardiovascularAndPerfusion.capillaryRefillTime',
        value: tec,
        canonicalText: tec,
      });
    }
    if (cardio.edema && cardio.edema !== 'Não avaliado') {
      const loc = cardio.edemaLocations?.length ? ` em ${cardio.edemaLocations.join(', ')}` : '';
      const grad = cardio.edemaGrading && cardio.edemaGrading !== 'Não graduado' ? ` (${cardio.edemaGrading})` : '';
      facts.cardiovascular!.push({
        id: 'icu-cardio-edema',
        category: 'cardiovascular',
        sourceField: 'cardiovascularAndPerfusion.edema',
        value: cardio.edema === 'Presente' ? `Presente${loc}${grad}` : 'Ausente',
        canonicalText: cardio.edema === 'Presente' ? `Edema presente${loc}${grad}` : 'Sem edema',
      });
    }
    if (cardio.hasInvasiveMonitoring === 'Sim') {
      if (cardio.invasiveArterialPressureValue) {
        facts.cardiovascular!.push({
          id: 'icu-cardio-pai',
          category: 'cardiovascular',
          sourceField: 'cardiovascularAndPerfusion.invasiveArterialPressureValue',
          value: cardio.invasiveArterialPressureValue,
          canonicalText: `PAI: ${cardio.invasiveArterialPressureValue}`,
        });
      }
      if (cardio.centralVenousPressureValue) {
        facts.cardiovascular!.push({
          id: 'icu-cardio-pvc',
          category: 'cardiovascular',
          sourceField: 'cardiovascularAndPerfusion.centralVenousPressureValue',
          value: cardio.centralVenousPressureValue,
          canonicalText: `PVC: ${cardio.centralVenousPressureValue}`,
        });
      }
    }
  }

  // 7. Vasoactive drugs
  const dva = form.vasoactiveDrugs;
  if (dva) {
    if (dva.inUse && dva.inUse !== 'Não informado') {
      facts.vasoactiveDrugs!.push({
        id: 'icu-dva-inuse',
        category: 'vasoactiveDrugs',
        sourceField: 'vasoactiveDrugs.inUse',
        value: dva.inUse,
        canonicalText: `Drogas vasoativas em uso: ${dva.inUse.toLowerCase()}`,
      });
    }
    if (dva.inUse === 'Sim' && dva.drugsList) {
      dva.drugsList.forEach((drug, idx) => {
        if (drug.medication?.trim()) {
          const rate = `${drug.infusionRate} ${drug.unit}`.trim();
          facts.vasoactiveDrugs!.push({
            id: `icu-dva-item-${idx}`,
            category: 'vasoactiveDrugs',
            sourceField: `vasoactiveDrugs.drugsList[${idx}]`,
            value: `${drug.medication} (${rate})`,
            canonicalText: `DVA: ${drug.medication} a ${rate}`,
          });
        }
      });
    }
  }

  // 8. Sedation and Analgesia in infusion
  const sed = form.sedationAndAnalgesia;
  if (sed) {
    if (sed.inUse && sed.inUse !== 'Não informado') {
      facts.sedationAndAnalgesia!.push({
        id: 'icu-sed-inuse',
        category: 'sedationAndAnalgesia',
        sourceField: 'sedationAndAnalgesia.inUse',
        value: sed.inUse,
        canonicalText: `Infusão de sedação/analgesia: ${sed.inUse.toLowerCase()}`,
      });
    }
    if (sed.inUse === 'Sim' && sed.infusionsList) {
      sed.infusionsList.forEach((item, idx) => {
        if (item.medication?.trim()) {
          const rate = `${item.rateOrDose} ${item.unit}`.trim();
          const pur = item.purpose ? ` (${item.purpose.toLowerCase()})` : '';
          facts.sedationAndAnalgesia!.push({
            id: `icu-sed-item-${idx}`,
            category: 'sedationAndAnalgesia',
            sourceField: `sedationAndAnalgesia.infusionsList[${idx}]`,
            value: `${item.medication} (${rate})${pur}`,
            canonicalText: `Sedação/analgesia contínua: ${item.medication} a ${rate}${pur}`,
          });
        }
      });
    }
  }

  // 9. Nutrition and gastrointestinal
  const nut = form.nutritionAndGastrointestinal;
  if (nut) {
    if (nut.nutritionalStatus && nut.nutritionalStatus !== 'Não informado') {
      facts.nutrition!.push({
        id: 'icu-nut-status',
        category: 'nutrition',
        sourceField: 'nutritionAndGastrointestinal.nutritionalStatus',
        value: nut.nutritionalStatus,
        canonicalText: `Situação nutricional: ${nut.nutritionalStatus.toLowerCase()}`,
      });
    }
    if (nut.nutritionalStatus === 'Via oral') {
      if (nut.oralDietAcceptance && nut.oralDietAcceptance !== 'Não avaliada') {
        facts.nutrition!.push({
          id: 'icu-nut-oral-acceptance',
          category: 'nutrition',
          sourceField: 'nutritionAndGastrointestinal.oralDietAcceptance',
          value: nut.oralDietAcceptance,
          canonicalText: `Aceitação de dieta oral: ${nut.oralDietAcceptance.toLowerCase()}`,
        });
      }
    }
    if (nut.nutritionalStatus === 'Dieta enteral') {
      if (nut.enteralRoute) {
        const rStr = nut.enteralRoute === 'Outra' && nut.enteralRouteCustom ? nut.enteralRouteCustom : nut.enteralRoute;
        facts.nutrition!.push({
          id: 'icu-nut-enteral-route',
          category: 'nutrition',
          sourceField: 'nutritionAndGastrointestinal.enteralRoute',
          value: rStr,
          canonicalText: `Via enteral: ${rStr}`,
        });
      }
      if (nut.enteralInfusionRate) {
        facts.nutrition!.push({
          id: 'icu-nut-enteral-rate',
          category: 'nutrition',
          sourceField: 'nutritionAndGastrointestinal.enteralInfusionRate',
          value: `${nut.enteralInfusionRate} mL/h`,
          canonicalText: `Velocidade da dieta enteral: ${nut.enteralInfusionRate} mL/h`,
        });
      }
      // Enteral Tolerance (Explicit fact required)
      if (nut.enteralTolerance && nut.enteralTolerance !== 'Não avaliada' && nut.enteralTolerance !== 'Não informada') {
        const tolStr = nut.enteralTolerance === 'Outra' && nut.enteralToleranceCustom ? nut.enteralToleranceCustom : nut.enteralTolerance;
        facts.nutrition!.push({
          id: 'icu-nut-enteral-tolerance',
          category: 'nutrition',
          sourceField: 'nutritionAndGastrointestinal.enteralTolerance',
          value: tolStr,
          canonicalText: `Tolerância da dieta: ${tolStr.toLowerCase()}`,
        });
      }
      if (nut.enteralDietPaused) {
        facts.nutrition!.push({
          id: 'icu-nut-enteral-paused',
          category: 'nutrition',
          sourceField: 'nutritionAndGastrointestinal.enteralDietPaused',
          value: 'Pausada',
          canonicalText: 'Dieta enteral pausada temporariamente',
        });
      }
    }
    // Gastrointestinal examination
    if (nut.abdomenInspection && nut.abdomenInspection !== 'Não avaliado') {
      const insp = nut.abdomenInspection === 'Outro' && nut.abdomenInspectionCustom ? nut.abdomenInspectionCustom : nut.abdomenInspection;
      facts.nutrition!.push({
        id: 'icu-nut-abdomen-insp',
        category: 'nutrition',
        sourceField: 'nutritionAndGastrointestinal.abdomenInspection',
        value: insp,
        canonicalText: `Inspeção abdominal: ${insp.toLowerCase()}`,
      });
    }
    if (nut.abdomenConsistency && nut.abdomenConsistency !== 'Não avaliado') {
      facts.nutrition!.push({
        id: 'icu-nut-abdomen-cons',
        category: 'nutrition',
        sourceField: 'nutritionAndGastrointestinal.abdomenConsistency',
        value: nut.abdomenConsistency,
        canonicalText: `Consistência abdominal: ${nut.abdomenConsistency.toLowerCase()}`,
      });
    }
    if (nut.abdomenPalpation && nut.abdomenPalpation !== 'Não realizada') {
      facts.nutrition!.push({
        id: 'icu-nut-abdomen-palp',
        category: 'nutrition',
        sourceField: 'nutritionAndGastrointestinal.abdomenPalpation',
        value: nut.abdomenPalpation,
        canonicalText: `Palpação abdominal: ${nut.abdomenPalpation.toLowerCase()}`,
      });
    }
    if (nut.bowelSounds && nut.bowelSounds !== 'Não avaliados') {
      facts.nutrition!.push({
        id: 'icu-nut-bowel-sounds',
        category: 'nutrition',
        sourceField: 'nutritionAndGastrointestinal.bowelSounds',
        value: nut.bowelSounds,
        canonicalText: `Ruídos hidroaéreos: ${nut.bowelSounds.toLowerCase()}`,
      });
    }
  }

  // 10. Eliminations and fluid balance
  const elim = form.eliminationsAndFluidBalance;
  if (elim) {
    if (elim.diuresis && elim.diuresis !== 'Não informado' && elim.diuresis !== 'Não avaliada') {
      const route = elim.urinaryRoute && elim.urinaryRoute !== 'Não informado' ? ` via ${elim.urinaryRoute}` : '';
      const vol = elim.diuresisVolume ? `, volume ${elim.diuresisVolume} mL` : '';
      facts.elimination!.push({
        id: 'icu-elim-diuresis',
        category: 'elimination',
        sourceField: 'eliminationsAndFluidBalance.diuresis',
        value: `${elim.diuresis}${route}${vol}`,
        canonicalText: `Diurese: ${elim.diuresis.toLowerCase()}${route.toLowerCase()}${vol}`,
      });
    } else if (elim.urinaryRoute && elim.urinaryRoute !== 'Não informado') {
      facts.elimination!.push({
        id: 'icu-elim-urinary-route',
        category: 'elimination',
        sourceField: 'eliminationsAndFluidBalance.urinaryRoute',
        value: elim.urinaryRoute,
        canonicalText: `Via urinária: ${elim.urinaryRoute}`,
      });
    }
    if (elim.bowelMovement && elim.bowelMovement !== 'Não informado' && elim.bowelMovement !== 'Não avaliada') {
      const asp = elim.bowelAspect ? ` (${elim.bowelAspect.toLowerCase()})` : '';
      facts.elimination!.push({
        id: 'icu-elim-bowel',
        category: 'elimination',
        sourceField: 'eliminationsAndFluidBalance.bowelMovement',
        value: `${elim.bowelMovement}${asp}`,
        canonicalText: `Evacuação: ${elim.bowelMovement.toLowerCase()}${asp}`,
      });
    }
    if (elim.hasFluidBalance === 'Sim') {
      if (elim.fluidIntake) {
        facts.elimination!.push({
          id: 'icu-elim-fluid-intake',
          category: 'elimination',
          sourceField: 'eliminationsAndFluidBalance.fluidIntake',
          value: `${elim.fluidIntake} mL`,
          canonicalText: `Ganhos hídricos: ${elim.fluidIntake} mL`,
        });
      }
      if (elim.fluidOutput) {
        facts.elimination!.push({
          id: 'icu-elim-fluid-output',
          category: 'elimination',
          sourceField: 'eliminationsAndFluidBalance.fluidOutput',
          value: `${elim.fluidOutput} mL`,
          canonicalText: `Perdas hídricas: ${elim.fluidOutput} mL`,
        });
      }
      if (elim.fluidBalanceResult) {
        facts.elimination!.push({
          id: 'icu-elim-fluid-balance',
          category: 'elimination',
          sourceField: 'eliminationsAndFluidBalance.fluidBalanceResult',
          value: `${elim.fluidBalanceResult} mL`,
          canonicalText: `Balanço hídrico do período: ${elim.fluidBalanceResult} mL`,
        });
      }
    }
  }

  // 11. Devices
  const devs = form.devices;
  if (devs?.list && devs.list.length > 0) {
    devs.list.forEach((dev, idx) => {
      if (dev.type?.trim()) {
        const name = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
        const loc = dev.location ? ` em ${cleanAnatomy(dev.location)}` : '';

        // Device presence fact
        facts.devices!.push({
          id: `icu-dev-${idx}`,
          category: 'devices',
          sourceField: `devices.list[${idx}]`,
          value: `${name}${loc}`,
          canonicalText: `Dispositivo: ${name}${loc}`,
        });

        // Patency / Permeability fact (Explicit)
        if (dev.permeability && dev.permeability !== 'Não avaliado') {
          facts.devices!.push({
            id: `icu-dev-${idx}-patency`,
            category: 'devices',
            sourceField: `devices.list[${idx}].permeability`,
            value: dev.permeability,
            canonicalText: `${name} ${dev.permeability.toLowerCase()}`,
          });
        }

        // Functioning fact (Explicit)
        if (dev.functioning && dev.functioning !== 'Não avaliado') {
          facts.devices!.push({
            id: `icu-dev-${idx}-function`,
            category: 'devices',
            sourceField: `devices.list[${idx}].functioning`,
            value: dev.functioning,
            canonicalText: `${name} ${dev.functioning.toLowerCase()}`,
          });
        }

        // Dressing fact (Explicit)
        if (dev.dressingStatus && dev.dressingStatus !== 'Não avaliado') {
          facts.devices!.push({
            id: `icu-dev-${idx}-dressing`,
            category: 'devices',
            sourceField: `devices.list[${idx}].dressingStatus`,
            value: dev.dressingStatus,
            canonicalText: `Curativo de ${name}: ${dev.dressingStatus.toLowerCase()}`,
          });
        }

        // Phlogistic signs fact (Explicit)
        if (dev.phlogisticSigns && dev.phlogisticSigns !== 'Não avaliados') {
          const det = dev.phlogisticSigns === 'Presentes' && dev.phlogisticSignsDetails ? `: ${dev.phlogisticSignsDetails}` : '';
          facts.devices!.push({
            id: `icu-dev-${idx}-phlogistic`,
            category: 'devices',
            sourceField: `devices.list[${idx}].phlogisticSigns`,
            value: `${dev.phlogisticSigns}${det}`,
            canonicalText: `Sinais flogísticos em ${name}: ${dev.phlogisticSigns.toLowerCase()}${det}`,
          });
        }

        // Drain specific details
        if (dev.type === 'Dreno') {
          if (dev.drainOutputVolume) {
            facts.devices!.push({
              id: `icu-dev-${idx}-drain-vol`,
              category: 'devices',
              sourceField: `devices.list[${idx}].drainOutputVolume`,
              value: `${dev.drainOutputVolume} mL`,
              canonicalText: `Débito do dreno: ${dev.drainOutputVolume} mL`,
            });
          }
          if (dev.drainContentAspect) {
            facts.devices!.push({
              id: `icu-dev-${idx}-drain-aspect`,
              category: 'devices',
              sourceField: `devices.list[${idx}].drainContentAspect`,
              value: dev.drainContentAspect,
              canonicalText: `Aspecto do dreno: ${dev.drainContentAspect}`,
            });
          }
        }
      }
    });
  }

  // 12. Skin
  const skin = form.skinAndIntegrity;
  if (skin) {
    if (skin.integrity && skin.integrity !== 'Não avaliada') {
      const lDesc = skin.integrity === 'Com alteração/lesão' && skin.lesionLocation ? ` em ${skin.lesionLocation}` : '';
      facts.skin!.push({
        id: 'icu-skin-integrity',
        category: 'skin',
        sourceField: 'skinAndIntegrity.integrity',
        value: `${skin.integrity}${lDesc}`,
        canonicalText: skin.integrity === 'Íntegra' ? 'Pele íntegra' : `Pele com alteração/lesão${lDesc}`,
      });
    }
    if (skin.hydration && skin.hydration !== 'Não avaliada') {
      const hStr = skin.hydration === 'Outra' && skin.hydrationCustom ? skin.hydrationCustom : skin.hydration;
      facts.skin!.push({
        id: 'icu-skin-hydration',
        category: 'skin',
        sourceField: 'skinAndIntegrity.hydration',
        value: hStr,
        canonicalText: `Hidratação cutânea: ${hStr.toLowerCase()}`,
      });
    }
  }

  // 13. Mobility and positioning
  const mob = form.mobilityAndPositioning;
  if (mob) {
    if (mob.mobility && mob.mobility !== 'Não avaliado') {
      const mStr = mob.mobility === 'Outro' && mob.mobilityCustom ? mob.mobilityCustom : mob.mobility;
      facts.mobility!.push({
        id: 'icu-mob-status',
        category: 'mobility',
        sourceField: 'mobilityAndPositioning.mobility',
        value: mStr,
        canonicalText: `Mobilidade: ${mStr.toLowerCase()}`,
      });
    }
    if (mob.decubitusChangeDone === 'Sim') {
      const int = mob.decubitusInterval ? ` (${mob.decubitusInterval.toLowerCase()})` : '';
      facts.mobility!.push({
        id: 'icu-mob-decubitus',
        category: 'mobility',
        sourceField: 'mobilityAndPositioning.decubitusChangeDone',
        value: `Mudança de decúbito realizada${int}`,
        canonicalText: `Mudança de decúbito realizada${int}`,
      });
    }
    if (mob.bedHeadElevated === 'Sim') {
      const ang = mob.bedHeadAngle && mob.bedHeadAngle !== 'Não informado' ? ` a ${mob.bedHeadAngle}` : '';
      facts.mobility!.push({
        id: 'icu-mob-bedhead',
        category: 'mobility',
        sourceField: 'mobilityAndPositioning.bedHeadElevated',
        value: `Cabeceira elevada${ang}`,
        canonicalText: `Cabeceira elevada${ang}`,
      });
    }
    if (mob.sideRails && mob.sideRails !== 'Não informado') {
      facts.mobility!.push({
        id: 'icu-mob-siderails',
        category: 'mobility',
        sourceField: 'mobilityAndPositioning.sideRails',
        value: mob.sideRails,
        canonicalText: `Grades de proteção: ${mob.sideRails.toLowerCase()}`,
      });
    }
  }

  // 14. Hygiene and bath
  const hyg = form.hygieneAndBath;
  if (hyg) {
    if (hyg.bodyHygiene && hyg.bodyHygiene !== 'Não informado' && hyg.bodyHygiene !== 'Não avaliada') {
      facts.hygiene!.push({
        id: 'icu-hyg-body',
        category: 'hygiene',
        sourceField: 'hygieneAndBath.bodyHygiene',
        value: hyg.bodyHygiene,
        canonicalText: `Higiene corporal: ${hyg.bodyHygiene.toLowerCase()}`,
      });
    }
    if (hyg.bathType && hyg.bathType !== 'Não informado' && hyg.bathType !== 'Não realizado') {
      const bStr = hyg.bathType === 'Outro' && hyg.bathTypeCustom ? hyg.bathTypeCustom : hyg.bathType;
      const tol = hyg.bathTolerance && hyg.bathTolerance !== 'Não informado' ? ` (${hyg.bathTolerance.toLowerCase()})` : '';
      facts.hygiene!.push({
        id: 'icu-hyg-bath',
        category: 'hygiene',
        sourceField: 'hygieneAndBath.bathType',
        value: `${bStr}${tol}`,
        canonicalText: `Banho: ${bStr.toLowerCase()}${tol}`,
      });
    }
  }

  // 15. Care done
  const care = form.nursingCareDone;
  if (care) {
    if (care.careItems && care.careItems.length > 0) {
      care.careItems.forEach((c, idx) => {
        facts.care!.push({
          id: `icu-care-item-${idx}`,
          category: 'care',
          sourceField: `nursingCareDone.careItems[${idx}]`,
          value: c,
          canonicalText: `Cuidado executado: ${c}`,
        });
      });
    }
    if (care.otherCareDescription?.trim()) {
      facts.care!.push({
        id: 'icu-care-other',
        category: 'care',
        sourceField: 'nursingCareDone.otherCareDescription',
        value: care.otherCareDescription.trim(),
        canonicalText: `Outro cuidado: ${care.otherCareDescription.trim()}`,
      });
    }
  }

  // 16. Complications and communication
  const comp = form.complicationsAndCommunication;
  if (comp) {
    if (comp.hasComplication && comp.hasComplication !== 'Não informado') {
      if (comp.hasComplication === 'Não') {
        facts.complications!.push({
          id: 'icu-comp-none',
          category: 'complications',
          sourceField: 'complicationsAndCommunication.hasComplication',
          value: 'Sem intercorrências no período',
          canonicalText: 'Sem intercorrências registradas no período',
        });
      } else if (comp.hasComplication === 'Sim') {
        const desc = comp.complicationDescription || 'Intercorrência registrada';
        facts.complications!.push({
          id: 'icu-comp-present',
          category: 'complications',
          sourceField: 'complicationsAndCommunication.complicationDescription',
          value: desc,
          canonicalText: `Intercorrência: ${desc}`,
        });
      }
    }
    if (comp.communicatedTo && comp.communicatedTo !== 'Não realizada') {
      const rec = comp.communicatedTo === 'Outro profissional' && comp.communicationRecipientCustom ? comp.communicationRecipientCustom : comp.communicatedTo;
      facts.complications!.push({
        id: 'icu-comp-communication',
        category: 'complications',
        sourceField: 'complicationsAndCommunication.communicatedTo',
        value: rec,
        canonicalText: `Comunicação realizada com: ${rec}`,
      });
    }
  }

  // 17. Observed changes in period
  const changes = form.observedChangesInPeriod;
  if (changes) {
    if (changes.comparisonStatus && changes.comparisonStatus !== 'Não informado' && changes.comparisonStatus !== 'Sem comparação disponível') {
      const cDesc = changes.comparisonStatus === 'Houve alteração observada' && changes.changeDescription ? `: ${changes.changeDescription}` : '';
      facts.additional!.push({
        id: 'icu-changes-status',
        category: 'additional',
        sourceField: 'observedChangesInPeriod.comparisonStatus',
        value: `${changes.comparisonStatus}${cDesc}`,
        canonicalText: changes.comparisonStatus === 'Sem alterações observadas' ? 'Sem alterações observadas em relação ao período anterior' : `Alteração observada no período${cDesc}`,
      });
    }
  }

  // 18. Final status
  const fin = form.finalStatus;
  if (fin) {
    if (fin.condition && fin.condition !== 'Não informado') {
      const fStr = fin.condition === 'Outra' && fin.conditionCustom ? fin.conditionCustom : fin.condition;
      facts.finalStatus!.push({
        id: 'icu-fin-status',
        category: 'finalStatus',
        sourceField: 'finalStatus.condition',
        value: fStr,
        canonicalText: fStr,
      });
    }
  }

  // 19. Additional info
  if (form.additionalInfo?.observations?.trim()) {
    facts.additional!.push({
      id: 'icu-add-obs',
      category: 'additional',
      sourceField: 'additionalInfo.observations',
      value: form.additionalInfo.observations.trim(),
      canonicalText: `Observação: ${form.additionalInfo.observations.trim()}`,
    });
  }

  return facts;
}
