package com.yaoan.emotion_narrative_backend.story.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SemanticSearchRequest {

    @NotBlank(message = "query 不能为空")
    private String query;

    @Min(value = 1, message = "topK 最小为 1")
    @Max(value = 20, message = "topK 最大为 20")
    //这里设这么大是因为FAISS那边是进行全局检索+ID隔离的方式
    // 如果设的太小有可能出现一个用户查到的全是别的用户的故事
    private Integer topK = 3;
    private Double maxDistance;
}