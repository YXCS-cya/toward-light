package com.yaoan.emotion_narrative_backend.guide.vo;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventTypeVO {

    private Integer  id;
    private String code;
    private String name;
}
