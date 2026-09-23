import React from 'react';
import { Plus, Trash2, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { InvasiveDeviceItem } from '../../types/clinical';
import { ClinicalOptionGroup } from './ClinicalOptionGroup';
import { ClinicalTextInput, ClinicalTextarea } from './ClinicalInputs';

export interface DeviceFormCardProps {
  devices?: InvasiveDeviceItem[];
  onChange?: (devices: any) => void;
  device?: InvasiveDeviceItem;
  onRemove?: () => void;
  availableTypes?: { value: string; label: string; description?: string }[];
}

const DEVICE_TYPES = [
  { value: 'AVP', label: 'AVP', description: 'Acesso Venoso Periférico' },
  { value: 'CVC', label: 'CVC', description: 'Cateter Venoso Central' },
  { value: 'PICC', label: 'PICC', description: 'Cateter Central de Inserção Periférica' },
  { value: 'SVD', label: 'SVD', description: 'Sonda Vesical de Demora' },
  { value: 'SNE', label: 'SNE', description: 'Sonda Nasoenteral' },
  { value: 'SNG', label: 'SNG', description: 'Sonda Nasogástrica' },
  { value: 'GTT', label: 'GTT', description: 'Gastrostomia' },
  { value: 'Dreno de tórax', label: 'Dreno de tórax', description: 'Dreno torácico tubular / selo dágua' },
  { value: 'Dreno abdominal', label: 'Dreno abdominal', description: 'Dreno abdominal' },
  { value: 'Dreno cirúrgico', label: 'Dreno cirúrgico', description: 'Dreno cirúrgico (ex: Portovac, Penrose)' },
  { value: 'PAI', label: 'PAI', description: 'Pressão Arterial Invasiva' },
  { value: 'CDL', label: 'CDL', description: 'Cateter Duplo Lúmen' },
  { value: 'Outro', label: 'Outro', description: 'Outro dispositivo invasivo' },
];

export const DeviceFormCard: React.FC<DeviceFormCardProps> = ({
  devices,
  onChange,
  device,
  onRemove,
  availableTypes,
}) => {
  const currentTypes = availableTypes || DEVICE_TYPES;
  // If single device is passed
  if (device) {
    const handleUpdate = (updates: Partial<InvasiveDeviceItem>) => {
      if (onChange) {
        onChange({ ...device, ...updates });
      }
    };

    return (
      <div className="space-y-4">
        <ClinicalOptionGroup
          label="Tipo de dispositivo"
          required
          options={currentTypes}
          value={device.type}
          onChange={(val) => handleUpdate({ type: val as any })}
          columns={3}
        />

        {device.type === 'Outro' && (
          <ClinicalTextInput
            label="Descrição do dispositivo"
            value={device.customType}
            onChange={(val) => handleUpdate({ customType: val })}
            placeholder="Ex: Introdutor valvulado, dreno..."
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicalTextInput
            label="Localização anatômica"
            required
            value={device.location}
            onChange={(val) => handleUpdate({ location: val })}
            placeholder="Ex: MSD, Jugular interna D, Femoral E..."
          />
          <ClinicalTextInput
            label="Data de inserção"
            sublabel="Opcional"
            value={device.insertionDate}
            onChange={(val) => handleUpdate({ insertionDate: val })}
            placeholder="Ex: DD/MM/AAAA ou Hoje"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ClinicalOptionGroup
            label="Perviedade"
            options={['Pérvio', 'Não pérvio', 'Não avaliado']}
            value={device.permeability}
            onChange={(val) => handleUpdate({ permeability: val as any })}
          />
          <ClinicalOptionGroup
            label="Funcionamento"
            options={['Funcionante', 'Alterado', 'Não avaliado']}
            value={device.functioning}
            onChange={(val) => handleUpdate({ functioning: val as any })}
          />
        </div>

        {Boolean(/dreno/i.test(device.type) || /dreno/i.test(device.customType || '')) && (
          <ClinicalTextInput
            label="Aspecto do débito (se informado)"
            sublabel="Opcional - registrar exclusivamente a informação observada"
            value={device.drainAspect || ''}
            onChange={(val) => handleUpdate({ drainAspect: val })}
            placeholder="Ex: Débito seroso, sero-hemático, hemático, bilioso..."
          />
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Condição do Curativo
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleUpdate({ dressingClean: !device.dressingClean })}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                device.dressingClean
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Limpo</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdate({ dressingDry: !device.dressingDry })}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                device.dressingDry
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Seco</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdate({ dressingIntact: !device.dressingIntact })}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                device.dressingIntact
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Íntegro</span>
            </button>
          </div>
        </div>

        <ClinicalOptionGroup
          label="Sinais flogísticos no sítio"
          options={['Ausentes', 'Presentes', 'Não avaliados']}
          value={device.phlogisticSigns}
          onChange={(val) => handleUpdate({ phlogisticSigns: val as any })}
        />

        {device.phlogisticSigns === 'Presentes' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Descreva os sinais flogísticos observados</span>
            </div>
            <ClinicalTextInput
              label="Hiperemia, calor, secreção, dor..."
              value={device.phlogisticSignsDetails}
              onChange={(val) => handleUpdate({ phlogisticSignsDetails: val })}
              placeholder="Ex: Hiperemia discreta e calor local sem secreção..."
            />
          </div>
        )}

        <ClinicalTextarea
          label="Observações do dispositivo"
          sublabel="Opcional"
          value={device.observations}
          onChange={(val) => handleUpdate({ observations: val })}
          placeholder="Ex: Trocado curativo com película transparente, sem queixas."
          rows={2}
        />
      </div>
    );
  }

  const deviceList = devices || [];

  const addDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random()}`,
      type: '',
      location: '',
      permeability: '',
      functioning: '',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: '',
    };
    if (onChange) {
      onChange([...deviceList, newDev]);
    }
  };

  const removeDevice = (id: string) => {
    if (onChange) {
      onChange(deviceList.filter((d) => d.id !== id));
    }
  };

  const updateDevice = (id: string, updates: Partial<InvasiveDeviceItem>) => {
    if (onChange) {
      onChange(
        deviceList.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    }
  };

  return (
    <div className="space-y-4">
      {deviceList.map((item, index) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 relative"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              Dispositivo #{index + 1} {item.type ? `— ${item.type}` : ''}
            </span>
            <button
              type="button"
              onClick={() => removeDevice(item.id)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1 rounded hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover</span>
            </button>
          </div>

          <ClinicalOptionGroup
            label="Tipo de dispositivo"
            required
            options={currentTypes}
            value={item.type}
            onChange={(val) => updateDevice(item.id, { type: val as any })}
            columns={3}
          />

          {item.type === 'Outro' && (
            <ClinicalTextInput
              label="Descrição do dispositivo"
              value={item.customType}
              onChange={(val) => updateDevice(item.id, { customType: val })}
              placeholder="Ex: Introdutor valvulado, dreno..."
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClinicalTextInput
              label="Localização anatômica"
              required
              value={item.location}
              onChange={(val) => updateDevice(item.id, { location: val })}
              placeholder="Ex: MSD, Jugular interna D, Femoral E..."
            />
            <ClinicalTextInput
              label="Data de inserção"
              sublabel="Opcional"
              value={item.insertionDate}
              onChange={(val) => updateDevice(item.id, { insertionDate: val })}
              placeholder="Ex: DD/MM/AAAA ou Hoje"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClinicalOptionGroup
              label="Perviedade"
              options={['Pérvio', 'Não pérvio', 'Não avaliado']}
              value={item.permeability}
              onChange={(val) => updateDevice(item.id, { permeability: val as any })}
            />
            <ClinicalOptionGroup
              label="Funcionamento"
              options={['Funcionante', 'Alterado', 'Não avaliado']}
              value={item.functioning}
              onChange={(val) => updateDevice(item.id, { functioning: val as any })}
            />
          </div>

          {Boolean(/dreno/i.test(item.type) || /dreno/i.test(item.customType || '')) && (
            <ClinicalTextInput
              label="Aspecto do débito (se informado)"
              sublabel="Opcional - registrar exclusivamente a informação observada"
              value={item.drainAspect || ''}
              onChange={(val) => updateDevice(item.id, { drainAspect: val })}
              placeholder="Ex: Débito seroso, sero-hemático, hemático, bilioso..."
            />
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Condição do Curativo
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  updateDevice(item.id, { dressingClean: !item.dressingClean })
                }
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  item.dressingClean
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Limpo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateDevice(item.id, { dressingDry: !item.dressingDry })
                }
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  item.dressingDry
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Seco</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateDevice(item.id, { dressingIntact: !item.dressingIntact })
                }
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  item.dressingIntact
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Íntegro</span>
              </button>
            </div>
          </div>

          <ClinicalOptionGroup
            label="Sinais flogísticos no sítio"
            options={['Ausentes', 'Presentes', 'Não avaliados']}
            value={item.phlogisticSigns}
            onChange={(val) => updateDevice(item.id, { phlogisticSigns: val as any })}
          />

          {item.phlogisticSigns === 'Presentes' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Descreva os sinais flogísticos observados</span>
              </div>
              <ClinicalTextInput
                label="Hiperemia, calor, secreção, dor..."
                value={item.phlogisticSignsDetails}
                onChange={(val) => updateDevice(item.id, { phlogisticSignsDetails: val })}
                placeholder="Ex: Hiperemia discreta e calor local sem secreção..."
              />
            </div>
          )}

          <ClinicalTextarea
            label="Observações do dispositivo"
            sublabel="Opcional"
            value={item.observations}
            onChange={(val) => updateDevice(item.id, { observations: val })}
            placeholder="Ex: Trocado curativo com película transparente, sem queixas."
            rows={2}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addDevice}
        className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-teal-700 bg-white hover:bg-teal-50/50 text-teal-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar Dispositivo Invasivo (AVP, CVC, PAI, PICC...)</span>
      </button>
    </div>
  );
};
