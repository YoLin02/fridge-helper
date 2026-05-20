function getAge(birthday, today = "2026-05-20") {
  const birthDate = new Date(`${birthday}T00:00:00+08:00`);
  const todayDate = new Date(`${today}T00:00:00+08:00`);
  let age = todayDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = todayDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 1);
}

function getActivityFactor(activityLevel) {
  const map = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725
  };

  return map[activityLevel] || 1.2;
}

function calculateTargets(input) {
  const age = getAge(input.birthday);
  const bmrRaw =
    input.gender === "male"
      ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * age + 5
      : 10 * input.weightKg + 6.25 * input.heightCm - 5 * age - 161;
  const bmr = Math.round(bmrRaw);
  const tdee = Math.round(bmr * getActivityFactor(input.activityLevel));
  let dailyCalorieTarget = tdee;

  if (input.goal === "fat_loss_light") {
    dailyCalorieTarget = tdee - 300;
  } else if (input.goal === "fat_loss") {
    dailyCalorieTarget = tdee - 500;
  } else if (input.goal === "muscle_gain") {
    dailyCalorieTarget = tdee + 250;
  }

  dailyCalorieTarget = Math.max(1200, Math.round(dailyCalorieTarget));
  const proteinTargetG = Math.round(input.weightKg * (input.goal === "muscle_gain" ? 1.8 : 1.6));
  const fatTargetG = Math.round((dailyCalorieTarget * 0.25) / 9);
  const carbTargetG = Math.max(50, Math.round((dailyCalorieTarget - proteinTargetG * 4 - fatTargetG * 9) / 4));

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

function toMealLog(record) {
  return {
    id: record._id,
    date: record.date,
    mealType: record.meal_type,
    inputType: record.input_type,
    originalText: record.original_text,
    foods: record.foods || [],
    totalCaloriesKcal: record.total_calories_kcal || 0,
    totalProteinG: record.total_protein_g || 0,
    totalFatG: record.total_fat_g || 0,
    totalCarbG: record.total_carb_g || 0,
    createdAt: String(record.created_at)
  };
}

function toExerciseLog(record) {
  return {
    id: record._id,
    date: record.date,
    exerciseName: record.exercise_name,
    caloriesKcal: record.exercise_calories_kcal || 0,
    durationMinutes: record.duration_minutes || 0,
    createdAt: String(record.created_at)
  };
}

module.exports = {
  calculateTargets,
  toExerciseLog,
  toMealLog
};
