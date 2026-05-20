const cloud = require("wx-server-sdk");
const { toClientBatch } = require("../services/inventoryService");

const db = cloud.database();

async function getInventoryDetail(payload) {
  const { OPENID } = cloud.getWXContext();
  const { foodName = "" } = payload || {};
  const result = await db
    .collection("inventory_batches")
    .where({
      user_id: OPENID,
      food_name: foodName,
      status: "normal"
    })
    .orderBy("expire_date", "asc")
    .limit(100)
    .get();

  if (result.data.length === 0) {
    return {
      success: false,
      message: "inventory detail not found"
    };
  }

  const first = result.data[0];
  const batches = result.data.map((record) => toClientBatch(record));
  const totalQuantity = result.data.reduce((sum, record) => sum + Number(record.quantity || 0), 0);

  return {
    success: true,
    data: {
      foodName: first.food_name,
      category: first.category,
      totalQuantity,
      unit: first.unit,
      storageLocation: first.storage_location,
      batches
    }
  };
}

module.exports = {
  getInventoryDetail
};
