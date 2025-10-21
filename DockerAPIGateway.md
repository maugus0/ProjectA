# Docker Build Guide for Yushan API Gateway

## Current Setup Verification

Your services are running on:
- **Eureka Server**: `http://localhost:8761`
- **User Service**: `http://localhost:8081`
- **Content Service**: `http://localhost:8082`
- **Analytics Service**: `http://localhost:8083`
- **Engagement Service**: `http://localhost:8084`
- **Gamification Service**: `http://localhost:8085`
- **API Gateway**: `http://localhost:8080`

---

## Option 1: Build and Run API Gateway in Docker (Connecting to Host Services)

This approach runs only the API Gateway in Docker while connecting to your locally running services.

### Step 1: Create Dockerfile

**File**: `Dockerfile` (in your `yushan-api-gateway` root directory)

```dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Step 2: Create .dockerignore

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

### Step 3: Build Docker Image

```bash
# Navigate to api-gateway directory
cd yushan-api-gateway

# Build the Docker image
docker build -t yushan-api-gateway:latest .

# This will take a few minutes on first build
```

### Step 4: Run API Gateway Container

**On Linux/Mac:**
```bash
docker run -d \
  --name yushan-api-gateway \
  -p 8080:8080 \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  -e JWT_SECRET=your-secret-key-change-this-in-production-minimum-256-bits \
  --add-host=host.docker.internal:host-gateway \
  yushan-api-gateway:latest
```

**On Windows/Mac (Docker Desktop):**
```bash
docker run -d \
  --name yushan-api-gateway \
  -p 8080:8080 \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  -e JWT_SECRET=your-secret-key-change-this-in-production-minimum-256-bits \
  yushan-api-gateway:latest
```

**Explanation:**
- `-d`: Run in detached mode (background)
- `--name`: Container name
- `-p 8080:8080`: Map port 8080 from container to host
- `-e`: Set environment variables
- `host.docker.internal`: Special DNS name that resolves to host machine IP
- `--add-host`: Add host entry (Linux only)

### Step 5: Verify It's Running

```bash
# Check container status
docker ps

# Check logs
docker logs yushan-api-gateway

# Follow logs in real-time
docker logs -f yushan-api-gateway

# Test health endpoint
curl http://localhost:8080/actuator/health
```

### Step 6: Test Gateway Routes

```bash
# Test routing to User Service (port 8081)
curl http://localhost:8080/api/users/health

# Test routing to Content Service (port 8082)
curl http://localhost:8080/api/novels

# Test routing to Analytics Service (port 8083)
curl http://localhost:8080/api/rankings/novels
```

---

## Option 2: Run Everything in Docker (Complete Stack)

This approach containerizes all services including Eureka and your microservices.

### Step 1: Create docker-compose.yml

**File**: `docker-compose.yml` (in your project root, above all service folders)

```yaml
version: '3.8'

services:
  # Eureka Service Registry
  eureka-server:
    build:
      context: ./yushan-platform-service-registry
      dockerfile: Dockerfile
    container_name: yushan-eureka-server
    ports:
      - "8761:8761"
    networks:
      - yushan-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # API Gateway
  api-gateway:
    build:
      context: ./yushan-api-gateway
      dockerfile: Dockerfile
    container_name: yushan-api-gateway
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - JWT_SECRET=${JWT_SECRET:-your-secret-key-change-this-in-production}
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # User Service
  user-service:
    build:
      context: ./yushan-user-service
      dockerfile: Dockerfile
    container_name: yushan-user-service
    ports:
      - "8081:8081"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - DATABASE_URL=${USER_DB_URL:-jdbc:postgresql://postgres:5432/yushan_users}
      - DATABASE_USERNAME=${DB_USERNAME:-postgres}
      - DATABASE_PASSWORD=${DB_PASSWORD:-postgres}
      - JWT_SECRET=${JWT_SECRET:-your-secret-key}
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Content Service
  content-service:
    build:
      context: ./yushan-content-service
      dockerfile: Dockerfile
    container_name: yushan-content-service
    ports:
      - "8082:8082"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - DATABASE_URL=${CONTENT_DB_URL:-jdbc:postgresql://postgres:5432/yushan_content}
      - DATABASE_USERNAME=${DB_USERNAME:-postgres}
      - DATABASE_PASSWORD=${DB_PASSWORD:-postgres}
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Analytics Service
  analytics-service:
    build:
      context: ./yushan-analytics-service
      dockerfile: Dockerfile
    container_name: yushan-analytics-service
    ports:
      - "8083:8083"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - DATABASE_URL=${ANALYTICS_DB_URL:-jdbc:postgresql://postgres:5432/yushan_analytics}
      - DATABASE_USERNAME=${DB_USERNAME:-postgres}
      - DATABASE_PASSWORD=${DB_PASSWORD:-postgres}
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Engagement Service
  engagement-service:
    build:
      context: ./yushan-engagement-service
      dockerfile: Dockerfile
    container_name: yushan-engagement-service
    ports:
      - "8084:8084"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - DATABASE_URL=${ENGAGEMENT_DB_URL:-jdbc:postgresql://postgres:5432/yushan_engagement}
      - DATABASE_USERNAME=${DB_USERNAME:-postgres}
      - DATABASE_PASSWORD=${DB_PASSWORD:-postgres}
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # Gamification Service
  gamification-service:
    build:
      context: ./yushan-gamification-service
      dockerfile: Dockerfile
    container_name: yushan-gamification-service
    ports:
      - "8085:8085"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - DATABASE_URL=${GAMIFICATION_DB_URL:-jdbc:postgresql://postgres:5432/yushan_gamification}
      - DATABASE_USERNAME=${DB_USERNAME:-postgres}
      - DATABASE_PASSWORD=${DB_PASSWORD:-postgres}
    depends_on:
      eureka-server:
        condition: service_healthy
    networks:
      - yushan-network

  # PostgreSQL Database (optional - if you need it)
  postgres:
    image: postgres:15-alpine
    container_name: yushan-postgres
    environment:
      - POSTGRES_USER=${DB_USERNAME:-postgres}
      - POSTGRES_PASSWORD=${DB_PASSWORD:-postgres}
      - POSTGRES_DB=yushan
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - yushan-network

networks:
  yushan-network:
    driver: bridge

volumes:
  postgres-data:
```

### Step 2: Create .env file (Optional)

**File**: `.env` (in same directory as docker-compose.yml)

```env
# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password-here

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production-minimum-256-bits

# Database URLs (optional - defaults are in docker-compose.yml)
USER_DB_URL=jdbc:postgresql://postgres:5432/yushan_users
CONTENT_DB_URL=jdbc:postgresql://postgres:5432/yushan_content
ANALYTICS_DB_URL=jdbc:postgresql://postgres:5432/yushan_analytics
ENGAGEMENT_DB_URL=jdbc:postgresql://postgres:5432/yushan_engagement
GAMIFICATION_DB_URL=jdbc:postgresql://postgres:5432/yushan_gamification
```

### Step 3: Create Database Initialization Script

**File**: `init-db.sql` (in same directory as docker-compose.yml)

```sql
-- Create separate databases for each service
CREATE DATABASE yushan_users;
CREATE DATABASE yushan_content;
CREATE DATABASE yushan_analytics;
CREATE DATABASE yushan_engagement;
CREATE DATABASE yushan_gamification;

-- You can add initial schemas here if needed
```

### Step 4: Add Dockerfile to Each Service

Each of your services needs a Dockerfile. Create this file in each service directory:

**Example: `yushan-user-service/Dockerfile`**

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Repeat for all services**, changing the EXPOSE port:
- `yushan-content-service/Dockerfile` - EXPOSE 8082
- `yushan-analytics-service/Dockerfile` - EXPOSE 8083
- `yushan-engagement-service/Dockerfile` - EXPOSE 8084
- `yushan-gamification-service/Dockerfile` - EXPOSE 8085

### Step 5: Build and Run All Services

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api-gateway
```

### Step 6: Verify Everything is Running

```bash
# Check all containers
docker-compose ps

# Check Eureka Dashboard
open http://localhost:8761

# Test API Gateway
curl http://localhost:8080/actuator/health

# Test routing through gateway
curl http://localhost:8080/api/users/health
```

---

## Useful Docker Commands

### For Single Container (Option 1)

```bash
# Stop container
docker stop yushan-api-gateway

# Start container
docker start yushan-api-gateway

# Restart container
docker restart yushan-api-gateway

# Remove container
docker rm yushan-api-gateway

# View logs
docker logs yushan-api-gateway

# Execute command in container
docker exec -it yushan-api-gateway sh

# Rebuild image
docker build -t yushan-api-gateway:latest .
```

### For Docker Compose (Option 2)

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build api-gateway

# Rebuild all services
docker-compose build

# Restart specific service
docker-compose restart api-gateway

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api-gateway

# Scale a service (run multiple instances)
docker-compose up -d --scale user-service=2

# Check status
docker-compose ps

# Execute command in container
docker-compose exec api-gateway sh
```

---

## Troubleshooting

### Issue 1: Can't connect to host services from Docker

**Problem**: Gateway in Docker can't reach services on host.

**Solution for Linux**:
```bash
# Find your host IP
ip addr show docker0

# Use that IP instead of host.docker.internal
docker run -d \
  --name yushan-api-gateway \
  -p 8080:8080 \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://172.17.0.1:8761/eureka/ \
  yushan-api-gateway:latest
```

### Issue 2: Port already in use

```bash
# Find what's using the port
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Stop your local API Gateway before running Docker version
# Or change the port mapping
docker run -p 8090:8080 ...
```

### Issue 3: Services not registering with Eureka

**Check**:
1. Eureka is accessible from the container
2. Service names match in application.yml
3. Wait 30-60 seconds for registration

```bash
# Test Eureka from inside container
docker exec -it yushan-api-gateway sh
wget -O- http://eureka-server:8761/actuator/health
```

### Issue 4: Out of memory

```bash
# Increase memory limit
docker run -d \
  --name yushan-api-gateway \
  --memory="1g" \
  -p 8080:8080 \
  yushan-api-gateway:latest
```

---

## Recommended Approach for Your Case

Since your services are **already running locally**, I recommend **Option 1** first:

1. Build and run only the API Gateway in Docker
2. Connect it to your existing local services
3. Test the routing
4. Once working, you can optionally move to Option 2 for full containerization

**Quick Start (Option 1)**:
```bash
cd yushan-api-gateway

# Build
docker build -t yushan-api-gateway:latest .

# Run
docker run -d \
  --name yushan-api-gateway \
  -p 8080:8080 \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  yushan-api-gateway:latest

# Check logs
docker logs -f yushan-api-gateway

# Test
curl http://localhost:8080/actuator/health
```

This way you can verify the gateway works in Docker before containerizing everything else!
