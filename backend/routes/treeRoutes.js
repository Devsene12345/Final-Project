const router = require("express").Router();
const controller = require("../controllers/treeController");

router.post("/", controller.addTree);
router.get("/", controller.getTrees);
router.get("/dashboard", controller.getDashboard);

module.exports = router;
