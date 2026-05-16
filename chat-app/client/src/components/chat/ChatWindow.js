import React, { useRef, useEffect, useState, useCallback } from "react";
import useChat from "../../hooks/useChat";

const COLORS = ["#1565C0","#00897B","#7B1FA2","#C62828","#F57F17","#2E7D32","#0277BD","#AD1457"];
const avatarColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length] || COLORS[0];

const getRoomDisplayName = (room, currentUser) => {
  if (room.isGroup) return room.name;
  const other = room.members?.find((m) => m._id !== currentUser._id);
  return other?.username || "Chat";
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ room, currentUser, onNewMessage }) => {
  const { messages, loading, typingUsers, sendMessage, emitTyping, emitStopTyping } = useChat(room._id);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input);
    onNewMessage(room._id);
    setInput("");
    emitStopTyping();
  }, [input, sendMessage, emitStopTyping, onNewMessage, room._id]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(emitStopTyping, 2000);
  };

  const roomName = getRoomDisplayName(room, currentUser);
  const onlineCount = room.isGroup
    ? room.members?.filter((m) => m.isOnline).length
    : null;
  const dmUser = !room.isGroup && room.members?.find((m) => m._id !== currentUser._id);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="avatar" style={{ background: avatarColor(roomName), width: 38, height: 38, fontSize: 14 }}>
          {room.isGroup ? "👥" : roomName.charAt(0).toUpperCase()}
          {dmUser?.isOnline && <span className="online-dot" />}
        </div>
        <div>
          <div className="room-name">{roomName}</div>
          <div className="status">
            {room.isGroup
              ? `${room.members?.length} members${onlineCount ? `, ${onlineCount} online` : ""}`
              : dmUser?.isOnline ? "🟢 Online" : "⚫ Offline"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: 30 }}>
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
            const senderName = msg.sender?.username || "Unknown";
            return (
              <div key={msg._id} className={`message-row ${isOwn ? "own" : ""}`}>
                {!isOwn && (
                  <div className="avatar" style={{ background: avatarColor(senderName), width: 30, height: 30, fontSize: 12 }}>
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  {!isOwn && room.isGroup && <div className="sender-name">{senderName}</div>}
                  <div className={`message-bubble ${isOwn ? "own" : "other"}`}>{msg.content}</div>
                  <div className="message-meta">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div className="typing-indicator">
        {typingUsers.length > 0 && (
          <span>{typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...</span>
        )}
      </div>

      {/* Input area */}
      <div className="message-input-area">
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
