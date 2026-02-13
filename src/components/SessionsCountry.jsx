function SessionsCountry() {
  const countryData = [
    { country: 'Canada', flag: '🇨🇦', sessions: 2420 },
    { country: 'United States', flag: '🇺🇸', sessions: 1890 },
    { country: 'Russia', flag: '🇷🇺', sessions: 1654 },
    { country: 'China', flag: '🇨🇳', sessions: 1420 },
    { country: 'Brazil', flag: '🇧🇷', sessions: 980 }
  ]

  const maxSessions = Math.max(...countryData.map(c => c.sessions))

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="chart-title">Sessions by Country</h3>
      </div>
      
      <div className="table">
        <div className="table-row table-header-row">
          <div>Country</div>
          <div>Sessions</div>
          <div>%</div>
        </div>
        
        {countryData.map((country, index) => {
          const percentage = (country.sessions / maxSessions * 100).toFixed(1)
          
          return (
            <div key={`country-session-${index}-${country.country.replace(/[^a-zA-Z0-9]/g, '')}`} className="table-row">
              <div className="country-info">
                <span style={{fontSize: '16px', marginRight: '8px'}}>{country.flag}</span>
                <span>{country.country}</span>
              </div>
              <div>{country.sessions.toLocaleString()}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className="percentage-bar" style={{width: '40px'}}>
                  <div 
                    className="percentage-fill"
                    style={{width: `${percentage}%`}}
                  ></div>
                </div>
                {percentage}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SessionsCountry
