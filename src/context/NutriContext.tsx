import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DayLog,
  ExerciseLog,
  FoodItem,
  LoggedFoodItem,
  MealCategory,
  UserProfile,
  WeightEntry,
} from '../types';
import { calculateTargets } from '../utils/bmrCalculator';
import { formatDateToISO, getPastNDays, getTodayISO, parseISODate } from '../utils/dateUtils';
import { FOOD_DATABASE } from '../constants/foodDatabase';

interface DailySummary {
  consumedCalories: number;
  burnedCalories: number;
  netCalories: number;
  targetCalories: number;
  remainingCalories: number;
  consumedProtein: number;
  targetProtein: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
  waterIntakeMl: number;
  targetWaterMl: number;
  mealBreakdown: Record<MealCategory, { calories: number; protein: number; carbs: number; fat: number; items: LoggedFoodItem[] }>;
}

interface NutriContextType {
  profile: UserProfile;
  selectedDate: string;
  dayLog: DayLog;
  allDayLogs: Record<string, DayLog>;
  weightHistory: WeightEntry[];
  streak: number;
  summary: DailySummary;
  isReady: boolean;
  setSelectedDate: (date: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addFoodToMeal: (meal: MealCategory, food: FoodItem, servings?: number, customNotes?: string, aiGenerated?: boolean) => void;
  removeFoodItem: (logId: string) => void;
  updateFoodItemServings: (logId: string, servings: number) => void;
  addWaterIntake: (amountMl: number) => void;
  setWaterIntake: (amountMl: number) => void;
  addExerciseLog: (exercise: Omit<ExerciseLog, 'id' | 'loggedAt'>) => void;
  removeExerciseLog: (exerciseId: string) => void;
  logDailyWeight: (weightKg: number, notes?: string) => void;
  getDayLogForDate: (dateString: string) => DayLog;
  getDailySummaryForDate: (dateString: string) => DailySummary;
  resetAllData: () => Promise<void>;
  seedDemoHistory: () => Promise<void>;
}

const STORAGE_KEYS = {
  PROFILE: '@nutripulse_profile_v1',
  DAY_LOGS: '@nutripulse_daylogs_v1',
  WEIGHT_LOGS: '@nutripulse_weights_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Hunter',
  age: 26,
  gender: 'male',
  heightCm: 178,
  currentWeightKg: 78.5,
  targetWeightKg: 72.0,
  goalType: 'lose_weight',
  goalRateKgPerWeek: 0.5,
  activityLevel: 'moderately_active',
  dietType: 'high_protein',
  targetCalories: 2150,
  targetProteinG: 175,
  targetCarbsG: 210,
  targetFatG: 65,
  targetWaterMl: 3200,
  bmr: 1765,
  tdee: 2735,
  unitSystem: 'metric',
  isOnboarded: true,
};

// Initial Seed Data generator for past 7 days to give vibrant immediate experience
function generateDemoData(profile: UserProfile): { dayLogs: Record<string, DayLog>; weights: WeightEntry[] } {
  const dayLogs: Record<string, DayLog> = {};
  const weights: WeightEntry[] = [];
  const pastDates = getPastNDays(8); // past 7 days + today

  // Pre-selected meals for past days
  const chicken = FOOD_DATABASE.find((f) => f.id === 'food_1')!;
  const eggs = FOOD_DATABASE.find((f) => f.id === 'food_2')!;
  const oats = FOOD_DATABASE.find((f) => f.id === 'food_13')!;
  const salmon = FOOD_DATABASE.find((f) => f.id === 'food_4')!;
  const yogurt = FOOD_DATABASE.find((f) => f.id === 'food_7')!;
  const whey = FOOD_DATABASE.find((f) => f.id === 'food_10')!;
  const brownRice = FOOD_DATABASE.find((f) => f.id === 'food_11')!;
  const avocado = FOOD_DATABASE.find((f) => f.id === 'food_19')!;
  const sweetPotato = FOOD_DATABASE.find((f) => f.id === 'food_16')!;
  const banana = FOOD_DATABASE.find((f) => f.id === 'food_24')!;
  const chipotle = FOOD_DATABASE.find((f) => f.id === 'food_31')!;
  const caesar = FOOD_DATABASE.find((f) => f.id === 'food_37')!;

  pastDates.forEach((date, index) => {
    const isToday = index === pastDates.length - 1;
    const foodItems: LoggedFoodItem[] = [];

    // Breakfast
    foodItems.push({
      ...eggs,
      logId: `log_${date}_1`,
      servings: 2,
      loggedAt: `${date}T08:15:00.000Z`,
      mealCategory: 'breakfast',
      healthScore: 92,
    });
    foodItems.push({
      ...oats,
      logId: `log_${date}_2`,
      servings: 1.5,
      loggedAt: `${date}T08:20:00.000Z`,
      mealCategory: 'breakfast',
      healthScore: 95,
    });

    // Lunch
    if (index % 2 === 0) {
      foodItems.push({
        ...chicken,
        logId: `log_${date}_3`,
        servings: 2,
        loggedAt: `${date}T13:00:00.000Z`,
        mealCategory: 'lunch',
        healthScore: 98,
      });
      foodItems.push({
        ...brownRice,
        logId: `log_${date}_4`,
        servings: 1.2,
        loggedAt: `${date}T13:00:00.000Z`,
        mealCategory: 'lunch',
        healthScore: 90,
      });
      foodItems.push({
        ...avocado,
        logId: `log_${date}_5`,
        servings: 0.5,
        loggedAt: `${date}T13:05:00.000Z`,
        mealCategory: 'lunch',
        healthScore: 94,
      });
    } else {
      foodItems.push({
        ...chipotle,
        logId: `log_${date}_3`,
        servings: 1,
        loggedAt: `${date}T13:15:00.000Z`,
        mealCategory: 'lunch',
        healthScore: 88,
      });
    }

    // Snacks
    foodItems.push({
      ...whey,
      logId: `log_${date}_6`,
      servings: 1,
      loggedAt: `${date}T16:30:00.000Z`,
      mealCategory: 'snacks',
      healthScore: 90,
    });
    foodItems.push({
      ...banana,
      logId: `log_${date}_7`,
      servings: 1,
      loggedAt: `${date}T16:30:00.000Z`,
      mealCategory: 'snacks',
      healthScore: 96,
    });

    // Dinner (only for past days, or lighter for today)
    if (!isToday || new Date().getHours() >= 19) {
      foodItems.push({
        ...salmon,
        logId: `log_${date}_8`,
        servings: 1.5,
        loggedAt: `${date}T19:45:00.000Z`,
        mealCategory: 'dinner',
        healthScore: 99,
      });
      foodItems.push({
        ...sweetPotato,
        logId: `log_${date}_9`,
        servings: 1,
        loggedAt: `${date}T19:45:00.000Z`,
        mealCategory: 'dinner',
        healthScore: 93,
      });
    }

    const waterBase = 2250 + (index % 4) * 250;
    const water = isToday ? 1750 : Math.min(3200, waterBase);

    const exercises: ExerciseLog[] = [];
    if (index % 2 === 0) {
      exercises.push({
        id: `ex_${date}_1`,
        name: 'Full Body Strength Workout',
        durationMinutes: 48,
        caloriesBurned: 340,
        category: 'strength',
        loggedAt: `${date}T17:30:00.000Z`,
      });
    } else if (index % 3 === 0) {
      exercises.push({
        id: `ex_${date}_2`,
        name: 'Morning Jog & Intervals',
        durationMinutes: 32,
        caloriesBurned: 290,
        category: 'cardio',
        loggedAt: `${date}T07:15:00.000Z`,
      });
    }

    const dayWeight = Number((79.4 - index * 0.12).toFixed(1));

    dayLogs[date] = {
      dateString: date,
      foods: foodItems,
      waterIntakeMl: water,
      exercises,
      weightKg: dayWeight,
    };

    weights.push({
      id: `w_${date}`,
      dateString: date,
      weightKg: dayWeight,
      notes: index === pastDates.length - 1 ? 'Morning weigh-in' : 'Progress check',
    });
  });

  return { dayLogs, weights };
}

const NutriContext = createContext<NutriContextType | undefined>(undefined);

export const NutriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [allDayLogs, setAllDayLogs] = useState<Record<string, DayLog>>({});
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load persisted data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedProfile, savedLogs, savedWeights] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.DAY_LOGS),
          AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS),
        ]);

        let prof = DEFAULT_PROFILE;
        if (savedProfile) {
          prof = JSON.parse(savedProfile);
          setProfile(prof);
        }

        if (savedLogs && savedWeights) {
          setAllDayLogs(JSON.parse(savedLogs));
          setWeightHistory(JSON.parse(savedWeights));
        } else {
          // Initialize with rich demo data
          const { dayLogs, weights } = generateDemoData(prof);
          setAllDayLogs(dayLogs);
          setWeightHistory(weights);
          await AsyncStorage.setItem(STORAGE_KEYS.DAY_LOGS, JSON.stringify(dayLogs));
          await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(weights));
        }
      } catch (e) {
        console.error('Error loading NutriPulse storage:', e);
      } finally {
        setIsReady(true);
      }
    }
    loadData();
  }, []);

  // Save changes to storage
  const saveLogsToStorage = async (logs: Record<string, DayLog>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save day logs:', e);
    }
  };

  const saveWeightsToStorage = async (weights: WeightEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(weights));
    } catch (e) {
      console.error('Failed to save weights:', e);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    // Recalculate targets
    const targets = calculateTargets(
      updated.currentWeightKg,
      updated.heightCm,
      updated.age,
      updated.gender,
      updated.activityLevel,
      updated.goalType,
      updated.goalRateKgPerWeek,
      updated.dietType,
      updated.customMacros
    );

    const fullProfile: UserProfile = {
      ...updated,
      ...targets,
    };

    setProfile(fullProfile);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(fullProfile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  // Get current active day log
  const dayLog: DayLog = useMemo(() => {
    if (allDayLogs[selectedDate]) {
      return allDayLogs[selectedDate];
    }
    return {
      dateString: selectedDate,
      foods: [],
      waterIntakeMl: 0,
      exercises: [],
    };
  }, [allDayLogs, selectedDate]);

  // Calculate summary for any date
  const getDailySummaryForDate = (dateString: string): DailySummary => {
    const currentLog = allDayLogs[dateString] || {
      dateString,
      foods: [],
      waterIntakeMl: 0,
      exercises: [],
    };

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;

    const mealBreakdown: Record<MealCategory, { calories: number; protein: number; carbs: number; fat: number; items: LoggedFoodItem[] }> = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
      snacks: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
    };

    currentLog.foods.forEach((food) => {
      const c = Math.round(food.calories * food.servings);
      const p = Math.round(food.proteinG * food.servings);
      const cb = Math.round(food.carbsG * food.servings);
      const f = Math.round(food.fatG * food.servings);

      consumedCalories += c;
      consumedProtein += p;
      consumedCarbs += cb;
      consumedFat += f;

      const cat = food.mealCategory || 'lunch';
      mealBreakdown[cat].calories += c;
      mealBreakdown[cat].protein += p;
      mealBreakdown[cat].carbs += cb;
      mealBreakdown[cat].fat += f;
      mealBreakdown[cat].items.push(food);
    });

    const burnedCalories = currentLog.exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    const targetCalories = profile.targetCalories;
    const remainingCalories = targetCalories - consumedCalories + burnedCalories;
    const netCalories = consumedCalories - burnedCalories;

    return {
      consumedCalories,
      burnedCalories,
      netCalories,
      targetCalories,
      remainingCalories,
      consumedProtein,
      targetProtein: profile.targetProteinG,
      consumedCarbs,
      targetCarbs: profile.targetCarbsG,
      consumedFat,
      targetFat: profile.targetFatG,
      waterIntakeMl: currentLog.waterIntakeMl || 0,
      targetWaterMl: profile.targetWaterMl,
      mealBreakdown,
    };
  };

  const summary = useMemo(() => {
    return getDailySummaryForDate(selectedDate);
  }, [allDayLogs, selectedDate, profile]);

  // Streak calculation (consecutive days with at least 1 food or water logged)
  const streak = useMemo(() => {
    let count = 0;
    const today = parseISODate(getTodayISO());

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = formatDateToISO(checkDate);
      const log = allDayLogs[dateStr];

      if (log && (log.foods.length > 0 || log.waterIntakeMl > 0)) {
        count++;
      } else {
        // If today has no log yet, don't break streak if yesterday was logged
        if (i === 0) continue;
        break;
      }
    }
    return Math.max(1, count);
  }, [allDayLogs]);

  const addFoodToMeal = (
    meal: MealCategory,
    food: FoodItem,
    servings: number = 1,
    customNotes?: string,
    aiGenerated: boolean = false
  ) => {
    const newLoggedFood: LoggedFoodItem = {
      ...food,
      logId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      servings,
      loggedAt: new Date().toISOString(),
      mealCategory: meal,
      aiGenerated,
      notes: customNotes,
    };

    setAllDayLogs((prev) => {
      const current = prev[selectedDate] || {
        dateString: selectedDate,
        foods: [],
        waterIntakeMl: 0,
        exercises: [],
      };

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          foods: [...current.foods, newLoggedFood],
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const removeFoodItem = (logId: string) => {
    setAllDayLogs((prev) => {
      const current = prev[selectedDate];
      if (!current) return prev;

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          foods: current.foods.filter((f) => f.logId !== logId),
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const updateFoodItemServings = (logId: string, servings: number) => {
    setAllDayLogs((prev) => {
      const current = prev[selectedDate];
      if (!current) return prev;

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          foods: current.foods.map((f) => (f.logId === logId ? { ...f, servings: Math.max(0.1, servings) } : f)),
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const addWaterIntake = (amountMl: number) => {
    setAllDayLogs((prev) => {
      const current = prev[selectedDate] || {
        dateString: selectedDate,
        foods: [],
        waterIntakeMl: 0,
        exercises: [],
      };

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          waterIntakeMl: Math.max(0, (current.waterIntakeMl || 0) + amountMl),
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const setWaterIntake = (amountMl: number) => {
    setAllDayLogs((prev) => {
      const current = prev[selectedDate] || {
        dateString: selectedDate,
        foods: [],
        waterIntakeMl: 0,
        exercises: [],
      };

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          waterIntakeMl: Math.max(0, amountMl),
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const addExerciseLog = (exercise: Omit<ExerciseLog, 'id' | 'loggedAt'>) => {
    const newEx: ExerciseLog = {
      ...exercise,
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      loggedAt: new Date().toISOString(),
    };

    setAllDayLogs((prev) => {
      const current = prev[selectedDate] || {
        dateString: selectedDate,
        foods: [],
        waterIntakeMl: 0,
        exercises: [],
      };

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          exercises: [...current.exercises, newEx],
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const removeExerciseLog = (exerciseId: string) => {
    setAllDayLogs((prev) => {
      const current = prev[selectedDate];
      if (!current) return prev;

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          exercises: current.exercises.filter((ex) => ex.id !== exerciseId),
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });
  };

  const logDailyWeight = (weightKg: number, notes?: string) => {
    const entry: WeightEntry = {
      id: `w_${selectedDate}_${Date.now()}`,
      dateString: selectedDate,
      weightKg,
      notes,
    };

    // Update weight history
    const updatedWeights = [entry, ...weightHistory.filter((w) => w.dateString !== selectedDate)];
    setWeightHistory(updatedWeights);
    saveWeightsToStorage(updatedWeights);

    // Update day log
    setAllDayLogs((prev) => {
      const current = prev[selectedDate] || {
        dateString: selectedDate,
        foods: [],
        waterIntakeMl: 0,
        exercises: [],
      };

      const updated = {
        ...prev,
        [selectedDate]: {
          ...current,
          weightKg,
        },
      };

      saveLogsToStorage(updated);
      return updated;
    });

    // Also update current profile weight if logging for today
    if (selectedDate === getTodayISO()) {
      updateProfile({ currentWeightKg: weightKg });
    }
  };

  const getDayLogForDate = (dateString: string): DayLog => {
    return allDayLogs[dateString] || {
      dateString,
      foods: [],
      waterIntakeMl: 0,
      exercises: [],
    };
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROFILE,
        STORAGE_KEYS.DAY_LOGS,
        STORAGE_KEYS.WEIGHT_LOGS,
      ]);
      setProfile(DEFAULT_PROFILE);
      setAllDayLogs({});
      setWeightHistory([]);
      setSelectedDate(getTodayISO());
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const seedDemoHistory = async () => {
    const { dayLogs, weights } = generateDemoData(profile);
    setAllDayLogs(dayLogs);
    setWeightHistory(weights);
    await saveLogsToStorage(dayLogs);
    await saveWeightsToStorage(weights);
  };

  return (
    <NutriContext.Provider
      value={{
        profile,
        selectedDate,
        dayLog,
        allDayLogs,
        weightHistory,
        streak,
        summary,
        isReady,
        setSelectedDate,
        updateProfile,
        addFoodToMeal,
        removeFoodItem,
        updateFoodItemServings,
        addWaterIntake,
        setWaterIntake,
        addExerciseLog,
        removeExerciseLog,
        logDailyWeight,
        getDayLogForDate,
        getDailySummaryForDate,
        resetAllData,
        seedDemoHistory,
      }}
    >
      {children}
    </NutriContext.Provider>
  );
};

export const useNutri = () => {
  const context = useContext(NutriContext);
  if (!context) {
    throw new Error('useNutri must be used within a NutriProvider');
  }
  return context;
};
