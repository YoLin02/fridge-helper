const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { getDailySummary } = require("./actions/getDailySummary");
const { addMealLog } = require("./actions/addMealLog");
const { addExerciseLog } = require("./actions/addExerciseLog");
const { setUserProfile } = require("./actions/setUserProfile");

exports.main = async (event) => {
  const { action, payload = {} } = event || {};

  if (action === "getDailySummary") {
    return getDailySummary(payload);
  }

  if (action === "addMealLog") {
    return addMealLog(payload);
  }

  if (action === "addExerciseLog") {
    return addExerciseLog(payload);
  }

  if (action === "setUserProfile") {
    return setUserProfile(payload);
  }

  if (action === "calculateUserTargets") {
    return setUserProfile(payload, { calculateOnly: true });
  }

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
