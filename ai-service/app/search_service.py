from typing import List, Optional

from app.embedding_service import generate_embedding
from app.faiss_service import search_similar
from app.story_repository import find_stories_by_ids


def semantic_search(query: str, user_id: int, top_k: int = 3) -> List[dict]:
    """
    语义检索主流程：
    1. 将用户查询语句 embedding
    2. 在 FAISS 中查找当前用户最相似的 storyId
    3. 回 MySQL 查当前用户自己的完整 story
    注：本函数主要用于开发阶段进行测试，可使用 test_search.py 进行尝试
    """
    cleaned_query = (query or "").strip()
    if not cleaned_query:
        raise ValueError("query cannot be empty")

    if not user_id:
        raise ValueError("user_id cannot be empty")

    hits = search_similar(
        vector=generate_embedding(cleaned_query),
        user_id=user_id,
        top_k=top_k
    )

    story_ids = [hit.story_id for hit in hits[:top_k]]

    if not story_ids:
        return []

    stories = find_stories_by_ids(story_ids, user_id=user_id)
    return stories


def semantic_search_story_ids(
    query: str,
    user_id: int,
    top_k: int = 3,
    max_distance: Optional[float] = None
) -> List[int]:
    """
    语义检索主流程：
    1. 将用户查询语句 embedding
    2. 在 FAISS 中查找当前用户最相似的候选
    3. 按 max_distance 做距离过滤
    4. 返回 storyId 列表
    """
    cleaned_query = (query or "").strip()
    if not cleaned_query:
        raise ValueError("query cannot be empty")

    if not user_id:
        raise ValueError("user_id cannot be empty")

    hits = search_similar(
        vector=generate_embedding(cleaned_query),
        user_id=user_id,
        top_k=top_k
    )

    print(f"[INFO] semantic search raw hits for userId={user_id}, query={cleaned_query}")
    print(f"[DEBUG] hits type = {type(hits)}")
    print(f"[DEBUG] hits value = {hits}")

    for hit in hits:
        print(f"[DEBUG] single hit type = {type(hit)}")
        print(f"[DEBUG] single hit value = {hit}")

    if max_distance is not None:
        hits = [hit for hit in hits if hit.distance <= max_distance]

    filtered_story_ids = [hit.story_id for hit in hits[:top_k]]
    return filtered_story_ids