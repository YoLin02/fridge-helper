"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyPlan = generateWeeklyPlan;
exports.getLatestWeeklyPlan = getLatestWeeklyPlan;
const cloud_1 = require("./cloud");
async function generateWeeklyPlan(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "plan-api",
        data: {
            action: "generateWeeklyPlan",
            payload: input
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "generate weekly plan failed");
    }
    return result.data;
}
async function getLatestWeeklyPlan() {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "plan-api",
        data: {
            action: "getLatestWeeklyPlan",
            payload: {}
        }
    });
    if (!result.success) {
        throw new Error(result.message ?? "get latest weekly plan failed");
    }
    return result.data ?? null;
}
