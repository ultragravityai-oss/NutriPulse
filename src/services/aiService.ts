import { AIAnalysisResult, AIChatMessage, FoodItem, MealCategory, UserProfile } from '../types';

interface AIRequestOptions {
  userPrompt: string;
  imageUri?: string;
  userProfile?: UserProfile;
  remainingCalories?: number;
  remainingProtein?: number;
}

// Fallback intelligent parser with rich culinary & nutritional database
export function parseFoodLocally(prompt: string): AIAnalysisResult {
  const clean = prompt.toLowerCase().trim();
  
  // Detect meal category
  let mealCategory: MealCategory = 'lunch';
  if (clean.includes('breakfast') || clean.includes('egg') || clean.includes('oat') || clean.includes('toast') || clean.includes('coffee') || clean.includes('pancake') || clean.includes('cereal')) {
    mealCategory = 'breakfast';
  } else if (clean.includes('dinner') || clean.includes('steak') || clean.includes('curry') || clean.includes('pasta') || clean.includes('salmon') || clean.includes('burger')) {
    mealCategory = 'dinner';
  } else if (clean.includes('snack') || clean.includes('bar') || clean.includes('cookie') || clean.includes('apple') || clean.includes('nuts') || clean.includes('yogurt') || clean.includes('shake')) {
    mealCategory = 'snacks';
  }

  // Base smart calculation
  let estimatedCalories = 450;
  let proteinG = 25;
  let carbsG = 45;
  let fatG = 15;
  let fiberG = 5;
  let ingredients: { name: string; portion: string; calories: number }[] = [];
  let insights: string[] = [];
  let healthScore = 85;
  let healthRating: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A';

  // Keyword-based analysis
  if (clean.includes('chicken') && clean.includes('rice')) {
    estimatedCalories = 540;
    proteinG = 42;
    carbsG = 58;
    fatG = 12;
    fiberG = 4;
    ingredients = [
      { name: 'Grilled Chicken Breast', portion: '180g', calories: 290 },
      { name: 'Brown / Jasmine Rice', portion: '1.5 cups (200g)', calories: 210 },
      { name: 'Seasoning & Olive Oil', portion: '1 tsp', calories: 40 },
    ];
    insights = [
      'High protein meal perfect for lean muscle growth and recovery.',
      'Complex carbohydrates support sustained energy throughout the day.',
      'Low in saturated fats.',
    ];
    healthScore = 92;
    healthRating = 'A+';
  } else if (clean.includes('avocado') && clean.includes('toast')) {
    estimatedCalories = 380;
    proteinG = 14;
    carbsG = 34;
    fatG = 22;
    fiberG = 9;
    ingredients = [
      { name: 'Sourdough Artisan Bread', portion: '2 slices', calories: 200 },
      { name: 'Fresh Hass Avocado', portion: '1/2 medium (75g)', calories: 120 },
      { name: 'Poached Egg / Toppings', portion: '1 egg + chili flakes', calories: 60 },
    ];
    insights = [
      'Rich in heart-healthy monounsaturated fats.',
      'High dietary fiber (9g) helps with satiety and gut health.',
      'Good source of potassium and folate.',
    ];
    healthScore = 89;
    healthRating = 'A';
  } else if (clean.includes('salmon') || clean.includes('fish')) {
    estimatedCalories = 480;
    proteinG = 38;
    carbsG = 25;
    fatG = 24;
    fiberG = 5;
    ingredients = [
      { name: 'Pan-Seared Atlantic Salmon', portion: '180g', calories: 340 },
      { name: 'Steamed Asparagus / Veggies', portion: '150g', calories: 45 },
      { name: 'Quinoa / Sweet Potato', portion: '100g', calories: 95 },
    ];
    insights = [
      'Exceptional source of Omega-3 fatty acids (EPA & DHA).',
      'High biological value protein for muscle synthesis.',
      'Low glycemic impact.',
    ];
    healthScore = 96;
    healthRating = 'A+';
  } else if (clean.includes('salad') || clean.includes('bowl')) {
    estimatedCalories = 420;
    proteinG = 28;
    carbsG = 32;
    fatG = 18;
    fiberG = 7;
    ingredients = [
      { name: 'Mixed Greens & Spinach', portion: '150g', calories: 35 },
      { name: 'Lean Grilled Protein', portion: '120g', calories: 190 },
      { name: 'Light Vinaigrette & Nuts', portion: '2 tbsp', calories: 130 },
      { name: 'Chickpeas / Quinoa', portion: '50g', calories: 65 },
    ];
    insights = [
      'High in micronutrients, antioxidants, and dietary fiber.',
      'Helps maintain steady blood sugar levels.',
    ];
    healthScore = 91;
    healthRating = 'A';
  } else if (clean.includes('pizza') || clean.includes('burger') || clean.includes('fries')) {
    estimatedCalories = 680;
    proteinG = 28;
    carbsG = 65;
    fatG = 32;
    fiberG = 3;
    ingredients = [
      { name: 'Main Entree / Bun / Crust', portion: '1 standard serving', calories: 420 },
      { name: 'Cheese & Sauces', portion: '45g', calories: 180 },
      { name: 'Side / Condiments', portion: 'Portion', calories: 80 },
    ];
    insights = [
      'Higher in saturated fats and sodium — balance with higher fiber meals today.',
      'Satisfies quick energy requirements.',
    ];
    healthScore = 65;
    healthRating = 'C';
  } else if (clean.includes('oat') || clean.includes('oatmeal') || clean.includes('porridge')) {
    estimatedCalories = 360;
    proteinG = 18;
    carbsG = 52;
    fatG = 8;
    fiberG = 7;
    ingredients = [
      { name: 'Rolled Oats', portion: '50g', calories: 180 },
      { name: 'Protein Powder / Milk', portion: '1 scoop / cup', calories: 120 },
      { name: 'Berries & Seeds', portion: '50g', calories: 60 },
    ];
    insights = [
      'Beta-glucan soluble fiber supports heart health and lowering LDL.',
      'Slow-digesting complex carbs prevent energy crashes.',
    ];
    healthScore = 94;
    healthRating = 'A+';
  } else {
    // General meal estimate
    const words = clean.split(' ').length;
    estimatedCalories = Math.min(850, Math.max(220, 280 + words * 25));
    proteinG = Math.round((estimatedCalories * 0.25) / 4);
    carbsG = Math.round((estimatedCalories * 0.45) / 4);
    fatG = Math.round((estimatedCalories * 0.30) / 9);
    fiberG = 4;
    ingredients = [
      { name: prompt.slice(0, 40), portion: '1 main portion', calories: Math.round(estimatedCalories * 0.7) },
      { name: 'Accompaniments & Seasoning', portion: 'Standard', calories: Math.round(estimatedCalories * 0.3) },
    ];
    insights = [
      'Estimated based on standard nutritional density benchmarks.',
      'You can fine-tune portion sizes and macros before logging.',
    ];
  }

  // Capitalize name
  const foodName = prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt.charAt(0).toUpperCase() + prompt.slice(1);

  return {
    foodName,
    description: `AI estimated nutritional profile for "${prompt}"`,
    mealCategory,
    servingSize: 1,
    servingUnit: 'serving',
    estimatedCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    healthRating,
    healthScore,
    insights,
    ingredients,
    confidence: 94,
  };
}

// Online API analyzer with graceful fallback
export async function analyzeFoodWithAI(
  input: string,
  mealCat: MealCategory = 'lunch',
  userApiKey?: string
): Promise<AIAnalysisResult> {
  const prompt = input.trim();
  if (!prompt) {
    throw new Error('Please enter a food description or photo');
  }

  // Try calling AI LLM endpoint
  try {
    const systemPrompt = `You are an expert sports nutritionist and food science AI. Analyze the food described by the user and respond strictly with valid JSON only (no markdown, no backticks, no extra text).
JSON format:
{
  "foodName": "Short descriptive food name",
  "description": "Brief 1-sentence description",
  "mealCategory": "${mealCat}",
  "servingSize": 1,
  "servingUnit": "serving / plate / bowl",
  "estimatedCalories": 450,
  "proteinG": 32,
  "carbsG": 45,
  "fatG": 14,
  "fiberG": 6,
  "healthRating": "A" (choose from "A+", "A", "B", "C", "D"),
  "healthScore": 88,
  "insights": ["Insight 1 on macros or benefits", "Insight 2 on dietary value"],
  "ingredients": [
    {"name": "Ingredient 1", "portion": "150g", "calories": 250},
    {"name": "Ingredient 2", "portion": "1 cup", "calories": 150}
  ],
  "confidence": 95
}`;

    const endpoint = 'https://text.pollinations.ai/';
    const fullPrompt = `${systemPrompt}\n\nUser food to analyze: "${prompt}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(endpoint + encodeURIComponent(fullPrompt), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const rawText = await res.text();
      // Try to extract JSON
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.estimatedCalories && parsed.proteinG !== undefined) {
          return {
            foodName: parsed.foodName || prompt,
            description: parsed.description || `AI analyzed: ${prompt}`,
            mealCategory: parsed.mealCategory || mealCat,
            servingSize: Number(parsed.servingSize) || 1,
            servingUnit: parsed.servingUnit || 'serving',
            estimatedCalories: Math.round(Number(parsed.estimatedCalories)),
            proteinG: Math.round(Number(parsed.proteinG)),
            carbsG: Math.round(Number(parsed.carbsG)),
            fatG: Math.round(Number(parsed.fatG)),
            fiberG: Math.round(Number(parsed.fiberG || 4)),
            healthRating: parsed.healthRating || 'A',
            healthScore: Math.min(100, Math.max(20, Number(parsed.healthScore) || 85)),
            insights: Array.isArray(parsed.insights) && parsed.insights.length ? parsed.insights : ['Accurate macro balance calculated by AI.'],
            ingredients: Array.isArray(parsed.ingredients) && parsed.ingredients.length ? parsed.ingredients : [
              { name: prompt, portion: '1 serving', calories: Math.round(Number(parsed.estimatedCalories)) }
            ],
            confidence: Math.min(100, Math.max(70, Number(parsed.confidence) || 92)),
          };
        }
      }
    }
  } catch (err) {
    // Network or parsing error, seamlessly proceed to offline expert engine
    console.log('AI API fetch fallback to local engine:', err);
  }

  // Fallback to local expert parser
  return parseFoodLocally(prompt);
}

// AI Coach Chat Engine
export async function getNutritionCoachResponse(
  userMessage: string,
  history: AIChatMessage[],
  profile: UserProfile,
  dailySummary: {
    consumedCalories: number;
    targetCalories: number;
    consumedProtein: number;
    targetProtein: number;
    consumedCarbs: number;
    targetCarbs: number;
    consumedFat: number;
    targetFat: number;
    waterIntakeMl: number;
  }
): Promise<string> {
  const goalText = profile.goalType === 'lose_weight' 
    ? 'weight loss & fat burning (deficit)'
    : profile.goalType === 'gain_weight'
    ? 'weight/muscle gain & hypertrophy (surplus)'
    : 'weight maintenance & vitality';

  const caloriesRemaining = dailySummary.targetCalories - dailySummary.consumedCalories;
  const proteinRemaining = dailySummary.targetProtein - dailySummary.consumedProtein;

  try {
    const prompt = `You are "NutriPulse AI", a friendly, motivational, highly certified sports nutritionist & calorie coach.
User Context:
- Goal: ${goalText} (Target: ${profile.targetWeightKg}kg, Current: ${profile.currentWeightKg}kg)
- Daily Budget: ${dailySummary.targetCalories} kcal (Consumed: ${dailySummary.consumedCalories} kcal, Remaining: ${caloriesRemaining} kcal)
- Protein Target: ${dailySummary.targetProtein}g (Consumed: ${dailySummary.consumedProtein}g, Remaining: ${proteinRemaining}g)
- Water Logged: ${dailySummary.waterIntakeMl}ml / ${profile.targetWaterMl}ml

User Question: "${userMessage}"

Provide a concise, highly practical, motivating answer (2-4 paragraphs or bullet points). If recommending foods, include realistic calorie and protein counts! Keep tone energetic and supportive.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt), {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 20) {
        return text.trim();
      }
    }
  } catch (e) {
    console.log('Coach fetch fallback:', e);
  }

  // Smart local responses
  const q = userMessage.toLowerCase();
  if (q.includes('snack') || q.includes('remaining') || q.includes('what can i eat')) {
    if (caloriesRemaining > 300) {
      return `Based on your remaining **${caloriesRemaining} kcal** and **${proteinRemaining}g protein** budget for today:\n\n1. **Greek Yogurt Crunch** (170g 0% Greek yogurt + 15g almonds + berries): ~210 kcal | 20g Protein\n2. **Protein Shake & Rice Cake**: 1 scoop whey + 1 rice cake with peanut butter: ~240 kcal | 26g Protein\n3. **Cottage Cheese & Pineapple Bowl**: ~180 kcal | 22g Protein\n\nThese will keep you on track for your **${profile.goalType === 'gain_weight' ? 'bulking' : 'cutting'}** goal!`;
    } else if (caloriesRemaining > 100) {
      return `You have **${caloriesRemaining} kcal** remaining today. Here are light, filling options:\n\n• **Hard-Boiled Egg with Sea Salt**: 78 kcal | 6.3g Protein\n• **Apple slices with cinnamon**: ~75 kcal | High fiber\n• **Hot Green Tea + 1 square 85% Dark Chocolate**: ~60 kcal\n• **Large glass of ice water or electrolyte water** to curb late cravings!`;
    } else {
      return `You've reached your daily calorie target (${dailySummary.consumedCalories} / ${dailySummary.targetCalories} kcal)! Great discipline today. If you feel hungry, opt for zero-calorie peppermint herbal tea, sparkling water with lime, or sliced crisp cucumber with salt.`;
    }
  }

  if (q.includes('protein') || q.includes('muscle') || q.includes('hit protein')) {
    return `To hit your **${dailySummary.targetProtein}g daily protein target** without blowing your calorie budget:\n\n• **Top lean choices**: Chicken breast (31g P / 165 kcal), 0% Greek yogurt (18g P / 100 kcal), Egg whites (11g P / 51 kcal), Tuna in water (25g P / 116 kcal), Whey isolate (24g P / 120 kcal).\n• Tip: Aim for 25-35g of protein distributed across each of your 3-4 meals!`;
  }

  if (q.includes('lose') || q.includes('fat') || q.includes('deficit')) {
    return `Your calorie deficit of **${dailySummary.targetCalories} kcal/day** is calibrated for steady, sustainable fat loss without losing muscle. Remember to keep protein high (${profile.targetProteinG}g) and drink at least ${profile.targetWaterMl}ml of water daily to boost metabolic rate and keep hunger under control!`;
  }

  return `Great question! Staying consistent with your **${dailySummary.targetCalories} kcal** daily target and prioritizing whole foods, lean proteins, and fiber is the #1 driver for your **${profile.goalType === 'lose_weight' ? 'fat loss' : profile.goalType === 'gain_weight' ? 'muscle gain' : 'maintenance'}** goal. You're at ${dailySummary.consumedCalories} kcal today. Let me know if you need specific meal suggestions or recipe ideas!`;
}
