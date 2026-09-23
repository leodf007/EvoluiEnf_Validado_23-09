/**
 * Tipos e interfaces do Assistente Inteligente de Enfermagem EvoluiEnf
 */

export interface CompletenessSuggestion {
  id: string;
  campo: string;
  categoria: 'dispositivo' | 'curativo' | 'sinais_vitais' | 'dor' | 'oxigenio' | 'eliminacoes' | 'geral';
  nivel: 'recomendado' | 'atencao' | 'informativo';
  mensagem: string;
  exemploPratico?: string;
}

export interface CompletenessAnalysisResult {
  scoreQualidade: number; // 0 a 100
  totalCamposAnalisados: number;
  camposPreenchidos: number;
  sugestoes: CompletenessSuggestion[];
  alertasConsistencia: string[];
  statusQualidade: 'excelente' | 'adequada' | 'recomenda_revisao';
}

export interface SmartQuestion {
  id: string;
  pergunta: string;
  motivoAssistencial: string;
  categoria: 'consciencia' | 'dor' | 'evolucao' | 'dispositivos' | 'seguranca';
}

export interface NarrativeImprovementResult {
  originalText: string;
  improvedText: string;
  alteracoesLinguisticas: string[];
  fatosPreservados: boolean;
  semDiagnosticoMedico: boolean;
  semPrescricao: boolean;
  aiStatus?: 'used' | 'quota_exceeded' | 'fallback';
  aiNotice?: string;
}

export interface GenerationBasisExplanation {
  titulo: string;
  itensUtilizados: {
    categoria: string;
    icone: 'check' | 'alert' | 'info';
    descricao: string;
    presente: boolean;
  }[];
  modeloUtilizado?: string;
  avisoEtico: string;
}

export interface AIQualityReviewData {
  obrigatoriosPreenchidos: boolean;
  dadosConsistentes: boolean;
  sugestoesMelhoria: string[];
  alertasCriticos: string[];
  score: number;
}
