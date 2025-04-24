const express = require("express");
const router = express.Router();
const BmiData = require("../models/BmiData");
const UserData = require("../models/UserData");

// buka BMI calculator page
router.get("/", (req, res) => {
    res.render("pages/bmi", { result: null, error: null, input: {} });
});

// buat BMI record baru
router.post("/calculate-bmi", async (req, res) => {
    const { weight, height } = req.body;
    const input = { weight, height };

    if (!weight || !height) {
        return res.render("pages/bmi", { result: null, error: "Harap isi semua input.", input });
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
    let category = "";

    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 24.9) category = "Normal weight";
    else if (bmi < 29.9) category = "Overweight";
    else category = "Obese";

    const newData = new UserData({
        userId: req.user?._id || "anonymous",
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: parseFloat(bmi)
    });

    const newBmiData = new BmiData({
        userId: req.user?._id || "anonymous",
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: parseFloat(bmi)
    });

    try {
        await newData.save();
        await newBmiData.save();
        const records = await UserData.find({ userId: req.user?._id, bmi: { $exists: true } });
        res.render("pages/bmi", {
            records,
            result: { bmi, category },
            error: null,
            input
        });
    } catch (err) {
        console.error("Gagal menyimpan data ke MongoDB:", err);
        return res.render("pages/bmi", {
            result: null,
            error: "Gagal menyimpan data BMI.",
            input
        });
    }
});

// Update BMI data dari edit
router.get("/edit/:id", async (req, res) => {
    try {
        const record = await UserData.findById(req.params.id);
        if (!record) {
            return res.redirect("/");
        }
        res.render("pages/bmi_edit", { record, error: null });
    } catch (err) {
        res.redirect("/");
    }
});

// Update BMI data
router.post("/edit/:id", async (req, res) => {
    const { weight, height } = req.body;
    try {
        const record = await UserData.findById(req.params.id);
        if (!record) {
            return res.redirect("/");
        }
        record.weight = parseFloat(weight);
        record.height = parseFloat(height);
        record.bmi = (weight / ((height / 100) ** 2)).toFixed(2);

        await record.save();

        res.redirect("/");
    } catch (err) {
        res.render("pages/bmi_edit", { record: req.body, error: "Gagal memperbarui data BMI." });
    }
});

// Delete BMI data
router.post("/delete/:id", async (req, res) => {
    try {
        await UserData.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (err) {
        res.redirect("/");
    }
});

module.exports = router;
