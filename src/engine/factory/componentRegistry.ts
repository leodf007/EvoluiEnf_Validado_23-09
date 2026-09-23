export interface ClinicalComponentDescriptor {
  id: string;
  name: string;
  category: 'context' | 'vitals' | 'assessment' | 'devices' | 'hygiene_care' | 'complications' | 'synthesis';
  description: string;
  supportsProfiles: ('technician' | 'nurse')[];
}

export class ClinicalComponentRegistry {
  private static registry: Map<string, ClinicalComponentDescriptor> = new Map([
    [
      'VitalSignsInputs',
      {
        id: 'VitalSignsInputs',
        name: 'Sinais Vitais e Dor',
        category: 'vitals',
        description: 'Painel padronizado para PA, PAM manual, FC, FR, SpO2, Temperatura e Glicemia capilar.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'PainAssessmentInputs',
      {
        id: 'PainAssessmentInputs',
        name: 'Avaliação de Dor',
        category: 'assessment',
        description: 'Escala numérica de dor (0-10) ou BPS/CPOT com caracterização e localização.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'NeurologicalInputs',
      {
        id: 'NeurologicalInputs',
        name: 'Avaliação Neurológica',
        category: 'assessment',
        description: 'Nível de consciência, pupilas, fotoreatividade, Glasgow e RASS.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'RespiratorySupportInputs',
      {
        id: 'RespiratorySupportInputs',
        name: 'Suporte Ventilatório',
        category: 'assessment',
        description: 'Suporte respiratório em ar ambiente, cateter, máscara, CNAF ou VNI.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'MechanicalVentilationInputs',
      {
        id: 'MechanicalVentilationInputs',
        name: 'Ventilação Mecânica Invasiva (VMI)',
        category: 'assessment',
        description: 'Via aérea (TOT/TQT), modo ventilatório, PEEP, FiO2, volume corrente e frequência respiratória do ventilador.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'CardiovascularPerfusionInputs',
      {
        id: 'CardiovascularPerfusionInputs',
        name: 'Perfusão e Sistema Cardiovascular',
        category: 'assessment',
        description: 'Perfusão periférica, tempo de enchimento capilar (TEC) e presença de edema.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'NutritionInputs',
      {
        id: 'NutritionInputs',
        name: 'Nutrição e Aceitação',
        category: 'assessment',
        description: 'Estado nutricional (VO, enteral, parenteral, jejum) com via, taxa e tolerância.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'EliminationInputs',
      {
        id: 'EliminationInputs',
        name: 'Eliminações Vesicais e Intestinais',
        category: 'assessment',
        description: 'Diurese (espontânea, SVD, cistostomia) e evacuações com aspecto e frequência.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'DeviceFormCard',
      {
        id: 'DeviceFormCard',
        name: 'Dispositivos Invasivos',
        category: 'devices',
        description: 'Mapeamento de acessos vasculares (AVP, CVC, PICC), drenos, sondas e curativos.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'SkinAssessmentInputs',
      {
        id: 'SkinAssessmentInputs',
        name: 'Integridade Cutânea e Lesões',
        category: 'assessment',
        description: 'Integridade da pele, turgor, coloração, presença de lesões por pressão e curativos.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'MobilityInputs',
      {
        id: 'MobilityInputs',
        name: 'Mobilidade e Nível de Atividade',
        category: 'assessment',
        description: 'Deambulação, acamado, restrito ao leito ou cadeira de rodas.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'BathInputs',
      {
        id: 'BathInputs',
        name: 'Higiene e Conforto / Banho',
        category: 'hygiene_care',
        description: 'Tipo de banho realizado e tolerância do paciente.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'NursingCareInputs',
      {
        id: 'NursingCareInputs',
        name: 'Cuidados e Procedimentos Realizados',
        category: 'hygiene_care',
        description: 'Checklist de cuidados de enfermagem executados no plantão.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'ComplicationInputs',
      {
        id: 'ComplicationInputs',
        name: 'Intercorrências no Plantão',
        category: 'complications',
        description: 'Registro de intercorrências, horário, condutas adotadas e comunicação à equipe.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'CommunicationInputs',
      {
        id: 'CommunicationInputs',
        name: 'Comunicação Assistencial',
        category: 'complications',
        description: 'Registro formal da comunicação de alterações à equipe médica ou enfermeiro responsável.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'ContextInputs',
      {
        id: 'ContextInputs',
        name: 'Contexto do Registro',
        category: 'context',
        description: 'Momento do atendimento, setor, acompanhante e checagem de pulseira e leito.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'GeneralAssessmentInputs',
      {
        id: 'GeneralAssessmentInputs',
        name: 'Avaliação Geral do Paciente',
        category: 'assessment',
        description: 'Estado observado, relato de queixas com fonte, higiene e mobilidade.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'SurgicalContextInputs',
      {
        id: 'SurgicalContextInputs',
        name: 'Informações Cirúrgicas Registradas',
        category: 'context',
        description: 'Situação cirúrgica (pré-operatório, pós-operatório) e procedimento cirúrgico informado.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'SurgicalWoundInputs',
      {
        id: 'SurgicalWoundInputs',
        name: 'Ferida e Curativo Cirúrgico Observado',
        category: 'assessment',
        description: 'Presença de curativo cirúrgico, localização anatômica e condição objetiva observada.',
        supportsProfiles: ['technician', 'nurse'],
      },
    ],
    [
      'SedationAssessmentInputs',
      {
        id: 'SedationAssessmentInputs',
        name: 'Sedação Avaliada',
        category: 'assessment',
        description: 'Status de sedação, escala RASS informada e observações clínicas.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'VasoactiveDrugsInputs',
      {
        id: 'VasoactiveDrugsInputs',
        name: 'Drogas Vasoativas em Infusão Contínua',
        category: 'assessment',
        description: 'Infusões contínuas de drogas vasoativas (noradrenalina, vasopressina, dobutamina, etc.).',
        supportsProfiles: ['nurse', 'technician'],
      },
    ],
    [
      'SedationInfusionInputs',
      {
        id: 'SedationInfusionInputs',
        name: 'Sedação e Analgesia em Infusão',
        category: 'assessment',
        description: 'Infusões de sedativos e analgésicos com dosagem/taxa e observações.',
        supportsProfiles: ['nurse', 'technician'],
      },
    ],
    [
      'WaterBalanceInputs',
      {
        id: 'WaterBalanceInputs',
        name: 'Balanço Hídrico',
        category: 'assessment',
        description: 'Controle hídrico com entradas, saídas e balanço acumulado informado.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'RiskAssessmentInputs',
      {
        id: 'RiskAssessmentInputs',
        name: 'Riscos Assistenciais Avaliados',
        category: 'assessment',
        description: 'Risco de queda, lesão por pressão e broncoaspiração com escalas e classificações registradas.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'ResponseToCareInputs',
      {
        id: 'ResponseToCareInputs',
        name: 'Resposta aos Cuidados e Intervenções',
        category: 'hygiene_care',
        description: 'Resposta factual e explícita observada após intervenções de enfermagem.',
        supportsProfiles: ['nurse', 'technician'],
      },
    ],
    [
      'NurseSynthesisInputs',
      {
        id: 'NurseSynthesisInputs',
        name: 'Síntese de Enfermagem',
        category: 'synthesis',
        description: 'Síntese clínica e julgamento profissional privativo do Enfermeiro.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'EvolutionStatusInputs',
      {
        id: 'EvolutionStatusInputs',
        name: 'Situação Atual e Alterações em Relação ao Plantão Anterior',
        category: 'synthesis',
        description: 'Alterações observadas e situação do paciente ao final do registro.',
        supportsProfiles: ['nurse'],
      },
    ],
    // Wound Assessment Components
    [
      'WoundEvaluationContextInputs',
      {
        id: 'WoundEvaluationContextInputs',
        name: 'Contexto da Avaliação de Feridas',
        category: 'context',
        description: 'Data, hora, unidade e leito.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundEvaluationTypeInputs',
      {
        id: 'WoundEvaluationTypeInputs',
        name: 'Tipo de Avaliação',
        category: 'assessment',
        description: 'Avaliação inicial, reavaliação ou acompanhamento evolutivo.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundIdentificationInputs',
      {
        id: 'WoundIdentificationInputs',
        name: 'Identificação da Lesão',
        category: 'assessment',
        description: 'Etiologia/tipo da lesão e número.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundAnatomicalLocationInputs',
      {
        id: 'WoundAnatomicalLocationInputs',
        name: 'Localização Anatômica',
        category: 'assessment',
        description: 'Região anatômica da ferida.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundLateralityInputs',
      {
        id: 'WoundLateralityInputs',
        name: 'Lateralidade',
        category: 'assessment',
        description: 'Lateralidade anatômica.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundReportedDurationInputs',
      {
        id: 'WoundReportedDurationInputs',
        name: 'Tempo de Existência Informado',
        category: 'assessment',
        description: 'Tempo informado da ferida.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundReportedOriginInputs',
      {
        id: 'WoundReportedOriginInputs',
        name: 'Origem Informada',
        category: 'assessment',
        description: 'Origem e histórico de aquisição.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundMeasurementsInputs',
      {
        id: 'WoundMeasurementsInputs',
        name: 'Medidas da Lesão',
        category: 'assessment',
        description: 'Comprimento, largura e profundidade em cm.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundBedInputs',
      {
        id: 'WoundBedInputs',
        name: 'Características do Leito',
        category: 'assessment',
        description: 'Tecidos granulação, esfacelo, necrose, epitelização.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundEdgesInputs',
      {
        id: 'WoundEdgesInputs',
        name: 'Bordas',
        category: 'assessment',
        description: 'Características das bordas da lesão.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'PerilesionalSkinInputs',
      {
        id: 'PerilesionalSkinInputs',
        name: 'Pele ao Redor',
        category: 'assessment',
        description: 'Condição da pele perilesional.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundExudateInputs',
      {
        id: 'WoundExudateInputs',
        name: 'Exsudato',
        category: 'assessment',
        description: 'Presença, tipo e quantidade de exsudato.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundOdorInputs',
      {
        id: 'WoundOdorInputs',
        name: 'Odor',
        category: 'assessment',
        description: 'Presença e características de odor.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundPainInputs',
      {
        id: 'WoundPainInputs',
        name: 'Dor Relacionada',
        category: 'assessment',
        description: 'Avaliação de dor na ferida com escala e escore.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundStagingInputs',
      {
        id: 'WoundStagingInputs',
        name: 'Classificação / Estadiamento Informado',
        category: 'synthesis',
        description: 'Estadiamento inserido privativamente pelo enfermeiro.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundTunnelingInputs',
      {
        id: 'WoundTunnelingInputs',
        name: 'Túneis e Descolamentos',
        category: 'assessment',
        description: 'Presença de fístulas, túneis ou descolamentos.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundObservedSignsInputs',
      {
        id: 'WoundObservedSignsInputs',
        name: 'Sinais Observados',
        category: 'assessment',
        description: 'Sinais clínicos locais observados.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundRelatedDevicesInputs',
      {
        id: 'WoundRelatedDevicesInputs',
        name: 'Dispositivos Relacionados',
        category: 'devices',
        description: 'Dispositivos associados ao sítio da lesão.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundCurrentCoveringInputs',
      {
        id: 'WoundCurrentCoveringInputs',
        name: 'Cobertura Atual Encontrada',
        category: 'hygiene_care',
        description: 'Cobertura encontrada na inspeção inicial.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundDressingProcedureInputs',
      {
        id: 'WoundDressingProcedureInputs',
        name: 'Curativo Realizado',
        category: 'hygiene_care',
        description: 'Técnica, solução e procedimento de curativo executado.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundProductsUsedInputs',
      {
        id: 'WoundProductsUsedInputs',
        name: 'Produtos Utilizados',
        category: 'hygiene_care',
        description: 'Produtos e coberturas terapêuticas aplicados.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundObservedResponseInputs',
      {
        id: 'WoundObservedResponseInputs',
        name: 'Resposta Observada',
        category: 'hygiene_care',
        description: 'Tolerância e resposta do paciente ao curativo.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundPreviousComparisonInputs',
      {
        id: 'WoundPreviousComparisonInputs',
        name: 'Comparação com Avaliação Anterior',
        category: 'synthesis',
        description: 'Comparação evolutiva com avaliação prévia.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundNurseConductInputs',
      {
        id: 'WoundNurseConductInputs',
        name: 'Conduta Registrada pelo Enfermeiro',
        category: 'synthesis',
        description: 'Programação de troca e orientações do enfermeiro.',
        supportsProfiles: ['nurse'],
      },
    ],
    [
      'WoundAdditionalInfoInputs',
      {
        id: 'WoundAdditionalInfoInputs',
        name: 'Informações Adicionais',
        category: 'context',
        description: 'Observações adicionais de enfermagem.',
        supportsProfiles: ['nurse'],
      },
    ],
  ]);

  static getAll(): ClinicalComponentDescriptor[] {
    return Array.from(this.registry.values());
  }

  static get(id: string): ClinicalComponentDescriptor | undefined {
    return this.registry.get(id);
  }

  static has(id: string): boolean {
    return this.registry.has(id);
  }
}
