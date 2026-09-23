import React, { useState, useMemo } from 'react';
import {
  FileText,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import {
  NurseWoundsAssessmentForm,
  createInitialNurseWoundsAssessmentForm,
} from '../../../types/nurseWoundsAssessment';
import { validateNurseWoundsConsistency } from '../../../engine/nurseWoundsFactBuilder';
import { NurseWoundsAssessmentPreviewView } from './NurseWoundsAssessmentPreviewView';

interface NurseWoundsAssessmentFormScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  patientAreaName?: string;
}

export const NurseWoundsAssessmentFormScreen: React.FC<NurseWoundsAssessmentFormScreenProps> = ({
  onBack,
  patientAreaName = 'Geral',
}) => {
  const [form, setForm] = useState<NurseWoundsAssessmentForm>(() =>
    createInitialNurseWoundsAssessmentForm()
  );
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [newProductInput, setNewProductInput] = useState<string>('');
  const [newDeviceType, setNewDeviceType] = useState<string>('');
  const [newDeviceSite, setNewDeviceSite] = useState<string>('');
  const [newDeviceCond, setNewDeviceCond] = useState<string>('');

  const consistencyResult = useMemo(() => validateNurseWoundsConsistency(form), [form]);

  const handleReset = () => {
    if (window.confirm('Deseja realmente limpar todos os campos da avaliação de feridas?')) {
      setForm(createInitialNurseWoundsAssessmentForm());
      setActiveStep(1);
    }
  };

  const updateSubField = <K extends keyof NurseWoundsAssessmentForm>(
    section: K,
    fields: Partial<NurseWoundsAssessmentForm[K]>
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...fields,
      },
    }));
  };

  const toggleArrayItem = (
    currentList: string[],
    item: string,
    onUpdate: (newList: string[]) => void
  ) => {
    if (currentList.includes(item)) {
      onUpdate(currentList.filter((x) => x !== item));
    } else {
      onUpdate([...currentList, item]);
    }
  };

  const handleAddProduct = () => {
    const trimmed = newProductInput.trim();
    if (trimmed && !form.productsUsed.products.includes(trimmed)) {
      updateSubField('productsUsed', {
        products: [...form.productsUsed.products, trimmed],
      });
      setNewProductInput('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    const next = [...form.productsUsed.products];
    next.splice(index, 1);
    updateSubField('productsUsed', { products: next });
  };

  const handleAddDevice = () => {
    if (newDeviceType.trim() && newDeviceSite.trim()) {
      updateSubField('relatedDevices', {
        hasRelatedDevices: 'Sim',
        devices: [
          ...form.relatedDevices.devices,
          {
            deviceType: newDeviceType.trim(),
            anatomicalSite: newDeviceSite.trim(),
            condition: newDeviceCond.trim() || 'íntegro',
          },
        ],
      });
      setNewDeviceType('');
      setNewDeviceSite('');
      setNewDeviceCond('');
    }
  };

  const handleRemoveDevice = (idx: number) => {
    const next = [...form.relatedDevices.devices];
    next.splice(idx, 1);
    updateSubField('relatedDevices', {
      devices: next,
      hasRelatedDevices: next.length > 0 ? 'Sim' : 'Não',
    });
  };

  if (showPreview) {
    return (
      <NurseWoundsAssessmentPreviewView
        form={form}
        onBackToEdit={() => setShowPreview(false)}
        patientAreaName={patientAreaName}
      />
    );
  }

  const steps = [
    { num: 1, label: '1. Identificação e Origem' },
    { num: 2, label: '2. Medidas e Tecidos' },
    { num: 3, label: '3. Exsudato e Estadiamento' },
    { num: 4, label: '4. Curativo e Produtos' },
    { num: 5, label: '5. Conduta e Síntese' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900">Avaliação de Feridas</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                Enfermeiro
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instrumento padronizado COFEN para registro privativo de lesões e conduta terapêutica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Visualizar Registro
          </button>
        </div>
      </div>

      {/* Consistency Status Alerts */}
      {!consistencyResult.valid && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-950">Avisos de Consistência Clínica:</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                {consistencyResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setActiveStep(s.num)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
              activeStep === s.num
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: Identificação, Localização, Origem e Contexto */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* 1. Contexto */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>1. Contexto da Avaliação</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.evaluationContext.evaluationDate || ''}
                  onChange={(e) =>
                    updateSubField('evaluationContext', { evaluationDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Horário</label>
                <input
                  type="time"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.evaluationContext.evaluationTime || ''}
                  onChange={(e) =>
                    updateSubField('evaluationContext', { evaluationTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Unidade Clínica</label>
                <input
                  type="text"
                  placeholder="Ex: UTI, Clínica Médica"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.evaluationContext.clinicalUnit || ''}
                  onChange={(e) =>
                    updateSubField('evaluationContext', { clinicalUnit: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Leito</label>
                <input
                  type="text"
                  placeholder="Ex: Leito 04"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.evaluationContext.bedLocation || ''}
                  onChange={(e) =>
                    updateSubField('evaluationContext', { bedLocation: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 2. Tipo de Avaliação */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>2. Tipo de Avaliação</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['avaliação inicial', 'reavaliação', 'acompanhamento evolutivo'].map((t) => (
                <label
                  key={t}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    form.evaluationType.type === t
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="evalType"
                    checked={form.evaluationType.type === t}
                    onChange={() => updateSubField('evaluationType', { type: t })}
                    className="text-teal-700 focus:ring-teal-600"
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Detalhamento do tipo (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: admissão hospitalar, transferência setorial"
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.evaluationType.typeDetails || ''}
                onChange={(e) =>
                  updateSubField('evaluationType', { typeDetails: e.target.value })
                }
              />
            </div>
          </div>

          {/* 3. Identificação da Lesão */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>3. Identificação da Lesão</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                'lesão por pressão',
                'ferida cirúrgica',
                'traumática',
                'vascular',
                'pé diabético',
                'queimadura',
                'outra',
              ].map((w) => (
                <label
                  key={w}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                    form.woundIdentification.woundType === w
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="woundType"
                    checked={form.woundIdentification.woundType === w}
                    onChange={() => updateSubField('woundIdentification', { woundType: w })}
                    className="text-teal-700 focus:ring-teal-600"
                  />
                  <span className="capitalize">{w}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.woundIdentification.woundType === 'outra' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Especificar outro tipo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dermatite associada à umidade (DAU)"
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.woundIdentification.woundTypeOther || ''}
                    onChange={(e) =>
                      updateSubField('woundIdentification', { woundTypeOther: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Identificador / Número da lesão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lesão 1, Ferida operatória"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.woundIdentification.woundNumber || ''}
                  onChange={(e) =>
                    updateSubField('woundIdentification', { woundNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 4. Localização Anatômica e Lateralidade */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>4. Localização Anatômica e 5. Lateralidade</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {['sacral', 'calcâneo', 'membros', 'tronco', 'cabeça', 'outro'].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                    form.anatomicalLocation.region === r
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="region"
                    checked={form.anatomicalLocation.region === r}
                    onChange={() => updateSubField('anatomicalLocation', { region: r })}
                    className="text-teal-700 focus:ring-teal-600"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detalhamento anatômico
                </label>
                <input
                  type="text"
                  placeholder="Ex: região trocantérica, maleolar, maléolo lateral"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.anatomicalLocation.regionDetails || ''}
                  onChange={(e) =>
                    updateSubField('anatomicalLocation', { regionDetails: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lateralidade</label>
                <div className="flex gap-2">
                  {['direito', 'esquerdo', 'bilateral', 'não informado'].map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => updateSubField('laterality', { side })}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                        form.laterality.side === side
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Tempo de Existência e 7. Origem */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>6. Tempo de Existência e 7. Origem Informada</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tempo de Existência Informado
                </label>
                <input
                  type="text"
                  placeholder="Ex: há 5 dias, cerca de 2 semanas"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.reportedDuration.durationText || ''}
                  onChange={(e) =>
                    updateSubField('reportedDuration', { durationText: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Origem Informada
                </label>
                <input
                  type="text"
                  placeholder="Ex: domiciliar, intra-hospitalar, pós-operatória"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.reportedOrigin.origin || ''}
                  onChange={(e) =>
                    updateSubField('reportedOrigin', { origin: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
            >
              Próximo: Medidas e Tecidos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Medidas da Lesão, Leito, Bordas e Pele Perilesional */}
      {activeStep === 2 && (
        <div className="space-y-6">
          {/* 8. Medidas da Lesão */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>8. Medidas da Lesão (cm)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Comprimento (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.woundMeasurements.lengthCm || ''}
                  onChange={(e) =>
                    updateSubField('woundMeasurements', { lengthCm: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Largura (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 3.5"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.woundMeasurements.widthCm || ''}
                  onChange={(e) =>
                    updateSubField('woundMeasurements', { widthCm: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Profundidade (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 1"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.woundMeasurements.depthCm || ''}
                  onChange={(e) =>
                    updateSubField('woundMeasurements', { depthCm: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              * NumericFactLock ativo: medidas são preservadas estritamente em centímetros sem cálculos automáticos de área ou volume pela IA.
            </p>
          </div>

          {/* 9. Características do Leito */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>9. Características do Leito</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['granulação', 'esfacelo', 'necrose', 'epitelização'].map((tissue) => (
                <label
                  key={tissue}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                    form.woundBed.tissues.includes(tissue)
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.woundBed.tissues.includes(tissue)}
                    onChange={() =>
                      toggleArrayItem(form.woundBed.tissues, tissue, (next) =>
                        updateSubField('woundBed', { tissues: next })
                      )
                    }
                    className="rounded text-teal-700 focus:ring-teal-600"
                  />
                  <span className="capitalize">{tissue}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Outros detalhes do leito
              </label>
              <input
                type="text"
                placeholder="Ex: 70% de tecido de granulação vermelho vivo e 30% de esfacelo aderido"
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.woundBed.otherTissueDetails || ''}
                onChange={(e) =>
                  updateSubField('woundBed', { otherTissueDetails: e.target.value })
                }
              />
            </div>
          </div>

          {/* 10. Bordas e 11. Pele Perilesional */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>10. Bordas e 11. Pele ao Redor (Perilesional)</span>
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Bordas da Lesão
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['íntegras', 'maceradas', 'hiperemiadas', 'ressecadas', 'descoladas'].map((b) => (
                  <label
                    key={b}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                      form.woundEdges.characteristics.includes(b)
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.woundEdges.characteristics.includes(b)}
                      onChange={() =>
                        toggleArrayItem(form.woundEdges.characteristics, b, (next) =>
                          updateSubField('woundEdges', { characteristics: next })
                        )
                      }
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="capitalize">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Pele Perilesional
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['íntegra', 'hiperemia', 'edema', 'maceração', 'ressecamento'].map((p) => (
                  <label
                    key={p}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                      form.perilesionalSkin.characteristics.includes(p)
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.perilesionalSkin.characteristics.includes(p)}
                      onChange={() =>
                        toggleArrayItem(form.perilesionalSkin.characteristics, p, (next) =>
                          updateSubField('perilesionalSkin', { characteristics: next })
                        )
                      }
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
            >
              Próximo: Exsudato e Estadiamento
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Exsudato, Odor, Dor, Estadiamento, Túneis e Sinais */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* 12. Exsudato e 13. Odor */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>12. Exsudato e 13. Odor</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exsudato Presente?
                </label>
                <div className="flex gap-2">
                  {['Não', 'Sim'].map((ans) => (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => updateSubField('exudate', { present: ans })}
                      className={`px-4 py-1.5 text-xs rounded-lg border transition-colors ${
                        form.exudate.present === ans
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Odor</label>
                <div className="flex gap-2">
                  {['ausente', 'presente'].map((od) => (
                    <button
                      key={od}
                      type="button"
                      onClick={() => updateSubField('odor', { present: od })}
                      className={`px-4 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                        form.odor.present === od
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {od}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {form.exudate.present === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tipo do Exsudato
                  </label>
                  <select
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.exudate.type || ''}
                    onChange={(e) => updateSubField('exudate', { type: e.target.value as any })}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="seroso">Seroso</option>
                    <option value="serossanguinolento">Serossanguinolento</option>
                    <option value="sanguinolento">Sanguinolento</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Quantidade
                  </label>
                  <select
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.exudate.amount || ''}
                    onChange={(e) => updateSubField('exudate', { amount: e.target.value as any })}
                  >
                    <option value="">Selecione a quantidade</option>
                    <option value="pequena">Pequena</option>
                    <option value="moderada">Moderada</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 14. Dor Relacionada */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>14. Dor Relacionada à Lesão</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dor Presente?</label>
                <div className="flex gap-2">
                  {['Não', 'Sim', 'Não avaliável'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateSubField('woundPain', { hasPain: p })}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        form.woundPain.hasPain === p
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {form.woundPain.hasPain === 'Sim' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Escala</label>
                    <select
                      className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                      value={form.woundPain.painScale || ''}
                      onChange={(e) =>
                        updateSubField('woundPain', { painScale: e.target.value as any })
                      }
                    >
                      <option value="">Selecione a escala</option>
                      <option value="numérica">Numérica (0-10)</option>
                      <option value="outra">Outra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Escore (0 a 10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                      value={form.woundPain.painScore || ''}
                      onChange={(e) => updateSubField('woundPain', { painScore: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 15. Classificação/Estadiamento Informado */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>15. Classificação / Estadiamento Informado</span>
              </h2>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Privativo do Enfermeiro (Sem inferência pela IA)
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estágio (Lesão por Pressão NPUAP)
              </label>
              <select
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.staging.stage || 'não informado'}
                onChange={(e) => updateSubField('staging', { stage: e.target.value as any })}
              >
                <option value="não informado">Não informado / Não aplicável</option>
                <option value="estágio 1">Estágio 1 (pele íntegra com eritema não branqueável)</option>
                <option value="estágio 2">Estágio 2 (perda de pele em espessura parcial)</option>
                <option value="estágio 3">Estágio 3 (perda total da espessura da pele)</option>
                <option value="estágio 4">Estágio 4 (perda total com exposição óssea/tendão)</option>
                <option value="não classificável">Não classificável (obscurecida por esfacelo/escara)</option>
                <option value="lesão tissular profunda">Lesão Tissular Profunda (LTP)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Observações do estadiamento
              </label>
              <input
                type="text"
                placeholder="Ex: estadiamento estabelecido segundo diretrizes NPUAP"
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.staging.stagingNotes || ''}
                onChange={(e) => updateSubField('staging', { stagingNotes: e.target.value })}
              />
            </div>
          </div>

          {/* 16. Túneis e 17. Sinais Observados */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>16. Túneis e Descolamentos / 17. Sinais Observados</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Túneis / Descolamentos
                </label>
                <div className="flex gap-2">
                  {['Não', 'Sim', 'Não avaliado'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateSubField('tunneling', { present: t })}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        form.tunneling.present === t
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {form.tunneling.present === 'Sim' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Posição (horas)</label>
                    <input
                      type="text"
                      placeholder="Ex: às 2 horas"
                      className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                      value={form.tunneling.clockPosition || ''}
                      onChange={(e) =>
                        updateSubField('tunneling', { clockPosition: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Extensão (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 2"
                      className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                      value={form.tunneling.depthCm || ''}
                      onChange={(e) => updateSubField('tunneling', { depthCm: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Sinais Clínicos Observados no Sítio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['calor local', 'hiperemia perilesional', 'sangramento ao toque', 'sem sinais flogísticos'].map((s) => (
                  <label
                    key={s}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                      form.observedSigns.signs.includes(s)
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.observedSigns.signs.includes(s)}
                      onChange={() =>
                        toggleArrayItem(form.observedSigns.signs, s, (next) =>
                          updateSubField('observedSigns', { signs: next })
                        )
                      }
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
            >
              Próximo: Curativo e Produtos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Dispositivos, Cobertura Prévia, Curativo Realizado e Produtos */}
      {activeStep === 4 && (
        <div className="space-y-6">
          {/* 18. Dispositivos Relacionados */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>18. Dispositivos Relacionados</span>
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Dispositivo (ex: Dreno de Sucção, Fixador)"
                  className="text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Local anatômico (ex: flanco D)"
                  className="text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={newDeviceSite}
                  onChange={(e) => setNewDeviceSite(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Condição (ex: pérvio e fixado)"
                  className="text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={newDeviceCond}
                  onChange={(e) => setNewDeviceCond(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddDevice}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {form.relatedDevices.devices.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {form.relatedDevices.devices.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800"
                    >
                      <span>
                        <strong>{d.deviceType}</strong> em {d.anatomicalSite} ({d.condition})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDevice(i)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 19. Cobertura Atual Encontrada */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>19. Cobertura Atual Encontrada</span>
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cobertura prévia presente na inspeção inicial
              </label>
              <input
                type="text"
                placeholder="Ex: placa de hidrocolóide íntegra, gaze estéril seca com discreto exsudato"
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.currentCovering.coveringFound || ''}
                onChange={(e) =>
                  updateSubField('currentCovering', { coveringFound: e.target.value })
                }
              />
            </div>
          </div>

          {/* 20. Curativo Realizado */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>20. Curativo Realizado</span>
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Procedimento de Curativo Realizado Neste Atendimento?
              </label>
              <div className="flex gap-2">
                {['Não', 'Sim'].map((ans) => (
                  <button
                    key={ans}
                    type="button"
                    onClick={() => updateSubField('dressingProcedure', { performed: ans })}
                    className={`px-4 py-1.5 text-xs rounded-lg border transition-colors ${
                      form.dressingProcedure.performed === ans
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>

            {form.dressingProcedure.performed === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Solução de Limpeza
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Solução Fisiológica 0,9%, PHMB"
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.dressingProcedure.cleansingSolution || ''}
                    onChange={(e) =>
                      updateSubField('dressingProcedure', { cleansingSolution: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Técnica de Limpeza
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: jateamento com agulha e seringa, irrigação suave"
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.dressingProcedure.cleansingTechnique || ''}
                    onChange={(e) =>
                      updateSubField('dressingProcedure', { cleansingTechnique: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cobertura Primária
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alginato de cálcio, Hidrogel"
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.dressingProcedure.primaryDressing || ''}
                    onChange={(e) =>
                      updateSubField('dressingProcedure', { primaryDressing: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fixação / Cobertura Secundária
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: gaze estéril e fita microporosa, filme transparente"
                    className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                    value={form.dressingProcedure.fixation || ''}
                    onChange={(e) =>
                      updateSubField('dressingProcedure', { fixation: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* 21. Produtos Utilizados */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>21. Produtos Utilizados</span>
            </h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Inserir produto (ex: Hidrogel, Alginato de cálcio)"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={newProductInput}
                  onChange={(e) => setNewProductInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {form.productsUsed.products.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.productsUsed.products.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-900 text-xs rounded-lg"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 22. Resposta Observada */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>22. Resposta Observada</span>
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tolerância do paciente ao procedimento
              </label>
              <input
                type="text"
                placeholder="Ex: procedimento bem tolerado, sem queixas álgicas agudas"
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.observedResponse.patientTolerance || ''}
                onChange={(e) =>
                  updateSubField('observedResponse', { patientTolerance: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
            >
              Próximo: Conduta e Síntese
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Comparação, Conduta e Informações Adicionais */}
      {activeStep === 5 && (
        <div className="space-y-6">
          {/* 23. Comparação com Avaliação Anterior */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>23. Comparação com Avaliação Anterior</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                'primeira avaliação',
                'estável / sem alterações',
                'melhora observada',
                'regressão / piora observada',
                'não aplicável',
              ].map((c) => (
                <label
                  key={c}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer capitalize ${
                    form.previousComparison.comparison === c
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="comparison"
                    checked={form.previousComparison.comparison === c}
                    onChange={() => updateSubField('previousComparison', { comparison: c })}
                    className="text-teal-700 focus:ring-teal-600"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Detalhamento comparativo
              </label>
              <input
                type="text"
                placeholder="Ex: redução de 1 cm na extensão do comprimento em relação à avaliação prévia"
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.previousComparison.comparisonNotes || ''}
                onChange={(e) =>
                  updateSubField('previousComparison', { comparisonNotes: e.target.value })
                }
              />
            </div>
          </div>

          {/* 24. Conduta Registrada pelo Enfermeiro */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>24. Conduta Registrada pelo Enfermeiro</span>
              </h2>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Prescrição de Enfermagem
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Periodicidade / Troca de Curativo
                </label>
                <input
                  type="text"
                  placeholder="Ex: troca a cada 24 horas ou se apresentar saturação/descolamento"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.nurseConduct.dressingFrequency || ''}
                  onChange={(e) =>
                    updateSubField('nurseConduct', { dressingFrequency: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Orientações Prestadas
                </label>
                <input
                  type="text"
                  placeholder="Ex: orientado alívio de pressão e reposicionamento a cada 2h"
                  className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                  value={form.nurseConduct.guidance || ''}
                  onChange={(e) =>
                    updateSubField('nurseConduct', { guidance: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 25. Informações Adicionais */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span>25. Informações Adicionais</span>
            </h2>
            <div>
              <textarea
                rows={3}
                placeholder="Observações complementares de enfermagem..."
                className="w-full text-xs rounded-lg border-slate-200 focus:ring-teal-600"
                value={form.additionalInfo.notes || ''}
                onChange={(e) =>
                  updateSubField('additionalInfo', { notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              Finalizar e Visualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
