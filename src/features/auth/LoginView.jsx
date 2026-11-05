import { useState } from 'react'
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { DEMO_USERS } from '../../services/mockData.js'
import './LoginView.css'

export function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmedUsername = username.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedUsername) {
      setError('Silakan masukkan username atau email.')
      return
    }
    if (!trimmedPassword) {
      setError('Silakan masukkan kata sandi.')
      return
    }

    // Cari akun di daftar data dummy DEMO_USERS
    const user = DEMO_USERS.find((u) => {
      const email = u.email.toLowerCase()
      const prefix = email.split('@')[0]
      return (
        email === trimmedUsername ||
        prefix === trimmedUsername ||
        u.id.toLowerCase() === trimmedUsername
      )
    })

    if (!user) {
      setError('Username atau email tidak terdaftar pada akun demo.')
      return
    }

    if (trimmedPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.')
      return
    }

    setError('')
    setIsSubmitting(true)

    // Smooth transition feedback
    setTimeout(() => {
      onLoginSuccess(user)
    }, 350)
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-bg-ambient" aria-hidden="true" />

      <div className="login-split-card">
        {/* =========================================================
            LEFT BRANDING PANEL
            ========================================================= */}
        <section className="login-branding-panel" aria-label="Branding SPK Bansos">
          {/* Subtle background decorative shapes */}
          <div className="login-deco-ring" aria-hidden="true">
            <div className="login-deco-ring-inner" />
          </div>
          <div className="login-deco-glow" aria-hidden="true" />

          {/* Organic Wave Divider - Desktop (Vertical, Right Edge) */}
          <svg
            className="login-wave-desktop"
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Layer 1: Deep translucent emerald accent */}
            <path
              d="M100 0 L15 0 C-5 90, 45 170, 10 260 C-20 350, 40 440, 5 530 C-25 620, 35 710, 20 800 L100 800 Z"
              fill="rgba(16, 163, 127, 0.28)"
            />
            {/* Layer 2: Middle soft mint wave */}
            <path
              d="M100 0 L32 0 C8 90, 60 170, 28 260 C-4 350, 56 440, 22 530 C-8 620, 52 710, 38 800 L100 800 Z"
              fill="#E8F5EF"
              fillOpacity="0.75"
            />
            {/* Layer 3: Solid white foreground wave merging into form panel */}
            <path
              d="M100 0 L52 0 C28 90, 78 170, 48 260 C18 350, 74 440, 42 530 C12 620, 70 710, 56 800 L100 800 Z"
              fill="#FFFFFF"
            />
          </svg>

          {/* Organic Wave Divider - Mobile (Horizontal, Bottom Edge) */}
          <svg
            className="login-wave-mobile"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Layer 1: Deep translucent emerald accent */}
            <path
              d="M0 100 L0 15 C90 -5, 170 45, 260 10 C350 -20, 440 40, 530 5 C620 -25, 710 35, 800 20 L800 100 Z"
              fill="rgba(16, 163, 127, 0.28)"
            />
            {/* Layer 2: Middle soft mint wave */}
            <path
              d="M0 100 L0 32 C90 8, 170 60, 260 28 C350 -4, 440 56, 530 22 C620 -8, 710 52, 800 38 L800 100 Z"
              fill="#E8F5EF"
              fillOpacity="0.75"
            />
            {/* Layer 3: Solid white foreground wave merging into form panel */}
            <path
              d="M0 100 L0 52 C90 28, 170 78, 260 48 C350 18, 440 74, 530 42 C620 12, 710 70, 800 56 L800 100 Z"
              fill="#FFFFFF"
            />
          </svg>

          {/* Panel Content */}
          <div className="login-branding-content">
            <div className="login-branding-top">
              <span className="login-brand-tag">
                <Sparkles size={12} />
                Portal Resmi Bantuan Sosial
              </span>
            </div>

            <div className="login-branding-center">
              {/* Emblem / Logo Badge */}
              <div className="login-emblem-badge" aria-label="Logo SPK Bansos">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="18" cy="18" r="16" fill="#E8F5EF" />
                  <path
                    d="M18 7L27 12V18C27 23.5 23.2 28.6 18 30C12.8 28.6 9 23.5 9 18V12L18 7Z"
                    fill="url(#emblem-grad)"
                  />
                  <path
                    d="M14.5 18L17 20.5L22 15.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="emblem-grad" x1="9" y1="7" x2="27" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#087A59" />
                      <stop offset="1" stopColor="#064E3B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h1 className="login-heading">Sistem Pendukung Keputusan</h1>
              <p className="login-subheading-branding">Bantuan Sosial Kampung Bulak Amah</p>

              <p className="login-description">
                Sistem pendukung keputusan untuk membantu proses penentuan penerima bantuan sosial secara objektif, transparan, dan tepat sasaran.
              </p>

              {/* Pelayanan masyarakat feature pills */}
              <div className="login-feature-pills">
                <span className="login-pill">
                  <CheckCircle2 size={12} />
                  Metode SAW Akurat
                </span>
                <span className="login-pill">
                  <Users size={12} />
                  Penerima Tepat Sasaran
                </span>
                <span className="login-pill">
                  <ShieldCheck size={12} />
                  Audit Trail Transparan
                </span>
              </div>
            </div>

            <div className="login-branding-footer">
              <span>Kampung Bulak Amah • Metode SAW</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT LOGIN PANEL
            ========================================================= */}
        <section className="login-form-panel" aria-label="Form Login">
          <div className="login-form-content">
            <header className="login-form-header">
              <h2 className="login-form-title">Selamat Datang</h2>
              <p className="login-form-subtitle">
                Silakan masuk untuk melanjutkan ke aplikasi SPK Bansos.
              </p>
            </header>

            {/* Error Message Banner */}
            {error && (
              <div className="login-error-banner" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Field 1: Username / Email */}
              <div className="login-field-group">
                <div className="login-label-row">
                  <label htmlFor="username" className="login-field-label">
                    Username / Email
                  </label>
                </div>

                <div className="login-input-wrapper">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="Masukkan username atau email..."
                    className="login-input"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Field 2: Kata Sandi */}
              <div className="login-field-group">
                <div className="login-label-row">
                  <label htmlFor="password" className="login-field-label">
                    Kata Sandi
                  </label>
                </div>

                <div className="login-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="Masukkan kata sandi..."
                    className="login-input has-toggle"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <p className="login-helper-note">
                  <span>ℹ️ Minimal 6 karakter kata sandi</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="login-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Masuk ke Aplikasi</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form Footer */}
          <footer className="login-form-footer">
            <p>© 2026 Sistem Pendukung Keputusan Bansos</p>
          </footer>
        </section>
      </div>
    </div>
  )
}
