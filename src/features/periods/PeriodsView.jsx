import { useEffect, useRef } from 'react'
import { Calendar, Layers, Target, CheckCircle2 } from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'

export function PeriodsView({ periods, activePeriod, onSelectPeriod }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.period-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
    }
  }, [])

  const totalQuotaAll = periods.reduce((sum, p) => sum + (p.quota || 0), 0)

  const columns = [
    {
      key: 'name',
      label: 'Nama Periode Seleksi',
      width: '32%',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: <code>{row.id}</code></div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status Periode',
      width: '15%',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'quota',
      label: 'Pagu & Program Bantuan',
      width: '22%',
      render: (val, row) => {
        const bd = row.quotaBreakdown || { sembako: 1, pkh: 1, pbijk: 1 }
        return (
          <div>
            <span className="clay-badge" style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--color-green-700)', backgroundColor: '#edf8f3', padding: '3px 10px', fontSize: '12.5px' }}>
              Total: {val} Calon
            </span>
            <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <span className="clay-badge" style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: '#ffffff', color: 'var(--color-green-800)' }}>
                Sembako: {bd.sembako ?? 1}
              </span>
              <span className="clay-badge" style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: '#ffffff', color: '#0284c7' }}>
                PKH: {bd.pkh ?? 1}
              </span>
              <span className="clay-badge" style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: '#ffffff', color: '#9333ea' }}>
                PBI-JK: {bd.pbijk ?? 1}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'dates',
      label: 'Rentang Pelaksanaan',
      width: '23%',
      render: (_, row) => (
        <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
          {new Date(row.startDate).toLocaleDateString('id-ID')} s.d.{' '}
          {new Date(row.endDate).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '16%',
      render: (_, row) => {
        const isCurrent = row.id === activePeriod?.id
        return (
          <button
            type="button"
            disabled={isCurrent}
            onClick={() => onSelectPeriod(row)}
            className={isCurrent ? 'clay-badge' : 'clay-btn'}
            style={{
              fontSize: '12px',
              padding: isCurrent ? '6px 14px' : '7px 16px',
              backgroundColor: isCurrent ? '#edf8f3' : undefined,
              color: isCurrent ? 'var(--color-green-700)' : '#ffffff',
              cursor: isCurrent ? 'default' : 'pointer',
            }}
          >
            {isCurrent ? (
              <>
                <CheckCircle2 size={14} />
                <span>Sedang Aktif</span>
              </>
            ) : (
              <span>Pilih Periode</span>
            )}
          </button>
        )
      },
    },
  ]

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={8}
        title="Periode Seleksi"
        description="Pengaturan siklus periode seleksi bantuan sosial dan kuota penerima."
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
          className="period-stat-card clay-card"
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
                PERIODE TERPILIH
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '8px', lineHeight: 1.1 }}>
              {activePeriod?.name || 'Belum Dipilih'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Pagu: {activePeriod?.quota} Calon Penerima
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
            <Calendar size={22} />
          </div>
        </div>

        <div
          className="period-stat-card clay-card"
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
              TOTAL SIKLUS TERDAFTAR
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {periods.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Periode</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Siklus penyaluran bansos desa
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
            <Layers size={22} />
          </div>
        </div>

        <div
          className="period-stat-card clay-card"
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
              AKUMULASI PAGU KUOTA
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '6px', lineHeight: 1.1 }}>
              {totalQuotaAll} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Total seluruh periode tersimpan
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
            <Target size={22} />
          </div>
        </div>
      </div>

      <Panel title="Daftar Periode Penyaluran Bantuan Sosial">
        <DataTable columns={columns} data={periods} />
      </Panel>
    </div>
  )
}
