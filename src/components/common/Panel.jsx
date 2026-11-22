export function Panel({ title, subtitle, actions, children, style = {} }) {
  return (
    <div
      className="fintech-card clay-card"
      style={{
        padding: '24px 26px',
        marginBottom: '26px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid var(--fintech-border, #EDF0EE)',
        boxShadow: 'var(--fintech-shadow-card, 0 1px 3px rgba(0, 0, 0, 0.03), 0 6px 16px rgba(0, 0, 0, 0.02))',
        ...style,
      }}
    >
      {(title || actions) && (
        <div
          className="fintech-card-header"
          style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            {title && (
              <h3
                className="fintech-card-title"
                style={{
                  fontSize: '16.5px',
                  fontWeight: '800',
                  color: 'var(--fintech-text-primary, #172B25)',
                  fontFamily: "var(--font-heading, 'Manrope Variable', sans-serif)",
                  letterSpacing: '-0.2px',
                  margin: 0,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="fintech-card-sub"
                style={{
                  fontSize: '12.5px',
                  color: 'var(--fintech-text-secondary, #84918B)',
                  marginTop: '3px',
                  margin: '3px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {actions}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
