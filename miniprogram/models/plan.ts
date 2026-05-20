export type PlanGoal = "maintain" | "fat_loss" | "muscle_gain" | "clear_inventory" | "quick";

export interface PlanMealItem {
  mealType: "breakfast" | "lunch" | "dinner";
  recipeId: string;
  recipeName: string;
  estimatedCaloriesKcal: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
}

export interface DailyPlanItem {
  date: string;
  meals: PlanMealItem[];
  totalCaloriesKcal: number;
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  reason: string;
}

export interface WeeklyPlan {
  id: string;
  cycleDays: number;
  peopleCount: number;
  goal: PlanGoal;
  dailyCalorieTarget: number;
  days: DailyPlanItem[];
  shoppingList: ShoppingListItem[];
  prepSuggestions: string[];
  expiringStrategies: string[];
  createdAt: string;
}
