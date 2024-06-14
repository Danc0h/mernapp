import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, required: true },
    school: { type: String, required: true },
    department: { type: String, default: "Department", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
