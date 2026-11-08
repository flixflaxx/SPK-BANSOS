import { useState, useEffect, useRef } from 'react'
import { Check, Scale, Plus, CheckCircle2, AlertTriangle, Trash2, ArrowRight, Sliders } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { DEFAULT_CRITERIA, DEFAULT_SUBCRITERIA_RULES } from './criteriaConstants.js'

export function SubcriteriaView({
  criteria: propCriteria,
  subcriteriaRules: propSubcriteriaRules,
  onAddRule,
  onDeleteRule,
  onNavigate,
}) {
  const criteria = Array.isArray(propCriteria) ? propCriteria : DEFAULT_CRITERIA
  const [internalRules, setInternalRules] = useState(DEFAULT_SUBCRITERIA_RULES)
  const isRulesControlled = Boolean(propSubcriteriaRules)
  const subcriteriaRules = isRulesControlled ? propSubcriteriaRules : internalRules

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetCode, setTargetCode] = useState(criteria[0]?.code || 'C1')
  const [categoryInput, setCategoryInput] = useState('')
  const [scoreInput, setScoreInput] = useState('')
  const [impactInput, setImpactInput] = useState('')
  const [formError, setFormError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const containerRef = useRef(null)

  // Total weight calculated directly from active criteria
  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001

  // Ensure targetCode is valid when criteria changes
  useEffect(() => {
    if (!criteria.some((c) => c.code === targetCode) && criteria.length > 0) {
      setTargetCode(criteria[0].code)
    }
  }, [criteria, targetCode])

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.subcrit-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(70),
        duration: 550,
        easing: 'easeOutBack',
      })
    }
  }, [criteria, subcriteriaRules])

  function handleAddRuleSubmit(e) {
    e.preventDefault()
    if (!categoryInput.trim() || !scoreInput.trim()) {
      setFormError('Kategori lapangan dan skor angka wajib diisi.')
      return
    }

    const newRule = {
      category: categoryInput.trim(),
      rawScore: scoreInput.trim(),
      priorityImpact: impactInput.trim() || 'Sesuai konfigurasi pengambil keputusan',
    }

    if (onAddRule) {
      onAddRule(targetCode, newRule)
    } else {
      setInternalRules((prev) => ({
        ...prev,
        [targetCode]: [...(prev[targetCode] || []), newRule],
      }))
    }

    setIsModalOpen(false)
    setCategoryInput('')
    setScoreInput('')
    setImpactInput('')
    setFormError('')
    setToastMessage(`Aturan subkriteria baru berhasil ditambahkan untuk ${targetCode}!`)
    setTimeout(() => setToastMessage(''), 4000)
  }

  function handleDeleteRuleItem(criterionCode, ruleIndex) {
    if (onDeleteRule) {
      onDeleteRule(criterionCode, ruleIndex)
    } else {
      setInternalRules((prev) => {
        const existing = prev[criterionCode] || []
        return {
          ...prev,
          [criterionCode]: existing.filter((_, idx) => idx !== ruleIndex),
        }
      })
    }
    setToastMessage(`Aturan subkriteria pada ${criterionCode} berhasil dihapus.`)
    setTimeout(() => setToastMessage(''), 4000)
  }

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={7}
        title="Subkriteria & Bobot Penilaian SAW"
        description="Pemetaan kategori faktual lapangan ke skor angka matriks SAW (xᵢⱼ). Subkriteria dan bobot berikut selalu otomatis tersinkronisasi 100% dengan Kriteria."
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {onNavigate && (
              <button
                type="button"
                className="clay-badge"
                onClick={() => onNavigate('criteria')}
                title="Buka halaman Kriteria Penilaian SAW untuk mengubah nama atau bobot"
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
                <Sliders size={14} />
                <span>Ubah Kriteria & Bobot</span>
              </button>
            )}
            <button
              type="button"
              className="clay-btn"
              onClick={() => {
                setTargetCode(criteria[0]?.code || 'C1')
                setFormError('')
                setIsModalOpen(true)
              }}
              style={{
                padding: '11px 22px',
                fontSize: '13px',
              }}
            >
              <Plus size={16} />
              <span>Tambah Subkriteria</span>
            </button>
          </div>
        }
      />

      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Weight Summary Banner with Claymorphism */}
      <div
        className="clay-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 28px',
          borderRadius: '26px',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: isWeightValid ? '#edf8f3' : '#fee2e2',
              color: isWeightValid ? 'var(--color-green-700)' : '#dc2626',
            }}
          >
            <Scale size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-green-950)' }}>
                {`Status Total Bobot: ${criteria.length} Kriteria Aktif`}
              </span>
              <span className="pulse-indicator" />
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Prasyarat mutlak SAW: Σ wⱼ = 1,00 (100%). Seluruh subkriteria dan bobot di bawah ini selalu tersinkronisasi otomatis dengan menu Kriteria.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: '800',
              fontFamily: 'monospace',
              color: isWeightValid ? 'var(--color-green-700)' : '#dc2626',
            }}
          >
            {totalWeight.toFixed(2)}
          </span>
          <span
            className="clay-badge"
            style={{
              fontSize: '12px',
              fontWeight: '800',
              padding: '6px 14px',
              backgroundColor: isWeightValid ? '#edf8f3' : '#fee2e2',
              color: isWeightValid ? 'var(--color-green-700)' : '#dc2626',
            }}
          >
            {isWeightValid ? (
              <>
                <Check size={14} />
                <span>VALID (100%)</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>{`BELUM 100% (${(totalWeight * 100).toFixed(0)}%)`}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Subcriteria Cards Dynamically Generated from Criteria */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {criteria.map((c) => {
          const rules = subcriteriaRules[c.code] || []
          const numWeight = Number(c.weight) || 0
          const pct = Math.round(numWeight * 100)
          const isCost = c.type === 'COST'

          return (
            <div key={c.code} className="subcrit-card">
              <Panel
                title={`${c.code} — ${c.name} (${c.type}, W=${c.weight})`}
                subtitle={`Satuan Nilai Faktual: ${c.unit || 'Skor'} • Bobot Kriteria: W = ${c.weight} (${pct}%) • Terdiri dari ${rules.length} aturan penjenjangan`}
                actions={
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      className="clay-badge"
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        backgroundColor: '#edf8f3',
                        color: 'var(--color-green-950)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {`W = ${c.weight} (${pct}%)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCode(c.code)
                        setFormError('')
                        setIsModalOpen(true)
                      }}
                      className="clay-badge"
                      style={{
                        backgroundColor: '#ffffff',
                        color: 'var(--color-green-700)',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #d1fae5',
                      }}
                    >
                      <Plus size={13} />
                      <span>Tambah Aturan {c.code}</span>
                    </button>
                  </div>
                }
              >
                {rules.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      backgroundColor: '#f9fcfb',
                      borderRadius: '14px',
                      border: '1px dashed #d2ddd6',
                    }}
                  >
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                      Belum ada aturan penilaian subkriteria untuk kriteria <strong>{c.code} — {c.name}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCode(c.code)
                        setFormError('')
                        setIsModalOpen(true)
                      }}
                      className="clay-btn"
                      style={{ padding: '7px 16px', fontSize: '12px' }}
                    >
                      <Plus size={14} />
                      <span>Buat Aturan Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '12px 0 0 12px', fontSize: '12px', textTransform: 'uppercase' }}>
                            Kategori Lapangan
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', width: '20%', fontSize: '12px', textTransform: 'uppercase' }}>
                            Skor Angka (xᵢⱼ)
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', width: '36%', fontSize: '12px', textTransform: 'uppercase' }}>
                            Pengaruh Terhadap Prioritas
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', width: '10%', borderRadius: '0 12px 12px 0', fontSize: '12px', textTransform: 'uppercase' }}>
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.map((rule, idx) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fcfb',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--color-green-950)', borderRadius: '10px 0 0 10px', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                              {rule.category}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '800', color: 'var(--color-green-700)', fontSize: '14px', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                              <span className="clay-badge" style={{ backgroundColor: '#edf8f3', padding: '3px 10px' }}>
                                {rule.rawScore}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '12.5px', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                              {rule.priorityImpact}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', borderRadius: '0 10px 10px 0', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteRuleItem(c.code, idx)}
                                title={`Hapus aturan "${rule.category}"`}
                                className="clay-badge"
                                style={{
                                  backgroundColor: '#ffffff',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  border: '1px solid #fee2e2',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '11px',
                                }}
                              >
                                <Trash2 size={12} />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </div>
          )
        })}
      </div>

      {/* Modal Tambah Subkriteria */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Aturan Subkriteria Baru">
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

        <form onSubmit={handleAddRuleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Pilih Kriteria Induk (Mengikuti Kriteria Aktif)
            </label>
            <select
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
            >
              {criteria.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.type === 'COST' ? 'Cost' : 'Benefit'}, W={c.weight})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Nama Kategori Lapangan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pendapatan Rp 500.000 – Rp 800.000 / Rumah Semi Permanen"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Skor Angka Matriks (xᵢⱼ)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 5 atau 1.500.000"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace', fontWeight: '800' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Pengaruh Terhadap Prioritas
              </label>
              <input
                type="text"
                placeholder="Contoh: Sangat Rentan (Prioritas Utama)"
                value={impactInput}
                onChange={(e) => setImpactInput(e.target.value)}
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
              Simpan Aturan Subkriteria
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
