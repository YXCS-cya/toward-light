package com.yaoan.emotion_narrative_backend.mq.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TestConsumer {

    @RabbitListener(queues = "lightwards.test.queue")
    public void receive(String message) {
        System.out.println("收到消息: " + message);
    }
}