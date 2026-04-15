import { http } from "./http";

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface SaveStoryReq {
  title?: string;
  content: string;
  emotionTagId: number;
  eventTypeId: number;
}

export async function createStory(req: SaveStoryReq) {
  const resp = await http.post("/api/stories", req);
  return resp.data as ApiResult<number>;
}

export async function updateStory(id: number, req: SaveStoryReq) {
  const resp = await http.put(`/api/stories/${id}`, req);
  return resp.data as ApiResult<null>;
}