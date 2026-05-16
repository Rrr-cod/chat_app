import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const useChat = (roomId) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeouts = useRef({});

  // Fetch message history
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    api.get(`/messages/${roomId}`)
      .then(({ data }) => setMessages(data.messages))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  // Join/leave socket room and listen for events
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join_room", roomId);

    const onReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onTypingStart = ({ userId, username }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username]);
      // Clear after 3s automatically
      clearTimeout(typingTimeouts.current[userId]);
      typingTimeouts.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      }, 3000);
    };

    const onTypingStop = ({ userId, username }) => {
      clearTimeout(typingTimeouts.current[userId]);
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    };

    socket.on("receive_message", onReceive);
    socket.on("user_typing", onTypingStart);
    socket.on("user_stop_typing", onTypingStop);

    return () => {
      socket.emit("leave_room", roomId);
      socket.off("receive_message", onReceive);
      socket.off("user_typing", onTypingStart);
      socket.off("user_stop_typing", onTypingStop);
    };
  }, [socket, roomId, user._id]);

  const sendMessage = useCallback((content) => {
    if (!socket || !content.trim()) return;
    socket.emit("send_message", { roomId, content });
  }, [socket, roomId]);

  const emitTyping = useCallback(() => {
    if (socket) socket.emit("typing_start", { roomId });
  }, [socket, roomId]);

  const emitStopTyping = useCallback(() => {
    if (socket) socket.emit("typing_stop", { roomId });
  }, [socket, roomId]);

  return { messages, loading, typingUsers, sendMessage, emitTyping, emitStopTyping };
};

export default useChat;
