from app.embedding_service import generate_embedding


if __name__ == "__main__":
    text = "今天因为学习压力很大，我有点焦虑。"

    vector = generate_embedding(text)

    print("embedding generated successfully")
    print("vector length:", len(vector))
    print("first 5 values:", vector[:5])