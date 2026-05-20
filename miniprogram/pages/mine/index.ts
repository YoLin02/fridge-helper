import { getDailySummary } from "../../services/calorie.service";
import { getInventoryStats } from "../../services/inventory.service";

Page({
  data: {
    profile: {
      nickname: "健康生活家",
      description: "用心记录每一餐，遇见更好的自己"
    },
    stats: [
      { title: "食材数量", value: "--", label: "库存食材", hint: "按批次聚合" },
      { title: "今日饮食", value: "--", label: "饮食记录", hint: "统计今日已记录热量" }
    ],
    settings: [
      "消息通知",
      "隐私设置",
      "单位设置",
      "帮助与反馈"
    ]
  },
  async onShow() {
    try {
      const [inventoryStats, summary] = await Promise.all([
        getInventoryStats(),
        getDailySummary("2026-05-20")
      ]);

      this.setData({
        stats: [
          { title: "食材数量", value: `${inventoryStats.totalItems}`, label: "库存食材", hint: "按批次聚合" },
          { title: "今日饮食", value: `${summary.consumedCaloriesKcal}`, label: "已摄入 kcal", hint: "自动汇总" }
        ]
      });
    } catch {
      return;
    }
  }
});
