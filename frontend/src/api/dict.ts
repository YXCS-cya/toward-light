import { http } from "./http";

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface EmotionTagVO {
  id: number;
  code: string;
  name: string;
  polarity?: string;
}

export interface EventTypeVO {
  id: number;
  code: string;
  name: string;
}

export async function getEmotionDict() {
  const resp = await http.get("/api/dict/emotions");
  return resp.data as ApiResult<EmotionTagVO[]>;
}

export async function getEventDict() {
  const resp = await http.get("/api/dict/events");
  return resp.data as ApiResult<EventTypeVO[]>;
}
