import { NurseEvolutionForm } from '../types/nurseEvolutionClinical';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';

/**
 * Normalizes anatomical strings to ensure strict linguistic accuracy.
 */
function normalizeAnatomicalText(text: string): string {
  if (!text) return '';
  return text.replace(/\bfemural\b/gi, 'femoral');
}

/**
 * Builds authorized clinical facts for NurseEvolutionForm.
 * Extracts exclusively factual, explicitly provided data without making any clinical or diagnostic inferences.
 */
export function buildAuthorizedNurseEvolutionFacts(
  data: Partial<NurseEvolutionForm>
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts & { [key: string]: ClinicalFact[] | undefined } = {};

  // 1. Contexto do registro
  if (data.context) {
    const cFacts: ClinicalFact[] = [];
    const c = data.context;

    if (c.moment) {
      const momentStr = c.moment === 'Outro' && c.customMoment ? c.customMoment : c.moment;
      cFacts.push({
        id: 'nurse-evo-ctx-moment',
        category: 'context',
        sourceField: 'context.moment',
        value: momentStr,
        canonicalText: `Momento do registro: ${momentStr}`,
      });
    }

    if (c.location) {
      const locStr = c.location === 'Outro' && c.customLocation ? c.customLocation : c.location;
      cFacts.push({
        id: 'nurse-evo-ctx-location',
        category: 'context',
        sourceField: 'context.location',
        value: locStr,
        canonicalText: `Local: ${locStr}`,
      });
    }

    if (c.escort && c.escort !== 'Não informado') {
      const escStr = c.escort === 'Outro' && c.customEscort ? c.customEscort : c.escort;
      cFacts.push({
        id: 'nurse-evo-ctx-escort',
        category: 'context',
        sourceField: 'context.escort',
        value: escStr,
        canonicalText: `Acompanhamento: ${escStr}`,
      });
    }

    if (c.wristbandIdentification && c.wristbandIdentification !== 'Não informado') {
      cFacts.push({
        id: 'nurse-evo-ctx-wristband',
        category: 'context',
        sourceField: 'context.wristbandIdentification',
        value: c.wristbandIdentification,
        canonicalText: `Identificação por pulseira: ${c.wristbandIdentification}`,
      });
    }

    if (c.bedIdentification && c.bedIdentification !== 'Não informado') {
      cFacts.push({
        id: 'nurse-evo-ctx-bed-plate',
        category: 'context',
        sourceField: 'context.bedIdentification',
        value: c.bedIdentification,
        canonicalText: `Identificação na placa de leito: ${c.bedIdentification}`,
      });
    }

    if (c.precaution && c.precaution !== 'Não informado') {
      const precStr = c.precaution === 'Outra' && c.customPrecaution ? c.customPrecaution : c.precaution;
      cFacts.push({
        id: 'nurse-evo-ctx-precaution',
        category: 'context',
        sourceField: 'context.precaution',
        value: precStr,
        canonicalText: `Precaução: ${precStr}`,
      });
    }

    if (c.hasAllergies && c.hasAllergies !== 'Não informado') {
      const allStr = c.hasAllergies === 'Sim' && c.allergyDescription ? `Sim (${c.allergyDescription})` : c.hasAllergies;
      cFacts.push({
        id: 'nurse-evo-ctx-allergies',
        category: 'context',
        sourceField: 'context.hasAllergies',
        value: allStr,
        canonicalText: `Alergias: ${allStr}`,
      });
    }

    if (cFacts.length > 0) facts.context = cFacts;
  }

  // 2. Avaliação geral
  if (data.generalAssessment) {
    const gFacts: ClinicalFact[] = [];
    const g = data.generalAssessment;

    if (g.behavior && g.behavior.length > 0 && !g.behavior.includes('Não avaliado')) {
      const behList = g.behavior.map((b) => (b === 'Outro' && g.customBehavior ? g.customBehavior : b));
      gFacts.push({
        id: 'nurse-evo-gen-behavior',
        category: 'general',
        sourceField: 'generalAssessment.behavior',
        value: behList,
        canonicalText: `Comportamento: ${behList.join(', ')}`,
      });
    }

    if (g.complaintStatus && g.complaintStatus !== 'Não informado' && g.complaintStatus !== 'Não avaliado') {
      if (g.complaintStatus === 'Com queixa' && g.complaintDescription) {
        gFacts.push({
          id: 'nurse-evo-gen-complaint',
          category: 'general',
          sourceField: 'generalAssessment.complaintDescription',
          value: g.complaintDescription,
          canonicalText: `Queixa referida: ${g.complaintDescription}`,
        });
      } else if (g.complaintStatus === 'Sem queixas referidas') {
        gFacts.push({
          id: 'nurse-evo-gen-complaint',
          category: 'general',
          sourceField: 'generalAssessment.complaintStatus',
          value: 'Sem queixas referidas',
          canonicalText: 'Sem queixas referidas no momento',
        });
      } else if (g.complaintStatus === 'Impossibilitado de informar') {
        gFacts.push({
          id: 'nurse-evo-gen-complaint',
          category: 'general',
          sourceField: 'generalAssessment.complaintStatus',
          value: 'Impossibilitado de informar',
          canonicalText: 'Impossibilitado de informar queixas',
        });
      }
    }

    if (g.informationSource && g.informationSource !== 'Não informado') {
      const srcStr = g.informationSource === 'Outra' && g.customInformationSource ? g.customInformationSource : g.informationSource;
      gFacts.push({
        id: 'nurse-evo-gen-source',
        category: 'general',
        sourceField: 'generalAssessment.informationSource',
        value: srcStr,
        canonicalText: `Fonte das informações: ${srcStr}`,
      });
    }

    if (g.hygieneStatus && g.hygieneStatus !== 'Não informado' && g.hygieneStatus !== 'Não avaliada') {
      gFacts.push({
        id: 'nurse-evo-gen-hygiene',
        category: 'general',
        sourceField: 'generalAssessment.hygieneStatus',
        value: g.hygieneStatus,
        canonicalText: `Higiene: ${g.hygieneStatus}`,
      });
    }

    if (gFacts.length > 0) facts.general = gFacts;
  }

  // 3. Sinais vitais e dor
  if (data.vitalSignsAndPain) {
    const vFacts: ClinicalFact[] = [];
    const pFacts: ClinicalFact[] = [];
    const v = data.vitalSignsAndPain;

    if (v.systolicBP && v.diastolicBP) {
      vFacts.push({
        id: 'nurse-evo-bp',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.systolicBP',
        value: `${v.systolicBP}/${v.diastolicBP} mmHg`,
        canonicalText: `Pressão arterial: ${v.systolicBP}/${v.diastolicBP} mmHg`,
      });
    }

    if (v.meanArterialPressure) {
      vFacts.push({
        id: 'nurse-evo-map',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.meanArterialPressure',
        value: `${v.meanArterialPressure} mmHg`,
        canonicalText: `PAM: ${v.meanArterialPressure} mmHg`,
      });
    }

    if (v.heartRate) {
      vFacts.push({
        id: 'nurse-evo-hr',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.heartRate',
        value: `${v.heartRate} bpm`,
        canonicalText: `Frequência cardíaca: ${v.heartRate} bpm`,
      });
    }

    if (v.respiratoryRate) {
      vFacts.push({
        id: 'nurse-evo-rr',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.respiratoryRate',
        value: `${v.respiratoryRate} irpm`,
        canonicalText: `Frequência respiratória: ${v.respiratoryRate} irpm`,
      });
    }

    if (v.oxygenSaturation) {
      vFacts.push({
        id: 'nurse-evo-spo2',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.oxygenSaturation',
        value: `${v.oxygenSaturation}%`,
        canonicalText: `Saturação de O₂: ${v.oxygenSaturation}%`,
      });
    }

    if (v.temperature) {
      vFacts.push({
        id: 'nurse-evo-temp',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.temperature',
        value: `${v.temperature} °C`,
        canonicalText: `Temperatura axilar: ${v.temperature} °C`,
      });
    }

    if (v.capillaryBloodGlucose) {
      vFacts.push({
        id: 'nurse-evo-glucose',
        category: 'vitalSigns',
        sourceField: 'vitalSignsAndPain.capillaryBloodGlucose',
        value: `${v.capillaryBloodGlucose} mg/dL`,
        canonicalText: `Glicemia capilar: ${v.capillaryBloodGlucose} mg/dL`,
      });
    }

    // Pain
    if (v.painScaleType && v.painScaleType !== 'Não avaliada' && v.painScaleType !== 'Não informado') {
      if (v.painScaleType === 'Não avaliável') {
        pFacts.push({
          id: 'nurse-evo-pain-score',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painScaleType',
          value: 'Não avaliável',
          canonicalText: 'Dor não avaliável no momento',
        });
      } else if (v.painScore) {
        pFacts.push({
          id: 'nurse-evo-pain-score',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painScore',
          value: v.painScore,
          canonicalText: `Dor: ${v.painScore}/10 (${v.painScaleType})`,
        });
      }
      if (v.painLocation) {
        pFacts.push({
          id: 'nurse-evo-pain-location',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painLocation',
          value: v.painLocation,
          canonicalText: `Localização da dor: ${v.painLocation}`,
        });
      }
      if (v.painCharacteristic) {
        pFacts.push({
          id: 'nurse-evo-pain-char',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painCharacteristic',
          value: v.painCharacteristic,
          canonicalText: `Característica da dor: ${v.painCharacteristic}`,
        });
      }
      if (v.painDuration) {
        pFacts.push({
          id: 'nurse-evo-pain-duration',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painDuration',
          value: v.painDuration,
          canonicalText: `Duração da dor: ${v.painDuration}`,
        });
      }
      if (v.painReliefOrAggravatingFactors) {
        pFacts.push({
          id: 'nurse-evo-pain-factors',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painReliefOrAggravatingFactors',
          value: v.painReliefOrAggravatingFactors,
          canonicalText: `Fatores de melhora/piora da dor: ${v.painReliefOrAggravatingFactors}`,
        });
      }
      if (v.painObservation) {
        pFacts.push({
          id: 'nurse-evo-pain-obs',
          category: 'pain',
          sourceField: 'vitalSignsAndPain.painObservation',
          value: v.painObservation,
          canonicalText: `Observação da dor: ${v.painObservation}`,
        });
      }
    }

    if (vFacts.length > 0) facts.vitalSigns = vFacts;
    if (pFacts.length > 0) facts.pain = pFacts;
  }

  // 4. Neurológico
  if (data.neurological) {
    const nFacts: ClinicalFact[] = [];
    const n = data.neurological;

    if (n.consciousnessLevel && n.consciousnessLevel !== 'Não avaliado') {
      const cStr = n.consciousnessLevel === 'Outro' && n.customConsciousness ? n.customConsciousness : n.consciousnessLevel;
      nFacts.push({
        id: 'nurse-evo-neuro-consc',
        category: 'neurological',
        sourceField: 'neurological.consciousnessLevel',
        value: cStr,
        canonicalText: `Nível de consciência: ${cStr}`,
      });
    }

    if (n.orientation && n.orientation !== 'Não avaliado' && n.orientation !== 'Não avaliável') {
      nFacts.push({
        id: 'nurse-evo-neuro-orient',
        category: 'neurological',
        sourceField: 'neurological.orientation',
        value: n.orientation,
        canonicalText: `Orientação: ${n.orientation}`,
      });
    } else if (n.orientation === 'Não avaliável') {
      nFacts.push({
        id: 'nurse-evo-neuro-orient',
        category: 'neurological',
        sourceField: 'neurological.orientation',
        value: 'Não avaliável',
        canonicalText: 'Orientação temporoespacial não avaliável',
      });
    }

    if (n.glasgowScore && n.glasgowScore !== 'Não aplicado' && n.glasgowScore !== 'Não avaliado') {
      nFacts.push({
        id: 'nurse-evo-neuro-glasgow',
        category: 'neurological',
        sourceField: 'neurological.glasgowScore',
        value: n.glasgowScore,
        canonicalText: `Escala de Coma de Glasgow: ${n.glasgowScore}`,
      });
    }

    if (n.rassScore && n.rassScore !== 'Não aplicado' && n.rassScore !== 'Não avaliado') {
      nFacts.push({
        id: 'nurse-evo-neuro-rass',
        category: 'neurological',
        sourceField: 'neurological.rassScore',
        value: n.rassScore,
        canonicalText: `Escala RASS: ${n.rassScore}`,
      });
    }

    if (n.pupils && n.pupils !== 'Não avaliadas') {
      const pStr = n.pupils === 'Outra' && n.customPupils ? n.customPupils : n.pupils;
      nFacts.push({
        id: 'nurse-evo-neuro-pupils',
        category: 'neurological',
        sourceField: 'neurological.pupils',
        value: pStr,
        canonicalText: `Pupilas: ${pStr}`,
      });
    }

    if (n.photoreaction && n.photoreaction !== 'Não avaliada') {
      const phStr = n.photoreaction === 'Outra' && n.customPhotoreaction ? n.customPhotoreaction : n.photoreaction;
      nFacts.push({
        id: 'nurse-evo-neuro-photo',
        category: 'neurological',
        sourceField: 'neurological.photoreaction',
        value: phStr,
        canonicalText: `Fotorreação pupilar: ${phStr}`,
      });
    }

    if (n.motorDeficit && n.motorDeficit !== 'Não avaliado') {
      const motStr = n.motorDeficit === 'Presente' && n.motorDeficitDescription ? `Presente (${n.motorDeficitDescription})` : n.motorDeficit;
      nFacts.push({
        id: 'nurse-evo-neuro-motor-deficit',
        category: 'neurological',
        sourceField: 'neurological.motorDeficit',
        value: motStr,
        canonicalText: `Déficit motor: ${motStr}`,
      });
    }

    if (nFacts.length > 0) facts.neurological = nFacts;
  }

  // 5. Respiratório
  if (data.respiratory) {
    const rFacts: ClinicalFact[] = [];
    const r = data.respiratory;

    if (r.respiratorySupport && r.respiratorySupport !== 'Não informado') {
      let suppStr = r.respiratorySupport;
      if (r.respiratorySupport === 'Oxigenoterapia' && r.oxygenDevice) {
        suppStr = `Oxigenoterapia sob ${r.oxygenDevice}${r.oxygenFlowRate ? ` a ${r.oxygenFlowRate} ${r.oxygenFlowUnit || 'L/min'}` : ''}`;
      } else if (r.respiratorySupport === 'VNI') {
        suppStr = `VNI${r.vniInterface ? ` (${r.vniInterface})` : ''}${r.vniIpap || r.vniEpap ? ` IPAP: ${r.vniIpap || '-'} / EPAP: ${r.vniEpap || '-'} cmH₂O` : ''}${r.vniFiO2 ? ` FiO₂: ${r.vniFiO2}%` : ''}`;
      } else if (r.respiratorySupport === 'VMI') {
        suppStr = `VMI em ${r.vmiAirway || 'TOT'}${r.vmiMode ? ` modo ${r.vmiMode}` : ''}${r.vmiFiO2 ? ` FiO₂ ${r.vmiFiO2}%` : ''}${r.vmiPeep ? ` PEEP ${r.vmiPeep} cmH₂O` : ''}`;
      }
      rFacts.push({
        id: 'nurse-evo-resp-support',
        category: 'respiratory',
        sourceField: 'respiratory.respiratorySupport',
        value: suppStr,
        canonicalText: `Suporte ventilatório: ${suppStr}`,
      });
    }

    if (r.respiratoryPattern && r.respiratoryPattern !== 'Não avaliado') {
      const patStr = r.respiratoryPattern === 'Outro' && r.customPattern ? r.customPattern : r.respiratoryPattern;
      rFacts.push({
        id: 'nurse-evo-resp-pattern',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryPattern',
        value: patStr,
        canonicalText: `Padrão respiratório: ${patStr}`,
      });
    }

    if (r.respiratoryDistress && r.respiratoryDistress !== 'Não avaliado') {
      rFacts.push({
        id: 'nurse-evo-resp-distress',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryDistress',
        value: r.respiratoryDistress,
        canonicalText: `Desconforto respiratório: ${r.respiratoryDistress}`,
      });
    }

    if (r.accessoryMuscles && r.accessoryMuscles !== 'Não avaliado') {
      rFacts.push({
        id: 'nurse-evo-resp-accessory-muscles',
        category: 'respiratory',
        sourceField: 'respiratory.accessoryMuscles',
        value: r.accessoryMuscles,
        canonicalText: `Uso de musculatura acessória: ${r.accessoryMuscles}`,
      });
    }

    if (r.secretions && r.secretions !== 'Não avaliadas') {
      const secStr = r.secretions === 'Presentes' && r.secretionsDescription ? `Presentes (${r.secretionsDescription})` : r.secretions;
      rFacts.push({
        id: 'nurse-evo-resp-secretions',
        category: 'respiratory',
        sourceField: 'respiratory.secretions',
        value: secStr,
        canonicalText: `Secreções em vias aéreas: ${secStr}`,
      });
    }

    if (rFacts.length > 0) facts.respiratory = rFacts;
  }

  // 6. Ausculta pulmonar (seção independente)
  if (data.pulmonaryAuscultation && data.pulmonaryAuscultation.performed === 'Sim') {
    const paFacts: ClinicalFact[] = [];
    const pa = data.pulmonaryAuscultation;

    paFacts.push({
      id: 'nurse-evo-pulm-performed',
      category: 'pulmonaryAuscultation',
      sourceField: 'pulmonaryAuscultation.performed',
      value: 'Sim',
      canonicalText: 'Ausculta pulmonar realizada',
    });

    if (pa.vesicularMurmur) {
      const vesStr = pa.vesicularMurmurDetails ? `${pa.vesicularMurmur} (${pa.vesicularMurmurDetails})` : pa.vesicularMurmur;
      paFacts.push({
        id: 'nurse-evo-pulm-vesicular',
        category: 'pulmonaryAuscultation',
        sourceField: 'pulmonaryAuscultation.vesicularMurmur',
        value: vesStr,
        canonicalText: `Murmúrio vesicular: ${vesStr}`,
      });
    }

    if (pa.adventitiousSounds && pa.adventitiousSounds !== 'Não avaliados') {
      if (pa.adventitiousSounds === 'Presentes' && pa.adventitiousSoundTypes && pa.adventitiousSoundTypes.length > 0) {
        const typesStr = pa.adventitiousSoundTypes.join(', ');
        const locStr = pa.adventitiousSoundLocation ? ` em ${pa.adventitiousSoundLocation}` : '';
        paFacts.push({
          id: 'nurse-evo-pulm-adventitious',
          category: 'pulmonaryAuscultation',
          sourceField: 'pulmonaryAuscultation.adventitiousSoundTypes',
          value: `${typesStr}${locStr}`,
          canonicalText: `Ruídos adventícios presentes: ${typesStr}${locStr}`,
        });
      } else if (pa.adventitiousSounds === 'Ausentes') {
        paFacts.push({
          id: 'nurse-evo-pulm-adventitious',
          category: 'pulmonaryAuscultation',
          sourceField: 'pulmonaryAuscultation.adventitiousSounds',
          value: 'Ausentes',
          canonicalText: 'Sem ruídos adventícios',
        });
      }
    }

    if (paFacts.length > 0) facts.pulmonaryAuscultation = paFacts;
  }

  // 7. Cardiovascular
  if (data.cardiovascular) {
    const cvFacts: ClinicalFact[] = [];
    const cv = data.cardiovascular;

    if (cv.peripheralPerfusion && cv.peripheralPerfusion !== 'Não avaliada') {
      const perfStr = cv.peripheralPerfusion === 'Outra' && cv.customPerfusion ? cv.customPerfusion : cv.peripheralPerfusion;
      cvFacts.push({
        id: 'nurse-evo-cv-perfusion',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.peripheralPerfusion',
        value: perfStr,
        canonicalText: `Perfusão periférica: ${perfStr}`,
      });
    }

    if (cv.extremities && cv.extremities !== 'Não avaliadas') {
      const extStr = cv.extremities === 'Outra' && cv.customExtremities ? cv.customExtremities : cv.extremities;
      cvFacts.push({
        id: 'nurse-evo-cv-extremities',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.extremities',
        value: extStr,
        canonicalText: `Extremidades: ${extStr}`,
      });
    }

    if (cv.capillaryRefillTime && cv.capillaryRefillTime !== 'Não avaliado') {
      const tecStr = cv.capillaryRefillTime === 'valor informado' && cv.customRefillTime ? cv.customRefillTime : cv.capillaryRefillTime;
      cvFacts.push({
        id: 'nurse-evo-cv-tec',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.capillaryRefillTime',
        value: tecStr,
        canonicalText: `Tempo de enchimento capilar (TEC): ${tecStr}`,
      });
    }

    if (cv.edema && cv.edema !== 'Não avaliado') {
      const edStr = cv.edema === 'Presente'
        ? `Presente${cv.edemaLocation ? ` em ${cv.edemaLocation}` : ''}${cv.edemaGrade ? ` (${cv.edemaGrade})` : ''}`
        : 'Ausente';
      cvFacts.push({
        id: 'nurse-evo-cv-edema',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.edema',
        value: edStr,
        canonicalText: `Edema: ${edStr}`,
      });
    }

    if (cvFacts.length > 0) facts.cardiovascular = cvFacts;
  }

  // 8. Ausculta cardíaca (seção independente)
  if (data.cardiacAuscultation && data.cardiacAuscultation.performed === 'Sim') {
    const caFacts: ClinicalFact[] = [];
    const ca = data.cardiacAuscultation;

    caFacts.push({
      id: 'nurse-evo-card-performed',
      category: 'cardiacAuscultation',
      sourceField: 'cardiacAuscultation.performed',
      value: 'Sim',
      canonicalText: 'Ausculta cardíaca realizada',
    });

    if (ca.heartSounds) {
      const sndStr = ca.heartSounds === 'Outra' && ca.customHeartSounds ? ca.customHeartSounds : ca.heartSounds;
      caFacts.push({
        id: 'nurse-evo-card-sounds',
        category: 'cardiacAuscultation',
        sourceField: 'cardiacAuscultation.heartSounds',
        value: sndStr,
        canonicalText: `Bulhas cardíacas: ${sndStr}`,
      });
    }

    if (ca.rhythm) {
      const rhyStr = ca.rhythm === 'Outro' && ca.customRhythm ? ca.customRhythm : ca.rhythm;
      caFacts.push({
        id: 'nurse-evo-card-rhythm',
        category: 'cardiacAuscultation',
        sourceField: 'cardiacAuscultation.rhythm',
        value: rhyStr,
        canonicalText: `Ritmo cardíaco: ${rhyStr}`,
      });
    }

    if (ca.times) {
      const timStr = ca.times === 'Outro' && ca.customTimes ? ca.customTimes : ca.times;
      caFacts.push({
        id: 'nurse-evo-card-times',
        category: 'cardiacAuscultation',
        sourceField: 'cardiacAuscultation.times',
        value: timStr,
        canonicalText: `Tempos cardíacos: ${timStr}`,
      });
    }

    if (ca.murmurs && ca.murmurs !== 'Não avaliados') {
      const murStr = ca.murmurs === 'Presentes' && ca.murmursDescription ? `Presentes (${ca.murmursDescription})` : ca.murmurs;
      caFacts.push({
        id: 'nurse-evo-card-murmurs',
        category: 'cardiacAuscultation',
        sourceField: 'cardiacAuscultation.murmurs',
        value: murStr,
        canonicalText: `Sopros cardíacos: ${murStr}`,
      });
    }

    if (caFacts.length > 0) facts.cardiacAuscultation = caFacts;
  }

  // 9. Gastrointestinal e nutrição
  if (data.gastrointestinalAndNutrition) {
    const giFacts: ClinicalFact[] = [];
    const nutFacts: ClinicalFact[] = [];
    const gi = data.gastrointestinalAndNutrition;

    if (gi.abdomenForm && gi.abdomenForm !== 'Não avaliado') {
      const formStr = gi.abdomenForm === 'Outro' && gi.customAbdomenForm ? gi.customAbdomenForm : gi.abdomenForm;
      giFacts.push({
        id: 'nurse-evo-gi-form',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinalAndNutrition.abdomenForm',
        value: formStr,
        canonicalText: `Forma do abdome: ${formStr}`,
      });
    }

    if (gi.abdomenConsistency && gi.abdomenConsistency !== 'Não avaliado') {
      const consStr = gi.abdomenConsistency === 'Outro' && gi.customAbdomenConsistency ? gi.customAbdomenConsistency : gi.abdomenConsistency;
      giFacts.push({
        id: 'nurse-evo-gi-consistency',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinalAndNutrition.abdomenConsistency',
        value: consStr,
        canonicalText: `Consistência abdominal: ${consStr}`,
      });
    }

    if (gi.abdomenPalpation && gi.abdomenPalpation !== 'Não realizada') {
      const palpStr = gi.abdomenPalpation === 'Doloroso' && gi.abdomenPainLocation ? `Doloroso (${gi.abdomenPainLocation})` : gi.abdomenPalpation;
      giFacts.push({
        id: 'nurse-evo-gi-palpation',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinalAndNutrition.abdomenPalpation',
        value: palpStr,
        canonicalText: `Palpação abdominal: ${palpStr}`,
      });
    }

    if (gi.bowelSounds && gi.bowelSounds !== 'Não avaliados') {
      giFacts.push({
        id: 'nurse-evo-gi-rha',
        category: 'gastrointestinal',
        sourceField: 'gastrointestinalAndNutrition.bowelSounds',
        value: gi.bowelSounds,
        canonicalText: `Ruídos hidroaéreos (RHA): ${gi.bowelSounds}`,
      });
    }

    // Nutrição
    if (gi.nutritionalStatus && gi.nutritionalStatus !== 'Não informado') {
      nutFacts.push({
        id: 'nurse-evo-nut-status',
        category: 'nutrition',
        sourceField: 'gastrointestinalAndNutrition.nutritionalStatus',
        value: gi.nutritionalStatus,
        canonicalText: `Dieta: ${gi.nutritionalStatus}`,
      });

      if (gi.nutritionalStatus === 'Via oral' && gi.oralAcceptance) {
        nutFacts.push({
          id: 'nurse-evo-nut-oral-acceptance',
          category: 'nutrition',
          sourceField: 'gastrointestinalAndNutrition.oralAcceptance',
          value: gi.oralAcceptance,
          canonicalText: `Aceitação da dieta via oral: ${gi.oralAcceptance}`,
        });
      }

      if (gi.nutritionalStatus === 'Dieta enteral') {
        if (gi.enteralRoute) {
          nutFacts.push({
            id: 'nurse-evo-nut-enteral-route',
            category: 'nutrition',
            sourceField: 'gastrointestinalAndNutrition.enteralRoute',
            value: gi.enteralRoute,
            canonicalText: `Via enteral: ${gi.enteralRoute}`,
          });
        }
        if (gi.enteralRate) {
          nutFacts.push({
            id: 'nurse-evo-nut-enteral-rate',
            category: 'nutrition',
            sourceField: 'gastrointestinalAndNutrition.enteralRate',
            value: `${gi.enteralRate} ${gi.enteralRateUnit || 'mL/h'}`,
            canonicalText: `Vazão da dieta enteral: ${gi.enteralRate} ${gi.enteralRateUnit || 'mL/h'}`,
          });
        }
        if (gi.enteralTolerance && gi.enteralTolerance !== 'Não informada') {
          nutFacts.push({
            id: 'nurse-evo-nut-enteral-tolerance',
            category: 'nutrition',
            sourceField: 'gastrointestinalAndNutrition.enteralTolerance',
            value: gi.enteralTolerance,
            canonicalText: `Tolerância da dieta enteral: ${gi.enteralTolerance}`,
          });
        }
      }
    }

    if (giFacts.length > 0) facts.gastrointestinal = giFacts;
    if (nutFacts.length > 0) facts.nutrition = nutFacts;
  }

  // 10. Eliminações
  if (data.eliminations) {
    const elFacts: ClinicalFact[] = [];
    const el = data.eliminations;

    if (el.diuresis && el.diuresis !== 'Não informado' && el.diuresis !== 'Não avaliada') {
      const volStr = el.urineVolume ? ` (volume: ${el.urineVolume} mL)` : '';
      const aspStr = el.urineAspect ? ` de aspecto ${el.urineAspect}` : '';
      elFacts.push({
        id: 'nurse-evo-elim-diuresis',
        category: 'urinary',
        sourceField: 'eliminations.diuresis',
        value: `${el.diuresis}${volStr}${aspStr}`,
        canonicalText: `Diurese: ${el.diuresis}${volStr}${aspStr}`,
      });
    }

    if (el.urinaryRoute && el.urinaryRoute !== 'Não informado') {
      const rStr = el.urinaryRoute === 'Outra' && el.customUrinaryRoute ? el.customUrinaryRoute : el.urinaryRoute;
      elFacts.push({
        id: 'nurse-evo-elim-urinary-route',
        category: 'urinary',
        sourceField: 'eliminations.urinaryRoute',
        value: rStr,
        canonicalText: `Via urinária: ${rStr}`,
      });
    }

    if (el.bowelElimination && el.bowelElimination !== 'Não informado' && el.bowelElimination !== 'Não avaliadas') {
      const consStr = el.bowelElimination === 'Presentes' && el.bowelConsistency ? ` (${el.bowelConsistency})` : '';
      const freqStr = el.bowelFrequency ? ` frequência: ${el.bowelFrequency}` : '';
      elFacts.push({
        id: 'nurse-evo-elim-bowel',
        category: 'bowel',
        sourceField: 'eliminations.bowelElimination',
        value: `${el.bowelElimination}${consStr}${freqStr}`,
        canonicalText: `Eliminações intestinais: ${el.bowelElimination}${consStr}${freqStr}`,
      });
    }

    if (elFacts.length > 0) {
      facts.urinary = elFacts.filter((f) => f.category === 'urinary');
      facts.bowel = elFacts.filter((f) => f.category === 'bowel');
    }
  }

  // 11. Dispositivos
  if (data.devices && data.devices.list && data.devices.list.length > 0) {
    const devFacts: ClinicalFact[] = [];

    data.devices.list.forEach((dev, idx) => {
      const locNorm = normalizeAnatomicalText(dev.location || '');
      const mainFactVal = `${dev.type}${locNorm ? ` em ${locNorm}` : ''}`;

      devFacts.push({
        id: `nurse-evo-dev-${idx}`,
        category: 'devices',
        sourceField: `devices.list[${idx}]`,
        value: mainFactVal,
        canonicalText: `Dispositivo: ${mainFactVal}`,
      });

      if (dev.permeability && dev.permeability !== 'Não avaliado') {
        devFacts.push({
          id: `nurse-evo-dev-${idx}-patency`,
          category: 'devices',
          sourceField: `devices.list[${idx}].permeability`,
          value: dev.permeability,
          canonicalText: `${dev.type}: ${dev.permeability}`,
        });
      }

      if (dev.functioning && dev.functioning !== 'Não avaliado') {
        devFacts.push({
          id: `nurse-evo-dev-${idx}-function`,
          category: 'devices',
          sourceField: `devices.list[${idx}].functioning`,
          value: dev.functioning,
          canonicalText: `${dev.type}: ${dev.functioning}`,
        });
      }

      if (dev.dressingStatus && dev.dressingStatus !== 'Não avaliado') {
        devFacts.push({
          id: `nurse-evo-dev-${idx}-dressing`,
          category: 'devices',
          sourceField: `devices.list[${idx}].dressingStatus`,
          value: dev.dressingStatus,
          canonicalText: `${dev.type}: curativo ${dev.dressingStatus}`,
        });
      } else if (dev.dressingClean && dev.dressingDry && dev.dressingIntact) {
        devFacts.push({
          id: `nurse-evo-dev-${idx}-dressing`,
          category: 'devices',
          sourceField: `devices.list[${idx}].dressingClean`,
          value: 'Limpo, seco e íntegro',
          canonicalText: `${dev.type}: curativo limpo, seco e íntegro`,
        });
      }

      if (dev.phlogisticSigns && dev.phlogisticSigns !== 'Não avaliados') {
        devFacts.push({
          id: `nurse-evo-dev-${idx}-phlogistic`,
          category: 'devices',
          sourceField: `devices.list[${idx}].phlogisticSigns`,
          value: dev.phlogisticSigns,
          canonicalText: `${dev.type}: sinais flogísticos ${dev.phlogisticSigns}`,
        });
      }

      if (dev.observations) {
        devFacts.push({
          id: `nurse-evo-dev-${idx}-obs`,
          category: 'devices',
          sourceField: `devices.list[${idx}].observations`,
          value: dev.observations,
          canonicalText: `${dev.type}: ${dev.observations}`,
        });
      }
    });

    if (devFacts.length > 0) facts.devices = devFacts;
  }

  // 12. Pele e integridade cutânea
  if (data.skin) {
    const sFacts: ClinicalFact[] = [];
    const s = data.skin;

    if (s.integrity && s.integrity !== 'Não avaliada') {
      sFacts.push({
        id: 'nurse-evo-skin-integrity',
        category: 'skin',
        sourceField: 'skin.integrity',
        value: s.integrity,
        canonicalText: `Integridade cutânea: ${s.integrity}`,
      });

      if (s.integrity === 'Com alteração/lesão') {
        if (s.lesionLocation) {
          sFacts.push({
            id: 'nurse-evo-skin-lesion-loc',
            category: 'skin',
            sourceField: 'skin.lesionLocation',
            value: s.lesionLocation,
            canonicalText: `Localização da lesão: ${s.lesionLocation}`,
          });
        }
        if (s.lesionDescription) {
          sFacts.push({
            id: 'nurse-evo-skin-lesion-desc',
            category: 'skin',
            sourceField: 'skin.lesionDescription',
            value: s.lesionDescription,
            canonicalText: `Descrição da lesão: ${s.lesionDescription}`,
          });
        }
        if (s.lesionDimensions) {
          sFacts.push({
            id: 'nurse-evo-skin-lesion-dim',
            category: 'skin',
            sourceField: 'skin.lesionDimensions',
            value: s.lesionDimensions,
            canonicalText: `Dimensões da lesão: ${s.lesionDimensions}`,
          });
        }
        if (s.lesionExudate) {
          sFacts.push({
            id: 'nurse-evo-skin-lesion-exudate',
            category: 'skin',
            sourceField: 'skin.lesionExudate',
            value: s.lesionExudate,
            canonicalText: `Exsudato da lesão: ${s.lesionExudate}`,
          });
        }
        if (s.lesionDressing) {
          sFacts.push({
            id: 'nurse-evo-skin-lesion-dressing',
            category: 'skin',
            sourceField: 'skin.lesionDressing',
            value: s.lesionDressing,
            canonicalText: `Curativo/cobertura: ${s.lesionDressing}`,
          });
        }
        if (s.perilesionalCondition) {
          sFacts.push({
            id: 'nurse-evo-skin-lesion-peri',
            category: 'skin',
            sourceField: 'skin.perilesionalCondition',
            value: s.perilesionalCondition,
            canonicalText: `Pele perilesional: ${s.perilesionalCondition}`,
          });
        }
      }
    }

    if (s.hydration && s.hydration !== 'Não avaliada') {
      const hydStr = s.hydration === 'Outra' && s.customHydration ? s.customHydration : s.hydration;
      sFacts.push({
        id: 'nurse-evo-skin-hydration',
        category: 'skin',
        sourceField: 'skin.hydration',
        value: hydStr,
        canonicalText: `Hidratação cutânea: ${hydStr}`,
      });
    }

    if (s.coloration && s.coloration !== 'Não avaliada') {
      const colStr = s.coloration === 'Outra' && s.customColoration ? s.customColoration : s.coloration;
      sFacts.push({
        id: 'nurse-evo-skin-coloration',
        category: 'skin',
        sourceField: 'skin.coloration',
        value: colStr,
        canonicalText: `Coloração cutânea: ${colStr}`,
      });
    }

    if (sFacts.length > 0) facts.skin = sFacts;
  }

  // 13. Mobilidade e segurança
  if (data.mobilityAndSafety) {
    const mFacts: ClinicalFact[] = [];
    const m = data.mobilityAndSafety;

    if (m.mobility && m.mobility !== 'Não avaliado') {
      const mobStr = m.mobility === 'Outro' && m.customMobility ? m.customMobility : m.mobility;
      mFacts.push({
        id: 'nurse-evo-mob-mobility',
        category: 'mobility',
        sourceField: 'mobilityAndSafety.mobility',
        value: mobStr,
        canonicalText: `Mobilidade: ${mobStr}`,
      });
    }

    if (m.repositioning && m.repositioning !== 'Não informado') {
      const repStr = m.repositioning === 'Realizada' && m.repositioningInterval ? `Realizada (${m.repositioningInterval})` : m.repositioning;
      mFacts.push({
        id: 'nurse-evo-mob-repositioning',
        category: 'mobility',
        sourceField: 'mobilityAndSafety.repositioning',
        value: repStr,
        canonicalText: `Mudança de decúbito: ${repStr}`,
      });
    }

    if (m.bedRails && m.bedRails !== 'Não informado') {
      mFacts.push({
        id: 'nurse-evo-safety-rails',
        category: 'safety',
        sourceField: 'mobilityAndSafety.bedRails',
        value: m.bedRails,
        canonicalText: `Grades do leito: ${m.bedRails}`,
      });
    }

    if (m.headOfBed && m.headOfBed !== 'Não informado') {
      const headStr = m.headOfBed === 'Elevada' && m.headOfBedAngle ? `Elevada a ${m.headOfBedAngle}` : m.headOfBed;
      mFacts.push({
        id: 'nurse-evo-safety-head-of-bed',
        category: 'safety',
        sourceField: 'mobilityAndSafety.headOfBed',
        value: headStr,
        canonicalText: `Cabeceira: ${headStr}`,
      });
    }

    if (mFacts.length > 0) facts.mobility = mFacts;
  }

  // 14. Terapias e infusões
  if (data.therapiesAndInfusions) {
    const tFacts: ClinicalFact[] = [];
    const t = data.therapiesAndInfusions;

    if (t.vasoactiveDrugsInUse === 'Sim' && t.vasoactiveDrugsList && t.vasoactiveDrugsList.length > 0) {
      t.vasoactiveDrugsList.forEach((dva, idx) => {
        const dvaStr = `${dva.medication} (${dva.doseOrRate} ${dva.unit}${dva.route ? ` via ${dva.route}` : ''})`;
        tFacts.push({
          id: `nurse-evo-dva-${idx}`,
          category: 'vasoactive',
          sourceField: `therapiesAndInfusions.vasoactiveDrugsList[${idx}]`,
          value: dvaStr,
          canonicalText: `Droga vasoativa em infusão: ${dvaStr}`,
        });
      });
    } else if (t.vasoactiveDrugsInUse === 'Não') {
      tFacts.push({
        id: 'nurse-evo-dva-status',
        category: 'vasoactive',
        sourceField: 'therapiesAndInfusions.vasoactiveDrugsInUse',
        value: 'Não',
        canonicalText: 'Sem drogas vasoativas em infusão',
      });
    }

    if (t.sedationAnalgesiaInUse === 'Sim' && t.sedationAnalgesiaList && t.sedationAnalgesiaList.length > 0) {
      t.sedationAnalgesiaList.forEach((sed, idx) => {
        const sedStr = `${sed.medication} (${sed.doseOrRate} ${sed.unit}${sed.route ? ` via ${sed.route}` : ''})`;
        tFacts.push({
          id: `nurse-evo-sed-${idx}`,
          category: 'sedationAnalgesia',
          sourceField: `therapiesAndInfusions.sedationAnalgesiaList[${idx}]`,
          value: sedStr,
          canonicalText: `Sedação/analgesia contínua: ${sedStr}`,
        });
      });
    } else if (t.sedationAnalgesiaInUse === 'Não') {
      tFacts.push({
        id: 'nurse-evo-sed-status',
        category: 'sedationAnalgesia',
        sourceField: 'therapiesAndInfusions.sedationAnalgesiaInUse',
        value: 'Não',
        canonicalText: 'Sem sedação contínua em infusão',
      });
    }

    if (t.otherInfusionsInUse === 'Sim' && t.otherInfusionsList && t.otherInfusionsList.length > 0) {
      t.otherInfusionsList.forEach((inf, idx) => {
        const infStr = `${inf.substance} (${inf.doseOrRate} ${inf.unit}${inf.route ? ` via ${inf.route}` : ''})`;
        tFacts.push({
          id: `nurse-evo-inf-${idx}`,
          category: 'otherInfusions',
          sourceField: `therapiesAndInfusions.otherInfusionsList[${idx}]`,
          value: infStr,
          canonicalText: `Infusão contínua: ${infStr}`,
        });
      });
    }

    if (tFacts.length > 0) {
      facts.vasoactive = tFacts.filter((f) => f.category === 'vasoactive');
      facts.sedationAnalgesia = tFacts.filter((f) => f.category === 'sedationAnalgesia');
      facts.otherInfusions = tFacts.filter((f) => f.category === 'otherInfusions');
    }
  }

  // 15. Cuidados/intervenções de enfermagem
  if (data.careDone) {
    const cFacts: ClinicalFact[] = [];
    const cd = data.careDone;

    if (cd.careItems && cd.careItems.length > 0) {
      cd.careItems.forEach((item, idx) => {
        cFacts.push({
          id: `nurse-evo-care-${idx}`,
          category: 'care',
          sourceField: `careDone.careItems[${idx}]`,
          value: item,
          canonicalText: item,
        });
      });
    }

    if (cd.customCareDetails) {
      cFacts.push({
        id: 'nurse-evo-care-custom',
        category: 'care',
        sourceField: 'careDone.customCareDetails',
        value: cd.customCareDetails,
        canonicalText: cd.customCareDetails,
      });
    }

    if (cFacts.length > 0) facts.care = cFacts;
  }

  // 16. Avaliação de riscos
  if (data.riskAssessment) {
    const rFacts: ClinicalFact[] = [];
    const r = data.riskAssessment;

    if (r.fallRiskStatus === 'Avaliado') {
      const scaleStr = r.fallRiskScale ? `escala ${r.fallRiskScale}` : '';
      const scoreStr = r.fallRiskScore ? `escore ${r.fallRiskScore}` : '';
      const classStr = r.fallRiskClassification ? `classificação: ${r.fallRiskClassification}` : '';
      const fullVal = [scaleStr, scoreStr, classStr].filter(Boolean).join(', ');
      rFacts.push({
        id: 'nurse-evo-risk-fall',
        category: 'risks',
        sourceField: 'riskAssessment.fallRiskStatus',
        value: fullVal || 'Avaliado',
        canonicalText: `Risco de queda avaliado: ${fullVal || 'Avaliado'}`,
      });
    }

    if (r.pressureInjuryRiskStatus === 'Avaliado') {
      const scaleStr = r.pressureInjuryScale ? `escala ${r.pressureInjuryScale}` : '';
      const scoreStr = r.pressureInjuryScore ? `escore ${r.pressureInjuryScore}` : '';
      const classStr = r.pressureInjuryClassification ? `classificação: ${r.pressureInjuryClassification}` : '';
      const fullVal = [scaleStr, scoreStr, classStr].filter(Boolean).join(', ');
      rFacts.push({
        id: 'nurse-evo-risk-lpp',
        category: 'risks',
        sourceField: 'riskAssessment.pressureInjuryRiskStatus',
        value: fullVal || 'Avaliado',
        canonicalText: `Risco de lesão por pressão avaliado: ${fullVal || 'Avaliado'}`,
      });
    }

    if (r.aspirationRiskStatus && r.aspirationRiskStatus !== 'Não avaliado') {
      const aspStr = r.aspirationRiskStatus === 'Outra descrição' && r.customAspirationRisk ? r.customAspirationRisk : r.aspirationRiskStatus;
      rFacts.push({
        id: 'nurse-evo-risk-aspiration',
        category: 'risks',
        sourceField: 'riskAssessment.aspirationRiskStatus',
        value: aspStr,
        canonicalText: `Risco de broncoaspiração: ${aspStr}`,
      });
    }

    if (rFacts.length > 0) facts.risks = rFacts;
  }

  // 17. Intercorrências
  if (data.complications) {
    const compFacts: ClinicalFact[] = [];
    const comp = data.complications;

    if (comp.hasComplication === 'Sim' && comp.description) {
      compFacts.push({
        id: 'nurse-evo-comp-desc',
        category: 'complications',
        sourceField: 'complications.description',
        value: comp.description,
        canonicalText: `Intercorrência: ${comp.description}${comp.time ? ` às ${comp.time}` : ''}`,
      });

      if (comp.interventionDone) {
        compFacts.push({
          id: 'nurse-evo-comp-intervention',
          category: 'complications',
          sourceField: 'complications.interventionDone',
          value: comp.interventionDone,
          canonicalText: `Conduta realizada: ${comp.interventionDone}`,
        });
      }

      if (comp.responseObserved) {
        compFacts.push({
          id: 'nurse-evo-comp-response',
          category: 'complications',
          sourceField: 'complications.responseObserved',
          value: comp.responseObserved,
          canonicalText: `Resposta observada: ${comp.responseObserved}`,
        });
      }

      if (comp.communicationDone) {
        compFacts.push({
          id: 'nurse-evo-comp-comm',
          category: 'complications',
          sourceField: 'complications.communicationDone',
          value: comp.communicationDone,
          canonicalText: `Comunicação da intercorrência: ${comp.communicationDone}${comp.communicationTime ? ` às ${comp.communicationTime}` : ''}`,
        });
      }
    } else if (comp.hasComplication === 'Não') {
      compFacts.push({
        id: 'nurse-evo-comp-status',
        category: 'complications',
        sourceField: 'complications.hasComplication',
        value: 'Não',
        canonicalText: 'Sem intercorrências registradas no período',
      });
    }

    if (compFacts.length > 0) facts.complications = compFacts;
  }

  // 18. Comunicação
  if (data.communication) {
    const commFacts: ClinicalFact[] = [];
    const cm = data.communication;

    if (cm.hasCommunication === 'Sim') {
      const tgtStr = cm.target === 'Outro' && cm.customTarget ? cm.customTarget : cm.target || 'equipe';
      const rsnStr = cm.reason ? ` - Motivo: ${cm.reason}` : '';
      const tmStr = cm.time ? ` às ${cm.time}` : '';
      const respStr = cm.responseObserved ? ` - Retorno/resposta: ${cm.responseObserved}` : '';

      commFacts.push({
        id: 'nurse-evo-comm-target',
        category: 'communication',
        sourceField: 'communication.target',
        value: `${tgtStr}${rsnStr}${tmStr}${respStr}`,
        canonicalText: `Comunicação realizada com ${tgtStr}${rsnStr}${tmStr}${respStr}`,
      });
    }

    if (commFacts.length > 0) facts.communication = commFacts;
  }

  // 19. Resposta aos cuidados
  if (data.responseToCare && data.responseToCare.evaluated === 'Sim' && data.responseToCare.structuredResponseText) {
    facts.responseToCare = [
      {
        id: 'nurse-evo-resp-care-text',
        category: 'responseToCare',
        sourceField: 'responseToCare.structuredResponseText',
        value: data.responseToCare.structuredResponseText,
        canonicalText: data.responseToCare.structuredResponseText,
      },
    ];
  }

  // 20. Alterações, Síntese de Enfermagem e Situação atual
  if (data.evolutionState) {
    const evFacts: ClinicalFact[] = [];
    const es = data.evolutionState;

    if (es.statusChange && es.statusChange !== 'Não informado') {
      const chgStr = es.changeDescription ? `${es.statusChange}: ${es.changeDescription}` : es.statusChange;
      evFacts.push({
        id: 'nurse-evo-state-change',
        category: 'evolutionState',
        sourceField: 'evolutionState.statusChange',
        value: chgStr,
        canonicalText: `Evolução em relação à avaliação anterior: ${chgStr}`,
      });
    }

    if (es.nursingSynthesis && es.nursingSynthesis.trim()) {
      evFacts.push({
        id: 'nurse-evo-synthesis',
        category: 'evolutionState',
        sourceField: 'evolutionState.nursingSynthesis',
        value: es.nursingSynthesis.trim(),
        canonicalText: `Síntese da avaliação de enfermagem: ${es.nursingSynthesis.trim()}`,
      });
    }

    if (es.currentStatus && es.currentStatus !== 'Não informado') {
      const curStr = es.currentStatus === 'Outra' && es.customCurrentStatus ? es.customCurrentStatus : es.currentStatus;
      evFacts.push({
        id: 'nurse-evo-current-status',
        category: 'evolutionState',
        sourceField: 'evolutionState.currentStatus',
        value: curStr,
        canonicalText: `Situação atual: ${curStr}`,
      });
    }

    if (evFacts.length > 0) facts.evolutionState = evFacts;
  }

  return facts;
}
