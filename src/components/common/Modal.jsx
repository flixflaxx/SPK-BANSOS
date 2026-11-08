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
        backgroundColor: 'rgba(9, 41, 31, 0.52)',
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
        className="clay-card modal-dialog"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '28px',
          border: 'none',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '20px 26px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#edf8f3',
          }}
        >
          <h2
            id="modal-title"
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: 'var(--color-green-950)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela modal"
            className="clay-bubble"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body)
  }

  return modalNode
}
