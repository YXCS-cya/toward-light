package com.yaoan.emotion_narrative_backend.analytics.vo;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmotionEventStatVO {

    private Integer emotionId;
    private String emotionCode;
    private String emotionName;

    private Integer eventId;
    private String eventCode;
    private String eventName;

    private Long count;
}
