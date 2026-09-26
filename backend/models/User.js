import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, trim: true, unique: true },
    aadhar: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    parentName: { type: String, required: true, trim: true },
    parentMobile: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    policeStation: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
