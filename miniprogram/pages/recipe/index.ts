import { listRecipes } from "../../services/recipe.service";
import type { Recipe } from "../../models/recipe";

Page({
  data: {
    items: [] as Recipe[],
    loading: true
  },
  onShow() {
    void this.loadRecipes();
  },
  async loadRecipes() {
    this.setData({
      loading: true
    });

    try {
      const items = await listRecipes();
      this.setData({
        items,
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
  goCreate() {
    wx.navigateTo({
      url: "/pages/recipe-add/index"
    });
  },
  goDetail(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    wx.navigateTo({
      url: `/pages/recipe-detail/index?recipeId=${event.currentTarget.dataset.id}`
    });
  }
});
