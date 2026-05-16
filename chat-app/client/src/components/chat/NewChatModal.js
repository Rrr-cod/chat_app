import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const COLORS = ["#1565C0","#00897B","#7B1FA2","#C62828","#F57F17","#2E7D32","#0277BD","#AD1457"];
const avatarColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length] || COLORS[0];

const NewChatModal = ({ currentUser, onClose, onRoomCreated }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState("dm"); // "dm" | "group"
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/users${search ? `?search=${search}` : ""}`)
      .then(({ data }) => setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const startDM = async (userId) => {
    setCreating(true);
    try {
      const { data } = await api.post("/rooms", { memberId: userId, isGroup: false });
      onRoomCreated(data.room);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedIds.length < 1) return;
    setCreating(true);
    try {
      const { data } = await api.post("/rooms", { isGroup: true, name: groupName, memberIds: selectedIds });
      onRoomCreated(data.room);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Conversation</h3>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            className={`btn btn-sm ${tab === "dm" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("dm")}
            style={{ width: "auto", marginTop: 0 }}
          >
            Direct Message
          </button>
          <button
            className={`btn btn-sm ${tab === "group" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("group")}
            style={{ width: "auto", marginTop: 0 }}
          >
            Group Chat
          </button>
        </div>

        {tab === "group" && (
          <div className="form-group" style={{ marginBottom: 12 }}>
            <input
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        <input
          className="form-group input"
          style={{ width: "100%", padding: "9px 14px", background: "#f0f2f5", border: "none", borderRadius: 20, fontSize: 13, outline: "none", fontFamily: "inherit" }}
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="user-list">
          {loading ? (
            <div style={{ padding: 16, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          ) : users.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No users found</div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="user-item"
                style={tab === "group" && selectedIds.includes(u._id) ? { background: "#e8f0fe" } : {}}
                onClick={() => tab === "dm" ? startDM(u._id) : toggleSelect(u._id)}
              >
                <div className="avatar" style={{ background: avatarColor(u.username), width: 36, height: 36, fontSize: 14 }}>
                  {u.username.charAt(0).toUpperCase()}
                  {u.isOnline && <span className="online-dot" />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
                </div>
                {tab === "group" && selectedIds.includes(u._id) && (
                  <span style={{ marginLeft: "auto", color: "#1565C0", fontWeight: 700 }}>✓</span>
                )}
              </div>
            ))
          )}
        </div>

        {tab === "group" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: "auto", marginTop: 0 }}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: "auto", marginTop: 0 }}
              onClick={createGroup}
              disabled={!groupName.trim() || selectedIds.length < 1 || creating}
            >
              {creating ? "Creating..." : `Create Group (${selectedIds.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;
