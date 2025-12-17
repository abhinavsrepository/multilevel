# Real Estate MLM Platform - Backend API

Production-ready Spring Boot backend for a Multi-Level Marketing (MLM) platform focused on real estate investments.

## 🚀 Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **PostgreSQL** (Primary Database)
- **Redis** (Caching)
- **JWT** (Authentication)
- **Hibernate/JPA** (ORM)
- **Swagger/OpenAPI** (API Documentation)
- **Maven** (Build Tool)

## 📋 Prerequisites

Before running the application, ensure you have:

- ✅ **Java 17 or higher** installed
- ✅ **Maven 3.6+** installed
- ✅ **PostgreSQL 12+** running
- ✅ **Redis** running (optional, for caching)

## 🔧 Quick Setup

### 1. **Database Setup**

```bash
# Create PostgreSQL database
createdb mlm_platform

# Or using psql
psql -U postgres
CREATE DATABASE mlm_platform;
\q
```

### 2. **Environment Configuration**

Create environment variables or update `application.yml`:

```bash
# Database
export DB_USERNAME=postgres
export DB_PASSWORD=your_password

# JWT Secret (use a strong secret in production!)
export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Mail Settings (for OTP and notifications)
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password

# AWS S3 (for file storage)
export AWS_ACCESS_KEY=your_access_key
export AWS_SECRET_KEY=your_secret_key
export AWS_S3_BUCKET=mlm-platform-files

# Razorpay (for payments)
export RAZORPAY_KEY_ID=your_key_id
export RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. **Build the Application**

```bash
cd backend
mvn clean install
```

### 4. **Run the Application**

```bash
# Using Maven
mvn spring-boot:run

# Or using the JAR file
java -jar target/mlm-backend-1.0.0.jar
```

The application will start on **http://localhost:8080/api**

### 5. **Initialize Database with Sample Data**

```bash
# Run the initialization script
psql -U postgres -d mlm_platform -f src/main/resources/data-init.sql
```

## 📚 API Documentation

Once the application is running, access:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **API Docs (JSON)**: http://localhost:8080/api/v3/api-docs

## 🔐 Default Admin Credentials

```
Email: admin@mlm-platform.com
Password: admin123
```

**⚠️ IMPORTANT**: Change this password after first login in production!

## 🏗️ Project Structure

```
src/main/java/com/realestate/mlm/
├── aspect/          # AOP logging aspects
├── config/          # Spring configuration
│   ├── SecurityConfig.java
│   ├── SwaggerConfig.java
│   └── CorsConfig.java
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
│   ├── request/
│   └── response/
├── exception/      # Custom exceptions & handlers
├── model/          # JPA entities
├── repository/     # JPA repositories
├── security/       # JWT & authentication
├── service/        # Business logic
├── scheduler/      # Scheduled tasks
└── util/           # Utility classes
```

## 🔑 Key Features

### ✅ Security
- **JWT-based authentication**
- **BCrypt password hashing** (strength: 12)
- **Role-based access control** (ADMIN, MANAGER, MEMBER, FRANCHISE)
- **CORS configuration**
- **Input validation** with Bean Validation

### ⚡ Performance
- **Pessimistic locking** for wallet operations (thread-safe)
- **Optimized database queries** (no N+1 problems)
- **Redis caching** for frequently accessed data
- **Database indexing** on critical columns
- **Connection pooling** with HikariCP

### 📊 MLM Features
- **Binary tree structure**
- **Level commission** (10 levels)
- **Direct referral bonus** (2%)
- **Binary pairing bonus** (₹100 per pair)
- **Daily commission cap** (₹25,000)
- **Weekly commission cap** (₹1,50,000)
- **ROI cap** (300%)
- **Wallet system** (Investment, Commission, ROI, Rental Income)
- **Withdrawal system** with TDS & admin charges

### 📝 Logging
- **AOP-based logging** for all service methods
- **Method execution time tracking**
- **Exception logging**
- **Performance warnings** for slow methods (>3s)

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run with coverage
mvn clean verify
```

## 🐛 Bugs Fixed in This Release

### 🚨 Critical Bugs Fixed:
1. ✅ **Fixed javax.persistence imports** → Changed to jakarta.persistence (Spring Boot 3 compatibility)
2. ✅ **Fixed CORS configuration bug** → Was set to null, causing CORS errors
3. ✅ **Fixed severe N+1 query problem** → getTodayCommissions now uses optimized DB query
4. ✅ **Fixed JWT property mismatch** → Corrected refresh token expiration property name

### ⚡ Performance Improvements:
5. ✅ **Added pessimistic locking** → Prevents race conditions in wallet operations
6. ✅ **Optimized commission queries** → Reduced database load significantly
7. ✅ **Added database indexes** → Improved query performance

### 🎯 New Features:
8. ✅ **Added comprehensive AOP logging** → Automatic logging with execution time tracking
9. ✅ **Added database initialization script** → Easy setup with sample data
10. ✅ **Improved exception handling** → Comprehensive error responses

## 📦 Database Schema

The application uses **Hibernate DDL auto-update**. Schema is created automatically on first run.

Key tables:
- `users` - User accounts and MLM tree structure
- `wallets` - Multi-wallet system for each user
- `commissions` - Commission records
- `transactions` - All financial transactions
- `properties` - Real estate properties
- `property_investments` - User investments
- `payouts` - Withdrawal requests
- `support_tickets` - Customer support

## 🔄 Running in Production

### Using Docker (Recommended)

```bash
# Build Docker image
docker build -t mlm-backend:1.0.0 .

# Run with Docker Compose
docker-compose up -d
```

### Environment-specific Configuration

```bash
# Development
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Production
java -jar target/mlm-backend-1.0.0.jar --spring.profiles.active=prod
```

## 📞 Support

For issues and questions:
- Email: support@mlm-platform.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## 📄 License

Proprietary - All Rights Reserved

---

**Built with ❤️ using Spring Boot**
