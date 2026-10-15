import React from 'react';

export interface RupiahInputProps {
  label?: string;
  required?: boolean;
  value: number;
  onChange: (numericValue: number) => void;
  placeholder?: string;
  className?: string;
  presets?: number[];
  helperText?: string;
}

/**
 * Format angka ke string format ribuan Indonesia dengan titik (contoh: 500.000)
 */
export const formatNumberWithDots = (num: number): string => {
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('id-ID');
};

/**
 * Komponen input uang Rupiah berstandar Indonesia:
 * - Prefix 'Rp' permanen dan elegan
 * - Otomatis format titik pemisah ribuan saat diketik (misal: 500.000 -> 5.000.000)
 * - Nilai balik (onChange) tetap berupa angka murni (number)
 */
export const RupiahInput: React.FC<RupiahInputProps> = ({
  label,
  required = false,
  value,
  onChange,
  placeholder = '0',
  className = '',
  presets,
  helperText,
}) => {
  const displayString = value ? value.toLocaleString('id-ID') : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ambil hanya digit angka
    const rawDigits = e.target.value.replace(/\D/g, '');
    const parsed = parseInt(rawDigits, 10) || 0;
    onChange(parsed);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </span>
          {value > 0 && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Rp {value.toLocaleString('id-ID')}
            </span>
          )}
        </label>
      )}

      {/* Input container with fixed 'Rp' prefix */}
      <div className="relative flex items-center rounded-2xl border border-slate-300 bg-white overflow-hidden focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-xs">
        <div className="px-3.5 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-600 font-black text-xs sm:text-sm select-none">
          Rp
        </div>
        <input
          type="text"
          inputMode="numeric"
          required={required}
          value={displayString}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full text-xs sm:text-sm font-black text-slate-900 px-3.5 py-2.5 focus:outline-none placeholder:text-slate-400 placeholder:font-normal font-mono"
        />
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 font-medium">{helperText}</p>
      )}

      {/* Optional Preset Chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {presets.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => onChange(preset)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                value === preset
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Rp {preset.toLocaleString('id-ID')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
