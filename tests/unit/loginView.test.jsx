import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { LoginView } from '../../src/features/auth/LoginView.jsx'
import { DEMO_USERS } from '../../src/services/mockData.js'

describe('LoginView Component Tests', () => {
  it('renders split panel structure with branding and form panels', () => {
    const html = renderToString(<LoginView onLoginSuccess={() => {}} />)

    // Structural elements
    expect(html).toContain('login-split-card')
    expect(html).toContain('login-branding-panel')
    expect(html).toContain('login-form-panel')

    // Organic Wave Divider SVGs
    expect(html).toContain('login-wave-desktop')
    expect(html).toContain('login-wave-mobile')
  })

  it('renders branding panel content matching specification', () => {
    const html = renderToString(<LoginView onLoginSuccess={() => {}} />)

    expect(html).toContain('Sistem Pendukung Keputusan')
    expect(html).toContain('Bantuan Sosial Kampung Bulak Amah')
    expect(html).toContain(
      'Sistem pendukung keputusan untuk membantu proses penentuan penerima bantuan sosial secara objektif, transparan, dan tepat sasaran.'
    )
    expect(html).toContain('Kampung Bulak Amah • Metode SAW')
    expect(html).toContain('Metode SAW Akurat')
  })

  it('renders login form panel with username, password, and submit button', () => {
    const html = renderToString(<LoginView onLoginSuccess={() => {}} />)

    expect(html).toContain('Selamat Datang')
    expect(html).toContain('Silakan masuk untuk melanjutkan ke aplikasi SPK Bansos.')
    expect(html).toContain('Username')
    expect(html).toContain('Kata Sandi')
    expect(html).toContain('Masuk ke Aplikasi')
    expect(html).toContain('© 2026 Sistem Pendukung Keputusan Bansos')
    // Verification that old dropdown is removed
    expect(html).not.toContain('Pilih Akun Pengguna')
  })

  it('does not render quick-access demo chips (clean manual form)', () => {
    const html = renderToString(<LoginView onLoginSuccess={() => {}} />)

    expect(html).not.toContain('Akun Demo Cepat')
    expect(html).not.toContain('login-demo-chip')
  })
})
