import { Menu, Search, Bell, LogOut } from 'lucide-react'

export function Topbar({
  activePeriod,
  currentUser,
  onSearchClick,
  onLogoutClick,
  onToggleMobileMenu,
}) {
  const initials = (currentUser?.displayName || 'U').slice(0, 2).toUpperCase()
  const userName = currentUser?.displayName?.split('(')[0]?.trim() || 'Pengguna'
  const userRole = currentUser?.role?.replace('_', ' ') || 'USER'

  return (
    <header className="fintech-topbar app-topbar">
      {/* Sisi Kiri: Hamburger Menu Mobile, Branding & Periode Info */}
      <div className="fintech-topbar-left">
        {/* Tombol Hamburger Mobile */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Buka menu navigasi"
          className="fintech-icon-btn mobile-menu-btn"
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb Branding */}
        <div className="fintech-breadcrumb">
          <span className="fintech-breadcrumb-brand fintech-topbar-brand">
            SPK Bansos Bulak Amah
          </span>
          <span className="fintech-breadcrumb-sep">/</span>
          <span className="fintech-breadcrumb-view">Dashboard</span>
        </div>

        {/* Badge Periode Aktif */}
        <div className="fintech-period-pill topbar-period-badge">
          <span className="fintech-status-dot" aria-hidden="true" />
          <span style={{ fontWeight: 700 }}>
            {activePeriod?.name || 'Periode Aktif 2026-Q1'}
          </span>
          <span
            className="topbar-period-subtext"
            style={{
              color: 'var(--fintech-text-secondary)',
              fontSize: '11px',
              paddingLeft: '4px',
              borderLeft: '1px solid var(--fintech-border)',
            }}
          >
            Pagu: {activePeriod?.quota ?? 0} Kuota
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Search, Notifikasi, Profil, Logout */}
      <div className="fintech-topbar-right topbar-actions-group">
        {/* Tombol Pencarian Data */}
        <button
          type="button"
          onClick={onSearchClick}
          title="Pencarian terpadu data warga, calon, dan audit"
          className="fintech-search-btn"
        >
          <Search size={15} style={{ color: 'var(--fintech-primary)' }} aria-hidden="true" />
          <span className="topbar-search-text">Cari data...</span>
          <span className="fintech-kbd">⌘K</span>
        </button>

        {/* Tombol Notifikasi */}
        <button
          type="button"
          className="fintech-icon-btn"
          title="Notifikasi sistem SPK Bansos"
          aria-label="Notifikasi sistem"
        >
          <Bell size={16} />
          <span className="fintech-notif-dot" aria-hidden="true" />
        </button>

        {/* Chip Profil Pengguna */}
        <div
          className="fintech-profile-chip topbar-profile-chip"
          title={`Masuk sebagai: ${currentUser?.displayName} (${currentUser?.role})`}
        >
          <div className="fintech-user-avatar">
            {initials}
          </div>
          <div className="fintech-user-info">
            <span className="fintech-user-name">
              {userName}
            </span>
            <span className="fintech-role-tag topbar-role-label">
              {userRole}
            </span>
          </div>
        </div>

        {/* Tombol Keluar */}
        <button
          type="button"
          onClick={onLogoutClick}
          title="Keluar dari sesi akun"
          className="fintech-logout-btn topbar-btn-logout"
        >
          <LogOut size={14} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  )
}
