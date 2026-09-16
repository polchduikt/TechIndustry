# TechIndustry — REST API Documentation

Comprehensive reference documentation for the TechIndustry REST API and server-side endpoints.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![API Version](https://img.shields.io/badge/API-v1.0-blue.svg)](API_DOCUMENTATION.md)

---

## Overview & Architecture

TechIndustry provides a RESTful API designed with a layered architecture (Routes → Controllers → Services → Models) powered by **Express 5** and **PostgreSQL (Sequelize)**.

- **Base URL**: `http://localhost:3000` (Local) / `https://techindustry.app` (Production)
- **Response Format**: JSON (`application/json`) / Server-Rendered HTML for UI pages / PDF for certificates
- **Security Headers**: Managed via Helmet (CSP, HSTS, X-Frame-Options)
- **Content Encoding**: Gzip compression supported

---

## Authentication & Security

The platform supports a dual authentication mechanism:

1. **JWT (JSON Web Tokens)**:
   - Tokens are issued upon successful registration or login via `POST /api/auth/login` or `POST /api/auth/register`.
   - Set automatically in an `httpOnly`, `secure` (in production), `sameSite: strict` cookie named `token`.
   - Can also be passed via the `Authorization` header: `Authorization: Bearer <token>`.
   - Default token validity: `30 days`.

2. **Google OAuth 2.0 SSO**:
   - Web flow initialized via `GET /api/auth/google`.
   - Callback handled at `GET /api/auth/google/callback` with CSRF state validation.

3. **CSRF Protection**:
   - Double-submit cookie CSRF tokens managed via `csurf`.
   - Client requests mutating state (`POST`, `PUT`, `DELETE`, `PATCH`) must supply the `_csrf` body field or `CSRF-Token` header.

4. **Rate Limiting Quotas**:
   - **Global**: 1000 requests / 15 minutes per IP.
   - **Login**: 5 attempts / 15 minutes.
   - **Registration**: 3 attempts / 1 hour.
   - **Email Verification**: 10 requests / 1 hour.
   - **Password Reset**: 3 attempts / 1 hour.
   - **Quiz Submissions**: 10 submissions / 1 minute.
   - **AI Mentor**: 10 messages / 5 minutes cooldown with burst protection (max 5 msgs / 30s).
   - **Shop Purchases**: 10 transactions / 1 minute.

---

## Error Handling

Standard HTTP status codes are returned with a consistent JSON envelope:

```json
{
  "message": "Validation failed on input fields",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Common status codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or missing parameters.
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Insufficient permissions or CSRF token mismatch.
- `404 Not Found`: Resource not found.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Server exception.

---

## API Endpoints

### 1. Authentication & User Management

#### Request Email Verification Code
```http
POST /api/auth/request-email-verification
```
- **Auth**: Public
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "first_name": "John"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Verification code sent to your email",
    "email": "user@example.com"
  }
  ```

#### Verify Email Code
```http
POST /api/auth/verify-email-code
```
- **Auth**: Public
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Email successfully verified",
    "verified": true
  }
  ```

#### Register User
```http
POST /api/auth/register
```
- **Auth**: Public (Rate Limited)
- **Content-Type**: `multipart/form-data` or `application/json`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+380991234567",
    "emailVerified": "true"
  }
  ```
- **Files**: `avatar` (Optional, max 5MB image)
- **Response `201 Created`**:
  ```json
  {
    "message": "Registration successful",
    "username": "johndoe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

#### User Login
```http
POST /api/auth/login
```
- **Auth**: Public (Rate Limited)
- **Body**:
  ```json
  {
    "login": "johndoe",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Authentication successful",
    "username": "johndoe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

#### User Logout
```http
POST /api/auth/logout
```
- **Auth**: Public
- **Response `200 OK`**:
  ```json
  {
    "message": "Logged out successfully",
    "redirect": "/"
  }
  ```

#### Check Username/Email/Phone Availability
```http
POST /api/auth/check-availability
```
- **Auth**: Public
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+380991234567"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "available": true
  }
  ```

#### Request Password Reset Code
```http
POST /api/auth/request-reset
```
- **Auth**: Public (Rate Limited)
- **Body**:
  ```json
  {
    "emailOrPhone": "john@example.com"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Password reset code sent to your email",
    "codeSent": true
  }
  ```

#### Verify Password Reset Code
```http
POST /api/auth/verify-reset-code
```
- **Auth**: Public
- **Body**:
  ```json
  {
    "emailOrPhone": "john@example.com",
    "code": "654321"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Code verified successfully",
    "verified": true
  }
  ```

#### Reset Password
```http
POST /api/auth/reset-password
```
- **Auth**: Public
- **Body**:
  ```json
  {
    "emailOrPhone": "john@example.com",
    "code": "654321",
    "newPassword": "NewStrongPassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Password updated successfully",
    "success": true
  }
  ```

#### Update User Profile
```http
POST /api/auth/update-profile
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "username": "johndoe_updated",
    "email": "newjohn@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "about": "Full-stack developer and cloud enthusiast",
    "github_link": "https://github.com/johndoe"
  }
  ```
- **Response**: Redirect to `/settings` or `200 OK`.

#### Change Password
```http
POST /api/auth/change-password
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "BrandNewPassword123!"
  }
  ```

#### Upload Profile Avatar
```http
POST /api/auth/upload-avatar
```
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Files**: `avatar` (Image file max 5MB)

#### Delete Profile Avatar
```http
POST /api/auth/delete-avatar
```
- **Auth**: Required

#### Delete Account
```http
POST /api/auth/delete-account
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "confirmation": "DELETE"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Account deleted successfully",
    "redirect": "/"
  }
  ```

---

### 2. Courses & Curriculum

#### Get Course Catalog
```http
GET /api/courses
```
- **Auth**: Public
- **Response `200 OK`**: Returns catalog of courses with module counts, hours, and learner progress.

#### Get Course Detail & Modules
```http
GET /api/courses/:slug
```
- **Auth**: Public
- **Parameters**: `slug` (e.g., `python-for-data`, `react-next`, `csharp-dotnet`)
- **Response `200 OK`**: Detailed course structure including modules and lesson metadata.

#### Get Lesson Content
```http
GET /api/courses/lessons/:lessonId
```
- **Auth**: Public
- **Parameters**: `lessonId` (Integer ID)
- **Response `200 OK`**:
  ```json
  {
    "id": 15,
    "title": "Asynchronous Programming with async/await",
    "content": "# Markdown formatted lesson content...",
    "module_id": 4,
    "order": 16
  }
  ```

---

### 3. User Progress Tracking

#### Get Enrolled Courses & Progress
```http
GET /api/progress
```
- **Auth**: Required
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "user_id": 42,
      "course_id": 2,
      "status": "in_progress",
      "completed_lessons": [1, 2, 3, 4],
      "completed_quizzes": ["react-next:01-basics"],
      "started_at": "2026-03-01T10:00:00.000Z",
      "last_accessed": "2026-03-16T14:30:00.000Z"
    }
  ]
  ```

#### Enroll / Start Course
```http
POST /api/progress/start
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "courseSlug": "csharp-dotnet"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Course started",
    "progress": {
      "user_id": 42,
      "course_id": 1,
      "status": "in_progress",
      "completed_lessons": [],
      "completed_quizzes": []
    }
  }
  ```

#### Update Lesson Completion State
```http
POST /api/progress/lesson
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "lessonId": 7,
    "completed": true
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Progress updated",
    "progress": {
      "completed_lessons": [1, 2, 3, 7],
      "status": "in_progress"
    },
    "rewards": {
      "xpGained": 50,
      "coinsGained": 10,
      "newCoinsBalance": 260,
      "leveledUp": false,
      "newLevel": 4,
      "newBadges": []
    }
  }
  ```

---

### 4. Quizzes & Assessments

#### Submit Quiz Answers
```http
POST /quiz/:slug/:moduleId/submit
```
- **Auth**: Required (Rate Limited)
- **Parameters**:
  - `slug`: Course slug (e.g. `react-next`)
  - `moduleId`: Module ID (e.g. `01-react-fundamentals`)
- **Body**:
  ```json
  {
    "answers": {
      "q1": "1",
      "q2": ["0", "2"],
      "q3": "const [state, setState] = useState(0);"
    }
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "passed": true,
    "percent": 100,
    "correctCount": 5,
    "totalQuestions": 5,
    "message": "Congratulations! Quiz passed successfully.",
    "gamification": {
      "xpGained": 150,
      "coinsGained": 30,
      "newCoinsBalance": 290,
      "leveledUp": true,
      "newLevel": 5,
      "newBadges": [
        {
          "id": "perfect_quiz",
          "name": "Perfectionist",
          "description": "Passed quiz with 100% score"
        }
      ]
    },
    "isRepeat": false
  }
  ```

---

### 5. Certificates & Verification

#### Check Certificate Eligibility
```http
GET /api/certificates/check/:courseId
```
- **Auth**: Required
- **Parameters**: `courseId` (Integer ID)
- **Response `200 OK`**:
  ```json
  {
    "available": true,
    "status": "completed",
    "completedLessons": 20,
    "totalLessons": 20,
    "progressPercent": 100
  }
  ```

#### Download / Stream PDF Certificate
```http
GET /api/certificates/download/:courseId
```
- **Auth**: Required
- **Parameters**: `courseId` (Integer ID)
- **Response `200 OK`**: `Content-Type: application/pdf` with `Content-Disposition: inline; filename=certificate-{courseId}.pdf`.

---

### 6. AI Mentor & Chatbot

#### Get AI Mentor Status & Quotas
```http
GET /api/ai/status
```
- **Auth**: Public / Session-based
- **Response `200 OK`**:
  ```json
  {
    "count": 3,
    "limit": 10,
    "resetTime": null
  }
  ```

#### Chat with Groq AI Mentor
```http
POST /api/ai/chat
```
- **Auth**: Public / Session-based (Strict Anti-Spam & Rate Limits)
- **Body**:
  ```json
  {
    "message": "Explain how async/await works in Node.js",
    "history": [
      {
        "role": "user",
        "parts": [{ "text": "Hello!" }]
      },
      {
        "role": "model",
        "parts": [{ "text": "Hello! How can I help you with IT or the TechIndustry platform today?" }]
      }
    ]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "response": "async/await is syntactic sugar built on top of JavaScript Promises...",
    "status": {
      "count": 4,
      "limit": 10,
      "resetTime": null
    }
  }
  ```

---

### 7. Shop, Inventory & Cosmetics

#### Get Shop Catalog & User Balance
```http
GET /api/shop/data
```
- **Auth**: Required
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "userCoins": 450,
    "items": [
      {
        "id": 1,
        "title": "Neon Cyberpunk Frame",
        "item_type": "avatar_frame",
        "price": 150,
        "is_owned": true,
        "is_equipped": true
      }
    ],
    "purchases": []
  }
  ```

#### Purchase Shop Item
```http
POST /api/shop/purchase
```
- **Auth**: Required (Rate Limited)
- **Body**:
  ```json
  {
    "itemId": 1
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Item purchased successfully!",
    "newBalance": 300
  }
  ```

#### Equip Cosmetic Item
```http
POST /api/shop/equip
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "itemId": 1
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Item equipped!"
  }
  ```

#### Unequip Cosmetic Item
```http
POST /api/shop/unequip
```
- **Auth**: Required
- **Body**:
  ```json
  {
    "itemId": 1
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Item unequipped!"
  }
  ```

---

### 8. Learning Roadmaps

#### Get Roadmap Data
```http
GET /api/roadmaps/:id
```
- **Auth**: Public
- **Parameters**: `id` (e.g. `frontend`, `backend`, `devops`, `full-stack`)
- **Response `200 OK`**: Structured tree of roadmap nodes, topics, and external learning links.
