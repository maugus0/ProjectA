# Yushan Config Server - Setup Guide

## Part 1: Generate Project with Spring Initializr

### Option A: Using Web Interface (Recommended)

1. Go to [https://start.spring.io](https://start.spring.io)

2. Configure the project:
   - **Project**: Maven
   - **Language**: Java
   - **Spring Boot**: 3.4.10 (match your other services)
   - **Project Metadata**:
     - Group: `com.yushan`
     - Artifact: `config-server`
     - Name: `Yushan Config Server`
     - Description: `Centralized Configuration Server for Yushan Platform`
     - Package name: `com.yushan.config`
     - Packaging: `Jar`
     - Java: `21` (match your other services)

3. Add Dependencies (click "ADD DEPENDENCIES" button):
   - **Config Server** (under Spring Cloud Config)
   - **Eureka Discovery Client** (under Spring Cloud Discovery)
   - **Spring Boot Actuator** (under Ops)

4. Click **GENERATE** button

5. Extract the downloaded zip file

### Option B: Using Spring CLI

```bash
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.4.10 \
  -d baseDir=yushan-config-server \
  -d groupId=com.yushan \
  -d artifactId=config-server \
  -d name=yushan-config-server \
  -d description="Centralized Configuration Server for Yushan Platform" \
  -d packageName=com.yushan.config \
  -d packaging=jar \
  -d javaVersion=21 \
  -d dependencies=cloud-config-server,cloud-eureka,actuator \
  -o yushan-config-server.zip

unzip yushan-config-server.zip
cd yushan-config-server
```

### Option C: Direct Link

Click this link to open Spring Initializr with pre-configured settings:

```
https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.4.10&packaging=jar&jvmVersion=21&groupId=com.yushan&artifactId=config-server&name=Yushan%20Config%20Server&description=Centralized%20Configuration%20Server%20for%20Yushan%20Platform&packageName=com.yushan.config&dependencies=cloud-config-server,cloud-eureka,actuator
```

---

## Part 2: Verify pom.xml

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
    <artifactId>config-server</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    <name>Yushan Config Server</name>
    <description>Centralized Configuration Server for Yushan Platform</description>
    
    <!-- Java Version -->
    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2024.0.2</spring-cloud.version>
    </properties>
    
    <!-- Dependencies -->
    <dependencies>
        <!-- Config Server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
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
            </plugin>
        </plugins>
    </build>
</project>
```

---

## Part 3: Project Structure

After generation, your project structure should be:

```
yushan-config-server/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── yushan/
│   │   │           └── config/
│   │   │               └── ConfigServerApplication.java (generated)
│   │   └── resources/
│   │       ├── application.properties (generated - we'll replace)
│   │       └── static/
│   └── test/
│       └── java/
│           └── com/
│               └── yushan/
│                   └── config/
│                       └── ConfigServerApplicationTests.java (generated)
├── .gitignore (generated)
├── mvnw (generated)
├── mvnw.cmd (generated)
├── pom.xml (generated)
└── README.md (you'll create this)
```

---

## Part 4: Update Main Application Class

**File**: `src/main/java/com/yushan/config/ConfigServerApplication.java`

Update the generated class to:

```java
package com.yushan.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableConfigServer
@EnableDiscoveryClient
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

**Key annotations:**
- `@EnableConfigServer` - Enables Spring Cloud Config Server functionality
- `@EnableDiscoveryClient` - Registers with Eureka

---

## Part 5: Create Configuration Files

### Delete application.properties and Create application.yml

Delete: `src/main/resources/application.properties`

Create: `src/main/resources/application.yml`

```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  
  cloud:
    config:
      server:
        # Git Backend Configuration
        git:
          uri: https://github.com/your-username/yushan-config-repo
          # If private repo, use SSH or add credentials
          # username: your-github-username
          # password: your-github-token
          default-label: main
          clone-on-start: true
          # Search for config files in the root directory
          search-paths: /
        
        # Native Backend (for local development/testing)
        # Uncomment to use local filesystem instead of Git
        # native:
        #   search-locations: classpath:/configs,file:./configs

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
        include: health,info,env,refresh
  endpoint:
    health:
      show-details: always

# Logging
logging:
  level:
    org.springframework.cloud.config: DEBUG
    com.yushan.config: DEBUG
```

### Create application-docker.yml

**File**: `src/main/resources/application-docker.yml`

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/

spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/yushan-config-repo
          default-label: main
```

### Create application-native.yml (for local testing)

**File**: `src/main/resources/application-native.yml`

```yaml
spring:
  profiles:
    active: native
  cloud:
    config:
      server:
        native:
          search-locations: classpath:/configs
```

---

## Part 6: Create Sample Config Files (for Native/Local Testing)

Create directory: `src/main/resources/configs/`

### Create sample config for each service:

**File**: `src/main/resources/configs/user-service.yml`

```yaml
# User Service Configuration
server:
  port: 8081

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_users
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: your-secret-key-change-this-in-production-minimum-256-bits
  expiration: 86400000

logging:
  level:
    com.yushan.user: DEBUG
```

**File**: `src/main/resources/configs/content-service.yml`

```yaml
# Content Service Configuration
server:
  port: 8082

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_content
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    com.yushan.content: DEBUG
```

**File**: `src/main/resources/configs/analytics-service.yml`

```yaml
# Analytics Service Configuration
server:
  port: 8083

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_analytics
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    com.yushan.analytics: DEBUG
```

**File**: `src/main/resources/configs/engagement-service.yml`

```yaml
# Engagement Service Configuration
server:
  port: 8084

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_engagement
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    com.yushan.engagement: DEBUG
```

**File**: `src/main/resources/configs/gamification-service.yml`

```yaml
# Gamification Service Configuration
server:
  port: 8085

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_gamification
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    com.yushan.gamification: DEBUG
```

**File**: `src/main/resources/configs/api-gateway.yml`

```yaml
# API Gateway Configuration
server:
  port: 8080

spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true

jwt:
  secret: your-secret-key-change-this-in-production-minimum-256-bits

logging:
  level:
    com.yushan.gateway: DEBUG
```

**File**: `src/main/resources/configs/application.yml` (common config)

```yaml
# Common Configuration for All Services
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always

logging:
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

---

## Part 7: Update Test Class

**File**: `src/test/java/com/yushan/config/ConfigServerApplicationTests.java`

```java
package com.yushan.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.cloud.config.server.git.uri=https://github.com/spring-cloud-samples/config-repo",
    "eureka.client.enabled=false"
})
class ConfigServerApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

---

## Part 8: Create Dockerfile

**File**: `Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8888

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Part 9: Create .dockerignore

**File**: `.dockerignore`

```
target/
.mvn/wrapper/maven-wrapper.jar
.git
.gitignore
*.md
.idea
*.iml
.vscode
```

---

## Part 10: Create README

**File**: `README.md`

```markdown
# Yushan Config Server

Centralized configuration management server for Yushan Novel Platform microservices.

## Features

- Centralized configuration management
- Git-backed configuration storage
- Service discovery via Eureka
- Environment-specific configurations
- Automatic configuration refresh

## Running Locally

### Prerequisites
- Java 21+
- Maven 3.8+
- Eureka Server running on port 8761
- Git repository with configuration files (or use native profile)

### Start with Native Profile (Local Testing)
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=native
```

### Start with Git Profile (Production)
```bash
./mvnw spring-boot:run
```

The config server will start on port 8888.

## Configuration Structure

### Git Repository Structure
```
yushan-config-repo/
├── application.yml              # Common config for all services
├── user-service.yml            # User service specific config
├── content-service.yml         # Content service specific config
├── analytics-service.yml       # Analytics service specific config
├── engagement-service.yml      # Engagement service specific config
├── gamification-service.yml    # Gamification service specific config
└── api-gateway.yml            # API Gateway specific config
```

## API Endpoints

### Get configuration for a service
```bash
# Default profile
curl http://localhost:8888/user-service/default

# Specific profile
curl http://localhost:8888/user-service/production

# Specific label/branch
curl http://localhost:8888/user-service/default/main
```

### Health check
```bash
curl http://localhost:8888/actuator/health
```

## Using Config Server in Services

### 1. Add dependency to service pom.xml
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

### 2. Create bootstrap.yml in service
```yaml
spring:
  application:
    name: user-service
  cloud:
    config:
      uri: http://localhost:8888
      fail-fast: true
```

### 3. Move service configs to config repository

## Docker

### Build image
```bash
docker build -t yushan-config-server:latest .
```

### Run container
```bash
docker run -d \
  --name yushan-config-server \
  -p 8888:8888 \
  -e SPRING_CLOUD_CONFIG_SERVER_GIT_URI=https://github.com/your-username/yushan-config-repo \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/ \
  yushan-config-server:latest
```

## Environment Variables

- `SPRING_CLOUD_CONFIG_SERVER_GIT_URI` - Git repository URL
- `SPRING_CLOUD_CONFIG_SERVER_GIT_USERNAME` - Git username (for private repos)
- `SPRING_CLOUD_CONFIG_SERVER_GIT_PASSWORD` - Git password/token (for private repos)
- `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` - Eureka server URL
```

---

## Part 11: Build and Run

### Build the project

```bash
# Make mvnw executable (Linux/Mac)
chmod +x mvnw

# Build the project
./mvnw clean package -DskipTests

# Or on Windows
mvnw.cmd clean package -DskipTests
```

### Run locally with Native profile (recommended for initial testing)

```bash
# Run with native profile (uses local config files)
./mvnw spring-boot:run -Dspring-boot.run.profiles=native

# Or run the JAR directly
java -jar -Dspring.profiles.active=native target/config-server-1.0.0.jar
```

### Verify it's working

```bash
# Check health
curl http://localhost:8888/actuator/health

# Test getting config for user-service
curl http://localhost:8888/user-service/default

# Check Eureka dashboard - you should see config-server registered
open http://localhost:8761
```

---

## Part 12: Create Git Config Repository (Optional - for Production)

### Step 1: Create a new GitHub repository

1. Go to GitHub and create a new repository named `yushan-config-repo`
2. Make it public (or private if you want, but you'll need credentials)
3. Don't initialize with README

### Step 2: Create config files locally

```bash
# Create a new directory
mkdir yushan-config-repo
cd yushan-config-repo
git init

# Create config files (copy from src/main/resources/configs/)
# Create application.yml, user-service.yml, etc.

# Commit and push
git add .
git commit -m "Initial configuration"
git branch -M main
git remote add origin https://github.com/your-username/yushan-config-repo.git
git push -u origin main
```

### Step 3: Update application.yml

Update the Git URI in `application.yml`:

```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/yushan-config-repo
          default-label: main
```

### Step 4: Restart Config Server

```bash
# Stop the server (Ctrl+C)
# Restart without native profile
./mvnw spring-boot:run
```

---

## Part 13: Build and Run with Docker

### Build Docker image

```bash
cd yushan-config-server

# Build the image
docker build -t yushan-config-server:latest .
```

### Run container (connecting to local Eureka)

```bash
# Run with native profile (local testing)
docker run -d \
  --name yushan-config-server \
  -p 8888:8888 \
  -e SPRING_PROFILES_ACTIVE=native \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  yushan-config-server:latest

# Or run with Git backend (production)
docker run -d \
  --name yushan-config-server \
  -p 8888:8888 \
  -e SPRING_CLOUD_CONFIG_SERVER_GIT_URI=https://github.com/your-username/yushan-config-repo \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  yushan-config-server:latest
```

### Check logs

```bash
# View logs
docker logs yushan-config-server

# Follow logs
docker logs -f yushan-config-server
```

---

## Part 14: Testing the Config Server

### Test 1: Check Health

```bash
curl http://localhost:8888/actuator/health
```

**Expected response:**
```json
{
  "status": "UP",
  "components": {
    "configServer": {
      "status": "UP"
    }
  }
}
```

### Test 2: Get Service Configuration

```bash
# Get user-service configuration
curl http://localhost:8888/user-service/default

# Get content-service configuration
curl http://localhost:8888/content-service/default

# Get all configurations
curl http://localhost:8888/application/default
```

**Expected response (example):**
```json
{
  "name": "user-service",
  "profiles": ["default"],
  "label": null,
  "version": null,
  "state": null,
  "propertySources": [
    {
      "name": "classpath:/configs/user-service.yml",
      "source": {
        "server.port": 8081,
        "spring.datasource.url": "jdbc:postgresql://localhost:5432/yushan_users"
      }
    }
  ]
}
```

### Test 3: Verify Eureka Registration

```bash
# Check Eureka dashboard
open http://localhost:8761

# You should see CONFIG-SERVER listed
```

---

## Troubleshooting

### Issue 1: Can't connect to Git repository

**Problem**: Config server can't clone Git repo.

**Solutions**:
```yaml
# Use HTTPS with token (for private repos)
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/yushan-config-repo
          username: your-github-username
          password: ghp_your_github_personal_access_token

# Or use SSH
spring:
  cloud:
    config:
      server:
        git:
          uri: git@github.com:your-username/yushan-config-repo.git
          ignore-local-ssh-settings: false
```

### Issue 2: Services can't connect to Config Server

**Problem**: Microservices can't fetch configuration.

**Check**:
1. Config Server is running on port 8888
2. Service has `spring-cloud-starter-config` dependency
3. Service has correct `bootstrap.yml` with Config Server URI

### Issue 3: Configuration not updating

**Problem**: Changes in Git repo not reflected.

**Solution**:
```bash
# Trigger refresh endpoint in Config Server
curl -X POST http://localhost:8888/actuator/refresh

# Or restart Config Server
```

---

## Next Steps

1. ✅ Generate project with Spring Initializr
2. ✅ Create configuration files
3. ✅ Build and test locally with native profile
4. ✅ Create Git config repository (optional)
5. ✅ Build Docker image
6. ⏭️ Update your microservices to use Config Server!

The Config Server is now ready to provide centralized configuration for all your microservices!
