package com.yaoan.emotion_narrative_backend.guide.config;

import com.yaoan.emotion_narrative_backend.guide.vo.GuideCardVO;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "guide")
@Data
public class GuideProperties {
    private List<GuideCardVO> defaultCards;
    private List<RuleItem> rules;

    @Data
    public static class RuleItem {
        private String emotionCode;
        private String eventCode;
        private List<GuideCardVO> cards;
    }
}
