# Taskify - Task Management Application

Taskify is a modern task management application built with the MERN stack (MongoDB, Express.js, React, Node.js). It supports individuals and teams with tasks, assignments, reminders, optional face login, real-time video/chat signaling, and an **AI layer** powered by **Hindsight** (memory) and **Groq** (LLM).

## Features

### Core task management
- User authentication (register / login) with JWT
- User roles: **`user`** and **`superuser`** (JWT includes `role`; use CLI to create a superuser)
- Create, read, update, and delete tasks
- Task prioritization (Low, Medium, High)
- Due date tracking and filters (e.g. today, week, by priority)
- Subtask management with completion sync to parent tasks
- Multi-user **task assignment** with roles (e.g. Member)
- Task detail view, delete confirmation, and assignment-aware UI (“Assigned to you”)
- Progress and stats on the dashboard

### AI assistant (Hindsight + Groq)
- **Memory bank** per user via [Hindsight](https://hindsight.vectorize.io) (`retain` / `recall`) — task creation, completion, and assignments are stored as memories when APIs succeed
- **Groq** LLM for generation and analysis (model configurable via `GROQ_MODEL`)
- Dashboard **AI assistant** panel: suggestions, deadline insights, team risk / inactive insights, meeting summarize, extract tasks from meeting text, smart assignment hints, team roles saved to memory, and project chat
- REST API under `/api/ai/*` (authenticated)

### Collaboration & real-time
- **Socket.IO** server for video-call signaling (WebRTC offer/answer/ICE) and in-room messaging hooks (`videoCallService`)
- Optional verbose socket logging via `DEBUG_SOCKET_IO=true`

### Authentication extras
- **Face registration / face login** (face descriptors stored on the user model; see `/api/face`)

### Other modules
- **Todo / doodle** CRUD API (`/api/todos`) for the todo feature in the app

### Email
- Welcome email on registration
- Scheduled **deadline reminders** (tasks and subtasks due within a window; cron-driven)

### UX
- Responsive layout (Tailwind), icons (Lucide), custom dropdowns and modals

## Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios
- Lucide React
- Vite
- Recharts (where used in UI)

### Backend
- Node.js (ES modules)
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for passwords
- Nodemailer + node-cron (reminders)
- Socket.IO (video / signaling)
- **Groq SDK** — LLM calls
- **@vectorize-io/hindsight-client** — Hindsight memory API

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Atlas or local)
- For AI features: Hindsight API key and Groq API key
- Gmail + app password (if using email features)

### Installation

1. Clone the repository and enter the project folder.

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment variables

Create a `backend/.env` file. See `backend/.env.example` for AI-related keys. Typical variables:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret

# Email (welcome + reminders)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI (optional but required for AI routes / dashboard assistant)
HINDSIGHT_API_KEY=
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# Optional: log Socket.IO connect/signaling (default: off)
# DEBUG_SOCKET_IO=true
```

For Gmail / app passwords, see `backend/EMAIL_SETUP.md`.

### Create a superuser

From `backend`:

```bash
npm run create-superuser -- you@example.com "YourPassword12!" "Your Name"
```

If the email already exists, the account is promoted to `superuser` and the password is updated.

### Running the application

1. Start the API (either command works):
```bash
cd backend
npm run dev
# or: npm start
```

2. Start the frontend:
```bash
cd ../frontend
npm run dev
```

3. Open the app at the URL Vite prints (commonly `http://localhost:5173`). The API defaults to `http://localhost:4000` (see frontend API base URLs in pages/components if you change the port).

## Email behavior

- **Welcome email** after successful registration  
- **Deadline reminders** for tasks/subtasks approaching due time (hourly cron)

## Project structure (overview)

```
Taskify/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/          # e.g. createSuperuser.js
│   ├── services/         # email, AI, video/socket, reminders
│   ├── .env
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── index.html
└── README.md
```

## API overview

All private routes expect `Authorization: Bearer <token>` unless noted.

### User (`/api/user`)
| Method | Path | Auth |
|--------|------|------|
| POST | `/register` | No |
| POST | `/login` | No |
| GET | `/me` | Yes |
| PUT | `/profile` | Yes |
| PUT | `/password` | Yes |

Responses include `user.role` where applicable; JWT payload includes `role`.

### Tasks (`/api/tasks`)
| Method | Path | Notes |
|--------|------|--------|
| GET/POST | `/gp` | List / create tasks |
| GET/PUT/DELETE | `/:id/gp` | Single task |
| POST | `/assign` | Assign user to task |
| POST | `/remove` | Remove assignee |
| … | `/subtasks` … | Subtask CRUD |
| GET | `/users` | List users for assignment |

### Todos (`/api/todos`)
| Method | Path |
|--------|------|
| GET/POST | `/gp` |
| GET/PUT/DELETE | `/:id/gp` |

### Face (`/api/face`)
| Method | Path | Auth |
|--------|------|------|
| POST | `/register` | Yes |
| POST | `/login` | No |
| GET | `/check` | Yes |

### AI (`/api/ai`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/suggestions` | AI suggestions from memory + Groq |
| POST | `/summarize` | Body: `{ "text" }` — meeting summary; stored in Hindsight |
| POST | `/suggest-assignment` | Body: `{ "task" }` |
| GET | `/deadline-insights` | Deadline-focused insights |
| POST | `/chat` | Body: `{ "message" }` — project chat |
| GET | `/inactive-insights` | Team / workload risk heuristics |
| POST | `/extract-meeting-tasks` | Body: `{ "text" }` — structured task ideas |
| POST | `/team-roles` | Body: `{ "roles" }` — save roles to memory |

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes  
4. Push and open a pull request  

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file if included.

## Support

Open an issue in the repository or contact the maintainers.
