import { useState, useEffect, useRef } from 'react'
import { PieChart, Save, AlertCircle, ShoppingBag, HeartHandshake, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { countApproved } from '@shared/domain/decisions/approval.js'

export function QuotaView({ activePeriod, calculationRun, decisions, onUpdateQuota }) {
  const initialBreakdown = activePeriod?.quotaBreakdown || {
    sembako: 1,
    pkh: 1,
    pbijk: 1,
  }

  const [quotaSembako, setQuotaSembako] = useState(initialBreakdown.sembako ?? 1)
  const [quotaPkh, setQuotaPkh] = useState(initialBreakdown.pkh ?? 1)
  const [quotaPbijk, setQuotaPbijk] = useState(initialBreakdown.pbijk ?? 1)

  const totalQuota = quotaSembako + quotaPkh + quotaPbijk
  const approvedTotal = calculationRun ? countApproved(decisions, calculationRun.id) : 0
  const remainingQuota = Math.max(0, totalQuota - approvedTotal)
  const percentFilled = totalQuota > 0 ? Math.min(100, Math.round((approvedTotal / totalQuota) * 100)) : 0

  // Estimated distribution of approved candidates across programs
  const approvedSembako = Math.min(quotaSembako, approvedTotal)
  const approvedPkh = Math.min(quotaPkh, Math.max(0, approvedTotal - quotaSembako))
  const approvedPbijk = Math.min(quotaPbijk, Math.max(0, approvedTotal - quotaSembako - quotaPkh))

  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.quota-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
      anime({
        targets: containerRef.current.querySelector('.quota-fill-bar'),
        width: [`0%`, `${percentFilled}%`],
        duration: 900,
        easing: 'easeOutQuart',
      })
    }
  }, [percentFilled])

  function handleSaveQuota(e) {
    e.preventDefault()
    if (quotaSembako < 0 || quotaPkh < 0 || quotaPbijk < 0) {
      alert('Kuota untuk tiap program bantuan harus berupa bilangan bulat ≥ 0.')
      return
    }

    const payload = {
      total: totalQuota,
      breakdown: {
        sembako: quotaSembako,
        pkh: quotaPkh,
        pbijk: quotaPbijk,
      },
    }

    onUpdateQuota(payload)
  }

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={16}
        title="Alokasi Kuota Bantuan Sosial"
        description="Pengaturan pagu kuota penerima terbagi per jenis program bantuan (Sembako/BPNT, PKH, dan PBI-JK) serta kapasitas keterisian."
      />

      {/* 4 Cards: Sembako, PKH, PBI-JK, and Total */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '18px',
          marginBottom: '26px',
        }}
      >
        {/* Program Sembako */}
        <div
          className="quota-stat-card clay-card"
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
              BANTUAN SEMBAKO (BPNT)
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '6px', lineHeight: 1.1 }}>
              {quotaSembako} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>KPM</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Terisi: {approvedSembako} / {quotaSembako}
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
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Program PKH */}
        <div
          className="quota-stat-card clay-card"
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
              PROGRAM PKH (KELUARGA HARAPAN)
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0284c7', marginTop: '6px', lineHeight: 1.1 }}>
              {quotaPkh} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>KPM</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Terisi: {approvedPkh} / {quotaPkh}
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
            <HeartHandshake size={22} />
          </div>
        </div>

        {/* Program PBI-JK */}
        <div
          className="quota-stat-card clay-card"
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
              BANTUAN PBI-JK (BPJS KIS)
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#9333ea', marginTop: '6px', lineHeight: 1.1 }}>
              {quotaPbijk} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Jiwa</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Terisi: {approvedPbijk} / {quotaPbijk}
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#f3e8ff',
              color: '#9333ea',
            }}
          >
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Total Akumulasi Pagu */}
        <div
          className="quota-stat-card clay-card"
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
              TOTAL SELURUH BANTUAN
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {totalQuota} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Penerima</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Sisa Alokasi: {remainingQuota} Slot
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: remainingQuota === 0 ? '#fee2e2' : '#fef3c7',
              color: remainingQuota === 0 ? 'var(--color-danger)' : 'var(--color-warning)',
            }}
          >
            <PieChart size={22} />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-green-950)' }}>
              Tingkat Keterisian Kuota Penyaluran (Akumulatif)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {approvedTotal} dari total {totalQuota} pagu penerima bantuan telah disahkan pimpinan
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
            {percentFilled}% Terisi
          </span>
        </div>

        {/* 3D Sunken Progress Track */}
        <div
          className="clay-sunken"
          style={{
            height: '12px',
            width: '100%',
          }}
        >
          <div
            className="quota-fill-bar clay-progress-fill"
            style={{
              height: '100%',
              width: `${percentFilled}%`,
              background: 'linear-gradient(90deg, #16765b 0%, #20b47c 60%, #b5f56a 100%)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11.5px', color: 'var(--color-text-subtle)' }}>
          <span>0 Penerima</span>
          <span>Kapasitas Pagu: {totalQuota} Penerima ({quotaSembako} Sembako, {quotaPkh} PKH, {quotaPbijk} PBI-JK)</span>
        </div>
      </div>

      {/* Pengaturan Kuota Form in Claymorphism */}
      <Panel title="Pengaturan Kuota Per Jenis Program Bantuan" subtitle={`Periode Seleksi: ${activePeriod?.name || 'Aktif'}`}>
        <form onSubmit={handleSaveQuota} style={{ maxWidth: '640px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '22px' }}>
            {/* Kuota Sembako */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-green-950)' }}>
                Bantuan Sembako (BPNT)
              </label>
              <input
                type="number"
                min={0}
                value={quotaSembako}
                onChange={(e) => setQuotaSembako(Math.max(0, Number(e.target.value)))}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: '800',
                  color: 'var(--color-green-700)',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Bahan pangan pokok per keluarga
              </span>
            </div>

            {/* Kuota PKH */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-green-950)' }}>
                Program PKH (Keluarga)
              </label>
              <input
                type="number"
                min={0}
                value={quotaPkh}
                onChange={(e) => setQuotaPkh(Math.max(0, Number(e.target.value)))}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#0284c7',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Bansos tunai bersyarat pendidikan/balita
              </span>
            </div>

            {/* Kuota PBI-JK */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-green-950)' }}>
                Bantuan PBI-JK (BPJS)
              </label>
              <input
                type="number"
                min={0}
                value={quotaPbijk}
                onChange={(e) => setQuotaPbijk(Math.max(0, Number(e.target.value)))}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#9333ea',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Iuran jaminan kesehatan gratis
              </span>
            </div>
          </div>

          {/* Ringkasan Total Akumulasi */}
          <div
            className="clay-card"
            style={{
              padding: '16px 20px',
              borderRadius: '18px',
              marginBottom: '22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-green-950)' }}>
                Total Pagu Periode:
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Akumulasi seluruh kuota program bantuan
              </div>
            </div>
            <div
              className="clay-badge"
              style={{
                fontSize: '18px',
                fontWeight: '800',
                fontFamily: 'monospace',
                backgroundColor: '#edf8f3',
                color: 'var(--color-green-700)',
                padding: '6px 18px',
              }}
            >
              {totalQuota} Penerima
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '22px' }}>
            <AlertCircle size={14} style={{ flexShrink: 0, color: 'var(--color-green-700)' }} />
            <span>Perubahan kuota otomatis menyesuaikan alokasi rekomendasi calon bantuan pada hasil perangkingan SAW.</span>
          </div>

          <button
            type="submit"
            className="clay-btn"
            style={{
              padding: '12px 26px',
              fontSize: '13.5px',
            }}
          >
            <Save size={16} />
            <span>Simpan Alokasi Kuota Bantuan</span>
          </button>
        </form>
      </Panel>
    </div>
  )
}
