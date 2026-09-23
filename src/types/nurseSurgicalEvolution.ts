export interface NurseSurgicalEvolutionContext {
  moment: string; // 'Início do plantão' | 'Meio do plantão' | 'Término do plantão' | 'Admissão no setor' | 'Retorno de centro cirúrgico' | 'Transferência' | 'Outro' | ''
  customMoment?: string;
  location: string; // 'Enfermaria Cirúrgica' | 'Apartamento' | 'Leito cirúrgico' | 'RPA / Recuperação' | 'Outro' | ''
  customLocation?: string;
  escort: string; // 'Desacompanhado' | 'Familiar' | 'Acompanhante contratado' | 'Responsável' | 'Outro' | ''
  customEscort?: string;
}

export interface NurseSurgicalSafetyIdentification {
  wristbandIdentification: string; // 'Presente e conferida' | 'Ausente' | 'Danificada' | 'Não se aplica' | ''
  bedIdentification: string; // 'Presente e conferida' | 'Ausente' | 'Incorreta' | 'Não se aplica' | ''
  precaution: string; // 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Outra' | 'Não informado' | ''
  customPrecaution?: string;
  hasAllergies: string; // 'Não referidas' | 'Sim' | 'Não informado' | ''
  allergyDescription?: string;
}

export interface NurseSurgicalContext {
  surgicalSituation: string; // 'Pré-operatório' | 'Pós-operatório imediato' | 'Pós-operatório mediato' | 'Pós-operatório tardio' | 'Pós-procedimento' | 'Não informado' | ''
  surgicalProcedure?: string; // Campo manual fornecido pelo Enfermeiro. A IA não cria.
  procedureDate?: string; // Data opcional
  anesthesiaType: string; // 'Geral' | 'Raquidiana' | 'Peridural' | 'Sedação' | 'Local' | 'Outra' | 'Não informado' | ''
  customAnesthesia?: string;
}

export interface NurseSurgicalGeneralAssessment {
  generalState: string; // 'Bom' | 'Regular' | 'Mau' | 'Não informado' | ''
  consciousness: string; // 'Consciente' | 'Sonolento' | 'Torporoso' | 'Sedado' | 'Outro' | 'Não avaliado' | ''
  customConsciousness?: string;
  behavior: string[]; // ['Calmo', 'Cooperativo', 'Ansioso', 'Agitado', 'Hipoativo', 'Outro', 'Não avaliado']
  customBehavior?: string;
  complaintStatus: string; // 'Sem queixas referidas' | 'Com queixa' | 'Impossibilitado de informar' | 'Não informado' | ''
  complaintDescription?: string;
  informationSource: string; // 'Paciente' | 'Familiar' | 'Equipe' | 'Outro' | 'Não informado' | ''
  customInformationSource?: string;
}

export interface NurseSurgicalPain {
  painScaleType: string; // 'Escala numérica 0-10' | 'Outra' | 'Não avaliável' | 'Não avaliada' | ''
  painScore: string;
  customScale?: string;
  painLocation?: string;
  painCharacteristic?: string;
  analgesiaRegistered: string; // 'Sim' | 'Não' | 'Não informado' | ''
  analgesiaDetails?: string;
}

export interface NurseSurgicalVitalSigns {
  systolicBP: string;
  diastolicBP: string;
  meanArterialPressure: string; // PAM informada manualmente pelo enfermeiro, NUNCA calculada automaticamente
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  capillaryBloodGlucose: string;
}

export interface NurseSurgicalNeurological {
  consciousnessLevel: string; // 'Consciente' | 'Sonolento' | 'Torporoso' | 'Sedado' | 'Não avaliado' | ''
  orientation: string; // 'Orientado no tempo e espaço' | 'Desorientado' | 'Confuso' | 'Não avaliado' | ''
  glasgowScore?: string;
  pupils: string; // 'Isocóricas' | 'Anisocóricas' | 'Midriáticas' | 'Mióticas' | 'Não avaliadas' | ''
  photoreaction: string; // 'Reagentes' | 'Não reagentes' | 'Lentificadas' | 'Não avaliadas' | ''
  motorDeficit: string; // 'Ausente' | 'Presente' | 'Em recuperação anestésica' | 'Não avaliado' | ''
  motorDeficitDetails?: string;
}

export interface NurseSurgicalRespiratory {
  respiratorySupport: string; // 'Ar ambiente' | 'Oxigenoterapia' | 'VNI' | 'VMI' | 'Outro' | ''
  supportDevice?: string; // 'Cânula nasal' | 'Máscara de Venturi' | 'Máscara com reservatório' | 'Outro'
  oxygenFlow?: string;
  pattern: string; // 'Eupneico' | 'Taquipneico' | 'Bradipneico' | 'Dispneico' | 'Outro' | ''
  respiratoryDiscomfort: string; // 'Ausente' | 'Tiragem intercostal' | 'Batimento asa de nariz' | 'Uso musculatura acessória' | ''
  auscultation: string; // 'Murmúrio vesicular presente bilateralmente sem ruídos adventícios' | 'Ruídos adventícios presentes' | 'Diminuição bilateral de MV' | 'Diminuição unilateral' | 'Não realizada' | ''
  adventitiousSoundsDetails?: string;
}

export interface NurseSurgicalCardiovascular {
  peripheralPerfusion: string; // 'Boa / Preservada' | 'Lentificada' | 'Prejudicada' | 'Não avaliada' | ''
  extremities: string; // 'Aquecidas' | 'Frias' | 'Cianóticas' | 'Não avaliadas' | ''
  tec: string; // '< 2 segundos' | '≥ 2 segundos' | 'Não avaliado' | ''
  edema: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  edemaLocation?: string;
  cardiacAuscultation: string; // 'Bulhas rítmicas normofonéticas sem sopros' | 'Arritmia auscultada' | 'Sopro auscultado' | 'Não realizada' | ''
  cardiacDetails?: string;
}

export interface NurseSurgicalGastrointestinal {
  abdomenForm: string; // 'Plano' | 'Globoso' | 'Distendido' | 'Escavado' | 'Não avaliado' | ''
  consistency: string; // 'Flácido e indolor' | 'Tenso' | 'Rígido' | 'Não avaliado' | ''
  painOnPalpation: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  palpationPainLocation?: string;
  bowelSounds: string; // 'Presentes normoativos' | 'Hipoativos' | 'Hiperativos' | 'Ausentes' | 'Não avaliados' | ''
  nauseaVomiting: string; // 'Ausente' | 'Náuseas' | 'Vômitos' | 'Não informado' | ''
}

export interface NurseSurgicalNutrition {
  nutritionalRoute: string; // 'Oral' | 'Enteral' | 'Parenteral' | 'Jejum pré-operatório' | 'Jejum pós-operatório' | 'Não informado' | ''
  acceptance: string; // 'Boa aceitação (>75%)' | 'Aceitação parcial (50-75%)' | 'Baixa aceitação (<50%)' | 'Recusada' | 'Não se aplica' | ''
  fastingReason?: string;
  enteralDevice?: string; // 'SNE' | 'SNG' | 'GTT'
  enteralInfusionRate?: string;
  enteralTolerance?: string; // 'Boa' | 'Distensão/Resíduo gástrico aumentado'
}

export interface NurseSurgicalEliminations {
  diuresis: string; // 'Espontânea' | 'Por cateter vesical de demora (SVD)' | 'Por cateterismo intermitente' | 'Preservada sem mensuração' | 'Ausente / Anúria' | 'Não avaliada' | ''
  urinaryRoute?: string;
  diuresisAspect?: string; // 'Amarelo claro / Clara' | 'Concentrada' | 'Hematúrica' | 'Piúrica' | 'Com grumos'
  diuresisVolume?: string;
  bowelEvacuation: string; // 'Presente' | 'Ausente' | 'Não avaliada' | 'Não informado' | ''
  bowelAspect?: string; // 'Fezes pastosas normocoradas' | 'Fezes líquidas' | 'Fezes endurecidas' | 'Melena' | 'Com sangue'
}

export interface NurseSurgicalWound {
  hasSurgicalWound: string; // 'Sim' | 'Não' | 'Não avaliada' | ''
  anatomicalLocation?: string; // Localização anatômica da ferida
  aspect?: string; // 'Limpo' | 'Seco' | 'Íntegro' | 'Bordas aproximadas' | 'Outro' | ''
  customAspect?: string;
  dressingPresent?: string; // 'Presente' | 'Ausente' | ''
  dressingCondition?: string; // 'Limpo' | 'Seco' | 'Íntegro' | 'Saturado' | 'Com mancha hemática' | 'Outro' | ''
  customDressingCondition?: string;
  exudate?: string; // 'Ausente' | 'Presente' | ''
  exudateCharacteristics?: string;
}

export interface NurseSurgicalDressing {
  dressingChanged?: string; // 'Sim' | 'Não' | 'Não se aplica' | ''
  dressingProductUsed?: string; // Solução / cobertura utilizada
  dressingAspectObserved?: string; // Achados observados na troca
  dressingInterventionDetails?: string; // Observações adicionais
}

export interface NurseSurgicalDrainItem {
  id: string;
  type: string; // 'Portovac' | 'Dreno de Penrose' | 'Dreno tubular' | 'Dreno de tórax' | 'Dreno Blake' | 'Jackson-Pratt' | 'Outro'
  customType?: string;
  location: string;
  permeability: string; // 'Pérvio' | 'Obstruído' | 'Não avaliado' | ''
  functioning: string; // 'Funcionante sob aspiração a vácuo' | 'Funcionante por gravidade' | 'Sem oscilação' | 'Alterado' | ''
  fixation: string; // 'Fixado com ponto cirúrgico' | 'Fita adesiva' | 'Íntegra' | 'Não avaliada' | ''
  drainAspect: string; // 'Seroso' | 'Sero-hemático' | 'Hemático' | 'Purulento' | 'Bilioso' | 'Outro'
  volumeReported: string; // Volume informado em mL (manual)
}

export interface NurseSurgicalDrains {
  hasDrains: string; // 'Sim' | 'Não' | 'Não informado' | ''
  list: NurseSurgicalDrainItem[];
}

export interface NurseSurgicalInvasiveDeviceItem {
  id: string;
  type: string; // 'AVP' | 'CVC' | 'PICC' | 'SVD' | 'SNG' | 'SNE' | 'Ostomia' | 'Outro'
  anatomicalSite: string;
  laterality: string;
  siteCondition: string; // 'Sem sinais flogísticos' | 'Hiperemia' | 'Edema' | 'Dor local' | 'Exsudato' | 'Não avaliado'
  dressingCondition: string; // 'Limpo e seco' | 'Oclusivo íntegro' | 'Úmido/Solto'
  permeability: string; // 'Pérvio' | 'Salinizado' | 'Infusão contínua' | 'Obstruído'
}

export interface NurseSurgicalDevices {
  list: NurseSurgicalInvasiveDeviceItem[];
}

export interface NurseSurgicalMobility {
  mobility: string; // 'Deambula sem auxílio' | 'Deambula com auxílio' | 'Restrito ao leito' | 'Em repouso no leito prescrito' | 'Outro' | 'Não avaliado' | ''
  customMobility?: string;
  decubitusChange: string; // 'Realizada com auxílio da equipe' | 'Realizada de forma independente' | 'Não realizada' | 'Não se aplica' | ''
}

export interface NurseSurgicalHygiene {
  hygieneStatus: string; // 'Preservada / Autocuidado preservado' | 'Necessita auxílio parcial' | 'Total dependência para higiene' | 'Não avaliado' | ''
  bathType: string; // 'Aspersão (chuveiro)' | 'Leito' | 'Não realizado no plantão' | 'Não se aplica' | ''
  bathTolerance: string; // 'Boa tolerância sem queixas' | 'Fadiga ao esforço' | 'Dor durante o procedimento' | 'Não se aplica' | ''
}

export interface NurseSurgicalRiskAssessment {
  fallRiskStatus: string; // 'Baixo risco' | 'Risco moderado' | 'Alto risco' | 'Não avaliado' | ''
  fallRiskScore?: string;
  lppRiskStatus: string; // 'Baixo risco' | 'Risco moderado' | 'Alto risco' | 'Não avaliado' | ''
  lppRiskScore?: string;
  aspirationRiskStatus: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  otherRisks?: string;
}

export interface NurseSurgicalCareDone {
  careItems: string[]; // ['Administração de medicamentos prescritos', 'Curativo cirúrgico', 'Cuidados e ordenha de drenos', 'Higiene e banho', 'Mudança de decúbito', 'Mobilização precoce / Deambulação assistida', 'Controle da dor', 'Controle glicêmico', 'Esvaziamento e mensuração de drenos', 'Controle do balanço hídrico', 'Coleta de exames laboratoriais', 'Outros']
  customCare?: string;
}

export interface NurseSurgicalResponseToCare {
  evaluated: string; // 'Sim' | 'Não' | 'Não avaliado' | ''
  interventionTarget?: string; // Ex: 'Analgesia prescrita', 'Curativo cirúrgico', 'Mobilização precoce'
  observedResponse?: string; // Ex: 'Redução do escore de dor de 7 para 2', 'Boa aceitação sem intercorrências'
}

export interface NurseSurgicalComplications {
  hasComplication: string; // 'Sim' | 'Não' | 'Não informado' | ''
  description?: string;
  immediateAction?: string;
  communicationDone?: string;
  responseObserved?: string;
}

export interface NurseSurgicalCommunication {
  hasCommunication: string; // 'Sim' | 'Não' | ''
  target?: string; // Ex: 'Equipe de cirurgia geral', 'Médico plantonista'
  time?: string;
  reason?: string;
  responseObserved?: string;
}

export interface NurseSurgicalComparison {
  statusChange: string; // 'Estável em relação à avaliação anterior' | 'Melhora clínica e pós-operatória' | 'Piora clínica' | 'Novo sintoma ou alteração identificada' | 'Não avaliado' | ''
  description?: string;
}

export interface NurseSurgicalSynthesis {
  synthesisText: string; // Texto privativo do enfermeiro
}

export interface NurseSurgicalCurrentStatus {
  status: string; // 'Permanece no leito estável' | 'Permanece em recuperação pós-operatória' | 'Alta da clínica cirúrgica' | 'Transferência setorial' | 'Encaminhado ao Centro Cirúrgico' | 'Outro' | ''
  customStatus?: string;
  pendingIssues?: string;
}

export interface NurseSurgicalEvolutionForm {
  // 1. Contexto da evolução
  context: NurseSurgicalEvolutionContext;
  // 2. Segurança e identificação
  safetyIdentification: NurseSurgicalSafetyIdentification;
  // 3. Contexto cirúrgico
  surgicalContext: NurseSurgicalContext;
  // 4. Avaliação geral
  generalAssessment: NurseSurgicalGeneralAssessment;
  // 5. Dor pós-operatória
  pain: NurseSurgicalPain;
  // 6. Sinais vitais
  vitalSigns: NurseSurgicalVitalSigns;
  // 7. Avaliação neurológica
  neurological: NurseSurgicalNeurological;
  // 8. Respiratório
  respiratory: NurseSurgicalRespiratory;
  // 9. Cardiovascular
  cardiovascular: NurseSurgicalCardiovascular;
  // 10. Gastrointestinal
  gastrointestinal: NurseSurgicalGastrointestinal;
  // 11. Nutrição
  nutrition: NurseSurgicalNutrition;
  // 12. Eliminações
  eliminations: NurseSurgicalEliminations;
  // 13. Ferida operatória
  surgicalWound: NurseSurgicalWound;
  // 14. Curativo cirúrgico
  surgicalDressing: NurseSurgicalDressing;
  // 15. Drenos
  drains: NurseSurgicalDrains;
  // 16. Dispositivos invasivos
  devices: NurseSurgicalDevices;
  // 17. Mobilidade
  mobility: NurseSurgicalMobility;
  // 18. Higiene e autocuidado
  hygiene: NurseSurgicalHygiene;
  // 19. Riscos assistenciais
  riskAssessment: NurseSurgicalRiskAssessment;
  // 20. Cuidados realizados
  careDone: NurseSurgicalCareDone;
  // 21. Resposta aos cuidados
  responseToCare: NurseSurgicalResponseToCare;
  // 22. Intercorrências
  complications: NurseSurgicalComplications;
  // 23. Comunicação
  communication: NurseSurgicalCommunication;
  // 24. Comparação com avaliação anterior
  comparisonWithPrevious: NurseSurgicalComparison;
  // 25. Síntese de enfermagem
  nursingSynthesis: NurseSurgicalSynthesis;
  // 26. Situação atual
  currentStatus: NurseSurgicalCurrentStatus;
}

export function createInitialNurseSurgicalEvolutionForm(): NurseSurgicalEvolutionForm {
  return {
    context: {
      moment: '',
      customMoment: '',
      location: '',
      customLocation: '',
      escort: '',
      customEscort: '',
    },
    safetyIdentification: {
      wristbandIdentification: '',
      bedIdentification: '',
      precaution: '',
      customPrecaution: '',
      hasAllergies: '',
      allergyDescription: '',
    },
    surgicalContext: {
      surgicalSituation: '',
      surgicalProcedure: '',
      procedureDate: '',
      anesthesiaType: '',
      customAnesthesia: '',
    },
    generalAssessment: {
      generalState: '',
      consciousness: '',
      customConsciousness: '',
      behavior: [],
      customBehavior: '',
      complaintStatus: '',
      complaintDescription: '',
      informationSource: '',
      customInformationSource: '',
    },
    pain: {
      painScaleType: '',
      painScore: '',
      customScale: '',
      painLocation: '',
      painCharacteristic: '',
      analgesiaRegistered: '',
      analgesiaDetails: '',
    },
    vitalSigns: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      capillaryBloodGlucose: '',
    },
    neurological: {
      consciousnessLevel: '',
      orientation: '',
      glasgowScore: '',
      pupils: '',
      photoreaction: '',
      motorDeficit: '',
      motorDeficitDetails: '',
    },
    respiratory: {
      respiratorySupport: '',
      supportDevice: '',
      oxygenFlow: '',
      pattern: '',
      respiratoryDiscomfort: '',
      auscultation: '',
      adventitiousSoundsDetails: '',
    },
    cardiovascular: {
      peripheralPerfusion: '',
      extremities: '',
      tec: '',
      edema: '',
      edemaLocation: '',
      cardiacAuscultation: '',
      cardiacDetails: '',
    },
    gastrointestinal: {
      abdomenForm: '',
      consistency: '',
      painOnPalpation: '',
      palpationPainLocation: '',
      bowelSounds: '',
      nauseaVomiting: '',
    },
    nutrition: {
      nutritionalRoute: '',
      acceptance: '',
      fastingReason: '',
      enteralDevice: '',
      enteralInfusionRate: '',
      enteralTolerance: '',
    },
    eliminations: {
      diuresis: '',
      urinaryRoute: '',
      diuresisAspect: '',
      diuresisVolume: '',
      bowelEvacuation: '',
      bowelAspect: '',
    },
    surgicalWound: {
      hasSurgicalWound: '',
      anatomicalLocation: '',
      aspect: '',
      customAspect: '',
      dressingPresent: '',
      dressingCondition: '',
      customDressingCondition: '',
      exudate: '',
      exudateCharacteristics: '',
    },
    surgicalDressing: {
      dressingChanged: '',
      dressingProductUsed: '',
      dressingAspectObserved: '',
      dressingInterventionDetails: '',
    },
    drains: {
      hasDrains: '',
      list: [],
    },
    devices: {
      list: [],
    },
    mobility: {
      mobility: '',
      customMobility: '',
      decubitusChange: '',
    },
    hygiene: {
      hygieneStatus: '',
      bathType: '',
      bathTolerance: '',
    },
    riskAssessment: {
      fallRiskStatus: '',
      fallRiskScore: '',
      lppRiskStatus: '',
      lppRiskScore: '',
      aspirationRiskStatus: '',
      otherRisks: '',
    },
    careDone: {
      careItems: [],
      customCare: '',
    },
    responseToCare: {
      evaluated: '',
      interventionTarget: '',
      observedResponse: '',
    },
    complications: {
      hasComplication: '',
      description: '',
      immediateAction: '',
      communicationDone: '',
      responseObserved: '',
    },
    communication: {
      hasCommunication: '',
      target: '',
      time: '',
      reason: '',
      responseObserved: '',
    },
    comparisonWithPrevious: {
      statusChange: '',
      description: '',
    },
    nursingSynthesis: {
      synthesisText: '',
    },
    currentStatus: {
      status: '',
      customStatus: '',
      pendingIssues: '',
    },
  };
}
