import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, trim: true, maxlength: 500, default: "Unknown" },
  contacts: { type: [String], default: [] },
  status: { type: String, enum: ["sent", "simulated", "failed"], required: true },
  providerMessageIds: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Alert || mongoose.model("Alert", alertSchema);
