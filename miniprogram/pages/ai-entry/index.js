"use strict";
Page({
    data: {
        activeMode: "receipt",
        modes: [
            { value: "receipt", label: "小票识别" },
            { value: "shopping_list", label: "购物清单" },
            { value: "text_input", label: "文字录入" }
        ],
        inputText: "今天买了鸡蛋一板，牛奶两盒，鸡胸肉500克，番茄4个。"
    },
    switchMode(event) {
        this.setData({
            activeMode: event.currentTarget.dataset.value
        });
    },
    handleInput(event) {
        this.setData({
            inputText: event.detail.value
        });
    },
    goNext() {
        const content = encodeURIComponent(this.data.inputText.trim());
        wx.navigateTo({
            url: `/pages/ai-confirm/index?mode=${this.data.activeMode}&content=${content}`
        });
    }
});
