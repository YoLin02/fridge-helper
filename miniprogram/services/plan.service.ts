import { callCloudFunction } from "./cloud";
import type { PlanGoal, WeeklyPlan } from "../models/plan";

export async function generateWeeklyPlan(input: {
  cycleDays: number;
  peopleCount: number;
  goal: PlanGoal;
}): Promise<WeeklyPlan> {
  const result = await callCloudFunction<
    {
      action: "generateWeeklyPlan";
      payload: {
        cycleDays: number;
        peopleCount: number;
        goal: PlanGoal;
      };
    },
    { success: boolean; data?: WeeklyPlan; message?: string }
  >({
    name: "plan-api",
    data: {
      action: "generateWeeklyPlan",
      payload: input
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "generate weekly plan failed");
  }

  return result.data;
}

export async function getLatestWeeklyPlan(): Promise<WeeklyPlan | null> {
  const result = await callCloudFunction<
    {
      action: "getLatestWeeklyPlan";
      payload: Record<string, never>;
    },
    { success: boolean; data?: WeeklyPlan | null; message?: string }
  >({
    name: "plan-api",
    data: {
      action: "getLatestWeeklyPlan",
      payload: {}
    }
  });

  if (!result.success) {
    throw new Error(result.message ?? "get latest weekly plan failed");
  }

  return result.data ?? null;
}
