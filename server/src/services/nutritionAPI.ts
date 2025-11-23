import axios from 'axios';

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';

// You'll need to get a free API key from https://fdc.nal.usda.gov/api-guide.html
// For now, using a demo approach - you should set this in .env
const API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

interface FoodSearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
}

interface FoodDetails {
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

export async function searchFood(query: string): Promise<FoodSearchResult[]> {
  try {
    const response = await axios.get(`${USDA_API_BASE}/foods/search`, {
      params: {
        api_key: API_KEY,
        query: query,
        pageSize: 20,
        dataType: ['Foundation', 'SR Legacy']
      }
    });

    return response.data.foods.map((food: any) => ({
      fdcId: food.fdcId,
      description: food.description,
      brandOwner: food.brandOwner
    }));
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Invalid or missing USDA API key. Please set USDA_API_KEY in .env file');
    }
    throw error;
  }
}

export async function getFoodDetails(fdcId: number): Promise<FoodDetails> {
  try {
    const response = await axios.get(`${USDA_API_BASE}/food/${fdcId}`, {
      params: {
        api_key: API_KEY
      }
    });

    const food = response.data;
    const nutrients = food.foodNutrients || [];

    // Helper to find nutrient value
    const getNutrient = (nutrientId: number): number => {
      const nutrient = nutrients.find((n: any) => n.nutrientId === nutrientId || n.nutrient?.id === nutrientId);
      return nutrient?.amount || 0;
    };

    // Standard nutrient IDs from USDA
    // Energy: 1008, Protein: 1003, Carbs: 1005, Fat: 1004, Fiber: 1079, Sugar: 2000, Sodium: 1093
    return {
      fdcId: food.fdcId,
      foodName: food.description,
      calories: getNutrient(1008),
      protein: getNutrient(1003),
      carbs: getNutrient(1005),
      fat: getNutrient(1004),
      fiber: getNutrient(1079),
      sugar: getNutrient(2000),
      sodium: getNutrient(1093)
    };
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Invalid or missing USDA API key. Please set USDA_API_KEY in .env file');
    }
    throw error;
  }
}


