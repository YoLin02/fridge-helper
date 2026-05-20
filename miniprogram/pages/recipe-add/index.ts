import { createRecipe, parseRecipeDraft } from "../../services/recipe.service";
import type { RecipeDraft } from "../../models/recipe";

Page({
  data: {
    inputText:
      "番茄炒蛋\n食材：番茄2个，鸡蛋3个。\n步骤：鸡蛋打散，番茄切块，先炒鸡蛋，再炒番茄，混合调味。",
    parsing: false,
    saving: false,
    draft: null as RecipeDraft | null
  },
  handleInput(event: WechatMiniprogram.Input) {
    this.setData({
      inputText: event.detail.value
    });
  },
  async handleParse() {
    this.setData({
      parsing: true
    });

    try {
      const draft = await parseRecipeDraft({
        text: this.data.inputText
      });
      this.setData({
        draft
      });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "解析失败",
        icon: "none"
      });
    } finally {
      this.setData({
        parsing: false
      });
    }
  },
  async handleSave() {
    if (!this.data.draft) {
      wx.showToast({
        title: "请先解析菜谱",
        icon: "none"
      });
      return;
    }

    this.setData({
      saving: true
    });

    try {
      await createRecipe({
        taskId: this.data.draft.taskId,
        draft: this.data.draft
      });

      wx.showToast({
        title: "已保存",
        icon: "success"
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "保存失败",
        icon: "none"
      });
    } finally {
      this.setData({
        saving: false
      });
    }
  }
});
