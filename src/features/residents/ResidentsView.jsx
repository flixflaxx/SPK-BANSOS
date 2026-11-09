import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  FolderOpen,
  Plus,
  Users,
  FileCheck2,
  Home,
  Search,
  UserCheck,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  X,
  CreditCard,
  FileText,
} from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { DESIL_OPTIONS, getDesilMeta } from './desilConstants.js'
import {
  RESIDENT_DOC_CATEGORIES,
  getResidentDocuments,
  formatFileSize,
} from './residentDocuments.js'
import { ResidentDocumentViewerModal } from './ResidentDocumentViewerModal.jsx'

export function ResidentsView({
  residents,
  onAddResident,
  onUpdateResident,
  initialModalOpen = false,
  initialEditingResident = null,
  initialViewingDocsResident = null,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen)
  const [viewingDocsResident, setViewingDocsResident] = useState(initialViewingDocsResident)
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    birthDate: '',
    addressStreet: '',
    addressRtRw: '',
    phone: '',
    desil: 1,
  })
  const [uploadedFiles, setUploadedFiles] = useState({
    kk: null,
    ktp: null,
    rumah: null,
    suratRt: null,
  })
  const [formError, setFormError] = useState('')

  // State untuk Pop-up Alert Edit Profil Warga (SweetAlert style)
  const [editingResident, setEditingResident] = useState(initialEditingResident)
  const [editFormData, setEditFormData] = useState({
    name: '',
    nikMasked: '',
    addressRtRw: '',
    addressStreet: '',
    phone: '',
    desil: 1,
    documentCount: 1,
    birthDate: '',
  })
  const [editFormError, setEditFormError] = useState('')
  const [editSuccessAlert, setEditSuccessAlert] = useState(null)

  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.resident-stat-card'),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(80),
        duration: 550,
        easing: 'easeOutBack',
      })
    }
  }, [])

  // Scroll lock & Keyboard shortcut (Escape) untuk Alert Pop-up Edit Profil
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && editingResident) {
        setEditingResident(null)
        setEditSuccessAlert(null)
      }
    }
    if (editingResident) {
      document.body.classList.add('scroll-locked')
      document.documentElement.classList.add('scroll-locked')
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.classList.remove('scroll-locked')
      document.documentElement.classList.remove('scroll-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingResident])

  const filteredResidents = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.addressRtRw.includes(searchQuery) ||
      r.addressStreet.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalDocuments = residents.reduce((acc, r) => acc + (r.documentCount || 0), 0)

  // Buka Pop-up Alert Edit Profil
  function handleOpenEditModal(resident) {
    setEditingResident(resident)
    setEditFormData({
      id: resident.id,
      name: resident.name || '',
      nikMasked: resident.nikMasked || '',
      addressRtRw: resident.addressRtRw || '001/003',
      addressStreet: resident.addressStreet || '',
      phone: resident.phone || '',
      desil: Number(resident.desil || 1),
      documentCount: resident.documentCount ?? 1,
      birthDate: resident.birthDate || '1980-01-01',
    })
    setEditFormError('')
    setEditSuccessAlert(null)
  }

  // Simpan Perubahan Profil Warga
  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editFormData.name.trim()) {
      setEditFormError('Nama lengkap warga wajib diisi.')
      return
    }
    if (!editFormData.addressRtRw.trim()) {
      setEditFormError('RT / RW wajib diisi.')
      return
    }

    const desilNum = Number(editFormData.desil || 1)
    const meta = getDesilMeta(desilNum)

    const updatedResident = {
      ...editingResident,
      name: editFormData.name.trim(),
      addressRtRw: editFormData.addressRtRw.trim(),
      addressStreet: editFormData.addressStreet.trim(),
      phone: editFormData.phone.trim(),
      desil: desilNum,
      desilLabel: meta.label,
      dtksStatus: meta.dtksStatus,
      documentCount: Number(editFormData.documentCount) || 1,
      birthDate: editFormData.birthDate || '1980-01-01',
      povertyIndex: meta.povertyIndex,
      socialAidEligibility: meta.socialAidEligibility,
      updatedAt: new Date().toISOString(),
    }

    if (onUpdateResident) {
      onUpdateResident(updatedResident)
    }

    // Tampilkan feedback pop up alert sukses
    setEditSuccessAlert(`Data profil ${updatedResident.name} berhasil disimpan ke database.`)
    setTimeout(() => {
      setEditSuccessAlert(null)
      setEditingResident(null)
    }, 1400)
  }

  function handleFileChange(catKey, e) {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl =
      typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : null
    setUploadedFiles((prev) => ({
      ...prev,
      [catKey]: {
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        previewUrl,
      },
    }))
  }

  function handleRemoveFile(catKey) {
    setUploadedFiles((prev) => ({
      ...prev,
      [catKey]: null,
    }))
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Nama lengkap warga wajib diisi.')
      return
    }
    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      setFormError('NIK harus tepat 16 digit angka.')
      return
    }
    const masked = `${formData.nik.slice(0, 6)}******${formData.nik.slice(12)}`
    const desilNum = Number(formData.desil || 1)
    const meta = getDesilMeta(desilNum)

    // Kumpulkan dokumen yang diunggah
    const uploadedDocsList = []
    RESIDENT_DOC_CATEGORIES.forEach((cat) => {
      const userFile = uploadedFiles[cat.key]
      if (userFile) {
        uploadedDocsList.push({
          key: cat.key,
          code: cat.code,
          title: cat.title,
          shortTitle: cat.shortTitle,
          description: cat.description,
          fileName: userFile.name,
          fileSize: userFile.size,
          mimeType: userFile.type,
          uploadedAt: new Date().toISOString(),
          previewUrl: userFile.previewUrl,
          isUploaded: true,
          status: 'TERVERIFIKASI',
        })
      }
    })

    const docCount = uploadedDocsList.length > 0 ? uploadedDocsList.length : 4

    const newResident = {
      id: `res-${Date.now()}`,
      nikMasked: masked,
      nikLookupHash: `hash-${Date.now()}`,
      name: formData.name.trim(),
      birthDate: formData.birthDate || '1980-01-01',
      addressStreet: formData.addressStreet.trim() || 'Kampung Bulak Amah',
      addressRtRw: formData.addressRtRw.trim() || '001/003',
      phone: formData.phone.trim() || '0812-****-0000',
      documentCount: docCount,
      documents: uploadedDocsList.length > 0 ? uploadedDocsList : undefined,
      desil: desilNum,
      desilLabel: meta.label,
      dtksStatus: meta.dtksStatus,
      povertyIndex: meta.povertyIndex,
      socialAidEligibility: meta.socialAidEligibility,
      createdAt: new Date().toISOString(),
    }
    onAddResident(newResident)
    setIsModalOpen(false)
    setFormData({ name: '', nik: '', birthDate: '', addressStreet: '', addressRtRw: '', phone: '', desil: 1 })
    setUploadedFiles({ kk: null, ktp: null, rumah: null, suratRt: null })
    setFormError('')
  }

  const columns = [
    {
      key: 'name',
      label: 'Nama Warga',
      width: '20%',
      render: (val) => (
        <span style={{ fontWeight: '800', color: 'var(--color-green-950)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'nikMasked',
      label: 'NIK (Masked)',
      width: '15%',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--color-green-700)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'desil',
      label: 'Desil DTKS',
      width: '15%',
      render: (val) => {
        const meta = getDesilMeta(val)
        return (
          <span
            className="clay-badge"
            title={meta.selectLabel}
            style={{
              backgroundColor: meta.bg,
              color: meta.color,
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: '800',
              border: `1px solid ${meta.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {meta.shortLabel}
          </span>
        )
      },
    },
    {
      key: 'addressRtRw',
      label: 'RT / RW',
      width: '10%',
      render: (val) => (
        <span className="clay-badge" style={{ backgroundColor: '#edf8f3', color: 'var(--color-green-800)', padding: '3px 10px' }}>
          {val}
        </span>
      ),
    },
    { key: 'addressStreet', label: 'Alamat Detail', width: '18%' },
    {
      key: 'documentCount',
      label: 'Bukti Berkas',
      width: '13%',
      render: (count, row) => {
        const docs = getResidentDocuments(row)
        const total = docs.length || count || 4
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setViewingDocsResident(row)
            }}
            className="clay-badge resident-docs-btn"
            title={`Klik untuk melihat dokumen dan berkas kependudukan milik ${row.name}`}
            style={{
              fontSize: '11.5px',
              color: 'var(--fintech-primary, #087A59)',
              backgroundColor: '#edf8f3',
              padding: '5px 11px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: '1px solid rgba(8, 122, 89, 0.28)',
              borderRadius: '9999px',
            }}
          >
            <FolderOpen size={13} />
            <span>{total} Dokumen</span>
            <span
              style={{
                fontSize: '10px',
                backgroundColor: 'var(--fintech-primary, #087A59)',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '1px 6px',
                fontWeight: '800',
                marginLeft: '2px',
              }}
            >
              Lihat
            </span>
          </button>
        )
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '12%',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleOpenEditModal(row)}
          className="clay-badge"
          title={`Lihat Profil & Edit ${row.name}`}
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
          <span>Lihat Profil</span>
        </button>
      ),
    },
  ]

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={3}
        title="Data Warga"
        description="Pengelolaan identitas warga dan berkas kependudukan."
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
            <span>Tambah Data Warga</span>
          </button>
        }
      />

      {/* Top 3 Squircle Metric Cards */}
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
          className="resident-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TOTAL WARGA TERDAFTAR
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {residents.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Jiwa</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Basis data master kependudukan
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="resident-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DOKUMEN TERVERIFIKASI
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {totalDocuments} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Berkas</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              KK, KTP, dan SKTM warga
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileCheck2 size={22} />
          </div>
        </div>

        <div
          className="resident-stat-card clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              WILAYAH BULAK AMAH
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              08 <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>RT</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Cakupan RW 003 Bulak Amah
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <Panel
        title="Daftar Warga Terdaftar"
        subtitle="Data identitas warga Kampung Bulak Amah untuk penentuan bantuan sosial."
        actions={
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-subtle)',
              }}
            />
            <input
              type="text"
              placeholder="Cari nama atau RT/RW..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '34px',
                width: '100%',
                fontSize: '12.5px',
                paddingTop: '8px',
                paddingBottom: '8px',
              }}
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredResidents}
          keyField="id"
          emptyMessage="Tidak ada data warga yang sesuai dengan pencarian."
        />
      </Panel>

      {/* Modal Tambah Data Warga Baru */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Data Warga Baru"
        maxWidth="640px"
      >
        <form onSubmit={handleCreate} style={{ padding: '24px 26px' }}>
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Nama Lengkap Warga
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              NIK (16 Digit Angka)
            </label>
            <input
              type="text"
              maxLength={16}
              required
              placeholder="3201012345670001"
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                RT / RW
              </label>
              <input
                type="text"
                placeholder="001/003"
                value={formData.addressRtRw}
                onChange={(e) => setFormData({ ...formData, addressRtRw: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
                Nomor Telepon / HP
              </label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Alamat Jalan / Tempat Tinggal
            </label>
            <input
              type="text"
              placeholder="Jl. Bulak Amah RT 01"
              value={formData.addressStreet}
              onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-green-950)' }}>
              Klasifikasi Desil Kesejahteraan (DTKS Kemensos Desil 1–10)
            </label>
            <select
              value={formData.desil || 1}
              onChange={(e) => setFormData({ ...formData, desil: Number(e.target.value) })}
              style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
            >
              {DESIL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.selectLabel}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '4px', display: 'block' }}>
              Klasifikasi pendataan seluruh warga dari Desil 1 (Sangat Miskin) hingga Desil 10 (Sangat Mampu).
            </span>
          </div>

          {/* ========================================================
              INPUT BUKTI BERKAS PERSYARATAN WARGA (4 KATEGORI)
              ======================================================== */}
          <div
            style={{
              marginTop: '16px',
              marginBottom: '22px',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: '#F8FAF9',
              border: '1px solid #E2EBE6',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--color-green-950)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: 0,
                }}
              >
                <FolderOpen size={16} color="var(--fintech-primary, #087A59)" />
                <span>Unggah Bukti Berkas Warga (4 Kategori)</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                JPG, PNG, atau PDF (Maks. 5MB)
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}
            >
              {RESIDENT_DOC_CATEGORIES.map((cat) => {
                const fileData = uploadedFiles[cat.key]
                return (
                  <div
                    key={cat.key}
                    className={`doc-upload-tile ${fileData ? 'has-file' : ''}`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: cat.badgeColor,
                          backgroundColor: cat.bgColor,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {cat.code} · {cat.shortTitle}
                      </span>
                      {fileData && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            color: '#087A59',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <CheckCircle2 size={12} /> Terpilih
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-subtle)',
                        margin: '0 0 8px 0',
                        lineHeight: 1.3,
                      }}
                    >
                      {cat.description}
                    </p>

                    {fileData ? (
                      <div
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          border: '1px solid #C7E6D7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ overflow: 'hidden', marginRight: '8px' }}>
                          <div
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: 'var(--color-green-950)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: 'monospace',
                            }}
                            title={fileData.name}
                          >
                            {fileData.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>
                            {fileData.size}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(cat.key)}
                          title="Hapus berkas ini"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          border: '1px dashed #CBD5E1',
                          color: 'var(--color-green-900)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Plus size={13} />
                        <span>Pilih {cat.shortTitle}</span>
                        <input
                          type="file"
                          accept={cat.accept}
                          onChange={(e) => handleFileChange(cat.key, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                )
              })}
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
              Simpan Data Warga
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          POP-UP ALERT: LIHAT & EDIT PROFIL WARGA (SWEETALERT STYLE)
          ======================================================== */}
      {editingResident &&
        (() => {
          const alertContent = (
            <div
              className="fintech-alert-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="alert-popup-title"
              onClick={(e) => {
                if (e.target === e.currentTarget && !editSuccessAlert) {
                  setEditSuccessAlert(null)
                  setEditingResident(null)
                }
              }}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="fintech-alert-popup">
                {/* Tombol Tutup X di sudut */}
                <button
                  type="button"
                  className="fintech-alert-close"
                  onClick={() => {
                    setEditSuccessAlert(null)
                    setEditingResident(null)
                  }}
                  title="Tutup (Esc)"
                  aria-label="Tutup edit profil warga"
                >
                  <X size={16} />
                </button>

                {/* State 1: Alert Sukses (SweetAlert Success State) */}
                {editSuccessAlert ? (
                  <div style={{ textAlign: 'center', padding: '16px 8px 10px' }}>
                    <div className="fintech-alert-icon-circle success">
                      <CheckCircle2 size={36} strokeWidth={2.5} />
                    </div>
                    <h3
                      id="alert-popup-title"
                      className="fintech-alert-title"
                      style={{ color: 'var(--fintech-success, #16A36B)' }}
                    >
                      Berhasil Diperbarui!
                    </h3>
                    <p className="fintech-alert-subtitle" style={{ marginBottom: '24px' }}>
                      {editSuccessAlert}
                    </p>
                    <button
                      type="button"
                      className="fintech-alert-btn-confirm"
                      onClick={() => {
                        setEditSuccessAlert(null)
                        setEditingResident(null)
                      }}
                      style={{ minWidth: '130px', justifyContent: 'center', margin: '0 auto' }}
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  /* State 2: Pop-up Alert Form Edit Profil Warga */
                  <div>
                    {/* Alert Top Icon */}
                    <div className="fintech-alert-icon-circle">
                      <UserCheck size={32} strokeWidth={2.2} />
                    </div>

                    <h3 id="alert-popup-title" className="fintech-alert-title">
                      Edit Profil Warga
                    </h3>
                    <p className="fintech-alert-subtitle">
                      Perbarui identitas kependudukan dan status klasifikasi DTKS
                    </p>

                    {/* Subtitle / NIK Badge */}
                    <div className="fintech-alert-badge-row">
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          backgroundColor: '#F4F6F5',
                          border: '1px solid #EDF0EE',
                          fontSize: '11.5px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--fintech-primary, #087A59)',
                        }}
                      >
                        <ShieldCheck size={13} />
                        NIK: {editingResident.nikMasked}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: getDesilMeta(editingResident.desil).bg,
                          border: `1px solid ${getDesilMeta(editingResident.desil).border}`,
                          fontSize: '11px',
                          fontWeight: 700,
                          color: getDesilMeta(editingResident.desil).color,
                        }}
                      >
                        {getDesilMeta(editingResident.desil).label}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setViewingDocsResident(editingResident)
                        }}
                        className="clay-badge"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--fintech-soft-green, #E8F5EF)',
                          border: '1px solid rgba(8, 122, 89, 0.25)',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--fintech-primary, #087A59)',
                          cursor: 'pointer',
                        }}
                        title={`Buka 4 dokumen persyaratan milik ${editingResident.name}`}
                      >
                        <FolderOpen size={13} />
                        Lihat Berkas ({editingResident.documentCount || 4})
                      </button>
                    </div>

                    {/* Error Banner jika ada */}
                    {editFormError && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          color: '#991B1B',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <AlertCircle size={16} />
                        <span>{editFormError}</span>
                      </div>
                    )}

                    {/* Form Input SweetAlert style */}
                    <form onSubmit={handleSaveEdit} className="fintech-alert-form">
                      <div className="fintech-alert-field">
                        <label htmlFor="edit-name" className="fintech-alert-label">
                          Nama Lengkap Warga
                        </label>
                        <input
                          id="edit-name"
                          type="text"
                          required
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          placeholder="Masukkan nama lengkap..."
                          className="fintech-alert-input"
                          autoFocus
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="fintech-alert-field">
                          <label htmlFor="edit-rtrw" className="fintech-alert-label">
                            RT / RW
                          </label>
                          <input
                            id="edit-rtrw"
                            type="text"
                            required
                            value={editFormData.addressRtRw}
                            onChange={(e) => setEditFormData({ ...editFormData, addressRtRw: e.target.value })}
                            placeholder="Contoh: 001/003"
                            className="fintech-alert-input"
                          />
                        </div>

                        <div className="fintech-alert-field">
                          <label htmlFor="edit-phone" className="fintech-alert-label">
                            Nomor WhatsApp / HP
                          </label>
                          <input
                            id="edit-phone"
                            type="text"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            placeholder="0812-xxxx-xxxx"
                            className="fintech-alert-input"
                          />
                        </div>
                      </div>

                      <div className="fintech-alert-field">
                        <label htmlFor="edit-street" className="fintech-alert-label">
                          Alamat Jalan / Tempat Tinggal
                        </label>
                        <input
                          id="edit-street"
                          type="text"
                          value={editFormData.addressStreet}
                          onChange={(e) => setEditFormData({ ...editFormData, addressStreet: e.target.value })}
                          placeholder="Contoh: Jl. Bulak Amah RT 01"
                          className="fintech-alert-input"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                        <div className="fintech-alert-field">
                          <label htmlFor="edit-desil" className="fintech-alert-label">
                            Tingkat Desil DTKS
                          </label>
                          <select
                            id="edit-desil"
                            value={editFormData.desil}
                            onChange={(e) => setEditFormData({ ...editFormData, desil: Number(e.target.value) })}
                            className="fintech-alert-input"
                          >
                            {DESIL_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="fintech-alert-field">
                          <label htmlFor="edit-docs" className="fintech-alert-label">
                            Jumlah Bukti Berkas
                          </label>
                          <input
                            id="edit-docs"
                            type="number"
                            min={1}
                            max={10}
                            value={editFormData.documentCount}
                            onChange={(e) => setEditFormData({ ...editFormData, documentCount: Number(e.target.value) || 1 })}
                            className="fintech-alert-input"
                          />
                        </div>
                      </div>

                      <div className="fintech-alert-actions">
                        <button
                          type="button"
                          className="fintech-alert-btn-cancel"
                          onClick={() => {
                            setEditSuccessAlert(null)
                            setEditingResident(null)
                          }}
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="fintech-alert-btn-confirm"
                        >
                          <Check size={16} />
                          <span>Simpan Perubahan</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )

          if (typeof document !== 'undefined') {
            return createPortal(alertContent, document.body)
          }
          return alertContent
        })()}

      {/* ========================================================
          MODAL: PRATINJAU BUKTI BERKAS & DOKUMEN WARGA (INTERAKTIF)
          ======================================================== */}
      <ResidentDocumentViewerModal
        isOpen={Boolean(viewingDocsResident)}
        onClose={() => setViewingDocsResident(null)}
        resident={viewingDocsResident}
        onOpenEditProfile={(res) => {
          setViewingDocsResident(null)
          handleOpenEditModal(res)
        }}
      />
    </div>
  )
}
