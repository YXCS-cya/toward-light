package com.yaoan.emotion_narrative_backend.story.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
/**
 * Created by IntelliJ IDEA.
 * 处理AI故事分析发给Python端
 * @author: yaoan
 * @date: 2023/4/27
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PythonAnalyzeStoryRequest {

    private String content;

}