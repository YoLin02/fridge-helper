"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateLabel = formatDateLabel;
exports.getDayDiffFromToday = getDayDiffFromToday;
function formatDateLabel(date) {
    return date.replace(/-/g, ".");
}
function getDayDiffFromToday(date, today = "2026-05-20") {
    const target = new Date(`${date}T00:00:00+08:00`).getTime();
    const base = new Date(`${today}T00:00:00+08:00`).getTime();
    return Math.round((target - base) / (24 * 60 * 60 * 1000));
}
