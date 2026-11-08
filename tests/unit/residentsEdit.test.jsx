import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ResidentsView } from '../../src/features/residents/ResidentsView.jsx'
import { DEMO_RESIDENTS } from '../../src/services/mockData.js'

describe('ResidentsView Edit Profile Pop-up Modal Tests', () => {
  it('renders data warga table with Lihat Profil action buttons', () => {
    const html = renderToString(
      <ResidentsView
        residents={DEMO_RESIDENTS}
        onAddResident={() => {}}
        onUpdateResident={() => {}}
      />
    )

    expect(html).toContain('Daftar Warga Terdaftar')
    expect(html).toContain('Lihat Profil')
    expect(html).toContain('Desil DTKS')
    expect(html).toContain(DEMO_RESIDENTS[0].name)
    expect(html).toContain(DEMO_RESIDENTS[0].nikMasked)
  })

  it('renders add resident modal button and search box', () => {
    const html = renderToString(
      <ResidentsView
        residents={DEMO_RESIDENTS}
        onAddResident={() => {}}
        onUpdateResident={() => {}}
      />
    )

    expect(html).toContain('Tambah Data Warga')
    expect(html).toContain('Cari nama atau RT/RW...')
  })

  it('renders resident action with Lihat Profil button and edit trigger', () => {
    const html = renderToString(
      <ResidentsView
        residents={DEMO_RESIDENTS}
        onAddResident={() => {}}
        onUpdateResident={() => {}}
      />
    )

    expect(html).toContain('Lihat Profil')
    expect(html).toContain('title="Lihat Profil &amp; Edit')
  })

  it('supports full decile classification (Desil 1 through Desil 10) for all residents', () => {
    const html = renderToString(
      <ResidentsView
        residents={DEMO_RESIDENTS}
        onAddResident={() => {}}
        onUpdateResident={() => {}}
      />
    )

    // Verify option range 1 to 10 in resident registration modal
    expect(html).toContain('Desil 1 — Rumah Tangga Sangat Miskin')
    expect(html).toContain('Desil 5 — Rumah Tangga Menengah Bawah')
    expect(html).toContain('Desil 10 — Rumah Tangga Sangat Mampu')
  })

  it('verifies fintech alert popup dialog CSS contains viewport fixed centering rules', () => {
    const fs = require('fs')
    const path = require('path')
    const cssPath = path.resolve(__dirname, '../../src/styles/fintech-dashboard.css')
    const cssContent = fs.readFileSync(cssPath, 'utf8')

    expect(cssContent).toContain('.fintech-alert-overlay {')
    expect(cssContent).toContain('position: fixed !important;')
    expect(cssContent).toContain('z-index: 999999 !important;')
    expect(cssContent).toContain('justify-content: center !important;')
    expect(cssContent).toContain('align-items: center !important;')
    expect(cssContent).toContain('.fintech-alert-popup {')
    expect(cssContent).toContain('max-height: min(90vh, 90dvh);')
  })
})

