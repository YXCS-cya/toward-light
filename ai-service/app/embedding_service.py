from typing import List

from openai import OpenAI

from app.config import settings


client = OpenAI(
    api_key=settings.dashscope_api_key,
    base_url=settings.dashscope_base_url,
)


def generate_embedding(text: str) -> List[float]:
    """
    将输入文本转换为 embedding 向量。

    :param text: 原始文本
    :return: embedding 向量
    :raises ValueError: 输入文本为空
    :raises RuntimeError: 调用 embedding 接口失败
    """
    cleaned_text = (text or "").strip()
    if not cleaned_text:
        raise ValueError("text cannot be empty")

    try:
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=cleaned_text
        )

        vector = response.data[0].embedding

        if not vector:
            raise RuntimeError("embedding result is empty")

        return vector

    except Exception as e:
        raise RuntimeError(f"failed to generate embedding: {e}") from e