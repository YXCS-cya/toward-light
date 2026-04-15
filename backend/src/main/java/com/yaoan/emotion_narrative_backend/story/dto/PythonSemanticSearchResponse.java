package com.yaoan.emotion_narrative_backend.story.dto;

import lombok.Data;

import java.util.List;

@Data
public class PythonSemanticSearchResponse {

    private List<Long> storyIds;
}