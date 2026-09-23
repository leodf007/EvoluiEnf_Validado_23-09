/**
 * PrivacyGuard - Privacy by Default Layer
 * 
 * Protege ativamente a privacidade de pacientes e clientes.
 * Não armazena dados identificáveis e anonimiza rigorosamente antes de qualquer
 * processamento linguístico ou processamento por modelos de Inteligência Artificial.
 */

// Regex patterns para detecção de PII
const CPF_PATTERN = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b(?:CPF:?\s*)(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})\b/gi;
const RG_PATTERN = /\b(?:RG:?\s*)(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]|\d{7,10})\b/gi;
const CNS_PATTERN = /\b(?:CNS:?\s*)(\d{15})\b/gi;
const PRONTUARIO_PATTERN = /\b(?:prontu[aá]rio:?\s*|pront\.?:?\s*)(\d{4,12})\b/gi;
const PHONE_PATTERN = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})\b/g;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const CEP_PATTERN = /\b\d{5}-\d{3}\b/g;
const ADDRESS_PATTERN = /\b(?:rua|r\.|avenida|av\.|alameda|travessa|rodovia|bairro|estrada)\s+([A-ZÁ-Úa-zá-ú0-9\s,\.º°]+?)(?=(?:,\s*\d+|\s+n[ºo°]?\s*\d+|(?:\s+-\s+)|$|\.|\n))/gi;

// Palavras comuns em contexto clínico que NÃO devem ser tratadas como nomes
const CLINICAL_STOPWORDS = new Set([
  'de', 'da', 'do', 'dos', 'das', 'e', 'em', 'com', 'sem', 'por', 'para', 'a', 'o', 'as', 'os', 'no', 'na', 'nos', 'nas',
  'paciente', 'leito', 'quarto', 'enfermaria', 'uti', 'ps', 'pa', 'consulta', 'box',
  'evolucao', 'anotacao', 'admissao', 'alta', 'obito', 'transferencia',
  'sinais', 'vitais', 'pressao', 'arterial', 'frequencia', 'cardiaca', 'respiratoria',
  'dor', 'febre', 'tosse', 'dispneia', 'glasgow', 'braden', 'morse', 'eva',
  'medicacao', 'enfermagem', 'medico', 'medica', 'enfermeiro', 'enfermeira',
  'tecnico', 'tecnica', 'plantao', 'turno', 'manha', 'tarde', 'noite',
  'bem', 'mal', 'queixa', 'queixas', 'estavel', 'estável', 'calmo', 'agitado',
  'lucido', 'lúcido', 'orientado', 'desorientado', 'eupneico', 'dispneico',
  'sonolento', 'sedado', 'letargico', 'letárgico', 'torporoso', 'comatoso',
  'afebril', 'febril', 'normotenso', 'hipertenso', 'hipotenso', 'normocardico',
  'taquicardico', 'bradicardico', 'taquipneico', 'bradipneico', 'repouso',
  'deambula', 'deambulando', 'restrito', 'aceita', 'aceitou', 'recusa', 'recusou',
  'dieta', 'diurese', 'evacuacao', 'evacuação', 'curativo', 'acesso', 'cateter',
  'mantem', 'mantém', 'refere', 'apresenta', 'recebo', 'admito', 'encaminhado',
  'consciente', 'cooperativo', 'comunicativo'
]);

/**
 * Converte um nome completo em iniciais formatadas.
 * Exemplo: "João Carlos da Silva" -> "J.C.S."
 */
export function convertNameToInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (parts.length === 0) return '';
  if (parts.length === 1 && parts[0].includes('.')) {
    return parts[0].toUpperCase();
  }

  const initials = parts
    .filter((part) => !CLINICAL_STOPWORDS.has(part.toLowerCase()))
    .map((part) => part.charAt(0).toUpperCase());

  return initials.join('.') + (initials.length > 0 ? '.' : '');
}

/**
 * Detecta e converte nomes completos que apareçam precedidos de rótulos (Paciente, Sr., Sra.)
 * ou sequências de nomes próprios em iniciais.
 * 
 * Exemplo:
 * Entrada: "Paciente João Carlos Silva, CPF 000.000.000-00"
 * Saída: "Paciente J.C.S., [CPF REMOVIDO]"
 */
export function maskFullNames(text: string): string {
  if (!text) return '';

  // 1. Padrão explícito: "Paciente [Nome Completo]" ou "Cliente [Nome Completo]"
  // Respeita caixa alta em nomes próprios e não mascara sentenças com termos clínicos.
  let cleaned = text.replace(
    /\b(Paciente|paciente|Cliente|cliente|Usu[aá]rio|usu[aá]rio|Sr\.|sr\.|Sra\.|sra\.|Acompanhante|acompanhante)\s+([A-ZÁ-Ú][a-zà-ú]+(?:\s+(?:de|da|do|dos|das|e|[A-ZÁ-Ú][a-zà-ú]+))+)/g,
    (match, prefix, name) => {
      const words = name.toLowerCase().split(/\s+/).filter((w) => !['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'no', 'na'].includes(w));
      const hasClinicalWord = words.some((w) => CLINICAL_STOPWORDS.has(w));
      if (hasClinicalWord) {
        return match;
      }
      const initials = convertNameToInitials(name);
      return `${prefix} ${initials}`;
    }
  );

  return cleaned;
}

/**
 * Anonimiza qualquer texto clínico, removendo CPF, Telefones, Documentos, Endereços
 * e convertendo nomes próprios para iniciais.
 */
export function anonymizeText(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // 1. Anonimizar nomes completos identificados
  sanitized = maskFullNames(sanitized);

  // 2. Remover CPFs
  sanitized = sanitized.replace(CPF_PATTERN, (match) => {
    // Se precedido de rótulo CPF, mantém o rótulo
    return match.toLowerCase().includes('cpf') ? 'CPF: [ANONIMIZADO]' : '[CPF REMOVIDO]';
  });

  // 3. Remover RG e CNS
  sanitized = sanitized.replace(RG_PATTERN, 'RG: [ANONIMIZADO]');
  sanitized = sanitized.replace(CNS_PATTERN, 'CNS: [ANONIMIZADO]');
  sanitized = sanitized.replace(PRONTUARIO_PATTERN, 'Prontuário: [ANONIMIZADO]');

  // 4. Remover E-mails
  sanitized = sanitized.replace(EMAIL_PATTERN, '[EMAIL REMOVIDO]');

  // 5. Remover Telefones
  sanitized = sanitized.replace(PHONE_PATTERN, (match) => {
    // Evitar falsos positivos como 120/80 ou valores decimais
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      return '[TEL REMOVIDO]';
    }
    return match;
  });

  // 6. Remover CEP e endereços residenciais
  sanitized = sanitized.replace(CEP_PATTERN, '[CEP REMOVIDO]');
  sanitized = sanitized.replace(ADDRESS_PATTERN, (match) => {
    return '[ENDEREÇO REMOVIDO]';
  });

  return sanitized;
}

/**
 * Percorre recursivamente qualquer estrutura de dados clínica (objeto, lista, string)
 * e aplica o filtro de anonimização em todos os campos de texto.
 */
export function sanitizeClinicalData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return anonymizeText(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeClinicalData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeClinicalData(value);
    }
    return sanitizedObj as T;
  }

  return data;
}

/**
 * Verifica se uma determinada string contém dados potencialmente identificáveis (PII).
 */
export function hasPII(text: string): boolean {
  if (!text) return false;
  return (
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(text) ||
    /\b(?:CPF:?\s*)(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})\b/i.test(text) ||
    /\b(?:RG:?\s*)(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]|\d{7,10})\b/i.test(text) ||
    /\b(?:CNS:?\s*)(\d{15})\b/i.test(text) ||
    /\b(?:prontu[aá]rio:?\s*|pront\.?:?\s*)(\d{4,12})\b/i.test(text) ||
    EMAIL_PATTERN.test(text) ||
    /\b\d{5}-\d{3}\b/.test(text) ||
    /\b(paciente|cliente)\s+[A-ZÁ-Ú][a-zá-ú]+\s+[A-ZÁ-Ú][a-zá-ú]+/i.test(text)
  );
}

/**
 * Validação prévia da identificação de atendimento para alertar o profissional
 * caso ele tenha digitado um nome completo em vez de iniciais ou código interno.
 */
export function validateAnonymousIdentifier(rawInput: string): {
  isSafe: boolean;
  suggestedInitials: string;
  message?: string;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { isSafe: true, suggestedInitials: '' };
  }

  // Verifica se contém 2 ou mais palavras com letras (nome completo)
  const words = trimmed.split(/\s+/).filter((w) => w.length > 1);
  const suggested = convertNameToInitials(trimmed);

  if (words.length >= 2 && !trimmed.includes('.')) {
    return {
      isSafe: false,
      suggestedInitials: suggested,
      message:
        'Por questões de sigilo e conformidade com a LGPD, recomendamos utilizar apenas as iniciais do paciente (ex: ' +
        suggested +
        ') ou um identificador de leito/código interno.',
    };
  }

  return {
    isSafe: true,
    suggestedInitials: suggested || trimmed.toUpperCase(),
  };
}

export const PrivacyGuard = {
  hasPII,
  anonymizeText,
  sanitizeClinicalInput: anonymizeText,
  maskFullNames,
  sanitizeClinicalData,
  convertNameToInitials,
  validateAnonymousIdentifier,
};
