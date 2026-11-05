export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
  badge,
  iconBg = '#E8F5EF',
  iconColor = '#087A59',
  pulseBadge = false,
  className = '',
  clay = false,
}) {
  const isNumeric = typeof value === 'number' || (!Number.isNaN(Number(value)) && String(value).trim() !== '')

  return (
    <div className={`fintech-kpi-card ${className}`.trim()}>
      <div className="fintech-kpi-top">
        <span className="fintech-kpi-label">{title}</span>
        {icon && (
          <div
            className="fintech-kpi-icon-wrap"
            style={{
              backgroundColor: iconBg,
              color: iconColor,
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="fintech-kpi-value-row">
          <span
            className={`fintech-kpi-value ${isNumeric ? 'counter-val' : ''}`}
            data-target={isNumeric ? value : undefined}
          >
            {value}
          </span>
          {badge && (
            <span
              className="fintech-kpi-badge"
              style={{
                backgroundColor: highlight ? '#E8F5EF' : '#F1F3F2',
                color: highlight ? 'var(--fintech-primary)' : 'var(--fintech-text-secondary)',
              }}
            >
              {pulseBadge && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--fintech-primary)',
                    marginRight: '6px',
                  }}
                  aria-hidden="true"
                />
              )}
              <span>{badge}</span>
            </span>
          )}
        </div>
        {subtitle && <p className="fintech-kpi-sub">{subtitle}</p>}
      </div>
    </div>
  )
}
