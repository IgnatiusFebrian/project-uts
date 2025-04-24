const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
    userId: String,
    gender: String,
    birthDate: Date,
    weight: Number,
    height: Number,
    bmi: Number,
    bodyFat: Number,
    bmr: Number,
    tdee: Number,
    activityLevel: String,
    waterIntake: Number,
    whr: Number,
    whrStatus: String
}, { timestamps: true });

module.exports = mongoose.model("UserData", userDataSchema);
