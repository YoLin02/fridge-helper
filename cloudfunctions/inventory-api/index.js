const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { createBatches } = require("./actions/createBatches");
const { consumeBatch } = require("./actions/consumeBatch");
const { discardBatch } = require("./actions/discardBatch");
const { deductInventoryByMeal } = require("./actions/deductInventoryByMeal");
const { getFoodRecommendations } = require("./actions/getFoodRecommendations");
const { listInventory } = require("./actions/listInventory");
const { listInventoryBatchOptions } = require("./actions/listInventoryBatchOptions");
const { getInventoryDetail } = require("./actions/getInventoryDetail");
const { getInventoryStats } = require("./actions/getInventoryStats");
const { updateBatch } = require("./actions/updateBatch");

exports.main = async (event) => {
  const { action, payload = {} } = event || {};

  if (action === "createBatches") {
    return createBatches(payload);
  }

  if (action === "listInventory") {
    return listInventory(payload);
  }

  if (action === "getInventoryDetail") {
    return getInventoryDetail(payload);
  }

  if (action === "getInventoryStats") {
    return getInventoryStats(payload);
  }

  if (action === "listInventoryBatchOptions") {
    return listInventoryBatchOptions(payload);
  }

  if (action === "updateBatch") {
    return updateBatch(payload);
  }

  if (action === "consumeBatch") {
    return consumeBatch(payload);
  }

  if (action === "discardBatch") {
    return discardBatch(payload);
  }

  if (action === "deductInventoryByMeal") {
    return deductInventoryByMeal(payload);
  }

  if (action === "getFoodRecommendations") {
    return getFoodRecommendations(payload);
  }

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
