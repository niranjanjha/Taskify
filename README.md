# 🚀 Taskify: AI Group Project Manager

Taskify is an **AI-powered group project management system** that goes beyond traditional task trackers. Instead of just storing tasks, Taskify **learns how teams work over time** and provides intelligent suggestions using memory-driven AI.

Built with the **MERN stack** and enhanced with **Hindsight (agent memory)** and **Groq (LLM)**, Taskify helps teams collaborate smarter, reduce delays, and improve productivity automatically.

---

## 🧠 What Makes Taskify Different?

Most task managers only track work.

**Taskify learns from it.**

* Remembers past task outcomes
* Identifies delay patterns
* Suggests better task assignments
* Generates insights from team behavior

This is powered by **persistent agent memory** using Hindsight.

👉 Learn more about memory system:

* [https://vectorize.io/features/agent-memory](https://vectorize.io/features/agent-memory)
* [https://hindsight.vectorize.io/](https://hindsight.vectorize.io/)
* [https://github.com/vectorize-io/hindsight](https://github.com/vectorize-io/hindsight)

---

## ✨ Features

### 📌 Core Task Management

* User authentication (JWT-based login/register)
* Role-based access (**User / Superuser**) 
* Create, update, delete tasks
* Task priority (Low, Medium, High)
* Due date tracking & filters
* Subtasks with progress sync
* Multi-user task assignment

---

### 🤖 AI Assistant (Hindsight + Groq)

* Memory-based task suggestions
* Deadline risk prediction
* Smart task assignment recommendations
* Meeting summarization
* Extract tasks from meeting text
* Team activity insights (inactive members, overload detection)

👉 Every important action (task creation, completion, assignment) is stored as memory and reused later 

---

### ⚡ Real-Time Collaboration

* Socket.IO for real-time communication
* Video call signaling (WebRTC)
* Live interaction between team members 

---

### 🔐 Advanced Authentication

* Face registration & login system
* Secure password hashing (bcrypt)
* JWT-based session management 

---

### 📧 Automation

* Welcome emails on signup
* Automatic deadline reminders (cron-based) 

---

## 🏗️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* Recharts

### Backend

* Node.js + Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Socket.IO
* Nodemailer + Cron

### AI Layer

* **Hindsight** → Memory system
* **Groq** → LLM processing

---

## ⚙️ System Architecture

```
User Actions (Tasks, Updates)
        ↓
Backend (Express API)
        ↓
Event Storage → Hindsight Memory
        ↓
Agent Layer (Groq LLM)
        ↓
AI Suggestions (Dashboard)
```

---

## 📁 Project Structure

```
Taskify/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd Taskify
```

---

### 2️⃣ Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

---

### 3️⃣ Setup environment variables

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

# AI
HINDSIGHT_API_KEY=
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# Email
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

---

### 4️⃣ Run the project

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

---

## 🤖 How AI Learning Works

Taskify doesn’t “guess” — it **learns from history**:

Example memory stored:

```json
{
  "task": "Fix API Bug",
  "assignedTo": "UserA",
  "result": "delayed",
  "reason": "unclear requirements"
}
```

Later, the agent can:

* Predict delays
* Suggest reassignment
* Improve planning decisions

---

## 📊 Example Use Case

### Before AI

* Tasks assigned manually
* Delays discovered late

### After Taskify AI

* Predicts delays early
* Suggests better assignments
* Highlights risky tasks

---

## 📌 API Overview

### Auth

* `/api/user/register`
* `/api/user/login`

### Tasks

* `/api/tasks/gp`
* `/api/tasks/:id/gp`
* `/api/tasks/assign`

### AI

* `/api/ai/suggestions`
* `/api/ai/chat`
* `/api/ai/summarize`

---

## 🧪 Future Improvements

* Smarter learning (pattern weighting, decay)
* Better explainability (“why this suggestion?”)
* Advanced team analytics dashboard
* Mobile app support

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch
3. Make changes
4. Submit PR

---

## 📄 License

MIT License

---

## 💡 Final Thought

Taskify started as a simple task manager.

It became something more:

A system that doesn’t just track work —
but **learns how your team works and improves it over time.**

