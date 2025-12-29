package com.yaoan.emotion_narrative_backend.common.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashTool {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "123456";
        String hash = encoder.encode(raw);
        System.out.println("raw=" + raw);
        System.out.println("hash=" + hash);
        System.out.println("matches=" + encoder.matches(raw, hash));
    }
}
