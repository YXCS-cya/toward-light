import { http } from "./http";

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface StatItem {
  name: string;   // 展示用
  count: number;  // 次数
}

export async function getEmotionStats() {
  const resp = await http.get("/api/analytics/emotions");
  return resp.data as ApiResult<any>;
}

export async function getEventStats() {
  const resp = await http.get("/api/analytics/events");
  return resp.data as ApiResult<any>;
}
