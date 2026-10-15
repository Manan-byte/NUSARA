import React, { useState } from 'react';
import { WargaRecord } from '@sim-warga/types';
import { RondaWithStatus } from '../../ronda/JadwalRondaCard';
import { X, Shield, Plus, Trash2, Sparkles } from 'lucide-react';

interface RondaSlotItem {
  slot: number;
  namaLengkap: string;
  blokRumah: string;
}

interface RondaEditModalProps {
  ronda: RondaWithStatus;
  wargaList: WargaRecord[];
  onClose: () => void;
  onSave: (updated: RondaWithStatus) => void;
}

export const RondaEditModal: React.FC<RondaEditModalProps> = ({
  ronda,
  wargaList,
  onClose,
  onSave,
}) => {
  const [slots, setSlots] = useState<RondaSlotItem[]>(() =>
    (ronda.petugas || []).map((p, idx) => ({
      slot: p.slot || idx + 1,
      namaLengkap: p.namaLengkap || '',
      blokRumah: p.blokRumah || '',
    }))
  );

  const handleAddSlot = () => {
    setSlots((prev) => [
      ...prev,
      { slot: prev.length + 1, namaLengkap: '', blokRumah: '' },
    ]);
  };

  const handleRemoveSlot = (idx: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAiRandomRonda = () => {
    if (wargaList.length === 0) return;
    const shuffled = [...wargaList].sort(() => Math.random() - 0.5);
    setSlots((prev) =>
      prev.map((slot, idx) => {
        const w = shuffled[idx % shuffled.length];
        return {
          slot: slot.slot,
          namaLengkap: w.namaLengkap,
          blokRumah: w.alamatRumah.replace('Blok ', ''),
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RondaWithStatus = {
      ...ronda,
      petugas: slots.map((s, idx) => ({
        slot: idx + 1,
        namaLengkap: s.namaLengkap.trim() || `Petugas ${idx + 1}`,
        blokRumah: s.blokRumah.trim() || '-',
        isKoordinator: idx === 0,
      })),
    };
    onSave(updated);
    onClose();
  };

  const inputClass =
    'h-9 px-3 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] focus:ring-2 focus:ring-[#0B484C]/20 bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-bold transition-all shadow-xs focus:outline-none text-xs';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#072426] max-w-xl w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1C221E] dark:text-white">
                Edit Petugas Siskamling — {ronda.hari}
              </h3>
              <p className="text-[10px] text-stone-400 font-semibold">
                {ronda.tanggal} • {ronda.jamOperasional || '22:00 - 04:00 WIB'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-xs"
              >
                <span
                  className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                    idx === 0
                      ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500 shadow-xs'
                      : 'bg-[#0B484C] text-[#F3D37A]'
                  }`}
                >
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={slot.namaLengkap}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSlots((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, namaLengkap: val } : s))
                    );
                  }}
                  placeholder={`Nama Petugas ${idx + 1} ${idx === 0 ? '(Koordinator)' : ''}...`}
                  className={`flex-1 ${inputClass}`}
                />
                <input
                  type="text"
                  value={slot.blokRumah}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSlots((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, blokRumah: val } : s))
                    );
                  }}
                  placeholder="Blok (D8/1)..."
                  className={`w-28 text-center ${inputClass}`}
                />
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(idx)}
                    className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 border border-transparent hover:border-rose-200"
                    title="Hapus Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-2 border-y-2 border-stone-200 dark:border-stone-700 text-xs">
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#0B484C] dark:text-[#F3D37A] font-bold border-2 border-stone-300 dark:border-stone-600 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Anggota (Slot Baru)</span>
            </button>

            <button
              type="button"
              onClick={handleAiRandomRonda}
              className="px-3.5 py-2 rounded-xl bg-[#FEF6DF] dark:bg-amber-950/60 text-[#092C2E] dark:text-[#F3D37A] font-extrabold border-2 border-[#D9B352]/70 flex items-center gap-1.5 shadow-xs transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
              <span>AI Acak Giliran</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs border-2 border-stone-300 dark:border-stone-600 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold text-xs shadow-md hover:bg-[#093A3E] transition-all"
            >
              Simpan Petugas Ronda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
