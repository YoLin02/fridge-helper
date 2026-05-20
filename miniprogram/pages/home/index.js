"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calorie_service_1 = require("../../services/calorie.service");
const inventory_service_1 = require("../../services/inventory.service");
const plan_service_1 = require("../../services/plan.service");
const recipe_service_1 = require("../../services/recipe.service");
Page({
    data: {
        greeting: "早上好",
        summaryCards: [
            {
                title: "冰箱提醒",
                value: "8",
                label: "临期食材",
                hint: "2 天内到期"
            },
            {
                title: "库存概览",
                value: "128",
                label: "全部食材",
                hint: "3 个大类"
            }
        ],
        quickActions: [
            { title: "AI 快速入库", desc: "拍小票 / 贴清单 / 文本录入" },
            { title: "记录饮食", desc: "进入卡路里记录页" },
            { title: "我的菜谱", desc: "上传、解析与查看菜谱" },
            { title: "一周计划", desc: "生成购物清单和备菜安排" }
        ],
        recipeRecommendations: [],
        latestPlan: null
    },
    async onShow() {
        try {
            const [inventoryStats, dailySummary, recipeRecommendations, latestPlan] = await Promise.all([
                (0, inventory_service_1.getInventoryStats)(),
                (0, calorie_service_1.getDailySummary)("2026-05-20"),
                (0, recipe_service_1.getRecipeRecommendations)({}),
                (0, plan_service_1.getLatestWeeklyPlan)()
            ]);
            this.setData({
                summaryCards: [
                    {
                        title: "冰箱提醒",
                        value: `${inventoryStats.expiringItems}`,
                        label: "临期食材",
                        hint: inventoryStats.expiringItems > 0 ? "优先处理临期库存" : "当前库存状态稳定"
                    },
                    {
                        title: "今日摄入",
                        value: `${dailySummary.consumedCaloriesKcal}`,
                        label: "已摄入 kcal",
                        hint: `还可摄入 ${dailySummary.remainingCaloriesKcal} kcal`
                    }
                ],
                recipeRecommendations,
                latestPlan
            });
        }
        catch {
            return;
        }
    },
    goAiEntry() {
        wx.navigateTo({
            url: "/pages/ai-entry/index"
        });
    },
    goRecipes() {
        wx.navigateTo({
            url: "/pages/recipe/index"
        });
    },
    handleQuickAction(event) {
        const { title } = event.detail;
        if (title === "AI 快速入库") {
            this.goAiEntry();
            return;
        }
        if (title === "查看库存") {
            wx.switchTab({
                url: "/pages/inventory/index"
            });
            return;
        }
        if (title === "记录饮食") {
            wx.switchTab({
                url: "/pages/calories/index"
            });
            return;
        }
        if (title === "我的菜谱") {
            this.goRecipes();
            return;
        }
        if (title === "一周计划") {
            this.goPlan();
            return;
        }
    },
    goPlan() {
        wx.navigateTo({
            url: "/pages/plan/index"
        });
    },
    goRecipeDetail(event) {
        wx.navigateTo({
            url: `/pages/recipe-detail/index?recipeId=${event.currentTarget.dataset.id}`
        });
    },
    handleComingSoon() {
        wx.showToast({
            title: "M1 页面骨架已就位",
            icon: "none"
        });
    }
});
