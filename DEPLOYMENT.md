# KaamSetu – Production Deployment & Hosting Guide 🚀

This guide explains how to host the **KaamSetu – Local Worker Network** full-stack web application in production.

---

## 📦 Deployment Architecture Options

Choose the hosting pattern that fits your infrastructure:

| Option | Architecture | Recommended For | Complexity |
|---|---|---|---|
| **Option 1: Standalone Single JAR** | Frontend bundled inside Spring Boot JAR (`:8085`) | VPS, AWS EC2, DigitalOcean, VM | **Easiest (1 command)** |
| **Option 2: Docker Compose** | MySQL + Spring Boot + Nginx Containers | Linux VPS, Droplet, Docker Swarm | **Recommended Production** |
| **Option 3: Modern Cloud PaaS** | Vercel (Frontend) + Railway / Render (Backend) + Cloud MySQL | Free/Low-cost serverless hosting | **Popular Cloud** |

---

## 🛠️ Option 1: Standalone Single Executable JAR (Easiest)

The React frontend has been pre-compiled and embedded inside the Spring Boot JAR with SPA client-side routing fallback. You can run the **entire full-stack application on a single port** with zero external web server configuration.

### Prerequisites
- Java 17 or 18 JRE/JDK installed on server
- MySQL Server 8.0 running

### Run Command
```bash
# Set your environment variables (optional - defaults to application.properties values)
export PORT=8085
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/kaamsetu_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_database_password"
export JWT_SECRET="YourProductionGradeSecretKeyThatIsAtLeast256BitsLongForHmacSha256!"

# Run standalone JAR
java -jar backend/target/kaamsetu-backend-1.0.0.jar
```

Now open `http://your-server-ip:8085/` in your browser. All pages, REST APIs, and static assets will be served seamlessly!

---

## 🐳 Option 2: Production Docker Compose (Recommended for VPS)

KaamSetu includes a production-ready `docker-compose.yml`, multi-stage `backend/Dockerfile`, and `Dockerfile` (React + Nginx).

### 1. Configure Environment
Create a `.env` file in the project root:
```env
DB_ROOT_PASSWORD=YourStrongDatabasePassword123!
JWT_SECRET=YourProductionSecretKeyWithHighEntropyAtLeast256BitsLong!
```

### 2. Launch Stack
```bash
docker compose up -d --build
```

### What this starts:
1. **`kaamsetu_mysql`** (MySQL 8.0 on port 3306 with health check and volume persistence)
2. **`kaamsetu_backend`** (Spring Boot 3.2.5 on port 8085)
3. **`kaamsetu_frontend`** (Production Nginx server on port 80 with Gzip compression and API reverse proxy)

Visit `http://your-server-ip/` to access the live app.

---

## ☁️ Option 3: Modern Cloud PaaS (Vercel + Railway / Render)

### Step 1: Deploy Backend & Database (Railway / Render)
1. Fork or push this repository to GitHub.
2. Sign in to **[Railway.app](https://railway.app)** or **[Render.com](https://render.com)**.
3. Create a new project and add a **MySQL** database service.
4. Add a new service from your GitHub repo pointing to the `/backend` subfolder.
5. Set environment variables on Railway/Render:
   - `SPRING_DATASOURCE_URL`: (Use the MySQL connection string provided by Railway/Render)
   - `SPRING_DATASOURCE_USERNAME`: (Railway/Render MySQL user)
   - `SPRING_DATASOURCE_PASSWORD`: (Railway/Render MySQL password)
   - `JWT_SECRET`: `YourProductionSecureSecretKeyThatIsAtLeast256BitsLong!`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`
   - `PORT`: `8085`
6. Deploy. Note your public backend URL (e.g. `https://kaamsetu-backend.up.railway.app`).

### Step 2: Deploy Frontend (Vercel / Netlify)
1. Sign in to **[Vercel](https://vercel.com)**.
2. Import your GitHub repository, selecting the root directory.
3. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://kaamsetu-backend.up.railway.app/api`
4. Deploy. Vercel automatically builds with `npm run build` and provides an SSL `https://kaamsetu.vercel.app` domain.

---

## ⚙️ Environment Variables Dictionary

| Variable | Description | Default Value | Required in Production |
|---|---|---|---|
| `PORT` | HTTP server port for backend | `8085` | Optional |
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:mysql://localhost:3306/kaamsetu_db...` | Yes |
| `SPRING_DATASOURCE_USERNAME` | MySQL username | `root` | Yes |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password | (Configured) | Yes |
| `JPA_DDL_AUTO` | Hibernate schema behavior | `update` (or `validate`) | Optional |
| `JWT_SECRET` | 256-bit secret for signing JWTs | (Default secret) | **Yes (Change for Prod)** |
| `JWT_EXPIRATION_MS` | JWT token validity in ms | `86400000` (24 Hours) | Optional |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed web origins | Localhost + Vercel/Netlify URLs | Yes |
| `VITE_API_BASE_URL` | Frontend API endpoint path | `/api` | Yes (if hosted on separate domain) |

---

## 🩺 Health Check & Monitoring

KaamSetu includes a dedicated health endpoint for cloud load balancers (AWS ELB, Railway, Render, Kubernetes):

```http
GET /api/health
```

### Sample Response:
```json
{
  "success": true,
  "message": "System healthy and operational",
  "data": {
    "service": "KaamSetu Backend API",
    "status": "UP",
    "version": "1.0.0",
    "database": "CONNECTED",
    "timestamp": "2026-11-11T15:45:36.123"
  }
}
```

---

## 🔒 Production Security Checklist

- [x] Passwords encrypted using BCrypt (`BCryptPasswordEncoder`, strength 10).
- [x] Stateless JWT authentication with HMAC-SHA256 signature verification.
- [x] Global exception handling avoiding raw database stack traces to clients.
- [x] Parameterized SQL via Spring Data JPA preventing SQL injection.
- [x] Input validation on all DTOs (`@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`).
- [x] Role-Based Access Control (`ROLE_CUSTOMER`, `ROLE_WORKER`, `ROLE_ADMIN`).
- [x] Secure OTP verification required to mark jobs complete.
- [x] CORS protection allowing only specified origins.

