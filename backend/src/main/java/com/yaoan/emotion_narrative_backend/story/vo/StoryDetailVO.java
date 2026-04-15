package com.yaoan.emotion_narrative_backend.story.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class StoryDetailVO {
    private Long id;
    private String title;
    private String content;
    private Integer emotionTagId;
    private Integer eventTypeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
