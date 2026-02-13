function TopPages() {
  const pagesData = [
    { 
      page: 'larkon/ecommerce.html', 
      views: 465, 
      exitRate: 34, 
      exitType: 'positive' 
    },
    { 
      page: 'larkon/dashboard.html', 
      views: 426, 
      exitRate: 65, 
      exitType: 'negative' 
    },
    { 
      page: 'larkon/checkout.html', 
      views: 380, 
      exitRate: 28, 
      exitType: 'positive' 
    },
    { 
      page: 'larkon/products.html', 
      views: 342, 
      exitRate: 42, 
      exitType: 'negative' 
    }
  ]

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="chart-title">Top Pages</h3>
        <a href="#" className="view-all-link">View All</a>
      </div>

      <div className="table">
        <div className="table-row table-header-row">
          <div>Page Path</div>
          <div>Page Views</div>
          <div>Exit Rate</div>
        </div>
        
        {pagesData.map((page, index) => (
          <div key={index} className="table-row">
            <div style={{fontSize: '14px', color: '#636e72'}}>
              {page.page}
            </div>
            <div style={{fontWeight: '600'}}>
              {page.views}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div className="percentage-bar" style={{width: '40px'}}>
                <div 
                  className={`percentage-fill ${page.exitType}`}
                  style={{width: `${page.exitRate}%`}}
                ></div>
              </div>
              <span style={{color: page.exitType === 'positive' ? '#00b894' : '#e17055'}}>
                {page.exitRate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopPages
