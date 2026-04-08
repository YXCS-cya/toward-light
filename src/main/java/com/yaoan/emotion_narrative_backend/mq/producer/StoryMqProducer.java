package com.yaoan.emotion_narrative_backend.mq.producer;

import com.yaoan.emotion_narrative_backend.mq.dto.StorySavedMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

//不要在业务里直接用 RabbitTemplate，还是解耦来做消息件
@Component
public class StoryMqProducer {

    private static final String QUEUE_NAME = "lightwards.test.queue";

    private final RabbitTemplate rabbitTemplate;

    public StoryMqProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendStorySavedMessage(StorySavedMessage message) {
        rabbitTemplate.convertAndSend(QUEUE_NAME, message);
    }
}