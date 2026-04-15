import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmotionDict, getEventDict } from "../api/dict";
import { getStories, semanticSearchStories } from "../api/stories";
import type { StoryListItemVO } from "../api/stories";

type StoryItem = {
  id: number;
  title: string;
  createdAt: string;
  emotionName?: string;
  eventName?: string;
};

// 之后想调“检索严格程度”，改这里就行
const SEARCH_TOP_K = 5;
const SEARCH_MAX_DISTANCE = 1.0;

// 普通列表分页大小
const PAGE_SIZE = 10;

export default function StoriesPage() {
  const nav = useNavigate();

  const [items, setItems] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function mapStories(list: StoryListItemVO[]) {
    const [emoRes, evtRes] = await Promise.all([
      getEmotionDict(),
      getEventDict(),
    ]);

    const emoMap = new Map<number, string>(
      (emoRes?.data ?? []).map((x) => [x.id, x.name])
    );
    const evtMap = new Map<number, string>(
      (evtRes?.data ?? []).map((x) => [x.id, x.name])
    );

    const mapped: StoryItem[] = list.map((s) => ({
      id: s.id,
      title: s.title || "未命名记录",
      createdAt: s.createdAt,
      emotionName: emoMap.get(s.emotionTagId) ?? `#${s.emotionTagId}`,
      eventName: evtMap.get(s.eventTypeId) ?? `#${s.eventTypeId}`,
    }));

    setItems(mapped);
  }

  async function loadDefaultList(targetPage = page) {
    setLoading(true);
    setError("");

    try {
      const storyRes = await getStories(targetPage, PAGE_SIZE);
      const pageData = storyRes?.data;

      const storyList = pageData?.list ?? [];
      setTotal(pageData?.total ?? 0);

      await mapStories(storyList);
      setIsSearchMode(false);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "加载失败：请检查后端是否启动 / token 是否存在";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSemanticSearch() {
    const q = query.trim();
    if (!q) {
      setError("请输入想查找的内容");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const res = await semanticSearchStories({
        query: q,
        topK: SEARCH_TOP_K,
        maxDistance: SEARCH_MAX_DISTANCE,
      });

      if (res.code !== 0) {
        throw new Error(res.message || "语义检索失败");
      }

      await mapStories(res.data ?? []);
      setIsSearchMode(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "语义检索失败，请检查 AI 服务是否启动";
      setError(msg);
    } finally {
      setSearching(false);
    }
  }

  async function handleReset() {
    setQuery("");
    setPage(1);
    await loadDefaultList(1);
  }

  useEffect(() => {
    if (isSearchMode) return;
    loadDefaultList(page);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* 顶部栏 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">故事记录</h1>
            <p className="mt-1 text-sm text-gray-500">
              展示你保存的情绪叙事记录，也支持自然语言语义检索
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-full bg-white px-5 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
              onClick={() => nav("/analysis")}
            >
              查看统计
            </button>
            <button
              className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow
                         bg-gradient-to-r from-[#e6b59a] to-[#e4a98b] hover:opacity-95 active:opacity-90"
              onClick={() => nav("/write/emotion")}
            >
              开始写作
            </button>
          </div>
        </div>

        {/* 语义检索区 */}
        <div className="mt-6 rounded-3xl bg-white/75 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="text-base font-semibold text-gray-800">语义检索</div>
          <p className="mt-1 text-sm text-gray-500">
            例如：查找最近一次因为学业而难过的记录
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none
                         focus:ring-2 focus:ring-[#e6b59a]/40"
              placeholder="输入你想查找的自然语言描述"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSemanticSearch();
              }}
            />

            <button
              className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow
                         bg-gradient-to-r from-[#e6b59a] to-[#e4a98b] hover:opacity-95 active:opacity-90
                         disabled:opacity-60"
              onClick={handleSemanticSearch}
              disabled={searching}
            >
              {searching ? "检索中..." : "语义检索"}
            </button>

            <button
              className="rounded-2xl bg-white px-5 py-3 text-sm text-gray-700 shadow hover:bg-gray-50"
              onClick={handleReset}
            >
              清空并查看全部
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            当前检索参数：topK={SEARCH_TOP_K}，maxDistance={SEARCH_MAX_DISTANCE}
          </div>

          {isSearchMode && !error && (
            <div className="mt-3 text-sm text-[#b26b4f]">
              当前显示的是语义检索结果
            </div>
          )}
        </div>

        {/* 状态区 */}
        <div className="mt-6">
          {loading && (
            <div className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow shadow-black/5">
              加载中...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow shadow-black/5">
              {isSearchMode
                ? "没有找到语义相近的记录，可以换个描述再试试。"
                : "暂无记录。点击右上角「开始写作」创建第一条吧～"}
            </div>
          )}
        </div>

        {/* 列表 */}
        {!loading && !error && items.length > 0 && (
          <div className="mt-8 space-y-5">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => nav(`/stories/${it.id}`)}
                className="group w-full text-left flex items-center justify-between rounded-[28px] bg-white/70 px-8 py-6
                           shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur
                           hover:bg-white/80 transition focus:outline-none focus:ring-2 focus:ring-[#e6b59a]/50"
              >
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-gray-800">
                    {it.title}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">{it.createdAt}</div>
                </div>

                <div className="ml-6 flex shrink-0 items-center gap-3">
                  <span className="rounded-full bg-[#f2d1bd] px-4 py-2 text-sm text-gray-700 shadow-sm">
                    {it.emotionName ?? "情绪"}
                  </span>
                  <span className="rounded-full bg-[#e9ecef] px-4 py-2 text-sm text-gray-700 shadow-sm">
                    {it.eventName ?? "事件"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 分页：仅普通列表模式展示 */}
        {!loading && !error && !isSearchMode && total > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              className="rounded-full bg-white px-5 py-2 text-sm text-gray-700 shadow hover:bg-gray-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </button>

            <div className="text-sm text-gray-500">
              第 {page} 页 / 共 {totalPages} 页（共 {total} 条）
            </div>

            <button
              className="rounded-full bg-white px-5 py-2 text-sm text-gray-700 shadow hover:bg-gray-50 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              下一页
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          说明：普通列表来自 /api/stories；语义检索来自 /api/stories/semantic-search。
        </div>
      </div>
    </div>
  );
}