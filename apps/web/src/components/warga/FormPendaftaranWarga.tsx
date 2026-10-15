import React, { useState } from 'react';
import { PillBadge } from '@sim-warga/ui';
import {
  WargaRecord,
  JenisKelamin,
  StatusTempatTinggal,
  Agama,
  StatusPernikahan,
  StatusDalamKeluarga,
} from '@sim-warga/types';
import {
  CheckCircle2,
  User,
  Home,
  Phone,
  Users,
  Send,
  AlertCircle,
  FileText,
  UserPlus,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

export interface FormPendaftaranWargaProps {
  onSubmit: (warga: WargaRecord) => void;
  onCancel?: () => void;
}

export const FormPendaftaranWarga: React.FC<FormPendaftaranWargaProps> = ({
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<WargaRecord>>({
    namaLengkap: '',
    jenisKelamin: 'Laki-laki',
    blok: 'E',
    noRumah: '',
    noWhatsapp: '',
    statusTempatTinggal: 'Menetap',
    pekerjaan: '',
    agama: 'Islam',
    statusPernikahan: 'Menikah',
    statusDalamKeluarga: 'Kepala Keluarga',
    jmlJiwa: 1,
    anggotaKeluargaTambahan: '',
    catatan: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jmlJiwa' ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.namaLengkap?.trim()) {
      setErrorMsg('Nama lengkap wajib diisi sesuai KTP/identitas.');
      return;
    }
    if (!formData.noRumah?.trim()) {
      setErrorMsg('Nomor rumah wajib diisi.');
      return;
    }
    if (!formData.noWhatsapp?.trim() || !formData.noWhatsapp.startsWith('08')) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi (diawali 08...).');
      return;
    }

    const newRecord: WargaRecord = {
      namaLengkap: formData.namaLengkap.trim(),
      jenisKelamin: (formData.jenisKelamin as JenisKelamin) || 'Laki-laki',
      blok: formData.blok || 'E',
      noRumah: formData.noRumah.trim(),
      alamatRumah: `Blok ${formData.blok} No. ${formData.noRumah.trim()}`,
      noWhatsapp: formData.noWhatsapp.trim(),
      statusTempatTinggal: (formData.statusTempatTinggal as StatusTempatTinggal) || 'Menetap',
      pekerjaan: formData.pekerjaan?.trim() || '-',
      agama: (formData.agama as Agama) || 'Islam',
      statusPernikahan: (formData.statusPernikahan as StatusPernikahan) || 'Menikah',
      statusDalamKeluarga: (formData.statusDalamKeluarga as StatusDalamKeluarga) || 'Kepala Keluarga',
      jmlJiwa: formData.jmlJiwa || 1,
      anggotaKeluargaTambahan: formData.anggotaKeluargaTambahan?.trim() || '-',
      statusIpl: 'Belum Bayar',
      periodeTercover: 'Oktober 2026',
      nominalIpl: 150000,
      tanggalUpdate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      catatan: formData.catatan?.trim() || '-',
    };

    onSubmit(newRecord);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 border border-blue-200 dark:border-blue-900 shadow-sm select-none">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Pendaftaran Berhasil Dikirim!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-6 max-w-md mx-auto leading-relaxed">
          Terima kasih, data keluarga <strong>{formData.namaLengkap}</strong> (Blok {formData.blok} No. {formData.noRumah})
          telah tersimpan dan disinkronkan ke Google Spreadsheet RT 08 Pesona Kahuripan 8 Tahap 2.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              namaLengkap: '',
              jenisKelamin: 'Laki-laki',
              blok: 'E',
              noRumah: '',
              noWhatsapp: '',
              statusTempatTinggal: 'Menetap',
              pekerjaan: '',
              agama: 'Islam',
              statusPernikahan: 'Menikah',
              statusDalamKeluarga: 'Kepala Keluarga',
              jmlJiwa: 1,
              anggotaKeluargaTambahan: '',
              catatan: '',
            });
          }}
          className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
        >
          Isi Formulir Warga Lainnya
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-10 select-none">
      {/* Title */}
      <div className="mb-6 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pendataan Kependudukan</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">RT 08 Pesona Kahuripan 8</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Formulir Pendaftaran Warga Baru
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
          Isi data diri Anda dan anggota keluarga dengan lengkap untuk tertib administrasi lingkungan, jadwal siskamling, dan kas RT.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Section 1: Identitas Pribadi */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Identitas Diri
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaLengkap"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.namaLengkap || ''}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-2.5">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Laki-laki"
                      checked={formData.jenisKelamin === 'Laki-laki'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Perempuan"
                      checked={formData.jenisKelamin === 'Perempuan'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pekerjaan"
                  placeholder="Contoh: Karyawan Swasta, Wiraswasta, PNS"
                  value={formData.pekerjaan || ''}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* AGAMA CUSTOM DROPDOWN */}
              <CustomSelect
                label="Agama"
                required
                value={formData.agama || 'Islam'}
                onChange={(val) => setFormData((prev) => ({ ...prev, agama: val as Agama }))}
                options={[
                  'Islam',
                  'Kristen',
                  'Katolik',
                  'Hindu',
                  'Buddha',
                  'Konghucu',
                  'Lainnya',
                ]}
              />
            </div>
          </div>

          {/* Section 2: Domisili & Rumah */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Domisili &amp; Alamat Rumah
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* PILIH BLOK CUSTOM DROPDOWN */}
              <CustomSelect
                label="Pilih Blok"
                required
                value={formData.blok || 'E'}
                onChange={(val) => setFormData((prev) => ({ ...prev, blok: val }))}
                options={[
                  { value: 'A', label: 'Blok A', description: 'Area gerbang depan' },
                  { value: 'B', label: 'Blok B', description: 'Area barat' },
                  { value: 'C', label: 'Blok C', description: 'Area tengah' },
                  { value: 'D', label: 'Blok D', description: 'Area timur & fasum' },
                  { value: 'E', label: 'Blok E', description: 'Area utama' },
                  { value: 'F', label: 'Blok F', description: 'Area utara' },
                  { value: 'Z', label: 'Blok Z', description: 'Area perluasan' },
                ]}
              />

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Nomor Rumah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="noRumah"
                  required
                  placeholder="Contoh: 16 atau 05"
                  value={formData.noRumah || ''}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                />
              </div>

              {/* STATUS TEMPAT TINGGAL CUSTOM DROPDOWN */}
              <CustomSelect
                label="Status Tempat Tinggal"
                required
                value={formData.statusTempatTinggal || 'Menetap'}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, statusTempatTinggal: val as StatusTempatTinggal }))
                }
                options={[
                  { value: 'Menetap', label: 'Menetap', description: 'Tinggal sehari-hari di rumah' },
                  { value: 'Pulang-Pergi', label: 'Pulang-Pergi', description: 'Rumah singgah / akhir pekan' },
                  { value: 'Belum menetap', label: 'Belum menetap', description: 'Sedang renovasi / belum diisi' },
                ]}
              />
            </div>
          </div>

          {/* Section 3: Status Keluarga & Kontak */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Kontak &amp; Data Keluarga
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  No. Handphone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="noWhatsapp"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.noWhatsapp || ''}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                  />
                </div>
              </div>

              {/* STATUS PERNIKAHAN CUSTOM DROPDOWN */}
              <CustomSelect
                label="Status Pernikahan"
                required
                value={formData.statusPernikahan || 'Menikah'}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, statusPernikahan: val as StatusPernikahan }))
                }
                options={['Belum menikah', 'Menikah', 'Cerai hidup', 'Cerai mati']}
              />

              {/* STATUS DALAM KELUARGA CUSTOM DROPDOWN */}
              <CustomSelect
                label="Status Dalam Keluarga"
                required
                value={formData.statusDalamKeluarga || 'Kepala Keluarga'}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, statusDalamKeluarga: val as StatusDalamKeluarga }))
                }
                options={[
                  'Kepala Keluarga',
                  'Istri',
                  'Anak',
                  'Orang Tua',
                  'Famili Lain',
                ]}
              />

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Jumlah Anggota Keluarga dalam 1 Rumah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  name="jmlJiwa"
                  required
                  placeholder="Jumlah jiwa (misal: 3)"
                  value={formData.jmlJiwa || 1}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Rincian Anggota Keluarga Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  name="anggotaKeluargaTambahan"
                  placeholder="Contoh: Siti Rahma (Istri), Dimas (Anak), Arka (Anak)"
                  value={formData.anggotaKeluargaTambahan || ''}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Catatan Khusus Tempat Tinggal (Opsional)
                </label>
                <textarea
                  name="catatan"
                  rows={2}
                  placeholder="Contoh: Rumah cat hijau samping taman, nomor rumah belum dipasang plang..."
                  value={formData.catatan || ''}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Data yang Anda kirimkan akan langsung disinkronkan ke Google Spreadsheet pengurus RT 08.
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pendaftaran Warga</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
