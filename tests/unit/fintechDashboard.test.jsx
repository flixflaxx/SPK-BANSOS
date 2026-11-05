import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DashboardView } from '../../src/features/dashboard/DashboardView.jsx'
import { AppShell } from '../../src/components/layout/AppShell.jsx'
import { Topbar } from '../../src/components/layout/Topbar.jsx'
import { SidebarNav } from '../../src/components/layout/SidebarNav.jsx'
import {
  DEMO_USERS,
  DEMO_PERIODS,
  DEMO_RESIDENTS,
  DEMO_CANDIDATES,
  DEMO_AUDIT_LOGS,
  createDemoCalculationRun,
} from '../../src/services/mockData.js'

describe('Modern Fintech Dashboard Redesign Tests', () => {
  const calculationRun = createDemoCalculationRun()

  it('renders modern fintech greeting and primary SAW calculation action', () => {
    const html = renderToString(
      <DashboardView
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={DEMO_CANDIDATES}
        calculationRun={calculationRun}
        auditLogs={DEMO_AUDIT_LOGS}
        onNavigate={() => {}}
      />
    )

    expect(html).toContain('Selamat Datang, Admin')
    expect(html).toContain('Kelola data warga, verifikasi calon penerima, dan pantau hasil perhitungan bantuan sosial.')
    expect(html).toContain('Jalankan Hitung SAW')
  })

  it('renders all four KPI analytical cards with actual domain data', () => {
    const html = renderToString(
      <DashboardView
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={DEMO_CANDIDATES}
        calculationRun={calculationRun}
        auditLogs={DEMO_AUDIT_LOGS}
        onNavigate={() => {}}
      />
    )

    // Card 1
    expect(html).toContain('Total Data Warga')
    expect(html).toContain(String(DEMO_RESIDENTS.length))

    // Card 2
    expect(html).toContain('Calon Terverifikasi')

    // Card 3
    expect(html).toContain('Pagu Kuota Bantuan')

    // Card 4
    expect(html).toContain('Status Run SAW')
    expect(html).toContain('Siap')
  })

  it('renders SAW ranking section with preference values and eligibility statuses', () => {
    const html = renderToString(
      <DashboardView
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={DEMO_CANDIDATES}
        calculationRun={calculationRun}
        auditLogs={DEMO_AUDIT_LOGS}
        onNavigate={() => {}}
      />
    )

    expect(html).toContain('Peringkat Penerima Bantuan')
    expect(html).toContain('Hasil perhitungan nilai preferensi menggunakan metode SAW.')
    expect(html).toContain('Lihat Semua')
    expect(html).toContain('Dalam Kuota')
    expect(html).toContain('V =')
  })

  it('renders verification distribution analytics with legend and quota breakdown', () => {
    const html = renderToString(
      <DashboardView
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={DEMO_CANDIDATES}
        calculationRun={calculationRun}
        auditLogs={DEMO_AUDIT_LOGS}
        onNavigate={() => {}}
      />
    )

    expect(html).toContain('Distribusi Status Verifikasi')
    expect(html).toContain('Terverifikasi')
    expect(html).toContain('Menunggu Antrean')
    expect(html).toContain('Warga Lainnya')
    expect(html).toContain('Alokasi Kuota')
    expect(html).toContain('Bantuan Sembako (BPNT)')
    expect(html).toContain('Program Keluarga Harapan (PKH)')
    expect(html).toContain('Bantuan PBI-JK (BPJS KIS)')
  })

  it('renders recent audit activity timeline', () => {
    const html = renderToString(
      <DashboardView
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={DEMO_CANDIDATES}
        calculationRun={calculationRun}
        auditLogs={DEMO_AUDIT_LOGS}
        onNavigate={() => {}}
      />
    )

    expect(html).toContain('Aktivitas Audit Terbaru')
    expect(html).toContain('Jejak aktivitas pencatatan sistem')
    expect(html).toContain('Log Lengkap')
  })

  it('renders fintech application shell with navigation rail and topbar', () => {
    const html = renderToString(
      <AppShell
        activeView="dashboard"
        onViewChange={() => {}}
        activePeriod={DEMO_PERIODS[0]}
        currentUser={DEMO_USERS[0]}
        onLogoutClick={() => {}}
      >
        <div>Content</div>
      </AppShell>
    )

    expect(html).toContain('fintech-shell-wrapper')
    expect(html).toContain('fintech-app-surface')
    expect(html).toContain('fintech-sidebar')
    expect(html).toContain('fintech-topbar')
    expect(html).toContain('Bansos Bulak Amah')
    expect(html).toContain('Bambang Irawan')
    expect(html).toContain('SUPER ADMIN')
  })
})

