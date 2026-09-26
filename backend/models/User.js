import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    aadhar: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    parentName: { type: String },
    parentMobile: { type: String },
    address: { type: String },
    policeStation: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
