import { http } from "./http";

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  total: number;
  page: number;
  size: number;
  list: T[];
}

export interface StoryListItemVO {
  id: number;
  title: string;
  emotionTagId: number;
  eventTypeId: number;
  createdAt: string;
}

export interface StoryDetailVO {
  id: number;
  title: string;
  content: string;
  emotionTagId: number;
  eventTypeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SemanticSearchReq {
  query: string;
  topK?: number;
  maxDistance?: number;
}

export async function getStories(page = 1, size = 10) {
  const resp = await http.get("/api/stories", {
    params: { page, size },
  });
  return resp.data as ApiResult<PageResult<StoryListItemVO>>;
}

export async function getStoryDetail(id: number) {
  const resp = await http.get(`/api/stories/${id}`);
  return resp.data as ApiResult<StoryDetailVO>;
}

export async function semanticSearchStories(req: SemanticSearchReq) {
  const resp = await http.post("/api/stories/semantic-search", req);
  return resp.data as ApiResult<StoryListItemVO[]>;
}

export async function deleteStory(id: number) {
  const resp = await http.delete(`/api/stories/${id}`);
  return resp.data as ApiResult<null>;
}
// 非流式 AI 分析（兜底）
export async function getStoryAiAnalysis(id: number) {
  const resp = await http.get(`/api/stories/${id}/ai-analysis`);
  return resp.data as ApiResult<string>;
}
// 流式 AI 分析
export async function fetchStoryAiAnalysisStream(
  id: number,
  onMessage: (text: string) => void
) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("未登录或 token 不存在");
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  if (!baseURL) {
    throw new Error("未配置 VITE_API_BASE_URL");
  }

  const res = await fetch(`${baseURL}/api/stories/${id}/ai-analysis/stream`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`流式请求失败：HTTP ${res.status} ${errorText}`);
  }

  if (!res.body) {
    throw new Error("浏览器不支持流式响应");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let pendingText = "";
  let displayText = "";
  let pendingFlush = false;

  const flush = () => {
    if (pendingFlush) return;
    pendingFlush = true;

    setTimeout(() => {
      if (pendingText) {
        displayText += pendingText;
        pendingText = "";
        onMessage(displayText);
      }
      pendingFlush = false;
    }, 40);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("data:")) {
        const text = line.slice(5).trimStart();

        if (text === "[DONE]") {
          if (pendingText) {
            displayText += pendingText;
            pendingText = "";
            onMessage(displayText);
          }
          return displayText;
        }

        pendingText += text;
        flush();
      }
    }
  }

  if (pendingText) {
    displayText += pendingText;
    onMessage(displayText);
  }

  return displayText;
}