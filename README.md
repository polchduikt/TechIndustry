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
npm install
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

* `/api/auth` – Authentication and user profile
* `/api/courses` – Course catalog
* `/api/progress` – User progress tracking
* `/api/certificates` – Certificate availability and PDF generation

---

## Project Status

The project is actively developed and continuously improved. Current priorities include performance optimization, extended analytics, and enhanced assessment logic.

---

## License

This project is licensed under the MIT License.
