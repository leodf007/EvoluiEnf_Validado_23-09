import { NursePediatricEvolutionForm } from '../types/nursePediatricEvolution';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { NarrativeFactTrace } from './deterministicNarrativeFactAuditor';
import {
  normalizeNursePediatricEvolutionForm,
  buildAuthorizedNursePediatricEvolutionFacts,
} from './nursePediatricEvolutionFactBuilder';

/**
 * Builds deterministic nursing evolution narrative with fact traces for
 * NURSE_EVOLUTION_PEDIATRICS.
 *
 * CRITICAL SAFETY DIRECTIVES:
 * 1. Consumes ONLY AuthorizedClinicalFacts.
 * 2. Every single sentence maps back 1:1 to a valid authorized factId.
 * 3. Never interprets pediatric data (e.g. no "peso adequado", no percentiles, no z-score).
 * 4. Never calculates BMI or anthropometric adequacy.
 * 5. Preserves manual numbers verbatim (including manual MAP, never calculating it).
 */
export function buildNursePediatricEvolutionNoteWithTrace(facts: AuthorizedClinicalFacts): {
  narrative: string;
  traces: NarrativeFactTrace[];
} {
  const traces: NarrativeFactTrace[] = [];

  const addFactTrace = (f: ClinicalFact, category: string) => {
    if (!f || !f.canonicalText) return;
    const cleanText = f.canonicalText.trim();
    const sentence = cleanText.endsWith('.') ? cleanText : `${cleanText}.`;
    traces.push({
      text: sentence,
      factIds: [f.id],
      category,
    });
  };

  // Parágrafo 1: Contexto, Segurança e Identificação Pediátrica
  const p1Facts = [
    ...(facts.context || []),
    ...(facts.safety || []),
  ];
  p1Facts.forEach((f) => addFactTrace(f, 'context_and_identification'));

  // Parágrafo 2: Avaliação Geral, Comportamento e Sinais Vitais / Dor
  const p2Facts = [
    ...(facts.generalState || []),
    ...(facts.vitalSigns || []),
  ];
  p2Facts.forEach((f) => addFactTrace(f, 'general_and_vitals'));

  // Parágrafo 3: Neurológico, Respiratório e Cardiovascular
  const p3Facts = [
    ...(facts.neurological || []),
    ...(facts.respiratory || []),
    ...(facts.cardiovascular || []),
  ];
  p3Facts.forEach((f) => addFactTrace(f, 'systems_assessment'));

  // Parágrafo 4: Gastrointestinal, Nutrição e Eliminações
  const p4Facts = [
    ...(facts.gastrointestinal || []),
    ...(facts.eliminations || []),
  ];
  p4Facts.forEach((f) => addFactTrace(f, 'nutrition_and_eliminations'));

  // Parágrafo 5: Pele, Curativos e Dispositivos Invasivos
  const p5Facts = [
    ...(facts.skin || []),
    ...(facts.devices || []),
  ];
  p5Facts.forEach((f) => addFactTrace(f, 'skin_and_devices'));

  // Parágrafo 6: Mobilidade, Higiene, Sono e Riscos Assistenciais
  const p6Facts = [
    ...(facts.mobility || []),
    ...(facts.hygiene || []),
    ...(facts.risks || []),
  ];
  p6Facts.forEach((f) => addFactTrace(f, 'mobility_hygiene_and_risks'));

  // Parágrafo 7: Cuidados Realizados e Resposta aos Cuidados
  const p7Facts = [
    ...(facts.nursingCare || []),
    ...(facts.responseToCare || []),
  ];
  p7Facts.forEach((f) => addFactTrace(f, 'care_and_response'));

  // Parágrafo 8: Intercorrências, Comunicação, Comparação, Síntese e Situação Atual
  const p8Facts = [
    ...(facts.complications || []),
    ...(facts.interprofessionalCommunication || []),
    ...(facts.comparisonWithPrevious || []),
    ...(facts.nurseClinicalSynthesis || []),
    ...(facts.currentStatus || []),
  ];
  p8Facts.forEach((f) => addFactTrace(f, 'synthesis_and_outcome'));

  // Group traces into coherent paragraphs
  const categoryGroups: Record<string, string[]> = {};
  traces.forEach((tr) => {
    const cat = tr.category || 'general';
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(tr.text);
  });

  const narrative = Object.values(categoryGroups)
    .map((sentences) => sentences.join(' '))
    .join('\n\n');

  return { narrative, traces };
}

/**
 * Builds the canonical deterministic note string for Nurse Pediatric Evolution.
 * Safely accepts either AuthorizedClinicalFacts or NursePediatricEvolutionForm.
 */
export function buildNursePediatricEvolutionNote(
  input: AuthorizedClinicalFacts | NursePediatricEvolutionForm
): string {
  let facts: AuthorizedClinicalFacts;

  if (
    input &&
    typeof input === 'object' &&
    'context' in input &&
    !Array.isArray((input as any).context)
  ) {
    const norm = normalizeNursePediatricEvolutionForm(input as NursePediatricEvolutionForm);
    facts = buildAuthorizedNursePediatricEvolutionFacts(norm);
  } else {
    facts = input as AuthorizedClinicalFacts;
  }

  return buildNursePediatricEvolutionNoteWithTrace(facts).narrative;
}
