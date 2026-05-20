const cloud = require("wx-server-sdk");
const { toMealLog } = require("../services/calorieService");

const db = cloud.database();

async function addMealLog(payload) {
  const { OPENID } = cloud.getWXContext();
  const now = Date.now();
  const draft = payload.draft;
  const selectedInventory = payload.selectedInventory || [];
  const foods = draft.foods.map((food) => {
    const matchedInventory = selectedInventory.find((item) => item.foodName === food.foodName);

    return {
      ...food,
      inventoryBatchId: matchedInventory ? matchedInventory.batchId : food.inventoryBatchId || ""
    };
  });
  const record = {
    user_id: OPENID,
    date: payload.date,
    meal_type: payload.mealType,
    input_type: "ai_text",
    original_text: payload.originalText,
    foods,
    total_calories_kcal: draft.totalCaloriesKcal,
    total_protein_g: draft.totalProteinG,
    total_fat_g: draft.totalFatG,
    total_carb_g: draft.totalCarbG,
    source_task_id: payload.taskId || "",
    created_at: now,
    updated_at: now
  };

  const addResult = await db.collection("calorie_logs").add({
    data: record
  });

  if (payload.taskId) {
    await db
      .collection("ai_parse_tasks")
      .doc(payload.taskId)
      .update({
        data: {
          updated_at: now,
          meal_log_id: addResult._id
        }
      })
      .catch(() => null);
  }

  return {
    success: true,
    data: toMealLog({
      _id: addResult._id,
      ...record
    })
  };
}

module.exports = {
  addMealLog
};
