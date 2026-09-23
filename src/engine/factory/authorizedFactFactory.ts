import { ClinicalFact, AuthorizedClinicalFacts } from '../types';

export interface CreateAuthorizedFactParams {
  id: string;
  category: string;
  sourceField: string;
  value: any;
  canonicalText: string;
}

/**
 * Checks if a clinical value is semantically empty.
 * Explicitly preserves numeric 0 and string "0" as valid clinical values (e.g. Pain 0, EVA 0, balance 0).
 */
export function isSemanticallyEmpty(value: any): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}

export class AuthorizedFactFactory {
  /**
   * Convenience helper to create a ClinicalFact with positional arguments.
   */
  static createFact(
    id: string,
    category: string,
    sourceField: string,
    value: any,
    canonicalText: string,
    relevance?: string
  ): ClinicalFact {
    return this.create({
      id,
      category,
      sourceField,
      value,
      canonicalText,
    });
  }

  /**
   * Creates and validates an Authorized Clinical Fact according to the canonical contract.
   * Throws an error if required fields or factual origin are missing or semantically empty.
   */
  static create(params: CreateAuthorizedFactParams): ClinicalFact {
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      throw new Error('AuthorizedFactFactory: fact "id" is mandatory and cannot be empty.');
    }

    if (!params.sourceField || typeof params.sourceField !== 'string' || params.sourceField.trim().length === 0) {
      throw new Error(`AuthorizedFactFactory: fact "${params.id}" must have a valid "sourceField" to establish provenance.`);
    }

    if (isSemanticallyEmpty(params.value)) {
      throw new Error(`AuthorizedFactFactory: fact "${params.id}" cannot have an empty, null, or whitespace-only value.`);
    }

    if (!params.canonicalText || typeof params.canonicalText !== 'string' || params.canonicalText.trim().length === 0) {
      throw new Error(`AuthorizedFactFactory: fact "${params.id}" must provide a non-empty canonicalText representation.`);
    }

    return {
      id: params.id.trim(),
      category: params.category.trim(),
      sourceField: params.sourceField.trim(),
      value: params.value,
      canonicalText: params.canonicalText.trim(),
    };
  }

  /**
   * Helper that returns null instead of throwing when creating optional facts.
   */
  static createOptional(params: {
    id: string;
    category: string;
    sourceField: string;
    value: any;
    canonicalText: string;
  }): ClinicalFact | null {
    if (isSemanticallyEmpty(params.value)) {
      return null;
    }
    return this.create(params);
  }

  /**
   * Generates a predictable, namespaced Fact ID.
   */
  static createFactId(namespace: string, domain: string, field: string, index?: number | string): string {
    const cleanNs = namespace.replace(/:/g, '-');
    const cleanDom = domain.replace(/:/g, '-');
    const cleanField = field.replace(/:/g, '-');
    const suffix = index !== undefined ? `-${index}` : '';
    return `${cleanNs}-${cleanDom}-${cleanField}${suffix}`;
  }

  /**
   * Validates that all factIds in a given facts collection are unique.
   * Rejects and reports duplicate IDs to prevent silent state corruption or overwrites.
   */
  static validateFactIdUniqueness(facts: ClinicalFact[] | AuthorizedClinicalFacts | any): {
    valid: boolean;
    duplicateIds: string[];
    totalFacts: number;
    errors: string[];
  } {
    const factList: ClinicalFact[] = Array.isArray(facts)
      ? facts
      : facts && typeof facts === 'object'
      ? extractAllFactsFromObject(facts)
      : [];

    const seenIds = new Set<string>();
    const duplicateIds: string[] = [];
    const errors: string[] = [];

    for (const fact of factList) {
      if (!fact || !fact.id) continue;
      if (seenIds.has(fact.id)) {
        duplicateIds.push(fact.id);
        errors.push(`FACTORY-ERR-015: Duplicate factId detected: "${fact.id}".`);
      } else {
        seenIds.add(fact.id);
      }
    }

    return {
      valid: duplicateIds.length === 0,
      duplicateIds,
      totalFacts: factList.length,
      errors,
    };
  }
}

export function createAuthorizedFact(params: CreateAuthorizedFactParams): ClinicalFact {
  return AuthorizedFactFactory.create(params);
}

export function validateFactIdUniqueness(facts: ClinicalFact[] | AuthorizedClinicalFacts | any): {
  valid: boolean;
  duplicateIds: string[];
  totalFacts: number;
  errors: string[];
} {
  return AuthorizedFactFactory.validateFactIdUniqueness(facts);
}

function extractAllFactsFromObject(obj: any): ClinicalFact[] {
  const result: ClinicalFact[] = [];
  if (!obj || typeof obj !== 'object') return result;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (!val) continue;
    if (typeof val === 'object') {
      if (typeof val.id === 'string' && typeof val.canonicalText === 'string') {
        result.push(val as ClinicalFact);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item.id === 'string' && typeof item.canonicalText === 'string') {
            result.push(item as ClinicalFact);
          }
        }
      } else {
        result.push(...extractAllFactsFromObject(val));
      }
    }
  }
  return result;
}

