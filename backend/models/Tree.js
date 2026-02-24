const mongoose = require("mongoose");

const TreeSchema = new mongoose.Schema(
  {
    treeName: String,
    latitude: Number,
    longitude: Number,
    height: Number,
    healthStatus: {
      type: String,
      enum: ["Healthy", "Moderate", "Critical"],
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    plantedDate: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tree", TreeSchema);
