import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StoriesPage from "./pages/StoriesPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import EmotionChoosePage from "./pages/EmotionChoosePage";
import EventChoosePage from "./pages/EventChoosePage";
import WriteEditorPage from "./pages/WriteEditorPage";
import AnalysisPage from "./pages/AnalysisPage";
import AnalysisFullPage from "./pages/AnalysisFullPage";
import AppLayout from "./layouts/AppLayout";

// 简单的登录保护：前端只做状态暂存（JWT 无状态）
// 只要 localStorage 有 token，就视为已登录
function RequireAuth() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function IndexRedirect() {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/stories" : "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 未登录页：不包 Layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* 需要登录的区域 */}
      <Route element={<RequireAuth />}>
        {/* 统一 Layout（让新页面“整合进系统”） */}
        <Route element={<AppLayout />}>
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/stories/:id/edit" element={<WriteEditorPage />} />

          <Route path="/write/emotion" element={<EmotionChoosePage />} />
          <Route path="/write/event" element={<EventChoosePage />} />
          <Route path="/write/editor" element={<WriteEditorPage />} />

          {/* 统计/分析 */}
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/analysis/full" element={<AnalysisFullPage />} />
        </Route>
      </Route>

      {/* 根路径：按 token 自动去 /stories 或 /login */}
      <Route path="/" element={<IndexRedirect />} />

      {/* 兜底：也按 token 走 */}
      <Route path="*" element={<IndexRedirect />} />
    </Routes>
  );
}
