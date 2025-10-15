# Analytics Service - Spring Initializr Configuration

## Step 1: Go to Spring Initializr
Visit: https://start.spring.io/

## Step 2: Project Metadata
```
Project: Maven
Language: Java
Spring Boot: 3.2.10 (or latest 3.2.x)
Packaging: Jar
Java: 21
```

## Step 3: Project Information
```
Group: com.yushan
Artifact: analytics-service
Name: analytics-service
Description: Analytics Service for Yushan Web Novel Platform
Package name: com.yushan.analytics
```

## Step 4: Dependencies to Add

### Core Spring Boot
- **Spring Web** - For REST APIs
- **Spring Data JPA** - Database access
- **PostgreSQL Driver** - PostgreSQL database

### Spring Cloud (Service Discovery)
- **Eureka Discovery Client** - Register with Eureka
- **OpenFeign** - Call other microservices

### Monitoring & Health
- **Spring Boot Actuator** - Health checks and metrics

### Caching
- **Spring Data Redis** - Redis caching
- **Spring Cache Abstraction** - Caching support

### Messaging (for Phase 2)
- **Spring for Apache Kafka** - Event streaming

### Utilities
- **Lombok** - Reduce boilerplate code
- **Validation** - Bean validation

### Development Tools
- **Spring Boot DevTools** - Hot reload during development

---

## Step 5: Generate and Download
1. Click **"GENERATE"** button
2. Extract the ZIP file
3. Place in your workspace as `yushan-analytics-service/`

---

## Step 6: Post-Generation Setup

### 1. Update `pom.xml` - Add Missing Dependencies

Add these to your `<dependencies>` section:

```xml
<!-- Load Balancer (required with Eureka) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>

<!-- TimescaleDB (PostgreSQL extension) -->
<dependency>
    <groupId>com.timescale</groupId>
    <artifactId>timescaledb-jdbc</artifactId>
    <version>1.8.1</version>
</dependency>

<!-- JSON Processing -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>

<!-- MapStruct (DTO mapping) -->
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>1.5.5.Final</version>
    <scope>provided</scope>
</dependency>
```

Add Spring Cloud version management in `<dependencyManagement>`:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2023.0.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2. Create `application.yml`

Delete `application.properties` and create `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: analytics-service
  
  # PostgreSQL Configuration (we'll set this up later)
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_analytics
    username: yushan_user
    password: change_me_in_production
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 20000
  
  # JPA Configuration
  jpa:
    hibernate:
      ddl-auto: validate  # Use Flyway for migrations
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        default_schema: public
  
  # Redis Configuration (we'll set this up later)
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2
  
  # Kafka Configuration (Phase 2)
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: analytics-service
      auto-offset-reset: earliest
      enable-auto-commit: false
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

# Server Configuration
server:
  port: 8083
  servlet:
    context-path: /
  compression:
    enabled: true

# Eureka Client Configuration
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${server.port}
    lease-renewal-interval-in-seconds: 30
    lease-expiration-duration-in-seconds: 90
    metadata-map:
      version: 1.0.0
      description: Analytics and ranking service

# Actuator Configuration
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: ${spring.application.name}

# Logging Configuration
logging:
  level:
    com.yushan.analytics: DEBUG
    org.springframework.cloud: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

### 3. Update Main Application Class

Edit `src/main/java/com/yushan/analytics/AnalyticsServiceApplication.java`:

```java
package com.yushan.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient    // Register with Eureka
@EnableFeignClients       // Enable Feign clients for inter-service calls
@EnableCaching            // Enable caching
@EnableScheduling         // Enable scheduled tasks (for ranking calculations)
public class AnalyticsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
```

### 4. Create Basic Package Structure

Create these directories under `src/main/java/com/yushan/analytics/`:

```
analytics-service/
└── src/main/java/com/yushan/analytics/
    ├── AnalyticsServiceApplication.java
    ├── config/          # Configuration classes
    ├── controller/      # REST controllers
    ├── service/         # Business logic
    ├── repository/      # Database repositories
    ├── entity/          # JPA entities
    ├── dto/             # Data Transfer Objects
    ├── mapper/          # Entity <-> DTO mappers
    ├── client/          # Feign clients (for other services)
    ├── event/           # Kafka event models (Phase 2)
    └── exception/       # Custom exceptions
```

### 5. Create a Health Check Controller (Test Registration)

Create `src/main/java/com/yushan/analytics/controller/HealthController.java`:

```java
package com.yushan.analytics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "analytics-service");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Analytics Service is running!");
        return response;
    }
}
```

---

## Step 7: Build and Run

### Using Maven Wrapper (Recommended)
```bash
# Make the wrapper executable (Linux/Mac)
chmod +x mvnw

# Clean and build
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

### Using Installed Maven
```bash
mvn clean install
mvn spring-boot:run
```

---

## Step 8: Verify Registration with Eureka

1. **Start Eureka Server** (if not running):
   ```bash
   cd ../yushan-platform-service-registry
   docker-compose up -d
   ```

2. **Start Analytics Service**:
   ```bash
   cd yushan-analytics-service
   ./mvnw spring-boot:run
   ```

3. **Check Eureka Dashboard**:
   - Open: http://localhost:8761
   - You should see: **ANALYTICS-SERVICE** listed under "Instances currently registered with Eureka"

4. **Test the Health Endpoint**:
   ```bash
   # Via direct port
   curl http://localhost:8083/api/v1/health
   
   # Via Actuator
   curl http://localhost:8083/actuator/health
   ```

---

## Expected Output

### Console Logs (Success)
```
2024-10-15 10:30:15 - Starting AnalyticsServiceApplication
2024-10-15 10:30:18 - Tomcat started on port(s): 8083 (http)
2024-10-15 10:30:20 - DiscoveryClient_ANALYTICS-SERVICE/analytics-service:8083 - registration status: 204
2024-10-15 10:30:20 - Started AnalyticsServiceApplication in 8.5 seconds
```

### Eureka Dashboard
```
Instances currently registered with Eureka:
✅ ANALYTICS-SERVICE - 1 instance(s)
   Instance ID: analytics-service:8083
   Status: UP (1)
```

---

## Next Steps

Once this basic setup is working:

1. ✅ Set up PostgreSQL database
2. ✅ Create database entities (ReadingHistory, NovelRanking, etc.)
3. ✅ Set up Flyway migrations
4. ✅ Create repositories and services
5. ✅ Implement API endpoints
6. ✅ Add Feign clients for inter-service communication
7. ✅ Set up Redis caching
8. ✅ Add Kafka consumers (Phase 2)

---

## Troubleshooting

**Problem: Service won't register with Eureka**
- Ensure Eureka is running: `docker ps`
- Check logs: Look for "DiscoveryClient" messages
- Verify `defaultZone` URL is correct

**Problem: Port 8083 already in use**
- Find process: `lsof -i :8083` (Mac/Linux) or `netstat -ano | findstr :8083` (Windows)
- Kill process or change port in `application.yml`

**Problem: Build fails**
- Ensure Java 21 is installed: `java -version`
- Check Maven: `./mvnw -version`
- Clean and rebuild: `./mvnw clean install -U`
