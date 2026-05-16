import React, { useState } from "react";
import NewChatModal from "./NewChatModal";

const COLORS = ["#1565C0","#00897B","#7B1FA2","#C62828","#F57F17","#2E7D32","#0277BD","#AD1457"];
const avatarColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length] || COLORS[0];

const getRoomDisplayName = (room, currentUser) => {
  if (room.isGroup) return room.name;
  const other = room.members?.find((m) => m._id !== currentUser._id);
  return other?.username || "Unknown";
};

const getRoomInitial = (room, currentUser) => {
  const name = getRoomDisplayName(room, currentUser);
  return name?.charAt(0).toUpperCase() || "?";
};

const isOtherOnline = (room, currentUser, onlineUsers) => {
  if (room.isGroup) return false;
  const other = room.members?.find((m) => m._id !== currentUser._id);
  return other?.isOnline || (onlineUsers && onlineUsers.has(other?._id));
};

const Sidebar = ({ rooms, selectedRoom, onSelectRoom, onRoomCreated, currentUser, loading, onLogout }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = rooms.filter((r) => {
    const name = getRoomDisplayName(r, currentUser).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>💬 ChatApp</h2>
        <div className="user-menu">
          <span style={{ fontSize: 13 }}>{currentUser.username}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="search-box" style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn btn-primary btn-sm"
          style={{ borderRadius: 8, whiteSpace: "nowrap", width: "auto", marginTop: 0 }}
          onClick={() => setShowModal(true)}
        >
          + New
        </button>
      </div>

      <div className="room-list">
        {loading ? (
          <div style={{ padding: 20, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            {search ? "No chats found" : "No chats yet. Start a new chat!"}
          </div>
        ) : (
          filtered.map((room) => {
            const name = getRoomDisplayName(room, currentUser);
            const lastMsg = room.lastMessage?.content || "Say hello! 👋";
            const isActive = selectedRoom?._id === room._id;
            return (
              <div
                key={room._id}
                className={`room-item ${isActive ? "active" : ""}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="avatar" style={{ background: avatarColor(name) }}>
                  {room.isGroup ? "👥" : getRoomInitial(room, currentUser)}
                  {isOtherOnline(room, currentUser) && <span className="online-dot" />}
                </div>
                <div className="room-info">
                  <div className="room-name">{name}</div>
                  <div className="room-preview">{lastMsg}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <NewChatModal
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onRoomCreated={(room) => { onRoomCreated(room); setShowModal(false); }}
        />
      )}
    </div>
  );
};

export default Sidebar;
