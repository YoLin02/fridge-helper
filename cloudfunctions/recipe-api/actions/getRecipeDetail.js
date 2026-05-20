const cloud = require("wx-server-sdk");
const { toRecipeClient } = require("../services/recipeService");

const db = cloud.database();

async function getRecipeDetail(payload) {
  const { OPENID } = cloud.getWXContext();
  const result = await db.collection("recipes").doc(payload.recipeId).get();

  if (!result.data || result.data.user_id !== OPENID) {
    return {
      success: false,
      message: "recipe not found"
    };
  }

  return {
    success: true,
    data: toRecipeClient(result.data)
  };
}

module.exports = {
  getRecipeDetail
};
