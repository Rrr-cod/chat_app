import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Sidebar from "../components/chat/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import EmptyChat from "../components/chat/EmptyChat";

const ChatPage = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/rooms");
      setRooms(data.rooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomCreated = (room) => {
    setRooms((prev) => {
      const exists = prev.find((r) => r._id === room._id);
      if (exists) return prev;
      return [room, ...prev];
    });
    setSelectedRoom(room);
  };

  const handleNewMessage = (roomId) => {
    setRooms((prev) =>
      prev.map((r) => r._id === roomId ? { ...r, updatedAt: new Date().toISOString() } : r)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  return (
    <div className="chat-layout">
      <Sidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        onRoomCreated={handleRoomCreated}
        currentUser={user}
        loading={loadingRooms}
        onLogout={logout}
      />
      {selectedRoom ? (
        <ChatWindow
          room={selectedRoom}
          currentUser={user}
          onNewMessage={handleNewMessage}
        />
      ) : (
        <EmptyChat />
      )}
    </div>
  );
};

export default ChatPage;
