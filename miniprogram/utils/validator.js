"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDraftItem = validateDraftItem;
function validateDraftItem(item) {
    const errors = [];
    if (!item.foodName.trim()) {
        errors.push("食材名称不能为空");
    }
    if (item.quantity <= 0) {
        errors.push("数量必须大于 0");
    }
    if (!item.unit.trim()) {
        errors.push("单位不能为空");
    }
    if (!item.expireDate.trim()) {
        errors.push("到期日期不能为空");
    }
    return errors;
}
