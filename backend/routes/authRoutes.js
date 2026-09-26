import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Register User
router.post("/signup", async (req, res) => {
  try {
    const { name, mobile, aadhar, email, password, parentName, parentMobile, address, policeStation } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      mobile,
      aadhar,
      email,
      password, // In a real app, hash this password with bcrypt
      parentName,
      parentMobile,
      address,
      policeStation,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (user && user.password === password) { // In a real app, compare hashed password
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
