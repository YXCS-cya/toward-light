import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";

export default function LoginPage() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({ username: u, password: p });

      // 只要 token 存在就判定成功（更“演示级”稳）
      const token = res?.data?.token;
      if (!token) {
        setError(res?.message || "登录失败：未获取到 token");
        return;
      }

      localStorage.setItem("token", token);
      if (res.data.userId != null) {
        localStorage.setItem("userId", String(res.data.userId));
      }
      if (res.data.username) {
        localStorage.setItem("username", res.data.username);
      }

      nav("/stories", { replace: true });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "登录失败：请检查后端是否启动 / 账号密码是否正确";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-[36px] bg-white/90 shadow-xl shadow-black/10 px-10 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-wide text-gray-700">
            情绪叙事写作支持系统
          </h1>
          <p className="mt-3 text-gray-400">记录情感，探索自我，疗愈心灵</p>
        </div>

        <div className="my-8 h-px bg-gray-200" />

        <div className="mx-auto max-w-xl space-y-5">
          {/* 用户名 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2-8 4v2h16v-2c0-2-3.58-4-8-4Z" />
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-12 py-4 text-gray-700 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>

          {/* 密码 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3Zm-7-2a2 2 0 0 1 4 0v2h-4Z" />
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-12 py-4 text-gray-700 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
              placeholder="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            className="w-full rounded-full py-4 text-lg font-semibold text-white shadow-md shadow-orange-200/70
                       bg-gradient-to-r from-[#e6b59a] to-[#e4a98b] hover:opacity-95 active:opacity-90
                       disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <div className="my-6 h-px bg-gray-200" />

          <div className="flex items-center justify-between text-sm text-gray-500">
            <button className="hover:text-gray-700" type="button">
              忘记密码？
            </button>
            <button className="hover:text-gray-700" type="button">
              注册新账号
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
