package com.appointments.backend.config;

<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Value;
=======
>>>>>>> ce4fa02823c983c127646a0b92a7238f13b0d743
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

<<<<<<< HEAD
    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

=======
>>>>>>> ce4fa02823c983c127646a0b92a7238f13b0d743
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
<<<<<<< HEAD
                registry.addMapping("/api/**")
                        .allowedOriginPatterns(allowedOrigins.split(","))
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
=======
                registry.addMapping("/**")
                        .allowedOrigins("*")   // allow all (for now)
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}
>>>>>>> ce4fa02823c983c127646a0b92a7238f13b0d743
