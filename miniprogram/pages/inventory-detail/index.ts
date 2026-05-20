import { getInventoryDetail } from "../../services/inventory.service";
import { getExpireDisplay } from "../../utils/expire";

interface BatchView {
  id: string;
  quantityText: string;
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
    nearestExpireText: "",
    nearestExpireState: "normal",
    batches: [] as BatchView[]
  },
  async onLoad(options: Record<string, string | undefined>) {
    const foodName = decodeURIComponent(options.foodName ?? "");

    if (!foodName) {
      wx.showToast({
        title: "缺少食材名称",
        icon: "none"
      });
      return;
    }

    try {
      const detail = await getInventoryDetail(foodName);
      const batches = detail.batches.map((batch) => {
        const expireInfo = getExpireDisplay(batch.expireDate);

        return {
          id: batch.id,
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
        nearestExpireState: nearestExpire?.expireState ?? "normal"
      });
    } catch {
      wx.showToast({
        title: "库存详情加载失败",
        icon: "none"
      });
    }
  },
  handleAction() {
    wx.showToast({
      title: "M2 先保留编辑/消耗/丢弃入口",
      icon: "none"
    });
  }
});
