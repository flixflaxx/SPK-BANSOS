import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, maxWidth = '560px' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.classList.add('scroll-locked')
      document.documentElement.classList.add('scroll-locked')
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.classList.remove('scroll-locked')
      document.documentElement.classList.remove('scroll-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 41, 31, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="fintech-alert-popup modal-dialog"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '20px',
          border: '1px solid var(--fintech-border, #EDF0EE)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.16)',
          padding: 0,
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--fintech-border, #EDF0EE)',
          }}
        >
          <h2
            id="modal-title"
            style={{
              fontSize: '17px',
              fontWeight: '800',
              color: 'var(--fintech-text-primary, #172B25)',
              fontFamily: "var(--font-heading, 'Manrope Variable', sans-serif)",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#F4F6F5',
              border: '1px solid var(--fintech-border, #EDF0EE)',
              color: 'var(--fintech-text-secondary, #84918B)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E8ECE9'
              e.currentTarget.style.color = 'var(--fintech-text-primary, #172B25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F6F5'
              e.currentTarget.style.color = 'var(--fintech-text-secondary, #84918B)'
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            padding: '22px 24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 70px)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body)
  }
  return modalNode
}
