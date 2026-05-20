import { parseInventoryDraft, saveInventoryDraft } from "../../services/inventory.service";
import type { InventoryDraftItem } from "../../models/inventory";
import { getExpireDisplay } from "../../utils/expire";
import { validateDraftItem } from "../../utils/validator";

interface ConfirmItemView {
  id: string;
  foodName: string;
  originalName: string;
  category: string;
  quantityText: string;
  storageText: string;
  expireDate: string;
  confidenceText: string;
  expireState: string;
  expireText: string;
  note?: string;
}

Page({
  data: {
    loading: true,
    saving: false,
    mode: "text_input",
    inputContent: "",
    taskId: "",
    warnings: [] as string[],
    items: [] as ConfirmItemView[],
    draftItems: [] as InventoryDraftItem[]
  },
  async onLoad(options: Record<string, string | undefined>) {
    const mode = (options.mode as "receipt" | "shopping_list" | "text_input" | undefined) ?? "text_input";
    const inputContent = decodeURIComponent(options.content ?? "");

    this.setData({
      mode,
      inputContent
    });

    const draft = await parseInventoryDraft({
      mode,
      content: inputContent
    });

    const items = draft.items.map((item) => {
      const expireDisplay = getExpireDisplay(item.expireDate);

      return {
        id: item.id,
        foodName: item.foodName,
        originalName: item.originalName,
        category: item.category,
        quantityText: `${item.quantity} ${item.unit}`,
        storageText: item.storageLocation === "cold" ? "冷藏" : item.storageLocation === "frozen" ? "冷冻" : "常温",
        expireDate: item.expireDate,
        confidenceText: `${Math.round(item.confidence * 100)}%`,
        expireState: expireDisplay.state,
        expireText: expireDisplay.text,
        note: item.note
      };
    });

    this.setData({
      loading: false,
      taskId: draft.taskId ?? "",
      warnings: draft.warnings,
      items,
      draftItems: draft.items
    });
  },
  editItem(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    const target = this.data.draftItems.find((item) => item.id === id);

    if (!target) {
      return;
    }

    wx.showModal({
      title: "编辑提示",
      content: `M2 当前先保留编辑入口。\n目标食材：${target.foodName}\n后续会补完整表单编辑。`,
      showCancel: false
    });
  },
  async confirmSave() {
    const sourceType: "ai_receipt" | "shopping_list" | "text_input" =
      this.data.mode === "receipt" ? "ai_receipt" : this.data.mode === "shopping_list" ? "shopping_list" : "text_input";

    const allErrors = this.data.draftItems.flatMap((item) => validateDraftItem(item));

    if (allErrors.length > 0) {
      wx.showToast({
        title: allErrors[0],
        icon: "none"
      });
      return;
    }

    this.setData({
      saving: true
    });

    const result = await saveInventoryDraft({
      sourceType,
      sourceTaskId: this.data.taskId || undefined,
      items: this.data.draftItems
    });

    this.setData({
      saving: false
    });

    if (!result.success) {
      wx.showToast({
        title: result.message ?? "入库失败",
        icon: "none"
      });
      return;
    }

    wx.showToast({
      title: `已确认 ${result.created?.length ?? 0} 条批次`,
      icon: "success"
    });

    setTimeout(() => {
      wx.switchTab({
        url: "/pages/inventory/index"
      });
    }, 500);
  },
  retryParse() {
    wx.redirectTo({
      url: `/pages/ai-confirm/index?mode=${this.data.mode}&content=${encodeURIComponent(this.data.inputContent)}`
    });
  }
});
