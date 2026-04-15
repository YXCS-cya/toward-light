package com.yaoan.emotion_narrative_backend.guide.vo;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class EmotionTagVO {

    private Integer  id;
    private String code;
    private String name;
    private Integer polarity;   // -1 / 0 / 1，用于前端理解情绪方向
}
