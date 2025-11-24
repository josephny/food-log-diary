import express, { Request, Response } from 'express';
import { prepare } from '../database.js';

const router = express.Router();
const USE_POSTGRES = !!process.env.DATABASE_URL;

// Add blood sugar reading
router.post('/reading', async (req, res) => {
  try {
    const { reading, timestamp, notes } = req.body;

    if (!reading || !timestamp) {
      return res.status(400).json({ error: 'Reading and timestamp are required' });
    }

    const dateTime = new Date(timestamp);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().split(' ')[0];

    const query = USE_POSTGRES
      ? `INSERT INTO blood_sugar_readings (reading, timestamp, date, time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id`
      : `INSERT INTO blood_sugar_readings (reading, timestamp, date, time, notes) VALUES (?, ?, ?, ?, ?)`;

    const params = USE_POSTGRES
      ? [reading, timestamp, date, time, notes || null]
      : [reading, timestamp, date, time, notes || null];

    const result: any = await prepare(query).run(params);

    const newId = USE_POSTGRES
      ? result.rows?.[0]?.id
      : result.lastInsertRowid;

    res.json({ id: newId, success: true });

  } catch (error: any) {
    console.error('Add reading error:', error);
    res.status(500).json({ error: error.message || 'Failed to add reading' });
  }
});

// Get readings for a date
router.get('/readings', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let readings;
    if (date) {
      const query = USE_POSTGRES
        ? `SELECT * FROM blood_sugar_readings WHERE date = $1 ORDER BY timestamp ASC`
        : `SELECT * FROM blood_sugar_readings WHERE date = ? ORDER BY timestamp ASC`;
      readings = await prepare(query).all(USE_POSTGRES ? [date] : [date]);
    } else if (startDate && endDate) {
      const query = USE_POSTGRES
        ? `SELECT * FROM blood_sugar_readings WHERE date >= $1 AND date <= $2 ORDER BY timestamp ASC`
        : `SELECT * FROM blood_sugar_readings WHERE date >= ? AND date <= ? ORDER BY timestamp ASC`;
      readings = await prepare(query).all(USE_POSTGRES ? [startDate, endDate] : [startDate, endDate]);
    } else {
      return res.status(400).json({ error: 'Either date or startDate/endDate required' });
    }

    res.json(readings);
  } catch (error: any) {
    console.error('Get readings error:', error);
    res.status(500).json({ error: error.message || 'Failed to get readings' });
  }
});

// Import Libre 3 data (CSV format)
router.post('/import', async (req, res) => {
  try {
    const { readings } = req.body; // Array of { reading, timestamp, notes? }

    if (!Array.isArray(readings)) {
      return res.status(400).json({ error: 'Readings must be an array' });
    }

    const query = USE_POSTGRES
      ? `INSERT INTO blood_sugar_readings (reading, timestamp, date, time, notes) VALUES ($1, $2, $3, $4, $5)`
      : `INSERT INTO blood_sugar_readings (reading, timestamp, date, time, notes) VALUES (?, ?, ?, ?, ?)`;

    for (const r of readings) {
      const dateTime = new Date(r.timestamp);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toTimeString().split(' ')[0];
      const params = USE_POSTGRES
        ? [r.reading, r.timestamp, date, time, r.notes || null]
        : [r.reading, r.timestamp, date, time, r.notes || null];
      await prepare(query).run(params);
    }

    res.json({ success: true, count: readings.length });
  } catch (error: any) {
    console.error('Import readings error:', error);
    res.status(500).json({ error: error.message || 'Failed to import readings' });
  }
});

// Delete reading
router.delete('/reading/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const query = USE_POSTGRES
      ? 'DELETE FROM blood_sugar_readings WHERE id = $1'
      : 'DELETE FROM blood_sugar_readings WHERE id = ?';
    await prepare(query).run([id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete reading error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete reading' });
  }
});

export default router;

