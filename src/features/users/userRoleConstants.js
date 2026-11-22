/**
 * userRoleConstants.js
 * Konfigurasi peran pengguna, hak akses, dan deskripsi tugas di SPK Bansos Bulak Amah.
 */

export const ROLE_DEFINITIONS = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Akses penuh seluruh modul, manajemen pengguna, persetujuan, dan konfigurasi',
    badgeColor: '#087A59',
    bgColor: '#E8F5EF',
    permissions: [
      'all',
      'user.manage',
      'decision.approve',
      'decision.reject',
      'criteria.edit',
      'backup.trigger',
    ],
  },
  {
    role: 'OPERATOR',
    label: 'Operator Data',
    description: 'Manajemen data warga, calon penerima, input penilaian, dan run SAW',
    badgeColor: '#0284C7',
    bgColor: '#E0F2FE',
    permissions: ['resident.manage', 'candidate.manage', 'assessment.input', 'saw.run'],
  },
  {
    role: 'VERIFIER',
    label: 'Verifikator',
    description: 'Verifikasi faktual berkas warga dan calon penerima',
    badgeColor: '#16A34A',
    bgColor: '#DCFCE7',
    permissions: ['verification.review', 'resident.read', 'candidate.read'],
  },
  {
    role: 'APPROVER',
    label: 'Kepala Desa / Penyetuju',
    description: 'Persetujuan resmi keputusan akhir bantuan sosial dan kuota',
    badgeColor: '#D97706',
    bgColor: '#FEF3C7',
    permissions: ['decision.approve', 'decision.reject', 'report.read'],
  },
  {
    role: 'AUDITOR',
    label: 'Auditor Independen',
    description: 'Pengawasan jejak audit, transparansi, dan verifikasi kepatuhan',
    badgeColor: '#9333EA',
    bgColor: '#F3E8FF',
    permissions: ['audit.read', 'report.read', 'history.read'],
  },
]

export function getRoleMeta(role) {
  const found = ROLE_DEFINITIONS.find((r) => r.role === role)
  if (found) {
    return {
      ...found,
      canManageUsers:
        found.permissions.includes('all') ||
        found.permissions.includes('user.manage') ||
        found.role === 'SUPER_ADMIN' ||
        found.role === 'ADMIN',
    }
  }
  return {
    role: role || 'OPERATOR',
    label: role || 'Operator',
    description: 'Pengguna sistem terdaftar',
    badgeColor: '#475569',
    bgColor: '#F1F5F9',
    permissions: ['resident.read'],
    canManageUsers: false,
  }
}

export function isUserAdmin(user) {
  if (!user) return false
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes('all') || user.permissions.includes('user.manage')
  }
  return false
}
