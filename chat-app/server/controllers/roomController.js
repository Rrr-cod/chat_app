const Room = require("../models/Room");
const Message = require("../models/Message");
const User = require("../models/User");

// @route GET /api/rooms — Get all rooms for the logged-in user
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate("members", "username avatar isOnline lastSeen")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "username" } })
      .sort({ updatedAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/rooms — Create a room or get existing DM
exports.createRoom = async (req, res) => {
  const { memberId, isGroup, name, memberIds } = req.body;
  try {
    if (!isGroup) {
      // Direct message — check if DM room already exists
      const existing = await Room.findOne({
        isGroup: false,
        members: { $all: [req.user._id, memberId], $size: 2 },
      })
        .populate("members", "username avatar isOnline lastSeen")
        .populate({ path: "lastMessage", populate: { path: "sender", select: "username" } });

      if (existing) return res.json({ success: true, room: existing });

      const room = await Room.create({
        isGroup: false,
        members: [req.user._id, memberId],
      });
      const populated = await room.populate("members", "username avatar isOnline lastSeen");
      return res.status(201).json({ success: true, room: populated });
    }

    // Group room
    if (!name) return res.status(400).json({ success: false, message: "Group name is required" });
    const allMembers = [...new Set([...memberIds, req.user._id.toString()])];
    const room = await Room.create({ isGroup: true, name, members: allMembers, admin: req.user._id });
    const populated = await room.populate("members", "username avatar isOnline lastSeen");
    res.status(201).json({ success: true, room: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/rooms/:id — Get single room
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("members", "username avatar isOnline lastSeen")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "username" } });

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!room.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not a member of this room" });
    }
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
