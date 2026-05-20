import { getRecipeDetail } from "../../services/recipe.service";
import type { Recipe } from "../../models/recipe";

Page({
  data: {
    item: null as Recipe | null,
    loading: true
  },
  async onLoad(options: Record<string, string | undefined>) {
    try {
      const item = await getRecipeDetail(options.recipeId ?? "");
      this.setData({
        item,
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
  }
});
