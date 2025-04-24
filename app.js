// Import modul yang dibutuhkan
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { jwtMiddleware } = require("./utils/jwt");

// Model User untuk autentikasi
const User = require("./models/User");

// Inisialisasi aplikasi Express
const app = express();

// Middleware untuk parsing body request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine EJS dan folder views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Folder untuk file statis (CSS, JS, gambar)
app.use(express.static("public"));

// Konfigurasi session untuk menyimpan data sesi pengguna
app.use(session({
    secret: "some_secret_key", // Rahasia untuk session
    resave: false,
    saveUninitialized: false
}));

// Middleware untuk flash messages (pesan sementara)
app.use(flash());

// Inisialisasi Passport untuk autentikasi
app.use(passport.initialize());
app.use(passport.session());

// Konfigurasi strategi lokal Passport untuk login menggunakan username dan password
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            // Cari user berdasarkan username
            const user = await User.findOne({ username });
            if (!user) return done(null, false, { message: 'User tidak ditemukan' });

            // Bandingkan password yang diinput dengan password yang tersimpan (hash)
            const match = await bcrypt.compare(password, user.password);
            if (!match) return done(null, false, { message: 'Password salah' });

            // Jika cocok, lanjutkan dengan user
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialisasi user ke session (menyimpan user ID)
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialisasi user dari session (mengambil data user dari ID)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        console.log("Deserialized User:", user);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Middleware untuk mengatur variabel lokal yang bisa diakses di view
app.use((req, res, next) => {
    res.locals.user = req.user; // Data user yang sedang login
    res.locals.error = req.flash('error'); // Pesan error
    res.locals.success = req.flash('success'); // Pesan sukses
    next();
});

// Import route dari folder routes
const index = require("./routes/index");
const auth = require("./routes/auth");
const fatRoutes = require("./routes/fatRoutes");
const caloriesRoutes = require("./routes/caloriesRoutes");
const whrRoutes = require("./routes/whrRoutes");
const waterRoutes = require("./routes/waterRoutes");

// Gunakan route sesuai path
app.use("/auth", auth);
app.use("/", index);
app.use("/fat", fatRoutes);
app.use("/calories", caloriesRoutes);
app.use("/whr", whrRoutes);
app.use("/water", waterRoutes);

// Middleware JWT untuk proteksi route profile
app.use("/auth/profile", jwtMiddleware);

// Koneksi ke MongoDB dan jalankan server
mongoose.connect('mongodb://localhost:27017/kalkulatorKesehatan')
    .then(() => {
        console.log('Terhubung ke MongoDB');
        app.listen(3000, () => console.log("Server berjalan di port 3000"));
    })
    .catch((err) => console.error('Gagal koneksi ke MongoDB:', err));

// Middleware untuk menangani error yang tidak tertangani
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).send("Internal Server Error");
});

// Event untuk menangani uncaught exception
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Event untuk menangani unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
