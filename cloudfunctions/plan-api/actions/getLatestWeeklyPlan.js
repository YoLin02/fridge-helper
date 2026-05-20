const cloud = require("wx-server-sdk");
const { toPlanClient } = require("../services/planService");

const db = cloud.database();

async function getLatestWeeklyPlan() {
  const { OPENID } = cloud.getWXContext();
  const result = await db
    .collection("plans")
    .where({
      user_id: OPENID
    })
    .orderBy("created_at", "desc")
    .limit(1)
    .get()
    .catch(() => ({ data: [] }));

  return {
    success: true,
    data: result.data[0] ? toPlanClient(result.data[0]) : null
  };
}

module.exports = {
  getLatestWeeklyPlan
};
