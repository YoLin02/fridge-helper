const cloud = require("wx-server-sdk");
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { applyFoodRules, buildCalorieDraft, buildInventoryDraft, buildRecipeDraft } = require("./services/normalizeService");
const { createTaskResult } = require("./services/taskService");

async function loadFoodRules() {
  const result = await db.collection("food_rules").limit(200).get().catch(() => ({ data: [] }));
  return result.data || [];
}

async function loadFoodNutrition() {
  const result = await db.collection("food_nutrition").limit(500).get().catch(() => ({ data: [] }));
  return result.data || [];
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, payload = {} } = event || {};

  if (action === "parseInventoryInput") {
    try {
      const baseDraft = buildInventoryDraft(payload.text || "", payload.input_type || "text_input");
      const rules = await loadFoodRules();
      const draft = {
        ...baseDraft,
        items: applyFoodRules(baseDraft.items, rules)
      };

      return await createTaskResult({
        openid: OPENID,
        taskType: "inventory_parse",
        inputType: payload.input_type || "text_input",
        inputText: payload.text || "",
        rawAiResult: {
          source: "mock_normalizer",
          payload
        },
        normalizedResult: draft,
        warnings: draft.warnings
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || "parse inventory failed"
      };
    }
  }

  if (action === "parseCalorieInput") {
    try {
      const nutritionRows = await loadFoodNutrition();
      const draft = buildCalorieDraft(payload.text || "", nutritionRows);

      return await createTaskResult({
        openid: OPENID,
        taskType: "calorie_parse",
        inputType: payload.meal_type || "breakfast",
        inputText: payload.text || "",
        rawAiResult: {
          source: "mock_calorie_parser",
          payload
        },
        normalizedResult: draft,
        warnings: draft.warnings
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || "parse calorie failed"
      };
    }
  }

  if (action === "parseRecipeInput") {
    try {
      const nutritionRows = await loadFoodNutrition();
      const draft = buildRecipeDraft(payload.text || "", nutritionRows);

      return await createTaskResult({
        openid: OPENID,
        taskType: "recipe_parse",
        inputType: "recipe_text",
        inputText: payload.text || "",
        rawAiResult: {
          source: "mock_recipe_parser",
          payload
        },
        normalizedResult: draft,
        warnings: draft.warnings
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || "parse recipe failed"
      };
    }
  }

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
