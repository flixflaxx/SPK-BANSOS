import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Users,
  ShieldCheck,
  Lock,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import {
  ROLE_DEFINITIONS,
  getRoleMeta,
  isUserAdmin,
} from './userRoleConstants.js'

export function UsersView({
  users = [],
  currentUser = null,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) {
  const containerRef = useRef(null)

  // Otorisasi Hak Akses Admin (Hanya Super Admin yang berhak Tambah, Edit, Hapus)
  const isAdmin = isUserAdmin(currentUser)

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [formError, setFormError] = useState('')
  const [successNotice, setSuccessNotice] = useState(null)

  // Form State untuk Tambah Pengguna
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'OPERATOR',
    status: 'ACTIVE',
  })

  // Form State untuk Edit Pengguna
  const [editFormData, setEditFormData] = useState({
    id: '',
    displayName: '',
    email: '',
    role: 'OPERATOR',
    status: 'ACTIVE',
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.anime && containerRef.current) {
      window.anime({
        targets: containerRef.current.querySelectorAll('.user-stat-card'),
        opacity: [0, 1],
        translateY: [12, 0],
        delay: window.anime.stagger(80),
        duration: 450,
        easing: 'easeOutCubic',
      })
    }
  }, [])

  // Lock scroll & handle Escape key when modals are open
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false)
        setEditingUser(null)
        setDeletingUser(null)
        setFormError('')
      }
    }
    const hasOpenModal = isAddModalOpen || editingUser || deletingUser
    if (hasOpenModal) {
      document.body.classList.add('scroll-locked')
      document.documentElement.classList.add('scroll-locked')
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.classList.remove('scroll-locked')
      document.documentElement.classList.remove('scroll-locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAddModalOpen, editingUser, deletingUser])

  function showNotification(msg) {
    setSuccessNotice(msg)
    setTimeout(() => {
      setSuccessNotice(null)
    }, 2400)
  }

  // Buka Modal Tambah
  function handleOpenAddModal() {
    if (!isAdmin) return
    setFormData({
      displayName: '',
      email: '',
      role: 'OPERATOR',
      status: 'ACTIVE',
    })
    setFormError('')
    setIsAddModalOpen(true)
  }

  // Simpan Tambah Pengguna Baru
  function handleSaveAdd(e) {
    e.preventDefault()
    if (!isAdmin) {
      setFormError('Hanya akun dengan peran Super Admin yang berhak menambah akun.')
      return
    }
    if (!formData.displayName.trim()) {
      setFormError('Nama lengkap pengguna wajib diisi.')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Alamat email dinas valid wajib diisi.')
      return
    }

    // Periksa duplikasi email
    const duplicate = users.some(
      (u) => u.email.toLowerCase().trim() === formData.email.toLowerCase().trim()
    )
    if (duplicate) {
      setFormError('Email tersebut sudah digunakan oleh akun lain. Gunakan email berbeda.')
      return
    }

    const roleMeta = getRoleMeta(formData.role)
    const newUser = {
      id: `usr-${Date.now()}`,
      displayName: formData.displayName.trim(),
      email: formData.email.toLowerCase().trim(),
      role: formData.role,
      status: formData.status,
      permissions: roleMeta.permissions,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    }

    if (onAddUser) {
      onAddUser(newUser)
    }

    setIsAddModalOpen(false)
    showNotification(`Akun ${newUser.displayName} (${newUser.role}) berhasil ditambahkan.`)
  }

  // Buka Modal Edit
  function handleOpenEditModal(user) {
    if (!isAdmin) return
    setEditingUser(user)
    setEditFormData({
      id: user.id,
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || 'OPERATOR',
      status: user.status || 'ACTIVE',
    })
    setFormError('')
  }

  // Simpan Perubahan Edit Pengguna
  function handleSaveEdit(e) {
    e.preventDefault()
    if (!isAdmin) {
      setFormError('Hanya akun dengan peran Super Admin yang berhak mengedit akun.')
      return
    }
    if (!editFormData.displayName.trim()) {
      setFormError('Nama lengkap pengguna wajib diisi.')
      return
    }
    if (!editFormData.email.trim() || !editFormData.email.includes('@')) {
      setFormError('Alamat email dinas valid wajib diisi.')
      return
    }

    // Periksa duplikasi email pada akun lain
    const duplicate = users.some(
      (u) =>
        u.id !== editFormData.id &&
        u.email.toLowerCase().trim() === editFormData.email.toLowerCase().trim()
    )
    if (duplicate) {
      setFormError('Email tersebut sudah digunakan oleh akun lain.')
      return
    }

    const roleMeta = getRoleMeta(editFormData.role)
    const updatedUser = {
      ...editingUser,
      displayName: editFormData.displayName.trim(),
      email: editFormData.email.toLowerCase().trim(),
      role: editFormData.role,
      status: editFormData.status,
      permissions: roleMeta.permissions,
      updatedAt: new Date().toISOString(),
    }

    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }

    setEditingUser(null)
    showNotification(`Perubahan akun ${updatedUser.displayName} berhasil disimpan.`)
  }

  // Buka Konfirmasi Hapus Akun
  function handleOpenDeleteModal(user) {
    if (!isAdmin) return
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.')
      return
    }
    setDeletingUser(user)
  }

  // Konfirmasi Hapus Akun
  function handleConfirmDelete() {
    if (!isAdmin || !deletingUser) return
    if (deletingUser.id === currentUser?.id) return

    if (onDeleteUser) {
      onDeleteUser(deletingUser.id)
    }

    const deletedName = deletingUser.displayName
    setDeletingUser(null)
    showNotification(`Akun ${deletedName} berhasil dihapus dari sistem.`)
  }

  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length
  const distinctRoles = Array.from(new Set(users.map((u) => u.role))).length

  const columns = [
    {
      key: 'displayName',
      label: 'Nama Pengguna & Email',
      width: '26%',
      render: (val, row) => {
        const initials = val
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        const isCurrent = row.id === currentUser?.id

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="clay-marble"
              style={{
                width: '38px',
                height: '38px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: isCurrent ? 'var(--fintech-soft-green)' : '#FAFCFB',
                color: isCurrent ? 'var(--fintech-primary)' : 'inherit',
                border: isCurrent ? '1.5px solid var(--fintech-primary)' : '1px solid #E2E8F0',
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: '800', color: 'var(--color-green-950)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{val}</span>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      backgroundColor: 'var(--fintech-primary)',
                      color: '#ffffff',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                    }}
                  >
                    Akun Anda
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {row.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'role',
      label: 'Peran (Role)',
      width: '16%',
      render: (val) => {
        const meta = getRoleMeta(val)
        return (
          <span
            className="clay-badge"
            style={{
              fontWeight: '800',
              fontSize: '11px',
              backgroundColor: meta.bgColor,
              color: meta.badgeColor,
              padding: '4px 10px',
              border: `1px solid ${meta.badgeColor}25`,
            }}
          >
            {meta.label}
          </span>
        )
      },
    },
    {
      key: 'permissions',
      label: 'Cakupan Izin (Permissions)',
      width: '32%',
      render: (perms) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {(perms || []).map((p) => (
            <span
              key={p}
              className="clay-badge"
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                backgroundColor: 'var(--color-surface-muted)',
                padding: '2px 7px',
                color: 'var(--color-green-700)',
                fontWeight: '700',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status Akun',
      width: '12%',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '14%',
      render: (_, row) => {
        if (!isAdmin) {
          return (
            <span
              className="clay-badge"
              style={{
                fontSize: '11px',
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: '3px 8px',
              }}
            >
              Hanya Baca
            </span>
          )
        }

        const isCurrent = row.id === currentUser?.id

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleOpenEditModal(row)}
              className="user-action-btn-edit"
              title={`Edit Akun ${row.displayName}`}
              aria-label={`Edit Akun ${row.displayName}`}
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDeleteModal(row)}
              disabled={isCurrent}
              className="user-action-btn-delete"
              title={
                isCurrent
                  ? 'Tidak dapat menghapus akun sendiri yang sedang aktif'
                  : `Hapus Akun ${row.displayName}`
              }
              aria-label={`Hapus Akun ${row.displayName}`}
            >
              <Trash2 size={12} />
              <span>Hapus</span>
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={20}
        title="Manajemen Pengguna & Hak Akses"
        description="Pengelolaan akun pengguna, peran otorisasi, dan hak akses sistem SPK Bansos Bulak Amah."
        actions={
          isAdmin ? (
            <button
              type="button"
              className="clay-btn"
              onClick={handleOpenAddModal}
              style={{ padding: '10px 20px', fontSize: '13px' }}
            >
              <Plus size={16} />
              <span>Tambah Pengguna Baru</span>
            </button>
          ) : (
            <div
              className="clay-badge"
              style={{
                backgroundColor: '#F8FAF9',
                color: '#64748B',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Lock size={14} />
              <span>Hak Akses Terbatas (Hanya Admin)</span>
            </div>
          )
        }
      />

      {/* Banner Hak Akses Pengguna */}
      {!isAdmin && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '16px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            color: '#92400E',
            fontSize: '12.5px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Hak Akses Terbatas:</strong> Anda sedang masuk sebagai{' '}
            <strong>{currentUser?.displayName || 'Pengguna'}</strong> dengan peran{' '}
            <strong>{currentUser?.role || 'Non-Admin'}</strong>. Penambahan, pengeditan, dan
            penghapusan akun hanya dapat dilakukan oleh <strong>Super Admin</strong>.
          </span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successNotice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '16px',
            backgroundColor: '#E8F5EF',
            border: '1px solid #C7E6D7',
            color: 'var(--fintech-primary, #087A59)',
            fontSize: '12.5px',
            fontWeight: 700,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Top 3 Squircle Metric Cards with Claymorphism */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          className="user-stat-card clay-card"
          style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              PENGGUNA TERDAFTAR
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '4px' }}>
              {users.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Akun</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
              Pengelola sistem SPK bansos
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="user-stat-card clay-card"
          style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
                AKUN AKTIF SAH
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '4px' }}>
              {activeUsersCount} <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-green-700)' }}>Aktif</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
              Izin otorisasi tervalidasi
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
        </div>

        <div
          className="user-stat-card clay-card"
          style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              PERAN OTORISASI
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-warning)', marginTop: '4px' }}>
              {distinctRoles} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Role</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
              Admin, Operator, Verifikator, Penyetuju, Auditor
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#fef3c7',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={22} />
          </div>
        </div>
      </div>

      <Panel
        title="Daftar Pengguna Sistem & Hak Akses"
        subtitle="Daftar seluruh akun pengguna yang memiliki hak akses ke dalam sistem SPK Bansos Bulak Amah."
      >
        <DataTable columns={columns} data={users} />
      </Panel>

      {/* ========================================================
          MODAL: TAMBAH PENGGUNA BARU (KHUSUS ADMIN)
          ======================================================== */}
      {isAddModalOpen &&
        isAdmin &&
        (() => {
          const selectedRoleMeta = getRoleMeta(formData.role)
          const modalNode = (
            <div
              className="fintech-alert-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-user-modal-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsAddModalOpen(false)
              }}
              style={{ zIndex: 999999 }}
            >
              <div
                className="fintech-alert-popup"
                style={{
                  width: 'min(94vw, 560px)',
                  maxWidth: '560px',
                  maxHeight: 'min(92vh, 92dvh)',
                  overflowY: 'auto',
                  borderRadius: '24px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--fintech-soft-green, #E8F5EF)',
                        color: 'var(--fintech-primary, #087A59)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={20} />
                    </div>
                    <div>
                      <h3
                        id="add-user-modal-title"
                        style={{
                          fontSize: '17px',
                          fontWeight: 800,
                          color: 'var(--color-green-950)',
                          margin: 0,
                        }}
                      >
                        Tambah Pengguna Baru
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                        Buat akun pengguna baru dengan peran dan izin terstandarisasi
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="fintech-alert-close"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{ position: 'static' }}
                    title="Tutup (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>

                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAdd}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                      Nama Lengkap Pengguna
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ahmad Fauzi, S.Kom."
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="fintech-alert-input"
                      autoFocus
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                      Email Dinas / Akun
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contoh: ahmad@bulakamah.desa.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="fintech-alert-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                        Peran (Role)
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="fintech-alert-input"
                      >
                        {ROLE_DEFINITIONS.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                        Status Akun
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="fintech-alert-input"
                      >
                        <option value="ACTIVE">Aktif (ACTIVE)</option>
                        <option value="INACTIVE">Nonaktif (INACTIVE)</option>
                      </select>
                    </div>
                  </div>

                  {/* Role Description & Permission Preview */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: selectedRoleMeta.bgColor,
                      border: `1px solid ${selectedRoleMeta.badgeColor}30`,
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: selectedRoleMeta.badgeColor }}>
                      {selectedRoleMeta.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                      {selectedRoleMeta.description}
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedRoleMeta.permissions.map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: '9.5px',
                            fontFamily: 'monospace',
                            backgroundColor: '#FFFFFF',
                            color: selectedRoleMeta.badgeColor,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: `1px solid ${selectedRoleMeta.badgeColor}30`,
                            fontWeight: 700,
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="fintech-alert-btn-cancel"
                    >
                      Batal
                    </button>
                    <button type="submit" className="fintech-alert-btn-confirm">
                      <Plus size={15} />
                      <span>Simpan Pengguna</span>
                    </button>
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

      {/* ========================================================
          MODAL: EDIT PENGGUNA (KHUSUS ADMIN)
          ======================================================== */}
      {editingUser &&
        isAdmin &&
        (() => {
          const selectedRoleMeta = getRoleMeta(editFormData.role)
          const isEditingSelf = editingUser.id === currentUser?.id

          const modalNode = (
            <div
              className="fintech-alert-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-user-modal-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) setEditingUser(null)
              }}
              style={{ zIndex: 999999 }}
            >
              <div
                className="fintech-alert-popup"
                style={{
                  width: 'min(94vw, 560px)',
                  maxWidth: '560px',
                  maxHeight: 'min(92vh, 92dvh)',
                  overflowY: 'auto',
                  borderRadius: '24px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
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
                        id="edit-user-modal-title"
                        style={{
                          fontSize: '17px',
                          fontWeight: 800,
                          color: 'var(--color-green-950)',
                          margin: 0,
                        }}
                      >
                        Edit Pengguna &amp; Peran
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                        Perbarui profil, penugasan peran, dan status akun
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="fintech-alert-close"
                    onClick={() => setEditingUser(null)}
                    style={{ position: 'static' }}
                    title="Tutup (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>

                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEdit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                      Nama Lengkap Pengguna
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.displayName}
                      onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                      className="fintech-alert-input"
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                      Email Dinas / Akun
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="fintech-alert-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                        Peran (Role)
                      </label>
                      <select
                        value={editFormData.role}
                        disabled={isEditingSelf}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="fintech-alert-input"
                      >
                        {ROLE_DEFINITIONS.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {isEditingSelf && (
                        <span style={{ fontSize: '10.5px', color: '#D97706', display: 'block', marginTop: '3px' }}>
                          Peran akun sendiri tidak dapat diubah demi keamanan akses.
                        </span>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-green-950)', marginBottom: '5px' }}>
                        Status Akun
                      </label>
                      <select
                        value={editFormData.status}
                        disabled={isEditingSelf}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="fintech-alert-input"
                      >
                        <option value="ACTIVE">Aktif (ACTIVE)</option>
                        <option value="INACTIVE">Nonaktif (INACTIVE)</option>
                      </select>
                    </div>
                  </div>

                  {/* Role Description & Permission Preview */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: selectedRoleMeta.bgColor,
                      border: `1px solid ${selectedRoleMeta.badgeColor}30`,
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: selectedRoleMeta.badgeColor }}>
                      {selectedRoleMeta.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                      {selectedRoleMeta.description}
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedRoleMeta.permissions.map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: '9.5px',
                            fontFamily: 'monospace',
                            backgroundColor: '#FFFFFF',
                            color: selectedRoleMeta.badgeColor,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: `1px solid ${selectedRoleMeta.badgeColor}30`,
                            fontWeight: 700,
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="fintech-alert-btn-cancel"
                    >
                      Batal
                    </button>
                    <button type="submit" className="fintech-alert-btn-confirm">
                      <Check size={15} />
                      <span>Simpan Perubahan</span>
                    </button>
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

      {/* ========================================================
          MODAL: KONFIRMASI HAPUS PENGGUNA (KHUSUS ADMIN)
          ======================================================== */}
      {deletingUser &&
        isAdmin &&
        (() => {
          const modalNode = (
            <div
              className="fintech-alert-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) setDeletingUser(null)
              }}
              style={{ zIndex: 999999 }}
            >
              <div
                className="fintech-alert-popup"
                style={{
                  width: 'min(92vw, 440px)',
                  maxWidth: '440px',
                  borderRadius: '24px',
                  padding: '26px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <AlertTriangle size={28} />
                </div>

                <h3
                  id="delete-modal-title"
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#1E293B',
                    margin: '0 0 8px 0',
                  }}
                >
                  Hapus Akun Pengguna?
                </h3>

                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#64748B',
                    lineHeight: 1.5,
                    margin: '0 0 16px 0',
                  }}
                >
                  Apakah Anda yakin ingin menghapus akun{' '}
                  <strong style={{ color: '#0F172A' }}>{deletingUser.displayName}</strong> (
                  <span style={{ fontFamily: 'monospace' }}>{deletingUser.email}</span>)? Akun ini
                  tidak akan dapat mengakses sistem kembali.
                </p>

                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginBottom: '20px',
                  }}
                >
                  Tindakan ini permanen. Jejak log audit historis tetap tersimpan demi akuntabilitas.
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setDeletingUser(null)}
                    className="fintech-alert-btn-cancel"
                    style={{ minWidth: '100px' }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="fintech-alert-btn-confirm"
                    style={{
                      backgroundColor: '#DC2626',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                      minWidth: '120px',
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Ya, Hapus Akun</span>
                  </button>
                </div>
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
