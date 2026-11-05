import { useState, useEffect, useRef } from 'react'
import {
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Edit3,
} from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { DESIL_OPTIONS, getDesilMeta } from './desilConstants.js'

export function DesilView({ residents, onUpdateResidentDesil }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncToast, setSyncToast] = useState('')
  const [editingResident, setEditingResident] = useState(null)
  const [editDesil, setEditDesil] = useState(1)
  const [editStatus, setEditStatus] = useState('TERDAFTAR')

  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.desil-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
    }
  }, [])

  // Calculate statistics
  const desil1Count = residents.filter((r) => Number(r.desil) === 1).length
  const desil2Count = residents.filter((r) => Number(r.desil) === 2).length
  const desil3Count = residents.filter((r) => Number(r.desil) === 3).length
  const desil4Count = residents.filter((r) => Number(r.desil) === 4).length
  const nonDtksCount = residents.filter((r) => Number(r.desil) > 4 || !r.desil).length
  const dtksRegisteredCount = residents.filter((r) => r.dtksStatus === 'TERDAFTAR').length

  const avgPovertyIndex =
    residents.length > 0
      ? (
          residents.reduce((sum, r) => sum + (r.povertyIndex || 50), 0) /
          residents.length
        ).toFixed(1)
      : '0.0'

  // Filter residents
  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.addressRtRw && r.addressRtRw.includes(searchQuery)) ||
      (r.nikMasked && r.nikMasked.includes(searchQuery))

    if (!matchesSearch) return false

    if (selectedFilter === 'ALL') return true
    if (selectedFilter === 'PRIORITAS_BANSOS') return Number(r.desil) <= 4
    if (selectedFilter === 'NON_BANSOS') return Number(r.desil) > 4
    if (selectedFilter.startsWith('DESIL_')) {
      const targetDesil = Number(selectedFilter.replace('DESIL_', ''))
      return Number(r.desil) === targetDesil
    }
    return true
  })

  function handleSimulateSync() {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setSyncToast('Sinkronisasi data DTKS Kemensos RI berhasil diperbarui.')
      setTimeout(() => setSyncToast(''), 4000)
    }, 1200)
  }

  function handleSaveEditDesil(e) {
    e.preventDefault()
    if (!editingResident) return

    const meta = getDesilMeta(editDesil)

    const updated = {
      ...editingResident,
      desil: Number(editDesil),
      desilLabel: meta.label,
      dtksStatus: editStatus,
      povertyIndex: meta.povertyIndex,
      socialAidEligibility: meta.socialAidEligibility,
    }

    if (onUpdateResidentDesil) {
      onUpdateResidentDesil(updated)
    }

    setEditingResident(null)
  }

  const columns = [
    {
      key: 'name',
      label: 'Nama Warga',
      width: '22%',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>{val}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-green-700)' }}>
            {row.nikMasked}
          </div>
        </div>
      ),
    },
    {
      key: 'desil',
      label: 'Klasifikasi Desil',
      width: '18%',
      render: (val) => {
        const meta = getDesilMeta(val)
        return (
          <span
            className="clay-badge"
            title={meta.selectLabel}
            style={{
              backgroundColor: meta.bg,
              color: meta.color,
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: '800',
              border: `1px solid ${meta.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {meta.label}
          </span>
        )
      },
    },
    {
      key: 'dtksStatus',
      label: 'Status DTKS',
      width: '14%',
      render: (val) => {
        const isRegistered = val === 'TERDAFTAR'
        const isPending = val === 'DALAM_PROSES'
        return (
          <span
            className="clay-badge"
            style={{
              fontSize: '11px',
              fontWeight: '800',
              backgroundColor: isRegistered ? '#edf8f3' : isPending ? '#fef3c7' : '#f1f5f9',
              color: isRegistered ? 'var(--color-green-700)' : isPending ? 'var(--color-warning)' : 'var(--color-text-muted)',
              padding: '3px 10px',
            }}
          >
            {val || 'BELUM TERDAFTAR'}
          </span>
        )
      },
    },
    {
      key: 'povertyIndex',
      label: 'Indeks Kerentanan',
      width: '14%',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', color: 'var(--color-green-950)' }}>
            {val ? `${val}` : '50.0'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>/ 100</span>
        </div>
      ),
    },
    {
      key: 'socialAidEligibility',
      label: 'Kelayakan Bantuan',
      width: '18%',
      render: (val, row) => {
        const d = Number(row.desil) || 1
        const programTag = d <= 2 ? 'Sembako + PKH' : d === 3 ? 'Sembako' : d === 4 ? 'PBI-JK' : 'Non-Bansos'
        return (
          <div>
            <span
              className="clay-badge"
              style={{
                fontSize: '11px',
                fontWeight: '800',
                backgroundColor: d <= 2 ? '#edf8f3' : '#f8fafc',
                color: d <= 2 ? 'var(--color-green-700)' : 'var(--color-text-muted)',
                padding: '2px 8px',
              }}
            >
              {val === 'PRIORITAS_UTAMA' ? 'Prioritas Utama' : val === 'PRIORITAS_SEDANG' ? 'Prioritas Sedang' : val === 'CADANGAN' ? 'Cadangan' : 'Tidak Memenuhi'}
            </span>
            <div style={{ fontSize: '10.5px', color: 'var(--color-green-800)', marginTop: '2px', fontWeight: '700' }}>
              Rekomendasi: {programTag}
            </div>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '14%',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            setEditingResident(row)
            setEditDesil(row.desil || 1)
            setEditStatus(row.dtksStatus || 'TERDAFTAR')
          }}
          className="clay-btn"
          style={{
            fontSize: '11.5px',
            padding: '5px 12px',
            cursor: 'pointer',
          }}
        >
          <Edit3 size={13} />
          <span>Ubah Desil</span>
        </button>
      ),
    },
  ]

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum="3B"
        title="Tingkat Desil Kesejahteraan Warga (DTKS)"
        description="Integrasi pemetaan desil ekonomi Kemensos RI dengan data kependudukan Kampung Bulak Amah untuk penyaluran bansos tepat sasaran."
        actions={
          <button
            type="button"
            className="clay-btn"
            disabled={isSyncing}
            onClick={handleSimulateSync}
            style={{
              padding: '11px 22px',
              fontSize: '13px',
            }}
          >
            <RefreshCw size={16} className={isSyncing ? 'calc-icon-spin' : ''} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi DTKS Kemensos'}</span>
          </button>
        }
      />

      {syncToast && (
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
          <span>{syncToast}</span>
        </div>
      )}

      {/* 4 Claymorphism Metric Cards */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '18px',
          marginBottom: '26px',
        }}
      >
        {/* Desil 1 & 2 */}
        <div
          className="desil-stat-card clay-card"
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
              DESIL 1 & 2 (PRIORITAS UTAMA)
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#b91c1c', marginTop: '6px', lineHeight: 1.1 }}>
              {desil1Count + desil2Count} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Warga</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Sangat Miskin &amp; Miskin Ekstrem
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
            }}
          >
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Desil 3 & 4 */}
        <div
          className="desil-stat-card clay-card"
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
              DESIL 3 & 4 (RENTAN MISKIN)
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '6px', lineHeight: 1.1 }}>
              {desil3Count + desil4Count} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Warga</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Hampir Miskin &amp; Rentan Finansial
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
            <Layers size={22} />
          </div>
        </div>

        {/* Status DTKS Terdaftar */}
        <div
          className="desil-stat-card clay-card"
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
                TERDAFTAR DI DTKS
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '6px', lineHeight: 1.1 }}>
              {dtksRegisteredCount} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>/ {residents.length}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Terverifikasi ID Kemensos RI
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

        {/* Indeks Kerentanan Rata-rata */}
        <div
          className="desil-stat-card clay-card"
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
              RATA-RATA INDEKS KEMISKINAN
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {avgPovertyIndex} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Skor</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Skala standar nasional (0 - 100)
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
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* Visual Desil Distribution Bar */}
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
              Distribusi Tingkat Desil Warga Kampung Bulak Amah
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Komposisi demografi kesejahteraan berdasarkan klasifikasi DTKS Kemensos RI
            </div>
          </div>
          <div className="clay-badge" style={{ backgroundColor: '#edf8f3', color: 'var(--color-green-700)', padding: '5px 12px', fontSize: '12px' }}>
            Total: {residents.length} Jiwa
          </div>
        </div>

        {/* 3D Sunken Stacked Distribution Track */}
        <div
          className="clay-sunken"
          style={{
            height: '14px',
            width: '100%',
            display: 'flex',
          }}
        >
          {DESIL_OPTIONS.map((opt) => {
            const count = residents.filter((r) => Number(r.desil) === opt.value).length
            if (count === 0) return null
            return (
              <div
                key={opt.value}
                style={{
                  width: `${(count / residents.length) * 100}%`,
                  backgroundColor: opt.color,
                  borderRight: '1.5px solid #fff',
                }}
                title={`${opt.label}: ${count} warga`}
              />
            )
          })}
        </div>

        {/* Interactive Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Semua Data', count: residents.length, color: '#09291f' },
            { id: 'PRIORITAS_BANSOS', label: 'Prioritas Bansos (Desil 1–4)', count: residents.filter((r) => Number(r.desil) <= 4).length, color: '#ef4444' },
            { id: 'NON_BANSOS', label: 'Mampu (Desil 5–10)', count: residents.filter((r) => Number(r.desil) > 4).length, color: '#64748b' },
            ...DESIL_OPTIONS.map((opt) => ({
              id: `DESIL_${opt.value}`,
              label: opt.shortLabel,
              count: residents.filter((r) => Number(r.desil) === opt.value).length,
              color: opt.color,
            })),
          ].map((tab) => {
            const isActive = selectedFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={isActive ? 'clay-item' : 'clay-badge'}
                style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  padding: '6px 14px',
                  backgroundColor: isActive ? '#ffffff' : '#f8fafc',
                  border: isActive ? '1.5px solid var(--color-green-600)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tab.color,
                  }}
                />
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'var(--color-green-700)' : '#e2e8f0',
                    color: isActive ? '#fff' : '#475569',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel Tabel Warga Terintegrasi Desil */}
      <Panel title="Daftar Warga & Integrasi Tingkat Desil DTKS">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '440px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-green-700)' }} />
            <input
              type="text"
              placeholder="Cari warga, NIK, atau RT/RW..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: '9999px',
                fontSize: '13px',
              }}
            />
          </div>
          <span className="clay-badge" style={{ backgroundColor: '#ffffff', color: 'var(--color-text-muted)', fontSize: '12px', padding: '7px 14px' }}>
            Menampilkan {filteredResidents.length} dari {residents.length} warga
          </span>
        </div>

        <DataTable columns={columns} data={filteredResidents} />
      </Panel>

      {/* Modal Edit Desil Warga */}
      <Modal
        isOpen={Boolean(editingResident)}
        onClose={() => setEditingResident(null)}
        title={`Perbarui Tingkat Desil — ${editingResident?.name || ''}`}
      >
        <form onSubmit={handleSaveEditDesil}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Nama Warga
            </label>
            <input
              type="text"
              readOnly
              value={editingResident?.name || ''}
              style={{ width: '100%', backgroundColor: '#f8fafc', color: 'var(--color-text-muted)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Tingkat Desil DTKS Baru
            </label>
            <select
              value={editDesil}
              onChange={(e) => setEditDesil(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px' }}
            >
              {DESIL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.selectLabel}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Status Pendaftaran di DTKS Kemensos
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px' }}
            >
              <option value="TERDAFTAR">TERDAFTAR (ID Kemensos Aktif)</option>
              <option value="DALAM_PROSES">DALAM_PROSES (Pengajuan Validasi Baru)</option>
              <option value="BELUM_TERDAFTAR">BELUM_TERDAFTAR (Di Luar Basis Data DTKS)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setEditingResident(null)}
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
              Simpan Perubahan Desil
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
