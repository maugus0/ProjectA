# Yushan API Gateway - Setup Guide

## Part 1: Generate Project with Spring Initializr

### Option A: Using Web Interface (Recommended)

1. Go to [https://start.spring.io](https://start.spring.io)

2. Configure the project:
   - **Project**: Maven
   - **Language**: Java
   - **Spring Boot**: 3.4.10 (match your service registry)
   - **Project Metadata**:
     - Group: `com.yushan`
     - Artifact: `api-gateway`
     - Name: `Yushan API Gateway`
     - Description: `API Gateway for Yushan Novel Platform`
     - Package name: `com.yushan.gateway`
     - Packaging: `Jar`
     - Java: `21` (match your service registry)

3. Add Dependencies (click "ADD DEPENDENCIES" button):
   - **Gateway** (under Spring Cloud Routing)
   - **Eureka Discovery Client** (under Spring Cloud Discovery)
   - **Spring Boot Actuator** (under Ops)
   - **Lombok** (under Developer Tools)

4. Click **GENERATE** button

5. Extract the downloaded zip file

### Option B: Using Spring CLI

```bash
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.4.10 \
  -d baseDir=yushan-api-gateway \
  -d groupId=com.yushan \
  -d artifactId=api-gateway \
  -d name=yushan-api-gateway \
  -d description="API Gateway for Yushan Novel Platform" \
  -d packageName=com.yushan.gateway \
  -d packaging=jar \
  -d javaVersion=21 \
  -d dependencies=cloud-gateway,cloud-eureka,actuator,lombok \
  -o yushan-api-gateway.zip

unzip yushan-api-gateway.zip
cd yushan-api-gateway
```

### Option C: Direct Link

Click this link to open Spring Initializr with pre-configured settings:

```
https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.4.10&packaging=jar&jvmVersion=21&groupId=com.yushan&artifactId=api-gateway&name=Yushan%20API%20Gateway&description=API%20Gateway%20for%20Yushan%20Novel%20Platform&packageName=com.yushan.gateway&dependencies=cloud-gateway,cloud-eureka,actuator,lombok
```

---

## Part 2: Verify and Update pom.xml

After generating, your `pom.xml` should look like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Spring Boot Parent -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.10</version>
        <relativePath/>
    </parent>
    
    <!-- Project Identification -->
    <groupId>com.yushan</groupId>
    <artifactId>api-gateway</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    <name>Yushan API Gateway</name>
    <description>API Gateway for Yushan Novel Platform</description>
    
    <!-- Java Version -->
    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2024.0.2</spring-cloud.version>
    </properties>
    
    <!-- Dependencies -->
    <dependencies>
        <!-- Spring Cloud Gateway -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        
        <!-- Eureka Client for Service Discovery -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        
        <!-- Spring Boot Actuator for Health Checks -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- JWT for Authentication (Add manually) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Test Dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <!-- Spring Cloud Dependency Management -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <!-- Build Configuration -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

**Note**: You'll need to manually add the JWT dependencies (the three `jjwt` dependencies) as Spring Initializr doesn't include them by default.

---

## Part 3: Project Structure

After generation, your project structure should be:

```
yushan-api-gateway/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── yushan/
│   │   │           └── gateway/
│   │   │               └── ApiGatewayApplication.java (generated)
│   │   └── resources/
│   │       ├── application.properties (generated - we'll replace with yml)
│   │       └── static/
│   └── test/
│       └── java/
│           └── com/
│               └── yushan/
│                   └── gateway/
│                       └── ApiGatewayApplicationTests.java (generated)
├── .gitignore (generated)
├── mvnw (generated)
├── mvnw.cmd (generated)
├── pom.xml (generated)
└── README.md (you'll create this)
```

---

## Part 4: Update Main Application Class

**File**: `src/main/java/com/yushan/gateway/ApiGatewayApplication.java`

Spring Initializr generates a basic class. Update it to:

```java
package com.yushan.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

---

## Part 5: Create Configuration Files

### Delete application.properties and Create application.yml

Delete: `src/main/resources/application.properties`

Create: `src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  
  cloud:
    gateway:
      # Enable service discovery routing
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      
      # Global CORS Configuration
      globalcors:
        cors-configurations:
          '[/**]':
            allowed-origins: "*"
            allowed-methods:
              - GET
              - POST
              - PUT
              - DELETE
              - PATCH
              - OPTIONS
            allowed-headers: "*"
            allow-credentials: false
            max-age: 3600
      
      # Route Definitions
      routes:
        # ============================================
        # USER SERVICE ROUTES
        # ============================================
        - id: user-service-auth
          uri: lb://user-service
          predicates:
            - Path=/api/auth/**
          filters:
            - RewritePath=/api/auth/(?<segment>.*), /auth/${segment}
        
        - id: user-service-users
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - RewritePath=/api/users/(?<segment>.*), /users/${segment}
        
        - id: user-service-library
          uri: lb://user-service
          predicates:
            - Path=/api/library/**
          filters:
            - RewritePath=/api/library/(?<segment>.*), /library/${segment}
        
        # ============================================
        # CONTENT SERVICE ROUTES
        # ============================================
        - id: content-service-novels
          uri: lb://content-service
          predicates:
            - Path=/api/novels/**
          filters:
            - RewritePath=/api/novels/(?<segment>.*), /novels/${segment}
        
        - id: content-service-chapters
          uri: lb://content-service
          predicates:
            - Path=/api/chapters/**
          filters:
            - RewritePath=/api/chapters/(?<segment>.*), /chapters/${segment}
        
        - id: content-service-categories
          uri: lb://content-service
          predicates:
            - Path=/api/categories/**
          filters:
            - RewritePath=/api/categories/(?<segment>.*), /categories/${segment}
        
        # ============================================
        # ENGAGEMENT SERVICE ROUTES
        # ============================================
        - id: engagement-service-comments
          uri: lb://engagement-service
          predicates:
            - Path=/api/comments/**
          filters:
            - RewritePath=/api/comments/(?<segment>.*), /comments/${segment}
        
        - id: engagement-service-reviews
          uri: lb://engagement-service
          predicates:
            - Path=/api/reviews/**
          filters:
            - RewritePath=/api/reviews/(?<segment>.*), /reviews/${segment}
        
        - id: engagement-service-votes
          uri: lb://engagement-service
          predicates:
            - Path=/api/votes/**
          filters:
            - RewritePath=/api/votes/(?<segment>.*), /votes/${segment}
        
        - id: engagement-service-reports
          uri: lb://engagement-service
          predicates:
            - Path=/api/reports/**
          filters:
            - RewritePath=/api/reports/(?<segment>.*), /reports/${segment}
        
        # ============================================
        # GAMIFICATION SERVICE ROUTES
        # ============================================
        - id: gamification-service-exp
          uri: lb://gamification-service
          predicates:
            - Path=/api/exp/**
          filters:
            - RewritePath=/api/exp/(?<segment>.*), /exp/${segment}
        
        - id: gamification-service-yuan
          uri: lb://gamification-service
          predicates:
            - Path=/api/yuan/**
          filters:
            - RewritePath=/api/yuan/(?<segment>.*), /yuan/${segment}
        
        - id: gamification-service-achievements
          uri: lb://gamification-service
          predicates:
            - Path=/api/achievements/**
          filters:
            - RewritePath=/api/achievements/(?<segment>.*), /achievements/${segment}
        
        # ============================================
        # ANALYTICS SERVICE ROUTES
        # ============================================
        - id: analytics-service-history
          uri: lb://analytics-service
          predicates:
            - Path=/api/history/**
          filters:
            - RewritePath=/api/history/(?<segment>.*), /history/${segment}
        
        - id: analytics-service-rankings
          uri: lb://analytics-service
          predicates:
            - Path=/api/rankings/**
          filters:
            - RewritePath=/api/rankings/(?<segment>.*), /rankings/${segment}
        
        - id: analytics-service-analytics
          uri: lb://analytics-service
          predicates:
            - Path=/api/analytics/**
          filters:
            - RewritePath=/api/analytics/(?<segment>.*), /analytics/${segment}

# Eureka Configuration
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${spring.application.instance_id:${random.value}}

# Actuator Configuration
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,gateway
  endpoint:
    health:
      show-details: always

# Logging
logging:
  level:
    org.springframework.cloud.gateway: INFO
    reactor.netty: INFO
    com.yushan.gateway: DEBUG

# JWT Configuration (match your User Service)
jwt:
  secret: ${JWT_SECRET:your-secret-key-change-this-in-production-minimum-256-bits}
```

### Create application-docker.yml

**File**: `src/main/resources/application-docker.yml`

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
```

---

## Part 6: Create Filter Classes

### Create package structure

```bash
mkdir -p src/main/java/com/yushan/gateway/filter
mkdir -p src/main/java/com/yushan/gateway/config
```

### Create Authentication Filter

**File**: `src/main/java/com/yushan/gateway/filter/AuthenticationFilter.java`

```java
package com.yushan.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // Paths that don't require authentication
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/novels",  // Public novel browsing
            "/actuator/health"
    );

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            log.debug("Processing request to: {}", path);

            // Check if path is public
            if (isPublicPath(path)) {
                log.debug("Public path, skipping authentication: {}", path);
                return chain.filter(exchange);
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization header for path: {}", path);
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header format for path: {}", path);
                return onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // Validate token
                Claims claims = validateToken(token);
                
                // Add user information to request headers
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", claims.getSubject())
                        .header("X-User-Role", claims.get("role", String.class))
                        .header("X-User-Email", claims.get("email", String.class))
                        .build();

                log.debug("Authentication successful for user: {}", claims.getSubject());
                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                log.error("JWT validation failed: {}", e.getMessage());
                return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private Claims validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        String body = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    public static class Config {
        // Configuration properties if needed
    }
}
```

### Create Logging Filter

**File**: `src/main/java/com/yushan/gateway/filter/LoggingFilter.java`

```java
package com.yushan.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class LoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        log.info("Incoming request: {} {} from {}",
                request.getMethod(),
                request.getURI().getPath(),
                request.getRemoteAddress());

        long startTime = System.currentTimeMillis();

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            ServerHttpResponse response = exchange.getResponse();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Outgoing response: {} {} - Status: {} - Duration: {}ms",
                    request.getMethod(),
                    request.getURI().getPath(),
                    response.getStatusCode(),
                    duration);
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
```

---

## Part 7: Create Configuration Classes

### Create CORS Configuration

**File**: `src/main/java/com/yushan/gateway/config/CorsConfig.java`

```java
package com.yushan.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Collections.singletonList("*"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowedHeaders(Collections.singletonList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
```

---

## Part 8: Update Test Class

**File**: `src/test/java/com/yushan/gateway/ApiGatewayApplicationTests.java`

```java
package com.yushan.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "eureka.client.enabled=false"
})
class ApiGatewayApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

---

## Part 9: Create Dockerfile

**File**: `Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Part 10: Build and Run

### Build the project

```bash
# Make mvnw executable (Linux/Mac)
chmod +x mvnw

# Build the project
./mvnw clean package -DskipTests

# Or on Windows
mvnw.cmd clean package -DskipTests
```

### Run locally

```bash
# Make sure Eureka Server is running first on port 8761
# Then start the gateway
./mvnw spring-boot:run

# Or run the JAR directly
java -jar target/api-gateway-1.0.0.jar
```

### Verify it's working

```bash
# Check health
curl http://localhost:8080/actuator/health

# Check Eureka dashboard - you should see api-gateway registered
open http://localhost:8761
```

---

## Part 11: Testing the Gateway

### Test without authentication (public endpoints)

```bash
# This should work without JWT
curl http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test with authentication (protected endpoints)

```bash
# First get a JWT token from your user service
# Then use it:
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Troubleshooting

### Common Issues

**1. Gateway can't find services**
- Make sure Eureka Server is running
- Check that your services are registered in Eureka
- Verify service names match in application.yml routes

**2. JWT validation fails**
- Ensure JWT secret matches your User Service
- Check token format: `Bearer <token>`
- Verify token hasn't expired

**3. CORS errors**
- Check allowed origins in CorsConfig
- Ensure preflight OPTIONS requests work

**4. Port already in use**
- Change port in application.yml: `server.port: 8081`
- Or kill process using port 8080

---

## Next Steps

1. ✅ Generate project with Spring Initializr
2. ✅ Add JWT dependencies to pom.xml
3. ✅ Create application.yml configuration
4. ✅ Create filter classes
5. ✅ Create configuration classes
6. ✅ Build and test locally
7. ⏭️ Create yushan-config-server next!

The API Gateway is now ready to route requests to your 5 microservices!
