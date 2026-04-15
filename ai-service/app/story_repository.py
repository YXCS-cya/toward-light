from app.db import get_connection
from typing import Optional
from typing import List
## 和Java那边的Repository作用一样是查数据用的
## 开发阶段主要是验证业务逻辑-AI服务查库
def find_story_by_id(story_id: int) -> Optional[dict]:
    """
    根据 story_id 查询故事记录。
    返回字段可按当前表结构调整。
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT id, user_id, title, content, is_deleted, created_at, updated_at
                FROM story_record
                WHERE id = %s
                LIMIT 1
            """
            cursor.execute(sql, (story_id,))
            row = cursor.fetchone()

            if not row:
                return None

            return {
                "id": row["id"],
                "user_id": row["user_id"],
                "title": row["title"],
                "content": row["content"],
                "is_deleted": row["is_deleted"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
    finally:
        conn.close()

def find_stories_by_ids(story_ids: List[int], user_id: int) -> List[dict]:
    """
    根据多个 story_id 批量查询故事记录。
    注意：
    - 只返回当前用户自己的未删除记录
    - 查询结果尽量按传入 story_ids 的顺序返回
    """
    if not story_ids:
        return []

    if not user_id:
        raise ValueError("user_id cannot be empty")

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            placeholders = ",".join(["%s"] * len(story_ids))
            sql = f"""
                SELECT id, user_id, title, content, is_deleted, created_at, updated_at
                FROM story_record
                WHERE id IN ({placeholders})
                  AND user_id = %s
                  AND is_deleted = 0
            """
            params = tuple(story_ids) + (user_id,)
            cursor.execute(sql, params)
            rows = cursor.fetchall()

            row_map = {row["id"]: row for row in rows}

            ordered_results = []
            for story_id in story_ids:
                row = row_map.get(story_id)
                if row:
                    ordered_results.append({
                        "id": row["id"],
                        "user_id": row["user_id"],
                        "title": row["title"],
                        "content": row["content"],
                        "is_deleted": row["is_deleted"],
                        "created_at": row["created_at"],
                        "updated_at": row["updated_at"],
                    })

            return ordered_results
    finally:
        conn.close()