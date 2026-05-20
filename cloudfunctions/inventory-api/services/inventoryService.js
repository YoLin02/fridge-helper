function toBatchRecord({ item, openid, sourceType, sourceTaskId }) {
  const now = Date.now();
  const purchaseDate = item.purchaseDate;
  const expireDate = item.expireDate;

  return {
    user_id: openid,
    food_name: item.foodName,
    original_name: item.originalName,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    storage_location: item.storageLocation,
    purchase_date: purchaseDate,
    expire_date: expireDate,
    expire_days: getExpireDays(purchaseDate, expireDate),
    expire_source: item.expireSource,
    source_type: sourceType,
    source_task_id: sourceTaskId || "",
    ai_confidence: item.confidence,
    status: "normal",
    note: item.note || "",
    created_at: now,
    updated_at: now
  };
}

function toClientBatch(record) {
  return {
    id: record._id,
    userId: record.user_id,
    foodName: record.food_name,
    originalName: record.original_name,
    category: record.category,
    quantity: record.quantity,
    unit: record.unit,
    storageLocation: record.storage_location,
    purchaseDate: record.purchase_date,
    expireDate: record.expire_date,
    expireSource: record.expire_source,
    sourceType: record.source_type,
    status: record.status,
    createdAt: String(record.created_at),
    updatedAt: String(record.updated_at),
    confidence: record.ai_confidence,
    note: record.note || ""
  };
}

function getExpireDays(purchaseDate, expireDate) {
  const purchase = new Date(`${purchaseDate}T00:00:00+08:00`).getTime();
  const expire = new Date(`${expireDate}T00:00:00+08:00`).getTime();

  return Math.max(0, Math.round((expire - purchase) / (24 * 60 * 60 * 1000)));
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getExpireStatus(expireDate, todayDate = getTodayDate()) {
  const today = new Date(`${todayDate}T00:00:00+08:00`).getTime();
  const target = new Date(`${expireDate}T00:00:00+08:00`).getTime();
  const diff = Math.round((target - today) / (24 * 60 * 60 * 1000));

  if (diff < 0) {
    return "expired";
  }

  if (diff <= 3) {
    return "expiring";
  }

  return "normal";
}

function getRemainingDaysText(expireDate) {
  const today = new Date(`${getTodayDate()}T00:00:00+08:00`).getTime();
  const target = new Date(`${expireDate}T00:00:00+08:00`).getTime();
  const diff = Math.round((target - today) / (24 * 60 * 60 * 1000));

  if (diff < 0) {
    return `已过期 ${Math.abs(diff)} 天`;
  }

  if (diff === 0) {
    return "今日到期";
  }

  return `还有 ${diff} 天`;
}

function groupInventory(records) {
  const groups = new Map();

  records.forEach((record) => {
    const key = record.food_name;
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        foodName: record.food_name,
        category: record.category,
        totalQuantity: record.quantity,
        unit: record.unit,
        storageLocation: record.storage_location,
        nearestExpireDate: record.expire_date,
        batchCount: 1
      });
      return;
    }

    current.totalQuantity += record.quantity;
    current.batchCount += 1;

    if (record.expire_date < current.nearestExpireDate) {
      current.nearestExpireDate = record.expire_date;
    }
  });

  return Array.from(groups.values()).sort((left, right) => left.nearestExpireDate.localeCompare(right.nearestExpireDate));
}

function filterInventoryItems(items, filter) {
  if (filter === "临期") {
    return items.filter((item) => {
      const state = getExpireStatus(item.nearestExpireDate);
      return state === "expiring";
    });
  }

  if (filter === "已过期") {
    return items.filter((item) => {
      const state = getExpireStatus(item.nearestExpireDate);
      return state === "expired";
    });
  }

  return items;
}

function buildStats(records) {
  const itemNames = new Set();
  const categories = new Set();
  let expiringItems = 0;
  let expiredItems = 0;

  records.forEach((record) => {
    itemNames.add(record.food_name);
    categories.add(record.category);

    const state = getExpireStatus(record.expire_date);

    if (state === "expiring") {
      expiringItems += 1;
    }

    if (state === "expired") {
      expiredItems += 1;
    }
  });

  return {
    totalItems: itemNames.size,
    expiringItems,
    expiredItems,
    categories: categories.size
  };
}

function toBatchOption(record) {
  return {
    batchId: record._id,
    foodName: record.food_name,
    quantity: record.quantity,
    unit: record.unit,
    storageLocation: record.storage_location,
    expireDate: record.expire_date
  };
}

function fallbackCalories(foodName) {
  const map = {
    鸡蛋: 143,
    纯牛奶: 54,
    米饭: 116,
    鸡胸肉: 133,
    酸奶: 72,
    吐司面包: 266,
    番茄: 18
  };

  return map[foodName] || 100;
}

function buildRecommendationItems(records, nutritionRows, remainingCaloriesKcal) {
  const nutritionMap = new Map();

  nutritionRows.forEach((row) => {
    nutritionMap.set(row.food_name, row);
    (row.aliases || []).forEach((alias) => nutritionMap.set(alias, row));
  });

  const grouped = groupInventory(records);
  const expiringItems = grouped
    .filter((item) => {
      const state = getExpireStatus(item.nearestExpireDate);
      return state === "expiring" || state === "expired";
    })
    .slice(0, 5)
    .map((item) => ({
      foodName: item.foodName,
      quantityText: `${item.totalQuantity} ${item.unit}`,
      expireDate: item.nearestExpireDate,
      remainingDaysText: getRemainingDaysText(item.nearestExpireDate),
      reason: "优先清理临期库存"
    }));

  const calorieFriendlyItems = grouped
    .map((item) => {
      const nutrition = nutritionMap.get(item.foodName);
      const estimatedCaloriesKcal = nutrition ? nutrition.calories_kcal || 0 : fallbackCalories(item.foodName);

      return {
        foodName: item.foodName,
        quantityText: `${item.totalQuantity} ${item.unit}`,
        expireDate: item.nearestExpireDate,
        remainingDaysText: getRemainingDaysText(item.nearestExpireDate),
        estimatedCaloriesKcal,
        reason: estimatedCaloriesKcal <= remainingCaloriesKcal ? "符合当前剩余热量" : "建议控制分量"
      };
    })
    .filter((item) => item.estimatedCaloriesKcal <= Math.max(remainingCaloriesKcal, 300))
    .slice(0, 5);

  return {
    expiringItems,
    calorieFriendlyItems
  };
}

module.exports = {
  buildStats,
  buildRecommendationItems,
  filterInventoryItems,
  groupInventory,
  getRemainingDaysText,
  toBatchRecord,
  toBatchOption,
  toClientBatch
};
