/**
 * Kriteria & Subkriteria Constants — Single Source of Truth
 *
 * Mengikuti PRD §6.1, SYSTEM_DESIGN §4, dan integrasi Desil DTKS Kemensos (Desil 1-10).
 * Subkriteria mengikuti kriteria:
 * - Kriteria adalah induk (Parent).
 * - Subkriteria dan bobotnya (Child) secara dinamis merefleksikan kriteria yang aktif.
 */

export const DEFAULT_CRITERIA = [
  { code: 'C1', name: 'Pendapatan per bulan', type: 'COST', weight: '0.25', unit: 'Rupiah' },
  { code: 'C2', name: 'Jumlah tanggungan', type: 'BENEFIT', weight: '0.20', unit: 'orang', scale: { min: 0 } },
  { code: 'C3', name: 'Kerentanan kondisi rumah', type: 'BENEFIT', weight: '0.15', unit: 'skor', scale: { min: 1, max: 5 } },
  { code: 'C4', name: 'Anggota keluarga rentan', type: 'BENEFIT', weight: '0.15', unit: 'skor', scale: { min: 0, max: 2 } },
  { code: 'C5', name: 'Skor kepemilikan aset produktif', type: 'COST', weight: '0.10', unit: 'skor', scale: { min: 1, max: 3 } },
  { code: 'C6', name: 'Tingkat Desil Kesejahteraan DTKS', type: 'COST', weight: '0.15', unit: 'Tingkat Desil (1-10)', scale: { min: 1, max: 10 } },
]

export const DEFAULT_SUBCRITERIA_RULES = {
  C1: [
    { category: 'Pendapatan ≤ Rp 1.000.000', rawScore: '1.000.000', priorityImpact: 'Tertinggi (Prioritas Utama)' },
    { category: 'Rp 1.000.001 – Rp 1.500.000', rawScore: '1.500.000', priorityImpact: 'Tinggi' },
    { category: 'Rp 1.500.001 – Rp 2.000.000', rawScore: '2.000.000', priorityImpact: 'Sedang' },
    { category: 'Pendapatan > Rp 2.000.000', rawScore: '2.500.000+', priorityImpact: 'Rendah (Cost: nilai besar memperkecil prioritas)' },
  ],
  C2: [
    { category: 'Tanggungan ≥ 5 orang', rawScore: '5', priorityImpact: 'Sangat Tinggi' },
    { category: 'Tanggungan 4 orang', rawScore: '4', priorityImpact: 'Tinggi' },
    { category: 'Tanggungan 3 orang', rawScore: '3', priorityImpact: 'Sedang' },
    { category: 'Tanggungan 1–2 orang', rawScore: '1–2', priorityImpact: 'Rendah' },
  ],
  C3: [
    { category: 'Rumah Tidak Layak Huni Parah (Dinding bambu/lantai tanah)', rawScore: '5', priorityImpact: 'Sangat Rentan (Skor 5)' },
    { category: 'Kondisi Rumah Rusak Sedang (Atap bocor/semi permanen)', rawScore: '4', priorityImpact: 'Rentan (Skor 4)' },
    { category: 'Kondisi Rusak Ringan', rawScore: '3', priorityImpact: 'Cukup Rentan (Skor 3)' },
    { category: 'Permanen Layak Huni', rawScore: '1–2', priorityImpact: 'Tidak Rentan (Skor 1–2)' },
  ],
  C4: [
    { category: 'Terdapat Lansia + Balita / Disabilitas Berat', rawScore: '2', priorityImpact: 'Kebutuhan Mendesak (Skor 2)' },
    { category: 'Terdapat salah satu (Lansia saja / Balita saja)', rawScore: '1', priorityImpact: 'Kebutuhan Sedang (Skor 1)' },
    { category: 'Tidak ada anggota keluarga rentan', rawScore: '0', priorityImpact: 'Tanpa Kategori Khusus (Skor 0)' },
  ],
  C5: [
    { category: 'Tidak memiliki aset produktif / tanah / kendaraan usaha', rawScore: '1', priorityImpact: 'Paling Prioritas (Cost: min / x)' },
    { category: 'Memiliki 1 unit alat kerja / motor tua operasional', rawScore: '2', priorityImpact: 'Prioritas Sedang (Skor 2)' },
    { category: 'Memiliki ≥ 2 unit aset produktif / kendaraan bermotor', rawScore: '3', priorityImpact: 'Prioritas Rendah (Skor 3)' },
  ],
  C6: [
    { category: 'Desil 1 — Rumah Tangga Sangat Miskin (10% Terbawah)', rawScore: '1', priorityImpact: 'Prioritas Paling Utama Bansos (Cost: skor min 1)' },
    { category: 'Desil 2 — Rumah Tangga Miskin (11% - 20%)', rawScore: '2', priorityImpact: 'Prioritas Tinggi Bansos (Skor 2)' },
    { category: 'Desil 3 — Rumah Tangga Hampir Miskin (21% - 30%)', rawScore: '3', priorityImpact: 'Prioritas Sedang (Skor 3)' },
    { category: 'Desil 4 — Rumah Tangga Rentan Miskin (31% - 40%)', rawScore: '4', priorityImpact: 'Prioritas Cadangan / PBI-JK (Skor 4)' },
    { category: 'Desil 5 — Rumah Tangga Menengah Bawah (41% - 50%)', rawScore: '5', priorityImpact: 'Non-Bansos Reguler (Skor 5)' },
    { category: 'Desil 6 — Rumah Tangga Menengah (51% - 60%)', rawScore: '6', priorityImpact: 'Non-Bansos (Skor 6)' },
    { category: 'Desil 7 — Rumah Tangga Menengah (61% - 70%)', rawScore: '7', priorityImpact: 'Non-Bansos (Skor 7)' },
    { category: 'Desil 8 — Rumah Tangga Menengah Atas (71% - 80%)', rawScore: '8', priorityImpact: 'Non-Bansos (Skor 8)' },
    { category: 'Desil 9 — Rumah Tangga Mampu (81% - 90%)', rawScore: '9', priorityImpact: 'Non-Bansos (Skor 9)' },
    { category: 'Desil 10 — Rumah Tangga Sangat Mampu (91% - 100% Teratas)', rawScore: '10', priorityImpact: 'Non-Bansos (Skor 10)' },
  ],
}

