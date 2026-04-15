import json
import os
from typing import Dict, List

import faiss
import numpy as np
from dataclasses import dataclass

from app.config import settings

@dataclass
class SearchHit:
    story_id: int
    distance: float # 做距离筛选，免得返回结果相似度不足

def _ensure_parent_dir(file_path: str) -> None:
    """
    确保目标文件的父目录存在。
    """
    parent_dir = os.path.dirname(file_path)
    if parent_dir and not os.path.exists(parent_dir):
        os.makedirs(parent_dir, exist_ok=True)


def _load_id_map() -> Dict[str, int]:
    """
    加载 storyId 映射文件。
    格式：
      "0": {
    "storyId": 22,
    "userId": 1
  },
    其中 key 是向量在索引中的位置，value 是 storyId
    """
    if not os.path.exists(settings.faiss_id_map_path):
        return {}

    with open(settings.faiss_id_map_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_id_map(id_map: Dict[str, int]) -> None:
    """
    保存 storyId 映射文件。
    """
    _ensure_parent_dir(settings.faiss_id_map_path)

    with open(settings.faiss_id_map_path, "w", encoding="utf-8") as f:
        json.dump(id_map, f, ensure_ascii=False, indent=2)


def _load_or_create_index(vector_dim: int) -> faiss.Index:
    """
    加载或创建 FAISS 索引。
    当前使用 IndexFlatL2，适合先做最小可用版本。

    如果索引文件损坏，则删除旧文件并重新创建。
    """
    if os.path.exists(settings.faiss_index_path):
        try:
            index = faiss.read_index(settings.faiss_index_path)

            if index.d != vector_dim:
                raise ValueError(
                    f"faiss index dimension mismatch: "
                    f"existing={index.d}, incoming={vector_dim}"
                )

            return index

        except Exception as e:
            print(
                f"[WARN] failed to load existing faiss index, "
                f"will recreate it. reason={e}"
            )
            os.remove(settings.faiss_index_path)

    _ensure_parent_dir(settings.faiss_index_path)
    return faiss.IndexFlatL2(vector_dim)


def _save_index(index: faiss.Index) -> None:
    """
    保存 FAISS 索引到文件。
    """
    _ensure_parent_dir(settings.faiss_index_path)
    faiss.write_index(index, settings.faiss_index_path)


def save_embedding(story_id: int, user_id: int, vector: List[float]) -> None:
    """
    保存一条 embedding 到 FAISS 索引，并记录 storyId / userId 映射。

    当前版本的策略：
    - 直接追加向量
    - 记录 index_position -> {storyId, userId}
    - 暂不处理 story_id 去重、更新覆盖、删除
    """
    if not vector:
        raise ValueError("vector cannot be empty")

    np_vector = np.array([vector], dtype="float32")
    vector_dim = np_vector.shape[1]

    index = _load_or_create_index(vector_dim)
    id_map = _load_id_map()

    current_position = index.ntotal
    index.add(np_vector)

    id_map[str(current_position)] = {
        "storyId": story_id,
        "userId": user_id
    }

    _save_index(index)
    _save_id_map(id_map)

    print(
        f"[INFO] embedding saved to faiss: "
        f"storyId={story_id}, userId={user_id}, "
        f"index_position={current_position}, total={index.ntotal}"
    )

def search_similar(vector: List[float], user_id: int, top_k: int = 3) -> List[SearchHit]:
    """
    在 FAISS 中搜索最相似的向量，并按 user_id 过滤。
    返回 SearchHit 列表，包含 story_id 和 distance。

    说明：
    - 当前使用 IndexFlatL2
    - distance 越小，表示越相似
    - 先扩大候选集合，再按 userId 过滤
    """
    if not vector:
        raise ValueError("vector cannot be empty")

    if not user_id:
        raise ValueError("user_id cannot be empty")

    if top_k <= 0:
        raise ValueError("top_k must be greater than 0")

    if not os.path.exists(settings.faiss_index_path):
        return []

    index = faiss.read_index(settings.faiss_index_path)
    id_map = _load_id_map()

    if index.ntotal == 0:
        return []

    np_vector = np.array([vector], dtype="float32")

    candidate_k = min(max(top_k * 5, 10), index.ntotal)
    distances, indices = index.search(np_vector, candidate_k)

    hits: List[SearchHit] = []
    seen_story_ids = set()

    for distance, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue

        mapping = id_map.get(str(idx))
        if not mapping:
            continue

        mapped_user_id = mapping.get("userId")
        mapped_story_id = mapping.get("storyId")

        if mapped_user_id != user_id:
            continue

        if mapped_story_id in seen_story_ids:
            continue

        seen_story_ids.add(mapped_story_id)
        hits.append(
            SearchHit(
                story_id=mapped_story_id,
                distance=float(distance)
            )
        )

    return hits


def get_index_total() -> int:
    """
    返回当前索引中的向量总数。
    """
    if not os.path.exists(settings.faiss_index_path):
        return 0

    index = faiss.read_index(settings.faiss_index_path)
    return index.ntotal