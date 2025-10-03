const express = require("express");
const router = express.Router();
const Module = require("../models/Module");
const ModuleController = require("../controllers/ModuleController");

router.get("/modules", async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    console.error("Erreur lors de la récupération des modules :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des modules" });
  }
});

router.post("/modules", ModuleController.createModule);
router.get("/modules-tree", ModuleController.getModuleTree);

// Supprimer un module par ID
router.delete("/modules/:id", async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
      return res.status(404).json({ message: "Module non trouvé" });
    }
    res.status(200).json({ message: "Module supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du module :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du module" });
  }
});

router.put("/modules/:id", ModuleController.updateModule);

module.exports = router;
