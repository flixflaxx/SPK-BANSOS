import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AssessmentsView } from '../../src/features/assessments/AssessmentsView.jsx'
import {
  DEFAULT_CRITERIA,
  DEFAULT_SUBCRITERIA_RULES,
} from '../../src/features/criteria/criteriaConstants.js'
import {
  DEMO_CANDIDATES,
  DEMO_RESIDENTS,
} from '../../src/services/mockData.js'

describe('AssessmentsView Input Nilai & Empty-by-default Tests', () => {
  it('leaves criteria values empty (rendered as Kosong) before they are inputted', () => {
    // When no assessments exist at all
    const html = renderToString(
      <AssessmentsView
        candidates={DEMO_CANDIDATES}
        residents={DEMO_RESIDENTS}
        assessments={[]}
        criteria={DEFAULT_CRITERIA}
      />
    )

    // Should render 'Kosong' badges and 'Belum Lengkap' status
    expect(html).toContain('Kosong')
    expect(html).toContain('Belum Lengkap')
    expect(html).toContain('Nilai kriteria masih kosong')
  })

  it('renders "Input Nilai" button on each candidate row and "Input Nilai Calon" in header', () => {
    const html = renderToString(
      <AssessmentsView
        candidates={DEMO_CANDIDATES}
        residents={DEMO_RESIDENTS}
        assessments={[]}
        criteria={DEFAULT_CRITERIA}
      />
    )

    expect(html).toContain('Input Nilai Calon')
    expect(html).toContain('Input Nilai')
    expect(html).toContain('input-nilai-btn')
  })

  it('renders interactive modal when opened with candidate selection and criteria input fields', () => {
    const html = renderToString(
      <AssessmentsView
        candidates={DEMO_CANDIDATES}
        residents={DEMO_RESIDENTS}
        assessments={[]}
        criteria={DEFAULT_CRITERIA}
        subcriteriaRules={DEFAULT_SUBCRITERIA_RULES}
        initialInputCandidateId={DEMO_CANDIDATES[0].id}
      />
    )

    // Modal elements
    expect(html).toContain('Input Penilaian Kriteria Calon')
    expect(html).toContain('Masukkan nilai kriteria untuk calon penerima')
    expect(html).toContain('Pilih Calon:')
    expect(html).toContain('Simpan Nilai Penilaian')
    expect(html).toContain('Kosongkan Semua Nilai')

    // Criteria and subcriteria options
    expect(html).toContain('C1')
    expect(html).toContain('Pendapatan per bulan')
    expect(html).toContain('C2')
    expect(html).toContain('Jumlah tanggungan')
    expect(html).toContain('C6')
    expect(html).toContain('Tingkat Desil Kesejahteraan DTKS')
    expect(html).toContain('-- Kosongkan / Belum Dinilai --')
  })

  it('correctly reflects inputted assessment values and calculates Siap Hitung status when all criteria are complete', () => {
    // Prepare complete assessments for cand-001 for all 6 default criteria
    const completeAssessments = [
      { id: 'a1', candidateId: 'cand-001', criterionCode: 'C1', rawValue: '1000000', status: 'VALID' },
      { id: 'a2', candidateId: 'cand-001', criterionCode: 'C2', rawValue: '4', status: 'VALID' },
      { id: 'a3', candidateId: 'cand-001', criterionCode: 'C3', rawValue: '5', status: 'VALID' },
      { id: 'a4', candidateId: 'cand-001', criterionCode: 'C4', rawValue: '2', status: 'VALID' },
      { id: 'a5', candidateId: 'cand-001', criterionCode: 'C5', rawValue: '1', status: 'VALID' },
      { id: 'a6', candidateId: 'cand-001', criterionCode: 'C6', rawValue: '1', status: 'VALID' },
    ]

    const html = renderToString(
      <AssessmentsView
        candidates={[DEMO_CANDIDATES[0]]}
        residents={DEMO_RESIDENTS}
        assessments={completeAssessments}
        criteria={DEFAULT_CRITERIA}
      />
    )

    expect(html).toContain('Siap Hitung')
    expect(html).toContain('1.000.000')
    expect(html).not.toContain('>Kosong</span>')
  })
})
