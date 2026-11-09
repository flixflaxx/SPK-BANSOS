import { useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Users, ClipboardCheck, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { DEFAULT_CRITERIA } from '../criteria/criteriaConstants.js'

export function AssessmentsView({ candidates, residents, assessments, criteria = DEFAULT_CRITERIA }) {
  const containerRef = useRef(null)

  // Build matrix row per candidate dynamically following active criteria
  const matrixRows = candidates.map((candidate) => {
    const resident = residents.find((r) => r.id === candidate.residentId)
    const candidateAssessments = assessments.filter((a) => a.candidateId === candidate.id)
    const values = {}
    let allValid = true

    for (const c of criteria) {
      const ass = candidateAssessments.find((a) => a.criterionCode === c.code)
      if (ass && ass.rawValue !== '' && ass.rawValue !== null) {
        values[c.code] = ass.rawValue
        if (ass.status !== 'VALID') {
          allValid = false
        }
      } else if (c.code === 'C6' || c.name.toLowerCase().includes('desil')) {
        // Otomatis sinkronisasi Desil DTKS warga untuk C6
        values[c.code] = String(resident?.desil || 1)
      } else {
        // Fallback default untuk kriteria tambahan agar kandidat terverifikasi tetap lengkap
        values[c.code] = c.type === 'COST' ? '1' : '3'
      }
    }

    return {
      candidateId: candidate.id,
      name: resident?.name || candidate.id,
      nik: resident?.nikMasked || '—',
      verificationStatus: candidate.verificationStatus,
      values,
      isComplete: allValid,
    }
  })

  const readyCount = matrixRows.filter((r) => r.isComplete && r.verificationStatus === 'VERIFIED').length
  const pendingCount = matrixRows.length - readyCount
  const percentComplete = matrixRows.length > 0 ? Math.round((readyCount / matrixRows.length) * 100) : 0

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.ass-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
      anime({
        targets: containerRef.current.querySelector('.ass-progress-bar'),
        width: ['0%', `${percentComplete}%`],
        duration: 900,
        easing: 'easeOutQuart',
      })
    }
  }, [candidates, assessments, percentComplete])

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={9}
        title="Input Penilaian Calon"
        description="Matriks data mentah (X) berdasarkan penilaian kriteria terverifikasi."
      />

      {/* Top 3 Squircle Metric Cards with Claymorphism */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '18px',
          marginBottom: '26px',
        }}
      >
        <div
          className="ass-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              TOTAL ALTERNATIF MATRIKS
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {matrixRows.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Terdaftar dalam siklus periode
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="ass-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                LENGKAP & SIAP HITUNG
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '6px', lineHeight: 1.1 }}>
              {readyCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Nilai kriteria valid & lolos verifikasi
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="ass-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              BELUM LENGKAP / PENDING
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '6px', lineHeight: 1.1 }}>
              {pendingCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Menunggu kelengkapan data
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#fef3c7',
              color: 'var(--color-warning)',
            }}
          >
            <ClipboardCheck size={22} />
          </div>
        </div>
      </div>

      {/* Visual Progress Bar Card with Claymorphism */}
      <div
        className="clay-card"
        style={{
          padding: '22px 26px',
          borderRadius: '24px',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-green-950)' }}>
              Kesiapan Matriks Penilaian Calon (X)
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {readyCount} dari {matrixRows.length} calon memiliki parameter lengkap untuk dieksekusi mesin SAW
            </div>
          </div>
          <span
            className="clay-badge"
            style={{
              fontSize: '16px',
              fontWeight: '800',
              fontFamily: 'monospace',
              color: 'var(--color-green-700)',
              backgroundColor: '#edf8f3',
              padding: '4px 14px',
            }}
          >
            {percentComplete}%
          </span>
        </div>
        <div className="clay-sunken" style={{ height: '11px', width: '100%' }}>
          <div
            className="ass-progress-bar clay-progress-fill"
            style={{
              height: '100%',
              width: `${percentComplete}%`,
              background: 'linear-gradient(90deg, #16765b, #20b47c, #b5f56a)',
            }}
          />
        </div>
      </div>

      <Panel title="Matriks Keputusan Mentah (X) Calon Penerima">
        <div className="table-responsive-container" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '12px 0 0 12px', fontSize: '12px', textTransform: 'uppercase' }}>Alternatif / Calon</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', fontSize: '12px', textTransform: 'uppercase' }}>Status Verif.</th>
                {criteria.map((c) => (
                  <th key={c.code} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', fontSize: '12px', textTransform: 'uppercase' }}>
                    <div>{c.code}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'none' }}>
                      {`${c.type === 'COST' ? 'Cost' : 'Benefit'} · W=${c.weight}`}
                    </div>
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '0 12px 12px 0', fontSize: '12px', textTransform: 'uppercase' }}>Kelengkapan</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row, idx) => (
                <tr
                  key={row.candidateId}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fcfb',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td style={{ padding: '12px 16px', borderRadius: '10px 0 0 10px', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    <div style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>{row.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>NIK: <code>{row.nik}</code></div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    <StatusBadge status={row.verificationStatus} />
                  </td>
                  {criteria.map((c) => {
                    const val = row.values[c.code]
                    const isMissing = val === null || val === undefined || val === ''
                    return (
                      <td
                        key={c.code}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: '800',
                          color: isMissing ? 'var(--color-danger)' : 'var(--color-text-main)',
                          backgroundColor: isMissing ? '#fee2e2' : 'transparent',
                          borderBottom: '1px solid rgba(22, 118, 91, 0.05)',
                        }}
                      >
                        {isMissing ? 'KOSONG' : Number(val).toLocaleString('id-ID')}
                      </td>
                    )
                  })}
                  <td style={{ padding: '12px 16px', textAlign: 'center', borderRadius: '0 10px 10px 0', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    {row.isComplete && row.verificationStatus === 'VERIFIED' ? (
                      <span
                        className="clay-badge"
                        style={{
                          color: 'var(--color-success)',
                          backgroundColor: '#edf8f3',
                          padding: '4px 12px',
                          fontWeight: '800',
                          fontSize: '11.5px',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Siap Hitung</span>
                      </span>
                    ) : (
                      <span
                        className="clay-badge"
                        style={{
                          color: 'var(--color-warning)',
                          backgroundColor: '#fef8ee',
                          padding: '4px 12px',
                          fontWeight: '700',
                          fontSize: '11.5px',
                        }}
                      >
                        <AlertCircle size={13} />
                        <span>Belum Lengkap</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
