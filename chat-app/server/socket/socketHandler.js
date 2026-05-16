const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Room = require("../models/Room");

// Map userId -> socketId for presence tracking
const onlineUsers = new Map();

const initSocket = (io) => {
  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error: No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("Authentication error: User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(`🟢 ${user.username} connected [${socket.id}]`);

    // Mark user online
    onlineUsers.set(user._id.toString(), socket.id);
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    io.emit("user_online", { userId: user._id });

    // ── JOIN ROOM ──────────────────────────────────────────────
    socket.on("join_room", async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return socket.emit("error", { message: "Room not found" });
        if (!room.members.some((m) => m.toString() === user._id.toString())) {
          return socket.emit("error", { message: "Not a member of this room" });
        }
        socket.join(roomId);
        socket.emit("joined_room", { roomId });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── LEAVE ROOM ─────────────────────────────────────────────
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
    });

    // ── SEND MESSAGE ───────────────────────────────────────────
    socket.on("send_message", async ({ roomId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const room = await Room.findById(roomId);
        if (!room || !room.members.some((m) => m.toString() === user._id.toString())) {
          return socket.emit("error", { message: "Cannot send message to this room" });
        }

        const message = await Message.create({
          room: roomId,
          sender: user._id,
          content: content.trim(),
          readBy: [user._id],
        });

        // Update room's lastMessage
        await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

        const populated = await message.populate("sender", "username avatar");

        // Broadcast to all users in the room
        io.to(roomId).emit("receive_message", populated);

        // Notify offline members
        room.members.forEach((memberId) => {
          if (memberId.toString() !== user._id.toString()) {
            const memberSocketId = onlineUsers.get(memberId.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit("new_message_notification", {
                roomId,
                message: populated,
              });
            }
          }
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── TYPING INDICATORS ──────────────────────────────────────
    socket.on("typing_start", ({ roomId }) => {
      socket.to(roomId).emit("user_typing", { userId: user._id, username: user.username, roomId });
    });

    socket.on("typing_stop", ({ roomId }) => {
      socket.to(roomId).emit("user_stop_typing", { userId: user._id, roomId });
    });

    // ── READ RECEIPT ───────────────────────────────────────────
    socket.on("mark_read", async ({ roomId }) => {
      try {
        await Message.updateMany(
          { room: roomId, readBy: { $ne: user._id } },
          { $addToSet: { readBy: user._id } }
        );
        socket.to(roomId).emit("messages_read", { roomId, userId: user._id });
      } catch (err) {
        console.error("mark_read error:", err.message);
      }
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`🔴 ${user.username} disconnected`);
      onlineUsers.delete(user._id.toString());
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() });
      io.emit("user_offline", { userId: user._id });
    });
  });
};

module.exports = { initSocket };
