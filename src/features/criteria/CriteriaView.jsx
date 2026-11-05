import { useState, useEffect, useRef } from 'react'
import { Scale, ListFilter, Sliders, CheckCircle2, Plus, AlertCircle, Trash2, Wand2 } from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { SEED_CRITERIA_VERSION } from '../../../tests/fixtures/saw/golden.js'

const DEFAULT_CRITERIA = [
  { code: 'C1', name: 'Pendapatan per bulan', type: 'COST', weight: '0.25', unit: 'Rupiah' },
  { code: 'C2', name: 'Jumlah tanggungan', type: 'BENEFIT', weight: '0.20', unit: 'orang', scale: { min: 0 } },
  { code: 'C3', name: 'Kerentanan kondisi rumah', type: 'BENEFIT', weight: '0.15', unit: 'skor', scale: { min: 1, max: 5 } },
  { code: 'C4', name: 'Anggota keluarga rentan', type: 'BENEFIT', weight: '0.15', unit: 'skor', scale: { min: 0, max: 2 } },
  { code: 'C5', name: 'Skor kepemilikan aset produktif', type: 'COST', weight: '0.10', unit: 'skor', scale: { min: 1, max: 3 } },
  { code: 'C6', name: 'Tingkat Desil Kesejahteraan DTKS', type: 'COST', weight: '0.15', unit: 'Tingkat Desil (1-10)', scale: { min: 1, max: 10 } },
]

export function CriteriaView() {
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [feedbackToast, setFeedbackToast] = useState('')
  const [formData, setFormData] = useState({
    code: `C${DEFAULT_CRITERIA.length + 1}`,
    name: '',
    type: 'BENEFIT',
    weight: '0.10',
    unit: 'skor',
  })

  const containerRef = useRef(null)

  const totalWeight = criteria.reduce((acc, c) => acc + Number(c.weight), 0)
  const benefitCount = criteria.filter((c) => c.type === 'BENEFIT').length
  const costCount = criteria.filter((c) => c.type === 'COST').length
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001

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

  const colorPalette = ['#09291f', '#16765b', '#1b8a6a', '#20b47c', '#89d46e', '#0284c7', '#9333ea', '#ea580c']

  function handleAutoNormalize() {
    const rawSum = criteria.reduce((sum, c) => sum + Number(c.weight), 0)
    if (rawSum === 0) return

    const normalized = criteria.map((c) => {
      const share = Number(c.weight) / rawSum
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

    setCriteria(normalized)
    setFeedbackToast('Bobot seluruh kriteria berhasil dinormalisasi otomatis menjadi 1.00 (100%).')
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
    setCriteria(updated)
    setIsModalOpen(false)
    setFormData({
      code: `C${updated.length + 1}`,
      name: '',
      type: 'BENEFIT',
      weight: '0.10',
      unit: 'skor',
    })
    setFormError('')
    setFeedbackToast(`Kriteria ${code} berhasil ditambahkan! Silakan periksa atau normalisasi total bobot.`)
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  function handleDeleteCriteria(code) {
    if (criteria.length <= 3) {
      alert('Minimal harus ada 3 kriteria dalam perhitungan SAW.')
      return
    }
    const updated = criteria.filter((c) => c.code !== code)
    setCriteria(updated)
    setFeedbackToast(`Kriteria ${code} berhasil dihapus.`)
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  function handleResetSeed() {
    setCriteria(DEFAULT_CRITERIA)
    setFeedbackToast('Konfigurasi kriteria dikembalikan ke standar awal.')
    setTimeout(() => setFeedbackToast(''), 4000)
  }

  const columns = [
    {
      key: 'code',
      label: 'Kode',
      width: '12%',
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
      label: 'Nama Kriteria',
      width: '28%',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>
            {val}
          </span>
          {row.code === 'C6' && (
            <span
              className="clay-badge"
              style={{
                marginLeft: '8px',
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
      ),
    },
    {
      key: 'type',
      label: 'Tipe Atribut',
      width: '16%',
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
      width: '20%',
      render: (val) => {
        const pct = Math.round(Number(val) * 100)
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', color: 'var(--color-green-950)' }}>
              <span>{val}</span>
              <span>{pct}%</span>
            </div>
            <div className="clay-sunken" style={{ height: '7px', width: '100%', marginTop: '6px' }}>
              <div className="clay-progress-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--color-green-700)' }} />
            </div>
          </div>
        )
      },
    },
    { key: 'unit', label: 'Satuan Nilai', width: '14%' },
    {
      key: 'actions',
      label: 'Aksi',
      width: '10%',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleDeleteCriteria(row.code)}
          title={`Hapus kriteria ${row.code}`}
          className="clay-badge"
          style={{
            backgroundColor: '#ffffff',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '5px 10px',
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
      ),
    },
  ]

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={6}
        title="Manajemen Kriteria Penilaian SAW"
        description="Pengaturan kriteria penilaian kelayakan bansos, bobot preferensi (W), dan atribut matematis SAW."
        actions={
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                setIsModalOpen(true)
              }}
              style={{
                padding: '10px 22px',
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
          className="crit-stat-card clay-card"
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
              TOTAL KRITERIA AKTIF
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {criteria.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Parameter</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Termasuk C6: Desil DTKS
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
            <ListFilter size={22} />
          </div>
        </div>

        <div
          className="crit-stat-card clay-card"
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
                TOTAL AKUMULASI BOBOT
              </span>
              <span className="pulse-indicator" />
            </div>
            <div
              style={{
                fontSize: '30px',
                fontWeight: '800',
                fontFamily: 'var(--font-heading)',
                color: isWeightValid ? 'var(--color-green-700)' : 'var(--color-danger)',
                marginTop: '6px',
                lineHeight: 1.1,
              }}
            >
              {totalWeight.toFixed(2)}{' '}
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-muted)' }}>/ 1.00</span>
            </div>
            <div style={{ fontSize: '12px', color: isWeightValid ? 'var(--color-green-700)' : 'var(--color-danger)', marginTop: '4px', fontWeight: '700' }}>
              {isWeightValid ? 'Tepat 100% (Matematis Valid)' : `Penyimpangan: ${(totalWeight * 100).toFixed(0)}% (Harus 100%)`}
            </div>
          </div>
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
            <Scale size={22} />
          </div>
        </div>

        <div
          className="crit-stat-card clay-card"
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
              KOMPOSISI ATRIBUT
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-green-950)', marginTop: '8px', lineHeight: 1.1 }}>
              {benefitCount} Benefit : {costCount} Cost
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Keseimbangan parameter bantuan
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
            <Sliders size={22} />
          </div>
        </div>
      </div>

      {/* Visual Weight Distribution Stacked Bar with Claymorphism */}
      <div
        className="clay-card"
        style={{
          padding: '22px 26px',
          borderRadius: '24px',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-green-950)' }}>
              Distribusi Proporsi Bobot Kriteria ({Math.round(totalWeight * 100)}%)
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Representasi visual kontribusi masing-masing kriteria terhadap nilai preferensi akhir (V)
            </div>
          </div>
          <div
            className="clay-badge"
            style={{
              backgroundColor: isWeightValid ? '#edf8f3' : '#fee2e2',
              color: isWeightValid ? 'var(--color-green-700)' : '#dc2626',
              padding: '5px 12px',
              fontSize: '12px',
            }}
          >
            {isWeightValid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>Σ W = {totalWeight.toFixed(2)}</span>
          </div>
        </div>

        {/* 3D Sunken Stacked Bar */}
        <div
          className="clay-sunken"
          style={{
            height: '14px',
            width: '100%',
            display: 'flex',
          }}
        >
          {criteria.map((c, i) => {
            const pct = Math.max(1, (Number(c.weight) / (totalWeight || 1)) * 100)
            return (
              <div
                key={c.code}
                className="weight-bar-segment"
                data-width={`${pct}%`}
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  backgroundColor: colorPalette[i % colorPalette.length],
                  borderRight: i < criteria.length - 1 ? '1.5px solid #fff' : 'none',
                }}
                title={`${c.code} (${c.name}): ${Number(c.weight) * 100}%`}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          {criteria.map((c, i) => (
            <div
              key={c.code}
              className="clay-badge"
              style={{
                backgroundColor: '#ffffff',
                fontSize: '12px',
                padding: '5px 12px',
              }}
            >
              <span
                className="clay-marble"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: colorPalette[i % colorPalette.length],
                }}
              />
              <span style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>{c.code}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>({Math.round(Number(c.weight) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>

      <Panel
        title={`Versi Kriteria Aktif: ${SEED_CRITERIA_VERSION.label}`}
        subtitle="Total bobot harus selalu tepat 1,00 (100%) untuk menjamin validitas SAW."
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
            }}
          >
            Reset Standar
          </button>
        }
      >
        <DataTable columns={columns} data={criteria} />
      </Panel>

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
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Bobot Preferensi (0.01 – 0.99)
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
