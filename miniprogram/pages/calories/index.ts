import { getDailySummary } from "../../services/calorie.service";
import type { DailySummary, MealType } from "../../models/calorie";
import { getInventoryRecommendations } from "../../services/inventory.service";
import type { InventoryRecommendations } from "../../models/inventory";

Page({
  data: {
    date: "2026-05-20",
    summary: null as DailySummary | null,
    recommendations: null as InventoryRecommendations | null,
    loading: true,
    mealOrder: ["breakfast", "lunch", "dinner", "snack"] as MealType[]
  },
  onShow() {
    void this.loadSummary();
  },
  async loadSummary() {
    this.setData({
      loading: true
    });

    try {
      const summary = await getDailySummary(this.data.date);
      const recommendations = await getInventoryRecommendations(summary.remainingCaloriesKcal);

      this.setData({
        summary,
        recommendations,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "加载失败",
        icon: "none"
      });
      this.setData({
        loading: false
      });
    }
  },
  goProfile() {
    wx.navigateTo({
      url: "/pages/profile/index"
    });
  },
  goAddMeal(event: WechatMiniprogram.TouchEvent<{ meal: MealType }>) {
    const { meal } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/calorie-add/index?mode=meal&date=${this.data.date}&mealType=${meal}`
    });
  },
  goAddExercise() {
    wx.navigateTo({
      url: `/pages/calorie-add/index?mode=exercise&date=${this.data.date}`
    });
  }
});
