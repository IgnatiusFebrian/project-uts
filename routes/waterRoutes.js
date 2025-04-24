const express = require("express");
const router = express.Router();
const WaterData = require("../models/WaterData");
const UserData = require("../models/UserData");

// get water
router.get("/", async (req, res) => {
    try {
        const records = await WaterData.find({ userId: req.user?._id });
        res.render("pages/water", { records, result: null, error: null, input: {} });
    } catch (err) {
        res.render("pages/water", { records: [], result: null, error: "Gagal mengambil data kebutuhan air.", input: {} });
    }
});

// buat data baru
router.post("/calculate-water", async (req, res) => {
    const { weight, activity } = req.body;
    const input = { weight, activity };

    if (!weight || isNaN(weight)) {
        return res.render("pages/water", {
            result: null,
            error: "Harap masukkan berat badan yang valid.",
            input
        });
    }

    const w = parseFloat(weight);
    let baseWater = w * 35;

    const activityFactor = {
        sedentary: 1.0,
        light: 1.2,
        moderate: 1.4,
        active: 1.6,
        heavy: 1.8
    }[activity] || 1.0;
    
    const water = parseFloat(((baseWater * activityFactor) / 1000).toFixed(2));

    try {
        await WaterData.create({
            userId: req.user?._id || "anonymous",
            weight: w,
            waterIntake: water
        });

        const records = await WaterData.find({ userId: req.session.user?.id });
        res.render("pages/water", {
            records,
            result: { waterIntake: water },
            error: null,
            input
        });
    } catch (err) {
        console.error("Gagal menyimpan data water:", err);
        res.render("pages/water", {
            result: null,
            error: "Gagal menyimpan data kebutuhan air.",
            input
        });
    }
});

// Update data water intake
router.get("/edit/:id", async (req, res) => {
    try {
        const record = await WaterData.findById(req.params.id);
        if (!record) {
            return res.redirect("/water");
        }
        res.render("pages/water_edit", { record, error: null });
    } catch (err) {
        res.redirect("/water");
    }
});

router.post("/edit/:id", async (req, res) => {
    const { weight, activity } = req.body;
    try {
        const record = await WaterData.findById(req.params.id);
        if (!record) {
            return res.redirect("/water");
        }

        const w = parseFloat(weight);
        let baseWater = w * 35;

        const activityFactor = {
            sedentary: 1.0,
            light: 1.2,
            moderate: 1.4,
            active: 1.6,
            heavy: 1.8
        }[activity] || 1.0;
        
        const water = parseFloat(((baseWater * activityFactor) / 1000).toFixed(2));

        record.weight = w;
        record.waterIntake = water;
        record.activity = activity;

        await record.save();

        res.redirect("/progress");
    } catch (err) {
        res.render("pages/water_edit", { record: req.body, error: "Gagal memperbarui data kebutuhan air." });
    }
});

// Delete water intake data
router.post("/delete/:id", async (req, res) => {
    try {
        await WaterData.findByIdAndDelete(req.params.id);
        res.redirect("/water");
    } catch (err) {
        res.redirect("/water");
    }
});

module.exports = router;
