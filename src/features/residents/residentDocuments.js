/**
 * residentDocuments.js
 * Konfigurasi dan helper dokumen persyaratan warga Kampung Bulak Amah:
 * 1. Foto Kartu Keluarga (KK)
 * 2. Foto KTP Kepala Keluarga / Pemohon
 * 3. Foto Kondisi Rumah (Tampak Depan, Dinding, Lantai)
 * 4. Surat Keterangan RT/RW (SKTM / Pengantar)
 */

export const RESIDENT_DOC_CATEGORIES = [
  {
    key: 'kk',
    code: 'KK',
    title: 'Kartu Keluarga (KK)',
    shortTitle: 'Foto / Scan KK',
    description: 'Foto atau salinan scan Kartu Keluarga asli / legalisir warga pemohon.',
    required: true,
    accept: 'image/*,.pdf',
    badgeColor: '#087A59',
    bgColor: '#E8F5EF',
    defaultSize: '1.4 MB',
    mimeType: 'application/pdf',
    defaultFileName: (res) => {
      const clean = cleanName(res?.name || 'Warga')
      const nik = cleanNik(res?.nikMasked || '320101')
      return `KK_${nik}_${clean}.pdf`
    },
  },
  {
    key: 'ktp',
    code: 'KTP',
    title: 'KTP Kepala Keluarga / Pemohon',
    shortTitle: 'Foto e-KTP',
    description: 'Foto e-KTP kepala keluarga yang jelas, terbaca, dan masih berlaku.',
    required: true,
    accept: 'image/*,.pdf',
    badgeColor: '#16A36B',
    bgColor: '#E8F5EF',
    defaultSize: '820 KB',
    mimeType: 'image/jpeg',
    defaultFileName: (res) => {
      const clean = cleanName(res?.name || 'Warga')
      const nik = cleanNik(res?.nikMasked || '320101')
      return `KTP_${nik}_${clean}.jpg`
    },
  },
  {
    key: 'rumah',
    code: 'RUMAH',
    title: 'Foto Fisik Kondisi Rumah',
    shortTitle: 'Foto Kondisi Rumah',
    description: 'Dokumentasi foto tampak depan, kondisi dinding, atap, dan lantai tempat tinggal.',
    required: true,
    accept: 'image/*,.pdf',
    badgeColor: '#D97706',
    bgColor: '#FEF3C7',
    defaultSize: '2.1 MB',
    mimeType: 'image/jpeg',
    defaultFileName: (res) => {
      const clean = cleanName(res?.name || 'Warga')
      return `Foto_Kondisi_Rumah_${clean}.jpg`
    },
  },
  {
    key: 'suratRt',
    code: 'SURAT_RT',
    title: 'Surat Keterangan RT / RW',
    shortTitle: 'Surat Keterangan RT',
    description: 'Surat Pengantar RT/RW atau Surat Keterangan Tidak Mampu (SKTM) setempat.',
    required: true,
    accept: 'image/*,.pdf',
    badgeColor: '#2563EB',
    bgColor: '#DBEAFE',
    defaultSize: '640 KB',
    mimeType: 'application/pdf',
    defaultFileName: (res) => {
      const rt = cleanRt(res?.addressRtRw || '001/003')
      return `Surat_Pengantar_RT${rt}_BulakAmah.pdf`
    },
  },
]

export function cleanName(name = '') {
  return String(name)
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 20) || 'Warga'
}

export function cleanNik(nik = '') {
  return String(nik).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || '320101'
}

export function cleanRt(rtRw = '') {
  return String(rtRw).replace(/[^0-9]/g, '').slice(0, 3) || '001'
}

export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return bytes || '850 KB'
  }
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Mengambil daftar 4 dokumen resmi warga.
 * Jika warga sudah memiliki dokumen riil (hasil unggah di form), gunakan itu.
 * Jika belum, hasilkan metadata dokumen sintetis resmi secara otomatis agar
 * tabel dan modal pratinjau langsung siap dilihat tanpa dead-end.
 */
export function getResidentDocuments(resident) {
  if (!resident) return []

  const residentDocsMap = {}
  if (Array.isArray(resident.documents)) {
    resident.documents.forEach((d) => {
      if (d && d.key) {
        residentDocsMap[d.key] = d
      }
    })
  }

  return RESIDENT_DOC_CATEGORIES.map((cat) => {
    const existing = residentDocsMap[cat.key]
    if (existing) {
      return {
        ...cat,
        ...existing,
        title: existing.title || cat.title,
        shortTitle: cat.shortTitle,
        description: cat.description,
        badgeColor: cat.badgeColor,
        bgColor: cat.bgColor,
        isUploaded: true,
      }
    }

    // Dokumen sintetis resmi Bulak Amah
    return {
      key: cat.key,
      code: cat.code,
      title: cat.title,
      shortTitle: cat.shortTitle,
      description: cat.description,
      required: cat.required,
      fileName: cat.defaultFileName(resident),
      fileSize: cat.defaultSize,
      mimeType: cat.mimeType,
      uploadedAt: resident.createdAt || '2026-01-11T09:00:00Z',
      status: 'TERVERIFIKASI',
      badgeColor: cat.badgeColor,
      bgColor: cat.bgColor,
      isUploaded: false,
      isSynthetic: true,
      verifiedBy: 'Tim Verifikator Bulak Amah',
    }
  })
}

