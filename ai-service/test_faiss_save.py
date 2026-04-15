from app.embedding_service import generate_embedding
from app.faiss_service import save_embedding


if __name__ == "__main__":
    text_1 = "今天因为学习压力很大，我有点焦虑。"
    text_2 = "晚上和朋友聊完天之后，心情平静了一些。"

    vector_1 = generate_embedding(text_1)
    vector_2 = generate_embedding(text_2)

    save_embedding(1001, vector_1)
    save_embedding(1002, vector_2)

    print("faiss save test completed")