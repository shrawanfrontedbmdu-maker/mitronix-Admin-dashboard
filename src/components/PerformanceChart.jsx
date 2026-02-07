import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

function PerformanceChart() {
  const [activeTab, setActiveTab] = useState('ALL');

  // Data remains the same
  const allData = [
    { month: 'Jan', pageViews: 45, clicks: 30, date: '2024-01' },
    { month: 'Feb', pageViews: 65, clicks: 45, date: '2024-02' },
    { month: 'Mar', pageViews: 55, clicks: 35, date: '2024-03' },
    { month: 'Apr', pageViews: 75, clicks: 55, date: '2024-04' },
    { month: 'May', pageViews: 85, clicks: 65, date: '2024-05' },
    { month: 'Jun', pageViews: 70, clicks: 50, date: '2024-06' },
    { month: 'Jul', pageViews: 90, clicks: 70, date: '2024-07' },
    { month: 'Aug', pageViews: 95, clicks: 75, date: '2024-08' },
    { month: 'Sep', pageViews: 80, clicks: 60, date: '2024-09' },
    { month: 'Oct', pageViews: 100, clicks: 80, date: '2024-10' },
    { month: 'Nov', pageViews: 85, clicks: 65, date: '2024-11' },
    { month: 'Dec', pageViews: 75, clicks: 55, date: '2024-12' }
  ];

  // getFilteredData logic remains the same
  const getFilteredData = () => {
    switch (activeTab) {
      case '1M':
        return allData.slice(-1);
      case '6M':
        return allData.slice(-6);
      case '1Y':
        return allData;
      default:
        return allData;
    }
  };

  const chartData = getFilteredData();
  const tabs = ['ALL', '1M', '6M', '1Y'];

  // NOTE: All useEffect, animatedData, hoveredBar, and maxValue states/calculations are no longer needed.
  // Recharts handles animation and tooltips internally.

  return (
    <div className="performance-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Performance Analytics</h3>
        <div className="chart-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Recharts chart area */}
      {/* Set a fixed height for the container */}
      <div className="performance-chart" style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -20, // Adjust to show Y-axis labels
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="month" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pageViews" 
              stroke="#8884d8" 
              strokeWidth={2} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#82ca9d" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* The original x-axis and legend can be removed, as Recharts provides them */}
    </div>
  );
}

export default PerformanceChart;