"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recipe_service_1 = require("../../services/recipe.service");
Page({
    data: {
        item: null,
        loading: true
    },
    async onLoad(options) {
        try {
            const item = await (0, recipe_service_1.getRecipeDetail)(options.recipeId ?? "");
            this.setData({
                item,
                loading: false
            });
        }
        catch (error) {
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
