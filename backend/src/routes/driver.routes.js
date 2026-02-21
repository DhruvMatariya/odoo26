const express = require("express");
const router = express.Router();
const { verifyToken, allowRoles } = require("../middleware/auth.middleware");
const { list, create, updateStatus } = require("../controllers/driver.controller");

router.get("/", verifyToken, allowRoles("manager", "dispatcher"), list);
router.post("/", verifyToken, allowRoles("manager", "dispatcher"), create);
router.patch("/:id/status", verifyToken, allowRoles("manager", "dispatcher"), updateStatus);

module.exports = router;
