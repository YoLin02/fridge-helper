const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { createBatches } = require("./actions/createBatches");
const { listInventory } = require("./actions/listInventory");
const { getInventoryDetail } = require("./actions/getInventoryDetail");
const { getInventoryStats } = require("./actions/getInventoryStats");

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

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
