import React, { useState } from 'react';
import { Clock, Sparkles, Check } from 'lucide-react';

export interface TimePresetPickerProps {
  label?: string;
  value: string; // e.g. "22:00 - 04:00 WIB"
  onChange: (val: string) => void;
  className?: string;
}

const PRESET_SHIFTS = [
  {
    id: 'standar',
    label: '22:00 - 04:00 WIB',
    title: 'Standar Siskamling',
    desc: 'Shift umum pos ronda malam',
  },
  {
    id: 'awal',
    label: '21:00 - 03:00 WIB',
    title: 'Shift Awal',
    desc: 'Mulai lebih awal dari jam 9 malam',
  },
  {
    id: 'larut',
    label: '23:00 - 05:00 WIB',
    title: 'Shift Larut',
    desc: 'Patroli hingga azan subuh',
  },
  {
    id: 'weekend',
    label: '21:00 - 05:00 WIB',
    title: 'Siaga Penuh Weekend',
    desc: 'Pengawasan ekstra malam libur',
  },
];

export const TimePresetPicker: React.FC<TimePresetPickerProps> = ({
  label = 'Jam Operasional Tugas Ronda',
  value,
  onChange,
  className = '',
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [startTime, setStartTime] = useState('22:00');
  const [endTime, setEndTime] = useState('04:00');

  const handleSelectPreset = (shiftValue: string) => {
    setIsCustom(false);
    onChange(shiftValue);
  };

  const handleCustomApply = () => {
    onChange(`${startTime} - ${endTime} WIB`);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{label}</span>
          </span>
          <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {value}
          </span>
        </label>
      )}

      {/* Preset Shift Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESET_SHIFTS.map((shift) => {
          const isSelected = value === shift.label && !isCustom;
          return (
            <button
              type="button"
              key={shift.id}
              onClick={() => handleSelectPreset(shift.label)}
              className={`text-left p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                    {shift.label}
                  </span>
                </div>
                <span className={`text-[11px] block mt-0.5 font-medium ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {shift.title}
                </span>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Time Option Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsCustom(!isCustom)}
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
        >
          <span>{isCustom ? 'Tutup Pilihan Jam Kustom' : '+ Mau atur jam kustom sendiri?'}</span>
        </button>

        {isCustom && (
          <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Mulai:</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  onChange(`${e.target.value} - ${endTime} WIB`);
                }}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Sampai:</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  onChange(`${startTime} - ${e.target.value} WIB`);
                }}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <span className="text-xs font-bold text-slate-500">WIB</span>
          </div>
        )}
      </div>
    </div>
  );
};
