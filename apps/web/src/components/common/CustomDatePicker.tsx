import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CustomDatePickerProps {
  label?: string;
  required?: boolean;
  valueIso: string; // e.g. "2026-10-09"
  onChange: (isoDate: string, dayName: string, formattedText: string) => void;
  className?: string;
}

const NAMA_HARI = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label = 'Pilih Tanggal',
  required = false,
  valueIso,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected or default to today
  const selectedDate = valueIso ? new Date(valueIso + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth()); // 0-indexed

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update view when valueIso changes
  useEffect(() => {
    if (valueIso) {
      const d = new Date(valueIso + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [valueIso]);

  // Calendar logic
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const iso = `${viewYear}-${monthStr}-${dayStr}`;

    const dateObj = new Date(viewYear, viewMonth, day);
    const dayName = NAMA_HARI[dateObj.getDay()];
    const formatted = `${day} ${NAMA_BULAN[viewMonth]} ${viewYear}`;

    onChange(iso, dayName, formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Quick select today
  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dayName = NAMA_HARI[now.getDay()];
    const formatted = `${now.getDate()} ${NAMA_BULAN[now.getMonth()]} ${now.getFullYear()}`;
    onChange(iso, dayName, formatted);
    setIsOpen(false);
  };

  // Format label display
  const currentDayName = selectedDate ? NAMA_HARI[selectedDate.getDay()] : 'KAMIS';
  const displayFormatted = selectedDate
    ? `${currentDayName}, ${selectedDate.getDate()} ${NAMA_BULAN[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : 'Pilih tanggal...';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] bg-emerald-50 dark:bg-stone-800 px-2 py-0.2 rounded-full border border-emerald-200/80 dark:border-stone-700">
            {currentDayName}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 flex items-center justify-between text-left text-xs font-bold bg-[#F8F8F6] dark:bg-stone-800 border rounded-xl px-3 transition-all duration-150 select-none ${
          isOpen
            ? 'border-[#0B484C] ring-2 ring-[#0B484C]/15 shadow-xs'
            : 'border-stone-200/80 dark:border-stone-700 hover:border-[#0B484C]/50 text-[#1C221E] dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-black text-[11px] flex-shrink-0">
            {selectedDate.getDate()}
          </span>
          <span className="text-xs font-extrabold text-[#1C221E] dark:text-white truncate">
            {displayFormatted}
          </span>
        </div>

        <CalendarIcon className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A] flex-shrink-0" />
      </button>

      {/* Clean, Compact Floating Calendar Popup (No Spill, No Overflow) */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full sm:w-[300px] bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/15 p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Header: Month & Year + Today Button + Nav Arrows */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 tracking-tight">
              {NAMA_BULAN[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200 mr-1"
                title="Pilih hari ini"
              >
                Hari Ini
              </button>

              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Day Initials Row (Min, Sen, Sel, Rab, Kam, Jum, Sab) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Days Numbers Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Prev month fill */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`prev-${i}`} className="p-1.5 text-slate-300 font-medium text-[11px]">
                {prevMonthDays - firstDayIndex + i + 1}
              </span>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === dayNumber;

              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === dayNumber;

              return (
                <button
                  type="button"
                  key={`cur-${dayNumber}`}
                  onClick={() => handleSelectDay(dayNumber)}
                  className={`p-1.5 rounded-xl font-bold transition-all text-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                      : isToday
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
