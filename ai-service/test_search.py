from app.faiss_service import get_index_total
from app.search_service import semantic_search


if __name__ == "__main__":
    query = "最近因为学习压力很焦虑的时候"
    user_id = 1

    print(f"current faiss total vectors: {get_index_total()}")
    print(f"search query: {query}")
    print(f"current user_id: {user_id}")
    print("-" * 60)

    results = semantic_search(query, user_id=user_id, top_k=3)

    if not results:
        print("no similar stories found")
    else:
        print("Top similar stories:")
        for i, story in enumerate(results, start=1):
            preview = (story["content"] or "")[:60].replace("\n", " ")
            print(
                f"{i}. storyId={story['id']}, "
                f"userId={story['user_id']}, "
                f"title={story['title']}, "
                f"preview={preview}"
            )