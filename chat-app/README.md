# 💬 Real-time Chat Application

Full-stack real-time chat app built with the MERN stack + Socket.io.

## Features
- ⚡ Real-time messaging with Socket.io & WebSockets
- 👥 Group chat rooms + Direct messages
- 💾 Message persistence (MongoDB)
- 🟢 User online/offline presence
- ✏️ Live typing indicators
- 🔐 JWT Authentication
- 📱 Responsive UI

## Tech Stack
- **Frontend:** React.js, Socket.io-client, React Router v6, Axios
- **Backend:** Node.js, Express.js, Socket.io, Mongoose
- **Database:** MongoDB

## 🚀 Quick Start

### 1. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MongoDB URI and JWT secret
npm run dev
```

### 2. Setup Client
```bash
cd client
npm install
cp .env.example .env
# Edit .env if your server is not on localhost:5000
npm start
```

### 3. Open Browser
Go to **http://localhost:3000** — register two accounts in different tabs and start chatting!

## Project Structure
```
chat-app/
├── server/
│   ├── index.js              # Entry point
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   └── socket/
│       └── socketHandler.js  # All real-time logic
└── client/
    └── src/
        ├── App.js
        ├── context/
        │   ├── AuthContext.js
        │   └── SocketContext.js
        ├── hooks/
        │   └── useChat.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   └── ChatPage.js
        └── components/chat/
            ├── Sidebar.js
            ├── ChatWindow.js
            ├── NewChatModal.js
            └── EmptyChat.js
```

## Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | C→S | Join a chat room |
| `send_message` | C→S | Send message |
| `receive_message` | S→C | Receive message |
| `typing_start` | C→S | Start typing |
| `typing_stop` | C→S | Stop typing |
| `user_typing` | S→C | Someone is typing |
| `user_online` | S→C | User came online |
| `user_offline` | S→C | User went offline |
