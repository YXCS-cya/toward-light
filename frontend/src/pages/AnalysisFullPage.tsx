import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmotionStats, getEventStats } from "../api/analytics";
import Pie from "../components/Pie";

type Stat = { name: string; count: number };
const normalize = (list: any[]): Stat[] =>
  (list || []).map((x) => ({
    name: x.name ?? x.label ?? x.emotionName ?? x.eventName ?? "未知",
    count: Number(x.count ?? x.cnt ?? x.times ?? 0),
  }));

export default function AnalysisFullPage() {
  const nav = useNavigate();
  const [emotions, setEmotions] = useState<Stat[]>([]);
  const [events, setEvents] = useState<Stat[]>([]);
  const [err, setErr] = useState("");

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

  return (
    <div className="min-h-screen bg-[#f6f4f5]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">统计与分析</h1>
          <button
            className="rounded-full px-4 py-2 bg-white/80 border border-white shadow"
            onClick={() => nav("/analysis")}
          >
            返回
          </button>
        </div>

        {err && (
          <div className="mt-6 rounded-xl bg-red-50 text-red-600 px-4 py-3">
            {err}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-8">
          <Pie title="情绪分布（饼图）" items={emotions} />
          <Pie title="事件分布（饼图）" items={events} />
        </div>

        <div className="mt-8 bg-white/70 rounded-3xl border border-white shadow-xl shadow-black/5 p-6 text-slate-600 leading-7">
          <div className="font-semibold text-slate-800 mb-2">说明</div>
          <ul className="list-disc pl-5">
            <li>当前课设阶段仅展示描述性统计（频次分布），不输出诊断结论。</li>
            <li>
              系统已实现「情绪 × 事件」二维交叉统计接口（用于更细粒度检索），但考虑后续将升级为 AI
              智能分析模块，课设版本暂不在前端提供入口。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
