package com.yaoan.emotion_narrative_backend.guide.service;

import com.yaoan.emotion_narrative_backend.guide.config.GuideProperties;
import com.yaoan.emotion_narrative_backend.guide.service.GuideService;
import com.yaoan.emotion_narrative_backend.guide.vo.GuideCardVO;
import com.yaoan.emotion_narrative_backend.guide.vo.GuideResponseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GuideServiceImpl implements GuideService {

    private final GuideProperties props;

    @Override
    public GuideResponseVO getQuestions(String emotionCode, String eventCode) {

        // 永远不为 null
        List<GuideCardVO> defaultCards = Optional.ofNullable(props.getDefaultCards())
                .orElse(Collections.emptyList());

        List<GuideProperties.RuleItem> rules = Optional.ofNullable(props.getRules())
                .orElse(Collections.emptyList());

        if (emotionCode != null && eventCode != null) {
            for (GuideProperties.RuleItem r : rules) {
                if (emotionCode.equalsIgnoreCase(r.getEmotionCode())
                        && eventCode.equalsIgnoreCase(r.getEventCode())) {

                    List<GuideCardVO> cards = Optional.ofNullable(r.getCards())
                            .orElse(Collections.emptyList());
                    return new GuideResponseVO("RULE", "v1", "CONFIG", cards);

                }
            }
        }

        return new GuideResponseVO("RULE", "v1", "CONFIG", defaultCards);
    }
}
