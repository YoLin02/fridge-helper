const cloud = require("wx-server-sdk");
const { filterInventoryItems, groupInventory } = require("../services/inventoryService");

const db = cloud.database();

async function listInventory(payload) {
  const { OPENID } = cloud.getWXContext();
  const { filter = "全部" } = payload || {};
  const result = await db
    .collection("inventory_batches")
    .where({
      user_id: OPENID,
      status: "normal"
    })
    .orderBy("expire_date", "asc")
    .limit(200)
    .get();

  const groupedItems = groupInventory(result.data);
  const items = filterInventoryItems(groupedItems, filter);

  return {
    success: true,
    data: {
      items
    }
  };
}

module.exports = {
  listInventory
};
