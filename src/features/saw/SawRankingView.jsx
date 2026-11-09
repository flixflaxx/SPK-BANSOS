import { useEffect } from 'react'
import { AlertTriangle, ArrowRight, Check, Trophy, Users, Award, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { formatExact } from '@shared/domain/saw/fraction.js'

export function SawRankingView({ calculationRun, activePeriod, residents, candidates, onNavigate, criteria }) {
  const quota = activePeriod?.quota ?? 0
  const results = calculationRun?.results || []
  const tieBreakRule = calculationRun?.tieBreakRule

  // Anime.js animation on mount
  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (!anime) return

    anime({
      targets: '.ranking-page-card',
      translateY: [16, 0],
      opacity: [0, 1],
      delay: anime.stagger(60, { start: 100 }),
      easing: 'easeOutBack',
      duration: 600,
    })

    anime({
      targets: '.progress-v-fill-rank',
      width: (el) => [0, el.getAttribute('data-width') || '0%'],
      delay: anime.stagger(70, { start: 200 }),
      easing: 'easeOutQuart',
      duration: 1000,
    })
  }, [])

  if (!calculationRun) {
    return (
      <div>
        <PageHeader
          featureNum={13}
          title="Perangkingan Calon Penerima"
          description="Urutan prioritas penerima berdasarkan nilai preferensi V menurun dengan aturan tie-break deterministik."
        />
        <Panel>
          <div className="clay-item" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Belum ada hasil kalkulasi SAW. Silakan jalankan kalkulasi pada menu Kalkulasi SAW terlebih dahulu.
          </div>
        </Panel>
      </div>
    )
  }

  const withinQuotaCount = results.filter((r) => r.rank <= quota).length
  const reserveCount = Math.max(0, results.length - withinQuotaCount)

  return (
    <div>
      <PageHeader
        featureNum={13}
        title="Perangkingan Calon Penerima"
        description="Urutan prioritas calon penerima berdasarkan nilai preferensi (V) metode SAW."
        actions={
          <button
            type="button"
            className="clay-btn"
            onClick={() => onNavigate('recommendations')}
            style={{
              padding: '11px 22px',
              fontSize: '13px',
            }}
          >
            <span>Lanjut ke Rekomendasi & Kuota</span>
            <ArrowRight size={15} />
          </button>
        }
      />

      {/* 3 Quick Summary Mini Cards with 3D Claymorphism */}
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
          className="clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Alternatif
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '4px', lineHeight: 1.1 }}>
              {results.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-green-700)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-indicator" />
              <span>Masuk Kuota</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '4px', lineHeight: 1.1 }}>
              {withinQuotaCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
            }}
          >
            <Award size={22} />
          </div>
        </div>

        <div
          className="clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Cadangan Seleksi
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-text-main)', marginTop: '4px', lineHeight: 1.1 }}>
              {reserveCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
            }}
          >
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      {tieBreakRule && (
        <div
          className="clay-badge"
          style={{
            backgroundColor: '#ffffff',
            padding: '10px 18px',
            marginBottom: '24px',
            fontSize: '12.5px',
            color: 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Trophy size={16} color="var(--color-green-700)" />
          <span>
            <strong style={{ color: 'var(--color-green-950)' }}>Aturan Tie-Break:</strong> {tieBreakRule.description}
          </span>
        </div>
      )}

      <Panel title={`Daftar Peringkat Resmi (Pagu Kuota: ${quota} Calon)`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {results.map((row) => {
            const cand = candidates.find((c) => c.id === row.candidateId)
            const res = residents.find((r) => r.id === cand?.residentId)
            const isWithinQuota = row.rank <= quota

            // Compute exact decimal value for progress bar
            let valDecimal = 0
            if (row.preference?.exact && typeof row.preference.exact === 'object') {
              const num = Number(row.preference.exact.num || 0)
              const den = Number(row.preference.exact.den || 1)
              valDecimal = den > 0 ? num / den : 0
            } else if (typeof row.preference?.exact === 'number') {
              valDecimal = row.preference.exact
            }
            const progressWidthPercent = Math.min(100, Math.max(0, valDecimal * 100)).toFixed(1)

            return (
              <div
                key={row.candidateId}
                className="ranking-page-card clay-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 20px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      className="clay-marble"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: isWithinQuota
                          ? 'linear-gradient(135deg, #1b8a6a, #16765b)'
                          : 'linear-gradient(135deg, #94a3b8, #64748b)',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '15px',
                        fontFamily: 'monospace',
                        boxShadow: isWithinQuota
                          ? '4px 6px 14px rgba(22, 118, 91, 0.35), inset 3px 3px 6px rgba(255, 255, 255, 0.65), inset -3px -3px 6px rgba(0, 0, 0, 0.25)'
                          : '4px 6px 14px rgba(100, 116, 139, 0.25), inset 3px 3px 6px rgba(255, 255, 255, 0.65), inset -3px -3px 6px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      #{row.rank}
                    </div>

                    <div>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--color-green-950)' }}>
                        {res?.name || row.candidateId}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        NIK: {res?.nikMasked || '—'} · RT/RW: {res?.addressRtRw || '—'} · Telp: {res?.phone || '—'}
                      </div>
                      {row.tie.tiedOnPreference && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-warning)',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <AlertTriangle size={13} />
                          <span>
                            Nilai V seri. Diputus oleh: <code>{row.tie.resolvedBy}</code>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: '900',
                        fontFamily: 'monospace',
                        color: isWithinQuota ? 'var(--color-green-700)' : 'var(--color-text-main)',
                      }}
                    >
                      V = {formatExact(row.preference.exact, 4)}
                    </div>
                    <span
                      className="clay-badge"
                      style={{
                        marginTop: '4px',
                        fontSize: '11px',
                        padding: '3px 10px',
                        backgroundColor: isWithinQuota ? '#edf8f3' : '#fef8ee',
                        color: isWithinQuota ? 'var(--color-green-700)' : 'var(--color-warning)',
                      }}
                    >
                      {isWithinQuota ? (
                        <>
                          <Check size={13} />
                          <span>Masuk Ambang Kuota</span>
                        </>
                      ) : (
                        <span>Cadangan (Di Luar Kuota)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress Bar 3D Cekung */}
                <div
                  className="clay-sunken"
                  style={{
                    marginTop: '14px',
                    width: '100%',
                    height: '10px',
                  }}
                >
                  <div
                    className="progress-v-fill-rank clay-progress-fill"
                    data-width={`${progressWidthPercent}%`}
                    style={{
                      width: `${progressWidthPercent}%`,
                      background: isWithinQuota
                        ? 'linear-gradient(90deg, #16765b 0%, #20b47c 65%, #b5f56a 100%)'
                        : 'linear-gradient(90deg, #d97706 0%, #f59e0b 60%, #fde68a 100%)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
