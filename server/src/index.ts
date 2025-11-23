import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';
import foodRoutes from './routes/food.js';
import nutritionRoutes from './routes/nutrition.js';
import bloodSugarRoutes from './routes/bloodSugar.js';
import correlationRoutes from './routes/correlation.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/food', foodRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/blood-sugar', bloodSugarRoutes);
app.use('/api/correlation', correlationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access: http://<your-ip>:${PORT}`);
  console.log(`\nTo find your IP address:`);
  console.log(`  Windows: ipconfig (look for IPv4 Address)`);
});

