import React from "react";

const EmptyChat = () => (
  <div className="empty-state" style={{ flex: 1 }}>
    <div className="icon">💬</div>
    <h3>Welcome to ChatApp</h3>
    <p>Select a conversation from the sidebar or start a new chat to begin messaging.</p>
  </div>
);

export default EmptyChat;
