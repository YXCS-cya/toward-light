import { http } from "./http";

export interface LoginReq {
  username: string;
  password: string;
}

export interface LoginResp {
  token: string;
  userId?: number;
  username?: string;
}

// 适配后端统一返回：{ code, message, data }
export async function loginApi(payload: LoginReq) {
  const resp = await http.post("/auth/login", payload);
  return resp.data as { code: number; message: string; data: LoginResp };
}
