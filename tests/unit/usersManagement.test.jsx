import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { UsersView } from '../../src/features/users/UsersView.jsx'
import { isUserAdmin, getRoleMeta } from '../../src/features/users/userRoleConstants.js'
import { DEMO_USERS } from '../../src/services/mockData.js'

describe('User Management and Administrative RBAC', () => {
  const adminUser = DEMO_USERS.find((u) => u.role === 'SUPER_ADMIN') || {
    id: 'u-admin-test',
    displayName: 'Bambang Irawan',
    email: 'admin@bulakamah.desa.id',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  }

  const operatorUser = {
    id: 'u-op-test',
    displayName: 'Siti Operator',
    email: 'siti@bulakamah.desa.id',
    role: 'OPERATOR',
    status: 'ACTIVE',
  }

  it('verifies isUserAdmin correctly identifies administrative privileges', () => {
    expect(isUserAdmin(adminUser)).toBe(true)
    expect(isUserAdmin({ role: 'ADMIN' })).toBe(true)
    expect(isUserAdmin(operatorUser)).toBe(false)
    expect(isUserAdmin(null)).toBe(false)
    expect(isUserAdmin(undefined)).toBe(false)
  })

  it('renders "Tambah Pengguna Baru" button and Edit/Delete actions for admin', () => {
    const html = renderToString(
      <UsersView
        users={DEMO_USERS}
        currentUser={adminUser}
      />
    )

    // Admin should see Tambah Pengguna Baru button
    expect(html).toContain('Tambah Pengguna Baru')

    // Table header should show Aksi column
    expect(html).toContain('Aksi')

    // Action buttons for edit and delete
    expect(html).toContain('Edit Akun')
    expect(html).toContain('Hapus Akun')

    // Admin cannot delete their own active account
    expect(html).toContain('Tidak dapat menghapus akun sendiri yang sedang aktif')
  })

  it('restricts user management actions when currentUser is not admin', () => {
    const html = renderToString(
      <UsersView
        users={DEMO_USERS}
        currentUser={operatorUser}
      />
    )

    // Non-admin should see restricted access badge instead of Add User button
    expect(html).toContain('Hak Akses Terbatas (Hanya Admin)')
    expect(html).not.toContain('>Tambah Pengguna Baru</button>')

    // Non-admin sees read-only status in Aksi column
    expect(html).toContain('Hanya Baca')
    expect(html).not.toContain('Hapus Akun')
  })

  it('displays role metadata correctly for all assigned user roles', () => {
    const metaAdmin = getRoleMeta('SUPER_ADMIN')
    expect(metaAdmin.label).toBe('Super Admin')
    expect(metaAdmin.canManageUsers).toBe(true)

    const metaOperator = getRoleMeta('OPERATOR')
    expect(metaOperator.label).toBe('Operator Data')
    expect(metaOperator.canManageUsers).toBe(false)
  })
})
