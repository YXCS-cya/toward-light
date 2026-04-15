import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGuide } from "../api/guide";
import type { GuideCardVO } from "../api/guide";
import { createStory, updateStory } from "../api/story";
import { getStoryDetail } from "../api/stories";

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

export default function WriteEditorPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;
  const storyId = Number(id);

  const [guide, setGuide] = useState<GuideCardVO[]>([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [emotionTagId, setEmotionTagId] = useState<number | undefined>(undefined);
  const [eventTypeId, setEventTypeId] = useState<number | undefined>(undefined);

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  // 新建模式：没有草稿就拦回去
  useEffect(() => {
    if (isEdit) return;

    const d = getDraft();
    if (!d.emotionId || !d.eventId || !d.emotionCode || !d.eventCode) {
      nav("/write/emotion", { replace: true });
    }
  }, [isEdit, nav]);

  // 编辑模式：加载已有详情并回填
  useEffect(() => {
    if (!isEdit) return;
    if (!storyId || Number.isNaN(storyId)) {
      alert("无效的故事ID");
      nav("/stories", { replace: true });
      return;
    }

    let alive = true;

    async function loadDetail() {
      setLoadingDetail(true);
      try {
        const res = await getStoryDetail(storyId);
        if (!alive) return;

        if (res.code !== 0 || !res.data) {
          alert(res.message || "加载故事详情失败");
          nav("/stories", { replace: true });
          return;
        }

        const d = res.data;
        setTitle(d.title || "");
        setContent(d.content || "");
        setEmotionTagId(d.emotionTagId);
        setEventTypeId(d.eventTypeId);
      } catch (e: any) {
        if (!alive) return;
        alert(e?.response?.data?.message || e?.message || "加载故事详情失败");
        nav("/stories", { replace: true });
      } finally {
        if (alive) setLoadingDetail(false);
      }
    }

    loadDetail();

    return () => {
      alive = false;
    };
  }, [isEdit, storyId, nav]);

  // 新建模式：拉引导问题
  useEffect(() => {
    if (isEdit) return;

    let alive = true;

    async function loadGuide() {
      const d = getDraft();
      if (!d.emotionCode || !d.eventCode) return;

      setGuideLoading(true);
      setGuideError("");

      try {
        const res = await getGuide(d.emotionCode, d.eventCode);
        if (!alive) return;
        setGuide(res.data || []);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "加载引导问题失败（可先忽略继续写作）";
        if (alive) setGuideError(msg);
      } finally {
        if (alive) setGuideLoading(false);
      }
    }

    loadGuide();

    return () => {
      alive = false;
    };
  }, [isEdit]);

  async function handleSave() {
    if (!content.trim()) return;

    setSaving(true);

    try {
      if (isEdit) {
        if (!storyId || Number.isNaN(storyId)) {
          alert("无效的故事ID");
          return;
        }
        if (!emotionTagId || !eventTypeId) {
          alert("原故事的情绪或事件信息缺失，无法更新");
          return;
        }

        const res = await updateStory(storyId, {
          title: title.trim() || undefined,
          content: content.trim(),
          emotionTagId,
          eventTypeId,
        });

        if (res.code !== 0) {
          alert(res.message || "更新失败");
          return;
        }

        nav(`/stories/${storyId}`);
      } else {
        const draft = getDraft();

        if (!draft.emotionId || !draft.eventId) {
          alert("情绪或事件信息缺失，请重新选择");
          return;
        }

        const res = await createStory({
          title: title.trim() || undefined,
          content: content.trim(),
          emotionTagId: draft.emotionId,
          eventTypeId: draft.eventId,
        });

        if (res.code !== 0) {
          alert(res.message || "保存失败");
          return;
        }

        sessionStorage.removeItem("writeDraft");
        nav("/stories");
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "网络异常，保存失败");
    } finally {
      setSaving(false);
    }
  }

  const pageTitle = isEdit ? "编辑故事" : "书写你的故事";
  const pageDesc = isEdit
    ? "你可以修改这条已保存的情绪叙事内容"
    : "情绪与事件已选择（演示版：草稿暂存在前端）";

  const backAction = () => {
    if (isEdit) {
      nav(`/stories/${storyId}`);
    } else {
      nav("/write/event");
    }
  };

  if (isEdit && loadingDetail) {
    return (
      <div className="min-h-screen bg-[#f3f1f4] px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white/75 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="text-sm text-gray-500">正在加载故事内容...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1f4] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* 顶部栏 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{pageDesc}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-full bg-white px-6 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
              onClick={backAction}
            >
              {isEdit ? "返回详情" : "返回上一步"}
            </button>
            <button
              className="rounded-full bg-white px-6 py-2 text-sm text-gray-700 shadow hover:bg-gray-50"
              onClick={() => nav("/stories")}
            >
              暂不保存返回
            </button>
          </div>
        </div>

        {/* Guide cards：仅新建模式展示 */}
        {!isEdit && (
          <div className="mt-8">
            {guideLoading && (
              <div className="rounded-3xl bg-white/70 p-6 text-sm text-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                正在加载写作引导...
              </div>
            )}

            {!guideLoading && guideError && (
              <div className="rounded-3xl bg-yellow-50 p-6 text-sm text-yellow-800">
                {guideError}
              </div>
            )}

            {!guideLoading && !guideError && guide.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {guide.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl bg-white/75 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="text-lg font-semibold text-gray-800">
                      {card.title}
                    </div>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-700">
                      {(card.questions || []).map((q, qi) => (
                        <li key={qi} className="flex gap-2">
                          <span className="mt-[2px] text-gray-400">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 输入区 */}
        <div className="mt-8 rounded-3xl bg-white/75 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4">
            <input
              className="w-full rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 text-gray-800 outline-none
                         focus:ring-2 focus:ring-[#e6b59a]/40"
              placeholder="为这段叙事起一个标题（可选）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="min-h-[320px] w-full rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 text-gray-800 outline-none
                         focus:ring-2 focus:ring-[#e6b59a]/40"
              placeholder="在这里开始书写..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>字数：{content.trim().length}</div>
              <button
                className="rounded-full px-7 py-2 text-sm font-semibold text-white shadow
                           bg-gradient-to-r from-[#e6b59a] to-[#e4a98b] hover:opacity-95 active:opacity-90
                           disabled:opacity-50"
                disabled={!content.trim() || saving}
                onClick={handleSave}
              >
                {saving ? (isEdit ? "保存中..." : "提交中...") : isEdit ? "保存修改" : "保存记录"}
              </button>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {isEdit
            ? "编辑模式下保留原有情绪/事件标签，仅修改标题与正文内容。"
            : "Guide 使用 emotionCode/eventCode 规则匹配；保存 Story 使用 emotionId/eventId。"}
        </div>
      </div>
    </div>
  );
}