"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInventoryDraft = parseInventoryDraft;
exports.saveInventoryDraft = saveInventoryDraft;
exports.getInventoryList = getInventoryList;
exports.getInventoryStats = getInventoryStats;
exports.getInventoryDetail = getInventoryDetail;
const cloud_1 = require("./cloud");
const mockDraft = {
    items: [
        {
            id: "draft-egg",
            foodName: "鸡蛋",
            originalName: "鸡蛋一板",
            category: "蛋奶类",
            quantity: 1,
            unit: "板",
            storageLocation: "cold",
            purchaseDate: "2026-05-20",
            expireDate: "2026-06-19",
            expireSource: "ai_inferred",
            confidence: 0.88,
            note: "未识别明确保质期，按默认规则推测"
        },
        {
            id: "draft-milk",
            foodName: "纯牛奶",
            originalName: "牛奶两盒",
            category: "蛋奶类",
            quantity: 2,
            unit: "盒",
            storageLocation: "cold",
            purchaseDate: "2026-05-20",
            expireDate: "2026-05-26",
            expireSource: "default_rule",
            confidence: 0.82
        }
    ],
    warnings: ["AI 结果仅为草稿，入库前必须由用户确认。"]
};
async function parseInventoryDraft(_) {
    try {
        const result = await (0, cloud_1.callCloudFunction)({
            name: "ai-parser",
            data: {
                action: "parseInventoryInput",
                payload: {
                    text: _.content,
                    input_type: _.mode
                }
            }
        });
        if (!result.success || !result.data) {
            throw new Error("parse inventory failed");
        }
        return {
            taskId: result.task_id ?? result.data.taskId,
            items: result.data.items,
            warnings: result.warnings ?? result.data.warnings
        };
    }
    catch {
        return {
            taskId: undefined,
            ...mockDraft,
            warnings: [...mockDraft.warnings, "当前未连接云函数，已使用本地草稿数据。"]
        };
    }
}
async function saveInventoryDraft(input) {
    try {
        const result = await (0, cloud_1.callCloudFunction)({
            name: "inventory-api",
            data: {
                action: "createBatches",
                payload: input
            }
        });
        return {
            success: result.success,
            created: result.data?.created,
            message: result.message
        };
    }
    catch {
        return {
            success: false,
            message: "云函数尚未部署，暂时无法真正写入库存。"
        };
    }
}
async function getInventoryList(filter) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "inventory-api",
        data: {
            action: "listInventory",
            payload: {
                filter
            }
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "list inventory failed");
    }
    return result.data.items;
}
async function getInventoryStats() {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "inventory-api",
        data: {
            action: "getInventoryStats",
            payload: {}
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "get inventory stats failed");
    }
    return result.data;
}
async function getInventoryDetail(foodName) {
    const result = await (0, cloud_1.callCloudFunction)({
        name: "inventory-api",
        data: {
            action: "getInventoryDetail",
            payload: {
                foodName
            }
        }
    });
    if (!result.success || !result.data) {
        throw new Error(result.message ?? "get inventory detail failed");
    }
    return result.data;
}
