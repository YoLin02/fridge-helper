import { callCloudFunction } from "./cloud";
import type {
  AiInventoryDraft,
  InventoryBatch,
  InventoryBatchOption,
  InventoryDetailResult,
  InventoryDraftItem,
  InventoryListItem,
  InventoryRecommendations,
  InventoryStats,
  ParseInventoryDraftResult
} from "../models/inventory";

export interface ParseInventoryInput {
  mode: "receipt" | "shopping_list" | "text_input";
  content: string;
}

export interface SaveDraftInput {
  sourceType: "ai_receipt" | "shopping_list" | "text_input";
  sourceTaskId?: string;
  items: InventoryDraftItem[];
}

const mockDraft: AiInventoryDraft = {
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

export async function parseInventoryDraft(_: ParseInventoryInput): Promise<ParseInventoryDraftResult> {
  try {
    const result = await callCloudFunction<
      {
        action: "parseInventoryInput";
        payload: {
          text: string;
          input_type: ParseInventoryInput["mode"];
        };
      },
      {
        success: boolean;
        task_id?: string;
        data?: ParseInventoryDraftResult;
        warnings?: string[];
      }
    >({
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
  } catch (error) {
    console.error("parseInventoryDraft failed", error);

    return {
      taskId: undefined,
      ...mockDraft,
      warnings: [
        ...mockDraft.warnings,
        `云函数调用失败，已使用本地草稿数据。${error instanceof Error ? `原因：${error.message}` : ""}`
      ]
    };
  }
}

export async function saveInventoryDraft(input: SaveDraftInput): Promise<{
  success: boolean;
  created?: InventoryBatch[];
  message?: string;
}> {
  try {
    const result = await callCloudFunction<
      {
        action: "createBatches";
        payload: SaveDraftInput;
      },
      {
        success: boolean;
        data?: {
          created: InventoryBatch[];
        };
        message?: string;
      }
    >({
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
  } catch (error) {
    console.error("saveInventoryDraft failed", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "云函数调用失败，暂时无法真正写入库存。"
    };
  }
}

export async function getInventoryList(filter: string): Promise<InventoryListItem[]> {
  const result = await callCloudFunction<
    {
      action: "listInventory";
      payload: {
        filter: string;
      };
    },
    {
      success: boolean;
      data?: {
        items: InventoryListItem[];
      };
      message?: string;
    }
  >({
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

export async function getInventoryStats(): Promise<InventoryStats> {
  const result = await callCloudFunction<
    {
      action: "getInventoryStats";
      payload: Record<string, never>;
    },
    {
      success: boolean;
      data?: InventoryStats;
      message?: string;
    }
  >({
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

export async function getInventoryDetail(foodName: string): Promise<InventoryDetailResult> {
  const result = await callCloudFunction<
    {
      action: "getInventoryDetail";
      payload: {
        foodName: string;
      };
    },
    {
      success: boolean;
      data?: InventoryDetailResult;
      message?: string;
    }
  >({
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

export async function updateBatch(input: {
  batchId: string;
  quantity: number;
}): Promise<boolean> {
  const result = await callCloudFunction<
    {
      action: "updateBatch";
      payload: {
        batchId: string;
        quantity: number;
      };
    },
    { success: boolean; message?: string }
  >({
    name: "inventory-api",
    data: {
      action: "updateBatch",
      payload: input
    }
  });

  if (!result.success) {
    throw new Error(result.message ?? "update batch failed");
  }

  return true;
}

export async function consumeBatch(input: {
  batchId: string;
}): Promise<boolean> {
  const result = await callCloudFunction<
    {
      action: "consumeBatch";
      payload: {
        batchId: string;
      };
    },
    { success: boolean; message?: string }
  >({
    name: "inventory-api",
    data: {
      action: "consumeBatch",
      payload: input
    }
  });

  if (!result.success) {
    throw new Error(result.message ?? "consume batch failed");
  }

  return true;
}

export async function discardBatch(input: {
  batchId: string;
}): Promise<boolean> {
  const result = await callCloudFunction<
    {
      action: "discardBatch";
      payload: {
        batchId: string;
      };
    },
    { success: boolean; message?: string }
  >({
    name: "inventory-api",
    data: {
      action: "discardBatch",
      payload: input
    }
  });

  if (!result.success) {
    throw new Error(result.message ?? "discard batch failed");
  }

  return true;
}

export async function listInventoryBatchOptions(): Promise<InventoryBatchOption[]> {
  const result = await callCloudFunction<
    {
      action: "listInventoryBatchOptions";
      payload: Record<string, never>;
    },
    {
      success: boolean;
      data?: {
        items: InventoryBatchOption[];
      };
      message?: string;
    }
  >({
    name: "inventory-api",
    data: {
      action: "listInventoryBatchOptions",
      payload: {}
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "list inventory batch options failed");
  }

  return result.data.items;
}

export async function deductInventoryBatches(input: {
  items: Array<{
    batchId: string;
    consumeQuantity: number;
  }>;
}): Promise<boolean> {
  const result = await callCloudFunction<
    {
      action: "deductInventoryByMeal";
      payload: {
        items: Array<{
          batchId: string;
          consumeQuantity: number;
        }>;
      };
    },
    { success: boolean; message?: string }
  >({
    name: "inventory-api",
    data: {
      action: "deductInventoryByMeal",
      payload: input
    }
  });

  if (!result.success) {
    throw new Error(result.message ?? "deduct inventory failed");
  }

  return true;
}

export async function getInventoryRecommendations(remainingCaloriesKcal: number): Promise<InventoryRecommendations> {
  const result = await callCloudFunction<
    {
      action: "getFoodRecommendations";
      payload: {
        remainingCaloriesKcal: number;
      };
    },
    {
      success: boolean;
      data?: InventoryRecommendations;
      message?: string;
    }
  >({
    name: "inventory-api",
    data: {
      action: "getFoodRecommendations",
      payload: {
        remainingCaloriesKcal
      }
    }
  });

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "get food recommendations failed");
  }

  return result.data;
}
