import { ActivityLevel, DietType, GoalType, UserProfile } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, { title: string; desc: string }> = {
  sedentary: { title: 'Sedentary', desc: 'Little to no exercise, desk job' },
  lightly_active: { title: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  moderately_active: { title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  very_active: { title: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  extra_active: { title: 'Athlete / Extra Active', desc: 'Very hard exercise, physical job or 2x training' },
};

export const GOAL_LABELS: Record<GoalType, { title: string; subtitle: string; icon: string; color: string }> = {
  lose_weight: {
    title: 'Lose Weight',
    subtitle: 'Cut body fat while preserving lean muscle',
    icon: 'flame-outline',
    color: '#FF6B6B',
  },
  gain_weight: {
    title: 'Gain Weight & Muscle',
    subtitle: 'Build muscle mass & strength with calorie surplus',
    icon: 'barbell-outline',
    color: '#4ECDC4',
  },
  maintain_weight: {
    title: 'Maintain Weight',
    subtitle: 'Keep current weight, optimize energy & health',
    icon: 'shield-checkmark-outline',
    color: '#6C5CE7',
  },
};

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  return Math.round(base - 78);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

export function calculateTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: ActivityLevel,
  goalType: GoalType,
  goalRateKgPerWeek: number = 0.5,
  dietType: DietType = 'balanced',
  customMacros?: { proteinPct: number; carbsPct: number; fatPct: number }
): {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWaterMl: number;
} {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  // Calorie adjustments: 1 kg body mass ≈ 7700 kcal -> 0.5 kg/week = ~550 kcal/day
  const dailyDelta = Math.round((goalRateKgPerWeek * 7700) / 7);

  let targetCalories = tdee;
  if (goalType === 'lose_weight') {
    targetCalories = tdee - dailyDelta;
    // Floor safety minimums:
    const safeMin = gender === 'female' ? 1200 : 1450;
    if (targetCalories < safeMin) targetCalories = safeMin;
  } else if (goalType === 'gain_weight') {
    targetCalories = tdee + dailyDelta;
  }

  // Macro Splits (Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g)
  let pPct = 0.25;
  let cPct = 0.50;
  let fPct = 0.25;

  if (dietType === 'high_protein') {
    pPct = 0.35;
    cPct = 0.40;
    fPct = 0.25;
  } else if (dietType === 'keto') {
    pPct = 0.25;
    cPct = 0.05;
    fPct = 0.70;
  } else if (dietType === 'low_fat') {
    pPct = 0.30;
    cPct = 0.55;
    fPct = 0.15;
  } else if (dietType === 'custom' && customMacros) {
    pPct = (customMacros.proteinPct || 30) / 100;
    cPct = (customMacros.carbsPct || 45) / 100;
    fPct = (customMacros.fatPct || 25) / 100;
  }

  // Calculate grams
  const targetProteinG = Math.round((targetCalories * pPct) / 4);
  const targetCarbsG = Math.round((targetCalories * cPct) / 4);
  const targetFatG = Math.round((targetCalories * fPct) / 9);

  // Water target: roughly 35ml per kg bodyweight + activity buffer
  const targetWaterMl = Math.round(weightKg * 35 + (activityLevel === 'sedentary' ? 0 : 500));

  return {
    bmr,
    tdee,
    targetCalories: Math.round(targetCalories),
    targetProteinG,
    targetCarbsG,
    targetFatG,
    targetWaterMl,
  };
}
