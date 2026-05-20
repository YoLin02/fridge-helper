const cloud = require("wx-server-sdk");
const { calculateTargets, toExerciseLog, toMealLog } = require("../services/calorieService");

const db = cloud.database();

function emptyMeals() {
  return {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  };
}

function toProfile(record) {
  if (!record) {
    return undefined;
  }

  return {
    gender: record.gender,
    birthday: record.birthday,
    heightCm: record.height_cm,
    weightKg: record.weight_kg,
    targetWeightKg: record.target_weight_kg,
    goal: record.goal,
    activityLevel: record.activity_level,
    bmr: record.bmr,
    tdee: record.tdee,
    dailyCalorieTarget: record.daily_calorie_target,
    proteinTargetG: record.protein_target_g,
    fatTargetG: record.fat_target_g,
    carbTargetG: record.carb_target_g
  };
}

async function getDailySummary(payload) {
  const { OPENID } = cloud.getWXContext();
  const date = payload.date;
  const meals = emptyMeals();
  const profileResult = await db
    .collection("user_profiles")
    .where({
      user_id: OPENID
    })
    .limit(1)
    .get()
    .catch(() => ({ data: [] }));
  const profile = toProfile(profileResult.data[0]);

  const logResult = await db
    .collection("calorie_logs")
    .where({
      user_id: OPENID,
      date
    })
    .orderBy("created_at", "asc")
    .limit(200)
    .get()
    .catch(() => ({ data: [] }));

  let consumedCaloriesKcal = 0;
  let exerciseCaloriesKcal = 0;
  let carbCurrent = 0;
  let proteinCurrent = 0;
  let fatCurrent = 0;
  const exercises = [];

  logResult.data.forEach((record) => {
    if (record.meal_type === "exercise") {
      exerciseCaloriesKcal += record.exercise_calories_kcal || 0;
      exercises.push(toExerciseLog(record));
      return;
    }

    const mealLog = toMealLog(record);
    meals[record.meal_type] = [...(meals[record.meal_type] || []), mealLog];
    consumedCaloriesKcal += mealLog.totalCaloriesKcal;
    carbCurrent += mealLog.totalCarbG;
    proteinCurrent += mealLog.totalProteinG;
    fatCurrent += mealLog.totalFatG;
  });

  const recommendedCaloriesKcal = profile?.dailyCalorieTarget ?? 2200;
  const remainingCaloriesKcal = recommendedCaloriesKcal - consumedCaloriesKcal + exerciseCaloriesKcal;

  return {
    success: true,
    data: {
      date,
      profile,
      remainingCaloriesKcal,
      consumedCaloriesKcal,
      exerciseCaloriesKcal,
      recommendedCaloriesKcal,
      carb: {
        current: Number(carbCurrent.toFixed(1)),
        target: profile?.carbTargetG ?? 280
      },
      protein: {
        current: Number(proteinCurrent.toFixed(1)),
        target: profile?.proteinTargetG ?? 120
      },
      fat: {
        current: Number(fatCurrent.toFixed(1)),
        target: profile?.fatTargetG ?? 60
      },
      meals,
      exercises
    }
  };
}

module.exports = {
  getDailySummary
};
