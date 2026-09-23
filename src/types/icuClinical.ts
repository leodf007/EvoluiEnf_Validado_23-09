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
  purpose: 'Sedação' | 'Analgesia' | 'Outra' | string;
  observations?: string;
}

export type SedationInfusionItem = SedationAnalgesiaItem;

export interface ICUDeviceItem {
  id: string;
  type:
    | 'AVP'
    | 'CVC'
    | 'PICC'
    | 'PAI'
    | 'CDL'
    | 'SVD'
    | 'SNE'
    | 'SNG'
    | 'GTT'
    | 'TOT'
    | 'Traqueostomia'
    | 'Dreno'
    | 'Ostomia'
    | 'Outro'
    | string;
  customType?: string;
  location: string;
  insertionDate?: string;
  permeability?: 'Pérvio' | 'Não pérvio' | 'Não avaliado' | string;
  functioning?: 'Funcionante' | 'Alterado' | 'Não avaliado' | string;
  dressingStatus?: 'Limpo, seco e íntegro' | 'Alterado' | 'Não avaliado' | string;
  dressingAlterationDetails?: string;
  phlogisticSigns?: 'Ausentes' | 'Presentes' | 'Não avaliados' | string;
  phlogisticSignsDetails?: string;
  // Dreno specific fields
  drainType?: string;
  drainContentAspect?: string;
  drainOutputVolume?: string; // mL
  drainFixationCondition?: string;
  drainDressingCondition?: string;
  observations?: string;
}

export interface TechnicianICUNursingNoteForm {
  // 1. Contexto do registro
  context: {
    moment: 'Recebo paciente' | 'Avalio paciente' | 'Em atendimento' | 'Transfiro cuidado' | string;
    accompaniment: 'Desacompanhado' | 'Familiar' | 'Familiar presente' | 'Acompanhante autorizado' | 'Responsável' | 'Cuidador' | 'Outro' | 'Não informado' | string;
    accompanimentCustom?: string;
    wristbandChecked: 'Sim' | 'Não' | 'Não se aplica' | 'Não aplicável' | 'Não informado' | string;
    bedSignChecked: 'Sim' | 'Não' | 'Não se aplica' | 'Não aplicável' | 'Não informado' | string;
    allergies: 'Não referidas' | 'Sim' | 'Não informado' | string;
    allergiesDetails?: string;
    precaution: 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Reversa / Protetora' | 'Outra' | 'Não informado' | string;
    precautionCustom?: string;
  };

  // 2. Condição observada (SEM bom/regular/mau estado geral)
  observedCondition: {
    behavior: string[];
    behaviorCustom?: string;
    complaints:
      | 'Sem queixas referidas'
      | 'Com queixa'
      | 'Impossibilitado de informar'
      | 'Não avaliado'
      | 'Não informado'
      | string;
    complaintsDetails?: string;
    informationSource?: 'Paciente' | 'Familiar/acompanhante' | 'Acompanhante' | 'Equipe' | 'Não informado' | string;
  };

  // 3. Sinais vitais e dor (reutiliza lógica com PAM)
  vitalSignsAndPain: {
    systolicBP?: string;
    diastolicBP?: string;
    meanArterialPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    temperature?: string;
    bloodGlucose?: string;
    painAssessmentType:
      | 'Sem dor'
      | 'Escala numérica 0–10'
      | 'Outra escala'
      | 'Não avaliável'
      | 'Não avaliada'
      | 'Não informado'
      | string;
    painNumericScaleValue?: number;
    painOtherScaleName?: string;
    painOtherScaleResult?: string;
    painLocation?: string;
    painCharacteristics?: string;
  };

  // 4. Neurológico e sedação
  neurologicalAndSedation: {
    consciousnessLevel:
      | 'Consciente'
      | 'Sonolento'
      | 'Torporoso'
      | 'Comatoso'
      | 'Sedado'
      | 'Outro'
      | 'Não avaliado'
      | string;
    consciousnessCustom?: string;
    orientation:
      | 'Orientado em tempo e espaço'
      | 'Orientado'
      | 'Parcialmente orientado'
      | 'Desorientado'
      | 'Confuso'
      | 'Não avaliável'
      | 'Não avaliado'
      | string;
    glasgowType: 'score' | 'not_applied' | 'not_assessed' | string;
    glasgowScore?: number;
    rassType: 'score' | 'not_applied' | 'not_assessed' | string;
    rassScore?: number;
    pupils:
      | 'Isocóricas'
      | 'Anisocóricas'
      | 'Mióticas'
      | 'Midriáticas'
      | 'Outra'
      | 'Não avaliadas'
      | string;
    pupilsCustom?: string;
    photoreaction:
      | 'Fotorreagentes'
      | 'Reagentes à luz'
      | 'Lentificada'
      | 'Preguiçosas'
      | 'Não reagentes'
      | 'Outra'
      | 'Não avaliada'
      | string;
    photoreactionCustom?: string;
  };

  // 5. Respiratório e ventilação
  respiratoryAndVentilation: {
    respiratorySupport:
      | 'Ar ambiente'
      | 'Oxigenoterapia'
      | 'VNI'
      | 'Ventilação mecânica invasiva'
      | 'Traqueostomia sem ventilação mecânica'
      | 'Outro'
      | 'Não informado'
      | string;
    respiratorySupportCustom?: string;
    // Oxigenoterapia
    oxygenDevice?:
      | 'Cateter nasal'
      | 'Máscara simples'
      | 'Máscara de Venturi'
      | 'Máscara com reservatório'
      | 'Cateter nasal de alto fluxo'
      | 'Cânula nasal'
      | 'Outro'
      | string;
    oxygenDeviceCustom?: string;
    oxygenFlowRate?: string;
    oxygenFiO2?: string;
    // Ventilação Mecânica Invasiva (VMI)
    mechanicalVentilationAirway?: 'TOT' | 'TQT' | 'Traqueostomia' | 'Outro' | string;
    mechanicalVentilationAirwayCustom?: string;
    ventilationMode?: string;
    ventilationFiO2?: string;
    ventilationPeep?: string;
    ventilationRate?: string;
    ventilationTidalVolume?: string;
    ventilationSupportPressure?: string;
    ventilationInspiratoryPressure?: string;
    ventilationOtherParams?: string;
    // Via aérea artificial
    totNumber?: string;
    totFixation?: string;
    totPositionMarking?: string;
    tracheostomyCaliber?: string;
    tracheostomyStomaCondition?: string;
    tracheostomyFixation?: string;
    tracheostomyDressing?: string;
    tracheostomyObservations?: string;
    // Padrão e secreção
    respiratoryPattern?: 'Eupneico' | 'Taquipneico' | 'Bradipneico' | 'Superficial' | 'Profundo' | 'Outro' | 'Não avaliado' | string;
    respiratoryPatternCustom?: string;
    respiratoryDistress?: 'Ausente' | 'Presente' | 'Não avaliado' | string;
    accessoryMuscleUse?: 'Ausente' | 'Presente' | 'Não avaliado' | string;
    secretionsPresence?: 'Ausente' | 'Presente' | 'Não avaliada' | string;
    secretionsQuantity?: string;
    secretionsColor?: string;
    secretionsAspect?: string;
    secretionsConsistency?: string;
    secretionsOdor?: string;
    secretionsObservations?: string;
  };

  // 6. Cardiovascular e perfusão
  cardiovascularAndPerfusion: {
    peripheralPerfusion: 'Adequada' | 'Diminuída' | 'Reduzida' | 'Prejudicada' | 'Não avaliada' | string;
    extremities: 'Quentes' | 'Frias' | 'Outra' | 'Não avaliadas' | string;
    extremitiesCustom?: string;
    capillaryRefillTime: '< 2 segundos' | '< 3 segundos' | '>= 3 segundos' | 'Informar valor' | 'Não avaliado' | string;
    capillaryRefillTimeValue?: string;
    edema: 'Ausente' | 'Presente' | 'Não avaliado' | string;
    edemaLocations?: string[];
    edemaGrading?: '+1/4+' | '+2/4+' | '+3/4+' | '+4/4+' | '1+/4+' | '2+/4+' | '3+/4+' | '4+/4+' | 'Não graduado' | string;
    // Monitorização invasiva
    hasInvasiveMonitoring: 'Não' | 'Sim' | 'Não informado' | string;
    invasiveArterialPressureSite?: string;
    invasiveArterialPressureValue?: string;
    centralVenousPressureValue?: string;
    otherInvasiveMonitoring?: string;
  };

  // 7. Drogas vasoativas
  vasoactiveDrugs: {
    inUse: 'Não' | 'Sim' | 'Não informado' | string;
    drugsList: VasoactiveDrugItem[];
  };

  // 8. Sedação e analgesia em infusão (separado de DVA)
  sedationAndAnalgesia: {
    inUse: 'Não' | 'Sim' | 'Não informado' | string;
    infusionsList: SedationAnalgesiaItem[];
  };

  // 9. Nutrição e gastrointestinal
  nutritionAndGastrointestinal: {
    nutritionalStatus:
      | 'Via oral'
      | 'Dieta enteral'
      | 'Dieta parenteral'
      | 'Jejum'
      | 'Outra'
      | 'Não informado'
      | string;
    oralDietAcceptance?: 'Boa' | 'Moderada' | 'Baixa' | 'Recusada' | 'Não avaliada' | string;
    enteralRoute?: 'SNE' | 'SNG' | 'GTT' | 'Outra' | string;
    enteralRouteCustom?: string;
    enteralInfusionRate?: string;
    enteralTolerance?: 'Boa tolerância' | 'Resíduo gástrico aumentado' | 'Vômitos' | 'Diarreia' | 'Distensão' | 'Resíduo gástrico' | 'Outra' | 'Não avaliada' | string;
    enteralToleranceCustom?: string;
    enteralDietPaused?: boolean;
    enteralObservations?: string;
    // Gastrointestinal
    abdomenInspection?: 'Plano' | 'Globoso' | 'Distendido' | 'Escavado' | 'Outro' | 'Não avaliado' | string;
    abdomenInspectionCustom?: string;
    abdomenConsistency?: 'Flácido e indolor' | 'Flácido' | 'Tenso' | 'Doloroso à palpação' | 'Outro' | 'Não avaliado' | string;
    abdomenPalpation?: 'Indolor' | 'Doloroso' | 'Não realizada' | string;
    bowelSounds?: 'Presentes' | 'Diminuídos' | 'Aumentados' | 'Hipoativos' | 'Hiperativos' | 'Ausentes' | 'Não avaliados' | string;
  };

  // 10. Eliminações e balanço hídrico
  eliminationsAndFluidBalance: {
    diuresis: 'Presente' | 'Ausente / Anúria' | 'Diminuída / Oligúria' | 'Oligúrica' | 'Anúrica' | 'Não avaliada' | 'Não informado' | string;
    urinaryRoute?: 'Espontânea' | 'SVD' | 'Cistostomia' | 'Fralda' | 'Outro' | 'Não informado' | string;
    urinaryRouteCustom?: string;
    svdCaliber?: string;
    svdPermeable?: 'Sim' | 'Não' | 'Não informado' | string;
    diuresisColor?: string;
    diuresisAspect?: string;
    diuresisVolume?: string;
    diuresisObservations?: string;
    // Evacuação
    bowelMovement: 'Presente' | 'Ausente' | 'Não avaliada' | 'Não informado' | string;
    bowelAspect?: 'Formada' | 'Pastosa' | 'Líquida' | 'Diarreica' | 'Outra' | string;
    bowelAspectCustom?: string;
    bowelFrequency?: string;
    bowelQuantity?: string;
    // Balanço hídrico
    hasFluidBalance: 'Não' | 'Sim' | 'Não informado' | string;
    fluidIntake?: string;
    fluidOutput?: string;
    fluidBalanceResult?: string;
  };

  // 11. Dispositivos
  devices: {
    list: ICUDeviceItem[];
  };

  // 12. Pele e integridade cutânea
  skinAndIntegrity: {
    integrity: 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | string;
    hydration: 'Hidratada' | 'Ressecada' | 'Outra' | 'Não avaliada' | string;
    hydrationCustom?: string;
    lesionLocation?: string;
    lesionDescription?: string;
    lesionDressingPresent?: 'Sim' | 'Não' | 'Não informado' | string;
    lesionCareDone?: string;
    lesionObservations?: string;
  };

  // 13. Mobilidade, posicionamento e segurança
  mobilityAndPositioning: {
    mobility:
      | 'Restrito ao leito'
      | 'Movimenta-se no leito'
      | 'Sentado em poltrona'
      | 'Deambula'
      | 'Deambula com auxílio'
      | 'Acamado'
      | 'Mobilização passiva'
      | 'Outro'
      | 'Não avaliado'
      | string;
    mobilityCustom?: string;
    decubitusChangeDone: 'Não' | 'Sim' | 'Não aplicável' | 'Não informado' | string;
    decubitusInterval?: 'A cada 2 horas' | 'Outro intervalo' | 'Conforme necessidade' | 'Outro' | string;
    decubitusIntervalCustom?: string;
    bedHeadElevated: 'Não' | 'Sim' | 'Não informado' | string;
    bedHeadAngle?: '30°' | '45°' | '15°' | '0° (horizontal)' | '30°–45°' | 'Outro' | 'Não informado' | string;
    bedHeadAngleCustom?: string;
    sideRails: 'Elevadas' | 'Rebaixadas' | 'Não elevadas' | 'Não informado' | string;
  };

  // 14. Higiene e banho
  hygieneAndBath: {
    bodyHygiene:
      | 'Preservada'
      | 'Necessita cuidados'
      | 'Higiene realizada'
      | 'Não avaliada'
      | 'Não informado'
      | string;
    bathType:
      | 'Não realizado'
      | 'Banho no leito'
      | 'Banho de aspersão'
      | 'Banho de aspersão com auxílio'
      | 'Banho independente'
      | 'Outro'
      | 'Não informado'
      | string;
    bathTypeCustom?: string;
    bathTolerance?: 'Boa tolerância' | 'Alteração/intercorrência' | 'Não avaliada' | 'Não informado' | string;
    bathToleranceDetails?: string;
  };

  // 15. Cuidados realizados
  nursingCareDone: {
    careItems: string[];
    otherCareDescription?: string;
  };

  // 16. Intercorrências e comunicação
  complicationsAndCommunication: {
    hasComplication: 'Não' | 'Sim' | 'Não informado' | string;
    complicationDescription?: string;
    complicationTime?: string;
    nursingActionsTaken?: string;
    patientResponse?: string;
    communicatedTo?:
      | 'Não realizada'
      | 'Enfermeiro de plantão'
      | 'Enfermeiro responsável'
      | 'Médico plantonista'
      | 'Fisioterapeuta'
      | 'Equipe médica'
      | 'Outra equipe'
      | 'Outro profissional'
      | string;
    communicationRecipientCustom?: string;
    communicationTime?: string;
    communicationDetails?: string;
  };

  // 17. Alterações observadas no período (não chamar de Evolução)
  observedChangesInPeriod: {
    comparisonStatus:
      | 'Sem alterações observadas'
      | 'Houve alteração observada'
      | 'Sem comparação disponível'
      | 'Não informado'
      | string;
    changeDescription?: string;
  };

  // 18. Situação final
  finalStatus: {
    condition:
      | 'Permanece em leito de UTI sob cuidados intensivos de enfermagem'
      | 'Permanece em UTI sob cuidados'
      | 'Encaminhado para procedimento'
      | 'Transferência em andamento'
      | 'Transferido para enfermaria'
      | 'Transferido para centro cirúrgico'
      | 'Transferido para outro setor'
      | 'Outra'
      | 'Não informado'
      | string;
    conditionCustom?: string;
  };

  // 19. Informações adicionais
  additionalInfo: {
    observations?: string;
  };
}
