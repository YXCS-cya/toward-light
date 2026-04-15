import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmotionDict } from "../api/dict";
import type { EmotionTagVO } from "../api/dict";

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

export default function EmotionChoosePage() {
  const nav = useNavigate();
  const [list, setList] = useState<EmotionTagVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getEmotionDict();
        if (!alive) return;
        setList(res.data || []);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "加载情绪字典失败";
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
          <h1 className="text-3xl font-bold text-gray-800">今天你的心情如何？</h1>
          <p className="mt-3 text-gray-500">选择一个描述你当前感受的词语</p>
          <div className="mx-auto mt-6 h-px w-[520px] max-w-full bg-gray-300/60" />
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
              {list.map((emo) => (
                <button
                  key={emo.id}
                  type="button"
                  className="h-[70px] rounded-full bg-white/80 px-6 text-lg text-gray-700
                             shadow-[0_10px_25px_rgba(0,0,0,0.06)]
                             hover:bg-white transition active:scale-[0.98]"
                  onClick={() => {
                    // 暂存：emotionId（保存用）+ emotionCode（guide 规则用）
                    setDraft({
                      emotionId: emo.id,
                      emotionCode: emo.code,
                      // 进入新写作流程时，清空后续选择
                      eventId: undefined,
                      eventCode: undefined,
                    });
                    nav("/write/event");
                  }}
                >
                  {emo.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center gap-4">
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
