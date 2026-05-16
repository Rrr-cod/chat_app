const Message = require("../models/Message");
const Room = require("../models/Room");

// @route GET /api/messages/:roomId — Get paginated messages for a room
exports.getMessages = async (req, res) => {
  const { page = 1, limit = 40 } = req.query;
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!room.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not a member of this room" });
    }

    const messages = await Message.find({ room: req.params.roomId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ room: req.params.roomId });

    // Mark messages as read
    await Message.updateMany(
      { room: req.params.roomId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({
      success: true,
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
