const cloud = require("wx-server-sdk");
const { buildRecipeRecommendations } = require("../services/recipeService");

const db = cloud.database();

async function recommendRecipes(payload) {
  const { OPENID } = cloud.getWXContext();
  const recipesResult = await db.collection("recipes").where({
    user_id: OPENID
  }).limit(100).get();
  const inventoryResult = await db.collection("inventory_batches").where({
    user_id: OPENID,
    status: "normal"
  }).limit(200).get();

  return {
    success: true,
    data: {
      items: buildRecipeRecommendations(
        recipesResult.data,
        inventoryResult.data,
        payload.remainingCaloriesKcal
      )
    }
  };
}

module.exports = {
  recommendRecipes
};
