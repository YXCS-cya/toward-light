package com.yaoan.emotion_narrative_backend.mq.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

// 这里的Serializable是指序列化，告诉JVM这个类可以被序列化
//要注意，MQ + 对象传输，本质是“序列化问题”，要理解它的作用，
//故此处可以不使用Lombook的@Data等自动生成的getter/setter（详见Obsidian）
//另注：最终为了统一代码风格，还是使用了Lombook，以后只在JPA类创建对象时 不 使用Lombook（详见Obsidian）

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryEventMessage implements Serializable {

    private StoryEventType eventType;
    private Long storyId;
    private Long userId;
    private LocalDateTime occurredAt;
}