const User = require("../models/User");

// @route GET /api/users — Search users to start a chat
exports.getUsers = async (req, res) => {
  const { search } = req.query;
  try {
    const query = search
      ? { username: { $regex: search, $options: "i" }, _id: { $ne: req.user._id } }
      : { _id: { $ne: req.user._id } };

    const users = await User.find(query)
      .select("username email avatar isOnline lastSeen")
      .limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/users/:id — Get user profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username email avatar isOnline lastSeen");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
