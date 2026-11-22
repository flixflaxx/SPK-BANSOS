import { FolderOpen, Loader2 } from 'lucide-react'

export function DataTable({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'Tidak ada data ditemukan.',
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div
        className="fintech-card"
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--fintech-text-secondary, #84918B)',
          fontSize: '14px',
          margin: '12px 0',
          border: '1px dashed var(--fintech-border, #EDF0EE)',
          backgroundColor: '#FAFCFB',
          borderRadius: '16px',
        }}
      >
        <Loader2
          size={26}
          color="var(--fintech-primary, #087A59)"
          aria-hidden="true"
          style={{ display: 'inline-block', marginBottom: '8px', animation: 'spin 1s linear infinite' }}
        />
        <p style={{ fontWeight: '600' }}>Memuat data...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="fintech-card"
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          margin: '12px 0',
          border: '1px dashed var(--fintech-border, #EDF0EE)',
          backgroundColor: '#FAFCFB',
          borderRadius: '16px',
        }}
      >
        <FolderOpen
          size={36}
          color="var(--fintech-text-secondary, #84918B)"
          aria-hidden="true"
          style={{ display: 'inline-block', marginBottom: '8px' }}
        />
        <p style={{ fontWeight: '800', color: 'var(--fintech-text-primary, #172B25)', fontSize: '15px' }}>Data Kosong</p>
        <p style={{ fontSize: '13px', color: 'var(--fintech-text-secondary, #84918B)', marginTop: '4px' }}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="table-responsive-container" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
      <table
        className="fintech-table"
        style={{
          width: '100%',
          minWidth: '580px',
          borderCollapse: 'separate',
          borderSpacing: '0 4px',
          fontSize: '13px',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '11px 14px',
                  fontWeight: '700',
                  color: 'var(--fintech-text-secondary, #84918B)',
                  backgroundColor: '#F8FAF9',
                  whiteSpace: 'nowrap',
                  fontSize: '11.5px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  width: col.width,
                  textAlign: col.align || 'left',
                  borderTop: '1px solid var(--fintech-border, #EDF0EE)',
                  borderBottom: '1px solid var(--fintech-border, #EDF0EE)',
                  borderLeft: idx === 0 ? '1px solid var(--fintech-border, #EDF0EE)' : 'none',
                  borderRight: idx === columns.length - 1 ? '1px solid var(--fintech-border, #EDF0EE)' : 'none',
                  borderRadius: idx === 0 ? '10px 0 0 10px' : idx === columns.length - 1 ? '0 10px 10px 0' : undefined,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] || rowIdx}
              style={{
                backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#FAFCFB',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4F7F5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  rowIdx % 2 === 0 ? '#ffffff' : '#FAFCFB'
              }}
            >
              {columns.map((col, colIdx) => {
                const value = row[col.key]
                return (
                  <td
                    key={col.key || colIdx}
                    style={{
                      padding: '12px 14px',
                      color: 'var(--fintech-text-primary, #172B25)',
                      verticalAlign: 'middle',
                      textAlign: col.align || 'left',
                      borderBottom: '1px solid var(--fintech-border, #EDF0EE)',
                      borderTop: '1px solid transparent',
                      borderLeft: colIdx === 0 ? '1px solid var(--fintech-border, #EDF0EE)' : 'none',
                      borderRight: colIdx === columns.length - 1 ? '1px solid var(--fintech-border, #EDF0EE)' : 'none',
                      borderRadius:
                        colIdx === 0
                          ? '10px 0 0 10px'
                          : colIdx === columns.length - 1
                            ? '0 10px 10px 0'
                            : undefined,
                    }}
                  >
                    {col.render ? col.render(value, row, rowIdx) : value ?? '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
