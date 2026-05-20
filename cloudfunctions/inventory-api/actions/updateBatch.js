const cloud = require("wx-server-sdk");

const db = cloud.database();

async function updateBatch(payload) {
  const { OPENID } = cloud.getWXContext();
  const { batchId, quantity } = payload || {};

  const batch = await db.collection("inventory_batches").doc(batchId).get();

  if (!batch.data || batch.data.user_id !== OPENID) {
    return {
      success: false,
      message: "batch not found"
    };
  }

  await db.collection("inventory_batches").doc(batchId).update({
    data: {
      quantity,
      updated_at: Date.now()
    }
  });

  return {
    success: true
  };
}

module.exports = {
  updateBatch
};
