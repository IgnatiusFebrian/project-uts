const express = require("express");
const router = express.Router();

const CaloriesData = require("../models/CaloriesData");
const UserData = require("../models/UserData");

// Panggil halaman kalkulator kalori
router.get("/", async (req, res) => {
    try {
        const records = await CaloriesData.find({ userId: req.user?._id });
        let editRecord = null;
        if (req.query.editId) {
            editRecord = await CaloriesData.findById(req.query.editId);
        }
        res.render("pages/calories", { records, result: null, error: null, input: {}, editRecord });
    } catch (err) {
        res.render("pages/calories", { records: [], result: null, error: "Gagal mengambil data kalori.", input: {}, editRecord: null });
    }
});

router.post("/calculate-calories", async (req, res) => {
    console.log("POST /calculate-calories route hit");
    const { weight, height, activity } = req.body;
    const input = { weight, height, activity };

    if (!weight || !height || !activity) {
        return res.render("pages/calories", { result: null, error: "Harap isi semua input.", input, editRecord: null });
    }

    const userData = await UserData.findOne({ userId: req.user?._id });
    if (!userData || !userData.gender || !userData.birthDate) {
        return res.render("pages/calories", { 
            result: null,
            error: "Data pengguna tidak ditemukan. Silakan lengkapi profil terlebih dahulu.",
            input,
            editRecord: null
        });
    }

    const w = parseFloat(weight);
    const h = parseFloat(height);

    const birthDate = new Date(userData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    let bmr;
    if (userData.gender === "male") {
        bmr = 10 * w + 6.25 * h - 5 * age + 5;
    } else {
        bmr = 10 * w + 6.25 * h - 5 * age - 161;
    }

    let activityFactor = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    }[activity];

    const tdee = parseFloat((bmr * activityFactor).toFixed(2));

    try {
        const newRecord = await CaloriesData.create({
            userId: req.user?._id || "anonymous",
            weight: w,
            height: h,
            bmr: parseFloat(bmr.toFixed(2)),
            tdee,
            activityLevel: activity
        });

        res.render("pages/calories", {
            records: await CaloriesData.find({ userId: req.user?._id }),
            result: { bmr: parseFloat(bmr.toFixed(2)), tdee },
            error: null,
            input,
            editRecord: null
        });
    } catch (err) {
        console.error("Gagal menyimpan kalori:", err);
        res.render("pages/calories", {
            records: await CaloriesData.find({ userId: req.user?._id }),
            result: null,
            error: "Gagal menyimpan data kalori.",
            input,
            editRecord: null
        });
    }
});
// Update calorie record
router.post("/calories/edit/:id", async (req, res) => {
    const { weight, height, activity } = req.body;
    try {
        const record = await CaloriesData.findById(req.params.id);
        if (!record) {
            return res.redirect("/calories");
        }
        record.weight = parseFloat(weight);
        record.height = parseFloat(height);
        record.activityLevel = activity;

        const userData = await UserData.findOne({ userId: record.userId });
        const birthDate = new Date(userData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        let bmr;
        if (userData.gender === "male") {
            bmr = 10 * record.weight + 6.25 * record.height - 5 * age + 5;
        } else {
            bmr = 10 * record.weight + 6.25 * record.height - 5 * age - 161;
        }

        let activityFactor = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        }[record.activityLevel];

        record.bmr = parseFloat(bmr.toFixed(2));
        record.tdee = parseFloat((bmr * activityFactor).toFixed(2));

        await record.save();

        res.redirect("/calories");
    } catch (err) {
        res.redirect(`/calories?editId=${req.params.id}&error=Gagal memperbarui data kalori.`);
    }
});

// Delete calorie record
router.post("/calories/delete/:id", async (req, res) => {
    try {
        await CaloriesData.findByIdAndDelete(req.params.id);
        res.redirect("/calories");
    } catch (err) {
        res.redirect("/calories");
    }
});

module.exports = router;
