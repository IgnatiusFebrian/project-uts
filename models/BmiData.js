const mongoose = require("mongoose");

const bmiDataSchema = new mongoose.Schema({
    userId: String,
    weight: Number,
    height: Number,
    bmi: Number
}, { timestamps: true });

module.exports = mongoose.model("BmiData", bmiDataSchema);
