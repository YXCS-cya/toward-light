package com.yaoan.emotion_narrative_backend.analytics.vo;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventStatVO {

    private Integer eventId;
    private String eventCode;
    private String eventName;
    private Long count;
}
