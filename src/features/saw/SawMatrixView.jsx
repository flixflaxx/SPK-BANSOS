import { useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { formatExact } from '@shared/domain/saw/fraction.js'

export function SawMatrixView({ calculationRun, residents, candidates, criteria: propCriteria }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.matrix-row'),
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(40),
        duration: 450,
        easing: 'easeOutBack',
      })
    }
  }, [calculationRun])

  if (!calculationRun) {
    return (
      <div>
        <PageHeader
          featureNum={11}
          title="Normalisasi Matriks Keputusan (R)"
          description="Matriks R hasil transformasi nilai mentah sesuai tipe kriteria: Benefit (x/max) dan Cost (min/x)."
        />
        <Panel>
          <div className="clay-item" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Belum ada data perhitungan tersimpan. Silakan jalankan kalkulasi pada menu Perhitungan SAW.
          </div>
        </Panel>
      </div>
    )
  }

  const { criteria, results } = calculationRun

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={11}
        title="Normalisasi Matriks Keputusan (R)"
        description="Hasil normalisasi rᵢⱼ berdasarkan atribut Benefit dan Cost kriteria."
      />

      {/* Normalizer statistics banner with 3D Claymorphism */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '16px',
          marginBottom: '26px',
        }}
      >
        {criteria.map((c) => {
          const isCost = c.type === 'COST'
          return (
            <div
              key={c.code}
              className="clay-card"
              style={{
                borderRadius: '22px',
                padding: '18px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {c.code} · {c.type === 'COST' ? 'Cost (Biaya)' : 'Benefit'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--color-green-950)', marginTop: '4px' }}>
                  {isCost ? `Min: ${c.min.value}` : `Max: ${c.max.value}`}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
                  {isCost ? 'Formula: Min / X' : 'Formula: X / Max'}
                </div>
              </div>

              <div
                className="clay-bubble"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: isCost ? '#fef3c7' : '#edf8f3',
                  color: isCost ? 'var(--color-warning)' : 'var(--color-green-700)',
                }}
              >
                {isCost ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
              </div>
            </div>
          )
        })}
      </div>

      <Panel title="Matriks R (Ternormalisasi)">
        <div className="table-responsive-container" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '12px 0 0 12px', fontSize: '12px', textTransform: 'uppercase' }}>Alternatif / Calon</th>
                {criteria.map((c, i) => (
                  <th
                    key={c.code}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontWeight: '800',
                      color: 'var(--color-green-950)',
                      backgroundColor: '#eaf4ef',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      borderRadius: i === criteria.length - 1 ? '0 12px 12px 0' : undefined,
                    }}
                  >
                    <div>r({c.code})</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                      {c.type === 'COST' ? 'min/x' : 'x/max'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => {
                const cand = candidates.find((c) => c.id === row.candidateId)
                const res = residents.find((r) => r.id === cand?.residentId)

                return (
                  <tr
                    key={row.candidateId}
                    className="matrix-row"
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fcfb',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '12px 16px', borderRadius: '10px 0 0 10px', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                      <div style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>
                        {res?.name || row.candidateId}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        NIK: <code>{res?.nikMasked || '—'}</code>
                      </div>
                    </td>
                    {criteria.map((c, i) => {
                      const norm = row.normalized[c.code]
                      const formatted = formatExact(norm.exact, 4)
                      const decVal = parseFloat(formatted) || 0
                      const pct = Math.min(100, Math.max(0, Math.round(decVal * 100)))

                      return (
                        <td
                          key={c.code}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            borderRadius: i === criteria.length - 1 ? '0 10px 10px 0' : undefined,
                            borderBottom: '1px solid rgba(22, 118, 91, 0.05)',
                          }}
                        >
                          <div style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--color-green-700)', fontSize: '13.5px' }}>
                            {formatExact(norm.exact, 4)}
                          </div>
                          {/* 3D Sunken mini visual bar */}
                          <div
                            className="clay-sunken"
                            style={{
                              width: '100%',
                              height: '5px',
                              marginTop: '5px',
                            }}
                          >
                            <div
                              className="clay-progress-fill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: 'var(--color-green-600)',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)', marginTop: '2px', fontFamily: 'monospace' }}>
                            [{norm.exact}]
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
