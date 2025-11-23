import express from 'express';
import { prepare } from '../database.js';

const router = express.Router();
const USE_POSTGRES = !!process.env.DATABASE_URL;

// Get daily nutrition totals
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const query = USE_POSTGRES
      ? `SELECT 
          SUM(nd.calories * en.amount / 100) as total_calories,
          SUM(nd.protein * en.amount / 100) as total_protein,
          SUM(nd.carbs * en.amount / 100) as total_carbs,
          SUM(nd.fat * en.amount / 100) as total_fat,
          SUM(nd.fiber * en.amount / 100) as total_fiber,
          SUM(nd.sugar * en.amount / 100) as total_sugar,
          SUM(nd.sodium * en.amount / 100) as total_sodium
        FROM food_entries fe
        JOIN entry_nutrition en ON fe.id = en.entry_id
        JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date = $1`
      : `SELECT 
          SUM(nd.calories * en.amount / 100) as total_calories,
          SUM(nd.protein * en.amount / 100) as total_protein,
          SUM(nd.carbs * en.amount / 100) as total_carbs,
          SUM(nd.fat * en.amount / 100) as total_fat,
          SUM(nd.fiber * en.amount / 100) as total_fiber,
          SUM(nd.sugar * en.amount / 100) as total_sugar,
          SUM(nd.sodium * en.amount / 100) as total_sodium
        FROM food_entries fe
        JOIN entry_nutrition en ON fe.id = en.entry_id
        JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date = ?`;

    const totals = await prepare(query).get(USE_POSTGRES ? [date] : [date]);

    res.json({
      date,
      calories: totals.total_calories || 0,
      protein: totals.total_protein || 0,
      carbs: totals.total_carbs || 0,
      fat: totals.total_fat || 0,
      fiber: totals.total_fiber || 0,
      sugar: totals.total_sugar || 0,
      sodium: totals.total_sodium || 0
    });
  } catch (error: any) {
    console.error('Get daily nutrition error:', error);
    res.status(500).json({ error: error.message || 'Failed to get daily nutrition' });
  }
});

// Get nutrition totals for date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const query = USE_POSTGRES
      ? `SELECT 
          fe.date,
          SUM(nd.calories * en.amount / 100) as total_calories,
          SUM(nd.protein * en.amount / 100) as total_protein,
          SUM(nd.carbs * en.amount / 100) as total_carbs,
          SUM(nd.fat * en.amount / 100) as total_fat,
          SUM(nd.fiber * en.amount / 100) as total_fiber,
          SUM(nd.sugar * en.amount / 100) as total_sugar,
          SUM(nd.sodium * en.amount / 100) as total_sodium
        FROM food_entries fe
        JOIN entry_nutrition en ON fe.id = en.entry_id
        JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date >= $1 AND fe.date <= $2
        GROUP BY fe.date
        ORDER BY fe.date ASC`
      : `SELECT 
          fe.date,
          SUM(nd.calories * en.amount / 100) as total_calories,
          SUM(nd.protein * en.amount / 100) as total_protein,
          SUM(nd.carbs * en.amount / 100) as total_carbs,
          SUM(nd.fat * en.amount / 100) as total_fat,
          SUM(nd.fiber * en.amount / 100) as total_fiber,
          SUM(nd.sugar * en.amount / 100) as total_sugar,
          SUM(nd.sodium * en.amount / 100) as total_sodium
        FROM food_entries fe
        JOIN entry_nutrition en ON fe.id = en.entry_id
        JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date >= ? AND fe.date <= ?
        GROUP BY fe.date
        ORDER BY fe.date ASC`;

    const totals = await prepare(query).all(USE_POSTGRES ? [startDate, endDate] : [startDate, endDate]);

    res.json(totals);
  } catch (error: any) {
    console.error('Get range nutrition error:', error);
    res.status(500).json({ error: error.message || 'Failed to get range nutrition' });
  }
});

export default router;

