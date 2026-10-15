/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SISTEM PENDATAAN WARGA & MONITORING KAS IPL
 * KOMPLEK: PESONA KAHURIPAN 8 TAHAP 2 (RT 08 / RW 08)
 * =========================================================================
 * 
 * Google Spreadsheet ID: 1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0
 * Apps Script Project:   15cEu1GaJI8-fgfGbhBYkM2-s_ZweHYELKwop8MZ-PSUcobKAXmZyCsiE
 * INTEGRASI GAMBAR BUKTI STRUK TRANSFER:
 * - Gambar base64 yang diunggah warga otomatis disimpan ke Google Drive (Folder BUKTI_TRANSFER_IPL_PK8)
 * - Tautan file Drive langsung masuk ke Kolom 11 (Bukti Bayar) di tab PEMBAYARAN_IPL
 * - Dapat dibuka & dilihat langsung dari Google Sheets maupun Website
 * =========================================================================
 */

var SPREADSHEET_ID = "1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0";

/**
 * Handle POST Request dari Web Application
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Data POST kosong" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'syncAll';
    var ss = getSpreadsheet();

    // 1. Aksi syncAll (Sinkronisasi penuh warga, kas masuk IPL & kas keluar operasional)
    if (action === 'syncAll') {
      var residents = payload.residents || [];
      var iplRecords = payload.iplRecords || [];
      var expenses = payload.pengeluaranRecords || payload.expenses || [];
      var urunan = payload.urunanRecords || payload.urunan || [];
      syncCleanData(ss, residents, iplRecords, expenses, urunan);

      return createJsonResponse({
        success: true,
        message: "Spreadsheet berhasil disinkronkan (4 Tab: DATA_WARGA, PEMBAYARAN_IPL, PENGELUARAN_KAS, URUNAN_PJU)!",
        wargaCount: residents.length,
        iplCount: iplRecords.length,
        expenseCount: expenses.length,
        urunanCount: urunan.length,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Aksi daftarWarga (Tambah 1 warga langsung ke baris terakhir DATA_WARGA)
    if (action === 'daftarWarga' || action === 'addResident') {
      var sheetWarga = ss.getSheetByName("DATA_WARGA") || ss.insertSheet("DATA_WARGA");
      var nextNo = Math.max(1, sheetWarga.getLastRow());
      var r = payload.data || payload;

      var rawCatatan = r.catatan || "-";
      var pinVal = r.pin || "-";
      var catatanWithPw = rawCatatan.indexOf("Password:") !== -1 ? rawCatatan : rawCatatan + " • Password: " + pinVal;

      var idWarga = r.id || ("#WRG-" + ("000" + nextNo).slice(-3));
      var rawWaDigits = String(r.noWhatsapp || r.telepon || "").replace(/\D/g, "");
      var last4Wa = rawWaDigits.length >= 4 ? ("'" + rawWaDigits.slice(-4)) : "-";
      var timestampNow = Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB";
      var rowIdx = nextNo + 1;
      sheetWarga.appendRow([
        nextNo,
        idWarga,
        r.namaLengkap || r.nama || "-",
        r.jenisKelamin || "Laki-laki",
        r.blok || "E",
        Number(r.noRumah || r.nomor) || 1,
        r.alamatRumah || r.blokNomor || ("Blok " + (r.blok || "E") + " No. " + (r.noRumah || r.nomor || 1)),
        "'" + (r.noWhatsapp || r.telepon || "-"),
        r.statusTempatTinggal || r.statusMenetap || "Menetap",
        r.pekerjaan || "-",
        r.agama || "Islam",
        r.statusPernikahan || "Menikah",
        r.statusDalamKeluarga || "Kepala Keluarga",
        Number(r.jmlJiwa || r.jumlahAnggota) || 1,
        r.anggotaKeluargaTambahan || r.anggotaKeluarga || "-",
        r.statusIpl || "Belum Bayar",
        r.periodeTercover || r.periodeIpl || "Oktober 2026",
        formatRp(r.nominalIpl || 30000),
        r.tanggalUpdate || r.tanggalBayarIpl || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy"),
        catatanWithPw,
        pinVal,
        last4Wa,
        r.waktuInput || timestampNow
      ]);
      return createJsonResponse({
        success: true,
        message: "Data warga baru berhasil ditambahkan ke tab DATA_WARGA!"
      });
    }

    // 3. Aksi uploadBuktiIpl / bayarIPL (Menyimpan foto ke Google Drive & mencatat ke PEMBAYARAN_IPL)
    if (action === 'uploadBuktiIpl' || action === 'bayarIPL') {
      var sheetIpl = ss.getSheetByName("PEMBAYARAN_IPL") || ss.insertSheet("PEMBAYARAN_IPL");
      var nextTrxNo = Math.max(1, sheetIpl.getLastRow());
      var trx = payload.data || payload;
      var trxId = trx.noTransaksi || ("#TRX-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmm"));
      var buktiLink = processBuktiBayar(trx.buktiBayar || trx.buktiUrl, trxId);

      var timestampNow = Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB";
      var rowIdx = nextTrxNo + 1;
      sheetIpl.appendRow([
        nextTrxNo,
        trxId,
        trx.namaWarga || trx.nama || "-",
        trx.lokasiRumah || trx.blokNomor || "-",
        trx.periodeTercover || "Oktober 2026",
        trx.durasiPaket || "1 Bulan",
        formatRp(trx.nominalBayar || trx.nominal || 30000),
        trx.status || "Menunggu Verifikasi",
        trx.tanggalPelunasan || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy"),
        trx.metodePembayaran || trx.metode || "Transfer Bank",
        buktiLink,
        trx.keterangan || "Menunggu konfirmasi bendahara & Ketua RT",
        trx.waktuInput || timestampNow
      ]);
      return createJsonResponse({
        success: true,
        message: "Data pembayaran IPL & gambar bukti berhasil dicatat!",
        buktiDriveUrl: buktiLink
      });
    }

    // 4. Aksi catatPengeluaran (Tambah kas keluar langsung ke tab PENGELUARAN_KAS)
    if (action === 'catatPengeluaran' || action === 'addExpense') {
      var sheetExp = ss.getSheetByName("PENGELUARAN_KAS") || ss.insertSheet("PENGELUARAN_KAS");
      var nextExpNo = Math.max(1, sheetExp.getLastRow());
      var exp = payload.data || payload;

      var timestampNow = Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB";
      var rowIdx = nextExpNo + 1;
      sheetExp.appendRow([
        nextExpNo,
        exp.id || ("#EXP-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmm")),
        exp.tanggal || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy"),
        exp.kategori || "Lainnya",
        exp.keterangan || "-",
        formatRp(exp.nominal || 0),
        exp.penerima || "Petugas Lingkungan",
        exp.waktuInput || exp.createdAt || timestampNow
      ]);
      return createJsonResponse({
        success: true,
        message: "Data pengeluaran kas berhasil dicatat di tab PENGELUARAN_KAS!"
      });
    }

    // 5. Aksi bayarUrunanPju / addUrunan (Tambah setoran Urunan PJU langsung ke tab khusus URUNAN_PJU)
    if (action === 'bayarUrunanPju' || action === 'addUrunan') {
      var sheetUrunan = ss.getSheetByName("URUNAN_PJU") || ss.insertSheet("URUNAN_PJU");
      var nextUrunanNo = Math.max(1, sheetUrunan.getLastRow());
      var u = payload.data || payload;
      var isDonatur = u.tipe === "DONATUR" || String(u.kategori || "").toLowerCase().indexOf("donatur") !== -1;
      var rowIdx = nextUrunanNo + 1;

      var timestampNow = Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB";
      var idPju = u.id || ("#PJU-" + ("000" + nextUrunanNo).slice(-3));
      var buktiPju = processBuktiBayar(u.buktiBayar || u.buktiUrl, idPju);

      sheetUrunan.appendRow([
        nextUrunanNo,
        idPju,
        u.namaWarga || u.nama || "Donatur PK8 (Hamba Allah)",
        isDonatur ? "🟡 ★ Donatur Sukarela" : "🔵 Urunan Wajib KK",
        formatRp(u.nominal || 115000),
        u.metode || "Transfer (TF)",
        buktiPju,
        u.keterangan || (isDonatur ? "Donatur PJU" : "Urunan Wajib PJU"),
        u.tanggal || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy"),
        u.waktuInput || timestampNow
      ]);
      sheetUrunan.getRange(rowIdx, 1, 1, 10).setBackground(isDonatur ? "#FEF3C7" : "#DBEAFE");
      return createJsonResponse({
        success: true,
        message: "Data setoran Urunan PJU berhasil dicatat di tab khusus URUNAN_PJU!"
      });
    }

    // 6. Aksi deleteWarga (Hapus baris di DATA_WARGA berdasarkan ID Warga di Kolom B)
    if (action === 'deleteWarga') {
      var sheetW = ss.getSheetByName("DATA_WARGA");
      var targetId = String(payload.id || "").trim();
      if (sheetW && targetId) {
        var vals = sheetW.getDataRange().getValues();
        for (var i = vals.length - 1; i >= 1; i--) {
          if (String(vals[i][1]).trim() === targetId) {
            sheetW.deleteRow(i + 1);
            break;
          }
        }
      }
      return createJsonResponse({ success: true, message: "Warga dengan ID " + targetId + " berhasil dihapus!" });
    }

    // 7. Aksi deleteUrunan (Hapus baris di URUNAN_PJU berdasarkan ID Transaksi PJU di Kolom B)
    if (action === 'deleteUrunan') {
      var sheetU = ss.getSheetByName("URUNAN_PJU");
      var targetPjuId = String(payload.id || "").trim();
      if (sheetU && targetPjuId) {
        var uVals = sheetU.getDataRange().getValues();
        for (var j = uVals.length - 1; j >= 1; j--) {
          if (String(uVals[j][1]).trim() === targetPjuId) {
            sheetU.deleteRow(j + 1);
            break;
          }
        }
      }
      return createJsonResponse({ success: true, message: "Data PJU dengan ID " + targetPjuId + " berhasil dihapus!" });
    }

    return createJsonResponse({ success: false, error: "Action tidak dikenali: " + action }, 400);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET Request
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'status';
  var ss = getSpreadsheet();

  if (action === 'getWarga') {
    var sheetW = ss.getSheetByName("DATA_WARGA");
    return createJsonResponse({
      success: true,
      warga: sheetW ? sheetW.getDataRange().getValues() : []
    });
  }

  if (action === 'getIpl') {
    var sheetI = ss.getSheetByName("PEMBAYARAN_IPL");
    return createJsonResponse({
      success: true,
      ipl: sheetI ? sheetI.getDataRange().getValues() : []
    });
  }

  if (action === 'getPengeluaran') {
    var sheetE = ss.getSheetByName("PENGELUARAN_KAS");
    return createJsonResponse({
      success: true,
      pengeluaran: sheetE ? sheetE.getDataRange().getValues() : []
    });
  }

  if (action === 'getUrunan') {
    var sheetU = ss.getSheetByName("URUNAN_PJU");
    return createJsonResponse({
      success: true,
      urunan: sheetU ? sheetU.getDataRange().getValues() : []
    });
  }

  return createJsonResponse({
    status: 'online',
    komplek: 'Pesona Kahuripan 8 Tahap 2',
    spreadsheetId: SPREADSHEET_ID,
    tabsAktif: ['DATA_WARGA', 'PEMBAYARAN_IPL', 'PENGELUARAN_KAS', 'URUNAN_PJU'],
    timestamp: new Date().toISOString()
  });
}

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Helper untuk memproses foto bukti struk ke Google Drive
 */
function processBuktiBayar(bukti, trxId) {
  if (!bukti || bukti === '-' || bukti === 'Terlampir') return '-';
  
  var strBukti = String(bukti).trim();

  // Jika sudah berupa URL web / Google Drive (misal https://drive.google.com/...)
  if (strBukti.indexOf('http') === 0) {
    return strBukti;
  }
  
  // Jika berupa base64 image atau PDF data (diunggah dari smartphone/web)
  if (strBukti.indexOf('data:image') === 0 || strBukti.indexOf('data:application/pdf') === 0) {
    try {
      var folderName = "BUKTI_TRANSFER_IPL_PK8";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

      var commaIdx = strBukti.indexOf(',');
      var meta = strBukti.substring(0, commaIdx);
      var rawData = strBukti.substring(commaIdx + 1);
      var isPdf = meta.indexOf("application/pdf") !== -1;
      var mimeType = isPdf ? "application/pdf" : (meta.indexOf("image/png") !== -1 ? "image/png" : "image/jpeg");
      var ext = isPdf ? ".pdf" : (mimeType === "image/png" ? ".png" : ".jpg");

      var decoded = Utilities.base64Decode(rawData);
      var safeName = (trxId || "struk").replace(/[^a-zA-Z0-9_-]/g, "_") + ext;
      var blob = Utilities.newBlob(decoded, mimeType, safeName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return "https://drive.google.com/file/d/" + file.getId() + "/view?usp=sharing";
    } catch (err) {
      return "Terlampir di Web (Base64)";
    }
  }

  return strBukti;
}

/**
 * Format angka mata uang rupiah murni dengan pemisah titik (Contoh: Rp 30.000, Rp 115.000)
 */
function formatRp(num) {
  var n = Math.round(Number(num) || 0);
  return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Helper untuk merapikan lebar kolom, tinggi baris, perataan teks, dan garis tabel
 */
function applyCleanTableLayout(sheet, colWidths, numRows, centerCols, rightCols) {
  var numCols = colWidths.length;

  // 1. Atur lebar tiap kolom secara presisi agar teks header maupun isi tidak pernah menumpuk/terpotong
  for (var c = 0; c < numCols; c++) {
    sheet.setColumnWidth(c + 1, colWidths[c]);
  }

  // 2. Atur tinggi baris Header (38px) dan perataan vertikal tengah
  sheet.setRowHeight(1, 38);
  sheet.getRange(1, 1, 1, numCols)
    .setVerticalAlignment("middle")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // 3. Jika ada baris data, atur tinggi baris data (28px), border halus, dan perataan kolom
  if (numRows > 0) {
    sheet.setRowHeights(2, numRows, 28);
    var dataRange = sheet.getRange(2, 1, numRows, numCols);
    dataRange
      .setVerticalAlignment("middle")
      .setFontFamily("Arial")
      .setFontSize(10)
      .setHorizontalAlignment("left")
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    for (var i = 0; i < (centerCols || []).length; i++) {
      try { sheet.getRange(2, centerCols[i], numRows, 1).setHorizontalAlignment("center"); } catch (e) {}
    }
    for (var j = 0; j < (rightCols || []).length; j++) {
      try { sheet.getRange(2, rightCols[j], numRows, 1).setHorizontalAlignment("right").setFontWeight("bold"); } catch (e) {}
    }

    try {
      sheet.getRange(1, 1, numRows + 1, numCols)
        .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
    } catch (e) {}
  } else {
    try {
      sheet.getRange(1, 1, 1, numCols)
        .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
    } catch (e) {}
  }
}

/**
 * SINKRONISASI BERSIH: 4 TAB RESMI (DATA_WARGA, PEMBAYARAN_IPL, PENGELUARAN_KAS, URUNAN_PJU)
 */
function syncCleanData(ss, residents, iplRecords, expenses, urunan) {
  // =========================================================================
  // 1. FORMAT TAB 1: DATA_WARGA (19 Kolom Rapi & Proporsional)
  // =========================================================================
  var sheetWarga = ss.getSheetByName("DATA_WARGA") || ss.insertSheet("DATA_WARGA");
  sheetWarga.clear();

  var headersWarga = [
    [
      "No.", "ID Warga", "Nama Lengkap", "Jenis Kelamin", "Blok", "No. Rumah", "Alamat Rumah", 
      "No. WhatsApp", "Status Tempat Tinggal", "Pekerjaan", "Agama", "Status Pernikahan", 
      "Status Dalam Keluarga", "Jml Jiwa", "Anggota Keluarga Tambahan", "Status IPL", 
      "Periode Tercover", "Nominal IPL (Rp)", "Tanggal Update", "Catatan", "Password / PIN", "4 Digit Terakhir WA", "Waktu Input"
    ]
  ];
  var widthsWarga = [55, 120, 215, 125, 75, 95, 165, 145, 165, 155, 95, 140, 165, 90, 220, 135, 145, 150, 135, 230, 160, 150, 185];

  sheetWarga.getRange(1, 1, 1, headersWarga[0].length)
    .setValues(headersWarga)
    .setFontWeight("bold")
    .setBackground("#065F46")
    .setFontColor("#FFFFFF")
    .setHorizontalAlignment("center");
  sheetWarga.setFrozenRows(1);

  var rowsWarga = [];
  if (residents && residents.length > 0) {
    rowsWarga = residents.map(function(r, idx) {
      var anggotaStr = "-";
      if (Array.isArray(r.anggotaKeluarga) && r.anggotaKeluarga.length > 0) {
        anggotaStr = r.anggotaKeluarga.map(function(a) { return (a.nama || '-') + " (" + (a.hubungan || '-') + ")"; }).join(", ");
      } else if (typeof r.anggotaKeluarga === 'string') {
        anggotaStr = r.anggotaKeluarga;
      }

      var idWrg = r.id || ("#WRG-" + ("000" + (idx + 1)).slice(-3));
      var waClean = String(r.telepon || r.noWhatsapp || "").replace(/\D/g, "");
      var waLast4 = waClean.length >= 4 ? ("'" + waClean.slice(-4)) : "-";
      return [
        idx + 1,
        idWrg,
        r.nama || r.namaLengkap || "-",
        r.jenisKelamin || "Laki-laki",
        r.blok || "E",
        Number(r.nomor || r.noRumah) || 1,
        r.blokNomor || r.alamatRumah || ("Blok " + (r.blok || "E") + " No. " + (r.nomor || r.noRumah || 1)),
        "'" + (r.telepon || r.noWhatsapp || "-"),
        r.statusTempatTinggal || r.statusMenetap || "Menetap",
        r.pekerjaan || "-",
        r.agama || "Islam",
        r.statusPernikahan || "Menikah",
        r.statusDalamKeluarga || "Kepala Keluarga",
        Number(r.jumlahAnggota || r.jmlJiwa) || 1,
        anggotaStr,
        r.statusIpl || "Belum Bayar",
        r.periodeIpl || r.periodeTercover || "Oktober 2026",
        formatRp(r.nominalIpl || 30000),
        "'" + (r.tanggalBayarIpl || r.tanggalUpdate || r.updatedAt || "11 Okt 2026"),
        r.catatan || "-",
        r.pin || "-",
        waLast4,
        r.waktuInput || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB"
      ];
    });

    sheetWarga.getRange(2, 1, rowsWarga.length, headersWarga[0].length).setValues(rowsWarga);
  }
  applyCleanTableLayout(sheetWarga, widthsWarga, rowsWarga.length, [1, 2, 4, 5, 6, 8, 9, 11, 12, 14, 16, 17, 19, 21, 22, 23], [18]);

  // =========================================================================
  // 2. FORMAT TAB 2: PEMBAYARAN_IPL (12 Kolom Khusus Iuran IPL Bulanan)
  // =========================================================================
  var sheetIpl = ss.getSheetByName("PEMBAYARAN_IPL") || ss.insertSheet("PEMBAYARAN_IPL");
  sheetIpl.clear();

  var headersIpl = [
    [
      "No.", "No. Transaksi", "Nama Warga", "Lokasi Rumah", "Periode Tercover", 
      "Durasi Paket", "Nominal Bayar (Rp)", "Status", "Tanggal Pelunasan", 
      "Metode Pembayaran", "Bukti Bayar", "Keterangan", "Waktu Input"
    ]
  ];
  var widthsIpl = [55, 140, 215, 165, 155, 135, 160, 155, 150, 175, 230, 225, 185];
  sheetIpl.getRange(1, 1, 1, headersIpl[0].length)
    .setValues(headersIpl)
    .setFontWeight("bold")
    .setBackground("#065F46")
    .setFontColor("#FFFFFF")
    .setHorizontalAlignment("center");
  sheetIpl.setFrozenRows(1);

  var rowsIpl = [];
  if (iplRecords && iplRecords.length > 0) {
    rowsIpl = iplRecords.map(function(item, idx) {
      var trxId = item.id || item.noTransaksi || ("#IPL-" + ("000" + (idx + 1)).slice(-3));
      var buktiLink = processBuktiBayar(item.buktiBayar || item.buktiUrl, trxId);

      return [
        idx + 1,
        trxId,
        item.nama || item.namaWarga || "-",
        item.blokNomor || item.lokasiRumah || "-",
        item.periode || item.periodeTercover || "Oktober 2026",
        item.durasiLabel || item.durasiPaket || "1 Bulan",
        formatRp(item.nominal || item.nominalBayar || 30000),
        item.status || "Lunas",
        "'" + (item.tanggalBayar || item.tanggalPelunasan || "-"),
        item.metode || item.metodePembayaran || "Transfer Bank",
        buktiLink,
        item.keterangan || "Lunas",
        item.waktuInput || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB"
      ];
    });

    var bgColorsIpl = rowsIpl.map(function() {
      return headersIpl[0].map(function() { return "#DCFCE7"; }); // Hijau Mint Lembut untuk IPL
    });

    sheetIpl.getRange(2, 1, rowsIpl.length, headersIpl[0].length).setValues(rowsIpl);
    sheetIpl.getRange(2, 1, rowsIpl.length, headersIpl[0].length).setBackgrounds(bgColorsIpl);
  }
  applyCleanTableLayout(sheetIpl, widthsIpl, rowsIpl.length, [1, 2, 4, 5, 6, 8, 9, 10, 11, 13], [7]);

  // =========================================================================
  // 3. FORMAT TAB 3: PENGELUARAN_KAS (8 Kolom Kas Keluar Operasional)
  // =========================================================================
  var sheetExp = ss.getSheetByName("PENGELUARAN_KAS") || ss.insertSheet("PENGELUARAN_KAS");
  sheetExp.clear();

  var headersExp = [
    [
      "No.", "ID Pengeluaran", "Tanggal", "Kategori", "Keterangan / Rincian", 
      "Nominal Keluar (Rp)", "Penerima Dana", "Waktu Input"
    ]
  ];
  var widthsExp = [55, 145, 135, 155, 260, 165, 185, 185];

  sheetExp.getRange(1, 1, 1, headersExp[0].length)
    .setValues(headersExp)
    .setFontWeight("bold")
    .setBackground("#991B1B")
    .setFontColor("#FFFFFF")
    .setHorizontalAlignment("center");
  sheetExp.setFrozenRows(1);

  var rowsExp = [];
  if (expenses && expenses.length > 0) {
    rowsExp = expenses.map(function(item, idx) {
      return [
        idx + 1,
        item.id || ("#EXP-" + ("000" + (idx + 1)).slice(-3)),
        "'" + (item.tanggal || "-"),
        item.kategori || "Lainnya",
        item.keterangan || "-",
        formatRp(item.nominal || 0),
        item.penerima || "Petugas Lingkungan",
        "'" + (item.waktuInput || item.createdAt || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB")
      ];
    });

    sheetExp.getRange(2, 1, rowsExp.length, headersExp[0].length).setValues(rowsExp);
  }
  applyCleanTableLayout(sheetExp, widthsExp, rowsExp.length, [1, 2, 3, 4, 7, 8], [6]);

  // =========================================================================
  // 4. FORMAT TAB 4 KHUSUS: URUNAN_PJU (7 Kolom Rapi + Warna Donatur vs Wajib)
  // =========================================================================
  var sheetUrunan = ss.getSheetByName("URUNAN_PJU") || ss.insertSheet("URUNAN_PJU");
  sheetUrunan.clear();

  var headersUrunan = [
    [
      "No.", "ID Transaksi PJU", "Nama Warga / Donatur", "Kategori Setoran", "Nominal (Rp)", 
      "Metode Penyetoran", "Bukti Bayar", "Keterangan", "Tanggal Penyetoran", "Waktu Input"
    ]
  ];
  var widthsUrunan = [60, 140, 230, 210, 155, 165, 230, 220, 165, 185];
  sheetUrunan.getRange(1, 1, 1, headersUrunan[0].length)
    .setValues(headersUrunan)
    .setFontWeight("bold")
    .setBackground("#1D4ED8")
    .setFontColor("#FFFFFF")
    .setHorizontalAlignment("center");
  sheetUrunan.setFrozenRows(1);

  var rowsUrunan = [];
  if (urunan && urunan.length > 0) {
    rowsUrunan = urunan.map(function(item, idx) {
      var isDonatur = item.tipe === "DONATUR";
      var metodeLabel = (item.metode === "Cash" || String(item.metode || "").toLowerCase().indexOf("cash") !== -1)
        ? "Cash Tunai"
        : "Transfer (TF)";
      var idPjuItem = item.id || ("#PJU-" + ("000" + (idx + 1)).slice(-3));
      var buktiPju = processBuktiBayar(item.buktiBayar || item.buktiUrl, idPjuItem);
      return [
        idx + 1,
        idPjuItem,
        item.namaWarga || item.nama || "-",
        isDonatur ? "🟡 ★ Donatur Sukarela" : "🔵 Urunan Wajib KK",
        formatRp(item.nominal || 0),
        metodeLabel,
        buktiPju,
        item.keterangan && item.keterangan !== "-" ? item.keterangan : (isDonatur ? "Donatur Lampu PJU" : "Urunan Wajib PJU"),
        "'" + (item.tanggal || "06 Jun 2026"),
        item.waktuInput || Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB"
      ];
    });

    var bgColorsUrunan = urunan.map(function(item) {
      var rowBg = item.tipe === "DONATUR" ? "#FEF3C7" : "#DBEAFE"; // Kuning Emas (Donatur) vs Biru Muda (Urunan Wajib)
      return headersUrunan[0].map(function() { return rowBg; });
    });

    sheetUrunan.getRange(2, 1, rowsUrunan.length, headersUrunan[0].length).setValues(rowsUrunan);
    sheetUrunan.getRange(2, 1, rowsUrunan.length, headersUrunan[0].length).setBackgrounds(bgColorsUrunan);
  }
  applyCleanTableLayout(sheetUrunan, widthsUrunan, rowsUrunan.length, [1, 2, 4, 6, 7, 9, 10], [5]);

  // 5. HAPUS TAB BERMASALAH (RINGKASAN_DASHBOARD yang menyebabkan #ERROR!)
  var oldDash = ss.getSheetByName("RINGKASAN_DASHBOARD");
  if (oldDash) {
    try {
      ss.deleteSheet(oldDash);
    } catch (e) {}
  }
  // Posisikan DATA_WARGA sebagai tab pertama di paling kiri
  ss.setActiveSheet(sheetWarga);
  ss.moveActiveSheet(1);
}

function createJsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
