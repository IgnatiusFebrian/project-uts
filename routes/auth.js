const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserData = require("../models/UserData");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { signToken, jwtMiddleware } = require("../utils/jwt");

// Login page
router.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('pages/login');
});

// Login dengan JWT token response
router.post("/login", async (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            // Generate JWT token
            const token = signToken({ id: user._id, username: user.username });
            return res.json({ message: "Login successful", token });
        });
    })(req, res, next);
});

// Register page
router.get('/register', (req, res) => {
    res.render('pages/register');
});

// Register new user
router.post('/register', async (req, res) => {
    const { username, password, name, gender, birthDate, email } = req.body;

    if (!username || !password || !name || !gender || !birthDate) {
        req.flash('error', 'Mohon isi semua data');
        return res.status(400).render('pages/register', { error: 'Mohon isi semua data' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).render('pages/register', { error: 'Username sudah ada, harap ganti username' });
        }

        const newUser = new User({
            username,
            email,
            password,
            name,
            gender,
            birthDate: new Date(birthDate)
        });
        await newUser.save();

        await UserData.create({
            userId: newUser._id,
            name,
            gender,
            birthDate: new Date(birthDate),
            createdAt: new Date()
        });

        // Generate JWT token untuk new user
        const token = signToken({ id: newUser._id, username: newUser.username });

        // Return JSON response with token and message
        return res.status(201).json({ message: 'Registrasi berhasil. Silakan login', token });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: 'Registrasi gagal. Silakan coba lagi.' });
    }
});

// Logout route
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(function(err) {
            if (err) {
                console.error("Session destruction error:", err);
            }
            res.clearCookie('connect.sid');
            return res.json({ message: "Logout berhasil" });
        });
    });
});

module.exports = router;
