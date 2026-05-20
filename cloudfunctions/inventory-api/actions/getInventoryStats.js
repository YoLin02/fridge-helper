const cloud = require("wx-server-sdk");
const { buildStats } = require("../services/inventoryService");

const db = cloud.database();

async function getInventoryStats() {
  const { OPENID } = cloud.getWXContext();
  const result = await db
    .collection("inventory_batches")
    .where({
      user_id: OPENID,
      status: "normal"
    })
    .limit(200)
    .get();

  return {
    success: true,
    data: buildStats(result.data)
  };
}

module.exports = {
  getInventoryStats
};
