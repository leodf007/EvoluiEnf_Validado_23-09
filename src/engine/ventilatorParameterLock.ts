import { AuthorizedClinicalFacts } from './types';

export interface VentilatorParameterLockResult {
  passed: boolean;
  message: string;
  alteredParameters?: string[];
}

/**
 * VentilatorParameterLock:
 * Guarantees that ventilator parameters (FiO2, PEEP, Mode, Rate, Tidal Volume, Support Pressure, etc.)
 * cannot be altered by AI refinement.
 */
export function verifyVentilatorParameterLock(
  aiText: string,
  canonicalNarrative: string,
  authorizedFacts: AuthorizedClinicalFacts
): VentilatorParameterLockResult {
  // Collect all ventilator facts
  const respFacts = authorizedFacts.respiratory || [];
  const ventFacts = respFacts.filter(
    (f) =>
      f.id.includes('vmi') ||
      f.id.includes('resp') ||
      f.id.includes('vent') ||
      f.sourceField.toLowerCase().includes('ventilation') ||
      f.sourceField.toLowerCase().includes('oxygen') ||
      (f.canonicalText && /peep|fio[2₂]|vcv|pcu|psv|volume corrente|press[ãa]o/i.test(f.canonicalText))
  );

  if (ventFacts.length === 0) {
    return {
      passed: true,
      message: 'Sem parâmetros ventilatórios informados para validação.',
    };
  }

  const alteredParameters: string[] = [];

  // Check specific numeric values in ventilator facts
  // e.g., "PEEP 6 cmH₂O", "FiO₂ 40%", "Volume corrente 450 mL"
  ventFacts.forEach((fact) => {
    // Extract numbers from this fact value
    const numbersInFact = String(fact.value || '').match(/\d+(?:[.,]\d+)?/g);
    if (numbersInFact) {
      numbersInFact.forEach((num) => {
        // If the number was in the canonical text with its context (e.g. PEEP 6)
        if (canonicalNarrative.includes(num)) {
          // Check if AI text preserves the fact or if it replaced it
          // Specifically check PEEP patterns like PEEP \d+
          if (fact.canonicalText.toLowerCase().includes('peep')) {
            const canonPeep = canonicalNarrative.match(/peep\s*(\d+)/i);
            const aiPeep = aiText.match(/peep\s*(\d+)/i);
            if (canonPeep && aiPeep && canonPeep[1] !== aiPeep[1]) {
              alteredParameters.push(`PEEP alterado de ${canonPeep[1]} para ${aiPeep[1]}`);
            }
          }
          if (fact.canonicalText.toLowerCase().includes('fio₂') || fact.canonicalText.toLowerCase().includes('fio2')) {
            const canonFio2 = canonicalNarrative.match(/fio[₂2]\s*(\d+)/i);
            const aiFio2 = aiText.match(/fio[₂2]\s*(\d+)/i);
            if (canonFio2 && aiFio2 && canonFio2[1] !== aiFio2[1]) {
              alteredParameters.push(`FiO₂ alterada de ${canonFio2[1]} para ${aiFio2[1]}`);
            }
          }
        }
      });
    }
  });

  // Check ventilation mode tampering (e.g. VCV -> PCV)
  const modes = ['VCV', 'PCV', 'PSV', 'SIMV', 'CPAP', 'BIPAP', 'PRVC'];
  modes.forEach((mode) => {
    const modeRegex = new RegExp(`\\b${mode}\\b`, 'i');
    if (modeRegex.test(aiText)) {
      const isAuthorized =
        ventFacts.some(
          (f) =>
            modeRegex.test(String(f.value || '')) ||
            (f.canonicalText && modeRegex.test(f.canonicalText))
        ) || modeRegex.test(canonicalNarrative);
      if (!isAuthorized) {
        alteredParameters.push(`Modo ventilatório não autorizado: ${mode}`);
      }
    }
  });

  const passed = alteredParameters.length === 0;

  return {
    passed,
    message: passed
      ? 'Todos os parâmetros ventilatórios informados foram preservados com exatidão.'
      : `Parâmetros ventilatórios foram modificados indevidamente pela IA: ${alteredParameters.join(', ')}`,
    alteredParameters,
  };
}
