import { InvasiveDeviceItem } from './clinical';

export interface TechnicianAdmissionForm {
  // 1. Contexto da admissão
  context: {
    moment: 'Admito/Recebo paciente' | '';
    location:
      | 'Sala Vermelha'
      | 'Sala Amarela'
      | 'Sala Verde'
      | 'Observação'
      | 'Box'
      | 'Leito'
      | 'Outro'
      | '';
    locationCustom?: string;
    accompaniment:
      | 'Desacompanhado'
      | 'Familiar'
      | 'Responsável'
      | 'Cuidador'
      | 'Equipe assistencial'
      | 'Outro'
      | 'Não informado'
      | '';
    accompanimentCustom?: string;
  };

  // 2. Procedência e forma de chegada
  origin: {
    patientOrigin:
      | 'Domicílio'
      | 'SAMU'
      | 'Corpo de Bombeiros'
      | 'UPA'
      | 'Unidade Básica de Saúde'
      | 'Outro hospital'
      | 'Outro setor da instituição'
      | 'Instituição de longa permanência'
      | 'Clínica'
      | 'Transferência inter-hospitalar'
      | 'Outro'
      | 'Não informado'
      | '';
    originCustom?: string;
    arrivalModes: string[]; // 'Deambulando' | 'Cadeira de rodas' | 'Maca' | 'Ambulância' | 'Outro' | 'Não informado'
    arrivalModesCustom?: string;
    accompaniedByTransportTeam: 'Não' | 'Sim' | 'Não informado' | '';
    transportTeamType?:
      | 'SAMU'
      | 'Bombeiros'
      | 'Ambulância particular'
      | 'Equipe institucional'
      | 'Outra'
      | '';
    transportTeamTypeCustom?: string;
  };

  // 3. Identificação e segurança
  identification: {
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
  };

  // 4. Informações referidas
  reportedInformation: {
    admissionReason?: string;
    relevantComorbidities?: string;
    complaints:
      | 'Sem queixas referidas no momento'
      | 'Com queixa'
      | 'Impossibilitado de informar'
      | 'Não avaliado'
      | 'Não informado'
      | '';
    complaintsDetails?: string;
    informationSource:
      | 'Paciente'
      | 'Acompanhante'
      | 'Equipe de origem'
      | 'Documento/encaminhamento'
      | 'Outra'
      | 'Não informado'
      | '';
    informationSourceCustom?: string;
  };

  // 5. Condições observadas na chegada
  arrivalCondition: {
    behavior: string[]; // 'Calmo' | 'Cooperativo' | 'Agitado' | 'Ansioso' | 'Choroso' | 'Inquieto' | 'Hipoativo' | 'Sonolento' | 'Outro' | 'Não avaliado'
    behaviorCustom?: string;
    hygiene:
      | 'Preservada'
      | 'Necessita cuidados'
      | 'Higiene prejudicada'
      | 'Não avaliada'
      | 'Não informado'
      | '';
  };

  // 6. Sinais vitais e dor
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

  // 7. Neurológico
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
    pupils?:
      | 'Isocóricas'
      | 'Anisocóricas'
      | 'Mióticas'
      | 'Midriáticas'
      | 'Outra alteração'
      | 'Não avaliadas'
      | '';
    pupilsCustom?: string;
    photoreaction?:
      | 'Fotorreagentes'
      | 'Fotorreatividade lentificada'
      | 'Não reagentes'
      | 'Outra'
      | 'Não avaliada'
      | '';
    photoreactionCustom?: string;
  };

  // 8. Respiratório
  respiratory: {
    respiratorySupport:
      | 'Ar ambiente'
      | 'Oxigenoterapia'
      | 'VNI'
      | 'VMI'
      | 'Outro'
      | 'Não informado'
      | '';
    supportCustom?: string;
    oxygenDevice?: string;
    oxygenDeviceCustom?: string;
    oxygenFlowRate?: string;
    oxygenFiO2?: string;
    vniInterface?: string;
    vniFiO2?: string;
    vniPeepEpap?: string;
    vniIpapPinsp?: string;
    vniOtherParams?: string;
    vmiAirway?: 'TOT' | 'Traqueostomia' | 'Outro' | '';
    vmiAirwayCustom?: string;
    vmiCaliber?: string;
    vmiVentilatoryMode?: string;
    vmiPeep?: string;
    vmiFiO2?: string;
    vmiProgrammedRR?: string;
    vmiTidalVolume?: string;
    vmiSupportPressure?: string;
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
    secretionDetails?: string;
    breathSounds?: string;
    breathSoundsLocation?: string;
    adventitiousSounds?: string[];
  };

  // 9. Cardiovascular / Perfusão
  cardiovascular: {
    peripheralPerfusion: 'Adequada' | 'Reduzida' | 'Não avaliada' | '';
    extremities: 'Quentes' | 'Frias' | 'Outra' | 'Não avaliadas' | '';
    extremitiesCustom?: string;
    capillaryRefillTime:
      | '< 3 segundos'
      | '≥ 3 segundos'
      | 'Informar valor'
      | 'Não avaliado'
      | '';
    capillaryRefillTimeValue?: string;
    edema: 'Ausente' | 'Presente' | 'Não avaliado' | '';
    edemaLocations: string[];
    edemaLocationCustom?: string;
    edemaIntensity?: string;
  };

  // 10. Nutrição e gastrointestinal
  nutrition: {
    status:
      | 'Dieta por via oral'
      | 'Dieta enteral'
      | 'Jejum'
      | 'Dieta parenteral'
      | 'Não informado'
      | 'Outro'
      | '';
    statusCustom?: string;
    oralAcceptance?: string;
    enteralDevice?: string;
    enteralRate?: string;
    enteralTolerance?: string;
  };

  gastrointestinal: {
    abdominalShape?: string;
    consistency?: string;
    palpation?: string;
    bowelSounds?: string;
  };

  // 11. Eliminações
  elimination: {
    diuresis: 'Presente' | 'Oligúrica' | 'Anúrica' | 'Não avaliada' | 'Não informado' | '';
    urinaryRoute: 'Espontânea' | 'SVD' | 'Outro' | 'Não informado' | '';
    urinaryRouteCustom?: string;
    svdCaliber?: string;
    svdPatent?: string;
    svdAspect?: string;
    svdColor?: string;
    svdOutputVolume?: string;
    bowelMovement: 'Presente' | 'Ausente' | 'Não avaliada' | 'Não informado' | '';
    bowelAspect?: string;
  };

  // 12. Dispositivos já presentes na admissão
  existingDevices: {
    list: InvasiveDeviceItem[];
  };

  // 13. Pele e integridade cutânea
  skin: {
    integrity: 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | '';
    hydration: 'Hidratada' | 'Ressecada' | 'Outra' | 'Não avaliada' | '';
    hydrationCustom?: string;
    lesionLocation?: string;
    lesionDescription?: string;
    lesionDressingPresent?: 'Sim' | 'Não' | 'Não informado' | '';
    lesionObservedCondition?: string;
    lesionCarePerformed?: string;
  };

  // 14. Mobilidade e segurança
  mobility: {
    condition:
      | 'Deambula sem auxílio'
      | 'Deambula com auxílio'
      | 'Cadeira de rodas'
      | 'Em maca'
      | 'Restrito ao leito'
      | 'Outro'
      | 'Não avaliada'
      | '';
    conditionCustom?: string;
    bedRailsUsed: 'Sim' | 'Não' | 'Não informado' | '';
    headOfBedElevated: 'Sim' | 'Não' | 'Não informado' | '';
    headOfBedAngle?: string;
  };

  // 15. Higiene e banho na admissão
  hygiene: {
    bathPerformed:
      | 'Não'
      | 'Banho no leito'
      | 'Banho de aspersão'
      | 'Banho de aspersão com auxílio'
      | 'Banho independente'
      | 'Outro'
      | 'Não informado'
      | '';
    bathCustom?: string;
    tolerance:
      | 'Boa'
      | 'Houve alteração/intercorrência'
      | 'Não avaliada'
      | 'Não informado'
      | '';
    toleranceDetails?: string;
  };

  // 16. Cuidados realizados na admissão
  admissionCare: {
    careItems: string[];
    otherCareDescription?: string;
  };

  // 17. Dispositivos instalados durante a admissão
  installedDevices: {
    installedInAdmission: 'Não' | 'Sim' | 'Não informado' | '';
    list: InvasiveDeviceItem[];
  };

  // 18. Pertences
  belongings: {
    status:
      | 'Sem pertences informados'
      | 'Pertences permanecem com paciente'
      | 'Entregues ao acompanhante/responsável'
      | 'Entregues conforme rotina institucional'
      | 'Outro'
      | 'Não informado'
      | '';
    statusCustom?: string;
  };

  // 19. Intercorrências e comunicação
  complications: {
    hasComplication: 'Não' | 'Sim' | 'Não informado' | '';
    description?: string;
    time?: string;
    actionsTaken?: string;
    patientResponse?: string;
    communicatedToTeam?: 'Não' | 'Sim' | 'Não informado' | '';
    communicatedWho?: string;
    communicationTime?: string;
  };

  communications: {
    communicationNeeded: 'Não' | 'Sim' | 'Não informado' | '';
    professionalType?:
      | 'Enfermeiro responsável'
      | 'Equipe médica'
      | 'Outra equipe'
      | 'Outro profissional'
      | '';
    professionalTypeCustom?: string;
    time?: string;
    description?: string;
  };

  // 20. Situação após admissão e informações adicionais
  finalStatus: {
    conditions: string[]; // 'Permanece no setor sob cuidados' | 'Mantido em monitorização' | 'Encaminhado para outro setor' | 'Transferência em andamento' | 'Outra situação' | 'Não informado'
    conditionCustom?: string;
  };

  additionalInformation: string;
}
