import { NurseMedicalEvolutionForm } from '../types/nurseMedicalEvolution';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { NarrativeFactTrace } from './deterministicNarrativeFactAuditor';
import {
  normalizeNurseMedicalEvolutionForm,
  buildAuthorizedNurseMedicalEvolutionFacts,
} from './nurseMedicalEvolutionFactBuilder';

/**
 * Builds deterministic nursing evolution narrative with fact traces for
 * NURSE_EVOLUTION_MEDICAL_CLINIC.
 *
 * CRITICAL SAFETY DIRECTIVES:
 * 1. Consumes ONLY AuthorizedClinicalFacts.
 * 2. Every single sentence maps back to a valid authorized factId.
 * 3. Never invents diagnoses, prescriptions, or unsolicited clinical plans.
 * 4. Preserves manual numbers verbatim (including manual MAP, never calculating it).
 */
export function buildNurseMedicalEvolutionNoteWithTrace(facts: AuthorizedClinicalFacts): {
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

  // Parágrafo 1: Contexto e Avaliação Geral
  const p1Facts = [
    ...(facts.context || []),
    ...(facts.general || []),
  ];
  p1Facts.forEach((f) => addFactTrace(f, 'context_and_general'));

  // Parágrafo 2: Sinais Vitais e Dor
  const p2Facts = [
    ...(facts.vitalSigns || []),
    ...(facts.pain || []),
  ];
  p2Facts.forEach((f) => addFactTrace(f, 'vitals_and_pain'));

  // Parágrafo 3: Neurológico
  const p3Facts = [...(facts.neurological || [])];
  p3Facts.forEach((f) => addFactTrace(f, 'neurological'));

  // Parágrafo 4: Respiratório
  const p4Facts = [...(facts.respiratory || [])];
  p4Facts.forEach((f) => addFactTrace(f, 'respiratory'));

  // Parágrafo 5: Cardiovascular
  const p5Facts = [...(facts.cardiovascular || [])];
  p5Facts.forEach((f) => addFactTrace(f, 'cardiovascular'));

  // Parágrafo 6: Gastrointestinal e Nutrição
  const p6Facts = [
    ...(facts.gastrointestinal || []),
    ...(facts.nutrition || []),
  ];
  p6Facts.forEach((f) => addFactTrace(f, 'gastrointestinal_and_nutrition'));

  // Parágrafo 7: Eliminações
  const p7Facts = [...(facts.eliminations || [])];
  p7Facts.forEach((f) => addFactTrace(f, 'eliminations'));

  // Parágrafo 8: Dispositivos Invasivos
  const p8Facts = [...(facts.devices || [])];
  p8Facts.forEach((f) => addFactTrace(f, 'devices'));

  // Parágrafo 9: Pele, Mobilidade, Higiene e Riscos
  const p9Facts = [
    ...(facts.skin || []),
    ...(facts.mobility || []),
    ...(facts.hygiene || []),
    ...(facts.risks || []),
  ];
  p9Facts.forEach((f) => addFactTrace(f, 'skin_mobility_and_risks'));

  // Parágrafo 10: Cuidados e Resposta aos Cuidados
  const p10Facts = [
    ...(facts.care || []),
    ...(facts.responseToCare || []),
  ];
  p10Facts.forEach((f) => addFactTrace(f, 'care_and_response'));

  // Parágrafo 11: Intercorrências, Comunicação, Comparação, Síntese e Desfecho
  const p11Facts = [
    ...(facts.complications || []),
    ...(facts.communication || []),
    ...(facts.comparison || []),
    ...(facts.synthesis || []),
    ...(facts.currentStatus || []),
  ];
  p11Facts.forEach((f) => addFactTrace(f, 'synthesis_and_outcome'));

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
 * Builds the canonical deterministic note string for Nurse Medical Clinic.
 * Safely accepts either AuthorizedClinicalFacts or NurseMedicalEvolutionForm.
 */
export function buildNurseMedicalEvolutionNote(
  input: AuthorizedClinicalFacts | NurseMedicalEvolutionForm
): string {
  let facts: AuthorizedClinicalFacts;

  // Type guard: Check if input is NurseMedicalEvolutionForm
  if (
    input &&
    typeof input === 'object' &&
    'context' in input &&
    'generalAssessment' in input
  ) {
    const norm = normalizeNurseMedicalEvolutionForm(input as NurseMedicalEvolutionForm);
    facts = buildAuthorizedNurseMedicalEvolutionFacts(norm);
  } else {
    facts = input as AuthorizedClinicalFacts;
  }

  return buildNurseMedicalEvolutionNoteWithTrace(facts).narrative;
}
