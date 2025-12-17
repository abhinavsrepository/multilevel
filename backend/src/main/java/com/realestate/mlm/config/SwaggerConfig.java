package com.realestate.mlm.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        String schemeName = "Bearer Authentication";

        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList(schemeName))
            .components(new io.swagger.v3.oas.models.Components()
                .addSecuritySchemes(schemeName,
                    new SecurityScheme()
                        .name(schemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT authentication token")
                )
            )
            .info(apiInfo());
    }

    private Info apiInfo() {
        return new Info()
            .title("Real Estate MLM Platform API")
            .version("1.0.0")
            .description("API documentation for Real Estate MLM Platform")
            .contact(new Contact()
                .name("Support Team")
                .email("support@realestate-mlm.com")
            );
    }
}
