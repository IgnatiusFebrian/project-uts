const mongoose = require("mongoose");

const whrDataSchema = new mongoose.Schema({
    userId: String,
    whr: Number,
    whrStatus: String
}, { timestamps: true });

module.exports = mongoose.model("WhrData", whrDataSchema);
