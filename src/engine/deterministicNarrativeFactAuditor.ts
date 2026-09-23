import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { getAllAuthorizedFactIds } from './postGenerationVerifier';

export { getAllAuthorizedFactIds };

export interface NarrativeFactTrace {
  text: string;
  factIds: string[];
  category?: string;
}

export interface AuditResult {
  passed: boolean;
  unauthorizedSegments: string[];
  validSegmentsCount: number;
  traces: NarrativeFactTrace[];
  filteredNarrative: string;
}

/**
 * DeterministicNarrativeFactAuditor:
 * Verifies that every factual segment generated in the narrative traces back to at least one valid Authorized Clinical Fact ID.
 *
 * Rules:
 * 1. If a sentence/segment has NO factId or references an unregistered factId:
 *    - In development/tests: fails audit.
 *    - In production: drops the unauthorized sentence from the rendered narrative.
 * 2. Does NOT leak patient data in logs (only technical metadata).
 */
export function auditDeterministicNarrative(
  traces: NarrativeFactTrace[],
  authorizedFacts: AuthorizedClinicalFacts,
  isDevMode: boolean = process.env.NODE_ENV !== 'production'
): AuditResult {
  const authorizedIds = getAllAuthorizedFactIds(authorizedFacts);
  const unauthorizedSegments: string[] = [];
  const authorizedTraces: NarrativeFactTrace[] = [];

  for (const trace of traces) {
    if (!trace.text || !trace.text.trim()) continue;

    // Check if trace has at least one valid authorized factId
    const hasValidFact = trace.factIds && trace.factIds.length > 0 && trace.factIds.some((id) => authorizedIds.has(id));

    if (hasValidFact) {
      authorizedTraces.push(trace);
    } else {
      unauthorizedSegments.push(trace.text);
    }
  }

  const passed = unauthorizedSegments.length === 0;

  // Group authorized traces back into coherent paragraphs based on category or natural line breaks
  const paragraphMap = new Map<string, string[]>();
  authorizedTraces.forEach((t) => {
    const cat = t.category || 'general';
    if (!paragraphMap.has(cat)) {
      paragraphMap.set(cat, []);
    }
    paragraphMap.get(cat)!.push(t.text);
  });

  const filteredNarrative = Array.from(paragraphMap.values())
    .map((sentences) => sentences.join(' '))
    .join('\n\n');

  return {
    passed,
    unauthorizedSegments,
    validSegmentsCount: authorizedTraces.length,
    traces: authorizedTraces,
    filteredNarrative: filteredNarrative || (passed ? '' : 'Nenhum segmento autorizado.'),
  };
}
