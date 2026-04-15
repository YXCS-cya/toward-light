import { http } from "./http";

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface GuideCardVO {
  title: string;
  questions: string[];
}

export interface GuideResponseVO {
  mode: string;
  version: string;
  source: string;
  cards: GuideCardVO[];
}

//  使用 Apifox 里验证通过的接口
export async function getGuide(emotionCode: string, eventCode: string) {
  const resp = await http.get("/api/guide/questions", {
    params: { emotionCode, eventCode },
  });

  const result = resp.data as ApiResult<GuideResponseVO>;

  //  只把 cards 抛给页面
  return {
    ...result,
    data: result.data?.cards ?? [],
  };
}
