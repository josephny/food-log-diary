import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { correlationAPI, nutritionAPI } from '../services/api';

export default function CorrelationView() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [startDate, endDate]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const analysis = await correlationAPI.getAnalysis(startDate, endDate);
      setData(analysis);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analysis...</div>;
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="card">
        <h2>Correlation Analysis</h2>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <p>No data available for the selected date range.</p>
      </div>
    );
  }

  const chartData = data.data.map((item: any) => ({
    date: format(new Date(item.date), 'MM/dd'),
    calories: Math.round(item.nutrition.calories),
    carbs: Math.round(item.nutrition.carbs),
    sugar: Math.round(item.nutrition.sugar),
    bloodSugar: item.bloodSugar ? Math.round(item.bloodSugar.avg) : null
  }));

  return (
    <div>
      <div className="card">
        <h2>Nutrition & Blood Sugar Correlation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {data.correlations && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3>Correlation Coefficients</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Values range from -1 to 1. Positive values indicate that higher nutrient intake
              correlates with higher blood sugar. Values closer to 0 indicate weak correlation.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {Object.entries(data.correlations).map(([nutrient, value]: [string, any]) => (
                <div key={nutrient} style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{nutrient}</strong>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: value > 0.3 ? '#ef4444' : value < -0.3 ? '#10b981' : '#666' }}>
                    {value.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3>Daily Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bloodSugar"
                stroke="#ef4444"
                strokeWidth={2}
                name="Blood Sugar (mg/dL)"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="carbs"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Carbs (g)"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sugar"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Sugar (g)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Calories vs Blood Sugar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="bloodSugar" fill="#ef4444" name="Blood Sugar (mg/dL)" />
              <Bar yAxisId="right" dataKey="calories" fill="#667eea" name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


