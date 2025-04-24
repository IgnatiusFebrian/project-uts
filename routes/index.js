// Import modul Express dan buat router
const express = require("express");
const router = express.Router();

// Import model data kesehatan
const BmiData = require("../models/BmiData");
const FatData = require("../models/FatData");
const WaterData = require("../models/WaterData");
const CaloriesData = require("../models/CaloriesData");
const WhrData = require("../models/WhrData");

// Import route khusus untuk tiap metrik kesehatan
const bmiRoutes = require("./bmiRoutes");
const fatRoutes = require("./fatRoutes");
const waterRoutes = require("./waterRoutes");
const caloriesRoutes = require("./caloriesRoutes");
const whrRoutes = require("./whrRoutes");

// Route root, cek autentikasi dan tampilkan halaman home atau redirect ke login
router.get("/", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.render("home");
    } else {
        return res.redirect("/auth/login");
    }
});

// Route halaman kontak
router.get("/contact", (req, res) => {
    res.render("pages/contact");
});

// Gunakan route khusus untuk tiap metrik kesehatan
router.use("/bmi", bmiRoutes);
router.use("/fat", fatRoutes);
router.use("/water", waterRoutes);
router.use("/calories", caloriesRoutes);
router.use("/whr", whrRoutes);

// Middleware untuk memastikan user sudah login sebelum mengakses route tertentu
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

// Route untuk menampilkan halaman progress dengan data metrik kesehatan pengguna
router.get("/progress", ensureAuthenticated, async (req, res) => {
    try {
        console.log("User object in /progress route:", req.user);
        const userId = req.user?._id;
        if (!userId) {
            console.log("User ID not found, redirecting to login");
            return res.redirect("/auth/login");
        }

        // Ambil parameter query untuk filter waktu (range, start, end)
        const { range = "", start = "", end = "" } = req.query;
        console.log("Query params - range:", range, "start:", start, "end:", end);

        // Ambil data metrik kesehatan dari database berdasarkan userId, urutkan berdasarkan tanggal
        const bmi = await BmiData.find({ userId }).sort({ createdAt: 1 });
        const fat = await FatData.find({ userId }).sort({ createdAt: 1 });
        const water = await WaterData.find({ userId }).sort({ createdAt: 1 });
        const calories = await CaloriesData.find({ userId }).sort({ createdAt: 1 });
        const whr = await WhrData.find({ userId }).sort({ createdAt: 1 });

        // Susun data progress untuk dikirim ke view
        const progress = {
            bmi: bmi.map(item => ({ _id: item._id, time: item.createdAt.toISOString(), value: item.bmi })),
            fat: fat.map(item => ({ _id: item._id, time: item.createdAt.toISOString(), value: item.bodyFat })),
            water: water.map(item => ({ _id: item._id, time: item.createdAt.toISOString(), value: item.waterIntake })),
            calories: calories.map(item => ({ _id: item._id, time: item.createdAt.toISOString(), value: item.tdee })),
            whr: whr.map(item => ({ _id: item._id, time: item.createdAt.toISOString(), value: item.whr }))
        };

        // Render halaman progress dengan data yang sudah disiapkan
        res.render("pages/progress", { progress, range, start, end });
    } catch (err) {
        console.error("Error loading progress data:", err);
        // Jika error, render halaman progress dengan data kosong
        res.render("pages/progress", { progress: { bmi: [], fat: [], water: [], calories: [], whr: [] }, range: "", start: "", end: "" });
    }
});

// Route untuk menghapus data progress berdasarkan ID
router.post("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Coba hapus data dari masing-masing koleksi metrik kesehatan
        const deletedBmi = await BmiData.findByIdAndDelete(id);
        if (deletedBmi) return res.redirect("/progress");

        const deletedFat = await FatData.findByIdAndDelete(id);
        if (deletedFat) return res.redirect("/progress");

        const deletedWater = await WaterData.findByIdAndDelete(id);
        if (deletedWater) return res.redirect("/progress");

        const deletedCalories = await CaloriesData.findByIdAndDelete(id);
        if (deletedCalories) return res.redirect("/progress");

        const deletedWhr = await WhrData.findByIdAndDelete(id);
        if (deletedWhr) return res.redirect("/progress");

        // Jika tidak ditemukan di koleksi manapun, tetap redirect ke halaman progress
        res.redirect("/progress");
    } catch (err) {
        console.error("Error deleting progress data:", err);
        res.redirect("/progress");
    }
});

// Route untuk menampilkan halaman edit data progress berdasarkan ID
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Cari data di koleksi BMI
        let data = await BmiData.findById(id);
        if (data) {
            return res.render("pages/edit", { data: { _id: data._id, value: data.bmi, weight: data.weight, height: data.height }, type: "bmi" });
        }

        // Cari data di koleksi Lemak Tubuh
        data = await FatData.findById(id);
        if (data) {
            return res.render("pages/edit", { data: { _id: data._id, waist: data.waist, neck: data.neck, height: data.height, hip: data.hip, bodyFat: data.bodyFat, gender: data.gender }, type: "fat" });
        }

        // Cari data di koleksi Asupan Air
        data = await WaterData.findById(id);
        if (data) {
            return res.render("pages/edit", { data: { _id: data._id, weight: data.weight, waterIntake: data.waterIntake }, type: "water" });
        }

        // Cari data di koleksi Kalori
        data = await CaloriesData.findById(id);
        if (data) {
            return res.render("pages/edit", { data: { _id: data._id, value: data.tdee, weight: data.weight, height: data.height, activityLevel: data.activityLevel }, type: "calories" });
        }

        // Cari data di koleksi WHR
        data = await WhrData.findById(id);
        if (data) {
            return res.render("pages/edit", { data: { _id: data._id, value: data.whr, whrStatus: data.whrStatus }, type: "whr" });
        }

        // Jika data tidak ditemukan, redirect ke halaman progress
        res.redirect("/progress");
    } catch (err) {
        console.error("Error loading edit data:", err);
        res.redirect("/progress");
    }
});

// Route untuk memproses update data progress berdasarkan ID
router.post("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Update data di koleksi BMI jika ditemukan
        let data = await BmiData.findById(id);
        if (data) {
            const { weight, height } = req.body;
            data.weight = parseFloat(weight);
            data.height = parseFloat(height);
            const heightM = data.height / 100;
            data.bmi = heightM > 0 ? data.weight / (heightM * heightM) : 0;
            await data.save();
            return res.redirect("/progress");
        }

        // Update data di koleksi Lemak Tubuh jika ditemukan
        data = await FatData.findById(id);
        if (data) {
            const { waist, neck, height, hip } = req.body;
            const log10 = Math.log10;
            let bodyFat;

            // Ambil data user untuk mendapatkan jenis kelamin
            const User = require("../models/User");
            const user = await User.findById(data.userId);
            const gender = user ? user.gender : null;

            // Validasi input wajib
            if (!waist || !neck || !height || (gender === "female" && !hip)) {
                return res.render("pages/edit", { data: { _id: data._id, waist, neck, height, hip, bodyFat: data.bodyFat, gender }, type: "fat", error: "Semua field wajib diisi" });
            }

            const w = parseFloat(waist);
            const n = parseFloat(neck);
            const h = parseFloat(height);
            const hi = gender === "female" ? parseFloat(hip) : 0;

            try {
                if (gender === "male") {
                    if (w <= n) {
                        throw new Error("Lingkar pinggang harus lebih besar dari lingkar leher");
                    }
                    bodyFat = 495 / (1.0324 - 0.19077 * log10(w - n) + 0.15456 * log10(h)) - 450;
                } else if (gender === "female") {
                    if ((w + hi) <= n) {
                        throw new Error("Lingkar pinggang + pinggul harus lebih besar dari lingkar leher");
                    }
                    const waistHipNeck = w + hi - n;
                    if (waistHipNeck <= 0) {
                        throw new Error("(Pinggang + Pinggul) harus lebih besar dari lingkar leher");
                    }
                    if (h <= 0) {
                        throw new Error("Tinggi badan harus lebih besar dari 0");
                    }
                    const logSum = Math.log10(waistHipNeck);
                    const logHeight = Math.log10(h);
                    const denominator = 1.29579 - 0.35004 * logSum + 0.22100 * logHeight;
                    bodyFat = 495 / denominator - 450;
                    if (bodyFat < 8 || bodyFat > 50) {
                        throw new Error(`Hasil perhitungan (${bodyFat.toFixed(1)}%) di luar range normal (8-50%). Periksa pengukuran Anda`);
                    }
                } else {
                    throw new Error("Nilai gender tidak valid");
                }
                bodyFat = parseFloat(bodyFat.toFixed(2));
                if (bodyFat < 0 || bodyFat > 100) {
                    throw new Error("Hasil perhitungan tidak valid. Periksa kembali ukuran yang dimasukkan");
                }
            } catch (err) {
                return res.render("pages/edit", { data: { _id: data._id, waist, neck, height, hip, bodyFat: data.bodyFat, gender }, type: "fat", error: err.message });
            }

            // Simpan data yang sudah dihitung
            data.waist = w;
            data.neck = n;
            data.height = h;
            data.gender = gender;
            if (gender === "female") {
                data.hip = hi;
            }
            data.bodyFat = bodyFat;

            await data.save();
            return res.redirect("/progress");
        }

        // Update data di koleksi Asupan Air jika ditemukan
        data = await WaterData.findById(id);
        if (data) {
            const { weight, waterIntake } = req.body;
            data.weight = parseFloat(weight);
            data.waterIntake = parseFloat(waterIntake) * 1000; // konversi liter ke mililiter
            await data.save();
            return res.redirect("/progress");
        }

        // Update data di koleksi Kalori jika ditemukan
        data = await CaloriesData.findById(id);
        if (data) {
            const { weight, height, activityLevel } = req.body;
            data.weight = parseFloat(weight);
            data.height = parseFloat(height);
            data.activityLevel = activityLevel;

            // Ambil data user untuk perhitungan umur dan gender
            const User = require("../models/User");
            const user = await User.findById(data.userId);
            let age = 0;
            if (user && user.birthDate) {
                const birthDate = new Date(user.birthDate);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }
            const gender = user ? user.gender : "male";

            // Hitung BMR menggunakan rumus Mifflin-St Jeor
            if (gender === "female") {
                data.bmr = 10 * data.weight + 6.25 * data.height - 5 * age - 161;
            } else {
                data.bmr = 10 * data.weight + 6.25 * data.height - 5 * age + 5;
            }

            // Hitung TDEE berdasarkan level aktivitas
            const activityMultipliers = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                "very active": 1.9,
            };
            const multiplier = activityMultipliers[activityLevel] || 1.2;
            data.tdee = data.bmr * multiplier;

            await data.save();
            return res.redirect("/progress");
        }

        // Update data di koleksi WHR jika ditemukan
        data = await WhrData.findById(id);
        if (data) {
            const { waist, hip } = req.body;
            if (!waist || !hip) {
                return res.render("pages/edit", {
                    data: req.body,
                    type: "whr",
                    error: "Lingkar pinggang dan pinggul harus diisi",
                });
            }
            const waistNum = parseFloat(waist);
            const hipNum = parseFloat(hip);
            if (isNaN(waistNum) || isNaN(hipNum)) {
                return res.render("pages/edit", {
                    data: req.body,
                    type: "whr",
                    error: "Ukuran pinggang dan pinggul harus berupa angka",
                });
            }
            const whr = waistNum / hipNum;
            let whrStatus = "";
            if (whr < 0.85) {
                whrStatus = "Risiko Rendah";
            } else if (whr >= 0.85 && whr < 0.9) {
                whrStatus = "Risiko Sedang";
            } else {
                whrStatus = "Risiko Tinggi";
            }
            data.waist = waistNum;
            data.hip = hipNum;
            data.whr = whr;
            data.whrStatus = whrStatus;
            await data.save();
            return res.redirect("/progress");
        }

        // Jika data tidak ditemukan, redirect ke halaman progress
        res.redirect("/progress");
    } catch (err) {
        console.error("Error updating edit data:", err);
        res.redirect("/progress");
    }
});

// Export router untuk digunakan di app.js
module.exports = router;
