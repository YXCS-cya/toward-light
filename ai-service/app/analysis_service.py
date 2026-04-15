from openai import OpenAI

from app.config import settings

from typing import Generator


client = OpenAI(
    api_key=settings.deepseek_api_key,
    base_url=settings.deepseek_base_url,
)

# 解耦开故事分析服务和prompt工程
def build_analysis_prompt(content: str) -> str:
    cleaned_content = (content or "").strip()
    if not cleaned_content:
        raise ValueError("content cannot be empty")

    return f"""
请基于以下用户写下的故事内容，生成一段简短、温和、描述性的分析文字。

要求：
1. 只做描述性总结，帮助用户回看这段叙事中的情绪线索、关注点和表达重点。
2. 不要做心理诊断。
3. 不要使用病理化、绝对化或带有标签化的语言。
4. 不要命令用户，不要说教，不要给治疗建议。
5. 保持语气克制、温和、尊重。
6. 输出控制在 4 到 8 句。
7. 直接输出分析内容，不要加标题，不要分点，不要加“以下是分析”。
8. 避免过度阐释象征意义，不要进行文学评论式分析，尽量贴近用户原文中的情绪表达和关注点。

故事内容：
{cleaned_content}
""".strip()

# 保留非流式接口，作为潜在的备选
def analyze_story(content: str) -> str:
    cleaned_content = (content or "").strip()
    if not cleaned_content:
        raise ValueError("content cannot be empty")

    prompt = build_analysis_prompt(cleaned_content)

    try:
        response = client.chat.completions.create(
            model=settings.deepseek_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是一个温和、克制的情绪叙事分析助手。"
                        "你只做描述性分析，不做诊断，不使用病理化语言，"
                        "不命令用户，不进行说教。"
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=300,# 限制输出长度，求你了别太啰嗦了。。
        )

        analysis = response.choices[0].message.content.strip()

        if not analysis:
            raise RuntimeError("analysis result is empty")

        return analysis

    except Exception as e:
        raise RuntimeError(f"failed to analyze story: {e}") from e

# 流式分析，还是想把SSE做出来
def stream_analyze_story(content: str) -> Generator[str, None, None]:
    # 这里返回的这个Generator，是为了FastAPI 后面会直接消费这个生成器，把每一段文本逐步往外吐
    cleaned_content = (content or "").strip()
    if not cleaned_content:
        raise ValueError("content cannot be empty")

    prompt = build_analysis_prompt(cleaned_content)

    try:
        stream = client.chat.completions.create(
            model=settings.deepseek_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是一个温和、克制的情绪叙事分析助手。"
                        "你只做描述性分析，不做诊断，不使用病理化语言，"
                        "不命令用户，不进行说教。"
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=300,
            stream=True,
        )

        has_output = False

        for chunk in stream:
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta
            content_piece = getattr(delta, "content", None)

            if not content_piece:
                continue

            has_output = True
            yield content_piece

        if not has_output:
            raise RuntimeError("stream analysis result is empty")

    except Exception as e:
        raise RuntimeError(f"failed to stream analyze story: {e}") from e