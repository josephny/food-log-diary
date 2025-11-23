import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { foodAPI, nutritionAPI, bloodSugarAPI } from '../services/api';
import type { FoodEntry, DailyNutrition, BloodSugarReading } from '../services/api';

export default function Dashboard() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [nutrition, setNutrition] = useState<DailyNutrition | null>(null);
  const [readings, setReadings] = useState<BloodSugarReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesData, nutritionData, readingsData] = await Promise.all([
        foodAPI.getEntries(date),
        nutritionAPI.getDaily(date),
        bloodSugarAPI.getReadings(date)
      ]);
      setEntries(entriesData);
      setNutrition(nutritionData);
      setReadings(readingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (confirm('Delete this food entry?')) {
      try {
        await foodAPI.deleteEntry(id);
        loadData();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleDeleteReading = async (id: number) => {
    if (confirm('Delete this blood sugar reading?')) {
      try {
        await bloodSugarAPI.deleteReading(id);
        loadData();
      } catch (error) {
        console.error('Error deleting reading:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const avgBloodSugar = readings.length > 0
    ? readings.reduce((sum, r) => sum + r.reading, 0) / readings.length
    : null;

  return (
    <div>
      <div className="card">
        <h2>Daily Overview</h2>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {nutrition && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Calories</h3>
              <div className="value">{Math.round(nutrition.calories)}</div>
            </div>
            <div className="stat-card">
              <h3>Protein</h3>
              <div className="value">{Math.round(nutrition.protein)}g</div>
            </div>
            <div className="stat-card">
              <h3>Carbs</h3>
              <div className="value">{Math.round(nutrition.carbs)}g</div>
            </div>
            <div className="stat-card">
              <h3>Fat</h3>
              <div className="value">{Math.round(nutrition.fat)}g</div>
            </div>
            {avgBloodSugar !== null && (
              <div className="stat-card">
                <h3>Avg Blood Sugar</h3>
                <div className="value">{Math.round(avgBloodSugar)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Food Entries</h2>
        {entries.length === 0 ? (
          <p>No food entries for this date.</p>
        ) : (
          <ul className="entries-list">
            {entries.map((entry) => (
              <li key={entry.id} className="entry-item">
                <div className="entry-info">
                  <h4>{entry.food_name}</h4>
                  <p>
                    {entry.amount} {entry.unit}
                    {entry.meal_type && ` • ${entry.meal_type}`}
                    {entry.calories && ` • ${Math.round(entry.calories * entry.amount / 100)} cal`}
                  </p>
                </div>
                <div className="entry-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Blood Sugar Readings</h2>
        {readings.length === 0 ? (
          <p>No blood sugar readings for this date.</p>
        ) : (
          <ul className="entries-list">
            {readings.map((reading) => (
              <li key={reading.id} className="entry-item">
                <div className="entry-info">
                  <h4>{reading.reading} mg/dL</h4>
                  <p>
                    {new Date(reading.timestamp).toLocaleString()}
                    {reading.notes && ` • ${reading.notes}`}
                  </p>
                </div>
                <div className="entry-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteReading(reading.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


