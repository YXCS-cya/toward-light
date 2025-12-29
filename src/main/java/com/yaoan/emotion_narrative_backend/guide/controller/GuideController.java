package com.yaoan.emotion_narrative_backend.guide.controller;

import com.yaoan.emotion_narrative_backend.common.result.Result;
import com.yaoan.emotion_narrative_backend.guide.service.GuideService;
import com.yaoan.emotion_narrative_backend.guide.vo.GuideResponseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guide")
@RequiredArgsConstructor
public class GuideController {

    private final GuideService guideService;

    @GetMapping("/questions")
    public Result<GuideResponseVO> questions(
            @RequestParam(required = false) String emotionCode,
            @RequestParam(required = false) String eventCode) {
        return Result.success(guideService.getQuestions(emotionCode, eventCode));
    }
}
