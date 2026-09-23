import { NarrativeSegment } from './types';

const FORBIDDEN_STRUCTURAL_CLINICAL_TERMS = [
  'estável',
  'estavel',
  'íntegro',
  'integro',
  'afebril',
  'sem intercorrências',
  'sem intercorrencias',
  'boa tolerância',
  'boa tolerancia',
  'sem sinais flogísticos',
  'sem sinais flogisticos',
  'eupneico',
  'normotenso',
  'normocárdico',
  'normocardico',
  'lúcido',
  'lucido',
  'orientado',
];

export class NarrativeComposer {
  /**
   * Composes a collection of traceable narrative segments into clean, coherent clinical text.
   * 
   * STRICT INTEGRITY RULES:
   * 1. Does NOT add, fabricate or extrapolate clinical information.
   * 2. Does NOT generate new clinical terms or unsolicited clinical judgments.
   * 3. Only formats spacing, punctuation and paragraph structures.
   * 4. Enforces that non-structural segments have at least one valid factId.
   * 5. Enforces that purely structural segments (kind="structural" or isStructural=true) do not contain clinical findings.
   */
  static compose(segments: NarrativeSegment[]): {
    text: string;
    traces: NarrativeSegment[];
    unauthorizedSegments: NarrativeSegment[];
    structuralViolations: NarrativeSegment[];
  } {
    const validTraces: NarrativeSegment[] = [];
    const unauthorizedSegments: NarrativeSegment[] = [];
    const structuralViolations: NarrativeSegment[] = [];

    const processedParagraphs: string[] = [];
    let currentSentenceBuffer: string[] = [];

    for (const segment of segments) {
      const cleanText = segment.text.trim();
      if (!cleanText) continue;

      const isStructural = segment.isStructural === true || segment.kind === 'structural';
      const hasFacts = Array.isArray(segment.factIds) && segment.factIds.length > 0;

      // Rule: Structural segment must not contain ungrounded clinical claims
      if (isStructural) {
        const lower = cleanText.toLowerCase();
        const hasClinicalWord = FORBIDDEN_STRUCTURAL_CLINICAL_TERMS.some((term) => lower.includes(term));
        if (hasClinicalWord) {
          structuralViolations.push(segment);
          unauthorizedSegments.push(segment);
          continue;
        }
      }

      // Rule: Non-structural segment must have at least one valid factId
      if (!isStructural && !hasFacts) {
        unauthorizedSegments.push(segment);
        continue;
      }

      validTraces.push({
        text: cleanText,
        factIds: segment.factIds || [],
        isStructural,
        kind: isStructural ? 'structural' : 'factual',
      });

      currentSentenceBuffer.push(cleanText);
    }

    if (currentSentenceBuffer.length > 0) {
      processedParagraphs.push(this.formatSentenceBuffer(currentSentenceBuffer));
    }

    const finalText = processedParagraphs.join('\n\n').trim();

    return {
      text: finalText,
      traces: validTraces,
      unauthorizedSegments,
      structuralViolations,
    };
  }

  /**
   * Cleans punctuation, removes duplicate spaces and ensures standard sentence spacing.
   */
  private static formatSentenceBuffer(sentences: string[]): string {
    return sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => {
        // Ensure proper ending punctuation if it doesn't already have one
        if (!/[.!?:]$/.test(s)) {
          return `${s}.`;
        }
        return s;
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .replace(/\.\./g, '.')
      .trim();
  }
}

