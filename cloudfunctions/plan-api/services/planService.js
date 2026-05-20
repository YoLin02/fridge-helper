function addDays(baseDate, offset) {
  const date = new Date(`${baseDate}T00:00:00+08:00`);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calcRecipeRecommendation(recipes, inventoryRows, remainingCaloriesKcal, goal) {
  const inventoryNames = new Set(inventoryRows.map((row) => row.food_name));
  const expiringNames = new Set(
    inventoryRows
      .filter((row) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const target = new Date(`${row.expire_date}T00:00:00+08:00`).getTime();
        const diff = Math.round((target - todayStart) / (24 * 60 * 60 * 1000));
        return diff <= 3;
      })
      .map((row) => row.food_name)
  );

  return recipes
    .map((recipe) => {
      const matchedIngredients = (recipe.ingredients || []).filter((item) => inventoryNames.has(item.name)).map((item) => item.name);
      const missingIngredients = (recipe.ingredients || []).filter((item) => !inventoryNames.has(item.name)).map((item) => item.name);
      const hasExpiringMatch = matchedIngredients.some((name) => expiringNames.has(name));
      const calorieFit = (recipe.estimated_calories_kcal || 0) <= remainingCaloriesKcal;
      const quickBonus = goal === "quick" ? Math.max(0, 30 - (recipe.cooking_time || 0)) : 0;
      const clearBonus = goal === "clear_inventory" && hasExpiringMatch ? 30 : 0;
      const score =
        matchedIngredients.length * 18 -
        missingIngredients.length * 10 +
        (hasExpiringMatch ? 35 : 0) +
        (calorieFit ? 15 : 0) +
        quickBonus +
        clearBonus;

      return {
        recipeId: recipe._id,
        recipeName: recipe.recipe_name,
        estimatedCaloriesKcal: recipe.estimated_calories_kcal || 0,
        cookingTime: recipe.cooking_time || 0,
        matchedIngredients,
        missingIngredients,
        reason: hasExpiringMatch
          ? "优先消耗临期库存"
          : calorieFit
            ? "符合热量目标"
            : missingIngredients.length === 0
              ? "库存匹配度高"
              : "制作时间短",
        score
      };
    })
    .sort((left, right) => right.score - left.score);
}

function aggregateShoppingList(days) {
  const map = new Map();

  days.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.missingIngredients.forEach((name) => {
        const current = map.get(name) || { name, quantity: 1, unit: "份", reason: "周计划缺少食材" };
        current.quantity += 1;
        map.set(name, current);
      });
    });
  });

  return Array.from(map.values());
}

function buildPrepSuggestions(days) {
  const allRecipeNames = days.flatMap((day) => day.meals.map((meal) => meal.recipeName));
  const repeated = allRecipeNames.filter((name, index) => allRecipeNames.indexOf(name) !== index);
  const suggestions = [];

  if (repeated.length > 0) {
    suggestions.push(`重复出现的菜谱有 ${Array.from(new Set(repeated)).join("、")}，建议一次备好主食材。`);
  }

  suggestions.push("先清洗和分装未来 2-3 天会高频使用的蔬菜与蛋白质。");
  suggestions.push("需要腌制或焯水的食材可在周初统一处理，缩短工作日晚餐准备时间。");

  return suggestions;
}

function buildExpiringStrategies(inventoryRows) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return inventoryRows
    .map((row) => {
      const target = new Date(`${row.expire_date}T00:00:00+08:00`).getTime();
      const diff = Math.round((target - todayStart) / (24 * 60 * 60 * 1000));
      return {
        foodName: row.food_name,
        diff
      };
    })
    .filter((item) => item.diff <= 3)
    .sort((left, right) => left.diff - right.diff)
    .slice(0, 6)
    .map((item) =>
      item.diff < 0
        ? `${item.foodName} 已过期，建议立即丢弃并避免继续安排到计划中。`
        : item.diff === 0
          ? `${item.foodName} 今日到期，建议安排在今天的午餐或晚餐优先消耗。`
          : `${item.foodName} 还有 ${item.diff} 天到期，优先安排在前两天的菜单中。`
    );
}

function buildWeeklyPlan({ cycleDays, peopleCount, goal, dailyCalorieTarget, recipes, inventoryRows }) {
  const days = [];
  const recommendationPool = calcRecipeRecommendation(recipes, inventoryRows, Math.max(dailyCalorieTarget, 200), goal);

  for (let dayIndex = 0; dayIndex < cycleDays; dayIndex += 1) {
    const date = addDays("2026-05-20", dayIndex);
    const dayMeals = [];
    const remainingForDay = dailyCalorieTarget;

    ["breakfast", "lunch", "dinner"].forEach((mealType, mealIndex) => {
      const recommendation = recommendationPool[(dayIndex * 3 + mealIndex) % Math.max(recommendationPool.length, 1)];

      if (!recommendation) {
        return;
      }

      dayMeals.push({
        mealType,
        recipeId: recommendation.recipeId,
        recipeName: recommendation.recipeName,
        estimatedCaloriesKcal: recommendation.estimatedCaloriesKcal,
        matchedIngredients: recommendation.matchedIngredients,
        missingIngredients: recommendation.missingIngredients,
        reason: recommendation.reason
      });
    });

    days.push({
      date,
      meals: dayMeals,
      totalCaloriesKcal: dayMeals.reduce((sum, meal) => sum + meal.estimatedCaloriesKcal, 0)
    });
  }

  return {
    cycleDays,
    peopleCount,
    goal,
    dailyCalorieTarget,
    days,
    shoppingList: aggregateShoppingList(days),
    prepSuggestions: buildPrepSuggestions(days),
    expiringStrategies: buildExpiringStrategies(inventoryRows)
  };
}

function toPlanRecord({ openid, plan }) {
  const now = Date.now();

  return {
    user_id: openid,
    cycle_days: plan.cycleDays,
    people_count: plan.peopleCount,
    goal: plan.goal,
    daily_calorie_target: plan.dailyCalorieTarget,
    days: plan.days,
    shopping_list: plan.shoppingList,
    prep_suggestions: plan.prepSuggestions,
    expiring_strategies: plan.expiringStrategies,
    created_at: now,
    updated_at: now
  };
}

function toPlanClient(record) {
  return {
    id: record._id,
    cycleDays: record.cycle_days,
    peopleCount: record.people_count,
    goal: record.goal,
    dailyCalorieTarget: record.daily_calorie_target,
    days: record.days || [],
    shoppingList: record.shopping_list || [],
    prepSuggestions: record.prep_suggestions || [],
    expiringStrategies: record.expiring_strategies || [],
    createdAt: String(record.created_at || 0)
  };
}

module.exports = {
  buildWeeklyPlan,
  toPlanClient,
  toPlanRecord
};
