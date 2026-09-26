import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import connectDB from "./backend/db.js";
import authRoutes from "./backend/routes/authRoutes.js";

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);

// Twilio credentials from .env
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE; // your Twilio number

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
    const { name, location, contacts } = req.body;

    // Example message
    const messageBody = `🚨 SOS Alert! ${name} may be in danger.
Location: ${location || "Unknown"}
Please contact immediately!`;

    if (!client) {
      return res.status(500).json({ success: false, error: "Twilio client not initialized" });
    }

    // Send message to all emergency contacts
    const results = await Promise.all(
      contacts.map((contact) =>
        client.messages.create({
          body: messageBody,
          from: twilioPhone,
          to: contact,
        })
      )
    );

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
