const mongoose = require("mongoose");

const waterDataSchema = new mongoose.Schema({
    userId: String,
    weight: Number,
    waterIntake: Number,
    activity: String
}, { timestamps: true });

module.exports = mongoose.model("WaterData", waterDataSchema);
