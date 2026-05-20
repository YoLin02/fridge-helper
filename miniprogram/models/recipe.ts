export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  required: boolean;
}

export interface RecipeDraft {
  taskId?: string;
  recipeName: string;
  description: string;
  tags: string[];
  cookingTime: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: RecipeIngredient[];
  steps: string[];
  estimatedCaloriesKcal: number;
  warnings: string[];
}

export interface Recipe {
  id: string;
  recipeName: string;
  description: string;
  tags: string[];
  cookingTime: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: RecipeIngredient[];
  steps: string[];
  estimatedCaloriesKcal: number;
  createdAt: string;
}

export interface RecipeRecommendation {
  recipeId: string;
  recipeName: string;
  estimatedCaloriesKcal: number;
  cookingTime: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
}
