import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import authRoutes from "./routes/authRoutes.js";
import Alert from "./models/Alert.js";
import { asyncRoute } from "./routes/authRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") }); // Load Twilio credentials
dotenv.config({ path: path.join(__dirname, ".env"), override: true }); // Load MONGODB_URI

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

// Twilio credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER; // your Twilio number

let client;
try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
  } else {
    console.warn("Twilio credentials missing.");
  }
} catch (error) {
  console.error("Failed to initialize Twilio:", error.message);
}

app.post("/api/send-sos", async (req, res) => {
  try {
    const { name, location = "Unknown", contacts = [], userId } = req.body;
    if (typeof name !== "string" || !name.trim() || !Array.isArray(contacts) || contacts.some((contact) => typeof contact !== "string")) {
      return res.status(400).json({ success: false, message: "A name and valid contacts list are required" });
    }

    // Using a predefined template to bypass Twilio India Trial restrictions
    const messageBody = `sms_appointment_reminders`;

    if (!client) {
      console.warn("Simulating SOS success because Twilio client is not initialized");
      const alert = await Alert.create({ name: name.trim(), location, contacts, status: "simulated", user: userId || null });
      return res.json({ success: true, alertId: alert._id, status: alert.status, results: [] });
    }

    // Send message and voice call to all emergency contacts
    const results = [];
    for (const contact of contacts) {
      console.log("Sending SOS to contact:", contact);
      try {
        const msg = await client.messages.create({
          body: messageBody,
          from: twilioPhone,
          to: contact,
        });
        results.push({ type: 'sms', sid: msg.sid, status: msg.status });
      } catch (err) {
        console.error(`SMS to ${contact} failed:`, err.message);
      }

      try {
        const call = await client.calls.create({
          url: 'http://twimlets.com/echo?Twiml=%3CResponse%3E%3CSay%3Ehelp%20she%20is%20in%20dangerous%20now%3C%2FSay%3E%3C%2FResponse%3E',
          from: twilioPhone,
          to: contact,
        });
        results.push({ type: 'call', sid: call.sid, status: call.status });
      } catch (err) {
        console.error(`Call to ${contact} failed:`, err.message);
      }
    }

    const alert = await Alert.create({ name: name.trim(), location, contacts, status: "sent", user: userId || null, providerMessageIds: results.map(({ sid }) => sid) });
    res.json({ success: true, alertId: alert._id, status: alert.status, results });
  } catch (err) {
    console.error("SOS request failed:", err.message);
    res.status(500).json({ success: false, message: "Unable to process SOS request" });
  }
});

app.get("/api/alerts", asyncRoute(async (req, res) => {
  const { userId } = req.query;
  const alerts = await Alert.find(userId ? { user: userId } : {}).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, alerts });
}));

app.use((error, req, res, next) => {
  if (error?.code === 11000) return res.status(409).json({ success: false, message: "An account with that email or mobile already exists" });
  if (error?.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
  console.error("API error:", error?.message || "Unknown error");
  return res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(() => process.exit(1));
