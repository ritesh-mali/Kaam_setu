# KaamSetu – Local Worker Network 🛠️

**KaamSetu** is a full-stack hyper-local service platform bridging the trust and transparency gap between customers and skilled independent tradespeople (plumbers, electricians, carpenters, appliance repair technicians, painters, and cleaners).

---

## 🌟 Key Features

1. **Transparent Pricing Engine**
   - Fixed doorstep visiting & diagnostic fees.
   - Standardized hourly labor rates and emergency surcharges.
   - Real-time transparent bill breakdown with ₹0 hidden platform fees.
2. **Worker Profiles & Verification**
   - Verified KYC badges (Aadhaar, PAN, ITI trade certifications).
   - Real-time Online / Offline availability toggle.
   - Skill tags, years of experience, service area radius, and transparent rate cards.
3. **End-to-End Service Booking Lifecycle**
   - Customers choose trade category, date, time slot, and urgency level.
   - Worker receives real-time booking notifications to accept or decline.
4. **Secure OTP Job Completion Verification**
   - When a job is accepted and started, a 4-digit verification OTP is generated and visible **only** to the customer.
   - Work is marked `COMPLETED` only when the customer inspects the repair and hands over the OTP to the worker.
5. **Itemized Digital Invoices & Records**
   - Downloadable & printable tax invoices for every completed service.
   - Itemized labor hours, visiting fee, replacement parts cost, and verified completion stamp.
6. **Customer Reviews & Worker Replies**
   - 1-to-5 star ratings with quick feedback tags.
   - Workers can publicly reply to customer reviews.
7. **In-App Direct Chat & Messaging**
   - Seamless two-way private communication between customer and assigned technician per booking.
   - Quick canned communication chips (*"I'm on my way"*, *"Please share gate code"*, *"Where is the main shutoff valve?"*).
   - Real-time polling with read receipts and instant notification alerts.
8. **Dynamic UPI QR Code & Payment Simulator**
   - Dynamic UPI QR code generator for Google Pay, PhonePe, and Paytm.
   - Interactive UPI payment simulator that updates booking to `PAID_ONLINE`, stamps a transaction ID, and prints a verified receipt.
9. **KaamSetu Express 15-Minute Emergency SOS**
   - 1-click immediate emergency dispatch for pipe bursts, electrical sparks/shorts, blackout, or AC flooding.
   - Automatically matches and dispatches the nearest verified pro with transparent priority surcharge.
10. **Live GPS Technician Dispatch & Arrival ETA Tracker**
   - Real-time distance and ETA countdown (e.g. *"ETA: 8 mins • 1.8 km away"*).
   - Route path indicator between technician and customer doorstep.
11. **In-App Notification Center**
   - Real-time notification bell with unread badge counter in header.
   - Instant alerts for booking requests, status transitions, chat messages, and reviews.
12. **Dedicated Role-Based Dashboards**
   - **Customer Dashboard**: Track active jobs with visual stage progress stepper, view OTP, review past jobs, and print invoices.
   - **Worker Dashboard**: Manage rate card, toggle work status, accept/reject requests, start jobs, and input OTP to finalize earnings.
   - **Admin Command Center**: Platform GMV/revenue analytics, worker KYC verification approvals, live platform booking monitor, and user access control.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React Icons, React Router v7
- **Backend**: Java 18, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA / Hibernate 6
- **Database**: MySQL 8.0 (`kaamsetu_db` on localhost:3306)
- **Authentication**: Stateless JWT (HMAC-SHA256) with Role-Based Access Control (`ROLE_CUSTOMER`, `ROLE_WORKER`, `ROLE_ADMIN`)
- **API Communication**: RESTful JSON APIs with unified `ApiResponse<T>` wrapper and Vite proxy

---

## 🚀 Default Demo Accounts for Evaluation

A demo role switcher bar is pinned at the top of the application for instant one-click switching:

| Role | Name | Email | Password |
|---|---|---|---|
| **Customer** | Rahul Sharma | `rahul@gmail.com` | `customer123` |
| **Worker (Plumber)** | Rajesh Sharma | `rajesh.plumber@kaamsetu.com` | `worker123` |
| **Worker (Electrician)** | Suresh Verma | `suresh.electrician@kaamsetu.com` | `worker123` |
| **Worker (Carpenter)** | Manoj Kumar | `manoj.carpenter@kaamsetu.com` | `worker123` |
| **Worker (Appliance Repair)** | Amit Patel | `amit.repair@kaamsetu.com` | `worker123` |
| **Worker (Pending KYC)** | Deepak Prajapati | `deepak.p@kaamsetu.com` | `worker123` |
| **Admin** | KaamSetu Admin | `admin@kaamsetu.com` | `admin123` |

---

## 🏃 Running the Application

### 1. Standalone Single JAR (Production Ready)
You can run the entire full-stack app (Backend + Frontend + APIs) as a single executable JAR:
```bash
java -jar backend/target/kaamsetu-backend-1.0.0.jar
```
Open [http://localhost:8085/](http://localhost:8085/).

### 2. Development Mode
- **Backend**: `cd backend && mvn spring-boot:run` (Runs on `http://localhost:8085`)
- **Frontend**: `npm run dev` (Runs on `http://localhost:5173`)

### 3. Production Deployment Guide
See [**DEPLOYMENT.md**](./DEPLOYMENT.md) for full instructions on hosting with:
- **Docker Compose** (`docker compose up -d --build`)
- **Vercel / Netlify + Railway / Render / AWS**
- **Standalone Linux/Windows VPS**

---

## 📡 REST API Reference

### Health & Monitoring (`/api/health`)
- `GET /api/health` – Returns backend & database operational status for load balancers

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register customer or service worker
- `POST /api/auth/login` – Login and obtain JWT token
- `GET /api/auth/me` – Get profile of currently signed-in user

### Categories & Workers (`/api/categories`, `/api/workers`)
- `GET /api/categories` – List active service categories
- `GET /api/workers/search` – Search workers by category, city, max price, verified badge, availability
- `GET /api/workers/{id}` – Get worker public profile and rate card
- `GET /api/workers/me` – Worker views own profile
- `PUT /api/workers/me` – Worker updates rate card, bio, skills, and service radius
- `PATCH /api/workers/me/availability` – Toggle Online / Offline status

### Bookings (`/api/bookings`)
- `POST /api/bookings` – Customer books a service
- `GET /api/bookings/customer` – Customer's booking history and active jobs
- `GET /api/bookings/worker` – Worker's job queue and completed jobs
- `GET /api/bookings/{id}` – Detailed booking record with OTP and billing
- `PATCH /api/bookings/{id}/status` – Status transitions (ACCEPT, REJECT, START, COMPLETE with OTP, CANCEL)

### Reviews (`/api/reviews`)
- `POST /api/reviews` – Submit 1-5 star review for completed booking
- `GET /api/reviews/worker/{id}` – View verified customer reviews for a worker
- `POST /api/reviews/{id}/reply` – Worker posts public reply

### Chat & Direct Messaging (`/api/messages`)
- `GET /api/messages/booking/{bookingId}` – Retrieve message history for a booking
- `POST /api/messages/booking/{bookingId}` – Send a direct message to technician or customer

### Notifications (`/api/notifications`)
- `GET /api/notifications` – List user notifications
- `GET /api/notifications/unread-count` – Count unread alerts
- `PATCH /api/notifications/read-all` – Mark all alerts as read

### Admin Governance (`/api/admin`)
- `GET /api/admin/stats` – Platform analytics, GMV, completed jobs, active counts
- `GET /api/admin/workers` – List workers with verification status
- `POST /api/admin/workers/{id}/verify` – Approve KYC or revoke verification badge
- `GET /api/admin/bookings` – Full platform booking audit trail
- `GET /api/admin/users` – User management and role inspection
- `PATCH /api/admin/users/{id}/toggle-status` – Suspend or activate user accounts
