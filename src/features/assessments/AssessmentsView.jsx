import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  AlertCircle,
  Users,
  ClipboardCheck,
  Edit3,
  Plus,
  X,
  Check,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { DEFAULT_CRITERIA } from '../criteria/criteriaConstants.js'

export function AssessmentsView({
  candidates = [],
  residents = [],
  assessments = [],
  criteria = DEFAULT_CRITERIA,
  subcriteriaRules = {},
  onSaveAssessments,
  initialInputCandidateId = null,
}) {
  const containerRef = useRef(null)

  // State untuk Modal Input Nilai
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialInputCandidateId)
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialInputCandidateId))
  const [formValues, setFormValues] = useState({})
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(null)

  // Build matriks penilaian calon secara dinamis mengikuti kriteria aktif
  // ATURAN: Biarkan nilai masing-masing kriteria kosong ('') sebelum diinput nilai!
  const matrixRows = candidates.map((candidate) => {
    const resident = residents.find((r) => r.id === candidate.residentId)
    const candidateAssessments = assessments.filter((a) => a.candidateId === candidate.id)
    const values = {}
    let allValid = true

    for (const c of criteria) {
      const ass = candidateAssessments.find((a) => a.criterionCode === c.code)
      if (ass && ass.rawValue !== '' && ass.rawValue !== null && ass.rawValue !== undefined) {
        values[c.code] = String(ass.rawValue)
        if (ass.status !== 'VALID') {
          allValid = false
        }
      } else {
        // Biarkan kosong jika belum diinput nilai oleh operator
        values[c.code] = ''
        allValid = false
      }
    }

    return {
      candidateId: candidate.id,
      candidate,
      resident,
      name: resident?.name || candidate.id,
      nik: resident?.nikMasked || '—',
      addressRtRw: resident?.addressRtRw || '—',
      verificationStatus: candidate.verificationStatus,
      values,
      isComplete: allValid,
    }
  })

  const readyCount = matrixRows.filter((r) => r.isComplete && r.verificationStatus === 'VERIFIED').length
  const pendingCount = matrixRows.length - readyCount
  const percentComplete = matrixRows.length > 0 ? Math.round((readyCount / matrixRows.length) * 100) : 0

  // Buka Modal Input Nilai untuk calon tertentu
  function handleOpenInputModal(candidateRow) {
    const targetCandidateId = candidateRow ? candidateRow.candidateId : candidates[0]?.id
    if (!targetCandidateId) return

    setSelectedCandidateId(targetCandidateId)
    const targetRow = matrixRows.find((r) => r.candidateId === targetCandidateId)

    const initial = {}
    criteria.forEach((c) => {
      initial[c.code] = targetRow?.values?.[c.code] || ''
    })
    setFormValues(initial)
    setSaveSuccessNotice(null)
    setIsModalOpen(true)
  }

  // Ganti calon yang sedang dinilai di dalam modal
  function handleSwitchCandidate(newCandId) {
    setSelectedCandidateId(newCandId)
    const targetRow = matrixRows.find((r) => r.candidateId === newCandId)
    const initial = {}
    criteria.forEach((c) => {
      initial[c.code] = targetRow?.values?.[c.code] || ''
    })
    setFormValues(initial)
    setSaveSuccessNotice(null)
  }

  // Kosongkan seluruh nilai kriteria untuk calon ini
  function handleClearAll() {
    const cleared = {}
    criteria.forEach((c) => {
      cleared[c.code] = ''
    })
    setFormValues(cleared)
  }

  // Simpan nilai kriteria yang diinput
  function handleSave(e) {
    e.preventDefault()
    if (!selectedCandidateId) return

    if (onSaveAssessments) {
      onSaveAssessments(selectedCandidateId, formValues)
    }

    const currentCand = matrixRows.find((r) => r.candidateId === selectedCandidateId)
    setSaveSuccessNotice(`Nilai kriteria untuk ${currentCand?.name || 'calon'} berhasil disimpan!`)

    setTimeout(() => {
      setSaveSuccessNotice(null)
      setIsModalOpen(false)
    }, 1200)
  }

  // Scroll lock & Escape key listener saat modal terbuka
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
        setSaveSuccessNotice(null)
      }
    }
    if (isModalOpen) {
      document.body.classList.add('scroll-locked')
      document.documentElement.classList.add('scroll-locked')
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.classList.remove('scroll-locked')
      document.documentElement.classList.remove('scroll-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.ass-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
      anime({
        targets: containerRef.current.querySelector('.ass-progress-bar'),
        width: ['0%', `${percentComplete}%`],
        duration: 900,
        easing: 'easeOutQuart',
      })
    }
  }, [candidates, assessments, percentComplete])

  const activeModalCandidate = matrixRows.find((r) => r.candidateId === selectedCandidateId)

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={9}
        title="Input Penilaian Calon"
        description="Matriks data mentah (X) berdasarkan penilaian kriteria terverifikasi."
        actions={
          <button
            type="button"
            className="clay-btn"
            onClick={() => handleOpenInputModal(matrixRows[0])}
            style={{ padding: '11px 22px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Input Nilai Calon</span>
          </button>
        }
      />

      {/* Top 3 Squircle Metric Cards with Claymorphism */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '18px',
          marginBottom: '26px',
        }}
      >
        <div
          className="ass-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              TOTAL ALTERNATIF MATRIKS
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {matrixRows.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Terdaftar dalam siklus periode
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="ass-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                LENGKAP & SIAP HITUNG
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '6px', lineHeight: 1.1 }}>
              {readyCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Seluruh kriteria aktif telah diisi
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="ass-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              BELUM LENGKAP / PENDING
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '6px', lineHeight: 1.1 }}>
              {pendingCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Nilai kriteria masih kosong
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#fef3c7',
              color: 'var(--color-warning)',
            }}
          >
            <ClipboardCheck size={22} />
          </div>
        </div>
      </div>

      {/* Visual Progress Bar Card with Claymorphism */}
      <div
        className="clay-card"
        style={{
          padding: '22px 26px',
          borderRadius: '24px',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-green-950)' }}>
              Kesiapan Matriks Penilaian Calon (X)
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {readyCount} dari {matrixRows.length} calon memiliki parameter lengkap untuk dieksekusi mesin SAW
            </div>
          </div>
          <span
            className="clay-badge"
            style={{
              fontSize: '16px',
              fontWeight: '800',
              fontFamily: 'monospace',
              color: 'var(--color-green-700)',
              backgroundColor: '#edf8f3',
              padding: '4px 14px',
            }}
          >
            {percentComplete}%
          </span>
        </div>
        <div className="clay-sunken" style={{ height: '11px', width: '100%' }}>
          <div
            className="ass-progress-bar clay-progress-fill"
            style={{
              height: '100%',
              width: `${percentComplete}%`,
              background: 'linear-gradient(90deg, #16765b, #20b47c, #b5f56a)',
            }}
          />
        </div>
      </div>

      <Panel
        title="Matriks Keputusan Mentah (X) Calon Penerima"
        subtitle="Nilai mentah masing-masing kriteria. Kriteria yang belum dinilai bernilai Kosong."
      >
        <div className="table-responsive-container" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '12px 0 0 12px', fontSize: '12px', textTransform: 'uppercase' }}>Alternatif / Calon</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', fontSize: '12px', textTransform: 'uppercase' }}>Status Verif.</th>
                {criteria.map((c) => (
                  <th key={c.code} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', fontSize: '12px', textTransform: 'uppercase' }}>
                    <div>{c.code}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'none' }}>
                      {`${c.type === 'COST' ? 'Cost' : 'Benefit'} · W=${c.weight}`}
                    </div>
                  </th>
                ))}
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', fontSize: '12px', textTransform: 'uppercase' }}>Kelengkapan</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '0 12px 12px 0', fontSize: '12px', textTransform: 'uppercase' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row, idx) => (
                <tr
                  key={row.candidateId}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fcfb',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td style={{ padding: '12px 14px', borderRadius: '10px 0 0 10px', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    <div style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>{row.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>NIK: <code>{row.nik}</code></div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    <StatusBadge status={row.verificationStatus} />
                  </td>
                  {criteria.map((c) => {
                    const val = row.values[c.code]
                    const isMissing = val === null || val === undefined || val === ''
                    return (
                      <td
                        key={c.code}
                        style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: '800',
                          borderBottom: '1px solid rgba(22, 118, 91, 0.05)',
                        }}
                      >
                        {isMissing ? (
                          <span
                            className="clay-badge"
                            style={{
                              fontSize: '11px',
                              color: '#94A3B8',
                              backgroundColor: '#F1F5F9',
                              padding: '2px 8px',
                              border: '1px dashed #CBD5E1',
                              fontWeight: '600',
                              fontFamily: 'var(--font-sans, sans-serif)',
                            }}
                          >
                            Kosong
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-green-950)' }}>
                            {isNaN(Number(val)) ? val : Number(val).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    {row.isComplete && row.verificationStatus === 'VERIFIED' ? (
                      <span
                        className="clay-badge"
                        style={{
                          color: 'var(--color-success)',
                          backgroundColor: '#edf8f3',
                          padding: '4px 12px',
                          fontWeight: '800',
                          fontSize: '11.5px',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Siap Hitung</span>
                      </span>
                    ) : (
                      <span
                        className="clay-badge"
                        style={{
                          color: 'var(--color-warning)',
                          backgroundColor: '#fef8ee',
                          padding: '4px 12px',
                          fontWeight: '700',
                          fontSize: '11.5px',
                        }}
                      >
                        <AlertCircle size={13} />
                        <span>Belum Lengkap</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', borderRadius: '0 10px 10px 0', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenInputModal(row)}
                      className="clay-badge input-nilai-btn"
                      title={`Input nilai kriteria untuk ${row.name}`}
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--fintech-primary, #087A59)',
                        backgroundColor: 'var(--fintech-soft-green, #E8F5EF)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(8, 122, 89, 0.25)',
                        borderRadius: '9999px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Input Nilai</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================
          MODAL: INPUT NILAI KRITERIA CALON (SWEETALERT / PORTAL STYLE)
          ======================================================== */}
      {isModalOpen &&
        (() => {
          const modalNode = (
            <div
              className="fintech-alert-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="input-nilai-title"
              onClick={(e) => {
                if (e.target === e.currentTarget && !saveSuccessNotice) {
                  setIsModalOpen(false)
                }
              }}
              style={{
                zIndex: 999999,
                position: 'fixed',
                inset: 0,
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
                  width: 'min(94vw, 760px)',
                  maxWidth: '760px',
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
                    onClick={() => setIsModalOpen(false)}
                    title="Tutup (Esc)"
                    aria-label="Tutup form input nilai"
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
                      <Edit3 size={18} />
                    </div>
                    <div>
                      <h3
                        id="input-nilai-title"
                        style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          color: 'var(--fintech-text-primary, #06281E)',
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        Input Penilaian Kriteria Calon
                      </h3>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--fintech-text-secondary, #65756E)',
                          margin: 0,
                        }}
                      >
                        Masukkan nilai kriteria untuk calon penerima. Biarkan kosong bila kriteria belum dinilai.
                      </p>
                    </div>
                  </div>

                  {/* Candidate Selector Strip */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        Pilih Calon:
                      </span>
                      <select
                        value={selectedCandidateId || ''}
                        onChange={(e) => handleSwitchCandidate(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: '1px solid var(--fintech-border)',
                          backgroundColor: '#F8FAF9',
                          flex: 1,
                        }}
                      >
                        {matrixRows.map((r) => (
                          <option key={r.candidateId} value={r.candidateId}>
                            {r.name} ({r.nik})
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeModalCandidate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="clay-badge"
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            backgroundColor:
                              activeModalCandidate.verificationStatus === 'VERIFIED'
                                ? '#E8F5EF'
                                : '#FEF3C7',
                            color:
                              activeModalCandidate.verificationStatus === 'VERIFIED'
                                ? '#087A59'
                                : '#D97706',
                          }}
                        >
                          {activeModalCandidate.verificationStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Notification */}
                {saveSuccessNotice && (
                  <div
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#E8F5EF',
                      borderBottom: '1px solid #C7E6D7',
                      color: 'var(--fintech-primary, #087A59)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{saveSuccessNotice}</span>
                  </div>
                )}

                {/* Form Fields Body */}
                <form
                  onSubmit={handleSave}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
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
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        fontSize: '11.5px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Info size={16} />
                      <span>
                        Kriteria dapat dibiarkan kosong sebelum diisi. Calon baru dinyatakan Siap Hitung dalam perangkingan SAW apabila seluruh kriteria telah diisi nilai.
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {criteria.map((c) => {
                        const rules = subcriteriaRules[c.code] || []
                        const currentValue = formValues[c.code] || ''
                        const isFilled = currentValue !== ''

                        return (
                          <div
                            key={c.code}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '14px',
                              padding: '14px 18px',
                              border: isFilled
                                ? '1px solid #A7D7C1'
                                : '1px solid #E6ECE8',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                            }}
                          >
                            {/* Criterion Header */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    backgroundColor:
                                      c.type === 'COST' ? '#D97706' : 'var(--fintech-primary, #087A59)',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  {c.code}
                                </span>
                                <span
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    color: 'var(--color-green-950)',
                                  }}
                                >
                                  {c.name}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    color: 'var(--color-text-muted)',
                                    fontWeight: 700,
                                  }}
                                >
                                  {c.type === 'COST' ? 'Cost' : 'Benefit'} · Bobot: {c.weight}
                                </span>
                                {isFilled ? (
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      color: '#087A59',
                                      fontWeight: 800,
                                      backgroundColor: '#E8F5EF',
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <CheckCircle2 size={11} /> Terisi: {currentValue}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      color: '#94A3B8',
                                      fontStyle: 'italic',
                                      backgroundColor: '#F1F5F9',
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                    }}
                                  >
                                    Kosong
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dropdown Subkriteria jika ada rule */}
                            {rules.length > 0 && (
                              <div style={{ marginBottom: '8px' }}>
                                <label
                                  style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--color-text-subtle)',
                                    marginBottom: '4px',
                                  }}
                                >
                                  Pilih Opsi Subkriteria:
                                </label>
                                <select
                                  value={currentValue}
                                  onChange={(e) =>
                                    setFormValues({ ...formValues, [c.code]: e.target.value })
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '12.5px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FAFCFB',
                                  }}
                                >
                                  <option value="">-- Kosongkan / Belum Dinilai --</option>
                                  {rules.map((rule, idx) => (
                                    <option key={idx} value={rule.rawScore}>
                                      {rule.category} (Nilai / Skor: {rule.rawScore})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Manual Numeric / Text Input */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder={`Masukkan nilai ${c.name} (biarkan kosong bila belum dinilai)...`}
                                  value={currentValue}
                                  onChange={(e) =>
                                    setFormValues({ ...formValues, [c.code]: e.target.value })
                                  }
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    fontSize: '12.5px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                  }}
                                />
                                {isFilled && (
                                  <button
                                    type="button"
                                    onClick={() => setFormValues({ ...formValues, [c.code]: '' })}
                                    title="Kosongkan kriteria ini"
                                    className="clay-badge"
                                    style={{
                                      padding: '7px 10px',
                                      color: '#DC2626',
                                      backgroundColor: '#FEF2F2',
                                      border: '1px solid #FECACA',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
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
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="clay-badge"
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Kosongkan Semua Nilai</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="fintech-alert-btn-cancel"
                        style={{ padding: '8px 16px', fontSize: '12.5px' }}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="fintech-alert-btn-confirm"
                        style={{ padding: '8px 20px', fontSize: '12.5px' }}
                      >
                        <Check size={16} />
                        <span>Simpan Nilai Penilaian</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )

          if (typeof document !== 'undefined') {
            return createPortal(modalNode, document.body)
          }
          return modalNode
        })()}
    </div>
  )
}
