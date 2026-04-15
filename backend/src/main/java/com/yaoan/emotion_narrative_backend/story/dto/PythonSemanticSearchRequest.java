package com.yaoan.emotion_narrative_backend.story.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonSemanticSearchRequest {

    private Long userId;
    private String query;
    private Integer topK;
    private Double maxDistance;
}