# Microservices Migration & Implementation Guide

## Project Overview
Migration from monolithic Yushan backend to microservices architecture with 5 core services, API Gateway, Config Server, and Eureka Service Discovery.

## Architecture Components

### Current Services
1. **User Service** - Identity & Access Management
2. **Content Service** - Novel & Chapter Management
3. **Engagement Service** - Social Interactions
4. **Gamification Service** - Rewards & Engagement Metrics
5. **Analytics Service** - Ranking, History & Reporting

### Infrastructure Services (To Implement)
6. **API Gateway** - Single entry point for all client requests
7. **Config Server** - Centralized configuration management
8. **Eureka Server** - Service discovery (already in use)

---

## Hosting Recommendation: **DigitalOcean**

### Why DigitalOcean?
- **Most Cost-Effective**: $4-6/month per droplet vs AWS t2.micro ($8.50+/month)
- **Simple Pricing**: No hidden costs or complex pricing tiers
- **Easy Setup**: Straightforward UI, perfect for class projects
- **Free Credits**: $200 credit for 60 days with student/new accounts
- **Predictable Costs**: Fixed monthly pricing, no surprise bills

### Cost Breakdown (1 Week Hosting)
| Component | Droplet Size | Monthly Cost | Weekly Cost |
|-----------|--------------|--------------|-------------|
| API Gateway | Basic (1GB RAM) | $6 | ~$1.50 |
| Config Server | Basic (1GB RAM) | $6 | ~$1.50 |
| Eureka Server | Basic (1GB RAM) | $6 | ~$1.50 |
| User Service | Basic (1GB RAM) | $6 | ~$1.50 |
| Content Service | Basic (1GB RAM) | $6 | ~$1.50 |
| Engagement Service | Basic (1GB RAM) | $6 | ~$1.50 |
| Gamification Service | Basic (1GB RAM) | $6 | ~$1.50 |
| Analytics Service | Basic (1GB RAM) | $6 | ~$1.50 |
| Database | Managed PostgreSQL | $15 | ~$3.75 |
| **Total** | | **$69/month** | **~$17.25** |

**With $200 free credit = $0 actual cost for your presentation!**

### Alternative: Container-Based Deployment (Even Cheaper)
Deploy all services on **2-3 larger droplets** using Docker:
- 1x 4GB RAM droplet for infrastructure ($24/mo = $6/week)
- 1x 4GB RAM droplet for services ($24/mo = $6/week)
- **Total: ~$12 for one week** (or free with credits)

---

## Implementation Roadmap

### Phase 1: Infrastructure Setup (Day 1-2)

#### Step 1.1: Create Config Server Repository
```
yushan-config-server/
├── src/main/
│   ├── java/com/yushan/config/
│   │   └── ConfigServerApplication.java
│   └── resources/
│       ├── application.yml
│       └── bootstrap.yml
├── pom.xml
└── README.md
```

**Key Dependencies (pom.xml)**:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

**ConfigServerApplication.java**:
```java
@SpringBootApplication
@EnableConfigServer
@EnableEurekaClient
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

**application.yml**:
```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-org/yushan-config-repo
          default-label: main
          clone-on-start: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

#### Step 1.2: Create Config Repository (Separate Git Repo)
```
yushan-config-repo/
├── user-service.yml
├── content-service.yml
├── engagement-service.yml
├── gamification-service.yml
├── analytics-service.yml
├── api-gateway.yml
└── application.yml (common configs)
```

**Example: user-service.yml**:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/yushan_users
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

server:
  port: 8081

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_URL:http://localhost:8761/eureka/}
```

#### Step 1.3: Create API Gateway Repository
```
yushan-api-gateway/
├── src/main/
│   ├── java/com/yushan/gateway/
│   │   ├── ApiGatewayApplication.java
│   │   ├── config/
│   │   │   └── GatewayConfig.java
│   │   └── filter/
│   │       └── AuthenticationFilter.java
│   └── resources/
│       └── application.yml
├── pom.xml
└── README.md
```

**Key Dependencies**:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**ApiGatewayApplication.java**:
```java
@SpringBootApplication
@EnableEurekaClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

**application.yml**:
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - RewritePath=/api/users/(?<segment>.*), /${segment}
            
        - id: content-service
          uri: lb://content-service
          predicates:
            - Path=/api/novels/**, /api/chapters/**
          filters:
            - RewritePath=/api/(?<segment>.*), /${segment}
            
        - id: engagement-service
          uri: lb://engagement-service
          predicates:
            - Path=/api/comments/**, /api/reviews/**
          filters:
            - RewritePath=/api/(?<segment>.*), /${segment}
            
        - id: gamification-service
          uri: lb://gamification-service
          predicates:
            - Path=/api/exp/**, /api/yuan/**, /api/achievements/**
          filters:
            - RewritePath=/api/(?<segment>.*), /${segment}
            
        - id: analytics-service
          uri: lb://analytics-service
          predicates:
            - Path=/api/analytics/**, /api/rankings/**, /api/history/**
          filters:
            - RewritePath=/api/(?<segment>.*), /${segment}

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

---

### Phase 2: Update Existing Services (Day 3-4)

#### Update all 5 services to use Config Server

**Add to each service's pom.xml**:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**Create bootstrap.yml in each service**:
```yaml
spring:
  application:
    name: user-service  # Change per service
  cloud:
    config:
      uri: http://localhost:8888
      fail-fast: true
      retry:
        max-attempts: 5
```

**Move service-specific configs from application.yml to config repo**

---

### Phase 3: Database Strategy

#### Option A: Single Database (Simpler for Class Project)
- One PostgreSQL instance
- Separate schemas for each service
- Schemas: `yushan_users`, `yushan_content`, `yushan_engagement`, `yushan_gamification`, `yushan_analytics`

#### Option B: Database Per Service (True Microservices)
- 5 separate PostgreSQL databases
- Better isolation but higher cost
- **Recommendation**: Use Option A for this project

---

### Phase 4: DigitalOcean Deployment

#### Setup Steps:

**1. Create DigitalOcean Account**
- Sign up with GitHub Student Developer Pack for $200 credit
- Or use referral link for $200/60-day credit

**2. Provision Droplets**

**Option A: Individual Droplets (Easier to Debug)**
```bash
# Create 8 droplets (1GB RAM each, Ubuntu 22.04)
- eureka-server
- config-server
- api-gateway
- user-service
- content-service
- engagement-service
- gamification-service
- analytics-service
```

**Option B: Docker Compose on 2 Droplets (More Efficient)**
- 1x 4GB droplet: Infrastructure (Eureka, Config, API Gateway, DB)
- 1x 4GB droplet: Services (All 5 microservices)

**3. Create Managed PostgreSQL Database**
```bash
# DigitalOcean Console
Databases → Create → PostgreSQL 15
Plan: Basic ($15/mo)
Region: Same as droplets (e.g., Singapore)
```

**4. Setup Deployment Script**

Create `deploy.sh` for each service:
```bash
#!/bin/bash
SERVICE_NAME="user-service"
JAR_FILE="target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_USER="root"
REMOTE_HOST="your-droplet-ip"

# Build
./mvnw clean package -DskipTests

# Copy to server
scp ${JAR_FILE} ${REMOTE_USER}@${REMOTE_HOST}:/opt/${SERVICE_NAME}/

# Restart service
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl restart ${SERVICE_NAME}"
```

**5. Create SystemD Service Files**

Example for user-service:
```ini
# /etc/systemd/system/user-service.service
[Unit]
Description=User Service
After=syslog.target network.target

[Service]
User=yushan
ExecStart=/usr/bin/java -jar /opt/user-service/user-service.jar
SuccessExitStatus=143
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="EUREKA_URL=http://eureka-server-ip:8761/eureka"
Environment="CONFIG_SERVER_URL=http://config-server-ip:8888"

[Install]
WantedBy=multi-user.target
```

---

### Phase 5: Docker Deployment (Recommended Approach)

#### Create docker-compose.yml for entire stack:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: yushan
      POSTGRES_USER: yushan
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  eureka-server:
    build: ./eureka-server
    ports:
      - "8761:8761"
    environment:
      SPRING_PROFILES_ACTIVE: docker

  config-server:
    build: ./config-server
    ports:
      - "8888:8888"
    depends_on:
      - eureka-server
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka

  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server
      - config-server
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka
      SPRING_CLOUD_CONFIG_URI: http://config-server:8888

  user-service:
    build: ./user-service
    depends_on:
      - postgres
      - eureka-server
      - config-server
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/yushan
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka
      SPRING_CLOUD_CONFIG_URI: http://config-server:8888

  content-service:
    build: ./content-service
    depends_on:
      - postgres
      - eureka-server
      - config-server
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/yushan
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka
      SPRING_CLOUD_CONFIG_URI: http://config-server:8888

  engagement-service:
    build: ./engagement-service
    depends_on:
      - postgres
      - eureka-server
      - config-server
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/yushan
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka
      SPRING_CLOUD_CONFIG_URI: http://config-server:8888

  gamification-service:
    build: ./gamification-service
    depends_on:
      - postgres
      - eureka-server
      - config-server
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/yushan
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka
      SPRING_CLOUD_CONFIG_URI: http://config-server:8888

  analytics-service:
    build: ./analytics-service
    depends_on:
      - postgres
      - eureka-server
      - config-server
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/yushan
      EUREKA_CL
