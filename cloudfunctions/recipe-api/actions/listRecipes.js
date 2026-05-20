const cloud = require("wx-server-sdk");
const { toRecipeClient } = require("../services/recipeService");

const db = cloud.database();

async function listRecipes() {
  const { OPENID } = cloud.getWXContext();
  const result = await db.collection("recipes").where({
    user_id: OPENID
  }).orderBy("created_at", "desc").limit(100).get();

  return {
    success: true,
    data: {
      items: result.data.map((record) => toRecipeClient(record))
    }
  };
}

module.exports = {
  listRecipes
};
