const cloud = require("wx-server-sdk");

const db = cloud.database();

async function consumeBatch(payload) {
  const { OPENID } = cloud.getWXContext();
  const { batchId } = payload || {};
  const batch = await db.collection("inventory_batches").doc(batchId).get();

  if (!batch.data || batch.data.user_id !== OPENID) {
    return {
      success: false,
      message: "batch not found"
    };
  }

  await db.collection("inventory_batches").doc(batchId).update({
    data: {
      status: "consumed",
      updated_at: Date.now()
    }
  });

  return {
    success: true
  };
}

module.exports = {
  consumeBatch
};
