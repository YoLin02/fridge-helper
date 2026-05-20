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
    note: record.note || ""
  };
}

function getExpireDays(purchaseDate, expireDate) {
  const purchase = new Date(`${purchaseDate}T00:00:00+08:00`).getTime();
  const expire = new Date(`${expireDate}T00:00:00+08:00`).getTime();

  return Math.max(0, Math.round((expire - purchase) / (24 * 60 * 60 * 1000)));
}

function getExpireStatus(expireDate) {
  const today = new Date("2026-05-20T00:00:00+08:00").getTime();
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

module.exports = {
  buildStats,
  filterInventoryItems,
  groupInventory,
  toBatchRecord,
  toClientBatch
};
