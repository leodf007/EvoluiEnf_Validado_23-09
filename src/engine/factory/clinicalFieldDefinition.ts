export type ClinicalFieldType =
  | 'text'
  | 'numeric'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'multi-select'
  | 'textarea';

export interface ClinicalFieldCondition {
  fieldKey: string;
  expectedValue: any;
  operator?: 'equals' | 'not_equals' | 'includes' | 'is_truthy';
}

export interface ClinicalFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: ClinicalFieldType;
  unit?: string;
  options?: readonly string[] | string[];
  optional: boolean;
  conditionalOn?: ClinicalFieldCondition;
}
