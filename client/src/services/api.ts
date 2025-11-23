import axios from 'axios';

// Use environment variable for API URL in production, or relative path in development
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export interface FoodSearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
}

export interface FoodDetails {
  fdcId: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface FoodEntry {
  id: number;
  food_name: string;
  amount: number;
  unit: string;
  date: string;
  meal_type: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface BloodSugarReading {
  id: number;
  reading: number;
  timestamp: string;
  date: string;
  time: string;
  notes: string | null;
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// Food API
export const foodAPI = {
  search: async (query: string): Promise<FoodSearchResult[]> => {
    const response = await axios.get(`${API_BASE}/food/search`, {
      params: { query }
    });
    return response.data;
  },

  getDetails: async (fdcId: number): Promise<FoodDetails> => {
    const response = await axios.get(`${API_BASE}/food/details/${fdcId}`);
    return response.data;
  },

  addEntry: async (entry: {
    foodName: string;
    amount: number;
    unit: string;
    date: string;
    mealType?: string;
    nutritionId?: number;
  }) => {
    const response = await axios.post(`${API_BASE}/food/entry`, entry);
    return response.data;
  },

  getEntries: async (date: string): Promise<FoodEntry[]> => {
    const response = await axios.get(`${API_BASE}/food/entries`, {
      params: { date }
    });
    return response.data;
  },

  deleteEntry: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/food/entry/${id}`);
    return response.data;
  }
};

// Nutrition API
export const nutritionAPI = {
  getDaily: async (date: string): Promise<DailyNutrition> => {
    const response = await axios.get(`${API_BASE}/nutrition/daily/${date}`);
    return response.data;
  },

  getRange: async (startDate: string, endDate: string) => {
    const response = await axios.get(`${API_BASE}/nutrition/range`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

// Blood Sugar API
export const bloodSugarAPI = {
  addReading: async (reading: {
    reading: number;
    timestamp: string;
    notes?: string;
  }) => {
    const response = await axios.post(`${API_BASE}/blood-sugar/reading`, reading);
    return response.data;
  },

  getReadings: async (date?: string, startDate?: string, endDate?: string): Promise<BloodSugarReading[]> => {
    const response = await axios.get(`${API_BASE}/blood-sugar/readings`, {
      params: { date, startDate, endDate }
    });
    return response.data;
  },

  importReadings: async (readings: Array<{ reading: number; timestamp: string; notes?: string }>) => {
    const response = await axios.post(`${API_BASE}/blood-sugar/import`, { readings });
    return response.data;
  },

  deleteReading: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/blood-sugar/reading/${id}`);
    return response.data;
  }
};

// Correlation API
export const correlationAPI = {
  getAnalysis: async (startDate: string, endDate: string) => {
    const response = await axios.get(`${API_BASE}/correlation/analysis`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

