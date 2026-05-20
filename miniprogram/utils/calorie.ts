import type { ActivityLevel, GoalType, UserProfile, UserProfileInput } from "../models/calorie";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725
};

function getAge(birthday: string, today = "2026-05-20"): number {
  const birthDate = new Date(`${birthday}T00:00:00+08:00`);
  const todayDate = new Date(`${today}T00:00:00+08:00`);
  let age = todayDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = todayDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 1);
}

function getGoalCalories(goal: GoalType, tdee: number): number {
  if (goal === "fat_loss_light") {
    return tdee - 300;
  }

  if (goal === "fat_loss") {
    return tdee - 500;
  }

  if (goal === "muscle_gain") {
    return tdee + 250;
  }

  return tdee;
}

export function calculateUserTargets(input: UserProfileInput): UserProfile {
  const age = getAge(input.birthday);
  const bmrRaw =
    input.gender === "male"
      ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * age + 5
      : 10 * input.weightKg + 6.25 * input.heightCm - 5 * age - 161;
  const bmr = Math.round(bmrRaw);
  const tdee = Math.round(bmr * ACTIVITY_FACTORS[input.activityLevel]);
  const dailyCalorieTarget = Math.max(1200, Math.round(getGoalCalories(input.goal, tdee)));
  const proteinTargetG = Math.round(input.weightKg * (input.goal === "muscle_gain" ? 1.8 : 1.6));
  const fatTargetG = Math.round((dailyCalorieTarget * 0.25) / 9);
  const carbTargetG = Math.max(
    50,
    Math.round((dailyCalorieTarget - proteinTargetG * 4 - fatTargetG * 9) / 4)
  );

  return {
    ...input,
    bmr,
    tdee,
    dailyCalorieTarget,
    proteinTargetG,
    fatTargetG,
    carbTargetG
  };
}
