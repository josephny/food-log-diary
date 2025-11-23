import express from 'express';
import { prepare } from '../database.js';

const router = express.Router();
const USE_POSTGRES = !!process.env.DATABASE_URL;

// Get correlation data for a date range
router.get('/analysis', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Get daily nutrition totals
    const nutritionQuery = USE_POSTGRES
      ? `SELECT 
          fe.date,
          SUM(nd.calories * en.amount / 100) as calories,
          SUM(nd.protein * en.amount / 100) as protein,
          SUM(nd.carbs * en.amount / 100) as carbs,
          SUM(nd.fat * en.amount / 100) as fat,
          SUM(nd.fiber * en.amount / 100) as fiber,
          SUM(nd.sugar * en.amount / 100) as sugar,
          SUM(nd.sodium * en.amount / 100) as sodium
        FROM food_entries fe
        JOIN entry_nutrition en ON fe.id = en.entry_id
        JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date >= $1 AND fe.date <= $2
        GROUP BY fe.date`
      : `SELECT 
          fe.date,
          SUM(nd.calories * en.amount / 100) as calories,
          SUM(nd.protein * en.amount / 100) as protein,
          SUM(nd.carbs * en.amount / 100) as carbs,
          SUM(nd.fat * en.amount / 100) as fat,
          SUM(nd.fiber * en.amount / 100) as fiber,
          SUM(nd.sugar * en.amount / 100) as sugar,
          SUM(nd.sodium * en.amount / 100) as sodium
        FROM food_entries fe
        JOIN entry_nutrition en ON fe.id = en.entry_id
        JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date >= ? AND fe.date <= ?
        GROUP BY fe.date`;

    const nutrition = await prepare(nutritionQuery).all(USE_POSTGRES ? [startDate, endDate] : [startDate, endDate]);

    // Get blood sugar readings
    const bloodSugarQuery = USE_POSTGRES
      ? `SELECT 
          date,
          AVG(reading) as avg_reading,
          MIN(reading) as min_reading,
          MAX(reading) as max_reading,
          COUNT(*) as reading_count
        FROM blood_sugar_readings
        WHERE date >= $1 AND date <= $2
        GROUP BY date`
      : `SELECT 
          date,
          AVG(reading) as avg_reading,
          MIN(reading) as min_reading,
          MAX(reading) as max_reading,
          COUNT(*) as reading_count
        FROM blood_sugar_readings
        WHERE date >= ? AND date <= ?
        GROUP BY date`;

    const bloodSugar = await prepare(bloodSugarQuery).all(USE_POSTGRES ? [startDate, endDate] : [startDate, endDate]);

    // Combine data by date
    const combined = nutrition.map((n: any) => {
      const bs = bloodSugar.find((b: any) => b.date === n.date);
      return {
        date: n.date,
        nutrition: {
          calories: n.calories || 0,
          protein: n.protein || 0,
          carbs: n.carbs || 0,
          fat: n.fat || 0,
          fiber: n.fiber || 0,
          sugar: n.sugar || 0,
          sodium: n.sodium || 0
        },
        bloodSugar: bs ? {
          avg: bs.avg_reading,
          min: bs.min_reading,
          max: bs.max_reading,
          count: bs.reading_count
        } : null
      };
    });

    // Calculate correlations
    const correlations = calculateCorrelations(combined);

    res.json({
      data: combined,
      correlations
    });
  } catch (error: any) {
    console.error('Correlation analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze correlation' });
  }
});

function calculateCorrelations(data: any[]) {
  const validData = data.filter(d => d.bloodSugar !== null);
  
  if (validData.length < 2) {
    return null;
  }

  const correlations: any = {};

  // Calculate correlation for each nutrient
  const nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'];
  
  nutrients.forEach(nutrient => {
    const correlation = pearsonCorrelation(
      validData.map(d => d.nutrition[nutrient]),
      validData.map(d => d.bloodSugar.avg)
    );
    correlations[nutrient] = correlation;
  });

  return correlations;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

export default router;

