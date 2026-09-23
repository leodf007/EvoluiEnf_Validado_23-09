import {
  NurseWoundsAssessmentForm,
  createInitialNurseWoundsAssessmentForm,
} from '../types/nurseWoundsAssessment';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';

function normalizeString(val?: string): string {
  return val ? val.trim() : '';
}

function normalizeMeasurement(val?: string): string {
  if (!val) return '';
  return val.replace(/\s*cm\b/gi, '').trim();
}

/**
 * Normalizes the raw form input, removing excess whitespace and safeguarding structures.
 */
export function normalizeNurseWoundsAssessmentForm(
  raw: NurseWoundsAssessmentForm
): NurseWoundsAssessmentForm {
  const initial = createInitialNurseWoundsAssessmentForm();

  return {
    evaluationContext: {
      evaluationDate: normalizeString(raw.evaluationContext?.evaluationDate),
      evaluationTime: normalizeString(raw.evaluationContext?.evaluationTime),
      bedLocation: normalizeString(raw.evaluationContext?.bedLocation),
      clinicalUnit: normalizeString(raw.evaluationContext?.clinicalUnit),
    },
    evaluationType: {
      type: normalizeString(raw.evaluationType?.type),
      typeDetails: normalizeString(raw.evaluationType?.typeDetails),
    },
    woundIdentification: {
      woundType: normalizeString(raw.woundIdentification?.woundType),
      woundTypeOther: normalizeString(raw.woundIdentification?.woundTypeOther),
      woundNumber: normalizeString(raw.woundIdentification?.woundNumber),
    },
    anatomicalLocation: {
      region: normalizeString(raw.anatomicalLocation?.region),
      regionDetails: normalizeString(raw.anatomicalLocation?.regionDetails),
    },
    laterality: {
      side: normalizeString(raw.laterality?.side),
    },
    reportedDuration: {
      durationText: normalizeString(raw.reportedDuration?.durationText),
    },
    reportedOrigin: {
      origin: normalizeString(raw.reportedOrigin?.origin),
      originDetails: normalizeString(raw.reportedOrigin?.originDetails),
    },
    woundMeasurements: {
      lengthCm: normalizeMeasurement(raw.woundMeasurements?.lengthCm),
      widthCm: normalizeMeasurement(raw.woundMeasurements?.widthCm),
      depthCm: normalizeMeasurement(raw.woundMeasurements?.depthCm),
      measurementUnit: normalizeString(raw.woundMeasurements?.measurementUnit) || 'cm',
    },
    woundBed: {
      tissues: Array.isArray(raw.woundBed?.tissues)
        ? raw.woundBed.tissues.map((t) => t.trim()).filter(Boolean)
        : [],
      otherTissueDetails: normalizeString(raw.woundBed?.otherTissueDetails),
      tissuePercentages: raw.woundBed?.tissuePercentages || {},
    },
    woundEdges: {
      characteristics: Array.isArray(raw.woundEdges?.characteristics)
        ? raw.woundEdges.characteristics.map((c) => c.trim()).filter(Boolean)
        : [],
      edgeDetails: normalizeString(raw.woundEdges?.edgeDetails),
    },
    perilesionalSkin: {
      characteristics: Array.isArray(raw.perilesionalSkin?.characteristics)
        ? raw.perilesionalSkin.characteristics.map((c) => c.trim()).filter(Boolean)
        : [],
      skinDetails: normalizeString(raw.perilesionalSkin?.skinDetails),
    },
    exudate: {
      present: normalizeString(raw.exudate?.present) || 'Não',
      type: normalizeString(raw.exudate?.type),
      amount: normalizeString(raw.exudate?.amount),
      exudateDetails: normalizeString(raw.exudate?.exudateDetails),
    },
    odor: {
      present: normalizeString(raw.odor?.present) || 'ausente',
      odorDetails: normalizeString(raw.odor?.odorDetails),
    },
    woundPain: {
      hasPain: normalizeString(raw.woundPain?.hasPain) || 'Não',
      painScale: normalizeString(raw.woundPain?.painScale),
      painScore: normalizeString(raw.woundPain?.painScore),
      painDetails: normalizeString(raw.woundPain?.painDetails),
    },
    staging: {
      stage: normalizeString(raw.staging?.stage) || 'não informado',
      stagingNotes: normalizeString(raw.staging?.stagingNotes),
    },
    tunneling: {
      present: normalizeString(raw.tunneling?.present) || 'Não',
      clockPosition: normalizeString(raw.tunneling?.clockPosition),
      depthCm: normalizeString(raw.tunneling?.depthCm),
      details: normalizeString(raw.tunneling?.details),
    },
    observedSigns: {
      signs: Array.isArray(raw.observedSigns?.signs)
        ? raw.observedSigns.signs.map((s) => s.trim()).filter(Boolean)
        : [],
      signsDetails: normalizeString(raw.observedSigns?.signsDetails),
    },
    relatedDevices: {
      hasRelatedDevices: normalizeString(raw.relatedDevices?.hasRelatedDevices) || 'Não',
      devices: Array.isArray(raw.relatedDevices?.devices)
        ? raw.relatedDevices.devices.map((d) => ({
            deviceType: normalizeString(d.deviceType),
            anatomicalSite: normalizeString(d.anatomicalSite),
            condition: normalizeString(d.condition),
          }))
        : [],
    },
    currentCovering: {
      coveringFound: normalizeString(raw.currentCovering?.coveringFound),
    },
    dressingProcedure: {
      performed: normalizeString(raw.dressingProcedure?.performed) || 'Não',
      cleansingSolution: normalizeString(raw.dressingProcedure?.cleansingSolution),
      cleansingTechnique: normalizeString(raw.dressingProcedure?.cleansingTechnique),
      techniqueType: normalizeString(raw.dressingProcedure?.techniqueType),
      primaryDressing: normalizeString(raw.dressingProcedure?.primaryDressing),
      secondaryDressing: normalizeString(raw.dressingProcedure?.secondaryDressing),
      fixation: normalizeString(raw.dressingProcedure?.fixation),
    },
    productsUsed: {
      products: Array.isArray(raw.productsUsed?.products)
        ? raw.productsUsed.products.map((p) => p.trim()).filter(Boolean)
        : [],
      productDetails: normalizeString(raw.productsUsed?.productDetails),
    },
    observedResponse: {
      patientTolerance: normalizeString(raw.observedResponse?.patientTolerance),
      immediateOutcome: normalizeString(raw.observedResponse?.immediateOutcome),
    },
    previousComparison: {
      comparison: normalizeString(raw.previousComparison?.comparison),
      comparisonNotes: normalizeString(raw.previousComparison?.comparisonNotes),
    },
    nurseConduct: {
      dressingFrequency: normalizeString(raw.nurseConduct?.dressingFrequency),
      guidance: normalizeString(raw.nurseConduct?.guidance),
      referrals: normalizeString(raw.nurseConduct?.referrals),
    },
    additionalInfo: {
      notes: normalizeString(raw.additionalInfo?.notes),
    },
  };
}

/**
 * Builds canonical AuthorizedClinicalFacts for the nurse wound assessment.
 */
export function buildAuthorizedNurseWoundsFacts(
  form: NurseWoundsAssessmentForm
): AuthorizedClinicalFacts {
  const norm = normalizeNurseWoundsAssessmentForm(form);
  const facts: AuthorizedClinicalFacts = {};

  // FACT-WOUND-001: Contexto da avaliação
  if (
    norm.evaluationContext.bedLocation ||
    norm.evaluationContext.clinicalUnit ||
    norm.evaluationContext.evaluationDate
  ) {
    const parts: string[] = [];
    if (norm.evaluationContext.clinicalUnit) parts.push(`Unidade: ${norm.evaluationContext.clinicalUnit}`);
    if (norm.evaluationContext.bedLocation) parts.push(`Leito: ${norm.evaluationContext.bedLocation}`);
    if (norm.evaluationContext.evaluationDate) {
      const timePart = norm.evaluationContext.evaluationTime ? ` às ${norm.evaluationContext.evaluationTime}` : '';
      parts.push(`Data/hora: ${norm.evaluationContext.evaluationDate}${timePart}`);
    }
    facts.context = [
      {
        id: 'FACT-WOUND-001',
        category: 'context',
        sourceField: 'evaluationContext',
        value: norm.evaluationContext,
        canonicalText: `Avaliação de feridas realizada. ${parts.join(', ')}.`,
      },
    ];
  }

  // FACT-WOUND-002: Tipo de avaliação
  if (norm.evaluationType.type) {
    facts.evaluationType = [
      {
        id: 'FACT-WOUND-002',
        category: 'evaluationType',
        sourceField: 'evaluationType',
        value: norm.evaluationType,
        canonicalText: `Tipo de avaliação: ${norm.evaluationType.type}${norm.evaluationType.typeDetails ? ` (${norm.evaluationType.typeDetails})` : ''}.`,
      },
    ];
  }

  // FACT-WOUND-003: Identificação da lesão
  if (norm.woundIdentification.woundType) {
    const wType =
      norm.woundIdentification.woundType === 'outra' && norm.woundIdentification.woundTypeOther
        ? norm.woundIdentification.woundTypeOther
        : norm.woundIdentification.woundType;
    const numPart = norm.woundIdentification.woundNumber ? ` (${norm.woundIdentification.woundNumber})` : '';
    facts.woundIdentification = [
      {
        id: 'FACT-WOUND-003',
        category: 'woundIdentification',
        sourceField: 'woundIdentification',
        value: norm.woundIdentification,
        canonicalText: `Identificação da lesão: ${wType}${numPart}.`,
      },
    ];
  }

  // FACT-WOUND-004: Localização anatômica
  if (norm.anatomicalLocation.region) {
    const regDetail = norm.anatomicalLocation.regionDetails ? ` (${norm.anatomicalLocation.regionDetails})` : '';
    facts.anatomicalLocation = [
      {
        id: 'FACT-WOUND-004',
        category: 'anatomicalLocation',
        sourceField: 'anatomicalLocation',
        value: norm.anatomicalLocation,
        canonicalText: `Localização anatômica: região ${norm.anatomicalLocation.region}${regDetail}.`,
      },
    ];
  }

  // FACT-WOUND-005: Lateralidade
  if (norm.laterality.side) {
    facts.laterality = [
      {
        id: 'FACT-WOUND-005',
        category: 'laterality',
        sourceField: 'laterality',
        value: norm.laterality,
        canonicalText: `Lateralidade: lado ${norm.laterality.side}.`,
      },
    ];
  }

  // FACT-WOUND-006: Tempo e Origem
  if (norm.reportedDuration.durationText || norm.reportedOrigin.origin) {
    const parts: string[] = [];
    if (norm.reportedDuration.durationText) parts.push(`tempo de existência referido de ${norm.reportedDuration.durationText}`);
    if (norm.reportedOrigin.origin) {
      const origDet = norm.reportedOrigin.originDetails ? ` (${norm.reportedOrigin.originDetails})` : '';
      parts.push(`origem informada: ${norm.reportedOrigin.origin}${origDet}`);
    }
    facts.durationAndOrigin = [
      {
        id: 'FACT-WOUND-006',
        category: 'durationAndOrigin',
        sourceField: 'reportedDuration/reportedOrigin',
        value: { duration: norm.reportedDuration, origin: norm.reportedOrigin },
        canonicalText: `Histórico informado da lesão: ${parts.join(', ')}.`,
      },
    ];
  }

  // FACT-WOUND-007: Medidas da lesão (NumericFactLock compliance - sem cálculos automáticos)
  if (
    norm.woundMeasurements.lengthCm ||
    norm.woundMeasurements.widthCm ||
    norm.woundMeasurements.depthCm
  ) {
    const parts: string[] = [];
    if (norm.woundMeasurements.lengthCm) parts.push(`comprimento: ${norm.woundMeasurements.lengthCm} cm`);
    if (norm.woundMeasurements.widthCm) parts.push(`largura: ${norm.woundMeasurements.widthCm} cm`);
    if (norm.woundMeasurements.depthCm) parts.push(`profundidade: ${norm.woundMeasurements.depthCm} cm`);

    facts.woundMeasurements = [
      {
        id: 'FACT-WOUND-007',
        category: 'woundMeasurements',
        sourceField: 'woundMeasurements',
        value: norm.woundMeasurements,
        canonicalText: `Dimensões mensuradas da lesão: ${parts.join(', ')}.`,
      },
    ];
  }

  // FACT-WOUND-008: Leito da ferida
  if (norm.woundBed.tissues.length > 0 || norm.woundBed.otherTissueDetails) {
    const tissuesText = norm.woundBed.tissues.join(', ');
    const detailText = norm.woundBed.otherTissueDetails ? ` (${norm.woundBed.otherTissueDetails})` : '';
    facts.woundBed = [
      {
        id: 'FACT-WOUND-008',
        category: 'woundBed',
        sourceField: 'woundBed',
        value: norm.woundBed,
        canonicalText: `Características do leito da ferida: presença de tecido de ${tissuesText}${detailText}.`,
      },
    ];
  }

  // FACT-WOUND-009: Bordas
  if (norm.woundEdges.characteristics.length > 0 || norm.woundEdges.edgeDetails) {
    const edgesText = norm.woundEdges.characteristics.join(', ');
    const edgeDet = norm.woundEdges.edgeDetails ? ` (${norm.woundEdges.edgeDetails})` : '';
    facts.woundEdges = [
      {
        id: 'FACT-WOUND-009',
        category: 'woundEdges',
        sourceField: 'woundEdges',
        value: norm.woundEdges,
        canonicalText: `Bordas da lesão: ${edgesText}${edgeDet}.`,
      },
    ];
  }

  // FACT-WOUND-010: Pele perilesional
  if (norm.perilesionalSkin.characteristics.length > 0 || norm.perilesionalSkin.skinDetails) {
    const skinText = norm.perilesionalSkin.characteristics.join(', ');
    const skinDet = norm.perilesionalSkin.skinDetails ? ` (${norm.perilesionalSkin.skinDetails})` : '';
    facts.perilesionalSkin = [
      {
        id: 'FACT-WOUND-010',
        category: 'perilesionalSkin',
        sourceField: 'perilesionalSkin',
        value: norm.perilesionalSkin,
        canonicalText: `Pele perilesional: ${skinText}${skinDet}.`,
      },
    ];
  }

  // FACT-WOUND-011: Exsudato
  if (norm.exudate.present) {
    if (norm.exudate.present === 'Sim') {
      const typePart = norm.exudate.type ? `tipo ${norm.exudate.type}` : 'tipo não especificado';
      const amtPart = norm.exudate.amount ? `quantidade ${norm.exudate.amount}` : '';
      const detPart = norm.exudate.exudateDetails ? ` (${norm.exudate.exudateDetails})` : '';
      facts.exudate = [
        {
          id: 'FACT-WOUND-011',
          category: 'exudate',
          sourceField: 'exudate',
          value: norm.exudate,
          canonicalText: `Exsudato presente: ${typePart}, em ${amtPart}${detPart}.`,
        },
      ];
    } else {
      facts.exudate = [
        {
          id: 'FACT-WOUND-011',
          category: 'exudate',
          sourceField: 'exudate',
          value: norm.exudate,
          canonicalText: 'Exsudato: ausente.',
        },
      ];
    }
  }

  // FACT-WOUND-012: Odor
  if (norm.odor.present) {
    const odorText =
      norm.odor.present === 'presente'
        ? `Odor: presente${norm.odor.odorDetails ? ` (${norm.odor.odorDetails})` : ''}.`
        : 'Odor: ausente.';
    facts.odor = [
      {
        id: 'FACT-WOUND-012',
        category: 'odor',
        sourceField: 'odor',
        value: norm.odor,
        canonicalText: odorText,
      },
    ];
  }

  // FACT-WOUND-013: Dor relacionada
  if (norm.woundPain.hasPain) {
    if (norm.woundPain.hasPain === 'Sim') {
      const scaleText = norm.woundPain.painScale ? `escala ${norm.woundPain.painScale}` : 'escala não especificada';
      const scoreText = norm.woundPain.painScore ? `escore ${norm.woundPain.painScore}` : '';
      const detText = norm.woundPain.painDetails ? ` (${norm.woundPain.painDetails})` : '';
      facts.woundPain = [
        {
          id: 'FACT-WOUND-013',
          category: 'woundPain',
          sourceField: 'woundPain',
          value: norm.woundPain,
          canonicalText: `Dor relacionada à lesão referida: presente, ${scaleText}, ${scoreText}${detText}.`,
        },
      ];
    } else if (norm.woundPain.hasPain === 'Não avaliável') {
      facts.woundPain = [
        {
          id: 'FACT-WOUND-013',
          category: 'woundPain',
          sourceField: 'woundPain',
          value: norm.woundPain,
          canonicalText: 'Dor relacionada: não avaliável.',
        },
      ];
    } else {
      facts.woundPain = [
        {
          id: 'FACT-WOUND-013',
          category: 'woundPain',
          sourceField: 'woundPain',
          value: norm.woundPain,
          canonicalText: 'Dor relacionada: nega queixas álgicas na lesão.',
        },
      ];
    }
  }

  // FACT-WOUND-014: Classificação / Estadiamento informado (exclusivo do enfermeiro)
  if (norm.staging.stage && norm.staging.stage !== 'não informado') {
    const notesPart = norm.staging.stagingNotes ? ` (${norm.staging.stagingNotes})` : '';
    facts.staging = [
      {
        id: 'FACT-WOUND-014',
        category: 'staging',
        sourceField: 'staging',
        value: norm.staging,
        canonicalText: `Classificação/estadiamento registrado pelo enfermeiro: ${norm.staging.stage}${notesPart}.`,
      },
    ];
  }

  // FACT-WOUND-015: Túneis e descolamentos
  if (norm.tunneling.present && norm.tunneling.present !== 'Não') {
    if (norm.tunneling.present === 'Sim') {
      const posPart = norm.tunneling.clockPosition ? `posição: ${norm.tunneling.clockPosition}` : '';
      const depthPart = norm.tunneling.depthCm ? `extensão: ${norm.tunneling.depthCm} cm` : '';
      const detPart = norm.tunneling.details ? ` (${norm.tunneling.details})` : '';
      facts.tunneling = [
        {
          id: 'FACT-WOUND-015',
          category: 'tunneling',
          sourceField: 'tunneling',
          value: norm.tunneling,
          canonicalText: `Túneis/descolamentos: presentes, ${posPart} ${depthPart}${detPart}.`.trim(),
        },
      ];
    }
  } else if (norm.tunneling.present === 'Não') {
    facts.tunneling = [
      {
        id: 'FACT-WOUND-015',
        category: 'tunneling',
        sourceField: 'tunneling',
        value: norm.tunneling,
        canonicalText: 'Túneis e descolamentos: ausentes.',
      },
    ];
  }

  // FACT-WOUND-016: Sinais observados
  if (norm.observedSigns.signs.length > 0 || norm.observedSigns.signsDetails) {
    const sText = norm.observedSigns.signs.join(', ');
    const sDet = norm.observedSigns.signsDetails ? ` (${norm.observedSigns.signsDetails})` : '';
    facts.observedSigns = [
      {
        id: 'FACT-WOUND-016',
        category: 'observedSigns',
        sourceField: 'observedSigns',
        value: norm.observedSigns,
        canonicalText: `Sinais clínicos observados no sítio da lesão: ${sText}${sDet}.`,
      },
    ];
  }

  // FACT-WOUND-017: Dispositivos relacionados
  if (norm.relatedDevices.hasRelatedDevices === 'Sim' && norm.relatedDevices.devices.length > 0) {
    const devDescs = norm.relatedDevices.devices.map(
      (d) => `${d.deviceType} em ${d.anatomicalSite} (${d.condition})`
    );
    facts.relatedDevices = [
      {
        id: 'FACT-WOUND-017',
        category: 'relatedDevices',
        sourceField: 'relatedDevices',
        value: norm.relatedDevices,
        canonicalText: `Dispositivos associados/próximos à lesão: ${devDescs.join('; ')}.`,
      },
    ];
  }

  // FACT-WOUND-018: Cobertura atual encontrada
  if (norm.currentCovering.coveringFound) {
    facts.currentCovering = [
      {
        id: 'FACT-WOUND-018',
        category: 'currentCovering',
        sourceField: 'currentCovering',
        value: norm.currentCovering,
        canonicalText: `Cobertura prévia encontrada na inspeção: ${norm.currentCovering.coveringFound}.`,
      },
    ];
  }

  // FACT-WOUND-019: Curativo realizado
  if (norm.dressingProcedure.performed) {
    if (norm.dressingProcedure.performed === 'Sim') {
      const parts: string[] = [];
      if (norm.dressingProcedure.techniqueType) parts.push(`técnica ${norm.dressingProcedure.techniqueType}`);
      if (norm.dressingProcedure.cleansingSolution) parts.push(`limpeza com ${norm.dressingProcedure.cleansingSolution}`);
      if (norm.dressingProcedure.cleansingTechnique) parts.push(`por ${norm.dressingProcedure.cleansingTechnique}`);
      if (norm.dressingProcedure.primaryDressing) parts.push(`cobertura primária: ${norm.dressingProcedure.primaryDressing}`);
      if (norm.dressingProcedure.secondaryDressing) parts.push(`cobertura secundária: ${norm.dressingProcedure.secondaryDressing}`);
      if (norm.dressingProcedure.fixation) parts.push(`fixação com ${norm.dressingProcedure.fixation}`);

      facts.dressingProcedure = [
        {
          id: 'FACT-WOUND-019',
          category: 'dressingProcedure',
          sourceField: 'dressingProcedure',
          value: norm.dressingProcedure,
          canonicalText: `Curativo realizado: Sim (${parts.join(', ')}).`,
        },
      ];
    } else {
      facts.dressingProcedure = [
        {
          id: 'FACT-WOUND-019',
          category: 'dressingProcedure',
          sourceField: 'dressingProcedure',
          value: norm.dressingProcedure,
          canonicalText: 'Curativo realizado: Não realizado neste momento assistencial.',
        },
      ];
    }
  }

  // FACT-WOUND-020: Produtos utilizados
  if (norm.productsUsed.products.length > 0 || norm.productsUsed.productDetails) {
    const prodList = norm.productsUsed.products.join(', ');
    const detList = norm.productsUsed.productDetails ? ` (${norm.productsUsed.productDetails})` : '';
    facts.productsUsed = [
      {
        id: 'FACT-WOUND-020',
        category: 'productsUsed',
        sourceField: 'productsUsed',
        value: norm.productsUsed,
        canonicalText: `Produtos e coberturas terapêuticas aplicados: ${prodList}${detList}.`,
      },
    ];
  }

  // FACT-WOUND-021: Resposta observada
  if (norm.observedResponse.patientTolerance || norm.observedResponse.immediateOutcome) {
    const tol = norm.observedResponse.patientTolerance ? `Tolerância do paciente: ${norm.observedResponse.patientTolerance}` : '';
    const out = norm.observedResponse.immediateOutcome ? `desfecho imediato: ${norm.observedResponse.immediateOutcome}` : '';
    facts.observedResponse = [
      {
        id: 'FACT-WOUND-021',
        category: 'observedResponse',
        sourceField: 'observedResponse',
        value: norm.observedResponse,
        canonicalText: `Resposta observada ao procedimento: ${[tol, out].filter(Boolean).join(', ')}.`,
      },
    ];
  }

  // FACT-WOUND-022: Comparação com avaliação anterior
  if (norm.previousComparison.comparison) {
    const det = norm.previousComparison.comparisonNotes ? ` (${norm.previousComparison.comparisonNotes})` : '';
    facts.previousComparison = [
      {
        id: 'FACT-WOUND-022',
        category: 'previousComparison',
        sourceField: 'previousComparison',
        value: norm.previousComparison,
        canonicalText: `Comparação evolutiva da lesão: ${norm.previousComparison.comparison}${det}.`,
      },
    ];
  }

  // FACT-WOUND-023: Conduta registrada pelo enfermeiro
  if (
    norm.nurseConduct.dressingFrequency ||
    norm.nurseConduct.guidance ||
    norm.nurseConduct.referrals
  ) {
    const parts: string[] = [];
    if (norm.nurseConduct.dressingFrequency) parts.push(`frequência programada de troca: ${norm.nurseConduct.dressingFrequency}`);
    if (norm.nurseConduct.guidance) parts.push(`orientações prestadas: ${norm.nurseConduct.guidance}`);
    if (norm.nurseConduct.referrals) parts.push(`encaminhamentos: ${norm.nurseConduct.referrals}`);

    facts.nurseConduct = [
      {
        id: 'FACT-WOUND-023',
        category: 'nurseConduct',
        sourceField: 'nurseConduct',
        value: norm.nurseConduct,
        canonicalText: `Conduta de enfermagem registrada: ${parts.join('; ')}.`,
      },
    ];
  }

  // FACT-WOUND-024: Informações adicionais
  if (norm.additionalInfo.notes) {
    facts.additionalInfo = [
      {
        id: 'FACT-WOUND-024',
        category: 'additionalInfo',
        sourceField: 'additionalInfo',
        value: norm.additionalInfo.notes,
        canonicalText: `Observações adicionais de enfermagem: ${norm.additionalInfo.notes}.`,
      },
    ];
  }

  // Cross-category mapping for unified engine and verification compatibility
  if (facts.relatedDevices) {
    facts.devices = facts.relatedDevices;
  }
  facts.care = [
    ...(facts.dressingProcedure || []),
    ...(facts.nurseConduct || []),
    ...(facts.currentCovering || []),
  ];

  return facts;
}

/**
 * Consistency validator enforcing clinical logic WOUND-CONS-001 through WOUND-CONS-008.
 */
export function validateNurseWoundsConsistency(
  form: NurseWoundsAssessmentForm
): { valid: boolean; errors: string[]; warnings: string[] } {
  const norm = normalizeNurseWoundsAssessmentForm(form);
  const errors: string[] = [];
  const warnings: string[] = [];

  // WOUND-CONS-001: Localização anatômica obrigatória
  const hasWoundType = Boolean(norm.woundIdentification.woundType);
  const hasRegion = Boolean(norm.anatomicalLocation.region);
  if (hasWoundType && !hasRegion) {
    errors.push('WOUND-CONS-001: Localização anatômica da lesão é obrigatória quando há lesão informada.');
  }

  // WOUND-CONS-002: Medidas devem ser numéricas e positivas
  if (norm.woundMeasurements.lengthCm) {
    const parsedLength = parseFloat(norm.woundMeasurements.lengthCm.replace(',', '.'));
    if (isNaN(parsedLength) || parsedLength <= 0) {
      errors.push('WOUND-CONS-002: Comprimento da lesão deve ser um valor positivo numérico.');
    }
  }
  if (norm.woundMeasurements.widthCm) {
    const parsedWidth = parseFloat(norm.woundMeasurements.widthCm.replace(',', '.'));
    if (isNaN(parsedWidth) || parsedWidth <= 0) {
      errors.push('WOUND-CONS-002: Largura da lesão deve ser um valor positivo numérico.');
    }
  }
  if (norm.woundMeasurements.depthCm) {
    const parsedDepth = parseFloat(norm.woundMeasurements.depthCm.replace(',', '.'));
    if (isNaN(parsedDepth) || parsedDepth <= 0) {
      errors.push('WOUND-CONS-002: Profundidade da lesão deve ser um valor positivo numérico.');
    }
  }

  // WOUND-CONS-003: Exsudato marcado como "Sim" sem tipo especificado
  if (norm.exudate.present === 'Sim' && (!norm.exudate.type || norm.exudate.type.trim() === '')) {
    errors.push('WOUND-CONS-003: Exsudato marcado como presente, porém o tipo de exsudato deve ser especificado.');
  }

  // WOUND-CONS-004: Dor presente sem escore
  if (norm.woundPain.hasPain === 'Sim' && (!norm.woundPain.painScore || norm.woundPain.painScore.trim() === '')) {
    warnings.push('WOUND-CONS-004: Dor relacionada indicada como presente sem escore numérico registrado.');
  }

  // WOUND-CONS-005: Curativo realizado sem solução de limpeza
  const dressingPerformed = norm.dressingProcedure.performed === 'Sim';
  if (dressingPerformed && (!norm.dressingProcedure.cleansingSolution || norm.dressingProcedure.cleansingSolution.trim() === '')) {
    errors.push('WOUND-CONS-005: Curativo realizado sem especificação da solução de limpeza.');
  }

  // WOUND-CONS-006: Leito sem nenhum tecido selecionado
  if (norm.woundBed.tissues.length === 0) {
    errors.push('WOUND-CONS-006: Pelo menos um tipo de tecido deve ser selecionado no leito da lesão.');
  }

  // WOUND-CONS-007: Túneis marcados como "Sim" sem posição ou profundidade
  if (
    norm.tunneling.present === 'Sim' &&
    (!norm.tunneling.clockPosition || norm.tunneling.clockPosition.trim() === '') &&
    (!norm.tunneling.depthCm || norm.tunneling.depthCm.trim() === '')
  ) {
    warnings.push('WOUND-CONS-007: Túneis ou descolamentos indicados sem posição ou extensão/profundidade registradas.');
  }

  // WOUND-CONS-008: Dispositivos relacionados "Sim" sem nenhum dispositivo adicionado
  if (norm.relatedDevices.hasRelatedDevices === 'Sim' && norm.relatedDevices.devices.length === 0) {
    errors.push('WOUND-CONS-008: Dispositivos relacionados indicados como presentes, porém nenhum dispositivo foi inserido.');
  }

  // Medida sem unidade
  const hasLength = Boolean(norm.woundMeasurements.lengthCm);
  const hasWidth = Boolean(norm.woundMeasurements.widthCm);
  const hasDepth = Boolean(norm.woundMeasurements.depthCm);
  if (hasLength || hasWidth || hasDepth) {
    if (!norm.woundMeasurements.measurementUnit || norm.woundMeasurements.measurementUnit.trim() !== 'cm') {
      errors.push('WOUND-CONS-UNIT: Medida de lesão informada sem unidade válida ("cm").');
    }
  }

  // Curativo informado sem realização
  const hasDressingDetails = Boolean(
    norm.dressingProcedure.cleansingSolution ||
    norm.dressingProcedure.cleansingTechnique ||
    norm.dressingProcedure.techniqueType ||
    norm.dressingProcedure.primaryDressing ||
    norm.dressingProcedure.secondaryDressing ||
    norm.dressingProcedure.fixation
  );
  if (!dressingPerformed && hasDressingDetails) {
    errors.push('WOUND-CONS-PROC: Detalhes de curativo informados com status de procedimento não realizado.');
  }

  // Produto informado sem curativo
  const hasProducts =
    norm.productsUsed.products.length > 0 || Boolean(norm.productsUsed.productDetails);
  if (!dressingPerformed && hasProducts) {
    errors.push('WOUND-CONS-PROD: Produtos para curativo informados sem a realização do procedimento.');
  }

  // Estágio informado sem tipo de lesão compatível
  const stagingValue = norm.staging.stage;
  const isStaged =
    stagingValue &&
    stagingValue !== 'não informado' &&
    [
      'estágio 1',
      'estágio 2',
      'estágio 3',
      'estágio 4',
      'não classificável',
      'lesão tissular profunda',
    ].includes(stagingValue);

  if (isStaged && norm.woundIdentification.woundType !== 'lesão por pressão') {
    errors.push(
      'WOUND-CONS-STAGE: Estadiamento NPUAP informado para tipo de lesão incompatível (classificação exclusiva para lesão por pressão).'
    );
  }

  // Comparação sem avaliação anterior
  const isInitialEvaluation = norm.evaluationType.type === 'avaliação inicial';
  const hasEvolutionaryComparison =
    Boolean(norm.previousComparison.comparison) &&
    norm.previousComparison.comparison !== 'primeira avaliação' &&
    norm.previousComparison.comparison !== 'não aplicável' &&
    norm.previousComparison.comparison !== '';

  if (isInitialEvaluation && hasEvolutionaryComparison) {
    errors.push(
      'WOUND-CONS-COMP: Comparação evolutiva preenchida indevidamente em contexto de avaliação inicial.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Narrative Auditor verifying every paragraph traces back to AuthorizedClinicalFacts.
 */
export function auditNurseWoundsNarrative(
  narrativeText: string,
  authorizedFacts: AuthorizedClinicalFacts
): { passed: boolean; untraceableSegments: string[] } {
  if (!narrativeText || narrativeText.trim() === '') {
    return { passed: true, untraceableSegments: [] };
  }

  // Extract all canonical phrases from authorized facts
  const canonicalPhrases: string[] = [];
  for (const [, category] of Object.entries(authorizedFacts)) {
    if (Array.isArray(category)) {
      for (const fact of category) {
        if (fact.canonicalText) {
          canonicalPhrases.push(
            fact.canonicalText
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          );
        }
      }
    }
  }

  const sentences = narrativeText
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const untraceableSegments: string[] = [];

  for (const sentence of sentences) {
    const normSentence = sentence
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Check if the sentence has correspondence with any canonical text
    const hasTrace = canonicalPhrases.some((phrase) => {
      // Check partial token overlap
      const tokens = normSentence.split(/\W+/).filter((w) => w.length > 3);
      if (tokens.length === 0) return true;
      const matchingTokens = tokens.filter((t) => phrase.includes(t));
      return matchingTokens.length / tokens.length >= 0.6;
    });

    if (!hasTrace) {
      untraceableSegments.push(sentence);
    }
  }

  return {
    passed: untraceableSegments.length === 0,
    untraceableSegments,
  };
}
