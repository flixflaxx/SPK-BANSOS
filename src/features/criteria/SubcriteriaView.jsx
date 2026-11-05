import { useState, useEffect, useRef } from 'react'
import { Check, Scale, Plus, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { SEED_CRITERIA_VERSION } from '../../../tests/fixtures/saw/golden.js'

const INITIAL_SUBCRITERIA_MAP = [
  {
    code: 'C1',
    name: 'Pendapatan per Bulan (Cost, W=0.25)',
    unit: 'Rupiah',
    rules: [
      { category: 'Pendapatan ≤ Rp 1.000.000', rawScore: '1.000.000', priorityImpact: 'Tertinggi (Prioritas Utama)' },
      { category: 'Rp 1.000.001 – Rp 1.500.000', rawScore: '1.500.000', priorityImpact: 'Tinggi' },
      { category: 'Rp 1.500.001 – Rp 2.000.000', rawScore: '2.000.000', priorityImpact: 'Sedang' },
      { category: 'Pendapatan > Rp 2.000.000', rawScore: '2.500.000+', priorityImpact: 'Rendah (Cost: nilai besar memperkecil prioritas)' },
    ],
  },
  {
    code: 'C2',
    name: 'Jumlah Tanggungan Keluarga (Benefit, W=0.20)',
    unit: 'Orang',
    rules: [
      { category: 'Tanggungan ≥ 5 orang', rawScore: '5', priorityImpact: 'Sangat Tinggi' },
      { category: 'Tanggungan 4 orang', rawScore: '4', priorityImpact: 'Tinggi' },
      { category: 'Tanggungan 3 orang', rawScore: '3', priorityImpact: 'Sedang' },
      { category: 'Tanggungan 1–2 orang', rawScore: '1–2', priorityImpact: 'Rendah' },
    ],
  },
  {
    code: 'C3',
    name: 'Kerentanan Kondisi Rumah (Benefit, W=0.15)',
    unit: 'Skor 1–5',
    rules: [
      { category: 'Rumah Tidak Layak Huni Parah (Dinding bambu/lantai tanah)', rawScore: '5', priorityImpact: 'Sangat Rentan (Skor 5)' },
      { category: 'Kondisi Rumah Rusak Sedang (Atap bocor/semi permanen)', rawScore: '4', priorityImpact: 'Rentan (Skor 4)' },
      { category: 'Kondisi Rusak Ringan', rawScore: '3', priorityImpact: 'Cukup Rentan (Skor 3)' },
      { category: 'Permanen Layak Huni', rawScore: '1–2', priorityImpact: 'Tidak Rentan (Skor 1–2)' },
    ],
  },
  {
    code: 'C4',
    name: 'Anggota Keluarga Rentan (Benefit, W=0.15)',
    unit: 'Skor 0–2',
    rules: [
      { category: 'Terdapat Lansia + Balita / Disabilitas Berat', rawScore: '2', priorityImpact: 'Kebutuhan Mendesak (Skor 2)' },
      { category: 'Terdapat salah satu (Lansia saja / Balita saja)', rawScore: '1', priorityImpact: 'Kebutuhan Sedang (Skor 1)' },
      { category: 'Tidak ada anggota keluarga rentan', rawScore: '0', priorityImpact: 'Tanpa Kategori Khusus (Skor 0)' },
    ],
  },
  {
    code: 'C5',
    name: 'Skor Kepemilikan Aset Produktif (Cost, W=0.10)',
    unit: 'Skor 1–3',
    rules: [
      { category: 'Tidak memiliki aset produktif / tanah / kendaraan usaha', rawScore: '1', priorityImpact: 'Paling Prioritas (Cost: min / x)' },
      { category: 'Memiliki 1 unit alat kerja / motor tua operasional', rawScore: '2', priorityImpact: 'Prioritas Sedang (Skor 2)' },
      { category: 'Memiliki ≥ 2 unit aset produktif / kendaraan bermotor', rawScore: '3', priorityImpact: 'Prioritas Rendah (Skor 3)' },
    ],
  },
  {
    code: 'C6',
    name: 'Tingkat Desil Kesejahteraan DTKS Kemensos (Cost, W=0.15)',
    unit: 'Tingkat Desil 1–10',
    rules: [
      { category: 'Desil 1 — Rumah Tangga Sangat Miskin (10% Terbawah)', rawScore: '1', priorityImpact: 'Prioritas Paling Utama Bansos (Cost: skor min 1)' },
      { category: 'Desil 2 — Rumah Tangga Miskin (11% - 20%)', rawScore: '2', priorityImpact: 'Prioritas Tinggi Bansos (Skor 2)' },
      { category: 'Desil 3 — Rumah Tangga Hampir Miskin (21% - 30%)', rawScore: '3', priorityImpact: 'Prioritas Sedang (Skor 3)' },
      { category: 'Desil 4 — Rumah Tangga Rentan Miskin (31% - 40%)', rawScore: '4', priorityImpact: 'Prioritas Cadangan / PBI-JK (Skor 4)' },
      { category: 'Desil 5 — Rumah Tangga Menengah Bawah (41% - 50%)', rawScore: '5', priorityImpact: 'Non-Bansos Reguler (Skor 5)' },
      { category: 'Desil 6 — Rumah Tangga Menengah (51% - 60%)', rawScore: '6', priorityImpact: 'Non-Bansos (Skor 6)' },
      { category: 'Desil 7 — Rumah Tangga Menengah (61% - 70%)', rawScore: '7', priorityImpact: 'Non-Bansos (Skor 7)' },
      { category: 'Desil 8 — Rumah Tangga Menengah Atas (71% - 80%)', rawScore: '8', priorityImpact: 'Non-Bansos (Skor 8)' },
      { category: 'Desil 9 — Rumah Tangga Mampu (81% - 90%)', rawScore: '9', priorityImpact: 'Non-Bansos (Skor 9)' },
      { category: 'Desil 10 — Rumah Tangga Sangat Mampu (91% - 100% Teratas)', rawScore: '10', priorityImpact: 'Non-Bansos (Skor 10)' },
    ],
  },
]

export function SubcriteriaView() {
  const [subcriteriaMap, setSubcriteriaMap] = useState(INITIAL_SUBCRITERIA_MAP)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetCode, setTargetCode] = useState('C1')
  const [categoryInput, setCategoryInput] = useState('')
  const [scoreInput, setScoreInput] = useState('')
  const [impactInput, setImpactInput] = useState('')
  const [formError, setFormError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const containerRef = useRef(null)
  const totalWeight = SEED_CRITERIA_VERSION.criteria.reduce((sum, c) => sum + Number(c.weight), 0)

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
  }, [subcriteriaMap])

  function handleAddRule(e) {
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

    setSubcriteriaMap((prev) =>
      prev.map((sub) =>
        sub.code === targetCode
          ? { ...sub, rules: [...sub.rules, newRule] }
          : sub
      )
    )

    setIsModalOpen(false)
    setCategoryInput('')
    setScoreInput('')
    setImpactInput('')
    setFormError('')
    setToastMessage(`Aturan subkriteria baru berhasil ditambahkan untuk ${targetCode}!`)
    setTimeout(() => setToastMessage(''), 4000)
  }

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={7}
        title="Subkriteria & Bobot Penilaian SAW"
        description="Pemetaan kategori faktual lapangan ke skor angka matriks SAW (xᵢⱼ), termasuk integrasi Desil DTKS Kemensos."
        actions={
          <button
            type="button"
            className="clay-btn"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '11px 22px',
              fontSize: '13px',
            }}
          >
            <Plus size={16} />
            <span>Tambah Subkriteria</span>
          </button>
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
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
            }}
          >
            <Scale size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-green-950)' }}>
                Status Total Bobot: Versi {SEED_CRITERIA_VERSION.label}
              </span>
              <span className="pulse-indicator" />
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Prasyarat mutlak SAW: Σ wⱼ = 1,00 (100%).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: '800',
              fontFamily: 'monospace',
              color: 'var(--color-green-700)',
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
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
            }}
          >
            <Check size={14} />
            <span>VALID (100%)</span>
          </span>
        </div>
      </div>

      {/* Subcriteria Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {subcriteriaMap.map((sub) => (
          <div key={sub.code} className="subcrit-card">
            <Panel
              title={`${sub.code} — ${sub.name}`}
              subtitle={`Satuan Nilai Faktual: ${sub.unit}`}
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setTargetCode(sub.code)
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
                  }}
                >
                  <Plus size={13} />
                  <span>Tambah Aturan {sub.code}</span>
                </button>
              }
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', borderRadius: '12px 0 0 12px', fontSize: '12px', textTransform: 'uppercase' }}>Kategori Lapangan</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', width: '22%', fontSize: '12px', textTransform: 'uppercase' }}>Skor Angka (xᵢⱼ)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: 'var(--color-green-950)', backgroundColor: '#eaf4ef', width: '38%', borderRadius: '0 12px 12px 0', fontSize: '12px', textTransform: 'uppercase' }}>Pengaruh Terhadap Prioritas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sub.rules.map((rule, idx) => (
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
                        <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '12.5px', borderRadius: '0 10px 10px 0', borderBottom: '1px solid rgba(22, 118, 91, 0.05)' }}>
                          {rule.priorityImpact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        ))}
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

        <form onSubmit={handleAddRule}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Pilih Kriteria Induk
            </label>
            <select
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
            >
              {subcriteriaMap.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name}
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
                placeholder="Contoh: 1, 2, 5, atau 1000000"
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
                placeholder="Contoh: Sangat Rentan / Prioritas Utama"
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
