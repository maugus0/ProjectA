# Mono-Repo Microservices Deployment Guide

## Deployment Architecture Overview

In a mono-repo approach, you maintain all services in one repository but deploy them as separate, independent services. Here's how to structure and deploy:

## Repository Structure
```
webnovel-platform/
├── services/
│   ├── api-gateway/
│   │   ├── src/main/java/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   ├── user-service/
│   │   ├── src/main/java/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   ├── novel-service/
│   ├── chapter-service/
│   ├── gamification-service/
│   └── yuan-service/
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── shared/
│   └── common/
│       └── pom.xml
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production-like testing
├── .github/workflows/          # CI/CD pipelines
└── deployment/
    ├── kubernetes/
    └── scripts/
```

## Deployment Strategies

### Strategy 1: Container-Based with Orchestration

#### Docker Setup
Each service has its own `Dockerfile`:

**Example: user-service/Dockerfile**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/user-service-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Example: frontend/Dockerfile**
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

#### Local Development with Docker Compose
**docker-compose.yml**
```yaml
version: '3.8'
services:
  api-gateway:
    build: ./services/api-gateway
    ports: ['8080:8080']
    depends_on: [user-service, novel-service]
    
  user-service:
    build: ./services/user-service
    ports: ['8081:8080']
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DB_URL=jdbc:postgresql://user-db:5432/userdb
    depends_on: [user-db]
    
  novel-service:
    build: ./services/novel-service
    ports: ['8082:8080']
    depends_on: [novel-db]
    
  chapter-service:
    build: ./services/chapter-service
    ports: ['8083:8080']
    
  gamification-service:
    build: ./services/gamification-service
    ports: ['8084:8080']
    
  yuan-service:
    build: ./services/yuan-service
    ports: ['8085:8080']
    
  frontend:
    build: ./frontend
    ports: ['3000:80']
    depends_on: [api-gateway]
    
  # Databases
  user-db:
    image: postgres:13
    environment:
      POSTGRES_DB: userdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes: ['user_data:/var/lib/postgresql/data']
    
  novel-db:
    image: postgres:13
    environment:
      POSTGRES_DB: noveldb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes: ['novel_data:/var/lib/postgresql/data']

volumes:
  user_data:
  novel_data:
```

### Strategy 2: Cloud Platform Deployment

#### Option A: AWS Deployment

**1. Amazon ECS (Elastic Container Service)**
```yaml
# deployment/aws/ecs-task-definition.json
{
  "family": "webnovel-user-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "user-service",
      "image": "your-account.dkr.ecr.region.amazonaws.com/webnovel-user-service:latest",
      "portMappings": [{"containerPort": 8080, "protocol": "tcp"}],
      "environment": [
        {"name": "SPRING_PROFILES_ACTIVE", "value": "prod"}
      ]
    }
  ]
}
```

**2. AWS Elastic Beanstalk (Alternative)**
- Each service deployed as separate Elastic Beanstalk application
- Upload JAR files directly or use Docker containers

#### Option B: Google Cloud Platform

**Google Cloud Run**
```yaml
# deployment/gcp/user-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: user-service
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
      - image: gcr.io/your-project/webnovel-user-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
```

#### Option C: Azure Container Instances

**Azure Container Apps**
```yaml
# deployment/azure/user-service.yaml
apiVersion: apps/v1alpha1
kind: ContainerApp
metadata:
  name: user-service
spec:
  configuration:
    ingress:
      external: false
      targetPort: 8080
  template:
    containers:
    - name: user-service
      image: yourregistry.azurecr.io/webnovel-user-service:latest
      env:
      - name: SPRING_PROFILES_ACTIVE
        value: "prod"
```

## CI/CD Pipeline Implementation

### GitHub Actions Workflow
**.github/workflows/deploy.yml**
```yaml
name: Deploy Microservices

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      user-service: ${{ steps.changes.outputs.user-service }}
      novel-service: ${{ steps.changes.outputs.novel-service }}
      frontend: ${{ steps.changes.outputs.frontend }}
    steps:
    - uses: actions/checkout@v3
    - uses: dorny/paths-filter@v2
      id: changes
      with:
        filters: |
          user-service:
            - 'services/user-service/**'
            - 'shared/common/**'
          novel-service:
            - 'services/novel-service/**'
            - 'shared/common/**'
          frontend:
            - 'frontend/**'

  build-and-deploy-user-service:
    needs: detect-changes
    if: needs.detect-changes.outputs.user-service == 'true'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Build shared common
      run: |
        cd shared/common
        mvn clean install
    
    - name: Build user-service
      run: |
        cd services/user-service
        mvn clean package
    
    - name: Build Docker image
      run: |
        cd services/user-service
        docker build -t webnovel-user-service:${{ github.sha }} .
    
    - name: Deploy to Cloud (Example: AWS ECR + ECS)
      run: |
        # Push to ECR
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
        docker tag webnovel-user-service:${{ github.sha }} $ECR_REGISTRY/webnovel-user-service:${{ github.sha }}
        docker push $ECR_REGISTRY/webnovel-user-service:${{ github.sha }}
        
        # Update ECS service
        aws ecs update-service --cluster webnovel-cluster --service user-service --force-new-deployment

  # Similar jobs for other services...
```

## Deployment Commands & Scripts

### Build All Services Script
**deployment/scripts/build-all.sh**
```bash
#!/bin/bash

echo "Building shared common library..."
cd shared/common && mvn clean install && cd ../..

echo "Building all services..."
for service in services/*/; do
    if [ -d "$service" ]; then
        echo "Building $(basename "$service")..."
        cd "$service"
        mvn clean package
        docker build -t "webnovel-$(basename "$service"):latest" .
        cd ../..
    fi
done

echo "Building frontend..."
cd frontend
npm install && npm run build
docker build -t webnovel-frontend:latest .
cd ..

echo "All services built successfully!"
```

### Deploy to Production Script
**deployment/scripts/deploy-prod.sh**
```bash
#!/bin/bash

# Set environment
export ENVIRONMENT=production

# Deploy each service
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platform
# kubectl apply -f deployment/kubernetes/
# Or use cloud-specific deployment commands
```

## Service Discovery & Configuration

### Spring Cloud Configuration
**application.yml in each service**
```yaml
spring:
  application:
    name: user-service
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
```

### Environment-Specific Configuration
**application-docker.yml**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://user-db:5432/userdb
    username: user
    password: password

server:
  port: 8080
```

**application-prod.yml**
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}

server:
  port: ${PORT:8080}
```

## Monitoring & Health Checks

### Health Check Configuration
Each service includes:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### Load Balancer Health Checks
```yaml
# In docker-compose.yml
user-service:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
```

## Database Management

### Database Per Service
```yaml
# docker-compose.yml databases section
services:
  user-db:
    image: postgres:13
    environment:
      POSTGRES_DB: userdb
      
  novel-db:
    image: postgres:13
    environment:
      POSTGRES_DB: noveldb
      
  gamification-db:
    image: postgres:13
    environment:
      POSTGRES_DB: gamificationdb
```

### Database Migrations
Each service manages its own database schema:
```properties
# application.properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.locations=classpath:db/migration
```

## Key Benefits of This Mono-Repo Approach

1. **Coordinated Deployments**: Can deploy related changes across services atomically
2. **Shared Code Management**: Common libraries and utilities in one place
3. **Simplified CI/CD**: Single pipeline with intelligent service detection
4. **Developer Experience**: One repository to clone and understand the entire system
5. **Refactoring Support**: Easier to make cross-service changes

## Production Deployment Checklist

- [ ] Environment-specific configuration files
- [ ] Database migration scripts
- [ ] Health check endpoints on all services
- [ ] Logging configuration (centralized logging)
- [ ] Metrics and monitoring setup
- [ ] Security configurations (HTTPS, authentication)
- [ ] Resource limits and scaling policies
- [ ] Backup and disaster recovery procedures
- [ ] Load balancer configuration
- [ ] Service mesh setup (if using Kubernetes)
