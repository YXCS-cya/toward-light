import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatRow from "../components/StatRow";
import { getEmotionStats, getEventStats } from "../api/analytics";

type Stat = { name: string; count: number };

function normalize(list: any[]): Stat[] {
  //  如果你后端字段不是 name/count，就在这里改映射
  return (list || []).map((x) => ({
    name: x.name ?? x.label ?? x.emotionName ?? x.eventName ?? "未知",
    count: Number(x.count ?? x.cnt ?? x.times ?? 0),
  }));
}

export default function AnalysisPage() {
  const nav = useNavigate();
  const [emotions, setEmotions] = useState<Stat[]>([]);
  const [events, setEvents] = useState<Stat[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const [e1, e2] = await Promise.all([getEmotionStats(), getEventStats()]);
        if (e1.code !== 0) throw new Error(e1.message || "情绪统计失败");
        if (e2.code !== 0) throw new Error(e2.message || "事件统计失败");
        setEmotions(normalize(e1.data));
        setEvents(normalize(e2.data));
      } catch (e: any) {
        setErr(e?.message || "加载失败");
      }
    })();
  }, []);

  const emoMax = useMemo(() => Math.max(0, ...emotions.map((x) => x.count)), [emotions]);
  const evtMax = useMemo(() => Math.max(0, ...events.map((x) => x.count)), [events]);

  return (
    <div className="min-h-screen bg-[#f6f4f5]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-800 text-center">情绪与事件统计</h1>
        <p className="text-center text-slate-500 mt-2">了解最近的情绪概况和生活事件记录</p>

        <div className="mt-8 bg-white/70 rounded-[32px] shadow-xl shadow-black/5 border border-white p-10">
          {err && (
            <div className="mb-6 rounded-xl bg-red-50 text-red-600 px-4 py-3">
              {err}
            </div>
          )}

          <div className="grid grid-cols-2 gap-10">
            <div>
              <div className="text-xl font-semibold text-slate-800">情绪统计</div>
              <div className="text-slate-500 mt-2">了解最近更细致的情绪波动</div>

              <div className="mt-6">
                {emotions.slice(0, 5).map((it) => (
                  <StatRow
                    key={it.name}
                    label={it.name}
                    count={it.count}
                    max={emoMax}
                    tone="warm"
                  />
                ))}
              </div>

              <button
                className="mt-6 text-slate-600 hover:text-slate-800"
                onClick={() => nav("/analysis/full")}
              >
                查看全部情绪分析 →
              </button>
            </div>

            <div className="border-l border-slate-200 pl-10">
              <div className="text-xl font-semibold text-slate-800">事件统计</div>
              <div className="text-slate-500 mt-2">了解最近事件发展的记录</div>

              <div className="mt-6">
                {events.slice(0, 5).map((it) => (
                  <StatRow
                    key={it.name}
                    label={it.name}
                    count={it.count}
                    max={evtMax}
                    tone="cool"
                  />
                ))}
              </div>

              <button
                className="mt-6 text-slate-600 hover:text-slate-800"
                onClick={() => nav("/analysis/full")}
              >
                查看全部事件记录 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
