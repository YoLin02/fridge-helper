function getDateOffset(days) {
  const base = new Date("2026-05-20T00:00:00+08:00");
  base.setDate(base.getDate() + days);
  const year = base.getFullYear();
  const month = `${base.getMonth() + 1}`.padStart(2, "0");
  const day = `${base.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function pickCategory(name) {
  if (/蛋|奶/.test(name)) {
    return "蛋奶类";
  }

  if (/鸡|牛|猪|肉/.test(name)) {
    return "肉类";
  }

  if (/番茄|青菜|菜|西红柿/.test(name)) {
    return "蔬菜类";
  }

  return "其他";
}

function pickStorage(name) {
  if (/青菜|番茄|牛奶|鸡蛋|鸡胸/.test(name)) {
    return "cold";
  }

  return "room";
}

function defaultExpireDate(name) {
  if (/牛奶/.test(name)) {
    return getDateOffset(6);
  }

  if (/鸡胸|肉/.test(name)) {
    return getDateOffset(2);
  }

  if (/番茄|西红柿/.test(name)) {
    return getDateOffset(3);
  }

  return getDateOffset(30);
}

function parseQuantityUnit(raw) {
  const unitMatch = raw.match(/(\d+)\s*(个|盒|克|g|斤|板)/i);

  if (!unitMatch) {
    return {
      quantity: 1,
      unit: "份"
    };
  }

  return {
    quantity: Number(unitMatch[1]),
    unit: unitMatch[2]
  };
}

function splitText(text) {
  return text
    .split(/[，,。；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeName(raw) {
  if (/鸡蛋/.test(raw)) {
    return "鸡蛋";
  }

  if (/牛奶/.test(raw)) {
    return "纯牛奶";
  }

  if (/鸡胸/.test(raw)) {
    return "鸡胸肉";
  }

  if (/番茄|西红柿/.test(raw)) {
    return "番茄";
  }

  return raw.replace(/今天买了|买了/g, "").trim();
}

function buildInventoryDraft(text, inputType) {
  const items = splitText(text).map((raw, index) => {
    const foodName = normalizeName(raw);
    const quantityUnit = parseQuantityUnit(raw);

    return {
      id: `draft-${index + 1}`,
      foodName,
      originalName: raw,
      category: pickCategory(foodName),
      quantity: quantityUnit.quantity,
      unit: quantityUnit.unit,
      storageLocation: pickStorage(foodName),
      purchaseDate: "2026-05-20",
      expireDate: defaultExpireDate(foodName),
      expireSource: inputType === "receipt" ? "ai_inferred" : "default_rule",
      confidence: inputType === "receipt" ? 0.86 : 0.92,
      note: "云函数已返回结构化草稿，仍需人工确认"
    };
  });

  return {
    items: items.length > 0 ? items : [],
    warnings: ["AI 只生成草稿，确认后才允许写入库存。"]
  };
}

function applyFoodRules(items, rules = []) {
  const ruleMap = new Map();

  rules.forEach((rule) => {
    const names = [rule.food_name, ...(rule.aliases || [])].filter(Boolean);
    names.forEach((name) => {
      ruleMap.set(name, rule);
    });
  });

  return items.map((item) => {
    const rule = ruleMap.get(item.foodName) || ruleMap.get(item.originalName);

    if (!rule) {
      return item;
    }

    const storageLocation = rule.default_storage_location || item.storageLocation;
    const shelfLife = rule.shelf_life && rule.shelf_life[storageLocation];

    return {
      ...item,
      category: rule.category || item.category,
      unit: item.unit === "份" ? rule.default_unit || item.unit : item.unit,
      storageLocation,
      expireDate: typeof shelfLife === "number" ? getDateOffset(shelfLife) : item.expireDate,
      expireSource: typeof shelfLife === "number" ? "default_rule" : item.expireSource
    };
  });
}

function normalizeCalorieName(raw) {
  if (/鸡蛋/.test(raw)) {
    return "鸡蛋";
  }

  if (/牛奶/.test(raw)) {
    return "纯牛奶";
  }

  if (/米饭/.test(raw)) {
    return "米饭";
  }

  if (/鸡胸/.test(raw)) {
    return "鸡胸肉";
  }

  if (/酸奶/.test(raw)) {
    return "酸奶";
  }

  if (/面包/.test(raw)) {
    return "吐司面包";
  }

  if (/番茄/.test(raw)) {
    return "番茄";
  }

  return raw.trim();
}

function fallbackNutrition(foodName) {
  const map = {
    鸡蛋: { calories_kcal: 143, protein_g: 12.6, fat_g: 9.5, carb_g: 1.1, base_amount: 100 },
    纯牛奶: { calories_kcal: 54, protein_g: 3.4, fat_g: 3.2, carb_g: 5.0, base_amount: 100 },
    米饭: { calories_kcal: 116, protein_g: 2.6, fat_g: 0.3, carb_g: 25.9, base_amount: 100 },
    鸡胸肉: { calories_kcal: 133, protein_g: 19.4, fat_g: 5.0, carb_g: 0, base_amount: 100 },
    酸奶: { calories_kcal: 72, protein_g: 2.5, fat_g: 3.0, carb_g: 9.3, base_amount: 100 },
    吐司面包: { calories_kcal: 266, protein_g: 8.5, fat_g: 3.2, carb_g: 49.0, base_amount: 100 },
    番茄: { calories_kcal: 18, protein_g: 0.9, fat_g: 0.2, carb_g: 3.9, base_amount: 100 }
  };

  return map[foodName] || { calories_kcal: 100, protein_g: 5, fat_g: 3, carb_g: 12, base_amount: 100 };
}

function parseWeight(raw) {
  const gramMatch = raw.match(/(\d+)\s*(克|g)/i);

  if (gramMatch) {
    return Number(gramMatch[1]);
  }

  const pieceMatch = raw.match(/(\d+)\s*(个|盒|片|杯|份)/);

  if (pieceMatch) {
    const count = Number(pieceMatch[1]);
    const unit = pieceMatch[2];
    const factorMap = {
      个: 50,
      盒: 250,
      片: 30,
      杯: 250,
      份: 150
    };

    return count * (factorMap[unit] || 100);
  }

  return 100;
}

function splitMealText(text) {
  return text
    .split(/[，,。；;+]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildCalorieDraft(text, nutritionRows = []) {
  const nutritionMap = new Map();

  nutritionRows.forEach((row) => {
    const names = [row.food_name, ...(row.aliases || [])].filter(Boolean);
    names.forEach((name) => nutritionMap.set(name, row));
  });

  const foods = splitMealText(text).map((raw) => {
    const foodName = normalizeCalorieName(raw);
    const weight = parseWeight(raw);
    const nutrition = nutritionMap.get(foodName) || fallbackNutrition(foodName);
    const baseAmount = nutrition.base_amount || 100;
    const ratio = weight / baseAmount;

    return {
      foodName,
      quantity: weight,
      unit: "g",
      estimatedWeightG: weight,
      caloriesKcal: Math.round((nutrition.calories_kcal || 0) * ratio),
      proteinG: Number(((nutrition.protein_g || 0) * ratio).toFixed(1)),
      fatG: Number(((nutrition.fat_g || 0) * ratio).toFixed(1)),
      carbG: Number(((nutrition.carb_g || 0) * ratio).toFixed(1)),
      confidence: nutritionMap.get(foodName) ? 0.92 : 0.75
    };
  });

  return {
    foods,
    totalCaloriesKcal: foods.reduce((sum, item) => sum + item.caloriesKcal, 0),
    totalProteinG: Number(foods.reduce((sum, item) => sum + item.proteinG, 0).toFixed(1)),
    totalFatG: Number(foods.reduce((sum, item) => sum + item.fatG, 0).toFixed(1)),
    totalCarbG: Number(foods.reduce((sum, item) => sum + item.carbG, 0).toFixed(1)),
    warnings: ["AI 仅负责识别食物内容，热量结果由营养库匹配计算。"]
  };
}

function parseRecipeName(text) {
  const firstLine = text.split(/\n/).map((item) => item.trim()).find(Boolean);

  if (!firstLine) {
    return "未命名菜谱";
  }

  if (firstLine.length <= 12) {
    return firstLine;
  }

  if (/番茄炒蛋/.test(text)) {
    return "番茄炒蛋";
  }

  if (/鸡胸/.test(text) && /西兰花/.test(text)) {
    return "西兰花鸡胸肉";
  }

  return firstLine.slice(0, 12);
}

function parseRecipeIngredients(text) {
  const result = [];
  const ingredientPatterns = [
    { name: "番茄", regex: /番茄|西红柿/, defaultQuantity: 2, unit: "个" },
    { name: "鸡蛋", regex: /鸡蛋/, defaultQuantity: 3, unit: "个" },
    { name: "鸡胸肉", regex: /鸡胸/, defaultQuantity: 200, unit: "g" },
    { name: "西兰花", regex: /西兰花/, defaultQuantity: 150, unit: "g" },
    { name: "米饭", regex: /米饭/, defaultQuantity: 150, unit: "g" },
    { name: "纯牛奶", regex: /牛奶/, defaultQuantity: 250, unit: "g" }
  ];

  ingredientPatterns.forEach((pattern) => {
    if (!pattern.regex.test(text)) {
      return;
    }

    const match = text.match(new RegExp(`${pattern.name}|${pattern.regex.source}[^\\d]*(\\d+)\\s*(个|克|g|盒)?`, "i"));
    const quantity = match && match[1] ? Number(match[1]) : pattern.defaultQuantity;
    const unit = match && match[2] ? match[2] : pattern.unit;

    result.push({
      name: pattern.name,
      quantity,
      unit,
      required: true
    });
  });

  return result.length > 0
    ? result
    : [
        { name: "主食材", quantity: 1, unit: "份", required: true },
        { name: "基础调味", quantity: 1, unit: "份", required: true }
      ];
}

function estimateRecipeCalories(ingredients, nutritionRows = []) {
  const nutritionMap = new Map();
  nutritionRows.forEach((row) => {
    nutritionMap.set(row.food_name, row);
  });

  return ingredients.reduce((sum, ingredient) => {
    const nutrition = nutritionMap.get(ingredient.name) || fallbackNutrition(ingredient.name);
    const baseAmount = nutrition.base_amount || 100;
    const weight = ingredient.unit === "个" ? ingredient.quantity * 50 : ingredient.quantity;
    return sum + Math.round((nutrition.calories_kcal || 0) * (weight / baseAmount));
  }, 0);
}

function buildRecipeDraft(text, nutritionRows = []) {
  const recipeName = parseRecipeName(text);
  const ingredients = parseRecipeIngredients(text);
  const estimatedCaloriesKcal = estimateRecipeCalories(ingredients, nutritionRows);
  const steps = text
    .split(/\n|。/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 4)
    .slice(0, 6);

  return {
    recipeName,
    description: "AI 解析生成的菜谱草稿",
    tags: ingredients.length <= 3 ? ["快手菜"] : ["家常菜"],
    cookingTime: ingredients.length <= 3 ? 15 : 25,
    difficulty: ingredients.length <= 3 ? "easy" : "medium",
    ingredients,
    steps:
      steps.length > 0
        ? steps
        : ["准备食材", "处理主要食材", "加热烹饪", "调味装盘"],
    estimatedCaloriesKcal,
    warnings: ["AI 只生成菜谱草稿，保存前请确认食材与步骤。"]
  };
}

module.exports = {
  applyFoodRules,
  buildCalorieDraft,
  buildInventoryDraft,
  buildRecipeDraft
};
