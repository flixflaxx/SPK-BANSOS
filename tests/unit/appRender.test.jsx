import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { App } from '../../src/App.jsx'
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary.jsx'
import { DesilView } from '../../src/features/residents/DesilView.jsx'
import { CriteriaView } from '../../src/features/criteria/CriteriaView.jsx'
import { QuotaView } from '../../src/features/decisions/QuotaView.jsx'
import { Topbar } from '../../src/components/layout/Topbar.jsx'
import { LoginView } from '../../src/features/auth/LoginView.jsx'
import { ResidentsView } from '../../src/features/residents/ResidentsView.jsx'
import { ReportsView } from '../../src/features/reports/ReportsView.jsx'
import { DEMO_RESIDENTS, DEMO_USERS, DEMO_PERIODS, createDemoCalculationRun } from '../../src/services/mockData.js'

describe('App Smoke Test & Rendering Safety', () => {
  it('renders root App on login page initially when not logged in', () => {
    const html = renderToString(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
    expect(html).toContain('Bantuan Sosial Kampung Bulak Amah')
    expect(html).toContain('Selamat Datang')
    expect(html).toContain('Masuk ke Aplikasi')
    expect(html).toContain('Username')
    expect(html).toContain('Kata Sandi')
    expect(html.length).toBeGreaterThan(1000)
  })

  it('renders AppShell and Dashboard when session is logged in', () => {
    // Simulate active session in global sessionStorage
    const originalSessionStorage = globalThis.sessionStorage
    globalThis.sessionStorage = {
      getItem: (key) => {
        if (key === 'spk_is_logged_in_v1') return 'true'
        if (key === 'spk_auth_user_v1') return JSON.stringify(DEMO_USERS[0])
        return null
      },
      setItem: () => {},
      removeItem: () => {},
    }

    try {
      const html = renderToString(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      )
      expect(html).toContain('Bansos Bulak Amah')
      expect(html).toContain('Dashboard')
      expect(html).toContain('Bambang Irawan')
    } finally {
      globalThis.sessionStorage = originalSessionStorage
    }
  })

  it('verifies Topbar has user profile chip and NO in-app role switcher dropdown', () => {
    const html = renderToString(
      <Topbar
        activePeriod={DEMO_PERIODS[0]}
        currentUser={DEMO_USERS[0]}
        onSearchClick={() => {}}
        onLogoutClick={() => {}}
        onToggleMobileMenu={() => {}}
      />
    )
    expect(html).toContain('Bambang Irawan')
    expect(html).toContain('SUPER ADMIN')
    expect(html).toContain('Keluar')
    expect(html).not.toContain('id="user-switcher"')
    expect(html).not.toContain('<select')
  })

  it('verifies LoginView renders username and password fields', () => {
    const html = renderToString(<LoginView onLoginSuccess={() => {}} />)
    expect(html).toContain('Username')
    expect(html).toContain('Kata Sandi')
    expect(html).toContain('Masuk ke Aplikasi')
  })

  it('verifies ResidentsView displays Desil DTKS column and modal selection', () => {
    const html = renderToString(<ResidentsView residents={DEMO_RESIDENTS} onAddResident={() => {}} />)
    expect(html).toContain('Desil DTKS')
    expect(html).toContain('Desil 1')
    expect(html).toContain('Desil 2')
    expect(html).toContain('Tambah Data Warga')
  })

  it('verifies DesilView renders DTKS statistics and resident integration table', () => {
    const html = renderToString(
      <DesilView residents={DEMO_RESIDENTS} onUpdateResidentDesil={() => {}} />
    )
    expect(html).toContain('Tingkat Desil Kesejahteraan Warga (DTKS)')
    expect(html).toContain('DESIL 1 &amp; 2 (PRIORITAS UTAMA)')
    expect(html).toContain('TERDAFTAR DI DTKS')
    expect(html).toContain('Sinkronisasi DTKS Kemensos')
    expect(html).toContain('Ubah Desil')
  })

  it('verifies CriteriaView renders C6 Desil DTKS and Tambah Kriteria button', () => {
    const html = renderToString(<CriteriaView />)
    expect(html).toContain('C6')
    expect(html).toContain('Tingkat Desil Kesejahteraan DTKS')
    expect(html).toContain('Tambah Kriteria')
    expect(html).toContain('Normalisasi Bobot (100%)')
  })

  it('verifies QuotaView renders Sembako, PKH, and PBI-JK breakdown', () => {
    const html = renderToString(
      <QuotaView
        activePeriod={DEMO_PERIODS[0]}
        calculationRun={null}
        decisions={[]}
        onUpdateQuota={() => {}}
      />
    )
    expect(html).toContain('BANTUAN SEMBAKO (BPNT)')
    expect(html).toContain('PROGRAM PKH (KELUARGA HARAPAN)')
    expect(html).toContain('BANTUAN PBI-JK (BPJS KIS)')
    expect(html).toContain('TOTAL SELURUH BANTUAN')
    expect(html).toContain('Simpan Alokasi Kuota Bantuan')
  })

  it('verifies ReportsView renders official letter with Kop Surat and signatures of RT, RW, and Auditor', () => {
    const demoRun = createDemoCalculationRun()
    const html = renderToString(
      <ReportsView
        calculationRun={demoRun}
        activePeriod={DEMO_PERIODS[0]}
        residents={DEMO_RESIDENTS}
        candidates={[]}
        decisions={[]}
      />
    )
    // Official Letterhead and Decree Number
    expect(html).toContain('Pemerintah Kabupaten Bekasi')
    expect(html).toContain('Kecamatan Setu — Rukun Warga 03 Kampung Bulak Amah')
    expect(html).toContain('BERITA ACARA PENETAPAN HASIL SELEKSI BANTUAN SOSIAL')
    expect(html).toContain('400.9.1 / 088 / BA-SPK / X / 2026')

    // Signatures for RT, RW, and Auditor
    expect(html).toContain('Ketua RT 01 / RT 02')
    expect(html).toContain('KUSNADI SUDRAJAT')
    expect(html).toContain('Ketua RW 03 Bulak Amah')
    expect(html).toContain('H. AHMAD SUBARKAH')
    expect(html).toContain('Auditor Independen SPK')
    expect(html).toContain('RINA KUSUMA, S.Ak., CFrA')

    // Aid program breakdown in letter
    expect(html).toContain('1. Sembako (BPNT)')
    expect(html).toContain('2. PKH')
    expect(html).toContain('3. PBI-JK')
  })
})

