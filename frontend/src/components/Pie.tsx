type Item = { name: string; count: number };

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export default function Pie({ title, items }: { title: string; items: Item[] }) {
  const total = items.reduce((s, x) => s + x.count, 0);
  const top = items.slice(0, 6); // 展示前 6 个

  // 简单拼接 conic-gradient；不用指定颜色也行，但这里给一个温柔配色循环
  const palette = ["#e8aa8a", "#f0c3ab", "#b8cfe3", "#8fb3d6", "#d7d3e5", "#c9e4d6"];
  let acc = 0;
  const stops = top.map((x, i) => {
    const p = total ? (x.count / total) * 100 : 0;
    const start = acc;
    acc += p;
    return `${palette[i % palette.length]} ${start}% ${acc}%`;
  });
  const bg = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="bg-white/70 rounded-3xl border border-white shadow-xl shadow-black/5 p-8">
      <div className="text-lg font-semibold text-slate-800">{title}</div>
      <div className="mt-6 flex gap-8 items-center">
        <div
          className="w-44 h-44 rounded-full"
          style={{ background: total ? bg : "#f1f5f9" }}
        />
        <div className="flex-1 space-y-2">
          {top.map((x, i) => (
            <div key={x.name} className="flex justify-between text-slate-700">
              <span>{x.name}</span>
              <span className="text-slate-500">
                {x.count} 次（{pct(x.count, total)}%）
              </span>
            </div>
          ))}
          {!total && <div className="text-slate-400">暂无数据</div>}
        </div>
      </div>
    </div>
  );
}
