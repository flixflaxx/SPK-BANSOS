import { useState, useEffect, useRef } from 'react'
import {
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { NAVIGATION_GROUPS } from '../../app/navigation.js'

export function SidebarNav({
  activeView,
  onViewChange,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) {
  // Manual accordion toggle state for expanded mode: groupId -> boolean
  const [manualToggles, setManualToggles] = useState({})

  // Find parent group of currently active view
  const activeParent = NAVIGATION_GROUPS.find((group) =>
    group.items.some((item) => item.id === activeView)
  )

  function isGroupOpen(groupId) {
    if (groupId in manualToggles) {
      return manualToggles[groupId]
    }
    return activeParent?.id === groupId
  }

  function handleToggleGroup(groupId) {
    setManualToggles((prev) => ({
      ...prev,
      [groupId]: !isGroupOpen(groupId),
    }))
  }

  // Popover state for collapsed rail mode: { group, top } | null
  const [flyoutMenu, setFlyoutMenu] = useState(null)
  const asideRef = useRef(null)

  // Keyboard escape listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (isOpen && onClose) onClose()
        setFlyoutMenu(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Click outside listener for flyout popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (flyoutMenu && !e.target.closest('.fintech-flyout-popover') && !e.target.closest('.fintech-nav-item')) {
        setFlyoutMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [flyoutMenu])

  function handleItemClick(itemId) {
    onViewChange(itemId)
    setFlyoutMenu(null)
    if (onClose) onClose()
  }

  function handleGroupClick(group, e) {
    if (group.single) {
      handleItemClick(group.items[0].id)
      return
    }

    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect()
      if (flyoutMenu?.group.id === group.id) {
        setFlyoutMenu(null)
      } else {
        setFlyoutMenu({
          group,
          top: Math.max(12, Math.min(rect.top, window.innerHeight - 320)),
        })
      }
    } else {
      handleToggleGroup(group.id)
    }
  }

  function handleMouseEnterGroup(group, e) {
    if (!isCollapsed || group.single) return
    const rect = e.currentTarget.getBoundingClientRect()
    setFlyoutMenu({
      group,
      top: Math.max(12, Math.min(rect.top, window.innerHeight - 320)),
    })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 43, 37, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 990,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        ref={asideRef}
        className={`fintech-sidebar sidebar-container sidebar-aside-desktop ${
          !isCollapsed ? 'expanded' : ''
        } ${isOpen ? 'drawer-open' : ''}`}
        aria-label="Navigasi Utama"
      >
        {/* Sidebar Header with Brand Logo */}
        <div className="fintech-sidebar-header">
          <div
            className="fintech-brand-logo"
            onClick={() => handleItemClick('dashboard')}
            title="Ke Dashboard Utama"
          >
            SPK
          </div>

          <div
            className="fintech-brand-meta"
            style={{ display: isCollapsed ? 'none' : 'flex' }}
          >
            <h2 className="fintech-brand-title">Bansos Bulak Amah</h2>
            <span className="fintech-brand-sub">Metode SAW • v0.1.0</span>
          </div>

          {/* Close button on Mobile Drawer */}
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu navigasi"
              className="drawer-close-btn"
              style={{
                display: 'none',
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: 'var(--fintech-text-secondary)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="fintech-sidebar-nav">
          {NAVIGATION_GROUPS.map((group) => {
            const GroupIcon = group.icon
            const isGroupActive = group.items.some((item) => item.id === activeView)
            const isOpenAccordion = isGroupOpen(group.id)

            return (
              <div key={group.id} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className={`fintech-nav-item ${isGroupActive ? 'is-active' : ''}`}
                  onClick={(e) => handleGroupClick(group, e)}
                  onMouseEnter={(e) => handleMouseEnterGroup(group, e)}
                  title={group.title}
                  aria-expanded={!isCollapsed && !group.single ? isOpenAccordion : undefined}
                >
                  {isGroupActive && <div className="fintech-nav-active-bar" />}
                  <GroupIcon size={19} style={{ flexShrink: 0 }} />

                  {!isCollapsed && (
                    <>
                      <span className="fintech-nav-label" style={{ flex: 1, textAlign: 'left' }}>
                        {group.title}
                      </span>
                      {!group.single && (
                        <ChevronRight
                          size={14}
                          style={{
                            color: isGroupActive ? 'var(--fintech-primary)' : 'var(--fintech-text-secondary)',
                            transform: isOpenAccordion ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Tooltip in collapsed mode */}
                  {isCollapsed && (
                    <div className="fintech-tooltip">
                      {group.title}
                    </div>
                  )}
                </button>

                {/* Expanded Accordion Submenu (Desktop Expanded & Mobile) */}
                {!isCollapsed && !group.single && isOpenAccordion && (
                  <div
                    style={{
                      paddingLeft: '32px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {group.items.map((subItem) => {
                      const SubIcon = subItem.icon
                      const isSubActive = subItem.id === activeView
                      return (
                        <button
                          key={subItem.id}
                          type="button"
                          onClick={() => handleItemClick(subItem.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isSubActive ? 'var(--fintech-soft-green)' : 'transparent',
                            color: isSubActive ? 'var(--fintech-primary)' : 'var(--fintech-text-secondary)',
                            fontWeight: isSubActive ? 700 : 500,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                            width: '100%',
                          }}
                        >
                          <SubIcon size={14} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {subItem.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sidebar Footer with Collapse Rail Toggle */}
        <div className="fintech-sidebar-footer">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Perbesar Sidebar' : 'Kecilkan ke Nav Rail'}
              aria-label={isCollapsed ? 'Perbesar Sidebar' : 'Kecilkan ke Nav Rail'}
              className="fintech-collapse-btn desktop-collapse-toggle"
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              {!isCollapsed && (
                <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 600 }}>
                  Kecilkan Menu
                </span>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Flyout Submenu Popover on Rail Mode */}
      {isCollapsed && flyoutMenu && (
        <div
          className="fintech-flyout-popover"
          style={{
            top: `${flyoutMenu.top}px`,
            left: '84px',
          }}
          onMouseLeave={() => setFlyoutMenu(null)}
        >
          <div className="fintech-flyout-title">{flyoutMenu.group.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {flyoutMenu.group.items.map((subItem) => {
              const SubIcon = subItem.icon
              const isSubActive = subItem.id === activeView
              return (
                <div
                  key={subItem.id}
                  className={`fintech-flyout-item ${isSubActive ? 'is-active' : ''}`}
                  onClick={() => handleItemClick(subItem.id)}
                >
                  <SubIcon size={15} />
                  <span>{subItem.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
