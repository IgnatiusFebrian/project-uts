const mongoose = require("mongoose");

const caloriesDataSchema = new mongoose.Schema({
    userId: String,
    weight: Number,
    height: Number,
    bmr: Number,
    tdee: Number,
    activityLevel: String
}, { timestamps: true });

module.exports = mongoose.model("CaloriesData", caloriesDataSchema);
