import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Alert from "../models/Alert.js";

const scrypt = promisify(scryptCallback);
const router = express.Router();
const publicUser = (user, includePrivate = false) => ({
  _id: user._id,
  name: user.name,
  mobile: user.mobile,
  email: user.email,
  ...(includePrivate ? {
    aadhar: user.aadhar,
    parentName: user.parentName,
    parentMobile: user.parentMobile,
    address: user.address,
    policeStation: user.policeStation,
  } : {}),
});

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${(await scrypt(password, salt, 64)).toString("hex")}`;
};
const verifyPassword = async (password, stored) => {
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.post("/signup", asyncRoute(async (req, res) => {
  const fields = ["name", "mobile", "aadhar", "email", "password", "parentName", "parentMobile", "address", "policeStation"];
  if (fields.some((field) => typeof req.body[field] !== "string" || !req.body[field].trim())) {
    return res.status(400).json({ success: false, message: "All signup fields are required" });
  }
  if (req.body.password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  const email = req.body.email.trim().toLowerCase();
  const mobile = req.body.mobile.trim();
  if (await User.exists({ $or: [{ email }, { mobile }] })) {
    return res.status(409).json({ success: false, message: "An account with that email or mobile already exists" });
  }
  const user = await User.create({ ...req.body, email, mobile, password: await hashPassword(req.body.password) });
  return res.status(201).json({ success: true, user: publicUser(user) });
}));

router.post("/login", asyncRoute(async (req, res) => {
  const { emailOrMobile, password } = req.body;
  if (typeof emailOrMobile !== "string" || typeof password !== "string") {
    return res.status(400).json({ success: false, message: "Email/mobile and password are required" });
  }
  const identity = emailOrMobile.trim();
  const user = await User.findOne({ $or: [{ email: identity.toLowerCase() }, { mobile: identity }] });
  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  return res.json({ success: true, user: publicUser(user) });
}));

router.get("/:id", asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id" });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const alerts = await Alert.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean();
  return res.json({ success: true, user: publicUser(user, true), alerts });
}));

router.patch("/:id", asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id" });
  const fields = ["name", "mobile", "aadhar", "email", "parentName", "parentMobile", "address", "policeStation"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "No profile fields provided" });
  if (updates.email) updates.email = updates.email.trim().toLowerCase();
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, user: publicUser(user, true) });
}));

export { asyncRoute };
export default router;
