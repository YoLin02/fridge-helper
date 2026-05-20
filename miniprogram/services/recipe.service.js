"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRecipeDraft = parseRecipeDraft;
exports.createRecipe = createRecipe;
exports.listRecipes = listRecipes;
exports.getRecipeDetail = getRecipeDetail;
exports.getRecipeRecommendations = getRecipeRecommendations;
const cloud_1 = require("./cloud");
async function parseRecipeDraft(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "ai-parser",
        data: {
            action: "parseRecipeInput",
            payload: {
                text: input.text
            }
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "parse recipe failed");
    }
    return {
        ...result.data,
        taskId: result.task_id ?? result.data.taskId,
        warnings: result.warnings ?? result.data.warnings
    };
}
async function createRecipe(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "recipe-api",
        data: {
            action: "createRecipe",
            payload: input
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "create recipe failed");
    }
    return result.data;
}
async function listRecipes() {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "recipe-api",
        data: {
            action: "listRecipes",
            payload: {}
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "list recipes failed");
    }
    return result.data.items;
}
async function getRecipeDetail(recipeId) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "recipe-api",
        data: {
            action: "getRecipeDetail",
            payload: {
                recipeId
            }
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "get recipe detail failed");
    }
    return result.data;
}
async function getRecipeRecommendations(input) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "recipe-api",
        data: {
            action: "recommendRecipes",
            payload: input
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "recommend recipes failed");
    }
    return result.data.items;
}
