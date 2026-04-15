import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmotionDict, getEventDict } from "../api/dict";
import {
  deleteStory,
  fetchStoryAiAnalysisStream,
  getStoryAiAnalysis,
  getStoryDetail,
} from "../api/stories";
import type { StoryDetailVO } from "../api/stories";

export default function StoryDetailPage() {
  const { id } = useParams();
  const storyId = Number(id);
  const nav = useNavigate();

  const [detail, setDetail] = useState<StoryDetailVO | null>(null);
  const [emotionName, setEmotionName] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState("");
  const [aiAnalysisError, setAiAnalysisError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!storyId || Number.isNaN(storyId)) {
        setError("无效的故事ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [detailRes, emoRes, evtRes] = await Promise.all([
          getStoryDetail(storyId),
          getEmotionDict(),
          getEventDict(),
        ]);

        const d = detailRes?.data;
        if (!d) throw new Error("详情为空");

        const emoMap = new Map<number, string>(
          (emoRes?.data ?? []).map((x) => [x.id, x.name])
        );
        const evtMap = new Map<number, string>(
          (evtRes?.data ?? []).map((x) => [x.id, x.name])
        );

        if (!alive) return;

        setDetail(d);
        setEmotionName(emoMap.get(d.emotionTagId) ?? `#${d.emotionTagId}`);
        setEventName(evtMap.get(d.eventTypeId) ?? `#${d.eventTypeId}`);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "加载失败：请检查后端是否启动 / token 是否存在";
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [storyId]);

  async function handleDelete() {
    if (!storyId || Number.isNaN(storyId)) return;

    const ok = window.confirm("确认删除这条记录吗？删除后将无法在列表中看到它。");
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await deleteStory(storyId);
      if (res.code !== 0) {
        throw new Error(res.message || "删除失败");
      }
      nav("/stories", { replace: true });
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "删除失败");
    } finally {
      setDeleting(false);
    }
  }

  async function handleAiAnalysis() {
    if (!storyId || Number.isNaN(storyId)) return;

    setShowAiAnalysis(true);
    setAiAnalysisError("");
    setAiAnalysisText("");
    setAiAnalyzing(true);

    try {
      await fetchStoryAiAnalysisStream(storyId, (text) => {
        setAiAnalysisText(text);
      });
    } catch (streamError: any) {
      // 流式失败时，自动降级走非流式
      try {
        const res = await getStoryAiAnalysis(storyId);

        if (res.code !== 0) {
          throw new Error(res.message || "分析失败");
        }

        setAiAnalysisText(
          res.data || "本次分析已完成，但暂未返回可展示内容。"
        );
      } catch (fallbackError: any) {
        setAiAnalysisError(
          fallbackError?.response?.data?.message ||
            fallbackError?.message ||
            streamError?.message ||
            "本次分析暂未完成，请稍后重试。"
        );
      }
    } finally {
      setAiAnalyzing(false);
    }
  }

  const headerRight = useMemo(() => {
    return (
      <div className="flex items-center gap-3">
        <button
          className="rounded-full bg-white px-5 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
          onClick={() => nav("/stories")}
        >
          返回列表
        </button>

        <button
          className="rounded-full bg-[#f6e7de] px-5 py-2 text-sm text-[#9f5f43] shadow hover:bg-[#f2ddd1] disabled:opacity-60"
          onClick={handleAiAnalysis}
          disabled={aiAnalyzing}
        >
          {aiAnalyzing ? "分析中..." : "AI分析"}
        </button>

        <button
          className="rounded-full bg-white px-5 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
          onClick={() => nav(`/stories/${storyId}/edit`)}
        >
          编辑
        </button>

        <button
          className="rounded-full bg-red-50 px-5 py-2 text-sm text-red-600 shadow hover:bg-red-100 disabled:opacity-60"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "删除中..." : "删除"}
        </button>
      </div>
    );
  }, [nav, storyId, deleting, aiAnalyzing]);

  return (
    <div className="min-h-screen bg-[#f3f1f4] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">故事详情</h1>
            <p className="mt-1 text-sm text-gray-500">查看、编辑或删除情绪叙事内容</p>
          </div>
          {headerRight}
        </div>

        <div className="mt-8">
          {loading && (
            <div className="rounded-3xl bg-white/75 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="text-sm text-gray-500">加载中...</div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && detail && (
            <>
              {/* AI 分析区域 */}
              {showAiAnalysis && (
                <div className="mb-6 rounded-3xl bg-white/75 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                  <div className="text-lg font-semibold text-gray-800">
                    向光-AI分析
                  </div>

                  <div className="mt-2 text-xs leading-6 text-gray-400">
                    该分析仅在你点击时生成，用于帮助你回看和整理情绪表达，不会保存分析结论。
                    向光时刻守护您的情绪安全
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#fcfaf8] px-5 py-4 text-[15px] leading-7 text-gray-700 min-h-[120px] whitespace-pre-wrap">
                    {aiAnalyzing && !aiAnalysisText && (
                      <span className="text-[#b26b4f]">
                        正在为你探索这段记录中潜藏的光，请稍等片刻……
                      </span>
                    )}

                    {!aiAnalyzing && aiAnalysisError && (
                      <span className="text-red-500">{aiAnalysisError}</span>
                    )}

                    {!!aiAnalysisText && <span>{aiAnalysisText}</span>}
                  </div>
                </div>
              )}

              {/* 正文卡片 */}
              <div className="rounded-3xl bg-white/75 p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-2xl font-semibold text-gray-800">
                      {detail.title || "未命名记录"}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      创建时间：{detail.createdAt}
                      {detail.updatedAt ? ` ｜ 更新时间：${detail.updatedAt}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#f2d1bd] px-4 py-2 text-sm text-gray-700 shadow-sm">
                      {emotionName}
                    </span>
                    <span className="rounded-full bg-[#e9ecef] px-4 py-2 text-sm text-gray-700 shadow-sm">
                      {eventName}
                    </span>
                  </div>
                </div>

                <div className="mt-8 whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
                  {detail.content || "（无正文内容）"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}