package com.yaoan.emotion_narrative_backend.mq.consumer;

import com.yaoan.emotion_narrative_backend.mq.dto.StoryEventMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TestConsumer {

//    @RabbitListener(queues = "lightwards.test.queue")
//    public void receive(StoryEventMessage message) {
//        System.out.println("收到 Story 消息:");
//        System.out.println("storyId = " + message.getStoryId());
//        System.out.println("userId = " + message.getUserId());
//        System.out.println("time = " + message.getOccurredAt());
//        System.out.println("type = " + message.getEventType());
//    }
}