package com.yaoan.emotion_narrative_backend.analytics.vo;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmotionStatVO {

    private Integer emotionId;
    private String emotionCode;
    private String emotionName;
    private Long count;
}
