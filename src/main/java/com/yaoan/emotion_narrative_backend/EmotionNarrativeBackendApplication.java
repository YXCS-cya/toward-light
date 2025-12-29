package com.yaoan.emotion_narrative_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EmotionNarrativeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmotionNarrativeBackendApplication.class, args);
	}

}
