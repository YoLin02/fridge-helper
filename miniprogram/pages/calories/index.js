"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calorie_service_1 = require("../../services/calorie.service");
const inventory_service_1 = require("../../services/inventory.service");
Page({
    data: {
        date: "2026-05-20",
        summary: null,
        recommendations: null,
        loading: true,
        mealOrder: ["breakfast", "lunch", "dinner", "snack"]
    },
    onShow() {
        void this.loadSummary();
    },
    async loadSummary() {
        this.setData({
            loading: true
        });
        try {
            const summary = await (0, calorie_service_1.getDailySummary)(this.data.date);
            const recommendations = await (0, inventory_service_1.getInventoryRecommendations)(summary.remainingCaloriesKcal);
            this.setData({
                summary,
                recommendations,
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
    goProfile() {
        wx.navigateTo({
            url: "/pages/profile/index"
        });
    },
    goAddMeal(event) {
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
