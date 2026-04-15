package com.yaoan.emotion_narrative_backend.mq.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mq-test")
public class MqTestController {

    private final RabbitTemplate rabbitTemplate;

    public MqTestController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @GetMapping("/send")
    public String send() {
        rabbitTemplate.convertAndSend("lightwards.test.queue", "hello rabbitmq");
        return "sent";
    }
}
