export interface VitalSignDefinition {
  id: string;
  key: string;
  label: string;
  unit: string;
  inputType: 'numeric' | 'text';
  optional: boolean;
  isCalculated: boolean;
  manualOnly: boolean;
  formatter: (value: string | number) => string;
  factFormatter: (value: string | number) => string;
}

export const VITAL_SIGNS_DEFINITIONS: Record<string, VitalSignDefinition> = {
  systolicBP: {
    id: 'vs-systolic',
    key: 'systolicBP',
    label: 'Pressão Arterial Sistólica (PAS)',
    unit: 'mmHg',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val} mmHg`,
    factFormatter: (val) => `PAS ${val} mmHg`,
  },
  diastolicBP: {
    id: 'vs-diastolic',
    key: 'diastolicBP',
    label: 'Pressão Arterial Diastólica (PAD)',
    unit: 'mmHg',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val} mmHg`,
    factFormatter: (val) => `PAD ${val} mmHg`,
  },
  meanArterialPressure: {
    id: 'vs-pam',
    key: 'meanArterialPressure',
    label: 'Pressão Arterial Média (PAM)',
    unit: 'mmHg',
    inputType: 'numeric',
    optional: true,
    isCalculated: false, // CRITICAL: NEVER automatically calculated, must remain manual
    manualOnly: true,
    formatter: (val) => `PAM: ${val} mmHg`,
    factFormatter: (val) => `PAM ${val} mmHg aferida manualmente`,
  },
  heartRate: {
    id: 'vs-hr',
    key: 'heartRate',
    label: 'Frequência Cardíaca (FC)',
    unit: 'bpm',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val} bpm`,
    factFormatter: (val) => `FC: ${val} bpm`,
  },
  respiratoryRate: {
    id: 'vs-rr',
    key: 'respiratoryRate',
    label: 'Frequência Respiratória (FR)',
    unit: 'irpm',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val} irpm`,
    factFormatter: (val) => `FR: ${val} irpm`,
  },
  oxygenSaturation: {
    id: 'vs-spo2',
    key: 'oxygenSaturation',
    label: 'Saturação de Oxigênio (SpO₂)',
    unit: '%',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val}%`,
    factFormatter: (val) => `SpO₂: ${val}%`,
  },
  temperature: {
    id: 'vs-temp',
    key: 'temperature',
    label: 'Temperatura Axilar / Corporal',
    unit: '°C',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val} °C`,
    factFormatter: (val) => `Temperatura: ${val} °C`,
  },
  bloodGlucose: {
    id: 'vs-glucose',
    key: 'bloodGlucose',
    label: 'Glicemia Capilar (HGT)',
    unit: 'mg/dL',
    inputType: 'numeric',
    optional: true,
    isCalculated: false,
    manualOnly: true,
    formatter: (val) => `${val} mg/dL`,
    factFormatter: (val) => `Glicemia capilar: ${val} mg/dL`,
  },
};
