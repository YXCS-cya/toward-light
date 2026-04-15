import { Outlet, useLocation, useNavigate } from "react-router-dom";

function clearAuth() {
  localStorage.removeItem("token");
}

export default function AppLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const go = (path: string) => () => nav(path);

  const active = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const NavBtn = (props: { path: string; label: string }) => (
    <button
      onClick={go(props.path)}
      className={[
        "px-4 py-2 rounded-xl text-sm shadow-sm border",
        active(props.path)
          ? "bg-[#f2c3a7] text-white border-transparent"
          : "bg-white text-slate-700 border-slate-100",
      ].join(" ")}
    >
      {props.label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f5f4f2]">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xl font-semibold text-slate-800">
              向光
            </div>
            <div className="text-sm text-slate-500 mt-1">
              坚持向光而行的人，终将成为耀眼的存在
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavBtn path="/stories" label="故事" />
            <NavBtn path="/write/emotion" label="写作" />
            <NavBtn path="/analysis" label="统计" />

            <button
              className="px-4 py-2 rounded-xl text-sm shadow-sm bg-white border border-slate-100"
              onClick={() => {
                clearAuth();
                nav("/login", { replace: true });
              }}
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 页面内容 */}
        <Outlet />
      </div>
    </div>
  );
}
