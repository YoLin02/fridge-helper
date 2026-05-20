export type StorageLocation = "cold" | "frozen" | "room";

export type InventoryStatus = "normal" | "consumed" | "discarded";

export type ExpireSource = "manual" | "default_rule" | "ai_inferred";

export interface InventoryBatch {
  id: string;
  userId: string;
  foodName: string;
  originalName: string;
  category: string;
  quantity: number;
  unit: string;
  storageLocation: StorageLocation;
  purchaseDate: string;
  expireDate: string;
  expireSource: ExpireSource;
  sourceType: "ai_receipt" | "shopping_list" | "text_input" | "manual";
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
  confidence?: number;
  note?: string;
}

export interface InventoryDraftItem {
  id: string;
  foodName: string;
  originalName: string;
  category: string;
  quantity: number;
  unit: string;
  storageLocation: StorageLocation;
  purchaseDate: string;
  expireDate: string;
  expireSource: ExpireSource;
  confidence: number;
  note?: string;
}

export interface AiInventoryDraft {
  items: InventoryDraftItem[];
  warnings: string[];
}

export interface ParseInventoryDraftResult {
  taskId?: string;
  items: InventoryDraftItem[];
  warnings: string[];
}

export interface InventoryListItem {
  foodName: string;
  category: string;
  totalQuantity: number;
  unit: string;
  storageLocation: StorageLocation;
  nearestExpireDate: string;
  batchCount: number;
}

export interface InventoryDetailResult {
  foodName: string;
  category: string;
  totalQuantity: number;
  unit: string;
  storageLocation: StorageLocation;
  batches: InventoryBatch[];
}

export interface InventoryStats {
  totalItems: number;
  expiringItems: number;
  expiredItems: number;
  categories: number;
}

export interface InventoryBatchOption {
  batchId: string;
  foodName: string;
  quantity: number;
  unit: string;
  storageLocation: StorageLocation;
  expireDate: string;
}

export interface InventoryRecommendationItem {
  foodName: string;
  quantityText: string;
  expireDate: string;
  remainingDaysText: string;
  estimatedCaloriesKcal?: number;
  reason: string;
}

export interface InventoryRecommendations {
  expiringItems: InventoryRecommendationItem[];
  calorieFriendlyItems: InventoryRecommendationItem[];
}
