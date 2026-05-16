const express = require("express");
const { getMessages } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/:roomId", getMessages);

module.exports = router;
