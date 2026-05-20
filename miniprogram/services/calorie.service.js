"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySummary = getDailySummary;
exports.setUserProfile = setUserProfile;
exports.parseCalorieDraft = parseCalorieDraft;
exports.addMealLog = addMealLog;
exports.addExerciseLog = addExerciseLog;
const cloud_1 = require("./cloud");
async function getDailySummary(date) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "calorie-api",
        data: {
            action: "getDailySummary",
            payload: { date }
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "get daily summary failed");
    }
    return result.data;
}
async function setUserProfile(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "calorie-api",
        data: {
            action: "setUserProfile",
            payload: input
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "set user profile failed");
    }
    return result.data;
}
async function parseCalorieDraft(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "ai-parser",
        data: {
            action: "parseCalorieInput",
            payload: {
                date: input.date,
                meal_type: input.mealType,
                text: input.content
            }
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "parse calorie input failed");
    }
    return {
        taskId: result.task_id ?? result.data.taskId,
        foods: result.data.foods,
        totalCaloriesKcal: result.data.totalCaloriesKcal,
        totalProteinG: result.data.totalProteinG,
        totalFatG: result.data.totalFatG,
        totalCarbG: result.data.totalCarbG,
        warnings: result.warnings ?? result.data.warnings
    };
}
async function addMealLog(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "calorie-api",
        data: {
            action: "addMealLog",
            payload: input
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "add meal log failed");
    }
    return result.data;
}
async function addExerciseLog(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "calorie-api",
        data: {
            action: "addExerciseLog",
            payload: input
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "add exercise log failed");
    }
    return result.data;
}
