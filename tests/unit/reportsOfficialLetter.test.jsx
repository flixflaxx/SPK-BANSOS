import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ReportsView } from '../../src/features/reports/ReportsView.jsx'
import { DEMO_PERIODS, DEMO_RESIDENTS, createDemoCalculationRun } from '../../src/services/mockData.js'

describe('ReportsView Official Kemensos Letter & Recipients Schedule', () => {
  const demoRun = createDemoCalculationRun()

  it('renders official Kemensos & Pemkab Bekasi letterhead structure', () => {
    const html = renderToString(
      <ReportsView
        calculationRun={demoRun}
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={[]}
        decisions={[]}
      />
    )

    // Kemensos and Regional Authority Letterhead
    expect(html).toContain('KEMENTERIAN SOSIAL REPUBLIK INDONESIA')
    expect(html).toContain('DIREKTORAT JENDERAL JAMINAN SOSIAL')
    expect(html).toContain('Pemerintah Kabupaten Bekasi')
    expect(html).toContain('Kecamatan Setu — Rukun Warga 03 Kampung Bulak Amah')

    // Letter metadata
    expect(html).toContain('400.9.1 / 088 / BA-SPK / X / 2026')
    expect(html).toContain('Pendistribusian Paket KKS BNI, Pembukaan Rekening Kolektif Program Keluarga Harapan dan Sembako Tahap I Tahun 2026')
    expect(html).toContain('Penting')
    expect(html).toContain('Kepala Dinas Sosial Kabupaten/Kota (Terlampir)')
  })

  it('renders clean burekol table and operational instructions matching Kemensos reference', () => {
    const html = renderToString(
      <ReportsView
        calculationRun={demoRun}
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={[]}
        decisions={[]}
      />
    )

    // Table Burekol headers and rows
    expect(html).toContain('BERHASIL BUREKOL')
    expect(html).toContain('Sembako')
    expect(html).toContain('PKH')
    expect(html).toContain('PBI-JK')
    expect(html).toContain('TOTAL')

    // Operational directives a, b, c from reference image
    expect(html).toContain('Berkoordinasi dengan ASN PPPK Direktorat PSNK dan BNI')
    expect(html).toContain('Memantau proses pendistribusian KKS dan buku tabungan')
    expect(html).toContain('memanfaatkan fasilitas yang tersedia di balai musyawarah warga')

    // BSrE BSSN electronic signature footnote
    expect(html).toContain('Dokumen ini telah ditandatangani secara elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN')
  })

  it('renders multi-stakeholder endorsements and attached schedule of recipient names', () => {
    const html = renderToString(
      <ReportsView
        calculationRun={demoRun}
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={[]}
        decisions={[]}
      />
    )

    // Authorized Stakeholders
    expect(html).toContain('Ketua RT 01 / RT 02')
    expect(html).toContain('KUSNADI SUDRAJAT')
    expect(html).toContain('Ketua RW 03 Bulak Amah')
    expect(html).toContain('H. AHMAD SUBARKAH')
    expect(html).toContain('Auditor Independen SPK')
    expect(html).toContain('RINA KUSUMA, S.Ak., CFrA')
    expect(html).toContain('Drs. H. MULYADI')

    // Schedule of recipient names
    expect(html).toContain('DAFTAR NAMA-NAMA PENERIMA BANTUAN SOSIAL (KPM) HASIL PERANGKINGAN SAW')
    expect(html).toContain('BERITA ACARA PENETAPAN HASIL SELEKSI BANTUAN SOSIAL')
    expect(html).toContain('Nama Kepala Keluarga / Warga')
    expect(html).toContain('NIK (Masked)')
    expect(html).toContain('Nilai SAW (V)')
    expect(html).toContain('Peringkat')
    expect(html).toContain('Alokasi Program')

    // Check recipients present from demoRun results
    expect(html).toContain('DALAM KUOTA')
  })
})
