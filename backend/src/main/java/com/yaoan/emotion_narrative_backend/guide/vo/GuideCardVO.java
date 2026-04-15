package com.yaoan.emotion_narrative_backend.guide.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuideCardVO {
    private String title;
    private List<String> questions;
}
