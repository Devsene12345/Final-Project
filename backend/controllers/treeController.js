const Tree = require("../models/Tree");

// Add Tree
exports.addTree = async (req, res) => {
  try {
    const tree = await Tree.create(req.body);
    res.status(201).json(tree);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get All Trees
exports.getTrees = async (req, res) => {
  const trees = await Tree.find();
  res.json(trees);
};

// Dashboard Data
exports.getDashboard = async (req, res) => {
  const totalTrees = await Tree.countDocuments();
  const healthy = await Tree.countDocuments({ healthStatus: "Healthy" });
  const moderate = await Tree.countDocuments({ healthStatus: "Moderate" });
  const critical = await Tree.countDocuments({ healthStatus: "Critical" });
  const riskTrees = await Tree.countDocuments({ riskLevel: "High" });

  res.json({
    totalTrees,
    healthy,
    moderate,
    critical,
    riskTrees,
  });
};
