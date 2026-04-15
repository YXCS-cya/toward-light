package com.yaoan.emotion_narrative_backend.auth.controller;

import com.yaoan.emotion_narrative_backend.auth.service.AuthService;
import com.yaoan.emotion_narrative_backend.common.auth.UserContext;
import com.yaoan.emotion_narrative_backend.common.result.Result;
import com.yaoan.emotion_narrative_backend.user.dto.LoginRequest;
import com.yaoan.emotion_narrative_backend.user.vo.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
/*只负责参数接收与返回*/
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return Result.success(authService.login(req));
    }
    /* 测试鉴权，这个接口不在白名单里，理论上会被拦截器保护*/
    @GetMapping("/me")
    public Result<Long> me() {
        return Result.success(UserContext.getUserId());
    }
}
