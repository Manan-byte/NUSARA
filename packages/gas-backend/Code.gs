/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SISTEM PENDATAAN WARGA & MONITORING KAS IPL
 * KOMPLEK: PESONA KAHURIPAN 8 TAHAP 2 (RT 08 / RW 08)
 * =========================================================================
 */

var SPREADSHEET_ID = "1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0";

function nowWib() {
  return Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy, HH:mm:ss") + " WIB";
}

function dateWib() {
  return Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy");
}

function formatRp(num) {
  var n = Math.round(Number(num) || 0);
  return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Handle POST Request dari Web Application
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Data POST kosong" });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'syncAll';
    var ss = getSpreadsheet();
    var ts = nowWib();

    // 0. Aksi ping / testConnection
    if (action === 'ping' || action === 'testConnection') {
      var sheetNames = [];
      try { sheetNames = ss.getSheets().map(function(s) { return s.getName(); }); } catch (err) {}
      return createJsonResponse({
        success: true,
        status: 'online',
        message: 'Koneksi ke Google Apps Script dan Spreadsheet terverifikasi 100%!',
        spreadsheetId: ss.getId ? ss.getId() : SPREADSHEET_ID,
        spreadsheetName: ss.getName ? ss.getName() : 'Google Spreadsheet',
        tabsAktif: sheetNames,
        timestamp: new Date().toISOString()
      });
    }

    // 1. Aksi syncAll (Sinkronisasi penuh 4 tab)
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

    // 2. Aksi daftarWarga (Tambah ke DATA_WARGA + tagihan IPL & PJU otomatis)
    if (action === 'daftarWarga' || action === 'addResident') {
      var sheetWarga = ss.getSheetByName("DATA_WARGA") || ss.insertSheet("DATA_WARGA");
      var nextNo = Math.max(1, sheetWarga.getLastRow());
      var r = payload.data || payload;
      var idWarga = r.id || ("#WRG-" + ("000" + nextNo).slice(-3));
      var rawWaDigits = String(r.noWhatsapp || r.telepon || "").replace(/\D/g, "");
      var last4Wa = rawWaDigits.length >= 4 ? ("'" + rawWaDigits.slice(-4)) : "-";
      var rawCatatan = r.catatan || "-";
      var pinVal = r.pin || "-";
      var catatanWithPw = rawCatatan.indexOf("Password:") !== -1 ? rawCatatan : rawCatatan + " • Password: " + pinVal;
      var namaWarga = r.namaLengkap || r.nama || "-";
      var lokasiRumah = r.alamatRumah || r.blokNomor || ("Blok " + (r.blok || "E") + " No. " + (r.noRumah || r.nomor || 1));
      var nominalIpl = r.nominalIpl || 30000;
      var periodeIpl = r.periodeTercover || r.periodeIpl || "Oktober 2026";
      var statusIpl = r.statusIpl || "Belum Bayar";

      // 1. Tambah baris DATA_WARGA
      sheetWarga.appendRow([
        nextNo,
        idWarga,
        namaWarga,
        r.jenisKelamin || "Laki-laki",
        r.blok || "E",
        Number(r.noRumah || r.nomor) || 1,
        lokasiRumah,
        "'" + (r.noWhatsapp || r.telepon || "-"),
        r.statusTempatTinggal || r.statusMenetap || "Menetap",
        r.pekerjaan || "-",
        r.agama || "Islam",
        r.statusPernikahan || "Menikah",
        r.statusDalamKeluarga || "Kepala Keluarga",
        Number(r.jmlJiwa || r.jumlahAnggota) || 1,
        r.anggotaKeluargaTambahan || r.anggotaKeluarga || "-",
        statusIpl,
        periodeIpl,
        formatRp(nominalIpl),
        r.tanggalUpdate || dateWib(),
        catatanWithPw,
        pinVal,
        last4Wa,
        r.waktuInput || ts
      ]);

      // 2. Tambah tagihan otomatis ke PEMBAYARAN_IPL
      try {
        var sheetIpl = ss.getSheetByName("PEMBAYARAN_IPL") || ss.insertSheet("PEMBAYARAN_IPL");
        var nextTrxNo = Math.max(1, sheetIpl.getLastRow());
        sheetIpl.appendRow([
          nextTrxNo,
          "#IPL-" + ("000" + nextTrxNo).slice(-3),
          namaWarga,
          lokasiRumah,
          periodeIpl,
          "1 Bulan",
          formatRp(nominalIpl),
          statusIpl,
          "-",
          "Menunggu Pembayaran",
          "-",
          "Tagihan IPL Terdaftar Otomatis (" + idWarga + ")",
          ts
        ]);
      } catch (e1) {}

      // 3. Tambah tagihan otomatis ke URUNAN_PJU
      try {
        var sheetUrunan = ss.getSheetByName("URUNAN_PJU") || ss.insertSheet("URUNAN_PJU");
        var nextPjuNo = Math.max(1, sheetUrunan.getLastRow());
        sheetUrunan.appendRow([
          nextPjuNo,
          "#PJU-" + ("000" + nextPjuNo).slice(-3),
          namaWarga,
          "URUNAN_WAJIB",
          formatRp(115000),
          "Menunggu Penyetoran",
          "-",
          "Tagihan Wajib PJU Terdaftar Otomatis (" + lokasiRumah + ")",
          ts
        ]);
      } catch (e2) {}

      return createJsonResponse({
        success: true,
        message: "Data warga berhasil dicatat lengkap ke DATA_WARGA, PEMBAYARAN_IPL, dan URUNAN_PJU!"
      });
    }

    // 3. Aksi uploadBuktiIpl / bayarIPL
    if (action === 'uploadBuktiIpl' || action === 'bayarIPL') {
      var sheetIpl = ss.getSheetByName("PEMBAYARAN_IPL") || ss.insertSheet("PEMBAYARAN_IPL");
      var nextTrxNo = Math.max(1, sheetIpl.getLastRow());
      var trx = payload.data || payload;
      var trxId = trx.noTransaksi || ("#TRX-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmm"));
      var buktiLink = processBuktiBayar(trx.buktiBayar || trx.buktiUrl, trxId);

      sheetIpl.appendRow([
        nextTrxNo,
        trxId,
        trx.namaWarga || trx.nama || "-",
        trx.lokasiRumah || trx.blokNomor || "-",
        trx.periodeTercover || "Oktober 2026",
        trx.durasiPaket || "1 Bulan",
        formatRp(trx.nominalBayar || trx.nominal || 30000),
        trx.status || "Menunggu Verifikasi",
        trx.tanggalPelunasan || dateWib(),
        trx.metodePembayaran || trx.metode || "Transfer Bank",
        buktiLink,
        trx.keterangan || "Menunggu konfirmasi bendahara & Ketua RT",
        trx.waktuInput || ts
      ]);

      return createJsonResponse({
        success: true,
        message: "Data pembayaran IPL & gambar bukti berhasil dicatat!",
        buktiDriveUrl: buktiLink
      });
    }

    // 4. Aksi catatPengeluaran
    if (action === 'catatPengeluaran' || action === 'addExpense') {
      var sheetExp = ss.getSheetByName("PENGELUARAN_KAS") || ss.insertSheet("PENGELUARAN_KAS");
      var nextExpNo = Math.max(1, sheetExp.getLastRow());
      var exp = payload.data || payload;

      sheetExp.appendRow([
        nextExpNo,
        exp.id || ("#EXP-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmm")),
        exp.tanggal || dateWib(),
        exp.kategori || "Lainnya",
        exp.keterangan || "-",
        formatRp(exp.nominal || 0),
        exp.penerima || "Petugas Lingkungan",
        exp.waktuInput || exp.createdAt || ts
      ]);

      return createJsonResponse({
        success: true,
        message: "Data pengeluaran kas berhasil dicatat di tab PENGELUARAN_KAS!"
      });
    }

    // 5. Aksi bayarUrunanPju / addUrunan
    if (action === 'bayarUrunanPju' || action === 'addUrunan') {
      var sheetUrunan = ss.getSheetByName("URUNAN_PJU") || ss.insertSheet("URUNAN_PJU");
      var nextUrunanNo = Math.max(1, sheetUrunan.getLastRow());
      var u = payload.data || payload;
      var isDonatur = u.tipe === "DONATUR" || String(u.kategori || "").toLowerCase().indexOf("donatur") !== -1;
      var idPju = u.id || ("#PJU-" + ("000" + nextUrunanNo).slice(-3));
      var buktiPju = processBuktiBayar(u.buktiBayar || u.buktiUrl, idPju);

      sheetUrunan.appendRow([
        nextUrunanNo,
        idPju,
        u.namaWarga || u.nama || "Donatur PK8",
        isDonatur ? "🟡 ★ Donatur Sukarela" : "🔵 Urunan Wajib KK",
        formatRp(u.nominal || 115000),
        u.metode || "Transfer (TF)",
        buktiPju,
        u.keterangan || (isDonatur ? "Donatur PJU" : "Urunan Wajib PJU"),
        u.tanggal || dateWib(),
        u.waktuInput || ts
      ]);

      sheetUrunan.getRange(nextUrunanNo + 1, 1, 1, 10).setBackground(isDonatur ? "#FEF3C7" : "#DBEAFE");
      return createJsonResponse({
        success: true,
        message: "Data setoran Urunan PJU berhasil dicatat di tab khusus URUNAN_PJU!"
      });
    }

    // 6. Aksi deleteWarga
    if (action === 'deleteWarga') {
      deleteRowById(ss.getSheetByName("DATA_WARGA"), 1, String(payload.id || "").trim());
      return createJsonResponse({ success: true, message: "Warga berhasil dihapus!" });
    }

    // 7. Aksi deleteUrunan
    if (action === 'deleteUrunan') {
      deleteRowById(ss.getSheetByName("URUNAN_PJU"), 1, String(payload.id || "").trim());
      return createJsonResponse({ success: true, message: "Data PJU berhasil dihapus!" });
    }

    return createJsonResponse({ success: false, error: "Action tidak dikenali: " + action });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
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

  var sheetMap = {
    getWarga: "DATA_WARGA",
    getIpl: "PEMBAYARAN_IPL",
    getPengeluaran: "PENGELUARAN_KAS",
    getUrunan: "URUNAN_PJU"
  };

  if (sheetMap[action]) {
    var s = ss.getSheetByName(sheetMap[action]);
    var res = { success: true };
    res[action.replace('get', '').toLowerCase()] = s ? s.getDataRange().getValues() : [];
    return createJsonResponse(res);
  }

  var sheetNames = [];
  try { sheetNames = ss.getSheets().map(function(s) { return s.getName(); }); } catch (err) {}
  return createJsonResponse({
    status: 'online',
    success: true,
    komplek: 'Pesona Kahuripan 8 Tahap 2',
    spreadsheetId: ss.getId ? ss.getId() : SPREADSHEET_ID,
    spreadsheetName: ss.getName ? ss.getName() : 'Google Spreadsheet',
    tabsAktif: sheetNames.length > 0 ? sheetNames : ['DATA_WARGA', 'PEMBAYARAN_IPL', 'PENGELUARAN_KAS', 'URUNAN_PJU'],
    timestamp: new Date().toISOString()
  });
}

function deleteRowById(sheet, colIdx, targetId) {
  if (!sheet || !targetId) return;
  var vals = sheet.getDataRange().getValues();
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][colIdx]).trim() === targetId) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function processBuktiBayar(bukti, trxId) {
  if (!bukti || bukti === '-' || bukti === 'Terlampir') return '-';
  var strBukti = String(bukti).trim();
  if (strBukti.indexOf('http') === 0) return strBukti;
  
  if (strBukti.indexOf('data:image') === 0 || strBukti.indexOf('data:application/pdf') === 0) {
    try {
      var folderName = "BUKTI_TRANSFER_IPL_PK8";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      var commaIdx = strBukti.indexOf(',');
      var isPdf = strBukti.substring(0, commaIdx).indexOf("application/pdf") !== -1;
      var mimeType = isPdf ? "application/pdf" : (strBukti.indexOf("image/png") !== -1 ? "image/png" : "image/jpeg");
      var ext = isPdf ? ".pdf" : (mimeType === "image/png" ? ".png" : ".jpg");
      var blob = Utilities.newBlob(Utilities.base64Decode(strBukti.substring(commaIdx + 1)), mimeType, (trxId || "struk") + ext);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return "https://drive.google.com/file/d/" + file.getId() + "/view?usp=sharing";
    } catch (err) {
      return "Terlampir di Web (Base64)";
    }
  }
  return strBukti;
}

function applyCleanTableLayout(sheet, colWidths, numRows, centerCols, rightCols) {
  var numCols = colWidths.length;
  for (var c = 0; c < numCols; c++) {
    sheet.setColumnWidth(c + 1, colWidths[c]);
  }
  sheet.setRowHeight(1, 38);
  sheet.getRange(1, 1, 1, numCols)
    .setVerticalAlignment("middle")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  if (numRows > 0) {
    sheet.setRowHeights(2, numRows, 28);
    var dataRange = sheet.getRange(2, 1, numRows, numCols);
    dataRange.setVerticalAlignment("middle").setFontFamily("Arial").setFontSize(10).setHorizontalAlignment("left");
    (centerCols || []).forEach(function(col) {
      try { sheet.getRange(2, col, numRows, 1).setHorizontalAlignment("center"); } catch (e) {}
    });
    (rightCols || []).forEach(function(col) {
      try { sheet.getRange(2, col, numRows, 1).setHorizontalAlignment("right").setFontWeight("bold"); } catch (e) {}
    });
    try {
      sheet.getRange(1, 1, numRows + 1, numCols).setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
    } catch (e) {}
  } else {
    try {
      sheet.getRange(1, 1, 1, numCols).setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
    } catch (e) {}
  }
}

function initTab(ss, name, headers, widths, headerBg) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers[0].length)
    .setValues(headers)
    .setFontWeight("bold")
    .setBackground(headerBg)
    .setFontColor("#FFFFFF")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * SINKRONISASI BERSIH: 4 TAB RESMI
 */
function syncCleanData(ss, residents, iplRecords, expenses, urunan) {
  var ts = nowWib();

  // 1. DATA_WARGA
  var headersWarga = [[
    "No.", "ID Warga", "Nama Lengkap", "Jenis Kelamin", "Blok", "No. Rumah", "Alamat Rumah", 
    "No. WhatsApp", "Status Tempat Tinggal", "Pekerjaan", "Agama", "Status Pernikahan", 
    "Status Dalam Keluarga", "Jml Jiwa", "Anggota Keluarga Tambahan", "Status IPL", 
    "Periode Tercover", "Nominal IPL (Rp)", "Tanggal Update", "Catatan", "Password / PIN", "4 Digit Terakhir WA", "Waktu Input"
  ]];
  var widthsWarga = [55, 120, 215, 125, 75, 95, 165, 145, 165, 155, 95, 140, 165, 90, 220, 135, 145, 150, 135, 230, 160, 150, 185];
  var sWarga = initTab(ss, "DATA_WARGA", headersWarga, widthsWarga, "#065F46");
  var rowsW = (residents || []).map(function(r, idx) {
    var anggota = Array.isArray(r.anggotaKeluarga)
      ? r.anggotaKeluarga.map(function(a) { return (a.nama || '-') + " (" + (a.hubungan || '-') + ")"; }).join(", ")
      : (r.anggotaKeluarga || "-");
    var waClean = String(r.telepon || r.noWhatsapp || "").replace(/\D/g, "");
    return [
      idx + 1,
      r.id || ("#WRG-" + ("000" + (idx + 1)).slice(-3)),
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
      anggota,
      r.statusIpl || "Belum Bayar",
      r.periodeIpl || r.periodeTercover || "Oktober 2026",
      formatRp(r.nominalIpl || 30000),
      "'" + (r.tanggalBayarIpl || r.tanggalUpdate || r.updatedAt || dateWib()),
      r.catatan || "-",
      r.pin || "-",
      waClean.length >= 4 ? ("'" + waClean.slice(-4)) : "-",
      r.waktuInput || ts
    ];
  });
  if (rowsW.length > 0) sWarga.getRange(2, 1, rowsW.length, headersWarga[0].length).setValues(rowsW);
  applyCleanTableLayout(sWarga, widthsWarga, rowsW.length, [1, 2, 4, 5, 6, 8, 9, 11, 12, 14, 16, 17, 19, 21, 22, 23], [18]);

  // 2. PEMBAYARAN_IPL
  var headersIpl = [[
    "No.", "No. Transaksi", "Nama Warga", "Lokasi Rumah", "Periode Tercover", 
    "Durasi Paket", "Nominal Bayar (Rp)", "Status", "Tanggal Pelunasan", 
    "Metode Pembayaran", "Bukti Bayar", "Keterangan", "Waktu Input"
  ]];
  var widthsIpl = [55, 140, 215, 165, 155, 135, 160, 155, 150, 175, 230, 225, 185];
  var sIpl = initTab(ss, "PEMBAYARAN_IPL", headersIpl, widthsIpl, "#065F46");
  var rowsI = (iplRecords || []).map(function(item, idx) {
    var trxId = item.id || item.noTransaksi || ("#IPL-" + ("000" + (idx + 1)).slice(-3));
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
      processBuktiBayar(item.buktiBayar || item.buktiUrl, trxId),
      item.keterangan || "Lunas",
      item.waktuInput || ts
    ];
  });
  if (rowsI.length > 0) {
    sIpl.getRange(2, 1, rowsI.length, headersIpl[0].length).setValues(rowsI);
    sIpl.getRange(2, 1, rowsI.length, headersIpl[0].length).setBackgrounds(rowsI.map(function() { return headersIpl[0].map(function() { return "#DCFCE7"; }); }));
  }
  applyCleanTableLayout(sIpl, widthsIpl, rowsI.length, [1, 2, 4, 5, 6, 8, 9, 10, 11, 13], [7]);

  // 3. PENGELUARAN_KAS
  var headersExp = [[
    "No.", "ID Pengeluaran", "Tanggal", "Kategori", "Keterangan / Rincian", 
    "Nominal Keluar (Rp)", "Penerima Dana", "Waktu Input"
  ]];
  var widthsExp = [55, 145, 135, 155, 260, 165, 185, 185];
  var sExp = initTab(ss, "PENGELUARAN_KAS", headersExp, widthsExp, "#991B1B");
  var rowsE = (expenses || []).map(function(item, idx) {
    return [
      idx + 1,
      item.id || ("#EXP-" + ("000" + (idx + 1)).slice(-3)),
      "'" + (item.tanggal || "-"),
      item.kategori || "Lainnya",
      item.keterangan || "-",
      formatRp(item.nominal || 0),
      item.penerima || "Petugas Lingkungan",
      "'" + (item.waktuInput || item.createdAt || ts)
    ];
  });
  if (rowsE.length > 0) sExp.getRange(2, 1, rowsE.length, headersExp[0].length).setValues(rowsE);
  applyCleanTableLayout(sExp, widthsExp, rowsE.length, [1, 2, 3, 4, 7, 8], [6]);

  // 4. URUNAN_PJU
  var headersUrunan = [[
    "No.", "ID Transaksi PJU", "Nama Warga / Donatur", "Kategori Setoran", "Nominal (Rp)", 
    "Metode Penyetoran", "Bukti Bayar", "Keterangan", "Tanggal Penyetoran", "Waktu Input"
  ]];
  var widthsUrunan = [60, 140, 230, 210, 155, 165, 230, 220, 165, 185];
  var sUrunan = initTab(ss, "URUNAN_PJU", headersUrunan, widthsUrunan, "#1D4ED8");
  var rowsU = (urunan || []).map(function(item, idx) {
    var isDonatur = item.tipe === "DONATUR";
    var idPju = item.id || ("#PJU-" + ("000" + (idx + 1)).slice(-3));
    return [
      idx + 1,
      idPju,
      item.namaWarga || item.nama || "-",
      isDonatur ? "🟡 ★ Donatur Sukarela" : "🔵 Urunan Wajib KK",
      formatRp(item.nominal || 0),
      (item.metode === "Cash" || String(item.metode || "").toLowerCase().indexOf("cash") !== -1) ? "Cash Tunai" : "Transfer (TF)",
      processBuktiBayar(item.buktiBayar || item.buktiUrl, idPju),
      item.keterangan && item.keterangan !== "-" ? item.keterangan : (isDonatur ? "Donatur Lampu PJU" : "Urunan Wajib PJU"),
      "'" + (item.tanggal || dateWib()),
      item.waktuInput || ts
    ];
  });
  if (rowsU.length > 0) {
    sUrunan.getRange(2, 1, rowsU.length, headersUrunan[0].length).setValues(rowsU);
    sUrunan.getRange(2, 1, rowsU.length, headersUrunan[0].length).setBackgrounds((urunan || []).map(function(item) {
      var bg = item.tipe === "DONATUR" ? "#FEF3C7" : "#DBEAFE";
      return headersUrunan[0].map(function() { return bg; });
    }));
  }
  applyCleanTableLayout(sUrunan, widthsUrunan, rowsU.length, [1, 2, 4, 6, 7, 9, 10], [5]);

  // Hapus tab lama & posisikan DATA_WARGA pertama
  var oldDash = ss.getSheetByName("RINGKASAN_DASHBOARD");
  if (oldDash) try { ss.deleteSheet(oldDash); } catch (e) {}
  ss.setActiveSheet(sWarga);
  ss.moveActiveSheet(1);
}
