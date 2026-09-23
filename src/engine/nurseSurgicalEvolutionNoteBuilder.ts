import { NurseSurgicalEvolutionForm } from '../types/nurseSurgicalEvolution';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { NarrativeFactTrace } from './deterministicNarrativeFactAuditor';
import {
  normalizeNurseSurgicalEvolutionForm,
  buildAuthorizedNurseSurgicalEvolutionFacts,
} from './nurseSurgicalEvolutionFactBuilder';

/**
 * Builds deterministic nursing evolution narrative with fact traces for
 * NURSE_EVOLUTION_SURGICAL_CLINIC.
 *
 * CRITICAL SAFETY DIRECTIVES:
 * 1. Consumes ONLY AuthorizedClinicalFacts.
 * 2. Every single sentence maps back to a valid authorized factId.
 * 3. Never invents surgical procedures, anesthesia, drains, or complications.
 * 4. Preserves manual numbers verbatim (including manual MAP, never calculating it).
 */
export function buildNurseSurgicalEvolutionNoteWithTrace(facts: AuthorizedClinicalFacts): {
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

  // Parágrafo 1: Contexto e Identificação de Segurança
  const p1Facts = [
    ...(facts.context || []),
    ...(facts.safetyIdentification || []),
  ];
  p1Facts.forEach((f) => addFactTrace(f, 'context_and_safety'));

  // Parágrafo 2: Contexto Cirúrgico
  const p2Facts = [...(facts.surgicalContext || [])];
  p2Facts.forEach((f) => addFactTrace(f, 'surgical_context'));

  // Parágrafo 3: Avaliação Geral e Consciência
  const p3Facts = [...(facts.general || [])];
  p3Facts.forEach((f) => addFactTrace(f, 'general_assessment'));

  // Parágrafo 4: Sinais Vitais e Dor Pós-Operatória
  const p4Facts = [
    ...(facts.vitalSigns || []),
    ...(facts.pain || []),
  ];
  p4Facts.forEach((f) => addFactTrace(f, 'vitals_and_pain'));

  // Parágrafo 5: Avaliação Neurológica
  const p5Facts = [...(facts.neurological || [])];
  p5Facts.forEach((f) => addFactTrace(f, 'neurological'));

  // Parágrafo 6: Respiratório e Cardiovascular
  const p6Facts = [
    ...(facts.respiratory || []),
    ...(facts.cardiovascular || []),
  ];
  p6Facts.forEach((f) => addFactTrace(f, 'respiratory_and_cardiovascular'));

  // Parágrafo 7: Gastrointestinal e Nutrição
  const p7Facts = [
    ...(facts.gastrointestinal || []),
    ...(facts.nutrition || []),
  ];
  p7Facts.forEach((f) => addFactTrace(f, 'gastrointestinal_and_nutrition'));

  // Parágrafo 8: Eliminações
  const p8Facts = [...(facts.eliminations || [])];
  p8Facts.forEach((f) => addFactTrace(f, 'eliminations'));

  // Parágrafo 9: Ferida Operatória e Curativo Cirúrgico
  const p9Facts = [
    ...(facts.surgicalWound || []),
    ...(facts.surgicalDressing || []),
  ];
  p9Facts.forEach((f) => addFactTrace(f, 'surgical_wound_and_dressing'));

  // Parágrafo 10: Drenos Cirúrgicos
  const p10Facts = [...(facts.drains || [])];
  p10Facts.forEach((f) => addFactTrace(f, 'drains'));

  // Parágrafo 11: Dispositivos Invasivos
  const p11Facts = [...(facts.devices || [])];
  p11Facts.forEach((f) => addFactTrace(f, 'devices'));

  // Parágrafo 12: Mobilidade, Higiene e Riscos Assistenciais
  const p12Facts = [
    ...(facts.mobility || []),
    ...(facts.hygiene || []),
    ...(facts.riskAssessment || []),
  ];
  p12Facts.forEach((f) => addFactTrace(f, 'mobility_hygiene_and_risks'));

  // Parágrafo 13: Cuidados Realizados e Resposta aos Cuidados
  const p13Facts = [
    ...(facts.care || []),
    ...(facts.responseToCare || []),
  ];
  p13Facts.forEach((f) => addFactTrace(f, 'care_and_response'));

  // Parágrafo 14: Intercorrências, Comunicação, Comparação, Síntese e Situação Atual
  const p14Facts = [
    ...(facts.complications || []),
    ...(facts.communication || []),
    ...(facts.comparison || []),
    ...(facts.synthesis || []),
    ...(facts.finalStatus || []),
  ];
  p14Facts.forEach((f) => addFactTrace(f, 'synthesis_and_outcome'));

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
 * Builds the canonical deterministic note string for Nurse Surgical Clinic.
 * Safely accepts either AuthorizedClinicalFacts or NurseSurgicalEvolutionForm.
 */
export function buildNurseSurgicalEvolutionNote(
  input: AuthorizedClinicalFacts | NurseSurgicalEvolutionForm
): string {
  let facts: AuthorizedClinicalFacts;

  if (
    input &&
    typeof input === 'object' &&
    'context' in input &&
    !Array.isArray((input as any).context)
  ) {
    const norm = normalizeNurseSurgicalEvolutionForm(input as NurseSurgicalEvolutionForm);
    facts = buildAuthorizedNurseSurgicalEvolutionFacts(norm);
  } else {
    facts = input as AuthorizedClinicalFacts;
  }

  return buildNurseSurgicalEvolutionNoteWithTrace(facts).narrative;
}
