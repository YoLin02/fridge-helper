"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calorie_service_1 = require("../../services/calorie.service");
const calorie_1 = require("../../utils/calorie");
Page({
    data: {
        genderOptions: [
            { label: "男", value: "male" },
            { label: "女", value: "female" }
        ],
        goalOptions: [
            { label: "维持", value: "maintain" },
            { label: "轻减脂", value: "fat_loss_light" },
            { label: "标准减脂", value: "fat_loss" },
            { label: "增肌", value: "muscle_gain" }
        ],
        activityOptions: [
            { label: "久坐", value: "sedentary" },
            { label: "轻度", value: "light" },
            { label: "中度", value: "moderate" },
            { label: "高活动", value: "high" }
        ],
        form: {
            gender: "male",
            birthday: "1995-01-01",
            heightCm: "175",
            weightKg: "70",
            targetWeightKg: "65",
            goal: "fat_loss",
            activityLevel: "light"
        },
        preview: null,
        saving: false
    },
    onLoad() {
        this.refreshPreview();
    },
    handleInput(event) {
        const { field } = event.currentTarget.dataset;
        this.setData({
            [`form.${field}`]: event.detail.value
        });
        this.refreshPreview();
    },
    handleSelect(event) {
        const { field, value } = event.currentTarget.dataset;
        this.setData({
            [`form.${field}`]: value
        });
        this.refreshPreview();
    },
    refreshPreview() {
        const preview = (0, calorie_1.calculateUserTargets)({
            gender: this.data.form.gender,
            birthday: this.data.form.birthday,
            heightCm: Number(this.data.form.heightCm),
            weightKg: Number(this.data.form.weightKg),
            targetWeightKg: Number(this.data.form.targetWeightKg),
            goal: this.data.form.goal,
            activityLevel: this.data.form.activityLevel
        });
        this.setData({
            preview
        });
    },
    async handleSave() {
        this.setData({
            saving: true
        });
        try {
            await (0, calorie_service_1.setUserProfile)({
                gender: this.data.form.gender,
                birthday: this.data.form.birthday,
                heightCm: Number(this.data.form.heightCm),
                weightKg: Number(this.data.form.weightKg),
                targetWeightKg: Number(this.data.form.targetWeightKg),
                goal: this.data.form.goal,
                activityLevel: this.data.form.activityLevel
            });
            wx.showToast({
                title: "目标已保存",
                icon: "success"
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 500);
        }
        catch (error) {
            wx.showToast({
                title: error instanceof Error ? error.message : "保存失败",
                icon: "none"
            });
        }
        finally {
            this.setData({
                saving: false
            });
        }
    }
});
