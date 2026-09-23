import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  ModeloEnfermagem,
  CategoriaModelo,
  FavoriteModelRecord,
  NivelAcessoModelo,
} from '../types/models';
import { PlanoAssinatura } from '../types';

const MODELOS_COLLECTION = 'modelos';
const FAVORITES_COLLECTION = 'favoriteModels';
const FAVORITES_LOCAL_KEY = 'evoluienf_favorite_models';

/**
 * Catálogo padrão de Modelos de Enfermagem estruturados com versão e auditoria.
 * Total conformidade com a segurança clínica:
 * - Sem criação de diagnósticos médicos nosológicos
 * - Sem prescrição medicamentosa
 * - Focado estritamente na sistematização da assistência e documentação de enfermagem
 */
export const MODELOS_PADRAO: ModeloEnfermagem[] = [
  // 1) UTI
  {
    id: 'mod-uti-vm-01',
    categoria: 'UTI',
    titulo: 'Paciente Crítico em Suporte Ventilatório Invasivo',
    descricao: 'Roteiro de enfermagem para monitoramento de via aérea avançada, parâmetros ventilatórios, sincronia e vigilância de lesões.',
    tipoRegistro: 'Evolução SOAP',
    moduloDestino: 'nurse-soap',
    nivelAcesso: 'premium',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-03-01T08:00:00.000Z',
    dataAtualizacao: '2026-03-10T12:00:00.000Z',
    focoClinico: 'Ventilação mecânica, sedação, integridade de fixação de TOT e ausculta respiratória.',
    cuidadosPrincipais: [
      'Checagem da pressão do cuff do tubo orotraqueal a cada plantão (20-30 cmH2O)',
      'Aspirar secreções sob demanda técnica em sistema fechado',
      'Manter cabeceira elevada a 30-45 graus para prevenção de broncoaspiração',
      'Higiene oral com clorexidina aquosa conforme protocolo institucional',
    ],
    camposNecessarios: [
      { id: 'vm_modo', rotulo: 'Modo Ventilatório e Parâmetros', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: VCV, Volume 420ml, PEEP 8, FiO2 40%' },
      { id: 'tot_fixacao', rotulo: 'Calibre e Fixação do TOT (cm na rima)', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: Tubo nº 8.0, fixado a 22 cm da rima labial' },
      { id: 'sedacao_nivel', rotulo: 'Escala de Sedação / Agitação (RASS/SAS)', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Nível observado no momento da avaliação', opcoesSugeridas: ['RASS -5 (Não responsivo)', 'RASS -4 (Sedação profunda)', 'RASS -3 (Sedação moderada)', 'RASS -2 (Sedação leve)', 'RASS 0 (Alerta e calmo)', 'RASS +1 (Inquieto)'] },
      { id: 'respiratorio_ausculta', rotulo: 'Ausculta Pulmonar e Secreção', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Murmúrios presentes, ruídos adventícios e características de secreção' },
      { id: 'plano_enfermagem', rotulo: 'Plano de Cuidados de Enfermagem', tipo: 'multiplo', obrigatorio: true, secaoSoap: 'P', dica: 'Selecione as metas assistenciais do plantão' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'UTI Geral',
      subjetivoPadrao: 'Paciente sob sedação contínua, impossibilitado de relatar queixas subjetivas.',
      focoObjetivo: 'Via aérea pérvia, parâmetros ventilatórios estáveis, sem assincronias observadas.',
      planoCuidadosBase: [
        'Manter decúbito elevado 30-45º',
        'Monitorar pressão de cuff q8h',
        'Higiene oral q12h com clorexidina 0,12%',
        'Mudança de decúbito programada a cada 2 horas com checagem de coxins',
      ],
    },
  },
  {
    id: 'mod-uti-hemo-02',
    categoria: 'UTI',
    titulo: 'Monitorização Hemodinâmica e Acesso Venoso Central',
    descricao: 'Roteiro de sistematização para avaliação de perfusão tecidual, curativos de CVC/PAI e estabilidade circulatória.',
    tipoRegistro: 'Evolução SOAP',
    moduloDestino: 'nurse-soap',
    nivelAcesso: 'gratuito',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-03-01T08:00:00.000Z',
    dataAtualizacao: '2026-03-05T10:00:00.000Z',
    focoClinico: 'Pressão arterial, tempo de enchimento capilar, sítio de inserção de cateter e diurese.',
    cuidadosPrincipais: [
      'Inspeção do sítio de inserção de cateter central buscando hiperemia ou exsudato',
      'Avaliação do tempo de enchimento capilar periférico (< 3 segundos)',
      'Balanço hídrico rigoroso e débito urinário horário',
    ],
    camposNecessarios: [
      { id: 'cvc_local', rotulo: 'Sítio de Acesso Central e Curativo', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: CVC em VJI direita, curativo estéril limpo e seco' },
      { id: 'perfusao_periferica', rotulo: 'Perfusão e Extremidades', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Avaliação de pulsos e coloração', opcoesSugeridas: ['Extremidades aquecidas, TEC < 3s', 'Extremidades aquecidas, pulsos cheios', 'Extremidades frias, TEC lentificado > 3s', 'Cianose de extremidades discreta'] },
      { id: 'diurese_ritmo', rotulo: 'Débito Urinário e Balanço', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Volume urinário em ml/kg/h ou aspecto em bolsa coletora' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'UTI Coronariana',
      subjetivoPadrao: 'Paciente refere estabilidade e ausência de dor torácica no momento.',
      focoObjetivo: 'Normotenso, extremidades perfundidas, acesso venoso pérvio sem sinais flogísticos.',
    },
  },

  // 2) Clínica Médica
  {
    id: 'mod-clin-estavel-01',
    categoria: 'Clínica Médica',
    titulo: 'Paciente Clínico em Enfermaria Geral',
    descricao: 'Estrutura completa de documentação para pacientes internados em enfermaria com marcha diagnóstica de enfermagem.',
    tipoRegistro: 'Evolução SOAP',
    moduloDestino: 'nurse-soap',
    nivelAcesso: 'gratuito',
    ativo: true,
    versaoModelo: '1.1.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-02-15T09:00:00.000Z',
    dataAtualizacao: '2026-03-12T14:30:00.000Z',
    focoClinico: 'Nível de independência, aceitação alimentar, eliminações e queixas álgicas.',
    cuidadosPrincipais: [
      'Estimulação de deambulação precoce segura ou mudança de decúbito',
      'Verificação e registro dos sinais vitais conforme rotina da enfermaria',
      'Avaliação da integridade cutânea em áreas de apoio',
    ],
    camposNecessarios: [
      { id: 'queixa_principal', rotulo: 'Queixa Subjetiva / Conforto do Paciente', tipo: 'texto', obrigatorio: true, secaoSoap: 'S', dica: 'Relato do paciente sobre dor, repouso, sono e disposição' },
      { id: 'nivel_consciencia', rotulo: 'Nível de Consciência e Orientação', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Estado neurológico global', opcoesSugeridas: ['Lúcido e orientado no tempo e espaço', 'Sonolento, porém responsivo a estímulos', 'Confuso e desorientado temporariamente'] },
      { id: 'alimentacao_diurese', rotulo: 'Aceitação da Dieta e Eliminações', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Dieta via oral aceita, diurese e evacuações presentes' },
      { id: 'acesso_venoso_perif', rotulo: 'Acesso Venoso Periférico', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Local de punção, data e integridade do sítio' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'Enfermaria Clínica',
      subjetivoPadrao: 'Paciente refere repouso noturno adequado, nega dor no momento da visita de enfermagem.',
      focoObjetivo: 'Lúcido, cooperativo, sinais vitais na faixa de normalidade, afebril.',
    },
  },
  {
    id: 'mod-clin-cronico-02',
    categoria: 'Clínica Médica',
    titulo: 'Vigilância de Doenças Crônicas e Suporte de Oxigênio',
    descricao: 'Modelo direcionado para pacientes com suporte de oxigênio por cateter nasal e monitorização de descompensação clínica.',
    tipoRegistro: 'Evolução de Enfermagem',
    moduloDestino: 'clinical-evolution',
    nivelAcesso: 'premium',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-03-02T11:00:00.000Z',
    dataAtualizacao: '2026-03-08T16:00:00.000Z',
    focoClinico: 'Padrão respiratório, saturação periférica, uso de musculatura acessória e queixa de cansaço.',
    cuidadosPrincipais: [
      'Posicionamento em Fowler ou semi-Fowler para otimização da ventilação',
      'Vigilância de lesão por dispositivo em septo nasal e orelhas',
      'Monitorização de SpO2 contínua ou intermitente',
    ],
    camposNecessarios: [
      { id: 'dispositivo_o2', rotulo: 'Dispositivo e Fluxo de O2 (L/min)', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: Cateter nasal tipo óculos a 2 L/min, SpO2 95%' },
      { id: 'esforco_respiratorio', rotulo: 'Padrão e Esforço Respiratório', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Mecânica respiratória observada', opcoesSugeridas: ['Eupneico em repouso', 'Tiragem intercostal leve', 'Taquipneico moderado aos esforços', 'Uso de musculatura acessória ausente'] },
      { id: 'ausculta_pulmonar', rotulo: 'Ausculta Pulmonar e Tosse', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Roncos, sibilos, estertores e tosse produtiva ou seca' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'Unidade de Cuidados Intermediários',
      subjetivoPadrao: 'Paciente relata leve cansaço ao falar frases longas, nega dor torácica.',
    },
  },

  // 3) Feridas
  {
    id: 'mod-fer-lp-01',
    categoria: 'Feridas',
    titulo: 'Avaliação de Lesão por Pressão e Coberturas',
    descricao: 'Roteiro de alta precisão para estadiamento, mensuração, tecido do leito da lesão e plano de curativo.',
    tipoRegistro: 'Avaliação de Feridas',
    moduloDestino: 'nurse-wounds-assessment',
    nivelAcesso: 'gratuito',
    ativo: true,
    versaoModelo: '1.2.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-01-20T10:00:00.000Z',
    dataAtualizacao: '2026-03-11T18:00:00.000Z',
    focoClinico: 'Localização anatômica, tecido de granulação/esfacelo, exsudato e cobertura aplicada.',
    cuidadosPrincipais: [
      'Limpeza de lesão com soro fisiológico a 0,9% em jatos sem fricção lesiva',
      'Aplicação de cobertura protetora ou desbridante conforme prescrição de enfermagem',
      'Alívio de pressão sobre proeminências ósseas com superfícies de redistribuição',
    ],
    camposNecessarios: [
      { id: 'localizacao_lp', rotulo: 'Localização Anatômica da Lesão', tipo: 'texto', obrigatorio: true, dica: 'Ex: Região sacral, trocanter maior direito, calcâneo bilateral' },
      { id: 'estagio_lp', rotulo: 'Estadiamento da Lesão por Pressão', tipo: 'selecao', obrigatorio: true, dica: 'Classificação NPUAP/EPUAP', opcoesSugeridas: ['Estágio 1 - Pele íntegra com eritema não branqueável', 'Estágio 2 - Perda de espessura parcial da derme', 'Estágio 3 - Perda da espessura total da pele', 'Estágio 4 - Perda de espessura total e perda tissular', 'Não Classificável - Coberta por esfacelo ou necrose'] },
      { id: 'tecido_leito', rotulo: 'Tecido Predominante no Leito', tipo: 'texto', obrigatorio: true, dica: 'Ex: 70% tecido de granulação viável, 30% esfacelo amarelado' },
      { id: 'exsudato_aspecto', rotulo: 'Aspecto e Quantidade do Exsudato', tipo: 'selecao', obrigatorio: true, dica: 'Características secretoras', opcoesSugeridas: ['Seroso, quantidade discreta', 'Seroso, quantidade moderada', 'Serossanguinolento, discreto', 'Purulento com odor fétido', 'Ausente / Leito ressecado'] },
      { id: 'cobertura_aplicada', rotulo: 'Cobertura Terapêutica Utilizada', tipo: 'texto', obrigatorio: true, dica: 'Ex: Hidrogel com alginato de cálcio, curativo secundário gaze e filme' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'Comissão de Curativos / Enfermaria',
      focoObjetivo: 'Bordas aderidas, leito em processo de cicatrização, sem hiperemia perilesional extensa.',
    },
  },
  {
    id: 'mod-fer-complexa-02',
    categoria: 'Feridas',
    titulo: 'Protocolo de Feridas Complexas e Terapia Tópica Avançada',
    descricao: 'Registro especializado para lesões crônicas extensas, úlceras venosas/arteriais e terapia por pressão negativa.',
    tipoRegistro: 'Avaliação de Feridas',
    moduloDestino: 'nurse-wounds-assessment',
    nivelAcesso: 'premium',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-03-05T14:00:00.000Z',
    dataAtualizacao: '2026-03-12T09:30:00.000Z',
    focoClinico: 'Medição tridimensional (comprimento x largura x profundidade), tunelizações e pele perilesional.',
    cuidadosPrincipais: [
      'Mensuração periódica com régua estéril descartável para acompanhamento evolutivo',
      'Proteção da pele perilesional com película barreira não alcoólica',
      'Orientação quanto à elevação dos membros e alívio de peso',
    ],
    camposNecessarios: [
      { id: 'dimensoes_lesao', rotulo: 'Dimensões (Comprimento x Largura x Profundidade em cm)', tipo: 'texto', obrigatorio: true, dica: 'Ex: 6.0 cm x 4.5 cm x 0.8 cm' },
      { id: 'pele_perilesional', rotulo: 'Aspecto da Pele Perilesional', tipo: 'selecao', obrigatorio: true, dica: 'Condição da derme circundante', opcoesSugeridas: ['Íntegra, sem alterações', 'Macerada por umidade excessiva', 'Eritematosa e aquecida', 'Descamação e xerose intensa'] },
      { id: 'dor_ao_curativo', rotulo: 'Escala de Dor Durante o Procedimento', tipo: 'texto', obrigatorio: true, dica: 'Intensidade de 0 a 10 e medidas de conforto empregadas' },
    ],
  },

  // 4) Cirúrgico
  {
    id: 'mod-cir-poi-01',
    categoria: 'Cirúrgico',
    titulo: 'Pós-Operatório Imediato e Ferida Operatória',
    descricao: 'Roteiro de sistematização para recepção e vigilância nas primeiras 24 horas pós-intervenção cirúrgica.',
    tipoRegistro: 'Evolução SOAP',
    moduloDestino: 'nurse-soap',
    nivelAcesso: 'gratuito',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-02-10T10:00:00.000Z',
    dataAtualizacao: '2026-03-01T11:00:00.000Z',
    focoClinico: 'Recuperação anestésica, dor pós-operatória, sítio cirúrgico limpo e queixas nauseosas.',
    cuidadosPrincipais: [
      'Monitorização rigorosa da ferida operatória quanto a sangramentos ou deiscências',
      'Avaliação da presença de ruídos hidroaéreos e tolerância à retomada de dieta',
      'Controle de náuseas/vômitos e medidas de conforto postural',
    ],
    camposNecessarios: [
      { id: 'ferida_operatoria_aspecto', rotulo: 'Ferida Operatória / Curativo Cirúrgico', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: Curativo oclusivo limpo e seco, sem sangramento ativo' },
      { id: 'dor_pos_op', rotulo: 'Nível de Dor Avaliado (Escala EVA)', tipo: 'texto', obrigatorio: true, secaoSoap: 'S', dica: 'Localização e intensidade relatada pelo paciente' },
      { id: 'eliminacoes_miccao', rotulo: 'Retomada de Diurese e Eliminações', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Micção espontânea pós-operatória presente ou via cateter' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'Clínica Cirúrgica',
      subjetivoPadrao: 'Paciente refere dor moderada controlada em ferida operatória, nega náuseas.',
      focoObjetivo: 'Lúcido, acordado, curativo cirúrgico seco, abdome normotenso.',
    },
  },
  {
    id: 'mod-cir-drenos-02',
    categoria: 'Cirúrgico',
    titulo: 'Vigilância de Drenos Cirúrgicos e Cateteres Invasivos',
    descricao: 'Acompanhamento do débito, tipo de drenagem e fixação de drenos de sucção e tubulares.',
    tipoRegistro: 'Evolução de Enfermagem',
    moduloDestino: 'surgical-clinic-evolution',
    nivelAcesso: 'premium',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-03-04T12:00:00.000Z',
    dataAtualizacao: '2026-03-09T15:00:00.000Z',
    focoClinico: 'Drenos de sucção (Portovac, Jackson-Pratt, dreno de tórax) e balanço de perda.',
    cuidadosPrincipais: [
      'Mensuração e registro quantitativo e qualitativo do efluente drenado',
      'Manutenção de vácuo ativo em drenos de sucção fechada',
      'Troca e esterilização de conexões e curativo ao redor do óstio do dreno',
    ],
    camposNecessarios: [
      { id: 'tipo_dreno', rotulo: 'Tipo de Dreno e Local de Inserção', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: Dreno de aspiração contínua em flanco direito' },
      { id: 'debito_aspecto', rotulo: 'Débito (ml) e Aspecto do Efluente', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: 80 ml em 12h, aspecto serossanguinolento límpido' },
      { id: 'ostio_condicao', rotulo: 'Condição do Óstio e Fixação', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Pele ao redor do orifício', opcoesSugeridas: ['Pele íntegra, ponto de fixação firme', 'Leve hiperemia perióstio sem secreção', 'Presença de secreção serosa ao redor do dreno'] },
    ],
  },

  // 5) Pediatria
  {
    id: 'mod-ped-aloj-01',
    categoria: 'Pediatria',
    titulo: 'Paciente Pediátrico em Alojamento Conjunto / Enfermaria',
    descricao: 'Estrutura acolhedora de enfermagem para acompanhamento do binômio cuidador-criança e marcos do desenvolvimento.',
    tipoRegistro: 'Evolução de Enfermagem',
    moduloDestino: 'pediatric-clinic-evolution',
    nivelAcesso: 'gratuito',
    ativo: true,
    versaoModelo: '1.1.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-01-25T13:00:00.000Z',
    dataAtualizacao: '2026-03-06T17:00:00.000Z',
    focoClinico: 'Interação com cuidador, aceitação de dieta, diurese em fralda e padrão de sono.',
    cuidadosPrincipais: [
      'Acolhimento da família e orientações quanto a sinais de alerta de desidratação',
      'Registro do peso diário e cálculo de trocas de fralda com balanço hídrico',
      'Garantia de ambiente calmo e incentivo à amamentação ou dieta pediátrica',
    ],
    camposNecessarios: [
      { id: 'relato_cuidador', rotulo: 'Relato do Cuidador / Acompanhante', tipo: 'texto', obrigatorio: true, secaoSoap: 'S', dica: 'Mãe/Pai relata aceitação da mamada, sono e episódios de choro' },
      { id: 'comportamento_infantil', rotulo: 'Comportamento e Nível de Atividade', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Reatividade da criança', opcoesSugeridas: ['Ativo, reativo, consolável pelo cuidador', 'Hipoativo, sonolento aos estímulos', 'Choro vigoroso e contínuo, irritadiço', 'Dormindo tranquilamente ao exame'] },
      { id: 'hidratacao_diurese', rotulo: 'Estado de Hidratação e Fraldas Molhadas', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Mucosas úmidas, fontanela plana, número de fraldas com diurese' },
    ],
    sugestoesPreenchimento: {
      setorSugerido: 'Pediatria Geral',
      subjetivoPadrao: 'Acompanhante relata que a criança aceitou bem a mamadeira e não apresentou febre.',
      focoObjetivo: 'Criança acordada, corada, hidratada, ausculta limpa, afebril.',
    },
  },
  {
    id: 'mod-ped-respiratorio-02',
    categoria: 'Pediatria',
    titulo: 'Vigilância Respiratória Pediátrica e Sinais de Esforço',
    descricao: 'Roteiro especializado para avaliação sistemática de tiragem, batimento de asa de nariz e estridor.',
    tipoRegistro: 'Evolução SOAP',
    moduloDestino: 'nurse-soap',
    nivelAcesso: 'premium',
    ativo: true,
    versaoModelo: '1.0.0',
    criadoPor: 'Comitê Clínico EvoluiEnf',
    dataCriacao: '2026-03-07T11:30:00.000Z',
    dataAtualizacao: '2026-03-12T10:00:00.000Z',
    focoClinico: 'Boletim de Silverman-Andersen / Downes adaptado, padrão ventilatório e conforto respiratório.',
    cuidadosPrincipais: [
      'Posicionamento confortável com coxim sob ombros para manter via aérea pérvia',
      'Desobstrução e aspiração suave de narinas com solução salina antes da alimentação',
      'Manter oxigenoterapia aquecida e umidificada quando prescrita',
    ],
    camposNecessarios: [
      { id: 'sinais_esforco_ped', rotulo: 'Sinais de Desconforto Respiratório', tipo: 'selecao', obrigatorio: true, secaoSoap: 'O', dica: 'Presença de mecânica alterada', opcoesSugeridas: ['Sem sinais de desconforto respiratório', 'Tiragem subcostal discreta', 'Tiragem intercostal e batimento de asa nasal', 'Gemência respiratória audível'] },
      { id: 'ausculta_pediatrica', rotulo: 'Ausculta Pulmonar Pediátrica', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: Murmúrios vesiculares presentes bilateralmente com roncos difusos' },
      { id: 'oxigenacao_ped', rotulo: 'Saturação de O2 e Suporte', tipo: 'texto', obrigatorio: true, secaoSoap: 'O', dica: 'Ex: SpO2 96% em ar ambiente ou sob cateter nasal a 1 L/min' },
    ],
  },
];

const inMemoryFavorites: Record<string, FavoriteModelRecord[]> = {};

/**
 * Lê favoritos locais armazenados no navegador (ou fallback seguro).
 */
function readLocalFavorites(usuarioId: string): FavoriteModelRecord[] {
  if (typeof localStorage === 'undefined') {
    return inMemoryFavorites[usuarioId] || [];
  }
  try {
    const raw = localStorage.getItem(`${FAVORITES_LOCAL_KEY}_${usuarioId}`);
    if (!raw) return inMemoryFavorites[usuarioId] || [];
    return JSON.parse(raw);
  } catch {
    return inMemoryFavorites[usuarioId] || [];
  }
}

function writeLocalFavorites(usuarioId: string, favorites: FavoriteModelRecord[]): void {
  inMemoryFavorites[usuarioId] = favorites;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${FAVORITES_LOCAL_KEY}_${usuarioId}`, JSON.stringify(favorites));
  } catch {
    // Silently ignore storage failures
  }
}

export const ModelService = {
  /**
   * Lista todos os modelos disponíveis, opcionalmente filtrando por categoria.
   */
  listarModelos(categoria?: CategoriaModelo): ModeloEnfermagem[] {
    const ativos = MODELOS_PADRAO.filter((m) => m.ativo);
    if (!categoria) return ativos;
    return ativos.filter((m) => m.categoria === categoria);
  },

  /**
   * Busca um modelo específico pelo seu identificador único.
   */
  buscarModeloPorId(id: string): ModeloEnfermagem | null {
    return MODELOS_PADRAO.find((m) => m.id === id && m.ativo) || null;
  },

  /**
   * Lista categorias disponíveis na biblioteca.
   */
  listarCategorias(): CategoriaModelo[] {
    return ['UTI', 'Clínica Médica', 'Feridas', 'Cirúrgico', 'Pediatria'];
  },

  /**
   * Verifica se o plano do usuário permite utilizar o modelo.
   */
  podeAcessarModelo(modelo: ModeloEnfermagem, plano?: PlanoAssinatura): boolean {
    if (modelo.nivelAcesso === 'gratuito') return true;
    if (!plano) return false;
    const planosPremium: PlanoAssinatura[] = ['Pro', 'Premium', 'Profissional', 'Hospitalar'];
    return planosPremium.includes(plano);
  },

  /**
   * Lista os modelos favoritados por um usuário (síncrono via cache local com sincronização Firestore).
   */
  listarFavoritos(usuarioId: string): FavoriteModelRecord[] {
    return readLocalFavorites(usuarioId);
  },

  /**
   * Lista favoritos consultando o Firestore com fallback para cache local.
   */
  async listarFavoritosAsync(usuarioId: string): Promise<FavoriteModelRecord[]> {
    const local = readLocalFavorites(usuarioId);
    try {
      const q = query(
        collection(db, FAVORITES_COLLECTION),
        where('usuarioId', '==', usuarioId)
      );
      const snapshot = await getDocs(q);
      const remote = snapshot.docs.map((d) => d.data() as FavoriteModelRecord);
      if (remote.length > 0) {
        writeLocalFavorites(usuarioId, remote);
        return remote;
      }
    } catch {
      // Retorna fallback local em caso de erro de conexão
    }
    return local;
  },

  /**
   * Verifica se um modelo está favoritado pelo usuário.
   */
  isFavorito(usuarioId: string, modeloId: string): boolean {
    const favs = readLocalFavorites(usuarioId);
    return favs.some((f) => f.modeloId === modeloId);
  },

  /**
   * Adiciona um modelo aos favoritos do usuário.
   */
  async adicionarFavorito(
    usuarioId: string,
    modeloId: string,
    nomePersonalizado?: string
  ): Promise<FavoriteModelRecord> {
    const id = `fav-${usuarioId}_${modeloId}`;
    const novoFavorito: FavoriteModelRecord = {
      id,
      usuarioId,
      modeloId,
      nomePersonalizado: nomePersonalizado?.trim() || undefined,
      dataCriacao: new Date().toISOString(),
    };

    // 1. Atualiza cache local imediatamente
    const favs = readLocalFavorites(usuarioId);
    const atualizados = favs.filter((f) => f.modeloId !== modeloId).concat(novoFavorito);
    writeLocalFavorites(usuarioId, atualizados);

    // 2. Persiste no Firestore
    try {
      const docRef = doc(db, FAVORITES_COLLECTION, id);
      await setDoc(docRef, novoFavorito);
    } catch (err) {
      console.warn('Falha ao persistir favorito no Firestore (mantido localmente):', err);
    }

    return novoFavorito;
  },

  /**
   * Remove um modelo dos favoritos do usuário.
   */
  async removerFavorito(usuarioId: string, modeloId: string): Promise<boolean> {
    const favs = readLocalFavorites(usuarioId);
    const atualizados = favs.filter((f) => f.modeloId !== modeloId);
    writeLocalFavorites(usuarioId, atualizados);

    try {
      const id = `fav-${usuarioId}_${modeloId}`;
      const docRef = doc(db, FAVORITES_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn('Falha ao remover favorito do Firestore:', err);
      return true;
    }
  },

  /**
   * Atualiza o nome personalizado de um modelo favorito.
   */
  async renomearFavorito(
    usuarioId: string,
    modeloId: string,
    novoNome: string
  ): Promise<FavoriteModelRecord | null> {
    const favs = readLocalFavorites(usuarioId);
    const item = favs.find((f) => f.modeloId === modeloId);
    if (!item) return null;

    const atualizado: FavoriteModelRecord = {
      ...item,
      nomePersonalizado: novoNome.trim() || undefined,
    };

    const novosFavs = favs.map((f) => (f.modeloId === modeloId ? atualizado : f));
    writeLocalFavorites(usuarioId, novosFavs);

    try {
      const id = `fav-${usuarioId}_${modeloId}`;
      const docRef = doc(db, FAVORITES_COLLECTION, id);
      await setDoc(docRef, atualizado, { merge: true });
    } catch (err) {
      console.warn('Falha ao atualizar apelido do favorito no Firestore:', err);
    }

    return atualizado;
  },
};
