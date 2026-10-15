import { KwitansiModalData } from '../components/warga/modals/WargaKwitansiModal';

export function downloadSlipText(k: KwitansiModalData): void {
    const slipText = [
      '======================================================================',
      '         PAGUYUBAN WARGA PESONA KAHURIPAN 8 TAHAP 2',
      '      SURAT BUKTI PELUNASAN RESMI (KWITANSI DIGITAL KAS)',
      '======================================================================',
      `No. Kwitansi      : ${k.resiNo}`,
      `Tanggal Terbit    : ${k.tanggalBayar || '12 Oktober 2026'}`,
      `Status Transaksi  : LUNAS (TERVERIFIKASI BENDAHARA)`,
      '----------------------------------------------------------------------',
      'IDENTITAS PEMBAYAR:',
      `Nama Lengkap      : ${k.namaWarga}`,
      `Alamat Rumah      : ${k.blokRumah}`,
      `No. WhatsApp      : ${k.noWa || '-'}`,
      '----------------------------------------------------------------------',
      'RINCIAN PEMBAYARAN:',
      `Pos Iuran         : ${k.kategori}`,
      `Rincian / Paket   : ${k.rincian}`,
      `Masa Aktif        : ${k.masaAktif || '-'}`,
      `Metode Bayar      : ${k.metode}`,
      '----------------------------------------------------------------------',
      `TOTAL DIBAYAR     : Rp ${k.nominal.toLocaleString('id-ID')}`,
      `TERBILANG         : ${k.terbilang}`,
      '----------------------------------------------------------------------',
      'PENGESAHAN DIGITAL:',
      `Diverifikasi Oleh : ${k.verifiedBy}`,
      `Kode Keamanan     : VALID-PK8-${k.type.toUpperCase()}-${k.resiNo.replace(/\D/g, '') || '2026'}`,
      'Stempel Digital   : BPH PAGUYUBAN PESONA KAHURIPAN 8 TAHAP 2 (SAH)',
      '======================================================================',
      'Dokumen ini merupakan bukti pembayaran resmi yang sah dan tercatat',
      'pada pembukuan kas Paguyuban Pesona Kahuripan 8 Tahap 2.',
      '======================================================================',
    ].join('\n');

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kwitansi_${k.type.toUpperCase()}_${k.namaWarga.replace(/\s+/g, '_')}_${k.blokRumah.replace(/[\s./]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function printKwitansiPdf(
  k: KwitansiModalData,
  onDone?: () => void
): void {
  const setKwitansiModal = (val: null) => {
    if (onDone) onDone();
  };
  const setIsPrintingKwitansi = (val: boolean) => {};

    setIsPrintingKwitansi(true);
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kwitansi_${k.type.toUpperCase()}_${k.namaWarga.replace(/\\s+/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 16px 20px;
      background: #F8FAFC;
      color: #1C221E;
      line-height: 1.4;
      font-size: 13px;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      background: #0B484C;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 9999;
    }
    .top-toolbar-title {
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .top-toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #F3D37A;
      color: #0B484C;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .kwitansi-box {
      max-width: 680px;
      margin: 0 auto;
      border: 2px solid #D9B352;
      border-radius: 16px;
      padding: 26px 28px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 2px solid #D9B352;
    }
    .logo-container {
      width: 54px;
      height: 54px;
      border-radius: 12px;
      background: #0B484C;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid #D9B352;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .header-text h2 {
      margin: 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #9A7018;
      font-weight: 800;
    }
    .header-text h1 {
      margin: 3px 0 2px 0;
      font-size: 17px;
      font-weight: 900;
      color: #0B484C;
      letter-spacing: -0.3px;
    }
    .header-text p {
      margin: 0;
      font-size: 11px;
      color: #64748B;
    }
    .resi-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 16px;
      margin-bottom: 16px;
    }
    .resi-no {
      font-family: monospace;
      font-weight: 800;
      font-size: 13px;
      color: #0B484C;
    }
    .badge-lunas {
      display: inline-block;
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-details tr {
      border-bottom: 1px solid #F1F5F9;
    }
    .table-details td {
      padding: 9px 4px;
      vertical-align: middle;
    }
    .td-label {
      color: #64748B;
      width: 38%;
    }
    .td-value {
      font-weight: 700;
      color: #0F172A;
      text-align: right;
    }
    .total-box {
      background: #FEF9EB;
      border: 1.5px solid #D9B352;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .total-nominal {
      font-size: 18px;
      font-weight: 900;
      color: #0B484C;
    }
    .total-terbilang {
      font-size: 11px;
      color: #78350F;
      font-style: italic;
      margin-top: 2px;
    }
    .auth-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-top: 12px;
    }
    .stamp-badge {
      display: inline-block;
      border: 2px solid #E11D48;
      color: #E11D48;
      font-size: 9px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      transform: rotate(-3deg);
      box-shadow: 0 1px 3px rgba(225, 29, 72, 0.2);
    }
    .footer-note {
      text-align: center;
      margin-top: 16px;
      font-size: 10px;
      color: #94A3B8;
      line-height: 1.5;
    }
    @media print {
      .top-toolbar { display: none !important; }
      body {
        padding: 0 !important;
        background: #FFF !important;
      }
      .kwitansi-box {
        border: 2px solid #D9B352 !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="top-toolbar">
    <div class="top-toolbar-title">
      <span>📄 Kwitansi Resmi Siap Cetak (${k.resiNo})</span>
    </div>
    <div class="top-toolbar-actions">
      <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Keluar / Tutup</button>
    </div>
  </div>

  <div class="kwitansi-box">
    <div class="header">
      <div class="logo-container">
        <img class="logo-img" src="/logo-pesona-kahuripan.png" alt="Logo">
      </div>
      <div class="header-text">
        <h2>Paguyuban Warga Pesona Kahuripan 8 Tahap 2 • RT 08</h2>
        <h1>${k.type === 'ipl' ? 'KWITANSI RESMI PELUNASAN IURAN IPL' : 'KWITANSI RESMI SETORAN URUNAN PJU'}</h1>
        <p>Surat Bukti Pelunasan Keuangan Sah Terverifikasi Bendahara Paguyuban</p>
      </div>
    </div>

    <div class="resi-bar">
      <div>
        <div style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Nomor Kwitansi / Resi</div>
        <div class="resi-no">${k.resiNo}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge-lunas">✓ LUNAS TERVERIFIKASI</span>
      </div>
    </div>

    <table class="table-details">
      <tr>
        <td class="td-label">Nama Kepala Keluarga</td>
        <td class="td-value" style="font-size: 14px;">${k.namaWarga}</td>
      </tr>
      <tr>
        <td class="td-label">Alamat Rumah / Blok</td>
        <td class="td-value" style="color: #0B484C;">${k.blokRumah}</td>
      </tr>
      <tr>
        <td class="td-label">Pos Pembayaran Kas</td>
        <td class="td-value">${k.kategori}</td>
      </tr>
      <tr>
        <td class="td-label">Rincian Durasi / Program</td>
        <td class="td-value">${k.rincian}</td>
      </tr>
      <tr>
        <td class="td-label">Masa Aktif / Periode</td>
        <td class="td-value" style="color: #065F46;">${k.masaAktif}</td>
      </tr>
      <tr>
        <td class="td-label">Metode Penyetoran</td>
        <td class="td-value">${k.metode}</td>
      </tr>
    </table>

    <div class="total-box">
      <div>
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9A7018;">Total Jumlah Lunas</div>
        <div class="total-terbilang">Terbilang: &ldquo;${k.terbilang}&rdquo;</div>
      </div>
      <div class="total-nominal">
        Rp ${k.nominal.toLocaleString('id-ID')}
      </div>
    </div>

    <div class="auth-section">
      <div>
        <div style="font-size: 9px; font-weight: 800; color: #9A7018; text-transform: uppercase; letter-spacing: 1px;">Pengesahan &amp; Verifikasi</div>
        <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin: 2px 0;">${k.verifiedBy}</div>
        <div style="font-size: 10px; color: #94A3B8; font-family: monospace;">VALID-PK8-${k.type.toUpperCase()}-${k.resiNo.replace(/\\D/g, '') || '2026'}</div>
      </div>
      <div style="text-align: right;">
        <div class="stamp-badge">STEMPEL DIGITAL SAH • PK8</div>
        <div style="font-size: 9px; color: #64748B; margin-top: 4px; font-weight: 600;">Tercatat Resmi di Google Sheets</div>
      </div>
    </div>

    <div class="footer-note">
      * Dokumen ini merupakan bukti pembayaran resmi yang sah dan tercatat pada kas Paguyuban Pesona Kahuripan 8 Tahap 2.<br>
      Dicetak secara digital pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
    </div>
  </div>

  <script>
    window.onafterprint = function() {
      window.close();
    };
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    const popup = window.open('', 'CetakKwitansiPopup', 'width=780,height=880,left=150,top=60,resizable=yes,scrollbars=yes');
    if (popup) {
      popup.document.open();
      popup.document.write(htmlContent);
      popup.document.close();
      setKwitansiModal(null);
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch {}
            setKwitansiModal(null);
          }, 1000);
        }, 300);
      }
    }
    setIsPrintingKwitansi(false);
}
