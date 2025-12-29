package com.yaoan.emotion_narrative_backend.guide.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuideResponseVO {
    private String mode;     // RULE
    private String version;  // v1
    private String source;   // CONFIG
    private List<GuideCardVO> cards;
}

