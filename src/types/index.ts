export type GoalType = 'lose_weight' | 'gain_weight' | 'maintain_weight';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

export type DietType = 'balanced' | 'high_protein' | 'keto' | 'low_fat' | 'custom';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goalType: GoalType;
  goalRateKgPerWeek: number; // e.g. 0.25, 0.5, 0.75, 1.0 (loss or gain rate)
  activityLevel: ActivityLevel;
  dietType: DietType;
  customMacros?: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWaterMl: number;
  bmr: number;
  tdee: number;
  unitSystem: 'metric' | 'imperial';
  isOnboarded: boolean;
  apiKey?: string; // Optional user-supplied OpenAI / Gemini key
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  servingSize: number;
  servingUnit: string;
  category: string;
  icon?: string;
  imageUrl?: string;
  isCustom?: boolean;
}

export interface LoggedFoodItem extends FoodItem {
  logId: string;
  servings: number;
  loggedAt: string; // ISO string
  mealCategory: MealCategory;
  aiGenerated?: boolean;
  healthScore?: number; // 1-100
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  category: 'cardio' | 'strength' | 'sports' | 'walk' | 'other';
  loggedAt: string;
}

export interface DayLog {
  dateString: string; // YYYY-MM-DD
  foods: LoggedFoodItem[];
  waterIntakeMl: number;
  exercises: ExerciseLog[];
  notes?: string;
  weightKg?: number;
}

export interface WeightEntry {
  id: string;
  dateString: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
  photoUri?: string;
}

export interface AIAnalysisResult {
  foodName: string;
  description: string;
  mealCategory: MealCategory;
  servingSize: number;
  servingUnit: string;
  estimatedCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  healthRating: 'A+' | 'A' | 'B' | 'C' | 'D';
  healthScore: number; // 1-100
  insights: string[];
  ingredients: {
    name: string;
    portion: string;
    calories: number;
  }[];
  confidence: number; // 0-100%
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedFoods?: FoodItem[];
  actionRecommendation?: {
    type: 'log_meal' | 'drink_water' | 'recalculate';
    data?: any;
  };
}
