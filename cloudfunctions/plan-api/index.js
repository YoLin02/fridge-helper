const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { generateWeeklyPlan } = require("./actions/generateWeeklyPlan");
const { getLatestWeeklyPlan } = require("./actions/getLatestWeeklyPlan");

exports.main = async (event) => {
  const { action, payload = {} } = event || {};

  if (action === "generateWeeklyPlan") {
    return generateWeeklyPlan(payload);
  }

  if (action === "getLatestWeeklyPlan") {
    return getLatestWeeklyPlan(payload);
  }

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
