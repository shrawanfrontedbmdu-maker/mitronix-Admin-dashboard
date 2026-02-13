import { useState, useEffect } from 'react'

function ConversionsChart() {
  const [animatedRate, setAnimatedRate] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const targetRate = 66.7
  const returningCustomers = 1247
  const totalCustomers = 1870

  useEffect(() => {
    // Animate the conversion rate from 0 to target
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = targetRate / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetRate) {
        current = targetRate
        clearInterval(timer)
      }
      setAnimatedRate(current)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  const circumference = 2 * Math.PI * 50
  const strokeDashoffset = circumference * (1 - animatedRate / 100)

  return (
    <div className="conversions-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Conversion Analytics</h3>
        <div className="chart-period">Last 30 days</div>
      </div>

      <div
        className="conversion-circle-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="conversion-circle">
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Background circle */}
            <circle
              cx="75"
              cy="75"
              r="50"
              fill="none"
              stroke="#f1f3f4"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="75"
              cy="75"
              r="50"
              fill="none"
              stroke="url(#conversionGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 75 75)"
              className="progress-circle"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-gold)" />
                <stop offset="100%" stopColor="var(--primary-gold-dark)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="conversion-center">
            <div className="conversion-percentage">
              {animatedRate.toFixed(1)}%
            </div>
            <div className="conversion-subtitle">
              Conversion Rate
            </div>
          </div>
        </div>

        {isHovered && (
          <div className="conversion-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-row">
                <span>Converted:</span>
                <span className="tooltip-number">{returningCustomers}</span>
              </div>
              <div className="tooltip-row">
                <span>Total Visitors:</span>
                <span className="tooltip-number">{totalCustomers}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="conversion-metrics">
        <div className="metric-item">
          <div className="metric-value">{returningCustomers}</div>
          <div className="metric-label">Conversions</div>
        </div>
        <div className="metric-divider"></div>
        <div className="metric-item">
          <div className="metric-value">{totalCustomers}</div>
          <div className="metric-label">Total Visitors</div>
        </div>
      </div>
    </div>
  )
}

export default ConversionsChart
