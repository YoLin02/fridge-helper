const cloud = require("wx-server-sdk");
const { buildRecommendationItems } = require("../services/inventoryService");

const db = cloud.database();

async function getFoodRecommendations(payload) {
  const { OPENID } = cloud.getWXContext();
  const { remainingCaloriesKcal = 0 } = payload || {};
  const inventoryResult = await db
    .collection("inventory_batches")
    .where({
      user_id: OPENID,
      status: "normal"
    })
    .orderBy("expire_date", "asc")
    .limit(200)
    .get();
  const nutritionResult = await db
    .collection("food_nutrition")
    .limit(500)
    .get()
    .catch(() => ({ data: [] }));

  return {
    success: true,
    data: buildRecommendationItems(inventoryResult.data, nutritionResult.data || [], remainingCaloriesKcal)
  };
}

module.exports = {
  getFoodRecommendations
};
