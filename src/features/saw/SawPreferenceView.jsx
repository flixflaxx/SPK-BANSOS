import { useEffect, useRef } from 'react'
import { Sparkles, Calculator, Award, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { formatExact } from '@shared/domain/saw/fraction.js'

export function SawPreferenceView({ calculationRun, residents, candidates, criteria: propCriteria }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.anime && containerRef.current) {
      window.anime({
        targets: containerRef.current.querySelectorAll('.pref-stat-card'),
        opacity: [0, 1],
        translateY: [12, 0],
        delay: window.anime.stagger(80),
        duration: 450,
        easing: 'easeOutCubic',
      })
      window.anime({
        targets: containerRef.current.querySelectorAll('.pref-row'),
        opacity: [0, 1],
        translateY: [8, 0],
        delay: window.anime.stagger(40),
        duration: 400,
        easing: 'easeOutCubic',
      })
      window.anime({
        targets: containerRef.current.querySelectorAll('.pref-fill-bar'),
        width: (el) => [0, el.getAttribute('data-width') || '0%'],
        duration: 800,
        easing: 'easeOutCubic',
      })
    }
  }, [calculationRun])

  if (!calculationRun) {
    return (
      <div>
        <PageHeader
          featureNum={12}
          title="Perhitungan Nilai Preferensi (V)"
          description="Rincian kontribusi terbobot wⱼ × rᵢⱼ per kriteria dan akumulasi nilai preferensi V."
        />
        <Panel>
          <div
            className="clay-item"
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '13.5px',
            }}
          >
            Belum ada hasil kalkulasi SAW untuk periode ini. Silakan jalankan kalkulasi pada menu <strong>Kalkulasi SAW</strong>.
          </div>
        </Panel>
      </div>
    )
  }

  const { criteria, results } = calculationRun
  const topResult = results[0]
  const topV = topResult ? formatExact(topResult.preference.exact, 4) : '0'

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={12}
        title="Perhitungan Nilai Preferensi (V)"
        description="Rincian nilai preferensi akhir hasil perkalian bobot kriteria (wⱼ) dengan matriks ternormalisasi (rᵢⱼ)."
      />

      {/* Top 3 Claymorphism Metric Cards */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          className="pref-stat-card clay-card"
          style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              ALTERNATIF DIHITUNG
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '4px' }}>
              {results.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
              Lolos verifikasi kelayakan
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calculator size={22} />
          </div>
        </div>

        <div
          className="pref-stat-card clay-card"
          style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
                NILAI V TERTINGGI
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '4px' }}>
              {topV}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
              Peringkat 1 ({residents.find((r) => r.id === candidates.find((c) => c.id === topResult?.candidateId)?.residentId)?.name || 'Kandidat'})
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={22} />
          </div>
        </div>

        <div
          className="pref-stat-card clay-card"
          style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              DIMENSI KRITERIA
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '4px' }}>
              {criteria.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Kriteria</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
              Total akumulasi bobot = 1.00
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#fef3c7',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SlidersHorizontal size={22} />
          </div>
        </div>
      </div>

      <Panel title="Tabel Kontribusi Terbobot (w × r) & Akumulasi Nilai V">
        <div className="table-responsive-container" style={{ overflowX: 'auto', padding: '4px', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              minWidth: '720px',
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ color: 'var(--color-text-muted)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: '800' }}>Alternatif Calon</th>
                {criteria.map((c) => (
                  <th key={c.code} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800' }}>
                    <div>w × r({c.code})</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'none' }}>
                      (W={c.weightText})
                    </div>
                  </th>
                ))}
                <th
                  style={{
                    padding: '12px 20px',
                    textAlign: 'right',
                    fontWeight: '800',
                    width: '230px',
                    color: 'var(--color-green-900)',
                  }}
                >
                  Nilai Preferensi (V)
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => {
                const cand = candidates.find((c) => c.id === row.candidateId)
                const res = residents.find((r) => r.id === cand?.residentId)
                const formatted = formatExact(row.preference.exact, 6)
                const vDec = parseFloat(formatted) || 0
                const vPct = Math.min(100, Math.max(0, Math.round(vDec * 100)))
                const isRankOne = row.rank === 1

                return (
                  <tr
                    key={row.candidateId}
                    className="pref-row clay-item"
                    style={{
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <td
                      style={{
                        padding: '14px 18px',
                        borderTopLeftRadius: '16px',
                        borderBottomLeftRadius: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>
                          {res?.name || row.candidateId}
                        </span>
                        {isRankOne && (
                          <span
                            className="clay-badge"
                            style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              backgroundColor: 'var(--color-lime)',
                              color: 'var(--color-green-950)',
                              padding: '2px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Sparkles size={11} /> Top Rank
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        NIK: <code style={{ color: 'var(--color-green-700)' }}>{res?.nikMasked || '—'}</code>
                      </div>
                    </td>

                    {criteria.map((c) => {
                      const contrib = row.contributions[c.code]
                      return (
                        <td
                          key={c.code}
                          style={{
                            padding: '14px 16px',
                            textAlign: 'right',
                          }}
                        >
                          <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-main)' }}>
                            {formatExact(contrib.exact, 4)}
                          </div>
                          <div style={{ fontSize: '9.5px', color: 'var(--color-text-subtle)', fontFamily: 'monospace', marginTop: '1px' }}>
                            [{contrib.exact}]
                          </div>
                        </td>
                      )
                    })}

                    <td
                      style={{
                        padding: '14px 20px',
                        borderTopRightRadius: '16px',
                        borderBottomRightRadius: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700' }}>
                          V =
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontWeight: '800',
                            fontSize: '15px',
                            color: 'var(--color-green-700)',
                          }}
                        >
                          {formatExact(row.preference.exact, 6)}
                        </span>
                      </div>
                      {/* Sunken Clay Progress Bar */}
                      <div
                        className="clay-sunken"
                        style={{
                          height: '8px',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          padding: '1px',
                        }}
                      >
                        <div
                          className="pref-fill-bar clay-progress-fill"
                          data-width={`${vPct}%`}
                          style={{
                            height: '100%',
                            width: `${vPct}%`,
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </td>
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
