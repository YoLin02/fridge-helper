"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpireDisplay = getExpireDisplay;
const date_1 = require("./date");
function getExpireDisplay(expireDate) {
    const diff = (0, date_1.getDayDiffFromToday)(expireDate);
    if (diff < 0) {
        return {
            text: `已过期 ${Math.abs(diff)} 天`,
            state: "expired"
        };
    }
    if (diff === 0) {
        return {
            text: "今日到期",
            state: "today"
        };
    }
    if (diff <= 3) {
        return {
            text: `还有 ${diff} 天`,
            state: "warning"
        };
    }
    return {
        text: `还有 ${diff} 天`,
        state: "normal"
    };
}
