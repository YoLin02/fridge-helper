export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type GoalType = "maintain" | "fat_loss_light" | "fat_loss" | "muscle_gain";

export type GenderType = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

export interface UserProfileInput {
  gender: GenderType;
  birthday: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: GoalType;
  activityLevel: ActivityLevel;
}

export interface UserProfile extends UserProfileInput {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  fatTargetG: number;
  carbTargetG: number;
}

export interface ParsedFoodItem {
  foodName: string;
  quantity: number;
  unit: string;
  estimatedWeightG: number;
  caloriesKcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  confidence: number;
  inventoryBatchId?: string;
}

export interface ParsedMealDraft {
  taskId?: string;
  foods: ParsedFoodItem[];
  totalCaloriesKcal: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbG: number;
  warnings: string[];
}

export interface MealLog {
  id: string;
  date: string;
  mealType: MealType;
  inputType: string;
  originalText: string;
  foods: ParsedFoodItem[];
  totalCaloriesKcal: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbG: number;
  createdAt: string;
}

export interface ExerciseLog {
  id: string;
  date: string;
  exerciseName: string;
  caloriesKcal: number;
  durationMinutes: number;
  createdAt: string;
}

export interface MacroSummary {
  current: number;
  target: number;
}

export interface DailySummary {
  date: string;
  profile?: UserProfile;
  remainingCaloriesKcal: number;
  consumedCaloriesKcal: number;
  exerciseCaloriesKcal: number;
  recommendedCaloriesKcal: number;
  carb: MacroSummary;
  protein: MacroSummary;
  fat: MacroSummary;
  meals: Record<MealType, MealLog[]>;
  exercises: ExerciseLog[];
}
