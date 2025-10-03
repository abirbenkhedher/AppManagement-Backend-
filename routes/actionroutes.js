// routes/actionRoutes.js
const express = require("express");
const router = express.Router();
const actionController = require("../controllers/actionscontroller");
const Interface = require("../models/Interface");

router.get("/interfaces", async (req, res) => {
  try {
    const interfaces = await Interface.find({}, "name _id");
    res.json(interfaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", actionController.createAction);
router.get("/", actionController.getAllActions);
router.get("/:id", actionController.getActionById);
router.put("/:id", actionController.updateAction);
router.delete("/:id", actionController.deleteAction);

module.exports = router;
