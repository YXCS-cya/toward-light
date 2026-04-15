from typing import List, Optional

from pydantic import BaseModel, Field


class SemanticSearchRequest(BaseModel):
    userId: int = Field(..., description="当前用户ID")
    query: str = Field(..., min_length=1, description="自然语言查询语句")
    topK: int = Field(3, ge=1, le=20, description="返回结果数量")
    maxDistance: Optional[float] = Field(
        None,
        ge=0,
        description="最大允许距离，距离越小越相似；为空时不做距离过滤；不为空时筛选相似度足够高的向量"
    )


class SemanticSearchResponse(BaseModel):
    storyIds: List[int]

#AI 分析
class AnalyzeStoryRequest(BaseModel):
    content: str = Field(..., min_length=1, description="故事正文内容")

class AnalyzeStoryResponse(BaseModel):
    analysis: str = Field(..., description="AI生成的分析文本")