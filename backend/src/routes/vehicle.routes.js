const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { list, create, updateStatus } = require("../controllers/vehicle.controller");

router.get("/", verifyToken, list);
router.post("/", verifyToken, create);
router.patch("/:id/status", verifyToken, updateStatus);

module.exports = router;
