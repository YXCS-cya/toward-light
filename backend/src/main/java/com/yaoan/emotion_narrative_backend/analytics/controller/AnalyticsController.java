package com.yaoan.emotion_narrative_backend.analytics.controller;

import com.yaoan.emotion_narrative_backend.analytics.service.AnalyticsService;
import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionEventStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EventStatVO;
import com.yaoan.emotion_narrative_backend.common.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/emotions")
    public Result<List<EmotionStatVO>> emotionStats() {
        return Result.success(analyticsService.emotionStatistics());
    }

    @GetMapping("/events")
    public Result<List<EventStatVO>> eventStats() {
        return Result.success(analyticsService.eventStatistics());
    }

    @GetMapping("/emotion-event")
    public Result<List<EmotionEventStatVO>> emotionEventStats() {
        return Result.success(analyticsService.emotionEventStatistics());
    }


}
