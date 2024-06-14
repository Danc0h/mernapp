import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  isAuth,
  isAdmin,
  generateToken,
  generateOTP,
  sendOTP,
} from "../utils.js";

const userRouter = express.Router();

userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.course = req.body.course || user.course;
      user.school = req.body.school || user.school;
      user.department = req.body.department || user.department;
      user.startDate = req.body.startDate || user.startDate;
      user.endDate = req.body.endDate || user.endDate;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

userRouter.post(
  "/send-otp",
  expressAsyncHandler(async (req, res) => {
    const {
      name,
      email,
      course,
      school,
      department,
      password,
      startDate,
      endDate,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = bcrypt.hashSync(otp, 10);

    // Send OTP to user's email
    await sendOTP(email, otp);

    res.send({
      name,
      email,
      course,
      school,
      department,
      startDate,
      endDate,
      password: bcrypt.hashSync(password, 8),
      hashedOTP,
    });
  })
);

// Endpoint to verify OTP and create user
userRouter.post(
  "/verify-otp",
  expressAsyncHandler(async (req, res) => {
    const {
      name,
      email,
      course,
      school,
      department,
      startDate,
      endDate,
      password,
      otp,
      hashedOTP,
    } = req.body;

    const isOTPValid = bcrypt.compareSync(otp, hashedOTP);
    if (!isOTPValid) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    // Create the user only after successful OTP verification
    const newUser = new User({
      name,
      email,
      course,
      school,
      department,
      startDate,
      endDate,
      password,
      isVerified: true,
    });

    const createdUser = await newUser.save();

    res.send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      course: createdUser.course,
      school: createdUser.school,
      department: createdUser.department,
      startDate: createdUser.startDate,
      endDate: createdUser.endDate,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),
    });
  })
);

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === "admin@example.com") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      await user.deleteOne();
      res.send({ message: "User Deleted" });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.get(
  "/department/:department",
  expressAsyncHandler(async (req, res) => {
    const { department } = req.params;
    const users = await User.find({ department });
    res.send(users);
  })
);

export default userRouter;
