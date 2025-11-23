import express from 'express';
import { prepare } from '../database.js';
import { searchFood, getFoodDetails } from '../services/nutritionAPI.js';

const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = !!DATABASE_URL;

const router = express.Router();

// Search for food
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchFood(query);
    res.json(results);
  } catch (error: any) {
    console.error('Food search error:', error);
    res.status(500).json({ error: error.message || 'Failed to search food' });
  }
});

// Get food details
router.get('/details/:fdcId', async (req, res) => {
  try {
    const fdcId = parseInt(req.params.fdcId);
    if (isNaN(fdcId)) {
      return res.status(400).json({ error: 'Invalid FDC ID' });
    }

    // Check cache first
    const cached = await prepare('SELECT * FROM nutrition_data WHERE fdc_id = $1').get([fdcId]);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from API
    const details = await getFoodDetails(fdcId);
    
    // Cache the result (use PostgreSQL ON CONFLICT or SQLite INSERT OR REPLACE)
    if (USE_POSTGRES) {
      await prepare(`
        INSERT INTO nutrition_data 
        (fdc_id, food_name, calories, protein, carbs, fat, fiber, sugar, sodium)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (fdc_id) DO UPDATE SET
          food_name = EXCLUDED.food_name,
          calories = EXCLUDED.calories,
          protein = EXCLUDED.protein,
          carbs = EXCLUDED.carbs,
          fat = EXCLUDED.fat,
          fiber = EXCLUDED.fiber,
          sugar = EXCLUDED.sugar,
          sodium = EXCLUDED.sodium
      `).run([
        details.fdcId,
        details.foodName,
        details.calories,
        details.protein,
        details.carbs,
        details.fat,
        details.fiber,
        details.sugar,
        details.sodium
      ]);
    } else {
      await prepare(`
        INSERT OR REPLACE INTO nutrition_data 
        (fdc_id, food_name, calories, protein, carbs, fat, fiber, sugar, sodium)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        details.fdcId,
        details.foodName,
        details.calories,
        details.protein,
        details.carbs,
        details.fat,
        details.fiber,
        details.sugar,
        details.sodium
      ]);
    }

    res.json(details);
  } catch (error: any) {
    console.error('Food details error:', error);
    res.status(500).json({ error: error.message || 'Failed to get food details' });
  }
});

// Add food entry
router.post('/entry', async (req, res) => {
  try {
    const { foodName, amount, unit, date, mealType, nutritionId } = req.body;

    if (!foodName || !amount || !unit || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const params = USE_POSTGRES 
      ? [foodName, amount, unit, date, mealType || null]
      : [foodName, amount, unit, date, mealType || null];
    
    const query = USE_POSTGRES
      ? `INSERT INTO food_entries (food_name, amount, unit, date, meal_type) VALUES ($1, $2, $3, $4, $5) RETURNING id`
      : `INSERT INTO food_entries (food_name, amount, unit, date, meal_type) VALUES (?, ?, ?, ?, ?)`;

    const result = await prepare(query).run(params);
    const entryId = result.lastInsertRowid;

    // Link nutrition data if provided
    if (nutritionId && entryId) {
      const linkParams = USE_POSTGRES ? [entryId, nutritionId, amount] : [entryId, nutritionId, amount];
      const linkQuery = USE_POSTGRES
        ? `INSERT INTO entry_nutrition (entry_id, nutrition_id, amount) VALUES ($1, $2, $3)`
        : `INSERT INTO entry_nutrition (entry_id, nutrition_id, amount) VALUES (?, ?, ?)`;
      await prepare(linkQuery).run(linkParams);
    }

    res.json({ id: entryId, success: true });
  } catch (error: any) {
    console.error('Add food entry error:', error);
    res.status(500).json({ error: error.message || 'Failed to add food entry' });
  }
});

// Get food entries for a date
router.get('/entries', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const query = USE_POSTGRES
      ? `SELECT 
          fe.*,
          en.nutrition_id,
          nd.calories, nd.protein, nd.carbs, nd.fat, nd.fiber, nd.sugar, nd.sodium
        FROM food_entries fe
        LEFT JOIN entry_nutrition en ON fe.id = en.entry_id
        LEFT JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date = $1
        ORDER BY fe.created_at ASC`
      : `SELECT 
          fe.*,
          en.nutrition_id,
          nd.calories, nd.protein, nd.carbs, nd.fat, nd.fiber, nd.sugar, nd.sodium
        FROM food_entries fe
        LEFT JOIN entry_nutrition en ON fe.id = en.entry_id
        LEFT JOIN nutrition_data nd ON en.nutrition_id = nd.id
        WHERE fe.date = ?
        ORDER BY fe.created_at ASC`;

    const entries = await prepare(query).all(USE_POSTGRES ? [date] : [date]);

    res.json(entries);
  } catch (error: any) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: error.message || 'Failed to get entries' });
  }
});

// Delete food entry
router.delete('/entry/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const deleteLinkQuery = USE_POSTGRES 
      ? 'DELETE FROM entry_nutrition WHERE entry_id = $1'
      : 'DELETE FROM entry_nutrition WHERE entry_id = ?';
    const deleteEntryQuery = USE_POSTGRES
      ? 'DELETE FROM food_entries WHERE id = $1'
      : 'DELETE FROM food_entries WHERE id = ?';
    
    await prepare(deleteLinkQuery).run([id]);
    await prepare(deleteEntryQuery).run([id]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete entry' });
  }
});

export default router;

