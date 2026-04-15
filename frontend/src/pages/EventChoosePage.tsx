import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEventDict } from "../api/dict";
import type { EventTypeVO } from "../api/dict";

type WriteDraft = {
  emotionId?: number;
  emotionCode?: string;
  eventId?: number;
  eventCode?: string;
};

function getDraft(): WriteDraft {
  try {
    return JSON.parse(sessionStorage.getItem("writeDraft") || "{}");
  } catch {
    return {};
  }
}
function setDraft(patch: Partial<WriteDraft>) {
  const cur = getDraft();
  sessionStorage.setItem("writeDraft", JSON.stringify({ ...cur, ...patch }));
}

// 演示：给不同事件配个 emoji（后面你想换成 svg/png 再说）
function pickEmoji(name: string) {
  if (name.includes("家庭")) return "🏠";
  if (name.includes("旅行") || name.includes("旅游")) return "✈️";
  if (name.includes("关系") || name.includes("感情")) return "💞";
  if (name.includes("聚会") || name.includes("生日")) return "🎂";
  if (name.includes("美食") || name.includes("食物")) return "🍔";
  if (name.includes("音乐")) return "🎵";
  if (name.includes("工作")) return "💼";
  if (name.includes("学习")) return "📖";
  return "🪄";
}

export default function EventChoosePage() {
  const nav = useNavigate();
  const draft = useMemo(() => getDraft(), []);

  const [list, setList] = useState<EventTypeVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 如果没选情绪就进来，直接拦回
  useEffect(() => {
    const d = getDraft();
    if (!d.emotionId || !d.emotionCode) {
      nav("/write/emotion", { replace: true });
    }
  }, [nav]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getEventDict();
        if (!alive) return;
        setList(res.data || []);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "加载事件字典失败";
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f1f4] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">请选择您的生活事件类型</h1>
          <p className="mt-3 text-gray-500">选择一个与你今天经历的生活事件相关的类别</p>
          <div className="mx-auto mt-6 h-px w-[620px] max-w-full bg-gray-300/60" />
        </div>

        <div className="mt-10">
          {loading && (
            <div className="rounded-3xl bg-white/70 p-8 text-sm text-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              加载中...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {list.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  className="h-[140px] rounded-[28px] bg-white/80 p-5 text-gray-700
                             shadow-[0_10px_25px_rgba(0,0,0,0.06)]
                             hover:bg-white transition active:scale-[0.98]"
                  onClick={() => {
                    setDraft({
                      eventId: ev.id,
                      eventCode: ev.code,
                    });
                    nav("/write/editor");
                  }}
                >
                  <div className="mt-2 text-4xl">{pickEmoji(ev.name)}</div>
                  <div className="mt-4 text-lg font-semibold">{ev.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <button
            className="rounded-full bg-white px-6 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
            onClick={() => nav("/write/emotion")}
          >
            返回上一步
          </button>

          <button
            className="rounded-full bg-white px-6 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
            onClick={() => nav("/stories")}
          >
            返回列表
          </button>
        </div>
      </div>
    </div>
  );
}
