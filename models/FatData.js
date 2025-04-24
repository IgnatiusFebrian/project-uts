const mongoose = require("mongoose");

const fatDataSchema = new mongoose.Schema({
    userId: String,
    waist: Number,
    neck: Number,
    height: Number,
    hip: Number,
    gender: String,
    bodyFat: Number
}, { timestamps: true });

module.exports = mongoose.model("FatData", fatDataSchema);
