# Deploying Yushan Platform Service Registry to DigitalOcean

Complete step-by-step guide to host your Eureka Service Registry and Kafka on a DigitalOcean Droplet.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Create DigitalOcean Droplet](#step-1-create-a-digitalocean-droplet)
3. [Connect to Your Droplet](#step-2-connect-to-your-droplet)
4. [Initial Server Setup](#step-3-initial-server-setup)
5. [Install Docker](#step-4-install-docker)
6. [Clone Repository](#step-5-clone-your-repository)
7. [Configure Application](#step-6-configure-application-for-production)
8. [Build and Run](#step-7-build-and-run-with-docker-compose)
9. [Configure Firewall](#step-8-configure-firewall)
10. [Test Deployment](#step-9-test-your-deployment)
11. [Auto-Restart Setup](#step-10-set-up-auto-restart-on-reboot)
12. [Monitoring](#step-11-monitoring-and-maintenance)
13. [Optional: Domain Setup](#step-12-optional-set-up-domain-name)
14. [Common Commands](#common-commands-reference)
15. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- DigitalOcean account
- GitHub repository: `https://github.com/maugus0/yushan-platform-service-registry`
- SSH key (recommended) or password access
- Basic terminal/command line knowledge

---

## Step 1: Create a DigitalOcean Droplet

### 1.1 Access DigitalOcean Dashboard
- Log into [DigitalOcean](https://cloud.digitalocean.com/)
- Click **"Create"** → **"Droplets"**

### 1.2 Configure Droplet Settings

**Choose an Image:**
- Select **Ubuntu 24.04 LTS x64** (or Ubuntu 22.04 LTS)

**Choose Size:**
- Plan: **Basic**
- CPU Options: **Regular**
- Recommended Options:
  - **$12/month**: 2 GB RAM / 1 CPU / 50 GB SSD (minimum)
  - **$18/month**: 2 GB RAM / 2 CPUs / 60 GB SSD (better for Kafka)

**Choose Datacenter Region:**
- Select region closest to your users
- Example: Singapore (SGP1) for Asia-Pacific

**Authentication:**
- **Option A - SSH Key (Recommended):**
  1. Click **"New SSH Key"**
  2. On your local machine, run: `cat ~/.ssh/id_rsa.pub`
  3. Copy the output and paste into DigitalOcean
  4. Give it a name like "My Laptop"
  
- **Option B - Password:**
  - Choose a strong password

**Finalize Details:**
- Hostname: `yushan-service-registry`
- Tags: (optional) `production`, `eureka`, `kafka`

### 1.3 Create Droplet
- Click **"Create Droplet"**
- Wait approximately 60 seconds
- **Note your Droplet's IP address** (displayed in dashboard)

---

## Step 2: Connect to Your Droplet

Open your terminal and connect via SSH:

```bash
ssh root@YOUR_DROPLET_IP
```

Replace `YOUR_DROPLET_IP` with your actual IP address.

**First-time connection:**
- Type `yes` when asked about fingerprint authenticity
- You're now connected to your server

---

## Step 3: Initial Server Setup

### 3.1 Update System Packages

```bash
apt update && apt upgrade -y
```

### 3.2 Install Required Packages

```bash
apt install -y git curl wget apt-transport-https ca-certificates gnupg lsb-release
```

---

## Step 4: Install Docker

### 4.1 Add Docker's Official GPG Key

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 4.2 Set Up Docker Repository

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 4.3 Install Docker Engine

```bash
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 4.4 Verify Installation

```bash
docker --version
docker compose version
```

Expected output:
```
Docker version 24.x.x, build xxxxx
Docker Compose version v2.x.x
```

### 4.5 Start and Enable Docker

```bash
systemctl start docker
systemctl enable docker
```

Verify Docker is running:
```bash
systemctl status docker
```

---

## Step 5: Clone Your Repository

### 5.1 Navigate to Home Directory

```bash
cd ~
```

### 5.2 Clone the Repository

```bash
git clone https://github.com/maugus0/yushan-platform-service-registry.git
```

### 5.3 Enter Project Directory

```bash
cd yushan-platform-service-registry
```

### 5.4 Verify Files

```bash
ls -la
```

You should see:
- `docker-compose.yml`
- `Dockerfile`
- `pom.xml`
- `src/` directory

---

## Step 6: Configure Application for Production

### 6.1 Create Docker Profile Configuration

```bash
nano src/main/resources/application-docker.yml
```

### 6.2 Add Configuration

Paste the following content:

```yaml
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
    prefer-ip-address: true
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://localhost:8761/eureka/

spring:
  application:
    name: eureka-server

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

### 6.3 Save and Exit

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## Step 7: Build and Run with Docker Compose

### 7.1 Create Required Directories

```bash
mkdir -p logs
```

### 7.2 Build and Start Services

```bash
docker compose up -d --build
```

This command will:
- Build the Spring Boot application using Dockerfile
- Download Kafka image
- Start both containers in detached mode
- Create the network

**Expected output:**
```
[+] Building ...
[+] Running 3/3
 ✔ Network yushan-platform-network  Created
 ✔ Container yushan-shared-kafka    Started
 ✔ Container yushan-eureka-registry Started
```

### 7.3 Verify Containers are Running

```bash
docker compose ps
```

Expected output:
```
NAME                     IMAGE                              STATUS         PORTS
yushan-eureka-registry   yushan-platform-service-registry   Up 2 minutes   0.0.0.0:8761->8761/tcp
yushan-shared-kafka      confluentinc/cp-kafka:7.4.0        Up 2 minutes   0.0.0.0:9092->9092/tcp
```

### 7.4 Check Container Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs eureka-server
docker compose logs kafka

# View last 50 lines
docker compose logs --tail=50
```

### 7.5 Wait for Services to Start

Kafka and Eureka may take 30-60 seconds to fully start. Monitor logs until you see:
- Eureka: `Started EurekaServerApplication`
- Kafka: `Kafka Server started`

---

## Step 8: Configure Firewall

### 8.1 Install UFW (if not installed)

```bash
apt install -y ufw
```

### 8.2 Configure Firewall Rules

**IMPORTANT: Allow SSH first to avoid lockout!**

```bash
# Allow SSH (Port 22) - DO THIS FIRST!
ufw allow 22/tcp

# Allow Eureka Server (Port 8761)
ufw allow 8761/tcp

# Allow Kafka (Port 9092) - if needed externally
ufw allow 9092/tcp
```

### 8.3 Enable Firewall

```bash
ufw enable
```

Type `y` when prompted.

### 8.4 Check Firewall Status

```bash
ufw status
```

Expected output:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
8761/tcp                   ALLOW       Anywhere
9092/tcp                   ALLOW       Anywhere
```

---

## Step 9: Test Your Deployment

### 9.1 Test from Droplet (Local)

```bash
# Test Eureka
curl http://localhost:8761

# Test Health Endpoint
curl http://localhost:8761/actuator/health
```

Expected health response:
```json
{"status":"UP"}
```

### 9.2 Test from Your Local Machine

Open your web browser and navigate to:

```
http://YOUR_DROPLET_IP:8761
```

You should see the **Eureka Dashboard** with:
- System Status
- General Info
- Instances currently registered (will be empty initially)

### 9.3 Test Health Endpoint Externally

From your local machine terminal:

```bash
curl http://YOUR_DROPLET_IP:8761/actuator/health
```

### 9.4 Test Kafka (Optional)

From the droplet:

```bash
# List Kafka topics
docker exec yushan-shared-kafka kafka-topics --bootstrap-server localhost:9092 --list
```

---

## Step 10: Set Up Auto-Restart on Reboot

### 10.1 Enable Docker to Start on Boot

```bash
systemctl enable docker
```

### 10.2 Verify Restart Policy

The `docker-compose.yml` already includes `restart: unless-stopped` for both services, so containers will automatically restart.

### 10.3 Test Auto-Restart

```bash
# Reboot the server
reboot
```

Wait 2-3 minutes, then SSH back in:

```bash
ssh root@YOUR_DROPLET_IP
```

Check if containers are running:

```bash
docker compose ps
```

Both containers should be running.

---

## Step 11: Monitoring and Maintenance

### 11.1 View Container Resource Usage

```bash
docker stats
```

This shows real-time CPU, memory, and network usage.

### 11.2 View Logs

```bash
# Real-time logs (all services)
docker compose logs -f

# Last 100 lines
docker compose logs -f --tail=100

# Specific service
docker compose logs -f eureka-server

# Save logs to file
docker compose logs > deployment-logs.txt
```

### 11.3 Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart eureka-server

# Stop all services
docker compose stop

# Start all services
docker compose start
```

### 11.4 Update Application

When you push changes to GitHub:

```bash
cd ~/yushan-platform-service-registry

# Pull latest changes
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build
```

### 11.5 Check Disk Space

```bash
df -h
```

### 11.6 Clean Up Docker Resources

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes (WARNING: data loss)
docker volume prune
```

---

## Step 12: (Optional) Set Up Domain Name

If you own a domain, you can access your service via a friendly URL.

### 12.1 Add DNS A Record

In your domain registrar's DNS settings:

- **Type:** `A`
- **Name:** `registry` (creates `registry.yourdomain.com`)
- **Value:** `YOUR_DROPLET_IP`
- **TTL:** `3600` (1 hour)

### 12.2 Update Application Configuration

```bash
nano src/main/resources/application-docker.yml
```

Update the hostname:

```yaml
eureka:
  instance:
    hostname: registry.yourdomain.com
    prefer-ip-address: false
```

### 12.3 Rebuild Application

```bash
docker compose down
docker compose up -d --build
```

### 12.4 Update Firewall (if using HTTPS later)

```bash
ufw allow 443/tcp
```

### 12.5 Access via Domain

Open browser:
```
http://registry.yourdomain.com:8761
```

---

## Common Commands Reference

### Docker Compose Commands

```bash
# Start services
docker compose up -d

# Start with rebuild
docker compose up -d --build

# Stop services (containers remain)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes
docker compose down -v

# View running containers
docker compose ps

# View logs
docker compose logs
docker compose logs -f                    # Follow mode
docker compose logs -f --tail=50         # Last 50 lines
docker compose logs eureka-server        # Specific service

# Restart services
docker compose restart
docker compose restart eureka-server     # Specific service

# Execute command in container
docker compose exec eureka-server bash
docker compose exec kafka bash

# View container stats
docker stats
```

### Docker System Commands

```bash
# View Docker disk usage
docker system df

# Clean up unused resources
docker system prune

# Clean up everything (images, containers, volumes)
docker system prune -a --volumes

# View all containers (including stopped)
docker ps -a

# View all images
docker images

# Remove specific container
docker rm CONTAINER_ID

# Remove specific image
docker rmi IMAGE_ID
```

### Server Management Commands

```bash
# Check system resources
free -h                  # Memory
df -h                    # Disk space
top                      # CPU and processes
htop                     # Better process viewer (install: apt install htop)

# Check running processes
ps aux | grep java
ps aux | grep kafka

# Check listening ports
netstat -tlnp | grep 8761
ss -tlnp | grep 8761

# Reboot server
reboot

# Check system logs
journalctl -xe
journalctl -u docker
```

### Git Commands

```bash
# Update repository
cd ~/yushan-platform-service-registry
git pull

# Check current status
git status

# View commit history
git log --oneline -10

# Switch branches
git checkout main
```

---

## Troubleshooting

### Issue: Eureka Server Won't Start

**Check logs:**
```bash
docker compose logs eureka-server
```

**Common solutions:**

1. **Port already in use:**
```bash
# Check if port 8761 is in use
netstat -tlnp | grep 8761

# Kill process using the port
kill -9 PID
```

2. **Memory issues:**
```bash
# Check memory
free -h

# Add swap space if needed
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

3. **Rebuild container:**
```bash
docker compose down
docker compose up -d --build
```

### Issue: Kafka Won't Start

**Check logs:**
```bash
docker compose logs kafka
```

**Common solutions:**

1. **Kafka needs more time:**
```bash
# Wait 60 seconds and check again
docker compose logs kafka | tail -50
```

2. **Permission issues:**
```bash
# Stop containers
docker compose down

# Remove volume and restart
docker volume rm yushan-platform-service-registry_kafka_data
docker compose up -d
```

3. **Port conflicts:**
```bash
netstat -tlnp | grep 9092
```

### Issue: Cannot Access from Browser

**Checklist:**

1. **Verify containers are running:**
```bash
docker compose ps
```

2. **Check firewall:**
```bash
ufw status
# If port 8761 is not allowed:
ufw allow 8761/tcp
```

3. **Test locally first:**
```bash
curl http://localhost:8761
```

4. **Check if port is listening:**
```bash
netstat -tlnp | grep 8761
```

5. **Verify correct IP:**
```bash
# Get your droplet's public IP
curl ifconfig.me
```

### Issue: High Memory Usage

**Check usage:**
```bash
docker stats
free -h
```

**Solutions:**

1. **Reduce JVM memory in docker-compose.yml:**
```yaml
environment:
  - JAVA_OPTS=-Xms128m -Xmx256m
```

2. **Add swap space:**
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

3. **Restart services:**
```bash
docker compose restart
```

### Issue: Disk Space Full

**Check disk usage:**
```bash
df -h
du -sh /var/lib/docker/
```

**Clean up:**
```bash
# Remove stopped containers and unused images
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove old logs
cd ~/yushan-platform-service-registry/logs
rm -f *.log
```

### Issue: Application Not Updating

After `git pull`, changes don't appear:

```bash
# Force rebuild without cache
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue: Connection Refused

**Check if service is running:**
```bash
docker compose ps
docker compose logs eureka-server
```

**Restart networking:**
```bash
docker compose down
docker network prune
docker compose up -d
```

### Issue: Can't SSH After Firewall Setup

If you accidentally locked yourself out:

1. Use DigitalOcean Console (from web dashboard)
2. Click on your droplet → **"Access"** → **"Launch Droplet Console"**
3. Disable firewall temporarily:
```bash
ufw disable
```
4. Re-enable with correct rules:
```bash
ufw allow 22/tcp
ufw enable
```

---

## Service URLs

After successful deployment:

- **Eureka Dashboard:** `http://YOUR_DROPLET_IP:8761`
- **Health Check:** `http://YOUR_DROPLET_IP:8761/actuator/health`
- **Eureka Registry (for microservices):** `http://YOUR_DROPLET_IP:8761/eureka/`
- **Kafka Bootstrap Server:** `YOUR_DROPLET_IP:9092`

---

## Connecting Other Microservices

Other microservices in your Yushan platform should use this configuration:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://YOUR_DROPLET_IP:8761/eureka/
    register-with-eureka: true
    fetch-registry: true

spring:
  kafka:
    bootstrap-servers: YOUR_DROPLET_IP:9092
```

---

## Security Recommendations

1. **Change root password:**
```bash
passwd
```

2. **Create a non-root user:**
```bash
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy
```

3. **Disable root SSH login:**
```bash
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd
```

4. **Set up fail2ban:**
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

5. **Enable automatic security updates:**
```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## Backup Recommendations

### Backup Docker Volumes

```bash
# Stop containers
docker compose stop

# Backup Kafka data
tar -czf kafka-backup-$(date +%Y%m%d).tar.gz /var/lib/docker/volumes/yushan-platform-service-registry_kafka_data

# Restart containers
docker compose start
```

### Backup Configuration

```bash
cd ~/yushan-platform-service-registry
tar -czf config-backup-$(date +%Y%m%d).tar.gz docker-compose.yml Dockerfile src/
```

---

## Next Steps

1. **Monitor your deployment** regularly using `docker stats` and logs
2. **Set up SSL/TLS** using Let's Encrypt and Nginx reverse proxy
3. **Configure monitoring tools** like Prometheus and Grafana
4. **Set up automated backups** using DigitalOcean Snapshots or custom scripts
5. **Deploy other microservices** and register them with this Eureka server

---

## Useful Resources

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Spring Cloud Netflix Eureka](https://spring.io/projects/spring-cloud-netflix)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)

---

## Support

If you encounter issues not covered in this guide:

1. Check application logs: `docker compose logs`
2. Review DigitalOcean droplet metrics in dashboard
3. Consult the GitHub repository issues
4. Check Docker and Spring Boot documentation

---

## Summary

You have successfully deployed:
- ✅ Eureka Service Registry on port 8761
- ✅ Kafka message broker on port 9092
- ✅ Configured firewall and security
- ✅ Set up auto-restart on reboot
- ✅ Configured monitoring and logging

Your service registry is now ready to accept microservice registrations!
