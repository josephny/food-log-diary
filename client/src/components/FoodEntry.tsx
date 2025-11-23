import { useState } from 'react';
import { format } from 'date-fns';
import { foodAPI } from '../services/api';
import type { FoodSearchResult, FoodDetails } from '../services/api';

export default function FoodEntry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDetails | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const results = await foodAPI.search(searchQuery);
      setSearchResults(results);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to search food' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = async (food: FoodSearchResult) => {
    setLoading(true);
    setMessage(null);
    try {
      const details = await foodAPI.getDetails(food.fdcId);
      setSelectedFood(details);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to get food details' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFood || !amount) {
      setMessage({ type: 'error', text: 'Please select a food and enter an amount' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await foodAPI.addEntry({
        foodName: selectedFood.foodName,
        amount: parseFloat(amount),
        unit,
        date,
        mealType: mealType || undefined,
        nutritionId: selectedFood.fdcId
      });

      setMessage({ type: 'success', text: 'Food entry added successfully!' });
      setSelectedFood(null);
      setAmount('');
      setMealType('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add food entry' });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFood(null);
    setAmount('');
    setMealType('');
    setSearchQuery('');
    setSearchResults([]);
    setMessage(null);
  };

  return (
    <div className="card">
      <h2>Add Food Entry</h2>

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {!selectedFood ? (
          <>
            <div className="form-group">
              <label>Search for Food</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., apple, chicken breast, rice"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((food) => (
                  <div
                    key={food.fdcId}
                    className="search-result-item"
                    onClick={() => handleSelectFood(food)}
                  >
                    <strong>{food.description}</strong>
                    {food.brandOwner && <div style={{ fontSize: '0.9rem', color: '#666' }}>{food.brandOwner}</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Selected Food</label>
              <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>{selectedFood.foodName}</strong>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  Per 100g: {Math.round(selectedFood.calories)} cal, 
                  P: {Math.round(selectedFood.protein)}g, 
                  C: {Math.round(selectedFood.carbs)}g, 
                  F: {Math.round(selectedFood.fat)}g
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
              >
                Change Food
              </button>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  step="0.1"
                  min="0"
                  required
                  style={{ flex: 1 }}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{ width: '100px' }}
                >
                  <option value="g">g</option>
                  <option value="oz">oz</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="piece">piece</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Meal Type (optional)</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="">None</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Food Entry'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}


