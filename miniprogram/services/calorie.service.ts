import { callCloudFunction } from "./cloud";
import type {
  DailySummary,
  ExerciseLog,
  MealLog,
  MealType,
  ParsedMealDraft,
  UserProfile,
  UserProfileInput
} from "../models/calorie";

export async function getDailySummary(date: string): Promise<DailySummary> {
  const result = await callCloudFunction<
    {
      action: "getDailySummary";
      payload: { date: string };
    },
    { success: boolean; data?: DailySummary; message?: string }
  >({
    name: "calorie-api",
    data: {
      action: "getDailySummary",
      payload: { date }
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "get daily summary failed");
  }

  return result.data;
}

export async function setUserProfile(input: UserProfileInput): Promise<UserProfile> {
  const result = await callCloudFunction<
    {
      action: "setUserProfile";
      payload: UserProfileInput;
    },
    { success: boolean; data?: UserProfile; message?: string }
  >({
    name: "calorie-api",
    data: {
      action: "setUserProfile",
      payload: input
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "set user profile failed");
  }

  return result.data;
}

export async function parseCalorieDraft(input: {
  date: string;
  mealType: MealType;
  content: string;
}): Promise<ParsedMealDraft> {
  const result = await callCloudFunction<
    {
      action: "parseCalorieInput";
      payload: {
        date: string;
        meal_type: MealType;
        text: string;
      };
    },
    { success: boolean; task_id?: string; data?: ParsedMealDraft; warnings?: string[]; message?: string }
  >({
    name: "ai-parser",
    data: {
      action: "parseCalorieInput",
      payload: {
        date: input.date,
        meal_type: input.mealType,
        text: input.content
      }
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "parse calorie input failed");
  }

  return {
    taskId: result.task_id ?? result.data.taskId,
    foods: result.data.foods,
    totalCaloriesKcal: result.data.totalCaloriesKcal,
    totalProteinG: result.data.totalProteinG,
    totalFatG: result.data.totalFatG,
    totalCarbG: result.data.totalCarbG,
    warnings: result.warnings ?? result.data.warnings
  };
}

export async function addMealLog(input: {
  date: string;
  mealType: MealType;
  originalText: string;
  taskId?: string;
  selectedInventory?: Array<{
    batchId: string;
    foodName: string;
    consumeQuantity: number;
    unit: string;
  }>;
  draft: ParsedMealDraft;
}): Promise<MealLog> {
  const result = await callCloudFunction<
    {
      action: "addMealLog";
      payload: {
        date: string;
        mealType: MealType;
        originalText: string;
        taskId?: string;
        selectedInventory?: Array<{
          batchId: string;
          foodName: string;
          consumeQuantity: number;
          unit: string;
        }>;
        draft: ParsedMealDraft;
      };
    },
    { success: boolean; data?: MealLog; message?: string }
  >({
    name: "calorie-api",
    data: {
      action: "addMealLog",
      payload: input
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "add meal log failed");
  }

  return result.data;
}

export async function addExerciseLog(input: {
  date: string;
  exerciseName: string;
  caloriesKcal: number;
  durationMinutes: number;
}): Promise<ExerciseLog> {
  const result = await callCloudFunction<
    {
      action: "addExerciseLog";
      payload: {
        date: string;
        exerciseName: string;
        caloriesKcal: number;
        durationMinutes: number;
      };
    },
    { success: boolean; data?: ExerciseLog; message?: string }
  >({
    name: "calorie-api",
    data: {
      action: "addExerciseLog",
      payload: input
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "add exercise log failed");
  }

  return result.data;
}
