package com.yaoan.emotion_narrative_backend.story.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoryUpdateRequest {

    @Size(max = 100)
    private String title;

    @NotBlank
    private String content;
    //为了少数仅修改标题的情况，此处在实际应用中应该新增 PATCH 接口
    //但毕竟还是个课设，当成TODO吧

    private Integer emotionTagId;
    private Integer eventTypeId;
}
