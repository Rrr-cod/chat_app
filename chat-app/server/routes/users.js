const express = require("express");
const { getUsers, getUser } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getUsers);
router.get("/:id", getUser);

module.exports = router;
