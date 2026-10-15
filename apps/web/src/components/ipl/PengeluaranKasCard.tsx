import React, { useState } from 'react';
import { PillBadge } from '@sim-warga/ui';
import { PengeluaranKasRecord } from '@sim-warga/types';
import {
  ArrowDownRight,
  Plus,
  Trash2,
  Calendar,
  Wallet,
  Receipt,
  Tag,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { CustomSelect } from '../common/CustomSelect';
import { RupiahInput } from '../common/RupiahInput';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
export interface PengeluaranKasCardProps {
  pengeluaranList: PengeluaranKasRecord[];
  isAdmin: boolean;
  onAddPengeluaran: (item: PengeluaranKasRecord) => void;
  onDeletePengeluaran: (id: string) => void;
}

const KATEGORI_OPTIONS = [
  'Sampah & Kebersihan',
  'Keamanan & Satpam',
  'Listrik & PJU',
  'Perbaikan Fasum',
  'Kegiatan Warga',
  'Lainnya',
];

export const PengeluaranKasCard: React.FC<PengeluaranKasCardProps> = ({
  pengeluaranList,
  isAdmin,
  onAddPengeluaran,
  onDeletePengeluaran,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PengeluaranKasRecord | null>(null);

  // Form states
  const [tanggalIso, setTanggalIso] = useState('2026-10-09');
  const [tanggalFormatted, setTanggalFormatted] = useState('9 Oktober 2026');
  const [kategori, setKategori] = useState<PengeluaranKasRecord['kategori']>('Sampah & Kebersihan');
  const [keterangan, setKeterangan] = useState('');
  const [nominalVal, setNominalVal] = useState<number>(500000);
  const [penerima, setPenerima] = useState('');
  const totalPengeluaran = pengeluaranList.reduce((acc, curr) => acc + curr.nominal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim() || nominalVal <= 0) return;

    const newRecord: PengeluaranKasRecord = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      tanggal: tanggalFormatted,
      kategori,
      keterangan: keterangan.trim(),
      nominal: nominalVal,
      penerima: penerima.trim() || 'Petugas Lingkungan',
      createdAt: new Date().toISOString(),
    };

    onAddPengeluaran(newRecord);
    setIsModalOpen(false);
    setKeterangan('');
    setPenerima('');
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm mb-8 select-none transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Transparansi Kas Keluar</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Operasional Komplek</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Catatan Pengeluaran Kas RT
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Rincian penggunaan dana iuran warga untuk kebersihan, satpam pos, listrik PJU, dan fasum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <span className="text-lg sm:text-xl font-black text-rose-600">
              Rp {totalPengeluaran.toLocaleString('id-ID')}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Kas Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Table of Expenditures */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs min-w-[850px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4 whitespace-nowrap w-28">No. Bukti</th>
              <th className="py-3.5 px-4 whitespace-nowrap w-32">Tanggal</th>
              <th className="py-3.5 px-4 whitespace-nowrap w-44">Kategori</th>
              <th className="py-3.5 px-4 min-w-[220px]">Keterangan / Rincian</th>
              <th className="py-3.5 px-4 whitespace-nowrap w-36">Nominal (Rp)</th>
              <th className="py-3.5 px-4 whitespace-nowrap w-52">Penerima Dana</th>
              {isAdmin && <th className="py-3.5 px-4 text-center whitespace-nowrap w-16">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827]">
            {pengeluaranList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  #{item.id}
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  {item.tanggal}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] whitespace-nowrap">
                    <Tag className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span>{item.kategori}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                    {item.keterangan}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white font-mono text-xs sm:text-sm whitespace-nowrap">
                  Rp {item.nominal.toLocaleString('id-ID')}
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  {item.penerima}
                </td>
                {isAdmin && (
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus pencatatan pengeluaran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {pengeluaranList.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold bg-white dark:bg-[#111827]">
            Belum ada catatan pengeluaran kas komplek.
          </div>
        )}
      </div>

      {/* Modal Admin: Catat Pengeluaran Kas Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Catat Pengeluaran Kas Operasional
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 mb-5">
              Pencatatan resmi dana kas yang dikeluarkan oleh bendahara/pengurus RT 08.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Tanggal dengan CustomDatePicker */}
              <CustomDatePicker
                label="Tanggal Pengeluaran"
                required
                valueIso={tanggalIso}
                onChange={(iso, _, formatted) => {
                  setTanggalIso(iso);
                  setTanggalFormatted(formatted);
                }}
              />

              {/* Kategori dengan CustomSelect */}
              <CustomSelect
                label="Kategori Pengeluaran"
                required
                value={kategori}
                onChange={(val) => setKategori(val as PengeluaranKasRecord['kategori'])}
                options={KATEGORI_OPTIONS}
              />

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Keterangan / Rincian Belanja *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Honor 2 Petugas Satpam Pos Gerbang Utama"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <RupiahInput
                  label="Nominal Pengeluaran Kas (Rp)"
                  required
                  value={nominalVal}
                  onChange={(val) => setNominalVal(val)}
                  presets={[50000, 100000, 250000, 500000, 1000000]}
                  helperText="Format rupiah otomatis dengan titik pemisah ribuan."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Penerima Dana / Pihak Ketiga</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Joko (Satpam) / PLN / Toko Bangunan Berkah"
                  value={penerima}
                  onChange={(e) => setPenerima(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Masukkan nama orang atau toko penerima dana (bukan angka).
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/20"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeletePengeluaran(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        title="Hapus Catatan Pengeluaran Kas"
        itemName={itemToDelete ? `${itemToDelete.keterangan} (Rp ${itemToDelete.nominal.toLocaleString('id-ID')})` : undefined}
      />
    </div>
  );
};
