import { addExerciseLog, addMealLog, parseCalorieDraft } from "../../services/calorie.service";
import type { MealType, ParsedMealDraft } from "../../models/calorie";
import { deductInventoryBatches, listInventoryBatchOptions } from "../../services/inventory.service";
import type { InventoryBatchOption } from "../../models/inventory";

interface SelectedInventoryItem {
  batchId: string;
  foodName: string;
  consumeQuantity: number;
  unit: string;
}

Page({
  data: {
    mode: "meal",
    date: "2026-05-20",
    mealType: "breakfast" as MealType,
    inputText: "",
    exerciseName: "",
    exerciseCalories: "120",
    durationMinutes: "30",
    parsing: false,
    saving: false,
    draft: null as ParsedMealDraft | null,
    taskId: "",
    inventoryOptions: [] as InventoryBatchOption[],
    selectedInventory: [] as SelectedInventoryItem[]
  },
  async onLoad(options: Record<string, string | undefined>) {
    this.setData({
      mode: options.mode ?? "meal",
      date: options.date ?? "2026-05-20",
      mealType: (options.mealType as MealType | undefined) ?? "breakfast"
    });

    if ((options.mode ?? "meal") === "meal") {
      await this.loadInventoryOptions();
    }
  },
  async loadInventoryOptions() {
    try {
      const inventoryOptions = await listInventoryBatchOptions();
      this.setData({
        inventoryOptions
      });
    } catch {
      return;
    }
  },
  handleInput(event: WechatMiniprogram.Input<{ field: string }>) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [field]: event.detail.value
    });
  },
  async selectInventoryItem(event: WechatMiniprogram.TouchEvent<{ batchId: string }>) {
    const target = this.data.inventoryOptions.find((item) => item.batchId === event.currentTarget.dataset.batchId);

    if (!target) {
      return;
    }

    const result = await wx.showModal({
      title: "加入饮食记录",
      content: `输入要记录的数量，默认带入当前库存 ${target.quantity}${target.unit}`,
      editable: true,
      placeholderText: `${target.quantity}`,
      confirmText: "加入"
    });

    if (!result.confirm) {
      return;
    }

    const consumeQuantity = Number(result.content || target.quantity);

    if (!consumeQuantity || consumeQuantity <= 0) {
      wx.showToast({
        title: "请输入有效数量",
        icon: "none"
      });
      return;
    }

    const selectedInventory = [
      ...this.data.selectedInventory.filter((item) => item.batchId !== target.batchId),
      {
        batchId: target.batchId,
        foodName: target.foodName,
        consumeQuantity,
        unit: target.unit
      }
    ];
    const inputText = selectedInventory.map((item) => `${item.foodName}${item.consumeQuantity}${item.unit}`).join("，");

    this.setData({
      selectedInventory,
      inputText
    });
  },
  removeSelectedInventory(event: WechatMiniprogram.TouchEvent<{ batchId: string }>) {
    const selectedInventory = this.data.selectedInventory.filter((item) => item.batchId !== event.currentTarget.dataset.batchId);
    const inputText = selectedInventory.map((item) => `${item.foodName}${item.consumeQuantity}${item.unit}`).join("，");

    this.setData({
      selectedInventory,
      inputText
    });
  },
  async handleParse() {
    this.setData({
      parsing: true
    });

    try {
      const draft = await parseCalorieDraft({
        date: this.data.date,
        mealType: this.data.mealType,
        content: this.data.inputText
      });

      this.setData({
        draft,
        taskId: draft.taskId ?? ""
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
    this.setData({
      saving: true
    });

    try {
      if (this.data.mode === "exercise") {
        await addExerciseLog({
          date: this.data.date,
          exerciseName: this.data.exerciseName,
          caloriesKcal: Number(this.data.exerciseCalories),
          durationMinutes: Number(this.data.durationMinutes)
        });
      } else {
        if (!this.data.draft) {
          throw new Error("请先解析饮食内容");
        }

        await addMealLog({
          date: this.data.date,
          mealType: this.data.mealType,
          originalText: this.data.inputText,
          taskId: this.data.taskId || undefined,
          selectedInventory: this.data.selectedInventory,
          draft: this.data.draft
        });

        if (this.data.selectedInventory.length > 0) {
          const result = await wx.showModal({
            title: "扣减库存",
            content: "本次饮食记录来自库存，是否同步扣减所选批次库存？",
            confirmText: "扣减",
            cancelText: "稍后"
          });

          if (result.confirm) {
            await deductInventoryBatches({
              items: this.data.selectedInventory.map((item) => ({
                batchId: item.batchId,
                consumeQuantity: item.consumeQuantity
              }))
            });
          }
        }
      }

      wx.showToast({
        title: "记录成功",
        icon: "success"
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "记录失败",
        icon: "none"
      });
    } finally {
      this.setData({
        saving: false
      });
    }
  }
});
