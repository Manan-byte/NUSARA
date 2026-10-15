import React, { useState, useEffect } from 'react';
import {
  WargaRecord,
  PengumumanRecord,
  TransaksiIPL,
  AdminAccount,
  PengeluaranKasRecord,
  InfoRekeningBank,
  DashboardSummary,
  ProgramUrunanRecord,
  ItemUrunanWarga,
} from '@sim-warga/types';
import { initialProgramPJU, initialUrunanList } from './data/mockUrunanData';
import {
  initialDashboardSummary,
  initialWargaList,
  initialJadwalRondaList,
  initialPengumumanList,
  initialTransaksiIplList,
  initialPengeluaranKasList,
} from './data/mockInitialData';

import { DashboardWarga } from './components/warga/DashboardWarga';
import { DashboardAdmin } from './components/admin/DashboardAdmin';
import { RondaWithStatus } from './components/ronda/JadwalRondaCard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminAccountModal } from './components/admin/AdminAccountModal';
import { postToGas, fetchLiveSheetData, clearAdminAuthToken } from './services/apiService';
import { hashPasswordSha256, maskPhoneNumber } from './utils/security';
const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'adm-01',
    nama: 'Pengurus Utama Paguyuban',
    username: 'admin',
    password: 'admin123',
    jabatan: 'Ketua Paguyuban',
    createdAt: '09 Okt 2026',
  },
  {
    id: 'adm-02',
    nama: 'Bendahara Paguyuban',
    username: 'bendahara',
    password: 'admin123',
    jabatan: 'Bendahara',
    createdAt: '09 Okt 2026',
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isModalBayarOpen, setIsModalBayarOpen] = useState<boolean>(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState<boolean>(false);
  const [isModalAccountOpen, setIsModalAccountOpen] = useState<boolean>(false);
  const [subTabWarga, setSubTabWarga] = useState<'direktori' | 'form'>('direktori');
  // Theme state: Default Light mode (Trekcave style cerah), togglable to Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('SIM_WARGA_THEME') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('SIM_WARGA_THEME', next ? 'dark' : 'light');
      showToast(next ? 'Beralih ke Mode Gelap (Dark)' : 'Beralih ke Mode Cerah (Light)');
      return next;
    });
  };

  // Admin state (Authenticated Session - Default NULL / Keluar)
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const saved = localStorage.getItem('SIM_WARGA_CURRENT_ADMIN');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) return parsed;
      } catch {}
    }
    return null;
  });
  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('SIM_WARGA_CURRENT_ADMIN', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('SIM_WARGA_CURRENT_ADMIN');
    }
  }, [currentAdmin]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('SIM_WARGA_ADMIN_ACCOUNTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((a: AdminAccount) => ({
            ...a,
            nama: (a.nama || '').replace(/RT\s*08/gi, 'Paguyuban').replace(/\bRT\b/gi, 'Paguyuban'),
            jabatan: ((a.jabatan || 'Ketua Paguyuban') as string)
              .replace(/Ketua\s*RT/gi, 'Ketua Paguyuban')
              .replace(/\bRT\b/gi, 'Paguyuban') as AdminAccount['jabatan'],
          }));
        }
      } catch {
        return DEFAULT_ADMINS;
      }
    }
    return DEFAULT_ADMINS;
  });

  useEffect(() => {
    localStorage.setItem('SIM_WARGA_ADMIN_ACCOUNTS', JSON.stringify(adminAccounts));
  }, [adminAccounts]);

  // Saldo Awal Kas RT (Modal Pembuka Kas Bulan Lalu)
  const [saldoAwalKas, setSaldoAwalKas] = useState<number>(() => {
    if (!localStorage.getItem('SIM_WARGA_DUMMY_V2026_MASTER')) {
      localStorage.removeItem('SIM_WARGA_SALDO_AWAL_KAS');
      localStorage.removeItem('SIM_WARGA_TRANSAKSI_IPL');
      localStorage.removeItem('SIM_WARGA_TRANSAKSI_IPL_V2');
      localStorage.removeItem('SIM_WARGA_TRANSAKSI_IPL_V2026');
      localStorage.removeItem('SIM_WARGA_PENGELUARAN_KAS');
      localStorage.removeItem('SIM_WARGA_AUDIT_LOGS_V1');
      localStorage.removeItem('SIM_WARGA_REKENING_BANK');
      localStorage.removeItem('SIM_WARGA_URUNAN_LIST');
      localStorage.removeItem('SIM_WARGA_URUNAN_LIST_V2');
      localStorage.removeItem('SIM_WARGA_URUNAN_LIST_V2026');
      localStorage.removeItem('SIM_WARGA_OWNED_WARGA_KEYS');
      localStorage.removeItem('SIM_WARGA_OWNED_PJU_IDS');
      localStorage.setItem('SIM_WARGA_DUMMY_V2026_MASTER', 'true');
      return 0;
    }
    const saved = localStorage.getItem('SIM_WARGA_SALDO_AWAL_KAS');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // Rekening Bank Kas RT / Bendahara Paguyuban PK8 Tahap 2
  const [rekeningBank, setRekeningBank] = useState<InfoRekeningBank>(() => {
    if (localStorage.getItem('SIM_WARGA_CLEAN_PK8_V3')) {
      const saved = localStorage.getItem('SIM_WARGA_REKENING_BANK');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.noRekening) return parsed;
        } catch {}
      }
    }
    return {
      namaBank: 'Bank Mandiri',
      noRekening: '1240010437979',
      atasNama: 'Dwi Saputra',
      catatan: 'Note: Nomer blok & Nomer rumah (Cth: D13 No. 7)',
      metodePembayaran: [
        'Transfer Bank Mandiri (1240010437979)',
        'QRIS Paguyuban',
        'Cash / Tunai ke Bendahara',
      ],
    };
  });

  const handleUpdateRekeningBank = (newRek: InfoRekeningBank) => {
    setRekeningBank(newRek);
    localStorage.setItem('SIM_WARGA_REKENING_BANK', JSON.stringify(newRek));
    showToast(`Rekening bank kas Paguyuban berhasil diubah (${newRek.namaBank} - ${newRek.noRekening})!`);
  };

  // Tarif IPL Bulanan (Default Rp 30.000 / bln, dapat diedit oleh Admin)
  const [tarifIplPerBulan, setTarifIplPerBulan] = useState<number>(() => {
    const saved = localStorage.getItem('SIM_WARGA_TARIF_IPL');
    return saved ? parseInt(saved, 10) || 30000 : 30000;
  });

  // Core application state with clean initial empty data
  const [dashboardSummary, setDashboardSummary] = useState(initialDashboardSummary);
  const [wargaList, setWargaList] = useState<WargaRecord[]>(initialWargaList);
  const [rondaList, setRondaList] = useState<RondaWithStatus[]>(initialJadwalRondaList);
  const [pengumumanList, setPengumumanList] = useState<PengumumanRecord[]>(() => {
    try {
      const saved = localStorage.getItem('SIM_WARGA_PENGUMUMAN_LIST');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPengumumanList;
  });
  const [transaksiList, setTransaksiList] = useState<TransaksiIPL[]>(initialTransaksiIplList);
  const [pengeluaranList, setPengeluaranList] = useState<PengeluaranKasRecord[]>(initialPengeluaranKasList);
  const [programUrunan, setProgramUrunan] = useState<ProgramUrunanRecord>(initialProgramPJU);
  const [urunanList, setUrunanList] = useState<ItemUrunanWarga[]>(initialUrunanList);

  const handleAddUrunan = async (item: ItemUrunanWarga) => {
    const nextPjuNo = urunanList.length + 1;
    const itemWithId: ItemUrunanWarga = {
      ...item,
      id: item.id || `#PJU-${('000' + nextPjuNo).slice(-3)}`,
    };
    const existsById = urunanList.some((u) => u.id === itemWithId.id);
    let nextList: ItemUrunanWarga[];
    if (existsById) {
      // Update in-place strictly by ID!
      nextList = urunanList.map((u) => (u.id === itemWithId.id ? itemWithId : u));
    } else {
      const cleanTarget = item.namaWarga.split('(')[0].trim().toLowerCase();
      const cleanedList = urunanList.filter((u) => {
        const uClean = u.namaWarga.split('(')[0].trim().toLowerCase();
        const isSamePersonAndTipe = uClean === cleanTarget && u.tipe === item.tipe;
        if (isSamePersonAndTipe && (u.status === 'Menunggu Verifikasi' || u.status === 'Ditolak')) {
          return false;
        }
        return true;
      });
      nextList = [itemWithId, ...cleanedList];
    }
    setUrunanList(nextList);
    // Catat juga status setoran Urunan PJU pada baris warga terkait di tab DATA_WARGA Google Sheets agar 100% tercatat di Google Sheets
    const cleanName = item.namaWarga.split('(')[0].trim().toLowerCase();
    const pjuNote = `${item.tipe === 'DONATUR' ? 'Donatur PJU' : 'Urunan PJU'}: Rp ${item.nominal.toLocaleString('id-ID')} (${item.metode})`;
    const nextWargaList = wargaList.map((w) =>
      w.namaLengkap.toLowerCase() === cleanName ||
      item.namaWarga.toLowerCase().includes(w.alamatRumah.toLowerCase())
        ? {
            ...w,
            tanggalUpdate: item.tanggal || '11 Okt 2026',
            catatan:
              w.catatan && w.catatan !== 'Warga Terdata' && w.catatan !== '-'
                ? `${w.catatan} • ${pjuNote}`
                : pjuNote,
          }
        : w
    );
    setWargaList(nextWargaList);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`Setoran Urunan PJU ${item.namaWarga} (Rp ${item.nominal.toLocaleString('id-ID')}) berhasil masuk ke Google Sheets!`);
  };

  const handleDeleteUrunan = async (id: string) => {
    const nextList = urunanList.filter((i) => i.id !== id);
    setUrunanList(nextList);
    await postToGas({ action: 'deleteUrunan', id });
    showToast('Data urunan berhasil dihapus dari sistem & Google Sheets.');

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
  };

  const handleImportBulkUrunan = async (items: ItemUrunanWarga[]) => {
    const nextList = [...items, ...urunanList];
    setUrunanList(nextList);
    showToast(`Berhasil mengimpor ${items.length} data urunan & menyinkronkan ke Google Sheet!`);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
  };
  // Kepemilikan Data Warga pada Perangkat Ini (Hanya data yang diinput mandiri oleh user di perangkat ini yang bisa diedit)
  const [ownedWargaKeys, setOwnedWargaKeys] = useState<string[]>(() => {
    try {
      localStorage.removeItem('SIM_WARGA_OWNED_WARGA_KEYS');
      localStorage.removeItem('SIM_WARGA_MY_OWNED_RECORDS_V2');
      const saved = JSON.parse(localStorage.getItem('SIM_WARGA_MY_OWNED_RECORDS_V3') || '[]');
      return Array.isArray(saved) ? saved.filter((k) => typeof k === 'string' && k.length > 0) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('SIM_WARGA_MY_OWNED_RECORDS_V3', JSON.stringify(ownedWargaKeys));
  }, [ownedWargaKeys]);
  // Sync to localStorage
  // Sync to localStorage dengan proteksi keamanan (Hash Password SHA-256 & Sensor Nomor WA Tetangga)
  useEffect(() => {
    let isCancelled = false;
    const sanitizeAndSave = async () => {
      const sanitized = await Promise.all(
        wargaList.map(async (w) => {
          const isOwned = ownedWargaKeys.includes(w.id || '') || ownedWargaKeys.includes(w.alamatRumah);
          const pinHash = w.pinHash || (w.pin ? await hashPasswordSha256(w.pin) : undefined);
          return {
            ...w,
            pin: undefined, // HAPUS PLAINTEXT PIN DARI LOCALSTORAGE KLIEN!
            pinHash,
            noWhatsapp: isOwned ? w.noWhatsapp : maskPhoneNumber(w.noWhatsapp),
          };
        })
      );
      if (!isCancelled) {
        localStorage.setItem('SIM_WARGA_DATA_WARGA', JSON.stringify(sanitized));
      }
    };
    sanitizeAndSave();
    return () => {
      isCancelled = true;
    };
  }, [wargaList, ownedWargaKeys]);

  useEffect(() => {
    localStorage.setItem('SIM_WARGA_TRANSAKSI_IPL', JSON.stringify(transaksiList));
  }, [transaksiList]);

  useEffect(() => {
    localStorage.setItem('SIM_WARGA_PENGELUARAN_KAS', JSON.stringify(pengeluaranList));
  }, [pengeluaranList]);
  useEffect(() => {
    try {
      localStorage.setItem('SIM_WARGA_PENGUMUMAN_LIST', JSON.stringify(pengumumanList));
    } catch {}
  }, [pengumumanList]);


  useEffect(() => {
    localStorage.setItem('SIM_WARGA_TARIF_IPL', tarifIplPerBulan.toString());
  }, [tarifIplPerBulan]);

  // Helper penghitung metrik dashboard secara terpusat & konsisten
  const computeSummary = (
    wList: WargaRecord[],
    tList: TransaksiIPL[],
    pList: PengeluaranKasRecord[],
    tarif: number = tarifIplPerBulan,
    saldoAwal: number = saldoAwalKas
  ): DashboardSummary => {
    const uniqueHouses = new Set(wList.map((w) => `${w.blok}-${w.noRumah}`)).size;
    const lunasHouses = new Set(
      wList.filter((w) => w.statusIpl === 'Lunas').map((w) => `${w.blok}-${w.noRumah}`)
    ).size;
    const pemasukan = tList
      .filter((t) => t.status === 'Lunas')
      .reduce((acc, curr) => acc + curr.nominalBayar, 0);
    const pengeluaran = pList.reduce((acc, curr) => acc + curr.nominal, 0);

    // KAS RT TIDAK PERNAH MINUS: Saldo Awal + Pemasukan - Pengeluaran, diproteksi Math.max(0, ...)
    const sisaSaldo = Math.max(0, saldoAwal + pemasukan - pengeluaran);

    // Demografi Kependudukan (Menetap, Pulang-Pergi, Belum Menetap)
    const wargaMenetap = wList.filter((w) => {
      const st = (w.statusTempatTinggal || '').toLowerCase();
      return st.includes('menetap') && !st.includes('belum');
    }).length;
    const wargaPulangPergi = wList.filter((w) => {
      const st = (w.statusTempatTinggal || '').toLowerCase();
      return st.includes('pergi') || st.includes('pulang');
    }).length;
    const wargaBelumMenetap = wList.filter((w) => {
      const st = (w.statusTempatTinggal || '').toLowerCase();
      return st.includes('belum');
    }).length;

    // Rekapitulasi per Blok Dinamis (Mendukung Blok A sampai Z secara otomatis)
    const uniqueBlokNames = Array.from(
      new Set(
        wList
          .map((w) => w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim())
          .filter(Boolean)
      )
    ).sort();

    const blokList =
      uniqueBlokNames.length > 0
        ? uniqueBlokNames
        : Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const rekapPerBlok = blokList.map((bName) => {
      const wargaInBlok = wList.filter(
        (w) => w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim() === bName
      );
      const jmlRumah = wargaInBlok.length;
      const menetap = wargaInBlok.filter((w) => {
        const st = (w.statusTempatTinggal || '').toLowerCase();
        return st.includes('menetap') && !st.includes('belum');
      }).length;
      const pulangPergi = wargaInBlok.filter((w) => {
        const st = (w.statusTempatTinggal || '').toLowerCase();
        return st.includes('pergi') || st.includes('pulang');
      }).length;
      const belumMenetap = wargaInBlok.filter((w) => {
        const st = (w.statusTempatTinggal || '').toLowerCase();
        return st.includes('belum');
      }).length;

      const trxInBlok = tList.filter((t) => t.lokasiRumah.toUpperCase().includes(`BLOK ${bName}`) && t.status === 'Lunas');
      const realisasi = trxInBlok.reduce((acc, curr) => acc + curr.nominalBayar, 0);
      const lunasInBlok = wargaInBlok.filter((w) => w.statusIpl === 'Lunas').length;
      const persentase = jmlRumah > 0 ? `${Math.round((lunasInBlok / jmlRumah) * 100)}%` : '0%';

      return {
        blok: `Blok ${bName}`,
        jumlahRumah: jmlRumah,
        menetap,
        pulangPergi,
        belumMenetap,
        targetIpl: jmlRumah * (tarifIplPerBulan || 30000),
        realisasiMasuk: realisasi,
        sisaTunggakan: Math.max(0, jmlRumah * (tarifIplPerBulan || 30000) - realisasi),
        status: lunasInBlok === jmlRumah && jmlRumah > 0 ? '⭐ Lunas 100%' : lunasInBlok > 0 ? `${persentase} Lunas` : 'Belum Bayar',
        persentase,
      };
    });

    return {
      pemasukanIpl: pemasukan,
      targetIpl: (uniqueHouses || wList.length) * (tarifIplPerBulan || 30000),
      persentasePemasukan: uniqueHouses > 0 ? `${Math.round((lunasHouses / uniqueHouses) * 100)}%` : '100%',
      rumahLunas: lunasHouses,
      totalRumah: uniqueHouses,
      totalWarga: wList.length,
      pengeluaranKas: pengeluaran,
      saldoAwalKas: saldoAwal,
      sisaSaldoKas: sisaSaldo,
      wargaMenetap,
      wargaPulangPergi,
      wargaBelumMenetap,
      rekapPerBlok,
    };
  };

  const [isSyncingSheet, setIsSyncingSheet] = useState(false);

  const syncLiveFromGoogleSheets = async (silent = false) => {
    setIsSyncingSheet(true);
    try {
      const liveData = await fetchLiveSheetData();
      // GOOGLE SHEETS ADALAH SOURCE OF TRUTH (BASE RESMI DARI GOOGLE SHEETS):
      // Jika Google Sheets memiliki data warga (> 0), SELALU prioritaskan data Google Sheets!
      if (liveData && liveData.wargaList && liveData.wargaList.length > 0) {
        const wargaWithHashes = await Promise.all(
          liveData.wargaList.map(async (w) => ({
            ...w,
            pinHash: w.pinHash || (w.pin ? await hashPasswordSha256(w.pin) : undefined),
          }))
        );
        setWargaList(wargaWithHashes);
        setTransaksiList(liveData.transaksiList);
        setPengeluaranList(liveData.pengeluaranList);
        if (liveData.urunanList && liveData.urunanList.length > 0) {
          setUrunanList(liveData.urunanList);
        }
        const newSummary = computeSummary(
          liveData.wargaList,
          liveData.transaksiList,
          liveData.pengeluaranList,
          tarifIplPerBulan,
          saldoAwalKas
        );
        setDashboardSummary(newSummary);

        if (!silent) {
          showToast(`Data berhasil disinkronkan langsung dari Google Sheets! (${liveData.wargaList.length} warga terdata)`);
        }
      } else {
        // Jangan kosongkan state jika respons Google Sheets belum termuat, pertahankan data master lokal!
        console.warn('Data Google Sheets belum tersedia, mempertahankan data lokal.');
      }
    } catch (e) {
      console.warn('Gagal sync live dari Google Sheets:', e);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  useEffect(() => {
    // 1. Sinkronisasi awal saat aplikasi dibuka
    syncLiveFromGoogleSheets(true);

    // 2. Auto-sync saat tab browser aktif kembali (misal setelah admin/user selesai edit di Google Sheets)
    let lastFocusSync = Date.now();
    const handleWindowFocus = () => {
      const now = Date.now();
      if (now - lastFocusSync > 5000) {
        lastFocusSync = now;
        syncLiveFromGoogleSheets(true);
      }
    };
    window.addEventListener('focus', handleWindowFocus);

    // 3. Interval background sync tiap 25 detik agar update password / nomor WA di Sheets otomatis masuk
    const autoSyncInterval = setInterval(() => {
      syncLiveFromGoogleSheets(true);
    }, 25000);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(autoSyncInterval);
    };
  }, []);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isAdmin = !!currentAdmin;

  // Format payload sesuai Apps Script 'syncAll' pengguna (Menyematkan ID #WRG-xxx & #PJU-xxx langsung ke Google Sheets)
  const formatPayloadForGas = (
    updatedWarga: WargaRecord[],
    updatedTrx: TransaksiIPL[],
    updatedExp: PengeluaranKasRecord[] = pengeluaranList,
    updatedUrunan: ItemUrunanWarga[] = urunanList
  ) => {
    const nowWib =
      new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';

    const residents = updatedWarga.map((w, idx) => {
      const wrgId = w.id && w.id.startsWith('#WRG-') ? w.id : `#WRG-${('000' + (idx + 1)).slice(-3)}`;
      const cleanName = w.namaLengkap.replace(/^\[#WRG-\d+\]\s*/i, '').trim();
      const rawNote = (w.catatan || 'Warga Terdata').replace(/^ID:\s*#WRG-\d+\s*•\s*/i, '');
      const noteWithIdAndPw = `ID: ${wrgId} • ${rawNote}${rawNote.includes('Password:') || !w.pin ? '' : ` • Password: ${w.pin}`}`;

      return {
        id: wrgId,
        nama: cleanName,
        jenisKelamin: w.jenisKelamin,
        blok: w.blok,
        nomor: parseInt(String(w.noRumah), 10) || 1,
        blokNomor: w.alamatRumah,
        telepon: w.noWhatsapp,
        statusTempatTinggal: w.statusTempatTinggal,
        pekerjaan: w.pekerjaan,
        agama: w.agama,
        statusPernikahan: w.statusPernikahan,
        statusDalamKeluarga: w.statusDalamKeluarga,
        jumlahAnggota: w.jmlJiwa,
        anggotaKeluarga: w.anggotaKeluargaTambahan || '-',
        statusIpl: w.statusIpl,
        periodeIpl: w.periodeTercover || 'Oktober 2026',
        nominalIpl: w.nominalIpl || tarifIplPerBulan,
        tanggalBayarIpl: w.tanggalUpdate || '-',
        catatan: noteWithIdAndPw,
        pin: w.pin || '-',
        waktuInput: w.waktuInput || nowWib,
      };
    });

    const iplRecords = updatedTrx.map((item, idx) => ({
      id: item.noTransaksi || `#IPL-${('000' + (idx + 1)).slice(-3)}`,
      nama: item.namaWarga,
      blokNomor: item.lokasiRumah,
      periode: item.periodeTercover || 'Oktober 2026',
      durasiLabel: item.durasiPaket || '1 Bulan',
      nominal: item.nominalBayar || tarifIplPerBulan,
      status: item.status || 'Lunas',
      tanggalBayar: item.tanggalPelunasan || '-',
      metode: item.metodePembayaran || 'Transfer Bank',
      buktiBayar: item.buktiBayar || '-',
      keterangan: item.keterangan || 'Lunas',
      waktuInput: item.waktuInput || nowWib,
    }));
    const pengeluaranRecords = updatedExp.map((exp, idx) => ({
      id: exp.id || `#EXP-${('000' + (idx + 1)).slice(-3)}`,
      tanggal: exp.tanggal,
      kategori: exp.kategori,
      keterangan: exp.keterangan,
      nominal: exp.nominal,
      penerima: exp.penerima,
      createdAt: exp.createdAt || new Date().toISOString(),
      waktuInput: exp.waktuInput || exp.createdAt || nowWib,
    }));

    const urunanRecords = updatedUrunan.map((item, idx) => {
      const pjuId = item.id && item.id.startsWith('#PJU-') ? item.id : `#PJU-${('000' + (idx + 1)).slice(-3)}`;
      const cleanName = item.namaWarga.replace(/^\[#PJU-\d+\]\s*/i, '').trim();
      const baseKet =
        item.status === 'Menunggu Verifikasi' && !/menunggu verifikasi/i.test(item.keterangan || '')
          ? `Menunggu Verifikasi • ${item.keterangan || '-'}`
          : item.keterangan || '-';
      const ketWithId = baseKet.includes('ID:') ? baseKet : `ID: ${pjuId} • ${baseKet}`;

      return {
        id: pjuId,
        namaWarga: cleanName,
        tipe: item.tipe,
        nominal: item.nominal,
        metode: item.metode,
        buktiBayar: item.buktiBayar || '-',
        keterangan: ketWithId,
        tanggal: item.tanggal,
        waktuInput: item.waktuInput || nowWib,
      };
    });

    return { residents, iplRecords, pengeluaranRecords, urunanRecords };
  };

  // 1. Warga Registration handler (Langsung sync ke Google Spreadsheet)

  // Jika di Google Sheets ada data dengan catatan "Input Mandiri Warga" (bukan 52 "Warga Terdata" bawaan), pertahankan kepemilikannya
  useEffect(() => {
    const selfInputFromSheet = wargaList
      .filter((w) => w.catatan === 'Input Mandiri Warga')
      .flatMap((w) => [w.id || '', w.alamatRumah])
      .filter(Boolean);
    if (selfInputFromSheet.length > 0) {
      setOwnedWargaKeys((prev) => Array.from(new Set([...prev, ...selfInputFromSheet])));
    }
  }, [wargaList]);

  const handleClaimWargaOwnership = (w: WargaRecord) => {
    setOwnedWargaKeys((prev) =>
      Array.from(new Set([...prev, w.id || '', w.alamatRumah])).filter(Boolean)
    );
    showToast(`Verifikasi Nomor WhatsApp berhasil! Data ${w.namaLengkap} (${w.alamatRumah}) kini dapat Anda edit.`);
  };

  const handleAddWarga = async (newWarga: WargaRecord): Promise<void> => {
    const existingIdx = wargaList.findIndex(
      (w) =>
        w.alamatRumah.toLowerCase().trim() === newWarga.alamatRumah.toLowerCase().trim() ||
        (newWarga.id && w.id?.toLowerCase().trim() === newWarga.id.toLowerCase().trim())
    );

    let nextList: WargaRecord[];
    let wargaWithId: WargaRecord;
    if (existingIdx !== -1) {
      wargaWithId = {
        ...wargaList[existingIdx],
        ...newWarga,
        id: wargaList[existingIdx].id, // Pertahankan ID asli yang sudah ada!
        catatan: newWarga.catatan || wargaList[existingIdx].catatan || 'Input Mandiri Warga',
      };
      nextList = [...wargaList];
      nextList[existingIdx] = wargaWithId;
    } else {
      const nextNo = wargaList.length + 1;
      const defaultWrgId = `#WRG-${('000' + nextNo).slice(-3)}`;
      wargaWithId = {
        ...newWarga,
        id: newWarga.id || defaultWrgId,
        catatan: newWarga.catatan || 'Input Mandiri Warga',
      };
      nextList = [wargaWithId, ...wargaList];
    }
    setWargaList(nextList);
    setOwnedWargaKeys((prev) =>
      Array.from(new Set([...prev, wargaWithId.id!, wargaWithId.alamatRumah]))
    );
    setDashboardSummary(
      computeSummary(nextList, transaksiList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    // Tambahkan baris warga baru langsung ke tab DATA_WARGA di Google Sheets (action: daftarWarga)
    const wrgId = wargaWithId.id!;
    const cleanName = wargaWithId.namaLengkap.replace(/^\[#WRG-\d+\]\s*/i, '').trim();
    const rawNote = (wargaWithId.catatan || 'Input Mandiri Warga').replace(/^ID:\s*#WRG-\d+\s*•\s*/i, '');
    const noteWithIdAndPw = `ID: ${wrgId} • ${rawNote}${rawNote.includes('Password:') || !wargaWithId.pin ? '' : ` • Password: ${wargaWithId.pin}`}`;
    const nowWib =
      new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';

    // 1. Kirim via daftarWarga
    await postToGas({
      action: 'daftarWarga',
      data: {
        ...wargaWithId,
        namaLengkap: cleanName,
        nama: cleanName,
        catatan: noteWithIdAndPw,
        waktuInput: wargaWithId.waktuInput || nowWib,
      } as unknown as Record<string, unknown>,
    });

    // 2. Sinkronkan juga daftar lengkap via syncAll agar tab DATA_WARGA Google Sheets 100% terupdate dan terformat rapi!
    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextList,
      transaksiList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });

    showToast(`Sukses! Data ${wargaWithId.namaLengkap} (${wargaWithId.alamatRumah}) telah masuk ke Google Sheets!`);
  };

  // Update Data Warga Milik Sendiri (Kecuali Status Iuran IPL yang dikunci)
  const handleUpdateWarga = async (
    originalKey: string,
    updatedFields: {
      namaLengkap: string;
      blok: string;
      noRumah: string;
      noWhatsapp: string;
      statusTempatTinggal: WargaRecord['statusTempatTinggal'];
      jmlJiwa: number;
      anggotaKeluargaTambahan?: string;
    }
  ): Promise<void> => {
    const newAlamat = `Blok ${updatedFields.blok} No. ${updatedFields.noRumah}`;
    const oldWarga = wargaList.find((w) => w.id === originalKey || w.alamatRumah === originalKey);
    const oldName = (oldWarga?.namaLengkap || '').toLowerCase().trim();
    const oldAddr = (oldWarga?.alamatRumah || '').toLowerCase().trim();
    const newName = (updatedFields.namaLengkap || '').toLowerCase().trim();
    const newAddr = newAlamat.toLowerCase().trim();

    const nextList = wargaList.map((w) => {
      if (w.id === originalKey || w.alamatRumah === originalKey) {
        return {
          ...w,
          namaLengkap: updatedFields.namaLengkap,
          blok: updatedFields.blok,
          noRumah: updatedFields.noRumah,
          alamatRumah: newAlamat,
          noWhatsapp: updatedFields.noWhatsapp,
          statusTempatTinggal: updatedFields.statusTempatTinggal,
          jmlJiwa: updatedFields.jmlJiwa,
          anggotaKeluargaTambahan:
            updatedFields.anggotaKeluargaTambahan !== undefined
              ? updatedFields.anggotaKeluargaTambahan
              : w.anggotaKeluargaTambahan,
          statusIpl: w.statusIpl,
        };
      }
      return w;
    });

    // Cascade update ke transaksi IPL
    const nextTrxList = transaksiList.map((t) => {
      const tName = (t.namaWarga || '').toLowerCase().trim();
      const tAddr = (t.lokasiRumah || '').toLowerCase().trim();
      if ((oldName && tName === oldName) || (newName && tName === newName) || (oldAddr && tAddr === oldAddr) || (newAddr && tAddr === newAddr)) {
        return {
          ...t,
          namaWarga: updatedFields.namaLengkap,
          lokasiRumah: newAlamat,
        };
      }
      return t;
    });

    // Cascade update ke PJU
    const nextUrunanList = urunanList.map((u) => {
      const uName = (u.namaWarga || '').toLowerCase().trim();
      if ((oldName && uName.includes(oldName)) || (newName && uName.includes(newName)) || (oldAddr && uName.includes(oldAddr)) || (newAddr && uName.includes(newAddr))) {
        return {
          ...u,
          namaWarga: `${updatedFields.namaLengkap} (${newAlamat})`,
        };
      }
      return u;
    });

    setWargaList(nextList);
    setTransaksiList(nextTrxList);
    setUrunanList(nextUrunanList);
    setOwnedWargaKeys((prev) => Array.from(new Set([...prev, newAlamat])));
    setDashboardSummary(
      computeSummary(nextList, transaksiList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextList,
      transaksiList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });

    showToast(`Perubahan data keluarga ${updatedFields.namaLengkap} berhasil diupdate di Google Sheets!`);
  };

  // Update Penuh Data Warga & Status IPL oleh Pengurus / Admin
  const handleAdminUpdateWarga = async (
    originalKey: string,
    updatedWarga: WargaRecord
  ): Promise<void> => {
    const origClean = (originalKey || '').toLowerCase().trim();
    const nameClean = (updatedWarga.namaLengkap || '').toLowerCase().trim();
    const addrClean = (updatedWarga.alamatRumah || '').toLowerCase().trim();
    const idClean = (updatedWarga.id || '').toLowerCase().trim();

    // 1. Temukan data warga lama sebelum diedit (untuk pencocokan transaksi, urunan, & ronda lama)
    const oldWarga = wargaList.find((w) => {
      const wId = (w.id || '').toLowerCase().trim();
      const wAddr = (w.alamatRumah || '').toLowerCase().trim();
      const wName = (w.namaLengkap || '').toLowerCase().trim();
      return (
        (origClean && (wId === origClean || wAddr === origClean || wName === origClean)) ||
        (idClean && wId === idClean) ||
        (addrClean && wAddr === addrClean) ||
        (nameClean && wName === nameClean)
      );
    });

    const oldNameClean = (oldWarga?.namaLengkap || '').toLowerCase().trim();
    const oldAddrClean = (oldWarga?.alamatRumah || '').toLowerCase().trim();

    // 2. Perbarui data di wargaList
    const nextList = wargaList.map((w) => {
      const wId = (w.id || '').toLowerCase().trim();
      const wAddr = (w.alamatRumah || '').toLowerCase().trim();
      const wName = (w.namaLengkap || '').toLowerCase().trim();

      const matchKey = origClean && (wId === origClean || wAddr === origClean || wName === origClean);
      const matchId = idClean && wId === idClean;
      const matchAddr = addrClean && wAddr === addrClean;
      const matchName = nameClean && wName === nameClean;

      return (matchKey || matchId || matchAddr || matchName) ? updatedWarga : w;
    });
    setWargaList(nextList);

    // 3. SELALU PERBARUI SELURUH DATA DI SETIAP TRANSAKSI IPL (Menu 2) DENGAN ID YANG SAMA PERSIS
    let hasExisting = false;
    let nextTrxList = transaksiList.map((t) => {
      const tName = (t.namaWarga || '').toLowerCase().trim();
      const tAddr = (t.lokasiRumah || '').toLowerCase().trim();

      const isMatch =
        (oldNameClean && tName === oldNameClean) ||
        (nameClean && tName === nameClean) ||
        (oldAddrClean && tAddr === oldAddrClean) ||
        (addrClean && tAddr === addrClean);

      if (isMatch) {
        hasExisting = true;
        return {
          ...t,
          // TETAPKAN ID YANG SAMA (JANGAN UBAH / REGENERATE ID TRANSAKSI!)
          noTransaksi: t.noTransaksi,
          namaWarga: updatedWarga.namaLengkap,
          lokasiRumah: updatedWarga.alamatRumah,
          periodeTercover: updatedWarga.periodeTercover || t.periodeTercover,
          nominalBayar: updatedWarga.nominalIpl || t.nominalBayar,
          status:
            updatedWarga.statusIpl === 'Lunas'
              ? ('Lunas' as const)
              : updatedWarga.statusIpl === 'Menunggu Verifikasi'
              ? ('Menunggu Verifikasi' as const)
              : updatedWarga.statusIpl === 'Belum Bayar'
              ? ('Belum Bayar' as const)
              : t.status,
          keterangan: updatedWarga.catatan || t.keterangan,
          tanggalPelunasan:
            updatedWarga.statusIpl === 'Lunas'
              ? (t.tanggalPelunasan && t.tanggalPelunasan !== '-' ? t.tanggalPelunasan : '13 Okt 2026')
              : t.tanggalPelunasan,
        };
      }
      return t;
    });

    // JIKA DAN HANYA JIKA warga belum memiliki transaksi sama sekali dalam sejarah sistem, buatkan 1 transaksi awal
    if (!hasExisting && updatedWarga.statusIpl === 'Menunggu Verifikasi') {
      const newPendingTrx: TransaksiIPL = {
        noTransaksi: `#IPL-${Date.now().toString().slice(-4)}`,
        namaWarga: updatedWarga.namaLengkap,
        lokasiRumah: updatedWarga.alamatRumah,
        periodeTercover: updatedWarga.periodeTercover || 'Oktober 2026',
        durasiPaket: '1 Bulan',
        nominalBayar: updatedWarga.nominalIpl || tarifIplPerBulan,
        status: 'Menunggu Verifikasi',
        buktiBayar: '-',
        tanggalPelunasan: '13 Okt 2026',
        metodePembayaran: 'Transfer Bank',
        keterangan: updatedWarga.catatan || 'Menunggu Verifikasi Pengurus',
      };
      nextTrxList = [newPendingTrx, ...nextTrxList];
    }

    // DEDUKLIKASI KETAT: Buang transaksi ganda untuk rumah/warga yang sama (prioritaskan #TRX-xxx asli)
    const seenLokasi = new Set<string>();
    nextTrxList = nextTrxList.filter((t) => {
      const locKey = t.lokasiRumah.toLowerCase().trim();
      if (t.noTransaksi.startsWith('#IPL-')) {
        const hasMaster = nextTrxList.some(
          (other) => other.noTransaksi.startsWith('#TRX-') && other.lokasiRumah.toLowerCase().trim() === locKey
        );
        if (hasMaster) return false;
      }
      if (seenLokasi.has(locKey)) return false;
      seenLokasi.add(locKey);
      return true;
    });
    setTransaksiList(nextTrxList);

    // 4. SELALU PERBARUI NAMA DI SELURUH SETORAN URUNAN PJU (Menu 3)
    const nextUrunanList = urunanList.map((u) => {
      const uName = (u.namaWarga || '').toLowerCase().trim();
      const isMatch =
        (oldNameClean && uName.includes(oldNameClean)) ||
        (nameClean && uName.includes(nameClean)) ||
        (oldAddrClean && uName.includes(oldAddrClean)) ||
        (addrClean && uName.includes(addrClean));

      if (isMatch) {
        return {
          ...u,
          namaWarga: `${updatedWarga.namaLengkap} (${updatedWarga.alamatRumah})`,
        };
      }
      return u;
    });
    setUrunanList(nextUrunanList);

    // 5. PERBARUI JADWAL SISKAMLING JIKA WARGA ADA DI JADWAL RONDA (Menu 5)
    setRondaList((prevRonda) =>
      prevRonda.map((r) => ({
        ...r,
        petugas: r.petugas.map((p) => {
          const pName = (p.namaLengkap || '').toLowerCase().trim();
          if ((oldNameClean && pName === oldNameClean) || (nameClean && pName === nameClean)) {
            return {
              ...p,
              namaLengkap: updatedWarga.namaLengkap,
              blokRumah: `${updatedWarga.blok}/${updatedWarga.noRumah}`,
            };
          }
          return p;
        }),
      }))
    );

    setDashboardSummary(
      computeSummary(nextList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextList,
      nextTrxList,
      pengeluaranList,
      nextUrunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`Data ${updatedWarga.namaLengkap} (${updatedWarga.alamatRumah}) berhasil diperbarui oleh Pengurus di Google Sheets!`);
  };

  const handleDeleteWarga = async (key: string): Promise<void> => {
    const target = wargaList.find((w) => w.id === key || w.alamatRumah === key);
    const nextList = wargaList.filter((w) => w.id !== key && w.alamatRumah !== key);
    if (target?.id) {
      await postToGas({ action: 'deleteWarga', id: target.id });
    }
    setWargaList(nextList);
    setDashboardSummary(
      computeSummary(nextList, transaksiList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextList,
      transaksiList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`Data warga ${target?.namaLengkap || ''} telah dihapus dari sistem & Google Sheets.`);
  };
  // 2. Ronda Handlers
  const handlePublishRonda = async (id: string) => {
    setRondaList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, statusPublikasi: 'PUBLISHED' as const } : r
      )
    );
    showToast('Jadwal ronda berhasil diposting dan terbit di dashboard warga!');
  };

  const handleAddRonda = async (newRonda: RondaWithStatus) => {
    setRondaList((prev) => [newRonda, ...prev]);
    showToast(
      newRonda.statusPublikasi === 'PUBLISHED'
        ? 'Jadwal ronda berhasil dibuat dan diposting ke dashboard warga!'
        : 'Jadwal ronda berhasil disimpan sebagai draf internal pengurus.'
    );
  };

  const handleUpdateRonda = (updatedRonda: RondaWithStatus) => {
    setRondaList((prev) =>
      prev.map((r) => (r.id === updatedRonda.id ? updatedRonda : r))
    );
    showToast('Jadwal ronda berhasil diperbarui!');
  };

  const handleDeleteRonda = (id: string) => {
    setRondaList((prev) => prev.filter((r) => r.id !== id));
    showToast('Jadwal ronda berhasil dihapus.');
  };

  // 3. Pengumuman handlers
  const handleAddPengumuman = async (newP: PengumumanRecord) => {
    setPengumumanList((prev) => [newP, ...prev]);
    showToast('Pengumuman baru berhasil diterbitkan!');
  };

  const handleUpdatePengumuman = (updated: PengumumanRecord) => {
    setPengumumanList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    showToast('Pengumuman berhasil diperbarui!');
  };

  const handleDeletePengumuman = (id: string) => {
    setPengumumanList((prev) => prev.filter((p) => p.id !== id));
    showToast('Pengumuman berhasil dihapus.');
  };

  // 4. IPL Handlers
  const handleUploadBuktiIpl = async (data: {
    noTransaksi: string;
    namaWarga: string;
    lokasiRumah: string;
    nominal: number;
    durasiPaket?: string;
    metode: string;
    buktiUrl: string;
  }) => {
    const monthsCount = Math.max(1, Math.round(data.nominal / (tarifIplPerBulan || 30000)));
    const computedDurasi =
      data.durasiPaket ||
      (monthsCount % 12 === 0
        ? `${monthsCount / 12} Tahun (${monthsCount} Bulan)`
        : `${monthsCount} Bulan`);
    const newTrx: TransaksiIPL = {
      no: transaksiList.length + 1,
      noTransaksi: data.noTransaksi || `#TRX-${Date.now().toString().slice(-4)}`,
      namaWarga: data.namaWarga,
      lokasiRumah: data.lokasiRumah,
      periodeTercover: 'Oktober 2026',
      durasiPaket: computedDurasi,
      nominalBayar: data.nominal,
      status: 'Menunggu Verifikasi',
      tanggalPelunasan: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      metodePembayaran: data.metode,
      buktiBayar: data.buktiUrl,
      keterangan: 'Menunggu verifikasi admin/bendahara',
    };
    // Hapus transaksi Ditolak ATAU Menunggu Verifikasi sebelumnya untuk warga/rumah ini agar saat ubah paket (misal 1 Bulan -> 1 Tahun) langsung menggantikan tanpa double
    const cleanedTrxList = transaksiList.filter(
      (t) =>
        !(
          (t.namaWarga.toLowerCase() === data.namaWarga.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === data.lokasiRumah.toLowerCase()) &&
          (t.status === 'Ditolak' || t.status === 'Menunggu Verifikasi')
        )
    );
    const nextTrxList = [newTrx, ...cleanedTrxList];
    setTransaksiList(nextTrxList);

    const nextWargaList = wargaList.map((w) =>
      w.namaLengkap.toLowerCase() === data.namaWarga.toLowerCase() ||
      w.alamatRumah.toLowerCase() === data.lokasiRumah.toLowerCase()
        ? {
            ...w,
            statusIpl: 'Menunggu Verifikasi' as const,
            periodeTercover: computedDurasi,
            nominalIpl: data.nominal,
            catatan: `Sudah Masuk: ${computedDurasi} (Rp ${data.nominal.toLocaleString('id-ID')}) • Menunggu Verifikasi`,
          }
        : w
    );
    setWargaList(nextWargaList);
    setDashboardSummary(
      computeSummary(nextWargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    // Sinkronkan transaksi IPL baru, Bukti Bayar (Gambar/PDF), dan status "Menunggu Verifikasi" warga ke 4 tab Google Sheets
    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });

    showToast('Konfirmasi IPL masuk ke antrean Menunggu Verifikasi & tersimpan di Google Sheets!');
  };

  // Batalkan / Hapus Pengajuan IPL Milik Sendiri (Saat Masih Menunggu Verifikasi)
  const handleCancelPendingIpl = async (namaWarga: string, lokasiRumah: string) => {
    const nextTrxList = transaksiList.filter(
      (t) =>
        !(
          (t.namaWarga.toLowerCase() === namaWarga.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === lokasiRumah.toLowerCase()) &&
          t.status === 'Menunggu Verifikasi'
        )
    );
    setTransaksiList(nextTrxList);

    const nextWargaList = wargaList.map((w) =>
      w.namaLengkap.toLowerCase() === namaWarga.toLowerCase() ||
      w.alamatRumah.toLowerCase() === lokasiRumah.toLowerCase()
        ? {
            ...w,
            statusIpl: 'Belum Bayar' as const,
            periodeTercover: 'Oktober 2026',
            nominalIpl: tarifIplPerBulan,
            catatan: 'Pengajuan IPL dibatalkan oleh warga, status kembali Belum Bayar.',
          }
        : w
    );
    setWargaList(nextWargaList);
    setDashboardSummary(
      computeSummary(nextWargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });

    showToast(`Pengajuan IPL ${namaWarga} (${lokasiRumah}) berhasil dibatalkan & dihapus dari Google Sheets.`);
  };

  const handleUpdateTarifIpl = (newTarif: number) => {
    setTarifIplPerBulan(newTarif);
    setDashboardSummary(computeSummary(wargaList, transaksiList, pengeluaranList, newTarif, saldoAwalKas));
    showToast(`Tarif IPL berhasil diperbarui menjadi Rp ${newTarif.toLocaleString('id-ID')} / bulan!`);
  };

  const handleAddPengeluaran = async (item: PengeluaranKasRecord) => {
    const nextList = [item, ...pengeluaranList];
    setPengeluaranList(nextList);
    setDashboardSummary(computeSummary(wargaList, transaksiList, nextList, tarifIplPerBulan, saldoAwalKas));

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      nextList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`Pengeluaran Rp ${item.nominal.toLocaleString('id-ID')} berhasil dicatat & disinkronkan ke Google Sheet PENGELUARAN_KAS!`);
  };

  const handleDeletePengeluaran = async (id: string) => {
    const item = pengeluaranList.find((p) => p.id === id);
    if (item) {
      const nextList = pengeluaranList.filter((p) => p.id !== id);
      setPengeluaranList(nextList);
      setDashboardSummary(computeSummary(wargaList, transaksiList, nextList, tarifIplPerBulan, saldoAwalKas));

      const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
        wargaList,
        transaksiList,
        nextList,
        urunanList
      );
      await postToGas({
        action: 'syncAll',
        residents: residents as unknown as Record<string, unknown>[],
        iplRecords: iplRecords as unknown as Record<string, unknown>[],
        pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
        urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
      });
      showToast('Pencatatan pengeluaran berhasil dihapus dari sistem & Google Sheets.');
    }
  };

  const handleApproveIpl = async (noTransaksi: string, namaWarga: string) => {
    const targetTrx = transaksiList.find((t) => t.noTransaksi === noTransaksi);
    const nextTrxList = transaksiList.map((t) =>
      t.noTransaksi === noTransaksi ? { ...t, status: 'Lunas' as const } : t
    );
    setTransaksiList(nextTrxList);

    const parseTrxMonths = (durasiStr: string, nominal: number): number => {
      const blnMatch = (durasiStr || '').match(/(\d+)\s*Bulan/i);
      if (blnMatch) return Math.max(1, parseInt(blnMatch[1], 10));
      const thnMatch = (durasiStr || '').match(/(\d+)\s*Tahun/i);
      if (thnMatch) return Math.max(1, parseInt(thnMatch[1], 10) * 12);
      return Math.max(1, Math.round((nominal || 30000) / (tarifIplPerBulan || 30000)));
    };
    const formatTotalMonthsLabel = (m: number): string => {
      if (m === 12) return '1 Tahun (12 Bulan)';
      if (m > 12 && m % 12 === 0) return `${m / 12} Tahun (${m} Bulan)`;
      if (m > 12) return `${Math.floor(m / 12)} Thn ${m % 12} Bln (${m} Bulan)`;
      return `${m} Bulan`;
    };

    const nextWargaList = wargaList.map((w) => {
      const isMatch =
        w.namaLengkap.toLowerCase() === namaWarga.toLowerCase() ||
        (targetTrx && w.alamatRumah.toLowerCase() === targetTrx.lokasiRumah.toLowerCase());
      if (!isMatch) return w;
      const lunasForWarga = nextTrxList.filter(
        (t) =>
          t.status === 'Lunas' &&
          (t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase())
      );
      const totalMonths = lunasForWarga.reduce(
        (acc, t) => acc + parseTrxMonths(t.durasiPaket, t.nominalBayar),
        0
      );
      const totalNominal = lunasForWarga.reduce((acc, t) => acc + t.nominalBayar, 0);
      const totalLabel = totalMonths > 0 ? formatTotalMonthsLabel(totalMonths) : '1 Bulan';
      return {
        ...w,
        statusIpl: 'Lunas' as const,
        periodeTercover: totalLabel,
        nominalIpl: totalNominal || tarifIplPerBulan,
        catatan: `Lunas Terverifikasi Admin: ${totalLabel} (Rp ${(totalNominal || tarifIplPerBulan).toLocaleString('id-ID')})`,
      };
    });
    setWargaList(nextWargaList);
    setDashboardSummary(
      computeSummary(nextWargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`Pembayaran ${namaWarga} berhasil diverifikasi (LUNAS) & diupdate di Google Sheets!`);
  };

  const handleRejectIpl = async (noTransaksi: string, catatan: string) => {
    const targetTrx = transaksiList.find((t) => t.noTransaksi === noTransaksi);
    const nextTrxList = transaksiList.map((t) =>
      t.noTransaksi === noTransaksi
        ? { ...t, status: 'Ditolak' as const, keterangan: `Ditolak: ${catatan}` }
        : t
    );
    setTransaksiList(nextTrxList);

    const nextWargaList = wargaList.map((w) =>
      targetTrx &&
      (w.namaLengkap.toLowerCase() === targetTrx.namaWarga.toLowerCase() ||
        w.alamatRumah.toLowerCase() === targetTrx.lokasiRumah.toLowerCase())
        ? {
            ...w,
            statusIpl: 'Belum Bayar' as const,
            catatan: `Pembayaran ditolak: ${catatan}`,
          }
        : w
    );
    setWargaList(nextWargaList);
    setDashboardSummary(
      computeSummary(nextWargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`Bukti transfer ${targetTrx?.namaWarga || ''} ditolak & status di Google Sheets dikembalikan ke Belum Bayar.`);
  };
  const handleApproveUrunan = async (id: string, namaWarga: string) => {
    const targetItem = urunanList.find((u) => u.id === id);
    const nowStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const nextList = urunanList.map((u) =>
      u.id === id ? { ...u, status: 'Lunas' as const, tanggal: u.tanggal || nowStr } : u
    );
    setUrunanList(nextList);

    // Update status catatan warga terkait
    const cleanTargetName = (targetItem?.namaWarga || '').split('(')[0].trim().toLowerCase();
    const nextWargaList = wargaList.map((w) => {
      const matchByName = cleanTargetName && w.namaLengkap.toLowerCase().includes(cleanTargetName);
      const matchByAddr = targetItem && targetItem.namaWarga.toLowerCase().includes(w.alamatRumah.toLowerCase());
      if (matchByName || matchByAddr) {
        const pjuNote = targetItem?.tipe === 'DONATUR'
          ? `Donatur PJU: Rp ${targetItem.nominal.toLocaleString('id-ID')}`
          : `Urunan PJU: Lunas Wajib (Rp 115.000)`;
        return {
          ...w,
          tanggalUpdate: nowStr,
          catatan: w.catatan && w.catatan !== '-' ? `${w.catatan} • ${pjuNote}` : pjuNote,
        };
      }
      return w;
    });
    setWargaList(nextWargaList);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });

    showToast(`Setoran Urunan PJU ${namaWarga} berhasil diverifikasi (LUNAS) & tercatat di Google Sheets!`);
  };

  const handleRejectUrunan = async (id: string, catatan: string) => {
    const targetItem = urunanList.find((u) => u.id === id);
    const nextList = urunanList.map((u) =>
      u.id === id
        ? { ...u, status: 'Ditolak' as const, keterangan: `Ditolak: ${catatan}` }
        : u
    );
    setUrunanList(nextList);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });

    showToast(`Pengajuan Urunan PJU ${targetItem?.namaWarga || ''} ditolak dengan catatan: "${catatan}"`);
  };


  // =========================================================================
  // BATCH / BULK ACTIONS (CHECKLIST MASAL & SINKRONISASI 1x SYNC GOOGLE SHEETS)
  // =========================================================================
  const handleBatchApproveIpl = async (noTransaksiList: string[]) => {
    const parseTrxMonths = (durasiStr: string, nominal: number): number => {
      const blnMatch = (durasiStr || '').match(/(\d+)\s*Bulan/i);
      if (blnMatch) return Math.max(1, parseInt(blnMatch[1], 10));
      const thnMatch = (durasiStr || '').match(/(\d+)\s*Tahun/i);
      if (thnMatch) return Math.max(1, parseInt(thnMatch[1], 10) * 12);
      return Math.max(1, Math.round((nominal || 30000) / (tarifIplPerBulan || 30000)));
    };
    const formatTotalMonthsLabel = (m: number): string => {
      if (m === 12) return '1 Tahun (12 Bulan)';
      if (m > 12 && m % 12 === 0) return `${m / 12} Tahun (${m} Bulan)`;
      if (m > 12) return `${Math.floor(m / 12)} Thn ${m % 12} Bln (${m} Bulan)`;
      return `${m} Bulan`;
    };

    const targetSet = new Set(noTransaksiList);
    const nextTrxList = transaksiList.map((t) =>
      targetSet.has(t.noTransaksi) ? { ...t, status: 'Lunas' as const } : t
    );
    setTransaksiList(nextTrxList);

    const approvedTrx = transaksiList.filter((t) => targetSet.has(t.noTransaksi));
    const approvedWargaNames = new Set(approvedTrx.map((t) => t.namaWarga.toLowerCase()));
    const approvedHouses = new Set(approvedTrx.map((t) => t.lokasiRumah.toLowerCase()));

    const nextWargaList = wargaList.map((w) => {
      const isMatch =
        approvedWargaNames.has(w.namaLengkap.toLowerCase()) ||
        approvedHouses.has(w.alamatRumah.toLowerCase());
      if (!isMatch) return w;
      const lunasForWarga = nextTrxList.filter(
        (t) =>
          t.status === 'Lunas' &&
          (t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase())
      );
      const totalMonths = lunasForWarga.reduce(
        (acc, t) => acc + parseTrxMonths(t.durasiPaket, t.nominalBayar),
        0
      );
      const totalNominal = lunasForWarga.reduce((acc, t) => acc + t.nominalBayar, 0);
      const totalLabel = totalMonths > 0 ? formatTotalMonthsLabel(totalMonths) : '1 Bulan';
      return {
        ...w,
        statusIpl: 'Lunas' as const,
        periodeTercover: totalLabel,
        nominalIpl: totalNominal || tarifIplPerBulan,
        catatan: `Lunas Terverifikasi Admin: ${totalLabel} (Rp ${(totalNominal || tarifIplPerBulan).toLocaleString('id-ID')})`,
      };
    });
    setWargaList(nextWargaList);
    setDashboardSummary(
      computeSummary(nextWargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${noTransaksiList.length} Pembayaran IPL berhasil diverifikasi LUNAS masal!`);
  };

  const handleBatchRejectIpl = async (noTransaksiList: string[], reason: string) => {
    const targetSet = new Set(noTransaksiList);
    const nextTrxList = transaksiList.map((t) =>
      targetSet.has(t.noTransaksi)
        ? { ...t, status: 'Ditolak' as const, keterangan: `Ditolak: ${reason}` }
        : t
    );
    setTransaksiList(nextTrxList);

    const rejectedTrx = transaksiList.filter((t) => targetSet.has(t.noTransaksi));
    const rejectedWargaNames = new Set(rejectedTrx.map((t) => t.namaWarga.toLowerCase()));
    const rejectedHouses = new Set(rejectedTrx.map((t) => t.lokasiRumah.toLowerCase()));

    const nextWargaList = wargaList.map((w) => {
      const isMatch =
        rejectedWargaNames.has(w.namaLengkap.toLowerCase()) ||
        rejectedHouses.has(w.alamatRumah.toLowerCase());
      if (!isMatch) return w;
      return {
        ...w,
        statusIpl: 'Belum Bayar' as const,
        catatan: `Pembayaran ditolak masal: ${reason}`,
      };
    });
    setWargaList(nextWargaList);
    setDashboardSummary(
      computeSummary(nextWargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextWargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${noTransaksiList.length} Pengajuan IPL telah ditolak.`);
  };

  const handleBatchDeleteIpl = async (noTransaksiList: string[]) => {
    const targetSet = new Set(noTransaksiList);
    const nextTrxList = transaksiList.filter((t) => !targetSet.has(t.noTransaksi));
    setTransaksiList(nextTrxList);
    setDashboardSummary(
      computeSummary(wargaList, nextTrxList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      nextTrxList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${noTransaksiList.length} Data transaksi IPL berhasil dihapus masal.`);
  };

  const handleBatchApproveUrunan = async (ids: string[]) => {
    const targetSet = new Set(ids);
    const nowStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const nextList = urunanList.map((u) =>
      targetSet.has(u.id) ? { ...u, status: 'Lunas' as const, tanggal: u.tanggal || nowStr } : u
    );
    setUrunanList(nextList);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${ids.length} Setoran Urunan PJU berhasil diverifikasi LUNAS masal!`);
  };

  const handleBatchRejectUrunan = async (ids: string[], reason: string) => {
    const targetSet = new Set(ids);
    const nextList = urunanList.map((u) =>
      targetSet.has(u.id) ? { ...u, status: 'Ditolak' as const, keterangan: `Ditolak: ${reason}` } : u
    );
    setUrunanList(nextList);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${ids.length} Pengajuan Urunan PJU telah ditolak.`);
  };

  const handleBatchDeleteUrunan = async (ids: string[]) => {
    const targetSet = new Set(ids);
    const nextList = urunanList.filter((u) => !targetSet.has(u.id));
    setUrunanList(nextList);

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      pengeluaranList,
      nextList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${ids.length} Data Urunan PJU berhasil dihapus masal.`);
  };

  const handleBatchDeleteWarga = async (keys: string[]) => {
    const targetSet = new Set(keys);
    const nextList = wargaList.filter((w) => !targetSet.has(w.id || w.alamatRumah));
    setWargaList(nextList);
    setDashboardSummary(
      computeSummary(nextList, transaksiList, pengeluaranList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      nextList,
      transaksiList,
      pengeluaranList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${keys.length} Data warga berhasil dihapus masal dari Google Sheets.`);
  };

  const handleBatchDeletePengeluaran = async (ids: string[]) => {
    const targetSet = new Set(ids);
    const nextList = pengeluaranList.filter((p) => !targetSet.has(p.id));
    setPengeluaranList(nextList);
    setDashboardSummary(
      computeSummary(wargaList, transaksiList, nextList, tarifIplPerBulan, saldoAwalKas)
    );

    const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
      wargaList,
      transaksiList,
      nextList,
      urunanList
    );
    await postToGas({
      action: 'syncAll',
      residents: residents as unknown as Record<string, unknown>[],
      iplRecords: iplRecords as unknown as Record<string, unknown>[],
      pengeluaranRecords: pengeluaranRecords as unknown as Record<string, unknown>[],
      urunanRecords: urunanRecords as unknown as Record<string, unknown>[],
    });
    showToast(`${ids.length} Catatan pengeluaran kas berhasil dihapus masal.`);
  };

  const handleBatchDeletePengumuman = async (ids: string[]) => {
    const targetSet = new Set(ids);
    setPengumumanList((prev) => prev.filter((p) => !targetSet.has(p.id)));
    showToast(`${ids.length} Pengumuman jarkoman berhasil dihapus masal.`);
  };

  // Admin Account Handlers
  const handleCreateAdminAccount = (account: AdminAccount) => {
    setAdminAccounts((prev) => [...prev, account]);
    showToast(`Akun admin @${account.username} berhasil dibuat!`);
  };

  const handleDeleteAdminAccount = (id: string) => {
    setAdminAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Akun admin berhasil dihapus.');
  };

  // Keamanan Fisik: Auto-Logout Sesi Admin saat tidak aktif selama 20 Menit (Idle Timeout)
  useEffect(() => {
    if (!isAdmin || !currentAdmin) return;

    let timeoutId: number | undefined;
    const IDLE_LIMIT_MS = 20 * 60 * 1000; // 20 Menit

    const resetIdleTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        setCurrentAdmin(null);
        setActiveTab('beranda');
        showToast('Sesi admin ditutup otomatis karena tidak aktif selama 20 menit demi keamanan.');
      }, IDLE_LIMIT_MS);
    };

    resetIdleTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [isAdmin, currentAdmin]);

  return (
    <div className={`relative ${isAdmin && currentAdmin ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'} transition-colors duration-200`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-4 sm:right-8 z-[60] bg-[#0B484C] text-[#F3D37A] text-xs sm:text-sm font-bold px-5 py-3.5 rounded-2xl shadow-2xl border border-[#D9B352]/70 animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* =================================================================== */}
      {/* PEMISAHAN MURNI DI KODE: DASHBOARD ADMIN VS DASHBOARD WARGA         */}
      {/* =================================================================== */}
      {isAdmin && currentAdmin ? (
        /* A. MODE PENGURUS / ADMIN RT 08: 6 MENU COMMAND CENTER TERPADU */
        <DashboardAdmin
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentAdmin={currentAdmin}
          summary={dashboardSummary}
          wargaList={wargaList}
          rondaList={rondaList}
          transaksiList={transaksiList}
          pengeluaranList={pengeluaranList}
          programUrunan={programUrunan}
          urunanList={urunanList}
          pengumumanList={pengumumanList}
          rekeningBank={rekeningBank}
          tarifIpl={tarifIplPerBulan}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenAccountModal={() => setIsModalAccountOpen(true)}
          onLogout={() => {
            clearAdminAuthToken();
            setCurrentAdmin(null);
            setActiveTab('beranda');
            showToast('Keluar dari sesi Pengurus Paguyuban.');
          }}
          onSyncSheet={() => syncLiveFromGoogleSheets(false)}
          isSyncingSheet={isSyncingSheet}
          onApproveIpl={handleApproveIpl}
          onRejectIpl={handleRejectIpl}
          onUpdateTarifIpl={handleUpdateTarifIpl}
          onUpdateRekeningBank={handleUpdateRekeningBank}
          onAddPengeluaran={handleAddPengeluaran}
          onDeletePengeluaran={handleDeletePengeluaran}
          onAddUrunan={handleAddUrunan}
          onDeleteUrunan={handleDeleteUrunan}
          onApproveUrunan={handleApproveUrunan}
          onRejectUrunan={handleRejectUrunan}
          onAddWarga={handleAddWarga}
          onAdminUpdateWarga={handleAdminUpdateWarga}
          onDeleteWarga={handleDeleteWarga}
          onAddRonda={handleAddRonda}
          onUpdateRonda={handleUpdateRonda}
          onDeleteRonda={handleDeleteRonda}
          onAddPengumuman={handleAddPengumuman}
          onUpdatePengumuman={handleUpdatePengumuman}
          onDeletePengumuman={handleDeletePengumuman}
/>
      ) : (
        /* B. MODE WARGA: 6 MENU TERPADU DALAM DESAIN PROPERTY BENTO + BACKGROUND WEBSITE */
        <DashboardWarga
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          summary={dashboardSummary}
          wargaList={wargaList}
          rondaList={rondaList}
          transaksiList={transaksiList}
          pengeluaranList={pengeluaranList}
          programUrunan={programUrunan}
          urunanList={urunanList}
          pengumumanList={pengumumanList}
          rekeningBank={rekeningBank}
          tarifIpl={tarifIplPerBulan}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenLoginModal={() => setIsModalLoginOpen(true)}
          onAddWarga={handleAddWarga}
          onUpdateWarga={handleUpdateWarga}
          onDeleteWarga={handleDeleteWarga}
          ownedWargaKeys={ownedWargaKeys}
          onClaimWargaOwnership={handleClaimWargaOwnership}
          onUploadBuktiIpl={handleUploadBuktiIpl}
          onCancelPendingIpl={handleCancelPendingIpl}
          onAddUrunan={handleAddUrunan}
          onDeleteUrunan={handleDeleteUrunan}
        />
      )}

      {/* Modal Admin Login */}
      <AdminLoginModal
        isOpen={isModalLoginOpen}
        onClose={() => setIsModalLoginOpen(false)}
        adminAccounts={adminAccounts}
        onLoginSuccess={(admin) => {
          setCurrentAdmin(admin);
          setActiveTab('aksi');
          showToast(`Selamat datang, ${admin.nama} (${admin.jabatan})!`);
        }}
      />

      {/* Modal Admin Account Management */}
      <AdminAccountModal
        isOpen={isModalAccountOpen}
        onClose={() => setIsModalAccountOpen(false)}
        adminAccounts={adminAccounts}
        onCreateAccount={handleCreateAdminAccount}
        onDeleteAccount={handleDeleteAdminAccount}
        currentAdmin={currentAdmin}
      />
    </div>
  );
};