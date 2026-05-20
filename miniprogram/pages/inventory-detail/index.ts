import { consumeBatch, discardBatch, getInventoryDetail, updateBatch } from "../../services/inventory.service";
import { getExpireDisplay } from "../../utils/expire";

interface BatchView {
  id: string;
  quantityText: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expireDate: string;
  storageText: string;
  expireText: string;
  expireState: string;
}

Page({
  data: {
    foodName: "",
    totalQuantity: "--",
    loading: true,
    nearestExpireText: "",
    nearestExpireState: "normal",
    batches: [] as BatchView[]
  },
  async onLoad(options: Record<string, string | undefined>) {
    const foodName = decodeURIComponent(options.foodName ?? "");
    await this.loadDetail(foodName);
  },
  async loadDetail(foodName: string) {
    if (!foodName) {
      wx.showToast({
        title: "缺少食材名称",
        icon: "none"
      });
      return;
    }

    try {
      this.setData({
        loading: true
      });
      const detail = await getInventoryDetail(foodName);
      const batches = detail.batches.map((batch) => {
        const expireInfo = getExpireDisplay(batch.expireDate);

        return {
          id: batch.id,
          quantity: batch.quantity,
          unit: batch.unit,
          quantityText: `${batch.quantity} ${batch.unit}`,
          purchaseDate: batch.purchaseDate,
          expireDate: batch.expireDate,
          storageText: batch.storageLocation === "cold" ? "冷藏" : batch.storageLocation === "frozen" ? "冷冻" : "常温",
          expireText: expireInfo.text,
          expireState: expireInfo.state
        };
      });

      const nearestExpire = batches[0];

      this.setData({
        foodName: detail.foodName,
        totalQuantity: `${detail.totalQuantity} ${detail.unit}`,
        batches,
        nearestExpireText: nearestExpire?.expireText ?? "暂无数据",
        nearestExpireState: nearestExpire?.expireState ?? "normal",
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "库存详情加载失败",
        icon: "none"
      });
      this.setData({
        loading: false
      });
    }
  },
  async handleEdit(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    try {
      const batch = this.data.batches.find((item) => item.id === event.currentTarget.dataset.id);

      if (!batch) {
        return;
      }

      const result = await wx.showModal({
        title: "编辑数量",
        content: `当前数量：${batch.quantityText}`,
        editable: true,
        placeholderText: `${batch.quantity}`,
        confirmText: "保存"
      });

      if (!result.confirm) {
        return;
      }

      const value = Number(result.content);

      if (!value || value <= 0) {
        wx.showToast({
          title: "请输入大于 0 的数量",
          icon: "none"
        });
        return;
      }

      await updateBatch({
        batchId: batch.id,
        quantity: value
      });

      wx.showToast({
        title: "已更新",
        icon: "success"
      });

      await this.loadDetail(this.data.foodName);
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "更新失败",
        icon: "none"
      });
    }
  },
  async handleConsume(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    try {
      await consumeBatch({
        batchId: event.currentTarget.dataset.id
      });

      wx.showToast({
        title: "已标记消耗",
        icon: "success"
      });

      await this.loadDetail(this.data.foodName);
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "操作失败",
        icon: "none"
      });
    }
  },
  async handleDiscard(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    try {
      await discardBatch({
        batchId: event.currentTarget.dataset.id
      });

      wx.showToast({
        title: "已标记丢弃",
        icon: "success"
      });

      await this.loadDetail(this.data.foodName);
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "操作失败",
        icon: "none"
      });
    }
  }
});
