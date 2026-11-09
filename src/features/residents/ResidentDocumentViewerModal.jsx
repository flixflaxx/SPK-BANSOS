import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  FolderOpen,
  FileText,
  CreditCard,
  Home,
  Users,
  CheckCircle2,
  Download,
  Eye,
  ShieldCheck,
  Calendar,
  HardDrive,
  ZoomIn,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  getResidentDocuments,
  cleanName,
  cleanNik,
  cleanRt,
} from './residentDocuments.js'
import { getDesilMeta } from './desilConstants.js'

export function ResidentDocumentViewerModal({ isOpen, onClose, resident, onOpenEditProfile }) {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'kk', 'ktp', 'rumah', 'suratRt'
  const [lightboxDoc, setLightboxDoc] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Scroll lock & Escape key listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        if (lightboxDoc) {
          setLightboxDoc(null)
        } else {
          onClose()
        }
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
  }, [isOpen, onClose, lightboxDoc])

  if (!isOpen || !resident) return null

  const documents = getResidentDocuments(resident)
  const desilMeta = getDesilMeta(resident.desil)

  const filteredDocs =
    activeTab === 'all' ? documents : documents.filter((d) => d.key === activeTab)

  function showNotice(msg) {
    setActionNotice(msg)
    setTimeout(() => {
      setActionNotice(null)
    }, 2500)
  }

  function handleSimulateDownload(doc) {
    showNotice(`Mengunduh salinan berkas: ${doc.fileName}...`)
    // Simulasi download file
    const link = document.createElement('a')
    link.href = doc.previewUrl || '#'
    link.download = doc.fileName
    if (doc.previewUrl) {
      link.click()
    }
  }

  function handleSimulatePrint(doc) {
    showNotice(`Mempersiapkan pratinjau cetak untuk ${doc.title}...`)
    window.print ? window.print() : null
  }

  const modalContent = (
    <div
      className="fintech-alert-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-viewer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !lightboxDoc) {
          onClose()
        }
      }}
      style={{
        zIndex: 999999,
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="fintech-alert-popup"
        style={{
          width: 'min(94vw, 860px)',
          maxWidth: '860px',
          maxHeight: 'min(90vh, 90dvh)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '24px',
          margin: 'auto',
          boxShadow: '0 25px 60px rgba(6, 40, 30, 0.35)',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '20px 24px 16px',
            backgroundColor: '#FAFCFB',
            borderBottom: '1px solid var(--fintech-border, #E4EAE6)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            className="fintech-alert-close"
            onClick={onClose}
            title="Tutup (Esc)"
            aria-label="Tutup pratinjau berkas"
            style={{ top: '16px', right: '16px' }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: 'var(--fintech-soft-green, #E8F5EF)',
                color: 'var(--fintech-primary, #087A59)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderOpen size={20} />
            </div>
            <div>
              <h3
                id="doc-viewer-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--fintech-text-primary, #06281E)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Bukti Berkas & Dokumen Warga
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--fintech-text-secondary, #65756E)',
                  margin: 0,
                }}
              >
                Arsip berkas persyaratan verifikasi kelayakan bantuan sosial Bulak Amah
              </p>
            </div>
          </div>

          {/* Resident Profile Strip */}
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--fintech-border, #E4EAE6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-green-950)' }}>
                  {resident.name}
                </span>
                <span
                  style={{
                    marginLeft: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: 'var(--fintech-primary)',
                    fontWeight: 700,
                    backgroundColor: '#edf8f3',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  NIK: {resident.nikMasked}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                RT {resident.addressRtRw} · {resident.addressStreet}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="clay-badge"
                style={{
                  backgroundColor: desilMeta.bg,
                  color: desilMeta.color,
                  border: `1px solid ${desilMeta.border}`,
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {desilMeta.shortLabel}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--fintech-primary)',
                  backgroundColor: '#E8F5EF',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                4 / 4 Berkas Siap
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              overflowX: 'auto',
              paddingBottom: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="doc-tab-btn"
              data-active={activeTab === 'all'}
            >
              Semua Berkas (4)
            </button>
            {documents.map((doc) => (
              <button
                key={doc.key}
                type="button"
                onClick={() => setActiveTab(doc.key)}
                className="doc-tab-btn"
                data-active={activeTab === doc.key}
              >
                {doc.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#E8F5EF',
              borderBottom: '1px solid #C7E6D7',
              color: 'var(--fintech-primary, #087A59)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={14} />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Body Grid of Documents */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#F8FAF9',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                activeTab === 'all'
                  ? 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))'
                  : '1fr',
              gap: '18px',
            }}
          >
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.key}
                doc={doc}
                resident={resident}
                onPreview={() => setLightboxDoc(doc)}
                onDownload={() => handleSimulateDownload(doc)}
                onPrint={() => handleSimulatePrint(doc)}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--fintech-border, #E4EAE6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--color-text-subtle)' }}>
            <ShieldCheck size={14} color="var(--fintech-primary)" />
            <span>Dokumen tersimpan aman dalam arsip terenkripsi sistem SPK Bulak Amah.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenEditProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenEditProfile(resident)
                }}
                className="clay-badge"
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--fintech-primary)',
                  border: '1px solid rgba(8, 122, 89, 0.3)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Edit Profil Warga Ini
              </button>
            )}
            <button
              type="button"
              className="fintech-alert-btn-confirm"
              onClick={onClose}
              style={{ padding: '8px 18px', fontSize: '12.5px' }}
            >
              Tutup Berkas
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom View */}
      {lightboxDoc && (
        <DocumentLightbox
          doc={lightboxDoc}
          resident={resident}
          allDocs={documents}
          onClose={() => setLightboxDoc(null)}
          onSelectDoc={(d) => setLightboxDoc(d)}
        />
      )}
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return modalContent
}

/**
 * Komponen Kartu Dokumen
 */
function DocumentCard({ doc, resident, onPreview, onDownload, onPrint }) {
  return (
    <div
      className="doc-viewer-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #E6ECE8',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Top Header Card */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #F0F4F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: doc.bgColor,
              color: doc.badgeColor,
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '0.4px',
            }}
          >
            {doc.code}
          </div>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: '13.5px',
                fontWeight: 800,
                color: 'var(--color-green-950)',
              }}
            >
              {doc.title}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
              {doc.description}
            </span>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            borderRadius: '9999px',
            backgroundColor: '#E8F5EF',
            color: '#087A59',
            fontSize: '10.5px',
            fontWeight: 800,
          }}
        >
          <CheckCircle2 size={12} />
          {doc.isUploaded ? 'Diunggah' : 'Terverifikasi'}
        </span>
      </div>

      {/* Visual Preview Frame */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#F9FBFA',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '190px',
        }}
      >
        <DocumentVisualPreview doc={doc} resident={resident} />

        {/* Hover / Overlay Button to open Lightbox */}
        <button
          type="button"
          onClick={onPreview}
          title="Buka Pratinjau Penuh"
          style={{
            position: 'absolute',
            bottom: '22px',
            right: '22px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(6, 40, 30, 0.88)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '6px 13px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.15s ease',
          }}
        >
          <Eye size={13} />
          <span>Lihat Penuh</span>
        </button>
      </div>

      {/* File Details Strip */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #F0F4F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-green-950)',
              fontFamily: 'monospace',
            }}
          >
            {doc.fileName}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-subtle)',
              display: 'flex',
              gap: '10px',
              marginTop: '2px',
            }}
          >
            <span>Ukuran: {doc.fileSize}</span>
            <span>•</span>
            <span>Format: {doc.fileName.split('.').pop()?.toUpperCase() || 'PDF'}</span>
            {doc.isUploaded && (
              <>
                <span>•</span>
                <span style={{ color: 'var(--fintech-primary)', fontWeight: 700 }}>Dokumen Baru</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onPrint}
            title="Cetak Salinan"
            className="doc-mini-action-btn"
          >
            <Printer size={13} />
          </button>
          <button
            type="button"
            onClick={onDownload}
            title="Unduh Salinan Dokumen"
            className="doc-mini-action-btn"
          >
            <Download size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Komponen Renderer Tampilan Dokumen Sintetis / Nyata
 */
function DocumentVisualPreview({ doc, resident }) {
  // Jika file foto nyata telah diunggah dan memiliki object URL
  if (doc.previewUrl && (doc.mimeType?.startsWith('image/') || doc.fileName?.match(/\.(jpg|jpeg|png)$/i))) {
    return (
      <div
        style={{
          width: '100%',
          maxHeight: '175px',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #E0E8E3',
          backgroundColor: '#000000',
        }}
      >
        <img
          src={doc.previewUrl}
          alt={doc.title}
          style={{ width: '100%', height: '175px', objectFit: 'cover' }}
        />
      </div>
    )
  }

  // Tampilan Berkas KK (Kartu Keluarga)
  if (doc.key === 'kk') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1.5px solid #2B579A',
          boxShadow: '0 3px 12px rgba(43, 87, 154, 0.1)',
          padding: '12px 14px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* KK Header */}
        <div style={{ textAlign: 'center', borderBottom: '1.5px solid #2B579A', paddingBottom: '6px', marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1px', color: '#1E3A8A' }}>
            REPUBLIK INDONESIA
          </div>
          <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1.5px', color: '#1E3A8A' }}>
            KARTU KELUARGA
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
            No. 320101{cleanNik(resident.nikMasked)}0001
          </div>
        </div>

        {/* KK Fields */}
        <div style={{ fontSize: '9.5px', display: 'grid', gridTemplateColumns: '90px 1fr', gap: '3px 8px', color: '#1E293B' }}>
          <span style={{ fontWeight: 700 }}>Nama KK:</span>
          <span style={{ fontWeight: 800, color: '#0F172A' }}>{resident.name}</span>
          <span style={{ fontWeight: 700 }}>Alamat:</span>
          <span>{resident.addressStreet}</span>
          <span style={{ fontWeight: 700 }}>RT / RW:</span>
          <span>{resident.addressRtRw}</span>
          <span style={{ fontWeight: 700 }}>Desa / Kelurahan:</span>
          <span>Bulak Amah</span>
        </div>

        {/* KK Mini Table Simulation */}
        <div
          style={{
            marginTop: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '4px 6px',
            fontSize: '8.5px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1.5fr 1fr 1fr', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            <span>No</span>
            <span>Nama Anggota</span>
            <span>NIK</span>
            <span>Status</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1.5fr 1fr 1fr', color: '#475569', paddingTop: '3px' }}>
            <span>1</span>
            <span style={{ fontWeight: 700 }}>{cleanName(resident.name)}</span>
            <span style={{ fontFamily: 'monospace' }}>{resident.nikMasked}</span>
            <span>Kepala KK</span>
          </div>
        </div>

        {/* Watermark Stempel */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '10px',
            border: '1.5px solid rgba(8, 122, 89, 0.45)',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-12deg)',
            fontSize: '7px',
            fontWeight: 800,
            color: 'rgba(8, 122, 89, 0.75)',
            textAlign: 'center',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          SAH BULAK AMAH
        </div>
      </div>
    )
  }

  // Tampilan e-KTP
  if (doc.key === 'ktp') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '350px',
          background: 'linear-gradient(135deg, #A7D7E8 0%, #D4EEF7 40%, #A2D2E6 100%)',
          borderRadius: '12px',
          border: '1.5px solid #6BA8C6',
          boxShadow: '0 4px 14px rgba(45, 117, 148, 0.2)',
          padding: '12px 14px',
          position: 'relative',
        }}
      >
        {/* KTP Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(13, 63, 89, 0.3)', paddingBottom: '4px', marginBottom: '6px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#0A3B54', letterSpacing: '0.8px' }}>
            PROVINSI JAWA BARAT
          </div>
          <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#0A3B54', letterSpacing: '0.6px' }}>
            KABUPATEN BOGOR
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#052A3D', letterSpacing: '1px', marginTop: '1px' }}>
            KARTU TANDA PENDUDUK
          </div>
        </div>

        {/* KTP NIK */}
        <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'monospace', color: '#052A3D', marginBottom: '6px' }}>
          NIK : {resident.nikMasked}
        </div>

        {/* KTP Details & Photo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '8.5px', display: 'grid', gridTemplateColumns: '62px 1fr', gap: '2px 4px', color: '#0C3E56' }}>
            <span style={{ fontWeight: 700 }}>Nama</span>
            <span style={{ fontWeight: 800 }}>: {cleanName(resident.name)}</span>
            <span style={{ fontWeight: 700 }}>Alamat</span>
            <span>: {resident.addressStreet}</span>
            <span style={{ fontWeight: 700 }}>RT / RW</span>
            <span>: {resident.addressRtRw}</span>
            <span style={{ fontWeight: 700 }}>Kel / Desa</span>
            <span>: Bulak Amah</span>
            <span style={{ fontWeight: 700 }}>Agama</span>
            <span>: Islam</span>
            <span style={{ fontWeight: 700 }}>Masa Berlaku</span>
            <span style={{ fontWeight: 800 }}>: SEUMUR HIDUP</span>
          </div>

          {/* Photo Frame Mockup */}
          <div
            style={{
              width: '64px',
              height: '80px',
              backgroundColor: '#3B82F6',
              borderRadius: '6px',
              border: '1.5px solid #FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                marginBottom: '4px',
              }}
            />
            <div
              style={{
                width: '42px',
                height: '24px',
                borderRadius: '12px 12px 0 0',
                backgroundColor: '#EFF6FF',
              }}
            />
            <span style={{ position: 'absolute', bottom: '2px', fontSize: '6px', color: '#FFFFFF', fontWeight: 800 }}>
              PAS FOTO
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan Foto Kondisi Rumah
  if (doc.key === 'rumah') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '350px',
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          border: '1.5px solid #334155',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Simulated Photographic Canvas */}
        <div
          style={{
            height: '115px',
            background: 'linear-gradient(180deg, #475569 0%, #334155 45%, #1E293B 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* House Graphic Silhouette */}
          <div style={{ textAlign: 'center', color: '#94A3B8' }}>
            <Home size={42} strokeWidth={1.5} color="#E2E8F0" />
            <div style={{ fontSize: '9.5px', color: '#CBD5E1', marginTop: '4px', fontWeight: 700 }}>
              Dokumentasi Fisik Rumah Warga
            </div>
          </div>

          {/* Watermark Geotag GPS */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              color: '#34D399',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '8px',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            GPS: -6.2891, 106.8421 • RT {resident.addressRtRw}
          </div>
        </div>

        {/* Survey Metadata Tags */}
        <div style={{ padding: '8px 12px', backgroundColor: '#0F172A', fontSize: '9px', color: '#94A3B8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ color: '#E2E8F0', fontWeight: 700 }}>Dinding: Semi Permanen</span>
            <span style={{ color: '#E2E8F0', fontWeight: 700 }}>Lantai: Semen Kasar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Atap: Seng / Asbes</span>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>Verifikasi Lapangan RT: OK</span>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan Surat Keterangan RT/RW
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '350px',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        border: '1.5px solid #CBD5E1',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
        padding: '12px 14px',
        position: 'relative',
      }}
    >
      {/* Letterhead */}
      <div style={{ textAlign: 'center', borderBottom: '1.5px solid #1E293B', paddingBottom: '4px', marginBottom: '6px' }}>
        <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#334155' }}>
          PEMERINTAH KABUPATEN BOGOR · DESA BULAK AMAH
        </div>
        <div style={{ fontSize: '8px', fontWeight: 700, color: '#475569' }}>
          RUKUN TETANGGA {resident.addressRtRw?.split('/')[0] || '01'} / RW {resident.addressRtRw?.split('/')[1] || '03'}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 900, color: '#0F172A', marginTop: '2px', textDecoration: 'underline' }}>
          SURAT KETERANGAN TIDAK MAMPU (SKTM)
        </div>
        <div style={{ fontSize: '8px', fontFamily: 'monospace', color: '#64748B' }}>
          Nomor: 470/SKTM/RT{cleanRt(resident.addressRtRw)}/I/2026
        </div>
      </div>

      {/* Body text */}
      <div style={{ fontSize: '8.5px', color: '#334155', lineHeight: 1.35, marginBottom: '6px' }}>
        Menerangkan dengan sebenarnya bahwa Saudara/i <strong>{cleanName(resident.name)}</strong>, NIK: <strong>{resident.nikMasked}</strong>, adalah benar warga RT {resident.addressRtRw} tergolong keluarga prasejahtera yang berhak diusulkan menerima bantuan sosial.
      </div>

      {/* Signature & Seal */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
        <div style={{ textAlign: 'center', width: '100px', position: 'relative' }}>
          <div style={{ fontSize: '7.5px', color: '#475569' }}>Ketua RT Setempat,</div>
          <div
            style={{
              border: '1.5px solid rgba(37, 99, 235, 0.45)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '2px auto',
              fontSize: '6.5px',
              color: 'rgba(37, 99, 235, 0.8)',
              fontWeight: 800,
              transform: 'rotate(-8deg)',
            }}
          >
            STEMPEL RT
          </div>
          <div style={{ fontSize: '8px', fontWeight: 800, color: '#0F172A' }}>( Ketua RT {resident.addressRtRw?.split('/')[0] || '01'} )</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Fullscreen Lightbox Preview Component
 */
function DocumentLightbox({ doc, resident, allDocs, onClose, onSelectDoc }) {
  const currentIndex = allDocs.findIndex((d) => d.key === doc.key)
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

  const lightboxContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 20, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: 'min(95vw, 680px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        {/* Lightbox Header */}
        <div
          style={{
            padding: '16px 22px',
            backgroundColor: '#F8FAF9',
            borderBottom: '1px solid #E6ECE8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--color-green-950)' }}>
              Pratinjau: {doc.title}
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)' }}>
              Milik: {resident.name} (NIK: {resident.nikMasked})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="fintech-alert-close"
            style={{ position: 'static' }}
            title="Tutup Pratinjau (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Big Preview Area */}
        <div
          style={{
            padding: '30px 24px',
            backgroundColor: '#F0F4F2',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '280px',
          }}
        >
          <div style={{ transform: 'scale(1.15)', transformOrigin: 'center' }}>
            <DocumentVisualPreview doc={doc} resident={resident} />
          </div>
        </div>

        {/* Lightbox Footer Controls */}
        <div
          style={{
            padding: '14px 22px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E6ECE8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={!prevDoc}
              onClick={() => prevDoc && onSelectDoc(prevDoc)}
              className="clay-badge"
              style={{
                padding: '6px 12px',
                opacity: prevDoc ? 1 : 0.4,
                cursor: prevDoc ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
              }}
            >
              <ChevronLeft size={14} /> Berkas Sebelumnya
            </button>
            <button
              type="button"
              disabled={!nextDoc}
              onClick={() => nextDoc && onSelectDoc(nextDoc)}
              className="clay-badge"
              style={{
                padding: '6px 12px',
                opacity: nextDoc ? 1 : 0.4,
                cursor: nextDoc ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
              }}
            >
              Berkas Berikutnya <ChevronRight size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="fintech-alert-btn-confirm"
            style={{ padding: '7px 18px', fontSize: '12px' }}
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(lightboxContent, document.body)
  }
  return lightboxContent
}
