export type WoundEvaluationType =
  | 'avaliação inicial'
  | 'reavaliação'
  | 'acompanhamento evolutivo'
  | string;

export type WoundType =
  | 'lesão por pressão'
  | 'ferida cirúrgica'
  | 'traumática'
  | 'vascular'
  | 'pé diabético'
  | 'queimadura'
  | 'outra'
  | string;

export type WoundRegion =
  | 'sacral'
  | 'calcâneo'
  | 'membros'
  | 'tronco'
  | 'cabeça'
  | 'outro'
  | string;

export type WoundLaterality =
  | 'direito'
  | 'esquerdo'
  | 'bilateral'
  | 'não informado'
  | string;

export type WoundExudateAmount =
  | 'ausente'
  | 'pequena'
  | 'moderada'
  | 'grande'
  | string;

export type WoundExudateType =
  | 'seroso'
  | 'sanguinolento'
  | 'serossanguinolento'
  | 'outro'
  | string;

export type WoundStaging =
  | 'estágio 1'
  | 'estágio 2'
  | 'estágio 3'
  | 'estágio 4'
  | 'não classificável'
  | 'lesão tissular profunda'
  | 'não informado'
  | string;

export interface RelatedDeviceItem {
  deviceType: string;
  anatomicalSite: string;
  condition: string;
}

export interface NurseWoundsAssessmentForm {
  // 1. Contexto da avaliação
  evaluationContext: {
    evaluationDate?: string;
    evaluationTime?: string;
    bedLocation?: string;
    clinicalUnit?: string;
  };

  // 2. Tipo de avaliação
  evaluationType: {
    type: WoundEvaluationType;
    typeDetails?: string;
  };

  // 3. Identificação da lesão
  woundIdentification: {
    woundType: WoundType;
    woundTypeOther?: string;
    woundNumber?: string;
  };

  // 4. Localização anatômica
  anatomicalLocation: {
    region: WoundRegion;
    regionDetails?: string;
  };

  // 5. Lateralidade
  laterality: {
    side: WoundLaterality;
  };

  // 6. Tempo de existência informado
  reportedDuration: {
    durationText: string;
  };

  // 7. Origem informada
  reportedOrigin: {
    origin: string;
    originDetails?: string;
  };

  // 8. Medidas da lesão
  woundMeasurements: {
    lengthCm: string;
    widthCm: string;
    depthCm: string;
    measurementUnit: string; // 'cm'
  };

  // 9. Características do leito
  woundBed: {
    tissues: string[]; // 'granulação', 'esfacelo', 'necrose', 'epitelização', 'outro'
    otherTissueDetails?: string;
    tissuePercentages?: {
      granulation?: string;
      slough?: string;
      necrosis?: string;
      epithelialization?: string;
    };
  };

  // 10. Bordas
  woundEdges: {
    characteristics: string[]; // 'íntegras', 'maceradas', 'hiperemiadas', 'ressecadas', 'outro'
    edgeDetails?: string;
  };

  // 11. Pele ao redor
  perilesionalSkin: {
    characteristics: string[]; // 'íntegra', 'hiperemia', 'edema', 'maceração', 'ressecamento', 'alteração observada'
    skinDetails?: string;
  };

  // 12. Exsudato
  exudate: {
    present: 'Sim' | 'Não' | string;
    type?: WoundExudateType;
    amount?: WoundExudateAmount;
    exudateDetails?: string;
  };

  // 13. Odor
  odor: {
    present: 'ausente' | 'presente' | string;
    odorDetails?: string;
  };

  // 14. Dor relacionada
  woundPain: {
    hasPain: 'Sim' | 'Não' | 'Não avaliável' | string;
    painScale?: 'numérica' | 'outra' | 'nenhuma' | string;
    painScore?: string;
    painDetails?: string;
  };

  // 15. Classificação/estadiamento informado
  staging: {
    stage: WoundStaging;
    stagingNotes?: string;
  };

  // 16. Túneis e descolamentos
  tunneling: {
    present: 'Sim' | 'Não' | 'Não avaliado' | string;
    clockPosition?: string;
    depthCm?: string;
    details?: string;
  };

  // 17. Sinais observados
  observedSigns: {
    signs: string[]; // calor local, hiperemia perilesional, sangramento ao toque, nenhum sinal flogístico
    signsDetails?: string;
  };

  // 18. Dispositivos relacionados
  relatedDevices: {
    hasRelatedDevices: 'Sim' | 'Não' | string;
    devices: RelatedDeviceItem[];
  };

  // 19. Cobertura atual
  currentCovering: {
    coveringFound: string;
  };

  // 20. Curativo realizado
  dressingProcedure: {
    performed: 'Sim' | 'Não' | string;
    cleansingSolution?: string;
    cleansingTechnique?: string;
    techniqueType?: 'estéril' | 'limpa' | string;
    primaryDressing?: string;
    secondaryDressing?: string;
    fixation?: string;
  };

  // 21. Produtos utilizados
  productsUsed: {
    products: string[];
    productDetails?: string;
  };

  // 22. Resposta observada
  observedResponse: {
    patientTolerance: string;
    immediateOutcome?: string;
  };

  // 23. Comparação com avaliação anterior
  previousComparison: {
    comparison:
      | 'primeira avaliação'
      | 'estável / sem alterações'
      | 'melhora observada'
      | 'regressão / piora observada'
      | 'não aplicável'
      | string;
    comparisonNotes?: string;
  };

  // 24. Conduta registrada pelo enfermeiro
  nurseConduct: {
    dressingFrequency: string;
    guidance?: string;
    referrals?: string;
  };

  // 25. Informações adicionais
  additionalInfo: {
    notes?: string;
  };
}

export function createInitialNurseWoundsAssessmentForm(): NurseWoundsAssessmentForm {
  return {
    evaluationContext: {
      evaluationDate: '',
      evaluationTime: '',
      bedLocation: '',
      clinicalUnit: '',
    },
    evaluationType: {
      type: '',
      typeDetails: '',
    },
    woundIdentification: {
      woundType: '',
      woundTypeOther: '',
      woundNumber: '',
    },
    anatomicalLocation: {
      region: '',
      regionDetails: '',
    },
    laterality: {
      side: '',
    },
    reportedDuration: {
      durationText: '',
    },
    reportedOrigin: {
      origin: '',
      originDetails: '',
    },
    woundMeasurements: {
      lengthCm: '',
      widthCm: '',
      depthCm: '',
      measurementUnit: 'cm',
    },
    woundBed: {
      tissues: [],
      otherTissueDetails: '',
      tissuePercentages: {},
    },
    woundEdges: {
      characteristics: [],
      edgeDetails: '',
    },
    perilesionalSkin: {
      characteristics: [],
      skinDetails: '',
    },
    exudate: {
      present: 'Não',
      type: '',
      amount: '',
      exudateDetails: '',
    },
    odor: {
      present: 'ausente',
      odorDetails: '',
    },
    woundPain: {
      hasPain: 'Não',
      painScale: '',
      painScore: '',
      painDetails: '',
    },
    staging: {
      stage: 'não informado',
      stagingNotes: '',
    },
    tunneling: {
      present: 'Não',
      clockPosition: '',
      depthCm: '',
      details: '',
    },
    observedSigns: {
      signs: [],
      signsDetails: '',
    },
    relatedDevices: {
      hasRelatedDevices: 'Não',
      devices: [],
    },
    currentCovering: {
      coveringFound: '',
    },
    dressingProcedure: {
      performed: 'Não',
      cleansingSolution: '',
      cleansingTechnique: '',
      techniqueType: '',
      primaryDressing: '',
      secondaryDressing: '',
      fixation: '',
    },
    productsUsed: {
      products: [],
      productDetails: '',
    },
    observedResponse: {
      patientTolerance: '',
      immediateOutcome: '',
    },
    previousComparison: {
      comparison: '',
      comparisonNotes: '',
    },
    nurseConduct: {
      dressingFrequency: '',
      guidance: '',
      referrals: '',
    },
    additionalInfo: {
      notes: '',
    },
  };
}
