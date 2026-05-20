const cloud = require("wx-server-sdk");
const { toRecipeClient, toRecipeRecord } = require("../services/recipeService");

const db = cloud.database();

async function createRecipe(payload) {
  const { OPENID } = cloud.getWXContext();
  const record = toRecipeRecord({
    openid: OPENID,
    taskId: payload.taskId,
    draft: payload.draft
  });
  const addResult = await db.collection("recipes").add({
    data: record
  });

  if (payload.taskId) {
    await db.collection("ai_parse_tasks").doc(payload.taskId).update({
      data: {
        updated_at: Date.now(),
        recipe_id: addResult._id
      }
    }).catch(() => null);
  }

  return {
    success: true,
    data: toRecipeClient({
      _id: addResult._id,
      ...record
    })
  };
}

module.exports = {
  createRecipe
};
