import { useState, useEffect } from 'react'
import { DemoBanner } from '../common/DemoBanner.jsx'
import { SidebarNav } from './SidebarNav.jsx'
import { Topbar } from './Topbar.jsx'

export function AppShell({
  activeView,
  onViewChange,
  activePeriod,
  currentUser,
  onLogoutClick,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('spk_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  // Sync isCollapsed ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spk_sidebar_collapsed', String(isCollapsed))
    } catch {
      // Ignore in private browsing
    }
  }, [isCollapsed])

  return (
    <div className="fintech-shell-wrapper">
      <DemoBanner />
      <div className="fintech-app-surface">
        <SidebarNav
          activeView={activeView}
          onViewChange={onViewChange}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
        <div className="fintech-main-panel">
          <Topbar
            activePeriod={activePeriod}
            currentUser={currentUser}
            onSearchClick={() => onViewChange('search')}
            onLogoutClick={onLogoutClick}
            onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
            isCollapsed={isCollapsed}
          />
          <main
            key={activeView}
            className="fintech-main-scroll page-enter-content app-main-content"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
