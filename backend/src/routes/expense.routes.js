const express = require("express");
const router = express.Router();
const { verifyToken, allowRoles } = require("../middleware/auth.middleware");
const { list, create, remove } = require("../controllers/expense.controller");

router.get("/", verifyToken, allowRoles("manager", "dispatcher"), list);
router.post("/", verifyToken, allowRoles("manager", "dispatcher"), create);
router.delete("/:id", verifyToken, allowRoles("manager", "dispatcher"), remove);

module.exports = router;
