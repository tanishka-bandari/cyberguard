package com.cyberguard.cyberincident;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CyberincidentApplication {

	public static void main(String[] args) {
		// Timestamps are stored and sent as UTC LocalDateTime values.
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(CyberincidentApplication.class, args);
	}

}
