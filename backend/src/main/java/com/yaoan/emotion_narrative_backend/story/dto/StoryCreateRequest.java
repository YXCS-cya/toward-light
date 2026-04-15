package com.yaoan.emotion_narrative_backend.story.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoryCreateRequest {

    @Size(max = 100)
    private String title;

    @NotBlank
    private String content;

    private Integer emotionTagId;
    private Integer eventTypeId;
}
