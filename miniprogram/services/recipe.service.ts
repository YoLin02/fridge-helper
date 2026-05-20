import { callCloudFunction } from "./cloud";
import type { Recipe, RecipeDraft, RecipeRecommendation } from "../models/recipe";

export async function parseRecipeDraft(input: {
  text: string;
}): Promise<RecipeDraft> {
  const result = await callCloudFunction<
    {
      action: "parseRecipeInput";
      payload: {
        text: string;
      };
    },
    {
      success: boolean;
      task_id?: string;
      data?: RecipeDraft;
      warnings?: string[];
      message?: string;
    }
  >({
    name: "ai-parser",
    data: {
      action: "parseRecipeInput",
      payload: {
        text: input.text
      }
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "parse recipe failed");
  }

  return {
    ...result.data,
    taskId: result.task_id ?? result.data.taskId,
    warnings: result.warnings ?? result.data.warnings
  };
}

export async function createRecipe(input: {
  taskId?: string;
  draft: RecipeDraft;
}): Promise<Recipe> {
  const result = await callCloudFunction<
    {
      action: "createRecipe";
      payload: {
        taskId?: string;
        draft: RecipeDraft;
      };
    },
    { success: boolean; data?: Recipe; message?: string }
  >({
    name: "recipe-api",
    data: {
      action: "createRecipe",
      payload: input
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "create recipe failed");
  }

  return result.data;
}

export async function listRecipes(): Promise<Recipe[]> {
  const result = await callCloudFunction<
    {
      action: "listRecipes";
      payload: Record<string, never>;
    },
    { success: boolean; data?: { items: Recipe[] }; message?: string }
  >({
    name: "recipe-api",
    data: {
      action: "listRecipes",
      payload: {}
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "list recipes failed");
  }

  return result.data.items;
}

export async function getRecipeDetail(recipeId: string): Promise<Recipe> {
  const result = await callCloudFunction<
    {
      action: "getRecipeDetail";
      payload: {
        recipeId: string;
      };
    },
    { success: boolean; data?: Recipe; message?: string }
  >({
    name: "recipe-api",
    data: {
      action: "getRecipeDetail",
      payload: {
        recipeId
      }
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "get recipe detail failed");
  }

  return result.data;
}

export async function getRecipeRecommendations(input: {
  remainingCaloriesKcal?: number;
}): Promise<RecipeRecommendation[]> {
  const result = await callCloudFunction<
    {
      action: "recommendRecipes";
      payload: {
        remainingCaloriesKcal?: number;
      };
    },
    { success: boolean; data?: { items: RecipeRecommendation[] }; message?: string }
  >({
    name: "recipe-api",
    data: {
      action: "recommendRecipes",
      payload: input
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "recommend recipes failed");
  }

  return result.data.items;
}
