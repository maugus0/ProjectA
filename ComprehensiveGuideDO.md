# Yushan Microservices Architecture - Complete Guide

## 📐 Architecture Overview

```
                            Users/Frontend
                                 ↓
                    [API Gateway :8080] ← Single entry point
                                 ↓
              [Service Registry (Eureka) :8761] ← Service discovery
                                 ↓
         ┌───────────────┬───────┴──────┬─────────────┬──────────────┐
         ↓               ↓              ↓             ↓              ↓
   [Config Server]  [User Service] [Content]    [Analytics]   [Engagement]
      :8888            :8081        :8082         :8083         :8084
         ↓                 ↓            ↓             ↓              ↓
   [Git Repo]         [PostgreSQL Database]                  [Gamification]
                                                                 :8085
```

---

## 🎯 Why Each Component Exists

### 1. 📞 Service Registry (Eureka Server) - Port 8761

**Think of it as:** A phone book for your microservices

#### What it solves:

**❌ Without Service Registry:**
```java
// User Service needs to call Content Service
String contentServiceUrl = "http://192.168.1.100:8082"; // Hardcoded IP!

// What if Content Service moves to a different server?
// What if you run 3 instances of Content Service?
// You have to change code and redeploy!
```

**✅ With Service Registry (Eureka):**
```java
// User Service just asks Eureka "Where's Content Service?"
String contentServiceUrl = "http://content-service/novels"; 

// Eureka automatically:
// - Finds available Content Service instances
// - Load balances between them
// - Removes dead instances
// - No code changes needed when services move!
```

#### Real Example:
Imagine you have 3 servers running Content Service:
- Server A crashes → Eureka removes it automatically
- Server B is healthy → Eureka routes traffic there
- Server C is added → Eureka includes it in load balancing

**Your services never need to know these details!**

---

### 2. 🚪 API Gateway - Port 8080

**Think of it as:** A single front door to your entire application

#### What it solves:

**❌ Without API Gateway:**
```javascript
// Frontend needs to track ALL service URLs
const userService = "http://yourapp.com:8081";
const contentService = "http://yourapp.com:8082";
const analyticsService = "http://yourapp.com:8083";
const engagementService = "http://yourapp.com:8084";
const gamificationService = "http://yourapp.com:8085";

// Every API call needs different authentication logic
// CORS needs to be configured on EVERY service
// You expose 5 different ports to the internet (security risk!)
```

**✅ With API Gateway:**
```javascript
// Frontend only knows ONE URL
const apiUrl = "http://yourapp.com/api";

// All routes go through gateway:
fetch(`${apiUrl}/auth/login`)      // → User Service
fetch(`${apiUrl}/novels`)          // → Content Service  
fetch(`${apiUrl}/rankings`)        // → Analytics Service
fetch(`${apiUrl}/comments`)        // → Engagement Service
fetch(`${apiUrl}/exp`)             // → Gamification Service

// Authentication happens ONCE at the gateway
// Only ONE port exposed to internet (8080)
// One place to handle CORS, rate limiting, logging
```

#### Benefits:

**Security:**
```
Before: Internet → User Service (8081) ✗ Exposed
        Internet → Content Service (8082) ✗ Exposed
        Internet → All Services ✗ Multiple attack surfaces

After:  Internet → API Gateway (8080) ✓ Single entry point
        Gateway → Services (internal network) ✓ Protected
```

**Authentication:**
```
Without Gateway:
- User Service checks JWT token
- Content Service checks JWT token  
- Analytics Service checks JWT token
→ JWT validation logic duplicated 5 times!

With Gateway:
- Gateway checks JWT token ONCE
- Adds user info to request headers
- Services trust the gateway
→ JWT validation in ONE place!
```

**Routing Example:**
```yaml
# Gateway automatically routes based on URL path
GET /api/users/123        → User Service at :8081
GET /api/novels/456       → Content Service at :8082
GET /api/comments         → Engagement Service at :8084

# Frontend doesn't know (or care) which service handles what!
```

---

### 3. ⚙️ Config Server - Port 8888

**Think of it as:** A centralized place to store ALL your configuration

#### What it solves:

**❌ Without Config Server:**
```
yushan-user-service/
  src/main/resources/
    application.yml          ← Database password here

yushan-content-service/
  src/main/resources/
    application.yml          ← Database password here

yushan-analytics-service/
  src/main/resources/
    application.yml          ← Database password here

Problem: Database password changed?
→ Update 5 different application.yml files
→ Rebuild 5 different services
→ Redeploy 5 different Docker containers
→ Takes hours!
```

**✅ With Config Server:**
```
yushan-config-repo/ (GitHub)
  application.yml            ← Database password here (ONE place)
  user-service.yml
  content-service.yml
  analytics-service.yml

Config Server reads from Git → Services read from Config Server

Database password changed?
→ Update ONE file in Git
→ Restart Config Server (or use /refresh endpoint)
→ Services automatically get new config
→ Takes 30 seconds!
```

#### Real Example:

**Scenario:** You need to change the database URL

**Without Config Server:**
1. Update `application.yml` in User Service
2. Update `application.yml` in Content Service
3. Update `application.yml` in Analytics Service
4. Update `application.yml` in Engagement Service
5. Update `application.yml` in Gamification Service
6. Build 5 Docker images
7. Deploy 5 services
8. **Total time: 2-3 hours**

**With Config Server:**
1. Update `application.yml` in `yushan-config-repo`
2. Git commit and push
3. POST to `http://config-server:8888/actuator/refresh`
4. All services get new config automatically
5. **Total time: 2 minutes**

#### Environment-Specific Configs:

```yaml
# application.yml (common for all environments)
spring:
  jpa:
    show-sql: false

# application-dev.yml (development)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yushan_dev

# application-prod.yml (production)
spring:
  datasource:
    url: jdbc:postgresql://prod-db.digitalocean.com:5432/yushan_prod
```

Switch environments with: `SPRING_PROFILES_ACTIVE=prod`

---

### 4. 💼 Business Services (Ports 8081-8085)

These are your actual application logic:

1. **User Service (8081)** - Authentication, user profiles
2. **Content Service (8082)** - Novels, chapters, categories
3. **Analytics Service (8083)** - Rankings, history, reports
4. **Engagement Service (8084)** - Comments, reviews, votes
5. **Gamification Service (8085)** - EXP, Yuan, achievements

**Why separate them?**
- Each can be scaled independently
- Team A can work on User Service, Team B on Content Service
- If Content Service crashes, User Service still works
- Different databases for different concerns

---

## 🔄 How They Work Together

### Example: User reads a novel chapter

```
1. Frontend sends request:
   GET http://yourapp.com/api/chapters/123
   Authorization: Bearer <jwt-token>

2. API Gateway receives request:
   ✓ Validates JWT token
   ✓ Extracts user ID from token
   ✓ Adds X-User-Id header
   ✓ Asks Eureka: "Where is Content Service?"
   ✓ Routes request to Content Service

3. Content Service receives request:
   ✓ Reads X-User-Id from header (trusts Gateway)
   ✓ Gets chapter from database
   ✓ Calls Analytics Service to record read
   ✓ Calls Gamification Service to award EXP

4. Analytics Service:
   ✓ Saves reading history
   ✓ Updates chapter view count

5. Gamification Service:
   ✓ Awards 10 EXP for reading
   ✓ Checks if user leveled up

6. Response flows back through Gateway to Frontend
```

**Notice:** Each service focuses on its own job, but they work together seamlessly!

---

## 🚀 DigitalOcean Deployment Guide

### Architecture on DigitalOcean

```
Internet
   ↓
[DigitalOcean Load Balancer] - $12/month
   ↓
[Droplet 1: Infrastructure - 2GB RAM] - $18/month
   - Eureka Server (:8761)
   - Config Server (:8888)
   - API Gateway (:8080)
   ↓
[Droplet 2: Services - 4GB RAM] - $24/month
   - User Service (:8081)
   - Content Service (:8082)
   - Analytics Service (:8083)
   ↓
[Droplet 3: Services - 4GB RAM] - $24/month
   - Engagement Service (:8084)
   - Gamification Service (:8085)
   ↓
[Managed PostgreSQL Database] - $15/month

Total: ~$93/month (FREE with $200 credit for 2 months!)
```

---

## 📝 Step-by-Step Deployment Process

### Phase 1: Preparation (Day 1)

#### 1.1 Create DigitalOcean Account
```bash
# Go to https://www.digitalocean.com
# Sign up with GitHub Student Pack for $200 credit
# Or use referral link for free credits
```

#### 1.2 Create GitHub Config Repository
```bash
# Create new GitHub repo: yushan-config-repo
mkdir yushan-config-repo
cd yushan-config-repo
git init

# Add configuration files
# (Copy from your services' application.yml)

git add .
git commit -m "Initial configuration"
git push origin main
```

#### 1.3 Build Docker Images Locally
```bash
# Build each service
cd yushan-platform-service-registry
docker build -t yushan-eureka:1.0 .

cd ../yushan-config-server
docker build -t yushan-config-server:1.0 .

cd ../yushan-api-gateway
docker build -t yushan-api-gateway:1.0 .

cd ../yushan-user-service
docker build -t yushan-user-service:1.0 .

# Repeat for all services...
```

---

### Phase 2: Setup Infrastructure (Day 2)

#### 2.1 Create PostgreSQL Database

1. Login to DigitalOcean Console
2. Click **Databases** → **Create Database**
3. Choose:
   - **Database Engine:** PostgreSQL 15
   - **Plan:** Basic ($15/month)
   - **Region:** Singapore (closest to you)
   - **Database Name:** yushan-db
4. Click **Create Database**
5. Wait 5-10 minutes for provisioning
6. Note down connection details:
   ```
   Host: db-postgresql-sgp1-12345.b.db.ondigitalocean.com
   Port: 25060
   Username: doadmin
   Password: <generated-password>
   Database: defaultdb
   ```

#### 2.2 Create Droplets

**Droplet 1 - Infrastructure:**
```bash
# In DigitalOcean Console
1. Click "Create" → "Droplets"
2. Choose:
   - Image: Docker on Ubuntu 22.04
   - Plan: Basic - 2GB RAM / 1 vCPU ($18/month)
   - Region: Singapore
   - Hostname: yushan-infrastructure
3. Click "Create Droplet"
4. Note the IP address (e.g., 143.198.123.45)
```

**Droplet 2 & 3 - Services:**
```bash
# Repeat above steps
Droplet 2: yushan-services-1 (4GB RAM - $24/month)
Droplet 3: yushan-services-2 (4GB RAM - $24/month)
```

---

### Phase 3: Deploy Services (Day 3-4)

#### 3.1 Setup Droplet 1 (Infrastructure)

```bash
# SSH into the droplet
ssh root@143.198.123.45

# Create docker-compose.yml
cat > docker-compose.yml <<EOF
version: '3.8'

services:
  eureka-server:
    image: yourusername/yushan-eureka:1.0
    container_name: eureka-server
    ports:
      - "8761:8761"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: always

  config-server:
    image: yourusername/yushan-config-server:1.0
    container_name: config-server
    ports:
      - "8888:8888"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_CLOUD_CONFIG_SERVER_GIT_URI=https://github.com/yourusername/yushan-config-repo
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    depends_on:
      - eureka-server
    restart: always

  api-gateway:
    image: yourusername/yushan-api-gateway:1.0
    container_name: api-gateway
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://config-server:8888
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - eureka-server
      - config-server
    restart: always

networks:
  default:
    name: yushan-network
EOF

# Set environment variables
export JWT_SECRET="your-super-secret-jwt-key-minimum-256-bits"

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 3.2 Setup Droplet 2 (Business Services)

```bash
# SSH into droplet 2
ssh root@<droplet-2-ip>

# Create docker-compose.yml for business services
cat > docker-compose.yml <<EOF
version: '3.8'

services:
  user-service:
    image: yourusername/yushan-user-service:1.0
    container_name: user-service
    ports:
      - "8081:8081"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://<droplet-1-ip>:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://<droplet-1-ip>:8888
      - SPRING_DATASOURCE_URL=jdbc:postgresql://<db-host>:25060/yushan_users?sslmode=require
      - SPRING_DATASOURCE_USERNAME=doadmin
      - SPRING_DATASOURCE_PASSWORD=<db-password>
    restart: always

  content-service:
    image: yourusername/yushan-content-service:1.0
    container_name: content-service
    ports:
      - "8082:8082"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://<droplet-1-ip>:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://<droplet-1-ip>:8888
      - SPRING_DATASOURCE_URL=jdbc:postgresql://<db-host>:25060/yushan_content?sslmode=require
      - SPRING_DATASOURCE_USERNAME=doadmin
      - SPRING_DATASOURCE_PASSWORD=<db-password>
    restart: always

  analytics-service:
    image: yourusername/yushan-analytics-service:1.0
    container_name: analytics-service
    ports:
      - "8083:8083"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://<droplet-1-ip>:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://<droplet-1-ip>:8888
      - SPRING_DATASOURCE_URL=jdbc:postgresql://<db-host>:25060/yushan_analytics?sslmode=require
      - SPRING_DATASOURCE_USERNAME=doadmin
      - SPRING_DATASOURCE_PASSWORD=<db-password>
    restart: always
EOF

# Start services
docker-compose up -d
```

#### 3.3 Setup Droplet 3 (Remaining Services)

```bash
# SSH into droplet 3
ssh root@<droplet-3-ip>

# Similar docker-compose.yml for:
# - engagement-service (:8084)
# - gamification-service (:8085)

docker-compose up -d
```

---

### Phase 4: Configure Load Balancer (Day 5)

#### 4.1 Create Load Balancer

1. In DigitalOcean Console: **Networking** → **Load Balancers**
2. Click **Create Load Balancer**
3. Settings:
   - **Region:** Singapore
   - **Type:** External (Public)
   - **VPC:** Default
4. **Forwarding Rules:**
   ```
   HTTP   Port 80  → HTTP   Port 8080 (API Gateway)
   HTTPS  Port 443 → HTTP   Port 8080 (API Gateway)
   ```
5. **Health Checks:**
   ```
   Protocol: HTTP
   Port: 8080
   Path: /actuator/health
   ```
6. **Add Droplets:** Select Droplet 1 (Infrastructure)
7. Click **Create Load Balancer**

#### 4.2 Configure Domain (Optional)

1. Go to **Networking** → **Domains**
2. Add your domain: `yushan-api.com`
3. Add A record:
   ```
   Type: A
   Hostname: @
   Value: <load-balancer-ip>
   TTL: 3600
   ```
4. Add CNAME record:
   ```
   Type: CNAME
   Hostname: www
   Value: @
   TTL: 3600
   ```

---

### Phase 5: Testing & Verification (Day 6)

#### 5.1 Test Infrastructure Services

```bash
# Test Eureka
curl http://<load-balancer-ip>:8761

# Test Config Server
curl http://<droplet-1-ip>:8888/actuator/health

# Test API Gateway
curl http://<load-balancer-ip>/actuator/health
```

#### 5.2 Test Business Services

```bash
# Test through API Gateway
curl http://<load-balancer-ip>/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test novel listing
curl http://<load-balancer-ip>/api/novels

# Test with authentication
curl http://<load-balancer-ip>/api/users/me \
  -H "Authorization: Bearer <jwt-token>"
```

#### 5.3 Check Eureka Dashboard

```bash
# Open in browser
http://<droplet-1-ip>:8761

# You should see all 5 services + API Gateway registered
```

---

## 💰 Cost Breakdown

| Resource | Specs | Monthly Cost | Notes |
|----------|-------|--------------|-------|
| Droplet 1 (Infrastructure) | 2GB RAM | $18 | Eureka, Config, Gateway |
| Droplet 2 (Services) | 4GB RAM | $24 | User, Content, Analytics |
| Droplet 3 (Services) | 4GB RAM | $24 | Engagement, Gamification |
| PostgreSQL Database | Basic | $15 | Managed DB |
| Load Balancer | Standard | $12 | High availability |
| **Total** | | **$93/month** | |
| **With $200 credit** | | **FREE for 2+ months** | |

---

## 🎓 For Your Class Presentation

### Key Points to Explain:

1. **Service Registry (Eureka):**
   - "Services find each other automatically"
   - "Load balancing without hardcoding IPs"
   - Demo: Stop a service, show Eureka removes it

2. **API Gateway:**
   - "Single entry point for security"
   - "Handles authentication once, not 5 times"
   - Demo: Show routing different URLs to different services

3. **Config Server:**
   - "Change config without rebuilding code"
   - "One place for all environment settings"
   - Demo: Update a config value, refresh, show change

4. **Microservices Benefits:**
   - "Scale services independently"
   - "Deploy updates without downtime"
   - "Teams work on different services simultaneously"

### Demo Flow:

```
1. Show Eureka Dashboard
   → All services registered

2. Call API through Gateway
   → POST /api/auth/login
   → Show JWT token returned

3. Use JWT to access protected endpoint
   → GET /api/users/me
   → Show user profile returned

4. Show Config Server
   → GET /config-server/user-service/default
   → Show configuration loaded from Git

5. Update Config
   → Change a value in Git repo
   → POST /config-server/actuator/refresh
   → Show new value applied without restart
```

---

## 📚 Summary

**Service Registry:** Services find each other dynamically  
**API Gateway:** Single secure entry point for all requests  
**Config Server:** Centralized configuration management  
**5 Business Services:** Your actual application logic  

Together, they create a **scalable, maintainable, and secure** microservices architecture!

---

## 🆘 Quick Help

**Services won't start?**
- Check Eureka is running first
- Verify network connectivity between droplets
- Check Docker logs: `docker logs <container-name>`

**Can't access via Load Balancer?**
- Verify health checks are passing
- Check firewall rules on droplets
- Test direct access to API Gateway first

**Config not updating?**
- POST to `/actuator/refresh` endpoint
- Verify Git repo is accessible
- Check Config Server logs
