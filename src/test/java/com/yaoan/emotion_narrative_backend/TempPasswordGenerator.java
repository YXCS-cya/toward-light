package com.yaoan.emotion_narrative_backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TempPasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("123456"));
    }
}
