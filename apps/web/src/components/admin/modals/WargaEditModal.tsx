import React, { useState } from 'react';
import {
  WargaRecord,
  JenisKelamin,
  StatusTempatTinggal,
  Agama,
  StatusPernikahan,
  StatusDalamKeluarga,
  StatusIPL,
} from '@sim-warga/types';
import { X, Edit3, Lock, ShieldCheck, Sparkles, Clock, Info } from 'lucide-react';
import { ALL_BLOK_AZ_OPTIONS } from './AddWargaModal';
import { CustomSelect } from '../../common/CustomSelect';

interface WargaEditModalProps {
  warga: WargaRecord;
  tarifIpl: number;
  onClose: () => void;
  onSave: (origKey: string, updated: WargaRecord) => Promise<void> | void;
}

export const WargaEditModal: React.FC<WargaEditModalProps> = ({
  warga,
  tarifIpl,
  onClose,
  onSave,
}) => {
  const [nama, setNama] = useState<string>(warga.namaLengkap);
  const [gender, setGender] = useState<JenisKelamin>(warga.jenisKelamin || 'Laki-laki');
  const [blok, setBlok] = useState<string>(
    warga.blok.replace(/[^A-Za-z]/g, '').toUpperCase() || 'D'
  );
  const [noRumah, setNoRumah] = useState<string>(warga.noRumah || '1');
  const [wa, setWa] = useState<string>(warga.noWhatsapp || '');
  const [domisili, setDomisili] = useState<StatusTempatTinggal>(
    warga.statusTempatTinggal || 'Menetap'
  );
  const [pekerjaan, setPekerjaan] = useState<string>(warga.pekerjaan || 'Karyawan Swasta');
  const [agama, setAgama] = useState<Agama>(warga.agama || 'Islam');
  const [nikah, setNikah] = useState<StatusPernikahan>(warga.statusPernikahan || 'Menikah');
  const [hubungan, setHubungan] = useState<StatusDalamKeluarga>(
    warga.statusDalamKeluarga || 'Kepala Keluarga'
  );
  const [jiwa, setJiwa] = useState<string>(String(warga.jmlJiwa || 3));
  const [anggotaTambahan, setAnggotaTambahan] = useState<string>(
    warga.anggotaKeluargaTambahan || '-'
  );
  const [statusIpl, setStatusIpl] = useState<StatusIPL>(warga.statusIpl || 'Belum Bayar');
  const [periodeIpl, setPeriodeIpl] = useState<string>(warga.periodeTercover || 'Oktober 2026');
  const [nominalIpl, setNominalIpl] = useState<string>(String(warga.nominalIpl || tarifIpl || 30000));
  const [catatan, setCatatan] = useState<string>(warga.catatan || '');
  const [pin, setPin] = useState<string>(warga.pin || '1234');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAutoGenerateCatatan = () => {
    const iplSummary =
      statusIpl === 'Lunas' ? `Lunas IPL (${periodeIpl})` : `Status IPL: ${statusIpl}`;
    const domisiliSummary = `Hunian: ${domisili}`;
    const pinSummary = `PIN: ${pin || '1234'}`;
    const generated = `ID: ${warga.id || '#WRG'} • ${iplSummary} • ${domisiliSummary} • ${pinSummary}`;
    setCatatan(generated);
  };

  const handleAppendAuditLog = () => {
    const today = '14 Okt 2026';
    const log = `[Update ${today}: IPL ${statusIpl}, ${domisili}]`;
    if (!catatan.trim()) {
      setCatatan(log);
    } else if (!catatan.includes(log)) {
      setCatatan(`${catatan.trim()} • ${log}`);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const origKey = warga.id || warga.alamatRumah;
      const cleanBlok = blok.trim().toUpperCase();
      const cleanNo = noRumah.trim();
      const updated: WargaRecord = {
        ...warga,
        namaLengkap: nama.trim() || warga.namaLengkap,
        jenisKelamin: gender,
        blok: cleanBlok,
        noRumah: cleanNo,
        alamatRumah: `Blok ${cleanBlok} No. ${cleanNo}`,
        noWhatsapp: wa.trim() || '-',
        statusTempatTinggal: domisili,
        pekerjaan: pekerjaan.trim() || 'Karyawan Swasta',
        agama: agama,
        statusPernikahan: nikah,
        statusDalamKeluarga: hubungan,
        jmlJiwa: Math.max(1, parseInt(jiwa, 10) || 1),
        anggotaKeluargaTambahan: anggotaTambahan.trim() || '-',
        statusIpl: statusIpl,
        periodeTercover: periodeIpl.trim() || 'Oktober 2026',
        nominalIpl: parseInt(nominalIpl, 10) || tarifIpl || 30000,
        catatan: catatan.trim() || 'Diperbarui Pengurus',
        tanggalUpdate: '13 Okt 2026',
        pin: pin.trim() || warga.pin || '1234',
      };
      await onSave(origKey, updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'w-full h-10 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] focus:ring-2 focus:ring-[#0B484C]/20 bg-white dark:bg-[#051E20] text-[#1C221E] dark:text-white font-bold transition-all shadow-xs focus:outline-none text-xs';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#072426] max-w-2xl w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C221E] dark:text-white">
                Edit Data Warga: {warga.namaLengkap}
              </h3>
              <p className="text-xs text-stone-400 font-semibold">
                {warga.alamatRumah} • ID: {warga.id || '-'}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SEKSI 1: IDENTITAS UTAMA */}
          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0B484C] dark:text-[#F3D37A] block">
              1. Identitas Kepala Keluarga &amp; Rumah
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Lengkap Kepala Keluarga *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Jenis Kelamin
                </label>
                <CustomSelect
                  value={gender}
                  onChange={(val) => setGender(val as JenisKelamin)}
                  options={['Laki-laki', 'Perempuan']}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Blok Rumah *
                </label>
                <CustomSelect
                  value={blok}
                  onChange={(val) => setBlok(val)}
                  options={ALL_BLOK_AZ_OPTIONS.map((b) => ({ value: b, label: `Blok ${b}` }))}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Rumah *
                </label>
                <input
                  type="text"
                  required
                  value={noRumah}
                  onChange={(e) => setNoRumah(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Status Domisili
                </label>
                <CustomSelect
                  value={domisili}
                  onChange={(val) => setDomisili(val as StatusTempatTinggal)}
                  options={['Menetap', 'Pulang-Pergi', 'Belum menetap']}
                  buttonClassName={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SEKSI 2: SOSIAL & KELUARGA */}
          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0B484C] dark:text-[#F3D37A] block">
              2. Data Sosial &amp; Anggota Keluarga
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Agama
                </label>
                <CustomSelect
                  value={agama}
                  onChange={(val) => setAgama(val as Agama)}
                  options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Status Nikah
                </label>
                <CustomSelect
                  value={nikah}
                  onChange={(val) => setNikah(val as StatusPernikahan)}
                  options={['Belum menikah', 'Menikah', 'Cerai hidup', 'Cerai mati']}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Hubungan Keluarga
                </label>
                <CustomSelect
                  value={hubungan}
                  onChange={(val) => setHubungan(val as StatusDalamKeluarga)}
                  options={['Kepala Keluarga', 'Suami', 'Istri', 'Anak', 'Lainnya']}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Jumlah Jiwa (Total)
                </label>
                <input
                  type="number"
                  min="1"
                  value={jiwa}
                  onChange={(e) => setJiwa(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Anggota Keluarga Tambahan
                </label>
                <input
                  type="text"
                  value={anggotaTambahan}
                  onChange={(e) => setAnggotaTambahan(e.target.value)}
                  placeholder="Cth: Ibu Maya (Istri), 2 Anak..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SEKSI 3: KEUANGAN & PIN */}
          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0B484C] dark:text-[#F3D37A] block">
              3. Status IPL, Kuitansi &amp; PIN Akun
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Status Bayar IPL
                </label>
                <CustomSelect
                  value={statusIpl}
                  onChange={(val) => setStatusIpl(val as StatusIPL)}
                  options={['Belum Bayar', 'Lunas', 'Menunggu Verifikasi', 'Ditolak']}
                  buttonClassName={inputClass}
                  dropUp={true}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Periode Tercover
                </label>
                <input
                  type="text"
                  value={periodeIpl}
                  onChange={(e) => setPeriodeIpl(e.target.value)}
                  placeholder="1 Tahun (12 Bln)..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nominal IPL (Rp)
                </label>
                <input
                  type="number"
                  value={nominalIpl}
                  onChange={(e) => setNominalIpl(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Secret PIN Warga
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234..."
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="block font-bold text-stone-700 dark:text-stone-300">
                  Catatan Tambahan Pengurus
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAutoGenerateCatatan}
                    className="px-2.5 py-1 rounded-lg bg-[#FEF6DF] dark:bg-amber-950/60 text-[#092C2E] dark:text-[#F3D37A] border border-[#D9B352]/70 font-extrabold text-[10px] flex items-center gap-1 hover:scale-105 transition-all shadow-2xs"
                    title="Perbarui isi catatan sesuai status terkini di form"
                  >
                    <Sparkles className="w-3 h-3 text-[#0B484C] dark:text-[#F3D37A]" />
                    <span>✨ Sinkronkan Status ke Catatan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAppendAuditLog}
                    className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-600 font-bold text-[10px] flex items-center gap-1 hover:bg-stone-200 transition-all"
                    title="Tambahkan cap riwayat tanggal perubahan"
                  >
                    <Clock className="w-3 h-3" />
                    <span>+ Cap Log Tanggal</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Cth: ID: #WRG-001 • Lunas IPL 1 Tahun • Hunian: Menetap • PIN: 1234..."
                className={inputClass}
              />

              {/* Information & Destination Box */}
              <div className="p-3 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Alur Penyimpanan &amp; Dampak Perubahan Catatan:</span>
                </div>
                <p className="text-[10px] text-blue-700 dark:text-blue-300/80 leading-relaxed">
                  Perubahan catatan ini otomatis tersimpan ke <strong>Google Sheets (tab DATA_WARGA kolom Catatan)</strong> dan <strong>Database Server RT 08</strong> saat Anda klik <em>Simpan Perubahan Lengkap</em>, serta langsung muncul pada kartu warga di menu Direktori KK.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-2 border-stone-300 dark:border-stone-600 font-bold transition-all text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold shadow-md transition-all text-xs"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Lengkap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
