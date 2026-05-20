const cloud = require("wx-server-sdk");
const { toBatchOption } = require("../services/inventoryService");

const db = cloud.database();

async function listInventoryBatchOptions() {
  const { OPENID } = cloud.getWXContext();
  const result = await db
    .collection("inventory_batches")
    .where({
      user_id: OPENID,
      status: "normal"
    })
    .orderBy("expire_date", "asc")
    .limit(100)
    .get();

  return {
    success: true,
    data: {
      items: result.data.map((record) => toBatchOption(record))
    }
  };
}

module.exports = {
  listInventoryBatchOptions
};
