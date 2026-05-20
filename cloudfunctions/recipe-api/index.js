const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { createRecipe } = require("./actions/createRecipe");
const { listRecipes } = require("./actions/listRecipes");
const { getRecipeDetail } = require("./actions/getRecipeDetail");
const { recommendRecipes } = require("./actions/recommendRecipes");

exports.main = async (event) => {
  const { action, payload = {} } = event || {};

  if (action === "createRecipe") {
    return createRecipe(payload);
  }

  if (action === "listRecipes") {
    return listRecipes(payload);
  }

  if (action === "getRecipeDetail") {
    return getRecipeDetail(payload);
  }

  if (action === "recommendRecipes") {
    return recommendRecipes(payload);
  }

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
