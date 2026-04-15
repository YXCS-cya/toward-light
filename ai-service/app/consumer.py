import json
from typing import Any

import pika

from app.config import settings
from app.embedding_service import generate_embedding
from app.story_repository import find_story_by_id
from app.faiss_service import save_embedding


def process_story_event(message: dict[str, Any]) -> None:
    """
    处理 Story 事件消息：
    1. 解析 storyId
    2. 查询 MySQL 获取正文
    3. 调用 embedding 接口
    4. 打印结果（后续这里会接 FAISS）
    """
    event_type = message.get("eventType")
    story_id = message.get("storyId")
    user_id = message.get("userId")

    if not story_id:
        raise ValueError("message missing storyId")

    print(
        f"[INFO] received event: eventType={event_type}, "
        f"storyId={story_id}, userId={user_id}"
    )

    story = find_story_by_id(story_id)
    if not story:
        print(f"[WARN] story not found, storyId={story_id}")
        return

    if story["is_deleted"] == 1:
        print(f"[INFO] story is deleted, skip embedding. storyId={story_id}")
        return

    content = (story.get("content") or "").strip()
    if not content:
        print(f"[WARN] story content is empty, skip embedding. storyId={story_id}")
        return

    print(f"[INFO] loaded story: title={story.get('title')}")

    vector = generate_embedding(content)

    print(
        f"[INFO] content={content[:20]}...",
        f"[INFO] embedding generated: storyId={story_id}, "
        f"vector_length={len(vector)}"
    )
    print(f"[DEBUG] first_5_values={vector[:5]}")
    # consumer 每处理一条消息，就会自动把向量存起来
    save_embedding(story_id, story["user_id"], vector)

def callback(ch, method, properties, body):
    """
    RabbitMQ 消费回调函数
    """
    try:
        message = json.loads(body.decode("utf-8"))
        process_story_event(message)

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"[ERROR] failed to process message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def start_consumer():
    """
    启动 RabbitMQ 消费者
    """
    credentials = pika.PlainCredentials(
        settings.rabbitmq_username,
        settings.rabbitmq_password,
    )

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            credentials=credentials,
        )
    )

    channel = connection.channel()

    channel.queue_declare(
        queue=settings.rabbitmq_queue,
        durable=True,
    )

    channel.basic_consume(
        queue=settings.rabbitmq_queue,
        on_message_callback=callback,
    )

    print(f"[INFO] waiting for messages from queue: {settings.rabbitmq_queue}")
    channel.start_consuming()