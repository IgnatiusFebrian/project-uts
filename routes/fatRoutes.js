// Import modul Express dan buat router
const express = require("express");
const router = express.Router();

// Import model data Body Fat dan data pengguna
const FatData = require("../models/FatData");
const UserData = require("../models/UserData");

// Route untuk menampilkan halaman kalkulator Body Fat
router.get("/", async (req, res) => {
    try {
        // Ambil semua data Body Fat milik user yang sedang login
        const records = await FatData.find({ userId: req.user?._id });
        res.render("pages/fat", { records, result: null, error: null, input: {} });
    } catch (err) {
        // Jika gagal mengambil data, tampilkan halaman dengan pesan error
        res.render("pages/fat", { records: [], result: null, error: "Gagal mengambil data Body Fat.", input: {} });
    }
});

// Route untuk menghitung dan menyimpan data Body Fat baru
router.post("/calculate-fat", async (req, res) => {
    const { waist, neck, height, hip } = req.body;
    const input = { waist, neck, height, hip };

    // Pastikan user sudah login
    if (!req.user) {
        return res.redirect('/auth/login');
    }

    // Validasi input dasar wajib diisi
    if (!waist || !neck || !height) {
        return res.render("pages/fat", { result: null, error: "Harap isi semua input dasar.", input });
    }

    // Ambil data user untuk mendapatkan gender dan tanggal lahir
    const userData = await UserData.findOne({ userId: req.user?._id });
    if (!userData || !userData.gender || !userData.birthDate) {
        return res.redirect('/auth/register?error=profile_incomplete');
    }

    const gender = userData.gender;

    // Konversi input ke angka
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(height);
    let hi = 0;

    // Jika perempuan, hip wajib diisi
    if (gender === "female") {
        if (!hip) {
            return res.render("pages/fat", {
                result: null,
                error: "Untuk perempuan, lingkar pinggul wajib diisi",
                input
            });
        }
        hi = parseFloat(hip);
    } 

    // Validasi nilai input harus lebih besar dari 0
    if (w <= 0 || n <= 0 || h <= 0 || (gender === "female" && hi <= 0)) {
        return res.render("pages/fat", { 
            result: null, 
            error: "Nilai input harus lebih besar dari 0", 
            input 
        });
    }

    const log10 = Math.log10;
    let bodyFat;

    try {
        // Hitung persentase lemak tubuh berdasarkan gender
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
        }

        bodyFat = parseFloat(bodyFat.toFixed(2));
        
        if (bodyFat < 0 || bodyFat > 100) {
            throw new Error("Hasil perhitungan tidak valid. Periksa kembali ukuran yang dimasukkan");
        }
    } catch (err) {
        // Jika terjadi error saat perhitungan, tampilkan pesan error
        return res.render("pages/fat", {
            result: null,
            error: err.message,
            input
        });
    }

    try {
        // Simpan data Body Fat baru ke database
        await FatData.create({
            userId: req.user?._id || "anonymous",
            height: parseFloat(height),
            bodyFat: bodyFat
        });

        // Ambil ulang data Body Fat untuk ditampilkan
        const records = await FatData.find({ userId: req.user?._id });
        res.render("pages/fat", {
            records,
            result: { bodyFat },
            error: null,
            input
        });
    } catch (err) {
        console.error("Gagal menyimpan body fat:", err);
        // Jika gagal simpan, tampilkan pesan error
        res.render("pages/fat", {
            result: null,
            error: "Gagal menyimpan data Body Fat.",
            input
        });
    }
});

// Route untuk mengupdate data Body Fat berdasarkan ID
router.post("/fat/edit/:id", async (req, res) => {
    const { waist, neck, height, hip } = req.body;
    try {
        // Cari data Body Fat berdasarkan ID
        const record = await FatData.findById(req.params.id);
        if (!record) {
            return res.redirect("/fat");
        }

        // Ambil data user untuk mendapatkan gender
        const userData = await UserData.findOne({ userId: record.userId });
        if (!userData || !userData.gender) {
            return res.redirect("/fat");
        }
        const gender = userData.gender;

        // Konversi input ke angka
        const w = parseFloat(waist);
        const n = parseFloat(neck);
        const h = parseFloat(height);
        let hi = 0;

        // Jika perempuan, hip wajib diisi
        if (gender === "female") {
            if (!hip) {
                return res.render("pages/fat_edit", {
                    record: req.body,
                    error: "Untuk perempuan, lingkar pinggul wajib diisi"
                });
            }
            hi = parseFloat(hip);
        }

        // Validasi nilai input harus lebih besar dari 0
        if (w <= 0 || n <= 0 || h <= 0 || (gender === "female" && hi <= 0)) {
            return res.render("pages/fat_edit", {
                record: req.body,
                error: "Nilai input harus lebih besar dari 0"
            });
        }

        const log10 = Math.log10;
        let bodyFat;

        try {
            // Hitung persentase lemak tubuh berdasarkan gender
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
            }

            bodyFat = parseFloat(bodyFat.toFixed(2));
            
            if (bodyFat < 0 || bodyFat > 100) {
                throw new Error("Hasil perhitungan tidak valid. Periksa kembali ukuran yang dimasukkan");
            }
        } catch (err) {
            // Jika terjadi error saat perhitungan, tampilkan pesan error
            return res.render("pages/fat_edit", {
                record: req.body,
                error: err.message
            });
        }

        // Simpan data Body Fat yang sudah diperbarui
        record.height = parseFloat(height);
        record.bodyFat = bodyFat;

        await record.save();

        res.redirect("/fat");
    } catch (err) {
        // Jika gagal update, tampilkan pesan error
        res.render("pages/fat_edit", { record: req.body, error: "Gagal memperbarui data Body Fat." });
    }
});

// Route untuk menghapus data Body Fat berdasarkan ID
router.post("/fat/delete/:id", async (req, res) => {
    try {
        await FatData.findByIdAndDelete(req.params.id);
        res.redirect("/fat");
    } catch (err) {
        res.redirect("/fat");
    }
});

// Export router untuk digunakan di app.js
module.exports = router;
 