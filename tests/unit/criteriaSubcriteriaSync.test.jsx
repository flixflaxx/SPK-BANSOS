import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { CriteriaView } from '../../src/features/criteria/CriteriaView.jsx'
import { SubcriteriaView } from '../../src/features/criteria/SubcriteriaView.jsx'
import { AssessmentsView } from '../../src/features/assessments/AssessmentsView.jsx'
import { SawCalculationView } from '../../src/features/saw/SawCalculationView.jsx'
import { SawMatrixView } from '../../src/features/saw/SawMatrixView.jsx'
import { SawPreferenceView } from '../../src/features/saw/SawPreferenceView.jsx'
import {
  DEFAULT_CRITERIA,
  DEFAULT_SUBCRITERIA_RULES,
  buildRunFromCriteria,
} from '../../src/features/criteria/criteriaConstants.js'
import {
  DEMO_CANDIDATES,
  DEMO_RESIDENTS,
  DEMO_ASSESSMENTS,
  DEMO_PERIODS,
} from '../../src/services/mockData.js'

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

  it('verifies AssessmentsView renders columns dynamically based on active criteria', () => {
    const customCriteria = [
      { code: 'C1', name: 'Pendapatan per bulan', type: 'COST', weight: '0.40', unit: 'Rupiah' },
      { code: 'C2', name: 'Jumlah tanggungan', type: 'BENEFIT', weight: '0.30', unit: 'orang' },
      { code: 'C6', name: 'Tingkat Desil Kesejahteraan DTKS', type: 'COST', weight: '0.30', unit: 'Tingkat Desil' },
    ]

    const html = renderToString(
      <AssessmentsView
        candidates={DEMO_CANDIDATES}
        residents={DEMO_RESIDENTS}
        assessments={DEMO_ASSESSMENTS}
        criteria={customCriteria}
      />
    )

    expect(html).toContain('C1')
    expect(html).toContain('C2')
    expect(html).toContain('C6')
    expect(html).toContain('W=0.40')
    expect(html).toContain('W=0.30')
    // C3, C4, C5 are not in customCriteria
    expect(html).not.toContain('C3')
    expect(html).not.toContain('C4')
    expect(html).not.toContain('C5')
  })

  it('verifies SawCalculationView displays active criteria and weights from criteria prop', () => {
    const customCriteria = [
      { code: 'C1', name: 'Pendapatan', type: 'COST', weight: '0.50', unit: 'Rupiah' },
      { code: 'C2', name: 'Tanggungan', type: 'BENEFIT', weight: '0.50', unit: 'orang' },
    ]

    const html = renderToString(
      <SawCalculationView
        activePeriod={DEMO_PERIODS[0]}
        candidates={DEMO_CANDIDATES}
        residents={DEMO_RESIDENTS}
        assessments={DEMO_ASSESSMENTS}
        calculationRun={null}
        currentUser={{ id: 'usr-admin' }}
        onRunCalculated={() => {}}
        criteria={customCriteria}
      />
    )

    expect(html).toContain('Kriteria &amp; Bobot Aktif Saat Ini (2 Kriteria)')
    expect(html).toContain('W=0.50')
    expect(html).toContain('C1 ·')
    expect(html).toContain('C2 ·')
  })

  it('verifies buildRunFromCriteria re-calculates SAW preference and rankings dynamically when criteria/weights change', () => {
    // Run 1: High weight on C2 (Tanggungan)
    const criteriaSet1 = [
      { code: 'C1', name: 'Pendapatan', type: 'COST', weight: '0.10', unit: 'Rupiah' },
      { code: 'C2', name: 'Jumlah tanggungan', type: 'BENEFIT', weight: '0.90', unit: 'orang' },
    ]

    const run1 = buildRunFromCriteria({
      criteria: criteriaSet1,
      candidates: DEMO_CANDIDATES,
      residents: DEMO_RESIDENTS,
      assessments: DEMO_ASSESSMENTS,
      period: DEMO_PERIODS[0],
      currentUser: { id: 'usr-admin' },
    })

    expect(run1).toBeDefined()
    expect(run1.criteria.length).toBe(2)
    expect(run1.results.length).toBeGreaterThan(0)

    // Run 2: High weight on C1 (Pendapatan - Cost)
    const criteriaSet2 = [
      { code: 'C1', name: 'Pendapatan', type: 'COST', weight: '0.90', unit: 'Rupiah' },
      { code: 'C2', name: 'Jumlah tanggungan', type: 'BENEFIT', weight: '0.10', unit: 'orang' },
    ]

    const run2 = buildRunFromCriteria({
      criteria: criteriaSet2,
      candidates: DEMO_CANDIDATES,
      residents: DEMO_RESIDENTS,
      assessments: DEMO_ASSESSMENTS,
      period: DEMO_PERIODS[0],
      currentUser: { id: 'usr-admin' },
    })

    expect(run2).toBeDefined()
    expect(run2.criteria.length).toBe(2)

    // Preference scores must dynamically differ between run1 and run2 because weights changed!
    const cand1PrefRun1 = run1.results[0].preference.exact
    const cand1PrefRun2 = run2.results[0].preference.exact
    expect(cand1PrefRun1).not.toEqual(cand1PrefRun2)
  })
})

