package com.yaoan.emotion_narrative_backend.auth.service;

import com.yaoan.emotion_narrative_backend.common.auth.JwtUtil;
import com.yaoan.emotion_narrative_backend.common.exception.BusinessException;
import com.yaoan.emotion_narrative_backend.common.exception.ErrorCode;
import com.yaoan.emotion_narrative_backend.user.dto.LoginRequest;
import com.yaoan.emotion_narrative_backend.user.entity.AppUser;
import com.yaoan.emotion_narrative_backend.user.repository.AppUserRepository;
import com.yaoan.emotion_narrative_backend.user.vo.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/** 暂不做登录失败次数限制、不做验证码、不做 refresh token*/
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepository;
    private final JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest req) {
        AppUser user = userRepository.findByUsernameAndIsDeleted(req.getUsername(), false)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtUtil.generateToken(user.getId());
        return new LoginResponse(token, user.getId());
    }
}
