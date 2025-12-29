package com.yaoan.emotion_narrative_backend.common.interceptor;

import com.yaoan.emotion_narrative_backend.common.auth.JwtUtil;
import com.yaoan.emotion_narrative_backend.common.auth.UserContext;
import com.yaoan.emotion_narrative_backend.common.exception.BusinessException;
import com.yaoan.emotion_narrative_backend.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** 拦截器*/
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        String token = auth.substring(7);
        try {
            Long userId = jwtUtil.parseUserId(token);
            UserContext.setUserId(userId);
            return true;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
