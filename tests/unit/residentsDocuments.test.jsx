import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ResidentsView } from '../../src/features/residents/ResidentsView.jsx'
import { ResidentDocumentViewerModal } from '../../src/features/residents/ResidentDocumentViewerModal.jsx'
import {
  RESIDENT_DOC_CATEGORIES,
  getResidentDocuments,
  cleanName,
  cleanNik,
  cleanRt,
  formatFileSize,
} from '../../src/features/residents/residentDocuments.js'
import { DEMO_RESIDENTS } from '../../src/services/mockData.js'

describe('Resident Document Upload & Viewer Modal Tests', () => {
  it('RESIDENT_DOC_CATEGORIES defines 4 official categories: KK, KTP, RUMAH, and SURAT_RT', () => {
    expect(RESIDENT_DOC_CATEGORIES).toHaveLength(4)
    const keys = RESIDENT_DOC_CATEGORIES.map((c) => c.key)
    expect(keys).toEqual(['kk', 'ktp', 'rumah', 'suratRt'])

    const codes = RESIDENT_DOC_CATEGORIES.map((c) => c.code)
    expect(codes).toEqual(['KK', 'KTP', 'RUMAH', 'SURAT_RT'])
  })

  it('cleanName, cleanNik, cleanRt, and formatFileSize utility functions work correctly', () => {
    expect(cleanName('Kuswanto (Keluarga Prasejahtera)')).toBe('Kuswanto')
    expect(cleanNik('320101******0001')).toBe('3201010001')
    expect(cleanRt('002/003')).toBe('002')
    expect(formatFileSize(1024 * 500)).toBe('500.0 KB')
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
  })

  it('getResidentDocuments synthesizes 4 complete official documents for any resident', () => {
    const resident = DEMO_RESIDENTS[0]
    const docs = getResidentDocuments(resident)

    expect(docs).toHaveLength(4)
    expect(docs[0].key).toBe('kk')
    expect(docs[0].title).toBe('Kartu Keluarga (KK)')
    expect(docs[0].fileName).toContain('KK_')
    expect(docs[0].status).toBe('TERVERIFIKASI')

    expect(docs[1].key).toBe('ktp')
    expect(docs[1].title).toBe('KTP Kepala Keluarga / Pemohon')
    expect(docs[1].fileName).toContain('KTP_')

    expect(docs[2].key).toBe('rumah')
    expect(docs[2].title).toBe('Foto Fisik Kondisi Rumah')

    expect(docs[3].key).toBe('suratRt')
    expect(docs[3].title).toBe('Surat Keterangan RT / RW')
  })

  it('renders "Tambah Data Warga Baru" modal with 4 document upload categories', () => {
    const html = renderToString(
      <ResidentsView
        residents={DEMO_RESIDENTS}
        onAddResident={() => {}}
        onUpdateResident={() => {}}
        initialModalOpen={true}
      />
    )

    // Form inputs and labels for the 4 document upload categories
    expect(html).toContain('Unggah Bukti Berkas Warga (4 Kategori)')
    expect(html).toContain('Foto / Scan KK')
    expect(html).toContain('Foto e-KTP')
    expect(html).toContain('Foto Kondisi Rumah')
    expect(html).toContain('Surat Keterangan RT')
  })

  it('renders clickable "Bukti Berkas" button for residents in table', () => {
    const html = renderToString(
      <ResidentsView
        residents={DEMO_RESIDENTS}
        onAddResident={() => {}}
        onUpdateResident={() => {}}
      />
    )

    // Clickable button with resident-docs-btn class and Lihat action pill
    expect(html).toContain('resident-docs-btn')
    expect(html).toContain('Dokumen')
    expect(html).toContain('Lihat')
    expect(html).toContain('Klik untuk melihat dokumen dan berkas kependudukan milik')
  })

  it('renders ResidentDocumentViewerModal with complete resident info and 4 document previews', () => {
    const resident = DEMO_RESIDENTS[0]
    const html = renderToString(
      <ResidentDocumentViewerModal
        isOpen={true}
        onClose={() => {}}
        resident={resident}
      />
    )

    // Modal title & resident strip
    expect(html).toContain('Bukti Berkas &amp; Dokumen Warga')
    expect(html).toContain(resident.name)
    expect(html).toContain(resident.nikMasked)
    expect(html).toContain('4 / 4 Berkas Siap')

    // Document cards and preview contents
    expect(html).toContain('Kartu Keluarga (KK)')
    expect(html).toContain('KTP Kepala Keluarga / Pemohon')
    expect(html).toContain('Foto Fisik Kondisi Rumah')
    expect(html).toContain('Surat Keterangan RT / RW')

    // Visual layout elements
    expect(html).toContain('REPUBLIK INDONESIA')
    expect(html).toContain('KARTU TANDA PENDUDUK')
    expect(html).toContain('SURAT KETERANGAN TIDAK MAMPU')
    expect(html).toContain('Lihat Penuh')
    expect(html).toContain('Tutup Berkas')
  })
})
