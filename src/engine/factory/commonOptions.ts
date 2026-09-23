/**
 * Common, centralized option sets for clinical forms in EvoluiEnf.
 * 
 * ZERO CLINICAL DEFAULT POLICY:
 * None of these option sets contain or imply a pre-selected default value.
 * Forms must always initialize empty (""), representing "Dado não informado".
 */

export const precautionOptions = [
  'Padrão',
  'Contato',
  'Gotículas',
  'Aerossóis',
  'Reversa / Protetora',
] as const;

export const accompanimentOptions = [
  'Sozinho',
  'Com acompanhante',
  'Com familiar',
  'Com cuidador',
  'Com equipe de resgate / SAMU',
  'Com equipe policial / escolta',
] as const;

export const consciousnessOptions = [
  'Consciente',
  'Sonolento',
  'Torporoso',
  'Comatoso',
  'Sedado',
  'Confuso',
  'Agitado',
] as const;

export const orientationOptions = [
  'Orientado em tempo e espaço',
  'Desorientado em tempo',
  'Desorientado em espaço',
  'Desorientado em tempo e espaço',
  'Não avaliado / Não responsivo',
] as const;

export const respiratorySupportOptions = [
  'Ar ambiente',
  'Cateter nasal de O2',
  'Máscara de Venturi',
  'Máscara não reinalante com reservatório',
  'Cânula nasal de alto fluxo (CNAF)',
  'Ventilação não invasiva (VNI)',
  'Ventilação mecânica invasiva',
] as const;

export const edemaOptions = [
  'Ausente',
  'Presente em MMII',
  'Presente em MMSS',
  'Presente em região sacra',
  'Anasarca',
  'Presente periorbital / facial',
] as const;

export const bathOptions = [
  'Banho de aspersão (chuveiro) sem auxílio',
  'Banho de aspersão com auxílio',
  'Banho de aspersão em cadeira higiênica',
  'Banho no leito',
  'Higiene íntima / corporal no leito',
  'Não realizado',
] as const;

export const complicationOptions = [
  'Não',
  'Sim',
] as const;

export const communicationTargets = [
  'Enfermeiro responsável',
  'Equipe médica do setor',
  'Médico plantonista',
  'Equipe multidisciplinar',
  'Coordenação de enfermagem',
] as const;
