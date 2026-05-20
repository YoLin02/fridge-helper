const cloud = require("wx-server-sdk");

const db = cloud.database();

async function deductInventoryByMeal(payload) {
  const { OPENID } = cloud.getWXContext();
  const { items = [] } = payload || {};

  for (const item of items) {
    const doc = await db.collection("inventory_batches").doc(item.batchId).get();

    if (!doc.data || doc.data.user_id !== OPENID) {
      return {
        success: false,
        message: "batch not found"
      };
    }

    const nextQuantity = Number(doc.data.quantity || 0) - Number(item.consumeQuantity || 0);

    if (nextQuantity <= 0) {
      await db.collection("inventory_batches").doc(item.batchId).update({
        data: {
          quantity: 0,
          status: "consumed",
          updated_at: Date.now()
        }
      });
      continue;
    }

    await db.collection("inventory_batches").doc(item.batchId).update({
      data: {
        quantity: nextQuantity,
        updated_at: Date.now()
      }
    });
  }

  return {
    success: true
  };
}

module.exports = {
  deductInventoryByMeal
};
