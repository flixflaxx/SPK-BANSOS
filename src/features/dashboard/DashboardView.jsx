import { useEffect, useRef } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calculator,
  Calendar,
  CheckCircle2,
  FileCheck,
  Target,
  UserCheck,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react'
import { KpiCard } from '../../components/common/KpiCard.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { formatExact } from '@shared/domain/saw/fraction.js'

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return (name.slice(0, 2) || 'AD').toUpperCase()
}

function getTimelineStyle(action = '') {
  if (action.includes('VERIF') || action.includes('RESIDENT')) {
    return {
      bg: '#E8F5EF',
      color: '#16A36B',
      icon: <UserCheck size={15} />,
    }
  }
  if (action.includes('CALCULATION')) {
    return {
      bg: '#EFF6FF',
      color: '#4386CF',
      icon: <Zap size={15} />,
    }
  }
  if (action.includes('PERIOD') || action.includes('QUOTA')) {
    return {
      bg: '#FEF3C7',
      color: '#EBA12A',
      icon: <Calendar size={15} />,
    }
  }
  if (action.includes('DECISION')) {
    return {
      bg: '#FDF2F2',
      color: '#E34B4B',
      icon: <FileCheck size={15} />,
    }
  }
  return {
    bg: '#F1F3F2',
    color: '#087A59',
    icon: <Activity size={15} />,
  }
}

export function DashboardView({
  activePeriod,
  residents,
  candidates,
  calculationRun,
  auditLogs,
  onNavigate,
}) {
  const chartCanvasRef = useRef(null)

  const verifiedCount = candidates.filter((c) => c.verificationStatus === 'VERIFIED').length
  const pendingCount = candidates.filter((c) => c.verificationStatus === 'PENDING').length
  const otherCount = Math.max(0, residents.length - verifiedCount - pendingCount)
  const totalResidents = Math.max(1, residents.length)
  const quota = activePeriod?.quota ?? 0
  const topRankings = calculationRun?.results?.slice(0, 5) || []

  const verifiedPercent = Math.round((verifiedCount / totalResidents) * 100)
  const pendingPercent = Math.round((pendingCount / totalResidents) * 100)
  const otherPercent = Math.max(0, 100 - verifiedPercent - pendingPercent)

  // Initialize Donut Chart (Chart.js with clean light fintech theme)
  useEffect(() => {
    const Chart = typeof window !== 'undefined' ? window.Chart : null
    if (!Chart || !chartCanvasRef.current) return

    const ctx = chartCanvasRef.current.getContext('2d')
    if (!ctx) return

    const chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Terverifikasi', 'Menunggu Antrean', 'Warga Lainnya'],
        datasets: [
          {
            data: [verifiedCount, pendingCount, otherCount],
            backgroundColor: ['#16A36B', '#EBA12A', '#CBD5E1'],
            hoverBackgroundColor: ['#087A59', '#D97706', '#94A3B8'],
            borderWidth: 0,
            borderRadius: 6,
            spacing: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 900,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#172B25',
            titleFont: { family: "'Manrope Variable', sans-serif", weight: 'bold', size: 12 },
            bodyFont: { family: "'DM Sans Variable', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: (item) => ` ${item.label}: ${item.raw} orang`,
            },
          },
        },
      },
    })

    return () => {
      chartInstance.destroy()
    }
  }, [verifiedCount, pendingCount, otherCount])

  return (
    <div>
      {/* ========================================================
          1. DASHBOARD GREETING
          ======================================================== */}
      <section className="fintech-greeting-section" aria-label="Greeting Dashboard">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="fintech-greeting-title">
              Selamat Datang, Admin
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'var(--fintech-soft-green)',
                color: 'var(--fintech-primary)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <Sparkles size={12} />
              <span>{activePeriod?.name || 'Periode Aktif'} • Aktif</span>
            </span>
          </div>
          <p className="fintech-greeting-sub">
            Kelola data warga, verifikasi calon penerima, dan pantau hasil perhitungan bantuan sosial.
          </p>
        </div>

        <button
          type="button"
          className="fintech-primary-action-btn"
          onClick={() => onNavigate('saw-calc')}
          title="Buka modul kalkulasi SAW"
        >
          <Calculator size={16} />
          <span>Jalankan Hitung SAW</span>
        </button>
      </section>

      {/* ========================================================
          2. KPI ANALYTICS CARDS (4 COMPACT FINTECH CARDS)
          ======================================================== */}
      <section className="fintech-kpi-grid" aria-label="KPI Statistik Utama">
        <KpiCard
          title="Total Data Warga"
          value={residents.length}
          subtitle="Tercatat di basis data lokal"
          icon={<Users size={20} />}
          iconBg="#E8F5EF"
          iconColor="#087A59"
          badge="Database Lokal"
        />
        <KpiCard
          title="Calon Terverifikasi"
          value={verifiedCount}
          subtitle={`${pendingCount} berkas menunggu antrean`}
          icon={<CheckCircle2 size={20} />}
          iconBg="#E8F5EF"
          iconColor="#16A36B"
          badge="Siap Seleksi"
          highlight
          pulseBadge
        />
        <KpiCard
          title="Pagu Kuota Bantuan"
          value={quota}
          subtitle={`Sembako: ${activePeriod?.quotaBreakdown?.sembako ?? 1} · PKH: ${activePeriod?.quotaBreakdown?.pkh ?? 1} · PBI-JK: ${activePeriod?.quotaBreakdown?.pbijk ?? 1}`}
          icon={<Target size={20} />}
          iconBg="#FEF3C7"
          iconColor="#EBA12A"
          badge="3 Program"
        />
        <KpiCard
          title="Status Run SAW"
          value={calculationRun ? 'Siap' : 'Belum'}
          subtitle={calculationRun ? `${calculationRun.results.length} alternatif dihitung` : 'Jalankan kalkulasi'}
          icon={<BarChart3 size={20} />}
          iconBg="#EFF6FF"
          iconColor="#4386CF"
          badge={calculationRun?.status || 'IDLE'}
          pulseBadge={Boolean(calculationRun)}
        />
      </section>

      {/* ========================================================
          3. ANALYTICS CONTENT GRID
             A. SAW Ranking (Left)
             B. Verification Distribution & Quota (Right)
          ======================================================== */}
      <div className="fintech-analytics-grid">
        {/* A. Peringkat Penerima Bantuan (SAW Ranking) */}
        <section className="fintech-card" aria-label="Peringkat Penerima Bantuan">
          <header className="fintech-card-header">
            <div>
              <h2 className="fintech-card-title">Peringkat Penerima Bantuan</h2>
              <p className="fintech-card-sub">
                Hasil perhitungan nilai preferensi menggunakan metode SAW.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('saw-ranking')}
              className="fintech-link-btn"
              title="Lihat semua hasil perankingan"
            >
              <span>Lihat Semua</span>
              <ArrowRight size={13} />
            </button>
          </header>

          {topRankings.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--fintech-text-secondary)',
                fontSize: '13px',
                background: '#FAFBFA',
                borderRadius: '12px',
                border: '1px dashed var(--fintech-border)',
                margin: 'auto 0',
              }}
            >
              <p>Belum ada hasil kalkulasi SAW untuk periode ini.</p>
              <button
                type="button"
                className="fintech-primary-action-btn"
                onClick={() => onNavigate('saw-calc')}
                style={{ marginTop: '14px', padding: '8px 16px', fontSize: '12.5px' }}
              >
                <Calculator size={14} />
                <span>Jalankan Kalkulasi SAW</span>
              </button>
            </div>
          ) : (
            <div className="fintech-ranking-list">
              {topRankings.map((row) => {
                const cand = candidates.find((c) => c.id === row.candidateId)
                const resident = residents.find((r) => r.id === cand?.residentId)
                const isWithinQuota = row.rank <= quota

                // Compute exact decimal value for progress bar
                let valDecimal = 0
                if (row.preference?.exact && typeof row.preference.exact === 'object') {
                  const num = Number(row.preference.exact.num || 0)
                  const den = Number(row.preference.exact.den || 1)
                  valDecimal = den > 0 ? num / den : 0
                } else if (typeof row.preference?.exact === 'number') {
                  valDecimal = row.preference.exact
                } else if (typeof row.preference?.exact === 'string') {
                  const parts = row.preference.exact.split('/')
                  if (parts.length === 2 && Number(parts[1]) > 0) {
                    valDecimal = Number(parts[0]) / Number(parts[1])
                  } else {
                    valDecimal = parseFloat(row.preference.exact) || 0
                  }
                }
                const progressWidthPercent = Math.min(100, Math.max(0, valDecimal * 100)).toFixed(1)

                return (
                  <div key={row.candidateId} className="fintech-ranking-row">
                    <div className="fintech-ranking-top">
                      <div className="fintech-ranking-left">
                        {/* Rank Badge */}
                        <div
                          className={`fintech-rank-badge ${
                            row.rank <= 3 ? 'top-tier' : 'standard-tier'
                          }`}
                        >
                          #{row.rank}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div className="fintech-candidate-name">
                            {resident?.name || row.candidateId}
                          </div>
                          <div className="fintech-candidate-meta">
                            NIK: <code>{resident?.nikMasked || '—'}</code> • RT/RW: {resident?.addressRtRw || '—'}
                          </div>
                        </div>
                      </div>

                      <div className="fintech-ranking-right">
                        <div className="fintech-pref-value">
                          V = {formatExact(row.preference.exact, 4)}
                        </div>
                        <span
                          className={`fintech-status-tag ${
                            isWithinQuota ? 'in-quota' : 'reserve'
                          }`}
                        >
                          {isWithinQuota ? 'Dalam Kuota' : 'Cadangan'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="fintech-progress-track">
                      <div
                        className="fintech-progress-fill"
                        style={{
                          width: `${progressWidthPercent}%`,
                          background: isWithinQuota
                            ? 'linear-gradient(90deg, #087A59 0%, #16A37A 100%)'
                            : 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* B. Distribusi Status Verifikasi & Kuota */}
        <section className="fintech-card" aria-label="Distribusi Status Verifikasi">
          <header className="fintech-card-header">
            <div>
              <h2 className="fintech-card-title">Distribusi Status Verifikasi</h2>
              <p className="fintech-card-sub">
                Total {residents.length} warga tercatat dalam database sistem.
              </p>
            </div>
          </header>

          <div className="fintech-chart-box">
            {/* Donut Chart Canvas */}
            <div className="fintech-donut-wrapper">
              <canvas ref={chartCanvasRef} />
              {/* Central Floating Summary Bubble */}
              <div className="fintech-donut-center">
                <span className="fintech-donut-number">{verifiedCount}</span>
                <span className="fintech-donut-sub">Siap Seleksi</span>
              </div>
            </div>

            {/* Compact Legend Row */}
            <div className="fintech-chart-legend">
              <div className="fintech-legend-row">
                <div className="fintech-legend-left">
                  <span className="fintech-legend-dot" style={{ backgroundColor: '#16A36B' }} />
                  <span>Terverifikasi</span>
                </div>
                <span className="fintech-legend-count">
                  {verifiedCount} warga ({verifiedPercent}%)
                </span>
              </div>

              <div className="fintech-legend-row">
                <div className="fintech-legend-left">
                  <span className="fintech-legend-dot" style={{ backgroundColor: '#EBA12A' }} />
                  <span>Menunggu Antrean</span>
                </div>
                <span className="fintech-legend-count">
                  {pendingCount} calon ({pendingPercent}%)
                </span>
              </div>

              <div className="fintech-legend-row">
                <div className="fintech-legend-left">
                  <span className="fintech-legend-dot" style={{ backgroundColor: '#CBD5E1' }} />
                  <span>Warga Lainnya</span>
                </div>
                <span className="fintech-legend-count">
                  {otherCount} warga ({otherPercent}%)
                </span>
              </div>
            </div>

            {/* Program Quota Mini Breakdown */}
            <div className="fintech-program-breakdown" style={{ width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--fintech-text-secondary)', letterSpacing: '0.4px' }}>
                  Alokasi Kuota ({quota} Penerima)
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fintech-primary)' }}>
                  3 Program
                </span>
              </div>

              <div className="fintech-program-row">
                <div className="fintech-program-header">
                  <span className="fintech-program-name">Bantuan Sembako (BPNT)</span>
                  <span className="fintech-program-quota">{activePeriod?.quotaBreakdown?.sembako ?? 1} kuota</span>
                </div>
                <div className="fintech-progress-track" style={{ marginTop: '2px' }}>
                  <div
                    className="fintech-progress-fill"
                    style={{ width: `${Math.min(100, ((activePeriod?.quotaBreakdown?.sembako ?? 1) / Math.max(1, quota)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="fintech-program-row">
                <div className="fintech-program-header">
                  <span className="fintech-program-name">Program Keluarga Harapan (PKH)</span>
                  <span className="fintech-program-quota">{activePeriod?.quotaBreakdown?.pkh ?? 1} kuota</span>
                </div>
                <div className="fintech-progress-track" style={{ marginTop: '2px' }}>
                  <div
                    className="fintech-progress-fill"
                    style={{
                      width: `${Math.min(100, ((activePeriod?.quotaBreakdown?.pkh ?? 1) / Math.max(1, quota)) * 100)}%`,
                      background: 'linear-gradient(90deg, #EBA12A 0%, #F59E0B 100%)',
                    }}
                  />
                </div>
              </div>

              <div className="fintech-program-row">
                <div className="fintech-program-header">
                  <span className="fintech-program-name">Bantuan PBI-JK (BPJS KIS)</span>
                  <span className="fintech-program-quota">{activePeriod?.quotaBreakdown?.pbijk ?? 1} kuota</span>
                </div>
                <div className="fintech-progress-track" style={{ marginTop: '2px' }}>
                  <div
                    className="fintech-progress-fill"
                    style={{
                      width: `${Math.min(100, ((activePeriod?.quotaBreakdown?.pbijk ?? 1) / Math.max(1, quota)) * 100)}%`,
                      background: 'linear-gradient(90deg, #4386CF 0%, #60A5FA 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================
          4. ADDITIONAL ANALYTICS: AKTIVITAS AUDIT TERBARU
          ======================================================== */}
      <section className="fintech-card" aria-label="Aktivitas Audit Terbaru">
        <header className="fintech-card-header">
          <div>
            <h2 className="fintech-card-title">Aktivitas Audit Terbaru</h2>
            <p className="fintech-card-sub">
              Jejak aktivitas pencatatan sistem (append-only timeline dengan verifikasi aktor).
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('audit')}
            className="fintech-link-btn"
            title="Lihat seluruh riwayat audit"
          >
            <span>Log Lengkap</span>
            <ArrowRight size={13} />
          </button>
        </header>

        <div className="fintech-audit-list">
          {auditLogs.slice(0, 4).map((log) => {
            const style = getTimelineStyle(log.action)
            const initials = getInitials(log.actorName)

            return (
              <div key={log.id} className="fintech-audit-row">
                <div className="fintech-audit-left">
                  <div
                    className="fintech-audit-icon"
                    style={{
                      backgroundColor: style.bg,
                      color: style.color,
                    }}
                  >
                    {style.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div className="fintech-audit-title">
                      <span>{log.action}</span>
                      <StatusBadge status={log.outcome} />
                    </div>
                    <div className="fintech-audit-desc">
                      {log.requestSummary || `${log.targetType} (${log.targetId})`}
                    </div>
                  </div>
                </div>

                <div className="fintech-audit-right">
                  <div className="fintech-audit-actor">
                    <div className="fintech-actor-avatar">{initials}</div>
                    <span>
                      {log.actorName} • <span style={{ textTransform: 'capitalize' }}>{log.role?.toLowerCase() || 'petugas'}</span>
                    </span>
                  </div>

                  <span className="fintech-audit-date">
                    {new Date(log.occurredAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
