Page({
  data: {
    filters: ["全部", "临期", "已过期"],
    activeFilter: "全部",
    inventoryStats: [
      { title: "全部食材", value: "128", label: "当前库存", hint: "按批次管理" },
      { title: "临期食材", value: "8", label: "重点处理", hint: "优先消费" }
    ],
    items: [
      {
        name: "鸡蛋",
        category: "蛋奶类",
        quantity: "12 个",
        storage: "冷藏",
        expire: "2026-05-26 到期",
        status: "还有 6 天"
      },
      {
        name: "鸡胸肉",
        category: "肉类",
        quantity: "500 g",
        storage: "冷藏",
        expire: "2026-05-22 到期",
        status: "还有 2 天"
      },
      {
        name: "上海青",
        category: "蔬菜类",
        quantity: "1 斤",
        storage: "冷藏",
        expire: "2026-05-20 到期",
        status: "今日到期"
      }
    ]
  },
  switchFilter(event: WechatMiniprogram.TouchEvent<{ value: string }>) {
    const { value } = event.currentTarget.dataset;

    this.setData({
      activeFilter: value
    });
  }
});
