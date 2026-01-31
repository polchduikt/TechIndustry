# TechIndustry

TechIndustry is a scalable, production-ready web platform for IT education, skill development, and automated knowledge assessment. The project is designed with a strong focus on clean architecture, performance, and real-world learning workflows.

---

## Overview

TechIndustry provides a modern Learning Management System (LMS) that enables users to study structured IT courses, track progress in real time, and receive certificates upon course completion. The platform supports both authenticated users and guests, ensuring an accessible entry point while preserving full functionality for registered learners.

---

## Technologies

The platform is built using a robust and maintainable technology stack:

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **ORM:** Sequelize
* **Architecture:** Layered MVC (Routes, Controllers, Services, Models)
* **Authentication:** JWT-based authentication
* **UI/UX:** Custom CSS (Glassmorphism), responsive layout, modern typography
* **Environment Configuration:** Secure `.env` configuration

---

## Screenshots

### Home Page
![Home Page](assets/screenshots/home.jpg)

### Course Catalog
![Course Catalog](assets/screenshots/course.jpg)

### User Profile
![User Profile](assets/screenshots/profile.jpg)

### Quiz & Testing
![Quiz System](assets/screenshots/test.jpg)

---

## Core Features

### Learning Management System (LMS)

* Modular course structure (Courses → Modules → Lessons)
* Interactive lesson content with rich text and code examples
* Course categorization (Frontend, Backend, DevOps, Data Science)
* Fully responsive interface for desktop and mobile devices

### User Progress Tracking

* Automatic lesson completion tracking
* Persistent progress storage in PostgreSQL
* Real-time progress visualization (percentages, progress bars)
* Course status states: not started, in progress, completed

### Automated Assessment

* Module-based quizzes
* Instant validation of answers
* Detailed feedback for incorrect responses
* Progress analytics and learning insights

### Certification System

* Automatic course completion verification
* Secure PDF certificate generation
* Certificate availability checks via API
* Inline certificate preview and download

### Authentication & Access Control

* JWT-based user authentication
* Secure protected routes
* Guest access with limited functionality
* Automatic token validation and expiration handling

---

## Frontend Behavior

* Guest users can browse all available courses
* Progress and certificates are visible only to authenticated users
* Guests attempting to start a course are automatically redirected to the login page
* UI dynamically adapts based on authentication state

---

## Repository Structure

* **main** – Project documentation, configuration, and metadata
* **dev** – Active development branch
* **feature/** – Feature-specific branches (authentication, quizzes, certificates, etc.)
* **fix/** – Hotfix branches for critical issues

---

## Getting Started

### Prerequisites

* Node.js (LTS recommended)
* PostgreSQL

### Installation

1. Clone the repository:

```bash
git clone https://github.com/polchduikt/TechIndustry.git
cd TechIndustry
```

2. Install dependencies:

```bash
npm install express cookie-parser dotenv jsonwebtoken express-validator multer sequelize
```

3. Configure environment variables:

Create a `.env` file in the project root and define:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=name
DB_USER=name
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

4. Run database migrations and start the server:

```bash
npm run dev
```

---

## API Highlights
## Public APIs (No Authentication Required)

### Authentication

* `POST /api/auth/register` – Register a new user with optional avatar upload
* `POST /api/auth/login` – User login (returns a JWT token)

### Courses & Roadmaps

* `GET /api/courses` – Retrieve the full catalog of available courses
* `GET /api/courses/:slug` – Get detailed course information (modules, descriptions)
* `GET /api/courses/lessons/:lessonId` – Retrieve lesson content and materials
* `GET /api/roadmaps/:id` – Load a structured learning roadmap (frontend, backend, etc.)

### Quizzes & Assessments

* `GET /api/courses/:slug/quizzes` – List available quizzes for a specific course
* `GET /api/courses/:slug/quizzes/:moduleId` – Retrieve quiz questions (without correct answers)
* `POST /api/courses/:slug/quizzes/:moduleId/submit` – Submit quiz answers for server-side validation


## Protected APIs (Authentication Required)

### Profile Management

* `GET /api/auth/profile` – Retrieve the current user profile data
* `PATCH /api/auth/update-profile` – Update email, phone number, or username
* `PATCH /api/auth/change-password` – Secure password change with old password verification
* `POST /api/auth/upload-avatar` – Upload or replace profile avatar (Base64)
* `DELETE /api/auth/delete-avatar` – Remove the current profile avatar

### Learning Progress

* `GET /api/progress` – Retrieve all enrolled courses with their progress status
* `POST /api/progress/start` – Start a new course and create a progress record
* `GET /api/progress/course/:courseSlug` – Retrieve detailed progress for a specific course
* `POST /api/progress/lesson` – Mark a lesson as completed

### Certificates

* `GET /api/certificates/check/:courseId` – Check certificate eligibility
* `GET /api/certificates/generate/:courseId` – Generate a certificate record
* `GET /api/certificates/download/:courseId` – Download the certificate as a PDF file

---

## Project Status

The project is actively developed and continuously improved. Current priorities include performance optimization, extended analytics, and enhanced assessment logic.

---

## License

This project is licensed under the MIT License.
