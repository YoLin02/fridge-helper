function toRecipeRecord({ openid, taskId, draft }) {
  const now = Date.now();

  return {
    user_id: openid,
    recipe_name: draft.recipeName,
    description: draft.description,
    tags: draft.tags,
    cooking_time: draft.cookingTime,
    difficulty: draft.difficulty,
    ingredients: draft.ingredients,
    steps: draft.steps,
    estimated_calories_kcal: draft.estimatedCaloriesKcal,
    source_task_id: taskId || "",
    created_at: now,
    updated_at: now
  };
}

function toRecipeClient(record) {
  return {
    id: record._id,
    recipeName: record.recipe_name,
    description: record.description || "",
    tags: record.tags || [],
    cookingTime: record.cooking_time || 0,
    difficulty: record.difficulty || "easy",
    ingredients: record.ingredients || [],
    steps: record.steps || [],
    estimatedCaloriesKcal: record.estimated_calories_kcal || 0,
    createdAt: String(record.created_at || 0)
  };
}

function buildRecipeRecommendations(recipes, inventoryRows, remainingCaloriesKcal) {
  const inventoryNames = new Set(inventoryRows.map((row) => row.food_name));
  const expiringNames = new Set(
    inventoryRows
      .filter((row) => {
        const today = new Date();
        const target = new Date(`${row.expire_date}T00:00:00+08:00`);
        const diff = Math.round((target.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / (24 * 60 * 60 * 1000));
        return diff <= 3;
      })
      .map((row) => row.food_name)
  );

  return recipes
    .map((recipe) => {
      const matchedIngredients = recipe.ingredients.filter((item) => inventoryNames.has(item.name)).map((item) => item.name);
      const missingIngredients = recipe.ingredients.filter((item) => !inventoryNames.has(item.name)).map((item) => item.name);
      const hasExpiringMatch = matchedIngredients.some((name) => expiringNames.has(name));
      const calorieFit = recipe.estimated_calories_kcal <= (remainingCaloriesKcal || Number.MAX_SAFE_INTEGER);
      const reason = hasExpiringMatch
        ? "能优先消耗临期食材"
        : calorieFit
          ? "符合当前剩余热量"
          : missingIngredients.length === 0
            ? "库存匹配度高"
            : "制作时间短";
      const score =
        (hasExpiringMatch ? 100 : 0) +
        matchedIngredients.length * 20 -
        missingIngredients.length * 15 +
        (calorieFit ? 15 : 0) -
        recipe.cooking_time;

      return {
        recipeId: recipe._id,
        recipeName: recipe.recipe_name,
        estimatedCaloriesKcal: recipe.estimated_calories_kcal || 0,
        cookingTime: recipe.cooking_time || 0,
        matchedIngredients,
        missingIngredients,
        reason,
        score
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
    .map(({ score, ...item }) => item);
}

module.exports = {
  buildRecipeRecommendations,
  toRecipeClient,
  toRecipeRecord
};
