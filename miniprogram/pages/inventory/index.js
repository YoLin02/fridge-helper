"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expire_1 = require("../../utils/expire");
const inventory_service_1 = require("../../services/inventory.service");
Page({
    data: {
        filters: ["全部", "临期", "已过期"],
        activeFilter: "全部",
        inventoryStats: [
            { title: "全部食材", value: "--", label: "当前库存", hint: "按批次管理" },
            { title: "临期食材", value: "--", label: "重点处理", hint: "优先消费" },
            { title: "已过期", value: "--", label: "尽快处理", hint: "动态计算" },
            { title: "种类", value: "--", label: "分类总数", hint: "按食材类目" }
        ],
        items: []
    },
    onShow() {
        void this.loadInventoryData();
    },
    async loadInventoryData() {
        try {
            const [stats, items] = await Promise.all([
                (0, inventory_service_1.getInventoryStats)(),
                (0, inventory_service_1.getInventoryList)(this.data.activeFilter)
            ]);
            this.setData({
                inventoryStats: [
                    { title: "全部食材", value: `${stats.totalItems}`, label: "当前库存", hint: "按批次管理" },
                    { title: "临期食材", value: `${stats.expiringItems}`, label: "重点处理", hint: "优先消费" },
                    { title: "已过期", value: `${stats.expiredItems}`, label: "尽快处理", hint: "动态计算" },
                    { title: "种类", value: `${stats.categories}`, label: "分类总数", hint: "按食材类目" }
                ],
                items: items.map((item) => this.toCardView(item))
            });
        }
        catch {
            wx.showToast({
                title: "库存数据加载失败",
                icon: "none"
            });
        }
    },
    toCardView(item) {
        const expireDisplay = (0, expire_1.getExpireDisplay)(item.nearestExpireDate);
        return {
            name: item.foodName,
            category: item.category,
            quantity: `${item.totalQuantity} ${item.unit}`,
            storage: item.storageLocation === "cold" ? "冷藏" : item.storageLocation === "frozen" ? "冷冻" : "常温",
            expire: `${item.nearestExpireDate} 到期`,
            status: expireDisplay.text
        };
    },
    goDetail(event) {
        const { name } = event.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/inventory-detail/index?foodName=${encodeURIComponent(name)}`
        });
    },
    async switchFilter(event) {
        const { value } = event.currentTarget.dataset;
        this.setData({
            activeFilter: value
        });
        await this.loadInventoryData();
    }
});
