package com.realestate.mlm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableCaching
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.realestate.mlm.repository")
public class MlmBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MlmBackendApplication.class, args);
    }
}
