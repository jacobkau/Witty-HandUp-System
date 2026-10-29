#  Witty HandUp System

A community-driven task management platform that connects people who need help with local helpers. Built with the MERN stack, Witty HandUp features a live bidding system, real-time chat, and a unique manual payment verification flow tailored for mobile money (M-Pesa).

##  Live Demo
*   **Frontend:** [https://wittyhandupsystem.vercel.app/](https://wittyhandupsystem.vercel.app/)
*   **Backend API:** [https://handup.onrender.com](https://handup.onrender.com)

---

## Project Overview

Witty HandUp simplifies task delegation in communities. Whether you need someone to run an errand, fix a leaking sink, or tutor a student, you can post a task, set a budget, and let helpers bid on it. 

To ensure safety and transparency without integrating complex payment gateways, the system uses a **Manual Payment Verification Flow**:
1. The Requester accepts a Helper's bid.
2. Once the work is done, the Requester pays via M-Pesa and submits the transaction code.
3. The Helper confirms receipt of the funds.
4. The system automatically marks the task as completed and logs the Helper's earnings.

---

## Features

### Core Functionality
*   **Live Bidding System:** Helpers can negotiate by submitting bids on open tasks.
*   **Task Management:** Create, edit, and delete tasks with custom budgets, categories, and deadlines.
*   **Urgent Tasks:** Highlight urgent tasks with a red banner (limited to 2 active urgent tasks per user).
*   **Geospatial Location:** Pin exact task locations and get turn-by-turn directions via Google Maps.
*   **Skill Matching:** Users can add skills to their profile and receive instant Socket.IO notifications when matching tasks are posted.

### Communication & Safety
*   **Real-time In-App Chat:** A full messaging modal powered by Socket.IO, allowing requesters and helpers to coordinate without sharing personal phone numbers.
*   **Manual Payment Verification:** Built-in M-Pesa transaction tracking for secure, offline payments.
*   **Reputation System:** Requesters can rate Helpers (1-5 stars) upon task completion, building a trust-based community.

### Admin & Security
*   **Admin Dashboard:** Monitor total users, active tasks, and platform value.
*   **User Management:** Admins can deactivate or permanently delete users who violate community guidelines.
*   **Role-Based Access Control:** Secure JWT authentication with distinct User and Admin roles.

---

##  Tech Stack

**Frontend:**
*   React.js (Vite)
*   Material-UI (MUI) & Tailwind CSS
*   React Router DOM
*   Socket.IO Client
*   Axios

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose (with `2dsphere` geospatial indexing)
*   Socket.IO (Real-time WebSockets)
*   JSON Web Tokens (JWT) for Authentication
*   Bcrypt.js (Password hashing)

**Deployment:**
*   Frontend hosted on **Vercel**
*   Backend & Database hosted on **Render** & **MongoDB Atlas**

---

## System Architecture & Flow

1. **Post Task (`open`):** Requester posts a task with a starting budget.
2. **Bidding:** Helpers submit bids. The Requester can accept one bid, locking the task.
3. **Accept Bid (`claimed`):** The accepted Helper is assigned, and the chat opens.
4. **Task Completion:** The Helper performs the task.
5. **Submit Payment (`awaiting_verification`):** Requester pays via M-Pesa and inputs the transaction code.
6. **Confirm Payment (`completed`):** Helper verifies the money is in their account and clicks confirm. The Helper's total earnings are updated dynamically.

---

## Local Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account (or local MongoDB)
*   Git

### 1. Clone the repository
```bash
git clone https://github.com/jacobkau/HandUp.git
cd HandUp
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
```

*(Optional)* To make a user an Admin, update their `role` to `"admin"` directly in MongoDB Compass.

---

## 📡 Core API Endpoints

### Auth
*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - Authenticate & receive JWT
*   `GET /api/auth/me` - Get current user profile & earnings

### Tasks
*   `GET /api/tasks` - Get paginated tasks (with search & category filters)
*   `POST /api/tasks` - Create a new task
*   `POST /api/tasks/:id/bid` - Place a bid on a task
*   `PUT /api/tasks/:id/accept-bid` - Accept a specific bid
*   `PUT /api/tasks/:id/submit-payment` - Submit M-Pesa transaction code
*   `PUT /api/tasks/:id/confirm-payment` - Helper confirms payment received
*   `POST /api/tasks/:id/rate` - Rate a helper after completion

### Messages
*   `GET /api/messages/:taskId` - Get chat history for a task
*   `POST /api/messages/:taskId` - Send a message

---

## 👨‍💻 Developer

**Jacob Kau**  
*Full-Stack Software Engineer*

I designed and engineered this entire system from the ground up, including the RESTful API, real-time WebSocket architecture, secure state management, and responsive frontend.

*   **GitHub:** [https://github.com/jacobkau](https://github.com/jacobkau)
*   **LinkedIn:** [https://www.linkedin.com/in/jacob-mwambwa-8b7296362](https://www.linkedin.com/in/jacob-mwambwa-8b7296362)
*   **Email:** wittyhighbrowtechnologies@gmail.com

---
*© 2026 Witty Highbrow Technologies. All Rights Reserved.*
```
