const express = require("express");
const { getRooms, createRoom, getRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getRooms);
router.post("/", createRoom);
router.get("/:id", getRoom);

module.exports = router;
