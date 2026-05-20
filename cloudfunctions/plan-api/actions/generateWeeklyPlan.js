const cloud = require("wx-server-sdk");
const { buildWeeklyPlan, toPlanClient, toPlanRecord } = require("../services/planService");

const db = cloud.database();

async function generateWeeklyPlan(payload) {
  const { OPENID } = cloud.getWXContext();
  const profileResult = await db
    .collection("user_profiles")
    .where({
      user_id: OPENID
    })
    .limit(1)
    .get()
    .catch(() => ({ data: [] }));
  const recipeResult = await db
    .collection("recipes")
    .where({
      user_id: OPENID
    })
    .limit(100)
    .get();
  const inventoryResult = await db
    .collection("inventory_batches")
    .where({
      user_id: OPENID,
      status: "normal"
    })
    .limit(200)
    .get();

  if (recipeResult.data.length === 0) {
    return {
      success: false,
      message: "请先至少保存一份菜谱后再生成周计划"
    };
  }

  const dailyCalorieTarget = profileResult.data[0]?.daily_calorie_target || 2200;
  const plan = buildWeeklyPlan({
    cycleDays: payload.cycleDays,
    peopleCount: payload.peopleCount,
    goal: payload.goal,
    dailyCalorieTarget,
    recipes: recipeResult.data,
    inventoryRows: inventoryResult.data
  });
  const record = toPlanRecord({
    openid: OPENID,
    plan
  });
  const addResult = await db.collection("plans").add({
    data: record
  });

  return {
    success: true,
    data: toPlanClient({
      _id: addResult._id,
      ...record
    })
  };
}

module.exports = {
  generateWeeklyPlan
};
