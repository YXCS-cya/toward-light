type Props = {
  label: string;
  count: number;
  max: number;
  tone?: "warm" | "cool";
};

export default function StatRow({ label, count, max, tone = "warm" }: Props) {
  const pct = max <= 0 ? 0 : Math.round((count / max) * 100);
  const bar =
    tone === "warm"
      ? "from-[#f0c3ab] to-[#e8aa8a]"
      : "from-[#b8cfe3] to-[#8fb3d6]";

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-16 text-slate-700">{label}</div>

      <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-4 rounded-full bg-gradient-to-r ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="w-12 text-right text-slate-700">{count}次</div>
    </div>
  );
}
