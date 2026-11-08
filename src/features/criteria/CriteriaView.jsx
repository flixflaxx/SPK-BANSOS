import { useState, useEffect, useRef } from 'react'
import {
  Scale,
  ListFilter,
  Sliders,
  CheckCircle2,
  Plus,
  AlertCircle,
  Trash2,
  Wand2,
  Pencil,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { DEFAULT_CRITERIA } from './criteriaConstants.js'

export function CriteriaView({
  criteria: propCriteria,
  subcriteriaRules = {},
  onUpdateCriteria,
  onResetCriteria,
  onNavigate,
}) {
  const [internalCriteria, setInternalCriteria] = useState(DEFAULT_CRITERIA)
  const isControlled = Array.isArray(propCriteria)
  const criteria = isControlled ? propCriteria : internalCriteria

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [feedbackToast, setFeedbackToast] = useState('')
  const [expandedCode, setExpandedCode] = useState(null)

  const [formData, setFormData] = useState({
    code: `C${criteria.length + 1}`,
    name: '',
    type: 'BENEFIT',
    weight: '0.10',
    unit: 'skor',
  })

  // Edit Modal State
  const [editingCriterion, setEditingCriterion] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'BENEFIT',
    weight: '0.10',
    unit: 'skor',
  })
  const [editFormError, setEditFormError] = useState('')

  const containerRef = useRef(null)

  const totalWeight = criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0)
  const benefitCount = criteria.filter((c) => c.type === 'BENEFIT').length
  const costCount = criteria.filter((c) => c.type === 'COST').length
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001

  function updateCriteriaList(newList, reason = 'CRITERIA_UPDATED') {
    if (onUpdateCriteria) {
      onUpdateCriteria(newList, reason)
    }
    if (!isControlled) {
      setInternalCriteria(newList)
    }
  }

  // Handle direct inline weight change right from the table row
  function handleInlineWeightChange(code, newWeight) {
    const updated = criteria.map((c) =>
      c.code === code ? { ...c, weight: newWeight } : c
    )
    updateCriteriaList(updated, 'CRITERIA_WEIGHT_UPDATED')
  }

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.crit-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
      anime({
        targets: containerRef.current.querySelectorAll('.weight-bar-segment'),
        width: (el) => [0, el.getAttribute('data-width') || '0%'],
        duration: 900,
        delay: anime.stagger(70),
        easing: 'easeOutQuart',
      })
    }
  }, [criteria])

  const colorPalette = ['#09291f', '#16765b', '#1b8a6a', '#20b47c', '#89d46e', '#0284c7', '#9333ea', '#ea580c', '#f59e0b', '#ec4899']

  function handleAutoNormalize() {
    const rawSum = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
    if (rawSum === 0) return

    const normalized = criteria.map((c) => {
      const share = (Number(c.weight) || 0) / rawSum
      return {
        ...c,
        weight: (Math.round(share * 100) / 100).toFixed(2),
      }
    })

    // Adjust any rounding residue to the last criterion
    const curSum = normalized.reduce((sum, c) => sum + Number(c.weight), 0)
    const diff = 1.0 - curSum
    if (Math.abs(diff) > 0.0001 && normalized.length > 0) {
      const lastIdx = normalized.length - 1
      const adj = (Number(normalized[lastIdx].weight) + diff).toFixed(2)
      normalized[lastIdx].weight = adj
    }

    updateCriteriaList(normalized, 'CRITERIA_NORMALIZED')
    setFeedbackToast('Bobot seluruh kriteria berhasil dinormalisasi otomatis menjadi 1.00 (100%). Halaman Subkriteria ikut diperbarui!')
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  function handleCreateCriteria(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Nama kriteria wajib diisi.')
      return
    }
    const code = formData.code.trim().toUpperCase()
    if (!code) {
      setFormError('Kode kriteria wajib diisi.')
      return
    }
    if (criteria.some((c) => c.code.toUpperCase() === code)) {
      setFormError(`Kode kriteria ${code} sudah digunakan. Gunakan kode unik lain.`)
      return
    }
    const w = Number(formData.weight)
    if (Number.isNaN(w) || w <= 0 || w >= 1) {
      setFormError('Bobot harus berupa angka positif antara 0.01 dan 0.99.')
      return
    }

    const newCriterion = {
      code,
      name: formData.name.trim(),
      type: formData.type,
      weight: w.toFixed(2),
      unit: formData.unit.trim() || 'skor',
      isCustom: true,
    }

    const updated = [...criteria, newCriterion]
    updateCriteriaList(updated, 'CRITERIA_CREATED')
    setIsModalOpen(false)
    setFormData({
      code: `C${updated.length + 1}`,
      name: '',
      type: 'BENEFIT',
      weight: '0.10',
      unit: 'skor',
    })
    setFormError('')
    setFeedbackToast(`Kriteria ${code} berhasil ditambahkan! Aturan subkriteria baru otomatis dibuat dan tersinkronisasi.`)
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  function handleOpenEdit(criterion) {
    setEditingCriterion(criterion)
    setEditFormData({
      name: criterion.name,
      type: criterion.type,
      weight: criterion.weight,
      unit: criterion.unit || '',
    })
    setEditFormError('')
  }

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editFormData.name.trim()) {
      setEditFormError('Nama kriteria wajib diisi.')
      return
    }
    const w = Number(editFormData.weight)
    if (Number.isNaN(w) || w <= 0 || w >= 1) {
      setEditFormError('Bobot harus berupa angka positif antara 0.01 dan 0.99.')
      return
    }

    const updated = criteria.map((c) =>
      c.code === editingCriterion.code
        ? {
            ...c,
            name: editFormData.name.trim(),
            type: editFormData.type,
            weight: w.toFixed(2),
            unit: editFormData.unit.trim() || 'skor',
          }
        : c
    )

    updateCriteriaList(updated, 'CRITERIA_UPDATED')
    setEditingCriterion(null)
    setFeedbackToast(`Kriteria ${editingCriterion.code} berhasil diperbarui. Subkriteria dan bobot otomatis tersinkron!`)
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  function handleDeleteCriteria(code) {
    if (criteria.length <= 3) {
      alert('Minimal harus ada 3 kriteria dalam perhitungan SAW.')
      return
    }
    const updated = criteria.filter((c) => c.code !== code)
    updateCriteriaList(updated, 'CRITERIA_DELETED')
    setFeedbackToast(`Kriteria ${code} berhasil dihapus dari daftar kriteria dan subkriteria.`)
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  function handleResetSeed() {
    if (onResetCriteria) {
      onResetCriteria()
    } else {
      updateCriteriaList(DEFAULT_CRITERIA, 'CRITERIA_RESET')
    }
    setFeedbackToast('Konfigurasi kriteria dikembalikan ke standar awal.')
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  const columns = [
    {
      key: 'code',
      label: 'Kode',
      width: '10%',
      render: (val) => (
        <span
          className="clay-badge"
          style={{
            fontWeight: '800',
            fontFamily: 'monospace',
            backgroundColor: '#edf8f3',
            padding: '4px 12px',
            color: 'var(--color-green-950)',
            fontSize: '12.5px',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Nama Kriteria & Subkriteria',
      width: '32%',
      render: (val, row) => {
        const rules = subcriteriaRules[row.code] || []
        const isExpanded = expandedCode === row.code
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>
                {val}
              </span>
              {row.code === 'C6' && (
                <span
                  className="clay-badge"
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    padding: '2px 8px',
                  }}
                >
                  DTKS Terintegrasi
                </span>
              )}
            </div>
            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setExpandedCode(isExpanded ? null : row.code)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-green-700)',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                <span>{isExpanded ? 'Sembunyikan Aturan' : `Lihat ${rules.length} Aturan Subkriteria`}</span>
              </button>
            </div>

            {/* Quick Expanded Subcriteria Preview */}
            {isExpanded && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  backgroundColor: '#edf8f3',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  lineHeight: '1.6',
                  color: 'var(--color-green-950)',
                }}
              >
                <div style={{ fontWeight: '800', marginBottom: '4px', color: 'var(--color-green-800)' }}>
                  Aturan Penjenjangan Subkriteria:
                </div>
                {rules.length === 0 ? (
                  <span style={{ color: 'var(--color-text-muted)' }}>Belum ada aturan khusus.</span>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {rules.map((r, i) => (
                      <li key={i}>
                        <strong>{r.category}</strong> → Skor: <code>{r.rawScore}</code> ({r.priorityImpact})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'type',
      label: 'Tipe Atribut',
      width: '15%',
      render: (val) => (
        <span
          className="clay-badge"
          style={{
            fontWeight: '700',
            fontSize: '11.5px',
            color: val === 'COST' ? 'var(--color-danger)' : 'var(--color-success)',
            backgroundColor: val === 'COST' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
            padding: '4px 10px',
          }}
        >
          {val === 'COST' ? 'COST (Biaya)' : 'BENEFIT (Keuntungan)'}
        </span>
      ),
    },
    {
      key: 'weight',
      label: 'Bobot Preferensi (W)',
      width: '23%',
      render: (val, row) => {
        const numVal = Number(val) || 0
        const pct = Math.round(numVal * 100)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={val}
                onChange={(e) => handleInlineWeightChange(row.code, e.target.value)}
                style={{
                  width: '74px',
                  padding: '5px 8px',
                  fontFamily: 'monospace',
                  fontWeight: '800',
                  fontSize: '13px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(22, 118, 91, 0.25)',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-green-950)',
                }}
                title={`Ketik langsung bobot baru untuk ${row.code} (Subkriteria langsung otomatis ikut berubah)`}
              />
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-green-700)', fontFamily: 'monospace' }}>
                ({pct}%)
              </span>
            </div>
            <div className="clay-sunken" style={{ height: '6px', width: '100%' }}>
              <div
                className="clay-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: 'var(--color-green-700)' }}
              />
            </div>
          </div>
        )
      },
    },
    { key: 'unit', label: 'Satuan Nilai', width: '10%' },
    {
      key: 'actions',
      label: 'Aksi',
      width: '10%',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            title={`Edit kriteria ${row.code}`}
            className="clay-badge"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--color-green-700)',
              cursor: 'pointer',
              padding: '5px 9px',
              fontSize: '11px',
              fontWeight: '700',
              border: '1px solid #d1fae5',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Pencil size={12} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCriteria(row.code)}
            title={`Hapus kriteria ${row.code}`}
            className="clay-badge"
            style={{
              backgroundColor: '#ffffff',
              color: '#dc2626',
              cursor: 'pointer',
              padding: '5px 9px',
              fontSize: '11px',
              fontWeight: '700',
              border: '1px solid #fee2e2',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Trash2 size={12} />
            <span>Hapus</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={6}
        title="Manajemen Kriteria Penilaian SAW"
        description="Pengaturan kriteria penilaian bansos, bobot preferensi (W), dan atribut matematis SAW. Kamu bisa ubah bobot langsung di tabel atau lewat tombol Edit — halaman Subkriteria & Bobot akan langsung otomatis ikut berubah!"
        actions={
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {onNavigate && (
              <button
                type="button"
                className="clay-badge"
                onClick={() => onNavigate('subcriteria')}
                title="Buka halaman Subkriteria & Bobot untuk melihat pemetaan skor"
                style={{
                  backgroundColor: '#edf8f3',
                  color: 'var(--color-green-700)',
                  cursor: 'pointer',
                  padding: '9px 16px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #bfe5d3',
                }}
              >
                <span>Lihat di Halaman Subkriteria</span>
                <ArrowRight size={14} />
              </button>
            )}
            <button
              type="button"
              className="clay-badge"
              onClick={handleAutoNormalize}
              title="Sesuaikan otomatis bobot seluruh kriteria agar total tepat 1.00 (100%)"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--color-green-800)',
                cursor: 'pointer',
                padding: '9px 16px',
                fontSize: '12.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(22, 118, 91, 0.2)',
              }}
            >
              <Wand2 size={15} style={{ color: 'var(--color-green-700)' }} />
              <span>Normalisasi Bobot (100%)</span>
            </button>
            <button
              type="button"
              className="clay-btn"
              onClick={() => {
                setFormData({
                  code: `C${criteria.length + 1}`,
                  name: '',
                  type: 'BENEFIT',
                  weight: '0.10',
                  unit: 'skor',
                })
                setFormError('')
                setIsModalOpen(true)
              }}
              style={{
                padding: '11px 22px',
                fontSize: '13px',
              }}
            >
              <Plus size={16} />
              <span>Tambah Kriteria</span>
            </button>
          </div>
        }
      />

      {feedbackToast && (
        <div
          className="clay-badge"
          style={{
            backgroundColor: '#edf8f3',
            color: 'var(--color-green-700)',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '20px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '24px',
        }}
      >
        <div className="clay-card crit-stat-card" style={{ padding: '20px', borderRadius: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Total Kriteria Aktif
            </span>
            <div className="clay-bubble" style={{ width: '36px', height: '36px', borderRadius: '12px', color: 'var(--color-green-700)', backgroundColor: '#edf8f3' }}>
              <ListFilter size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--color-green-950)', marginTop: '8px' }}>
            {criteria.length}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {benefitCount} Benefit • {costCount} Cost
          </span>
        </div>

        <div className="clay-card crit-stat-card" style={{ padding: '20px', borderRadius: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Total Bobot (Σ Wⱼ)
            </span>
            <div className="clay-bubble" style={{ width: '36px', height: '36px', borderRadius: '12px', color: isWeightValid ? 'var(--color-green-700)' : '#dc2626', backgroundColor: isWeightValid ? '#edf8f3' : '#fee2e2' }}>
              <Scale size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'monospace', color: isWeightValid ? 'var(--color-green-700)' : '#dc2626', marginTop: '8px' }}>
            {totalWeight.toFixed(2)}
          </div>
          <span className="clay-badge" style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', marginTop: '4px', display: 'inline-flex', backgroundColor: isWeightValid ? '#edf8f3' : '#fee2e2', color: isWeightValid ? 'var(--color-green-700)' : '#dc2626' }}>
            {isWeightValid ? 'Tepat 1.00 (Valid)' : `Selisih: ${(1.0 - totalWeight).toFixed(2)}`}
          </span>
        </div>

        <div className="clay-card crit-stat-card" style={{ padding: '20px', borderRadius: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Sinkronisasi Subkriteria
            </span>
            <div className="clay-bubble" style={{ width: '36px', height: '36px', borderRadius: '12px', color: 'var(--color-green-700)', backgroundColor: '#edf8f3' }}>
              <Sliders size={18} />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-green-950)', marginTop: '12px' }}>
            Terkoneksi Real-Time
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
            Ubah bobot di tabel → Subkriteria langsung ikut berubah
          </span>
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="clay-card" style={{ padding: '20px 24px', borderRadius: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-green-950)' }}>
            Distribusi Bobot Preferensi Antar Kriteria
          </span>
          <span style={{ fontSize: '12px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--color-green-700)' }}>
            {(totalWeight * 100).toFixed(0)}% dari 100%
          </span>
        </div>
        <div
          className="clay-sunken"
          style={{
            height: '14px',
            width: '100%',
            display: 'flex',
            overflow: 'hidden',
            padding: '2px',
          }}
        >
          {criteria.map((c, idx) => {
            const pct = Math.round(((Number(c.weight) || 0) / (totalWeight || 1)) * 100)
            const color = colorPalette[idx % colorPalette.length]
            return (
              <div
                key={c.code}
                className="weight-bar-segment"
                data-width={`${pct}%`}
                title={`${c.code} (${c.name}): ${c.weight} (${pct}%)`}
                style={{
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: '4px',
                  marginRight: '2px',
                }}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '14px' }}>
          {criteria.map((c, idx) => (
            <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: colorPalette[idx % colorPalette.length] }} />
              <span style={{ fontWeight: '800', fontFamily: 'monospace' }}>{c.code}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{c.name.split(' ')[0]} ({Math.round((Number(c.weight) || 0) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>

      <Panel
        title={`Versi Kriteria Aktif (${criteria.length} Kriteria)`}
        subtitle="Ubah angka bobot langsung di kolom tabel, atau gunakan tombol Edit/Normalisasi. Setiap perubahan akan langsung otomatis menyinkronkan Subkriteria & Bobot."
        actions={
          <button
            type="button"
            onClick={handleResetSeed}
            className="clay-badge"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '6px 14px',
              fontSize: '11.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Standar</span>
          </button>
        }
      >
        <DataTable columns={columns} data={criteria} />
      </Panel>

      {/* Modal Edit Kriteria */}
      {editingCriterion && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCriterion(null)}
          title={`Edit Kriteria ${editingCriterion.code}`}
        >
          {editFormError && (
            <div
              className="clay-badge"
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '10px 14px',
                fontSize: '12.5px',
                marginBottom: '16px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {editFormError}
            </div>
          )}

          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                  Kode Kriteria (Permanen)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingCriterion.code}
                  style={{ width: '100%', fontFamily: 'monospace', fontWeight: '800', backgroundColor: '#f1f5f3', cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                  Tipe Atribut
                </label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
                >
                  <option value="BENEFIT">BENEFIT — Semakin tinggi nilai, semakin diprioritaskan</option>
                  <option value="COST">COST — Semakin rendah nilai, semakin diprioritaskan</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Nama Kriteria
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                  <span>Bobot Preferensi (W)</span>
                  <span style={{ color: 'var(--color-green-700)', fontFamily: 'monospace' }}>
                    {Math.round((Number(editFormData.weight) || 0) * 100)}%
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  required
                  value={editFormData.weight}
                  onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                  style={{ width: '100%', fontFamily: 'monospace', fontWeight: '800' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                  Satuan Nilai / Ukuran
                </label>
                <input
                  type="text"
                  value={editFormData.unit}
                  onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setEditingCriterion(null)}
                className="clay-badge"
                style={{ padding: '9px 18px', backgroundColor: '#ffffff', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px' }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="clay-btn"
                style={{ padding: '9px 22px', fontSize: '13px' }}
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Tambah Kriteria Baru */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Kriteria Penilaian SAW Baru">
        {formError && (
          <div
            className="clay-badge"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px 14px',
              fontSize: '12.5px',
              marginBottom: '16px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateCriteria}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Kode Kriteria
              </label>
              <input
                type="text"
                required
                placeholder="C7"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                style={{ width: '100%', fontFamily: 'monospace', fontWeight: '800' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Tipe Atribut
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
              >
                <option value="BENEFIT">BENEFIT — Semakin tinggi nilai, semakin diprioritaskan</option>
                <option value="COST">COST — Semakin rendah nilai, semakin diprioritaskan</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Nama Kriteria
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Daya Listrik Rumah Tangga / Beban Tanggungan Khusus"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                <span>Bobot Preferensi (0.01 – 0.99)</span>
                <span style={{ color: 'var(--color-green-700)', fontFamily: 'monospace' }}>
                  {Math.round((Number(formData.weight) || 0) * 100)}%
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                required
                placeholder="0.10"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                style={{ width: '100%', fontFamily: 'monospace', fontWeight: '800' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Satuan Nilai / Ukuran
              </label>
              <input
                type="text"
                placeholder="Contoh: Watt, Rupiah, Skor 1–5"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="clay-badge"
              style={{ padding: '9px 18px', backgroundColor: '#ffffff', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn"
              style={{ padding: '9px 22px', fontSize: '13px' }}
            >
              Simpan Kriteria Baru
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
