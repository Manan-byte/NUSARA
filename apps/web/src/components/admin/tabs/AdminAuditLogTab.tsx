import React, { useState, useEffect } from 'react';
import {
  WargaAuditLogEntry,
  loadWargaAuditLogs,
  inspectAuditLogsWithAi,
  AuditLogActor,
  AuditLogCategory,
} from '../../../services/aiAssistantService';
import {
  Sparkles,
  Search,
  User,
  Shield,
  Clock,
  Bot,
  ChevronLeft,
  ChevronRight,
  Activity,
  Send,
  FileCheck2,
  Lock,
  Printer,
  Calendar,
} from 'lucide-react';

export interface AdminAuditLogTabProps {
  currentAdminName: string;
  isSecretAuditor?: boolean;
}

export const AdminAuditLogTab: React.FC<AdminAuditLogTabProps> = ({
  currentAdminName,
  isSecretAuditor = false,
}) => {
  const [logs, setLogs] = useState<WargaAuditLogEntry[]>([]);
  const [actorFilter, setActorFilter] = useState<'ALL' | AuditLogActor>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AuditLogCategory>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Secret Auditor AI Inspector states
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    setLogs(loadWargaAuditLogs(isSecretAuditor));
  }, [isSecretAuditor]);

  const handleRunAiInspection = async (queryText?: string) => {
    const q = (queryText || aiQuestion).trim();
    if (!q || isAiAnalyzing) return;
    setIsAiAnalyzing(true);
    setAiAnalysisResult('');
    try {
      const res = await inspectAuditLogsWithAi({
        query: q,
        logs,
      });
      setAiAnalysisResult(res);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Extract available months from logs
  const availableMonths = Array.from(
    new Set(
      logs
        .map((l) => {
          const m = l.timestamp.match(/([A-Za-z]{3}\s*\d{4})/i);
          return m ? m[1] : 'Okt 2026';
        })
        .filter(Boolean)
    )
  );

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const logActor = log.actor || (log.action.includes('WARGA') ? 'WARGA' : 'ADMIN');
    const matchActor = actorFilter === 'ALL' || logActor === actorFilter;
    const matchCat = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchMonth =
      monthFilter === 'ALL' ||
      log.timestamp.toLowerCase().includes(monthFilter.toLowerCase());

    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      log.namaWarga.toLowerCase().includes(q) ||
      log.alamatRumah.toLowerCase().includes(q) ||
      log.aiSummary.toLowerCase().includes(q) ||
      (log.actorName || '').toLowerCase().includes(q) ||
      log.changes.some((c) => c.toLowerCase().includes(q));

    return matchActor && matchCat && matchMonth && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalWargaLogs = logs.filter(
    (l) => (l.actor || (l.action.includes('WARGA') ? 'WARGA' : 'ADMIN')) === 'WARGA'
  ).length;
  const totalAdminLogs = logs.filter(
    (l) => (l.actor || (l.action.includes('WARGA') ? 'WARGA' : 'ADMIN')) === 'ADMIN'
  ).length;

  // Print General Report (All logs or per selected month)
  const handlePrintGeneralReport = () => {
    const periodLabel =
      monthFilter === 'ALL' ? 'Seluruh Riwayat Mutasi' : `Periode Bulan ${monthFilter}`;
    const printWindow = window.open('', 'CetakAuditGeneralPopup', 'width=880,height=900,left=150,top=50,resizable=yes,scrollbars=yes');
    if (!printWindow) return;
    const rowsHtml = filteredLogs
      .map(
        (l, i) => `
        <tr style="border-bottom: 1px solid #cbd5e1; font-size: 11px;">
          <td style="padding: 8px 6px; text-align: center; color: #64748b; font-weight: bold;">#${i + 1}</td>
          <td style="padding: 8px; white-space: nowrap; font-family: monospace; font-size: 10px;">${l.timestamp}</td>
          <td style="padding: 8px;"><strong>${l.actor === 'WARGA' ? '👤 Warga' : `🛡️ Admin: ${l.actorName || 'Pengurus'}`}</strong></td>
          <td style="padding: 8px;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px; font-weight: bold; border: 1px solid #cbd5e1;">${l.action}</span></td>
          <td style="padding: 8px;"><strong>${l.namaWarga}</strong><br><small style="color: #64748b;">${l.alamatRumah}</small></td>
          <td style="padding: 8px; font-style: italic; color: #0f172a; line-height: 1.4;">${l.aiSummary}</td>
          <td style="padding: 8px; font-size: 10px; color: #475569;">${(l.changes || []).join('<br>• ')}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan_Audit_Blackbox_PK8_${monthFilter.replace(/\s+/g, '_')}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 28px; color: #0f172a; background: #fff; }
            .header { text-align: center; border-bottom: 3px double #0B484C; padding-bottom: 14px; margin-bottom: 16px; }
            .title { font-size: 18px; font-weight: 900; color: #0B484C; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }
            .sub { font-size: 11px; color: #475569; margin: 4px 0 0; }
            .meta { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 16px; background: #f8fafc; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 10px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #0B484C; color: #F3D37A; font-size: 11px; padding: 10px 8px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
            .sig { text-align: center; width: 240px; }
            .top-toolbar { position: sticky; top: 0; background: #0B484C; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 9999; }
            .btn-print { background: #F3D37A; color: #0B484C; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 12px; }
            .btn-close { background: rgba(255, 255, 255, 0.2); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.4); padding: 8px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 12px; }
            @media print { .top-toolbar { display: none !important; } body { padding: 12px; } }
          </style>
        </head>
        <body>
          <div class="top-toolbar">
            <div style="color: #FFF; font-weight: 800; font-size: 13px;">📄 Laporan Audit Blackbox Siap Cetak</div>
            <div style="display: flex; gap: 10px;">
              <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
              <button class="btn-close" onclick="window.close()">✕ Keluar / Tutup</button>
            </div>
          </div>
          <div class="header">
            <h1 class="title">PAGUYUBAN WARGA PESONA KAHURIPAN 8 TAHAP 2</h1>
            <p class="sub">BADAN PENGAWAS &amp; AUDITOR BLACKBOX INDEPENDEN • RT 08 / RW 08</p>
            <p style="font-size: 13px; font-weight: 900; margin-top: 6px; color: #0B484C; text-transform: uppercase;">LAPORAN RESMI AUDIT MUTASI DATA &amp; LOG SISTEM</p>
          </div>

          <div class="meta">
            <div>
              <strong>Periode Audit:</strong> ${periodLabel}<br>
              <strong>Status Vault:</strong> MASTER BLACKBOX (PERMANEN / TERVERIFIKASI)<br>
              <strong>Pemeriksa:</strong> ${currentAdminName} (Master Auditor)
            </div>
            <div style="text-align: right;">
              <strong>Tanggal Cetak:</strong> 14 Oktober 2026<br>
              <strong>Total Mutasi:</strong> ${filteredLogs.length} Aktivitas Terverifikasi<br>
              <strong>Engine Analisis:</strong> Gemini AI + Smart NLP Engine
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 32px; text-align: center;">No.</th>
                <th style="width: 115px;">Waktu</th>
                <th style="width: 95px;">Pelaksana</th>
                <th style="width: 110px;">Aksi</th>
                <th style="width: 140px;">Sasaran/Warga</th>
                <th>Analisis Ringkas AI (Audit Summary)</th>
                <th style="width: 160px;">Rincian Mutasi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 25px; color: #94a3b8;">Tidak ada catatan mutasi log untuk periode filter ini.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p style="color: #64748b; font-size: 10px; line-height: 1.5;">
                * Dokumen digital ini digenerate secara resmi dari Master Blackbox Vault SIM-Warga.<br>
                Integritas catatan dilindungi verifikasi kriptografis satu arah SHA-256.
              </p>
            </div>
            <div class="sig">
              <p style="margin: 0;">Mengetahui &amp; Mengesahkan,</p>
              <br><br><br>
              <p style="margin: 0;"><strong><u>${currentAdminName}</u></strong><br><span style="font-size: 10px; color: #475569;">Master Auditor Independen PK8</span></p>
            </div>
          </div>

          <script>
            window.onafterprint = function() { window.close(); };
            window.onload = function() { setTimeout(function() { window.print(); }, 350); };
          </script>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Print Single Log Audit Slip
  const handlePrintSingleLog = (log: WargaAuditLogEntry) => {
    const printWindow = window.open('', 'CetakAuditSinglePopup', 'width=780,height=880,left=180,top=60,resizable=yes,scrollbars=yes');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bukti_Audit_${log.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #0f172a; max-width: 620px; margin: 0 auto; background: #fff; }
            .card { border: 2px solid #0B484C; border-radius: 16px; padding: 26px; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 15px; font-weight: 900; color: #0B484C; margin: 0; text-transform: uppercase; }
            .sub { font-size: 11px; color: #64748b; margin: 4px 0 0; }
            .badge { display: inline-block; background: #0B484C; color: #F3D37A; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 6px; margin: 8px 0; font-family: monospace; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 9px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; }
            .ai-box { background: #fefce8; border: 1px solid #fef08a; padding: 12px 14px; border-radius: 10px; font-size: 12px; font-weight: bold; color: #854d0e; margin: 16px 0; line-height: 1.5; }
            .footer { margin-top: 24px; text-align: right; font-size: 11px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 class="title">PAGUYUBAN WARGA PESONA KAHURIPAN 8 TAHAP 2</h1>
              <p class="sub">LEMBAR BUKTI AUDIT RESMI MASTER BLACKBOX • ID: ${log.id}</p>
              <div class="badge">${log.action}</div>
            </div>

            <div class="row">
              <span style="color: #64748b;">Waktu Tercatat:</span>
              <strong>${log.timestamp}</strong>
            </div>
            <div class="row">
              <span style="color: #64748b;">Pelaksana / Aktor:</span>
              <strong>${log.actor === 'WARGA' ? '👤 Warga Mandiri' : `🛡️ Admin: ${log.actorName || 'Pengurus'}`}</strong>
            </div>
            <div class="row">
              <span style="color: #64748b;">Subjek / Warga Terkait:</span>
              <strong>${log.namaWarga} (${log.alamatRumah})</strong>
            </div>
            <div class="row">
              <span style="color: #64748b;">Kategori Data:</span>
              <strong>${log.category || 'MUTASI SISTEM'}</strong>
            </div>
            <div class="row">
              <span style="color: #64748b;">Engine Verifikasi:</span>
              <strong>${log.engine} (AI Verified)</strong>
            </div>

            <div class="ai-box">
              <div style="font-size: 10px; text-transform: uppercase; font-weight: 900; margin-bottom: 4px; color: #a16207;">✨ Ringkasan Analisis AI:</div>
              &ldquo;${log.aiSummary}&rdquo;
            </div>

            <div style="font-size: 11px; margin-top: 10px;">
              <strong>Rincian Perubahan Parameter:</strong>
              <ul style="margin: 6px 0 0; padding-left: 18px; color: #334155; line-height: 1.6;">
                ${(log.changes || []).map((c) => `<li>${c}</li>`).join('')}
              </ul>
            </div>

            <div class="footer">
              <p style="margin: 0;"><strong>Divalidasi oleh Sistem Master Auditor Independen PK8</strong></p>
              <p style="color: #94a3b8; font-size: 10px; font-family: monospace; margin: 4px 0 0;">SHA-256 Digest Verified • Master Vault Record</p>
            </div>
          </div>

          <script>
            window.onafterprint = function() { window.close(); };
            window.onload = function() { setTimeout(function() { window.print(); }, 350); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
              {isSecretAuditor ? 'Master Blackbox Audit & AI Auditor' : 'Log Aktivitas & Audit AI'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0B484C] dark:text-[#F3D37A] font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0B484C] dark:text-[#F3D37A]" />
              <span>AI Engine Active</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            {isSecretAuditor
              ? 'Vault Audit Independen: Data riwayat permanen mutasi Warga & Pengurus tanpa batas waktu'
              : 'Pencatatan real-time seluruh mutasi data oleh Warga dan Pengurus RT 08 dengan analisis otomatis AI'}
          </p>
        </div>

        {/* Right Action / Status Badge */}
        {isSecretAuditor ? (
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <button
              type="button"
              onClick={handlePrintGeneralReport}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#F3D37A] hover:opacity-95 text-[#092C2E] font-black text-xs flex items-center gap-1.5 shadow-md border-2 border-amber-500/50 transition-all hover:scale-105"
              title="Cetak Laporan Resmi Audit (PDF)"
            >
              <Printer className="w-4 h-4 text-[#092C2E]" />
              <span>Cetak Laporan PDF {monthFilter !== 'ALL' ? `(${monthFilter})` : ''}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B484C] text-[#F3D37A] text-xs font-black border-2 border-[#D9B352]/70 shadow-sm flex-shrink-0">
              <Lock className="w-3.5 h-3.5 text-[#F3D37A]" />
              <span className="hidden sm:inline">VAULT PERMANEN BLACKBOX</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold border-2 border-stone-200 dark:border-stone-700 flex-shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
            <span>Otomatis Bersih Setiap 1 Bulan (30 Hari)</span>
          </div>
        )}
      </div>

      {/* 2. STATS 4 MINI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-shrink-0">
        <div className="p-2.5 px-3 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">Total Log Tercatat</span>
            <p className="text-base font-black text-[#0B484C] dark:text-[#F3D37A]">
              {logs.length} Mutasi
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0B484C] dark:text-[#F3D37A] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">Aksi Warga Mandiri</span>
            <p className="text-base font-black text-blue-600 dark:text-blue-400">
              {totalWargaLogs} Aktivitas
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">Aksi Pengurus / Admin</span>
            <p className="text-base font-black text-amber-600 dark:text-amber-400">
              {totalAdminLogs} Tindakan
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">Engine AI Pengawas</span>
            <p className="text-xs font-black text-[#1C221E] dark:text-white truncate">
              Gemini + Smart NLP
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* SPECIAL: SECRET AUDITOR INTERACTIVE AI PANEL */}
      {isSecretAuditor && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-[#D9B352]/70 shadow-xs space-y-2.5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-[#1C221E] dark:text-white">
                Tanya AI Master Auditor (Analisis Anomali &amp; Kepatuhan Data)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  handleRunAiInspection(
                    'Analisis apakah ada anomali atau selisih pada pembayaran IPL dan pengeluaran kas'
                  )
                }
                className="px-2 py-0.5 rounded-md bg-[#FEF6DF] dark:bg-amber-950/50 text-[#092C2E] dark:text-[#F3D37A] border border-[#D9B352]/70 text-[10px] font-bold hover:scale-105 transition-all"
              >
                🔍 Deteksi Anomali Kas
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRunAiInspection(
                    'Rangkum seluruh mutasi dan perubahan data warga serta administrasi kas bulan ini'
                  )
                }
                className="px-2 py-0.5 rounded-md bg-[#FEF6DF] dark:bg-amber-950/50 text-[#092C2E] dark:text-[#F3D37A] border border-[#D9B352]/70 text-[10px] font-bold hover:scale-105 transition-all"
              >
                📊 Ringkasan Bulanan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunAiInspection();
              }}
              placeholder="Ketik pertanyaan audit untuk dianalisis oleh AI (cth: Periksa kepatuhan iuran warga Blok D)..."
              className="flex-1 h-9 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-[#051E20] text-xs font-bold text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C]"
            />
            <button
              type="button"
              disabled={isAiAnalyzing || !aiQuestion.trim()}
              onClick={() => handleRunAiInspection()}
              className="h-9 px-4 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAiAnalyzing ? 'Menganalisis...' : 'Analisis AI'}</span>
            </button>
          </div>

          {aiAnalysisResult && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-[#FEF9EB] dark:from-[#051E20] dark:to-stone-900 border-2 border-[#D9B352]/60 text-xs font-bold text-[#1C221E] dark:text-stone-100 animate-in fade-in space-y-1">
              <span className="text-[10px] font-black uppercase text-[#0B484C] dark:text-[#F3D37A] flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Hasil Analisis AI Master Auditor:</span>
              </span>
              <p className="leading-relaxed">&ldquo;{aiAnalysisResult}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* 3. FILTER BAR (TERMASUK FILTER PER BULAN) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {/* Actor filter */}
          {(['ALL', 'WARGA', 'ADMIN'] as const).map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => {
                setActorFilter(act);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                actorFilter === act
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              {act === 'ALL'
                ? 'Semua Aktor'
                : act === 'WARGA'
                ? '👤 Warga Mandiri'
                : '🛡️ Pengurus (Admin)'}
            </button>
          ))}

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1 hidden sm:block" />

          {/* Month Filter Dropdown */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 px-2 rounded-xl border border-stone-300 dark:border-stone-700">
            <Calendar className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setPage(1);
              }}
              className="h-7 bg-transparent text-[11px] font-black text-[#1C221E] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Bulan</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-[#072426]">
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1 hidden sm:block" />

          {/* Category pills */}
          {(['ALL', 'IPL', 'PJU', 'WARGA', 'KAS', 'RONDA', 'PENGUMUMAN'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat as any);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#F3D37A] text-[#092C2E] font-black'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kata kunci log, nama, blok..."
            className="w-full h-8 pl-9 pr-3 rounded-xl bg-stone-50 dark:bg-[#051E20] border-2 border-stone-300 dark:border-stone-600 text-xs font-medium text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C]"
          />
        </div>
      </div>

      {/* 4. TIMELINE CARDS LIST (WITH INDIVIDUAL PDF PRINT BUTTON) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
        {paginatedLogs.length > 0 ? (
          paginatedLogs.map((log) => {
            const isWarga =
              (log.actor || (log.action.includes('WARGA') ? 'WARGA' : 'ADMIN')) === 'WARGA';

            return (
              <div
                key={log.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs space-y-2.5 transition-all hover:border-[#0B484C]"
              >
                {/* Header row with Print Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                        isWarga
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300'
                          : 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                      }`}
                    >
                      {isWarga ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      <span>
                        {isWarga ? 'Warga Mandiri' : `Pengurus: ${log.actorName || 'Admin'}`}
                      </span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono font-bold">
                      {log.action}
                    </span>

                    <span className="text-[11px] font-extrabold text-[#1C221E] dark:text-white">
                      {log.namaWarga}
                    </span>
                    <span className="text-[10px] text-stone-400">({log.alamatRumah})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-semibold mr-1">
                      <Clock className="w-3 h-3 text-[#0B484C] dark:text-[#F3D37A]" />
                      <span>{log.timestamp}</span>
                    </div>

                    {/* Button Cetak PDF per Log */}
                    <button
                      type="button"
                      onClick={() => handlePrintSingleLog(log)}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-[#FEF6DF] dark:bg-stone-800 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-200 hover:text-[#092C2E] font-extrabold text-[10px] border-2 border-stone-300 dark:border-stone-600 flex items-center gap-1 transition-all shadow-2xs"
                      title="Cetak Bukti Audit Lembar Ini (PDF)"
                    >
                      <Printer className="w-3 h-3 text-[#0B484C] dark:text-[#F3D37A]" />
                      <span>Cetak PDF</span>
                    </button>
                  </div>
                </div>

                {/* AI Summary Highlight Box */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#FEF9EB] via-[#FFFDF5] to-emerald-50/60 dark:from-[#051E20] dark:to-stone-900 border-2 border-[#D9B352]/60 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#0B484C] dark:text-[#F3D37A] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
                    <span>Analisis Ringkas AI (Audit Summary):</span>
                  </div>
                  <p className="text-xs font-bold text-[#1C221E] dark:text-stone-100 leading-relaxed">
                    &ldquo;{log.aiSummary}&rdquo;
                  </p>
                </div>

                {/* Parameter details */}
                {log.changes && log.changes.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                    <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                      Rincian Perubahan:
                    </span>
                    {log.changes.map((chg, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-50 dark:bg-[#051E20] border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium"
                      >
                        {chg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-stone-400 bg-white dark:bg-[#072B2E] rounded-2xl border-2 border-stone-300 dark:border-stone-700 shadow-xs space-y-2">
            <span className="text-3xl block">📋</span>
            <p className="font-extrabold text-[#1C221E] dark:text-white">
              Tidak ada log aktivitas yang cocok dengan filter
            </p>
            <p className="text-[11px]">
              Setiap mutasi data oleh warga atau admin akan dicatat dan dianalisis otomatis oleh AI di
              sini.
            </p>
          </div>
        )}
      </div>

      {/* 5. PAGINATION FOOTER */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between text-xs flex-shrink-0">
        <span className="text-stone-400">
          Menampilkan{' '}
          <strong className="text-[#1C221E] dark:text-white">
            {filteredLogs.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} -{' '}
            {Math.min(page * itemsPerPage, filteredLogs.length)}
          </strong>{' '}
          dari {filteredLogs.length} Log Aktivitas
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>
          <span className="px-2 font-bold text-xs">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <span>Berikutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
