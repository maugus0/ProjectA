# 🔗 Yushan Platform Microservices Integration Guide

## 📋 Overview

This guide shows how to integrate all 5 Yushan microservices with the Eureka Service Registry:

1. **User Service** (Port 8081) - User management, authentication
2. **Content Service** (Port 8082) - Novels, chapters, authors
3. **Engagement Service** (Port 8084) - Comments, likes, follows
4. **Gamification Service** (Port 8085) - Achievements, badges, leaderboards
5. **Analytics Service** (Port 8083) - Reading statistics, recommendations

---

## 🏗️ Architecture Overview

```
                    ┌─────────────────────────────┐
                    │   Eureka Service Registry   │
                    │       localhost:8761        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │   Service Registration &     │
                    │      Discovery Layer         │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────┬───────────────┼───────────────┬──────────┐
        │          │               │               │          │
        ▼          ▼               ▼               ▼          ▼
   ┌────────┐ ┌─────────┐  ┌────────────┐ ┌──────────┐ ┌──────────┐
   │  User  │ │ Content │  │ Engagement │ │Gamifica- │ │Analytics │
   │Service │ │ Service │  │  Service   │ │  tion    │ │ Service  │
   │ :8081  │ │  :8082  │  │   :8084    │ │ Service  │ │  :8083   │
   └────────┘ └─────────┘  └────────────┘ │  :8085   │ └──────────┘
        │          │              │        └──────────┘      │
        └──────────┴──────────────┴──────────────────────────┘
                    Inter-service Communication
                      (via Feign Clients)
```

---

## 🔧 Step-by-Step Integration for Each Service

### 🎯 Common Steps (Apply to ALL 5 Services)

#### Step 1: Add Eureka Client Dependency

Add to each service's `pom.xml`:

```xml
<dependencies>
    <!-- Existing dependencies... -->
    
    <!-- Eureka Client for Service Discovery -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    
    <!-- Feign Client for inter-service communication -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    
    <!-- Load Balancer -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
</dependencies>

<!-- Add Spring Cloud Dependency Management -->
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

---

#### Step 2: Enable Discovery Client

Add annotations to each service's main application class:

```java
@SpringBootApplication
@EnableDiscoveryClient  // ← Add this for Eureka registration
@EnableFeignClients     // ← Add this for calling other services
public class YourServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourServiceApplication.class, args);
    }
}
```

---

## 📝 Service-Specific Configurations

### 1️⃣ User Service Configuration

**File: `src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: user-service  # ⚠️ Service name - used by other services to find this one

server:
  port: 8081

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

# Actuator for health checks
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

**Main Class: `UserServiceApplication.java`**

```java
package com.yushan.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

---

### 2️⃣ Content Service Configuration

**File: `src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: content-service

server:
  port: 8082

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

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

**Main Class: `ContentServiceApplication.java`**

```java
package com.yushan.content;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ContentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContentServiceApplication.class, args);
    }
}
```

---

### 3️⃣ Analytics Service Configuration

**File: `src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: analytics-service

server:
  port: 8083

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

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

**Main Class: `AnalyticsServiceApplication.java`**

```java
package com.yushan.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class AnalyticsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
```

---

### 4️⃣ Engagement Service Configuration

**File: `src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: engagement-service

server:
  port: 8084

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

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

**Main Class: `EngagementServiceApplication.java`**

```java
package com.yushan.engagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class EngagementServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EngagementServiceApplication.class, args);
    }
}
```

---

### 5️⃣ Gamification Service Configuration

**File: `src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: gamification-service

server:
  port: 8085

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

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

**Main Class: `GamificationServiceApplication.java`**

```java
package com.yushan.gamification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class GamificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GamificationServiceApplication.class, args);
    }
}
```

---

## 🔗 Inter-Service Communication Examples

### Example 1: Analytics Service Calling Content Service

**Create Feign Client Interface:**

```java
package com.yushan.analytics.client;

import com.yushan.analytics.dto.NovelDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "content-service")  // Service name from Eureka
public interface ContentClient {
    
    @GetMapping("/api/novels/{id}")
    NovelDTO getNovel(@PathVariable("id") Long id);
    
    @GetMapping("/api/novels/{id}/chapters")
    List<ChapterDTO> getChapters(@PathVariable("id") Long id);
}
```

**Use in Service:**

```java
package com.yushan.analytics.service;

import com.yushan.analytics.client.ContentClient;
import org.springframework.stereotype.Service;

@Service
public class ReadingAnalyticsService {
    
    private final ContentClient contentClient;
    
    public ReadingAnalyticsService(ContentClient contentClient) {
        this.contentClient = contentClient;
    }
    
    public void trackReading(Long userId, Long novelId) {
        // Feign automatically discovers content-service from Eureka
        NovelDTO novel = contentClient.getNovel(novelId);
        
        // Your analytics logic here
        System.out.println("Tracking reading for novel: " + novel.getTitle());
    }
}
```

---

### Example 2: User Service Calling Gamification Service

**Create Feign Client:**

```java
package com.yushan.user.client;

import com.yushan.user.dto.AchievementDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "gamification-service")
public interface GamificationClient {
    
    @GetMapping("/api/achievements/user/{userId}")
    List<AchievementDTO> getUserAchievements(@PathVariable("userId") Long userId);
    
    @PostMapping("/api/achievements/unlock")
    void unlockAchievement(@RequestBody UnlockRequest request);
}
```

**Use in Service:**

```java
package com.yushan.user.service;

import com.yushan.user.client.GamificationClient;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {
    
    private final GamificationClient gamificationClient;
    
    public UserProfileService(GamificationClient gamificationClient) {
        this.gamificationClient = gamificationClient;
    }
    
    public UserProfile getUserProfile(Long userId) {
        // Get user achievements from gamification service
        List<AchievementDTO> achievements = 
            gamificationClient.getUserAchievements(userId);
        
        // Build user profile with achievements
        return UserProfile.builder()
            .userId(userId)
            .achievements(achievements)
            .build();
    }
}
```

---

### Example 3: Content Service Calling Analytics Service

**Create Feign Client:**

```java
package com.yushan.content.client;

import com.yushan.content.dto.ReadingStatsDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "analytics-service")
public interface AnalyticsClient {
    
    @GetMapping("/api/analytics/novels/{novelId}/stats")
    ReadingStatsDTO getNovelStats(@PathVariable("novelId") Long novelId);
    
    @PostMapping("/api/analytics/track-view")
    void trackNovelView(@RequestBody ViewEvent event);
}
```

---

### Example 4: Engagement Service Calling Multiple Services

**Create Multiple Feign Clients:**

```java
package com.yushan.engagement.client;

// User Service Client
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}

// Content Service Client
@FeignClient(name = "content-service")
public interface ContentClient {
    @GetMapping("/api/novels/{id}")
    NovelDTO getNovel(@PathVariable("id") Long id);
}

// Gamification Service Client
@FeignClient(name = "gamification-service")
public interface GamificationClient {
    @PostMapping("/api/achievements/unlock")
    void unlockAchievement(@RequestBody UnlockRequest request);
}
```

**Use All Clients Together:**

```java
package com.yushan.engagement.service;

import com.yushan.engagement.client.*;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    
    private final UserClient userClient;
    private final ContentClient contentClient;
    private final GamificationClient gamificationClient;
    
    public CommentService(UserClient userClient, 
                         ContentClient contentClient,
                         GamificationClient gamificationClient) {
        this.userClient = userClient;
        this.contentClient = contentClient;
        this.gamificationClient = gamificationClient;
    }
    
    public Comment createComment(Long userId, Long novelId, String text) {
        // Get user info
        UserDTO user = userClient.getUser(userId);
        
        // Get novel info
        NovelDTO novel = contentClient.getNovel(novelId);
        
        // Create comment
        Comment comment = Comment.builder()
            .userId(userId)
            .novelId(novelId)
            .text(text)
            .build();
        
        // Save comment...
        
        // Unlock achievement for first comment
        gamificationClient.unlockAchievement(
            new UnlockRequest(userId, "FIRST_COMMENT")
        );
        
        return comment;
    }
}
```

---

## 🐳 Docker Compose for All Services

Create a `docker-compose.yml` in your parent directory to run all services together:

```yaml
version: '3.8'

services:
  # Service Registry (Eureka)
  eureka-server:
    build: ./yushan-platform-service-registry
    container_name: yushan-eureka
    ports:
      - "8761:8761"
    networks:
      - yushan-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # User Service
  user-service:
    build: ./yushan-user-service
    container_name: yushan-user-service
    ports:
      - "8081:8081"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Content Service
  content-service:
    build: ./yushan-content-service
    container_name: yushan-content-service
    ports:
      - "8082:8082"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Analytics Service
  analytics-service:
    build: ./yushan-analytics-service
    container_name: yushan-analytics-service
    ports:
      - "8083:8083"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Engagement Service
  engagement-service:
    build: ./yushan-engagement-service
    container_name: yushan-engagement-service
    ports:
      - "8084:8084"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Gamification Service
  gamification-service:
    build: ./yushan-gamification-service
    container_name: yushan-gamification-service
    ports:
      - "8085:8085"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

networks:
  yushan-network:
    driver: bridge
    name: yushan-platform-network
```

---

## 🚀 Starting All Services

```bash
# Start all services
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f user-service

# Check status
docker-compose ps

# Stop all services
docker-compose down
```

---

## ✅ Verification Checklist

### 1. Check Eureka Dashboard

Open http://localhost:8761 and verify all 5 services appear:

```
Instances currently registered with Eureka:

✅ USER-SERVICE          - 1 instance(s)
✅ CONTENT-SERVICE       - 1 instance(s)
✅ ANALYTICS-SERVICE     - 1 instance(s)
✅ ENGAGEMENT-SERVICE    - 1 instance(s)
✅ GAMIFICATION-SERVICE  - 1 instance(s)
```

### 2. Test Health Endpoints

```bash
curl http://localhost:8081/actuator/health  # User Service
curl http://localhost:8082/actuator/health  # Content Service
curl http://localhost:8083/actuator/health  # Analytics Service
curl http://localhost:8084/actuator/health  # Engagement Service
curl http://localhost:8085/actuator/health  # Gamification Service
```

### 3. Test Service Discovery

```bash
# Check registered services via Eureka API
curl http://localhost:8761/eureka/apps

# Check specific service
curl http://localhost:8761/eureka/apps/USER-SERVICE
```

---

## 📊 Service Dependencies Matrix

| Service | Depends On | Why |
|---------|-----------|-----|
| **User Service** | Gamification | Get user achievements for profile |
| **Content Service** | Analytics, Engagement | Get reading stats, comment counts |
| **Analytics Service** | User, Content | Get user info, novel details for tracking |
| **Engagement Service** | User, Content, Gamification | Validate users, get novel info, unlock achievements |
| **Gamification Service** | User, Analytics | Get user info, reading stats for achievements |

---

## 🔒 Port Assignments Summary

| Service | Port | URL |
|---------|------|-----|
| Eureka Registry | 8761 | http://localhost:8761 |
| User Service | 8081 | http://localhost:8081 |
| Content Service | 8082 | http://localhost:8082 |
| Analytics Service | 8083 | http://localhost:8083 |
| Engagement Service | 8084 | http://localhost:8084 |
| Gamification Service | 8085 | http://localhost:8085 |

---

## 🎯 Next Steps

1. ✅ Apply these configurations to each service
2. ✅ Add Feign client interfaces for inter-service communication
3. ✅ Test service registration with Eureka
4. ✅ Test Feign client calls between services
5. ✅ Add error handling and circuit breakers (Resilience4j)
6. ✅ Implement API Gateway for external access

---

## 📚 Additional Resources

- **Feign Documentation**: https://cloud.spring.io/spring-cloud-openfeign/
- **Eureka Client Config**: https://cloud.spring.io/spring-cloud-netflix/reference/html/
- **Load Balancing**: https://spring.io/guides/gs/spring-cloud-loadbalancer/

---

**Ready to build an amazing microservices platform! 🚀**
