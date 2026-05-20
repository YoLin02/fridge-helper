"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_service_1 = require("../../services/inventory.service");
const expire_1 = require("../../utils/expire");
Page({
    data: {
        foodName: "",
        totalQuantity: "--",
        nearestExpireText: "",
        nearestExpireState: "normal",
        batches: []
    },
    async onLoad(options) {
        const foodName = decodeURIComponent(options.foodName ?? "");
        if (!foodName) {
            wx.showToast({
                title: "缺少食材名称",
                icon: "none"
            });
            return;
        }
        try {
            const detail = await (0, inventory_service_1.getInventoryDetail)(foodName);
            const batches = detail.batches.map((batch) => {
                const expireInfo = (0, expire_1.getExpireDisplay)(batch.expireDate);
                return {
                    id: batch.id,
                    quantityText: `${batch.quantity} ${batch.unit}`,
                    purchaseDate: batch.purchaseDate,
                    expireDate: batch.expireDate,
                    storageText: batch.storageLocation === "cold" ? "冷藏" : batch.storageLocation === "frozen" ? "冷冻" : "常温",
                    expireText: expireInfo.text,
                    expireState: expireInfo.state
                };
            });
            const nearestExpire = batches[0];
            this.setData({
                foodName: detail.foodName,
                totalQuantity: `${detail.totalQuantity} ${detail.unit}`,
                batches,
                nearestExpireText: nearestExpire?.expireText ?? "暂无数据",
                nearestExpireState: nearestExpire?.expireState ?? "normal"
            });
        }
        catch {
            wx.showToast({
                title: "库存详情加载失败",
                icon: "none"
            });
        }
    },
    handleAction() {
        wx.showToast({
            title: "M2 先保留编辑/消耗/丢弃入口",
            icon: "none"
        });
    }
});
