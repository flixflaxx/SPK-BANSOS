export function PageHeader({ title, description, badge, actions }) {
  return (
    <div
      className="page-header-container fintech-greeting-section"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '26px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h1
            className="page-header-title fintech-greeting-title"
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--fintech-text-primary, #172B25)',
              letterSpacing: '-0.4px',
              fontFamily: "var(--font-heading, 'Manrope Variable', sans-serif)",
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p
            className="page-header-desc fintech-greeting-sub"
            style={{
              fontSize: '13.5px',
              color: 'var(--fintech-text-secondary, #84918B)',
              marginTop: '6px',
              maxWidth: '750px',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div
          className="page-header-actions"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </div>
      )}
    </div>
  )
}
