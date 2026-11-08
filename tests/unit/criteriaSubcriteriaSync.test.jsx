import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { CriteriaView } from '../../src/features/criteria/CriteriaView.jsx'
import { SubcriteriaView } from '../../src/features/criteria/SubcriteriaView.jsx'
import { DEFAULT_CRITERIA, DEFAULT_SUBCRITERIA_RULES } from '../../src/features/criteria/criteriaConstants.js'

describe('Criteria & Subcriteria Dynamic Synchronization', () => {
  it('renders CriteriaView with Edit button and default criteria list', () => {
    const html = renderToString(<CriteriaView criteria={DEFAULT_CRITERIA} />)
    expect(html).toContain('C1')
    expect(html).toContain('C6')
    expect(html).toContain('Edit')
    expect(html).toContain('Hapus')
    expect(html).toContain('Tambah Kriteria')
    expect(html).toContain('Normalisasi Bobot (100%)')
  })

  it('verifies SubcriteriaView dynamically displays weights and names from criteria prop', () => {
    const customCriteria = [
      { code: 'C1', name: 'Penghasilan Keluarga Terpadu', type: 'COST', weight: '0.40', unit: 'Rupiah' },
      { code: 'C2', name: 'Jumlah Anak dan Lansia', type: 'BENEFIT', weight: '0.30', unit: 'orang' },
      { code: 'C3', name: 'Kelayakan Tempat Tinggal', type: 'BENEFIT', weight: '0.30', unit: 'skor' },
    ]

    const html = renderToString(
      <SubcriteriaView
        criteria={customCriteria}
        subcriteriaRules={DEFAULT_SUBCRITERIA_RULES}
      />
    )

    // Checks that the names and weights in SubcriteriaView match the criteria prop
    expect(html).toContain('Penghasilan Keluarga Terpadu')
    expect(html).toContain('W = 0.40 (40%)')
    expect(html).toContain('Jumlah Anak dan Lansia')
    expect(html).toContain('W = 0.30 (30%)')
    expect(html).toContain('Kelayakan Tempat Tinggal')
    expect(html).toContain('1.00')
    expect(html).toContain('VALID (100%)')

    // C4, C5, C6 are not in customCriteria, so their cards should not exist
    expect(html).not.toContain('C4 — Anggota keluarga rentan')
    expect(html).not.toContain('C5 — Skor kepemilikan aset produktif')
  })

  it('verifies SubcriteriaView automatically creates a card for a newly added criterion', () => {
    const criteriaWithNew = [
      ...DEFAULT_CRITERIA,
      { code: 'C7', name: 'Kapasitas Daya Listrik Rumah', type: 'COST', weight: '0.05', unit: 'Volt Ampere' },
    ]

    const html = renderToString(
      <SubcriteriaView
        criteria={criteriaWithNew}
        subcriteriaRules={DEFAULT_SUBCRITERIA_RULES}
      />
    )

    expect(html).toContain('C7')
    expect(html).toContain('Kapasitas Daya Listrik Rumah')
    expect(html).toContain('COST')
    expect(html).toContain('W = 0.05 (5%)')
    expect(html).toContain('Volt Ampere')
  })

  it('verifies SubcriteriaView warns when criteria total weight is not 1.00', () => {
    const invalidWeightCriteria = [
      { code: 'C1', name: 'Pendapatan per bulan', type: 'COST', weight: '0.20', unit: 'Rupiah' },
      { code: 'C2', name: 'Jumlah tanggungan', type: 'BENEFIT', weight: '0.20', unit: 'orang' },
    ]

    const html = renderToString(
      <SubcriteriaView
        criteria={invalidWeightCriteria}
        subcriteriaRules={DEFAULT_SUBCRITERIA_RULES}
      />
    )

    expect(html).toContain('0.40')
    expect(html).toContain('BELUM 100% (40%)')
  })

  it('verifies target criteria selection in modal uses active criteria', () => {
    const singleCriteria = [
      { code: 'C99', name: 'Kriteria Khusus Penanganan Bencana', type: 'BENEFIT', weight: '1.00', unit: 'skor' },
    ]

    const html = renderToString(
      <SubcriteriaView
        criteria={singleCriteria}
        subcriteriaRules={{}}
      />
    )

    expect(html).toContain('C99')
    expect(html).toContain('Kriteria Khusus Penanganan Bencana')
    expect(html).toContain('Belum ada aturan penilaian subkriteria')
  })
})

