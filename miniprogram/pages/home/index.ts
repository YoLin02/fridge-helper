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
      { title: "查看库存", desc: "浏览批次与临期情况" },
      { title: "记录饮食", desc: "M1 仅保留页面壳" },
      { title: "系统设置", desc: "账号与偏好占位区" }
    ]
  },
  goAiEntry() {
    wx.navigateTo({
      url: "/pages/ai-entry/index"
    });
  },
  handleComingSoon() {
    wx.showToast({
      title: "M1 页面骨架已就位",
      icon: "none"
    });
  }
});
