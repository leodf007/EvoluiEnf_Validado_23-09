import React from 'react';
import { Plus, Trash2, Zap, ShieldAlert } from 'lucide-react';
import { VasoactiveDrugItem, SedationAnalgesiaItem } from '../../types/clinical';
import { ClinicalOptionGroup } from './ClinicalOptionGroup';
import { ClinicalNumericInput } from './ClinicalNumericInput';
import { ClinicalTextInput } from './ClinicalInputs';

const COMMON_DVAS = [
  'Noradrenalina',
  'Vasopressina',
  'Dobutamina',
  'Dopamina',
  'Nitroglicerina',
  'Nitroprussiato de Sódio',
  'Adrenalina',
  'Outra',
];

interface VasoactiveDrugCardProps {
  drugs: VasoactiveDrugItem[];
  onChange: (drugs: VasoactiveDrugItem[]) => void;
}

export const VasoactiveDrugCard: React.FC<VasoactiveDrugCardProps> = ({
  drugs,
  onChange,
}) => {
  const addDrug = () => {
    const newItem: VasoactiveDrugItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dva-${Date.now()}-${Math.random()}`,
      medication: '',
      concentration: '',
      infusionRate: '',
      unit: 'mL/h',
      observations: '',
    };
    onChange([...drugs, newItem]);
  };

  const removeDrug = (id: string) => {
    onChange(drugs.filter((d) => d.id !== id));
  };

  const updateDrug = (id: string, updates: Partial<VasoactiveDrugItem>) => {
    onChange(
      drugs.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  return (
    <div className="space-y-4">
      {drugs.map((item, index) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3.5 relative"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Droga Vasoativa #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeDrug(item.id)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1 rounded hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover</span>
            </button>
          </div>

          <ClinicalOptionGroup
            label="Medicamento"
            options={COMMON_DVAS}
            value={item.medication}
            onChange={(val) => updateDrug(item.id, { medication: val })}
          />

          {item.medication === 'Outra' && (
            <ClinicalTextInput
              label="Nome do medicamento"
              value={item.observations}
              onChange={(val) => updateDrug(item.id, { observations: val })}
              placeholder="Ex: Milrinona..."
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClinicalNumericInput
              label="Velocidade de infusão"
              value={item.infusionRate}
              onChange={(val) => updateDrug(item.id, { infusionRate: val })}
              unit="mL/h"
              placeholder="Ex: 10"
              mode="decimal"
            />
            <ClinicalTextInput
              label="Concentração / Diluição"
              sublabel="Opcional"
              value={item.concentration}
              onChange={(val) => updateDrug(item.id, { concentration: val })}
              placeholder="Ex: 4mg/250mL SG5%"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDrug}
        className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-teal-700 bg-white hover:bg-teal-50/50 text-teal-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar Droga Vasoativa</span>
      </button>
    </div>
  );
};

const COMMON_SEDATION = [
  'Fentanil',
  'Midazolam',
  'Propofol',
  'Morfina',
  'Precedex (Dexmedetomidina)',
  'Cetamina',
  'Dipirona',
  'Tramadol',
  'Outro',
];

interface SedationAnalgesiaCardProps {
  medications: SedationAnalgesiaItem[];
  onChange: (meds: SedationAnalgesiaItem[]) => void;
}

export const SedationAnalgesiaCard: React.FC<SedationAnalgesiaCardProps> = ({
  medications,
  onChange,
}) => {
  const addMed = () => {
    const newItem: SedationAnalgesiaItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sed-${Date.now()}-${Math.random()}`,
      medication: '',
      concentration: '',
      rateOrDose: '',
      unit: 'mL/h',
      purpose: '',
      observations: '',
    };
    onChange([...medications, newItem]);
  };

  const removeMed = (id: string) => {
    onChange(medications.filter((m) => m.id !== id));
  };

  const updateMed = (id: string, updates: Partial<SedationAnalgesiaItem>) => {
    onChange(
      medications.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  return (
    <div className="space-y-4">
      {medications.map((item, index) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3.5 relative"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-700" />
              Sedação / Analgesia #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeMed(item.id)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1 rounded hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClinicalOptionGroup
              label="Finalidade"
              options={['Sedação', 'Analgesia', 'Outra']}
              value={item.purpose}
              onChange={(val) => updateMed(item.id, { purpose: val as any })}
            />
            <ClinicalOptionGroup
              label="Medicamento"
              options={COMMON_SEDATION}
              value={item.medication}
              onChange={(val) => updateMed(item.id, { medication: val })}
            />
          </div>

          {item.medication === 'Outro' && (
            <ClinicalTextInput
              label="Nome do medicamento"
              value={item.observations}
              onChange={(val) => updateMed(item.id, { observations: val })}
              placeholder="Ex: Remifentanil..."
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClinicalTextInput
              label="Taxa de infusão / Dose"
              value={item.rateOrDose}
              onChange={(val) => updateMed(item.id, { rateOrDose: val })}
              placeholder="Ex: 5 mL/h ou 2mg EV"
            />
            <ClinicalTextInput
              label="Concentração / Diluição"
              sublabel="Opcional"
              value={item.concentration}
              onChange={(val) => updateMed(item.id, { concentration: val })}
              placeholder="Ex: 50mcg/mL"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMed}
        className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-teal-700 bg-white hover:bg-teal-50/50 text-teal-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar Medicamento (Sedação / Analgesia)</span>
      </button>
    </div>
  );
};
