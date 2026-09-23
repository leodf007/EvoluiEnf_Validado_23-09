export type SectionStatus = 'not_started' | 'in_progress' | 'completed';

export interface VasoactiveDrugItem {
  id: string;
  medication: string;
  concentration?: string;
  infusionRate: string;
  unit: string;
  observations?: string;
}

export interface SedationAnalgesiaItem {
  id: string;
  medication: string;
  concentration?: string;
  rateOrDose: string;
  unit: string;
  purpose: 'Sedação' | 'Analgesia' | 'Outra' | '';
  observations?: string;
}

export interface InvasiveDeviceItem {
  id: string;
  type: 'AVP' | 'CVC' | 'PAI' | 'CDL' | 'PICC' | 'SVD' | 'SNE' | 'SNG' | 'GTT' | 'Dreno' | 'Outro' | string;
  customType?: string;
  location: string;
  insertionDate?: string;
  permeability: 'Pérvio' | 'Não pérvio' | 'Não avaliado' | '';
  functioning: 'Funcionante' | 'Alterado' | 'Não avaliado' | '';
  dressingClean: boolean;
  dressingDry: boolean;
  dressingIntact: boolean;
  dressingStatus?: 'Alterado' | 'Não avaliado' | '';
  dressingAlterationDetails?: string;
  phlogisticSigns: 'Ausentes' | 'Presentes' | 'Não avaliados' | '';
  phlogisticSignsDetails?: string;
  drainAspect?: string;
  observations?: string;
}

export interface ClinicalEvolutionForm {
  // 1. Contexto do registro
  context: {
    moment: 'Recebo paciente' | 'Avalio paciente' | '';
    location: 'Leito' | 'Box' | 'Sala Vermelha' | 'Observação' | 'Outro' | '';
    locationCustom?: string;
    accompaniment:
      | 'Desacompanhado'
      | 'Familiar'
      | 'Responsável'
      | 'Cuidador'
      | 'Equipe'
      | 'Outro'
      | 'Não informado'
      | '';
    accompanimentCustom?: string;
    wristbandChecked: 'Sim' | 'Não' | 'Não se aplica' | 'Não informado' | '';
    bedSignChecked: 'Sim' | 'Não' | 'Não se aplica' | 'Não informado' | '';
    allergies: 'Não referidas' | 'Sim' | 'Não informado' | '';
    allergiesDetails?: string;
    precaution:
      | 'Padrão'
      | 'Contato'
      | 'Gotículas'
      | 'Aerossóis'
      | 'Outra'
      | 'Não informado'
      | '';
    precautionCustom?: string;
    admissionReason?: string;
    relevantComorbidities?: string;
  };

  // 2. Avaliação geral
  generalAssessment: {
    generalState: 'Bom' | 'Regular' | 'Mau' | 'Não informado' | '';
    behavior: string[];
    behaviorCustom?: string;
    complaints:
      | 'Sem queixas no momento'
      | 'Com queixa'
      | 'Impossibilitado de informar'
      | 'Não avaliado'
      | 'Não informado'
      | '';
    complaintsDetails?: string;
    hygiene:
      | 'Preservada'
      | 'Necessita cuidados'
      | 'Higiene realizada no período'
      | 'Não avaliada'
      | 'Não informado'
      | '';
    mobility:
      | 'Deambula sem auxílio'
      | 'Deambula com auxílio'
      | 'Cadeira de rodas'
      | 'Em maca'
      | 'Restrito ao leito'
      | 'Outro'
      | 'Não avaliada'
      | '';
    mobilityCustom?: string;
  };

  // 3. Sinais vitais e dor
  vitalSigns: {
    systolicBP?: string;
    diastolicBP?: string;
    meanArterialPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    temperature?: string;
  };

  pain: {
    assessmentType:
      | 'Escala numérica 0–10'
      | 'Outra escala'
      | 'Não avaliável'
      | 'Não avaliada'
      | 'Não informado'
      | '';
    numericScaleValue?: number;
    otherScaleName?: string;
    otherScaleResult?: string;
    location?: string;
    characteristics?: string;
  };

  // 4. Neurológico
  neurological: {
    consciousnessLevel:
      | 'Consciente'
      | 'Sonolento'
      | 'Torporoso'
      | 'Comatoso'
      | 'Sedado'
      | 'Outro'
      | 'Não avaliado'
      | '';
    consciousnessCustom?: string;
    orientation:
      | 'Orientado em tempo e espaço'
      | 'Parcialmente orientado'
      | 'Desorientado'
      | 'Não avaliável'
      | 'Não avaliado'
      | '';
    glasgowType: 'score' | 'not_applied' | 'not_assessed' | '';
    glasgowScore?: number;
    rassType: 'score' | 'not_applied' | 'not_assessed' | '';
    rassScore?: number;
    pupils:
      | 'Isocóricas'
      | 'Anisocóricas'
      | 'Mióticas'
      | 'Midriáticas'
      | 'Outra alteração'
      | 'Não avaliadas'
      | '';
    pupilsCustom?: string;
    photoreaction:
      | 'Fotorreagentes'
      | 'Fotorreatividade lentificada'
      | 'Não reagentes'
      | 'Outra'
      | 'Não avaliada'
      | '';
    photoreactionCustom?: string;
    identifiedNeurologicalAlteration: 'Não' | 'Sim' | 'Não avaliado' | '';
    neurologicalAlterationDetails?: string;
  };

  // 5. Respiratório
  respiratory: {
    respiratorySupport:
      | 'Ar ambiente'
      | 'Oxigenoterapia'
      | 'Ventilação não invasiva'
      | 'Ventilação mecânica invasiva'
      | 'Outro'
      | 'Não informado'
      | '';
    supportCustom?: string;
    oxygenDevice?:
      | 'Cateter nasal'
      | 'Máscara simples'
      | 'Máscara de Venturi'
      | 'Máscara com reservatório'
      | 'Cateter nasal de alto fluxo'
      | 'Outro'
      | '';
    oxygenDeviceCustom?: string;
    oxygenFlowRate?: string;
    oxygenFiO2?: string;
    // VNI
    vniInterface?: string;
    vniFiO2?: string;
    vniPeepEpap?: string;
    vniIpapPinsp?: string;
    vniOtherParams?: string;
    vniObservations?: string;
    // VMI
    vmiAirway?: 'TOT' | 'Traqueostomia' | 'Outro' | '';
    vmiAirwayCustom?: string;
    vmiCaliber?: string;
    vmiVentilatoryMode?: string;
    vmiPeep?: string;
    vmiFiO2?: string;
    vmiProgrammedRR?: string;
    vmiTidalVolume?: string;
    vmiSupportPressure?: string;
    vmiOtherParams?: string;
    // Padrão e sintomas
    respiratoryPattern:
      | 'Eupneico'
      | 'Taquipneico'
      | 'Bradipneico'
      | 'Outro'
      | 'Não avaliado'
      | '';
    respiratoryPatternCustom?: string;
    respiratoryDistress: 'Ausente' | 'Presente' | 'Não avaliado' | '';
    respiratoryDistressDetails?: string;
    accessoryMuscles: 'Ausente' | 'Presente' | 'Não avaliado' | '';
    secretion: 'Ausente' | 'Presente' | 'Não avaliada' | '';
    secretionQuantity?: string;
    secretionAspect?: string;
    secretionColor?: string;
    secretionConsistency?: string;
    secretionObservations?: string;
    breathSounds:
      | 'Presente bilateralmente'
      | 'Diminuído'
      | 'Ausente em região específica'
      | 'Outra alteração'
      | 'Não avaliado'
      | '';
    breathSoundsLocation?: string;
    adventitiousSounds: string[];
  };

  // 6. Cardiovascular e hemodinâmico
  cardiovascular: {
    hemodynamicCondition:
      | 'Estável'
      | 'Instável'
      | 'Não avaliada'
      | 'Não informado'
      | '';
    heartRateClassification?:
      | 'Normocárdico'
      | 'Taquicárdico'
      | 'Bradicárdico'
      | 'Outra'
      | 'Não classificar'
      | '';
    bloodPressureClassification?:
      | 'Normotenso'
      | 'Hipertenso'
      | 'Hipotenso'
      | 'Outra'
      | 'Não classificar'
      | '';
    peripheralPerfusion: 'Adequada' | 'Reduzida' | 'Não avaliada' | '';
    extremities: 'Quentes' | 'Frias' | 'Outra' | 'Não avaliadas' | '';
    extremitiesCustom?: string;
    capillaryRefillTime:
      | 'Menor que 3 segundos'
      | 'Maior ou igual a 3 segundos'
      | 'Informar valor'
      | 'Não avaliado'
      | '';
    capillaryRefillTimeValue?: string;
    edema: 'Ausente' | 'Presente' | 'Não avaliado' | '';
    edemaLocations: string[];
    edemaLocationCustom?: string;
    edemaIntensity?: '1+/4+' | '2+/4+' | '3+/4+' | '4+/4+' | 'Não graduado' | '';
  };

  // 7. Drogas vasoativas e Sedação/Analgesia
  vasoactiveDrugs: {
    inUse: 'Não' | 'Sim' | 'Não informado' | '';
    drugsList: VasoactiveDrugItem[];
  };

  sedationAnalgesia: {
    inUse: 'Não' | 'Sim' | 'Não informado' | '';
    medicationsList: SedationAnalgesiaItem[];
  };

  // 8. Gastrointestinal e nutrição
  gastrointestinal: {
    abdominalShape:
      | 'Plano'
      | 'Globoso'
      | 'Distendido'
      | 'Ascítico'
      | 'Outro'
      | 'Não avaliado'
      | '';
    abdominalShapeCustom?: string;
    consistency: 'Flácido' | 'Tenso' | 'Outro' | 'Não avaliado' | '';
    consistencyCustom?: string;
    palpation: 'Indolor' | 'Doloroso' | 'Não realizada' | '';
    palpationLocation?: string;
    palpationType?: 'Superficial' | 'Profunda' | 'Superficial e profunda' | '';
    palpationObservations?: string;
    bowelSounds:
      | 'Presentes/normoativos'
      | 'Hipoativos'
      | 'Hiperativos'
      | 'Ausentes'
      | 'Não avaliados'
      | '';
  };

  nutrition: {
    status:
      | 'Dieta por via oral'
      | 'Dieta enteral'
      | 'Jejum'
      | 'Dieta parenteral'
      | 'Outra'
      | 'Não informado'
      | '';
    statusCustom?: string;
    oralAcceptance?:
      | 'Boa'
      | 'Moderada'
      | 'Baixa'
      | 'Recusou'
      | 'Não avaliada'
      | '';
    enteralDevice?: 'SNE' | 'SNG' | 'GTT' | 'Outro' | '';
    enteralDeviceCustom?: string;
    enteralRate?: string;
    enteralTolerance?: 'Boa' | 'Alterada' | 'Não avaliada' | '';
    enteralToleranceDetails?: string;
    nausea: 'Ausentes' | 'Presentes' | 'Não avaliadas' | '';
    vomiting: 'Ausentes' | 'Presentes' | 'Não avaliados' | '';
    vomitingDetails?: string;
  };

  // 9. Eliminações intestinais
  bowelElimination: {
    bowelMovement: 'Presente' | 'Ausente' | 'Não avaliada' | 'Não informado' | '';
    aspect?: 'Formada' | 'Pastosa' | 'Líquida' | 'Diarreica' | 'Outro' | 'Não avaliado' | '';
    aspectCustom?: string;
    frequencyOrQuantity?: string;
    ostomy: 'Não' | 'Sim' | 'Não avaliada' | '';
    ostomyType?: string;
    ostomyContentAspect?: string;
    ostomyVolume?: string;
    ostomyStomaCondition?: string;
    ostomyObservations?: string;
  };

  // 10. Sistema urinário
  urinary: {
    diuresis: 'Presente' | 'Oligúrica' | 'Anúrica' | 'Não avaliada' | 'Não informado' | '';
    eliminationRoute: 'Espontânea' | 'SVD' | 'Outro dispositivo' | 'Não informado' | '';
    spontaneousAspect?: string;
    spontaneousColor?: string;
    spontaneousVolume?: string;
    spontaneousObservations?: string;
    svdCaliber?: string;
    svdPatent?: 'Sim' | 'Não' | 'Não avaliada' | '';
    svdAspect?: string;
    svdColor?: string;
    svdOutputVolume?: string;
    svdObservations?: string;
    otherDeviceDescription?: string;
  };

  // 11. Dispositivos
  devices: {
    list: InvasiveDeviceItem[];
  };

  // 12. Pele e integridade cutânea
  skin: {
    integrity: 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | '';
    hydration: 'Hidratada' | 'Ressecada' | 'Outra' | 'Não avaliada' | '';
    hydrationCustom?: string;
    lesionLocation?: string;
    lesionDescription?: string;
    lesionDressingPresent?: 'Sim' | 'Não' | 'Não informado' | '';
    lesionCarePerformed?: string;
    lesionObservations?: string;
  };

  // 13. Cuidados realizados & Banho
  nursingCare: {
    careItems: string[];
    otherCareDescription?: string;
  };

  bath: {
    bathType:
      | 'Não realizado'
      | 'Banho no leito'
      | 'Banho de aspersão'
      | 'Banho de aspersão com auxílio'
      | 'Banho independente'
      | 'Outro'
      | 'Não informado'
      | '';
    bathTypeCustom?: string;
    tolerance:
      | 'Boa tolerância'
      | 'Apresentou alteração/intercorrência'
      | 'Não avaliada'
      | 'Não informar'
      | '';
    toleranceDetails?: string;
  };

  // 14. Intercorrências
  complications: {
    hasComplication: 'Não' | 'Sim' | 'Não informado' | '';
    description?: string;
    time?: string;
    actionsTaken?: string;
    patientResponse?: string;
    communicatedToTeam: 'Não' | 'Sim' | 'Não informado' | '';
    communicatedWho?:
      | 'Equipe médica'
      | 'Enfermeiro responsável'
      | 'Outra equipe'
      | 'Outro profissional'
      | '';
    communicatedWhoCustom?: string;
    communicationTime?: string;
  };

  // 15. Alterações observadas em relação ao registro anterior
  comparison: {
    // Modo Técnico em Enfermagem
    observationComparison?:
      | 'Sem alteração observada'
      | 'Houve alteração observada'
      | 'Sem comparação disponível'
      | 'Não informado'
      | '';
    observedChangesDescription?: string;

    // Compatibilidade / Modo Enfermeiro futuro
    hasPreviousEvaluation?: 'Não' | 'Sim' | 'Não informado' | '';
    evolutionStatus?:
      | 'Mantém condição'
      | 'Apresenta melhora'
      | 'Apresenta piora'
      | 'Evolução mista'
      | 'Outra mudança'
      | '';
    aspectsRelated?: string[];
    aspectsCustom?: string;
    evidenceDescription?: string;
  };

  // 16. Situação final
  finalStatus: {
    condition:
      | 'Permanece no setor sob cuidados'
      | 'Transferência realizada'
      | 'Transferência em andamento'
      | 'Alta do setor'
      | 'Outra situação'
      | 'Não informado'
      | '';
    conditionCustom?: string;
  };

  // 17. Informações adicionais
  additionalInformation: string;
}

export interface ValidationAlert {
  code: string;
  message: string;
  sectionIndex: number;
  sectionTitle: string;
  isBlocking?: boolean;
}
