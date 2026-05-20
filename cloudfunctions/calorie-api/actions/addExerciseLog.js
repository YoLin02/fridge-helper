const cloud = require("wx-server-sdk");
const { toExerciseLog } = require("../services/calorieService");

const db = cloud.database();

async function addExerciseLog(payload) {
  const { OPENID } = cloud.getWXContext();
  const now = Date.now();
  const record = {
    user_id: OPENID,
    date: payload.date,
    meal_type: "exercise",
    input_type: "manual",
    original_text: payload.exerciseName,
    foods: [],
    total_calories_kcal: 0,
    total_protein_g: 0,
    total_fat_g: 0,
    total_carb_g: 0,
    exercise_name: payload.exerciseName,
    exercise_calories_kcal: payload.caloriesKcal,
    duration_minutes: payload.durationMinutes,
    created_at: now,
    updated_at: now
  };

  const addResult = await db.collection("calorie_logs").add({
    data: record
  });

  return {
    success: true,
    data: toExerciseLog({
      _id: addResult._id,
      ...record
    })
  };
}

module.exports = {
  addExerciseLog
};
