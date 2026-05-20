const cloud = require("wx-server-sdk");
const { toBatchRecord, toClientBatch } = require("../services/inventoryService");

const db = cloud.database();

function validateItem(item) {
  return Boolean(
    item &&
      typeof item.foodName === "string" &&
      item.foodName.trim() &&
      typeof item.quantity === "number" &&
      item.quantity > 0 &&
      typeof item.unit === "string" &&
      typeof item.expireDate === "string"
  );
}

async function createBatches(payload) {
  const { OPENID } = cloud.getWXContext();
  const { items = [], sourceType = "text_input", sourceTaskId = "" } = payload || {};

  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      message: "items is required"
    };
  }

  const invalidItem = items.find((item) => !validateItem(item));

  if (invalidItem) {
    return {
      success: false,
      message: "inventory item validation failed"
    };
  }

  const created = [];

  for (const item of items) {
    const record = toBatchRecord({
      item,
      openid: OPENID,
      sourceType,
      sourceTaskId
    });

    const addResult = await db.collection("inventory_batches").add({
      data: record
    });

    created.push(
      toClientBatch({
        _id: addResult._id,
        ...record
      })
    );
  }

  if (sourceTaskId) {
    await db
      .collection("ai_parse_tasks")
      .doc(sourceTaskId)
      .update({
        data: {
          updated_at: Date.now(),
          confirmed_batch_count: created.length
        }
      })
      .catch(() => null);
  }

  return {
    success: true,
    data: {
      created,
      persisted: true
    },
    message: "库存批次已写入数据库"
  };
}

module.exports = {
  createBatches
};
