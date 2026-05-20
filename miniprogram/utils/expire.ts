import { getDayDiffFromToday } from "./date";

export type ExpireViewState = "normal" | "warning" | "today" | "expired";

export interface ExpireDisplay {
  text: string;
  state: ExpireViewState;
}

export function getExpireDisplay(expireDate: string): ExpireDisplay {
  const diff = getDayDiffFromToday(expireDate);

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
