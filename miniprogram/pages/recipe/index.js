"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recipe_service_1 = require("../../services/recipe.service");
Page({
    data: {
        items: [],
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
            const items = await (0, recipe_service_1.listRecipes)();
            this.setData({
                items,
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
    },
    goCreate() {
        wx.navigateTo({
            url: "/pages/recipe-add/index"
        });
    },
    goDetail(event) {
        wx.navigateTo({
            url: `/pages/recipe-detail/index?recipeId=${event.currentTarget.dataset.id}`
        });
    }
});
