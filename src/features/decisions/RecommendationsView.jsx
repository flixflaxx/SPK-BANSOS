import { useEffect, useRef } from 'react'
import { Award, ListOrdered, Clock, ArrowRight } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { deriveRecommendations } from '@shared/domain/decisions/recommendations.js'

export function RecommendationsView({ calculationRun, activePeriod, residents, candidates, onNavigate }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.rec-item-card'),
        opacity: [0, 1],
        translateY: [14, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutBack',
      })
    }
  }, [calculationRun])

  if (!calculationRun) {
    return (
      <div>
        <PageHeader
          featureNum={14}
          title="Rekomendasi Penerima Bansos"
          description="Sintesis komputasi ranking SAW, status verifikasi administrasi, dan pagu kuota program."
        />
        <Panel>
          <div className="clay-item" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Jalankan perhitungan SAW terlebih dahulu untuk menghasilkan rekomendasi.
          </div>
        </Panel>
      </div>
    )
  }

  const quota = activePeriod?.quota ?? 0
  const recommendations = deriveRecommendations({ run: calculationRun, quota })
  const withinQuotaCount = recommendations.items.filter((i) => i.status === 'RECOMMENDED').length
  const reserveCount = recommendations.items.filter((i) => i.status === 'RESERVE').length

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={14}
        title="Rekomendasi Penerima Bansos"
        description="Hasil komputasi rekomendasi penerima. Sistem menetapkan status rekomendasi berdasarkan batas kuota dan verifikasi faktual."
        actions={
          <button
            type="button"
            className="clay-btn"
            onClick={() => onNavigate('decisions')}
            style={{
              padding: '11px 22px',
              fontSize: '13px',
            }}
          >
            <span>Lanjut ke Lembar Persetujuan</span>
            <ArrowRight size={15} />
          </button>
        }
      />

      {/* Top Squircle Metric Cards with Claymorphism */}
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
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              TOTAL REKOMENDASI
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {recommendations.items.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Diproses dari run SAW
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
            <ListOrdered size={22} />
          </div>
        </div>

        <div
          className="clay-card"
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
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-green-700)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                DALAM KUOTA PAGU
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '6px', lineHeight: 1.1 }}>
              {withinQuotaCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Prioritas alokasi bantuan
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
            <Award size={22} />
          </div>
        </div>

        <div
          className="clay-card"
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
              CADANGAN SELEKSI
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '6px', lineHeight: 1.1 }}>
              {reserveCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Daftar tunggu jika ada kuota kosong
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
            <Clock size={22} />
          </div>
        </div>
      </div>

      <Panel title={`Rekomendasi Sistem untuk Periode ${activePeriod?.name || 'Aktif'}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.items.map((item) => {
            const cand = candidates.find((c) => c.id === item.candidateId)
            const res = residents.find((r) => r.id === cand?.residentId)
            const isTop = item.rank === 1

            return (
              <div
                key={item.candidateId}
                className="rec-item-card clay-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    className="clay-marble"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: item.rank
                        ? isTop
                          ? 'linear-gradient(135deg, #0d382e, #07221a)'
                          : 'linear-gradient(135deg, #1b8a6a, #16765b)'
                        : 'linear-gradient(135deg, #94a3b8, #64748b)',
                      color: item.rank ? (isTop ? 'var(--color-lime)' : '#ffffff') : '#ffffff',
                      fontWeight: '900',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.rank ? `#${item.rank}` : '—'}
                  </div>

                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--color-green-950)' }}>
                      {res?.name || item.candidateId}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      NIK: <code>{res?.nikMasked || '—'}</code> · Kode Alasan: {item.reasonCodes.join(', ')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <StatusBadge status={item.status} />
                    {item.status === 'RECOMMENDED' && (
                      <div style={{ marginTop: '4px' }}>
                        {item.rank === 1 && (
                          <span className="clay-badge" style={{ backgroundColor: '#edf8f3', color: 'var(--color-green-700)', fontSize: '10.5px', padding: '2px 8px', fontWeight: '800' }}>
                            Alokasi: Sembako (BPNT)
                          </span>
                        )}
                        {item.rank === 2 && (
                          <span className="clay-badge" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '10.5px', padding: '2px 8px', fontWeight: '800' }}>
                            Alokasi: PKH (Keluarga)
                          </span>
                        )}
                        {item.rank >= 3 && (
                          <span className="clay-badge" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', fontSize: '10.5px', padding: '2px 8px', fontWeight: '800' }}>
                            Alokasi: PBI-JK (BPJS KIS)
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '3px' }}>
                      Wajib Persetujuan Manusia
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
